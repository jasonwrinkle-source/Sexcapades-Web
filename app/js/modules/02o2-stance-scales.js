        const INTEREST_STOPS = {
            curious: [ 215, 189, 85 ],
            positive: [ 61, 168, 116 ],
            negative: [ 189, 79, 81 ]
        };
        function sxInterestColor(e) {
            e = Number(e) || 0;
            // The --curious value is read once and cached on the function
            // (finding 8): zi is called per spoke per render and
            // getComputedStyle forces style recalculation. No theme
            // switch exists in the app, so nothing invalidates the cache.
            if (0 === e) return sxInterestColor._curious ??= getComputedStyle(document.documentElement).getPropertyValue("--curious").trim();
            const n = Math.min(1, Math.abs(e) / 100), i = INTEREST_STOPS.curious, a = e > 0 ? INTEREST_STOPS.positive : INTEREST_STOPS.negative;
            return `rgb(${Math.round(i[0] + (a[0] - i[0]) * n)},${Math.round(i[1] + (a[1] - i[1]) * n)},${Math.round(i[2] + (a[2] - i[2]) * n)})`;
        }
        function sxActiveProfileId() {
            return Mt || Et;
        }
        function sxListLiveSelections() {
            return Array.from(en).filter(e => vt[e]);
        }
        // Profiles-data F2: the chosen set changes ONLY through sxSel(),
        // and sxSel() is the only place the comparison-active flag (an)
        // is written: after every mutation the flag is re-derived from
        // the set (active exactly when the set holds more than one live
        // member). No caller hand-syncs the flag any more, so the set
        // and the flag cannot disagree - toggling a second profile in
        // now leaves comparison active. The flag stays a cache for one
        // reason: sxSel's "dismiss" operation (Hide group overlay)
        // clears the flag while leaving the chosen set untouched, as
        // that button has always behaved; a pure derivation cannot
        // express it without changing which profiles are chosen.
        function sxSel(e, t = "add") {
            if ("dismiss" === t) return void (an = !1);
            if ("show" === t) return void (an = sxListLiveSelections().length >= 2);
            if ("clear" === t) en.clear();
            else if ("set" === t) en.clear(), (e || []).forEach(e => en.add(e));
            else if ("remove" === t) en.delete(e);
            else if ("toggle" === t) en.has(e) ? en.delete(e) : en.add(e);
            else en.add(e);
            an = sxListLiveSelections().length >= 2;
        }
        function sxScoringProfileIds() {
            const e = sxListLiveSelections();
            return an && e.length >= 2 ? e : Mt && vt[Mt] ? [ Mt ] : [];
        }
        function sxClearSelectionColor(e) {
            sxSel(null, "clear"), vt[e] && sxProfileColor(e);
        }
        function sxAutoSelect(id) {
            if (!vt[id]) return;
            if (!en.size && Mt && vt[Mt] && Mt !== id) {
                sxSel(Mt), sxProfileColor(Mt);
            }
            sxSel(id), sxProfileColor(id), sxRenderProfileTabs();
        }
        // Load landing (load-target stage, 2026-10-27): a load ends
        // on the loaded profile's own tab - ACTIVATED and SELECTED -
        // and never opens the comparison overlay or a group map.
        // The chosen set keeps every loaded profile slated for
        // multi-select; the comparison (crossmatch) appears only
        // when the bowtie or circle-dot button is fired, so after
        // selecting, the overlay flag is dismissed while the set is
        // left untouched. Quiet bundle creates keep their own landing
        // (their caller activates the last profile), and a share-link
        // boot keeps its pinned behavior (F7: no auto-select, no join).
        function sxLoadLanding(id, opts = {}) {
            if (!id || !vt[id] || opts.quiet || "share-link" === opts.source) return;
            opts.autoSelect || sxSel(id), sxSel(null, "dismiss"), sxActivateProfile(id), sxRenderProfileTabs();
        }
        function sxComparisonActive() {
            return an && sxScoringProfileIds().length >= 2;
        }
        function sxFirstWordText(e) {
            return String(e || "").trim().split(/\s+/)[0] || "";
        }
        e.byId("stayWithUnsavedChanges") && e.byId("stayWithUnsavedChanges").addEventListener("click", () => sxCloseModalDialog(Gi)), e.byId("saveUnsavedToMemory") && e.byId("saveUnsavedToMemory").addEventListener("click", () => {
            const e = sxDirtyProfileId(), t = window.SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x"), n = window.Sexcapades2xRememberProfiles;
            t && !t.checked && (t.checked = !0, t.dispatchEvent(new Event("change"))), n && "function" == typeof n.saveNow && n.saveNow() ? (e && sxClearProfileDirty(e),
            sxCloseModalDialog(Gi), sxShowStatusToast("Changes saved to profile memory.")) : sxShowStatusToast("Could not save these changes to profile memory.", {
                tone: "error",
                persistent: !0
            });
        }), e.byId("exportUnsavedNow") && e.byId("exportUnsavedNow").addEventListener("click", () => {
            const e = sxDirtyProfileId();
            e && (sxCloseModalDialog(Gi), sxOpenProfileExport(e));
        }), e.byId("reloadWithUnsavedChanges") && e.byId("reloadWithUnsavedChanges").addEventListener("click", () => {
            qt = !0, document.documentElement.classList.remove("has-unsaved-changes"), document.body.classList.remove("has-unsaved-changes"),
            location.reload();
        }), Gi.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseModalDialog(Gi);
        }), window.__sxOnKey( e => {
            sxDirtyProfileId() && !Gi.open && ("F5" === e.key || (e.ctrlKey || e.metaKey) && "r" === e.key.toLowerCase()) && (e.preventDefault(),
            e.stopImmediatePropagation(), sxPromptUnsavedReload());
        }, !0), document.addEventListener("touchstart", e => {
            if (!sxDirtyProfileId() || 1 !== e.touches.length || document.scrollingElement && document.scrollingElement.scrollTop > 1) return;
            if (__sxClosestAction(e.target, "interactiveAncestor")) return;
            const t = e.touches[0];
            t.clientY > 96 || (Ht = {
                x: t.clientX,
                y: t.clientY
            });
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchmove", e => {
            if (!Ht || 1 !== e.touches.length) return;
            const t = e.touches[0], n = t.clientX - Ht.x, i = t.clientY - Ht.y;
            i > 18 && i > 1.35 * Math.abs(n) && e.preventDefault(), i >= 72 && i > 1.35 * Math.abs(n) && (Ht = null,
            sxPromptUnsavedReload());
        }, {
            capture: !0,
            passive: !1
        }), document.addEventListener("touchend", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchcancel", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        });
        /* Center-node geometry (ea, eaBase, MAP_CENTER_X, MAP_CENTER_Y, BRANCH_TOGGLE_DROP)
           and font/icon depth-ladder helpers (mapFontScale, centerRingScale, sxIconRadius,
           sxIconDiameter, sxFontMaster, sxFontSize, sxFontFactor, sxFontCoef, sxControlScale,
           sxStrokeWidth, midlineStrokeWidth, refreshCenterRing, gen1SpokeBaseRadius) live in
           02e-font-ladder.js and are hoisted/shared in this scope. */
        function sxTallyRatingCoverage(e) {
            const t = sxAllTopicIds(), n = t.length, i = t.filter(t => {
                const n = (e || {})[t];
                return "number" == typeof n || Boolean(n && "object" == typeof n && (Object.prototype.hasOwnProperty.call(n, "give") || Object.prototype.hasOwnProperty.call(n, "receive") || Object.prototype.hasOwnProperty.call(n, "line") || Object.keys(n).some(k => k !== "intensity" && Number.isFinite(Number(n[k])))));
            }).length;
            return {
                rated: i,
                total: n,
                percent: n ? Math.round(i / n * 100) : 0
            };
        }
        function sxTallyComparedRatings(e = sxScoringProfileIds()) {
            const t = Mt && ft[Mt] && "group" === ft[Mt].kind ? ft[Mt] : null, n = t && e.length < 2 ? t.sourceProfiles || [] : e.filter(e => e === Et || vt[e]).map(e => ({
                ratings: e === Et ? At : vt[e]
            }));
            if (!n.length) return {
                rated: 0,
                total: sxAllTopicIds().length,
                percent: 0
            };
            const i = n.map(e => sxTallyRatingCoverage(e.ratings || {})), a = i.reduce((e, t) => e + t.rated, 0), r = i.reduce((e, t) => e + t.total, 0);
            return {
                rated: a,
                total: r,
                percent: r ? Math.round(a / r * 100) : 0
            };
        }
        function sxCroppedPhotoMarkup(e, t, n = "") {
            const i = Math.max(1, Number(e.width) || 1), a = Math.max(1, Number(e.height) || 1), r = Math.max(1, Number(e.cropZoom) || 1), o = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), s = Math.max(t.w / i, t.h / a) * r, l = i * s, c = a * s, d = Number(e.cropX), u = Number(e.cropY), p = sxClampUnit(Number.isFinite(d) ? d : .5), h = sxClampUnit(Number.isFinite(u) ? u : .5), g = t.w / 2 - p * l, m = t.h / 2 - h * c;
            return `<svg${n ? ` class="${n}"` : ""} x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}" overflow="hidden"><image href="${e.data}" x="${g.toFixed(4)}" y="${m.toFixed(4)}" width="${l.toFixed(4)}" height="${c.toFixed(4)}" preserveAspectRatio="none" transform="rotate(${o.toFixed(2)} ${(t.w / 2).toFixed(2)} ${(t.h / 2).toFixed(2)})"/></svg>`;
        }
        function sxGlanceArcText(e, t) {
            const n = Math.max(0, Math.min(100, Number(e) || 0)), i = 620 - t;
            if (n <= 0) return "";
            if (n >= 100) return `M 900 ${i} A ${t} ${t} 0 1 1 900 ${620 + t} A ${t} ${t} 0 1 1 900 ${i}`;
            const a = -Math.PI / 2 + 2 * Math.PI * n / 100, r = 900 + t * Math.cos(a), o = 620 + t * Math.sin(a);
            return `M 900 ${i} A ${t} ${t} 0 ${n > 50 ? 1 : 0} 1 ${r.toFixed(3)} ${o.toFixed(3)}`;
        }
        var pc = [];
        function sxGlanceRingsMarkup() {
            const e = (pc && Array.isArray(pc) && 3 === pc.length) ? pc : [ {
                label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                count: 0,
                percent: 0,
                color: "var(--green)"
            }, {
                label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                count: 0,
                percent: 0,
                color: "var(--curious)"
            }, {
                label: "Not topics", // FQ2-BAKEIN: "No" -> "Not topics"
                count: 0,
                percent: 0,
                color: "var(--red)"
            } ], t = ea.glanceRadii, n = [ "Green", "Yellow", "Red" ], i = [ "green", "yellow", "red" ];
            return `<g class="center-glance-rings">${e.map((e, a) => `<g class="center-glance-ring"><circle class="center-glance-ring-track is-${i[a]}" cx="900" cy="620" r="${t[a]}"/><path class="center-glance-ring-value is-${i[a]}" id="centerGlanceRing${n[a]}" data-ring-radius="${t[a]}" d="${sxGlanceArcText(e.percent, t[a])}" style="opacity:${e.percent ? 1 : 0}"/><circle class="center-glance-ring-hit" data-center-glance-index="${a}" cx="900" cy="620" r="${t[a]}" tabindex="0" role="button" aria-label="${sxEscapeHtmlText(e.label)}, ${e.percent} percent, ${e.count} ${1 === e.count ? "topic" : "topics"}. Open rating details."/></g>`).join("")}</g>`;
        }

        function syncGlobalVisibilityControl() {
            // LR-G5: the rating state (Sn) used to be mirrored into a
            // hidden button's textContent (former id layoutRatedToggle);
            // it now lives in the visible Topics shown radio group
            // itself - syncing checks the radio whose value is Sn.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.checked = r.value === Sn;
            });
        }
        function setGlobalTopicVisibility(t) {
            Sn = "rated" === t || "unrated" === t ? t : "all", kn = !0, xn = null;
            h.forEach(t => {
                un.set(catId(t.name), Sn);
            }), Object.keys(sxNodeRegistry).forEach(e => un.set(e, Sn)), syncGlobalVisibilityControl(), sxRequestMapPaint({
                animate: !1,
                forceRepaint: !0
            });
        }
        {
            // LR-G5: the Topics shown radios drive global visibility
            // directly. The editor's change handler used to click the
            // hidden button (former id layoutRatedToggle) in a loop
            // until its text matched the chosen radio; the radios' own
            // change events now call the same setGlobalTopicVisibility
            // the button's click handler cycled into.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.addEventListener("change", function() {
                    if (r.checked) setGlobalTopicVisibility(r.value);
                });
            }), syncGlobalVisibilityControl();
        }
        function sxToggleRatedVisibility(e) {
            if (mn.staticMap) return;
            e.target && e.target.closest && __sxClosestAction(e.target, "centerBranchToggle") && ("keydown" === e.type && "Enter" !== e.key && " " !== e.key || (e.preventDefault(),
            e.stopImmediatePropagation(), setGlobalTopicVisibility("rated" === Sn ? "all" : "rated")));
        }
        function sxProfileColor(e) {
            if (!tn[e]) {
                const t = new Set(Object.values(tn));
                tn[e] = nn.find(e => !t.has(e)) || nn[Object.keys(tn).length % nn.length];
            }
            return tn[e];
        }
        function sxTopicPoles(topicId, profileId = sxActiveProfileId()) {
            const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(topicId, profileId) : null;
            const rec = sxDecodeTopicStance(topicId, profileId);
            const keys = (shape && Array.isArray(shape.keys) && shape.keys.length) ? shape.keys : [ "give", "receive" ];
            const labels = (shape && Array.isArray(shape.labels) && shape.labels.length) ? shape.labels : keys;
            const isMultiPole = Boolean(shape && shape.keys && shape.keys.length > 2);
            const isMonopole = Boolean(shape && shape.single);
            const values = {};
            let hasAny = !1;
            keys.forEach(k => {
                if (rec[k + "Known"]) {
                    values[k] = Number(rec[k]) || 0;
                    hasAny = !0;
                } else {
                    values[k] = null;
                }
            });
            return {
                topicId,
                profileId,
                shape,
                keys,
                labels,
                values,
                known: hasAny,
                isMultiPole,
                isMonopole,
                record: rec
            };
        }
        window.sxTopicPoles = sxTopicPoles;

        function sxPlacementIntensity(p) {
            if (!p) return null;
            if (Number.isFinite(Number(p.intensity))) return Number(p.intensity);
            // No stored intensity on the placement: derive it the way
            // the widgets do - the signed strongest holding. (Pairs
            // have no polygon family, so the seeder never persists
            // one for them; the record carries the derivation.)
            const vals = Object.keys(p).filter(k => "intensity" !== k && "line" !== k && "known" !== k && Number.isFinite(Number(p[k]))).map(k => Number(p[k]));
            return vals.length && "function" == typeof sxSignedIntensity ? sxSignedIntensity(vals) : null;
        }
        function sxPlacementMirrors(res) {
            const aI = sxPlacementIntensity(res.advocacy), rI = sxPlacementIntensity(res.receptivity);
            if (null != aI) {
                res.advocacyIntensity = aI;
                res.advocacyIntensityKnown = !0;
            }
            if (null != rI) {
                res.receptivityIntensity = rI;
                res.receptivityIntensityKnown = !0;
            }
            return res;
        }
        // Derive a trilinear-line scalar in [-100, 100] from either an
        // explicit numeric `.line` or a 3-pole affinity object (the format
        // skin JSON archetypes carry inside advocacy/receptivity). Uses the
        // line's inverse semantics (06c1): middle weight = 1 - |V|/100 =>
        // |V| = (100 - aM)/2, signed toward the more-liked end pole.
        function sxDeriveTrilinearLine(topicId, obj, shape) {
            if (!obj || "object" != typeof obj) return null;
            const clamp100 = v => Math.max(-100, Math.min(100, Number(v)));
            if (Object.prototype.hasOwnProperty.call(obj, "line") && Number.isFinite(Number(obj.line))) {
                return Math.round(clamp100(obj.line));
            }
            const s = shape || (typeof sxWidgetConfig === "function" ? sxWidgetConfig(topicId) : null);
            if (!s || s.widget !== "trilinear-line") return null;
            const pk = s.poleKeys && 3 === s.poleKeys.length
                ? s.poleKeys
                : Object.keys(obj).filter(k => "intensity" !== k && "line" !== k && "known" !== k && Number.isFinite(Number(obj[k])));
            if (pk.length < 3) return null;
            const midIdx = "xpo0029" === topicId || "xex0009" === topicId || "xex0025" === topicId ? 2 : 1;
            const aL = Number(obj[pk[0]]), aM = Number(obj[pk[midIdx]]), aR = Number(obj[pk[1 === midIdx ? 2 : 1]]);
            if (!Number.isFinite(aL) || !Number.isFinite(aM) || !Number.isFinite(aR)) return null;
            const mag = (100 - clamp100(aM)) / 2;
            return Math.round(clamp100((aL > aR ? -1 : aR > aL ? 1 : 0) * mag));
        }
        function sxDecodeTopicStance(e, t) {
            const n = (t === Et ? At : vt[t] || {})[e];
            const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(e, t) : null;
            const isSingle = Boolean(shape && shape.single);
            const keys = (shape && Array.isArray(shape.keys) && shape.keys.length) ? shape.keys : [ "give", "receive" ];

            if ("number" == typeof n) {
                const res = {
                    give: n,
                    receive: n,
                    giveKnown: !0,
                    receiveKnown: !0,
                    line: null,
                    lineKnown: !1,
                    poles: null,
                    polesKnown: !1,
                    shape: shape,
                    keys: keys,
                    isMultiPole: !1,
                    isMonopole: isSingle,
                    advocacy: null,
                    advocacyKnown: !1,
                    receptivity: null,
                    receptivityKnown: !1
                };
                if (isSingle && keys.length) {
                    keys.forEach(k => {
                        res[k] = n;
                        res[k + "Known"] = !0;
                    });
                }
                return res;
            }
            if (n && "object" == typeof n) {
                const hasGive = Object.prototype.hasOwnProperty.call(n, "give"), hasReceive = Object.prototype.hasOwnProperty.call(n, "receive");
                const hasLine = Object.prototype.hasOwnProperty.call(n, "line") && Number.isFinite(Number(n.line));
                const hasAdv = Boolean(n.advocacy && "object" == typeof n.advocacy);
                const hasRec = Boolean(n.receptivity && "object" == typeof n.receptivity);
                const res = {
                    give: hasGive && Number(n.give) || 0,
                    receive: hasReceive && Number(n.receive) || 0,
                    giveKnown: hasGive,
                    receiveKnown: hasReceive,
                    line: hasLine ? Number(n.line) : null,
                    lineKnown: hasLine,
                    poles: null,
                    polesKnown: !1,
                    shape: shape,
                    keys: keys,
                    isMultiPole: Boolean(shape && shape.keys && shape.keys.length > 2),
                    isMonopole: isSingle,
                    advocacy: hasAdv ? Object.assign({}, n.advocacy, { known: !0 }) : null,
                    advocacyKnown: hasAdv,
                    receptivity: hasRec ? Object.assign({}, n.receptivity, { known: !0 }) : null,
                    receptivityKnown: hasRec,
                    givePlacement: null,
                    givePlacementKnown: !1,
                    receivePlacement: null,
                    receivePlacementKnown: !1,
                    givePlacementIntensity: null,
                    givePlacementIntensityKnown: !1,
                    receivePlacementIntensity: null,
                    receivePlacementIntensityKnown: !1
                };
                if (hasAdv || hasRec) {
                    if (shape && shape.widget === "trilinear-line") {
                        if (res.advocacy && !Number.isFinite(Number(res.advocacy.line))) {
                            const dl = sxDeriveTrilinearLine(e, n.advocacy, shape);
                            if (null != dl) res.advocacy.line = dl;
                        }
                        if (res.receptivity && !Number.isFinite(Number(res.receptivity.line))) {
                            const rl = sxDeriveTrilinearLine(e, n.receptivity, shape);
                            if (null != rl) res.receptivity.line = rl;
                        }
                        if (!res.lineKnown && res.advocacy && Number.isFinite(Number(res.advocacy.line))) {
                            res.line = Number(res.advocacy.line);
                            res.lineKnown = !0;
                        }
                    }
                    // The line and the poles are the advocacy side, or
                    // the flat fields when that side has not been
                    // written. Receptivity stays on res.receptivity
                    // and is not promoted into the line.
                    const primary = hasAdv ? res.advocacy : null;
                    const p = {};
                    if (primary) {
                        keys.forEach(k => {
                            let hasKey = Object.prototype.hasOwnProperty.call(primary, k);
                            let rawVal = primary[k];
                            if (!hasKey && isSingle) {
                                const pk = ((shape && shape.poleKeys) || []).concat(Object.keys(primary).filter(x => "intensity" !== x && "known" !== x));
                                const foundKey = pk.find(x => Object.prototype.hasOwnProperty.call(primary, x) && Number.isFinite(Number(primary[x])));
                                if (foundKey !== void 0) { hasKey = !0; rawVal = primary[foundKey]; }
                                else if (Number.isFinite(Number(primary.intensity))) { hasKey = !0; rawVal = primary.intensity; }
                            }
                            const val = Number.isFinite(Number(rawVal)) ? Number(rawVal) : 0;
                            res[k] = val;
                            res[k + "Known"] = hasKey;
                            p[k] = val;
                        });
                        if (Number.isFinite(Number(primary.intensity))) {
                            res.intensity = Number(primary.intensity);
                            res.intensityKnown = !0;
                        }
                    } else {
                        keys.forEach(k => {
                            const rawVal = n[k];
                            const hasKey = Object.prototype.hasOwnProperty.call(n, k) && "object" != typeof rawVal && Number.isFinite(Number(rawVal));
                            const val = hasKey ? Number(rawVal) : 0;
                            res[k] = val;
                            res[k + "Known"] = hasKey;
                            p[k] = val;
                        });
                        if ("object" != typeof n.intensity && Number.isFinite(Number(n.intensity))) {
                            res.intensity = Number(n.intensity);
                            res.intensityKnown = !0;
                        }
                    }
                    res.poles = p;
                    res.polesKnown = keys.some(k => res[k + "Known"]);
                    return sxPlacementMirrors(res);
                }
                // Classic placements (2026-11-22): an n-pole rating on the
                // sex skin may carry give/receive PLACEMENT objects --
                // { give: {...poles, intensity}, receive: {...} } -- the
                // mirror of advocacy/receptivity on stance skins. The give
                // placement is primary: flat pole fields, res.poles and the
                // (n+1) intensity mirror from it, exactly as the advocacy
                // branch above does from its primary.
                const hasGivePl = Boolean(n.give && "object" == typeof n.give), hasRecPl = Boolean(n.receive && "object" == typeof n.receive);
                if ((hasGivePl || hasRecPl) && res.isMultiPole) {
                    // Give is the primary placement. A receive-only
                    // record keeps the flat poles and does not wear
                    // the receive values as the line.
                    const primary = hasGivePl ? n.give : null;
                    const p = {};
                    if (primary) {
                        keys.forEach(k => {
                            const val = Number.isFinite(Number(primary[k])) ? Number(primary[k]) : 0;
                            res[k] = val;
                            res[k + "Known"] = Object.prototype.hasOwnProperty.call(primary, k);
                            p[k] = val;
                        });
                        if (Number.isFinite(Number(primary.intensity))) {
                            res.intensity = Number(primary.intensity);
                            res.intensityKnown = !0;
                        }
                    } else {
                        keys.forEach(k => {
                            const rawVal = n[k];
                            const hasKey = Object.prototype.hasOwnProperty.call(n, k) && "object" != typeof rawVal && Number.isFinite(Number(rawVal));
                            const val = hasKey ? Number(rawVal) : 0;
                            res[k] = val;
                            res[k + "Known"] = hasKey;
                            p[k] = val;
                        });
                        if ("object" != typeof n.intensity && Number.isFinite(Number(n.intensity))) {
                            res.intensity = Number(n.intensity);
                            res.intensityKnown = !0;
                        }
                    }
                    res.poles = p;
                    res.polesKnown = keys.some(k => res[k + "Known"]);
                    res.give = 0;
                    res.giveKnown = !1;
                    res.receive = 0;
                    res.receiveKnown = !1;
                    if (hasGivePl) {
                        res.givePlacement = Object.assign({}, n.give);
                        res.givePlacementKnown = !0;
                        const gi = sxPlacementIntensity(n.give);
                        if (null != gi) { res.givePlacementIntensity = gi; res.givePlacementIntensityKnown = !0; }
                    }
                    if (hasRecPl) {
                        res.receivePlacement = Object.assign({}, n.receive);
                        res.receivePlacementKnown = !0;
                        const ri = sxPlacementIntensity(n.receive);
                        if (null != ri) { res.receivePlacementIntensity = ri; res.receivePlacementIntensityKnown = !0; }
                    }
                    // Widget-layer alias: the dual-puck machinery reads
                    // rec.advocacy / rec.receptivity (with a .known flag
                    // on the object) on every skin. On the classic skin
                    // the give placement plays the advocacy role and the
                    // receive placement the receptivity role.
                    if (hasGivePl) {
                        res.advocacy = Object.assign({}, n.give, { known: !0 });
                        res.advocacyKnown = !0;
                        if (res.givePlacementIntensityKnown) { res.advocacyIntensity = res.givePlacementIntensity; res.advocacyIntensityKnown = !0; }
                    }
                    if (hasRecPl) {
                        res.receptivity = Object.assign({}, n.receive, { known: !0 });
                        res.receptivityKnown = !0;
                        if (res.receivePlacementIntensityKnown) { res.receptivityIntensity = res.receivePlacementIntensity; res.receptivityIntensityKnown = !0; }
                    }
                    return res;
                }
                if (!hasGive && !hasReceive && !hasLine) {
                    const poleKeys = Object.keys(n).filter(k => k !== "intensity" && k !== "advocacy" && k !== "receptivity" && Number.isFinite(Number(n[k])));
                    if (poleKeys.length) {
                        const p = {};
                        poleKeys.forEach(k => { p[k] = Number(n[k]); });
                        res.poles = p;
                        res.polesKnown = !0;
                        if (!isSingle) {
                            res.advocacy = Object.assign({}, n);
                            res.advocacyKnown = !0;
                            res.receptivity = null;
                            res.receptivityKnown = !1;
                            if (!window.__SX_ACTIVE_SKIN || window.__SX_ACTIVE_SKIN === "sexcapades") {
                                res.givePlacement = Object.assign({}, n);
                                res.givePlacementKnown = !0;
                                const gi = sxPlacementIntensity(res.givePlacement);
                                if (null != gi) { res.givePlacementIntensity = gi; res.givePlacementIntensityKnown = !0; }
                                res.advocacy = Object.assign({}, n, { known: !0 });
                                res.advocacyKnown = !0;
                                if (null != gi) { res.advocacyIntensity = gi; res.advocacyIntensityKnown = !0; }
                            }
                        }
                    }
                }
                Object.keys(n).forEach(k => {
                    if (k !== "advocacy" && k !== "receptivity") {
                        res[k] = Number(n[k]) || 0;
                        res[k + "Known"] = !0;
                    }
                });
                return sxPlacementMirrors(res);
            }
            return {
                give: 0,
                receive: 0,
                giveKnown: !1,
                receiveKnown: !1,
                line: null,
                lineKnown: !1,
                poles: null,
                polesKnown: !1,
                shape: shape,
                keys: keys,
                isMultiPole: Boolean(shape && shape.keys && shape.keys.length > 2),
                isMonopole: isSingle,
                advocacy: null,
                advocacyKnown: !1,
                receptivity: null,
                receptivityKnown: !1
            };
        }
        function sxRatingRecord(e, t) {
            const U = (give, receive, gk, rk, gd, rd, gr, rr, total) => ({
                give: give,
                receive: receive,
                giveKnown: gk,
                receiveKnown: rk,
                giveDerived: gd,
                receiveDerived: rd,
                giveRatedChildren: gr,
                receiveRatedChildren: rr,
                childCount: total
            });
            if (isCatId(e)) {
                const c = h.find(c => catId(c.name) === e);
                if (!c) return U(0, 0, !1, !1, !1, !1, 0, 0, 0);
                const d = sxDecodeTopicStance(e, t), g = cuCat(c, t, "give"), r = cuCat(c, t, "receive"), gv = d.giveKnown ? d.give : g.value, rv = d.receiveKnown ? d.receive : r.value;
                const rec = U(null === gv ? 0 : gv, null === rv ? 0 : rv, null !== gv, null !== rv, !d.giveKnown && null !== g.value, !d.receiveKnown && null !== r.value, d.giveKnown ? 0 : g.rated, d.receiveKnown ? 0 : r.rated, g.total);
                const advRoll = cuCat(c, t, "advocacyIntensity"), recRoll = cuCat(c, t, "receptivityIntensity");
                const advVal = d.advocacyIntensityKnown ? d.advocacyIntensity : advRoll.value;
                const recVal = d.receptivityIntensityKnown ? d.receptivityIntensity : recRoll.value;
                if (null !== advVal) { rec.advocacyIntensity = advVal; rec.advocacyIntensityKnown = !0; }
                if (null !== recVal) { rec.receptivityIntensity = recVal; rec.receptivityIntensityKnown = !0; }
                return Object.assign(rec, d);
            }
            const z = sxFindSubcategoryNode(e);
            if (z) {
                const d = sxDecodeTopicStance(e, t), ids = z.topics.map(sxResolveTopicId).concat(sxListImportedChildIds(e, t)), ch = ids.map(id => sxRatingRecord(id, t)), one = dir => {
                    if (d[dir + "Known"]) return {
                        value: d[dir],
                        rated: 0,
                        direct: !0
                    };
                    const k = ch.filter(c => c[dir + "Known"]);
                    return k.length ? {
                        value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                        rated: k.length
                    } : {
                        value: null,
                        rated: 0
                    };
                }, g = one("give"), r = one("receive");
                const subRec = U(null === g.value ? 0 : g.value, null === r.value ? 0 : r.value, null !== g.value, null !== r.value, !g.direct && null !== g.value, !r.direct && null !== r.value, g.rated, r.rated, ids.length);
                const advSub = smSub(z, t, "advocacyIntensity", e), recSub = smSub(z, t, "receptivityIntensity", e);
                const advVal = d.advocacyIntensityKnown ? d.advocacyIntensity : advSub;
                const recVal = d.receptivityIntensityKnown ? d.receptivityIntensity : recSub;
                if (null !== advVal) { subRec.advocacyIntensity = advVal; subRec.advocacyIntensityKnown = !0; }
                if (null !== recVal) { subRec.receptivityIntensity = recVal; subRec.receptivityIntensityKnown = !0; }
                return Object.assign(subRec, d);
            }
            const n = sxDecodeTopicStance(e, t);
            if (!sxNodeById(e)) return Object.assign(U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0), n);
            const ids = sxListImportedChildIds(e, t);
            if (!ids.length) return Object.assign(U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0), n);
            const ch = ids.map(id => sxRatingRecord(id, t)), one = dir => {
                if (n[dir + "Known"]) return {
                    value: n[dir],
                    rated: 0,
                    derived: !1,
                    known: !0
                };
                const k = ch.filter(c => c[dir + "Known"]);
                return k.length ? {
                    value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                    rated: k.length,
                    derived: !0,
                    known: !0
                } : {
                    value: 0,
                    rated: 0,
                    derived: !1,
                    known: !1
                };
            }, g = one("give"), r = one("receive");
            return Object.assign(U(g.value, r.value, g.known, r.known, g.derived, r.derived, g.rated, r.rated, ids.length), n);
        }
        function sxAverageKnownPoles(e, t) {
            const n = sxDecodeTopicStance(e, t), i = [];
            const keys = (n.keys && Array.isArray(n.keys)) ? n.keys : [ "give", "receive" ];
            keys.forEach(k => {
                if (n[k + "Known"]) i.push(n[k]);
            });
            return i.length ? i.reduce((e, t) => e + t, 0) / i.length : null;
        }
        function sxClampWeightedAverage(e, t, n, w) {
            let i = 0, a = 0;
            e.forEach((item, idx) => {
                const r = n(item);
                if (null != r) {
                    const weight = (Array.isArray(w) && Number.isFinite(w[idx])) ? w[idx] : 1;
                    i += r * weight;
                    a += weight;
                }
            });
            return a ? Math.max(-100, Math.min(100, i / a)) : null;
        }
        function sxReadKnownRatingField(e, t, n) {
            const i = sxDecodeTopicStance(e, t);
            return i[n + "Known"] ? i[n] : null;
        }
        function sxListBranchTopicIds(e, t) {
            return e.topics.map(e => sxResolveTopicId(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id));
        }
        function sxAverageBranchTopics(e, t) {
            return sxClampWeightedAverage(sxListBranchTopicIds(e, t), t, e => sxAverageKnownPoles(e, t));
        }
        function smSub(e, t, n, i) {
            // Interim unification: direct rating per flank wins
            if (i) {
                const direct = sxReadKnownRatingField(i, t, n);
                if (null != direct) return direct;
                const roll = sxNodeRollup(i, t, n, 2, 3);
                if (null !== roll.value) return roll.value;
            }
            // Child topics sit at depth 3; depth weight = 1.0
            const a = (e?.topics || []).map(sxResolveTopicId).concat(i ? sxListImportedChildIds(i, t) : []);
            return sxClampWeightedAverage(a, t, e => sxReadKnownRatingField(e, t, n));
        }
        function sgSub(e) {
            for (const t of h) for (const n of t.subcategories || []) if (sxResolveSubcategoryId(t.name, n.name) === e) return n;
            return null;
        }
        function cuCat(e, t, n) {
            // Interim unification: direct rating per flank wins over roll-up
            const direct = sxReadKnownRatingField(catId(e.name), t, n);
            if (null != direct) {
                const totalChildren = (e.subcategories || []).length + (e.parentTopics || []).length;
                return {
                    value: direct,
                    rated: 1,
                    total: totalChildren || 1
                };
            }
            const roll = sxNodeRollup(catId(e.name), t, n, 1, 3);
            if (null !== roll.value || roll.total > 0) {
                return {
                    value: roll.value,
                    rated: roll.rated,
                    total: roll.total
                };
            }
            const s = e.subcategories || [], u = [], weights = [];
            if (!s.length) {
                sxListBranchTopicIds(e, t).forEach(x => {
                    u.push(sxReadKnownRatingField(x, t, n));
                    weights.push(1); // depth 3/leaf topics have weight 1
                });
            } else {
                // Parent topics hanging directly off category: depth 2 (weight 2/3)
                (e.parentTopics || []).forEach(l => {
                    u.push(sxReadKnownRatingField(sxResolveTopicId(l), t, n));
                    weights.push(2 / 3);
                });
                // Subcategories: depth 2 (weight 2/3)
                s.forEach(g => {
                    u.push(smSub(g, t, n, sxResolveSubcategoryId(e.name, g.name)));
                    weights.push(2 / 3);
                });
                const d = new Set(s.map(g => sxResolveSubcategoryId(e.name, g.name)));
                Object.values(at[t] || {}).filter(x => x.branch === e.name && !d.has(x.parentId)).forEach(x => {
                    u.push(sxReadKnownRatingField(x.id, t, n));
                    weights.push(1);
                });
            }
            let weightedSum = 0, totalWeight = 0, ratedCount = 0;
            u.forEach((val, idx) => {
                if (null != val) {
                    const w = weights[idx] || 1;
                    weightedSum += val * w;
                    totalWeight += w;
                    ratedCount++;
                }
            });
            return {
                value: totalWeight > 0 ? Math.max(-100, Math.min(100, weightedSum / totalWeight)) : null,
                rated: ratedCount,
                total: u.length
            };
        }
        function sxRollupCategoryFlank(e, t, n) {
            return cuCat(e, t, n).value;
        }
