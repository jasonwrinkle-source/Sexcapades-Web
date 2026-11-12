            function zlFlatten() {
                    if (!e.tree) return i.slice();
                    const t = new Map;
                    i.forEach(e => {
                        const n = e.parentId || null;
                        t.has(n) || t.set(n, []), t.get(n).push(e);
                    });
                    const n = [], a = (e, i) => {
                        const r = t.get(e.value) || [], s = r.length > 0, l = s && o.has(e.value);
                        n.push(Object.assign({}, e, {
                            treeDepth: i,
                            hasChildren: s,
                            expanded: l
                        })), l && r.forEach(e => a(e, i + 1));
                    };
                    return (t.get(null) || []).forEach(e => a(e, 0)), n;
                }
            function zlRenderRows() {
                let c = null;
                t.forEach((t, i) => {
                    if (r && t.group !== c) {
                        const n = document.createElement("div");
                        n.className = "topic-dropdown-group-label", n.textContent = t.group, n.setAttribute("role", "presentation"), 
                        e.menu.appendChild(n), c = t.group;
                    }
                    const a = document.createElement("button");
                    a.type = "button", a.id = `${e.menu.id}-option-${i}`, a.className = "topic-dropdown-option" + (e.tree ? " is-tree-node" : ""), 
                    a.setAttribute("role", e.tree ? "treeitem" : "option"), a.setAttribute("aria-selected", "false"), 
                    a.tabIndex = -1, a.dataset.topicDropdownIndex = String(i), e.tree && (a.style.setProperty("--tree-depth", String(t.treeDepth || 0)), 
                    a.setAttribute("aria-level", String((t.treeDepth || 0) + 1)), t.hasChildren && a.setAttribute("aria-expanded", String(t.expanded))), 
                    n(a, e.renderItem(t)), e.menu.appendChild(a);
                })
            }
            function zlMove(n) {
                    t.length && d(a < 0 ? n < 0 ? t.length - 1 : 0 : Math.max(0, Math.min(t.length - 1, a + n)), {
                        focus: e.focusItems,
                        preview: !0,
                        scroll: !0
                    });
                }
            function s(s = null, {focus: l = !1} = {}) {
                t = zlFlatten(), a = -1, e.menu.replaceChildren();
zlRenderRows(), t.length ? d(Math.max(0, t.findIndex(e => e.value === s)), {
                    focus: l && e.focusItems,
                    preview: !1,
                    scroll: l
                }) : p();
            }
            function l(t) {
                if (!e.tree || !t) return;
                const n = new Map(i.map(e => [ e.value, e ]));
                let a = n.get(t);
                for (;a && a.parentId; ) o.add(a.parentId), a = n.get(a.parentId);
                s(t);
            }
            function c(n, i) {
                const a = t[n];
                return !(!e.tree || !a?.hasChildren || ((void 0 === i ? !o.has(a.value) : Boolean(i)) ? o.add(a.value) : o.delete(a.value), 
                s(a.value, {
                    focus: !0
                }), 0));
            }
            function d(n, {focus: i = !1, preview: r = !1, scroll: o = i} = {}) {
                if (!t.length) return a = -1, void e.trigger.removeAttribute("aria-activedescendant");
                a = Math.max(0, Math.min(t.length - 1, n));
                const s = [ ...e.menu.querySelectorAll(".topic-dropdown-option") ];
                s.forEach((e, t) => {
                    const n = t === a;
                    e.classList.toggle("is-highlighted", n), e.setAttribute("aria-selected", String(n));
                });
                const l = s[a];
                l && (e.trigger.setAttribute("aria-activedescendant", l.id), i && l.focus({
                    preventScroll: !0
                }), o && l.scrollIntoView({
                    block: "nearest"
                }), r && e.onPreview?.(t[a]));
            }
            function u(n = 0, i = e.focusItems) {
                t.length && (Ul.forEach(e => {
                    e !== m && e.close();
                }), e.menu.hidden = !1, e.trigger.setAttribute("aria-expanded", "true"), e.onOpen?.(), 
                d(n, {
                    focus: !1,
                    preview: !1,
                    scroll: !1
                }), i && requestAnimationFrame(() => d(a, {
                    focus: !0,
                    preview: !0 === e.previewOnOpen,
                    scroll: !0
                })));
            }
            function p(t = !1) {
                e.menu.hidden || (e.menu.hidden = !0, e.trigger.setAttribute("aria-expanded", "false"), 
                e.trigger.removeAttribute("aria-activedescendant"), e.onClose?.(), t && e.trigger.focus());
            }
            function h(n = a) {
                const i = t[n];
                i && (e.onCommit?.(i), p(Boolean(e.returnFocusOnCommit)));
            }
            function g(n) {
                if ("ArrowDown" === n.key || "ArrowUp" === n.key) n.preventDefault(), e.menu.hidden ? (e.tree && l(e.initialValue?.()), 
                u(e.initialIndex?.(n.key, t) ?? ("ArrowUp" === n.key ? t.length - 1 : 0), e.focusItems)) : zlMove("ArrowDown" === n.key ? 1 : -1); else if (e.tree && "ArrowRight" === n.key && !e.menu.hidden) {
                    n.preventDefault();
                    const e = t[a];
                    if (!e) return;
                    if (e.hasChildren && !e.expanded) c(a, !0); else {
                        const n = t.findIndex(t => t.parentId === e.value);
                        n >= 0 && d(n, {
                            focus: !0,
                            preview: !0,
                            scroll: !0
                        });
                    }
                } else if (e.tree && "ArrowLeft" === n.key && !e.menu.hidden) {
                    n.preventDefault();
                    const e = t[a];
                    if (!e) return;
                    if (e.hasChildren && e.expanded) c(a, !1); else if (e.parentId) {
                        const n = t.findIndex(t => t.value === e.parentId);
                        n >= 0 && d(n, {
                            focus: !0,
                            preview: !0,
                            scroll: !0
                        });
                    }
                } else "Home" !== n.key || e.menu.hidden ? "End" !== n.key || e.menu.hidden ? ("Enter" === n.key || e.focusItems && " " === n.key) && !e.menu.hidden ? (n.preventDefault(), 
                h()) : "Escape" !== n.key || e.menu.hidden ? "Tab" !== n.key || e.menu.hidden || p() : (n.preventDefault(), 
                p(e.focusItems)) : (n.preventDefault(), d(t.length - 1, {
                    focus: e.focusItems,
                    preview: !0,
                    scroll: !0
                })) : (n.preventDefault(), d(0, {
                    focus: e.focusItems,
                    preview: !0,
                    scroll: !0
                }));
            }
            e.trigger.addEventListener("keydown", g), e.focusItems && e.menu.addEventListener("keydown", g), 
            e.menu.addEventListener("click", t => {
                const n = __sxClosestAction(t.target, "topicDropdownOption");
                if (!n) return;
                const i = Number(n.dataset.topicDropdownIndex);
                d(i), e.tree && __sxClosestAction(t.target, "topicTreeToggle") ? c(i) : h(i);
            });
            const m = {
                root: e.root,
                menu: e.menu,
                render: function(t, {grouped: n = !1} = {}) {
                    i = t.slice(), r = Boolean(n && !e.tree), o.clear(), s();
                },
                open: u,
                close: p,
                setHighlight: d,
                reveal: l,
                getItems: () => t.slice(),
                get highlighted() {
                    return a;
                }
            };
            return Ul.push(m), m;
        }
        window.__sxOnPtr( e => {
            Ul.forEach(t => {
                t.root.contains(e.target) || t.close();
            });
        }, !0);
        const Vl = Gl.map(e => {
            const t = catId(e.name), n = e.name + " — whole branch", i = {
                value: t,
                id: t,
                branch: e.name,
                parentId: null,
                label: n,
                displayLabel: e.name,
                type: "category",
                group: e.name,
                icon: ge[e.name],
                isBranch: !0,
                description: we[e.name] || "branch symbol"
            }, a = (e.subcategories || []).map(n => {
                const i = Un(e.name, n.name), a = Ae(n.name, e.name);
                return {
                    value: i,
                    id: i,
                    branch: e.name,
                    parentId: t,
                    label: n.name + " — subcategory",
                    displayLabel: n.name,
                    type: "subcategory",
                    group: e.name,
                    icon: a,
                    isBranch: !1,
                    description: xe(a.key)
                };
            }), r = G(e.topics, e => sxTopicPopularity(topicIdByLabel[sxName(e)] || sxName(e))).map(n => {
                const i = Oe(sxName(n), e.name), a = Vn(e, n);
                return {
                    value: Wn(n),
                    id: Wn(n),
                    branch: e.name,
                    parentId: a ? Un(e.name, a.name) : t,
                    label: sxName(n),
                    displayLabel: sxName(n),
                    giveLabel: n && n.give_label || "",
                    receiveLabel: n && n.receive_label || "",
                    type: "topic",
                    group: e.name,
                    icon: i,
                    isBranch: !1,
                    description: xe(i.key)
                };
            });
            return {
                branch: e.name,
                category: i,
                subcategories: a,
                topics: r,
                items: [ i, ...a, ...r ]
            };
        }), Yl = Vl.flatMap(e => e.items), Xl = new Map(Yl.map(e => [ e.value, e ]));
        function Zl(e, t = 0) {
            In.querySelector(`[data-layout-key="${CSS.escape(e.id)}"]`) ? Th(e.id, e.branch) : t < 3 ? requestAnimationFrame(() => Zl(e, t + 1)) : Lh(e.branch);
        }
        let _previewAddedBranches = new Set, _previewAddedParents = new Set;
        function Ql(e) {
            if (!e) return;
            noteFitUserCamera();
            kn || Ei();
            // Track every expansion the preview adds — accumulating across highlight moves,
            // because the dropdown fires onPreview per item with no intervening onClose — so
            // Jl can revert exactly those, never branches/parents the user expanded themselves.
            if (e.branch && !rn.has(e.branch)) { rn.add(e.branch); _previewAddedBranches.add(e.branch); }
            if (e.parentId && !on.has(e.parentId)) { on.add(e.parentId); _previewAddedParents.add(e.parentId); }
            Dt = e.id; Lt = e.id;
            Mr({ animate: !0 });
            requestAnimationFrame(() => Zl(e));
        }
        function Jl() {
            // Revert preview-only expansions, clear both preview ids, and always re-render
            _previewAddedBranches.forEach(b => rn.delete(b)); _previewAddedBranches.clear();
            _previewAddedParents.forEach(p => on.delete(p)); _previewAddedParents.clear();
            Dt = null; Lt = null; Tt = "";
            Mr();
            if (typeof Ih === "function") Ih();
        }
        // Safety net: Escape clears a search preview, and a leftover
        // search dim, even when focus is outside the dropdown menu.
        // An open dialog keeps Escape for itself.
        window.__sxOnKey( function(ev) {
            if (ev.key !== "Escape" || document.querySelector("dialog[open]")) return;
            if (Dt) Jl();
            else if (Tt || Cn && (Cn.classList.contains("has-selection") || Cn.classList.contains("relation-focused") || Cn.querySelector(".is-dim, .is-preview, .rel-active"))) clearSpokeSelection();
        }, true);
        Vl.forEach(({branch: e, items: t}) => {
            const n = document.createElement("optgroup");
            n.label = e, t.forEach(e => {
                const t = document.createElement("option");
                t.value = e.value, t.textContent = e.label, n.appendChild(t);
            }), ql.appendChild(n);
        });
        const ec = zl({
            root: __sxClosestAction(Bl, "searchLabel"),
            trigger: Bl,
            menu: jl,
            focusItems: !1,
            renderItem: e => `<span class="match-type">${"category" === e.type ? "Category" : "subcategory" === e.type ? "Subcategory" : "imported" === e.type ? "Imported" : "Topic"}</span><span class="match-label">${Hi(e.displayLabel)}</span>`,
            onPreview: Ql,
            onClose: Jl,
            onCommit: e => {
                Bl && (Bl.value = e.displayLabel), Ql(e);
            }
        });
        Bl && Bl.addEventListener("input", e => {
            const t = e.target.value.trim().toLowerCase();
            if (!t) return Tt = "", Lt = null, ec.render([]), ec.close(), Mr({
                animate: !1
            }), void Ih();
            Tt = t;
            const n = function(e, t = 24) {
                if (!e) return [];
                const n = e.toLowerCase(), i = ri().map(e => ({
                    value: e.id,
                    id: e.id,
                    branch: e.branch,
                    parentId: e.parentId || null,
                    label: e.label,
                    displayLabel: e.label,
                    type: "imported",
                    group: e.branch || "Imported"
                })), a = new Set, r = [];
                Vl.forEach(e => {
                    const t = i.filter(t => t.branch === e.branch);
                    t.forEach(e => a.add(e.id)), r.push(e.category, ...e.subcategories, ...e.topics, ...t);
                }), r.push(...i.filter(e => !a.has(e.id)));
                const o = e => [ e.displayLabel, e.giveLabel, e.receiveLabel ].map(v => String(v || "").toLowerCase()).join(" "), s = e => {
                    const t = o(e), i = t.indexOf(n);
                    return i < 0 ? 99 : t === n ? 0 : 0 === i ? 1 : t.split(/[^a-z0-9]+/).some(e => e.startsWith(n)) ? 2 : 3;
                };
                return r.filter(e => o(e).includes(n)).filter(e => {
                    // A veiled topic stays off the map, so it stays out of
                    // search too. Selecting one used to pan onto an empty view.
                    if (typeof Ia !== "function" || !Ia() || typeof Ca !== "function" || typeof Aa !== "function") return true;
                    const profile = (typeof Vi === "function" && Vi()) || Mt;
                    if (!profile || !vt[profile]) return true;
                    if ("category" === e.type && typeof Ma === "function") {
                        const cat = h.find(c => catId(c.name) === e.id || c.id === e.id);
                        return Boolean(cat && Ma(cat, profile));
                    }
                    const score = Ca(e.id, vt[profile], Qe[profile]);
                    return null !== score && score >= Aa(vpt[profile]);
                }).sort((e, t) => s(e) - s(t) || o(e).localeCompare(o(t)) || String(e.group || "").localeCompare(String(t.group || ""))).slice(0, t);
            }(t, 24);
            ec.render(n), n.length ? ec.open(0, !1) : ec.close();
        });
        const tc = zl({
            root: __sxClosestAction(ql, "topicPicker"),
            trigger: Hl,
            menu: Wl,
            focusItems: !0,
            returnFocusOnCommit: !0,
            tree: !0,
            previewOnOpen: !0,
            renderItem: e => `<span class="topic-tree-toggle" aria-hidden="true">${e.hasChildren ? "›" : ""}</span>` + Kl(e.icon, e.isBranch) + `<span class="topic-picker-label">${Hi(e.displayLabel)}</span>`,
            initialValue: () => ql.value,
            initialIndex: (e, t) => {
                const n = t.findIndex(e => e.value === ql.value);
                return n >= 0 ? n : "ArrowUp" === e ? t.length - 1 : 0;
            },
            onOpen: () => __sxClosestAction(ql, "introBlock")?.classList.add("topic-picker-open"),
            onClose: () => {
                __sxClosestAction(ql, "introBlock")?.classList.remove("topic-picker-open"), Jl();
            },
            onPreview: Ql,
            onCommit: e => {
                const t = ql.value !== e.value;
                ql.value = e.value, nc(), t && ql.dispatchEvent(new Event("change", {
                    bubbles: !0
                }));
            }
        });
        function nc() {
            const e = Xl.get(ql.value);
            if (n(Hl, e ? Kl(e.icon, e.isBranch) + `<span class="topic-picker-label">${Hi(e.label)}</span>` : '<span class="topic-picker-label">Choose a topic…</span>'), 
            !Wl.hidden) {
                tc.reveal(ql.value);
                const e = tc.getItems().findIndex(e => e.value === ql.value);
                tc.setHighlight(e >= 0 ? e : 0);
            }
        }
        function ic(e) {
            const t = qn[e] || Xn(e) || li().find(t => t.id === e);
            return t && t.label ? t.label : e;
        }
        function ac(e) {
            return [ ...new Set(e.map(ic).filter(Boolean)) ].sort((e, t) => e.localeCompare(t));
        }
        function rc(e, t) {
            const n = (t || []).filter(e => e === Et || vt[e]).map(t => ca(e, t)), i = e => {
                const t = n.filter(t => t[e + "Known"]);
                return {
                    value: t.length ? t.reduce((t, n) => t + n[e], 0) / t.length : 0,
                    known: t.length > 0
                };
            }, a = i("give"), r = i("receive");
            return {
                give: a.value,
                giveKnown: a.known,
                receive: r.value,
                receiveKnown: r.known
            };
        }
        function oc(e, t, n = null) {
            const i = new Map;
            Uc().forEach(e => {
                const t = qn[e] || Xn(e) || li().find(t => t.id === e);
                t && t.label && !i.has(t.label) && i.set(t.label, {
                    id: e,
                    item: t
                });
            });
            const a = n || (Mt && vt[Mt] ? [ Mt ] : []);
            return (e || []).map(e => {
                const n = i.get(e), r = n && n.item, o = r && h.some(e => e.name === r.branch), s = n ? rc(n.id, a) : {
                    give: 0,
                    giveKnown: !1,
                    receive: 0,
                    receiveKnown: !1
                };
                return {
                    id: n && n.id,
                    label: e,
                    rating: t,
                    icon: o ? Oe(r.label, r.branch) : null,
                    give: s.give,
                    giveKnown: s.giveKnown,
                    receive: s.receive,
                    receiveKnown: s.receiveKnown
                };
            });
        }
        function sc(t, n, i, a, r, o = null, s = "") {
            const l = e.byId(t), c = [ ...new Set((a || []).filter(Boolean)) ].sort((e, t) => e.localeCompare(t)), d = Array.isArray(o) ? o.filter(e => e && e.label).sort((e, t) => e.label.localeCompare(t.label)) : null;
            l.textContent = n, l._glanceTooltip = {
                title: `${i} (${n}${s})`,
                labels: c,
                rows: d,
                text: r
            }, l.setAttribute("aria-label", `${n}${s} ${i.toLowerCase()}. Focus to hear which practices are included.`);
        }
        function lc(e) {
            const t = {
                green: 0,
                yellow: 0,
                red: 0
            }, n = e.green + e.yellow + e.red;
            if (n) {
                const i = Object.keys(t).map(t => ({
                    key: t,
                    value: 100 * e[t] / n
                })).map(e => ({
                    key: e.key,
                    value: Math.floor(e.value),
                    fraction: e.value - Math.floor(e.value)
                })), a = 100 - i.reduce((e, t) => e + t.value, 0);
                i.sort((e, t) => t.fraction - e.fraction).forEach((e, n) => {
                    t[e.key] = e.value + (n < a ? 1 : 0);
                });
            }
            return t;
        }
        function cc(e, t, n, i, a) {
            const r = ca(n, i), o = [];
            if (r.giveKnown && o.push(r.give), r.receiveKnown && o.push(r.receive), !o.length) return;
            const s = o.reduce((e, t) => e + t, 0) / o.length, l = s > 35 ? "green" : s >= 0 ? "yellow" : "red", c = function(e) {
                const t = Math.max(-100, Math.min(100, Number(e) || 0));
                return t >= 0 ? {
                    green: t,
                    yellow: 100 - t,
                    red: 0
                } : {
                    green: 0,
                    yellow: 100 + t,
                    red: -t
                };
            }(s), d = ic(n), u = a ? a(d) : d, p = qn[n] || Xn(n) || (at[i] || {})[n], g = p && h.some(e => e.name === p.branch) ? Oe(p.label, p.branch) : null;
            t.green += c.green, t.yellow += c.yellow, t.red += c.red, e[l].push({
                id: n,
                label: u,
                rating: l,
                value: s,
                icon: g,
                give: r.give,
                giveKnown: r.giveKnown,
                receive: r.receive,
                receiveKnown: r.receiveKnown
            });
        }
        function dc(e, t = null) {
            const n = {
                green: [],
                yellow: [],
                red: []
            }, i = {
                green: 0,
                yellow: 0,
                red: 0
            };
            return !e || e !== Et && !vt[e] ? Object.assign(n, {
                percentages: {
                    green: 0,
                    yellow: 0,
                    red: 0
                }
            }) : (Uc().forEach(a => {
                t && !t.has(a) || cc(n, i, a, e);
            }), Object.values(n).forEach(e => e.sort((e, t) => e.label.localeCompare(t.label))), 
            Object.assign(n, {
                percentages: lc(i)
            }));
        }
        function uc(e) {
            const t = e.reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
            if (!t) return [ 0, 0, 0 ];
            const n = e.map(e => 100 * Math.max(0, Number(e) || 0) / t), i = n.map(Math.floor), a = 100 - i.reduce((e, t) => e + t, 0);
            return n.map((e, t) => ({
                index: t,
                fraction: e - i[t]
            })).sort((e, t) => t.fraction - e.fraction).slice(0, a).forEach(e => i[e.index]++), 
            i;
        }
        tc.render(Yl, {
            grouped: !0
        }), Hl && Hl.addEventListener("click", () => {
            if (Wl && Wl.hidden) {
                ql && tc.reveal(ql.value);
                const e = ql ? tc.getItems().findIndex(e => e.value === ql.value) : -1;
                tc.open(e >= 0 ? e : 0, !0);
            } else tc.close();
        }), ql && ql.addEventListener("change", () => {
            nc();
            if (!ql.value) return;
            const id = ql.value;
            const rec = (typeof Xn === "function" ? Xn(id) : null) || null;
            const branch = rec && rec.branch || "";
            if (branch && !rn.has(branch)) rn.add(branch);
            if (rec && rec.parentId && !on.has(rec.parentId)) on.add(rec.parentId);
            if (rec && "Subcategory" === rec.kind) on.add(id);
            Lt = id;
            Mr();
            const focus = () => { if (typeof Th === "function") Th(id, branch); };
            if (window.sxPaintPromise && window.sxPaintPromise.then) window.sxPaintPromise.then(() => requestAnimationFrame(focus));
            else requestAnimationFrame(focus);
        }), nc();
        let pc = [], hc = "", gc = "";
        const mc = new Set, fc = new Set;
        function yc() {
            hc && mc.add(hc), e.byId("scribeTab")?.classList.remove("scribe-ready");
        }
        function bc(t, i = null) {
            pc = t.map(e => ({
                ...e,
                percent: Math.max(0, Math.min(100, Math.round(Number(e.percent) || 0))),
                count: Math.max(0, Math.round(Number(e.count) || 0))
            }));
            const a = [ "centerGlanceRingGreen", "centerGlanceRingYellow", "centerGlanceRingRed" ];
            pc.forEach((t, n) => {
                const i = e.byId(a[n]), r = In.querySelector(`[data-center-glance-index="${n}"]`);
                i && (i.setAttribute("d", ra(t.percent, Number(i.dataset.ringRadius))), i.style.opacity = t.percent ? "1" : "0"), 
                r && r.setAttribute("aria-label", `${t.label}, ${t.percent} percent, ${t.count} ${1 === t.count ? "topic" : "topics"}. Open rating details.`);
            }), e.byId("glanceNumbersPopover").hidden || n(Mc, pc.map(e => `<button class="glance-ring-row" type="button" data-glance-source="${Hi(e.sourceId)}" style="--ring-color:${e.color}"><span class="glance-ring-swatch" aria-hidden="true"></span><strong>${Hi(e.label)}</strong><span class="glance-ring-count">${e.count} ${1 === e.count ? "topic" : "topics"}</span><span class="glance-ring-percent">${e.percent}%</span></button>`).join(""));
        }
        // P1 refactor (Build 2026-10-18_2227): vc (glance / comparison
        // summary) split by responsibility — vcScribeReady and vcGlanceKey
        // compute the header readiness keys, vcEmpty renders the empty
        // state, vcComparison the multi-profile comparison, vcGroupProfile
        // a committed group, vcSingleProfile one profile, and vcFallback
        // the uncommitted-selection summary. vc is a thin orchestrator.
