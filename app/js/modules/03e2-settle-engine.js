// ---- Hypermap Settle Engine (03e2-settle-engine.js) ----
// Decomposed from 03e-map-paint.js for execution speed & modularity.
// Manages the two-pass layout settle pipeline:
// Pass 1: Node, widget, label, and control obstacle search & seating (sxRunNodeSettle).
// Pass 2: Stem re-anchoring from settled parent/child endpoints (sxFinaliseStems).

let sxSettleBootSlice = performance.now();

// Stem re-anchoring (Build 2026-10-31_0715): two-pass settle,
// fixing displaced stems at the source. Pass 1 is the
// per-group loop below: it seats every icon and writes
// each group's settled centre into data-layout-x/y.
// Pass 2 (sxFinaliseStems, called once after that loop)
// re-emits every tapered stem from the SETTLED centres
// of its parent and child groups, re-calling the same
// emitter (SpokeGeometry.flankPaths / taperedPath) with
// the settled endpoints. A stem's base arc ends up
// centred exactly on the painted parent disc and its
// tip arc exactly on the painted child icon, whatever
// either disc did during settle. No delta is computed
// or applied, no existing d is shifted, no clamp, no
// skip for frozen nodes (a frozen node's settled
// centre is its snapped delivered centre, read from
// its dataset like any other), and no stem is left
// carrying a transform. The stem's radii, widths and
// mode are recovered from its own current path data -
// the emitter's own output - and its colours, opacity
// and tooltip attributes are untouched: only d is
// replaced. Finalisation is NOT gated by the label
// guard above: it runs over every .tapered-stem in the
// layer, whether the stem lives in a node group, in a
// .spoke-underlay-item (addressed by data-spoke-for),
// or was restored from a blit vault / scoped segment.
const sxParseStemD = d => {
    const tokens = String(d || "").match(/[MLAZ]|-?\d*\.?\d+(?:e[+-]?\d+)?/g) || [], pts = [], arcs = [];
    let cmd = "", nums = [];
    const flush = () => {
        if ("M" === cmd || "L" === cmd) for (let i = 0; i + 1 < nums.length; i += 2) pts.push({
            x: nums[i],
            y: nums[i + 1],
            arc: !1
        }); else if ("A" === cmd) for (let i = 0; i + 6 < nums.length; i += 7) {
            const to = {
                x: nums[i + 5],
                y: nums[i + 6],
                arc: !0
            };
            arcs.push({
                r: nums[i],
                sweep: nums[i + 4],
                from: pts.length ? pts[pts.length - 1] : null,
                to: to,
                at: pts.length
            }), pts.push(to);
        }
        nums = [];
    };
    for (const tok of tokens) /^[MLAZ]$/.test(tok) ? (flush(), cmd = tok) : nums.push(Number.parseFloat(tok));
    return flush(), {
        pts: pts,
        arcs: arcs
    };
};

// The spoke-facing centre of an arc: of the two circle
// centres consistent with the chord and radius, the
// sweep flag selects the one the minor arc travels
// around in the sweep direction.
const sxArcCentre = a => {
    if (!a || !a.from || !(a.r > 0)) return null;
    const x1 = a.from.x, y1 = a.from.y, x2 = a.to.x, y2 = a.to.y, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, dd = Math.sqrt(Math.max(0, a.r * a.r - len * len / 4)), px = -dy / len, py = dx / len;
    for (const sgn of [ 1, -1 ]) {
        const c = {
            x: mx + sgn * dd * px,
            y: my + sgn * dd * py
        };
        let delta = (1 === a.sweep ? Math.atan2(y2 - c.y, x2 - c.x) - Math.atan2(y1 - c.y, x1 - c.x) : Math.atan2(y1 - c.y, x1 - c.x) - Math.atan2(y2 - c.y, x2 - c.x)) % (2 * Math.PI);
        if (delta < 0 && (delta += 2 * Math.PI), delta < Math.PI) return c;
    }
    return {
        x: mx + dd * px,
        y: my + dd * py
    };
};

const sxStemChildKey = stem => {
    const host = stem.closest(".spoke-underlay-item"), grp = stem.closest(".node-group");
    return host && host.dataset.spokeFor || grp && grp.dataset.layoutKey || null;
};

