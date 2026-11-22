// 02n2-deknotter-solver.js — DeKnotter Constraint & Relaxation Solver Math
// Pure calculation routines extracted from 02n-deknotter-cascade.js and 02l-deknotter-session.js
// Handles ladder descent calculations, ratio checks, geometry projection, and constraint evaluation.

import {
    dkLadderSteps,
    dkLadderValue
} from './02n1-deknotter-diagnostics.js';

/**
 * Validates phase length override ratios against baked bases.
 * @param {Object} patch Layout patch
 * @param {number} cap Maximum allowed expansion ratio
 * @returns {Object} { ok: boolean, rejected: Array }
 */
function dkValidatePhaseRatios(patch, cap = 200) {
    if (!patch) return { ok: true, rejected: [] };
    const rejected = [];
    const checkGroup = (group, type) => {
        if (!group || typeof group !== "object") return;
        for (const [key, val] of Object.entries(group)) {
            if (val && typeof val.length !== "undefined") {
                const len = Number(val.length);
                if (!Number.isFinite(len) || len <= 0 || len > cap) {
                    rejected.push({ type, key, length: val.length });
                }
            }
        }
    };
    checkGroup(patch.branchOverrides, "branch");
    checkGroup(patch.subcatOverrides, "subcat");
    checkGroup(patch.kinkOverrides, "kink");
    return { ok: rejected.length === 0, rejected };
}

/**
 * Computes square-root ladder schedule for a single key descending to its floor.
 * @param {number} from Starting value
 * @param {number} to Target floor
 * @param {number} maxStages Maximum ladder stages allowed
 * @returns {Array<number>} Array of ladder step values
 */
function dkComputeLadderSchedule(from, to, maxStages = 512) {
    if (!Number.isFinite(from) || !Number.isFinite(to) || !(from > to) || !(to > 0)) {
        return [];
    }
    const steps = dkLadderSteps(from, to);
    const stages = Math.min(maxStages, Math.max(1, steps));
    const schedule = [];
    for (let j = 1; j <= stages; j++) {
        schedule.push(dkLadderValue(from, to, j, stages));
    }
    return schedule;
}

/**
 * Calculates conversion from world rendered unit to override length multiplier.
 * Formula: afterLength = curLen * target / delivered
 * @param {number} curLen Current length override
 * @param {number} delivered Delivered distance in rendered map units
 * @param {number} target Target distance in rendered map units
 * @returns {number} Converted override length
 */
function dkConvertRenderedToOverride(curLen, delivered, target) {
    if (!Number.isFinite(curLen) || curLen <= 0 ||
        !Number.isFinite(delivered) || delivered <= 0 ||
        !Number.isFinite(target) || target <= 0) {
        return NaN;
    }
    return (curLen * target) / delivered;
}

/**
 * Evaluates whether cloud crossing drop between before and after is substantial.
 * @param {number} before Initial crossing count
 * @param {number} after Final crossing count
 * @param {number} threshold Drop ratio threshold (e.g. 0.75 for 75%)
 * @returns {Object} { drop: number|null, substantial: boolean }
 */
function dkEvaluateCrossingDrop(before, after, threshold = 0.75) {
    if (before == null || !(before > 0) || after == null || !Number.isFinite(after)) {
        return { drop: null, substantial: false };
    }
    const drop = (before - after) / before;
    return {
        drop,
        substantial: drop > threshold
    };
}
