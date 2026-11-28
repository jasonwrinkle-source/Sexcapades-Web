        const Do = e.byId("outlineDialog"), Ro = e.byId("outlineSections"), Oo = e.byId("outlineProfileName"), Bo = e.byId("outlineHeaderCount"), jo = e.byId("outlineProgressText"), qo = e.byId("outlineProgressBar"), qoRaw = e.byId("outlineProgressRaw"), Ho = e.byId("outlineTimerToggle"), Wo = e.byId("outlineTimerReset"), Uo = e.byId("outlineShowRated");
        window.__sxOutlineViewMode = window.__sxOutlineViewMode || "ladder";
        // P1 refactor (Build 2026-10-18_2227): outline-row DOM helpers.
        // getOutlineRow(el) returns the .outline-row containing an element;
        // getOutlineRow(id) returns the row for a topic id within the
        // outline sections. getOutlineRows(root) returns the id-carrying
        // outline rows under a root (default: the outline sections).
        // getOutlineCell(row, name) returns the row's [data-outline-<name>]
        // cell ("direction", "mark", "note", "note-input", ...).
        function getOutlineRow(e) {
            return "string" == typeof e ? Ro.querySelector(`.outline-row[data-outline-id="${CSS.escape(e)}"]`) : e && e.closest ? __sxClosestAction(e, "outlineRow") : null;
        }
        function getOutlineRows(e = Ro) {
            return Array.from((e || Ro).querySelectorAll(".outline-row[data-outline-id]"));
        }
        function getOutlineCell(e, t) {
            return e ? e.querySelector(`[data-outline-${t}]`) : null;
        }
        let Go = null, Ko = null, zo = null, Vo = 0, Yo = 0, Xo = 0, Zo = !0, Qo = !1, Jo = !1, es = null, ts = 0, ns = 0, is = !1, as = null, ZoAuto = !1;
        const rs = new Set, os = new Set, ss = "Show the next three popular";
        const milestoneRungs = Object.freeze([ 54, 108, 162, 216, 270, 324, 378, 403 ]), milestoneShownByProfile = new Map;
        let milestoneProfileId = null, milestoneValue = 0;
        function sxIsOutlineRated(e, t) {
            const n = sxDecodeTopicStance(e, t);
            const keys = (n.keys && Array.isArray(n.keys)) ? n.keys : [ "give", "receive" ];
            return !!keys.some(k => Boolean(n[k + "Known"])) || !!Boolean((Qe[t] || {})[e]) || !!Boolean((Je[t] || {})[e]) || Boolean((et[t] || {})[e]);
        }
        function sxOutlineRatedCounts(e, t = null) {
            const n = function(e) {
                const t = [];
                return h.forEach(n => {
                    n.topics.forEach(i => {
                        const a = sxResolveTopicId(i);
                        t.push({
                            id: a,
                            label: i,
                            branch: n.name,
                            kind: "Topic",
                            risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk)
                        }), sxListImportedChildIds(a, e).forEach(i => {
                            const a = (at[e] || {})[i];
                            a && t.push({
                                id: i,
                                label: a.label || i,
                                branch: n.name,
                                kind: "Imported",
                                risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk)
                            });
                        });
                    });
                }), t;
            }(e).filter(e => "Topic" === e.kind && (!t || e.branch === t));
            return {
                rated: n.filter(t => sxIsOutlineRated(t.id, e)).length,
                total: n.length
            };
        }
        function sxSubcategoryMean(e) {
            return sxMeanScore(e.topics);
        }
        // Hot List 4-tier cascade (2026-11-27):
        //   1. First Ladder (Greedy Orthogonal max-min SNR over headline
        //      archetypes; soft floor 6 topics, cap 24, SNR >= 75)
        //   2. Fault-line score descending (Item 36: per-topic mean pole
        //      range across samples, tie-break by max pole range desc)
        //   3. Poll / popularity score descending
        //   4. Alphabetical by topic label
        // Computed at runtime from window.SEXCAPADES_SAMPLE_PROFILES and
        // memoized per skin/sample-set so renders stay O(1) and rows never
        // jump under the user's cursor while rating.
        function sxExtractHotListPoles(val) {
            if (null == val) return null;
            if ("number" == typeof val) return Number.isFinite(val) ? { _scalar: val } : null;
            if ("object" != typeof val) return null;
            if (Object.prototype.hasOwnProperty.call(val, "advocacy")) {
                const adv = val.advocacy;
                if ("number" == typeof adv) return Number.isFinite(adv) ? { _scalar: adv } : null;
                if (adv && "object" == typeof adv) {
                    const poles = {}, pks = Object.keys(adv);
                    let any = !1;
                    for (let k = 0; k < pks.length; k++) {
                        const pk = pks[k];
                        if ("intensity" === pk || "known" === pk || "mode" === pk) continue;
                        const pv = adv[pk];
                        if ("number" == typeof pv && Number.isFinite(pv)) { poles[pk] = pv; any = !0; }
                    }
                    return any ? poles : null;
                }
                return null;
            }
            const poles = {}, pks = Object.keys(val);
            let any = !1;
            for (let k = 0; k < pks.length; k++) {
                const pk = pks[k];
                if ("intensity" === pk || "receptivity" === pk || "known" === pk || "mode" === pk) continue;
                const pv = val[pk];
                if ("number" == typeof pv && Number.isFinite(pv)) { poles[pk] = pv; any = !0; }
            }
            return any ? poles : null;
        }
        let __sxHotListCacheRef = null, __sxHotListCacheSig = "", __sxHotListCacheVal = null;
        function sxGetHotListCache() {
            const samples = typeof window !== "undefined" ? window.SEXCAPADES_SAMPLE_PROFILES : null;
            if (!samples || "object" != typeof samples) {
                return { faultMap: new Map(), ladder: { ids: [], rankMap: new Map(), count: 0, estMinutes: 0 } };
            }
            const keys = Object.keys(samples);
            const sig = String(window.__SX_ACTIVE_SKIN || "") + "|" + keys.length + "|" + (keys[0] || "") + "|" + (keys[keys.length - 1] || "");
            if (__sxHotListCacheVal && __sxHotListCacheRef === samples && __sxHotListCacheSig === sig) return __sxHotListCacheVal;

            // Tier 2: Fault-line map across all non-local built-in samples
            const byTopic = new Map();
            for (let i = 0; i < keys.length; i++) {
                const s = samples[keys[i]];
                if (!s || "object" != typeof s || s.local) continue;
                const ratings = s.payload && s.payload.ratings;
                if (!ratings || "object" != typeof ratings) continue;
                const tids = Object.keys(ratings);
                for (let j = 0; j < tids.length; j++) {
                    const tid = tids[j], poles = sxExtractHotListPoles(ratings[tid]);
                    if (!poles) continue;
                    const pks = Object.keys(poles);
                    let tMap = byTopic.get(tid);
                    if (!tMap) { tMap = new Map(); byTopic.set(tid, tMap); }
                    for (let k = 0; k < pks.length; k++) {
                        const pk = pks[k], pv = poles[pk], st = tMap.get(pk);
                        if (!st) tMap.set(pk, { min: pv, max: pv, n: 1 });
                        else {
                            if (pv < st.min) st.min = pv;
                            if (pv > st.max) st.max = pv;
                            st.n += 1;
                        }
                    }
                }
            }
            const faultMap = new Map();
            byTopic.forEach((tMap, tid) => {
                let sum = 0, cnt = 0, mx = -1;
                tMap.forEach(st => {
                    if (st.n >= 2) {
                        const r = st.max - st.min;
                        sum += r; cnt += 1;
                        if (r > mx) mx = r;
                    }
                });
                if (cnt > 0) faultMap.set(tid, { avg: sum / cnt, maxRange: mx, poles: cnt });
            });

            // Tier 1: Greedy Orthogonal First Ladder over headline archetypes
            // (exact palimpsest + kind !== "sample" scoping from 06d3-profile-about.js)
            const stackGroups = {}, stackOrder = [], headlineKeys = [];
            for (let i = 0; i < keys.length; i++) {
                const k = keys[i], entry = samples[k];
                if (!entry || "object" != typeof entry || entry.local) continue;
                if (!entry.payload || !entry.payload.ratings || "object" != typeof entry.payload.ratings) continue;
                const sk = entry.stackKey || entry.stack;
                if (sk) {
                    if (!stackGroups[sk]) { stackGroups[sk] = []; stackOrder.push(sk); }
                    stackGroups[sk].push(k);
                } else if (entry.kind !== "sample") headlineKeys.push(k);
            }
            const layerVal = entry => {
                const d = entry && entry.date != null ? String(entry.date).trim() : "";
                if ("present" === d.toLowerCase()) return Infinity;
                const n = parseFloat(d);
                return Number.isNaN(n) ? -Infinity : n;
            };
            for (let i = 0; i < stackOrder.length; i++) {
                const grp = stackGroups[stackOrder[i]];
                let topKey = grp[0];
                for (let j = 1; j < grp.length; j++) if (layerVal(samples[grp[j]]) > layerVal(samples[topKey])) topKey = grp[j];
                headlineKeys.push(topKey);
            }

            const ladderIds = [], ladderRank = new Map();
            let estSec = 0;
            const nArch = headlineKeys.length;
            if (nArch >= 2) {
                const archRatings = headlineKeys.map(k => samples[k].payload.ratings);
                // Candidate topics sorted by fault-line desc for deterministic tie-breaks
                const candTids = Array.from(faultMap.keys()).sort((a, b) => {
                    const fa = faultMap.get(a), fb = faultMap.get(b);
                    if (Math.abs(fb.avg - fa.avg) > 1e-9) return fb.avg - fa.avg;
                    if (Math.abs(fb.maxRange - fa.maxRange) > 1e-9) return fb.maxRange - fa.maxRange;
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                const pairsA = [], pairsB = [];
                for (let i = 0; i < nArch; i++) for (let j = i + 1; j < nArch; j++) { pairsA.push(i); pairsB.push(j); }
                const P = pairsA.length;
                const activeTids = [], dMat = [], kLens = [], isMulti = [];
                for (let t = 0; t < candTids.length; t++) {
                    const tid = candTids[t], raws = new Array(nArch), pkSet = new Set();
                    let ratedCnt = 0;
                    for (let a = 0; a < nArch; a++) {
                        const p = sxExtractHotListPoles(archRatings[a][tid]);
                        raws[a] = p;
                        if (p) {
                            ratedCnt++;
                            const pks = Object.keys(p);
                            for (let c = 0; c < pks.length; c++) pkSet.add(pks[c]);
                        }
                    }
                    if (ratedCnt < 2 || !pkSet.size) continue;
                    const pks = Array.from(pkSet), klen = pks.length;
                    const row = new Float32Array(P);
                    for (let p = 0; p < P; p++) {
                        const va = raws[pairsA[p]], vb = raws[pairsB[p]];
                        if (!va || !vb) { row[p] = -1; continue; }
                        let s = 0;
                        for (let c = 0; c < klen; c++) {
                            const pk = pks[c];
                            s += Math.abs((pk in va ? va[pk] : 0) - (pk in vb ? vb[pk] : 0));
                        }
                        row[p] = s;
                    }
                    activeTids.push(tid);
                    dMat.push(row);
                    kLens.push(klen);
                    isMulti.push(!(klen <= 1 || (klen === 2 && pkSet.has("give") && pkSet.has("receive"))));
                }
                const T = activeTids.length;
                const MIN_FLOOR = Math.min(T, 6), MAX_CAP = Math.min(T, 24), THRESH_SNR = 75.0;
                const used = new Uint8Array(T), cumSum = new Float64Array(P), cumPoles = new Int32Array(P);
                for (let step = 0; step < MAX_CAP; step++) {
                    let bestT = -1, bestObj = -1e18;
                    for (let t = 0; t < T; t++) {
                        if (used[t]) continue;
                        const row = dMat[t], kl = kLens[t];
                        let mn = 1e9, soft = 0;
                        for (let p = 0; p < P; p++) {
                            const d = row[p];
                            let s = cumSum[p], c = cumPoles[p];
                            if (d >= 0) { s += d; c += kl; }
                            const snr = c > 0 ? s / Math.sqrt(c) : 0;
                            if (snr < mn) mn = snr;
                            soft -= Math.exp(-snr / 25.0);
                        }
                        const obj = mn * 100.0 + soft;
                        if (obj > bestObj) { bestObj = obj; bestT = t; }
                    }
                    if (bestT < 0) break;
                    used[bestT] = 1;
                    ladderRank.set(activeTids[bestT], ladderIds.length);
                    ladderIds.push(activeTids[bestT]);
                    estSec += isMulti[bestT] ? 25 : 15;
                    const row = dMat[bestT], kl = kLens[bestT];
                    let minSnr = 1e9;
                    for (let p = 0; p < P; p++) {
                        if (row[p] >= 0) { cumSum[p] += row[p]; cumPoles[p] += kl; }
                        const snr = cumPoles[p] > 0 ? cumSum[p] / Math.sqrt(cumPoles[p]) : 0;
                        if (snr < minSnr) minSnr = snr;
                    }
                    if (ladderIds.length >= MIN_FLOOR && minSnr >= THRESH_SNR) break;
                }
            }
            const estMinutes = ladderIds.length ? Math.max(1, Math.round(estSec / 60)) : 0;
            __sxHotListCacheRef = samples;
            __sxHotListCacheSig = sig;
            __sxHotListCacheVal = {
                faultMap: faultMap,
                ladder: { ids: ladderIds, rankMap: ladderRank, count: ladderIds.length, estMinutes: estMinutes }
            };
            return __sxHotListCacheVal;
        }
        function sxComputeFaultLineScores() {
            return sxGetHotListCache().faultMap;
        }
        function sxComputeFirstLadder() {
            return sxGetHotListCache().ladder;
        }
        window.__SX_FAULT_LINE_SCORES = sxComputeFaultLineScores;
        window.__SX_FIRST_LADDER = sxComputeFirstLadder;
        function sxCompareHotListIds(idA, labelA, idB, labelB, faultMap, ladderMap) {
            const lm = ladderMap || (sxGetHotListCache().ladder.rankMap);
            const la = lm && lm.has(idA) ? lm.get(idA) : -1;
            const lb = lm && lm.has(idB) ? lm.get(idB) : -1;
            if ((la >= 0) !== (lb >= 0)) return la >= 0 ? -1 : 1;
            if (la >= 0 && lb >= 0 && la !== lb) return la - lb;
            const fa = faultMap ? faultMap.get(idA) : null;
            const fb = faultMap ? faultMap.get(idB) : null;
            if (Boolean(fa) !== Boolean(fb)) return fa ? -1 : 1;
            if (fa && fb) {
                if (Math.abs(fb.avg - fa.avg) > 1e-9) return fb.avg - fa.avg;
                if (Math.abs(fb.maxRange - fa.maxRange) > 1e-9) return fb.maxRange - fa.maxRange;
            }
            const pa = sxTopicPopularity(idA, labelA), pb = sxTopicPopularity(idB, labelB);
            const ha = Number.isFinite(pa), hb = Number.isFinite(pb);
            if (ha !== hb) return ha ? -1 : 1;
            if (ha && hb && pa !== pb) return pb - pa;
            return String(labelA || "").localeCompare(String(labelB || ""));
        }
        function sxFirstLadderMinRankForTopics(topics, ladderMap) {
            if (!ladderMap || !ladderMap.size || !topics || !topics.length) return Infinity;
            let best = Infinity;
            for (let i = 0; i < topics.length; i++) {
                const r = ladderMap.get(sxResolveTopicId(topics[i]));
                if (null != r && r < best) best = r;
            }
            return best;
        }
        function sxFaultLineMeanForTopics(topics, faultMap) {
            if (!faultMap || !faultMap.size || !topics || !topics.length) return null;
            let sum = 0, cnt = 0;
            for (let i = 0; i < topics.length; i++) {
                const fl = faultMap.get(sxResolveTopicId(topics[i]));
                if (fl && Number.isFinite(fl.avg)) { sum += fl.avg; cnt += 1; }
            }
            return cnt ? sum / cnt : null;
        }
        let sxOutlineSortMode = "popularity";
        window.__sxSetOutlineSortMode = function(e) {
            sxOutlineSortMode = "interest" === e ? "interest" : "popularity";
        };
        function sxSignalSortedTree() {
            const cache = sxGetHotListCache(), faultMap = cache.faultMap, ladderMap = cache.ladder.rankMap;
            const sortTopics = list => (list || []).slice().sort((a, b) => sxCompareHotListIds(sxResolveTopicId(a), sxName(a), sxResolveTopicId(b), sxName(b), faultMap, ladderMap));
            const sortGroups = (list, topicsOf, popMeanOf) => (list || []).slice().sort((a, b) => {
                const ra = sxFirstLadderMinRankForTopics(topicsOf(a), ladderMap), rb = sxFirstLadderMinRankForTopics(topicsOf(b), ladderMap);
                const hra = Number.isFinite(ra), hrb = Number.isFinite(rb);
                if (hra !== hrb) return hra ? -1 : 1;
                if (hra && hrb && ra !== rb) return ra - rb;
                const fa = sxFaultLineMeanForTopics(topicsOf(a), faultMap), fb = sxFaultLineMeanForTopics(topicsOf(b), faultMap);
                const hfa = Number.isFinite(fa), hfb = Number.isFinite(fb);
                if (hfa !== hfb) return hfa ? -1 : 1;
                if (hfa && hfb && Math.abs(fb - fa) > 1e-9) return fb - fa;
                const pa = popMeanOf(a), pb = popMeanOf(b);
                const hpa = Number.isFinite(pa), hpb = Number.isFinite(pb);
                if (hpa !== hpb) return hpa ? -1 : 1;
                if (hpa && hpb && pa !== pb) return pb - pa;
                return String(a.name || "").localeCompare(String(b.name || ""));
            });
            return sortGroups(h, b => b.topics, sxBranchMeanScore).map(b => {
                const t = sortGroups(b.subcategories || [], s => s.topics, sxSubcategoryMean),
                      n = [ ...t.flatMap(s => sortTopics(s.topics || [])), ...sortTopics(b.subcategories?.length ? b.parentTopics || b.topics.filter(x => !sxFindTopicSubcategory(b, x)) : b.topics) ],
                      i = sortTopics(n),
                      a = new Map(i.map((x, idx) => [ sxResolveTopicId(x), idx ]));
                return Object.assign({}, b, {
                    subcategories: t,
                    topics: n,
                    outlineTopicRanks: a
                });
            });
        }
        function sxSortedOutlineTree(e = Go) {
            if ("interest" === sxOutlineSortMode && e && e !== Et) {
                const sxScore = t => {
                    const n = sxDecodeTopicStance(sxResolveTopicId(t), e);
                    return n.giveKnown || n.receiveKnown ? n.giveKnown && n.receiveKnown ? (n.give + n.receive) / 2 : n.giveKnown ? n.give : n.receive : null;
                };
                return sxSortByScore(h, sxBranchMeanScore, e => e.name).map(e => {
                    const t = sxOrderByScore(e.subcategories || [], sxSubcategoryMean), n = [ ...t.flatMap(e => sxOrderByScore(e.topics || [], sxScore)), ...sxOrderByScore(e.subcategories?.length ? e.parentTopics || e.topics.filter(t => !sxFindTopicSubcategory(e, t)) : e.topics, sxScore) ], i = sxOrderByScore(n, sxScore), a = new Map(i.map((e, t) => [ sxResolveTopicId(e), t ]));
                    return Object.assign({}, e, {
                        subcategories: t,
                        topics: n,
                        outlineTopicRanks: a
                    });
                });
            }
            return sxSignalSortedTree();
        }
        // Guided Ladder with Branch Round-Robin (BRR) phase partitioning (2026-11-27):
        //   Phase 1 — First Ladder (greedy orthogonal archetype separator)
        //   Phase 2 — Core Balance (BRR to 3 topics per category, sharpest pole split first)
        //   Phase 3 — Deeper Resolution (BRR to 6 per category when 6*cats <= 80% of map)
        //   Final   — Full Map (remaining topics globally by pole split → popularity → alpha)
        let __sxGuidedCacheSig = "", __sxGuidedCacheVal = null;
        function sxComputeGuidedLadder() {
            const cache = sxGetHotListCache(), faultMap = cache.faultMap, ladderMap = cache.ladder.rankMap;
            const catNames = (h || []).map(b => b.name + ":" + (b.topics ? b.topics.length : 0)).join(",");
            const sig = String(window.__SX_ACTIVE_SKIN || "") + "|" + cache.ladder.count + "|" + (cache.ladder.ids[0] || "") + "|" + catNames;
            if (__sxGuidedCacheVal && __sxGuidedCacheSig === sig) return __sxGuidedCacheVal;

            const tree = sxSignalSortedTree();
            const topicMap = new Map();
            const catQueues = new Map();
            const catCount = new Map();
            const seenInCatalog = new Set();
            tree.forEach(branch => {
                const bName = branch.name;
                catCount.set(bName, 0);
                const orderedIds = [];
                // Order category's topics globally by signal cascade for BRR draw order
                const rawTopics = (branch.topics || []).slice().sort((a, b) =>
                    sxCompareHotListIds(sxResolveTopicId(a), sxName(a), sxResolveTopicId(b), sxName(b), faultMap, ladderMap)
                );
                rawTopics.forEach(top => {
                    const tid = sxResolveTopicId(top);
                    if (seenInCatalog.has(tid)) return;
                    seenInCatalog.add(tid);
                    const sub = sxFindTopicSubcategory(branch, sxName(top));
                    const rec = {
                        id: tid,
                        label: sxName(top),
                        branch: bName,
                        subName: sub ? sub.name : "",
                        kind: "Topic",
                        risk: Boolean((branch.topics || []).find(t => sxName(t) === sxName(top))?.risk)
                    };
                    topicMap.set(tid, rec);
                    orderedIds.push(tid);
                });
                catQueues.set(bName, orderedIds);
            });

            const totalTopics = topicMap.size;
            const usedIds = new Set();

            // Phase 1: Greedy Orthogonal First Ladder
            const p1Ids = [];
            (cache.ladder.ids || []).forEach(tid => {
                if (topicMap.has(tid) && !usedIds.has(tid)) {
                    usedIds.add(tid);
                    p1Ids.push(tid);
                    const rec = topicMap.get(tid);
                    catCount.set(rec.branch, (catCount.get(rec.branch) || 0) + 1);
                }
            });

            // Remove Phase 1 IDs from category queues
            catQueues.forEach((q, bName) => {
                catQueues.set(bName, q.filter(tid => !usedIds.has(tid)));
            });

            // Helper: Branch Round-Robin (BRR) up to targetDepth topics per category
            const drawBRR = targetDepth => {
                const picked = [];
                for (let depth = 1; depth <= targetDepth; depth++) {
                    tree.forEach(branch => {
                        const bName = branch.name;
                        const q = catQueues.get(bName) || [];
                        while ((catCount.get(bName) || 0) < depth && q.length > 0) {
                            const tid = q.shift();
                            if (usedIds.has(tid)) continue;
                            usedIds.add(tid);
                            picked.push(tid);
                            catCount.set(bName, (catCount.get(bName) || 0) + 1);
                        }
                    });
                }
                return picked;
            };

            // Phase 2: Core Balance (BRR to 3 per category)
            const p2Ids = drawBRR(3);

            // Phase 3: Deeper Resolution (BRR to 6 per category on non-compact maps)
            const nCats = tree.length;
            const allowPhase3 = nCats > 0 && (6 * nCats <= Math.floor(totalTopics * 0.8)) && ((p1Ids.length + p2Ids.length) < Math.floor(totalTopics * 0.8));
            const p3Ids = allowPhase3 ? drawBRR(6) : [];

            // Final Phase: Remaining topics globally sorted by fault-line → popularity → alpha
            const restIds = [];
            topicMap.forEach((rec, tid) => { if (!usedIds.has(tid)) restIds.push(tid); });
            restIds.sort((a, b) => sxCompareHotListIds(a, topicMap.get(a).label, b, topicMap.get(b).label, faultMap, ladderMap));

            const phases = [];
            let cum = 0;
            const estMins = n => Math.max(1, Math.round(n / 3));
            if (p1Ids.length) {
                cum += p1Ids.length;
                phases.push({
                    index: phases.length + 1,
                    key: "first",
                    title: "First archetype projection",
                    shortLabel: "First Ladder",
                    tag: "First Ladder",
                    desc: "Greedy orthogonal topics that separate the map’s archetypes fastest.",
                    ids: p1Ids,
                    cumEnd: cum,
                    estMinutes: cache.ladder.estMinutes || estMins(p1Ids.length),
                    cumMinutes: cache.ladder.estMinutes || estMins(cum)
                });
            }
            if (p2Ids.length) {
                cum += p2Ids.length;
                phases.push({
                    index: phases.length + 1,
                    key: "core",
                    title: "Accurate projection & core map",
                    shortLabel: "Core Map",
                    tag: "3/cat · round-robin",
                    desc: "Balances every category round-robin with its sharpest pole splits.",
                    ids: p2Ids,
                    cumEnd: cum,
                    estMinutes: estMins(p2Ids.length),
                    cumMinutes: estMins(cum)
                });
            }
            if (p3Ids.length) {
                cum += p3Ids.length;
                phases.push({
                    index: phases.length + 1,
                    key: "deeper",
                    title: "Deeper resolution",
                    shortLabel: "Deeper",
                    tag: "6/cat · round-robin",
                    desc: "Secondary fault lines across every category for sharper Scribe & Scene Setter output.",
                    ids: p3Ids,
                    cumEnd: cum,
                    estMinutes: estMins(p3Ids.length),
                    cumMinutes: estMins(cum)
                });
            }
            if (restIds.length) {
                cum += restIds.length;
                phases.push({
                    index: phases.length + 1,
                    key: "full",
                    title: "Full map",
                    shortLabel: "Full Map",
                    tag: "Complete",
                    desc: "Remaining topics ordered by pole split, popularity, and alphabetical tail.",
                    ids: restIds,
                    cumEnd: cum,
                    estMinutes: estMins(restIds.length),
                    cumMinutes: estMins(cum)
                });
            }

            __sxGuidedCacheSig = sig;
            __sxGuidedCacheVal = { phases: phases, totalTopics: totalTopics, catCount: nCats, topicMap: topicMap };
            return __sxGuidedCacheVal;
        }
        function sxComputePhaseProgress(profileId) {
            const guided = sxComputeGuidedLadder();
            const total = guided.totalTopics || 0;
            let totalRated = 0;
            let honestCount = 0;
            let hitIncomplete = false;
            let currentPhase = null;
            const phaseStats = guided.phases.map(p => {
                let done = 0;
                for (let i = 0; i < p.ids.length; i++) {
                    if (profileId && sxIsOutlineRated(p.ids[i], profileId)) done++;
                }
                totalRated += done;
                const complete = p.ids.length > 0 && done >= p.ids.length;
                if (!hitIncomplete) {
                    honestCount += done;
                    if (!complete) {
                        hitIncomplete = true;
                        currentPhase = Object.assign({}, p, { done: done, total: p.ids.length, complete: false });
                    }
                }
                return Object.assign({}, p, { done: done, total: p.ids.length, complete: complete });
            });
            return {
                phases: phaseStats,
                currentPhase: currentPhase,
                allComplete: total > 0 && totalRated >= total,
                honestCount: honestCount,
                totalRated: totalRated,
                totalTopics: total,
                honestPct: total > 0 ? Math.min(100, (100 * honestCount) / total) : 0,
                rawPct: total > 0 ? Math.min(100, (100 * totalRated) / total) : 0
            };
        }
        window.__SX_GUIDED_LADDER = sxComputeGuidedLadder;
        window.__SX_PHASE_PROGRESS = sxComputePhaseProgress;
        function sxOutlineTimerSeconds() {
            return Math.max(0, Math.floor((Yo + (Vo ? Date.now() - Vo : 0)) / 1e3));
        }
        function sxSyncTimerPauseButton() {
            Ho.classList.toggle("is-paused", Zo), Ho.setAttribute("aria-label", Zo ? "Resume elapsed timer" : "Pause elapsed timer"), 
            Ho.title = Zo ? "Resume timer" : "Pause timer";
        }
        function sxEnsureOutlineAudio() {
            if (!es) try {
                const e = window.AudioContext || window.webkitAudioContext;
                if (!e) return;
                es = new e, "suspended" === es.state && es.resume().catch((e) => { __sxErrLog("audio-context", e); });
            } catch (e) {
                es = null;
            }
        }
        function sxStopConfettiFrame() {
            ts && cancelAnimationFrame(ts), ts = 0;
        }
        function sxDismissCompletion() {
            t.clear(ns), ns = 0, sxStopConfettiFrame(), sxCloseModalDialog(Eg), milestoneProfileId = null, milestoneValue = 0;
        }
        function milestoneWasShown(e, t) {
            return milestoneShownByProfile.get(e)?.has(t) || !1;
        }
        function markMilestoneShown(e, t) {
            milestoneShownByProfile.has(e) || milestoneShownByProfile.set(e, new Set), milestoneShownByProfile.get(e).add(t);
        }
        function closeMilestoneCelebration() {
            sxCloseModalDialog(milestoneDialog), milestoneProfileId = null, milestoneValue = 0;
        }
        function showMilestoneCelebration(t, n, phaseMeta = null) {
            if (!t || milestoneWasShown(t, n)) return;
            const guided = sxComputeGuidedLadder();
            const fullTotal = guided.totalTopics || 403;
            if (n >= fullTotal) return void sxShowCompletionCelebration(t);
            if (milestoneDialog.open || Eg.open) return;
            markMilestoneShown(t, n), milestoneProfileId = t, milestoneValue = n;
            if (phaseMeta && phaseMeta.key === "core") {
                milestoneTitle.textContent = `Core map ready (${n} topics)`;
                milestoneMessage.textContent = "You’ve covered every category with its sharpest fault lines — your archetype projection is accurate and your map is ready to compare with a partner.";
            } else if (phaseMeta && phaseMeta.key === "deeper") {
                milestoneTitle.textContent = `Deeper map reached (${n} topics)`;
                milestoneMessage.textContent = "Your hypermap now captures secondary preferences across every category — ideal for Scribe, Scene Setter, or partner comparisons.";
            } else {
                milestoneTitle.textContent = `${n} topics rated`;
                milestoneMessage.textContent = "Your hypermap has enough detail to be useful now. You can keep building it or put it to work.";
            }
            sxOpenModalDialog(milestoneDialog), requestAnimationFrame(() => milestoneContinue.focus({
                preventScroll: !0
            }));
        }
        function checkMilestoneTransition(e, t) {
            if (!e || !Number.isFinite(t)) return;
            const prog = sxComputePhaseProgress(e);
            if (prog.totalRated <= t) return;
            for (let i = 0; i < prog.phases.length; i++) {
                const p = prog.phases[i];
                if ((p.key === "core" || p.key === "deeper") && p.complete && !milestoneWasShown(e, p.cumEnd)) {
                    showMilestoneCelebration(e, p.cumEnd, p);
                    return;
                }
            }
            if (prog.allComplete && prog.totalTopics > 0 && !milestoneWasShown(e, prog.totalTopics)) {
                sxShowCompletionCelebration(e);
            }
        }
        function openMilestoneDestination(e) {
            const t = milestoneProfileId;
            milestoneDialog.open ? closeMilestoneCelebration() : Eg.open && sxDismissCompletion(), Do.open && sxCloseHotList(!1);
            requestAnimationFrame(() => {
                const n = t => {
                    if (!t || !vt[t]) return;
                    if ("export" === e) return void sxOpenProfileExport(t);
                    if ("import" === e) return t !== Mt && sxLoadProfileMap(t), void sxOpenProfileImport();
                    if ("scribe" === e) return t !== Mt && sxLoadProfileMap(t), void (document.getElementById("scribeTab") ? document.getElementById("scribeTab").click() : (sxClearScribeReady(), sxEnterScribeCast()));
                    t !== Mt && sxLoadProfileMap(t);
                    const n = Object.keys(vt).filter(e => e !== t), i = tl.querySelector("[data-add-profile]");
                    if (!n.length) return i && (sxCloseLoadMenu(), sxCloseAddMenu(), sxCloseSampleSubmenus(), sxToggleAddProfileMenu(i)), void sxShowStatusToast("Add or import your partner’s profile, then hold its tab to compare.");
                    sxSel(null, "clear"), sxToggleCompareProfile(t);
                    const a = tl.querySelector(`button[data-view]:not([data-view="${CSS.escape(t)}"])`);
                    a && a.focus({
                        preventScroll: !0
                    }), sxShowStatusToast("Choose a partner: hold their profile tab — or Ctrl+click on a computer.");
                };
                t === Et || !vt[t] ? (Vy = n, sxOpenProfileDetails(null)) : n(t);
            });
        }
        function sxShowCompletionCelebration(t = Go || sxActiveProfileId()) {
            if (!t || milestoneWasShown(t, 403) && !Eg.open) return;
            markMilestoneShown(t, 403), milestoneProfileId = t, milestoneValue = 403;
            if (!Eg.open) {
                Cg.textContent = "Over 400 topics rated.", Ag.dataset.submitted = "false", sxOpenModalDialog(Eg), 
                function() {
                    sxStopConfettiFrame();
                    const e = Mg.getBoundingClientRect();
                    if (!e.width || !e.height) return;
                    const t = Math.min(2, window.devicePixelRatio || 1), n = e.width, i = e.height, a = Mg.getContext("2d");
                    Mg.width = Math.round(n * t), Mg.height = Math.round(i * t), a.setTransform(t, 0, 0, t, 0, 0);
                    const r = [ "#63c796", "#63c2c8", "#d7bd55", "#e4ac5f", "#e06f6a", "#eff2ec" ];
                    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                        a.clearRect(0, 0, n, i);
                        for (let e = 0; e < 44; e++) {
                            const t = e % 2 == 0, o = t ? e % 4 == 0 ? 10 + 75 * Math.random() : n - 85 + 75 * Math.random() : Math.random() * n, s = t ? Math.random() * i : 10 + 55 * Math.random();
                            a.fillStyle = r[e % r.length], a.save(), a.translate(o, s), a.rotate(.77 * e % Math.PI), 
                            a.fillRect(-3, -1.5, 6, 3), a.restore();
                        }
                        return;
                    }
                    const o = Array.from({
                        length: 96
                    }, (e, t) => ({
                        x: .5 * n + 46 * (Math.random() - .5),
                        y: .64 * i + 18 * (Math.random() - .5),
                        vx: 8.8 * (Math.random() - .5),
                        vy: -5.4 - 7.2 * Math.random(),
                        gravity: .13 + .07 * Math.random(),
                        spin: .28 * (Math.random() - .5),
                        angle: Math.random() * Math.PI,
                        w: 4 + 5 * Math.random(),
                        h: 2 + 4 * Math.random(),
                        color: r[t % r.length]
                    })), s = performance.now(), l = e => {
                        const t = e - s;
                        a.clearRect(0, 0, n, i), o.forEach(e => {
                            e.x += e.vx, e.y += e.vy, e.vy += e.gravity, e.vx *= .992, e.angle += e.spin, a.save(), 
                            a.globalAlpha = sxClampUnit((2500 - t) / 450), a.translate(e.x, e.y), a.rotate(e.angle), a.fillStyle = e.color, 
                            a.fillRect(-e.w / 2, -e.h / 2, e.w, e.h), a.restore();
                        }), ts = t < 2500 && Eg.open ? requestAnimationFrame(l) : 0;
                    };
                    ts = requestAnimationFrame(l);
                }(), function() {
                    const e = es;
                    if (e && "closed" !== e.state) try {
                        const t = e.currentTime + .025, n = e.createGain();
                        n.gain.setValueAtTime(1e-4, t), n.gain.exponentialRampToValueAtTime(.2, t + .035), 
                        n.gain.exponentialRampToValueAtTime(1e-4, t + 1.05), n.connect(e.destination), [ [ 523.25, 0 ], [ 659.25, .13 ], [ 783.99, .26 ], [ 1046.5, .43 ] ].forEach(([i, a], r) => {
                            const o = e.createOscillator(), s = e.createGain(), l = t + a, c = l + (3 === r ? .52 : .3);
                            o.type = 3 === r ? "sine" : "triangle", o.frequency.setValueAtTime(i, l), s.gain.setValueAtTime(1e-4, l), 
                            s.gain.exponentialRampToValueAtTime(3 === r ? .72 : .52, l + .025), s.gain.exponentialRampToValueAtTime(1e-4, c), 
                            o.connect(s), s.connect(n), o.start(l), o.stop(c + .03);
                        });
                    } catch (e) { __sxErrLog("audio-blip", e); }
                }(), requestAnimationFrame(() => e.byId("dismissCompletionCelebration").focus({
                    preventScroll: !0
                }));
                try {
                    sxSendSessionStats();
                } catch (e) { __sxErrLog("audio-blip", e); }
            }
        }
        function sxSendSessionStats() {
            try {
                var t = Go;
                if (!t) return;
                var n = 0;
                try {
                    n = sxOutlineRatedCounts(t).rated || 0;
                } catch (e) { __sxErrLog("storage", e); }
                var i = 0;
                try {
                    i = sxOutlineTimerSeconds();
                } catch (e) { __sxErrLog("storage", e); }
                if (n <= 0 && i < 10) return;
                var a = "";
                try {
                    a = sxAnonUuid();
                } catch (e) { __sxErrLog("storage", e); }
                if (!a) return;
                /* Send gate above unchanged (something rated, or 10+
                   seconds elapsed). The POST goes through the shared
                   analytics path (sxSendAnalytics) with this sender's
                   legacy dedup key, so the hostname guard and the dedup
                   live there and the sent marker is written only on
                   success — a failed send can retry on a later call
                   instead of being lost for the session. */
                sxSendAnalytics({
                    action: "event",
                    uuid: a,
                    event_type: "session_stats",
                    elapsed_seconds: i,
                    topic_count: n
                }, "sexcapades_session_stats");
            } catch (e) { __sxErrLog("analytics-beacon", e); }
        }
        function sxQueueCompletionCheck() {
            t.clear(ns), ns = t.setTimeout(() => {
                if (ns = 0, !Go || !vt[Go]) return;
                const e = sxOutlineRatedCounts(Go);
                e.total > 0 && e.rated === e.total && sxShowCompletionCelebration();
            }, 160);
        }
