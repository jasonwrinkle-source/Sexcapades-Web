        function sxMintPairGroup(pairOp) {
            // Pair kind (2026-10-27): "straight" mints a ⊙ pair; every
            // other call is the original bowtie mint, unchanged. The
            // kind drives the name join below (⋈ vs ⊙), the pairOp
            // field on the group record, and - through that field -
            // Rd's compute dispatch.
            const sxPairOp = sxNormalizePairOp(pairOp);
            const t = (qd.length ? qd : sxScoringProfileIds()).filter(e => vt[e]);
            if (t.length < 2) return !1;
            const n = t.map(e => ({
                name: wt[e],
                ratings: sxCloneProfileRecord(vt[e]),
                annotations: sxCloneProfileRecord(Qe[e]),
                fantasyOnly: sxCloneProfileRecord(Je[e]),
                alreadyTried: sxCloneProfileRecord(et[e]),
                importedChildren: sxCloneProfileRecord(at[e]),
                genders: sxNormalizeGenders(rt[e]),
                orientations: sxNormalizeOrientations(ot[e]),
                veil: sxClampVeilLevel(vpt[e]),
                veilEnabled: Boolean(vht[e]),
                net: sxClampVeilLevel(vpt[e]),
                netEnabled: Boolean(vht[e])
            }));
            const a = t.map(e => String(wt[e] || "Profile").trim()).join(sxPairJoin(sxPairOp));
            const o = sxAllocateProfileId(a);
            const opName = "straight" === sxPairOp ? "straight" : "minus" === sxPairOp ? "minus" : "cross";
            // Match-tab fix (2026-10-26): saving CLOSES the match view.
            // Every match tab is torn down and the stage deactivated
            // before the strip rebuilds below, so post-save the screen is
            // the new group profile's own map with the group as the
            // active profile - no match chrome left on screen (the old
            // code left the tab active and visible, which made the new
            // group tab a guaranteed no-op click and read as being
            // trapped on the comparison tab). The teardown is shared
            // with the auto-create select-existing path.
            sxTeardownMatchTabs();
            return vt[o] = {}, Ze[o] = {}, Qe[o] = {}, Je[o] = {}, et[o] = {}, tt[o] = {}, at[o] = {}, 
            gt[o] = {}, mt[o] = {}, wt[o] = a, profileSkins[o] = window.__SX_ACTIVE_SKIN || "sexcapades", rt[o] = [ "couple" ], ot[o] = [ "mixed" ], st[o] = [], 
            lt[o] = "", ct[o] = "", dt[o] = [], ut[o] = {}, pz[o] = "", nt[o] = "", it[o] = "", vpt[o] = 50, 
            vht[o] = !1, ft[o] = {
                kind: "group",
                pairOp: sxPairOp,
                isPseudoProfile: !0,
                operation: opName,
                sourceIds: t.slice(),
                sourceNames: t.map(e => wt[e] || "Profile"),
                sourceProfiles: n,
                fingerprint: typeof sxSourcesFingerprint === "function" ? sxSourcesFingerprint(t) : "",
                recipe: {
                    operation: opName,
                    sourceProfileIds: t.slice(),
                    sourceNames: t.map(e => wt[e] || "Profile")
                },
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
            }, sxRefreshGroupScore(o), sxProfileColor(o), Mt = o, It = o, sxSel(null, "clear"), qd = [], Wd = null, sxHoldExpansion(), sxExpandGroupMap(), 
            // Save marking (2026-10-26): Rd marks EVERY recompute dirty
            // (zt at its tail) - that recompute-marking, not the save
            // itself, is why a freshly saved group tab still read
            // "unsaved changes" live. Zd IS the save (and, since
            // auto-create, creation and save are the same act), so the
            // new group must not arrive marked by its own creation: the
            // flag is cleared here, the same end state saveActiveProfile
            // leaves via Vt. It is cleared directly rather than through
            // Vt so the draft-autosave timer Rd's zt queued - the
            // Remember-on-this-device persist path - still fires and
            // persists the group like any other profile; that timer's
            // own Vt then finishes the cleanup. Later edits re-mark
            // through zt as usual.
            delete yt[o], sxSyncUnsavedFlag(), sxRenderProfileTabs(), sxRequestMapPaint(), sxApplyMapFit(), !0;
        }
        function sxOpenScribeChoice(t) {
            const i = t[0];
            if (!i || !vt[i]) return;
            scribeCastIds = t.slice(), scribeLeadId = i;
            const castText = t.filter(e => vt[e]).map(e => sxCastNameText(e)).join(" + ");
            if (e.byId("scribeChoiceProfiles")) e.byId("scribeChoiceProfiles").textContent = castText;
            if (e.byId("scribeProfiles")) e.byId("scribeProfiles").textContent = castText;
            scribePartnerId = 2 === t.length ? t[1] : null;
            const a = t.filter(e => vt[e]).length > 1, l = e.byId("generateScribePrompt"), c = e.byId("scribeLengthUnit");
            const opField = e.byId("scribeOperationField");
            if (opField) {
                if (!a) {
                    opField.hidden = true;
                } else {
                    opField.hidden = false;
                    const minusLabel = e.byId("scribeOpMinusLabel");
                    if (minusLabel) {
                        minusLabel.textContent = t.length >= 3 ? "Polylectic (⊖)" : "Dialectic (⊖)";
                    }
                    const isDisc = typeof sxScribeIsDiscussion === "function" && sxScribeIsDiscussion();
                    const defaultOp = isDisc ? "full_arc" : "cross";
                    const curRadio = document.querySelector('input[name="scribeOperation"]:checked');
                    if (!curRadio) {
                        const targetRadio = e.byId(defaultOp === "full_arc" ? "scribeOpFullArc" : defaultOp === "minus" ? "scribeOpMinus" : defaultOp === "straight" ? "scribeOpStraight" : "scribeOpCross");
                        if (targetRadio) targetRadio.checked = true;
                        scribeOperation = defaultOp;
                    } else {
                        scribeOperation = curRadio.value;
                    }
                }
            }
            // The panel copy comes from the active skin's `scribe`
            // section (window.__SX_SCRIBE, set by the loader). The
            // loader swaps the same strings at boot; this re-applies
            // them on open with the cast's real single/multi form. On a
            // vanilla skin there is no Scene Setter pointer and no
            // Literotica copy - the spec's discussion copy replaces it.
            if (window.__SX_SET_SCRIBE_PANEL) window.__SX_SET_SCRIBE_PANEL(window.__SX_SCRIBE, a);
            else {
                const o = e.byId("scribeModeDescription"), s = e.byId("scribeChoiceIntro"), d = e.byId("scribePageCountHelp");
                o && (o.textContent = a ? "Scribe turns your selected profiles into a Literotica-style erotic story featuring all partners’ shared desires and dynamics. For a practical play checklist and negotiation guide, use Scene Setter." : "One profile creates a Literotica-style erotic story for fantasy and enjoyment—not a real-world plan. For a practical play checklist and negotiation guide, use Scene Setter."),
                d && (d.textContent = "Story length in word count, paragraphs, pages, chapters, or minutes. Enter one number or a range; blank defaults to 5 paragraphs."),
                s && (s.textContent = a ? "Multiple profiles selected: Scribe will create a Literotica-style erotic Story featuring all selected partners." : "One profile selected: Scribe will create a Literotica-style erotic Story.");
            }
            c && (c.disabled = !1),
            l && (l.textContent = "Prompt"), kg.open && sxCloseModalDialog(kg),
            Sg.open && sxCloseModalDialog(Sg), Oc.open && sxCloseModalDialog(Oc), jc.open && sxCloseModalDialog(jc), sxOpenModalDialog(Bc);
        }
        function sxEnterScribeCast(e) {
            const t = sxScoringProfileIds(), n = t[0] || Mt;
            if (!n || !vt[n]) return;
            const i = 1 === t.length && "group" === ft[n]?.kind ? ft[n] : null, a = i && Array.isArray(i.sourceIds) ? i.sourceIds.filter(e => vt[e]) : [], r = a.length >= 2 ? a : t.length ? t.slice() : [ n ];
            // Scribe fallback, redesigned (owner ruling, 2026-10-27):
            // this state CAN still occur through the button doorway -
            // the multi-select set (Yi) can hold two or more profiles
            // while Xi() resolves to fewer than two (the selection is
            // not the active comparison, e.g. the overlay was toggled
            // off after selecting). The old route called the leniency
            // setter, which recomputed the active pair as a side
            // effect of merely opening Scribe, then retried. The retry
            // now resolves the cast straight from the live multi-select
            // and opens the Scribe choice directly - no recompute, no
            // recursion, no side effect.
            if (r.length < 2 && sxListLiveSelections().length >= 2) return sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = sxListLiveSelections().filter(e => vt[e]), void sxOpenScribeChoice(sxCompareIds);
            if (r.length < 1) return void sxShowStatusToast("Scribe needs at least 1 profile in the multi-select. Select a profile tab — Ctrl+click (Cmd+click on Mac) profile tabs to build a multi-select — then open Scribe again.", {
                tone: "error",
                persistent: !0
            });
            if (a.length >= 2) return sxGroupLeniency = Number.isFinite(Number(i.leniency)) ? Number(i.leniency) : 50, sxWriterLeniency = sxGroupLeniency, void sxOpenScribeChoice(r);
            sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = r.slice(), sxOpenScribeChoice(r);
        }
        function sxDrawWrappedLines(e, t, n, i, a, r, o = 99) {
            const s = String(t || "").split(/\s+/), l = [];
            let c = "";
            return s.forEach(t => {
                const n = c ? c + " " + t : t;
                e.measureText(n).width > a && c ? (l.push(c), c = t) : c = n;
            }), c && l.push(c), l.slice(0, o).forEach((t, a) => e.fillText(t + (a === o - 1 && l.length > o ? "…" : ""), n, i + a * r)), 
            i + Math.min(l.length, o) * r;
        }
        function sxRatedNodeSet(e) {
            const t = new Set;
            return h.forEach(n => {
                if (!sxIsBranchVeilShown(n, e)) return;
                const i = catId(n.name);
                let a = !1;
                n.topics.forEach(n => {
                    const i = sxResolveTopicId(n);
                    if (sxIsLimitOrUninterested(i, e)) return;
                    const r = t => sxHasKnownRating(t, e) || Boolean(Qe[e]?.[t]) || Boolean(Je[e]?.[t]) || Boolean(et[e]?.[t]) || Boolean(tt[e]?.[t]?.length), o = sxListImportedChildIds(i, e).filter(t => r(t) && !sxIsLimitOrUninterested(t, e));
                    (r(i) || o.length) && (t.add(i), o.forEach(e => t.add(e)), a = !0);
                }), a && t.add(i);
            }), !t.size && sxHasNoRatedCategory(e) && h.forEach(e => t.add(catId(e.name))), t;
        }
        // F8 companion note (sharing-sync refactor): nu performs the
        // same solo-switch / collect / restore shape as the export
        // opener Jf - it snapshots the selection state at entry,
        // switches the live map to solo, collects, and restores
        // inline at the end. Checked during the F8 pass: the restore
        // here is inline and NOT wrapped in try/finally, and the
        // guard was deliberately NOT generalized from Jf to nu in
        // that pass (Jf's comment records the decision). Any future
        // hardening of this pattern should cover both sites or
        // neither, and say which.
        async function sxRenderExportMap(t, n, i = {}) {
            const a = sxListLiveSelections(), r = [ ...rn ], o = [ ...on ], s = new Map(un), l = Lt, c = Nt, d = Mt, u = It, p = Pt, g = Tt, m = $n, f = En, y = Boolean(i.profileFill), b = Math.max(.25, Math.min(1, Number(i.outputScale) || 1)), v = Math.max(320, Number(i.outputWidth) || (y ? 3600 : 1800)), w = Math.max(320, Number(i.outputHeight) || (y ? 3600 : 1240)), k = Math.round(v * b), x = Math.round(w * b);
            n && vt[n] && (Mt = n, It = n), Pt = "all", Tt = "", sxSel(t, "set"), 
            t.length < 2 && sxSel(null, "clear"), rn.clear(), r.forEach(e => rn.add(e)), on.clear(), o.forEach(e => on.add(e)),
            Lt = null, Nt = null, En = !1;
            const S = i.allowedIds instanceof Set ? new Set(i.allowedIds) : new Set(Array.isArray(i.allowedIds) ? i.allowedIds : []);
            i.allowedIds || t.forEach(e => sxRatedNodeSet(e).forEach(e => S.add(e))), S.forEach(e => {
                const t = sxNodeRegistry[e] || sxNodeById(e) || (at[n] || {})[e];
                t?.parentId && (on.add(t.parentId), un.set(t.parentId, "all"));
            }), $n = S, sxRequestMapPaint({
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
                    t && In.querySelectorAll("path,text,circle,ellipse,rect,line,polyline,polygon,use").forEach(e => {
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
                    e.textContent = sxFirstWordText(t);
                });
            }(A, i.displayName), i.nativeTooltips && function(t, n, i = {}) {
                if (!t || !n || !vt[n]) return;
                const a = (e, t) => {
                    if (!e || !t) return;
                    Array.from(e.children || []).filter(e => "title" === e.localName).forEach(e => e.remove());
                    const n = document.createElementNS("http://www.w3.org/2000/svg", "title");
                    n.textContent = String(t).trim(), e.insertBefore(n, e.firstChild);
                }, r = e => sxNodeRegistry[e] || sxNodeById(e) || (at[n] || {})[e] || sxCollectAllImports().find(t => t.id === e), o = (e, t) => String(t?.querySelector(".category-label,.map-label")?.textContent || r(e)?.label || e || "Topic").trim();
                t.querySelectorAll(".node-group[data-layout-key]").forEach(e => {
                    const t = e.getAttribute("data-layout-key"), i = o(t, e), s = r(t);
                    if (!t || !i) return;
                    const l = sxFillAncestorFlanks(t, n), c = [ i, `Give: ${l.giveKnown ? Math.round(l.give) : "unrated"} · Receive: ${l.receiveKnown ? Math.round(l.receive) : "unrated"}` ];
                    s && c.push(sxPlacardAboutText(s));
                    const d = [], u = sxAnnotationState(t, n);
                    "favorite" === u ? d.push("Favorite") : "limit" === u ? d.push("Hard Limit") : "notinterested" === u && d.push("Not Interested"), 
                    Boolean(Je[n]?.[t]) && d.push("Fantasy-only"), Boolean(et[n]?.[t]) && d.push("Already Tried"), 
                    Boolean(tt[n]?.[t]?.length) && d.push("Has note"), d.length && c.push(d.join(" · ")), 
                    a(e, c.join("\n"));
                }), t.querySelectorAll(".direction-control[data-id][data-direction]").forEach(e => {
                    const t = e.getAttribute("data-id"), i = e.getAttribute("data-direction");
                    if (!t || !i || "group" === i) return;
                    const s = sxRatingRecord(t, n), l = Boolean(s[i + "Known"]), c = l ? Math.round(s[i]) : "unrated", d = r(t), u = o(t, e), p = sxRoleLabelText(t, i), h = sxGiveReceiveNounText(t, i), g = l && s[i + "Derived"] ? ` · rolled up from ${s[i + "RatedChildren"]} of ${s.childCount} child topics` : "";
                    a(e, `${d?.label || u} · ${p}${h ? ` ${h}` : ""}: ${c}${g}`);
                });
                const s = t.querySelector(".center-hit"), l = s && s.parentElement;
                if (l) {
                    const e = sxGlanceBucketsFor(n), r = sxTallyComparedRatings([ n ]), o = sxRingValuesForProfile(sxProfileById(n)), s = String(t.querySelector(".center-name-arc-text textPath,.center-label")?.textContent || i.displayName || "Profile").trim(), c = (e.green.length, 
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
            s.forEach((e, t) => un.set(t, e)), Lt = l, Nt = c, sxRequestMapPaint({
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
        function sxChecksumCrc32(e) {
            sxChecksumCrc32.table || (sxChecksumCrc32.table = Array.from({
                length: 256
            }, (e, t) => {
                let n = t;
                for (let e = 0; e < 8; e++) n = 1 & n ? 3988292384 ^ n >>> 1 : n >>> 1;
                return n >>> 0;
            }));
            let t = 4294967295;
            for (const n of e) t = sxChecksumCrc32.table[255 & (t ^ n)] ^ t >>> 8;
            return (4294967295 ^ t) >>> 0;
        }
        function sxPngChunkBytes(e, t) {
            const n = (new TextEncoder).encode(e), i = new Uint8Array(t.length + 12), a = new DataView(i.buffer);
            return a.setUint32(0, t.length), i.set(n, 4), i.set(t, 8), a.setUint32(t.length + 8, sxChecksumCrc32(i.slice(4, t.length + 8))), 
            i;
        }
        // ===== Picture restore guard + save-to-re-read round-trip (Rank 5, 2026-10-30) =====
        // A picture export is a PNG carrying the profile payload in a
        // zTXt chunk (keyword "Sexcapades", zlib-stored deflate) plus,
        // when contact info is included, a vCard iTXt chunk. The format
        // already carries integrity checks - a CRC32 over every PNG
        // chunk (written by au() via iu()) and an Adler-32 over the
        // zlib stream (checked in Lx's fallback) - and the restore side
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
            return sxChecksumCrc32(typeAndData) === stored;
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
                        try { decoded = (new TextDecoder).decode(await sxInflatePngProfile(data.slice(nul + 2))); } catch (err) { throw new Error(sxSaveMsg); }
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
                        try { vcardText = (new TextDecoder).decode(compressed ? await sxInflatePngProfile(raw) : raw); } catch (err) { throw new Error(sxSaveMsg); }
                    }
                }
                if ("IEND" === type) { sawIend = true; break; }
                off = end;
            }
            if (!sawIend || null === payloadText || payloadText !== expectedText) throw new Error(sxSaveMsg);
            if (expectedVcard && vcardText !== expectedVcard) throw new Error(sxSaveMsg);
        }
        async function sxEmbedProfilePng(e, t, n = "", i = null) {
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
            const d = [ sxPngChunkBytes("zTXt", c) ];
            n && d.push(function(e, t) {
                const n = (new TextEncoder).encode("vCard"), i = (new TextEncoder).encode(t), a = new Uint8Array(n.length + 5 + i.length);
                return a.set(n), a.set([ 0, 0, 0, 0, 0 ], n.length), a.set(i, n.length + 5), sxPngChunkBytes("iTXt", a);
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
        function sxSaveExportPng(e, t, n = {}) {
            if (!(e instanceof Blob) || "image/png" !== e.type) throw new Error("Export creation did not produce a PNG.");
            if (void 0 !== window.lastExportSvgMarkup && window.lastExportSvgMarkup && !n.svgMarkup) {
                var i = window.lastExportSvgMarkup;
                try {
                    if (n.profileId && vt[n.profileId]) {
                        var a = n.allowedIds instanceof Set ? n.allowedIds : new Set(n.allowedIds || []), r = sxSerializeExportPayload(n.profileId, a, Boolean(n.includeProfileInfo), "", Boolean(n.blind)), o = JSON.stringify(r), s = btoa(unescape(encodeURIComponent(o)));
                        i = i.replace(/<svg([^>]*)>/, "<svg$1>\x3c!--sexcapades-profile:" + s + "--\x3e");
                    }
                } catch (e) { __sxErrLog("svg-embed", e); }
                n.svgMarkup = i, n.svgFilename = String(t || "Sexcapades-export").replace(/\.png$/i, "") + ".svg", 
                n.pdfFilename = String(t || "Sexcapades-export").replace(/\.png$/i, "") + ".pdf", 
                window.lastExportSvgMarkup = null;
            }
            sxPresentExportBlob(e, /\.png$/i.test(String(t || "")) ? String(t) : String(t || "Sexcapades-export").replace(/\.[^.]+$/, "") + ".png", n);
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
        // opts.throughOnEmpty is set - the NovelAI and opener
        // handlers copy even an empty field - matching the handlers
        // this replaces in each case.
        async function sxCopyText(text, statusEl, okText, failText, hostEl, opts) {
            if (!text && !(opts && opts.throughOnEmpty)) return void (statusEl && (statusEl.textContent = failText)), !1;
            const ownTa = !(opts && opts.ta), ta = ownTa ? document.createElement("textarea") : opts.ta;
            ownTa && (ta.value = text, ta.setAttribute("readonly", ""), ta.style.position = "fixed", ta.style.opacity = "0", (hostEl || document.body).appendChild(ta));
            const ok = await sxCopyClipboardText(text, ta);
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
                    explicitness: Math.min(5, Math.max(1, Number(e.byId("scribeExplicitness")?.value) || 4)),
                    pageCount: String(e.byId("scribePageCount")?.value || "").trim()
                };
            }();
            t.participantIds.length && t.topicData.length && (scribeRequestText = t.details, function(t, n) {
                const i = e.byId("scribePageCount"), u = e.byId("scribeLengthUnit"), d = e.byId("scribeDetailLevel"), a = function() {
                    const t = e.byId("scribePageCount"), n = String(t?.value || "").trim().replace(/[–—]/g, "-");
                    if (!n) return t && t.setCustomValidity(""), "5";
                    const i = n.match(/^(\d{1,5}(?:\.\d)?)(?:\s*-\s*(\d{1,5}(?:\.\d)?))?$/);
                    if (!i) return t && (t.setCustomValidity("Use a number such as 5 or a range such as 5–7."), 
                    t.reportValidity()), null;
                    const o = {
                        words: [ 10, 2e4 ],
                        paragraphs: [ 1, 100 ],
                        pages: [ 1, 50 ],
                        minutes: [ 1, 600 ],
                        chapters: [ 1, 50 ]
                    }[String(u?.value || "pages")] || [ 1, 100 ], s = o[0], l = o[1];
                    let a = Math.max(s, Math.min(l, Number(i[1]))), r = i[2] ? Math.max(s, Math.min(l, Number(i[2]))) : null;
                    return null !== r && r < a && ([a, r] = [ r, a ]), t && t.setCustomValidity(""), 
                    null === r ? String(a) : `${a}–${r}`;
                }();
                if (!a) return;
                scribeLengthUnit = [ "words", "paragraphs", "pages", "minutes", "chapters" ].includes(String(u?.value || "")) ? u.value : "paragraphs", scribeDetailLevel = [ "concise", "balanced", "detailed" ].includes(String(d?.value || "")) ? d.value : "balanced",
                scribeLengthValue = a, scribeLengthDisplay = String(i?.value || "").trim() ? a.replace(/–/g, "-") : "~5";
                const r = `Projected: ${scribeLengthDisplay} ${scribeLengthUnit}`;
                e.byId("scenePageProjection").textContent = r, e.byId("novelAiPageProjection").textContent = r, 
                ({ target: scribeTarget, mode: scribeMode } = sxResolveScribeMode(n, t));
                // On a vanilla skin the Explicitness slider is the Depth
                // slider: its value (1-5) is the discussion's rigor
                // (the composer turns it into dissertation-defense
                // material at 5), and the AI target is always the
                // general AI - the story tones (strictai, suggestive,
                // explicit) are Sexcapades-only and never apply to a
                // discussion.
                if (sxScribeIsDiscussion()) scribeRigor = Math.min(5, Math.max(1, Number(e.byId("scribeExplicitness")?.value) || 4));
                const opInput = document.querySelector('input[name="scribeOperation"]:checked');
                if (opInput) scribeOperation = opInput.value;
                const sxSharedIds = (scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]), sxSharedData = sxSharedIds.length ? sxScribeMatchData(sxSharedIds, 1 === sxSharedIds.length) : null;
                const o = "porn" === scribeMode, s = e.byId("scribeTitle"), l = e.byId("scribeModeSummary");
                if (s) s.textContent = o ? (sxScribeIsDiscussion() ? "Scribe — Discussion" : "Scribe — Story") : "Scribe — Play Guide";
                if (l) l.textContent = o ? (sxScribeIsDiscussion() && window.__SX_SCRIBE && window.__SX_SCRIBE.panel && window.__SX_SCRIBE.panel.summary ? window.__SX_SCRIBE.panel.summary : "Fictional storytelling for enjoyment and fantasy — not a real-world plan.") : "Practical coordination guidance for real-world use — not fiction; confirm every activity together.";
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
                    sxCloseModalDialog(Bc);
                    return sxOpenModalDialog(jc), void requestAnimationFrame(() => jc.querySelector("[data-copy-novelai]")?.focus());
                }
                const castNamesText = (scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]).map(e => sxCastNameText(e)).join(" + ");
                if (e.byId("scribeProfiles")) e.byId("scribeProfiles").textContent = castNamesText;
                if (e.byId("scribeChoiceProfiles")) e.byId("scribeChoiceProfiles").textContent = castNamesText;
                const genBtn = e.byId("generateScribePrompt");
                if (genBtn) genBtn.textContent = "Prompt";
                const briefEl = e.byId("sceneBrief");
                if (briefEl) {
                    briefEl.hidden = !1;
                    try { briefEl.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
                }
            }("porn", sxScribeIsDiscussion() ? "grok" : ({ 1: "strictai", 2: "suggestive", 3: "explicit", 4: "uninhibited", 5: "extreme" })[t.explicitness] || "grok"));
        }), e.byId("scribeExplicitness") && e.byId("scribeExplicitness").addEventListener("input", t => { const n = Math.min(5, Math.max(1, Number(t.currentTarget.value) || 4)), i = e.byId("scribeExplicitnessLabel"), lv = window.__SX_SCRIBE && window.__SX_SCRIBE.explicitness && window.__SX_SCRIBE.explicitness.levels ? window.__SX_SCRIBE.explicitness.levels : [ "Tame", "Suggestive", "Explicit", "Uninhibited", "Extreme" ]; i && (i.textContent = `${n} · ${lv[n - 1] || ""}`); }), e.byId("scribePageCount") && e.byId("scribePageCount").addEventListener("input", e => e.currentTarget.setCustomValidity("")),
        document.querySelectorAll('input[name="scribeOperation"]').forEach(r => {
            r.addEventListener("change", () => {
                if (r.checked) {
                    scribeOperation = r.value;
                    const briefEl = e.byId("sceneBrief");
                    if (briefEl && !briefEl.hidden) {
                        const sxSharedIds = (scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(x => vt[x]);
                        if (sxSharedIds.length) {
                            sxPrepScribeDialog(null, true);
                            sxBuildScribePrompt();
                        }
                    }
                }
            });
        }),
        sxWirePhaseToggles("scribe"), sxWirePhaseToggles("setter"),
        e.byId("setterSetup") && e.byId("setterSetup").addEventListener("input", ev => {
            const ids = String(e.byId("negotiationDialog")?.dataset.participants || "").split(",").filter(Boolean);
            if (ids.length < 2) return;
            const st = sxSceneCastPrefs(ids), tg = ev.target, isNegotiationLength = "setterNegotiationLength" === tg.id || "setterNegotiationLengthUnit" === tg.id;
            if ("setterLength" === tg.id) st.length = String(tg.value || "5").trim() || "5"; else if ("setterLengthUnit" === tg.id) st.lengthUnit = String(tg.value || "paragraphs"); else if ("setterDetailLevel" === tg.id) st.detail = String(tg.value || "balanced"); else if ("setterNegotiationLength" === tg.id) st.negotiationLength = String(tg.value || "1").trim() || "1"; else if ("setterNegotiationLengthUnit" === tg.id) st.negotiationLengthUnit = String(tg.value || "pages"); else return;
            sxStoreSceneGuide(ids), isNegotiationLength ? e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = sxSetterIsModeration() ? "Discussion agreement length saved." : "Negotiation guide length saved.") : e.byId("negotiationCopyStatus") && (e.byId("negotiationCopyStatus").textContent = sxSetterIsModeration() ? "Discussion plan settings saved." : "Play guide settings saved.");
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
            const r = sxFilenameSlug((scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]).map(e => wt[e]).join("-"), "profile"), o = sxScribeIsDiscussion() ? "discussion-prompt" : "porn" === scribeMode ? "story-prompt" : "play-guide-prompt", skinPrefix = window.__SX_ACTIVE_SKIN ? window.__SX_ACTIVE_SKIN.charAt(0).toUpperCase() + window.__SX_ACTIVE_SKIN.slice(1) : "Sexcapades", s = new Blob([ a + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), l = URL.createObjectURL(s), c = document.createElement("a");
            c.href = l, c.download = `${skinPrefix}-${r}-${o}.txt`, c.hidden = !0, document.body.appendChild(c), 
            c.click(), c.remove(), t.setTimeout(() => URL.revokeObjectURL(l), 0), i.textContent = "Prompt downloaded.";
        });
        const su = "https://sexcapades.io/#guide", lu = "https://sexcapades.io/#app", cu = [], du = [];
        h.forEach(e => {
            const t = catId(e.name);
            cu.push(t), du.push(t), e.topics.forEach(t => {
                cu.push(sxResolveTopicId(t)), du.push(sxBuildTopicSlugId(e.name, sxName(t)));
            });
        });
        const uu = du.filter(e => "topic-sensation-atmosphere-tantra-energy-play" !== e && "topic-service-ritual-spiritual-play" !== e), pu = uu.reduce((e, t) => ("topic-impact-pain-body-modification-whips" === t || e.push("topic-impact-pain-body-modification-riding-crops" === t ? "topic-impact-pain-body-modification-whipping" : t), 
        e), []), hu = new Map(cu.map((e, t) => [ e, t ]));
        function sxBase64UrlText(e) {
            let t = "";
            for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
            return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        function sxDecodeBase64Url(e) {
            const t = String(e).replace(/-/g, "+").replace(/_/g, "/"), n = atob(t + "=".repeat((4 - t.length % 4) % 4)), i = new Uint8Array(n.length);
            for (let e = 0; e < n.length; e++) i[e] = n.charCodeAt(e);
            return i;
        }
        const fu = cu.filter(e => Boolean(topicLabelById[e])), yu = sxChecksumCrc32((new TextEncoder).encode(fu.join(" ")));
        function sxQuantizeRating(e) {
            return Number.isFinite(Number(e)) ? 1 + Math.max(0, Math.min(14, Math.round(14 * (Number(e) + 100) / 200))) : 0;
        }
        function sxRatingFromSlot(e) {
            return e ? Math.round(200 * (e - 1) / 14 - 100) : null;
        }
        // wu: the token builder for this format (name, ratings, marks
        // in the inner function below). Its only live caller is the
        // anonymous survey send, which keeps includeName/includeMarks
        // false - a privacy property, not an oversize policy, and
        // unchanged by the framework. Oversize handling for this
        // format lives on the receiving side in Nu, which states the
        // format-derived limit; there is no share-link creation
        // caller in this bundle to warn at send time.
        function sxSurveyShareToken(e) {
            const t = function(e, t = {}) {
                if (!vt[e] && e !== Et) throw new Error("Choose a profile before making a link.");
                const n = !1 !== t.includeName, i = !1 !== t.includeMarks, a = n ? (new TextEncoder).encode(String(wt[e] || "Shared hypermap").slice(0, 40)) : new Uint8Array(0), r = [];
                fu.forEach((t, n) => {
                    const a = sxDecodeTopicStance(t, e), o = sxQuantizeRating(a.giveKnown ? a.give : null), s = sxQuantizeRating(a.receiveKnown ? a.receive : null), l = i ? ("favorite" === Qe[e]?.[t] ? 1 : "limit" === Qe[e]?.[t] ? 2 : "notinterested" === Qe[e]?.[t] ? 16 : 0) | (Je[e]?.[t] ? 4 : 0) | (et[e]?.[t] ? 8 : 0) : 0;
                    (o || s || l) && r.push(n, o << 4 | s, l);
                });
                const o = new Uint8Array(9 + a.length + r.length), s = new DataView(o.buffer);
                return o.set([ 83, 88, 1 ], 0), s.setUint32(3, yu), o[7] = a.length, o[8] = r.length / 3, 
                o.set(a, 9), o.set(r, 9 + a.length), sxBase64UrlText(o);
            }(e, {
                includeName: !1,
                includeMarks: !1
            }), n = sxNormalizeTimers(mt[e]).outline;
            return n && n.timerRan ? `${t};t=${n.durationSeconds}` : t;
        }
        async function sxCopyClipboardText(e, t) {
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
        function sxOpenerUrl() {
            const prefix = window.__SX_SKIN_PREFIX || (typeof window.__sxGetSkin === "function" ? window.__sxGetSkin() : null) || "sex";
            return "https://" + prefix + ".capades.io";
        }
        const Su = [ `Found this comparison tool. Want to compare hypermaps?`, `I mapped my stances on this thing. Dying to see how we overlap — compare hypermaps?`, `Ever wondered where our views line up with someone else’s? Compare hypermaps?`, `I put my whole map together. Compare hypermaps? Let’s see what happens:`, `This site maps stances and compares them with a partner’s. Compare hypermaps?`, `What if you could see exactly where your views overlap with someone? Compare hypermaps?`, `I wonder how compatible we really are… compare hypermaps? Let’s find out:`, `Map your views, compare with mine. Compare hypermaps?` ];
        let $u = -1;
        function sxFillOpenerMessage() {
            e.byId("openerMessage").value = function() {
                let e = Math.floor(Math.random() * Su.length);
                Su.length > 1 && e === $u && (e = (e + 1 + Math.floor(Math.random() * (Su.length - 1))) % Su.length), 
                $u = e;
                const t = Su[e], url = sxOpenerUrl();
                return `${t} ${url}`;
            }(), e.byId("openerCopyStatus").textContent = "";
        }
