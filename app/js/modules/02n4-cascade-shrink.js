        let witnessTrippingLabel;
        async function stepShrinkLadders(name, report, dk, fineTuneActive, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, opts, tax, diagCaptureFields, onsetCheck) {
            // (5) RULED SHRINK SEQUENCE (Jason, 2026-10-24
            // adjustment - supersedes the 08:05 order and every
            // earlier ordering; one-at-a-time step-down added
            // 2026-10-31, Jason). After the throw, shrink in
            // exactly this order: (1) the subcategory nodes
            // step down ONE AT A TIME within the branch, each
            // in geometric fashion down to THREE TIMES its
            // kink length (3x its fit target -
            // SHRINK_FLOOR_FACTOR, ruled 2026-11-01, Jason)
            // or until collisions start, in
            // which case it backs up a step and the next node
            // takes its turn; (2) the same step-down process
            // is then repeated for the category - the main
            // branch steps down geometrically to its floor,
            // backing up a step when collisions start. There
            // is NO kink shrink stage: kinks keep their thrown,
            // fit-capped lengths (the fit cap at 3x the kink
            // length since the 2026-11-01 ruling), and no code
            // here restores kink overrides to pre-run lengths.
            // Each ladder descends in square-root steps
            // (dkLadderSteps / dkLadderValue - step sizes in
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
            // (an entry the snapshot lacks is removed) - the
            // old shorten commit's job, distributed per node;
            // for subcategories the restored value is the
            // fit-derived floor, not the pre-run snapshot
            // value (lever unification, ruled 2026-11-01
            // 20:25, Jason - see runLadder and the
            // fit-subcats restore below); the branch
            // ladder in step (2) IS the branch level's
            // restore, taken in log stages rather than one
            // commit. A node held by onset backs up a stage
            // (step-four ruling, 2026-10-31 - see onsetBackUp
            // below), so the lengths of the stage before the
            // tripping one stand. (On the skip-throw path
            // under 5 this back-up now applies too - re-ruled
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
            // paired with the post-throw kept layout - a first
            // stage trip then restores a registry the rest of
            // the cascade (and the final patch's carry) can
            // still read, not the empty pre-arming one.
            refreshKeptFit(dk, name);
            // STEP-FOUR BACK-UP (ruled 2026-10-31, Jason): in
            // the shrink step, when collisions start - the
            // onset hold trips - the stage backs up a stage:
            // the last-kept state from BEFORE the tripping
            // stage is restored (layout and fit registrations
            // together), the ladder stops, and the cascade
            // proceeds from the backed-up state. This applies
            // to BOTH levels - the subcategory ladder and the
            // category (branch) ladder. It replaces the older
            // onset rule under which the tripping stage's
            // commit stood. The fine-tune skip path was
            // formerly excepted (its tripping commit stood);
            // the 2026-11-01 skip-throw re-ruling removed
            // that exception - the ladders call this on the
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
                // in lockstep - each node descends its own
                // ladder in square-root steps (dkLadderSteps /
                // dkLadderValue, one
                // committed sub-solve per stage) all the way
                // down to its floor - for subcategories, THREE
                // TIMES its own length (SHRINK_FLOOR_FACTOR,
                // ruled 2026-11-01, Jason) - before the next
                // node starts. When collisions
                // start on a node's ladder - the onset hold
                // trips - that node backs up a step
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
                    // already at their floors - its fit radius
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
                    // now the same thing - ONE floor, the
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
                    // length - preLen here - and delivered
                    // the pre-run delivered segment,
                    // preDelivered.items[k] here). The
                    // override lever's old separate floor -
                    // THREE TIMES the pre-run length - is
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
                    // barely moves the visible spoke - the
                    // override is the thrown length (x20 at the
                    // throw). Each stage therefore steps BOTH
                    // writings on their own square-root-step
                    // ladders (dkLadderSteps / dkLadderValue),
                    // in lockstep, toward the ONE floor: the
                    // fit target down to THREE TIMES the NAME
                    // length (SHRINK_FLOOR_FACTOR, ruled
                    // 2026-11-01, Jason), the override down to
                    // oFloorFor - that same fit floor derived
                    // into override units through the item's
                    // pre-run delivered radius (see the
                    // derivation at oFloorFor above) - the
                    // longer ladder setting the stage count
                    // and the shorter holding at its floor
                    // once reached. Before the 2026-11-01
                    // repair the override moved only in the
                    // final stage's restore jump, so a node
                    // held before its final stage (onset or
                    // gate) kept its full thrown override and
                    // stood visibly unshrunk - the long
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
                        // writing - the thrown length that
                        // actually renders (thrown x20 down to
                        // oFloorFor, the fit-derived floor) -
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
            // to arm - a subcategory whose fit target could not
            // be computed still gets a 3x-length floor and a
            // recorded attempt in runLadder, so no rendered
            // subcategory can pass through the cascade
            // unattempted and unrecorded. The floor for this
            // level is THREE TIMES the NAME length
            // (dkNameFitTargetForKey x SHRINK_FLOOR_FACTOR,
            // ruled 2026-11-01, Jason - superseding the 1x
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
            // one at a time - each node descends its own
            // geometric ladder to its 3x floor (three times
            // its own length - SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason) before the next node starts,
            // onset-held: when collisions start on a node's
            // ladder it backs up a step (onsetBackUp inside
            // runLadder) and the next node takes its turn.
            // Kinks have no ladder at all - they keep their
            // thrown, fit-capped lengths (cap at 3x the kink
            // length). The final-stage restore below stands
            // the override at the FIT-DERIVED floor - the
            // node's 3x name-length fit floor (subcatFloors)
            // converted through its pre-run delivered
            // radius with the snapshot entry's length (or
            // the baked base when the snapshot carries
            // none) as curLen - the same derived value the
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
            // 2026-10-31: that stage now backs up a stage -
            // the previous stage's length stands and the
            // final patch below carries THAT through. Before
            // this ruling the tripping stage's length stood.)
            // TERMINATION FLAG (ruled 2026-10-28, Jason 23:43,
            // scope confirmed 23:49): a per-phase GATE trip in
            // THIS branch (category) ladder - a back-out, where
            // runPhase discarded the tripping stage and restored
            // the last-kept snapshot - is reported to the caller
            // as branchBackedOut, and the caller ENDS the run on
            // it (no growth, no final patch, no final gate; the
            // backed-out state stands). An ONSET hold in this
            // ladder is NOT a back-out (the tripping commit
            // stands, nothing is restored) and never sets this
            // flag; a subcategory-ladder back-out never sets it
            // either - runLadder's trips stay inside that level
            // and the cascade proceeds to this ladder as before.
            let branchBackedOut = !1, branchGateRejected = !1;
            const branchCur = (dk.snapshot().branchOverrides || {})[name], branchSnap = snapshot.branchOverrides ? snapshot.branchOverrides[name] : null;
            let branchFrom = branchCur ? Number(branchCur.length) : NaN, branchTo = branchSnap && Number(branchSnap.length) > 0 ? Number(branchSnap.length) : dkBakedBranchBase(name);
            // BRANCH LABEL-FIT FLOOR (first ruled 2026-10-29
            // 04:57 for the fine-tune skip path; generalized to
            // every run 2026-10-31, Jason): the ladder descends
            // toward the pre-run length by default, but Jason's
            // shrink rule is that it tries to shrink all the way
            // to the length of the category name - so this floor
            // now applies on every run, not only when the branch
            // starts at its pre-run length. The floor is
            // label-fit TIMES THREE (SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason - superseding the 1x floor):
            // three times the length of the branch's longest
            // kink name, from the existing label-fit mechanism
            // (dkComputeFitTarget - the item's own label measured
            // at its actual render font, font-relative). UNITS,
            // flagged as the ruling requires: fit targets are
            // RENDERED lengths in map units, while a branch
            // length override is a dimensionless multiplier on
            // the branch's delivered radius (yr) - the code's
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
            // wherever it lands - the ladder descends to it
            // from the thrown length, and a branch standing
            // below it is set to it by the single-step path
            // below, exactly as the old pre-run target was.
            // The
            // descent still stops before the floor whenever
            // collisions start: the onset rule holds the level
            // when the cloud's crossing number rises (the
            // readout counts every crossing involving the
            // cloud's spokes - same-branch or foreign, any type
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
                        // becomes branchTo below - the endpoint
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
            // branch's own pre-run length instead - the same
            // 3x rule on the only category length available.
            if (!(report.fineTune && report.fineTune.branchFloor) && Number.isFinite(branchTo) && branchTo > 0) branchTo = branchTo * SX_SCORE.SHRINK_FLOOR_FACTOR;
            // STAGED SCORING SWITCH (moved 2026-11-13, Jason -
            // SUPERSEDES the 2026-11-02 ruling that flipped it at
            // shrink-stage entry): the neighbour-inclusive score
            // (same-plus-adjacent, radial neighbours) belongs ONLY
            // to the LAST shrink stage - the category/branch shrink
            // below (fit-branch-*), the zeroth/first-level node.
            // The subcategory shrink ladder above is judged
            // same-branch-only (adjacent stays false through
            // fit-subcats-*). Entering the branch ladder flips the
            // run's judged score to same-plus-adjacent, and the
            // per-phase gate's reference is RE-BASED on the current
            // (last-kept) geometry under the new composition, so
            // the first branch phase is judged against the same
            // composition it is scored under - descent and judge
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
