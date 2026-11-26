        function sxBuildOutlineRow(e, t) {
            const n = document.createElement("div"), i = sxWidgetConfig(e.id, t), a = Boolean(e.expandable);
            n.className = "outline-row" + ("Imported" === e.kind ? " is-imported" : ""), n.dataset.outlineId = e.id, 
            e.parentId && (n.dataset.outlineParent = e.parentId);
            const r = document.createElement("div");
            r.className = "outline-topic-meta";
            const o = sxTopicIcon(e.label, e.branch);
            r.insertAdjacentHTML("beforeend", sxPracticeIconMarkup(o));
            const s = r.querySelector(":scope>.glance-tooltip-practice-icon"), l = sxPopularityTooltipText(e);
            s && (s.dataset.popularityTooltip = l, s.tabIndex = 0, s.setAttribute("aria-hidden", "false"), 
            s.setAttribute("role", "img"), s.setAttribute("aria-label", `Popularity details for ${e.label}`));
            const c = document.createElement("div");
            c.className = "outline-topic-copy";
            const d = document.createElement("span");
            if (d.className = "outline-topic-label outline-description-trigger", d.textContent = e.label, 
            d.tabIndex = 0, d.setAttribute("role", "button"), d.setAttribute("aria-label", `${e.label}. ${a ? "Expand or collapse nested topics. " : ""}Press and hold for description.`), 
            d.dataset.outlineDescription = sxPlacardAboutText(e), a && (d.dataset.outlineExpandable = "true", 
            d.setAttribute("aria-expanded", String(Boolean(e.expanded)))), c.append(d), "Imported" === e.kind) {
                const e = document.createElement("small");
                e.className = "outline-imported-note", e.textContent = "added topic", c.append(e);
            }
            r.append(c);
            const u = document.createElement("span");
            u.className = "outline-marks", [ "favorite", "notinterested", "limit" ].forEach(t => {
                const m = sxMarkLabel(t);
                if (!m) return;
                const a = document.createElement("button");
                a.type = "button", a.className = "outline-mark", a.dataset.outlineMark = t, a.textContent = m.symbol,
                a.title = m.tooltip, a.setAttribute("aria-label", `${m.tooltip}: ${e.label}`), a.setAttribute("aria-pressed", "false"),
                u.append(a);
            }), [ "fantasy", "tried" ].forEach(t => {
                const m = sxMarkLabel(t);
                if (!m) return;
                const a = document.createElement("button");
                a.type = "button", a.className = "outline-mark", a.dataset.outlineFlag = t, a.textContent = m.symbol,
                a.title = m.tooltip, a.setAttribute("aria-label", `${m.tooltip}: ${e.label}`), a.setAttribute("aria-pressed", "false"),
                u.append(a);
            });
            const p = document.createElement("button");
            p.type = "button", p.className = "outline-mark", p.dataset.outlineNote = "", p.dataset.hasNote = "false", 
            p.textContent = "📝", p.title = "Add or edit note", p.setAttribute("aria-label", `Add or edit note: ${e.label}`), 
            p.setAttribute("aria-expanded", "false"), u.append(p), r.append(u), n.append(r);
            const h = document.createElement("div");
            h.className = "outline-rating-group";
            if (i.octad || i.heptad || i.hexad || i.pentad || i.tetrad || i.triangle || i.triple) {
                const inline = document.createElement("div");
                inline.className = "outline-inline-widget";
                inline.innerHTML = '<canvas class="outline-inline-canvas" width="148" height="148" aria-label="Topic widget"></canvas><label class="outline-inline-intensity"><span>Intensity</span><input class="outline-inline-slider mark-thumb-disc" type="range" min="-100" max="100" step="1" value="0" aria-label="Advocacy intensity"><output class="outline-inline-out">0</output></label><label class="outline-inline-intensity outline-inline-rec" hidden=""><span>○ Rec</span><input class="outline-inline-slider outline-inline-rec-slider mark-thumb-ring" type="range" min="-100" max="100" step="1" value="0" aria-label="Receptivity intensity"><output class="outline-inline-rec-out">—</output></label><button class="outline-inline-clear" type="button">Clear</button><div class="outline-inline-readout mark-triangle-readout"></div>';
                h.append(inline);
                typeof window.sxOpenHotListWidgetPopup === "function" && window.sxOpenHotListWidgetPopup(e.id, t, inline);
            } else if (i.widget === "trilinear-line") {
                const r = document.createElement("div");
                r.className = "outline-rating outline-rating-trilinear";
                const poleBar = document.createElement("div");
                poleBar.className = "outline-trilinear-poles";
                const triParts = [i.labels[0] || "", i.labels[1] || "", i.labels[2] || ""];
                const poleClasses = ["tri-pole-left", "tri-pole-center", "tri-pole-right"];
                triParts.forEach((p, idx) => {
                    const sp = document.createElement("span");
                    sp.className = `outline-trilinear-pole ${poleClasses[idx]}`;
                    sp.textContent = p;
                    const poleKey = (i.poleKeys && i.poleKeys[idx]) || (i.keys && i.keys[idx]);
                    if (typeof sxSetPoleTip === "function") sxSetPoleTip(sp, e.id, poleKey);
                    if (!sp.getAttribute("data-ui-tooltip") && p) {
                        const fallbackTip = (typeof window.__SX_POLE_LINE_FOR === "function" ? window.__SX_POLE_LINE_FOR(e.id, poleKey) : null) || p;
                        const sep = fallbackTip.indexOf(" — ");
                        const tipName = sep !== -1 ? fallbackTip.slice(0, sep).trim() : p;
                        const tipDef = sep !== -1 ? fallbackTip.slice(sep + 3).trim() : fallbackTip;
                        sp.setAttribute("data-ui-tooltip", fallbackTip);
                        sp.setAttribute("data-tooltip-name", tipName);
                        sp.setAttribute("data-tooltip-definition", tipDef);
                        sp.setAttribute("data-tooltip-tap-first", "");
                        sp.dataset.ratingTooltip = fallbackTip;
                    }
                    sp.tabIndex = 0;
                    poleBar.appendChild(sp);
                });
                const sliderRow = document.createElement("div");
                sliderRow.className = "outline-trilinear-slider-row";
                const sliderAria = `${e.label}: -100 ${triParts[0]}, 0 ${triParts[1]}, +100 ${triParts[2]}`;
                sliderRow.setAttribute("data-ui-tooltip", sliderAria);
                sliderRow.setAttribute("data-tooltip-name", e.label);
                sliderRow.setAttribute("data-tooltip-definition", `Spectrum: ${triParts[0]} (-100) … ${triParts[1]} (0) … ${triParts[2]} (+100)`);
                sliderRow.setAttribute("data-tooltip-tap-first", "");
                const c = document.createElement("input");
                c.type = "range", c.min = "-100", c.max = "100", c.step = "1", c.value = "0", c.dataset.outlineDirection = "line",
                c.setAttribute("aria-label", sliderAria);
                const d = document.createElement("output");
                const dualLine = typeof sxDualPlacements === "function" && sxDualPlacements(e.id);
                if (dualLine) {
                    c.dataset.placement = "advocacy";
                    c.setAttribute("aria-label", `${e.label} advocacy: -100 ${triParts[0]}, 0 ${triParts[1]}, +100 ${triParts[2]}`);
                    const advLab = document.createElement("span");
                    advLab.className = "outline-trilinear-side";
                    advLab.textContent = "Adv";
                    sliderRow.append(advLab, c, d);
                    const recRow = document.createElement("div");
                    recRow.className = "outline-trilinear-slider-row";
                    const recLab = document.createElement("span");
                    recLab.className = "outline-trilinear-side";
                    recLab.textContent = "Rec";
                    const recIn = document.createElement("input");
                    recIn.type = "range";
                    recIn.min = "-100";
                    recIn.max = "100";
                    recIn.step = "1";
                    recIn.value = "0";
                    recIn.className = "is-rec-line";
                    recIn.dataset.outlineDirection = "line";
                    recIn.dataset.placement = "receptivity";
                    recIn.setAttribute("aria-label", `${e.label} receptivity: -100 ${triParts[0]}, 0 ${triParts[1]}, +100 ${triParts[2]}`);
                    const recOut = document.createElement("output");
                    recRow.append(recLab, recIn, recOut);
                    r.append(poleBar, sliderRow, recRow);
                } else {
                    sliderRow.append(c, d);
                    r.append(poleBar, sliderRow);
                }
                h.append(r);
            } else if (!i.single && i.keys && i.keys.length === 2) {
                // Pair topic: the placard's cross slider, in the row
                // (owner ruling, 2026-11-25 — one widget in three
                // places: placard, hypermap, hotlist). The two fader
                // range inputs go away; the row mounts the same cross
                // slider component the placard mounts (compact), so
                // the receptivity ring and the appetite arm are here
                // in the row — the ring can finally be set from the
                // Hot List / outline row, not only from the popup.
                // The row's fader drag (03d) gates on
                // [data-outline-direction], which the cross slider
                // has none of, and the row's click/dblclick guards
                // ignore .outline-rating-group, so the slider's own
                // gestures are undisturbed.
                const host = document.createElement("div");
                host.className = "outline-cross-host";
                h.append(host);
                const stance = sxDualPlacements(e.id);
                const fl = stance ? ["advocacy", "receptivity"] : ["give", "receive"];
                const keys = i.keys;
                const getFlank = (dir) => sxCrossFlankState(sxDecodeTopicStance(e.id, Go), dir, keys);
                let pair = null;
                const renderPair = () => { if (pair) { pair.first.render(); pair.second.render(); } };
                const writeFlank = (dir, value) => {
                    sxCrossWriteFlank(e.id, dir, value, Go, keys);
                    renderPair();
                };
                const finishGesture = () => { sxSyncOutlineRow(n); };
                pair = {
                    first: sxCreateCrossSlider({ dir: fl[0], compact: true, get: () => getFlank(fl[0]), onChange: v => writeFlank(fl[0], v), onRelease: () => finishGesture() }),
                    second: sxCreateCrossSlider({ dir: fl[1], compact: true, get: () => getFlank(fl[1]), onChange: v => writeFlank(fl[1], v), onRelease: () => finishGesture() })
                };
                host.appendChild(pair.first.root);
                host.appendChild(pair.second.root);
                n.__sxCrossPair = pair;
            } else (i.single ? [ "give" ] : i.keys).forEach((n, a) => {
                const r = document.createElement("label"), o = !i.single && "give" === i.labels[0] && "receive" === i.labels[1];
                r.className = "outline-rating";
                const s = document.createElement("span");
                s.className = "outline-rating-label", s.textContent = o ? n : i.labels[a] || n;
                const l = o ? function(e, t, n = sxActiveProfileId()) {
                    const i = sxWidgetConfig(e, n);
                    if (i.single || "give" !== i.labels[0] || "receive" !== i.labels[1]) return "";
                    const a = sxGiveReceiveNounText(e, t), r = sxNodeLabelText(e, n), o = e => String(e || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
                    return a && o(a) !== o(r) ? `${"receive" === t ? "Receive" : "Give"}: ${a}` : "";
                }(e.id, n, t) : "";
                // Hovertip for EVERY pole, not just give/receive pairs
                // (2026-11-19): the placard's pole line is the first
                // source (skin topics carry a "Label — text" line per
                // pole); fall back to the pole's full label so the tip
                // always names the whole pole. No native title here —
                // the shared popup is this row's one tooltip, and a
                // title would arrive late and overlap it.
                const tip = l || (typeof window.__SX_POLE_LINE_FOR === "function" ? window.__SX_POLE_LINE_FOR(e.id, n) : null) || (o ? "" : s.textContent);
                if (tip) {
                    r.dataset.ratingTooltip = tip;
                    r.setAttribute("data-tooltip-tap-first", "");
                    r.setAttribute("data-ui-tooltip", tip);
                    const sep = tip.indexOf(" — ");
                    if (sep !== -1) {
                        r.setAttribute("data-tooltip-name", tip.slice(0, sep).trim());
                        r.setAttribute("data-tooltip-definition", tip.slice(sep + 3).trim());
                    } else {
                        r.setAttribute("data-tooltip-name", s.textContent);
                        r.setAttribute("data-tooltip-definition", tip);
                    }
                }
                const c = document.createElement("input");
                c.type = "range", c.min = "-100", c.max = "100", c.step = "1", c.value = "0", c.dataset.outlineDirection = n, 
                c.setAttribute("aria-label", `${e.label}, ${s.textContent}${l ? `: ${l.replace(/^[^:]+:\s*/, "")}` : ""}`);
                const d = document.createElement("output");
                r.append(s, c, d), h.append(r);
            });
            n.append(h);
            const g = document.createElement("label");
            g.className = "outline-note-editor", g.hidden = !0;
            const m = document.createElement("span");
            m.textContent = `Note about ${e.label}`;
            const f = document.createElement("textarea");
            return f.rows = 2, f.maxLength = 800, f.dataset.outlineNoteInput = "", f.placeholder = "Add context, preferences, or anything you want to remember…", 
            g.append(m, f), n.append(g), sxSyncOutlineRow(n), n;
        }
