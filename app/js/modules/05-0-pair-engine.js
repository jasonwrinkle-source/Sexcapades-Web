        function _d(e, t = !1) {
            return e ? `${e.giver}: ${e.giverLabel || "give"}${t ? ` ${e.giverRating}` : ""} → ${e.receiver}: ${e.receiverLabel || "receive"}${t ? ` ${e.receiverRating}` : ""}` : "";
        }
        function Dd(e, t, heat, veil) {
            // Adapter over the sync engine v1.1: the second argument (the
            // retired leniency value) is accepted for call-site compatibility
            // and ignored - no score, bar, or tolerance reads it anymore.
            // Two profiles read the pair Play aggregation; three or more
            // read the group Play aggregation (strict-majority rules).
            const v = Array.isArray(veil) && veil.length ? veil : (e || []).map(p => p && null != p.veil ? av(p.veil) : 50);
            const grp = sxGroupCompute(e, { heat: heat || [], veil: v }), isPair = 2 === e.length, pair = isPair ? grp.pairs[0] : null,
                agg = isPair ? pair.play : grp.play, recs = isPair ? pair.topics : grp.topics,
                n = {}, i = {}, a = {}, r = {}, o = {}, s = {}, l = [], c = [], d = [];
            let p = 0;
            recs.forEach(rec => {
                if (rec.groupLimited || "limit-blocked" === rec.playOutcome) return void p++;
                const prec = isPair && pair ? pair.topicsById[rec.id] : null;
                const gvFit = prec ? prec.crossFitGive : null, rvFit = prec ? prec.crossFitReceive : null;
                if (null != gvFit || null != rvFit) {
                    n[rec.id] = {
                        give: null != gvFit ? gvFit : 0,
                        receive: null != rvFit ? rvFit : 0
                    };
                } else if (null != rec.strength) {
                    n[rec.id] = {
                        give: rec.strength,
                        receive: rec.strength
                    };
                }
                if ("match" === rec.playOutcome) {
                    l.push(rec.label);
                    if (!n[rec.id]) {
                        n[rec.id] = {
                            give: rec.strength || 0,
                            receive: rec.strength || 0
                        };
                    }
                    const routes = isPair ? pair.topicsById[rec.id].fits.filter(f => !f.shed).map(f => sxRouteRecord(f, rec.id)) : grp.pairs.map(pr => pr.topicsById[rec.id]).filter(pr => pr && pr.bestFit).map(pr => sxRouteRecord(pr.bestFit, rec.id));
                    s[rec.id] = {
                        score: rec.strength || 0,
                        routes: routes
                    }, rec.flags.favoriteBy.length === e.length && (i[rec.id] = "favorite"),
                    rec.flags.fantasyBy.length && (a[rec.id] = !0), rec.flags.triedBy.length && (r[rec.id] = !0),
                    e.forEach(e => {
                        const t = (e.importedChildren || {})[rec.id];
                        t && !o[rec.id] && (o[rec.id] = Object.assign({}, t));
                    });
                } else if ("curious-fit" === rec.playOutcome) c.push(rec.label);
                else if ("conflict" === rec.playOutcome || "one-sided" === rec.playOutcome || "not-topics" === rec.playOutcome || "mismatched" === rec.playOutcome) d.push(rec.label);
            }), d.sort((e, t) => e.localeCompare(t));
            // Display-layer MOVE, pair glance only: a teased topic (teaserFor
            // non-empty AND countClass exactly "soft-no" - the identical
            // predicate as the match-tab MOVE) splices from the Not list (d)
            // to the Curiosity? list (c), appended in d-sorted order. Each
            // label in d was pushed by the record carrying that same label
            // (rec.label above), so the record for a label is the recs entry
            // with that label. Hot (l) is never reassigned; outcomes are
            // untouched - this only re-buckets labels for display.
            if (isPair) {
                const moved = [];
                for (let k = d.length - 1; k >= 0; k--) {
                    const rec = recs.find(r => r.label === d[k]);
                    rec && sxIsTeased(rec) && moved.unshift(d.splice(k, 1)[0]);
                }
                c.push(...moved);
            }
            return {
                ratings: n,
                marks: i,
                fantasyFlags: a,
                triedFlags: r,
                children: o,
                matchDetails: s,
                percent: agg.headline || 0,
                noScore: null === agg.headline,
                things: agg.considered,
                clicks: agg.matches,
                limits: p,
                results: {
                    matches: l,
                    curiousAbout: c,
                    mismatched: d
                },
                sx: isPair ? pair : grp
            };
        }
        function DdStraight(e, heat, veil) {
            // Straight-pair adapter over the sync engine (2026-10-27),
            // the Dd analog for ⊙ pairs: it derives NO new math. The
            // values are the engine's own straight register - the same
            // register the ⊙ view's taper paint reads (pair.straight
            // .byId): per shared topic, give flank = (first give ×
            // second give) / 100, receive flank = (first receive ×
            // second receive) / 100 - the straight match normed by
            // 100, stored as the pair profile's own ratings so the
            // pair tab paints, persists, and exports like any profile.
            // The straight register carries no buckets, headline, or
            // rollup (deferred rulings in sxGroupCompute), so results
            // stay empty and noScore stays true; marks and flags ride
            // the shared topics exactly as Dd's ride its matches.
            const v = Array.isArray(veil) && veil.length ? veil : (e || []).map(p => p && null != p.veil ? av(p.veil) : 50);
            const grp = sxGroupCompute(e, { heat: heat || [], veil: v }), pair = 2 === e.length ? grp.pairs[0] : null,
                n = {}, i = {}, a = {}, r = {}, o = {};
            if (pair && pair.straight) pair.straight.topics.forEach(srec => {
                if ("shared" !== srec.status) return;
                const v = {};
                null != srec.giveGive && (v.give = srec.giveGive / 100), null != srec.recvRecv && (v.receive = srec.recvRecv / 100);
                if (!Object.keys(v).length) return;
                n[srec.id] = v;
                const rec = pair.topicsById[srec.id];
                rec && rec.flags.favoriteBy.length === e.length && (i[srec.id] = "favorite"),
                rec && rec.flags.fantasyBy.length && (a[srec.id] = !0), rec && rec.flags.triedBy.length && (r[srec.id] = !0),
                e.forEach(p => {
                    const t = (p.importedChildren || {})[srec.id];
                    t && !o[srec.id] && (o[srec.id] = Object.assign({}, t));
                });
            });
            return {
                ratings: n,
                marks: i,
                fantasyFlags: a,
                triedFlags: r,
                children: o,
                matchDetails: {},
                percent: 0,
                noScore: !0,
                things: 0,
                clicks: 0,
                limits: pair && pair.straight ? pair.straight.coverage.limitBlocked : 0,
                results: {
                    matches: [],
                    curiousAbout: [],
                    mismatched: []
                },
                sx: pair
            };
        }
        function DdMinus(e, heat, veil) {
            // Circle-minus adapter: disagreement map (Spec Part 2).
            // Spokes carry split depth weighted by joint relevance:
            // for give/receive flanks, the negative same-flank product weighted by joint care;
            // for pole and line topics, the feud from sxDebateFeud weighted by debateIntensity.
            const v = Array.isArray(veil) && veil.length ? veil : (e || []).map(p => p && null != p.veil ? av(p.veil) : 50);
            const grp = sxGroupCompute(e, { heat: heat || [], veil: v }), pair = 2 === e.length ? grp.pairs[0] : null,
                n = {}, i = {}, a = {}, r = {}, o = {};
            if (pair && pair.straight) {
                pair.straight.topics.forEach(srec => {
                    if ("shared" !== srec.status) return;
                    const rec = pair.topicsById ? pair.topicsById[srec.id] : null;
                    const v = {};
                    if (null != srec.agreement || null != srec.roleEnemy) {
                        const feud = sxDebateFeud(srec);
                        if (feud > 0) {
                            const deb = (null != srec.debateIntensity ? srec.debateIntensity : 1);
                            const feudScore = Math.max(1, Math.round(feud * deb * 100));
                            v.single = feudScore;
                            v.singleValue = feudScore;
                            v.give = feudScore;
                            v.receive = feudScore;
                        }
                    } else if (rec && rec.ratings) {
                        const ra = rec.ratings.a, rb = rec.ratings.b;
                        if (null != srec.giveGive && srec.giveGive < 0) {
                            const splitMag = -srec.giveGive / 100;
                            const careA = Math.abs(ra.give || 0), careB = Math.abs(rb.give || 0);
                            const jointRel = Math.sqrt(careA * careB) / 100;
                            v.give = Math.max(1, Math.round(splitMag * jointRel));
                        }
                        if (null != srec.recvRecv && srec.recvRecv < 0) {
                            const splitMag = -srec.recvRecv / 100;
                            const careA = Math.abs(ra.receive || 0), careB = Math.abs(rb.receive || 0);
                            const jointRel = Math.sqrt(careA * careB) / 100;
                            v.receive = Math.max(1, Math.round(splitMag * jointRel));
                        }
                    }
                    if (Object.keys(v).length) {
                        n[srec.id] = v;
                    }
                    if (rec) {
                        rec.flags.favoriteBy.length === e.length && (i[srec.id] = "favorite");
                        rec.flags.fantasyBy.length && (a[srec.id] = !0);
                        rec.flags.triedBy.length && (r[srec.id] = !0);
                    }
                    e.forEach(p => {
                        const t = (p.importedChildren || {})[srec.id];
                        t && !o[srec.id] && (o[srec.id] = Object.assign({}, t));
                    });
                });
            }
            const di = pair ? sxDebateInterim(pair) : null, deb = !pair ? grp.debate : null,
                debateLabels = pair && pair.straight ? pair.straight.topics.filter(s => "shared" === s.status && sxDebateFeud(s) > 0).sort((x, y) => sxDebateFeud(y) - sxDebateFeud(x) || x.label.localeCompare(y.label)).map(s => s.label) : [];
            return {
                ratings: n,
                marks: i,
                fantasyFlags: a,
                triedFlags: r,
                children: o,
                matchDetails: {},
                percent: di ? di.outer || 0 : deb ? deb.headline || 0 : 0,
                noScore: di ? null == di.outer : deb ? null == deb.headline : !0,
                things: di ? di.considered : deb ? deb.considered : 0,
                clicks: di ? di.counted : deb ? deb.counted : 0,
                limits: pair && pair.straight ? pair.straight.coverage.limitBlocked : 0,
                results: {
                    matches: debateLabels,
                    curiousAbout: [],
                    mismatched: []
                },
                sx: pair
            };
        }
        function sxNormalizePairOp(pairOp) {
            return "straight" === pairOp ? "straight" : "minus" === pairOp ? "minus" : "bowtie";
        }
        function sxPairJoin(pairOp) {
            return "straight" === pairOp ? " ⊙ " : "minus" === pairOp ? " ⊖ " : " ⋈ ";
        }
        function sxMatchKindMeta(kind) {
            if ("circledot" === kind) return { label: "Straight Talk", glyph: "⊙", term: "" };
            if ("circleminus" === kind) return { label: "Circle minus", glyph: "⊖", term: "" };
            return { label: sxTerm("krossmatch"), glyph: "⋈", term: "krossmatch" };
        }
        // Blocker stage (owner rulings, 2026-10-27): a recompute reads
        // the LIVE source profiles, never the frozen mint-time copies -
        // n.sourceProfiles is refreshed from live state below whenever
        // at least two sources are still open (the stored copies remain
        // only as the fallback for a group whose sources were closed).
        // Merged values and values edited on the pair tab itself are
        // ratings too: they live in the pair's computed map (vt[e] and
        // its companion maps) and a recompute must remember them. The
        // mechanism is tag-free - no per-value provenance is stored on
        // any value or record: sxPairBase keeps the last PURE
        // computation per group id, in memory only. Any current value
        // that differs from that baseline is a user value (an edit on
        // this tab, or a value merged in through Load) and is
        // re-applied over the fresh computation; a baseline value the
        // user cleared stays cleared while the fresh computation still
        // produces the baseline value. Pure computed values follow the
        // fresh result, including disappearing when sources change.
        function sxPairUserApply(e, a) {
            const base = sxPairBase[e];
            if (!base) return;
            const same = (x, y) => JSON.stringify(x ?? null) === JSON.stringify(y ?? null), curR = vt[e] || {}, curM = Qe[e] || {}, curF = Je[e] || {}, curT = et[e] || {}, curC = at[e] || {};
            Object.keys(curR).forEach(id => {
                same(curR[id], (base.ratings || {})[id]) || (a.ratings[id] = Pd(curR[id]));
            }), Object.keys(a.ratings).forEach(id => {
                id in curR || void 0 === (base.ratings || {})[id] || same(a.ratings[id], base.ratings[id]) && delete a.ratings[id];
            }), Object.keys(curM).forEach(id => {
                same(curM[id], (base.marks || {})[id]) || (a.marks[id] = curM[id]);
            }), Object.keys(a.marks).forEach(id => {
                id in curM || void 0 === (base.marks || {})[id] || same(a.marks[id], base.marks[id]) && delete a.marks[id];
            }), Object.keys(curF).forEach(id => {
                (base.fantasyFlags || {})[id] || (a.fantasyFlags[id] = !0);
            }), Object.keys(a.fantasyFlags).forEach(id => {
                (base.fantasyFlags || {})[id] && !curF[id] && delete a.fantasyFlags[id];
            }), Object.keys(curT).forEach(id => {
                (base.triedFlags || {})[id] || (a.triedFlags[id] = !0);
            }), Object.keys(a.triedFlags).forEach(id => {
                (base.triedFlags || {})[id] && !curT[id] && delete a.triedFlags[id];
            }), Object.keys(curC).forEach(id => {
                (base.children || {})[id] || id in a.children || (a.children[id] = Pd(curC[id]));
            });
        }
        function Rd(e) {
            const n = ft[e];
            if (!n || "group" !== n.kind || !Array.isArray(n.sourceProfiles) || n.sourceProfiles.length < 2) return !1;
            const liveIds = (n.sourceIds || []).filter(id => vt[id]);
            if (liveIds.length >= 2) n.sourceProfiles = liveIds.map(id => ({
                id: id,
                name: wt[id],
                ratings: Pd(vt[id]),
                annotations: Pd(Qe[id]),
                fantasyOnly: Pd(Je[id]),
                alreadyTried: Pd(et[id]),
                importedChildren: Pd(at[id]),
                genders: bb(rt[id]),
                orientations: iv(ot[id]),
                veil: av(vpt[id]),
                veilEnabled: Boolean(vht[id]),
                net: av(vpt[id]),
                netEnabled: Boolean(vht[id])
            }));
            const heats = (n.sourceIds || []).map(id => sxHeatDisplayFor(id)),
                veils = (n.sourceIds || []).map(id => sxVeilFor(id)),
                a = "straight" === n.pairOp ? DdStraight(n.sourceProfiles, heats, veils) : "minus" === n.pairOp ? DdMinus(n.sourceProfiles, heats, veils) : Dd(n.sourceProfiles, null, heats, veils);
            const freshBase = {
                ratings: Pd(a.ratings),
                marks: Pd(a.marks),
                fantasyFlags: Pd(a.fantasyFlags),
                triedFlags: Pd(a.triedFlags),
                children: Pd(a.children)
            };
            sxPairUserApply(e, a), sxPairBase[e] = freshBase;
            return vt[e] = a.ratings, Ze[e] = Object.fromEntries(Object.keys(a.ratings).map(e => [ e, {
                give: "group",
                receive: "group"
            } ])), Qe[e] = a.marks, Je[e] = a.fantasyFlags, et[e] = a.triedFlags, at[e] = a.children,
            n.percent = a.percent, n.things = a.things, n.clicks = a.clicks,
            n.noScore = a.noScore, n.sxEngine = a.sx,
            n.limits = a.limits, n.results = a.results, n.matchDetails = a.matchDetails,
            n.isPseudoProfile = !0,
            n.operation = "straight" === n.pairOp ? "straight" : "minus" === n.pairOp ? "minus" : "cross",
            n.fingerprint = typeof sxSourcesFingerprint === "function" ? sxSourcesFingerprint(n.sourceIds) : "",
            n.recipe = {
                operation: n.operation,
                sourceProfileIds: (n.sourceIds || []).slice(),
                sourceNames: (n.sourceNames || []).slice()
            }, (function() {
                try {
                    n.sxMode = sxcv.mode, n.sxHeat = heats.slice(), n.sxVeil = veils.slice();
                } catch (err) {
                    __sxErrLog("sx-stamp", err);
                }
            })(), (n.isPseudoProfile ? (delete yt[e], Gt(), Kt(e)) : zt(e)),
            !0;
        }
        // Live-source pair & group refresh (owner ruling, 2026-11-24):
        // veils, heat, and ratings on the source profiles move the pair
        // view and the match lists live, walking the group dependency
        // tree inner-first so inner groups recompute before outer ones
        // that include them as a unit. Re-reads the live source profiles
        // and current heats/veils the same way Rd does, updates the
        // baseline while preserving any direct user edits on the group
        // tab via sxPairUserApply, and invalidates the map vault for
        // each affected group. Never calls zt itself, so it cannot recurse.
        function sxRefreshOneGroupLive(gId) {
            const n = ft[gId];
            if (!n || "group" !== n.kind || !Array.isArray(n.sourceProfiles) || n.sourceProfiles.length < 2) return;
            const liveIds = (n.sourceIds || []).filter(id => vt[id]);
            if (liveIds.length >= 2) n.sourceProfiles = liveIds.map(id => ({
                id: id,
                name: wt[id],
                ratings: Pd(vt[id]),
                annotations: Pd(Qe[id]),
                fantasyOnly: Pd(Je[id]),
                alreadyTried: Pd(et[id]),
                importedChildren: Pd(at[id]),
                genders: bb(rt[id]),
                orientations: iv(ot[id]),
                veil: av(vpt[id]),
                veilEnabled: Boolean(vht[id]),
                net: av(vpt[id]),
                netEnabled: Boolean(vht[id])
            }));
            const heats = liveIds.length >= 2 ? liveIds.map(id => sxHeatDisplayFor(id)) : Array.isArray(n.sxHeat) && n.sxHeat.length === n.sourceProfiles.length ? n.sxHeat.slice() : (n.sourceIds || []).map(id => sxHeatDisplayFor(id)),
                veils = liveIds.length >= 2 ? liveIds.map(id => sxVeilFor(id)) : Array.isArray(n.sxVeil) && n.sxVeil.length === n.sourceProfiles.length ? n.sxVeil.slice() : (n.sourceIds || []).map(id => sxVeilFor(id));
            const a = "straight" === n.pairOp ? DdStraight(n.sourceProfiles, heats, veils) : "minus" === n.pairOp ? DdMinus(n.sourceProfiles, heats, veils) : Dd(n.sourceProfiles, null, heats, veils);
            const freshBase = {
                ratings: Pd(a.ratings),
                marks: Pd(a.marks),
                fantasyFlags: Pd(a.fantasyFlags),
                triedFlags: Pd(a.triedFlags),
                children: Pd(a.children)
            };
            sxPairUserApply(gId, a), sxPairBase[gId] = freshBase;
            vt[gId] = a.ratings, Ze[gId] = Object.fromEntries(Object.keys(a.ratings).map(k => [ k, {
                give: "group",
                receive: "group"
            } ])), Qe[gId] = a.marks, Je[gId] = a.fantasyFlags, et[gId] = a.triedFlags, at[gId] = a.children,
            n.percent = a.percent, n.things = a.things, n.clicks = a.clicks, n.noScore = a.noScore, n.sxEngine = a.sx,
            n.limits = a.limits, n.results = a.results, n.matchDetails = a.matchDetails,
            n.fingerprint = typeof sxSourcesFingerprint === "function" ? sxSourcesFingerprint(n.sourceIds) : "";
            try {
                n.sxHeat = heats.slice(), n.sxVeil = veils.slice();
            } catch (err) {
                __sxErrLog("sx-stamp-live", err);
            }
            try { typeof sxKvHeat === "function" && sxKvHeat(gId); } catch (_) {}
            try { window.SexcapadesEngine?.Map?.invalidateVault(gId); } catch (_) {}
        }
        function sxGroupDependsOn(gId, targetId, seen) {
            if (!gId || !targetId) return !1;
            if (gId === targetId) return !0;
            seen = seen || new Set;
            if (seen.has(gId)) return !1;
            seen.add(gId);
            const n = ft[gId];
            if (!n || "group" !== n.kind || !Array.isArray(n.sourceIds)) return !1;
            return n.sourceIds.some(srcId => srcId === targetId || sxGroupDependsOn(srcId, targetId, new Set(seen)));
        }
        function sxRefreshGroupOwn(e) {
            const allGroups = Object.keys(ft).filter(id => ft[id] && "group" === ft[id].kind && vt[id]);
            if (!allGroups.length) return;
            const visited = new Set;
            const walkInnerFirst = gId => {
                if (visited.has(gId)) return;
                visited.add(gId);
                const n = ft[gId];
                if (!n || "group" !== n.kind) return;
                (n.sourceIds || []).forEach(srcId => {
                    if (ft[srcId] && "group" === ft[srcId].kind && vt[srcId]) walkInnerFirst(srcId);
                });
                if (!e || sxGroupDependsOn(gId, e)) sxRefreshOneGroupLive(gId);
            };
            allGroups.forEach(walkInnerFirst);
        }
        let Od = 0, Bd = null, qd = [], Wd = null;
        function Kd() {
            const e = Mt && ft[Mt];
            return e && "group" === e.kind && Array.isArray(e.sourceProfiles) && e.sourceProfiles.length >= 2 ? e : null;
        }
        function zd(e = sxCompareIds) {
            return e.filter(e => vt[e]).map(e => ({
                id: e,
                name: wt[e],
                ratings: vt[e],
                annotations: Qe[e],
                fantasyOnly: Je[e],
                alreadyTried: et[e],
                importedChildren: at[e],
                genders: bb(rt[e]),
                orientations: iv(ot[e]),
                veil: av(vpt[e]),
                veilEnabled: Boolean(vht[e]),
                net: av(vpt[e]),
                netEnabled: Boolean(vht[e])
            }));
        }
        function Vd() {
            // Leniency removal (2026-10-27): the compare refresh no
            // longer derives or carries any leniency value - the
            // engine ignored the slot, and the values it fed (Hd, the
            // Wd input) have no live reader. The refresh itself -
            // pinning the current multi-select in qd, recomputing the
            // overlay data, repainting the match tabs - is unchanged.
            const d = Yi().filter(e => vt[e]), u = d.length >= 2;
            qd = u ? d.slice() : [], Wd = u ? Dd(zd(d), null, d.map(id => sxHeatDisplayFor(id)), d.map(id => sxVeilFor(id))) : null;
            sxRefreshMatchTabs();
        }
        /* ===== Compare view: presentation layer over the sync engine =====
           Mode (Conversation / Play) is in-memory UI state and always starts
           at Conversation on a fresh page load. Per-person Heat is SESSION
           state: held here, mirrored to sessionStorage so it survives
           navigation and reloads within one browser session, reset by a new
           browser session, and never written into any profile. Veil is
           PROFILE data now (the profile store's veil maps, read through
           sxVeilFor); a legacy veil object in the stored session blob is
           ignored on load, never migrated into any profile. Saved group
           records snapshot mode/Heat/Veil at save time (see the stamp in
           Rd). Group Heat is the same SESSION state, keyed by group
           profile id in sxcv.groupHeat: its default is the LOWER
           (Math.min) of the group's live member heats (falling back to
           Rd's sxHeat snapshot only if sources are closed), and a
           user-set value overrides that default for that group only.
           Negative Heat zone names: "Cooling" (-1..-24),
           "Chilled" (-25..-74), "Turned off" / "Withdrawn" (-75..-100). */
        const SXCV_KEY = "sexcapades.compare.session.v1";
        const sxcv = { mode: "conversation", heat: {}, groupHeat: {} };
        try {
            const raw = sessionStorage.getItem(SXCV_KEY);
            if (raw) {
                const p = JSON.parse(raw);
                p && p.heat && "object" == typeof p.heat && (sxcv.heat = p.heat);
                p && p.groupHeat && "object" == typeof p.groupHeat && (sxcv.groupHeat = p.groupHeat);
            }
        } catch (err) { __sxErrLog("sxcv-load", err); }
        function sxcvSave() {
            try { sessionStorage.setItem(SXCV_KEY, JSON.stringify({ heat: sxcv.heat, groupHeat: sxcv.groupHeat })); } catch (err) { __sxErrLog("sxcv-save", err); }
        }
        function sxHeatFor(key) {
            const v = Number(sxcv.heat[key]);
            return Number.isFinite(v) ? Math.max(-100, Math.min(100, Math.round(v))) : 0;
        }
        function sxIsGroup(e) {
            return !!(e && ft[e] && "group" === ft[e].kind);
        }
        function sxGroupHeatDefault(e, seen) {
            const n = ft[e];
            if (!n || "group" !== n.kind) return 0;
            seen = seen || new Set;
            if (seen.has(e)) return 0;
            seen.add(e);
            const liveIds = (n.sourceIds || []).filter(id => vt[id]);
            if (liveIds.length >= 2) {
                const liveVals = liveIds.map(id => sxIsGroup(id) ? sxGroupHeatFor(id, new Set(seen)) : sxHeatFor(id));
                return Math.max(-100, Math.min(100, Math.round(Math.min(...liveVals))));
            }
            const stamped = Array.isArray(n.sxHeat) ? n.sxHeat.filter(v => Number.isFinite(Number(v))).map(v => Number(v)) : [];
            const vals = stamped.length ? stamped : (n.sourceIds || []).map(id => sxHeatFor(id));
            if (!vals.length) return 0;
            return Math.max(-100, Math.min(100, Math.round(Math.min(...vals))));
        }
        function sxGroupHeatFor(e, seen) {
            const v = Number(sxcv.groupHeat[e]);
            return Number.isFinite(v) ? Math.max(-100, Math.min(100, Math.round(v))) : sxGroupHeatDefault(e, seen);
        }
        function sxHeatDisplayFor(e) {
            return sxIsGroup(e) ? sxGroupHeatFor(e) : sxHeatFor(e);
        }
        function sxVeilFor(key) {
            const v = Number(vpt[key]);
            return Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 50;
        }
        function sxHeatZone(v) {
            return v >= 75 ? sxTerm("heatMax") : v >= 25 ? "Hot" : v >= 1 ? "Warm" : 0 === v ? "Neutral" : v <= -75 ? sxTerm("heatMin") : v <= -25 ? "Chilled" : "Cooling";
        }
        let sxCtx = null, sxAudio = null, sxBuzzTarget = null;
        const sxBuzzFired = new Set;
        function sxCompareContext() {
            const sel = Yi().filter(id => vt[id]);
            if (sel.length >= 2) return { ids: sel.slice(), profiles: zd(sel), saved: !1 };
            const c = Kd();
            if (c && Array.isArray(c.sourceProfiles) && c.sourceProfiles.length >= 2) return { ids: (c.sourceIds || []).slice(), profiles: c.sourceProfiles, saved: !0 };
            return null;
        }
        function sxKey(ctx, i) {
            return ctx.ids[i] || `sx-person-${i}`;
        }
        function sxRun(ctx) {
            const heat = ctx.profiles.map((p, i) => sxHeatDisplayFor(sxKey(ctx, i))), veil = ctx.profiles.map((p, i) => sxVeilFor(sxKey(ctx, i)));
            return sxGroupCompute(ctx.profiles, { heat: heat, veil: veil });
        }
        function sxRatingText(r) {
            if (!r) return "not rated";
            if (r.single) return null != r.singleValue ? `${Math.round(r.singleValue)} · direction unspecified` : "not rated";
            if (!r.giveKnown && !r.receiveKnown) return "not rated";
            return `give ${r.giveKnown ? Math.round(r.give) : "—"} · receive ${r.receiveKnown ? Math.round(r.receive) : "—"}`;
        }
        function sxFitText(rec) {
            if (!rec.bestFit) return "";
            const dirs = [], seen = new Set;
            rec.fits.filter(f => !f.shed).forEach(f => {
                const s = `${f.giver} → ${f.receiver}`;
                seen.has(s) || (seen.add(s), dirs.push(s));
            });
            const kind = { full: "full fit", open: "open fit", tentative: "tentative fit" }[rec.bestFit.kind] || rec.bestFit.kind;
            return `${rec.bothWays ? "both ways · " : ""}${dirs.join(" · ")} · ${kind} · strength ${Math.round(rec.strength)}`;
        }
        function sxBadges(rec, isPair) {
            const out = [], fl = rec.flags || {};
            if (rec.differentIntensities) out.push({ t: "different intensities" });
            const tried = fl.triedBy || [];
            isPair && tried.length >= 2 ? out.push({ t: "tried: both" }) : tried.forEach(nm => out.push({ t: `tried: ${nm}` }));
            // Badges deprecated in general (2026-10-26): no "Not interested" or "Soft no revisited" badge renders anywhere.
            if (rec.shed) out.push({ t: "below tonight's bar", cls: "is-flag" });
            return out.map(b => `<span class="sx-badge${b.cls ? " " + b.cls : ""}">${Hi(b.t)}</span>`).join("");
        }
        function sxPairRow(rec, res) {
            const fit = sxFitText(rec);
            return `<div class="sx-row"><div class="sx-row-top"><strong>${Hi(rec.label)}</strong>${sxBadges(rec, !0)}</div><div class="sx-row-ratings"><span><b>${Hi(res.a)}</b> ${Hi(sxRatingText(rec.ratings.a))}</span><span><b>${Hi(res.b)}</b> ${Hi(sxRatingText(rec.ratings.b))}</span></div>${fit ? `<div class="sx-row-fit">${Hi(fit)}</div>` : ""}${rec.mismatchShape ? `<div class="sx-row-shape">${Hi(rec.mismatchShape)}</div>` : ""}</div>`;
        }
        function sxGroupRow(rec) {
            return `<div class="sx-row"><div class="sx-row-top"><strong>${Hi(rec.label)}</strong>${sxBadges(rec, !1)}</div>${null != rec.strength ? `<div class="sx-row-fit">strength ${Math.round(rec.strength)}</div>` : ""}</div>`;
        }
        function sxLimitsHtml(list) {
            if (!list.length) return `<p class="sx-empty">No limits in this comparison.</p>`;
            const blocks = [], groups = new Map;
            list.forEach(rec => {
                (rec.limiters || []).forEach(lm => {
                    if ("topic" === lm.scope) return void blocks.push(`<div class="sx-row"><div class="sx-row-top"><strong>${Hi(rec.label)}</strong><span class="sx-badge is-limit">limit, ${Hi(lm.name)}</span></div></div>`);
                    const meta = (typeof sxNodeRecord === "function") ? sxNodeRecord(rec.id) : (qn[rec.id] || Xn(rec.id) || null);
                    let gname = rec.branch;
                    if ("category" !== lm.scope && meta && meta.parentId) {
                        const parentRec = (typeof sxNodeRecord === "function") ? sxNodeRecord(meta.parentId) : (qn[meta.parentId] || null);
                        if (parentRec && parentRec.label) gname = parentRec.label;
                    }
                    const key = `${lm.scope}|${lm.name}|${gname}`;
                    if (!groups.has(key)) {
                        const g = { name: lm.name, gname: gname, topics: [] };
                        groups.set(key, g), blocks.push(g);
                    }
                    groups.get(key).topics.push(rec.label);
                });
            });
            return blocks.map(b => "string" == typeof b ? b : `<details class="sx-limit-group"><summary><strong>All of ${Hi(b.gname)}</strong> — limit, ${Hi(b.name)} <span class="sx-count">${b.topics.length} topic${1 === b.topics.length ? "" : "s"}</span></summary><ul>${b.topics.map(t => `<li>${Hi(t)}</li>`).join("")}</ul></details>`).join("");
        }
        function sxSection(title, sub, rowsHtml, count) {
            return `<section class="sx-section"><h3>${Hi(title)}${null != count ? ` <span class="sx-count">${count}</span>` : ""}</h3>${sub ? `<p class="sx-section-sub">${Hi(sub)}</p>` : ""}<div class="sx-rows">${rowsHtml}</div></section>`;
        }
        function sxPickerHtml() {
            const ids = Object.keys(vt).filter(id => wt[id]);
            if (!ids.length) return `<div class="sx-picker"><div class="sx-picker-label">Who's comparing?</div><p class="sx-picker-help">No profiles are loaded yet. Add or import two or more profiles, then pick them here to compare.</p></div>`;
            const sel = new Set(Yi());
            const btns = ids.map(id => `<button aria-pressed="${sel.has(id)}" class="sx-pick" data-sx-pick="${Hi(id)}" type="button">${Hi(wt[id])}</button>`).join("");
            return `<div class="sx-picker"><div class="sx-picker-label">Who's comparing?</div><div class="sx-pick-row">${btns}</div><p class="sx-picker-help">Tap to add or remove a profile from the comparison. Pick two or more to compare. (Ctrl+click or Cmd+click on a profile tab works too.)</p></div>`;
        }
        // Match-tab fix (2026-10-26): the bowtie controls slot is GONE with
        // the bowtie text tab - the stage panel is never shown for a ⋈ tab
        // (see sxSyncMatchStage). Auto-create (2026-10-26): no surface
        // renders a save-as-group control at all anymore - opening a ⋈
        // comparison creates the group profile itself (sxAutoCreateBowtie
        // runs the same Zd save the controls used to trigger), so there
        // is no save click left to relocate.
        function sxStamp(ctx) {
            const parts = ctx.profiles.map((p, i) => `${p.name || `Profile ${i + 1}`} ${sxHeatZone(sxHeatDisplayFor(sxKey(ctx, i)))}`);
            return `${"play" === sxcv.mode ? sxTerm("playMode") : sxTerm("conversationMode")} · Heat: ${parts.join(" · ")}`;
        }
        function sxRenderResults(allowBuzz) {
            const root = sxResultsEl();
            if (!root || !sxCtx) return;
            const ctx = sxCtx, grp = sxRun(ctx), isPair = 2 === ctx.profiles.length, pair = isPair ? grp.pairs[0] : null, mode = sxcv.mode;
            let headlineLabel, headlineText, coverageHtml = "";
            if (isPair) {
                const agg = "play" === mode ? pair.play : pair.conversation, cov = pair.coverage;
                headlineLabel = "play" === mode ? sxTerm("playMS") : sxTerm("playKF"), headlineText = agg.headlineText || "No score — no shared topics",
                coverageHtml = `<p class="sx-coverage">${Hi(pair.a)}: ${cov.aRated} rated · ${cov.aPercent}% of ${cov.catalog} topics · ${Hi(pair.b)}: ${cov.bRated} rated · ${cov.bPercent}% of ${cov.catalog} topics · ${cov.oneSided} one-sided · ${cov.limitBlocked} limit-blocked · ${cov.fantasySetAside} fantasy set aside</p>`;
            } else {
                const agg = "play" === mode ? grp.play : grp.conversation, limitedCount = grp.topics.filter(t => t.groupLimited).length;
                headlineLabel = agg.label || ("play" === mode ? sxTerm("playMS") : sxTerm("playKF")), headlineText = agg.headlineText || "No score — no shared topics";
                const per = ctx.profiles.map((p, i) => {
                    const pr = grp.pairs.find(x => x.i === i || x.j === i);
                    if (!pr) return `${Hi(p.name || `Profile ${i + 1}`)}: —`;
                    const mine = pr.i === i ? { rated: pr.coverage.aRated, pct: pr.coverage.aPercent } : { rated: pr.coverage.bRated, pct: pr.coverage.bPercent };
                    return `${Hi(p.name || `Profile ${i + 1}`)}: ${mine.rated} rated · ${mine.pct}% of ${pr.coverage.catalog} topics`;
                });
                coverageHtml = `<p class="sx-coverage">${per.join(" · ")} · ${limitedCount} topic${1 === limitedCount ? "" : "s"} limited for the group</p>`;
            }
            const explainer = "conversation" === mode ? `<p class="sx-explainer">How much of the map you both answered is worth talking about — matches, open doors, shared fantasies, and things you've already tried.</p>` : "";
            let listsHtml = "";
            if (isPair) {
                const lists = ("play" === mode ? pair.play : pair.conversation).lists;
                listsHtml = sxSection("Matches", null, lists.matches.map(r => sxPairRow(r, pair)).join("") || `<p class="sx-empty">No matches.</p>`, lists.matches.length)
                    + sxSection("Curious about", null, lists.curiousAbout.map(r => sxPairRow(r, pair)).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.curiousAbout.length)
                    + sxSection("Mismatched", null, lists.mismatched.map(r => sxPairRow(r, pair)).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.mismatched.length)
                    + sxSection("Limits", null, sxLimitsHtml(lists.limits), lists.limits.length);
            } else if ("play" === mode) {
                const lists = grp.play.lists;
                listsHtml = sxSection("Matches", null, lists.matches.map(sxGroupRow).join("") || `<p class="sx-empty">No matches.</p>`, lists.matches.length)
                    + sxSection("Curious about", null, lists.curiousAbout.map(sxGroupRow).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.curiousAbout.length)
                    + sxSection("Mismatched", null, lists.mismatched.map(sxGroupRow).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.mismatched.length)
                    + sxSection("Limits", null, sxLimitsHtml(lists.limits), lists.limits.length);
            } else {
                const lists = grp.conversation.lists;
                listsHtml = sxSection("Worth talking about", null, lists.counted.map(sxGroupRow).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.counted.length)
                    + sxSection("Limits", null, sxLimitsHtml(lists.limits), lists.limits.length);
            }
            let hotHtml = "";
            if ("conversation" === mode) {
                const hot = grp.hotTopicsTop10 || [];
                hotHtml = sxSection("Hot Topics", "What the whole room should be talking about right now.", hot.map(h => `<div class="sx-row"><div class="sx-row-top"><strong>${Hi(h.label)}</strong><span class="sx-hot-score">${Math.round(h.score)}</span></div></div>`).join("") || `<p class="sx-empty">No hot topics yet.</p>`, null);
            }
            /* Deprecated match-tab Teasers rows removed (2026-10-26): the popover Teasers sections are the teaser surface now. Writer teaser lines are a separate later job (A4) and are untouched. */

            // Match-view viewport (2026-10-26): both headline numbers stay
            // readable beside the rings - the pair/group Kink Factor
            // (Conversation register) and the Match Score (Play register),
            // read straight off the engine aggregates, never averaged and
            // never mixed across registers or directions.
            /* Match-stage score rings moved to the header Avatar
               (ruled 2026-10-30): the bowtie score rings no longer
               render in this seat — the header paint shows the same
               Play MS / Play KF for the active match
               tab through sxRingValuesForCast. */
            n(root, `<div class="sx-stamp" data-sx-term="playMode,conversationMode,heatMax,heatMin">${Hi(sxStamp(ctx))}</div>${coverageHtml}${explainer}${listsHtml}${hotHtml}`);
            const sxTabNow = sxCurrentTab();
            sxTabNow && "bowtie" === sxTabNow.kind && (sxTabNow.buckets = sxBowtieBuckets(ctx, grp), sxUpdateMatchRings(sxTabNow));
            allowBuzz && sxMaybeBuzz(ctx, grp);
        }
        function sxRenderPairLine(tab, ctx) {
            const el = tab && tab.section ? tab.section.querySelector("[data-sx-pair-line]") : null;
            if (!el) return;
            const names = ctx ? ctx.profiles.map((p, i) => p.name || `Profile ${i + 1}`) : [];
            names.length >= 2 ? (el.textContent = names.join(sxPairJoin("circledot" === tab.kind ? "straight" : "circleminus" === tab.kind ? "minus" : "bowtie")), el.hidden = !1) : (el.textContent = "", el.hidden = !0);
        }
        /* ===== Match tabs (SURFACES): the compare surfaces live in tabs in
           the #profileTabs strip, keyed by kind + cast. A match tab is not a
           profile: it never enters vt/wt or any profile enumeration, and
           opening, switching to, or closing one never changes the active
           profile, the multi-selection, or any profile's view state. ===== */
        function sxTabsReg() {
            return sxTabsReg.m || (sxTabsReg.m = {
                tabs: new Map,
                active: null,
                stageOn: !1
            });
        }
        function sxMatchIconsVisible() {
            if (Yi().length >= 2) return !0;
            const c = Kd();
            return !!c && Array.isArray(c.sourceIds) && c.sourceIds.length >= 2;
        }
        function sxMatchIconsHtml() {
            if (!sxMatchIconsVisible()) return "";
            return [ "circledot", "bowtie", "circleminus" ].map(kind => {
                const m = sxMatchKindMeta(kind), term = m.term ? ` data-sx-term="${m.term}"` : "";
                return `<button type="button" class="profile-match-btn" data-sx-match-open="${kind}" aria-label="Open ${m.label} for the selected profiles" title="${m.label}"${term}>${m.glyph}</button>`;
            }).join("");
        }
        function sxMatchTabsHtml() {
            const reg = sxTabsReg();
            return [ ...reg.tabs.values() ].map(tab => {
                const active = reg.stageOn && reg.active === tab.key, m = sxMatchKindMeta(tab.kind), term = m.term ? ` data-sx-term="${m.term}"` : "";
                return `<span class="sx-match-tab${active ? " is-active" : ""}" data-sx-match-kind="${tab.kind}"><button type="button" role="tab" class="profile-tab-button sx-match-tab-btn${active ? " is-active" : ""}" data-sx-match-tab-btn="${Hi(tab.key)}" aria-selected="${active}" aria-label="${m.label} match tab"${term}><span aria-hidden="true">${m.glyph}</span> ${m.label}</button><button type="button" class="profile-tab-close" data-sx-match-close="${Hi(tab.key)}" aria-label="Close ${m.label} tab"${term}>×</button></span>`;
            }).join("");
        }
        function sxCurrentTab() {
            const reg = sxTabsReg();
            return reg.stageOn && reg.active ? reg.tabs.get(reg.active) || null : null;
        }
        function sxResultsEl() {
            const tab = sxCurrentTab();
            return tab && tab.section ? tab.section.querySelector(".sx-match-results") : null;
        }
