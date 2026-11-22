        /* --- Widget approachability: one shared pole-label system (T5/T6/T3/T7) ---
           Every polygon widget except the triangle draws its pole names
           the same way: rotated to the tangent of the circumscribing
           circle at the vertex (tangent = vertex angle + 90°, normalised
           to (-90, 90] so no label is ever upside-down), centred 13px out
           from the vertex along the vertex direction, in one font (bold
           9px system-ui). A long name slides along that tangent to stay
           on the canvas; it steps inward only when the tangent cannot
           save it. The triangle keeps horizontal labels outside its
           vertices. Each drawn label is recorded on canvas.__sxLabelRects
           (axis-aligned box + angle + pole key + full name) for the
           canvas hover hit-test (seam B). */
        const SX_POLE_LABEL_FONT = "bold 9px system-ui, sans-serif";
        const SX_POLE_LABEL_OFFSET = 13;
        function sxNormTangentDeg(deg) {
            let d = deg;
            while (d > 90) d -= 180;
            while (d <= -90) d += 180;
            return d;
        }
        function sxRecordPoleLabelRect(canvas, text, x, y, w, h, angleDeg, key, name, ax, ay, tw, th) {
            if (!canvas || !text) return;
            if (!canvas.__sxLabelRects) canvas.__sxLabelRects = [];
            canvas.__sxLabelRects.push({
                text: text,
                name: name || text,
                x: Math.round(x * 10) / 10,
                y: Math.round(y * 10) / 10,
                w: Math.round(w * 10) / 10,
                h: Math.round(h * 10) / 10,
                angle: Math.round(angleDeg * 10) / 10,
                key: key || "",
                /* Rotated hit-test frame: anchor + unrotated half-extents.
                   The axis-aligned box above is the clamp/probe record; the
                   hit test uses the true rotated shape so long steep labels
                   don't claim the whole canvas. Defaults = the box itself. */
                ax: (ax !== undefined ? Math.round(ax * 10) / 10 : Math.round((x + w / 2) * 10) / 10),
                ay: (ay !== undefined ? Math.round(ay * 10) / 10 : Math.round((y + h / 2) * 10) / 10),
                tw: (tw !== undefined ? Math.round(tw * 10) / 10 : Math.round(w * 10) / 10),
                th: (th !== undefined ? Math.round(th * 10) / 10 : Math.round(h * 10) / 10)
            });
        }
        function sxDrawPoleLabelAt(ctx, canvas, ax, ay, angleDeg, text, color, key, name, radialRad, maxWidth) {
            if (!ctx || !canvas || !text) return;
            const W = canvas.width, H = canvas.height;
            const theta = (angleDeg * Math.PI) / 180;
            ctx.save();
            ctx.font = SX_POLE_LABEL_FONT;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // A name longer than the gap to the next pole wraps, and the
            // extra lines stack outward so they stay on their own slot.
            let lines = [text];
            if (maxWidth > 0 && ctx.measureText(text).width > maxWidth) lines = sxWrapPoleLines(ctx, text, maxWidth);
            // Hot List only: the pole's number is the last line of the
            // same rotated label, so it sits under the name. A canvas
            // without the map (placard, popup) draws the name alone.
            const sxNum = canvas.__sxPoleValMap && key != null ? canvas.__sxPoleValMap[key] : null;
            if (sxNum) lines.push(String(sxNum));
            const lineH = 11;
            const tw = Math.max.apply(null, lines.map(l => ctx.measureText(l).width).concat([1]));
            const th = lines.length * lineH;
            if (lines.length > 1 && typeof radialRad === "number") {
                const extra = (lines.length - 1) * lineH / 2;
                ax += Math.cos(radialRad) * extra;
                ay += Math.sin(radialRad) * extra;
            }
            const c = Math.abs(Math.cos(theta)), s = Math.abs(Math.sin(theta));
            const bw = tw * c + th * s, bh = tw * s + th * c;
            const pad = 2;
            if (typeof radialRad === "number") {
                // Stay on the circumcircle. Slide along the tangent first
                // so a long name moves sideways around the rim. Only the
                // leftover, the part the tangent cannot fix, steps inward.
                const ux = Math.cos(radialRad), uy = Math.sin(radialRad);
                const tx = -uy, ty = ux;
                const overflow = (x, y) => ({
                    dx: x < bw / 2 + pad ? bw / 2 + pad - x : x > W - bw / 2 - pad ? W - bw / 2 - pad - x : 0,
                    dy: y < bh / 2 + pad ? bh / 2 + pad - y : y > H - bh / 2 - pad ? H - bh / 2 - pad - y : 0
                });
                let corr = overflow(ax, ay);
                const slide = corr.dx * tx + corr.dy * ty;
                ax += tx * slide;
                ay += ty * slide;
                corr = overflow(ax, ay);
                const inward = corr.dx * ux + corr.dy * uy;
                if (inward < 0) { ax += ux * inward; ay += uy * inward; }
                corr = overflow(ax, ay);
                ax += corr.dx;
                ay += corr.dy;
            } else {
                ax = Math.max(bw / 2 + pad, Math.min(W - bw / 2 - pad, ax));
                ay = Math.max(bh / 2 + pad, Math.min(H - bh / 2 - pad, ay));
            }
            ctx.translate(ax, ay);
            ctx.rotate(theta);
            ctx.fillStyle = color;
            // Line 0 sits at the top of the rotated text, so the name
            // reads in order. The block center was already shifted outward.
            lines.forEach((ln, i) => {
                ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * lineH);
            });
            ctx.restore();
            sxRecordPoleLabelRect(canvas, lines.join(" "), ax - bw / 2, ay - bh / 2, bw, bh, angleDeg, key, name, ax, ay, tw, th);
        }
        function sxDrawPoleLabel(ctx, canvas, vx, vy, angleRad, text, color, key, name, nPoles, radius) {
            if (!ctx || !canvas || !text) return;
            const tangentDeg = sxNormTangentDeg((angleRad * 180) / Math.PI + 90);
            const dx = Math.cos(angleRad), dy = Math.sin(angleRad);
            const labelR = (Number(radius) || 0) + SX_POLE_LABEL_OFFSET;
            const slot = nPoles >= 3 && labelR > 0 ? Math.max(36, labelR * 2 * Math.PI / nPoles * 0.82) : 0;
            sxDrawPoleLabelAt(ctx, canvas, vx + dx * SX_POLE_LABEL_OFFSET, vy + dy * SX_POLE_LABEL_OFFSET, tangentDeg, text, color, key, name || text, angleRad, slot);
        }
        function sxPoleLabels(shape, n) {
            // Label, else pole key, else "" — never a "Pole N" fallback (T7).
            const out = [];
            for (let k = 0; k < n; k++) {
                out.push((shape && shape.labels && shape.labels[k]) || (shape && shape.keys && shape.keys[k]) || "");
            }
            return out;
        }
        function sxShortAxisWord(label) {
            // "X-Axis (Give / Electron-Pair Donor)" -> "X-Axis"; a plain
            // verb like "overpower" passes through unchanged (T4/T2).
            const s = String(label || "");
            if (!s) return "";
            const cut = s.indexOf(" (");
            return (cut >= 0 ? s.slice(0, cut) : s).trim();
        }
        function sxShortRoleWord(label, fallback) {
            // Parenthetical last word: "X-Axis (Give / Electron-Pair
            // Donor)" -> "Donor"; plain "Give"/"Receive" -> "Giver"/"Receiver".
            const s = String(label || "");
            if (!s) return fallback;
            const m = /\(([^)]*)\)\s*$/.exec(s);
            const inner = m ? m[1] : s;
            const parts = inner.split("/").map(x => x.trim()).filter(Boolean);
            const last = parts.length ? parts[parts.length - 1] : inner;
            const words = last.split(/\s+/).filter(Boolean);
            const w = words.length ? words[words.length - 1] : fallback;
            if (/^give$/i.test(w)) return "Giver";
            if (/^receive$/i.test(w)) return "Receiver";
            return w;
        }
        function sxSwitchboxRoleWords(topicId) {
            // Short role words from the topic's own labels; the classic
            // Sexcapades names apply only on the Sexcapades skin (T2).
            const classic = !window.__SX_ACTIVE_SKIN || window.__SX_ACTIVE_SKIN === "sexcapades";
            let g = "Giver", r = "Receiver";
            if (topicId && typeof Ge === "function") {
                const shape = Ge(topicId);
                if (shape && shape.labels) {
                    if (shape.labels[0]) g = sxShortRoleWord(shape.labels[0], "Giver");
                    if (shape.labels[1]) r = sxShortRoleWord(shape.labels[1], "Receiver");
                }
            }
            return { g: g, r: r, classic: classic };
        }
        function sxSetSwitchboxQuadrants(topicId) {
            const words = sxSwitchboxRoleWords(topicId);
            const names = words.classic
                ? { tl: "Bottom / Receiver", tr: "Versatile Switch", bl: "Hard Red Limit", br: "Top / Giver" }
                : { tl: words.r + " only", tr: "Both " + words.g + " + " + words.r, bl: "Neither (limit)", br: words.g + " only" };
            const set = (cls, text) => {
                const el = document.querySelector("#markSwitchboxWrap " + cls + " .mark-quad-name");
                if (el) el.textContent = text;
            };
            set(".mark-quad-tl", names.tl);
            set(".mark-quad-tr", names.tr);
            set(".mark-quad-bl", names.bl);
            set(".mark-quad-br", names.br);
        }
        function sxPoleLine(topicId, key) {
            // One pole's "Label — text" line. Skin-registered topics come
            // first (loader); Sexcapades give/receive uses the custom
            // wording where it exists (Ge labels are the topic's own verbs,
            // e.g. "overpower" / "be overpowered"), else the ruled
            // "Give — <topic> / Receive — <topic>" form (Q2).
            if (!topicId || !key) return null;
            if (typeof window.__SX_POLE_LINE_FOR === "function") {
                const line = window.__SX_POLE_LINE_FOR(topicId, key);
                if (line) return line;
            }
            if (typeof Ge === "function") {
                const shape = Ge(topicId);
                if (key === "give" || key === "receive") {
                    const idx = key === "give" ? 0 : 1;
                    const verb = shape && shape.labels && shape.labels[idx];
                    if (verb && verb !== "give" && verb !== "receive") return (key === "give" ? "Give — " : "Receive — ") + verb;
                    let name = "";
                    const rec = (typeof qn !== "undefined" && qn[topicId]) || null;
                    if (rec) name = rec.label || rec.name || "";
                    if (!name) {
                        const t = e.byId("markMenuTitle");
                        if (t) name = t.textContent.replace(/\s*\(tray\)\s*$/i, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
                    }
                    return (key === "give" ? "Give — " : "Receive — ") + (name || topicId);
                }
                if (shape && shape.keys && shape.labels) {
                    const idx = shape.keys.indexOf(key);
                    if (idx !== -1 && shape.labels[idx]) return shape.labels[idx];
                    if (shape.poleKeys) {
                        const pIdx = shape.poleKeys.indexOf(key);
                        if (pIdx !== -1 && shape.labels[pIdx]) return shape.labels[pIdx];
                    }
                }
            }
            return null;
        }
        function sxSetPoleTip(el, topicId, key) {
            if (!el) return;
            const line = sxPoleLine(topicId, key);
            if (line) {
                el.setAttribute("data-ui-tooltip", line);
                const sep = line.indexOf(" — ");
                const name = sep !== -1 ? line.slice(0, sep).trim() : (el.textContent?.trim() || key);
                const def = sep !== -1 ? line.slice(sep + 3).trim() : line;
                el.setAttribute("data-tooltip-name", name);
                el.setAttribute("data-tooltip-definition", def);
                el.setAttribute("data-tooltip-tap-first", "");
                el.dataset.ratingTooltip = line;
            } else {
                el.removeAttribute("data-ui-tooltip");
                el.removeAttribute("data-tooltip-name");
                el.removeAttribute("data-tooltip-definition");
                el.removeAttribute("data-tooltip-tap-first");
                delete el.dataset.ratingTooltip;
            }
        }
        function sxSetMeterLine(wrap, topicId) {
            // T9: label the intensity slider with the metered word, from
            // the skin JSON (per-skin default word, per-topic override).
            // Suppress the redundant "What this measures: ..." line.
            if (!wrap) return;
            const existingLine = wrap.querySelector(":scope > .sx-meter-line");
            if (existingLine) existingLine.remove();

            const word = (typeof window.__SX_METER_FOR_TOPIC === "function") ? window.__SX_METER_FOR_TOPIC(topicId) : null;
            const labelText = word ? (word.charAt(0).toUpperCase() + word.slice(1)) : "Intensity";

            // Update any slider label in this wrap or the dialog stage
            const labels = wrap.querySelectorAll(".mark-tri-slider-label");
            labels.forEach(l => { l.textContent = labelText; });
            const directLabel = wrap.querySelector(".mark-tri-slider-label");
            if (!directLabel) {
                // If wrap is parent container or dialog, search within it
                const stageLabels = document.querySelectorAll("#hotListWidgetDialog .mark-tri-slider-label, #markMenu .mark-tri-slider-label");
                stageLabels.forEach(l => {
                    if (wrap.contains(l)) l.textContent = labelText;
                });
            }
        }
        function sxHitPoleLabel(canvas, evt) {
            const rects = canvas.__sxLabelRects;
            if (!rects || !rects.length) return null;
            const rect = canvas.getBoundingClientRect();
            const px = (evt.clientX - rect.left) * (canvas.width / rect.width);
            const py = (evt.clientY - rect.top) * (canvas.height / rect.height);
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                if (!Number.isFinite(r.ax) || !Number.isFinite(r.ay) || !Number.isFinite(r.tw) || !Number.isFinite(r.th)) continue;
                // Point in the label's own (rotated) frame: rotate the
                // offset by -angle, then test against the unrotated box.
                const theta = ((r.angle || 0) * Math.PI) / 180;
                const dx = px - r.ax, dy = py - r.ay;
                const c = Math.cos(-theta), s = Math.sin(-theta);
                const lx = dx * c - dy * s, ly = dx * s + dy * c;
                if (Math.abs(lx) <= r.tw / 2 + 2 && Math.abs(ly) <= r.th / 2 + 2) return r;
            }
            return null;
        }
        function sxBindPoleHover(canvas, getDragging) {
            // Seam B: hovering a canvas pole label shows that pole's line;
            // hovering empty canvas shows nothing. Skipped while dragging.
            if (!canvas || canvas.dataset.poleHoverBound) return;
            canvas.dataset.poleHoverBound = "1";
            canvas.addEventListener("pointermove", (evt) => {
                if ((getDragging && getDragging()) || typeof window.__SX_TIP_SHOW !== "function") return;
                const hit = sxHitPoleLabel(canvas, evt);
                if (!hit) {
                    if (typeof window.__SX_TIP_HIDE === "function") window.__SX_TIP_HIDE();
                    return;
                }
                // The popup canvas carries its own hover topic (set fresh
                // on every open); placard canvases never set it and keep
                // resolving via Qr, the placard's current topic.
                const line = sxPoleLine(canvas.__sxHoverTopicId || Qr, hit.key);
                if (line) window.__SX_TIP_SHOW(canvas, hit.name || hit.text, line, evt.clientX, evt.clientY);
                else if (typeof window.__SX_TIP_HIDE === "function") window.__SX_TIP_HIDE();
            });
            canvas.addEventListener("pointerleave", () => {
                if (typeof window.__SX_TIP_HIDE === "function") window.__SX_TIP_HIDE();
            });
        }

        function sxGetTriVertices(width, height) {
            // Pole 0 (Red, bottom-left), Pole 1 (Green, top center / middle position), Pole 2 (Blue, bottom-right)
            // Label margins (2026-11-18, placard triad fix): the triangle
            // sits INSIDE the canvas with room left OUTSIDE it for
            // horizontal pole labels — a band above the top vertex and a
            // two-line band below the base — so no label ever runs
            // diagonally along an edge, cramped against the fill.
            // Regular N-gon ruling (2026-11-19): the triangle is
            // EQUILATERAL — one uniform scale on both axes, the same
            // discipline the tetrad/radar widgets get from their circle
            // geometry. (The old fractional-x vertices made a tall
            // isosceles: on the 240px popup canvas the sides measured
            // 167px against a 110px base.) The side is set by whichever
            // of the label-banded height or the canvas width runs out
            // first, and the triangle is centred in what remains.
            const top = 36, bottom = 46, sidePad = 16;
            const availH = Math.max(0, height - top - bottom);
            let side = availH * 2 / Math.sqrt(3);
            const maxSide = Math.max(0, width - 2 * sidePad);
            if (side > maxSide) side = maxSide;
            const triH = side * Math.sqrt(3) / 2;
            const apexY = top + (availH - triH) / 2;
            const baseY = apexY + triH;
            const cx = width / 2, half = side / 2;
            return {
                V0: { x: cx - half, y: baseY },
                V1: { x: cx, y: apexY },
                V2: { x: cx + half, y: baseY }
            };
        }

        function sxPointToBarycentric(px, py, V0, V1, V2) {
            const det = (V1.y - V2.y) * (V0.x - V2.x) + (V2.x - V1.x) * (V0.y - V2.y);
            if (Math.abs(det) < 1e-5) return { w0: 1 / 3, w1: 1 / 3, w2: 1 / 3 };
            let w0 = ((V1.y - V2.y) * (px - V2.x) + (V2.x - V1.x) * (py - V2.y)) / det;
            let w1 = ((V2.y - V0.y) * (px - V2.x) + (V0.x - V2.x) * (py - V2.y)) / det;
            let w2 = 1 - w0 - w1;
            w0 = Math.max(0, w0);
            w1 = Math.max(0, w1);
            w2 = Math.max(0, w2);
            const sum = w0 + w1 + w2;
            if (sum > 0) {
                w0 /= sum;
                w1 /= sum;
                w2 /= sum;
            } else {
                w0 = 1 / 3; w1 = 1 / 3; w2 = 1 / 3;
            }
            return { w0, w1, w2 };
        }

        function sxWrapPoleLines(ctx, text, maxWidth) {
            // Break on spaces only. A single long word stays whole so a
            // name is never cut mid-letter just to fit the slot.
            const words = String(text || "").split(/\s+/).filter(Boolean);
            if (!words.length) return [""];
            if (ctx.measureText(words.join(" ")).width <= maxWidth) return [words.join(" ")];
            const lines = [];
            let cur = "";
            words.forEach(w => {
                const trial = cur ? cur + " " + w : w;
                if (ctx.measureText(trial).width <= maxWidth || !cur) cur = trial;
                else { lines.push(cur); cur = w; }
            });
            if (cur) lines.push(cur);
            return lines;
        }
        function sxWrapLabelLines(ctx, text, maxWidth) {
            // Greedy word wrap at the shared pole-label font; a single
            // over-long word is hard-split so it can never overflow.
            const words = String(text || "").split(/\s+/).filter(Boolean);
            const lines = [];
            let cur = "";
            const pushWord = (w) => {
                while (ctx.measureText(w).width > maxWidth && w.length > 1) {
                    let cut = 1;
                    while (cut < w.length && ctx.measureText(w.slice(0, cut + 1)).width <= maxWidth) cut++;
                    lines.push(w.slice(0, cut));
                    w = w.slice(cut);
                }
                if (w) {
                    const trial = cur ? cur + " " + w : w;
                    if (ctx.measureText(trial).width <= maxWidth || !cur) cur = trial;
                    else { lines.push(cur); cur = w; }
                }
            };
            words.forEach(pushWord);
            if (cur) lines.push(cur);
            return lines.length ? lines : [""];
        }
        function sxDrawTriPoleLabel(ctx, canvas, cx, cy, text, color, key, maxWidth, above) {
            // Horizontal exterior triad label (2026-11-18): never rotated,
            // never along an edge. `above` stacks the wrapped block so it
            // ends just above the vertex; otherwise it starts just below
            // it. The block is centred on the vertex x, clamped to its
            // own half of the canvas, and recorded as one axis-aligned
            // rect (angle 0) for the hover hit-test.
            if (!ctx || !canvas || !text) return;
            ctx.save();
            ctx.font = SX_POLE_LABEL_FONT;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const lines = sxWrapLabelLines(ctx, text, Math.max(30, maxWidth));
            const sxNum = canvas.__sxPoleValMap && key != null ? canvas.__sxPoleValMap[key] : null;
            if (sxNum) lines.push(String(sxNum));
            const lineH = 11;
            const blockW = Math.max.apply(null, lines.map(l => ctx.measureText(l).width).concat([1]));
            const half = blockW / 2;
            const ccx = Math.max(half + 3, Math.min(canvas.width - half - 3, cx));
            const blockH = lines.length * lineH;
            const topY = above ? (cy - 14 - blockH) : (cy + 14);
            ctx.fillStyle = color;
            lines.forEach((ln, i) => {
                ctx.fillText(ln, ccx, topY + i * lineH + lineH / 2);
            });
            ctx.restore();
            sxRecordPoleLabelRect(canvas, lines.join(" "), ccx - half, topY, blockW, blockH, 0, key, text, ccx, topY + blockH / 2, blockW, blockH);
        }


        // Signed-intensity model (2026-11-19, Jason's ruling): for the
        // radar/tetrad families the intensity of a pole vector is its
        // strongest value WITH its sign — negative intensity is aversion
        // to the topic as a whole, while the proportions (each value over
        // the signed intensity) describe the blend. Draws render the
        // proportions at the widget's fixed frame, so sweeping intensity
        // rescales the stored numbers without moving the shape.
        function sxSignedIntensity(vals) {
            let best = 0;
            for (let i = 0; i < vals.length; i++) {
                const v = Number(vals[i]) || 0;
                if (Math.abs(v) > Math.abs(best)) best = v;
            }
            return best;
        }
        // Triad intensity, matching the placard's derivation: the sign of
        // the sum carried on the magnitude of the absolute sum, so a
        // mixed-sign vector keeps its magnitude when the sum cancels.
        function sxTriSignedIntensity(vals) {
            let sum = 0, sumAbs = 0;
            for (let i = 0; i < vals.length; i++) {
                const v = Number(vals[i]) || 0;
                sum += v; sumAbs += Math.abs(v);
            }
            if (!sumAbs) return 0;
            return sum < 0 ? -sumAbs : sumAbs;
        }
        // (n+1) intensity (Jason, 2026-11-19). The pole numbers are the
        // leanings. `intensity` on the rating object is the extra number:
        // relevance, signed, negative meaning aversion to the topic as a
        // whole. Missing on old ratings: seed it from today's derivation
        // (compass = sum, triad = signed absolute sum, radar = signed
        // strongest) so the slider still reads the number it read before.
        // The slider writes only this field. Scoring reads this number
        // as relevance and does not fold it back into the poles.
        function sxFamilyOf(shape) {
            if (!shape || shape.single) return null;
            const widget = shape.widget || "";
            if (widget === "xy-switchbox" || widget === "monopole-slider" || widget === "trilinear-sliders") return null;
            if (widget === "quad-compass") return "compass";
            if (widget === "triangle" || shape.triangle) return "triad";
            const n = (shape.keys || []).length;
            if (n >= 4 || shape.tetrad || shape.pentad || shape.hexad || shape.heptad || shape.octad) return "radar";
            if (n === 3) return "triad";
            return null;
        }
        function sxDerivedFromVals(vals, family) {
            if (family === "compass") {
                let s = 0;
                for (let i = 0; i < vals.length; i++) s += Number(vals[i]) || 0;
                return Math.round(s);
            }
            if (family === "triad") return Math.round(sxTriSignedIntensity(vals));
            return Math.round(sxSignedIntensity(vals));
        }
        function sxPersistIntensity(topicId, value, profileId) {
            const v = Math.max(-400, Math.min(400, Math.round(Number(value) || 0)));
            To(topicId, "intensity", v, !1, profileId || null);
            return v;
        }
        function sxWidenIntensitySlider(slider, value) {
            if (!slider) return;
            const lim = Math.max(100, Math.abs(Math.round(Number(value) || 0)));
            slider.min = String(-lim);
            slider.max = String(lim);
            slider.value = String(Math.round(Number(value) || 0));
        }
        // Brightness ramps with |intensity| up to full at ±100. Zero is
        // the dim don't-care floor. Negative uses each channel's complement.
        function sxIntensityRGB(r, g, b, intensity) {
            const v = Number(intensity) || 0;
            const mag = Math.min(1, Math.abs(v) / 100);
            const br = 0.28 + 0.72 * mag;
            let R = r, G = g, B = b;
            if (v < 0) { R = 255 - r; G = 255 - g; B = 255 - b; }
            return "rgb(" + Math.round(R * br) + "," + Math.round(G * br) + "," + Math.round(B * br) + ")";
        }
        const sxIntensitySeeded = new Set;
        function sxSeedProfileIntensities(profileId) {
            if (!profileId || sxIntensitySeeded.has(profileId) || typeof vt === "undefined" || !vt[profileId]) return;
            sxIntensitySeeded.add(profileId);
            const bag = vt[profileId];
            Object.keys(bag).forEach(topicId => {
                const raw = bag[topicId];
                if (!raw || typeof raw !== "object" || Object.prototype.hasOwnProperty.call(raw, "intensity")) return;
                // Line topics have no widget family below; their
                // derivation is the stance's own size, so seed |line|
                // and a line topic carries its (n+1) like any other.
                if (Number.isFinite(Number(raw.line))) {
                    sxPersistIntensity(topicId, Math.abs(Number(raw.line)), profileId);
                    return;
                }
                const shape = Ge(topicId, profileId);
                const family = sxFamilyOf(shape);
                if (!family) return;
                const keys = shape.keys || [];
                const rec = ca(topicId, profileId);
                if (!keys.some(k => rec[k + "Known"])) return;
                const vals = keys.map(k => rec[k + "Known"] ? rec[k] : 0);
                sxPersistIntensity(topicId, sxDerivedFromVals(vals, family), profileId);
            });
        }
        function sxAdoptIntensity(state, rec, derived, slider, sliderOut, topicId, profileId) {
            let intensity;
            if (rec && rec.intensityKnown) intensity = Math.round(Number(rec.intensity) || 0);
            else {
                intensity = Math.round(Number(derived) || 0);
                if (intensity && topicId) sxPersistIntensity(topicId, intensity, profileId);
            }
            if (state) state.intensity = intensity;
            sxWidenIntensitySlider(slider, intensity);
            if (sliderOut) sliderOut.textContent = String(Math.round(intensity));
            return intensity;
        }
