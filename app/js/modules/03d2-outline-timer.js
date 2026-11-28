        function sxRefreshHotListStatus() {
            if (!Go || Go !== Et && !vt[Go]) return;
            const e = sxOutlineRatedCounts(Go), t = e.total > 0 && e.rated === e.total, n = t && !Jo;
            const prog = "function" == typeof sxComputePhaseProgress ? sxComputePhaseProgress(Go) : null;
            const corePhase = prog && prog.phases.find(p => p.key === "core");
            if (corePhase && corePhase.complete) sxSendEvent("quickstart_completed");
            Jo = t;
            if (n && !Zo) return sxSetOutlineTimerPaused(!0), void sxQueueCompletionCheck();
            const T = (prog && prog.totalTopics) || window.__SX_SKIN_TOPIC_COUNT || 382;
            const honestPct = prog ? prog.honestPct : Math.min(100, e.rated / T * 100);
            const rawPct = prog ? prog.rawPct : honestPct;
            const r = sxClockText(sxOutlineTimerSeconds()), o = Zo ? `${r} paused${ZoAuto ? " \u2014 tab hidden" : ""}` : `${r} elapsed`;
            sxPaintOutlineLadder(prog);
            let headerTxt = `${e.rated} of ${T} topics rated`;
            if (window.__sxOnDeck) {
                headerTxt = `${window.__sxOnDeckTotal(Go)} topics on deck`;
            } else if (prog) {
                if (prog.allComplete) {
                    headerTxt = `Complete · ${prog.totalRated} of ${T} rated`;
                } else if (prog.currentPhase) {
                    const cp = prog.currentPhase;
                    const extra = prog.totalRated > prog.honestCount ? ` · ${prog.totalRated} total` : "";
                    headerTxt = cp.key === "full"
                        ? `Full Map: ${prog.totalRated} of ${T} rated`
                        : `Phase ${cp.index}: ${cp.done}/${cp.total} ${cp.shortLabel}${extra}`;
                }
            }
            Bo.textContent = headerTxt, jo.textContent = o;
            qo.style.width = honestPct.toFixed(2) + "%";
            if (qoRaw) qoRaw.style.width = rawPct.toFixed(2) + "%";
            qo.parentElement.setAttribute("aria-valuemin", "0");
            qo.parentElement.setAttribute("aria-valuemax", String(T));
            qo.parentElement.setAttribute("aria-valuenow", String(Math.min(T, prog ? prog.honestCount : e.rated)));
            const phaseSummary = prog && prog.phases.length
                ? prog.phases.map(p => `Phase ${p.index} ${p.shortLabel}: ${p.done}/${p.total}`).join("; ")
                : `${e.rated} of ${T} topics rated`;
            qo.parentElement.setAttribute("aria-label", `${headerTxt}. ${phaseSummary}`);
            if (prog && Ro) {
                const byKey = new Map(prog.phases.map(p => [p.key, p]));
                Ro.querySelectorAll(".outline-phase-branch[data-outline-phase-key]").forEach(el => {
                    const st = byKey.get(el.dataset.outlinePhaseKey);
                    if (!st) return;
                    const cnt = el.querySelector(":scope > summary .outline-branch-count");
                    if (cnt) cnt.textContent = st.complete ? `✓ ${st.total}/${st.total}` : `${st.done}/${st.total} rated`;
                    el.classList.toggle("is-phase-complete", st.complete);
                    const banner = el.querySelector(":scope > .outline-rows > .outline-phase-banner");
                    if (banner) banner.hidden = !st.complete;
                });
            }
            n && sxQueueCompletionCheck();
        }
        function sxSetOutlineTimerPaused(e) {
            const n = Boolean(e);
            if (n === Zo) return sxSyncTimerPauseButton(), void sxRefreshHotListStatus();
            n || (ZoAuto = !1);
            n ? (Vo && (Yo += Math.max(0, Date.now() - Vo), Vo = 0), t.clear(Xo), Xo = 0) : (Vo = Date.now(), 
            Qo = !0, t.clear(Xo), Xo = t.setInterval(sxRefreshHotListStatus, 1e3)), Zo = n, sxSyncTimerPauseButton(), sxRefreshHotListStatus();
        }
        let xs = 0;
        // Appetite for one inline-slider direction: the stored
        // per-flank intensity first, the leaning as derivation (the
        // fader's handle is coloured by appetite, positioned by
        // leaning). A pole slider on a dual-placement topic belongs
        // to the primary (advocacy) placement, so its appetite is
        // that placement's intensity. The trilinear line and the
        // monopole carry one intensity on the record itself. A pair
        // topic's record-level intensity is the blend, never a flank
        // appetite, so it is only used for the line and monopoles.
        function sxOutlineDirAppetite(rec, dir, lean) {
            var l = Math.max(-100, Math.min(100, Number(lean) || 0));
            if (!rec) return l;
            if (rec[dir + "IntensityKnown"] && Number.isFinite(Number(rec[dir + "Intensity"]))) return Math.max(-100, Math.min(100, Number(rec[dir + "Intensity"])));
            if (rec.advocacyKnown && rec.advocacyIntensityKnown && Number.isFinite(Number(rec.advocacyIntensity)) && rec.advocacy && typeof rec.advocacy === "object" && Object.prototype.hasOwnProperty.call(rec.advocacy, dir)) return Math.max(-100, Math.min(100, Number(rec.advocacyIntensity)));
            if ((dir === "line" || rec.isMonopole) && rec.intensityKnown && Number.isFinite(Number(rec.intensity))) return Math.max(-100, Math.min(100, Number(rec.intensity)));
            return l;
        }
        function sxSyncOutlineRow(e) {
            const t = e.dataset.outlineId, n = Go, i = sxDecodeTopicStance(t, n), a = (Qe[n] || {})[t] || "", r = e.querySelector(".outline-topic-label");
            // A row carrying the placard's cross slider (pair topic,
            // owner ruling 2026-11-25) re-renders it here, in place
            // of the range-input loop below (which finds no inputs
            // on such a row).
            if (e.__sxCrossPair) { e.__sxCrossPair.first.render(); e.__sxCrossPair.second.render(); }
            e.querySelectorAll("[data-outline-direction]").forEach(e => {
                const t = e.dataset.outlineDirection, place = e.dataset.placement;
                let known, val, app;
                if (place === "receptivity") {
                    const bag = i.receptivity;
                    known = Boolean(bag && Number.isFinite(Number(bag[t])));
                    val = known ? Number(bag[t]) : 0;
                    app = i.receptivityIntensityKnown ? i.receptivityIntensity : val;
                } else if (place === "advocacy") {
                    const bag = i.advocacy;
                    known = Boolean(bag && Number.isFinite(Number(bag[t])));
                    val = known ? Number(bag[t]) : (i[t + "Known"] ? Number(i[t]) : 0);
                    if (!known && i[t + "Known"]) known = !0;
                    app = i.advocacyIntensityKnown ? i.advocacyIntensity : sxOutlineDirAppetite(i, t, val);
                } else {
                    known = Boolean(i[t + "Known"]);
                    val = i[t];
                    app = sxOutlineDirAppetite(i, t, val);
                }
                !function(e, t, n, app) {
                    const i = Math.max(-100, Math.min(100, Number(n) || 0)), host = e.parentElement, a = (host && host.querySelector(":scope > output")) || __sxClosestAction(e, "outlineRating").querySelector("output");
                    e.value = String(Math.round(i)), e.classList.toggle("is-unrated", !t), e.style.setProperty("--outline-thumb", t ? sxInterestColor(app) : "#646d66"), 
                    e.setAttribute("aria-valuetext", t ? `${Math.round(i)}` : "Unrated");
                    if (a) a.textContent = t ? String(Math.round(i)) : "—", a.classList.toggle("is-unrated", !t);
                }(e, known, val, app);
            }), e.querySelectorAll("[data-outline-mark]").forEach(e => e.setAttribute("aria-pressed", String(e.dataset.outlineMark === a))), 
            e.querySelector('[data-outline-flag="fantasy"]')?.setAttribute("aria-pressed", String(Boolean(Je[n]?.[t]))), 
            e.querySelector('[data-outline-flag="tried"]')?.setAttribute("aria-pressed", String(Boolean(et[n]?.[t])));
            const o = getOutlineCell(e, "note"), s = getOutlineCell(e, "note-input"), l = (tt[n]?.[t] || []).join(" ");
            if (o) {
                const e = r?.textContent?.trim() || "this topic", t = Boolean(l), n = t ? `Tap to edit: ${l}` : "Add note…";
                o.dataset.hasNote = String(t), o.title = n, o.setAttribute("aria-label", t ? `Tap to edit note for ${e}: ${l}` : `Add note for ${e}`);
            }
            s && document.activeElement !== s && (s.value = l);
            const inline = e.querySelector(".outline-inline-widget");
            inline && inline.__sxRedraw && inline.__sxRedraw();
        }
        function sxOutlineChildRows(e, t) {
            return Array.from(e.querySelectorAll(".outline-row[data-outline-parent]")).filter(e => e.dataset.outlineParent === t);
        }
        function sxMakePopularityIcon(e, t, n = !1) {
            if (!e) return null;
            const i = document.createElement("div");
            i.innerHTML = sxPracticeIconMarkup(e, n);
            const a = i.firstElementChild;
            return a ? (a.dataset.popularityTooltip = sxPopularityTooltipText(t), a.tabIndex = 0, a.setAttribute("aria-hidden", "false"), 
            a.setAttribute("role", "img"), a.setAttribute("aria-label", `Popularity details for ${t.label}`), 
            a) : null;
        }
