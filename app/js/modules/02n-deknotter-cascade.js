        async function dkRunCascade(branchName, opts) {
            resetWitnessState();
            const api = window.__SEXCAPADES_LAYOUT_API, dk = api.deknotter, name = null == branchName ? "" : String(branchName), tax = dkBranchTaxonomy(name);
            // F4 STEP 1a - label check (see the §5.11 note inside).
            const duplicates = stepLabelCheck();
            const report = {
                branch: name,
                labelCheck: { unique: !duplicates.length, duplicates: duplicates },
                preconditionsStaged: [],
                coverage: { actedOn: 0, totalInBranch: tax ? tax.total : 0 },
                baseline: { first: null, second: null, variance: null },
                phases: [],
                onset: { baseline: null, holds: [] },
                // FINE-TUNE (ruled 2026-10-29): skip-throw run record
                // - null-filled on a normal (throw) run; on a skip
                // run it carries the decision baseline, the arm
                // phase, the fine-tune holds, and the branch floor.
                fineTune: null,
                // STAGED SCORING (ruled 2026-11-02, Jason): this run's
                // scoring-stage record - the stage in force at run
                // start, the run-level switch point, the adjacent-
                // composition baseline captured on the pre-run
                // geometry for the final gate, and the phase the
                // switch landed in. Fields added only.
                stagedScoring: { stageAtStart: "same-branch-only", switchPoint: "branch-shrink-entry", adjacentFromPhase: null, baselineAdjacent: null },
                growth: null,
                // SUBCAT SHRINK ATTEMPTS (repair, 2026-11-01): one
                // record per rendered subcategory of this branch -
                // thrown radius, 3x length floor, stages run,
                // and the outcome (reached / held and why) - so a
                // run's receipt can prove every subcategory was
                // attempted and name any that was held.
                subcatShrink: [],
                // WITNESS DISCRIMINATOR (ruled 2026-11-01, Jason;
                // scope ruling 04:29 CST): per-subcategory delivered
                // radii captured frame by frame across every
                // back-out / restore of this run, judged ONLY
                // against the eyewitness hypothesis - a back-out
                // discarding per-subcategory shrink gains wholesale
                // (report.witness; helpers below). Fields added
                // only; no H1/H2/H3 fields are recorded.
                witness: { hypothesis: "wholesale-backout-discard", frames: [], events: [], verdict: "not-run", culprit: null, finalStep: null },
                // THROW RADII (conversion fix, 2026-11-01): the
                // throw's center-avatar radius, its world targets,
                // and the override lengths stepThrow converted
                // them into - recorded by stepThrow, null on a
                // skip-throw run. Fields added only.
                throwRadii: null,
                // Q4: the gate's decider is the branch's own-cloud
                // crossing number - baseline/finalCloud/delta below
                // (and every phase record's cloud) carry CROSSING
                // values under their existing names. Neighbor clouds'
                // crossing numbers are reported (baseline + final)
                // under neighbors, flagged reportedNotGated: no
                // neighbor value ever passes or fails this run.
                // The xAreaCross area used to be reported alongside,
                // explicitly secondary, in baseline.areaSecondary /
                // finalAreaSecondary / deltaAreaSecondary; those fields
                // and their measurements were removed with the area
                // observation (2026-10-29, M1) and the commented-out
                // copies were deleted (2026-10-30, paragraph-6
                // solver-metrics edit) so they cannot drift from the
                // live code - see the single record at measureCloud
                // below. In their place the report carries bakeGate
                // (M4): the total crossing number (this cloud plus
                // every neighbor cloud, combined) before -> after,
                // passing only when its increase is strictly less
                // than SX_SCORE.BAKE_GATE_LIMIT - reported for the
                // bake decision; this run's own gates are unchanged.
                metric: { decider: "crossingnumber" },
                neighbors: { reportedNotGated: !0, baseline: null, final: null },
                finalCloud: null,
                delta: null,
                bakeGate: null,
                plateau: null,
                gate: "reverted",
                reason: null
            };
            // BAKE GATE (M4, ruled 2026-10-29): the ONE computation of
            // the bake decision, called at both run endings (the
            // category back-out ending and the final patch) - the
            // limit and the comparison were previously written out
            // twice, once per ending. It sums the total crossing
            // number - this cloud plus every neighbor cloud,
            // combined - before and after, and passes only when the
            // increase is strictly less than
            // SX_SCORE.BAKE_GATE_LIMIT. Reported for the bake
            // decision; it does not gate this run. A failure to
            // compute leaves bakeGate null, exactly as the two
            // inline copies did.
            if (duplicates.length) report.labelCheck.note = "subcategory labels are keyed by bare label: arming a duplicated label arms it in every branch that bears it";
            if (!tax) {
                return report.reason = "unknown branch: " + (name || "(none)"), dkLog.push({ type: "run-report", report: report }), report;
            }
            // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31, Jason):
            // a live blit session at run start is ended BEFORE the
            // context opens, with one ordinary full paint - the
            // session's documented end ("any non-scoped paint") -
            // so its 20 s settle-guard timer can never fire
            // mid-run and fight the cascade's interim solves (the
            // guard's restore paints would replay a pre-session
            // capture over the run's delivered registry). With no
            // session active, nothing extra is painted.
            if (blitSess) {
                try {
                    sxRequestMapPaint({
                        animate: !1,
                        forceRepaint: !0
                    });
                } catch (e) { __sxErrLog("layout-anneal-prerun-paint", e); }
            }
            if (!dk.begin({ branch: name, cap: 200, control: { onHeartbeat: opts && "function" == typeof opts.onHeartbeat ? opts.onHeartbeat : null, shouldCancel: opts && "function" == typeof opts.shouldCancel ? opts.shouldCancel : null } })) {
                return report.reason = "a DeKnotter context is already active", dkLog.push({ type: "run-report", report: report }), report;
            }
            snapshot = null;
            // Q2: the run's total fit-deviation count across every
            // phase record so far, for the report (and through it
            // the receipt lead).
            // WITNESS DISCRIMINATOR helpers (ruled 2026-11-01,
            // Jason; scope ruling 04:29 CST): this run investigates
            // ONLY the eyewitness report - the cloud scooches in
            // shortened, hits the collision mark, backs back out,
            // and then ALL subcategories stand back at extreme
            // (thrown) length instead of keeping the shortened
            // lengths of a frame before, as if a back-out threw out
            // every subcategory's shrink gains at once instead of
            // backing out one subcategory one step at a time. The
            // H1/H2/H3 options from diagnosis da3faf43
            // (floor-above-thrown, solve/paint re-expansion,
            // one-at-a-time back-out) are NOT investigated here and
            // no fields are recorded for them. Observational only:
            // frames are read from the delivered-radii readout the
            // phase records already use; nothing here writes layout
            // state, fit state, or any gate input, so the solve,
            // gates, receipts and scoped freeze are unchanged. One
            // frame per kept phase plus one after every restore
            // (per-phase gate back-up, onset back-up,
            // category-back-out disarm, final patch, whole-run
            // revert): a correct one-step back-out restores exactly
            // the last kept frame, so any subcategory a restore
            // moves - above all one it returns to its thrown
            // delivered radius when that subcategory was not the
            // tripping one - is the wholesale discard the witness
            // describes, and witnessJudge names it per event.
            const WITNESS_EPS = .02, WITNESS_ONE_STEP = 1.115;
            witnessLastFrame = null; witnessFrameSeq = 0; witnessThrown = null; witnessTrippingLabel = null;
            // FINAL-STEP WITNESS EXTENSION (ruled 2026-11-01,
            // Jason; refinement 07:30 CST): the eyewitness report
            // refined - the run pulls in almost perfectly until
            // the LAST step, and the last step flings the
            // subcategories back out. The back-out judge above
            // never sees that step: its last frame is the final
            // patch commit and its verdict is computed before the
            // closing full paint. This extension captures one
            // frame further, only around the final step: the
            // last kept phase, immediately before and after the
            // final patch commit, and one frame after the
            // closing full paint (in the finally block, once that
            // paint - settle search included - has run), and
            // judges each of those two transitions on its own:
            // a subcategory that grows past one ladder step
            // (WITNESS_ONE_STEP) across either transition was
            // flung, not stepped; two or more at once, or any
            // one returned to its thrown length, is the
            // wholesale fling the witness describes, and the
            // record names the transition - final patch commit
            // or closing full paint - that did it. Frames are
            // held by direct reference on report.witness
            // .finalStep, so the 600-frame cap on the frames
            // array can never drop them. Observational only,
            // exactly like the judge above: nothing here writes
            // layout state, fit state, or any gate input.
            witnessFinalLastKept = null; witnessFinalBefore = null; witnessFinalAfter = null; witnessFinalOperation = null; witnessFinalTripped = !1;
            // FINAL-STEP WITNESS judge (extension above): one
            // transition of the final step, before-frame against
            // after-frame. There is no tripping subcategory at
            // the final step - nothing there is entitled to move
            // a subcategory outward past one step - so any
            // subcategory that does is recorded as flung, with
            // its before / after delivered radii, the override
            // lengths standing at both frames, and whether it
            // landed back at its thrown delivered radius.
            // PAINTED-GEOMETRY WITNESS EXTENSION (ruled 2026-11-01,
            // Jason, 08:00 CST - painted-geometry witness extension):
            // the final-step witness above reads dkDeliveredRadii -
            // solve/override BOOKKEEPING. Jason's eyewitness report
            // on the Impact run (receipt: final-step witness HELD)
            // is that the subcategories were nevertheless flung back
            // out on the last frame he SAW. Taken at his word, the
            // fling either happens after the frame the bookkeeping
            // witness measures, or the last paint renders
            // differently from the radii it measures - a MEASUREMENT
            // DIVERGENCE the bookkeeping witness cannot see by
            // construction. This extension extends the witness one
            // visual frame further, in the painted domain: it reads
            // the ACTUAL PAINTED SVG GEOMETRY (node positions via
            // each icon's own getCTM chain - the same rendered read
            // the settle guard's sgCaptureRenderedCenters uses -
            // with the painted stem path's endpoints as the only
            // fallback when the CTM read fails; data-layout-x/y is
            // never substituted, and a node neither painted source
            // can read is recorded not-observed), and records, for
            // EVERY subcategory of the run's branch (all 7 on
            // Impact, pain & body modification; generic over any
            // branch - Bondage and Sex acts run through this same
            // code), THREE separate numbers per subcategory:
            //   branchR - centre to branch node (branch delivered
            //             radius, painted);
            //   seg     - branch node to subcategory node
            //             (subcategory segment length, painted);
            //   absR    - centre to subcategory node (absolute
            //             delivered radius, painted).
            // Frames are taken at the last kept phase, immediately
            // before and after the final step, after the closing
            // full paint, and after the next animation frame /
            // settle (the extended frame, awaited in the finally
            // block). The pair of painted captures spanning the
            // closing paint (after-final-step -> after-closing-
            // paint, plus after-settle) is the capture pair the
            // receipt names. Each painted transition is judged on
            // its own and NAMES the exact operation that moved any
            // of the three numbers past one ladder step. FIX for
            // the divergence branch of the ruling: the witness now
            // reads painted geometry, so a post-paint repaint /
            // settle that re-derives painted positions can no
            // longer hide behind bookkeeping that held. No shrink
            // step size, throw factor, floor, or stop rule is
            // touched by this extension; it is observational plus
            // the measurement fix, exactly as ruled.
            witnessPaintedBefore = null; witnessPaintedAfter = null; witnessPaintedLastKept = null; let witnessPaintedAfterPaint = null, witnessPaintedAfterSettle = null;
            // One painted transition judged on its own: any of the
            // three numbers (branchR / seg / absR) growing past one
            // ladder step names the subcategory and the metric; two
            // or more subcategories flung on seg or absR, or any one
            // returned to its thrown segment, is the wholesale
            // fling. The record carries the transition's operation
            // string verbatim, so the receipt names the exact
            // operation that moved the numbers.
                // ACCEPT-PATH STEP-THROUGH DIAGNOSTICS (ruled 2026-11-01,
                // Jason): read-only pauses at three checkpoints on the
                // back-out gate Accept path only - ANNEAL-DIAG-01 after
                // Accept, before restoreKept; ANNEAL-DIAG-02 after
                // restoreKept lands, before the closing full paint;
                // ANNEAL-DIAG-03 after the closing full paint lands,
                // before settle / run end (in the finally block below).
                // Active only when the shell supplies opts.onDiagPause
                // (session-only toggle; absent = no pauses, no cards, no
                // logs, exactly today's behavior). These helpers only
                // READ state - stored delivered radii, painted geometry,
                // and the live SVG view - and never write a length, a
                // delivered radius, a viewBox, or a crossing value.
                diagAcceptCtx = null;
                // Capture-time per-item fields from the closing
                // paint's centre capture (paintComposition branch of
                // scCaptureDeliveredCenters), stashed by the finally
                // block at the capture moment so DIAG-03 can report
                // the registry fields the capture consumed - the
                // closing solve reassigns dkLastBranches, so reading
                // them at pause time would give closing-time values.
                let diagCaptureFields = null;
                // HUB LOGGING (diagnostic-only, ruled 2026-11-01, per
                // HUB-SIDE-DIAGNOSIS.md): the painted hub seat read at
                // DIAG-02 - the last pause before the closing full
                // paint - stashed so DIAG-03 can print the pre-paint
                // hub seat beside the painted hub it ends with, and
                // the hub's movement across the closing paint is
                // attributable. Read-only.
                diagPrePaintHub = null;
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01,
                // Jason): the closing-paint traces the code-locate
                // assessor named as the deciding evidence between the
                // two closing-paint paths - the closing-paint mode,
                // the closing paint's scoped-paint counts, whether
                // its segment-timing entry exists, and the camera
                // state. Read-only: these helpers only READ the live
                // camera variables / the painted viewport transform,
                // and the traces themselves are read off values the
                // run already computed (the finally block's
                // closingPaintMode and the dkLog entries the closing
                // paint itself pushed). Nothing here paints, captures
                // a freeze or a segment, fits, or writes state.
                // HUB-GROUP ELEMENT IDENTITY (diagnostic-only, ruled
                // 2026-11-01, per CLOSING-PAINT-BLOWUP-ASSESSOR-REPORT
                // Q5): which element the hub-group query matches at a
                // capture moment - how many elements carry the hub's
                // layout key, whether the matched one is an exit
                // clone, and whether its category label rides a
                // textPath. Read-only; shared by DIAG-00 and DIAG-03.
                // DIAG-00 + PER-STAGE REGISTRY SNAPSHOT + ON-DEMAND
                // FULL PAINT (ruled 2026-11-01, Jason, per
                // CLOSING-PAINT-BLOWUP-ASSESSOR-REPORT Q3/Q5 and
                // HELD-FLOOR-AND-FULLPAINT-ASSESSOR-REPORT §1.7):
                // three measurement instruments, nothing else.
                // DIAG-00 and the registry snapshots ride the shell's
                // diagnostics option (opts.diag00; session-only,
                // default ON beside the step-through toggle) and are
                // pure reads - no paint, no settle, no state write -
                // so they change no geometry and no run outcome. The
                // on-demand paint rides its own session-only option
                // (opts.onDemandFullPaint, DEFAULT OFF, never written
                // into saved layouts/profiles). Counters for the
                // paint trigger: a run-wide runPhase ordinal, a
                // commit count excluding the throw, and the
                // fit-subcats commit count that arms the +5 series.
                diagPhaseOrdinal = 0; diagPaintCount = 0; diagFitSubcatsCount = 0; diagPaintBase = null;
                // DIAG-00: one painted-geometry snapshot of the saved
                // layout, taken after the baseline step and before
                // the throw / fine-tune arm - the DOM still holds
                // the pre-run full paint and no phase has committed.
                // Same helpers as DIAG-03 (dkPaintedGeometry,
                // diagCaptureView, diagCamera), plus the Q5 fields:
                // per-branch bbox decomposition, the paintComposition
                // capture fields for ALL items including non-target
                // branches, pre-run override provenance, and the
                // hub-group element identity. Stage-stamped
                // "ANNEAL-DIAG-00:pre-run:ord-0" on every capture it
                // takes, so no later baseline reads it as unstamped.
                // PER-STAGE REGISTRY SNAPSHOT (§1.7 columns, zero
                // paint): logged inside runPhase after the commit
                // and the cloud measurement, BEFORE the gate
                // decision, so tripped stages are included. Per
                // subcategory key: the fit target set, the override
                // written, the post-commit solve radius
                // (cloudRadius from the solve registry), the
                // delivered radius - plus the phase's gate threshold
                // and verdict and the onset reading and verdict
                // (report-only; the onset check itself still runs in
                // the ladder exactly as before). Registry reads
                // only: no DOM paint, no repaint, no settle, and no
                // state write beyond the record and the log.
                // ONE ON-DEMAND FULL PAINT (Q3 exact trigger wording,
                // implemented in runPhase): one freeze-replay full
                // paint with the run context live (dkCtx untouched),
                // under the closing-paint opClass so the hub snap
                // fires - if the freeze capture is unavailable the
                // paint does not run at all, never under another
                // opClass - with blit starts held and any standing
                // blit session ended before and after, exactly as
                // the closing paint does. The flag through Mr
                // (__sxDiagFullPaint) and the blit hold are set
                // together, gated by the same toggle. One
                // stage-stamped painted-geometry snapshot is logged
                // per paint. Decision inputs are registry reads, so
                // the paint changes no gate/onset verdict and no
                // run outcome.
                // THROW-BRACKET PAINTS (diagnostic, ruled 2026-11-01
                // 23:57 CST, Jason): measurement ONLY around the first
                // throw. One full paint + one stage-stamped
                // painted-geometry snapshot BEFORE stepThrow runs
                // (THROW-BEFORE) and one AFTER it commits
                // (THROW-AFTER), each followed by a prompt pause on
                // the shell's slim bottom-right strip
                // (opts.onThrowBracketPause; the strip opens slim
                // only, map fully visible behind it). Active only
                // when the shell supplies opts.throwBracket
                // (session-only toggle, default ON for this
                // diagnostic build, never written into saved
                // layouts/profiles); absent/false = no bracket
                // paints, no bracket snapshots, no bracket pauses,
                // no bracket log lines - exactly the pre-edit run.
                // The bracket paint replicates diagOnDemandPaint's
                // discipline exactly: freeze capture +
                // paintComposition centres, the run context live
                // (dkCtx untouched), hub seating only under the
                // closing-paint opClass ("anneal-closing-paint") -
                // if the freeze capture is unavailable the paint
                // does not run at all, never under another opClass -
                // any standing blit session ended before and after,
                // blit starts held for its duration, and the
                // __sxDiagFullPaint flag and the blit hold set
                // together. The snapshot uses the same helpers as
                // DIAG-00/DIAG-03 (dkPaintedGeometry,
                // diagCaptureView, diagCamera, diagHubIdentity,
                // diagText) and the same field list: per-branch bbox
                // decomposition, branch delivered radius,
                // per-subcategory segment / absolute radius / stored
                // radius, hub point + radius, camera state, override
                // provenance - plus the throw's own inputs (centre
                // radius, target radii, delivered radii, committed
                // override lengths from report.throwRadii).
                // stepThrow itself is untouched: nothing here writes
                // a length, an override, a fit target, a view, or
                // any gate/onset decision input, so the throw's
                // effect reads off BEFORE vs AFTER with no other
                // operation in between.
                throwBracketBefore = null;
            try {
                // STAGED SCORING (ruled 2026-11-02, Jason): the run's
                // judged score starts SAME-BRANCH ONLY; the context is
                // cleared in the finally block (dk.end) on every exit.
                sxAnnealStageCtx = { branch: name, adjacent: !1 };
                // F4 STEP 1b - preconditions: stage any violated choreography
                // values (written by the throw, restored by the final patch).
                const staged = stepPreconditions(api, report);
                // (3) SNAPSHOT + BASELINE: the snapshot is the
                // untouched pre-run state (taken before any staging is
                // applied, so a revert restores the user's real values,
                // staged ones included). The baseline is measured
                // TWICE (§5.8) and the observed variance reported.
                // F4 STEP 2 - snapshot + baseline: snapshot the untouched
                // pre-run state, measure the baseline twice (decider +
                // secondary + neighbors), and capture pre-run delivered radii.
                const preDelivered = await stepBaseline(dk, report, name);
                witnessFrame("pre-run", null, preDelivered, witnessSubs, name, report, dk);
                // DIAG-00 (ruled 2026-11-01, Jason): the pre-run
                // painted-geometry snapshot of the saved layout -
                // taken here, after the baseline step (which only
                // measures and takes the untouched snapshot) and
                // before any phase commits: the DOM still holds the
                // pre-run full paint. Read-only; gated on the
                // shell's diagnostics option (opts.diag00).
                if (opts && opts.diag00) { try { diag00Capture(preDelivered, name, tax, report); } catch (e) {} }
                // E6 phase-boundary yield: a double requestAnimationFrame
                // (with a timeout fallback) so busy / readout state set
                // before a phase can paint before the phase's synchronous
                // solve blocks the main thread.
                // One phase = exactly one applyPhase commit. The
                // record is assembled from the phase's own log slice:
                // requested ratios from the phase entry's validated
                // ratios (restricted to this branch's keys), delivered
                // ratios from delivered radii vs the pre-run radii,
                // and every other log entry the phase produced as its
                // limiter hits.
                // Q2 per-phase gate state: the cloud metric the
                // previous phase delivered (the run baseline, for
                // the first phase). After each phase commits, its
                // cloud is compared against this value; a regression
                // beyond tolerance stops the cascade (see the gate
                // at the end of runPhase) instead of carrying a
                // tangle through the remaining phases. The metric is
                // record.cloud - Q4 repointed that readout to the
                // own-cloud crossing number, not this gate: the
                // comparison and its tolerance below are unchanged
                // and now operate on crossing values.
                prevPhaseCloud = Number.isFinite(report.baseline.first) ? report.baseline.first : null;
                // BACK-UP-A-STEP (ruled 2026-10-28, all phases): the
                // cascade retains the last-kept phase snapshot
                // throughout the run - the layout state and this
                // branch's fit registrations as they stood right after
                // the most recent KEPT phase commit (the throw commit
                // counts as a kept state). A per-phase gate trip
                // restores it, discards the tripping step, and stops
                // that level's ladder; earlier kept steps stand and
                // the run continues to the next level from the
                // backed-up state. The pre-run snapshot is the
                // fallback only when no phase has committed yet, and
                // stays the final gate's whole-run restore.
                lastKeptSnapshot = null; lastKeptFit = null;

                // F4: the shared phase-commit step every cascade phase
                // runs through - one applyPhase commit, its record,
                // and the per-phase gate (tolerance SX_SCORE.GATE_TOL,
                // flat 2). The onset margin and the fine-tune margin
                // are deleted.
                mark = dkLog.length;
                // F4 STEP 3 - throw: one commit arming the full cascade at the
                // thrown lengths (factors: SX_SCORE.THROW_*).
                // FINE-TUNE SKIP-THROW DECISION (ruled 2026-10-29,
                // rulings adopted 09:42-09:43): judged HERE - after
                // the baseline step, before the throw - on the
                // CASCADE baseline (report.baseline.first, measured
                // twice in stepBaseline with its variance reported),
                // never on the shell pre-flight's single measure
                // (that measure acts only on exactly zero and is not
                // the fine-tune measure). Baseline STRICTLY below
                // SX_SCORE.FINE_TUNE_BELOW - zero included - takes
                // the skip path; exactly 5 or more throws as before.
                // On the skip path there is no thrown baseline.
                // The fine-tune margin is deleted; FINE_TUNE_BELOW
                // only chooses skip-throw versus throw.
                // SIBLING/NEIGHBOR AWARENESS (ruled 2026-11-14, Jason):
                // Baseline evaluation must consider the staged/adjacent
                // crossing number with sibling nodes (adjacentFirst) if present,
                // otherwise starburst clouds with low self-crossing are never thrown
                // even when heavily overlapping sibling branches.
                const baselineForThrow = (report.baseline.adjacentFirst != null && Number.isFinite(report.baseline.adjacentFirst))
                    ? Math.max(Number(report.baseline.first), Number(report.baseline.adjacentFirst))
                    : Number(report.baseline.first);
                const fineTuneActive = Number.isFinite(baselineForThrow) && baselineForThrow <= 0;
                report.fineTune = { active: fineTuneActive, baseline: baselineForThrow, selfBaseline: report.baseline.first, below: SX_SCORE.FINE_TUNE_BELOW, margin: null, armPhase: null, holds: [], branchFloor: null };
                fineTuneActive && dkLog.push({ type: "fine-tune-skip-throw", branch: name, baseline: baselineForThrow, below: SX_SCORE.FINE_TUNE_BELOW });
                if (!fineTuneActive) {
                    if (Number.isFinite(baselineForThrow)) {
                        prevPhaseCloud = baselineForThrow;
                    }
                }
                // FINE-TUNE STAGING-AND-ARMING COMMIT (skip path,
                // ruling 6 - full arming mirroring the throw minus
                // length changes): the throw commit is what normally
                // writes the staged precondition values and arms the
                // full cascade (all four arm maps true, overwriting
                // inherited explicit-false vetoes, restored later
                // from the snapshot). A skip path that never throws
                // must still land that exact staging and arming as
                // its own kept commit, or the shrink solve would run
                // under the wrong choreography and its shrink moves
                // would be filtered out in Grow-only mode. This
                // commit changes NO length override: branch,
                // subcategory and kink lengths stay at their pre-run
                // values, and the shrink ladders below do the moving.
                // THROW-BRACKET (diagnostic, 2026-11-01 23:57 CST):
                // the bracket points wrap the run's throw sequence
                // (the first throw plus any THROW REPEAT re-throws,
                // ruled 2026-11-06), on the throw path only - a skip-throw
                // (fine-tune) run has no throw to bracket. With
                // opts.throwBracket absent/false neither point runs:
                // no bracket paint, snapshot, pause or log line, and
                // stepThrow runs exactly as before.
                if (!fineTuneActive && opts && opts.throwBracket) { try { await throwBracketPoint("THROW-BEFORE", throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
                fineTuneActive ? await stepFineTuneArm(snapshot, staged, name, tax, runPhase, report, opts, dk, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) : await stepThrowRepeated(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                if (!fineTuneActive && opts && opts.throwBracket) { try { await throwBracketPoint("THROW-AFTER", throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
                // WITNESS: on the skip-throw path there is no thrown
                // frame; gains are measured from the standing
                // (fine-tune-arm / pre-run) frame instead.
                witnessThrown || (witnessThrown = witnessLastFrame ? witnessLastFrame.subs : null);
                // F4 STEP 4 - onset setup still records the thrown-state
                // baseline (pre-run baseline on the skip path). Phase 4
                // (2026-11-04): no hold threshold. The onset margin and
                // the fine-tune margin are deleted. The per-phase gate
                // (flat GATE_TOL 2) is the only stop.
                const onsetCheck = stepOnsetSetup(name, fineTuneActive, report);
                // F4 STEP 5 - shrink ladders: subcategory level first, then the
                // branch level. The per-phase gate inside runPhase is the
                // only stop; the onset and fine-tune margins are deleted.
                // EXPLANATION STEP THREE IS COMMENTED OUT (ruled
                // 2026-10-31, Jason): the explanation's step three
                // - a separate geometric step-down stage - and its
                // step four - the shrink - were duplicating each
                // other. There is no separate step-down stage in
                // this cascade and none runs: the
                // step-down IS this shrink stage (these ladders,
                // their square-root-step staging and the per-phase gate),
                // one step-down/shrink stage, not two.
                const shrinkOutcome = await stepShrinkLadders(name, report, dk, fineTuneActive, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, opts, tax, diagCaptureFields, onsetCheck);
                // TERMINATION (ruled 2026-10-28, Jason 23:43, scope
                // confirmed 23:49): when the CATEGORY (branch) shrink
                // ladder backed out, the run ENDS here. Growth
                // (branch, then subcategories), the final patch and
                // the final gate do NOT run; the backed-out
                // (last-kept snapshot) state stands exactly as
                // runPhase restored it, and no final-gate revert
                // check judges it. The report closes the run out on
                // the backed-out state's own measurements - finalCloud
                // / delta (decider) and the secondary area, measured
                // on the state that stands - under its own gate value
                // ("ended-at-category-backout", neither the final
                // gate's "kept" nor its "reverted") with the early
                // end stated plainly in the reason, so the receipt
                // never presents this outcome as a final-gate result.
                // The block then runs the DISARM cleanup (ruled
                // 2026-10-29): the temporary staging the final patch
                // would have taken down is restored there instead -
                // see DISARM ON EARLY END inside the block. The run
                // still ends here; the disarm is not the final patch,
                // runs no phase and no gate, and changes no
                // backed-out length.
                // A subcategory back-out does not reach this block
                // (stepShrinkLadders reports only branch-ladder gate
                // trips), and a run with no category back-out takes
                // the unchanged full cascade below.
                const endedAtCategoryBackout = !!(shrinkOutcome && shrinkOutcome.branchBackedOut);
                // GATE-REJECTED END (ruled 2026-11-01, Jason): the
                // back-out confirmation gate was REJECTED at the trip
                // above, so nothing was reverted - the tripped trial
                // geometry stands. The run still ends here (no growth,
                // no final patch, no final gate), but the disarm
                // restore below is SKIPPED on this ending: a restore
                // re-solves, and the rejected ending must leave the
                // tripped geometry exactly as it stood on screen. The
                // rejection, its gate code and both crossings are
                // recorded on the report (report.backoutGate, set at
                // the trip) and in this reason for the receipt.
                const gateRejectedEnd = !!(shrinkOutcome && shrinkOutcome.gateRejected);
                if (endedAtCategoryBackout) {
                    report.endedEarly = { at: gateRejectedEnd ? "category-shrink-backout-gate-rejected" : "category-shrink-backout", phase: report.phaseGate && report.phaseGate.phase ? report.phaseGate.phase : null, gateRejected: gateRejectedEnd };
                    report.gate = "ended-at-category-backout", report.reason = gateRejectedEnd ? "category shrink back-out REJECTED at gate [" + (report.backoutGate ? report.backoutGate.code : "ANNEAL-BO-01") + "] at " + (report.endedEarly.phase || "fit-branch") + " — crossing " + (report.backoutGate ? Math.round(100 * report.backoutGate.crossingBefore) / 100 : null) + " → " + (report.backoutGate ? Math.round(100 * report.backoutGate.crossingAfter) / 100 : null) + " (tripped); tripped trial geometry left standing, nothing reverted — run ended there; growth, the final patch and the final gate did not run" : "category shrink backed out at " + (report.endedEarly.phase || "fit-branch") + " — run ended there; growth, the final patch and the final gate did not run";
                    dkLog.push({ type: "run-ended-early", at: report.endedEarly.at, phase: report.endedEarly.phase, gateRejected: gateRejectedEnd });
                    try { report.finalCloud = await dk.measureCloud(name); } catch (e) { report.finalCloud = report.phaseGate && null != report.phaseGate.restoredCloud ? report.phaseGate.restoredCloud : prevPhaseCloud; }
                    // STAGED SCORING: finalCloud is measured after
                    // the shrink-stage switch (neighbour-inclusive
                    // composition) while baseline.first is the
                    // run-start (own-cloud-only) value the receipt
                    // displays as the run's start - report.delta is
                    // the displayed pair's difference (final minus
                    // displayed start, one composition story per
                    // receipt line). The GATE's own judged change is
                    // recorded separately as gateDelta against
                    // gateBaseline, the neighbour-inclusive baseline
                    // captured on the pre-run geometry.
                    report.gateBaseline = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.baseline.adjacentFirst : report.baseline.first;
                    report.delta = null != report.finalCloud && null != report.baseline.first ? report.finalCloud - report.baseline.first : null, report.gateDelta = null != report.finalCloud ? report.finalCloud - report.gateBaseline : null;
                    try {
                        const allFinE = await dk.measureCloudsAll(), nfE = {};
                        Object.keys(allFinE).forEach(k => {
                            k !== name && (nfE[k] = allFinE[k]);
                        }), report.neighbors.final = nfE;
                    } catch (e) {}
                    // Bake gate (M4): dkBakeGate above, the single
                    // computation shared by both run endings.
                    dkBakeGate(report);
                    report.plateau = { metric: "crossingnumber", finalCrossing: report.finalCloud, copyFired: 0 === report.finalCloud };
                    report.fitDeviationTotal = tallyFitDev(report);
                    // DISARM ON EARLY END (ruled 2026-10-29, Jason
                    // 02:08): the final patch does not run on this
                    // path, so the cleanup it normally performs -
                    // taking the cascade's temporary staging down -
                    // runs HERE, after the backed-out state's
                    // measurements above are taken, as a plain
                    // restore, NOT as a phase: no "final" phase
                    // record, no runPhase commit, no gate. The
                    // concrete armed/staged state it clears, all of
                    // it written by the throw commit and the shrink
                    // ladders and left standing by restoreKept when
                    // the branch ladder backed out: (1) the two
                    // spoke auto-shrink arm maps at the keys the throw
                    // armed - branchSpokeAutoShrink[name], and for
                    // every subcategory label of this branch
                    // subcatSpokeAutoShrink[label], all set true by
                    // the throw, overwriting any pre-run explicit
                    // false veto; (2) the staged precondition values
                    // (the collision / staggerDensity / expandAll
                    // entries recorded in `staged`, applied by the
                    // throw commit); (3) this branch's fit-target
                    // registrations in dkFitRegistry (armed by
                    // armFitForBranch, retargeted per ladder stage,
                    // and restored with the kept layout by
                    // restoreKept; the final patch clears them via
                    // clearBranchFit before its commit and the
                    // gate-revert catch clears them too - only this
                    // early-end path left them armed). The disarm
                    // patch is the CURRENT (backed-out) state with
                    // only (1) and (2) overwritten from the pre-run
                    // snapshot - an arm key the snapshot lacks is
                    // deleted, exactly restoring its absence - so
                    // every length override (branch / subcat /
                    // kink) and every other field stands exactly as
                    // backed out. (3) is NOT cleared before the
                    // restore (DISARM FIX, ruled 2026-11-01, Jason):
                    // the compact kept shape lives in those fit
                    // targets - an unarmed re-solve starts every
                    // subcategory at the branch base radius and the
                    // locked "grow" collision never pulls it back
                    // down, so clearing first handed the closing
                    // paint the thrown lengths instead of the kept
                    // ones. The kept registrations (lastKeptFit, the
                    // pair restoreKept re-arms) are re-armed before
                    // the restore, so its solve runs armed and
                    // reproduces the backed-out geometry; (3) is
                    // then cleared AFTER the restore, so the post-run
                    // state this cleanup leaves is exactly as
                    // disarmed as before. A disarm failure is
                    // recorded on the report and never thrown: the
                    // early end and its backed-out state stand
                    // regardless.
                    if (gateRejectedEnd) {
                        report.disarm = { skipped: "backout-gate-rejected — tripped geometry left exactly as it stood" }, dkLog.push({ type: "run-disarm-skipped", at: "category-shrink-backout-gate-rejected" });
                    } else try {
                        const disarmPatch = dk.snapshot(), disarmLensBefore = dk.canonical({ branchOverrides: disarmPatch.branchOverrides, subcatOverrides: disarmPatch.subcatOverrides, kinkOverrides: disarmPatch.kinkOverrides }), restoreArmKey = (patchMap, snapMap, key) => {
                            if (!patchMap) return;
                            null != snapMap && Object.prototype.hasOwnProperty.call(snapMap, key) ? patchMap[key] = snapMap[key] : delete patchMap[key];
                        };
                        restoreArmKey(disarmPatch.branchSpokeAutoShrink, snapshot.branchSpokeAutoShrink, name), tax.subLabels.forEach(l => {
                            restoreArmKey(disarmPatch.subcatSpokeAutoShrink, snapshot.subcatSpokeAutoShrink, l);
                        }), staged.forEach(s => {
                            disarmPatch[s.key] = snapshot[s.key];
                        });
                        const fitKeysBeforeDisarm = Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name);
                        // DISARM FIX (see the block comment above):
                        // re-arm the kept fit registrations before
                        // the restore so its solve runs armed, then
                        // clear them after it - clearing a target
                        // solves nothing itself, so the armed solve's
                        // delivered geometry stands into the closing
                        // paint's capture while the post-run fit
                        // state is still fully cleared. With no kept
                        // fit on record, fall back to the original
                        // unarmed order.
                        if (lastKeptFit) {
                            clearBranchFit(dk, name);
                            Object.keys(lastKeptFit).forEach(k => dk.setFitTarget(k, lastKeptFit[k]));
                        } else clearBranchFit(dk, name);
                        dk.restore(disarmPatch), clearBranchFit(dk, name);
                        const disarmStateAfter = api.get(), fitKeysAfterDisarm = Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name);
                        report.disarm = { armsRestored: [ "branchSpokeAutoShrink", "subcatSpokeAutoShrink" ], preconditionsRestored: staged.map(s => s.key), fitTargetsCleared: fitKeysBeforeDisarm.length, fitTargetsArmedForSolve: lastKeptFit ? Object.keys(lastKeptFit).length : 0, fitTargetsRemaining: fitKeysAfterDisarm.length, lengthsUnchanged: dk.canonical({ branchOverrides: disarmStateAfter.branchOverrides, subcatOverrides: disarmStateAfter.subcatOverrides, kinkOverrides: disarmStateAfter.kinkOverrides }) === disarmLensBefore };
                        dkLog.push({ type: "run-disarm", at: "category-shrink-backout", fitTargetsCleared: fitKeysBeforeDisarm.length, fitTargetsArmedForSolve: report.disarm.fitTargetsArmedForSolve, fitTargetsRemaining: fitKeysAfterDisarm.length, preconditionsRestored: report.disarm.preconditionsRestored.slice(), lengthsUnchanged: report.disarm.lengthsUnchanged });
                        witnessRestore("disarm-restored", "category-shrink-backout", witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                    } catch (disarmErr) {
                        report.disarm = { error: String(disarmErr && disarmErr.message || disarmErr) }, dkLog.push({ type: "run-disarm-error", at: "category-shrink-backout", message: report.disarm.error });
                    }
                }
                // F4 STEP 5b - growth: scoped same-branch growth
                // (ruled 2026-10-28), after the shrink ladders and
                // before the final patch. Growth arrives ONLY as
                // cascade ratio patches through runPhase - the
                // relaxation engines still never grow and the
                // repulsion descent's grow flag stays off. A cloud
                // grows only when same-branch pairs contribute more
                // than half its standing E: standing E is the
                // cascade's own crossing readout, excluded E is the
                // same readout under the existing same-branch
                // exclusion flag, and the difference is the
                // same-branch contribution. Levels run outermost
                // first (branch, then subcategories); there is no
                // kink growth - growing kink leaves never reduces
                // collisions. Each level climbs the cumulative
                // ladder (step factor per step, at most the ruled
                // max steps, the step that would pass the cap
                // clipped to exactly the cap), every step gated by
                // the shared per-phase gate with back-up-a-step on
                // a trip. Lengths also respect the phase validator's
                // hard cap against the baked bases: a step whose
                // lengths can no longer advance under that cap
                // stops its level instead of being rejected.
                // Skipped when the run ended at the category shrink
                // back-out above (see TERMINATION at stepShrinkLadders).
                // STEP FIVE COMMENTED OUT (ruled 2026-10-31, Jason):
                // explanation step five - "Fit and growth" - is
                // out. The growth phase no longer runs in the
                // cascade. The stepGrowth definition above is kept
                // in the code, not deleted, and its invocation is
                // commented out, not removed:
                // if (!endedAtCategoryBackout) await stepGrowth();
                // F4 STEP 6 - final patch: build the kept state on the pre-run
                // snapshot, carry held lengths through, commit as the 'final'
                // phase, then take the final measurements for the gate.
                // Both the final patch and the final gate are
                // skipped when the run ended at the category shrink
                // back-out above (see TERMINATION at
                // stepShrinkLadders): the backed-out state stands
                // unjudged by the gate and is never reverted here.
                if (!endedAtCategoryBackout) {
                await stepFinalPatch(dk, name, opts, report, tax, runPhase, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, diagCaptureFields, witnessTrippingLabel);
                // (7) GATE: exact-float improve-or-hold on the
                // branch's own-cloud CROSSING NUMBER (Q4 decider -
                // baseline.first / finalCloud carry crossing values
                // via the repointed readout; the xAreaCross area is
                // reported secondary above and never gates). A kept
                // run must also
                // provably differ from the pre-run snapshot - a
                // "kept" run whose final state is the snapshot kept
                // nothing.
                // STAGED SCORING (ruled 2026-11-02, Jason): the final
                // gate is the same judge as the descent - it judges the
                // shrink-stage composition, so its baseline is the
                // adjacent-composition value captured on the pre-run
                // geometry in stepBaseline (baseline.adjacentFirst),
                // falling back to baseline.first only when that capture
                // was unavailable.
                const gateBaseline = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.baseline.adjacentFirst : report.baseline.first;
                report.gateBaseline = gateBaseline;
                if (!dk.gate(gateBaseline, report.finalCloud)) throw new Error("gate failed: final cloud " + report.finalCloud + " exceeds baseline " + gateBaseline);
                if (dk.canonical(api.get()) === dk.canonical(snapshot)) throw new Error("kept-state verification failed: final state is identical to the pre-run snapshot");
                report.finalDiffers = !0, report.gate = "kept";
                }
            } catch (e) {
                if (typeof dkCtx !== "undefined" && dkCtx) {
                    dkCtx.isRestoring = !0;
                    dkCtx.phaseStartedAt = 0;
                }
                report.fitDeviationTotal = tallyFitDev(report), report.gate = "reverted", report.reason = String(e && e.message || e);
                // Q1: a budget abort or a user cancel is named as
                // such on the report - phase and the phase's
                // iteration count ride along for the receipt.
                if (e && (e.dkBudget || e.dkCancelled)) report.aborted = { kind: e.dkBudget ? "budget" : "cancel", phase: e.phase != null ? String(e.phase) : null, iterations: e.iterations || 0 };
                try {
                    clearBranchFit(dk, name);
                    if (snapshot) {
                        try {
                            dk.restore(snapshot);
                            report.restoreVerified = dk.canonical(api.get()) === dk.canonical(snapshot);
                        } catch (errRestore) {
                            // If scoped restore or solve threw, force unscoped layout apply as fallback
                            api.apply(snapshot);
                            report.restoreVerified = dk.canonical(api.get()) === dk.canonical(snapshot);
                        }
                    }
                    snapshot && witnessRestore("whole-run-revert-restored", null, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                } catch (re) {
                    report.restoreError = String(re && re.message || re);
                }
            } finally {
                const wEv = report.witness.events.find(e => e.wholesaleDiscard);
                report.witness.verdict = wEv ? "proven" : report.witness.events.length ? "ruled-out" : "no-backout-observed", report.witness.culprit = wEv ? { event: wEv.event, phase: wEv.phase, subcats: wEv.wholesale.map(w => w.label) } : null, dkLog.push({ type: "witness-verdict", verdict: report.witness.verdict, culprit: report.witness.culprit, events: report.witness.events.length, frames: report.witness.frames.length });
                sxAnnealStageCtx = null, dk.end(), dkLog.push({ type: "run-report", report: report });
                // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31,
                // Jason): every commit above painted only the
                // approximation (see Mr) - paint the full map ONCE
                // here, at the run's end state: kept, ended-early,
                // or reverted alike (on a revert the catch above
                // has already restored the pre-run snapshot, so
                // this paints the state that actually stands).
                // The context is closed first, so this paint is
                // the run's terminal paint, settle search included.
                // ONE CLOSING REPAINT (ruled 2026-11-01, Jason -
                // supersedes the split closing paint this block
                // carried: a freeze-replay paint for the category
                // back-out ending and the ordinary paint for kept
                // and reverted endings): there is exactly ONE
                // closing repaint here, regardless of how the run
                // gets here - kept, ended-early (category back-out
                // included), reverted, aborted or cancelled alike -
                // and it paints the state that stands. The painted
                // witness named the ordinary closing re-solve as
                // the operation that re-derived larger painted
                // segments than the cascade delivered (Impact,
                // fit-branch-13: painted segments many times past
                // one step beyond the last kept delivered segments
                // while the bookkeeping witness held), so the one
                // repaint is the freeze-replay paint in the settle
                // guard's own pattern (sgRestorePaint) for EVERY
                // ending: every branch frozen, nothing recomputed,
                // each node seated at its delivered centre, and the
                // frozen capture replaying the delivered solve the
                // cascade just stood at - on a revert the catch
                // above has already restored the pre-run snapshot
                // and re-solved to it, so the replay carries that
                // restored state, not the discarded run. The mode
                // is chosen BEFORE any paint runs: only when the
                // freeze capture itself is unavailable (no
                // delivered branches or centres to replay) does
                // the one repaint run as the ordinary paint - a
                // paint that has run is never followed by a second
                // closing repaint, on any ending, for any failure.
                // The repaint is terminal: any blit session left
                // over from the run's scoped interim paints is
                // ended BEFORE it (so the paint-top gate's
                // same-frozen-set path can never carry a session
                // through it), blit session starts are held off
                // for its duration (sgHoldBlitStart, exactly as
                // sgRestorePaint holds them - an all-frozen paint
                // otherwise starts a session whose swap vaults the
                // whole map behind a raster and arms a settle
                // timer nobody is left to land), and any session
                // that nevertheless stands after it is ended
                // before the witnesses below read the painted map.
                let closingPaintMode = "ordinary", closingPaintResult = null;
                try {
                    const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                    diagCaptureFields = centres && centres.captureFields ? centres.captureFields : null;
                    if (cap && cap.branches && cap.branches.size && centres && centres.size) closingPaintMode = "freeze-replay", scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres };
                } catch (e) { __sxErrLog("layout-anneal-closing-paint-carry", e), scCtx = null, closingPaintMode = "ordinary"; }
                try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-anneal-closing-paint-blit-end", e); }
                if ("freeze-replay" === closingPaintMode) sgHoldBlitStart = !0;
                try {
                    // LAYOUT GLIDE (tweening Job B, 2026-11-13): the
                    // closing paint after a run glides (animate true)
                    // so nodes ease into their final spots instead of
                    // snapping. The other cascade paints stay
                    // animate:false (diagnostic / pre-run / tail).
                    closingPaintResult = sxRequestMapPaint({
                        animate: !0,
                        forceRepaint: !0
                    });
                } catch (e) { __sxErrLog("layout-anneal-final-paint", e); } finally {
                    scCtx = null, sgHoldBlitStart = !1;
                }
                // A chunked closing paint completes across frames:
                // wait for it (raced against the same 900 ms bound
                // the painted witness below uses, so a throttled
                // frame can never hang the receipt) before anything
                // is read from - or cleared off - the painted map.
                try {
                    if (closingPaintResult && "function" == typeof closingPaintResult.then) await Promise.race([ closingPaintResult, new Promise(r => setTimeout(r, 900)) ]);
                    else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                } catch (e) {}
                try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-anneal-closing-paint-blit-end", e); }
                dkLog.push({ type: "closing-paint", branch: name, mode: closingPaintMode, gate: report.gate, endedEarly: !!report.endedEarly, opClass: "anneal-closing-paint" });
                // CAPSULE WIPE GATED ON FULL-PAINT COMPLETION
                // (Fix 2, ruled 2026-11-01, Jason): the interim
                // capsule layer's published live-number anchor is
                // cleared only HERE - after the one closing repaint
                // above has landed - never before it. Clearing it
                // ahead of the paint (as this block used to) wiped
                // the approximation state while the full paint was
                // still in flight, queued or failed, and the map
                // layer could be left empty: no capsule, no full
                // paint. The capsule DOM layer itself is gated the
                // same way inside Ar (see sxCapsuleKeep there): it
                // survives the paint's opening clear and is removed
                // only by the install that lands the full paint.
                window.__sxInterimAnchor = null;
                // ANNEAL-DIAG-03: the closing full paint has landed
                // (paint promise awaited above); pause here, before
                // settle / before the run ends, on the gate Accept
                // path only - diagPause no-ops on every other ending.
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01):
                // hand DIAG-03 the closing-paint traces that decide
                // between the two closing-paint paths - the mode this
                // finally block already chose (closingPaintMode), and
                // the scoped-paint counts / segment-timing presence
                // from the dkLog entries THIS paint pushed (the
                // entries after this run's run-report entry, which
                // was pushed immediately before the paint) - so the
                // expanded readout, the console diag object and the
                // receipt carry them without console digging.
                // Read-only: the scan only reads dkLog; it adds no
                // paint, capture, or fit call, and changes neither
                // the mode choice nor the paint.
                let diagClosing = null;
                try {
                    diagClosing = { mode: closingPaintMode, scopedPaint: null, segmentTiming: !1 };
                    let rr = -1;
                    for (let i = dkLog.length - 1; i >= 0; i--) if (dkLog[i] && "run-report" === dkLog[i].type) { rr = i; break; }
                    for (let i = dkLog.length - 1; i > rr; i--) {
                        const e = dkLog[i];
                        if (!e) continue;
                        if (!diagClosing.scopedPaint && "scoped-paint" === e.type) diagClosing.scopedPaint = { retained: e.retained, captured: e.captured, diverged: e.diverged };
                        if (!diagClosing.segmentTiming && "segment-timing" === e.type) diagClosing.segmentTiming = !0;
                        if (diagClosing.scopedPaint && diagClosing.segmentTiming) break;
                    }
                } catch (e) { diagClosing = { mode: closingPaintMode, scopedPaint: null, segmentTiming: !1 }; }
                await diagPause("ANNEAL-DIAG-03", "closing full paint \u2192 settle", diagClosing, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                // FINAL-STEP WITNESS (extension): the frame the
                // back-out judge could never take - every
                // subcategory's delivered radius and override as
                // they stand AFTER the closing full paint above,
                // the state the user actually sees when the run
                // ends. Both final-step transitions are judged
                // here (the final patch commit, bracketed in
                // stepFinalPatch; and the closing sequence -
                // context close plus this paint, settle search
                // included - against the last frame taken before
                // it), and the record names the operation this
                // run's final step actually was, on endings that
                // never reach the final patch as well. The record
                // lands on the report after the run-report log
                // entry above; the entry holds this same report
                // object by reference, and the receipt is built
                // from the returned report, so both carry it.
                // Observational only, and guarded: a failure here
                // is recorded as not-observed and never disturbs
                // the run's ending.
                try {
                    const fsOperation = witnessFinalOperation ? witnessFinalOperation + ("reverted" === report.gate ? ", then the whole-run revert to the pre-run snapshot" : "") + ", then the closing full paint" : report.backoutGate && "rejected" === report.backoutGate.decision ? "category shrink back-out gate-rejected ending (tripped trial geometry left standing; disarm, the final patch and the final gate did not run), then the closing full paint" : report.endedEarly ? "category shrink back-out ending (disarm restore; the final patch and final gate did not run), then the closing full paint" : "reverted" === report.gate ? "whole-run revert to the pre-run snapshot, then the closing full paint" : "closing full paint (no final patch ran)";
                    const fsBeforePaint = witnessFinalAfter || witnessLastFrame, fsAfterPaint = witnessFrame("final-step-after-paint", witnessFinalOperation ? "final" : null, null, witnessSubs, name, report, dk);
                    const fsTCommit = witnessFinalBefore && witnessFinalAfter ? witnessFinalJudge("final-patch-commit", witnessFinalBefore, witnessFinalAfter, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null, fsTPaint = fsBeforePaint ? witnessFinalJudge("closing-full-paint", fsBeforePaint, fsAfterPaint, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const fsTransitions = [ fsTCommit, fsTPaint ].filter(Boolean), fsCulpritT = fsTransitions.find(t => t.wholesale) || null, fsMovedT = fsTransitions.find(t => t.flung.length) || null;
                    report.witness.finalStep = {
                        operation: fsOperation,
                        finalPhaseTripped: witnessFinalTripped,
                        frames: { lastKept: witnessFinalLastKept, before: witnessFinalBefore, after: witnessFinalAfter, afterPaint: fsAfterPaint },
                        transitions: fsTransitions,
                        verdict: fsCulpritT ? "proven" : fsMovedT ? "moved-not-wholesale" : fsTransitions.length ? "held" : "not-observed",
                        culprit: fsCulpritT ? { transition: fsCulpritT.transition, subcats: fsCulpritT.flung.map(f => f.label) } : null
                    };
                    dkLog.push({ type: "witness-final-step", operation: fsOperation, verdict: report.witness.finalStep.verdict, culprit: report.witness.finalStep.culprit, transitions: fsTransitions.map(t => ({ transition: t.transition, wholesale: t.wholesale, flung: t.flung.map(f => f.label) })) });
                } catch (fsErr) {
                    report.witness.finalStep = { operation: witnessFinalOperation || null, finalPhaseTripped: witnessFinalTripped, frames: { lastKept: witnessFinalLastKept, before: witnessFinalBefore, after: witnessFinalAfter, afterPaint: null }, transitions: [], verdict: "not-observed", culprit: null, error: String(fsErr && fsErr.message || fsErr) };
                }
                // PAINTED-GEOMETRY WITNESS EXTENSION (the extended
                // frame): the painted capture pair spanning the
                // closing full paint, plus the settle frame one
                // visual frame further. The after-paint capture
                // reads the painted SVG as the closing paint left
                // it; then the run waits for the next animation
                // frame / settle - a chunked closing paint's
                // in-flight promise first (raced against a bound so
                // a throttled frame can never hang the receipt),
                // then a double requestAnimationFrame with a timer
                // fallback (the house yield pattern) - and captures
                // painted geometry AGAIN. Any of the three numbers
                // (branch radius / segment / absolute radius) that
                // moves past one step across the settle transition
                // is named against the post-paint settle operation;
                // any that moves across the closing paint is named
                // against the closing full paint (settle search and
                // stem finalisation included). The divergence flag
                // compares the painted segment at settle against
                // the bookkeeping delivered radius the existing
                // witness recorded after the same paint: painted
                // past one step beyond bookkeeping is the
                // measurement divergence Jason's report describes,
                // and with this extension the witness reads the
                // painted value, so the receipt reports the fling
                // instead of holding against it. Guarded exactly
                // like the final-step record above: a failure is
                // recorded as not-observed and never disturbs the
                // run's ending. Additive only - report.witness
                // .finalStep and every existing line stand as they
                // were.
                try {
                    const pwOperation = report.witness.finalStep && report.witness.finalStep.operation ? report.witness.finalStep.operation : "closing full paint";
                    witnessPaintedAfterPaint = witnessPaintedFrame("after-closing-paint", pwOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                    try {
                        const pwPaintP = typeof sxPaintPromise !== "undefined" ? sxPaintPromise : null;
                        if (pwPaintP && "function" == typeof pwPaintP.then) await Promise.race([ pwPaintP, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    await new Promise(r => { let done = !1; const fin = () => { if (!done) { done = !0; r(); } }; try { requestAnimationFrame(() => requestAnimationFrame(fin)); } catch (e) {} setTimeout(fin, 120); });
                    witnessPaintedAfterSettle = witnessPaintedFrame("after-settle", "post-paint settle (next animation frame / layout transition / chunked-paint completion after the closing full paint)", dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                    const pwTCommit = witnessPaintedBefore && witnessPaintedAfter ? witnessPaintedJudge("final-patch-commit", witnessFinalOperation || "final patch commit", witnessPaintedBefore, witnessPaintedAfter, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwPrePaint = witnessPaintedAfter || witnessPaintedLastKept;
                    const pwTPaint = pwPrePaint && witnessPaintedAfterPaint ? witnessPaintedJudge("closing-full-paint", pwOperation, pwPrePaint, witnessPaintedAfterPaint, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwTSettle = witnessPaintedAfterPaint && witnessPaintedAfterSettle ? witnessPaintedJudge("post-paint-settle", "post-paint settle (next animation frame / layout transition / chunked-paint completion after the closing full paint)", witnessPaintedAfterPaint, witnessPaintedAfterSettle, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwTransitions = [ pwTCommit, pwTPaint, pwTSettle ].filter(Boolean), pwCulpritT = pwTransitions.find(t => t.wholesale) || null, pwMovedT = pwTransitions.find(t => t.flung.length) || null;
                    let pwDivergence = !1;
                    try {
                        const bkFrame = report.witness.finalStep && report.witness.finalStep.frames ? report.witness.finalStep.frames.afterPaint : null;
                        if (bkFrame && witnessPaintedAfterSettle) Object.keys(witnessPaintedAfterSettle.subs).forEach(label => {
                            const bk = bkFrame.subs[label], pw = witnessPaintedAfterSettle.subs[label];
                            bk && pw && null != bk.d && null != pw.seg && bk.d > 0 && pw.seg > bk.d * WITNESS_ONE_STEP && (pwDivergence = !0);
                        });
                    } catch (e) {}
                    report.witness.painted = {
                        frames: { lastKept: witnessPaintedLastKept, before: witnessPaintedBefore, after: witnessPaintedAfter, afterPaint: witnessPaintedAfterPaint, afterSettle: witnessPaintedAfterSettle },
                        capturePair: { beforeClosingPaint: pwPrePaint ? pwPrePaint.stage : null, afterClosingPaint: witnessPaintedAfterPaint ? witnessPaintedAfterPaint.stage : null, afterSettle: witnessPaintedAfterSettle ? witnessPaintedAfterSettle.stage : null },
                        transitions: pwTransitions,
                        verdict: pwCulpritT ? "proven" : pwMovedT ? "moved-not-wholesale" : pwTransitions.length ? "held" : "not-observed",
                        culprit: pwCulpritT ? { transition: pwCulpritT.transition, operation: pwCulpritT.operation, subcats: pwCulpritT.flung.map(f => f.label + ":" + f.metric) } : null,
                        divergence: pwDivergence,
                        operation: pwOperation
                    };
                    dkLog.push({ type: "witness-painted-verdict", verdict: report.witness.painted.verdict, culprit: report.witness.painted.culprit, divergence: pwDivergence, capturePair: report.witness.painted.capturePair, transitions: pwTransitions.map(t => ({ transition: t.transition, operation: t.operation, wholesale: t.wholesale, flung: t.flung.map(f => f.label + ":" + f.metric) })) });
                } catch (pwErr) {
                    report.witness.painted = { frames: { lastKept: witnessPaintedLastKept, before: witnessPaintedBefore, after: witnessPaintedAfter, afterPaint: witnessPaintedAfterPaint, afterSettle: witnessPaintedAfterSettle }, capturePair: null, transitions: [], verdict: "not-observed", culprit: null, divergence: !1, operation: null, error: String(pwErr && pwErr.message || pwErr) };
                }
                // TAIL-END REFRESH (ruled 2026-11-02, Jason):
                // the run's own ending must leave the kept shape
                // standing on screen, with no manual repaint
                // needed. The closing full paint above installs
                // the kept geometry in the DOM - DIAG-03's
                // painted==stored capture on Jason's acceptance
                // drive proved that - yet his end frame still
                // showed the pre-run picture (the annealed cloud
                // standing at its pre-run seat, its overlay
                // number still the pre-run value) until a
                // centre-circle nudge repainted. Between the DOM
                // and the screen sit layers only a later ordinary
                // paint clears: a blit session's raster and vault
                // (in the default repulsion mode a session ends
                // only at a later paint's top gate), any interim
                // capsule remnant, and the separately positioned
                // metric overlay numbers, which re-seat only on
                // a paint. So end the run with ONE ordinary
                // (non-scoped) full repaint of the standing
                // state: its paint-top gate ends any blit session
                // and strips vault and raster, its DOM build
                // installs the standing state exactly as every
                // later user paint would draw it, and the shell's
                // settle watch then re-measures from the
                // repainted map. Display only: the solve state
                // is not written; no solver, throw, ladder, gate,
                // floor or stop-rule state is touched; and every
                // diagnostic capture above (DIAG-03, the
                // final-step and painted-geometry witnesses) is
                // already taken, so no diagnostic readout
                // changes. Guarded like the rest of this ending:
                // a failure is logged and never disturbs the
                // run's return.
                try {
                    const tailPaintResult = sxRequestMapPaint({ animate: !1, forceRepaint: !0 });
                    try {
                        if (tailPaintResult && "function" == typeof tailPaintResult.then) await Promise.race([ tailPaintResult, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) {}
                    dkLog.push({ type: "tail-end-refresh", branch: name, closingPaintMode: closingPaintMode });
                } catch (e) { __sxErrLog("layout-anneal-tail-end-refresh", e); }
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01):
                // the run is ending - DIAG-03's Continue was pressed
                // and the witness settle frames above have run - so
                // re-read the camera state once more and land it on
                // the report's diag lines as the after-Continue line,
                // beside the camera line DIAG-03 itself carried, so
                // the receipt compares the two camera states after
                // the run ends. Only on a run whose DIAG-03 actually
                // fired carrying closing-paint traces; read-only, and
                // session-only like every diag record (never written
                // into a saved layout or profile).
                try {
                    if (diagAcceptCtx && report.diag && report.diag.some(d => d && "ANNEAL-DIAG-03" === d.code && d.closingPaint)) {
                        const endCam = diagCamera(), endText = diagCameraText(endCam, "camera after Continue (run end)");
                        report.diag.push({ code: "ANNEAL-DIAG-03", label: "camera after Continue", branch: name, phase: diagAcceptCtx.phase, camera: endCam, closingLines: [ endText ], text: endText, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) });
                        dkLog.push({ type: "anneal-diag", code: "ANNEAL-DIAG-03-END", phase: diagAcceptCtx.phase, branch: name, text: endText });
                        try { console.log("[ANNEAL-DIAG-03] " + endText, endCam); } catch (e) {}
                    }
                } catch (e) {}
            }
            return report;
        }
