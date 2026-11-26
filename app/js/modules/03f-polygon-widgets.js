        function sxBindOctadWidget() {
            sxBindPolygonRadarWidget({
                canvasId: "markOctadCanvas",
                sliderId: "markOctadIntensity",
                recSliderId: "markOctadRecIntensity",
                advColId: "markOctadAdvCol",
                recColId: "markOctadRecCol",
                clearBtnId: "markOctadClear",
                intensityOutId: "markOctadIntensityOut",
                recIntensityOutId: "markOctadRecIntensityOut",
                state: sxOctadState,
                poleCount: 8,
                getVerticesFn: sxGetOctadVertices,
                drawFn: sxDrawOctadWidget,
                applyFn: sxApplyOctadRatings,
                clearFn: sxClearOctadRatings
            });
        }

        window.sxOpenHotListWidgetPopup = function(topicId, profileId, root) {
            const dlg = root || e.byId("hotListWidgetDialog");
            if (!dlg || !topicId) return;
            // A Hot List row passes its own inline host. The second call
            // only redraws, so a rating change does not rebind the canvas.
            if (root && root.__sxRedraw) return void root.__sxRedraw();
            const pick = (id, sel) => root ? (dlg.matches && dlg.matches(sel) ? dlg : dlg.querySelector(sel)) : e.byId(id);
            // Hot List freeze fix (2026-11-15): pId may be the empty-template id
            // on a fresh boot. The first write mints a real profile, so every
            // handler re-resolves the id before reading/writing - otherwise
            // reads keep hitting the empty template and the readout never moves.
            // An explicitly passed real profile id is preserved as-is.
            let pId = profileId || sxActiveProfileId();
            const freshPid = () => (profileId && profileId !== Et) ? profileId : sxActiveProfileId();
            const shape = sxWidgetConfig(topicId, pId);
            const item = sxNodeRegistry[topicId] || sxNodeById(topicId) || (at[pId] || {})[topicId] || {};
            const titleEl = pick("hotListWidgetTitle", ".outline-inline-title");
            const badgeEl = pick("hotListWidgetBadge", ".outline-inline-badge");
            const descEl = pick("hotListWidgetDesc", ".outline-inline-desc");
            const canvas = pick("hotListWidgetCanvas", ".outline-inline-canvas");
            const slider = pick("hotListWidgetIntensity", ".outline-inline-slider");
            const sliderOut = pick("hotListWidgetIntensityOut", ".outline-inline-out");
            const recSlider = pick("hotListWidgetRecIntensity", ".outline-inline-rec-slider");
            const recOut = pick("hotListWidgetRecIntensityOut", ".outline-inline-rec-out");
            const readoutEl = pick("hotListWidgetReadout", ".outline-inline-readout");
            const clearBtn = pick("hotListWidgetClear", ".outline-inline-clear");
            const closeBtn = pick("closeHotListWidgetBtn", ".outline-inline-close");
            const doneBtn = pick("doneHotListWidgetBtn", ".outline-inline-done");
            if (!canvas) return;
            if (root) canvas.__sxInline = true;

            const label = item.label || item.name || topicId;
            titleEl && (titleEl.textContent = label);
            descEl && (descEl.textContent = sxPlacardAboutText(item));

            const isOctad = Boolean(shape.octad || (shape.keys && shape.keys.length === 8));
            const isHeptad = Boolean(shape.heptad || (shape.keys && shape.keys.length === 7));
            const isHexad = Boolean(shape.hexad || (shape.keys && shape.keys.length === 6));
            const isPentad = Boolean(shape.pentad || (shape.keys && shape.keys.length === 5));
            const isCompass = shape.widget === "quad-compass";
            const isTetrad = !isCompass && Boolean(shape.tetrad || (shape.keys && shape.keys.length === 4));
            const isTriad = Boolean(shape.triangle || (shape.keys && shape.keys.length === 3));
            const is2Pole = !isOctad && !isHeptad && !isHexad && !isPentad && !isTetrad && !isTriad;
            // Pair topics carry their appetite per flank on the cross
            // slider (one puck per flank, arm = appetite), so the
            // single generic intensity slider stays off here: one
            // number cannot hold two flanks, and the wheel must not
            // rescale the leanings.
            const isSwitch = is2Pole && !isCompass && !shape.single;
            if (slider) slider.disabled = isSwitch;

            badgeEl && (badgeEl.textContent = isCompass ? "Political Compass" : isOctad ? "8-Pole Octad" : isHeptad ? "7-Pole Heptad" : isHexad ? "6-Pole Hexad" : isPentad ? "5-Pole Pentad" : isTetrad ? "4-Pole Tetrad" : isTriad ? "3-Pole Triad" : (shape.single ? "Monopole" : "Cross Slider"));

            const keys = shape.keys || [];
            if (readoutEl) {
                readoutEl.innerHTML = "";
                readoutEl.style.display = "none";
                readoutEl.hidden = true;
            }
            const valSpans = [];
            keys.forEach((k, idx) => {
                const statBox = document.createElement("div");
                statBox.className = "mark-tri-stat";
                const pName = shape.labels[idx] || k;
                const pCol = isOctad ? SX_OCTAD_COLORS[idx] : isHeptad ? SX_HEPTAD_COLORS[idx] : isHexad ? SX_HEXAD_COLORS[idx] : isPentad ? SX_PENTAD_COLORS[idx] : isCompass ? SX_COMPASS_COLORS[idx] : isTetrad ? ["#22c55e", "#eab308", "#ef4444", "#3b82f6"][idx] : isTriad ? ["#ef4444", "#22c55e", "#3b82f6"][idx] : ["#22c55e", "#3b82f6"][idx];
                statBox.innerHTML = `<span style="color:${pCol}">${pName}</span>: <b style="color:${pCol}">0</b>`;
                // Seam A: the pole name span carries the pole's hovertip line.
                sxSetPoleTip(statBox.querySelector("span"), topicId, k);
                readoutEl && readoutEl.append(statBox);
                valSpans.push(statBox.querySelector("b"));
            });

            const syncReadouts = () => {
                const curRec = sxDecodeTopicStance(topicId, pId);
                keys.forEach((k, idx) => {
                    const isK = curRec[k + "Known"];
                    const v = isK ? Math.round(curRec[k]) : "—";
                    if (valSpans[idx]) valSpans[idx].textContent = String(v);
                });
            };

            // Placement-shaped topics (2026-11-22): where the engine
            // carries dual placements -- stance skins, and n-pole topics
            // on the classic skin -- the popup edits the PRIMARY
            // placement (advocacy on stance skins, give on the classic
            // skin) through the placement persister, so its writes are
            // what the parser reads back. Flat topics keep the flat
            // setter paths below.
            const dualRec = () => {
                if (!sxDualPlacements(topicId)) return null;
                const r = sxDecodeTopicStance(topicId, freshPid());
                return (r.advocacyKnown || r.givePlacementKnown) ? r : null;
            };
            const persistPrimary = (valsArr, intensity) => {
                const obj = {};
                keys.forEach((k, idx) => { obj[k] = Math.round(valsArr[idx]); });
                sxPersistAdvocacyReceptivity(topicId, "advocacy", obj, intensity, freshPid());
            };
            let widgetMode = (root && root.__sxWidgetMode) || "advocacy";
            const setWidgetMode = (mode) => {
                widgetMode = mode === "receptivity" ? "receptivity" : "advocacy";
                if (root) root.__sxWidgetMode = widgetMode;
                const advWrap = slider && slider.closest(".outline-inline-intensity, .hot-list-intensity-row");
                const recWrap = recSlider && recSlider.closest(".outline-inline-rec, .hot-list-rec-box");
                const recHidden = !recWrap || recWrap.hidden;
                if (advWrap) advWrap.classList.toggle("is-active", recHidden || widgetMode === "advocacy");
                if (recWrap) recWrap.classList.toggle("is-active", !recHidden && widgetMode === "receptivity");
            };
            const persistMode = (mode, valsArr, intensity) => {
                const obj = {};
                keys.forEach((k, idx) => { obj[k] = Math.round(valsArr[idx]); });
                sxPersistAdvocacyReceptivity(topicId, mode, obj, intensity, freshPid());
            };
            // Cross slider for pair topics (2026-11-24): two compact
            // lines, one puck per flank, appetite on the arm. Created
            // once per popup open (the dialog host is cleared first so
            // a re-open does not stack instances); the inline host
            // never sees a pair topic, so it is created on demand.
            var crossPair = null, crossHost = null;
            const ensureCrossPair = () => {
                if (crossPair) return crossPair;
                var host = pick("hotListCrossSliderHost", ".hot-list-cross-host");
                if (!host && canvas) {
                    host = document.createElement("div");
                    host.className = "hot-list-cross-host";
                    canvas.parentNode.insertBefore(host, canvas.nextSibling);
                }
                if (!host) return null;
                crossHost = host;
                host.innerHTML = "";
                // The flank keys for this topic: give/receive on the
                // classic skin, advocacy/receptivity on stance skins.
                var stance = sxDualPlacements(topicId);
                var fl = stance ? ["advocacy", "receptivity"] : ["give", "receive"];
                var getFlank = (dir) => {
                    var rec = sxDecodeTopicStance(topicId, freshPid());
                    return sxCrossFlankState(rec, dir, keys);
                };
                var writeFlank = (dir, value) => {
                    sxCrossWriteFlank(topicId, dir, value, freshPid(), keys);
                    redraw();
                    paintRow();
                };
                crossPair = {
                    first: sxCreateCrossSlider({ dir: fl[0], compact: true, get: () => getFlank(fl[0]), onChange: v => writeFlank(fl[0], v), onRelease: () => finishGesture() }),
                    second: sxCreateCrossSlider({ dir: fl[1], compact: true, get: () => getFlank(fl[1]), onChange: v => writeFlank(fl[1], v), onRelease: () => finishGesture() })
                };
                host.appendChild(crossPair.first.root);
                host.appendChild(crossPair.second.root);
                return crossPair;
            };
            const redraw = () => {
                pId = freshPid();
                sxSeedProfileIntensities(pId);
                const curRec = sxDecodeTopicStance(topicId, pId);
                const vals = keys.map(k => (curRec[k + "Known"] ? curRec[k] : 0));
                if (canvas.__sxInline) {
                    const map = {};
                    keys.forEach((k) => { if (curRec[k + "Known"]) map[k] = String(Math.round(curRec[k])); });
                    canvas.__sxPoleValMap = map;
                }
                const maxVal = sxSignedIntensity(vals);
                // The slider reads the stored +1. A rating that has never
                // stored one is seeded from the old derivation so the
                // number on the slider does not jump.
                const family = isCompass ? "compass" : isTriad ? "triad" : "radar";
                const derived = isSwitch ? 0 : sxDerivedFromVals(vals, family);
                const sliderVal = !isSwitch && curRec.intensityKnown ? Math.round(Number(curRec.intensity) || 0) : derived;
                if (!isSwitch) {
                    // The derived intensity can exceed the slider's static
                    // ±100 range (triad sums reach ±300, compass sums ±400):
                    // widen the range to cover it before assigning, or the
                    // element silently clamps and misreads the stored blend
                    // (Adam readback defect, finisher 2026-11-19).
                    if (slider) {
                        const lim = Math.max(100, Math.abs(Math.round(sliderVal)));
                        slider.min = String(-lim);
                        slider.max = String(lim);
                        slider.value = String(Math.round(sliderVal));
                    }
                    sliderOut && (sliderOut.textContent = String(Math.round(sliderVal)));
                }
                const showRec = typeof sxDualPlacements === "function" && sxDualPlacements(topicId) && !isSwitch;
                const recWrap = recSlider && recSlider.closest(".outline-inline-rec, .hot-list-rec-box");
                if (recWrap) recWrap.hidden = !showRec;
                if (recSlider) recSlider.disabled = !showRec;
                if (slider && slider.parentElement) {
                    const lab = slider.parentElement.querySelector(":scope > span");
                    if (lab) lab.textContent = showRec ? "● Adv" : "Intensity";
                }
                if (showRec && recSlider) {
                    const recInt = curRec.receptivityIntensityKnown ? Math.round(Number(curRec.receptivityIntensity) || 0) : 0;
                    const limR = Math.max(100, Math.abs(recInt));
                    recSlider.min = String(-limR);
                    recSlider.max = String(limR);
                    recSlider.value = String(recInt);
                    if (typeof sxIntensityRGB === "function") recSlider.style.setProperty("--rec-color", sxIntensityRGB(56, 189, 248, recInt));
                    if (recOut) recOut.textContent = (curRec.receptivityKnown || curRec.receptivityIntensityKnown) ? String(recInt) : "—";
                }
                setWidgetMode(widgetMode);
                syncReadouts();

                // Pair topics show the cross slider (compact), not the
                // 2D plane: two lines, one puck per flank, appetite on
                // the arm. The canvas stays hidden while it is up.
                if (isSwitch) {
                    var pair = ensureCrossPair();
                    if (canvas) canvas.style.display = "none";
                    if (pair) {
                        if (crossHost) crossHost.hidden = false;
                        var stance = sxDualPlacements(topicId);
                        pair.first.setLabel((shape.labels && shape.labels[0]) || (stance ? "Advocacy" : "Give"));
                        pair.second.setLabel((shape.labels && shape.labels[1]) || (stance ? "Receptivity" : "Receive"));
                        pair.first.render();
                        pair.second.render();
                    }
                    return;
                }
                if (canvas) canvas.style.display = "";
                if (crossHost) crossHost.hidden = true;

                if (isCompass) {
                    const pt = sxCompassPointFromValues(vals[0], vals[1], vals[2], vals[3]);
                    pt.intensity = sliderVal;
                    pt.topicId = topicId;
                    if (curRec.receptivityKnown && curRec.receptivity) {
                        const rp = sxCompassPointFromValues(Number(curRec.receptivity[keys[0]]) || 0, Number(curRec.receptivity[keys[1]]) || 0, Number(curRec.receptivity[keys[2]]) || 0, Number(curRec.receptivity[keys[3]]) || 0);
                        pt.recU = rp.u; pt.recV = rp.v; pt.recRated = !0;
                        pt.recIntensity = curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0;
                    }
                    sxDrawCompassWidget(canvas, shape, pt);
                } else if (isOctad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], p6: vals[6], p7: vals[7], intensity: sliderVal, topicId: topicId, mode: widgetMode, recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawOctadWidget(canvas, shape, radarState);
                } else if (isHeptad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], p6: vals[6], intensity: sliderVal, topicId: topicId, mode: widgetMode, recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawHeptadWidget(canvas, shape, radarState);
                } else if (isHexad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], intensity: sliderVal, topicId: topicId, mode: widgetMode, recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawHexadWidget(canvas, shape, radarState);
                } else if (isPentad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], intensity: sliderVal, topicId: topicId, mode: widgetMode, recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawPentadWidget(canvas, shape, radarState);
                } else if (isTetrad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], intensity: sliderVal, topicId: topicId, mode: widgetMode, recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawTetradWidget(canvas, shape, radarState);
                } else if (isTriad) {
                    // 2026-11-18 (puck-drag smoothness): the weights must
                    // sum to 1 - the draw places the puck at w0*V0 +
                    // w1*V1 + w2*V2, so the old raw vals/100 (summing to
                    // intensity/100, e.g. 0.7) dragged the puck toward the
                    // canvas origin, and let it jump whenever the
                    // intensity changed mid-drag. Normalised by absolute
                    // value, mirroring the placard's derivation.
                    const sumAbs = Math.abs(vals[0]) + Math.abs(vals[1]) + Math.abs(vals[2]);
                    const nw = sumAbs > 0 ? [Math.abs(vals[0]) / sumAbs, Math.abs(vals[1]) / sumAbs, Math.abs(vals[2]) / sumAbs] : [1 / 3, 1 / 3, 1 / 3];
                    const recVals = keys.map(k => (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0);
                    const recSum = Math.abs(recVals[0]) + Math.abs(recVals[1]) + Math.abs(recVals[2]);
                    const rnw = recSum > 0 ? [Math.abs(recVals[0]) / recSum, Math.abs(recVals[1]) / recSum, Math.abs(recVals[2]) / recSum] : [1 / 3, 1 / 3, 1 / 3];
                    sxDrawTriangleWidget(canvas, shape, {
                        x: 0, y: 0, w0: nw[0], w1: nw[1], w2: nw[2], intensity: sliderVal,
                        topicId: topicId, mode: widgetMode,
                        recW0: rnw[0], recW1: rnw[1], recW2: rnw[2],
                        recRated: Boolean(curRec.receptivityKnown),
                        recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0
                    });
                } else {
                    sxDrawSwitchboxWidget(canvas, shape, {
                        give: curRec.giveKnown ? curRec.give : 0,
                        receive: curRec.receiveKnown ? curRec.receive : 0
                    });
                }
            };

            redraw();

            // The inline row sits on top of the map. Repainting the map
            // on every click (Mr) is what made the widget feel late: the
            // list already covers the map, and closing the list paints it.
            // Ss would also draw this same canvas a second time.
            const paintRow = () => {
                if (root) return;
                const row = Ro && Ro.querySelector(`.outline-row[data-outline-id="${CSS.escape(topicId)}"]`);
                row && sxSyncOutlineRow(row);
            };
            const finishGesture = () => {
                if (root) {
                    try { sxRefreshHotListStatus(); } catch (err) {}
                    return;
                }
                sxRequestMapPaint();
                paintRow();
            };

            let activeIdx = null, isDragging = false;

            // Hot List popup meter line + pole tips (2026-11-16): the
            // same T9 line and hover seams as the placard. The meter
            // line lives in the widget stage (above the canvas); the
            // hover topic is refreshed on every open because the canvas
            // is persistent while the bind is once-only (dataset guard).
            sxSetMeterLine(pick("hotListWidgetStage", ".outline-inline-widget"), topicId);
            canvas.__sxHoverTopicId = topicId;
            sxBindPoleHover(canvas, () => isDragging);
            const onPointer = (evt) => {
                pId = freshPid();
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);

                if (isOctad || isHeptad || isHexad || isPentad || isTetrad) {
                    const getVerts = isOctad ? sxGetOctadVertices : isHeptad ? sxGetHeptadVertices : isHexad ? sxGetHexadVertices : isPentad ? sxGetPentadVertices : sxGetTetradVertices;
                    const { cx, cy, r, vertices } = getVerts(canvas.width, canvas.height);
                    const curRec = sxDecodeTopicStance(topicId, pId);
                    const curVals = keys.map(k => (curRec[k + "Known"] ? curRec[k] : 0));
                    const isAllZero = curVals.every(v => !v);

                    if (activeIdx === null) {
                        activeIdx = sxFindClosestAxis(px, py, cx, cy, vertices, isAllZero ? null : curVals, 22);
                    }
                    const v = vertices[activeIdx];
                    const angle = v.angle;
                    const dot = (px - cx) * Math.cos(angle) + (py - cy) * Math.sin(angle);
                    const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));

                    if (sxDualPlacements(topicId)) {
                        const mode = widgetMode === "receptivity" ? "receptivity" : "advocacy";
                        const src = mode === "receptivity" ? keys.map(k => (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0) : curVals;
                        const newVals = src.slice();
                        const blank = src.every(v => !v);
                        if (blank && val > 0) {
                            const base = Math.max(20, Math.round(val * 0.5));
                            keys.forEach((k, idx) => { newVals[idx] = (idx === activeIdx) ? val : base; });
                        } else newVals[activeIdx] = val;
                        const inten = mode === "receptivity" ? (curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 70) : (curRec.intensityKnown ? curRec.intensity : sxDerivedFromVals(newVals, "radar"));
                        persistMode(mode, newVals, inten);
                    } else if (isAllZero && val > 0) {
                        const base = Math.max(20, Math.round(val * 0.5));
                        sxStorePolygon(topicId, keys.map((k, idx) => (idx === activeIdx) ? val : base), !1, pId);
                    } else {
                        sxStoreFlankRating(topicId, keys[activeIdx], val, !1, pId);
                    }
                    redraw();
                    paintRow();
                } else if (isCompass) {
                    const sq = sxGetCompassSquare(canvas.width, canvas.height);
                    const { u, v } = sxCompassPointToUV(px, py, sq);
                    const vals = sxCompassValuesFromPoint(u, v, 100);
                    if (sxDualPlacements(topicId)) {
                        const mode = widgetMode === "receptivity" ? "receptivity" : "advocacy";
                        const curC = sxDecodeTopicStance(topicId, pId);
                        const inten = mode === "receptivity" ? (curC.receptivityIntensityKnown ? curC.receptivityIntensity : 70) : (curC.intensityKnown ? curC.intensity : sxDerivedFromVals(vals, "compass"));
                        persistMode(mode, vals, inten);
                    } else sxStorePolygon(topicId, vals, !1, pId);
                    redraw();
                    paintRow();
                } else if (isTriad) {
                    const { V0, V1, V2 } = sxGetTriVertices(canvas.width, canvas.height);
                    const { w0, w1, w2 } = sxPointToBarycentric(px, py, V0, V1, V2);
                    const triVals = [Math.round(w0 * 100), Math.round(w1 * 100), Math.round(w2 * 100)];
                    if (sxDualPlacements(topicId)) {
                        const mode = widgetMode === "receptivity" ? "receptivity" : "advocacy";
                        const curT = sxDecodeTopicStance(topicId, pId);
                        const inten = mode === "receptivity" ? (curT.receptivityIntensityKnown ? curT.receptivityIntensity : 70) : (curT.intensityKnown ? curT.intensity : sxDerivedFromVals(triVals, "triad"));
                        persistMode(mode, triVals, inten);
                    } else {
                        sxStorePolygon(topicId, triVals, !1, pId);
                    }
                    redraw();
                    paintRow();
                }
            };

            const onDown = (evt) => {
                const hit = sxHitPoleLabel(canvas, evt);
                if (hit && evt.pointerType !== "mouse") {
                    const line = sxPoleLine(canvas.__sxHoverTopicId || Qr, hit.key);
                    if (line) {
                        window.__SX_TIP_SHOW(canvas, hit.name || hit.text, line, evt.clientX, evt.clientY);
                        return;
                    }
                }
                if (isTriad && sxDualPlacements(topicId) && canvas.__sxPucks) {
                    const rect = canvas.getBoundingClientRect();
                    const clientX = evt.clientX !== undefined ? evt.clientX : 0;
                    const clientY = evt.clientY !== undefined ? evt.clientY : 0;
                    const px = (clientX - rect.left) * (canvas.width / rect.width);
                    const py = (clientY - rect.top) * (canvas.height / rect.height);
                    const pucks = canvas.__sxPucks;
                    const dAdv = pucks.adv ? Math.hypot(px - pucks.adv.x, py - pucks.adv.y) : Infinity;
                    const dRec = pucks.rec ? Math.hypot(px - pucks.rec.x, py - pucks.rec.y) : Infinity;
                    if ((dAdv <= 22 || dRec <= 22) && dRec < dAdv) setWidgetMode("receptivity");
                    else if (dAdv <= 22) setWidgetMode("advocacy");
                }
                isDragging = true;
                activeIdx = null;
                try { canvas.setPointerCapture(evt.pointerId); } catch(e) {}
                onPointer(evt);
            };
            const onMove = (evt) => { if (isDragging) onPointer(evt); };
            const onUp = (evt) => {
                if (isDragging) {
                    isDragging = false;
                    activeIdx = null;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch(e) {}
                    finishGesture();
                }
            };

            canvas.onpointerdown = onDown;
            canvas.onpointermove = onMove;
            canvas.onpointerup = onUp;
            canvas.onpointercancel = onUp;

            // Wheel sets intensity. On the Hot List the listener is the
            // whole widget, so the vertical slider and the canvas share
            // it, and the list does not scroll underneath. The popup
            // keeps the listener on its canvas and still repaints the
            // map; the Hot List does not, because the list covers it.
            const onWheel = (evt) => {
                pId = freshPid();
                evt.preventDefault();
                evt.stopPropagation();
                if (isSwitch) return;
                if (recSlider && (evt.target === recSlider || recSlider.contains(evt.target))) setWidgetMode("receptivity");
                else if (slider && (evt.target === slider || slider.contains(evt.target))) setWidgetMode("advocacy");
                // Wheel tracks 10x (owner order, 2026-11-25): one notch
                // moves the value ten times as far as before.
                const step = (evt.shiftKey ? 50 : 10) * (evt.deltaY < 0 ? 1 : -1);
                const curRec = sxDecodeTopicStance(topicId, pId);
                const vals = keys.map(k => (curRec[k + "Known"] ? curRec[k] : 0));
                const family = isCompass ? "compass" : isTriad ? "triad" : "radar";
                const cur = curRec.intensityKnown ? Number(curRec.intensity) || 0 : sxDerivedFromVals(vals, family);
                if (sxDualPlacements(topicId)) {
                    const mode = widgetMode === "receptivity" ? "receptivity" : "advocacy";
                    const src = mode === "receptivity" ? keys.map(k => (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0) : vals;
                    const base = mode === "receptivity" ? (curRec.receptivityIntensityKnown ? Number(curRec.receptivityIntensity) || 0 : 0) : cur;
                    persistMode(mode, src, base + step);
                } else sxPersistIntensity(topicId, cur + step, pId);
                redraw();
                if (root) {
                    clearTimeout(root.__sxWheelWs);
                    root.__sxWheelWs = setTimeout(() => { try { sxRefreshHotListStatus(); } catch (err) {} }, 200);
                } else {
                    sxRequestMapPaint();
                    paintRow();
                }
            };
            if (root) root.onwheel = onWheel;
            else canvas.onwheel = onWheel;

            if (slider) {
                slider.oninput = () => {
                    pId = freshPid();
                    if (isSwitch) return;
                    // The slider edits only the stored +1. Pole numbers stay.
                    setWidgetMode("advocacy");
                    if (sxDualPlacements(topicId)) {
                        const curRecS = sxDecodeTopicStance(topicId, pId);
                        persistMode("advocacy", keys.map(k => (curRecS[k + "Known"] ? curRecS[k] : 0)), Number(slider.value));
                    } else sxPersistIntensity(topicId, Number(slider.value), pId);
                    redraw();
                    paintRow();
                };
                slider.onchange = () => {
                    finishGesture();
                };
            }

            if (recSlider) {
                recSlider.oninput = () => {
                    pId = freshPid();
                    if (isSwitch || !sxDualPlacements(topicId)) return;
                    setWidgetMode("receptivity");
                    const curRecR = sxDecodeTopicStance(topicId, pId);
                    const vals = keys.map(k => (curRecR.receptivity && null != curRecR.receptivity[k]) ? Number(curRecR.receptivity[k]) : 0);
                    persistMode("receptivity", vals, Number(recSlider.value));
                    redraw();
                    paintRow();
                };
                recSlider.onchange = () => { finishGesture(); };
            }

            if (clearBtn) {
                clearBtn.onclick = () => {
                    if (sxDualPlacements(topicId) && !isSwitch) {
                        sxClearAdvocacyReceptivity(topicId, "advocacy", pId);
                        sxClearAdvocacyReceptivity(topicId, "receptivity", pId);
                        redraw();
                        if (root) finishGesture();
                        else paintRow();
                        return;
                    }
                    sxClearTopicRating(topicId, "intensity", !1, pId);
                    // Pair topics: clearing must also drop the stored
                    // per-flank appetites, or a re-rate would inherit a
                    // stale appetite from the cleared rating.
                    if (isSwitch) {
                        sxClearTopicRating(topicId, "giveIntensity", !1, pId);
                        sxClearTopicRating(topicId, "receiveIntensity", !1, pId);
                    }
                    keys.forEach((k, idx) => sxClearTopicRating(topicId, k, !root && idx === keys.length - 1, pId));
                    redraw();
                    if (root) finishGesture();
                    else paintRow();
                };
            }

            if (root) {
                root.__sxRedraw = redraw;
                return;
            }
            const closeDialog = () => {
                try { dlg.close(); } catch (e) { dlg.hidden = true; }
                sxRequestMapPaint();
            };
            closeBtn && (closeBtn.onclick = closeDialog);
            doneBtn && (doneBtn.onclick = closeDialog);

            try {
                if (typeof dlg.showModal === "function") dlg.showModal();
                else dlg.hidden = false;
            } catch (err) {
                dlg.hidden = false;
            }
        };

        function sxBindTriangleWidget() {
            const canvas = e.byId("markTriangleCanvas");
            const advSlider = e.byId("markTriangleIntensity");
            const advOut = e.byId("markTriangleIntensityOut");
            const advCol = e.byId("markTriAdvCol");
            const recSlider = e.byId("markTriangleRecIntensity");
            const recOut = e.byId("markTriangleRecIntensityOut");
            const recCol = e.byId("markTriangleRecCol");
            const clearBtn = e.byId("markTriangleClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxTriState.isDragging);

            const setMode = (newMode) => {
                sxTriState.mode = newMode;
                if (advCol) advCol.classList.toggle("is-active", newMode === "advocacy");
                if (recCol) recCol.classList.toggle("is-active", newMode === "receptivity");
                if (Qr) {
                    const shape = sxWidgetConfig(Qr);
                    sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
                }
            };

            const updatePointFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);
                const { V0, V1, V2 } = sxGetTriVertices(canvas.width, canvas.height);
                const { w0, w1, w2 } = sxPointToBarycentric(px, py, V0, V1, V2);
                const isClassic = !sxDualPlacements(sxTriState.topicId);
                const mode = isClassic ? "advocacy" : (sxTriState.mode || "advocacy");

                if (mode === "receptivity") {
                    sxTriState.recW0 = w0;
                    sxTriState.recW1 = w1;
                    sxTriState.recW2 = w2;
                    if (!sxTriState.recRated) {
                        sxTriState.recRated = true;
                        if (!sxTriState.recIntensity) {
                            sxTriState.recIntensity = 70;
                            if (recSlider) recSlider.value = "70";
                            if (recOut) recOut.textContent = "70";
                        }
                    }
                    if (recSlider) recSlider.style.setProperty("--rec-color", sxIntensityRGB(56, 189, 248, sxTriState.recIntensity));
                } else {
                    sxTriState.w0 = w0;
                    sxTriState.w1 = w1;
                    sxTriState.w2 = w2;
                    if (!sxTriState.intensity) {
                        sxTriState.intensity = 70;
                        if (advSlider) advSlider.value = "70";
                        if (advOut) advOut.textContent = "70";
                    }
                    if (advSlider) advSlider.style.setProperty("--adv-color", sxIntensityRGB(255, 255, 255, sxTriState.intensity));
                }

                if (Qr) {
                    const shape = sxWidgetConfig(Qr);
                    sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
                    const v0El = e.byId("markTriVal0"), v1El = e.byId("markTriVal1"), v2El = e.byId("markTriVal2");
                    const activeIntensity = (mode === "receptivity") ? sxTriState.recIntensity : sxTriState.intensity;
                    const curW0 = (mode === "receptivity") ? sxTriState.recW0 : sxTriState.w0;
                    const curW1 = (mode === "receptivity") ? sxTriState.recW1 : sxTriState.w1;
                    const curW2 = (mode === "receptivity") ? sxTriState.recW2 : sxTriState.w2;
                    if (v0El) v0El.textContent = String(Math.round(curW0 * activeIntensity));
                    if (v1El) v1El.textContent = String(Math.round(curW1 * activeIntensity));
                    if (v2El) v2El.textContent = String(Math.round(curW2 * activeIntensity));
                    if (!sxTriState.__sxApplyRaf) {
                        sxTriState.__sxApplyRaf = requestAnimationFrame(() => {
                            sxTriState.__sxApplyRaf = 0;
                            if (Qr) sxApplyTriRatings(Qr, true);
                        });
                    }
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                const isClassic = !sxDualPlacements(sxTriState.topicId);
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
                sxTriState.isDragging = !0;
                canvas.setPointerCapture(evt.pointerId);
                updatePointFromPointer(evt);
            });
            canvas.addEventListener("pointermove", (evt) => {
                if (!sxTriState.isDragging) return;
                updatePointFromPointer(evt);
            });
            const stopDrag = (evt) => {
                if (sxTriState.isDragging) {
                    sxTriState.isDragging = !1;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (ignore) {}
                    if (sxTriState.__sxApplyRaf) { cancelAnimationFrame(sxTriState.__sxApplyRaf); sxTriState.__sxApplyRaf = 0; }
                    if (Qr) sxApplyTriRatings(Qr);
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            // Mouse wheel strictly scoped to puck hover
            canvas.addEventListener("wheel", (evt) => {
                const isClassic = !sxDualPlacements(sxTriState.topicId);
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
                    if (!sxTriState.recRated) {
                        sxTriState.recRated = true;
                        sxTriState.recIntensity = 70;
                    }
                    const current = typeof sxTriState.recIntensity === "number" ? sxTriState.recIntensity : 0;
                    sxTriState.recIntensity = Math.max(-400, Math.min(400, Math.round(current + step)));
                    if (recSlider) {
                        recSlider.value = String(Math.round(sxTriState.recIntensity));
                        recSlider.style.setProperty("--rec-color", sxIntensityRGB(56, 189, 248, sxTriState.recIntensity));
                    }
                    if (recOut) recOut.textContent = String(Math.round(sxTriState.recIntensity));
                    setMode("receptivity");
                    if (Qr) sxApplyTriRatings(Qr, true);
                } else {
                    const current = typeof sxTriState.intensity === "number" ? sxTriState.intensity : 0;
                    sxTriState.intensity = Math.max(-400, Math.min(400, Math.round(current + step)));
                    if (advSlider) {
                        advSlider.value = String(Math.round(sxTriState.intensity));
                        advSlider.style.setProperty("--adv-color", sxIntensityRGB(255, 255, 255, sxTriState.intensity));
                    }
                    if (advOut) advOut.textContent = String(Math.round(sxTriState.intensity));
                    setMode("advocacy");
                    if (Qr) sxApplyTriRatings(Qr, true);
                }
                if (Qr) {
                    const shape = sxWidgetConfig(Qr);
                    sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
                }
            }, { passive: false });

            if (advSlider) {
                advSlider.addEventListener("pointerdown", () => setMode("advocacy"));
                advSlider.addEventListener("focus", () => setMode("advocacy"));
                advSlider.addEventListener("input", () => {
                    setMode("advocacy");
                    sxTriState.intensity = Math.max(-400, Math.min(400, Math.round(Number(advSlider.value) || 0)));
                    if (advOut) advOut.textContent = String(Math.round(sxTriState.intensity));
                    advSlider.style.setProperty("--adv-color", sxIntensityRGB(255, 255, 255, sxTriState.intensity));
                    if (Qr) {
                        sxPersistIntensity(Qr, sxTriState.intensity);
                        const shape = sxWidgetConfig(Qr);
                        sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
                        sxApplyTriRatings(Qr, true);
                    }
                });
            }

            if (recSlider) {
                recSlider.addEventListener("pointerdown", () => setMode("receptivity"));
                recSlider.addEventListener("focus", () => setMode("receptivity"));
                recSlider.addEventListener("input", () => {
                    setMode("receptivity");
                    if (!sxTriState.recRated) sxTriState.recRated = true;
                    sxTriState.recIntensity = Math.max(-400, Math.min(400, Math.round(Number(recSlider.value) || 0)));
                    if (recOut) recOut.textContent = String(Math.round(sxTriState.recIntensity));
                    recSlider.style.setProperty("--rec-color", sxIntensityRGB(56, 189, 248, sxTriState.recIntensity));
                    if (Qr) {
                        const shape = sxWidgetConfig(Qr);
                        sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
                        sxApplyTriRatings(Qr, true);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        sxClearTriRatings(Qr);
                    }
                });
            }
        }
