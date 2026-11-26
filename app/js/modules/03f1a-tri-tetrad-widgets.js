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
