            // SX-PAIR-TAPER-PAINT (2026-11-24, Jason's ruling): on any
            // two-profile match tab -- Cross ⋈, Straight ⊙, Circle Minus ⊖
            // -- a topic's line wears the pair's SHARED APPETITE per flank:
            // the lower of the two profiles' appetites on that flank. One
            // consistent meaning on all three tabs; the tapers never show
            // fit, and the tab kind never enters the computation. (The fit
            // products the tapers used to show -- crossed for ⋈, straight
            // for ⊙ -- live on in the scores and rings, not the lines.
            // The 672a4c1 exclusion that kept tapers off ⊖, and the
            // 9d0c3b9 refactor that deleted the fit computation itself,
            // are both superseded by this ruling.) The appetite is the
            // stored flank intensity first, the leaning itself as the
            // derivation when unstored. Every topic has exactly two flank
            // intensities -- advocacy / receptivity on stance skins, give
            // / receive placement intensities on classic n-pole topics,
            // give / receive intensities on classic pair topics -- so an
            // octad wears two shared appetites, not eight: its eight
            // poles are positions, not appetites. Any other view -- a
            // profile tab, a cast of 3 or more, blind mode -- resolves to
            // null and the paint below is exactly the profile paint.
            function sxPairFlankAppetite(rec, dir) {
                if (!rec) return null;
                if (typeof sxIsStanceSkin === "function" && sxIsStanceSkin()) {
                    const intKey = dir === "give" ? "advocacyIntensity" : "receptivityIntensity";
                    const valKey = dir === "give" ? "advocacy" : "receptivity";
                    if (rec[intKey + "Known"]) return rec[intKey];
                    if (rec[valKey + "Known"] && typeof rec[valKey] === "number") return rec[valKey];
                    return null;
                }
                const placeKey = dir === "give" ? "givePlacementIntensity" : "receivePlacementIntensity";
                const flankKey = dir === "give" ? "giveIntensity" : "receiveIntensity";
                if (rec[placeKey + "Known"]) return rec[placeKey];
                if (rec[flankKey + "Known"]) return rec[flankKey];
                if (rec[dir + "Known"]) return rec[dir];
                return null;
            }
            function sxRawFlankAppetite(rec, dir) {
                // Same appetite rule as sxPairFlankAppetite, for a LIVE
                // stored record (no Known flags: a stored number is the
                // test). Used for 3+ source groups, where there is no
                // pair record to read parsed records from.
                if (!rec) return null;
                if (typeof sxIsStanceSkin === "function" && sxIsStanceSkin()) {
                    const intKey = dir === "give" ? "advocacyIntensity" : "receptivityIntensity";
                    const valKey = dir === "give" ? "advocacy" : "receptivity";
                    if (typeof rec[intKey] === "number") return rec[intKey];
                    if (typeof rec[valKey] === "number") return rec[valKey];
                    return null;
                }
                const placeKey = dir === "give" ? "givePlacementIntensity" : "receivePlacementIntensity";
                const flankKey = dir === "give" ? "giveIntensity" : "receiveIntensity";
                if (typeof rec[placeKey] === "number") return rec[placeKey];
                if (typeof rec[flankKey] === "number") return rec[flankKey];
                if (typeof rec[dir] === "number") return rec[dir];
                return null;
            }
            function sxGroupSharedAppetite(sourceIds, topicId) {
                // Shared appetite across a whole group: the lower of ALL
                // the sources' appetites per flank (Jason, 2026-11-24:
                // a group of three or more still shows intensities).
                // Returns null only when no source rated the topic at
                // all; a flank any source lacks an appetite for comes
                // back null (paints neutral), never an operation score.
                if (!Array.isArray(sourceIds) || sourceIds.length < 2 || typeof vt === "undefined") return null;
                let giveMin = null, recvMin = null, giveAll = true, recvAll = true, rated = false;
                for (const id of sourceIds) {
                    const r = vt[id] ? vt[id][topicId] : null;
                    if (!r) { giveAll = false; recvAll = false; continue; }
                    rated = true;
                    const g = sxRawFlankAppetite(r, "give"), v = sxRawFlankAppetite(r, "receive");
                    if (null === g) giveAll = false; else giveMin = null === giveMin ? g : Math.min(giveMin, g);
                    if (null === v) recvAll = false; else recvMin = null === recvMin ? v : Math.min(recvMin, v);
                }
                if (!rated) return null;
                return { give: giveAll ? giveMin : null, receive: recvAll ? recvMin : null };
            }
            const sxPairTapers = function() {
                if (Rt) return null;
                const tab = sxCurrentTab();
                if (!tab) return null;
                const ctx = sxTabContext(tab), ids = ctx ? ctx.ids : tab.ids;
                if (!ids || 2 !== ids.length) return null;
                const pair = sxPairByIds(ids[0], ids[1]);
                if (!pair || !pair.topicsById) return null;
                return id => {
                    const rec = pair.topicsById[id];
                    if (!rec) return null;
                    const a = rec.ratings.a, b = rec.ratings.b;
                    if (!a || !b) return null;
                    const gA = sxPairFlankAppetite(a, "give"), gB = sxPairFlankAppetite(b, "give");
                    const rA = sxPairFlankAppetite(a, "receive"), rB = sxPairFlankAppetite(b, "receive");
                    const give = null == gA || null == gB ? null : Math.min(gA, gB);
                    const receive = null == rA || null == rB ? null : Math.min(rA, rB);
                    return {
                        give: null === give ? null : zi(give),
                        receive: null === receive ? null : zi(receive)
                    };
                };
            }();

            // SpokeRenderer, HubRenderer, and LabelRenderer are hoisted above Ar().
            const sxDiscFor = sxInterestDiscFor;

            // Boot slices only. A bare yield is swallowed by an ordinary
            // paint, and the boot driver keeps stepping until its 50ms
            // budget is used, so these checks do not add a frame per topic.
            let sxBootSlice = performance.now();
            const sxActiveProfile = Vi();
            if (typeof sxEnsurePseudoProfileCurrent === "function") {
                sxEnsurePseudoProfileCurrent(sxActiveProfile);
            }
            const isPseudo = typeof sxIsPseudoProfile === "function" && sxIsPseudoProfile(sxActiveProfile);
            const pseudoMeta = isPseudo && typeof ft !== "undefined" ? ft[sxActiveProfile] : null;
            const pseudoOp = pseudoMeta ? (pseudoMeta.operation || pseudoMeta.pairOp) : null;
            const pseudoSources = isPseudo && Array.isArray(pseudoMeta.sourceProfiles) && pseudoMeta.sourceProfiles.length >= 2 ? pseudoMeta.sourceProfiles : null;
            // Pair-group tapers (Jason, 2026-11-24): a pair group profile's
            // map paints the pair's SHARED APPETITE per flank -- the lower
            // of the two sources' appetites -- the same meaning as every
            // other map. The pair record is resolved once per paint from
            // the live sources; the operation's own values stay in the
            // stored record, the rings and the lists. Pair-only: a 3+
            // source group has no pair record to share across, so it
            // keeps its operation rendering below.
            const pseudoPair = isPseudo && pseudoMeta && Array.isArray(pseudoMeta.sourceIds) && 2 === pseudoMeta.sourceIds.length && typeof sxPairByIds === "function" ? sxPairByIds(pseudoMeta.sourceIds[0], pseudoMeta.sourceIds[1]) : null;
            const getPartyHoldings = (topicId) => {
                if (!pseudoSources) return null;
                return pseudoSources.map(sp => {
                    const sRatings = sp.ratings || {};
                    const sVal = sRatings[topicId];
                    let num = null;
                    if (typeof sVal === "number") num = sVal;
                    else if (sVal && typeof sVal === "object") {
                        const g = typeof sVal.give === "number" ? sVal.give : null;
                        const r = typeof sVal.receive === "number" ? sVal.receive : null;
                        if (null !== g && null !== r) num = (g + r) / 2;
                        else if (null !== g) num = g;
                        else if (null !== r) num = r;
                        else if (typeof sVal.intensity === "number") num = sVal.intensity;
                    }
                    const col = (null === num || isNaN(num)) ? "rgba(128,128,128,0.25)" : zi(num);
                    return { name: sp.name, rating: num, color: col };
                });
            };
            const sxGetPseudoSpokeColors = (topicId, lineColor) => {
                if (!isPseudo || !vt[sxActiveProfile]) return null;
                const rec = vt[sxActiveProfile][topicId];
                if (!rec) return null;
                if (pseudoPair) {
                    // Tapers show the pair's shared appetite (Jason,
                    // 2026-11-24): the lower of the two sources'
                    // appetites per flank -- min, the bottleneck, the
                    // same meaning as every other map. The operation's
                    // own values stay in the stored record, the rings
                    // and the lists; the lines are the appetite layer.
                    // Appetite reads stored-first, leaning as
                    // derivation (the same rule as the pair-tab
                    // tapers). A flank with no appetite on either
                    // side paints neutral -- never the operation's
                    // score, which is not an appetite.
                    const prec = pseudoPair.topicsById ? pseudoPair.topicsById[topicId] : null;
                    const pa = prec && prec.ratings ? prec.ratings.a : null, pb = prec && prec.ratings ? prec.ratings.b : null;
                    const gA = sxPairFlankAppetite(pa, "give"), gB = sxPairFlankAppetite(pb, "give");
                    const rA = sxPairFlankAppetite(pa, "receive"), rB = sxPairFlankAppetite(pb, "receive");
                    const give = null == gA || null == gB ? null : Math.min(gA, gB);
                    const receive = null == rA || null == rB ? null : Math.min(rA, rB);
                    const neutral = Te(lineColor || "var(--neutral-line)");
                    const mid = null !== give && null !== receive ? zi((give + receive) / 2) : null !== give ? zi(give) : null !== receive ? zi(receive) : neutral;
                    return {
                        give: null === give ? neutral : zi(give),
                        receive: null === receive ? neutral : zi(receive),
                        mid: mid,
                        isRated: !0
                    };
                }
                const groupIds = pseudoMeta && Array.isArray(pseudoMeta.sourceIds) ? pseudoMeta.sourceIds : null;
                if (!pseudoPair && groupIds && groupIds.length > 2) {
                    // 3+ sources (Jason, 2026-11-24): the lines still show
                    // intensities -- the shared appetite is the lower of
                    // ALL the sources' appetites per flank, read from
                    // their live records. Same rule, same neutral
                    // fallback; the operation's values never paint as
                    // appetite.
                    const shared = sxGroupSharedAppetite(groupIds, topicId);
                    if (shared) {
                        const neutral = Te(lineColor || "var(--neutral-line)");
                        const mid = null !== shared.give && null !== shared.receive ? zi((shared.give + shared.receive) / 2) : null !== shared.give ? zi(shared.give) : null !== shared.receive ? zi(shared.receive) : neutral;
                        return {
                            give: null === shared.give ? neutral : zi(shared.give),
                            receive: null === shared.receive ? neutral : zi(shared.receive),
                            mid: mid,
                            isRated: !0
                        };
                    }
                }
                if (pseudoOp === "minus") {
                    const gv = typeof rec.give === "number" ? rec.give : (typeof rec.singleValue === "number" ? rec.singleValue : 0);
                    const rv = typeof rec.receive === "number" ? rec.receive : (typeof rec.singleValue === "number" ? rec.singleValue : 0);
                    if (gv <= 0 && rv <= 0) return null;
                    return {
                        give: gv > 0 ? zi(-gv) : Te(lineColor || "var(--neutral-line)"),
                        receive: rv > 0 ? zi(-rv) : Te(lineColor || "var(--neutral-line)"),
                        mid: zi(-Math.max(gv, rv)),
                        isRated: !0
                    };
                } else {
                    const gv = typeof rec.give === "number" ? rec.give : null;
                    const rv = typeof rec.receive === "number" ? rec.receive : null;
                    if (null == gv && null == rv) return null;
                    const mid = (null != gv && null != rv) ? (gv + rv) / 2 : (null != gv ? gv : rv);
                    return {
                        give: null != gv ? zi(gv) : null,
                        receive: null != rv ? zi(rv) : null,
                        mid: zi(mid),
                        isRated: !0
                    };
                }
            };
            const sxHasSomeRatings = Boolean(!Rt && typeof cs === "function" && cs(sxActiveProfile)?.rated > 0);
            for (let t = 0; t < d.branches.length; t++) {
                const e = d.branches[t];
                yield;
                if (scSeg && scCtx.frozenBranches.has(e.entry.branch.name) && scSeg.has(e.entry.catId)) { scSkipped.add(e.entry.branch.name); continue; }
                window.__sxNodeTick && window.__sxNodeTick();
                const n = e.entry, i = n.branch, a = e.angle, r = n.selected;
                if ($n && !$n.has(n.catId) && !n.topics.some(e => $n.has(e.id))) continue;
                Math.cos(a);
                const o = Xa(a, ea.lineStartRadius), o2 = Xa(a, ea.spokeStartRadius), s = yr(i), l = Xa(a, s), c = Xa(a, s - (sxIconRadius(1) - 1.5)), dCat = n.catId, h = n.filter, g = za(0, o.x, o.y, l.x, l.y, 0), m = za(0, o2.x, o2.y, c.x, c.y, 0).d, y = g.labelD, b = Ra(dCat), w = [ "node-group" ], x = ln[Vi()];
                ("rated" === Sn ? !hi(i, Vi()) : "unrated" === Sn && !mi(i, Vi())) && !r && w.push("is-hidden"), 
                x && x.has(i.name) && !Eo(Vi(), dCat) && w.push("import-added");
                const S = i.topics.some(e => {
                    const t = Wn(e);
                    return Ra(t) === Pt || u.some(e => e.parentId === t && Ra(e.id) === Pt);
                });
                "all" === Pt || b === Pt || S || w.push("is-hidden"), !Tt || String(i.name || "").toLowerCase().includes(Tt) || i.topics.some(e => sxName(e).toLowerCase().includes(Tt)) || w.push("is-dim");
                const $ = null !== Dt && (dCat === Dt || e.topics.some(e => e.topic.id === Dt || e.children.some(e => e.child.id === Dt)));
                Dt && !$ && w.push("is-dim"), Dt && dCat === Dt && w.push("is-preview");
                let E = Math.max(140, .48 * (s - ea.lineStartRadius)) + (t % 2 ? 55 : -35);
                const A = Za.categoryFontSize(i.name, g.labelWidth, E, r);
                const catFs = (sxFontSize(1) * A / 23);
                const catTextW = Za.measure(i.name, catFs, "category");
                const catGap = Math.max(22, 6 * Za.measure(" ", catFs, "category"));
                const availSpoke = s - ea.lineStartRadius - (sxIconRadius(1) || 48);
                const maxE = Math.max(20, availSpoke - catTextW - catGap);
                if (E > maxE) E = maxE;
                const catUnderlineW = Math.min(Za.categoryUnderlineLength(i.name, A), Math.max(20, availSpoke - catGap - E));
                const C = Vi(), M = Rt ? null : Qe[C]?.[dCat], I = Rt ? null : null !== fa(i, C, "give") || null !== fa(i, C, "receive") || null !== fa(i, C, "advocacyIntensity") || null !== fa(i, C, "receptivityIntensity") || null !== fa(i, C, "givePlacementIntensity") || null !== fa(i, C, "receivePlacementIntensity") || null !== fa(i, C, "intensity") ? 1 : null, P = Ne.get(i.name) || Fe(i), L = (O = I,
                B = P, Rt ? "var(--green)" : "noCode" === B.key ? Ga.NO_CODE_COLOR : Te(B.lineColor || B.color) || Ga.FALLBACK_COLOR), T = Rt ? null : fa(i, C, "give"), F = Rt ? null : fa(i, C, "receive"), N = Rt ? "var(--green)" : null === T ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(T), _ = Rt ? "var(--green)" : null === F ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(F), D = Rt || null !== I ? "" : "noCode" === P.key ? "gen1-hanky-line gen1-no-hanky-line no-hanky-code-line" : "gen1-hanky-line" + (P.mixed ? " mixed-hanky-code-line" : ""), R = Rt || null !== I || "noCode" !== P.key && !P.mixed ? "none" : "noCode" === P.key ? "5 7" : "18 12";
                var O, B;
                const sxCatHeatVals = Rt ? [] : [ T, F ].filter(v => null != v && Number.isFinite(+v));
                const sxCatHeat = sxCatHeatVals.length ? zi(sxCatHeatVals.reduce((s, v) => s + +v, 0) / sxCatHeatVals.length) : null;
                const sxCatDisc = Rt ? null : sxCategoryInterestDisc(i, C);
                const sxCatAdv = Rt ? null : fa(i, C, "advocacyIntensity"), sxCatRec = Rt ? null : fa(i, C, "receptivityIntensity");
                const sxCatGv = Rt ? null : fa(i, C, "givePlacementIntensity"), sxCatRc = Rt ? null : fa(i, C, "receivePlacementIntensity");
                // Classic pair topics have no placement intensities: the
                // branch spoke's appetite aggregate is the stored
                // per-flank intensity (cross slider, 2026-11-24), read
                // here so the spoke colours by appetite instead of the
                // leaning aggregate. Unstored falls through to the
                // leaning aggregate, which is the appetite derivation.
                const sxCatGI = Rt ? null : fa(i, C, "giveIntensity"), sxCatRI = Rt ? null : fa(i, C, "receiveIntensity");
                // CENTRED LABEL (2026-11-25): shift the category name so
                // its centre sits at the spoke's midpoint (half the
                // spoke's length from the branch node to the category
                // icon). The anchor point today is at (spokeLen -
                // labelWidth + E), its centre at that point +/- the
                // text half-width (plus on the right, minus on the left,
                // where the text ends at the anchor). The shift moves
                // the text, its risk mark and its underline together;
                // the font size and underline length still come from E
                // unchanged. (Math.cos(a) is the same test as the W
                // below: the spoke runs at the branch angle a.)
                const catSpokeLen = s - ea.lineStartRadius, catCentreShift = LabelRenderer.computeCategoryCentreShift(catSpokeLen, g.labelWidth, E, catTextW, Math.cos(a) < 0);
                const j = g.labelStartX + g.ux * E + g.ux * catCentreShift, q = g.labelStartY + g.uy * E + g.uy * catCentreShift, H = Math.atan2(l.y - o.y, l.x - o.x), W = Math.cos(H) < 0, U = W ? -g.ux : g.ux, G = j + 0 * (W ? -g.uy : g.uy), K = q - 0 * U, z = 180 * (H + (W ? Math.PI : 0)) / Math.PI, V = W ? ' text-anchor="end"' : "", Y = sxIconDiameter(1), X = Y / 2, Z = Y / 24, Q = ge[i.name], J = Xa(a, yr(i)), ee = Q ? HubRenderer.renderIcon(dCat, Y, Q, Sa(dCat, qn[dCat], C, { tapFirst: !0 }), sxCatDisc ? sxCatDisc.ring : sxCatHeat || Q.color, J.x, J.y, true, false, null, sxCatDisc) : "", te = k(dCat, M, !Rt && qa(dCat, Je), !Rt && qa(dCat, et), !Rt && Boolean(tt[C]?.[dCat]?.length), J, g.ux, g.uy), ne = j - 11 * g.ux, ie = q - 11 * g.uy, ae = i.risk ? `<text class="risk-mark" x="${ne.toFixed(2)}" y="${ie.toFixed(2)}" dy="-8" text-anchor="middle" transform="rotate(${z.toFixed(2)} ${ne.toFixed(2)} ${ie.toFixed(2)})" aria-hidden="true">*</text>` : "", re = r ? h.hidden : n.topics.length, oe = X + 20, se = HubRenderer.renderBadges(J.x, J.y, re, dCat, -g.ux, -g.uy, oe, true), le = r ? function(e, t, n, i, a, r) {
                    if (!n) return "";
                    const o = `+${n} more`, s = Math.max(58, 7 * o.length + 16), l = i + s / 2 * Math.abs(a) + 12 * Math.abs(r), c = t + r * l;
                    return `<g class="hidden-count-badge density-count-badge" data-width="${s}" transform="translate(${(e + a * l - s / 2).toFixed(2)} ${(c - 12).toFixed(2)})" role="note" aria-label="${n} more ${1 === n ? "topic" : "topics"} hidden by hypermap density"><rect width="${s}" height="24" rx="7"/><text x="${(s / 2).toFixed(2)}" y="12" text-anchor="middle" dominant-baseline="middle">${o}</text></g>`;
                }(l.x, l.y, n.densityHidden, X, g.ux, g.uy) : "";
                const branchSpokeSvg = SpokeRenderer.renderBranchSpoke(dCat, m, i.name, g.nx, g.ny, o2.x, o2.y, c.x, c.y, sxCatHeat, L, D, null != sxCatAdv ? zi(sxCatAdv) : null != sxCatGv ? zi(sxCatGv) : null != sxCatGI ? zi(sxCatGI) : null === I ? L : N, null != sxCatRec ? zi(sxCatRec) : null != sxCatRc ? zi(sxCatRc) : null != sxCatRI ? zi(sxCatRI) : null === I ? L : _, ("noCode" === P.key ? Ga.FALLBACK_COLOR : P.lineColor || P.color || Ga.FALLBACK_COLOR), "noCode" === P.key, null !== I || null != sxCatAdv || null != sxCatRec || null != sxCatGv || null != sxCatRc || null != sxCatGI || null != sxCatRI, p, SpokeGeometry.buildBaseCircle(pr.centerX, pr.centerY, gen1SpokeBaseRadius()), sxIconDiameter(1));
                v += `<g class="${w.join(" ")} gen1-line-group" data-layout-key="${dCat}" data-layout-x="${J.x.toFixed(2)}" data-layout-y="${J.y.toFixed(2)}" data-icon-distance-override="${g.labelWidth.toFixed(2)}" data-rated="${null === I ? "false" : "true"}" style="--profile-color:${f};--family-color:${sxCatHeat || (Q && Q.color) || Ga.FALLBACK_COLOR};--gen1-line-color:${sxCatHeat || L};--gen1-line-dash:${R}">${branchSpokeSvg}${sxCatHeat ? `<path class="branch-heat" d="${m}" fill="none" stroke="${sxCatHeat}" stroke-width="4" vector-effect="non-scaling-stroke" stroke-linecap="round" pointer-events="none"/>` : ""}${ee}${te}${ae}${se}${le}<path id="p-${dCat}" d="${y}" fill="none" stroke="transparent"/><line class="node-label-underline" style="stroke:${f}" data-offset="0" x1="${j.toFixed(2)}" y1="${q.toFixed(2)}" x2="${(j + g.ux * catUnderlineW).toFixed(2)}" y2="${(q + g.uy * catUnderlineW).toFixed(2)}"/><text class="category-label" data-id="${dCat}" data-path-id="p-${dCat}" data-label-offset="${E}" ${Sa(dCat, qn[dCat], C)} tabindex="0" role="button" aria-expanded="${r}" aria-label="${Hi(i.name)}${i.risk ? ", higher-risk practice requiring specialized knowledge and explicit negotiation" : ""}${x && x.has(i.name) ? ", contains newly imported additions" : ""}. ${r ? `${h.mode} children shown; press Enter to collapse` : `Children hidden; press Enter to expand with ${h.mode} children`}; press Shift Enter for description and markers." style="font-size:${catFs.toFixed(2)}px" x="${G.toFixed(2)}" y="${K.toFixed(2)}" dominant-baseline="middle"${V} transform="rotate(${z.toFixed(2)} ${G.toFixed(2)} ${K.toFixed(2)})">${Hi(i.name)}</text></g>`;
                for (let sxTi = 0; sxTi < e.topics.length; sxTi++) {
                    const t = e.topics[sxTi];
                    if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                    window.__sxNodeTick && window.__sxNodeTick();
                    const n = t.topic, a = n.label, r = n.id, o = Boolean(n.isSubcategory);
                    if ($n && !$n.has(r)) continue;
                    t.angle;
                    const s = t.cloudAngle, c = t.cloudRadius || e.topicCloudRadius, u = Za.topicSpokeEstimate(a, c), p = u.fontSize;
                    let h = u.spokeLength;
                    const hubRadius1 = sxIconRadius(1);
                    const leafRadius2 = sxIconRadius(2);
                    if (o) {
                        const e = hubRadius1 + leafRadius2 + 96;
                        h = Math.max(h, e, sxSpokeBase(t.cloudCount, 1)), h = Za.hubSpokeLength(a, p, h, hubRadius1, leafRadius2);
                    }
                    // Per-subcategory length override (Build
                    // 2026-10-20_0023): the multiplier is applied to the
                    // drawn length here, where the spoke endpoint is
                    // finalized; subcatOverrides is keyed by topic label.
                    // The shipped defaults carry the tuned lengths, so
                    // the stock layout draws the same lengths the
                    // collision estimate already assumed.
                    if (o) h = applyLengthOverride(h, a, mn.subcatOverrides);
                    // Per-kink length override (Build 2026-10-19_0255):
                    // applied here, where the spoke endpoint is
                    // finalized; kinkOverrides is keyed by topic id and
                    // defaults to {} so the stock layout is unchanged.
                    if (!o) h = applyLengthOverride(h, r, mn.kinkOverrides);
                    const fsEst = sxFontSize(2) * 14 / 17;
                    const textWEst = Za.measure(a, fsEst, "topic");
                    const gapEst = Math.max(18, 6 * Za.measure(" ", fsEst, "topic"));
                    const minReqSpoke = hubRadius1 + leafRadius2 + textWEst + gapEst + 28;
                    if (h < minReqSpoke) h = minReqSpoke;
                    const g = l.x + Math.cos(s) * h, m = l.y + Math.sin(s) * h, y = Ya(l.x, l.y, g, m, hubRadius1), b = Math.max(12, Math.min(17, Za.fittedSize(a, y.labelWidth, void 0))), w = y.labelD, x = o ? "all" : Ra(r);
                    const E = [ "node-group" ];
                    o && E.push("subcategory-node");
                    const D = Vi();
                    const R = Rt ? null : o ? function(e, t) {
                        return pa((e?.topics || []).map(Wn), t, e => ua(e, t));
                    }(n.group, D) : ua(r, D);
                    const A = cn[D], C = dn[D];
                    o || Rt || !Qi() && !Kd() || !qa(r, Je) || E.push("is-fantasy-only"), o || Rt || !Qi() && !Kd() || !qa(r, et) || E.push("is-already-tried"), 
                    !o && A && A.has(r) && !Eo(D, r) && E.push("import-updated"), !o && C && C.has(r) && !Eo(D, r) && E.push("import-newest");
                    const M = n.allImported.some(e => Ra(e.id) === Pt);
                    "all" === Pt || o || x === Pt || M || E.push("is-hidden"), !Tt || String(a || "").toLowerCase().includes(Tt) || String(i.name || "").toLowerCase().includes(Tt) || n.allImported.some(e => String(e.label || "").toLowerCase().includes(Tt)) || E.push("is-dim");
                    if (sxIsBranchLimited(r, D)) E.push("is-hidden");
                    o && n.unratedHub && E.push("is-unrated"); /* DIMFIX F2 (was HUB-BACKBONE W4): the dim reads the F1 rating-presence flag, not the Net-filtered allImported list; the dedicated class (never is-dim) keeps selection/focus precedence clean */
                    !o && !Rt && (Kd() ? !sxTopicKnownInOpenGroup(r) : (sxHasSomeRatings && null === R)) && E.push("is-unrated");
                    const I = null !== Dt && (r === Dt || dCat === Dt || t.children.some(e => e.child.id === Dt));
                    Dt && !I && E.push("is-dim"), Dt && r === Dt && E.push("is-preview");
                    const P = Za.topicLabelOffset(y.routedLength, y.labelOffset, t.cloudIndex), L = Math.cos(s) < 0, T = L ? `pr-${r}` : `p-${r}`;
                    const hubR2 = sxIconRadius(1);
                    const iconR2 = sxIconRadius(2);
                    let fs2 = (sxFontSize(2) * b / 17);
                    let textW2 = Za.measure(a, fs2, "topic");
                    let renderedW2 = textW2 - 6 * Math.max(0, a.length - 1);
                    const maxSpan2 = Math.max(10, y.routedLength - hubR2 - iconR2 - 28);
                    if (renderedW2 > maxSpan2) {
                        const fitScale2 = Math.min(1, maxSpan2 / Math.max(1, renderedW2));
                        fs2 = Math.max(9, fs2 * fitScale2);
                        textW2 = Za.measure(a, fs2, "topic");
                        renderedW2 = textW2 - 6 * Math.max(0, a.length - 1);
                    }
                    let F, N;
                    // CENTRED LABEL (2026-11-25): the label's centre
                    // sits at the spoke's midpoint (half the routed
                    // length from the hub to the icon) — its position
                    // along the spoke, not its orientation, is what
                    // changed. Rendered width = measured width minus
                    // the halo (6 per character gap) the render does
                    // not draw.
                    const centred2 = LabelRenderer.computeCenteredOffset(y.routedLength, renderedW2, hubR2, iconR2, L);
                    F = centred2.offset;
                    N = centred2.anchor;
                    const sxRevPath = L ? `<path id="pr-${r}" class="concept-path" d="${y.reverseD}" fill="none" stroke="transparent"/>` : "", O = o || Rt ? null : Qe[D]?.[r], B = o ? Ae(a, i.name) : Oe(a, i.name), j = o || Rt ? null : ca(r, D), q = o && !Rt ? ya(n.group, D, "give", r) : null, H = o && !Rt ? ya(n.group, D, "receive", r) : null;
                    const shape2 = Ge(r, D);
                    const isTriple2 = Boolean(shape2 && shape2.keys && shape2.keys.length === 3);
                    let W, U, midVal2 = null, midKnown2 = !1;
                    if (isTriple2 && j) {
                        const k0 = shape2.keys[0], k1 = shape2.keys[1], k2 = shape2.keys[2];
                        W = j[k0 + "Known"] ? j[k0] : null;
                        midKnown2 = Boolean(j[k1 + "Known"]);
                        midVal2 = midKnown2 ? j[k1] : null;
                        U = j[k2 + "Known"] ? j[k2] : null;
                    } else {
                        W = j && j.giveKnown ? j.give : q;
                        U = j && j.receiveKnown ? j.receive : H;
                    }
                    const G = o ? Q.color : Rt ? "var(--green)" : null === R ? Te(B.lineColor) : zi(R), K = Rt ? "var(--green)" : null === W ? Te(B.lineColor) : zi(W), z = Rt ? "var(--green)" : null === U ? Te(B.lineColor) : zi(U);
                    const midColor2 = isTriple2 && midKnown2 ? zi(midVal2) : (K || z || B.lineColor);
                    const sxIconInterest = !Rt && !isPseudo && !sxPairTapers && !getPartyHoldings(r) ? (o ? sxSubInterestDisc(n.group, D, r) : sxDiscFor(j, shape2)) : null;
                    const V = y.icon.x, Y = y.icon.y, X = n.allImported, Z = n.topicFilter, J = on.has(r), ee = o ? Sa(r, qn[r], D, { tapFirst: !0 }) : ka(a, $e(qn[r], B, R, {
                        key: B.hankyKey
                    }, O), xa(r, D), { tapFirst: !0 }), te = sxIconDiameter(2), ne = te / 2, ie = te / 6, ae = te / 24, re = HubRenderer.renderIcon(r, te, B, ee, sxIconInterest ? sxIconInterest.ring : B.color, V, Y, false, o, getPartyHoldings(r), sxIconInterest), oe = o ? "" : k(r, O, !Rt && qa(r, Je), !Rt && qa(r, et), !Rt && Boolean(tt[D]?.[r]?.length), y.icon, y.ux, y.uy), se = J ? Z.hidden : X.length || (o ? n.group.topics.length : 0), /* HUB-BACKBONE badge: a wholly-unrated collapsed hub wears +N with N = its TOTAL topic count (owner ruling 2026-10-23); expanded and partially-rated hubs keep today's counts; plain topics unchanged */ le = HubRenderer.renderBadges(y.icon.x, y.icon.y, se, r, y.ux, y.uy, ne + 20), ce = X.length ? ` aria-expanded="${J}"` : "", de = X.length ? `${J ? "Topics shown" : "Topics hidden"}; press Enter to ${J ? "collapse" : "expand"}. ` : "", sxFl = isPseudo ? sxGetPseudoSpokeColors(r, B ? B.lineColor : null) : (sxPairTapers ? sxPairTapers(r) : null), sxPlC2 = sxFl ? null : sxPlacementFlankColors(j), sxPlS2 = sxFl ? null : sxSubPlacementFlankColors(o ? n.group : null, D, r), peTr = Ga.trimToIcons(l.x, l.y, V, Y, sxIconRadius(1), sxIconRadius(2)), peT = `M ${peTr.sx0.toFixed(2)} ${peTr.sy0.toFixed(2)} L ${peTr.sx1.toFixed(2)} ${peTr.sy1.toFixed(2)}`, ue = o ? renderKinkLine(l.x, l.y, V, Y, B.hankyKey, Rt ? "var(--green)" : null != R ? zi(R) : Te(B.lineColor), sxFl ? sxFl.give : sxPlS2 ? sxPlS2.give : Rt || null !== q ? K : null, sxFl ? sxFl.receive : sxPlS2 ? sxPlS2.receive : Rt || null !== H ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, pr.subcategoryIcon, sxIconDiameter(1), sxIconDiameter(2), 2) : renderKinkLine(l.x, l.y, V, Y, B.hankyKey, Rt ? "var(--green)" : (sxFl && sxFl.mid ? sxFl.mid : midColor2), sxFl ? sxFl.give : sxPlC2 ? sxPlC2.give : Rt || (isTriple2 ? j && j[shape2.keys[0] + "Known"] : j && j.giveKnown) ? K : null, sxFl ? sxFl.receive : sxPlC2 ? sxPlC2.receive : Rt || (isTriple2 ? j && j[shape2.keys[2] + "Known"] : j && j.receiveKnown) ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, 48, sxIconDiameter(1), sxIconDiameter(2), 2), pe = o ? "" : `<g class="second-gen-rating-controls-only">${SpokeRenderer.renderTopicSpoke(r, peT, a, y.nx, y.ny, l.x, l.y, V, Y, true, pr.topicIcon, G, true, "", null, null, null, false, true, h.length, null, sxIconDiameter(2), 2)}</g>`, he = o ? "map-label concept-path-label subcategory-label" : "map-label concept-path-label hanky-topic-label", ge = o ? `${Hi(a)} subcategory. ${de}` : `${Hi(a)}. ${de}Press Shift Enter for description and markers.`;
                    v += `<g class="${E.join(" ")}" data-layout-key="${r}" data-layout-x="${V.toFixed(2)}" data-layout-y="${Y.toFixed(2)}" data-has-visible-children="${t.children.length ? "true" : "false"}" data-hanky-color="${B.hankyKey}" data-rated="${null === R && !(o && !Rt && (null !== ya(n.group, D, "advocacyIntensity", r) || null !== ya(n.group, D, "receptivityIntensity", r) || null !== ya(n.group, D, "givePlacementIntensity", r) || null !== ya(n.group, D, "receivePlacementIntensity", r) || null !== ya(n.group, D, "intensity", r))) ? "false" : "true"}" style="--profile-color:${f};--family-color:${o ? Q.color : B.color};--hanky-color:${B.labelColor};--hanky-label-stroke:${B.labelStroke}">${ue}${pe}${re}${oe}${le}<path id="p-${r}" class="concept-path" d="${w}" fill="none" stroke="transparent"/>${sxRevPath}<text class="${he}" data-topic-id="${r}" data-id="${r}" data-path-id="p-${r}" data-label-offset="${F.toFixed(2)}" ${Sa(r, qn[r], D)} tabindex="0" role="button"${ce} aria-label="${ge}" style="font-size:${fs2.toFixed(2)}px" dominant-baseline="middle" xml:space="preserve"><textPath href="#${T}" xlink:href="#${T}" startOffset="${F.toFixed(2)}"${N}${centred2.textLengthAttr}>${Hi(a)}</textPath></text></g>`,
                    t.children.forEach(e => {
                        window.__sxNodeTick && window.__sxNodeTick();
                        // Per-kink length override for subcategory
                        // children (Build 2026-10-19_0255, same fix as
                        // the gen-2 draw above): the child's drawn
                        // radius scales by this multiplier.
                        var _childKinkMul = applyLengthOverride(1, e.child && e.child.id, mn.kinkOverrides);
                        const n = e.child, o = Boolean(n.isStaticTopic), s = o ? e.cloudAngle : e.angle, l = o ? (function() {
                            let r = (e.cloudRadius || t.childCloudRadius || 270) * _childKinkMul;
                            // LABEL CLEARANCE AT PAINT (repair,
                            // 2026-11-01): a static child's label is
                            // measured at the standard unit U (22 x fontScale) from
                            // cloudLabel's offset along this spoke,
                            // with no fitted-size shrink, so a child
                            // spoke shorter than hub clearance +
                            // label + icon seats the label under
                            // the hub icon or under the child's own
                            // icon (the impinging labels of the
                            // 2026-11-01 inspection). When the
                            // spoke is too short for its label,
                            // extend THIS child's drawn radius to
                            // the clearance length; longer spokes
                            // are untouched and no other node's
                            // geometry moves.
                            r = sxLabelClearance(r, n.label);
                            return {
                                x: V + Math.cos(s) * r,
                                y: Y + Math.sin(s) * r
                            };
                        })() : Xa(s, hr(3) + 1700), c = function(e, t, n = 0) {
                            return Za.adaptivePlacement(e, t, n);
                        }(e, 3, Math.hypot(V - pr.centerX, Y - pr.centerY)), u = !o && Number.isFinite(Number(bt[n.id])) ? Number(bt[n.id]) : 0, p = o ? Ya(V, Y, l.x, l.y, pr.subcategoryIcon / 2) : function(e, t, n, i, a, r, o, s = 35, l = !1, c = null, d = null, u = 0, p = .32) {
                            const h = Xa(r, Math.hypot(n - pr.centerX, i - pr.centerY)), g = Math.max(1, Math.hypot(h.x - e, h.y - t)), m = (h.x - e) / g, f = (h.y - t) / g, y = -f, b = m, v = `M ${e.toFixed(2)} ${t.toFixed(2)} L ${h.x.toFixed(2)} ${h.y.toFixed(2)}`, w = `M ${h.x.toFixed(2)} ${h.y.toFixed(2)} L ${e.toFixed(2)} ${t.toFixed(2)}`, k = g, x = Va(e, t, m, f, k), S = Number.isFinite(c) ? c : Math.max(38, s + 12), $ = Math.min(.42 * k, S), E = Za.curveLabel(k, d, p), A = x($), C = E.labelOffset, M = x(.28 * k), I = x(.72 * k);
                            return {
                                d: v,
                                labelD: v,
                                reverseD: w,
                                routedLength: k,
                                labelWidth: E.labelWidth,
                                labelOffset: C,
                                icon: A,
                                ux: m,
                                uy: f,
                                nx: y,
                                ny: b,
                                c1: M,
                                c2: I,
                                bend: 0,
                                pointAtDistance: x
                            };
                        }(V, Y, l.x, l.y, 0, s, hr(3), pr.importedIcon / 2 + 10, e.curve, 270, c.offset, u, c.limit), h = Math.cos(s) < 0, g = h ? `pr-${n.id}` : `p-${n.id}`;
                        let fs3 = sxFontSize(3);
                        let textW3 = Za.measure(n.label, fs3, "topic");
                        let renderedW3 = textW3 - 6 * Math.max(0, n.label.length - 1);
                        const hubR3 = sxIconRadius(2);
                        const iconR3 = sxIconRadius(3);
                        const maxSpan3 = Math.max(10, p.routedLength - hubR3 - iconR3 - 28);
                        if (renderedW3 > maxSpan3) {
                            const fitScale3 = Math.min(1, maxSpan3 / Math.max(1, renderedW3));
                            fs3 = Math.max(9, fs3 * fitScale3);
                            textW3 = Za.measure(n.label, fs3, "topic");
                            renderedW3 = textW3 - 6 * Math.max(0, n.label.length - 1);
                        }
                        let m, y;
                        // CENTRED LABEL (2026-11-25): same as the
                        // cloud-topics loop above — the label's centre
                        // sits at the spoke's midpoint.
                        const centred3 = LabelRenderer.computeCenteredOffset(p.routedLength, renderedW3, hubR3, iconR3, h);
                        m = centred3.offset;
                        y = centred3.anchor;
                        const b = h ? `<path id="pr-${n.id}" class="concept-path" d="${p.reverseD}" fill="none" stroke="transparent"/>` : "", w = Rt ? null : ua(n.id, D), x = Rt ? null : Qe[D]?.[n.id], S = Rt ? null : ca(n.id, D), $ = Le(n.label, i.name);
                        const shape3 = Ge(n.id, D);
                        const isTriple3 = Boolean(shape3 && shape3.keys && shape3.keys.length === 3);
                        let E, A, midVal3 = null, midKnown3 = !1;
                        if (isTriple3 && S) {
                            const k0 = shape3.keys[0], k1 = shape3.keys[1], k2 = shape3.keys[2];
                            E = S[k0 + "Known"] ? S[k0] : null;
                            midKnown3 = Boolean(S[k1 + "Known"]);
                            midVal3 = midKnown3 ? S[k1] : null;
                            A = S[k2 + "Known"] ? S[k2] : null;
                        } else {
                            E = S && S.giveKnown ? S.give : null;
                            A = S && S.receiveKnown ? S.receive : null;
                        }
                        const M = Rt ? "var(--green)" : null === E ? Te($.lineColor) : zi(E), I = Rt ? "var(--green)" : null === A ? Te($.lineColor) : zi(A), P = Rt ? "var(--green)" : null === w ? Te($.lineColor) : zi(w), L = Oe(n.label, i.name), T = sxIconDiameter(3), F = T / 2, N = p.icon.x, _ = p.icon.y, R = Boolean(Tt && (String(n.label || "").toLowerCase().includes(Tt) || String(a || "").toLowerCase().includes(Tt) || String(i.name || "").toLowerCase().includes(Tt))), O = [ "node-group", o ? "subcategory-topic" : "imported-child" ];
                        !Rt && (Qi() || Kd()) && qa(n.id, Je) && O.push("is-fantasy-only"), !Rt && (Qi() || Kd()) && qa(n.id, et) && O.push("is-already-tried"), 
                        C && C.has(n.id) && !Eo(Vi(), n.id) && O.push("import-newest"), "all" !== Pt && Ra(n.id) !== Pt && O.push("is-hidden"), 
                        sxIsBranchLimited(n.id, D) && O.push("is-hidden"),
                        Tt && !R && O.push("is-dim"), !Rt && (Kd() ? !sxTopicKnownInOpenGroup(n.id) : (sxHasSomeRatings && null === w)) && O.push("is-unrated");
                        const B = null !== Dt && (n.id === Dt || r === Dt || dCat === Dt);
                        Dt && !B && O.push("is-dim"), Dt && n.id === Dt && O.push("is-preview");
                        const midColor3 = isTriple3 && midKnown3 ? zi(midVal3) : $.lineColor;
                        const j = !o && Boolean(si(n.id)) ? ` Tap to adopt it into ${wt[Vi()] || "the active profile"} unrated, then use the normal give and receive controls.` : "";
                        const sxIconInterest3 = !Rt && !isPseudo && !sxPairTapers && !getPartyHoldings(n.id) ? sxDiscFor(S, shape3) : null;
                        const q = HubRenderer.renderIcon(n.id, T, L, ka(n.label, $e(n, L, w, $, x), xa(n.id, D), { tapFirst: !0 }), sxIconInterest3 ? sxIconInterest3.ring : L.color, N, _, false, false, getPartyHoldings(n.id), sxIconInterest3);
                        const H = k(n.id, x, !Rt && qa(n.id, Je), !Rt && qa(n.id, et), !Rt && Boolean(tt[D]?.[n.id]?.length), p.icon, p.ux, p.uy), sxFl = isPseudo ? sxGetPseudoSpokeColors(n.id, $.lineColor) : (sxPairTapers ? sxPairTapers(n.id) : null), sxPlC3 = sxFl ? null : sxPlacementFlankColors(S), pTr = Ga.trimToIcons(V, Y, o ? N : l.x, o ? _ : l.y, sxIconRadius(2), sxIconRadius(3)), pT = `M ${pTr.sx0.toFixed(2)} ${pTr.sy0.toFixed(2)} L ${pTr.sx1.toFixed(2)} ${pTr.sy1.toFixed(2)}`, W = o ? renderKinkLine(V, Y, N, _, $.key, sxFl && sxFl.mid ? sxFl.mid : midColor3, sxFl ? sxFl.give : sxPlC3 ? sxPlC3.give : Rt || (isTriple3 ? S && S[shape3.keys[0] + "Known"] : S && S.giveKnown) ? M : null, sxFl ? sxFl.receive : sxPlC3 ? sxPlC3.receive : Rt || (isTriple3 ? S && S[shape3.keys[2] + "Known"] : S && S.receiveKnown) ? I : null, sxFl ? !0 : null !== w, e.cloudCount, n.id, n.label, D, pr.subcategoryIcon, 48, sxIconDiameter(2), sxIconDiameter(3), 3) : "", U = o ? `<g class="second-gen-rating-controls-only">${SpokeRenderer.renderTopicSpoke(n.id, pT, n.label, p.nx, p.ny, V, Y, N, _, true, pr.topicIcon, P, true, "", null, null, null, false, true, h.length, null, sxIconDiameter(3), 3)}</g>` : SpokeRenderer.renderTopicSpoke(n.id, pT, n.label, p.nx, p.ny, V, Y, l.x, l.y, false, pr.importedIcon, P, true, null === w && "noCode" === $.key ? "no-hanky-code-line" : "", null, null, $.lineColor, "noCode" === $.key, null !== w, h.length, SpokeGeometry.buildBaseCircle(V, Y, sxIconRadius(2)), sxIconDiameter(3), 3), G = o ? `${Hi(n.label)} in ${Hi(a)}. Press Shift Enter for description and markers.` : `${Hi(n.label)}, imported under ${Hi(a)}.${Hi(j)} Press Shift Enter for description and markers.`;
                        v += `<g class="${O.join(" ")}" data-layout-key="${n.id}" data-layout-x="${N.toFixed(2)}" data-layout-y="${_.toFixed(2)}" data-rated="${null === w && !(S && (S.advocacyIntensityKnown || S.receptivityIntensityKnown || S.givePlacementIntensityKnown || S.receivePlacementIntensityKnown || S.intensityKnown || S.polesKnown || S.lineKnown)) ? "false" : "true"}" style="--profile-color:${f};--family-color:${Q.color}">${W}${U}${q}${H}<path id="p-${n.id}" class="concept-path" d="${p.labelD}" fill="none" stroke="transparent"/>${b}<text class="map-label concept-path-label${o ? " hanky-topic-label" : ""}" data-topic-id="${n.id}" data-id="${n.id}" data-path-id="p-${n.id}" data-label-offset="${m.toFixed(2)}" ${Sa(n.id, n, D)} tabindex="0" role="button" aria-label="${G}" style="font-size:${fs3.toFixed(2)}px" dominant-baseline="middle" xml:space="preserve"><textPath href="#${g}" xlink:href="#${g}" startOffset="${m.toFixed(2)}"${y}${centred3.textLengthAttr}>${Hi(n.label)}</textPath></text></g>`;
                    });
                }
            }
            n(In, v);
            window.__sxLoad && window.__sxLoad(90 /* F5 checkpoint contract (at __sxProgressWidget in index.html): displayed band value — markup injected */);
            (function() {
                const e = In.querySelector(".common-overlap-layer");
                if (!e) return;
                const t = document.createElementNS("http://www.w3.org/2000/svg", "g");
                t.setAttribute("class", "common-overlap-layer branch-relation-layer"), t.setAttribute("aria-hidden", "true"), 
                e.querySelectorAll(":scope > .common-overlap-link").forEach(e => t.appendChild(e)), 
                t.childNodes.length ? (In.appendChild(t), e.childNodes.length || e.remove()) : e.childNodes.length || e.remove();
            })();
            (function() {
                // Segment paint (P1) splice: re-insert each retained
                // frozen segment whose branch the string build just
                // skipped. The segment's extracted pieces are moved
                // back into the captured group as direct children
                // (stems, then controls, then label, then badge;
                // pieces already inside the group stay where they
                // are), then a deep clone of the assembled group is
                // spliced into the layer at its capture-order
                // position. The clone is what gets spliced - never
                // the long-lived captured original - so the wiring
                // passes below attach exactly one set of listeners,
                // exactly as for a fresh-built group. From here on
                // the spliced group is indistinguishable from a fresh
                // one for the settle pass, extraction and overlay.
                // Blit session (P3): while a session is live and
                // this paint continues it (same frozen set), the
                // frozen segments are NOT spliced into the visible
                // flow at all - the raster image stands in for them
                // and the end-of-paint step (blitPaintEnd) vaults the
                // captured segments instead. Boundary events logged
                // by this paint's solve do not break the session:
                // under a contained scope they are suppressed
                // coupling candidates that do not change frozen
                // geometry.
                if (blitSess && blitSess.swapped && scCtx && blitSameFrozen(scCtx.frozenBranches, blitSess.frozen)) return;
                if (!scSeg || !scSeg.size) return;
                const scTSp0 = performance.now();
                try {
                    const present = new Map;
                    In.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => {
                        el.parentNode === In && present.set(el.dataset.layoutKey, el);
                    });
                    // Ordered-walk insertion (P1 perf): the splice
                    // candidates are resolved up front, under the same
                    // skip conditions the per-clone loop applied, then
                    // sorted by their scSegOrder position (stable; a
                    // key missing from scSegOrder sorts as -1, exactly
                    // where the old indexOf scan started) and each
                    // clone's anchor is found by one cursor walk over
                    // the initially-present keys in scSegOrder order,
                    // instead of a per-clone indexOf + forward rescan.
                    // Insertions only ever add candidates at their own
                    // positions, so the first initially-present key
                    // after a candidate's position is exactly the
                    // anchor the rescan found.
                    const scOrderIx = new Map;
                    scSegOrder && scSegOrder.forEach((k, ix) => { scOrderIx.has(k) || scOrderIx.set(k, ix); });
                    const scCands = [];
                    scSeg.forEach((seg, key) => {
                        if (!seg.branch || !scSkipped.has(seg.branch) || present.has(key)) return;
                        const el = scKeep.get(key);
                        el && scCands.push({ seg: seg, key: key, el: el, ix: scOrderIx.has(key) ? scOrderIx.get(key) : -1 });
                    }), scCands.sort((a, b) => a.ix - b.ix);
                    const scPresentSeq = [], scPresentIx = [];
                    scSegOrder && scSegOrder.forEach(k => { present.has(k) && (scPresentSeq.push(k), scPresentIx.push(scOrderIx.get(k))); });
                    let scCur = 0;
                    scCands.forEach(cand => {
                        const seg = cand.seg, key = cand.key, el = cand.el;
                        const scTA0 = performance.now();
                        seg.stems.forEach(p => {
                            p && p.parentNode !== el && el.appendChild(p);
                        }), seg.controls.forEach(p => {
                            p && p.parentNode !== el && el.appendChild(p);
                        }), seg.label && seg.label.parentNode !== el && el.appendChild(seg.label), seg.badge && seg.badge.parentNode !== el && el.appendChild(seg.badge);
                        let incomplete = !1;
                        (seg.labelStack && (!seg.label || seg.label.parentNode !== el)) && (incomplete = !0), (seg.badgeStack && (!seg.badge || seg.badge.parentNode !== el)) && (incomplete = !0), 
                        (seg.controlsStack && seg.controls.some(p => !p || p.parentNode !== el)) && (incomplete = !0), (seg.stemsStack && seg.stems.some(p => !p || p.parentNode !== el)) && (incomplete = !0), 
                        incomplete && scSegDiverged++;
                        const clone = el.cloneNode(!0);
                        scTAsm += performance.now() - scTA0;
                        const scTI0 = performance.now();
                        while (scCur < scPresentSeq.length && scPresentIx[scCur] <= cand.ix) scCur++;
                        const anchor = scCur < scPresentSeq.length ? present.get(scPresentSeq[scCur]) : null;
                        anchor ? In.insertBefore(clone, anchor) : In.appendChild(clone), present.set(key, clone), scSegDone.add(key), scTIns += performance.now() - scTI0;
                    });
                } catch (_) { __sxErrLog("layout-scoped-paint-splice", _); }
                scTSplice = performance.now() - scTSp0;
            })();
            sxWireMapListeners();
            if (vn) {
                const e = In.querySelector(`.hidden-count-badge[data-id="${CSS.escape(vn)}"]`), t = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                e && Bt && !t && "function" == typeof e.animate && e.animate([ {
                    opacity: .55,
                    filter: "brightness(1)"
                }, {
                    opacity: 1,
                    filter: "brightness(1.35)"
                }, {
                    opacity: 1,
                    filter: "brightness(1)"
                } ], {
                    duration: 300,
                    easing: "cubic-bezier(.2,.8,.2,1)"
                }), vn = null;
            }
            yield;
            // Settle Engine (Build 2026-11-21): Delegated to 03e2-settle-engine.js.
            // Two-pass settle: Pass 1 seats every icon, widget, and label;
            // Pass 2 (sxFinaliseStems) re-emits tapered stems from settled endpoints.
            try {
                yield* sxRunNodeSettle(scCtx, blitSess);
            } catch (e) {
                console.warn("Direction controls kept at their fallback positions.", e);
            }
            try {
                if (!In.querySelector(":scope > .spoke-underlay")) {
                    const e = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    e.setAttribute("class", "spoke-underlay"), e.setAttribute("aria-hidden", "true");
                    const sxUnderGroups = Array.from(In.querySelectorAll(".node-group[data-layout-key]"));
                    for (let sxUi = 0; sxUi < sxUnderGroups.length; sxUi++) {
                        const t = sxUnderGroups[sxUi];
                        if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                        const n = [];
                        t.querySelectorAll(vr).forEach(el => {
                            __sxClosestAction(el, "directionControl") || __sxClosestAction(el, "secondGenRatingControls") || el.classList.contains("visual-rail") && el.classList.contains("rating-rail") || n.push(el);
                        });
                        if (!n.length) continue;
                        const i = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        i.setAttribute("class", `${t.getAttribute("class") || ""} spoke-underlay-item`);
                        const a = t.getAttribute("style");
                        a && i.setAttribute("style", a), i.dataset.spokeFor = t.dataset.layoutKey, n.forEach(el => i.appendChild(el)),
                        e.appendChild(i);
                    }
                    e.childNodes.length && In.insertBefore(e, In.firstChild);
                }
            } catch (e) {
                console.warn("Spoke underlay kept in groups.", e);
            }
            window.__sxLoad && window.__sxLoad(93 /* F5 checkpoint: spoke underlays and geometry settled */);
            yield "paint";
            const S = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, $ = new Set, E = [], A = [], C = [], M = "lite" === Kp ? 18 : 48;
            In.querySelectorAll("[data-layout-key]").forEach(e => {
                const t = e.dataset.layoutKey, n = {
                    x: Number(e.dataset.layoutX),
                    y: Number(e.dataset.layoutY)
                }, i = r.has(t), o = r.get(t);
                if ($.add(t), fn.set(t, n), a && !S && i && o && Number.isFinite(o.x) && Number.isFinite(o.y)) {
                    const t = o.x - n.x, i = o.y - n.y, a = Math.hypot(t, i);
                    a > .5 && E.push({
                        group: e,
                        dx: t,
                        dy: i,
                        distance: a
                    });
                } else a && !S && r.size && !i && !e.classList.contains("is-hidden") && C.length < M && C.push(e);
            }), a && !S && (o.forEach((e, t) => {
                $.has(t) || (e.style.pointerEvents = "none", e.setAttribute("aria-hidden", "true"), 
                e.classList.add("layout-exit-clone"), e.querySelectorAll("[tabindex]").forEach(e => e.removeAttribute("tabindex")), 
                In.appendChild(e), A.push(e));
            }), function(e, n, i) {
                const a = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, r = void 0 !== Kp && "lite" === Kp, o = Boolean(window.CSS && CSS.supports && CSS.supports("transform", "translate3d(0px,0px,0px)"));
                if (a) return void n.forEach(e => e.remove());
                const s = Boolean(Bt && !r && o), l = o ? e : [];
                if (!l.length && !n.length && !i.length) return;
                // LAYOUT-GLIDE SIGNAL (tweening Job B): fire only when
                // moved nodes actually glide (l non-empty) - never on
                // a paint with no moves. Enter/exit fades alone do
                // not count as a glide.
                l.length && sxLayoutGlideSignal(l.length);
                const c = e => {
                    if (!s) return;
                    e.classList.add("rich-layout"), ((e, t) => {
                        if (!s) return;
                        const i = e.dataset.layoutKey, a = qn[i] || {}, r = a.parentId || (a.branch ? catId(a.branch) : ""), o = Number(e.dataset.layoutX), l = Number(e.dataset.layoutY), c = r && (In.querySelector(`[data-layout-key="${CSS.escape(r)}"]`) || n.find(e => e.dataset.layoutKey === r)), d = c ? {
                            x: Number(c.dataset.layoutX),
                            y: Number(c.dataset.layoutY)
                        } : null;
                        d && Number.isFinite(o) && Number.isFinite(l) && Number.isFinite(d.x) && Number.isFinite(d.y) && (e.style.setProperty(`--layout-${t}-dx`, .16 * (d.x - o) + "px"), 
                        e.style.setProperty(`--layout-${t}-dy`, .16 * (d.y - l) + "px"));
                    })(e, e.classList.contains("layout-exit-clone") ? "exit" : "enter"), e.querySelectorAll(".topic-stem,.visual-rail,.selected-spoke,.group-heat").forEach(e => {
                        e.classList.add("rich-line-draw"), e.setAttribute("pathLength", "1");
                    });
                    const t = e.dataset && e.dataset.layoutKey ? In.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(e.dataset.layoutKey)}"]`) : null;
                    t && (t.classList.add("rich-layout"), t.querySelectorAll(".topic-stem,.visual-rail,.selected-spoke,.group-heat,.tapered-stem,.hanky-midline").forEach(e => {
                        e.classList.add("rich-line-draw"), e.setAttribute("pathLength", "1");
                    }));
                };
                Cn.classList.add("is-layout-moving");
                const d = e => e.dataset && e.dataset.layoutKey ? In.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(e.dataset.layoutKey)}"]`) : null;
                l.forEach(e => {
                    e.group.style.setProperty("--layout-dx", `${e.dx}px`), e.group.style.setProperty("--layout-dy", `${e.dy}px`), 
                    e.group.classList.add("layout-transition", "layout-move-start"), s && e.group.classList.add("rich-layout");
                    const t = d(e.group);
                    t && (t.style.setProperty("--layout-dx", `${e.dx}px`), t.style.setProperty("--layout-dy", `${e.dy}px`), 
                    t.classList.add("layout-transition", "layout-move-start"), s && t.classList.add("rich-layout"));
                }), i.forEach(e => {
                    e.classList.add("layout-transition", "layout-enter-start"), c(e);
                    const t = d(e);
                    t && t.classList.add("layout-transition", "layout-enter-start");
                }), n.forEach(e => {
                    e.classList.add("layout-transition"), c(e);
                }), Cn.getBoundingClientRect(), Qp = requestAnimationFrame(() => {
                    Qp = 0, l.forEach(e => {
                        e.group.classList.remove("layout-move-start");
                        const t = d(e.group);
                        t && t.classList.remove("layout-move-start");
                    }), i.forEach(e => {
                        e.classList.remove("layout-enter-start");
                        const t = d(e);
                        t && t.classList.remove("layout-enter-start");
                    }), n.forEach(e => e.classList.add("layout-exit-active"));
                }), Zp = t.setTimeout($r, s ? 650 : l.length || i.length ? 560 : 430);
            }(E, A, C));
            // The walks below move every visible name and rating control.
            // They used to be one generator step. WebKit stayed inside
            // that step long enough that the boot dial, the 12s failsafe,
            // and a waiting page.evaluate never ran. A bare yield returns
            // the step to Mr, whose chunk budget gives the event loop a
            // frame. The synchronous render path calls next() straight
            // through, so those yields do not paint a gap.
            let sxStackSlice = performance.now();
            const sxOldOverlay = In.querySelector(".node-interaction-overlay");
            sxOldOverlay && sxOldOverlay.remove();
            const sxOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
            sxOverlay.setAttribute("class", "node-interaction-overlay");
            const sxStackGroups = Array.from(In.querySelectorAll(".node-group:not(.is-hidden)"));
            for (let sxGi = 0; sxGi < sxStackGroups.length; sxGi++) {
                const e = sxStackGroups[sxGi];
                const n = e.querySelector(":scope > .hidden-count-badge");
                if (n && sxOverlay.appendChild(n), isSubId(e.dataset.layoutKey)) {
                    const a = Number(e.dataset.layoutX), r = Number(e.dataset.layoutY);
                    if (Number.isFinite(a) && Number.isFinite(r)) {
                        const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle"), topicHit = e.querySelector(":scope > .concept-hit"), topicIcon = e.querySelector(":scope > .topic-icon"), d = Number(topicIcon && topicIcon.dataset.diameter);
                        hit.setAttribute("class", "category-toggle-hit category-icon-hit"), hit.setAttribute("data-id", e.dataset.layoutKey), 
                        hit.setAttribute("cx", a.toFixed(2)), hit.setAttribute("cy", r.toFixed(2)), hit.setAttribute("r", String(Number.isFinite(d) && d > 0 ? d / 2 : sxIconRadius(2))), 
                        hit.setAttribute("aria-hidden", "true");
                        const o = topicHit && topicHit.dataset.uiTooltip;
                        o && (hit.dataset.uiTooltip = o, hit.setAttribute("data-tooltip-hover-only", ""), ul(hit)), 
                        hit.addEventListener("click", Qa), sxOverlay.appendChild(hit);
                    }
                } else if (isCatId(e.dataset.layoutKey)) {
                    const label = e.querySelector(":scope > .category-label");
                    if (label) {
                        const clone = label.cloneNode(!0);
                        clone.setAttribute("class", "category-toggle-hit"), clone.setAttribute("data-id", e.dataset.layoutKey), 
                        clone.removeAttribute("tabindex"), clone.removeAttribute("role"), clone.removeAttribute("aria-label"), 
                        clone.removeAttribute("aria-expanded"), clone.setAttribute("aria-hidden", "true"), clone.addEventListener("click", Qa), 
                        sxOverlay.appendChild(clone);
                        // Branch-label zoom (2026-11-15): the real label
                        // paints above its overlay clone and swallows
                        // the click, so bind the same handler to the
                        // label itself. Marker-guarded: the overlay
                        // pass re-runs per render.
                        if (!label.dataset.sxLabelZoom) {
                            label.addEventListener("click", Qa), label.dataset.sxLabelZoom = "1";
                        }
                    }
                    const a = Number(e.dataset.layoutX), r = Number(e.dataset.layoutY);
                    if (Number.isFinite(a) && Number.isFinite(r)) {
                        const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle"), topicHit = e.querySelector(":scope > .concept-hit"), branchIcon = e.querySelector(":scope > .branch-icon"), d = Number(branchIcon && branchIcon.dataset.diameter);
                        hit.setAttribute("class", "category-toggle-hit category-icon-hit"), hit.setAttribute("data-id", e.dataset.layoutKey), 
                        hit.setAttribute("cx", a.toFixed(2)), hit.setAttribute("cy", r.toFixed(2)), hit.setAttribute("r", String(Number.isFinite(d) && d > 0 ? d / 2 : sxIconRadius(1))), 
                        hit.setAttribute("aria-hidden", "true");
                        const o = topicHit && topicHit.dataset.uiTooltip;
                        o && (hit.dataset.uiTooltip = o, hit.setAttribute("data-tooltip-hover-only", ""), ul(hit)), 
                        hit.addEventListener("click", Qa), sxOverlay.appendChild(hit);
                    }
                }
                if (performance.now() - sxStackSlice >= 40) {
                    yield;
                    sxStackSlice = performance.now();
                }
            }
            sxOverlay.childNodes.length && In.appendChild(sxOverlay);
            const sxCenterToggle = In.querySelector("[data-center-branch-toggle-wrap]");
            sxCenterToggle && In.appendChild(sxCenterToggle);
            const sxLabelExisting = In.querySelector(":scope > .map-label-stack");
            if (sxLabelExisting) In.appendChild(sxLabelExisting);
            else {
                const sxLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
                sxLabels.setAttribute("class", "map-label-stack");
                for (let sxGi = 0; sxGi < sxStackGroups.length; sxGi++) {
                    const e = sxStackGroups[sxGi];
                    const labelNode = e.querySelector(":scope > .category-label, :scope > .map-label");
                    if (labelNode) {
                        const stackItem = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        stackItem.setAttribute("class", "map-label-stack-item" + (e.classList.contains("is-unrated") ? " is-unrated" : ""));
                        const stackStyle = e.getAttribute("style");
                        stackStyle && stackItem.setAttribute("style", stackStyle);
                        if ((e.classList.contains("is-dim") || e.classList.contains("is-unrated")) && !e.classList.contains("is-preview")) {
                            stackItem.setAttribute("opacity", ".18");
                        }
                        stackItem.appendChild(labelNode), sxLabels.appendChild(stackItem);
                    }
                    if (performance.now() - sxStackSlice >= 40) {
                        yield;
                        sxStackSlice = performance.now();
                    }
                }
                sxLabels.childNodes.length && In.appendChild(sxLabels);
            }
            const sxOldControls = In.querySelector(":scope > .direction-control-stack");
            sxOldControls && sxOldControls.remove();
            const sxControls = document.createElementNS("http://www.w3.org/2000/svg", "g");
            sxControls.setAttribute("class", "direction-control-stack");
            const sxControlGroups = Array.from(In.querySelectorAll(".node-group:not(.is-hidden):not(.rating-control-stack-item)"));
            for (let sxGi = 0; sxGi < sxControlGroups.length; sxGi++) {
                const e = sxControlGroups[sxGi];
                const controls = Array.from(e.querySelectorAll(":scope > .direction-control"));
                if (controls.length) {
                    const stackItem = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    stackItem.setAttribute("class", "node-group rating-control-stack-item" + (e.classList.contains("is-unrated") ? " is-unrated" : ""));
                    const stackStyle = e.getAttribute("style");
                    stackStyle && stackItem.setAttribute("style", stackStyle);
                    if ((e.classList.contains("is-dim") || e.classList.contains("is-unrated")) && !e.classList.contains("is-preview")) {
                        stackItem.setAttribute("opacity", ".18");
                    }
                    controls.forEach(el => stackItem.appendChild(el)), sxControls.appendChild(stackItem);
                }
                if (performance.now() - sxStackSlice >= 40) {
                    yield;
                    sxStackSlice = performance.now();
                }
            }
            sxControls.childNodes.length && In.appendChild(sxControls);
            // Q3 hub-icon hit raise: the label stack and the
            // direction-control (rating) stack are appended after
            // the interaction overlay in this pass, so at fit view
            // a neighbour's detached rating hit paths paint over a
            // branch hub icon's own centre and swallow its taps.
            // Move ONLY the icon hit circles into a fresh layer
            // appended last in this pass, so the icon's hit area
            // resolves to its own branch group; the label clones
            // and hidden-count badges stay in the overlay, in
            // their existing paint order.
            const sxStaleIconLayer = In.querySelector(":scope > .category-icon-hit-layer");
            sxStaleIconLayer && sxStaleIconLayer.remove();
            const sxIconHits = In.querySelectorAll(".node-interaction-overlay > circle.category-icon-hit");
            if (sxIconHits.length) {
                const sxIconLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
                sxIconLayer.setAttribute("class", "category-icon-hit-layer"), sxIconHits.forEach(el => sxIconLayer.appendChild(el)), 
                In.appendChild(sxIconLayer);
            }
            // Q3 selection sync: mirror every RENDERED selection
            // change into the Layout Editor, including the paths
            // that mutate the selection without notifying -
            // label/icon toggle taps (Si/$i), rating-target
            // clears, and profile resets all assign Lt and land
            // here through Mr(). A change to null is a map-side
            // clear, mirrored as an editor clear. Editor-
            // initiated selection (API selectNode) does not
            // render, so it never echoes back through here.
            if (Lt !== sxSelEditorMirrored) {
                sxSelEditorMirrored = Lt;
                try {
                    const ui = window.__SEXCAPADES_LAYOUT_UI;
                    if (ui) {
                        if (Lt) ui.selectNode && ui.selectNode(Lt); else ui.clearSelection && ui.clearSelection();
                    }
                } catch (err) { __sxErrLog("layout-select-sync", err); }
            }
            window.__sxLoad && window.__sxLoad(96 /* F5 checkpoint: DOM stacks, interaction overlays, and controls installed */);
            yield "paint";
            Nt && function(e, t) {
                const n = Array.from(In.querySelectorAll(".direction-control")).find(n => n.dataset.id === e && n.dataset.direction === t), i = n && __sxClosestAction(n, "nodeGroup");
                i && (i.appendChild(n), In.appendChild(i));
            }(Nt.id, Nt.direction), vc(), Jt(), (i.forceRepaint || innerWidth > 620 && Object.keys(wt).length) && Ai();
            window.__sxLoad && window.__sxLoad(98 /* F5 checkpoint: Scribe summary and framing ready */);
            yield "paint";
            window.__sxLoad && window.__sxLoad(100 /* F5 checkpoint contract: pipeline complete */);
            // Scoped paint (T3), restore half: swap each retained
            // frozen .node-group element back in place of the fresh
            // element this paint built for the same key. The frozen
            // node's delivered state is by construction its pre-op
            // state (freeze replay + the settle guard above), so the
            // retained element - same object, byte-identical markup
            // - IS the correct post-op rendering; the post-processing
            // segment above ran on the fresh twin, whose geometry
            // inputs are identical, and its whole-viewport steps
            // (relations layer, label/control stacks, spoke
            // underlay, interaction overlay) hold fresh elements
            // whose frozen-incident content is likewise identical.
            // Any fresh/retained markup divergence is counted, not
            // hidden. Recompute-set groups keep their fresh
            // elements and listeners untouched.
            if (scKeep && scKeep.size) try {
                let kept = scSegDone.size, diverged = scSegDiverged;
                scKeep.forEach((el, key) => {
                    // Segment paint (P1): keys spliced from captured
                    // segments have no fresh twin - the lookup below
                    // would find the spliced clone, which must never
                    // be replaced by the captured original or counted
                    // here; spliced keys are already accounted in
                    // kept/diverged from the segment mechanism.
                    if (scSegDone.has(key)) return;
                    const fresh = In.querySelector(`.node-group[data-layout-key="${CSS.escape(key)}"]:not(.layout-exit-clone)`);
                    if (!fresh || fresh === el) return;
                    fresh.outerHTML !== el.outerHTML && diverged++, fresh.replaceWith(el), kept++;
                }), dkLog.push({
                    type: "scoped-paint",
                    retained: kept,
                    captured: scSeg ? scSeg.size : scKeep.size,
                    diverged: diverged
                });
            } catch (_) { __sxErrLog("layout-scoped-paint", _); }
            try {
                yield* sxFinaliseStems();
            } catch (_) { __sxErrLog("layout-stem-finalise-restore", _); }
            // Segment paint (P1) phase timings for this scoped paint,
            // recorded only in dkLog (no console output): capture =
            // segment capture, assemblyClone = per-group assembly +
            // deep clone inside the splice, spliceInsert = anchor
            // search + insertion inside the splice, spliceTotal = the
            // whole splice IIFE, rest = everything else in Ar.
            if (scSeg && scSeg.size) {
                const scTTot = performance.now() - scT0, scR1 = e => Math.round(10 * e) / 10;
                dkLog.push({
                    type: "segment-timing",
                    capture: scR1(scTCap),
                    assemblyClone: scR1(scTAsm),
                    spliceInsert: scR1(scTIns),
                    spliceTotal: scR1(scTSplice),
                    rest: scR1(scTTot - scTCap - scTSplice),
                    total: scR1(scTTot)
                });
            }
            // Blit session (P3), end-of-paint step - where the T3
            // restore block sits: start a session after a burst's
            // first scoped paint, or run a continuing session
            // paint's vault/image step (see blitPaintEnd at the
            // scCtx declarations).
            try {
                const sxGlanceRings = In && In.querySelector(".center-glance-rings");
                sxGlanceRings && In.appendChild(sxGlanceRings);
            } catch (_) {}
            try {
                blitPaintEnd(scKeep, scSeg);
            } catch (_) {
                __sxErrLog("layout-blit-end", _);
            try {
                yield* sxFinaliseStems();
            } catch (_) { __sxErrLog("layout-stem-finalise-blit", _); }
            }
            try {
                const activeId = Mt && vt[Mt] ? Mt : "__default__";
                const isDirty = Boolean(typeof yt !== "undefined" && yt[activeId]);
                if (!isDirty && In && In.childNodes.length > 0) {
                    sxActiveVaultKey = sxGetMapVaultKey(activeId);
                    sxActiveVaultProfileId = activeId;
                    sxSaveWarmBootCache(activeId);
                }
            } catch (_) {}
        }
