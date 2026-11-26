        function sxPauseMapPaint(e, t = "rendering problem") {
            window.__sxLoad && window.__sxLoad(-1);
            jn = !0, On = null, Tn && (Tn.textContent = `The hypermap hit a ${t}. Your open profile is unchanged.`),
            Ln && (Ln.hidden = !1), console.error("Map paused safely.", e);
        }
        // Item 11 (Build 2026-10-16_1909) made the tuned layout the default
        // for the unrated map view only; Build 2026-10-16_1957 makes the
        // tuned set the global default for every map state, rated or not,
        // so all maps share one geometry and stay directly comparable.
        // While the session has no explicit layout control - no layout-*
        // URL params at load (see the bootstrap in index.html), and the live
        // settings still match what this block last applied, so
        // layout-editor changes disengage it - the reconciler at the top of
        // Mr still tracks the profile state (the app's own empty-map test:
        // no named profiles) on every render, but both states now resolve
        // to the same tuned set, so loading a profile no longer switches
        // the layout back to the old compact defaults. The profile-state
        // detection itself is unchanged and remains available for other
        // features; it just no longer picks different layout values.
        const layoutAutoTuned = {
            spacing: "airy",
            stagger: !0,
            expandAll: !0,
            collision: "grow",
            crossmin: !1,
            nudge: !1,
            spokeLen: 2.6,
            subLen: 1.2,
            pad: 1.4,
            repulsion: 0,
            repulsionEnabled: !1
        }, layoutAutoDefaults = {
            spacing: "airy",
            stagger: !0,
            expandAll: !0,
            collision: "grow",
            crossmin: !1,
            nudge: !1,
            spokeLen: 2.6,
            subLen: 1.2,
            pad: 1.4,
            repulsion: 0,
            repulsionEnabled: !1
        }, layoutAutoKeys = [ "spacing", "stagger", "expandAll", "collision", "crossmin", "nudge", "spokeLen", "subLen", "pad", "repulsion", "repulsionEnabled", "subcatOverrides", "kinkOverrides", "subcatAngleOffsets", "kinkAngleOffsets", "branchSpokeAutoShrink", "subcatSpokeAutoShrink" ];
        let layoutAutoMode = !window.__SEXCAPADES_LAYOUT_FROM_URL, layoutAutoState = "unrated", layoutAutoValues = layoutAutoTuned;
        function layoutAutoSync() {
            if (!layoutAutoMode) return;
            const e = Object.keys(wt).length ? "rated" : "unrated";
            if (e === layoutAutoState) return;
            if (!layoutAutoKeys.every(e => mn[e] === layoutAutoValues[e])) return void (layoutAutoMode = !1);
            const t = "unrated" === e ? layoutAutoTuned : layoutAutoDefaults;
            Object.assign(mn, t), layoutAutoState = e, layoutAutoValues = t, rn.clear(), on.clear(), 
            h.forEach(e => {
                rn.add(e.name), mn.expandAll && ((e.subcategories || []).forEach(t => on.add(sxResolveSubcategoryId(e.name, t.name))), 
                e.topics.forEach(e => on.add(sxResolveTopicId(e))));
            });
        }
        /* Flexcapades skin switch: the solver's expanded-branch set (rn) and
           per-node visibility modes (un) are keyed by category NAME / node
           ID and are populated from the taxonomy at boot / on profile
           select (see ji() in 02o). A skin swap changes the names and IDs,
           so the new ones must be registered here or frBuildTree skips
           every topic of an unregistered branch as collapsed
           (`if (!En && !o && !s) return;`) and hides every unrated topic
           behind the default "rated" visibility mode (`fi()` falls back
           to "rated" for unknown branch IDs — a fresh skin has no ratings
           yet, so its branches must start at "all"). The loader calls this
           before re-rendering; it mirrors ji()'s expansion pass and runs
           regardless of layout-auto mode. Collapse / visibility state is
           not preserved across a switch (all branches come back expanded
           and "all", as on a profile select).
           Known-topic set Ke (2026-11-16 fix): Ke is the import path's
           "is this a real topic" gate (applyProfileRatings drops any
           rating whose id is in neither Ke nor the subcategories), and
           it is populated ONCE at boot from the Sexcapades taxonomy
           (02o). A skin swap left it holding only Sexcapades ids, so
           every imported rating for a vanilla skin was silently
           dropped — archetype loads landed 0 ratings and pair matches
           came back blank, while Sexcapades archetypes (ids already in
           Ke) loaded fine. Re-register the new skin's ids here,
           alongside rn/on/un. Additive only, never cleared, so
           imported-children ids and the other skins' ids survive a
           switch (Ke is append-only by design; a stale id from another
           skin is still a real topic id, not an unknown key). */
        window.__SX_SKIN_LAYOUT_SYNC = function () {
            try {
                rn.clear(), on.clear();
                h.forEach(e => {
                    const n = catId(e.name);
                    Ke.add(n), un.set(n, "all"), rn.add(e.name), (e.subcategories || []).forEach(t => {
                        const i = sxResolveSubcategoryId(e.name, t.name);
                        Ke.add(i), un.set(i, "all"), on.add(i);
                    }), e.topics.forEach(t => {
                        const n = sxResolveTopicId(t);
                        Ke.add(n), un.set(n, "all"), on.add(n);
                    });
                });
                if (typeof sxSyncRoleLabels === "function") sxSyncRoleLabels();
                if (typeof sxSyncTopicGlyphs === "function") sxSyncTopicGlyphs();
            } catch (_) {}
        };
        /* Flexcapades skin switch: re-fit the camera to the new map. A plain
           Mr() deliberately keeps the user's zoom/pan (only the boot arm
           re-fits), so without this the smaller Chem map would sit tiny
           inside the Sexcapades fit — and restoring would leave Sexcapades
           cropped. Same call profile select makes (Ih() in 02o). */
        window.__SX_SKIN_REFIT = function () {
            try { sxApplyMapFit(); } catch (_) {}
        };
        // Ownership note (map-render refactor, finding 15): the
        // center-node global metric total (#metricMapGlobal) is NOT
        // computed or updated anywhere in this bundle - it is owned
        // by the shell's inline metric script in index.html
        // (showMetricGlobal / markMetricGlobalStale / clearMetricGlobal
        // / syncMetricGlobalVisibility / positionMetricOverlay). The
        // split is deliberate and documented at that side too; do not
        // look for the total's owner here.
        // One-shot chunked-paint arm (map-render refactor): the
        // Boot-stall fix (mechanism 2): set by Mr() for the boot paint
        // only (see the sxBootArm assignment there); Ar()'s no-profile
        // early return skips itself while this is true, so the boot
        // paint always paints the map.
        let sxBootPaint = !1;
        // boot, route-entry, and list-close triggers each arm one
        // window flag with a budget; this consumes the first armed
        // flag (boot, then route, then close, so an earlier arm
        // leaves a later arm armed for the next render), clamps
        // the budget to the ruled 25-50 ms range, and deletes the
        // flag as the paint starts. An arm is never consumed while
        // an editor chunked paint is in flight, so no later render
        // can go chunked from a leftover arm.
        function sxConsumeChunkArm(e) {
            if (sxChunkPaint) return !1;
            const t = window[e];
            if ("number" != typeof t || !(t > 0)) return !1;
            return sxChunkBudget = Math.min(50, Math.max(25, t)), delete window[e], !0;
        }
        // INTERIM CAPSULE PAINT (ruled 2026-11-01, Jason - the visible
        // half of the 2026-10-31 capsule-only ruling, revised): while
        // a cascade runs, every interim commit ALSO paints the SCC
        // capsule approximation of the branch being worked on, so the
        // intermediary stages are visible as the algorithm moves
        // instead of the branch jumping from its starting shape to
        // its final one at run end. The paint is the solver's own
        // approximation: sxSccBuild over the just-solved tree gives
        // every topic's capsule segment (e.S - the paddle the crossing
        // number judges: from the label's inward radius minus half a
        // font size out past the end of the longest slider, drawn at
        // stroke-width F with round caps - the band shrink (2026-11-02)
        // halved the capsule to centre line ± F/2, so the painted
        // band F IS the capsule), its centreline (e.M, branching
        // point -> the paddle's outer end), its node seat, and the
        // branch's spokes (centre spokes drawn from the centre disc's
        // rim), all in world coordinates. (Capsule-inversion
        // correction, 2026-11-02: the paddle reaches the slider ends
        // and the line runs back to the rim - not the reverse.) Drawing them is one <g> of stroked lines
        // inside #mapLayer - no DOM string build of the map, no
        // settle search, no blit - so an interim paint stays cheap
        // next to a full paint, and because the layer lives inside
        // the transformed map layer it shifts with the map under pan,
        // zoom and scene resize with no projection code of its own.
        // It is rebuilt from the current solve on every interim
        // commit; the next full paint replaces #mapLayer's content
        // and removes it with everything else, so nothing of it
        // survives the run. It only READS the solved tree: the solve,
        // gates, receipts and scoped freeze are untouched. It also
        // publishes the worked branch's current centroid as
        // window.__sxInterimAnchor (world coordinates) so the shell's
        // live crossing number rides on the approximation being
        // painted, not on the frozen pre-run DOM cloud.
        // LAYOUT-GLIDE SIGNAL (tweening Job B, 2026-11-13): an
        // observable signal each time the B glide actually runs -
        // console entry + a short quiet tone + a brief on-screen
        // status pill. Fires ONLY when moved nodes glide, never on
        // a paint with no moves. Tone/status are best-effort: a
        // blocked AudioContext or missing DOM never throws, and the
        // console entry always lands.
        let sxGlideAudioCtx = null, sxGlideStatusEl = null, sxGlideStatusTimer = 0;
        function sxLayoutGlideSignal(count) {
            try { console.info("[layout-glide] B glide: " + count + " node(s) gliding to final positions"); } catch (_) {}
            try {
                if (!sxGlideAudioCtx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) sxGlideAudioCtx = new AC();
                }
                if (sxGlideAudioCtx) {
                    try { if ("suspended" === sxGlideAudioCtx.state) sxGlideAudioCtx.resume(); } catch (_) {}
                    const t0 = sxGlideAudioCtx.currentTime, osc = sxGlideAudioCtx.createOscillator(), gain = sxGlideAudioCtx.createGain();
                    osc.type = "sine", osc.frequency.value = 880, gain.gain.setValueAtTime(0.0001, t0), gain.gain.exponentialRampToValueAtTime(0.04, t0 + 0.01), gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
                    osc.connect(gain), gain.connect(sxGlideAudioCtx.destination), osc.start(t0), osc.stop(t0 + 0.13);
                }
            } catch (_) {}
            try {
                if (!sxGlideStatusEl) {
                    sxGlideStatusEl = document.createElement("div");
                    sxGlideStatusEl.id = "sxGlideStatus";
                    sxGlideStatusEl.setAttribute("role", "status");
                    sxGlideStatusEl.style.cssText = "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;pointer-events:none;background:rgba(15,23,42,.92);color:#a5f3fc;border:1px solid #155e75;border-radius:999px;padding:6px 14px;font:600 12px/1.4 system-ui,sans-serif;opacity:0;transition:opacity .25s ease;white-space:nowrap";
                    document.body.appendChild(sxGlideStatusEl);
                }
                sxGlideStatusEl.textContent = "Layout glide: " + count + " node" + (1 === count ? "" : "s") + " gliding";
                sxGlideStatusEl.style.opacity = "1";
                if (sxGlideStatusTimer) clearTimeout(sxGlideStatusTimer);
                sxGlideStatusTimer = setTimeout(() => { if (sxGlideStatusEl) sxGlideStatusEl.style.opacity = "0"; }, 1500);
            } catch (_) {}
        }

        // CAPSULE TWEEN (tweening Job A, 2026-11-13): the interim
        // capsule glides between solver commits instead of jumping.
        // COUPLED to the global animations toggle (Jason, 2026-11-13
        // ~16:57 CST): when the toggle is OFF the capsule draws
        // instantly (the old jump); when ON it tweens over 0.5s.
        // The tween only moves the interim capsule layer's painted
        // coordinates - every decision still reads the solve registry,
        // never the DOM - so the crossing number and gate are untouched.
        let sxCapLastSnap = null, sxCapLastBranch = null;
        const sxCapTween = { from: null, to: null, start: 0, raf: 0, layer: null, branch: null };
        // Snapshot the capsule's drawn primitives with stable keys so
        // consecutive commits can be interpolated: lines (centre + sub
        // spokes, paddle S, midline M) and circles (topic icon dots,
        // subcategory dots). Presentation floors match the old direct
        // draw byte-for-byte at t=1.
        function sxCapSnap(geo, branch) {
            const F = geo.F, lines = [], circles = [];
            let anchor = null;
            geo.spokes.forEach(sp => {
                if (sp.cloud !== branch || !sp.seg) return;
                const id = "center" === sp.kind ? sp.cloud : (sp.entry && sp.entry.rec && (sp.entry.rec.id || sp.entry.rec.label)) || sp.cloud;
                if ("center" === sp.kind) anchor = sp.seg[1];
                lines.push({ k: ("center" === sp.kind ? "c:" : "sp:") + id, x1: sp.seg[0].x, y1: sp.seg[0].y, x2: sp.seg[1].x, y2: sp.seg[1].y, w: Math.max(16, F * .35), s: "#38bdf8", o: .95 });
            });
            geo.topics.forEach(e2 => {
                if (e2.cloud !== branch) return;
                const id = (e2.rec && (e2.rec.id || e2.rec.label)) || "";
                if (e2.S) {
                    // Underlay border for maximum contrast against dark canvas
                    lines.push({ k: "Sb:" + id, x1: e2.S[0].x, y1: e2.S[0].y, x2: e2.S[1].x, y2: e2.S[1].y, w: (e2.F || F) + 10, s: "#000000", o: 1.0 });
                    // Vibrant high-contrast cyan paddle pill
                    lines.push({ k: "S:" + id, x1: e2.S[0].x, y1: e2.S[0].y, x2: e2.S[1].x, y2: e2.S[1].y, w: e2.F || F, s: "#00f0ff", o: .95 });
                    // High-contrast white core highlight
                    lines.push({ k: "Sc:" + id, x1: e2.S[0].x, y1: e2.S[0].y, x2: e2.S[1].x, y2: e2.S[1].y, w: Math.max(4, (e2.F || F) * .28), s: "#ffffff", o: .9 });
                }
                if (e2.M) {
                    // Leaf spoke line abuts the icon's inside edge
                    // (ruled 2026-11-13, Jason): the midline runs out
                    // to capEnd, so trim its drawn end to the node
                    // circle instead of past the icon. Solver geometry
                    // is untouched - only the drawn interim line.
                    let x2 = e2.M[1].x, y2 = e2.M[1].y;
                    if (e2.node) {
                        const dx = e2.node.x - e2.M[0].x, dy = e2.node.y - e2.M[0].y, len = Math.hypot(dx, dy), r = Math.max(26, F * .45);
                        if (len > r) { x2 = e2.node.x - dx / len * r; y2 = e2.node.y - dy / len * r; }
                    }
                    lines.push({ k: "M:" + id, x1: e2.M[0].x, y1: e2.M[0].y, x2: x2, y2: y2, w: Math.max(10, F * .18), s: "#ffffff", o: .95 });
                }
                if (e2.node) {
                    circles.push({ k: "nb:" + id, cx: e2.node.x, cy: e2.node.y, r: Math.max(32, F * .54), f: "#000000", o: 1.0 });
                    circles.push({ k: "n:" + id, cx: e2.node.x, cy: e2.node.y, r: Math.max(26, F * .45), f: "#38bdf8", o: 1.0 });
                    circles.push({ k: "nc:" + id, cx: e2.node.x, cy: e2.node.y, r: Math.max(12, F * .22), f: "#ffffff", o: 1.0 });
                }
            });
            geo.spokes.forEach(sp => {
                if (sp.cloud !== branch || "sub" !== sp.kind || !sp.seg) return;
                const id = (sp.entry && sp.entry.rec && (sp.entry.rec.id || sp.entry.rec.label)) || sp.cloud;
                circles.push({ k: "sb:" + id, cx: sp.seg[1].x, cy: sp.seg[1].y, r: Math.max(38, F * .74), f: "#000000", o: 1.0 });
                circles.push({ k: "s:" + id, cx: sp.seg[1].x, cy: sp.seg[1].y, r: Math.max(30, F * .6), f: "#38bdf8", o: 1.0 });
                circles.push({ k: "sc:" + id, cx: sp.seg[1].x, cy: sp.seg[1].y, r: Math.max(14, F * .28), f: "#ffffff", o: 1.0 });
            });
            return { F: F, lines: lines, circles: circles, anchor: anchor };
        }
        function sxCapRender(layer, branch, snap) {
            let html = "";
            snap.lines.forEach(e => {
                html += '<line x1="' + e.x1.toFixed(1) + '" y1="' + e.y1.toFixed(1) + '" x2="' + e.x2.toFixed(1) + '" y2="' + e.y2.toFixed(1) + '" stroke="' + e.s + '" stroke-width="' + e.w.toFixed(1) + '" stroke-linecap="round" opacity="' + e.o + '"/>';
            });
            snap.circles.forEach(e => {
                html += '<circle cx="' + e.cx.toFixed(1) + '" cy="' + e.cy.toFixed(1) + '" r="' + e.r.toFixed(1) + '" fill="' + e.f + '" opacity="' + e.o + '"/>';
            });
            layer.innerHTML = html;
            let cx = 0, cy = 0, cn = 0;
            snap.circles.forEach(e => { if ("n:" === e.k.slice(0, 2)) { cx += e.cx; cy += e.cy; cn++; } });
            const ctr = cn ? { x: cx / cn, y: cy / cn } : snap.anchor;
            ctr && (window.__sxInterimAnchor = { branch: branch, x: ctr.x, y: ctr.y });
        }
        function sxCapLerp(a, b, t) {
            if (!a) return b;
            const ln = (x, y) => x + (y - x) * t;
            const byKey = arr => { const m = new Map(); arr.forEach(e => m.set(e.k, e)); return m; };
            const aL = byKey(a.lines), aC = byKey(a.circles);
            return {
                F: ln(a.F, b.F),
                lines: b.lines.map(e => {
                    const p = aL.get(e.k);
                    return p ? { k: e.k, x1: ln(p.x1, e.x1), y1: ln(p.y1, e.y1), x2: ln(p.x2, e.x2), y2: ln(p.y2, e.y2), w: ln(p.w, e.w), s: e.s, o: ln(p.o, e.o) } : e;
                }),
                circles: b.circles.map(e => {
                    const p = aC.get(e.k);
                    return p ? { k: e.k, cx: ln(p.cx, e.cx), cy: ln(p.cy, e.cy), r: ln(p.r, e.r), f: e.f, o: ln(p.o, e.o) } : e;
                }),
                anchor: a.anchor && b.anchor ? { x: ln(a.anchor.x, b.anchor.x), y: ln(a.anchor.y, b.anchor.y) } : b.anchor
            };
        }
        function sxFocusApproximatedBranch(branch, snap) {
            if (!snap) snap = window.__sxLastInterimSnap;
            if (!snap) return;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const add = (x, y) => {
                if (!Number.isFinite(x) || !Number.isFinite(y)) return;
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            };
            if (snap.anchor) add(snap.anchor.x, snap.anchor.y);
            (snap.circles || []).forEach(c => {
                add(c.cx - c.r, c.cy - c.r);
                add(c.cx + c.r, c.cy + c.r);
            });
            (snap.lines || []).forEach(l => {
                if (l.k && l.k.startsWith("c:")) {
                    add(l.x2, l.y2);
                } else {
                    add(l.x1, l.y1);
                    add(l.x2, l.y2);
                }
            });
            if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return;
            const spanX = Math.max(0, maxX - minX), spanY = Math.max(0, maxY - minY);
            const padX = Math.max(400, spanX * 0.14);
            const padY = Math.max(400, spanY * 0.14);
            minX -= padX; maxX += padX;
            minY -= padY; maxY += padY;
            const bw = Math.max(1600, maxX - minX);
            const bh = Math.max(1200, maxY - minY);
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            const svg = document.getElementById("mapSvg");
            const vb = (svg && svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width > 0) ? svg.viewBox.baseVal : { x: 0, y: 0, width: 1800, height: 1240 };
            const fitScale = Math.min((vb.width * 0.88) / bw, (vb.height * 0.84) / bh);
            const targetScale = Math.max(0.01, Math.min(2.5, fitScale));
            const tx = (vb.x + vb.width / 2) - cx * targetScale;
            const ty = (vb.y + vb.height / 2) - cy * targetScale;
            if (typeof window.__sxPanZoomCamera === "function") {
                window.__sxPanZoomCamera(targetScale, tx, ty);
            }
        }
        window.__sxFocusApproximatedBranch = sxFocusApproximatedBranch;

        function sxCapDraw(layer, branch, snap) {
            window.__sxLastInterimSnap = snap;
            window.__sxLastInterimBranch = branch;
            try { sxFocusApproximatedBranch(branch, snap); } catch (_) {}
            // Toggle OFF: draw instantly, exactly as before (no tween
            // state left running). Toggle ON: tween from the last
            // displayed snapshot over 0.5s (ease-out cubic, matching
            // the node glide's easing). A branch change has no tween
            // baseline (the old snapshot is another cloud's geometry),
            // so it draws instantly too.
            if (!mn || !mn.animations || sxCapLastBranch !== branch) {
                if (sxCapTween.raf) { try { cancelAnimationFrame(sxCapTween.raf); } catch (_) {} sxCapTween.raf = 0; }
                sxCapTween.from = null; sxCapTween.to = null;
                sxCapLastSnap = snap; sxCapLastBranch = branch;
                sxCapRender(layer, branch, snap);
                return;
            }
            const now = performance.now();
            let from = sxCapLastSnap;
            if (sxCapTween.raf && sxCapTween.to) {
                // A tween is in flight: re-base from the currently
                // displayed (interpolated) snapshot so the motion
                // stays continuous when a new commit lands mid-glide.
                const t = Math.min(1, (now - sxCapTween.start) / 500), e = 1 - Math.pow(1 - t, 3);
                from = sxCapLerp(sxCapTween.from, sxCapTween.to, e);
                try { cancelAnimationFrame(sxCapTween.raf); } catch (_) {}
                sxCapTween.raf = 0;
            }
            if (!from) { sxCapLastSnap = snap; sxCapRender(layer, branch, snap); return; }
            sxCapTween.from = from; sxCapTween.to = snap; sxCapTween.start = now; sxCapTween.layer = layer; sxCapTween.branch = branch;
            const step = t0 => {
                sxCapTween.raf = 0;
                // Stop if the run ended, the layer is gone, or a full
                // paint replaced it: never draw a stale capsule.
                if (!dkCtx || !layer.isConnected || sxCapTween.layer !== layer) return;
                const t = Math.min(1, (t0 - sxCapTween.start) / 500), e = 1 - Math.pow(1 - t, 3);
                sxCapRender(layer, branch, sxCapLerp(sxCapTween.from, sxCapTween.to, e));
                if (t < 1) sxCapTween.raf = requestAnimationFrame(step);
                else { sxCapLastSnap = sxCapTween.to; sxCapTween.from = null; sxCapTween.to = null; }
            };
            sxCapTween.raf = requestAnimationFrame(step);
        }

        function sxInterimCapsulePaint(d) {
            try {
                if (!In || !dkCtx || !dkCtx.branch) return;
                const geo = sxSccBuild(d), branch = dkCtx.branch, NS = "http://www.w3.org/2000/svg";
                let layer = In.querySelector(".sx-interim-capsules");
                if (!layer) {
                    layer = document.createElementNS(NS, "g"), layer.setAttribute("class", "sx-interim-capsules"), layer.setAttribute("aria-hidden", "true"), layer.setAttribute("pointer-events", "none"), In.appendChild(layer);
                }
                // Job A: draw via the snapshot tween (instant when the
                // animations toggle is off, gliding when it is on).
                // Presentation floors live in sxCapSnap/sxCapRender.
                sxCapDraw(layer, branch, sxCapSnap(geo, branch));
            } catch (err) { __sxErrLog("layout-interim-capsule-paint", err); }
        }

        const sxRenderMap = function(opts) { return sxRequestMapPaint(opts); };
        window.SexcapadesEngine = window.SexcapadesEngine || {};
        window.SexcapadesEngine.Map = {
            render: sxRenderMap,
            invalidateVault: sxVaultInvalidate,
            tryRestoreWarmBoot: sxTryRestoreWarmBoot,
            saveWarmBootCache: sxSaveWarmBootCache,
            invalidateWarmBootCache: sxInvalidateWarmBootCache
        };
        window.SX = window.SexcapadesEngine;
        window.TaxoPolemicsEngine = window.SexcapadesEngine;
        window.FlexcapadesEngine = window.SexcapadesEngine;
        window.TaxoPolemics = window.TaxoPolemicsEngine;
        window.Flexcapades = window.FlexcapadesEngine;

        // INTERIM-PAINT THROTTLE (anneal speed, 2026-11-13): the capsule
        // draw is the visible animation - keep it, but batch it to at
        // most one draw per animation frame during a run.
        // sxInterimPaintPending is set while a frame is scheduled;
        // sxInterimPaintGeo always holds the newest solved geometry,
        // so a burst of Mr calls inside one frame draws once, latest.
        let sxInterimPaintPending = !1, sxInterimPaintGeo = null;
        function sxRequestMapPaint(e = {}) {
            sxInvalidatePairs(), layoutAutoSync(), refreshCenterRing(), sxSyncRailPx(), sxSyncMapFontBase();
            if (jn && !e.recovery) return !1;
            if (Rn) return On = {
                ...e
            }, !1;
            const t = performance.now();
            if (Bn = Bn.filter(e => t - e < 2e3), Bn.push(t), Bn.length > 250) return sxPauseMapPaint(new Error("Excessive render activity"), "repeated rendering problem"),
            !1;
            // Chunked paint arms: boot (armed by the shell boot
            // controller), route entry (armed by sxRouteRender
            // before its render), and list close (armed by
            // sxChunkClose) - consumed one-shot here, past the
            // recovery/lock early-returns above, so a queued or
            // refused call can never eat an arm, and THIS paint
            // runs chunked at the armed budget (see
            // sxConsumeChunkArm above).
            const sxBootArm = sxConsumeChunkArm("__sxBootChunkPaint");
            let sxBootChunk = sxBootArm || sxConsumeChunkArm("__sxRouteChunkPaint") || sxConsumeChunkArm("__sxCloseChunkPaint");
            // Boot-stall fix (mechanism 2): the boot paint always paints
            // the map. The Remember restore can land before this paint
            // starts, leaving profiles restored but none selected, and
            // the no-profile early return in Ar below would then install
            // the empty map and finish the boot at 100% with 0 nodes.
            // (A snapshot of c/Mt would not help: Mr, Ar and the check
            // run in one synchronous task, so it would read the same
            // state.) Later paints keep the early return.
            sxBootPaint = sxBootArm;
            Rn = !0;
            const release = () => {
                if (Rn = !1, On && !jn) {
                    const q = On;
                    On = null;
                    // A coalesced render used to wait for the next frame.
                    // During a DeKnotter run that frame lands after
                    // applyScoped has cleared scCtx, so the replay solved
                    // with the run open and branch relief unsuppressed.
                    // The solve already inside this call has consumed mn.
                    // Drop the follow-up while the run is open. Outside a
                    // run, replay on the next frame exactly as before.
                    if (!dkCtx) requestAnimationFrame(() => sxRequestMapPaint(q));
                }
            };
            // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31, Jason):
            // while a DeKnotter cascade context is active (dkCtx),
            // every phase commit's decisions read the SOLVE, not
            // the painted map. fr() solves on the tree and records
            // the delivered-geometry registry (dkLastBranches /
            // dkBaseStates) that the phase runner then measures
            // from: delivered radii (dkDeliveredRadii), fit
            // targets (dkComputeFitTarget), base-state captures
            // (rr.resolveRadialSiblings, inside the solve) and
            // the crossing readout (sxCrossingMeasure -
            // sxSccBuild over dkLastBranches) are all computed
            // from that registry, inside the paint of the SCC
            // capsule approximation, never from DOM geometry.
            // An interim commit therefore runs exactly the solve
            // segment Ar() runs - build + tidy (the tidier itself
            // stands down under a scoped context, exactly as in
            // a scoped paint today) plus Ar's branch-angle map
            // update - and skips the full-map paint: the DOM
            // string build, the innerHTML install, the settle
            // search and the blit steps. The visible map keeps
            // the last full paint for the whole run - except the
            // worked branch's SCC capsule approximation, which
            // sxInterimCapsulePaint draws from this same solve on
            // every interim commit (ruled 2026-11-01, Jason:
            // intermediary stages ARE shown, as the capsule
            // approximation) - and dkRunCascade paints the full
            // map ONCE when the run ends, at the state that stands. The two captures
            // in applyScoped that used to read painted positions
            // - scComputeAutoRing (category centres) and
            // scCaptureDeliveredCenters (frozen nodes' delivered
            // centres) - read the solve registry (dkLastBranches,
            // through rr's own anchor/position arithmetic) while
            // a run is live, like every other decision input;
            // neither is fed the last full paint's positions
            // interim. Ar's
            // no-profile early paint (profiles exist, none
            // selected) never builds, so that state keeps the
            // ordinary path here too.
            if (dkCtx && !e.__sxDiagFullPaint && !e.recovery && (!Object.keys(wt).length || Mt && vt[Mt])) {
                try {
                    const d = SX_SOLVER_FACADE.build();
                    SX_SOLVER_FACADE.tidy(d);
                    sn.clear(), d.branches.forEach(e2 => sn.set(e2.entry.branch.name, e2.angle));
                    // INTERIM-PAINT THROTTLE (anneal speed, 2026-11-13):
                    // the capsule draw is the animation - keep it visible,
                    // but draw at most once per animation frame. A burst of
                    // Mr calls inside one frame only replaces the pending
                    // geometry; the single rAF draws the latest state. The
                    // solve (build + angle map above) stays synchronous -
                    // only the DOM draw is deferred. If the run ends (or a
                    // new run starts) before the frame, the draw is
                    // skipped; the closing full paint shows the final state.
                    sxInterimPaintGeo = d;
                    if (!sxInterimPaintPending) {
                        sxInterimPaintPending = !0;
                        const ctx = dkCtx;
                        requestAnimationFrame(() => {
                            sxInterimPaintPending = !1;
                            const g = sxInterimPaintGeo;
                            sxInterimPaintGeo = null;
                            if (!g || dkCtx !== ctx) return;
                            try { sxInterimCapsulePaint(g); } catch (err) { __sxErrLog("layout-interim-capsule-paint", err); }
                        });
                    }
                    return !0;
                } catch (err) {
                    return sxPauseMapPaint(err), !1;
                } finally {
                    release();
                }
            }
            if (!sxChunkPaint && !sxBootChunk) {
                // Ordinary render: drive Ar's generator to
                // completion inside this call - the same single
                // synchronous paint as before the generator split.
                try {
                    const gen = sxGenerateMapPaint(e);
                    let step;
                    do {
                        step = gen.next();
                    } while (!step.done);
                    try {
                        sxStemFinaliseHook && sxStemFinaliseHook();
                    } catch (_) {}
                    return !0;
                } catch (e) {
                    return sxPauseMapPaint(e), !1;
                } finally {
                    release();
                }
            }
            // Chunked paint (Q6): step the same generator with a
            // small per-frame budget, waiting a double rAF between
            // steps (the house yield pattern, with a timer fallback
            // for throttled frames) so each phase's own progress
            // checkpoints paint before the next phase runs. The
            // render lock (Rn) is held for the whole stepped paint,
            // so a render requested mid-paint queues exactly as it
            // does during a synchronous paint today.
            const gen = sxGenerateMapPaint(e), sxBudgetMs = sxChunkBudget;
            // Boot-race fix (2026-11-16): the skin loader bumps
            // window.__SX_PAINT_GEN on every taxonomy swap. If the
            // generation moved since this paint started, the paint is
            // stale - abort quietly (no throw, no pause screen) and
            // let the queued re-render paint the new skin.
            const sxPaintGen = window.__SX_PAINT_GEN || 0;
            const p = new Promise(resolve => {
                const step = () => {
                    if ((window.__SX_PAINT_GEN || 0) !== sxPaintGen) return void resolve(!1);
                    const t0 = performance.now();
                    let s;
                    try {
                        do {
                            s = gen.next();
                        } while (!s.done && s.value !== "paint" && performance.now() - t0 < sxBudgetMs);
                    } catch (err) {
                        return sxPauseMapPaint(err), void resolve(!1);
                    }
                    if (s.done) return void resolve(!0);
                    let fired = !1;
                    const next = () => {
                        if (!fired) fired = !0, step();
                    };
                    requestAnimationFrame(() => requestAnimationFrame(next)), setTimeout(next, 80);
                };
                step();
            });
            p.then(ok => {
                if (ok) try {
                    sxStemFinaliseHook && sxStemFinaliseHook();
                } catch (_) {}
                // Boot close-up fix (2026-11-13): the boot opens on a
                // hard-coded close-up of the centre avatar (the brief
                // "hello" portrait) because the camera is set before
                // the map is drawn. Once this boot paint has drawn
                // the map, pull back to the full map - Ih() also arms
                // the fit-settle chain, which re-fits again after the
                // anneal moves the nodes. Non-boot paints are untouched.
                // User-wins gate (2026-11-15): the boot paint can finish
                // AFTER the user has already focused a node (slow paint
                // on a loaded machine) - the pull-back then clobbers the
                // user's zoom (kh cancels the focus tween and re-fits).
                // A user camera move sets fitSettleUserHold via
                // noteFitUserCamera(); when it is set, skip the
                // pull-back and leave the user's camera alone.
                if (ok && sxBootArm && !fitSettleUserHold) try { sxApplyMapFit(); } catch (_) {}
            });
            return window.sxPaintPromise = sxPaintPromise = p, p.then(ok => (release(), sxPaintPromise === p && (window.sxPaintPromise = sxPaintPromise = null), ok), () => (release(), window.sxPaintPromise = null, !1));
        }
        Fn && Fn.addEventListener("click", () => {
            Dn = !0, jn = !1, Bn = [], Ln.hidden = !0, sxRequestMapPaint({
                animate: !1,
                forceRepaint: !0,
                recovery: !0
            }), sxApplyMapFit();
        }), Nn && Nn.addEventListener("click", () => {
            Dn = !1, jn = !1, Bn = [], Nt = null, Lt = null, Pt = "all", Tt = "", on.clear(), 
            rn.clear(), Ln.hidden = !0, e.all("[data-filter]").forEach(e => e.setAttribute("aria-pressed", String("all" === e.dataset.filter)));
            const t = e.byId("searchInput");
            t && (t.value = ""), sxRequestMapPaint({
                animate: !1,
                forceRepaint: !0,
                recovery: !0
            }), sxApplyMapFit();
        });
