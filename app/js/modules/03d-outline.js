        function sxEndOutlineDrag(e = zo) {
            if (e) {
                e.input.classList.remove("is-dragging", "is-clear-preview", "is-arm-open"), e.thumb?.remove(), sxOutlineArmHide();
                try {
                    e.input.hasPointerCapture?.(e.pointerId) && e.input.releasePointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
            }
        }
        function sxDragOutlineSlider(e) {
            const t = zo;
            if (!t || t.pointerId !== e.pointerId) return;
            const n = t.rect, i = e.clientX < n.left - 18 || e.clientX > n.right + 18;
            // The drag thumb is PROJECTED onto the track (2026-11-26):
            // its X is the cursor clamped to the track's X range and
            // its Y is locked to the track's vertical centre, so it
            // marks the lean position ON the track and never follows
            // the cursor's raw 2D position. The appetite arm (below)
            // is a separate overlay and still sets appetite.
            var px = Math.min(Math.max(e.clientX, n.left), n.right), py = n.top + n.height / 2;
            t.clear = i, t.input.classList.toggle("is-clear-preview", i), t.thumb.style.left = px + "px",
            t.thumb.style.top = py + "px", t.thumb.style.background = i ? "var(--red-deep)" : sxInterestColor(Number(t.input.value));
            // Appetite arm: a vertical drag while holding opens the
            // arm (after 10px, so a purely horizontal drag never
            // shows it); the arm then tracks the appetite live and
            // writes it through the persister route. The arm reads
            // only the window pointermove events -- pointer capture
            // is never required for it. While the pointer is in the
            // slide-off clear zone the clear takes precedence and no
            // appetite is written.
            if (!i && t.startY !== undefined && t.startApp !== undefined) {
                var dy = e.clientY - t.startY;
                if (!t.armShown && Math.abs(dy) > 10 && !t.input.dataset.placement && sxOutlineArmWritable(t.topicId, t.dir, Go)) {
                    t.armShown = true;
                    t.input.classList.add("is-arm-open");
                    sxOutlineArmShow(t);
                }
                if (t.armShown) {
                    var app = sxOutlineArmAppetite(t.startApp, t.startY, e.clientY, t.armInner || 160);
                    sxOutlineArmMove(t, app);
                    if (app !== t.app) {
                        t.app = app;
                        sxOutlineWriteAppetite(t.topicId, t.dir, app, Go);
                        t.input.style.setProperty("--outline-thumb", sxInterestColor(app));
                    }
                }
            }
        }
        // End a row drag (pointerup path): commit the leaning, then
        // any appetite the arm set (the pole is rated by the leaning
        // write first, so the appetite's unrated guard passes), then
        // repaint + milestone bookkeeping. The window pointerup and
        // the lostpointercapture fallback both run this; a
        // pointercancel only cleans up (live writes already stand).
        function sxOutlineFinishDrag(e) {
            if (!zo || zo.pointerId !== e.pointerId) return;
            sxDragOutlineSlider(e);
            const t = zo, {input: n, clear: i} = t;
            if (zo = null, sxEndOutlineDrag(t), !Go) return;
            const previousRatedCount = Number(n.dataset.milestoneStartRated), a = getOutlineRow(n);
            delete n.dataset.milestoneStartRated;
            const place = n.dataset.placement;
            if (place === "advocacy" || place === "receptivity") sxCommitLinePlacement(a.dataset.outlineId, place, i ? NaN : Number(n.value), Go, !0);
            else {
                i ? (sxOutlineClearDir(a.dataset.outlineId, n.dataset.outlineDirection, Go) || sxClearTopicRating(a.dataset.outlineId, n.dataset.outlineDirection, !1, Go)) : (sxOutlineWriteDir(a.dataset.outlineId, n.dataset.outlineDirection, Number(n.value), Go) || sxStoreFlankRating(a.dataset.outlineId, n.dataset.outlineDirection, Number(n.value), !0, Go));
                t.armShown && !i && sxOutlineWriteAppetite(t.topicId, t.dir, t.app, Go);
            }
            sxSyncOutlineRow(a), sxRefreshHotListStatus(), sxIsOutlineRated(a.dataset.outlineId, Go) ? os.add(a.dataset.outlineId) : os.delete(a.dataset.outlineId), 
            checkMilestoneTransition(Go, previousRatedCount);
        }
        Ro.addEventListener("pointerover", e => {
            if ("mouse" !== e.pointerType || !Bs.matches) return;
            const t = sxOutlineTooltipHost(e.target);
            t && !t.contains(e.relatedTarget) && sxShowOutlineTooltip(t, sxOutlineTooltipText(t), sxPointerPoint(e));
        }), Ro.addEventListener("pointermove", e => {
            if ("mouse" !== e.pointerType || !Ns || !Fs.visibleFor(Ns)) return;
            const t = sxOutlineTooltipHost(e.target);
            t && Ns === t && (_s = sxPointerPoint(e), Fs.position(_s, Ns));
        }), Ro.addEventListener("pointerout", e => {
            if ("mouse" !== e.pointerType || !Bs.matches) return;
            const t = sxOutlineTooltipHost(e.target);
            if (!t || t.contains(e.relatedTarget)) return;
            const n = sxOutlineTooltipHost(e.relatedTarget);
            n ? sxShowOutlineTooltip(n, sxOutlineTooltipText(n), sxPointerPoint(e)) : sxHideOutlineTooltip();
        }), Ro.addEventListener("focusin", e => {
            const t = sxOutlineTooltipHost(e.target);
            t && sxShowOutlineTooltip(t, sxOutlineTooltipText(t));
        }), Ro.addEventListener("click", e => {
            const t = e.target instanceof Element ? __sxClosestAction(e.target, "glancePracticeIcon") : null;
            var n, i;
            t && (e.preventDefault(), e.stopPropagation(), n = t, i = sxPointerPoint(e), sxShowOutlineTooltip(n, n?.dataset.popularityTooltip || "", i));
        }, !0), Ro.addEventListener("focusout", e => {
            const t = sxOutlineTooltipHost(e.target);
            t && !t.contains(e.relatedTarget) && sxHideOutlineTooltip();
        }), Ro.addEventListener("selectstart", e => {
            e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") && e.preventDefault();
        }), Ro.addEventListener("contextmenu", e => {
            e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") && e.preventDefault();
        }), Ro.addEventListener("pointerdown", e => {
            if (e.target instanceof Element && __sxClosestAction(e.target, "glancePracticeIcon")) return;
            const n = e.target instanceof Element ? __sxClosestAction(e.target, "outlineDescTriggerRich") : null;
            if (!n) return sxClearTooltipDelay(), void sxHideOutlineTooltip();
            if (("mouse" === e.pointerType || "pen" === e.pointerType) && 0 !== e.button) return;
            const sxOutlineNow = performance.now();
            if (sxOutlineLastEl === n && sxOutlineNow - sxOutlineLastTime < 520 && Math.hypot(e.clientX - sxOutlineLastX, e.clientY - sxOutlineLastY) < 60) {
                sxOutlineLastTime = 0, sxOutlineLastEl = null, sxClearTooltipDelay(), sxRememberTooltipAnchor(n), sxShowOutlineAbout(n, {
                    x: e.clientX,
                    y: e.clientY,
                    pointerType: e.pointerType || "touch"
                });
                return;
            }
            sxClearTooltipDelay();
            const i = {
                pointerId: e.pointerId,
                trigger: n,
                startX: e.clientX,
                startY: e.clientY,
                t: sxOutlineNow,
                longPressed: !1,
                timer: 0
            };
            i.timer = t.setTimeout(() => {
                Ds === i && (i.longPressed = !0, sxRememberTooltipAnchor(n), sxShowOutlineAbout(n, {
                    x: i.startX,
                    y: i.startY,
                    pointerType: e.pointerType || "touch"
                }));
            }, 520), Ds = i;
        }), window.addEventListener("pointermove", e => {
            const t = Ds;
            if (t && t.pointerId === e.pointerId) return t.longPressed ? (_s = sxPointerPoint(e), void Fs.position(_s, Ns)) : void (Math.hypot(e.clientX - t.startX, e.clientY - t.startY) > ("touch" === e.pointerType || "pen" === e.pointerType ? 28 : 9) && sxClearTooltipDelay());
        }, !0), window.addEventListener("pointerup", e => {
            const n = Ds;
            n && n.pointerId === e.pointerId && (n.timer && t.clear(n.timer), n.longPressed ? sxRememberTooltipAnchor(n.trigger) : (sxOutlineLastEl = n.trigger, sxOutlineLastTime = performance.now(), sxOutlineLastX = e.clientX, sxOutlineLastY = e.clientY), 
            Ds = null);
        }, !0), window.addEventListener("pointercancel", e => {
            const n = Ds;
            if (n && (!e.pointerId || n.pointerId === e.pointerId) && !n.longPressed && n.t && performance.now() - n.t >= 400 && Math.hypot((e.clientX || n.startX) - n.startX, (e.clientY || n.startY) - n.startY) <= 28) {
                n.timer && t.clear(n.timer), n.longPressed = !0, sxRememberTooltipAnchor(n.trigger), sxShowOutlineAbout(n.trigger, {
                    x: n.startX,
                    y: n.startY,
                    pointerType: "touch"
                }), Ds = null;
                return;
            }
            sxClearTooltipDelay();
        }, !0), Ro.addEventListener("contextmenu", e => {
            const t = __sxClosestAction(e.target, "outlineDescTriggerRich");
            t && Rs === t && (e.preventDefault(), e.stopPropagation());
        }, !0), Ro.addEventListener("click", e => {
            const n = __sxClosestAction(e.target, "outlineDescTriggerRich");
            if (!n) return;
            if (!sxOutlineDescClickWillToggle(n)) { sxOutlineDescClickToggle(n, false); return; }
            e.preventDefault(), e.stopPropagation();
            const isClose = (Rs === n);
            window.clearTimeout(sxOutlineClickTimer), sxOutlineClickTarget = n, sxOutlineClickTimer = window.setTimeout(() => {
                sxOutlineClickTimer = 0, sxOutlineClickTarget = null, sxOutlineDescClickToggle(n, isClose);
            }, 280);
        }), Ro.addEventListener("dblclick", e => {
            sxOutlineRowDblclick(e);
        }), Ro.addEventListener("keydown", e => {
            const t = __sxClosestAction(e.target, "outlineBranchDisclosure");
            if (t && ("Enter" === e.key || " " === e.key)) {
                e.preventDefault(), e.stopPropagation();
                const n = __sxClosestAction(t, "outlineSubcategory");
                if (n) return void n.querySelector(":scope>.outline-subcategory-summary")?.click();
                const i = __sxClosestAction(t, "outlineBranch");
                return void (i && (i._toggleOutlineCategory ? i._toggleOutlineCategory() : i.open = !i.open));
            }
            const n = __sxClosestAction(e.target, "outlineDescTriggerRich");
            if (n && ("Enter" === e.key || " " === e.key)) return e.shiftKey ? (e.preventDefault(), 
            e.stopPropagation(), void (Ns === n && Fs.visibleFor(n) ? sxHideOutlineTooltip() : sxShowOutlineAbout(n))) : void (__sxClosestAction(n, "summaryAncestor") || sxToggleOutlineNest(n) && (e.preventDefault(), 
            e.stopPropagation()));
        }), sxOutlineScroller().addEventListener("scroll", sxHideOutlineTooltip, {
            passive: !0
        }), // The inline row's sliders write one direction at a time.
        // For a 2-pole (pair-topic linear) slider on a stance skin the
        // direction is a pole of the primary (advocacy) placement: a
        // flat To() would be invisible to ca() (it reads the placement
        // object), so the write goes through the placement persister,
        // seeded from the current values so an unrated topic is
        // created whole and a rated one keeps its other pole and
        // stored intensity. The 1-pole slider and the trilinear line
        // keep their flat single-number write, and n-pole topics stay
        // on their N-gon/radar widgets. Returns true when it handled
        // the write; false means the caller uses the flat To()/Fo().
        function sxOutlineWriteDir(topicId, dir, value, profileId) {
            if (!sxDualPlacements(topicId)) return false;
            var shape = (typeof sxWidgetConfig === "function") ? sxWidgetConfig(topicId) : null;
            if (!shape || !shape.keys || shape.keys.length !== 2 || shape.keys.indexOf(dir) === -1) return false;
            var rec = sxDecodeTopicStance(topicId, profileId);
            if (!rec) return false;
            var vals = {};
            shape.keys.forEach(k => { vals[k] = Math.max(-100, Math.min(100, Number(rec[k]) || 0)); });
            vals[dir] = Math.max(-100, Math.min(100, Number(value) || 0));
            sxPersistAdvocacyReceptivity(topicId, "advocacy", vals, rec.advocacyIntensity, profileId);
            return true;
        }
        // Clear one pole of a 2-pole stance placement: the persister
        // merges with the stored placement, so the pole is dropped
        // from the stored object first or the merge would resurrect
        // it; if it was the last pole the whole placement is cleared.
        function sxOutlineClearDir(topicId, dir, profileId) {
            if (!sxDualPlacements(topicId)) return false;
            var shape = (typeof sxWidgetConfig === "function") ? sxWidgetConfig(topicId) : null;
            if (!shape || !shape.keys || shape.keys.length !== 2 || shape.keys.indexOf(dir) === -1) return false;
            var rec = sxDecodeTopicStance(topicId, profileId);
            if (!rec || !rec.advocacy || typeof rec.advocacy !== "object") return false;
            var vals = {};
            shape.keys.forEach(k => { if (k !== dir && rec[k + "Known"] && Number.isFinite(Number(rec[k]))) vals[k] = rec[k]; });
            if (Object.keys(vals).length === 0) {
                sxClearAdvocacyReceptivity(topicId, "advocacy", profileId);
                return true;
            }
            var store = (typeof vt !== "undefined" && vt[profileId]) ? vt[profileId][topicId] : null;
            if (store && store.advocacy) delete store.advocacy[dir];
            sxPersistAdvocacyReceptivity(topicId, "advocacy", vals, rec.advocacyIntensity, profileId);
            return true;
        }
        // Appetite for one inline-slider direction (the arm): write
        // the appetite the vertical drag sets, through the same route
        // the placard/popup cross slider uses. Mirrors
        // sxOutlineDirAppetite's read order so the write lands where
        // the read looks: a stored per-flank intensity first, then
        // the advocacy placement for a dual-placement 2-pole topic,
        // then the record's own intensity for a line/monopole, and
        // finally the per-flank key for a classic flank that never
        // stored one. Returns false (no-op) when the flank is
        // unrated -- an appetite with no leaning to attach to would
        // be an orphan intensity. (The pointerup finish writes the
        // leaning first, so a pure vertical drag on an unrated
        // slider still lands its appetite on release.)
        function sxOutlineWriteAppetite(topicId, dir, app, profileId) {
            if (!topicId || !dir) return false;
            var rec = null;
            try { rec = sxDecodeTopicStance(topicId, profileId); } catch (err) { rec = null; }
            if (!rec) return false;
            if (!rec[dir + "Known"]) return false;
            var isSingle = Boolean(rec.isMonopole) || ((typeof sxWidgetConfig === "function") && sxWidgetConfig(topicId) && sxWidgetConfig(topicId).single);
            app = Math.max(-100, Math.min(100, Math.round(Number(app) || 0)));
            if (rec[dir + "IntensityKnown"] && !isSingle) {
                if (typeof sxStoreFlankRating !== "function") return false;
                sxStoreFlankRating(topicId, dir + "Intensity", app, !1, profileId);
                return true;
            }
            if (typeof sxDualPlacements === "function" && sxDualPlacements(topicId)) {
                var shape = (typeof sxWidgetConfig === "function") ? sxWidgetConfig(topicId) : null;
                if (shape && shape.keys && shape.keys.indexOf(dir) !== -1) {
                    var vals = {};
                    shape.keys.forEach(k => { vals[k] = Math.max(-100, Math.min(100, Number(rec[k]) || 0)); });
                    if (typeof sxPersistAdvocacyReceptivity === "function") {
                        sxPersistAdvocacyReceptivity(topicId, "advocacy", vals, app, profileId);
                        return true;
                    }
                    return false;
                }
            }
            if (dir === "line") {
                if (typeof sxStoreFlankRating !== "function") return false;
                sxStoreFlankRating(topicId, "intensity", app, !1, profileId);
                return true;
            }
            // A single (monopole) topic on the classic skin has no
            // appetite storage: its rating is one bare number, and
            // To() on a single topic overwrites the whole record
            // with the scalar -- writing "intensity" there would
            // destroy the rating. The appetite for a classic single
            // IS the leaning (derived), so there is nothing to store
            // and the arm does not open for it.
            if (isSingle) return false;
            if (typeof sxStoreFlankRating !== "function") return false;
            sxStoreFlankRating(topicId, dir + "Intensity", app, !1, profileId);
            return true;
        }
        // Whether the arm can write an appetite here (the gate the
        // drag uses before opening the arm): the flank must be rated,
        // and the appetite must have a home -- a stored per-flank
        // intensity, a dual placement, or the record's own intensity
        // on a line. A classic single has none (see above), so the
        // arm never opens for it. Re-checked live as the pointer
        // moves, so rating the pole mid-gesture still opens the arm.
        function sxOutlineArmWritable(topicId, dir, profileId) {
            var rec = null;
            try { rec = sxDecodeTopicStance(topicId, profileId); } catch (err) { rec = null; }
            if (!rec || !rec[dir + "Known"]) return false;
            var isSingle = Boolean(rec.isMonopole) || ((typeof sxWidgetConfig === "function") && sxWidgetConfig(topicId) && sxWidgetConfig(topicId).single);
            if (rec[dir + "IntensityKnown"] && !isSingle) return true;
            if (typeof sxDualPlacements === "function" && sxDualPlacements(topicId)) {
                var shape = (typeof sxWidgetConfig === "function") ? sxWidgetConfig(topicId) : null;
                if (shape && shape.keys && shape.keys.indexOf(dir) !== -1) return true;
            }
            if (dir === "line") return true;
            if (isSingle) return false;
            return true;
        }
        Ro.addEventListener("input", e => {
            const t = __sxClosestAction(e.target, "outlineNoteInput");
            if (t && Go) {
                const e = getOutlineRow(t), n = e.dataset.outlineId, i = t.value.trim();
                tt[Go] || (tt[Go] = {}), i ? tt[Go][n] = [ i ] : delete tt[Go][n], sxTouchProfile(Go);
                const a = getOutlineCell(e, "note");
                return void (a && (a.dataset.hasNote = String(Boolean(i))));
            }
            const n = __sxClosestAction(e.target, "outlineDirection");
            if (!n || !Go) return;
            const i = getOutlineRow(n).dataset.outlineId;
            "milestoneStartRated" in n.dataset || (n.dataset.milestoneStartRated = String(sxOutlineRatedCounts(Go).rated));
            const place = n.dataset.placement;
            if (place === "advocacy" || place === "receptivity") sxCommitLinePlacement(i, place, Number(n.value), Go, !1);
            else sxOutlineWriteDir(i, n.dataset.outlineDirection, Number(n.value), Go) || sxStoreFlankRating(i, n.dataset.outlineDirection, Number(n.value), !1, Go);
            os.add(i), sxSyncOutlineRow(getOutlineRow(n)),
            sxRefreshHotListStatus();
        }), Ro.addEventListener("change", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            const n = Number(t.dataset.milestoneStartRated);
            delete t.dataset.milestoneStartRated, os.add(getOutlineRow(t).dataset.outlineId), checkMilestoneTransition(Go, n);
        }), Ro.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "outlineNote");
            if (t && Go) {
                const e = getOutlineRow(t), n = e.querySelector(".outline-note-editor"), i = n.hidden;
                return n.hidden = !i, t.setAttribute("aria-expanded", String(i)), void (i && requestAnimationFrame(() => getOutlineCell(e, "note-input")?.focus({
                    preventScroll: !0
                })));
            }
            const n = __sxClosestAction(e.target, "outlineMarkFlag");
            if (!n || !Go) return;
            const previousRatedCount = sxOutlineRatedCounts(Go).rated, i = getOutlineRow(n), a = i.dataset.outlineId;
            if (n.dataset.outlineFlag) {
                const e = "fantasy" === n.dataset.outlineFlag ? Je : et;
                e[Go] || (e[Go] = {}), e[Go][a] ? delete e[Go][a] : e[Go][a] = !0;
            } else {
                const e = n.dataset.outlineMark, t = (Qe[Go] || {})[a] || "";
                Qe[Go][a] = t === e ? "" : e, Qe[Go][a] || delete Qe[Go][a];
            }
            sxTouchProfile(Go), os.add(a), sxSyncOutlineRow(i), sxRefreshHotListStatus(), sxRefreshSyncGlance(), checkMilestoneTransition(Go, previousRatedCount);
        }), Ro.addEventListener("keydown", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            if (sxEnsureOutlineAudio(), "Delete" !== e.key && "Backspace" !== e.key) return;
            e.preventDefault();
            const n = getOutlineRow(t);
            const place = t.dataset.placement;
            if (place === "advocacy" || place === "receptivity") sxCommitLinePlacement(n.dataset.outlineId, place, NaN, Go, !0);
            else sxOutlineClearDir(n.dataset.outlineId, t.dataset.outlineDirection, Go) || sxClearTopicRating(n.dataset.outlineId, t.dataset.outlineDirection, !1, Go);
            sxIsOutlineRated(n.dataset.outlineId, Go) ? os.add(n.dataset.outlineId) : os.delete(n.dataset.outlineId),
            sxSyncOutlineRow(n), sxRefreshHotListStatus();
        }), Ro.addEventListener("pointerdown", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            sxEnsureOutlineAudio(), sxEndOutlineDrag();
            const n = document.createElement("span");
            n.className = "outline-drag-thumb", n.setAttribute("aria-hidden", "true"), document.body.append(n);
            const row = getOutlineRow(t), topicId = row ? row.dataset.outlineId : null, dir = t.dataset.outlineDirection;
            var startApp = Number(t.value) || 0;
            try { startApp = sxOutlineDirAppetite(sxDecodeTopicStance(topicId, Go), dir, Number(t.value)); } catch (err) { startApp = Number(t.value) || 0; }
            zo = {
                input: t,
                rect: t.getBoundingClientRect(),
                pointerId: e.pointerId,
                clear: !1,
                thumb: n,
                topicId: topicId,
                dir: dir,
                startY: e.clientY,
                startApp: startApp,
                app: startApp,
                armShown: !1,
                armInner: 160
            }, t.classList.add("is-dragging");
            try {
                t.setPointerCapture(e.pointerId);
            } catch (e) { __sxErrLog("pointer-capture", e); }
            sxDragOutlineSlider(e);
        }), window.addEventListener("pointermove", sxDragOutlineSlider, !0), window.addEventListener("pointerup", sxOutlineFinishDrag, !0), Ro.addEventListener("lostpointercapture", e => {
            // Engine quirk guard (same as 03f3): if capture is lost
            // without an up, treat it as the release at wherever the
            // drag currently sits -- the pointerup path, not a
            // cancel, so the leaning and any arm appetite commit.
            if (!zo || zo.pointerId !== e.pointerId || e.target !== zo.input) return;
            sxOutlineFinishDrag(e);
        }, !0), window.addEventListener("pointercancel", e => {
            if (!zo || zo.pointerId !== e.pointerId) return;
            const t = zo;
            zo = null, sxEndOutlineDrag(t);
        }, !0);
        let Zs = 0, Qs = !1;
        function sxLoadProfileMap(e, t = {}) {
            // Tab-switch camera fix (2026-10-30): profile activation
            // re-renders via Mr() but never refit, so the camera kept
            // whatever zoom/pan the previous view left behind. Refit
            // on activation, the same fitted state a fresh load ends
            // in; Ih()'s settle chain re-fits again if this render
            // paints in chunks. Detail level and profile data are
            // untouched.
            if (!vt[e]) return;
            ft[e] && "group" === ft[e].kind ? (sxHoldExpansion(), sxExpandGroupMap()) : sxReleaseExpansion();
            sxCloseLoadMenu(), sxCloseAddMenu(), sxCloseSampleSubmenus(), sxDeactivateMatchStage(), wf && sxDismissClosePrompt(), It = e, Mt = e, Nt = null, sxRenderProfileTabs();

            // Layer Vault (Step 1): If this profile was already rendered with
            // identical state, restore its DOM fragment instantly (< 5ms).
            if (sxVaultTryRestore(e)) {
                try { sxRefreshSyncGlance(); } catch (_) {}
                window.__sxLoad && window.__sxLoad(100);
                try { sxApplyMapFit(); } catch (_) {}
                return;
            }

            const name = (wt && wt[e]) || e;
            window.__sxRouteChunkPaint = 40;
            if (typeof window.__sxLoadSessionStart === "function") {
                window.__sxLoadSessionStart({
                    label: "Loading " + name + "…"
                });
            }
            const r = sxRequestMapPaint({
                animate: !1,
                forceRepaint: !0
            });
            if (r && typeof r.then === "function") {
                r.then(() => { sxApplyMapFit(); });
            } else {
                sxApplyMapFit();
            }
        }
        function sxToggleCompareProfile(e) {
            if (!vt[e]) return;
            const t = an;
            en.has(e) ? sxSel(e, "remove") : (!en.size && Mt && vt[Mt] && (sxSel(Mt), sxProfileColor(Mt)), sxSel(e), 
            sxProfileColor(e)), qd = [], Wd = null, sxRenderProfileTabs();
            if (t) {
                window.__sxRouteChunkPaint = 40;
                if (typeof window.__sxLoadSessionStart === "function") {
                    window.__sxLoadSessionStart({
                        label: "Comparing profiles…"
                    });
                }
                const r = sxRequestMapPaint({
                    animate: !1,
                    forceRepaint: !0
                });
                if (r && typeof r.then === "function") {
                    r.then(() => { sxApplyMapFit(); });
                } else {
                    sxApplyMapFit();
                }
            }
        }
        Ho && Ho.addEventListener("click", () => {
            const e = Date.now();
            e - Zs < 300 || (Zs = e, Qs = !1, sxSetOutlineTimerPaused(!Zo));
        }), document.addEventListener("visibilitychange", () => {
            document.hidden ? Zo || (Qs = !0, ZoAuto = !0, sxSetOutlineTimerPaused(!0)) : Qs && (Qs = !1, ZoAuto = !1, sxSetOutlineTimerPaused(!1));
        }), Wo && Wo.addEventListener("click", function() {
            Do && Do.open && Go && (Qs = !1, Yo = 0, Vo = Date.now(), Qo = !0, Zo = !1, t.clear(Xo),
            Xo = t.setInterval(sxRefreshHotListStatus, 1e3), sxSyncTimerPauseButton(), sxRefreshHotListStatus());
        }), Uo && Uo.addEventListener("change", () => {
            const n = !Zo;
            sxSetOutlineTimerPaused(Uo.checked), Uo.checked && n && function() {
                try {
                    let n = e.byId("outlineTimerPauseNote");
                    n || (n = document.createElement("div"), n.id = "outlineTimerPauseNote", n.setAttribute("role", "status"), 
                    n.style.cssText = "position:fixed;z-index:9999;pointer-events:none;opacity:0;transition:opacity .3s ease;background:var(--panel,#222);color:var(--ink,#fff);border:1px solid var(--line-strong,#666);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.45);max-width:92vw;overflow:hidden;text-overflow:ellipsis;", 
                    document.body.appendChild(n)), n.textContent = "Timer paused — showing rated topics";
                    const i = e.byId("outlineTimerToggle");
                    if (i) {
                        const e = i.getBoundingClientRect(), t = Math.max(8, Math.min(window.innerWidth - 8, e.left + e.width / 2));
                        n.style.left = t + "px", n.style.transform = "translateX(-50%)", n.style.top = Math.min(window.innerHeight - 60, e.bottom + 8) + "px";
                    }
                    xs && t.clear(xs), requestAnimationFrame(() => {
                        try {
                            n.style.opacity = "1";
                        } catch (e) { __sxErrLog("label-flash", e); }
                    }), xs = t.setTimeout(() => {
                        try {
                            n.style.opacity = "0";
                        } catch (e) { __sxErrLog("label-flash", e); }
                        xs = 0;
                    }, 3e3);
                } catch (e) { __sxErrLog("label-flash", e); }
            }(), Ro && Ro.querySelectorAll(".outline-branch").forEach(e => e._syncOutlineVisibility?.(Number(e.dataset.outlineVisible) || 3));
        }), e.byId("outlineQuickstartDismiss")?.addEventListener("click", () => {
            is = !0, e.byId("outlineQuickstartTip") && (e.byId("outlineQuickstartTip").hidden = !0);
        }), e.byId("doneOutlineButton") && e.byId("doneOutlineButton").addEventListener("click", function() {
            if (!Do || !Do.open || !Go) return;
            const e = Go, t = sxOutlineRatedCounts(e), n = sxOutlineTimerSeconds(), i = Qo;
            if (e === Et) return Vy = e => {
                i && sxRecordTimer(e, "outline", n, t.rated, t.total, {
                    timerRan: !0
                }), requestAnimationFrame(() => sxShowOutlinePayoff(e, t));
            }, sxChunkClose(() => {
                sxCloseHotList(!1), sxOpenProfileDetails(null), sm.textContent = `Create a profile to keep ${t.rated} rated topic${1 === t.rated ? "" : "s"}.`;
            });
            i && sxRecordTimer(e, "outline", n, t.rated, t.total, {
                timerRan: !0
            }), sxSendConsentedSurvey("save", e), sxChunkClose(() => {
                sxCloseHotList(!1), xg.textContent = `Submitted ${t.rated} of over 400 topics${i ? ` after ${sxClockText(n)} total` : ""}. Ratings${i ? " and accumulated time" : ""} saved with ${wt[e]}.`, 
                requestAnimationFrame(() => sxShowOutlinePayoff(e, t));
            });
        }), e.byId("startListRatingButton")?.addEventListener("click", () => {
            sxOpenHotList(sxActiveProfileId());
        });
        function sxApplyOutlineSearch() {
            const query = (e.byId("outlineSearch")?.value || "").trim().toLowerCase();
            Ro && Ro.querySelectorAll(".outline-branch").forEach(branch => {
                let anyVisible = false;
                branch.querySelectorAll(".outline-row").forEach(row => {
                    const label = row.querySelector(".outline-topic-label")?.textContent?.toLowerCase() || "";
                    const crumb = row.querySelector(".outline-topic-crumb")?.textContent?.toLowerCase() || "";
                    const matches = !query || label.includes(query) || crumb.includes(query);
                    row.hidden = !matches;
                    if (matches) anyVisible = true;
                });
                if (query) {
                    branch.hidden = !anyVisible;
                    if (anyVisible) branch.open = true;
                } else {
                    branch.hidden = false;
                    branch._syncOutlineVisibility?.(Number(branch.dataset.outlineVisible || 0));
                }
            });
        }
        const outlineSearchEl = e.byId("outlineSearch");
        outlineSearchEl && outlineSearchEl.addEventListener("input", sxApplyOutlineSearch);
        [ e.byId("outlineModeLadder"), e.byId("outlineModeCategory") ].forEach(btn => {
            if (!btn) return;
            btn.addEventListener("click", () => {
                const mode = btn.dataset.outlineMode === "category" ? "category" : "ladder";
                if (window.__sxOutlineViewMode === mode && !window.__sxOnDeck) return;
                window.__sxOutlineViewMode = mode;
                if (window.__sxOnDeck && typeof window.__sxOnDeckClear === "function") window.__sxOnDeckClear();
                if (typeof window.__sxSyncOutlineModeButtons === "function") window.__sxSyncOutlineModeButtons();
                sxRenderHotList();
            });
        });
        const tl = e.byId("profileTabs");
        let nl = null, il = null, al = null, rl = 0, ol = null, tfHide = 0;
        function sxHideMapTooltip() {
            nl && Fs.visibleFor(nl) && Fs.hide(), nl = null, il = null;
        }
        function sxPlaceMapTooltip(e = nl, t = il) {
            e && Fs.visibleFor(e) && Fs.position(t, e);
        }
        function sxShowMapTooltip(e, t = !1, n = null) {
            const i = e?.dataset?.uiTooltip;
            i && (nl = e, il = n, Fs.show(e, {
                name: e.dataset.tooltipName,
                definition: e.dataset.tooltipDefinition || i,
                value: e.dataset.tooltipValue,
                nameColor: e.dataset.tooltipNameColor,
                point: n,
                autoHide: t
            }));
        }
        const dl = window.matchMedia ? window.matchMedia("(hover: hover)") : {
            matches: !0
        };
        function sxBindMapTooltip(e) {
            e && "true" !== e.dataset.mapTooltipBound && (e.dataset.mapTooltipBound = "true", 
            e.addEventListener("pointerenter", t => {
                !dl.matches || t.pointerType && "mouse" !== t.pointerType || sxShowMapTooltip(e, !1, sxPointerPoint(t));
            }), e.addEventListener("pointermove", t => {
                nl !== e || !Fs.visibleFor(e) || !dl.matches || t.pointerType && "mouse" !== t.pointerType || (il = sxPointerPoint(t), 
                sxPlaceMapTooltip());
            }), e.addEventListener("pointerleave", t => {
                nl !== e || t.relatedTarget && e.contains(t.relatedTarget) || sxHideMapTooltip();
            }));
        }
        const pl = e => e && e.closest ? __sxClosestAction(e, "uiTooltip") : null;
        document.addEventListener("pointerover", e => {
            if (!dl.matches || e.pointerType && "mouse" !== e.pointerType) return;
            const t = pl(e.target);
            t && sxShowMapTooltip(t, !1, sxPointerPoint(e));
        }), document.addEventListener("pointermove", e => {
            if (!nl || !Fs.visibleFor(nl)) return;
            const t = pl(e.target);
            ("mouse" === e.pointerType && t === nl || "mouse" !== e.pointerType && nl.contains(e.target)) && (il = sxPointerPoint(e), 
            sxPlaceMapTooltip());
        }), document.addEventListener("pointerout", e => {
            if (!dl.matches || e.pointerType && "mouse" !== e.pointerType) return;
            if (!pl(e.target)) return;
            const t = pl(e.relatedTarget);
            t ? sxShowMapTooltip(t, !1, sxPointerPoint(e)) : sxHideMapTooltip();
        }), document.addEventListener("focusin", e => {
            const t = e.target.closest && __sxClosestAction(e.target, "uiTooltip");
            t && sxShowMapTooltip(t);
        }), document.addEventListener("focusout", e => {
            e.target.closest && __sxClosestAction(e.target, "uiTooltip") && (e.relatedTarget && e.relatedTarget.closest && __sxClosestAction(e.relatedTarget, "uiTooltip") || sxHideMapTooltip());
        }), window.__sxOnPtr( e => {
            if (nl && Fs.visibleFor(nl) && !nl.contains(e.target) && sxHideMapTooltip(), "mouse" === e.pointerType) return;
            const t = e.target.closest && __sxClosestAction(e.target, "uiTooltipHover");
            t && sxShowMapTooltip(t, !0, sxPointerPoint(e));
        }, !0),         document.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const el = __sxClosestAction(e.target, "tooltipTapFirst");
            if (!el) return;
            // A touch on a map node used to die here: the first tap
            // showed the little tooltip and stopImmediatePropagation
            // kept the hold and the second tap from ever reaching the
            // map, so the About and note sheet never opened. Map nodes
            // keep that gesture. Buttons elsewhere still tap-to-show.
            if (el.closest && el.closest("#mapSvg")) return;
            const useCard = Boolean(el.dataset && el.dataset.uiTooltip), useOutline = !useCard && Boolean(sxOutlineTooltipText(el));
            if (!useCard && !useOutline) return;
            const n = performance.now();
            if (al === el && n < rl) return al = null, rl = 0, ol = null, t.clear(tfHide), tfHide = 0, void (sxHideMapTooltip(), sxHideOutlineTooltip());
            al = el, rl = n + 3200, ol = el, useCard ? sxShowMapTooltip(el, !0, sxPointerPoint(e)) : sxShowOutlineTooltip(el, sxOutlineTooltipText(el), sxPointerPoint(e)), t.clear(tfHide), tfHide = t.setTimeout(() => {
                al === el && (al = null, rl = 0), useOutline && Ns === el && sxHideOutlineTooltip();
            }, 3400), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), document.addEventListener("click", e => {
            const el = __sxClosestAction(e.target, "tooltipTapFirst");
            el && ol === el && (ol = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), addEventListener("resize", () => {
            nl && Fs.visibleFor(nl) && sxPlaceMapTooltip();
        });
        let hl = 0;
        function sxFitProfileTabLabels() {
            hl && cancelAnimationFrame(hl), hl = requestAnimationFrame(() => {
                hl = 0;
                const e = Array.from(tl.querySelectorAll(".profile-tab")), t = e.map(e => e.querySelector("[data-profile-label]")), n = matchMedia("(max-width:620px)").matches;
                if (tl.classList.remove("is-wrapped"), e.forEach(e => e.style.removeProperty("--profile-tab-width")), 
                t.forEach(e => {
                    e.textContent = e.dataset.fullLabel || "";
                }), !n || !e.length) return;
                const i = tl.querySelector(".profile-add-stack"), a = Math.max(0, tl.clientWidth - 6), r = i ? Math.ceil(i.getBoundingClientRect().width) : 42, o = 2 * (e.length + 1), s = [ {
                    name: "full",
                    labels: t.map(e => e.dataset.fullLabel || ""),
                    widths: t.map(e => Math.max(168, Math.min(220, 70 + 7 * (e.dataset.fullLabel || "").length)))
                }, {
                    name: "short",
                    labels: t.map(e => (e.dataset.fullLabel || "").slice(0, 12)),
                    widths: t.map(() => 168)
                }, {
                    name: "initial",
                    labels: t.map(e => (e.dataset.fullLabel || "").slice(0, 8)),
                    widths: t.map(() => 148)
                } ];
                let l = s.find(e => e.widths.reduce((e, t) => e + t, r + o) <= a) || s[s.length - 1];
                l.labels.forEach((e, n) => {
                    t[n] && (t[n].textContent = e);
                }), e.forEach((e, t) => e.style.setProperty("--profile-tab-width", l.widths[t] + "px")), 
                l.widths.reduce((e, t) => e + t, r + o) > a && tl.classList.add("is-wrapped");
            });
        }
        addEventListener("resize", sxFitProfileTabLabels), "ResizeObserver" in window && new ResizeObserver(sxFitProfileTabLabels).observe(tl);
        let ml = null, fl = null, yl = !1, bl = null, vl = 0;
        function sxSuppressTabClick() {
            yl = !0, t.clear(bl), bl = t.setTimeout(() => {
                yl = !1;
            }, 800);
        }
        function sxCancelTabHold() {
            fl && (t.clear(fl), fl = null), ml = null;
        }
        if (tl) {
            tl.addEventListener("pointerdown", e => {
                const n = __sxClosestAction(e.target, "viewButton");
                if (n && 0 === e.button) if (e.ctrlKey || e.metaKey) sxCancelTabHold(); else {
                    sxCancelTabHold(), ml = {
                        pointerId: e.pointerId,
                        id: n.dataset.view,
                        startX: e.clientX,
                        startY: e.clientY
                    };
                    try {
                        n.setPointerCapture(e.pointerId);
                    } catch (e) { __sxErrLog("pointer-capture", e); }
                    fl = t.setTimeout(() => {
                        if (!ml || ml.pointerId !== e.pointerId) return;
                        const t = ml.id;
                        vl = Date.now(), sxSuppressTabClick(), sxToggleCompareProfile(t);
                    }, 360);
                }
            });
            tl.addEventListener("pointermove", e => {
                ml && ml.pointerId === e.pointerId && Math.hypot(e.clientX - ml.startX, e.clientY - ml.startY) > 14 && sxCancelTabHold();
            });
            tl.addEventListener("pointerup", sxCancelTabHold);
            tl.addEventListener("pointercancel", sxCancelTabHold);
            tl.addEventListener("lostpointercapture", sxCancelTabHold);
            tl.addEventListener("keydown", e => {
                if (__sxClosestAction(e.target, "profileNameInput")) return void ("Enter" === e.key ? (e.preventDefault(),
                sxCommitProfileRename()) : "Escape" === e.key && (e.preventDefault(), Xw && (Xw = null, sxRenderProfileTabs())));
                const t = __sxClosestAction(e.target, "viewButton");
                t && (!(e.shiftKey || e.ctrlKey || e.metaKey) || "Enter" !== e.key && " " !== e.key ? !e.altKey || "Enter" !== e.key && " " !== e.key || (e.preventDefault(),
                sxOpenProfileDetails(t.dataset.view)) : (e.preventDefault(), sxToggleCompareProfile(t.dataset.view)));
            });
            tl.addEventListener("focusout", e => {
                const n = __sxClosestAction(e.target, "profileNameInput");
                if (!n) return;
                const i = Xw;
                t.setTimeout(() => {
                    Xw === i && document.activeElement !== n && sxCommitProfileRename();
                }, 0);
            });
            tl.addEventListener("contextmenu", e => {
                const t = __sxClosestAction(e.target, "viewButton");
                if (!t) return;
                e.preventDefault();
                const n = Date.now() - vl < 900;
                sxCancelTabHold(), n || (vl = Date.now(), sxSuppressTabClick(), sxToggleCompareProfile(t.dataset.view));
            });
            let sxLastTabTapTime = 0, sxLastTabTapId = null;
            tl.addEventListener("click", t => {
                const n = __sxClosestAction(t.target, "profileVeil");
                if (n) {
                    const e = n.dataset.profileVeil;
                    return dv.hidden || Qt !== e || bv !== n ? (Qt = e, bv = n, sxRefreshVeilControls(), void sxSetVeilPopoverOpen(!0, !0)) : void sxCloseVeilPopover();
                }
                const i = __sxClosestAction(t.target, "saveProfile");
                if (i) return void sxOpenProfileExport(i.dataset.saveProfile);
                const a = __sxClosestAction(t.target, "closeProfile");
                if (a) return void function(t, n) {
                    if (!vt[t]) return;
                    if (sxCloseLoadMenu(), sxCloseAddMenu(), !yt[t]) return void sxDeleteProfile(t);
                    const i = e.byId("rememberProfileCheckbox2x"), a = Boolean(i && i.checked);
                    vm.hidden = !a, wf = t, bm.textContent = a ? "Save or discard changes?" : "Discard changes?",
                    e.byId("closeProfileQuestion").textContent = a ? `Save ${wt[t]} on this device before closing, or discard its unsaved changes?` : `Close ${wt[t]} and lose its unsaved changes?`,
                    sxOpenModalDialog(ym), requestAnimationFrame(() => {
                        const t = n && n.getBoundingClientRect(), i = ym.offsetWidth, r = ym.offsetHeight, o = t ? Math.max(8, Math.min(innerWidth - i - 8, t.right - i)) : Math.max(8, innerWidth - i - 12), s = t ? Math.max(8, Math.min(innerHeight - r - 8, t.bottom + 6)) : 12;
                        ym.style.left = `${o}px`, ym.style.top = `${s}px`, (a ? vm : e.byId("discardClosingProfile")).focus();
                    });
                }(a.dataset.closeProfile, a);
                const r = __sxClosestAction(t.target, "profileLoad");
                if (r) return void function(e, t) {
                    if (!vt[e]) return;
                    const n = !Oy.hidden && qy === e;
                    if (sxCloseLoadMenu(), sxCloseAddMenu(), sxCloseSampleSubmenus(), n) return;
                    e !== Mt && sxLoadProfileMap(e), qy = e, Oy.hidden = !1;
                    const i = [ ...tl.querySelectorAll("[data-profile-load]") ].find(t => t.dataset.profileLoad === e) || t;
                    i.setAttribute("aria-expanded", "true"), Oy.setAttribute("aria-label", `Load or import data for ${wt[e]}`),
                    sxPlaceMenuAtTrigger(Oy, i), Oy.querySelector("button").focus({
                        preventScroll: !0
                    });
                }(r.dataset.profileLoad, r);
                const sxMo = t.target.closest && t.target.closest("[data-sx-match-open]");
                if (sxMo) return void sxOpenMatchTab(sxMo.dataset.sxMatchOpen);
                const sxMb = t.target.closest && t.target.closest("[data-sx-match-tab-btn]");
                if (sxMb) return void sxActivateMatchTab(sxMb.dataset.sxMatchTabBtn, !0);
                const sxMc = t.target.closest && t.target.closest("[data-sx-match-close]");
                if (sxMc) return void sxCloseMatchTab(sxMc.dataset.sxMatchClose);
                const sxHb = __sxClosestAction(t.target, "profileHeat");
                if (sxHb) return void sxToggleHeatPopover(sxHb.dataset.profileHeat, sxHb);
                const s = __sxClosestAction(t.target, "addProfile");
                if (s) return void sxToggleAddProfileMenu(s);
                const l = __sxClosestAction(t.target, "viewButton");
                if (!l) return;
                if (yl) return yl = !1, void t.preventDefault();
                const c = l.dataset.view;
                if (t.ctrlKey || t.metaKey) return t.preventDefault(), sxCancelTabHold(), void sxToggleCompareProfile(c);
                yl = !1;
                const now = performance.now();
                const isDbl = t.detail >= 2 || (now - sxLastTabTapTime < 520 && sxLastTabTapId === c);
                if (isDbl) {
                    sxLastTabTapTime = 0;
                    sxLastTabTapId = null;
                    c !== Mt && sxLoadProfileMap(c);
                    sxOpenProfileDetails(c, { mode: "about" });
                    return;
                }
                sxLastTabTapTime = now;
                sxLastTabTapId = c;
                c !== Mt && sxLoadProfileMap(c);
            });
            tl.addEventListener("dblclick", t => {
                const l = __sxClosestAction(t.target, "viewButton");
                if (!l) return;
                const c = l.dataset.view;
                if (!c || !vt[c]) return;
                t.preventDefault(), t.stopPropagation();
                sxLastTabTapTime = 0, sxLastTabTapId = null;
                c !== Mt && sxLoadProfileMap(c);
                if (!(_g && _g.open && Hy === c && "about" === gw)) {
                    sxOpenProfileDetails(c, { mode: "about" });
                }
            });
        }
        e.byId("overlayTab") && e.byId("overlayTab").addEventListener("click", ev => {
            ev.preventDefault(), ev.stopPropagation();
            const ids = sxListLiveSelections();
            if (ids.length < 2) return;
            const hide = Boolean(an);
            sxVaultInvalidate();
            sxSel(ids, "set");
            sxSel(null, hide ? "dismiss" : "show");
            const sxKeepOverlayControl = () => {
                sxListLiveSelections().length < 2 && (sxSel(ids, "set"), sxSel(null, hide ? "dismiss" : "show"));
                sxRenderProfileTabs();
                const k = e.byId("overlayTab");
                k && (k.hidden = !1, k.textContent = an ? "Hide group overlay" : "Show group overlay", k.title = an ? "Hide the selected profiles’ comparison overlay" : "Show the selected profiles’ comparison overlay", k.setAttribute("aria-pressed", String(Boolean(an))));
            };
            sxKeepOverlayControl();
            const painted = sxRequestMapPaint();
            painted && "function" == typeof painted.then ? painted.then(() => {
                sxKeepOverlayControl(), sxApplyMapFit();
            }) : (sxKeepOverlayControl(), sxApplyMapFit());
        });
        e.all("[data-filter]").forEach(t => t.addEventListener("click", () => {
            "true" !== t.getAttribute("aria-disabled") && !Rt && (sxVaultInvalidate(), Pt = t.dataset.filter, e.all("[data-filter]").forEach(e => e.setAttribute("aria-pressed", String(e === t))),
            sxRequestMapPaint());
        }));
        const xl = e.byId("blindModeToggle");
        xl && xl.addEventListener("click", () => function(e, {render: t = !0} = {}) {
            sxVaultInvalidate();
            const n = Boolean(e) && sxCanRunComparison();
            n !== Rt ? (n ? (Ot = Pt, Pt = "mutual", Nt = null, sxCloseMarkPlacard()) : Pt = Ot || "all", Rt = n, 
            sxSyncBlindControls(), t && sxRequestMapPaint({
                animate: !1
            })) : sxSyncBlindControls();
        }(!Rt)), function() {
            const t = e.byId("shareOverlapBtn"), n = e.byId("overlapShareDialog"), i = e.byId("closeOverlapShare");
            t && n && t.addEventListener("click", () => {
                sxCloseModalDialog(e.one("dialog[open]")), sxOpenModalDialog(n);
            }), i && n && i.addEventListener("click", () => sxCloseModalDialog(n));
            const a = e.byId("overlapSharePerson"), r = e.byId("overlapShareCouple");
            a && a.addEventListener("click", () => {
                sxCloseModalDialog(n), sxDownloadOverlapShare("person");
            }), r && r.addEventListener("click", () => {
                sxCloseModalDialog(n), sxDownloadOverlapShare("couple");
            }), n && n.addEventListener("click", e => {
                e.target === n && sxCloseModalDialog(n);
            });
        }();
        const Sl = e.byId("localCommunitiesDialog"), $l = e.byId("localCommunityConsentRow"), El = e.byId("localCommunityStatus"), Al = e.byId("localCommunityResults"), Cl = e.byId("localCommunityPlace"), Ml = e.byId("localFetlifeLinks"), Il = e.byId("localRedditLinks"), Pl = e.byId("nationalCommunityList");
        let Ll = !1, Tl = null, Fl = null;
        function sxAppendExternalLink(e, t, n) {
            const i = document.createElement("a");
            i.href = n, i.target = "_blank", i.rel = "noopener noreferrer", i.textContent = t, 
            e.append(i);
        }
        function sxSearchUrlText(e, t, n = "") {
            return `${e}${encodeURIComponent(t)}${n}`;
        }
        function sxFillLocalCommunities(e) {
            const t = (e && e.city || "").trim(), n = (e && e.state || "").trim(), i = [ t, n ].filter(Boolean).join(", "), a = t || n;
            if (Ml.replaceChildren(), Il.replaceChildren(), !a) return Cl.textContent = "Area name unavailable", 
            void (Al.hidden = !0);
            if (Cl.textContent = i, t && sxAppendExternalLink(Ml, `Groups in ${t}`, sxSearchUrlText("https://fetlife.com/groups/search?q=", t)), 
            n && n !== t && sxAppendExternalLink(Ml, `Groups in ${n}`, sxSearchUrlText("https://fetlife.com/groups/search?q=", n)), 
            sxAppendExternalLink(Ml, "Search area places & events", sxSearchUrlText("https://fetlife.com/groups/search?q=", `${a} events`)), 
            sxAppendExternalLink(Il, `Search Reddit for ${a} kink communities`, sxSearchUrlText("https://www.reddit.com/search/?q=", `${a} kink`, "&type=sr")), 
            t) {
                const e = t.toLowerCase().replace(/[^a-z0-9]+/g, "");
                e && sxAppendExternalLink(Il, `Search for r/${e}kink`, sxSearchUrlText("https://www.reddit.com/search/?q=", `r/${e}kink`, "&type=sr"));
            }
            (function() {
                Pl.replaceChildren();
                const e = function(e = 5) {
                    const t = sxActiveProfileId();
                    if (!t || !vt[t]) return [];
                    const n = [];
                    h.forEach(e => e.topics.forEach(e => {
                        const i = sxResolveTopicId(e);
                        if (sxIsLimitOrUninterested(i, t)) return;
                        const a = sxDecodeTopicStance(i, t), r = sxHasAppliedMarker(i, t, "favorite"), o = Math.max(a.giveKnown ? a.give : -101, a.receiveKnown ? a.receive : -101, r ? 101 : -101), s = sxPrimaryLink(e, "fetlife");
                        o > 0 && s && s.url && n.push({
                            label: e,
                            score: o,
                            community: s
                        });
                    })), sxCollectComparedImports().forEach(e => {
                        if (sxIsLimitOrUninterested(e.id, t)) return;
                        const i = sxDecodeTopicStance(e.id, t), a = sxHasAppliedMarker(e.id, t, "favorite"), r = Math.max(i.giveKnown ? i.give : -101, i.receiveKnown ? i.receive : -101, a ? 101 : -101), o = sxPrimaryLink(e.label, "fetlife");
                        r > 0 && o && o.url && n.push({
                            label: e.label,
                            score: r,
                            community: o
                        });
                    });
                    const i = new Set;
                    return n.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label)).filter(e => !i.has(e.community.url) && (i.add(e.community.url), 
                    !0)).slice(0, e);
                }();
                if (!e.length) {
                    const e = document.createElement("li"), t = document.createElement("small");
                    return t.textContent = "Rate topics you’re into to see relevant national groups.", 
                    e.append(t), void Pl.append(e);
                }
                e.forEach(e => {
                    const t = document.createElement("li"), n = document.createElement("a"), i = document.createElement("small");
                    n.href = e.community.url, n.target = "_blank", n.rel = "noopener noreferrer", n.textContent = e.community.name || e.label, 
                    i.textContent = `Matched from ${e.label}`, t.append(n, i), Pl.append(t);
                });
            })(), Al.hidden = !1;
        }
        function sxShowLocationDenied() {
            El.dataset.tone = "error", El.textContent = "Location unavailable — local search needs location permission.", 
            Al.hidden = !0, $l.hidden = !0;
        }
        function sxOpenLocalCommunities() {
            sxOpenModalDialog(Sl), Tl && Fl && sxFillLocalCommunities(Fl), requestAnimationFrame(() => {
                (Ll ? e.byId("closeLocalCommunities") : e.byId("findLocalCommunities")).focus();
            });
        }

        e.byId("profileCommunityMatches")?.addEventListener("click", () => {
            if (Hy && vt[Hy]) Et = Hy;
            sxCloseModalDialog(_g);
            sxOpenLocalCommunities();
            const t = sxActiveProfileId(), matches = [];
            h.forEach(branch => branch.topics.forEach(label => { const id=sxResolveTopicId(label), rating=sxDecodeTopicStance(id,t), score=Math.max(rating.giveKnown?rating.give:-101,rating.receiveKnown?rating.receive:-101), community=sxPrimaryLink(label,"fetlife"); if(score>0&&community&&community.url) matches.push({label,score,community}); }));
            const grouped = new Map(); matches.forEach(m => { const key=m.community.url; if(!grouped.has(key)) grouped.set(key,{community:m.community,labels:[],score:m.score}); const g=grouped.get(key); g.labels.push(m.label); g.score=Math.max(g.score,m.score); });
            Pl.replaceChildren(); [...grouped.values()].sort((a,b)=>b.labels.length-a.labels.length||b.score-a.score).slice(0,8).forEach(m=>{ const li=document.createElement("li"),a=document.createElement("a"),small=document.createElement("small"); a.href=m.community.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=m.community.name||m.labels[0];small.textContent=(m.labels.length>1?`${m.labels.length} green matches: `:"Matched: ")+m.labels.join(", ");li.append(a,small);Pl.append(li); });
            Al.hidden = !1;
        });
        e.byId("localCommunitiesButton") && e.byId("localCommunitiesButton").addEventListener("click", () => {
            Pi.open && sxCloseModalDialog(Pi), sxOpenLocalCommunities();
        }), e.byId("findLocalCommunities") && e.byId("findLocalCommunities").addEventListener("click", async function() {
            Ll || (Ll = !0, El.removeAttribute("data-tone"), El.textContent = "Requesting location…", 
            navigator.geolocation ? navigator.geolocation.getCurrentPosition(async e => {
                Tl = {
                    latitude: e.coords.latitude,
                    longitude: e.coords.longitude
                }, $l.hidden = !0, El.textContent = "Finding your area…";
                try {
                    Fl = await async function() {
                        const e = new AbortController, n = t.setTimeout(() => e.abort(), 7e3), i = encodeURIComponent(Tl.latitude), a = encodeURIComponent(Tl.longitude);
                        try {
                            const t = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${i}&lon=${a}&zoom=10&addressdetails=1`, {
                                headers: {
                                    Accept: "application/json"
                                },
                                credentials: "omit",
                                cache: "no-store",
                                referrerPolicy: "strict-origin-when-cross-origin",
                                signal: e.signal
                            });
                            if (!t.ok) throw new Error("Reverse geocoding unavailable");
                            const n = await t.json(), r = n && n.address || {};
                            return {
                                city: r.city || r.town || r.village || r.municipality || r.county || "",
                                state: r.state || r.region || ""
                            };
                        } finally {
                            t.clear(n);
                        }
                    }(), El.textContent = "";
                } catch (e) {
                    Fl = null, El.textContent = "City lookup unavailable. No location was sent to FetLife or Reddit.";
                }
                sxFillLocalCommunities(Fl);
            }, sxShowLocationDenied, {
                enableHighAccuracy: !1,
                maximumAge: 0,
                timeout: 1e4
            }) : sxShowLocationDenied());
        }), e.byId("closeLocalCommunities") && e.byId("closeLocalCommunities").addEventListener("click", () => sxCloseModalDialog(Sl)), Sl && Sl.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseModalDialog(Sl);
        });
        const Bl = e.byId("searchInput"), jl = e.byId("searchDropdown"), ql = e.byId("topicPicker"), Hl = e.byId("topicPickerButton"), Wl = e.byId("topicPickerMenu"), Ul = [], Gl = sxOrderByScore(h, sxBranchMeanScore);
        function sxPracticeIconMarkup(e, t = !1) {
            const n = !t && e.hankyKey && "subcategory" !== e.hankyKey ? ` data-hanky-code="${sxEscapeHtmlText(e.hankyKey)}"` : "";
            const iconSize = (48 * 0.62).toFixed(2);
            const iconOffset = ((48 - 48 * 0.62) / 2).toFixed(2);
            return `<svg class="glance-tooltip-practice-icon ${t ? "branch-icon" : "topic-icon"}${"subcategory" === e.hankyKey ? " subcategory-icon" : "noCode" === e.hankyKey ? " no-hanky-code-icon" : ""}" viewBox="0 0 48 48" aria-hidden="true"${n} style="--icon-family:${sxEscapeHtmlText(e.color)};color:${sxEscapeHtmlText(e.color)}"><circle class="icon-ring-outline icon-ring-outline-outer" cx="24" cy="24" r="23.5"/><circle class="icon-disc" cx="24" cy="24" r="22"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="24" cy="24" r="20.5"/><svg viewBox="${e.viewBox || "0 0 24 24"}" width="${iconSize}" height="${iconSize}" x="${iconOffset}" y="${iconOffset}" overflow="visible">${e.glyph}${e.accent || ""}</svg></svg>`;
        }
        function sxCreateTopicPicker(e) {
            let t = [], i = [], a = -1, r = !1;
            const o = new Set;
            // P1 refactor (Build 2026-10-18_2227): zl internals split by
            // responsibility — zlFlatten prepares the visible item list
            // (tree flattening), zlRenderRows renders the option rows,
            // zlMove is the keyboard highlight step used by the key handler.
