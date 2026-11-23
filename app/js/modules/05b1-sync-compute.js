        function Id(e) {
            const t = [];
            for (let n = 0; n < e.length; n++) for (let i = n + 1; i < e.length; i++) t.push([ e[n], e[i] ]);
            return t;
        }
        function Pd(e) {
            return structuredClone(e || {});
        }
        function Ld(e, t) {
            const n = (e.ratings || {})[t];
            if ("number" == typeof n) return {
                give: n,
                receive: n,
                giveKnown: !0,
                receiveKnown: !0,
                poles: null,
                polesKnown: !1,
                line: null,
                lineKnown: !1,
                advocacy: null,
                advocacyKnown: !1,
                receptivity: null,
                receptivityKnown: !1
            };
            if (n && "object" == typeof n) {
                const e = Object.prototype.hasOwnProperty.call(n, "give"), t = Object.prototype.hasOwnProperty.call(n, "receive");
                const hasAdv = Boolean(n.advocacy && "object" == typeof n.advocacy);
                const hasRec = Boolean(n.receptivity && "object" == typeof n.receptivity);
                const r = {
                    give: e && Number(n.give) || 0,
                    receive: t && Number(n.receive) || 0,
                    giveKnown: e,
                    receiveKnown: t,
                    poles: null,
                    polesKnown: !1,
                    line: null,
                    lineKnown: !1,
                    advocacy: null,
                    advocacyKnown: !1,
                    receptivity: null,
                    receptivityKnown: !1
                };
                if (hasAdv || hasRec) {
                    const advObj = hasAdv ? n.advocacy : null;
                    const recObj = hasRec ? n.receptivity : null;
                    const advPoles = advObj ? {} : null;
                    if (advObj) {
                        Object.keys(advObj).forEach(k => {
                            if (k !== "intensity" && Number.isFinite(Number(advObj[k]))) advPoles[k] = Number(advObj[k]);
                        });
                    }
                    const recPoles = recObj ? {} : null;
                    if (recObj) {
                        Object.keys(recObj).forEach(k => {
                            if (k !== "intensity" && Number.isFinite(Number(recObj[k]))) recPoles[k] = Number(recObj[k]);
                        });
                    }
                    const advInt = (advObj && Number.isFinite(Number(advObj.intensity))) ? Number(advObj.intensity) : null;
                    const recInt = (recObj && Number.isFinite(Number(recObj.intensity))) ? Number(recObj.intensity) : null;
                    r.poles = advPoles || recPoles;
                    r.polesKnown = Boolean((advPoles && Object.keys(advPoles).length) || (recPoles && Object.keys(recPoles).length));
                    r.intensity = advInt != null ? advInt : recInt;
                    r.intensityKnown = advInt != null || recInt != null;
                    r.advocacy = advObj ? { poles: advPoles, intensity: advInt, intensityKnown: advInt != null } : null;
                    r.advocacyKnown = hasAdv;
                    r.receptivity = recObj ? { poles: recPoles, intensity: recInt, intensityKnown: recInt != null } : null;
                    r.receptivityKnown = hasRec;
                    return r;
                }
                // Line topic (trilinear-line): one scalar under "line".
                // The converter derives it at load, so the store holds it.
                if (Object.prototype.hasOwnProperty.call(n, "line") && Number.isFinite(Number(n.line))) {
                    r.line = Number(n.line);
                    r.lineKnown = !0;
                    // A line topic's stored (n+1) intensity rides
                    // alongside the scalar and counts like any other
                    // topic's; this return used to drop it, so a line
                    // topic's relevance fell back to its stance size.
                    if (Object.prototype.hasOwnProperty.call(n, "intensity") && Number.isFinite(Number(n.intensity))) {
                        r.intensity = Number(n.intensity);
                        r.intensityKnown = !0;
                    }
                    return r;
                }
                // Multi-pole topic: per-pole affinities under the pole
                // keys. (Flanked topics carry give/receive keys, so they
                // never reach here; a 0 is a rating - an all-zero vector
                // counts.)
                if (!e && !t) {
                    // `intensity` is the (n+1) relevance, not a pole.
                    const k = Object.keys(n).filter(j => "intensity" !== j && "advocacy" !== j && "receptivity" !== j && Number.isFinite(Number(n[j])));
                    if (k.length) {
                        const p = {};
                        k.forEach(j => { p[j] = Number(n[j]); });
                        r.poles = p;
                        r.polesKnown = !0;
                        const intVal = Object.prototype.hasOwnProperty.call(n, "intensity") && Number.isFinite(Number(n.intensity)) ? Number(n.intensity) : null;
                        r.advocacy = { poles: p, intensity: intVal, intensityKnown: intVal != null };
                        r.advocacyKnown = !0;
                        r.receptivity = null;
                        r.receptivityKnown = !1;
                    }
                }
                if (Object.prototype.hasOwnProperty.call(n, "intensity") && Number.isFinite(Number(n.intensity))) {
                    r.intensity = Number(n.intensity);
                    r.intensityKnown = !0;
                }
                return r;
            }
            return {
                give: 0,
                receive: 0,
                giveKnown: !1,
                receiveKnown: !1,
                poles: null,
                polesKnown: !1,
                line: null,
                lineKnown: !1,
                advocacy: null,
                advocacyKnown: !1,
                receptivity: null,
                receptivityKnown: !1
            };
        }
        function Td(e, t) {
            return (e.annotations || {})[t] || null;
        }
        function Fd(e, t) {
            const n = val => "limit" === val || "notinterested" === val;
            if (n(Td(e, t))) return !0;
            const ancestors = (typeof sxNodeAncestorIds === "function")
                ? sxNodeAncestorIds(t, e?.id)
                : (() => {
                    const i = qn[t] || Xn(t) || (e.importedChildren || {})[t];
                    return [ i?.parentId, i?.branch ? catId(i.branch) : null ].filter(Boolean);
                })();
            return ancestors.some(ancId => n(Td(e, ancId)));
        }
        /* ===== Sync comparison engine v1.1 (ruled algorithm) =====
           The single computation behind every sync percentage in the app:
           the glance panel, the Cast panel, committed group profiles, and
           Scribe all read results produced here. Session inputs: mode is
           carried by the aggregation the caller reads ("play" vs
           "conversation"); per-person Heat in [-100, 100] (default 0)
           shifts the Strong threshold and the shed floor, and above zero
           opens the Soft-no-revisited teaser for that person's own soft
           no's — more topics and more detail as Heat climbs to +100.
           Per-person Veil in [0, 100] (default 50) is primarily a display
           filter, with ONE intended matching exception (ruled
           2026-10-29): teaser candidacy. A topic is a teaser candidate
           only if the excited partner's best positive rating clears
           Aa(veil) — interest >= 80 - 1.8 * veil — and a selected teaser
           feeds conversation.counted and hence the pair Kink Factor, so
           Veil DOES affect matching through teasers. The conversation
           bump itself remains veil-free. The
           retired leniency bands and the inferred role lock play no part
           in any outcome below. */
        function sxClamp(v, lo, hi) {
            return Math.max(lo, Math.min(hi, v));
        }
        function sxMeta(id, profiles) {
            let m = qn[id] || Xn(id) || null;
            if (!m && profiles) for (let k = 0; k < profiles.length; k++) {
                const c = (profiles[k].importedChildren || {})[id];
                if (c) { m = c; break; }
            }
            if (m && !m.poleReading && typeof window !== "undefined" && window.__SX_POLE_READINGS && window.__SX_POLE_READINGS[id]) {
                const row = window.__SX_POLE_READINGS[id];
                m.poleReading = row.reading;
                m.poleEnemies = row.enemies || [];
            }
            return !m || "Category" === m.kind ? null : m;
        }
        function sxAnnoScope(profile, id, meta, value) {
            const a = profile.annotations || {};
            const ancestors = (typeof sxNodeAncestorIds === "function")
                ? sxNodeAncestorIds(id, profile?.id)
                : [ meta?.parentId, meta?.branch ? catId(meta.branch) : null ].filter(Boolean);
            // Interim unification: Branch Limit beats topic Favorite.
            // If checking "favorite", any ancestor limit strictly overrides and cancels it.
            if ("favorite" === value) {
                if (a[id] === "limit") return null;
                if (ancestors.some(ancId => a[ancId] === "limit")) return null;
            }
            if (a[id] === value) return "topic";
            for (const ancId of ancestors) {
                if (a[ancId] === value) {
                    const ancRec = (typeof sxNodeRecord === "function") ? sxNodeRecord(ancId, profile?.id) : null;
                    return ancRec?.kind?.toLowerCase() || (isCatId(ancId) ? "category" : "subcategory");
                }
            }
            return null;
        }
        function sxFlagScope(store, id, meta) {
            if (!store) return null;
            if (store[id]) return "topic";
            const ancestors = (typeof sxNodeAncestorIds === "function")
                ? sxNodeAncestorIds(id)
                : [ meta?.parentId, meta?.branch ? catId(meta.branch) : null ].filter(Boolean);
            for (const ancId of ancestors) {
                if (store[ancId]) {
                    const ancRec = (typeof sxNodeRecord === "function") ? sxNodeRecord(ancId) : null;
                    return ancRec?.kind?.toLowerCase() || (isCatId(ancId) ? "category" : "subcategory");
                }
            }
            return null;
        }
        function sxTopicData(profile, id, meta) {
            const stored = (profile.ratings || {})[id], raw = Ld(profile, id);
            let single = "number" == typeof stored, singleValue = single ? Number(stored) : null;
            if (!single && Ue.has(id)) {
                single = !0, singleValue = raw.giveKnown ? raw.give : raw.receiveKnown ? raw.receive : null;
            }
            // Multi-pole comparison (ruled 2026-11-16): a pole vector or
            // a line scalar counts as a rating for the boolean, and the
            // vector / scalar is carried through for the pair scorer.
            // A 0 is a rating - an all-zero vector counts as rated.
            const poles = raw.polesKnown ? raw.poles : null;
            const line = raw.lineKnown ? raw.line : null;
            // Relevance is the stored +1. Old ratings have no key yet:
            // seed it the same way the slider does, so the score does
            // not jump the first time a profile is opened.
            let intensity = raw.intensityKnown ? raw.intensity : null;
            let intensityKnown = Boolean(raw.intensityKnown);
            if (!intensityKnown && poles) {
                const seeded = sxSeedTopicIntensity(id, poles);
                if (null != seeded) { intensity = seeded; intensityKnown = !0; }
            }
            // Strongest stance: the signed pole affinity with the largest
            // absolute value (for a line topic, the scalar itself). Used
            // for the Depth Factor intensity and Personal KF.
            let strongest = null;
            if (null != line) strongest = line;
            else if (poles) {
                let best = null;
                Object.keys(poles).forEach(k => {
                    const v = poles[k];
                    if (null == best || Math.abs(v) > Math.abs(best)) best = v;
                });
                strongest = best;
            }
            return {
                raw: raw,
                single: single,
                singleValue: singleValue,
                rated: Boolean(raw.giveKnown || raw.receiveKnown || raw.polesKnown || raw.lineKnown || raw.advocacyKnown || raw.receptivityKnown),
                poles: poles,
                polesKnown: Boolean(raw.polesKnown),
                line: line,
                lineKnown: Boolean(raw.lineKnown),
                intensity: intensity,
                intensityKnown: intensityKnown,
                strongest: strongest,
                advocacy: raw.advocacyKnown ? raw.advocacy : null,
                advocacyKnown: Boolean(raw.advocacyKnown),
                receptivity: raw.receptivityKnown ? raw.receptivity : null,
                receptivityKnown: Boolean(raw.receptivityKnown),
                limitScope: sxAnnoScope(profile, id, meta, "limit"),
                notInterested: Boolean(sxAnnoScope(profile, id, meta, "notinterested")),
                favorite: Boolean(sxAnnoScope(profile, id, meta, "favorite")),
                fantasyScope: sxFlagScope(profile.fantasyOnly, id, meta),
                triedScope: sxFlagScope(profile.alreadyTried, id, meta)
            };
        }
        function sxStance(value, known, T) {
            return !known ? "unknown" : value < 0 ? "against" : value > T ? "strong" : "curious";
        }
        // Multi-pole comparison (ruled 2026-11-16): the agreement
        // between two profiles' stances on one topic, as a fraction
        // 0-1. score = 100 − (mean |A−B| over the poles) ÷ 2, so the
        // fraction is 1 − (mean |A−B|) / 200. A line topic is a
        // one-pole vector (score = 100 − |A−B| ÷ 2). Two all-zero
        // vectors agree perfectly (fraction 1). Returns null when the
        // topic is not a multi-pole topic for both profiles.
        function sxPoleAgreement(a, b) {
            if (!a || !b) return null;
            // Line topic: one scalar each.
            if (a.lineKnown && b.lineKnown) {
                return 1 - Math.abs(a.line - b.line) / 200;
            }
            // Pole vectors: mean |A−B| over the union of pole keys.
            if (a.polesKnown && b.polesKnown) {
                const keys = [...new Set([...Object.keys(a.poles), ...Object.keys(b.poles)])];
                if (!keys.length) return null;
                let sum = 0;
                keys.forEach(k => {
                    const va = k in a.poles ? a.poles[k] : 0;
                    const vb = k in b.poles ? b.poles[k] : 0;
                    sum += Math.abs(va - vb);
                });
                return 1 - (sum / keys.length) / 200;
            }
            return null;
        }
        // Depth Factor for a line topic that has no stored relevance:
        // geometric mean of the two strongest stances. Pole topics do
        // not use this; their relevance is the stored +1.
        function sxPoleIntensity(a, b) {
            if (!a || !b || null == a.strongest || null == b.strongest) return 0;
            return Math.sqrt(Math.abs(a.strongest) * Math.abs(b.strongest)) / 100;
        }
        // Seed a missing +1 from the leanings. Compass sums the four
        // values, a triad carries the sign of the sum on the absolute
        // sum, and every other polygon uses the strongest value with
        // its sign. Same numbers the intensity slider shows on first open.
        function sxSeedTopicIntensity(id, poles) {
            const vals = Object.keys(poles).map(k => Number(poles[k]) || 0);
            if (!vals.length) return null;
            let family = null;
            if (typeof Ge === "function" && typeof sxFamilyOf === "function") family = sxFamilyOf(Ge(id));
            if (family && typeof sxDerivedFromVals === "function") return sxDerivedFromVals(vals, family);
            if (3 === vals.length && typeof sxTriSignedIntensity === "function") return Math.round(sxTriSignedIntensity(vals));
            if (vals.length >= 4 && typeof sxSignedIntensity === "function") return Math.round(sxSignedIntensity(vals));
            return null;
        }
        // Role overlap for an n-pole topic. Shares are the non-negative
        // pole numbers, each divided by their sum. Straight is the
        // similar role (sum of shareA × shareB). Cross is the
        // complementary role (1 − straight) when both people put some
        // weight on the topic. Both empty: straight 1, cross 0. Only
        // one empty: both 0 - an empty blend is not a complement.
        function sxRoleOverlap(polesA, polesB) {
            if (!polesA || !polesB) return null;
            const keys = [ ...new Set([ ...Object.keys(polesA), ...Object.keys(polesB) ]) ];
            if (keys.length < 2) return null;
            const mass = poles => {
                let s = 0;
                const m = {};
                keys.forEach(k => {
                    const v = Math.max(0, Number(poles[k]) || 0);
                    m[k] = v;
                    s += v;
                });
                return { m: m, s: s };
            };
            const A = mass(polesA), B = mass(polesB);
            if (A.s <= 0 && B.s <= 0) return { straight: 1, cross: 0, shareA: {}, shareB: {} };
            if (A.s <= 0 || B.s <= 0) return { straight: 0, cross: 0, shareA: {}, shareB: {} };
            const shareA = {}, shareB = {};
            let straight = 0;
            keys.forEach(k => {
                shareA[k] = A.m[k] / A.s;
                shareB[k] = B.m[k] / B.s;
                straight += shareA[k] * shareB[k];
            });
            return { straight: straight, cross: 1 - straight, shareA: shareA, shareB: shareB };
        }
        // Circle-minus weight. Opposite signs are the argument, so they
        // still count. A 0 on either side drops the topic. The Play
        // factor (sxRelevancePair) stays the one that cancels opposite
        // signs; this one is only for the debate rings.
        function sxDebateFactor(vals) {
            if (!vals.length || vals.some(v => null == v || !Number.isFinite(v) || 0 === v)) return 0;
            return Math.min(1, Math.min(...vals.map(v => Math.abs(v))) / 100);
        }
        // How much of a stored feud the two people cover. Each named
        // enemy pair adds both directions (A on one pole, B on the other).
        function sxEnemyOverlap(shareA, shareB, enemies) {
            let e = 0;
            (enemies || []).forEach(pair => {
                if (!pair || pair.length < 2) return;
                const i = pair[0], j = pair[1], ai = shareA[i] || 0, aj = shareA[j] || 0, bi = shareB[i] || 0, bj = shareB[j] || 0;
                e += ai * bj + aj * bi;
            });
            return e > 1 ? 1 : e;
        }
        // The widget's stored reading decides which overlap is a commune
        // and which is an argument. No reading keeps the old cross
        // (every other pole is a complement). Complement keeps that
        // cross. Same poles are talk only. Antipodal and trilemma put
        // the feud on enemy and do not treat the other poles as partners.
        // Coverage pricing (ruled 2026-11-21): the overlaps are priced
        // from the holdings themselves, not from shares. Straight is
        // the diagonal of the pair's joint engagement (sum of the
        // same-pole products, /10000, capped at 1); Cross is the
        // off-diagonal (sum of the cross-pole products, /10000,
        // capped) - completion, normalized by what a pair could
        // cover: two fully committed holders on disjoint poles score
        // the full 10000. Enemy pairs price the same way over the
        // stored enemy pole pairs only. The product grades itself,
        // so weak holdings cross weakly; the readings still decide
        // WHICH poles complete and which are enemies. Empty-vector
        // conventions follow the old share overlap: both empty
        // straight 1, one empty both 0.
        function sxPoleMatch(meta, polesA, polesB) {
            if (!polesA || !polesB) return null;
            const keys = [ ...new Set([ ...Object.keys(polesA), ...Object.keys(polesB) ]) ];
            if (keys.length < 2) return null;
            const hA = {}, hB = {};
            let sA = 0, sB = 0;
            keys.forEach(k => {
                hA[k] = Math.max(0, Number(polesA[k]) || 0), hB[k] = Math.max(0, Number(polesB[k]) || 0);
                sA += hA[k], sB += hB[k];
            });
            if (sA <= 0 && sB <= 0) return { straight: 1, cross: 0, enemy: 0 };
            if (sA <= 0 || sB <= 0) return { straight: 0, cross: 0, enemy: 0 };
            let diag = 0, crossSum = 0;
            keys.forEach(k => { diag += hA[k] * hB[k]; });
            keys.forEach(i => { keys.forEach(j => { if (i !== j) crossSum += hA[i] * hB[j]; }); });
            const straight = Math.min(1, diag / 10000), crossAll = Math.min(1, crossSum / 10000),
                reading = meta && meta.poleReading;
            if (!reading || "complement" === reading) return { straight: straight, cross: crossAll, enemy: 0 };
            if ("same" === reading) return { straight: straight, cross: 0, enemy: 0 };
            let enemy = 0;
            (meta.poleEnemies || []).forEach(pair => {
                if (!pair || pair.length < 2) return;
                enemy += (hA[pair[0]] || 0) * (hB[pair[1]] || 0) + (hA[pair[1]] || 0) * (hB[pair[0]] || 0);
            });
            return { straight: straight, cross: 0, enemy: Math.min(1, enemy / 10000) };
        }
        // Group feud: the strongest way two different people sit on the
        // two poles of one stored enemy pair.
        function sxGroupEnemy(rows, keys, enemies) {
            if (!enemies || !enemies.length || rows.some(r => !r)) return 0;
            const idx = {};
            keys.forEach((k, j) => { idx[k] = j; });
            let best = 0;
            enemies.forEach(pair => {
                const ia = idx[pair[0]], ib = idx[pair[1]];
                if (null == ia || null == ib) return;
                for (let p = 0; p < rows.length; p++) for (let q = 0; q < rows.length; q++) {
                    if (p === q) continue;
                    const prod = rows[p][ia] * rows[q][ib];
                    if (prod > best) best = prod;
                }
            });
            return best > 1 ? 1 : best;
        }
        // How much a topic counts: the smaller |intensity| / 100.
        // A 0 on either side drops it. Opposite signs cancel. Both
        // negative is a real factor, marked aversion so it is not
        // read as enthusiasm to do the thing.
        function sxRelevancePair(iA, iB) {
            return sxRelevanceGroup([ iA, iB ]);
        }
        // Same relevance rule for a whole cast: the smaller |intensity|
        // wins, a 0 drops the topic, opposite signs cancel, and every
        // member negative is shared aversion.
        function sxRelevanceGroup(vals) {
            if (!vals.length || vals.some(v => null == v || !Number.isFinite(v) || 0 === v)) return { factor: 0, aversion: !1, opposed: !1 };
            const pos = vals[0] > 0;
            if (vals.some(v => v > 0 !== pos)) return { factor: 0, aversion: !1, opposed: !0 };
            return {
                factor: Math.min(1, Math.min(...vals.map(v => Math.abs(v))) / 100),
                aversion: vals.every(v => v < 0),
                opposed: !1
            };
        }
        // One person's leanings as shares of the same pole list.
        // A vector with no positive weight fills no role.
        function sxShareRow(poles, keys) {
            let s = 0;
            const raw = keys.map(k => {
                const v = Math.max(0, Number(poles[k]) || 0);
                s += v;
                return v;
            });
            if (s <= 0) return null;
            return raw.map(v => v / s);
        }
        // One person's holdings on the same pole list: each pole's
        // value as a fraction of full, max(0, v) / 100 - NOT shares of
        // the person's total. A share row throws away how much anyone
        // holds (30/30 and 100/100 are the same shape, and a lone 30
        // fills its role like a lone 100); the group numbers are
        // priced by what is actually held, like the pair tensor.
        // (Jason, 2026-11-21: the group scorer includes how much
        // anyone holds a stance.) Intensity keeps its own ruled role
        // on top, as the relevance factor - it is not folded in here,
        // so it is never counted twice.
        function sxHeldRow(poles, keys) {
            return keys.map(k => Math.max(0, Number(poles[k]) || 0) / 100);
        }
        // Best way to give every pole a different person. The score is
        // the product of those holdings, so a missing role scores 0 and a
        // pure one-person-per-role group scores 1.
        function sxBestRoleProduct(rows) {
            const n = rows.length, k = n && rows[0] ? rows[0].length : 0;
            if (!k || n < k || rows.some(r => !r)) return 0;
            let best = 0;
            const used = new Array(n).fill(!1);
            const walk = (pole, prod) => {
                if (prod <= best) return;
                if (pole === k) return void (best = prod);
                for (let p = 0; p < n; p++) {
                    if (used[p] || rows[p][pole] <= 0) continue;
                    used[p] = !0;
                    walk(pole + 1, prod * rows[p][pole]);
                    used[p] = !1;
                }
            };
            return walk(0, 1), best;
        }
        // Group role score. Straight is high when every member leans the
        // same pole. Cross is high only when the cast covers every pole,
        // each with a different person. Two bulls and a hotwife cover
        // two poles, so both numbers stay low. Bull, hotwife, and cuckold
        // cover all three, so cross is high.
        function sxGroupRoleScore(members, meta) {
            const rated = (members || []).filter(m => m && m.poles);
            const empty = { straight: 0, cross: 0, enemy: 0, factor: 0, debate: 0, aversion: !1, opposed: !1 };
            if (rated.length < 2) return empty;
            const keys = [ ...new Set(rated.flatMap(m => Object.keys(m.poles))) ];
            if (keys.length < 2) return empty;
            const rows = rated.map(m => sxHeldRow(m.poles, keys));
            let straight = 0;
            keys.forEach((k, j) => {
                let mn = 1;
                rows.forEach(r => { mn = Math.min(mn, r[j]); });
                if (mn > straight) straight = mn;
            });
            const rel = sxRelevanceGroup(rated.map(m => m.intensity));
            const reading = meta && meta.poleReading;
            const cross = !reading || "complement" === reading ? sxBestRoleProduct(rows) : 0;
            // Opposite interest on a same-pole widget is the argument
            // (Jason 2026-11-19). The overlap moves to the feud. A
            // stored far pole is unchanged.
            const enemy = "same" === reading && rel.opposed ? straight : ("antipodal" === reading || "trilemma" === reading ? sxGroupEnemy(rows, keys, meta.poleEnemies) : 0);
            return {
                straight: straight, cross: cross, enemy: enemy,
                factor: rel.factor, debate: sxDebateFactor(rated.map(m => m.intensity)),
                aversion: rel.aversion, opposed: rel.opposed
            };
        }
        function sxSides(td, heat) {
            const T = sxClamp(35 - heat, 0, 85);
            if (td.notInterested) return { give: "against", receive: "against" };
            if (td.single) {
                const s = !td.rated ? "unknown" : td.singleValue < 0 ? "against" : "curious";
                return { give: s, receive: s };
            }
            return { give: sxStance(td.raw.give, td.raw.giveKnown, T), receive: sxStance(td.raw.receive, td.raw.receiveKnown, T) };
        }
        function sxRawVal(td, dir) {
            if (td.single) return td.rated ? td.singleValue : null;
            return td.raw[dir + "Known"] ? td.raw[dir] : null;
        }
        function sxRoute(gS, gV, gSingle, rS, rV, rSingle) {
            if ("unknown" === gS || "unknown" === rS) return null;
            if ("against" === gS && "against" === rS) return { kind: "mutual-no" };
            if ("against" === gS || "against" === rS) return { kind: "clash" };
            let kind = "strong" === gS && "strong" === rS ? "full" : "curious" === gS && "curious" === rS ? "tentative" : "open";
            if ((gSingle || rSingle) && "full" === kind) kind = "open";
            return { kind: kind, strength: Math.min(gV, rV) };
        }
        function sxOneSidedShape(sA, sB, nameA, nameB) {
            const pos = s => "strong" === s || "curious" === s, aGive = pos(sA.give), aRecv = pos(sA.receive), bGive = pos(sB.give), bRecv = pos(sB.receive);
            if (aGive && bGive && !aRecv && !bRecv) return "both want to give";
            if (aRecv && bRecv && !aGive && !bGive) return "both want to receive";
            const who = [];
            (aGive || aRecv) && who.push(nameA), (bGive || bRecv) && who.push(nameB);
            return `one-sided — ${who.join(" and ") || nameA}`;
        }
        // Match-engine R1: the strongest-first ordering (strongest strength
        // first, ties broken by label A-Z) and the plain label ordering are
        // declared ONCE here, above every use - the pair scorer, the group
        // scorer, and both teaser bumps all sort through these two.
        const byStrength = (x, y) => (y.strength || 0) - (x.strength || 0) || x.label.localeCompare(y.label), byLabel = (x, y) => x.label.localeCompare(y.label);
        function sxLowestSet(pairs, profiles) {
            const kfOf = pr => pr.conversation ? pr.conversation.kinkFactor : null,
                scoreOf = m => {
                    const kfs = pairs.filter(pr => pr.i === m || pr.j === m).map(kfOf).filter(v => null !== v);
                    return kfs.length ? kfs.reduce((a, b) => a + b, 0) / kfs.length : null;
                },
                scores = profiles.map((p, m) => scoreOf(m)),
                min = scores.reduce((a, v) => null === v ? a : null === a ? v : Math.min(a, v), null),
                lowest = null === min ? [] : scores.map((v, m) => v === min ? m : -1).filter(m => m >= 0);
            return { scores: scores, min: min, lowest: lowest };
        }
        // Match-engine R5: the "take the top slice" curve - the first
        // ceil(|list| * heat / 100) entries, floored at one - is declared
        // ONCE here, above every use: the teaser selection and both
        // promotion bumps (pair and group) slice through it, each passing
        // its own heat value unchanged.
        const takeTop = (list, heat) => list.slice(0, Math.max(1, Math.ceil(list.length * heat / 100)));
        // Match-engine R4: the score headline sentence - the percent,
        // then "N of M shared topics" across the dash, with the group
        // prefix (e.g. "group match score for NAME") folded in ahead of
        // the dash where a view carries one - is written ONCE here,
        // above every use: the pair scorer and the group scorer each
        // build their Play and Conversation headline text through it,
        // each passing its own percent / count / considered values (and
        // its prefix, where present) unchanged. A null percent yields
        // null, exactly as each site's own null check did before.
        const sxHeadlineText = (percent, clicks, things, prefix) => null === percent ? null : `${percent}%${prefix ? ` ${prefix}` : ""} — ${clicks} of ${things} shared topics`;
        // Kinkiness weighting (ruled 2026-10-29, all four pair numbers,
        // pair and group both): Play KF, Play MS,
        // Parlay MS, and Parlay KF are weighted by
        // kinkiness just like Personal / Charted. Effective weight =
        // hierarchical share x kinkiness (sxTopicWeight; kinkiness =
        // 1 - the single O6 aggregate popularity per topic), applied
        // ONCE in numerator and denominator alike. The counted and
        // considered SETS (and the counts reported beside the percent)
        // stay exactly as defined at each call site; only the percent
        // is weighted. Numerator and denominator are summed
        // independently, preserving each site's existing set relation
        // (e.g. a teased topic can count toward the pair conversation
        // numerator). Solver energy is EXCLUDED from this weighting:
        // no solver / settler code calls this helper or sxTopicWeight.
        function sxKinkWeightedPct(recs, isCounted, isConsidered) {
            let num = 0, den = 0, consideredCount = 0;
            recs.forEach(r => {
                const w = sxTopicWeight(r.id);
                if (isConsidered(r)) { consideredCount++; den += w; }
                if (isCounted(r)) num += w;
            });
            return consideredCount && den > 0 ? Math.round(100 * num / den) : null;
        }
        // Play inclusion table (six-scores provisional build,
        // 2026-10-30): Play KF and Play MS use Play's OWN table for
        // now, copied from Charted (the FINAL inclusion tables are
        // DEFERRED - recommendation 2 unruled; Charted's own table,
        // sxFlagSum / sxTopicTerms, is NOT used by Play and is
        // unchanged). Per topic, per member, counted once per topic,
        // listing only what counts: Favorite 1, Tried +1, Fantasy
        // +0.5 ONLY when combined with a rating or another flag (a
        // Fantasy-ONLY flag counts 0 in Play). Limit is not in the
        // table at all - a limit-blocked topic is excluded by the
        // callers' considered sets, never scored here.
        function sxPlayTableFlags(td) {
            const fav = td.favorite ? 1 : 0, tried = td.triedScope ? 1 : 0,
                fantasy = td.fantasyScope ? (td.rated || fav || tried ? .5 : 0) : 0;
            return fav + tried + fantasy;
        }
        // A member's Play KF total for a topic: the binary
        // "rated or not" base plus the Play table's flag sum.
        function sxPlayMemberTotal(td) {
            return (td.rated ? 1 : 0) + sxPlayTableFlags(td);
        }
        // Parlay inclusion table (six-scores provisional build,
        // 2026-10-30, FOR-NOW - final table DEFERRED; Favorite
        // RESTORED at +1 2026-10-30 - its removal in the group-Parlay
        // fix was wrong; Favorite was ruled +1 in this table, not
        // zero): Parlay KF and Parlay MS
        // use Parlay's OWN table on the straight match. Per topic,
        // per member, counted once per topic, listing only what
        // counts: Favorite 1, Tried 1, Fantasy 1 (FULL 1, whether combined or
        // fantasy-only - unlike Play). Teased does not enter Parlay consideration at all
        // (absent, not zero). Limit is not in the table -
        // limit-blocked topics stay out of Parlay's considered set
        // entirely.
        function sxParlayTableFlags(td) {
            return (td.favorite ? 1 : 0) + (td.triedScope ? 1 : 0) + (td.fantasyScope ? 1 : 0);
        }
        // A member's Parlay KF total for a topic: the binary
        // "rated or not" base plus the Parlay table's flag sum.
        function sxParlayMemberTotal(td) {
            return (td.rated ? 1 : 0) + sxParlayTableFlags(td);
        }
        function sxPlayGeoMean(vals) {
            if (!vals.length) return 0;
            let prod = 1;
            vals.forEach(v => { prod *= v; });
            return Math.pow(prod, 1 / vals.length);
        }
        // Epsilon (six-scores provisional build, 2026-10-30;
        // recommendation 4 ACCEPTED with scale factor): epsilon =
        // e_0 * e^(-heat/100), with e_0 = 1 for now, in profile units
        // throughout, no rescaling (epsilon scale handling beyond
        // e_0 = 1 is NOT ruled). APPLIED as a threshold: for Play and
        // Parlay, a direction counts as binary fit only where the
        // absolute normed match term (scale -100..+100) exceeds
        // epsilon, with heat = the group heat = the arithmetic mean
        // of the members' individual heats at formation (Parlay
        // groups in Conversation mode included). For a SINGLE
        // profile the same epsilon, from that person's OWN heat,
        // thresholds their RATING: a flank counts by rating only if
        // its absolute rating exceeds epsilon (see sxTopicTerms).
        // Positive heat -> smaller epsilon (more counts); negative
        // heat -> larger epsilon (fewer counts).
        const SX_EPSILON_E0 = 1;
        function sxPlayEpsilon(heats) {
            const hs = (heats || []).filter(Number.isFinite);
            const h = hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 0;
            return SX_EPSILON_E0 * Math.exp(-h / 100);
        }
        // Hierarchy-share x kinkiness weighted mean of per-topic
        // entries (entries are fractions: KF entries are maxFit/100 x
        // geometric mean, MS entries are geometric means), the weight
        // applied ONCE, numerator and denominator alike. Returns the
        // rounded percent plus the counted (entry > 0) and considered
        // topic counts the headline text reports.
        function sxPlayWeightedPct(recs, entryOf, isConsidered) {
            let num = 0, den = 0, consideredCount = 0, countedCount = 0;
            recs.forEach(r => {
                if (!isConsidered(r)) return;
                const e = entryOf(r);
                if (null == e || !Number.isFinite(e)) return;
                const w = sxTopicWeight(r.id);
                consideredCount++, den += w, num += w * e;
                if (e > 0) countedCount++;
            });
            return { pct: consideredCount && den > 0 ? Math.round(100 * num / den) : null, counted: countedCount, considered: consideredCount };
        }
        // Match-engine (Edit 8): the display-layer MOVE rule - a teased
        // topic moves from the red bucket to the yellow bucket - is
        // governed by ONE predicate, stated once here: the topic's
        // teased list is non-empty AND its class is exactly "soft-no".
        // The pair-glance MOVE and the pair ring-bucket MOVE call this
        // predicate directly; the group ring-bucket MOVE calls it on
        // the pair-selected record and adds its own conditions
        // (non-fantasy, teased for a lowest-overall-kink-score member)
        // at its call site - those group-only conditions are NOT part
        // of this predicate and are not folded into it.
        const sxIsTeased = rec => (rec.teaserFor || []).length && "soft-no" === rec.countClass;
        // Match-engine (Edit 6): the blind-import filter - which of an
        // imported profile's topics survive a blind comparison against
        // the selected comparison group, plus the kept/discarded counts
        // the import toast reports - is declared ONCE here, with the
        // rest of the match engine; the import door calls it with the
        // new profile's id and the comparison-group ids, exactly as it
        // called the inline IIFE this replaces. Its keep rule (no group
        // member limit-blocks the topic, and every member is at >= 36 on
        // the give or the receive flank) is its own and moves unchanged.
        function sxBlindFilter(e, t) {
            const n = [ ...new Set(t.filter(e => vt[e])) ];
            if (n.length < 2) return null;
            const i = n.concat(e).map(e => ({
                name: wt[e],
                ratings: vt[e],
                annotations: Qe[e],
                fantasyOnly: Je[e],
                alreadyTried: et[e],
                importedChildren: at[e],
                roles: st[e]
            })), a = [ vt[e], Ze[e], Qe[e], Je[e], et[e], tt[e] ], r = new Set;
            a.forEach(e => Object.keys(e || {}).forEach(e => {
                isCatId(e) || r.add(e);
            })), Object.keys(at[e] || {}).forEach(e => r.add(e));
            const o = new Set([ ...r ].filter(e => !i.some(t => Fd(t, e)) && i.every(t => {
                const n = Ld(t, e);
                return n.giveKnown && n.give >= 36 || n.receiveKnown && n.receive >= 36;
            })));
            return a.forEach(e => Object.keys(e || {}).forEach(t => {
                o.has(t) || delete e[t];
            })), Object.keys(at[e] || {}).forEach(t => {
                o.has(t) || delete at[e][t];
            }), {
                kept: o.size,
                discarded: [ ...r ].filter(e => !o.has(e)).length,
                groupSize: n.length
            };
        }
        function sxPairFromData(A, B, ids, metas, dataA, dataB, opts) {
            opts = opts || {};
            const heatA = sxClamp(Number(opts.heatA) || 0, -100, 100), heatB = sxClamp(Number(opts.heatB) || 0, -100, 100),
                veilA = null == opts.veilA ? 50 : sxClamp(Number(opts.veilA) || 0, 0, 100), veilB = null == opts.veilB ? 50 : sxClamp(Number(opts.veilB) || 0, 0, 100),
                F = Math.max(0, -heatA, -heatB), nameA = A.name || "First partner", nameB = B.name || "Second partner",
                topics = [], topicsById = {}, teaserCand = [];
            /* Epsilon for this pair (six-scores provisional build):
               group heat = arithmetic mean of the two members' heats
               at formation; binary fit below requires |term| > eps. */
            const sxPairEps = sxPlayEpsilon([ heatA, heatB ]);
            let ratedA = 0, ratedB = 0, oneSidedCount = 0, limitBlocked = 0, fantasySetAside = 0, sharedCount = 0;
            ids.forEach((id, ix) => {
                const meta = metas[ix];
                if (!meta) return;
                const a = dataA[ix], b = dataB[ix];
                a.rated && ratedA++, b.rated && ratedB++;
                const limiters = [];
                a.limitScope && limiters.push({ name: nameA, scope: a.limitScope }), b.limitScope && limiters.push({ name: nameB, scope: b.limitScope });
                const rec = {
                    id: id, label: meta.label, branch: meta.branch,
                    outcome: "invisible", playOutcome: "invisible", strength: null, bestFit: null,
                    fits: [], directions: [], bothWays: !1, clashes: [], shed: !1, mutualNo: !1,
                    ratings: {
                        a: { give: a.raw.give, giveKnown: a.raw.giveKnown, receive: a.raw.receive, receiveKnown: a.raw.receiveKnown, single: a.single, singleValue: a.singleValue, polesKnown: a.polesKnown, lineKnown: a.lineKnown },
                        b: { give: b.raw.give, giveKnown: b.raw.giveKnown, receive: b.raw.receive, receiveKnown: b.raw.receiveKnown, single: b.single, singleValue: b.singleValue, polesKnown: b.polesKnown, lineKnown: b.lineKnown }
                    },
                    flags: {
                        notInterested: [ a.notInterested && nameA, b.notInterested && nameB ].filter(Boolean),
                        triedBy: [ a.triedScope && nameA, b.triedScope && nameB ].filter(Boolean),
                        fantasyBy: [ a.fantasyScope && nameA, b.fantasyScope && nameB ].filter(Boolean),
                        favoriteBy: [ a.favorite && nameA, b.favorite && nameB ].filter(Boolean)
                    },
                    limiters: limiters, differentIntensities: !1, mismatchShape: null,
                    countClass: null, hotContribution: 0, teaserFor: [], teaserDetail: []
                };
                topics.push(rec), topicsById[id] = rec;
                if (limiters.length) return rec.outcome = "limit-blocked", rec.playOutcome = "limit-blocked", void limitBlocked++;
                const sA = sxSides(a, heatA), sB = sxSides(b, heatB), pos = s => "strong" === s || "curious" === s, anyPos = s => pos(s.give) || pos(s.receive),
                    posFlanks = (s, td) => [ "give", "receive" ].filter(d => pos(s[d])).map(d => ({ dir: d, stance: s[d], rating: sxRawVal(td, d) }));
                /* Teaser candidacy gate (suppression, 2026-10-26): a topic is a teaser candidate only if the excited partner's best positive rating clears the veiled owner's veil threshold, interest >= 80 - 1.8 * veil (Aa). The owner's mark interest (-100) is what the veil hides, so it cannot be the operand that opens the gate: the literal mark-interest reading would admit rows only at veil 100 and would perversely admit unrated marks (null coerces to 0) over rated ones. Candidacy stays marks-only: notInterested marks, never bare -100 ratings. */
                const flanksA = posFlanks(sB, b), intA = flanksA.map(f => f.rating).filter(Number.isFinite), passA = intA.length > 0 && Math.max(...intA) >= Aa(veilA);
                const flanksB = posFlanks(sA, a), intB = flanksB.map(f => f.rating).filter(Number.isFinite), passB = intB.length > 0 && Math.max(...intB) >= Aa(veilB);
                a.notInterested && heatA > 0 && anyPos(sB) && passA && teaserCand.push({ rec: rec, side: "a", owner: nameA, partner: nameB, heat: heatA, flanks: flanksA });
                b.notInterested && heatB > 0 && anyPos(sA) && passB && teaserCand.push({ rec: rec, side: "b", owner: nameB, partner: nameA, heat: heatB, flanks: flanksB });
                if (!(a.rated && b.rated)) return void (a.rated !== b.rated && oneSidedCount++);
                sharedCount++;
                const fantasy = Boolean(a.fantasyScope || b.fantasyScope);
                /* Play KF / Play MS per-topic entries (six-scores
                   provisional build, 2026-10-30). GROUND x FIT: marks
                   and whether something has a fit determine the
                   ground; the ground is multiplied by the TYPE of
                   fit, positive or negative. Krossmatch fits, normed
                   by 100 to profile scale: give-fit = my give x your
                   receive / 100, receive-fit = my receive x your give
                   / 100, each in [-100, 100]; a direction with an
                   unrated flank has no fit. Play KF entry = max fit
                   (as a fraction; signed — max is positive if ANY
                   direction is positive, negative only if BOTH are
                   negative, least negative) x geometric mean over
                   members of (rated-or-not + Play table sum), each
                   member normalized by the group max of that same
                   total. Different marks count as ground in whatever
                   form (one member's fantasy, another's high rating,
                   another's tried — each is ground for that member);
                   fit does not create ground, it multiplies over it.
                   Play MS entry = geometric mean over members of
                   (binary fit existence + Play table flag sum),
                   normalized by the group max of that sum; binary fit
                   per direction = 1 iff |cross-match term| > epsilon
                   (sxPairEps, group heat at formation), and each
                   member takes part in both directions, so both
                   members share the count.
                   Marks vs fit (recommendation 1 ACCEPTED): NO extra
                   weight factor — the stated multiplication stands,
                   fit sets direction/magnitude, marks set how much of
                   that fit is covered. */
                /* Multi-pole comparison (ruled 2026-11-16): for a
                   shared multi-pole topic, the Play MS entry is the
                   agreement fraction (0–1) and the Play KF entry is
                   the agreement × the Depth Factor intensity
                   (geometric mean over members of each member's
                   strongest stance ÷100). The flanked computation is
                   skipped for these topics — they have no flanks, so
                   it would give a null KF entry and a 0 MS entry.
                   (Flag folding for multi-pole entries is not defined
                   in the design; the samples carry no flags, so the
                   entries are the agreement and agreement ×
                   intensity exactly.) */
                rec.polesA = a.poles, rec.polesB = b.poles, rec.lineA = a.line, rec.lineB = b.line;
                rec.advocacyA = a.advocacy;
                rec.advocacyB = b.advocacy;
                rec.receptivityA = a.receptivity;
                rec.receptivityB = b.receptivity;

                // Deliberative flow: A_adv x B_rec and B_adv x A_rec
                let delibAtoB = null, delibBtoA = null;
                if (a.advocacy && b.receptivity && a.advocacy.poles && b.receptivity.poles) {
                    const pKeys = [...new Set([...Object.keys(a.advocacy.poles), ...Object.keys(b.receptivity.poles)])];
                    let sum = 0;
                    pKeys.forEach(k => {
                        const va = Math.max(0, Number(a.advocacy.poles[k]) || 0);
                        const vb = Math.max(0, Number(b.receptivity.poles[k]) || 0);
                        sum += va * vb;
                    });
                    const iA = (a.advocacy.intensity != null) ? a.advocacy.intensity : 100;
                    const iB = (b.receptivity.intensity != null) ? b.receptivity.intensity : 100;
                    const rel = sxRelevancePair(iA, iB);
                    delibAtoB = (sum / 10000) * (rel.aversion || rel.opposed ? 0 : rel.factor);
                }
                if (b.advocacy && a.receptivity && b.advocacy.poles && a.receptivity.poles) {
                    const pKeys = [...new Set([...Object.keys(b.advocacy.poles), ...Object.keys(a.receptivity.poles)])];
                    let sum = 0;
                    pKeys.forEach(k => {
                        const vb = Math.max(0, Number(b.advocacy.poles[k]) || 0);
                        const va = Math.max(0, Number(a.receptivity.poles[k]) || 0);
                        sum += vb * va;
                    });
                    const iB = (b.advocacy.intensity != null) ? b.advocacy.intensity : 100;
                    const iA = (a.receptivity.intensity != null) ? a.receptivity.intensity : 100;
                    const rel = sxRelevancePair(iB, iA);
                    delibBtoA = (sum / 10000) * (rel.aversion || rel.opposed ? 0 : rel.factor);
                }
                rec.deliberative = (delibAtoB != null || delibBtoA != null) ? { AtoB: delibAtoB, BtoA: delibBtoA } : null;

                // Straight components: Advocacy x Advocacy & Receptivity x Receptivity
                if (a.advocacy && b.advocacy && a.advocacy.poles && b.advocacy.poles) {
                    const pKeys = [...new Set([...Object.keys(a.advocacy.poles), ...Object.keys(b.advocacy.poles)])];
                    let allied = 0;
                    pKeys.forEach(k => {
                        const va = Math.max(0, Number(a.advocacy.poles[k]) || 0);
                        const vb = Math.max(0, Number(b.advocacy.poles[k]) || 0);
                        allied += (va * vb) / 10000;
                    });
                    rec.straightAdvocacy = allied;
                }
                if (a.receptivity && b.receptivity && a.receptivity.poles && b.receptivity.poles) {
                    const pKeys = [...new Set([...Object.keys(a.receptivity.poles), ...Object.keys(b.receptivity.poles)])];
                    let open = 0;
                    pKeys.forEach(k => {
                        const va = Math.max(0, Number(a.receptivity.poles[k]) || 0);
                        const vb = Math.max(0, Number(b.receptivity.poles[k]) || 0);
                        open += (va * vb) / 10000;
                    });
                    rec.straightReceptivity = open;
                }
                const agreement = sxPoleAgreement(a, b);
                const role = a.polesKnown && b.polesKnown ? sxPoleMatch(meta, a.poles, b.poles) : null;
                if (role) {
                    // Play reads the complementary role. The talk reads
                    // the similar role. A shared no stays a talk. Opposite
                    // interest on a same-pole widget is the argument, so
                    // that overlap moves to the feud and leaves the talk.
                    // Play still drops a shared no and a sign split.
                    const rel = sxRelevancePair(a.intensity, b.intensity);
                    const playWeight = rel.aversion || rel.opposed ? 0 : rel.factor;
                    const talkWeight = rel.opposed ? 0 : rel.factor;
                    rec.poleRole = !0;
                    rec.agreement = role.straight;
                    rec.roleStraight = role.straight;
                    rec.roleCross = role.cross;
                    rec.roleEnemy = meta && "same" === meta.poleReading && rel.opposed ? role.straight : role.enemy;
                    rec.debateIntensity = sxDebateFactor([ a.intensity, b.intensity ]);
                    rec.poleIntensity = rel.factor;
                    rec.sharedAversion = rel.aversion;
                    rec.relevanceOpposed = rel.opposed;
                    rec.intensityA = a.intensity;
                    rec.intensityB = b.intensity;
                    rec.crossEntry = role.cross * playWeight;
                    rec.straightEntry = role.straight * talkWeight;
                    rec.crossFitGive = null;
                    rec.crossFitReceive = null;
                    rec.playMSEntry = rec.crossEntry;
                    rec.playKFEntry = rec.crossEntry;
                } else if (null != agreement) {
                    const rel = a.intensityKnown && b.intensityKnown ? sxRelevancePair(a.intensity, b.intensity) : null;
                    const intensity = rel ? rel.aversion ? 0 : rel.factor : sxPoleIntensity(a, b);
                    rec.agreement = agreement;
                    rec.poleIntensity = intensity;
                    rec.sharedAversion = Boolean(rel && rel.aversion);
                    rec.relevanceOpposed = Boolean(rel && rel.opposed);
                    rec.intensityA = a.intensity;
                    rec.intensityB = b.intensity;
                    // Effective care for the debate factor and the
                    // play-list gates: the stored relevance when there
                    // is one, else the strongest stance's size (a line
                    // topic's scalar is its stance).
                    rec.careA = null != a.intensity ? a.intensity : Math.abs(a.strongest || 0);
                    rec.careB = null != b.intensity ? b.intensity : Math.abs(b.strongest || 0);
                    rec.debateIntensity = sxDebateFactor([ rec.careA, rec.careB ]);
                    rec.crossFitGive = null, rec.crossFitReceive = null;
                    rec.playMSEntry = agreement * (rel ? intensity : 1);
                    rec.playKFEntry = agreement * intensity;
                } else {
                    const gvA = sxRawVal(a, "give"), rvA = sxRawVal(a, "receive"), gvB = sxRawVal(b, "give"), rvB = sxRawVal(b, "receive"),
                        fitGive = null != gvA && null != rvB ? gvA * rvB / 100 : null,
                        fitRecv = null != gvB && null != rvA ? gvB * rvA / 100 : null;
                    rec.crossFitGive = fitGive, rec.crossFitReceive = fitRecv;
                    const totA = sxPlayMemberTotal(a), totB = sxPlayMemberTotal(b), totMax = Math.max(totA, totB),
                        gmRated = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                        fitArr = [ fitGive, fitRecv ].filter(v => null != v),
                        maxFit = fitArr.length ? Math.max(...fitArr) : null;
                    rec.playKFEntry = null == maxFit ? null : maxFit / 100 * gmRated;
                    const binFit = (null != fitGive && Math.abs(fitGive) > sxPairEps ? 1 : 0) + (null != fitRecv && Math.abs(fitRecv) > sxPairEps ? 1 : 0),
                        cMsA = binFit + sxPlayTableFlags(a), cMsB = binFit + sxPlayTableFlags(b), cMsMax = Math.max(cMsA, cMsB);
                    rec.playMSEntry = cMsMax > 0 ? sxPlayGeoMean([ cMsA / cMsMax, cMsB / cMsMax ]) : 0;
                }
                fantasy && fantasySetAside++;
                const mkRoute = (dir, gS, gV, gSingle, rS, rV, rSingle, giverName, receiverName, againstName) => {
                    const r = sxRoute(gS, gV, gSingle, rS, rV, rSingle);
                    if (!r) return;
                    if ("mutual-no" === r.kind) return void (rec.mutualNo = !0);
                    if ("clash" === r.kind) return void rec.clashes.push({ direction: dir, against: againstName });
                    const fit = { direction: dir, kind: r.kind, strength: r.strength, giver: giverName, receiver: receiverName, giverRating: gV, receiverRating: rV, shed: r.strength < F };
                    rec.fits.push(fit), fit.shed && (rec.shed = !0);
                };
                mkRoute("AtoB", sA.give, sxRawVal(a, "give"), a.single, sB.receive, sxRawVal(b, "receive"), b.single, nameA, nameB, "against" === sA.give ? nameA : nameB);
                mkRoute("BtoA", sB.give, sxRawVal(b, "give"), b.single, sA.receive, sxRawVal(a, "receive"), a.single, nameB, nameA, "against" === sB.give ? nameB : nameA);
                const counting = rec.fits.filter(f => !f.shed);
                if (counting.length) {
                    const best = counting.slice().sort((x, y) => y.strength - x.strength)[0];
                    rec.bestFit = best, rec.strength = best.strength,
                    rec.directions = [ ...new Set(counting.map(f => f.direction)) ], rec.bothWays = rec.directions.length > 1,
                    rec.differentIntensities = Math.abs(best.giverRating - best.receiverRating) >= 40,
                    rec.outcome = counting.some(f => "full" === f.kind) ? "match" : "curious-fit";
                } else if (rec.clashes.length) rec.outcome = "conflict";
                else if (rec.shed || anyPos(sA) || anyPos(sB)) rec.outcome = "one-sided";
                else rec.outcome = "not-topics";
                // A role topic joins the play lists from the complementary
                // role, not from give/receive flanks (it has none). Two
                // people on the same pole stay out of play; they land in
                // the straight register below. Shared aversion and a
                // don't-care stay out of both "do this" lists.
                if (rec.poleRole) {
                    const Ta = sxClamp(35 - heatA, 0, 85), Tb = sxClamp(35 - heatB, 0, 85);
                    const iA = a.intensity, iB = b.intensity;
                    rec.strength = null;
                    rec.bestFit = null;
                    if (rec.sharedAversion || rec.relevanceOpposed || !(iA > 0 && iB > 0) || !(rec.roleCross > 0)) rec.outcome = "not-topics";
                    else if (iA > Ta && iB > Tb && rec.roleCross >= .5) {
                        rec.outcome = "match";
                        rec.strength = Math.round(rec.roleCross * rec.poleIntensity * 100);
                    } else {
                        rec.outcome = "curious-fit";
                        rec.strength = Math.round(rec.roleCross * rec.poleIntensity * 100);
                    }
                }
                // A line topic (and any shared pole topic the role
                // reading did not claim) joins the play lists from its
                // agreement, under the same gates the role topics use
                // (ruled 2026-11-21: pole topics are visible to the
                // match lists in every mode). Both members must care,
                // neither may be averse or opposed, and agreement of
                // at least half makes a match; any lesser shared
                // ground is a curious fit. Shared aversion and a
                // don't-care stay out of the "do this" lists.
                if (!rec.poleRole && null != rec.agreement) {
                    const Ta2 = sxClamp(35 - heatA, 0, 85), Tb2 = sxClamp(35 - heatB, 0, 85);
                    rec.strength = null, rec.bestFit = null;
                    if (rec.sharedAversion || rec.relevanceOpposed || !(rec.careA > 0 && rec.careB > 0) || !(rec.agreement > 0)) rec.outcome = "not-topics";
                    else if (rec.careA > Ta2 && rec.careB > Tb2 && rec.agreement >= .5) {
                        rec.outcome = "match";
                        rec.strength = Math.round(rec.agreement * rec.poleIntensity * 100);
                    } else {
                        rec.outcome = "curious-fit";
                        rec.strength = Math.round(rec.agreement * rec.poleIntensity * 100);
                    }
                }
                rec.playOutcome = fantasy ? "fantasy-excluded" : rec.outcome;
                if ("conflict" === rec.outcome) rec.mismatchShape = `opposed — ${rec.clashes[0].against}`;
                if ("one-sided" === rec.outcome) rec.mismatchShape = sxOneSidedShape(sA, sB, nameA, nameB);
                if (rec.poleRole && rec.sharedAversion) rec.mismatchShape = "shared aversion";
                if (rec.poleRole && rec.relevanceOpposed) {
                    rec.outcome = "conflict";
                    rec.playOutcome = fantasy ? "fantasy-excluded" : "conflict";
                    rec.mismatchShape = "opposed";
                }
                if ("match" === rec.outcome || "curious-fit" === rec.outcome) rec.countClass = fantasy ? "fantasy" : "match";
                else if (fantasy && ((a.fantasyScope && (anyPos(sB) || rec.fits.length)) || (b.fantasyScope && (anyPos(sA) || rec.fits.length)))) rec.countClass = "fantasy";
                if (!rec.countClass && (a.triedScope || b.triedScope)) rec.countClass = "experience";
                // countClass "soft-no" is assigned by the teaser selection
                // pass after the topic loop, so the ring counts (via the MOVEs) and
                // the popover Teasers sections always share one selected set.
                rec.hotContribution = !rec.countClass ? 0 : "experience" === rec.countClass || "soft-no" === rec.countClass ? 25 : rec.bestFit ? rec.bestFit.strength : null != rec.strength ? rec.strength : rec.fits.length ? Math.max(...rec.fits.map(f => f.strength)) : 0;
            });
            /* Straight register (Job 1, raw straight sum): same-direction
                products from the crossed records' own ratings, computed beside the
                crossed routes from the same data. Limits excluded everywhere;
                unshared topics stay invisible but coverage-counted. Independent of
                teaser selection, the teaser bump, countClass, heat, and veil — only
                the limit gate filters. No bucket classes, no headline, no counts
                display here; those are deferred rulings. */
            const straightTopics = [], straightById = {};
            let straightShared = 0, straightOneSided = 0, straightLimitBlocked = 0;
            topics.forEach(rec => {
                const ra = rec.ratings.a, rb = rec.ratings.b,
                    giveGive = ra.giveKnown && rb.giveKnown ? ra.give * rb.give : null,
                    recvRecv = ra.receiveKnown && rb.receiveKnown ? ra.receive * rb.receive : null,
                    // A role topic's straight sum is the similar-role
                    // overlap times the smaller relevance. Give/receive
                    // topics keep their flank products. A line topic
                    // (agreement, no flanks) sums its agreement times
                    // its relevance, so it bands and lists with the
                    // rest of the register (ruled 2026-11-21).
                    sum = rec.poleRole ? rec.straightEntry > 0 ? rec.straightEntry * 100 : null : null == giveGive && null == recvRecv ? null != rec.agreement && rec.poleIntensity > 0 ? rec.agreement * rec.poleIntensity * 100 : null : (giveGive || 0) + (recvRecv || 0),
                    // Multi-pole comparison (ruled 2026-11-16): a pole
                    // vector or a line scalar counts as rated here too,
                    // so a shared multi-pole topic is "shared" in the
                    // straight register (its Parlay entry comes from
                    // the agreement, carried on the record).
                    aRated = ra.giveKnown || ra.receiveKnown || ra.polesKnown || ra.lineKnown, bRated = rb.giveKnown || rb.receiveKnown || rb.polesKnown || rb.lineKnown;
                let status;
                if (rec.limiters.length) status = "limit-blocked", straightLimitBlocked++;
                else if (!(aRated && bRated)) status = "invisible", aRated !== bRated && straightOneSided++;
                else status = "shared", straightShared++;
                const srec = { id: rec.id, label: rec.label, branch: rec.branch, giveGive: giveGive, recvRecv: recvRecv, sum: sum, status: status, ratings: rec.ratings, flags: rec.flags, agreement: null != rec.agreement ? rec.agreement : null, poleIntensity: null != rec.poleIntensity ? rec.poleIntensity : null, roleStraight: null != rec.roleStraight ? rec.roleStraight : null, roleCross: null != rec.roleCross ? rec.roleCross : null, roleEnemy: null != rec.roleEnemy ? rec.roleEnemy : null, debateIntensity: null != rec.debateIntensity ? rec.debateIntensity : null, sharedAversion: Boolean(rec.sharedAversion), polesA: rec.polesA || null, polesB: rec.polesB || null, lineA: null != rec.lineA ? rec.lineA : null, lineB: null != rec.lineB ? rec.lineB : null };
                straightTopics.push(srec), straightById[rec.id] = srec;
            });
            const straightList = straightTopics.filter(s => "shared" === s.status && null != s.sum && s.sum > 0).sort((x, y) => (y.sum || 0) - (x.sum || 0) || x.label.localeCompare(y.label)),
                straight = { topics: straightTopics, byId: straightById, list: straightList, coverage: { shared: straightShared, oneSided: straightOneSided, limitBlocked: straightLimitBlocked } };
            /* Teaser selection: per owner, the eligible soft-no topics
               (owner marked notInterested, owner's own Heat > 0, partner
               positive on some flank, and the excited partner's best positive rating clears the veiled owner's veil threshold) are
               ordered by the partner's best positive rating descending,
               ties by label A–Z, and the first ceil(|E| * heat / 100) are
               selected (at least one whenever heat > 0). The one selection
               drives teaserFor, the soft-no countClass, and the popover
               Teasers sections together, so they can never diverge. */
            [ "a", "b" ].forEach(side => {
                const mine = teaserCand.filter(c => side === c.side);
                if (!mine.length) return;
                const heat = mine[0].heat, bestOf = c => Math.max(...c.flanks.map(f => null == f.rating ? -1 : f.rating));
                mine.sort((x, y) => bestOf(y) - bestOf(x) || x.rec.label.localeCompare(y.rec.label)),
                takeTop(mine, heat).forEach(c => {
                    c.rec.teaserFor.push(c.owner), c.rec.teaserDetail.push({ owner: c.owner, partner: c.partner, heat: c.heat, flanks: c.flanks }),
                    !c.rec.countClass && "invisible" !== c.rec.outcome && (c.rec.countClass = "soft-no", c.rec.hotContribution = 25);
                });
            });
            /* Teaser bump (Curious → Hot promotion, Jason 2026-10-25): after
               the teaser selection, before lists are built. Per key, native
               curious topics (key "curious-fit", countClass not "soft-no")
               promote to "match", strongest first, ties
               label A–Z, first ceil(|C| * h / 100) with h = min(heatA, heatB),
               at least one when h > 0. Fantasy: the CONVERSATION bump
               (key "outcome") INCLUDES fantasy topics (ruled 2026-10-29,
               unified in the including direction with the group
               conversation bump); the PLAY bump (key "playOutcome") still
               excludes fantasy. The bump itself is veil-free: Veil gates
               nothing in this bump (its matching effect is teaser
               candidacy only, per the engine header). countClass is NEVER
               changed; only the key outcome changes. */
            const bumpH = Math.min(heatA, heatB);
            if (bumpH > 0) [ "outcome", "playOutcome" ].forEach(key => {
                const convKey = "outcome" === key;
                const cands = topics.filter(r => "curious-fit" === r[key] && "soft-no" !== r.countClass && (convKey || ("fantasy" !== r.countClass && 0 === r.flags.fantasyBy.length))).sort(byStrength);
                takeTop(cands, bumpH).forEach(r => { r[key] = "match"; });
            });
            /* Play MS / Play KF aggregates (definition build
               2026-10-30, PROVISIONAL): hierarchy-share x kinkiness
               weighted sums over topics, numerator and denominator
               alike. Play MS considered set = shared (both members
               rated), not limit-blocked, not fantasy. Play KF
               denominator = shared, non-limit-blocked topics
               (weighted). */
            const sxSharedRated = r => {
                    const ra = r.ratings.a, rb = r.ratings.b;
                    // Multi-pole comparison (ruled 2026-11-16): a pole
                    // vector or a line scalar counts as rated, so a
                    // shared multi-pole topic is in the considered set.
                    return (ra.giveKnown || ra.receiveKnown || ra.polesKnown || ra.lineKnown) && (rb.giveKnown || rb.receiveKnown || rb.polesKnown || rb.lineKnown) && !r.limiters.length;
                },
                msAgg = sxPlayWeightedPct(topics, r => r.playMSEntry, r => sxSharedRated(r) && !(r.flags.fantasyBy || []).length),
                kfAgg = sxPlayWeightedPct(topics, r => r.playKFEntry, r => sxSharedRated(r));
            const mkLists = key => ({
                    matches: topics.filter(r => "match" === r[key]).sort(byStrength),
                    curiousAbout: topics.filter(r => "curious-fit" === r[key]).sort(byStrength),
                    mismatched: topics.filter(r => "conflict" === r[key] || "one-sided" === r[key]).sort(byLabel),
                    limits: topics.filter(r => "limit-blocked" === r[key]).sort(byLabel)
                }),
                playLists = mkLists("playOutcome"), playConsidered = playLists.matches.length + playLists.curiousAbout.length + topics.filter(r => "conflict" === r.playOutcome || "one-sided" === r.playOutcome || "not-topics" === r.playOutcome).length,
                play = {
                    considered: playConsidered,
                    matches: playLists.matches.length,
                    headline: msAgg.pct,
                    lists: playLists
                };
            play.headlineText = sxHeadlineText(play.headline, msAgg.counted, msAgg.considered);
            const convLists = mkLists("outcome"), counted = topics.filter(r => r.countClass),
                conversation = {
                    considered: convLists.matches.length + convLists.curiousAbout.length + topics.filter(r => "conflict" === r.outcome || "one-sided" === r.outcome || "not-topics" === r.outcome).length,
                    counted: counted.length,
                    countsByClass: {
                        match: counted.filter(r => "match" === r.countClass).length,
                        fantasy: counted.filter(r => "fantasy" === r.countClass).length,
                        experience: counted.filter(r => "experience" === r.countClass).length,
                        softNo: counted.filter(r => "soft-no" === r.countClass).length
                    },
                    kinkFactor: null,
                    lists: convLists
                };
            conversation.kinkFactor = kfAgg.pct;
            conversation.headlineText = sxHeadlineText(conversation.kinkFactor, kfAgg.counted, kfAgg.considered);
            const catalog = sxCatalogCount();
            return {
                engine: "sync-1.1", a: nameA, b: nameB,
                heat: { a: heatA, b: heatB }, veil: { a: veilA, b: veilB }, shedFloor: F,
                topics: topics, topicsById: topicsById, play: play, conversation: conversation, straight: straight,
                coverage: {
                    aRated: ratedA, bRated: ratedB, catalog: catalog,
                    aPercent: catalog ? Math.round(ratedA / catalog * 100) : 0,
                    bPercent: catalog ? Math.round(ratedB / catalog * 100) : 0,
                    oneSided: oneSidedCount, limitBlocked: limitBlocked, fantasySetAside: fantasySetAside, shared: sharedCount
                },
                live: sxLivePair(A, B)
            };
        }
        function sxPairCompute(A, B, opts) {
            const ids = Uc(), metas = [], dataA = [], dataB = [];
            ids.forEach(id => {
                const m = sxMeta(id, [ A, B ]);
                metas.push(m), dataA.push(m ? sxTopicData(A, id, m) : null), dataB.push(m ? sxTopicData(B, id, m) : null);
            });
            return sxPairFromData(A, B, ids, metas, dataA, dataB, opts);
        }
        let sxCatalogCache = null;
        function sxCatalogCount() {
            if (null === sxCatalogCache) sxCatalogCache = Uc().filter(id => {
                const m = qn[id];
                return m && "Category" !== m.kind;
            }).length;
            return sxCatalogCache;
        }
        function sxGenderClass(genders) {
            const g = bb(genders || []), man = [ "man", "trans-man", "intersex-man", "demiman" ], woman = [ "woman", "trans-woman", "intersex-woman", "demiwoman" ],
                hasM = g.some(x => man.includes(x)), hasW = g.some(x => woman.includes(x));
            if (hasM && !hasW && g.every(x => man.includes(x))) return "man";
            if (hasW && !hasM && g.every(x => woman.includes(x))) return "woman";
            return null;
        }
        function sxExclusiveAttraction(profile) {
            const o = iv(profile.orientations || []);
            if (!o.length) return null;
            const self = sxGenderClass(profile.genders);
            let target = null;
            for (const t of o) {
                let cur = null;
                if ("straight" === t || "heterosexual" === t) cur = self ? "man" === self ? "woman" : "man" : null;
                else if ("lesbian" === t || "sapphic" === t || "gynesexual" === t) cur = "woman";
                else if ("gay" === t) cur = self;
                else if ("androsexual" === t || "achillean" === t || "uranic" === t || "minsexual" === t) cur = "man";
                else return null;
                if (!cur) return null;
                if (target && target !== cur) return null;
                target = cur;
            }
            return target;
        }
        function sxLivePair(A, B) {
            const classA = sxGenderClass(A.genders), classB = sxGenderClass(B.genders);
            if (!classA || !classB) return !0;
            const attA = sxExclusiveAttraction(A), attB = sxExclusiveAttraction(B);
            if (attA && attA !== classB) return !1;
            if (attB && attB !== classA) return !1;
            return !0;
        }
        function sxGroupCompute(profiles, opts) {
            opts = opts || {};
            const n = profiles.length, ids = Uc(), metas = ids.map(id => sxMeta(id, profiles)),
                data = profiles.map(p => ids.map((id, ix) => metas[ix] ? sxTopicData(p, id, metas[ix]) : null)),
                po = (i, j) => ({
                    heatA: (opts.heat || [])[i] ?? 0, heatB: (opts.heat || [])[j] ?? 0,
                    veilA: (opts.veil || [])[i] ?? 50, veilB: (opts.veil || [])[j] ?? 50
                }), pairs = [];
            for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(Object.assign({ i: i, j: j }, sxPairFromData(profiles[i], profiles[j], ids, metas, data[i], data[j], po(i, j))));
            const topics = [], topicsById = {};
            ids.forEach((id, ix) => {
                const meta = metas[ix];
                if (!meta) return;
                const limiters = [], flags = { notInterested: [], triedBy: [], fantasyBy: [], favoriteBy: [] };
                profiles.forEach((p, pi) => {
                    const d = data[pi][ix], nm = p.name || `Profile ${pi + 1}`;
                    d.limitScope && limiters.push({ name: nm, scope: d.limitScope }),
                    d.notInterested && flags.notInterested.push(nm), d.triedScope && flags.triedBy.push(nm),
                    d.fantasyScope && flags.fantasyBy.push(nm), d.favorite && flags.favoriteBy.push(nm);
                });
                const rec = {
                    id: id, label: meta.label, branch: meta.branch, limiters: limiters, groupLimited: limiters.length > 0,
                    playOutcome: "none", conversationCounts: !1, relevantPlayPairs: 0, relevantConvPairs: 0,
                    pairOutcomes: [], strength: null, flags: flags
                };
                topics.push(rec), topicsById[id] = rec;
                if (rec.groupLimited) return void (rec.playOutcome = "limit-blocked");
                const relPlay = pairs.filter(pr => pr.live && "invisible" !== pr.topicsById[id].outcome && "limit-blocked" !== pr.topicsById[id].outcome),
                    relConv = pairs.filter(pr => "invisible" !== pr.topicsById[id].outcome && "limit-blocked" !== pr.topicsById[id].outcome);
                rec.relevantPlayPairs = relPlay.length, rec.relevantConvPairs = relConv.length,
                rec.pairOutcomes = relConv.map(pr => ({ a: pr.a, b: pr.b, outcome: pr.topicsById[id].outcome }));
                if (relPlay.length) {
                    const mCount = relPlay.filter(pr => "match" === pr.topicsById[id].outcome).length,
                        cCount = relPlay.filter(pr => "match" === pr.topicsById[id].outcome || "curious-fit" === pr.topicsById[id].outcome).length,
                        strengths = relPlay.map(pr => pr.topicsById[id].strength).filter(s => null !== s);
                    rec.playOutcome = mCount > relPlay.length / 2 ? "match" : cCount > relPlay.length / 2 ? "curious-fit" : "mismatched",
                    rec.strength = strengths.length ? Math.min(...strengths) : null;
                }
                if (relConv.length) rec.conversationCounts = relConv.filter(pr => pr.topicsById[id].countClass).length > relConv.length / 2;
                /* Play KF / Play MS group entries (six-scores
                   provisional build, 2026-10-30; group handling =
                   recommendation 5 ACCEPTED: strict majority, more
                   than half, ties do NOT count — consistent with
                   group Charted and pair unanimity for two). Member
                   totals and table sums come from each member's own
                   topic data; the fit side reuses the pair records —
                   Play KF fit = the max cross fit over all member
                   pairs (signed max rule, as for pairs); Play MS
                   binary fit per member = 1 per direction type
                   (give-cross / receive-cross) in which any pair
                   involving that member has a cross term with
                   |term| > epsilon, epsilon from the GROUP heat
                   (arithmetic mean of member heats at formation,
                   sxGroupEps). A topic is group-shared when a strict
                   majority of members rated it. Group-max-zero: a
                   topic whose group max is zero contributes zero and
                   STAYS in the denominator (entries below are 0, never
                   null, for non-limited topics) — no fallback, no
                   invented average. No group-native tensor is
                   invented here. */
                const sxGroupEps = sxPlayEpsilon(opts.heat || []);
                const gTd = profiles.map((p2, pi) => data[pi][ix]),
                    gRatedCount = gTd.reduce((s, d) => s + (d && d.rated ? 1 : 0), 0);
                rec.groupSharedMajority = gRatedCount > profiles.length / 2;
                rec.groupFantasyAny = flags.fantasyBy.length > 0;
                if (!rec.groupLimited) {
                    const gTots = gTd.map(d => d ? sxPlayMemberTotal(d) : 0), gTotMax = Math.max(...gTots),
                        gGm = gTotMax > 0 ? sxPlayGeoMean(gTots.map(v => v / gTotMax)) : 0;
                    let gMaxFit = null;
                    pairs.forEach(pr => {
                        const pr2 = pr.topicsById[id];
                        if (!pr2) return;
                        [ pr2.crossFitGive, pr2.crossFitReceive ].forEach(f => { if (null != f && (null == gMaxFit || f > gMaxFit)) gMaxFit = f; });
                    });
                    rec.playKFEntry = null == gMaxFit ? 0 : gMaxFit / 100 * gGm;
                    const gCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            const pr2 = pr.topicsById[id];
                            if (!pr2) return;
                            if (pr.i === pi) { if (null != pr2.crossFitGive && Math.abs(pr2.crossFitGive) > sxGroupEps) giveFit = !0; if (null != pr2.crossFitReceive && Math.abs(pr2.crossFitReceive) > sxGroupEps) recvFit = !0; }
                            else if (pr.j === pi) { if (null != pr2.crossFitReceive && Math.abs(pr2.crossFitReceive) > sxGroupEps) giveFit = !0; if (null != pr2.crossFitGive && Math.abs(pr2.crossFitGive) > sxGroupEps) recvFit = !0; }
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxPlayTableFlags(gTd[pi]) : 0);
                    }), gCMax = Math.max(...gCs);
                    rec.playMSEntry = gCMax > 0 ? sxPlayGeoMean(gCs.map(v => v / gCMax)) : 0;
                    /* Parlay KF / Parlay MS group entries (group-Parlay
                       fix, 2026-10-30): the SAME construction as the
                       Play group entries directly above, with the
                       Straight Match as basis instead of the
                       Krossmatch. Member totals and table sums come
                       from each member's own topic data through
                       Parlay's OWN for-now table (sxParlayTableFlags:
                       Favorite 1 + Tried 1 + Fantasy 1 (full 1),
                       Teased absent); the fit side reuses the pair
                       records' straight register (pr.straight.byId) —
                       give-fit = give x give / 100, receive-fit =
                       receive x receive / 100, each in [-100, 100].
                       Parlay KF fit = the max positive straight fit
                       over all member pairs. A same-flank split is
                       circle minus only, so a negative product never
                       raises the talk and never counts as its ground.
                       Parlay MS binary fit per member = 1 per
                       direction type (give-give / receive-receive) in
                       which any pair involving that member has a
                       positive straight term above epsilon, epsilon
                       from the GROUP heat (sxGroupEps, arithmetic
                       mean of member heats at formation). Group-max-
                       zero topics contribute zero and STAY in the
                       denominator (entries are 0, never null, for
                       non-limited topics). No peer-ground, no banded
                       topics are referred to in these scores. */
                    const pTots = gTd.map(d => d ? sxParlayMemberTotal(d) : 0), pTotMax = Math.max(...pTots),
                        pGm = pTotMax > 0 ? sxPlayGeoMean(pTots.map(v => v / pTotMax)) : 0;
                    let pMaxFit = null;
                    pairs.forEach(pr => {
                        const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                        if (!sr) return;
                        [ sxPositiveFlank(sr.giveGive), sxPositiveFlank(sr.recvRecv) ].forEach(f => { if (null != f && (null == pMaxFit || f > pMaxFit)) pMaxFit = f; });
                    });
                    rec.parlayKFEntry = null == pMaxFit ? 0 : pMaxFit / 100 * pGm;
                    const pCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            if (pr.i !== pi && pr.j !== pi) return;
                            const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                            if (!sr) return;
                            if ((sxPositiveFlank(sr.giveGive) || 0) > sxGroupEps) giveFit = !0;
                            if ((sxPositiveFlank(sr.recvRecv) || 0) > sxGroupEps) recvFit = !0;
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxParlayTableFlags(gTd[pi]) : 0);
                    }), pCMax = Math.max(...pCs);
                    rec.parlayMSEntry = pCMax > 0 ? sxPlayGeoMean(pCs.map(v => v / pCMax)) : 0;
                    // Circle minus for a give/receive topic: the same
                    // Parlay shape, counting only the negative same-flank
                    // products (one person for it, the other against it)
                    // and keeping them as positive magnitudes.
                    let dMaxFit = null;
                    pairs.forEach(pr => {
                        const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                        if (!sr) return;
                        [ sxSplitMagnitude(sr.giveGive), sxSplitMagnitude(sr.recvRecv) ].forEach(f => { if (null != f && (null == dMaxFit || f > dMaxFit)) dMaxFit = f; });
                    });
                    rec.debateKFEntry = null == dMaxFit ? 0 : dMaxFit / 100 * pGm;
                    const dCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            if (pr.i !== pi && pr.j !== pi) return;
                            const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                            if (!sr) return;
                            if ((sxSplitMagnitude(sr.giveGive) || 0) > 0) giveFit = !0;
                            if ((sxSplitMagnitude(sr.recvRecv) || 0) > 0) recvFit = !0;
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxParlayTableFlags(gTd[pi]) : 0);
                    }), dCMax = Math.max(...dCs);
                    rec.debateMSEntry = dCMax > 0 ? sxPlayGeoMean(dCs.map(v => v / dCMax)) : 0;
                    // A pair keeps its own complement. A cast of three or
                    // more is scored as one combo: cross counts only when
                    // every pole has its own person, straight only when
                    // every person leans the same pole. The best pair no
                    // longer stands in for the group.
                    const poleMembers = [];
                    if (profiles.length >= 3) gTd.forEach((d, pi) => {
                        if (d && d.polesKnown) poleMembers.push({ poles: d.poles, intensity: d.intensity, heat: (opts.heat || [])[pi] || 0 });
                    });
                    if (poleMembers.length >= 3) {
                        const gRole = sxGroupRoleScore(poleMembers, meta);
                        const playWeight = gRole.aversion || gRole.opposed ? 0 : gRole.factor;
                        const talkWeight = gRole.opposed ? 0 : gRole.factor;
                        rec.roleStraight = gRole.straight;
                        rec.roleCross = gRole.cross;
                        rec.roleEnemy = gRole.enemy;
                        rec.sharedAversion = gRole.aversion;
                        rec.playKFEntry = gRole.cross * playWeight;
                        rec.playMSEntry = gRole.cross * playWeight;
                        rec.parlayKFEntry = gRole.straight * talkWeight;
                        rec.parlayMSEntry = gRole.straight * talkWeight;
                        rec.debateKFEntry = gRole.enemy * gRole.debate;
                        rec.debateMSEntry = gRole.enemy;
                        const strong = poleMembers.every(m => m.intensity > sxClamp(35 - m.heat, 0, 85));
                        if (gRole.aversion || gRole.opposed || !(playWeight > 0) || !(gRole.cross > 0)) rec.playOutcome = "mismatched";
                        else {
                            rec.playOutcome = strong && gRole.cross >= .5 ? "match" : "curious-fit";
                            rec.strength = Math.round(gRole.cross * playWeight * 100);
                        }
                    }
                    /* Line topics in a cast: no flanks and no poles,
                       so every construction above leaves their entries
                       at zero. Score the cast as one combo on the line
                       itself, in the pair entries' own shapes:
                       agreement from the holders' span (the pair
                       formula's n-holder form, 1 - span / 200),
                       relevance capped by the least-caring holder (a
                       stored intensity where one is carried, else the
                       stance's own size), feud from the strongest
                       holders on opposite sides of zero. Shared
                       aversion zeroes Play, opposed relevance zeroes
                       Parlay, exactly as for poles. */
                    const lineMembers = [];
                    gTd.forEach((d, pi) => {
                        if (d && d.lineKnown) lineMembers.push(d);
                    });
                    if (lineMembers.length >= 2) {
                        const lVals = lineMembers.map(d => d.line),
                            lSpan = Math.max(...lVals) - Math.min(...lVals),
                            lAgree = Math.max(0, 1 - lSpan / 200),
                            lCares = lineMembers.map(d => null != d.intensity ? d.intensity : Math.abs(d.line)),
                            lFactor = Math.min(...lCares.map(v => Math.abs(v))) / 100,
                            lAllStored = lineMembers.every(d => d.intensityKnown),
                            lAllNeg = lineMembers.every(d => d.intensityKnown && d.intensity < 0),
                            lOpposed = lineMembers.some(d => d.intensityKnown && d.intensity < 0) && lineMembers.some(d => d.intensityKnown && d.intensity > 0),
                            lPosMax = Math.max(0, ...lVals), lNegMag = Math.max(0, ...lVals.map(v => -v)),
                            lFeud = lPosMax * lNegMag / 10000,
                            lDebate = sxDebateFactor(lCares);
                        rec.lineAgreement = lAgree;
                        rec.lineFeud = lFeud;
                        rec.playKFEntry = lAgree * (lAllNeg ? 0 : lFactor);
                        rec.playMSEntry = lAgree * (lAllStored ? (lAllNeg ? 0 : lFactor) : 1);
                        rec.parlayKFEntry = lAgree * (lOpposed ? 0 : lFactor);
                        rec.parlayMSEntry = lAgree * (lOpposed ? 0 : lFactor);
                        rec.debateKFEntry = lFeud * lDebate;
                        rec.debateMSEntry = lFeud;
                    }
                }
            });
            /* Teaser bump, group level (Jason 2026-10-25). Standalone group
               rule, after majority assignment, before list construction.
               Group play: playOutcome "curious-fit" topics (fantasy
               excluded) promote to "match", strongest first, ties label
               A–Z, first ceil(|C| * h / 100) with h = lowest-set member's
               heat, at least one when h > 0. Group conversation:
               majority-curious topics (strict majority of members hold a
               curious stance on some flank; unrated never counts) that are
               not already counted promote to counted (conversationCounts
               = true), same curve and heat; fantasy IS allowed on the
               group conversation path, as it now is on the pair
               conversation bump too (ruled 2026-10-29, unified in the
               including direction; the earlier 00:36 group-only carve-out
               is superseded). Group PLAY above still excludes fantasy.
               The MOVE is feed-level and
               untouched; engine promotion here is disjoint from it by
               construction. Dd group glance reads grp.play, so group play
               flips flow there automatically; group-conversation promotions
               do NOT flow into Dd group glance (pre-existing gap, unchanged). */
            const bumpHeatArr = opts.heat || [],
                bumpLowest = sxLowestSet(pairs, profiles).lowest,
                bumpH = bumpLowest.length ? Math.min(...bumpLowest.map(m => bumpHeatArr[m] ?? 0)) : 0;
            if (bumpH > 0) {
                takeTop(topics.filter(r => !r.groupLimited && "curious-fit" === r.playOutcome && 0 === r.flags.fantasyBy.length).sort(byStrength), bumpH).forEach(r => { r.playOutcome = "match"; });
                takeTop(topics.filter(r => {
                    if (r.groupLimited || r.conversationCounts || r.relevantConvPairs <= 0) return !1;
                    const ix = ids.indexOf(r.id);
                    if (ix < 0) return !1;
                    let curious = 0;
                    profiles.forEach((p, pi) => {
                        const d = data[pi][ix];
                        if (!d) return;
                        const s = sxSides(d, bumpHeatArr[pi] ?? 0);
                        if ("curious" === s.give || "curious" === s.receive) curious++;
                    });
                    return curious > profiles.length / 2;
                }).sort(byStrength), bumpH).forEach(r => { r.conversationCounts = !0; });
            }
            const msAggG = sxPlayWeightedPct(topics, r => r.playMSEntry, r => !r.groupLimited && r.groupSharedMajority && !r.groupFantasyAny),
                kfAggG = sxPlayWeightedPct(topics, r => r.playKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                /* Parlay group aggregates (group-Parlay fix,
                   2026-10-30): hierarchy-share x kinkiness weighted,
                   via the same sxPlayWeightedPct as the Play group
                   aggregates. Considered set for BOTH numbers =
                   non-limit-blocked topics a strict majority of
                   members rated (groupSharedMajority) — fantasy is
                   INCLUDED in Parlay considered (unlike Play MS,
                   where fantasy is out), and limit-blocked topics
                   stay OUT of considered entirely. */
                msParlayAggG = sxPlayWeightedPct(topics, r => r.parlayMSEntry, r => !r.groupLimited && r.groupSharedMajority),
                kfParlayAggG = sxPlayWeightedPct(topics, r => r.parlayKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                gPlayTopics = topics.filter(r => !r.groupLimited && r.relevantPlayPairs > 0),
                gMatches = gPlayTopics.filter(r => "match" === r.playOutcome),
                play = {
                    considered: gPlayTopics.length, matches: gMatches.length,
                    headline: msAggG.pct,
                    label: sxTerm("playMS"),
                    lists: {
                        matches: gMatches.sort(byStrength),
                        curiousAbout: gPlayTopics.filter(r => "curious-fit" === r.playOutcome).sort(byStrength),
                        mismatched: gPlayTopics.filter(r => "mismatched" === r.playOutcome).sort(byLabel),
                        limits: topics.filter(r => r.groupLimited).sort(byLabel)
                    }
                };
            play.headlineText = sxHeadlineText(play.headline, msAggG.counted, msAggG.considered);
            const gConvTopics = topics.filter(r => !r.groupLimited && r.relevantConvPairs > 0),
                gCounted = gConvTopics.filter(r => r.conversationCounts),
                conversation = {
                    considered: gConvTopics.length, counted: gCounted.length,
                    kinkFactor: kfAggG.pct,
                    label: sxTerm("playKF"),
                    lists: {
                        counted: gCounted.sort(byLabel),
                        limits: topics.filter(r => r.groupLimited).sort(byLabel)
                    }
                };
            conversation.headlineText = sxHeadlineText(conversation.kinkFactor, kfAggG.counted, kfAggG.considered);
            const parlay = {
                considered: msParlayAggG.considered, counted: msParlayAggG.counted,
                headline: msParlayAggG.pct, kinkFactor: kfParlayAggG.pct,
                label: sxTerm("parlayMS"), kfLabel: sxTerm("parlayKF"),
                lists: {
                    limits: topics.filter(r => r.groupLimited).sort(byLabel)
                }
            };
            parlay.headlineText = sxHeadlineText(parlay.headline, msParlayAggG.counted, msParlayAggG.considered);
            parlay.kfHeadlineText = sxHeadlineText(parlay.kinkFactor, kfParlayAggG.counted, kfParlayAggG.considered);
            const msDebateAggG = sxPlayWeightedPct(topics, r => r.debateMSEntry, r => !r.groupLimited && r.groupSharedMajority),
                kfDebateAggG = sxPlayWeightedPct(topics, r => r.debateKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                debate = {
                    considered: msDebateAggG.considered, counted: msDebateAggG.counted,
                    headline: msDebateAggG.pct, kinkFactor: kfDebateAggG.pct,
                    label: sxTerm("debateMS"), kfLabel: sxTerm("debateKF")
                };
            debate.headlineText = sxHeadlineText(debate.headline, msDebateAggG.counted, msDebateAggG.considered);
            debate.kfHeadlineText = sxHeadlineText(debate.kinkFactor, kfDebateAggG.counted, kfDebateAggG.considered);
            const hot = topics.filter(r => !r.groupLimited).map(r => ({
                id: r.id, label: r.label,
                score: pairs.reduce((sum, pr) => sum + (pr.topicsById[r.id] ? pr.topicsById[r.id].hotContribution : 0), 0)
            })).filter(r => r.score > 0).sort((x, y) => y.score - x.score || x.label.localeCompare(y.label));
            return {
                engine: "sync-1.1", pairs: pairs, topics: topics, topicsById: topicsById,
                play: play, conversation: conversation, parlay: parlay, debate: debate, hotTopics: hot, hotTopicsTop10: hot.slice(0, 10)
            };
        }
        /* ===== Two-ring scores (O5 + O6, ruled 2026-10-29) =====
           Personal Kink Factor and Charted are computed per TOPIC over ALL
           403 topics. (The pair/group Play KF and Play MS
           in the sync engine above are kinkiness-weighted too — same
           weight, over their shared considered topics, via
           sxKinkWeightedPct — as are the interim Straight / Parlay
           values below.) Effective topic weight = hierarchical share x
           kinkiness (kinkiness = 1 - O6 aggregated popularity); the
           denominator is the total weighted topic weight over all 403
           topics and never shrinks (limit-excluded topics stay in it).
           Personal: per topic, the MAX flank rating contribution (signed,
           value/100 per known flank; negatives count and subtract) plus the
           topic flag sum counted ONCE per topic (favorite 1, tried 1,
           fantasy 0.5; curious and teased are NOT in the table). Unrated
           but marked topics have base 0 and their flags still count.
           A topic carrying a limit counts NOTHING in either ring (limit
           wins over every other mark). Not Interested alone adds nothing
           to Personal. Percent is NOT clamped at 100.
           Charted: a topic is attended when rated on either flank OR
           flagged OR marked Not Interested alone (binary 1); its amount is
           (rated ? 1 : 0) + flag sum, with Not Interested alone counting
           the binary 1. No clamp. Group Charted (B4): a topic counts when
           a majority of members attend it under the same individual rules,
           members equal, weighted share over all 403 topics, no clamp.
           EPSILON AMENDMENT (six-scores provisional build, 2026-10-30;
           recommendation 4): the rating tests above are epsilon-
           thresholded — a flank counts BY RATING only if |rating| >
           epsilon, epsilon = e_0 * e^(-heat/100), e_0 = 1, from the
           person's OWN heat (Charted is personal-only; group Charted
           judges each member's attendance by that member's own heat,
           then takes the majority — group heat is NOT applied to
           Charted). High heat = smaller epsilon = more topics count;
           low heat = larger epsilon = fewer. This applies to
           Charted's rated term AND to Personal KF's flank term (the
           max is taken over epsilon-passing flanks only). Flag sums
           are unchanged and are NOT epsilon-thresholded. */
        let sxShareCache = null;
        function sxTopicShares() {
            if (sxShareCache) return sxShareCache;
            const ids = Uc(), metas = ids.map(id => sxMeta(id, null)), byBranch = new Map;
            ids.forEach((id, ix) => { const m = metas[ix]; if (!m) return; if (!byBranch.has(m.branch)) byBranch.set(m.branch, []); byBranch.get(m.branch).push([ id, m ]); });
            const shares = {}, nBranch = Math.max(1, byBranch.size);
            byBranch.forEach(list => {
                const peers = new Map;
                list.forEach(([ id, m ]) => { const k = m.parentId || id; if (!peers.has(k)) peers.set(k, []); peers.get(k).push(id); });
                const peerShare = (1 / nBranch) / Math.max(1, peers.size);
                peers.forEach(members => { const s = peerShare / Math.max(1, members.length); members.forEach(id => { shares[id] = s; }); });
            });
            return sxShareCache = shares;
        }
        function sxTopicWeight(id, meta) {
            const sh = sxTopicShares()[id] || 0;
            let kink = null;
            try { kink = window.__sxO6 ? window.__sxO6.kinkinessById(id) : null; } catch (err) { __sxErrLog("sx-o6-kinkiness", err); }
            return sh * (null == kink ? 1 : kink);
        }
        function sxFlagSum(td) {
            return (td.favorite ? 1 : 0) + (td.triedScope ? 1 : 0) + (td.fantasyScope ? .5 : 0);
        }
        function sxTopicTerms(td, eps) {
            if (td.limitScope) return null;
            /* Epsilon rating threshold (provisional amendment): eps
               defaults to the heat-0 value (e_0 = 1) when a caller
               passes none. A flank counts by rating only if its
               absolute rating exceeds eps; the epsilon-rated flag
               below replaces the plain rated flag in BOTH terms. */
            const e = Number.isFinite(eps) ? eps : SX_EPSILON_E0, flanks = [];
            if (td.single) { if (td.rated && null != td.singleValue && Math.abs(td.singleValue) > e) flanks.push(td.singleValue / 100); }
            else if (td.polesKnown || td.lineKnown) {
                // Multi-pole comparison (ruled 2026-11-16): Personal KF
                // is the largest absolute pole affinity, signed, ÷100;
                // the epsilon threshold applies to the largest absolute
                // pole affinity. (A line topic's strongest stance is
                // its scalar.)
                if (null != td.strongest && Math.abs(td.strongest) > e) flanks.push(td.strongest / 100);
            }
            else {
                if (td.raw.giveKnown && Math.abs(td.raw.give) > e) flanks.push(td.raw.give / 100);
                if (td.raw.receiveKnown && Math.abs(td.raw.receive) > e) flanks.push(td.raw.receive / 100);
                if (td.raw.advocacyKnown && td.raw.advocacyIntensityKnown && Math.abs(td.raw.advocacyIntensity) > e) flanks.push(td.raw.advocacyIntensity / 100);
                if (td.raw.receptivityKnown && td.raw.receptivityIntensityKnown && Math.abs(td.raw.receptivityIntensity) > e) flanks.push(td.raw.receptivityIntensity / 100);
            }
            const ratedE = flanks.length > 0,
                base = ratedE ? Math.max(...flanks) : 0, flags = sxFlagSum(td);
            const attended = ratedE || flags > 0 || td.notInterested;
            return {
                personal: base + flags,
                charted: attended ? (ratedE ? 1 : 0) + flags + (!ratedE && !flags && td.notInterested ? 1 : 0) : 0,
                attended: attended
            };
        }
        function sxPersonalCharted(profile) {
            if (!profile) return { personal: null, charted: null };
            const ids = Uc(); let num = 0, ch = 0, den = 0;
            /* Epsilon from this person's OWN heat (personal-only). */
            const eps = sxPlayEpsilon([ profile.id ? sxHeatFor(profile.id) : 0 ]);
            ids.forEach(id => {
                const meta = sxMeta(id, [ profile ]); if (!meta) return;
                const w = sxTopicWeight(id, meta); den += w;
                const terms = sxTopicTerms(sxTopicData(profile, id, meta), eps);
                if (!terms) return;
                num += w * terms.personal, ch += w * terms.charted;
            });
            return den > 0 ? { personal: 100 * num / den, charted: 100 * ch / den } : { personal: null, charted: null };
        }
        function sxGroupCharted(profiles) {
            if (!profiles || !profiles.length) return null;
            const ids = Uc(); let ch = 0, den = 0;
            ids.forEach(id => {
                const meta = sxMeta(id, profiles); if (!meta) return;
                const w = sxTopicWeight(id, meta); den += w;
                let attended = 0;
                /* Each member's attendance is judged by their OWN
                   heat (own epsilon), then strict majority. */
                profiles.forEach(p => { const terms = sxTopicTerms(sxTopicData(p, id, meta), sxPlayEpsilon([ p.id ? sxHeatFor(p.id) : 0 ])); if (terms && terms.attended) attended++; });
                if (attended > profiles.length / 2) ch += w;
            });
            return den > 0 ? 100 * ch / den : null;
        }
        /* Circledot (straight) ring values: Parlay MS (outer) and
           Parlay KF (inner) — Parlay mirrors Play on the straight
           match (give x give, receive x receive, normed /100).
           PROVISIONAL (six-scores build, 2026-10-30): built with the
           provisional rulings for consideration; the Saturday final
           adoption is still unanswered and the final inclusion
           tables are DEFERRED — both named as left in the build
           verdict. Kinkiness weighting: hierarchy share x kinkiness,
           once, numerator and denominator alike, via
           sxPlayWeightedPct. This function serves a PAIR only;
           group Parlay (casts of more than 2) is computed in
           sxGroupCompute by the same construction and served to
           the same header surface by sxRingValuesForCast (bands /
           seats / lists stay pair-only, unchanged). */
        // A positive same-flank product is talk. A negative one is
        // the argument. Both the pair rings and the group entries
        // read these, so a ruling about which product counts is
        // edited once.
        function sxPositiveFlank(product) {
            return null != product && product > 0 ? product / 100 : null;
        }
        function sxSplitMagnitude(product) {
            return null != product && product < 0 ? -product / 100 : null;
        }
        // The strongest argument on one shared straight-register
        // record, as a fraction 0-1 (ruled 2026-11-21: circle minus
        // is a measure, defined per pole as well as per flank, on
        // vanilla maps as well as Sexcapades). A stored enemy
        // overlap, a negative same-flank product, a line scalar
        // product across zero, and a same-pole sign split on a pole
        // vector all count; the topic's feud is the strongest of
        // them. No floor and no epsilon: the product grades itself,
        // so a −5 against a +5 is a feud of 0.0025 - formally a
        // debate topic, priced as nearly nothing. Declared once;
        // the pair rings, the minus adapter, and the minus tab's
        // buckets all read this.
        function sxDebateFeud(s) {
            let feud = 0;
            if (null != s.roleEnemy) feud = Math.max(feud, s.roleEnemy);
            [ sxSplitMagnitude(s.giveGive), sxSplitMagnitude(s.recvRecv) ].forEach(f => { if (null != f) feud = Math.max(feud, f / 100); });
            if (null != s.lineA && null != s.lineB) {
                const f = sxSplitMagnitude(s.lineA * s.lineB);
                if (null != f) feud = Math.max(feud, f / 100);
            }
            if (s.polesA && s.polesB) {
                const keys = [ ...new Set([ ...Object.keys(s.polesA), ...Object.keys(s.polesB) ]) ];
                keys.forEach(k => {
                    const va = k in s.polesA ? Number(s.polesA[k]) || 0 : 0, vb = k in s.polesB ? Number(s.polesB[k]) || 0 : 0,
                        f = sxSplitMagnitude(va * vb);
                    if (null != f) feud = Math.max(feud, f / 100);
                });
            }
            // Circle Minus unreceptivity feud signal (Spec Part 1.4):
            // Amplifies feud when both parties advocate and neither receives.
            if (s.advocacyA && s.advocacyB) {
                const advIntA = (s.advocacyA.intensity != null) ? s.advocacyA.intensity : (s.intensityA || 0);
                const advIntB = (s.advocacyB.intensity != null) ? s.advocacyB.intensity : (s.intensityB || 0);
                const recIntA = s.receptivityA && s.receptivityA.intensity != null ? s.receptivityA.intensity : null;
                const recIntB = s.receptivityB && s.receptivityB.intensity != null ? s.receptivityB.intensity : null;
                if (advIntA > 25 && advIntB > 25 && (recIntA == null || recIntA <= 0 || recIntB == null || recIntB <= 0)) {
                    const negBonus = (recIntA != null && recIntA < 0 ? 0.25 : 0.1) + (recIntB != null && recIntB < 0 ? 0.25 : 0.1);
                    const unrec = Math.min(1, (feud > 0 ? feud : 0.2) * (1 + negBonus));
                    s.unreceptivityFeud = unrec;
                    feud = Math.max(feud, unrec);
                }
            }
            return feud;
        }
        function sxStraightInterim(pair) {
            if (!pair || !pair.straight) return { outer: null, inner: null };
            /* Parlay KF / Parlay MS (six-scores provisional build,
               2026-10-30): the Play formulas with the STRAIGHT match
               as basis instead of the Krossmatch, on Parlay's OWN
               for-now table (sxParlayTableFlags: Favorite 1, Tried 1, Fantasy 1
               FULL). GROUND x FIT, as for Play: marks and
               fit existence determine the ground; the signed fit
               multiplies over it. Straight fits, normed by 100:
               give-fit = my give x your give / 100, receive-fit = my
               receive x your receive / 100 (the straight register
               stores the raw products), each in [-100, 100].
               Parlay KF entry = max straight fit (as a fraction) x
               geometric mean over members of (rated-or-not + Parlay
               table sum), group-max normalized. Parlay MS entry =
               geometric mean over members of (binary straight fit +
               Parlay table flag sum), group-max normalized, binary
               fit per direction = 1 iff |term| > epsilon (epsilon
               from the group heat = mean of the two members' heats
               at formation, pair.heat). CONSIDERED SET
               (recommendation 3 ACCEPTED): shared, non-limit-blocked
               topics for BOTH numbers — the straight register's
               "shared" status already excludes limit-blocked topics,
               which stay OUT even though they could be conversational
               fodder, because they are not conversations to
               encourage. Fantasy is INCLUDED in Parlay considered
               (unlike Play, where fantasy is out of considered).
               A same-flank split (one person for it, the other
               against it) belongs to circle minus only (Jason
               2026-11-19). The talk counts a positive product: a
               shared yes, or a shared no, since two noes multiply
               to an agreement. A topic that is only a split scores
               0 and stays in the denominator. No band counting is
               used in either number. This function is the pair
               path; group casts use the group construction in
               sxGroupCompute, on this same table and basis. */
            const sxParlayEps = sxPlayEpsilon(pair.heat ? [ pair.heat.a, pair.heat.b ] : []),
                recs = pair.straight.topics.map(s => {
                    if ("shared" !== s.status) return { id: s.id, entryKF: null, entryMS: null, consideredKF: !1, consideredMS: !1 };
                    // Multi-pole comparison (ruled 2026-11-16): Parlay
                    // includes the ratings too - the agreement feeds
                    // Parlay (Converse) as well as Play (Commune).
                    // The Parlay entries use the agreement exactly as
                    // the Play entries do (MS = the agreement fraction,
                    // KF = agreement × intensity). The samples carry no
                    // flags, so the Parlay flag table does not change
                    // these entries.
                    if (null != s.agreement) return {
                        id: s.id,
                        entryKF: s.agreement * (null != s.poleIntensity ? s.poleIntensity : 0),
                        // The overlap is drawn only when the interest
                        // counts. A zero or a sign split leaves this at
                        // 0. A shared no still counts: its factor is the
                        // smaller absolute intensity.
                        entryMS: s.poleIntensity > 0 ? s.agreement : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                    const rec = pair.topicsById ? pair.topicsById[s.id] : null, fl = rec ? rec.flags || {} : {},
                        ra = rec ? rec.ratings.a : null, rb = rec ? rec.ratings.b : null,
                        mkTd = (r, name) => ({
                            rated: !!(r && (r.giveKnown || r.receiveKnown)),
                            favorite: (fl.favoriteBy || []).includes(name),
                            triedScope: (fl.triedBy || []).includes(name) ? "topic" : null,
                            fantasyScope: (fl.fantasyBy || []).includes(name) ? "topic" : null
                        }),
                        tdA = mkTd(ra, pair.a), tdB = mkTd(rb, pair.b),
                        fitG = sxPositiveFlank(s.giveGive),
                        fitR = sxPositiveFlank(s.recvRecv),
                        sFits = [ fitG, fitR ].filter(v => null != v),
                        maxFit = sFits.length ? Math.max(...sFits) : null,
                        splitOnly = !sFits.length && (s.giveGive < 0 || s.recvRecv < 0),
                        totA = sxParlayMemberTotal(tdA), totB = sxParlayMemberTotal(tdB), totMax = Math.max(totA, totB),
                        gm = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                        binFit = (null != fitG && fitG > sxParlayEps ? 1 : 0) + (null != fitR && fitR > sxParlayEps ? 1 : 0),
                        cA = binFit + sxParlayTableFlags(tdA), cB = binFit + sxParlayTableFlags(tdB), cMax = Math.max(cA, cB);
                    return {
                        id: s.id,
                        entryKF: null == maxFit ? splitOnly ? 0 : null : maxFit / 100 * gm,
                        entryMS: cMax > 0 ? sxPlayGeoMean([ cA / cMax, cB / cMax ]) : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                }),
                msAggS = sxPlayWeightedPct(recs, r => r.entryMS, r => r.consideredMS),
                kfAggS = sxPlayWeightedPct(recs, r => r.entryKF, r => r.consideredKF);
            return { outer: msAggS.pct, inner: kfAggS.pct };
        }
        // Circle-minus rings, the same shape as circle dot. A stored
        // enemy pair fills from how much the two people sit on those
        // far poles. A give/receive topic fills from the negative
        // same-flank products, kept as positive magnitudes so the arc
        // can draw them. Shared topics with no argument stay in the
        // denominator, so an all-agreement pair scores low.
        function sxDebateInterim(pair) {
            if (!pair || !pair.straight) return { outer: null, inner: null, counted: 0, considered: 0 };
            const recs = pair.straight.topics.map(s => {
                    if ("shared" !== s.status) return { id: s.id, entryKF: null, entryMS: null, consideredKF: !1, consideredMS: !1 };
                    // Pole and line topics (ruled 2026-11-21): the
                    // feud is the strongest per-pole split
                    // (sxDebateFeud), the Kink Factor entry prices it
                    // by the debate factor, and the Match Score entry
                    // is the feud itself - any topic carrying a split
                    // counts, at its own strength.
                    if (null != s.agreement || null != s.roleEnemy) {
                        const feud = sxDebateFeud(s);
                        return {
                            id: s.id,
                            entryKF: feud * (null != s.debateIntensity ? s.debateIntensity : 0),
                            entryMS: feud,
                            consideredKF: !0,
                            consideredMS: !0
                        };
                    }
                    const rec = pair.topicsById ? pair.topicsById[s.id] : null, fl = rec ? rec.flags || {} : {},
                        ra = rec ? rec.ratings.a : null, rb = rec ? rec.ratings.b : null,
                        mkTd = (r, name) => ({
                            rated: !!(r && (r.giveKnown || r.receiveKnown)),
                            favorite: (fl.favoriteBy || []).includes(name),
                            triedScope: (fl.triedBy || []).includes(name) ? "topic" : null,
                            fantasyScope: (fl.fantasyBy || []).includes(name) ? "topic" : null
                        }),
                        tdA = mkTd(ra, pair.a), tdB = mkTd(rb, pair.b),
                        fitG = sxSplitMagnitude(s.giveGive),
                        fitR = sxSplitMagnitude(s.recvRecv),
                        fits = [ fitG, fitR ].filter(v => null != v),
                        maxFit = fits.length ? Math.max(...fits) : null,
                        totA = sxParlayMemberTotal(tdA), totB = sxParlayMemberTotal(tdB), totMax = Math.max(totA, totB),
                        gm = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                        binFit = (null != fitG && fitG > 0 ? 1 : 0) + (null != fitR && fitR > 0 ? 1 : 0),
                        cA = binFit + sxParlayTableFlags(tdA), cB = binFit + sxParlayTableFlags(tdB), cMax = Math.max(cA, cB);
                    return {
                        id: s.id,
                        entryKF: null == maxFit ? 0 : maxFit / 100 * gm,
                        entryMS: cMax > 0 ? sxPlayGeoMean([ cA / cMax, cB / cMax ]) : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                }),
                msAgg = sxPlayWeightedPct(recs, r => r.entryMS, r => r.consideredMS),
                kfAgg = sxPlayWeightedPct(recs, r => r.entryKF, r => r.consideredKF);
            return { outer: msAgg.pct, inner: kfAgg.pct, counted: msAgg.counted, considered: msAgg.considered };
        }
        /* Domain-terms skinning (first i18n step, 2026-11-15): the active
           skin's words, resolved by the skin loader into
           window.__SX_TERMS (the loader owns the table; see
           skin-loader.js). Sexcapades keeps its own words; other skins
           get the vanilla equivalents. Falls back to the Sexcapades
           form when the loader hasn't run yet — never blank, and never
           wrong for the default skin. Shared by this module and
           05-compatibility.js (the bundle concatenates the modules
           into one scope, so this declaration is visible there). */
        function sxTerm(key) {
            var T = (typeof window !== "undefined" && window.__SX_TERMS) || null;
            var v = T && T[key];
            if (typeof v === "string" && v) return v;
            var fallback = { krossmatch: "Krossmatch", kinkFactor: "Kink Factor", playMode: "Play", parlayMode: "Parlay", conversationMode: "Conversation", playMS: "Play MS", playKF: "Play KF", parlayMS: "Parlay MS", parlayKF: "Parlay KF", debateMS: "Debate MS", debateKF: "Debate Kink Factor", getRatings: "Hot list · KinkTest · BDSMtest · Yes / No / Maybe · FetLife" };
            return fallback[key] || key;
        }
        /* Score-ring values for a tab/profile context. kind: "profile"
           (outer Charted, inner Personal KF), "bowtie" (outer Play MS,
           inner Play KF, off the pair/group engine aggregates),
           "circledot" (Parlay MS / Parlay KF pair, provisional). */
        function sxRingValuesForProfile(profile) {
            const pc = sxPersonalCharted(profile);
            return { outerLabel: "Charted", outer: pc.charted, innerLabel: "Personal " + sxTerm("kinkFactor"), inner: pc.personal };
        }
        function sxRingValuesForCast(profiles, pairOp) {
            if (!profiles || profiles.length < 2) return null;
            const grp = sxGroupCompute(profiles, {}), isPair = 2 === profiles.length, pair = isPair ? grp.pairs[0] : null;
            /* No Charted pass here (Rank 10, 2026-10-30): this function
               used to compute sxGroupCharted(profiles) into a `charted`
               field on every return, but its only frequent caller (the
               header paint) reads outer/inner only and threw that pass
               away on every render. The one consumer of group Charted,
               the dialog readback, calls sxGroupCharted directly, so
               the pass runs exactly once, only when the dialog opens. */
            if ("minus" === pairOp) {
                if (!isPair) {
                    const deb = grp.debate;
                    return { outerLabel: sxTerm("debateMS"), outer: deb ? deb.headline : null, innerLabel: sxTerm("debateKF"), inner: deb ? deb.kinkFactor : null };
                }
                const di = sxDebateInterim(pair);
                return { outerLabel: sxTerm("debateMS"), outer: di.outer, innerLabel: sxTerm("debateKF"), inner: di.inner };
            }
            if ("straight" === pairOp) {
                if (!isPair) {
                    /* Group Parlay (group-Parlay fix, 2026-10-30):
                       casts of more than 2 read the group engine's
                       Parlay aggregates (grp.parlay, computed in
                       sxGroupCompute by the same construction as the
                       group Play aggregates) — the SAME header surface
                       pair Parlay and group Play already use; no new
                       surface is invented. */
                    const par = grp.parlay;
                    return { outerLabel: sxTerm("parlayMS"), outer: par ? par.headline : null, innerLabel: sxTerm("parlayKF"), inner: par ? par.kinkFactor : null };
                }
                const si = sxStraightInterim(pair);
                return { outerLabel: sxTerm("parlayMS"), outer: si.outer, innerLabel: sxTerm("parlayKF"), inner: si.inner };
            }
            const play = isPair ? pair.play : grp.play, conv = isPair ? pair.conversation : grp.conversation;
            return { outerLabel: sxTerm("playMS"), outer: play ? play.headline : null, innerLabel: sxTerm("playKF"), inner: conv ? conv.kinkFactor : null };
        }
        /* Score rings (two-ring build): the header Avatar rings are the
           only score-ring paint — outer + inner rings in the same
           108-unit geometry as the header seat (bands 16 units thick,
           tiling outward from the centre), painted by the header block
           in Mr from the ring value providers below. Arc length is
           clamped to the circle for display only; the printed number
           is always the true engine value, including values above 100
           or below 0. Bucket rings (sxRingsHtml) are a different
           mechanism and stay distinct: these rings show engine scores
           only. No below-strip or tab-strip score-ring surface
           remains (ruled 2026-10-30). */
        function sxPctText(v) { return null == v || !Number.isFinite(v) ? "—" : `${Math.round(v)}%`; }
        /* Tab-strip rings removed (ruled 2026-10-29) and match-stage
           score-ring hosts removed (ruled 2026-10-30): no rings render
           in the profile tab strip or below it for individual, group,
           or match tabs — ring numbers live only in the header Avatar
           rings. The ring value providers stay for the header paint. */
            window.__sxRings = { personalCharted: sxPersonalCharted, groupCharted: sxGroupCharted, straightInterim: sxStraightInterim, debateInterim: sxDebateInterim, ringValuesForProfile: sxRingValuesForProfile, ringValuesForCast: sxRingValuesForCast, topicShares: sxTopicShares };
        function sxProfileById(id) {
            return {
                id: id, name: wt[id] || "Profile",
                ratings: vt[id] || {}, annotations: Qe[id] || {}, fantasyOnly: Je[id] || {},
                alreadyTried: et[id] || {}, importedChildren: at[id] || {},
                genders: bb(rt[id]), orientations: iv(ot[id])
            };
        }
        var sxPairCache = new Map();
        function sxInvalidatePairs() {
            if (sxPairCache && typeof sxPairCache.clear === "function") {
                sxPairCache.clear();
            }
        }
        function sxPairByIds(idA, idB, sxSettings) {
            if (!vt[idA] || !vt[idB] || idA === idB) return null;
            const [ x, y ] = [ idA, idB ].sort();
            if (sxSettings) return sxPairCompute(sxProfileById(x), sxProfileById(y), {
                heatA: sxSettings[x] ? sxSettings[x].heat : 0, heatB: sxSettings[y] ? sxSettings[y].heat : 0,
                veilA: sxSettings[x] ? sxSettings[x].veil : 50, veilB: sxSettings[y] ? sxSettings[y].veil : 50
            });
            const key = x + "|" + y;
            if (!sxPairCache.has(key)) sxPairCache.set(key, sxPairCompute(sxProfileById(x), sxProfileById(y), {}));
            return sxPairCache.get(key);
        }
        function sxRouteRecord(fit, id) {
            const labels = Ge(id);
            return {
                key: "AtoB" === fit.direction ? "firstGive" : "secondGive",
                score: fit.strength, giver: fit.giver, receiver: fit.receiver,
                giverRating: Math.round(fit.giverRating), receiverRating: Math.round(fit.receiverRating),
                giverLabel: labels.labels[0], receiverLabel: labels.labels[1] || labels.labels[0],
                roleLocked: !1
            };
        }
        function sxComputeProfileFingerprint(id) {
            if (!id || !vt[id]) return "";
            const r = vt[id] || {}, q = Qe[id] || {}, j = Je[id] || {}, e = et[id] || {};
            return Object.keys(r).length + ":" + JSON.stringify(r) + "|" + JSON.stringify(q) + "|" + JSON.stringify(j) + "|" + JSON.stringify(e);
        }
        function sxSourcesFingerprint(sourceIds) {
            return (sourceIds || []).map(id => id + "=" + sxComputeProfileFingerprint(id)).join(";");
        }
        function sxIsPseudoProfile(id) {
            if (!id || typeof ft === "undefined") return !1;
            const meta = ft[id];
            return Boolean(meta && (meta.isPseudoProfile || meta.pairOp));
        }
        function sxEnsurePseudoProfileCurrent(id) {
            if (!id || typeof ft === "undefined") return;
            const meta = ft[id];
            if (!meta || !meta.isPseudoProfile || !Array.isArray(meta.sourceIds) || meta.sourceIds.length < 2) return;
            const currentFp = sxSourcesFingerprint(meta.sourceIds);
            if (meta.fingerprint !== currentFp) {
                if (typeof Rd === "function") Rd(id);
            }
        }
        window.__SEXCAPADES_SYNC_ENGINE = {
            version: "1.1",
            pair: sxPairCompute,
            group: sxGroupCompute,
            pairByIds: sxPairByIds,
            livePair: sxLivePair,
            profileById: sxProfileById,
            computeProfileFingerprint: sxComputeProfileFingerprint,
            sourcesFingerprint: sxSourcesFingerprint,
            isPseudoProfile: sxIsPseudoProfile,
            ensurePseudoProfileCurrent: sxEnsurePseudoProfileCurrent
        };
