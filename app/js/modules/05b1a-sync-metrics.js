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
