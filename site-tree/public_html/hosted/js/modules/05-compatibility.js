        function _d(e, t = !1) {
            return e ? `${e.giver}: ${e.giverLabel || "give"}${t ? ` ${e.giverRating}` : ""} → ${e.receiver}: ${e.receiverLabel || "receive"}${t ? ` ${e.receiverRating}` : ""}` : "";
        }
        function Dd(e, t, heat) {
            // Adapter over the sync engine v1.1: the second argument (the
            // retired leniency value) is accepted for call-site compatibility
            // and ignored — no score, bar, or tolerance reads it anymore.
            // Two profiles read the pair Play aggregation; three or more
            // read the group Play aggregation (strict-majority rules).
            const grp = sxGroupCompute(e, { heat: heat || [] }), isPair = 2 === e.length, pair = isPair ? grp.pairs[0] : null,
                agg = isPair ? pair.play : grp.play, recs = isPair ? pair.topics : grp.topics,
                n = {}, i = {}, a = {}, r = {}, o = {}, s = {}, l = [], c = [], d = [];
            let p = 0;
            recs.forEach(rec => {
                if (rec.groupLimited || "limit-blocked" === rec.playOutcome) return void p++;
                if ("match" === rec.playOutcome) {
                    l.push(rec.label), n[rec.id] = {
                        give: rec.strength || 0,
                        receive: rec.strength || 0
                    };
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
            // non-empty AND countClass exactly "soft-no" — the identical
            // predicate as the match-tab MOVE) splices from the Not list (d)
            // to the Curiosity? list (c), appended in d-sorted order. Each
            // label in d was pushed by the record carrying that same label
            // (rec.label above), so the record for a label is the recs entry
            // with that label. Hot (l) is never reassigned; outcomes are
            // untouched — this only re-buckets labels for display.
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
        function DdStraight(e, heat) {
            // Straight-pair adapter over the sync engine (2026-10-27),
            // the Dd analog for ⊙ pairs: it derives NO new math. The
            // values are the engine's own straight register — the same
            // register the ⊙ view's taper paint reads (pair.straight
            // .byId): per shared topic, give flank = (first give ×
            // second give) / 100, receive flank = (first receive ×
            // second receive) / 100 — the straight match normed by
            // 100, stored as the pair profile's own ratings so the
            // pair tab paints, persists, and exports like any profile.
            // The straight register carries no buckets, headline, or
            // rollup (deferred rulings in sxGroupCompute), so results
            // stay empty and noScore stays true; marks and flags ride
            // the shared topics exactly as Dd's ride its matches.
            const grp = sxGroupCompute(e, { heat: heat || [] }), pair = 2 === e.length ? grp.pairs[0] : null,
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
        // Blocker stage (owner rulings, 2026-10-27): a recompute reads
        // the LIVE source profiles, never the frozen mint-time copies —
        // n.sourceProfiles is refreshed from live state below whenever
        // at least two sources are still open (the stored copies remain
        // only as the fallback for a group whose sources were closed).
        // Merged values and values edited on the pair tab itself are
        // ratings too: they live in the pair's computed map (vt[e] and
        // its companion maps) and a recompute must remember them. The
        // mechanism is tag-free — no per-value provenance is stored on
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
            const a = "straight" === n.pairOp ? DdStraight(n.sourceProfiles, (n.sourceIds || []).map(id => sxHeatFor(id))) : Dd(n.sourceProfiles, null, (n.sourceIds || []).map(id => sxHeatFor(id)));
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
            n.limits = a.limits, n.results = a.results, n.matchDetails = a.matchDetails, (function() {
                try {
                    n.sxMode = sxcv.mode, n.sxHeat = (n.sourceIds || []).map(id => sxHeatFor(id)), n.sxVeil = (n.sourceIds || []).map(id => sxVeilFor(id));
                } catch (err) {
                    __sxErrLog("sx-stamp", err);
                }
            })(), zt(e), 
            !0;
        }
        // Live-own, snapshot-source (owner ruling, 2026-10-27): a match
        // tab's OWN changes — slider edits on the pair tab itself and
        // merges folded into the pair — move its metrics (buckets,
        // Charted inputs, rings, Kink Factor, Match Score) live, in
        // real time, while source-profile changes never move an
        // existing match tab. So this refresh recomputes the record's
        // derived fields from the pair's OWN stored snapshots
        // (n.sourceProfiles as of the last mint/recompute — source
        // edits since then are NOT read) and its STAMPED Heat
        // (n.sxHeat — a source Heat change stages until a fork, it
        // does not leak in here), then re-applies the pair's own user
        // values through the same baseline diff Rd uses. It runs off
        // zt, the marker every edit funnels through, only for groups
        // computed this session (a baseline exists); a group restored
        // from storage has no baseline yet and is left exactly as
        // saved. It never calls zt itself, so it cannot recurse.
        function sxRefreshGroupOwn(e) {
            const n = ft[e];
            if (!n || "group" !== n.kind || !sxPairBase[e] || !Array.isArray(n.sourceProfiles) || n.sourceProfiles.length < 2) return;
            const heat = Array.isArray(n.sxHeat) && n.sxHeat.length === n.sourceProfiles.length ? n.sxHeat.slice() : (n.sourceIds || []).map(id => sxHeatFor(id));
            const a = "straight" === n.pairOp ? DdStraight(n.sourceProfiles, heat) : Dd(n.sourceProfiles, null, heat);
            sxPairUserApply(e, a), vt[e] = a.ratings, Ze[e] = Object.fromEntries(Object.keys(a.ratings).map(e => [ e, {
                give: "group",
                receive: "group"
            } ])), Qe[e] = a.marks, Je[e] = a.fantasyFlags, et[e] = a.triedFlags, at[e] = a.children, 
            n.percent = a.percent, n.things = a.things, n.clicks = a.clicks, n.noScore = a.noScore, n.sxEngine = a.sx, 
            n.limits = a.limits, n.results = a.results, n.matchDetails = a.matchDetails;
        }
        let Od = 0, Bd = null, qd = [], Wd = null;
        function Kd() {
            const e = Mt && ft[Mt];
            return e && "group" === e.kind && Array.isArray(e.sourceProfiles) && e.sourceProfiles.length >= 2 ? e : null;
        }
        function zd(e = sxCompareIds) {
            return e.filter(e => vt[e]).map(e => ({
                name: wt[e],
                ratings: vt[e],
                annotations: Qe[e],
                fantasyOnly: Je[e],
                alreadyTried: et[e],
                importedChildren: at[e],
                genders: bb(rt[e]),
                orientations: iv(ot[e])
            }));
        }
        function Vd() {
            // Leniency removal (2026-10-27): the compare refresh no
            // longer derives or carries any leniency value — the
            // engine ignored the slot, and the values it fed (Hd, the
            // Wd input) have no live reader. The refresh itself —
            // pinning the current multi-select in qd, recomputing the
            // overlay data, repainting the match tabs — is unchanged.
            const d = Yi().filter(e => vt[e]), u = d.length >= 2;
            qd = u ? d.slice() : [], Wd = u ? Dd(zd(d), null, d.map(id => sxHeatFor(id))) : null;
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
           profile id in sxcv.groupHeat: its default is the arithmetic
           mean of the group's stamped member heats (Rd's sxHeat
           snapshot, falling back to the members' live heats), and a
           user-set value overrides that default for that group only.
           Group Heat never feeds Rd, Dd, DdStraight, or any score; it
           only exposes and adjusts the group's heat. Negative Heat zone
           names are PLACEHOLDERS pending a naming
           pass: "Cooling" (-1..-24), "Chilled" (-25..-74),
           "Turned off" (-75..-100). */
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
        function sxGroupHeatDefault(e) {
            const n = ft[e];
            if (!n || "group" !== n.kind) return 0;
            const expect = Array.isArray(n.sourceProfiles) ? n.sourceProfiles.length : (n.sourceIds || []).length;
            const stamped = Array.isArray(n.sxHeat) ? n.sxHeat.filter(v => Number.isFinite(Number(v))).map(v => Number(v)) : [];
            const vals = stamped.length === expect && expect > 0 ? stamped : (n.sourceIds || []).map(id => sxHeatFor(id));
            if (!vals.length) return 0;
            return Math.max(-100, Math.min(100, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)));
        }
        function sxGroupHeatFor(e) {
            const v = Number(sxcv.groupHeat[e]);
            return Number.isFinite(v) ? Math.max(-100, Math.min(100, Math.round(v))) : sxGroupHeatDefault(e);
        }
        function sxHeatDisplayFor(e) {
            return sxIsGroup(e) ? sxGroupHeatFor(e) : sxHeatFor(e);
        }
        function sxVeilFor(key) {
            const v = Number(vpt[key]);
            return Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 50;
        }
        function sxHeatZone(v) {
            return v >= 75 ? "Horndog" : v >= 25 ? "Hot" : v >= 1 ? "Warm" : 0 === v ? "Neutral" : v <= -75 ? "Turned off" : v <= -25 ? "Chilled" : "Cooling";
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
            const heat = ctx.profiles.map((p, i) => sxHeatFor(sxKey(ctx, i))), veil = ctx.profiles.map((p, i) => sxVeilFor(sxKey(ctx, i)));
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
                    const meta = qn[rec.id] || Xn(rec.id) || null, gname = "category" === lm.scope ? rec.branch : meta && meta.parentId && (qn[meta.parentId] || {}).label || rec.branch, key = `${lm.scope}|${lm.name}|${gname}`;
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
            return `<div class="sx-picker"><div class="sx-picker-label">Who's comparing?</div><div class="sx-pick-row">${btns}</div><p class="sx-picker-help">Tap to add or remove a profile from the cast. Pick two or more to compare. (Ctrl+click or Cmd+click on a profile tab works too.)</p></div>`;
        }
        // Match-tab fix (2026-10-26): the bowtie controls slot is GONE with
        // the bowtie text tab — the stage panel is never shown for a ⋈ tab
        // (see sxSyncMatchStage). Auto-create (2026-10-26): no surface
        // renders a save-as-group control at all anymore — opening a ⋈
        // comparison creates the group profile itself (sxAutoCreateBowtie
        // runs the same Zd save the controls used to trigger), so there
        // is no save click left to relocate.
        function sxStamp(ctx) {
            const parts = ctx.profiles.map((p, i) => `${p.name || `Profile ${i + 1}`} ${sxHeatZone(sxHeatFor(sxKey(ctx, i)))}`);
            return `${"play" === sxcv.mode ? "Play" : "Conversation"} · Heat: ${parts.join(" · ")}`;
        }
        function sxRenderResults(allowBuzz) {
            const root = sxResultsEl();
            if (!root || !sxCtx) return;
            const ctx = sxCtx, grp = sxRun(ctx), isPair = 2 === ctx.profiles.length, pair = isPair ? grp.pairs[0] : null, mode = sxcv.mode;
            let headlineLabel, headlineText, coverageHtml = "";
            if (isPair) {
                const agg = "play" === mode ? pair.play : pair.conversation, cov = pair.coverage;
                headlineLabel = "play" === mode ? "Play MS" : "Play KF", headlineText = agg.headlineText || "No score — no shared topics",
                coverageHtml = `<p class="sx-coverage">${Hi(pair.a)}: ${cov.aRated} rated · ${cov.aPercent}% of ${cov.catalog} topics · ${Hi(pair.b)}: ${cov.bRated} rated · ${cov.bPercent}% of ${cov.catalog} topics · ${cov.oneSided} one-sided · ${cov.limitBlocked} limit-blocked · ${cov.fantasySetAside} fantasy set aside</p>`;
            } else {
                const agg = "play" === mode ? grp.play : grp.conversation, limitedCount = grp.topics.filter(t => t.groupLimited).length;
                headlineLabel = agg.label || ("play" === mode ? "Play MS" : "Play KF"), headlineText = agg.headlineText || "No score — no shared topics";
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
            // readable beside the rings — the pair/group Kink Factor
            // (Conversation register) and the Match Score (Play register),
            // read straight off the engine aggregates, never averaged and
            // never mixed across registers or directions.
            /* Match-stage score rings moved to the header Avatar
               (ruled 2026-10-30): the bowtie score rings no longer
               render in this seat — the header paint shows the same
               Play MS / Play KF for the active match
               tab through sxRingValuesForCast. */
            n(root, `<div class="sx-stamp">${Hi(sxStamp(ctx))}</div>${coverageHtml}${explainer}${listsHtml}${hotHtml}`);
            const sxTabNow = sxCurrentTab();
            sxTabNow && "bowtie" === sxTabNow.kind && (sxTabNow.buckets = sxBowtieBuckets(ctx, grp), sxUpdateMatchRings(sxTabNow));
            allowBuzz && sxMaybeBuzz(ctx, grp);
        }
        function sxRenderPairLine(tab, ctx) {
            const el = tab && tab.section ? tab.section.querySelector("[data-sx-pair-line]") : null;
            if (!el) return;
            const names = ctx ? ctx.profiles.map((p, i) => p.name || `Profile ${i + 1}`) : [];
            names.length >= 2 ? (el.textContent = names.join("circledot" === tab.kind ? " ⊙ " : " ⋈ "), el.hidden = !1) : (el.textContent = "", el.hidden = !0);
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
            return `<button type="button" class="profile-match-btn" data-sx-match-open="circledot" aria-label="Open Straight Talk for the selected profiles" title="Straight Talk">⊙</button><button type="button" class="profile-match-btn" data-sx-match-open="bowtie" aria-label="Open Krossmatch for the selected profiles" title="Krossmatch">⋈</button>`;
        }
        function sxMatchTabsHtml() {
            const reg = sxTabsReg();
            return [ ...reg.tabs.values() ].map(tab => {
                const active = reg.stageOn && reg.active === tab.key, label = "circledot" === tab.kind ? "Straight Talk" : "Krossmatch", glyph = "circledot" === tab.kind ? "⊙" : "⋈";
                return `<span class="sx-match-tab${active ? " is-active" : ""}" data-sx-match-kind="${tab.kind}"><button type="button" role="tab" class="profile-tab-button sx-match-tab-btn${active ? " is-active" : ""}" data-sx-match-tab-btn="${Hi(tab.key)}" aria-selected="${active}" aria-label="${label} match tab"><span aria-hidden="true">${glyph}</span> ${label}</button><button type="button" class="profile-tab-close" data-sx-match-close="${Hi(tab.key)}" aria-label="Close ${label} tab">×</button></span>`;
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
        function sxTabContext(tab) {
            if (tab.saved) {
                const c = ft[tab.groupId];
                return c && Array.isArray(c.sourceProfiles) && c.sourceProfiles.length >= 2 ? {
                    ids: (c.sourceIds || []).slice(),
                    profiles: c.sourceProfiles,
                    saved: !0
                } : null;
            }
            const ctx = sxCompareContext();
            return ctx && !ctx.saved && ctx.ids.join(",") === tab.ids.join(",") ? ctx : null;
        }
        function sxEmptyBuckets() {
            return [ {
                label: "Hot topics",
                count: 0,
                percent: 0,
                color: "var(--green)",
                topics: []
            }, {
                label: "Curiosity?",
                count: 0,
                percent: 0,
                color: "var(--curious)",
                topics: []
            }, {
                label: "Not topics",
                count: 0,
                percent: 0,
                color: "var(--red)",
                topics: []
            } ];
        }
        /* sxWouldBeBucket (PROVISIONAL promoted-bucket Teasers membership,
           2026-10-26): the bucket a teased FANTASY topic's ratings WOULD put
           it in. Fantasy topics never MOVE and are excluded from the bump,
           so no promoted bucket exists for them; this recomputes the pair
           outcome from the topic's raw ratings alone -- no notInterested
           mark override, no fantasy set-aside -- through the engine's own
           sxStance / sxRoute helpers and the pair's heats and shed floor,
           mirroring sxPairFromData's classification: a counting (non-shed)
           "full" fit means it would match Hot (0); any other counting fit
           means it would match Curious (1); no counting fit (clash,
           mutual-no, unknown, or all fits shed) means Not (-1), which
           renders no section. */
        function sxWouldBeBucket(rec, pair) {
            const heatA = pair && pair.heat ? pair.heat.a : 0, heatB = pair && pair.heat ? pair.heat.b : 0, F = pair ? pair.shedFloor || 0 : 0,
                sideOf = (rt, heat) => {
                    if (rt.single) {
                        const s = !(rt.giveKnown || rt.receiveKnown) ? "unknown" : rt.singleValue < 0 ? "against" : "curious";
                        return { give: s, receive: s };
                    }
                    const T = sxClamp(35 - heat, 0, 85);
                    return { give: sxStance(rt.give, rt.giveKnown, T), receive: sxStance(rt.receive, rt.receiveKnown, T) };
                },
                valOf = (rt, d) => rt.single ? rt.giveKnown || rt.receiveKnown ? rt.singleValue : null : rt[d + "Known"] ? rt[d] : null,
                sA = sideOf(rec.ratings.a, heatA), sB = sideOf(rec.ratings.b, heatB), fits = [];
            [ [ sA.give, valOf(rec.ratings.a, "give"), rec.ratings.a.single, sB.receive, valOf(rec.ratings.b, "receive"), rec.ratings.b.single ],
              [ sB.give, valOf(rec.ratings.b, "give"), rec.ratings.b.single, sA.receive, valOf(rec.ratings.a, "receive"), rec.ratings.a.single ] ].forEach(([gS, gV, gSingle, rS, rV, rSingle]) => {
                const r = sxRoute(gS, gV, gSingle, rS, rV, rSingle);
                r && "mutual-no" !== r.kind && "clash" !== r.kind && fits.push(r);
            });
            const counting = fits.filter(f => !(f.strength < F));
            return counting.length ? counting.some(f => "full" === f.kind) ? 0 : 1 : -1;
        }
        function sxBowtieBuckets(ctx, grp) {
            const isPair = 2 === ctx.profiles.length, mode = sxcv.mode;
            let g, y, r;
            if (isPair) {
                const lists = ("play" === mode ? grp.pairs[0].play : grp.pairs[0].conversation).lists;
                g = lists.matches, y = lists.curiousAbout, r = lists.mismatched;
            } else if ("play" === mode) {
                g = grp.play.lists.matches, y = grp.play.lists.curiousAbout, r = grp.play.lists.mismatched;
            } else {
                g = grp.conversation.lists.counted, y = [], r = grp.topics.filter(t => !t.groupLimited && t.relevantConvPairs > 0 && !t.conversationCounts);
            }
            // Display-layer MOVE, pair rings only: a non-fantasy teased topic
            // (teaserFor non-empty AND countClass exactly "soft-no") moves from
            // the red bucket to the yellow bucket. The shared register lists are
            // NOT mutated: new y/r arrays are computed for the ring feed below.
            // Engine outcomes, match lists, and group feeds are untouched.
            // Hot (g) is untouched.
            if (isPair) {
                y = [...y, ...r.filter(sxIsTeased)];
                r = r.filter(rec => !sxIsTeased(rec));
            }
            // Display-layer MOVE, group rings only: a non-fantasy topic teased for a
            // lowest-overall-kink-score member (pair-selected, countClass "soft-no")
            // moves from the red bucket to the yellow bucket. The shared register
            // lists are NOT mutated: new y/r arrays are computed for the ring feed
            // below. Engine outcomes, match lists, counted, and Kink Factor inputs
            // are untouched. Hot (g) is untouched.
            if (!isPair) {
                const lowest = sxLowestSet(grp.pairs, ctx.profiles).lowest;
                const isGroupTeased = rec => {
                    if (0 !== rec.flags.fantasyBy.length) return false;
                    return lowest.some(L => grp.pairs.some(pr => {
                        if (pr.i !== L && pr.j !== L) return false;
                        const t = pr.topicsById[rec.id];
                        if (!t) return false;
                        const owner = pr.i === L ? pr.a : pr.b;
                        return (t.teaserFor || []).includes(owner) && sxIsTeased(t);
                    }));
                };
                y = [...y, ...r.filter(isGroupTeased)];
                r = r.filter(rec => !isGroupTeased(rec));
            }
            const counts = [ g.length, y.length, r.length ], shares = uc(counts), labels = list => list.map(rec => rec.label), base = sxEmptyBuckets();
            /* Teasers sections membership follows the PROMOTED bucket
               (PROVISIONAL definition, owner-selected 2026-10-26, flagged
               for later revisit). The g/y/r lists read here are FINAL: the
               engine built them after the BUMP (curious-fit promoted to
               match inside sxPairFromData / the group scorer), and the
               display MOVEs above have already run, so bucketOf is the
               post-BUMP, post-MOVE bucket -- MOVE and BUMP compose by
               construction, in engine order (BUMP first, MOVE second), and
               a topic promoted by either lands in the section of the bucket
               it ends in. A NON-FANTASY teased topic takes the section of
               that final bucket (Hot 0 / Curiosity? 1); a topic that ends
               in Not (never MOVEd -- e.g. countClass not "soft-no" -- or in
               no list at all) gets no section, since sections never render
               on Not. A FANTASY teased topic never MOVEs and is excluded
               from the BUMP, so it takes the section of the bucket its
               ratings WOULD put it in (sxWouldBeBucket): Hot if it would
               match Hot, Curiosity? if it would match Curious, no section
               if it would land in Not. Fantasy rows sort A-Z in the same
               list as every other row -- no separate group, tailing, or
               marking. In groups the same rule applies per topic: the
               non-fantasy section reads the topic's final group bucket;
               the fantasy would-be is judged per teased pair and the topic
               joins each section a teased pair's would-be bucket gives it
               (no tie-break invented between pairs). Membership is NOT a
               filter of bucket records by teaserFor alone: the fantasy
               would-be computation is what keeps fantasy rows visible, and
               the Hot section is fed from the post-BUMP lists, not from
               pre-promotion outcomes. */
            const bucketOf = new Map();
            [ g, y, r ].forEach((list, i) => list.forEach(rec => bucketOf.set(rec.id, i)));
            const teasedHot = [], teasedCurious = [], seenTeasedHot = new Set(), seenTeasedCurious = new Set();
            const sxNoteTeased = (label, bucket) => {
                const list = 0 === bucket ? teasedHot : 1 === bucket ? teasedCurious : null, seen = 0 === bucket ? seenTeasedHot : seenTeasedCurious;
                list && !seen.has(label) && (seen.add(label), list.push(label));
            };
            if (isPair) {
                const pr = grp.pairs[0];
                pr.topics.forEach(rec => {
                    if (!(rec.teaserFor || []).length) return;
                    sxNoteTeased(rec.label, (rec.flags.fantasyBy || []).length ? sxWouldBeBucket(rec, pr) : bucketOf.get(rec.id));
                });
            } else grp.topics.forEach(rec => {
                const teasedPairs = grp.pairs.filter(pr => {
                    const t = pr.topicsById[rec.id];
                    return t && (t.teaserFor || []).length;
                });
                if (!teasedPairs.length) return;
                if ((rec.flags.fantasyBy || []).length) teasedPairs.forEach(pr => sxNoteTeased(rec.label, sxWouldBeBucket(pr.topicsById[rec.id], pr)));
                else sxNoteTeased(rec.label, bucketOf.get(rec.id));
            });
            teasedHot.sort((a, b) => a.localeCompare(b)), teasedCurious.sort((a, b) => a.localeCompare(b));
            return base.map((b, i) => ({
                ...b,
                count: counts[i],
                percent: shares[i],
                topics: labels([ g, y, r ][i]),
                teased: [ teasedHot, teasedCurious, [] ][i]
            }));
        }
        function sxRingsHtml(buckets) {
            const t = ea.glanceRadii, n = [ "Green", "Yellow", "Red" ], i = [ "green", "yellow", "red" ];
            return `<svg class="sx-match-rings" viewBox="0 0 1800 1240" role="group" aria-label="Match rings"><g class="center-glance-rings">${buckets.map((b, a) => `<g class="center-glance-ring"><circle class="center-glance-ring-track is-${i[a]}" cx="900" cy="620" r="${t[a]}"/><path class="center-glance-ring-value is-${i[a]}" data-sx-ring-path="${a}" data-ring-radius="${t[a]}" d="${ra(b.percent, t[a])}" style="opacity:${b.percent ? 1 : 0}"/><circle class="center-glance-ring-hit sx-ring-hit" data-sx-ring="${a}" cx="900" cy="620" r="${t[a]}" tabindex="0" role="button" aria-label="${Hi(b.label)}, ${b.percent} percent, ${b.count} ${1 === b.count ? "topic" : "topics"}. Open rating details."/></g>`).join("")}</g></svg>`;
        }
        function sxUpdateMatchRings(tab) {
            const host = tab && tab.section ? tab.section.querySelector("[data-sx-rings]") : null;
            if (!host) return;
            const buckets = tab.buckets || sxEmptyBuckets();
            if (!host.querySelector("svg")) return void (host.innerHTML = sxRingsHtml(buckets));
            buckets.forEach((b, a) => {
                const p = host.querySelector(`[data-sx-ring-path="${a}"]`), hit = host.querySelector(`[data-sx-ring="${a}"]`);
                p && (p.setAttribute("d", ra(b.percent, Number(p.dataset.ringRadius))), p.style.opacity = b.percent ? "1" : "0"), 
                hit && hit.setAttribute("aria-label", `${b.label}, ${b.percent} percent, ${b.count} ${1 === b.count ? "topic" : "topics"}. Open rating details.`);
            });
        }
        function sxToggleRingListing(tab, idx) {
            const host = tab && tab.section ? tab.section.querySelector("[data-sx-ring-listing]") : null;
            if (!host) return;
            const b = (tab.buckets || sxEmptyBuckets())[idx];
            if (!b) return;
            const names = [ "hot-topics", "curiosity", "not-topics" ], mine = names[idx];
            if (host.dataset.sxRingDisplay === mine) return host.innerHTML = "", void delete host.dataset.sxRingDisplay;
            host.dataset.sxRingDisplay = mine;
            const teaserSection = (0 === idx || 1 === idx) && b.teased && b.teased.length ? `<div class="sx-ring-teasers"><strong>Teasers</strong><ul>${b.teased.map(t => `<li><strong>${Hi(t)}</strong> — you're heated about this — a conversation point to raise gently, with an easy opt-out.</li>`).join("")}</ul></div>` : "";
            host.innerHTML = `<div class="sx-ring-listing"><div class="glance-ring-row" style="--ring-color:${b.color}"><span class="glance-ring-swatch" aria-hidden="true"></span><strong>${Hi(b.label)}</strong><span class="glance-ring-count">${b.count} ${1 === b.count ? "topic" : "topics"}</span><span class="glance-ring-percent">${b.percent}%</span></div>${b.topics && b.topics.length ? `<ul class="sx-ring-topics">${b.topics.map(t => `<li>${Hi(t)}</li>`).join("")}</ul>` : `<p class="sx-empty">No topics in this bucket.</p>`}${teaserSection}</div>`;
        }
        function sxBuildMatchSection(tab) {
            const stage = e.byId("sxMatchStage");
            if (!stage) return;
            const sec = document.createElement("div");
            sec.className = "sx-match-root", sec.dataset.sxMatchRoot = tab.key, sec.hidden = !0;
            // Match-view viewport (2026-10-26): the text window is replaced
            // by viewport chrome — the pair line is the content title, the
            // "Who's comparing?" picker stays, the rings carry the buckets
            // (topic lists live in the ring listing surface), and the
            // headline numbers live in the header Avatar rings. The hypermap itself,
            // in the map column below this chrome, is the viewport. The
            // legacy results assembly survives ONLY as the 4+-profile
            // group presentation (carve-out: no N-map layout is invented
            // for 4+); it stays hidden for 2- and 3-profile casts.
            sec.innerHTML = "circledot" === tab.kind ? `<div class="sx-pair-line" data-sx-pair-line="" hidden=""></div><div data-sx-picker=""></div><div class="sx-stamp" data-sx-stamp=""></div><div data-sx-rings=""></div><div data-sx-ring-listing=""></div>` : `<div class="sx-pair-line" data-sx-pair-line="" hidden=""></div><div data-sx-picker=""></div><div data-sx-rings=""></div><div data-sx-ring-listing=""></div><div class="sx-match-results" data-sx-legacy="" hidden=""></div>`;
            stage.appendChild(sec), tab.section = sec;
        }
        /* Straight bands (Job 2, ruled equal thirds over the per-topic
            straight range -20,000..+20,000): band index 0 = Debate band
            (sum <= -6,667), 1 = On-the-fence band (-6,666..+6,666),
            2 = Shop talk band (sum >= +6,667); -1 = no band. Membership is
            display-only, read off the straight register: shared topics with
            a non-null sum. Limit-blocked and one-sided/invisible topics are
            never banded; the register and the Job 1 list are untouched. */
        function sxStraightBandIdx(sum) {
            return null == sum ? -1 : sum >= 6667 ? 2 : sum <= -6667 ? 0 : 1;
        }
        function sxStraightBands(pair) {
            const lists = [ [], [], [] ];
            if (pair) pair.straight.topics.forEach(s => {
                if ("shared" !== s.status) return;
                const idx = sxStraightBandIdx(s.sum);
                idx >= 0 && lists[idx].push(s);
            });
            const bySum = (x, y) => (y.sum || 0) - (x.sum || 0) || x.label.localeCompare(y.label);
            return lists.forEach(l => l.sort(bySum)), lists;
        }
        function sxStraightBandBuckets(lists) {
            // Ring slots keep the crossed tab's slot order — positive band
            // on the green slot, middle on yellow, negative on red — while
            // the labels, counts, and topic lists are the bands' own.
            const ringOrder = [ 2, 1, 0 ], counts = ringOrder.map(i => lists[i].length), shares = uc(counts),
                names = [ "Shop talk band", "On-the-fence band", "Debate band" ], base = sxEmptyBuckets();
            return base.map((b, i) => ({
                ...b,
                label: names[i],
                count: counts[i],
                percent: shares[i],
                topics: lists[ringOrder[i]].map(s => s.label)
            }));
        }
        function sxRenderStraightTab(tab) {
            const ctx = sxTabContext(tab);
            sxRenderPairLine(tab, ctx);
            const pk = tab.section.querySelector("[data-sx-picker]");
            pk && (pk.innerHTML = sxPickerHtml());
            const st = tab.section.querySelector("[data-sx-stamp]");
            st && (st.textContent = ctx ? `Conversation · Heat: ${ctx.profiles.map((p, i) => `${p.name || `Profile ${i + 1}`} ${sxHeatZone(sxHeatFor(sxKey(ctx, i)))}`).join(" · ")}` : "");
            const pair = ctx && 2 === ctx.profiles.length ? sxPairCompute(ctx.profiles[0], ctx.profiles[1], {}) : null;
            const bandLists = sxStraightBands(pair);
            /* Banded Straight Talk list (Job 3): the Job 1 ranked list,
                split into the Job 2 band sections in ring order — Shop
                talk, On-the-fence, Debate — over the same shared,
                non-null-sum record set sxStraightBands returns (already
                sum-descending, ties by label). Debate topics join the
                list; limit-blocked and one-sided topics stay out. All
                three sections render for a pair, even when empty. */
            // Match-view viewport (2026-10-26): the banded text lists, the
            // listing seats, and the text Limits section are gone with the
            // text window. The straight bands surface through the rings
            // (sxStraightBandBuckets) and the ring listing surface only —
            // band membership still comes from sxStraightBands over the
            // straight register, unchanged.
            tab.buckets = sxStraightBandBuckets(bandLists), sxUpdateMatchRings(tab);
            /* Circledot score rings moved to the header Avatar (ruled
               2026-10-30): no score rings render in this seat — the
               header paint shows the same Parlay MS
               / Parlay KF for the active match
               tab through sxRingValuesForCast. The INTERIM / O3-finals
               status of those values is unchanged; only where they
               are painted moved. */
        }
        function sxRenderMatchTab(tab) {
            if (!tab || !tab.section) return;
            if ("circledot" === tab.kind) return void sxRenderStraightTab(tab);
            const ctx = sxTabContext(tab);
            sxCtx = ctx, sxRenderPairLine(tab, ctx);
            const pk = tab.section.querySelector("[data-sx-picker]"), rs = tab.section.querySelector(".sx-match-results");
            pk && (pk.innerHTML = sxPickerHtml());
            // 4+ carve-out: the legacy lists/rings presentation stays for
            // casts of four or more; 2- and 3-profile casts get the pure
            // viewport (rings + map), so the legacy host stays hidden.
            rs && (rs.hidden = !(ctx && ctx.profiles.length >= 4));
            if (!ctx) return rs && (rs.innerHTML = `<p class="sx-empty">Select two or more profiles to compare them here.</p>`), 
            void (tab.section.querySelector("[data-sx-ring-listing]") && (tab.section.querySelector("[data-sx-ring-listing]").innerHTML = `<p class="sx-empty">Select two or more profiles to compare them here.</p>`), tab.buckets = sxEmptyBuckets(), sxUpdateMatchRings(tab));
            sxRenderResults(!0);
        }
        function sxRenderActiveMatchTab() {
            const reg = sxTabsReg(), tab = reg.stageOn && reg.active ? reg.tabs.get(reg.active) : null;
            tab && sxRenderMatchTab(tab);
        }
        function sxRefreshMatchTabs() {
            sxRenderActiveMatchTab();
        }
        function sxSyncMatchStage() {
            const reg = sxTabsReg(), stage = e.byId("sxMatchStage"), col = e.one(".map-column"), on = !!(reg.stageOn && reg.active && reg.tabs.has(reg.active));
            // Match-view viewport (2026-10-26): the stage/map-column
            // inversion is reversed — a match tab SHOWS map content, so the
            // map column is never hidden by a match tab. The stage carries
            // only the viewport chrome above the map. With no tab active the
            // stage hides and the profile map stands exactly as before
            // (restore-exactly invariant preserved).
            // Match-tab fix (2026-10-26): while a ⋈ Krossmatch tab is the
            // active tab the stage stays HIDDEN — the bowtie text panel is
            // not shown at all, and opening the bowtie goes straight to the
            // pair viewport (the map in the column below, painted by
            // sxActivateMatchTab). Registry state (stageOn / active) is
            // untouched, so sxCurrentTab() still resolves and the pair
            // taper paint works exactly as before. ⊙ Straight Talk tabs
            // keep the stage exactly as before.
            const sxActiveTab = on ? reg.tabs.get(reg.active) : null, sxStageShown = on && !(sxActiveTab && "bowtie" === sxActiveTab.kind);
            stage && (stage.hidden = !sxStageShown), col && (col.hidden = !1), reg.tabs.forEach(tab => {
                tab.section && (tab.section.hidden = !(on && tab.key === reg.active));
            });
        }
        // Auto-create group on bowtie open (owner ruling, 2026-10-26):
        // opening a ⋈ comparison creates the group profile — the Save
        // click is gone, the saving is not. The auto-created group is a
        // normal profile in every path: it is minted by the same Zd
        // save, stored in the same vt/ft records, and flows through the
        // same persist (Sexcapades2xProfiles.getAll), export (Jf), and
        // tab Save (saveActiveProfile) code as any other profile. No
        // second-class group persistence path exists or is added here.
        function sxFindGroupForCast(ids, pairOp) {
            // Sameness, from the record: a cast's identical group is the
            // in-session group whose sourceIds are the same SET as the
            // cast (order-insensitive). sourceIds is the identity every
            // other group path already keys off (Kd, sxTabContext, Jd),
            // so this test is read straight from the group record.
            // Pair-kind discriminator (2026-10-27): a ⋈ pair and a ⊙
            // pair of the same cast share sourceIds and kind "group",
            // so sameness also requires the same pairOp. Records minted
            // before pairOp existed carry no pairOp and are bowtie
            // pairs — the default below preserves their dedup exactly,
            // and a ⊙ open can never select a ⋈ group (or vice versa).
            if (!ids || ids.length < 2) return null;
            const want = new Set(ids), wantOp = "straight" === pairOp ? "straight" : "bowtie";
            for (const id of Object.keys(ft)) {
                const rec = ft[id];
                if (!rec || "group" !== rec.kind || (rec.pairOp || "bowtie") !== wantOp || !vt[id] || !Array.isArray(rec.sourceIds)) continue;
                if (rec.sourceIds.length !== want.size) continue;
                if (rec.sourceIds.every(x => want.has(x))) return id;
            }
            return null;
        }
        function sxTeardownMatchTabs() {
            // The clean post-save teardown Zd performs: every match tab
            // is removed and the stage deactivated, so the screen that
            // remains is a profile's own map with no match chrome.
            const reg = sxTabsReg();
            reg.tabs.forEach(tb => {
                tb.section && tb.section.remove();
            }), reg.tabs.clear(), reg.active = null, reg.stageOn = !1, sxSyncMatchStage();
        }
        function sxAutoCreateBowtie(castIds, fresh) {
            const cast = (castIds || []).filter(id => vt[id]);
            if (cast.length < 2) return !1;
            // Fork rule (owner ruling, 2026-10-27): a bowtie TAP always
            // mints a fresh bowtie tab from whatever is currently
            // multi-selected, whether or not any settings changed —
            // taps never dedup. Only reopen/restore (sxActivateMatchTab)
            // selects the existing tab, via fresh being unset.
            const existing = fresh ? null : sxFindGroupForCast(cast, "bowtie");
            // Identical group already in-session: select it, never mint
            // a duplicate. Js is the ordinary profile switch, so the
            // landing is the group's own tab and map.
            if (existing) return sxTeardownMatchTabs(), Js(existing), !0;
            // Creation IS the save: run the exact Zd save the removed
            // controls used to trigger, with the cast pinned in qd so
            // Zd saves this cast (never a drifted selection) and in
            // Play mode so Rd's save stamp matches a manual ⋈ save.
            return sxcv.mode = "play", qd = cast.slice(), Zd();
        }
        // Straight parity (owner ruling, 2026-10-27): opening ⊙ for a
        // pair auto-creates (or selects) a persistent R ⊙ S group
        // profile, exactly the sxAutoCreateBowtie shape — find-or-mint
        // through the same Zd save, the same teardown, and the same
        // ordinary Js landing — differing only in pair kind (the ⊙
        // title join and pairOp record), in mode (Conversation, where
        // bowtie mints in Play), and in the map compute (Rd dispatches
        // straight pairs to the straight-register adapter). Straight
        // auto-create is pair-only: a cast of 3+ returns false and
        // the open falls through to the legacy ⊙ tab, as before —
        // whose header now shows the group Parlay aggregates from
        // sxGroupCompute (group-Parlay fix, 2026-10-30).
        function sxAutoCreateStraight(castIds, fresh) {
            const cast = (castIds || []).filter(id => vt[id]);
            if (2 !== cast.length) return !1;
            // Fork rule (owner ruling, 2026-10-27): a circle-dot TAP
            // always mints a fresh straight tab — taps never dedup.
            // Reopen/restore selects the existing tab (fresh unset).
            const existing = fresh ? null : sxFindGroupForCast(cast, "straight");
            // Identical straight pair already in-session: select it,
            // never mint a duplicate — in Conversation mode, the ⊙
            // register, on both the mint and the re-open landing.
            if (existing) return sxTeardownMatchTabs(), sxcv.mode = "conversation", Js(existing), !0;
            return sxcv.mode = "conversation", qd = cast.slice(), Zd("straight");
        }
        function sxOpenMatchTab(kind) {
            const ctx = sxCompareContext();
            if (!ctx) return;
            // ⋈ and ⊙: opening auto-creates (or selects) the pair
            // group and lands on its profile tab — no match tab is
            // minted. If the cast cannot be saved (fewer than two live
            // profiles, or a ⊙ cast that is not exactly a pair), fall
            // through to the legacy tab so the open is never a dead
            // end.
            if ("bowtie" === kind && sxAutoCreateBowtie(ctx.ids, !0)) return;
            if ("circledot" === kind && sxAutoCreateStraight(ctx.ids, !0)) return;
            const reg = sxTabsReg(), key = kind + "|" + (ctx.saved ? "group:" + Mt : ctx.ids.join(","));
            let tab = reg.tabs.get(key);
            tab || (tab = {
                key: key,
                kind: kind,
                saved: ctx.saved,
                groupId: ctx.saved ? Mt : null,
                ids: ctx.ids.slice(),
                section: null,
                buckets: null
            }, reg.tabs.set(key, tab), sxBuildMatchSection(tab));
            sxActivateMatchTab(key, !1);
        }
        function sxActivateMatchTab(key, focus) {
            const reg = sxTabsReg(), tab = reg.tabs.get(key);
            if (!tab) return;
            // ⋈ and ⊙: activating a match tab (e.g. its pill in the
            // tab strip) is also an open — auto-create/select the pair
            // group and land on the group tab instead of showing the
            // match view. A saved tab's ids are its group's sourceIds,
            // so the same sameness test selects that very group. (A ⊙
            // tab only exists for casts the pair auto-create declined
            // — 3+ profiles — and those activate exactly as before.)
            if ("bowtie" === tab.kind && sxAutoCreateBowtie(tab.ids)) return;
            if ("circledot" === tab.kind && sxAutoCreateStraight(tab.ids)) return;
            // Mode follows the tab (2026-10-26): ⋈ Krossmatch activates in
            // Play, ⊙ Straight Talk in Conversation. There is no in-tab
            // mode switch anymore.
            sxcv.mode = "circledot" === tab.kind ? "conversation" : "play";
            // Match-tab fix (2026-10-26): activation PAINTS the map —
            // the tab-strip path previously rendered chrome only, so the
            // map kept whatever the last paint produced (the blank area
            // in the owner's session). This mirrors the picker path's
            // repaint (Jw + Mr below), so the pair viewport is on screen
            // immediately when the tab opens.
            reg.active = key, reg.stageOn = !0, sxSyncMatchStage(), sxRenderMatchTab(tab), Jw(), Mr({
                animate: !1
            });
            if (focus) {
                const esc = window.CSS && CSS.escape ? CSS.escape(key) : key, b = tl.querySelector(`[data-sx-match-tab-btn="${esc}"]`);
                b && b.focus({
                    preventScroll: !0
                });
            }
        }
        function sxCloseMatchTab(key) {
            const reg = sxTabsReg(), tab = reg.tabs.get(key);
            if (!tab) return;
            tab.section && tab.section.remove(), reg.tabs.delete(key), reg.active === key && (reg.active = null, 
            reg.stageOn = !1), sxSyncMatchStage(), Jw(), Mr({ animate: !1 });
        }
        function sxDeactivateMatchStage() {
            const reg = sxTabsReg();
            reg.stageOn && (reg.stageOn = !1, sxSyncMatchStage());
        }
        function sxRekeyActiveMatchTab() {
            const reg = sxTabsReg(), tab = reg.active ? reg.tabs.get(reg.active) : null;
            if (!tab || tab.saved) return;
            const ctx = sxCompareContext();
            if (!ctx || ctx.saved) return;
            const nk = tab.kind + "|" + ctx.ids.join(",");
            tab.ids = ctx.ids.slice();
            nk !== tab.key && (reg.tabs.delete(tab.key), tab.key = nk, tab.section && (tab.section.dataset.sxMatchRoot = nk), 
            reg.tabs.set(nk, tab), reg.active = nk);
        }
        function sxBuzzSound() {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                sxAudio = sxAudio || new AC;
                "suspended" === sxAudio.state && sxAudio.resume();
                const t0 = sxAudio.currentTime;
                [ 0, .3 ].forEach(off => {
                    const o = sxAudio.createOscillator(), g = sxAudio.createGain();
                    o.type = "square", o.frequency.value = 155, g.gain.setValueAtTime(.1, t0 + off), g.gain.exponentialRampToValueAtTime(.001, t0 + off + .24),
                    o.connect(g), g.connect(sxAudio.destination), o.start(t0 + off), o.stop(t0 + off + .26);
                });
            } catch (err) { __sxErrLog("sx-buzz-sound", err); }
        }
        function sxMaybeBuzz(ctx, grp) {
            if ("play" !== sxcv.mode) return;
            const nonLive = grp.pairs.filter(pr => !pr.live);
            if (!nonLive.length) return;
            const keyOf = pr => [ sxKey(ctx, pr.i), sxKey(ctx, pr.j) ].sort().join("|"), fresh = nonLive.filter(pr => !sxBuzzFired.has(keyOf(pr)));
            if (!fresh.length) return;
            nonLive.forEach(pr => sxBuzzFired.add(keyOf(pr))), sxBuzzTarget = fresh[0], sxBuzzSound();
            try { navigator.vibrate && navigator.vibrate([ 130, 60, 130 ]); } catch (err) { __sxErrLog("sx-buzz-vibrate", err); }
            const dlg = e.byId("sxBuzzerDialog");
            dlg && !dlg.open && Wi(dlg);
        }
        const sxStageEl = e.byId("sxMatchStage");
        if (sxStageEl) {
            sxStageEl.addEventListener("click", ev => {
                const pk = ev.target.closest("[data-sx-pick]");
                if (pk) {
                    const id = pk.dataset.sxPick;
                    if (!vt[id]) return;
                    sxSel(id, "toggle");
                    qd = [], Wd = null, sxRekeyActiveMatchTab(), Jw(), Mr({
                        animate: !1
                    }), sxRenderActiveMatchTab();
                    const esc = window.CSS && CSS.escape ? CSS.escape(id) : id, nb = sxStageEl.querySelector(`[data-sx-pick="${esc}"]`);
                    nb && nb.focus({
                        preventScroll: !0
                    });
                    return;
                }
                if (ev.target.closest("[data-sx-save-group]")) return void Zd();
                const ring = ev.target.closest("[data-sx-ring]");
                if (ring) {
                    const host = ring.closest("[data-sx-match-root]"), tab = host && sxTabsReg().tabs.get(host.dataset.sxMatchRoot);
                    tab && sxToggleRingListing(tab, Number(ring.dataset.sxRing));
                }
            });
        }
        // Auto-create (2026-10-26): the map-view "Save as group profile"
        // overlay from the match-tab fix is REMOVED. Opening a ⋈
        // comparison now saves by opening (sxAutoCreateBowtie), so the
        // group it lands on is already saved and a save control on that
        // view would be redundant. Zd remains, called only by
        // sxAutoCreateBowtie and (for pairs) sxAutoCreateStraight; no
        // surface renders a save-as-group control.
        const sxDlgEl = e.byId("sxBuzzerDialog");
        if (sxDlgEl) {
            e.byId("sxBuzzerProceed").addEventListener("click", () => Ui(sxDlgEl));
            e.byId("sxBuzzerConversation").addEventListener("click", () => {
                // Mode follows the tab (2026-10-26): the buzzer's escape no
                // longer sets the mode directly — it routes through tab
                // activation by opening the ⊙ tab for the current cast,
                // whose activation sets Conversation. Fallback (no cast
                // context): set the mode and re-render, as before.
                Ui(sxDlgEl);
                const before = sxTabsReg().active;
                sxOpenMatchTab("circledot");
                (sxTabsReg().active === before || !sxTabsReg().stageOn) && (sxcv.mode = "conversation", sxRenderActiveMatchTab());
            });
            e.byId("sxBuzzerEdit").addEventListener("click", () => {
                Ui(sxDlgEl);
                if (!sxCtx || !sxBuzzTarget) return;
                const id = [ sxCtx.ids[sxBuzzTarget.i], sxCtx.ids[sxBuzzTarget.j] ].find(x => x && vt[x]);
                id && bw(id);
            });
        }
        // Leniency removal (owner ruling, 2026-10-27): the leniency
        // setter (Yd) and its throttled rAF handler (Xd) are REMOVED
        // entirely, and the compare leniency variable is gone with
        // them — no computation reads, carries, or stores a leniency
        // value anymore (Dd's adapter slot is passed null at every
        // call site; the engines never read it). No live control ever
        // called the setter/handler — the only remaining caller was
        // the Scribe fallback in Jd, redesigned below to carry no
        // recompute side effect. What survives is display only: a
        // legacy group's stored field can still seed the Scribe
        // brief's displayed cast value in Jd, and the writers keep
        // their displayed cast number — neither is an input to any
        // computation.
        // A Krossmatch or Straight map uses the same shared expand sets
        // as every profile. Opening one shows the full tree, the way an
        // ordinary profile does. The sets from before that open are held
        // and put back when a non-group profile is activated, so the
        // profiles that went into the match are unchanged.
        let sxExpandHold = null;
        function sxHoldExpansion() {
            if (sxExpandHold) return;
            sxExpandHold = {
                rn: [ ...rn ],
                on: [ ...on ],
                un: new Map(un),
                kn: kn,
                xn: xn,
                Lt: Lt,
                Nt: Nt
            };
        }
        function sxReleaseExpansion() {
            if (!sxExpandHold) return;
            const s = sxExpandHold;
            sxExpandHold = null;
            rn.clear(), s.rn.forEach(e => rn.add(e));
            on.clear(), s.on.forEach(e => on.add(e));
            un.clear(), s.un.forEach((v, k) => un.set(k, v));
            kn = s.kn, xn = s.xn, Lt = s.Lt, Nt = s.Nt;
        }
        function sxExpandGroupMap() {
            kn = !0, xn = null, Lt = null, Nt = null, rn.clear(), on.clear(), h.forEach(e => {
                rn.add(e.name), un.set(catId(e.name), "all"), (e.subcategories || []).forEach(t => {
                    const s = Un(e.name, t.name);
                    un.set(s, "all"), mn.expandAll && on.add(s);
                }), e.topics.forEach(t => {
                    const s = Wn(t);
                    un.set(s, "all"), mn.expandAll && on.add(s);
                });
            });
        }
        function Zd(pairOp) {
            // Pair kind (2026-10-27): "straight" mints a ⊙ pair; every
            // other call is the original bowtie mint, unchanged. The
            // kind drives the name join below (⋈ vs ⊙), the pairOp
            // field on the group record, and — through that field —
            // Rd's compute dispatch.
            const sxPairOp = "straight" === pairOp ? "straight" : "bowtie";
            const t = (qd.length ? qd : Xi()).filter(e => vt[e]);
            if (t.length < 2) return !1;
            const n = t.map(e => ({
                name: wt[e],
                ratings: Pd(vt[e]),
                annotations: Pd(Qe[e]),
                fantasyOnly: Pd(Je[e]),
                alreadyTried: Pd(et[e]),
                importedChildren: Pd(at[e]),
                genders: bb(rt[e]),
                orientations: iv(ot[e]),
                veil: av(vpt[e]),
                veilEnabled: Boolean(vht[e]),
                net: av(vpt[e]),
                netEnabled: Boolean(vht[e])
            })), i = function(e) {
                const t = e.map(e => String(wt[e] || "").trim()), n = t.map(e => (e.match(/[\p{L}\p{N}]/u) || [ "?" ])[0].toLocaleUpperCase()), i = new Set(n).size < n.length;
                return t.map((e, t) => i ? e.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).replace(/^./u, e => e.toLocaleUpperCase()) || n[t] : n[t]).join("straight" === sxPairOp ? " ⊙ " : " ⋈ ").slice(0, 40);
            }(t);
            // Duplicate names (owner ruling, 2026-10-27): a forked pair
            // keeps the CLEAN feeder name — no version suffix is baked
            // into the underlying group profile name. Identity rides the
            // internal id (ik disambiguates ids), and same-name tabs are
            // told apart by a display-only "-2"/"-3" suffix on the tab
            // label (see sxDupTabLabel in Jw).
            const a = i, o = ik(a);
            // Match-tab fix (2026-10-26): saving CLOSES the match view.
            // Every match tab is torn down and the stage deactivated
            // before the strip rebuilds below, so post-save the screen is
            // the new group profile's own map with the group as the
            // active profile — no match chrome left on screen (the old
            // code left the tab active and visible, which made the new
            // group tab a guaranteed no-op click and read as being
            // trapped on the comparison tab). The teardown is shared
            // with the auto-create select-existing path.
            sxTeardownMatchTabs();
            return vt[o] = {}, Ze[o] = {}, Qe[o] = {}, Je[o] = {}, et[o] = {}, tt[o] = {}, at[o] = {}, 
            gt[o] = {}, mt[o] = {}, wt[o] = a, rt[o] = [ "couple" ], ot[o] = [ "mixed" ], st[o] = [], 
            lt[o] = "", ct[o] = "", dt[o] = [], ut[o] = {}, pz[o] = "", nt[o] = "", it[o] = "", vpt[o] = 50, 
            vht[o] = !1, ft[o] = {
                kind: "group",
                pairOp: sxPairOp,
                sourceIds: t.slice(),
                sourceNames: t.map(e => wt[e]),
                sourceProfiles: n,
                percent: 0,
                things: 0,
                clicks: 0,
                limits: 0,
                matchDetails: {},
                results: {
                    matches: [],
                    curiousAbout: [],
                    mismatched: []
                }
            }, Rd(o), la(o), Mt = o, It = o, sxSel(null, "clear"), qd = [], Wd = null, sxHoldExpansion(), sxExpandGroupMap(), 
            // Save marking (2026-10-26): Rd marks EVERY recompute dirty
            // (zt at its tail) — that recompute-marking, not the save
            // itself, is why a freshly saved group tab still read
            // "unsaved changes" live. Zd IS the save (and, since
            // auto-create, creation and save are the same act), so the
            // new group must not arrive marked by its own creation: the
            // flag is cleared here, the same end state saveActiveProfile
            // leaves via Vt. It is cleared directly rather than through
            // Vt so the draft-autosave timer Rd's zt queued — the
            // Remember-on-this-device persist path — still fires and
            // persists the group like any other profile; that timer's
            // own Vt then finishes the cleanup. Later edits re-mark
            // through zt as usual.
            delete yt[o], Gt(), Jw(), Mr(), Ih(), !0;
        }
        function Qd(t) {
            const i = t[0];
            if (!i || !vt[i]) return;
            scribeCastIds = t.slice(), scribeLeadId = i;
            const castText = t.filter(e => vt[e]).map(e => rd(e)).join(" + ");
            if (e.byId("scribeChoiceProfiles")) e.byId("scribeChoiceProfiles").textContent = castText;
            if (e.byId("scribeProfiles")) e.byId("scribeProfiles").textContent = castText;
            scribePartnerId = 2 === t.length ? t[1] : null;
            const a = t.filter(e => vt[e]).length > 1, o = e.byId("scribeModeDescription"), s = e.byId("scribeChoiceIntro"), l = e.byId("generateScribePrompt"), c = e.byId("scribeLengthUnit"), d = e.byId("scribePageCountHelp");
            o && (o.textContent = a ? "Scribe turns your selected profiles into a Literotica-style erotic story featuring all partners’ shared desires and dynamics. For a practical play checklist and negotiation guide, use Scene Setter." : "One profile creates a Literotica-style erotic story for fantasy and enjoyment—not a real-world plan. For a practical play checklist and negotiation guide, use Scene Setter."),
            c && (c.disabled = !1), d && (d.textContent = "Story length in word count, paragraphs, pages, or chapters. Enter one number or a range; blank defaults to 1 page."),
            s && (s.textContent = a ? "Multiple profiles selected: Scribe will create a Literotica-style erotic Story featuring all selected partners." : "One profile selected: Scribe will create a Literotica-style erotic Story."),
            l && (l.textContent = "Prompt"), kg.open && Ui(kg),
            Sg.open && Ui(Sg), Oc.open && Ui(Oc), jc.open && Ui(jc), Wi(Bc);
        }
        function Jd(e) {
            const t = Xi(), n = t[0] || Mt;
            if (!n || !vt[n]) return;
            const i = 1 === t.length && "group" === ft[n]?.kind ? ft[n] : null, a = i && Array.isArray(i.sourceIds) ? i.sourceIds.filter(e => vt[e]) : [], r = a.length >= 2 ? a : t.length ? t.slice() : [ n ];
            // Scribe fallback, redesigned (owner ruling, 2026-10-27):
            // this state CAN still occur through the button doorway —
            // the multi-select set (Yi) can hold two or more profiles
            // while Xi() resolves to fewer than two (the selection is
            // not the active comparison, e.g. the overlay was toggled
            // off after selecting). The old route called the leniency
            // setter, which recomputed the active pair as a side
            // effect of merely opening Scribe, then retried. The retry
            // now resolves the cast straight from the live multi-select
            // and opens the Scribe choice directly — no recompute, no
            // recursion, no side effect.
            if (r.length < 2 && Yi().length >= 2) return sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = Yi().filter(e => vt[e]), void Qd(sxCompareIds);
            if (r.length < 1) return void tS("Scribe needs at least 1 profile in the multi-select. Select a profile tab — Ctrl+click (Cmd+click on Mac) profile tabs to build a multi-select — then open Scribe again.", {
                tone: "error",
                persistent: !0
            });
            if (a.length >= 2) return sxGroupLeniency = Number.isFinite(Number(i.leniency)) ? Number(i.leniency) : 50, sxWriterLeniency = sxGroupLeniency, void Qd(r);
            sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = r.slice(), Qd(r);
        }
        function eu(e, t, n, i, a, r, o = 99) {
            const s = String(t || "").split(/\s+/), l = [];
            let c = "";
            return s.forEach(t => {
                const n = c ? c + " " + t : t;
                e.measureText(n).width > a && c ? (l.push(c), c = t) : c = n;
            }), c && l.push(c), l.slice(0, o).forEach((t, a) => e.fillText(t + (a === o - 1 && l.length > o ? "…" : ""), n, i + a * r)), 
            i + Math.min(l.length, o) * r;
        }
        function tu(e) {
            const t = new Set;
            return h.forEach(n => {
                if (!Ma(n, e)) return;
                const i = catId(n.name);
                let a = !1;
                n.topics.forEach(n => {
                    const i = Wn(n);
                    if (ja(i, e)) return;
                    const r = t => ui(t, e) || Boolean(Qe[e]?.[t]) || Boolean(Je[e]?.[t]) || Boolean(et[e]?.[t]) || Boolean(tt[e]?.[t]?.length), o = ai(i, e).filter(t => r(t) && !ja(t, e));
                    (r(i) || o.length) && (t.add(i), o.forEach(e => t.add(e)), a = !0);
                }), a && t.add(i);
            }), !t.size && Bi(e) && h.forEach(e => t.add(catId(e.name))), t;
        }
        // F8 companion note (sharing-sync refactor): nu performs the
        // same solo-switch / collect / restore shape as the export
        // opener Jf — it snapshots the selection state at entry,
        // switches the live map to solo, collects, and restores
        // inline at the end. Checked during the F8 pass: the restore
        // here is inline and NOT wrapped in try/finally, and the
        // guard was deliberately NOT generalized from Jf to nu in
        // that pass (Jf's comment records the decision). Any future
        // hardening of this pattern should cover both sites or
        // neither, and say which.
        async function nu(t, n, i = {}) {
            const a = Yi(), r = [ ...rn ], o = [ ...on ], s = new Map(un), l = Lt, c = Nt, d = Mt, u = It, p = Pt, g = Tt, m = $n, f = En, y = Boolean(i.profileFill), b = Math.max(.25, Math.min(1, Number(i.outputScale) || 1)), v = Math.max(320, Number(i.outputWidth) || (y ? 3600 : 1800)), w = Math.max(320, Number(i.outputHeight) || (y ? 3600 : 1240)), k = Math.round(v * b), x = Math.round(w * b);
            n && vt[n] && (Mt = n, It = n), Pt = "all", Tt = "", sxSel(t, "set"), 
            t.length < 2 && sxSel(null, "clear"), rn.clear(), r.forEach(e => rn.add(e)), on.clear(), o.forEach(e => on.add(e)),
            Lt = null, Nt = null, En = !1;
            const S = i.allowedIds instanceof Set ? new Set(i.allowedIds) : new Set(Array.isArray(i.allowedIds) ? i.allowedIds : []);
            i.allowedIds || t.forEach(e => tu(e).forEach(e => S.add(e))), S.forEach(e => {
                const t = qn[e] || Xn(e) || (at[n] || {})[e];
                t?.parentId && (on.add(t.parentId), un.set(t.parentId, "all"));
            }), $n = S, Mr({
                animate: !1
            });
            const $ = function(e, t = !1, n = !1) {
                const i = ".direction-hit,.rating-rail,.rating-track-hit,.slider-thumb,.rating-clear,.concept-hit,.center-hit,.topic-pulse";
                let a = 1 / 0, r = 1 / 0, o = -1 / 0, s = -1 / 0;
                const l = In.getCTM();
                if (l) {
                    let t = null;
                    try {
                        t = l.inverse();
                    } catch (e) { __sxErrLog("matrix-inverse", e); }
                    t && In.querySelectorAll("path,text,circle,ellipse,rect,line,polyline,polygon,image,use").forEach(e => {
                        if (e.matches(i) || __sxClosestAction(e, "hiddenState") || __sxClosestAction(e, i)) return;
                        const n = getComputedStyle(e), l = Number(n.opacity);
                        if ("none" !== n.display && "hidden" !== n.visibility && 0 !== l && ("none" !== n.fill && "rgba(0, 0, 0, 0)" !== n.fill && "transparent" !== n.fill || "none" !== n.stroke && "rgba(0, 0, 0, 0)" !== n.stroke && "transparent" !== n.stroke)) try {
                            const n = e.getBBox(), i = e.getCTM();
                            if (!i || !Number.isFinite(n.x) || !Number.isFinite(n.y) || n.width < 0 || n.height < 0) return;
                            const l = t.multiply(i);
                            [ [ n.x, n.y ], [ n.x + n.width, n.y ], [ n.x, n.y + n.height ], [ n.x + n.width, n.y + n.height ] ].forEach(([e, t]) => {
                                const n = new DOMPoint(e, t).matrixTransform(l);
                                a = Math.min(a, n.x), r = Math.min(r, n.y), o = Math.max(o, n.x), s = Math.max(s, n.y);
                            });
                        } catch (e) { __sxErrLog("app", e); }
                    });
                }
                if (!Number.isFinite(a) || !Number.isFinite(r) || !Number.isFinite(o) || !Number.isFinite(s) || o <= a || s <= r) try {
                    const e = In.getBBox();
                    a = e.x, r = e.y, o = e.x + e.width, s = e.y + e.height;
                } catch (e) {
                    a = -1100, r = -758, o = 2900, s = 1998;
                }
                const c = t ? 72 : 70;
                a -= c, o += c, r -= c, s += c;
                let d = Math.max(1, o - a), u = Math.max(1, s - r);
                if (n) {
                    const t = pr.centerX, n = pr.centerY, i = Math.max(t - a, o - t), l = Math.max(n - r, s - n);
                    d = Math.max(2 * i, 2 * l * e), u = d / e, a = t - d / 2, r = n - u / 2;
                } else if (d / u < e) {
                    const t = u * e;
                    a -= (t - d) / 2, d = t;
                } else {
                    const t = d / e;
                    r -= (t - u) / 2, u = t;
                }
                return `${a.toFixed(1)} ${r.toFixed(1)} ${d.toFixed(1)} ${u.toFixed(1)}`;
            }(k / x, !0, Boolean(i.centerOnMap)), E = y ? " .topic-stem:not(.no-hanky-code-line){stroke-width:10px} .node-group.import-added .topic-stem:not(.no-hanky-code-line),.node-group.import-updated .topic-stem:not(.no-hanky-code-line){stroke-width:20px} .node-group.import-newest .topic-stem:not(.no-hanky-code-line){stroke-width:28px}" : "", A = Cn.cloneNode(!0), C = document.createElementNS("http://www.w3.org/2000/svg", "style");
            C.textContent = Array.from(e.all("style")).map(e => e.textContent).join(" ") + " #mapSvg{background:" + ("transparent" === i.background ? "transparent" : "white" === i.background ? "#ffffff" : "#151816") + "} #mapSvg .node-group .topic-pulse{display:none} .node-group.import-added .topic-stem,.node-group.import-updated .topic-stem{animation:none;opacity:1;stroke:var(--profile-color,var(--focus));stroke-width:10px;filter:drop-shadow(0 0 7px var(--profile-color,var(--focus)))} .node-group.import-added .node-label-underline,.node-group.import-updated .node-label-underline{animation:none;opacity:1;stroke:var(--profile-color,var(--focus));stroke-width:5px;filter:drop-shadow(0 0 7px var(--profile-color,var(--focus)))} .node-group.import-newest .topic-stem{animation:none;opacity:1;stroke:var(--profile-color,var(--focus));stroke-width:14px;filter:drop-shadow(0 0 8px var(--profile-color,var(--focus)))} .node-group.import-newest .node-label-underline{animation:none;opacity:1;stroke:var(--profile-color,var(--focus));stroke-width:7px;filter:drop-shadow(0 0 8px var(--profile-color,var(--focus)))} #mapSvg .node-group>.branch-icon,#mapSvg .node-group>.topic-icon{display:inline;visibility:visible;opacity:1} .favorite-halo,.limit-halo{animation:none;opacity:.3}" + E;
            try {
                var M = document.createElementNS("http://www.w3.org/2000/svg", "style"), I = getComputedStyle(document.documentElement), P = ":root{";
                [ "--panel", "--ink", "--focus", "--profile-color", "--muted", "--paper" ].forEach(function(e) {
                    var t = I.getPropertyValue(e).trim();
                    t && (P += e + ":" + t + ";");
                }), P += "}", M.textContent = P, A.insertBefore(M, A.firstChild);
            } catch (e) { __sxErrLog("svg-style-inject", e); }
            A.insertBefore(C, A.firstChild), A.setAttribute("xmlns", "http://www.w3.org/2000/svg"), 
            A.setAttribute("viewBox", $), A.setAttribute("preserveAspectRatio", "xMidYMid meet"), 
            A.setAttribute("width", String(k)), A.setAttribute("height", String(x)), A.style.background = "transparent" === i.background ? "transparent" : "white" === i.background ? "#ffffff" : "#151816";
            const L = A.querySelector("#viewport");
            L && L.removeAttribute("transform");
            const [T, F, N, _] = $.split(/\s+/).map(Number), D = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            D.setAttribute("x", String(T)), D.setAttribute("y", String(F)), D.setAttribute("width", String(N)), 
            D.setAttribute("height", String(_)), "transparent" !== i.background && (D.setAttribute("fill", "white" === i.background ? "#ffffff" : "#151816"), 
            A.insertBefore(D, L || A.firstChild)), i.displayName && function(e, t) {
                e.querySelectorAll(".center-name-arc-text textPath").forEach(e => {
                    e.textContent = Ji(t);
                });
            }(A, i.displayName), i.nativeTooltips && function(t, n, i = {}) {
                if (!t || !n || !vt[n]) return;
                const a = (e, t) => {
                    if (!e || !t) return;
                    Array.from(e.children || []).filter(e => "title" === e.localName).forEach(e => e.remove());
                    const n = document.createElementNS("http://www.w3.org/2000/svg", "title");
                    n.textContent = String(t).trim(), e.insertBefore(n, e.firstChild);
                }, r = e => qn[e] || Xn(e) || (at[n] || {})[e] || li().find(t => t.id === e), o = (e, t) => String(t?.querySelector(".category-label,.map-label")?.textContent || r(e)?.label || e || "Topic").trim();
                t.querySelectorAll(".node-group[data-layout-key]").forEach(e => {
                    const t = e.getAttribute("data-layout-key"), i = o(t, e), s = r(t);
                    if (!t || !i) return;
                    const l = Pa(t, n), c = [ i, `Give: ${l.giveKnown ? Math.round(l.give) : "unrated"} · Receive: ${l.receiveKnown ? Math.round(l.receive) : "unrated"}` ];
                    s && c.push(lo(s));
                    const d = [], u = Oa(t, n);
                    "favorite" === u ? d.push("Favorite") : "limit" === u ? d.push("Hard Limit") : "notinterested" === u && d.push("Not Interested"), 
                    Boolean(Je[n]?.[t]) && d.push("Fantasy-only"), Boolean(et[n]?.[t]) && d.push("Already Tried"), 
                    Boolean(tt[n]?.[t]?.length) && d.push("Has note"), d.length && c.push(d.join(" · ")), 
                    a(e, c.join("\n"));
                }), t.querySelectorAll(".direction-control[data-id][data-direction]").forEach(e => {
                    const t = e.getAttribute("data-id"), i = e.getAttribute("data-direction");
                    if (!t || !i || "group" === i) return;
                    const s = da(t, n), l = Boolean(s[i + "Known"]), c = l ? Math.round(s[i]) : "unrated", d = r(t), u = o(t, e), p = Jn(t, i), h = Zn(t, i), g = l && s[i + "Derived"] ? ` · rolled up from ${s[i + "RatedChildren"]} of ${s.childCount} child topics` : "";
                    a(e, `${d?.label || u} · ${p}${h ? ` ${h}` : ""}: ${c}${g}`);
                });
                const s = t.querySelector(".center-hit"), l = s && s.parentElement;
                if (l) {
                    const e = dc(n), r = na([ n ]), o = sxRingValuesForProfile(sxProfileById(n)), s = String(t.querySelector(".center-name-arc-text textPath,.center-label")?.textContent || i.displayName || "Profile").trim(), c = (e.green.length, 
                    e.yellow.length, e.red.length, [ s, `${r.percent}% filled · ${r.rated} of over 400 topics rated`, `Want to do: ${e.percentages.green}% (${e.green.length} ${1 === e.green.length ? "topic" : "topics"}) · Curious about: ${e.percentages.yellow}% (${e.yellow.length}) · No: ${e.percentages.red}% (${e.red.length})`, `Charted: ${sxPctText(o?.outer)}` ]);
                    if (i.includeProfileInfo) {
                        const e = String(nt[n] || "").trim(), t = String(it[n] || "").trim();
                        e && c.push(`About Me: ${e}`), t && c.push(`Terms: ${t}`);
                    }
                    a(l, c.join("\n"));
                }
                t.querySelectorAll(".center-glance-ring").forEach((t, n) => {
                    const i = t.querySelector("[data-center-glance-index]"), r = pc[Number(i?.getAttribute("data-center-glance-index") ?? n)];
                    if (!r) return;
                    const o = e.byId(r.sourceId)?._glanceTooltip, s = [ `${r.label}: ${r.percent}% · ${r.count} ${1 === r.count ? "topic" : "topics"}` ], l = Array.isArray(o?.rows) ? o.rows : [], c = l.length ? l.map(e => {
                        const t = [];
                        return e.giveKnown && t.push(`give ${Math.round(e.give)}`), e.receiveKnown && t.push(`receive ${Math.round(e.receive)}`), 
                        `${e.label}${t.length ? ` — ${t.join(", ")}` : ""}`;
                    }) : Array.isArray(o?.labels) ? o.labels : [];
                    c.length ? s.push(c.join("\n")) : o?.text && s.push(o.text), a(t, s.join("\n"));
                });
            }(A, n, i);
            const R = (new XMLSerializer).serializeToString(A);
            Mt = d, It = u, Pt = p, Tt = g, $n = m, En = f, sxSel(a, "set"), 
            rn.clear(), r.forEach(e => rn.add(e)), on.clear(), o.forEach(e => on.add(e)), un.clear(), 
            s.forEach((e, t) => un.set(t, e)), Lt = l, Nt = c, Mr({
                animate: !1
            });
            const O = new Blob([ R ], {
                type: "image/svg+xml;charset=utf-8"
            }), B = URL.createObjectURL(O), j = new Image;
            return await new Promise((e, t) => {
                j.onload = e, j.onerror = t, j.src = B;
            }), URL.revokeObjectURL(B), j.sexcapadesNodeIds = Array.from(S).sort(), j.sexcapadesSvgMarkup = R, 
            window.lastExportSvgMarkup = R, j;
        }
        function iu(e) {
            iu.table || (iu.table = Array.from({
                length: 256
            }, (e, t) => {
                let n = t;
                for (let e = 0; e < 8; e++) n = 1 & n ? 3988292384 ^ n >>> 1 : n >>> 1;
                return n >>> 0;
            }));
            let t = 4294967295;
            for (const n of e) t = iu.table[255 & (t ^ n)] ^ t >>> 8;
            return (4294967295 ^ t) >>> 0;
        }
        function au(e, t) {
            const n = (new TextEncoder).encode(e), i = new Uint8Array(t.length + 12), a = new DataView(i.buffer);
            return a.setUint32(0, t.length), i.set(n, 4), i.set(t, 8), a.setUint32(t.length + 8, iu(i.slice(4, t.length + 8))), 
            i;
        }
        // ===== Picture restore guard + save-to-re-read round-trip (Rank 5, 2026-10-30) =====
        // A picture export is a PNG carrying the profile payload in a
        // zTXt chunk (keyword "Sexcapades", zlib-stored deflate) plus,
        // when contact info is included, a vCard iTXt chunk. The format
        // already carries integrity checks — a CRC32 over every PNG
        // chunk (written by au() via iu()) and an Adler-32 over the
        // zlib stream (checked in Lx's fallback) — and the restore side
        // ignored both, while the save side checked only presence of
        // the chunk on the full-map path and nothing at all on the
        // compact size-reduction loop (which re-embeds through ru() on
        // every iteration). No new format is invented here: the checks
        // below read only what the format already carries, and a sound
        // picture passes them unchanged.
        // sxPngChunkCrc: CRC32 check for one chunk, using iu().
        function sxPngChunkCrc(bytes, off, len) {
            const typeAndData = new Uint8Array(4 + len);
            typeAndData.set(bytes.slice(off + 4, off + 8), 0);
            typeAndData.set(bytes.slice(off + 8, off + 8 + len), 4);
            const stored = new DataView(bytes.buffer, bytes.byteOffset + off + 8 + len, 4).getUint32(0);
            return iu(typeAndData) === stored;
        }
        // sxVerifyPngRoundTrip: save-side re-read. Walks the finished
        // PNG, verifies every chunk CRC, requires IEND, decompresses
        // the embedded payload and compares it byte-for-byte with the
        // text that was written (and the vCard text, when one was
        // written). Any failure throws, so a picture whose embedded
        // data does not read back exactly is never offered as a
        // successful export. ru() calls this on every picture it
        // builds, which covers the full-map path, the compact loop,
        // and the card/sheet pictures alike.
        async function sxVerifyPngRoundTrip(blob, expectedText, expectedVcard) {
            const sxSaveMsg = "The finished PNG did not read back the embedded profile data exactly, so it was not offered for download.";
            const bytes = new Uint8Array(await blob.arrayBuffer());
            if (![ 137, 80, 78, 71, 13, 10, 26, 10 ].every((b, k) => bytes[k] === b)) throw new Error(sxSaveMsg);
            let off = 8, sawIend = false, payloadText = null, vcardText = "";
            for (; off + 12 <= bytes.length; ) {
                const len = new DataView(bytes.buffer, bytes.byteOffset + off, 4).getUint32(0), end = off + 12 + len;
                if (end > bytes.length) throw new Error(sxSaveMsg);
                const type = String.fromCharCode(...bytes.slice(off + 4, off + 8));
                if (!sxPngChunkCrc(bytes, off, len)) throw new Error(sxSaveMsg);
                const data = bytes.slice(off + 8, off + 8 + len);
                if ("zTXt" === type) {
                    const nul = data.indexOf(0), keyword = nul > 0 ? (new TextDecoder("latin1")).decode(data.slice(0, nul)) : "";
                    if ("Sexcapades" === keyword || "vCard" === keyword) {
                        if (0 !== data[nul + 1]) throw new Error(sxSaveMsg);
                        let decoded;
                        try { decoded = (new TextDecoder).decode(await Lx(data.slice(nul + 2))); } catch (err) { throw new Error(sxSaveMsg); }
                        if ("Sexcapades" === keyword) {
                            if (null !== payloadText) throw new Error(sxSaveMsg);
                            payloadText = decoded;
                        } else vcardText = decoded;
                    }
                } else if ("iTXt" === type) {
                    const nul = data.indexOf(0), keyword = nul > 0 ? (new TextDecoder("latin1")).decode(data.slice(0, nul)) : "";
                    if ("vCard" === keyword) {
                        const compressed = 1 === data[nul + 1], langEnd = data.indexOf(0, nul + 3), transEnd = langEnd >= 0 ? data.indexOf(0, langEnd + 1) : -1;
                        if (langEnd < 0 || transEnd < 0 || 0 !== data[nul + 2]) throw new Error(sxSaveMsg);
                        const raw = data.slice(transEnd + 1);
                        try { vcardText = (new TextDecoder).decode(compressed ? await Lx(raw) : raw); } catch (err) { throw new Error(sxSaveMsg); }
                    }
                }
                if ("IEND" === type) { sawIend = true; break; }
                off = end;
            }
            if (!sawIend || null === payloadText || payloadText !== expectedText) throw new Error(sxSaveMsg);
            if (expectedVcard && vcardText !== expectedVcard) throw new Error(sxSaveMsg);
        }
        async function ru(e, t, n = "", i = null) {
            i && await i(76, "Encoding PNG", "Compressing the high-resolution hypermap into a PNG…");
            const a = await new Promise(t => e.toBlob(t, "image/png"));
            if (!a) throw new Error("PNG creation failed");
            if ("image/png" !== a.type) throw new Error("PNG encoder returned the wrong file type.");
            i && await i(88, "Embedding profile data", "Adding the re-importable profile data to the PNG…");
            const r = new Uint8Array(await a.arrayBuffer());
            if ([ 255, 216, 255 ].every((e, t) => r[t] === e)) throw new Error("PNG encoder returned JPEG bytes.");
            if (![ 137, 80, 78, 71, 13, 10, 26, 10 ].every((e, t) => r[t] === e)) throw new Error("PNG creation failed");
            let o = 8;
            for (;o + 12 <= r.length; ) {
                const e = new DataView(r.buffer, r.byteOffset + o, 4).getUint32(0);
                if ("IDAT" === String.fromCharCode(...r.slice(o + 4, o + 8))) break;
                if (o + 12 + e > r.length) throw new Error("PNG creation failed");
                o += 12 + e;
            }
            const sxWrittenText = JSON.stringify(t), s = (new TextEncoder).encode("Sexcapades"), l = function(e) {
                const t = Math.max(1, Math.ceil(e.length / 65535)), n = new Uint8Array(2 + 5 * t + e.length + 4);
                let i = 0, a = 0, r = 1, o = 0;
                n[a++] = 120, n[a++] = 1;
                for (let s = 0; s < t; s++) {
                    const l = Math.min(65535, e.length - i), c = s === t - 1;
                    n[a++] = c ? 1 : 0, n[a++] = 255 & l, n[a++] = l >>> 8;
                    const d = 65535 & ~l;
                    n[a++] = 255 & d, n[a++] = d >>> 8, n.set(e.subarray(i, i + l), a);
                    for (let t = 0; t < l; t++) r = (r + e[i + t]) % 65521, o = (o + r) % 65521;
                    i += l, a += l;
                }
                const s = (o << 16 | r) >>> 0;
                return n[a++] = s >>> 24, n[a++] = s >>> 16 & 255, n[a++] = s >>> 8 & 255, n[a] = 255 & s, 
                n;
            }((new TextEncoder).encode(sxWrittenText)), c = new Uint8Array(s.length + 2 + l.length);
            c.set(s), c[s.length] = 0, c[s.length + 1] = 0, c.set(l, s.length + 2);
            const d = [ au("zTXt", c) ];
            n && d.push(function(e, t) {
                const n = (new TextEncoder).encode("vCard"), i = (new TextEncoder).encode(t), a = new Uint8Array(n.length + 5 + i.length);
                return a.set(n), a.set([ 0, 0, 0, 0, 0 ], n.length), a.set(i, n.length + 5), au("iTXt", a);
            }(0, n));
            const u = new Blob([ r.slice(0, o), ...d, r.slice(o) ], {
                type: "image/png"
            });
            // Rank 5 round-trip: re-read the finished picture and
            // compare its embedded data with what was written, before
            // any caller can offer it as a successful export. A
            // mismatch throws here, through the callers' existing
            // export-failure reporting, instead of looking saved.
            await sxVerifyPngRoundTrip(u, sxWrittenText, n);
            return i && await i(96, "Finalizing export", "Checking the finished file and preparing its preview…"), 
            u;
        }
        function ou(e, t, n = {}) {
            if (!(e instanceof Blob) || "image/png" !== e.type) throw new Error("Export creation did not produce a PNG.");
            if (void 0 !== window.lastExportSvgMarkup && window.lastExportSvgMarkup && !n.svgMarkup) {
                var i = window.lastExportSvgMarkup;
                try {
                    if (n.profileId && vt[n.profileId]) {
                        var a = n.allowedIds instanceof Set ? n.allowedIds : new Set(n.allowedIds || []), r = bx(n.profileId, a, Boolean(n.includeProfileInfo), "", Boolean(n.blind)), o = JSON.stringify(r), s = btoa(unescape(encodeURIComponent(o)));
                        i = i.replace(/<svg([^>]*)>/, "<svg$1>\x3c!--sexcapades-profile:" + s + "--\x3e");
                    }
                } catch (e) { __sxErrLog("svg-embed", e); }
                n.svgMarkup = i, n.svgFilename = String(t || "Sexcapades-export").replace(/\.png$/i, "") + ".svg", 
                n.pdfFilename = String(t || "Sexcapades-export").replace(/\.png$/i, "") + ".pdf", 
                window.lastExportSvgMarkup = null;
            }
            Gf(e, /\.png$/i.test(String(t || "")) ? String(t) : String(t || "Sexcapades-export").replace(/\.[^.]+$/, "") + ".png", n);
        }
        // The scenePromptText textarea is the single source of truth
        // for the current Scribe prompt (refactor F9): the user can
        // edit it after generation, so every read goes through this
        // getter; scribePromptCache is only the fallback. The build
        // and the dialog prep keep the two in sync at write points.
        function currentScribePrompt() {
            return String(e.byId("scenePromptText")?.value || scribePromptCache || "");
        }
        // Filename slug shared by the Scribe and Scene Setter
        // downloads (refactor F3).
        function sxFilenameSlug(text, fallback) {
            return String(text || fallback).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || fallback;
        }
        // Copy helper shared by the Scribe, NovelAI, opener, and
        // Scene Setter copy sites (refactor F3): copies through the
        // existing clipboard helper ku(), then reports on the status
        // element and returns whether the copy succeeded. With no
        // opts.ta it uses a scratch textarea appended to hostEl (or
        // the body), as the Scene Setter handlers did; with opts.ta
        // it copies through the caller's own textarea, as the
        // Scribe, NovelAI, and opener handlers did. An empty text
        // reports failure without touching the clipboard unless
        // opts.throughOnEmpty is set — the NovelAI and opener
        // handlers copy even an empty field — matching the handlers
        // this replaces in each case.
        async function sxCopyText(text, statusEl, okText, failText, hostEl, opts) {
            if (!text && !(opts && opts.throughOnEmpty)) return void (statusEl && (statusEl.textContent = failText)), !1;
            const ownTa = !(opts && opts.ta), ta = ownTa ? document.createElement("textarea") : opts.ta;
            ownTa && (ta.value = text, ta.setAttribute("readonly", ""), ta.style.position = "fixed", ta.style.opacity = "0", (hostEl || document.body).appendChild(ta));
            const ok = await ku(text, ta);
            return ownTa && ta.remove(), statusEl && (statusEl.textContent = ok ? okText : failText), ok;
        }
        e.byId("generateScribePrompt") && e.byId("generateScribePrompt").addEventListener("click", function() {
            const t = function() {
                const t = (scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]);
                return {
                    participantIds: t,
                    topicData: t.map(e => ({
                        id: e,
                        ratings: vt[e],
                        markers: Qe[e],
                        fantasyOnly: Je[e],
                        alreadyTried: et[e]
                    })),
                    details: String(e.byId("scribeDetails")?.value || "").trim(),
                    explicitness: Math.min(4, Math.max(1, Number(e.byId("scribeExplicitness")?.value) || 2)),
                    pageCount: String(e.byId("scribePageCount")?.value || "").trim()
                };
            }();
            t.participantIds.length && t.topicData.length && (scribeRequestText = t.details, function(t, n) {
                const i = e.byId("scribePageCount"), u = e.byId("scribeLengthUnit"), d = e.byId("scribeDetailLevel"), a = function() {
                    const t = e.byId("scribePageCount"), n = String(t?.value || "").trim().replace(/[–—]/g, "-");
                    if (!n) return t && t.setCustomValidity(""), "1";
                    const i = n.match(/^(\d{1,5}(?:\.\d)?)(?:\s*-\s*(\d{1,5}(?:\.\d)?))?$/);
                    if (!i) return t && (t.setCustomValidity("Use a number such as 5 or a range such as 5–7."), 
                    t.reportValidity()), null;
                    const o = {
                        words: [ 100, 2e4 ],
                        paragraphs: [ 1, 100 ],
                        pages: [ 1, 50 ],
                        chapters: [ 1, 50 ]
                    }[String(u?.value || "pages")] || [ 1, 100 ], s = o[0], l = o[1];
                    let a = Math.max(s, Math.min(l, Number(i[1]))), r = i[2] ? Math.max(s, Math.min(l, Number(i[2]))) : null;
                    return null !== r && r < a && ([a, r] = [ r, a ]), t && t.setCustomValidity(""), 
                    null === r ? String(a) : `${a}–${r}`;
                }();
                if (!a) return;
                scribeLengthUnit = [ "words", "paragraphs", "pages", "chapters" ].includes(String(u?.value || "")) ? u.value : "pages", scribeDetailLevel = [ "concise", "balanced", "detailed" ].includes(String(d?.value || "")) ? d.value : "balanced", 
                scribeLengthValue = a, scribeLengthDisplay = String(i?.value || "").trim() ? a.replace(/–/g, "-") : "~1";
                const r = `Projected: ${scribeLengthDisplay} ${scribeLengthUnit}`;
                e.byId("scenePageProjection").textContent = r, e.byId("novelAiPageProjection").textContent = r, 
                ({ target: scribeTarget, mode: scribeMode } = sxResolveScribeMode(n, t));
                const sxSharedIds = (scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]), sxSharedData = sxSharedIds.length ? sxScribeMatchData(sxSharedIds, 1 === sxSharedIds.length) : null;
                const o = "porn" === scribeMode, s = e.byId("scribeTitle"), l = e.byId("scribeModeSummary");
                if (s) s.textContent = o ? "Scribe — Story" : "Scribe — Play Guide";
                if (l) l.textContent = o ? "Fictional storytelling for enjoyment and fantasy — not a real-world plan." : "Practical coordination guidance for real-world use — not fiction; confirm every activity together.";
                sxNovelAiFields = null;
                sxPrepScribeDialog(sxSharedData, !0);
                sxBuildScribePrompt(sxSharedData);
                if ("novelai" === scribeTarget && currentScribePrompt() && sxNovelAiFields) {
                    Object.entries({
                        genre: "novelAiGenre",
                        title: "novelAiTitleField",
                        characterName: "novelAiCharacterName",
                        personality: "novelAiPersonality",
                        world: "novelAiWorld",
                        prompt: "novelAiPrompt"
                    }).forEach(([t, n]) => {
                        e.byId(n).value = sxNovelAiFields[t] || "";
                    });
                    e.all("[data-copy-novelai]").forEach(e => e.textContent = "Copy");
                    e.byId("novelAiCopyStatus").textContent = "";
                    Ui(Bc);
                    return Wi(jc), void requestAnimationFrame(() => jc.querySelector("[data-copy-novelai]")?.focus());
                }
                const castNamesText = (scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]).map(e => rd(e)).join(" + ");
                if (e.byId("scribeProfiles")) e.byId("scribeProfiles").textContent = castNamesText;
                if (e.byId("scribeChoiceProfiles")) e.byId("scribeChoiceProfiles").textContent = castNamesText;
                const genBtn = e.byId("generateScribePrompt");
                if (genBtn) genBtn.textContent = "Prompt";
                const briefEl = e.byId("sceneBrief");
                if (briefEl) {
                    briefEl.hidden = !1;
                    try { briefEl.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
                }
            }("porn", ({ 1: "strictai", 2: "suggestive", 3: "explicit" })[t.explicitness] || "grok"));
        }), e.byId("scribeExplicitness") && e.byId("scribeExplicitness").addEventListener("input", t => { const n = Math.min(4, Math.max(1, Number(t.currentTarget.value) || 2)), i = e.byId("scribeExplicitnessLabel"); i && (i.textContent = `${n} · ${[ "Tame", "Suggestive", "Explicit", "Uninhibited" ][n - 1]}`); }), e.byId("scribePageCount") && e.byId("scribePageCount").addEventListener("input", e => e.currentTarget.setCustomValidity("")),
        sxWirePhaseToggles("scribe"), sxWirePhaseToggles("setter"), 
        e.byId("setterSetup") && e.byId("setterSetup").addEventListener("input", ev => {
            const ids = String(e.byId("negotiationDialog")?.dataset.participants || "").split(",").filter(Boolean);
            if (ids.length < 2) return;
            const st = Cu(ids), tg = ev.target, isNegotiationLength = "setterNegotiationLength" === tg.id || "setterNegotiationLengthUnit" === tg.id;
            if ("setterLength" === tg.id) st.length = String(tg.value || "5").trim() || "5"; else if ("setterLengthUnit" === tg.id) st.lengthUnit = String(tg.value || "paragraphs"); else if ("setterDetailLevel" === tg.id) st.detail = String(tg.value || "balanced"); else if ("setterNegotiationLength" === tg.id) st.negotiationLength = String(tg.value || "1").trim() || "1"; else if ("setterNegotiationLengthUnit" === tg.id) st.negotiationLengthUnit = String(tg.value || "pages"); else return;
            Fu(ids), isNegotiationLength ? e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = "Negotiation guide length saved.") : e.byId("negotiationCopyStatus") && (e.byId("negotiationCopyStatus").textContent = "Play guide settings saved.");
        }), 
        e.byId("copyScenePrompt") && e.byId("copyScenePrompt").addEventListener("click", async function() {
            const n = e.byId("scenePromptText"), i = e.byId("sceneDownloadStatus"), a = e.byId("copyScenePrompt"), r = currentScribePrompt();
            if (!r) return void (i.textContent = "Generate a prompt first.");
            const o = await sxCopyText(r, i, "Prompt copied.", "Could not copy automatically. Select the text and copy it manually.", null, {
                ta: n
            });
            a.textContent = o ? "Copied" : "Retry", o && t.setTimeout(() => {
                a.textContent = "Copy";
            }, 1600);
        }), e.byId("downloadScenePrompt") && e.byId("downloadScenePrompt").addEventListener("click", function() {
            const n = e.byId("scenePromptText"), i = e.byId("sceneDownloadStatus"), a = currentScribePrompt();
            if (!a) return void (i.textContent = "Generate a prompt first.");
            const r = sxFilenameSlug((scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]).map(e => wt[e]).join("-"), "profile"), o = "porn" === scribeMode ? "story-prompt" : "play-guide-prompt", s = new Blob([ a + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), l = URL.createObjectURL(s), c = document.createElement("a");
            c.href = l, c.download = `Sexcapades-${r}-${o}.txt`, c.hidden = !0, document.body.appendChild(c), 
            c.click(), c.remove(), t.setTimeout(() => URL.revokeObjectURL(l), 0), i.textContent = "Prompt downloaded.";
        });
        const su = "https://sexcapades.io/#guide", lu = "https://sexcapades.io/#app", cu = [], du = [];
        h.forEach(e => {
            const t = catId(e.name);
            cu.push(t), du.push(t), e.topics.forEach(t => {
                cu.push(Wn(t)), du.push(Kn(e.name, sxName(t)));
            });
        });
        const uu = du.filter(e => "topic-sensation-atmosphere-tantra-energy-play" !== e && "topic-service-ritual-spiritual-play" !== e), pu = uu.reduce((e, t) => ("topic-impact-pain-body-modification-whips" === t || e.push("topic-impact-pain-body-modification-riding-crops" === t ? "topic-impact-pain-body-modification-whipping" : t), 
        e), []), hu = new Map(cu.map((e, t) => [ e, t ]));
        function gu(e) {
            let t = "";
            for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
            return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        function mu(e) {
            const t = String(e).replace(/-/g, "+").replace(/_/g, "/"), n = atob(t + "=".repeat((4 - t.length % 4) % 4)), i = new Uint8Array(n.length);
            for (let e = 0; e < n.length; e++) i[e] = n.charCodeAt(e);
            return i;
        }
        const fu = cu.filter(e => Boolean(topicLabelById[e])), yu = iu((new TextEncoder).encode(fu.join(" ")));
        function bu(e) {
            return Number.isFinite(Number(e)) ? 1 + Math.max(0, Math.min(14, Math.round(14 * (Number(e) + 100) / 200))) : 0;
        }
        function vu(e) {
            return e ? Math.round(200 * (e - 1) / 14 - 100) : null;
        }
        // wu: the token builder for this format (name, ratings, marks
        // in the inner function below). Its only live caller is the
        // anonymous survey send, which keeps includeName/includeMarks
        // false — a privacy property, not an oversize policy, and
        // unchanged by the framework. Oversize handling for this
        // format lives on the receiving side in Nu, which states the
        // format-derived limit; there is no share-link creation
        // caller in this bundle to warn at send time.
        function wu(e) {
            const t = function(e, t = {}) {
                if (!vt[e] && e !== Et) throw new Error("Choose a profile before making a link.");
                const n = !1 !== t.includeName, i = !1 !== t.includeMarks, a = n ? (new TextEncoder).encode(String(wt[e] || "Shared hypermap").slice(0, 40)) : new Uint8Array(0), r = [];
                fu.forEach((t, n) => {
                    const a = ca(t, e), o = bu(a.giveKnown ? a.give : null), s = bu(a.receiveKnown ? a.receive : null), l = i ? ("favorite" === Qe[e]?.[t] ? 1 : "limit" === Qe[e]?.[t] ? 2 : "notinterested" === Qe[e]?.[t] ? 16 : 0) | (Je[e]?.[t] ? 4 : 0) | (et[e]?.[t] ? 8 : 0) : 0;
                    (o || s || l) && r.push(n, o << 4 | s, l);
                });
                const o = new Uint8Array(9 + a.length + r.length), s = new DataView(o.buffer);
                return o.set([ 83, 88, 1 ], 0), s.setUint32(3, yu), o[7] = a.length, o[8] = r.length / 3, 
                o.set(a, 9), o.set(r, 9 + a.length), gu(o);
            }(e, {
                includeName: !1,
                includeMarks: !1
            }), n = St(mt[e]).outline;
            return n && n.timerRan ? `${t};t=${n.durationSeconds}` : t;
        }
        async function ku(e, t) {
            let n = !1;
            try {
                navigator.clipboard && navigator.clipboard.writeText && (await navigator.clipboard.writeText(e), 
                n = !0);
            } catch (e) { __sxErrLog("clipboard", e); }
            if (!n) {
                const i = t || document.createElement("textarea"), a = !t;
                a && (i.value = e, i.style.position = "fixed", i.style.opacity = "0", document.body.appendChild(i));
                try {
                    i.focus(), i.select(), n = document.execCommand("copy");
                } catch (e) {
                    n = !1;
                }
                a && i.remove();
            }
            return n;
        }
        e.all("[data-copy-novelai]").forEach(t => t.addEventListener("click", async () => {
            const n = t.dataset.copyNovelai, i = __sxClosestAction(t, "novelAiField"), a = i?.querySelector("textarea"), r = i?.querySelector("h3")?.textContent || "Field", o = sxNovelAiFields?.[n] || a?.value || "", s = await sxCopyText(o, e.byId("novelAiCopyStatus"), `${r} copied. Paste it into NovelAI, then return for the next field.`, `Could not copy ${r}. Select the text and copy it manually.`, null, {
                ta: a,
                throughOnEmpty: !0
            });
            e.all("[data-copy-novelai]").forEach(e => e.textContent = "Copy"), t.textContent = s ? "Copied" : "Retry";
        }));
        const xu = "https://sexcapades.io", Su = [ `Found this kink comparison tool. Want to compare hypermaps? ${xu}`, `I mapped all my kinks on this thing. Dying to see how we overlap — compare hypermaps? ${xu}`, `Ever wondered where your kinks line up with someone else’s? Compare hypermaps? ${xu}`, `I put my whole sex life on a map. Compare hypermaps? Let’s see what happens: ${xu}`, `This site maps your kinks and compares them with a partner’s. Compare hypermaps? ${xu}`, `What if you could see exactly where your desires overlap with someone? Compare hypermaps? ${xu}`, `I wonder how compatible we really are… compare hypermaps? Let’s find out: ${xu}`, `Map your kinks, compare with mine. Compare hypermaps? ${xu}` ];
        let $u = -1;
        function Eu() {
            e.byId("openerMessage").value = function() {
                let e = Math.floor(Math.random() * Su.length);
                Su.length > 1 && e === $u && (e = (e + 1 + Math.floor(Math.random() * (Su.length - 1))) % Su.length), 
                $u = e;
                const t = Su[e];
                return t.includes(xu) ? t : `${t} ${xu}`;
            }(), e.byId("openerCopyStatus").textContent = "";
        }
        const Au = new Map;
        function Cu(e) {
            const t = function(e) {
                return e.slice().sort().join("|");
            }(e);
            Au.has(t) || Au.set(t, {
                safewords: "",
                aftercare: Object.fromEntries(e.map(e => [ e, "" ])),
                length: "5",
                lengthUnit: "paragraphs",
                detail: "balanced",
                negotiationLength: "1",
                negotiationLengthUnit: "pages"
            });
            const n = Au.get(t);
            return e.forEach(e => {
                Object.prototype.hasOwnProperty.call(n.aftercare, e) || (n.aftercare[e] = "");
            }), n;
        }
        function Mu(e, t) {
            const n = qn[e] || Xn(e) || t.map(t => (at[t] || {})[e]).find(Boolean);
            return n ? n.label : e;
        }
        function Iu(e, t = {}) {
            const sxCanon = e => {
                try {
                    return Wn(e);
                } catch (t) {
                    return e;
                }
            }, sxOwnUniverse = e => [ ...new Set([ ...Uc(), ...Object.keys(vt[e] || {}), ...Object.keys((Ye[e] || {}).ratings || {}) ]) ], sxDeepSets = [ ...new Set((Array.isArray(e) ? e : []).filter(e => vt[e])) ].map(e => {
                const t = new Set;
                return sxOwnUniverse(e).forEach(n => {
                    const i = ca(n, e), a = Ye[e] ? Ld(Ye[e], n) : null;
                    (i.giveKnown && i.give <= -36 || i.receiveKnown && i.receive <= -36 || a && (a.giveKnown && a.give <= -36 || a.receiveKnown && a.receive <= -36)) && t.add(sxCanon(n));
                }), t;
            });
            const n = [ ...new Set((Array.isArray(e) ? e : []).filter(e => vt[e])) ], i = n.map(e => rd(e)), a = new Set(Uc().filter(e => n.some(t => ja(e, t)))), r = new Set(t.excludeFantasy ? Uc().filter(e => n.some(t => Ha(e, t))) : []), o = new Set([ ...a, ...r ]), s = n.map(e => sxHardLimitLines([ e ])), l = n.map(e => [ ...new Set([ ...new Set(sxOwnUniverse(e).map(e => sxCanon(e))) ].filter(n => !(t.hideExcludedNames && o.has(n))).filter(t => sxDeepSets[n.indexOf(e)].has(t)).map(e => Mu(e, n)).sort()) ]), c = [];
            Uc().forEach(e => {
                a.has(e) || t.excludeFantasy && r.has(e) || Id(n).forEach(([t, a]) => {
                    const r = n.indexOf(t), o = n.indexOf(a), s = ca(e, t), l = ca(e, a), d = [];
                    s.giveKnown && l.receiveKnown && s.give >= 36 && l.receive <= -36 && d.push(`${i[r]} gives / ${i[o]} receives`), 
                    s.receiveKnown && l.giveKnown && s.receive >= 36 && l.give <= -36 && d.push(`${i[r]} receives / ${i[o]} gives`), 
                    l.giveKnown && s.receiveKnown && l.give >= 36 && s.receive <= -36 && d.push(`${i[o]} gives / ${i[r]} receives`), 
                    l.receiveKnown && s.giveKnown && l.receive >= 36 && s.give <= -36 && d.push(`${i[o]} receives / ${i[r]} gives`), 
                    d.length && c.push(`${Mu(e, n)} — ${d.join("; ")}`);
                });
            });
            const sxSettings = Object.fromEntries(n.map(id => [ id, { heat: sxHeatFor(id), veil: sxVeilFor(id) } ])), d = n.length > 2 ? sxMultiMatchData(n, sxSettings) : sxCastMatchData(n[0], n[1], sxSettings), sxTeasers = function() {
                const seen = new Set, out = [];
                const line = rec => {
                    const dets = rec.teaserDetail && rec.teaserDetail.length ? rec.teaserDetail : rec.teaserFor.map(o => ({ owner: o, partner: "", heat: 0, flanks: [] }));
                    return dets.map(d => {
                        let s = `${d.owner} marked this Not Interested`;
                        if (d.heat > 0 && d.flanks && d.flanks.length) {
                            const ft = d.flanks.map(f => `${f.dir}${d.heat >= 34 ? ` (${"strong" === f.stance ? "strong" : "curious"}${d.heat >= 67 && null != f.rating ? `, ${Math.round(f.rating)}` : ""})` : ""}`).join(" and ");
                            s += 100 === d.heat ? `, at full Horndog heat (+100) ${d.partner} is offering more of themselves: ${d.partner} wants to ${ft}` : `; at the current Heat (+${d.heat}) it is teaser-eligible only: ${d.partner} wants to ${ft}`;
                        } else s += "; at the current Heat it is teaser-eligible only";
                        return s;
                    }).join("; ");
                };
                const take = rec => {
                    if (!rec || !rec.teaserFor || !rec.teaserFor.length || seen.has(rec.id)) return;
                    if (n.some(t => Ha(rec.id, t))) return;
                    seen.add(rec.id), out.push(`${rec.label} — ${line(rec)} — a soft no being revisited, never a match. Surface it solely as a flagged conversation point with an easy opt-out.`);
                };
                if (2 === n.length) {
                    const pair = sxPairByIds(n[0], n[1], sxSettings);
                    pair && pair.topics.forEach(take);
                } else if (n.length > 2) sxGroupCompute(n.map(x => sxProfileById(x)), {
                    heat: n.map(id => sxSettings[id].heat),
                    veil: n.map(id => sxSettings[id].veil)
                }).pairs.forEach(pr => pr.topics.forEach(take));
                return out.sort((x, y) => x.localeCompare(y));
            }(), sxFirstName = Object.fromEntries(n.map((e, t) => [ wt[e] || "", i[t] ])), sxDirOf = e => {
                const t = e.route ? [ e.route ] : e.routes && e.routes.length ? e.routes : [];
                return [ ...new Set(t.map(e => `${sxFirstName[e.giver] || e.giver} gives → ${sxFirstName[e.receiver] || e.receiver} receives`)) ].join("; ");
            }, sxIsFantasy = e => Boolean(e.fantasyOnly) || n.some(t => Ha(e.id, t)), sxRedFor = e => n.map((t, a) => sxDeepSets[a] && sxDeepSets[a].has(sxCanon(e.id)) ? i[a] : "").filter(Boolean), sxLineOf = e => {
                const t = sxDirOf(e), a = sxRedFor(e);
                return `${e.label}${t ? ` — ${t}` : ""}${a.length ? ` — red/no for ${a.join(" and ")}` : ""}`;
            }, u = e => e.filter(e => !o.has(e.id) && !sxIsFantasy(e)).map(sxLineOf), sxFantasySeen = new Set, sxFantasyOf = e => e.filter(e => !o.has(e.id) && sxIsFantasy(e) && !sxFantasySeen.has(e.id) && sxFantasySeen.add(e.id)).map(e => `☁ ${sxLineOf(e)}`), p = Cu(n), h = n.map(e => function(e, t, n = new Set) {
                return Uc().filter(t => {
                    const i = qn[t] || Xn(t);
                    if (!i || "Connection & aftercare" !== i.branch || ja(t, e) || n.has(t)) return !1;
                    const a = ca(t, e);
                    return "favorite" === Qe[e]?.[t] || a.giveKnown && a.give > 35 || a.receiveKnown && a.receive > 35;
                }).map(n => {
                    const i = ca(n, e);
                    return `${Mu(n, t)}${ad(i, n) ? ` — ${ad(i, n)}` : ""}`;
                }).sort();
            }(e, n, t.hideExcludedNames ? o : new Set));
            return {
                ids: n,
                names: i,
                limits: s,
                reds: l,
                discuss: c,
                warmup: u(d.warmup),
                main: u(d.escalation.concat(d.peak)),
                aftercare: u(d.aftercare),
                fantasy: sxFantasyOf([ ...d.warmup, ...d.escalation, ...d.peak, ...d.aftercare ]),
                teasers: sxTeasers,
                ratedAftercare: h,
                safewords: String(p.safewords || "").trim(),
                aftercareNeeds: n.map(e => String(p.aftercare[e] || "").trim()),
                excluded: sxHardLimitLines(n),
                terms: n.map(e => String(it[e] || "").trim()),
                mutuals: n.length > 1 ? Uc().filter(e => sxDeepSets.every(t => t.has(e))).map(e => Mu(e, n)).sort() : []
            };
        }
        function Pu(e, t) {
            return e.length ? e.map(e => `<li>${Hi(e)}</li>`).join("") : `<li>${Hi(t)}</li>`;
        }
        function sxTermsBlock(e, t, a) {
            const n = e.map((e, n) => {
                const i = String(it[e] || "").trim();
                return i ? `${t[n]}: "${i}"` : "";
            }).filter(Boolean);
            return n.length ? [ a && a.flavor ? "TERMS — IN THEIR OWN WORDS (each person's stated terms, quoted verbatim as flavor and character context for the writing; let them color voice, motivation, and texture — they are not the binding layer here):" : "TERMS — BINDING (quoted law, do not interpret or soften):", ...n ].join(" ") : "";
        }
        function sxAboutBlock(e, t) {
            // E8: About Me reaches the Scribe prompt only — per-profile,
            // attributed by name, framed as the person's own words /
            // profile context. Never binding: the binding layer stays
            // marks and Terms only. Empty About yields no section.
            const n = e.map((e, n) => {
                const i = String(nt[e] || "").trim();
                return i ? `ABOUT ${t[n]} (their own words):\n${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "PROFILE CONTEXT — IN THEIR OWN WORDS (background color for voice and character only; not binding limits and not checklist data — the binding layer is marks and Terms only):", ...n ].join("\n\n") : "";
        }
        function sxAgeBlock(e, t) {
            // Age context-on-tap: fires only when ageplay is in play —
            // the ageplayer role on any cast profile. All participants
            // are adults; the ages below are ageplay framing context for
            // the writers only. This is the only prompt-side reader of lt;
            // age never reaches matching, eligibility, or any boundary.
            if (!e.some(e => Gb(st[e]).includes("ageplayer"))) return "";
            const n = e.map((e, n) => {
                const i = String(lt[e] || "").trim();
                return i ? `${t[n]}: age ${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "AGE CONTEXT — AGEPLAY FRAMING ONLY (all participants are adults; these chronological ages are supplied solely as ageplay framing context for the writers — they do not affect matching, eligibility, or any boundary):", ...n ].join(" ") : "";
        }
        function sxRolesBlock(e, t) {
            const n = e.map((e, n) => {
                const i = Kb(st[e], ", ");
                return i ? `${t[n]}: roles: ${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "CAST — ROLES (identity language):", ...n ].join(" ") : "";
        }
        function sxCastBlock(e, t) {
            const n = e.map((e, n) => {
                const i = bb(rt[e]), a = iv(ot[e]), r = String(pz[e] || "").trim();
                return `${t[n]}: gender: ${i.length ? vb(i, " and ") : "unspecified"}; orientation: ${a.length ? Nb(a, " and ") : "unspecified"}. Pronouns for ${t[n]}: ${hp(e)}. Do not infer anatomy from gender labels. Gender, orientation, and roles guide identity and partner-gender choices only.`;
            }).filter(Boolean);
            return n.length ? [ "CAST — GENDER, ORIENTATION & PRONOUNS (identity language):", ...n ].join(" ") : "";
        }
        function sxWriterStamp(ids) {
            // E6 stamp: every writer output names the live session compare
            // settings — mode, and each cast profile's Heat (zone + signed
            // value) and Veil — read from the same session state the
            // Compare panel reads (sxcv / sxHeatFor / sxVeilFor).
            const names = ids.map(id => rd(id)), heat = ids.map((id, i) => {
                const v = sxHeatFor(id);
                return `${names[i]} ${sxHeatZone(v)} ${v > 0 ? "+" + v : v}`;
            }), veil = ids.map((id, i) => `${names[i]} ${sxVeilFor(id)}`);
            return `COMPARE SETTINGS — Mode: ${"play" === sxcv.mode ? "Play" : "Conversation"} · Heat: ${heat.join(" · ")} · Veil: ${veil.join(" · ")}`;
        }
        // Shared plain-text lines for the BINDING surfaces only
        // (refactor F11): the per-person binding Terms line and the
        // stated-aftercare-needs line are byte-identical in Lu()'s
        // negotiation checklist and in sxStoreNegotiationGuide()'s
        // guide document — same text, same per-person inputs — so
        // both render through these two helpers. The promise stays
        // explicit at each call site: these helpers format BINDING
        // lines only. Scribe's flavor rendering is a different
        // promise and does not use them (sxTermsBlock with
        // { flavor: true } at the Scribe call sites); Lu()'s
        // hideTerms guard likewise stays at the Lu() call site,
        // not inside the helper.
        function sxBindingTermsLine(terms) {
            return `- Terms (binding): "${terms}"`;
        }
        function sxStatedAftercareLine(needs) {
            return `- ${needs}`;
        }
        // Binding vs flavor (refactor F11 — read before "deduplicating"
        // the per-person terms/aftercare lines): Scribe's sxTermsBlock
        // renders a person's Terms as FLAVOR — character context for a
        // story or guide prompt, explicitly non-binding (its flavor
        // parameter says so). Scene Setter's per-person lines in Lu()
        // below and in sxStoreNegotiationGuide() are the BINDING layer:
        // the negotiation checklist and guide document a partner is
        // held to, where Terms sit alongside the marker lists. The two
        // renderings intentionally differ in wording, punctuation, and
        // empty-state lines (e.g. "- None marked" in the checklist vs
        // "- None marked." in the guide document), so the surrounding
        // renderings are NOT merged — merging them would change
        // shipped bytes and blur the promise each surface makes. What
        // IS shared safely is the block level: sxTermsBlock /
        // sxAboutBlock / sxAgeBlock / sxRolesBlock / sxCastBlock feed
        // both Scribe's prompt and Setter's documents (via Fu /
        // sxStoreNegotiationGuide), and that sharing stays. Two
        // single lines are also shared, via the helpers directly
        // above: the binding Terms line and the stated-aftercare
        // line are byte-identical between the checklist and the
        // guide document (both binding surfaces, same per-person
        // inputs). Deliberately left unshared: the limits/reds lists
        // and their empty states (punctuation differs, above);
        // Lu()'s aftercare fallback chain — stated needs, else rated
        // aftercare lines, else the not-filled-out line — because
        // the guide document renders rated aftercare in its own
        // tier-gated section instead; and the on-screen checklist
        // panel's HTML terms line, which carries no "- " prefix
        // because Pu() wraps it in an <li>.
        function Lu(e, t = {}) {
            const n = [ sxWriterStamp(e.ids), `NEGOTIATION CHECKLIST DATA — BINDING — ${e.names.join(" + ")}` ], i = Boolean(t.hideExcluded), sxNoTerms = Boolean(t.hideTerms);
            return e.names.forEach((t, a) => {
                const r = [ ...(i ? e.limits[a].length ? [ `- ${e.limits[a].length} hard-excluded ${1 === e.limits[a].length ? "topic is" : "topics are"} omitted; names intentionally absent.` ] : [] : e.limits[a].map(e => `- ${e}`)), ...(e.terms && e.terms[a] && !sxNoTerms ? [ sxBindingTermsLine(e.terms[a]) ] : []) ];
                r.length || r.push("- None marked"), n.push("", `${t} — HARD LIMITS`, ...r, `${t} — RED TOPICS`, ...e.reds[a].length ? e.reds[a].map(e => `- ${e}`) : [ "- None rated red" ], `${t} — STATED AFTERCARE NEEDS`, ...e.aftercareNeeds[a] ? [ sxStatedAftercareLine(e.aftercareNeeds[a]) ] : e.ratedAftercare[a].length ? e.ratedAftercare[a].map(e => `- ${e}`) : [ "- Not filled out; agree before play." ]);
            }), n.push("", "MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED", ...e.mutuals && e.mutuals.length ? e.mutuals.map(e => `- ${e}`) : [ "- None — no topic is rated deep-red by both partners." ]), n.push("", "DISCUSS FIRST — GREEN / RED CLASHES", ...e.discuss.length ? e.discuss.map(e => `- ${e}`) : [ "- No green-versus-red clashes found." ], "", "SAFEWORDS + STOP SIGNALS", `- ${e.safewords || "Not filled out; choose verbal safewords and a nonverbal stop signal before play."}`, "", "OTHER BEFORE-PLAY CHECKS", "- Agree what “pause” means and who may call it.", "- Confirm intensity, pacing, injuries, medication, allergies, and supplies."), 
            n.join(" ");
        }
        function Tu(e) {
            return [ "PLAY GUIDE DATA — SOURCE MATERIAL", "Warm-up", ...e.warmup.length ? e.warmup.map(e => `- ${e}`) : [ "- Agree on a gentle start together." ], "Main play", ...e.main.length ? e.main.map(e => `- ${e}`) : [ "- No shared green/green main-play topic is recorded." ], "Aftercare ideas from rated profiles", ...e.aftercare.length ? e.aftercare.map(e => `- ${e}`) : [ "- No shared aftercare topic is recorded." ], ...(e.fantasy && e.fantasy.length ? [ "Fantasy only — excluded from practical play", ...e.fantasy.map(e => `- ${e}`) ] : []), ...(e.teasers && e.teasers.length ? [ "Teasers — soft no revisited at the current Heat (flagged; teaser-eligible only, never a match)", ...e.teasers.map(e => `- ${e}`) ] : []) ].join(" ");
        }
        function sxNegotiationLengthSpec(t) {
            const raw = String(t.negotiationLength || "1").trim().replace(/[–—]/g, "-"), unit = [ "words", "paragraphs", "pages", "chapters" ].includes(String(t.negotiationLengthUnit || "")) ? String(t.negotiationLengthUnit) : "pages", m = raw.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/), first = m ? Number(m[1]) : 1, labelNum = m ? m[2] ? `${m[1]}–${m[2]}` : `${m[1]}` : "1", pages = "words" === unit ? first / 500 : "paragraphs" === unit ? first / 5 : first, tier = pages <= 1 ? "compact" : pages <= 3 ? "standard" : "full";
            return {
                label: `${labelNum} ${unitWord(labelNum, unit)}`,
                tier: tier,
                tierLabel: "compact" === tier ? "compact (full per-topic detail folded)" : "standard" === tier ? "standard (rated-aftercare detail included)" : "full (rated-aftercare detail and per-topic appendix included)"
            };
        }
        function sxStoreNegotiationGuide(g) {
            const st = Cu(g.ids), sp = sxNegotiationLengthSpec(st), list = (items, empty) => items && items.length ? items.map(x => `- ${x}`) : [ `- ${empty}` ], L = [ "NEGOTIATION GUIDE", g.names.join(" + "), sxWriterStamp(g.ids), `Target length: ${sp.label} · Detail: ${sp.tierLabel}`, "This document records the completed negotiation checklist as the agreement itself. A hypermap match is not consent." ], roles = sxRolesBlock(g.ids, g.names), cast = sxCastBlock(g.ids, g.names), termsBlock = sxTermsBlock(g.ids, g.names), hardExcluded = [ ...new Set((g.excluded || []).concat(g.mutuals || [])) ];
            roles && L.push("", roles), cast && L.push("", cast), g.names.forEach((name, idx) => {
                L.push("", `${name} — HARD LIMITS`, ...list(g.limits[idx], "None marked."));
                g.terms && g.terms[idx] && L.push(sxBindingTermsLine(g.terms[idx]));
                L.push("", `${name} — RED TOPICS`, ...list(g.reds[idx], "None rated red."));
            }), L.push("", "MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED", ...list(g.mutuals, "None — no topic is rated deep-red by both partners.")), L.push("", "DISCUSS FIRST — GREEN / RED CLASHES", ...list(g.discuss, "No green-versus-red clashes found.")), L.push("", "SAFEWORDS + STOP SIGNALS", ...list(g.safewords ? [ g.safewords ] : [], "Not filled out; choose verbal safewords and a nonverbal stop signal before play.")), L.push("", "AFTERCARE"), g.names.forEach((name, idx) => {
                L.push("", `${name} — STATED AFTERCARE NEEDS`, ...(g.aftercareNeeds[idx] ? [ sxStatedAftercareLine(g.aftercareNeeds[idx]) ] : list([], "Not filled out; agree before play.")));
            }), L.push("", "HARD-EXCLUDED NOTICE", "The topics below are hard-excluded: outside this agreement and outside any play guide generated from it.", ...list(hardExcluded, "None marked.")), g.terms && g.terms.some(Boolean) && L.push("- Limits named in a profile’s Terms also apply, exactly as quoted in this guide."), termsBlock && L.push("", termsBlock), L.push("", "BEFORE-PLAY CHECKS"), "compact" === sp.tier ? L.push("- Confirm the meaning of “pause”, intensity and pacing, injuries, medication, allergies, and supplies before play.") : L.push("- Agree what “pause” means and who may call it.", "- Confirm intensity, pacing, injuries, medication, allergies, and supplies."), "compact" === sp.tier ? L.push("", "PER-TOPIC DETAIL — FOLDED AT THIS LENGTH", `- Rated aftercare preferences: ${g.names.map((name, idx) => `${name} ${g.ratedAftercare[idx].length} recorded`).join("; ")}.`, `- Topic detail folded: ${g.warmup.length} warm-up, ${g.main.length} main-play, and ${g.aftercare.length} aftercare ideas are recorded; fantasy-only and teaser entries stay labelled in the full setting.`) : (L.push("", "PER-TOPIC DETAIL — RATED AFTERCARE PREFERENCES"), g.names.forEach((name, idx) => {
                L.push("", `${name} — RATED AFTERCARE PREFERENCES`, ...list(g.ratedAftercare[idx], "None recorded."));
            })), "full" === sp.tier && (L.push("", "APPENDIX — PER-TOPIC DETAIL", "", "Warm-up", ...list(g.warmup, "Agree on a gentle start together."), "", "Main play", ...list(g.main, "No shared green/green main-play topic is recorded."), "", "Aftercare ideas from rated profiles", ...list(g.aftercare, "No shared aftercare topic is recorded."), "", "Fantasy only — excluded from practical play", ...list(g.fantasy, "No fantasy-only topics are in the shared pool."), "", "Teasers — soft no revisited at the current Heat (flagged; teaser-eligible only, never a match)", ...list(g.teasers, "No soft-no topics are teaser-eligible at the current settings."))), L.push("", "End of negotiation guide.");
            const doc = L.join("\n"), panel = e.byId("negotiationPanel");
            return panel && (panel.dataset.negotiationGuide = doc, panel.dataset.negotiationLength = sp.label, panel.dataset.negotiationDetail = sp.tier), doc;
        }
        // Scene Setter shared handler pieces (refactor F3): the full
        // play-guide prompt text (stored copy document plus the phase
        // and details sections), and the freshness step every
        // negotiation handler starts with — read the dialog's
        // participant ids and re-render the stored documents when a
        // pair is selected.
        function playGuidePromptText() {
            const t = e.byId("negotiationPanel"), x = [ setterPhaseSection(), setterDetailsSection() ].filter(Boolean).join("\n");
            return (t?.dataset.copy || "") + (x ? "\n" + x : "") + "\n\n" + SX_PLAY_GUIDE_FORMAT;
        }
        const SX_PLAY_GUIDE_FORMAT = [ "STRUCTURED PLAY GUIDE FORMAT — REQUIRED (Scene Sentinel Way B standard, guide-1106-0847)", "End your answer with a timed play guide in EXACTLY this format, so Scene Sentinel can read it back and run its timers. One step per line, every line in this shape:", "[MM:SS-MM:SS] Activity name — what happens in this step, in one or two sentences.", "Rules: (1) Time codes are elapsed time from the start of the scene, zero-based: the first step starts at 00:00, steps run back to back with no gaps or overlaps, and the last step ends at the planned scene length. Use MM:SS under an hour, H:MM:SS over an hour. (2) The activity name MUST be one of this fixed set, spelled exactly: Warm-up; Negotiation check; Bondage; Impact play; Sensation play; Teasing & denial; Oral; Manual stimulation; Penetrative sex; Orgasm control; Roleplay; Service; Worship; Free play; Aftercare; Other. Put anything else in the guidance after the dash, never in the activity name. (3) End with an Aftercare step. (4) After the timed steps, add one line: CHECK-IN EVERY: N MINUTES, with N between 1 and 15, so the app knows how often to pulse the watch for a check-in. (5) Keep the timed guide as plain lines — no tables, no bullet markers, no extra time formats anywhere else in the guide.", "Example:", "[00:00-05:00] Warm-up — Slow massage and teasing, building touch gradually.", "[05:00-20:00] Impact play — Flogging, starting light and checking in before building.", "[20:00-25:00] Aftercare — Water, blanket, quiet cuddling.", "CHECK-IN EVERY: 5 MINUTES" ].join("\n");

        function setterParticipantIds() {
            const ids = String(e.byId("negotiationDialog")?.dataset.participants || "").split(",").filter(Boolean);
            return ids.length >= 2 && Fu(ids), ids;
        }
        // Draft data computed once per open (writers refactor): the
        // open handler hands Fu the Iu() result it already computed
        // for the on-screen panel, instead of Fu recomputing the
        // full match a second time to rebuild the same documents.
        // Other callers pass nothing and Fu computes it, as before.
        function Fu(t, precomputed) {
            var n;
            const i = Cu(t), a = `${i.length || "5"} ${unitWord(i.length || "5", i.lengthUnit)}`, r = "concise" === i.detail ? "Concise: use short phase notes and only essential check-ins." : "detailed" === i.detail ? "High detail: include specific phase timing, transitions, role cues, check-ins, stop options, and aftercare steps." : "Balanced detail: include enough timing, transitions, role cues, check-ins, and aftercare to follow without over-scripting.";
            e.byId("negotiationPanel").dataset.copy = [ "AI PLAY-GUIDE REQUEST", `Create or randomize a practical play guide targeting approximately ${a}. ${r} Use PLAY GUIDE DATA as inspiration while treating NEGOTIATION CHECKLIST DATA as binding. Keep every hard limit completely out. Treat every red topic as a no for that person. Mention each discuss-first clash only as an explicit negotiation point, never as assumed consent or planned action. Work the agreed safewords and stop signals naturally into the guide, and build the aftercare section from every participant’s stated aftercare needs. If a field is not filled out, leave a clear pre-scene decision point instead of inventing an answer.`, "", Tu(n = precomputed || Iu(t)), "", Lu(n), "", sxRolesBlock(n.ids, n.names), "", sxCastBlock(n.ids, n.names), "", sxTermsBlock(n.ids, n.names), "", sxAgeBlock(n.ids, n.names), "", `HARD-EXCLUDED FROM SCENE GENERATION ${n.excluded.length ? n.excluded.map(e => `- ${e}`).join(" ") : n.mutuals.length ? "- no marked limits; mutual deep-red exclusions follow" : n.terms && n.terms.some(Boolean) ? "- no marked limits or mutual deep-red exclusions; limits named in the Terms above still apply" : "- none marked"}${n.mutuals.length ? ` MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED ${n.mutuals.map(e => `- ${e}`).join(" ")}` : ""}` ].join(" "), e.byId("negotiationPanel").dataset.playGuide = e.byId("negotiationPanel").dataset.copy, sxStoreNegotiationGuide(n);
        }
