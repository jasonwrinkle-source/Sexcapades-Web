        function ktRender() {
            const per = 10, total = ix.length, pages = Math.ceil(total / per);
            ktPage = Math.max(0, Math.min(ktPage, pages - 1));
            const start = ktPage * per, end = Math.min(start + per, total);
            let h = "";
            for (let k = start; k < end; k++) {
                const e = ix[k];
                h += `<article class="test-question"><div class="test-question-text"><b>${e.number}.</b> ${Hi(e.question)}</div><div class="test-answer-groups"><div class="test-choice-group" role="group" aria-label="Rating for question ${e.number}">${Sx("1 \u00b7 Never", "1", "answer", k)}${Sx("2 \u00b7 Not my thing", "2", "answer", k)}${Sx("3 \u00b7 Enjoy", "3", "answer", k)}${Sx("4 \u00b7 Really enjoy", "4", "answer", k)}</div></div></article>`;
            }
            h += `<div class="test-pager" role="navigation" aria-label="Test pages"><button type="button" class="action-btn" data-kt-nav="prev"${ktPage === 0 ? " disabled" : ""}>\u2190 Previous</button><span class="test-pager-info"></span>`;
            h += ktPage < pages - 1 ? `<button type="button" class="action-btn primary" data-kt-nav="next" disabled>Next \u2192</button>` : `<span class="test-pager-done">Last page \u2014 use \u201cPreview answers\u201d above when finished.</span>`;
            h += `<button type="button" class="action-btn" data-kt-nav="fill1" title="Testing shortcut: answer 1 (Never) for every question on this page">Fill page with 1s</button></div>`;
            n(Ok, h);
            for (let k = start; k < end; k++) {
                const a = Xk[k];
                if (a && a.answer) {
                    const b = Ok.querySelector(`[data-test-index="${k}"][data-test-value="${a.answer}"]`);
                    b && b.setAttribute("aria-pressed", "true");
                }
            }
            ktPagerState();
        }
        function ktPagerState() {
            if ("kinktest" !== Gk) return;
            const per = 10, total = ix.length, pages = Math.ceil(total / per);
            const start = ktPage * per, end = Math.min(start + per, total);
            let n2 = 0, done = true;
            for (let k = start; k < end; k++) {
                if (Xk[k] && Xk[k].answer) n2++; else done = false;
            }
            const info = Ok.querySelector(".test-pager-info");
            info && (info.textContent = `Page ${ktPage + 1} of ${pages} \u00b7 ${n2} of ${end - start} answered`);
            const next = Ok.querySelector('[data-kt-nav="next"]');
            next && (next.disabled = !done);
        }
        function ktNavGo(a) {
            const per = 10, pages = Math.ceil(ix.length / per);
            if ("prev" === a) {
                if (ktPage > 0) { ktPage--; ktRender(); Ok.scrollIntoView({ block: "start" }); }
            } else if ("next" === a) {
                if (ktPage < pages - 1) {
                    const start = ktPage * per, end = Math.min(start + per, ix.length);
                    for (let k = start; k < end; k++) { if (!(Xk[k] && Xk[k].answer)) return; }
                    ktPage++; ktRender(); Ok.scrollIntoView({ block: "start" });
                }
            } else if ("fill1" === a) {
                const start = ktPage * per, end = Math.min(start + per, ix.length);
                for (let k = start; k < end; k++) { Xk[k] || (Xk[k] = {}); Xk[k].answer = "1"; }
                ktRender(); Ex();
            }
        }
        let rS = !1, oS = !1, sS = !1, lS = !1;
        function cS() {
            let e = String(window.__SEXCAPADES_START_ROUTE || (window.__SEXCAPADES_LAYOUT_ROUTE ? window.__SEXCAPADES_LAYOUT_ROUTE(location.hash) : location.hash) || "");
            try {
                e = decodeURIComponent(e);
            } catch (e) { __sxErrLog("hash-decode", e); }
            return e;
        }
        function dS() {
            const e = cS();
            return !e || /^#\/?app\/?$/i.test(e) ? "" : /^#\/?(app\/)?(?:list|listview)\/?$/i.test(e) ? e : "";
        }
        function uS() {
            const e = cS();
            return /^#\/?app\/(?:map|mapview)\/?$/i.test(e) ? e : "";
        }
        function pS() {
            const e = cS();
            return /^#\/?(?:app\/)?(?:import(?:\/scan)?|scan)\/?$/i.test(e) ? e : "";
        }
        // Popularity list → hypermap fix (2026-10-28, scopes A+B+C):
        // the map-route render is a full rebuild; entered from the
        // Popularity list it ran as one synchronous block — seconds
        // of frozen screen with no indicator, because nothing on
        // this path ever armed one. This entry arms the two existing
        // progress surfaces before the render and defers the render
        // behind the house double-rAF + setTimeout(0) pattern (the
        // layout editor apply() deferral), so the armed state paints
        // before work begins:
        //   - the "Building your map…" overlay session
        //     (__sxLoadSessionStart): the render's own __sxLoad
        //     checkpoints drive it, and its map-complete gate holds
        //     it through any settle/blit tail after the paint;
        //   - the #9 paintbrush pill (__sxPillSessionStart/Finish),
        //     button-marked on the PERSISTENT title-bar view button
        //     (#mapListViewButton) — never the view-menu item
        //     (closeMenu() removes it) and never the list dialog's
        //     own view button (it closes with the dialog). The pill
        //     finishes on the overlay session's onDone — the same
        //     completion signal apply() uses — so pill, overlay and
        //     tail share exactly one window.
        // The render runs chunked via the one-shot
        // __sxRouteChunkPaint flag consumed in Mr (same 25-50 ms
        // clamp as the boot flag), set immediately before Mr so no
        // other render can take it. When either surface cannot arm
        // (a session is already active), or the map sits in its
        // safe-fallback state (jn — Mr would refuse the paint and
        // no checkpoint would ever drive an armed session), the
        // render runs exactly as before: synchronous, unflagged,
        // inside this call. No dirty check is added (scope D is
        // excluded): the full render still runs on every entry.
        function sxRouteRender() {
            let pillToken = null, armed = !1;
            const pillDone = () => {
                if (!pillToken) return;
                const t = pillToken;
                pillToken = null;
                try {
                    window.__sxPillSessionFinish(t);
                } catch (e) { __sxErrLog("route-render-pill-finish", e); }
            };
            if (!jn) try {
                if ("function" == typeof window.__sxPillSessionStart) pillToken = window.__sxPillSessionStart({
                    button: document.getElementById("mapListViewButton")
                });
                if ("function" == typeof window.__sxLoadSessionStart) armed = !!window.__sxLoadSessionStart({
                    onDone: pillDone
                });
            } catch (e) { __sxErrLog("route-render-arm", e); }
            const render = () => {
                if (armed) window.__sxRouteChunkPaint = 50;
                Mr({
                    animate: !1
                }), Ih();
                if (!armed) pillDone();
            };
            if (armed && window.requestAnimationFrame) requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(render, 0))); else render();
        }
        function gS() {
            const e = uS();
            return window.__SEXCAPADES_START_ROUTE = "", e ? !oS && (oS = !0, Do.open ? Is() : (sxRouteRender(), !0)) : (oS = !1, !1);
        }
        function xS() {
            return /^#\/?(?:app\/)?compare\/?$/i.test(cS());
        }
        // #app/compare is the pair glance on the map. Multi-select wins
        // when two or more profiles are already chosen; otherwise every
        // open profile joins the comparison. The view button reads the
        // hash itself.
        function sxShowCompareRoute() {
            if (!xS()) {
                if ("compare" === document.documentElement.dataset.sxRoute) delete document.documentElement.dataset.sxRoute;
                return !1;
            }
            document.documentElement.dataset.sxRoute = "compare";
            const all = Object.keys(vt || {}).filter(id => id && id !== Et && vt[id]);
            const picked = (typeof Yi === "function" ? Yi() : []).filter(id => vt[id]);
            const ids = picked.length >= 2 ? picked : all;
            if (ids.length >= 2 && typeof sxSel === "function") {
                sxSel(ids, "set");
                try {
                    vc();
                } catch (err) {
                    __sxErrLog("compare-route", err);
                }
            }
            if (typeof window.__sxSyncViewButton === "function") window.__sxSyncViewButton();
            return !0;
        }
        function mS() {
            const e = pS(), t = Boolean(function() {
                const e = cS();
                return /^#\/?(?:app\/)?(?:scan|import\/scan)\/?$/i.test(e) ? e : "";
            }());
            return window.__SEXCAPADES_START_ROUTE = "", e ? !sS && (sS = !0, ww(), t && Yx(), 
            !0) : (sS = !1, !1);
        }
        // Scribe deep-link door REMOVED (owner ruling, 2026-10-27):
        // Scribe's only doorway is the Scribe button — a deep link
        // carries no multi-select context, so the #scribe / #app/scribe
        // hash route (the former fS handler and its hS matcher) is
        // gone, and that hash now boots and navigates exactly like the
        // plain app route. The handler's old no-profile fallback (open
        // the import dialog with a "load a profile first" message) was
        // part of the deep-link door itself, not a separate behavior:
        // the import dialog keeps its own doors (the import route and
        // the add-profile menu), unchanged.
        window.addEventListener("hashchange", () => {
            if (xS()) return window.__SEXCAPADES_START_ROUTE = "", sxShowCompareRoute(), void Nu();
            window.__SEXCAPADES_START_ROUTE = "", function() {
                let e = String(location.hash || "");
                try {
                    e = decodeURIComponent(e);
                } catch (e) { __sxErrLog("hash-decode", e); }
                const t = /^#\/?(app\/)?(?:list|listview)\/?$/i.test(e);
                return t ? (rS = !0, Do.open || Ms(Mt && vt[Mt] ? Mt : Et)) : (rS = !1, Do.open && Is(!0, !t && !!uS() && !oS)), 
                t;
            }() || gS(), mS(), Nu();
        });
        const yS = Boolean(dS()), bS = Boolean(uS()), vS = Boolean(pS());
        !function() {
            const t = e.byId("legendRatingDemo");
            if (!t) return;
            const n = Array.from(t.querySelectorAll(".legend-live-control")), i = () => n.forEach(e => {
                e.classList.remove("is-active"), e.querySelector(".legend-direction-pill").setAttribute("aria-expanded", "false");
            }), a = (e, t = !0) => {
                const n = e.querySelector("input"), i = Number(n.value) || 0, a = e.querySelector(".legend-direction-pill");
                n.style.setProperty("--legend-thumb", t ? zi(i) : "var(--curious)"), a.style.background = t ? zi(i) : "#646d66", 
                a.dataset.tooltipValue = t ? ba(i) : "Unrated", Fs.visibleFor(a) && Fs.show(a, {
                    name: a.dataset.tooltipName,
                    definition: a.dataset.tooltipDefinition,
                    value: a.dataset.tooltipValue
                });
            };
            n.forEach(e => {
                const t = e.querySelector(".legend-direction-pill"), n = e.querySelector("input"), r = e.querySelector(".legend-live-clear");
                t.addEventListener("click", n => {
                    n.preventDefault(), n.stopPropagation();
                    const a = !e.classList.contains("is-active");
                    i(), a && (e.classList.add("is-active"), t.setAttribute("aria-expanded", "true"));
                }), e.addEventListener("mouseenter", () => {
                    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches && (i(), 
                    e.classList.add("is-active"), t.setAttribute("aria-expanded", "true"));
                }), e.addEventListener("mouseleave", () => {
                    e.contains(document.activeElement) || i();
                }), e.addEventListener("focusout", () => requestAnimationFrame(() => {
                    e.contains(document.activeElement) || i();
                })), n.addEventListener("input", () => a(e, !0)), r.addEventListener("click", r => {
                    r.preventDefault(), r.stopPropagation(), n.value = "0", a(e, !1), i(), t.focus({
                        preventScroll: !0
                    });
                }), a(e, !1);
            }), window.__sxOnPtr( e => {
                t.contains(e.target) || i();
            }, !0), Jt = () => {
                n.forEach(e => {
                    e.querySelector("input").value = "0", a(e, !1);
                }), i();
            };
        }(), window.__SEXCAPADES_LAYOUT_API = {
            apply(e) {
                e = migrateLayoutKeys(e);
                const t = Boolean(e && Object.prototype.hasOwnProperty.call(e, "expandAll"));
                if (Object.assign(mn, e || {}), t) rn.clear(), on.clear(), h.forEach(e => {
                    rn.add(e.name), mn.expandAll && ((e.subcategories || []).forEach(t => on.add(Un(e.name, t.name))), e.topics.forEach(e => on.add(Wn(e))));
                });
                if (window.__SEXCAPADES_LAYOUT) Object.assign(window.__SEXCAPADES_LAYOUT, e || {});
                return Cn.classList.toggle("is-static", Boolean(mn.staticMap)), Mr({
                    animate: !1,
                    forceRepaint: !0
                }), this.get();
            },
            // Q6 chunked apply: the layout editor's armed
            // task-session apply routes here so its paint is stepped
            // one phase per frame (see sxChunkPaint at Ar) and the
            // pipeline's own progress checkpoints paint between
            // phases. Routes exactly like the editor's own dispatch
            // (scoped when a scope is given and applyScoped exists,
            // full otherwise) and resolves only after the stepped
            // paint — including a scoped paint's deferred
            // bookkeeping — has fully settled. The chunk flag is on
            // only for the synchronous dispatch below, so no other
            // render can accidentally go chunked.
            async applyChunked(patch, scope) {
                // Editor paints keep their assessed 12 ms budget; the
                // larger boot slice never leaks into this path (Mr
                // also captures the budget per paint at its start).
                sxChunkPaint = !0, sxChunkBudget = 12;
                let scopedP = null;
                try {
                    if (scope && this.applyScoped) scopedP = this.applyScoped(patch, scope); else this.apply(patch);
                } finally {
                    sxChunkPaint = !1;
                }
                if (scopedP && "function" == typeof scopedP.then) await scopedP; else if (sxPaintPromise) await sxPaintPromise;
                return this.get();
            },
            applyScoped(patch, scope) {
                // Scoped solve (Stage 3, T2): apply a layout patch
                // while every branch outside scope.target ∪
                // scope.ring is FROZEN — its delivered geometry is
                // captured before the patch lands and replayed
                // verbatim at solve completion (see scCtx,
                // scCaptureFrozen, scRestoreFrozen). The patch itself
                // goes through this API's own apply() untouched, so
                // state-write, scheduling, and sync semantics are
                // exactly apply()'s. Any validation failure, an
                // empty/no-op patch, an already-active scope, or the
                // absence of delivered geometry to freeze falls back
                // to the ordinary full apply path with the reason
                // declared in the returned result and in dkLog —
                // never silent. The summary is also recorded in dkLog
                // (type "scoped-apply"), the same place the DeKnotter
                // records its run summaries. Ring-auto (T5): when
                // scope.ring is omitted, the ring is computed by
                // scComputeAutoRing from pre-op delivered geometry
                // (see the declaration below) and written into both
                // the result and the log entry.
                const api = this, names = h.map(b => b.name), valid = new Set(names), target = scope && Array.isArray(scope.target) ? scope.target.map(v => String(v)) : [], dropped0 = () => ({
                    optimiser: 0,
                    relief: 0,
                    clamp: 0
                }), fallback = reason => (api.apply(patch || {}), dkLog.push({
                    type: "scoped-apply",
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozen: [],
                    frozenCount: 0,
                    fallback: reason
                }), {
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozenCount: 0,
                    boundaryLog: [],
                    dropped: dropped0(),
                    fallback: reason
                });
                // Ring-auto (Stage 3, T5): an explicit scope.ring
                // is used verbatim, exactly as before (T4's harness
                // passes one). When the caller omits it, the ring
                // is declared HERE — computed by scComputeAutoRing
                // from pre-op delivered geometry, before the patch
                // applies, never reconstructed after the fact —
                // and the computed ring is what the result object
                // and the dkLog "scoped-apply" entry carry. With
                // no delivered geometry to declare from, the ring
                // stays empty and the scoped path falls back below
                // ("no-delivered-geometry"), as it does today.
                // RING REMOVED (ruled 2026-11-01 01:52, Jason —
                // supersedes ring-auto, Stage 3 T5): the freeze
                // applies to EVERY branch except the target —
                // angular neighbours, the target's nearest
                // neighbour, and branches whose nearest centre is
                // the target are frozen and restored verbatim like
                // every other branch; only the target branch is
                // recomputed. The ring lines are COMMENTED OUT,
                // not deleted ("throw out" = comment out, as
                // throughout this project): an explicit scope.ring
                // is likewise no longer honoured, so every scoped
                // result declares ring: [] and a frozenCount
                // covering every non-target branch.
                let ring = [];
                // let ring = scope && Array.isArray(scope.ring) ? scope.ring.map(v => String(v)) : null;
                // if (null === ring) ring = dkLastBranches && target.length ? scComputeAutoRing(new Set(target), names) : [];
                if (!target.length) return fallback("empty-target");
                const unknown = target.concat(ring).filter(n => !valid.has(n));
                if (unknown.length) return fallback("unknown-branch:" + unknown.join(","));
                // Crossmin rule (T3, L6): minimizeCrossings builds a
                // cross-branch obstacle list in processing order, so
                // while crossmin is on applyScoped declines to scope
                // and runs the ordinary full apply, declared.
                if (mn.crossmin) return fallback("crossmin-on");
                if (scCtx) return fallback("scope-already-active");
                if (!patch || "object" != typeof patch || !Object.keys(patch).length) return fallback("empty-patch");
                const before = api.get();
                // Solve-commit opt-out (Stage 3, T6): a caller
                // whose commit's payload is the solve itself —
                // solver-side state outside the patch changed
                // under a value-identical patch (the DeKnotter's
                // fit and growth phases: the fit registry lives
                // outside API.get()) — declares scope.solveCommit
                // and skips ONLY this no-op decline. Every other
                // validation and decline stands, and no editor
                // caller passes the flag, so editor behaviour is
                // unchanged.
                if (!(scope && scope.solveCommit) && Object.keys(patch).every(k => Object.prototype.hasOwnProperty.call(before, k) && dkStableStringify(before[k]) === dkStableStringify(patch[k]))) return fallback("no-op-patch");
                if (!dkLastBranches) return fallback("no-delivered-geometry");
                const recompute = new Set(target.concat(ring)), frozen = new Set(names.filter(n => !recompute.has(n))), ctx = {
                    targetBranches: new Set(target),
                    ringBranches: new Set(ring),
                    recomputeBranches: recompute,
                    frozenBranches: frozen,
                    boundaryLog: [],
                    dropped: dropped0(),
                    fallback: null,
                    policy: scope && "fallback" === scope.policy ? "fallback" : "contained",
                    opClass: scope && null != scope.opClass ? String(scope.opClass) : scope && null != scope.op ? String(scope.op) : null,
                    reliefPass: 0,
                    r6Abort: !1,
                    capture: scCaptureFrozen(frozen),
                    centers: scCaptureDeliveredCenters(frozen)
                };
                scCtx = ctx;
                // Q6 chunked paints: when the editor's armed apply
                // steps this paint a frame at a time (applyChunked),
                // api.apply returns with the paint still in flight
                // (sxPaintPromise replaced). scCtx must stay in
                // place for the whole paint — Ar consults it in
                // every phase — and the bookkeeping below (which
                // reads solve results such as ctx.r6Abort) must wait
                // until the paint settles, so it lives in
                // finishScoped: unchunked callers run it
                // synchronously right here, exactly as before; a
                // chunked caller gets a promise for the same result,
                // with scCtx cleared first so the R6 fallback paint
                // inside runs unscoped, exactly as it does today.
                let sxPaintP = null;
                const sxPaintBefore = sxPaintPromise;
                try {
                    api.apply(patch);
                    if (sxPaintPromise !== sxPaintBefore) sxPaintP = sxPaintPromise;
                } catch (e) {
                    throw dkLog.push({
                        type: "scoped-apply-exception",
                        target: target.slice(),
                        ring: ring.slice(),
                        message: String(e && e.message || e)
                    }), e;
                } finally {
                    if (!sxPaintP) scCtx = null;
                }
                const finishScoped = () => {
                // R6 trigger (T3, L5): under policy "fallback" the
                // first relief boundary event raised ctx.r6Abort
                // mid-solve; the scoped result is discarded and the
                // ordinary full apply runs instead, with the outcome
                // declared — never silent. The boundaryLog and the
                // dropped counters from the aborted scoped attempt
                // are carried into the result so the pressure that
                // forced the fallback stays visible.
                if (ctx.r6Abort) return api.apply(patch || {}), dkLog.push({
                    type: "scoped-apply",
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozen: [],
                    frozenCount: 0,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: "R6: boundary pressure"
                }), {
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozenCount: 0,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: "R6: boundary pressure"
                };
                return dkLog.push({
                    type: "scoped-apply",
                    scoped: !0,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozen: Array.from(frozen),
                    frozenCount: frozen.size,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: null
                }), {
                    scoped: !0,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozenCount: frozen.size,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: null
                };
                };
                if (sxPaintP) {
                    const settleScoped = () => (scCtx = null, finishScoped());
                    return sxPaintP.then(settleScoped, settleScoped);
                }
                return finishScoped();
            },
            get: () => ({
                spacing: mn.spacing,
                branchOrder: mn.branchOrder || "landscape-antipodal",
                propFan: Boolean(mn.propFan),
                subcatOrder: Boolean(mn.subcatOrder),
                staggerDensity: mn.staggerDensity !== !1,
                stagger: Boolean(mn.stagger),
                expandAll: Boolean(mn.expandAll),
                collision: mn.collision,
                crossmin: Boolean(mn.crossmin),
                nudge: Boolean(mn.nudge),
                showRelations: Boolean(mn.showRelations),
                spokeLen: Number(mn.spokeLen),
                subLen: Number(mn.subLen),
                pad: Number(mn.pad),
                repulsion: Number(mn.repulsion),
                repulsionEnabled: mn.repulsionEnabled !== !1,
                staticMap: Boolean(mn.staticMap),
                 fontScale: Number(mn.fontScale) || 1,
                 centerRingScale: Number(mn.centerRingScale) || 1,
                 leafOvergrowth: Number(mn.leafOvergrowth) || 100,
                branchOverrides: Object.assign({}, mn.branchOverrides || {}),
                subcatOverrides: Object.assign({}, mn.subcatOverrides || {}),
                kinkOverrides: Object.assign({}, mn.kinkOverrides || {}),
                subcatAngleOffsets: Object.assign({}, mn.subcatAngleOffsets || {}),
                kinkAngleOffsets: Object.assign({}, mn.kinkAngleOffsets || {}),
                branchSpokeAutoShrink: Object.assign({}, mn.branchSpokeAutoShrink || {}),
                subcatSpokeAutoShrink: Object.assign({}, mn.subcatSpokeAutoShrink || {}),
                solverMidline: mn.solverMidline,
                mapSliders: Boolean(mn.mapSliders),
                animations: mn.animations !== false
            }),
            branches: () => h.map(e => e.name),
            topics: () => Object.keys(topicLabelById).map(id => ({ id: id, label: topicLabelById[id] })).sort((a, b) => a.label.localeCompare(b.label)),
            subcategories: () => { const s = new Set(); try { h.forEach(b => (b.subcategories || []).forEach(sc => s.add(sc.name))); } catch (_) { __sxErrLog("taxonomy-scan", _); } return [...s].sort((a, b) => a.localeCompare(b)); },
            selectNode(e) {
                // Layout Editor → map selection (Build 2026-10-18_1401),
                // the reverse of the map → editor sync in Qsel: picking a
                // branch, subcategory, or kink in the editor's Advanced
                // selects selects that same branch on the map. Accepts a
                // node id (kinks pass theirs directly), a branch display
                // name, or a subcategory display name; reveals the node
                // the way the topic finder's preview does (branch into
                // rn, parent into on) so the selected spoke is visible,
                // then applies the shared selection path's bookkeeping
                // without echoing a notification back to the editor that
                // initiated it — but updates the selection marking in
                // the existing DOM instead of re-rendering (see below).
                if (!e) return !1;
                let id = String(e), t = qn[id] || Xn(id);
                if (!t) {
                    const c = (h.find(cat => cat.name === id) || {}).id || "";
                    if (qn[c]) id = c, t = qn[c]; else {
                        const s = Object.keys(qn).find(k => {
                            const o = qn[k];
                            return o && "Subcategory" === o.kind && (o.label === id || o.name === id);
                        });
                        if (s) id = s, t = qn[s];
                    }
                }
                if (!t) return !1;
                if (t.branch) rn.add(t.branch);
                if (t.parentId) on.add(t.parentId);
                // Selection-state bookkeeping identical to the shared
                // path (selectSpokeNode with notify off): record the
                // selected node, clear any pending rating target. The
                // shared path is selection-only — no re-render: Mr()
                // re-solves and re-renders the whole map from
                // canonical layout state, silently discarding delivered
                // geometry (scoped editor commits, DeKnotter runs) that
                // exists only in the rendered DOM. Selection is
                // geometry-neutral, so the marking the render would
                // produce is applied to the existing DOM instead, via
                // the shared applySelectionMarking (see its comment
                // for the exact end-state contract: the node's own
                // spoke in its node group, the branch's spoke in the
                // branch's line-group underlay, nothing for a
                // subcategory or a topic's parent subcategory).
                Lt = id, Nt = null, sxSelEditorMirrored = id;
                applySelectionMarking(id, t);
                return !0;
            },
            clearSelection() {
                // Deselect/back (Build 2026-10-19_0543): the one clear
                // path behind the Layout Editor's Clear selection button,
                // the Advanced selects' empty option, and Escape-as-back.
                // Mirrors selectSpokeNode's bookkeeping in reverse: clear
                // the selected node and any pending rating target.
                // Geometry-neutral like selectNode: no re-render (a full
                // solve would discard delivered geometry) — the marking
                // is removed from the existing DOM instead, and the
                // map-selection-dim observer clears sel-keep /
                // has-selection in response. Returns whether anything
                // was selected so callers can chain (Escape closes only
                // when clear).
                return clearSpokeSelection();
            },
            deknotter: {
                // DeKnotter driver (E1): the dedicated entry point for
                // DeKnotter runs. begin() opens the one module-scoped run
                // context (dkCtx); applyPhase() validates a phase patch's
                // branch/subcategory/kink length ratios against the baked
                // bases and the context cap (default 200) and, only when
                // every ratio passes, applies the patch ONCE through this
                // API's scoped entry (applyScoped, Stage 3 T6 — target =
                // the run's branch, ring auto, policy "contained"; the
                // patch itself still lands through this API's own apply
                // path, assign + forced solve) — never through editor
                // handlers or the shell's collect()/apply.
                // A rejected patch is logged whole and leaves layout state
                // untouched. Any exception inside applyPhase is logged,
                // clears the context, and is rethrown, so ordinary editor
                // use never resumes under a stale context.
                begin(e) {
                    if (dkCtx) {
                        return dkLog.push({
                            type: "begin-rejected",
                            reason: "a DeKnotter context is already active",
                            active: { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase },
                            requested: {
                                branch: e && e.branch != null ? String(e.branch) : null,
                                cap: e && e.cap != null ? Number(e.cap) : null
                            }
                        }), !1;
                    }
                    const t = e ? Number(e.cap) : NaN;
                    dkCtx = {
                        branch: e && e.branch != null ? String(e.branch) : null,
                        cap: Number.isFinite(t) && t > 0 ? t : 200,
                        phase: null,
                        control: e && e.control ? e.control : null,
                        phaseStartedAt: 0,
                        iterCount: 0,
                        lastBeatAt: 0
                    }, dkLog.length = 0, blitSigActive = !1, dkLog.push({
                        type: "begin",
                        branch: dkCtx.branch,
                        cap: dkCtx.cap
                    });
                    return { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase };
                },
                applyPhase(e, t) {
                    if (!dkCtx) throw new Error("deknotter.applyPhase: no active context — call deknotter.begin() first");
                    try {
                        dkCtx.phase = t == null ? dkCtx.phase : String(t);
                        // Q1: a new phase restarts the budget clock
                        // and the iteration count the budget / cancel
                        // reports cite.
                        dkCtx.phaseStartedAt = Date.now(), dkCtx.iterCount = 0, dkCtx.lastBeatAt = 0;
                        const n = dkValidatePhasePatch(e, dkCtx.cap);
                        if (n.failures.length) return dkLog.push({
                            type: "rejection",
                            branch: dkCtx.branch,
                            phase: dkCtx.phase,
                            cap: dkCtx.cap,
                            failures: n.failures,
                            ratios: n.ratios
                        }), {
                            ok: !1,
                            phase: dkCtx.phase,
                            rejected: n.failures
                        };
                        dkLog.push({
                            type: "phase",
                            branch: dkCtx.branch,
                            phase: dkCtx.phase,
                            cap: dkCtx.cap,
                            ratios: n.ratios
                        });
                        // Cascade containment (Stage 3, T6): the
                        // commit routes through applyScoped with the
                        // run's branch as the sole target and an
                        // explicitly EMPTY ring (ruled 2026-11-01
                        // 01:52, Jason: the freeze applies to every
                        // other branch, nearest neighbours
                        // included — only the target is
                        // recomputed), policy "contained", opClass
                        // "deknotter-<phase>". solveCommit declares
                        // that a phase's payload may be the solve
                        // itself: the fit and growth patches are
                        // value-identical snapshots whose work is
                        // the fit registry, which lives outside the
                        // patch, so applyScoped must not decline
                        // them as no-ops. A declared fallback
                        // (scoped:false) still means the patch WAS
                        // committed — applyScoped's fallback runs
                        // the ordinary full apply — so the phase
                        // succeeds and the run continues, exactly as
                        // a committed phase does today; the scoped
                        // outcome is declared in dkLog's
                        // "scoped-apply" entry (inside the phase's
                        // limiter-hit slice) and in this result.
                        const i = window.__SEXCAPADES_LAYOUT_API.applyScoped(e, {
                            target: dkCtx.branch ? [ dkCtx.branch ] : [],
                            ring: [],
                            policy: "contained",
                            opClass: "deknotter-" + dkCtx.phase,
                            solveCommit: !0
                        });
                        return { ok: !0, phase: dkCtx.phase, state: window.__SEXCAPADES_LAYOUT_API.get(), scoped: i };
                    } catch (e) {
                        dkLog.push({
                            type: "exception",
                            branch: dkCtx ? dkCtx.branch : null,
                            phase: dkCtx ? dkCtx.phase : null,
                            message: String(e && e.message || e)
                        });
                        dkCtx = null;
                        throw e;
                    }
                },
                end() {
                    if (!dkCtx) return !1;
                    const e = { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase };
                    return dkLog.push({ type: "end", branch: e.branch, cap: e.cap, phase: e.phase }), dkCtx = null, !0;
                },
                active: () => dkCtx ? { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase } : null,
                log: () => dkLog.slice(),
                // F6: stable blit-session completion signal for the
                // shell's rebuild gate — true while a blit settle is
                // still owed. Reproduces the verdict of the log's
                // last blit-session entry (the scan the gate used to
                // run), maintained by the blit module at every entry
                // push, removal, and clear; a settle's held "end"
                // clears it only when the entry actually lands.
                blitSessionActive: () => blitSigActive,
                // DeKnotter base state (E3): the _radialBase20 capture
                // recorded for one stable item key by the most recent
                // resolver entries, as { base, sig }, or null when the
                // key is unknown. Takes the full stable key (the form
                // 'base-recapture' log entries record); as a convenience
                // a "/" separated form of the same key, or a bare topic
                // ID / subcategory label that matches exactly one
                // registered identity, also resolves.
                baseState(key) {
                    if (null == key) return null;
                    const wanted = String(key), exact = dkBaseStates.get(wanted) || dkBaseStates.get(wanted.replace(/\//g, "|"));
                    if (exact) return { base: exact.base, sig: exact.sig };
                    let found = null, count = 0;
                    return dkBaseStates.forEach((value, k) => {
                        const seg = k.split("|");
                        (seg[seg.length - 1] === wanted || k.endsWith("|" + wanted)) && (found = value, count++);
                    }), 1 === count && found ? { base: found.base, sig: found.sig } : null;
                },
                // DeKnotter fit targets (E4): the driver surface over
                // the fit registry behind dkFitTargetFor. Targets are
                // radii in final rendered units, keyed by the same
                // stable identity as baseState ('topic|<branch>|<id>',
                // 'subcat|<branch>|<label>',
                // 'child|<branch>|<label>|<id>'). Registering or
                // clearing a target bumps the registry revision, which
                // changes the item's resolver signature, so the next
                // solve recaptures its base under the new governing
                // state — and a cleared item returns to legacy behavior.
                // None of these methods solves; the driver drives
                // solves through applyPhase()/apply() as before.
                setFitTarget(key, target) {
                    const k = null == key ? "" : String(key), v = Number(target);
                    if (!k || !Number.isFinite(v) || v <= 0) return dkLog.push({
                        type: "fit-set-rejected",
                        key: k || null,
                        target: null == target ? null : String(target)
                    }), !1;
                    return dkFitRegistry.set(k, v), dkFitRevision++, dkLog.push({
                        type: "fit-set",
                        key: k,
                        target: v,
                        revision: dkFitRevision
                    }), !0;
                },
                clearFitTarget(key) {
                    const k = null == key ? "" : String(key);
                    if (!k || !dkFitRegistry.has(k)) return !1;
                    return dkFitRegistry.delete(k), dkFitRevision++, dkLog.push({
                        type: "fit-clear",
                        key: k,
                        revision: dkFitRevision
                    }), !0;
                },
                clearAllFitTargets() {
                    const n = dkFitRegistry.size;
                    return n && (dkFitRegistry.clear(), dkFitRevision++, dkLog.push({
                        type: "fit-clear-all",
                        cleared: n,
                        revision: dkFitRevision
                    })), n;
                },
                fitTargets() {
                    const out = {};
                    return dkFitRegistry.forEach((v, k) => {
                        out[k] = v;
                    }), out.revision = dkFitRevision, out;
                },
                computeFitTarget(key) {
                    const target = dkComputeFitTarget(null == key ? "" : String(key));
                    return null == target && dkLog.push({
                        type: "fit-compute-miss",
                        key: null == key ? null : String(key)
                    }), target;
                },
                armFitForBranch(branch) {
                    const name = null == branch ? "" : String(branch), items = dkFitBranchItems(name);
                    if (!items.length) return dkLog.push({
                        type: "fit-arm-miss",
                        branch: name || null
                    }), 0;
                    let count = 0;
                    items.forEach(w => {
                        const key = dkRadialBaseInfo(w).key, computed = dkComputeFitTarget(key), target = null != computed ? computed : dkNameFitTargetForKey(key);
                        if (null == target) return;
                        dkFitRegistry.set(key, target), dkFitRevision++, count++;
                    });
                    return dkLog.push({
                        type: "fit-arm",
                        branch: name,
                        count: count,
                        revision: dkFitRevision
                    }), count;
                },
                fitReport(branch) {
                    const name = null == branch ? "" : String(branch);
                    return dkFitBranchItems(name).map(w => {
                        const key = dkRadialBaseInfo(w).key, target = dkFitRegistry.has(key) ? dkFitRegistry.get(key) : null, stored = dkBaseStates.get(key), delivered = stored && Number.isFinite(stored.delivered) ? stored.delivered : Number.isFinite(w.cloudRadius) ? w.cloudRadius : null, deviation = null != target && null != delivered ? delivered - target : null;
                        return {
                            key: key,
                            target: target,
                            delivered: delivered,
                            deviation: deviation,
                            deviationPct: null != deviation && target ? deviation / target * 100 : null
                        };
                    });
                },
                // Kink shrink to label length (ruled 2026-10-28):
                // a ONE-TIME normalization, deliberately NOT a
                // cascade phase and not phase-gated — it does not
                // run inside dkRunCascade and is kept separate from
                // the recurring growth runs. For every kink item of
                // the branch (gen-2 topics and subcategory children)
                // whose delivered radius exceeds its label-fit
                // target — the fit machinery's own measured length
                // for the item's name at the live font — the kink's
                // length override is scaled so the delivered radius
                // lands on that target. An item already at or below
                // its target holds: this never grows a kink. The
                // whole normalization lands as ONE ordinary apply of
                // a snapshot patch carrying only kink overrides, and
                // the returned record measures the effect (per-item
                // before/after lengths and delivered radii, plus
                // the branch's crossing number before/after).
                shrinkKinksToLabel(branch) {
                    const name = null == branch ? "" : String(branch), api = window.__SEXCAPADES_LAYOUT_API;
                    return (async () => {
                        const out = { branch: name, ok: !1, applied: 0, items: [], cloudBefore: null, cloudAfter: null, crossingDelta: null };
                        if (dkCtx) return out.reason = "a DeKnotter context is active", out;
                        const tax = dkBranchTaxonomy(name);
                        if (!tax) return out.reason = "unknown branch: " + (name || "(none)"), out;
                        try { out.cloudBefore = await sxCrossingCloudsReadout(name, "shrinkKinksToLabel: crossing readout unavailable"); } catch (e) { out.cloudBefore = null; }
                        const patch = dkDeepCloneLayout(api.get()), changed = [];
                        dkFitBranchItems(name).forEach(w => {
                            const info = dkRadialBaseInfo(w), key = info.key, kind = key.split("|")[0];
                            if ("topic" !== kind && "child" !== kind) return;
                            const id = "child" === kind ? (w.child ? w.child.id : null) : (w.topic ? w.topic.id : null);
                            if (null == id) return;
                            const label = "child" === kind ? (w.child ? w.child.label : w.label) : (w.topic ? w.topic.label : w.label), delivered = dkDeliveredItemRadius(w), target = dkComputeFitTarget(key), cur = (mn.kinkOverrides || {})[id], curLen = cur && Number(cur.length) > 0 ? Number(cur.length) : 1, item = { key: key, id: String(id), label: label || null, beforeLength: curLen, afterLength: curLen, beforeDelivered: Number.isFinite(delivered) ? delivered : null, afterDelivered: null, target: target, held: !0 };
                            if (Number.isFinite(delivered) && delivered > 0 && null != target && target > 0 && delivered > target) {
                                item.afterLength = sxLenConvert(curLen, delivered, target), item.held = !1, patch.kinkOverrides[id] = Object.assign({}, patch.kinkOverrides[id], { length: item.afterLength }), changed.push(item);
                            }
                            out.items.push(item);
                        });
                        if (changed.length) {
                            api.apply(patch), out.applied = changed.length;
                            const afterByKey = {};
                            dkFitBranchItems(name).forEach(w => {
                                afterByKey[dkRadialBaseInfo(w).key] = dkDeliveredItemRadius(w);
                            }), out.items.forEach(it => {
                                const v = afterByKey[it.key];
                                it.afterDelivered = Number.isFinite(v) ? v : null;
                            });
                        } else out.items.forEach(it => {
                            it.afterDelivered = it.beforeDelivered;
                        });
                        try { out.cloudAfter = await sxCrossingCloudsReadout(name, "shrinkKinksToLabel: crossing readout unavailable"); } catch (e) { out.cloudAfter = null; }
                        null != out.cloudBefore && null != out.cloudAfter && (out.crossingDelta = out.cloudAfter - out.cloudBefore), out.ok = !0, dkLog.push({ type: "kink-shrink-to-label", branch: name, applied: out.applied, cloudBefore: out.cloudBefore, cloudAfter: out.cloudAfter });
                        return out;
                    })();
                },
                // AUTOFIT (Group 3d, ruled 2026-10-28): the one-shot
                // fit behind the layout editor's Autofit button. Same
                // driver pattern as shrinkKinksToLabel above — fit
                // targets from dkComputeFitTarget, delivered radii
                // from dkDeliveredItemRadius, lengths scaled by
                // OVERGROWN target / delivered (the multiple is the
                // "% kink leaf overgrowth" percent, ruled 2026-11-03,
                // superseding the hard 3x ruled 2026-11-02 17:09; it
                // lives only in this driver's delivered-length
                // computation below, via sxLeafOvergrowthFactor) —
                // with the three ruled deltas:
                // (1) BOTH directions: a spoke longer than its fit
                // target shrinks and a spoke shorter than its target
                // lengthens, by the same ratio; items within
                // AUTOFIT_EPS (relative) of target hold untouched.
                // (2) SCOPE: any list of branches (one branch, or
                // every branch for a whole-map run) accumulates into
                // ONE kink-overrides map. (3) ONE-SHOT: this method
                // only COMPUTES the patch — it never applies, never
                // writes an armed flag, and leaves no state that
                // re-triggers on
                // later builds. The caller (the editor shell) lands
                // the returned map through its central apply() once.
                // Subcategory hub nodes themselves are not fitted
                // (kind filter topic/child, exactly as the driver);
                // only kink spokes move.
                autofitMeasure(branches) {
                    const names = Array.isArray(branches) ? branches.map(v => String(v)) : [], items = [], seen = {};
                    if (dkCtx) return { ok: !1, reason: "a DeKnotter context is active", items: items, branchesSeen: [] };
                    names.forEach(name => {
                        if (!dkBranchTaxonomy(name)) return;
                        seen[name] = !0;
                        dkFitBranchItems(name).forEach(w => {
                            const info = dkRadialBaseInfo(w), key = info.key, kind = key.split("|")[0];
                            if ("topic" !== kind && "child" !== kind) return;
                            const id = "child" === kind ? (w.child ? w.child.id : null) : (w.topic ? w.topic.id : null);
                            if (null == id) return;
                            const label = "child" === kind ? (w.child ? w.child.label : w.label) : (w.topic ? w.topic.label : w.label), delivered = dkDeliveredItemRadius(w), target = dkComputeFitTarget(key), cur = (mn.kinkOverrides || {})[id], curLen = cur && Number(cur.length) > 0 ? Number(cur.length) : 1;
                            items.push({ branch: name, key: key, id: String(id), label: label || null, delivered: Number.isFinite(delivered) ? delivered : null, target: null != target && Number.isFinite(target) ? target : null, curLen: curLen });
                        });
                    });
                    return { ok: !0, reason: null, items: items, branchesSeen: Object.keys(seen) };
                },
                computeAutofitPatch(branches) {
                    const EPS = .01, measured = this.autofitMeasure(branches), out = { ok: !1, reason: null, eps: EPS, kinkOverrides: null, items: [], changed: 0, shortened: 0, lengthened: 0, held: 0, skipped: 0, branchesSeen: measured.branchesSeen || [] };
                    if (!measured.ok) return out.reason = measured.reason, out;
                    if (!measured.items.length) return out.reason = "no rendered kink items to fit", out;
                    const next = {};
                    Object.keys(mn.kinkOverrides || {}).forEach(id => {
                        next[id] = Object.assign({}, mn.kinkOverrides[id]);
                    });
                    measured.items.forEach(m => {
                        // OVERGROWN FIT (ruled 2026-11-03, Jason,
                        // superseding the hard 3x of 2026-11-02 17:09):
                        // this driver — the Autofit button's alone —
                        // delivers each kink spoke at the "% kink leaf
                        // overgrowth" percent of its fit target (the
                        // same percent the Anneal throw uses, via
                        // sxLeafOvergrowthFactor). dkComputeFitTarget
                        // itself is NOT changed; the multiple lives
                        // only here, in the delivered-length
                        // computation, so the shrink floors and the
                        // scoring keep reading the unscaled target.
                        // The hold epsilon and the shortened /
                        // lengthened split are judged against the
                        // delivered target, so a spoke already at the
                        // chosen percent holds and a spoke sitting at
                        // 1x lengthens.
                        const deliveredTarget = null != m.target && m.target > 0 ? sxLeafOvergrowthFactor() * m.target : m.target;
                        const item = { branch: m.branch, key: m.key, id: m.id, label: m.label, beforeLength: m.curLen, afterLength: m.curLen, beforeDelivered: m.delivered, target: m.target, deliveredTarget: deliveredTarget, held: !0 };
                        if (null == m.delivered || !(m.delivered > 0) || null == m.target || !(m.target > 0)) out.skipped++;
                        else if (Math.abs(m.delivered - deliveredTarget) / deliveredTarget <= EPS) out.held++;
                        else {
                            item.afterLength = m.curLen * deliveredTarget / m.delivered, item.held = !1, next[m.id] = Object.assign({}, next[m.id], { length: item.afterLength }), out.changed++, m.delivered > deliveredTarget ? out.shortened++ : out.lengthened++;
                        }
                        out.items.push(item);
                    });
                    return out.kinkOverrides = next, out.ok = !0, dkLog.push({ type: "autofit-compute", branches: out.branchesSeen.slice(), changed: out.changed, shortened: out.shortened, lengthened: out.lengthened, held: out.held, skipped: out.skipped }), out;
                },
                // DeKnotter gate primitive (E2): snapshot() captures a
                // deep clone of the current layout state (see
                // dkDeepCloneLayout); (F8: the LAYOUT-settings
                // snapshot — not the sharing profile/data snapshot.)
                // restore() installs a snapshot by
                // applying a FRESH deep clone of it through this API's
                // own apply path, so the snapshot object itself is never
                // installed by reference. Both work with or without an
                // active run context. measureCloud() reads one branch's
                // own-cloud CROSSING NUMBER (Q4: the anneal gate's
                // decider metric) straight from the shell metric
                // registry's crossingnumber clouds walk — called
                // directly with its (ctx, done, isCancelled) contract
                // and awaited — never via scheduleMetric(), and it
                // never touches the user's selected display metric.
                // (Before Q4 this readout was the branch's local
                // xAreaCross area; the area observation was removed
                // in M1, 2026-10-29 — see the removal record below.)
                // canonical() is the stable
                // sorted stringify two states are compared with;
                // gate() is the pure improve-or-hold comparison on the
                // exact floats.
                snapshot() {
                    return dkDeepCloneLayout(window.__SEXCAPADES_LAYOUT_API.get());
                },
                restore(snap) {
                    if (!snap || "object" != typeof snap) throw new Error("deknotter.restore: snapshot must be a layout state object");
                    return window.__SEXCAPADES_LAYOUT_API.apply(dkDeepCloneLayout(snap));
                },
                measureCloud(branch) {
                    // STAGED SCORING (ruled 2026-11-02, Jason): during
                    // an active cascade run, the run branch's judged
                    // score is the staged score (see
                    // sxCrossingStagedCloud); every other read — any
                    // other branch, and every read outside a run —
                    // keeps the standing readout below, unchanged.
                    if (sxAnnealStageCtx && branch === sxAnnealStageCtx.branch) {
                        const stagedVal = sxCrossingStagedCloud(branch, sxAnnealStageCtx.adjacent);
                        if (null != stagedVal && Number.isFinite(stagedVal)) return Promise.resolve(stagedVal);
                    }
                    return sxCrossingCloudsReadout(branch, "deknotter.measureCloud: LayoutMetrics.defs.crossingnumber.clouds is unavailable");
                },
                // Q4: EVERY cloud's crossing number in one walk of
                // the same crossingnumber clouds readout
                // measureCloud() uses — the cascade's neighbor-report
                // source and nothing else: these values are reported,
                // never gated. Missing or non-finite values read as
                // 0, exactly as measureCloud treats them.
                measureCloudsAll() {
                    return sxCrossingCloudsReadout(null, "deknotter.measureCloudsAll: LayoutMetrics.defs.crossingnumber.clouds is unavailable");
                },
                // Single removal record for the retired area
                // observation (2026-10-29, M1; commented-out code
                // deleted 2026-10-30, paragraph-6 solver-metrics
                // edit): the cascade's secondary area readout —
                // measureCloudArea(branch), the shell's xareacross
                // clouds walk, never gating anything — and its
                // callers in dkRunCascade were removed with the area
                // observation. Revival is NOT an uncomment: re-derive
                // a live walk against the current
                // LayoutMetrics.defs.xareacross.clouds and wire it
                // as a new readout. (The xareacross metric itself
                // stays live in the shell; only this cascade
                // observation of it was retired.)
                canonical(state) {
                    return dkStableStringify(void 0 === state ? window.__SEXCAPADES_LAYOUT_API.get() : state);
                },
                gate(before, after) {
                    return after <= before;
                },
                // DeKnotter cascade driver (E5): run one full
                // cascade for a branch (see dkRunCascade). Async —
                // resolves to the run report, which is also appended
                // to the DeKnotter log as a 'run-report' entry.
                // opts._testFinalPatch is a test-only hook, documented
                // at its merge site in dkRunCascade. opts.onPhase (E6)
                // is invoked after each phase commits with that phase's
                // summary; the driver yields at each phase boundary
                // before the phase's synchronous apply.
                run(branch, opts) {
                    // ANNEAL REPORT TEST HOOK (see sxPublishAnnealReport
                    // beside dkLog): mark the run pending, then mirror
                    // the settled outcome onto the diagnostic surfaces.
                    // The cascade's own promise is returned untouched —
                    // the hook only observes it, and its writer never
                    // throws, so run behaviour is unchanged.
                    sxPublishAnnealReport(null, true);
                    const runPromise = SX_SOLVER_FACADE.untangle(branch, opts);
                    if (runPromise && "function" == typeof runPromise.then) runPromise.then(report => sxPublishAnnealReport(report, false), () => sxPublishAnnealReport(null, false));
                    return runPromise;
                }
            }
        }, window.__SEXCAPADES_LAYOUT_API.anneal=window.__SEXCAPADES_LAYOUT_API.deknotter, Cn.classList.toggle("is-static", Boolean(mn.staticMap)), Jw();
        window.__sexcapades = {
            ProfileIO: yx,
            profilePayload: function(e) {
                return yx.serialize("profile", {
                    person: e
                });
            },
            importPayload: wx,
            importSharedPayload: kx,
            fullProfileDataNodeIds: Hw,
            getActiveProfileId: function() {
                return Mt;
            }
        };

        if (window.__SX_HEADLESS) {
            document.documentElement.classList.remove("route-listview-pending");
            console.log("[Sexcapades] Headless test mode active — skipping interactive map boot.");
            return;
        }

        bS ? (gS(), document.documentElement.classList.remove("route-listview-pending"),
        t.setTimeout(Nu, 0)) : yS ? (function() {
            try {
                const e = dS();
                window.__SEXCAPADES_START_ROUTE = "", e ? !rS && (rS = !0, Ms(Mt && vt[Mt] ? Mt : Et)) : rS = !1;
            } finally {
                // A throw inside the list open used to skip this and leave
                // the whole page visibility:hidden, including the list.
                document.documentElement.classList.remove("route-listview-pending");
            }
        }(), t.setTimeout(Nu, 0)) : vS ? (mS(),
        document.documentElement.classList.remove("route-listview-pending"), t.setTimeout(Nu, 0)) : (async () => {
            Nu(), sxShowCompareRoute(), document.documentElement.classList.remove("route-listview-pending");
            if (Do.open) {
                Is(), mS();
            } else {
                let warmRestored = false;
                try {
                    warmRestored = await window.SexcapadesEngine?.Map?.tryRestoreWarmBoot?.();
                } catch (_) {}
                if (warmRestored) {
                    try { Ih(); } catch (_) {}
                    mS();
                } else {
                    requestAnimationFrame(() => t.setTimeout(() => {
                        Mr({ animate: !1 });
                        Ih();
                        mS();
                    }, 0));
                }
            }
        })();

        window.Sexcapades2xProfiles = {
            getAll: function() {
                const e = {};
                try {
                    Object.keys(vt).forEach(t => {
                        vt[t] && (e[t] = this.exportFullProfile(t));
                    });
                } catch (e) { __sxErrLog("profile-export", e); }
                return e;
            },
            getIds: function() {
                try {
                    return Object.keys(vt);
                } catch (e) {
                    return [];
                }
            },
            has: function(e) {
                try {
                    return !!vt[e];
                } catch (e) {
                    return !1;
                }
            },
            isDirty: function(e) {
                try {
                    return !(void 0 === yt || !yt[e]);
                } catch (e) {
                    return !1;
                }
            },
            isSample: function(e) {
                try {
                    return !0 === sampleProfileFlags[e];
                } catch (e) {
                    return !1;
                }
            },
            getDraftRatings: function(e) {
                try {
                    const t = e || Mt;
                    return cloneProfileData(draftRatings[t] || yt[t] && vt[t] || {}) || {};
                } catch (e) {
                    return {};
                }
            },
            setDraftRatings: function(e, t) {
                try {
                    if (!e || !vt[e] || !t || "object" != typeof t || Array.isArray(t)) return !1;
                    const n = {};
                    Object.entries(t).forEach(([e, t]) => {
                        if (!Ke.has(e)) return;
                        if (Number.isFinite(Number(t))) n[e] = Math.max(-100, Math.min(100, Number(t))); else if (t && "object" == typeof t) {
                            const i = {};
                            [ "give", "receive" ].forEach(e => {
                                Object.prototype.hasOwnProperty.call(t, e) && Number.isFinite(Number(t[e])) && (i[e] = Math.max(-100, Math.min(100, Number(t[e]))));
                            }), Object.keys(i).length && (n[e] = i);
                        }
                    }), vt[e] = n, zt(e), e === Mt && (Mr({
                        animate: !1,
                        forceRepaint: !0
                    }), Ih());
                    return !0;
                } catch (e) {
                    return !1;
                }
            },
            clearDraftRatings: function(e) {
                try {
                    const n = e || Mt;
                    return n && (delete draftRatings[n], draftSaveTimers[n] && (t.clear(draftSaveTimers[n]), delete draftSaveTimers[n])), 
                    !0;
                } catch (e) {
                    return !1;
                }
            },
            exportFullProfile: function(e) {
                try {
                    return vt[e] ? cloneProfileData(Ww(e)) : null;
                } catch (e) {
                    return null;
                }
            },
            markSaved: function(e) {
                try {
                    return e && vt[e] && (Vt(e), !0);
                } catch (e) {
                    return !1;
                }
            },
            importData: function(e, t, opts) {
                try {
                    if (!t || "object" != typeof t || Array.isArray(t)) return !1;
                    let n = cloneProfileData(t);
                    const i = n && n.ratings && "object" == typeof n.ratings, a = n && "sexcapades" === n.app;
                    if (!a) n = i ? Object.assign({
                        app: "sexcapades",
                        version: 16,
                        profileName: wt[e] || String(e || "Imported profile").replace(/^profile-/, "") || "Imported profile"
                    }, n) : {
                        app: "sexcapades",
                        version: 16,
                        profileName: wt[e] || String(e || "Imported profile").replace(/^profile-/, "") || "Imported profile",
                        ratings: n
                    };
                    const rememberedName = String(wt[e] || "").trim();
                    (!n.profileName || /^unknown$/i.test(String(n.profileName).trim())) && (n.profileName = rememberedName && !/^unknown$/i.test(rememberedName) ? rememberedName : "Untitled profile"), n.version = 16, n.app = "sexcapades";
                    const r = wx(n, {
                        quiet: !0,
                        autoSelect: opts && opts.autoSelect
                    }), o = e || r;
                    if (o !== r) {
                        const t = Mt === r, n = It === r;
                        // F1: the re-key move carries EVERY list on the
                        // canonical list (this now includes the
                        // per-profile colors, tn). droppedKeyRecords
                        // rides along as an import-path extra: it was
                        // produced by the import that just ran under
                        // the throwaway id.
                        SX_PROFILE_FIELDS.forEach(e => {
                            Object.prototype.hasOwnProperty.call(e, r) ? e[o] = e[r] : delete e[o], Reflect.deleteProperty(e, r);
                        }), Object.prototype.hasOwnProperty.call(droppedKeyRecords, r) ? (droppedKeyRecords[o] = droppedKeyRecords[r], Reflect.deleteProperty(droppedKeyRecords, r)) : delete droppedKeyRecords[o], t && (Mt = o), n && (It = o);
                    }
                    return Vt(o), Jw(), Mt === o && (Mr({
                        animate: !1,
                        forceRepaint: !0
                    }), Ih()), o;
                } catch (e) {
                    // Fix 1, item 1: importData used to swallow its own
                    // failure and return false, so the restore callers'
                    // catch blocks never fired. Log it here; the
                    // return contract (false on failure) is unchanged.
                    __sxErrLog("profile-import", e);
                    return !1;
                }
            }
        };

        if (window.SexcapadesEngine && window.SexcapadesEngine.Profiles) {
            window.SexcapadesEngine.Profiles.io = window.__sexcapades;
            window.SexcapadesEngine.Profiles.manager = window.Sexcapades2xProfiles;
        }
    }();
