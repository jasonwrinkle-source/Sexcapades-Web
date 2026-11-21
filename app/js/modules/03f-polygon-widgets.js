        let sxTriState = {
            topicId: null,
            w0: 1 / 3,
            w1: 1 / 3,
            w2: 1 / 3,
            intensity: 0,
            isDragging: !1
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

            // 1. Barycentric RGB color gradient fill — cached per canvas
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

            // 4. Pole labels (matching RGB colors) — horizontal and
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

            // 5. Active point puck position
            const w0 = weights.w0, w1 = weights.w1, w2 = weights.w2;
            const px = w0 * V0.x + w1 * V1.x + w2 * V2.x;
            const py = w0 * V0.y + w1 * V1.y + w2 * V2.y;

            // Halo glow for puck
            ctx.beginPath();
            ctx.arc(px, py, 11, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fill();

            // Solid puck
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = "#0f172a";
            ctx.stroke();
        }

        function sxApplyTriRatings(topicId, skipSync) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 3) return;
            const { w0, w1, w2, intensity } = sxTriState;
            // Leanings are the weights on a 0–100 scale. Intensity is stored
            // beside them and is not baked back into the pole numbers.
            const v0 = Math.round(w0 * 100);
            const v1 = Math.round(w1 * 100);
            const v2 = Math.round(w2 * 100);
            sxPersistIntensity(topicId, intensity);
            To(topicId, shape.keys[0], v0, !1);
            To(topicId, shape.keys[1], v1, !1);
            To(topicId, shape.keys[2], v2, !0);
            // During a drag the caller passes skipSync: the full placard
            // re-sync re-derives the weights from the stored INTEGER
            // ratings and redraws the triangle a second time, so the
            // puck fought the pointer in quantized jumps on every move.
            // Live drags write the ratings only; the drag-end call (no
            // skipSync) does the one full sync.
            if (!skipSync) sxSyncMarkRatings(topicId);
        }

        function sxClearTriRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 3) return;
            Fo(topicId, "intensity", !1);
            Fo(topicId, shape.keys[0], !1);
            Fo(topicId, shape.keys[1], !1);
            Fo(topicId, shape.keys[2], !0);
            sxSyncMarkRatings(topicId);
        }

        // --- 4-Pole Tetrad Radar / Diamond Deformation State & Widget ---
        let sxTetradState = {
            topicId: null,
            intensity: 0,
            p0: 0,
            p1: 0,
            p2: 0,
            p3: 0,
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

        function sxGetTetradVertices(width, height) {
            const cx = width / 2, cy = height / 2;
            const r = Math.min(width, height) / 2 - 24;
            // North (0), East (1), South (2), West (3)
            return {
                cx, cy, r,
                P0: { x: cx, y: cy - r },
                P1: { x: cx + r, y: cy },
                P2: { x: cx, y: cy + r },
                P3: { x: cx - r, y: cy },
                vertices: [
                    { x: cx, y: cy - r, angle: -Math.PI / 2 },
                    { x: cx + r, y: cy, angle: 0 },
                    { x: cx, y: cy + r, angle: Math.PI / 2 },
                    { x: cx - r, y: cy, angle: Math.PI }
                ]
            };
        }

        function sxDrawTetradWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const { cx, cy, r, P0, P1, P2, P3 } = sxGetTetradVertices(width, height);

            // 1. Concentric reference grid rings (25%, 50%, 75%, 100%)
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                ctx.moveTo(cx, cy - r * frac);
                ctx.lineTo(cx + r * frac, cy);
                ctx.lineTo(cx, cy + r * frac);
                ctx.lineTo(cx - r * frac, cy);
                ctx.closePath();
                ctx.lineWidth = frac === 1.0 ? 1.5 : 0.8;
                ctx.strokeStyle = frac === 1.0 ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.15)";
                ctx.stroke();
            });

            // 2. Crosshair axes
            ctx.beginPath();
            ctx.moveTo(P3.x, P3.y); ctx.lineTo(P1.x, P1.y);
            ctx.moveTo(P0.x, P0.y); ctx.lineTo(P2.x, P2.y);
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Deformed Polygon from active ratings
            const tetMaxAbs = Math.max(Math.abs(state.p0), Math.abs(state.p1), Math.abs(state.p2), Math.abs(state.p3));
            const s0 = tetMaxAbs > 0 ? Math.abs(state.p0) / tetMaxAbs : 0;
            const s1 = tetMaxAbs > 0 ? Math.abs(state.p1) / tetMaxAbs : 0;
            const s2 = tetMaxAbs > 0 ? Math.abs(state.p2) / tetMaxAbs : 0;
            const s3 = tetMaxAbs > 0 ? Math.abs(state.p3) / tetMaxAbs : 0;

            const V0 = { x: cx, y: cy - r * s0 };
            const V1 = { x: cx + r * s1, y: cy };
            const V2 = { x: cx, y: cy + r * s2 };
            const V3 = { x: cx - r * s3, y: cy };

            const maxVal = sxSignedIntensity([state.p0, state.p1, state.p2, state.p3]);
            const polyCol = sxIntensityRGB(61, 168, 116, state.intensity != null ? state.intensity : maxVal);

            // Filled shape
            ctx.beginPath();
            ctx.moveTo(V0.x, V0.y);
            ctx.lineTo(V1.x, V1.y);
            ctx.lineTo(V2.x, V2.y);
            ctx.lineTo(V3.x, V3.y);
            ctx.closePath();
            ctx.fillStyle = polyCol;
            ctx.globalAlpha = 0.45;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 4. Pole vertex handles
            const poles = [
                { pt: V0, col: "#22c55e", val: state.p0 }, // North (Green)
                { pt: V1, col: "#eab308", val: state.p1 }, // East (Yellow)
                { pt: V2, col: "#ef4444", val: state.p2 }, // South (Red)
                { pt: V3, col: "#3b82f6", val: state.p3 }  // West (Blue)
            ];

            poles.forEach((p, idx) => {
                ctx.beginPath();
                ctx.arc(p.pt.x, p.pt.y, 5.5, 0, 2 * Math.PI);
                ctx.fillStyle = p.col;
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            });

            // 5. Pole Labels — tangent-rotated (T5). N/S read horizontal,
            // E/W vertical, and the rotated box is clamped so the side
            // labels ("Moksha", "Artha") no longer clip (T3). (P0..P3
            // carry no angle — it is derived from the centroid.)
            canvas.__sxLabelRects = [];
            const labels = sxPoleLabels(shape, 4);
            [P0, P1, P2, P3].forEach((P, idx) => {
                sxDrawPoleLabel(ctx, canvas, P.x, P.y, Math.atan2(P.y - cy, P.x - cx), labels[idx], ["#22c55e", "#eab308", "#ef4444", "#3b82f6"][idx], shape && shape.keys && shape.keys[idx], labels[idx], 4, r);
            });
        }

        function sxApplyTetradRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 4) return;
            sxPersistIntensity(topicId, sxTetradState.intensity);
            To(topicId, shape.keys[0], Math.round(sxTetradState.p0), !1);
            To(topicId, shape.keys[1], Math.round(sxTetradState.p1), !1);
            To(topicId, shape.keys[2], Math.round(sxTetradState.p2), !1);
            To(topicId, shape.keys[3], Math.round(sxTetradState.p3), !0);
            sxSyncMarkRatings(topicId);
        }

        function sxClearTetradRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 4) return;
            Fo(topicId, "intensity", !1);
            Fo(topicId, shape.keys[0], !1);
            Fo(topicId, shape.keys[1], !1);
            Fo(topicId, shape.keys[2], !1);
            Fo(topicId, shape.keys[3], !0);
            sxSyncMarkRatings(topicId);
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
        let sxCompassState = {
            topicId: null,
            u: 0.5, v: 0.5, intensity: 0,
            isDragging: !1
        };

        // Corner colors in JSON pole order (top-left, top-right,
        // bottom-right, bottom-left) — same four colors as the tetrad.
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
            const u = (state && typeof state.u === "number") ? state.u : 0.5;
            const v = (state && typeof state.v === "number") ? state.v : 0.5;
            const px = x0 + u * s, py = y0 + v * s;

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

            // 4. Axis captions — from the topic's axes (T1). A compass
            // topic without axes draws no captions: the old hardcoded
            // "Economic"/"Authority" was live-wrong on Chemcapades.
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

            // 5. Corner labels ride the tangent of the square's
            // circumscribing circle (Jason, 2026-11-19). The short form
            // is drawn; the full label is the hover name.
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

            // 6. Draggable point puck (same pattern as the triangle widget)
            ctx.beginPath();
            ctx.arc(px, py, 11, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = "#0f172a";
            ctx.stroke();
        }

        function sxApplyCompassRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 4) return;
            // The point is the leaning, stored at a fixed 100 scale so a
            // later intensity change does not move the four pole numbers.
            const vals = sxCompassValuesFromPoint(sxCompassState.u, sxCompassState.v, 100);
            sxPersistIntensity(topicId, sxCompassState.intensity);
            To(topicId, shape.keys[0], vals[0], !1);
            To(topicId, shape.keys[1], vals[1], !1);
            To(topicId, shape.keys[2], vals[2], !1);
            To(topicId, shape.keys[3], vals[3], !0);
            sxSyncMarkRatings(topicId);
        }

        function sxClearCompassRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 4) return;
            Fo(topicId, "intensity", !1);
            Fo(topicId, shape.keys[0], !1);
            Fo(topicId, shape.keys[1], !1);
            Fo(topicId, shape.keys[2], !1);
            Fo(topicId, shape.keys[3], !0);
            sxSyncMarkRatings(topicId);
        }

        function sxBindCompassWidget() {
            const canvas = e.byId("markCompassCanvas");
            const slider = e.byId("markCompassIntensity");
            const clearBtn = e.byId("markCompassClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxCompassState.isDragging);

            const updatePointFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);
                const sq = sxGetCompassSquare(canvas.width, canvas.height);
                const { u, v } = sxCompassPointToUV(px, py, sq);
                sxCompassState.u = u;
                sxCompassState.v = v;
                if (!sxCompassState.intensity) {
                    sxCompassState.intensity = 70;
                    if (slider) slider.value = "70";
                    const out = e.byId("markCompassIntensityOut");
                    out && (out.textContent = "70");
                }
                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawCompassWidget(canvas, shape, sxCompassState);
                    sxApplyCompassRatings(Qr);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
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
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            // Mouse wheel scales the intensity (sum), point unchanged
            canvas.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                sxCompassState.intensity = Math.max(-400, Math.min(400, Math.round((Number(sxCompassState.intensity) || 0) + step)));
                if (slider) slider.value = String(Math.round(sxCompassState.intensity));
                const out = e.byId("markCompassIntensityOut");
                out && (out.textContent = String(Math.round(sxCompassState.intensity)));
                if (Qr) {
                    sxPersistIntensity(Qr, sxCompassState.intensity);
                    const shape = Ge(Qr);
                    sxDrawCompassWidget(canvas, shape, sxCompassState);
                }
            }, { passive: false });

            if (slider) {
                slider.addEventListener("input", () => {
                    sxCompassState.intensity = Math.max(-400, Math.min(400, Math.round(Number(slider.value) || 0)));
                    const out = e.byId("markCompassIntensityOut");
                    out && (out.textContent = String(Math.round(sxCompassState.intensity)));
                    if (Qr) {
                        sxPersistIntensity(Qr, sxCompassState.intensity);
                        const shape = Ge(Qr);
                        sxDrawCompassWidget(canvas, shape, sxCompassState);
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

        function sxFindClosestAxis(px, py, cx, cy, vertices, currentValues, handleRadius = 22) {
            let bestHandleIdx = null, bestHandleDist = handleRadius;
            if (currentValues && currentValues.length) {
                vertices.forEach((v, idx) => {
                    const s = Math.max(0, Math.min(100, Math.abs(currentValues[idx] || 0))) / 100;
                    const vx = cx + (v.x - cx) * s, vy = cy + (v.y - cy) * s;
                    const d = Math.hypot(px - vx, py - vy);
                    if (d < bestHandleDist) {
                        bestHandleDist = d;
                        bestHandleIdx = idx;
                    }
                });
                if (bestHandleIdx !== null) return bestHandleIdx;
            }

            const clickAngle = Math.atan2(py - cy, px - cx);
            let bestAngleIdx = 0, minAngleDiff = Infinity;
            vertices.forEach((v, idx) => {
                let diff = (clickAngle - v.angle) % (2 * Math.PI);
                if (diff < -Math.PI) diff += 2 * Math.PI;
                if (diff > Math.PI) diff -= 2 * Math.PI;
                const absDiff = Math.abs(diff);
                if (absDiff < minAngleDiff) {
                    minAngleDiff = absDiff;
                    bestAngleIdx = idx;
                }
            });
            return bestAngleIdx;
        }

        // Angle initializer helper: the vertex whose angle is closest to the
        // pointer's angle from the canvas center (circular distance). The
        // radar binders use it to re-pick the active vertex during the early
        // (uncommitted) part of an all-zero drag, so the drag direction —
        // not the grab point — decides which pole rises. Once committed
        // the locked vertex holds for the rest of the drag.
        function sxClosestVertexByAngle(px, py, cx, cy, vertices) {
            const ptrAngle = Math.atan2(py - cy, px - cx);
            let best = 0, bestD = Infinity;
            for (let i = 0; i < vertices.length; i++) {
                let d = Math.abs(vertices[i].angle - ptrAngle);
                if (d > Math.PI) d = 2 * Math.PI - d;
                if (d < bestD) { bestD = d; best = i; }
            }
            return best;
        }

        function sxBindTetradWidget() {
            const canvas = e.byId("markTetradCanvas");
            const slider = e.byId("markTetradIntensity");
            const clearBtn = e.byId("markTetradClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxTetradState.isDragging);

            const updateFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);

                const { cx, cy, r, vertices } = sxGetTetradVertices(canvas.width, canvas.height);
                const curVals = [sxTetradState.p0, sxTetradState.p1, sxTetradState.p2, sxTetradState.p3];
                const isAllZero = curVals.every(v => !v);

                if (sxTetradState.activeVertex === null) {
                    sxTetradState.activeVertex = sxFindClosestAxis(px, py, cx, cy, vertices, isAllZero ? null : curVals, 22);
                }

                // Angle initializer: this drag started from all-zero and no
                // vertex has been pulled out yet — re-pick the active vertex
                // by pointer ANGLE on every move, so the drag direction (not
                // the grab point) decides which pole rises. Once committed
                // the locked vertex holds for the rest of the drag.
                if (sxTetradState.dragFromZero && !sxTetradState.vertexLocked) {
                    sxTetradState.activeVertex = sxClosestVertexByAngle(px, py, cx, cy, vertices);
                }

                const v = sxTetradState.activeVertex;
                const angle = vertices[v].angle;
                const cosA = Math.cos(angle), sinA = Math.sin(angle);
                const dot = (px - cx) * cosA + (py - cy) * sinA;
                const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));

                if ((isAllZero || (sxTetradState.dragFromZero && !sxTetradState.vertexLocked)) && val > 0) {
                    // Direct drag from unrated/0 initializes an active polygon rather than a 1D monopole
                    const base = Math.max(20, Math.round(val * 0.5));
                    sxTetradState.p0 = (v === 0) ? val : base;
                    sxTetradState.p1 = (v === 1) ? val : base;
                    sxTetradState.p2 = (v === 2) ? val : base;
                    sxTetradState.p3 = (v === 3) ? val : base;
                    // Commit: the dragged vertex has been pulled past the base
                    // level the others sit at (base is at least 20 and at most
                    // val/2, so val > base reduces to val > 20) — lock the
                    // vertex for the rest of the drag.
                    if (val > base) sxTetradState.vertexLocked = true;
                } else {
                    if (v === 0) sxTetradState.p0 = val;
                    else if (v === 1) sxTetradState.p1 = val;
                    else if (v === 2) sxTetradState.p2 = val;
                    else if (v === 3) sxTetradState.p3 = val;
                }

                const maxVal = sxSignedIntensity([sxTetradState.p0, sxTetradState.p1, sxTetradState.p2, sxTetradState.p3]);
                if (slider) slider.value = String(Math.round(maxVal));
                const out = e.byId("markTetradIntensityOut");
                if (out) out.textContent = String(Math.round(maxVal));

                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawTetradWidget(canvas, shape, sxTetradState);
                    sxApplyTetradRatings(Qr);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                sxTetradState.isDragging = !0;
                sxTetradState.activeVertex = null;
                sxTetradState.vertexLocked = !1;
                sxTetradState.dragFromZero = !sxTetradState.p0 && !sxTetradState.p1 && !sxTetradState.p2 && !sxTetradState.p3;
                canvas.setPointerCapture(evt.pointerId);
                updateFromPointer(evt);
            });
            canvas.addEventListener("pointermove", (evt) => {
                if (!sxTetradState.isDragging) return;
                updateFromPointer(evt);
            });
            const stopDrag = (evt) => {
                if (sxTetradState.isDragging) {
                    sxTetradState.isDragging = !1;
                    sxTetradState.activeVertex = null;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (ignore) {}
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            // Wheel steps the stored intensity. The poles stay put.
            canvas.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                sxTetradState.intensity = Math.max(-400, Math.min(400, Math.round((Number(sxTetradState.intensity) || 0) + step)));
                if (slider) slider.value = String(Math.round(sxTetradState.intensity));
                const out = e.byId("markTetradIntensityOut");
                if (out) out.textContent = String(Math.round(sxTetradState.intensity));
                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawTetradWidget(canvas, shape, sxTetradState);
                    sxApplyTetradRatings(Qr);
                }
            }, { passive: false });

            if (slider) {
                slider.addEventListener("input", () => {
                    const val = Math.max(-400, Math.min(400, Math.round(Number(slider.value) || 0)));
                    sxTetradState.intensity = val;
                    const out = e.byId("markTetradIntensityOut");
                    out && (out.textContent = String(val));
                    if (Qr) {
                        const shape = Ge(Qr);
                        sxDrawTetradWidget(canvas, shape, sxTetradState);
                        sxApplyTetradRatings(Qr);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        sxClearTetradRatings(Qr);
                    }
                });
            }
        }

        // --- 5-Pole Pentad Radar / Star Deformation State & Widget ---
        let sxPentadState = {
            topicId: null,
            intensity: 0,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0,
            // Shape = pole values as ratios to the max (max = 1). Saved
            // whenever the values are non-zero, so the intensity slider can
            // restore the same shape after being taken to 0.
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_PENTAD_COLORS = ["#a855f7", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e"];

        function sxGetPentadVertices(width, height) {
            const cx = width / 2, cy = height / 2;
            const r = Math.min(width, height) / 2 - 24;
            const vertices = [];
            for (let k = 0; k < 5; k++) {
                const angle = -Math.PI / 2 + k * (2 * Math.PI / 5);
                vertices.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle });
            }
            return { cx, cy, r, vertices };
        }

        function sxDrawPentadWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const { cx, cy, r, vertices } = sxGetPentadVertices(width, height);

            // 1. Concentric reference pentagon rings (25%, 50%, 75%, 100%)
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                for (let k = 0; k < 5; k++) {
                    const angle = vertices[k].angle;
                    const x = cx + r * frac * Math.cos(angle);
                    const y = cy + r * frac * Math.sin(angle);
                    if (k === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.lineWidth = frac === 1.0 ? 1.5 : 0.8;
                ctx.strokeStyle = frac === 1.0 ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.15)";
                ctx.stroke();
            });

            // 2. Radial spoke axes from center to each vertex
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            for (let k = 0; k < 5; k++) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(vertices[k].x, vertices[k].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Deformed Polygon from active ratings
            const sxMaxAbs = Math.abs(sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4]));
            const s = [
                (sxMaxAbs > 0 ? Math.abs(state.p0) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p1) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p2) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p3) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p4) / sxMaxAbs : 0)
            ];

            const polyPts = vertices.map((v, k) => ({
                x: cx + (v.x - cx) * s[k],
                y: cy + (v.y - cy) * s[k]
            }));

            const maxVal = sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4]);
            const polyCol = sxIntensityRGB(61, 168, 116, state.intensity != null ? state.intensity : maxVal);

            // Filled shape
            ctx.beginPath();
            polyPts.forEach((pt, k) => {
                if (k === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.fillStyle = polyCol;
            ctx.globalAlpha = 0.45;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 4. Pole vertex handles
            polyPts.forEach((pt, idx) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 5.5, 0, 2 * Math.PI);
                ctx.fillStyle = SX_PENTAD_COLORS[idx];
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            });

            // 5. Pole Labels — tangent-rotated (T5).
            canvas.__sxLabelRects = [];
            const labels = sxPoleLabels(shape, 5);
            vertices.forEach((v, idx) => {
                sxDrawPoleLabel(ctx, canvas, v.x, v.y, v.angle, labels[idx], SX_PENTAD_COLORS[idx], shape && shape.keys && shape.keys[idx], labels[idx], 5, r);
            });
        }

        function sxApplyPentadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 5) return;
            sxPersistIntensity(topicId, sxPentadState.intensity);
            To(topicId, shape.keys[0], Math.round(sxPentadState.p0), !1);
            To(topicId, shape.keys[1], Math.round(sxPentadState.p1), !1);
            To(topicId, shape.keys[2], Math.round(sxPentadState.p2), !1);
            To(topicId, shape.keys[3], Math.round(sxPentadState.p3), !1);
            To(topicId, shape.keys[4], Math.round(sxPentadState.p4), !0);
            sxSyncMarkRatings(topicId);
        }

        function sxClearPentadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 5) return;
            Fo(topicId, "intensity", !1);
            Fo(topicId, shape.keys[0], !1);
            Fo(topicId, shape.keys[1], !1);
            Fo(topicId, shape.keys[2], !1);
            Fo(topicId, shape.keys[3], !1);
            Fo(topicId, shape.keys[4], !0);
            sxSyncMarkRatings(topicId);
        }

        function sxBindPentadWidget() {
            const canvas = e.byId("markPentadCanvas");
            const slider = e.byId("markPentadIntensity");
            const clearBtn = e.byId("markPentadClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxPentadState.isDragging);

            const updateFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);

                const { cx, cy, r, vertices } = sxGetPentadVertices(canvas.width, canvas.height);
                const curVals = [sxPentadState.p0, sxPentadState.p1, sxPentadState.p2, sxPentadState.p3, sxPentadState.p4];
                const isAllZero = curVals.every(v => !v);

                if (sxPentadState.activeVertex === null) {
                    sxPentadState.activeVertex = sxFindClosestAxis(px, py, cx, cy, vertices, isAllZero ? null : curVals, 22);
                }

                // Angle initializer: this drag started from all-zero and no
                // vertex has been pulled out yet — re-pick the active vertex
                // by pointer ANGLE on every move, so the drag direction (not
                // the grab point) decides which pole rises. Once committed
                // the locked vertex holds for the rest of the drag.
                if (sxPentadState.dragFromZero && !sxPentadState.vertexLocked) {
                    sxPentadState.activeVertex = sxClosestVertexByAngle(px, py, cx, cy, vertices);
                }

                const v = sxPentadState.activeVertex;
                const angle = vertices[v].angle;
                const cosA = Math.cos(angle), sinA = Math.sin(angle);
                const dot = (px - cx) * cosA + (py - cy) * sinA;
                const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));

                if ((isAllZero || (sxPentadState.dragFromZero && !sxPentadState.vertexLocked)) && val > 0) {
                    const base = Math.max(20, Math.round(val * 0.5));
                    for (let k = 0; k < 5; k++) {
                        sxPentadState[`p${k}`] = (k === v) ? val : base;
                    }
                    // Commit: the dragged vertex has been pulled past the base
                    // level the others sit at (base is at least 20 and at most
                    // val/2, so val > base reduces to val > 20) — lock the
                    // vertex for the rest of the drag.
                    if (val > base) sxPentadState.vertexLocked = true;
                } else {
                    sxPentadState[`p${v}`] = val;
                }

                const maxVal = sxSignedIntensity([sxPentadState.p0, sxPentadState.p1, sxPentadState.p2, sxPentadState.p3, sxPentadState.p4]);
                if (slider) slider.value = String(Math.round(maxVal));
                const out = e.byId("markPentadIntensityOut");
                if (out) out.textContent = String(Math.round(maxVal));

                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawPentadWidget(canvas, shape, sxPentadState);
                    sxApplyPentadRatings(Qr);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                sxPentadState.isDragging = !0;
                sxPentadState.activeVertex = null;
                sxPentadState.vertexLocked = !1;
                sxPentadState.dragFromZero = !sxPentadState.p0 && !sxPentadState.p1 && !sxPentadState.p2 && !sxPentadState.p3 && !sxPentadState.p4;
                canvas.setPointerCapture(evt.pointerId);
                updateFromPointer(evt);
            });

            canvas.addEventListener("pointermove", (evt) => {
                if (!sxPentadState.isDragging) return;
                updateFromPointer(evt);
            });

            const stopDrag = (evt) => {
                if (sxPentadState.isDragging) {
                    sxPentadState.isDragging = !1;
                    sxPentadState.activeVertex = null;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (ignore) {}
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            canvas.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                sxPentadState.intensity = Math.max(-400, Math.min(400, Math.round((Number(sxPentadState.intensity) || 0) + step)));
                if (slider) slider.value = String(Math.round(sxPentadState.intensity));
                const out = e.byId("markPentadIntensityOut");
                if (out) out.textContent = String(Math.round(sxPentadState.intensity));
                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawPentadWidget(canvas, shape, sxPentadState);
                    sxApplyPentadRatings(Qr);
                }
            }, { passive: false });

            if (slider) {
                slider.addEventListener("input", () => {
                    const val = Math.max(-400, Math.min(400, Math.round(Number(slider.value) || 0)));
                    sxPentadState.intensity = val;
                    const out = e.byId("markPentadIntensityOut");
                    out && (out.textContent = String(val));
                    if (Qr) {
                        const shape = Ge(Qr);
                        sxDrawPentadWidget(canvas, shape, sxPentadState);
                        sxApplyPentadRatings(Qr);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        sxClearPentadRatings(Qr);
                    }
                });
            }
        }

        let sxHexadState = {
            topicId: null,
            intensity: 0,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0,
            // Shape = pole values as ratios to the max (max = 1). Saved
            // whenever the values are non-zero, so the intensity slider can
            // restore the same shape after being taken to 0.
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_HEXAD_COLORS = ["#22c55e", "#06b6d4", "#6366f1", "#ef4444", "#f97316", "#eab308"];

        function sxGetHexadVertices(width, height) {
            const cx = width / 2, cy = height / 2;
            const r = Math.min(width, height) / 2 - 24;
            const vertices = [];
            for (let k = 0; k < 6; k++) {
                const angle = -Math.PI / 2 + k * (Math.PI / 3);
                vertices.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle });
            }
            return { cx, cy, r, vertices };
        }

        function sxDrawHexadWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const { cx, cy, r, vertices } = sxGetHexadVertices(width, height);

            // 1. Concentric reference hexagon rings (25%, 50%, 75%, 100%)
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                for (let k = 0; k < 6; k++) {
                    const angle = vertices[k].angle;
                    const x = cx + r * frac * Math.cos(angle);
                    const y = cy + r * frac * Math.sin(angle);
                    if (k === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.lineWidth = frac === 1.0 ? 1.5 : 0.8;
                ctx.strokeStyle = frac === 1.0 ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.15)";
                ctx.stroke();
            });

            // 2. Radial spoke axes from center to each vertex
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            for (let k = 0; k < 6; k++) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(vertices[k].x, vertices[k].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Deformed Polygon from active ratings
            const sxMaxAbs = Math.abs(sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4, state.p5]));
            const s = [
                (sxMaxAbs > 0 ? Math.abs(state.p0) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p1) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p2) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p3) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p4) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p5) / sxMaxAbs : 0)
            ];

            const polyPts = vertices.map((v, k) => ({
                x: cx + (v.x - cx) * s[k],
                y: cy + (v.y - cy) * s[k]
            }));

            const maxVal = sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4, state.p5]);
            const polyCol = sxIntensityRGB(61, 168, 116, state.intensity != null ? state.intensity : maxVal);

            // Filled shape
            ctx.beginPath();
            polyPts.forEach((pt, k) => {
                if (k === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.fillStyle = polyCol;
            ctx.globalAlpha = 0.45;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 4. Pole vertex handles
            polyPts.forEach((pt, idx) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 5.5, 0, 2 * Math.PI);
                ctx.fillStyle = SX_HEXAD_COLORS[idx];
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            });

            // 5. Pole Labels — tangent-rotated (T5).
            canvas.__sxLabelRects = [];
            const labels = sxPoleLabels(shape, 6);
            vertices.forEach((v, idx) => {
                sxDrawPoleLabel(ctx, canvas, v.x, v.y, v.angle, labels[idx], SX_HEXAD_COLORS[idx], shape && shape.keys && shape.keys[idx], labels[idx], 6, r);
            });
        }

        function sxApplyHexadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 6) return;
            sxPersistIntensity(topicId, sxHexadState.intensity);
            To(topicId, shape.keys[0], Math.round(sxHexadState.p0), !1);
            To(topicId, shape.keys[1], Math.round(sxHexadState.p1), !1);
            To(topicId, shape.keys[2], Math.round(sxHexadState.p2), !1);
            To(topicId, shape.keys[3], Math.round(sxHexadState.p3), !1);
            To(topicId, shape.keys[4], Math.round(sxHexadState.p4), !1);
            To(topicId, shape.keys[5], Math.round(sxHexadState.p5), !0);
            sxSyncMarkRatings(topicId);
        }

        function sxClearHexadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 6) return;
            Fo(topicId, "intensity", !1);
            Fo(topicId, shape.keys[0], !1);
            Fo(topicId, shape.keys[1], !1);
            Fo(topicId, shape.keys[2], !1);
            Fo(topicId, shape.keys[3], !1);
            Fo(topicId, shape.keys[4], !1);
            Fo(topicId, shape.keys[5], !0);
            sxSyncMarkRatings(topicId);
        }

        function sxBindHexadWidget() {
            const canvas = e.byId("markHexadCanvas");
            const slider = e.byId("markHexadIntensity");
            const clearBtn = e.byId("markHexadClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxHexadState.isDragging);

            const updateFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);

                const { cx, cy, r, vertices } = sxGetHexadVertices(canvas.width, canvas.height);
                const curVals = [sxHexadState.p0, sxHexadState.p1, sxHexadState.p2, sxHexadState.p3, sxHexadState.p4, sxHexadState.p5];
                const isAllZero = curVals.every(v => !v);

                if (sxHexadState.activeVertex === null) {
                    sxHexadState.activeVertex = sxFindClosestAxis(px, py, cx, cy, vertices, isAllZero ? null : curVals, 22);
                }

                // Angle initializer: this drag started from all-zero and no
                // vertex has been pulled out yet — re-pick the active vertex
                // by pointer ANGLE on every move, so the drag direction (not
                // the grab point) decides which pole rises. Once committed
                // the locked vertex holds for the rest of the drag.
                if (sxHexadState.dragFromZero && !sxHexadState.vertexLocked) {
                    sxHexadState.activeVertex = sxClosestVertexByAngle(px, py, cx, cy, vertices);
                }

                const v = sxHexadState.activeVertex;
                const angle = vertices[v].angle;
                const cosA = Math.cos(angle), sinA = Math.sin(angle);
                const dot = (px - cx) * cosA + (py - cy) * sinA;
                const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));

                if ((isAllZero || (sxHexadState.dragFromZero && !sxHexadState.vertexLocked)) && val > 0) {
                    const base = Math.max(20, Math.round(val * 0.5));
                    for (let k = 0; k < 6; k++) {
                        sxHexadState[`p${k}`] = (k === v) ? val : base;
                    }
                    // Commit: the dragged vertex has been pulled past the base
                    // level the others sit at (base is at least 20 and at most
                    // val/2, so val > base reduces to val > 20) — lock the
                    // vertex for the rest of the drag.
                    if (val > base) sxHexadState.vertexLocked = true;
                } else {
                    sxHexadState[`p${v}`] = val;
                }

                const maxVal = sxSignedIntensity([sxHexadState.p0, sxHexadState.p1, sxHexadState.p2, sxHexadState.p3, sxHexadState.p4, sxHexadState.p5]);
                if (slider) slider.value = String(Math.round(maxVal));
                const out = e.byId("markHexadIntensityOut");
                if (out) out.textContent = String(Math.round(maxVal));

                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawHexadWidget(canvas, shape, sxHexadState);
                    sxApplyHexadRatings(Qr);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                sxHexadState.isDragging = !0;
                sxHexadState.activeVertex = null;
                sxHexadState.vertexLocked = !1;
                sxHexadState.dragFromZero = !sxHexadState.p0 && !sxHexadState.p1 && !sxHexadState.p2 && !sxHexadState.p3 && !sxHexadState.p4 && !sxHexadState.p5;
                canvas.setPointerCapture(evt.pointerId);
                updateFromPointer(evt);
            });

            canvas.addEventListener("pointermove", (evt) => {
                if (!sxHexadState.isDragging) return;
                updateFromPointer(evt);
            });

            const stopDrag = (evt) => {
                if (sxHexadState.isDragging) {
                    sxHexadState.isDragging = !1;
                    sxHexadState.activeVertex = null;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (ignore) {}
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            canvas.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                sxHexadState.intensity = Math.max(-400, Math.min(400, Math.round((Number(sxHexadState.intensity) || 0) + step)));
                if (slider) slider.value = String(Math.round(sxHexadState.intensity));
                const out = e.byId("markHexadIntensityOut");
                if (out) out.textContent = String(Math.round(sxHexadState.intensity));
                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawHexadWidget(canvas, shape, sxHexadState);
                    sxApplyHexadRatings(Qr);
                }
            }, { passive: false });

            if (slider) {
                slider.addEventListener("input", () => {
                    const val = Math.max(-400, Math.min(400, Math.round(Number(slider.value) || 0)));
                    sxHexadState.intensity = val;
                    const out = e.byId("markHexadIntensityOut");
                    out && (out.textContent = String(val));
                    if (Qr) {
                        const shape = Ge(Qr);
                        sxDrawHexadWidget(canvas, shape, sxHexadState);
                        sxApplyHexadRatings(Qr);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        sxClearHexadRatings(Qr);
                    }
                });
            }
        }

        let sxHeptadState = {
            topicId: null,
            intensity: 0,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0,
            // Shape = pole values as ratios to the max (max = 1). Saved
            // whenever the values are non-zero, so the intensity slider can
            // restore the same shape after being taken to 0.
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_HEPTAD_COLORS = ["#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"];

        function sxGetHeptadVertices(width, height) {
            const cx = width / 2, cy = height / 2;
            const r = Math.min(width, height) / 2 - 24;
            const vertices = [];
            for (let k = 0; k < 7; k++) {
                const angle = -Math.PI / 2 + k * (2 * Math.PI / 7);
                vertices.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle });
            }
            return { cx, cy, r, vertices };
        }

        function sxDrawHeptadWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const { cx, cy, r, vertices } = sxGetHeptadVertices(width, height);

            // 1. Concentric reference heptagon rings (25%, 50%, 75%, 100%)
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                for (let k = 0; k < 7; k++) {
                    const angle = vertices[k].angle;
                    const x = cx + r * frac * Math.cos(angle);
                    const y = cy + r * frac * Math.sin(angle);
                    if (k === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.lineWidth = frac === 1.0 ? 1.5 : 0.8;
                ctx.strokeStyle = frac === 1.0 ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.15)";
                ctx.stroke();
            });

            // 2. Radial spoke axes from center to each vertex
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            for (let k = 0; k < 7; k++) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(vertices[k].x, vertices[k].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Deformed Polygon from active ratings
            const sxMaxAbs = Math.abs(sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4, state.p5, state.p6]));
            const s = [
                (sxMaxAbs > 0 ? Math.abs(state.p0) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p1) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p2) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p3) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p4) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p5) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p6) / sxMaxAbs : 0)
            ];

            const polyPts = vertices.map((v, k) => ({
                x: cx + (v.x - cx) * s[k],
                y: cy + (v.y - cy) * s[k]
            }));

            const maxVal = sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4, state.p5, state.p6]);
            const polyCol = sxIntensityRGB(61, 168, 116, state.intensity != null ? state.intensity : maxVal);

            // Filled shape
            ctx.beginPath();
            polyPts.forEach((pt, k) => {
                if (k === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.fillStyle = polyCol;
            ctx.globalAlpha = 0.45;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 4. Pole vertex handles
            polyPts.forEach((pt, idx) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 5.5, 0, 2 * Math.PI);
                ctx.fillStyle = SX_HEPTAD_COLORS[idx];
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            });

            // 5. Pole Labels — tangent-rotated (T5).
            canvas.__sxLabelRects = [];
            const labels = sxPoleLabels(shape, 7);
            vertices.forEach((v, idx) => {
                sxDrawPoleLabel(ctx, canvas, v.x, v.y, v.angle, labels[idx], SX_HEPTAD_COLORS[idx], shape && shape.keys && shape.keys[idx], labels[idx], 7, r);
            });
        }

        function sxApplyHeptadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 7) return;
            sxPersistIntensity(topicId, sxHeptadState.intensity);
            To(topicId, shape.keys[0], Math.round(sxHeptadState.p0), !1);
            To(topicId, shape.keys[1], Math.round(sxHeptadState.p1), !1);
            To(topicId, shape.keys[2], Math.round(sxHeptadState.p2), !1);
            To(topicId, shape.keys[3], Math.round(sxHeptadState.p3), !1);
            To(topicId, shape.keys[4], Math.round(sxHeptadState.p4), !1);
            To(topicId, shape.keys[5], Math.round(sxHeptadState.p5), !1);
            To(topicId, shape.keys[6], Math.round(sxHeptadState.p6), !0);
            sxSyncMarkRatings(topicId);
        }

        function sxClearHeptadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 7) return;
            Fo(topicId, "intensity", !1);
            Fo(topicId, shape.keys[0], !1);
            Fo(topicId, shape.keys[1], !1);
            Fo(topicId, shape.keys[2], !1);
            Fo(topicId, shape.keys[3], !1);
            Fo(topicId, shape.keys[4], !1);
            Fo(topicId, shape.keys[5], !1);
            Fo(topicId, shape.keys[6], !0);
            sxSyncMarkRatings(topicId);
        }

        function sxBindHeptadWidget() {
            const canvas = e.byId("markHeptadCanvas");
            const slider = e.byId("markHeptadIntensity");
            const clearBtn = e.byId("markHeptadClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxHeptadState.isDragging);

            const updateFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);

                const { cx, cy, r, vertices } = sxGetHeptadVertices(canvas.width, canvas.height);
                const curVals = [sxHeptadState.p0, sxHeptadState.p1, sxHeptadState.p2, sxHeptadState.p3, sxHeptadState.p4, sxHeptadState.p5, sxHeptadState.p6];
                const isAllZero = curVals.every(v => !v);

                if (sxHeptadState.activeVertex === null) {
                    sxHeptadState.activeVertex = sxFindClosestAxis(px, py, cx, cy, vertices, isAllZero ? null : curVals, 22);
                }

                // Angle initializer: this drag started from all-zero and no
                // vertex has been pulled out yet — re-pick the active vertex
                // by pointer ANGLE on every move, so the drag direction (not
                // the grab point) decides which pole rises. Once committed
                // the locked vertex holds for the rest of the drag.
                if (sxHeptadState.dragFromZero && !sxHeptadState.vertexLocked) {
                    sxHeptadState.activeVertex = sxClosestVertexByAngle(px, py, cx, cy, vertices);
                }

                const v = sxHeptadState.activeVertex;
                const angle = vertices[v].angle;
                const cosA = Math.cos(angle), sinA = Math.sin(angle);
                const dot = (px - cx) * cosA + (py - cy) * sinA;
                const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));

                if ((isAllZero || (sxHeptadState.dragFromZero && !sxHeptadState.vertexLocked)) && val > 0) {
                    const base = Math.max(20, Math.round(val * 0.5));
                    for (let k = 0; k < 7; k++) {
                        sxHeptadState[`p${k}`] = (k === v) ? val : base;
                    }
                    // Commit: the dragged vertex has been pulled past the base
                    // level the others sit at (base is at least 20 and at most
                    // val/2, so val > base reduces to val > 20) — lock the
                    // vertex for the rest of the drag.
                    if (val > base) sxHeptadState.vertexLocked = true;
                } else {
                    sxHeptadState[`p${v}`] = val;
                }

                const maxVal = sxSignedIntensity([sxHeptadState.p0, sxHeptadState.p1, sxHeptadState.p2, sxHeptadState.p3, sxHeptadState.p4, sxHeptadState.p5, sxHeptadState.p6]);
                if (slider) slider.value = String(Math.round(maxVal));
                const out = e.byId("markHeptadIntensityOut");
                if (out) out.textContent = String(Math.round(maxVal));

                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawHeptadWidget(canvas, shape, sxHeptadState);
                    sxApplyHeptadRatings(Qr);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                sxHeptadState.isDragging = !0;
                sxHeptadState.activeVertex = null;
                sxHeptadState.vertexLocked = !1;
                sxHeptadState.dragFromZero = !sxHeptadState.p0 && !sxHeptadState.p1 && !sxHeptadState.p2 && !sxHeptadState.p3 && !sxHeptadState.p4 && !sxHeptadState.p5 && !sxHeptadState.p6;
                canvas.setPointerCapture(evt.pointerId);
                updateFromPointer(evt);
            });

            canvas.addEventListener("pointermove", (evt) => {
                if (!sxHeptadState.isDragging) return;
                updateFromPointer(evt);
            });

            const stopDrag = (evt) => {
                if (sxHeptadState.isDragging) {
                    sxHeptadState.isDragging = !1;
                    sxHeptadState.activeVertex = null;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (ignore) {}
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            canvas.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                sxHeptadState.intensity = Math.max(-400, Math.min(400, Math.round((Number(sxHeptadState.intensity) || 0) + step)));
                if (slider) slider.value = String(Math.round(sxHeptadState.intensity));
                const out = e.byId("markHeptadIntensityOut");
                if (out) out.textContent = String(Math.round(sxHeptadState.intensity));
                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawHeptadWidget(canvas, shape, sxHeptadState);
                    sxApplyHeptadRatings(Qr);
                }
            }, { passive: false });

            if (slider) {
                slider.addEventListener("input", () => {
                    const val = Math.max(-400, Math.min(400, Math.round(Number(slider.value) || 0)));
                    sxHeptadState.intensity = val;
                    const out = e.byId("markHeptadIntensityOut");
                    out && (out.textContent = String(val));
                    if (Qr) {
                        const shape = Ge(Qr);
                        sxDrawHeptadWidget(canvas, shape, sxHeptadState);
                        sxApplyHeptadRatings(Qr);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        sxClearHeptadRatings(Qr);
                    }
                });
            }
        }

        // ==========================================
        // 8-POLE OCTAD RADAR (REGULAR OCTAGON POLYGON)
        // ==========================================
        let sxOctadState = {
            topicId: null,
            intensity: 0,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0,
            // Shape = pole values as ratios to the max (max = 1). Saved
            // whenever the values are non-zero, so the intensity slider can
            // restore the same shape after being taken to 0.
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_OCTAD_COLORS = ["#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"];

        function sxGetOctadVertices(width, height) {
            const cx = width / 2, cy = height / 2;
            const r = Math.min(width, height) / 2 - 24;
            const vertices = [];
            for (let k = 0; k < 8; k++) {
                const angle = -Math.PI / 2 + k * (Math.PI / 4);
                vertices.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle });
            }
            return { cx, cy, r, vertices };
        }

        function sxDrawOctadWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const { cx, cy, r, vertices } = sxGetOctadVertices(width, height);

            // 1. Concentric reference octagon rings (25%, 50%, 75%, 100%)
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                for (let k = 0; k < 8; k++) {
                    const angle = vertices[k].angle;
                    const x = cx + r * frac * Math.cos(angle);
                    const y = cy + r * frac * Math.sin(angle);
                    if (k === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.lineWidth = frac === 1.0 ? 1.5 : 0.8;
                ctx.strokeStyle = frac === 1.0 ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.15)";
                ctx.stroke();
            });

            // 2. Radial spoke axes from center to each vertex (with diametric lines connecting antipodes)
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            for (let k = 0; k < 4; k++) {
                ctx.moveTo(vertices[k].x, vertices[k].y);
                ctx.lineTo(vertices[k + 4].x, vertices[k + 4].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Deformed Polygon from active ratings
            const sxMaxAbs = Math.abs(sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4, state.p5, state.p6, state.p7]));
            const s = [
                (sxMaxAbs > 0 ? Math.abs(state.p0) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p1) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p2) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p3) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p4) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p5) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p6) / sxMaxAbs : 0),
                (sxMaxAbs > 0 ? Math.abs(state.p7) / sxMaxAbs : 0)
            ];

            const polyPts = vertices.map((v, k) => ({
                x: cx + (v.x - cx) * s[k],
                y: cy + (v.y - cy) * s[k]
            }));

            const maxVal = sxSignedIntensity([state.p0, state.p1, state.p2, state.p3, state.p4, state.p5, state.p6, state.p7]);
            const polyCol = sxIntensityRGB(61, 168, 116, state.intensity != null ? state.intensity : maxVal);

            // Filled shape
            ctx.beginPath();
            polyPts.forEach((pt, k) => {
                if (k === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.fillStyle = polyCol;
            ctx.globalAlpha = 0.45;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 4. Pole vertex handles
            polyPts.forEach((pt, idx) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 5.5, 0, 2 * Math.PI);
                ctx.fillStyle = SX_OCTAD_COLORS[idx];
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            });

            // 5. Pole Labels — tangent-rotated (T5).
            canvas.__sxLabelRects = [];
            const labels = sxPoleLabels(shape, 8);
            vertices.forEach((v, idx) => {
                sxDrawPoleLabel(ctx, canvas, v.x, v.y, v.angle, labels[idx], SX_OCTAD_COLORS[idx], shape && shape.keys && shape.keys[idx], labels[idx], 8, r);
            });
        }

        function sxApplyOctadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 8) return;
            sxPersistIntensity(topicId, sxOctadState.intensity);
            To(topicId, shape.keys[0], Math.round(sxOctadState.p0), !1);
            To(topicId, shape.keys[1], Math.round(sxOctadState.p1), !1);
            To(topicId, shape.keys[2], Math.round(sxOctadState.p2), !1);
            To(topicId, shape.keys[3], Math.round(sxOctadState.p3), !1);
            To(topicId, shape.keys[4], Math.round(sxOctadState.p4), !1);
            To(topicId, shape.keys[5], Math.round(sxOctadState.p5), !1);
            To(topicId, shape.keys[6], Math.round(sxOctadState.p6), !1);
            To(topicId, shape.keys[7], Math.round(sxOctadState.p7), !0);
            sxSyncMarkRatings(topicId);
        }

        function sxClearOctadRatings(topicId) {
            if (!topicId) return;
            const shape = Ge(topicId);
            if (!shape || !shape.keys || shape.keys.length < 8) return;
            Fo(topicId, "intensity", !1);
            Fo(topicId, shape.keys[0], !1);
            Fo(topicId, shape.keys[1], !1);
            Fo(topicId, shape.keys[2], !1);
            Fo(topicId, shape.keys[3], !1);
            Fo(topicId, shape.keys[4], !1);
            Fo(topicId, shape.keys[5], !1);
            Fo(topicId, shape.keys[6], !1);
            Fo(topicId, shape.keys[7], !0);
            sxSyncMarkRatings(topicId);
        }

        function sxBindOctadWidget() {
            const canvas = e.byId("markOctadCanvas");
            const slider = e.byId("markOctadIntensity");
            const clearBtn = e.byId("markOctadClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxOctadState.isDragging);

            const updateFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);

                const { cx, cy, r, vertices } = sxGetOctadVertices(canvas.width, canvas.height);
                const curVals = [sxOctadState.p0, sxOctadState.p1, sxOctadState.p2, sxOctadState.p3, sxOctadState.p4, sxOctadState.p5, sxOctadState.p6, sxOctadState.p7];
                const isAllZero = curVals.every(v => !v);

                if (sxOctadState.activeVertex === null) {
                    sxOctadState.activeVertex = sxFindClosestAxis(px, py, cx, cy, vertices, isAllZero ? null : curVals, 22);
                }

                // Angle initializer: this drag started from all-zero and no
                // vertex has been pulled out yet — re-pick the active vertex
                // by pointer ANGLE on every move, so the drag direction (not
                // the grab point) decides which pole rises. Once committed
                // the locked vertex holds for the rest of the drag.
                if (sxOctadState.dragFromZero && !sxOctadState.vertexLocked) {
                    sxOctadState.activeVertex = sxClosestVertexByAngle(px, py, cx, cy, vertices);
                }

                const v = sxOctadState.activeVertex;
                const angle = vertices[v].angle;
                const cosA = Math.cos(angle), sinA = Math.sin(angle);
                const dot = (px - cx) * cosA + (py - cy) * sinA;
                const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));

                if ((isAllZero || (sxOctadState.dragFromZero && !sxOctadState.vertexLocked)) && val > 0) {
                    const base = Math.max(20, Math.round(val * 0.5));
                    for (let k = 0; k < 8; k++) {
                        sxOctadState[`p${k}`] = (k === v) ? val : base;
                    }
                    // Commit: the dragged vertex has been pulled past the base
                    // level the others sit at (base is at least 20 and at most
                    // val/2, so val > base reduces to val > 20) — lock the
                    // vertex for the rest of the drag.
                    if (val > base) sxOctadState.vertexLocked = true;
                } else {
                    sxOctadState[`p${v}`] = val;
                }

                const maxVal = sxSignedIntensity([sxOctadState.p0, sxOctadState.p1, sxOctadState.p2, sxOctadState.p3, sxOctadState.p4, sxOctadState.p5, sxOctadState.p6, sxOctadState.p7]);
                if (slider) slider.value = String(Math.round(maxVal));
                const out = e.byId("markOctadIntensityOut");
                if (out) out.textContent = String(Math.round(maxVal));

                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawOctadWidget(canvas, shape, sxOctadState);
                    sxApplyOctadRatings(Qr);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                sxOctadState.isDragging = !0;
                sxOctadState.activeVertex = null;
                sxOctadState.vertexLocked = !1;
                sxOctadState.dragFromZero = !sxOctadState.p0 && !sxOctadState.p1 && !sxOctadState.p2 && !sxOctadState.p3 && !sxOctadState.p4 && !sxOctadState.p5 && !sxOctadState.p6 && !sxOctadState.p7;
                canvas.setPointerCapture(evt.pointerId);
                updateFromPointer(evt);
            });

            canvas.addEventListener("pointermove", (evt) => {
                if (!sxOctadState.isDragging) return;
                updateFromPointer(evt);
            });

            const stopDrag = (evt) => {
                if (sxOctadState.isDragging) {
                    sxOctadState.isDragging = !1;
                    sxOctadState.activeVertex = null;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (ignore) {}
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            canvas.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                sxOctadState.intensity = Math.max(-400, Math.min(400, Math.round((Number(sxOctadState.intensity) || 0) + step)));
                if (slider) slider.value = String(Math.round(sxOctadState.intensity));
                const out = e.byId("markOctadIntensityOut");
                if (out) out.textContent = String(Math.round(sxOctadState.intensity));
                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawOctadWidget(canvas, shape, sxOctadState);
                    sxApplyOctadRatings(Qr);
                }
            }, { passive: false });

            if (slider) {
                slider.addEventListener("input", () => {
                    const val = Math.max(-400, Math.min(400, Math.round(Number(slider.value) || 0)));
                    sxOctadState.intensity = val;
                    const out = e.byId("markOctadIntensityOut");
                    out && (out.textContent = String(val));
                    if (Qr) {
                        const shape = Ge(Qr);
                        sxDrawOctadWidget(canvas, shape, sxOctadState);
                        sxApplyOctadRatings(Qr);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        sxClearOctadRatings(Qr);
                    }
                });
            }
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
            // handler re-resolves the id before reading/writing — otherwise
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
            // The xy-switchbox has no intensity dimension at all (its two
            // axes are signed already): the generic intensity slider and
            // wheel must not rescale its values.
            const isSwitch = is2Pole && !isCompass && !shape.single;
            if (slider) slider.disabled = isSwitch;

            badgeEl && (badgeEl.textContent = isCompass ? "Political Compass" : isOctad ? "8-Pole Octad" : isHeptad ? "7-Pole Heptad" : isHexad ? "6-Pole Hexad" : isPentad ? "5-Pole Pentad" : isTetrad ? "4-Pole Tetrad" : isTriad ? "3-Pole Triad" : (shape.single ? "Monopole" : "2D Role Switch-Box"));

            const keys = shape.keys || [];
            readoutEl && (readoutEl.innerHTML = "");
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

                if (isCompass) {
                    const pt = sxCompassPointFromValues(vals[0], vals[1], vals[2], vals[3]);
                    pt.intensity = sliderVal;
                    sxDrawCompassWidget(canvas, shape, pt);
                } else if (isOctad) {
                    sxDrawOctadWidget(canvas, shape, {
                        p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], p6: vals[6], p7: vals[7], intensity: sliderVal
                    });
                } else if (isHeptad) {
                    sxDrawHeptadWidget(canvas, shape, {
                        p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], p6: vals[6], intensity: sliderVal
                    });
                } else if (isHexad) {
                    sxDrawHexadWidget(canvas, shape, {
                        p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], p5: vals[5], intensity: sliderVal
                    });
                } else if (isPentad) {
                    sxDrawPentadWidget(canvas, shape, {
                        p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], p4: vals[4], intensity: sliderVal
                    });
                } else if (isTetrad) {
                    sxDrawTetradWidget(canvas, shape, {
                        p0: vals[0], p1: vals[1], p2: vals[2], p3: vals[3], intensity: sliderVal
                    });
                } else if (isTriad) {
                    // 2026-11-18 (puck-drag smoothness): the weights must
                    // sum to 1 — the draw places the puck at w0*V0 +
                    // w1*V1 + w2*V2, so the old raw vals/100 (summing to
                    // intensity/100, e.g. 0.7) dragged the puck toward the
                    // canvas origin, and let it jump whenever the
                    // intensity changed mid-drag. Normalised by absolute
                    // value, mirroring the placard's derivation.
                    const sumAbs = Math.abs(vals[0]) + Math.abs(vals[1]) + Math.abs(vals[2]);
                    const nw = sumAbs > 0 ? [Math.abs(vals[0]) / sumAbs, Math.abs(vals[1]) / sumAbs, Math.abs(vals[2]) / sumAbs] : [1 / 3, 1 / 3, 1 / 3];
                    sxDrawTriangleWidget(canvas, shape, {
                        x: 0, y: 0, w0: nw[0], w1: nw[1], w2: nw[2], intensity: sliderVal
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

                    if (isAllZero && val > 0) {
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
                    keys.forEach((k, idx) => To(topicId, k, vals[idx], !1, pId));
                    redraw();
                    paintRow();
                } else if (isTriad) {
                    const { V0, V1, V2 } = sxGetTriVertices(canvas.width, canvas.height);
                    const { w0, w1, w2 } = sxPointToBarycentric(px, py, V0, V1, V2);
                    To(topicId, keys[0], Math.round(w0 * 100), !1, pId);
                    To(topicId, keys[1], Math.round(w1 * 100), !1, pId);
                    To(topicId, keys[2], Math.round(w2 * 100), !1, pId);
                    redraw();
                    paintRow();
                } else if (is2Pole && !shape.single) {
                    const cx = canvas.width / 2, cy = canvas.height / 2;
                    const r = Math.min(cx, cy) - 22;
                    let dx = px - cx, dy = py - cy;
                    if (Math.hypot(dx, dy) < 6) { dx = 0; dy = 0; }
                    const g = Math.max(-100, Math.min(100, Math.round((dx / r) * 100)));
                    const recv = Math.max(-100, Math.min(100, Math.round((-dy / r) * 100)));
                    To(topicId, "give", g, !1, pId);
                    To(topicId, "receive", recv, !1, pId);
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
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                const curRec = ca(topicId, pId);
                const vals = keys.map(k => (curRec[k + "Known"] ? curRec[k] : 0));
                const family = isCompass ? "compass" : isTriad ? "triad" : "radar";
                const cur = curRec.intensityKnown ? Number(curRec.intensity) || 0 : sxDerivedFromVals(vals, family);
                sxPersistIntensity(topicId, cur + step, pId);
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
                    sxPersistIntensity(topicId, Number(slider.value), pId);
                    redraw();
                    paintRow();
                };
                slider.onchange = () => {
                    finishGesture();
                };
            }

            if (clearBtn) {
                clearBtn.onclick = () => {
                    Fo(topicId, "intensity", !1, pId);
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
            const slider = e.byId("markTriangleIntensity");
            const clearBtn = e.byId("markTriangleClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxTriState.isDragging);

            const updatePointFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);
                const { V0, V1, V2 } = sxGetTriVertices(canvas.width, canvas.height);
                const { w0, w1, w2 } = sxPointToBarycentric(px, py, V0, V1, V2);
                sxTriState.w0 = w0;
                sxTriState.w1 = w1;
                sxTriState.w2 = w2;
                if (!sxTriState.intensity) {
                    sxTriState.intensity = 70;
                    if (slider) slider.value = "70";
                    const out = e.byId("markTriangleIntensityOut");
                    out && (out.textContent = "70");
                }
                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
                    // Live drag (2026-11-18): the puck follows the pointer
                    // from sxTriState alone — cheap text updates for the
                    // three readout values, and the rating write coalesced
                    // to one per animation frame, WITHOUT the full placard
                    // re-sync (that re-derived the weights from stored
                    // integers and redrew the triangle a second time, so
                    // the puck jumped in quantized steps on every move).
                    // The full sync runs once, on drag end (stopDrag).
                    const v0El = e.byId("markTriVal0"), v1El = e.byId("markTriVal1"), v2El = e.byId("markTriVal2");
                    if (v0El) v0El.textContent = String(Math.round(sxTriState.w0 * sxTriState.intensity));
                    if (v1El) v1El.textContent = String(Math.round(sxTriState.w1 * sxTriState.intensity));
                    if (v2El) v2El.textContent = String(Math.round(sxTriState.w2 * sxTriState.intensity));
                    if (!sxTriState.__sxApplyRaf) {
                        sxTriState.__sxApplyRaf = requestAnimationFrame(() => {
                            sxTriState.__sxApplyRaf = 0;
                            if (Qr) sxApplyTriRatings(Qr, true);
                        });
                    }
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
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
                    // Flush any coalesced live write, then the one full
                    // placard sync for the finished drag.
                    if (sxTriState.__sxApplyRaf) { cancelAnimationFrame(sxTriState.__sxApplyRaf); sxTriState.__sxApplyRaf = 0; }
                    if (Qr) sxApplyTriRatings(Qr);
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            // Mouse wheel adjustments on canvas directly adjust intensity
            canvas.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const step = (evt.shiftKey ? 10 : 50) * (evt.deltaY < 0 ? 1 : -1);
                const current = typeof sxTriState.intensity === "number" ? sxTriState.intensity : 0;
                sxTriState.intensity = Math.max(-400, Math.min(400, Math.round(current + step)));
                if (slider) slider.value = String(Math.round(sxTriState.intensity));
                const out = e.byId("markTriangleIntensityOut");
                out && (out.textContent = String(Math.round(sxTriState.intensity)));
                if (Qr) {
                    sxPersistIntensity(Qr, sxTriState.intensity);
                    const shape = Ge(Qr);
                    sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
                }
            }, { passive: false });

            if (slider) {
                slider.addEventListener("input", () => {
                    sxTriState.intensity = Math.max(-400, Math.min(400, Math.round(Number(slider.value) || 0)));
                    const out = e.byId("markTriangleIntensityOut");
                    out && (out.textContent = String(Math.round(sxTriState.intensity)));
                    if (Qr) {
                        sxPersistIntensity(Qr, sxTriState.intensity);
                        const shape = Ge(Qr);
                        sxDrawTriangleWidget(canvas, shape, sxTriState, sxTriState.intensity);
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

        // --- 2D XY Role Switch-Box State & Widget ---
        let sxSwitchboxState = {
            topicId: null,
            give: 0,
            receive: 0,
            isDragging: false
        };

        function sxGetSwitchboxRole(give, receive, topicId) {
            const g = Math.round(give), r = Math.round(receive);
            const words = sxSwitchboxRoleWords(topicId);
            if (g === 0 && r === 0) return "Neutral / Open";
            if (g > 20 && r > 20) return words.classic ? "Versatile Switch" : "Both " + words.g + " + " + words.r;
            if (g < -20 && r < -20) return words.classic ? "Hard Red Limit" : "Neither (limit)";
            if (g > 20 && r < -20) return words.classic ? "Dedicated Top / Giver" : words.g + " only";
            if (g < -20 && r > 20) return words.classic ? "Dedicated Bottom / Receiver" : words.r + " only";
            if (g > 20 && Math.abs(r) <= 20) return words.classic ? "Top Leaning" : words.g + " leaning";
            if (r > 20 && Math.abs(g) <= 20) return words.classic ? "Bottom Leaning" : words.r + " leaning";
            if (g < -20 && Math.abs(r) <= 20) return words.classic ? "Give Limit" : words.g + " limit";
            if (r < -20 && Math.abs(g) <= 20) return words.classic ? "Receive Limit" : words.r + " limit";
            return "Moderate Engagement";
        }

        function sxDrawSwitchboxWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const cx = width / 2, cy = height / 2;
            const pad = 22;
            const r = Math.min(cx, cy) - pad;

            // 1. Tinted Quadrant Backgrounds
            // QI (Top-Right: +Give, +Receive -> Versatile Switch)
            ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
            ctx.fillRect(cx, cy - r, r, r);

            // QII (Top-Left: -Give, +Receive -> Bottom / Receiver)
            ctx.fillStyle = "rgba(59, 130, 246, 0.10)";
            ctx.fillRect(cx - r, cy - r, r, r);

            // QIII (Bottom-Left: -Give, -Receive -> Hard Limit)
            ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
            ctx.fillRect(cx - r, cy, r, r);

            // QIV (Bottom-Right: +Give, -Receive -> Top / Giver)
            ctx.fillStyle = "rgba(234, 179, 8, 0.10)";
            ctx.fillRect(cx, cy, r, r);

            // 2. Reference Grid & Border
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
            ctx.strokeRect(cx - r, cy - r, 2 * r, 2 * r);

            // Grid lines at +/- 50
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.5, cy - r); ctx.lineTo(cx - r * 0.5, cy + r);
            ctx.moveTo(cx + r * 0.5, cy - r); ctx.lineTo(cx + r * 0.5, cy + r);
            ctx.moveTo(cx - r, cy - r * 0.5); ctx.lineTo(cx + r, cy - r * 0.5);
            ctx.moveTo(cx - r, cy + r * 0.5); ctx.lineTo(cx + r, cy + r * 0.5);
            ctx.stroke();

            // Diagonal switch line Y = X (Top-Right to Bottom-Left)
            ctx.beginPath();
            ctx.moveTo(cx - r, cy + r);
            ctx.lineTo(cx + r, cy - r);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Main Crosshairs
            ctx.beginPath();
            ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
            ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
            ctx.stroke();

            // Deadband center circle
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.stroke();

            // 4. Pole Axis Labels — short axis words on canvas (T2/T4);
            // the full names live in the readout rows + hovertips. Side
            // labels run vertical (tangent, 90°) so they fit the 190px
            // canvas instead of clipping past its edge (T3).
            canvas.__sxLabelRects = [];
            const giveFull = (shape && shape.labels && shape.labels[0]) || "Give";
            const recvFull = (shape && shape.labels && shape.labels[1]) || "Receive";
            const giveLabel = sxShortAxisWord(giveFull);
            const recvLabel = sxShortAxisWord(recvFull);

            // Top (+Receive) — horizontal
            sxDrawPoleLabelAt(ctx, canvas, cx, cy - r - 9, 0, `+ ${recvLabel}`, "#4ade80", "receive", recvFull);
            // Bottom (-Receive Limit) — horizontal
            sxDrawPoleLabelAt(ctx, canvas, cx, cy + r + 9, 0, `- ${recvLabel} Limit`, "#f87171", "receive", recvFull);
            // Right (+Give) — vertical
            sxDrawPoleLabelAt(ctx, canvas, cx + r + 9, cy, 90, `+ ${giveLabel}`, "#4ade80", "give", giveFull);
            // Left (-Give Limit) — vertical
            sxDrawPoleLabelAt(ctx, canvas, cx - r - 9, cy, 90, `- ${giveLabel} Limit`, "#f87171", "give", giveFull);

            // 5. Active Puck Position
            const isUnrated = Boolean(state.isUnrated);
            const g = Math.max(-100, Math.min(100, state.give || 0));
            const recvVal = Math.max(-100, Math.min(100, state.receive || 0));
            const px = cx + (g / 100) * r;
            const py = cy - (recvVal / 100) * r; // screen y is inverted

            if (isUnrated) {
                // Unrated ghost prompt
                ctx.beginPath();
                ctx.arc(cx, cy, 7.5, 0, 2 * Math.PI);
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.font = "italic 9px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
                ctx.fillText("Click to rate", cx, cy - 14);
            } else {
                // Puck color
                let puckCol = "#94a3b8";
                if (g === 0 && recvVal === 0) {
                    puckCol = "rgba(255, 255, 255, 0.6)";
                } else if (g >= 0 && recvVal >= 0) {
                    puckCol = "#22c55e"; // Green versatile switch
                } else if (g <= 0 && recvVal <= 0) {
                    puckCol = "#ef4444"; // Red limit
                } else if (g > 0 && recvVal < 0) {
                    puckCol = "#eab308"; // Top yellow
                } else {
                    puckCol = "#3b82f6"; // Bottom blue
                }

                // Glow
                ctx.beginPath();
                ctx.arc(px, py, 11, 0, 2 * Math.PI);
                ctx.fillStyle = puckCol;
                ctx.globalAlpha = 0.35;
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // Puck body
                ctx.beginPath();
                ctx.arc(px, py, 6.5, 0, 2 * Math.PI);
                ctx.fillStyle = puckCol;
                ctx.fill();
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            }
        }

        function sxUpdateSwitchboxReadouts(give, receive, isUnrated = false) {
            const gVal = e.byId("markSwitchboxGiveVal");
            const rVal = e.byId("markSwitchboxRecvVal");
            const roleVal = e.byId("markSwitchboxRoleVal");
            if (isUnrated) {
                if (gVal) gVal.textContent = "Unrated";
                if (rVal) rVal.textContent = "Unrated";
                if (roleVal) roleVal.textContent = "Unrated (click box to rate)";
            } else {
                if (gVal) gVal.textContent = String(Math.round(give));
                if (rVal) rVal.textContent = String(Math.round(receive));
                if (roleVal) roleVal.textContent = sxGetSwitchboxRole(give, receive, sxSwitchboxState.topicId);
            }
        }

        function sxBindSwitchboxWidget() {
            const canvas = e.byId("markSwitchboxCanvas");
            const clearBtn = e.byId("markSwitchboxClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxSwitchboxState.isDragging);

            const updateFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);
                const cx = canvas.width / 2, cy = canvas.height / 2;
                const r = Math.min(cx, cy) - 22;

                // Deadband center snap (within 6px)
                let dx = px - cx, dy = py - cy;
                if (Math.hypot(dx, dy) < 6) {
                    dx = 0; dy = 0;
                }
                const g = Math.max(-100, Math.min(100, Math.round((dx / r) * 100)));
                const recv = Math.max(-100, Math.min(100, Math.round((-dy / r) * 100)));

                sxSwitchboxState.give = g;
                sxSwitchboxState.receive = recv;
                sxSwitchboxState.isUnrated = false;

                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawSwitchboxWidget(canvas, shape, sxSwitchboxState);
                    To(Qr, "give", g, !1);
                    To(Qr, "receive", recv, !1);
                    sxUpdateSwitchboxReadouts(g, recv, false);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                sxSwitchboxState.isDragging = !0;
                try { canvas.setPointerCapture(evt.pointerId); } catch (e) {}
                updateFromPointer(evt);
            });
            canvas.addEventListener("pointermove", (evt) => {
                if (!sxSwitchboxState.isDragging) return;
                updateFromPointer(evt);
            });
            const stopDrag = (evt) => {
                if (sxSwitchboxState.isDragging) {
                    sxSwitchboxState.isDragging = !1;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (e) {}
                    if (Qr) {
                        Mr();
                    }
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        Fo(Qr, "give", !1);
                        Fo(Qr, "receive", !0);
                        sxSwitchboxState.give = 0;
                        sxSwitchboxState.receive = 0;
                        sxSwitchboxState.isUnrated = true;
                        const shape = Ge(Qr);
                        sxDrawSwitchboxWidget(canvas, shape, sxSwitchboxState);
                        sxUpdateSwitchboxReadouts(0, 0, true);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
        }