const sxReanchorStem = (stem, centres, spokeOld) => {
    const childKey = sxStemChildKey(stem);
    if (!childKey) return;
    const child = centres.get(childKey);
    if (!child) return;
    const rec = sxNodeRegistry[childKey];
    let parent = null;
    const parentKey = rec && (rec.parentId || (rec.branch ? catId(rec.branch) : null));
    if (parentKey && (parent = centres.get(parentKey) || null), !parent && isCatId(childKey)) parent = {
        x: pr.centerX,
        y: pr.centerY
    };
    if (!parent) return;
    const d0 = stem.getAttribute("d");
    if (!d0) return;
    const {pts, arcs} = sxParseStemD(d0);
    if (!pts.length || !arcs.length) return;
    // Both emitters write the tip arc first and the
    // base arc last; a tapered band's round cap (when
    // present) also comes first and is centred on the
    // segment's tip point, not on the icon.
    const firstArc = arcs[0], lastArc = arcs[arcs.length - 1], isFlank = firstArc.at >= 6;
    let tipArc, baseArc;
    if (1 === arcs.length) isFlank ? (tipArc = firstArc, baseArc = null) : firstArc.at >= 4 ? (tipArc = null, baseArc = firstArc) : (tipArc = firstArc, baseArc = null); else tipArc = isFlank || 24 !== firstArc.r ? firstArc : null, baseArc = lastArc;
    const old = spokeOld.get(childKey);
    let Bold = baseArc ? sxArcCentre(baseArc) : old && old.base, Told = tipArc ? sxArcCentre(tipArc) : old && old.tip;
    if (!Bold && old) Bold = old.base;
    if (!Told && old) Told = old.tip;
    if (!Bold || !Told) return;
    const axisLenOld = Math.hypot(Told.x - Bold.x, Told.y - Bold.y);
    if (!(axisLenOld > 1)) return;
    const ux = (Told.x - Bold.x) / axisLenOld, uy = (Told.y - Bold.y) / axisLenOld, nx = -uy, ny = ux, unLen = Math.hypot(child.x - parent.x, child.y - parent.y);
    if (!(unLen > 1)) return;
    const unx = (child.x - parent.x) / unLen, uny = (child.y - parent.y) / unLen, nnx = -uny * Math.sign(nx * -uny + ny * unx || 1), nny = unx * Math.sign(nx * -uny + ny * unx || 1);
    const along = p => (p.x - Bold.x) * ux + (p.y - Bold.y) * uy, off = p => (p.x - Bold.x) * nx + (p.y - Bold.y) * ny;
    if (isFlank) {
        // One flank: every vertex on one side of the
        // centreline; the inner edge sits at the fixed
        // inner half-width (the modal |offset|), the
        // outer edge follows the flare curve.
        const linePts = pts.filter(p => !p.arc);
        if (linePts.length < 13) return;
        // The inner edge is the densest cluster of
        // |offset| values: its points sit at the fixed
        // inner half-width, jittered by path rounding
        // and centre recovery, so cluster by a sliding
        // 0.3-wide window rather than exact buckets
        // (a bucketed count splits the cluster across
        // neighbouring buckets and under-counts it).
        const absOffs = linePts.map(p => Math.abs(off(p))).sort((a2, b2) => a2 - b2);
        let ihI = 0, ihN = 0;
        for (let i2 = 0; i2 < absOffs.length; i2++) {
            let n2 = 0;
            while (i2 + n2 < absOffs.length && absOffs[i2 + n2] - absOffs[i2] <= .3) n2++;
            n2 > ihN && (ihN = n2, ihI = i2);
        }
        if (ihN < 6) return;
        const ih = absOffs[ihI + (ihN >> 1)], inner = linePts.filter(p => Math.abs(Math.abs(off(p)) - ih) < .75);
        if (!inner.length) return;
        const side = Math.sign(inner.reduce((s2, p) => s2 + off(p), 0)) || 1, mode = linePts.slice(0, 4).every(p => Math.abs(Math.abs(off(p)) - ih) < .75) ? "innerFirst" : "outerFirst", A = baseArc ? baseArc.r : Math.min(...inner.map(along)), C = tipArc.r, sAlong = A, eAlong = axisLenOld - C + ("innerFirst" === mode ? 1.5 : 0), span = eAlong - sAlong;
        // A short spoke (length < A + C) trims to a
        // backwards segment (span < 0): the emitter
        // produced it at render time, so re-emit it
        // the same way - the flare fit only needs
        // |span| > 1, and a near-zero span falls back
        // to the max-offset widths below. Never skip.
        // Least-squares flare fit: |offset| - ih =
        // flare(f)/2, flare(f) = tipW + (baseW -
        // tipW) * shape(f), linear in (baseW, tipW).
        let sEE = 0, sET = 0, sTT = 0, sEf = 0, sTf = 0, nFit = 0;
        Math.abs(span) > 1 && linePts.forEach(p => {
            const f = (along(p) - sAlong) / span;
            if (f <= .02 || f >= .98) return;
            const ao = Math.abs(off(p));
            if (ao < ih + 1.5) return;
            const E = Math.exp(-Math.pow(f / 0.72, 2)), T = 1 - E, fl = 2 * (ao - ih);
            sEE += E * E, sET += E * T, sTT += T * T, sEf += E * fl, sTf += T * fl, nFit++;
        });
        let baseW, tipW;
        const det = sEE * sTT - sET * sET;
        if (nFit >= 3 && Math.abs(det) > 1e-9) baseW = (sEf * sTT - sTf * sET) / det, tipW = (sTT ? (sTf - sET * baseW) / sTT : 0); else baseW = 2 * (Math.max(...linePts.map(p => Math.abs(off(p)))) - ih), tipW = 0;
        if (!Number.isFinite(baseW) || !Number.isFinite(tipW)) return;
        const Sx = parent.x + unx * sAlong, Sy = parent.y + uny * sAlong, back = C - ("innerFirst" === mode ? 1.5 : 0), Ex = child.x - unx * back, Ey = child.y - uny * back, res = SpokeGeometry.flankPaths(Sx, Sy, Ex - Sx, Ey - Sy, nnx, nny, baseW, tipW, ih, ih, mode, SpokeGeometry.buildBaseCircle(parent.x, parent.y, A), {
            x: child.x,
            y: child.y,
            r: C
        }), d1 = side * Math.sign(nx * nnx + ny * nny || 1) < 0 ? res.top : res.bottom;
        d1 && d1 !== d0 && stem.setAttribute("d", d1), stem.removeAttribute("transform");
    } else {
        // Single tapered band (Ka's taperedPath): corners
        // sit at +/- width/2 around the centreline
        // segment; widths are linear base -> tip.
        const A = baseArc ? baseArc.r : null, capC = !tipArc && firstArc ? sxArcCentre(firstArc) : null;
        let sAlong, eAlong;
        if (null !== A) sAlong = A; else {
            const b0 = pts[0], b1 = pts[pts.length - 1];
            sAlong = along({
                x: (b0.x + b1.x) / 2,
                y: (b0.y + b1.y) / 2
            });
        }
        if (tipArc) eAlong = axisLenOld - (tipArc.r - 1.5); else if (capC) eAlong = (capC.x - Bold.x) * ux + (capC.y - Bold.y) * uy; else {
            const t0 = pts[1] || pts[0];
            eAlong = along(t0);
        }
        if (!(eAlong - sAlong > 1)) return;
        const b0 = pts[0], b1 = pts[pts.length - 1];
        let w0 = Math.hypot(b0.x - b1.x, b0.y - b1.y);
        if (null !== A && A > 0) {
            const h = w0 / 2;
            h < A && (w0 = 2 * h * A / Math.sqrt(A * A - h * h));
        }
        if (!Number.isFinite(w0) || w0 <= 0) return;
        const Sx = parent.x + unx * sAlong, Sy = parent.y + uny * sAlong, Ex = child.x - unx * (axisLenOld - eAlong), Ey = child.y - uny * (axisLenOld - eAlong), seg = `M ${Sx.toFixed(2)} ${Sy.toFixed(2)} L ${Ex.toFixed(2)} ${Ey.toFixed(2)}`, d1 = SpokeGeometry.taperedPath(seg, w0, 0, tipArc ? SpokeGeometry.buildTipCircle(Sx, Sy, Ex, Ey, 2 * tipArc.r) : null, null !== A ? SpokeGeometry.buildBaseCircle(parent.x, parent.y, A) : null);
        d1 && d1 !== d0 && stem.setAttribute("d", d1), stem.removeAttribute("transform");
    }
};

