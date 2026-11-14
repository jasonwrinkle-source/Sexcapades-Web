        function Qa(e) {
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            if (!n) return;
            selectSpokeNode(n, !0);
            const rec = qn[n] || Xn(n);
            if (rec && "Topic" === rec.kind && typeof xo === "function") {
                const rect = t.getBoundingClientRect ? t.getBoundingClientRect() : { left: innerWidth / 2, width: 0, bottom: innerHeight / 2 };
                xo(n, rect.left + rect.width / 2, rect.bottom + 8);
            }
        }
        function clearSelectionMarking() {
            if (Cn) Cn.querySelectorAll(".selected-spoke").forEach(el => el.remove());
        }
        function clearSpokeSelection() {
            // The one clear path (Build 2026-10-19_0543): clear the
            // selected node and any pending rating target, and remove
            // the selection marking from the existing DOM.
            // Geometry-neutral: no re-render — a full solve (Mr())
            // would discard delivered geometry (scoped editor commits,
            // DeKnotter runs) that exists only in the rendered DOM. The
            // map-selection-dim observer clears sel-keep /
            // has-selection in response to the marking removal.
            // Returns whether anything was selected.
            const had = Boolean(Lt || Nt);
            if (had) {
                Lt = null, Nt = null, sxSelEditorMirrored = null;
                clearSelectionMarking();
            }
            return had;
        }
        function stampSelectedSpoke(d, host) {
            if (!host) return;
            const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("class", "selected-spoke");
            p.setAttribute("d", d || "");
            p.setAttribute("aria-hidden", "true");
            let ref = host.firstChild;
            while (ref && 1 === ref.nodeType && ref.classList.contains("group-heat")) ref = ref.nextSibling;
            host.insertBefore(p, ref);
        }
        function applySelectionMarking(id, t) {
            // Stamp the .selected-spoke highlight(s) for a selection
            // onto the existing DOM, reproducing the render's end
            // state exactly (no re-render: Mr() re-solves and
            // re-renders the whole map from canonical layout state,
            // silently discarding delivered geometry). The render
            // builds each spoke through Ka, whose predicate marks the
            // spoke whose id is the selected node, its parent, or its
            // branch (cat-<slug of branch>) — but only spokes Ka
            // actually builds can carry the mark, and the render's
            // spoke-underlay pass then moves the branch spoke's
            // visuals out of the hub group. The end state is:
            // a topic's own mark stays in its node group (its Ka
            // output is wrapped in .second-gen-rating-controls-only,
            // which the underlay pass skips); the branch's mark lives
            // in the branch's line-group underlay element
            // (.spoke-underlay-item[data-spoke-for="cat-<slug>"]),
            // never in the hub node group; and a subcategory carries
            // no mark of its own (its line is drawn by
            // renderKinkLine, which stamps no highlight, and no mark
            // is stamped for a topic's parent subcategory either) —
            // selecting a subcategory marks only its branch's line.
            // Which spokes carry a mark, and where, is decided by
            // selectionMarkKind (the single selection-marking
            // authority, defined above Ka) — the same function Ka
            // consults during render, so the end state reproduced
            // here cannot drift from the render's.
            // Each stamp copies its d from the spoke's .concept-hit —
            // the same path data the render stamps. Element
            // add/remove is a childList mutation, so the
            // map-selection-dim observer mirrors the result into
            // sel-keep / has-selection unchanged. No canonical layout
            // state and no delivered-geometry registry entry is
            // written here.
            if (!Cn) return;
            clearSelectionMarking();
            const hits = new Map();
            Cn.querySelectorAll(".concept-hit").forEach(hit => {
                const hid = hit.getAttribute("data-id");
                if (hid && !hits.has(hid) && !hit.closest(".layout-exit-clone")) hits.set(hid, hit);
            });
            const branchCatId = t && t.branch ? catId(t.branch) : null;
            if ("own" === selectionMarkKind(id, id, t)) {
                const hit = hits.get(id);
                if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
            if ("branch" === selectionMarkKind(branchCatId, id, t)) {
                const hit = hits.get(branchCatId), underlay = Cn.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(branchCatId)}"]`);
                if (underlay) stampSelectedSpoke(hit ? hit.getAttribute("d") : "", underlay);
                else if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
        }
        function selectSpokeNode(n, notify) {
            // The one selection path for a spoke's node (Build
            // 2026-10-18_1401): spoke taps (click and gesture paths),
            // spoke keyboard activation, and the Layout Editor's selects
            // (via __SEXCAPADES_LAYOUT_API.selectNode) all land here, so
            // selecting a branch means the same thing everywhere — set
            // the selected node, clear any pending rating target, apply
            // the .selected-spoke marking to the existing DOM, and
            // (unless the Layout Editor initiated it) notify the editor
            // so its Advanced selects follow. Selection-only: no
            // re-render and no solve — Mr() would re-deliver every
            // node position from canonical layout state, discarding
            // delivered geometry (scoped editor commits, DeKnotter
            // runs) that exists only in the rendered DOM.
            if (!n) return;
            Lt = n, Nt = null, sxSelEditorMirrored = n;
            applySelectionMarking(n, qn[n] || Xn(n) || (at[Vi()] || {})[n] || null);
            if (notify === !1) return;
            try {
                window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.selectNode && window.__SEXCAPADES_LAYOUT_UI.selectNode(n);
            } catch (err) { __sxErrLog("layout-select-node", err); }
        }
        function Qsel(e) {
            // Spoke tap = select ONLY (Build 2026-10-18_1401, deprecating
            // the tap-to-expand/collapse toggle on spokes): tapping a
            // spoke — the hit line, the stem, the taper, or the midline —
            // selects that branch and never expands or collapses it, not
            // even when the tapped spoke's branch is already selected
            // (Build 1314's fall-through to Qa in that case is removed).
            // Expand/collapse lives on the label and icon taps (Qa).
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            n && selectSpokeNode(n, !0);
            const rec = qn[n] || Xn(n);
            if (rec && "Topic" === rec.kind && typeof xo === "function") {
                const rect = t.getBoundingClientRect ? t.getBoundingClientRect() : { left: innerWidth / 2, width: 0, bottom: innerHeight / 2 };
                xo(n, rect.left + rect.width / 2, rect.bottom + 8);
            }
        }
        function Ja() {
            In.querySelectorAll(".map-label").forEach(e => {
                const t = qn[e.dataset.topicId];
                if (!t) return;
                const n = Tt && t.label.toLowerCase().includes(Tt);
                e.classList.toggle("revealed", Boolean(n || rn.has(t.branch)));
            }), function() {
                if ("number" != typeof $p || "number" != typeof Ep || "number" != typeof Ap || void 0 === nh) return;
                const e = nh;
                In.querySelectorAll(".node-group[data-layout-key]").forEach(t => {
                    t.dataset.layoutKey;
                    const n = Ep + Number(t.dataset.layoutX) * $p, i = Ap + Number(t.dataset.layoutY) * $p, a = !Number.isFinite(n) || !Number.isFinite(i) || n < e.x - 90 || n > e.x + e.width + 90 || i < e.y - 90 || i > e.y + e.height + 90;
                    a !== Boolean(t.dataset.cameraOffscreen) && (t.dataset.cameraOffscreen = a ? "true" : "", 
                    t.querySelectorAll("[role],[tabindex]").forEach(e => {
                        a ? (e.hasAttribute("role") && (e.dataset.cameraRole = e.getAttribute("role")), 
                        e.hasAttribute("tabindex") && (e.dataset.cameraTabindex = e.getAttribute("tabindex")), 
                        e.removeAttribute("role"), e.setAttribute("tabindex", "-1"), e.setAttribute("aria-hidden", "true"), 
                        e.style.pointerEvents = "none") : (void 0 !== e.dataset.cameraRole && (e.setAttribute("role", e.dataset.cameraRole), 
                        delete e.dataset.cameraRole), void 0 !== e.dataset.cameraTabindex ? (e.setAttribute("tabindex", e.dataset.cameraTabindex), 
                        delete e.dataset.cameraTabindex) : e.removeAttribute("tabindex"), e.removeAttribute("aria-hidden"), 
                        e.style.removeProperty("pointer-events"));
                    }));
                });
            }();
        }
        function focusRelationLink(link, event) {
            event?.preventDefault(), event?.stopPropagation();
            const branchNames = [link.dataset.branchA, link.dataset.branchB].filter(Boolean), topicIds = [link.dataset.topicA, link.dataset.topicB].filter(Boolean);
            topicIds.forEach(id => {
                const topic = qn[id] || Xn(id);
                topic?.branch && branchNames.push(topic.branch);
            });
            branchNames.forEach(name => rn.add(name));
            if (branchNames.length) Mr();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const endpointIds = topicIds.length ? topicIds : branchNames.map(name => catId(name));
                const points = endpointIds.map(id => In.querySelector(`[data-layout-key="${CSS.escape(id)}"]`)).filter(Boolean).map(node => {
                    node.classList.remove("is-hidden");
                    return {x:Number(node.dataset.labelX || node.dataset.layoutX), y:Number(node.dataset.labelY || node.dataset.layoutY)};
                }).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
                if (points.length < 2) return;
                const [a,b] = points, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, pad = innerWidth <= 620 ? 70 : 110, spanX = Math.abs(b.x-a.x) + 170, spanY = Math.abs(b.y-a.y) + 170, scale = Math.max(.28, Math.min(innerWidth <= 620 ? 2.2 : 2.6, (nh.width-2*pad)/Math.max(spanX,1), (nh.height-2*pad)/Math.max(spanY,1)));
                const prevBt = Bt; Bt = !0; Ph(scale, nh.x + nh.width/2 - cx*scale, nh.y + nh.height/2 - cy*scale); Bt = prevBt;
            }));
        }
        document.addEventListener("click", function(event) {
            const link = __sxClosestAction(event.target, "relationHit");
            link && focusRelationLink(link, event);
        }, !0);
        window.__sxOnKey( function(event) {
            const link = event.target.closest?.(".common-overlap-link.relation-hit");
            link && (event.key === "Enter" || event.key === " ") && focusRelationLink(link, event);
        }, !0);
