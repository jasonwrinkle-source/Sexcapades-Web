        function vcScribeReady(t = []) {
                const n = e.byId("scribeTab");
                if (!n) return;
                const i = t.filter(e => vt[e]), a = i.some(e => Object.values(vt[e] || {}).some(e => "number" == typeof e || Boolean(e && "object" == typeof e && (Object.prototype.hasOwnProperty.call(e, "give") || Object.prototype.hasOwnProperty.call(e, "receive"))))), r = i.length > 1, o = Yi(), s = o.length > 1;
                hc = a && r ? i.slice().sort().join("|") : "", n.classList.toggle("scribe-ready", Boolean(hc && !mc.has(hc))), 
                n.dataset.uiTooltip = r ? "Scribe will create a Literotica-style erotic story featuring these multiple profiles. For a binding checklist and play guide, use Scene Setter." : s ? `Scribe will create a Literotica-style erotic story featuring these ${o.length} selected profiles.` : 1 === i.length || 1 === o.length ? "Scribe will create a Literotica-style erotic story from this profile." : "Scribe needs at least 1 profile selected: open a profile tab, or Ctrl+click (Cmd+click on Mac) profile tabs to build a multi-select.";
            }
        function vcGlanceKey(e = []) {
                const t = e.filter(e => vt[e]), n = Mt && "group" === ft[Mt]?.kind ? ft[Mt] : null;
                if (t.length > 1) gc = `comparison:${t.slice().sort().join("|")}`; else if (n) gc = `comparison:${Mt}`; else {
                    const e = Mt && vt[Mt] ? Mt : Object.keys(At).length ? Et : "", t = e === Et ? At : vt[e] || {}, n = Object.values(t).some(e => "number" == typeof e || Boolean(e && "object" == typeof e && (Object.prototype.hasOwnProperty.call(e, "give") || Object.prototype.hasOwnProperty.call(e, "receive"))));
                    gc = e && n ? `profile:${e}` : "";
                }
                In.querySelector(".center-glance-rings")?.classList.toggle("glance-ready", Boolean(gc && !fc.has(gc)));
            }
        function vcEmpty(l, u, r, s) {
            l.classList.remove("rating-breakdown");
            l.classList.add("is-empty");
            u.mutual.textContent = "";
            u.explore.textContent = "";
            u.rated.textContent = "";
            sc("mutualCount", 0, "", "", "");
            sc("exploreCount", 0, "", "", "");
            sc("ratedCount", 0, "", "", "");
            r && (r.hidden = !1, r.textContent = "Load a profile to see your overview.", 
            r.removeAttribute("title"), r.setAttribute("aria-label", "Load a profile to see your overview."));
            void bc([ {
                label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                count: 0,
                percent: 0,
                sourceId: "mutualCount",
                color: "var(--green)"
            }, {
                label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                count: 0,
                percent: 0,
                sourceId: "exploreCount",
                color: "var(--curious)"
            }, {
                label: "Not topics", // FQ2-BAKEIN: "No" -> "Not topics"
                count: 0,
                percent: 0,
                sourceId: "ratedCount",
                color: "var(--red)"
            } ], s);
        }
        function vcComparison(n, t, l, c, d, u, p) {
                const i = n || null, a = n ? t : sxCompareIds, r = i.results || {
                    matches: [],
                    curiousAbout: [],
                    mismatched: []
                }, o = Number(i.percent) || 0, s = o < 33 ? "is-low" : o > 66 ? "is-high" : "is-mid";
                if (n && i.noScore) {
                    const g = na(a);
                    return l.classList.add("rating-breakdown"), c.hidden = !1, c.className = "glance-compatibility is-mid",
                    d.textContent = "no score", e.byId("glanceCompatibilityPercent").textContent = "—",
                    c.setAttribute("aria-label", "No score: every shared topic is set aside by a limit or a fantasy-only mark."),
                    u.mutual.textContent = "Hot topics together", u.explore.textContent = "Curiosity?", u.rated.textContent = "Not topics", // FQ2-BAKEIN: header "Want to do" -> "Hot topics together"; "Curious about" -> "Curiosity?"; "apart" KEPT (comparison red); Apart -> Not topics (SURFACES)
                    sc("mutualCount", 0, "Hot topics together", [], "No shared topics can be scored.", []), // FQ2-BAKEIN: tooltip title "Want to do together" -> "Hot topics together"
                    sc("exploreCount", 0, "Curiosity? together", [], "No shared topics can be scored.", []), // FQ2-BAKEIN: tooltip title "Curious about together" -> "Curiosity? together"
                    sc("ratedCount", 0, "Not topics together", [], "No shared topics can be scored.", []), // FQ2-BAKEIN: tooltip title "Topics apart" -> "Not topics together"; Apart -> Not topics (SURFACES)
                    bc([ {
                        label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                        count: 0,
                        percent: 0,
                        sourceId: "mutualCount",
                        color: "var(--green)"
                    }, {
                        label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                        count: 0,
                        percent: 0,
                        sourceId: "exploreCount",
                        color: "var(--curious)"
                    }, {
                        label: "Not topics", // FQ2-BAKEIN: "Apart" -> "Not topics"; Apart -> Not topics (SURFACES)
                        count: 0,
                        percent: 0,
                        sourceId: "ratedCount",
                        color: "var(--red)"
                    } ], g), void p(g);
                }
                if (l.classList.add("rating-breakdown"), c.hidden = !1, c.className = `glance-compatibility ${s}`, 
                n && !i.things) {
                    const t = function(e) {
                        const t = {
                            green: [],
                            yellow: [],
                            red: []
                        }, n = {
                            green: 0,
                            yellow: 0,
                            red: 0
                        };
                        return (e || []).filter(e => vt[e]).forEach(e => {
                            Uc().forEach(i => cc(t, n, i, e, t => `${t} · ${Ji(wt[e])}`));
                        }), Object.values(t).forEach(e => e.sort((e, t) => e.label.localeCompare(t.label))), 
                        Object.assign(t, {
                            percentages: lc(n)
                        });
                    }(a), n = na(a), i = a.map(e => Ji(wt[e])).filter(Boolean).join(" + ");
                    return d.textContent = "no shared ratings", e.byId("glanceCompatibilityPercent").textContent = "—", 
                    c.setAttribute("aria-label", `No shared rated topics for ${i || "the selected profiles"}. Combined rating mix shown.`), 
                    u.mutual.textContent = "combined Hot topics", u.explore.textContent = "combined Curiosity?", // FQ2-BAKEIN: header "combined Want to do" -> "combined Hot topics"; "combined Curious about" -> "combined Curiosity?"
                    u.rated.textContent = "combined Not topics", sc("mutualCount", t.percentages.green, "Combined Hot topics", t.green.map(e => e.label), "No Hot topics ratings in the selected profiles.", t.green, "%"), // FQ2-BAKEIN: header "combined No" -> "combined Not topics"; tooltip title "Combined Want to do" -> "Combined Hot topics"; empty text "No Want to do ratings in the selected profiles." -> "No Hot topics ratings in the selected profiles." (leading "No" is the negator, kept)
                    sc("exploreCount", t.percentages.yellow, "Combined Curiosity?", t.yellow.map(e => e.label), "No Curiosity? ratings in the selected profiles.", t.yellow, "%"), // FQ2-BAKEIN: tooltip title "Combined Curious about" -> "Combined Curiosity?"; empty text "No Curious about ratings in the selected profiles." -> "No Curiosity? ratings in the selected profiles." (leading "No" is the negator, kept)
                    sc("ratedCount", t.percentages.red, "Combined Not topics", t.red.map(e => e.label), "No topics rated against in the selected profiles.", t.red, "%"), // FQ2-BAKEIN: tooltip title "Combined No" -> "Combined Not topics"
                    bc([ {
                        label: "Combined Hot topics", // FQ2-BAKEIN: "Combined Want to do" -> "Combined Hot topics"
                        count: t.green.length,
                        percent: t.percentages.green,
                        sourceId: "mutualCount",
                        color: "var(--green)"
                    }, {
                        label: "Combined Curiosity?", // FQ2-BAKEIN: "Combined Curious about" -> "Combined Curiosity?"
                        count: t.yellow.length,
                        percent: t.percentages.yellow,
                        sourceId: "exploreCount",
                        color: "var(--curious)"
                    }, {
                        label: "Combined Not topics", // FQ2-BAKEIN: "Combined No" -> "Combined Not topics"
                        count: t.red.length,
                        percent: t.percentages.red,
                        sourceId: "ratedCount",
                        color: "var(--red)"
                    } ], n), void p(n);
                }
                d.textContent = `match · ${i.clicks} of ${i.things} shared topics`, e.byId("glanceCompatibilityPercent").textContent = `${o}%`, 
                c.setAttribute("aria-label", `${o}% — ${i.clicks} of ${i.things} shared topics`), u.mutual.textContent = "Hot topics together", // FQ2-BAKEIN: header "Want to do" -> "Hot topics together"
                u.explore.textContent = "Curiosity?", u.rated.textContent = "Not topics", sc("mutualCount", r.matches.length, "Hot topics together", r.matches, "No shared Hot topics.", oc(r.matches, "green", a)), // FQ2-BAKEIN: header "Curious about" -> "Curiosity?" ("apart" KEPT); tooltip title "Want to do together" -> "Hot topics together"; empty text "No shared Want to do topics." -> "No shared Hot topics." (redundant trailing "topics" dropped); Apart -> Not topics (SURFACES)
                sc("exploreCount", r.curiousAbout.length, "Curiosity? together", r.curiousAbout, "No shared Curiosity? topics.", oc(r.curiousAbout, "yellow", a)), // FQ2-BAKEIN: tooltip title "Curious about together" -> "Curiosity? together"; empty text "No shared Curious about topics." -> "No shared Curiosity? topics."
                sc("ratedCount", r.mismatched.length, "Not topics together", r.mismatched, "No rated topics fall outside the group overlap.", oc(r.mismatched, "red", a)); // FQ2-BAKEIN: tooltip title "Topics apart" -> "Not topics together"; Apart -> Not topics (SURFACES)
                const h = uc([ r.matches.length, r.curiousAbout.length, r.mismatched.length ]), g = na(a);
                return bc([ {
                    label: "Hot topics together", // FQ2-BAKEIN: "Want to do" -> "Hot topics together"
                    count: r.matches.length,
                    percent: h[0],
                    sourceId: "mutualCount",
                    color: "var(--green)"
                }, {
                    label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                    count: r.curiousAbout.length,
                    percent: h[1],
                    sourceId: "exploreCount",
                    color: "var(--curious)"
                }, {
                    label: "Not topics", // FQ2-BAKEIN: "Apart" -> "Not topics"; Apart -> Not topics (SURFACES)
                    count: r.mismatched.length,
                    percent: h[2],
                    sourceId: "ratedCount",
                    color: "var(--red)"
                } ], g), void p(g);
                    }
        function vcGroupProfile(g, l, c, u, s, p) {
                const t = g.results || {
                    matches: [],
                    curiousAbout: [],
                    mismatched: []
                }, n = Number(g.percent) || 0, i = n < 33 ? "is-low" : n > 66 ? "is-high" : "is-mid";
                l.classList.add("rating-breakdown"), c.hidden = !1, c.className = `glance-compatibility ${i}`, 
                e.byId("glanceCompatibilityPercent").textContent = g.noScore ? "—" : `${n}%`, c.setAttribute("aria-label", g.noScore ? `No group match score for ${wt[Mt]}: every shared topic is set aside.` : `${n}% group match score for ${wt[Mt]} — ${g.clicks} of ${g.things} shared topics`), 
                u.mutual.textContent = "Hot topics together", u.explore.textContent = "Curiosity?", u.rated.textContent = "Not topics"; // FQ2-BAKEIN: header "Want to do" -> "Hot topics together"; "Curious about" -> "Curiosity?"; "apart" KEPT (group red); Apart -> Not topics (SURFACES)
                const a = Array.isArray(g.sourceProfiles) ? g.sourceProfiles : [];
                sc("mutualCount", t.matches.length, "Hot topics together", t.matches, "No shared Hot topics.", function(e, t) { // FQ2-BAKEIN: tooltip title "Want to do together" -> "Hot topics together"; empty text "No shared Want to do topics." -> "No shared Hot topics." (redundant trailing "topics" dropped)
                    const n = new Map, i = ft[t], a = i && Array.isArray(i.sourceProfiles) ? i.sourceProfiles : [], details = i && i.matchDetails || {}, ids = i && Array.isArray(i.sourceIds) ? i.sourceIds : [];
                    Uc().forEach(e => {
                        const i = qn[e] || Xn(e) || (at[t] || {})[e];
                        i && i.label && !n.has(i.label) && n.set(i.label, {
                            id: e,
                            item: i
                        });
                    });
                    const firstName = a[0] && a[0].name || "First partner";
                    return (e || []).map(e => {
                        const t = n.get(e), i = t && t.id, r = t && t.item;
                        let o = 0, s = 0;
                        const det = i && details[i];
                        det && Array.isArray(det.routes) && det.routes.forEach(rt => {
                            rt.giver === firstName ? o += Number(rt.score) || 0 : rt.receiver === firstName && (s += Number(rt.score) || 0);
                        });
                        const c = o && s ? "both" : o ? "give" : "receive", d = i ? rc(i, ids.length ? ids : a) : {
                            give: 0,
                            giveKnown: !1,
                            receive: 0,
                            receiveKnown: !1
                        }, u = r && h.some(e => e.name === r.branch) ? Oe(r.label, r.branch) : null;
                        return {
                            id: i,
                            label: e,
                            direction: c,
                            icon: u,
                            rating: "green",
                            give: d.give,
                            giveKnown: d.giveKnown,
                            receive: d.receive,
                            receiveKnown: d.receiveKnown
                        };
                    });
                }(t.matches, Mt)), sc("exploreCount", t.curiousAbout.length, "Curiosity? together", t.curiousAbout, "No shared Curiosity? topics.", oc(t.curiousAbout, "yellow", a)), // FQ2-BAKEIN: tooltip title "Curious about together" -> "Curiosity? together"; empty text "No shared Curious about topics." -> "No shared Curiosity? topics."
                sc("ratedCount", t.mismatched.length, "Not topics together", t.mismatched, "No rated topics fall outside the group overlap.", oc(t.mismatched, "red", a)); // FQ2-BAKEIN: tooltip title "Topics apart" -> "Not topics together"; Apart -> Not topics (SURFACES)
                const r = uc([ t.matches.length, t.curiousAbout.length, t.mismatched.length ]);
                return bc([ {
                    label: "Hot topics together", // FQ2-BAKEIN: "Want to do" -> "Hot topics together"
                    count: t.matches.length,
                    percent: r[0],
                    sourceId: "mutualCount",
                    color: "var(--green)"
                }, {
                    label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                    count: t.curiousAbout.length,
                    percent: r[1],
                    sourceId: "exploreCount",
                    color: "var(--curious)"
                }, {
                    label: "Not topics", // FQ2-BAKEIN: "Apart" -> "Not topics"; Apart -> Not topics (SURFACES)
                    count: t.mismatched.length,
                    percent: r[2],
                    sourceId: "ratedCount",
                    color: "var(--red)"
                } ], s), void p();
                    }
        function vcSingleProfile(o, l, u, s, p) {
                const e = dc(o[0]);
                return l.classList.add("rating-breakdown", "weighted-ratings"), u.mutual.textContent = "Hot topics", // FQ2-BAKEIN: header "Want to do" -> "Hot topics"
                u.explore.textContent = "Curiosity?", u.rated.textContent = "Not topics", sc("mutualCount", e.percentages.green, "Hot topics", e.green.map(e => e.label), "No Hot topics ratings in this profile.", e.green, "%"), // FQ2-BAKEIN: header "Curious about" -> "Curiosity?"; header "No" -> "Not topics"; tooltip title "Want to do" -> "Hot topics"; empty text "No Want to do ratings in this profile." -> "No Hot topics ratings in this profile." (leading "No" is the negator, kept)
                sc("exploreCount", e.percentages.yellow, "Curiosity?", e.yellow.map(e => e.label), "No Curiosity? ratings in this profile.", e.yellow, "%"), // FQ2-BAKEIN: tooltip title "Curious about" -> "Curiosity?"; empty text "No Curious about ratings in this profile." -> "No Curiosity? ratings in this profile." (leading "No" is the negator, kept)
                sc("ratedCount", e.percentages.red, "Not topics", e.red.map(e => e.label), "No topics rated against in this profile.", e.red, "%"), // FQ2-BAKEIN: tooltip title "No" -> "Not topics"
                bc([ {
                    label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                    count: e.green.length,
                    percent: e.percentages.green,
                    sourceId: "mutualCount",
                    color: "var(--green)"
                }, {
                    label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                    count: e.yellow.length,
                    percent: e.percentages.yellow,
                    sourceId: "exploreCount",
                    color: "var(--curious)"
                }, {
                    label: "Not topics", // FQ2-BAKEIN: "No" -> "Not topics"
                    count: e.red.length,
                    percent: e.percentages.red,
                    sourceId: "ratedCount",
                    color: "var(--red)"
                } ], s), void p();
                    }
        function vcFallback(a, l, u, s, p) {
            l.classList.remove("rating-breakdown", "weighted-ratings"), u.mutual.textContent = "Hot topics", // FQ2-BAKEIN: header "Want to do" -> "Hot topics"
            u.explore.textContent = "Curiosity?", u.rated.textContent = "rated"; // FQ2-BAKEIN: header "Curious about" -> "Curiosity?"; "rated" KEPT (fallback red)
            const m = a.filter(e => "mutual" === Ra(e)), f = a.filter(e => "explore" === Ra(e)), y = a.filter(e => Mt && vt[Mt] && (() => {
                const t = ca(e, Mt);
                return t.giveKnown || t.receiveKnown;
            })());
            sc("mutualCount", m.length, "Hot topics together", ac(m), "No shared Hot topics in this view."), // FQ2-BAKEIN: tooltip title "Want to do together" -> "Hot topics together"; empty text "No shared Want to do topics in this view." -> "No shared Hot topics in this view." (redundant trailing "topics" dropped)
            sc("exploreCount", f.length, "Curiosity? together", ac(f), "No shared Curiosity? topics in this view."), // FQ2-BAKEIN: tooltip title "Curious about together" -> "Curiosity? together"; empty text "No shared Curious about topics in this view." -> "No shared Curiosity? topics in this view."
            sc("ratedCount", y.length, "Rated practices", ac(y), "No practices are rated in this profile.");
            const b = uc([ m.length, f.length, y.length ]);
            bc([ {
                label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                count: m.length,
                percent: b[0],
                sourceId: "mutualCount",
                color: "var(--green)"
            }, {
                label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                count: f.length,
                percent: b[1],
                sourceId: "exploreCount",
                color: "var(--curious)"
            }, {
                label: "Rated",
                count: y.length,
                percent: b[2],
                sourceId: "ratedCount",
                color: "var(--red)"
            } ], s), p();
                }

        const sxUpdateGlance = function() { return vc(); };
        window.SexcapadesEngine = window.SexcapadesEngine || {};
        window.SexcapadesEngine.Compatibility = {
            updateGlance: sxUpdateGlance
        };

        function sxKeepCompareRoute() {
            if (typeof xS !== "function" || !xS()) return;
            const picked = (typeof Yi === "function" ? Yi() : []).filter(id => vt[id]);
            if (an && picked.length >= 2) return;
            const all = Object.keys(vt || {}).filter(id => id && id !== Et && vt[id]);
            const ids = picked.length >= 2 ? picked : all;
            ids.length >= 2 && sxSel(ids, "set");
        }
        function vc() {
            sxKeepCompareRoute();
            const t = Xi().filter(e => vt[e]), n = t.length > 1 ? Dd(zd(t), null, t.map(id => sxHeatFor(id))) : null, i = Object.keys(At).length > 0, a = Uc(), r = e.byId("glanceSummary"), o = Mt && vt[Mt] ? [ Mt ] : i ? [ Et ] : [], s = na(t.length > 1 ? t : o), l = (s.percent, 
            e.byId("glanceData")), c = e.byId("glanceCompatibility"), d = c ? c.querySelector("span") : null, u = {
                mutual: e.byId("mutualLabel"),
                explore: e.byId("exploreLabel"),
                rated: e.byId("ratedLabel")
            };
            vcScribeReady(t), vcGlanceKey(t);
            const p = (e = s) => {
                const t = e.percent;
                r && (r.hidden = !1, r.textContent = `${t}% filled`, r.title = `${e.rated} of over 400 topics rated across the whole hypermap`, 
                r.setAttribute("aria-label", `${t}% filled: ${e.rated} of over 400 topics rated across the whole hypermap`));
            };
            if (r && (r.hidden = !0, r.textContent = ""), l && l.classList.remove("weighted-ratings", "is-empty"),
            c && (c.hidden = !0, c.removeAttribute("aria-label")), d && (d.textContent = "match"), !o.length && !n) return vcEmpty(l, u, r, s);
            if (n) return vcComparison(n, t, l, c, d, u, p);
            const g = Mt && ft[Mt] && "group" === ft[Mt].kind ? ft[Mt] : null;
            if (g && o.length < 2) return vcGroupProfile(g, l, c, u, s, p);
            if (1 === o.length && (o[0] === Et || vt[o[0]])) return vcSingleProfile(o, l, u, s, p);
            vcFallback(a, l, u, s, p);
        }
        !function() {
            var t = e.byId("horizonDialog"), i = e.byId("headerHorizonRing"), a = [ i ];
            if (i && a.length && t) {
                var r = e.byId("horizonDialogPersonal"), o = e.byId("horizonCommunityBody");
                a.forEach(function(e) {
                    e.addEventListener("click", l, !0);
                }), i.addEventListener("keydown", function(e) {
                    "Enter" !== e.key && " " !== e.key || l(e);
                });
                var s = t.querySelector("[data-close-dialog]");
                s && s.addEventListener("click", function() {
                    t.close ? t.close() : t.removeAttribute("open");
                }), t.addEventListener("click", function(e) {
                    e.target === t && (t.close ? t.close() : t.removeAttribute("open"));
                });
            }
            function l(i) {
                if (i && (i.preventDefault(), i.stopPropagation(), i.stopImmediatePropagation)) try {
                    i.stopImmediatePropagation();
                } catch (e) { __sxErrLog("event-guard", e); }
                var a = 0, sxCharted = null;
                try {
                    /* Dialog Charted readback: read the TRUE unclamped
                       Charted straight from the function that computes
                       it (sxGroupCharted for a cast, sxPersonalCharted
                       for a single profile), never the display-clamped
                       ring dash. The old code called the ring-value
                       wrappers (sxRingValuesForCast /
                       sxRingValuesForProfile), which recomputed the
                       whole group engine / personal pass and then threw
                       away everything but Charted. The ring dash itself
                       stays clamped at 100; only this readback is
                       unclamped, so values over 100% report truly here. */
                    var sxRec = Mt && ft[Mt] ? ft[Mt] : null;
                    if (sxRec && "group" === sxRec.kind && Array.isArray(sxRec.sourceProfiles) && sxRec.sourceProfiles.length >= 2) {
                        sxCharted = sxGroupCharted(sxRec.sourceProfiles);
                    } else if (Mt && vt[Mt]) {
                        var sxPc = sxPersonalCharted(sxProfileById(Mt));
                        sxCharted = sxPc && sxPc.charted;
                    }
                } catch (e) { __sxErrLog("charted-readback", e); }
                if (null != sxCharted && Number.isFinite(sxCharted)) {
                    a = Math.round(sxCharted);
                } else try {
                    var s = e.byId("headerHorizonValue");
                    if (s && s.style.strokeDasharray) {
                        var l = s.style.strokeDasharray.split(" ");
                        a = Math.round(parseFloat(l[0]) || 0);
                    }
                } catch (e) { __sxErrLog("number-parse", e); }
                r && (r.textContent = "Your Charted ring is " + a + "%. Raise it by rating or marking more of the map; your Personal Kink Factor ring rises as your strongest direction reaches further."), 
                o && n(o, '<p style="font-size:12px;opacity:0.7;">Loading community stats...</p>'), 
                Wi(t), function(){ try { return fetch("https://sexcapades.io/hosted/api/completion.php", { signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : void 0 }); } catch(e) { return Promise.reject(e); } }().then(function(e) {
                    return e.json();
                }).then(function(e) {
                    (t.open || t.hasAttribute("open")) && function(e) {
                        if (e && e.ok) if (e.enough_data) {
                            for (var t = e.bins, i = Math.max.apply(null, t.concat([ 1 ])), a = '<div style="margin:8px 0;">', r = 0; r < t.length; r++) {
                                var s = Math.round(t[r] / i * 100);
                                a += '<div style="display:flex;align-items:center;gap:8px;margin:3px 0;font-size:11px;"><span style="width:90px;flex-shrink:0;opacity:0.8;">' + (e.bin_labels ? e.bin_labels[r] : "Bin " + (r + 1)) + '</span><div style="flex:1;background:var(--line,#333);border-radius:3px;height:14px;position:relative;"><div style="position:absolute;left:0;top:0;bottom:0;width:' + s + '%;background:linear-gradient(90deg,#2a8a6e,#3dbb96);border-radius:3px;"></div></div><span style="width:36px;text-align:right;opacity:0.8;">' + t[r] + "</span></div>";
                            }
                            a += "</div>", null != e.avg_topics && (a += '<p style="font-size:11px;opacity:0.7;margin:6px 0;">Average: ' + Math.round(e.avg_topics) + " of 403 topics rated.</p>"), 
                            n(o, a);
                        } else n(o, '<p class="horizon-no-data" style="font-size:12px;margin:8px 0;"><strong>No data yet.</strong> ' + e.count + " of " + e.min_required + " surveys submitted; community comparisons appear after the minimum is reached.</p>"); else n(o, '<p class="horizon-no-data" style="font-size:12px;margin:8px 0;"><strong>No data yet.</strong> Community completion data is not available.</p>');
                    }(e);
                }).catch(function() {
                    o && n(o, '<p class="horizon-no-data" style="font-size:12px;margin:8px 0;"><strong>No data yet.</strong> Community completion data could not be loaded.</p>');
                });
            }
        }();
        const wc = e.byId("glanceTooltip"), kc = e.byId("glanceTooltipTitle"), xc = e.byId("glanceTooltipText"), Sc = e.byId("copyGlanceTopics"), $c = e.byId("glanceCopyStatus");
        document.body.appendChild(wc);
        let Ec = null, Ac = null;
        const Cc = e.byId("glanceNumbersPopover"), Mc = e.byId("glanceRingSummary"), Ic = e.byId("reviewLink");
        function Pc() {
            Cc.hidden = !0, Ic.setAttribute("aria-expanded", "false"), vc();
        }
        function Lc(e) {
            if (!e || wc.hidden) return;
            const t = e.getBoundingClientRect(), n = 12, i = Math.min(300, innerWidth - 24), a = innerWidth - t.right - n, r = t.left - n;
            let o, s;
            e.classList.contains("stat-number") ? (o = Math.max(n, Math.min(innerWidth - i - n, t.left)), 
            s = t.bottom + 7) : a >= i + 7 ? (o = t.right + 7, s = Math.max(n, t.top - 8)) : r >= i + 7 ? (o = t.left - 7 - i, 
            s = Math.max(n, t.top - 8)) : (o = Math.max(n, Math.min(innerWidth - i - n, t.left)), 
            s = t.bottom + 7);
            const l = innerHeight - s - n;
            if (l < 120 && t.top > l) {
                const e = Math.min(360, t.top - n - 7);
                s = Math.max(n, t.top - 7 - e);
            }
            wc.style.width = i + "px", wc.style.left = o + "px", wc.style.top = s + "px", wc.style.maxHeight = Math.max(92, Math.min(360, innerHeight - s - n)) + "px";
        }
        function Tc(e) {
            t.clear(Ac);
            const i = e && e._glanceTooltip;
            if (!i) return;
            const a = i.rows && i.rows.length ? `<ul class="glance-tooltip-list">${i.rows.map(e => {
                const t = e.icon ? `<span class="glance-tooltip-icon-wrap">${Kl(e.icon)}</span>` : "", n = t => {
                    const n = Boolean(e[t + "Known"]), i = n ? Math.max(-100, Math.min(100, Number(e[t]) || 0)) : 0, a = i < 0, r = Math.abs(i) + "%", o = n ? `${t} ${Math.round(i)}` : `${t} unrated`;
                    return `<span class="glance-tooltip-practice-meter is-${t}${n ? "" : " is-unknown"}" style="color:${n ? zi(i) : "#646d66"}" title="${Hi(o)}" aria-hidden="true"><span class="glance-tooltip-practice-meter-half is-negative">${a ? `<span class="glance-tooltip-practice-meter-fill" style="--meter-fill:${r}"></span>` : ""}</span><span class="glance-tooltip-practice-meter-half is-positive">${!a && n ? `<span class="glance-tooltip-practice-meter-fill" style="--meter-fill:${r}"></span>` : ""}</span></span>`;
                }, i = `<span class="glance-tooltip-practice-meters" aria-hidden="true"><span class="glance-tooltip-practice-direction">G</span>${n("give")}${n("receive")}<span class="glance-tooltip-practice-direction">R</span></span>`, a = "both" === e.direction ? "give and receive" : e.direction, r = e.direction ? ` is-${e.direction}` : "", o = `${e.label}; give ${e.giveKnown ? Math.round(e.give) : "unrated"}; receive ${e.receiveKnown ? Math.round(e.receive) : "unrated"}${a ? `; ${a}` : ""}`;
                return `<li class="glance-tooltip-practice${r}"${e.id ? ` data-glance-node="${Hi(e.id)}" role="button" tabindex="0"` : ""} aria-label="${Hi(o)}">${i}${t}<span class="glance-tooltip-practice-name">${Hi(e.label)}<span class="glance-tooltip-practice-values">Give ${e.giveKnown ? Math.round(e.give) : "unrated"} \u00b7 Receive ${e.receiveKnown ? Math.round(e.receive) : "unrated"}</span></span></li>`;
            }).join("")}</ul>` : "", r = i.rows && i.rows.length ? i.rows.map(e => e.label) : i.labels || [];
            Ec = e, kc.textContent = i.title, n(xc, a || (i.labels && i.labels.length ? `<ul class="glance-tooltip-list">${i.labels.map(e => `<li>${Hi(e)}</li>`).join("")}</ul>` : `<p>${Hi(i.text || "")}</p>`)), 
            wc.dataset.copy = r.join("\n"), Sc.disabled = !r.length, Sc.textContent = i.copyLabel || "Copy green-branch summary", 
            $c.textContent = "", wc.hidden = !1, Lc(e);
        }
        function Fc(t, n) {
            const i = pc[Number(t)], a = i && e.byId(i.sourceId), r = a && a._glanceTooltip;
            if (!i || !n || !r) return;
            Pc();
            const o = "var(--curious)" === i.color ? "yellow" : "var(--red)" === i.color ? "red" : "green";
            n._glanceTooltip = {
                ...r,
                title: `${i.label} · ${i.percent}%`,
                copyLabel: `Copy ${o}-branch summary`
            }, Tc(n), gc && fc.add(gc), In.querySelector(".center-glance-rings")?.classList.remove("glance-ready");
        }
        function Nc() {
            t.clear(Ac), wc.hidden = !0, Ec = null, wc.dataset.copy = "", $c.textContent = "", Ja();
        }
        function _c() {
            t.clear(Ac), Ac = t.setTimeout(Nc, 320);
        }
        function Dc(e, t) {
            let n = null;
            e.addEventListener("pointerdown", e => {
                "mouse" === e.pointerType || __sxClosestAction(e.target, "linkOrButton") || (n = {
                    id: e.pointerId,
                    x: e.clientX,
                    y: e.clientY
                });
            }), e.addEventListener("pointerup", e => {
                if (!n || n.id !== e.pointerId) return;
                const i = Math.hypot(e.clientX - n.x, e.clientY - n.y);
                n = null, i >= 48 && t();
            }), e.addEventListener("pointercancel", () => {
                n = null;
            });
        }
        function Rc(e) {
            noteFitUserCamera();
            const n = qn[e] || Xn(e) || li().find(t => t.id === e);
            n && (t.clear(Ac), wc.hidden = !0, Ec = null, wn = !1, kn = !0, xn = null, Nt = null, 
            rn.add(n.branch), n.parentId && on.add(n.parentId), Lt = e, Mr({
                animate: !1
            }), requestAnimationFrame(() => {
                const t = In.querySelector(`[data-layout-key="${CSS.escape(e)}"]`);
                if (!t) return Lh(n.branch);
                const i = Number(t.dataset.layoutX), a = Number(t.dataset.layoutY);
                if (!Number.isFinite(i) || !Number.isFinite(a)) return Lh(n.branch);
                $p = Math.max(1e-9, Math.min(Eh(), $p)), Ep = nh.x + nh.width / 2 - i * $p, Ap = nh.y + nh.height / 2 - a * $p, 
                $h();
            }));
        }
        document.body.appendChild(Cc), Mc.addEventListener("click", t => {
            const n = __sxClosestAction(t.target, "glanceSource");
            if (!n) return;
            const i = e.byId(n.dataset.glanceSource);
            if (!i || !i._glanceTooltip) return;
            const a = "exploreCount" === n.dataset.glanceSource ? "yellow" : "ratedCount" === n.dataset.glanceSource ? "red" : "green";
            Ic._glanceTooltip = {
                ...i._glanceTooltip,
                copyLabel: `Copy ${a}-branch summary`
            }, Pc(), Tc(Ic);
        }), e.byId("closeGlanceNumbers") && e.byId("closeGlanceNumbers").addEventListener("click", e => {
            e.stopPropagation(), Pc(), Ic.focus({
                preventScroll: !0
            });
        }), e.byId("closeGlanceTooltip") && e.byId("closeGlanceTooltip").addEventListener("click", e => {
            e.stopPropagation();
            const t = Ec;
            Nc(), t && "function" == typeof t.focus && t.focus({
                preventScroll: !0
            });
        }), Sc.addEventListener("click", async e => {
            e.stopPropagation();
            const t = wc.dataset.copy || "", n = t && await ku(t);
            $c.textContent = n ? "Topic list copied" : "Copy failed";
        }), window.__sxOnPtr( e => {
            Cc.hidden || Cc.contains(e.target) || Ic.contains(e.target) || Pc(), wc.hidden || wc.contains(e.target) || __sxClosestAction(e.target, "glanceSourceFull") || Nc();
        }, !0), Dc(Cc, Pc), Dc(wc, Nc), window.__sxOnKey( e => {
            "Escape" === e.key && (Pc(), Nc());
        }), e.all(".stat-number").forEach(e => {
            e.addEventListener("mouseenter", () => Tc(e)), e.addEventListener("mouseleave", _c), 
            e.addEventListener("focus", () => Tc(e)), e.addEventListener("blur", _c), e.addEventListener("click", t => {
                t.stopPropagation(), Ec !== e || wc.hidden ? Tc(e) : (wc.hidden = !0, Ec = null);
            });
        }), wc.addEventListener("mouseenter", () => t.clear(Ac)), wc.addEventListener("mouseleave", _c), 
        wc.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "glanceNode");
            t && Rc(t.dataset.glanceNode);
        }), wc.addEventListener("keydown", e => {
            const t = __sxClosestAction(e.target, "glanceNode");
            !t || "Enter" !== e.key && " " !== e.key || (e.preventDefault(), Rc(t.dataset.glanceNode));
        }), addEventListener("resize", () => {
            Ec && !wc.hidden && Lc(Ec), Cc.hidden || function(e = Ic) {
                if (Cc.hidden) return;
                const t = e.getBoundingClientRect(), n = Math.min(310, innerWidth - 24), i = Cc.offsetHeight;
                let a = Math.max(12, Math.min(innerWidth - n - 12, t.right - n)), r = t.bottom + 8;
                r + i > innerHeight - 12 && (r = Math.max(12, t.top - 8 - i)), Cc.style.left = a + "px", 
                Cc.style.top = r + "px";
            }();
        });
