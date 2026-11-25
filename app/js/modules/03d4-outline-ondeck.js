        // On Deck (2026-10-21): completion-queue membership. A topic is
        // queued when its rating state is incomplete — Tier 1: unrated
        // topics under a persisted FetLife broad-hit branch/subcategory;
        // Tier 2: marks or flags with no rating in either direction;
        // Direction: a dual-direction topic with exactly one direction
        // rated; Tier 3: coarse converter seed ratings not yet confirmed
        // by hand. Unreviewed (2026-10-27, LAST in precedence): any
        // topic holding a test-sourced direction that no earlier class
        // claimed — both-direction measured scores and mixed
        // hand-rated-plus-test topics alike; an Unreviewed row leaves
        // once every direction on its topic is hand-rated. A topic carrying
        // a hard-limit mark is NEVER queued (owner ruling 2026-10-21:
        // a hard limit is one-and-done).
        const __sxSeedValues = {
            "test:fetlife": [ 100, 85, 80, 0, 33 ],
            "test:kinktest": [ 33, 100 ],
            "test:checklist": [ 0, 20, 35, 40, 60, 80, 100 ],
            "test:bdsmtest": null
        };
        function __sxOnDeckIndex(e) {
            const t = new Map;
            h.forEach(n => {
                const i = catId(n.name);
                t.set(i, {
                    id: i,
                    label: n.name,
                    branch: n.name,
                    kind: "Category",
                    catId: i,
                    subId: null
                });
                (n.subcategories || []).forEach(s => {
                    const sId = Un(n.name, s.name);
                    t.set(sId, {
                        id: sId,
                        label: s.name,
                        branch: n.name,
                        kind: "Subcategory",
                        parentId: i,
                        catId: i,
                        subId: sId,
                        topics: (s.topics || []).map(sxName)
                    });
                });
                (n.topics || []).forEach(top => {
                    const a = Wn(top), r = Vn(n, top);
                    t.set(a, {
                        id: a,
                        label: top,
                        branch: n.name,
                        kind: "Topic",
                        parentId: r ? Un(n.name, r.name) : null,
                        catId: i,
                        subId: r ? Un(n.name, r.name) : null
                    });
                });
            });
            Array.from(t.values()).filter(e => "Topic" === e.kind).forEach(n => {
                ai(n.id, e).forEach(i => {
                    const a = (at[e] || {})[i];
                    a && t.set(i, {
                        id: i,
                        label: a.label || i,
                        branch: n.branch,
                        kind: "Imported",
                        parentId: n.id,
                        catId: n.catId,
                        subId: n.subId
                    });
                });
            });
            return t;
        }
        function __sxOnDeckMembers(e) {
            const t = {
                tier1: [],
                tier2: [],
                direction: [],
                tier3: [],
                unreviewed: []
            };
            if (!e || e !== Et && !vt[e]) return t;
            const n = __sxOnDeckIndex(e), i = new Set(Object.values(gt[e] || {}).flatMap(f => (f && f.categoryHits) || [])), a = Qe[e] || {}, r = Je[e] || {}, o = et[e] || {};
            n.forEach((node, s) => {
                if ("limit" === a[s] || ja(s, e)) return;
                const l = ca(s, e), c = Ge(s, e);
                if (!l.giveKnown && !l.receiveKnown) {
                    const ancestors = (typeof sxNodeAncestorIds === "function") ? sxNodeAncestorIds(s, e) : [ node.subId, node.catId ].filter(Boolean);
                    if (i.size && (i.has(s) || ancestors.some(ancId => i.has(ancId)))) return void t.tier1.push(s);
                    if (a[s] || r[s] || o[s]) t.tier2.push(s);
                    return;
                }
                if (!c.single && l.giveKnown !== l.receiveKnown) return void t.direction.push(s);
                const d = c.single ? l.giveKnown ? [ "give" ] : [] : [ "give", "receive" ].filter(fl => l[fl + "Known"]);
                if (d.length && d.every(fl => {
                    const src = Ao(e, s, fl);
                    if (!src || "manual" === src || !(src in __sxSeedValues)) return !1;
                    const seed = __sxSeedValues[src];
                    return null === seed || seed.includes(Math.round("give" === fl ? l.give : l.receive));
                })) return void t.tier3.push(s);
                d.some(fl => {
                    const src = Ao(e, s, fl);
                    return src && "manual" !== src && src in __sxSeedValues;
                }) && t.unreviewed.push(s);
            });
            const s = (e, t) => {
                const i = sxTopicPopularity(e, n.get(e)?.label), a = sxTopicPopularity(t, n.get(t)?.label), r = (null === i ? Number.NEGATIVE_INFINITY : i) - (null === a ? Number.NEGATIVE_INFINITY : a);
                return r ? -r : String(n.get(e)?.label || "").localeCompare(String(n.get(t)?.label || ""));
            };
            return t.tier1.sort(s), t.tier2.sort(s), t.direction.sort(s), t.tier3.sort(s), t.unreviewed.sort(s), t;
        }
        window.__sxOnDeckMembers = __sxOnDeckMembers;
        window.__sxOnDeckIndex = __sxOnDeckIndex;
        window.__sxOnDeckTotal = function(e) {
            const t = __sxOnDeckMembers(e);
            return t.tier1.length + t.tier2.length + t.direction.length + t.tier3.length + t.unreviewed.length;
        };
        // On Deck list mode (2026-10-21): the completion queue rendered
        // into the Popularity list through the same As() row factory, so
        // sliders, marks, notes and map write-back are the shipped ones.
        // Session behaviour mirrors the shipped list (the "os" session
        // set): a topic written during this session stays visible until
        // its heading is collapsed and reopened, or the list closes.
        window.__sxOnDeck = !1;
        const __sxOnDeckTouched = new Map;
        // Row-pinning (2026-10-27): a touched row pins in the section it
        // was touched in until THAT section completes a collapse + reopen
        // cycle; only then do pending moves (to another queue section)
        // and removals apply. __sxOnDeckCollapsed records which sections
        // have been collapsed since the last render, so a section's
        // reopen — and only a reopen that follows a real collapse —
        // releases its pins. Header counts are untouched by pinning:
        // __sxOnDeckTotal still counts true membership only, so the
        // header drops the moment a topic completes while its row
        // stays pinned in view.
        const __sxOnDeckCollapsed = new Set;
        const __sxOnDeckTierOrder = [ [ "tier1", "Broad matches from your import — rate these first" ], [ "tier2", "Marked, but not rated yet" ], [ "direction", "One direction missing" ], [ "tier3", "Coarse import ratings — refine when ready" ], [ "unreviewed", "Unreviewed ratings from your tests — confirm them as your own" ] ];
        window.__sxOnDeckClear = function() {
            window.__sxOnDeck = !1, __sxOnDeckTouched.clear(), __sxOnDeckCollapsed.clear();
            const e = document.getElementById("outlineShowOnDeck");
            e && (e.checked = !1);
        };
        function __sxOnDeckMarkTouched(e) {
            const t = e.closest("[data-ondeck-tier]"), n = e.dataset.outlineId;
            t && n && __sxOnDeckTouched.set(n, t.dataset.ondeckTier);
        }
        function __sxOnDeckMakeSection(e) {
            const t = __sxOnDeckTierOrder.find(([t]) => t === e);
            if (!t) return null;
            const n = document.createElement("details");
            n.className = "outline-branch ondeck-branch", n.dataset.ondeckTier = e, n.open = !0;
            const i = document.createElement("summary"), a = document.createElement("span"), r = document.createElement("span"), o = document.createElement("span");
            a.className = "outline-branch-disclosure", a.textContent = "›", a.setAttribute("aria-hidden", "true"), 
            r.className = "outline-branch-title", r.textContent = t[1], o.className = "outline-branch-count", 
            o.textContent = "0", i.append(a, r, o), n.append(i);
            const s = document.createElement("div");
            s.className = "outline-rows", n.append(s), n.addEventListener("toggle", () => __sxOnDeckPrune(n, e));
            const l = __sxOnDeckTierOrder.findIndex(([t]) => t === e);
            let c = null;
            Ro.querySelectorAll(".ondeck-branch[data-ondeck-tier]").forEach(e => {
                if (c) return;
                __sxOnDeckTierOrder.findIndex(([t]) => t === e.dataset.ondeckTier) > l && (c = e);
            });
            const d = c || Ro.querySelector(".ondeck-unresolved") || Ro.querySelector(".ondeck-empty");
            return d ? Ro.insertBefore(n, d) : (Ro.append(n), n);
        }
        function __sxOnDeckPlaceRow(e, t, n, i) {
            const a = i.get(e);
            if (!a) return;
            const r = Ro.querySelector(`.ondeck-branch[data-ondeck-tier="${t}"]`) || __sxOnDeckMakeSection(t);
            if (!r) return;
            const o = r.querySelector(".outline-rows"), s = As(a, Go), l = n[t], c = l.indexOf(e);
            let d = null;
            o.querySelectorAll(".outline-row[data-outline-id]").forEach(e => {
                d || l.indexOf(e.dataset.outlineId) > c && (d = e);
            }), d ? o.insertBefore(s, d) : o.append(s);
            const u = r.querySelector(".outline-branch-count");
            u && (u.textContent = String(o.querySelectorAll(".outline-row[data-outline-id]").length));
        }
        function __sxOnDeckPrune(e, t) {
            if (!window.__sxOnDeck || !Go) return;
            if (!e.open) return void __sxOnDeckCollapsed.add(t);
            if (!__sxOnDeckCollapsed.delete(t)) return;
            const n = __sxOnDeckMembers(Go), i = __sxOnDeckIndex(Go), a = e => {
                for (const [t] of __sxOnDeckTierOrder) if (n[t].includes(e)) return t;
                return null;
            };
            Array.from(e.querySelectorAll(".outline-row[data-outline-id]")).forEach(e => {
                const r = e.dataset.outlineId;
                if (__sxOnDeckTouched.get(r) !== t) return;
                __sxOnDeckTouched.delete(r);
                const o = a(r);
                o === t || (e.remove(), o && __sxOnDeckPlaceRow(r, o, n, i));
            });
            const r = e.querySelector(".outline-branch-count");
            r && (r.textContent = String(e.querySelectorAll(".outline-row[data-outline-id]").length));
        }
        // On Deck unresolved queue (E4b): entries an import parked on
        // profile.droppedKeys because their keys matched no current
        // topic. They are not On Deck members and never count toward
        // the header's "N topics on deck" total — this section carries
        // its own count and offers hand placement onto a real catalog
        // topic, writing the parked value into the entry's own section.
        const __sxParkedSectionNames = {
            annotations: "annotations",
            fantasyOnly: "fantasy-only list",
            alreadyTried: "already-tried list",
            ratingSources: "rating sources",
            notes: "notes",
            importAttention: "import attention"
        };
        function __sxParkedGuess(rec) {
            if (rec && "string" == typeof rec.label && rec.label) return rec.label;
            const key = String(rec && rec.key || ""), parts = key.replace(/^topic-/, "").split("-").filter(Boolean), tail = parts.length > 2 ? parts.slice(2) : parts;
            return tail.join(" ") || key;
        }
        function __sxPlaceParked(profileId, rec, topicId) {
            if (!profileId || !vt[profileId] || !rec || !topicLabelById[topicId]) return !1;
            const value = rec.value, clone = v => v && "object" == typeof v ? JSON.parse(JSON.stringify(v)) : v;
            if ("ratings" === rec.section) vt[profileId][topicId] = clone(value); else if ("alreadyTried" === rec.section) (et[profileId] || (et[profileId] = {}))[topicId] = !0; else if ("annotations" === rec.section) (Qe[profileId] || (Qe[profileId] = {}))[topicId] = value; else if ("fantasyOnly" === rec.section) (Je[profileId] || (Je[profileId] = {}))[topicId] = value; else if ("ratingSources" === rec.section) Object.entries(clone(value) || {}).forEach(([flank, src]) => Co(profileId, topicId, flank, src)); else if ("notes" === rec.section) (tt[profileId] || (tt[profileId] = {}))[topicId] = clone(value); else if ("importAttention" === rec.section) (cn[profileId] || (cn[profileId] = new Set)).add(topicId); else return !1;
            const store = droppedKeyRecords[profileId] || [];
            return droppedKeyRecords[profileId] = store.filter(e => e !== rec), zt(profileId), !0;
        }
        function __sxRenderOnDeck(e) {
            const t = __sxOnDeckMembers(e), n = __sxOnDeckIndex(e), i = document.getElementById("outlineShowOnDeck");
            i && (i.checked = !0), Oo.textContent = (e === Et ? "New profile" : wt[e] || "Profile") + (yt[e] ? " *" : ""), Ro.replaceChildren();
            __sxOnDeckCollapsed.clear();
            let r = 0;
            __sxOnDeckTierOrder.forEach(([e, i]) => {
                const o = t[e].filter(n => {
                    const t = __sxOnDeckTouched.get(n);
                    return !t || t === e;
                });
                __sxOnDeckTouched.forEach((t, n) => {
                    t === e && !o.includes(n) && o.push(n);
                });
                if (!o.length) return;
                r += o.length;
                const s = document.createElement("details");
                s.className = "outline-branch ondeck-branch", s.dataset.ondeckTier = e, s.open = !0;
                const l = document.createElement("summary"), c = document.createElement("span"), d = document.createElement("span"), u = document.createElement("span");
                c.className = "outline-branch-disclosure", c.textContent = "›", c.setAttribute("aria-hidden", "true"), 
                d.className = "outline-branch-title", d.textContent = i, u.className = "outline-branch-count", 
                u.textContent = String(o.length), l.append(c, d, u), s.append(l);
                const p = document.createElement("div");
                p.className = "outline-rows", o.forEach(e => {
                    const t = n.get(e);
                    t && p.append(As(t, Go));
                }), s.append(p), s.addEventListener("toggle", () => __sxOnDeckPrune(s, e)), Ro.append(s);
            });
            const parkedEntries = (droppedKeyRecords[e] || []).filter(rec => rec && "string" == typeof rec.key && rec.key);
            if (parkedEntries.length) {
                const s = document.createElement("details");
                s.className = "outline-branch ondeck-branch ondeck-unresolved", s.open = !0;
                const l = document.createElement("summary"), c = document.createElement("span"), d = document.createElement("span"), u = document.createElement("span");
                c.className = "outline-branch-disclosure", c.textContent = "›", c.setAttribute("aria-hidden", "true"), 
                d.className = "outline-branch-title", d.textContent = "Unresolved imports", u.className = "outline-branch-count", 
                u.textContent = String(parkedEntries.length), l.append(c, d, u), s.append(l);
                const intro = document.createElement("p");
                intro.className = "ondeck-unresolved-intro", intro.textContent = "These came in with an import and match no current topic. Place each one by hand onto the topic it belongs to, and it lands with its imported value.", 
                s.append(intro);
                const p = document.createElement("div");
                p.className = "ondeck-unresolved-rows";
                const topicOptions = Object.keys(topicLabelById).map(id => ({
                    id: id,
                    label: topicLabelById[id]
                })).sort((a, b) => a.label.localeCompare(b.label));
                parkedEntries.forEach(rec => {
                    const row = document.createElement("div");
                    row.className = "ondeck-unresolved-row";
                    const info = document.createElement("div");
                    info.className = "ondeck-unresolved-info";
                    const label = document.createElement("span");
                    label.className = "ondeck-unresolved-label", label.textContent = __sxParkedGuess(rec);
                    const keyLine = document.createElement("span");
                    keyLine.className = "ondeck-unresolved-key", keyLine.textContent = rec.section && "ratings" !== rec.section ? `${rec.key} · from ${__sxParkedSectionNames[rec.section] || rec.section}` : rec.key, 
                    info.append(label, keyLine);
                    const picker = document.createElement("select");
                    picker.className = "ondeck-unresolved-select", picker.setAttribute("aria-label", `Place “${__sxParkedGuess(rec)}” (${rec.key}) on a topic`);
                    const placeholder = document.createElement("option");
                    placeholder.value = "", placeholder.textContent = "Choose a topic…", picker.append(placeholder), topicOptions.forEach(o => {
                        const opt = document.createElement("option");
                        opt.value = o.id, opt.textContent = o.label, picker.append(opt);
                    });
                    const apply = document.createElement("button");
                    apply.type = "button", apply.className = "action-btn ondeck-unresolved-apply", apply.textContent = "Place it", apply.addEventListener("click", () => {
                        const topicId = picker.value;
                        if (!topicId) return void picker.focus();
                        __sxPlaceParked(e, rec, topicId) && (row.remove(), u.textContent = String((droppedKeyRecords[e] || []).length), 
                        (droppedKeyRecords[e] || []).length || s.remove(), ws());
                    }), row.append(info, picker, apply), p.append(row);
                }), s.append(p), Ro.append(s);
            }
            if (!r && !parkedEntries.length) {
                const e = document.createElement("p");
                e.className = "ondeck-empty", e.textContent = "Nothing on deck — every imported topic in this profile is fully rated.", 
                Ro.append(e);
            }
        }
        document.getElementById("outlineShowOnDeck")?.addEventListener("change", e => {
            window.__sxOnDeck = Boolean(e.target.checked), e.target.checked || (__sxOnDeckTouched.clear(), __sxOnDeckCollapsed.clear()), Cs();
        });
        Ro.addEventListener("input", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (t) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
        Ro.addEventListener("click", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineMarkFlag");
            if (t) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
        Ro.addEventListener("keydown", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (t && ("Delete" === e.key || "Backspace" === e.key)) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
        window.addEventListener("pointerup", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (t) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
