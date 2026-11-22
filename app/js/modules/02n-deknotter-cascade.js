        // DeKnotter cascade driver (E5, ASSESSMENT §3.4, §3.7, §5.6,
        // §5.8, §5.11): one full run for one branch, driven entirely
        // through the bundle layout API — never the editor shell's
        // collect()/apply — so no intermediate state is broadcast to
        // other windows mid-run. Sequence: subcategory-label check →
        // precondition staging → snapshot + double baseline → throw
        // (branch x50, subcategories x20, kinks autofit to
        // three times their kink (fit) length — full cascade
        // armed, ONE applyPhase commit) →
        // FINE-TUNE (ruled 2026-10-29): when the
        // cascade baseline (measured twice, above) is strictly below
        // 5, zero included, the throw is SKIPPED — a staging-and-
        // arming commit lands the throw's staged values and full
        // arming minus its length changes, the shrink ladders run
        // from the branch's current lengths under the per-phase
        // gate only (flat GATE_TOL 2; the fine-tune margin and the
        // onset margin were deleted Phase 4, 2026-11-04 — the
        // skip-throw under 5 is unchanged), and the branch ladder
        // descends to a
        // label-fit floor instead of stopping at the pre-run length
        // → ruled shrink sequence (Jason,
        // 2026-10-24 adjustment: subcategory nodes first, then the
        // branch itself, each level descending a square-root-step ladder of
        // committed sub-solves toward its label-fit floor under the
        // per-phase gate (flat 2) — a level's ladder halts when that
        // gate trips, and the cascade proceeds to the
        // next level; there is NO kink shrink stage in the cascade —
        // kinks keep their thrown autofit room (3x the kink
        // length, 2026-11-01); the kink shrink to
        // label length is a separate one-time driver normalization,
        // deknotter.shrinkKinksToLabel) → scoped same-branch GROWTH
        // (ruled 2026-10-28: grow-branch then grow-subcats ratio
        // patches, dominance-gated, laddered at 1.25x steps to a 3x
        // cumulative target — see stepGrowth in dkRunCascade) → a
        // CONSTRUCTED final patch (§3.7: arm maps and staged values
        // back to their exact pre-run values, the onset-held length
        // overrides carried into per-item length overrides exactly
        // as they stand after the ladders, fit registrations
        // cleared) → the
        // E2 gate on the branch's own-cloud crossing number (Q4:
        // repointed from the local xAreaCross area, which is now
        // reported secondary only), exact-float improve-or-hold.
        // Q2 adds a per-phase gate on the same record.cloud
        // readout; its trip consequence is back-up-a-step (ruled
        // 2026-10-28, all phases): the tripping step is discarded,
        // the last-kept phase snapshot is restored, that level's
        // ladder stops, and the cascade continues — only the final
        // gate still reverts a whole run. Any other failure or
        // exception restores the
        // pre-run snapshot through restore() and verifies the restore
        // canonically; every exit path ends the run context and
        // leaves the branch's fit registry empty.
