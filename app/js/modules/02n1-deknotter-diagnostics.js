        // 02n1-deknotter-diagnostics.js — DeKnotter Diagnostic & Witness Utilities
        // Extracted from 02n-deknotter-cascade.js for modularity, clean maintenance,
        // and reduced token cost. Contains layout math helpers, delivered radii calculations,
        // camera/viewport diagnostics, painted geometry inspectors, and witness frame evaluators.

        export function dkMedian(values) {
            if (!values.length) return null;
            const sorted = values.slice().sort((a, b) => a - b), mid = sorted.length >> 1;
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }

        export function dkRange(values) {
            return values.length ? [ Math.min.apply(null, values), Math.max.apply(null, values) ] : null;
        }

        export const DK_SHRINK_STEPS_FIXED = 7, DK_LADDER_MAX_STAGES = 512;

        export function dkLadderSteps(from, to) {
            if (!Number.isFinite(from) || !Number.isFinite(to) || !(from > to) || !(to > 0)) return 0;
            return DK_SHRINK_STEPS_FIXED;
        }

        export function dkLadderValue(from, to, stage, stages) {
            if (!Number.isFinite(from) || !Number.isFinite(to) || !(from > to)) return from;
            const n = Number.isFinite(stages) && stages > 0 ? Math.floor(stages) : DK_SHRINK_STEPS_FIXED, s = Number.isFinite(stage) ? Math.floor(stage) : 0;
            if (s <= 0) return from;
            if (s >= n) return to;
            let total = 0, cum = 0;
            for (let r = 1; r <= n; r++) total += Math.sqrt(r);
            for (let i = 0; i < s; i++) cum += Math.sqrt(n - i);
            return from - (from - to) * (cum / total);
        }

        export function dkFitDeviationCount(entries) {
            let n = 0;
            return (entries || []).forEach(e => {
                e && "fit-deviation" === e.type && n++;
            }), n;
        }

        export function dkDeliveredItemRadius(item) {
            if (!item) return NaN;
            if (item.child) {
                const ko = mn.kinkOverrides && item.child.id ? mn.kinkOverrides[item.child.id] : null;
                let r = (Number(item.cloudRadius) || Number(item.childCloudRadius) || 270) * (ko && Number(ko.length) > 0 ? Number(ko.length) : 1);
                r = sxLabelClearance(r, item.child.label);
                return r;
            }
            const t = item.topic;
            if (!t) return NaN;
            const est = Za.topicSpokeEstimate(t.label || "", Number(item.cloudRadius) || 0);
            let h = est.spokeLength;
            if (t.isSubcategory) {
                const hubR1 = typeof sxIconRadius === "function" ? sxIconRadius(1) : pr.categoryIcon / 2;
                const hubR2 = typeof sxIconRadius === "function" ? sxIconRadius(2) : pr.subcategoryIcon / 2;
                h = Math.max(h, hubR1 + hubR2 + 96, sxSpokeBase(item.cloudCount, 1)), h = Za.hubSpokeLength(t.label || "", est.fontSize, h, hubR1, hubR2);
                const so = mn.subcatOverrides && mn.subcatOverrides[t.label];
                return h * (so && Number(so.length) > 0 ? Number(so.length) : 1);
            }
            const ko = mn.kinkOverrides && t.id ? mn.kinkOverrides[t.id] : null;
            h = h * (ko && Number(ko.length) > 0 ? Number(ko.length) : 1);
            const hubRadius1 = sxIconRadius(1), leafRadius2 = sxIconRadius(2);
            const fsEst = sxFontSize(2) * 14 / 17;
            const minReqSpoke = hubRadius1 + leafRadius2 + Za.measure(t.label || "", fsEst, "topic") + Math.max(18, 6 * Za.measure(" ", fsEst, "topic")) + 28;
            if (h < minReqSpoke) h = minReqSpoke;
            return h;
        }

        export function dkDeliveredRadii(branchName) {
            const items = {};
            dkFitBranchItems(branchName).forEach(w => {
                items[dkRadialBaseInfo(w).key] = dkDeliveredItemRadius(w);
            });
            const branchObj = h.find(b => b.name === branchName);
            return { items: items, branch: branchObj ? yr(branchObj) : NaN };
        }

        export function dkBranchTaxonomy(branchName) {
            const entry = h.find(b => b.name === branchName);
            if (!entry) return null;
            const subLabels = (entry.subcategories || []).map(s => s.name);
            const kinkIds = [];
            const addTopicId = (t) => {
                if (!t) return;
                const name = typeof t === "object" ? (t.name || t.label || "") : String(t);
                const id = (typeof t === "object" && t.id) || topicIdByLabel[name] || topicIdByLabel[sxName(t)] || null;
                if (id && !kinkIds.includes(id)) kinkIds.push(id);
            };
            (entry.topics || []).forEach(addTopicId);
            (entry.parentTopics || []).forEach(addTopicId);
            (entry.subcategories || []).forEach(s => {
                (s.topics || []).forEach(addTopicId);
            });
            return { entry: entry, subLabels: subLabels, kinkIds: kinkIds, total: kinkIds.length + subLabels.length };
        }

        export function dkBakeGate(report) {
            try {
                const sumNb = o => o ? Object.keys(o).reduce((a, k) => a + (Number(o[k]) || 0), 0) : 0;
                const bkBase = (Number(report.baseline.first) || 0) + sumNb(report.neighbors.baseline), bkFin = (Number(report.finalCloud) || 0) + sumNb(report.neighbors.final);
                report.bakeGate = { metric: "crossingnumber-total", baseline: bkBase, final: bkFin, delta: bkFin - bkBase, limit: SX_SCORE.BAKE_GATE_LIMIT, pass: bkFin - bkBase < SX_SCORE.BAKE_GATE_LIMIT };
            } catch (e) { report.bakeGate = null; }
        }

        export function tallyFitDev(report) {
            return report.phases.reduce((s, p) => s + (p && p.fitDeviationCount || 0), 0);
        }

        export function clearBranchFit(dk, name) {
            Object.keys(dk.fitTargets()).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && dk.clearFitTarget(k);
            });
        }

        export function yieldNow() {
            return new Promise(r => { let done = false; const fin = () => { if (!done) { done = true; r(); } }; requestAnimationFrame(() => requestAnimationFrame(fin)); setTimeout(fin, 60); });
        }

        export function diagRound(v) {
            return null == v || !Number.isFinite(Number(v)) ? null : Math.round(100 * Number(v)) / 100;
        }

        export function diagCameraText(cam, label) {
            return label + ": scale " + (cam && null != cam.scale ? cam.scale : "\u2014") + " \u00b7 translate " + (cam && null != cam.tx ? cam.tx : "\u2014") + ", " + (cam && null != cam.ty ? cam.ty : "\u2014");
        }

        export let witnessFrameSeq = 0;
        export let witnessLastFrame = null;
        export let throwBracketBefore = null;
        export let diagPrePaintHub = null;

        export function resetWitnessState() {
            witnessFrameSeq = 0;
            witnessLastFrame = null;
            throwBracketBefore = null;
            diagPrePaintHub = null;
        }

        export function witnessSubs(radii, dk) {
            const subs = {}, snap = dk.snapshot(), ov = snap && snap.subcatOverrides ? snap.subcatOverrides : {};
            return Object.keys(radii && radii.items || {}).forEach(k => {
                if ("subcat" !== k.split("|")[0]) return;
                const label = k.split("|")[2], d = radii.items[k];
                subs[label] = { d: Number.isFinite(d) ? Math.round(d * 1e4) / 1e4 : null, o: ov[label] && Number(ov[label].length) > 0 ? Number(ov[label].length) : null };
            }), subs;
        }

        export function witnessFrame(event, phase, radii, witnessSubsFn, name, report, dk) {
            const subsFn = witnessSubsFn || witnessSubs;
            const frame = { i: witnessFrameSeq++, event: event, phase: phase || null, subs: subsFn(radii || dkDeliveredRadii(name), dk) };
            return witnessLastFrame = frame, report.witness.frames.length < 600 && report.witness.frames.push(frame), dkLog.push({ type: "witness-frame", event: event, phase: frame.phase, subs: frame.subs }), frame;
        }

        export function witnessRestore(event, phase, witnessSubsFn, name, report, witnessJudgeFn, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP) {
            const before = witnessLastFrame, after = witnessFrame(event, phase, null, witnessSubsFn, name, report, dk);
            return (witnessJudgeFn || witnessJudge)(event, phase, witnessTrippingLabel, before, after, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report);
        }

        export function witnessPaintedFrame(stage, operation, dkPaintedGeometryFn, name, dkPaintedNodeCentreFn, tax, dkPaintedStemSegFn) {
            try {
                const g = (dkPaintedGeometryFn || dkPaintedGeometry)(stage, name, dkPaintedNodeCentreFn || dkPaintedNodeCentre, tax, dkPaintedStemSegFn || dkPaintedStemSeg);
                g.operation = operation || null;
                dkLog.push({ type: "witness-painted-frame", stage: stage, operation: g.operation, source: g.source, blitActive: g.blitActive, subs: g.subs });
                return g;
            } catch (e) { return null; }
        }

        export function diagClosingLines(snap) {
            if (!snap.closingPaint) return [];
            const cp = snap.closingPaint, lines = [ "closing-paint mode: " + cp.mode ];
            lines.push(cp.scopedPaint ? "closing-paint scoped-paint: retained " + cp.scopedPaint.retained + " / captured " + cp.scopedPaint.captured + " / diverged " + cp.scopedPaint.diverged : "closing-paint scoped-paint: no entry");
            lines.push("closing-paint segment-timing: " + (cp.segmentTiming ? "present" : "absent"));
            lines.push(diagCameraText(snap.camera, "camera at DIAG-03"));
            return lines;
        }

        export async function diagPause(code, label, extra, diagAcceptCtx, opts, diagSnapshotFn, report, name, tax, diagCaptureFields) {
            if (!diagAcceptCtx || !opts || "function" != typeof opts.onDiagPause) return;
            const snap = (diagSnapshotFn || diagSnapshot)(code, label, extra, name, tax, diagAcceptCtx, diagCaptureFields);
            (report.diag || (report.diag = [])).push(snap);
            dkLog.push({ type: "anneal-diag", code: code, phase: snap.phase, branch: name, text: snap.text });
            try { console.log("[" + code + "] " + snap.text, snap); } catch (e) {}
            try { await opts.onDiagPause(snap); } catch (e) {}
        }

        export async function throwBracketPoint(code, throwBracketFullPaintFn, throwBracketSnapshotFn, opts, name, dkPaintedNodeCentreFn, tax, report) {
            const stamp = code + ":first-throw";
            const label = "THROW-BEFORE" === code ? "pre-throw full paint \u2192 stepThrow" : "stepThrow \u2192 post-throw full paint";
            const paintInfo = await (throwBracketFullPaintFn || throwBracketFullPaint)(stamp, name, dkPaintedNodeCentreFn || dkPaintedNodeCentre, tax);
            const snap = (throwBracketSnapshotFn || throwBracketSnapshot)(code, label, stamp, paintInfo, name, tax, report);
            if ("THROW-BEFORE" === code) throwBracketBefore = snap;
            if (opts && "function" == typeof opts.onThrowBracketPause) { try { await opts.onThrowBracketPause(snap); } catch (e) {} }
            return snap;
        }

        export async function focusThrowedActiveNode(name) {
            try {
                if (window.sxPaintPromise) {
                    try { await window.sxPaintPromise; } catch (_) {}
                }
                await yieldNow();
                let activeKey = null;
                if (typeof window.__sxGetActiveNodeKey === "function") {
                    activeKey = window.__sxGetActiveNodeKey();
                }
                if (!activeKey) {
                    const svg = document.getElementById("mapSvg");
                    if (svg) {
                        const prev = svg.querySelector(".node-group.is-preview");
                        if (prev && prev.getAttribute("data-layout-key")) {
                            activeKey = prev.getAttribute("data-layout-key");
                        } else {
                            const sel = svg.querySelector(".node-group .selected-spoke, .spoke-underlay-item .selected-spoke");
                            const g = sel ? sel.closest(".node-group, .spoke-underlay-item") : null;
                            if (g) activeKey = g.getAttribute("data-layout-key") || g.getAttribute("data-spoke-for");
                        }
                    }
                }
                if (!activeKey && name) {
                    activeKey = typeof catId === "function" ? catId(name) : name;
                }
                window.__sxNoCameraAnim = true;
                try {
                    if (activeKey && typeof window.__sxFocusNode === "function") {
                        window.__sxFocusNode(activeKey, name);
                    } else if (typeof window.__sxFocusBranch === "function") {
                        window.__sxFocusBranch(name);
                    }
                } finally {
                    setTimeout(() => { window.__sxNoCameraAnim = false; }, 50);
                }
            } catch (_) {}
        }

        export function diagText(snap) {
            const f = v => null == v ? "\u2014" : String(v);
            let t = snap.code + " \u00b7 " + snap.label + " \u00b7 branch " + snap.branch + " \u00b7 phase " + f(snap.phase) + " \u00b7 crossing last-kept " + f(diagRound(snap.crossingBefore)) + " \u2192 tripped " + f(diagRound(snap.crossingAfter)) + " \u00b7 branch delivered radius " + f(snap.storedBranchRadius);
            Object.keys(snap.paintedSubs).forEach(l => { const ps = snap.paintedSubs[l]; t += " \u00b7 " + l + ": seg " + f(ps.seg) + " / abs " + f(ps.absR) + " (stored " + f(snap.storedSubs[l]) + ")"; });
            t += " \u00b7 viewBox " + f(snap.view.viewBox) + " \u00b7 transform " + f(snap.view.sceneTransform || snap.view.transform) + " \u00b7 bbox " + (snap.view.bbox ? snap.view.bbox.x + "," + snap.view.bbox.y + " " + snap.view.bbox.width + "\u00d7" + snap.view.bbox.height : "\u2014") + " \u00b7 " + snap.atChicago + " America/Chicago";
            if (snap.closingLines && snap.closingLines.length) t += "\n" + snap.closingLines.join("\n");
            if (snap.captureLines && snap.captureLines.length) t += "\n" + snap.captureLines.join("\n");
            if (snap.hubLines && snap.hubLines.length) t += "\n" + snap.hubLines.join("\n");
            return t;
        }

        export function witnessFinalJudge(transition, beforeFrame, afterFrame, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) {
            if (!beforeFrame || !afterFrame) return null;
            const flung = [];
            Object.keys(afterFrame.subs).forEach(label => {
                const b = beforeFrame.subs[label], a = afterFrame.subs[label], t = witnessThrown ? witnessThrown[label] : null;
                if (!b || !a || null == b.d || null == a.d || !(b.d > 0)) return;
                a.d > b.d * WITNESS_ONE_STEP && flung.push({ label: label, before: b.d, after: a.d, thrown: t && null != t.d ? t.d : null, overrideBefore: b.o, overrideAfter: a.o, toThrown: !!(t && null != t.d && t.d > 0 && a.d >= t.d * (1 - WITNESS_EPS)) });
            });
            const rec = { transition: transition, flung: flung, wholesale: flung.length > 1 || flung.some(f => f.toThrown) };
            return dkLog.push(Object.assign({ type: "witness-final-transition" }, rec)), rec;
        }

        export function diagCaptureView() {
            const view = { viewBox: null, transform: null, sceneTransform: null, bbox: null };
            try {
                const svg = document.getElementById("mapSvg"), scene = document.getElementById("mapScene"), layer = document.getElementById("mapLayer");
                if (svg) { view.viewBox = svg.getAttribute("viewBox"); view.transform = svg.getAttribute("transform"); }
                if (scene) view.sceneTransform = scene.getAttribute("transform");
                const bbEl = layer || scene;
                if (bbEl && "function" == typeof bbEl.getBBox) { const bb = bbEl.getBBox(); view.bbox = { x: diagRound(bb.x), y: diagRound(bb.y), width: diagRound(bb.width), height: diagRound(bb.height) }; }
            } catch (e) {}
            return view;
        }

        export function witnessJudge(event, phase, trippingLabel, beforeFrame, afterFrame, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report) {
            if (!witnessThrown || !beforeFrame || !afterFrame) return null;
            const wholesale = [], steppedBack = [];
            Object.keys(afterFrame.subs).forEach(label => {
                const b = beforeFrame.subs[label], a = afterFrame.subs[label], t = witnessThrown[label];
                if (!b || !a || !t || null == b.d || null == a.d || null == t.d || !(t.d > 0) || !(b.d < t.d * (1 - WITNESS_EPS))) return;
                const isTrip = null != trippingLabel && label === trippingLabel;
                if (a.d >= t.d * (1 - WITNESS_EPS)) (isTrip && a.d <= b.d * WITNESS_ONE_STEP ? steppedBack : wholesale).push({ label: label, before: b.d, after: a.d, thrown: t.d }); else a.d > b.d * (isTrip ? WITNESS_ONE_STEP : 1.005) && steppedBack.push({ label: label, before: b.d, after: a.d, thrown: t.d });
            });
            const rec = { event: event, phase: phase || null, tripping: trippingLabel || null, wholesale: wholesale, steppedBack: steppedBack, wholesaleDiscard: wholesale.some(w => w.label !== trippingLabel) || wholesale.length > 1 };
            return report.witness.events.push(rec), dkLog.push(Object.assign({ type: "witness-event" }, rec)), rec;
        }

        export function dkPaintedNodeCentre(key) {
            try {
                const el = In.querySelector('.node-group[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)') || In.querySelector('[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)');
                if (!el) return null;
                try {
                    const icon = el.querySelector(":scope > .branch-icon, :scope > .topic-icon");
                    const layerCTM = In.getCTM(), inv = layerCTM && layerCTM.inverse();
                    if (icon && inv) {
                        const dia = Number(icon.dataset.diameter), bb = icon.getBBox();
                        if (bb && bb.width > 0 && bb.height > 0) {
                            const lc = dia > 0 ? { x: dia / 2, y: dia / 2 } : { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }, ctm = icon.getCTM();
                            if (ctm) {
                                const p = new DOMPoint(lc.x, lc.y).matrixTransform(ctm).matrixTransform(inv);
                                if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return { x: p.x, y: p.y, source: "rendered-ctm" };
                            }
                        }
                    }
                } catch (e) {}
                try {
                    const path = el.querySelector(":scope > .topic-stem, :scope > .concept-hit");
                    const d = path && path.getAttribute("d");
                    if (d) {
                        const nums = (String(d).match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number).filter(Number.isFinite);
                        if (nums.length >= 4) {
                            const ex = nums[nums.length - 2], ey = nums[nums.length - 1];
                            if (Number.isFinite(ex) && Number.isFinite(ey)) return { x: ex, y: ey, source: "stem-endpoint" };
                        }
                    }
                } catch (e) {}
                return null;
            } catch (e) { return null; }
        }

        export function dkPaintedStemSeg(key) {
            try {
                const el = In.querySelector('.node-group[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)');
                if (!el) return null;
                const path = el.querySelector(":scope > .topic-stem, :scope > .concept-hit");
                const d = path && path.getAttribute("d");
                if (!d) return null;
                const nums = (String(d).match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number).filter(Number.isFinite);
                if (nums.length < 4) return null;
                const x1 = nums[0], y1 = nums[1], x2 = nums[nums.length - 2], y2 = nums[nums.length - 1];
                const len = Math.hypot(x2 - x1, y2 - y1);
                return Number.isFinite(len) && len > 0 ? Math.round(len * 100) / 100 : null;
            } catch (e) { return null; }
        }

        export function dkPaintedGeometry(stage, name, dkPaintedNodeCentreFn, tax, dkPaintedStemSegFn) {
            const centre = { x: pr.centerX, y: pr.centerY };
            const nodeCentre = dkPaintedNodeCentreFn || dkPaintedNodeCentre;
            const stemSeg = dkPaintedStemSegFn || dkPaintedStemSeg;
            const branchKey = catId(name), branchPt = nodeCentre(branchKey);
            const subs = {};
            tax.subLabels.forEach(l => {
                const key = Un(name, l), pt = nodeCentre(key);
                if (!pt || !branchPt) { subs[l] = { branchR: null, seg: null, absR: null, stemSeg: stemSeg(key), source: pt ? pt.source : "missing" }; return; }
                const r2 = v => Math.round(v * 100) / 100;
                subs[l] = { branchR: r2(Math.hypot(branchPt.x - centre.x, branchPt.y - centre.y)), seg: r2(Math.hypot(pt.x - branchPt.x, pt.y - branchPt.y)), absR: r2(Math.hypot(pt.x - centre.x, pt.y - centre.y)), stemSeg: stemSeg(key), source: pt.source, x: r2(pt.x), y: r2(pt.y) };
            });
            return { stage: stage || null, centre: centre, branchPt: branchPt ? { x: Math.round(branchPt.x * 100) / 100, y: Math.round(branchPt.y * 100) / 100, source: branchPt.source } : null, subs: subs, blitActive: !!blitSess, source: branchPt ? branchPt.source : "missing" };
        }

        export function diagCamera() {
            const cam = { scale: null, tx: null, ty: null };
            try {
                if ("number" == typeof $p && Number.isFinite($p)) cam.scale = $p;
                if ("number" == typeof Ep && Number.isFinite(Ep)) cam.tx = Ep;
                if ("number" == typeof Ap && Number.isFinite(Ap)) cam.ty = Ap;
            } catch (e) {}
            if (null == cam.scale || null == cam.tx || null == cam.ty) try {
                const vp = document.getElementById("viewport"), tr = vp ? vp.getAttribute("transform") : null, m = tr ? /translate\(\s*([-\d.eE+]+)[ ,]+([-\d.eE+]+)\s*\)\s*scale\(\s*([-\d.eE+]+)\s*\)/.exec(tr) : null;
                if (m) { if (null == cam.tx) cam.tx = Number(m[1]); if (null == cam.ty) cam.ty = Number(m[2]); if (null == cam.scale) cam.scale = Number(m[3]); }
            } catch (e) {}
            return { scale: diagRound(cam.scale), tx: diagRound(cam.tx), ty: diagRound(cam.ty) };
        }

        export function diagHubIdentity(name) {
            const out = { matches: 0, exitClone: null, hasTextPath: null };
            try {
                const key = catId(name), all = document.querySelectorAll('[data-layout-key="' + key + '"]');
                out.matches = all.length;
                const grp = document.querySelector('[data-layout-key="' + key + '"]');
                if (grp) {
                    out.exitClone = grp.classList.contains("layout-exit-clone");
                    const lab = grp.querySelector(".category-label");
                    out.hasTextPath = !!(lab && lab.querySelector("textPath"));
                }
            } catch (e) {}
            return out;
        }

        export function witnessPaintedJudge(transition, operation, beforeG, afterG, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) {
            if (!beforeG || !afterG) return null;
            const flung = [];
            Object.keys(afterG.subs || {}).forEach(label => {
                const b = beforeG.subs[label], a = afterG.subs[label], t = witnessThrown ? witnessThrown[label] : null;
                if (!b || !a) return;
                [ "seg", "absR", "branchR" ].forEach(metric => {
                    const bv = b[metric], av = a[metric];
                    if (null == bv || null == av || !(bv > 0)) return;
                    av > bv * WITNESS_ONE_STEP && flung.push({ label: label, metric: metric, before: bv, after: av, thrown: "seg" === metric && t && null != t.d ? t.d : null, toThrown: "seg" === metric && !!(t && null != t.d && t.d > 0 && av >= t.d * (1 - WITNESS_EPS)) });
                });
            });
            const segFlung = flung.filter(f => "seg" === f.metric || "absR" === f.metric);
            const rec = { transition: transition, operation: operation || null, flung: flung, wholesale: segFlung.length > 1 || flung.some(f => f.toThrown) };
            return dkLog.push(Object.assign({ type: "witness-painted-transition" }, rec)), rec;
        }

        export async function throwBracketFullPaint(stamp, name, dkPaintedNodeCentreFn, tax) {
            let preHub = null;
            const nodeCentre = dkPaintedNodeCentreFn || dkPaintedNodeCentre;
            try { const pre = dkPaintedGeometry("throwbracket-pre:" + stamp, name, nodeCentre, tax, dkPaintedStemSeg); preHub = pre ? pre.branchPt : null; } catch (e) {}
            let mode = "skipped-no-capture";
            try {
                const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (cap && cap.branches && cap.branches.size && centres && centres.size) {
                    mode = "freeze-replay";
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-throwbracket-paint-blit-end", e); }
                    scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres }, sgHoldBlitStart = !0;
                    let paintRes = null;
                    try { paintRes = Mr({ animate: !1, forceRepaint: !0, __sxDiagFullPaint: !0 }); } catch (e) { __sxErrLog("layout-throwbracket-paint", e); } finally { scCtx = null, sgHoldBlitStart = !1; }
                    try {
                        if (paintRes && "function" == typeof paintRes.then) await Promise.race([ paintRes, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-throwbracket-paint-blit-end", e); }
                }
            } catch (e) { try { scCtx = null, sgHoldBlitStart = !1; } catch (_) {} }
            return { mode: mode, prePaintHubSeat: preHub };
        }

        export function diagRegistrySnapshot(stamp, ordinal, phaseName, patch, record, now, prevCloud, dk, name, tax, report) {
            const fit = (() => { try { return dk.fitTargets(); } catch (e) { return {}; } })();
            let sec = null;
            try { sec = (dkLastBranches || []).find(s => s && s.entry && s.entry.branch && s.entry.branch.name === name) || null; } catch (e) {}
            const rows = [];
            tax.subLabels.forEach(l => {
                const key = "subcat|" + name + "|" + l;
                let solveR = null;
                try { const t = sec && (sec.topics || []).find(t => t && t.topic && t.topic.isSubcategory && t.topic.label === l); if (t && null != t.cloudRadius) solveR = diagRound(t.cloudRadius); } catch (e) {}
                const ovW = patch && patch.subcatOverrides && patch.subcatOverrides[l] && null != patch.subcatOverrides[l].length ? diagRound(patch.subcatOverrides[l].length) : mn.subcatOverrides && mn.subcatOverrides[l] && null != mn.subcatOverrides[l].length ? diagRound(mn.subcatOverrides[l].length) : null;
                rows.push({ key: key, label: l, fitTargetSet: null != fit[key] ? diagRound(fit[key]) : null, overrideWritten: ovW, solveRadius: solveR, deliveredRadius: diagRound(now && now.items ? now.items[key] : null), composedSegment: diagRound(now && now.items ? now.items[key] : null) });
            });
            const gateTol = null != prevCloud && null != record.cloud && Number.isFinite(prevCloud) && Number.isFinite(record.cloud) ? SX_SCORE.GATE_TOL : null;
            const gate = { prev: diagRound(prevCloud), cloud: diagRound(record.cloud), tolerance: diagRound(gateTol), threshold: null != gateTol && null != prevCloud ? diagRound(prevCloud + gateTol) : null, verdict: null == gateTol || null == record.cloud ? "n/a" : record.cloud > prevCloud + gateTol ? "trip" : "pass" };
            let onsetReading = null;
            try { const m = "function" == typeof window.__sxCrossingMeasure ? window.__sxCrossingMeasure() : null, v = m && m.clouds ? Number(m.clouds[name]) : NaN; onsetReading = Number.isFinite(v) ? diagRound(v) : null; } catch (e) {}
            const onsetBase = report.onset && null != report.onset.baseline ? report.onset.baseline : null;
            const onset = { baseline: diagRound(onsetBase), reading: onsetReading, margin: null, verdict: "n/a" };
            const entry = { type: "registry-snapshot", stageStamp: stamp, runPhaseOrdinal: ordinal, phase: phaseName, branch: name, cloud: diagRound(record.cloud), gate: gate, onset: onset, subs: rows };
            record.registrySnapshot = entry, (report.registrySnapshots || (report.registrySnapshots = [])).push(entry), dkLog.push(entry);
            return entry;
        }

        export async function diagOnDemandPaint(stamp, paintOrdinal, phaseName, name, dkPaintedNodeCentreFn, tax, report) {
            let preHub = null;
            const nodeCentre = dkPaintedNodeCentreFn || dkPaintedNodeCentre;
            try { const pre = dkPaintedGeometry("ondemand-pre:" + stamp, name, nodeCentre, tax, dkPaintedStemSeg); preHub = pre ? pre.branchPt : null; } catch (e) {}
            let mode = "skipped-no-capture";
            try {
                const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (cap && cap.branches && cap.branches.size && centres && centres.size) {
                    mode = "freeze-replay";
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-ondemand-paint-blit-end", e); }
                    scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres }, sgHoldBlitStart = !0;
                    let paintRes = null;
                    try { paintRes = Mr({ animate: !1, forceRepaint: !0, __sxDiagFullPaint: !0 }); } catch (e) { __sxErrLog("layout-ondemand-paint", e); } finally { scCtx = null, sgHoldBlitStart = !1; }
                    try {
                        if (paintRes && "function" == typeof paintRes.then) await Promise.race([ paintRes, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-ondemand-paint-blit-end", e); }
                }
            } catch (e) { try { scCtx = null, sgHoldBlitStart = !1; } catch (_) {} }
            let painted = null;
            try { painted = dkPaintedGeometry("ondemand:" + stamp, name, nodeCentre, tax, dkPaintedStemSeg); } catch (e) {}
            const stored = dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera(), subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { subs[l] = { seg: painted.subs[l].seg, absR: painted.subs[l].absR, stored: diagRound(stored.items ? stored.items["subcat|" + name + "|" + l] : null) }; });
            const rec = { type: "ondemand-full-paint", stageStamp: stamp, runPhaseOrdinal: paintOrdinal, phase: phaseName, branch: name, mode: mode, opClass: "anneal-closing-paint", bbox: view.bbox, viewBox: view.viewBox, storedBranchRadius: diagRound(stored.branch), paintedBranchPt: painted ? painted.branchPt : null, branchRadius: painted && painted.branchPt ? diagRound(Math.hypot(painted.branchPt.x - pr.centerX, painted.branchPt.y - pr.centerY)) : null, subs: subs, prePaintHubSeat: preHub, camera: cam, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            (report.onDemandPaints || (report.onDemandPaints = [])).push(rec), dkLog.push(rec);
            try { console.log("[ANNEAL-ONDEMAND-PAINT] " + stamp + " \u00b7 " + phaseName + " \u00b7 mode " + mode + " \u00b7 bbox " + (view.bbox ? view.bbox.width + "\u00d7" + view.bbox.height : "\u2014"), rec); } catch (e) {}
            return rec;
        }

        export function diag00Capture(pre, name, tax, report, snapshot) {
            const stamp = "ANNEAL-DIAG-00:pre-run:ord-0", r2 = diagRound;
            const painted = (() => { try { return dkPaintedGeometry(stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { return null; } })();
            const stored = pre || dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera();
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = r2(stored.items[k]); });
            const branches = [];
            h.forEach(b => {
                const btax = dkBranchTaxonomy(b.name), pt = (() => { try { return dkPaintedNodeCentre(catId(b.name)); } catch (e) { return null; } })(), pts = [], bsubs = {};
                if (pt) pts.push(pt);
                (btax ? btax.subLabels : []).forEach(l => { const sp = (() => { try { return dkPaintedNodeCentre(Un(b.name, l)); } catch (e) { return null; } })(); if (sp) { pts.push(sp); bsubs[l] = { x: r2(sp.x), y: r2(sp.y), absR: r2(Math.hypot(sp.x - pr.centerX, sp.y - pr.centerY)) }; } });
                let bb = null;
                if (pts.length) { const xs = pts.map(p => p.x), ys = pts.map(p => p.y); bb = { x: r2(Math.min.apply(null, xs)), y: r2(Math.min.apply(null, ys)), width: r2(Math.max.apply(null, xs) - Math.min.apply(null, xs)), height: r2(Math.max.apply(null, ys) - Math.min.apply(null, ys)) }; }
                branches.push({ branch: b.name, hubPt: pt ? { x: r2(pt.x), y: r2(pt.y), source: pt.source } : null, hubRadius: pt ? r2(Math.hypot(pt.x - pr.centerX, pt.y - pr.centerY)) : null, nodeCentreBBox: bb, subs: bsubs });
            });
            let fieldCount = 0; const perBranchCounts = {}, captureItems = {}, captureLines = [];
            try {
                const allNames = new Set(h.map(b => b.name)), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (centres && centres.captureFields) {
                    fieldCount = centres.captureFields.size;
                    centres.captureFields.forEach((fld, k) => { if (fld && fld.branch) perBranchCounts[fld.branch] = (perBranchCounts[fld.branch] || 0) + 1; if (fld && fld.branch === name) captureItems[k] = fld; });
                }
            } catch (e) {}
            captureLines.push("capture fields at DIAG-00 (paintComposition, all branches): " + (fieldCount ? fieldCount + " items captured \u00b7 " + Object.keys(captureItems).length + " on this branch \u00b7 per-branch " + Object.keys(perBranchCounts).map(bn => bn + " " + perBranchCounts[bn]).join(", ") : "unavailable"));
            Object.keys(subs).forEach(l => {
                const f = Object.keys(captureItems).map(k => captureItems[k]).find(v => v && "subcat" === v.kind && v.label === l), cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5);
                f && captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
            });
            const snapOverrides = snapshot ? { branch: snapshot.branchOverrides || null, subcat: snapshot.subcatOverrides || null, kinkCount: snapshot.kinkOverrides ? Object.keys(snapshot.kinkOverrides).length : 0, kink: snapshot.kinkOverrides || null } : null;
            const provLine = "pre-run override provenance: branch override length " + (snapOverrides && snapOverrides.branch && snapOverrides.branch[name] && null != snapOverrides.branch[name].length ? snapOverrides.branch[name].length : "\u2014") + " \u00b7 subcat overrides " + (snapOverrides && snapOverrides.subcat ? tax.subLabels.map(l => l + " " + (snapOverrides.subcat[l] && null != snapOverrides.subcat[l].length ? snapOverrides.subcat[l].length : "\u2014")).join(", ") : "\u2014") + " \u00b7 kink override entries " + (snapOverrides ? snapOverrides.kinkCount : "\u2014") + " \u00b7 preDelivered branch " + r2(stored.branch);
            const hid = diagHubIdentity(name), hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
            const snap = { code: "ANNEAL-DIAG-00", label: "pre-run painted-geometry snapshot \u2014 saved layout, before the cascade", stage: stamp, branch: name, phase: null, crossingBefore: null, crossingAfter: null, storedBranchRadius: r2(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: view, camera: cam, branches: branches, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, captureItems: captureItems, snapshotOverrides: snapOverrides, preDelivered: { branch: r2(stored.branch), items: stored.items || {} }, hubIdentity: hid, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.captureLines = captureLines;
            snap.hubLines = [ "painted hub (paintedBranchPt): " + (snap.paintedBranchPt ? hf(snap.paintedBranchPt.x) + ", " + hf(snap.paintedBranchPt.y) + " \u00b7 radius " + hubR(snap.paintedBranchPt) + " \u00b7 source " + (snap.paintedBranchPt.source || "\u2014") : "\u2014"), "hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") ];
            snap.extraLines = [ "per-branch bbox decomposition (node centres, stage " + stamp + "): " + branches.map(b => b.branch + " hub radius " + (null != b.hubRadius ? b.hubRadius : "\u2014") + " \u00b7 centre extent " + (b.nodeCentreBBox ? b.nodeCentreBBox.width + "\u00d7" + b.nodeCentreBBox.height + " @ " + b.nodeCentreBBox.x + "," + b.nodeCentreBBox.y : "\u2014")).join(" \u00b7 "), provLine, diagCameraText(cam, "camera at DIAG-00") ];
            snap.text = diagText(snap) + "\n" + snap.extraLines.join("\n") + "\n" + captureLines.join("\n") + "\n" + snap.hubLines.join("\n");
            (report.diag || (report.diag = [])).push(snap), report.diag00 = snap;
            dkLog.push({ type: "anneal-diag", code: "ANNEAL-DIAG-00", stage: stamp, phase: null, branch: name, text: snap.text });
            dkLog.push({ type: "diag00-snapshot", stage: stamp, branch: name, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, branches: branches, view: view, camera: cam });
            try { console.log("[ANNEAL-DIAG-00] " + snap.text, snap); } catch (e) {}
            return snap;
        }

        export function throwBracketSnapshot(code, label, stamp, paintInfo, name, tax, report, snapshot) {
            const r2 = diagRound, hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
            const painted = (() => { try { return dkPaintedGeometry(stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { return null; } })();
            const stored = dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera();
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = r2(stored.items[k]); });
            const branches = [];
            h.forEach(b => {
                const btax = dkBranchTaxonomy(b.name), pt = (() => { try { return dkPaintedNodeCentre(catId(b.name)); } catch (e) { return null; } })(), pts = [], bsubs = {};
                if (pt) pts.push(pt);
                (btax ? btax.subLabels : []).forEach(l => { const sp = (() => { try { return dkPaintedNodeCentre(Un(b.name, l)); } catch (e) { return null; } })(); if (sp) { pts.push(sp); bsubs[l] = { x: r2(sp.x), y: r2(sp.y), absR: r2(Math.hypot(sp.x - pr.centerX, sp.y - pr.centerY)) }; } });
                let bb = null;
                if (pts.length) { const xs = pts.map(p => p.x), ys = pts.map(p => p.y); bb = { x: r2(Math.min.apply(null, xs)), y: r2(Math.min.apply(null, ys)), width: r2(Math.max.apply(null, xs) - Math.min.apply(null, xs)), height: r2(Math.max.apply(null, ys) - Math.min.apply(null, ys)) }; }
                branches.push({ branch: b.name, hubPt: pt ? { x: r2(pt.x), y: r2(pt.y), source: pt.source } : null, hubRadius: pt ? r2(Math.hypot(pt.x - pr.centerX, pt.y - pr.centerY)) : null, nodeCentreBBox: bb, subs: bsubs });
            });
            let fieldCount = 0; const perBranchCounts = {}, captureItems = {}, captureLines = [];
            try {
                const allNames = new Set(h.map(b => b.name)), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (centres && centres.captureFields) {
                    fieldCount = centres.captureFields.size;
                    centres.captureFields.forEach((fld, k) => { if (fld && fld.branch) perBranchCounts[fld.branch] = (perBranchCounts[fld.branch] || 0) + 1; if (fld && fld.branch === name) captureItems[k] = fld; });
                }
            } catch (e) {}
            captureLines.push("capture fields at " + code + " (paintComposition, all branches): " + (fieldCount ? fieldCount + " items captured \u00b7 " + Object.keys(captureItems).length + " on this branch \u00b7 per-branch " + Object.keys(perBranchCounts).map(bn => bn + " " + perBranchCounts[bn]).join(", ") : "unavailable"));
            Object.keys(subs).forEach(l => {
                const f = Object.keys(captureItems).map(k => captureItems[k]).find(v => v && "subcat" === v.kind && v.label === l), cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5);
                f && captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
            });
            const snapOverrides = snapshot ? { branch: snapshot.branchOverrides || null, subcat: snapshot.subcatOverrides || null, kinkCount: snapshot.kinkOverrides ? Object.keys(snapshot.kinkOverrides).length : 0 } : null;
            const liveOv = { branch: mn.branchOverrides && mn.branchOverrides[name] && null != mn.branchOverrides[name].length ? r2(mn.branchOverrides[name].length) : null, subcat: {} };
            tax.subLabels.forEach(l => { liveOv.subcat[l] = mn.subcatOverrides && mn.subcatOverrides[l] && null != mn.subcatOverrides[l].length ? r2(mn.subcatOverrides[l].length) : null; });
            const provLine = code + " override provenance: pre-run (snapshot) branch override length " + (snapOverrides && snapOverrides.branch && snapOverrides.branch[name] && null != snapOverrides.branch[name].length ? snapOverrides.branch[name].length : "\u2014") + " \u00b7 pre-run subcat overrides " + (snapOverrides && snapOverrides.subcat ? tax.subLabels.map(l => l + " " + (snapOverrides.subcat[l] && null != snapOverrides.subcat[l].length ? snapOverrides.subcat[l].length : "\u2014")).join(", ") : "\u2014") + " \u00b7 live branch override length at " + code + " " + hf(liveOv.branch) + " \u00b7 live subcat overrides " + tax.subLabels.map(l => l + " " + hf(liveOv.subcat[l])).join(", ");
            let R = null;
            try { R = eaBase.photoRadius * centerRingScale(); } catch (e) {}
            const tr = report.throwRadii, throwLines = [];
            if ("THROW-BEFORE" === code) throwLines.push("throw inputs (pre-throw, read-only): center-avatar radius " + hf(R) + " \u00b7 branch target " + hf(null != R ? R * SX_SCORE.THROW_BRANCH : null) + " (" + SX_SCORE.THROW_BRANCH + "\u00d7R delivered from centre) \u00b7 subcat target " + hf(null != R ? R * SX_SCORE.THROW_SUBCAT : null) + " (" + SX_SCORE.THROW_SUBCAT + "\u00d7R delivered segment from branch node) \u00b7 delivered before: branch " + hf(stored.branch) + " \u00b7 subcat stored " + tax.subLabels.map(l => l + " " + hf(storedSubs[l])).join(", "));
            else throwLines.push("throw inputs (committed by stepThrow): center-avatar radius " + hf(tr ? tr.centerRadius : R) + " \u00b7 branch target " + hf(tr ? tr.branchTarget : null) + " \u00b7 subcat target " + hf(tr ? tr.subcatTarget : null) + " \u00b7 override lengths committed: branch " + hf(tr ? tr.branchLength : null) + " \u00b7 subcats " + (tr ? tax.subLabels.map(l => l + " " + hf(tr.subcatLengths ? tr.subcatLengths[l] : null)).join(", ") : "\u2014") + " \u00b7 not converted: " + (tr && tr.subcatNotConverted && tr.subcatNotConverted.length ? tr.subcatNotConverted.join(", ") : "none") + " \u00b7 delivered after: branch " + hf(stored.branch) + " \u00b7 subcat stored " + tax.subLabels.map(l => l + " " + hf(storedSubs[l])).join(", "));
            const deltaLines = [];
            let deltas = null;
            if ("THROW-AFTER" === code && throwBracketBefore) {
                const b = throwBracketBefore, dSubs = {};
                Object.keys(subs).forEach(l => { const bs = b.paintedSubs ? b.paintedSubs[l] : null; if (bs) dSubs[l] = { segBefore: bs.seg, segAfter: subs[l].seg, segDelta: null != bs.seg && null != subs[l].seg ? r2(subs[l].seg - bs.seg) : null, absBefore: bs.absR, absAfter: subs[l].absR, absDelta: null != bs.absR && null != subs[l].absR ? r2(subs[l].absR - bs.absR) : null }; });
                deltas = { branchRadiusBefore: b.storedBranchRadius, branchRadiusAfter: r2(stored.branch), branchRadiusDelta: null != b.storedBranchRadius ? r2(stored.branch - b.storedBranchRadius) : null, subs: dSubs };
                deltaLines.push("throw effect (THROW-AFTER \u2212 THROW-BEFORE): branch delivered radius " + hf(b.storedBranchRadius) + " \u2192 " + hf(stored.branch) + " (\u0394 " + hf(deltas.branchRadiusDelta) + ")" + Object.keys(dSubs).map(l => " \u00b7 " + l + ": seg " + hf(dSubs[l].segBefore) + " \u2192 " + hf(dSubs[l].segAfter) + " (\u0394 " + hf(dSubs[l].segDelta) + ") / abs " + hf(dSubs[l].absBefore) + " \u2192 " + hf(dSubs[l].absAfter) + " (\u0394 " + hf(dSubs[l].absDelta) + ")").join(""));
            }
            const hid = diagHubIdentity(name);
            const hubLines = [ "painted hub (paintedBranchPt): " + (painted && painted.branchPt ? hf(painted.branchPt.x) + ", " + hf(painted.branchPt.y) + " \u00b7 radius " + hubR(painted.branchPt) + " \u00b7 source " + (painted.branchPt.source || "\u2014") : "\u2014"), "hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") ];
            const snap = { code: code, label: label, stage: stamp, branch: name, phase: null, crossingBefore: null, crossingAfter: null, storedBranchRadius: r2(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: view, camera: cam, branches: branches, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, captureItems: captureItems, snapshotOverrides: snapOverrides, liveOverrides: liveOv, hubIdentity: hid, paintMode: paintInfo ? paintInfo.mode : null, prePaintHubSeat: paintInfo ? paintInfo.prePaintHubSeat : null, throwRadii: tr || null, deltas: deltas, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.extraLines = [ "per-branch bbox decomposition (node centres, stage " + stamp + "): " + branches.map(b => b.branch + " hub radius " + (null != b.hubRadius ? b.hubRadius : "\u2014") + " \u00b7 centre extent " + (b.nodeCentreBBox ? b.nodeCentreBBox.width + "\u00d7" + b.nodeCentreBBox.height + " @ " + b.nodeCentreBBox.x + "," + b.nodeCentreBBox.y : "\u2014")).join(" \u00b7 "), provLine, diagCameraText(cam, "camera at " + code), "bracket paint mode: " + snap.paintMode + " \u00b7 opClass anneal-closing-paint" ];
            snap.captureLines = captureLines, snap.hubLines = hubLines, snap.throwLines = throwLines, snap.deltaLines = deltaLines;
            snap.text = diagText(snap) + "\n" + snap.extraLines.join("\n") + "\n" + throwLines.join("\n") + (deltaLines.length ? "\n" + deltaLines.join("\n") : "");
            (report.diag || (report.diag = [])).push(snap), (report.throwBracket || (report.throwBracket = {}))["THROW-BEFORE" === code ? "before" : "after"] = snap;
            dkLog.push({ type: "anneal-diag", code: code, stage: stamp, phase: null, branch: name, text: snap.text });
            dkLog.push({ type: "throw-bracket", code: code, stage: stamp, branch: name, paintMode: snap.paintMode, storedBranchRadius: snap.storedBranchRadius, paintedBranchPt: snap.paintedBranchPt, subs: subs, storedSubs: storedSubs, branches: branches, view: view, camera: cam, throwRadii: tr || null, deltas: deltas });
            try { console.log("[" + code + "] " + snap.text, snap); } catch (e) {}
            return snap;
        }

        export function diagSnapshot(code, label, extra, name, tax, diagAcceptCtx, diagCaptureFields) {
            const stored = dkDeliveredRadii(name);
            let painted = null;
            try { painted = dkPaintedGeometry("diag:" + code, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { painted = null; }
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = diagRound(stored.items[k]); });
            const snap = { code: code, label: label, branch: name, phase: diagAcceptCtx ? diagAcceptCtx.phase : null, crossingBefore: diagAcceptCtx ? diagAcceptCtx.crossingBefore : null, crossingAfter: diagAcceptCtx ? diagAcceptCtx.crossingAfter : null, storedBranchRadius: diagRound(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: diagCaptureView(), atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.closingPaint = null, snap.camera = null, snap.closingLines = [];

            snap.captureItems = null, snap.captureLines = [];
            if ("ANNEAL-DIAG-03" === code) {
                const cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5), items = {};
                if (diagCaptureFields) diagCaptureFields.forEach((fld, k) => { fld && fld.branch === name && (items[k] = fld); });
                snap.captureItems = items;
                snap.captureLines.push("capture fields at the capture moment: " + (diagCaptureFields ? diagCaptureFields.size + " items captured \u00b7 " + Object.keys(items).length + " on this branch" : "unavailable"));
                Object.keys(subs).forEach(l => {
                    const f = Object.keys(items).map(k => items[k]).find(v => v && "subcat" === v.kind && v.label === l);
                    f && snap.captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
                });
            }

            snap.hubSeat = null, snap.hubLines = [];
            try {
                const hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
                if ("ANNEAL-DIAG-02" === code && painted && painted.branchPt) diagPrePaintHub = painted.branchPt;
                let pathLen = null, iconOv = null;
                try {
                    const grp = document.querySelector('[data-layout-key="' + catId(name) + '"]'), lab = grp && grp.querySelector(".category-label"), pel = lab && lab.dataset.pathId ? document.getElementById(lab.dataset.pathId) : null;
                    if (pel && "function" == typeof pel.getTotalLength) pathLen = pel.getTotalLength();
                    if (grp) iconOv = grp.dataset.iconDistanceOverride;
                } catch (e) {}
                let secInfo = null;
                try {
                    const sec = (dkLastBranches || []).find(s => s && s.entry && s.entry.branch && s.entry.branch.name === name);
                    if (sec) {
                        const anch = rr.branchAnchor(sec), bov = mn.branchOverrides && mn.branchOverrides[name];
                        secInfo = { angle: diagRound(sec.angle), overrideLength: bov && null != bov.length ? diagRound(bov.length) : null, spokeAdjust: diagRound(Number(sec.entry.branch._spokeAdjust20) || 0), anchorRadius: anch ? diagRound(Math.hypot(anch.x - pr.centerX, anch.y - pr.centerY)) : null };
                    }
                } catch (e) {}
                snap.hubSeat = { painted: snap.paintedBranchPt, prePaint: diagPrePaintHub, labelPathLength: diagRound(pathLen), iconDistanceOverride: null == iconOv ? null : iconOv, sector: secInfo };
                snap.hubLines.push("painted hub (paintedBranchPt): " + (snap.paintedBranchPt ? hf(snap.paintedBranchPt.x) + ", " + hf(snap.paintedBranchPt.y) + " \u00b7 radius " + hubR(snap.paintedBranchPt) + " \u00b7 source " + (snap.paintedBranchPt.source || "\u2014") : "\u2014"));
                snap.hubLines.push("pre-paint hub seat (at DIAG-02): " + (diagPrePaintHub ? hf(diagPrePaintHub.x) + ", " + hf(diagPrePaintHub.y) + " \u00b7 radius " + hubR(diagPrePaintHub) : "\u2014"));
                snap.hubLines.push("hub label path: length " + hf(pathLen) + " \u00b7 data-icon-distance-override " + (null == iconOv ? "\u2014" : iconOv));
                try { const hid = diagHubIdentity(name); snap.hubIdentity = hid; snap.hubLines.push("hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") + " \u00b7 settle scCenterPt-vs-presnap delta \u2014 (settle-internal; not readable at this pause)"); } catch (e) {}
                snap.hubLines.push("closing solve sector: angle " + (secInfo ? hf(secInfo.angle) : "\u2014") + " \u00b7 yr inputs: branch override " + (secInfo ? hf(secInfo.overrideLength) : "\u2014") + " \u00b7 _spokeAdjust20 " + (secInfo ? hf(secInfo.spokeAdjust) : "\u2014") + " \u00b7 anchor radius " + (secInfo ? hf(secInfo.anchorRadius) : "\u2014"));
            } catch (e) {}
            if (extra) {
                snap.closingPaint = { mode: String(extra.mode || "ordinary"), scopedPaint: extra.scopedPaint ? { retained: extra.scopedPaint.retained, captured: extra.scopedPaint.captured, diverged: extra.scopedPaint.diverged } : null, segmentTiming: !!extra.segmentTiming };
                snap.camera = diagCamera();
                snap.closingLines = diagClosingLines(snap);
            }
            snap.text = diagText(snap);
            return snap;
        }
