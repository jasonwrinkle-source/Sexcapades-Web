        var sxTriState = {
            topicId: null,
            mode: "advocacy",
            w0: 1 / 3,
            w1: 1 / 3,
            w2: 1 / 3,
            intensity: 0,
            recW0: 1 / 3,
            recW1: 1 / 3,
            recW2: 1 / 3,
            recIntensity: 0,
            recRated: !1,
            isDragging: !1,
            dragTarget: null
        };

        function sxDrawTriangleWidget(canvas, shape, weights, intensity) {
            if (typeof intensity !== "number" && weights && typeof weights.intensity === "number") intensity = weights.intensity;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const { V0, V1, V2 } = sxGetTriVertices(width, height);
            const det = (V1.y - V2.y) * (V0.x - V2.x) + (V2.x - V1.x) * (V0.y - V2.y);

            // 1. Barycentric RGB color gradient fill
            const minX = Math.floor(Math.min(V0.x, V1.x, V2.x));
            const maxX = Math.ceil(Math.max(V0.x, V1.x, V2.x));
            const minY = Math.floor(Math.min(V0.y, V1.y, V2.y));
            const maxY = Math.ceil(Math.max(V0.y, V1.y, V2.y));
            const bw = maxX - minX, bh = maxY - minY;

            // 1. Barycentric RGB color gradient fill - cached per canvas
            // (2026-11-18, puck-drag smoothness): the gradient depends
            // only on canvas size + intensity brightness, never on the
            // puck position, so rebuilding it pixel-by-pixel on every
            // pointermove was the drag jank. Rebuild only when the key
            // (size x rounded intensity) changes; otherwise reuse.
            const sxIntSigned = typeof intensity === "number" ? intensity : 0;
            const absInt = Math.abs(sxIntSigned);
            const gradKey = width + "x" + height + "x" + Math.round(sxIntSigned);
            let grad = canvas.__sxTriGradient;
            if ((!grad || grad.key !== gradKey) && bw > 0 && bh > 0 && Math.abs(det) > 1e-5) {
                const offCanvas = document.createElement("canvas");
                offCanvas.width = bw;
                offCanvas.height = bh;
                const offCtx = offCanvas.getContext("2d");
                const imgData = offCtx.createImageData(bw, bh);
                const data = imgData.data;

                // Intensity scales gradient brightness. Full at ±100.
                // Negative intensity paints each pole's complement.
                const br = 0.28 + 0.72 * Math.min(1, absInt / 100);
                const sxNeg = (typeof intensity === "number" ? intensity : 0) < 0;
                const sxPoleRGB = [[240, 35, 45], [25, 225, 70], [35, 70, 245]].map(c => sxNeg ? c.map(ch => 255 - ch) : c);

                for (let y = minY; y < maxY; y++) {
                    for (let x = minX; x < maxX; x++) {
                        const w0 = ((V1.y - V2.y) * (x - V2.x) + (V2.x - V1.x) * (y - V2.y)) / det;
                        const w1 = ((V2.y - V0.y) * (x - V2.x) + (V0.x - V2.x) * (y - V2.y)) / det;
                        const w2 = 1 - w0 - w1;
                        if (w0 >= -0.01 && w1 >= -0.01 && w2 >= -0.01) {
                            const cw0 = Math.max(0, w0), cw1 = Math.max(0, w1), cw2 = Math.max(0, w2);
                            const sum = cw0 + cw1 + cw2;
                            const nw0 = sum > 0 ? cw0 / sum : 1/3;
                            const nw1 = sum > 0 ? cw1 / sum : 1/3;
                            const nw2 = sum > 0 ? cw2 / sum : 1/3;
                            // Pole 0 = Red, pole 1 = Green, pole 2 = Blue.
                            // Negative intensity has already swapped each
                            // pole to its complement.
                            const r = (nw0 * sxPoleRGB[0][0] + nw1 * sxPoleRGB[1][0] + nw2 * sxPoleRGB[2][0]) * br;
                            const g = (nw0 * sxPoleRGB[0][1] + nw1 * sxPoleRGB[1][1] + nw2 * sxPoleRGB[2][1]) * br;
                            const b = (nw0 * sxPoleRGB[0][2] + nw1 * sxPoleRGB[1][2] + nw2 * sxPoleRGB[2][2]) * br;
                            const idx = ((y - minY) * bw + (x - minX)) * 4;
                            data[idx] = Math.round(r);
                            data[idx + 1] = Math.round(g);
                            data[idx + 2] = Math.round(b);
                            data[idx + 3] = 230; // 90% opacity
                        }
                    }
                }
                offCtx.putImageData(imgData, 0, 0);
                grad = canvas.__sxTriGradient = { key: gradKey, img: offCanvas, minX: minX, minY: minY };
            }

            if (grad && grad.img) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(V0.x, V0.y);
                ctx.lineTo(V1.x, V1.y);
                ctx.lineTo(V2.x, V2.y);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(grad.img, grad.minX, grad.minY);
                ctx.restore();
            }

            // 2. Triangle Frame & grid lines
            ctx.beginPath();
            ctx.moveTo(V0.x, V0.y);
            ctx.lineTo(V1.x, V1.y);
            ctx.lineTo(V2.x, V2.y);
            ctx.closePath();
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
            ctx.stroke();

            // Centroid grid lines
            const cx = (V0.x + V1.x + V2.x) / 3;
            const cy = (V0.y + V1.y + V2.y) / 3;
            ctx.beginPath();
            ctx.moveTo(V0.x, V0.y); ctx.lineTo(cx, cy);
            ctx.moveTo(V1.x, V1.y); ctx.lineTo(cx, cy);
            ctx.moveTo(V2.x, V2.y); ctx.lineTo(cx, cy);
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Colored Pole Dots (Red, Green, Blue)
            // Pole 0: Red
            ctx.beginPath();
            ctx.arc(V0.x, V0.y, 4.5, 0, 2 * Math.PI);
            ctx.fillStyle = "#ef4444";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // Pole 1: Green (Middle position)
            ctx.beginPath();
            ctx.arc(V1.x, V1.y, 4.5, 0, 2 * Math.PI);
            ctx.fillStyle = "#22c55e";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // Pole 2: Blue
            ctx.beginPath();
            ctx.arc(V2.x, V2.y, 4.5, 0, 2 * Math.PI);
            ctx.fillStyle = "#3b82f6";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 4. Pole labels (matching RGB colors) - horizontal and
            // EXTERIOR to the triangle (2026-11-18): the old shared
            // tangent rotation ran the long bottom labels diagonally
            // along the edges, cramped against the fill. Green sits in
            // one wrapped block above the top vertex; red and blue sit
            // in wrapped blocks below their base vertices, each clamped
            // to its own half of the canvas so they never overlap.
            canvas.__sxLabelRects = [];
            const labels = sxPoleLabels(shape, 3);
            const triCols = ["#ef4444", "#22c55e", "#3b82f6"];
            const triKeys = shape && shape.keys;
            sxDrawTriPoleLabel(ctx, canvas, V1.x, V1.y, labels[1], triCols[1], triKeys && triKeys[1], width - 24, true);
            const triHalfW = width / 2 - 14;
            sxDrawTriPoleLabel(ctx, canvas, V0.x, V0.y, labels[0], triCols[0], triKeys && triKeys[0], triHalfW, false);
            sxDrawTriPoleLabel(ctx, canvas, V2.x, V2.y, labels[2], triCols[2], triKeys && triKeys[2], triHalfW, false);

            // 5. Active point puck position(s): Advocacy (● disc) & Receptivity (○ ring)
            const isClassic = !sxDualPlacements(weights && weights.topicId ? weights.topicId : null);
            const w0 = weights.w0, w1 = weights.w1, w2 = weights.w2;
            const pxAdv = w0 * V0.x + w1 * V1.x + w2 * V2.x;
            const pyAdv = w0 * V0.y + w1 * V1.y + w2 * V2.y;
            const advInt = typeof intensity === "number" ? intensity : (weights.intensity || 0);

            if (isClassic) {
                ctx.beginPath();
                ctx.arc(pxAdv, pyAdv, 11, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(pxAdv, pyAdv, 6, 0, 2 * Math.PI);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = "#0f172a";
                ctx.stroke();
                canvas.__sxPucks = { adv: { x: pxAdv, y: pyAdv }, rec: null };
                return;
            }

            const activeMode = weights.mode || "advocacy";
            const recRated = Boolean(weights.recRated);
            const rw0 = weights.recW0 != null ? weights.recW0 : 1 / 3;
            const rw1 = weights.recW1 != null ? weights.recW1 : 1 / 3;
            const rw2 = weights.recW2 != null ? weights.recW2 : 1 / 3;
            const pxRec = recRated ? (rw0 * V0.x + rw1 * V1.x + rw2 * V2.x) : cx;
            const pyRec = recRated ? (rw0 * V0.y + rw1 * V1.y + rw2 * V2.y) : cy;
            const recInt = Number(weights.recIntensity) || 0;

            canvas.__sxPucks = {
                adv: { x: pxAdv, y: pyAdv },
                rec: { x: pxRec, y: pyRec, rated: recRated }
            };

            const colAdv = sxIntensityRGB(255, 255, 255, advInt);
            const colRec = sxIntensityRGB(56, 189, 248, recInt);

            const drawDisc = (isActive) => {
                ctx.save();
                ctx.globalAlpha = isActive ? 1.0 : 0.45;
                if (isActive) {
                    ctx.beginPath();
                    ctx.arc(pxAdv, pyAdv, 11, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(pxAdv, pyAdv, 6, 0, 2 * Math.PI);
                ctx.fillStyle = colAdv;
                ctx.fill();
                ctx.lineWidth = 1.6;
                ctx.strokeStyle = "#0f172a";
                ctx.stroke();
                ctx.restore();
            };

            const drawRing = (isActive) => {
                ctx.save();
                if (!recRated) {
                    ctx.setLineDash([3, 3]);
                    ctx.lineWidth = 1.6;
                    ctx.strokeStyle = isActive ? "rgba(56, 189, 248, 0.85)" : "rgba(255, 255, 255, 0.35)";
                    ctx.beginPath();
                    ctx.arc(cx, cy, 10.5, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.setLineDash([]);
                } else {
                    ctx.globalAlpha = isActive ? 1.0 : 0.45;
                    if (isActive) {
                        ctx.beginPath();
                        ctx.arc(pxRec, pyRec, 15, 0, 2 * Math.PI);
                        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.arc(pxRec, pyRec, 10.5, 0, 2 * Math.PI);
                    ctx.lineWidth = 3.2;
                    ctx.strokeStyle = colRec;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(pxRec, pyRec, 12.2, 0, 2 * Math.PI);
                    ctx.lineWidth = 0.8;
                    ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
                    ctx.stroke();
                }
                ctx.restore();
            };

            if (activeMode === "receptivity") {
                drawDisc(false);
                drawRing(true);
            } else {
                drawRing(false);
                drawDisc(true);
            }
        }

        function sxApplyTriRatings(topicId, skipSync) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 3) return;
            const isClassic = !sxDualPlacements(topicId);
            if (isClassic) {
                const { w0, w1, w2, intensity } = sxTriState;
                const v0 = Math.round(w0 * 100);
                const v1 = Math.round(w1 * 100);
                const v2 = Math.round(w2 * 100);
                sxPersistIntensity(topicId, intensity);
                To(topicId, shape.keys[0], v0, !1);
                To(topicId, shape.keys[1], v1, !1);
                To(topicId, shape.keys[2], v2, !0);
            } else {
                const mode = sxTriState.mode || "advocacy";
                if (mode === "receptivity") {
                    const vals = {
                        [shape.keys[0]]: Math.round(sxTriState.recW0 * 100),
                        [shape.keys[1]]: Math.round(sxTriState.recW1 * 100),
                        [shape.keys[2]]: Math.round(sxTriState.recW2 * 100)
                    };
                    sxPersistAdvocacyReceptivity(topicId, "receptivity", vals, sxTriState.recIntensity);
                } else {
                    const vals = {
                        [shape.keys[0]]: Math.round(sxTriState.w0 * 100),
                        [shape.keys[1]]: Math.round(sxTriState.w1 * 100),
                        [shape.keys[2]]: Math.round(sxTriState.w2 * 100)
                    };
                    sxPersistAdvocacyReceptivity(topicId, "advocacy", vals, sxTriState.intensity);
                }
            }
            if (!skipSync) sxSyncMarkRatings(topicId);
        }

        function sxClearTriRatings(topicId) {
            if (!topicId) return;
            const isClassic = !sxDualPlacements(topicId);
            if (isClassic) {
                const shape = Ge(topicId);
                if (!shape || !shape.keys || shape.keys.length < 3) return;
                Fo(topicId, "intensity", !1);
                Fo(topicId, shape.keys[0], !1);
                Fo(topicId, shape.keys[1], !1);
                Fo(topicId, shape.keys[2], !0);
            } else {
                const mode = sxTriState.mode || "advocacy";
                sxClearAdvocacyReceptivity(topicId, mode);
            }
            sxSyncMarkRatings(topicId);
        }

        // --- 4-Pole Tetrad Radar / Diamond Deformation State & Widget ---
        var sxTetradState = {
            topicId: null,
            mode: "advocacy",
            intensity: 0,
            recIntensity: 0,
            recRated: !1,
            p0: 0,
            p1: 0,
            p2: 0,
            p3: 0,
            recP0: 0,
            recP1: 0,
            recP2: 0,
            recP3: 0,
            // Shape = pole values as ratios to the max (max = 1). Saved
            // whenever the values are non-zero, so the intensity slider can
            // restore the same shape after being taken to 0 (where the
            // values themselves are all 0 and the shape would be lost).
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_TETRAD_COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"];

        function sxGetTetradVertices(width, height) {
            const poly = sxGetRegularPolygonVertices(width, height, 4);
            return {
                cx: poly.cx, cy: poly.cy, r: poly.r,
                P0: poly.vertices[0],
                P1: poly.vertices[1],
                P2: poly.vertices[2],
                P3: poly.vertices[3],
                vertices: poly.vertices
            };
        }

        function sxDrawTetradWidget(canvas, shape, state) {
            sxDrawRadarPolygonWidget(canvas, shape, state, 4, sxGetTetradVertices, SX_TETRAD_COLORS);
        }

        function sxApplyTetradRatings(topicId, skipSync) {
            sxApplyPolygonRatings(topicId, sxTetradState, 4, skipSync);
        }

        function sxClearTetradRatings(topicId) {
            sxClearPolygonRatings(topicId, 4);
        }

        // --- 4-Pole Political Compass (quad-compass) State & Widget ---
        // A square with two axes: horizontal = economic (left/right),
        // vertical = authority (authoritarian top / libertarian bottom).
        // One draggable point. Pole order is the JSON's, clockwise from
        // top-left: keys[0] = top-left, keys[1] = top-right,
        // keys[2] = bottom-right, keys[3] = bottom-left.
        // Storage: the four values are bilinear weights x intensity, so
        // they sum to the intensity (0..100) and the point is recoverable
        // from them: u = (v1 + v2) / I, v = (v2 + v3) / I, I = sum.
        var sxCompassState = {
            topicId: null,
            mode: "advocacy",
            u: 0.5, v: 0.5, intensity: 0,
            recU: 0.5, recV: 0.5, recIntensity: 0, recRated: !1,
            isDragging: !1
        };

        // Corner colors in JSON pole order (top-left, top-right,
        // bottom-right, bottom-left) - same four colors as the tetrad.
        const SX_COMPASS_COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"];

        function sxCompassShortLabel(label) {
            // "Authoritarian Left (State Socialism)" -> "Auth Left".
            // The canvas corners are too narrow for the full labels;
            // the full labels stay in the readout rows below the canvas.
            const s = String(label || "");
            const cut = s.indexOf(" (");
            const base = cut >= 0 ? s.slice(0, cut) : s;
            return base.replace("Authoritarian", "Auth").replace("Libertarian", "Lib");
        }

        function sxGetCompassSquare(width, height) {
            // Square with room for the corner labels outside it.
            const s = Math.max(40, Math.min(width - 110, height - 80));
            const cx = width / 2, cy = height / 2;
            return { cx, cy, s, x0: cx - s / 2, y0: cy - s / 2, x1: cx + s / 2, y1: cy + s / 2 };
        }

        function sxCompassPointToUV(px, py, sq) {
            const u = Math.max(0, Math.min(1, (px - sq.x0) / sq.s));
            const v = Math.max(0, Math.min(1, (py - sq.y0) / sq.s));
            return { u, v };
        }

        function sxCompassValuesFromPoint(u, v, intensity) {
            const I = Math.max(-100, Math.min(100, intensity));
            const vals = [
                Math.round((1 - u) * (1 - v) * I),
                Math.round(u * (1 - v) * I),
                Math.round(u * v * I),
                Math.round((1 - u) * v * I)
            ];
            // Per-key rounding can leave the sum off by 1-2; fold the
            // residual into the largest value so the four values sum to
            // the intensity exactly (the storage shape's invariant).
            const residual = Math.round(I) - (vals[0] + vals[1] + vals[2] + vals[3]);
            if (residual !== 0) {
                let maxIdx = 0;
                for (let k = 1; k < 4; k++) if (Math.abs(vals[k]) > Math.abs(vals[maxIdx])) maxIdx = k;
                vals[maxIdx] = Math.max(-100, Math.min(100, vals[maxIdx] + residual));
            }
            return vals;
        }

        function sxCompassPointFromValues(r0, r1, r2, r3) {
            const vals = [r0, r1, r2, r3].map(n => Math.max(-100, Math.min(100, Number(n) || 0)));
            const I = Math.max(-100, Math.min(100, vals[0] + vals[1] + vals[2] + vals[3]));
            if (I === 0) return { u: 0.5, v: 0.5, intensity: 0 };
            return {
                u: Math.max(0, Math.min(1, (vals[1] + vals[2]) / I)),
                v: Math.max(0, Math.min(1, (vals[2] + vals[3]) / I)),
                intensity: I
            };
        }

        function sxDrawCompassWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const sq = sxGetCompassSquare(width, height);
            const { cx, cy, s, x0, y0, x1, y1 } = sq;

            // 1. Tinted quadrant backgrounds. Brightness follows the stored
            // intensity; a negative intensity uses each quadrant's complement.
            const sxBr = 0.28 + 0.72 * Math.min(1, Math.abs(Number(state && state.intensity) || 0) / 100);
            const sxNeg = (Number(state && state.intensity) || 0) < 0;
            const sxQuad = sxNeg
                ? [[221, 58, 161], [21, 76, 247], [16, 187, 187], [196, 125, 209]]
                : [[34, 197, 94], [234, 179, 8], [239, 68, 68], [59, 130, 246]];
            const tints = sxQuad.map(c => "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (0.10 * sxBr).toFixed(3) + ")");
            ctx.fillStyle = tints[0]; ctx.fillRect(x0, y0, s / 2, s / 2);
            ctx.fillStyle = tints[1]; ctx.fillRect(cx, y0, s / 2, s / 2);
            ctx.fillStyle = tints[2]; ctx.fillRect(cx, cy, s / 2, s / 2);
            ctx.fillStyle = tints[3]; ctx.fillRect(x0, cy, s / 2, s / 2);

            // 2. Gridlines at 25/50/75% + square frame
            [0.25, 0.5, 0.75].forEach(frac => {
                ctx.beginPath();
                ctx.moveTo(x0 + s * frac, y0); ctx.lineTo(x0 + s * frac, y1);
                ctx.moveTo(x0, y0 + s * frac); ctx.lineTo(x1, y0 + s * frac);
                ctx.lineWidth = 0.8;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                ctx.stroke();
            });
            ctx.beginPath();
            ctx.rect(x0, y0, s, s);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
            ctx.stroke();

            // 3. Crosshair axes (dashed)
            ctx.beginPath();
            ctx.moveTo(cx, y0); ctx.lineTo(cx, y1);
            ctx.moveTo(x0, cy); ctx.lineTo(x1, cy);
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.stroke();
            ctx.setLineDash([]);

            // 4. Axis captions
            const axes = (shape && shape.axes) || null;
            ctx.font = "9px system-ui, sans-serif";
            if (axes && axes[0]) {
                ctx.textAlign = "center"; ctx.textBaseline = "bottom";
                ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                ctx.fillText(axes[0], cx, y1 - 4);
            }
            if (axes && axes[1]) {
                ctx.save();
                ctx.translate(x0 + 10, cy);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = "center"; ctx.textBaseline = "bottom";
                ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                ctx.fillText(axes[1], 0, -4);
                ctx.restore();
            }

            // 5. Corner labels
            canvas.__sxLabelRects = [];
            const labels = sxPoleLabels(shape, 4);
            const short = labels.map(l => sxCompassShortLabel(l));
            const corners = [
                { x: x0, y: y0 },
                { x: x1, y: y0 },
                { x: x1, y: y1 },
                { x: x0, y: y1 }
            ];
            corners.forEach((corner, idx) => {
                sxDrawPoleLabel(ctx, canvas, corner.x, corner.y, Math.atan2(corner.y - cy, corner.x - cx), short[idx], SX_COMPASS_COLORS[idx], shape && shape.keys && shape.keys[idx], labels[idx], 4, Math.hypot(x0 - cx, y0 - cy));
            });

            // 6. Active point puck position(s): Advocacy (● disc) & Receptivity (○ ring)
            const isClassic = !sxDualPlacements(state && state.topicId ? state.topicId : null);
            const u = (state && typeof state.u === "number") ? state.u : 0.5;
            const v = (state && typeof state.v === "number") ? state.v : 0.5;
            const pxAdv = x0 + u * s, pyAdv = y0 + v * s;
            const advInt = Number(state && state.intensity) || 0;

            if (isClassic) {
                ctx.beginPath();
                ctx.arc(pxAdv, pyAdv, 11, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(pxAdv, pyAdv, 6, 0, 2 * Math.PI);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = "#0f172a";
                ctx.stroke();
                canvas.__sxPucks = { adv: { x: pxAdv, y: pyAdv }, rec: null };
                return;
            }

            const activeMode = (state && state.mode) || "advocacy";
            const recRated = Boolean(state && state.recRated);
            const recU = (state && typeof state.recU === "number") ? state.recU : 0.5;
            const recV = (state && typeof state.recV === "number") ? state.recV : 0.5;
            const pxRec = recRated ? (x0 + recU * s) : cx;
            const pyRec = recRated ? (y0 + recV * s) : cy;
            const recInt = Number(state && state.recIntensity) || 0;

            canvas.__sxPucks = {
                adv: { x: pxAdv, y: pyAdv },
                rec: { x: pxRec, y: pyRec, rated: recRated }
            };

            const colAdv = sxIntensityRGB(255, 255, 255, advInt);
            const colRec = sxIntensityRGB(56, 189, 248, recInt);

            const drawDisc = (isActive) => {
                ctx.save();
                ctx.globalAlpha = isActive ? 1.0 : 0.45;
                if (isActive) {
                    ctx.beginPath();
                    ctx.arc(pxAdv, pyAdv, 11, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(pxAdv, pyAdv, 6, 0, 2 * Math.PI);
                ctx.fillStyle = colAdv;
                ctx.fill();
                ctx.lineWidth = 1.6;
                ctx.strokeStyle = "#0f172a";
                ctx.stroke();
                ctx.restore();
            };

            const drawRing = (isActive) => {
                ctx.save();
                if (!recRated) {
                    ctx.setLineDash([3, 3]);
                    ctx.lineWidth = 1.6;
                    ctx.strokeStyle = isActive ? "rgba(56, 189, 248, 0.85)" : "rgba(255, 255, 255, 0.35)";
                    ctx.beginPath();
                    ctx.arc(cx, cy, 10.5, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.setLineDash([]);
                } else {
                    ctx.globalAlpha = isActive ? 1.0 : 0.45;
                    if (isActive) {
                        ctx.beginPath();
                        ctx.arc(pxRec, pyRec, 15, 0, 2 * Math.PI);
                        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.arc(pxRec, pyRec, 10.5, 0, 2 * Math.PI);
                    ctx.lineWidth = 3.2;
                    ctx.strokeStyle = colRec;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(pxRec, pyRec, 12.2, 0, 2 * Math.PI);
                    ctx.lineWidth = 0.8;
                    ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
                    ctx.stroke();
                }
                ctx.restore();
            };

            if (activeMode === "receptivity") {
                drawDisc(false);
                drawRing(true);
            } else {
                drawRing(false);
                drawDisc(true);
            }
        }

        function sxApplyCompassRatings(topicId, skipSync) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 4) return;
            const isClassic = !sxDualPlacements(topicId);
            if (isClassic) {
                const vals = sxCompassValuesFromPoint(sxCompassState.u, sxCompassState.v, 100);
                sxPersistIntensity(topicId, sxCompassState.intensity);
                To(topicId, shape.keys[0], vals[0], !1);
                To(topicId, shape.keys[1], vals[1], !1);
                To(topicId, shape.keys[2], vals[2], !1);
                To(topicId, shape.keys[3], vals[3], !0);
            } else {
                const mode = sxCompassState.mode || "advocacy";
                if (mode === "receptivity") {
                    const vals = sxCompassValuesFromPoint(sxCompassState.recU, sxCompassState.recV, 100);
                    const obj = {};
                    shape.keys.slice(0, 4).forEach((k, idx) => { obj[k] = vals[idx]; });
                    sxPersistAdvocacyReceptivity(topicId, "receptivity", obj, sxCompassState.recIntensity);
                } else {
                    const vals = sxCompassValuesFromPoint(sxCompassState.u, sxCompassState.v, 100);
                    const obj = {};
                    shape.keys.slice(0, 4).forEach((k, idx) => { obj[k] = vals[idx]; });
                    sxPersistAdvocacyReceptivity(topicId, "advocacy", obj, sxCompassState.intensity);
                }
            }
            if (!skipSync) sxSyncMarkRatings(topicId);
        }

        function sxClearCompassRatings(topicId) {
            if (!topicId) return;
            const isClassic = !sxDualPlacements(topicId);
            if (isClassic) {
                const shape = Ge(topicId);
                if (!shape || !shape.keys || shape.keys.length < 4) return;
                Fo(topicId, "intensity", !1);
                Fo(topicId, shape.keys[0], !1);
                Fo(topicId, shape.keys[1], !1);
                Fo(topicId, shape.keys[2], !1);
                Fo(topicId, shape.keys[3], !0);
            } else {
                const mode = sxCompassState.mode || "advocacy";
                sxClearAdvocacyReceptivity(topicId, mode);
            }
            sxSyncMarkRatings(topicId);
        }

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
                    const shape = Ge(Qr);
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
                    const shape = Ge(Qr);
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
                const step = (evt.shiftKey ? 5 : 1) * (evt.deltaY < 0 ? 1 : -1);

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
                    const shape = Ge(Qr);
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
                        const shape = Ge(Qr);
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
                        const shape = Ge(Qr);
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
            let pId = profileId || Vi();
            const freshPid = () => (profileId && profileId !== Et) ? profileId : Vi();
            const shape = Ge(topicId, pId);
            const item = qn[topicId] || Xn(topicId) || (at[pId] || {})[topicId] || {};
            const titleEl = pick("hotListWidgetTitle", ".outline-inline-title");
            const badgeEl = pick("hotListWidgetBadge", ".outline-inline-badge");
            const descEl = pick("hotListWidgetDesc", ".outline-inline-desc");
            const canvas = pick("hotListWidgetCanvas", ".outline-inline-canvas");
            const slider = pick("hotListWidgetIntensity", ".outline-inline-slider");
            const sliderOut = pick("hotListWidgetIntensityOut", ".outline-inline-out");
            const readoutEl = pick("hotListWidgetReadout", ".outline-inline-readout");
            const clearBtn = pick("hotListWidgetClear", ".outline-inline-clear");
            const closeBtn = pick("closeHotListWidgetBtn", ".outline-inline-close");
            const doneBtn = pick("doneHotListWidgetBtn", ".outline-inline-done");
            if (!canvas) return;
            if (root) canvas.__sxInline = true;

            const label = item.label || item.name || topicId;
            titleEl && (titleEl.textContent = label);
            descEl && (descEl.textContent = lo(item));

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
                const curRec = ca(topicId, pId);
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
                const r = ca(topicId, freshPid());
                return (r.advocacyKnown || r.givePlacementKnown) ? r : null;
            };
            const persistPrimary = (valsArr, intensity) => {
                const obj = {};
                keys.forEach((k, idx) => { obj[k] = Math.round(valsArr[idx]); });
                sxPersistAdvocacyReceptivity(topicId, "advocacy", obj, intensity, freshPid());
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
                    var rec = ca(topicId, freshPid());
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
                const curRec = ca(topicId, pId);
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
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], p6: vals[6], p7: vals[7], intensity: sliderVal, topicId: topicId, mode: "advocacy", recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawOctadWidget(canvas, shape, radarState);
                } else if (isHeptad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], p6: vals[6], intensity: sliderVal, topicId: topicId, mode: "advocacy", recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawHeptadWidget(canvas, shape, radarState);
                } else if (isHexad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], intensity: sliderVal, topicId: topicId, mode: "advocacy", recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawHexadWidget(canvas, shape, radarState);
                } else if (isPentad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], intensity: sliderVal, topicId: topicId, mode: "advocacy", recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
                    keys.forEach((k, idx) => { radarState["recP" + idx] = (curRec.receptivity && null != curRec.receptivity[k]) ? Number(curRec.receptivity[k]) : 0; });
                    sxDrawPentadWidget(canvas, shape, radarState);
                } else if (isTetrad) {
                    const radarState = { p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], intensity: sliderVal, topicId: topicId, mode: "advocacy", recRated: Boolean(curRec.receptivityKnown), recIntensity: curRec.receptivityIntensityKnown ? curRec.receptivityIntensity : 0 };
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
                        topicId: topicId, mode: "advocacy",
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
                row && Ss(row);
            };
            const finishGesture = () => {
                if (root) {
                    try { ws(); } catch (err) {}
                    return;
                }
                Mr();
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
                    const curRec = ca(topicId, pId);
                    const curVals = keys.map(k => (curRec[k + "Known"] ? curRec[k] : 0));
                    const isAllZero = curVals.every(v => !v);

                    if (activeIdx === null) {
                        activeIdx = sxFindClosestAxis(px, py, cx, cy, vertices, isAllZero ? null : curVals, 22);
                    }
                    const v = vertices[activeIdx];
                    const angle = v.angle;
                    const dot = (px - cx) * Math.cos(angle) + (py - cy) * Math.sin(angle);
                    const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));

                    const dRec = dualRec();
                    if (dRec) {
                        const newVals = curVals.slice();
                        if (isAllZero && val > 0) {
                            const base = Math.max(20, Math.round(val * 0.5));
                            keys.forEach((k, idx) => { newVals[idx] = (idx === activeIdx) ? val : base; });
                        } else newVals[activeIdx] = val;
                        persistPrimary(newVals, dRec.intensityKnown ? dRec.intensity : sxDerivedFromVals(newVals, "radar"));
                    } else if (isAllZero && val > 0) {
                        const base = Math.max(20, Math.round(val * 0.5));
                        keys.forEach((k, idx) => {
                            To(topicId, k, (idx === activeIdx) ? val : base, !1, pId);
                        });
                    } else {
                        To(topicId, keys[activeIdx], val, !1, pId);
                    }
                    redraw();
                    paintRow();
                } else if (isCompass) {
                    const sq = sxGetCompassSquare(canvas.width, canvas.height);
                    const { u, v } = sxCompassPointToUV(px, py, sq);
                    const vals = sxCompassValuesFromPoint(u, v, 100);
                    const dRec = dualRec();
                    if (dRec) persistPrimary(vals, dRec.intensityKnown ? dRec.intensity : sxDerivedFromVals(vals, "compass"));
                    else keys.forEach((k, idx) => To(topicId, k, vals[idx], !1, pId));
                    redraw();
                    paintRow();
                } else if (isTriad) {
                    const { V0, V1, V2 } = sxGetTriVertices(canvas.width, canvas.height);
                    const { w0, w1, w2 } = sxPointToBarycentric(px, py, V0, V1, V2);
                    const dRec = dualRec();
                    if (dRec) persistPrimary([Math.round(w0 * 100), Math.round(w1 * 100), Math.round(w2 * 100)], dRec.intensityKnown ? dRec.intensity : sxDerivedFromVals([Math.round(w0 * 100), Math.round(w1 * 100), Math.round(w2 * 100)], "triad"));
                    else {
                        To(topicId, keys[0], Math.round(w0 * 100), !1, pId);
                        To(topicId, keys[1], Math.round(w1 * 100), !1, pId);
                        To(topicId, keys[2], Math.round(w2 * 100), !1, pId);
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
                const step = (evt.shiftKey ? 5 : 1) * (evt.deltaY < 0 ? 1 : -1);
                const curRec = ca(topicId, pId);
                const vals = keys.map(k => (curRec[k + "Known"] ? curRec[k] : 0));
                const family = isCompass ? "compass" : isTriad ? "triad" : "radar";
                const cur = curRec.intensityKnown ? Number(curRec.intensity) || 0 : sxDerivedFromVals(vals, family);
                if (dualRec()) persistPrimary(vals, cur + step);
                else sxPersistIntensity(topicId, cur + step, pId);
                redraw();
                if (root) {
                    clearTimeout(root.__sxWheelWs);
                    root.__sxWheelWs = setTimeout(() => { try { ws(); } catch (err) {} }, 200);
                } else {
                    Mr();
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
                    const dRecS = dualRec();
                    if (dRecS) {
                        const curRecS = ca(topicId, pId);
                        persistPrimary(keys.map(k => (curRecS[k + "Known"] ? curRecS[k] : 0)), Number(slider.value));
                    } else sxPersistIntensity(topicId, Number(slider.value), pId);
                    redraw();
                    paintRow();
                };
                slider.onchange = () => {
                    finishGesture();
                };
            }

            if (clearBtn) {
                clearBtn.onclick = () => {
                    if (dualRec()) {
                        sxClearAdvocacyReceptivity(topicId, "advocacy", pId);
                        sxClearAdvocacyReceptivity(topicId, "receptivity", pId);
                        redraw();
                        if (root) finishGesture();
                        else paintRow();
                        return;
                    }
                    Fo(topicId, "intensity", !1, pId);
                    // Pair topics: clearing must also drop the stored
                    // per-flank appetites, or a re-rate would inherit a
                    // stale appetite from the cleared rating.
                    if (isSwitch) {
                        Fo(topicId, "giveIntensity", !1, pId);
                        Fo(topicId, "receiveIntensity", !1, pId);
                    }
                    keys.forEach((k, idx) => Fo(topicId, k, !root && idx === keys.length - 1, pId));
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
                Mr();
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
                    const shape = Ge(Qr);
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
                    const shape = Ge(Qr);
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
                const step = (evt.shiftKey ? 5 : 1) * (evt.deltaY < 0 ? 1 : -1);

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
                    const shape = Ge(Qr);
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
                        const shape = Ge(Qr);
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
                        const shape = Ge(Qr);
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

