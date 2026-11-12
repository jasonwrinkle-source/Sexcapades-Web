        // DeKnotter run context (E1): module-scoped state behind the
        // dedicated driver API at __SEXCAPADES_LAYOUT_API.deknotter. While
        // a context is active, deknotter.applyPhase validates every
        // branch/subcategory/kink length override in a phase patch as a
        // ratio against the item's baked base (the same bases the layout
        // editor's honesty readout uses) and rejects the whole patch when
        // any ratio is non-finite or outside 0 < ratio <= cap. The solver
        // consults dkCtx in exactly two places: frClampCloudRadii (throw
        // phase neighbor-cap relief for the active branch only) and
        // rr.optimizeSpokeLengths (change logging for the active branch).
        // With no context active, nothing here alters ordinary behavior.
        let dkCtx = null;
        const dkLog = [];
        // ANNEAL REPORT TEST HOOK (permanent diagnostic surface,
        // added 2026-11-03): sxPublishAnnealReport mirrors the
        // latest deknotter.run() outcome onto three read-only
        // surfaces, so a harness that can observe the DOM but
        // cannot evaluate JavaScript in the page can still
        // capture a full run receipt: (1) an inert
        // <script type="application/json" id="sx-anneal-report">
        // node holding {runId, pending, finishedAt, report,
        // dkLog}; (2) window.__sxAnnealReport, the report
        // snapshot; (3) window.__sxDkLog, the dkLog snapshot
        // capped at the last 200 entries; (4) a hidden
        // off-screen <div id="sx-anneal-report-text"> in
        // document.body holding the identical JSON snapshot
        // string as surface (1) — DOM observation channels
        // that exclude script elements can still read a
        // div's text. deknotter.run() calls
        // it at run start (pending true, previous report kept)
        // and when the run promise settles (pending false,
        // finishedAt set, report = the resolved report, whole —
        // no fields picked or added). The snapshot is a
        // JSON-safe deep copy: the replacer drops functions and
        // undefined values and cuts circular references (shared
        // non-circular references are copied in full); if a copy
        // still fails, an error marker is written instead. The
        // whole body is guarded — a hook failure can never
        // affect a run — and the promise returned to the caller
        // is the cascade's own, untouched. Nothing here changes
        // solver behaviour, paint, or the report itself.
        let sxAnnealRunSeq = 0, sxAnnealLastReport = null;
        function sxPublishAnnealReport(report, pending) {
            try {
                if (pending) sxAnnealRunSeq++; else sxAnnealLastReport = report || null;
                const copy = value => {
                    const ancestors = [];
                    return JSON.parse(JSON.stringify(value, function(k, v) {
                        if ("function" == typeof v || "undefined" == typeof v) return undefined;
                        if (v && "object" == typeof v) {
                            while (ancestors.length && ancestors[ancestors.length - 1] !== this) ancestors.pop();
                            if (ancestors.indexOf(v) >= 0) return undefined;
                            ancestors.push(v);
                        }
                        return v;
                    }));
                };
                const snap = { runId: sxAnnealRunSeq, pending: !!pending, finishedAt: pending ? null : new Date().toISOString(), report: null, dkLog: [] };
                try {
                    snap.report = copy(sxAnnealLastReport);
                } catch (e) {
                    snap.report = { __sxHookError: String(e && e.message || e) };
                }
                try {
                    snap.dkLog = copy(dkLog.slice(-200));
                } catch (e) {
                    snap.dkLog = [];
                }
                window.__sxAnnealReport = snap.report;
                window.__sxDkLog = snap.dkLog;
                const snapText = JSON.stringify(snap);
                let node = document.getElementById("sx-anneal-report");
                if (!node) {
                    node = document.createElement("script");
                    node.type = "application/json";
                    node.id = "sx-anneal-report";
                    (document.head || document.documentElement).appendChild(node);
                }
                node.textContent = snapText;
                // DIV MIRROR (permanent diagnostic surface): the
                // identical snapshot string in an off-screen div,
                // because observation channels that exclude
                // script elements can still read a div's text.
                // Hidden with the page's skip-link pattern
                // (position:absolute; left:-9999px) — never
                // display:none, visibility:hidden, or
                // aria-hidden, which could drop it from the
                // observation channel it exists to serve.
                // Recreated if missing; inside the same guarded
                // try as every other surface, so it can never
                // affect a run.
                let mirror = document.getElementById("sx-anneal-report-text");
                if (!mirror) {
                    mirror = document.createElement("div");
                    mirror.id = "sx-anneal-report-text";
                    mirror.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;";
                    (document.body || document.documentElement).appendChild(mirror);
                }
                mirror.textContent = snapText;
            } catch (e) {}
        }
        // Q1 run observability (Phase Q1): per-phase wall-clock
        // budget for a DeKnotter run context. A single phase may run
        // at most this long; past it, dkSolvePoll throws a budget
        // error that unwinds the cascade into its snapshot restore.
        const DK_PHASE_BUDGET_MS = 180000;
        // SOLVER-METRICS REFACTOR (F9): ONE named constants block for the
        // untangler / optimizer magic numbers that used to sit inline at
        // their use sites. TRANSCRIPTION ONLY — every value below is the
        // exact literal it replaces; nothing was redesigned. (The
        // paint-stage tidier's anneal constants were already gathered as
        // the SX_STEP_R / SX_T0 / SX_SWEEPS / SX_SEED block beside
        // sxSolverMode; they stay there — see the F3 facade note.)
        // PER-PHASE GATE (Phase 4, 2026-11-04): the only stop.
        // Tolerance is flat GATE_TOL (2). The larger-of-1-and-
        // 10%-of-previous form is removed. The onset margin and
        // the fine-tune margin are deleted; no selector remains.
        const SX_SCORE = {
            REGRESSION_TOL: .01,
            // Throw (RE-RULED 2026-11-01, Jason — supersedes
            // the 2026-10-31 x25 / x15 factors and the kink
            // throw factor): the throw is now measured in
            // center-avatar circle radii — the branch is thrown
            // out to 50 times that radius and the subcategories
            // to 20 times that radius (Jason first said 10 for
            // the subcategories and corrected it to 20 the same
            // day; 20 is the ruled value). The factors count
            // center-avatar radii in world units — the branch's
            // distance from the center, and the subcategory's
            // segment out from its branch node — and stepThrow
            // converts them into override lengths through the
            // pre-run delivered radii; they are NOT multiples
            // of the baked base (the direct-factor reading threw
            // tens of times too far: diagnosis c17e4775,
            // confirmed 2026-11-01; the radius is the center
            // avatar disc radius the Center ring scale slider
            // sets, settled by Jason 2026-11-01 04:56 CST). The individual
            // kink leaves are NOT thrown by a radii factor at all:
            // they autofit to THREE TIMES their kink (fit) length
            // — the full fit length: name + neighbour pitch +
            // icon + clearance (dkComputeFitTarget) — see
            // stepThrow's throwFitCap, which GOVERNS the kink
            // throw length instead of merely capping it, and
            // LEAF_FIT_FACTOR below, which carries the multiple.
            // THROW_KINK survives only as the fallback
            // multiple of the baked kink base for a kink whose
            // fit target cannot be computed, and it is 3 for
            // the same reason (RE-RULED 2026-11-02 16:59 CST,
            // Jason, reversing the same day's 13:11 1x ruling
            // for kink leaves only and superseding it; the 1
            // briefly stood between the 2026-11-01 value 3 and
            // this restoration): three times the kink
            // length itself is the kink throw, by fit or by
            // base. These factors are ceilings on the THROW only —
            // they are not growth-ladder step sizes; the growth
            // ladder is a separate phase (GROWTH_* below:
            // 1.25x steps to a 3x cumulative cap) and is never
            // conflated with them.
            THROW_BRANCH: 50,
            THROW_SUBCAT: 20,
            THROW_KINK: 3, // SUPERSEDED 2026-11-03 as a read value: the throw's baked-base fallback multiple is now sxLeafOvergrowthFactor() (the "% kink leaf overgrowth" slider); 3 remains the fallback percent's equivalent (300%).
            // LEAF FIT MULTIPLE (RE-RULED 2026-11-02 16:59 CST,
            // Jason — leaves only, reversing the 13:11 1x leaf
            // ruling): the kink-leaf throw length AND the
            // kink-leaf minimum are both THREE TIMES the full
            // fit target at the current font size — the whole
            // fit width tripled (dkComputeFitTarget's target:
            // kink name + neighbour pitch + icon + clearance +
            // padding, as that function composes them), not 3x
            // the name alone. Kinks have no shrink ladder of
            // their own — they keep their thrown, fit-capped
            // lengths — so the throwFitCap multiple IS the leaf
            // minimum as well as the leaf throw. This factor is
            // read ONLY at the leaf throwFitCap site; category
            // and subcategory throws (50x / 20x above) and their
            // 1x floors (SHRINK_FLOOR_FACTOR below) are
            // unchanged, and no other floor reader reads this.
            LEAF_FIT_FACTOR: 3, // SUPERSEDED 2026-11-03 as a read value: the throwFitCap multiple is now sxLeafOvergrowthFactor() (the "% kink leaf overgrowth" slider, default 300%); kept as the documented historical multiple.
            // SHRINK FLOORS (ruled 2026-11-01, Jason — supersedes
            // the 1x own-length floors: the 2026-11-01 01:44
            // subcategory name-length floor and the 2026-10-29
            // kink-name-length branch floor): when Anneal shrinks,
            // every level's floor is ONE TIMES that level's own
            // length (RE-RULED 2026-11-02, Jason, superseding
            // the 2026-11-01 3x floors) — subcategories
            // shrink to 1x the subcategory length (1x name
            // length on the fit lever, the fit-derived floor on
            // the override lever), and categories/branches
            // shrink to a floor of 1x the category length (1x
            // the label-fit floor). (Kink leaves are the one
            // exception to this shared factor: their throw and
            // minimum are 3x the full fit target under
            // LEAF_FIT_FACTOR above, re-ruled 2026-11-02 16:59
            // CST; this shared factor's readers are the
            // subcategory and category floors only.) All other shrink rules
            // stand (square-root steps — ruled 2026-11-02, Jason,
            // superseding the 10% steps named here before — one at
            // a time, per-phase gate stop (flat 2; the
            // more-than-three onset margin is deleted), per-subcategory back-out, skip-throw-under-5
            // shrinking from current lengths).
            SHRINK_FLOOR_FACTOR: 1,
            GATE_TOL: 2,
            // FINE-TUNE SKIP-THROW (ruled 2026-10-29; skip re-ruled
            // 2026-11-01): a branch whose pre-run crossing number is
            // STRICTLY below FINE_TUNE_BELOW (zero included) skips the
            // throw and shrinks from its current lengths. This number
            // is a path choice, not a stop. The onset margin (3) and
            // the fine-tune margin (live value 3; the earlier
            // more-than-one stop was already gone) were deleted
            // Phase 4, 2026-11-04. The per-phase gate above is the
            // only stop.
            FINE_TUNE_BELOW: 5,
            // THROW REPEAT (ruled 2026-11-06, Jason): short kink
            // names get trapped in local minima on the baked
            // defaults because the throw — a multiple of the kink
            // length, derived from the centre ring radius — does
            // not throw them out far enough to clear. After the
            // throw, if the branch's crossing number has NOT
            // dropped by MORE than THROW_REPEAT_DROP (75%) from
            // the run baseline (report.baseline.first, the same
            // own-cloud composition the fine-tune decision
            // reads), the throw is repeated — up to
            // THROW_REPEAT_MAX_EXTRA (3) extra times, four
            // throws total — stopping early as soon as one throw
            // achieves the more-than-75% drop. The throw itself
            // is unchanged: same stepThrow, same 50x / 20x radii
            // targets, same 3x kink-leaf fit length; only the
            // repetition is new (stepThrowRepeated, beside
            // stepThrow). A run on the fine-tune skip-throw path
            // never throws, so it never repeats.
            THROW_REPEAT_DROP: .75,
            THROW_REPEAT_MAX_EXTRA: 3,
            OPTIMIZER_MAX_PASSES: 96,
            // Growth (ruled 2026-10-28; the 2026-10-31 single-step
            // 1.20x / 50x-cap reading was the throw correction
            // misapplied to this ladder and is reverted the same
            // day): scoped same-branch growth in the cascade — step
            // factor per kept growth step, max kept steps per grown
            // level (branch, subcategory), cumulative cap as a
            // TARGET (the step that would exceed it clips to
            // exactly the cap and is gated like the rest), and the
            // dominance threshold: a cloud grows only when
            // same-branch pairs contribute more than this share of
            // its standing E. This ladder (1.25x steps to 3x) is a
            // separate phase from the throw above and carries no
            // part of the throw's caps.
            GROWTH_STEP: 1.25,
            GROWTH_MAX_STEPS: 5,
            GROWTH_CAP: 3,
            GROWTH_DOMINANCE: .5,
            // BAKE GATE (ruled 2026-10-29, M4): the bake decision's
            // limit on the TOTAL crossing number (this cloud plus
            // every neighbor cloud, combined) — passes only when
            // its increase is strictly less than this. Replaces the
            // retired combined-area check (combined area delta <=
            // 10). Reported for the bake decision; it never gates
            // the run itself. Single source: dkBakeGate below is
            // the only reader, called at both run endings.
            BAKE_GATE_LIMIT: 5
        };
        // Q1: polled once per optimiser iteration while a DeKnotter
        // context is active (inert otherwise — dkCtx is null for
        // every ordinary solve). Three duties, in order: (1) honour
        // the run's cancel flag, throwing a marked cancel error;
        // (2) enforce the per-phase wall-clock budget, throwing a
        // marked budget error carrying the phase's iteration count;
        // (3) fire the run's heartbeat hook at most every 2 s of
        // solve time, so a slow phase stays distinguishable from a
        // stuck one. The thrown errors are the cascade's ordinary
        // failure path: snapshot restored, gate "reverted", reason
        // reported — no new unwind machinery.
        function dkSolvePoll() {
            if (!dkCtx) return;
            dkCtx.iterCount = (dkCtx.iterCount || 0) + 1;
            const ctl = dkCtx.control, now = Date.now();
            if (ctl && "function" == typeof ctl.shouldCancel && ctl.shouldCancel()) {
                const err = new Error("cancelled: phase '" + (dkCtx.phase || "") + "' stopped by user after " + dkCtx.iterCount + " iterations");
                throw err.dkCancelled = !0, err.phase = dkCtx.phase, err.iterations = dkCtx.iterCount, err;
            }
            if (dkCtx.phaseStartedAt && now - dkCtx.phaseStartedAt > DK_PHASE_BUDGET_MS) {
                const err = new Error("aborted: phase '" + (dkCtx.phase || "") + "' exceeded budget (" + Math.round(DK_PHASE_BUDGET_MS / 1e3) + " s) after " + dkCtx.iterCount + " iterations");
                throw err.dkBudget = !0, err.phase = dkCtx.phase, err.iterations = dkCtx.iterCount, err;
            }
            if (ctl && "function" == typeof ctl.onHeartbeat && now - (dkCtx.lastBeatAt || 0) >= 2e3) {
                dkCtx.lastBeatAt = now;
                try {
                    ctl.onHeartbeat({ phase: dkCtx.phase, phaseElapsedMs: dkCtx.phaseStartedAt ? now - dkCtx.phaseStartedAt : 0, iterations: dkCtx.iterCount });
                } catch (e) {}
            }
        }
        // Scoped-solve context (Stage 3, T2): module-scoped state behind
        // __SEXCAPADES_LAYOUT_API.applyScoped, following the dkCtx
        // precedent above. While a context is active, it is consulted
        // in exactly three places: the post-solve subLen scale in fr()
        // (frozen branches are skipped, so the scale applies only
        // inside the recompute set), the solve-completion freeze
        // replay in fr() (frozen branches' solved geometry and
        // _spokeAdjust20 are restored verbatim from the pre-patch
        // capture the context carries, and the delivered-geometry
        // registry is merged so frozen items keep their pre-solve
        // entries), and the post-paint settle search in Ar() (a
        // frozen node is seated at exactly its captured delivered
        // center and the search never runs for it; its shapes still
        // accumulate as obstacles). The coupling-channel passes
        // (frClampCloudRadii, rr.optimizeSpokeLengths,
        // rr.applyExpansionRelief) do NOT consult it yet — T3
        // disciplines those; T2's guarantee comes from
        // capture/restore/merge alone. With no context active,
        // nothing here alters ordinary behavior. The context is set
        // and cleared only by applyScoped (try/finally).
        //
        // T3 (coupling-channel discipline): the context is now also
        // consulted by the three coupling passes and by Ar()'s
        // paint. frClampCloudRadii evaluates caps only for
        // recompute-set branches (frozen caps skipped, counted in
        // dropped.clamp). rr.optimizeSpokeLengths never applies a
        // candidate delta to a frozen branch (suppressed, counted in
        // dropped.optimiser; pairs with both branches frozen are
        // skipped during candidate enumeration), and the
        // _spokeAdjust20 reset in fr() exempts frozen branches so
        // their captured adjustments persist into the solve.
        // rr.applyExpansionRelief / cascadeReliefPass suppress any
        // relief candidate whose source or target branch is frozen
        // (counted in dropped.relief, appended to boundaryLog as
        // {channel:"relief", source, target, pass}); under scope
        // policy "fallback" the first such event sets ctx.r6Abort —
        // the relief channel stops at its next seam and applyScoped
        // discards the scoped result for an ordinary full apply,
        // declared as fallback "R6: boundary pressure" (Mr() swallows
        // render exceptions into its paused state, so the abort is a
        // flag, never a throw). Ar() retains frozen branches'
        // .node-group DOM elements across its rebuild (scoped
        // paint). applyScoped declines to scope at all when
        // mn.crossmin is on (fallback "crossmin-on").
        let scCtx = null;
        // T3 relief boundary event: count the suppression, append
        // the boundaryLog entry (carrying the caller's op class when
        // the scope provided one), and — under the "fallback"
        // policy — raise the R6 abort flag on the first event.
        // Optimiser and clamp suppressions never come through here:
        // only relief boundary events can trigger R6.
        function scReliefBoundary(ctx, source, target, pass) {
            ctx.dropped.relief++;
            const entry = {
                channel: "relief",
                source: source,
                target: target,
                pass: pass
            };
            null != ctx.opClass && (entry.opClass = ctx.opClass), ctx.boundaryLog.push(entry), "fallback" === ctx.policy && (ctx.r6Abort = !0);
        }
        function scSectorFrozen(sec) {
            return Boolean(scCtx && sec && sec.entry && sec.entry.branch && scCtx.frozenBranches.has(sec.entry.branch.name));
        }
        function scSectorName(sec) {
            return sec && sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
        }
        // Blit session (P3): during a burst of scoped paints with
        // animations OFF (the shipped default; read as !!mn.animations,
        // the same flag P2 gates on), the frozen complement renders as
        // ONE world-space raster image instead of live vector elements,
        // while the live zone (target ∪ ring branches) stays fully
        // vector and the relations layer and the center stay live
        // vector above the raster. Rest state is always a full
        // pure-vector paint. The P1 segment machinery (scSeg &c.) is
        // Ar-function-scope, so the session keeps its own module-scope
        // state here and its own collection code (same selectors, same
        // in-group-first-then-stacks piece semantics). The session is
        // scoped and ephemeral, and rendering only: the vault and the
        // image never enter saved state (snapshot/restore and
        // layout-state collect() are DOM-independent), and every exit
        // goes through an ordinary paint whose top-of-paint clear
        // removes both artifacts.
        //   START: the first scoped paint of a burst runs as a normal
        //     P1 segment paint; when it completes, the frozen
        //     complement is snapshotted from the resulting full-vector
        //     DOM and rasterized asynchronously; when the raster is
        //     ready, the frozen segments are vaulted and the image is
        //     swapped in (blitSwapFromDOM).
        //   CONTINUE: subsequent scoped paints with the SAME frozen
        //     set keep the image in place; the frozen segments are
        //     captured (found in the vault, already assembled) but
        //     NOT built and NOT spliced into the visible flow; at the
        //     end of the paint the vault is rebuilt from the captures.
        //   END (the ending paint is an ordinary segment/full paint):
        //     any non-scoped paint; a scoped paint whose frozen set
        //     differs from the session's; or 20 s with no further paint
        //     (a timer armed by each blit paint forces an ordinary
        //     full repaint via Mr()). A stale async raster completion
        //     never swaps into an ended session (token/sequence guard
        //     in blitRasterize / blitRasterDone).
        // F6: blitSigActive is the stable completion signal the
        // shell's rebuild gate reads through
        // deknotter.blitSessionActive(). It mirrors the gate's old
        // last-blit-session-entry log verdict exactly (a boolean —
        // NOT a depth counter: a superseded session's held "end" is
        // dropped, never pushed, so ends do not pair with starts),
        // maintained at every site that pushes, removes, or clears
        // such an entry: blitStartSession (start), blitEndSession
        // (end), the settle guard's flushEnd (the held end, when it
        // LANDS — never while merely held) and restore stand-down
        // (start removed by splice), and deknotter.begin's log
        // clear.
        let blitSess = null, blitTokenSeq = 0, blitSigActive = !1;
        const BLIT_NS = "http://www.w3.org/2000/svg", BLIT_XLINK = "http://www.w3.org/1999/xlink";
        function blitSameFrozen(a, b) {
            if (!a || !b || a.size !== b.size) return !1;
            for (const n of a) if (!b.has(n)) return !1;
            return !0;
        }
        // On-screen scale: screen px per world unit, from the live
        // SVG's bounding rect and the camera state (th.scale) — the
        // world rect is 3200 units on a side and the viewBox fit is
        // min(rect) / 3200, scaled by the camera.
        function blitScaleNow() {
            try {
                const r = Cn.getBoundingClientRect(), s = Math.min(r.width, r.height) / 3200 * (th && Number(th.scale) || 1);
                return Number.isFinite(s) && s > 0 ? Math.max(1, Math.min(4, s)) : 1;
            } catch (_) {
                return 1;
            }
        }
        function blitArmTimer(sess) {
            // Settle replacement v1: in repulsion mode the deferred
            // 20-second settle timer is deleted — no timer is armed,
            // and the blit session ends on non-scoped paints instead
            // (the paint-top gate). Every other mode keeps the timer
            // exactly as shipped, so the rollback value restores
            // today's behaviour with no code change.
            if ("repulsion" === sxSolverModeQuiet()) {
                sess.timer && clearTimeout(sess.timer), sess.timer = null;
                // AUTOFIT SESSION-ENDING EXIT (ruled 2026-11-01,
                // Jason): a session started (or continued) by an
                // Autofit scoped apply carries autofitExit (marked
                // in blitPaintEnd from the paint's opClass) and gets
                // its own exit here, on a zero timer so it fires as
                // soon as the Autofit paint has completed: the
                // session ends through blitAutofitExit instead of
                // waiting for a later, unrelated paint (the hang:
                // in Repulsion no timer was armed at all, so the
                // vault/raster, the overlay gate, the settle watch
                // and the Autofit job all waited on a paint only a
                // profile open/close — or some other non-scoped
                // repaint — ever supplied). Sessions of every other
                // scoped apply are untouched: no exit is scheduled,
                // exactly as shipped.
                if (sess.autofitExit && !sess.exitTimer) sess.exitTimer = setTimeout(() => {
                    sess.exitTimer = null, blitAutofitExit(sess);
                }, 0);
                return;
            }
            sess.timer && clearTimeout(sess.timer), sess.timer = setTimeout(() => {
                if (blitSess !== sess) return;
                // Mode-toggle hardening: a timer armed under Settle
                // must not run its guard settle after a flip to
                // Repulsion - bail at fire time on the live mode.
                // The session itself still ends via the paint-top
                // gate, exactly as sessions do in Repulsion.
                if ("repulsion" === sxSolverModeQuiet()) return;
                // Settle guard (see sgRunSettleGuard below): the
                // expiry now runs the settle under the guard's
                // improve-or-hold gate instead of ending the session
                // blind. Re-entrancy is fail-open — if a guard run
                // is already in flight, this settle takes the exact
                // legacy path rather than queue behind it, so a
                // settle is never lost or delayed indefinitely.
                if (sgInFlight) {
                    blitEndSession();
                    try {
                        Mr({
                            animate: !1,
                            forceRepaint: !0
                        });
                    } catch (_) {
                        __sxErrLog("layout-blit-timer", _);
                    }
                    return;
                }
                sgInFlight = !0, sgRunSettleGuard(sess, dkLog.length).then(() => {
                    sgInFlight = !1;
                }, e => {
                    sgInFlight = !1;
                    try {
                        __sxErrLog("layout-settle-guard", e);
                    } catch (_) {}
                });
            }, 2e4);
        }
        // The Autofit session-ending exit itself (see blitArmTimer's
        // Repulsion branch): run the session's settle NOW, through
        // the same guarded settle the rest-timer runs in every other
        // mode — pre-capture, teardown, the non-scoped full repaint
        // (Mr forceRepaint: the same repaint a profile load lands,
        // whose paint-top gate is what used to end these sessions
        // by accident), post-measure, and restore — so the deferred
        // "end" entry lands and the shell's gate, settle watch and
        // Autofit re-check all observe the landing together. Any
        // guard failure funnels into sgRunSettleGuard's own
        // fail-open legacy settle (blitEndSession + the same full
        // repaint), so the session always ends. Fail-open here too,
        // mirroring the timer's re-entrancy rule: a guard run
        // already in flight means this exit takes the legacy path
        // rather than queue behind it. A mode flip away from
        // Repulsion since the arm hands the session back to
        // blitArmTimer, which arms the ordinary rest-timer.
        function blitAutofitExit(sess) {
            if (blitSess !== sess) return;
            if ("repulsion" !== sxSolverModeQuiet()) return void blitArmTimer(sess);
            if (sgInFlight) {
                blitEndSession();
                try {
                    Mr({
                        animate: !1,
                        forceRepaint: !0
                    });
                } catch (_) {
                    __sxErrLog("layout-blit-autofit-exit", _);
                }
                return;
            }
            sgInFlight = !0, sgRunSettleGuard(sess, dkLog.length).then(() => {
                sgInFlight = !1;
            }, e => {
                sgInFlight = !1;
                try {
                    __sxErrLog("layout-settle-guard", e);
                } catch (_) {}
            });
        }
        function blitStripArtifacts() {
            try {
                In.querySelectorAll(":scope > .sx-blit-vault, :scope > .sx-blit-raster").forEach(el => el.remove());
            } catch (_) {}
        }
        function blitEndSession() {
            const sess = blitSess;
            if (!sess) return;
            blitSess = null, sess.timer && clearTimeout(sess.timer), sess.exitTimer && clearTimeout(sess.exitTimer), sess.exitTimer = null, sess.rasterUrl && URL.revokeObjectURL(sess.rasterUrl), 
            blitStripArtifacts(), dkLog.push({
                type: "blit-session",
                event: "end",
                frozen: sess.frozenCount
            }), blitSigActive = !1;
        }
        // Settle guard (owner's ruling, Soul Review #18 pick A,
        // 2026-10-22): the DeKnotter's improve-or-hold gate lifted
        // onto the deferred settle. The blit rest-timer used to end
        // its session and force a full repaint blind — the repaint
        // re-solves every cloud and could hand back overlap the
        // DeKnotter had just won (the surrender case: one cascade's
        // cloud went 113,597.96 -> 366,946.33 when its settle
        // landed, and the map total went 227,195.92 -> 1,425,792.45).
        // The guard makes every settle overlap-non-increasing, per
        // cloud, by construction: it captures the delivered centers
        // and the per-cloud xAreaCross BEFORE the settle repaint,
        // repaints, measures again, and re-seats any cloud the
        // repaint regressed at its pre-settle delivered centers via
        // the scoped-paint centers mechanism (the T2 freeze
        // machinery with every branch frozen and none recomputed).
        // Restore paints replay regressed clouds from the pre-settle
        // captured solve, never the repaint's own solved state.
        // Pre-settle centers are captured from the RENDERED
        // geometry, not dataset values: for vault-resident branches
        // the data-layout-x/y attributes hold rest-era values
        // throughout a blit session while the rendered icons sit
        // displaced, so a dataset capture restores the very
        // surrender the guard exists to prevent. The capture reads
        // each icon through its OWN SVG geometry chain — local
        // center composed with the element's own getCTM(), which
        // composes every ancestor transform including the vault's —
        // never a screen rect divided by the layer's CTM: a
        // vault-resident element's rect carries positioning the
        // layer's CTM does not account for, and seating clouds from
        // those rects painted eleven previously-clear clouds at
        // garbage positions (post-settle total 3,929,558,661
        // against the unguarded settle's 1,425,792). The conversion
        // is cross-checked at runtime against the dataset centers
        // of every non-vault element (known-fresh): a deviation
        // over 1.0 world units distrusts the conversion globally
        // and the capture falls back to the dataset read, recorded
        // as captureSource in the guard's log entry ("rendered" on
        // the success path, "dataset-fallback" otherwise).
        // Improve-or-hold applies to the guard too: it may fail
        // its per-cloud objective, but it may not leave the map
        // worse than the settle it replaced. If restore rounds ran
        // and the final total nevertheless exceeds the post-repaint
        // total, the restore is discarded for one plain legacy
        // settle repaint and the log entry is marked bailed.
        // The blit-session "end" entry is deferred until the guard
        // has completely finished — post-measure plus any restore —
        // so the shell's settle-landed detection and the DeKnotter
        // receipt read post-guard geometry, never mid-guard
        // geometry. Fail-open throughout: any guard failure falls
        // back to the exact legacy settle and logs through
        // __sxErrLog("layout-settle-guard", e); the settle is never
        // lost, delayed indefinitely, or left dangling.
        let sgInFlight = !1, sgHoldBlitStart = !1, sgCaptureSource = "rendered";
        // Every branch name the guard freezes and measures: the same
        // universe applyScoped scopes over, taken from the last
        // solve's branch list (dkLastBranches) unioned with the qn
        // registry the last paint built.
        function sgAllBranchNames() {
            const names = new Set;
            (dkLastBranches || []).forEach(sec => {
                const n = sec && sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
                n && names.add(n);
            });
            for (const k in qn) {
                const info = qn[k];
                info && info.branch && names.add(info.branch);
            }
            return names;
        }
        // The crossingnumber clouds walk (Q4: the same walk
        // measureCloud awaits — the guard now watches the crossing
        // number, not the xAreaCross area), keeping EVERY branch's
        // value instead of one: missing or non-finite values read
        // as 0, exactly as measureCloud treats them. Rejects when
        // the walk is unavailable — the caller treats that as
        // fail-open.
        // SOLVER-METRICS REFACTOR (F1): ONE layout-score readout helper.
        // The settle guard's whole-map scorer (sgMeasureClouds below),
        // the driver API's whole-map scorer (deknotter.measureCloudsAll)
        // and its single-branch scorer (deknotter.measureCloud) were
        // three word-for-word copies of this walk — same done-guard,
        // same "missing or non-finite value reads as zero" loop —
        // differing only in the error string. They now delegate here,
        // parameterized by branch-or-all: branch === null resolves the
        // whole-map {name: value} object; a branch name resolves that
        // branch's value alone. The single backend is the shell
        // registry's crossingnumber clouds walk, whose implementation
        // is the native solved-geometry readout (sxCrossingMeasure,
        // exposed as window.__sxCrossingMeasure; its per-cloud
        // attribution comments stay with that code — F10). errLabel
        // keeps each caller's historical error string verbatim.
        function sxCrossingCloudsReadout(branch, errLabel) {
            return new Promise((resolve, reject) => {
                try {
                    const defs = window.LayoutMetrics && window.LayoutMetrics.defs, def = defs && defs.crossingnumber;
                    if (!def || "function" != typeof def.clouds) return void reject(new Error(errLabel));
                    let done = !1;
                    def.clouds({
                        svg: document.getElementById("mapSvg")
                    }, clouds => {
                        if (done) return;
                        done = !0;
                        if (null === branch) {
                            const out = {};
                            if (clouds) for (const k of Object.keys(clouds)) {
                                const v = clouds[k] ? Number(clouds[k].value) : NaN;
                                out[k] = Number.isFinite(v) ? v : 0;
                            }
                            resolve(out);
                        } else {
                            const entry = clouds ? clouds[branch] : null, value = entry ? Number(entry.value) : NaN;
                            resolve(Number.isFinite(value) ? value : 0);
                        }
                    }, () => !1);
                } catch (e) {
                    reject(e);
                }
            });
        }
        function sgMeasureClouds() {
            return sxCrossingCloudsReadout(null, "settle guard: LayoutMetrics.defs.crossingnumber.clouds is unavailable");
        }
        // Clouds the settle made worse: post above pre by more than
        // the 0.01 tolerance, over the union of both key sets. Q4:
        // the tolerance is the same number, now in dimensionless
        // crossing-number units — any genuine crossing increase
        // flags; sub-0.01 float noise does not.
        function sgRegressed(pre, post) {
            const keys = new Set([ ...Object.keys(pre), ...Object.keys(post) ]), out = [];
            return keys.forEach(k => {
                const a = null != pre[k] ? pre[k] : 0, b = null != post[k] ? post[k] : 0;
                b > a + SX_SCORE.REGRESSION_TOL && out.push(k);
            }), out;
        }
        // A measure's map total: the sum of its per-cloud values.
        function sgCloudTotal(values) {
            let t = 0;
            for (const k in values) t += Number(values[k]) || 0;
            return t;
        }
        // The guard's pre-settle centers, read from the RENDERED
        // geometry: every [data-layout-key] element present under
        // the map layer — live-zone keys as live elements, frozen
        // keys as the vault's rendered elements, each seen exactly
        // once — contributes its icon's rendered center, converted
        // through the icon's OWN SVG geometry chain: the icon's
        // local center (its data-diameter midpoint — the disc the
        // paint centers on the node — with the getBBox centre as
        // the equivalent when no diameter is recorded) composed
        // with the element's own getCTM(), which composes every
        // ancestor SVG transform, the vault's included, and then
        // with the inverse of the layer's own getCTM(), landing in
        // the map's world frame (the frame dataset.layoutX/layoutY
        // and scCtx.centers values live in). A screen rect divided
        // by the layer's screen CTM is NOT used for any element:
        // for vault-resident elements the rect carries the vault's
        // own positioning, which that conversion does not account
        // for, so rect-derived centers seated vault clouds at
        // garbage positions. Branch membership filters through the
        // qn registry exactly as scCaptureDeliveredCenters filters;
        // the resulting Map has the identical shape (key -> {x, y}).
        // Dataset values are read only as the check and the
        // fallback: they are stale for vault-resident branches
        // during a blit session (see the header note).
        // Validation: the dataset center of every element NOT
        // inside .sx-blit-vault is known-fresh, so a converted
        // center deviating from it by more than 1.0 world units
        // distrusts the conversion GLOBALLY — the rendered capture
        // is abandoned for the dataset capture
        // (scCaptureDeliveredCenters over all branches) and
        // sgCaptureSource records "dataset-fallback" for the
        // guard's log entry ("rendered" on the success path). Per
        // key, an element whose conversion throws or yields a
        // non-finite or geometry-less result falls back to that
        // key's dataset value; a key missing from both sources
        // stays absent. Fail-open: when the layer CTM is
        // unavailable, or the read throws, the capture falls back
        // to the dataset read.
        function sgCaptureRenderedCenters(frozen) {
            sgCaptureSource = "rendered";
            try {
                const layerCTM = In.getCTM(), inv = layerCTM && layerCTM.inverse();
                if (!inv) return sgCaptureSource = "dataset-fallback", scCaptureDeliveredCenters(frozen);
                const centers = new Map;
                let distrusted = !1;
                return In.querySelectorAll("[data-layout-key]").forEach(el => {
                    const key = el.dataset.layoutKey, info = qn[key];
                    if (!info || !info.branch || !frozen.has(info.branch)) return;
                    const dx = Number(el.dataset.layoutX), dy = Number(el.dataset.layoutY), hasData = Number.isFinite(dx) && Number.isFinite(dy);
                    let p = null;
                    try {
                        const icon = el.querySelector(":scope > .branch-icon, :scope > .topic-icon");
                        if (!icon) throw new Error("settle guard: rendered capture found no icon for a delivered key");
                        const dia = Number(icon.dataset.diameter), bb = icon.getBBox();
                        if (!bb || !(bb.width > 0) || !(bb.height > 0)) throw new Error("settle guard: rendered capture found no icon geometry");
                        const lc = dia > 0 ? {
                            x: dia / 2,
                            y: dia / 2
                        } : {
                            x: bb.x + bb.width / 2,
                            y: bb.y + bb.height / 2
                        }, ctm = icon.getCTM();
                        if (!ctm) throw new Error("settle guard: rendered capture found no icon CTM");
                        p = new DOMPoint(lc.x, lc.y).matrixTransform(ctm).matrixTransform(inv), 
                        p && Number.isFinite(p.x) && Number.isFinite(p.y) || (p = null);
                    } catch (e) {
                        p = null;
                    }
                    if (p) centers.set(key, {
                        x: p.x,
                        y: p.y
                    }), hasData && !el.closest(".sx-blit-vault") && Math.hypot(p.x - dx, p.y - dy) > 1 && (distrusted = !0); else if (hasData) centers.set(key, {
                        x: dx,
                        y: dy
                    });
                }), distrusted ? (sgCaptureSource = "dataset-fallback", scCaptureDeliveredCenters(frozen)) : centers;
            } catch (e) {
                return __sxErrLog("layout-settle-guard", e), sgCaptureSource = "dataset-fallback", scCaptureDeliveredCenters(frozen);
            }
        }
        // The selective restore centers: the current delivered
        // centers, with every key belonging to a regressed branch
        // (branch membership via the qn registry) replaced by its
        // pre-settle delivered center. Keys missing from the
        // pre-settle capture keep their current value.
        function sgSelectiveCenters(preCenters, postCenters, regressedSet) {
            const centers = new Map(postCenters);
            return postCenters.forEach((v, key) => {
                const info = qn[key];
                info && info.branch && regressedSet.has(info.branch) && preCenters.has(key) && centers.set(key, preCenters.get(key));
            }), centers;
        }
        // The selective restore capture: a per-branch merge of
        // the pre-settle capture (preCapture) and a fresh capture
        // of the current (post-repaint) solved state. A regressed
        // branch's entries — in BOTH the branches map and the
        // baseStates map — come from preCapture, so its freeze
        // replay restores the pre-settle solve; every other
        // branch's entries come from the fresh capture, exactly as
        // a restore-time capture behaved before. (BaseStates keys
        // carry their branch name in the second "|"-separated
        // segment, the same keying scCaptureFrozen applies.)
        function sgMergedCapture(preCapture, regressedSet, allNames) {
            const fresh = scCaptureFrozen(allNames), merged = {
                branches: new Map,
                baseStates: new Map
            };
            return fresh.branches.forEach((v, k) => {
                regressedSet.has(k) || merged.branches.set(k, v);
            }), preCapture.branches.forEach((v, k) => {
                regressedSet.has(k) && merged.branches.set(k, v);
            }), fresh.baseStates.forEach((v, k) => {
                const seg = String(k).split("|"), bname = seg.length > 1 ? seg[1] : null;
                bname && !regressedSet.has(bname) && merged.baseStates.set(k, v);
            }), preCapture.baseStates.forEach((v, k) => {
                const seg = String(k).split("|"), bname = seg.length > 1 ? seg[1] : null;
                bname && regressedSet.has(bname) && merged.baseStates.set(k, v);
            }), merged;
        }
        // One restore paint: a scoped paint context with the same
        // shape applyScoped builds — nothing targeted, nothing in
        // the ring, nothing recomputed, every branch frozen — whose
        // centers map seats each frozen topic/child node exactly
        // (the T2 guard in Ar) while the freeze replay restores the
        // solved tree held in the caller-supplied capture. The
        // paint must leave NO blit session behind and arm NO timer:
        // blitPaintEnd's session start is held off for the paint,
        // and any session that nevertheless stands afterwards is
        // torn down synchronously, its "start" entry removed, so
        // the log never gains a session that outlives the guard run.
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
                Mr({
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
                // entry — exactly the verdict the gate's log scan
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
                // has started since this guard run began — a live
                // session's own end closes the log instead.
                if (!pendingEnd || newerStartSeen()) return;
                const en = pendingEnd;
                pendingEnd = null, dkLog.push(en), blitSigActive = !1;
            };
            try {
                // 1. Pre-capture, the blit session still active:
                // capture every branch's centers FIRST, while the
                // vault still stands — the rendered read
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
                    // pre-measure ran — its own end entry already
                    // closed it. Stand down without touching the
                    // replacement session, and never restore.
                    aborted = !0, post = final = await sgMeasureClouds().catch(() => pre);
                } else {
                    // 2. Settle repaint: tear the session down
                    // exactly as blitEndSession does, but hold the
                    // "end" entry as pendingEnd instead of pushing
                    // it — it lands in step 5, after the guard has
                    // completely finished.
                    pendingEnd = {
                        type: "blit-session",
                        event: "end",
                        frozen: sess.frozenCount
                    }, blitSess = null, sess.timer && clearTimeout(sess.timer), sess.rasterUrl && URL.revokeObjectURL(sess.rasterUrl), 
                    blitStripArtifacts();
                    try {
                        Mr({
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
                    // other node at its current center), then — if a
                    // cloud is still above its pre-settle value —
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
                    // guard too — it may fail its per-cloud
                    // objective, but it may not leave the map worse
                    // than the settle it replaced. If restore rounds
                    // ran and the final total nevertheless exceeds
                    // the post-repaint total, discard the restore:
                    // run ONE plain legacy settle repaint (no
                    // scoped context — the session is already torn
                    // down), re-measure, and keep the re-measured
                    // values as final. The log entry is marked
                    // bailed; regressed/rounds/pre/post still
                    // describe the original regression and attempts.
                    if (!aborted && rounds > 0 && sgCloudTotal(final) > sgCloudTotal(post)) {
                        bailed = !0;
                        try {
                            Mr({
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
                // the post-measure instead of before the repaint —
                // the settle has not landed until it has been
                // checked.
                // Q4: every watched cloud's crossing numbers ride
                // on the entry as a per-cloud report (pre / post /
                // final). They are reported for visibility; the
                // guard's decisions remain exactly the per-cloud
                // epsilon test in sgRegressed over the same maps —
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
                // repaint already landed — just land the held end
                // entry so the settle is never lost.
                if (!pendingEnd && blitSess === sess) try {
                    blitEndSession();
                    try {
                        Mr({
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
        // ends the session before the paint runs — the paint is then
        // an ordinary segment/full paint and its clear removes the
        // artifacts. Boundary-log entries are not an end condition:
        // under a contained scope they are suppressed coupling
        // candidates that do not change frozen geometry.
        function blitPaintGate() {
            if (!blitSess) return;
            if (!scCtx || !blitSameFrozen(scCtx.frozenBranches, blitSess.frozen)) blitEndSession();
        }
        // Snapshot: clone the layer element and remove everything
        // belonging to the live zone — groups whose keys are live;
        // label-stack items containing a label whose data-id is
        // live; control-stack items containing controls whose
        // data-id is live; spoke-underlay items whose data-spoke-for
        // is live; overlay children whose data-id is live — plus the
        // relations layers and the center content (both stay live in
        // the real DOM). Live keys = every group key whose branch
        // (per the qn registry the just-finished paint built) is NOT
        // in the session's frozen set. What remains is the frozen
        // complement with a genuine hole where the live zone was.
        function blitSnapshot(sess) {
            const clone = In.cloneNode(!0), live = new Set;
            clone.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => {
                const info = qn[el.dataset.layoutKey];
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
                const info = qn[k];
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
        // in-group-first-then-stacks semantics as P1's capture — a
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
        // group, as plain data — icon box (center = the group's
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
        // positions — before each live group, every frozen record
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
                // no rest-timer) behind — session starts are held
                // off for the duration of the guard's paints.
                if (sgHoldBlitStart) return;
                // First scoped paint of a burst — it ran as a normal
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
        // Camera settle hook, run at the END of kh() — after any
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
        // through deknotter.baseState(). Keyed by stable identity —
        // never by wrapper object — because wrappers are rebuilt on
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
        // Validate one phase patch: for every length override at the
        // branch, subcategory, and kink levels compute ratio = stored /
        // bakedBase and collect the per-level ratios plus every failure.
        function dkValidatePhasePatch(patch, cap) {
            const ratios = { branch: {}, subcat: {}, kink: {} }, failures = [];
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
            }
            return { ratios: ratios, failures: failures };
        }
        // DeKnotter snapshot helpers (E2): API.get() returns container
        // copies whose per-entry objects are the SAME references as live
        // state, so a gate snapshot needs a true deep clone. Override and
        // angle maps are cloned per entry (one level per entry suffices —
        // entry fields are primitives); the two spoke auto-shrink arm maps hold
        // booleans, so a container copy is a true copy; scalars go by
        // value. The clone shares no object references with its source,
        // in either direction.
        const dkEntryMaps = { branchOverrides: 1, subcatOverrides: 1, kinkOverrides: 1, subcatAngleOffsets: 1, kinkAngleOffsets: 1 };
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
        // snapshot — a deep clone of the dials object (layout state
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
