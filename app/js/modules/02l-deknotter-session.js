        function sgRestorePaint(centers, allNames, capture) {
            const frozen = new Set(allNames), ctx = {
                targetBranches: new Set,
                ringBranches: new Set,
                recomputeBranches: new Set,
                frozenBranches: frozen,
                boundaryLog: [],
                dropped: {
                    optimiser: 0,
                    relief: 0,
                    clamp: 0
                },
                fallback: null,
                policy: "contained",
                opClass: "settle-guard",
                reliefPass: 0,
                r6Abort: !1,
                capture: capture,
                centers: centers
            };
            scCtx = ctx, sgHoldBlitStart = !0;
            try {
                sxRequestMapPaint({
                    animate: !1,
                    forceRepaint: !0
                });
            } finally {
                scCtx = null, sgHoldBlitStart = !1;
            }
            if (blitSess) {
                const s2 = blitSess;
                blitSess = null, s2.timer && clearTimeout(s2.timer), s2.rasterUrl && URL.revokeObjectURL(s2.rasterUrl), 
                blitStripArtifacts();
                for (let i = dkLog.length - 1; i >= 0; i--) {
                    const en = dkLog[i];
                    if (en && "blit-session" === en.type && "start" === en.event) {
                        dkLog.splice(i, 1);
                        break;
                    }
                }
                // F6: the removed "start" never gains an "end", so
                // the signal reverts to the new last blit-session
                // entry - exactly the verdict the gate's log scan
                // produced over the spliced log.
                blitSigActive = !1;
                for (let i = dkLog.length - 1; i >= 0; i--) {
                    const en = dkLog[i];
                    if (en && "blit-session" === en.type) {
                        blitSigActive = "start" === en.event;
                        break;
                    }
                }
            }
        }
        // The guarded settle itself, run from blitArmTimer's expiry
        // with the log length marked at run start (for the deferred
        // end decision in step 5). Never rejects: every failure is
        // funnelled into the fail-open paths below.
        async function sgRunSettleGuard(sess, logMark) {
            let pendingEnd = null, pre = null, post = null, final = null, regressed = [], rounds = 0, aborted = !1, bailed = !1, baselineSource = "live";
            const newerStartSeen = () => {
                for (let i = logMark; i < dkLog.length; i++) {
                    const en = dkLog[i];
                    if (en && "blit-session" === en.type && "start" === en.event) return !0;
                }
                return !1;
            }, flushEnd = () => {
                // The deferred end lands only when no newer session
                // has started since this guard run began - a live
                // session's own end closes the log instead.
                if (!pendingEnd || newerStartSeen()) return;
                const en = pendingEnd;
                pendingEnd = null, dkLog.push(en), blitSigActive = !1;
            };
            try {
                // 1. Pre-capture, the blit session still active:
                // capture every branch's centers FIRST, while the
                // vault still stands - the rendered read
                // (sgCaptureRenderedCenters) sees live and
                // vault-resident elements alike; then strip the
                // artifacts (the same call blitEndSession makes)
                // before the pre-settle solved-state capture
                // (preCapture) and the pre-settle per-cloud
                // overlap measure, which read as before.
                const allNames = sgAllBranchNames();
                if (!allNames.size) throw new Error("settle guard: no delivered branches to guard");
                const preCenters = sgCaptureRenderedCenters(allNames);
                blitStripArtifacts();
                const preCapture = scCaptureFrozen(allNames);
                const sessBaseline = sess && sess.preBaseline ? await sess.preBaseline : null;
                if (sessBaseline) pre = sessBaseline, baselineSource = "pre-session"; else pre = await sgMeasureClouds();
                if (blitSess !== sess) {
                    // The session ended (or was replaced) while the
                    // pre-measure ran - its own end entry already
                    // closed it. Stand down without touching the
                    // replacement session, and never restore.
                    aborted = !0, post = final = await sgMeasureClouds().catch(() => pre);
                } else {
                    // 2. Settle repaint: tear the session down
                    // exactly as blitEndSession does, but hold the
                    // "end" entry as pendingEnd instead of pushing
                    // it - it lands in step 5, after the guard has
                    // completely finished.
                    pendingEnd = {
                        type: "blit-session",
                        event: "end",
                        frozen: sess.frozenCount
                    }, blitSess = null, sess.timer && clearTimeout(sess.timer), sess.rasterUrl && URL.revokeObjectURL(sess.rasterUrl), 
                    blitStripArtifacts();
                    try {
                        sxRequestMapPaint({
                            animate: !1,
                            forceRepaint: !0
                        });
                    } catch (_) {
                        __sxErrLog("layout-blit-timer", _);
                    }
                    // 3. Post-measure: which clouds did the settle
                    // repaint make worse?
                    post = await sgMeasureClouds(), final = post, regressed = sgRegressed(pre, post);
                    // 4. Restore, only when some cloud regressed:
                    // up to two selective rounds (regressed clouds
                    // re-seated at their pre-settle centers, every
                    // other node at its current center), then - if a
                    // cloud is still above its pre-settle value -
                    // one full restore paint seating every node at
                    // its pre-settle delivered center. Before every
                    // round, abort if a live edit has taken the map
                    // over (a new blit session, an active scope):
                    // the guard never fights a live edit.
                    let reg = regressed;
                    while (reg.length && rounds < 2) {
                        if (blitSess || scCtx) {
                            aborted = !0;
                            break;
                        }
                        const regSet = new Set(reg);
                        sgRestorePaint(sgSelectiveCenters(preCenters, scCaptureDeliveredCenters(allNames), regSet), allNames, sgMergedCapture(preCapture, regSet, allNames)), 
                        rounds++, final = await sgMeasureClouds(), reg = sgRegressed(pre, final);
                    }
                    if (!aborted && reg.length) if (blitSess || scCtx) aborted = !0; else sgRestorePaint(preCenters, allNames, preCapture), 
                    rounds++, final = await sgMeasureClouds();
                    // 4b. The brake: improve-or-hold applies to the
                    // guard too - it may fail its per-cloud
                    // objective, but it may not leave the map worse
                    // than the settle it replaced. If restore rounds
                    // ran and the final total nevertheless exceeds
                    // the post-repaint total, discard the restore:
                    // run ONE plain legacy settle repaint (no
                    // scoped context - the session is already torn
                    // down), re-measure, and keep the re-measured
                    // values as final. The log entry is marked
                    // bailed; regressed/rounds/pre/post still
                    // describe the original regression and attempts.
                    if (!aborted && rounds > 0 && sgCloudTotal(final) > sgCloudTotal(post)) {
                        bailed = !0;
                        try {
                            sxRequestMapPaint({
                                animate: !1,
                                forceRepaint: !0
                            });
                        } catch (_) {
                            __sxErrLog("layout-blit-timer", _);
                        }
                        final = await sgMeasureClouds().catch(() => final);
                    }
                }
                // 5. Log the guard's own receipt, then land the
                // deferred end (unless a newer session superseded
                // it). With no regression the guard is transparent:
                // no restore paint ran, and the only change from the
                // legacy settle is that the end entry lands after
                // the post-measure instead of before the repaint -
                // the settle has not landed until it has been
                // checked.
                // Q4: every watched cloud's crossing numbers ride
                // on the entry as a per-cloud report (pre / post /
                // final). They are reported for visibility; the
                // guard's decisions remain exactly the per-cloud
                // epsilon test in sgRegressed over the same maps -
                // no neighbor or total comparison gates anything
                // beyond the pre-existing total-based brake above.
                const sgReported = {};
                [ pre, post, final ].forEach(m => {
                    if (m) for (const k of Object.keys(m)) sgReported[k] || (sgReported[k] = { pre: null, post: null, final: null });
                });
                if (pre) for (const k of Object.keys(pre)) sgReported[k].pre = pre[k];
                if (post) for (const k of Object.keys(post)) sgReported[k].post = post[k];
                if (final) for (const k of Object.keys(final)) sgReported[k].final = final[k];
                const sgEntry = {
                    type: "settle-guard",
                    metric: "crossingnumber",
                    regressed: regressed.slice(),
                    rounds: rounds,
                    aborted: aborted,
                    captureSource: sgCaptureSource,
                    baselineSource: baselineSource,
                    pre: pre,
                    post: post,
                    final: final,
                    reportedClouds: sgReported
                };
                bailed && (sgEntry.bailed = !0), dkLog.push(sgEntry), flushEnd();
            } catch (e) {
                __sxErrLog("layout-settle-guard", e);
                // Fail-open. Before the teardown, nothing has been
                // touched that the legacy settle would not touch:
                // run it exactly. After the teardown, the settle
                // repaint already landed - just land the held end
                // entry so the settle is never lost.
                if (!pendingEnd && blitSess === sess) try {
                    blitEndSession();
                    try {
                        sxRequestMapPaint({
                            animate: !1,
                            forceRepaint: !0
                        });
                    } catch (mErr) {
                        __sxErrLog("layout-blit-timer", mErr);
                    }
                } catch (_) {
                    __sxErrLog("layout-settle-guard", _);
                } else flushEnd();
            }
        }
        // Paint-top gate (start of Ar): a non-scoped paint, or a
        // scoped paint whose frozen set differs from the session's,
        // ends the session before the paint runs - the paint is then
        // an ordinary segment/full paint and its clear removes the
        // artifacts. Boundary-log entries are not an end condition:
        // under a contained scope they are suppressed coupling
        // candidates that do not change frozen geometry.
        function blitPaintGate() {
            if (!blitSess) return;
            if (!scCtx || !blitSameFrozen(scCtx.frozenBranches, blitSess.frozen)) blitEndSession();
        }
        // Snapshot: clone the layer element and remove everything
        // belonging to the live zone - groups whose keys are live;
        // label-stack items containing a label whose data-id is
        // live; control-stack items containing controls whose
        // data-id is live; spoke-underlay items whose data-spoke-for
        // is live; overlay children whose data-id is live - plus the
        // relations layers and the center content (both stay live in
        // the real DOM). Live keys = every group key whose branch
        // (per the qn registry the just-finished paint built) is NOT
        // in the session's frozen set. What remains is the frozen
        // complement with a genuine hole where the live zone was.
        function blitSnapshot(sess) {
            const clone = In.cloneNode(!0), live = new Set;
            clone.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => {
                const info = sxNodeRegistry[el.dataset.layoutKey];
                (info && sess.frozen.has(info.branch)) || live.add(el.dataset.layoutKey);
            }), clone.querySelectorAll(".layout-exit-clone, .sx-blit-vault, .sx-blit-raster").forEach(el => el.remove()), 
            clone.querySelectorAll(".node-group[data-layout-key]").forEach(el => {
                live.has(el.dataset.layoutKey) && el.remove();
            }), clone.querySelectorAll(".common-overlap-layer, .branch-relation-layer").forEach(el => el.remove()), 
            Array.from(clone.children).forEach(el => {
                (el.hasAttribute("data-empty-profile-map") || el.querySelector && el.querySelector(".center-hit, .center-glance-rings")) && el.remove();
            }), clone.querySelectorAll(".center-glance-rings").forEach(el => el.remove());
            const ls = clone.querySelector(":scope > .map-label-stack");
            ls && Array.from(ls.children).forEach(item => {
                const lab = item.querySelector(".category-label[data-id], .map-label[data-id]");
                lab && live.has(lab.dataset.id) && item.remove();
            });
            const cs = clone.querySelector(":scope > .direction-control-stack");
            cs && Array.from(cs.children).forEach(item => {
                Array.from(item.querySelectorAll(".direction-control[data-id]")).some(c => live.has(c.dataset.id)) && item.remove();
            });
            const un = clone.querySelector(":scope > .spoke-underlay");
            un && un.querySelectorAll(".spoke-underlay-item[data-spoke-for]").forEach(item => {
                live.has(item.dataset.spokeFor) && item.remove();
            });
            const ov = clone.querySelector(".node-interaction-overlay");
            ov && ov.querySelectorAll("[data-id]").forEach(el => {
                live.has(el.dataset.id) && el.remove();
            });
            // Serialize: the cloned layer's children, wrapped in a
            // <g> reproducing the layer's own transform if it has one.
            const ser = new XMLSerializer, tf = In.getAttribute("transform");
            let body = Array.from(clone.childNodes).map(n => ser.serializeToString(n)).join("");
            return tf && (body = `<g transform="${tf}">${body}</g>`), body;
        }
        // The serialized snapshot document: an <svg> wrapper over
        // the world rect the camera code uses, a <style> whose text
        // is the concatenation of the document's own <style>
        // elements (an image-loaded SVG is style-isolated, so the
        // map's class styling travels with it), then the snapshot
        // body. Width/height carry the rasterization scale.
        function blitSvgString(sess, scale) {
            const side = Math.max(1, Math.round(3200 * scale)), css = sess.css.replace(/&/g, "&amp;").replace(/</g, "&lt;");
            return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-700 -980 3200 3200" width="${side}" height="${side}"><style>${css}</style>${sess.svgBody}</svg>`;
        }
        function blitStartSession(frozenSet) {
            const sess = {
                token: ++blitTokenSeq,
                frozen: new Set(frozenSet),
                frozenCount: frozenSet.size,
                css: Array.from(document.querySelectorAll("style")).map(s => s.textContent || "").join("\n"),
                svgBody: "",
                svg: "",
                scale: 0,
                rasterUrl: null,
                rasterReady: !1,
                swapped: !1,
                rseq: 0,
                order: [],
                orderIx: new Map,
                frozenKeys: [],
                records: new Map,
                flushIx: 0,
                timer: 0,
                autofitExit: !1,
                exitTimer: 0
            };
            sess.svgBody = blitSnapshot(sess), sess.scale = blitScaleNow(), sess.svg = blitSvgString(sess, sess.scale), 
            In.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => sess.order.push(el.dataset.layoutKey)), 
            sess.order.forEach((k, ix) => sess.orderIx.set(k, ix)), sess.frozenKeys = sess.order.filter(k => {
                const info = sxNodeRegistry[k];
                return info && sess.frozen.has(info.branch);
            }), blitSess = sess, dkLog.push({
                type: "blit-session",
                event: "start",
                frozen: sess.frozenCount
            }), blitSigActive = !0, blitArmTimer(sess), blitRasterize(sess, sess.scale);
            sess.preBaseline = sgMeasureClouds().catch(() => null);
        }
        // Asynchronous rasterization: load the serialized SVG via a
        // blob URL into an Image, draw it to a canvas at `scale` px
        // per world unit (canvas at most 6400 px on a side), and
        // keep the canvas blob URL as the raster source.
        function blitRasterize(sess, scale) {
            const rseq = ++sess.rseq, svgStr = blitSvgString(sess, scale);
            let blobUrl = null;
            try {
                blobUrl = URL.createObjectURL(new Blob([ svgStr ], {
                    type: "image/svg+xml;charset=utf-8"
                }));
            } catch (_) {
                return void blitRasterFailed(sess);
            }
            const img = new Image;
            img.onload = () => {
                URL.revokeObjectURL(blobUrl);
                if (blitSess !== sess || sess.rseq !== rseq) return;
                try {
                    const side = Math.max(1, Math.min(6400, Math.round(3200 * scale))), cv = document.createElement("canvas");
                    cv.width = side, cv.height = side, cv.getContext("2d").drawImage(img, 0, 0, side, side), 
                    cv.toBlob(b => {
                        if (blitSess !== sess || sess.rseq !== rseq) return;
                        b ? blitRasterDone(sess, URL.createObjectURL(b), scale, svgStr) : blitRasterFailed(sess);
                    }, "image/png");
                } catch (_) {
                    blitRasterFailed(sess);
                }
            }, img.onerror = () => {
                URL.revokeObjectURL(blobUrl), blitSess === sess && sess.rseq === rseq && blitRasterFailed(sess);
            }, img.src = blobUrl;
        }
        function blitRasterFailed(sess) {
            // With no raster at all the session can never swap in:
            // end it (paints stay ordinary P1 segment paints). A
            // failed RE-rasterize keeps the current raster instead.
            if (blitSess === sess && !sess.rasterUrl) blitEndSession();
        }
        function blitRasterDone(sess, url, scale, svgStr) {
            if (blitSess !== sess) return void URL.revokeObjectURL(url);
            const old = sess.rasterUrl;
            sess.rasterUrl = url, sess.rasterReady = !0, sess.scale = scale, sess.svg = svgStr, 
            old && old !== url && URL.revokeObjectURL(old);
            if (sess.swapped) {
                const el = In.querySelector(":scope > .sx-blit-raster");
                el && (el.setAttribute("href", url), el.setAttributeNS(BLIT_XLINK, "xlink:href", url));
            } else try {
                blitSwapFromDOM(sess);
            } catch (_) {
                __sxErrLog("layout-blit-swap", _), blitStripArtifacts(), blitEndSession();
            }
        }
        // The blit module's own stack indexes and per-key piece
        // collection: the same single-pass indexes and the same
        // in-group-first-then-stacks semantics as P1's capture - a
        // segment's pieces are found whether they currently live in
        // the extraction stacks or inside its (vaulted) group.
        function blitIndexStacks() {
            const ix = {
                labelStack: In.querySelector(":scope > .map-label-stack"),
                ctrlStack: In.querySelector(":scope > .direction-control-stack"),
                underlay: In.querySelector(":scope > .spoke-underlay"),
                overlay: In.querySelector(".node-interaction-overlay"),
                label: new Map,
                controls: new Map,
                stems: new Map,
                badge: new Map
            };
            return ix.labelStack && ix.labelStack.querySelectorAll(".category-label[data-id], .map-label[data-id]").forEach(el => {
                const id = el.dataset.id;
                id && !ix.label.has(id) && ix.label.set(id, el);
            }), ix.ctrlStack && ix.ctrlStack.querySelectorAll(".direction-control[data-id]").forEach(el => {
                const id = el.dataset.id;
                if (!id) return;
                const arr = ix.controls.get(id);
                arr ? arr.push(el) : ix.controls.set(id, [ el ]);
            }), ix.underlay && ix.underlay.querySelectorAll(".spoke-underlay-item[data-spoke-for]").forEach(el => {
                const id = el.dataset.spokeFor;
                id && !ix.stems.has(id) && ix.stems.set(id, el);
            }), ix.overlay && ix.overlay.querySelectorAll(".hidden-count-badge[data-id]").forEach(el => {
                const id = el.dataset.id;
                id && !ix.badge.has(id) && ix.badge.set(id, el);
            }), ix;
        }
        function blitPieces(key, el, ix) {
            const seg = {
                label: null,
                controls: [],
                stems: [],
                badge: null
            };
            let found = el.querySelector(":scope > .category-label, :scope > .map-label");
            if (found) seg.label = found; else if (ix.labelStack && (found = ix.label.get(key))) seg.label = found;
            const inControls = Array.from(el.querySelectorAll(":scope > .direction-control")), stackControls = ix.ctrlStack ? ix.controls.get(key) || [] : [];
            inControls.length && (seg.controls = inControls), stackControls.length && (seg.controls = seg.controls.concat(stackControls));
            const inStems = Array.from(el.querySelectorAll(vr)).filter(c => !(__sxClosestAction(c, "directionControl") || __sxClosestAction(c, "secondGenRatingControls") || c.classList.contains("visual-rail") && c.classList.contains("rating-rail")));
            if (!inStems.length && ix.underlay) {
                const item = ix.stems.get(key);
                item && item.children.length && (seg.stems = Array.from(item.children));
            }
            return found = el.querySelector(":scope > .hidden-count-badge"), found ? seg.badge = found : ix.overlay && (found = ix.badge.get(key)) && (seg.badge = found), 
            seg;
        }
        function blitAssemble(seg, el) {
            seg.stems.forEach(p => {
                p && p.parentNode !== el && el.appendChild(p);
            }), seg.controls.forEach(p => {
                p && p.parentNode !== el && el.appendChild(p);
            }), seg.label && seg.label.parentNode !== el && el.appendChild(seg.label), 
            seg.badge && seg.badge.parentNode !== el && el.appendChild(seg.badge);
        }
        // Settle-pass obstacle records, computed at swap time from
        // the then-current settled DOM: per frozen group, exactly
        // the shapes the settle pass itself would push for that
        // group, as plain data - icon box (center = the group's
        // data-layout-x/y, size = its icon's data-diameter); one box
        // per direction control (center = baseCx/baseCy + the
        // translate parsed from its settled transform, width/height
        // exactly as the pass computes them including the
        // active-control 320x40 special case via the Nt comparison,
        // angle = rotate + baseAngle); label box (center = the
        // group's data-label-x/y, width = max(24, the label's
        // getComputedTextLength()), height 30 for a category label
        // else 22, angle = the concept path's first-segment
        // direction). A group the pass would skip (hidden, no
        // label, no usable concept path) records null.
        function blitBuildRecords(sess) {
            const ix = blitIndexStacks();
            sess.frozenKeys.forEach(key => {
                const el = In.querySelector(`.node-group[data-layout-key="${CSS.escape(key)}"]:not(.layout-exit-clone)`);
                if (!el || el.classList.contains("is-hidden")) return void sess.records.set(key, null);
                const seg = blitPieces(key, el, ix), label = seg.label;
                if (!label) return void sess.records.set(key, null);
                const textPath = label.querySelector("textPath"), href = textPath && textPath.getAttribute("href"), pathId = label.dataset.pathId || href && href.slice(1), path = pathId && document.getElementById(pathId);
                let plen = 0;
                try {
                    plen = path ? path.getTotalLength() : 0;
                } catch (_) {
                    plen = 0;
                }
                if (!path || !plen) return void sess.records.set(key, null);
                const icon = el.querySelector(".branch-icon,.topic-icon"), dia = Number(icon && icon.dataset.diameter) || 0, lx = Number.parseFloat(el.dataset.layoutX), ly = Number.parseFloat(el.dataset.layoutY), rec = {
                    icon: dia && Number.isFinite(lx) && Number.isFinite(ly) ? {
                        x: lx,
                        y: ly,
                        size: dia
                    } : null,
                    controls: [],
                    label: null
                };
                seg.controls.forEach(c => {
                    const scale = Number(c.dataset.controlScale) || 1, active = Boolean(Nt && Nt.id === key && Nt.direction === c.dataset.direction), baseCx = Number(c.dataset.baseCx), baseCy = Number(c.dataset.baseCy), baseAngle = Number(c.dataset.baseAngle) || 0, m = /translate\((-?[\d.]+)[ ,]+(-?[\d.]+)\)\s*rotate\((-?[\d.]+)/.exec(c.getAttribute("transform") || "");
                    rec.controls.push({
                        x: (Number.isFinite(baseCx) ? baseCx : 0) + (m ? Number(m[1]) : 0),
                        y: (Number.isFinite(baseCy) ? baseCy : 0) + (m ? Number(m[2]) : 0),
                        w: active ? 320 * scale : Number(c.dataset.tagWidth) || 48,
                        h: active ? 40 * scale : Number(c.dataset.tagHeight) || 20,
                        angle: (m ? Number(m[3]) : 0) + baseAngle
                    });
                });
                const labelX = Number.parseFloat(el.dataset.labelX), labelY = Number.parseFloat(el.dataset.labelY);
                if (Number.isFinite(labelX) && Number.isFinite(labelY)) {
                    const f = path.getPointAtLength(0), y = path.getPointAtLength(Math.min(1, plen));
                    rec.label = {
                        x: labelX,
                        y: labelY,
                        w: Math.max(24, label.getComputedTextLength()),
                        h: label.classList.contains("category-label") ? 30 : 22,
                        angle: 180 * Math.atan2(y.y - f.y, y.x - f.x) / Math.PI
                    };
                }
                sess.records.set(key, rec);
            });
        }
        // Settle-pass obstacle continuity: flush the recorded
        // frozen shapes into the pass's obstacle array via the
        // pass's own oriented-box helper, at their branch-order
        // positions - before each live group, every frozen record
        // that precedes it in the captured group order; after the
        // group loop (beforeKey = null), the rest.
        function blitFlushObstacles(sess, r, o, beforeKey) {
            const limit = null == beforeKey ? Infinity : sess.orderIx.has(beforeKey) ? sess.orderIx.get(beforeKey) : -1;
            while (sess.flushIx < sess.frozenKeys.length) {
                const key = sess.frozenKeys[sess.flushIx];
                if (null != beforeKey && !(sess.orderIx.get(key) < limit)) break;
                sess.flushIx++;
                const rec = sess.records.get(key);
                if (!rec) continue;
                rec.icon && r.push(o(rec.icon.x, rec.icon.y, rec.icon.size, rec.icon.size));
                for (const c of rec.controls) r.push(o(c.x, c.y, c.w, c.h, c.angle));
                rec.label && r.push(o(rec.label.x, rec.label.y, rec.label.w, rec.label.h, rec.label.angle));
            }
        }
        function blitInsertArtifacts(sess, vault) {
            const img = document.createElementNS(BLIT_NS, "image");
            img.setAttribute("class", "sx-blit-raster"), img.setAttribute("aria-hidden", "true"), 
            img.setAttribute("x", "-700"), img.setAttribute("y", "-980"), img.setAttribute("width", "3200"), img.setAttribute("height", "3200"), 
            img.setAttribute("href", sess.rasterUrl), img.setAttributeNS(BLIT_XLINK, "xlink:href", sess.rasterUrl);
            const under = In.querySelector(":scope > .spoke-underlay");
            under ? In.insertBefore(img, under) : In.firstElementChild ? In.insertBefore(img, In.firstElementChild) : In.appendChild(img), 
            In.appendChild(vault);
        }
        // First swap, from the current full-vector settled DOM (the
        // raster-ready callback, or the end of a pending paint):
        // obstacle records are computed first, while the settled DOM
        // is intact; then each frozen segment is assembled into its
        // group exactly as P1's splice assembles it, deep-cloned
        // into the vault in branch order, and the original removed
        // from the visible flow; stack/underlay items the assembly
        // emptied and the frozen overlay hits go with it.
        function blitSwapFromDOM(sess) {
            if (!sess.rasterUrl || sess.swapped) return;
            blitBuildRecords(sess);
            const ix = blitIndexStacks(), vault = document.createElementNS(BLIT_NS, "g");
            vault.setAttribute("class", "sx-blit-vault"), vault.setAttribute("display", "none"), 
            sess.frozenKeys.forEach(key => {
                const el = In.querySelector(`.node-group[data-layout-key="${CSS.escape(key)}"]:not(.layout-exit-clone)`);
                if (!el) return;
                blitAssemble(blitPieces(key, el, ix), el), vault.appendChild(el.cloneNode(!0)), el.remove();
            }), ix.labelStack && Array.from(ix.labelStack.children).forEach(item => {
                item.childNodes.length || item.remove();
            }), ix.ctrlStack && Array.from(ix.ctrlStack.children).forEach(item => {
                item.childNodes.length || item.remove();
            }), ix.underlay && Array.from(ix.underlay.children).forEach(item => {
                item.childNodes.length || item.remove();
            }), ix.overlay && Array.from(ix.overlay.querySelectorAll("[data-id]")).forEach(n => {
                sess.frozenKeys.indexOf(n.dataset.id) >= 0 && n.remove();
            }), blitInsertArtifacts(sess, vault), sess.swapped = !0;
        }
        // End-of-paint artifact step for a continuing live session:
        // rebuild the vault from this paint's captured segments
        // (their pieces were found in the previous vault, already
        // assembled) and re-insert the raster image. The paint's own
        // passes never see the vault: the top-of-paint clear removed
        // it before any pass ran, and it is attached only now.
        function blitVaultFromCaptures(sess, scKeep, scSeg) {
            const vault = document.createElementNS(BLIT_NS, "g");
            vault.setAttribute("class", "sx-blit-vault"), vault.setAttribute("display", "none"), 
            sess.frozenKeys.forEach(key => {
                const seg = scSeg.get(key), el = scKeep.get(key);
                if (!seg || !el) return;
                blitAssemble(seg, el), vault.appendChild(el.cloneNode(!0));
            }), blitInsertArtifacts(sess, vault);
        }
        // End-of-paint session step, called from the end of Ar
        // (where the T3 restore block sits) with the paint's T3/P1
        // captures: start a session after a burst's first scoped
        // paint, or run the continuing paint's vault/image step
        // and re-arm the timer. Boundary-log entries do NOT gate
        // the session: under a contained scope they are suppressed
        // coupling candidates that by Stage 3's containment
        // construction do not change frozen geometry (moved-outside
        // = 0), so they cannot make the frozen-complement raster
        // stale.
        function blitPaintEnd(scKeep, scSeg) {
            const sess = blitSess;
            if (!scCtx) return;
            // AUTOFIT EXIT mark: an Autofit scoped apply (opClass
            // "applyAutofit", set by the editor's scopedScope) marks
            // the session its paint starts or continues, so
            // blitArmTimer's Repulsion branch can schedule that
            // session's own ending exit (see there). No other
            // opClass marks a session.
            const autofitPaint = "applyAutofit" === scCtx.opClass;
            if (!sess) {
                // Settle guard: a guard restore paint runs with
                // every branch frozen and must leave no session (and
                // no rest-timer) behind - session starts are held
                // off for the duration of the guard's paints.
                if (sgHoldBlitStart) return;
                // First scoped paint of a burst - it ran as a normal
                // P1 segment paint. Never start when animations are
                // on or when nothing is frozen.
                if (!!mn.animations || !scCtx.frozenBranches.size) return;
                blitStartSession(scCtx.frozenBranches);
                // Mark + re-arm: blitStartSession armed the timer
                // before the mark existed; the re-arm is what
                // schedules the exit in Repulsion mode (in every
                // other mode it re-arms the same rest-timer, exactly
                // as a continuing paint's re-arm does).
                if (autofitPaint && blitSess) blitSess.autofitExit = !0, blitArmTimer(blitSess);
                return;
            }
            if (sess.swapped) {
                if (!scSeg || !scKeep) return void blitEndSession();
                blitVaultFromCaptures(sess, scKeep, scSeg);
            } else if (sess.rasterReady) try {
                blitSwapFromDOM(sess);
            } catch (_) {
                return void (__sxErrLog("layout-blit-swap", _), blitStripArtifacts(), blitEndSession());
            }
            autofitPaint && (sess.autofitExit = !0), blitSess === sess && blitArmTimer(sess);
        }
        // Camera settle hook, run at the END of kh() - after any
        // mode downgrade has re-set the viewBox and after the final
        // transform commit: if a blit session is active and the
        // settled on-screen scale differs from the session's raster
        // scale by more than 25%, re-rasterize from the stored SVG
        // string at the new scale; the in-DOM image's href swaps
        // when the new raster is ready (blitRasterDone).
        function blitCameraHook() {
            const sess = blitSess;
            if (!sess || !sess.svgBody) return;
            const s = blitScaleNow();
            if (sess.scale && Math.abs(s - sess.scale) / sess.scale <= .25) return;
            blitRasterize(sess, s);
        }
        // DeKnotter base-state registry (E3): the most recent
        // _radialBase20 capture per stable item identity, refreshed by
        // rr.resolveRadialSiblings at every resolver entry and read back
        // through deknotter.baseState(). Keyed by stable identity -
        // never by wrapper object - because wrappers are rebuilt on
        // every fr() run while identities persist across solves.
        const dkBaseStates = new Map;
        // Bundle-side equivalents of the editor shell's bakedBranchBase /
        // bakedSubBase(name, "length") / bakedKinkBase: read the same
        // __SEXCAPADES_LAYOUT_DEFAULTS object, same fallback of 1.
        function dkBakedBranchBase(name) {
            const d = window.__SEXCAPADES_LAYOUT_DEFAULTS, e = d && d.branchOverrides ? d.branchOverrides[name] : null, v = e ? Number(e.length) : NaN;
            return v > 0 ? v : 1;
        }
        function dkBakedSubBase(name) {
            const d = window.__SEXCAPADES_LAYOUT_DEFAULTS, e = d && d.subcatOverrides ? d.subcatOverrides[name] : null, v = e ? Number(e.length) : NaN;
            return v > 0 ? v : 1;
        }
        function dkBakedKinkBase(id) {
            const d = window.__SEXCAPADES_LAYOUT_DEFAULTS, e = d && d.kinkOverrides ? d.kinkOverrides[id] : null, v = e ? Number(e.length) : NaN;
            return v > 0 ? v : 1;
        }
        function dkBakedNodeBase(id, field) {
            const d = window.__SEXCAPADES_LAYOUT_DEFAULTS;
            if (d && d.nodeOverrides && d.nodeOverrides[id]) {
                const v = Number(d.nodeOverrides[id][field || "length"]);
                if (v > 0) return v;
            }
            if (dkBakedKinkBase(id) > 0) return dkBakedKinkBase(id);
            if (dkBakedSubBase(id) > 0) return dkBakedSubBase(id);
            if (dkBakedBranchBase(id) > 0) return dkBakedBranchBase(id);
            return 1;
        }
        // Validate one phase patch: for every length override at the
        // branch, subcategory, and kink levels compute ratio = stored /
        // bakedBase and collect the per-level ratios plus every failure.
        function dkValidatePhasePatch(patch, cap) {
            const ratios = { branch: {}, subcat: {}, kink: {}, node: {} }, failures = [];
            const check = (map, level, baseFn) => {
                if (!map || "object" != typeof map) return;
                Object.keys(map).forEach(key => {
                    const entry = map[key];
                    if (!entry || "object" != typeof entry || !Object.prototype.hasOwnProperty.call(entry, "length")) return;
                    const base = baseFn(key), ratio = Number(entry.length) / base;
                    ratios[level][key] = ratio, (Number.isFinite(ratio) && ratio > 0 && ratio <= cap) || failures.push({
                        level: level,
                        key: key,
                        value: entry.length,
                        ratio: ratio,
                        cap: cap,
                        base: base
                    });
                });
            };
            if (patch) {
                check(patch.branchOverrides, "branch", dkBakedBranchBase);
                check(patch.subcatOverrides, "subcat", dkBakedSubBase);
                check(patch.kinkOverrides, "kink", dkBakedKinkBase);
                if (patch.nodeOverrides) {
                    check(patch.nodeOverrides, "node", dkBakedNodeBase);
                }
            }
            return { ratios: ratios, failures: failures };
        }
        // DeKnotter snapshot helpers (E2): API.get() returns container
        // copies whose per-entry objects are the SAME references as live
        // state, so a gate snapshot needs a true deep clone. Override and
        // angle maps are cloned per entry (one level per entry suffices -
        // entry fields are primitives); the two spoke auto-shrink arm maps hold
        // booleans, so a container copy is a true copy; scalars go by
        // value. The clone shares no object references with its source,
        // in either direction.
        const dkEntryMaps = { branchOverrides: 1, subcatOverrides: 1, kinkOverrides: 1, nodeOverrides: 1, subcatAngleOffsets: 1, kinkAngleOffsets: 1 };
        const dkArmMaps = { branchSpokeAutoShrink: 1, subcatSpokeAutoShrink: 1 };
        function dkCloneEntryMap(value) {
            const out = {};
            if (!value || "object" != typeof value) return out;
            return Object.keys(value).forEach(key => {
                const entry = value[key];
                out[key] = entry && "object" == typeof entry ? Object.assign({}, entry) : entry;
            }), out;
        }
        // F8 naming note: this "snapshot" is the LAYOUT-SETTINGS
        // snapshot - a deep clone of the dials object (layout state
        // only). It is NOT the sharing section's profile/data
        // snapshot; the two share a word, not a mechanism. Every
        // layout-side snapshot()/restore() (driver API, untangler)
        // means THIS one.
        function dkDeepCloneLayout(state) {
            const out = {};
            if (!state || "object" != typeof state) return out;
            return Object.keys(state).forEach(key => {
                const value = state[key];
                out[key] = dkEntryMaps[key] ? dkCloneEntryMap(value) : dkArmMaps[key] ? value && "object" == typeof value ? Object.assign({}, value) : value : value;
            }), out;
        }
        // Canonical stable stringify (E2): keys sorted at every level, so
        // two layout states can be compared for exact equality as strings.
        function dkStableStringify(value) {
            if (null === value || "object" != typeof value) {
                const s = JSON.stringify(value);
                return void 0 === s ? "null" : s;
            }
            return Array.isArray(value) ? "[" + value.map(dkStableStringify).join(",") + "]" : "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + dkStableStringify(value[key])).join(",") + "}";
        }
