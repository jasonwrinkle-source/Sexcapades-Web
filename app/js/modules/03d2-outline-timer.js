        function ws() {
            if (!Go || Go !== Et && !vt[Go]) return;
            const e = cs(Go), t = e.total > 0 && e.rated === e.total, n = t && !Jo;
            var i;
            if (e.rated && us(i = Go).every(e => e.topics.filter(t => (e.outlineTopicRanks?.get(Wn(t)) ?? Number.POSITIVE_INFINITY) < 3).every(e => ls(Wn(e), i))) && p("quickstart_completed"), 
            Jo = t, n && !Zo) return ks(!0), void vs();
            /* Flexcapades: topic total follows the active skin (403 = Sexcapades
               copy, unchanged; a loaded skin sets window.__SX_SKIN_TOPIC_COUNT). */
            const T = window.__SX_SKIN_TOPIC_COUNT || 403, a = Math.min(100, e.rated / T * 100), r = xt(ps()), o = Zo ? `${r} paused${ZoAuto ? " \u2014 tab hidden" : ""}` : `${r} elapsed`;
            sxPaintOutlineLadder();
            const sxCats = Math.max(1, (h && h.length) || 18), sxStep = sxCats * 3;
            Bo.textContent = window.__sxOnDeck ? `${window.__sxOnDeckTotal(Go)} topics on deck` : `${e.rated} of ${T} topics rated`, jo.textContent = o, qo.style.width = a + "%",
            qo.parentElement.setAttribute("aria-valuemin", "0"), qo.parentElement.setAttribute("aria-valuemax", String(T)),
            qo.parentElement.setAttribute("aria-valuenow", String(Math.min(T, e.rated))),
            qo.parentElement.setAttribute("aria-label", `${e.rated} of ${T} topics rated; tick marks every ${sxStep} topics (3 per category across ${sxCats} categories), up to ${T}`);
            n && vs();
        }
        function ks(e) {
            const n = Boolean(e);
            if (n === Zo) return hs(), void ws();
            n || (ZoAuto = !1);
            n ? (Vo && (Yo += Math.max(0, Date.now() - Vo), Vo = 0), t.clear(Xo), Xo = 0) : (Vo = Date.now(), 
            Qo = !0, t.clear(Xo), Xo = t.setInterval(ws, 1e3)), Zo = n, hs(), ws();
        }
        let xs = 0;
        function Ss(e) {
            const t = e.dataset.outlineId, n = Go, i = ca(t, n), a = (Qe[n] || {})[t] || "", r = e.querySelector(".outline-topic-label");
            e.querySelectorAll("[data-outline-direction]").forEach(e => {
                const t = e.dataset.outlineDirection;
                !function(e, t, n) {
                    const i = Math.max(-100, Math.min(100, Number(n) || 0)), a = __sxClosestAction(e, "outlineRating").querySelector("output");
                    e.value = String(Math.round(i)), e.classList.toggle("is-unrated", !t), e.style.setProperty("--outline-thumb", t ? zi(i) : "#646d66"), 
                    e.setAttribute("aria-valuetext", t ? `${Math.round(i)}` : "Unrated"), a.textContent = t ? String(Math.round(i)) : "—", 
                    a.classList.toggle("is-unrated", !t);
                }(e, Boolean(i[t + "Known"]), i[t]);
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
        function $s(e, t) {
            return Array.from(e.querySelectorAll(".outline-row[data-outline-parent]")).filter(e => e.dataset.outlineParent === t);
        }
        function Es(e, t, n = !1) {
            if (!e) return null;
            const i = document.createElement("div");
            i.innerHTML = Kl(e, n);
            const a = i.firstElementChild;
            return a ? (a.dataset.popularityTooltip = yo(t), a.tabIndex = 0, a.setAttribute("aria-hidden", "false"), 
            a.setAttribute("role", "img"), a.setAttribute("aria-label", `Popularity details for ${t.label}`), 
            a) : null;
        }