function* sxFinaliseStems() {
    const centres = new Map();
    const sxCentreGroups = Array.from(In.querySelectorAll("[data-layout-key]"));
    for (let sxCi = 0; sxCi < sxCentreGroups.length; sxCi++) {
        const g = sxCentreGroups[sxCi];
        if (performance.now() - sxSettleBootSlice >= 40) { yield; sxSettleBootSlice = performance.now(); }
        const x = Number.parseFloat(g.dataset.layoutX), y = Number.parseFloat(g.dataset.layoutY);
        Number.isFinite(x) && Number.isFinite(y) && !centres.has(g.dataset.layoutKey) && centres.set(g.dataset.layoutKey, {
            x: x,
            y: y
        });
    }
    // Pre-pass: a spoke's own flank arcs record the
    // render-time parent/child centres; sibling stems
    // of the same spoke (tapered bands) anchor to
    // those when their own d carries no tip circle.
    const spokeOld = new Map();
    const sxStemPass = Array.from(In.querySelectorAll(".tapered-stem"));
    for (let sxSt = 0; sxSt < sxStemPass.length; sxSt++) {
        const stem = sxStemPass[sxSt];
        if (performance.now() - sxSettleBootSlice >= 40) { yield; sxSettleBootSlice = performance.now(); }
        const key = sxStemChildKey(stem), d = stem.getAttribute("d");
        if (!key || !d || spokeOld.has(key)) continue;
        const {arcs} = sxParseStemD(d);
        if (arcs.length < 2 || arcs[0].at < 6) continue;
        const tip = sxArcCentre(arcs[0]), base = sxArcCentre(arcs[arcs.length - 1]);
        tip && base && spokeOld.set(key, {
            tip: tip,
            base: base
        });
    }
    for (let sxSt = 0; sxSt < sxStemPass.length; sxSt++) {
        const stem = sxStemPass[sxSt];
        if (performance.now() - sxSettleBootSlice >= 40) { yield; sxSettleBootSlice = performance.now(); }
        try {
            sxReanchorStem(stem, centres, spokeOld);
        } catch (e) { /* one bad stem never blocks the rest */ }
    }
}

