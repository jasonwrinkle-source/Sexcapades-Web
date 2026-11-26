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
                    t.length && sxHighlightPickerItem(a < 0 ? n < 0 ? t.length - 1 : 0 : Math.max(0, Math.min(t.length - 1, a + n)), {
                        focus: e.focusItems,
                        preview: !0,
                        scroll: !0
                    });
                }
            function sxRenderPickerMenu(selectedValue = null, {focus: l = !1} = {}) {
                t = zlFlatten(), a = -1, e.menu.replaceChildren();
zlRenderRows(), t.length ? sxHighlightPickerItem(Math.max(0, t.findIndex(e => e.value === selectedValue)), {
                    focus: l && e.focusItems,
                    preview: !1,
                    scroll: l
                }) : sxClosePickerMenu();
            }
            function sxRevealPickerItem(t) {
                if (!e.tree || !t) return;
                const n = new Map(i.map(e => [ e.value, e ]));
                let a = n.get(t);
                for (;a && a.parentId; ) o.add(a.parentId), a = n.get(a.parentId);
                sxRenderPickerMenu(t);
            }
            function sxTogglePickerBranch(n, i) {
                const a = t[n];
                return !(!e.tree || !a?.hasChildren || ((void 0 === i ? !o.has(a.value) : Boolean(i)) ? o.add(a.value) : o.delete(a.value), 
                sxRenderPickerMenu(a.value, {
                    focus: !0
                }), 0));
            }
            function sxHighlightPickerItem(n, {focus: i = !1, preview: r = !1, scroll: o = i} = {}) {
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
            function sxOpenPickerMenu(n = 0, i = e.focusItems) {
                t.length && (Ul.forEach(e => {
                    e !== m && e.close();
                }), e.menu.hidden = !1, e.trigger.setAttribute("aria-expanded", "true"), e.onOpen?.(), 
                sxHighlightPickerItem(n, {
                    focus: !1,
                    preview: !1,
                    scroll: !1
                }), i && requestAnimationFrame(() => sxHighlightPickerItem(a, {
                    focus: !0,
                    preview: !0 === e.previewOnOpen,
                    scroll: !0
                })));
            }
            function sxClosePickerMenu(t = !1) {
                e.menu.hidden || (e.menu.hidden = !0, e.trigger.setAttribute("aria-expanded", "false"), 
                e.trigger.removeAttribute("aria-activedescendant"), e.onClose?.(), t && e.trigger.focus());
            }
            function sxCommitPickerItem(n = a) {
                const i = t[n];
                i && (e.onCommit?.(i), sxClosePickerMenu(Boolean(e.returnFocusOnCommit)));
            }
            function sxPickerKeydown(n) {
                if ("ArrowDown" === n.key || "ArrowUp" === n.key) n.preventDefault(), e.menu.hidden ? (e.tree && sxRevealPickerItem(e.initialValue?.()), 
                sxOpenPickerMenu(e.initialIndex?.(n.key, t) ?? ("ArrowUp" === n.key ? t.length - 1 : 0), e.focusItems)) : zlMove("ArrowDown" === n.key ? 1 : -1); else if (e.tree && "ArrowRight" === n.key && !e.menu.hidden) {
                    n.preventDefault();
                    const e = t[a];
                    if (!e) return;
                    if (e.hasChildren && !e.expanded) sxTogglePickerBranch(a, !0); else {
                        const n = t.findIndex(t => t.parentId === e.value);
                        n >= 0 && sxHighlightPickerItem(n, {
                            focus: !0,
                            preview: !0,
                            scroll: !0
                        });
                    }
                } else if (e.tree && "ArrowLeft" === n.key && !e.menu.hidden) {
                    n.preventDefault();
                    const e = t[a];
                    if (!e) return;
                    if (e.hasChildren && e.expanded) sxTogglePickerBranch(a, !1); else if (e.parentId) {
                        const n = t.findIndex(t => t.value === e.parentId);
                        n >= 0 && sxHighlightPickerItem(n, {
                            focus: !0,
                            preview: !0,
                            scroll: !0
                        });
                    }
                } else "Home" !== n.key || e.menu.hidden ? "End" !== n.key || e.menu.hidden ? ("Enter" === n.key || e.focusItems && " " === n.key) && !e.menu.hidden ? (n.preventDefault(), 
                sxCommitPickerItem()) : "Escape" !== n.key || e.menu.hidden ? "Tab" !== n.key || e.menu.hidden || sxClosePickerMenu() : (n.preventDefault(), 
                sxClosePickerMenu(e.focusItems)) : (n.preventDefault(), sxHighlightPickerItem(t.length - 1, {
                    focus: e.focusItems,
                    preview: !0,
                    scroll: !0
                })) : (n.preventDefault(), sxHighlightPickerItem(0, {
                    focus: e.focusItems,
                    preview: !0,
                    scroll: !0
                }));
            }
            e.trigger.addEventListener("keydown", sxPickerKeydown), e.focusItems && e.menu.addEventListener("keydown", sxPickerKeydown), 
            e.menu.addEventListener("click", t => {
                const n = __sxClosestAction(t.target, "topicDropdownOption");
                if (!n) return;
                const i = Number(n.dataset.topicDropdownIndex);
                sxHighlightPickerItem(i), e.tree && __sxClosestAction(t.target, "topicTreeToggle") ? sxTogglePickerBranch(i) : sxCommitPickerItem(i);
            });
            const m = {
                root: e.root,
                menu: e.menu,
                render: function(t, {grouped: n = !1} = {}) {
                    i = t.slice(), r = Boolean(n && !e.tree), o.clear(), sxRenderPickerMenu();
                },
                open: sxOpenPickerMenu,
                close: sxClosePickerMenu,
                setHighlight: sxHighlightPickerItem,
                reveal: sxRevealPickerItem,
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
        let Vl = [], Yl = [], Xl = new Map();
        function rebuildTopicPickerData() {
            const activeCats = (typeof window.TaxonomyLoader === "object" && typeof window.TaxonomyLoader.loadTaxonomy === "function")
                ? window.TaxonomyLoader.loadTaxonomy().categories
                : (typeof h !== "undefined" ? h : []);
            const liveGl = sxOrderByScore(activeCats, typeof sxBranchMeanScore !== "undefined" ? sxBranchMeanScore : {});
            Vl = liveGl.map(e => {
                const t = catId(e.name), n = e.name + " — whole branch", i = {
                    value: t,
                    id: t,
                    branch: e.name,
                    parentId: null,
                    label: n,
                    displayLabel: e.name,
                    type: "category",
                    group: e.name,
                    icon: (typeof ge !== "undefined" && ge[e.name]) || {},
                    isBranch: !0,
                    description: (typeof we !== "undefined" && we[e.name]) || "branch symbol"
                }, a = (e.subcategories || []).map(n => {
                    const i = sxResolveSubcategoryId(e.name, n.name), a = sxHubIcon(n.name, e.name);
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
                        description: sxLabelFromKey(a.key)
                    };
                }), r = sxOrderByScore(e.topics, e => sxTopicPopularity((typeof topicIdByLabel !== "undefined" && topicIdByLabel[sxName(e)]) || sxName(e))).map(n => {
                    const i = sxTopicIcon(sxName(n), e.name), a = sxFindTopicSubcategory(e, n);
                    return {
                        value: sxResolveTopicId(n),
                        id: sxResolveTopicId(n),
                        branch: e.name,
                        parentId: a ? sxResolveSubcategoryId(e.name, a.name) : t,
                        label: sxName(n),
                        displayLabel: sxName(n),
                        giveLabel: n && n.give_label || "",
                        receiveLabel: n && n.receive_label || "",
                        type: "topic",
                        group: e.name,
                        icon: i,
                        isBranch: !1,
                        description: sxLabelFromKey(i.key)
                    };
                });
                return {
                    branch: e.name,
                    category: i,
                    subcategories: a,
                    topics: r,
                    items: [ i, ...a, ...r ]
                };
            });
            Yl = Vl.flatMap(e => e.items);
            Xl = new Map(Yl.map(e => [ e.value, e ]));

            if (ql) {
                ql.innerHTML = '<option value="">Choose a topic...</option>';
                Vl.forEach(({branch: e, items: t}) => {
                    const n = document.createElement("optgroup");
                    n.label = e, t.forEach(e => {
                        const t = document.createElement("option");
                        t.value = e.value, t.textContent = e.label, n.appendChild(t);
                    }), ql.appendChild(n);
                });
            }
            if (typeof tc !== "undefined" && tc && typeof tc.render === "function") {
                tc.render(Yl, { grouped: !0 });
            }
        }
        let sxCommittedFocus = null, sxFocusFrame = 0;
        function sxStopFocusZoom() {
            if (sxFocusFrame) cancelAnimationFrame(sxFocusFrame), sxFocusFrame = 0;
            if (typeof window.__sxStopFocusZoom === "function") window.__sxStopFocusZoom();
        }
        function sxFocusPaintedTopic(e, t = 0) {
            if (!e || Dt !== e.id) return;
            In.querySelector(`[data-layout-key="${CSS.escape(e.id)}"]`) ? sxFrameNodeInCamera(e.id, e.branch) : t < 3 ? sxFocusFrame = requestAnimationFrame(() => sxFocusPaintedTopic(e, t + 1)) : sxFocusCategoryCamera(e.branch);
        }
        let _previewAddedBranches = new Set, _previewAddedParents = new Set;
        function sxPreviewTopicOnMap(e) {
            if (!e) return;
            noteFitUserCamera();
            kn || sxRestoreExpandedBranches();
            if (e.branch && !rn.has(e.branch)) { rn.add(e.branch); _previewAddedBranches.add(e.branch); }
            if (e.parentId && !on.has(e.parentId)) { on.add(e.parentId); _previewAddedParents.add(e.parentId); }
            Dt = e.id; Lt = e.id;
            sxRequestMapPaint({ animate: !0 });
            sxStopFocusZoom();
            sxFocusFrame = requestAnimationFrame(() => {
                sxFocusFrame = 0;
                sxFocusPaintedTopic(e);
            });
        }
        function sxClearTopicPreview() {
            sxCommittedFocus = null;
            sxStopFocusZoom();
            const hadExpansions = Boolean(_previewAddedBranches.size || _previewAddedParents.size || Dt || Lt);
            _previewAddedBranches.forEach(b => rn.delete(b)); _previewAddedBranches.clear();
            _previewAddedParents.forEach(p => on.delete(p)); _previewAddedParents.clear();
            Dt = null; Lt = null; Tt = "";
            const sxSearch = e.byId("searchInput");
            sxSearch && (sxSearch.value = "");
            if (hadExpansions) {
                sxRequestMapPaint();
                if (typeof sxApplyMapFit === "function") sxApplyMapFit();
            } else if (Cn) {
                Cn.querySelectorAll(".is-dim").forEach(el => el.classList.remove("is-dim"));
            }
        }
        window.__sxOnKey( function(ev) {
            if (ev.key !== "Escape" || document.querySelector("dialog[open]")) return;
            if (Dt) sxClearTopicPreview();
            else if (Tt || Cn && (Cn.classList.contains("has-selection") || Cn.classList.contains("relation-focused") || Cn.querySelector(".is-dim, .is-preview, .rel-active"))) clearSpokeSelection();
        }, true);
        rebuildTopicPickerData();
        if (typeof window !== "undefined" && typeof window.__SX_WHEN_SKIN_READY === "function") {
            window.__SX_WHEN_SKIN_READY(rebuildTopicPickerData);
        }
        window.sxRebuildTopicPicker = rebuildTopicPickerData;
        const ec = sxCreateTopicPicker({
            root: __sxClosestAction(Bl, "searchLabel"),
            trigger: Bl,
            menu: jl,
            focusItems: !1,
            renderItem: e => `<span class="match-type">${"category" === e.type ? "Category" : "subcategory" === e.type ? "Subcategory" : "imported" === e.type ? "Imported" : "Topic"}</span><span class="match-label">${sxEscapeHtmlText(e.displayLabel)}</span>`,
            onPreview: sxPreviewTopicOnMap,
            onClose: () => {
                // Accepting a result closes the menu. That close used to
                // run the same clear as Escape, so the zoom survived and
                // the dim state did not.
                if (sxCommittedFocus && Dt === sxCommittedFocus) return;
                sxClearTopicPreview();
            },
            onCommit: e => {
                sxCommittedFocus = e && e.id, Bl && (Bl.value = e.displayLabel), sxPreviewTopicOnMap(e);
            }
        });
        Bl && Bl.addEventListener("input", e => {
            const t = e.target.value.trim().toLowerCase();
            if (!t) {
                const hadPreview = Boolean(Dt || Lt || _previewAddedBranches.size || _previewAddedParents.size);
                Tt = "";
                Lt = null;
                ec.render([]);
                ec.close();
                if (hadPreview) {
                    sxRequestMapPaint({ animate: !1 });
                    if (typeof sxApplyMapFit === "function") sxApplyMapFit();
                } else if (Cn) {
                    Cn.querySelectorAll(".is-dim").forEach(el => el.classList.remove("is-dim"));
                }
                return;
            }
            Tt = t;
            const n = function(e, t = 24) {
                if (!e) return [];
                const n = e.toLowerCase(), i = sxCollectComparedImports().map(e => ({
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
                const textCache = new Map;
                const o = e => {
                    let cached = textCache.get(e.id);
                    if (cached !== undefined) return cached;
                    const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(e.id) : null;
                    const shapeKeys = shape && shape.keys ? shape.keys.join(" ") : "";
                    const shapeLabels = shape && shape.labels ? shape.labels.join(" ") : "";
                    const raw = [ e.displayLabel, e.label, e.giveLabel, e.receiveLabel, shapeKeys, shapeLabels ]
                        .map(v => String(v || "").toLowerCase()).join(" ");
                    cached = raw + " " + raw.replace(/cuckquean/g, "cuckqueen");
                    textCache.set(e.id, cached);
                    return cached;
                };
                const normQuery = n.replace(/cuckqueen/g, "cuckquean");
                const s = e => {
                    const t = o(e), i = t.indexOf(normQuery), iRaw = t.indexOf(n);
                    const matchIdx = i >= 0 ? i : iRaw;
                    return matchIdx < 0 ? 99 : (t === n || t === normQuery) ? 0 : 0 === matchIdx ? 1 : t.split(/[^a-z0-9]+/).some(w => w.startsWith(normQuery) || w.startsWith(n)) ? 2 : 3;
                };
                return r.filter(e => {
                    const text = o(e);
                    return text.includes(normQuery) || text.includes(n);
                }).filter(e => {
                    // A veiled topic stays off the map, so it stays out of
                    // search too. Selecting one used to pan onto an empty view.
                    // Every selected profile whose veil is on counts, not only
                    // the active tab: a pair can be showing while the other
                    // profile is the one with the veil.
                    if (typeof sxIsVeilEnabled !== "function" || typeof sxScoreTopicForVeil !== "function" || typeof sxClampVeilThreshold !== "function") return true;
                    const ids = [];
                    const active = (typeof sxActiveProfileId === "function" && sxActiveProfileId()) || Mt;
                    active && ids.push(active);
                    if (typeof sxListLiveSelections === "function") sxListLiveSelections().forEach(id => ids.includes(id) || ids.push(id));
                    const veiled = ids.filter(id => id && vt[id] && sxIsVeilEnabled(id));
                    if (!veiled.length) return true;
                    return veiled.every(profile => {
                        if ("category" === e.type && typeof sxIsBranchVeilShown === "function") {
                            const cat = h.find(c => catId(c.name) === e.id || c.id === e.id);
                            return Boolean(cat && sxIsBranchVeilShown(cat, profile));
                        }
                        const score = sxScoreTopicForVeil(e.id, vt[profile], Qe[profile]);
                        return null !== score && score >= sxClampVeilThreshold(vpt[profile]);
                    });
                }).sort((e, t) => s(e) - s(t) || o(e).localeCompare(o(t)) || String(e.group || "").localeCompare(String(t.group || ""))).slice(0, t);
            }(t, 24);
            ec.render(n), n.length ? ec.open(0, !1) : ec.close();
        });
        const tc = sxCreateTopicPicker({
            root: __sxClosestAction(ql, "topicPicker"),
            trigger: Hl,
            menu: Wl,
            focusItems: !0,
            returnFocusOnCommit: !0,
            tree: !0,
            previewOnOpen: !0,
            renderItem: e => `<span class="topic-tree-toggle" aria-hidden="true">${e.hasChildren ? "›" : ""}</span>` + sxPracticeIconMarkup(e.icon, e.isBranch) + `<span class="topic-picker-label">${sxEscapeHtmlText(e.displayLabel)}</span>`,
            initialValue: () => ql.value,
            initialIndex: (e, t) => {
                const n = t.findIndex(e => e.value === ql.value);
                return n >= 0 ? n : "ArrowUp" === e ? t.length - 1 : 0;
            },
            onOpen: () => __sxClosestAction(ql, "introBlock")?.classList.add("topic-picker-open"),
            onClose: () => {
                __sxClosestAction(ql, "introBlock")?.classList.remove("topic-picker-open"), sxClearTopicPreview();
            },
            onPreview: sxPreviewTopicOnMap,
            onCommit: e => {
                const t = ql.value !== e.value;
                ql.value = e.value, sxRefreshPickerButton(), t && ql.dispatchEvent(new Event("change", {
                    bubbles: !0
                }));
            }
        });
        function sxRefreshPickerButton() {
            const e = Xl.get(ql.value);
            if (n(Hl, e ? sxPracticeIconMarkup(e.icon, e.isBranch) + `<span class="topic-picker-label">${sxEscapeHtmlText(e.label)}</span>` : '<span class="topic-picker-label">Choose a topic…</span>'), 
            !Wl.hidden) {
                tc.reveal(ql.value);
                const e = tc.getItems().findIndex(e => e.value === ql.value);
                tc.setHighlight(e >= 0 ? e : 0);
            }
        }
        function sxLabelFromNodeId(e) {
            const t = sxNodeRegistry[e] || sxNodeById(e) || sxCollectAllImports().find(t => t.id === e);
            return t && t.label ? t.label : e;
        }
        function sxUniqueSortedLabels(e) {
            return [ ...new Set(e.map(sxLabelFromNodeId).filter(Boolean)) ].sort((e, t) => e.localeCompare(t));
        }
        function sxMeanFlankPair(e, t) {
            const n = (t || []).filter(e => e === Et || vt[e]).map(t => sxDecodeTopicStance(e, t)), i = e => {
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
        function sxGlanceRowsFor(e, t, n = null) {
            const i = new Map;
            sxAllTopicIds().forEach(e => {
                const t = sxNodeRegistry[e] || sxNodeById(e) || sxCollectAllImports().find(t => t.id === e);
                t && t.label && !i.has(t.label) && i.set(t.label, {
                    id: e,
                    item: t
                });
            });
            const a = n || (Mt && vt[Mt] ? [ Mt ] : []);
            return (e || []).map(e => {
                const n = i.get(e), r = n && n.item, o = r && h.some(e => e.name === r.branch), s = n ? sxMeanFlankPair(n.id, a) : {
                    give: 0,
                    giveKnown: !1,
                    receive: 0,
                    receiveKnown: !1
                };
                return {
                    id: n && n.id,
                    label: e,
                    rating: t,
                    icon: o ? sxTopicIcon(r.label, r.branch) : null,
                    give: s.give,
                    giveKnown: s.giveKnown,
                    receive: s.receive,
                    receiveKnown: s.receiveKnown
                };
            });
        }
        function sxSetGlanceTooltip(t, n, i, a, r, o = null, s = "") {
            const l = e.byId(t), c = [ ...new Set((a || []).filter(Boolean)) ].sort((e, t) => e.localeCompare(t)), d = Array.isArray(o) ? o.filter(e => e && e.label).sort((e, t) => e.label.localeCompare(t.label)) : null;
            l.textContent = n, l._glanceTooltip = {
                title: `${i} (${n}${s})`,
                labels: c,
                rows: d,
                text: r
            }, l.setAttribute("aria-label", `${n}${s} ${i.toLowerCase()}. Focus to hear which practices are included.`);
        }
        function sxGlanceBandPercents(e) {
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
        function sxAddGlanceBucket(e, t, n, i, a) {
            const r = sxDecodeTopicStance(n, i), o = [];
            if (r.giveKnown) o.push(r.give);
            if (r.receiveKnown) o.push(r.receive);
            if (r.lineKnown) o.push(r.line);
            if (r.polesKnown && r.poles) {
                const vals = Object.values(r.poles).filter(Number.isFinite);
                if (vals.length) {
                    const maxV = Math.max(...vals);
                    const minV = Math.min(...vals);
                    o.push(maxV > 0 ? maxV : minV);
                }
            }
            if (!o.length) return;
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
            }(s), d = sxLabelFromNodeId(n), u = a ? a(d) : d, p = sxNodeRegistry[n] || sxNodeById(n) || (at[i] || {})[n], g = p && h.some(e => e.name === p.branch) ? sxTopicIcon(p.label, p.branch) : null;
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
        function sxGlanceBucketsFor(e, t = null) {
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
            }) : (sxAllTopicIds().forEach(a => {
                t && !t.has(a) || sxAddGlanceBucket(n, i, a, e);
            }), Object.values(n).forEach(e => e.sort((e, t) => e.label.localeCompare(t.label))), 
            Object.assign(n, {
                percentages: sxGlanceBandPercents(i)
            }));
        }
        function sxLargestRemainderPercents(e) {
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
            sxRefreshPickerButton();
            if (!ql.value) return;
            const id = ql.value;
            const rec = (typeof sxNodeById === "function" ? sxNodeById(id) : null) || null;
            const branch = rec && rec.branch || "";
            if (branch && !rn.has(branch)) rn.add(branch);
            if (rec && rec.parentId && !on.has(rec.parentId)) on.add(rec.parentId);
            if (rec && "Subcategory" === rec.kind) on.add(id);
            Lt = id;
            sxRequestMapPaint();
            const focus = () => { if (typeof sxFrameNodeInCamera === "function") sxFrameNodeInCamera(id, branch); };
            if (window.sxPaintPromise && window.sxPaintPromise.then) window.sxPaintPromise.then(() => requestAnimationFrame(focus));
            else requestAnimationFrame(focus);
        }), sxRefreshPickerButton();
        let pc = [], hc = "", gc = "";
        const mc = new Set, fc = new Set;
        function sxClearScribeReady() {
            hc && mc.add(hc), e.byId("scribeTab")?.classList.remove("scribe-ready");
        }
        function sxPaintGlanceRings(t, i = null) {
            pc = t.map(e => ({
                ...e,
                percent: Math.max(0, Math.min(100, Math.round(Number(e.percent) || 0))),
                count: Math.max(0, Math.round(Number(e.count) || 0))
            }));
            const a = [ "centerGlanceRingGreen", "centerGlanceRingYellow", "centerGlanceRingRed" ];
            pc.forEach((t, n) => {
                const i = e.byId(a[n]), r = In.querySelector(`[data-center-glance-index="${n}"]`);
                i && (i.setAttribute("d", sxGlanceArcText(t.percent, Number(i.dataset.ringRadius))), i.style.opacity = t.percent ? "1" : "0"), 
                r && r.setAttribute("aria-label", `${t.label}, ${t.percent} percent, ${t.count} ${1 === t.count ? "topic" : "topics"}. Open rating details.`);
            }), e.byId("glanceNumbersPopover").hidden || n(Mc, pc.map(e => `<button class="glance-ring-row" type="button" data-glance-source="${sxEscapeHtmlText(e.sourceId)}" style="--ring-color:${e.color}"><span class="glance-ring-swatch" aria-hidden="true"></span><strong>${sxEscapeHtmlText(e.label)}</strong><span class="glance-ring-count">${e.count} ${1 === e.count ? "topic" : "topics"}</span><span class="glance-ring-percent">${e.percent}%</span></button>`).join(""));
        }
        // P1 refactor (Build 2026-10-18_2227): vc (glance / comparison
        // summary) split by responsibility - vcScribeReady and vcGlanceKey
        // compute the header readiness keys, vcEmpty renders the empty
        // state, vcComparison the multi-profile comparison, vcGroupProfile
        // a committed group, vcSingleProfile one profile, and vcFallback
        // the uncommitted-selection summary. vc is a thin orchestrator.
