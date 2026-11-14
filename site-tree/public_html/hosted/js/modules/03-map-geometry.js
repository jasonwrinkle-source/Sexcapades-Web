
                function fr() {
            const e = frBuildTree(), t = e.map(e => ({
                entry: e,
                label: e.branch.name,
                weight: e.weight,
                minDemand: e.minDemand
            }));
            t.sort((e, t) => (branchOrderRankMap().get(e.entry.branch.name) ?? 0) - (branchOrderRankMap().get(t.entry.branch.name) ?? 0));
            const n = mr(t, -Math.PI / 2, 2 * Math.PI, hr(1), pr.categoryIcon, 25), i = n.length;
            frAssignCategoryAngles(n, i);
            const a = [], r = [];
            frAllocateTopicSectors(n, a, r);
            n.forEach(e => {
                // Scoped solve (T3, L4): frozen branches are exempt
                // from the _spokeAdjust20 reset that feeds
                // rr.optimizeSpokeLengths — their captured
                // adjustments persist through the solve, so the
                // optimiser never has a moved frozen branch to
                // restore (the T2 replay stays as the safety net).
                if (scCtx && e.entry && e.entry.branch && scCtx.frozenBranches.has(e.entry.branch.name)) return;
                e.entry.branch._spokeAdjust20 = 0;
            });
            frCloudLayout(n);
            frClampCloudRadii(n);
            frCollisionPasses(n, a, r);
            // Sub-group line length truthfulness (Group 4, G4-11):
            // frCloudLayout now bases each subcategory's child-cloud
            // radius on the fixed reference subLen 1.2 (the shipped
            // value) instead of the live slider, because the radial
            // sibling solver's separation demands swamped the slider's
            // contribution — rendered length saturated (+50% slider
            // rendered under +9%) and could even invert (0.7 rendering
            // longer than the 1.2 baseline). The live slider is
            // applied here, after the solver, as a uniform scale on
            // the solved radii: rendered child line length now tracks
            // the slider monotonically and proportionally, is exact
            // at the shipped 1.2 (scale 1), and returning the slider
            // to any value restores that value's rendering exactly.
            try {
                const _subLenScale = (Number(mn.subLen) || 1.2) / 1.2;
                if (_subLenScale !== 1) n.forEach(b => {
                    // Scoped solve (T2): the post-solve subLen scale
                    // applies only inside the recompute set — frozen
                    // branches are skipped so their children keep
                    // their delivered radii and the solved tree stays
                    // consistent with the delivered geometry the
                    // freeze replay below restores.
                    if (scCtx && b.entry && b.entry.branch && scCtx.frozenBranches.has(b.entry.branch.name)) return;
                    (b.topics || []).forEach(t => {
                        if (t.topic && t.topic.isSubcategory && t.children) t.children.forEach(ch => {
                            // Fit skip (E4): fit targets are in final
                            // rendered units, so the post-solve subLen
                            // scale never rescales a fit child away
                            // from its target.
                            if (Number.isFinite(ch.cloudRadius) && null == dkFitTargetValueFor(ch)) ch.cloudRadius *= _subLenScale;
                        });
                    });
                });
            } catch (_) { __sxErrLog("layout-sublen-scale", _); }
            // Delivered-geometry registry (E4): remember this solve's
            // branches so the driver can enumerate the branch's
            // currently rendered items, and refresh each resolved
            // item's delivered cloudRadius in the same stable-key
            // registry deknotter.baseState() reads.
            dkLastBranches = n;
            n.forEach(b => {
                (b.topics || []).forEach(t => {
                    dkRecordDelivered(t), t.topic && t.topic.isSubcategory && (t.children || []).forEach(ch => dkRecordDelivered(ch));
                });
            });
            // Scoped solve (T2): freeze replay — with a scope context
            // active, restore every frozen branch's solved geometry
            // and _spokeAdjust20 verbatim from the pre-patch capture
            // and merge the delivered-geometry registry (see
            // scRestoreFrozen). Runs after the registry refresh above,
            // inside the solve's own completion path, before paint
            // renders. Inactive context: no-op, byte-for-byte legacy.
            if (scCtx) try {
                scRestoreFrozen(n, scCtx);
            } catch (_) { __sxErrLog("layout-scoped-restore", _); }
            return {
                tree: e,
                branches: n
            };
        }
        // Stagger density (Build 2026-10-17_0044): the kink-count (topics)
        // range across branches never changes at runtime, so it is cached.
        // mn.staggerDensity defaults on; while on, a branch's spoke-length
        // factor is 0.7 + 0.6 × its normalized density (densest branch =
        // longest spoke, sparsest = shortest), overriding the manual
        // per-branch length overrides, which are preserved untouched in
        // mn.branchOverrides and apply again as soon as it is turned off.
        let staggerDensityRange = null;
        function yr(e) {
            const t = mn.branchOverrides && mn.branchOverrides[e.name] || {}, n = Math.max(0, h.indexOf(e));
            // SOLVER-METRICS REFACTOR (F9): the branch-length factor
            // pile-up split into named factors — same values, same
            // multiplication order (transcription, not redesign):
            //   manualFactor    the per-branch manual length override
            //   staggerFactor   alternating stagger, 1.18 / 0.82
            //   collisionFactor collision mode: grow 1.3, shrink 0.76,
            //                   off 0.62, anything else 1
            //   shrinkFactor    the armed factor (shipped 0.76,
            //                   editor-adjustable via
            //                   mn.autoShrinkFactor — see
            //                   sxArmedFactor) when this branch's kink-spoke
            //                   auto-shrink switch is explicitly armed
            //                   (tri-state true; see the F6 note)
            //   solverAdjust    the solver's own _spokeAdjust20 term
            const staggerFactor = mn.stagger ? (n % 2 ? 1.18 : .82) : 1, collisionFactor = "grow" === mn.collision ? 1.3 : "shrink" === mn.collision ? .76 : "off" === mn.collision ? .62 : 1, shrinkFactor = "armed" === sxShrinkState(mn.branchSpokeAutoShrink, e.name) ? sxArmedFactor(mn.autoShrinkFactor) : 1, solverAdjust = Number(e._spokeAdjust20) || 0;
            let manualFactor = Number(t.length) || 1;
            if (mn.staggerDensity) {
                if (!staggerDensityRange) {
                    let min = Infinity, max = -Infinity;
                    h.forEach(b => {
                        const d = b.topics.length;
                        d < min && (min = d), d > max && (max = d);
                    }), staggerDensityRange = {
                        min: min,
                        max: max
                    };
                }
                const normalized = staggerDensityRange.max > staggerDensityRange.min ? (e.topics.length - staggerDensityRange.min) / (staggerDensityRange.max - staggerDensityRange.min) : .5;
                // NOTE (F9): the density formula SILENTLY DISCARDS
                // the manual length override — manualFactor is
                // overwritten here, never combined with it. The
                // override value itself survives untouched in
                // mn.branchOverrides and applies again as soon as
                // staggerDensity is turned off.
                manualFactor = .7 + .6 * normalized;
            }
            return 1450 * mn.spokeLen * manualFactor * staggerFactor * collisionFactor * shrinkFactor + solverAdjust + pr.categoryIcon / 2 + 30;
        }
        function br(e, t) {
            const n = pr.centerX, i = pr.centerY, a = (pr.centerRadius + 150) * centerRingScale(), kp = p => { const dx = p.x - n, dy = p.y - i, dd = Math.hypot(dx, dy); return dd >= a + 2 ? p : dd < 1e-6 ? { x: n + a + 2, y: i } : { x: n + dx / dd * (a + 2), y: i + dy / dd * (a + 2) }; };
            e = kp(e), t = kp(t);
            const r = t.x - e.x, o = t.y - e.y, s = r * r + o * o, l = s ? A(((n - e.x) * r + (i - e.y) * o) / s) : 0, c = e.x + r * l, d = e.y + o * l;
            if (Math.hypot(c - n, d - i) >= a) return `M ${e.x.toFixed(2)} ${e.y.toFixed(2)} L ${t.x.toFixed(2)} ${t.y.toFixed(2)}`;
            const u = e => {
                const t = e.x - n, r = e.y - i, o = Math.hypot(t, r);
                if (o <= a + .01) return null;
                const s = Math.atan2(r, t), l = Math.acos(a / o);
                return {
                    radius: o,
                    angles: [ s - l, s + l ],
                    tangentLength: Math.sqrt(o * o - a * a)
                };
            }, p = u(e), h = u(t);
            if (!p || !h) return `M ${e.x.toFixed(2)} ${e.y.toFixed(2)} L ${t.x.toFixed(2)} ${t.y.toFixed(2)}`;
            let g = null;
            p.angles.forEach(e => h.angles.forEach(t => {
                const n = Math.atan2(Math.sin(t - e), Math.cos(t - e)), i = p.tangentLength + h.tangentLength + a * Math.abs(n);
                (!g || i < g.length) && (g = {
                    angleA: e,
                    angleB: t,
                    delta: n,
                    length: i
                });
            }));
            const m = {
                x: n + Math.cos(g.angleA) * a,
                y: i + Math.sin(g.angleA) * a
            }, f = {
                x: n + Math.cos(g.angleB) * a,
                y: i + Math.sin(g.angleB) * a
            }, y = g.delta >= 0 ? 1 : 0;
            return `M ${e.x.toFixed(2)} ${e.y.toFixed(2)} L ${m.x.toFixed(2)} ${m.y.toFixed(2)} A ${a} ${a} 0 0 ${y} ${f.x.toFixed(2)} ${f.y.toFixed(2)} L ${t.x.toFixed(2)} ${t.y.toFixed(2)}`;
        }
        // The two spoke renderers (map-render refactor, finding 3) share
        // one contract: Ka (branch spokes, above) and renderKinkLine
        // (kink spokes, here) are both module-scoped — no window global;
        // the layout/test hooks reach spokes through Mr and the layout
        // API, not through the renderers — and both emit their give /
        // receive flanks through the one flank emitter,
        // SpokeGeometry.flankPaths, differing only in the mode flag
        // (Ka: "innerFirst", renderKinkLine: "outerFirst"; the two
        // modes trace the same filled region — see the SpokeGeometry
        // module doc).
        const renderKinkLine = (e, t, n, i, a, r, o, s, l, c, d, u, p, h = pr.categoryIcon, g = 48, hubD = null, leafD = null, sxDepth = null) => {
            const sxD = null != sxDepth ? sxDepth : leafD === sxIconDiameter(3) ? 3 : 2, sxF = sxFontFactor(sxD), sxSW = sxStrokeWidth(sxD);
            const m = "noCode" === a, f = Ga.WIDTH, y = m ? Ga.NO_CODE_COLOR : r || Ga.NO_CODE_COLOR, b = m ? ` stroke-dasharray="${f} 11.9"` : "", v = qn[d] || Xn(d) || {
                id: d,
                label: u,
                branch: u,
                kind: "Topic"
            }, w = (wa(d, v, p), $a(d, "give", p)), k = $a(d, "receive", p), x = da(d, p), S = Sa(d, v, p), $ = ka(u, w, x.giveKnown ? ba(x.give) : "Unrated", { tapFirst: !0 }), E = ka(u, k, x.receiveKnown ? ba(x.receive) : "Unrated", { tapFirst: !0 }), A = null != hubD ? hubD / 2 : h * mapFontScale() / 2 + (h === pr.subcategoryIcon ? 6 : 0), C = null != leafD ? Math.max(12 * mapFontScale(), leafD / 2) : Math.max(12, (Number(g) || 51) * mapFontScale() / 2 + ("Subcategory" === v.kind ? 6 : 0)), {sx0: M, sy0: I, sx1: P, sy1: L} = Ga.trimToIcons(e, t, n, i, A, C), T = (m ? "" : `<line class="hanky-midline-outline" x1="${M}" y1="${I}" x2="${P}" y2="${L}" stroke="${Ga.OUTLINE_COLOR}" stroke-width="${Ga.CLOUD_OUTLINE_WIDTH(f, sxD)}" stroke-linecap="butt" opacity="0.9" pointer-events="none"/>`) + `<line class="hanky-midline${m ? " hanky-none" : ""}" x1="${M}" y1="${I}" x2="${P}" y2="${L}" stroke="${y}" stroke-width="${sxSW}"${b} opacity="1" stroke-linecap="butt"${S}/>`, F = Boolean(o), N = Boolean(s);
            if (!l || !F && !N) return T;
            const _ = F ? o : s, D = N ? s : o, R = Ga.tipWidth(f), O = Ga.cloudBaseWidth(h, c) * (mapFontScale() * sxF / 3), B = Ga.segment(M, I, P, L), j = P - M, q = L - I, H = f / 2, W = Ga.splitInnerHalf(f, sxD), U = SpokeGeometry.flankPaths(M, I, j, q, B.nx, B.ny, O, R, W, W, "outerFirst", SpokeGeometry.buildBaseCircle(e, t, A), {
                x: n,
                y: i,
                r: C
            });
            return `<path class="tapered-stem" d="${U.top}" fill="${_}" stroke="none" opacity="0.9" style="fill:${_}"${$}/><path class="tapered-stem" d="${U.bottom}" fill="${D}" stroke="none" opacity="0.9" style="fill:${D}"${E}/>` + T;
        };
        const vr = ".tapered-stem,.hanky-midline,.hanky-midline-outline,.topic-pulse,.group-heat,.selected-spoke,.mutual-halo,.disinterest-halo,.favorite-halo,.limit-halo,.visual-rail";
        function wr() {
            if ("number" != typeof $p || "number" != typeof Ep || "number" != typeof Ap) return;
            const e = Cn.classList.contains("is-camera-moving"), t = nh, n = 24 * $p, i = (e, i) => {
                const a = Ep + e * $p, r = Ap + i * $p;
                return a >= t.x - n && a <= t.x + t.width + n && r >= t.y - n && r <= t.y + t.height + n;
            }, a = Cn.getBoundingClientRect();
            In.querySelectorAll(".direction-control").forEach(e => {
                const t = e.getBoundingClientRect(), n = t.width > 0 && t.height > 0 && t.right >= a.left - 12 && t.left <= a.right + 12 && t.bottom >= a.top - 12 && t.top <= a.bottom + 12;
                e.classList.toggle("camera-clipped", !n), e.setAttribute("aria-hidden", n ? "false" : "true");
            }), In.querySelectorAll(".common-overlap-link").forEach(t => {
                if ("false" === t.dataset.connected) return void (t.style.display = "none");
                const n = Number(t.dataset.ax), a = Number(t.dataset.ay), r = Number(t.dataset.bx), o = Number(t.dataset.by);
                if (e) {
                    const e = i(n, a) || i(r, o);
                    return void (t.style.display = e ? "" : "none");
                }
                const s = i(n, a) || i(r, o);
                t.style.display = s ? "" : "none";
            });
        }
        function kr(e, t) {
            const n = Math.max(-260, Math.min(260, t));
            bt[e.id] = n, e.pendingBend = n, bn || (bn = requestAnimationFrame(() => {
                bn = 0, yn === e && function(e) {
                    if (!e || !e.previewPath || !e.pathPoints) return;
                    const t = (Number.isFinite(e.pendingBend) ? e.pendingBend : e.startBend) - e.startBend, n = e.pathPoints, i = e.nx, a = e.ny;
                    e.previewPath.setAttribute("d", `M ${n[0].toFixed(2)} ${n[1].toFixed(2)} C ${(n[2] + i * t * .58).toFixed(2)} ${(n[3] + a * t * .58).toFixed(2)}, ${(n[4] + i * t).toFixed(2)} ${(n[5] + a * t).toFixed(2)}, ${n[6].toFixed(2)} ${n[7].toFixed(2)}`);
                }(e);
            }));
        }
        function xr(e = !0) {
            bn && (cancelAnimationFrame(bn), bn = 0);
            const t = yn;
            return t ? (t.previewGroup?.classList.remove("is-curve-previewing"), t.previewPath?.remove(), 
            yn = null, e && Mr({
                anchorId: t.id
            }), t) : null;
        }
        function Sr(e, t, n) {
            const i = Cn.createSVGPoint();
            i.x = t, i.y = n;
            const a = i.matrixTransform(e.screenToLayer || __sxScreenCtm(In).inverse()), r = a.x - e.startX, o = a.y - e.startY;
            return e.startBend + r * e.nx + o * e.ny;
        }
        function $r() {
            void 0 !== Zp && Zp && (t.clear(Zp), Zp = 0), void 0 !== Qp && Qp && (cancelAnimationFrame(Qp), 
            Qp = 0), Cn.classList.remove("is-layout-moving"), In.querySelectorAll(".layout-exit-clone").forEach(e => e.remove()), 
            In.querySelectorAll(".rich-line-draw").forEach(e => {
                e.classList.remove("rich-line-draw"), e.removeAttribute("pathLength");
            }), In.querySelectorAll(".layout-transition,.layout-move-start,.layout-enter-start,.layout-exit-active,.rich-layout").forEach(e => {
                e.classList.remove("layout-transition", "layout-move-start", "layout-enter-start", "layout-exit-active", "rich-layout"), 
                e.style.removeProperty("--layout-dx"), e.style.removeProperty("--layout-dy"), e.style.removeProperty("--layout-enter-dx"), 
                e.style.removeProperty("--layout-enter-dy"), e.style.removeProperty("--layout-exit-dx"), 
                e.style.removeProperty("--layout-exit-dy");
            });
        }
        async function Er(n) {
            let i = [];
            try {
                i = Xi().slice(0, 2);
            } catch (e) { __sxErrLog("top-profiles", e); }
            if (i.length < 2) return;
            const a = i.map(e => {
                try {
                    return Ji(wt[e]) || "Partner";
                } catch (e) {
                    return "Partner";
                }
            }), r = `${a[0]} × ${a[1]}`, o = "mutual" === Pt ? "Want to do together" : "explore" === Pt ? "Curious about" : "mismatch" === Pt ? "Mismatched — talk about it" : "Comparison", s = "couple" === n, l = s ? "Want to compare your couple?" : "Want to compare hypermaps?", c = s ? "Make your hypermaps at sexcapades.io" : "Make your free hypermap at sexcapades.io", d = s ? "See how you two compare →" : "See how YOU compare →", u = e.byId("mapSvg");
            if (!u) return;
            const p = u.cloneNode(!0);
            p.setAttribute("width", "1600"), p.setAttribute("height", "1400"), p.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            let h = "";
            try {
                h = (new XMLSerializer).serializeToString(p);
            } catch (e) {
                return void console.warn("Overlap image serialization failed", e);
            }
            const g = new Blob([ h ], {
                type: "image/svg+xml;charset=utf-8"
            }), m = URL.createObjectURL(g);
            let f = null;
            try {
                f = await new Promise((e, t) => {
                    const n = new Image;
                    n.onload = () => e(n), n.onerror = () => t(new Error("map image failed to load")), 
                    n.src = m;
                });
            } catch (e) {
                return URL.revokeObjectURL(m), void console.warn("Overlap share aborted:", e.message);
            }
            const y = 1600, b = document.createElement("canvas");
            b.width = y, b.height = 2060;
            const v = b.getContext("2d");
            v.fillStyle = "#151816", v.fillRect(0, 0, y, 2060), v.textAlign = "center", v.textBaseline = "alphabetic", 
            v.fillStyle = "#edf2ee", v.font = "700 54px system-ui, sans-serif", v.fillText(r, 800, 85), 
            v.fillStyle = "#63c2c8", v.font = "500 36px system-ui, sans-serif", v.fillText(o, 800, 145), 
            v.fillStyle = "#aeb8b1", v.font = "400 28px system-ui, sans-serif", v.fillText("See what we have in common", 800, 192);
            try {
                v.drawImage(f, 0, 230, y, 1400);
            } catch (e) {
                console.warn("Overlap map draw failed", e);
            }
            URL.revokeObjectURL(m);
            const w = 1630;
            v.fillStyle = "#0d1110", v.fillRect(0, w, y, 430), v.strokeStyle = "rgba(99,194,200,.45)", 
            v.lineWidth = 3, v.beginPath(), v.moveTo(0, w), v.lineTo(y, w), v.stroke();
            try {
                const e = await qu("https://sexcapades.io/#app", 480);
                v.fillStyle = "#ffffff", v.fillRect(48, 1688, 304, 304), v.imageSmoothingEnabled = !1, 
                v.drawImage(e, 60, 1700, 280, 280), v.imageSmoothingEnabled = !0;
            } catch (e) {
                console.warn("Overlap QR failed:", e.message);
            }
            const k = 390;
            v.textAlign = "left", v.fillStyle = "#edf2ee", v.font = "700 46px system-ui, sans-serif", 
            v.fillText(l, k, 1750), v.fillStyle = "#d7ded8", v.font = "400 33px system-ui, sans-serif", 
            v.fillText(c, k, 1810), v.fillStyle = "#aeb8b1", v.font = "400 28px system-ui, sans-serif", 
            v.fillText("18+ · No account · Stays on your phone", k, 1865), v.fillStyle = "#63c2c8", 
            v.font = "700 32px system-ui, sans-serif", v.fillText(d, k, 1930), v.fillStyle = "#7a857e", 
            v.font = "400 24px system-ui, sans-serif", v.fillText("No profiles were shared — just the overlap.", k, 1985), 
            b.toBlob(e => {
                if (!e) return;
                // F9 (sharing-sync refactor): the download step
                // goes through the shared ny helper like every
                // other export; the layout above and the
                // no-profile-data rule stay overlap-only.
                const i = e => String(e || "partner").replace(/[^a-z0-9]+/gi, "-").slice(0, 20), r = URL.createObjectURL(e);
                ny(r, `Sexcapades-overlap-${i(a[0])}-${i(a[1])}.png`), t.setTimeout(() => {
                    URL.revokeObjectURL(r);
                }, 1500);
            }, "image/png");
        }
        // Layout-editor length overrides (map-render refactor, finding
        // 6): one helper for the render loop's three per-override
        // sites — per-subcategory overrides (mn.subcatOverrides, keyed
        // by topic label), per-kink overrides (mn.kinkOverrides, keyed
        // by topic id), and per-kink overrides for subcategory children
        // (same table; the sites pass a unit length and use the result
        // as the multiplier). Returns length * override.length when a
        // positive numeric override exists, else the length unchanged.
        // Errors keep the sites' historical shape: caught and logged
        // as "layout-override", length unchanged. (The draw path once
        // never read these tables — the multiplier lived only in the
        // collision estimate — until Builds 2026-10-19_0255 and
        // 2026-10-20_0023 wired the draw sites.)
        function applyLengthOverride(length, key, table) {
            try {
                const ov = table ? table[key] : null;
                if (ov && typeof ov.length === "number" && ov.length > 0) return length * ov.length;
            } catch (_) { __sxErrLog("layout-override", _); }
            return length;
        }
        // Q6 truthful progress (field fix, 2026-10-24): Ar is a
        // generator so Mr can step it. sxChunkPaint is set only by
        // the layout API's applyChunked (the layout editor's armed
        // task-session apply): Mr then steps the paint one phase per
        // frame instead of running it in one synchronous block, so
        // the pipeline's own __sxLoad / __sxNodeTick checkpoints get
        // frames in which to paint — progress becomes stage truth,
        // never an interpolated number. With the flag off (every
        // other render) Mr drives the generator to completion
        // synchronously inside the same call, exactly the old
        // behaviour. sxPaintPromise tracks the in-flight chunked
        // paint so applyChunked / applyScoped can await its settle.
        // sxChunkBudget is the per-frame work budget (ms) of a chunked
        // paint: 12 for the editor path (pinned in applyChunked), and
        // a larger shell-chosen slice for the boot-only paint (see
        // sxBootChunk in Mr) — bigger slices mean fewer double-rAF
        // waits per render, at the cost of fewer painted values.
        // Thread 2 boot entry: the shell boot controller arms
        // window.__sxBootChunkPaint with a budget before this bundle
        // executes; Mr consumes it one-shot for the first paint it
        // starts, so the boot render — and only the boot render —
        // paints its checkpoints progressively. Ordinary renders
        // stay synchronous; the global default is unchanged.
        let sxChunkPaint = !1, sxPaintPromise = null, sxChunkBudget = 12;