function sxFinaliseAllStems() {
    const sxStemGen = sxFinaliseStems();
    let sxStemStep;
    do { sxStemStep = sxStemGen.next(); } while (!sxStemStep.done);
}
sxStemFinaliseHook = sxFinaliseAllStems;

function sxUpdateOverlapLinks() {
    const e = new Map, t = new Map;
    In.querySelectorAll(".node-group:not(.is-hidden)[data-layout-key]").forEach(n => {
        const i = n.dataset.layoutKey, a = sxNodeRegistry[i], r = Number(n.dataset.layoutX), o = Number(n.dataset.layoutY);
        a && Number.isFinite(r) && Number.isFinite(o) && (t.set(i, {
            x: r,
            y: o
        }), isCatId(i) && e.set(a.branch, {
            x: r,
            y: o
        }));
    }), In.querySelectorAll(".common-overlap-link").forEach(e => {
        if (!e.dataset.topicA) return void (e.dataset.connected = "true");
        const n = t.get(e.dataset.topicA), i = t.get(e.dataset.topicB), a = Boolean(n && i);
        e.dataset.connected = a ? "true" : "false", a ? (e.dataset.ax = n.x.toFixed(2),
        e.dataset.ay = n.y.toFixed(2), e.dataset.bx = i.x.toFixed(2), e.dataset.by = i.y.toFixed(2),
        e.setAttribute("d", sxHubTangentPathText(n, i))) : e.style.display = "none";
    }), sxClipCameraOverlays();
}

