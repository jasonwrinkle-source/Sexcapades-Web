        const Do = e.byId("outlineDialog"), Ro = e.byId("outlineSections"), Oo = e.byId("outlineProfileName"), Bo = e.byId("outlineHeaderCount"), jo = e.byId("outlineProgressText"), qo = e.byId("outlineProgressBar"), Ho = e.byId("outlineTimerToggle"), Wo = e.byId("outlineTimerReset"), Uo = e.byId("outlineShowRated");
        // P1 refactor (Build 2026-10-18_2227): outline-row DOM helpers.
        // getOutlineRow(el) returns the .outline-row containing an element;
        // getOutlineRow(id) returns the row for a topic id within the
        // outline sections. getOutlineRows(root) returns the id-carrying
        // outline rows under a root (default: the outline sections).
        // getOutlineCell(row, name) returns the row's [data-outline-<name>]
        // cell ("direction", "mark", "note", "note-input", ...).
        function getOutlineRow(e) {
            return "string" == typeof e ? Ro.querySelector(`.outline-row[data-outline-id="${CSS.escape(e)}"]`) : e && e.closest ? __sxClosestAction(e, "outlineRow") : null;
        }
        function getOutlineRows(e = Ro) {
            return Array.from((e || Ro).querySelectorAll(".outline-row[data-outline-id]"));
        }
        function getOutlineCell(e, t) {
            return e ? e.querySelector(`[data-outline-${t}]`) : null;
        }
        let Go = null, Ko = null, zo = null, Vo = 0, Yo = 0, Xo = 0, Zo = !0, Qo = !1, Jo = !1, es = null, ts = 0, ns = 0, is = !1, as = null, ZoAuto = !1;
        const rs = new Set, os = new Set, ss = "Show the next three popular";
        const milestoneRungs = Object.freeze([ 54, 108, 162, 216, 270, 324, 378, 403 ]), milestoneShownByProfile = new Map;
        let milestoneProfileId = null, milestoneValue = 0;
        function ls(e, t) {
            const n = ca(e, t);
            return !!Ge(e, t).keys.some(e => Boolean(n[e + "Known"])) || !!Boolean((Qe[t] || {})[e]) || !!Boolean((Je[t] || {})[e]) || Boolean((et[t] || {})[e]);
        }
        function cs(e, t = null) {
            const n = function(e) {
                const t = [];
                return h.forEach(n => {
                    n.topics.forEach(i => {
                        const a = Wn(i);
                        t.push({
                            id: a,
                            label: i,
                            branch: n.name,
                            kind: "Topic",
                            risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk)
                        }), ai(a, e).forEach(i => {
                            const a = (at[e] || {})[i];
                            a && t.push({
                                id: i,
                                label: a.label || i,
                                branch: n.name,
                                kind: "Imported",
                                risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk)
                            });
                        });
                    });
                }), t;
            }(e).filter(e => "Topic" === e.kind && (!t || e.branch === t));
            return {
                rated: n.filter(t => ls(t.id, e)).length,
                total: n.length
            };
        }
        function ds(e) {
            return K(e.topics);
        }
        let sxOutlineSortMode = "popularity";
        window.__sxSetOutlineSortMode = function(e) {
            sxOutlineSortMode = "interest" === e ? "interest" : "popularity";
        };
        function us(e = Go) {
            const sxScore = "interest" === sxOutlineSortMode && e && e !== Et ? t => {
                const n = ca(Wn(t), e);
                return n.giveKnown || n.receiveKnown ? n.giveKnown && n.receiveKnown ? (n.give + n.receive) / 2 : n.giveKnown ? n.give : n.receive : null;
            } : e => sxTopicPopularity(topicIdByLabel[sxName(e)] || sxName(e));
            return U(h, z, e => e.name).map(e => {
                const t = G(e.subcategories || [], ds), n = [ ...t.flatMap(e => G(e.topics || [], sxScore)), ...G(e.subcategories?.length ? e.parentTopics || e.topics.filter(t => !Vn(e, t)) : e.topics, sxScore) ], i = G(n, sxScore), a = new Map(i.map((e, t) => [ Wn(e), t ]));
                return Object.assign({}, e, {
                    subcategories: t,
                    topics: n,
                    outlineTopicRanks: a
                });
            });
        }
        function ps() {
            return Math.max(0, Math.floor((Yo + (Vo ? Date.now() - Vo : 0)) / 1e3));
        }
        function hs() {
            Ho.classList.toggle("is-paused", Zo), Ho.setAttribute("aria-label", Zo ? "Resume elapsed timer" : "Pause elapsed timer"), 
            Ho.title = Zo ? "Resume timer" : "Pause timer";
        }
        function gs() {
            if (!es) try {
                const e = window.AudioContext || window.webkitAudioContext;
                if (!e) return;
                es = new e, "suspended" === es.state && es.resume().catch((e) => { __sxErrLog("audio-context", e); });
            } catch (e) {
                es = null;
            }
        }
        function ms() {
            ts && cancelAnimationFrame(ts), ts = 0;
        }
        function fs() {
            t.clear(ns), ns = 0, ms(), Ui(Eg), milestoneProfileId = null, milestoneValue = 0;
        }
        function milestoneWasShown(e, t) {
            return milestoneShownByProfile.get(e)?.has(t) || !1;
        }
        function markMilestoneShown(e, t) {
            milestoneShownByProfile.has(e) || milestoneShownByProfile.set(e, new Set), milestoneShownByProfile.get(e).add(t);
        }
        function closeMilestoneCelebration() {
            Ui(milestoneDialog), milestoneProfileId = null, milestoneValue = 0;
        }
        function showMilestoneCelebration(t, n) {
            if (!t || milestoneWasShown(t, n)) return;
            if (403 === n) return void ys(t);
            if (milestoneDialog.open || Eg.open) return;
            markMilestoneShown(t, n), milestoneProfileId = t, milestoneValue = n, milestoneTitle.textContent = `${n} topics rated`, 
            milestoneMessage.textContent = n < 162 ? "Your hypermap has enough detail to be useful now. You can keep building it or put it to work." : n < 324 ? "Your hypermap is getting richer. Keep going, compare it with a partner, or save a copy now." : "You’re close to the full map. Keep rating, compare what you have, or export a copy now.", 
            Wi(milestoneDialog), requestAnimationFrame(() => milestoneContinue.focus({
                preventScroll: !0
            }));
        }
        function checkMilestoneTransition(e, t) {
            if (!e || !Number.isFinite(t)) return;
            const n = cs(e).rated;
            n > t && milestoneRungs.includes(n) && showMilestoneCelebration(e, n);
        }
        function openMilestoneDestination(e) {
            const t = milestoneProfileId;
            milestoneDialog.open ? closeMilestoneCelebration() : Eg.open && fs(), Do.open && Is(!1);
            requestAnimationFrame(() => {
                const n = t => {
                    if (!t || !vt[t]) return;
                    if ("export" === e) return void Jf(t);
                    if ("import" === e) return t !== Mt && Js(t), void ww();
                    if ("scribe" === e) return t !== Mt && Js(t), void (document.getElementById("scribeTab") ? document.getElementById("scribeTab").click() : (yc(), Jd()));
                    t !== Mt && Js(t);
                    const n = Object.keys(vt).filter(e => e !== t), i = tl.querySelector("[data-add-profile]");
                    if (!n.length) return i && (kw(), xw(), Sw(), Pw(i)), void tS("Add or import your partner’s profile, then hold its tab to compare.");
                    sxSel(null, "clear"), el(t);
                    const a = tl.querySelector(`button[data-view]:not([data-view="${CSS.escape(t)}"])`);
                    a && a.focus({
                        preventScroll: !0
                    }), tS("Choose a partner: hold their profile tab — or Ctrl+click on a computer.");
                };
                t === Et || !vt[t] ? (Vy = n, bw(null)) : n(t);
            });
        }
        function ys(t = Go || Vi()) {
            if (!t || milestoneWasShown(t, 403) && !Eg.open) return;
            markMilestoneShown(t, 403), milestoneProfileId = t, milestoneValue = 403;
            if (!Eg.open) {
                Cg.textContent = "Over 400 topics rated.", Ag.dataset.submitted = "false", Wi(Eg), 
                function() {
                    ms();
                    const e = Mg.getBoundingClientRect();
                    if (!e.width || !e.height) return;
                    const t = Math.min(2, window.devicePixelRatio || 1), n = e.width, i = e.height, a = Mg.getContext("2d");
                    Mg.width = Math.round(n * t), Mg.height = Math.round(i * t), a.setTransform(t, 0, 0, t, 0, 0);
                    const r = [ "#63c796", "#63c2c8", "#d7bd55", "#e4ac5f", "#e06f6a", "#eff2ec" ];
                    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                        a.clearRect(0, 0, n, i);
                        for (let e = 0; e < 44; e++) {
                            const t = e % 2 == 0, o = t ? e % 4 == 0 ? 10 + 75 * Math.random() : n - 85 + 75 * Math.random() : Math.random() * n, s = t ? Math.random() * i : 10 + 55 * Math.random();
                            a.fillStyle = r[e % r.length], a.save(), a.translate(o, s), a.rotate(.77 * e % Math.PI), 
                            a.fillRect(-3, -1.5, 6, 3), a.restore();
                        }
                        return;
                    }
                    const o = Array.from({
                        length: 96
                    }, (e, t) => ({
                        x: .5 * n + 46 * (Math.random() - .5),
                        y: .64 * i + 18 * (Math.random() - .5),
                        vx: 8.8 * (Math.random() - .5),
                        vy: -5.4 - 7.2 * Math.random(),
                        gravity: .13 + .07 * Math.random(),
                        spin: .28 * (Math.random() - .5),
                        angle: Math.random() * Math.PI,
                        w: 4 + 5 * Math.random(),
                        h: 2 + 4 * Math.random(),
                        color: r[t % r.length]
                    })), s = performance.now(), l = e => {
                        const t = e - s;
                        a.clearRect(0, 0, n, i), o.forEach(e => {
                            e.x += e.vx, e.y += e.vy, e.vy += e.gravity, e.vx *= .992, e.angle += e.spin, a.save(), 
                            a.globalAlpha = A((2500 - t) / 450), a.translate(e.x, e.y), a.rotate(e.angle), a.fillStyle = e.color, 
                            a.fillRect(-e.w / 2, -e.h / 2, e.w, e.h), a.restore();
                        }), ts = t < 2500 && Eg.open ? requestAnimationFrame(l) : 0;
                    };
                    ts = requestAnimationFrame(l);
                }(), function() {
                    const e = es;
                    if (e && "closed" !== e.state) try {
                        const t = e.currentTime + .025, n = e.createGain();
                        n.gain.setValueAtTime(1e-4, t), n.gain.exponentialRampToValueAtTime(.2, t + .035), 
                        n.gain.exponentialRampToValueAtTime(1e-4, t + 1.05), n.connect(e.destination), [ [ 523.25, 0 ], [ 659.25, .13 ], [ 783.99, .26 ], [ 1046.5, .43 ] ].forEach(([i, a], r) => {
                            const o = e.createOscillator(), s = e.createGain(), l = t + a, c = l + (3 === r ? .52 : .3);
                            o.type = 3 === r ? "sine" : "triangle", o.frequency.setValueAtTime(i, l), s.gain.setValueAtTime(1e-4, l), 
                            s.gain.exponentialRampToValueAtTime(3 === r ? .72 : .52, l + .025), s.gain.exponentialRampToValueAtTime(1e-4, c), 
                            o.connect(s), s.connect(n), o.start(l), o.stop(c + .03);
                        });
                    } catch (e) { __sxErrLog("audio-blip", e); }
                }(), requestAnimationFrame(() => e.byId("dismissCompletionCelebration").focus({
                    preventScroll: !0
                }));
                try {
                    bs();
                } catch (e) { __sxErrLog("audio-blip", e); }
            }
        }
        function bs() {
            try {
                var t = Go;
                if (!t) return;
                var n = 0;
                try {
                    n = cs(t).rated || 0;
                } catch (e) { __sxErrLog("storage", e); }
                var i = 0;
                try {
                    i = ps();
                } catch (e) { __sxErrLog("storage", e); }
                if (n <= 0 && i < 10) return;
                var a = "";
                try {
                    a = c();
                } catch (e) { __sxErrLog("storage", e); }
                if (!a) return;
                /* Send gate above unchanged (something rated, or 10+
                   seconds elapsed). The POST goes through the shared
                   analytics path (sxSendAnalytics) with this sender's
                   legacy dedup key, so the hostname guard and the dedup
                   live there and the sent marker is written only on
                   success — a failed send can retry on a later call
                   instead of being lost for the session. */
                sxSendAnalytics({
                    action: "event",
                    uuid: a,
                    event_type: "session_stats",
                    elapsed_seconds: i,
                    topic_count: n
                }, "sexcapades_session_stats");
            } catch (e) { __sxErrLog("analytics-beacon", e); }
        }
        function vs() {
            t.clear(ns), ns = t.setTimeout(() => {
                if (ns = 0, !Go || !vt[Go]) return;
                const e = cs(Go);
                e.total > 0 && e.rated === e.total && ys();
            }, 160);
        }
        function ws() {
            if (!Go || Go !== Et && !vt[Go]) return;
            const e = cs(Go), t = e.total > 0 && e.rated === e.total, n = t && !Jo;
            var i;
            if (e.rated && us(i = Go).every(e => e.topics.filter(t => (e.outlineTopicRanks?.get(Wn(t)) ?? Number.POSITIVE_INFINITY) < 3).every(e => ls(Wn(e), i))) && p("quickstart_completed"), 
            Jo = t, n && !Zo) return ks(!0), void vs();
            const a = Math.min(100, e.rated / 403 * 100), r = xt(ps()), o = Zo ? `${r} paused${ZoAuto ? " \u2014 tab hidden" : ""}` : `${r} elapsed`;
            Bo.textContent = window.__sxOnDeck ? `${window.__sxOnDeckTotal(Go)} topics on deck` : `${e.rated} of 403 topics rated`, jo.textContent = o, qo.style.width = a + "%", 
            qo.parentElement.setAttribute("aria-valuemin", "0"), qo.parentElement.setAttribute("aria-valuemax", String(403)), 
            qo.parentElement.setAttribute("aria-valuenow", String(Math.min(403, e.rated))), 
            qo.parentElement.setAttribute("aria-label", `${e.rated} of 403 topics rated; tick marks every 54 topics (3 per category across 18 categories), up to 403 for Full map`), 
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
        function As(e, t) {
            const n = document.createElement("div"), i = Ge(e.id, t), a = Boolean(e.expandable);
            n.className = "outline-row" + ("Imported" === e.kind ? " is-imported" : ""), n.dataset.outlineId = e.id, 
            e.parentId && (n.dataset.outlineParent = e.parentId);
            const r = document.createElement("div");
            r.className = "outline-topic-meta";
            const o = Oe(e.label, e.branch);
            r.insertAdjacentHTML("beforeend", Kl(o));
            const s = r.querySelector(":scope>.glance-tooltip-practice-icon"), l = yo(e);
            s && (s.dataset.popularityTooltip = l, s.tabIndex = 0, s.setAttribute("aria-hidden", "false"), 
            s.setAttribute("role", "img"), s.setAttribute("aria-label", `Popularity details for ${e.label}`));
            const c = document.createElement("div");
            c.className = "outline-topic-copy";
            const d = document.createElement("span");
            if (d.className = "outline-topic-label outline-description-trigger", d.textContent = e.label, 
            d.tabIndex = 0, d.setAttribute("role", "button"), d.setAttribute("aria-label", `${e.label}. ${a ? "Expand or collapse nested topics. " : ""}Press and hold for description.`), 
            d.dataset.outlineDescription = lo(e), a && (d.dataset.outlineExpandable = "true", 
            d.setAttribute("aria-expanded", String(Boolean(e.expanded)))), c.append(d), "Imported" === e.kind) {
                const e = document.createElement("small");
                e.className = "outline-imported-note", e.textContent = "added topic", c.append(e);
            }
            r.append(c);
            const u = document.createElement("span");
            u.className = "outline-marks", [ [ "favorite", "★", "Favorite" ], [ "notinterested", "⊘", "Not interested — not for me, but not a hard boundary" ], [ "limit", "×", "Hard limit" ] ].forEach(([t, n, i]) => {
                const a = document.createElement("button");
                a.type = "button", a.className = "outline-mark", a.dataset.outlineMark = t, a.textContent = n, 
                a.title = i, a.setAttribute("aria-label", `${i}: ${e.label}`), a.setAttribute("aria-pressed", "false"), 
                u.append(a);
            }), [ [ "fantasy", "☁", "Fantasy only — I fantasize about this but would not do it in real life" ], [ "tried", "✓", "Already tried — I have already done this" ] ].forEach(([t, n, i]) => {
                const a = document.createElement("button");
                a.type = "button", a.className = "outline-mark", a.dataset.outlineFlag = t, a.textContent = n, 
                a.title = i, a.setAttribute("aria-label", `${i}: ${e.label}`), a.setAttribute("aria-pressed", "false"), 
                u.append(a);
            });
            const p = document.createElement("button");
            p.type = "button", p.className = "outline-mark", p.dataset.outlineNote = "", p.dataset.hasNote = "false", 
            p.textContent = "📝", p.title = "Add or edit note", p.setAttribute("aria-label", `Add or edit note: ${e.label}`), 
            p.setAttribute("aria-expanded", "false"), u.append(p), r.append(u), n.append(r);
            const h = document.createElement("div");
            h.className = "outline-rating-group", (i.single ? [ "give" ] : i.keys).forEach((n, a) => {
                const r = document.createElement("label"), o = !i.single && "give" === i.labels[0] && "receive" === i.labels[1];
                r.className = "outline-rating";
                const s = document.createElement("span");
                s.className = "outline-rating-label", s.textContent = o ? n : i.labels[a] || n;
                const l = o ? function(e, t, n = Vi()) {
                    const i = Ge(e, n);
                    if (i.single || "give" !== i.labels[0] || "receive" !== i.labels[1]) return "";
                    const a = Zn(e, t), r = Qn(e, n), o = e => String(e || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
                    return a && o(a) !== o(r) ? `${"receive" === t ? "Receive" : "Give"}: ${a}` : "";
                }(e.id, n, t) : "";
                l && (r.dataset.ratingTooltip = l, r.setAttribute("data-tooltip-tap-first", ""), s.title = l);
                const c = document.createElement("input");
                c.type = "range", c.min = "-100", c.max = "100", c.step = "1", c.value = "0", c.dataset.outlineDirection = n, 
                c.setAttribute("aria-label", `${e.label}, ${s.textContent}${l ? `: ${l.replace(/^[^:]+:\s*/, "")}` : ""}`);
                const d = document.createElement("output");
                r.append(s, c, d), h.append(r);
            }), n.append(h);
            const g = document.createElement("label");
            g.className = "outline-note-editor", g.hidden = !0;
            const m = document.createElement("span");
            m.textContent = `Note about ${e.label}`;
            const f = document.createElement("textarea");
            return f.rows = 2, f.maxLength = 800, f.dataset.outlineNoteInput = "", f.placeholder = "Add context, preferences, or anything you want to remember…", 
            g.append(m, f), n.append(g), Ss(n), n;
        }
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
                (n.topics || []).forEach(e => {
                    const a = Wn(e), r = Vn(n, e);
                    t.set(a, {
                        id: a,
                        label: e,
                        branch: n.name,
                        kind: "Topic",
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
            const n = __sxOnDeckIndex(e), i = new Set((gt[e] && gt[e].fetlife && gt[e].fetlife.categoryHits) || []), a = Qe[e] || {}, r = Je[e] || {}, o = et[e] || {};
            n.forEach((n, s) => {
                if ("limit" === a[s]) return;
                const l = ca(s, e), c = Ge(s, e);
                if (!l.giveKnown && !l.receiveKnown) {
                    if (i.size && (i.has(n.catId) || n.subId && i.has(n.subId))) return void t.tier1.push(s);
                    if (a[s] || r[s] || o[s]) t.tier2.push(s);
                    return;
                }
                if (!c.single && l.giveKnown !== l.receiveKnown) return void t.direction.push(s);
                const d = c.single ? l.giveKnown ? [ "give" ] : [] : [ "give", "receive" ].filter(e => l[e + "Known"]);
                if (d.length && d.every(t => {
                    const n = Ao(e, s, t);
                    if (!n || "manual" === n || !(n in __sxSeedValues)) return !1;
                    const i = __sxSeedValues[n];
                    return null === i || i.includes(Math.round("give" === t ? l.give : l.receive));
                })) return void t.tier3.push(s);
                d.some(t => {
                    const n = Ao(e, s, t);
                    return n && "manual" !== n && n in __sxSeedValues;
                }) && t.unreviewed.push(s);
            });
            const s = (e, t) => {
                const i = sxTopicPopularity(e, n.get(e)?.label), a = sxTopicPopularity(t, n.get(t)?.label), r = (null === i ? Number.NEGATIVE_INFINITY : i) - (null === a ? Number.NEGATIVE_INFINITY : a);
                return r ? -r : String(n.get(e).label).localeCompare(String(n.get(t).label));
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
            if ("ratings" === rec.section) vt[profileId][topicId] = clone(value); else if ("alreadyTried" === rec.section) (et[profileId] || (et[profileId] = {}))[topicId] = !0; else if ("annotations" === rec.section) (Qe[profileId] || (Qe[profileId] = {}))[topicId] = value; else if ("fantasyOnly" === rec.section) (Je[profileId] || (Je[profileId] = {}))[topicId] = value; else if ("ratingSources" === rec.section) (Ze[profileId] || (Ze[profileId] = {}))[topicId] = clone(value); else if ("notes" === rec.section) (tt[profileId] || (tt[profileId] = {}))[topicId] = clone(value); else if ("importAttention" === rec.section) (cn[profileId] || (cn[profileId] = new Set)).add(topicId); else return !1;
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
        function Cs(e = {}) {
            const t = Go;
            if (!t || t !== Et && !vt[t]) return;
            os.clear();
            if (window.__sxOnDeck) return __sxRenderOnDeck(t), void ws();
            // Build 2026-10-18_1549 — FetLife review mode (armed by the
            // post-import summary's “Rate the categories your kinks map
            // to” button): render only the mapped branches, collapsed.
            const sxReview = window.__sxFetLifeReview instanceof Set && window.__sxFetLifeReview.size ? window.__sxFetLifeReview : null;
            const i = Boolean(e.preserveDisclosure), a = i ? new Set(Array.from(Ro.querySelectorAll(".outline-branch[open]")).map(e => e.dataset.outlineBranch)) : null, r = i ? new Set(Array.from(Ro.querySelectorAll(".outline-branch.is-expanded")).map(e => e.dataset.outlineBranch)) : null, o = i ? new Set(Array.from(Ro.querySelectorAll('.outline-subcategory[data-subcategory-expanded="true"]')).map(e => e.dataset.outlineSubcategory)) : null, s = i ? new Set(Array.from(Ro.querySelectorAll('.outline-topic-label[data-outline-expandable="true"][aria-expanded="true"]')).map(e => __sxClosestAction(e, "outlineRow")?.dataset.outlineId).filter(Boolean)) : null, l = i ? new Map(Array.from(Ro.querySelectorAll(".outline-branch")).map(e => [ e.dataset.outlineBranch, Number(e.dataset.outlineVisible) || 3 ])) : new Map, c = i ? new Map(Array.from(Ro.querySelectorAll(".outline-subcategory")).map(e => [ e.dataset.outlineSubcategory, Number(e.dataset.outlineSubcategoryVisible) ]).filter(([, e]) => Number.isFinite(e) && e > 0)) : new Map;
            Oo.textContent = (t === Et ? "New profile" : wt[t] || "Profile") + (yt[t] ? " *" : ""), Ro.replaceChildren(),
            us(t).forEach(e => {
                const d = e.name, sxCatHit = Boolean(sxReview && sxReview.has(catId(d))), sxSubHit = Boolean(sxReview && (e.subcategories || []).some(s => sxReview.has(Un(d, s.name))));
                if (sxReview && !sxCatHit && !sxSubHit) return;
                const u = Boolean(e.risk), p = document.createElement("details");
                p.className = "outline-branch", p.dataset.outlineBranch = d, p.open = sxReview && !i ? !1 : !i || a.has(d);
                const h = document.createElement("summary"), g = document.createElement("span"), m = document.createElement("span"), f = document.createElement("span"), y = "Collapse or expand this branch. The topic total stays fixed for this list session.";
                if (g.className = "outline-branch-disclosure", g.textContent = "›", g.tabIndex = 0, 
                g.dataset.tooltipTapFirst = "", g.dataset.outlineDisclosureTooltip = y, g.setAttribute("aria-label", y), 
                g.setAttribute("aria-expanded", "false"), m.className = "outline-branch-title outline-description-trigger", m.setAttribute("role", "heading"), m.setAttribute("aria-level", "2"), 
                m.textContent = d, m.dataset.outlineDescription = lo({
                    id: catId(d),
                    label: d,
                    branch: d,
                    kind: "Category"
                }), u) {
                    const e = document.createElement("span");
                    e.className = "outline-risk", e.textContent = "*", e.setAttribute("aria-label", "Higher-risk practice requiring specialized knowledge and explicit negotiation"), 
                    m.append(e);
                }
                f.className = "outline-branch-count", h.append(g, m, f), p.append(h);
                const b = Es(ge[d], {
                    id: catId(d),
                    label: d,
                    branch: d,
                    kind: "Category"
                }, !0);
                b && (h.classList.add("has-popularity-icon"), g.after(b));
                const v = document.createElement("div");
                v.className = "outline-rows";
                const w = new Map, k = new Map, x = function(e = {}) {
                    const t = {
                        limit: Math.max(3, Number(e.limit) || 3),
                        categoryExpanded: Boolean(e.categoryExpanded),
                        eligibleIds: new Set,
                        expandedSubcategories: new Set(e.expandedSubcategoryIds || []),
                        subcategoryLimits: new Map(e.subcategoryLimits || []),
                        subcategoryOverviewLimits: new Map
                    };
                    return {
                        get limit() {
                            return t.limit;
                        },
                        isCategoryExpanded: () => t.categoryExpanded,
                        setCategoryExpanded: e => (t.categoryExpanded = Boolean(e), t.categoryExpanded),
                        setLimit: e => (t.limit = Math.max(3, Number(e) || 3), t.limit),
                        advance() {
                            return this.setLimit(t.limit + 3);
                        },
                        eligibleIds: e => (t.eligibleIds = new Set(e()), t.eligibleIds),
                        isSubcategoryExpanded: e => t.expandedSubcategories.has(e),
                        refreshSubcategoryOverview(e, n) {
                            t.subcategoryOverviewLimits.set(e, n), t.expandedSubcategories.has(e) || t.subcategoryLimits.set(e, n);
                        },
                        subcategoryLimit: e => t.subcategoryLimits.get(e) || 0,
                        setSubcategoryLimit: (e, n) => (t.subcategoryLimits.set(e, Math.max(0, Number(n) || 0)), t.subcategoryLimits.get(e) || 0),
                        toggleSubcategory: (e, n) => t.expandedSubcategories.has(e) ? (t.expandedSubcategories.delete(e), 
                        t.subcategoryLimits.set(e, t.subcategoryOverviewLimits.get(e) ?? 0), !1) : (t.expandedSubcategories.add(e), 
                        t.subcategoryLimits.set(e, n), !0)
                    };
                }({
                    limit: l.get(d),
                    categoryExpanded: !!r && r.has(d),
                    expandedSubcategoryIds: Array.from(o || []),
                    subcategoryLimits: c
                });
                e.topics.forEach((n, a) => {
                    const r = Vn(e, sxName(n));
                    let o = v, l = null;
                    if (r) {
                        const e = Un(d, r.name);
                        if (l = e, !w.has(e)) {
                            const t = document.createElement("div"), n = document.createElement("div"), i = document.createElement("span"), a = document.createElement("span"), o = document.createElement("span"), s = document.createElement("div"), l = "Shows the most popular kinks. Click to expand and show all kinks in this subcategory.";
                            t.className = "outline-subcategory", t.dataset.outlineSubcategory = e, t.dataset.subcategoryExpanded = x.isSubcategoryExpanded(e) ? "true" : "false", 
                            x.isSubcategoryExpanded(e) && t.classList.add("is-expanded"), i.className = "outline-branch-disclosure outline-subcategory-disclosure", 
                            i.textContent = "›", i.tabIndex = 0, i.dataset.tooltipTapFirst = "", i.dataset.outlineDisclosureTooltip = l, 
                            i.setAttribute("aria-label", l), i.setAttribute("role", "button"), i.setAttribute("aria-expanded", x.isSubcategoryExpanded(e) ? "true" : "false"), 
                            a.className = "outline-subcategory-title outline-description-trigger", a.textContent = r.name, 
                            a.dataset.outlineDescription = lo({
                                id: e,
                                label: r.name,
                                branch: d,
                                kind: "Subcategory"
                            }), o.className = "outline-subcategory-count", o.textContent = `0 of ${r.topics.length} shown`, 
                            n.className = "outline-subcategory-summary", n.setAttribute("role", "button"), n.tabIndex = 0, 
                            n.setAttribute("aria-expanded", x.isSubcategoryExpanded(e) ? "true" : "false"), 
                            s.className = "outline-subcategory-rows", n.append(i, a, o), t.append(n, s), v.append(t), 
                            w.set(e, {
                                group: t,
                                summary: n,
                                rows: s,
                                count: o,
                                name: r.name
                            });
                            const c = Es(Ae(r.name, d), {
                                id: e,
                                label: r.name,
                                branch: d,
                                kind: "Subcategory",
                                topics: r.topics
                            });
                            c && (n.classList.add("has-popularity-icon"), i.after(c));
                        }
                        o = w.get(e).rows;
                    }
                    const c = Wn(n), p = function(e, t = e => e) {
                        return U(e, e => sxTopicPopularity(e, t(e)?.label), e => {
                            const n = t(e) || e;
                            return n?.label || e;
                        });
                    }(ai(c, t).filter(e => (at[t] || {})[e]), e => (at[t] || {})[e]), h = i ? s.has(c) : (sxReview ? !1 : function(e, t) {
                        if (!e.length) return !1;
                        let n = !1, i = !0;
                        return e.forEach(e => {
                            const a = ca(e, t), r = Ge(e, t).keys.map(e => Boolean(a[e + "Known"]));
                            r.some(Boolean) && (n = !0), r.every(Boolean) || (i = !1);
                        }), n && !i;
                    }(p, t)), g = As({
                        id: c,
                        label: n,
                        branch: d,
                        kind: "Topic",
                        risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                        expandable: p.length > 0,
                        expanded: h
                    }, t);
                    if (g.dataset.outlineBranch = d, g.dataset.outlineTopicRank = String(e.outlineTopicRanks?.get(c) ?? a), 
                    l) {
                        const e = k.get(l) || 0;
                        g.dataset.outlineSubcategoryRank = String(e), k.set(l, e + 1);
                    }
                    o.append(g), p.forEach(e => {
                        const n = As({
                            id: e,
                            label: (at[t] || {})[e].label || e,
                            branch: d,
                            kind: "Imported",
                            risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                            parentId: c
                        }, t);
                        n.hidden = !h, o.append(n);
                    });
                });
                const S = document.createElement("button");
                S.type = "button", S.className = "outline-more", n(S, '<span class="outline-more-label"></span>'), 
                h.append(S), p.append(v), Ro.append(p);
                const $ = e => {
                    const n = Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineTopicRank) - Number(t.dataset.outlineTopicRank)), i = Array.from(v.querySelectorAll(".outline-row[data-outline-id]")), a = x.setLimit(e);
                    p.dataset.outlineVisible = String(a);
                    const r = x.eligibleIds(() => i.filter(e => !ls(e.dataset.outlineId, t) || os.has(e.dataset.outlineId)).map(e => e.dataset.outlineId)), o = n.filter(e => r.has(e.dataset.outlineId)), s = Math.min(o.length, a), l = new Set(o.slice(0, s).map(e => e.dataset.outlineId)), priorRated = Uo.checked ? n.filter(e => ls(e.dataset.outlineId, t) && !os.has(e.dataset.outlineId)) : [], c = new Set(o.slice(0, 3).map(e => e.dataset.outlineId));
                    priorRated.forEach(e => l.add(e.dataset.outlineId));
                    w.forEach((e, t) => {
                        const n = Array.from(e.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineSubcategoryRank) - Number(t.dataset.outlineSubcategoryRank)), i = x.isSubcategoryExpanded(t) ? n : n.filter(e => r.has(e.dataset.outlineId)), a = i.filter(e => c.has(e.dataset.outlineId)).length;
                        x.refreshSubcategoryOverview(t, a), i.slice(0, Math.min(i.length, x.subcategoryLimit(t))).forEach(e => l.add(e.dataset.outlineId)), 
                        e.localRows = n, e.localEligible = i;
                    }), n.forEach(e => {
                        const t = l.has(e.dataset.outlineId), isPriorRating = Uo.checked && priorRated.includes(e);
                        e.hidden = !t, e.style.order = isPriorRating ? "2" : "";
                        const n = e.querySelector('.outline-topic-label[data-outline-expandable="true"]'), i = n && "false" !== n.getAttribute("aria-expanded");
                        $s(v, e.dataset.outlineId).forEach(e => {
                            e.hidden = !t || !i || !r.has(e.dataset.outlineId), e.style.order = isPriorRating ? "2" : "";
                        });
                    });
                    const u = n.filter(e => !e.hidden), h = o.filter(e => !l.has(e.dataset.outlineId)).length;
                    f.textContent = `${u.length} of ${n.length} shown`;
                    const m = x.isCategoryExpanded();
                    p.classList.toggle("is-expanded", m), g.setAttribute("aria-expanded", String(m)), 
                    w.forEach((e, t) => {
                        const n = e.localRows.filter(e => !e.hidden).length;
                        e.localEligible.filter(e => !l.has(e.dataset.outlineId)).length, e.count.textContent = `${n} of ${e.localRows.length} shown`, 
                        e.group.dataset.outlineSubcategoryVisible = String(x.subcategoryLimit(t));
                        const i = x.isSubcategoryExpanded(t);
                        e.group.dataset.subcategoryExpanded = i ? "true" : "false", e.group.classList.toggle("is-expanded", i), 
                        e.summary.setAttribute("aria-expanded", String(i)), e.summary.querySelector(".outline-subcategory-disclosure")?.setAttribute("aria-expanded", String(i)), 
                        e.group.hidden = !i && 0 === n;
                    }), S.hidden = h <= 0, S.dataset.outlineVisible = String(a), S.setAttribute("aria-label", h > 0 ? `${ss} topics in ${d}` : `All available topics shown in ${d}`), 
                    S.querySelector(".outline-more-label").textContent = h > 0 ? ss : "";
                };
                w.forEach((e, t) => {
                    const n = () => {
                        const n = e.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        x.isSubcategoryExpanded(t) || getOutlineRows(e.rows).forEach(e => os.delete(e.dataset.outlineId)), 
                        x.toggleSubcategory(t, window.__sxFetLifeReview ? Math.min(3, n) : n), $(x.limit);
                    };
                    e.summary.addEventListener("click", e => {
                        e.preventDefault(), n();
                    }), e.summary.addEventListener("keydown", e => {
                        "Enter" !== e.key && " " !== e.key || __sxClosestAction(e.target, "outlineSubcategoryDisclosure") || (e.preventDefault(), 
                        n());
                    });
                }), p._syncOutlineVisibility = $, p.addEventListener("toggle", () => {
                    p.open ? (getOutlineRows(p).forEach(e => os.delete(e.dataset.outlineId)), 
                    $(x.limit)) : (p.classList.remove("is-expanded"), g.setAttribute("aria-expanded", "false"));
                });
                const E = () => {
                    if (p.open || (p.open = !0), x.isCategoryExpanded()) x.setCategoryExpanded(!1), 
                    w.forEach((e, t) => {
                        x.isSubcategoryExpanded(t) && x.toggleSubcategory(t, 0);
                    }), $(3); else {
                        x.setCategoryExpanded(!0), getOutlineRows(p).forEach(e => os.delete(e.dataset.outlineId));
                        const e = v.querySelectorAll(".outline-row[data-outline-topic-rank]").length;
                        $(Math.max(e, 3));
                    }
                };
                p._toggleOutlineCategory = E, h.addEventListener("click", e => {
                    e.preventDefault(), Rs && e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") === Rs || E();
                }), $(x.limit), S.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation();
                    const t = new Set(Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).filter(e => e.hidden));
                    $(x.advance());
                    const n = Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineTopicRank) - Number(t.dataset.outlineTopicRank)).find(e => t.has(e) && !e.hidden)?.querySelector(".outline-topic-label");
                    n?.focus({
                        preventScroll: !0
                    });
                });
                const sxHits = window.__sxOutlineHits;
                if (sxHits && sxHits.size && !sxReview) {
                    sxHits.has(catId(d)) && (p.open = !0);
                    w.forEach((grp, subId) => {
                        if (!sxHits.has(subId)) return;
                        p.open = !0, x.isSubcategoryExpanded(subId) ? x.setSubcategoryLimit(subId, Math.max(3, x.subcategoryLimit(subId))) : x.toggleSubcategory(subId, 3);
                        const total = grp.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        if (total > 3) {
                            const btn = document.createElement("button");
                            btn.type = "button", btn.className = "outline-more outline-more-subcategory", btn.setAttribute("aria-label", `Show the next three popular topics in ${grp.name}`), n(btn, '<span class="outline-more-label">+3 more</span>'), btn.hidden = x.subcategoryLimit(subId) >= total, btn.addEventListener("click", ev => {
                                ev.preventDefault(), ev.stopPropagation(), x.setSubcategoryLimit(subId, Math.min(total, x.subcategoryLimit(subId) + 3)), $(x.limit), btn.hidden = x.subcategoryLimit(subId) >= total;
                            }), grp.rows.append(btn);
                        }
                    }), $(x.limit);
                }
                if (sxReview) {
                    // Review mode: branches stay collapsed (no auto-expand).
                    // When only some subcategories of this category were
                    // hit, hide the other subcategory groups and the
                    // category's own direct topic rows; hit subcategories
                    // get the same top-3 “+3 more” stepper the auto-expand
                    // path uses, revealed when the user expands them.
                    if (!sxCatHit) w.forEach((grp, subId) => {
                        sxReview.has(subId) || (grp.group.style.display = "none");
                    }), Array.from(v.querySelectorAll(":scope > .outline-row")).forEach(r => r.style.display = "none");
                    w.forEach((grp, subId) => {
                        if (!sxCatHit && !sxReview.has(subId)) return;
                        const total = grp.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        if (total > 3) {
                            const btn = document.createElement("button");
                            btn.type = "button", btn.className = "outline-more outline-more-subcategory", btn.setAttribute("aria-label", `Show the next three popular topics in ${grp.name}`), n(btn, '<span class="outline-more-label">+3 more</span>'), btn.hidden = x.subcategoryLimit(subId) >= total, btn.addEventListener("click", ev => {
                                ev.preventDefault(), ev.stopPropagation(), x.setSubcategoryLimit(subId, Math.min(total, x.subcategoryLimit(subId) + 3)), $(x.limit), btn.hidden = x.subcategoryLimit(subId) >= total;
                            }), grp.rows.append(btn);
                        }
                    });
                }
            }), sxApplyOutlineSearch(), ws();
        }
        function Ms(n = Vi()) {
            p("quickstart_started");
            const i = n === Et;
            if (!i && !vt[n]) return Vy = e => Ms(e), void bw(null);
            const a = i ? null : St(mt[n]).outline, r = cs(n);
            Jo = r.total > 0 && r.rated === r.total, t.clear(Xo), Xo = 0, Go = n, Ko = null, 
            Yo = 1e3 * (a?.durationSeconds || 0), Zo = Jo, Qo = Boolean(a?.timerRan) || !Zo, 
            Vo = Zo ? 0 : Date.now(), !Jo && Zo && (Zo = !1, Vo = Date.now(), Qo = !0), Uo.checked = !1, 
            e.byId("doneOutlineButton").textContent = i ? "Create profile from ratings" : "Submit what you’ve got", 
            pw(!i), Cs(), hs(), Zo || (Xo = t.setInterval(ws, 1e3));
            const o = e.byId("outlineQuickstartTip");
            o && (o.hidden = is), Wi(Do), Ro.scrollTop = 0, Ro.scrollLeft = 0, requestAnimationFrame(() => (Ro.scrollTop = 0, Ro.scrollLeft = 0, Do.querySelector("summary")?.focus()));
        }
        function Is(n = !0, skipPaint = !1) {
            if (!Do.open) return;
            sxOutlineSortMode = "popularity", window.__sxFetLifeReview = null;
            window.__sxOnDeckClear && window.__sxOnDeckClear();
            try {
                bs();
            } catch (e) { __sxErrLog("ui-refresh", e); }
            js(), pw(!1);
            const i = Go;
            if (n && i && vt[i] && Qo) {
                const e = cs(i);
                $t(i, "outline", ps(), e.rated, e.total, {
                    timerRan: !0
                });
            }
            t.clear(Xo), Xo = 0, Ui(Do), e.byId("doneOutlineButton").textContent = i === Et ? "Create profile from ratings" : "Submit what you’ve got", 
            Go = null, Ko = null, Vo = 0, Yo = 0, Zo = !0, Qs = !1, Qo = !1, Jo = !1;
            const a = zo;
            zo = null, Ys(a);
            const r = i === Et && Object.keys(At).length > 0;
            i && vt[i] || r ? (ji(i, {
                forceRated: !Bi(i)
            }), Jw(), skipPaint || (Mr({
                animate: !1,
                forceRepaint: !0
            }), Ih())) : skipPaint || Mr();
            let o = String(location.hash || "");
            try {
                o = decodeURIComponent(o);
            } catch (e) { __sxErrLog("hash-decode", e); }
            /^#\/?(app\/)?(?:list|listview)\/?$/i.test(o) && (history.replaceState(null, "", "#app"), 
            rS = !1), vc();
        }
        // Non-route list-close chunk + indicate (2026-10-28): the
        // Is() fix (Option 1) made route-bound closes skip Is()'s
        // paint entirely, but the NON-route closes — Submit, Escape,
        // backdrop, cancel — still paint once via Is(), synchronously
        // and unindicated. This wrapper gives exactly those closes
        // the route render's treatment, modeled on sxRouteRender:
        // arm the "Building your map…" overlay session
        // (__sxLoadSessionStart — its map-complete gate holds the
        // session through any settle/blit tail after the paint) and
        // the #9 paintbrush pill (__sxPillSessionStart/Finish), defer
        // the close behind the house double-rAF + setTimeout(0)
        // pattern so the armed state paints before work begins, and
        // set the one-shot __sxCloseChunkPaint flag immediately
        // before the close runs so Is()'s Mr consumes it and paints
        // chunked. The pill finishes on the overlay session's
        // onDone — the same completion signal sxRouteRender uses —
        // so pill, overlay and tail share exactly one window and
        // clear together. No button is marked: Submit and cancel are
        // dialog buttons that vanish at close, and Escape / backdrop
        // press no button at all, so there is no persistent button
        // for these closes. When either surface cannot arm (a
        // session is already active), or the map sits in its
        // safe-fallback state (jn — Mr would refuse the paint and no
        // checkpoint would ever drive an armed session), the close
        // runs exactly as before: synchronous, unflagged, inside
        // this call. Route-bound closes never pass through here —
        // the hashchange handler's skipPaint path is untouched.
        function sxChunkClose(run) {
            let pillToken = null, armed = !1;
            const pillDone = () => {
                if (!pillToken) return;
                const t = pillToken;
                pillToken = null;
                try {
                    window.__sxPillSessionFinish(t);
                } catch (e) { __sxErrLog("close-paint-pill-finish", e); }
            };
            if (!jn) try {
                if ("function" == typeof window.__sxPillSessionStart) pillToken = window.__sxPillSessionStart({
                    button: null
                });
                if ("function" == typeof window.__sxLoadSessionStart) armed = !!window.__sxLoadSessionStart({
                    onDone: pillDone
                });
            } catch (e) { __sxErrLog("close-paint-arm", e); }
            const doClose = () => {
                if (armed && Do.open) window.__sxCloseChunkPaint = 50;
                run();
                if (!armed) pillDone();
            };
            if (armed && window.requestAnimationFrame) requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(doClose, 0))); else doClose();
        }
        function Ps() {
            as = null, Ui(e.byId("outlinePayoffDialog"));
        }
        function Ls(t, n) {
            !(t && vt[t] && n) || n.rated < 1 || rs.has(t) || (rs.add(t), as = t, e.byId("outlinePayoffMessage").textContent = `${n.rated} topic${1 === n.rated ? " is" : "s are"} rated. Use them now, even if you want to finish the rest later.`, 
            Wi(e.byId("outlinePayoffDialog")), e.byId("outlinePayoffStory").hidden = Yi().length < 1, requestAnimationFrame(() => (Yi().length < 1 ? e.byId("outlinePayoffCard") : e.byId("outlinePayoffStory")).focus({
                preventScroll: !0
            })));
        }
        function Ts(e) {
            return e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY) ? {
                x: e.clientX,
                y: e.clientY,
                pointerType: e.pointerType || "mouse"
            } : null;
        }
        const Fs = (() => {
            const n = e.byId("uiTooltip"), i = e.byId("uiTooltipName"), a = e.byId("uiTooltipDefinition"), r = e.byId("uiTooltipValue");
            let o = null, s = null, l = 0;
            function c() {
                t.clear(l), l = 0, o?.isConnected && "uiTooltip" === o.getAttribute("aria-describedby") && o.removeAttribute("aria-describedby"), 
                o = null, s = null, n.classList.remove("ui-tooltip--panel"), n.hidden = !0, i.textContent = "", a.textContent = "", r.textContent = "", 
                n.parentNode !== document.body && document.body.appendChild(n);
            }
            function d(e = s, t = o) {
                s = e, t && t.isConnected && !n.hidden && function(e, t, n) {
                    if (!e || e.hidden) return;
                    const i = e.getBoundingClientRect(), a = 12, r = Math.max(8, innerWidth - i.width - 8), o = Math.max(8, innerHeight - i.height - 8);
                    let s, l;
                    if (t && Number.isFinite(t.x) && Number.isFinite(t.y)) "touch" === t.pointerType ? (s = t.x - i.width / 2, 
                    l = t.y - i.height - a - 10, l < 8 && (l = t.y + a + 10)) : (s = t.x + a, l = t.y + a, 
                    s + i.width > innerWidth - 8 && (s = t.x - i.width - a), l + i.height > innerHeight - 8 && (l = t.y - i.height - a)); else {
                        if (!n || !n.isConnected) return;
                        {
                            const e = n.getBoundingClientRect();
                            s = e.left + e.width / 2 - i.width / 2, l = e.bottom + 7, l + i.height > innerHeight - 8 && (l = e.top - i.height - 7);
                        }
                    }
                    e.style.left = `${Math.max(8, Math.min(r, s))}px`, e.style.top = `${Math.max(8, Math.min(o, l))}px`;
                }(n, s, t);
            }
            return {
                element: n,
                show: function(e, u = {}) {
                    if (!e) return void c();
                    const p = function(e, t = {}) {
                        const n = e?.dataset || {}, i = "string" == typeof t ? {
                            definition: t
                        } : t, a = i.name ?? n.tooltipName ?? function(e) {
                            const t = e?.dataset?.tooltipName;
                            if (t) return t;
                            const n = e?.getAttribute?.("aria-label") || "";
                            return n ? n.replace(/\.(?:\s|$)[\s\S]*$/, "").replace(/\s+(?:concept line|topic symbol|branch symbol)$/i, "").trim() : String(e?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90) || "Details";
                        }(e), r = i.definition ?? n.tooltipDefinition ?? n.uiTooltip ?? "", o = i.value ?? n.tooltipValue ?? "";
                        return {
                            name: String(a || "Details"),
                            definition: String(r || ""),
                            value: null == o ? "" : String(o)
                        };
                    }(e, u);
                    if (!p.name && !p.definition && !p.value) return void c();
                    t.clear(l), o && o !== e && o.isConnected && "uiTooltip" === o.getAttribute("aria-describedby") && o.removeAttribute("aria-describedby"), 
                    o = e, s = u.point ?? null, n.classList.toggle("ui-tooltip--panel", Boolean(e.closest && e.closest(".layout-editor"))), i.textContent = p.name, a.textContent = p.definition, 
                    a.hidden = !p.definition, r.textContent = p.value;
                    const h = (e.closest ? e.closest("dialog") : null) || (Do.open ? Do : document.body);
                    n.parentNode !== h && h.appendChild(n), n.hidden = !1, e.setAttribute("aria-describedby", "uiTooltip"), 
                    d(s, e), u.autoHide && (l = t.setTimeout(() => {
                        o === e && c();
                    }, Number(u.duration) || 3200));
                },
                hide: c,
                position: d,
                visibleFor: function(e) {
                    return !n.hidden && o === e;
                },
                get anchor() {
                    return o;
                },
                get point() {
                    return s;
                }
            };
        })();
        let Ns = null, _s = null, Ds = null, Rs = null, Os = 0;
        const Bs = window.matchMedia ? window.matchMedia("(hover: hover)") : {
            matches: !0
        };
        function js() {
            Ns && Fs.visibleFor(Ns) && Fs.hide(), Ns = null, _s = null;
        }
        function qs(e, t, n = null) {
            if (!e || !t) return void js();
            Ns = e, _s = n;
            const i = getOutlineRow(e), a = i?.dataset.outlineId, r = e.querySelector?.("[data-outline-direction]")?.dataset.outlineDirection, o = a && r ? ca(a, Go) : null, s = o && Boolean(o[r + "Known"]), l = e.dataset.tooltipValue || (r ? s ? ba(o[r]) : "Unrated" : /(?:rating|popularity)\s*([+-]?\d+(?:\.\d+)?(?:\/100|%)?)/i.exec(t)?.[1] || "");
            Fs.show(e, {
                name: e.dataset.tooltipName || Hs(e),
                definition: e.dataset.popularityTooltip ? t.split("\n").slice(1).join("\n") : t,
                value: l,
                point: n
            });
        }
        function Hs(e) {
            return e.dataset.popularityTooltip ? "Popularity" : e.dataset.ratingTooltip ? e.querySelector?.(".outline-rating-label")?.textContent?.trim() || "Rating" : getOutlineRow(e)?.querySelector?.(".outline-topic-label")?.textContent?.trim() || e.getAttribute("aria-label") || "Topic details";
        }
        function Ws(e, t) {
            qs(e, e?.dataset.outlineDescription || "", t);
        }
        function Us(e) {
            return e instanceof Element ? __sxClosestAction(e, "outlineTooltipSource") : null;
        }
        function Gs(e) {
            return e?.dataset.outlineDisclosureTooltip || e?.dataset.outlineDescription || e?.dataset.popularityTooltip || e?.dataset.ratingTooltip || "";
        }
        function Ks() {
            Ds?.timer && t.clear(Ds.timer), Ds = null;
        }
        function zs(e) {
            Rs = e, t.clear(Os), Os = t.setTimeout(() => {
                Rs = null;
            }, 900);
        }
        function Vs(e) {
            if ("true" !== e.dataset.outlineExpandable) return !1;
            const t = getOutlineRow(e), n = t?.dataset.outlineId;
            if (!n) return !1;
            const i = !("false" !== e.getAttribute("aria-expanded"));
            return e.setAttribute("aria-expanded", String(i)), $s(Ro, n).forEach(e => {
                e.hidden = !i;
            }), !0;
        }
        function Ys(e = zo) {
            if (e) {
                e.input.classList.remove("is-dragging", "is-clear-preview"), e.thumb?.remove();
                try {
                    e.input.hasPointerCapture?.(e.pointerId) && e.input.releasePointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
            }
        }
        function Xs(e) {
            const t = zo;
            if (!t || t.pointerId !== e.pointerId) return;
            const n = t.rect, i = e.clientX < n.left - 18 || e.clientX > n.right + 18;
            t.clear = i, t.input.classList.toggle("is-clear-preview", i), t.thumb.style.left = `${e.clientX}px`, 
            t.thumb.style.top = `${e.clientY}px`, t.thumb.style.background = i ? "var(--red-deep)" : zi(Number(t.input.value));
        }
        Ro.addEventListener("pointerover", e => {
            if ("mouse" !== e.pointerType || !Bs.matches) return;
            const t = Us(e.target);
            t && !t.contains(e.relatedTarget) && qs(t, Gs(t), Ts(e));
        }), Ro.addEventListener("pointermove", e => {
            if ("mouse" !== e.pointerType || !Ns || !Fs.visibleFor(Ns)) return;
            const t = Us(e.target);
            t && Ns === t && (_s = Ts(e), Fs.position(_s, Ns));
        }), Ro.addEventListener("pointerout", e => {
            if ("mouse" !== e.pointerType || !Bs.matches) return;
            const t = Us(e.target);
            if (!t || t.contains(e.relatedTarget)) return;
            const n = Us(e.relatedTarget);
            n ? qs(n, Gs(n), Ts(e)) : js();
        }), Ro.addEventListener("focusin", e => {
            const t = Us(e.target);
            t && qs(t, Gs(t));
        }), Ro.addEventListener("click", e => {
            const t = e.target instanceof Element ? __sxClosestAction(e.target, "glancePracticeIcon") : null;
            var n, i;
            t && (e.preventDefault(), e.stopPropagation(), n = t, i = Ts(e), qs(n, n?.dataset.popularityTooltip || "", i));
        }, !0), Ro.addEventListener("focusout", e => {
            const t = Us(e.target);
            t && !t.contains(e.relatedTarget) && js();
        }), Ro.addEventListener("selectstart", e => {
            e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") && e.preventDefault();
        }), Ro.addEventListener("contextmenu", e => {
            e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") && e.preventDefault();
        }), Ro.addEventListener("pointerdown", e => {
            if (e.target instanceof Element && __sxClosestAction(e.target, "glancePracticeIcon")) return;
            const n = e.target instanceof Element ? __sxClosestAction(e.target, "outlineDescTriggerRich") : null;
            if (!n) return Ks(), void js();
            if (("mouse" === e.pointerType || "pen" === e.pointerType) && 0 !== e.button) return;
            Ks();
            const i = {
                pointerId: e.pointerId,
                trigger: n,
                startX: e.clientX,
                startY: e.clientY,
                longPressed: !1,
                timer: 0
            };
            i.timer = t.setTimeout(() => {
                Ds === i && (i.longPressed = !0, zs(n), Ws(n, {
                    x: i.startX,
                    y: i.startY,
                    pointerType: e.pointerType || "touch"
                }));
            }, 520), Ds = i;
        }), window.addEventListener("pointermove", e => {
            const t = Ds;
            if (t && t.pointerId === e.pointerId) return t.longPressed ? (_s = Ts(e), void Fs.position(_s, Ns)) : void (Math.hypot(e.clientX - t.startX, e.clientY - t.startY) > 9 && Ks());
        }, !0), window.addEventListener("pointerup", e => {
            const n = Ds;
            n && n.pointerId === e.pointerId && (n.timer && t.clear(n.timer), n.longPressed && zs(n.trigger), 
            Ds = null);
        }, !0), window.addEventListener("pointercancel", Ks, !0), Ro.addEventListener("contextmenu", e => {
            const t = __sxClosestAction(e.target, "outlineDescTriggerRich");
            t && Rs === t && (e.preventDefault(), e.stopPropagation());
        }, !0), Ro.addEventListener("click", e => {
            const n = __sxClosestAction(e.target, "outlineDescTriggerRich");
            if (n) return Rs === n ? (Rs = null, t.clear(Os), e.preventDefault(), void e.stopPropagation()) : void (__sxClosestAction(n, "summaryAncestor") ? js() : Vs(n) && (e.preventDefault(), 
            e.stopPropagation()));
        }), Ro.addEventListener("keydown", e => {
            const t = __sxClosestAction(e.target, "outlineBranchDisclosure");
            if (t && ("Enter" === e.key || " " === e.key)) {
                e.preventDefault(), e.stopPropagation();
                const n = __sxClosestAction(t, "outlineSubcategory");
                if (n) return void n.querySelector(":scope>.outline-subcategory-summary")?.click();
                const i = __sxClosestAction(t, "outlineBranch");
                return void (i && (i._toggleOutlineCategory ? i._toggleOutlineCategory() : i.open = !i.open));
            }
            const n = __sxClosestAction(e.target, "outlineDescTriggerRich");
            if (n && ("Enter" === e.key || " " === e.key)) return e.shiftKey ? (e.preventDefault(), 
            e.stopPropagation(), void (Ns === n && Fs.visibleFor(n) ? js() : Ws(n))) : void (__sxClosestAction(n, "summaryAncestor") || Vs(n) && (e.preventDefault(), 
            e.stopPropagation()));
        }), Ro.addEventListener("scroll", js, {
            passive: !0
        }), Ro.addEventListener("input", e => {
            const t = __sxClosestAction(e.target, "outlineNoteInput");
            if (t && Go) {
                const e = getOutlineRow(t), n = e.dataset.outlineId, i = t.value.trim();
                tt[Go] || (tt[Go] = {}), i ? tt[Go][n] = [ i ] : delete tt[Go][n], zt(Go);
                const a = getOutlineCell(e, "note");
                return void (a && (a.dataset.hasNote = String(Boolean(i))));
            }
            const n = __sxClosestAction(e.target, "outlineDirection");
            if (!n || !Go) return;
            const i = getOutlineRow(n).dataset.outlineId;
            "milestoneStartRated" in n.dataset || (n.dataset.milestoneStartRated = String(cs(Go).rated)), 
            To(i, n.dataset.outlineDirection, Number(n.value), !1, Go), os.add(i), Ss(getOutlineRow(n)), 
            ws();
        }), Ro.addEventListener("change", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            const n = Number(t.dataset.milestoneStartRated);
            delete t.dataset.milestoneStartRated, os.add(getOutlineRow(t).dataset.outlineId), checkMilestoneTransition(Go, n);
        }), Ro.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "outlineNote");
            if (t && Go) {
                const e = getOutlineRow(t), n = e.querySelector(".outline-note-editor"), i = n.hidden;
                return n.hidden = !i, t.setAttribute("aria-expanded", String(i)), void (i && requestAnimationFrame(() => getOutlineCell(e, "note-input")?.focus({
                    preventScroll: !0
                })));
            }
            const n = __sxClosestAction(e.target, "outlineMarkFlag");
            if (!n || !Go) return;
            const previousRatedCount = cs(Go).rated, i = getOutlineRow(n), a = i.dataset.outlineId;
            if (n.dataset.outlineFlag) {
                const e = "fantasy" === n.dataset.outlineFlag ? Je : et;
                e[Go] || (e[Go] = {}), e[Go][a] ? delete e[Go][a] : e[Go][a] = !0;
            } else {
                const e = n.dataset.outlineMark, t = (Qe[Go] || {})[a] || "";
                Qe[Go][a] = t === e ? "" : e, Qe[Go][a] || delete Qe[Go][a];
            }
            zt(Go), os.add(a), Ss(i), ws(), vc(), checkMilestoneTransition(Go, previousRatedCount);
        }), Ro.addEventListener("keydown", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            if (gs(), "Delete" !== e.key && "Backspace" !== e.key) return;
            e.preventDefault();
            const n = getOutlineRow(t);
            Fo(n.dataset.outlineId, t.dataset.outlineDirection, !1, Go), ls(n.dataset.outlineId, Go) ? os.add(n.dataset.outlineId) : os.delete(n.dataset.outlineId), 
            Ss(n), ws();
        }), Ro.addEventListener("pointerdown", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            gs(), Ys();
            const n = document.createElement("span");
            n.className = "outline-drag-thumb", n.setAttribute("aria-hidden", "true"), document.body.append(n), 
            zo = {
                input: t,
                rect: t.getBoundingClientRect(),
                pointerId: e.pointerId,
                clear: !1,
                thumb: n
            }, t.classList.add("is-dragging");
            try {
                t.setPointerCapture(e.pointerId);
            } catch (e) { __sxErrLog("pointer-capture", e); }
            Xs(e);
        }), window.addEventListener("pointermove", Xs, !0), window.addEventListener("pointerup", e => {
            if (!zo || zo.pointerId !== e.pointerId) return;
            Xs(e);
            const t = zo, {input: n, clear: i} = t;
            if (zo = null, Ys(t), !Go) return;
            const previousRatedCount = Number(n.dataset.milestoneStartRated), a = getOutlineRow(n);
            delete n.dataset.milestoneStartRated, i ? Fo(a.dataset.outlineId, n.dataset.outlineDirection, !1, Go) : To(a.dataset.outlineId, n.dataset.outlineDirection, Number(n.value), !0, Go), 
            Ss(a), ws(), ls(a.dataset.outlineId, Go) ? os.add(a.dataset.outlineId) : os.delete(a.dataset.outlineId), 
            checkMilestoneTransition(Go, previousRatedCount);
        }, !0), window.addEventListener("pointercancel", e => {
            if (!zo || zo.pointerId !== e.pointerId) return;
            const t = zo;
            zo = null, Ys(t);
        }, !0);
        let Zs = 0, Qs = !1;
        function Js(e, t = {}) {
            // Tab-switch camera fix (2026-10-30): profile activation
            // re-renders via Mr() but never refit, so the camera kept
            // whatever zoom/pan the previous view left behind. Refit
            // on activation, the same fitted state a fresh load ends
            // in; Ih()'s settle chain re-fits again if this render
            // paints in chunks. Detail level and profile data are
            // untouched.
            if (!vt[e]) return;
            ft[e] && "group" === ft[e].kind ? (sxHoldExpansion(), sxExpandGroupMap()) : sxReleaseExpansion();
            kw(), xw(), Sw(), sxDeactivateMatchStage(), wf && Lw(), It = e, Mt = e, Nt = null, Jw();

            // Layer Vault (Step 1): If this profile was already rendered with
            // identical state, restore its DOM fragment instantly (< 5ms).
            if (sxVaultTryRestore(e)) {
                try { vc(); } catch (_) {}
                window.__sxLoad && window.__sxLoad(100);
                try { Ih(); } catch (_) {}
                return;
            }

            const name = (wt && wt[e]) || e;
            window.__sxRouteChunkPaint = 40;
            if (typeof window.__sxLoadSessionStart === "function") {
                window.__sxLoadSessionStart({
                    label: "Loading " + name + "…"
                });
            }
            const r = Mr({
                animate: !1,
                forceRepaint: !0
            });
            if (r && typeof r.then === "function") {
                r.then(() => { Ih(); });
            } else {
                Ih();
            }
        }
        function el(e) {
            if (!vt[e]) return;
            const t = an;
            en.has(e) ? sxSel(e, "remove") : (!en.size && Mt && vt[Mt] && (sxSel(Mt), la(Mt)), sxSel(e), 
            la(e)), qd = [], Wd = null, Jw();
            if (t) {
                window.__sxRouteChunkPaint = 40;
                if (typeof window.__sxLoadSessionStart === "function") {
                    window.__sxLoadSessionStart({
                        label: "Comparing profiles…"
                    });
                }
                const r = Mr({
                    animate: !1,
                    forceRepaint: !0
                });
                if (r && typeof r.then === "function") {
                    r.then(() => { Ih(); });
                } else {
                    Ih();
                }
            }
        }
        Ho && Ho.addEventListener("click", () => {
            const e = Date.now();
            e - Zs < 300 || (Zs = e, Qs = !1, ks(!Zo));
        }), document.addEventListener("visibilitychange", () => {
            document.hidden ? Zo || (Qs = !0, ZoAuto = !0, ks(!0)) : Qs && (Qs = !1, ZoAuto = !1, ks(!1));
        }), Wo && Wo.addEventListener("click", function() {
            Do && Do.open && Go && (Qs = !1, Yo = 0, Vo = Date.now(), Qo = !0, Zo = !1, t.clear(Xo),
            Xo = t.setInterval(ws, 1e3), hs(), ws());
        }), Uo && Uo.addEventListener("change", () => {
            const n = !Zo;
            ks(Uo.checked), Uo.checked && n && function() {
                try {
                    let n = e.byId("outlineTimerPauseNote");
                    n || (n = document.createElement("div"), n.id = "outlineTimerPauseNote", n.setAttribute("role", "status"), 
                    n.style.cssText = "position:fixed;z-index:9999;pointer-events:none;opacity:0;transition:opacity .3s ease;background:var(--panel,#222);color:var(--ink,#fff);border:1px solid var(--line-strong,#666);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.45);max-width:92vw;overflow:hidden;text-overflow:ellipsis;", 
                    document.body.appendChild(n)), n.textContent = "Timer paused — showing rated topics";
                    const i = e.byId("outlineTimerToggle");
                    if (i) {
                        const e = i.getBoundingClientRect(), t = Math.max(8, Math.min(window.innerWidth - 8, e.left + e.width / 2));
                        n.style.left = t + "px", n.style.transform = "translateX(-50%)", n.style.top = Math.min(window.innerHeight - 60, e.bottom + 8) + "px";
                    }
                    xs && t.clear(xs), requestAnimationFrame(() => {
                        try {
                            n.style.opacity = "1";
                        } catch (e) { __sxErrLog("label-flash", e); }
                    }), xs = t.setTimeout(() => {
                        try {
                            n.style.opacity = "0";
                        } catch (e) { __sxErrLog("label-flash", e); }
                        xs = 0;
                    }, 3e3);
                } catch (e) { __sxErrLog("label-flash", e); }
            }(), Ro && Ro.querySelectorAll(".outline-branch").forEach(e => e._syncOutlineVisibility?.(Number(e.dataset.outlineVisible) || 3));
        }), e.byId("outlineQuickstartDismiss")?.addEventListener("click", () => {
            is = !0, e.byId("outlineQuickstartTip") && (e.byId("outlineQuickstartTip").hidden = !0);
        }), e.byId("doneOutlineButton") && e.byId("doneOutlineButton").addEventListener("click", function() {
            if (!Do || !Do.open || !Go) return;
            const e = Go, t = cs(e), n = ps(), i = Qo;
            if (e === Et) return Vy = e => {
                i && $t(e, "outline", n, t.rated, t.total, {
                    timerRan: !0
                }), requestAnimationFrame(() => Ls(e, t));
            }, sxChunkClose(() => {
                Is(!1), bw(null), sm.textContent = `Create a profile to keep ${t.rated} rated topic${1 === t.rated ? "" : "s"}.`;
            });
            i && $t(e, "outline", n, t.rated, t.total, {
                timerRan: !0
            }), hw("save", e), sxChunkClose(() => {
                Is(!1), xg.textContent = `Submitted ${t.rated} of over 400 topics${i ? ` after ${xt(n)} total` : ""}. Ratings${i ? " and accumulated time" : ""} saved with ${wt[e]}.`, 
                requestAnimationFrame(() => Ls(e, t));
            });
        }), Do && Do.addEventListener("cancel", e => {
            e.preventDefault(), sxChunkClose(() => Is());
        }), /* Build 2026-10-18_0343: the list view has no × button — a tap/click that starts and ends on the dialog backdrop closes it; Escape closes via the cancel handler above. */ Do && Do.addEventListener("pointerdown", e => {
            Do._bk = e.target === Do;
        }), Do && Do.addEventListener("click", e => {
            Do._bk && e.target === Do && sxChunkClose(() => Is()), Do._bk = !1;
        }), e.byId("startListRatingButton")?.addEventListener("click", () => {
            Ms(Vi());
        });
        function sxApplyOutlineSearch() {
            const query = (e.byId("outlineSearch")?.value || "").trim().toLowerCase();
            Ro && Ro.querySelectorAll(".outline-branch").forEach(branch => {
                let anyVisible = false;
                branch.querySelectorAll(".outline-row").forEach(row => {
                    const label = row.querySelector(".outline-topic-label")?.textContent?.toLowerCase() || "";
                    const matches = !query || label.includes(query);
                    row.hidden = !matches;
                    if (matches) anyVisible = true;
                });
                if (query) {
                    branch.hidden = !anyVisible;
                    if (anyVisible) branch.open = true;
                } else {
                    branch.hidden = false;
                    branch._syncOutlineVisibility?.(Number(branch.dataset.outlineVisible || 3));
                }
            });
        }
        const outlineSearchEl = e.byId("outlineSearch");
        outlineSearchEl && outlineSearchEl.addEventListener("input", sxApplyOutlineSearch);
        const tl = e.byId("profileTabs");
        let nl = null, il = null, al = null, rl = 0, ol = null, tfHide = 0;
        function sl() {
            nl && Fs.visibleFor(nl) && Fs.hide(), nl = null, il = null;
        }
        function ll(e = nl, t = il) {
            e && Fs.visibleFor(e) && Fs.position(t, e);
        }
        function cl(e, t = !1, n = null) {
            const i = e?.dataset?.uiTooltip;
            i && (nl = e, il = n, Fs.show(e, {
                name: e.dataset.tooltipName,
                definition: e.dataset.tooltipDefinition || i,
                value: e.dataset.tooltipValue,
                point: n,
                autoHide: t
            }));
        }
        const dl = window.matchMedia ? window.matchMedia("(hover: hover)") : {
            matches: !0
        };
        function ul(e) {
            e && "true" !== e.dataset.mapTooltipBound && (e.dataset.mapTooltipBound = "true", 
            e.addEventListener("pointerenter", t => {
                !dl.matches || t.pointerType && "mouse" !== t.pointerType || cl(e, !1, Ts(t));
            }), e.addEventListener("pointermove", t => {
                nl !== e || !Fs.visibleFor(e) || !dl.matches || t.pointerType && "mouse" !== t.pointerType || (il = Ts(t), 
                ll());
            }), e.addEventListener("pointerleave", t => {
                nl !== e || t.relatedTarget && e.contains(t.relatedTarget) || sl();
            }));
        }
        const pl = e => e && e.closest ? __sxClosestAction(e, "uiTooltip") : null;
        document.addEventListener("pointerover", e => {
            if (!dl.matches || e.pointerType && "mouse" !== e.pointerType) return;
            const t = pl(e.target);
            t && cl(t, !1, Ts(e));
        }), document.addEventListener("pointermove", e => {
            if (!nl || !Fs.visibleFor(nl)) return;
            const t = pl(e.target);
            ("mouse" === e.pointerType && t === nl || "mouse" !== e.pointerType && nl.contains(e.target)) && (il = Ts(e), 
            ll());
        }), document.addEventListener("pointerout", e => {
            if (!dl.matches || e.pointerType && "mouse" !== e.pointerType) return;
            if (!pl(e.target)) return;
            const t = pl(e.relatedTarget);
            t ? cl(t, !1, Ts(e)) : sl();
        }), document.addEventListener("focusin", e => {
            const t = e.target.closest && __sxClosestAction(e.target, "uiTooltip");
            t && cl(t);
        }), document.addEventListener("focusout", e => {
            e.target.closest && __sxClosestAction(e.target, "uiTooltip") && (e.relatedTarget && e.relatedTarget.closest && __sxClosestAction(e.relatedTarget, "uiTooltip") || sl());
        }), window.__sxOnPtr( e => {
            if (nl && Fs.visibleFor(nl) && !nl.contains(e.target) && sl(), "mouse" === e.pointerType) return;
            const t = e.target.closest && __sxClosestAction(e.target, "uiTooltipHover");
            t && cl(t, !0, Ts(e));
        }, !0), document.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const el = __sxClosestAction(e.target, "tooltipTapFirst");
            if (!el) return;
            const useCard = Boolean(el.dataset && el.dataset.uiTooltip), useOutline = !useCard && Boolean(Gs(el));
            if (!useCard && !useOutline) return;
            const n = performance.now();
            if (al === el && n < rl) return al = null, rl = 0, ol = null, t.clear(tfHide), tfHide = 0, void (sl(), js());
            al = el, rl = n + 3200, ol = el, useCard ? cl(el, !0, Ts(e)) : qs(el, Gs(el), Ts(e)), t.clear(tfHide), tfHide = t.setTimeout(() => {
                al === el && (al = null, rl = 0), useOutline && Ns === el && js();
            }, 3400), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), document.addEventListener("click", e => {
            const el = __sxClosestAction(e.target, "tooltipTapFirst");
            el && ol === el && (ol = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), addEventListener("resize", () => {
            nl && Fs.visibleFor(nl) && ll();
        });
        let hl = 0;
        function gl() {
            hl && cancelAnimationFrame(hl), hl = requestAnimationFrame(() => {
                hl = 0;
                const e = Array.from(tl.querySelectorAll(".profile-tab")), t = e.map(e => e.querySelector("[data-profile-label]")), n = matchMedia("(max-width:620px)").matches;
                if (tl.classList.remove("is-wrapped"), e.forEach(e => e.style.removeProperty("--profile-tab-width")), 
                t.forEach(e => {
                    e.textContent = e.dataset.fullLabel || "";
                }), !n || !e.length) return;
                const i = tl.querySelector(".profile-add-stack"), a = Math.max(0, tl.clientWidth - 6), r = i ? Math.ceil(i.getBoundingClientRect().width) : 42, o = 2 * (e.length + 1), s = [ {
                    name: "full",
                    labels: t.map(e => e.dataset.fullLabel || ""),
                    widths: t.map(e => Math.max(168, Math.min(220, 70 + 7 * (e.dataset.fullLabel || "").length)))
                }, {
                    name: "short",
                    labels: t.map(e => (e.dataset.fullLabel || "").slice(0, 12)),
                    widths: t.map(() => 168)
                }, {
                    name: "initial",
                    labels: t.map(e => (e.dataset.fullLabel || "").slice(0, 8)),
                    widths: t.map(() => 148)
                } ];
                let l = s.find(e => e.widths.reduce((e, t) => e + t, r + o) <= a) || s[s.length - 1];
                l.labels.forEach((e, n) => {
                    t[n] && (t[n].textContent = e);
                }), e.forEach((e, t) => e.style.setProperty("--profile-tab-width", l.widths[t] + "px")), 
                l.widths.reduce((e, t) => e + t, r + o) > a && tl.classList.add("is-wrapped");
            });
        }
        addEventListener("resize", gl), "ResizeObserver" in window && new ResizeObserver(gl).observe(tl);
        let ml = null, fl = null, yl = !1, bl = null, vl = 0;
        function wl() {
            yl = !0, t.clear(bl), bl = t.setTimeout(() => {
                yl = !1;
            }, 800);
        }
        function kl() {
            fl && (t.clear(fl), fl = null), ml = null;
        }
        if (tl) {
            tl.addEventListener("pointerdown", e => {
                const n = __sxClosestAction(e.target, "viewButton");
                if (n && 0 === e.button) if (e.ctrlKey || e.metaKey) kl(); else {
                    kl(), ml = {
                        pointerId: e.pointerId,
                        id: n.dataset.view,
                        startX: e.clientX,
                        startY: e.clientY
                    };
                    try {
                        n.setPointerCapture(e.pointerId);
                    } catch (e) { __sxErrLog("pointer-capture", e); }
                    fl = t.setTimeout(() => {
                        if (!ml || ml.pointerId !== e.pointerId) return;
                        const t = ml.id;
                        vl = Date.now(), wl(), el(t);
                    }, 360);
                }
            });
            tl.addEventListener("pointermove", e => {
                ml && ml.pointerId === e.pointerId && Math.hypot(e.clientX - ml.startX, e.clientY - ml.startY) > 14 && kl();
            });
            tl.addEventListener("pointerup", kl);
            tl.addEventListener("pointercancel", kl);
            tl.addEventListener("lostpointercapture", kl);
            tl.addEventListener("keydown", e => {
                if (__sxClosestAction(e.target, "profileNameInput")) return void ("Enter" === e.key ? (e.preventDefault(),
                tk()) : "Escape" === e.key && (e.preventDefault(), Xw && (Xw = null, Jw())));
                const t = __sxClosestAction(e.target, "viewButton");
                t && (!(e.shiftKey || e.ctrlKey || e.metaKey) || "Enter" !== e.key && " " !== e.key ? !e.altKey || "Enter" !== e.key && " " !== e.key || (e.preventDefault(),
                bw(t.dataset.view)) : (e.preventDefault(), el(t.dataset.view)));
            });
            tl.addEventListener("focusout", e => {
                const n = __sxClosestAction(e.target, "profileNameInput");
                if (!n) return;
                const i = Xw;
                t.setTimeout(() => {
                    Xw === i && document.activeElement !== n && tk();
                }, 0);
            });
            tl.addEventListener("contextmenu", e => {
                const t = __sxClosestAction(e.target, "viewButton");
                if (!t) return;
                e.preventDefault();
                const n = Date.now() - vl < 900;
                kl(), n || (vl = Date.now(), wl(), el(t.dataset.view));
            });
            tl.addEventListener("click", t => {
                const n = __sxClosestAction(t.target, "profileVeil");
                if (n) {
                    const e = n.dataset.profileVeil;
                    return dv.hidden || Qt !== e || bv !== n ? (Qt = e, bv = n, Mv(), void Av(!0, !0)) : void Cv();
                }
                const i = __sxClosestAction(t.target, "saveProfile");
                if (i) return void Jf(i.dataset.saveProfile);
                const a = __sxClosestAction(t.target, "closeProfile");
                if (a) return void function(t, n) {
                    if (!vt[t]) return;
                    if (kw(), xw(), !yt[t]) return void nk(t);
                    const i = e.byId("rememberProfileCheckbox2x"), a = Boolean(i && i.checked);
                    vm.hidden = !a, wf = t, bm.textContent = a ? "Save or discard changes?" : "Discard changes?",
                    e.byId("closeProfileQuestion").textContent = a ? `Save ${wt[t]} on this device before closing, or discard its unsaved changes?` : `Close ${wt[t]} and lose its unsaved changes?`,
                    Wi(ym), requestAnimationFrame(() => {
                        const t = n && n.getBoundingClientRect(), i = ym.offsetWidth, r = ym.offsetHeight, o = t ? Math.max(8, Math.min(innerWidth - i - 8, t.right - i)) : Math.max(8, innerWidth - i - 12), s = t ? Math.max(8, Math.min(innerHeight - r - 8, t.bottom + 6)) : 12;
                        ym.style.left = `${o}px`, ym.style.top = `${s}px`, (a ? vm : e.byId("discardClosingProfile")).focus();
                    });
                }(a.dataset.closeProfile, a);
                const r = __sxClosestAction(t.target, "profileLoad");
                if (r) return void function(e, t) {
                    if (!vt[e]) return;
                    const n = !Oy.hidden && qy === e;
                    if (kw(), xw(), Sw(), n) return;
                    e !== Mt && Js(e), qy = e, Oy.hidden = !1;
                    const i = [ ...tl.querySelectorAll("[data-profile-load]") ].find(t => t.dataset.profileLoad === e) || t;
                    i.setAttribute("aria-expanded", "true"), Oy.setAttribute("aria-label", `Load or import data for ${wt[e]}`),
                    $w(Oy, i), Oy.querySelector("button").focus({
                        preventScroll: !0
                    });
                }(r.dataset.profileLoad, r);
                const sxMo = t.target.closest && t.target.closest("[data-sx-match-open]");
                if (sxMo) return void sxOpenMatchTab(sxMo.dataset.sxMatchOpen);
                const sxMb = t.target.closest && t.target.closest("[data-sx-match-tab-btn]");
                if (sxMb) return void sxActivateMatchTab(sxMb.dataset.sxMatchTabBtn, !0);
                const sxMc = t.target.closest && t.target.closest("[data-sx-match-close]");
                if (sxMc) return void sxCloseMatchTab(sxMc.dataset.sxMatchClose);
                const sxHb = __sxClosestAction(t.target, "profileHeat");
                if (sxHb) return void sxToggleHeatPopover(sxHb.dataset.profileHeat, sxHb);
                const s = __sxClosestAction(t.target, "addProfile");
                if (s) return void Pw(s);
                const l = __sxClosestAction(t.target, "viewButton");
                if (!l) return;
                if (yl) return yl = !1, void t.preventDefault();
                const c = l.dataset.view;
                if (t.ctrlKey || t.metaKey) return t.preventDefault(), kl(), void el(c);
                yl = !1, c !== Mt && Js(c);
            });
        }
        e.byId("overlayTab") && e.byId("overlayTab").addEventListener("click", ev => {
            ev.preventDefault(), ev.stopPropagation();
            const ids = Yi();
            if (ids.length < 2) return;
            const hide = Boolean(an);
            sxVaultInvalidate();
            sxSel(ids, "set");
            sxSel(null, hide ? "dismiss" : "show");
            const sxKeepOverlayControl = () => {
                Yi().length < 2 && (sxSel(ids, "set"), sxSel(null, hide ? "dismiss" : "show"));
                Jw();
                const k = e.byId("overlayTab");
                k && (k.hidden = !1, k.textContent = an ? "Hide group overlay" : "Show group overlay", k.title = an ? "Hide the selected profiles’ comparison overlay" : "Show the selected profiles’ comparison overlay", k.setAttribute("aria-pressed", String(Boolean(an))));
            };
            sxKeepOverlayControl();
            const painted = Mr();
            painted && "function" == typeof painted.then ? painted.then(() => {
                sxKeepOverlayControl(), Ih();
            }) : (sxKeepOverlayControl(), Ih());
        });
        e.all("[data-filter]").forEach(t => t.addEventListener("click", () => {
            "true" !== t.getAttribute("aria-disabled") && !Rt && (sxVaultInvalidate(), Pt = t.dataset.filter, e.all("[data-filter]").forEach(e => e.setAttribute("aria-pressed", String(e === t))),
            Mr());
        }));
        const xl = e.byId("blindModeToggle");
        xl && xl.addEventListener("click", () => function(e, {render: t = !0} = {}) {
            sxVaultInvalidate();
            const n = Boolean(e) && Fa();
            n !== Rt ? (n ? (Ot = Pt, Pt = "mutual", Nt = null, so()) : Pt = Ot || "all", Rt = n, 
            Da(), t && Mr({
                animate: !1
            })) : Da();
        }(!Rt)), function() {
            const t = e.byId("shareOverlapBtn"), n = e.byId("overlapShareDialog"), i = e.byId("closeOverlapShare");
            t && n && t.addEventListener("click", () => {
                Ui(e.one("dialog[open]")), Wi(n);
            }), i && n && i.addEventListener("click", () => Ui(n));
            const a = e.byId("overlapSharePerson"), r = e.byId("overlapShareCouple");
            a && a.addEventListener("click", () => {
                Ui(n), Er("person");
            }), r && r.addEventListener("click", () => {
                Ui(n), Er("couple");
            }), n && n.addEventListener("click", e => {
                e.target === n && Ui(n);
            });
        }();
        const Sl = e.byId("localCommunitiesDialog"), $l = e.byId("localCommunityConsentRow"), El = e.byId("localCommunityStatus"), Al = e.byId("localCommunityResults"), Cl = e.byId("localCommunityPlace"), Ml = e.byId("localFetlifeLinks"), Il = e.byId("localRedditLinks"), Pl = e.byId("nationalCommunityList");
        let Ll = !1, Tl = null, Fl = null;
        function Nl(e, t, n) {
            const i = document.createElement("a");
            i.href = n, i.target = "_blank", i.rel = "noopener noreferrer", i.textContent = t, 
            e.append(i);
        }
        function _l(e, t, n = "") {
            return `${e}${encodeURIComponent(t)}${n}`;
        }
        function Dl(e) {
            const t = (e && e.city || "").trim(), n = (e && e.state || "").trim(), i = [ t, n ].filter(Boolean).join(", "), a = t || n;
            if (Ml.replaceChildren(), Il.replaceChildren(), !a) return Cl.textContent = "Area name unavailable", 
            void (Al.hidden = !0);
            if (Cl.textContent = i, t && Nl(Ml, `Groups in ${t}`, _l("https://fetlife.com/groups/search?q=", t)), 
            n && n !== t && Nl(Ml, `Groups in ${n}`, _l("https://fetlife.com/groups/search?q=", n)), 
            Nl(Ml, "Search area places & events", _l("https://fetlife.com/groups/search?q=", `${a} events`)), 
            Nl(Il, `Search Reddit for ${a} kink communities`, _l("https://www.reddit.com/search/?q=", `${a} kink`, "&type=sr")), 
            t) {
                const e = t.toLowerCase().replace(/[^a-z0-9]+/g, "");
                e && Nl(Il, `Search for r/${e}kink`, _l("https://www.reddit.com/search/?q=", `r/${e}kink`, "&type=sr"));
            }
            (function() {
                Pl.replaceChildren();
                const e = function(e = 5) {
                    const t = Vi();
                    if (!t || !vt[t]) return [];
                    const n = [];
                    h.forEach(e => e.topics.forEach(e => {
                        const i = Wn(e), a = ca(i, t), r = "favorite" === Qe[t]?.[i], o = Math.max(a.giveKnown ? a.give : -101, a.receiveKnown ? a.receive : -101, r ? 101 : -101), s = de(e, "fetlife");
                        o > 0 && s && s.url && n.push({
                            label: e,
                            score: o,
                            community: s
                        });
                    })), ri().forEach(e => {
                        const i = ca(e.id, t), a = "favorite" === Qe[t]?.[e.id], r = Math.max(i.giveKnown ? i.give : -101, i.receiveKnown ? i.receive : -101, a ? 101 : -101), o = de(e.label, "fetlife");
                        r > 0 && o && o.url && n.push({
                            label: e.label,
                            score: r,
                            community: o
                        });
                    });
                    const i = new Set;
                    return n.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label)).filter(e => !i.has(e.community.url) && (i.add(e.community.url), 
                    !0)).slice(0, e);
                }();
                if (!e.length) {
                    const e = document.createElement("li"), t = document.createElement("small");
                    return t.textContent = "Rate topics you’re into to see relevant national groups.", 
                    e.append(t), void Pl.append(e);
                }
                e.forEach(e => {
                    const t = document.createElement("li"), n = document.createElement("a"), i = document.createElement("small");
                    n.href = e.community.url, n.target = "_blank", n.rel = "noopener noreferrer", n.textContent = e.community.name || e.label, 
                    i.textContent = `Matched from ${e.label}`, t.append(n, i), Pl.append(t);
                });
            })(), Al.hidden = !1;
        }
        function Rl() {
            El.dataset.tone = "error", El.textContent = "Location unavailable — local search needs location permission.", 
            Al.hidden = !0, $l.hidden = !0;
        }
        function Ol() {
            Wi(Sl), Tl && Fl && Dl(Fl), requestAnimationFrame(() => {
                (Ll ? e.byId("closeLocalCommunities") : e.byId("findLocalCommunities")).focus();
            });
        }

        e.byId("profileCommunityMatches")?.addEventListener("click", () => {
            if (Hy && vt[Hy]) Et = Hy;
            Ui(_g);
            Ol();
            const t = Vi(), matches = [];
            h.forEach(branch => branch.topics.forEach(label => { const id=Wn(label), rating=ca(id,t), score=Math.max(rating.giveKnown?rating.give:-101,rating.receiveKnown?rating.receive:-101), community=de(label,"fetlife"); if(score>0&&community&&community.url) matches.push({label,score,community}); }));
            const grouped = new Map(); matches.forEach(m => { const key=m.community.url; if(!grouped.has(key)) grouped.set(key,{community:m.community,labels:[],score:m.score}); const g=grouped.get(key); g.labels.push(m.label); g.score=Math.max(g.score,m.score); });
            Pl.replaceChildren(); [...grouped.values()].sort((a,b)=>b.labels.length-a.labels.length||b.score-a.score).slice(0,8).forEach(m=>{ const li=document.createElement("li"),a=document.createElement("a"),small=document.createElement("small"); a.href=m.community.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=m.community.name||m.labels[0];small.textContent=(m.labels.length>1?`${m.labels.length} green matches: `:"Matched: ")+m.labels.join(", ");li.append(a,small);Pl.append(li); });
            Al.hidden = !1;
        });
        e.byId("localCommunitiesButton") && e.byId("localCommunitiesButton").addEventListener("click", () => {
            Pi.open && Ui(Pi), Ol();
        }), e.byId("findLocalCommunities") && e.byId("findLocalCommunities").addEventListener("click", async function() {
            Ll || (Ll = !0, El.removeAttribute("data-tone"), El.textContent = "Requesting location…", 
            navigator.geolocation ? navigator.geolocation.getCurrentPosition(async e => {
                Tl = {
                    latitude: e.coords.latitude,
                    longitude: e.coords.longitude
                }, $l.hidden = !0, El.textContent = "Finding your area…";
                try {
                    Fl = await async function() {
                        const e = new AbortController, n = t.setTimeout(() => e.abort(), 7e3), i = encodeURIComponent(Tl.latitude), a = encodeURIComponent(Tl.longitude);
                        try {
                            const t = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${i}&lon=${a}&zoom=10&addressdetails=1`, {
                                headers: {
                                    Accept: "application/json"
                                },
                                credentials: "omit",
                                cache: "no-store",
                                referrerPolicy: "strict-origin-when-cross-origin",
                                signal: e.signal
                            });
                            if (!t.ok) throw new Error("Reverse geocoding unavailable");
                            const n = await t.json(), r = n && n.address || {};
                            return {
                                city: r.city || r.town || r.village || r.municipality || r.county || "",
                                state: r.state || r.region || ""
                            };
                        } finally {
                            t.clear(n);
                        }
                    }(), El.textContent = "";
                } catch (e) {
                    Fl = null, El.textContent = "City lookup unavailable. No location was sent to FetLife or Reddit.";
                }
                Dl(Fl);
            }, Rl, {
                enableHighAccuracy: !1,
                maximumAge: 0,
                timeout: 1e4
            }) : Rl());
        }), e.byId("closeLocalCommunities") && e.byId("closeLocalCommunities").addEventListener("click", () => Ui(Sl)), Sl && Sl.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Sl);
        });
        const Bl = e.byId("searchInput"), jl = e.byId("searchDropdown"), ql = e.byId("topicPicker"), Hl = e.byId("topicPickerButton"), Wl = e.byId("topicPickerMenu"), Ul = [], Gl = G(h, z);
        function Kl(e, t = !1) {
            const n = !t && e.hankyKey && "subcategory" !== e.hankyKey ? ` data-hanky-code="${Hi(e.hankyKey)}"` : "";
            return `<svg class="glance-tooltip-practice-icon ${t ? "branch-icon" : "topic-icon"}${"subcategory" === e.hankyKey ? " subcategory-icon" : "noCode" === e.hankyKey ? " no-hanky-code-icon" : ""}" viewBox="0 0 48 48" aria-hidden="true"${n} style="--icon-family:${Hi(e.color)};color:${Hi(e.color)}"><circle class="icon-ring-outline icon-ring-outline-outer" cx="24" cy="24" r="23.5"/><circle class="icon-disc" cx="24" cy="24" r="22"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="24" cy="24" r="20.5"/><g transform="${t ? "scale(2)" : "translate(8 8) scale(2)"}">${e.glyph}${e.accent || ""}</g></svg>`;
        }
        function zl(e) {
            let t = [], i = [], a = -1, r = !1;
            const o = new Set;
            // P1 refactor (Build 2026-10-18_2227): zl internals split by
            // responsibility — zlFlatten prepares the visible item list
            // (tree flattening), zlRenderRows renders the option rows,
            // zlMove is the keyboard highlight step used by the key handler.
