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
            // by viewport chrome - the pair line is the content title, the
            // "Who's comparing?" picker stays, the rings carry the buckets
            // (topic lists live in the ring listing surface), and the
            // headline numbers live in the header Avatar rings. The hypermap itself,
            // in the map column below this chrome, is the viewport. The
            // legacy results assembly survives ONLY as the 4+-profile
            // group presentation (carve-out: no N-map layout is invented
            // for 4+); it stays hidden for 2- and 3-profile casts.
            sec.innerHTML = "bowtie" === tab.kind ? `<div class="sx-pair-line" data-sx-pair-line="" hidden=""></div><div data-sx-picker=""></div><div data-sx-rings=""></div><div data-sx-ring-listing=""></div><div class="sx-match-results" data-sx-legacy="" hidden=""></div>` : `<div class="sx-pair-line" data-sx-pair-line="" hidden=""></div><div data-sx-picker=""></div><div class="sx-stamp" data-sx-stamp="" data-sx-term="playMode,conversationMode"></div><div data-sx-rings=""></div><div data-sx-ring-listing=""></div>`;
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
            // Ring slots keep the crossed tab's slot order - positive band
            // on the green slot, middle on yellow, negative on red - while
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
        /* Circle-minus buckets (ruled 2026-11-21): the minus tab's
           rings sort the pair's shared topics by what circle minus
           measures — a topic carrying a split (sxDebateFeud) and no
           shared ground is Debate; a topic with both a split and
           shared ground is Mixed; shared ground with no split is
           Common ground. Ring slots keep the crossed tab's order:
           green, yellow, red. Membership is display-only, read off
           the straight register exactly as the straight bands are. */
        function sxMinusBuckets(pair) {
            const base = sxEmptyBuckets(), agree = [], mixed = [], debate = [];
            if (pair && pair.straight) pair.straight.topics.forEach(s => {
                if ("shared" !== s.status) return;
                const feud = sxDebateFeud(s),
                    hasAgree = (null != s.giveGive && s.giveGive > 0) || (null != s.recvRecv && s.recvRecv > 0) || (null != s.agreement && s.agreement > 0);
                if (feud > 0 && hasAgree) mixed.push(s);
                else if (feud > 0) debate.push(s);
                else if (hasAgree) agree.push(s);
            });
            debate.sort((x, y) => sxDebateFeud(y) - sxDebateFeud(x) || x.label.localeCompare(y.label)),
            mixed.sort((x, y) => x.label.localeCompare(y.label)), agree.sort((x, y) => x.label.localeCompare(y.label));
            const counts = [ agree.length, mixed.length, debate.length ], shares = uc(counts),
                names = [ "Common ground", "Mixed", "Debate" ], lists = [ agree, mixed, debate ];
            return base.map((b, i) => ({
                ...b,
                label: names[i],
                count: counts[i],
                percent: shares[i],
                topics: lists[i].map(s => s.label)
            }));
        }
        function sxRenderStraightTab(tab) {
            const ctx = sxTabContext(tab);
            sxRenderPairLine(tab, ctx);
            const pk = tab.section.querySelector("[data-sx-picker]");
            pk && (pk.innerHTML = sxPickerHtml());
            const st = tab.section.querySelector("[data-sx-stamp]");
            st && (st.textContent = ctx ? sxStamp(ctx) : "");
            const pair = ctx && 2 === ctx.profiles.length ? sxPairCompute(ctx.profiles[0], ctx.profiles[1], {
                heatA: sxHeatDisplayFor(sxKey(ctx, 0)), heatB: sxHeatDisplayFor(sxKey(ctx, 1)),
                veilA: sxVeilFor(sxKey(ctx, 0)), veilB: sxVeilFor(sxKey(ctx, 1))
            }) : null;
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
            // (sxStraightBandBuckets) and the ring listing surface only -
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
        function sxRenderMinusTab(tab) {
            const ctx = sxTabContext(tab);
            sxRenderPairLine(tab, ctx);
            const pk = tab.section.querySelector("[data-sx-picker]");
            pk && (pk.innerHTML = sxPickerHtml());
            const st = tab.section.querySelector("[data-sx-stamp]");
            st && (st.textContent = "");
            const pair = ctx && 2 === ctx.profiles.length ? sxPairCompute(ctx.profiles[0], ctx.profiles[1], {
                heatA: sxHeatDisplayFor(sxKey(ctx, 0)), heatB: sxHeatDisplayFor(sxKey(ctx, 1)),
                veilA: sxVeilFor(sxKey(ctx, 0)), veilB: sxVeilFor(sxKey(ctx, 1))
            }) : null;
            tab.buckets = sxMinusBuckets(pair), sxUpdateMatchRings(tab);
        }
        function sxRenderMatchTab(tab) {
            if (!tab || !tab.section) return;
            if ("circledot" === tab.kind) return void sxRenderStraightTab(tab);
            if ("circleminus" === tab.kind) return void sxRenderMinusTab(tab);
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
            // inversion is reversed - a match tab SHOWS map content, so the
            // map column is never hidden by a match tab. The stage carries
            // only the viewport chrome above the map. With no tab active the
            // stage hides and the profile map stands exactly as before
            // (restore-exactly invariant preserved).
            // Match-tab fix (2026-10-26): while a ⋈ Krossmatch tab is the
            // active tab the stage stays HIDDEN - the bowtie text panel is
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
        // opening a ⋈ comparison creates the group profile - the Save
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
            // pairs - the default below preserves their dedup exactly,
            // and a ⊙ open can never select a ⋈ group (or vice versa).
            if (!ids || ids.length < 2) return null;
            const want = new Set(ids), wantOp = sxNormalizePairOp(pairOp);
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
            // multi-selected, whether or not any settings changed -
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
        // profile, exactly the sxAutoCreateBowtie shape - find-or-mint
        // through the same Zd save, the same teardown, and the same
        // ordinary Js landing - differing only in pair kind (the ⊙
        // title join and pairOp record), in mode (Conversation, where
        // bowtie mints in Play), and in the map compute (Rd dispatches
        // straight pairs to the straight-register adapter). Straight
        // auto-create is pair-only: a cast of 3+ returns false and
        // the open falls through to the legacy ⊙ tab, as before -
        // whose header now shows the group Parlay aggregates from
        // sxGroupCompute (group-Parlay fix, 2026-10-30).
        function sxAutoCreateStraight(castIds, fresh) {
            const cast = (castIds || []).filter(id => vt[id]);
            if (2 !== cast.length) return !1;
            // Fork rule (owner ruling, 2026-10-27): a circle-dot TAP
            // always mints a fresh straight tab - taps never dedup.
            // Reopen/restore selects the existing tab (fresh unset).
            const existing = fresh ? null : sxFindGroupForCast(cast, "straight");
            // Identical straight pair already in-session: select it,
            // never mint a duplicate - in Conversation mode, the ⊙
            // register, on both the mint and the re-open landing.
            if (existing) return sxTeardownMatchTabs(), sxcv.mode = "conversation", Js(existing), !0;
            return sxcv.mode = "conversation", qd = cast.slice(), Zd("straight");
        }
        function sxAutoCreateMinus(castIds, fresh) {
            const cast = (castIds || []).filter(id => vt[id]);
            if (cast.length < 2) return !1;
            const existing = fresh ? null : sxFindGroupForCast(cast, "minus");
            if (existing) return sxTeardownMatchTabs(), sxcv.mode = "minus", Js(existing), !0;
            return sxcv.mode = "minus", qd = cast.slice(), Zd("minus");
        }
        function sxOpenMatchTab(kind) {
            const ctx = sxCompareContext();
            if (!ctx) return;
            // ⋈ and ⊙: opening auto-creates (or selects) the pair
            // group and lands on its profile tab - no match tab is
            // minted. If the cast cannot be saved (fewer than two live
            // profiles, or a ⊙ cast that is not exactly a pair), fall
            // through to the legacy tab so the open is never a dead
            // end.
            if ("bowtie" === kind && sxAutoCreateBowtie(ctx.ids, !0)) return;
            if ("circledot" === kind && sxAutoCreateStraight(ctx.ids, !0)) return;
            if ("circleminus" === kind && sxAutoCreateMinus(ctx.ids, !0)) return;
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
            // tab strip) is also an open - auto-create/select the pair
            // group and land on the group tab instead of showing the
            // match view. A saved tab's ids are its group's sourceIds,
            // so the same sameness test selects that very group. (A ⊙
            // tab only exists for casts the pair auto-create declined
            // - 3+ profiles - and those activate exactly as before.)
            if ("bowtie" === tab.kind && sxAutoCreateBowtie(tab.ids)) return;
            if ("circledot" === tab.kind && sxAutoCreateStraight(tab.ids)) return;
            if ("circleminus" === tab.kind && sxAutoCreateMinus(tab.ids)) return;
            // Mode follows the tab (2026-10-26): ⋈ Krossmatch activates in
            // Play, ⊙ Straight Talk in Conversation. There is no in-tab
            // mode switch anymore. ⊖ keeps its own mode and paints no score.
            sxcv.mode = "circledot" === tab.kind ? "conversation" : "circleminus" === tab.kind ? "minus" : "play";
            // Match-tab fix (2026-10-26): activation PAINTS the map -
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
                // longer sets the mode directly - it routes through tab
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
        // them - no computation reads, carries, or stores a leniency
        // value anymore (Dd's adapter slot is passed null at every
        // call site; the engines never read it). No live control ever
        // called the setter/handler - the only remaining caller was
        // the Scribe fallback in Jd, redesigned below to carry no
        // recompute side effect. What survives is display only: a
        // legacy group's stored field can still seed the Scribe
        // brief's displayed cast value in Jd, and the writers keep
        // their displayed cast number - neither is an input to any
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
