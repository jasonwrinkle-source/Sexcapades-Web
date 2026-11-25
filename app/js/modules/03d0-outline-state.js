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
            const keys = (n.keys && Array.isArray(n.keys)) ? n.keys : [ "give", "receive" ];
            return !!keys.some(k => Boolean(n[k + "Known"])) || !!Boolean((Qe[t] || {})[e]) || !!Boolean((Je[t] || {})[e]) || Boolean((et[t] || {})[e]);
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
