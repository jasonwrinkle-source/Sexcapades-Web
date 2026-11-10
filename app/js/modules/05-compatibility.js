        function vcScribeReady(t = []) {
                const n = e.byId("scribeTab");
                if (!n) return;
                const i = t.filter(e => vt[e]), a = i.some(e => Object.values(vt[e] || {}).some(e => "number" == typeof e || Boolean(e && "object" == typeof e && (Object.prototype.hasOwnProperty.call(e, "give") || Object.prototype.hasOwnProperty.call(e, "receive"))))), r = i.length > 1, o = Yi(), s = o.length > 1;
                hc = a && r ? i.slice().sort().join("|") : "", n.classList.toggle("scribe-ready", Boolean(hc && !mc.has(hc))), 
                n.dataset.uiTooltip = r ? "Scribe turns this multi-select into a practical play guide. For a binding checklist first, use Scene Setter." : s ? `Scribe will turn these ${o.length} selected profiles into a practical play guide.` : 1 === i.length || 1 === o.length ? "Scribe will create a Literotica-style erotic story from this profile. Ctrl+click (Cmd+click on Mac) more profile tabs for a multi-select play guide." : "Scribe needs at least 1 profile selected: open a profile tab, or Ctrl+click (Cmd+click on Mac) profile tabs to build a multi-select.";
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
                    u.mutual.textContent = "Hot topics", u.explore.textContent = "Curiosity?", u.rated.textContent = "Not topics", // FQ2-BAKEIN: header "Want to do" -> "Hot topics"; "Curious about" -> "Curiosity?"; "apart" KEPT (comparison red); Apart -> Not topics (SURFACES)
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
                c.setAttribute("aria-label", `${o}% — ${i.clicks} of ${i.things} shared topics`), u.mutual.textContent = "Hot topics", // FQ2-BAKEIN: header "Want to do" -> "Hot topics"
                u.explore.textContent = "Curiosity?", u.rated.textContent = "Not topics", sc("mutualCount", r.matches.length, "Hot topics together", r.matches, "No shared Hot topics.", oc(r.matches, "green", a)), // FQ2-BAKEIN: header "Curious about" -> "Curiosity?" ("apart" KEPT); tooltip title "Want to do together" -> "Hot topics together"; empty text "No shared Want to do topics." -> "No shared Hot topics." (redundant trailing "topics" dropped); Apart -> Not topics (SURFACES)
                sc("exploreCount", r.curiousAbout.length, "Curiosity? together", r.curiousAbout, "No shared Curiosity? topics.", oc(r.curiousAbout, "yellow", a)), // FQ2-BAKEIN: tooltip title "Curious about together" -> "Curiosity? together"; empty text "No shared Curious about topics." -> "No shared Curiosity? topics."
                sc("ratedCount", r.mismatched.length, "Not topics together", r.mismatched, "No rated topics fall outside the group overlap.", oc(r.mismatched, "red", a)); // FQ2-BAKEIN: tooltip title "Topics apart" -> "Not topics together"; Apart -> Not topics (SURFACES)
                const h = uc([ r.matches.length, r.curiousAbout.length, r.mismatched.length ]), g = na(a);
                return bc([ {
                    label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
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
                u.mutual.textContent = "Hot topics", u.explore.textContent = "Curiosity?", u.rated.textContent = "Not topics"; // FQ2-BAKEIN: header "Want to do" -> "Hot topics"; "Curious about" -> "Curiosity?"; "apart" KEPT (group red); Apart -> Not topics (SURFACES)
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
                    label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
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

        function vc() {
            const t = Xi().filter(e => vt[e]), n = t.length > 1 ? Dd(zd(t), null, t.map(id => sxHeatFor(id))) : null, i = Object.keys(At).length > 0, a = Uc(), r = e.byId("glanceSummary"), o = Mt && vt[Mt] ? [ Mt ] : i ? [ Et ] : [], s = na(t.length > 1 ? t : o), l = (s.percent, 
            e.byId("glanceData")), c = e.byId("glanceCompatibility"), d = c.querySelector("span"), u = {
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
            if (r && (r.hidden = !0, r.textContent = ""), l.classList.remove("weighted-ratings", "is-empty"), 
            c.hidden = !0, c.removeAttribute("aria-label"), d.textContent = "match", !o.length && !n) return vcEmpty(l, u, r, s);
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
            t.clear(Ac), wc.hidden = !0, Ec = null, wc.dataset.copy = "", $c.textContent = "";
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
        const Oc = e.byId("scribeDialog"), Bc = e.byId("scribeChoiceDialog"), jc = e.byId("novelAiDialog");
        let scribeLeadId = null, scribePartnerId = null, scribeCastIds = [];
        function Uc() {
            return [ ...new Set(h.flatMap(e => e.topics.map(e => Wn(e))).concat(li().map(e => e.id))) ];
        }
        function Gc(e, t) {
            return t ? String(Math.round(e)) : "unrated";
        }
        function zc(e) {
            const t = e && e.giveKnown ? Number(e.give) : null, n = e && e.receiveKnown ? Number(e.receive) : null;
            if (null === t && null === n) return "";
            const i = null === t ? 0 : t, a = null === n ? 0 : n, r = Math.max(i, a), o = Math.abs(i - a);
            return r < 56 || o < 30 ? "" : i > a ? "dominant" : "submissive";
        }
        function Vc(e) {
            return "";
        }
        function Yc(e) {
            return "";
        }
        function Xc(e, t) {
            return "dominant" === e && "submissive" === t ? "firstGive" : "submissive" === e && "dominant" === t ? "secondGive" : "";
        }
        function Zc(e, t, n) {
            const i = Xc(t, n);
            if (!i) return "";
            const r = legacyTopicIdByOpaque[e] || e, a = r.startsWith("topic-bondage-restriction-") || r.startsWith("topic-impact-pain-body-modification-") || r.startsWith("topic-psychological-dynamics-") || r.startsWith("topic-primal-pursuit-") || [ "t0004", "t0005", "t0127", "topic-caregiver-roles-adults", "t0131", "topic-teacher-student-roleplay", "topic-captivity-kidnapping", "topic-consensual-non-consent-fantasy", "t0326", "t0327", "t0328" ].includes(e) ? "give" : [ "t0006", "t0375" ].includes(e) ? "receive" : "";
            return a ? "give" === a ? i : "firstGive" === i ? "secondGive" : "firstGive" : "";
        }
        function Qc(e, t, n, i, a, r) {
            const o = Ge(r), s = o.labels[0], l = o.labels[1] || o.labels[0];
            return "firstGive" === e.key ? `${i}: ${s} ${Gc(t.give, t.giveKnown)} · ${a}: ${l} ${Gc(n.receive, n.receiveKnown)}` : `${a}: ${s} ${Gc(n.give, n.giveKnown)} · ${i}: ${l} ${Gc(t.receive, t.receiveKnown)}`;
        }
        function Jc(e, t) {
            return t && e >= 0 && e <= 35;
        }
        function ed(e) {
            return String(e || "").replace(/\bProfile 1\b/gi, "Jason");
        }
        function td(e) {
            return ed(e).replace(/^(?:Explore and try only after a check-in|Curious about — discuss before deciding):\s*/i, "").replace(/\.\s*Confirm the other participant’s interest and make opting out easy\.?$/i, ".").replace(/^(?:Explore and try with an explicit check-in and easy opt-out\.|Curious about — discuss before deciding, with an easy opt-out\.)\s*/i, "").replace(/confirm give\/receive roles before starting/gi, "favorite without a recorded role");
        }
        function nd(e, t, n, i = ed) {
            return `${e}: ${(t.length ? t.map(e => `- ${"curious" === e.kind ? "[CURIOUS ABOUT] " : ""}${e.label}${e.matchLabel ? ` (${Math.round(e.score)}% ${e.matchLabel})` : ` (${"curious" === e.kind ? "Curious about" : "Want to do"} ${Math.round(e.score)})`}: ${i(e.detail)}`) : [ `- ${n}` ]).join(" ")}`;
        }
        function id(e) {
            const t = Math.max(0, Math.min(100, Number(e) || 0));
            return t <= 20 ? "tentatively Curious about" : t <= 35 ? "strongly Curious about" : t <= 55 ? "moderately Want to do" : t <= 79 ? "strongly Want to do" : "very strongly Want to do";
        }
        function ad(e, t = "") {
            const n = Ge(t), i = [];
            return e.giveKnown && e.give >= 0 && i.push(`${n.labels[0]} ${Math.round(e.give)} (${id(e.give)})`), 
            !n.single && e.receiveKnown && e.receive >= 0 && i.push(`${n.labels[1]} ${Math.round(e.receive)} (${id(e.receive)})`), 
            i.join(" · ");
        }
        function rd(e) {
            const t = wt[e] || "Participant";
            return Ji(/^profile\s*1$/i.test(t) ? "Jason" : t) || "Participant";
        }
        function hp(e) {
            const t = String(pz[e] || "").trim();
            if (t) return t;
            const n = bb(rt[e]);
            return n.length && n.every(e => [ "man", "trans-man", "intersex-man" ].includes(e)) ? "he/him" : n.length && n.every(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)) ? "she/her" : "they/them";
        }
        // Anonymous center avatar for a profile with no stored photo: matched to the
        // profile's gender as best as possible, through the same accessor (bb on rt)
        // the pronouns resolver (hp) above already uses. Genderfluid, mixed-side,
        // unknown, or absent gender takes the neutral default.
        // TODO: no feminine anonymous avatar asset exists yet, so the woman-side key
        // set maps to the neutral anonymous avatar too until one is made. The sample
        // profiles' menu portraits are those profiles' own icons, not generic
        // avatars — never substitute them here.
        function sxAnonAvatarPhoto(e) {
            const n = bb(rt[e]), a = "assets/avatar-anon.webp";
            const src = n.length && n.every(e => [ "man", "trans-man", "intersex-man" ].includes(e)) ? a : n.length && n.every(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)) ? a : a;
            return {
                data: src,
                width: 1600,
                height: 1600,
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0
            };
        }
        function od(e) {
            const t = [];
            return bb(rt[e]).length || t.push("gender"), iv(ot[e]).length || t.push("orientation"), 
            t;
        }
        function sd(e) {
            return e.filter(e => od(e).length).map(e => `${od(e).join(" and ")} for ${rd(e)}`).join("; ");
        }
        function ld(e, t, n) {
            const i = ca(e, t), a = ca(e, n);
            return `${rd(t)} — ${ad(i, e) || "no positive direction recorded"}; ${rd(n)} — ${ad(a, e) || "no positive direction recorded"}.`;
        }
        function cd(e, t) {
            const n = Array.isArray(t) ? t : [ t ];
            return {
                fantasyOnly: n.some(t => Ha(e, t)),
                alreadyTried: n.some(t => Wa(e, t))
            };
        }
        function dd(e) {
            return `${e.fantasyOnly ? " Fantasy only: keep this fictional and do not treat it as real-world willingness." : ""}${e.alreadyTried ? " Already tried: past experience may be referenced without inventing details." : ""}`;
        }
        function ud(e, t) {
            const n = Array.isArray(t) ? t : [ t ], i = e => n.filter(t => e(t)).map(e => rd(e)).join(", ") || "none";
            return `MARKERS — Favorite (★): ${i(t => "favorite" === Oa(e, t))}; Hard Limit (×): ${i(t => Ba(e, t, "limit"))}; Not Interested (⊘): ${i(t => Ba(e, t, "notinterested"))}; Fantasy-only (☁): ${i(t => Ha(e, t))}; Already Tried (✓): ${i(t => Wa(e, t))}.`;
        }
        // Established-rule note (writers, do not unify without a ruling):
        // the single-profile builder sxSingleProfileData() below establishes a topic by
        // Favorite OR by any single direction rating over 35
        // (s.give > 35 or s.receive > 35; score = the max qualifying
        // rating, or 100 for a Favorite). The pair builder
        // gdStrongMatches() establishes by sync-engine MATCH outcome
        // only, with NO score filter. These are two different intended
        // rules. The single-profile 35 is also a different 35 from the Heat teaser
        // threshold T = sxClamp(35 - heat, 0, 85) in the sync engine;
        // the shared numeral is coincidence, not a shared constant.
        // Established rule — INTENDED, do not "unify" (writers
        // refactor F10, documentation only): the single-profile rule
        // here is THRESHOLD-BASED — a topic is established when it is
        // marked Favorite OR when either direction rating is over 35
        // (give > 35 or receive > 35, each direction judged on its
        // own, never averaged); the established score is the max of
        // the over-35 direction ratings, or 100 for a Favorite with
        // none. The pair rule (gdStrongMatches, and the group rule in
        // sxMultiMatchData built on pair outcomes) is OUTCOME-BASED
        // instead: established means a sync-engine MATCH outcome,
        // with no score filter at all. The two rules differ
        // structurally on purpose; unifying them would change output
        // and needs the user's ruling, not a refactor. Note also:
        // the 35 above is a rating threshold and is a DIFFERENT 35
        // from Heat's T = clamp(35 − heat, 0, 85) in sxSides —
        // same number, unrelated meanings.
        function sxSingleProfileData(e) {
            const t = rd(e), n = [], i = [];
            let a = 0;
            return Uc().forEach(r => {
                if (ja(r, e)) return void a++;
                const o = qn[r];
                if (!o) return;
                const s = ca(r, e), l = "favorite" === Qe[e]?.[r], c = [ s.giveKnown && s.give > 35 ? s.give : null, s.receiveKnown && s.receive > 35 ? s.receive : null ].filter(e => null !== e), d = [ s.giveKnown && s.give >= 0 && s.give <= 35 ? s.give : null, s.receiveKnown && s.receive >= 0 && s.receive <= 35 ? s.receive : null ].filter(e => null !== e);
                if (l || c.length) {
                    const i = c.length ? Math.max(...c) : 100, a = cd(r, e);
                    n.push({
                        id: r,
                        label: o.label,
                        branch: o.branch,
                        score: i,
                        kind: l ? "favorite" : "interest",
                        ...a,
                        detail: `${t}${l ? " marked this Favorite" : ""}${l && ad(s, r) ? " · " : l ? "" : " wants to do · "}${ad(s, r) || "confirm the roles before starting"}.${dd(a)}`
                    });
                } else if (d.length || Ha(r, e)) {
                    const n = cd(r, e), a = d.length ? Math.max(...d) : 1;
                    i.push({
                        id: r,
                        label: o.label,
                        branch: o.branch,
                        score: a,
                        kind: "curious",
                        ...n,
                        detail: `${n.fantasyOnly ? "Fictional fantasy only:" : "Curious about — discuss before deciding:"} ${t} recorded ${ad(s, r) || "no real-world willingness"}. ${n.fantasyOnly ? "Do not treat this as a practical activity." : "Curious about is not Want to do; ask explicitly and make opting out easy."}${dd(n)}`
                    });
                }
            }), n.sort((e, t) => ("favorite" === t.kind) - ("favorite" === e.kind) || t.score - e.score || e.label.localeCompare(t.label)), 
            i.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label)), {
                name: t,
                established: n,
                curious: i,
                limits: a
            };
        }
        function sxPhaseSplit(e, t) {
            const n = e.concat(t).filter(e => "Connection & aftercare" === e.branch), i = e.filter(e => "Connection & aftercare" !== e.branch), a = t.filter(e => "Connection & aftercare" !== e.branch), r = i.slice(0, 1), o = i.slice(1).sort((e, t) => e.score - t.score || e.label.localeCompare(t.label)), s = o.slice(0, Math.ceil(o.length / 2)), l = o.slice(Math.ceil(o.length / 2)), c = Math.ceil(a.length / 2);
            return {
                established: e,
                curious: t,
                warmup: s.concat(a.slice(0, c)),
                escalation: l.concat(a.slice(c)),
                peak: r,
                aftercare: n
            };
        }
        // P1 refactor (Build 2026-10-18_2227): gd (Scribe/compatibility data
        // assembly) split by responsibility — gdPairReport computes the pair
        // report, gdStrongMatches the strong-match list, gdCuriousMatches
        // the curious-match list; gd itself is now a thin orchestrator.
        // One combined-match detail builder for every writer list
        // (refactor F7). The kind parameter selects the per-kind wording;
        // each branch reproduces its original string verbatim — a score,
        // a route via _d(), and the ld()/dd() fragments for the pair
        // kinds; the group kind lists every member's direction line; the
        // pairwise kind is the shared-ground line used by the Scribe
        // prompt's pairwise block.
        function sxMatchDetail(kind, x) {
            if ("strong" === kind) return `Combined match ${Math.round(x.score)}%. Matched direction: ${x.route ? _d(x.route, !0) : "recorded both ways"}. ${ld(x.id, x.ids[0], x.ids[1])}${dd(x.markers)}`;
            if ("curious" === kind) return `Combined match ${Math.round(x.score)}%. Curious about — discuss before deciding, with an easy opt-out. ${ld(x.id, x.ids[0], x.ids[1])} Preferred possible route: ${x.route ? _d(x.route, !0) : "recorded both ways"}.${dd(x.markers)}`;
            if ("group" === kind) return `Combined group match ${Math.round(x.score)}%. Matched directions: ${x.routes.map(e => _d(e, !0)).join("; ")}. ` + x.ids.map(id => `${rd(id)} — ${ad(ca(x.id, id), x.id) || "no positive direction recorded"}`).join("; ") + ".";
            return `${x.label} (${Math.round(x.score)}%${x.route ? `; ${_d(x.route, !0)}` : ""}) — ${ud(x.id, x.ids)}`;
        }
        function gdPairReport(e, t, sxSettings) {
                // Scribe's pair percentage comes from the sync engine v1.1:
                // the Play headline for play guides, the Conversation Kink
                // Factor for stories. No second formula survives here.
                const pair = sxPairByIds(e, t, sxSettings), story = "porn" === scribeMode, u = [], p = [];
                if (pair) pair.topics.forEach(rec => {
                    if ("invisible" === rec.outcome || "limit-blocked" === rec.outcome) return;
                    const x = qn[rec.id];
                    if (!x) return;
                    const route = rec.bestFit ? sxRouteRecord(rec.bestFit, rec.id) : null,
                        detail = route ? Qc(route, { give: rec.ratings.a.give, giveKnown: rec.ratings.a.giveKnown, receive: rec.ratings.a.receive, receiveKnown: rec.ratings.a.receiveKnown }, { give: rec.ratings.b.give, giveKnown: rec.ratings.b.giveKnown, receive: rec.ratings.b.receive, receiveKnown: rec.ratings.b.receiveKnown }, rd(e), rd(t), rec.id) : "";
                    2 === rec.flags.favoriteBy.length && ("match" === rec.outcome || "curious-fit" === rec.outcome) ? u.push({
                        id: rec.id,
                        label: x.label,
                        branch: x.branch,
                        score: rec.strength || 0,
                        detail: detail
                    }) : "curious-fit" === rec.outcome && p.push({
                        label: x.label,
                        score: rec.strength || 0,
                        detail: detail
                    });
                }), u.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label)), p.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label));
                return {
                    percent: pair ? (story ? pair.conversation.kinkFactor : pair.play.headline) || 0 : 0,
                    things: pair ? story ? pair.conversation.considered : pair.play.considered : 0,
                    clicks: pair ? pair.play.matches : 0,
                    limits: pair ? pair.coverage.limitBlocked : 0,
                    favorites: u,
                    conversation: p
                };
            }
        function gdStrongMatches(e, t, sxSettings) {
                // Established topics = sync engine v1.1 MATCH outcomes for
                // the pair (Conversation basis, so fantasy-marked topics
                // stay available to story mode; guides filter them later).
                // This is the OUTCOME-BASED pair established rule of
                // refactor F10: MATCH outcome only, no score filter —
                // deliberately unlike the threshold-based single-profile
                // rule documented at sxSingleProfileData.
                const i = [], pair = sxPairByIds(e, t, sxSettings);
                if (!pair) return i;
                return pair.topics.forEach(rec => {
                    if ("match" !== rec.outcome) return;
                    const s = qn[rec.id];
                    if (!s) return;
                    const d = [ e, t ].filter(x => "favorite" === Oa(rec.id, x)).map(x => rd(x)), u = d.length > 0, p = cd(rec.id, [ e, t ]), l = rec.bestFit ? sxRouteRecord(rec.bestFit, rec.id) : null, c = rec.strength || 0;
                    i.push({
                        id: rec.id,
                        label: s.label,
                        branch: s.branch,
                        score: c,
                        kind: u ? "favorite" : "interest",
                        favorite: u,
                        ...p,
                        matchLabel: u ? `favorite for ${d.join(" + ")}` : "compatible intensity",
                        route: l,
                        detail: sxMatchDetail("strong", { id: rec.id, score: c, route: l, ids: [ e, t ], markers: p })
                    });
                }), i.sort((e, t) => ("favorite" === t.kind) - ("favorite" === e.kind) || t.score - e.score || e.label.localeCompare(t.label)), i;
            }
        function gdCuriousMatches(e, t, n, sxSettings) {
                // Curious topics = sync engine v1.1 CURIOUS FIT outcomes.
                const o = [], pair = sxPairByIds(e, t, sxSettings);
                if (!pair) return o;
                return pair.topics.forEach(rec => {
                    if (n.has(rec.id) || "curious-fit" !== rec.outcome) return;
                    const d = qn[rec.id];
                    if (!d) return;
                    const y = [ e, t ].some(x => "favorite" === Oa(rec.id, x)), b = cd(rec.id, [ e, t ]), l = rec.bestFit ? sxRouteRecord(rec.bestFit, rec.id) : null, g = rec.strength || 0;
                    o.push({
                        id: rec.id,
                        label: d.label,
                        branch: d.branch,
                        score: g,
                        kind: "curious",
                        favorite: y,
                        ...b,
                        detail: sxMatchDetail("curious", { id: rec.id, score: g, route: l, ids: [ e, t ], markers: b })
                    });
                }), o.sort((e, t) => Number(t.favorite) - Number(e.favorite) || t.score - e.score || e.label.localeCompare(t.label)), o;
            }
        function sxCastMatchData(e, t, sxSettings) {
            // Writers Phase 3 (F4): the retired leniency slot is gone.
            // The writers' list builders filter on sync-engine outcomes
            // alone and no leniency field is stored on the result object;
            // sxWriterLeniency survives only as the brief meta's displayed
            // cast value, never as an input to list building.
            if (!t) {
                const t = sxSingleProfileData(e), n = sxPhaseSplit(t.established, t.curious);
                return Object.assign({
                    mode: "single",
                    limits: t.limits
                }, n);
            }
            const i = gdPairReport(e, t, sxSettings), a = gdStrongMatches(e, t, sxSettings), r = gdCuriousMatches(e, t, new Set(a.map(e => e.id)), sxSettings), o = sxPhaseSplit(a, r);
            return Object.assign({
                mode: "pair",
                report: i,
                limits: i.limits
            }, o);
        }
        function sxMultiMatchData(e, sxSettings) {
            // Writers Phase 3 (F4): the retired leniency slot is gone
            // (see sxCastMatchData); it never affected any outcome and is
            // not stored on the result object.
            if (e.length < 2) return sxCastMatchData(e[0], null);
            if (2 === e.length) return sxCastMatchData(e[0], e[1], sxSettings);
            // Group topics come from the sync engine v1.1 group aggregation:
            // a topic is established when pairs with a MATCH outcome are a
            // strict majority of the relevant pairs, curious when MATCH or
            // CURIOUS FIT pairs are a strict majority.
            // sxSettings (Scene Setter only) carries the session's
            // per-profile Heat/Veil into the group compute; Scribe callers
            // pass nothing and keep the unheated default.
            const grp = sxGroupCompute(e.map(x => sxProfileById(x)), sxSettings ? {
                heat: e.map(x => sxSettings[x] ? sxSettings[x].heat : 0),
                veil: e.map(x => sxSettings[x] ? sxSettings[x].veil : 50)
            } : {}), i = [], a = [], r = (t, n, i) => sxMatchDetail("group", { id: t, routes: n, score: i, ids: e });
            let limits = 0;
            return grp.topics.forEach(rec => {
                if (rec.groupLimited) return void limits++;
                if ("match" !== rec.playOutcome && "curious-fit" !== rec.playOutcome) return;
                const s = qn[rec.id] || Xn(rec.id) || e.map(x => (at[x] || {})[rec.id]).find(Boolean);
                if (!s) return;
                const l = grp.pairs.map(pr => pr.topicsById[rec.id]).filter(pr => pr && pr.bestFit).map(pr => sxRouteRecord(pr.bestFit, rec.id)),
                    c = rec.strength || 0, d = e.filter(x => "favorite" === Oa(rec.id, x)).map(x => rd(x)), u = d.length > 0, p = cd(rec.id, e),
                    curious = "curious-fit" === rec.playOutcome, h = {
                        id: rec.id,
                        label: s.label,
                        branch: s.branch,
                        score: c,
                        kind: curious ? "curious" : u ? "favorite" : "interest",
                        favorite: u,
                        ...p,
                        matchLabel: curious ? null : u ? `favorite for ${d.join(" + ")}` : "coordinated intensity",
                        routes: l,
                        detail: r(rec.id, l, c) + dd(p)
                    };
                curious ? (h.detail = `Curious about, not Want to do: include only after an explicit check-in. ${h.detail}`, 
                a.push(h)) : i.push(h);
            }), i.sort((e, t) => ("favorite" === t.kind) - ("favorite" === e.kind) || t.score - e.score || e.label.localeCompare(t.label)), 
            a.sort((e, t) => Number(t.favorite) - Number(e.favorite) || t.score - e.score || e.label.localeCompare(t.label)), 
            Object.assign({
                mode: "group",
                limits: limits
            }, sxPhaseSplit(i, a));
        }
        function sxHardLimitLines(e) {
            const t = [];
            return h.forEach(n => {
                const i = catId(n.name);
                e.some(e => {
                    const t = Oa(i, e);
                    return "limit" === t || "notinterested" === t;
                }) && t.push(`${n.name} — entire branch`);
            }), Uc().forEach(n => {
                if (!e.some(e => ja(n, e))) return;
                const i = qn[n] || Xn(n);
                i && t.push(i.branch && i.label !== i.branch ? `${i.label} — ${i.branch}` : i.label);
            }), [ ...new Set(t) ].sort((e, t) => e.localeCompare(t));
        }
        function sxIndividualProfileTexts(e, t, n = {}) {
            const i = new Set(t.established.concat(t.curious).map(e => e.id)), a = new Set(Uc().filter(t => e.some(e => ja(t, e)))), r = new Set(n.excludeFantasy ? Uc().filter(t => e.some(e => Ha(t, e))) : []);
            return e.map(e => {
                const t = sxSingleProfileData(e), n = t.established.concat(t.curious).filter(e => !a.has(e.id) && !r.has(e.id)), o = n.filter(e => i.has(e.id)), s = n.filter(e => !i.has(e.id)), l = t => `${t.label} — ${ud(t.id, [ e ])} SLIDER RATINGS AND ROLES — ${ad(ca(t.id, e), t.id) || t.kind}`;
                return [ `${rd(e)} — INDIVIDUAL PROFILE`, `- Within shared ground: ${o.map(l).join("; ") || "none recorded"}.`, `- Individual desires and differences: ${s.map(l).join("; ") || "none recorded"}.`, "- Use individual-only details for character texture, reactions, dialogue, and negotiation—not as permission to add an activity outside the authoritative shared ground." ].join(" ");
            }).join("  ");
        }
        let sxNovelAiFields = null, scribeMode = "porn", scribeTarget = "grok", scribeCastKey = "", scribePromptCache = "", scribeLengthValue = "5", scribeLengthDisplay = "~5", scribeRequestText = "", scribeLengthUnit = "paragraphs", scribeDetailLevel = "balanced";
        // Mode resolution (refactor F5), stated plainly: the target list
        // mixes outside-AI targets (novelai, yobitch, strictai) with
        // tones (suggestive, explicit); anything unrecognized falls back
        // to the general-AI target "grok". The NovelAI target always
        // writes a story, whatever the caller asked for; the YoBitch
        // target always writes a play guide; every other target follows
        // the caller's mode ("treatment" for a multi-profile cast,
        // "porn" for a single profile).
        function sxResolveScribeMode(target, callerMode) {
            const t = [ "novelai", "yobitch", "strictai", "suggestive", "explicit" ].includes(target) ? target : "grok";
            return {
                target: t,
                mode: "novelai" === t ? "porn" : "yobitch" === t || "treatment" === callerMode ? "treatment" : "porn"
            };
        }
        // One lookup table for every target's dialog wording (refactor
        // F5), replacing the parallel nested-ternary chains that used to
        // live in the prompt builder and the dialog prep: displayName is
        // the Scribe brief's name for the target, shortName the dialog
        // prep's, storyMeta the brief meta's story label, and head /
        // title / intro / help / note produce the prep dialog's heading,
        // brief title, brief intro, prompt help, and the post-generation
        // availability note. Per-target strings are preserved verbatim.
        const sxScribeTargets = {
            novelai: {
                displayName: "NovelAI",
                shortName: "NovelAI",
                storyMeta: "NovelAI story",
                head: () => "NovelAI Create Novel fields.",
                title: () => "NovelAI erotic story",
                intro: () => "Separated into copy-ready NovelAI fields. The Prompt includes slider ratings plus Favorite, Limit, Not Interested, Fantasy-only, and Already Tried markers.",
                help: () => "Copy each generated field into the matching NovelAI Create Novel field.",
                note: () => "NovelAI story fields generated, including the target length and PDF output request."
            },
            yobitch: {
                displayName: "YoBitch",
                shortName: "YoBitch",
                storyMeta: "AI story",
                head: () => "YoBitch play-guide prompt, ready to download and upload into Muse.",
                title: () => "YoBitch play guide",
                intro: () => "Includes slider ratings, all five topic markers, overlap results, limits, safeword decisions, and aftercare needs. Download it for the full guide.",
                help: () => "Copy the full prompt below or download it as a text file, then give it to YoBitch in a Muse chat.",
                note: (story, single) => `YoBitch play-guide prompt generated from ${single ? "the loaded profile, including limits, safeword decisions, and aftercare needs" : "the selected profiles, overlap results, limits, safewords, and aftercare needs"}.`
            },
            strictai: {
                displayName: "Strict AI",
                shortName: "Strict AI",
                storyMeta: "Strict-AI story",
                head: () => "Toned-down prompt for Gemini, ChatGPT, or another strict AI, ready to download.",
                title: story => story ? "Suggestive story" : "Toned-down play guide",
                intro: () => "Uses suggestive, non-graphic language while preserving slider ratings, every topic marker, recorded boundaries, and roles.",
                help: () => "Copy the prompt below or download it, then give it to Gemini, ChatGPT, or another strict AI.",
                note: story => `Strict-AI ${story ? "story" : "play-guide"} prompt generated with suggestive, non-graphic language.`
            },
            suggestive: {
                displayName: "Suggestive",
                shortName: "Suggestive",
                storyMeta: "Suggestive story",
                head: () => "Suggestive prompt for a moderately strict AI, ready to download.",
                title: story => story ? "Suggestive story" : "Suggestive play guide",
                intro: () => "Uses sensual, non-graphic language while preserving slider ratings, every topic marker, recorded boundaries, and roles.",
                help: () => "Copy the prompt below or download it, then give it to a moderately strict AI such as Gemini, ChatGPT, or Claude.",
                note: story => `Suggestive ${story ? "story" : "play-guide"} prompt generated with sensual, non-graphic language.`
            },
            explicit: {
                displayName: "Explicit",
                shortName: "Explicit",
                storyMeta: "Explicit story",
                head: () => "Explicit prompt with a restrained tone, ready to download.",
                title: story => story ? "Explicit story" : "Explicit play guide",
                intro: () => "Uses restrained, explicit language while preserving slider ratings, every topic marker, recorded boundaries, and roles.",
                help: () => "Copy the full prompt below or download it as a text file, then give it to Grok, Claude, or another capable AI.",
                note: story => `Explicit ${story ? "story" : "play-guide"} prompt generated with restrained, explicit language.`
            },
            grok: {
                displayName: "General AI",
                shortName: "AI-agnostic",
                storyMeta: "AI story",
                head: story => story ? "AI-agnostic story prompt, ready to download and upload into Grok, Gemini, Claude, or another capable AI." : "AI-agnostic play-guide prompt, ready to download.",
                title: story => story ? "Literotica-style story" : "Play guide",
                intro: (story, single) => story ? "Weighted from slider ratings and all five topic markers. Limits stay out; favorites lead; fantasy-only stays clearly imagined; already-tried becomes past experience." : single ? "Built from this profile’s slider ratings and all five topic markers. Limits and fantasy-only topics stay out of practical play." : "Built from compatible ratings, all five topic markers, and the filled negotiation checklist.",
                help: () => "Copy the full prompt below or download it as a text file, then give it to Grok, Gemini, Claude, or another capable AI.",
                note: (story, single) => story ? "AI-agnostic story prompt generated from the selected profile data." : `AI-agnostic play guide generated from ${single ? "the loaded profile" : "the current Group and negotiation checklist"}.`
            }
        };
        function sxScribeTargetInfo(target) {
            return sxScribeTargets[target] || sxScribeTargets.grok;
        }
        // One match-data computation per generation (refactor F8): the
        // dialog prep (counts) and the prompt build used to run the same
        // gd/md computation back to back with identical inputs; the
        // generate handler now computes it once and hands it to both.
        // Standalone callers (profile-save refresh) pass nothing and the
        // prep computes it itself, exactly as before.
        function sxScribeMatchData(ids, single) {
            return "novelai" === scribeTarget || ids.length > 2 ? sxMultiMatchData(ids) : sxCastMatchData(scribeLeadId, single ? null : scribePartnerId);
        }
        // Established dominant/submissive pairings from recorded
        // direction scores, one entry per profile pair (extracted from
        // the prompt builder, refactor F1).
        function sxRoleDynamics(ids) {
            return Id(ids).map(([first, second]) => {
                const firstRole = Vc(first), secondRole = Vc(second), preferred = Xc(firstRole, secondRole);
                if (!preferred) return null;
                const dominantId = "firstGive" === preferred ? first : second, submissiveId = "firstGive" === preferred ? second : first;
                return {
                    firstRole: firstRole,
                    secondRole: secondRole,
                    preferred: preferred,
                    dominantId: dominantId,
                    submissiveId: submissiveId,
                    text: `${rd(dominantId)} is the established dominant and ${rd(submissiveId)} is the established submissive.`
                };
            }).filter(Boolean);
        }
        function Ad(e) {
            const t = String(scribeRequestText || "").trim();
            return t ? [ `USER’S ${e ? "STORY" : "PLAY-GUIDE"} REQUEST — CREATIVE DIRECTION`, t, "Honor this request wherever it fits the selected hypermap data. If any part conflicts with a hard exclusion, recorded role, shared-ground boundary, consent rule, or other binding requirement below, omit the conflicting part and preserve the binding profile data." ].join("\n") : "";
        }
        function unitWord(e, t) {
            const n = {
                words: [ "word", "words" ],
                paragraphs: [ "paragraph", "paragraphs" ],
                pages: [ "page", "pages" ],
                chapters: [ "chapter", "chapters" ]
            }[t] || [ "paragraph", "paragraphs" ];
            return "1" === String(e) ? n[0] : n[1];
        }
        // One parameterized phase-section builder (refactor F2): the
        // Scribe and Scene Setter dialogs have identical phase controls
        // apart from the element-ID prefix (scribePhase* / setterPhase*)
        // and one header sentence, both passed in here.
        function sxPhaseSection(prefix, header) {
            const dur = {
                brief: "a short portion of the total length",
                standard: "a medium portion of the total length",
                extended: "a long portion of the total length",
                marathon: "the largest portion of the total length"
            }, val = id => String(e.byId(prefix + id)?.value || "").trim(), on = id => Boolean(e.byId(prefix + id)?.checked), rows = [];
            return on("PhaseWarmupOn") && rows.push(`- Warm-up: ${val("PhaseWarmupIntensity")} intensity, lasting ${dur[val("PhaseWarmupDuration")] || dur.standard} — ease in, build anticipation, and set the tone before the main phase.`),
            on("PhaseMainOn") && rows.push(`- Main phase: ${val("PhaseMainIntensity")} intensity, lasting ${dur[val("PhaseMainDuration")] || dur.standard} — the core of the scene, carrying the strongest established interests.`),
            on("PhaseCooldownOn") && rows.push(`- Cool-down / aftercare: ${val("PhaseCooldownStyle")}, lasting ${dur[val("PhaseCooldownDuration")] || dur.standard} — wind down gradually and close with care.`),
            rows.length ? [ "SCENE STRUCTURE", header, ...rows ].join("\n") : "";
        }
        function scribePhaseSection() {
            return sxPhaseSection("scribe", "Organize the output into the following phases, in this order, pacing each phase to its stated duration and transitioning clearly between phases:");
        }
        function setterPhaseSection() {
            return sxPhaseSection("setter", "Organize the play guide into the following phases, in this order, pacing each phase to its stated duration and transitioning clearly between phases:");
        }
        // Phase toggle wiring shared by both dialogs (refactor F2):
        // the prefix selects the dialog ("scribe" or "setter"); each
        // phase's dependent selects stay disabled while its checkbox
        // is off.
        function sxWirePhaseToggles(prefix) {
            [ [ "PhaseWarmupOn", "PhaseWarmupIntensity", "PhaseWarmupDuration" ], [ "PhaseMainOn", "PhaseMainIntensity", "PhaseMainDuration" ], [ "PhaseCooldownOn", "PhaseCooldownStyle", "PhaseCooldownDuration" ] ].forEach(([t, ...n]) => {
                const i = e.byId(prefix + t), a = () => n.forEach(t => {
                    const n = e.byId(prefix + t);
                    n && (n.disabled = !i || !i.checked);
                });
                i && (i.addEventListener("change", a), a());
            });
        }
        function setterDetailsSection() {
            const t = String(e.byId("setterDetails")?.value || "").trim();
            return t ? [ "SCENE DETAILS — PROVIDED BY THE PARTICIPANTS", t, "Weave these details into the play guide wherever they fit the binding negotiation checklist above. If any part conflicts with a hard limit, a red topic, or another binding requirement, omit the conflicting part." ].join("\n") : "";
        }
        // Shared prompt sections for both Scribe composers (refactor
        // F1): the cast line and unnamed-partner line, the established /
        // curious splits, marker handling + rated preference detail, the
        // hard-excluded limits line, the role-dynamics block, the
        // authoritative full-group shared ground, the pairwise shared
        // ground, the combined group block, and the length/detail plan
        // lines — everything the story and guide composers share. Pure
        // text assembly from the match data; no DOM writes.
        function sxScribeSharedSections(o, s, u, p, f, g, m) {
            const A = o.map(e => `- ${function(e) {
                const t = bb(rt[e]), n = iv(ot[e]), i = rd(e), r = Kb(st[e], ", "), a = hp(e), l = String(pz[e] || "").trim();
                return `${i}: gender: ${t.length ? vb(t, " and ") : "unspecified"}; orientation: ${n.length ? Nb(n, " and ") : "unspecified"}${r ? `; roles: ${r}` : ""}. Pronouns for ${i}: ${a}. Do not infer anatomy from gender labels. Gender, orientation, and roles guide identity and partner-gender choices only.`;
            }(e)}`).join(" "), C = s ? `  UNNAMED PARTNER GENDER: - ${function(e) {
                const t = bb(rt[e]), n = iv(ot[e]), i = n.find(e => ![ "sapiosexual", "demisexual", "asexual", "questioning", "other", "private" ].includes(e)) || n[0], a = rd(e), r = t.some(e => [ "man", "trans-man", "intersex-man" ].includes(e)) && !t.some(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)), o = t.some(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)) && !t.some(e => [ "man", "trans-man", "intersex-man" ].includes(e)), s = Nb(n, " and "), l = [ n.includes("sapiosexual") ? "Treat intellectual connection as an important part of attraction." : "", n.includes("demisexual") && "demisexual" !== i ? "Do not invent attraction without a strong emotional bond." : "" ].filter(Boolean).join(" "), c = e => `${e}${l ? ` ${l}` : ""}`;
                if (!n.length) return c(`${a}’s orientation is unspecified. Choose an adult partner gender without inventing anatomy or unsupported relationship history.`);
                return "straight" === i || "heterosexual" === i ? c(r ? `Choose an adult woman as ${a}’s unnamed partner to fit ${a}’s ${s.toLowerCase()} identity.` : o ? `Choose an adult man as ${a}’s unnamed partner to fit ${a}’s ${s.toLowerCase()} identity.` : `Choose an adult partner configuration consistent with ${a}’s ${s.toLowerCase()} identity; this shared profile does not identify one person’s gender.`) : "lesbian" === i ? c(`Choose an adult woman as ${a}’s unnamed partner. Do not infer anatomy.`) : "gay" === i ? c(r ? `Choose an adult man as ${a}’s unnamed partner. Do not infer anatomy.` : o ? `Choose an adult woman as ${a}’s unnamed partner. Do not infer anatomy.` : `Choose an adult partner gender consistent with ${a}’s gay identity; the profile does not identify one person’s gender.`) : "heteroflexible" === i ? c(r ? `Prefer an adult woman as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s heteroflexible identity.` : o ? `Prefer an adult man as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s heteroflexible identity.` : `Choose an adult partner gender consistent with ${a}’s heteroflexible identity.`) : "homoflexible" === i ? c(r ? `Prefer an adult man as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s homoflexible identity.` : o ? `Prefer an adult woman as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s homoflexible identity.` : `Choose an adult partner gender consistent with ${a}’s homoflexible identity.`) : [ "bisexual", "pansexual", "queer", "fluid", "bicurious", "omnisexual" ].includes(i) ? c(`Choose an adult partner gender that fits ${a}’s ${s.toLowerCase()} identity; do not default automatically to an opposite-gender partner, and do not infer anatomy.`) : c("asexual" === i ? `${a} is asexual, which does not determine partner gender. Choose any adult partner gender only as the story needs, without inventing sexual-attraction assumptions.` : "demisexual" === i ? `${a} is demisexual, which does not determine partner gender. Choose any adult partner gender without inventing anatomy or unsupported relationship history.` : `${a}’s recorded sexuality (${s}) does not determine one partner gender. Choose an adult partner gender without contradicting that identity or inventing anatomy.`);
            }(scribeLeadId)}` : "", M = u ? f.established.filter(e => "Connection & aftercare" !== e.branch) : f.established, I = u ? f.curious.filter(e => "Connection & aftercare" !== e.branch) : f.curious, P = g.length ? u ? `- FANTASY ONLY: ${g.map(e => e.label).join(", ")}. These may appear only as clearly imagined fantasies; never treat them as real-world willingness or consent.` : `- ${g.length} fantasy-only ${1 === g.length ? "topic is" : "topics are"} omitted from this practical guide. Their names are intentionally absent from the prompt.` : "", L = m.length ? `- ALREADY TRIED: ${m.map(e => e.label).join(", ")}. Explicitly reference this as past experience without inventing details or assuming current consent.` : "";
            var T;
            const F = [ (T = u, [ "MARKER HANDLING — BINDING:", ...i, ...T ? a : r ].map(e => "MARKER HANDLING — BINDING:" === e ? e : `- ${e}`).join(" ")), P, L, M.concat(I).map(e => `- ${e.label}: ${ud(e.id, o)} SLIDER RATINGS AND ROLES — ${(u ? td : ed)(e.detail)}`).join(" ") ].filter(Boolean).join(" ") || "- none recorded", N = sxHardLimitLines(o).length, _ = N ? `- ${N} hard-excluded ${1 === N ? "topic is" : "topics are"} omitted from this prompt. Their names are intentionally absent.` : "- No hard-excluded topics are marked.", D = s ? "" : [ "ESTABLISHED ROLE DYNAMICS — INFERRED FROM RECORDED DIRECTION SCORES", p.length ? p.map(e => `- ${e.text}`).join(" ") : "- No clear complementary dominant/submissive pairing is established.", "- When a clear pairing is listed, keep those dominant/submissive roles stable throughout. Do not suggest, schedule, or narrate a role reversal; explicit per-activity give/receive directions still control who performs each named activity." ].join(" "), R = s ? "" : [ "AUTHORITATIVE FULL-GROUP SHARED GROUND — PRECOMPUTED", `- Scores computed by the sync comparison engine (v1.1).`, `- Established: ${M.map(e => `${e.label} (${Math.round(e.score)}%${e.route ? `; ${_d(e.route, !0)}` : e.routes ? `; ${e.routes.map(e => _d(e, !0)).join(" | ")}` : ""})`).join("; ") || "none"}.`, `- Curious: ${I.map(e => `${e.label} (${Math.round(e.score)}%${e.route ? `; ${_d(e.route, !0)}` : e.routes ? `; ${e.routes.map(e => _d(e, !0)).join(" | ")}` : ""})`).join("; ") || "none"}.`, "- This is the already-computed overlap for every selected profile. Treat it as authoritative. Do not calculate, infer, broaden, or recompute the intersection yourself.", "- Activities may come only from this full-group shared ground. Pairwise and individual profiles add character texture and dynamics, not new activity permission." ].join(" "), O = s ? "" : function(e, n = {}) {
                if (e.length < 3) return "";
                const i = new Set(Uc().filter(t => e.some(e => ja(t, e)))), a = new Set(n.excludeFantasy ? Uc().filter(t => e.some(e => Ha(t, e))) : []);
                return Id(e).map(([e, n]) => {
                    const r = sxCastMatchData(e, n), o = t => sxMatchDetail("pairwise", { ...t, ids: [ e, n ] }), s = r.established.filter(e => !i.has(e.id) && !a.has(e.id)).map(o).join("; ") || "none", l = r.curious.filter(e => !i.has(e.id) && !a.has(e.id)).map(o).join("; ") || "none";
                    return [ `PAIRWISE SHARED GROUND — ${rd(e)} + ${rd(n)}`, `- Precomputed overlap from the sync comparison engine (v1.1). Do not recalculate it.`, `- Established: ${s}.`, `- Curious: ${l}.`, "- This pairing profile may shape pair dynamics only within the authoritative full-group shared ground." ].join(" ");
                }).join("  ");
            }(o, {
                excludeFantasy: !u
            }), B = [ D, R, O, s ? "" : sxIndividualProfileTexts(o, f, {
                excludeFantasy: !u
            }) ].filter(Boolean).join("  "), j = unitWord(scribeLengthValue, scribeLengthUnit), z = "concise" === scribeDetailLevel ? "Keep the document concise: short phase notes and only essential check-ins." : "detailed" === scribeDetailLevel ? "Use high detail: specific phase timing, transitions, role cues, check-ins, stop options, and aftercare steps." : "Use balanced detail: enough timing, transitions, role cues, check-ins, and aftercare to follow without over-scripting.", q = !u ? `- Plan approximately ${scribeLengthValue} ${j}, with flexible phase pacing that adds up to that target while allowing check-ins, pauses, or stopping. ${z}` : `- Target approximately ${scribeLengthValue} ${j} in the downloadable PDF, using readable 11–12 pt body text and standard margins. Keep the complete chat text and PDF text identical. ${z}`, H = [ "", `CAST, GENDER & SEXUALITY: ${A}${C}`, s ? "" : ` ${B}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `HARD-EXCLUDED LIMITS: ${_}` ];
            return { A: A, C: C, M: M, I: I, F: F, _: _, D: D, R: R, O: O, B: B, j: j, q: q, H: H };
        }
        // On-screen brief rendering (writers refactor, Phase 1):
        // the brief meta line, the negotiation title and list, and
        // the four phase lists, split out of the prompt builder.
        // DOM writes only — the prompt text itself is assembled by
        // the composers and the finisher below.
        function sxRenderScribeBrief(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f, targetInfo, targetDisplayName: k } = ctx;
            n(e.byId("sceneBriefMeta"), `<span>${Hi(b)}</span><span>${u ? targetInfo.storyMeta : `${k} play guide`}</span><span>Target ${Hi(scribeLengthValue)} ${unitWord(scribeLengthValue, scribeLengthUnit)} · ${Hi("detailed" === scribeDetailLevel ? "high detail" : "concise" === scribeDetailLevel ? "concise" : "balanced detail")}</span>${s ? "" : `<span>Cast ${sxWriterLeniency}</span>`}<span>${f.established.length} ${y}${1 === f.established.length ? "" : "s"}</span><span>${f.curious.length} curious</span>${g.length ? `<span>${g.length} fantasy-only ${u ? "kept fictional" : "excluded"}</span>` : ""}${m.length ? `<span>${m.length} already tried</span>` : ""}<span>${f.limits} limit${1 === f.limits ? "" : "s"} excluded</span>`);
            const establishedLabels = f.established.map(e => e.label).join(" · ") || "None recorded", curiousLabels = f.curious.map(e => e.label).join(" · ") || "None recorded";
            e.byId("sceneNegotiationTitle").textContent = u ? "Story ingredients" : "Negotiation notes";
            const roleDynamicItem = p.length ? `<li><strong>Established role dynamic</strong><span>${Hi(h)} Keep these dominant/submissive roles stable; do not suggest switching them.</span></li>` : "";
            if (u) n(e.byId("sceneNegotiation"), `<li><strong>Cast</strong><span>${Hi(s ? d + " with an unnamed adult partner" : w)}</span></li>${roleDynamicItem}<li><strong>Want to do</strong><span>${Hi(establishedLabels)}</span></li><li><strong>Curious about</strong><span>${Hi(curiousLabels)}</span></li>${g.length ? `<li><strong>Fantasy only</strong><span>${Hi(g.map(e => e.label).join(" · "))}. Keep these fictional; they do not signal real-world willingness.</span></li>` : ""}${m.length ? `<li><strong>Already tried</strong><span>${Hi(m.map(e => e.label).join(" · "))}. Past experience may shape the story without inventing details.</span></li>` : ""}`); else {
                const t = s ? `<li><strong>Source profile</strong><span>${Hi(d)} only. A partner’s preferences are not assumed.</span></li>` : `<li><strong>Group profiles</strong><span>${Hi(w)}</span></li>`;
                n(e.byId("sceneNegotiation"), `${t}${roleDynamicItem}<li><strong>Want to do</strong><span>${Hi(establishedLabels)}</span></li><li><strong>Curious about</strong><span>${Hi(curiousLabels)}</span></li>${g.length ? `<li><strong>Fantasy only — excluded</strong><span>${Hi(g.map(e => e.label).join(" · "))}. Do not schedule or suggest these in real-world play.</span></li>` : ""}${m.length ? `<li><strong>Already tried</strong><span>${Hi(m.map(e => e.label).join(" · "))}. Prior experience may inform pacing and check-ins.</span></li>` : ""}<li><strong>Before starting</strong><span>Confirm every named activity, actual intensity, pacing, roles, stop signals, and practical details. Curious about is not Want to do; ask explicitly before including it.</span></li>`);
            }
            const renderPhaseList = (listId, items, emptyText) => {
                const r = e.byId(listId);
                items.length ? n(r, items.map(e => `<li><strong>${Hi(function(e) {
                    const t = "curious" === e.kind ? "Curious about · " : "favorite" === e.kind ? "Favorite · " : "", n = e.matchLabel ? ` · ${Math.round(e.score)}% ${e.matchLabel}` : "curious" === e.kind ? ` · curious ${Math.round(e.score)}` : ` · interest ${Math.round(e.score)}`;
                    return t + e.label + n;
                }(e))}</strong><span>${Hi(ed(e.detail))}</span></li>`).join("")) : n(r, `<li>${Hi(emptyText)}</li>`);
            };
            renderPhaseList("sceneWarmup", f.warmup, u ? "Open directly into the fantasy." : "No separate warm-up item is recorded."), 
            renderPhaseList("sceneEscalation", f.escalation, u ? "Escalate naturally from the listed interests." : "No additional escalation or exploration item is recorded."), 
            renderPhaseList("scenePeak", f.peak, u ? "Choose the strongest listed interest for the climax." : "No established non-aftercare favorite or interest is recorded for a peak. Keep it open until agreed together."), 
            __sxClosestAction(e.one("#sceneAftercare"), "scenePhase").querySelector("h4").textContent = u ? "Closing" : "Aftercare", 
            renderPhaseList("sceneAftercare", u ? [] : f.aftercare, u ? "End with a satisfying erotic denouement after the climax." : "No aftercare preference is recorded. Agree on aftercare before beginning.");
        }
        // Story composer (refactor F1): assembles the story-mode
        // prompt for the resolved target from the shared sections.
        // Top-level (writers refactor, Phase 1): the builder's
        // context object carries the assembled sections and
        // match data; the body is the former story branch,
        // unchanged.
        function sxComposeScribeStory(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f } = ctx, { A, C, M, I, F, _, D, R, O, B, j, q, H } = ctx.sections;
            // One story-ingredients line (writers refactor): the four
            // target branches below repeated this line verbatim; it is
            // built once here from the shared sections' lists, so the
            // wording and the empty-state text have a single owner.
            const sxStoryIngredients = `STORY INGREDIENTS: - Established: ${M.map(e => e.label).join("; ") || "none recorded"}. - Curious: ${I.map(e => e.label).join("; ") || "none recorded"}.`;
            let composedPromptText;
            const e = s ? `${d} with an unnamed adult partner` : w;
            composedPromptText = "novelai" === scribeTarget ? function(e, t = {}) {
                const n = String(t.names || "").trim(), i = String(t.dynamic || "").trim(), a = n.replace(/, and | and /g, " & "), r = [ Ad(!0), String(e || "").trim(), sxAboutBlock(o, v), sxTermsBlock(o, v, { flavor: !0 }), sxAgeBlock(o, v) ].filter(Boolean).join("\n\n");
                return sxNovelAiFields = {
                    genre: "Erotica",
                    title: a ? `${a}: Behind Closed Doors` : "Behind Closed Doors",
                    characterName: n || "Use the first names stated in the prompt.",
                    personality: i ? `Preserve this established character dynamic throughout: ${i}` : "Let the characters’ personalities emerge from the supplied preferences and scene. Do not invent unsupported traits.",
                    world: "Use the setting described in the prompt. If none is specified, choose a private contemporary setting.",
                    prompt: r
                }, [ "NOVELAI CREATE NOVEL — COPY-READY FIELDS", "", `GENRE\n${sxNovelAiFields.genre}`, "", `TITLE\n${sxNovelAiFields.title}`, "", `CHARACTER NAME\n${sxNovelAiFields.characterName}`, "", `PERSONALITY\n${sxNovelAiFields.personality}`, "", `WORLD\n${sxNovelAiFields.world}`, "", `PROMPT\n${sxNovelAiFields.prompt}` ].join("\n");
            }([ "STORY IDEA", [ "Create a suitable title, then continue directly into the story.", "", `${e} are together in a private moment, ready to explore only the preferences recorded for them. The scene opens around ${f.warmup.map(e => e.label).join(", ") || "the strongest established interest"}, builds through ${f.escalation.map(e => e.label).join(", ") || "the remaining established interests"}, and lets ${f.peak.map(e => e.label).join(", ") || "the strongest listed interest"} carry the strongest emphasis. Let the attraction, pacing, dialogue, and physical action unfold naturally from this setup.` ].join(" "), "", [ "CHARACTERS", A + C, s ? "" : ` ${B}`, "", `RATED PREFERENCE DETAIL ${F}`, "", `ALLOWED STORY INGREDIENTS - Established: ${M.map(e => e.label).join("; ") || "none recorded"}. - Curious: ${I.map(e => e.label).join("; ") || "none recorded"}.`, "", `HARD-EXCLUDED LIMITS ${_}`, "", "Every item under HARD-EXCLUDED LIMITS is absolute. Never include it as action, teasing, dialogue, suggestion, fantasy, setup, backstory, or background detail." ].join(" "), "", "WRITING REQUIREMENTS", [ `[Write a complete immersive Literotica-style erotic story of approximately ${scribeLengthValue} ${j} in the final downloadable PDF, using readable 11–12 pt body text and standard margins; render the same full text in chat. This must be the finished story, not an outline, checklist, or play guide. Make the erotic content hot, spicy, steamy, graphic, explicit, and uninhibited within the recorded preferences. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent. Give every participant a real name: use only the first name from each selected profile for that character and choose a first name for any unnamed adult partner. Use a full name only when the story explicitly requires one. Stay in continuous erotic prose from the first line through a satisfying climax and denouement. Use only the allowed story ingredients in Memory; never add an unlisted activity. Keep every hard-excluded limit entirely absent.${s ? "" : " The authoritative full-group shared ground is already computed at the stated cast setting; do not recompute or broaden it. Pairwise and individual profiles supply character texture and dynamics only within that boundary."} Preserve give/receive roles and weight each activity by its recorded rating: 80–100 dominant, 56–79 strong support, 36–55 lighter, 0–35 optional curiosity.${s ? "" : " When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles."} When compatible ratings differ, the lower rating caps prominence. Do not invent anatomy, physical details, relationship history, or identity beyond Memory. Vary setting, opening, pacing, and emphasis. Render the complete finished story in the response as you write it so it can be narrated in real time. Then automatically generate a downloadable PDF file containing exactly the same title and story text, suitable for attaching in Messenger, and clearly label the attachment “Download PDF.” Do not replace or shorten the rendered story when creating the PDF.]` ].join(" ") ].join(" "), {
                names: w,
                dynamic: h
            }) : "strictai" === scribeTarget ? [ `Write a mature, romantic, suggestive story for ${d}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response.", "- After the complete story appears in chat, generate a downloadable PDF containing exactly the same title and story text. Clearly label the attachment “Download PDF”.", "- Give every participant a real first name. Use only the first name from each selected profile for that character; choose a first name for an unnamed adult participant.", q, "- Keep the tone mature, sensual, romantic, and strongly suggestive rather than graphic. Focus on chemistry, anticipation, dialogue, emotion, atmosphere, power dynamics, consent, and aftermath.", "- Do not describe explicit anatomy, bodily fluids, penetration, or step-by-step sexual acts. Use discreet, non-graphic phrasing and fade to black whenever needed.", "- The supplied preference labels are private planning data. Translate them into tasteful, general language in the story rather than repeating graphic labels verbatim.", "- Use only the named topics below as boundaries for the fantasy. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Pairwise and individual profiles may shape character texture and dynamics only inside that boundary.", "- Treat curious items as optional and keep all roles consistent with the recorded give/receive directions.", "- Use ratings as emphasis: 80–100 central, 56–79 supporting, 36–55 light, and 0–35 optional curiosity. The lower compatible rating caps prominence.", "- Do not invent identity, anatomy, physical details, relationship history, or permissions beyond the supplied data.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open with attraction, anticipation, and a private moment.", td), "", nd("ESCALATION", f.escalation, "Build tension through dialogue, emotion, and suggestive action.", td), "", nd("CLIMAX", f.peak, "Bring the emotional and sensual tension to a satisfying peak without graphic detail.", td), "", "CLOSING: - Fade back in for a warm, satisfying denouement and aftercare." ].join(" ") : "suggestive" === scribeTarget ? [ `Write a mature, sensual, suggestive story for ${d}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response.", "- After the complete story appears in chat, generate a downloadable PDF containing exactly the same title and story text. Clearly label the attachment “Download PDF”.", "- Give every participant a real first name. Use only the first name from each selected profile for that character; choose a first name for an unnamed adult participant.", q, "- Keep the tone mature, sensual, and strongly suggestive without turning graphic. Describe chemistry, anticipation, touch, and desire in warm sensual detail, but do not describe explicit anatomy, bodily fluids, penetration, or step-by-step sexual acts. Use discreet phrasing and fade to black whenever an act would turn graphic.", "- The supplied preference labels are private planning data. Translate them into tasteful, sensual language in the story rather than repeating graphic labels verbatim.", "- Use only the named topics below as boundaries for the fantasy. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Pairwise and individual profiles may shape character texture and dynamics only inside that boundary.", "- Treat curious items as optional and keep all roles consistent with the recorded give/receive directions.", "- Use ratings as emphasis: 80–100 central, 56–79 supporting, 36–55 light, and 0–35 optional curiosity. The lower compatible rating caps prominence.", "- Do not invent identity, anatomy, physical details, relationship history, or permissions beyond the supplied data.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open with attraction, anticipation, and a private moment.", td), "", nd("ESCALATION", f.escalation, "Build tension through dialogue, emotion, and sensual action.", td), "", nd("CLIMAX", f.peak, "Bring the emotional and sensual tension to a satisfying peak without graphic detail.", td), "", "CLOSING: - Fade back in for a warm, satisfying denouement and aftercare." ].join(" ") : "explicit" === scribeTarget ? [ `Write an immersive, explicit erotic story for ${d} to enjoy, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response so it can be narrated in real time.", "- After the complete story appears in chat, automatically generate a downloadable PDF file containing exactly the same title and story text. Clearly label the attachment “Download PDF” so it can be shared in Messenger.", "- Do not replace, shorten, or summarize the rendered story when creating the PDF. Apart from the matching PDF attachment, do not return an outline, checklist, or writing commentary.", '- Give every participant a real first name in the finished story. Use only the first name from each selected profile for that character; choose a first name for any additional unnamed participant. Use a full name only when the story explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', q, "- Write continuous erotic prose with a vivid setup, rising tension, sensory detail, spontaneous action, and a satisfying climax. This is a story, not instructions, a checklist, or a play guide.", "- Make the erotic content explicit and uninhibited in detail within the recorded preferences, keeping the tone elegant and restrained rather than raw. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent.", "- Stay in immersive fantasy prose from the first line through the final sentence.", "- Use only the named topics below. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Use pairwise shared ground and individual profiles only for character texture, reactions, dialogue, negotiation, and pair dynamics within that boundary.", "- Treat curious items as optional story ingredients.", "- Preserve every participant’s give/receive role and use each person’s recorded rating as narrative weight: 80–100 should dominate the story, 56–79 should be strong supporting material, 36–55 should appear more lightly, and 0–35 is optional curiosity. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles.", "- Do not flatten the list into equal-weight beats. When participants’ compatible ratings differ, the lower rating caps how prominent that shared beat should be.", "- Vary the scenario, setting, opening, pacing, and emphasis each time while staying inside this preference pool.", "- Do not invent identity details beyond the recorded profile data and unnamed-partner guidance; do not invent physical details, anatomy, or relationship facts.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open directly into the fantasy.", td), "", nd("ESCALATION", f.escalation, "Escalate naturally from the listed interests.", td), "", nd("CLIMAX", f.peak, "Choose the strongest listed interest for the climax.", td), "", "CLOSING: - End with a satisfying erotic denouement after the climax." ].join(" ") : [ `Write an immersive Literotica-style porn story for ${d} to enjoy and masturbate to, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response so it can be narrated in real time.", "- After the complete story appears in chat, automatically generate a downloadable PDF file containing exactly the same title and story text. Clearly label the attachment “Download PDF” so it can be shared in Messenger.", "- Do not replace, shorten, or summarize the rendered story when creating the PDF. Apart from the matching PDF attachment, do not return an outline, checklist, or writing commentary.", '- Give every participant a real first name in the finished story. Use only the first name from each selected profile for that character; choose a first name for any additional unnamed participant. Use a full name only when the story explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', q, "- Write continuous erotic prose with a vivid setup, rising tension, sensory detail, spontaneous action, and a satisfying climax. This is a story, not instructions, a checklist, or a play guide.", "- Make the erotic content hot, spicy, steamy, graphic, explicit, and uninhibited within the recorded preferences. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent.", "- Stay in immersive fantasy prose from the first line through the final sentence.", "- Use only the named topics below. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Use pairwise shared ground and individual profiles only for character texture, reactions, dialogue, negotiation, and pair dynamics within that boundary.", "- Treat curious items as optional story ingredients.", "- Preserve every participant’s give/receive role and use each person’s recorded rating as narrative weight: 80–100 should dominate the story, 56–79 should be strong supporting material, 36–55 should appear more lightly, and 0–35 is optional curiosity. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles.", "- Do not flatten the list into equal-weight beats. When participants’ compatible ratings differ, the lower rating caps how prominent that shared beat should be.", "- Vary the scenario, setting, opening, pacing, and emphasis each time while staying inside this preference pool.", "- Do not invent identity details beyond the recorded profile data and unnamed-partner guidance; do not invent physical details, anatomy, or relationship facts.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open directly into the fantasy.", td), "", nd("ESCALATION", f.escalation, "Escalate naturally from the listed interests.", td), "", nd("CLIMAX", f.peak, "Choose the strongest listed interest for the climax.", td), "", "CLOSING: - End with a satisfying erotic denouement after the climax." ].join(" ");
            return composedPromptText;
        }
        // One phase-lines builder (writers refactor): the single and
        // group guide composers and the YoBitch rebuild below repeated
        // the same four nd() phase lines, differing only in the
        // aftercare line's label and empty-state text, which stay
        // parameters. Callers join the returned lines with "  ", the
        // separator both the ""-separated guide arrays and the
        // YoBitch array produced when joined.
        function sxGuidePhaseLines(f, aftercareLabel, aftercareEmpty) {
            return [ nd("WARM-UP", f.warmup, "No separate warm-up item is specified."), nd("ESCALATION", f.escalation, "No additional escalation or exploration item is specified."), nd("PEAK", f.peak, "No established non-aftercare peak is specified; keep it open until agreed together."), nd(aftercareLabel, f.aftercare, aftercareEmpty) ];
        }
        // Guide composer (refactor F1): assembles the play-guide
        // prompt (single-profile scene treatment or group guide)
        // from the same shared sections; the body is the former
        // guide branch, unchanged.
        function sxComposeScribeGuide(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f } = ctx, { A, C, M, I, F, _, D, R, O, B, j, q, H } = ctx.sections;
            let composedPromptText;
            const e = [ s ? `- Source profile: ${d} only. Do not assume a partner shares these interests.` : `- Group profiles: ${w}.`, `- Want to do: ${f.established.map(e => e.label).join("; ") || "none recorded"}.`, `- Curious about: ${f.curious.map(e => e.label).join("; ") || "none recorded"}.`, "- Curious about is not Want to do. Ask explicitly and make declining or stopping easy.", "- Confirm actual intensity, pacing, roles, stop signals, and practical details together before starting." ];
            if (s) composedPromptText = [ `Write a practical, coordination-focused scene treatment for ${d} and an unnamed adult partner from the structured brief below.`, "", `CAST, GENDER & SEXUALITY: ${A}${C}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `HARD-EXCLUDED LIMITS: ${_}`, "", "Rules:", "- Render the complete finished scene treatment and play guide in the chat as plain text with a suitable title so it can be narrated in real time.", "- After the complete guide appears in chat, automatically generate a downloadable PDF file containing exactly the same title and guide text. Clearly label the attachment “Download PDF” so it can be shared in Messenger. Do not replace, shorten, or summarize the rendered guide when creating the PDF.", q, '- Give every participant a real first name in the finished scene treatment and play guide. Use only the first name from each selected profile for that participant; choose a first name for any additional unnamed participant. Use a full name only when the story or guide explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', `- Make phase timing serve the requested ${scribeLengthValue} ${j}; keep the pace flexible enough for check-ins, pauses, or stopping.`, "- Use a sequence people can follow together, with roles, dialogue cues, consent check-ins, transitions, and clear pause or stop options—not a piece of erotic fiction.", "- Use only the named topics in this brief. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity in any form.", "- Use the one profile as the source of character and preference detail.", "- Treat [CURIOUS ABOUT] items as tentative invitations: include a specific consent check and an easy opt-out before each one.", "- Preserve each participant’s recorded give/receive roles exactly as written. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use each person’s recorded rating to set emphasis and pacing: 80–100 is a central priority, 56–79 is strong supporting material, 36–55 is lighter, and 0–35 remains tentative. When two people differ, the lower compatible rating sets the ceiling until they explicitly agree otherwise.", "- Build from lower recorded interest toward established favorites or stronger interests, while keeping physical intensity adjustable through explicit check-ins. Ratings measure interest, not safe force or duration.", "- Do not invent preferences, permissions, identity details beyond the recorded profile data and unnamed-partner guidance, physical details, anatomy, or relationship facts.", "", `NEGOTIATION NOTES: ${e.join(" ")}`, "", sxGuidePhaseLines(f, "AFTERCARE", "No aftercare preference is recorded; define aftercare before the scene.").join("  ") ].join(" "); else {
                const e = Iu(o, {
                    hideExcludedNames: !0,
                    excludeFantasy: !0
                });
                composedPromptText = [ `Create a practical, coordination-focused scene treatment and play guide for ${w}. Randomize the sequence and details for variety while staying inside the supplied data and every negotiation constraint.`, "", `CAST, GENDER & SEXUALITY: ${A}`, "", "AI INSTRUCTIONS — THE NEGOTIATION CHECKLIST IS BINDING:", "- Use PLAY GUIDE DATA as source material and inspiration, but use NEGOTIATION CHECKLIST DATA as the controlling safety and consent layer.", "- Keep every hard limit completely out of the guide. Never reintroduce it as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", "- Treat every red topic as a no for that participant. A DISCUSS FIRST green/red clash is not consent: frame it as an explicit conversation and opt-in decision, never as assumed or scheduled play.", "- Incorporate the filled-in safewords, pause language, and nonverbal stop signals naturally in the briefing, check-ins, and stop options.", "- Build the aftercare section from every participant’s stated aftercare needs. If a safeword or aftercare field is blank, insert a clear decision point before play instead of inventing an answer.", "- If the user replaces PLAY GUIDE DATA with an existing guide, revise and randomize that guide under the same binding checklist rather than preserving any conflict.", "- Render the complete finished guide in the chat as plain text with a suitable title so it can be narrated in real time.", "- After the complete guide appears in chat, automatically generate a downloadable PDF file containing exactly the same title and guide text. Clearly label the attachment “Download PDF” so it can be shared in Messenger. Do not replace, shorten, or summarize the rendered guide when creating the PDF.", q, '- Give every participant a real first name. Use only the first name from each selected profile. Use a full name only when the story or guide explicitly requires one. Never use generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner" unless a profile is explicitly anonymous.', `- Make phase timing serve the requested ${scribeLengthValue} ${j}; keep the pace flexible enough for check-ins, pauses, or stopping.`, "- Use a sequence people can follow together, with roles, dialogue cues, consent check-ins, transitions, and clear pause or stop options—not erotic fiction.", "- Use only the named topics in PLAY GUIDE DATA. Use the authoritative full-group profile as the activity boundary; do not calculate, infer, broaden, or recompute the intersection.", "- Pairwise shared ground and individual profiles may shape character, reactions, negotiation, and pair dynamics only within the authoritative full-group shared ground.", "- Treat [CURIOUS ABOUT] items as tentative invitations: include a specific consent check and an easy opt-out before each one.", "- Preserve each participant’s recorded give/receive roles exactly as written. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use each person’s recorded rating to set emphasis and pacing: 80–100 is a central priority, 56–79 is strong support, 36–55 is lighter, and 0–35 remains tentative. The lower compatible rating sets the ceiling until everyone explicitly agrees otherwise.", "- Build from lower recorded interest toward established favorites or stronger interests, while keeping physical intensity adjustable through explicit check-ins. Ratings measure interest, not safe force or duration.", "- Do not invent preferences, permissions, identity details, physical details, anatomy, or relationship facts.", "", [ "PLAY GUIDE DATA — SOURCE MATERIAL", B, "", `RATED PREFERENCE DETAIL: ${F}`, "", sxGuidePhaseLines(f, "AFTERCARE IDEAS FROM RATINGS", "No shared aftercare preference is recorded.").join("  ") ].join(" "), "", Lu(e, {
                    hideExcluded: !0,
                    hideTerms: "novelai" !== scribeTarget
                }), "", `HARD-EXCLUDED LIMITS — DUPLICATED FOR VISIBILITY: ${_}` ].join(" ");
            }
            return composedPromptText;
        }
        // Prompt finisher (writers refactor, Phase 1): applies the
        // target-specific guide wrappers (the strict-AI, suggestive,
        // and explicit prefixes, and the YoBitch rebuild), then the
        // shared appends in their shipped order — the user request
        // text, the phase section, and the terms / about / age
        // blocks — and finally the writer stamp. Returns the finished
        // prompt text; the builder performs the state writes.
        function sxFinishScribePrompt(promptText, ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f } = ctx, { A, C, M, I, F, _, D, R, O, B, j, q, H } = ctx.sections;
            if ("strictai" === scribeTarget && !u && (promptText = [ "SAFE FOR STRICT AI — TONED-DOWN PLAY GUIDE", "Keep the response practical, mature, consent-focused, and non-graphic. Avoid explicit anatomical detail, bodily-fluid descriptions, and step-by-step depictions of sexual acts. Refer to supplied activities discreetly and generally; fade to black or summarize transitions whenever needed. Preserve the useful sequence, roles, timing, boundaries, check-ins, stop options, and aftercare. If one detail cannot be described under these constraints, omit or neutralize that detail rather than refusing the entire guide.", "", promptText ].join(" ")), "suggestive" === scribeTarget && !u && (promptText = [ "SUGGESTIVE PLAY GUIDE — MODERATE AI", "Keep the response practical, mature, and consent-focused, using warm, sensual language for the activities. Avoid explicit anatomical detail, bodily-fluid descriptions, and step-by-step depictions of sexual acts. Preserve the useful sequence, roles, timing, boundaries, check-ins, stop options, and aftercare.", "", promptText ].join(" ")), "explicit" === scribeTarget && !u && (promptText = [ "EXPLICIT PLAY GUIDE — RESTRAINED TONE", "Keep the response practical, mature, and consent-focused with a restrained, elegant tone. Explicit anatomical and practical detail is allowed where the supplied data requires it. Preserve the useful sequence, roles, timing, boundaries, check-ins, stop options, and aftercare.", "", promptText ].join(" ")), 
            "yobitch" === scribeTarget) {
                const e = Iu(o, {
                    hideExcludedNames: !0,
                    excludeFantasy: !0
                });
                promptText = [ "YO BITCH — WRITE THE FULL PLAY GUIDE NOW", "You are YoBitch, the user’s Muse personal AI. Write the complete, practical play guide directly in this chat. Do not return an outline, a prompt for another AI, or commentary about how to write it. Make the finished guide clear and naturally spoken, rendering it in the chat as you write so Grok can narrate it in real time.", "", `CAST, GENDER & SEXUALITY: ${A}${C}`, "", `PROFILE DATA: ${sxIndividualProfileTexts(o, f, {
                    excludeFantasy: !0
                })}`, "", `OVERLAP / COMPARISON RESULTS: ${s ? "No overlap or comparison result is available because only one profile is selected. Do not infer a partner’s preferences or consent." : [ D, R, O ].filter(Boolean).join("  ")}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `PLAY GUIDE SOURCE: ${sxGuidePhaseLines(f, "AFTERCARE IDEAS FROM RATINGS", "No rated aftercare preference is recorded.").join("  ")}`, "", Lu(e, {
                    hideExcluded: !0,
                    hideTerms: "novelai" !== scribeTarget
                }), "", `HARD-EXCLUDED LIMITS — DUPLICATED FOR VISIBILITY: ${_}`, "", "REQUIREMENTS:", "- Treat the negotiation checklist as binding. Keep every hard limit completely out, and treat every red topic as a no for that person.", "- Use the supplied overlap/comparison results as authoritative. Do not infer, broaden, or recalculate shared consent.", "- Include a short pre-scene briefing, an approximately 60-minute sequence with flexible phase timings, roles, dialogue cues, transitions, consent check-ins, and clear pause or stop options.", "- Work the recorded safewords, pause language, and nonverbal stop signals into the briefing and check-ins. If they are blank, add a visible decision point before play instead of inventing them.", "- Build the aftercare section from every participant’s stated or rated aftercare needs. If those fields are blank, add a visible decision point before play instead of inventing an answer.", "- Treat curious items as invitations to discuss and explicitly opt into, never as established consent.", "- Preserve every give/receive role and let the lower compatible rating cap prominence until everyone explicitly agrees otherwise. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use only the named activities in the supplied data. Do not invent preferences, permissions, identities, anatomy, physical details, or relationship history.", "- Use only first names for every participant. Use a full name only when the guide explicitly requires one.", "- Give the guide a suitable title and render the complete finished play guide in the chat as plain text, ready for Grok to voice aloud in real time.", "- After the complete guide appears in chat, automatically generate a downloadable PDF file containing exactly the same title and guide text. Clearly label the attachment “Download PDF” so it can be shared in Messenger. Do not replace, shorten, or summarize the rendered guide when creating the PDF.", q ].join(" ");
            }
            if ("novelai" !== scribeTarget) {
                const e = Ad(u);
                e && (promptText = [ e, "", promptText ].join("\n\n"));
            }
            const phaseSection = scribePhaseSection();
            phaseSection && (promptText = [ promptText, "", phaseSection ].join("\n"));
            if ("novelai" !== scribeTarget) {
                const sxT = sxTermsBlock(o, v, { flavor: !0 });
                sxT && (promptText = [ promptText, "", sxT ].join("\n"));
                const sxA = sxAboutBlock(o, v);
                sxA && (promptText = [ promptText, "", sxA ].join("\n"));
                const sxAge = sxAgeBlock(o, v);
                sxAge && (promptText = [ promptText, "", sxAge ].join("\n"));
            }
            return [ sxWriterStamp(o), "", promptText ].join("\n");
        }
        function sxBuildScribePrompt(precomputed) {
            if (!vt[scribeLeadId]) return;
            const requestedCastIds = scribeCastIds.filter(e => vt[e]), castIds = requestedCastIds.length ? requestedCastIds : [ scribeLeadId ], isSingle = 1 === castIds.length;
            // Missing gender/orientation is handled neutrally downstream
            // (unspecified wording, neutral pronouns): it no longer
            // blocks Scribe.
            const rawMatchData = precomputed || sxScribeMatchData(castIds, isSingle), leadName = rd(castIds[0]), isStory = (isSingle || rd(castIds[1]), 
            "porn" === scribeMode), roleDynamics = isSingle ? [] : sxRoleDynamics(castIds), roleDynamicText = roleDynamics.map(e => e.text).join(" "), fantasyTopics = [ ...rawMatchData.established, ...rawMatchData.curious ].filter(e => e.fantasyOnly), triedTopics = [ ...rawMatchData.established, ...rawMatchData.curious ].filter(e => e.alreadyTried && (isStory || !e.fantasyOnly)), promptMatchData = isStory ? rawMatchData : Object.assign({}, rawMatchData, {
                established: rawMatchData.established.filter(e => !e.fantasyOnly),
                curious: rawMatchData.curious.filter(e => !e.fantasyOnly),
                warmup: rawMatchData.warmup.filter(e => !e.fantasyOnly),
                escalation: rawMatchData.escalation.filter(e => !e.fantasyOnly),
                peak: rawMatchData.peak.filter(e => !e.fantasyOnly),
                aftercare: rawMatchData.aftercare.filter(e => !e.fantasyOnly)
            });
            if (!(promptMatchData.established.length + promptMatchData.curious.length)) return e.byId("sceneAvailability").textContent = !isStory && fantasyTopics.length ? "Only fantasy-only topics are available. Add a real-world interest before creating a practical play guide." : "No favorites, positive interests, or curious ratings are available yet.", 
            void (e.byId("sceneBrief").hidden = !0);
            const establishedKindLabel = isSingle ? "favorite / interest" : "compatible interest", castSummary = castIds.map(e => `${rd(e)} · ${vb(rt[e]) || "gender unspecified"} · ${Nb(ot[e]) || "orientation unspecified"}`).join(" + "), castNames = castIds.map(e => rd(e)), castNameList = castNames.length < 2 ? castNames[0] : 2 === castNames.length ? castNames.join(" and ") : `${castNames.slice(0, -1).join(", ")}, and ${castNames[castNames.length - 1]}`, targetInfo = sxScribeTargetInfo(scribeTarget), targetDisplayName = targetInfo.displayName;
            const promptCtx = { castIds, isSingle, isStory, leadName, castNames, castNameList, castSummary, establishedKindLabel, targetInfo, targetDisplayName, roleDynamics, roleDynamicText, fantasyTopics, triedTopics, promptMatchData, sections: null };
            sxRenderScribeBrief(promptCtx);
            promptCtx.sections = sxScribeSharedSections(castIds, isSingle, isStory, roleDynamics, promptMatchData, fantasyTopics, triedTopics);
            const composedPrompt = isStory ? sxComposeScribeStory(promptCtx) : sxComposeScribeGuide(promptCtx), finalPrompt = sxFinishScribePrompt(composedPrompt, promptCtx);
            scribePromptCache = finalPrompt, e.byId("scenePromptText").value = scribePromptCache, e.byId("sceneAvailability").textContent = targetInfo.note(isStory, isSingle), 
            e.byId("sceneDownloadStatus").textContent = "", e.byId("copyScenePrompt").textContent = "Copy", 
            e.byId("sceneBrief").hidden = !1;
        }
        // Scribe dialog prep counts (refactor F8): the count
        // computation, split out of the dialog prep below. It reads
        // the generation's shared match data when the generate
        // handler supplies it, or computes the match data itself on
        // the standalone counts-only path (profile-save refresh while
        // the dialog is open). Pure computation: it returns the counts
        // and the availability line; it writes no dialog state.
        function sxScribeCounts(precomputed, ids, isSingle) {
            const l = precomputed || sxScribeMatchData(ids, isSingle), c = l.established.length, d = l.curious.length, u = ids.filter(e => od(e).length), p = c + d;
            return {
                data: l,
                established: c,
                curious: d,
                missing: u,
                total: p,
                availability: p ? `${c} established ${1 === c ? "item" : "items"} and ${d} curious ${1 === d ? "topic" : "topics"} ready, weighted by each person’s ratings.` : isSingle ? "Mark a topic Favorite, rate it above curious, or record a curious rating to build a scene brief." : "Add compatible positive or curious ratings to build a scene brief."
            };
        }
        // Scribe dialog prep (refactor F8): the heading, brief title,
        // brief intro, and prompt help come from the shared target table
        // (refactor F5) and are this function's dialog updates; the
        // counts come from sxScribeCounts() above, split out of the
        // dialog updates. The prompt-state reset happens only when
        // resetDraft is passed (the generate handler, which rebuilds
        // the prompt immediately after) — that ordering is
        // contractual; other callers refresh chrome/counts only.
        function sxPrepScribeDialog(precomputed, resetDraft) {
            if (!vt[scribeLeadId]) return;
            const t = scribeCastIds.filter(e => vt[e]), n = t.length ? t : [ scribeLeadId ], i = 1 === n.length, story = "porn" === scribeMode, info = sxScribeTargetInfo(scribeTarget);
            e.one("#scribeDialog .dialog-head p").textContent = info.head(story), 
            function(e) {
                scribeCastKey = `${scribeLeadId || ""}|${e ? "single" : scribePartnerId || ""}`;
            }(i), e.byId("sceneBriefTitle").textContent = info.title(story), 
            e.byId("sceneBriefIntro").textContent = info.intro(story, i), 
            e.byId("scenePromptHelp").textContent = info.help();
            const counts = sxScribeCounts(precomputed, n, i);
            e.byId("sceneAvailability").textContent = counts.availability,
            e.byId("sceneBrief").hidden = !0,
            // Draft ownership (writers refactor): the generated prompt
            // is cleared ONLY when the caller rebuilds it immediately
            // after (the generate handler, resetDraft). The
            // profile-save refresh path calls this prep to refresh
            // chrome and counts and must not wipe a draft it does
            // not rebuild.
            resetDraft && (scribePromptCache = "", e.byId("scenePromptText").value = ""),
            e.byId("sceneDownloadStatus").textContent = "";
        }
        function Id(e) {
            const t = [];
            for (let n = 0; n < e.length; n++) for (let i = n + 1; i < e.length; i++) t.push([ e[n], e[i] ]);
            return t;
        }
        function Pd(e) {
            return structuredClone(e || {});
        }
        function Ld(e, t) {
            const n = (e.ratings || {})[t];
            if ("number" == typeof n) return {
                give: n,
                receive: n,
                giveKnown: !0,
                receiveKnown: !0
            };
            if (n && "object" == typeof n) {
                const e = Object.prototype.hasOwnProperty.call(n, "give"), t = Object.prototype.hasOwnProperty.call(n, "receive");
                return {
                    give: e && Number(n.give) || 0,
                    receive: t && Number(n.receive) || 0,
                    giveKnown: e,
                    receiveKnown: t
                };
            }
            return {
                give: 0,
                receive: 0,
                giveKnown: !1,
                receiveKnown: !1
            };
        }
        function Td(e, t) {
            return (e.annotations || {})[t] || null;
        }
        function Fd(e, t) {
            const n = e => "limit" === e || "notinterested" === e;
            if (n(Td(e, t))) return !0;
            const i = qn[t] || Xn(t) || (e.importedChildren || {})[t];
            return !(!i || "Category" === i.kind) && Boolean(i.parentId && n(Td(e, i.parentId)) || n(Td(e, catId(i.branch))));
        }
        /* ===== Sync comparison engine v1.1 (ruled algorithm) =====
           The single computation behind every sync percentage in the app:
           the glance panel, the Cast panel, committed group profiles, and
           Scribe all read results produced here. Session inputs: mode is
           carried by the aggregation the caller reads ("play" vs
           "conversation"); per-person Heat in [-100, 100] (default 0)
           shifts the Strong threshold and the shed floor, and above zero
           opens the Soft-no-revisited teaser for that person's own soft
           no's — more topics and more detail as Heat climbs to +100.
           Per-person Veil in [0, 100] (default 50) is primarily a display
           filter, with ONE intended matching exception (ruled
           2026-10-29): teaser candidacy. A topic is a teaser candidate
           only if the excited partner's best positive rating clears
           Aa(veil) — interest >= 80 - 1.8 * veil — and a selected teaser
           feeds conversation.counted and hence the pair Kink Factor, so
           Veil DOES affect matching through teasers. The conversation
           bump itself remains veil-free. The
           retired leniency bands and the inferred role lock play no part
           in any outcome below. */
        function sxClamp(v, lo, hi) {
            return Math.max(lo, Math.min(hi, v));
        }
        function sxMeta(id, profiles) {
            let m = qn[id] || Xn(id) || null;
            if (!m && profiles) for (let k = 0; k < profiles.length; k++) {
                const c = (profiles[k].importedChildren || {})[id];
                if (c) { m = c; break; }
            }
            return !m || "Category" === m.kind ? null : m;
        }
        function sxAnnoScope(profile, id, meta, value) {
            const a = profile.annotations || {};
            if (a[id] === value) return "topic";
            if (meta && meta.parentId && a[meta.parentId] === value) return "subcategory";
            if (meta && meta.branch && a[catId(meta.branch)] === value) return "category";
            return null;
        }
        function sxFlagScope(store, id, meta) {
            if (!store) return null;
            if (store[id]) return "topic";
            if (meta && meta.parentId && store[meta.parentId]) return "subcategory";
            if (meta && meta.branch && store[catId(meta.branch)]) return "category";
            return null;
        }
        function sxTopicData(profile, id, meta) {
            const stored = (profile.ratings || {})[id], raw = Ld(profile, id);
            let single = "number" == typeof stored, singleValue = single ? Number(stored) : null;
            if (!single && Ue.has(id)) {
                single = !0, singleValue = raw.giveKnown ? raw.give : raw.receiveKnown ? raw.receive : null;
            }
            return {
                raw: raw,
                single: single,
                singleValue: singleValue,
                rated: Boolean(raw.giveKnown || raw.receiveKnown),
                limitScope: sxAnnoScope(profile, id, meta, "limit"),
                notInterested: Boolean(sxAnnoScope(profile, id, meta, "notinterested")),
                favorite: Boolean(sxAnnoScope(profile, id, meta, "favorite")),
                fantasyScope: sxFlagScope(profile.fantasyOnly, id, meta),
                triedScope: sxFlagScope(profile.alreadyTried, id, meta)
            };
        }
        function sxStance(value, known, T) {
            return !known ? "unknown" : value < 0 ? "against" : value > T ? "strong" : "curious";
        }
        function sxSides(td, heat) {
            const T = sxClamp(35 - heat, 0, 85);
            if (td.notInterested) return { give: "against", receive: "against" };
            if (td.single) {
                const s = !td.rated ? "unknown" : td.singleValue < 0 ? "against" : "curious";
                return { give: s, receive: s };
            }
            return { give: sxStance(td.raw.give, td.raw.giveKnown, T), receive: sxStance(td.raw.receive, td.raw.receiveKnown, T) };
        }
        function sxRawVal(td, dir) {
            if (td.single) return td.rated ? td.singleValue : null;
            return td.raw[dir + "Known"] ? td.raw[dir] : null;
        }
        function sxRoute(gS, gV, gSingle, rS, rV, rSingle) {
            if ("unknown" === gS || "unknown" === rS) return null;
            if ("against" === gS && "against" === rS) return { kind: "mutual-no" };
            if ("against" === gS || "against" === rS) return { kind: "clash" };
            let kind = "strong" === gS && "strong" === rS ? "full" : "curious" === gS && "curious" === rS ? "tentative" : "open";
            if ((gSingle || rSingle) && "full" === kind) kind = "open";
            return { kind: kind, strength: Math.min(gV, rV) };
        }
        function sxOneSidedShape(sA, sB, nameA, nameB) {
            const pos = s => "strong" === s || "curious" === s, aGive = pos(sA.give), aRecv = pos(sA.receive), bGive = pos(sB.give), bRecv = pos(sB.receive);
            if (aGive && bGive && !aRecv && !bRecv) return "both want to give";
            if (aRecv && bRecv && !aGive && !bGive) return "both want to receive";
            const who = [];
            (aGive || aRecv) && who.push(nameA), (bGive || bRecv) && who.push(nameB);
            return `one-sided — ${who.join(" and ") || nameA}`;
        }
        // Match-engine R1: the strongest-first ordering (strongest strength
        // first, ties broken by label A–Z) and the plain label ordering are
        // declared ONCE here, above every use — the pair scorer, the group
        // scorer, and both teaser bumps all sort through these two.
        const byStrength = (x, y) => (y.strength || 0) - (x.strength || 0) || x.label.localeCompare(y.label), byLabel = (x, y) => x.label.localeCompare(y.label);
        function sxLowestSet(pairs, profiles) {
            const kfOf = pr => pr.conversation ? pr.conversation.kinkFactor : null,
                scoreOf = m => {
                    const kfs = pairs.filter(pr => pr.i === m || pr.j === m).map(kfOf).filter(v => null !== v);
                    return kfs.length ? kfs.reduce((a, b) => a + b, 0) / kfs.length : null;
                },
                scores = profiles.map((p, m) => scoreOf(m)),
                min = scores.reduce((a, v) => null === v ? a : null === a ? v : Math.min(a, v), null),
                lowest = null === min ? [] : scores.map((v, m) => v === min ? m : -1).filter(m => m >= 0);
            return { scores: scores, min: min, lowest: lowest };
        }
        // Match-engine R5: the "take the top slice" curve — the first
        // ceil(|list| * heat / 100) entries, floored at one — is declared
        // ONCE here, above every use: the teaser selection and both
        // promotion bumps (pair and group) slice through it, each passing
        // its own heat value unchanged.
        const takeTop = (list, heat) => list.slice(0, Math.max(1, Math.ceil(list.length * heat / 100)));
        // Match-engine R4: the score headline sentence — the percent,
        // then "N of M shared topics" across the dash, with the group
        // prefix (e.g. "group match score for NAME") folded in ahead of
        // the dash where a view carries one — is written ONCE here,
        // above every use: the pair scorer and the group scorer each
        // build their Play and Conversation headline text through it,
        // each passing its own percent / count / considered values (and
        // its prefix, where present) unchanged. A null percent yields
        // null, exactly as each site's own null check did before.
        const sxHeadlineText = (percent, clicks, things, prefix) => null === percent ? null : `${percent}%${prefix ? ` ${prefix}` : ""} — ${clicks} of ${things} shared topics`;
        // Kinkiness weighting (ruled 2026-10-29, all four pair numbers,
        // pair and group both): Play KF, Play MS,
        // Parlay MS, and Parlay KF are weighted by
        // kinkiness just like Personal / Charted. Effective weight =
        // hierarchical share x kinkiness (sxTopicWeight; kinkiness =
        // 1 - the single O6 aggregate popularity per topic), applied
        // ONCE in numerator and denominator alike. The counted and
        // considered SETS (and the counts reported beside the percent)
        // stay exactly as defined at each call site; only the percent
        // is weighted. Numerator and denominator are summed
        // independently, preserving each site's existing set relation
        // (e.g. a teased topic can count toward the pair conversation
        // numerator). Solver energy is EXCLUDED from this weighting:
        // no solver / settler code calls this helper or sxTopicWeight.
        function sxKinkWeightedPct(recs, isCounted, isConsidered) {
            let num = 0, den = 0, consideredCount = 0;
            recs.forEach(r => {
                const w = sxTopicWeight(r.id);
                if (isConsidered(r)) { consideredCount++; den += w; }
                if (isCounted(r)) num += w;
            });
            return consideredCount && den > 0 ? Math.round(100 * num / den) : null;
        }
        // Play inclusion table (six-scores provisional build,
        // 2026-10-30): Play KF and Play MS use Play's OWN table for
        // now, copied from Charted (the FINAL inclusion tables are
        // DEFERRED — recommendation 2 unruled; Charted's own table,
        // sxFlagSum / sxTopicTerms, is NOT used by Play and is
        // unchanged). Per topic, per member, counted once per topic,
        // listing only what counts: Favorite 1, Tried +1, Fantasy
        // +0.5 ONLY when combined with a rating or another flag (a
        // Fantasy-ONLY flag counts 0 in Play). Limit is not in the
        // table at all — a limit-blocked topic is excluded by the
        // callers' considered sets, never scored here.
        function sxPlayTableFlags(td) {
            const fav = td.favorite ? 1 : 0, tried = td.triedScope ? 1 : 0,
                fantasy = td.fantasyScope ? (td.rated || fav || tried ? .5 : 0) : 0;
            return fav + tried + fantasy;
        }
        // A member's Play KF total for a topic: the binary
        // "rated or not" base plus the Play table's flag sum.
        function sxPlayMemberTotal(td) {
            return (td.rated ? 1 : 0) + sxPlayTableFlags(td);
        }
        // Parlay inclusion table (six-scores provisional build,
        // 2026-10-30, FOR-NOW — final table DEFERRED; Favorite
        // RESTORED at +1 2026-10-30 — its removal in the group-Parlay
        // fix was wrong; Favorite was ruled +1 in this table, not
        // zero): Parlay KF and Parlay MS
        // use Parlay's OWN table on the straight match. Per topic,
        // per member, counted once per topic, listing only what
        // counts: Favorite 1, Tried 1, Fantasy 1 (FULL 1, whether combined or
        // fantasy-only — unlike Play). Teased does not enter Parlay consideration at all
        // (absent, not zero). Limit is not in the table —
        // limit-blocked topics stay out of Parlay's considered set
        // entirely.
        function sxParlayTableFlags(td) {
            return (td.favorite ? 1 : 0) + (td.triedScope ? 1 : 0) + (td.fantasyScope ? 1 : 0);
        }
        // A member's Parlay KF total for a topic: the binary
        // "rated or not" base plus the Parlay table's flag sum.
        function sxParlayMemberTotal(td) {
            return (td.rated ? 1 : 0) + sxParlayTableFlags(td);
        }
        function sxPlayGeoMean(vals) {
            if (!vals.length) return 0;
            let prod = 1;
            vals.forEach(v => { prod *= v; });
            return Math.pow(prod, 1 / vals.length);
        }
        // Epsilon (six-scores provisional build, 2026-10-30;
        // recommendation 4 ACCEPTED with scale factor): epsilon =
        // e_0 * e^(-heat/100), with e_0 = 1 for now, in profile units
        // throughout, no rescaling (epsilon scale handling beyond
        // e_0 = 1 is NOT ruled). APPLIED as a threshold: for Play and
        // Parlay, a direction counts as binary fit only where the
        // absolute normed match term (scale -100..+100) exceeds
        // epsilon, with heat = the group heat = the arithmetic mean
        // of the members' individual heats at formation (Parlay
        // groups in Conversation mode included). For a SINGLE
        // profile the same epsilon, from that person's OWN heat,
        // thresholds their RATING: a flank counts by rating only if
        // its absolute rating exceeds epsilon (see sxTopicTerms).
        // Positive heat -> smaller epsilon (more counts); negative
        // heat -> larger epsilon (fewer counts).
        const SX_EPSILON_E0 = 1;
        function sxPlayEpsilon(heats) {
            const hs = (heats || []).filter(Number.isFinite);
            const h = hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 0;
            return SX_EPSILON_E0 * Math.exp(-h / 100);
        }
        // Hierarchy-share x kinkiness weighted mean of per-topic
        // entries (entries are fractions: KF entries are maxFit/100 x
        // geometric mean, MS entries are geometric means), the weight
        // applied ONCE, numerator and denominator alike. Returns the
        // rounded percent plus the counted (entry > 0) and considered
        // topic counts the headline text reports.
        function sxPlayWeightedPct(recs, entryOf, isConsidered) {
            let num = 0, den = 0, consideredCount = 0, countedCount = 0;
            recs.forEach(r => {
                if (!isConsidered(r)) return;
                const e = entryOf(r);
                if (null == e || !Number.isFinite(e)) return;
                const w = sxTopicWeight(r.id);
                consideredCount++, den += w, num += w * e;
                if (e > 0) countedCount++;
            });
            return { pct: consideredCount && den > 0 ? Math.round(100 * num / den) : null, counted: countedCount, considered: consideredCount };
        }
        // Match-engine (Edit 8): the display-layer MOVE rule — a teased
        // topic moves from the red bucket to the yellow bucket — is
        // governed by ONE predicate, stated once here: the topic's
        // teased list is non-empty AND its class is exactly "soft-no".
        // The pair-glance MOVE and the pair ring-bucket MOVE call this
        // predicate directly; the group ring-bucket MOVE calls it on
        // the pair-selected record and adds its own conditions
        // (non-fantasy, teased for a lowest-overall-kink-score member)
        // at its call site — those group-only conditions are NOT part
        // of this predicate and are not folded into it.
        const sxIsTeased = rec => (rec.teaserFor || []).length && "soft-no" === rec.countClass;
        // Match-engine (Edit 6): the blind-import filter — which of an
        // imported profile's topics survive a blind comparison against
        // the selected comparison group, plus the kept/discarded counts
        // the import toast reports — is declared ONCE here, with the
        // rest of the match engine; the import door calls it with the
        // new profile's id and the comparison-group ids, exactly as it
        // called the inline IIFE this replaces. Its keep rule (no group
        // member limit-blocks the topic, and every member is at >= 36 on
        // the give or the receive flank) is its own and moves unchanged.
        function sxBlindFilter(e, t) {
            const n = [ ...new Set(t.filter(e => vt[e])) ];
            if (n.length < 2) return null;
            const i = n.concat(e).map(e => ({
                name: wt[e],
                ratings: vt[e],
                annotations: Qe[e],
                fantasyOnly: Je[e],
                alreadyTried: et[e],
                importedChildren: at[e],
                roles: st[e]
            })), a = [ vt[e], Ze[e], Qe[e], Je[e], et[e], tt[e] ], r = new Set;
            a.forEach(e => Object.keys(e || {}).forEach(e => {
                isCatId(e) || r.add(e);
            })), Object.keys(at[e] || {}).forEach(e => r.add(e));
            const o = new Set([ ...r ].filter(e => !i.some(t => Fd(t, e)) && i.every(t => {
                const n = Ld(t, e);
                return n.giveKnown && n.give >= 36 || n.receiveKnown && n.receive >= 36;
            })));
            return a.forEach(e => Object.keys(e || {}).forEach(t => {
                o.has(t) || delete e[t];
            })), Object.keys(at[e] || {}).forEach(t => {
                o.has(t) || delete at[e][t];
            }), {
                kept: o.size,
                discarded: [ ...r ].filter(e => !o.has(e)).length,
                groupSize: n.length
            };
        }
        function sxPairFromData(A, B, ids, metas, dataA, dataB, opts) {
            opts = opts || {};
            const heatA = sxClamp(Number(opts.heatA) || 0, -100, 100), heatB = sxClamp(Number(opts.heatB) || 0, -100, 100),
                veilA = null == opts.veilA ? 50 : sxClamp(Number(opts.veilA) || 0, 0, 100), veilB = null == opts.veilB ? 50 : sxClamp(Number(opts.veilB) || 0, 0, 100),
                F = Math.max(0, -heatA, -heatB), nameA = A.name || "First partner", nameB = B.name || "Second partner",
                topics = [], topicsById = {}, teaserCand = [];
            /* Epsilon for this pair (six-scores provisional build):
               group heat = arithmetic mean of the two members' heats
               at formation; binary fit below requires |term| > eps. */
            const sxPairEps = sxPlayEpsilon([ heatA, heatB ]);
            let ratedA = 0, ratedB = 0, oneSidedCount = 0, limitBlocked = 0, fantasySetAside = 0, sharedCount = 0;
            ids.forEach((id, ix) => {
                const meta = metas[ix];
                if (!meta) return;
                const a = dataA[ix], b = dataB[ix];
                a.rated && ratedA++, b.rated && ratedB++;
                const limiters = [];
                a.limitScope && limiters.push({ name: nameA, scope: a.limitScope }), b.limitScope && limiters.push({ name: nameB, scope: b.limitScope });
                const rec = {
                    id: id, label: meta.label, branch: meta.branch,
                    outcome: "invisible", playOutcome: "invisible", strength: null, bestFit: null,
                    fits: [], directions: [], bothWays: !1, clashes: [], shed: !1, mutualNo: !1,
                    ratings: {
                        a: { give: a.raw.give, giveKnown: a.raw.giveKnown, receive: a.raw.receive, receiveKnown: a.raw.receiveKnown, single: a.single, singleValue: a.singleValue },
                        b: { give: b.raw.give, giveKnown: b.raw.giveKnown, receive: b.raw.receive, receiveKnown: b.raw.receiveKnown, single: b.single, singleValue: b.singleValue }
                    },
                    flags: {
                        notInterested: [ a.notInterested && nameA, b.notInterested && nameB ].filter(Boolean),
                        triedBy: [ a.triedScope && nameA, b.triedScope && nameB ].filter(Boolean),
                        fantasyBy: [ a.fantasyScope && nameA, b.fantasyScope && nameB ].filter(Boolean),
                        favoriteBy: [ a.favorite && nameA, b.favorite && nameB ].filter(Boolean)
                    },
                    limiters: limiters, differentIntensities: !1, mismatchShape: null,
                    countClass: null, hotContribution: 0, teaserFor: [], teaserDetail: []
                };
                topics.push(rec), topicsById[id] = rec;
                if (limiters.length) return rec.outcome = "limit-blocked", rec.playOutcome = "limit-blocked", void limitBlocked++;
                const sA = sxSides(a, heatA), sB = sxSides(b, heatB), pos = s => "strong" === s || "curious" === s, anyPos = s => pos(s.give) || pos(s.receive),
                    posFlanks = (s, td) => [ "give", "receive" ].filter(d => pos(s[d])).map(d => ({ dir: d, stance: s[d], rating: sxRawVal(td, d) }));
                /* Teaser candidacy gate (suppression, 2026-10-26): a topic is a teaser candidate only if the excited partner's best positive rating clears the veiled owner's veil threshold, interest >= 80 - 1.8 * veil (Aa). The owner's mark interest (-100) is what the veil hides, so it cannot be the operand that opens the gate: the literal mark-interest reading would admit rows only at veil 100 and would perversely admit unrated marks (null coerces to 0) over rated ones. Candidacy stays marks-only: notInterested marks, never bare -100 ratings. */
                const flanksA = posFlanks(sB, b), intA = flanksA.map(f => f.rating).filter(Number.isFinite), passA = intA.length > 0 && Math.max(...intA) >= Aa(veilA);
                const flanksB = posFlanks(sA, a), intB = flanksB.map(f => f.rating).filter(Number.isFinite), passB = intB.length > 0 && Math.max(...intB) >= Aa(veilB);
                a.notInterested && heatA > 0 && anyPos(sB) && passA && teaserCand.push({ rec: rec, side: "a", owner: nameA, partner: nameB, heat: heatA, flanks: flanksA });
                b.notInterested && heatB > 0 && anyPos(sA) && passB && teaserCand.push({ rec: rec, side: "b", owner: nameB, partner: nameA, heat: heatB, flanks: flanksB });
                if (!(a.rated && b.rated)) return void (a.rated !== b.rated && oneSidedCount++);
                sharedCount++;
                const fantasy = Boolean(a.fantasyScope || b.fantasyScope);
                /* Play KF / Play MS per-topic entries (six-scores
                   provisional build, 2026-10-30). GROUND x FIT: marks
                   and whether something has a fit determine the
                   ground; the ground is multiplied by the TYPE of
                   fit, positive or negative. Krossmatch fits, normed
                   by 100 to profile scale: give-fit = my give x your
                   receive / 100, receive-fit = my receive x your give
                   / 100, each in [-100, 100]; a direction with an
                   unrated flank has no fit. Play KF entry = max fit
                   (as a fraction; signed — max is positive if ANY
                   direction is positive, negative only if BOTH are
                   negative, least negative) x geometric mean over
                   members of (rated-or-not + Play table sum), each
                   member normalized by the group max of that same
                   total. Different marks count as ground in whatever
                   form (one member's fantasy, another's high rating,
                   another's tried — each is ground for that member);
                   fit does not create ground, it multiplies over it.
                   Play MS entry = geometric mean over members of
                   (binary fit existence + Play table flag sum),
                   normalized by the group max of that sum; binary fit
                   per direction = 1 iff |cross-match term| > epsilon
                   (sxPairEps, group heat at formation), and each
                   member takes part in both directions, so both
                   members share the count.
                   Marks vs fit (recommendation 1 ACCEPTED): NO extra
                   weight factor — the stated multiplication stands,
                   fit sets direction/magnitude, marks set how much of
                   that fit is covered. */
                const gvA = sxRawVal(a, "give"), rvA = sxRawVal(a, "receive"), gvB = sxRawVal(b, "give"), rvB = sxRawVal(b, "receive"),
                    fitGive = null != gvA && null != rvB ? gvA * rvB / 100 : null,
                    fitRecv = null != gvB && null != rvA ? gvB * rvA / 100 : null;
                rec.crossFitGive = fitGive, rec.crossFitReceive = fitRecv;
                const totA = sxPlayMemberTotal(a), totB = sxPlayMemberTotal(b), totMax = Math.max(totA, totB),
                    gmRated = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                    fitArr = [ fitGive, fitRecv ].filter(v => null != v),
                    maxFit = fitArr.length ? Math.max(...fitArr) : null;
                rec.playKFEntry = null == maxFit ? null : maxFit / 100 * gmRated;
                const binFit = (null != fitGive && Math.abs(fitGive) > sxPairEps ? 1 : 0) + (null != fitRecv && Math.abs(fitRecv) > sxPairEps ? 1 : 0),
                    cMsA = binFit + sxPlayTableFlags(a), cMsB = binFit + sxPlayTableFlags(b), cMsMax = Math.max(cMsA, cMsB);
                rec.playMSEntry = cMsMax > 0 ? sxPlayGeoMean([ cMsA / cMsMax, cMsB / cMsMax ]) : 0;
                fantasy && fantasySetAside++;
                const mkRoute = (dir, gS, gV, gSingle, rS, rV, rSingle, giverName, receiverName, againstName) => {
                    const r = sxRoute(gS, gV, gSingle, rS, rV, rSingle);
                    if (!r) return;
                    if ("mutual-no" === r.kind) return void (rec.mutualNo = !0);
                    if ("clash" === r.kind) return void rec.clashes.push({ direction: dir, against: againstName });
                    const fit = { direction: dir, kind: r.kind, strength: r.strength, giver: giverName, receiver: receiverName, giverRating: gV, receiverRating: rV, shed: r.strength < F };
                    rec.fits.push(fit), fit.shed && (rec.shed = !0);
                };
                mkRoute("AtoB", sA.give, sxRawVal(a, "give"), a.single, sB.receive, sxRawVal(b, "receive"), b.single, nameA, nameB, "against" === sA.give ? nameA : nameB);
                mkRoute("BtoA", sB.give, sxRawVal(b, "give"), b.single, sA.receive, sxRawVal(a, "receive"), a.single, nameB, nameA, "against" === sB.give ? nameB : nameA);
                const counting = rec.fits.filter(f => !f.shed);
                if (counting.length) {
                    const best = counting.slice().sort((x, y) => y.strength - x.strength)[0];
                    rec.bestFit = best, rec.strength = best.strength,
                    rec.directions = [ ...new Set(counting.map(f => f.direction)) ], rec.bothWays = rec.directions.length > 1,
                    rec.differentIntensities = Math.abs(best.giverRating - best.receiverRating) >= 40,
                    rec.outcome = counting.some(f => "full" === f.kind) ? "match" : "curious-fit";
                } else if (rec.clashes.length) rec.outcome = "conflict";
                else if (rec.shed || anyPos(sA) || anyPos(sB)) rec.outcome = "one-sided";
                else rec.outcome = "not-topics";
                rec.playOutcome = fantasy ? "fantasy-excluded" : rec.outcome;
                if ("conflict" === rec.outcome) rec.mismatchShape = `opposed — ${rec.clashes[0].against}`;
                if ("one-sided" === rec.outcome) rec.mismatchShape = sxOneSidedShape(sA, sB, nameA, nameB);
                if ("match" === rec.outcome || "curious-fit" === rec.outcome) rec.countClass = fantasy ? "fantasy" : "match";
                else if (fantasy && ((a.fantasyScope && (anyPos(sB) || rec.fits.length)) || (b.fantasyScope && (anyPos(sA) || rec.fits.length)))) rec.countClass = "fantasy";
                if (!rec.countClass && (a.triedScope || b.triedScope)) rec.countClass = "experience";
                // countClass "soft-no" is assigned by the teaser selection
                // pass after the topic loop, so the ring counts (via the MOVEs) and
                // the popover Teasers sections always share one selected set.
                rec.hotContribution = !rec.countClass ? 0 : "experience" === rec.countClass || "soft-no" === rec.countClass ? 25 : rec.bestFit ? rec.bestFit.strength : rec.fits.length ? Math.max(...rec.fits.map(f => f.strength)) : 0;
            });
            /* Straight register (Job 1, raw straight sum): same-direction
                products from the crossed records' own ratings, computed beside the
                crossed routes from the same data. Limits excluded everywhere;
                unshared topics stay invisible but coverage-counted. Independent of
                teaser selection, the teaser bump, countClass, heat, and veil — only
                the limit gate filters. No bucket classes, no headline, no counts
                display here; those are deferred rulings. */
            const straightTopics = [], straightById = {};
            let straightShared = 0, straightOneSided = 0, straightLimitBlocked = 0;
            topics.forEach(rec => {
                const ra = rec.ratings.a, rb = rec.ratings.b,
                    giveGive = ra.giveKnown && rb.giveKnown ? ra.give * rb.give : null,
                    recvRecv = ra.receiveKnown && rb.receiveKnown ? ra.receive * rb.receive : null,
                    sum = null == giveGive && null == recvRecv ? null : (giveGive || 0) + (recvRecv || 0),
                    aRated = ra.giveKnown || ra.receiveKnown, bRated = rb.giveKnown || rb.receiveKnown;
                let status;
                if (rec.limiters.length) status = "limit-blocked", straightLimitBlocked++;
                else if (!(aRated && bRated)) status = "invisible", aRated !== bRated && straightOneSided++;
                else status = "shared", straightShared++;
                const srec = { id: rec.id, label: rec.label, branch: rec.branch, giveGive: giveGive, recvRecv: recvRecv, sum: sum, status: status, ratings: rec.ratings, flags: rec.flags };
                straightTopics.push(srec), straightById[rec.id] = srec;
            });
            const straightList = straightTopics.filter(s => "shared" === s.status && null != s.sum && s.sum > 0).sort((x, y) => (y.sum || 0) - (x.sum || 0) || x.label.localeCompare(y.label)),
                straight = { topics: straightTopics, byId: straightById, list: straightList, coverage: { shared: straightShared, oneSided: straightOneSided, limitBlocked: straightLimitBlocked } };
            /* Teaser selection: per owner, the eligible soft-no topics
               (owner marked notInterested, owner's own Heat > 0, partner
               positive on some flank, and the excited partner's best positive rating clears the veiled owner's veil threshold) are
               ordered by the partner's best positive rating descending,
               ties by label A–Z, and the first ceil(|E| * heat / 100) are
               selected (at least one whenever heat > 0). The one selection
               drives teaserFor, the soft-no countClass, and the popover
               Teasers sections together, so they can never diverge. */
            [ "a", "b" ].forEach(side => {
                const mine = teaserCand.filter(c => side === c.side);
                if (!mine.length) return;
                const heat = mine[0].heat, bestOf = c => Math.max(...c.flanks.map(f => null == f.rating ? -1 : f.rating));
                mine.sort((x, y) => bestOf(y) - bestOf(x) || x.rec.label.localeCompare(y.rec.label)),
                takeTop(mine, heat).forEach(c => {
                    c.rec.teaserFor.push(c.owner), c.rec.teaserDetail.push({ owner: c.owner, partner: c.partner, heat: c.heat, flanks: c.flanks }),
                    !c.rec.countClass && "invisible" !== c.rec.outcome && (c.rec.countClass = "soft-no", c.rec.hotContribution = 25);
                });
            });
            /* Teaser bump (Curious → Hot promotion, Jason 2026-10-25): after
               the teaser selection, before lists are built. Per key, native
               curious topics (key "curious-fit", countClass not "soft-no")
               promote to "match", strongest first, ties
               label A–Z, first ceil(|C| * h / 100) with h = min(heatA, heatB),
               at least one when h > 0. Fantasy: the CONVERSATION bump
               (key "outcome") INCLUDES fantasy topics (ruled 2026-10-29,
               unified in the including direction with the group
               conversation bump); the PLAY bump (key "playOutcome") still
               excludes fantasy. The bump itself is veil-free: Veil gates
               nothing in this bump (its matching effect is teaser
               candidacy only, per the engine header). countClass is NEVER
               changed; only the key outcome changes. */
            const bumpH = Math.min(heatA, heatB);
            if (bumpH > 0) [ "outcome", "playOutcome" ].forEach(key => {
                const convKey = "outcome" === key;
                const cands = topics.filter(r => "curious-fit" === r[key] && "soft-no" !== r.countClass && (convKey || ("fantasy" !== r.countClass && 0 === r.flags.fantasyBy.length))).sort(byStrength);
                takeTop(cands, bumpH).forEach(r => { r[key] = "match"; });
            });
            /* Play MS / Play KF aggregates (definition build
               2026-10-30, PROVISIONAL): hierarchy-share x kinkiness
               weighted sums over topics, numerator and denominator
               alike. Play MS considered set = shared (both members
               rated), not limit-blocked, not fantasy. Play KF
               denominator = shared, non-limit-blocked topics
               (weighted). */
            const sxSharedRated = r => {
                    const ra = r.ratings.a, rb = r.ratings.b;
                    return (ra.giveKnown || ra.receiveKnown) && (rb.giveKnown || rb.receiveKnown) && !r.limiters.length;
                },
                msAgg = sxPlayWeightedPct(topics, r => r.playMSEntry, r => sxSharedRated(r) && !(r.flags.fantasyBy || []).length),
                kfAgg = sxPlayWeightedPct(topics, r => r.playKFEntry, r => sxSharedRated(r));
            const mkLists = key => ({
                    matches: topics.filter(r => "match" === r[key]).sort(byStrength),
                    curiousAbout: topics.filter(r => "curious-fit" === r[key]).sort(byStrength),
                    mismatched: topics.filter(r => "conflict" === r[key] || "one-sided" === r[key]).sort(byLabel),
                    limits: topics.filter(r => "limit-blocked" === r[key]).sort(byLabel)
                }),
                playLists = mkLists("playOutcome"), playConsidered = playLists.matches.length + playLists.curiousAbout.length + topics.filter(r => "conflict" === r.playOutcome || "one-sided" === r.playOutcome || "not-topics" === r.playOutcome).length,
                play = {
                    considered: playConsidered,
                    matches: playLists.matches.length,
                    headline: msAgg.pct,
                    lists: playLists
                };
            play.headlineText = sxHeadlineText(play.headline, msAgg.counted, msAgg.considered);
            const convLists = mkLists("outcome"), counted = topics.filter(r => r.countClass),
                conversation = {
                    considered: convLists.matches.length + convLists.curiousAbout.length + topics.filter(r => "conflict" === r.outcome || "one-sided" === r.outcome || "not-topics" === r.outcome).length,
                    counted: counted.length,
                    countsByClass: {
                        match: counted.filter(r => "match" === r.countClass).length,
                        fantasy: counted.filter(r => "fantasy" === r.countClass).length,
                        experience: counted.filter(r => "experience" === r.countClass).length,
                        softNo: counted.filter(r => "soft-no" === r.countClass).length
                    },
                    kinkFactor: null,
                    lists: convLists
                };
            conversation.kinkFactor = kfAgg.pct;
            conversation.headlineText = sxHeadlineText(conversation.kinkFactor, kfAgg.counted, kfAgg.considered);
            const catalog = sxCatalogCount();
            return {
                engine: "sync-1.1", a: nameA, b: nameB,
                heat: { a: heatA, b: heatB }, veil: { a: veilA, b: veilB }, shedFloor: F,
                topics: topics, topicsById: topicsById, play: play, conversation: conversation, straight: straight,
                coverage: {
                    aRated: ratedA, bRated: ratedB, catalog: catalog,
                    aPercent: catalog ? Math.round(ratedA / catalog * 100) : 0,
                    bPercent: catalog ? Math.round(ratedB / catalog * 100) : 0,
                    oneSided: oneSidedCount, limitBlocked: limitBlocked, fantasySetAside: fantasySetAside, shared: sharedCount
                },
                live: sxLivePair(A, B)
            };
        }
        function sxPairCompute(A, B, opts) {
            const ids = Uc(), metas = [], dataA = [], dataB = [];
            ids.forEach(id => {
                const m = sxMeta(id, [ A, B ]);
                metas.push(m), dataA.push(m ? sxTopicData(A, id, m) : null), dataB.push(m ? sxTopicData(B, id, m) : null);
            });
            return sxPairFromData(A, B, ids, metas, dataA, dataB, opts);
        }
        let sxCatalogCache = null;
        function sxCatalogCount() {
            if (null === sxCatalogCache) sxCatalogCache = Uc().filter(id => {
                const m = qn[id];
                return m && "Category" !== m.kind;
            }).length;
            return sxCatalogCache;
        }
        function sxGenderClass(genders) {
            const g = bb(genders || []), man = [ "man", "trans-man", "intersex-man", "demiman" ], woman = [ "woman", "trans-woman", "intersex-woman", "demiwoman" ],
                hasM = g.some(x => man.includes(x)), hasW = g.some(x => woman.includes(x));
            if (hasM && !hasW && g.every(x => man.includes(x))) return "man";
            if (hasW && !hasM && g.every(x => woman.includes(x))) return "woman";
            return null;
        }
        function sxExclusiveAttraction(profile) {
            const o = iv(profile.orientations || []);
            if (!o.length) return null;
            const self = sxGenderClass(profile.genders);
            let target = null;
            for (const t of o) {
                let cur = null;
                if ("straight" === t || "heterosexual" === t) cur = self ? "man" === self ? "woman" : "man" : null;
                else if ("lesbian" === t || "sapphic" === t || "gynesexual" === t) cur = "woman";
                else if ("gay" === t) cur = self;
                else if ("androsexual" === t || "achillean" === t || "uranic" === t || "minsexual" === t) cur = "man";
                else return null;
                if (!cur) return null;
                if (target && target !== cur) return null;
                target = cur;
            }
            return target;
        }
        function sxLivePair(A, B) {
            const classA = sxGenderClass(A.genders), classB = sxGenderClass(B.genders);
            if (!classA || !classB) return !0;
            const attA = sxExclusiveAttraction(A), attB = sxExclusiveAttraction(B);
            if (attA && attA !== classB) return !1;
            if (attB && attB !== classA) return !1;
            return !0;
        }
        function sxGroupCompute(profiles, opts) {
            opts = opts || {};
            const n = profiles.length, ids = Uc(), metas = ids.map(id => sxMeta(id, profiles)),
                data = profiles.map(p => ids.map((id, ix) => metas[ix] ? sxTopicData(p, id, metas[ix]) : null)),
                po = (i, j) => ({
                    heatA: (opts.heat || [])[i] ?? 0, heatB: (opts.heat || [])[j] ?? 0,
                    veilA: (opts.veil || [])[i] ?? 50, veilB: (opts.veil || [])[j] ?? 50
                }), pairs = [];
            for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(Object.assign({ i: i, j: j }, sxPairFromData(profiles[i], profiles[j], ids, metas, data[i], data[j], po(i, j))));
            const topics = [], topicsById = {};
            ids.forEach((id, ix) => {
                const meta = metas[ix];
                if (!meta) return;
                const limiters = [], flags = { notInterested: [], triedBy: [], fantasyBy: [], favoriteBy: [] };
                profiles.forEach((p, pi) => {
                    const d = data[pi][ix], nm = p.name || `Profile ${pi + 1}`;
                    d.limitScope && limiters.push({ name: nm, scope: d.limitScope }),
                    d.notInterested && flags.notInterested.push(nm), d.triedScope && flags.triedBy.push(nm),
                    d.fantasyScope && flags.fantasyBy.push(nm), d.favorite && flags.favoriteBy.push(nm);
                });
                const rec = {
                    id: id, label: meta.label, branch: meta.branch, limiters: limiters, groupLimited: limiters.length > 0,
                    playOutcome: "none", conversationCounts: !1, relevantPlayPairs: 0, relevantConvPairs: 0,
                    pairOutcomes: [], strength: null, flags: flags
                };
                topics.push(rec), topicsById[id] = rec;
                if (rec.groupLimited) return void (rec.playOutcome = "limit-blocked");
                const relPlay = pairs.filter(pr => pr.live && "invisible" !== pr.topicsById[id].outcome && "limit-blocked" !== pr.topicsById[id].outcome),
                    relConv = pairs.filter(pr => "invisible" !== pr.topicsById[id].outcome && "limit-blocked" !== pr.topicsById[id].outcome);
                rec.relevantPlayPairs = relPlay.length, rec.relevantConvPairs = relConv.length,
                rec.pairOutcomes = relConv.map(pr => ({ a: pr.a, b: pr.b, outcome: pr.topicsById[id].outcome }));
                if (relPlay.length) {
                    const mCount = relPlay.filter(pr => "match" === pr.topicsById[id].outcome).length,
                        cCount = relPlay.filter(pr => "match" === pr.topicsById[id].outcome || "curious-fit" === pr.topicsById[id].outcome).length,
                        strengths = relPlay.map(pr => pr.topicsById[id].strength).filter(s => null !== s);
                    rec.playOutcome = mCount > relPlay.length / 2 ? "match" : cCount > relPlay.length / 2 ? "curious-fit" : "mismatched",
                    rec.strength = strengths.length ? Math.min(...strengths) : null;
                }
                if (relConv.length) rec.conversationCounts = relConv.filter(pr => pr.topicsById[id].countClass).length > relConv.length / 2;
                /* Play KF / Play MS group entries (six-scores
                   provisional build, 2026-10-30; group handling =
                   recommendation 5 ACCEPTED: strict majority, more
                   than half, ties do NOT count — consistent with
                   group Charted and pair unanimity for two). Member
                   totals and table sums come from each member's own
                   topic data; the fit side reuses the pair records —
                   Play KF fit = the max cross fit over all member
                   pairs (signed max rule, as for pairs); Play MS
                   binary fit per member = 1 per direction type
                   (give-cross / receive-cross) in which any pair
                   involving that member has a cross term with
                   |term| > epsilon, epsilon from the GROUP heat
                   (arithmetic mean of member heats at formation,
                   sxGroupEps). A topic is group-shared when a strict
                   majority of members rated it. Group-max-zero: a
                   topic whose group max is zero contributes zero and
                   STAYS in the denominator (entries below are 0, never
                   null, for non-limited topics) — no fallback, no
                   invented average. No group-native tensor is
                   invented here. */
                const sxGroupEps = sxPlayEpsilon(opts.heat || []);
                const gTd = profiles.map((p2, pi) => data[pi][ix]),
                    gRatedCount = gTd.reduce((s, d) => s + (d && d.rated ? 1 : 0), 0);
                rec.groupSharedMajority = gRatedCount > profiles.length / 2;
                rec.groupFantasyAny = flags.fantasyBy.length > 0;
                if (!rec.groupLimited) {
                    const gTots = gTd.map(d => d ? sxPlayMemberTotal(d) : 0), gTotMax = Math.max(...gTots),
                        gGm = gTotMax > 0 ? sxPlayGeoMean(gTots.map(v => v / gTotMax)) : 0;
                    let gMaxFit = null;
                    pairs.forEach(pr => {
                        const pr2 = pr.topicsById[id];
                        if (!pr2) return;
                        [ pr2.crossFitGive, pr2.crossFitReceive ].forEach(f => { if (null != f && (null == gMaxFit || f > gMaxFit)) gMaxFit = f; });
                    });
                    rec.playKFEntry = null == gMaxFit ? 0 : gMaxFit / 100 * gGm;
                    const gCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            const pr2 = pr.topicsById[id];
                            if (!pr2) return;
                            if (pr.i === pi) { if (null != pr2.crossFitGive && Math.abs(pr2.crossFitGive) > sxGroupEps) giveFit = !0; if (null != pr2.crossFitReceive && Math.abs(pr2.crossFitReceive) > sxGroupEps) recvFit = !0; }
                            else if (pr.j === pi) { if (null != pr2.crossFitReceive && Math.abs(pr2.crossFitReceive) > sxGroupEps) giveFit = !0; if (null != pr2.crossFitGive && Math.abs(pr2.crossFitGive) > sxGroupEps) recvFit = !0; }
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxPlayTableFlags(gTd[pi]) : 0);
                    }), gCMax = Math.max(...gCs);
                    rec.playMSEntry = gCMax > 0 ? sxPlayGeoMean(gCs.map(v => v / gCMax)) : 0;
                    /* Parlay KF / Parlay MS group entries (group-Parlay
                       fix, 2026-10-30): the SAME construction as the
                       Play group entries directly above, with the
                       Straight Match as basis instead of the
                       Krossmatch. Member totals and table sums come
                       from each member's own topic data through
                       Parlay's OWN for-now table (sxParlayTableFlags:
                       Favorite 1 + Tried 1 + Fantasy 1 (full 1),
                       Teased absent); the fit side reuses the pair
                       records' straight register (pr.straight.byId) —
                       give-fit = give x give / 100, receive-fit =
                       receive x receive / 100, each in [-100, 100].
                       Parlay KF fit = the max straight fit over all
                       member pairs (signed max rule, as for pairs);
                       Parlay MS binary fit per member = 1 per
                       direction type (give-give / receive-receive) in
                       which any pair involving that member has a
                       straight term with |term| > epsilon, epsilon
                       from the GROUP heat (sxGroupEps, arithmetic
                       mean of member heats at formation). Group-max-
                       zero topics contribute zero and STAY in the
                       denominator (entries are 0, never null, for
                       non-limited topics). No peer-ground, no banded
                       topics are referred to in these scores. */
                    const pTots = gTd.map(d => d ? sxParlayMemberTotal(d) : 0), pTotMax = Math.max(...pTots),
                        pGm = pTotMax > 0 ? sxPlayGeoMean(pTots.map(v => v / pTotMax)) : 0;
                    let pMaxFit = null;
                    pairs.forEach(pr => {
                        const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                        if (!sr) return;
                        [ null != sr.giveGive ? sr.giveGive / 100 : null, null != sr.recvRecv ? sr.recvRecv / 100 : null ].forEach(f => { if (null != f && (null == pMaxFit || f > pMaxFit)) pMaxFit = f; });
                    });
                    rec.parlayKFEntry = null == pMaxFit ? 0 : pMaxFit / 100 * pGm;
                    const pCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            if (pr.i !== pi && pr.j !== pi) return;
                            const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                            if (!sr) return;
                            if (null != sr.giveGive && Math.abs(sr.giveGive / 100) > sxGroupEps) giveFit = !0;
                            if (null != sr.recvRecv && Math.abs(sr.recvRecv / 100) > sxGroupEps) recvFit = !0;
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxParlayTableFlags(gTd[pi]) : 0);
                    }), pCMax = Math.max(...pCs);
                    rec.parlayMSEntry = pCMax > 0 ? sxPlayGeoMean(pCs.map(v => v / pCMax)) : 0;
                }
            });
            /* Teaser bump, group level (Jason 2026-10-25). Standalone group
               rule, after majority assignment, before list construction.
               Group play: playOutcome "curious-fit" topics (fantasy
               excluded) promote to "match", strongest first, ties label
               A–Z, first ceil(|C| * h / 100) with h = lowest-set member's
               heat, at least one when h > 0. Group conversation:
               majority-curious topics (strict majority of members hold a
               curious stance on some flank; unrated never counts) that are
               not already counted promote to counted (conversationCounts
               = true), same curve and heat; fantasy IS allowed on the
               group conversation path, as it now is on the pair
               conversation bump too (ruled 2026-10-29, unified in the
               including direction; the earlier 00:36 group-only carve-out
               is superseded). Group PLAY above still excludes fantasy.
               The MOVE is feed-level and
               untouched; engine promotion here is disjoint from it by
               construction. Dd group glance reads grp.play, so group play
               flips flow there automatically; group-conversation promotions
               do NOT flow into Dd group glance (pre-existing gap, unchanged). */
            const bumpHeatArr = opts.heat || [],
                bumpLowest = sxLowestSet(pairs, profiles).lowest,
                bumpH = bumpLowest.length ? Math.min(...bumpLowest.map(m => bumpHeatArr[m] ?? 0)) : 0;
            if (bumpH > 0) {
                takeTop(topics.filter(r => !r.groupLimited && "curious-fit" === r.playOutcome && 0 === r.flags.fantasyBy.length).sort(byStrength), bumpH).forEach(r => { r.playOutcome = "match"; });
                takeTop(topics.filter(r => {
                    if (r.groupLimited || r.conversationCounts || r.relevantConvPairs <= 0) return !1;
                    const ix = ids.indexOf(r.id);
                    if (ix < 0) return !1;
                    let curious = 0;
                    profiles.forEach((p, pi) => {
                        const d = data[pi][ix];
                        if (!d) return;
                        const s = sxSides(d, bumpHeatArr[pi] ?? 0);
                        if ("curious" === s.give || "curious" === s.receive) curious++;
                    });
                    return curious > profiles.length / 2;
                }).sort(byStrength), bumpH).forEach(r => { r.conversationCounts = !0; });
            }
            const msAggG = sxPlayWeightedPct(topics, r => r.playMSEntry, r => !r.groupLimited && r.groupSharedMajority && !r.groupFantasyAny),
                kfAggG = sxPlayWeightedPct(topics, r => r.playKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                /* Parlay group aggregates (group-Parlay fix,
                   2026-10-30): hierarchy-share x kinkiness weighted,
                   via the same sxPlayWeightedPct as the Play group
                   aggregates. Considered set for BOTH numbers =
                   non-limit-blocked topics a strict majority of
                   members rated (groupSharedMajority) — fantasy is
                   INCLUDED in Parlay considered (unlike Play MS,
                   where fantasy is out), and limit-blocked topics
                   stay OUT of considered entirely. */
                msParlayAggG = sxPlayWeightedPct(topics, r => r.parlayMSEntry, r => !r.groupLimited && r.groupSharedMajority),
                kfParlayAggG = sxPlayWeightedPct(topics, r => r.parlayKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                gPlayTopics = topics.filter(r => !r.groupLimited && r.relevantPlayPairs > 0),
                gMatches = gPlayTopics.filter(r => "match" === r.playOutcome),
                play = {
                    considered: gPlayTopics.length, matches: gMatches.length,
                    headline: msAggG.pct,
                    label: "Play MS",
                    lists: {
                        matches: gMatches.sort(byStrength),
                        curiousAbout: gPlayTopics.filter(r => "curious-fit" === r.playOutcome).sort(byStrength),
                        mismatched: gPlayTopics.filter(r => "mismatched" === r.playOutcome).sort(byLabel),
                        limits: topics.filter(r => r.groupLimited).sort(byLabel)
                    }
                };
            play.headlineText = sxHeadlineText(play.headline, msAggG.counted, msAggG.considered);
            const gConvTopics = topics.filter(r => !r.groupLimited && r.relevantConvPairs > 0),
                gCounted = gConvTopics.filter(r => r.conversationCounts),
                conversation = {
                    considered: gConvTopics.length, counted: gCounted.length,
                    kinkFactor: kfAggG.pct,
                    label: "Play KF",
                    lists: {
                        counted: gCounted.sort(byLabel),
                        limits: topics.filter(r => r.groupLimited).sort(byLabel)
                    }
                };
            conversation.headlineText = sxHeadlineText(conversation.kinkFactor, kfAggG.counted, kfAggG.considered);
            const parlay = {
                considered: msParlayAggG.considered, counted: msParlayAggG.counted,
                headline: msParlayAggG.pct, kinkFactor: kfParlayAggG.pct,
                label: "Parlay MS", kfLabel: "Parlay KF",
                lists: {
                    limits: topics.filter(r => r.groupLimited).sort(byLabel)
                }
            };
            parlay.headlineText = sxHeadlineText(parlay.headline, msParlayAggG.counted, msParlayAggG.considered);
            parlay.kfHeadlineText = sxHeadlineText(parlay.kinkFactor, kfParlayAggG.counted, kfParlayAggG.considered);
            const hot = topics.filter(r => !r.groupLimited).map(r => ({
                id: r.id, label: r.label,
                score: pairs.reduce((sum, pr) => sum + (pr.topicsById[r.id] ? pr.topicsById[r.id].hotContribution : 0), 0)
            })).filter(r => r.score > 0).sort((x, y) => y.score - x.score || x.label.localeCompare(y.label));
            return {
                engine: "sync-1.1", pairs: pairs, topics: topics, topicsById: topicsById,
                play: play, conversation: conversation, parlay: parlay, hotTopics: hot, hotTopicsTop10: hot.slice(0, 10)
            };
        }
        /* ===== Two-ring scores (O5 + O6, ruled 2026-10-29) =====
           Personal Kink Factor and Charted are computed per TOPIC over ALL
           403 topics. (The pair/group Play KF and Play MS
           in the sync engine above are kinkiness-weighted too — same
           weight, over their shared considered topics, via
           sxKinkWeightedPct — as are the interim Straight / Parlay
           values below.) Effective topic weight = hierarchical share x
           kinkiness (kinkiness = 1 - O6 aggregated popularity); the
           denominator is the total weighted topic weight over all 403
           topics and never shrinks (limit-excluded topics stay in it).
           Personal: per topic, the MAX flank rating contribution (signed,
           value/100 per known flank; negatives count and subtract) plus the
           topic flag sum counted ONCE per topic (favorite 1, tried 1,
           fantasy 0.5; curious and teased are NOT in the table). Unrated
           but marked topics have base 0 and their flags still count.
           A topic carrying a limit counts NOTHING in either ring (limit
           wins over every other mark). Not Interested alone adds nothing
           to Personal. Percent is NOT clamped at 100.
           Charted: a topic is attended when rated on either flank OR
           flagged OR marked Not Interested alone (binary 1); its amount is
           (rated ? 1 : 0) + flag sum, with Not Interested alone counting
           the binary 1. No clamp. Group Charted (B4): a topic counts when
           a majority of members attend it under the same individual rules,
           members equal, weighted share over all 403 topics, no clamp.
           EPSILON AMENDMENT (six-scores provisional build, 2026-10-30;
           recommendation 4): the rating tests above are epsilon-
           thresholded — a flank counts BY RATING only if |rating| >
           epsilon, epsilon = e_0 * e^(-heat/100), e_0 = 1, from the
           person's OWN heat (Charted is personal-only; group Charted
           judges each member's attendance by that member's own heat,
           then takes the majority — group heat is NOT applied to
           Charted). High heat = smaller epsilon = more topics count;
           low heat = larger epsilon = fewer. This applies to
           Charted's rated term AND to Personal KF's flank term (the
           max is taken over epsilon-passing flanks only). Flag sums
           are unchanged and are NOT epsilon-thresholded. */
        let sxShareCache = null;
        function sxTopicShares() {
            if (sxShareCache) return sxShareCache;
            const ids = Uc(), metas = ids.map(id => sxMeta(id, null)), byBranch = new Map;
            ids.forEach((id, ix) => { const m = metas[ix]; if (!m) return; if (!byBranch.has(m.branch)) byBranch.set(m.branch, []); byBranch.get(m.branch).push([ id, m ]); });
            const shares = {}, nBranch = Math.max(1, byBranch.size);
            byBranch.forEach(list => {
                const peers = new Map;
                list.forEach(([ id, m ]) => { const k = m.parentId || id; if (!peers.has(k)) peers.set(k, []); peers.get(k).push(id); });
                const peerShare = (1 / nBranch) / Math.max(1, peers.size);
                peers.forEach(members => { const s = peerShare / Math.max(1, members.length); members.forEach(id => { shares[id] = s; }); });
            });
            return sxShareCache = shares;
        }
        function sxTopicWeight(id, meta) {
            const sh = sxTopicShares()[id] || 0;
            let kink = null;
            try { kink = window.__sxO6 ? window.__sxO6.kinkinessById(id) : null; } catch (err) { __sxErrLog("sx-o6-kinkiness", err); }
            return sh * (null == kink ? 1 : kink);
        }
        function sxFlagSum(td) {
            return (td.favorite ? 1 : 0) + (td.triedScope ? 1 : 0) + (td.fantasyScope ? .5 : 0);
        }
        function sxTopicTerms(td, eps) {
            if (td.limitScope) return null;
            /* Epsilon rating threshold (provisional amendment): eps
               defaults to the heat-0 value (e_0 = 1) when a caller
               passes none. A flank counts by rating only if its
               absolute rating exceeds eps; the epsilon-rated flag
               below replaces the plain rated flag in BOTH terms. */
            const e = Number.isFinite(eps) ? eps : SX_EPSILON_E0, flanks = [];
            if (td.single) { if (td.rated && null != td.singleValue && Math.abs(td.singleValue) > e) flanks.push(td.singleValue / 100); }
            else { if (td.raw.giveKnown && Math.abs(td.raw.give) > e) flanks.push(td.raw.give / 100); if (td.raw.receiveKnown && Math.abs(td.raw.receive) > e) flanks.push(td.raw.receive / 100); }
            const ratedE = flanks.length > 0,
                base = ratedE ? Math.max(...flanks) : 0, flags = sxFlagSum(td);
            const attended = ratedE || flags > 0 || td.notInterested;
            return {
                personal: base + flags,
                charted: attended ? (ratedE ? 1 : 0) + flags + (!ratedE && !flags && td.notInterested ? 1 : 0) : 0,
                attended: attended
            };
        }
        function sxPersonalCharted(profile) {
            if (!profile) return { personal: null, charted: null };
            const ids = Uc(); let num = 0, ch = 0, den = 0;
            /* Epsilon from this person's OWN heat (personal-only). */
            const eps = sxPlayEpsilon([ profile.id ? sxHeatFor(profile.id) : 0 ]);
            ids.forEach(id => {
                const meta = sxMeta(id, [ profile ]); if (!meta) return;
                const w = sxTopicWeight(id, meta); den += w;
                const terms = sxTopicTerms(sxTopicData(profile, id, meta), eps);
                if (!terms) return;
                num += w * terms.personal, ch += w * terms.charted;
            });
            return den > 0 ? { personal: 100 * num / den, charted: 100 * ch / den } : { personal: null, charted: null };
        }
        function sxGroupCharted(profiles) {
            if (!profiles || !profiles.length) return null;
            const ids = Uc(); let ch = 0, den = 0;
            ids.forEach(id => {
                const meta = sxMeta(id, profiles); if (!meta) return;
                const w = sxTopicWeight(id, meta); den += w;
                let attended = 0;
                /* Each member's attendance is judged by their OWN
                   heat (own epsilon), then strict majority. */
                profiles.forEach(p => { const terms = sxTopicTerms(sxTopicData(p, id, meta), sxPlayEpsilon([ p.id ? sxHeatFor(p.id) : 0 ])); if (terms && terms.attended) attended++; });
                if (attended > profiles.length / 2) ch += w;
            });
            return den > 0 ? 100 * ch / den : null;
        }
        /* Circledot (straight) ring values: Parlay MS (outer) and
           Parlay KF (inner) — Parlay mirrors Play on the straight
           match (give x give, receive x receive, normed /100).
           PROVISIONAL (six-scores build, 2026-10-30): built with the
           provisional rulings for consideration; the Saturday final
           adoption is still unanswered and the final inclusion
           tables are DEFERRED — both named as left in the build
           verdict. Kinkiness weighting: hierarchy share x kinkiness,
           once, numerator and denominator alike, via
           sxPlayWeightedPct. This function serves a PAIR only;
           group Parlay (casts of more than 2) is computed in
           sxGroupCompute by the same construction and served to
           the same header surface by sxRingValuesForCast (bands /
           seats / lists stay pair-only, unchanged). */
        function sxStraightInterim(pair) {
            if (!pair || !pair.straight) return { outer: null, inner: null };
            /* Parlay KF / Parlay MS (six-scores provisional build,
               2026-10-30): the Play formulas with the STRAIGHT match
               as basis instead of the Krossmatch, on Parlay's OWN
               for-now table (sxParlayTableFlags: Favorite 1, Tried 1, Fantasy 1
               FULL). GROUND x FIT, as for Play: marks and
               fit existence determine the ground; the signed fit
               multiplies over it. Straight fits, normed by 100:
               give-fit = my give x your give / 100, receive-fit = my
               receive x your receive / 100 (the straight register
               stores the raw products), each in [-100, 100].
               Parlay KF entry = max straight fit (as a fraction) x
               geometric mean over members of (rated-or-not + Parlay
               table sum), group-max normalized. Parlay MS entry =
               geometric mean over members of (binary straight fit +
               Parlay table flag sum), group-max normalized, binary
               fit per direction = 1 iff |term| > epsilon (epsilon
               from the group heat = mean of the two members' heats
               at formation, pair.heat). CONSIDERED SET
               (recommendation 3 ACCEPTED): shared, non-limit-blocked
               topics for BOTH numbers — the straight register's
               "shared" status already excludes limit-blocked topics,
               which stay OUT even though they could be conversational
               fodder, because they are not conversations to
               encourage. Fantasy is INCLUDED in Parlay considered
               (unlike Play, where fantasy is out of considered), and
               debate topics (negative fit) count in numerator and
               denominator alike. SIGN DIVERGENCE — PROVISIONAL,
               flagged open, NOT settled: Parlay MS counts both kinds
               of ground (binary fit uses |term|, so common ground and
               debate ground both count as conversational fodder),
               while Parlay KF keeps the sign via the signed max fit
               factor (max rule: max(-100, 80) = 80 — max is positive
               if ANY direction is positive; negative only if BOTH
               directions are negative, least negative). No band
               counting is used in either number. This function is
               the pair path; group casts use the group construction
               in sxGroupCompute, on this same table and basis. */
            const sxParlayEps = sxPlayEpsilon(pair.heat ? [ pair.heat.a, pair.heat.b ] : []),
                recs = pair.straight.topics.map(s => {
                    if ("shared" !== s.status) return { id: s.id, entryKF: null, entryMS: null, consideredKF: !1, consideredMS: !1 };
                    const rec = pair.topicsById ? pair.topicsById[s.id] : null, fl = rec ? rec.flags || {} : {},
                        ra = rec ? rec.ratings.a : null, rb = rec ? rec.ratings.b : null,
                        mkTd = (r, name) => ({
                            rated: !!(r && (r.giveKnown || r.receiveKnown)),
                            favorite: (fl.favoriteBy || []).includes(name),
                            triedScope: (fl.triedBy || []).includes(name) ? "topic" : null,
                            fantasyScope: (fl.fantasyBy || []).includes(name) ? "topic" : null
                        }),
                        tdA = mkTd(ra, pair.a), tdB = mkTd(rb, pair.b),
                        fitG = null != s.giveGive ? s.giveGive / 100 : null,
                        fitR = null != s.recvRecv ? s.recvRecv / 100 : null,
                        sFits = [ fitG, fitR ].filter(v => null != v),
                        maxFit = sFits.length ? Math.max(...sFits) : null,
                        totA = sxParlayMemberTotal(tdA), totB = sxParlayMemberTotal(tdB), totMax = Math.max(totA, totB),
                        gm = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                        binFit = (null != fitG && Math.abs(fitG) > sxParlayEps ? 1 : 0) + (null != fitR && Math.abs(fitR) > sxParlayEps ? 1 : 0),
                        cA = binFit + sxParlayTableFlags(tdA), cB = binFit + sxParlayTableFlags(tdB), cMax = Math.max(cA, cB);
                    return {
                        id: s.id,
                        entryKF: null == maxFit ? null : maxFit / 100 * gm,
                        entryMS: cMax > 0 ? sxPlayGeoMean([ cA / cMax, cB / cMax ]) : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                }),
                msAggS = sxPlayWeightedPct(recs, r => r.entryMS, r => r.consideredMS),
                kfAggS = sxPlayWeightedPct(recs, r => r.entryKF, r => r.consideredKF);
            return { outer: msAggS.pct, inner: kfAggS.pct };
        }
        /* Score-ring values for a tab/profile context. kind: "profile"
           (outer Charted, inner Personal KF), "bowtie" (outer Play MS,
           inner Play KF, off the pair/group engine aggregates),
           "circledot" (Parlay MS / Parlay KF pair, provisional). */
        function sxRingValuesForProfile(profile) {
            const pc = sxPersonalCharted(profile);
            return { outerLabel: "Charted", outer: pc.charted, innerLabel: "Personal Kink Factor", inner: pc.personal };
        }
        function sxRingValuesForCast(profiles, pairOp) {
            if (!profiles || profiles.length < 2) return null;
            const grp = sxGroupCompute(profiles, {}), isPair = 2 === profiles.length, pair = isPair ? grp.pairs[0] : null;
            /* No Charted pass here (Rank 10, 2026-10-30): this function
               used to compute sxGroupCharted(profiles) into a `charted`
               field on every return, but its only frequent caller (the
               header paint) reads outer/inner only and threw that pass
               away on every render. The one consumer of group Charted,
               the dialog readback, calls sxGroupCharted directly, so
               the pass runs exactly once, only when the dialog opens. */
            if ("straight" === pairOp) {
                if (!isPair) {
                    /* Group Parlay (group-Parlay fix, 2026-10-30):
                       casts of more than 2 read the group engine's
                       Parlay aggregates (grp.parlay, computed in
                       sxGroupCompute by the same construction as the
                       group Play aggregates) — the SAME header surface
                       pair Parlay and group Play already use; no new
                       surface is invented. */
                    const par = grp.parlay;
                    return { outerLabel: "Parlay MS", outer: par ? par.headline : null, innerLabel: "Parlay KF", inner: par ? par.kinkFactor : null };
                }
                const si = sxStraightInterim(pair);
                return { outerLabel: "Parlay MS", outer: si.outer, innerLabel: "Parlay KF", inner: si.inner };
            }
            const play = isPair ? pair.play : grp.play, conv = isPair ? pair.conversation : grp.conversation;
            return { outerLabel: "Play MS", outer: play ? play.headline : null, innerLabel: "Play KF", inner: conv ? conv.kinkFactor : null };
        }
        /* Score rings (two-ring build): the header Avatar rings are the
           only score-ring paint — outer + inner rings in the same
           108-unit geometry as the header seat (bands 16 units thick,
           tiling outward from the centre), painted by the header block
           in Mr from the ring value providers below. Arc length is
           clamped to the circle for display only; the printed number
           is always the true engine value, including values above 100
           or below 0. Bucket rings (sxRingsHtml) are a different
           mechanism and stay distinct: these rings show engine scores
           only. No below-strip or tab-strip score-ring surface
           remains (ruled 2026-10-30). */
        function sxPctText(v) { return null == v || !Number.isFinite(v) ? "—" : `${Math.round(v)}%`; }
        /* Tab-strip rings removed (ruled 2026-10-29) and match-stage
           score-ring hosts removed (ruled 2026-10-30): no rings render
           in the profile tab strip or below it for individual, group,
           or match tabs — ring numbers live only in the header Avatar
           rings. The ring value providers stay for the header paint. */
        window.__sxRings = { personalCharted: sxPersonalCharted, groupCharted: sxGroupCharted, straightInterim: sxStraightInterim, ringValuesForProfile: sxRingValuesForProfile, ringValuesForCast: sxRingValuesForCast, topicShares: sxTopicShares };
        function sxProfileById(id) {
            return {
                id: id, name: wt[id] || "Profile",
                ratings: vt[id] || {}, annotations: Qe[id] || {}, fantasyOnly: Je[id] || {},
                alreadyTried: et[id] || {}, importedChildren: at[id] || {},
                genders: bb(rt[id]), orientations: iv(ot[id])
            };
        }
        const sxPairCache = new Map;
        function sxInvalidatePairs() {
            sxPairCache.clear();
        }
        function sxPairByIds(idA, idB, sxSettings) {
            if (!vt[idA] || !vt[idB] || idA === idB) return null;
            const [ x, y ] = [ idA, idB ].sort();
            if (sxSettings) return sxPairCompute(sxProfileById(x), sxProfileById(y), {
                heatA: sxSettings[x] ? sxSettings[x].heat : 0, heatB: sxSettings[y] ? sxSettings[y].heat : 0,
                veilA: sxSettings[x] ? sxSettings[x].veil : 50, veilB: sxSettings[y] ? sxSettings[y].veil : 50
            });
            const key = x + "|" + y;
            if (!sxPairCache.has(key)) sxPairCache.set(key, sxPairCompute(sxProfileById(x), sxProfileById(y), {}));
            return sxPairCache.get(key);
        }
        function sxRouteRecord(fit, id) {
            const labels = Ge(id);
            return {
                key: "AtoB" === fit.direction ? "firstGive" : "secondGive",
                score: fit.strength, giver: fit.giver, receiver: fit.receiver,
                giverRating: Math.round(fit.giverRating), receiverRating: Math.round(fit.receiverRating),
                giverLabel: labels.labels[0], receiverLabel: labels.labels[1] || labels.labels[0],
                roleLocked: !1
            };
        }
        window.__SEXCAPADES_SYNC_ENGINE = {
            version: "1.1",
            pair: sxPairCompute,
            group: sxGroupCompute,
            pairByIds: sxPairByIds,
            livePair: sxLivePair,
            profileById: sxProfileById
        };
        function _d(e, t = !1) {
            return e ? `${e.giver}: ${e.giverLabel || "give"}${t ? ` ${e.giverRating}` : ""} → ${e.receiver}: ${e.receiverLabel || "receive"}${t ? ` ${e.receiverRating}` : ""}` : "";
        }
        function Dd(e, t, heat) {
            // Adapter over the sync engine v1.1: the second argument (the
            // retired leniency value) is accepted for call-site compatibility
            // and ignored — no score, bar, or tolerance reads it anymore.
            // Two profiles read the pair Play aggregation; three or more
            // read the group Play aggregation (strict-majority rules).
            const grp = sxGroupCompute(e, { heat: heat || [] }), isPair = 2 === e.length, pair = isPair ? grp.pairs[0] : null,
                agg = isPair ? pair.play : grp.play, recs = isPair ? pair.topics : grp.topics,
                n = {}, i = {}, a = {}, r = {}, o = {}, s = {}, l = [], c = [], d = [];
            let p = 0;
            recs.forEach(rec => {
                if (rec.groupLimited || "limit-blocked" === rec.playOutcome) return void p++;
                if ("match" === rec.playOutcome) {
                    l.push(rec.label), n[rec.id] = {
                        give: rec.strength || 0,
                        receive: rec.strength || 0
                    };
                    const routes = isPair ? pair.topicsById[rec.id].fits.filter(f => !f.shed).map(f => sxRouteRecord(f, rec.id)) : grp.pairs.map(pr => pr.topicsById[rec.id]).filter(pr => pr && pr.bestFit).map(pr => sxRouteRecord(pr.bestFit, rec.id));
                    s[rec.id] = {
                        score: rec.strength || 0,
                        routes: routes
                    }, rec.flags.favoriteBy.length === e.length && (i[rec.id] = "favorite"),
                    rec.flags.fantasyBy.length && (a[rec.id] = !0), rec.flags.triedBy.length && (r[rec.id] = !0),
                    e.forEach(e => {
                        const t = (e.importedChildren || {})[rec.id];
                        t && !o[rec.id] && (o[rec.id] = Object.assign({}, t));
                    });
                } else if ("curious-fit" === rec.playOutcome) c.push(rec.label);
                else if ("conflict" === rec.playOutcome || "one-sided" === rec.playOutcome || "not-topics" === rec.playOutcome || "mismatched" === rec.playOutcome) d.push(rec.label);
            }), d.sort((e, t) => e.localeCompare(t));
            // Display-layer MOVE, pair glance only: a teased topic (teaserFor
            // non-empty AND countClass exactly "soft-no" — the identical
            // predicate as the match-tab MOVE) splices from the Not list (d)
            // to the Curiosity? list (c), appended in d-sorted order. Each
            // label in d was pushed by the record carrying that same label
            // (rec.label above), so the record for a label is the recs entry
            // with that label. Hot (l) is never reassigned; outcomes are
            // untouched — this only re-buckets labels for display.
            if (isPair) {
                const moved = [];
                for (let k = d.length - 1; k >= 0; k--) {
                    const rec = recs.find(r => r.label === d[k]);
                    rec && sxIsTeased(rec) && moved.unshift(d.splice(k, 1)[0]);
                }
                c.push(...moved);
            }
            return {
                ratings: n,
                marks: i,
                fantasyFlags: a,
                triedFlags: r,
                children: o,
                matchDetails: s,
                percent: agg.headline || 0,
                noScore: null === agg.headline,
                things: agg.considered,
                clicks: agg.matches,
                limits: p,
                results: {
                    matches: l,
                    curiousAbout: c,
                    mismatched: d
                },
                sx: isPair ? pair : grp
            };
        }
        function DdStraight(e, heat) {
            // Straight-pair adapter over the sync engine (2026-10-27),
            // the Dd analog for ⊙ pairs: it derives NO new math. The
            // values are the engine's own straight register — the same
            // register the ⊙ view's taper paint reads (pair.straight
            // .byId): per shared topic, give flank = (first give ×
            // second give) / 100, receive flank = (first receive ×
            // second receive) / 100 — the straight match normed by
            // 100, stored as the pair profile's own ratings so the
            // pair tab paints, persists, and exports like any profile.
            // The straight register carries no buckets, headline, or
            // rollup (deferred rulings in sxGroupCompute), so results
            // stay empty and noScore stays true; marks and flags ride
            // the shared topics exactly as Dd's ride its matches.
            const grp = sxGroupCompute(e, { heat: heat || [] }), pair = 2 === e.length ? grp.pairs[0] : null,
                n = {}, i = {}, a = {}, r = {}, o = {};
            if (pair && pair.straight) pair.straight.topics.forEach(srec => {
                if ("shared" !== srec.status) return;
                const v = {};
                null != srec.giveGive && (v.give = srec.giveGive / 100), null != srec.recvRecv && (v.receive = srec.recvRecv / 100);
                if (!Object.keys(v).length) return;
                n[srec.id] = v;
                const rec = pair.topicsById[srec.id];
                rec && rec.flags.favoriteBy.length === e.length && (i[srec.id] = "favorite"),
                rec && rec.flags.fantasyBy.length && (a[srec.id] = !0), rec && rec.flags.triedBy.length && (r[srec.id] = !0),
                e.forEach(p => {
                    const t = (p.importedChildren || {})[srec.id];
                    t && !o[srec.id] && (o[srec.id] = Object.assign({}, t));
                });
            });
            return {
                ratings: n,
                marks: i,
                fantasyFlags: a,
                triedFlags: r,
                children: o,
                matchDetails: {},
                percent: 0,
                noScore: !0,
                things: 0,
                clicks: 0,
                limits: pair && pair.straight ? pair.straight.coverage.limitBlocked : 0,
                results: {
                    matches: [],
                    curiousAbout: [],
                    mismatched: []
                },
                sx: pair
            };
        }
        // Blocker stage (owner rulings, 2026-10-27): a recompute reads
        // the LIVE source profiles, never the frozen mint-time copies —
        // n.sourceProfiles is refreshed from live state below whenever
        // at least two sources are still open (the stored copies remain
        // only as the fallback for a group whose sources were closed).
        // Merged values and values edited on the pair tab itself are
        // ratings too: they live in the pair's computed map (vt[e] and
        // its companion maps) and a recompute must remember them. The
        // mechanism is tag-free — no per-value provenance is stored on
        // any value or record: sxPairBase keeps the last PURE
        // computation per group id, in memory only. Any current value
        // that differs from that baseline is a user value (an edit on
        // this tab, or a value merged in through Load) and is
        // re-applied over the fresh computation; a baseline value the
        // user cleared stays cleared while the fresh computation still
        // produces the baseline value. Pure computed values follow the
        // fresh result, including disappearing when sources change.
        function sxPairUserApply(e, a) {
            const base = sxPairBase[e];
            if (!base) return;
            const same = (x, y) => JSON.stringify(x ?? null) === JSON.stringify(y ?? null), curR = vt[e] || {}, curM = Qe[e] || {}, curF = Je[e] || {}, curT = et[e] || {}, curC = at[e] || {};
            Object.keys(curR).forEach(id => {
                same(curR[id], (base.ratings || {})[id]) || (a.ratings[id] = Pd(curR[id]));
            }), Object.keys(a.ratings).forEach(id => {
                id in curR || void 0 === (base.ratings || {})[id] || same(a.ratings[id], base.ratings[id]) && delete a.ratings[id];
            }), Object.keys(curM).forEach(id => {
                same(curM[id], (base.marks || {})[id]) || (a.marks[id] = curM[id]);
            }), Object.keys(a.marks).forEach(id => {
                id in curM || void 0 === (base.marks || {})[id] || same(a.marks[id], base.marks[id]) && delete a.marks[id];
            }), Object.keys(curF).forEach(id => {
                (base.fantasyFlags || {})[id] || (a.fantasyFlags[id] = !0);
            }), Object.keys(a.fantasyFlags).forEach(id => {
                (base.fantasyFlags || {})[id] && !curF[id] && delete a.fantasyFlags[id];
            }), Object.keys(curT).forEach(id => {
                (base.triedFlags || {})[id] || (a.triedFlags[id] = !0);
            }), Object.keys(a.triedFlags).forEach(id => {
                (base.triedFlags || {})[id] && !curT[id] && delete a.triedFlags[id];
            }), Object.keys(curC).forEach(id => {
                (base.children || {})[id] || id in a.children || (a.children[id] = Pd(curC[id]));
            });
        }
        function Rd(e) {
            const n = ft[e];
            if (!n || "group" !== n.kind || !Array.isArray(n.sourceProfiles) || n.sourceProfiles.length < 2) return !1;
            const liveIds = (n.sourceIds || []).filter(id => vt[id]);
            if (liveIds.length >= 2) n.sourceProfiles = liveIds.map(id => ({
                name: wt[id],
                ratings: Pd(vt[id]),
                annotations: Pd(Qe[id]),
                fantasyOnly: Pd(Je[id]),
                alreadyTried: Pd(et[id]),
                importedChildren: Pd(at[id]),
                genders: bb(rt[id]),
                orientations: iv(ot[id]),
                veil: av(vpt[id]),
                veilEnabled: Boolean(vht[id]),
                net: av(vpt[id]),
                netEnabled: Boolean(vht[id])
            }));
            const a = "straight" === n.pairOp ? DdStraight(n.sourceProfiles, (n.sourceIds || []).map(id => sxHeatFor(id))) : Dd(n.sourceProfiles, null, (n.sourceIds || []).map(id => sxHeatFor(id)));
            const freshBase = {
                ratings: Pd(a.ratings),
                marks: Pd(a.marks),
                fantasyFlags: Pd(a.fantasyFlags),
                triedFlags: Pd(a.triedFlags),
                children: Pd(a.children)
            };
            sxPairUserApply(e, a), sxPairBase[e] = freshBase;
            return vt[e] = a.ratings, Ze[e] = Object.fromEntries(Object.keys(a.ratings).map(e => [ e, {
                give: "group",
                receive: "group"
            } ])), Qe[e] = a.marks, Je[e] = a.fantasyFlags, et[e] = a.triedFlags, at[e] = a.children,
            n.percent = a.percent, n.things = a.things, n.clicks = a.clicks, 
            n.noScore = a.noScore, n.sxEngine = a.sx, 
            n.limits = a.limits, n.results = a.results, n.matchDetails = a.matchDetails, (function() {
                try {
                    n.sxMode = sxcv.mode, n.sxHeat = (n.sourceIds || []).map(id => sxHeatFor(id)), n.sxVeil = (n.sourceIds || []).map(id => sxVeilFor(id));
                } catch (err) {
                    __sxErrLog("sx-stamp", err);
                }
            })(), zt(e), 
            !0;
        }
        // Live-own, snapshot-source (owner ruling, 2026-10-27): a match
        // tab's OWN changes — slider edits on the pair tab itself and
        // merges folded into the pair — move its metrics (buckets,
        // Charted inputs, rings, Kink Factor, Match Score) live, in
        // real time, while source-profile changes never move an
        // existing match tab. So this refresh recomputes the record's
        // derived fields from the pair's OWN stored snapshots
        // (n.sourceProfiles as of the last mint/recompute — source
        // edits since then are NOT read) and its STAMPED Heat
        // (n.sxHeat — a source Heat change stages until a fork, it
        // does not leak in here), then re-applies the pair's own user
        // values through the same baseline diff Rd uses. It runs off
        // zt, the marker every edit funnels through, only for groups
        // computed this session (a baseline exists); a group restored
        // from storage has no baseline yet and is left exactly as
        // saved. It never calls zt itself, so it cannot recurse.
        function sxRefreshGroupOwn(e) {
            const n = ft[e];
            if (!n || "group" !== n.kind || !sxPairBase[e] || !Array.isArray(n.sourceProfiles) || n.sourceProfiles.length < 2) return;
            const heat = Array.isArray(n.sxHeat) && n.sxHeat.length === n.sourceProfiles.length ? n.sxHeat.slice() : (n.sourceIds || []).map(id => sxHeatFor(id));
            const a = "straight" === n.pairOp ? DdStraight(n.sourceProfiles, heat) : Dd(n.sourceProfiles, null, heat);
            sxPairUserApply(e, a), vt[e] = a.ratings, Ze[e] = Object.fromEntries(Object.keys(a.ratings).map(e => [ e, {
                give: "group",
                receive: "group"
            } ])), Qe[e] = a.marks, Je[e] = a.fantasyFlags, et[e] = a.triedFlags, at[e] = a.children, 
            n.percent = a.percent, n.things = a.things, n.clicks = a.clicks, n.noScore = a.noScore, n.sxEngine = a.sx, 
            n.limits = a.limits, n.results = a.results, n.matchDetails = a.matchDetails;
        }
        let Od = 0, Bd = null, qd = [], Wd = null;
        function Kd() {
            const e = Mt && ft[Mt];
            return e && "group" === e.kind && Array.isArray(e.sourceProfiles) && e.sourceProfiles.length >= 2 ? e : null;
        }
        function zd(e = sxCompareIds) {
            return e.filter(e => vt[e]).map(e => ({
                name: wt[e],
                ratings: vt[e],
                annotations: Qe[e],
                fantasyOnly: Je[e],
                alreadyTried: et[e],
                importedChildren: at[e],
                genders: bb(rt[e]),
                orientations: iv(ot[e])
            }));
        }
        function Vd() {
            // Leniency removal (2026-10-27): the compare refresh no
            // longer derives or carries any leniency value — the
            // engine ignored the slot, and the values it fed (Hd, the
            // Wd input) have no live reader. The refresh itself —
            // pinning the current multi-select in qd, recomputing the
            // overlay data, repainting the match tabs — is unchanged.
            const d = Yi().filter(e => vt[e]), u = d.length >= 2;
            qd = u ? d.slice() : [], Wd = u ? Dd(zd(d), null, d.map(id => sxHeatFor(id))) : null;
            sxRefreshMatchTabs();
        }
        /* ===== Compare view: presentation layer over the sync engine =====
           Mode (Conversation / Play) is in-memory UI state and always starts
           at Conversation on a fresh page load. Per-person Heat is SESSION
           state: held here, mirrored to sessionStorage so it survives
           navigation and reloads within one browser session, reset by a new
           browser session, and never written into any profile. Veil is
           PROFILE data now (the profile store's veil maps, read through
           sxVeilFor); a legacy veil object in the stored session blob is
           ignored on load, never migrated into any profile. Saved group
           records snapshot mode/Heat/Veil at save time (see the stamp in
           Rd). Group Heat is the same SESSION state, keyed by group
           profile id in sxcv.groupHeat: its default is the arithmetic
           mean of the group's stamped member heats (Rd's sxHeat
           snapshot, falling back to the members' live heats), and a
           user-set value overrides that default for that group only.
           Group Heat never feeds Rd, Dd, DdStraight, or any score; it
           only exposes and adjusts the group's heat. Negative Heat zone
           names are PLACEHOLDERS pending a naming
           pass: "Cooling" (-1..-24), "Chilled" (-25..-74),
           "Turned off" (-75..-100). */
        const SXCV_KEY = "sexcapades.compare.session.v1";
        const sxcv = { mode: "conversation", heat: {}, groupHeat: {} };
        try {
            const raw = sessionStorage.getItem(SXCV_KEY);
            if (raw) {
                const p = JSON.parse(raw);
                p && p.heat && "object" == typeof p.heat && (sxcv.heat = p.heat);
                p && p.groupHeat && "object" == typeof p.groupHeat && (sxcv.groupHeat = p.groupHeat);
            }
        } catch (err) { __sxErrLog("sxcv-load", err); }
        function sxcvSave() {
            try { sessionStorage.setItem(SXCV_KEY, JSON.stringify({ heat: sxcv.heat, groupHeat: sxcv.groupHeat })); } catch (err) { __sxErrLog("sxcv-save", err); }
        }
        function sxHeatFor(key) {
            const v = Number(sxcv.heat[key]);
            return Number.isFinite(v) ? Math.max(-100, Math.min(100, Math.round(v))) : 0;
        }
        function sxIsGroup(e) {
            return !!(e && ft[e] && "group" === ft[e].kind);
        }
        function sxGroupHeatDefault(e) {
            const n = ft[e];
            if (!n || "group" !== n.kind) return 0;
            const expect = Array.isArray(n.sourceProfiles) ? n.sourceProfiles.length : (n.sourceIds || []).length;
            const stamped = Array.isArray(n.sxHeat) ? n.sxHeat.filter(v => Number.isFinite(Number(v))).map(v => Number(v)) : [];
            const vals = stamped.length === expect && expect > 0 ? stamped : (n.sourceIds || []).map(id => sxHeatFor(id));
            if (!vals.length) return 0;
            return Math.max(-100, Math.min(100, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)));
        }
        function sxGroupHeatFor(e) {
            const v = Number(sxcv.groupHeat[e]);
            return Number.isFinite(v) ? Math.max(-100, Math.min(100, Math.round(v))) : sxGroupHeatDefault(e);
        }
        function sxHeatDisplayFor(e) {
            return sxIsGroup(e) ? sxGroupHeatFor(e) : sxHeatFor(e);
        }
        function sxVeilFor(key) {
            const v = Number(vpt[key]);
            return Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 50;
        }
        function sxHeatZone(v) {
            return v >= 75 ? "Horndog" : v >= 25 ? "Hot" : v >= 1 ? "Warm" : 0 === v ? "Neutral" : v <= -75 ? "Turned off" : v <= -25 ? "Chilled" : "Cooling";
        }
        let sxCtx = null, sxAudio = null, sxBuzzTarget = null;
        const sxBuzzFired = new Set;
        function sxCompareContext() {
            const sel = Yi().filter(id => vt[id]);
            if (sel.length >= 2) return { ids: sel.slice(), profiles: zd(sel), saved: !1 };
            const c = Kd();
            if (c && Array.isArray(c.sourceProfiles) && c.sourceProfiles.length >= 2) return { ids: (c.sourceIds || []).slice(), profiles: c.sourceProfiles, saved: !0 };
            return null;
        }
        function sxKey(ctx, i) {
            return ctx.ids[i] || `sx-person-${i}`;
        }
        function sxRun(ctx) {
            const heat = ctx.profiles.map((p, i) => sxHeatFor(sxKey(ctx, i))), veil = ctx.profiles.map((p, i) => sxVeilFor(sxKey(ctx, i)));
            return sxGroupCompute(ctx.profiles, { heat: heat, veil: veil });
        }
        function sxRatingText(r) {
            if (!r) return "not rated";
            if (r.single) return null != r.singleValue ? `${Math.round(r.singleValue)} · direction unspecified` : "not rated";
            if (!r.giveKnown && !r.receiveKnown) return "not rated";
            return `give ${r.giveKnown ? Math.round(r.give) : "—"} · receive ${r.receiveKnown ? Math.round(r.receive) : "—"}`;
        }
        function sxFitText(rec) {
            if (!rec.bestFit) return "";
            const dirs = [], seen = new Set;
            rec.fits.filter(f => !f.shed).forEach(f => {
                const s = `${f.giver} → ${f.receiver}`;
                seen.has(s) || (seen.add(s), dirs.push(s));
            });
            const kind = { full: "full fit", open: "open fit", tentative: "tentative fit" }[rec.bestFit.kind] || rec.bestFit.kind;
            return `${rec.bothWays ? "both ways · " : ""}${dirs.join(" · ")} · ${kind} · strength ${Math.round(rec.strength)}`;
        }
        function sxBadges(rec, isPair) {
            const out = [], fl = rec.flags || {};
            if (rec.differentIntensities) out.push({ t: "different intensities" });
            const tried = fl.triedBy || [];
            isPair && tried.length >= 2 ? out.push({ t: "tried: both" }) : tried.forEach(nm => out.push({ t: `tried: ${nm}` }));
            // Badges deprecated in general (2026-10-26): no "Not interested" or "Soft no revisited" badge renders anywhere.
            if (rec.shed) out.push({ t: "below tonight's bar", cls: "is-flag" });
            return out.map(b => `<span class="sx-badge${b.cls ? " " + b.cls : ""}">${Hi(b.t)}</span>`).join("");
        }
        function sxPairRow(rec, res) {
            const fit = sxFitText(rec);
            return `<div class="sx-row"><div class="sx-row-top"><strong>${Hi(rec.label)}</strong>${sxBadges(rec, !0)}</div><div class="sx-row-ratings"><span><b>${Hi(res.a)}</b> ${Hi(sxRatingText(rec.ratings.a))}</span><span><b>${Hi(res.b)}</b> ${Hi(sxRatingText(rec.ratings.b))}</span></div>${fit ? `<div class="sx-row-fit">${Hi(fit)}</div>` : ""}${rec.mismatchShape ? `<div class="sx-row-shape">${Hi(rec.mismatchShape)}</div>` : ""}</div>`;
        }
        function sxGroupRow(rec) {
            return `<div class="sx-row"><div class="sx-row-top"><strong>${Hi(rec.label)}</strong>${sxBadges(rec, !1)}</div>${null != rec.strength ? `<div class="sx-row-fit">strength ${Math.round(rec.strength)}</div>` : ""}</div>`;
        }
        function sxLimitsHtml(list) {
            if (!list.length) return `<p class="sx-empty">No limits in this comparison.</p>`;
            const blocks = [], groups = new Map;
            list.forEach(rec => {
                (rec.limiters || []).forEach(lm => {
                    if ("topic" === lm.scope) return void blocks.push(`<div class="sx-row"><div class="sx-row-top"><strong>${Hi(rec.label)}</strong><span class="sx-badge is-limit">limit, ${Hi(lm.name)}</span></div></div>`);
                    const meta = qn[rec.id] || Xn(rec.id) || null, gname = "category" === lm.scope ? rec.branch : meta && meta.parentId && (qn[meta.parentId] || {}).label || rec.branch, key = `${lm.scope}|${lm.name}|${gname}`;
                    if (!groups.has(key)) {
                        const g = { name: lm.name, gname: gname, topics: [] };
                        groups.set(key, g), blocks.push(g);
                    }
                    groups.get(key).topics.push(rec.label);
                });
            });
            return blocks.map(b => "string" == typeof b ? b : `<details class="sx-limit-group"><summary><strong>All of ${Hi(b.gname)}</strong> — limit, ${Hi(b.name)} <span class="sx-count">${b.topics.length} topic${1 === b.topics.length ? "" : "s"}</span></summary><ul>${b.topics.map(t => `<li>${Hi(t)}</li>`).join("")}</ul></details>`).join("");
        }
        function sxSection(title, sub, rowsHtml, count) {
            return `<section class="sx-section"><h3>${Hi(title)}${null != count ? ` <span class="sx-count">${count}</span>` : ""}</h3>${sub ? `<p class="sx-section-sub">${Hi(sub)}</p>` : ""}<div class="sx-rows">${rowsHtml}</div></section>`;
        }
        function sxPickerHtml() {
            const ids = Object.keys(vt).filter(id => wt[id]);
            if (!ids.length) return `<div class="sx-picker"><div class="sx-picker-label">Who's comparing?</div><p class="sx-picker-help">No profiles are loaded yet. Add or import two or more profiles, then pick them here to compare.</p></div>`;
            const sel = new Set(Yi());
            const btns = ids.map(id => `<button aria-pressed="${sel.has(id)}" class="sx-pick" data-sx-pick="${Hi(id)}" type="button">${Hi(wt[id])}</button>`).join("");
            return `<div class="sx-picker"><div class="sx-picker-label">Who's comparing?</div><div class="sx-pick-row">${btns}</div><p class="sx-picker-help">Tap to add or remove a profile from the cast. Pick two or more to compare. (Ctrl+click or Cmd+click on a profile tab works too.)</p></div>`;
        }
        // Match-tab fix (2026-10-26): the bowtie controls slot is GONE with
        // the bowtie text tab — the stage panel is never shown for a ⋈ tab
        // (see sxSyncMatchStage). Auto-create (2026-10-26): no surface
        // renders a save-as-group control at all anymore — opening a ⋈
        // comparison creates the group profile itself (sxAutoCreateBowtie
        // runs the same Zd save the controls used to trigger), so there
        // is no save click left to relocate.
        function sxStamp(ctx) {
            const parts = ctx.profiles.map((p, i) => `${p.name || `Profile ${i + 1}`} ${sxHeatZone(sxHeatFor(sxKey(ctx, i)))}`);
            return `${"play" === sxcv.mode ? "Play" : "Conversation"} · Heat: ${parts.join(" · ")}`;
        }
        function sxRenderResults(allowBuzz) {
            const root = sxResultsEl();
            if (!root || !sxCtx) return;
            const ctx = sxCtx, grp = sxRun(ctx), isPair = 2 === ctx.profiles.length, pair = isPair ? grp.pairs[0] : null, mode = sxcv.mode;
            let headlineLabel, headlineText, coverageHtml = "";
            if (isPair) {
                const agg = "play" === mode ? pair.play : pair.conversation, cov = pair.coverage;
                headlineLabel = "play" === mode ? "Play MS" : "Play KF", headlineText = agg.headlineText || "No score — no shared topics",
                coverageHtml = `<p class="sx-coverage">${Hi(pair.a)}: ${cov.aRated} rated · ${cov.aPercent}% of ${cov.catalog} topics · ${Hi(pair.b)}: ${cov.bRated} rated · ${cov.bPercent}% of ${cov.catalog} topics · ${cov.oneSided} one-sided · ${cov.limitBlocked} limit-blocked · ${cov.fantasySetAside} fantasy set aside</p>`;
            } else {
                const agg = "play" === mode ? grp.play : grp.conversation, limitedCount = grp.topics.filter(t => t.groupLimited).length;
                headlineLabel = agg.label || ("play" === mode ? "Play MS" : "Play KF"), headlineText = agg.headlineText || "No score — no shared topics";
                const per = ctx.profiles.map((p, i) => {
                    const pr = grp.pairs.find(x => x.i === i || x.j === i);
                    if (!pr) return `${Hi(p.name || `Profile ${i + 1}`)}: —`;
                    const mine = pr.i === i ? { rated: pr.coverage.aRated, pct: pr.coverage.aPercent } : { rated: pr.coverage.bRated, pct: pr.coverage.bPercent };
                    return `${Hi(p.name || `Profile ${i + 1}`)}: ${mine.rated} rated · ${mine.pct}% of ${pr.coverage.catalog} topics`;
                });
                coverageHtml = `<p class="sx-coverage">${per.join(" · ")} · ${limitedCount} topic${1 === limitedCount ? "" : "s"} limited for the group</p>`;
            }
            const explainer = "conversation" === mode ? `<p class="sx-explainer">How much of the map you both answered is worth talking about — matches, open doors, shared fantasies, and things you've already tried.</p>` : "";
            let listsHtml = "";
            if (isPair) {
                const lists = ("play" === mode ? pair.play : pair.conversation).lists;
                listsHtml = sxSection("Matches", null, lists.matches.map(r => sxPairRow(r, pair)).join("") || `<p class="sx-empty">No matches.</p>`, lists.matches.length)
                    + sxSection("Curious about", null, lists.curiousAbout.map(r => sxPairRow(r, pair)).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.curiousAbout.length)
                    + sxSection("Mismatched", null, lists.mismatched.map(r => sxPairRow(r, pair)).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.mismatched.length)
                    + sxSection("Limits", null, sxLimitsHtml(lists.limits), lists.limits.length);
            } else if ("play" === mode) {
                const lists = grp.play.lists;
                listsHtml = sxSection("Matches", null, lists.matches.map(sxGroupRow).join("") || `<p class="sx-empty">No matches.</p>`, lists.matches.length)
                    + sxSection("Curious about", null, lists.curiousAbout.map(sxGroupRow).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.curiousAbout.length)
                    + sxSection("Mismatched", null, lists.mismatched.map(sxGroupRow).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.mismatched.length)
                    + sxSection("Limits", null, sxLimitsHtml(lists.limits), lists.limits.length);
            } else {
                const lists = grp.conversation.lists;
                listsHtml = sxSection("Worth talking about", null, lists.counted.map(sxGroupRow).join("") || `<p class="sx-empty">Nothing here.</p>`, lists.counted.length)
                    + sxSection("Limits", null, sxLimitsHtml(lists.limits), lists.limits.length);
            }
            let hotHtml = "";
            if ("conversation" === mode) {
                const hot = grp.hotTopicsTop10 || [];
                hotHtml = sxSection("Hot Topics", "What the whole room should be talking about right now.", hot.map(h => `<div class="sx-row"><div class="sx-row-top"><strong>${Hi(h.label)}</strong><span class="sx-hot-score">${Math.round(h.score)}</span></div></div>`).join("") || `<p class="sx-empty">No hot topics yet.</p>`, null);
            }
            /* Deprecated match-tab Teasers rows removed (2026-10-26): the popover Teasers sections are the teaser surface now. Writer teaser lines are a separate later job (A4) and are untouched. */
            
            // Match-view viewport (2026-10-26): both headline numbers stay
            // readable beside the rings — the pair/group Kink Factor
            // (Conversation register) and the Match Score (Play register),
            // read straight off the engine aggregates, never averaged and
            // never mixed across registers or directions.
            /* Match-stage score rings moved to the header Avatar
               (ruled 2026-10-30): the bowtie score rings no longer
               render in this seat — the header paint shows the same
               Play MS / Play KF for the active match
               tab through sxRingValuesForCast. */
            n(root, `<div class="sx-stamp">${Hi(sxStamp(ctx))}</div>${coverageHtml}${explainer}${listsHtml}${hotHtml}`);
            const sxTabNow = sxCurrentTab();
            sxTabNow && "bowtie" === sxTabNow.kind && (sxTabNow.buckets = sxBowtieBuckets(ctx, grp), sxUpdateMatchRings(sxTabNow));
            allowBuzz && sxMaybeBuzz(ctx, grp);
        }
        function sxRenderPairLine(tab, ctx) {
            const el = tab && tab.section ? tab.section.querySelector("[data-sx-pair-line]") : null;
            if (!el) return;
            const names = ctx ? ctx.profiles.map((p, i) => p.name || `Profile ${i + 1}`) : [];
            names.length >= 2 ? (el.textContent = names.join("circledot" === tab.kind ? " ⊙ " : " ⋈ "), el.hidden = !1) : (el.textContent = "", el.hidden = !0);
        }
        /* ===== Match tabs (SURFACES): the compare surfaces live in tabs in
           the #profileTabs strip, keyed by kind + cast. A match tab is not a
           profile: it never enters vt/wt or any profile enumeration, and
           opening, switching to, or closing one never changes the active
           profile, the multi-selection, or any profile's view state. ===== */
        function sxTabsReg() {
            return sxTabsReg.m || (sxTabsReg.m = {
                tabs: new Map,
                active: null,
                stageOn: !1
            });
        }
        function sxMatchIconsVisible() {
            if (Yi().length >= 2) return !0;
            const c = Kd();
            return !!c && Array.isArray(c.sourceIds) && c.sourceIds.length >= 2;
        }
        function sxMatchIconsHtml() {
            if (!sxMatchIconsVisible()) return "";
            return `<button type="button" class="profile-match-btn" data-sx-match-open="circledot" aria-label="Open Straight Talk for the selected profiles" title="Straight Talk">⊙</button><button type="button" class="profile-match-btn" data-sx-match-open="bowtie" aria-label="Open Krossmatch for the selected profiles" title="Krossmatch">⋈</button>`;
        }
        function sxMatchTabsHtml() {
            const reg = sxTabsReg();
            return [ ...reg.tabs.values() ].map(tab => {
                const active = reg.stageOn && reg.active === tab.key, label = "circledot" === tab.kind ? "Straight Talk" : "Krossmatch", glyph = "circledot" === tab.kind ? "⊙" : "⋈";
                return `<span class="sx-match-tab${active ? " is-active" : ""}" data-sx-match-kind="${tab.kind}"><button type="button" role="tab" class="profile-tab-button sx-match-tab-btn${active ? " is-active" : ""}" data-sx-match-tab-btn="${Hi(tab.key)}" aria-selected="${active}" aria-label="${label} match tab"><span aria-hidden="true">${glyph}</span> ${label}</button><button type="button" class="profile-tab-close" data-sx-match-close="${Hi(tab.key)}" aria-label="Close ${label} tab">×</button></span>`;
            }).join("");
        }
        function sxCurrentTab() {
            const reg = sxTabsReg();
            return reg.stageOn && reg.active ? reg.tabs.get(reg.active) || null : null;
        }
        function sxResultsEl() {
            const tab = sxCurrentTab();
            return tab && tab.section ? tab.section.querySelector(".sx-match-results") : null;
        }
        function sxTabContext(tab) {
            if (tab.saved) {
                const c = ft[tab.groupId];
                return c && Array.isArray(c.sourceProfiles) && c.sourceProfiles.length >= 2 ? {
                    ids: (c.sourceIds || []).slice(),
                    profiles: c.sourceProfiles,
                    saved: !0
                } : null;
            }
            const ctx = sxCompareContext();
            return ctx && !ctx.saved && ctx.ids.join(",") === tab.ids.join(",") ? ctx : null;
        }
        function sxEmptyBuckets() {
            return [ {
                label: "Hot topics",
                count: 0,
                percent: 0,
                color: "var(--green)",
                topics: []
            }, {
                label: "Curiosity?",
                count: 0,
                percent: 0,
                color: "var(--curious)",
                topics: []
            }, {
                label: "Not topics",
                count: 0,
                percent: 0,
                color: "var(--red)",
                topics: []
            } ];
        }
        /* sxWouldBeBucket (PROVISIONAL promoted-bucket Teasers membership,
           2026-10-26): the bucket a teased FANTASY topic's ratings WOULD put
           it in. Fantasy topics never MOVE and are excluded from the bump,
           so no promoted bucket exists for them; this recomputes the pair
           outcome from the topic's raw ratings alone -- no notInterested
           mark override, no fantasy set-aside -- through the engine's own
           sxStance / sxRoute helpers and the pair's heats and shed floor,
           mirroring sxPairFromData's classification: a counting (non-shed)
           "full" fit means it would match Hot (0); any other counting fit
           means it would match Curious (1); no counting fit (clash,
           mutual-no, unknown, or all fits shed) means Not (-1), which
           renders no section. */
        function sxWouldBeBucket(rec, pair) {
            const heatA = pair && pair.heat ? pair.heat.a : 0, heatB = pair && pair.heat ? pair.heat.b : 0, F = pair ? pair.shedFloor || 0 : 0,
                sideOf = (rt, heat) => {
                    if (rt.single) {
                        const s = !(rt.giveKnown || rt.receiveKnown) ? "unknown" : rt.singleValue < 0 ? "against" : "curious";
                        return { give: s, receive: s };
                    }
                    const T = sxClamp(35 - heat, 0, 85);
                    return { give: sxStance(rt.give, rt.giveKnown, T), receive: sxStance(rt.receive, rt.receiveKnown, T) };
                },
                valOf = (rt, d) => rt.single ? rt.giveKnown || rt.receiveKnown ? rt.singleValue : null : rt[d + "Known"] ? rt[d] : null,
                sA = sideOf(rec.ratings.a, heatA), sB = sideOf(rec.ratings.b, heatB), fits = [];
            [ [ sA.give, valOf(rec.ratings.a, "give"), rec.ratings.a.single, sB.receive, valOf(rec.ratings.b, "receive"), rec.ratings.b.single ],
              [ sB.give, valOf(rec.ratings.b, "give"), rec.ratings.b.single, sA.receive, valOf(rec.ratings.a, "receive"), rec.ratings.a.single ] ].forEach(([gS, gV, gSingle, rS, rV, rSingle]) => {
                const r = sxRoute(gS, gV, gSingle, rS, rV, rSingle);
                r && "mutual-no" !== r.kind && "clash" !== r.kind && fits.push(r);
            });
            const counting = fits.filter(f => !(f.strength < F));
            return counting.length ? counting.some(f => "full" === f.kind) ? 0 : 1 : -1;
        }
        function sxBowtieBuckets(ctx, grp) {
            const isPair = 2 === ctx.profiles.length, mode = sxcv.mode;
            let g, y, r;
            if (isPair) {
                const lists = ("play" === mode ? grp.pairs[0].play : grp.pairs[0].conversation).lists;
                g = lists.matches, y = lists.curiousAbout, r = lists.mismatched;
            } else if ("play" === mode) {
                g = grp.play.lists.matches, y = grp.play.lists.curiousAbout, r = grp.play.lists.mismatched;
            } else {
                g = grp.conversation.lists.counted, y = [], r = grp.topics.filter(t => !t.groupLimited && t.relevantConvPairs > 0 && !t.conversationCounts);
            }
            // Display-layer MOVE, pair rings only: a non-fantasy teased topic
            // (teaserFor non-empty AND countClass exactly "soft-no") moves from
            // the red bucket to the yellow bucket. The shared register lists are
            // NOT mutated: new y/r arrays are computed for the ring feed below.
            // Engine outcomes, match lists, and group feeds are untouched.
            // Hot (g) is untouched.
            if (isPair) {
                y = [...y, ...r.filter(sxIsTeased)];
                r = r.filter(rec => !sxIsTeased(rec));
            }
            // Display-layer MOVE, group rings only: a non-fantasy topic teased for a
            // lowest-overall-kink-score member (pair-selected, countClass "soft-no")
            // moves from the red bucket to the yellow bucket. The shared register
            // lists are NOT mutated: new y/r arrays are computed for the ring feed
            // below. Engine outcomes, match lists, counted, and Kink Factor inputs
            // are untouched. Hot (g) is untouched.
            if (!isPair) {
                const lowest = sxLowestSet(grp.pairs, ctx.profiles).lowest;
                const isGroupTeased = rec => {
                    if (0 !== rec.flags.fantasyBy.length) return false;
                    return lowest.some(L => grp.pairs.some(pr => {
                        if (pr.i !== L && pr.j !== L) return false;
                        const t = pr.topicsById[rec.id];
                        if (!t) return false;
                        const owner = pr.i === L ? pr.a : pr.b;
                        return (t.teaserFor || []).includes(owner) && sxIsTeased(t);
                    }));
                };
                y = [...y, ...r.filter(isGroupTeased)];
                r = r.filter(rec => !isGroupTeased(rec));
            }
            const counts = [ g.length, y.length, r.length ], shares = uc(counts), labels = list => list.map(rec => rec.label), base = sxEmptyBuckets();
            /* Teasers sections membership follows the PROMOTED bucket
               (PROVISIONAL definition, owner-selected 2026-10-26, flagged
               for later revisit). The g/y/r lists read here are FINAL: the
               engine built them after the BUMP (curious-fit promoted to
               match inside sxPairFromData / the group scorer), and the
               display MOVEs above have already run, so bucketOf is the
               post-BUMP, post-MOVE bucket -- MOVE and BUMP compose by
               construction, in engine order (BUMP first, MOVE second), and
               a topic promoted by either lands in the section of the bucket
               it ends in. A NON-FANTASY teased topic takes the section of
               that final bucket (Hot 0 / Curiosity? 1); a topic that ends
               in Not (never MOVEd -- e.g. countClass not "soft-no" -- or in
               no list at all) gets no section, since sections never render
               on Not. A FANTASY teased topic never MOVEs and is excluded
               from the BUMP, so it takes the section of the bucket its
               ratings WOULD put it in (sxWouldBeBucket): Hot if it would
               match Hot, Curiosity? if it would match Curious, no section
               if it would land in Not. Fantasy rows sort A-Z in the same
               list as every other row -- no separate group, tailing, or
               marking. In groups the same rule applies per topic: the
               non-fantasy section reads the topic's final group bucket;
               the fantasy would-be is judged per teased pair and the topic
               joins each section a teased pair's would-be bucket gives it
               (no tie-break invented between pairs). Membership is NOT a
               filter of bucket records by teaserFor alone: the fantasy
               would-be computation is what keeps fantasy rows visible, and
               the Hot section is fed from the post-BUMP lists, not from
               pre-promotion outcomes. */
            const bucketOf = new Map();
            [ g, y, r ].forEach((list, i) => list.forEach(rec => bucketOf.set(rec.id, i)));
            const teasedHot = [], teasedCurious = [], seenTeasedHot = new Set(), seenTeasedCurious = new Set();
            const sxNoteTeased = (label, bucket) => {
                const list = 0 === bucket ? teasedHot : 1 === bucket ? teasedCurious : null, seen = 0 === bucket ? seenTeasedHot : seenTeasedCurious;
                list && !seen.has(label) && (seen.add(label), list.push(label));
            };
            if (isPair) {
                const pr = grp.pairs[0];
                pr.topics.forEach(rec => {
                    if (!(rec.teaserFor || []).length) return;
                    sxNoteTeased(rec.label, (rec.flags.fantasyBy || []).length ? sxWouldBeBucket(rec, pr) : bucketOf.get(rec.id));
                });
            } else grp.topics.forEach(rec => {
                const teasedPairs = grp.pairs.filter(pr => {
                    const t = pr.topicsById[rec.id];
                    return t && (t.teaserFor || []).length;
                });
                if (!teasedPairs.length) return;
                if ((rec.flags.fantasyBy || []).length) teasedPairs.forEach(pr => sxNoteTeased(rec.label, sxWouldBeBucket(pr.topicsById[rec.id], pr)));
                else sxNoteTeased(rec.label, bucketOf.get(rec.id));
            });
            teasedHot.sort((a, b) => a.localeCompare(b)), teasedCurious.sort((a, b) => a.localeCompare(b));
            return base.map((b, i) => ({
                ...b,
                count: counts[i],
                percent: shares[i],
                topics: labels([ g, y, r ][i]),
                teased: [ teasedHot, teasedCurious, [] ][i]
            }));
        }
        function sxRingsHtml(buckets) {
            const t = ea.glanceRadii, n = [ "Green", "Yellow", "Red" ], i = [ "green", "yellow", "red" ];
            return `<svg class="sx-match-rings" viewBox="0 0 1800 1240" role="group" aria-label="Match rings"><g class="center-glance-rings">${buckets.map((b, a) => `<g class="center-glance-ring"><circle class="center-glance-ring-track is-${i[a]}" cx="900" cy="620" r="${t[a]}"/><path class="center-glance-ring-value is-${i[a]}" data-sx-ring-path="${a}" data-ring-radius="${t[a]}" d="${ra(b.percent, t[a])}" style="opacity:${b.percent ? 1 : 0}"/><circle class="center-glance-ring-hit sx-ring-hit" data-sx-ring="${a}" cx="900" cy="620" r="${t[a]}" tabindex="0" role="button" aria-label="${Hi(b.label)}, ${b.percent} percent, ${b.count} ${1 === b.count ? "topic" : "topics"}. Open rating details."/></g>`).join("")}</g></svg>`;
        }
        function sxUpdateMatchRings(tab) {
            const host = tab && tab.section ? tab.section.querySelector("[data-sx-rings]") : null;
            if (!host) return;
            const buckets = tab.buckets || sxEmptyBuckets();
            if (!host.querySelector("svg")) return void (host.innerHTML = sxRingsHtml(buckets));
            buckets.forEach((b, a) => {
                const p = host.querySelector(`[data-sx-ring-path="${a}"]`), hit = host.querySelector(`[data-sx-ring="${a}"]`);
                p && (p.setAttribute("d", ra(b.percent, Number(p.dataset.ringRadius))), p.style.opacity = b.percent ? "1" : "0"), 
                hit && hit.setAttribute("aria-label", `${b.label}, ${b.percent} percent, ${b.count} ${1 === b.count ? "topic" : "topics"}. Open rating details.`);
            });
        }
        function sxToggleRingListing(tab, idx) {
            const host = tab && tab.section ? tab.section.querySelector("[data-sx-ring-listing]") : null;
            if (!host) return;
            const b = (tab.buckets || sxEmptyBuckets())[idx];
            if (!b) return;
            const names = [ "hot-topics", "curiosity", "not-topics" ], mine = names[idx];
            if (host.dataset.sxRingDisplay === mine) return host.innerHTML = "", void delete host.dataset.sxRingDisplay;
            host.dataset.sxRingDisplay = mine;
            const teaserSection = (0 === idx || 1 === idx) && b.teased && b.teased.length ? `<div class="sx-ring-teasers"><strong>Teasers</strong><ul>${b.teased.map(t => `<li><strong>${Hi(t)}</strong> — you're heated about this — a conversation point to raise gently, with an easy opt-out.</li>`).join("")}</ul></div>` : "";
            host.innerHTML = `<div class="sx-ring-listing"><div class="glance-ring-row" style="--ring-color:${b.color}"><span class="glance-ring-swatch" aria-hidden="true"></span><strong>${Hi(b.label)}</strong><span class="glance-ring-count">${b.count} ${1 === b.count ? "topic" : "topics"}</span><span class="glance-ring-percent">${b.percent}%</span></div>${b.topics && b.topics.length ? `<ul class="sx-ring-topics">${b.topics.map(t => `<li>${Hi(t)}</li>`).join("")}</ul>` : `<p class="sx-empty">No topics in this bucket.</p>`}${teaserSection}</div>`;
        }
        function sxBuildMatchSection(tab) {
            const stage = e.byId("sxMatchStage");
            if (!stage) return;
            const sec = document.createElement("div");
            sec.className = "sx-match-root", sec.dataset.sxMatchRoot = tab.key, sec.hidden = !0;
            // Match-view viewport (2026-10-26): the text window is replaced
            // by viewport chrome — the pair line is the content title, the
            // "Who's comparing?" picker stays, the rings carry the buckets
            // (topic lists live in the ring listing surface), and the
            // headline numbers live in the header Avatar rings. The hypermap itself,
            // in the map column below this chrome, is the viewport. The
            // legacy results assembly survives ONLY as the 4+-profile
            // group presentation (carve-out: no N-map layout is invented
            // for 4+); it stays hidden for 2- and 3-profile casts.
            sec.innerHTML = "circledot" === tab.kind ? `<div class="sx-pair-line" data-sx-pair-line="" hidden=""></div><div data-sx-picker=""></div><div class="sx-stamp" data-sx-stamp=""></div><div data-sx-rings=""></div><div data-sx-ring-listing=""></div>` : `<div class="sx-pair-line" data-sx-pair-line="" hidden=""></div><div data-sx-picker=""></div><div data-sx-rings=""></div><div data-sx-ring-listing=""></div><div class="sx-match-results" data-sx-legacy="" hidden=""></div>`;
            stage.appendChild(sec), tab.section = sec;
        }
        /* Straight bands (Job 2, ruled equal thirds over the per-topic
            straight range -20,000..+20,000): band index 0 = Debate band
            (sum <= -6,667), 1 = On-the-fence band (-6,666..+6,666),
            2 = Shop talk band (sum >= +6,667); -1 = no band. Membership is
            display-only, read off the straight register: shared topics with
            a non-null sum. Limit-blocked and one-sided/invisible topics are
            never banded; the register and the Job 1 list are untouched. */
        function sxStraightBandIdx(sum) {
            return null == sum ? -1 : sum >= 6667 ? 2 : sum <= -6667 ? 0 : 1;
        }
        function sxStraightBands(pair) {
            const lists = [ [], [], [] ];
            if (pair) pair.straight.topics.forEach(s => {
                if ("shared" !== s.status) return;
                const idx = sxStraightBandIdx(s.sum);
                idx >= 0 && lists[idx].push(s);
            });
            const bySum = (x, y) => (y.sum || 0) - (x.sum || 0) || x.label.localeCompare(y.label);
            return lists.forEach(l => l.sort(bySum)), lists;
        }
        function sxStraightBandBuckets(lists) {
            // Ring slots keep the crossed tab's slot order — positive band
            // on the green slot, middle on yellow, negative on red — while
            // the labels, counts, and topic lists are the bands' own.
            const ringOrder = [ 2, 1, 0 ], counts = ringOrder.map(i => lists[i].length), shares = uc(counts),
                names = [ "Shop talk band", "On-the-fence band", "Debate band" ], base = sxEmptyBuckets();
            return base.map((b, i) => ({
                ...b,
                label: names[i],
                count: counts[i],
                percent: shares[i],
                topics: lists[ringOrder[i]].map(s => s.label)
            }));
        }
        function sxRenderStraightTab(tab) {
            const ctx = sxTabContext(tab);
            sxRenderPairLine(tab, ctx);
            const pk = tab.section.querySelector("[data-sx-picker]");
            pk && (pk.innerHTML = sxPickerHtml());
            const st = tab.section.querySelector("[data-sx-stamp]");
            st && (st.textContent = ctx ? `Conversation · Heat: ${ctx.profiles.map((p, i) => `${p.name || `Profile ${i + 1}`} ${sxHeatZone(sxHeatFor(sxKey(ctx, i)))}`).join(" · ")}` : "");
            const pair = ctx && 2 === ctx.profiles.length ? sxPairCompute(ctx.profiles[0], ctx.profiles[1], {}) : null;
            const bandLists = sxStraightBands(pair);
            /* Banded Straight Talk list (Job 3): the Job 1 ranked list,
                split into the Job 2 band sections in ring order — Shop
                talk, On-the-fence, Debate — over the same shared,
                non-null-sum record set sxStraightBands returns (already
                sum-descending, ties by label). Debate topics join the
                list; limit-blocked and one-sided topics stay out. All
                three sections render for a pair, even when empty. */
            // Match-view viewport (2026-10-26): the banded text lists, the
            // listing seats, and the text Limits section are gone with the
            // text window. The straight bands surface through the rings
            // (sxStraightBandBuckets) and the ring listing surface only —
            // band membership still comes from sxStraightBands over the
            // straight register, unchanged.
            tab.buckets = sxStraightBandBuckets(bandLists), sxUpdateMatchRings(tab);
            /* Circledot score rings moved to the header Avatar (ruled
               2026-10-30): no score rings render in this seat — the
               header paint shows the same Parlay MS
               / Parlay KF for the active match
               tab through sxRingValuesForCast. The INTERIM / O3-finals
               status of those values is unchanged; only where they
               are painted moved. */
        }
        function sxRenderMatchTab(tab) {
            if (!tab || !tab.section) return;
            if ("circledot" === tab.kind) return void sxRenderStraightTab(tab);
            const ctx = sxTabContext(tab);
            sxCtx = ctx, sxRenderPairLine(tab, ctx);
            const pk = tab.section.querySelector("[data-sx-picker]"), rs = tab.section.querySelector(".sx-match-results");
            pk && (pk.innerHTML = sxPickerHtml());
            // 4+ carve-out: the legacy lists/rings presentation stays for
            // casts of four or more; 2- and 3-profile casts get the pure
            // viewport (rings + map), so the legacy host stays hidden.
            rs && (rs.hidden = !(ctx && ctx.profiles.length >= 4));
            if (!ctx) return rs && (rs.innerHTML = `<p class="sx-empty">Select two or more profiles to compare them here.</p>`), 
            void (tab.section.querySelector("[data-sx-ring-listing]") && (tab.section.querySelector("[data-sx-ring-listing]").innerHTML = `<p class="sx-empty">Select two or more profiles to compare them here.</p>`), tab.buckets = sxEmptyBuckets(), sxUpdateMatchRings(tab));
            sxRenderResults(!0);
        }
        function sxRenderActiveMatchTab() {
            const reg = sxTabsReg(), tab = reg.stageOn && reg.active ? reg.tabs.get(reg.active) : null;
            tab && sxRenderMatchTab(tab);
        }
        function sxRefreshMatchTabs() {
            sxRenderActiveMatchTab();
        }
        function sxSyncMatchStage() {
            const reg = sxTabsReg(), stage = e.byId("sxMatchStage"), col = e.one(".map-column"), on = !!(reg.stageOn && reg.active && reg.tabs.has(reg.active));
            // Match-view viewport (2026-10-26): the stage/map-column
            // inversion is reversed — a match tab SHOWS map content, so the
            // map column is never hidden by a match tab. The stage carries
            // only the viewport chrome above the map. With no tab active the
            // stage hides and the profile map stands exactly as before
            // (restore-exactly invariant preserved).
            // Match-tab fix (2026-10-26): while a ⋈ Krossmatch tab is the
            // active tab the stage stays HIDDEN — the bowtie text panel is
            // not shown at all, and opening the bowtie goes straight to the
            // pair viewport (the map in the column below, painted by
            // sxActivateMatchTab). Registry state (stageOn / active) is
            // untouched, so sxCurrentTab() still resolves and the pair
            // taper paint works exactly as before. ⊙ Straight Talk tabs
            // keep the stage exactly as before.
            const sxActiveTab = on ? reg.tabs.get(reg.active) : null, sxStageShown = on && !(sxActiveTab && "bowtie" === sxActiveTab.kind);
            stage && (stage.hidden = !sxStageShown), col && (col.hidden = !1), reg.tabs.forEach(tab => {
                tab.section && (tab.section.hidden = !(on && tab.key === reg.active));
            });
        }
        // Auto-create group on bowtie open (owner ruling, 2026-10-26):
        // opening a ⋈ comparison creates the group profile — the Save
        // click is gone, the saving is not. The auto-created group is a
        // normal profile in every path: it is minted by the same Zd
        // save, stored in the same vt/ft records, and flows through the
        // same persist (Sexcapades2xProfiles.getAll), export (Jf), and
        // tab Save (saveActiveProfile) code as any other profile. No
        // second-class group persistence path exists or is added here.
        function sxFindGroupForCast(ids, pairOp) {
            // Sameness, from the record: a cast's identical group is the
            // in-session group whose sourceIds are the same SET as the
            // cast (order-insensitive). sourceIds is the identity every
            // other group path already keys off (Kd, sxTabContext, Jd),
            // so this test is read straight from the group record.
            // Pair-kind discriminator (2026-10-27): a ⋈ pair and a ⊙
            // pair of the same cast share sourceIds and kind "group",
            // so sameness also requires the same pairOp. Records minted
            // before pairOp existed carry no pairOp and are bowtie
            // pairs — the default below preserves their dedup exactly,
            // and a ⊙ open can never select a ⋈ group (or vice versa).
            if (!ids || ids.length < 2) return null;
            const want = new Set(ids), wantOp = "straight" === pairOp ? "straight" : "bowtie";
            for (const id of Object.keys(ft)) {
                const rec = ft[id];
                if (!rec || "group" !== rec.kind || (rec.pairOp || "bowtie") !== wantOp || !vt[id] || !Array.isArray(rec.sourceIds)) continue;
                if (rec.sourceIds.length !== want.size) continue;
                if (rec.sourceIds.every(x => want.has(x))) return id;
            }
            return null;
        }
        function sxTeardownMatchTabs() {
            // The clean post-save teardown Zd performs: every match tab
            // is removed and the stage deactivated, so the screen that
            // remains is a profile's own map with no match chrome.
            const reg = sxTabsReg();
            reg.tabs.forEach(tb => {
                tb.section && tb.section.remove();
            }), reg.tabs.clear(), reg.active = null, reg.stageOn = !1, sxSyncMatchStage();
        }
        function sxAutoCreateBowtie(castIds, fresh) {
            const cast = (castIds || []).filter(id => vt[id]);
            if (cast.length < 2) return !1;
            // Fork rule (owner ruling, 2026-10-27): a bowtie TAP always
            // mints a fresh bowtie tab from whatever is currently
            // multi-selected, whether or not any settings changed —
            // taps never dedup. Only reopen/restore (sxActivateMatchTab)
            // selects the existing tab, via fresh being unset.
            const existing = fresh ? null : sxFindGroupForCast(cast, "bowtie");
            // Identical group already in-session: select it, never mint
            // a duplicate. Js is the ordinary profile switch, so the
            // landing is the group's own tab and map.
            if (existing) return sxTeardownMatchTabs(), Js(existing), !0;
            // Creation IS the save: run the exact Zd save the removed
            // controls used to trigger, with the cast pinned in qd so
            // Zd saves this cast (never a drifted selection) and in
            // Play mode so Rd's save stamp matches a manual ⋈ save.
            return sxcv.mode = "play", qd = cast.slice(), Zd();
        }
        // Straight parity (owner ruling, 2026-10-27): opening ⊙ for a
        // pair auto-creates (or selects) a persistent R ⊙ S group
        // profile, exactly the sxAutoCreateBowtie shape — find-or-mint
        // through the same Zd save, the same teardown, and the same
        // ordinary Js landing — differing only in pair kind (the ⊙
        // title join and pairOp record), in mode (Conversation, where
        // bowtie mints in Play), and in the map compute (Rd dispatches
        // straight pairs to the straight-register adapter). Straight
        // auto-create is pair-only: a cast of 3+ returns false and
        // the open falls through to the legacy ⊙ tab, as before —
        // whose header now shows the group Parlay aggregates from
        // sxGroupCompute (group-Parlay fix, 2026-10-30).
        function sxAutoCreateStraight(castIds, fresh) {
            const cast = (castIds || []).filter(id => vt[id]);
            if (2 !== cast.length) return !1;
            // Fork rule (owner ruling, 2026-10-27): a circle-dot TAP
            // always mints a fresh straight tab — taps never dedup.
            // Reopen/restore selects the existing tab (fresh unset).
            const existing = fresh ? null : sxFindGroupForCast(cast, "straight");
            // Identical straight pair already in-session: select it,
            // never mint a duplicate — in Conversation mode, the ⊙
            // register, on both the mint and the re-open landing.
            if (existing) return sxTeardownMatchTabs(), sxcv.mode = "conversation", Js(existing), !0;
            return sxcv.mode = "conversation", qd = cast.slice(), Zd("straight");
        }
        function sxOpenMatchTab(kind) {
            const ctx = sxCompareContext();
            if (!ctx) return;
            // ⋈ and ⊙: opening auto-creates (or selects) the pair
            // group and lands on its profile tab — no match tab is
            // minted. If the cast cannot be saved (fewer than two live
            // profiles, or a ⊙ cast that is not exactly a pair), fall
            // through to the legacy tab so the open is never a dead
            // end.
            if ("bowtie" === kind && sxAutoCreateBowtie(ctx.ids, !0)) return;
            if ("circledot" === kind && sxAutoCreateStraight(ctx.ids, !0)) return;
            const reg = sxTabsReg(), key = kind + "|" + (ctx.saved ? "group:" + Mt : ctx.ids.join(","));
            let tab = reg.tabs.get(key);
            tab || (tab = {
                key: key,
                kind: kind,
                saved: ctx.saved,
                groupId: ctx.saved ? Mt : null,
                ids: ctx.ids.slice(),
                section: null,
                buckets: null
            }, reg.tabs.set(key, tab), sxBuildMatchSection(tab));
            sxActivateMatchTab(key, !1);
        }
        function sxActivateMatchTab(key, focus) {
            const reg = sxTabsReg(), tab = reg.tabs.get(key);
            if (!tab) return;
            // ⋈ and ⊙: activating a match tab (e.g. its pill in the
            // tab strip) is also an open — auto-create/select the pair
            // group and land on the group tab instead of showing the
            // match view. A saved tab's ids are its group's sourceIds,
            // so the same sameness test selects that very group. (A ⊙
            // tab only exists for casts the pair auto-create declined
            // — 3+ profiles — and those activate exactly as before.)
            if ("bowtie" === tab.kind && sxAutoCreateBowtie(tab.ids)) return;
            if ("circledot" === tab.kind && sxAutoCreateStraight(tab.ids)) return;
            // Mode follows the tab (2026-10-26): ⋈ Krossmatch activates in
            // Play, ⊙ Straight Talk in Conversation. There is no in-tab
            // mode switch anymore.
            sxcv.mode = "circledot" === tab.kind ? "conversation" : "play";
            // Match-tab fix (2026-10-26): activation PAINTS the map —
            // the tab-strip path previously rendered chrome only, so the
            // map kept whatever the last paint produced (the blank area
            // in the owner's session). This mirrors the picker path's
            // repaint (Jw + Mr below), so the pair viewport is on screen
            // immediately when the tab opens.
            reg.active = key, reg.stageOn = !0, sxSyncMatchStage(), sxRenderMatchTab(tab), Jw(), Mr({
                animate: !1
            });
            if (focus) {
                const esc = window.CSS && CSS.escape ? CSS.escape(key) : key, b = tl.querySelector(`[data-sx-match-tab-btn="${esc}"]`);
                b && b.focus({
                    preventScroll: !0
                });
            }
        }
        function sxCloseMatchTab(key) {
            const reg = sxTabsReg(), tab = reg.tabs.get(key);
            if (!tab) return;
            tab.section && tab.section.remove(), reg.tabs.delete(key), reg.active === key && (reg.active = null, 
            reg.stageOn = !1), sxSyncMatchStage(), Jw(), Mr({ animate: !1 });
        }
        function sxDeactivateMatchStage() {
            const reg = sxTabsReg();
            reg.stageOn && (reg.stageOn = !1, sxSyncMatchStage());
        }
        function sxRekeyActiveMatchTab() {
            const reg = sxTabsReg(), tab = reg.active ? reg.tabs.get(reg.active) : null;
            if (!tab || tab.saved) return;
            const ctx = sxCompareContext();
            if (!ctx || ctx.saved) return;
            const nk = tab.kind + "|" + ctx.ids.join(",");
            tab.ids = ctx.ids.slice();
            nk !== tab.key && (reg.tabs.delete(tab.key), tab.key = nk, tab.section && (tab.section.dataset.sxMatchRoot = nk), 
            reg.tabs.set(nk, tab), reg.active = nk);
        }
        function sxBuzzSound() {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                sxAudio = sxAudio || new AC;
                "suspended" === sxAudio.state && sxAudio.resume();
                const t0 = sxAudio.currentTime;
                [ 0, .3 ].forEach(off => {
                    const o = sxAudio.createOscillator(), g = sxAudio.createGain();
                    o.type = "square", o.frequency.value = 155, g.gain.setValueAtTime(.1, t0 + off), g.gain.exponentialRampToValueAtTime(.001, t0 + off + .24),
                    o.connect(g), g.connect(sxAudio.destination), o.start(t0 + off), o.stop(t0 + off + .26);
                });
            } catch (err) { __sxErrLog("sx-buzz-sound", err); }
        }
        function sxMaybeBuzz(ctx, grp) {
            if ("play" !== sxcv.mode) return;
            const nonLive = grp.pairs.filter(pr => !pr.live);
            if (!nonLive.length) return;
            const keyOf = pr => [ sxKey(ctx, pr.i), sxKey(ctx, pr.j) ].sort().join("|"), fresh = nonLive.filter(pr => !sxBuzzFired.has(keyOf(pr)));
            if (!fresh.length) return;
            nonLive.forEach(pr => sxBuzzFired.add(keyOf(pr))), sxBuzzTarget = fresh[0], sxBuzzSound();
            try { navigator.vibrate && navigator.vibrate([ 130, 60, 130 ]); } catch (err) { __sxErrLog("sx-buzz-vibrate", err); }
            const dlg = e.byId("sxBuzzerDialog");
            dlg && !dlg.open && Wi(dlg);
        }
        const sxStageEl = e.byId("sxMatchStage");
        if (sxStageEl) {
            sxStageEl.addEventListener("click", ev => {
                const pk = ev.target.closest("[data-sx-pick]");
                if (pk) {
                    const id = pk.dataset.sxPick;
                    if (!vt[id]) return;
                    sxSel(id, "toggle");
                    qd = [], Wd = null, sxRekeyActiveMatchTab(), Jw(), Mr({
                        animate: !1
                    }), sxRenderActiveMatchTab();
                    const esc = window.CSS && CSS.escape ? CSS.escape(id) : id, nb = sxStageEl.querySelector(`[data-sx-pick="${esc}"]`);
                    nb && nb.focus({
                        preventScroll: !0
                    });
                    return;
                }
                if (ev.target.closest("[data-sx-save-group]")) return void Zd();
                const ring = ev.target.closest("[data-sx-ring]");
                if (ring) {
                    const host = ring.closest("[data-sx-match-root]"), tab = host && sxTabsReg().tabs.get(host.dataset.sxMatchRoot);
                    tab && sxToggleRingListing(tab, Number(ring.dataset.sxRing));
                }
            });
        }
        // Auto-create (2026-10-26): the map-view "Save as group profile"
        // overlay from the match-tab fix is REMOVED. Opening a ⋈
        // comparison now saves by opening (sxAutoCreateBowtie), so the
        // group it lands on is already saved and a save control on that
        // view would be redundant. Zd remains, called only by
        // sxAutoCreateBowtie and (for pairs) sxAutoCreateStraight; no
        // surface renders a save-as-group control.
        const sxDlgEl = e.byId("sxBuzzerDialog");
        if (sxDlgEl) {
            e.byId("sxBuzzerProceed").addEventListener("click", () => Ui(sxDlgEl));
            e.byId("sxBuzzerConversation").addEventListener("click", () => {
                // Mode follows the tab (2026-10-26): the buzzer's escape no
                // longer sets the mode directly — it routes through tab
                // activation by opening the ⊙ tab for the current cast,
                // whose activation sets Conversation. Fallback (no cast
                // context): set the mode and re-render, as before.
                Ui(sxDlgEl);
                const before = sxTabsReg().active;
                sxOpenMatchTab("circledot");
                (sxTabsReg().active === before || !sxTabsReg().stageOn) && (sxcv.mode = "conversation", sxRenderActiveMatchTab());
            });
            e.byId("sxBuzzerEdit").addEventListener("click", () => {
                Ui(sxDlgEl);
                if (!sxCtx || !sxBuzzTarget) return;
                const id = [ sxCtx.ids[sxBuzzTarget.i], sxCtx.ids[sxBuzzTarget.j] ].find(x => x && vt[x]);
                id && bw(id);
            });
        }
        // Leniency removal (owner ruling, 2026-10-27): the leniency
        // setter (Yd) and its throttled rAF handler (Xd) are REMOVED
        // entirely, and the compare leniency variable is gone with
        // them — no computation reads, carries, or stores a leniency
        // value anymore (Dd's adapter slot is passed null at every
        // call site; the engines never read it). No live control ever
        // called the setter/handler — the only remaining caller was
        // the Scribe fallback in Jd, redesigned below to carry no
        // recompute side effect. What survives is display only: a
        // legacy group's stored field can still seed the Scribe
        // brief's displayed cast value in Jd, and the writers keep
        // their displayed cast number — neither is an input to any
        // computation.
        function Zd(pairOp) {
            // Pair kind (2026-10-27): "straight" mints a ⊙ pair; every
            // other call is the original bowtie mint, unchanged. The
            // kind drives the name join below (⋈ vs ⊙), the pairOp
            // field on the group record, and — through that field —
            // Rd's compute dispatch.
            const sxPairOp = "straight" === pairOp ? "straight" : "bowtie";
            const t = (qd.length ? qd : Xi()).filter(e => vt[e]);
            if (t.length < 2) return !1;
            const n = t.map(e => ({
                name: wt[e],
                ratings: Pd(vt[e]),
                annotations: Pd(Qe[e]),
                fantasyOnly: Pd(Je[e]),
                alreadyTried: Pd(et[e]),
                importedChildren: Pd(at[e]),
                genders: bb(rt[e]),
                orientations: iv(ot[e]),
                veil: av(vpt[e]),
                veilEnabled: Boolean(vht[e]),
                net: av(vpt[e]),
                netEnabled: Boolean(vht[e])
            })), i = function(e) {
                const t = e.map(e => String(wt[e] || "").trim()), n = t.map(e => (e.match(/[\p{L}\p{N}]/u) || [ "?" ])[0].toLocaleUpperCase()), i = new Set(n).size < n.length;
                return t.map((e, t) => i ? e.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).replace(/^./u, e => e.toLocaleUpperCase()) || n[t] : n[t]).join("straight" === sxPairOp ? " ⊙ " : " ⋈ ").slice(0, 40);
            }(t);
            // Duplicate names (owner ruling, 2026-10-27): a forked pair
            // keeps the CLEAN feeder name — no version suffix is baked
            // into the underlying group profile name. Identity rides the
            // internal id (ik disambiguates ids), and same-name tabs are
            // told apart by a display-only "-2"/"-3" suffix on the tab
            // label (see sxDupTabLabel in Jw).
            const a = i, o = ik(a);
            // Match-tab fix (2026-10-26): saving CLOSES the match view.
            // Every match tab is torn down and the stage deactivated
            // before the strip rebuilds below, so post-save the screen is
            // the new group profile's own map with the group as the
            // active profile — no match chrome left on screen (the old
            // code left the tab active and visible, which made the new
            // group tab a guaranteed no-op click and read as being
            // trapped on the comparison tab). The teardown is shared
            // with the auto-create select-existing path.
            sxTeardownMatchTabs();
            return vt[o] = {}, Ze[o] = {}, Qe[o] = {}, Je[o] = {}, et[o] = {}, tt[o] = {}, at[o] = {}, 
            gt[o] = {}, mt[o] = {}, wt[o] = a, rt[o] = [ "couple" ], ot[o] = [ "mixed" ], st[o] = [], 
            lt[o] = "", ct[o] = "", dt[o] = [], ut[o] = {}, pz[o] = "", nt[o] = "", it[o] = "", vpt[o] = 50, 
            vht[o] = !1, ft[o] = {
                kind: "group",
                pairOp: sxPairOp,
                sourceIds: t.slice(),
                sourceNames: t.map(e => wt[e]),
                sourceProfiles: n,
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
            }, Rd(o), la(o), Mt = o, It = o, sxSel(null, "clear"), qd = [], Wd = null, rn.clear(), 
            // Save marking (2026-10-26): Rd marks EVERY recompute dirty
            // (zt at its tail) — that recompute-marking, not the save
            // itself, is why a freshly saved group tab still read
            // "unsaved changes" live. Zd IS the save (and, since
            // auto-create, creation and save are the same act), so the
            // new group must not arrive marked by its own creation: the
            // flag is cleared here, the same end state saveActiveProfile
            // leaves via Vt. It is cleared directly rather than through
            // Vt so the draft-autosave timer Rd's zt queued — the
            // Remember-on-this-device persist path — still fires and
            // persists the group like any other profile; that timer's
            // own Vt then finishes the cleanup. Later edits re-mark
            // through zt as usual.
            on.clear(), delete yt[o], Gt(), Jw(), Mr(), Ih(), !0;
        }
        function Qd(t) {
            const i = t[0];
            if (!i || !vt[i]) return;
            scribeCastIds = t.slice(), scribeLeadId = i, e.byId("scribeChoiceProfiles") && (e.byId("scribeChoiceProfiles").textContent = t.filter(e => vt[e]).map(e => rd(e)).join(" + ")), scribePartnerId = 2 === t.length ? t[1] : null;
            const a = t.filter(e => vt[e]).length > 1, o = e.byId("scribeModeDescription"), s = e.byId("scribeChoiceIntro"), l = e.byId("generateScribePrompt"), c = e.byId("scribeLengthUnit"), d = e.byId("scribePageCountHelp");
            o && (o.textContent = a ? "Multiple selected profiles create a practical play guide. For a binding checklist first, use Scene Setter." : "One profile creates a Literotica-style erotic story for fantasy and enjoyment—not a real-world plan."), 
            c && (c.disabled = !1), d && (d.textContent = a ? "Choose a length — word count, paragraphs, pages, or chapters — then choose how much detail to include. Enter one number or a range; blank defaults to 5 paragraphs." : "Story length in word count, paragraphs, pages, or chapters. Enter one number or a range; blank defaults to 5 paragraphs."), 
            s && (s.textContent = a ? "Multiple profiles selected: Scribe will create a practical Play Guide." : "One profile selected: Scribe will create a Literotica-style erotic Story."), 
            l && (l.textContent = a ? "Create Play Guide prompt" : "Create Literotica-style Story prompt"), kg.open && Ui(kg), 
            Sg.open && Ui(Sg), Oc.open && Ui(Oc), jc.open && Ui(jc), Wi(Bc);
        }
        function Jd(e) {
            const t = Xi(), n = t[0] || Mt;
            if (!n || !vt[n]) return;
            const i = 1 === t.length && "group" === ft[n]?.kind ? ft[n] : null, a = i && Array.isArray(i.sourceIds) ? i.sourceIds.filter(e => vt[e]) : [], r = a.length >= 2 ? a : t.length ? t.slice() : [ n ];
            // Scribe fallback, redesigned (owner ruling, 2026-10-27):
            // this state CAN still occur through the button doorway —
            // the multi-select set (Yi) can hold two or more profiles
            // while Xi() resolves to fewer than two (the selection is
            // not the active comparison, e.g. the overlay was toggled
            // off after selecting). The old route called the leniency
            // setter, which recomputed the active pair as a side
            // effect of merely opening Scribe, then retried. The retry
            // now resolves the cast straight from the live multi-select
            // and opens the Scribe choice directly — no recompute, no
            // recursion, no side effect.
            if (r.length < 2 && Yi().length >= 2) return sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = Yi().filter(e => vt[e]), void Qd(sxCompareIds);
            if (r.length < 1) return void tS("Scribe needs at least 1 profile in the multi-select. Select a profile tab — Ctrl+click (Cmd+click on Mac) profile tabs to build a multi-select — then open Scribe again.", {
                tone: "error",
                persistent: !0
            });
            if (a.length >= 2) return sxGroupLeniency = Number.isFinite(Number(i.leniency)) ? Number(i.leniency) : 50, sxWriterLeniency = sxGroupLeniency, void Qd(r);
            sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = r.slice(), Qd(r);
        }
        function eu(e, t, n, i, a, r, o = 99) {
            const s = String(t || "").split(/\s+/), l = [];
            let c = "";
            return s.forEach(t => {
                const n = c ? c + " " + t : t;
                e.measureText(n).width > a && c ? (l.push(c), c = t) : c = n;
            }), c && l.push(c), l.slice(0, o).forEach((t, a) => e.fillText(t + (a === o - 1 && l.length > o ? "…" : ""), n, i + a * r)), 
            i + Math.min(l.length, o) * r;
        }
        function tu(e) {
            const t = new Set;
            return h.forEach(n => {
                if (!Ma(n, e)) return;
                const i = catId(n.name);
                let a = !1;
                n.topics.forEach(n => {
                    const i = Wn(n);
                    if (ja(i, e)) return;
                    const r = t => ui(t, e) || Boolean(Qe[e]?.[t]) || Boolean(Je[e]?.[t]) || Boolean(et[e]?.[t]) || Boolean(tt[e]?.[t]?.length), o = ai(i, e).filter(t => r(t) && !ja(t, e));
                    (r(i) || o.length) && (t.add(i), o.forEach(e => t.add(e)), a = !0);
                }), a && t.add(i);
            }), !t.size && Bi(e) && h.forEach(e => t.add(catId(e.name))), t;
        }
        // F8 companion note (sharing-sync refactor): nu performs the
        // same solo-switch / collect / restore shape as the export
        // opener Jf — it snapshots the selection state at entry,
        // switches the live map to solo, collects, and restores
        // inline at the end. Checked during the F8 pass: the restore
        // here is inline and NOT wrapped in try/finally, and the
        // guard was deliberately NOT generalized from Jf to nu in
        // that pass (Jf's comment records the decision). Any future
        // hardening of this pattern should cover both sites or
        // neither, and say which.
        async function nu(t, n, i = {}) {
            const a = Yi(), r = [ ...rn ], o = [ ...on ], s = new Map(un), l = Lt, c = Nt, d = Mt, u = It, p = Pt, g = Tt, m = $n, f = En, y = Boolean(i.profileFill), b = Math.max(.25, Math.min(1, Number(i.outputScale) || 1)), v = Math.max(320, Number(i.outputWidth) || (y ? 3600 : 1800)), w = Math.max(320, Number(i.outputHeight) || (y ? 3600 : 1240)), k = Math.round(v * b), x = Math.round(w * b);
            n && vt[n] && (Mt = n, It = n), Pt = "all", Tt = "", sxSel(t, "set"), 
            t.length < 2 && sxSel(null, "clear"), rn.clear(), r.forEach(e => rn.add(e)), on.clear(), o.forEach(e => on.add(e)),
            Lt = null, Nt = null, En = !1;
            const S = i.allowedIds instanceof Set ? new Set(i.allowedIds) : new Set(Array.isArray(i.allowedIds) ? i.allowedIds : []);
            i.allowedIds || t.forEach(e => tu(e).forEach(e => S.add(e))), S.forEach(e => {
                const t = qn[e] || Xn(e) || (at[n] || {})[e];
                t?.parentId && (on.add(t.parentId), un.set(t.parentId, "all"));
            }), $n = S, Mr({
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
                    t && In.querySelectorAll("path,text,circle,ellipse,rect,line,polyline,polygon,image,use").forEach(e => {
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
                    e.textContent = Ji(t);
                });
            }(A, i.displayName), i.nativeTooltips && function(t, n, i = {}) {
                if (!t || !n || !vt[n]) return;
                const a = (e, t) => {
                    if (!e || !t) return;
                    Array.from(e.children || []).filter(e => "title" === e.localName).forEach(e => e.remove());
                    const n = document.createElementNS("http://www.w3.org/2000/svg", "title");
                    n.textContent = String(t).trim(), e.insertBefore(n, e.firstChild);
                }, r = e => qn[e] || Xn(e) || (at[n] || {})[e] || li().find(t => t.id === e), o = (e, t) => String(t?.querySelector(".category-label,.map-label")?.textContent || r(e)?.label || e || "Topic").trim();
                t.querySelectorAll(".node-group[data-layout-key]").forEach(e => {
                    const t = e.getAttribute("data-layout-key"), i = o(t, e), s = r(t);
                    if (!t || !i) return;
                    const l = Pa(t, n), c = [ i, `Give: ${l.giveKnown ? Math.round(l.give) : "unrated"} · Receive: ${l.receiveKnown ? Math.round(l.receive) : "unrated"}` ];
                    s && c.push(lo(s));
                    const d = [], u = Oa(t, n);
                    "favorite" === u ? d.push("Favorite") : "limit" === u ? d.push("Hard Limit") : "notinterested" === u && d.push("Not Interested"), 
                    Boolean(Je[n]?.[t]) && d.push("Fantasy-only"), Boolean(et[n]?.[t]) && d.push("Already Tried"), 
                    Boolean(tt[n]?.[t]?.length) && d.push("Has note"), d.length && c.push(d.join(" · ")), 
                    a(e, c.join("\n"));
                }), t.querySelectorAll(".direction-control[data-id][data-direction]").forEach(e => {
                    const t = e.getAttribute("data-id"), i = e.getAttribute("data-direction");
                    if (!t || !i || "group" === i) return;
                    const s = da(t, n), l = Boolean(s[i + "Known"]), c = l ? Math.round(s[i]) : "unrated", d = r(t), u = o(t, e), p = Jn(t, i), h = Zn(t, i), g = l && s[i + "Derived"] ? ` · rolled up from ${s[i + "RatedChildren"]} of ${s.childCount} child topics` : "";
                    a(e, `${d?.label || u} · ${p}${h ? ` ${h}` : ""}: ${c}${g}`);
                });
                const s = t.querySelector(".center-hit"), l = s && s.parentElement;
                if (l) {
                    const e = dc(n), r = na([ n ]), o = sxRingValuesForProfile(sxProfileById(n)), s = String(t.querySelector(".center-name-arc-text textPath,.center-label")?.textContent || i.displayName || "Profile").trim(), c = (e.green.length, 
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
            s.forEach((e, t) => un.set(t, e)), Lt = l, Nt = c, Mr({
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
        function iu(e) {
            iu.table || (iu.table = Array.from({
                length: 256
            }, (e, t) => {
                let n = t;
                for (let e = 0; e < 8; e++) n = 1 & n ? 3988292384 ^ n >>> 1 : n >>> 1;
                return n >>> 0;
            }));
            let t = 4294967295;
            for (const n of e) t = iu.table[255 & (t ^ n)] ^ t >>> 8;
            return (4294967295 ^ t) >>> 0;
        }
        function au(e, t) {
            const n = (new TextEncoder).encode(e), i = new Uint8Array(t.length + 12), a = new DataView(i.buffer);
            return a.setUint32(0, t.length), i.set(n, 4), i.set(t, 8), a.setUint32(t.length + 8, iu(i.slice(4, t.length + 8))), 
            i;
        }
        // ===== Picture restore guard + save-to-re-read round-trip (Rank 5, 2026-10-30) =====
        // A picture export is a PNG carrying the profile payload in a
        // zTXt chunk (keyword "Sexcapades", zlib-stored deflate) plus,
        // when contact info is included, a vCard iTXt chunk. The format
        // already carries integrity checks — a CRC32 over every PNG
        // chunk (written by au() via iu()) and an Adler-32 over the
        // zlib stream (checked in Lx's fallback) — and the restore side
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
            return iu(typeAndData) === stored;
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
                        try { decoded = (new TextDecoder).decode(await Lx(data.slice(nul + 2))); } catch (err) { throw new Error(sxSaveMsg); }
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
                        try { vcardText = (new TextDecoder).decode(compressed ? await Lx(raw) : raw); } catch (err) { throw new Error(sxSaveMsg); }
                    }
                }
                if ("IEND" === type) { sawIend = true; break; }
                off = end;
            }
            if (!sawIend || null === payloadText || payloadText !== expectedText) throw new Error(sxSaveMsg);
            if (expectedVcard && vcardText !== expectedVcard) throw new Error(sxSaveMsg);
        }
        async function ru(e, t, n = "", i = null) {
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
            const d = [ au("zTXt", c) ];
            n && d.push(function(e, t) {
                const n = (new TextEncoder).encode("vCard"), i = (new TextEncoder).encode(t), a = new Uint8Array(n.length + 5 + i.length);
                return a.set(n), a.set([ 0, 0, 0, 0, 0 ], n.length), a.set(i, n.length + 5), au("iTXt", a);
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
        function ou(e, t, n = {}) {
            if (!(e instanceof Blob) || "image/png" !== e.type) throw new Error("Export creation did not produce a PNG.");
            if (void 0 !== window.lastExportSvgMarkup && window.lastExportSvgMarkup && !n.svgMarkup) {
                var i = window.lastExportSvgMarkup;
                try {
                    if (n.profileId && vt[n.profileId]) {
                        var a = n.allowedIds instanceof Set ? n.allowedIds : new Set(n.allowedIds || []), r = bx(n.profileId, a, Boolean(n.includeProfileInfo), "", Boolean(n.blind)), o = JSON.stringify(r), s = btoa(unescape(encodeURIComponent(o)));
                        i = i.replace(/<svg([^>]*)>/, "<svg$1>\x3c!--sexcapades-profile:" + s + "--\x3e");
                    }
                } catch (e) { __sxErrLog("svg-embed", e); }
                n.svgMarkup = i, n.svgFilename = String(t || "Sexcapades-export").replace(/\.png$/i, "") + ".svg", 
                n.pdfFilename = String(t || "Sexcapades-export").replace(/\.png$/i, "") + ".pdf", 
                window.lastExportSvgMarkup = null;
            }
            Gf(e, /\.png$/i.test(String(t || "")) ? String(t) : String(t || "Sexcapades-export").replace(/\.[^.]+$/, "") + ".png", n);
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
        // opts.throughOnEmpty is set — the NovelAI and opener
        // handlers copy even an empty field — matching the handlers
        // this replaces in each case.
        async function sxCopyText(text, statusEl, okText, failText, hostEl, opts) {
            if (!text && !(opts && opts.throughOnEmpty)) return void (statusEl && (statusEl.textContent = failText)), !1;
            const ownTa = !(opts && opts.ta), ta = ownTa ? document.createElement("textarea") : opts.ta;
            ownTa && (ta.value = text, ta.setAttribute("readonly", ""), ta.style.position = "fixed", ta.style.opacity = "0", (hostEl || document.body).appendChild(ta));
            const ok = await ku(text, ta);
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
                    explicitness: Math.min(4, Math.max(1, Number(e.byId("scribeExplicitness")?.value) || 4)),
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
                        words: [ 100, 2e4 ],
                        paragraphs: [ 1, 100 ],
                        pages: [ 1, 50 ],
                        chapters: [ 1, 50 ]
                    }[String(u?.value || "paragraphs")] || [ 1, 100 ], s = o[0], l = o[1];
                    let a = Math.max(s, Math.min(l, Number(i[1]))), r = i[2] ? Math.max(s, Math.min(l, Number(i[2]))) : null;
                    return null !== r && r < a && ([a, r] = [ r, a ]), t && t.setCustomValidity(""), 
                    null === r ? String(a) : `${a}–${r}`;
                }();
                if (!a) return;
                scribeLengthUnit = [ "words", "paragraphs", "pages", "chapters" ].includes(String(u?.value || "")) ? u.value : "paragraphs", scribeDetailLevel = [ "concise", "balanced", "detailed" ].includes(String(d?.value || "")) ? d.value : "balanced", 
                scribeLengthValue = a, scribeLengthDisplay = String(i?.value || "").trim() ? a.replace(/–/g, "-") : "~5";
                const r = `Projected: ${scribeLengthDisplay} ${scribeLengthUnit}`;
                e.byId("scenePageProjection").textContent = r, e.byId("novelAiPageProjection").textContent = r, 
                ({ target: scribeTarget, mode: scribeMode } = sxResolveScribeMode(n, t));
                const sxSharedIds = (scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]), sxSharedData = sxSharedIds.length ? sxScribeMatchData(sxSharedIds, 1 === sxSharedIds.length) : null;
                const o = "porn" === scribeMode, s = e.byId("scribeTitle"), l = e.byId("scribeModeSummary");
                if (s && (s.textContent = o ? "Scribe — Story" : "Scribe — Play Guide"), l && (l.textContent = o ? "Fictional storytelling for enjoyment and fantasy — not a real-world plan." : "Practical coordination guidance for real-world use — not fiction; confirm every activity together."), 
                Ui(Bc), sxNovelAiFields = null, sxPrepScribeDialog(sxSharedData, !0), sxBuildScribePrompt(sxSharedData), "novelai" === scribeTarget && currentScribePrompt() && sxNovelAiFields && (Object.entries({
                    genre: "novelAiGenre",
                    title: "novelAiTitleField",
                    characterName: "novelAiCharacterName",
                    personality: "novelAiPersonality",
                    world: "novelAiWorld",
                    prompt: "novelAiPrompt"
                }).forEach(([t, n]) => {
                    e.byId(n).value = sxNovelAiFields[t] || "";
                }), e.all("[data-copy-novelai]").forEach(e => e.textContent = "Copy"), e.byId("novelAiCopyStatus").textContent = "", 
                1)) return Wi(jc), void requestAnimationFrame(() => jc.querySelector("[data-copy-novelai]")?.focus());
                e.byId("scribeProfiles") && (e.byId("scribeProfiles").textContent = scribeCastIds.filter(e => vt[e]).map(e => rd(e)).join(" + ")), Wi(Oc);
            }(t.participantIds.length > 1 ? "treatment" : "porn", ({ 1: "strictai", 2: "suggestive", 3: "explicit" })[t.explicitness] || "grok"));
        }), e.byId("scribeExplicitness") && e.byId("scribeExplicitness").addEventListener("input", t => { const n = Math.min(4, Math.max(1, Number(t.currentTarget.value) || 4)), i = e.byId("scribeExplicitnessLabel"); i && (i.textContent = `${n} · ${[ "Tame", "Suggestive", "Explicit", "Uninhibited" ][n - 1]}`); }), e.byId("scribePageCount") && e.byId("scribePageCount").addEventListener("input", e => e.currentTarget.setCustomValidity("")),
        sxWirePhaseToggles("scribe"), sxWirePhaseToggles("setter"), 
        e.byId("setterSetup") && e.byId("setterSetup").addEventListener("input", ev => {
            const ids = String(e.byId("negotiationDialog")?.dataset.participants || "").split(",").filter(Boolean);
            if (ids.length < 2) return;
            const st = Cu(ids), tg = ev.target, isNegotiationLength = "setterNegotiationLength" === tg.id || "setterNegotiationLengthUnit" === tg.id;
            if ("setterLength" === tg.id) st.length = String(tg.value || "5").trim() || "5"; else if ("setterLengthUnit" === tg.id) st.lengthUnit = String(tg.value || "paragraphs"); else if ("setterDetailLevel" === tg.id) st.detail = String(tg.value || "balanced"); else if ("setterNegotiationLength" === tg.id) st.negotiationLength = String(tg.value || "1").trim() || "1"; else if ("setterNegotiationLengthUnit" === tg.id) st.negotiationLengthUnit = String(tg.value || "pages"); else return;
            Fu(ids), isNegotiationLength ? e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = "Negotiation guide length saved.") : e.byId("negotiationCopyStatus") && (e.byId("negotiationCopyStatus").textContent = "Play guide settings saved.");
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
            const r = sxFilenameSlug((scribeCastIds.length ? scribeCastIds : [ scribeLeadId ]).filter(e => vt[e]).map(e => wt[e]).join("-"), "profile"), o = "porn" === scribeMode ? "story-prompt" : "play-guide-prompt", s = new Blob([ a + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), l = URL.createObjectURL(s), c = document.createElement("a");
            c.href = l, c.download = `Sexcapades-${r}-${o}.txt`, c.hidden = !0, document.body.appendChild(c), 
            c.click(), c.remove(), t.setTimeout(() => URL.revokeObjectURL(l), 0), i.textContent = "Prompt downloaded.";
        });
        const su = "https://sexcapades.io/#guide", lu = "https://sexcapades.io/#app", cu = [], du = [];
        h.forEach(e => {
            const t = catId(e.name);
            cu.push(t), du.push(t), e.topics.forEach(t => {
                cu.push(Wn(t)), du.push(Kn(e.name, sxName(t)));
            });
        });
        const uu = du.filter(e => "topic-sensation-atmosphere-tantra-energy-play" !== e && "topic-service-ritual-spiritual-play" !== e), pu = uu.reduce((e, t) => ("topic-impact-pain-body-modification-whips" === t || e.push("topic-impact-pain-body-modification-riding-crops" === t ? "topic-impact-pain-body-modification-whipping" : t), 
        e), []), hu = new Map(cu.map((e, t) => [ e, t ]));
        function gu(e) {
            let t = "";
            for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
            return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        function mu(e) {
            const t = String(e).replace(/-/g, "+").replace(/_/g, "/"), n = atob(t + "=".repeat((4 - t.length % 4) % 4)), i = new Uint8Array(n.length);
            for (let e = 0; e < n.length; e++) i[e] = n.charCodeAt(e);
            return i;
        }
        const fu = cu.filter(e => Boolean(topicLabelById[e])), yu = iu((new TextEncoder).encode(fu.join(" ")));
        function bu(e) {
            return Number.isFinite(Number(e)) ? 1 + Math.max(0, Math.min(14, Math.round(14 * (Number(e) + 100) / 200))) : 0;
        }
        function vu(e) {
            return e ? Math.round(200 * (e - 1) / 14 - 100) : null;
        }
        // wu: the token builder for this format (name, ratings, marks
        // in the inner function below). Its only live caller is the
        // anonymous survey send, which keeps includeName/includeMarks
        // false — a privacy property, not an oversize policy, and
        // unchanged by the framework. Oversize handling for this
        // format lives on the receiving side in Nu, which states the
        // format-derived limit; there is no share-link creation
        // caller in this bundle to warn at send time.
        function wu(e) {
            const t = function(e, t = {}) {
                if (!vt[e] && e !== Et) throw new Error("Choose a profile before making a link.");
                const n = !1 !== t.includeName, i = !1 !== t.includeMarks, a = n ? (new TextEncoder).encode(String(wt[e] || "Shared hypermap").slice(0, 40)) : new Uint8Array(0), r = [];
                fu.forEach((t, n) => {
                    const a = ca(t, e), o = bu(a.giveKnown ? a.give : null), s = bu(a.receiveKnown ? a.receive : null), l = i ? ("favorite" === Qe[e]?.[t] ? 1 : "limit" === Qe[e]?.[t] ? 2 : "notinterested" === Qe[e]?.[t] ? 16 : 0) | (Je[e]?.[t] ? 4 : 0) | (et[e]?.[t] ? 8 : 0) : 0;
                    (o || s || l) && r.push(n, o << 4 | s, l);
                });
                const o = new Uint8Array(9 + a.length + r.length), s = new DataView(o.buffer);
                return o.set([ 83, 88, 1 ], 0), s.setUint32(3, yu), o[7] = a.length, o[8] = r.length / 3, 
                o.set(a, 9), o.set(r, 9 + a.length), gu(o);
            }(e, {
                includeName: !1,
                includeMarks: !1
            }), n = St(mt[e]).outline;
            return n && n.timerRan ? `${t};t=${n.durationSeconds}` : t;
        }
        async function ku(e, t) {
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
        const xu = "https://sexcapades.io", Su = [ `Found this kink comparison tool. Want to compare hypermaps? ${xu}`, `I mapped all my kinks on this thing. Dying to see how we overlap — compare hypermaps? ${xu}`, `Ever wondered where your kinks line up with someone else’s? Compare hypermaps? ${xu}`, `I put my whole sex life on a map. Compare hypermaps? Let’s see what happens: ${xu}`, `This site maps your kinks and compares them with a partner’s. Compare hypermaps? ${xu}`, `What if you could see exactly where your desires overlap with someone? Compare hypermaps? ${xu}`, `I wonder how compatible we really are… compare hypermaps? Let’s find out: ${xu}`, `Map your kinks, compare with mine. Compare hypermaps? ${xu}` ];
        let $u = -1;
        function Eu() {
            e.byId("openerMessage").value = function() {
                let e = Math.floor(Math.random() * Su.length);
                Su.length > 1 && e === $u && (e = (e + 1 + Math.floor(Math.random() * (Su.length - 1))) % Su.length), 
                $u = e;
                const t = Su[e];
                return t.includes(xu) ? t : `${t} ${xu}`;
            }(), e.byId("openerCopyStatus").textContent = "";
        }
        const Au = new Map;
        function Cu(e) {
            const t = function(e) {
                return e.slice().sort().join("|");
            }(e);
            Au.has(t) || Au.set(t, {
                safewords: "",
                aftercare: Object.fromEntries(e.map(e => [ e, "" ])),
                length: "5",
                lengthUnit: "paragraphs",
                detail: "balanced",
                negotiationLength: "1",
                negotiationLengthUnit: "pages"
            });
            const n = Au.get(t);
            return e.forEach(e => {
                Object.prototype.hasOwnProperty.call(n.aftercare, e) || (n.aftercare[e] = "");
            }), n;
        }
        function Mu(e, t) {
            const n = qn[e] || Xn(e) || t.map(t => (at[t] || {})[e]).find(Boolean);
            return n ? n.label : e;
        }
        function Iu(e, t = {}) {
            const sxCanon = e => {
                try {
                    return Wn(e);
                } catch (t) {
                    return e;
                }
            }, sxOwnUniverse = e => [ ...new Set([ ...Uc(), ...Object.keys(vt[e] || {}), ...Object.keys((Ye[e] || {}).ratings || {}) ]) ], sxDeepSets = [ ...new Set((Array.isArray(e) ? e : []).filter(e => vt[e])) ].map(e => {
                const t = new Set;
                return sxOwnUniverse(e).forEach(n => {
                    const i = ca(n, e), a = Ye[e] ? Ld(Ye[e], n) : null;
                    (i.giveKnown && i.give <= -36 || i.receiveKnown && i.receive <= -36 || a && (a.giveKnown && a.give <= -36 || a.receiveKnown && a.receive <= -36)) && t.add(sxCanon(n));
                }), t;
            });
            const n = [ ...new Set((Array.isArray(e) ? e : []).filter(e => vt[e])) ], i = n.map(e => rd(e)), a = new Set(Uc().filter(e => n.some(t => ja(e, t)))), r = new Set(t.excludeFantasy ? Uc().filter(e => n.some(t => Ha(e, t))) : []), o = new Set([ ...a, ...r ]), s = n.map(e => sxHardLimitLines([ e ])), l = n.map(e => [ ...new Set([ ...new Set(sxOwnUniverse(e).map(e => sxCanon(e))) ].filter(n => !(t.hideExcludedNames && o.has(n))).filter(t => sxDeepSets[n.indexOf(e)].has(t)).map(e => Mu(e, n)).sort()) ]), c = [];
            Uc().forEach(e => {
                a.has(e) || t.excludeFantasy && r.has(e) || Id(n).forEach(([t, a]) => {
                    const r = n.indexOf(t), o = n.indexOf(a), s = ca(e, t), l = ca(e, a), d = [];
                    s.giveKnown && l.receiveKnown && s.give >= 36 && l.receive <= -36 && d.push(`${i[r]} gives / ${i[o]} receives`), 
                    s.receiveKnown && l.giveKnown && s.receive >= 36 && l.give <= -36 && d.push(`${i[r]} receives / ${i[o]} gives`), 
                    l.giveKnown && s.receiveKnown && l.give >= 36 && s.receive <= -36 && d.push(`${i[o]} gives / ${i[r]} receives`), 
                    l.receiveKnown && s.giveKnown && l.receive >= 36 && s.give <= -36 && d.push(`${i[o]} receives / ${i[r]} gives`), 
                    d.length && c.push(`${Mu(e, n)} — ${d.join("; ")}`);
                });
            });
            const sxSettings = Object.fromEntries(n.map(id => [ id, { heat: sxHeatFor(id), veil: sxVeilFor(id) } ])), d = n.length > 2 ? sxMultiMatchData(n, sxSettings) : sxCastMatchData(n[0], n[1], sxSettings), sxTeasers = function() {
                const seen = new Set, out = [];
                const line = rec => {
                    const dets = rec.teaserDetail && rec.teaserDetail.length ? rec.teaserDetail : rec.teaserFor.map(o => ({ owner: o, partner: "", heat: 0, flanks: [] }));
                    return dets.map(d => {
                        let s = `${d.owner} marked this Not Interested`;
                        if (d.heat > 0 && d.flanks && d.flanks.length) {
                            const ft = d.flanks.map(f => `${f.dir}${d.heat >= 34 ? ` (${"strong" === f.stance ? "strong" : "curious"}${d.heat >= 67 && null != f.rating ? `, ${Math.round(f.rating)}` : ""})` : ""}`).join(" and ");
                            s += 100 === d.heat ? `, at full Horndog heat (+100) ${d.partner} is offering more of themselves: ${d.partner} wants to ${ft}` : `; at the current Heat (+${d.heat}) it is teaser-eligible only: ${d.partner} wants to ${ft}`;
                        } else s += "; at the current Heat it is teaser-eligible only";
                        return s;
                    }).join("; ");
                };
                const take = rec => {
                    if (!rec || !rec.teaserFor || !rec.teaserFor.length || seen.has(rec.id)) return;
                    if (n.some(t => Ha(rec.id, t))) return;
                    seen.add(rec.id), out.push(`${rec.label} — ${line(rec)} — a soft no being revisited, never a match. Surface it solely as a flagged conversation point with an easy opt-out.`);
                };
                if (2 === n.length) {
                    const pair = sxPairByIds(n[0], n[1], sxSettings);
                    pair && pair.topics.forEach(take);
                } else if (n.length > 2) sxGroupCompute(n.map(x => sxProfileById(x)), {
                    heat: n.map(id => sxSettings[id].heat),
                    veil: n.map(id => sxSettings[id].veil)
                }).pairs.forEach(pr => pr.topics.forEach(take));
                return out.sort((x, y) => x.localeCompare(y));
            }(), sxFirstName = Object.fromEntries(n.map((e, t) => [ wt[e] || "", i[t] ])), sxDirOf = e => {
                const t = e.route ? [ e.route ] : e.routes && e.routes.length ? e.routes : [];
                return [ ...new Set(t.map(e => `${sxFirstName[e.giver] || e.giver} gives → ${sxFirstName[e.receiver] || e.receiver} receives`)) ].join("; ");
            }, sxIsFantasy = e => Boolean(e.fantasyOnly) || n.some(t => Ha(e.id, t)), sxRedFor = e => n.map((t, a) => sxDeepSets[a] && sxDeepSets[a].has(sxCanon(e.id)) ? i[a] : "").filter(Boolean), sxLineOf = e => {
                const t = sxDirOf(e), a = sxRedFor(e);
                return `${e.label}${t ? ` — ${t}` : ""}${a.length ? ` — red/no for ${a.join(" and ")}` : ""}`;
            }, u = e => e.filter(e => !o.has(e.id) && !sxIsFantasy(e)).map(sxLineOf), sxFantasySeen = new Set, sxFantasyOf = e => e.filter(e => !o.has(e.id) && sxIsFantasy(e) && !sxFantasySeen.has(e.id) && sxFantasySeen.add(e.id)).map(e => `☁ ${sxLineOf(e)}`), p = Cu(n), h = n.map(e => function(e, t, n = new Set) {
                return Uc().filter(t => {
                    const i = qn[t] || Xn(t);
                    if (!i || "Connection & aftercare" !== i.branch || ja(t, e) || n.has(t)) return !1;
                    const a = ca(t, e);
                    return "favorite" === Qe[e]?.[t] || a.giveKnown && a.give > 35 || a.receiveKnown && a.receive > 35;
                }).map(n => {
                    const i = ca(n, e);
                    return `${Mu(n, t)}${ad(i, n) ? ` — ${ad(i, n)}` : ""}`;
                }).sort();
            }(e, n, t.hideExcludedNames ? o : new Set));
            return {
                ids: n,
                names: i,
                limits: s,
                reds: l,
                discuss: c,
                warmup: u(d.warmup),
                main: u(d.escalation.concat(d.peak)),
                aftercare: u(d.aftercare),
                fantasy: sxFantasyOf([ ...d.warmup, ...d.escalation, ...d.peak, ...d.aftercare ]),
                teasers: sxTeasers,
                ratedAftercare: h,
                safewords: String(p.safewords || "").trim(),
                aftercareNeeds: n.map(e => String(p.aftercare[e] || "").trim()),
                excluded: sxHardLimitLines(n),
                terms: n.map(e => String(it[e] || "").trim()),
                mutuals: n.length > 1 ? Uc().filter(e => sxDeepSets.every(t => t.has(e))).map(e => Mu(e, n)).sort() : []
            };
        }
        function Pu(e, t) {
            return e.length ? e.map(e => `<li>${Hi(e)}</li>`).join("") : `<li>${Hi(t)}</li>`;
        }
        function sxTermsBlock(e, t, a) {
            const n = e.map((e, n) => {
                const i = String(it[e] || "").trim();
                return i ? `${t[n]}: "${i}"` : "";
            }).filter(Boolean);
            return n.length ? [ a && a.flavor ? "TERMS — IN THEIR OWN WORDS (each person's stated terms, quoted verbatim as flavor and character context for the writing; let them color voice, motivation, and texture — they are not the binding layer here):" : "TERMS — BINDING (quoted law, do not interpret or soften):", ...n ].join(" ") : "";
        }
        function sxAboutBlock(e, t) {
            // E8: About Me reaches the Scribe prompt only — per-profile,
            // attributed by name, framed as the person's own words /
            // profile context. Never binding: the binding layer stays
            // marks and Terms only. Empty About yields no section.
            const n = e.map((e, n) => {
                const i = String(nt[e] || "").trim();
                return i ? `ABOUT ${t[n]} (their own words):\n${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "PROFILE CONTEXT — IN THEIR OWN WORDS (background color for voice and character only; not binding limits and not checklist data — the binding layer is marks and Terms only):", ...n ].join("\n\n") : "";
        }
        function sxAgeBlock(e, t) {
            // Age context-on-tap: fires only when ageplay is in play —
            // the ageplayer role on any cast profile. All participants
            // are adults; the ages below are ageplay framing context for
            // the writers only. This is the only prompt-side reader of lt;
            // age never reaches matching, eligibility, or any boundary.
            if (!e.some(e => Gb(st[e]).includes("ageplayer"))) return "";
            const n = e.map((e, n) => {
                const i = String(lt[e] || "").trim();
                return i ? `${t[n]}: age ${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "AGE CONTEXT — AGEPLAY FRAMING ONLY (all participants are adults; these chronological ages are supplied solely as ageplay framing context for the writers — they do not affect matching, eligibility, or any boundary):", ...n ].join(" ") : "";
        }
        function sxRolesBlock(e, t) {
            const n = e.map((e, n) => {
                const i = Kb(st[e], ", ");
                return i ? `${t[n]}: roles: ${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "CAST — ROLES (identity language):", ...n ].join(" ") : "";
        }
        function sxCastBlock(e, t) {
            const n = e.map((e, n) => {
                const i = bb(rt[e]), a = iv(ot[e]), r = String(pz[e] || "").trim();
                return `${t[n]}: gender: ${i.length ? vb(i, " and ") : "unspecified"}; orientation: ${a.length ? Nb(a, " and ") : "unspecified"}. Pronouns for ${t[n]}: ${hp(e)}. Do not infer anatomy from gender labels. Gender, orientation, and roles guide identity and partner-gender choices only.`;
            }).filter(Boolean);
            return n.length ? [ "CAST — GENDER, ORIENTATION & PRONOUNS (identity language):", ...n ].join(" ") : "";
        }
        function sxWriterStamp(ids) {
            // E6 stamp: every writer output names the live session compare
            // settings — mode, and each cast profile's Heat (zone + signed
            // value) and Veil — read from the same session state the
            // Compare panel reads (sxcv / sxHeatFor / sxVeilFor).
            const names = ids.map(id => rd(id)), heat = ids.map((id, i) => {
                const v = sxHeatFor(id);
                return `${names[i]} ${sxHeatZone(v)} ${v > 0 ? "+" + v : v}`;
            }), veil = ids.map((id, i) => `${names[i]} ${sxVeilFor(id)}`);
            return `COMPARE SETTINGS — Mode: ${"play" === sxcv.mode ? "Play" : "Conversation"} · Heat: ${heat.join(" · ")} · Veil: ${veil.join(" · ")}`;
        }
        // Shared plain-text lines for the BINDING surfaces only
        // (refactor F11): the per-person binding Terms line and the
        // stated-aftercare-needs line are byte-identical in Lu()'s
        // negotiation checklist and in sxStoreNegotiationGuide()'s
        // guide document — same text, same per-person inputs — so
        // both render through these two helpers. The promise stays
        // explicit at each call site: these helpers format BINDING
        // lines only. Scribe's flavor rendering is a different
        // promise and does not use them (sxTermsBlock with
        // { flavor: true } at the Scribe call sites); Lu()'s
        // hideTerms guard likewise stays at the Lu() call site,
        // not inside the helper.
        function sxBindingTermsLine(terms) {
            return `- Terms (binding): "${terms}"`;
        }
        function sxStatedAftercareLine(needs) {
            return `- ${needs}`;
        }
        // Binding vs flavor (refactor F11 — read before "deduplicating"
        // the per-person terms/aftercare lines): Scribe's sxTermsBlock
        // renders a person's Terms as FLAVOR — character context for a
        // story or guide prompt, explicitly non-binding (its flavor
        // parameter says so). Scene Setter's per-person lines in Lu()
        // below and in sxStoreNegotiationGuide() are the BINDING layer:
        // the negotiation checklist and guide document a partner is
        // held to, where Terms sit alongside the marker lists. The two
        // renderings intentionally differ in wording, punctuation, and
        // empty-state lines (e.g. "- None marked" in the checklist vs
        // "- None marked." in the guide document), so the surrounding
        // renderings are NOT merged — merging them would change
        // shipped bytes and blur the promise each surface makes. What
        // IS shared safely is the block level: sxTermsBlock /
        // sxAboutBlock / sxAgeBlock / sxRolesBlock / sxCastBlock feed
        // both Scribe's prompt and Setter's documents (via Fu /
        // sxStoreNegotiationGuide), and that sharing stays. Two
        // single lines are also shared, via the helpers directly
        // above: the binding Terms line and the stated-aftercare
        // line are byte-identical between the checklist and the
        // guide document (both binding surfaces, same per-person
        // inputs). Deliberately left unshared: the limits/reds lists
        // and their empty states (punctuation differs, above);
        // Lu()'s aftercare fallback chain — stated needs, else rated
        // aftercare lines, else the not-filled-out line — because
        // the guide document renders rated aftercare in its own
        // tier-gated section instead; and the on-screen checklist
        // panel's HTML terms line, which carries no "- " prefix
        // because Pu() wraps it in an <li>.
        function Lu(e, t = {}) {
            const n = [ sxWriterStamp(e.ids), `NEGOTIATION CHECKLIST DATA — BINDING — ${e.names.join(" + ")}` ], i = Boolean(t.hideExcluded), sxNoTerms = Boolean(t.hideTerms);
            return e.names.forEach((t, a) => {
                const r = [ ...(i ? e.limits[a].length ? [ `- ${e.limits[a].length} hard-excluded ${1 === e.limits[a].length ? "topic is" : "topics are"} omitted; names intentionally absent.` ] : [] : e.limits[a].map(e => `- ${e}`)), ...(e.terms && e.terms[a] && !sxNoTerms ? [ sxBindingTermsLine(e.terms[a]) ] : []) ];
                r.length || r.push("- None marked"), n.push("", `${t} — HARD LIMITS`, ...r, `${t} — RED TOPICS`, ...e.reds[a].length ? e.reds[a].map(e => `- ${e}`) : [ "- None rated red" ], `${t} — STATED AFTERCARE NEEDS`, ...e.aftercareNeeds[a] ? [ sxStatedAftercareLine(e.aftercareNeeds[a]) ] : e.ratedAftercare[a].length ? e.ratedAftercare[a].map(e => `- ${e}`) : [ "- Not filled out; agree before play." ]);
            }), n.push("", "MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED", ...e.mutuals && e.mutuals.length ? e.mutuals.map(e => `- ${e}`) : [ "- None — no topic is rated deep-red by both partners." ]), n.push("", "DISCUSS FIRST — GREEN / RED CLASHES", ...e.discuss.length ? e.discuss.map(e => `- ${e}`) : [ "- No green-versus-red clashes found." ], "", "SAFEWORDS + STOP SIGNALS", `- ${e.safewords || "Not filled out; choose verbal safewords and a nonverbal stop signal before play."}`, "", "OTHER BEFORE-PLAY CHECKS", "- Agree what “pause” means and who may call it.", "- Confirm intensity, pacing, injuries, medication, allergies, and supplies."), 
            n.join(" ");
        }
        function Tu(e) {
            return [ "PLAY GUIDE DATA — SOURCE MATERIAL", "Warm-up", ...e.warmup.length ? e.warmup.map(e => `- ${e}`) : [ "- Agree on a gentle start together." ], "Main play", ...e.main.length ? e.main.map(e => `- ${e}`) : [ "- No shared green/green main-play topic is recorded." ], "Aftercare ideas from rated profiles", ...e.aftercare.length ? e.aftercare.map(e => `- ${e}`) : [ "- No shared aftercare topic is recorded." ], ...(e.fantasy && e.fantasy.length ? [ "Fantasy only — excluded from practical play", ...e.fantasy.map(e => `- ${e}`) ] : []), ...(e.teasers && e.teasers.length ? [ "Teasers — soft no revisited at the current Heat (flagged; teaser-eligible only, never a match)", ...e.teasers.map(e => `- ${e}`) ] : []) ].join(" ");
        }
        function sxNegotiationLengthSpec(t) {
            const raw = String(t.negotiationLength || "1").trim().replace(/[–—]/g, "-"), unit = [ "words", "paragraphs", "pages", "chapters" ].includes(String(t.negotiationLengthUnit || "")) ? String(t.negotiationLengthUnit) : "pages", m = raw.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/), first = m ? Number(m[1]) : 1, labelNum = m ? m[2] ? `${m[1]}–${m[2]}` : `${m[1]}` : "1", pages = "words" === unit ? first / 500 : "paragraphs" === unit ? first / 5 : first, tier = pages <= 1 ? "compact" : pages <= 3 ? "standard" : "full";
            return {
                label: `${labelNum} ${unitWord(labelNum, unit)}`,
                tier: tier,
                tierLabel: "compact" === tier ? "compact (full per-topic detail folded)" : "standard" === tier ? "standard (rated-aftercare detail included)" : "full (rated-aftercare detail and per-topic appendix included)"
            };
        }
        function sxStoreNegotiationGuide(g) {
            const st = Cu(g.ids), sp = sxNegotiationLengthSpec(st), list = (items, empty) => items && items.length ? items.map(x => `- ${x}`) : [ `- ${empty}` ], L = [ "NEGOTIATION GUIDE", g.names.join(" + "), sxWriterStamp(g.ids), `Target length: ${sp.label} · Detail: ${sp.tierLabel}`, "This document records the completed negotiation checklist as the agreement itself. A hypermap match is not consent." ], roles = sxRolesBlock(g.ids, g.names), cast = sxCastBlock(g.ids, g.names), termsBlock = sxTermsBlock(g.ids, g.names), hardExcluded = [ ...new Set((g.excluded || []).concat(g.mutuals || [])) ];
            roles && L.push("", roles), cast && L.push("", cast), g.names.forEach((name, idx) => {
                L.push("", `${name} — HARD LIMITS`, ...list(g.limits[idx], "None marked."));
                g.terms && g.terms[idx] && L.push(sxBindingTermsLine(g.terms[idx]));
                L.push("", `${name} — RED TOPICS`, ...list(g.reds[idx], "None rated red."));
            }), L.push("", "MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED", ...list(g.mutuals, "None — no topic is rated deep-red by both partners.")), L.push("", "DISCUSS FIRST — GREEN / RED CLASHES", ...list(g.discuss, "No green-versus-red clashes found.")), L.push("", "SAFEWORDS + STOP SIGNALS", ...list(g.safewords ? [ g.safewords ] : [], "Not filled out; choose verbal safewords and a nonverbal stop signal before play.")), L.push("", "AFTERCARE"), g.names.forEach((name, idx) => {
                L.push("", `${name} — STATED AFTERCARE NEEDS`, ...(g.aftercareNeeds[idx] ? [ sxStatedAftercareLine(g.aftercareNeeds[idx]) ] : list([], "Not filled out; agree before play.")));
            }), L.push("", "HARD-EXCLUDED NOTICE", "The topics below are hard-excluded: outside this agreement and outside any play guide generated from it.", ...list(hardExcluded, "None marked.")), g.terms && g.terms.some(Boolean) && L.push("- Limits named in a profile’s Terms also apply, exactly as quoted in this guide."), termsBlock && L.push("", termsBlock), L.push("", "BEFORE-PLAY CHECKS"), "compact" === sp.tier ? L.push("- Confirm the meaning of “pause”, intensity and pacing, injuries, medication, allergies, and supplies before play.") : L.push("- Agree what “pause” means and who may call it.", "- Confirm intensity, pacing, injuries, medication, allergies, and supplies."), "compact" === sp.tier ? L.push("", "PER-TOPIC DETAIL — FOLDED AT THIS LENGTH", `- Rated aftercare preferences: ${g.names.map((name, idx) => `${name} ${g.ratedAftercare[idx].length} recorded`).join("; ")}.`, `- Topic detail folded: ${g.warmup.length} warm-up, ${g.main.length} main-play, and ${g.aftercare.length} aftercare ideas are recorded; fantasy-only and teaser entries stay labelled in the full setting.`) : (L.push("", "PER-TOPIC DETAIL — RATED AFTERCARE PREFERENCES"), g.names.forEach((name, idx) => {
                L.push("", `${name} — RATED AFTERCARE PREFERENCES`, ...list(g.ratedAftercare[idx], "None recorded."));
            })), "full" === sp.tier && (L.push("", "APPENDIX — PER-TOPIC DETAIL", "", "Warm-up", ...list(g.warmup, "Agree on a gentle start together."), "", "Main play", ...list(g.main, "No shared green/green main-play topic is recorded."), "", "Aftercare ideas from rated profiles", ...list(g.aftercare, "No shared aftercare topic is recorded."), "", "Fantasy only — excluded from practical play", ...list(g.fantasy, "No fantasy-only topics are in the shared pool."), "", "Teasers — soft no revisited at the current Heat (flagged; teaser-eligible only, never a match)", ...list(g.teasers, "No soft-no topics are teaser-eligible at the current settings."))), L.push("", "End of negotiation guide.");
            const doc = L.join("\n"), panel = e.byId("negotiationPanel");
            return panel && (panel.dataset.negotiationGuide = doc, panel.dataset.negotiationLength = sp.label, panel.dataset.negotiationDetail = sp.tier), doc;
        }
        // Scene Setter shared handler pieces (refactor F3): the full
        // play-guide prompt text (stored copy document plus the phase
        // and details sections), and the freshness step every
        // negotiation handler starts with — read the dialog's
        // participant ids and re-render the stored documents when a
        // pair is selected.
        function playGuidePromptText() {
            const t = e.byId("negotiationPanel"), x = [ setterPhaseSection(), setterDetailsSection() ].filter(Boolean).join("\n");
            return (t?.dataset.copy || "") + (x ? "\n" + x : "") + "\n\n" + SX_PLAY_GUIDE_FORMAT;
        }
        const SX_PLAY_GUIDE_FORMAT = [ "STRUCTURED PLAY GUIDE FORMAT — REQUIRED (Scene Sentinel Way B standard, guide-1106-0847)", "End your answer with a timed play guide in EXACTLY this format, so Scene Sentinel can read it back and run its timers. One step per line, every line in this shape:", "[MM:SS-MM:SS] Activity name — what happens in this step, in one or two sentences.", "Rules: (1) Time codes are elapsed time from the start of the scene, zero-based: the first step starts at 00:00, steps run back to back with no gaps or overlaps, and the last step ends at the planned scene length. Use MM:SS under an hour, H:MM:SS over an hour. (2) The activity name MUST be one of this fixed set, spelled exactly: Warm-up; Negotiation check; Bondage; Impact play; Sensation play; Teasing & denial; Oral; Manual stimulation; Penetrative sex; Orgasm control; Roleplay; Service; Worship; Free play; Aftercare; Other. Put anything else in the guidance after the dash, never in the activity name. (3) End with an Aftercare step. (4) After the timed steps, add one line: CHECK-IN EVERY: N MINUTES, with N between 1 and 15, so the app knows how often to pulse the watch for a check-in. (5) Keep the timed guide as plain lines — no tables, no bullet markers, no extra time formats anywhere else in the guide.", "Example:", "[00:00-05:00] Warm-up — Slow massage and teasing, building touch gradually.", "[05:00-20:00] Impact play — Flogging, starting light and checking in before building.", "[20:00-25:00] Aftercare — Water, blanket, quiet cuddling.", "CHECK-IN EVERY: 5 MINUTES" ].join("\n");

        function setterParticipantIds() {
            const ids = String(e.byId("negotiationDialog")?.dataset.participants || "").split(",").filter(Boolean);
            return ids.length >= 2 && Fu(ids), ids;
        }
        // Draft data computed once per open (writers refactor): the
        // open handler hands Fu the Iu() result it already computed
        // for the on-screen panel, instead of Fu recomputing the
        // full match a second time to rebuild the same documents.
        // Other callers pass nothing and Fu computes it, as before.
        function Fu(t, precomputed) {
            var n;
            const i = Cu(t), a = `${i.length || "5"} ${unitWord(i.length || "5", i.lengthUnit)}`, r = "concise" === i.detail ? "Concise: use short phase notes and only essential check-ins." : "detailed" === i.detail ? "High detail: include specific phase timing, transitions, role cues, check-ins, stop options, and aftercare steps." : "Balanced detail: include enough timing, transitions, role cues, check-ins, and aftercare to follow without over-scripting.";
            e.byId("negotiationPanel").dataset.copy = [ "AI PLAY-GUIDE REQUEST", `Create or randomize a practical play guide targeting approximately ${a}. ${r} Use PLAY GUIDE DATA as inspiration while treating NEGOTIATION CHECKLIST DATA as binding. Keep every hard limit completely out. Treat every red topic as a no for that person. Mention each discuss-first clash only as an explicit negotiation point, never as assumed consent or planned action. Work the agreed safewords and stop signals naturally into the guide, and build the aftercare section from every participant’s stated aftercare needs. If a field is not filled out, leave a clear pre-scene decision point instead of inventing an answer.`, "", Tu(n = precomputed || Iu(t)), "", Lu(n), "", sxRolesBlock(n.ids, n.names), "", sxCastBlock(n.ids, n.names), "", sxTermsBlock(n.ids, n.names), "", sxAgeBlock(n.ids, n.names), "", `HARD-EXCLUDED FROM SCENE GENERATION ${n.excluded.length ? n.excluded.map(e => `- ${e}`).join(" ") : n.mutuals.length ? "- no marked limits; mutual deep-red exclusions follow" : n.terms && n.terms.some(Boolean) ? "- no marked limits or mutual deep-red exclusions; limits named in the Terms above still apply" : "- none marked"}${n.mutuals.length ? ` MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED ${n.mutuals.map(e => `- ${e}`).join(" ")}` : ""}` ].join(" "), e.byId("negotiationPanel").dataset.playGuide = e.byId("negotiationPanel").dataset.copy, sxStoreNegotiationGuide(n);
        }
        // Share-link door (refactor item 3, ruled 2026-10-29): Nu is
        // called at boot AND from the hashchange handler, so a share
        // link pasted into a running app imports without a reload.
        // sxShareLinkToken is the last token this session handled:
        // the same token arriving twice for one stay on the #share=
        // hash (the boot call racing a hashchange, or a duplicate
        // hashchange) imports once, not twice. A call with any other
        // hash clears it, so leaving the share hash and pasting the
        // same link again imports again, exactly like a reload would.
        // The import itself is unchanged: wx with source "share-link"
        // still lands through the "profile" merge branch, which does
        // NOT auto-select or join the receiver's multiselect (F7).
        let sxShareLinkToken = "";
        async function Nu() {
            // Share-link receiving side (unified framework adaptation):
            // the token format is bounded (see
            // sxShareLinkMaxTokenLength), so a token longer than any
            // complete link this map can make is refused plainly, a
            // hash that starts #share= but matches no token is no
            // longer met with silence, and a truncated token fails
            // closed in the parse below with the alternative named.
            // This bundle has no share-link CREATION caller — the only
            // producer of this token format is the anonymous survey
            // token in wu(), whose flags stay stripped — so there is
            // no sending-side warning to route here; the framework is
            // fitted on the side that exists. The #share= → "profile"
            // mapping and its HARD CONSTRAINT below are untouched.
            const sxHash = String(location.hash || "");
            const e = sxHash.match(/^#share=([A-Za-z0-9_-]+)$/);
            if (!e) {
                if (sxHash.startsWith("#share=")) tS("That share link could not be opened: it looks cut off or damaged, so nothing was imported. Ask for the complete link, or use Export QR codes — the numbered QR sheet holds the complete profile.", {
                    tone: "error",
                    persistent: !0
                });
                return void (sxShareLinkToken = "");
            }
            if (e[1] === sxShareLinkToken) return;
            sxShareLinkToken = e[1];
            if (e[1].length > sxShareLinkMaxTokenLength()) return void tS(sxOversizeShareMessage(e[1].length), {
                tone: "error",
                persistent: !0
            });
            try {
                wx(yx.parse("share-link", e[1]), {
                    source: "share-link"
                });
            } catch (e) {
                const sxMsg = yx.errorMessage(e, "That share link could not be opened.");
                tS(sxMsg + (/incomplete|not a readable/i.test(sxMsg) ? " Ask for the complete link, or use Export QR codes — the numbered QR sheet holds the complete profile." : ""), {
                    tone: "error",
                    persistent: !0
                });
            }
        }
        const _u = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
        function Du(e) {
            const t = String(e || ""), n = [];
            for (let e = 0; e < t.length; e += 3) {
                const i = t.length - e;
                if (1 === i) throw new Error("Invalid Base45 data");
                const a = _u.indexOf(t[e]), r = _u.indexOf(t[e + 1]), o = i > 2 ? _u.indexOf(t[e + 2]) : -1;
                if (a < 0 || r < 0 || i > 2 && o < 0) throw new Error("Invalid Base45 data");
                const s = a + 45 * r + (i > 2 ? 2025 * o : 0);
                if (s > (i > 2 ? 65535 : 255)) throw new Error("Invalid Base45 data");
                i > 2 ? n.push(s >> 8, 255 & s) : n.push(s);
            }
            return new Uint8Array(n);
        }
        async function Ru(e, t = tu(e), n = !0, i = !1) {
            return async function(e) {
                const t = (new TextEncoder).encode(e);
                if ("function" != typeof CompressionStream) return "SCP2J:" + gu(t);
                const n = new Blob([ t ]).stream().pipeThrough(new CompressionStream("deflate"));
                return "SCP3:" + function(e) {
                    let t = "";
                    for (let n = 0; n < e.length; n += 2) if (n + 1 < e.length) {
                        const i = 256 * e[n] + e[n + 1];
                        t += _u[i % 45] + _u[Math.floor(i / 45) % 45] + _u[Math.floor(i / 2025)];
                    } else {
                        const i = e[n];
                        t += _u[i % 45] + _u[Math.floor(i / 45)];
                    }
                    return t;
                }(new Uint8Array(await new Response(n).arrayBuffer()));
            }(JSON.stringify(function(e, t = tu(e), n = !0, i = !1) {
                return yx.serialize("compact", {
                    person: e,
                    allowedIds: t,
                    includeProfileInfo: n,
                    blind: i
                });
            }(e, t, n, i)));
        }
        // ===== OVERSIZE UNIFIED FRAMEWORK (Rank 13, ruled 2026-10-30) =====
        // One common core for EVERY surface, plus per-surface
        // adaptations — not one rule for all surfaces. Common core:
        // never silently drop, truncate, enlarge, or shrink profile
        // data; every oversize event states, in user words, what is
        // missing and where to get the complete version. The
        // capacities below are the surfaces' existing physical
        // limits, named here and NOT changed by this framework: the
        // document page holds 2 scan codes, the Sync card tries 2
        // codes then 4, the QR sheet is unbounded, and a share-link
        // token is bounded by the format itself (see
        // sxShareLinkMaxTokenLength). The two image shrink-to-fit
        // paths (the attached-photo 400px cap in Xu, the map-raster
        // 6400px side cap) are NOT data callers and are deliberately
        // not routed here: shrinking an image loses only resolution,
        // never profile data. The picture paths are likewise not
        // QR-routed: ru() already re-reads every finished PNG and
        // compares its embedded payload byte-for-byte (Rank 5), and
        // the scan reassembly in Kx/Wx stays fail-closed — a partial
        // numbered set never claims success, and its progress message
        // already states how many pieces are still missing.
        // sxOversizeAlt: the one complete-version alternative every
        // surface names — the numbered QR sheet from Export QR codes,
        // which holds every piece.
        function sxOversizeAlt() {
            return "Export QR codes — the numbered QR sheet holds every piece.";
        }
        // Document (PDF) page: warn-and-refuse. The helpers below
        // return the exact wordings the document and its export dialog
        // already used, from one source, so the count and the
        // alternative can never drift apart.
        function sxOversizeDocumentNote(neededPieces) {
            return `This profile needs ${neededPieces} scan codes and this page holds 2. For codes that hold every piece, use Export QR codes and print the numbered QR sheet instead.`;
        }
        function sxOversizeDocumentDialog(neededPieces) {
            return `PDF complete, but it has no scan codes: this profile is too large for document scan codes (it needs ${neededPieces} and the page holds 2), so none are printed — partial codes could never be scanned back in. For scannable codes, use Export QR codes: the numbered QR sheet holds every piece.`;
        }
        // Sync card: try 2 codes, then 4, then throw. The throw states
        // the measured size of the data that would not fit and names
        // the alternative; it does NOT claim a 700-character piece
        // count — the card's fit check is QR version capacity at two
        // fixed sizes, a different unit from the document's
        // 700-character pieces, and a piece count here would read as
        // if the profile fit the 4-code layout when it does not. The
        // card callers (op/lp) surface it in the export dialog
        // instead of their generic failure text.
        function sxOversizeCardMessage(payloadLength) {
            return `This profile is too large for the reliable two-code or four-code Sync card layout: its scan-code data is ${payloadLength} characters long, too long for 2 codes at the large size or 4 codes at the small size. No partial card was made. ${sxOversizeAlt()}`;
        }
        // Share link: measured limit plus alternative. The limit is
        // derived from the format itself, not invented: a token is 9
        // header bytes, a name sliced to 40 code units (at most 3
        // UTF-8 bytes each), and 3 bytes per rated topic in fu, all
        // base64url-encoded with padding stripped. No complete link
        // this map version can make is longer than this; anything
        // longer cannot be complete, and anything cut short fails the
        // parse below, fail-closed, with the alternative named.
        function sxShareLinkMaxTokenLength() {
            const bytes = 9 + 40 * 3 + 3 * fu.length, groups = Math.ceil(bytes / 3);
            return groups * 4 - (3 - bytes % 3) % 3;
        }
        function sxOversizeShareMessage(tokenLength) {
            return `That share link is too long to be a complete Sexcapades link: it has ${tokenLength} characters and the longest complete link this map can make has ${sxShareLinkMaxTokenLength()}. Nothing was imported. Ask for the complete link, or use ${sxOversizeAlt()}`;
        }
        // CHUNKER (sharing-sync refactor F2): one splitter for the
        // SCP4 chunk format, replacing the two historical helpers
        // whose second argument meant opposite things. The option
        // is NAMED, never a bare number: { chunkSize } = max
        // characters per chunk (old Ou; a payload that fits comes
        // back as one UNPREFIXED string), { chunkCount } = the
        // exact number of chunks to emit (old Bu; always that many
        // SCP4-prefixed parts). The SCP4:<hash>:<i>:<n>:<slice>
        // wire format and the iu CRC32 hash are byte-identical to
        // both old paths, so existing codes stay readable.
        function chunkPayload(e, t = {}) {
            const n = String(e || ""), i = iu((new TextEncoder).encode(n)).toString(36).toUpperCase();
            // Splitter guardrails (unified framework core): an empty
            // payload has no pieces, and supplying BOTH chunkCount and
            // chunkSize is an error — count used to win silently and
            // size was ignored without complaint. No current caller
            // supplies both, so throwing here changes no live path;
            // it only refuses a contradictory instruction loudly.
            if (!n) throw new Error("chunkPayload: an empty payload has no pieces to split — nothing was encoded.");
            if (null != t.chunkCount && null != t.chunkSize) throw new Error("chunkPayload: chunkCount and chunkSize were both supplied — neither was applied. Supply exactly one, so no piece is silently sized by the wrong rule.");
            if (null != t.chunkCount && (!Number.isInteger(t.chunkCount) || t.chunkCount < 1)) throw new Error("chunkPayload: chunkCount must be a whole number of 1 or more.");
            if (null != t.chunkSize && (!Number.isInteger(t.chunkSize) || t.chunkSize < 1)) throw new Error("chunkPayload: chunkSize must be a whole number of 1 or more.");
            if (null != t.chunkCount) {
                const a = Math.ceil(n.length / t.chunkCount);
                return Array.from({
                    length: t.chunkCount
                }, (e, r) => `SCP4:${i}:${r + 1}:${t.chunkCount}:${n.slice(r * a, (r + 1) * a)}`);
            }
            const s = t.chunkSize || 700, a = Math.max(1, Math.ceil(n.length / s));
            return 1 === a ? [ n ] : Array.from({
                length: a
            }, (e, r) => `SCP4:${i}:${r + 1}:${a}:${n.slice(r * s, (r + 1) * s)}`);
        }
        function ju(e, t) {
            if (!window.QRCode || "function" != typeof QRCode.create) return !1;
            try {
                return e.forEach(e => QRCode.create(e, {
                    errorCorrectionLevel: "H",
                    version: t
                })), !0;
            } catch (e) {
                return !1;
            }
        }
        // QR SERVICE (sharing-sync refactor F1): the ONE QR encoder
        // for every path — sync cards, QR sheets, the overlap share,
        // and the PDF document path all encode through qrEncode.
        // One width policy (qrWidth: the requested width, with a 720px
        // rendering minimum for QR readability) and one return type: a promise for an ARRAY of
        // data-URL strings. Callers that need an <img> element wrap
        // the single result with zu (see qu below). Oversize
        // behavior is the UNIFIED FRAMEWORK (Rank 13, ruled
        // 2026-10-30): oversize "throw" (the default) rejects, which the
        // card/sheet callers rely on; oversize "split" (the PDF
        // document path only) retries as SCP4 chunks of 700 and
        // returns EVERY chunk code, or [] when the payload cannot
        // be split. (It used to return only the first two chunks and
        // silently drop the rest, so those codes could never be
        // reassembled; the document path now counts the codes it
        // gets back and warns plainly when they exceed the two the
        // page can hold — see apQrImages.) The framework block above
        // the CHUNKER states the common core and the per-surface
        // adaptations; the old open decision not to unify is closed
        // by that ruling.
        function qrWidth(e) {
            // Rendering minimum, not a data policy: QR images are
            // never rendered below 720px wide, so a code stays
            // scannable at the sizes it is drawn at. The payload is
            // never enlarged or shrunk by this — it only sets the
            // image size. (The overlap share requests 480 and is
            // rendered at this 720 minimum, as before.)
            return Math.max(720, Math.round(Number(e) || 1536));
        }
        async function qrEncode(e, t = {}) {
            if (!window.QRCode || "function" != typeof QRCode.toDataURL) throw new Error("The QR encoder did not load.");
            const n = {
                errorCorrectionLevel: t.errorCorrectionLevel || "H",
                version: t.version,
                margin: 6,
                width: qrWidth(t.width),
                color: {
                    dark: "#000000",
                    light: "#ffffff"
                }
            };
            if ("split" !== t.oversize) return [ await QRCode.toDataURL(e, n) ];
            try {
                return [ await QRCode.toDataURL(e, n) ];
            } catch (err) {
                const i = chunkPayload(e, {
                    chunkSize: 700
                });
                if (!i || i.length < 2) return [];
                const out = [];
                for (const part of i) out.push(await QRCode.toDataURL(part, n));
                return out;
            }
        }
        async function qu(e, t = 1536, n = {}) {
            // Element wrapper: single-code by default (reject-only),
            // and a caller-supplied oversize option passes through to
            // qrEncode, so a caller that needs splitting gets it
            // instead of a silent rejection. Width, version, and
            // error-correction pass through unchanged.
            return zu((await qrEncode(e, {
                width: t,
                version: n.version,
                errorCorrectionLevel: n.errorCorrectionLevel,
                oversize: n.oversize
            }))[0]);
        }
        function Hu(e, t) {
            const n = e => Vw[e] || e, i = {}, a = [];
            (e.d || []).forEach(e => {
                const r = n(t[Number(e[1])]), o = ii(i, e[0], r);
                a.push(o && o.id || "");
            });
            const r = e => {
                const i = Number(e);
                return i < t.length ? n(t[i]) : a[i - t.length];
            }, o = {};
            (e.r || []).forEach(e => {
                const t = r(e[0]);
                t && (o[t] = {
                    give: Number(e[1]),
                    receive: Number(e[2])
                });
            });
            const s = {};
            (e.m || []).forEach(e => {
                const t = r(e[0]);
                t && (s[t] = 1 === Number(e[1]) ? "favorite" : 3 === Number(e[1]) ? "notinterested" : "limit");
            });
            const l = {};
            (e.h || []).forEach(e => {
                const t = r(e);
                t && (l[t] = !0);
            });
            const c = {};
            (e.i || []).forEach(e => {
                const t = r(e);
                t && (c[t] = !0);
            });
            const d = {};
            return (e.t || []).forEach(e => {
                const t = r(e[0]);
                t && (d[t] = [ String(e[1] || "") ]);
            }), {
                app: "sexcapades",
                version: 17,
                profileName: e.n || "QR profile",
                blind: 1 === e.k,
                gender: e.g || "",
                pronouns: e.p || "",
                sexuality: e.s || [],
                roles: e.w || [],
                age: e.y || "",
                location: e.l || "",
                contact: e.c || {},
                aboutMe: e.b || "",
                termsOfService: e.u || "",
                veil: av(null != e.j ? e.j : e.e),
                veilEnabled: Boolean(null != e.z ? e.z : e.f),
                net: av(e.e),
                netEnabled: Boolean(e.f),
                completionTimes: St(e.q),
                ratings: o,
                annotations: s,
                fantasyOnly: l,
                alreadyTried: c,
                notes: d,
                importedChildren: i
            };
        }
        function Wu(e, t, n, i, a, r) {
            const o = Math.max(0, Math.min(r, i / 2, a / 2));
            e.moveTo(t + o, n), e.lineTo(t + i - o, n), e.quadraticCurveTo(t + i, n, t + i, n + o), 
            e.lineTo(t + i, n + a - o), e.quadraticCurveTo(t + i, n + a, t + i - o, n + a), 
            e.lineTo(t + o, n + a), e.quadraticCurveTo(t, n + a, t, n + a - o), e.lineTo(t, n + o), 
            e.quadraticCurveTo(t, n, t + o, n);
        }
        function Uu(e) {
            const t = Rv(ut[e] || {}), n = [];
            if ([ "telegram", "linktree", "fetlife", "chaturbate", "stripchat", "myfreecams", "pornhub", "xvideos", "xhamster", "onlyfans", "reddit", "x" ].forEach(e => {
                t[e] && n.push(t[e]);
            }), (t.customSites || []).forEach(e => {
                e && e.username && n.push(e.username);
            }), !n.length) return "";
            const i = {};
            n.forEach(e => {
                const t = String(e).toLowerCase();
                i[t] || (i[t] = {
                    user: e,
                    n: 0
                }), i[t].n++;
            });
            let a = null;
            return Object.values(i).forEach(e => {
                (!a || e.n > a.n) && (a = e);
            }), a && a.n > 1 ? a.user : t.fetlife ? t.fetlife : n[0];
        }
        function Gu(e, t, n, i, a, r, o) {
            const s = Math.max(4, .133 * i[0]), l = Math.max(10, Math.round(.234 * i[0]));
            i.forEach((i, l) => {
                const c = Math.max(0, Math.min(100, Number(a[l]) || 0));
                e.beginPath(), e.arc(t, n, i, 0, 2 * Math.PI), e.strokeStyle = function(e, t) {
                    const n = String(e || "").replace("#", ""), i = 3 === n.length ? n.split("").map(e => e + e).join("") : n, a = parseInt(i, 16);
                    return isNaN(a) ? `rgba(128,128,128,${t})` : `rgba(${a >> 16 & 255},${a >> 8 & 255},${255 & a},${t})`;
                }(r[l], o), e.lineWidth = s, e.stroke(), c > 0 && (e.beginPath(), c >= 99.5 ? e.arc(t, n, i, 0, 2 * Math.PI) : e.arc(t, n, i, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * c / 100), 
                e.strokeStyle = r[l], e.lineWidth = s, e.lineCap = "round", e.stroke());
            });
            const c = [ -Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6 ];
            e.save(), e.textAlign = "center", e.textBaseline = "middle", i.forEach((i, o) => {
                const s = Math.round(Math.max(0, Math.min(100, Number(a[o]) || 0))), d = c[o], u = i + 1.27 * l;
                e.fillStyle = r[o], e.font = "700 " + l + "px system-ui, sans-serif", e.fillText(s + "%", t + u * Math.cos(d), n + u * Math.sin(d));
            }), e.restore();
        }
        function Ku(e, t, n = {}) {
            return Object.assign({
                app: "sexcapades-share",
                appUrl: lu,
                version: 1,
                kind: e,
                profiles: t
            }, n);
        }
        function zu(e) {
            return new Promise((t, n) => {
                const i = new Image;
                i.onload = () => t(i), i.onerror = () => n(new Error("An attached photo could not be prepared for the compact export.")), 
                i.src = e;
            });
        }
        function Vu(e) {
            return new Promise((t, n) => {
                const i = new FileReader;
                i.onload = () => t(String(i.result || "")), i.onerror = () => n(new Error("An attached photo could not be prepared for the compact export.")), 
                i.readAsDataURL(e);
            });
        }
        function Yu(e, t, n) {
            return new Promise(i => e.toBlob(i, t, n));
        }
        async function Xu(e) {
            const t = await zu(e.data), n = t.naturalWidth || e.width, i = t.naturalHeight || e.height, a = Math.max(n, i), r = Math.min(1, 400 / a), o = Math.max(1, Math.round(n * r)), s = Math.max(1, Math.round(i * r)), l = document.createElement("canvas");
            l.width = o, l.height = s;
            const c = l.getContext("2d");
            c.fillStyle = "#151816", c.fillRect(0, 0, o, s), c.imageSmoothingEnabled = !0, c.imageSmoothingQuality = "high", 
            c.drawImage(t, 0, 0, o, s);
            let d = null;
            for (const e of [ .72, .62, .52, .44, .36 ]) if (d = await Yu(l, "image/jpeg", e), 
            d && d.size <= 48e3) break;
            if (!d) throw new Error("An attached photo could not be prepared for the compact export.");
            return {
                data: await Vu(d),
                width: o,
                height: s,
                cropX: e.cropX,
                cropY: e.cropY,
                cropZoom: e.cropZoom,
                cropRotation: e.cropRotation,
                cropReady: !0 === e.cropReady,
                manualCrop: !0 === e.manualCrop
            };
        }
        async function Zu(e, t = {}) {
            const n = Boolean(t.lowRes), i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = dt[e], o = Math.max(.25, Math.min(1, Number(t.outputScale) || (n ? 4 / 9 : .8))), s = "function" == typeof t.progress ? t.progress : async () => {};
            let l = null, c = null, d = null;
            if (i) {
                if (n) {
                    await s(10, "Preparing photos", "Sizing selected profile photos for this export…"), 
                    d = await async function(e, t) {
                        const n = Yv(e), i = Array.isArray(t) ? new Set(t.map(Number)) : new Set(n.map((e, t) => t));
                        return Promise.all(n.filter((e, t) => i.has(t)).map(Xu));
                    }(r, t.photoIndices), dt[e] = d;
                    const n = (r || [])[0];
                    n && !dt[e].length && (dt[e] = [ n ]);
                }
            } else dt[e] = (r || []).slice(0, 1);
            try {
                const r = i ? Ji(wt[e]) || "Profile" : np(wt[e] || "Profile", !1) || "Profile";
                await s(18, "Rendering hypermap", "Laying out the visible hypermap at export resolution…"), 
                l = await nu([ e ], e, {
                    profileFill: !0,
                    centerOnMap: !0,
                    outputScale: o,
                    displayName: r,
                    background: t.background || "black",
                    allowedIds: t.allowedIds
                }), await s(44, "Drawing hypermap", "Painting the hypermap, profile header, and rating rings…");
                const u = new Set(l.sexcapadesNodeIds || []), p = function(e = 1, t = "black") {
                    const n = document.createElement("canvas"), i = Math.max(.25, Math.min(1, Number(e) || 1));
                    n.width = Math.round(3600 * i), n.height = Math.round(3600 * i);
                    const a = n.getContext("2d", {
                        alpha: !0
                    });
                    return a.clearRect(0, 0, n.width, n.height), "transparent" !== t && (a.fillStyle = "white" === t ? "#ffffff" : "#151816", 
                    a.fillRect(0, 0, n.width, n.height)), a.scale(i, i), a.fillStyle = "white" === t ? "#151816" : "#edf2ee", 
                    a.textBaseline = "top", {
                        canvas: n,
                        ctx: a
                    };
                }(o, t.background || "black"), h = p.ctx, g = dc(e, u);
                if (c = p.canvas, !h) throw new Error("This browser could not allocate the export canvas.");
                !function(e, t) {
                    const n = t.naturalWidth || 3600, i = t.naturalHeight || 3600;
                    e.drawImage(t, 0, 0, n, i, -3060, -3060, 9720, 9720);
                }(h, l);
                const m = t.background || "black";
                !function(e, t, n, i = "black", a = !1) {
                    const r = a ? String(Ji(wt[t] || "Profile")).replace(/\s+/g, " ").trim() || "Profile" : "Shared profile", o = a ? Uu(t) : "", s = "white" === i ? "#151816" : "#edf2ee", l = "#d7bd55", c = [ n && n.percentages ? n.percentages.green : 0, n && n.percentages ? n.percentages.yellow : 0, n && n.percentages ? n.percentages.red : 0 ];
                    e.save(), e.textBaseline = "top", e.textAlign = "left";
                    const d = "SEXCAPADES PROFILE";
                    e.font = "700 42px system-ui, sans-serif";
                    const u = e.measureText(d).width;
                    e.font = "700 88px system-ui, sans-serif";
                    const p = e.measureText(r).width;
                    e.font = "600 54px system-ui, sans-serif";
                    const h = o ? e.measureText("@" + o).width : 0, g = Math.max(u, p, h), m = Math.min(2e3, Math.max(900, Math.ceil(g + 430 + 96))), f = o ? 400 : 360;
                    e.beginPath(), Wu(e, 72, 72, m, f, 26), "transparent" !== i && (e.fillStyle = "rgba(13,17,15,.84)", 
                    e.fill()), e.strokeStyle = "rgba(99,112,104,.7)", e.lineWidth = 3, e.stroke();
                    const y = 120;
                    e.fillStyle = l, e.font = "700 42px system-ui, sans-serif", e.fillText(d, y, 106), 
                    e.fillStyle = s, e.font = "700 88px system-ui, sans-serif", "transparent" === i && (e.lineJoin = "round", 
                    e.strokeStyle = "rgba(17,21,19,.92)", e.lineWidth = 12, e.strokeText(r, y, 164)), 
                    eu(e, r, y, 164, m - 430 - 96, 94, 2), o && (e.fillStyle = l, e.font = "600 54px system-ui, sans-serif", 
                    e.fillText("@" + o, y, 368)), Gu(e, 72 + m - 215, 72 + f / 2, [ 128, 106, 84 ], c, [ "#63c796", "#d7bd55", "#e06f6a" ], "white" === i ? .16 : .26);
                    const b = a ? String(nt[t] || "").trim() : "";
                    if (b) {
                        e.font = "500 40px system-ui, sans-serif";
                        const t = Math.min(1600, m), n = 52, a = 36, r = 4, o = String(b).split(/\s+/), l = [];
                        let c = "";
                        o.forEach(n => {
                            const i = c ? c + " " + n : n;
                            e.measureText(i).width > t && c ? (l.push(c), c = n) : c = i;
                        }), c && l.push(c);
                        const d = l.slice(0, r), u = d.length * n + 1.4 * a, p = 72 + f + 24;
                        e.beginPath(), Wu(e, 72, p, m, u, 26), "transparent" !== i && (e.fillStyle = "rgba(13,17,15,.84)", 
                        e.fill()), e.strokeStyle = "rgba(99,112,104,.7)", e.lineWidth = 3, e.stroke(), e.textAlign = "left", 
                        e.textBaseline = "top", d.forEach((t, o) => {
                            const c = t + (o === r - 1 && l.length > r ? "…" : "");
                            "transparent" === i && (e.lineJoin = "round", e.strokeStyle = "rgba(17,21,19,.92)", 
                            e.lineWidth = 10, e.strokeText(c, y, p + .7 * a + o * n)), e.fillStyle = s, e.fillText(c, y, p + .7 * a + o * n);
                        });
                    }
                    e.restore();
                }(h, e, g, m, i), await s(58, "Preparing clean map", "Keeping the visible-map image free of QR overlays…"), 
                n && i && (dt[e] = d);
                const f = yx.serialize("envelope", {
                    bundleKind: "profile",
                    profiles: [ bx(e, u, i, "", a) ],
                    extra: n ? {
                        lowResolution: !0
                    } : {}
                }), y = i && Ov(ut[e]) ? zv(e) : "", b = n ? await async function(e, t, n = "", i = 2097152, a = null) {
                    let r = e, o = await ru(r, t, n, a);
                    for (;o.size > i && r.width > 960; ) {
                        a && await a(82, "Optimizing PNG size", "Reducing the compact image so it stays easy to share…");
                        const e = document.createElement("canvas"), i = .85;
                        e.width = Math.max(960, Math.round(r.width * i)), e.height = Math.round(r.height * e.width / r.width);
                        const s = e.getContext("2d");
                        s.imageSmoothingEnabled = !0, s.imageSmoothingQuality = "high", s.drawImage(r, 0, 0, e.width, e.height), 
                        r = e, o = await ru(r, t, n, a);
                    }
                    return o;
                }(c, f, y, 2097152, s) : await ru(c, f, y, s);
                return b.sexcapadesNodeIds = Array.from(u), b;
            } finally {
                l && (l.removeAttribute("src"), l.src = ""), c && (c.width = 1, c.height = 1), dt[e] !== r && (dt[e] = r, 
                Mr());
            }
        }
        function Qu(e, t, n = "") {
            // E4a (slug-gap design-away, 2026-10-22): every serialization
            // of a profile that leaves the app passes through here (full
            // profile, filtered export, share payload, Sync Card), and
            // topic data travels by canonical topic id (t####) only. Any
            // stored topic key still spelled as a slug — generated or
            // frozen-legacy — is rewritten to its id on the way out via
            // Vw (idk). Keys that are valid non-topic stored keys (cat-…,
            // subcategory-…, subtopic-… children) are not slug spellings
            // and keep their form.
            const idk = k => Vw[k] || k, i = e => Object.fromEntries(Object.entries(e || {}).map(([k, v]) => [ idk(k), v ]).filter(([e]) => t.has(e))), a = Object.fromEntries(Object.entries(vt[e] || {}).map(([k, v]) => [ idk(k), v ]).filter(([e]) => t.has(e))), r = function(e, t = null) {
                const n = {}, i = Ze[e] || {};
                return Object.entries(vt[e] || {}).forEach(([e, a]) => {
                    const k = idk(e);
                    if (t && !t.has(k)) return;
                    const r = "number" == typeof a ? [ "give", "receive" ] : [ "give", "receive" ].filter(e => a && "object" == typeof a && Object.prototype.hasOwnProperty.call(a, e));
                    r.length && (n[k] = {}, r.forEach(t => {
                        n[k][t] = "string" == typeof i[k]?.[t] ? i[k][t] : "string" == typeof i[e]?.[t] ? i[e][t] : "unknown";
                    }));
                }), n;
            }(e, t), o = i(Qe[e]), s = i(Je[e]), l = i(et[e]), c = i(tt[e]), d = i(at[e]), u = [], p = [], h = [], g = [], m = [], f = [];
            const out = (t.forEach(t => {
                if (!(qn[t] || Xn(t) || (at[e] || {})[t])) return;
                const n = ca(t, e), i = o[t];
                "favorite" === i && h.push(t), "limit" === i && g.push(t), s[t] && m.push(t), l[t] && f.push(t), 
                n.giveKnown && n.give > 35 || n.receiveKnown && n.receive > 35 ? u.push(t) : (n.giveKnown && n.give >= 0 || n.receiveKnown && n.receive >= 0) && p.push(t);
            }), {
                app: "sexcapades",
                version: 17,
                profileName: n || wt[e] || "Profile",
                profileUuid: profileUuids[e] || (profileUuids[e] = makeProfileUuid()),
                sampleProfile: Boolean(sampleProfileFlags[e]),
                gender: bb(rt[e]),
                pronouns: String(pz[e] || ""),
                sexuality: iv(ot[e]),
                roles: Gb(st[e]),
                age: Xv(lt[e]),
                location: Zv(ct[e]),
                photos: Yv(dt[e]),
                color: la(e),
                veil: av(vpt[e]),
                veilEnabled: Boolean(vht[e]),
                net: av(vpt[e]),
                netEnabled: Boolean(vht[e]),
                ratings: a,
                ratingSources: r,
                annotations: o,
                fantasyOnly: s,
                alreadyTried: l,
                notes: c,
                importedChildren: d,
                droppedKeys: (droppedKeyRecords[e] || []).slice(),
                importAttention: qw(e, t),
                completionTimes: St(mt[e]),
                contact: Ov(ut[e]) ? Rv(ut[e]) : void 0,
                aboutMe: String(nt[e] || ""),
                termsOfService: String(it[e] || ""),
                lists: {
                    favorites: h,
                    limits: g,
                    fantasies: m,
                    tried: f,
                    enthusiasticFor: u,
                    curiousAbout: p
                }
            });
            // E4a: the attention lists get the same travel-by-id
            // normalization, then the file is made self-describing:
            // "taxonomyVersion" names the catalog it was written
            // against, and "topicNames" records the current display
            // label of every topic id contained anywhere in the file
            // (ratings + side maps), so a future reader can interpret
            // the file by the sender's meanings even after a topic is
            // renamed or retired. Additive fields only — the profile
            // format version is unchanged and existing loaders ignore
            // unknown fields.
            const att = out.importAttention;
            att && (att.nodes = (att.nodes || []).map(idk), att.newest = (att.newest || []).map(idk));
            const contained = new Set;
            [ out.ratings, out.ratingSources, out.annotations, out.fantasyOnly, out.alreadyTried, out.notes ].forEach(map => {
                map && Object.keys(map).forEach(k => contained.add(k));
            }), att && [ ...(att.nodes || []), ...(att.newest || []) ].forEach(k => contained.add(k)), [ out.lists.favorites, out.lists.limits, out.lists.fantasies, out.lists.tried, out.lists.enthusiasticFor, out.lists.curiousAbout ].forEach(list => (list || []).forEach(k => contained.add(k)));
            const names = {};
            contained.forEach(k => {
                const label = topicLabelById[k];
                "string" == typeof label && label && (names[k] = label);
            }), out.taxonomyVersion = TAXONOMY_VERSION, out.topicNames = names;
            // Pair identity, INTERIM (split-center stage, 2026-10-27):
            // a pair profile's kind and operation ride in the profile
            // payload, so an exported or device-remembered pair still
            // says WHAT KIND of profile it is after the trip. This is
            // deliberately not a fuller identity scheme: the pair's
            // source identities do NOT ride along (flagged, not
            // built), so a restored pair cannot recompute or split
            // its center until its members are present again — the
            // import side restores exactly these two fields, as a
            // minimal pair record every compute path already guards
            // against (Rd, sxRefreshGroupOwn and Kd all require the
            // source snapshots this payload does not carry).
            const sxPairRec = ft[e];
            sxPairRec && "group" === sxPairRec.kind && (out.pairKind = "group", out.pairOp = "straight" === sxPairRec.pairOp ? "straight" : "bowtie");
            return out;
        }
        function Ju(e, t, n = !1, i = "", a = !1) {
            const r = Qu(e, t, n ? i || wt[e] || "Profile" : "Shared profile");
            if (a && (r.blind = !0), n) return r;
            // E4a: the share subset is self-describing too, with
            // topicNames restricted to the topics this subset carries.
            const names = {};
            return [ r.ratings, r.annotations, r.fantasyOnly, r.alreadyTried ].forEach(map => {
                map && Object.keys(map).forEach(k => {
                    const label = topicLabelById[k];
                    "string" == typeof label && label && (names[k] = label);
                });
            }), {
                app: r.app,
                version: r.version,
                taxonomyVersion: r.taxonomyVersion,
                topicNames: names,
                profileName: "Shared profile",
                ...a ? {
                    blind: !0
                } : {},
                ratings: r.ratings,
                annotations: r.annotations,
                fantasyOnly: r.fantasyOnly,
                alreadyTried: r.alreadyTried
            };
        }
        async function ep(e, n = {}) {
            const i = Boolean(n.includeProfileInfo), a = Boolean(n.blind), r = i ? Rv(ut[e]) : {}, o = i ? wt[e] || "Profile" : "Shared profile", s = n.background || "black", l = n.printFont ? "Georgia, serif" : "system-ui, sans-serif", c = "function" == typeof n.progress ? n.progress : async () => {};
            await c(7, "Rendering card hypermap", "Drawing the rated topics for the card front…");
            const d = await nu([ e ], e, {
                outputWidth: 1600,
                outputHeight: 1600,
                displayName: i ? Ji(wt[e]) || "Profile" : "Shared profile",
                background: s,
                allowedIds: n.allowedIds
            }), u = new Set(d.sexcapadesNodeIds || []), p = (() => {
                const e = document.createElement("canvas");
                return e.width = 2100, e.height = 1200, e;
            })(), h = p.getContext("2d");
            "transparent" !== s && (h.fillStyle = "white" === s ? "#ffffff" : "#151816", h.fillRect(0, 0, p.width, p.height));
            const g = "white" === s ? "#151816" : "#eff2ec", m = "white" === s ? "#4f5a53" : "#d7ded8", f = 936, y = 1128;
            h.save(), h.beginPath(), Wu(h, f, 36, y, y, 22), h.clip(), "transparent" !== s && (h.fillStyle = "white" === s ? "#ffffff" : "#202521", 
            h.fillRect(f, 36, y, y)), function(e, t, n, i, a, r, o = 1) {
                const s = t.naturalWidth || t.width, l = t.naturalHeight || t.height, c = a / r;
                let d = s, u = l;
                s / l > c ? d = l * c : u = s / c;
                const p = Math.max(1, Number(o) || 1);
                d /= p, u /= p;
                const h = (s - d) / 2, g = (l - u) / 2;
                e.drawImage(t, h, g, d, u, n, i, a, r);
            }(h, d, f, 36, y, y, 1.2), h.restore(), h.strokeStyle = "#59645d", h.lineWidth = 5, 
            h.strokeRect(f, 36, y, y), h.textBaseline = "top", h.fillStyle = "#d7bd55", h.font = `700 25px ${l}`, 
            h.fillText("SYNC CARD · FRONT", 72, 58), h.fillStyle = g, h.font = `700 56px ${l}`, 
            eu(h, o, 72, 98, 760, 62, 2), await c(28, "Building card front", "Creating the scan-to-import code…");
            const b = "https://sexcapades.io/#app/scan", v = await qu(b, 720);
            h.fillStyle = "#fff", h.fillRect(76, 236, 748, 748), h.imageSmoothingEnabled = !1, 
            h.drawImage(v, 100, 260, 700, 700), h.imageSmoothingEnabled = !0, h.textAlign = "center", 
            h.fillStyle = g, h.font = `700 32px ${l}`, h.fillText("Scan to import this card", 450, 996), 
            h.font = `600 24px ${l}`, h.fillStyle = m, h.fillText(b, 450, 1054);
            const w = yx.serialize("envelope", {
                bundleKind: "profile",
                profiles: [ vx(e, u, o, i, a) ]
            }), k = i && Ov(ut[e]) ? zv(e) : "";
            await c(40, "Encoding card front", "Preparing the front image…");
            const x = await ru(p, w, k);
            if (n.frontOnly) return d.removeAttribute("src"), d.src = "", window.lastExportSvgMarkup = null, 
            {
                front: x,
                back: null,
                payload: w,
                vcard: k
            };
            await c(52, "Building card back", "Preparing guide and profile codes…");
            const S = document.createElement("canvas");
            S.width = 1200, S.height = 2100;
            const $ = S.getContext("2d");
            $.fillStyle = "white" === s ? "#ffffff" : "#151816", "transparent" !== s && $.fillRect(0, 0, S.width, S.height), 
            $.textBaseline = "top", $.fillStyle = "#d7bd55", $.font = `700 25px ${l}`, $.fillText("SYNC CARD · BACK", 72, 54);
            const E = await qu(su, 720);
            $.fillStyle = "#fff", $.fillRect(60, 100, 444, 444), $.imageSmoothingEnabled = !1, 
            $.drawImage(E, 72, 112, 420, 420), $.imageSmoothingEnabled = !0, $.fillStyle = g, 
            $.font = `700 27px ${l}`, $.fillText("Syncing Sexcapades Guide", 72, 560), $.font = `500 19px ${l}`, 
            $.fillStyle = m, $.fillText(su, 72, 602);
            const A = Di(r);
            $.fillStyle = g, $.font = `700 30px ${l}`, $.fillText("Contact", 550, 112), $.font = `600 23px ${l}`;
            let C = 160;
            A.length ? A.forEach(e => {
                C = eu($, `${e.label}: ${e.user}`, 550, C, 578, 31, 2) + 9;
            }) : ($.fillStyle = m, $.font = `500 22px ${l}`, $.fillText("No contact details included.", 550, C));
            const M = function(e) {
                const t = chunkPayload(e, {
                    chunkCount: 2
                });
                if (ju(t, 18)) return {
                    parts: t,
                    size: 600,
                    columns: 1,
                    maxVersion: 18
                };
                const n = chunkPayload(e, {
                    chunkCount: 4
                });
                if (ju(n, 15)) return {
                    parts: n,
                    size: 450,
                    columns: 2,
                    maxVersion: 15
                };
                throw new Error(sxOversizeCardMessage(e.length));
            }(await Ru(e, u, i, a)), I = M.parts, P = [];
            for (let e = 0; e < I.length; e++) await c(58 + Math.round(22 * (e + 1) / I.length), "Building profile codes", `Creating profile code ${e + 1} of ${I.length}…`), 
            P.push(await qu(I[e], 900, {
                version: M.maxVersion,
                errorCorrectionLevel: "H"
            })), await new Promise(e => t.setTimeout(e, 0));
            const L = P.length, T = M.columns, F = Math.ceil(L / T), N = M.size, _ = 2 === L ? 0 : 48, D = N + 58, R = Math.max(650, Math.min(780, C + 34)), O = R + 56;
            $.fillStyle = g, $.textAlign = "left", $.font = `700 32px ${l}`, $.fillText("Profile data", 72, R), 
            $.fillStyle = m, $.font = `500 20px ${l}`, $.fillText(`Scan all ${L} numbered codes in any order.`, 280, R + 8), 
            P.forEach((e, t) => {
                const n = Math.floor(t / T), i = t % T, a = Math.min(T, L - n * T), r = a * N + (a - 1) * _, o = (S.width - r) / 2 + i * (N + _), s = O + n * D;
                $.fillStyle = "#fff", $.fillRect(o, s, N, N), $.imageSmoothingEnabled = !1, $.drawImage(e, o, s, N, N), 
                $.imageSmoothingEnabled = !0, $.textAlign = "center", $.fillStyle = g, $.font = `700 23px ${l}`, 
                $.fillText(`Profile data · ${t + 1} of ${L}`, o + N / 2, s + N + 17);
            });
            const B = Math.max(O + F * D + 20, R + 120);
            if (B <= 1980) {
                $.textAlign = "left", $.fillStyle = g, $.font = `700 32px ${l}`, $.fillText("Notes:", 72, B), 
                $.strokeStyle = "white" === s ? "rgba(21,24,22,.32)" : "rgba(237,242,238,.32)", 
                $.lineWidth = 2, $.setLineDash([ 5, 12 ]);
                for (let e = B + 72; e <= 2010; e += 88) $.beginPath(), $.moveTo(72, e), $.lineTo(1128, e), 
                $.stroke();
                $.setLineDash([]);
            }
            await c(86, "Encoding card back", "Preparing the back image…");
            const j = await ru(S, w, k);
            return d.removeAttribute("src"), d.src = "", window.lastExportSvgMarkup = null, 
            await c(96, "Finalizing Sync card", "Checking both finished images…"), {
                front: x,
                back: j,
                payload: w,
                vcard: k
            };
        }
        function tp(e, t = !1, n = "letter") {
            const i = "a4" == ("a4" === n ? "a4" : "letter") ? {
                width: 2480,
                height: 3508,
                label: "A4 compatible · 10 cards"
            } : {
                width: 2550,
                height: 3300,
                label: "Avery 5371 compatible · 10 cards · US Letter"
            }, a = document.createElement("canvas"), r = i.width, o = i.height, s = 1050, l = 600, c = Math.round((r - 2100) / 2), d = Math.round((o - 3e3) / 2);
            a.width = r, a.height = o;
            const u = a.getContext("2d", {
                alpha: !1
            });
            u.fillStyle = "#fff", u.fillRect(0, 0, r, o), u.imageSmoothingEnabled = !0, u.imageSmoothingQuality = "high";
            for (let n = 0; n < 5; n++) for (let i = 0; i < 2; i++) {
                const a = c + i * s, r = d + n * l;
                t ? (u.save(), u.translate(a + s, r), u.rotate(Math.PI / 2), u.drawImage(e, 0, 0, e.naturalWidth || 1200, e.naturalHeight || 2100, 0, 0, l, s), 
                u.restore()) : u.drawImage(e, 0, 0, e.naturalWidth || 2100, e.naturalHeight || 1200, a, r, s, l), 
                u.strokeStyle = "#777", u.lineWidth = 1, u.strokeRect(a + .5, r + .5, 1049, 599);
            }
            u.save(), u.fillStyle = "#111", u.textAlign = "center", u.textBaseline = "top", 
            u.font = "600 22px system-ui, sans-serif", u.fillText(`${i.label} · print at 100% / Actual Size`, r / 2, 42), 
            u.strokeStyle = "#111", u.lineWidth = 2, u.beginPath(), [ c, c + s, c + 2100 ].forEach(e => {
                u.moveTo(e, d - 34), u.lineTo(e, d), u.moveTo(e, d + 3e3), u.lineTo(e, d + 3e3 + 34);
            });
            for (let e = 0; e <= 5; e++) {
                const t = d + e * l;
                u.moveTo(c - 34, t), u.lineTo(c, t), u.moveTo(c + 2100, t), u.lineTo(c + 2100 + 34, t);
            }
            return u.stroke(), u.restore(), a;
        }
        function np(e, t = !1) {
            const n = String(e || "Profile").replace(/\s+/g, " ").trim() || "Profile";
            return t ? n : n.split(" ")[0] || "Profile";
        }
        function ip(e) {
            const t = String(e || "Profile").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, "-").replace(/^-+|-+$/g, "") || "Profile", n = t.toLowerCase();
            return {
                map: `Sexcapades-${t}-visible-map.png`,
                zoom: `Sexcapades-${t}-low-res-visible-map.png`,
                card: `Sexcapades-${t}-sync-card-front.png`,
                cardBack: `Sexcapades-${t}-sync-card-back.png`,
                cardSheet: `Sexcapades-${t}-10-up-sync-card-front-sheet.png`,
                cardBackSheet: `Sexcapades-${t}-10-up-sync-card-back-sheet.png`,
                fingerprint: `Sexcapades-${t}-kink-fingerprint.png`,
                qr: `${n}-qr.jpg`,
                json: `Sexcapades-${t}-profile.json`,
                pdf: `Sexcapades-${t}-visible-map.pdf`,
                svg: `Sexcapades-${t}-visible-map.svg`,
                svgz: `Sexcapades-${t}-visible-map.svgz`
            };
        }
        // P1 refactor (Build 2026-10-18_2227): ap (PDF export) split by
        // responsibility — apLoadAndPrep loads the PDF library, parses
        // and centre-crops the SVG and creates the document;
        // apEmbedMetadata embeds the serialized profile; apInlineStyles
        // resolves computed styles onto the export clone; apDrawLabels
        // redraws the curved map labels as native PDF text; apQrImages
        // builds the sync QR images; apHeaderCard draws the profile
        // header card. ap itself is now a thin orchestrator.
