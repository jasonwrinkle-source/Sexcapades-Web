        function sxBranchByName(name) {
            return h.find(c => c.name === name) || null;
        }
        // The icon disc for one rating record, in the midline's
        // coloration of interest (Jason, 2026-11-22): give/receive and
        // pole pairs split (never averaged), a triad wears its middle,
        // a line wears its intensity (position is not interest),
        // larger pole sets wear their intensity, unrated wears the
        // no-code charcoal with the seam-gray ring.
        function sxInterestDiscFor(rec, shape) {
            const CHAR = "#151917", SEAM = "#78817e";
            if (!rec) return { single: CHAR, ring: SEAM };
            // Stance skins (Jason, 2026-11-22): the disc's flanks are
            // the placements - advocacy left, receptivity right - each
            // colored only by its own intensity. An unplaced flank
            // keeps the charcoal; a flank's color never spreads over
            // the whole disc and flanks are never blended.
            const sxStance = "undefined" != typeof window && Boolean(window.__SX_ACTIVE_SKIN) && "sexcapades" !== window.__SX_ACTIVE_SKIN;
            if (sxStance && (rec.advocacyKnown || rec.receptivityKnown)) {
                const aI = rec.advocacyIntensityKnown ? rec.advocacyIntensity : null;
                const rI = rec.receptivityIntensityKnown ? rec.receptivityIntensity : null;
                if (null != aI || null != rI) return { left: null != aI ? zi(aI) : CHAR, right: null != rI ? zi(rI) : CHAR, ring: SEAM };
                return { single: CHAR, ring: SEAM };
            }
            // Classic placements (2026-11-22): on the sex skin an
            // n-pole topic's disc splits by its give/receive placement
            // intensities -- give left, receive right -- mirroring the
            // stance branch above; an unplaced flank keeps charcoal.
            if (!sxStance && (rec.givePlacementKnown || rec.receivePlacementKnown)) {
                const plKeys = (shape && shape.keys) || rec.keys || [];
                if (plKeys.length >= 3) {
                    const gI = rec.givePlacementIntensityKnown ? rec.givePlacementIntensity : null;
                    const rI = rec.receivePlacementIntensityKnown ? rec.receivePlacementIntensity : null;
                    if (null != gI || null != rI) return { left: null != gI ? zi(gI) : CHAR, right: null != rI ? zi(rI) : CHAR, ring: SEAM };
                    return { single: CHAR, ring: SEAM };
                }
            }
            if (rec.lineKnown) return rec.intensityKnown ? { single: zi(rec.intensity), ring: zi(rec.intensity) } : { single: CHAR, ring: SEAM };
            const keys = (shape && shape.keys) || rec.keys || [];
            if (keys.length === 3) {
                const mid = keys[1];
                return rec[mid + "Known"] ? { single: zi(rec[mid]), ring: zi(rec[mid]) } : { single: CHAR, ring: SEAM };
            }
            if (keys.length === 2) {
                const aK = rec[keys[0] + "Known"], bK = rec[keys[1] + "Known"];
                if (aK || bK) return { left: aK ? zi(rec[keys[0]]) : CHAR, right: bK ? zi(rec[keys[1]]) : CHAR, ring: SEAM };
                return { single: CHAR, ring: SEAM };
            }
            if (keys.length === 1) {
                const k = keys[0];
                return rec[k + "Known"] ? { single: zi(rec[k]), ring: zi(rec[k]) } : { single: CHAR, ring: SEAM };
            }
            if (keys.length > 3) return rec.intensityKnown ? { single: zi(rec.intensity), ring: zi(rec.intensity) } : { single: CHAR, ring: SEAM };
            if (rec.giveKnown || rec.receiveKnown) return { left: rec.giveKnown ? zi(rec.give) : CHAR, right: rec.receiveKnown ? zi(rec.receive) : CHAR, ring: SEAM };
            return { single: CHAR, ring: SEAM };
        }
        function sxTopicInterestDisc(e, t) {
            return sxInterestDiscFor(ca(e, t), "function" == typeof Ge ? Ge(e, t) : null);
        }
        // A category's disc follows the same scheme (Jason, 2026-11-22):
        // the per-flank rollups split the disc; where the map has no
        // flanks, the category's intensity rollup colors it whole.
        function sxCategoryInterestDisc(e, t) {
            const CHAR = "#151917", SEAM = "#78817e";
            const GA = fa(e, t, "givePlacementIntensity"), GR = fa(e, t, "receivePlacementIntensity");
            if (null != GA || null != GR) return { left: null != GA ? zi(GA) : CHAR, right: null != GR ? zi(GR) : CHAR, ring: SEAM };
            const A = fa(e, t, "advocacyIntensity"), R = fa(e, t, "receptivityIntensity");
            if (null != A || null != R) return { left: null != A ? zi(A) : CHAR, right: null != R ? zi(R) : CHAR, ring: SEAM };
            const T = fa(e, t, "give"), F = fa(e, t, "receive");
            if (null != T || null != F) return { left: null != T ? zi(T) : CHAR, right: null != F ? zi(F) : CHAR, ring: SEAM };
            const inten = fa(e, t, "intensity");
            if (null != inten) return { single: zi(inten), ring: zi(inten) };
            return { single: CHAR, ring: SEAM };
        }
        function sxSubInterestDisc(e, t, i) {
            const CHAR = "#151917", SEAM = "#78817e";
            const GA = ya(e, t, "givePlacementIntensity", i), GR = ya(e, t, "receivePlacementIntensity", i);
            if (null != GA || null != GR) return { left: null != GA ? zi(GA) : CHAR, right: null != GR ? zi(GR) : CHAR, ring: SEAM };
            const A = ya(e, t, "advocacyIntensity", i), R = ya(e, t, "receptivityIntensity", i);
            if (null != A || null != R) return { left: null != A ? zi(A) : CHAR, right: null != R ? zi(R) : CHAR, ring: SEAM };
            const T = ya(e, t, "give", i), F = ya(e, t, "receive", i);
            if (null != T || null != F) return { left: null != T ? zi(T) : CHAR, right: null != F ? zi(F) : CHAR, ring: SEAM };
            const inten = ya(e, t, "intensity", i);
            if (null != inten) return { single: zi(inten), ring: zi(inten) };
            return { single: CHAR, ring: SEAM };
        }
        // Spoke flank (taper) colors for the placements (Jason, 2026-11-22):
        // on stance skins a rated topic's spoke flanks speak advocacy (give
        // slot) and receptivity (receive slot), each by its own intensity; an
        // unplaced flank stays null (no taper). Pair/pseudo spoke colors are
        // consulted before these at every call site.
        function sxPlacementFlankColors(rec) {
            if (!rec) return null;
            const sxStance = sxIsStanceSkin();
            if (sxStance) {
                if (!(rec.advocacyKnown || rec.receptivityKnown)) return null;
                const aInt = rec.advocacyIntensityKnown ? rec.advocacyIntensity : (rec.advocacyKnown ? rec.advocacy : null);
                const rInt = rec.receptivityIntensityKnown ? rec.receptivityIntensity : (rec.receptivityKnown ? rec.receptivity : null);
                return {
                    give: null != aInt ? zi(aInt) : null,
                    receive: null != rInt ? zi(rInt) : null
                };
            }
            if (!(rec.giveKnown || rec.receiveKnown || rec.givePlacementKnown || rec.receivePlacementKnown)) return null;
            const gInt = rec.givePlacementIntensityKnown ? rec.givePlacementIntensity : (rec.giveIntensityKnown ? rec.giveIntensity : (rec.giveKnown ? rec.give : null));
            const rInt = rec.receivePlacementIntensityKnown ? rec.receivePlacementIntensity : (rec.receiveIntensityKnown ? rec.receiveIntensity : (rec.receiveKnown ? rec.receive : null));
            return {
                give: null != gInt ? zi(gInt) : null,
                receive: null != rInt ? zi(rInt) : null
            };
        }
        function sxSubPlacementFlankColors(e, t, i) {
            if (!e) return null;
            const A = ya(e, t, "advocacyIntensity", i), R = ya(e, t, "receptivityIntensity", i);
            if (null != A || null != R) return {
                give: null != A ? zi(A) : null,
                receive: null != R ? zi(R) : null
            };
            const GA = ya(e, t, "givePlacementIntensity", i), GR = ya(e, t, "receivePlacementIntensity", i);
            // Classic pair topics have no placement intensities: their
            // appetite is the stored per-flank intensity (cross slider,
            // 2026-11-24). Each flank falls back on its own, so a topic
            // with a placement on one side and a stored appetite on the
            // other still colours both. Unstored on both sides returns
            // null and the call site's leaning fallback is the appetite
            // derivation itself, so nothing changes there.
            const gI = ya(e, t, "giveIntensity", i), rI = ya(e, t, "receiveIntensity", i);
            const give = null != GA ? GA : gI, receive = null != GR ? GR : rI;
            if (null == give && null == receive) return null;
            return {
                give: null != give ? zi(give) : null,
                receive: null != receive ? zi(receive) : null
            };
        }
        function ya(e, t, n, i) {
            if (null == i && e) for (const c of h) {
                const s = (c.subcategories || []).find(s => s === e);
                if (s) {
                    i = Un(c.name, s.name);
                    break;
                }
            }
            return smSub(e, t, n, i);
        }
        function ba(e) {
            const t = Math.round(Number(e) || 0);
            return t > 0 ? "+" + t : String(t);
        }
        function va(e, t = Vi()) {
            if (Rt) return "Rating value hidden in Blind match.";
            const n = Qi() ? Ua(e) : null;
            if (n) return `Heat map value: ${n.count} of ${n.total} overlaid profiles are into this.`;
            if (isCatId(e)) {
                const n = h.find(t => catId(t.name) === e);
                if (!n) return "Unrated.";
                const o = [];
                // Walk the same field union sxCategoryInterestDisc paints
                // from, so a branch the disc shows as rated can never read
                // "Unrated." here: give/receive first (the classic skin's
                // stored form), then stance placements' intensities, then
                // n-pole placement intensities, then the intensity rollup.
                const gv = fa(n, t, "give"), rv = fa(n, t, "receive");
                if (null !== gv) o.push(`give ${ba(gv)}`);
                if (null !== rv) o.push(`receive ${ba(rv)}`);
                if (!o.length) {
                    const av = fa(n, t, "advocacyIntensity"), rc = fa(n, t, "receptivityIntensity");
                    if (null !== av) o.push(`advocacy ${ba(av)}`);
                    if (null !== rc) o.push(`receptivity ${ba(rc)}`);
                }
                if (!o.length) {
                    const gp = fa(n, t, "givePlacementIntensity"), rp = fa(n, t, "receivePlacementIntensity");
                    if (null !== gp) o.push(`give ${ba(gp)}`);
                    if (null !== rp) o.push(`receive ${ba(rp)}`);
                }
                if (!o.length) {
                    const inten = fa(n, t, "intensity");
                    if (null !== inten) o.push(`intensity ${ba(inten)}`);
                }
                return o.length ? "Category values: " + o.join(" · ") + "." : "Unrated.";
            }
            const z = zn(e);
            if (z) {
                const g = sgSub(e), a = [];
                // Same union as the category branch, via the subcategory
                // rollup sxSubInterestDisc uses.
                if (g) {
                    const gv = smSub(g, t, "give", e), rv = smSub(g, t, "receive", e);
                    if (null !== gv) a.push(`give ${ba(gv)}`);
                    if (null !== rv) a.push(`receive ${ba(rv)}`);
                    if (!a.length) {
                        const av = smSub(g, t, "advocacyIntensity", e), rc = smSub(g, t, "receptivityIntensity", e);
                        if (null !== av) a.push(`advocacy ${ba(av)}`);
                        if (null !== rc) a.push(`receptivity ${ba(rc)}`);
                    }
                    if (!a.length) {
                        const gp = smSub(g, t, "givePlacementIntensity", e), rp = smSub(g, t, "receivePlacementIntensity", e);
                        if (null !== gp) a.push(`give ${ba(gp)}`);
                        if (null !== rp) a.push(`receive ${ba(rp)}`);
                    }
                    if (!a.length) {
                        const inten = smSub(g, t, "intensity", e);
                        if (null !== inten) a.push(`intensity ${ba(inten)}`);
                    }
                }
                return a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
            }
            const i = ca(e, t), a = [];
            if (i.giveKnown) a.push(`give ${ba(i.give)}`);
            if (i.receiveKnown) a.push(`receive ${ba(i.receive)}`);
            if (i.advocacyIntensityKnown) a.push(`advocacy ${ba(i.advocacyIntensity)}`);
            else if (i.advocacyKnown && null != i.advocacy?.intensity) a.push(`advocacy ${ba(i.advocacy.intensity)}`);
            if (i.receptivityIntensityKnown) a.push(`receptivity ${ba(i.receptivityIntensity)}`);
            else if (i.receptivityKnown && null != i.receptivity?.intensity) a.push(`receptivity ${ba(i.receptivity.intensity)}`);
            if (i.givePlacementIntensityKnown) a.push(`give ${ba(i.givePlacementIntensity)}`);
            if (i.receivePlacementIntensityKnown) a.push(`receive ${ba(i.receivePlacementIntensity)}`);
            if (i.lineKnown) a.push(`line ${ba(i.line)}`);
            if (i.polesKnown && i.poles) {
                const geom = Ge(e);
                const poleKeys = Object.keys(i.poles);
                poleKeys.forEach(pk => {
                    const poleObj = geom && geom.poles && geom.poles.find(p => p.key === pk);
                    const label = poleObj ? poleObj.label : pk;
                    a.push(`${label}: ${ba(i.poles[pk])}`);
                });
            }
            return a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
        }
        function wa(e, t, n = Vi()) {
            return `${lo(t)} ${va(e, n)}`;
        }
        function ka(e, t, n = "", i = {}) {
            const a = [ t, n ].filter(Boolean).join(" "), r = i.tapFirst ? " data-tooltip-tap-first" : !1 === i.hoverOnly ? "" : " data-tooltip-hover-only";
            return ` data-ui-tooltip="${Hi(a)}" data-tooltip-name="${Hi(e || "Details")}" data-tooltip-definition="${Hi(t || "")}" data-tooltip-value="${Hi(n || "")}"${r}`;
        }
        function xa(e, t = Vi()) {
            return va(e, t).replace(/^(?:Category|Rating) values?:\s*/i, "").replace(/\.$/, "");
        }
        function Sa(e, t, n = Vi(), i = {}) {
            return ka(t?.label || "Topic", lo(t), xa(e, n), i);
        }
        function $a(e, t, n = Vi()) {
            const a = da(e, n);
            if (sxIsStanceSkin()) {
                const isAdv = "give" === t;
                const roleLabel = isAdv ? "Advocacy" : "Receptivity";
                const topicName = Qn(e, n);
                const fullRole = topicName ? `${roleLabel} · ${topicName}` : roleLabel;
                const known = isAdv ? (a.advocacyIntensityKnown || a.advocacyKnown) : (a.receptivityIntensityKnown || a.receptivityKnown);
                const val = isAdv ? (a.advocacyIntensityKnown ? a.advocacyIntensity : a.advocacy?.intensity) : (a.receptivityIntensityKnown ? a.receptivityIntensity : a.receptivity?.intensity);
                return `${fullRole}. ${known && null != val ? `Rating ${ba(val)}.` : "Unrated."}`;
            }
            if ("give" === t && a.givePlacementIntensityKnown && null != a.givePlacementIntensity) {
                const i = ei(e, t, n) || Jn(e, t, n);
                return `${i}. Rating ${ba(a.givePlacementIntensity)}.`;
            }
            if ("receive" === t && a.receivePlacementIntensityKnown && null != a.receivePlacementIntensity) {
                const i = ei(e, t, n) || Jn(e, t, n);
                return `${i}. Rating ${ba(a.receivePlacementIntensity)}.`;
            }
            const i = ei(e, t, n) || Jn(e, t, n);
            return `${i}. ${a[t + "Known"] ? `Rating ${ba(a[t])}.` : "Unrated."}`;
        }
        function sxSpokeStemRatingValue(rec, t) {
            if (!rec) return "Unrated";
            if (sxIsStanceSkin()) {
                const isAdv = "give" === t;
                const known = isAdv ? (rec.advocacyIntensityKnown || rec.advocacyKnown) : (rec.receptivityIntensityKnown || rec.receptivityKnown);
                const val = isAdv ? (rec.advocacyIntensityKnown ? rec.advocacyIntensity : rec.advocacy?.intensity) : (rec.receptivityIntensityKnown ? rec.receptivityIntensity : rec.receptivity?.intensity);
                return (known && null != val) ? ba(val) : "Unrated";
            }
            if ("give" === t && rec.givePlacementIntensityKnown && null != rec.givePlacementIntensity) {
                return ba(rec.givePlacementIntensity);
            }
            if ("receive" === t && rec.receivePlacementIntensityKnown && null != rec.receivePlacementIntensity) {
                return ba(rec.receivePlacementIntensity);
            }
            return rec[t + "Known"] ? ba(rec[t]) : "Unrated";
        }
        window.sxSpokeStemRatingValue = sxSpokeStemRatingValue;
        function Ea(e, t = {}, n = {}, i = {}) {
            const a = e.topics.map(e => Wn(e)).concat(Object.values(i || {}).filter(t => t && t.branch === e.name).map(e => e.id));
            let r = null;
            return a.forEach(id => {
                if (n && "favorite" === n[id]) return void (r = 100);
                const score = Ca(id, t, n);
                if (null !== score) {
                    r = null === r ? score : Math.max(r, score);
                }
            }), r;
        }
        function Aa(e) {
            // The popover runs Revealed (0) to Concealed (100), and the
            // number it shows is the minimum rating that stays visible.
            // Unrated topics have no rating, so they stay hidden whenever
            // the veil is on. A level of 83 hides a 73 and keeps a 93.
            return av(e);
        }
        function Ca(e, t = {}, n = {}) {
            const ancestors = sxNodeAncestorIds(e);
            const isBranchLimited = Boolean(ancestors.length && n && ancestors.some(ancId => n[ancId] === "limit"));
            if (n && ("limit" === n[e] || "notinterested" === n[e] || isBranchLimited)) return -100;
            if (n && "favorite" === n[e] && !isBranchLimited) return 100;
            const i = t && t[e];
            if ("number" == typeof i && Number.isFinite(Number(i))) return Number(i);
            if (i && "object" == typeof i) {
                const shape = typeof Ge === "function" ? Ge(e) : null;
                const keys = (shape && Array.isArray(shape.keys) && shape.keys.length) ? shape.keys : [ "give", "receive" ];
                const a = [];
                keys.forEach(k => {
                    Object.prototype.hasOwnProperty.call(i, k) && Number.isFinite(Number(i[k])) && a.push(Number(i[k]));
                });
                if (!a.length) {
                    Object.keys(i).forEach(k => {
                        k !== "intensity" && Number.isFinite(Number(i[k])) && a.push(Number(i[k]));
                    });
                }
                return a.length ? Math.max(...a) : null;
            }
            return null;
        }
        function sxTopicPassesVeil(topicId, profId, seen) {
            if (!profId || !vt[profId]) return !0;
            seen = seen || new Set;
            if (seen.has(profId)) return !0;
            seen.add(profId);
            const rec = ft[profId];
            if (rec && "group" === rec.kind) {
                if (vht[profId]) {
                    const score = Ca(topicId, vt[profId], Qe[profId]);
                    if (null === score || score < Aa(vpt[profId])) return !1;
                }
                const liveIds = Array.isArray(rec.sourceIds) ? rec.sourceIds.filter(id => vt[id]) : [];
                if (liveIds.length) return liveIds.every(id => sxTopicPassesVeil(topicId, id, new Set(seen)));
                const stored = Array.isArray(rec.sourceProfiles) ? rec.sourceProfiles.filter(p => p && (p.veilEnabled ?? p.netEnabled)) : [];
                if (stored.length) return stored.every(p => {
                    const score = Ca(topicId, p.ratings, p.annotations);
                    return null !== score && score >= Aa(null != p.veil ? p.veil : p.net);
                });
                return !0;
            }
            if (!vht[profId]) return !0;
            const score = Ca(topicId, vt[profId], Qe[profId]);
            return null !== score && score >= Aa(vpt[profId]);
        }
        function Ma(e, t, seen) {
            if (!t || !vt[t]) return !0;
            seen = seen || new Set;
            if (seen.has(t)) return !0;
            seen.add(t);
            const n = catId(e.name), i = ft[t];
            const checkProf = (ratings, annos, kids, veilVal) => {
                const m = annos?.[n];
                if ("favorite" === m) return !0;
                if ("limit" === m) return Aa(veilVal) <= -100;
                const s = Ea(e, ratings, annos, kids);
                return null !== s && s >= Aa(veilVal);
            };
            if (i && "group" === i.kind) {
                if (vht[t] && !checkProf(vt[t], Qe[t], at[t], vpt[t])) return !1;
                const liveIds = Array.isArray(i.sourceIds) ? i.sourceIds.filter(id => vt[id]) : [];
                if (liveIds.length) return liveIds.every(id => Ma(e, id, new Set(seen)));
                const r = Array.isArray(i.sourceProfiles) ? i.sourceProfiles.filter(p => p && (p.veilEnabled ?? p.netEnabled)) : [];
                if (r.length) return r.every(p => checkProf(p.ratings, p.annotations, p.importedChildren, null != p.veil ? p.veil : p.net));
                return !0;
            }
            if (!vht[t]) return !0;
            return checkProf(vt[t], Qe[t], at[t], vpt[t]);
        }
        function Ia(e = Mt, seen) {
            if (!e) return Boolean($n);
            seen = seen || new Set;
            if (seen.has(e)) return !1;
            seen.add(e);
            const t = ft[e];
            if (t && "group" === t.kind) {
                if (vht[e] || $n) return !0;
                const liveIds = Array.isArray(t.sourceIds) ? t.sourceIds.filter(id => vt[id]) : [];
                return liveIds.length ? liveIds.some(id => Ia(id, new Set(seen))) : Array.isArray(t.sourceProfiles) && t.sourceProfiles.some(p => p && (p.veilEnabled ?? p.netEnabled));
            }
            return Boolean(vht[e] || $n);
        }
        function Pa(e, t) {
            const n = da(e, t);
            if (n.giveKnown && n.receiveKnown) return n;
            const ancestors = sxNodeAncestorIds(e, t);
            let g = n.give, r = n.receive, gk = n.giveKnown, rk = n.receiveKnown;
            for (const ancId of ancestors) {
                if (gk && rk) break;
                const a = da(ancId, t);
                if (!gk && a.giveKnown) { g = a.give; gk = !0; }
                if (!rk && a.receiveKnown) { r = a.receive; rk = !0; }
            }
            return {
                give: g,
                receive: r,
                giveKnown: gk,
                receiveKnown: rk
            };
        }
        function La(e, t, n) {
            // Per-topic pair classification now comes from the sync engine
            // v1.1 topic outcome for the pair (cached per render pass).
            const r = sxPairByIds(t, n), rec = r && r.topicsById[e];
            if (!rec) return "other";
            return "match" === rec.outcome ? "mutual" : "curious-fit" === rec.outcome ? "explore" : "conflict" === rec.outcome || "one-sided" === rec.outcome || "limit-blocked" === rec.outcome ? "mismatch" : "other";
        }
        function Ta() {
            const e = Yi();
            if (e.length >= 2) return e;
            const t = Kd(), n = Array.isArray(t?.sourceIds) ? t.sourceIds.filter(e => vt[e]) : [];
            return n.length >= 2 ? n : [];
        }
        function Fa() {
            return Ta().length >= 2 || Boolean(Kd());
        }

        // Phase 2: Semantic function bridge
        const sxIsVeilActive = Ia;
        const sxGetComparisonProfileIds = Ta;
        const sxIsComparisonActive = Fa;
        const sxGetTopicStance = ca;
        const sxGetTopicScore = Ca;
        const sxMapVeilThreshold = Aa;
        const sxGetActiveProfileOrDefault = Vi;
        const sxGetComparisonOutcome = di;
        const sxGetActiveOrComparisonProfiles = Xi;

        window.SexcapadesEngine = window.SexcapadesEngine || {};
        window.SexcapadesEngine.Profiles = {
            isVeilActive: sxIsVeilActive,
            getComparisonProfileIds: sxGetComparisonProfileIds,
            isComparisonActive: sxIsComparisonActive,
            getActiveProfileOrDefault: sxGetActiveProfileOrDefault,
            getActiveOrComparisonProfiles: sxGetActiveOrComparisonProfiles,
            getComparisonOutcome: sxGetComparisonOutcome,
            autoSelect: sxAutoSelect
        };
        window.SexcapadesEngine.Topics = {
            getStance: sxGetTopicStance,
            getScore: sxGetTopicScore,
            getVeilThreshold: sxMapVeilThreshold
        };
        function Na(e) {
            if (!Rt || isCatId(e)) return !1;
            const t = Ta();
            if (t.length >= 2) {
                for (let n = 0; n < t.length; n++) for (let i = n + 1; i < t.length; i++) if ("mutual" !== La(e, t[n], t[i])) return !1;
                return !0;
            }
            return "mutual" === di(e);
        }
        function _a() {
            const t = e.byId("blindModeSummary"), i = e.byId("blindModeHeading"), a = e.byId("blindModeList");
            if (!t || !i || !a) return;
            if (t.hidden = !Rt, !Rt) return void a.replaceChildren();
            const r = Rt ? Uc().filter(Na).map(e => {
                const t = qn[e] || Xn(e) || li().find(t => t.id === e);
                return t ? {
                    id: e,
                    label: t.label,
                    branch: t.branch
                } : null;
            }).filter(Boolean).sort((e, t) => e.branch.localeCompare(t.branch) || e.label.localeCompare(t.label)) : [];
            i.textContent = `You match on ${r.length} ${1 === r.length ? "topic" : "topics"}`, 
            n(a, r.length ? r.map(e => `<li><span>${Hi(e.label)}</span><small>${Hi(e.branch)}</small></li>`).join("") : "<li><span>No shared Want to do topics yet.</span></li>");
        }
        function Da() {
            const t = Fa(), n = e.byId("blindModeToggle"), i = an && Yi().length >= 2 && !Kd();
            i && "mutual" === Pt && (Pt = "all"), Rt && !t && (Rt = !1, Pt = Ot || "all"), document.body.classList.toggle("blind-mode", Rt), 
            n && (n.setAttribute("aria-pressed", String(Rt)), n.disabled = !t), e.all("[data-filter]").forEach(e => {
                const t = "mutual" === e.dataset.filter;
                // FQ2-BAKEIN: filter-chip tooltip below "shared Want to do topics" -> "shared Hot topics" (redundant trailing "topics" dropped: the new name already ends in "topics")
                e.disabled = Rt, e.setAttribute("aria-disabled", String(i && t)), t && e.setAttribute("data-ui-tooltip", i ? "Cast the selected profiles together first, or select a single profile, to score shared Hot topics." : "Show topics the selected profiles can enjoy together: one person wants to give what another wants to receive."), e.setAttribute("aria-pressed", String(Rt ? t : e.dataset.filter === Pt));
            }), _a();
        }
        function Ra(e) {
            if (Rt) return Na(e) ? "mutual" : "other";
            const t = di(e);
            if (t) return t;
            // Single-profile tab: classify by this profile's own ratings (Build 2026-10-17)
            const mt = Mt && ft[Mt];
            if (mt && "group" !== mt.kind && vt[Mt]) {
                return RaSingle(e, Mt);
            }
            const n = Qi() ? Xi() : Object.keys(wt), i = [];
            for (let t = 0; t < n.length; t++) for (let a = t + 1; a < n.length; a++) i.push(La(e, n[t], n[a]));
            return i.includes("mismatch") ? "mismatch" : i.includes("mutual") ? "mutual" : i.includes("explore") ? "explore" : "other";
        }
        if (typeof window !== "undefined") window.__SX_RA = Ra;
        function sxIsBranchLimited(e, t = Vi()) {
            const grp = Kd();
            const pIds = grp && Array.isArray(grp.sourceIds) ? grp.sourceIds.filter(id => vt[id]) : (Qi() ? Xi() : [ t ]);
            const ancestors = sxNodeAncestorIds(e, t);
            if (!ancestors.length) return !1;
            return pIds.some(pid => {
                const ann = Qe[pid];
                if (!ann) return !1;
                return ancestors.some(ancId => ann[ancId] === "limit");
            });
        }
        function RaSingle(e, t) {
            // Classify a topic by a single profile's own ratings for individual-tab filters.
            // "mutual" = Want to do (green): strong want in either direction.
            // "explore" = Curious about (yellow): moderate interest.
            // "mismatch" = Mismatched (red): strong aversion or hard limit.
            if ("limit" === Qe[t]?.[e] || Ba(e, t, "limit")) return "mismatch";
            const r = Pa(e, t), s = 35;
            if ((r.giveKnown && r.give > s) || (r.receiveKnown && r.receive > s)) return "mutual";
            if ((r.giveKnown && r.give <= -s) || (r.receiveKnown && r.receive <= -s)) return "mismatch";
            if ((r.giveKnown && r.give > 20) || (r.receiveKnown && r.receive > 20)) return "explore";
            return "other";
        }
        function Oa(e, t) {
            const ancestors = sxNodeAncestorIds(e, t);
            const isBranchLimited = Boolean(ancestors.length && ancestors.some(ancId => Qe[t]?.[ancId] === "limit"));
            if (isBranchLimited) return "limit";
            const n = Qe[t]?.[e];
            if (n) {
                if ("favorite" === n && isBranchLimited) return "limit";
                return n;
            }
            for (const ancId of ancestors) {
                if (Qe[t]?.[ancId]) return Qe[t][ancId];
            }
            return null;
        }
        function Ba(e, t, n) {
            const ancestors = sxNodeAncestorIds(e, t);
            const isBranchLimited = Boolean(ancestors.length && ancestors.some(ancId => Qe[t]?.[ancId] === "limit"));
            if (isBranchLimited) {
                if ("limit" === n) return !0;
                if ("favorite" === n) return !1;
            }
            if (Qe[t]?.[e] === n) {
                if ("favorite" === n && (Qe[t]?.[e] === "limit" || isBranchLimited)) return !1;
                return !0;
            }
            return Boolean(ancestors.some(ancId => Qe[t]?.[ancId] === n));
        }
        function ja(e, t) {
            return Ba(e, t, "limit") || Ba(e, t, "notinterested");
        }
        function qa(e, t) {
            return (Qi() ? Xi() : [ Vi() ]).some(n => Boolean(t[n]?.[e]));
        }
        function Ha(e, t) {
            return Boolean(Je[t]?.[e]);
        }
        function Wa(e, t) {
            return Boolean(et[t]?.[e]);
        }
        function Ua(e) {
            const t = Xi(), n = 35;
            if (t.length < 3) return null;
            const i = t.filter(t => {
                if ("limit" === Oa(e, t)) return !1;
                const i = Pa(e, t);
                return i.giveKnown && i.give > n || i.receiveKnown && i.receive > n || "favorite" === Oa(e, t);
            }).length;
            if (!i) return null;
            const a = (i - 1) / Math.max(1, t.length - 1), r = [ 74, 158, 190 ], o = [ 255, 104, 91 ];
            return {
                count: i,
                total: t.length,
                color: `rgb(${Math.round(r[0] + (o[0] - r[0]) * a)},${Math.round(r[1] + (o[1] - r[1]) * a)},${Math.round(r[2] + (o[2] - r[2]) * a)})`
            };
        }
        Cn.addEventListener("pointerdown", sa, !0), Cn.addEventListener("keydown", sa, !0);
        if (typeof window !== "undefined") {
            window.qn = qn;
            window.Xn = Xn;
            window.Qi = Qi;
            window.Vi = Vi;
            window.Xi = Xi;
            window.Ge = Ge;
            window.da = da;
            window.$a = $a;
            window.Sa = Sa;
            window.ka = ka;
            window.Ua = Ua;
            window.Oa = Oa;
            window.ba = ba;
            window.la = la;
            window.zi = zi;
            window.Ra = Ra;
            /* Readable aliases for the letter bridge. The short names stay:
               the flat bundle shares one scope, and a rename of the
               declarations would collide. Callers may use either. */
            window.sxNodeRegistry = qn;
            window.sxNodeById = Xn;
            window.sxComparisonActive = Qi;
            window.sxActiveProfileId = Vi;
            window.sxScoringProfileIds = Xi;
            window.sxWidgetConfig = Ge;
            window.sxRatingRecord = da;
            window.sxFlankText = $a;
            window.sxTopicTooltipAttrs = Sa;
            window.sxTooltipAttrs = ka;
            window.sxSharedCountColor = Ua;
            window.sxAnnotationState = Oa;
            window.sxSignedNumber = ba;
            window.sxProfileColor = la;
            window.sxInterestColor = zi;
            window.sxFilterBucket = Ra;
        }