function* sxRunNodeSettle(scCtx, blitSess) {
    sxSettleBootSlice = performance.now();
    const {controlGap: t, iconGap: n, startOffset: i, parentOuterMargin: a} = Za.SETTLE, r = [], o = Za.orientedBox, s = e => Za.isClear(e, r);
    const sxBypassSearch = sxSettleDone && !scCtx;
    // Blit session (P3) obstacle continuity: in a
    // continuing session paint the frozen groups are
    // absent from the layer (vault + raster), so
    // their recorded shapes are flushed into the
    // obstacle array at their branch-order positions
    // (blitFlushObstacles) - live nodes keep their
    // frozen obstacles exactly as in a vector paint.
    const blitObst = blitSess && blitSess.swapped && scCtx && blitSameFrozen(scCtx.frozenBranches, blitSess.frozen) ? blitSess : null;
    blitObst && (blitObst.flushIx = 0);
    const sxSettleGroups = Array.from(In.querySelectorAll(".node-group"));
    for (let sxSi = 0; sxSi < sxSettleGroups.length; sxSi++) {
        const l = sxSettleGroups[sxSi];
        if (performance.now() - sxSettleBootSlice >= 40) { yield; sxSettleBootSlice = performance.now(); }
        blitObst && blitFlushObstacles(blitObst, r, o, l.dataset.layoutKey);
        if (l.classList.contains("is-hidden")) continue;
        const c = l.querySelector(".category-label,.map-label"), d = c && c.querySelector("textPath"), u = d && d.getAttribute("href"), p = c && (c.dataset.pathId || u && u.slice(1)), h = p && e.byId(p);
        if (!c || !h) continue;
        const g = h.getTotalLength();
        if (!g) continue;
        const m = e => {
            const t = Math.min(g, Math.max(0, e)), n = h.getPointAtLength(t), i = h.getPointAtLength(Math.max(0, t - 1)), a = h.getPointAtLength(Math.min(g, t + 1)), r = Math.hypot(a.x - i.x, a.y - i.y), o = (a.x - i.x) / Math.max(.001, r), s = (a.y - i.y) / Math.max(.001, r);
            return e > g && (n.x += o * (e - g), n.y += s * (e - g)), {
                point: n,
                x: o,
                y: s
            };
        }, f = h.getPointAtLength(0), y = h.getPointAtLength(Math.min(1, g)), b = (y.x - f.x) / Math.max(.001, Math.hypot(y.x - f.x, y.y - f.y)), v = (y.y - f.y) / Math.max(.001, Math.hypot(y.x - f.x, y.y - f.y)), w = Array.from(l.querySelectorAll(".direction-control")), k = c.classList.contains("category-label"), x = Number.parseFloat(c.dataset.labelOffset || d && d.getAttribute("startOffset")), S = Number.isFinite(x) ? x : i, $ = l.querySelector(".branch-icon,.topic-icon"), E = Number($ && $.dataset.diameter) || 0, A = E / 2;
        let C = c.getComputedTextLength();
        if (k && w.length && E) {
            const e = Math.max(...w.map(e => Number(e.dataset.tagWidth) || 48)), i = g - (A + t + e + a), r = Math.max(48, i - n - A - S);
            C > r && (c.setAttribute("textLength", r.toFixed(2)), c.setAttribute("lengthAdjust", "spacing"),
            C = r);
        }
        const M = l.querySelector(".node-label-underline");
        if (M) {
            const e = -v, t = b, n = Number(M.dataset.offset), i = Number.isFinite(n) ? n : 10, a = Number(c.getAttribute("x")), r = Number(c.getAttribute("y"));
            M.setAttribute("x1", (a + e * i).toFixed(2)), M.setAttribute("y1", (r + t * i).toFixed(2)),
            M.setAttribute("x2", (a + b * C + e * i).toFixed(2)), M.setAttribute("y2", (r + v * C + t * i).toFixed(2));
        }
        // TIGHTNESS FIX (2026-11-18): for a left-pointing
        // (reversed-path) label the startOffset S is
        // measured along the reversed path (icon→hub)
        // and the text ENDS at S (text-anchor=end), so
        // the label's icon-side end in forward
        // (hub→icon) coordinates is g − S + C, not
        // S + C. The old I = S + C seated the icon
        // thousands of units too far out on the left.
        // The label centre P is the same mirror.
        const sxIsReversed = Boolean(u && u.indexOf("#pr-") === 0), sxFs = Number.parseFloat(c.style.fontSize) || 17, sxSixSpace = Math.max(18, 6 * Za.measure(" ", sxFs, "topic"));
        let I = sxIsReversed ? g - S + C : S + C, P = (sxIsReversed ? m(g - S + C / 2) : m(S + C / 2)).point;
        l.dataset.labelX = P.x.toFixed(2), l.dataset.labelY = P.y.toFixed(2);
        const L = !k && !l.classList.contains("imported-child"), T = l.classList.contains("imported-child"), F = l.classList.contains("subcategory-node"), scFrozenNode = Boolean(scCtx && sxNodeRegistry[l.dataset.layoutKey] && scCtx.frozenBranches.has(sxNodeRegistry[l.dataset.layoutKey].branch)), N = L || T ? sxSixSpace : n, _ = Number.parseFloat(l.dataset.iconDistanceOverride), D = F ? g : Number.isFinite(_) ? _ : I + N + A, R = e => {
            // N-POLE WIDGETS (2026-11-18): the widget is tangent to the icon, so when the settle moves the icon outward the widget must follow by the same delta to stay tangent. The delta is the current icon centre minus the design icon centre (zero on the first call, e === D).
            const sxSettleDx = m(e).point.x - m(D).point.x, sxSettleDy = m(e).point.y - m(D).point.y;
            const n = m(e).point, i = E ? e + A + (L ? 6 : t) : I, a = w.map(e => {
                const t = Number(e.dataset.controlScale) || 1, n = Number(e.dataset.tagWidth) || 48, i = Number(e.dataset.tagHeight) || 20, a = Boolean(Nt && Nt.id === l.dataset.layoutKey && Nt.direction === e.dataset.direction);
                // N-POLE WIDGETS (2026-11-18): the on-map n-pole shapes (triangle, tetrad, pentad, hexad, heptad, octad, compass) are drawn by Ka in absolute map coordinates, already tangent to the icon - they are NOT rating tags, so the active-control 320x40 blow-up does not apply; their tagWidth/tagHeight (emitted by Ka) is their true bounding extent, used only for the collision obstacle.
                const sxNpole = ["triangle", "tetrad", "pentad", "hexad", "heptad", "octad", "compass", "quad-compass"].includes(e.dataset.direction);
                return {
                    control: e,
                    scale: t,
                    tagWidth: n,
                    tagHeight: i,
                    width: a && !sxNpole ? 320 * t : n,
                    height: a && !sxNpole ? 40 * t : i
                };
            }), r = a.length ? Math.max(...a.map(e => e.width)) : 0, s = i + r / 2, c = m(s), d = c.x < 0, u = d ? -c.x : c.x, p = d ? -c.y : c.y, h = 180 * Math.atan2(p, u) / Math.PI, g = -p, f = u, y = a.length > 1 ? Math.max(...a.map(e => e.height / 2)) + 4 : 0, b = a.map(e => {
                const t = Number(e.control.dataset.baseCx), n = Number(e.control.dataset.baseCy), i = Number(e.control.dataset.baseAngle) || 0, r = e.control.classList.contains("group-match-control") || 1 === a.length ? 0 : y, s = 0 === Number(e.control.dataset.index) ? 1 : -1, l = c.point.x + g * r * s, d = c.point.y + f * r * s;
                // N-POLE WIDGETS (2026-11-18): Ka already placed the shape tangent to the icon in absolute coordinates; the settle must NOT re-seat it at the tag station (which used the 48-unit default width and put the centroid ~1500 units inside the icon) nor rotate it by the path angle (it is already correctly oriented). Keep the Ka centre and orientation, shifted by the icon's settle delta (sxSettleDx/sxSettleDy) so the widget follows the icon and stays tangent when the icon settles outward; the shape stays as the collision obstacle at that position.
                const sxNpole = ["triangle", "tetrad", "pentad", "hexad", "heptad", "octad", "compass", "quad-compass"].includes(e.control.dataset.direction);
                const sxPx = sxNpole ? t + sxSettleDx : l, sxPy = sxNpole ? n + sxSettleDy : d, sxRot = sxNpole ? 0 : h - i;
                return {
                    ...e,
                    baseCx: t,
                    baseCy: n,
                    px: sxPx,
                    py: sxPy,
                    rotation: sxRot,
                    shape: o(sxPx, sxPy, e.width, e.height, h)
                };
            }), v = [];
            return $ && E && v.push(o(n.x, n.y, E, E)), b.forEach(e => v.push(e.shape)), {
                iconDistance: e,
                iconCenter: n,
                controlsStart: i,
                controlsStationDistance: s,
                controlsOuterEdge: i + r,
                controlPlacements: b,
                shapes: v
            };
        };
        let O = R(D);
        // Scoped solve (T2): the settle search is a
        // paint-stage coupling channel - it re-seats
        // an icon outward along its spoke when its
        // shapes collide with the accumulated boxes
        // of every earlier node in DOM order, so a
        // recompute-set move could otherwise push a
        // frozen node off its delivered position
        // after the freeze replay (and a frozen
        // node's delivered position may itself be a
        // settled one, so simply skipping the search
        // would move it back). While a scope is
        // active, a frozen topic/child whose captured
        // delivered center differs from the un-searched
        // seat is therefore re-seated at that center
        // instead - its along-path distance projected
        // onto this paint's label path, which the
        // freeze replay restored to the delivered
        // line, with the center then snapped to the
        // captured value exactly - and the search
        // never runs for it. A frozen node already
        // at its delivered center keeps the ordinary
        // seat computation untouched. Its shapes
        // still accumulate below as obstacles for
        // the nodes that do recompute.
        // Group 3d (2026-10-27): when this item's
        // auto-shrink is armed, the settle search
        // must not push its seat back out - the
        // search's fixed outward steps overshoot
        // the shrunken seat and can leave the
        // cloud larger than before the shrink
        // (settled xAreaCross rose ~31% on the
        // test branch). Armed items keep their
        // delivered seat D exactly as built.
        let sxArmSeat = !1;
        // HUB SEATING (ruled 2026-11-01, per
        // HUB-SIDE-DIAGNOSIS.md): on the Anneal closing
        // paint only, a category hub group is also
        // snap-eligible: its captured centre is the
        // paintComposition capture's rr.branchAnchor
        // point - the seat closer to the centre avatar
        // - so the hub is seated at the same anchor
        // its icons were composed from, instead of
        // standing at the spliced pre-paint seat the
        // snap never reached. Every other paint keeps
        // the (L || T) gate exactly as before.
        const scCenterPt = scFrozenNode && (L || T || (k && scCtx && "anneal-closing-paint" === scCtx.opClass)) && scCtx.centers ? scCtx.centers.get(l.dataset.layoutKey) : null;
        if (scCenterPt) {
            if (Math.hypot(scCenterPt.x - O.iconCenter.x, scCenterPt.y - O.iconCenter.y) > .011) {
                const scB = (scCenterPt.x - f.x) * b + (scCenterPt.y - f.y) * v;
                Number.isFinite(scB) && (O = R(Math.max(0, scB)), O.iconCenter = {
                    x: scCenterPt.x,
                    y: scCenterPt.y
                });
            }
        } else if (!F && (L || T) && !sxArmSeat && !sxBypassSearch && !s(O.shapes)) {
            const e = Za.settleSearch(L), t = e.step, n = e.attempts;
            for (let e = 1; e <= n; e++) {
                const n = R(D + e * t);
                if (O = n, s(n.shapes)) break;
            }
        }
        const B = O.iconDistance, j = O.iconCenter, q = (O.controlsStart, O.controlsStationDistance);
        if (O.controlsOuterEdge, $ && E && ($.setAttribute("transform", `translate(${(j.x - A).toFixed(2)} ${(j.y - A).toFixed(2)})`),
        l.dataset.layoutX = j.x.toFixed(2), l.dataset.layoutY = j.y.toFixed(2)), O.controlPlacements.forEach(e => {
            const t = e.px - e.baseCx, n = e.py - e.baseCy;
            e.control.setAttribute("transform", `translate(${t.toFixed(2)} ${n.toFixed(2)}) rotate(${e.rotation.toFixed(2)} ${e.baseCx.toFixed(2)} ${e.baseCy.toFixed(2)})`);
        }), L) {
            const e = m(Math.max(0, B - A)).point;
            l.querySelectorAll(":scope > .hanky-midline-outline, :scope > .hanky-midline").forEach(t => {
                "line" === t.tagName.toLowerCase() && (t.setAttribute("x2", e.x.toFixed(2)), t.setAttribute("y2", e.y.toFixed(2)));
            });
        }
        // Stems are NOT touched here: pass 1 seats icons
        // only. Every tapered stem is re-emitted from the
        // settled parent/child centres by sxFinaliseStems
        // after this loop (see the re-anchoring helpers
        // above) - never shifted by a delta.
        if ($ && E) {
            const anchorEnd = B - A - N, endAnchored = !d && "end" === c.getAttribute("text-anchor"), anchorS = anchorEnd - C;
            if (!d && Math.abs(anchorS - S) > .5) {
                const oldPt = m(S).point, newPt = m(anchorS).point, dx = newPt.x - oldPt.x, dy = newPt.y - oldPt.y, cx0 = Number(c.getAttribute("x")), cy0 = Number(c.getAttribute("y"));
                if (Number.isFinite(cx0) && Number.isFinite(cy0)) {
                    c.setAttribute("x", (cx0 + dx).toFixed(2)), c.setAttribute("y", (cy0 + dy).toFixed(2));
                    const trm = /rotate\((-?[\d.]+)[ ,]+(-?[\d.]+)[ ,]+(-?[\d.]+)\)/.exec(c.getAttribute("transform") || "");
                    trm && c.setAttribute("transform", (c.getAttribute("transform") || "").replace(trm[0], `rotate(${trm[1]} ${(cx0 + dx).toFixed(2)} ${(cy0 + dy).toFixed(2)})`));
                }
                if (M) {
                    const mx1 = Number(M.getAttribute("x1")), my1 = Number(M.getAttribute("y1")), mx2 = Number(M.getAttribute("x2")), my2 = Number(M.getAttribute("y2"));
                    Number.isFinite(mx1) && M.setAttribute("x1", (mx1 + dx).toFixed(2)), Number.isFinite(my1) && M.setAttribute("y1", (my1 + dy).toFixed(2)),
                    Number.isFinite(mx2) && M.setAttribute("x2", (mx2 + dx).toFixed(2)), Number.isFinite(my2) && M.setAttribute("y2", (my2 + dy).toFixed(2));
                }
                P = m(anchorS + C / 2).point, l.dataset.labelX = P.x.toFixed(2), l.dataset.labelY = P.y.toFixed(2);
            } else if (d) {
                P = (sxIsReversed ? m(g - S + C / 2) : m(S + C / 2)).point, l.dataset.labelX = P.x.toFixed(2), l.dataset.labelY = P.y.toFixed(2);
            }
        }
        if (r.push(...O.shapes), r.push(o(P.x, P.y, Math.max(24, C), k ? 30 : 22, 180 * Math.atan2(v, b) / Math.PI)),
        !k) {
            const e = Math.min(g, w.length ? q + 2 : B + A);
            if (e < g - 1) {
                const t = h.getAttribute("d"), n = [];
                l.querySelectorAll("path").forEach(e => {
                    e.getAttribute("d") !== t || e.classList.contains("concept-hit") || e.id || n.push(e);
                });
                const i = Math.max(2, Math.min(48, Math.ceil(e / 24))), a = [];
                for (let t = 0; t <= i; t++) a.push(m(e * t / i).point);
                const r = a.map((e, t) => `${t ? "L" : "M"} ${e.x.toFixed(2)} ${e.y.toFixed(2)}`).join(" ");
                n.forEach(e => {
                    e.setAttribute("d", r), e.removeAttribute("stroke-dasharray");
                });
                const o = l.querySelector(".concept-hit");
                o && o.setAttribute("d", r);
            }
        }
        const H = l.querySelector(".hidden-count-badge");
        if (H) {
            const e = Number(H.dataset.width) || 30, t = Number(H.dataset.height) || 24, n = Za.SETTLE.badgeGap, i = k ? Math.max(0, B - A - n - e / 2) : B + A + n + e / 2, a = m(i), r = 180 * Math.atan2(a.y, a.x) / Math.PI;
            if (H.setAttribute("transform", `translate(${(a.point.x - e / 2).toFixed(2)} ${(a.point.y - t / 2).toFixed(2)}) rotate(${r.toFixed(2)} ${(e / 2).toFixed(2)} ${(t / 2).toFixed(2)})`),
            k) {
                const t = Math.max(0, i - e / 2), n = h.getPointAtLength(t), s0 = h.getPointAtLength(Math.min(t, Math.max(0, (ea.spokeStartRadius || 0) - Math.hypot(f.x - pr.centerX, f.y - pr.centerY)))), a = `M ${s0.x.toFixed(2)} ${s0.y.toFixed(2)} L ${n.x.toFixed(2)} ${n.y.toFixed(2)}`;
                l.querySelectorAll(":scope > .topic-stem, :scope > .topic-pulse, :scope > .concept-hit, :scope > .selected-spoke").forEach(e => e.setAttribute("d", a));
            }
        }
        w.forEach(e => l.appendChild(e));
    }
    blitObst && blitFlushObstacles(blitObst, r, o, null);
    yield* sxFinaliseStems();
    sxUpdateOverlapLinks();
}
