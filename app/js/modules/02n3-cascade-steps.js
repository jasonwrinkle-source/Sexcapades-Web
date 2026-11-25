        // DeKnotter cascade driver (E5, ASSESSMENT §3.4, §3.7, §5.6,
        // §5.8, §5.11): one full run for one branch, driven entirely
        // through the bundle layout API - never the editor shell's
        // collect()/apply - so no intermediate state is broadcast to
        // other windows mid-run. Sequence: subcategory-label check →
        // precondition staging → snapshot + double baseline → throw
        // (branch x50, subcategories x20, kinks autofit to
        // three times their kink (fit) length - full cascade
        // armed, ONE applyPhase commit) →
        // FINE-TUNE (ruled 2026-10-29): when the
        // cascade baseline (measured twice, above) is strictly below
        // 5, zero included, the throw is SKIPPED - a staging-and-
        // arming commit lands the throw's staged values and full
        // arming minus its length changes, the shrink ladders run
        // from the branch's current lengths under the per-phase
        // gate only (flat GATE_TOL 2; the fine-tune margin and the
        // onset margin were deleted Phase 4, 2026-11-04 - the
        // skip-throw under 5 is unchanged), and the branch ladder
        // descends to a
        // label-fit floor instead of stopping at the pre-run length
        // → ruled shrink sequence (Jason,
        // 2026-10-24 adjustment: subcategory nodes first, then the
        // branch itself, each level descending a square-root-step ladder of
        // committed sub-solves toward its label-fit floor under the
        // per-phase gate (flat 2) - a level's ladder halts when that
        // gate trips, and the cascade proceeds to the
        // next level; there is NO kink shrink stage in the cascade -
        // kinks keep their thrown autofit room (3x the kink
        // length, 2026-11-01); the kink shrink to
        // label length is a separate one-time driver normalization,
        // deknotter.shrinkKinksToLabel) → scoped same-branch GROWTH
        // (ruled 2026-10-28: grow-branch then grow-subcats ratio
        // patches, dominance-gated, laddered at 1.25x steps to a 3x
        // cumulative target - see stepGrowth in dkRunCascade) → a
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
        // ladder stops, and the cascade continues - only the final
        // gate still reverts a whole run. Any other failure or
        // exception restores the
        // pre-run snapshot through restore() and verifies the restore
        // canonically; every exit path ends the run context and
        // leaves the branch's fit registry empty.

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
            // the final gate - which judges after the switch -
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
            // captured here - immediately after the throw commit,
            // before any shrink stage - and held for the whole
            // run. The readout is the metric dropdown's own
            // computation (window.__sxCrossingMeasure, the port
            // readout behind defs.crossingnumber.clouds), keyed
            // by branch name; it is a read-only measurement for
            // the onset rule ONLY and never feeds any gate
            // readout. Null when the readout is unavailable -
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
            // factor - the ladder's lever - so the solve
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
            // (6) FINAL PATCH (§3.7, rewire A - Jason,
            // 2026-10-24): built on the pre-run snapshot, so
            // (a) all four arm maps return to their exact
            // pre-run values and (b) staged precondition values
            // return to pre-run. (c) Each fit item's length
            // override is carried into the patch EXACTLY as it
            // stands in the post-ladder state - no
            // delivered-radius factor multiplication (the
            // growth phase that supplied those factors is
            // removed, with the fit-target recompute whose only
            // consumer it was): a level whose ladder ran to its
            // final stage stands at its restored pre-run
            // length; a level held by onset stands at its held
            // length - in particular the branch override is NOT
            // forced back to its pre-run snapshot value when
            // the branch ladder onset-held above it; and kink
            // overrides stand at their thrown autofit values
            // (3x the kink length), the
            // room this run exists to keep. An entry the
            // post-ladder state lacks is dropped from the patch
            // rather than revived from the snapshot. (d) The
            // branch's fit registrations are cleared before the
            // commit, so the final solve - and the gate
            // measurement after it - runs on the true kept
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
            // applied - map values merge per key, scalars
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
            // final-step operation and bracket its commit -
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
            // (reported-not-gated - measured BEFORE the gate
            // below runs, so a reverted run still reports the
            // kept-state candidates it judged), and the PLATEAU
            // record: the plateau copy fires ONLY at crossing
            // exactly 0 - an area improvement with crossing
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
        async function stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP, attempt = 1) {
            // (4) THROW: one commit. The branch is thrown to a
            // delivered distance of 50 center-avatar radii
            // from the center and every subcategory to a
            // delivered segment of 20 radii out from its
            // branch node (the 2026-11-01 center-avatar-radii
            // re-ruling; the subcategory factor is the
            // corrected 20, not the first-said 10; the radii
            // are converted to override lengths below, after
            // the throwFitCap block), every kink autofit to three times its
            // kink (fit) length - 3x (re-ruled 2026-11-02
            // 16:59 CST, Jason; throwFitCap below governs,
            // no kink throw factor caps it),
            // any staged
            // precondition
            // values, and the FULL cascade armed in the same
            // patch - both spoke arm maps, overwriting inherited
            // explicit-false vetoes (restored later from the
            // snapshot).
            mark = dkLog.length;
            // THROW TOPIC AUTOFIT (re-ruled 2026-11-01, Jason -
            // supersedes the 2026-10-31 throw topic cap): in
            // the throw, the kink leaves are not thrown by a
            // radii factor; each one autofits to THREE TIMES
            // its kink length - its fit length x
            // LEAF_FIT_FACTOR (3, re-ruled 2026-11-02 16:59
            // CST, Jason, reversing the same day's 13:11 1x
            // leaf ruling; the shared SHRINK_FLOOR_FACTOR is
            // NOT read here - it stays 1 for the subcategory
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
            // THROW RADII CONVERSION (fix, 2026-11-01, Jason -
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
            // Center ring scale slider (mn.centerRingScale -
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
            // baked-base multiple is never a fallback - it was
            // the over-extension being fixed). The conversion
            // is recorded on report.throwRadii (fields added
            // only) and in the run log.
            const throwCenterRadius = eaBase.photoRadius * centerRingScale();
            const attemptMultiplier = 1 + (attempt - 1) * 0.35;
            const throwBranchTarget = Math.max(preDelivered && Number.isFinite(preDelivered.branch) && preDelivered.branch > 0 ? preDelivered.branch * 1.75 : 0, throwCenterRadius * SX_SCORE.THROW_BRANCH, 120000) * attemptMultiplier;
            const throwSubcatTarget = throwCenterRadius * SX_SCORE.THROW_SUBCAT * attemptMultiplier;
            const throwConvert = (curLen, delivered, target) => dkConvertRenderedToOverride(curLen, delivered, target);
            const branchCurEntry = snapshot && snapshot.branchOverrides
                ? snapshot.branchOverrides[name] : null;
            const branchCurLen = branchCurEntry && Number(branchCurEntry.length) > 0
                ? Number(branchCurEntry.length) : 1;

            // Calculate required branch override to actually deliver throwBranchTarget in world units:
            // yr(branchObj) = Math.max(SX_MIN_BRANCH_THROW, 1450 * spokeLen * manualFactor * stag * coll + extra)
            let throwBranchRaw = NaN;
            try {
                const branchObj = h.find(b => b.name === name);
                const nIdx = Math.max(0, h.indexOf(branchObj));
                const stag = (typeof mn !== "undefined" && mn.stagger) ? (nIdx % 2 ? 1.18 : 0.82) : 1;
                const coll = 1.3; // staged "grow" collision factor during throw
                const spokeBase = 1450 * ((typeof mn !== "undefined" && Number(mn.spokeLen)) || 1) * stag * coll;
                const extra = (Number(branchObj && branchObj._spokeAdjust20) || 0) + (typeof pr !== "undefined" && pr.categoryIcon ? pr.categoryIcon / 2 : 132) + 30;
                if (spokeBase > 0) {
                    throwBranchRaw = Math.max(branchCurLen * (1.6 + (attempt - 1) * 0.35), (throwBranchTarget - extra) / spokeBase);
                }
            } catch (_) {}
            if (!Number.isFinite(throwBranchRaw) || throwBranchRaw <= 0) {
                throwBranchRaw = throwConvert(branchCurLen, preDelivered ? preDelivered.branch : NaN, throwBranchTarget);
            }
            if (!Number.isFinite(throwBranchRaw) || throwBranchRaw <= 0) {
                throwBranchRaw = branchCurLen * (1.6 + (attempt - 1) * 0.35);
            }
            const throwBranchLen = Math.min(195, Math.max(branchCurLen * 1.5, throwBranchRaw));

            const throwSubcatLens = {}, throwSubcatSkipped = [];
            tax.subLabels.forEach(l => {
                const curEntry = snapshot && snapshot.subcatOverrides
                    ? snapshot.subcatOverrides[l] : null;
                const curLen = curEntry && Number(curEntry.length) > 0
                    ? Number(curEntry.length) : 1;
                const delivered = preDelivered && preDelivered.items
                    ? preDelivered.items["subcat|" + name + "|" + l] : NaN;
                const subTarget = Math.max(Number.isFinite(delivered) && delivered > 0 ? delivered * (1.6 + (attempt - 1) * 0.25) : 0, throwSubcatTarget);
                let len = throwConvert(curLen, delivered, subTarget);
                if (!Number.isFinite(len) || len <= 0) len = curLen * (1.6 + (attempt - 1) * 0.25);
                const effLen = Math.min(195, Math.max(curLen * 1.4, len));
                throwSubcatLens[l] = effLen;
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
            if (typeof window.__sxFocusApproximatedBranch === "function") window.__sxFocusApproximatedBranch(name);
        }
        async function stepThrowRepeated(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // THROW REPEAT (ruled 2026-11-06, Jason): the throw
            // step as it exists (stepThrow above - same targets,
            // same factors, nothing about it changed), repeated
            // when it does not clear. The crossing number BEFORE
            // is the run baseline (report.baseline.first,
            // measured twice in stepBaseline under the same
            // own-cloud composition measureCloud reads here -
            // the staged-scoring switch to same-plus-adjacent
            // happens later, at shrink-stage entry, so every
            // reading in this loop is like-for-like). After each
            // throw the standing crossing number is measured
            // fresh; the drop is (before - after) / before. A
            // drop of MORE than SX_SCORE.THROW_REPEAT_DROP
            // (75%) is substantial and stops the repetition;
            // otherwise the throw runs again, up to
            // SX_SCORE.THROW_REPEAT_MAX_EXTRA (3) extra times -
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
                await stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP, attempt);
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
                // judged under - false until the whole run
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
            // commit's scoped outcome - declared ring,
            // frozen count, dropped counters, boundary
            // count, or the declared fallback when a commit
            // ran unscoped - rides in the phase record
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
            // the DECIDER - the branch's own-cloud crossing
            // number via the repointed measureCloud readout.
            // (The phase's former xAreaCross ride-along was
            // removed from observation with the area metric,
            // M1 2026-10-29; its commented-out copy was deleted
            // in 2026-10-30.)
            try { record.cloud = await dk.measureCloud(name); } catch (e) { record.cloud = null; }
            report.phases.push(record);
            // DIAG-00 / REGISTRY / ON-DEMAND PAINT (ruled
            // 2026-11-01, Jason): the registry snapshot logs
            // here - after the commit and the cloud
            // measurement, BEFORE the gate decision below,
            // so tripped stages are snapshotted too - and
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
            // beyond tolerance - flat GATE_TOL (2) - no longer unwinds the run:
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
            if ("throw" !== phaseName && null != prevPhaseCloud && null != record.cloud && Number.isFinite(prevPhaseCloud) && Number.isFinite(record.cloud)) {
                const gateTol = SX_SCORE.GATE_TOL;
                if (record.cloud > prevPhaseCloud + gateTol) {
                    const trippedRatios = { requested: record.requestedRatios, delivered: record.deliveredRatios };
                    // BACK-OUT CONFIRMATION GATE (ruled 2026-11-01,
                    // Jason): when the shell supplies
                    // opts.onBackoutGate, a trip in THIS branch
                    // (category) shrink ladder - phase fit-branch-*
                    // only; subcategory / kink / growth / final
                    // trips never reach this gate - PAUSES here,
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
                    // callback failing): exactly today's path -
                    // restoreKept below reverts to the last kept
                    // shape and the caller ends the run as a
                    // category back-out. REJECT: restoreKept is
                    // NOT called - the tripped trial geometry is
                    // left standing - and the returned marker
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
            // stands at this phase - the divergence between
            // it and the bookkeeping frame above is itself
            // recorded, and the decisive painted frames are
            // the closing-paint and settle frames in the
            // finally block.
            witnessPaintedLastKept = witnessPaintedFrame("last-kept:" + phaseName, "phase commit '" + phaseName + "' kept (interim capsule domain; full-map DOM holds the last full paint)", dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            return now;
        }
