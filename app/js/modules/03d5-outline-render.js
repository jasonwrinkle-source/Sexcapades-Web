        function Cs(e = {}) {
            const t = Go;
            if (!t || t !== Et && !vt[t]) return;
            os.clear();
            if (window.__sxOnDeck) return __sxRenderOnDeck(t), void ws();
            // Build 2026-10-18_1549 — FetLife review mode (armed by the
            // post-import summary's “Rate the categories your kinks map
            // to” button): render only the mapped branches, collapsed.
            const sxReview = window.__sxFetLifeReview instanceof Set && window.__sxFetLifeReview.size ? window.__sxFetLifeReview : null;
            const i = Boolean(e.preserveDisclosure), a = i ? new Set(Array.from(Ro.querySelectorAll(".outline-branch[open]")).map(e => e.dataset.outlineBranch)) : null, r = i ? new Set(Array.from(Ro.querySelectorAll(".outline-branch.is-expanded")).map(e => e.dataset.outlineBranch)) : null, o = i ? new Set(Array.from(Ro.querySelectorAll('.outline-subcategory[data-subcategory-expanded="true"]')).map(e => e.dataset.outlineSubcategory)) : null, s = i ? new Set(Array.from(Ro.querySelectorAll('.outline-topic-label[data-outline-expandable="true"][aria-expanded="true"]')).map(e => __sxClosestAction(e, "outlineRow")?.dataset.outlineId).filter(Boolean)) : null, l = i ? new Map(Array.from(Ro.querySelectorAll(".outline-branch")).map(e => [ e.dataset.outlineBranch, Number(e.dataset.outlineVisible) || 3 ])) : new Map, c = i ? new Map(Array.from(Ro.querySelectorAll(".outline-subcategory")).map(e => [ e.dataset.outlineSubcategory, Number(e.dataset.outlineSubcategoryVisible) ]).filter(([, e]) => Number.isFinite(e) && e > 0)) : new Map;
            Oo.textContent = (t === Et ? "New profile" : wt[t] || "Profile") + (yt[t] ? " *" : ""), Ro.replaceChildren(),
            us(t).forEach(e => {
                const d = e.name, sxCatHit = Boolean(sxReview && sxReview.has(catId(d))), sxSubHit = Boolean(sxReview && (e.subcategories || []).some(s => sxReview.has(Un(d, s.name))));
                if (sxReview && !sxCatHit && !sxSubHit) return;
                const u = Boolean(e.risk), p = document.createElement("details");
                p.className = "outline-branch", p.dataset.outlineBranch = d, p.open = sxReview && !i ? !1 : !i || a.has(d);
                const h = document.createElement("summary"), g = document.createElement("span"), m = document.createElement("span"), f = document.createElement("span"), y = "Collapse or expand this branch. The topic total stays fixed for this list session.";
                if (g.className = "outline-branch-disclosure", g.textContent = "›", g.tabIndex = 0,
                g.dataset.tooltipTapFirst = "", g.dataset.outlineDisclosureTooltip = y, g.setAttribute("aria-label", y),
                g.setAttribute("aria-expanded", "false"), m.className = "outline-branch-title outline-description-trigger", m.setAttribute("role", "heading"), m.setAttribute("aria-level", "2"),
                m.textContent = d, m.dataset.outlineDescription = lo({
                    id: catId(d),
                    label: d,
                    branch: d,
                    kind: "Category"
                }), u) {
                    const e = document.createElement("span");
                    e.className = "outline-risk", e.textContent = "*", e.setAttribute("aria-label", "Higher-risk practice requiring specialized knowledge and explicit negotiation"),
                    m.append(e);
                }
                f.className = "outline-branch-count", h.append(g, m, f), p.append(h);
                const b = Es(ge[d], {
                    id: catId(d),
                    label: d,
                    branch: d,
                    kind: "Category"
                }, !0);
                b && (h.classList.add("has-popularity-icon"), g.after(b));
                const v = document.createElement("div");
                v.className = "outline-rows";
                const w = new Map, k = new Map, x = function(e = {}) {
                    const t = {
                        limit: Math.max(3, Number(e.limit) || 3),
                        categoryExpanded: Boolean(e.categoryExpanded),
                        eligibleIds: new Set,
                        expandedSubcategories: new Set(e.expandedSubcategoryIds || []),
                        subcategoryLimits: new Map(e.subcategoryLimits || []),
                        subcategoryOverviewLimits: new Map
                    };
                    return {
                        get limit() {
                            return t.limit;
                        },
                        isCategoryExpanded: () => t.categoryExpanded,
                        setCategoryExpanded: e => (t.categoryExpanded = Boolean(e), t.categoryExpanded),
                        setLimit: e => (t.limit = Math.max(3, Number(e) || 3), t.limit),
                        advance() {
                            return this.setLimit(t.limit + 3);
                        },
                        eligibleIds: e => (t.eligibleIds = new Set(e()), t.eligibleIds),
                        isSubcategoryExpanded: e => t.expandedSubcategories.has(e),
                        refreshSubcategoryOverview(e, n) {
                            t.subcategoryOverviewLimits.set(e, n), t.expandedSubcategories.has(e) || t.subcategoryLimits.set(e, n);
                        },
                        subcategoryLimit: e => t.subcategoryLimits.get(e) || 0,
                        setSubcategoryLimit: (e, n) => (t.subcategoryLimits.set(e, Math.max(0, Number(n) || 0)), t.subcategoryLimits.get(e) || 0),
                        toggleSubcategory: (e, n) => t.expandedSubcategories.has(e) ? (t.expandedSubcategories.delete(e),
                        t.subcategoryLimits.set(e, t.subcategoryOverviewLimits.get(e) ?? 0), !1) : (t.expandedSubcategories.add(e),
                        t.subcategoryLimits.set(e, n), !0)
                    };
                }({
                    limit: l.get(d),
                    categoryExpanded: !!r && r.has(d),
                    expandedSubcategoryIds: Array.from(o || []),
                    subcategoryLimits: c
                });
                e.topics.forEach((n, a) => {
                    const r = Vn(e, sxName(n));
                    let o = v, l = null;
                    if (r) {
                        const e = Un(d, r.name);
                        if (l = e, !w.has(e)) {
                            const t = document.createElement("div"), n = document.createElement("div"), i = document.createElement("span"), a = document.createElement("span"), o = document.createElement("span"), s = document.createElement("div"), l = "Shows the most popular kinks. Click to expand and show all kinks in this subcategory.";
                            t.className = "outline-subcategory", t.dataset.outlineSubcategory = e, t.dataset.subcategoryExpanded = x.isSubcategoryExpanded(e) ? "true" : "false",
                            x.isSubcategoryExpanded(e) && t.classList.add("is-expanded"), i.className = "outline-branch-disclosure outline-subcategory-disclosure",
                            i.textContent = "›", i.tabIndex = 0, i.dataset.tooltipTapFirst = "", i.dataset.outlineDisclosureTooltip = l,
                            i.setAttribute("aria-label", l), i.setAttribute("role", "button"), i.setAttribute("aria-expanded", x.isSubcategoryExpanded(e) ? "true" : "false"),
                            a.className = "outline-subcategory-title outline-description-trigger", a.textContent = r.name,
                            a.dataset.outlineDescription = lo({
                                id: e,
                                label: r.name,
                                branch: d,
                                kind: "Subcategory"
                            }), o.className = "outline-subcategory-count", o.textContent = `0 of ${r.topics.length} shown`,
                            n.className = "outline-subcategory-summary", n.setAttribute("role", "button"), n.tabIndex = 0,
                            n.setAttribute("aria-expanded", x.isSubcategoryExpanded(e) ? "true" : "false"),
                            s.className = "outline-subcategory-rows", n.append(i, a, o), t.append(n, s), v.append(t),
                            w.set(e, {
                                group: t,
                                summary: n,
                                rows: s,
                                count: o,
                                name: r.name
                            });
                            const c = Es(Ae(r.name, d), {
                                id: e,
                                label: r.name,
                                branch: d,
                                kind: "Subcategory",
                                topics: r.topics
                            });
                            c && (n.classList.add("has-popularity-icon"), i.after(c));
                        }
                        o = w.get(e).rows;
                    }
                    const c = Wn(n), p = function(e, t = e => e) {
                        return U(e, e => sxTopicPopularity(e, t(e)?.label), e => {
                            const n = t(e) || e;
                            return n?.label || e;
                        });
                    }(ai(c, t).filter(e => (at[t] || {})[e]), e => (at[t] || {})[e]), h = i ? s.has(c) : (sxReview ? !1 : function(e, t) {
                        if (!e.length) return !1;
                        let n = !1, i = !0;
                        return e.forEach(e => {
                            const a = ca(e, t), keys = (a.keys && Array.isArray(a.keys)) ? a.keys : [ "give", "receive" ], r = keys.map(k => Boolean(a[k + "Known"]));
                            r.some(Boolean) && (n = !0), r.every(Boolean) || (i = !1);
                        }), n && !i;
                    }(p, t)), g = As({
                        id: c,
                        label: n,
                        branch: d,
                        kind: "Topic",
                        risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                        expandable: p.length > 0,
                        expanded: h
                    }, t);
                    if (g.dataset.outlineBranch = d, g.dataset.outlineTopicRank = String(e.outlineTopicRanks?.get(c) ?? a),
                    l) {
                        const e = k.get(l) || 0;
                        g.dataset.outlineSubcategoryRank = String(e), k.set(l, e + 1);
                    }
                    o.append(g), p.forEach(e => {
                        const n = As({
                            id: e,
                            label: (at[t] || {})[e].label || e,
                            branch: d,
                            kind: "Imported",
                            risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                            parentId: c
                        }, t);
                        n.hidden = !h, o.append(n);
                    });
                });
                const S = document.createElement("button");
                S.type = "button", S.className = "outline-more", n(S, '<span class="outline-more-label"></span>'),
                v.append(S), p.append(v), Ro.append(p);
                const $ = e => {
                    const n = Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineTopicRank) - Number(t.dataset.outlineTopicRank)), i = Array.from(v.querySelectorAll(".outline-row[data-outline-id]")), a = x.setLimit(e);
                    p.dataset.outlineVisible = String(a);
                    const r = x.eligibleIds(() => i.filter(e => !ls(e.dataset.outlineId, t) || os.has(e.dataset.outlineId)).map(e => e.dataset.outlineId)), o = n.filter(e => r.has(e.dataset.outlineId)), s = Math.min(o.length, a), l = new Set(o.slice(0, s).map(e => e.dataset.outlineId)), priorRated = Uo.checked ? n.filter(e => ls(e.dataset.outlineId, t) && !os.has(e.dataset.outlineId)) : [], c = new Set(o.slice(0, 3).map(e => e.dataset.outlineId));
                    priorRated.forEach(e => l.add(e.dataset.outlineId));
                    w.forEach((e, t) => {
                        const n = Array.from(e.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineSubcategoryRank) - Number(t.dataset.outlineSubcategoryRank)), i = x.isSubcategoryExpanded(t) ? n : n.filter(e => r.has(e.dataset.outlineId)), a = i.filter(e => c.has(e.dataset.outlineId)).length;
                        x.refreshSubcategoryOverview(t, a), i.slice(0, Math.min(i.length, x.subcategoryLimit(t))).forEach(e => l.add(e.dataset.outlineId)),
                        e.localRows = n, e.localEligible = i;
                    }), n.forEach(e => {
                        const t = l.has(e.dataset.outlineId), isPriorRating = Uo.checked && priorRated.includes(e);
                        e.hidden = !t, e.style.order = isPriorRating ? "2" : "";
                        const n = e.querySelector('.outline-topic-label[data-outline-expandable="true"]'), i = n && "false" !== n.getAttribute("aria-expanded");
                        $s(v, e.dataset.outlineId).forEach(e => {
                            e.hidden = !t || !i || !r.has(e.dataset.outlineId), e.style.order = isPriorRating ? "2" : "";
                        });
                    });
                    const u = n.filter(e => !e.hidden), h = o.filter(e => !l.has(e.dataset.outlineId)).length;
                    f.textContent = `${u.length} of ${n.length} shown`;
                    const m = x.isCategoryExpanded();
                    p.classList.toggle("is-expanded", m), g.setAttribute("aria-expanded", String(m)),
                    w.forEach((e, t) => {
                        const n = e.localRows.filter(e => !e.hidden).length;
                        e.localEligible.filter(e => !l.has(e.dataset.outlineId)).length, e.count.textContent = `${n} of ${e.localRows.length} shown`,
                        e.group.dataset.outlineSubcategoryVisible = String(x.subcategoryLimit(t));
                        const i = x.isSubcategoryExpanded(t);
                        e.group.dataset.subcategoryExpanded = i ? "true" : "false", e.group.classList.toggle("is-expanded", i),
                        e.summary.setAttribute("aria-expanded", String(i)), e.summary.querySelector(".outline-subcategory-disclosure")?.setAttribute("aria-expanded", String(i)),
                        e.group.hidden = !i && 0 === n;
                    }), S.hidden = h <= 0, S.dataset.outlineVisible = String(a), S.setAttribute("aria-label", h > 0 ? `${ss} topics in ${d}` : `All available topics shown in ${d}`),
                    S.querySelector(".outline-more-label").textContent = h > 0 ? ss : "";
                };
                w.forEach((e, t) => {
                    const n = () => {
                        const n = e.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        x.isSubcategoryExpanded(t) || getOutlineRows(e.rows).forEach(e => os.delete(e.dataset.outlineId)),
                        x.toggleSubcategory(t, window.__sxFetLifeReview ? Math.min(3, n) : n), $(x.limit);
                    };
                    e.summary.addEventListener("click", e => {
                        e.preventDefault(), n();
                    }), e.summary.addEventListener("keydown", e => {
                        "Enter" !== e.key && " " !== e.key || __sxClosestAction(e.target, "outlineSubcategoryDisclosure") || (e.preventDefault(),
                        n());
                    });
                }), p._syncOutlineVisibility = $, p.addEventListener("toggle", () => {
                    p.open ? (getOutlineRows(p).forEach(e => os.delete(e.dataset.outlineId)),
                    $(x.limit)) : (p.classList.remove("is-expanded"), g.setAttribute("aria-expanded", "false"));
                });
                const E = () => {
                    if (p.open || (p.open = !0), x.isCategoryExpanded()) x.setCategoryExpanded(!1),
                    w.forEach((e, t) => {
                        x.isSubcategoryExpanded(t) && x.toggleSubcategory(t, 0);
                    }), $(3); else {
                        x.setCategoryExpanded(!0), getOutlineRows(p).forEach(e => os.delete(e.dataset.outlineId));
                        const e = v.querySelectorAll(".outline-row[data-outline-topic-rank]").length;
                        $(Math.max(e, 3));
                    }
                };
                p._toggleOutlineCategory = E, h.addEventListener("click", e => {
                    e.preventDefault(), Rs && e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") === Rs || E();
                }), $(x.limit), S.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation();
                    const t = new Set(Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).filter(e => e.hidden));
                    $(x.advance());
                    const n = Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineTopicRank) - Number(t.dataset.outlineTopicRank)).find(e => t.has(e) && !e.hidden)?.querySelector(".outline-topic-label");
                    n?.focus({
                        preventScroll: !0
                    });
                });
                const sxHits = window.__sxOutlineHits;
                if (sxHits && sxHits.size && !sxReview) {
                    sxHits.has(catId(d)) && (p.open = !0);
                    w.forEach((grp, subId) => {
                        if (!sxHits.has(subId)) return;
                        p.open = !0, x.isSubcategoryExpanded(subId) ? x.setSubcategoryLimit(subId, Math.max(3, x.subcategoryLimit(subId))) : x.toggleSubcategory(subId, 3);
                        const total = grp.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        if (total > 3) {
                            const btn = document.createElement("button");
                            btn.type = "button", btn.className = "outline-more outline-more-subcategory", btn.setAttribute("aria-label", `Show the next three popular topics in ${grp.name}`), n(btn, '<span class="outline-more-label">+3 more</span>'), btn.hidden = x.subcategoryLimit(subId) >= total, btn.addEventListener("click", ev => {
                                ev.preventDefault(), ev.stopPropagation(), x.setSubcategoryLimit(subId, Math.min(total, x.subcategoryLimit(subId) + 3)), $(x.limit), btn.hidden = x.subcategoryLimit(subId) >= total;
                            }), grp.rows.append(btn);
                        }
                    }), $(x.limit);
                }
                if (sxReview) {
                    // Review mode: branches stay collapsed (no auto-expand).
                    // When only some subcategories of this category were
                    // hit, hide the other subcategory groups and the
                    // category's own direct topic rows; hit subcategories
                    // get the same top-3 “+3 more” stepper the auto-expand
                    // path uses, revealed when the user expands them.
                    if (!sxCatHit) w.forEach((grp, subId) => {
                        sxReview.has(subId) || (grp.group.style.display = "none");
                    }), Array.from(v.querySelectorAll(":scope > .outline-row")).forEach(r => r.style.display = "none");
                    w.forEach((grp, subId) => {
                        if (!sxCatHit && !sxReview.has(subId)) return;
                        const total = grp.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        if (total > 3) {
                            const btn = document.createElement("button");
                            btn.type = "button", btn.className = "outline-more outline-more-subcategory", btn.setAttribute("aria-label", `Show the next three popular topics in ${grp.name}`), n(btn, '<span class="outline-more-label">+3 more</span>'), btn.hidden = x.subcategoryLimit(subId) >= total, btn.addEventListener("click", ev => {
                                ev.preventDefault(), ev.stopPropagation(), x.setSubcategoryLimit(subId, Math.min(total, x.subcategoryLimit(subId) + 3)), $(x.limit), btn.hidden = x.subcategoryLimit(subId) >= total;
                            }), grp.rows.append(btn);
                        }
                    });
                }
            }), sxApplyOutlineSearch(), ws();
        }
        /* Hot List skin rebuild (2026-11-18, gate → Hot List defect):
           the bundle boots the #app/list route (Ms → Cs below) from the
           Sexcapades taxonomy BEFORE the skin loader swaps in the boot
           skin — and the loader's rerender() repaints only the map, so
           a Hot List opened straight from the gate kept Sexcapades
           topics even after the skin loaded (live-verified: Dharma boot
           showed 18 Sexcapades branches / 381 rows with the skin active
           and the header already reading "0 of 28"). The loader calls
           this hook after every skin load and switch-back: if the Hot
           List dialog is open it rebuilds it from the CURRENT taxonomy
           (Cs reads the live categories array), with fresh-open
           semantics — no preserveDisclosure, so it lands exactly as a
           list opened after the skin loaded does. A no-op when the
           dialog is closed (later opens build fresh via Ms). Ratings
           live in profile state, not in the rows, so a rebuild keeps
           them; timer and dialog state are untouched (this is Cs, not
           Ms). */
        function sxIsBootSkinPending() {
            try {
                const active = window.__SX_ACTIVE_SKIN || null;
                let target = "sexcapades";
                if (typeof window.__SX_SKIN_FROM_URL === "function") {
                    const u = window.__SX_SKIN_FROM_URL();
                    if (u) target = u;
                    else if (typeof window.__SX_SKIN_FOR_HOSTNAME === "function") {
                        target = window.__SX_SKIN_FOR_HOSTNAME(location.hostname);
                    }
                }
                return active !== target;
            } catch (e) {
                return false;
            }
        }
        window.__SX_IS_BOOT_SKIN_PENDING = sxIsBootSkinPending;
        window.__SX_REBUILD_OUTLINE = function () {
            if (window.__SX_PENDING_OUTLINE_BOOT) {
                const pendingArg = window.__SX_PENDING_OUTLINE_BOOT;
                window.__SX_PENDING_OUTLINE_BOOT = null;
                Ms(pendingArg, !0);
                document.documentElement.classList.remove("route-listview-pending");
                return true;
            }
            Ro.dataset.outlineProfile = "";
            Ro.dataset.outlineSkin = "";
            if (!Do || !Do.open) return false;
            Cs();
            Ro.dataset.outlineProfile = Go || "";
            Ro.dataset.outlineSkin = String(window.__SX_ACTIVE_SKIN || "sexcapades");
            if (typeof window.__SX_SYNC_OUTLINE_LADDER === "function") window.__SX_SYNC_OUTLINE_LADDER();
            return true;
        };
        let sxOutlineScrollTop = 0, sxOutlineScrollLeft = 0, sxOutlinePausedByViewSwitch = !1, sxOutlineRatedAtOpen = -1;
        function sxOutlineScroller() {
            return Do && Do.querySelector(".outline-shell") || Ro;
        }
        function Ms(n = Vi(), forceFresh = !1) {
            p("quickstart_started");
            if (sxIsBootSkinPending()) {
                window.__SX_PENDING_OUTLINE_BOOT = n || Vi();
                return;
            }
            const i = n === Et;
            if (!i && !vt[n]) return Vy = e => Ms(e, !0), void bw(null);
            const curSkin = String(window.__SX_ACTIVE_SKIN || "sexcapades");
            const hasSpecialMode = Boolean(window.__sxFetLifeReview instanceof Set && window.__sxFetLifeReview.size) || Boolean(window.__sxOutlineHits && window.__sxOutlineHits.size);
            const canResumeView = !forceFresh && !hasSpecialMode && Go === n && Ro && Ro.children.length > 0 && Ro.dataset.outlineProfile === String(n) && Ro.dataset.outlineSkin === curSkin;
            if (canResumeView) {
                e.byId("doneOutlineButton").textContent = i ? "Create profile from ratings" : "Submit what you’ve got";
                pw(!i);
                Oo.textContent = (n === Et ? "New profile" : wt[n] || "Profile") + (yt[n] ? " *" : "");
                sxOutlineRatedAtOpen = cs(n).rated;
                Wi(Do);
                if (sxOutlinePausedByViewSwitch) {
                    sxOutlinePausedByViewSwitch = !1;
                    ks(!1);
                } else {
                    hs(), ws();
                }
                sxOutlineScroller().scrollTop = sxOutlineScrollTop;
                sxOutlineScroller().scrollLeft = sxOutlineScrollLeft;
                requestAnimationFrame(() => {
                    sxOutlineScroller().scrollTop = sxOutlineScrollTop;
                    sxOutlineScroller().scrollLeft = sxOutlineScrollLeft;
                });
                return;
            }
            const a = i ? null : St(mt[n]).outline, r = cs(n);
            Jo = r.total > 0 && r.rated === r.total, t.clear(Xo), Xo = 0, Go = n, Ko = null,
            Yo = 1e3 * (a?.durationSeconds || 0), Zo = Jo, Qo = Boolean(a?.timerRan) || !Zo,
            Vo = Zo ? 0 : Date.now(), !Jo && Zo && (Zo = !1, Vo = Date.now(), Qo = !0), Uo.checked = !1,
            sxOutlinePausedByViewSwitch = !1, sxOutlineRatedAtOpen = r.rated,
            e.byId("doneOutlineButton").textContent = i ? "Create profile from ratings" : "Submit what you’ve got",
            pw(!i), Cs(), Ro.dataset.outlineProfile = String(n), Ro.dataset.outlineSkin = curSkin,
            hs(), sxPaintOutlineLadder(), ws(), Zo || (Xo = t.setInterval(ws, 1e3));
            const o = e.byId("outlineQuickstartTip");
            o && (o.hidden = is), Wi(Do), sxOutlineScrollTop = 0, sxOutlineScrollLeft = 0, sxOutlineScroller().scrollTop = 0, sxOutlineScroller().scrollLeft = 0, requestAnimationFrame(() => (sxOutlineScroller().scrollTop = 0, sxOutlineScroller().scrollLeft = 0, Do.querySelector("summary")?.focus({ preventScroll: true })));
        }
        function Is(n = !0, skipPaint = !1) {
            if (!Do.open) return;
            sxOutlineScrollTop = sxOutlineScroller().scrollTop;
            sxOutlineScrollLeft = sxOutlineScroller().scrollLeft;
            try {
                bs();
            } catch (e) { __sxErrLog("ui-refresh", e); }
            js(), pw(!1);
            const i = Go;
            const a = zo;
            zo = null, Ys(a);
            if (!n) {
                // Explicit submit ("Submit what you've got"): finalize session and refit map
                sxOutlineSortMode = "popularity", window.__sxFetLifeReview = null;
                window.__sxOnDeckClear && window.__sxOnDeckClear();
                t.clear(Xo), Xo = 0, Ui(Do), e.byId("doneOutlineButton").textContent = i === Et ? "Create profile from ratings" : "Submit what you’ve got",
                Go = null, Ko = null, Vo = 0, Yo = 0, Zo = !0, Qs = !1, Qo = !1, Jo = !1, sxOutlinePausedByViewSwitch = !1;
                if (Ro) { Ro.dataset.outlineProfile = ""; Ro.replaceChildren(); }
                const r = i === Et && Object.keys(At).length > 0;
                i && vt[i] || r ? (ji(i, {
                    forceRated: !Bi(i)
                }), Jw(), skipPaint || (Mr({
                    animate: !1,
                    forceRepaint: !0
                }), Ih())) : skipPaint || Mr();
            } else {
                // View switch away from Hot List: preserve in-progress DOM, scroll, search, and map camera/selection
                if (!Zo) {
                    sxOutlinePausedByViewSwitch = !0;
                    ks(!0);
                }
                if (i && vt[i] && Qo) {
                    const e = cs(i);
                    $t(i, "outline", ps(), e.rated, e.total, {
                        timerRan: !0
                    });
                }
                Ui(Do);
                const ratedNow = i ? cs(i).rated : -1;
                if (!skipPaint && ratedNow !== sxOutlineRatedAtOpen) {
                    Jw();
                    Mr({ animate: !1 });
                }
            }
            let o = String(location.hash || "");
            try {
                o = decodeURIComponent(o);
            } catch (e) { __sxErrLog("hash-decode", e); }
            /^#\/?(app\/)?(?:list|listview)\/?$/i.test(o) && (history.replaceState(null, "", "#app"),
            rS = !1), vc();
        }
        // Non-route list-close chunk + indicate (2026-10-28): the
        // Is() fix (Option 1) made route-bound closes skip Is()'s
        // paint entirely, but the NON-route closes — Submit, Escape,
        // backdrop, cancel — still paint once via Is(), synchronously
        // and unindicated. This wrapper gives exactly those closes
        // the route render's treatment, modeled on sxRouteRender:
        // arm the "Building your map…" overlay session
        // (__sxLoadSessionStart — its map-complete gate holds the
        // session through any settle/blit tail after the paint) and
        // the #9 paintbrush pill (__sxPillSessionStart/Finish), defer
        // the close behind the house double-rAF + setTimeout(0)
        // pattern so the armed state paints before work begins, and
        // set the one-shot __sxCloseChunkPaint flag immediately
        // before the close runs so Is()'s Mr consumes it and paints
        // chunked. The pill finishes on the overlay session's
        // onDone — the same completion signal sxRouteRender uses —
        // so pill, overlay and tail share exactly one window and
        // clear together. No button is marked: Submit and cancel are
        // dialog buttons that vanish at close, and Escape / backdrop
        // press no button at all, so there is no persistent button
        // for these closes. When either surface cannot arm (a
        // session is already active), or the map sits in its
        // safe-fallback state (jn — Mr would refuse the paint and no
        // checkpoint would ever drive an armed session), the close
        // runs exactly as before: synchronous, unflagged, inside
        // this call. Route-bound closes never pass through here —
        // the hashchange handler's skipPaint path is untouched.
        function sxChunkClose(run) {
            let pillToken = null, armed = !1;
            const pillDone = () => {
                if (!pillToken) return;
                const t = pillToken;
                pillToken = null;
                try {
                    window.__sxPillSessionFinish(t);
                } catch (e) { __sxErrLog("close-paint-pill-finish", e); }
            };
            if (!jn) try {
                if ("function" == typeof window.__sxPillSessionStart) pillToken = window.__sxPillSessionStart({
                    button: null
                });
                if ("function" == typeof window.__sxLoadSessionStart) armed = !!window.__sxLoadSessionStart({
                    onDone: pillDone
                });
            } catch (e) { __sxErrLog("close-paint-arm", e); }
            const doClose = () => {
                if (armed && Do.open) window.__sxCloseChunkPaint = 50;
                run();
                if (!armed) pillDone();
            };
            if (armed && window.requestAnimationFrame) requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(doClose, 0))); else doClose();
        }
        function Ps() {
            as = null, Ui(e.byId("outlinePayoffDialog"));
        }
        function Ls(t, n) {
            !(t && vt[t] && n) || n.rated < 1 || rs.has(t) || (rs.add(t), as = t, e.byId("outlinePayoffMessage").textContent = `${n.rated} topic${1 === n.rated ? " is" : "s are"} rated. Use them now, even if you want to finish the rest later.`,
            Wi(e.byId("outlinePayoffDialog")), e.byId("outlinePayoffStory").hidden = Yi().length < 1, requestAnimationFrame(() => (Yi().length < 1 ? e.byId("outlinePayoffCard") : e.byId("outlinePayoffStory")).focus({
                preventScroll: !0
            })));
        }
        function Ts(e) {
            return e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY) ? {
                x: e.clientX,
                y: e.clientY,
                pointerType: e.pointerType || "mouse"
            } : null;
        }
        const Fs = (() => {
            const n = e.byId("uiTooltip"), i = e.byId("uiTooltipName"), a = e.byId("uiTooltipDefinition"), r = e.byId("uiTooltipValue");
            let o = null, s = null, l = 0;
            function c() {
                t.clear(l), l = 0, o?.isConnected && "uiTooltip" === o.getAttribute("aria-describedby") && o.removeAttribute("aria-describedby"),
                o = null, s = null, n.classList.remove("ui-tooltip--panel"), n.hidden = !0, i.textContent = "", a.textContent = "", r.textContent = "",
                n.parentNode !== document.body && document.body.appendChild(n);
            }
            function d(e = s, t = o) {
                s = e, t && t.isConnected && !n.hidden && function(e, t, n) {
                    if (!e || e.hidden) return;
                    const i = e.getBoundingClientRect(), a = 12, r = Math.max(8, innerWidth - i.width - 8), o = Math.max(8, innerHeight - i.height - 8);
                    let s, l;
                    if (t && Number.isFinite(t.x) && Number.isFinite(t.y)) "touch" === t.pointerType ? (s = t.x - i.width / 2,
                    l = t.y - i.height - a - 10, l < 8 && (l = t.y + a + 10)) : (s = t.x + a, l = t.y + a,
                    s + i.width > innerWidth - 8 && (s = t.x - i.width - a), l + i.height > innerHeight - 8 && (l = t.y - i.height - a)); else {
                        if (!n || !n.isConnected) return;
                        {
                            const e = n.getBoundingClientRect();
                            s = e.left + e.width / 2 - i.width / 2, l = e.bottom + 7, l + i.height > innerHeight - 8 && (l = e.top - i.height - 7);
                        }
                    }
                    e.style.left = `${Math.max(8, Math.min(r, s))}px`, e.style.top = `${Math.max(8, Math.min(o, l))}px`;
                }(n, s, t);
            }
            return {
                element: n,
                show: function(e, u = {}) {
                    if (!e) return void c();
                    const p = function(e, t = {}) {
                        const n = e?.dataset || {}, i = "string" == typeof t ? {
                            definition: t
                        } : t, a = i.name ?? n.tooltipName ?? function(e) {
                            const t = e?.dataset?.tooltipName;
                            if (t) return t;
                            const n = e?.getAttribute?.("aria-label") || "";
                            return n ? n.replace(/\.(?:\s|$)[\s\S]*$/, "").replace(/\s+(?:concept line|topic symbol|branch symbol)$/i, "").trim() : String(e?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90) || "Details";
                        }(e), r = i.definition ?? n.tooltipDefinition ?? n.uiTooltip ?? "", o = i.value ?? n.tooltipValue ?? "";
                        return {
                            name: String(a || "Details"),
                            definition: String(r || ""),
                            value: null == o ? "" : String(o)
                        };
                    }(e, u);
                    if (!p.name && !p.definition && !p.value) return void c();
                    t.clear(l), o && o !== e && o.isConnected && "uiTooltip" === o.getAttribute("aria-describedby") && o.removeAttribute("aria-describedby"),
                    o = e, s = u.point ?? null, n.classList.toggle("ui-tooltip--panel", Boolean(e.closest && e.closest(".layout-editor"))), i.textContent = p.name, a.textContent = p.definition,
                    a.hidden = !p.definition, r.textContent = p.value;
                    const h = (e.closest ? e.closest("dialog") : null) || document.body;
                    n.parentNode !== h && h.appendChild(n), n.hidden = !1, e.setAttribute("aria-describedby", "uiTooltip"),
                    d(s, e), u.autoHide && (l = t.setTimeout(() => {
                        o === e && c();
                    }, Number(u.duration) || 3200));
                },
                hide: c,
                position: d,
                visibleFor: function(e) {
                    return !n.hidden && o === e;
                },
                get anchor() {
                    return o;
                },
                get point() {
                    return s;
                }
            };
        })();
        let Ns = null, _s = null, Ds = null, Rs = null, Os = 0, sxOutlineLastEl = null, sxOutlineLastTime = 0, sxOutlineLastX = 0, sxOutlineLastY = 0;
        // Double-click opens the placard (2026-11-25): the single-click
        // toggle below is deferred briefly so a double-click can claim
        // the gesture for the placard instead of flickering the
        // expand/collapse first.
        let sxOutlineClickTimer = 0, sxOutlineClickTarget = null;
        /* Canvas pole-label hover hook (widget approachability): a canvas
           has no DOM node per pole, so the paint module calls this with
           the canvas as anchor, the pole's full label as name, and its
           "Label — text" line as the definition. */
        window.__SX_TIP_SHOW = function (anchorEl, name, text, clientX, clientY) {
            if (!anchorEl) return;
            let tipName = name || "Details";
            let tipDef = text || "";
            if (tipDef) {
                const sep = tipDef.indexOf(" — ");
                if (sep !== -1) {
                    if (!name || name === "Details" || tipDef.startsWith(name + " — ")) {
                        tipName = tipDef.slice(0, sep).trim();
                        tipDef = tipDef.slice(sep + 3).trim();
                    }
                }
            }
            Fs.show(anchorEl, {
                name: tipName,
                definition: tipDef,
                value: "",
                point: (Number.isFinite(clientX) && Number.isFinite(clientY)) ? { x: clientX, y: clientY, pointerType: "mouse" } : null
            });
        };
        window.__SX_TIP_HIDE = function () { Fs.hide(); };
        const Bs = window.matchMedia ? window.matchMedia("(hover: hover)") : {
            matches: !0
        };
        function js() {
            Ns && Fs.visibleFor(Ns) && Fs.hide(), Ns = null, _s = null;
        }
        function qs(e, t, n = null) {
            if (!e || !t) return void js();
            Ns = e, _s = n;
            const i = getOutlineRow(e), a = i?.dataset.outlineId, r = e.querySelector?.("[data-outline-direction]")?.dataset.outlineDirection, o = a && r ? ca(a, Go) : null, s = o && Boolean(o[r + "Known"]), l = e.dataset.tooltipValue || (r ? s ? ba(o[r]) : "Unrated" : /(?:rating|popularity)\s*([+-]?\d+(?:\.\d+)?(?:\/100|%)?)/i.exec(t)?.[1] || "");
            Fs.show(e, {
                name: e.dataset.tooltipName || Hs(e),
                definition: e.dataset.popularityTooltip ? t.split("\n").slice(1).join("\n") : t,
                value: l,
                point: n
            });
        }
        function Hs(e) {
            return e.dataset.popularityTooltip ? "Popularity" : e.dataset.ratingTooltip ? (e.textContent?.trim() || e.querySelector?.(".outline-rating-label")?.textContent?.trim() || "Rating") : getOutlineRow(e)?.querySelector?.(".outline-topic-label")?.textContent?.trim() || e.getAttribute("aria-label") || "Topic details";
        }
        function Ws(e, t) {
            qs(e, e?.dataset.outlineDescription || "", t);
        }
        function Us(e) {
            return e instanceof Element ? __sxClosestAction(e, "outlineTooltipSource") : null;
        }
        function Gs(e) {
            return e?.dataset.outlineDisclosureTooltip || e?.dataset.outlineDescription || e?.dataset.popularityTooltip || e?.dataset.ratingTooltip || "";
        }
        function Ks() {
            Ds?.timer && t.clear(Ds.timer), Ds = null;
        }
        function zs(e) {
            Rs = e, t.clear(Os), Os = t.setTimeout(() => {
                Rs = null;
            }, 900);
        }
        function Vs(e) {
            if ("true" !== e.dataset.outlineExpandable) return !1;
            const t = getOutlineRow(e), n = t?.dataset.outlineId;
            if (!n) return !1;
            const i = !("false" !== e.getAttribute("aria-expanded"));
            return e.setAttribute("aria-expanded", String(i)), $s(Ro, n).forEach(e => {
                e.hidden = !i;
            }), !0;
        }
        // Single-click on a topic label (2026-11-25): the toggle the row
        // click handler used to do at once — close the open description,
        // or expand/collapse a parent topic. The branch (close vs.
        // expand) is captured at click time, so a state change inside
        // the defer window cannot flip it.
        function sxOutlineDescClickToggle(n, isClose) {
            if (isClose) { Rs = null; window.clearTimeout(Os); }
            else if (__sxClosestAction(n, "summaryAncestor")) { js(); }
            else { Vs(n); }
        }
        function sxOutlineDescClickWillToggle(n) {
            if (Rs === n) return true;
            if (__sxClosestAction(n, "summaryAncestor")) return false;
            return "true" === n.dataset.outlineExpandable && !!getOutlineRow(n)?.dataset.outlineId;
        }
        // Double-click on a Hot List row opens the topic placard
        // (2026-11-25). Interactive controls keep their own gestures
        // (fader drag, mark and note buttons), so a double-click there
        // does not open the placard.
        function sxOutlineRowDblclick(e) {
            if (!(e.target instanceof Element)) return false;
            if (e.target.closest(".outline-rating-group, input, button, textarea, select")) return false;
            const row = __sxClosestAction(e.target, "outlineRow");
            if (!row || !row.dataset.outlineId) return false;
            if (sxOutlineClickTimer) { window.clearTimeout(sxOutlineClickTimer); sxOutlineClickTimer = 0; sxOutlineClickTarget = null; }
            js();
            if (Rs && row.contains(Rs)) { Rs = null; window.clearTimeout(Os); }
            if (typeof xo !== "function") return false;
            e.preventDefault(), e.stopPropagation();
            const r = row.getBoundingClientRect();
            xo(row.dataset.outlineId, r.left + r.width / 2, r.bottom + 8);
            return true;
        }
        // Appetite arm for the inline row sliders (2026-11-25): the
        // map-inline fader is a true cross slider in fader dress, so
        // a vertical drag while holding the handle opens the arm and
        // sets the appetite -- the plain slider is supplanted by the
        // cross slider for exactly this. Same mechanism as the 03f3
        // cross slider: the arm is an overlay that reserves no layout
        // space, the same rectangular tab rides it, green top /
        // yellow zero / red bottom rail, ticks -100/-50/0/50/100,
        // Appetite/Aversion labels, and a numeric bubble beside the
        // handle while dragging. The arm is driven by the window
        // pointermove/pointerup/pointercancel listeners (the row's
        // Xs / pointerup / pointercancel), never by pointer capture
        // (capture is attempted on the input as a convenience, in
        // try/catch, exactly as 03f3 does); a lostpointercapture is
        // treated as a release. The arm opens only after the pointer
        // has moved 10px vertically, so a purely horizontal drag
        // never shows it.
        var sxOutlineArmNode = null;
        function sxOutlineArmEl() {
            if (sxOutlineArmNode) return sxOutlineArmNode;
            var arm = document.createElement("div");
            arm.className = "outline-arm";
            arm.setAttribute("aria-hidden", "true");
            arm.hidden = true;
            arm.innerHTML =
                '<div class="outline-arm-rail"></div>' +
                '<div class="outline-arm-labels"><span class="up">Appetite</span><span class="down">Aversion</span></div>' +
                '<div class="outline-arm-handle"></div>' +
                '<div class="outline-arm-bubble"></div>';
            [-100, -50, 0, 50, 100].forEach(function (t) {
                var el = document.createElement("div");
                el.className = "outline-arm-tick" + (t === 0 ? " zero" : "");
                el.dataset.tick = t;
                el.innerHTML = "<span>" + (t > 0 ? "+" + t : t) + "</span>";
                el.style.top = (16 + (1 - (t + 100) / 200) * 160) + "px";
                arm.appendChild(el);
            });
            document.body.append(arm);
            sxOutlineArmNode = arm;
            return arm;
        }
        // Pure appetite mapping (harness-extractable): vertical travel
        // from the drag start maps onto -100..+100 over the rail's
        // usable height, exactly as 03f3's arm does.
        function sxOutlineArmAppetite(startApp, startY, clientY, inner) {
            var h = Math.max(40, Number(inner) || 160);
            return Math.max(-100, Math.min(100, Math.round((Number(startApp) || 0) + (Number(startY) - Number(clientY)) * (200 / h))));
        }
        // Position the arm over the handle (centred on the row) and
        // place the tab + bubble for the given appetite. The arm's
        // left follows the thumb as the leaning changes, the same way
        // 03f3's arm follows its puck.
        function sxOutlineArmShow(t) {
            var arm = sxOutlineArmEl();
            var rect = t.input.getBoundingClientRect();
            var frac = Math.max(0, Math.min(1, (Number(t.input.value) + 100) / 200));
            var x = rect.left + frac * rect.width;
            var h = 192;
            var top = Math.max(8, Math.min(window.innerHeight - h - 8, rect.top + rect.height / 2 - h / 2));
            arm.style.left = Math.max(8, Math.min(window.innerWidth - 86, x - 39)) + "px";
            arm.style.top = top + "px";
            arm.classList.toggle("bubble-left", x > window.innerWidth - 220);
            arm.hidden = false;
            t.armInner = 160;
            sxOutlineArmMove(t, t.app);
        }
        function sxOutlineArmMove(t, app) {
            var arm = sxOutlineArmNode;
            if (!arm || arm.hidden) return;
            var handle = arm.querySelector(".outline-arm-handle");
            var bubble = arm.querySelector(".outline-arm-bubble");
            var rect = t.input.getBoundingClientRect();
            var frac = Math.max(0, Math.min(1, (Number(t.input.value) + 100) / 200));
            var x = rect.left + frac * rect.width;
            arm.style.left = Math.max(8, Math.min(window.innerWidth - 86, x - 39)) + "px";
            arm.classList.toggle("bubble-left", x > window.innerWidth - 220);
            var a = Math.max(-100, Math.min(100, Number(app) || 0));
            var y = 16 + (1 - (a + 100) / 200) * 160;
            handle.style.top = y + "px";
            handle.style.backgroundColor = zi(a);
            bubble.style.top = y + "px";
            bubble.textContent = (a > 0 ? "+" : "") + Math.round(a) + " " + (a > 25 ? "appetite" : a < -25 ? "aversion" : a === 0 ? "neutral" : a > 0 ? "appetite" : "aversion");
        }
        function sxOutlineArmHide() {
            if (sxOutlineArmNode) sxOutlineArmNode.hidden = true;
        }