import {
    dkMedian,
    dkRange,
    DK_SHRINK_STEPS_FIXED,
    DK_LADDER_MAX_STAGES,
    dkLadderSteps,
    dkLadderValue,
    dkFitDeviationCount,
    dkDeliveredItemRadius,
    dkDeliveredRadii,
    dkBranchTaxonomy,
    dkBakeGate,
    tallyFitDev,
    clearBranchFit,
    diagRound,
    diagCameraText,
    yieldNow,
    witnessFrameSeq,
    witnessLastFrame,
    throwBracketBefore,
    diagPrePaintHub,
    resetWitnessState,
    witnessSubs,
    witnessFrame,
    witnessRestore,
    witnessPaintedFrame,
    diagClosingLines,
    diagPause,
    throwBracketPoint,
    focusThrowedActiveNode,
    diagText,
    witnessFinalJudge,
    diagCaptureView,
    witnessJudge,
    dkPaintedNodeCentre,
    dkPaintedStemSeg,
    dkPaintedGeometry,
    diagCamera,
    diagHubIdentity,
    witnessPaintedJudge,
    throwBracketFullPaint,
    diagRegistrySnapshot,
    diagOnDemandPaint,
    diag00Capture,
    throwBracketSnapshot,
    diagSnapshot
} from './02n1-deknotter-diagnostics.js';
import {
    dkValidatePhaseRatios,
    dkComputeLadderSchedule,
    dkConvertRenderedToOverride,
    dkEvaluateCrossingDrop
} from './02n2-deknotter-solver.js';

        let lastKeptSnapshot;
        function captureKept(dk, refreshKeptFit, name) {
            lastKeptSnapshot = dk.snapshot(), refreshKeptFit(dk, name);
        }
        let lastKeptFit;
        function refreshKeptFit(dk, name) {
            const fit = {}, all = dk.fitTargets();
            Object.keys(all).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && (fit[k] = all[k]);
            }), lastKeptFit = fit;
        }
        let mark;
        async function stepFineTuneArm(snapshot, staged, name, tax, runPhase, report, opts, dk, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            mark = dkLog.length;
            const armPatch = dkDeepCloneLayout(snapshot);
            staged.forEach(s => {
                armPatch[s.key] = s.to;
            }), armPatch.branchSpokeAutoShrink[name] = !0, tax.subLabels.forEach(l => {
                armPatch.subcatSpokeAutoShrink[l] = !0;
            }), await runPhase("fine-tune-arm", armPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP), report.fineTune.armPhase = "fine-tune-arm";
            await focusThrowedActiveNode(name);
        }
        function stepLabelCheck() {
            // (1) LABEL CHECK (§5.11): subcategory state maps are
            // keyed by BARE label, so a label borne by two branches is
            // armed in both by any per-branch cascade. Checked across
            // the whole taxonomy; duplicates are reported, and the run
            // may still proceed on that understanding.
            const labelCounts = {};
            h.forEach(b => (b.subcategories || []).forEach(s => {
                labelCounts[s.name] = (labelCounts[s.name] || 0) + 1;
            }));
            const duplicates = Object.keys(labelCounts).filter(l => labelCounts[l] > 1).sort();
                return duplicates;
            }
        function restoreKept(forFinal, dk, snapshot, name) {
            if (typeof dkCtx !== "undefined" && dkCtx) {
                dkCtx.isRestoring = !0;
                dkCtx.phaseStartedAt = 0;
            }
            try {
                dk.restore(lastKeptSnapshot || snapshot);
            } finally {
                if (typeof dkCtx !== "undefined" && dkCtx) dkCtx.isRestoring = !1;
            }
            // The final phase deliberately cleared this
            // branch's fit registrations before committing;
            // a backed-up final restores the kept LAYOUT
            // only and never re-arms what the final patch
            // disarmed. Every other phase restores its kept
            // fit registrations with its layout.
            if (!forFinal && lastKeptFit) {
                clearBranchFit(dk, name);
                Object.keys(lastKeptFit).forEach(k => dk.setFitTarget(k, lastKeptFit[k]));
            }
        }
        function stepPreconditions(api, report) {
            // (2) PRECONDITIONS (§5.6): the choreography assumes
            // collision mode 'grow', staggerDensity off (it makes
            // yr() ignore the branch length override entirely),
            // and the branch fully rendered (expandAll). A
            // violated value is STAGED: recorded here, written by
            // the throw commit below, covered by the pre-run
            // snapshot taken next, and restored by the final
            // patch or by a revert. Never proceeded on silently.
            const before = api.get(), staged = [];
            "grow" !== before.collision && staged.push({ key: "collision", from: before.collision, to: "grow" }), !1 !== before.staggerDensity && staged.push({ key: "staggerDensity", from: before.staggerDensity, to: !1 }), !0 !== before.expandAll && staged.push({ key: "expandAll", from: before.expandAll, to: !0 });
            report.preconditionsStaged = staged;
            return staged;
        }
        let snapshot;
        async function stepBaseline(dk, report, name) {
            snapshot = dk.snapshot();
            report.baseline.first = await dk.measureCloud(name), report.baseline.second = await dk.measureCloud(name), report.baseline.variance = Math.abs(report.baseline.first - report.baseline.second);
            // STAGED SCORING (ruled 2026-11-02, Jason): the SAME
            // pre-run geometry also measured under the shrink-stage
            // composition (same-branch plus radial neighbours), so
            // the final gate — which judges after the switch —
            // compares like with like: descent and judge agree at
            // every stage. baseline.first above stays the run-start
            // (same-branch-only) value the per-phase gate chain and
            // the fine-tune decision read.
            try {
                const adjBase = sxCrossingStagedCloud(name, !0);
                null != adjBase && Number.isFinite(adjBase) && (report.baseline.adjacentFirst = adjBase, report.stagedScoring.baselineAdjacent = adjBase);
            } catch (e) {}
            // Q4: every NEIGHBOR cloud's crossing number at
            // baseline, reported-not-gated (the annealed branch
            // itself is excluded; its values are
            // baseline/finalCloud). The baseline's former
            // secondary xAreaCross readout was removed with the
            // area observation (M1); its commented-out copy was
            // deleted with the rest in 2026-10-30.
            try {
                const allBase = await dk.measureCloudsAll(), nb = {};
                Object.keys(allBase).forEach(k => {
                    k !== name && (nb[k] = allBase[k]);
                }), report.neighbors.baseline = nb;
            } catch (e) {}
            const preDelivered = dkDeliveredRadii(name);
            report.coverage.actedOn = Object.keys(preDelivered.items).length;
            return preDelivered;
        }
        function stepOnsetSetup(name, fineTuneActive, report) {
            // COLLISION-ONSET RULE (Jason, 2026-10-24): the
            // shrink ladders below run "until colliding", judged
            // on the branch cloud's hybrid crossing number. The
            // BASELINE is that number in the THROWN state,
            // captured here — immediately after the throw commit,
            // before any shrink stage — and held for the whole
            // run. The readout is the metric dropdown's own
            // computation (window.__sxCrossingMeasure, the port
            // readout behind defs.crossingnumber.clouds), keyed
            // by branch name; it is a read-only measurement for
            // the onset rule ONLY and never feeds any gate
            // readout. Null when the readout is unavailable —
            // onset then never trips this run.
            const onsetCrossing = () => {
                try {
                    const m = "function" == typeof window.__sxCrossingMeasure ? window.__sxCrossingMeasure() : null, v = m && m.clouds ? Number(m.clouds[name]) : NaN;
                    return Number.isFinite(v) ? v : null;
                } catch (e) {
                    return null;
                }
            };
            // Skip path: there is no thrown state, so the recorded
            // baseline is the pre-run cascade baseline
            // (report.baseline.first). Phase 4 (2026-11-04): that
            // baseline is report-only. The fine-tune margin and the
            // onset margin are deleted; neither stops a ladder.
            const onsetBaseline = fineTuneActive ? (Number.isFinite(report.baseline.first) ? report.baseline.first : null) : onsetCrossing();
            fineTuneActive ? dkLog.push({ type: "fine-tune-baseline", branch: name, baseline: onsetBaseline }) : (report.onset.baseline = onsetBaseline, dkLog.push({ type: "onset-baseline", branch: name, baseline: onsetBaseline }));
            // Phase 4 (2026-11-04): no margin test. The onset
            // margin and the fine-tune margin are deleted, and the
            // stop-rule selector is gone. This check never stops a
            // ladder. The per-phase gate (SX_SCORE.GATE_TOL, flat 2)
            // inside runPhase is the only stop.
            const onsetCheck = () => !1;
                return onsetCheck;
            }
        async function stepGrowth(report, dk, name, prevPhaseCloud, opts, runPhase, tax, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            report.growth = { dominance: null, factors: [], branchSteps: 0, subcatSteps: 0, skipped: null };
            let standing = null, excluded = null;
            try { standing = await dk.measureCloud(name); } catch (e) { standing = prevPhaseCloud; }
            try {
                const xm = "function" == typeof window.__sxCrossingMeasureExcluded ? window.__sxCrossingMeasureExcluded() : null, v = xm && xm.clouds ? Number(xm.clouds[name]) : NaN;
                excluded = Number.isFinite(v) ? v : null;
            } catch (e) { excluded = null; }
            if (null == standing || null == excluded || !(standing > 0)) {
                report.growth.skipped = null != standing && null != excluded && 0 === standing ? "standing-zero-nothing-to-relieve" : "dominance-unmeasurable", dkLog.push({ type: "growth-skip", branch: name, reason: report.growth.skipped, standing: standing, excluded: excluded });
                return;
            }
            const sameBranch = standing - excluded, share = sameBranch / standing;
            report.growth.dominance = { standing: standing, excluded: excluded, sameBranch: sameBranch, share: share, threshold: SX_SCORE.GROWTH_DOMINANCE }, dkLog.push({ type: "growth-dominance", branch: name, standing: standing, excluded: excluded, sameBranch: sameBranch, share: share, threshold: SX_SCORE.GROWTH_DOMINANCE });
            if (!(share > SX_SCORE.GROWTH_DOMINANCE)) {
                report.growth.skipped = "same-branch-share-not-dominant";
                return;
            }
            // Test-only hook (opts._testGrowthStepFactor): a
            // multiplier on the ladder's step factors, used by
            // the acceptance harness to force an overshooting
            // growth step and prove the back-up. Not part of
            // any production run.
            const testFactor = opts && Number.isFinite(Number(opts._testGrowthStepFactor)) && Number(opts._testGrowthStepFactor) > 0 ? Number(opts._testGrowthStepFactor) : 1, factors = [];
            {
                let f = 1;
                for (let j = 0; j < SX_SCORE.GROWTH_MAX_STEPS; j++) f *= SX_SCORE.GROWTH_STEP, factors.push(Math.min(f, SX_SCORE.GROWTH_CAP) * testFactor);
            }
            report.growth.factors = factors.slice();
            const growthBase = dkDeliveredRadii(name);
            const annotateGrowth = (phaseName, factor) => {
                const rec = report.phases[report.phases.length - 1];
                if (!rec || rec.name !== phaseName) return;
                const nowD = dkDeliveredRadii(name), sR = [], kR = [];
                Object.keys(nowD.items).forEach(k => {
                    const pre = growthBase.items[k], cur = nowD.items[k];
                    if (!(pre > 0) || !Number.isFinite(cur)) return;
                    "subcat" === k.split("|")[0] ? sR.push(cur / pre) : kR.push(cur / pre);
                }), rec.growth = { factor: factor, deliveredBranch: growthBase.branch > 0 && Number.isFinite(nowD.branch) ? nowD.branch / growthBase.branch : null, deliveredSubcatMedian: dkMedian(sR), deliveredKinkMedian: dkMedian(kR) };
            };
            // Branch level: direct length patches on the
            // branch override, the fit-branch ladder's lever.
            const branchBase = dkBakedBranchBase(name), bSnap = dk.snapshot(), bEntry = (bSnap.branchOverrides || {})[name], branchLen0 = bEntry && Number(bEntry.length) > 0 ? Number(bEntry.length) : branchBase, branchHeadroom = 200 / (branchLen0 / branchBase);
            let lastBranchEff = 1;
            for (let j = 0; j < factors.length; j++) {
                const eff = Math.min(factors[j], branchHeadroom);
                if (!(eff > lastBranchEff + 1e-12)) {
                    report.growth.branchCappedByValidation = !0;
                    break;
                }
                const patch = dk.snapshot();
                patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: branchLen0 * eff }), mark = dkLog.length;
                const res = await runPhase("grow-branch-" + (j + 1), patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                annotateGrowth("grow-branch-" + (j + 1), factors[j]), lastBranchEff = eff;
                if (res && res.dkPhaseTripped) break;
                report.growth.branchSteps++;
            }
            // Subcategory level: length patches on every
            // subcategory override of this branch, with the
            // subcategories' fit targets raised by the same
            // factor — the ladder's lever — so the solve
            // delivers the grown radii the final patch then
            // carries through the overrides.
            if (tax.subLabels.length) {
                const sSnap = dk.snapshot(), subLen0 = {}, subBase = {}, subApplied = {};
                tax.subLabels.forEach(l => {
                    const e0 = (sSnap.subcatOverrides || {})[l];
                    subBase[l] = dkBakedSubBase(l), subLen0[l] = e0 && Number(e0.length) > 0 ? Number(e0.length) : subBase[l], subApplied[l] = subLen0[l];
                });
                const fitAll = dk.fitTargets(), subFit0 = {};
                Object.keys(fitAll).forEach(k => {
                    const p = k.split("|");
                    "subcat" === p[0] && p[1] === name && (subFit0[k] = fitAll[k]);
                });
                for (let j = 0; j < factors.length; j++) {
                    let advances = !1;
                    const patch = dk.snapshot();
                    tax.subLabels.forEach(l => {
                        const eff = Math.min(subLen0[l] * factors[j], subBase[l] * 200);
                        eff > subApplied[l] + 1e-12 && (advances = !0), patch.subcatOverrides[l] = Object.assign({}, patch.subcatOverrides[l], { length: eff });
                    });
                    if (!advances) {
                        report.growth.subcatCappedByValidation = !0;
                        break;
                    }
                    Object.keys(subFit0).forEach(k => dk.setFitTarget(k, subFit0[k] * factors[j])), mark = dkLog.length;
                    const res = await runPhase("grow-subcats-" + (j + 1), patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                    tax.subLabels.forEach(l => {
                        const pe = (patch.subcatOverrides || {})[l];
                        pe && Number.isFinite(Number(pe.length)) && (subApplied[l] = Number(pe.length));
                    }), annotateGrowth("grow-subcats-" + (j + 1), factors[j]);
                    if (res && res.dkPhaseTripped) break;
                    report.growth.subcatSteps++;
                }
            } else report.growth.subcatSkipped = "no-subcategories";
            }
        let witnessFinalLastKept;
        let witnessFinalOperation;
        let witnessFinalBefore;
        let witnessPaintedBefore;
        let witnessFinalTripped;
        let witnessFinalAfter;
        let witnessPaintedAfter;
        async function stepFinalPatch(dk, name, opts, report, tax, runPhase, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, diagCaptureFields, witnessTrippingLabel) {
            // (6) FINAL PATCH (§3.7, rewire A — Jason,
            // 2026-10-24): built on the pre-run snapshot, so
            // (a) all four arm maps return to their exact
            // pre-run values and (b) staged precondition values
            // return to pre-run. (c) Each fit item's length
            // override is carried into the patch EXACTLY as it
            // stands in the post-ladder state — no
            // delivered-radius factor multiplication (the
            // growth phase that supplied those factors is
            // removed, with the fit-target recompute whose only
            // consumer it was): a level whose ladder ran to its
            // final stage stands at its restored pre-run
            // length; a level held by onset stands at its held
            // length — in particular the branch override is NOT
            // forced back to its pre-run snapshot value when
            // the branch ladder onset-held above it; and kink
            // overrides stand at their thrown autofit values
            // (3x the kink length), the
            // room this run exists to keep. An entry the
            // post-ladder state lacks is dropped from the patch
            // rather than revived from the snapshot. (d) The
            // branch's fit registrations are cleared before the
            // commit, so the final solve — and the gate
            // measurement after it — runs on the true kept
            // state, unarmed.
            const finalPatch = dkDeepCloneLayout(snapshot), heldState = dk.snapshot();
            Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name).forEach(k => {
                const p = k.split("|");
                if ("subcat" === p[0]) {
                    const cur = heldState.subcatOverrides ? heldState.subcatOverrides[p[2]] : null;
                    cur ? finalPatch.subcatOverrides[p[2]] = Object.assign({}, cur) : delete finalPatch.subcatOverrides[p[2]];
                } else {
                    const id = "child" === p[0] ? p[3] : p[2], cur = heldState.kinkOverrides ? heldState.kinkOverrides[id] : null;
                    cur ? finalPatch.kinkOverrides[id] = Object.assign({}, cur) : delete finalPatch.kinkOverrides[id];
                }
            });
            const heldBranch = heldState.branchOverrides ? heldState.branchOverrides[name] : null;
            heldBranch ? finalPatch.branchOverrides[name] = Object.assign({}, heldBranch) : delete finalPatch.branchOverrides[name];
            // Test-only hook (opts._testFinalPatch): an object
            // merged into the final patch just before it is
            // applied — map values merge per key, scalars
            // replace. The acceptance harness uses it to force a
            // gate failure and prove the full revert. Not part of
            // any production run.
            if (opts && opts._testFinalPatch && "object" == typeof opts._testFinalPatch) Object.keys(opts._testFinalPatch).forEach(k => {
                const tv = opts._testFinalPatch[k];
                if (tv && "object" == typeof tv && !Array.isArray(tv) && finalPatch[k] && "object" == typeof finalPatch[k]) {
                    const merged = {};
                    Object.keys(finalPatch[k]).forEach(ek => {
                        merged[ek] = finalPatch[k][ek];
                    }), Object.keys(tv).forEach(ek => {
                        const ev = tv[ek];
                        merged[ek] = ev && "object" == typeof ev ? Object.assign({}, ev) : ev;
                    }), finalPatch[k] = merged;
                } else finalPatch[k] = tv;
            });
            clearBranchFit(dk, name), mark = dkLog.length;
            const wBeforeFinal = witnessLastFrame;
            // FINAL-STEP WITNESS (extension): name this run's
            // final-step operation and bracket its commit —
            // the last kept phase stands in wBeforeFinal, a
            // fresh frame lands immediately before the commit,
            // and one immediately after it.
            witnessFinalLastKept = wBeforeFinal, witnessFinalOperation = "final patch (pre-run snapshot rebuilt with held lengths carried through, branch fit cleared, committed as the 'final' phase)", witnessFinalBefore = witnessFrame("final-step-before", "final", null, witnessSubs, name, report, dk);
            witnessPaintedBefore = witnessPaintedFrame("before-final-step", witnessFinalOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            const finalRes = await runPhase("final", finalPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
            // STAGED SCORING: finalCloud is judged under the
            // shrink-stage composition; report.delta stays the
            // receipt's displayed difference (final minus the
            // displayed run-start baseline.first), and the gate's
            // judged change rides separately as gateDelta against
            // gateBaseline (set at the gate below from
            // baseline.adjacentFirst, the neighbour-inclusive
            // baseline captured on the pre-run geometry).
            report.finalCloud = await dk.measureCloud(name), report.delta = report.finalCloud - report.baseline.first, report.gateDelta = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.finalCloud - report.baseline.adjacentFirst : report.delta;
            witnessFinalTripped = !!(finalRes && finalRes.dkPhaseTripped), witnessFinalTripped && (witnessFinalOperation += " — the final phase gate-tripped and backed up to the last kept state");
            witnessFinalAfter = witnessFrame("final-step-after", "final", null, witnessSubs, name, report, dk);
            witnessPaintedAfter = witnessPaintedFrame("after-final-step", witnessFinalOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            witnessJudge("final-patch", "final", null, wBeforeFinal, witnessLastFrame, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report);
            // Q4: the final SECONDARY area (reported only), the
            // neighbor clouds' final crossing numbers
            // (reported-not-gated — measured BEFORE the gate
            // below runs, so a reverted run still reports the
            // kept-state candidates it judged), and the PLATEAU
            // record: the plateau copy fires ONLY at crossing
            // exactly 0 — an area improvement with crossing
            // still non-zero never fires it.
            try {
                const allFin = await dk.measureCloudsAll(), nf = {};
                Object.keys(allFin).forEach(k => {
                    k !== name && (nf[k] = allFin[k]);
                }), report.neighbors.final = nf;
            } catch (e) {}
            // Bake gate (M4): dkBakeGate above, the single
            // computation shared by both run endings.
            dkBakeGate(report);
            report.plateau = { metric: "crossingnumber", finalCrossing: report.finalCloud, copyFired: 0 === report.finalCloud };
            // Q2: the run's total fit-deviation count rides on
            // the report so the receipt lead can surface it.
            report.fitDeviationTotal = tallyFitDev(report);
            }
        async function stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // (4) THROW: one commit. The branch is thrown to a
            // delivered distance of 50 center-avatar radii
            // from the center and every subcategory to a
            // delivered segment of 20 radii out from its
            // branch node (the 2026-11-01 center-avatar-radii
            // re-ruling; the subcategory factor is the
            // corrected 20, not the first-said 10; the radii
            // are converted to override lengths below, after
            // the throwFitCap block), every kink autofit to three times its
            // kink (fit) length — 3x (re-ruled 2026-11-02
            // 16:59 CST, Jason; throwFitCap below governs,
            // no kink throw factor caps it),
            // any staged
            // precondition
            // values, and the FULL cascade armed in the same
            // patch — both spoke arm maps, overwriting inherited
            // explicit-false vetoes (restored later from the
            // snapshot).
            mark = dkLog.length;
            // THROW TOPIC AUTOFIT (re-ruled 2026-11-01, Jason —
            // supersedes the 2026-10-31 throw topic cap): in
            // the throw, the kink leaves are not thrown by a
            // radii factor; each one autofits to THREE TIMES
            // its kink length — its fit length x
            // LEAF_FIT_FACTOR (3, re-ruled 2026-11-02 16:59
            // CST, Jason, reversing the same day's 13:11 1x
            // leaf ruling; the shared SHRINK_FLOOR_FACTOR is
            // NOT read here — it stays 1 for the subcategory
            // and category floors only). The value computed here IS the thrown
            // kink length (it governed only as a min-cap
            // against the old THROW_KINK factor before this
            // re-ruling). The fit
            // length in override units is converted from the
            // item's label-fit target (rendered units) through
            // its pre-run delivered radius, exactly as the
            // kink shrink-to-label driver converts its targets
            // (afterLength = curLen x target / delivered), with
            // curLen the pre-run (snapshot) length. The
            // smallest cap across an id's items governs; an
            // item with no computable fit target caps nothing.
            const throwFitCap = {};
            try {
                dkFitBranchItems(name).forEach(w => {
                    const info = dkRadialBaseInfo(w), kind = info.key.split("|")[0];
                    if ("topic" !== kind && "child" !== kind) return;
                    const id = "child" === kind ? (w.child ? w.child.id : null) : (w.topic ? w.topic.id : null);
                    if (null == id) return;
                    const isChild = "child" === kind;
                    const label = isChild ? (w.child ? w.child.label : w.label) : (w.topic ? w.topic.label : w.label);
                    const target = typeof dkNodeNameTarget === "function" ? dkNodeNameTarget(label, isChild, mn.leafOvergrowth) : dkComputeFitTarget(info.key);
                    const delivered = dkDeliveredItemRadius(w), cur = snapshot.kinkOverrides ? snapshot.kinkOverrides[id] : null, curLen = cur && Number(cur.length) > 0 ? Number(cur.length) : 1;
                    if (null == target || !(target > 0) || !Number.isFinite(delivered) || !(delivered > 0)) return;
                    const capLen = curLen * target / delivered;
                    Number.isFinite(capLen) && capLen > 0 && (null == throwFitCap[id] || capLen < throwFitCap[id]) && (throwFitCap[id] = capLen);
                });
            } catch (e) {}
            // THROW RADII CONVERSION (fix, 2026-11-01, Jason —
            // definition settled 04:56 CST after diagnosis
            // c17e4775 CONFIRMED the over-extension): the
            // THROW_BRANCH / THROW_SUBCAT factors count
            // CENTER-AVATAR RADII in world units, not multiples
            // of the baked base. The old code set the branch
            // override to bakedBase x 50 and each subcategory
            // override to bakedBase x 20; a baked base is itself
            // a large multiplier (Bondage ≈ 29.9), so the
            // delivered throw landed tens of times past the
            // ruled distance. The radius R is the center
            // avatar's own circle: the avatar disc radius the
            // Center ring scale slider (mn.centerRingScale —
            // the slider next to the text / font slider) sets,
            // eaBase.photoRadius x centerRingScale(), the same
            // value refreshCenterRing() leaves in ea.photoRadius
            // on every render; it is the fundamental scale of
            // the center avatar. The branch node is thrown to a
            // DELIVERED distance of THROW_BRANCH x R from the
            // center; each subcategory is thrown to a DELIVERED
            // segment of THROW_SUBCAT x R out from its branch
            // node. World targets convert into override lengths
            // with the kink delivered-radius pattern the
            // throwFitCap above already uses (afterLength =
            // curLen x target / delivered), with curLen the
            // pre-run (snapshot) length and delivered the
            // pre-run delivered radius (preDelivered: yr() for
            // the branch, the hub spoke x override for a
            // subcategory segment). An item with no positive
            // pre-run delivered radius is NOT thrown at all:
            // its override is never written, so it keeps its
            // pre-run length, and it is recorded in
            // report.throwRadii as not converted (the old
            // baked-base multiple is never a fallback — it was
            // the over-extension being fixed). The conversion
            // is recorded on report.throwRadii (fields added
            // only) and in the run log.
            const throwCenterRadius = eaBase.photoRadius * centerRingScale();
            const throwBranchTarget = Math.max(preDelivered && Number.isFinite(preDelivered.branch) && preDelivered.branch > 0 ? preDelivered.branch * 1.75 : 0, throwCenterRadius * SX_SCORE.THROW_BRANCH, 100000);
            const throwSubcatTarget = throwCenterRadius * SX_SCORE.THROW_SUBCAT;
            const throwConvert = (curLen, delivered, target) => dkConvertRenderedToOverride(curLen, delivered, target);
            const branchCurEntry = snapshot && snapshot.branchOverrides
                ? snapshot.branchOverrides[name] : null;
            const branchCurLen = branchCurEntry && Number(branchCurEntry.length) > 0
                ? Number(branchCurEntry.length) : 1;
            const throwBranchRaw = throwConvert(branchCurLen,
                preDelivered ? preDelivered.branch : NaN, throwBranchTarget);
            const throwBranchLen = Number.isFinite(throwBranchRaw) && throwBranchRaw > 0
                ? throwBranchRaw : null;
            const throwSubcatLens = {}, throwSubcatSkipped = [];
            tax.subLabels.forEach(l => {
                const curEntry = snapshot && snapshot.subcatOverrides
                    ? snapshot.subcatOverrides[l] : null;
                const curLen = curEntry && Number(curEntry.length) > 0
                    ? Number(curEntry.length) : 1;
                const delivered = preDelivered && preDelivered.items
                    ? preDelivered.items["subcat|" + name + "|" + l] : NaN;
                const subTarget = Math.max(Number.isFinite(delivered) && delivered > 0 ? delivered * 1.5 : 0, throwSubcatTarget);
                const len = throwConvert(curLen, delivered, subTarget);
                if (Number.isFinite(len) && len > 0) throwSubcatLens[l] = len;
                else throwSubcatSkipped.push(l);
            });
            report.throwRadii = {
                centerRadius: throwCenterRadius,
                branchFactor: SX_SCORE.THROW_BRANCH,
                subcatFactor: SX_SCORE.THROW_SUBCAT,
                branchTarget: throwBranchTarget,
                subcatTarget: throwSubcatTarget,
                branchLength: throwBranchLen,
                subcatLengths: throwSubcatLens,
                subcatNotConverted: throwSubcatSkipped
            };
            dkLog.push({
                type: "throw-radii", branch: name,
                centerRadius: throwCenterRadius,
                branchTarget: throwBranchTarget,
                subcatTarget: throwSubcatTarget,
                branchLength: throwBranchLen,
                subcatLengths: throwSubcatLens,
                subcatNotConverted: throwSubcatSkipped
            });
            const throwPatch = dkDeepCloneLayout(snapshot);
            staged.forEach(s => {
                throwPatch[s.key] = s.to;
            });
            // A level whose conversion failed is NOT thrown:
            // its override is simply never written here, so
            // the snapshot clone keeps its pre-run length.
            if (null != throwBranchLen)
                throwPatch.branchOverrides[name] = Object.assign({},
                    throwPatch.branchOverrides[name], { length: throwBranchLen });
            tax.subLabels.forEach(l => {
                if (null != throwSubcatLens[l])
                    throwPatch.subcatOverrides[l] = Object.assign({},
                        throwPatch.subcatOverrides[l], { length: throwSubcatLens[l] });
            });
            tax.kinkIds.forEach(id => {
                // THROW TOPIC AUTOFIT (re-ruled 2026-11-14, Jason):
                // kink leaves auto-fit to 1x their fit target directly
                // at throw onset, eliminating the 3x overgrowth spike.
                const fitCapLen = throwFitCap[id];
                throwPatch.kinkOverrides[id] = Object.assign({}, throwPatch.kinkOverrides[id], { length: null != fitCapLen && Number.isFinite(fitCapLen) ? fitCapLen : dkBakedKinkBase(id) });
            });
            throwPatch.branchSpokeAutoShrink[name] = !0;
            tax.subLabels.forEach(l => {
                throwPatch.subcatSpokeAutoShrink[l] = !0;
            });
            await runPhase("throw", throwPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
            await focusThrowedActiveNode(name);
            }
        async function stepThrowRepeated(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // THROW REPEAT (ruled 2026-11-06, Jason): the throw
            // step as it exists (stepThrow above — same targets,
            // same factors, nothing about it changed), repeated
            // when it does not clear. The crossing number BEFORE
            // is the run baseline (report.baseline.first,
            // measured twice in stepBaseline under the same
            // own-cloud composition measureCloud reads here —
            // the staged-scoring switch to same-plus-adjacent
            // happens later, at shrink-stage entry, so every
            // reading in this loop is like-for-like). After each
            // throw the standing crossing number is measured
            // fresh; the drop is (before - after) / before. A
            // drop of MORE than SX_SCORE.THROW_REPEAT_DROP
            // (75%) is substantial and stops the repetition;
            // otherwise the throw runs again, up to
            // SX_SCORE.THROW_REPEAT_MAX_EXTRA (3) extra times —
            // four throws total. A throw whose phase gate trips
            // and backs up leaves the last kept geometry
            // standing, and the fresh measurement reads that
            // standing geometry, so a backed-up repeat simply
            // shows no further drop. An unmeasurable crossing
            // (before or after not a positive finite number)
            // cannot be judged, so the loop stops after that
            // throw rather than repeating blind. Every check is
            // recorded in dkLog and on report.throwRepeat
            // (fields added only) for the receipt.
            const throwBefore = (report.fineTune && Number.isFinite(report.fineTune.baseline))
                ? report.fineTune.baseline
                : (report.baseline && Number.isFinite(report.baseline.first) ? report.baseline.first : null);
            const throwRec = { before: throwBefore, attempts: [], throws: 0, substantial: !1, finalAfter: null };
            report.throwRepeat = throwRec;
            for (let attempt = 1; attempt <= 1 + SX_SCORE.THROW_REPEAT_MAX_EXTRA; attempt++) {
                await stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                throwRec.throws = attempt;
                let after = null;
                try { after = await dk.measureCloud(name); } catch (e) { after = null; }
                const evalResult = dkEvaluateCrossingDrop(throwRec.before, after, SX_SCORE.THROW_REPEAT_DROP);
                const drop = evalResult.drop;
                const substantial = evalResult.substantial;
                throwRec.attempts.push({ attempt: attempt, after: after, drop: drop, substantial: substantial });
                throwRec.finalAfter = after, throwRec.substantial = substantial;
                dkLog.push({ type: "throw-repeat-check", branch: name, attempt: attempt, before: throwRec.before, after: after, drop: drop, substantial: substantial });
                if (substantial || null == drop) break;
            }
            if (throwRec.throws > 1) dkLog.push({ type: "throw-repeat", branch: name, throws: throwRec.throws, before: throwRec.before, after: throwRec.finalAfter, substantial: throwRec.substantial });
        }
        let diagPhaseOrdinal;
        let diagPaintCount;
        let diagFitSubcatsCount;
        let diagPaintBase;
        let diagAcceptCtx;
        let prevPhaseCloud;
        let witnessThrown;
        let witnessPaintedLastKept;
        async function runPhase(phaseName, patch, logStart, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // E6: yield at the phase boundary BEFORE the phase's
            // synchronous apply, so UI state set before the call
            // (busy spinner, readout, driven-control refresh) can
            // paint between phases.
            await yieldNow();
            // Q1: heartbeat at the phase's start, so the
            // readout names the phase being solved from its
            // first moment, not only once it commits.
            if (opts && "function" == typeof opts.onHeartbeat) {
                try {
                    opts.onHeartbeat({ phase: phaseName, phaseElapsedMs: 0, iterations: 0 });
                } catch (e) {}
            }
            const res = dk.applyPhase(patch, phaseName);
            if (typeof dkCtx !== "undefined" && dkCtx) dkCtx.phaseStartedAt = 0;
            if (!res || !res.ok) throw new Error("phase '" + phaseName + "' rejected by ratio validation" + (res && res.rejected ? ": " + JSON.stringify(res.rejected) : ""));
            await yieldNow();
            const entries = dkLog.slice(logStart), phaseEntry = entries.find(e => "phase" === e.type && e.phase === phaseName), ratios = phaseEntry ? phaseEntry.ratios : { branch: {}, subcat: {}, kink: {} }, now = dkDeliveredRadii(name), subRatios = [], kinkRatios = [];
            Object.keys(now.items).forEach(k => {
                const pre = preDelivered.items[k], cur = now.items[k];
                if (!(pre > 0) || !Number.isFinite(cur)) return;
                "subcat" === k.split("|")[0] ? subRatios.push(cur / pre) : kinkRatios.push(cur / pre);
            });
            const record = {
                name: phaseName,
                requestedRatios: {
                    branch: null != ratios.branch[name] ? ratios.branch[name] : null,
                    subcatMedian: dkMedian(tax.subLabels.map(l => ratios.subcat[l]).filter(v => null != v)),
                    kinkMedian: dkMedian(tax.kinkIds.map(id => ratios.kink[id]).filter(v => null != v))
                },
                deliveredRatios: {
                    branch: preDelivered.branch > 0 && Number.isFinite(now.branch) ? now.branch / preDelivered.branch : null,
                    subcatMedian: dkMedian(subRatios),
                    kinkMedian: dkMedian(kinkRatios)
                },
                deliveredRanges: { subcat: dkRange(subRatios), kink: dkRange(kinkRatios) },
                limiterHits: entries.filter(e => "phase" !== e.type),
                // STAGED SCORING (ruled 2026-11-02, Jason):
                // the scoring stage this phase's cloud was
                // judged under — false until the whole run
                // enters its shrink stage, true from the
                // first shrink phase on.
                stagedAdjacent: !!(sxAnnealStageCtx && sxAnnealStageCtx.adjacent),
                cloud: null
            };
            // Q2: this phase's fit-deviation count, broken
            // out of the limiter hits so it can be surfaced
            // per phase and in the receipt lead.
            record.fitDeviationCount = dkFitDeviationCount(record.limiterHits);
            // Cascade containment (Stage 3, T6): the phase
            // commit's scoped outcome — declared ring,
            // frozen count, dropped counters, boundary
            // count, or the declared fallback when a commit
            // ran unscoped — rides in the phase record
            // beside the limiter hits. (The full boundary
            // log stays in dkLog's "scoped-apply" entry,
            // which the limiter-hit slice above carries.)
            record.scoped = res && res.scoped ? {
                scoped: res.scoped.scoped,
                ring: res.scoped.ring,
                frozenCount: res.scoped.frozenCount,
                dropped: res.scoped.dropped,
                boundaryCount: (res.scoped.boundaryLog || []).length,
                fallback: res.scoped.fallback
            } : null;
            // E6: the phase's running cloud value, when the
            // metric hook can supply it. Q4: record.cloud is
            // the DECIDER — the branch's own-cloud crossing
            // number via the repointed measureCloud readout.
            // (The phase's former xAreaCross ride-along was
            // removed from observation with the area metric,
            // M1 2026-10-29; its commented-out copy was deleted
            // in 2026-10-30.)
            try { record.cloud = await dk.measureCloud(name); } catch (e) { record.cloud = null; }
            report.phases.push(record);
            // DIAG-00 / REGISTRY / ON-DEMAND PAINT (ruled
            // 2026-11-01, Jason): the registry snapshot logs
            // here — after the commit and the cloud
            // measurement, BEFORE the gate decision below,
            // so tripped stages are snapshotted too — and
            // the on-demand full paint fires here on its
            // exact trigger: the 3rd runPhase commit of the
            // fit-subcats ladder, and every 5th runPhase
            // commit thereafter counting across ALL ladders
            // (throw excluded; the count is the runPhase
            // ordinal, not a per-node stage number), painted
            // after commit/measurement and before the gate
            // decision, tripped stages included. The registry
            // snapshot is measurement only; the paint is
            // gated by opts.onDemandFullPaint (session-only,
            // default OFF) and changes no decision input.
            diagPhaseOrdinal += 1;
            const diagStamp = "runPhase-" + diagPhaseOrdinal + ":" + phaseName;
            if (opts && opts.diag00) { try { diagRegistrySnapshot(diagStamp, diagPhaseOrdinal, phaseName, patch, record, now, prevPhaseCloud, dk, name, tax, report); } catch (e) {} }
            if ("throw" !== phaseName) {
                diagPaintCount += 1;
                let diagTrigger = !1;
                if (/^fit-subcats-\d+$/.test(phaseName)) { diagFitSubcatsCount += 1; if (3 === diagFitSubcatsCount) { diagTrigger = !0, diagPaintBase = diagPaintCount; } } else if (null != diagPaintBase && diagPaintCount > diagPaintBase && 0 === (diagPaintCount - diagPaintBase) % 5) diagTrigger = !0;
                if (diagTrigger && opts && opts.onDemandFullPaint) { try { await diagOnDemandPaint(diagStamp, diagPaintCount, phaseName, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
            }
            // E6: opts.onPhase fires after the phase commits,
            // with the phase's summary (phase name, requested /
            // delivered ratios, limiter hits, running cloud).
            // A throwing callback is logged, never fatal.
            if (opts && "function" == typeof opts.onPhase) {
                try {
                    await opts.onPhase({ phase: record.name, name: record.name, branch: name, requestedRatios: record.requestedRatios, deliveredRatios: record.deliveredRatios, deliveredRanges: record.deliveredRanges, limiterHits: record.limiterHits, cloud: record.cloud, fitDeviationCount: record.fitDeviationCount, scoped: record.scoped || null });
                } catch (e) {
                    dkLog.push({ type: "onphase-error", phase: record.name, message: String(e && e.message || e) });
                }
            }
            // Q2 PER-PHASE GATE, trip consequence ruled
            // 2026-10-28 (BACK-UP-A-STEP, all phases): this
            // phase's cloud metric against the previous kept
            // phase's (the baseline for the first phase), on
            // the existing record.cloud readout. A regression
            // beyond tolerance — flat GATE_TOL (2) — no longer unwinds the run:
            // the tripping step is discarded, the last-kept
            // phase snapshot is restored (the pre-run
            // snapshot only if nothing has committed yet),
            // and the caller stops that level's ladder while
            // the cascade continues to the next level. The
            // trip and its back-up are recorded on the phase
            // record and the report (tripped ratios, restored
            // ratios, backed-up flag); the final
            // improve-or-hold gate below still judges the
            // end state exactly as before and is the only
            // whole-run revert left.
            if (null != prevPhaseCloud && null != record.cloud && Number.isFinite(prevPhaseCloud) && Number.isFinite(record.cloud)) {
                const gateTol = SX_SCORE.GATE_TOL;
                if (record.cloud > prevPhaseCloud + gateTol) {
                    const trippedRatios = { requested: record.requestedRatios, delivered: record.deliveredRatios };
                    // BACK-OUT CONFIRMATION GATE (ruled 2026-11-01,
                    // Jason): when the shell supplies
                    // opts.onBackoutGate, a trip in THIS branch
                    // (category) shrink ladder — phase fit-branch-*
                    // only; subcategory / kink / growth / final
                    // trips never reach this gate — PAUSES here,
                    // BEFORE restoreKept reverts any geometry, and
                    // asks. The tripped trial geometry stands on
                    // screen while the confirmation is open; the
                    // phase budget is only polled inside a phase's
                    // iterations, so no timeout can fire while the
                    // run waits. The gate info carries a code
                    // naming this exact check in code (runPhase's
                    // per-phase gate trip, ahead of restoreKept),
                    // the branch, the phase, and the crossing
                    // before (last kept) and after (tripped).
                    // ACCEPT (or no gate supplied, or the gate
                    // callback failing): exactly today's path —
                    // restoreKept below reverts to the last kept
                    // shape and the caller ends the run as a
                    // category back-out. REJECT: restoreKept is
                    // NOT called — the tripped trial geometry is
                    // left standing — and the returned marker
                    // (dkGateRejected) makes the caller end the
                    // run on the rejection, with no growth, no
                    // final patch and no final gate after it.
                    let gateCode = null, gateDecision = null;
                    if (/^fit-branch-\d+$/.test(phaseName) && opts && "function" == typeof opts.onBackoutGate) {
                        gateCode = "ANNEAL-BO-01 · runPhase per-phase gate → restoreKept · " + phaseName;
                        try { gateDecision = await opts.onBackoutGate({ code: gateCode, branch: name, phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol }); } catch (e) { gateDecision = null; }
                        dkLog.push({ type: "backout-gate", phase: phaseName, code: gateCode, decision: "reject" === gateDecision ? "rejected" : "accepted", prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol });
                        report.backoutGate = { code: gateCode, branch: name, phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol, decision: "reject" === gateDecision ? "rejected" : "accepted" };
                    }
                    if (gateCode && "reject" !== gateDecision) {
                        diagAcceptCtx = { phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol };
                        await diagPause("ANNEAL-DIAG-01", "Accept \u2192 restoreKept", undefined, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                    }
                    if ("reject" === gateDecision) {
                        record.phaseGate = { prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !1, gated: !0, decision: "rejected", code: gateCode, trippedRatios: trippedRatios }, report.phaseGate = { phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !1, gated: !0, decision: "rejected", code: gateCode, trippedRatios: trippedRatios };
                        const standingNow = dkDeliveredRadii(name);
                        standingNow.dkPhaseTripped = !0, standingNow.dkGateRejected = !0;
                        return standingNow;
                    }
                    restoreKept("final" === phaseName, dk, snapshot, name);
                    await diagPause("ANNEAL-DIAG-02", "restoreKept \u2192 closing full paint", undefined, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                    const restoredNow = dkDeliveredRadii(name), rSub = [], rKink = [];
                    Object.keys(restoredNow.items).forEach(k => {
                        const pre = preDelivered.items[k], cur = restoredNow.items[k];
                        if (!(pre > 0) || !Number.isFinite(cur)) return;
                        "subcat" === k.split("|")[0] ? rSub.push(cur / pre) : rKink.push(cur / pre);
                    });
                    const restoredRatios = {
                        branch: preDelivered.branch > 0 && Number.isFinite(restoredNow.branch) ? restoredNow.branch / preDelivered.branch : null,
                        subcatMedian: dkMedian(rSub),
                        kinkMedian: dkMedian(rKink)
                    };
                    let restoredCloud = null;
                    try { restoredCloud = await dk.measureCloud(name); } catch (e) { restoredCloud = null; }
                    record.phaseGate = { prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !0, trippedRatios: trippedRatios, restoredRatios: restoredRatios, restoredCloud: restoredCloud }, report.phaseGate = { phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !0, trippedRatios: trippedRatios, restoredRatios: restoredRatios, restoredCloud: restoredCloud };
                    dkLog.push({ type: "phase-gate-backup", phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, restoredCloud: restoredCloud });
                    witnessRestore("gate-backup-restored", phaseName, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                    restoredNow.dkPhaseTripped = !0;
                    return restoredNow;
                }
            }
            null != record.cloud && Number.isFinite(record.cloud) && (prevPhaseCloud = record.cloud);
            captureKept(dk, refreshKeptFit, name);
            const wFrame = witnessFrame("phase-kept", phaseName, now, witnessSubs, name, report, dk);
            "throw" === phaseName && (witnessThrown = wFrame.subs);
            // PAINTED-GEOMETRY WITNESS: the last kept phase's
            // painted capture. During the run the full-map
            // DOM still holds the last full paint (interim
            // commits paint only the capsule approximation),
            // so this frame records the painted domain as it
            // stands at this phase — the divergence between
            // it and the bookkeeping frame above is itself
            // recorded, and the decisive painted frames are
            // the closing-paint and settle frames in the
            // finally block.
            witnessPaintedLastKept = witnessPaintedFrame("last-kept:" + phaseName, "phase commit '" + phaseName + "' kept (interim capsule domain; full-map DOM holds the last full paint)", dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            return now;
        }
        let witnessTrippingLabel;
        async function stepShrinkLadders(name, report, dk, fineTuneActive, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, opts, tax, diagCaptureFields, onsetCheck) {
            // (5) RULED SHRINK SEQUENCE (Jason, 2026-10-24
            // adjustment — supersedes the 08:05 order and every
            // earlier ordering; one-at-a-time step-down added
            // 2026-10-31, Jason). After the throw, shrink in
            // exactly this order: (1) the subcategory nodes
            // step down ONE AT A TIME within the branch, each
            // in geometric fashion down to THREE TIMES its
            // kink length (3x its fit target —
            // SHRINK_FLOOR_FACTOR, ruled 2026-11-01, Jason)
            // or until collisions start, in
            // which case it backs up a step and the next node
            // takes its turn; (2) the same step-down process
            // is then repeated for the category — the main
            // branch steps down geometrically to its floor,
            // backing up a step when collisions start. There
            // is NO kink shrink stage: kinks keep their thrown,
            // fit-capped lengths (the fit cap at 3x the kink
            // length since the 2026-11-01 ruling), and no code
            // here restores kink overrides to pre-run lengths.
            // Each ladder descends in square-root steps
            // (dkLadderSteps / dkLadderValue — step sizes in
            // proportion to the square root of the steps
            // remaining, largest first, fixed count landing
            // exactly on the floor; ruled 2026-11-02, Jason),
            // one committed sub-solve per stage,
            // stopping at its floor OR at collision onset (see
            // the onset rule above), whichever comes first.
            // Fit targets are FLOORS, not ceilings: every item
            // is first PINNED at its thrown radius, and only
            // its own ladder's stages advance it, so no stage
            // can chop a later node early or grow an item up
            // to a floor computed at thrown geometry. A node
            // whose ladder runs to its final stage also
            // restores its own length override at that stage
            // (an entry the snapshot lacks is removed) — the
            // old shorten commit's job, distributed per node;
            // for subcategories the restored value is the
            // fit-derived floor, not the pre-run snapshot
            // value (lever unification, ruled 2026-11-01
            // 20:25, Jason — see runLadder and the
            // fit-subcats restore below); the branch
            // ladder in step (2) IS the branch level's
            // restore, taken in log stages rather than one
            // commit. A node held by onset backs up a stage
            // (step-four ruling, 2026-10-31 — see onsetBackUp
            // below), so the lengths of the stage before the
            // tripping one stand. (On the skip-throw path
            // under 5 this back-up now applies too — re-ruled
            // 2026-11-01, Jason; see onsetBackUp's call sites
            // in the ladders below.) The cascade stays armed throughout.
            const restoreLen = (map, key, snapMap) => {
                null != snapMap && Object.prototype.hasOwnProperty.call(snapMap, key) ? map[key] = Object.assign({}, snapMap[key]) : delete map[key];
            };
            dk.armFitForBranch(name);
            const fullFitTargets = {}, stageFrom = {}, fitNow = dk.fitTargets();
            Object.keys(fitNow).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && (fullFitTargets[k] = fitNow[k]);
            }), dkFitBranchItems(name).forEach(w => {
                const k = dkRadialBaseInfo(w).key;
                Number.isFinite(w.cloudRadius) && (stageFrom[k] = w.cloudRadius);
            }), Object.keys(fullFitTargets).forEach(k => {
                Number.isFinite(stageFrom[k]) && dk.setFitTarget(k, stageFrom[k]);
            });
            // Back-up-a-step fit coherence: the armed + pinned
            // registry above is the fit state the first ladder
            // stage builds on, so it becomes the kept fit state
            // paired with the post-throw kept layout — a first
            // stage trip then restores a registry the rest of
            // the cascade (and the final patch's carry) can
            // still read, not the empty pre-arming one.
            refreshKeptFit(dk, name);
            // STEP-FOUR BACK-UP (ruled 2026-10-31, Jason): in
            // the shrink step, when collisions start — the
            // onset hold trips — the stage backs up a stage:
            // the last-kept state from BEFORE the tripping
            // stage is restored (layout and fit registrations
            // together), the ladder stops, and the cascade
            // proceeds from the backed-up state. This applies
            // to BOTH levels — the subcategory ladder and the
            // category (branch) ladder. It replaces the older
            // onset rule under which the tripping stage's
            // commit stood. The fine-tune skip path was
            // formerly excepted (its tripping commit stood);
            // the 2026-11-01 skip-throw re-ruling removed
            // that exception — the ladders call this on the
            // skip path too, so a subcategory back-out backs
            // up a step there exactly as here. An onset
            // back-up is NOT a category back-out: it never
            // sets branchBackedOut and never ends the run.
            const onsetBackUp = async (levelName, stage, keptBefore) => {
                lastKeptSnapshot = keptBefore.snap, lastKeptFit = keptBefore.fit, restoreKept(!1, dk, snapshot, name);
                let restoredCloud = null;
                try { restoredCloud = await dk.measureCloud(name); } catch (e) { restoredCloud = null; }
                null != restoredCloud && Number.isFinite(restoredCloud) && (prevPhaseCloud = restoredCloud);
                const holdsArr = fineTuneActive ? report.fineTune.holds : report.onset.holds, lastHold = holdsArr[holdsArr.length - 1];
                lastHold && (lastHold.backedUp = !0, lastHold.restoredCloud = restoredCloud);
                const rec = report.phases[report.phases.length - 1];
                rec && rec.onsetHold && (rec.onsetHold.backedUp = !0, rec.onsetHold.restoredCloud = restoredCloud);
                rec && rec.fineTuneHold && (rec.fineTuneHold.backedUp = !0, rec.fineTuneHold.restoredCloud = restoredCloud);
                witnessRestore("onset-backup-restored", levelName + "-" + stage, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                dkLog.push({ type: "onset-backup", level: levelName, stage: stage, restoredCloud: restoredCloud });
            };
            const runLadder = async (levelName, keys, restore, floors) => {
                if (!keys.length) return;
                // ONE AT A TIME (ruled 2026-10-31, Jason): the
                // level's nodes step down one at a time, not
                // in lockstep — each node descends its own
                // ladder in square-root steps (dkLadderSteps /
                // dkLadderValue, one
                // committed sub-solve per stage) all the way
                // down to its floor — for subcategories, THREE
                // TIMES its own length (SHRINK_FLOOR_FACTOR,
                // ruled 2026-11-01, Jason) — before the next
                // node starts. When collisions
                // start on a node's ladder — the onset hold
                // trips — that node backs up a step
                // (onsetBackUp, the step-four ruling) and its
                // ladder stops; the next node then takes its
                // turn from the backed-up state. A per-phase
                // gate trip likewise ends only that node's
                // ladder. At a node's final stage its own
                // length override is restored to its pre-run
                // snapshot value (restore(patch, k) below).
                let stageNo = 0;
                for (const k of keys) {
                    const floorFor = floors && null != floors[k] ? floors[k] : fullFitTargets[k], isSub = "subcat" === k.split("|")[0], subLabel = isSub ? k.split("|")[2] : null;
                    let outcome = null, stagesRun = 0;
                    // 3X-FLOOR ATTEMPT PRE-CHECK (repair,
                    // 2026-11-01; floors re-ruled to 3x the same
                    // day; override floor unified with the fit
                    // floor 2026-11-01 20:25, Jason): a
                    // subcategory is held without
                    // a ladder only when BOTH of its levers are
                    // already at their floors — its fit radius
                    // at or below THREE TIMES its name length
                    // AND its length override at or below the
                    // fit-derived floor (oFloorFor below: that
                    // same 3x name-length fit floor converted
                    // into override units).
                    // A node with no thrown radius and no
                    // override to step down is likewise recorded,
                    // never passed over in silence.
                    const curSnap0 = isSub ? dk.snapshot() : null, thrownEntry = curSnap0 && curSnap0.subcatOverrides ? curSnap0.subcatOverrides[subLabel] : null, thrownLen = thrownEntry && Number(thrownEntry.length) > 0 ? Number(thrownEntry.length) : NaN, preEntry = isSub && snapshot.subcatOverrides ? snapshot.subcatOverrides[subLabel] : null, preLen = preEntry && Number(preEntry.length) > 0 ? Number(preEntry.length) : (isSub ? dkBakedSubBase(subLabel || "") : NaN), fitSteps = Number.isFinite(stageFrom[k]) && Number.isFinite(floorFor) && floorFor < stageFrom[k] ? dkLadderSteps(stageFrom[k], floorFor) : 0;
                    // LEVER UNIFICATION (ruled 2026-11-01
                    // 20:25 CST, Jason): the fit lever and the
                    // override lever do the same job and are
                    // now the same thing — ONE floor, the
                    // fit-length floor (floorFor: THREE TIMES
                    // the name length), drives both. The
                    // override's floor is DERIVED from that
                    // fit floor through the item's pre-run
                    // delivered radius, exactly as the branch
                    // ladder's floor and the kink
                    // shrink-to-label driver convert a
                    // rendered fit target into an override
                    // length (afterLength = curLen x target /
                    // delivered, with curLen the pre-run
                    // length — preLen here — and delivered
                    // the pre-run delivered segment,
                    // preDelivered.items[k] here). The
                    // override lever's old separate floor —
                    // THREE TIMES the pre-run length — is
                    // retired for subcategories: with the
                    // paint following the override
                    // (segment = pre-override length x
                    // override, floored at 430 in drawH /
                    // capture), that separate floor stopped
                    // the painted segment at 430 x 3 x the
                    // pre-run length no matter how far the
                    // fit target descended. Derived from the
                    // fit floor instead, the override descends
                    // in lockstep with the fit target, and at
                    // the floor the painted segment stands at
                    // the fit-derived length (the fit floor
                    // itself, through the paint's own
                    // pre-override length). When the
                    // conversion inputs are not all finite
                    // and positive the derived floor is NaN
                    // and the override ladder does not run
                    // for that node (the fit ladder still
                    // does); every rendered subcategory has a
                    // pre-run delivered radius, so this is a
                    // guard, not an expected path.
                    const oFloorFor = isSub && Number.isFinite(preLen) && preLen > 0 && Number.isFinite(floorFor) && floorFor > 0 && preDelivered && preDelivered.items && Number.isFinite(Number(preDelivered.items[k])) && Number(preDelivered.items[k]) > 0 ? preLen * floorFor / Number(preDelivered.items[k]) : NaN, oSteps = Number.isFinite(thrownLen) && Number.isFinite(oFloorFor) && thrownLen > oFloorFor ? dkLadderSteps(thrownLen, oFloorFor) : 0;
                    if (isSub && floors) {
                        if (!Number.isFinite(stageFrom[k]) && oSteps <= 0) outcome = "no-thrown-radius"; else if (!Number.isFinite(floorFor) && oSteps <= 0) outcome = "no-floor-target"; else if (fitSteps <= 0 && oSteps <= 0) outcome = "held-at-1x-floor";
                    }
                    if (!outcome) {
                    const fitStages = Math.min(DK_LADDER_MAX_STAGES, fitSteps), oStages = Math.min(DK_LADDER_MAX_STAGES, oSteps), stages = Math.max(fitStages, oStages);
                    // ONE LEVER, ONE LADDER (repair,
                    // 2026-11-01; unified 2026-11-01 20:25,
                    // Jason): a subcategory's DRAWN spoke is
                    // its fit radius stepped out by its length
                    // override (renderedSpokeLength multiplies
                    // by the override), so the fit ladder alone
                    // barely moves the visible spoke — the
                    // override is the thrown length (x20 at the
                    // throw). Each stage therefore steps BOTH
                    // writings on their own square-root-step
                    // ladders (dkLadderSteps / dkLadderValue),
                    // in lockstep, toward the ONE floor: the
                    // fit target down to THREE TIMES the NAME
                    // length (SHRINK_FLOOR_FACTOR, ruled
                    // 2026-11-01, Jason), the override down to
                    // oFloorFor — that same fit floor derived
                    // into override units through the item's
                    // pre-run delivered radius (see the
                    // derivation at oFloorFor above) — the
                    // longer ladder setting the stage count
                    // and the shorter holding at its floor
                    // once reached. Before the 2026-11-01
                    // repair the override moved only in the
                    // final stage's restore jump, so a node
                    // held before its final stage (onset or
                    // gate) kept its full thrown override and
                    // stood visibly unshrunk — the long
                    // subcategory branches of the 2026-11-01
                    // inspection. Now a held node stands at
                    // its last kept step, one step above the
                    // tripping stage after the back-up.
                    for (let j = 1; j <= stages; j++) {
                        const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                        witnessTrippingLabel = isSub ? subLabel : null;
                        if (fitSteps > 0) dk.setFitTarget(k, dkLadderValue(stageFrom[k], floorFor, Math.min(j, Math.max(1, fitStages)), Math.max(1, fitSteps)));
                        const patch = dk.snapshot();
                        if (isSub && oSteps > 0 && patch.subcatOverrides) patch.subcatOverrides[subLabel] = Object.assign({}, patch.subcatOverrides[subLabel], { length: dkLadderValue(thrownLen, oFloorFor, Math.min(j, Math.max(1, oStages)), Math.max(1, oSteps)) });
                        j === stages && restore && restore(patch, k), mark = dkLog.length, stageNo += 1, stagesRun = j;
                        const ladderRes = await runPhase(levelName + "-" + stageNo, patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                        // A gate trip AT the final stage is the ruled
                        // completion: the node descended its whole
                        // ladder and stands at its last kept step.
                        // Only a trip before the final stage
                        // leaves the node held above its floor.
                        if (ladderRes && ladderRes.dkPhaseTripped) { outcome = j >= stages ? "reached-1x-floor" : "held-gate"; break; }
                        // Phase 4 (2026-11-04): onsetCheck is a no-op.
                        // The onset and fine-tune margins are deleted.
                        // Only the per-phase gate above rejects a stage.
                        onsetCheck(levelName, stageNo);
                    }
                    if (isSub && floors && !outcome) outcome = "reached-1x-floor";
                    }
                    if (isSub && floors) {
                        // The record reports the OVERRIDE
                        // writing — the thrown length that
                        // actually renders (thrown x20 down to
                        // oFloorFor, the fit-derived floor) —
                        // with the fit lever's 3x name target
                        // kept alongside as fitFloor. (Before
                        // the 2026-11-01 20:25 unification the
                        // reported floor was the override's own
                        // separate 3x pre-run floor.)
                        const rec = { key: k, label: subLabel || k, from: Number.isFinite(thrownLen) ? thrownLen : (Number.isFinite(stageFrom[k]) ? stageFrom[k] : null), floor: Number.isFinite(oFloorFor) ? oFloorFor : (Number.isFinite(floorFor) ? floorFor : null), fitFrom: Number.isFinite(stageFrom[k]) ? stageFrom[k] : null, fitFloor: Number.isFinite(floorFor) ? floorFor : null, stages: stagesRun, outcome: outcome || "reached-1x-floor", standing: (outcome && 0 === outcome.indexOf("held") && Number.isFinite(thrownLen) && oSteps > 0) ? dkLadderValue(thrownLen, oFloorFor, Math.max(0, stagesRun - 1), Math.max(1, oSteps)) : (Number.isFinite(thrownLen) ? thrownLen : null) };
                        report.subcatShrink.push(rec), dkLog.push(Object.assign({ type: "subcat-shrink-attempt" }, rec));
                    }
                }
            };
            const ladderKeys = Object.keys(fullFitTargets).filter(k => Number.isFinite(stageFrom[k]));
            // EVERY RENDERED SUBCATEGORY IS ATTEMPTED (repair,
            // ruled 2026-11-01 01:44, Jason): the attempt list
            // is built from the branch's rendered subcategory
            // items, not only from the fit keys that happened
            // to arm — a subcategory whose fit target could not
            // be computed still gets a 3x-length floor and a
            // recorded attempt in runLadder, so no rendered
            // subcategory can pass through the cascade
            // unattempted and unrecorded. The floor for this
            // level is THREE TIMES the NAME length
            // (dkNameFitTargetForKey x SHRINK_FLOOR_FACTOR,
            // ruled 2026-11-01, Jason — superseding the 1x
            // name-length floor of 2026-11-01 01:44), not the
            // neighbour-pitch fit target in
            // fullFitTargets: in a crowded fan that target can
            // sit at or above the thrown radius and hold the
            // node at its thrown length. A subcategory that
            // never armed is pinned at its thrown radius here,
            // exactly as the armed items are pinned above, so
            // its ladder's first stage has a starting target.
            // Generalized dynamic depth floor: scales label length with depth ladder
            const subcatKeys = [], subcatFloors = {};
            dkFitBranchItems(name).forEach(w => {
                if (!w.topic || !w.topic.isSubcategory) return;
                const k = dkRadialBaseInfo(w).key;
                if (subcatKeys.indexOf(k) >= 0) return;
                subcatKeys.push(k);
                const nt = dkNameFitTargetForKey(k);
                // DYNAMIC DEPTH FLOOR: 3x the name length (SHRINK_FLOOR_FACTOR) scaled with depth
                const depthScale = typeof sxFontFactor === "function" ? sxFontFactor(2) : 1;
                const subcatFitFloor1x = null != nt && Number.isFinite(nt) ? nt * SX_SCORE.SHRINK_FLOOR_FACTOR * depthScale : (null != fullFitTargets[k] && Number.isFinite(fullFitTargets[k]) ? fullFitTargets[k] * SX_SCORE.SHRINK_FLOOR_FACTOR * depthScale : fullFitTargets[k]);
                subcatFloors[k] = subcatFitFloor1x;
                if (null == fullFitTargets[k] && Number.isFinite(stageFrom[k])) dk.setFitTarget(k, stageFrom[k]), fullFitTargets[k] = stageFrom[k];
            });
            // Ruled step (1) (one at a time, ruled 2026-10-31,
            // Jason): the subcategory nodes step down FIRST,
            // one at a time — each node descends its own
            // geometric ladder to its 3x floor (three times
            // its own length — SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason) before the next node starts,
            // onset-held: when collisions start on a node's
            // ladder it backs up a step (onsetBackUp inside
            // runLadder) and the next node takes its turn.
            // Kinks have no ladder at all — they keep their
            // thrown, fit-capped lengths (cap at 3x the kink
            // length). The final-stage restore below stands
            // the override at the FIT-DERIVED floor — the
            // node's 3x name-length fit floor (subcatFloors)
            // converted through its pre-run delivered
            // radius with the snapshot entry's length (or
            // the baked base when the snapshot carries
            // none) as curLen — the same derived value the
            // ladder's last stage writes (lever
            // unification, ruled 2026-11-01 20:25, Jason;
            // it replaces the restore's former THREE TIMES
            // the pre-run length, the override lever's old
            // separate floor). When the conversion inputs
            // are unavailable for a node the former 3x
            // pre-run value stands as the guard fallback.
            await runLadder("fit-subcats", subcatKeys, (patch, k) => { const l = k.split("|")[2]; if (null != l) { const se = snapshot.subcatOverrides ? snapshot.subcatOverrides[l] : null, sb = se && Number(se.length) > 0 ? Number(se.length) : dkBakedSubBase(l); const ff = subcatFloors ? subcatFloors[k] : null, pd = preDelivered && preDelivered.items ? Number(preDelivered.items[k]) : NaN, derived = sxLenConvert(sb, pd, ff); patch.subcatOverrides[l] = Object.assign({}, se || {}, { length: Number.isFinite(derived) && derived > 0 ? derived : sb * SX_SCORE.SHRINK_FLOOR_FACTOR }); } }, subcatFloors);
            // Ruled step (2): the branch's own length override
            // descends geometrically from its thrown length to
            // its pre-run length (the baked base when the
            // snapshot carries no override for it), onset-held:
            // a stage whose commit trips onset is the branch
            // ladder's last. (Step-four back-up, ruled
            // 2026-10-31: that stage now backs up a stage —
            // the previous stage's length stands and the
            // final patch below carries THAT through. Before
            // this ruling the tripping stage's length stood.)
            // TERMINATION FLAG (ruled 2026-10-28, Jason 23:43,
            // scope confirmed 23:49): a per-phase GATE trip in
            // THIS branch (category) ladder — a back-out, where
            // runPhase discarded the tripping stage and restored
            // the last-kept snapshot — is reported to the caller
            // as branchBackedOut, and the caller ENDS the run on
            // it (no growth, no final patch, no final gate; the
            // backed-out state stands). An ONSET hold in this
            // ladder is NOT a back-out (the tripping commit
            // stands, nothing is restored) and never sets this
            // flag; a subcategory-ladder back-out never sets it
            // either — runLadder's trips stay inside that level
            // and the cascade proceeds to this ladder as before.
            let branchBackedOut = !1, branchGateRejected = !1;
            const branchCur = (dk.snapshot().branchOverrides || {})[name], branchSnap = snapshot.branchOverrides ? snapshot.branchOverrides[name] : null;
            let branchFrom = branchCur ? Number(branchCur.length) : NaN, branchTo = branchSnap && Number(branchSnap.length) > 0 ? Number(branchSnap.length) : dkBakedBranchBase(name);
            // BRANCH LABEL-FIT FLOOR (first ruled 2026-10-29
            // 04:57 for the fine-tune skip path; generalized to
            // every run 2026-10-31, Jason): the ladder descends
            // toward the pre-run length by default, but Jason's
            // shrink rule is that it tries to shrink all the way
            // to the length of the category name — so this floor
            // now applies on every run, not only when the branch
            // starts at its pre-run length. The floor is
            // label-fit TIMES THREE (SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason — superseding the 1x floor):
            // three times the length of the branch's longest
            // kink name, from the existing label-fit mechanism
            // (dkComputeFitTarget — the item's own label measured
            // at its actual render font, font-relative). UNITS,
            // flagged as the ruling requires: fit targets are
            // RENDERED lengths in map units, while a branch
            // length override is a dimensionless multiplier on
            // the branch's delivered radius (yr) — the code's
            // units genuinely differ, so the floor converts
            // through the pre-run delivered branch radius exactly
            // as the existing kink shrink-to-label driver
            // converts its targets (afterLength = curLen x
            // target / delivered), with curLen the PRE-RUN length
            // (branchTo's value here, before the floor lowers
            // it). The governing item is the branch item with
            // the largest label-fit target: the branch spoke must
            // stay long enough that that kink's label still fits.
            // At 1x this floor could sit at or above the
            // pre-run length and the ladder then simply did
            // not run; at 3x the floor is the level's target
            // wherever it lands — the ladder descends to it
            // from the thrown length, and a branch standing
            // below it is set to it by the single-step path
            // below, exactly as the old pre-run target was.
            // The
            // descent still stops before the floor whenever
            // collisions start: the onset rule holds the level
            // when the cloud's crossing number rises (the
            // readout counts every crossing involving the
            // cloud's spokes — same-branch or foreign, any type
            // of collision), and a per-phase gate trip backs out
            // one step and ends the run per the termination
            // ruling above.
            {
                try {
                    let ftTarget = null, ftLabel = null;
                    dkFitBranchItems(name).forEach(w => {
                        const t = dkComputeFitTarget(dkRadialBaseInfo(w).key);
                        if (null != t && Number.isFinite(t) && (null == ftTarget || t > ftTarget)) {
                            ftTarget = t, ftLabel = w.child ? w.child.label : w.topic ? w.topic.label : w.label;
                        }
                    });
                    const ftCurLen = branchTo, ftDelivered = preDelivered.branch;
                    if (null != ftTarget && Number.isFinite(ftDelivered) && ftDelivered > 0 && ftCurLen > 0) {
                        // CATEGORY FLOOR = 3 x the category
                        // (label-fit) length: the 1x floor
                        // converted as before, times
                        // SHRINK_FLOOR_FACTOR. This ftFloor
                        // becomes branchTo below — the endpoint
                        // the branch ladder descends to via
                        // dkLadderSteps(branchFrom, branchTo) /
                        // dkLadderValue(branchFrom, branchTo, ...).
                        const ftFloor1x = ftCurLen * ftTarget / ftDelivered;
                        const ftFloor = ftFloor1x * SX_SCORE.SHRINK_FLOOR_FACTOR;
                        report.fineTune.branchFloor = { label: ftLabel || null, targetMapUnits: ftTarget, deliveredBranchMapUnits: ftDelivered, preRunLength: ftCurLen, floorLength: ftFloor, floorFactor: SX_SCORE.SHRINK_FLOOR_FACTOR };
                        dkLog.push({ type: "fine-tune-branch-floor", branch: name, label: ftLabel || null, target: ftTarget, delivered: ftDelivered, floorLength: ftFloor, floorFactor: SX_SCORE.SHRINK_FLOOR_FACTOR });
                        Number.isFinite(branchFrom) || (branchFrom = ftCurLen), ftFloor > 0 && (branchTo = ftFloor);
                    }
                } catch (e) {}
            }
            // 3X FLOOR FALLBACK (ruled 2026-11-01, Jason):
            // when no label-fit target could be computed
            // above, the category floor is three times the
            // branch's own pre-run length instead — the same
            // 3x rule on the only category length available.
            if (!(report.fineTune && report.fineTune.branchFloor) && Number.isFinite(branchTo) && branchTo > 0) branchTo = branchTo * SX_SCORE.SHRINK_FLOOR_FACTOR;
            // STAGED SCORING SWITCH (moved 2026-11-13, Jason —
            // SUPERSEDES the 2026-11-02 ruling that flipped it at
            // shrink-stage entry): the neighbour-inclusive score
            // (same-plus-adjacent, radial neighbours) belongs ONLY
            // to the LAST shrink stage — the category/branch shrink
            // below (fit-branch-*), the zeroth/first-level node.
            // The subcategory shrink ladder above is judged
            // same-branch-only (adjacent stays false through
            // fit-subcats-*). Entering the branch ladder flips the
            // run's judged score to same-plus-adjacent, and the
            // per-phase gate's reference is RE-BASED on the current
            // (last-kept) geometry under the new composition, so
            // the first branch phase is judged against the same
            // composition it is scored under — descent and judge
            // agree across the switch. Every later judged read in
            // the run (branch phases, back-out restored readings,
            // the final patch's measurement and the final gate)
            // uses the new composition through measureCloud.
            if (sxAnnealStageCtx && sxAnnealStageCtx.branch === name) {
                sxAnnealStageCtx.adjacent = !0;
                if (!report.stagedScoring.adjacentFromPhase) report.stagedScoring.adjacentFromPhase = "fit-branch-1";
                dkLog.push({ type: "staged-scoring-switch", branch: name, stage: "same-plus-adjacent", at: "branch-shrink-entry" });
                try {
                    const rebased = await dk.measureCloud(name);
                    null != rebased && Number.isFinite(rebased) && (prevPhaseCloud = rebased, report.stagedScoring.rebasedAtShrinkEntry = rebased);
                } catch (e) {}
            }
            if (Number.isFinite(branchFrom) && branchFrom > branchTo) {
                const bStages = Math.min(DK_LADDER_MAX_STAGES, Math.max(1, dkLadderSteps(branchFrom, branchTo)));
                for (let j = 1; j <= bStages; j++) {
                    const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                    witnessTrippingLabel = null;
                    const patch = dk.snapshot();
                    patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: dkLadderValue(branchFrom, branchTo, j, bStages) }), mark = dkLog.length;
                    const branchRes = await runPhase("fit-branch-" + j, patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                    if (branchRes && branchRes.dkPhaseTripped) { branchBackedOut = !0, branchRes.dkGateRejected && (branchGateRejected = !0); break; }
                    // Phase 4 (2026-11-04): onsetCheck is a no-op.
                    // Only the per-phase gate trip above ends this ladder.
                    onsetCheck("fit-branch", j);
                }
            } else if (Number.isFinite(branchFrom) && branchFrom !== branchTo) {
                const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                witnessTrippingLabel = null;
                const patch = dk.snapshot();
                patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: branchTo }), mark = dkLog.length;
                const branchRes1 = await runPhase("fit-branch-1", patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                if (branchRes1 && branchRes1.dkPhaseTripped) branchBackedOut = !0, branchRes1.dkGateRejected && (branchGateRejected = !0); else onsetCheck("fit-branch", 1); // no-op; gate above is the only stop
            }
                return { branchBackedOut: branchBackedOut, gateRejected: branchGateRejected };
            }
        async function dkRunCascade(branchName, opts) {
            resetWitnessState();
            const api = window.__SEXCAPADES_LAYOUT_API, dk = api.deknotter, name = null == branchName ? "" : String(branchName), tax = dkBranchTaxonomy(name);
            // F4 STEP 1a — label check (see the §5.11 note inside).
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
                // — null-filled on a normal (throw) run; on a skip
                // run it carries the decision baseline, the arm
                // phase, the fine-tune holds, and the branch floor.
                fineTune: null,
                // STAGED SCORING (ruled 2026-11-02, Jason): this run's
                // scoring-stage record — the stage in force at run
                // start, the run-level switch point, the adjacent-
                // composition baseline captured on the pre-run
                // geometry for the final gate, and the phase the
                // switch landed in. Fields added only.
                stagedScoring: { stageAtStart: "same-branch-only", switchPoint: "branch-shrink-entry", adjacentFromPhase: null, baselineAdjacent: null },
                growth: null,
                // SUBCAT SHRINK ATTEMPTS (repair, 2026-11-01): one
                // record per rendered subcategory of this branch —
                // thrown radius, 3x length floor, stages run,
                // and the outcome (reached / held and why) — so a
                // run's receipt can prove every subcategory was
                // attempted and name any that was held.
                subcatShrink: [],
                // WITNESS DISCRIMINATOR (ruled 2026-11-01, Jason;
                // scope ruling 04:29 CST): per-subcategory delivered
                // radii captured frame by frame across every
                // back-out / restore of this run, judged ONLY
                // against the eyewitness hypothesis — a back-out
                // discarding per-subcategory shrink gains wholesale
                // (report.witness; helpers below). Fields added
                // only; no H1/H2/H3 fields are recorded.
                witness: { hypothesis: "wholesale-backout-discard", frames: [], events: [], verdict: "not-run", culprit: null, finalStep: null },
                // THROW RADII (conversion fix, 2026-11-01): the
                // throw's center-avatar radius, its world targets,
                // and the override lengths stepThrow converted
                // them into — recorded by stepThrow, null on a
                // skip-throw run. Fields added only.
                throwRadii: null,
                // Q4: the gate's decider is the branch's own-cloud
                // crossing number — baseline/finalCloud/delta below
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
                // live code — see the single record at measureCloud
                // below. In their place the report carries bakeGate
                // (M4): the total crossing number (this cloud plus
                // every neighbor cloud, combined) before -> after,
                // passing only when its increase is strictly less
                // than SX_SCORE.BAKE_GATE_LIMIT — reported for the
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
            // category back-out ending and the final patch) — the
            // limit and the comparison were previously written out
            // twice, once per ending. It sums the total crossing
            // number — this cloud plus every neighbor cloud,
            // combined — before and after, and passes only when the
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
            // context opens, with one ordinary full paint — the
            // session's documented end ("any non-scoped paint") —
            // so its 20 s settle-guard timer can never fire
            // mid-run and fight the cascade's interim solves (the
            // guard's restore paints would replay a pre-session
            // capture over the run's delivered registry). With no
            // session active, nothing extra is painted.
            if (blitSess) {
                try {
                    Mr({
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
            // ONLY the eyewitness report — the cloud scooches in
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
            // moves — above all one it returns to its thrown
            // delivered radius when that subcategory was not the
            // tripping one — is the wholesale discard the witness
            // describes, and witnessJudge names it per event.
            const WITNESS_EPS = .02, WITNESS_ONE_STEP = 1.115;
            witnessLastFrame = null; witnessFrameSeq = 0; witnessThrown = null; witnessTrippingLabel = null;
            // FINAL-STEP WITNESS EXTENSION (ruled 2026-11-01,
            // Jason; refinement 07:30 CST): the eyewitness report
            // refined — the run pulls in almost perfectly until
            // the LAST step, and the last step flings the
            // subcategories back out. The back-out judge above
            // never sees that step: its last frame is the final
            // patch commit and its verdict is computed before the
            // closing full paint. This extension captures one
            // frame further, only around the final step: the
            // last kept phase, immediately before and after the
            // final patch commit, and one frame after the
            // closing full paint (in the finally block, once that
            // paint — settle search included — has run), and
            // judges each of those two transitions on its own:
            // a subcategory that grows past one ladder step
            // (WITNESS_ONE_STEP) across either transition was
            // flung, not stepped; two or more at once, or any
            // one returned to its thrown length, is the
            // wholesale fling the witness describes, and the
            // record names the transition — final patch commit
            // or closing full paint — that did it. Frames are
            // held by direct reference on report.witness
            // .finalStep, so the 600-frame cap on the frames
            // array can never drop them. Observational only,
            // exactly like the judge above: nothing here writes
            // layout state, fit state, or any gate input.
            witnessFinalLastKept = null; witnessFinalBefore = null; witnessFinalAfter = null; witnessFinalOperation = null; witnessFinalTripped = !1;
            // FINAL-STEP WITNESS judge (extension above): one
            // transition of the final step, before-frame against
            // after-frame. There is no tripping subcategory at
            // the final step — nothing there is entitled to move
            // a subcategory outward past one step — so any
            // subcategory that does is recorded as flung, with
            // its before / after delivered radii, the override
            // lengths standing at both frames, and whether it
            // landed back at its thrown delivered radius.
            // PAINTED-GEOMETRY WITNESS EXTENSION (ruled 2026-11-01,
            // Jason, 08:00 CST — painted-geometry witness extension):
            // the final-step witness above reads dkDeliveredRadii —
            // solve/override BOOKKEEPING. Jason's eyewitness report
            // on the Impact run (receipt: final-step witness HELD)
            // is that the subcategories were nevertheless flung back
            // out on the last frame he SAW. Taken at his word, the
            // fling either happens after the frame the bookkeeping
            // witness measures, or the last paint renders
            // differently from the radii it measures — a MEASUREMENT
            // DIVERGENCE the bookkeeping witness cannot see by
            // construction. This extension extends the witness one
            // visual frame further, in the painted domain: it reads
            // the ACTUAL PAINTED SVG GEOMETRY (node positions via
            // each icon's own getCTM chain — the same rendered read
            // the settle guard's sgCaptureRenderedCenters uses —
            // with the painted stem path's endpoints as the only
            // fallback when the CTM read fails; data-layout-x/y is
            // never substituted, and a node neither painted source
            // can read is recorded not-observed), and records, for
            // EVERY subcategory of the run's branch (all 7 on
            // Impact, pain & body modification; generic over any
            // branch — Bondage and Sex acts run through this same
            // code), THREE separate numbers per subcategory:
            //   branchR — centre to branch node (branch delivered
            //             radius, painted);
            //   seg     — branch node to subcategory node
            //             (subcategory segment length, painted);
            //   absR    — centre to subcategory node (absolute
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
                // the registry fields the capture consumed — the
                // closing solve reassigns dkLastBranches, so reading
                // them at pause time would give closing-time values.
                let diagCaptureFields = null;
                // HUB LOGGING (diagnostic-only, ruled 2026-11-01, per
                // HUB-SIDE-DIAGNOSIS.md): the painted hub seat read at
                // DIAG-02 — the last pause before the closing full
                // paint — stashed so DIAG-03 can print the pre-paint
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
                // capture moment — how many elements carry the hub's
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
                // pure reads — no paint, no settle, no state write —
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
                // the throw / fine-tune arm — the DOM still holds
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
                // delivered radius — plus the phase's gate threshold
                // and verdict and the onset reading and verdict
                // (report-only; the onset check itself still runs in
                // the ladder exactly as before). Registry reads
                // only: no DOM paint, no repaint, no settle, and no
                // state write beyond the record and the log.
                // ONE ON-DEMAND FULL PAINT (Q3 exact trigger wording,
                // implemented in runPhase): one freeze-replay full
                // paint with the run context live (dkCtx untouched),
                // under the closing-paint opClass so the hub snap
                // fires — if the freeze capture is unavailable the
                // paint does not run at all, never under another
                // opClass — with blit starts held and any standing
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
                // no bracket log lines — exactly the pre-edit run.
                // The bracket paint replicates diagOnDemandPaint's
                // discipline exactly: freeze capture +
                // paintComposition centres, the run context live
                // (dkCtx untouched), hub seating only under the
                // closing-paint opClass ("anneal-closing-paint") —
                // if the freeze capture is unavailable the paint
                // does not run at all, never under another opClass —
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
                // provenance — plus the throw's own inputs (centre
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
                // F4 STEP 1b — preconditions: stage any violated choreography
                // values (written by the throw, restored by the final patch).
                const staged = stepPreconditions(api, report);
                // (3) SNAPSHOT + BASELINE: the snapshot is the
                // untouched pre-run state (taken before any staging is
                // applied, so a revert restores the user's real values,
                // staged ones included). The baseline is measured
                // TWICE (§5.8) and the observed variance reported.
                // F4 STEP 2 — snapshot + baseline: snapshot the untouched
                // pre-run state, measure the baseline twice (decider +
                // secondary + neighbors), and capture pre-run delivered radii.
                const preDelivered = await stepBaseline(dk, report, name);
                witnessFrame("pre-run", null, preDelivered, witnessSubs, name, report, dk);
                // DIAG-00 (ruled 2026-11-01, Jason): the pre-run
                // painted-geometry snapshot of the saved layout —
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
                // record.cloud — Q4 repointed that readout to the
                // own-cloud crossing number, not this gate: the
                // comparison and its tolerance below are unchanged
                // and now operate on crossing values.
                prevPhaseCloud = Number.isFinite(report.baseline.first) ? report.baseline.first : null;
                // BACK-UP-A-STEP (ruled 2026-10-28, all phases): the
                // cascade retains the last-kept phase snapshot
                // throughout the run — the layout state and this
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
                // runs through — one applyPhase commit, its record,
                // and the per-phase gate (tolerance SX_SCORE.GATE_TOL,
                // flat 2). The onset margin and the fine-tune margin
                // are deleted.
                mark = dkLog.length;
                // F4 STEP 3 — throw: one commit arming the full cascade at the
                // thrown lengths (factors: SX_SCORE.THROW_*).
                // FINE-TUNE SKIP-THROW DECISION (ruled 2026-10-29,
                // rulings adopted 09:42-09:43): judged HERE — after
                // the baseline step, before the throw — on the
                // CASCADE baseline (report.baseline.first, measured
                // twice in stepBaseline with its variance reported),
                // never on the shell pre-flight's single measure
                // (that measure acts only on exactly zero and is not
                // the fine-tune measure). Baseline STRICTLY below
                // SX_SCORE.FINE_TUNE_BELOW — zero included — takes
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
                const fineTuneActive = Number.isFinite(baselineForThrow) && baselineForThrow < SX_SCORE.FINE_TUNE_BELOW;
                report.fineTune = { active: fineTuneActive, baseline: baselineForThrow, selfBaseline: report.baseline.first, below: SX_SCORE.FINE_TUNE_BELOW, margin: null, armPhase: null, holds: [], branchFloor: null };
                fineTuneActive && dkLog.push({ type: "fine-tune-skip-throw", branch: name, baseline: baselineForThrow, below: SX_SCORE.FINE_TUNE_BELOW });
                if (!fineTuneActive) {
                    if (sxAnnealStageCtx && sxAnnealStageCtx.branch === name) {
                        sxAnnealStageCtx.adjacent = !0;
                        report.stagedScoring.adjacentFromPhase = "throw";
                        dkLog.push({ type: "staged-scoring-switch", branch: name, stage: "same-plus-adjacent", at: "throw-entry" });
                    }
                    if (Number.isFinite(baselineForThrow)) {
                        prevPhaseCloud = baselineForThrow;
                    }
                }
                // FINE-TUNE STAGING-AND-ARMING COMMIT (skip path,
                // ruling 6 — full arming mirroring the throw minus
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
                // ruled 2026-11-06), on the throw path only — a skip-throw
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
                // F4 STEP 4 — onset setup still records the thrown-state
                // baseline (pre-run baseline on the skip path). Phase 4
                // (2026-11-04): no hold threshold. The onset margin and
                // the fine-tune margin are deleted. The per-phase gate
                // (flat GATE_TOL 2) is the only stop.
                const onsetCheck = stepOnsetSetup(name, fineTuneActive, report);
                // F4 STEP 5 — shrink ladders: subcategory level first, then the
                // branch level. The per-phase gate inside runPhase is the
                // only stop; the onset and fine-tune margins are deleted.
                // EXPLANATION STEP THREE IS COMMENTED OUT (ruled
                // 2026-10-31, Jason): the explanation's step three
                // — a separate geometric step-down stage — and its
                // step four — the shrink — were duplicating each
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
                // the backed-out state's own measurements — finalCloud
                // / delta (decider) and the secondary area, measured
                // on the state that stands — under its own gate value
                // ("ended-at-category-backout", neither the final
                // gate's "kept" nor its "reverted") with the early
                // end stated plainly in the reason, so the receipt
                // never presents this outcome as a final-gate result.
                // The block then runs the DISARM cleanup (ruled
                // 2026-10-29): the temporary staging the final patch
                // would have taken down is restored there instead —
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
                // above, so nothing was reverted — the tripped trial
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
                    // displays as the run's start — report.delta is
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
                    // path, so the cleanup it normally performs —
                    // taking the cascade's temporary staging down —
                    // runs HERE, after the backed-out state's
                    // measurements above are taken, as a plain
                    // restore, NOT as a phase: no "final" phase
                    // record, no runPhase commit, no gate. The
                    // concrete armed/staged state it clears, all of
                    // it written by the throw commit and the shrink
                    // ladders and left standing by restoreKept when
                    // the branch ladder backed out: (1) the two
                    // spoke auto-shrink arm maps at the keys the throw
                    // armed — branchSpokeAutoShrink[name], and for
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
                    // gate-revert catch clears them too — only this
                    // early-end path left them armed). The disarm
                    // patch is the CURRENT (backed-out) state with
                    // only (1) and (2) overwritten from the pre-run
                    // snapshot — an arm key the snapshot lacks is
                    // deleted, exactly restoring its absence — so
                    // every length override (branch / subcat /
                    // kink) and every other field stands exactly as
                    // backed out. (3) is NOT cleared before the
                    // restore (DISARM FIX, ruled 2026-11-01, Jason):
                    // the compact kept shape lives in those fit
                    // targets — an unarmed re-solve starts every
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
                        // clear them after it — clearing a target
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
                // F4 STEP 5b — growth: scoped same-branch growth
                // (ruled 2026-10-28), after the shrink ladders and
                // before the final patch. Growth arrives ONLY as
                // cascade ratio patches through runPhase — the
                // relaxation engines still never grow and the
                // repulsion descent's grow flag stays off. A cloud
                // grows only when same-branch pairs contribute more
                // than half its standing E: standing E is the
                // cascade's own crossing readout, excluded E is the
                // same readout under the existing same-branch
                // exclusion flag, and the difference is the
                // same-branch contribution. Levels run outermost
                // first (branch, then subcategories); there is no
                // kink growth — growing kink leaves never reduces
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
                // explanation step five — "Fit and growth" — is
                // out. The growth phase no longer runs in the
                // cascade. The stepGrowth definition above is kept
                // in the code, not deleted, and its invocation is
                // commented out, not removed:
                // if (!endedAtCategoryBackout) await stepGrowth();
                // F4 STEP 6 — final patch: build the kept state on the pre-run
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
                // branch's own-cloud CROSSING NUMBER (Q4 decider —
                // baseline.first / finalCloud carry crossing values
                // via the repointed readout; the xAreaCross area is
                // reported secondary above and never gates). A kept
                // run must also
                // provably differ from the pre-run snapshot — a
                // "kept" run whose final state is the snapshot kept
                // nothing.
                // STAGED SCORING (ruled 2026-11-02, Jason): the final
                // gate is the same judge as the descent — it judges the
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
                // such on the report — phase and the phase's
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
                // approximation (see Mr) — paint the full map ONCE
                // here, at the run's end state: kept, ended-early,
                // or reverted alike (on a revert the catch above
                // has already restored the pre-run snapshot, so
                // this paints the state that actually stands).
                // The context is closed first, so this paint is
                // the run's terminal paint, settle search included.
                // ONE CLOSING REPAINT (ruled 2026-11-01, Jason —
                // supersedes the split closing paint this block
                // carried: a freeze-replay paint for the category
                // back-out ending and the ordinary paint for kept
                // and reverted endings): there is exactly ONE
                // closing repaint here, regardless of how the run
                // gets here — kept, ended-early (category back-out
                // included), reverted, aborted or cancelled alike —
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
                // cascade just stood at — on a revert the catch
                // above has already restored the pre-run snapshot
                // and re-solved to it, so the replay carries that
                // restored state, not the discarded run. The mode
                // is chosen BEFORE any paint runs: only when the
                // freeze capture itself is unavailable (no
                // delivered branches or centres to replay) does
                // the one repaint run as the ordinary paint — a
                // paint that has run is never followed by a second
                // closing repaint, on any ending, for any failure.
                // The repaint is terminal: any blit session left
                // over from the run's scoped interim paints is
                // ended BEFORE it (so the paint-top gate's
                // same-frozen-set path can never carry a session
                // through it), blit session starts are held off
                // for its duration (sgHoldBlitStart, exactly as
                // sgRestorePaint holds them — an all-frozen paint
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
                    closingPaintResult = Mr({
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
                // is read from — or cleared off — the painted map.
                try {
                    if (closingPaintResult && "function" == typeof closingPaintResult.then) await Promise.race([ closingPaintResult, new Promise(r => setTimeout(r, 900)) ]);
                    else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                } catch (e) {}
                try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-anneal-closing-paint-blit-end", e); }
                dkLog.push({ type: "closing-paint", branch: name, mode: closingPaintMode, gate: report.gate, endedEarly: !!report.endedEarly, opClass: "anneal-closing-paint" });
                // CAPSULE WIPE GATED ON FULL-PAINT COMPLETION
                // (Fix 2, ruled 2026-11-01, Jason): the interim
                // capsule layer's published live-number anchor is
                // cleared only HERE — after the one closing repaint
                // above has landed — never before it. Clearing it
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
                // back-out judge could never take — every
                // subcategory's delivered radius and override as
                // they stand AFTER the closing full paint above,
                // the state the user actually sees when the run
                // ends. Both final-step transitions are judged
                // here (the final patch commit, bracketed in
                // stepFinalPatch; and the closing sequence —
                // context close plus this paint, settle search
                // included — against the last frame taken before
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
                // frame / settle — a chunked closing paint's
                // in-flight promise first (raced against a bound so
                // a throttled frame can never hang the receipt),
                // then a double requestAnimationFrame with a timer
                // fallback (the house yield pattern) — and captures
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
                // run's ending. Additive only — report.witness
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
                // the kept geometry in the DOM — DIAG-03's
                // painted==stored capture on Jason's acceptance
                // drive proved that — yet his end frame still
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
                    const tailPaintResult = Mr({ animate: !1, forceRepaint: !0 });
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
