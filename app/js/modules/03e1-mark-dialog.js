        var sxCrossPlacard = null;
        // The current topic's pole keys (shape.keys): the placement
        // flank read/write needs them to find the spectrum position
        // inside a per-pole placement object. Set on every sync; null
        // when the shape carries none (classic pair topics read/write
        // flat give/receive numbers, and the object branch is skipped).
        var sxCrossPlacardKeys = null;
        function sxCrossPlacardState(dir) {
            if (!Qr) return null;
            var rec = ca(Qr, Vi());
            return sxCrossFlankState(rec, dir, sxCrossPlacardKeys);
        }
        function sxCrossPlacardWrite(dir, value) {
            if (!Qr) return;
            sxCrossWriteFlank(Qr, dir, value, Vi(), sxCrossPlacardKeys);
        }
        function sxCrossPlacardRelease() {
            if (Qr) { sxSyncMarkRatings(Qr); Mr(); }
        }
        // The flank keys for the current topic: give/receive on the
        // classic skin, advocacy/receptivity on stance skins (the
        // cross slider reads/writes the real keys, so a stance pair
        // topic shows live advocacy/receptivity pucks, not ghosts).
        function sxCrossPlacardFlanks() {
            return sxDualPlacements(Qr) ? ["advocacy", "receptivity"] : ["give", "receive"];
        }
        function sxBindCrossSliderPlacard() {
            var clearBtn = e.byId("markSwitchboxClear");
            if (clearBtn && !clearBtn.dataset.sxCrossBound) {
                clearBtn.dataset.sxCrossBound = "1";
                clearBtn.addEventListener("click", () => {
                    if (!Qr) return;
                    var fl = sxCrossPlacardFlanks();
                    if (sxDualPlacements(Qr) && typeof sxClearAdvocacyReceptivity === "function") {
                        // Placement flanks clear through the placement
                        // clearer (it drops the object and its flat
                        // mirror keys); the flat Fo() path would leave
                        // the placement object behind.
                        fl.forEach(k => sxClearAdvocacyReceptivity(Qr, k, Vi()));
                    } else {
                        fl.forEach(k => { Fo(Qr, k, !1); Fo(Qr, k + "Intensity", !1); });
                    }
                    sxSyncMarkRatings(Qr);
                    Mr();
                });
            }
            var host = e.byId("markCrossSliderHost");
            if (!host || host.dataset.bound) return;
            host.dataset.bound = "1";
            var fl = sxCrossPlacardFlanks();
            var first = sxCreateCrossSlider({ dir: fl[0], get: () => sxCrossPlacardState(fl[0]), onChange: v => sxCrossPlacardWrite(fl[0], v), onRelease: () => sxCrossPlacardRelease() });
            var second = sxCreateCrossSlider({ dir: fl[1], get: () => sxCrossPlacardState(fl[1]), onChange: v => sxCrossPlacardWrite(fl[1], v), onRelease: () => sxCrossPlacardRelease() });
            host.appendChild(first.root);
            host.appendChild(second.root);
            sxCrossPlacard = { first: first, second: second };
        }
        function sxSyncCrossSliderPlacard(shape) {
            sxBindCrossSliderPlacard();
            if (!sxCrossPlacard) return;
            sxCrossPlacardKeys = (shape && shape.keys) || null;
            var fl = sxCrossPlacardFlanks();
            sxCrossPlacard.first.setDir(fl[0], () => sxCrossPlacardState(fl[0]), v => sxCrossPlacardWrite(fl[0], v));
            sxCrossPlacard.second.setDir(fl[1], () => sxCrossPlacardState(fl[1]), v => sxCrossPlacardWrite(fl[1], v));
            var firstName = (shape && shape.labels && shape.labels[0]) || (fl[0].charAt(0).toUpperCase() + fl[0].slice(1));
            var secondName = (shape && shape.labels && shape.labels[1]) || (fl[1].charAt(0).toUpperCase() + fl[1].slice(1));
            sxCrossPlacard.first.setLabel(firstName);
            sxCrossPlacard.second.setLabel(secondName);
            if (typeof sxSetPoleTip === "function" && Qr) {
                sxSetPoleTip(sxCrossPlacard.first.labelEl, Qr, fl[0]);
                sxSetPoleTip(sxCrossPlacard.second.labelEl, Qr, fl[1]);
            }
            sxCrossPlacard.first.render();
            sxCrossPlacard.second.render();
        }
        /* Placement intensities for the slider family + switchbox (2026-11-23):
           the canvas widgets carry disc/ring intensity sliders; the linear
           family, the line, and the switchbox stored the same per-placement
           intensity with no slider to write it. These two boxes mirror the
           canvas pattern -- disc thumb writes advocacy intensity, ring thumb
           writes receptivity intensity, poles untouched. */
        function sxWritePlacementIntensity(mode, v) {
            if (!Qr) return;
            try {
                const o = Io(Vi());
                const raw = (o && o[Qr] && typeof o[Qr] === "object") ? o[Qr] : {};
                const placement = (raw[mode] && typeof raw[mode] === "object") ? raw[mode] : {};
                const values = {};
                Object.keys(placement).forEach(k => { if (k !== "intensity") values[k] = placement[k]; });
                if (typeof sxPersistAdvocacyReceptivity === "function") sxPersistAdvocacyReceptivity(Qr, mode, values, v, Vi());
                else if (typeof sxPersistIntensity === "function") sxPersistIntensity(Qr, v, Vi());
            } catch (err) {}
        }
        function sxSyncLinearIntensities(id, rec, shape) {
            const linBox = e.byId("markLinearIntensityBox"), swBox = e.byId("markSwitchboxIntensityBox");
            if (!linBox && !swBox) return;
            // Cross slider carries appetite per flank via puck vertical travel;
            // keep both vertical intensity boxes hidden whenever it is active.
            const switchboxWrap = e.byId("markSwitchboxWrap");
            const crossActive = Boolean(switchboxWrap && !switchboxWrap.hidden && e.byId("markCrossSliderHost"));
            if (crossActive) {
                if (linBox) linBox.hidden = true;
                if (swBox) swBox.hidden = true;
                return;
            }
            const w = (shape && shape.widget) || "";
            const inLinear = w === "linear-sliders" || w === "trilinear-sliders" || w === "quad-sliders" || w === "monopole-slider" || w === "trilinear-line" || Boolean(shape && shape.single);
            const inSwitch = w === "xy-switchbox";
            let dual = false;
            try { dual = typeof sxDualPlacements === "function" && sxDualPlacements(id); } catch (err) { dual = false; }
            // Flat-line records (scalar "line", no placements) keep today's
            // behavior; the box serves dual-placement records only.
            if (w === "trilinear-line" && !(rec && (rec.advocacy || rec.receptivity))) dual = false;
            if (linBox) linBox.hidden = !(inLinear && dual);
            if (swBox) swBox.hidden = !(inSwitch && dual);
            if ((!inLinear && !inSwitch) || !dual) return;
            const seed = (p) => {
                if (!p) return 0;
                if (Number.isFinite(Number(p.intensity))) return Math.round(Number(p.intensity));
                let best = 0;
                Object.keys(p).forEach(k => {
                    if (k === "intensity" || k === "known") return;
                    const v = Number(p[k]);
                    if (Number.isFinite(v) && Math.abs(v) > Math.abs(best)) best = v;
                });
                return Math.round(best);
            };
            const bind = (input, out, mode, p) => {
                if (!input) return;
                const val = seed(p);
                if (typeof sxWidenIntensitySlider === "function") { try { sxWidenIntensitySlider(input, val); } catch (err) {} }
                const lo = Number(input.min || -100), hi = Number(input.max || 100);
                input.value = String(Math.max(lo, Math.min(hi, val)));
                if (out) out.textContent = String(val);
                if (!input.dataset.sxBound) {
                    input.dataset.sxBound = "1";
                    input.addEventListener("input", () => {
                        const v = Math.max(-400, Math.min(400, Math.round(Number(input.value) || 0)));
                        if (out) out.textContent = String(v);
                        sxWritePlacementIntensity(mode, v);
                    });
                }
            };
            const base = inLinear ? "markLinear" : "markSwitchbox";
            bind(e.byId(base + "Intensity"), e.byId(base + "IntensityOut"), "advocacy", rec && rec.advocacy);
            bind(e.byId(base + "RecIntensity"), e.byId(base + "RecIntensityOut"), "receptivity", rec && rec.receptivity);
        }
        function sxBindMarkRatings() {
            sxBindTriangleWidget();
            sxBindTetradWidget();
            sxBindCompassWidget();
            sxBindPentadWidget();
            sxBindHexadWidget();
            sxBindHeptadWidget();
            sxBindOctadWidget();
            sxBindCrossSliderPlacard();
            const give = e.byId("markGive"), recv = e.byId("markReceive"), giveOut = e.byId("markGiveOut"), recvOut = e.byId("markReceiveOut");
            const role3 = e.byId("markRole3"), role3Out = e.byId("markRole3Out");
            const role4 = e.byId("markRole4"), role4Out = e.byId("markRole4Out");
            const role5 = e.byId("markRole5"), role5Out = e.byId("markRole5Out");
            const role6 = e.byId("markRole6"), role6Out = e.byId("markRole6Out");
            const role7 = e.byId("markRole7"), role7Out = e.byId("markRole7Out");
            const role8 = e.byId("markRole8"), role8Out = e.byId("markRole8Out");
            if (!give || give.dataset.bound) return;
            give.dataset.bound = "1";
            const show = (input, out, known) => { out && (out.textContent = known ? String(Math.round(Number(input.value))) : "Unrated"); };
            const getKey = (idx, fallback) => {
                if (!Qr) return fallback;
                const shape = Ge(Qr);
                return (shape.keys && shape.keys[idx]) || fallback;
            };
            give.addEventListener("input", () => show(give, giveOut, !0));
            give.addEventListener("change", () => {
                if (Qr) {
                    const k = getKey(0, "give");
                    To(Qr, k, Number(give.value), !0);
                    sxSyncMarkRatings(Qr);
                }
            });
            e.byId("markGiveClear") && e.byId("markGiveClear").addEventListener("click", () => {
                if (Qr) {
                    const k = getKey(0, "give");
                    Fo(Qr, k, !0);
                    sxSyncMarkRatings(Qr);
                }
            });
            if (recv) {
                recv.addEventListener("input", () => show(recv, recvOut, !0));
                recv.addEventListener("change", () => {
                    if (Qr) {
                        const k = getKey(1, "receive");
                        To(Qr, k, Number(recv.value), !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
                e.byId("markReceiveClear") && e.byId("markReceiveClear").addEventListener("click", () => {
                    if (Qr) {
                        const k = getKey(1, "receive");
                        Fo(Qr, k, !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
            if (role3) {
                role3.addEventListener("input", () => show(role3, role3Out, !0));
                role3.addEventListener("change", () => {
                    if (Qr) {
                        const k = getKey(2, "role3");
                        To(Qr, k, Number(role3.value), !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
                e.byId("markRole3Clear") && e.byId("markRole3Clear").addEventListener("click", () => {
                    if (Qr) {
                        const k = getKey(2, "role3");
                        Fo(Qr, k, !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
            if (role4) {
                role4.addEventListener("input", () => show(role4, role4Out, !0));
                role4.addEventListener("change", () => {
                    if (Qr) {
                        const k = getKey(3, "role4");
                        To(Qr, k, Number(role4.value), !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
                e.byId("markRole4Clear") && e.byId("markRole4Clear").addEventListener("click", () => {
                    if (Qr) {
                        const k = getKey(3, "role4");
                        Fo(Qr, k, !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
            if (role5) {
                role5.addEventListener("input", () => show(role5, role5Out, !0));
                role5.addEventListener("change", () => {
                    if (Qr) {
                        const k = getKey(4, "role5");
                        To(Qr, k, Number(role5.value), !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
                e.byId("markRole5Clear") && e.byId("markRole5Clear").addEventListener("click", () => {
                    if (Qr) {
                        const k = getKey(4, "role5");
                        Fo(Qr, k, !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
            if (role6) {
                role6.addEventListener("input", () => show(role6, role6Out, !0));
                role6.addEventListener("change", () => {
                    if (Qr) {
                        const k = getKey(5, "role6");
                        To(Qr, k, Number(role6.value), !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
                e.byId("markRole6Clear") && e.byId("markRole6Clear").addEventListener("click", () => {
                    if (Qr) {
                        const k = getKey(5, "role6");
                        Fo(Qr, k, !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
            if (role7) {
                role7.addEventListener("input", () => show(role7, role7Out, !0));
                role7.addEventListener("change", () => {
                    if (Qr) {
                        const k = getKey(6, "role7");
                        To(Qr, k, Number(role7.value), !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
                e.byId("markRole7Clear") && e.byId("markRole7Clear").addEventListener("click", () => {
                    if (Qr) {
                        const k = getKey(6, "role7");
                        Fo(Qr, k, !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
            if (role8) {
                role8.addEventListener("input", () => show(role8, role8Out, !0));
                role8.addEventListener("change", () => {
                    if (Qr) {
                        const k = getKey(7, "role8");
                        To(Qr, k, Number(role8.value), !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
                e.byId("markRole8Clear") && e.byId("markRole8Clear").addEventListener("click", () => {
                    if (Qr) {
                        const k = getKey(7, "role8");
                        Fo(Qr, k, !0);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
        }
        function xo(e, t, i, a = {}) {
            if (Rt || !qn[e]) return;
            Qr && Qr !== e && ao();
            const r = qn[e], o = je[r.branch] || {}, s = Qe[Vi()][e];
            const sxTitleBranch = "Category" === r.kind ? sxBranchByName(r.branch) : null;
            const sxTitleDisc = sxTitleBranch ? sxCategoryInterestDisc(sxTitleBranch, Vi()) : "Subcategory" === r.kind ? (sgSub(e) ? sxSubInterestDisc(sgSub(e), Vi(), e) : null) : sxTopicInterestDisc(e, Vi());
            const sxTitleDiscSvg = d => d.left ? `<path d="M 24 2 A 22 22 0 0 0 24 46 Z" fill="${d.left}" style="fill:${d.left}"/><path d="M 24 2 A 22 22 0 0 1 24 46 Z" fill="${d.right}" style="fill:${d.right}"/><line x1="24" y1="2" x2="24" y2="46" stroke="rgba(0,0,0,0.4)" stroke-width="0.75"/>` : `<circle class="icon-disc" cx="24" cy="24" r="22" fill="${d.single}" style="fill:${d.single}"/>`;
            Qr = e, n(Lr, function(e) {
                const t = e.risk ? '<span class="mark-risk" role="img" aria-label="Higher-risk practice requiring specialized knowledge and explicit negotiation">*</span>' : "";
                if ("Category" === e.kind) {
                    const n = ge[e.branch];
                    return n ? `<span>${t}${Hi(e.label)}</span><svg class="mark-title-icon branch-icon${sxTitleDisc ? "" : "noCode" === n.hankyKey ? " no-hanky-code-icon" : ""}" viewBox="0 0 48 48" aria-hidden="true" style="--icon-family:${sxTitleDisc ? sxTitleDisc.ring : n.color};color:${sxTitleDisc ? sxTitleDisc.ring : n.color}"><circle class="icon-ring-outline icon-ring-outline-outer" cx="24" cy="24" r="23.5"/>${sxTitleDisc ? sxTitleDiscSvg(sxTitleDisc) : '<circle class="icon-disc" cx="24" cy="24" r="22"/>'}<circle class="icon-ring-outline icon-ring-outline-inner" cx="24" cy="24" r="20.5"/><g transform="scale(2)">${n.glyph}</g></svg><sup class="mark-menu-title-note">(${Hi(we[e.branch] || "symbol")})</sup>` : `<span>${t}${Hi(e.label)}</span>`;
                }
                const n = "Subcategory" === e.kind, i = n ? Ae(e.label, e.branch) : Oe(e.label, e.branch);
                return `<span>${t}${Hi(e.label)}</span><svg class="mark-title-icon topic-icon${n ? " subcategory-icon" : sxTitleDisc ? "" : "noCode" === i.hankyKey ? " no-hanky-code-icon" : ""}" viewBox="0 0 48 48" aria-hidden="true" style="--icon-family:${sxTitleDisc ? sxTitleDisc.ring : i.color};color:${sxTitleDisc ? sxTitleDisc.ring : i.color}"><circle class="icon-ring-outline icon-ring-outline-outer" cx="24" cy="24" r="23.5"/>${sxTitleDisc ? sxTitleDiscSvg(sxTitleDisc) : '<circle class="icon-disc" cx="24" cy="24" r="22"/>'}<circle class="icon-ring-outline icon-ring-outline-inner" cx="24" cy="24" r="20.5"/><svg viewBox="${i.viewBox || "0 0 24 24"}" width="29.76" height="29.76" x="9.12" y="9.12" overflow="visible">${i.glyph}${i.accent}</svg></svg><sup class="mark-menu-title-note">(${Hi(xe(i.key))})</sup>`;
            }(r)), Tr.textContent = lo(r);
            const l = po(r), c = l ? null : co(r.label), d = l ? null : B(r.label);
            if (Fr.hidden = !l && !c && !Number.isFinite(d), l) {
                const e = "category" === l.kind ? "Topics in this category" : "Child topics";
                Nr.textContent = `${e} range from ${uo(l.min)}% to ${uo(l.max)}% common; average ${uo(l.average)}% across ${l.count} with study data.`, 
                _r.textContent = `Simple average of available child-topic prevalence estimates${l.missing ? `; ${l.missing} without study data skipped` : ""}.`;
            } else if (c) {
                const e = /\bfantasiz/i.test(c.label) ? c.label : `Adults fantasize about this: ${c.label}`;
                Nr.textContent = c.display || `${e} (${uo(c.pct)}%)`, _r.textContent = `Source: ${c.source}${Number.isFinite(d) ? ` · ${Math.round(d).toLocaleString()} FetLife kinksters` : ""}`;
            } else Number.isFinite(d) ? (Nr.textContent = `${Math.round(d).toLocaleString()} FetLife kinksters list this interest.`, 
            _r.textContent = `Source: FetLife · captured ${x.captured || x.fetlife?.captured || "2026-10-08"}`) : (Nr.textContent = "", 
            _r.textContent = "");
            var u;
            Dr.hidden = !0, n(Rr, ""), fo(r, 0), e && 0 === e.indexOf("topic-") && (u = e, fetch("https://sexcapades.io/hosted/api/histogram.php?topic=" + encodeURIComponent(u)).then(function(e) {
                return e.json();
            }).then(function(e) {
                if (Qr === u && e && e.ok) {
                    Dr.hidden = !1, fo(r, e.count);
                    var t = function() {
                        if (!e.markers) return "";
                        var t = [];
                        return [ [ "favorite", "favorite ★" ], [ "limit", "hard limit ×" ], [ "notinterested", "not interested ⊘" ], [ "fantasyonly", "fantasy only" ], [ "alreadytried", "already tried ✓" ] ].forEach(function(n) {
                            var i = e.markers[n[0]];
                            i && i.n > 0 && t.push(Math.round(i.pct) + "% ±" + Math.round(i.ci) + "% " + n[1]);
                        }), t.length ? '<p style="font-size:11px;opacity:0.7;margin:6px 0 0;">' + t.join(" · ") + "</p>" : "";
                    }();
                    if (e.enough_data) {
                        for (var i = e.bins, a = Math.max.apply(null, i.concat([ 1 ])), o = 200 / i.length, s = '<div style="display:flex;flex-direction:column;gap:3px;margin:8px 0;" role="img" aria-label="Community rating distribution, ' + e.count + ' ratings">', l = 0; l < i.length; l++) {
                            var c = Math.round(i[l] / a * 100), d = (l + .5) * o - 100, p = d < -20 ? "#e27786" : d > 20 ? "#63c796" : "#d7bd55";
                            s += '<div style="display:flex;align-items:center;gap:6px;font-size:11px;"><span style="width:70px;flex-shrink:0;opacity:0.7;">' + (e.bin_labels && e.bin_labels[l] ? e.bin_labels[l] : "") + '</span><div style="flex:1;height:14px;background:rgba(128,128,128,0.15);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + c + "%;background:" + p + ';border-radius:3px;" title="' + i[l] + ' ratings"></div></div><span style="width:28px;text-align:right;flex-shrink:0;">' + i[l] + "</span></div>";
                        }
                        s += '</div><p style="font-size:11px;opacity:0.6;margin:4px 0 0;">Based on ' + e.count + " community ratings. Negative=red, neutral=yellow, positive=green.</p>" + t, 
                        n(Rr, s);
                    } else n(Rr, '<p style="font-size:12px;opacity:0.7;margin:6px 0;">' + e.count + " of " + e.min_required + " ratings submitted for histograms</p>" + t);
                }
            }).catch(function (e) { __sxErrLog("histogram-submit", e); }));
            const p = Ir[r.label];
            Br.hidden = !p, p ? Br.href = p : Br.removeAttribute("href"), oo(), function(e) {
                /* Skin communities (vanilla): the topic's own communities
                   from its skin file, grouped by network. A vanilla topic
                   with none hides the whole community block. A topic with
                   no skin entry (Sexcapades) keeps the hardcoded maps. */
                const skinComms = typeof window !== "undefined" && window.__SX_COMMUNITIES_FOR_TOPIC
                    ? window.__SX_COMMUNITIES_FOR_TOPIC(r.id) : null;
                const isVanilla = typeof window !== "undefined" && window.__SX_SKIN_PREFIX && "sex" !== window.__SX_SKIN_PREFIX;
                let t = !1;
                if (skinComms && skinComms.length) {
                    const byNet = {}, order = [];
                    skinComms.forEach(c => {
                        const k = String(c.network || "").toLowerCase().replace(/\s+/g, "");
                        if (!k) return;
                        if (!byNet[k]) { byNet[k] = []; order.push(k); }
                        byNet[k].push(c);
                    });
                    const displayName = { reddit: "Reddit", stackexchange: "Stack Exchange", discord: "Discord", fetlife: "FetLife" };
                    const triggers = [ jr, qr, Hr ];
                    triggers.forEach(a => { a.hidden = !0; });
                    order.slice(0, 3).forEach((k, idx) => {
                        const a = triggers[idx];
                        a.style.removeProperty("display"), a.hidden = !1, a.dataset.network = k,
                        a.dataset.topic = e, a.dataset.skinTopicId = r.id,
                        a.textContent = "guide" === k ? "Read the guide" : "Discuss on " + (displayName[k] || k),
                        a.setAttribute("aria-expanded", "false"), t = !0;
                    });
                    Wr.hidden = !0, Wr.textContent = "";
                } else if (isVanilla) {
                    [ jr, qr, Hr ].forEach(a => { a.hidden = !0; });
                    Wr.hidden = !0, Wr.textContent = "";
                } else {
                    [ {
                        key: "fetlife",
                        trigger: jr
                    }, {
                        key: "reddit",
                        trigger: qr
                    }, {
                        key: "discord",
                        trigger: Hr
                    } ].forEach(n => {
                        const i = ce(e, n.key), a = n.trigger;
                        a.style.removeProperty("display"), a.hidden = !i.length, a.dataset.network = n.key,
                        a.dataset.topic = e, a.removeAttribute("data-skin-topic-id"),
                        a.textContent = "Discuss on " + ("fetlife" === n.key ? "FetLife" : "discord" === n.key ? "Discord" : "Reddit"),
                        a.setAttribute("aria-expanded", "false"), i.length && (t = !0);
                    }), Wr.hidden = t, Wr.textContent = t ? "" : "Reddit, FetLife, Discord: no dedicated community found";
                }
            }(r.label), ro(), n(zr, function() {
                /* Included from, skinned per skin: on a vanilla topic it
                   lists the networks the topic's communities came from
                   (each skin shows its own source labels). Sexcapades
                   keeps the survey/checklist sources. */
                const skinComms = typeof window !== "undefined" && window.__SX_COMMUNITIES_FOR_TOPIC
                    ? window.__SX_COMMUNITIES_FOR_TOPIC(r.id) : null;
                if (skinComms && skinComms.length) {
                    const netHome = { reddit: "https://www.reddit.com/", stackexchange: "https://stackexchange.com/", discord: "https://discord.com/" };
                    const seen = {}, order = [];
                    skinComms.forEach(c => {
                        const k = String(c.network || "").toLowerCase().replace(/\s+/g, "");
                        if (k && !seen[k]) { seen[k] = !0; order.push(k); }
                    });
                    const label = { reddit: "Reddit", stackexchange: "Stack Exchange", discord: "Discord", fetlife: "FetLife" };
                    return order.map(k => `<a href="${netHome[k] || "#"}" target="_blank" rel="noopener noreferrer">${label[k] || k}</a>`).join("");
                }
                return (o.sources || []).map(e => {
                    const t = Be[e];
                    return `<a href="${t.url}" target="_blank" rel="noopener noreferrer">${t.label}</a>`;
                }).join("");
            }()), Vr.hidden = !zr.innerHTML;            const h = tt[Vi()]?.[e] || [], aftercareNote = "Connection & aftercare" === r.branch;
            Zr.maxLength = aftercareNote ? 1600 : 800, Zr.placeholder = aftercareNote ? "Describe your aftercare needs: touch or space, reassurance, water or food, cleanup, medication or accessibility needs, check-in timing, and anything to avoid…" : "Add a note for this topic…", __sxClosestAction(Zr, "markNoteField")?.classList.toggle("is-aftercare-note", aftercareNote);
            Zr.value = h.join(" ");
            Yr.hidden = !0;
            n(Xr, "");
            Pr.querySelectorAll("[data-mark]").forEach(e => e.setAttribute("aria-checked", String(e.dataset.mark === (s || "neutral"))));
            Pr.querySelector('[data-topic-flag="fantasy"]').setAttribute("aria-pressed", String(Boolean(Je[Vi()]?.[e])));
            Pr.querySelector('[data-topic-flag="tried"]').setAttribute("aria-pressed", String(Boolean(et[Vi()]?.[e])));
            Pr.dataset.openedAt = String(performance.now());
            // Hanky code lives on the placard now (Jason, 2026-11-22):
            // on the Sexcapades skin a coded topic's sheet wears its
            // hanky color as the background, and the sheet's paper/ink
            // pair is set to whichever of the two gives the text the
            // better contrast against that color. Uncoded topics and
            // every vanilla skin keep the standard sheet.
            (function () {
                const chip = document.getElementById("markHanky"), sw = document.getElementById("markHankySwatch"), tx = document.getElementById("markHankyText");
                let key = null;
                if (sxSexSkin() && typeof Ie !== "undefined" && r && r.label) {
                    key = Ie.get(r.label) || null;
                    if (!key) for (const [nm, k] of Ie) if (nm.toLowerCase() === String(r.label).toLowerCase()) { key = k; break; }
                }
                const hex = key && typeof Ce !== "undefined" && Ce[key] ? Ce[key].color : null;
                if (hex) {
                    const lin = [1, 3, 5].map(off => { const c = parseInt(hex.slice(off, off + 2), 16) / 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); });
                    const lum = .2126 * lin[0] + .7152 * lin[1] + .0722 * lin[2];
                    const darkFg = (lum + .05) / .0588, lightFg = .97 / (lum + .05);
                    Pr.classList.add("hanky-backed");
                    Pr.style.setProperty("--hanky-bg", hex);
                    Pr.style.setProperty("--paper", darkFg >= lightFg ? "#151816" : "#f4f6f2");
                    Pr.style.setProperty("--ink", darkFg >= lightFg ? "#f4f6f2" : "#151816");
                    Pr.dataset.hankyKey = key;
                    if (chip) { chip.hidden = !1; if (sw) sw.style.background = hex; if (tx) tx.textContent = "Hanky code: " + ((typeof Se !== "undefined" && Se[key]) || key); }
                } else {
                    Pr.classList.remove("hanky-backed");
                    Pr.style.removeProperty("--hanky-bg");
                    Pr.style.removeProperty("--paper");
                    Pr.style.removeProperty("--ink");
                    Pr.removeAttribute("data-hanky-key");
                    if (chip) chip.hidden = !0;
                }
            })();
            Pr.hidden = !1;
            sxSyncMarkRatings(e);
            if (innerWidth <= 620) Pr.style.removeProperty("left"), Pr.style.removeProperty("top"); else {
                const e = Pr.getBoundingClientRect(), n = 12;
                Pr.style.left = Math.max(8, Math.min(innerWidth - e.width - 8, t - e.width / 2)) + "px", 
                Pr.style.top = (i - e.height - n >= 8 ? i - e.height - n : Math.min(innerHeight - e.height - 8, i + n)) + "px";
            }
            (a.focusNote ? Zr : Pr.querySelector("[data-mark]")).focus({
                preventScroll: !0
            });
        }
        function So(e) {
            noteFitUserCamera();
            if (Nt) return;
            let t = qn[e];
            if (t || h.some(n => n.topics.some(i => Wn(i) === e && (t = {
                id: e,
                label: sxName(i),
                branch: n.name,
                kind: "Topic",
                risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk),
                poleReading: i && i.poleReading || null,
                poleEnemies: i && Array.isArray(i.poleEnemies) ? i.poleEnemies : null
            }, !0))), t) {
                if (qn[e] = t, Nt = null, "Category" === t.kind) {
                    if (wn = !1, rn.has(t.branch)) return rn.delete(t.branch), Lt = null, void Mr();
                    rn.add(t.branch);
                } else wn = !1, rn.add(t.branch);
                Lt = e, Mr(), Th(e, t.branch);
            }
        }
        function $o(e, t = Vi()) {
            const n = qn[e] || Xn(e) || (at[t] || {})[e];
            if (!n) return;
            const i = ln[t], a = cn[t], r = dn[t];
            if (a?.delete(e), r?.delete(e), "Category" === n.kind) return void i?.delete(n.branch);
            const o = new Set([ ...a || [], ...r || [] ]);
            Array.from(o).some(e => {
                const i = qn[e] || Xn(e) || (at[t] || {})[e];
                return (i && i.branch || ci(e)) === n.branch && !Eo(t, e);
            }) || i?.delete(n.branch);
        }
        function Eo(e, t) {
            const n = Ze[e]?.[t];
            return n && Object.keys(n).length ? Object.values(n).includes("manual") : !0;
        }
        function Ao(e, t, n) {
            return Ze[e]?.[t]?.[n] || "manual";
        }
        function Co(e, t, n, i) {
            if ("manual" === i) return Mo(e, t, n);
            Ze[e] || (Ze[e] = {}), Ze[e][t] || (Ze[e][t] = {}), Ze[e][t][n] = i;
        }
        function Mo(e, t, n) {
            const i = Ze[e]?.[t];
            i && (delete i[n], Object.keys(i).length || delete Ze[e][t]);
        }
        function Io(e) {
            return e === Et ? At : vt[e];
        }
        function Po() {
            Ct || Mt || (Ct = !0, requestAnimationFrame(() => {
                if (Mt) return;
                const t = e.one("#profileTabs [data-add-profile]");
                t && e.byId("profileAddMenu").hidden && Pw(t);
            }));
        }
        function Lo(e) {
            return !!(e && vt[e] && Object.keys(At).length) && (Object.entries(At).forEach(([t, n]) => {
                if (Ge(t, e).single || "number" == typeof n) {
                    const i = ("number" == typeof n ? [ n ] : [ n && n.give, n && n.receive ]).map(Number).find(Number.isFinite);
                    if (void 0 === i) return;
                    return vt[e][t] = Math.max(-100, Math.min(100, i)), Co(e, t, "give", "manual"), 
                    void Co(e, t, "receive", "manual");
                }
                if (!n || "object" != typeof n) return;
                const i = vt[e][t], a = i && "object" == typeof i ? Object.assign({}, i) : {};
                const flanks = (Ge(t, e).keys) || [ "give", "receive" ];
                flanks.forEach(i => {
                    Object.prototype.hasOwnProperty.call(n, i) && Number.isFinite(Number(n[i])) && (a[i] = Math.max(-100, Math.min(100, Number(n[i]))), 
                    Co(e, t, i, "manual"));
                }), Object.keys(a).length && (vt[e][t] = a);
            }), Object.keys(At).forEach(e => delete At[e]), Ze[Et] = {}, Ct = !1, zt(e), !0);
        }
        // Hot List freeze fix (2026-11-15): an explicitly passed empty-template
        // id (Et) is NOT a valid write target - it used to mint a new "New
        // profile" on every call (the dialog passes its captured Et per move).
        // Fall through to the selected profile so at most one profile is
        // minted, on the first write, and later writes reuse it.
        function To(e, t, n, i = !0, a = null) {
            let r = a && vt[a] ? a : Mt && vt[Mt] ? Mt : Et;
            if (typeof sxIsPseudoProfile === "function" && sxIsPseudoProfile(r)) return 0;
            if (r === Et && typeof ik === "function" && typeof SX_PROFILE_RECORD_LISTS !== "undefined") {
                const pid = ik("New profile");
                SX_PROFILE_RECORD_LISTS.forEach(k => k[pid] = {});
                wt[pid] = "New profile";
                vt[pid] = {};
                Lo(pid);
                Mt = pid;
                if (typeof Go !== "undefined" && Go === Et) Go = pid;
                if (typeof sxAutoSelect === "function") sxAutoSelect(pid);
                r = pid;
                if (typeof Jw === "function") Jw();
            }
            const o = Io(r), s = "intensity" === t ? Math.max(-400, Math.min(400, Math.round(Number(n) || 0))) : Math.max(-100, Math.min(100, Number(n)));
            if (Ge(e, r).single) {
                if (typeof sxIsStanceSkin === "function" && sxIsStanceSkin() && o[e] && "object" == typeof o[e] && (o[e].advocacy || o[e].receptivity)) {
                    const cur = Object.assign({}, o[e]);
                    const adv = Object.assign({}, cur.advocacy || {});
                    adv.give = s;
                    (Ge(e, r).poleKeys || []).forEach(pk => { adv[pk] = s; });
                    adv.intensity = s;
                    cur.advocacy = adv;
                    o[e] = cur;
                    Co(r, e, "advocacy", "manual");
                    zt(r);
                    $o(e, r);
                    i && Mr();
                    return s;
                }
                const t = o[e], n = "number" != typeof t || Number(t) !== s;
                return o[e] = s, Co(r, e, "give", "manual"), Co(r, e, "receive", "manual"), n && zt(r),
                $o(e, r), i && Mr(), s;
            }
            const l = o[e], c = l && "object" == typeof l ? Object.assign({}, l) : {}, d = !Object.prototype.hasOwnProperty.call(c, t) || Number(c[t]) !== s;
            return c[t] = s, o[e] = c, Co(r, e, t, "manual"), d && zt(r), $o(e, r),
            i && Mr(), c[t];
        }
        // Same Et guard as To() above: a stale empty-template id must not
        // mint a profile per call.
        function Fo(e, t, n = !0, i = null) {
            let a = i && vt[i] ? i : Mt && vt[Mt] ? Mt : Et;
            if (typeof sxIsPseudoProfile === "function" && sxIsPseudoProfile(a)) return;
            if (a === Et && typeof ik === "function" && typeof SX_PROFILE_RECORD_LISTS !== "undefined") {
                const pid = ik("New profile");
                SX_PROFILE_RECORD_LISTS.forEach(k => k[pid] = {});
                wt[pid] = "New profile";
                vt[pid] = {};
                Lo(pid);
                Mt = pid;
                if (typeof Go !== "undefined" && Go === Et) Go = pid;
                if (typeof sxAutoSelect === "function") sxAutoSelect(pid);
                a = pid;
                if (typeof Jw === "function") Jw();
            }
            const r = Io(a), o = r[e], s = Ge(e, a).single, l = "number" == typeof o || Boolean(o && "object" == typeof o && Object.prototype.hasOwnProperty.call(o, t));
            if (s) delete r[e], Mo(a, e, "give"), Mo(a, e, "receive"); else if ("number" == typeof o) {
                const n = "give" === t ? "receive" : "give";
                r[e] = {
                    [n]: o
                };
            } else if (o && "object" == typeof o) {
                const n = Object.assign({}, o);
                delete n[t], Object.keys(n).length ? r[e] = n : delete r[e];
            }
            s || Mo(a, e, t), Nt = null, l && (zt(a), $o(e, a)), n && Mr();
        }
        // P1 refactor (Build 2026-10-18_2227): getScreenCTM cache. During
        // a pointer gesture the viewport does not move, so the screen CTM
        // of the element being hit-tested (rating badge, map layer) is
        // cached and reused instead of forcing a layout recalculation on
        // every pointermove and for every badge in the hit-test loop.
        // The cache key includes the viewport group transform and the
        // SVG viewBox, so any pan/zoom invalidates it automatically; the
        // cache is also dropped at the start of each pointerdown gesture.
        let __sxCtmEl = null, __sxCtmVal = null, __sxCtmKey = "";
        function __sxScreenCtm(e) {
            const t = (Jp ? Jp.getAttribute("transform") : "") + "|" + (Cn ? Cn.getAttribute("viewBox") : "");
            return __sxCtmVal && __sxCtmEl === e && __sxCtmKey === t ? __sxCtmVal : (__sxCtmEl = e, __sxCtmKey = t, __sxCtmVal = e.getScreenCTM());
        }
        function __sxInvalidateCtm() {
            __sxCtmEl = null, __sxCtmVal = null, __sxCtmKey = "";
        }
        function No(e, t, n, i = !1) {
            const a = Number(e.dataset.x0), r = Number(e.dataset.y0), o = Number(e.dataset.x1), s = Number(e.dataset.y1), l = __sxScreenCtm(e);
            if (!l) return null;
            const c = Cn.createSVGPoint();
            c.x = t, c.y = n;
            const d = c.matrixTransform(l.inverse()), u = o - a, p = s - r, h = u * u + p * p, g = h ? ((d.x - a) * u + (d.y - r) * p) / h : .5;
            if (g < -.08 || g > 1.08) return Number.NaN;
            const m = A(g);
            return 200 * (m <= .16 ? 0 : m >= .84 ? 1 : (m - .16) / .68) - 100;
        }
        function _o(e, t) {
            const n = e.dataset.id, i = e.dataset.direction, a = __sxClosestAction(e, "nodeGroup"), r = Number.isNaN(t);
            if (a) {
                const t = __sxClosestAction(e, "directionControl");
                t && (t.classList.add("active-rating"), t.classList.toggle("is-clear-preview", r), 
                a.appendChild(t)), In.appendChild(a), a.querySelectorAll(".rating-rail.active-rating,.slider-thumb.active-rating").forEach(e => e.classList.remove("active-rating"));
            }
            const o = a && a.querySelector(`.visual-rail[data-id="${n}"][data-direction="${i}"]`);
            if (o && o.classList.add("active-rating"), null === t || r) {
                const e = da(n, Vi());
                t = e[i + "Known"] ? e[i] : 0;
            }
            const s = Math.max(-100, Math.min(100, Number(t))), l = (s + 100) / 200, c = Number(e.dataset.x0), d = Number(e.dataset.y0), u = Number(e.dataset.x1), p = Number(e.dataset.y1), h = Number(e.dataset.nx), g = Number(e.dataset.ny), m = Number(e.dataset.offset);
            let f = a && a.querySelector(`.slider-thumb[data-id="${n}"][data-direction="${i}"]`);
            if (!f && a) {
                f = document.createElementNS("http://www.w3.org/2000/svg", "circle"), f.setAttribute("class", "slider-thumb"), 
                f.dataset.id = n, f.dataset.direction = i, f.setAttribute("r", "7");
                const t = __sxClosestAction(e, "directionControl");
                (t || a).insertBefore(f, t ? e : null);
            }
            f && (f.classList.add("active-rating"), f.setAttribute("cx", (c + (u - c) * l + h * m).toFixed(2)), 
            f.setAttribute("cy", (d + (p - d) * l + g * m).toFixed(2)), f.setAttribute("fill", zi(s)));
            const y = a && a.querySelector(`.direction-tag-bg[data-id="${n}"][data-direction="${i}"]`);
            return y && (y.setAttribute("fill", zi(s)), y.setAttribute("opacity", "1")), e.setAttribute("aria-valuenow", String(s)), 
            e.setAttribute("aria-valuetext", r ? "Release to clear" : String(Math.round(s))), 
            r ? Number.NaN : s;
        }
        Pr && Pr.querySelectorAll("[data-mark]").forEach(e => e.addEventListener("click", () => {
            if (!Qr || performance.now() - Number(Pr.dataset.openedAt || 0) < 400) return;
            const t = Vi();
            if (typeof sxIsPseudoProfile === "function" && sxIsPseudoProfile(t)) return;
            const previousRatedCount = cs(t).rated, n = Qr, i = e.dataset.mark, a = Qe[t][n];
            "neutral" === i ? delete Qe[t][n] : Qe[t][n] = i, Pr.querySelectorAll("[data-mark]").forEach(e => e.setAttribute("aria-checked", String(e.dataset.mark === ("neutral" === i ? "neutral" : i)))), 
            a !== ("neutral" === i ? void 0 : i) && zt(t), Mr(), checkMilestoneTransition(t, previousRatedCount);
        })), Pr && Pr.querySelectorAll("[data-topic-flag]").forEach(e => e.addEventListener("click", () => {
            if (!Qr || performance.now() - Number(Pr.dataset.openedAt || 0) < 400) return;
            const t = Vi();
            if (typeof sxIsPseudoProfile === "function" && sxIsPseudoProfile(t)) return;
            const previousRatedCount = cs(t).rated, n = Qr, i = "fantasy" === e.dataset.topicFlag ? Je : et, a = !i[t]?.[n];
            i[t] || (i[t] = {}), a ? i[t][n] = !0 : delete i[t][n], e.setAttribute("aria-pressed", String(a)), 
            zt(t), Mr(), checkMilestoneTransition(t, previousRatedCount);
        })), Zr && Zr.addEventListener("change", () => {
            ao(), Mr({
                animate: !1
            });
        }), Vr && Vr.addEventListener("click", () => {
            oo();
            const e = zr ? zr.hidden : !0;
            zr && (zr.hidden = !e), Vr.setAttribute("aria-expanded", String(e));
        }), zr && zr.addEventListener("click", e => e.stopPropagation()), jr && jr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(jr);
        }), qr && qr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(qr);
        }), Hr && Hr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(Hr);
        }), Ur && Ur.addEventListener("click", e => {
            e.stopPropagation(), __sxClosestAction(e.target, "openLocalCommunities") && (oo(), 
            so(), Ol());
        }), window.addEventListener("resize", () => {
            no && Ur && !Ur.hidden && bo(no);
        }), e.byId("closeMarkMenu") && e.byId("closeMarkMenu").addEventListener("click", so), window.__sxOnPtr( e => {
            (!Pr || Pr.hidden) || (!zr || zr.hidden) || __sxClosestAction(e.target, "markMeta") || ro(), (!Ur || Ur.hidden) || Ur.contains(e.target) || e.target === no || oo(),
            (!Pr || Pr.hidden) || Pr.contains(e.target) || so();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && ((!Ur || Ur.hidden) ? so() : oo());
        });
