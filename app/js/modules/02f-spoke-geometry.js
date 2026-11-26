        function sxPaintSpoke(e, t, n, i, a, r, o, s, l, c, d, u = 48, p = Ga.FALLBACK_COLOR, g = !0, m = "", f = null, y = null, b = null, v = !1, w = !0, k = h.length, bc = null, sxLeafD = null, sxDepth = null) {
            if (sxSexSkin()) v = !0;
            if (typeof sxFilterBucket === "function") sxFilterBucket(e); else if (typeof window !== "undefined" && typeof window.__SX_RA === "function") window.__SX_RA(e);
            const sxIsBlind = () => (typeof Rt !== "undefined" ? Boolean(Rt) : (typeof window !== "undefined" && Boolean(window.__SX_BLIND)));
            const sxD = null != sxDepth ? sxDepth : sxLeafD === sxIconDiameter(1) ? 1 : sxLeafD === sxIconDiameter(3) ? 3 : 2, sxF = sxFontFactor(sxD), sxSW = sxStrokeWidth(sxD);
            const x = sxIsBlind() || sxComparisonActive() ? null : sxActiveProfileId(), S = sxIsBlind() ? null : x || function(e) {
                const t = sxActiveProfileId();
                return sxComparisonActive() && t && (at[t] || {})[e] && gn.has(sxMakeProfileNodeKey(t, e)) ? t : null;
            }(e), $ = sxWidgetConfig(e, S || sxActiveProfileId()), E = e => `translate(${(a * e).toFixed(2)} ${(r * e).toFixed(2)})`, A = e.replace(/[^a-z0-9-]/g, ""), C = Boolean(topicLabelById[e]), M = S || sxActiveProfileId(), I = sxNodeRegistry[e] || sxNodeById(e) || {
                id: e,
                label: i,
                branch: i,
                kind: C ? "Topic" : "Category"
            }, P = (sxDescribeRatingText(e, I, M), sxRatingRecord(e, M)), L = sxFlankText(e, "give", M), T = sxFlankText(e, "receive", M), F = sxTopicTooltipAttrs(e, I, M);
            const stemValGive = typeof sxSpokeStemRatingValue === "function" ? sxSpokeStemRatingValue(P, "give") : (P.giveKnown ? sxSignedNumber(P.give) : "Unrated");
            const stemValReceive = typeof sxSpokeStemRatingValue === "function" ? sxSpokeStemRatingValue(P, "receive") : (P.receiveKnown ? sxSignedNumber(P.receive) : "Unrated");
            const N = sxTooltipAttrs(i, L, stemValGive, { tapFirst: !0 }), _ = sxTooltipAttrs(i, T, stemValReceive, { tapFirst: !0 });
            let D = "";
            const sxShowMapSliders = Boolean(mn && mn.mapSliders);
            const sxZoomOk = "function" !== typeof window.sxMapZoomAllowsWidgets || window.sxMapZoomAllowsWidgets();
            const R = g && !sxIsBlind() ? sxSharedCountColor(e) : null, O = Ga.heatWidths(n, sxD);
            if (SpokeGeometry.taperedPath(t, O.w0, O.w1), R) {
                const overlayTip = "Overlaid profiles into this topic", a = `${R.count}/${R.total}`;
                D += `<path class="group-heat${R.count === R.total ? " all-in" : ""}" d="${t}" stroke="${R.color}" stroke-width="${O.w0}" opacity="${(.2 + .48 * R.count / R.total).toFixed(2)}" tabindex="0" role="img" aria-label="${sxEscapeHtmlText(`${i}: ${a} overlaid profiles into this topic`)}"${sxTooltipAttrs(i, overlayTip, a, {
                    hoverOnly: !1
                })}/>`;
            }
            selectionMarkKind(e, Lt, Lt ? sxNodeRegistry[Lt] || sxNodeById(Lt) || (at[sxActiveProfileId()] || {})[Lt] : null) && (D += `<path class="selected-spoke" d="${t}" style="stroke-width:${9 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`);
            const B = m ? ` ${m}` : "", j = Math.hypot(o - pr.centerX, s - pr.centerY), q = Ga.railsBaseWidth(e, n, j, k, sxD), H = Ga.tipWidth(n);
            const tipCircle = SpokeGeometry.buildTipCircle(o, s, l, c, null != sxLeafD ? sxLeafD : u * mapFontScale());
            const isTripleTopic = Boolean($.keys && $.keys.length === 3);
            let middleVal = null;
            let middleKnown = false;
            if (isTripleTopic) {
                const midKey = $.keys[1];
                middleKnown = Boolean(P && P[midKey + "Known"]);
                if (middleKnown) middleVal = P[midKey];
            }
            const midColor = isTripleTopic && middleKnown ? sxInterestColor(middleVal) : (b || p || Ga.FALLBACK_COLOR);
            let W = "";
            if (w) if (w && f && y) {
                const seg = Ga.segment(o, s, l, c), i = sxSW, a = Ga.splitInnerHalf(n, sxD), d = midColor, u = Ga.midlineOutlinePath(t, n, v, sxD);
                const fs = typeof sxFontSize === "function" ? sxFontSize(sxD) : 14;
                const nameW = typeof Za !== "undefined" && Za.measure ? Za.measure(I.label || "", fs, "topic") : ((I.label || "").length * 7);
                const r = SpokeGeometry.flankPaths(o, s, seg.dx, seg.dy, seg.nx, seg.ny, q, H, a, a, "innerFirst", bc, tipCircle, nameW);
                W = `<path class="tapered-stem${B}" d="${r.top}" fill="${f}" stroke="none" style="fill:${f}"${N}/><path class="tapered-stem${B}" d="${r.bottom}" fill="${y}" stroke="none" style="fill:${y}"${_}/>` + (v ? `<path class="hanky-midline hanky-none" d="${t}" fill="none" stroke="${Ga.FALLBACK_COLOR}" stroke-width="${i}" stroke-linecap="butt"${Ga.dashAttr(i)} opacity="0.85"${F}/>` : u + `<path class="hanky-midline" d="${t}" fill="none" stroke="${d}" stroke-width="${i}" stroke-linecap="butt" opacity="0.9"${F}/>`);
            } else {
                const taperedD = SpokeGeometry.taperedPath(t, q, H, tipCircle, bc), i = sxSW, a = isTripleTopic && middleKnown ? sxInterestColor(middleVal) : (v ? Ga.FALLBACK_COLOR : b || p || Ga.FALLBACK_COLOR), r = v ? Ga.dashAttr(i) : "";
                W = `<path class="tapered-stem${B}" d="${taperedD}" fill="${p}" stroke="none" style="fill:${p}"/><path class="hanky-midline" d="${t}" fill="none" stroke="${a}" stroke-width="${i}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            } else {
                const stemW = 1.3 * (n || 8), i = isTripleTopic && middleKnown ? sxInterestColor(middleVal) : (v ? Ga.NO_CODE_COLOR : b || p || Ga.NO_CODE_COLOR), a = Ga.midlineOutlinePath(t, n, v, sxD), r = v ? Ga.dashAttr(stemW) : "";
                W = a + `<path class="hanky-midline" d="${t}" fill="none" stroke="${i}" stroke-width="${sxSW}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            }
            if (D += W, D += `<path class="topic-pulse${B}${v ? " hanky-none" : ""}" d="${t}" stroke="${p}" style="stroke-width:${5 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`, 
            D += `<path class="concept-hit" data-id="${e}" data-nx="${a.toFixed(5)}" data-ny="${r.toFixed(5)}"${sxTopicTooltipAttrs(e, I, M)} d="${t}" tabindex="0" role="button" aria-label="${sxEscapeHtmlText(i)} concept line"/>`, 
            g && x && !d && sxShowMapSliders) {
                const n = sxRatingRecord(e, x);
                ($.single ? [ {
                    key: "give",
                    offset: 0
                } ] : $.keys && $.keys.length === 3 ? [ {
                    key: $.keys[0],
                    offset: -6
                }, {
                    key: $.keys[1],
                    offset: 0
                }, {
                    key: $.keys[2],
                    offset: 6
                } ] : [ {
                    key: "give",
                    offset: -5
                }, {
                    key: "receive",
                    offset: 5
                } ]).forEach((e, i) => {
                    if (!n[e.key + "Known"]) return;
                    const a = n[e.key], r = $.labels[i] || e.key, o = n[e.key + "Derived"] ? ` · rolled up from ${n[e.key + "RatedChildren"]} of ${n.childCount} child topics` : "";
                    D += `<path class="visual-rail collapsed-rating-rail" d="${t}" transform="${E(e.offset)}" fill="none" stroke="${sxInterestColor(a)}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${r}: ${Math.round(a)}${o}</title></path>`;
                });
            }
            if (g && !sxIsBlind() && sxComparisonActive() && 2 === sxScoringProfileIds().length) {
                const n = function(e) {
                    const t = sxScoringProfileIds();
                    if (t.some(t => "limit" === sxAnnotationState(e, t))) return "limit";
                    if (t.some(t => "favorite" === sxAnnotationState(e, t))) return "favorite";
                    const r = sxPairByIds(t[0], t[1]), rec = r && r.topicsById[e];
                    if (!rec) return "other";
                    return "match" === rec.outcome ? "mutual" : rec.mutualNo ? "disinterest" : "other";
                }(e), i = {
                    mutual: "mutual-halo",
                    disinterest: "disinterest-halo",
                    favorite: "favorite-halo",
                    limit: "limit-halo"
                }[n];
                i && (D += `<path class="${i}" d="${t}"/>`);
            }
            const U = S && "group" === ft[S]?.kind ? ft[S].matchDetails?.[e] : null;
            if (g && S && d && U) {
                const t = l - o, n = c - s, i = (Math.hypot(t, n), 180 * Math.atan2(n, t) / Math.PI), a = sxControlScale(sxD, u), r = function(e) {
                    if (!e) return "";
                    const t = Array.isArray(e.routes) ? e.routes : [];
                    return 1 === t.length ? `${Math.round(e.score)}% · ${sxDirectedPairText(t[0])}` : `${Math.round(e.score)}% · ${t.length} matched routes`;
                }(U), d = (U.routes || []).map(e => `${sxDirectedPairText(e, !0)}; combined ${Math.round(e.score)}%`).join(" · "), p = Za.controlTagWidth(r, "group") * a, h = 24 * a, g = l, m = c;
                D += `<g class="direction-control group-match-control" data-id="${e}" data-direction="group" data-base-cx="${g}" data-base-cy="${m}" data-base-angle="${i}" data-index="0" data-tag-width="${p}" data-tag-height="${h}" data-control-scale="${a}" role="img" tabindex="0" aria-label="Combined match ${Math.round(U.score)} percent. ${sxEscapeHtmlText(d)}"><title>Combined match ${Math.round(U.score)}%. ${sxEscapeHtmlText(d)}</title><rect class="direction-tag-bg" x="${(g - p / 2).toFixed(2)}" y="${(m - h / 2).toFixed(2)}" width="${p.toFixed(2)}" height="${h.toFixed(2)}" rx="${6 * a}" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" fill="${sxInterestColor(U.score)}"/><text class="direction-tag" x="${g.toFixed(2)}" y="${m.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" textLength="${Math.max(50, p - 12 * a).toFixed(2)}" lengthAdjust="spacing" style="font-size:${5.5 * a}px">${sxEscapeHtmlText(r)}</text></g>`;
            } else if (g && S && d && sxShowMapSliders && !sxZoomOk) {
                // Zoom gate (Jason, 2026-11-22): below the reasonable
                // zoom the full on-map widget is too small to hit
                // accurately, so show a readout chip instead - the
                // rating itself (strongest poles per placement) -
                // and let a click open the full widget in the popup.
                const t = sxRatingRecord(e, S), n = l - o, i = c - s, dd = Math.hypot(n, i) || 1, p = n / dd, h = i / dd, m = sxControlScale(sxD, u), f = $.keys || [], y = $.labels || [];
                const strongest = obj => {
                    if (!obj) return null;
                    let best = null;
                    f.forEach((k, ix) => {
                        if (null == obj[k]) return;
                        if (!best || Math.abs(obj[k]) > Math.abs(best.v)) best = { label: y[ix] || k, v: obj[k] };
                    });
                    return best;
                };
                const dual = "function" === typeof sxDualPlacements && sxDualPlacements(e);
                const advObj = dual ? (t.advocacy || t.givePlacement) : null, recObj = dual ? (t.receptivity || t.receivePlacement) : null;
                let chipText = "", chipFill = Ga.NO_CODE_COLOR, chipRated = !1;
                if (advObj || recObj) {
                    const aB = strongest(advObj), rB = strongest(recObj), aName = dual && window.__SX_ACTIVE_SKIN && "sexcapades" === window.__SX_ACTIVE_SKIN ? "Give" : "Adv", rName = aName === "Give" ? "Receive" : "Rec";
                    const parts = [];
                    if (aB) parts.push(`${aName} ${aB.label} ${Math.round(aB.v)}`);
                    if (rB) parts.push(`${rName} ${rB.label} ${Math.round(rB.v)}`);
                    chipText = parts.length ? parts.join(" \u00b7 ") : "Unrated";
                    const top = aB && rB ? (Math.abs(aB.v) >= Math.abs(rB.v) ? aB : rB) : aB || rB;
                    if (top) chipFill = sxInterestColor(top.v), chipRated = !0;
                } else if (!$.single && 2 === f.length && "give" === f[0] && "receive" === f[1]) {
                    const parts = [];
                    if (t.giveKnown) parts.push(`Give ${Math.round(t.give)}`);
                    if (t.receiveKnown) parts.push(`Receive ${Math.round(t.receive)}`);
                    chipText = parts.length ? parts.join(" \u00b7 ") : "Unrated";
                    if (parts.length) {
                        // Chip fill is the appetite, not the leaning
                        // (ruling 2026-11-23): each flank's stored
                        // per-flank intensity first, the leaning itself
                        // as the derivation when unstored; the strongest
                        // appetite wins the single fill. The text keeps
                        // showing the leanings -- that is the rating.
                        const gApp = t.giveIntensityKnown ? t.giveIntensity : (t.giveKnown ? t.give : null);
                        const rApp = t.receiveIntensityKnown ? t.receiveIntensity : (t.receiveKnown ? t.receive : null);
                        const topApp = null != gApp && (null == rApp || Math.abs(gApp) >= Math.abs(rApp)) ? gApp : rApp;
                        chipFill = null != topApp ? sxInterestColor(topApp) : Ga.NO_CODE_COLOR, chipRated = !0;
                    }
                } else if (f.length >= 2 && !$.single) {
                    const b = strongest(t);
                    if (b) chipText = `${b.label} ${Math.round(b.v)}`, chipFill = sxInterestColor(b.v), chipRated = !0;
                    else chipText = "Unrated";
                } else if ($.single || t.giveKnown) {
                    chipText = `${Math.round(t.give || 0)}`, chipFill = sxInterestColor(t.give || 0), chipRated = !0;
                } else chipText = "Unrated";
                const chipW = Za.controlTagWidth(chipText, "pair") * m, chipH = 24 * m, iconR = (null != sxLeafD ? sxLeafD : u * mapFontScale()) / 2, gx = l + p * (iconR + chipH / 2 + 6 * m), gy = c + h * (iconR + chipH / 2 + 6 * m), rot = (180 * Math.atan2(h, p) / Math.PI).toFixed(2);
                D += `<g class="direction-control map-readout-chip" data-id="${e}" role="button" tabindex="0" aria-label="${sxEscapeHtmlText(`${I.label || e}: ${chipText}. Activate to open the full rating widget.`)}"><title>${sxEscapeHtmlText(chipText)}</title><rect class="direction-tag-bg" x="${(gx - chipW / 2).toFixed(2)}" y="${(gy - chipH / 2).toFixed(2)}" width="${chipW.toFixed(2)}" height="${chipH.toFixed(2)}" rx="${(6 * m).toFixed(2)}" transform="rotate(${rot} ${gx.toFixed(2)} ${gy.toFixed(2)})" fill="${chipFill}"/><text class="direction-tag" x="${gx.toFixed(2)}" y="${gy.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rot} ${gx.toFixed(2)} ${gy.toFixed(2)})" textLength="${Math.max(30, chipW - 12 * m).toFixed(2)}" lengthAdjust="spacing" style="font-size:${(5.5 * m).toFixed(2)}px">${sxEscapeHtmlText(chipText)}</text></g>`;
            } else if (g && S && d && sxShowMapSliders) {
                const t = sxRatingRecord(e, S), n = l - o, i = c - s, d = Math.hypot(n, i), p = n / d, h = i / d, g = 180 * Math.atan2(i, n) / Math.PI, m = sxControlScale(sxD, u), f = $.keys, y = $.labels, b = !$.single && "give" === y[0] && "receive" === y[1], v = e => Za.controlTagWidth(e, "pair") * m, w = {};
                // On-map pole tips (Build 2026-11-18): each pole label
                // carries the exact pole line the placard shows for the
                // same pole (same helper), so the shared tooltip popup
                // shows byte-identical text on the map and the placard.
                // Labels are focusable so keyboard focus shows the tip too.
                const sxPoleTipAttrs = k => {
                    const tip = (typeof sxPoleLine === "function") ? sxPoleLine(e, f[k]) : null;
                    return (tip ? ` data-ui-tooltip="${sxEscapeHtmlText(tip)}" data-tooltip-name="${sxEscapeHtmlText(y[k] || f[k])}" data-tooltip-tap-first` : "") + ` tabindex="0"`;
                };
                if ($.octad) {
                    // 8-Pole Octad Widget on Hypermap:
                    // Regular octagon deformation polygon
                    const iconR = (null != sxLeafD ? sxLeafD : u * mapFontScale()) / 2;
                    const spanW = 68 * m;
                    const dCenter = iconR + spanW / 2 + 4 * m;
                    const cx = l + p * dCenter, cy = c + h * dCenter;
                    const r = spanW / 2;
                    const baseAngle = Math.atan2(h, p); // Top pole points outward radially along spoke

                    // 8 vertices (45 deg = PI / 4 step)
                    const P = [];
                    for (let k = 0; k < 8; k++) {
                        const phi = baseAngle - Math.PI / 2 + k * (Math.PI / 4);
                        P.push({ x: cx + r * Math.cos(phi), y: cy + r * Math.sin(phi), phi });
                    }

                    const ratings = f.map(k => (t[k + "Known"] ? t[k] : 0));
                    const isKnown = f.some(k => Boolean(t[k + "Known"]));
                    const maxR = sxSignedIntensity(ratings);
                    const maxAbsR = Math.max(...ratings.map(v => Math.abs(v)));
                    const fillCol = isKnown ? sxInterestColor(maxR) : "rgba(103, 232, 249, 0.45)";

                    const S = P.map((pt, k) => {
                        const dk = maxAbsR > 0 ? Math.abs(ratings[k]) / maxAbsR : 0;
                        return { x: cx + (pt.x - cx) * dk, y: cy + (pt.y - cy) * dk };
                    });

                    const isAct = Boolean(Nt && Nt.id === e);
                    const actCls = isAct ? " active-rating" : "";
                    const ariaTxt = isKnown ? f.map((k, i) => `${y[i] || k}: ${Math.round(ratings[i])}`).join(", ") : "Unrated";

                    D += `<g class="direction-control map-octad-control${actCls}" data-id="${e}" data-direction="octad" data-base-cx="${cx.toFixed(1)}" data-base-cy="${cy.toFixed(1)}" data-control-scale="${m}" data-tag-width="${spanW.toFixed(1)}" data-tag-height="${spanW.toFixed(1)}">`;
                    // Reference octagon outline
                    const polyRef = P.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                    D += `<polygon points="${polyRef}" fill="rgba(15,23,42,0.4)" stroke="rgba(255,255,255,0.3)" stroke-width="${1.2 * m}"/>`;
                    // Radial axes
                    P.forEach(pt => {
                        D += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" stroke="rgba(255,255,255,0.25)" stroke-dasharray="2,2" stroke-width="${0.8 * m}"/>`;
                    });
                    // Deformed Polygon
                    const polyPts = S.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                    D += `<polygon points="${polyPts}" fill="${fillCol}" fill-opacity="0.45" stroke="#ffffff" stroke-width="${1.8 * m}"/>`;
                    // Vertex dots
                    const octCols = ["#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"];
                    S.forEach((pt, k) => {
                        D += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${3.5 * m}" fill="${octCols[k]}" stroke="#ffffff" stroke-width="${1 * m}"/>`;
                    });
                    // Hit Target first: pole labels paint on top so they stay hoverable for their tips.
                    // Hit Target
                    D += `<polygon class="direction-hit map-octad-hit" data-id="${e}" data-direction="octad" points="${polyRef}" fill="transparent" cursor="pointer" role="slider" aria-label="${e}, Octad 8-pole dynamic. ${ariaTxt}. Drag a vertex to set that pole." tabindex="0"><title>${e} (Octad): ${ariaTxt}</title></polygon>`;
                    // Labels
                    P.forEach((pt, k) => {
                        const lx = pt.x + (pt.x - cx) * 0.28;
                        const ly = pt.y + (pt.y - cy) * 0.28;
                        D += `<text class="map-octad-label"${sxPoleTipAttrs(k)} x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="${octCols[k]}" style="font-size:${5 * m}px;font-weight:700;">${(y[k] || f[k]).slice(0, 10)}</text>`;
                    });
                    D += `</g>`;
                } else if ($.heptad) {
                    // 7-Pole Heptad Widget on Hypermap:
                    // Regular heptagon deformation polygon
                    const iconR = (null != sxLeafD ? sxLeafD : u * mapFontScale()) / 2;
                    const spanW = 64 * m;
                    const dCenter = iconR + spanW / 2 + 4 * m;
                    const cx = l + p * dCenter, cy = c + h * dCenter;
                    const r = spanW / 2;
                    const baseAngle = Math.atan2(h, p); // Top pole points outward radially along spoke

                    // 7 vertices
                    const P = [];
                    for (let k = 0; k < 7; k++) {
                        const phi = baseAngle - Math.PI / 2 + k * (2 * Math.PI / 7);
                        P.push({ x: cx + r * Math.cos(phi), y: cy + r * Math.sin(phi), phi });
                    }

                    const ratings = f.map(k => (t[k + "Known"] ? t[k] : 0));
                    const isKnown = f.some(k => Boolean(t[k + "Known"]));
                    const maxR = sxSignedIntensity(ratings);
                    const maxAbsR = Math.max(...ratings.map(v => Math.abs(v)));
                    const fillCol = isKnown ? sxInterestColor(maxR) : "rgba(103, 232, 249, 0.45)";

                    const S = P.map((pt, k) => {
                        const dk = maxAbsR > 0 ? Math.abs(ratings[k]) / maxAbsR : 0;
                        return { x: cx + (pt.x - cx) * dk, y: cy + (pt.y - cy) * dk };
                    });

                    const isAct = Boolean(Nt && Nt.id === e);
                    const actCls = isAct ? " active-rating" : "";
                    const ariaTxt = isKnown ? f.map((k, i) => `${y[i] || k}: ${Math.round(ratings[i])}`).join(", ") : "Unrated";

                    D += `<g class="direction-control map-heptad-control${actCls}" data-id="${e}" data-direction="heptad" data-base-cx="${cx.toFixed(1)}" data-base-cy="${cy.toFixed(1)}" data-control-scale="${m}" data-tag-width="${spanW.toFixed(1)}" data-tag-height="${spanW.toFixed(1)}">`;
                    // Reference heptagon outline
                    const polyRef = P.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                    D += `<polygon points="${polyRef}" fill="rgba(15,23,42,0.4)" stroke="rgba(255,255,255,0.3)" stroke-width="${1.2 * m}"/>`;
                    // Radial axes
                    P.forEach(pt => {
                        D += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" stroke="rgba(255,255,255,0.25)" stroke-dasharray="2,2" stroke-width="${0.8 * m}"/>`;
                    });
                    // Deformed Polygon
                    const polyPts = S.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                    D += `<polygon points="${polyPts}" fill="${fillCol}" fill-opacity="0.45" stroke="#ffffff" stroke-width="${1.8 * m}"/>`;
                    // Vertex dots
                    const heptCols = ["#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"];
                    S.forEach((pt, k) => {
                        D += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${3.5 * m}" fill="${heptCols[k]}" stroke="#ffffff" stroke-width="${1 * m}"/>`;
                    });
                    // Hit Target first: pole labels paint on top so they stay hoverable for their tips.
                    // Hit Target
                    D += `<polygon class="direction-hit map-heptad-hit" data-id="${e}" data-direction="heptad" points="${polyRef}" fill="transparent" cursor="pointer" role="slider" aria-label="${e}, Heptad 7-pole dynamic. ${ariaTxt}. Drag a vertex to set that pole." tabindex="0"><title>${e} (Heptad): ${ariaTxt}</title></polygon>`;
                    // Labels
                    P.forEach((pt, k) => {
                        const lx = pt.x + (pt.x - cx) * 0.28;
                        const ly = pt.y + (pt.y - cy) * 0.28;
                        D += `<text class="map-heptad-label"${sxPoleTipAttrs(k)} x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="${heptCols[k]}" style="font-size:${5.2 * m}px;font-weight:700;">${(y[k] || f[k]).slice(0, 10)}</text>`;
                    });
                    D += `</g>`;
                } else if ($.hexad) {
                    // 6-Pole Hexad Widget on Hypermap:
                    // Regular hexagon deformation polygon
                    const iconR = (null != sxLeafD ? sxLeafD : u * mapFontScale()) / 2;
                    const spanW = 60 * m;
                    const dCenter = iconR + spanW / 2 + 4 * m;
                    const cx = l + p * dCenter, cy = c + h * dCenter;
                    const r = spanW / 2;
                    const baseAngle = Math.atan2(h, p); // Top pole points outward radially along spoke

                    // 6 vertices
                    const P = [];
                    for (let k = 0; k < 6; k++) {
                        const phi = baseAngle - Math.PI / 2 + k * (Math.PI / 3);
                        P.push({ x: cx + r * Math.cos(phi), y: cy + r * Math.sin(phi), phi });
                    }

                    const ratings = f.map(k => (t[k + "Known"] ? t[k] : 0));
                    const isKnown = f.some(k => Boolean(t[k + "Known"]));
                    const maxR = sxSignedIntensity(ratings);
                    const maxAbsR = Math.max(...ratings.map(v => Math.abs(v)));
                    const fillCol = isKnown ? sxInterestColor(maxR) : "rgba(103, 232, 249, 0.45)";

                    const S = P.map((pt, k) => {
                        const dk = maxAbsR > 0 ? Math.abs(ratings[k]) / maxAbsR : 0;
                        return { x: cx + (pt.x - cx) * dk, y: cy + (pt.y - cy) * dk };
                    });

                    const isAct = Boolean(Nt && Nt.id === e);
                    const actCls = isAct ? " active-rating" : "";
                    const ariaTxt = isKnown ? f.map((k, i) => `${y[i] || k}: ${Math.round(ratings[i])}`).join(", ") : "Unrated";

                    D += `<g class="direction-control map-hexad-control${actCls}" data-id="${e}" data-direction="hexad" data-base-cx="${cx.toFixed(1)}" data-base-cy="${cy.toFixed(1)}" data-control-scale="${m}" data-tag-width="${spanW.toFixed(1)}" data-tag-height="${spanW.toFixed(1)}">`;
                    // Reference hexagon outline
                    const polyRef = P.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                    D += `<polygon points="${polyRef}" fill="rgba(15,23,42,0.4)" stroke="rgba(255,255,255,0.3)" stroke-width="${1.2 * m}"/>`;
                    // Radial axes
                    P.forEach(pt => {
                        D += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" stroke="rgba(255,255,255,0.25)" stroke-dasharray="2,2" stroke-width="${0.8 * m}"/>`;
                    });
                    // Deformed Polygon
                    const polyPts = S.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                    D += `<polygon points="${polyPts}" fill="${fillCol}" fill-opacity="0.45" stroke="#ffffff" stroke-width="${1.8 * m}"/>`;
                    // Vertex dots
                    const hexCols = ["#22c55e", "#06b6d4", "#6366f1", "#ef4444", "#f97316", "#eab308"];
                    S.forEach((pt, k) => {
                        D += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${3.5 * m}" fill="${hexCols[k]}" stroke="#ffffff" stroke-width="${1 * m}"/>`;
                    });
                    // Hit Target first: pole labels paint on top so they stay hoverable for their tips.
                    // Hit Target
                    D += `<polygon class="direction-hit map-hexad-hit" data-id="${e}" data-direction="hexad" points="${polyRef}" fill="transparent" cursor="pointer" role="slider" aria-label="${e}, Hexad 6-pole dynamic. ${ariaTxt}. Drag a vertex to set that pole." tabindex="0"><title>${e} (Hexad): ${ariaTxt}</title></polygon>`;
                    // Labels
                    P.forEach((pt, k) => {
                        const lx = pt.x + (pt.x - cx) * 0.28;
                        const ly = pt.y + (pt.y - cy) * 0.28;
                        D += `<text class="map-hexad-label"${sxPoleTipAttrs(k)} x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="${hexCols[k]}" style="font-size:${5.5 * m}px;font-weight:700;">${(y[k] || f[k]).slice(0, 10)}</text>`;
                    });
                    D += `</g>`;
                } else if ($.pentad) {
                    // 5-Pole Pentad Widget on Hypermap:
                    // Regular pentagon / star deformation polygon
                    const iconR = (null != sxLeafD ? sxLeafD : u * mapFontScale()) / 2;
                    const spanW = 56 * m;
                    const dCenter = iconR + spanW / 2 + 4 * m;
                    const cx = l + p * dCenter, cy = c + h * dCenter;
                    const r = spanW / 2;
                    const baseAngle = Math.atan2(h, p); // Top pole points outward radially along spoke

                    // 5 vertices
                    const P = [];
                    for (let k = 0; k < 5; k++) {
                        const phi = baseAngle - Math.PI / 2 + k * (2 * Math.PI / 5);
                        P.push({ x: cx + r * Math.cos(phi), y: cy + r * Math.sin(phi), phi });
                    }

                    const ratings = f.map(k => (t[k + "Known"] ? t[k] : 0));
                    const isKnown = f.some(k => Boolean(t[k + "Known"]));
                    const maxR = sxSignedIntensity(ratings);
                    const maxAbsR = Math.max(...ratings.map(v => Math.abs(v)));
                    const fillCol = isKnown ? sxInterestColor(maxR) : "rgba(103, 232, 249, 0.45)";

                    const S = P.map((pt, k) => {
                        const dk = maxAbsR > 0 ? Math.abs(ratings[k]) / maxAbsR : 0;
                        return { x: cx + (pt.x - cx) * dk, y: cy + (pt.y - cy) * dk };
                    });

                    const isAct = Boolean(Nt && Nt.id === e);
                    const actCls = isAct ? " active-rating" : "";
                    const ariaTxt = isKnown ? f.map((k, i) => `${y[i] || k}: ${Math.round(ratings[i])}`).join(", ") : "Unrated";

                    D += `<g class="direction-control map-pentad-control${actCls}" data-id="${e}" data-direction="pentad" data-base-cx="${cx.toFixed(1)}" data-base-cy="${cy.toFixed(1)}" data-control-scale="${m}" data-tag-width="${spanW.toFixed(1)}" data-tag-height="${spanW.toFixed(1)}">`;
                    // Reference pentagon outline
                    const polyRef = P.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                    D += `<polygon points="${polyRef}" fill="rgba(15,23,42,0.4)" stroke="rgba(255,255,255,0.3)" stroke-width="${1.2 * m}"/>`;
                    // Radial axes
                    P.forEach(pt => {
                        D += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" stroke="rgba(255,255,255,0.2)" stroke-width="${1 * m}" stroke-dasharray="${2 * m},${2 * m}"/>`;
                    });
                    // Deformed polygon
                    if (isKnown && ratings.some(val => val > 0)) {
                        const polyDef = S.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
                        D += `<polygon points="${polyDef}" fill="${fillCol}" fill-opacity="0.55" stroke="#ffffff" stroke-width="${1.4 * m}"/>`;
                    }
                    // Pole dots (Purple, Cyan, Amber, Red, Green)
                    const pentColors = ["#a855f7", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e"];
                    P.forEach((pt, k) => {
                        D += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${3 * m}" fill="${pentColors[k]}" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    });
                    // Hit Target first: pole labels paint on top so they stay hoverable for their tips.
                    // Hit polygon
                    D += `<polygon class="direction-hit map-pentad-hit" data-id="${e}" data-direction="pentad" points="${polyRef}" fill="transparent" pointer-events="all" style="cursor:crosshair" role="slider" aria-label="${sxEscapeHtmlText(y.join(' / '))}: ${ariaTxt}. Drag a vertex to set that pole." tabindex="0"/>`;
                    // Pole labels
                    P.forEach((pt, k) => {
                        const lx = pt.x + Math.cos(pt.phi) * 8 * m;
                        const ly = pt.y + Math.sin(pt.phi) * 8 * m;
                        D += `<text class="map-pentad-label"${sxPoleTipAttrs(k)} x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${6.5 * m}px" font-weight="700" fill="${pentColors[k]}">${sxEscapeHtmlText(y[k] || f[k])}</text>`;
                    });
                    D += `</g>`;
                } else if ($.tetrad) {
                    // 4-Pole Tetrad Widget on Hypermap:
                    // If archetype === "diamond" (Type II multi-affinity): Radar / Diamond Deformation Polygon
                    // If archetype === "quad" or "simplex": 4-Pole Square/Cross Continuum
                    const iconR = (null != sxLeafD ? sxLeafD : u * mapFontScale()) / 2;
                    const spanW = 54 * m;
                    const dCenter = iconR + spanW / 2 + 4 * m;
                    const cx = l + p * dCenter, cy = c + h * dCenter;
                    const nx = -h, ny = p; // Tangent normal perpendicular to midline radial (p, h)

                    // 4 Orthogonal Pole Vertices:
                    // Pole 0 (Radial Outward - North - Green): cx + p * (spanW/2), cy + h * (spanW/2)
                    // Pole 1 (Tangent Right - East - Yellow): cx + nx * (spanW/2), cy + ny * (spanW/2)
                    // Pole 2 (Radial Inward - South - Red): cx - p * (spanW/2), cy - h * (spanW/2)
                    // Pole 3 (Tangent Left - West - Blue): cx - nx * (spanW/2), cy - ny * (spanW/2)
                    const P0 = { x: cx + p * (spanW / 2), y: cy + h * (spanW / 2) };
                    const P1 = { x: cx + nx * (spanW / 2), y: cy + ny * (spanW / 2) };
                    const P2 = { x: cx - p * (spanW / 2), y: cy - h * (spanW / 2) };
                    const P3 = { x: cx - nx * (spanW / 2), y: cy - ny * (spanW / 2) };

                    const r0 = t[f[0] + "Known"] ? t[f[0]] : 0;
                    const r1 = t[f[1] + "Known"] ? t[f[1]] : 0;
                    const r2 = t[f[2] + "Known"] ? t[f[2]] : 0;
                    const r3 = t[f[3] + "Known"] ? t[f[3]] : 0;
                    const isKnown = Boolean(t[f[0] + "Known"] || t[f[1] + "Known"] || t[f[2] + "Known"] || t[f[3] + "Known"]);

                    // Radar diamond deformation: vertex scale 0 to 1
                    const maxAbsT = Math.max(Math.abs(r0), Math.abs(r1), Math.abs(r2), Math.abs(r3));
                    const d0 = maxAbsT > 0 ? Math.abs(r0) / maxAbsT : 0;
                    const d1 = maxAbsT > 0 ? Math.abs(r1) / maxAbsT : 0;
                    const d2 = maxAbsT > 0 ? Math.abs(r2) / maxAbsT : 0;
                    const d3 = maxAbsT > 0 ? Math.abs(r3) / maxAbsT : 0;

                    const S0 = { x: cx + (P0.x - cx) * d0, y: cy + (P0.y - cy) * d0 };
                    const S1 = { x: cx + (P1.x - cx) * d1, y: cy + (P1.y - cy) * d1 };
                    const S2 = { x: cx + (P2.x - cx) * d2, y: cy + (P2.y - cy) * d2 };
                    const S3 = { x: cx + (P3.x - cx) * d3, y: cy + (P3.y - cy) * d3 };

                    const isAct = Boolean(Nt && Nt.id === e);
                    const actCls = isAct ? " active-rating" : "";
                    const ariaTxt = isKnown ? `${y[0]}: ${Math.round(r0)}, ${y[1]}: ${Math.round(r1)}, ${y[2]}: ${Math.round(r2)}, ${y[3]}: ${Math.round(r3)}` : "Unrated";
                    const maxR = sxSignedIntensity([r0, r1, r2, r3]);
                    const fillCol = isKnown ? sxInterestColor(maxR) : "rgba(103, 232, 249, 0.45)";

                    D += `<g class="direction-control map-tetrad-control${actCls}" data-id="${e}" data-direction="tetrad" data-base-cx="${cx.toFixed(1)}" data-base-cy="${cy.toFixed(1)}" data-control-scale="${m}" data-tag-width="${spanW.toFixed(1)}" data-tag-height="${spanW.toFixed(1)}">`;
                    // Outer Reference Frame (Diamond Outline)
                    D += `<polygon points="${P0.x.toFixed(1)},${P0.y.toFixed(1)} ${P1.x.toFixed(1)},${P1.y.toFixed(1)} ${P2.x.toFixed(1)},${P2.y.toFixed(1)} ${P3.x.toFixed(1)},${P3.y.toFixed(1)}" fill="rgba(15,23,42,0.4)" stroke="rgba(255,255,255,0.3)" stroke-width="${1.2 * m}"/>`;
                    // Orthogonal Crosshairs
                    D += `<line x1="${P0.x.toFixed(1)}" y1="${P0.y.toFixed(1)}" x2="${P2.x.toFixed(1)}" y2="${P2.y.toFixed(1)}" stroke="rgba(255,255,255,0.2)" stroke-width="${1 * m}" stroke-dasharray="${2 * m},${2 * m}"/>`;
                    D += `<line x1="${P1.x.toFixed(1)}" y1="${P1.y.toFixed(1)}" x2="${P3.x.toFixed(1)}" y2="${P3.y.toFixed(1)}" stroke="rgba(255,255,255,0.2)" stroke-width="${1 * m}" stroke-dasharray="${2 * m},${2 * m}"/>`;
                    // Filled deformed diamond polygon
                    if (isKnown && (d0 > 0 || d1 > 0 || d2 > 0 || d3 > 0)) {
                        D += `<polygon points="${S0.x.toFixed(1)},${S0.y.toFixed(1)} ${S1.x.toFixed(1)},${S1.y.toFixed(1)} ${S2.x.toFixed(1)},${S2.y.toFixed(1)} ${S3.x.toFixed(1)},${S3.y.toFixed(1)}" fill="${fillCol}" fill-opacity="0.55" stroke="#ffffff" stroke-width="${1.4 * m}"/>`;
                    }
                    // Pole Dots (N-Green, E-Yellow, S-Red, W-Blue)
                    D += `<circle cx="${P0.x.toFixed(1)}" cy="${P0.y.toFixed(1)}" r="${3 * m}" fill="#22c55e" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    D += `<circle cx="${P1.x.toFixed(1)}" cy="${P1.y.toFixed(1)}" r="${3 * m}" fill="#eab308" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    D += `<circle cx="${P2.x.toFixed(1)}" cy="${P2.y.toFixed(1)}" r="${3 * m}" fill="#ef4444" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    D += `<circle cx="${P3.x.toFixed(1)}" cy="${P3.y.toFixed(1)}" r="${3 * m}" fill="#3b82f6" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    // Hit Target first: pole labels paint on top so they stay hoverable for their tips.
                    // Hit area
                    D += `<polygon class="direction-hit map-tetrad-hit" data-id="${e}" data-direction="tetrad" points="${P0.x.toFixed(1)},${P0.y.toFixed(1)} ${P1.x.toFixed(1)},${P1.y.toFixed(1)} ${P2.x.toFixed(1)},${P2.y.toFixed(1)} ${P3.x.toFixed(1)},${P3.y.toFixed(1)}" fill="transparent" pointer-events="all" style="cursor:crosshair" role="slider" aria-label="${sxEscapeHtmlText(y.join(' / '))}: ${ariaTxt}. Drag a corner to set that pole." tabindex="0"/>`;
                    // Labels
                    D += `<text class="map-tetrad-label"${sxPoleTipAttrs(0)} x="${(P0.x + p * 8 * m).toFixed(1)}" y="${(P0.y + h * 8 * m).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${6.5 * m}px" font-weight="700" fill="#22c55e">${sxEscapeHtmlText(y[0])}</text>`;
                    D += `<text class="map-tetrad-label"${sxPoleTipAttrs(1)} x="${(P1.x + nx * 8 * m).toFixed(1)}" y="${(P1.y + ny * 8 * m).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${6.5 * m}px" font-weight="700" fill="#eab308">${sxEscapeHtmlText(y[1])}</text>`;
                    D += `<text class="map-tetrad-label"${sxPoleTipAttrs(2)} x="${(P2.x - p * 8 * m).toFixed(1)}" y="${(P2.y - h * 8 * m).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${6.5 * m}px" font-weight="700" fill="#ef4444">${sxEscapeHtmlText(y[2])}</text>`;
                    D += `<text class="map-tetrad-label"${sxPoleTipAttrs(3)} x="${(P3.x - nx * 8 * m).toFixed(1)}" y="${(P3.y - ny * 8 * m).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${6.5 * m}px" font-weight="700" fill="#3b82f6">${sxEscapeHtmlText(y[3])}</text>`;
                    D += `</g>`;
                } else if ($.triangle) {
                    // 2D Barycentric Triangle on Hypermap for Triad Topics
                    // Orientation: One side tangent to the node's icon,
                    // with the 'middle position' pole (index 1) radial in line with the node's midline.
                    const iconR = (null != sxLeafD ? sxLeafD : u * mapFontScale()) / 2;
                    const baseW = 58 * m;
                    const triH = baseW * 0.866025; // Equilateral triangle height
                    const dBase = iconR + 4 * m;
                    const bx = l + p * dBase, by = c + h * dBase;
                    const nx = -h, ny = p; // Unit normal vector perpendicular to midline radial (p, h)

                    // Base side: connects Pole 0 (Red) and Pole 2 (Blue), perfectly tangent to the icon circle!
                    const V0 = { x: bx - nx * (baseW / 2), y: by - ny * (baseW / 2) };
                    const V2 = { x: bx + nx * (baseW / 2), y: by + ny * (baseW / 2) };
                    // Apex: Pole 1 (Green, 'middle position' pole), pointing radially along the spoke midline!
                    const V1 = { x: bx + p * triH, y: by + h * triH };

                    const cx = (V0.x + V1.x + V2.x) / 3, cy = (V0.y + V1.y + V2.y) / 3;

                    const r0 = t[f[0] + "Known"] ? t[f[0]] : 0;
                    const r1 = t[f[1] + "Known"] ? t[f[1]] : 0;
                    const r2 = t[f[2] + "Known"] ? t[f[2]] : 0;
                    const isKnown = Boolean(t[f[0] + "Known"] || t[f[1] + "Known"] || t[f[2] + "Known"]);
                    const m0 = Math.abs(r0), m1 = Math.abs(r1), m2 = Math.abs(r2);
                    const tot = m0 + m1 + m2;
                    const w0 = tot > 0 ? m0 / tot : 1/3;
                    const w1 = tot > 0 ? m1 / tot : 1/3;
                    const w2 = tot > 0 ? m2 / tot : 1/3;
                    const px = w0 * V0.x + w1 * V1.x + w2 * V2.x;
                    const py = w0 * V0.y + w1 * V1.y + w2 * V2.y;
                    const maxR = sxSignedIntensity([r0, r1, r2]);
                    const puckColor = isKnown ? sxInterestColor(maxR) : Ga.FALLBACK_COLOR;
                    const isAct = Boolean(Nt && Nt.id === e);
                    const actCls = isAct ? " active-rating" : "";
                    const ariaTxt = isKnown ? `${y[0]}: ${Math.round(r0)}, ${y[1]}: ${Math.round(r1)}, ${y[2]}: ${Math.round(r2)}` : "Unrated";
                    const gradId = `tri-grad-${A}`;

                    D += `<g class="direction-control map-triad-control${actCls}" data-id="${e}" data-direction="triangle" data-base-cx="${cx.toFixed(1)}" data-base-cy="${cy.toFixed(1)}" data-control-scale="${m}" data-tag-width="${(4 * triH / 3).toFixed(1)}" data-tag-height="${(4 * triH / 3).toFixed(1)}">`;
                    D += `<defs><linearGradient id="${gradId}" x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${V1.x.toFixed(1)}" y2="${V1.y.toFixed(1)}" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/><stop offset="50%" stop-color="#ef4444" stop-opacity="0.35"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0.45"/></linearGradient></defs>`;
                    D += `<polygon class="map-triangle-frame" points="${V0.x.toFixed(1)},${V0.y.toFixed(1)} ${V1.x.toFixed(1)},${V1.y.toFixed(1)} ${V2.x.toFixed(1)},${V2.y.toFixed(1)}" fill="url(#${gradId})" stroke="rgba(255,255,255,0.45)" stroke-width="${1.8 * m}" stroke-linejoin="round"/>`;
                    D += `<line x1="${V0.x.toFixed(1)}" y1="${V0.y.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="rgba(255,255,255,0.2)" stroke-width="${1 * m}" stroke-dasharray="${3 * m},${3 * m}"/>`;
                    D += `<line x1="${V1.x.toFixed(1)}" y1="${V1.y.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="rgba(255,255,255,0.2)" stroke-width="${1 * m}" stroke-dasharray="${3 * m},${3 * m}"/>`;
                    D += `<line x1="${V2.x.toFixed(1)}" y1="${V2.y.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="rgba(255,255,255,0.2)" stroke-width="${1 * m}" stroke-dasharray="${3 * m},${3 * m}"/>`;
                    // RGB Pole dots
                    D += `<circle cx="${V0.x.toFixed(1)}" cy="${V0.y.toFixed(1)}" r="${3.5 * m}" fill="#ef4444" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    D += `<circle cx="${V1.x.toFixed(1)}" cy="${V1.y.toFixed(1)}" r="${3.5 * m}" fill="#22c55e" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    D += `<circle cx="${V2.x.toFixed(1)}" cy="${V2.y.toFixed(1)}" r="${3.5 * m}" fill="#3b82f6" stroke="#ffffff" stroke-width="${0.8 * m}"/>`;
                    // Hit Target first: pole labels paint on top so they stay hoverable for their tips.
                    D += `<polygon class="direction-hit map-triangle-hit" data-id="${e}" data-direction="triangle" data-v0x="${V0.x.toFixed(1)}" data-v0y="${V0.y.toFixed(1)}" data-v1x="${V1.x.toFixed(1)}" data-v1y="${V1.y.toFixed(1)}" data-v2x="${V2.x.toFixed(1)}" data-v2y="${V2.y.toFixed(1)}" points="${V0.x.toFixed(1)},${V0.y.toFixed(1)} ${V1.x.toFixed(1)},${V1.y.toFixed(1)} ${V2.x.toFixed(1)},${V2.y.toFixed(1)}" fill="transparent" pointer-events="all" style="cursor:crosshair" role="slider" aria-label="${sxEscapeHtmlText(y.join(' / '))}: ${ariaTxt}. Drag to adjust triad balance." tabindex="0"/>`;
                    // Labels offset outward from each vertex
                    const l0x = V0.x - nx * 9 * m, l0y = V0.y - ny * 9 * m;
                    const l1x = V1.x + p * 12 * m, l1y = V1.y + h * 12 * m;
                    const l2x = V2.x + nx * 9 * m, l2y = V2.y + ny * 9 * m;
                    D += `<text class="map-triangle-label"${sxPoleTipAttrs(0)} x="${l0x.toFixed(1)}" y="${l0y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${8 * m}px" font-weight="700" fill="#ef4444">${sxEscapeHtmlText(y[0])}</text>`;
                    D += `<text class="map-triangle-label"${sxPoleTipAttrs(1)} x="${l1x.toFixed(1)}" y="${l1y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${8 * m}px" font-weight="700" fill="#22c55e">${sxEscapeHtmlText(y[1])}</text>`;
                    D += `<text class="map-triangle-label"${sxPoleTipAttrs(2)} x="${l2x.toFixed(1)}" y="${l2y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${8 * m}px" font-weight="700" fill="#3b82f6">${sxEscapeHtmlText(y[2])}</text>`;
                    D += `<circle class="slider-thumb map-triangle-puck${actCls}" data-id="${e}" data-direction="triangle" pointer-events="none" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${7.5 * m}" fill="${puckColor}" stroke="#ffffff" stroke-width="${1.5 * m}"/>`;
                    D += `</g>`;
                } else {
                    f.forEach((k, idx) => {
                        w[k] = ($.single ? Za.controlTagWidth(y[idx], "single") : v(y[idx])) || 30 * m;
                    });
                    const k = ($.single ? 20 : 24) * m, x = 320 * m, E = sxRailPx(m);
                    let C = $.single ? [ 0 ] : (f.length === 3 ? [ -w[f[0]] - 4 * m, 0, w[f[2]] + 4 * m ] : [ -w[f[0]] / 2, w[f[1]] / 2 ]);
                // Slider blow-up repair (2026-11-01): E (the rating rail's stroke-width) was 44 * mapFontScale() - unbounded and font-derived, so at the baked fontScale 40 the rail rendered 1760 screen px thick (non-scaling-stroke) and one inadvertently picked slider filled the viewport at high zoom-out. It is now the fixed 44 of the 44px spec at every font scale and zoom, matching the .rating-rail CSS rule. Track length (x = 320 * m, map units, camera-scaled) is unchanged.
                // Slider size repair #2 (2026-11-01): E now comes from sxRailPx(m) - 14% of the track's delivered screen length at the current camera, capped at the same fixed 44 - so the attribute, the .rating-rail CSS variable, and the hit strokes all agree at every zoom instead of the fixed 44px thickness dwarfing the shrunken track at Full zoom-out.
                f.forEach((n, i) => {
                    const o = w[n], s = o + 10 * m, d = C[i], u = l - p * d, f = c - h * d, v = u - a * x / 2, M = f - r * x / 2, I = u + a * x / 2, P = f + r * x / 2, L = `M ${v.toFixed(2)} ${M.toFixed(2)} L ${I.toFixed(2)} ${P.toFixed(2)}`, T = s / 2, F = `M ${(u - p * T).toFixed(2)} ${(f - h * T).toFixed(2)} L ${(u + p * T).toFixed(2)} ${(f + h * T).toFixed(2)}`, N = `grad-${A}-${n}`, _ = t[n + "Known"], R = _ ? t[n] : 0, O = (R + 100) / 200, B = Boolean(t[n + "Derived"]), j = Math.round(R), q = _ ? B ? `${j}, rolled up from ${t[n + "RatedChildren"]} of ${t.childCount} child topics` : String(j) : "Unrated", H = sxGiveReceiveNounText(e, n), W = sxClassicFlankText(e, n, S), U = Boolean(Nt && Nt.id === e && Nt.direction === n), G = U ? " active-rating" : "", K = `data-id="${e}" data-direction="${n}" data-x0="${v}" data-y0="${M}" data-x1="${I}" data-y1="${P}" data-nx="${a}" data-ny="${r}" data-offset="0"`, z = v + (I - v) * O, V = M + (P - M) * O, Y = $.single ? 1 : 0 === i ? -1 : 1, X = u + p * Y * (o / 2), Z = f + h * Y * (o / 2), Q = _ ? sxInterestColor(R) : Ga.FALLBACK_COLOR;
                    D += `<g class="direction-control${$.single ? " single-label-control" : ""}${G}" data-id="${e}" data-direction="${n}"${W ? ` data-rating-tooltip="${sxEscapeHtmlText(W)}"` : ""} data-derived="${B}" data-base-cx="${u}" data-base-cy="${f}" data-base-angle="${g}" data-index="${i}" data-tag-width="${o}" data-tag-height="${k}" data-control-scale="${m}" style="--sx-rail-px:${E.toFixed(1)}px;--sx-rail-hit-px:${Math.max(14, Math.min(44, E * 1.6)).toFixed(1)}px">`, 
                    D += `<defs><linearGradient id="${N}" gradientUnits="userSpaceOnUse" x1="${v}" y1="${M}" x2="${I}" y2="${P}"><stop offset="0" stop-color="var(--red-deep)"/><stop offset=".5" stop-color="var(--curious)"/><stop offset="1" stop-color="var(--green-deep)"/></linearGradient></defs>`, 
                    D += `<path class="visual-rail rating-rail${G}" data-id="${e}" data-direction="${n}" d="${L}" fill="none" stroke="url(#${N})" stroke-width="${E}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`, 
                    (_ || U) && (D += `<circle class="slider-thumb${G}" data-id="${e}" data-direction="${n}" cx="${z.toFixed(2)}" cy="${V.toFixed(2)}" r="${10 * m}" fill="${sxInterestColor(R)}"/>`), 
                    D += `<path class="rating-track-hit${G}" ${K} d="${L}"/>`;
                    const J = U ? `tabindex="0" role="button" aria-label="Clear ${sxEscapeHtmlText(`${sxRoleLabelText(e, n)}${H ? ` ${H}` : ""}`)} rating"` : 'tabindex="-1" aria-hidden="true"', ee = g + 90;
                    D += `<g class="rating-clear${G}" data-id="${e}" data-direction="${n}"><rect class="rating-clear-bg" x="${(X - 23 * (mapFontScale() * sxF / 3)).toFixed(2)}" y="${(Z - 10 * (mapFontScale() * sxF / 3)).toFixed(2)}" width="${46 * (mapFontScale() * sxF / 3)}" height="${20 * (mapFontScale() * sxF / 3)}" rx="5" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})"/><rect class="rating-clear-hit" data-id="${e}" data-direction="${n}" x="${(X - 28).toFixed(2)}" y="${(Z - 15).toFixed(2)}" width="56" height="30" rx="7" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})" ${J}/><text class="rating-clear-text" x="${X.toFixed(2)}" y="${Z.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})">Clear</text></g>`, 
                    D += `<path class="direction-hit" tabindex="0" role="slider" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="${_ ? j : 0}" aria-valuetext="${q}" aria-label="${sxEscapeHtmlText(`${sxRoleLabelText(e, n)}${H ? `: ${H}` : ""}. ${q}. Tap to open its rating scale; drag, then release to choose.`)}" aria-expanded="${U}" ${K} d="${F}"/>`, 
                    $.single && (D += `<rect class="direction-tag-occluder" x="${(u - o / 2 - 3 * m).toFixed(2)}" y="${(f - k / 2 - 3 * m).toFixed(2)}" width="${(o + 6 * m).toFixed(2)}" height="${(k + 6 * m).toFixed(2)}" rx="${7 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})"/>`), 
                    D += `<rect class="direction-tag-bg" data-id="${e}" data-direction="${n}" x="${(u - o / 2).toFixed(2)}" y="${(f - k / 2).toFixed(2)}" width="${o}" height="${k}" rx="${5 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" fill="${Q}" opacity="${_ ? 1 : .62}"/>`;
                    // TAG FILL (ruled 2026-11-02, Jason): the give/receive
                    // lettering fills its tag capsule - font-size equals
                    // the tag height k exactly (single 20 * m, pair
                    // 24 * m), no wasted space top or bottom. The capsule
                    // takes its width from the word itself at this font
                    // (Za.controlTagWidth), so the word fits with no
                    // sideways squeeze and no shrink: the old textLength
                    // cap (spacingAndGlyphs) is gone.
                    const te = $.single ? y[i] : b ? "give" === n ? "G" : "R" : y[i], ne = k;
                    D += `<text class="direction-tag" data-id="${e}" data-direction="${n}" x="${u.toFixed(2)}" y="${f.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" style="font-size:${ne}px">${sxEscapeHtmlText(te)}</text></g>`;
                });
                }
            }
            if (g && !sxIsBlind() && !x) {
                const i = sxScoringProfileIds(), a = $.keys || ($.single ? [ "give" ] : [ "give", "receive" ]), r = i.length * a.length, o = (n > 7 ? Math.min(18, 4 + 1.6 * r) : Math.min(14, 3 + 1.4 * r)) * (mapFontScale() * sxF / 3), s = Math.max(1.35, n / Math.min(r, 6)) * (mapFontScale() * sxF / 3);
                i.forEach((n, i) => {
                    const l = sxRatingRecord(e, n);
                    a.forEach((c, d) => {
                        const u = i * a.length + d, p = 1 === r ? 0 : -o / 2 + o * u / (r - 1);
                        $.labels[d], D += `<path class="visual-rail" d="${t}" transform="${E(p)}" fill="none" ${function(e, t, n) {
                            return e[t + "Known"] ? `stroke="${sxProfileColor(n)}" opacity=".96"` : 'stroke="var(--line)" stroke-dasharray="2 6" opacity=".38"';
                        }(l, c, n)} stroke-width="${s}" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${sxEscapeHtmlText(wt[n])} — ${sxEscapeHtmlText(sxRoleLabelText(e, c))}</title></path>`;
                    });
                });
            }
            return D;
        }
        function sxSpokeSegment(e, t, n, i, a, r = 0) {
            const o = i - t, s = a - n, l = Math.hypot(o, s), c = o / l, d = s / l, u = i - c * r, p = a - d * r, h = Math.max(80, l - r), g = Za.leafLabelWidth(h), m = u - c * g, f = p - d * g;
            return {
                d: `M ${t.toFixed(2)} ${n.toFixed(2)} L ${i.toFixed(2)} ${a.toFixed(2)}`,
                labelD: `M ${m.toFixed(2)} ${f.toFixed(2)} L ${u.toFixed(2)} ${p.toFixed(2)}`,
                labelWidth: g,
                labelStartX: m,
                labelStartY: f,
                ux: c,
                uy: d,
                nx: -d,
                ny: c
            };
        }
        function sxPointAtDistance(e, t, n, i, a) {
            return r => {
                const o = Math.max(0, Math.min(a, r));
                return {
                    x: e + n * o,
                    y: t + i * o
                };
            };
        }
        function sxStraightSpoke(e, t, n, i, a = (typeof sxIconRadius === "function" ? sxIconRadius(1) : 130)) {
            const r = Math.max(1, Math.hypot(n - e, i - t)), o = (n - e) / r, s = (i - t) / r, l = -s, c = o, d = `M ${e.toFixed(2)} ${t.toFixed(2)} L ${n.toFixed(2)} ${i.toFixed(2)}`, u = `M ${n.toFixed(2)} ${i.toFixed(2)} L ${e.toFixed(2)} ${t.toFixed(2)}`, p = r, h = sxPointAtDistance(e, t, o, s, p), g = a, m = Za.cloudLabel(p, g), f = m.labelOffset;
            return {
                d: d,
                labelD: d,
                reverseD: u,
                routedLength: p,
                labelWidth: m.labelWidth,
                labelOffset: f,
                icon: h(p),
                ux: o,
                uy: s,
                nx: l,
                ny: c,
                c1: h(.3 * p),
                c2: h(.7 * p),
                bend: 0,
                pointAtDistance: h
            };
        }
        function sxPolarPoint(e, t) {
            return {
                x: MAP_CENTER_X + Math.cos(e) * t,
                y: MAP_CENTER_Y + Math.sin(e) * t
            };
        }
        const Za = Object.freeze({
            HALO_SPACING: Object.freeze({
                category: 8,
                topic: 6
            }),
            CENTER_SPACING_EM: .02,
            IDEAL_SIZE: 18,
            MIN_SIZE: 12.5,
            _context: document.createElement("canvas").getContext("2d"),
            _cache: new Map,
            _estimateCache: new Map,
            measure(e, t, n) {
                if (!Za._context) return 0;
                const i = "category" === n || "center" === n, a = i ? '"Barlow Condensed",sans-serif' : '"Source Sans 3",sans-serif', r = i ? 700 : 650, o = "center" === n ? Za.CENTER_SPACING_EM * t : Za.HALO_SPACING[n] || Za.HALO_SPACING.topic, s = n + "|" + t.toFixed(1) + "|" + e;
                if (Za._cache.has(s)) return Za._cache.get(s);
                Za._context.font = `${r} ${t}px ${a}`;
                const l = Za._context.measureText(e).width + o * Math.max(0, e.length - 1);
                return Za._cache.size > 2e3 && Za._cache.clear(), Za._cache.set(s, l), l;
            },
            fittedSize(e, t, n) {
                const i = Za.IDEAL_SIZE, a = Za.measure(e, i, n);
                return Math.max(Za.MIN_SIZE, Math.min(i, i * t / Math.max(t, a)));
            },
            fitWithin(e, t, n, i, a) {
                const r = Za.measure(e, t, a);
                return Math.max(n, Math.min(t, t * i / Math.max(1, r)));
            },
            fitAttr: (e, t, n, i) => Za.measure(e, t, n) > i ? ` textLength="${i.toFixed(0)}" lengthAdjust="spacing"` : "",
            // CAPSULE = THE WORD (ruled 2026-11-02, Jason): a tag
            // capsule's width IS its word's measured width at the tag
            // font, plus the renderer's existing inset (4 for the
            // give/receive tags, whose fit check was capsule width
            // minus 4 * scale; 12 for the group score tag, whose text
            // was set to capsule width minus 12 * scale). The old
            // per-character width table is gone: no fixed widths, no
            // caps, no floors. Tag fonts: single 20, pair 24 (the
            // tag heights, unchanged), group score 5.5 (halved from
            // 11 in the same ruling). Paint and the scored capsule
            // geometry both read this one definition, so they move
            // together.
            controlTagWidth: (e, t) => "single" === t ? Za.measure(e, 20, "topic") + 4 : "group" === t ? Za.measure(e, 5.5, "topic") + 12 : Za.measure(e, 24, "topic") + 4,
            leafLabelWidth: e => Math.min(e, Math.max(170, e - 38)),
            curveLabel(e, t, n) {
                const i = Math.max(.32, Math.min(.62, Number(n) || .32)), a = Number.isFinite(t) ? Math.min(e * i, Math.max(6, t)) : Math.min(12, Math.max(6, .03 * e));
                return {
                    labelOffset: a,
                    safeLabelLimit: i,
                    labelWidth: Math.max(120, e - a - 20)
                };
            },
            cloudLabel(e, t) {
                const n = Math.min(e - 44, Math.max(t + 44, .2 * e));
                return {
                    labelOffset: n,
                    // LABEL CLEARANCE: reserve icon radius (24px) + 20px gap
                    labelWidth: Math.max(30, e - n - 44)
                };
            },
            adaptivePlacement(e, t, n = 0) {
                const i = Math.max(.006, Number(e && e.sector) || .006), a = t >= 3, r = a ? 92 : 44, o = a ? n + 700 : n + 72, s = a ? sxDepthRadius(3) + 1280 : n + 420, l = Math.min(s, Math.max(o, r / i)), c = a ? 620 : 72, d = a ? 2560 : 560, u = Math.max(c, Math.min(d, l - n));
                return a ? {
                    offset: u,
                    limit: .72
                } : {
                    offset: u,
                    limit: .68
                };
            },
            topicLabelOffset: (e, t, n) => Math.max(30, Math.min(e - 36, t + (n % 2 ? 20 : 0))),
            angularDemand(e, t, n, i, a = 0) {
                const r = Math.max(n + 30, 2 * i + Math.min(40, .65 * String(e || "").length)) + a;
                return 2 * Math.asin(Math.min(.92, r / (2 * Math.max(1, t))));
            },
            allocateSectors(e, t, n, i, a, r, o = 0) {
                if (!e.length) return [];
                const s = e.map(e => Math.max(Za.angularDemand(e.label, i, a, r, o), Number(e.minDemand) || 0)), l = s.reduce((e, t) => e + t, 0), c = e.map(e => Math.max(1, e.weight || 1)), d = c.reduce((e, t) => e + t, 0);
                let u = c.map(e => n * e / d);
                if (l <= n) {
                    const t = new Set;
                    for (let i = 0; i < e.length; i++) {
                        let e = !1, i = 0, a = 0;
                        if (u.forEach((e, n) => {
                            t.has(n) ? i += s[n] : a += c[n];
                        }), u = u.map((e, r) => t.has(r) ? s[r] : Math.max(0, n - i) * c[r] / Math.max(1e-4, a)), 
                        u.forEach((n, i) => {
                            !t.has(i) && n < s[i] && (t.add(i), e = !0);
                        }), !e) break;
                    }
                    const i = u.reduce((e, t) => e + t, 0);
                    if (i < n - 1e-4) {
                        const t = (n - i) / e.length;
                        u = u.map(e => e + t);
                    }
                } else u = s.map(e => n * e / l);
                let p = t;
                return e.map((e, t) => {
                    const n = u[t], i = s[t], a = Math.max(0, (n - i) / Math.max(1e-4, i)), r = Object.assign({}, e, {
                        angle: p + n / 2,
                        sector: n,
                        start: p,
                        end: p + n,
                        demand: i,
                        slackRatio: a
                    });
                    return p += n, r;
                });
            },
            TAPER_BASE_FRACTION: 1.25,
            // TAPER-BASE RE-ANCHOR: category taper base fatter at the root
            // with bulbous falloff. TAPER_BASE_CAP sets the maximum base chord.
            TAPER_BASE_CAP: 2 * 300 * Math.sin(Math.PI / 18) * 1.35,
            categoryTaperBaseWidth(e, t, n) {
                const i = 2 * t * Math.sin(Math.PI / Math.max(1, Number(n) || 1));
                return Math.max(e * 3.5, Math.min(i * Za.TAPER_BASE_FRACTION, Za.TAPER_BASE_CAP));
            },
            SETTLE: Object.freeze({
                controlGap: 14,
                iconGap: 2,
                startOffset: 2,
                parentOuterMargin: 12,
                boxPadding: 4,
                badgeGap: 0,
                gen2: Object.freeze({
                    step: 32,
                    attempts: 18
                }),
                gen3: Object.freeze({
                    step: 40,
                    attempts: 18
                })
            }),
            orientedBox(e, t, n, i, a = 0) {
                const r = a * Math.PI / 180, o = Math.cos(r), s = Math.sin(r), l = Za.SETTLE.boxPadding;
                return {
                    cx: e,
                    cy: t,
                    hw: Math.max(1, n / 2 + l),
                    hh: Math.max(1, i / 2 + l),
                    ux: {
                        x: o,
                        y: s
                    },
                    uy: {
                        x: -s,
                        y: o
                    }
                };
            },
            boxesOverlap(e, t) {
                const n = t.cx - e.cx, i = t.cy - e.cy;
                return [ e.ux, e.uy, t.ux, t.uy ].every(a => Math.abs(n * a.x + i * a.y) < e.hw * Math.abs(e.ux.x * a.x + e.ux.y * a.y) + e.hh * Math.abs(e.uy.x * a.x + e.uy.y * a.y) + (t.hw * Math.abs(t.ux.x * a.x + t.ux.y * a.y) + t.hh * Math.abs(t.uy.x * a.x + t.uy.y * a.y)));
            },
            isClear: (e, t) => !e.some(e => t.some(t => Za.boxesOverlap(e, t))),
            settleSearch: e => e ? Za.SETTLE.gen2 : Za.SETTLE.gen3,
            markerCandidates(e) {
                let t = 0;
                for (let n = 0; n < e.length; n++) t = 31 * t + e.charCodeAt(n) >>> 0;
                const n = t % 2 ? 1 : -1, i = 9 * (t % 3 - 1);
                return [ [ 36 * n, i ], [ 36 * -n, i ], [ 49 * n, -i ], [ 49 * -n, -i ], [ 38 * n, i + 24 ], [ 38 * -n, i - 24 ], [ 54 * n, i + 22 ], [ 54 * -n, i - 22 ] ];
            },
            markerAnchorAt(e, t, n, i, a) {
                const r = -n, o = t;
                return {
                    x: e.x + r * i[0] + t * i[1],
                    y: e.y + o * i[0] + n * i[1],
                    radius: a
                };
            },
            pickMarkerAnchor(e, t, n, i, a, r) {
                for (const o of a) {
                    const a = Za.markerAnchorAt(t, n, i, o, r);
                    if (e.every(e => Math.hypot(a.x - e.x, a.y - e.y) >= a.radius + e.radius + 8)) return a;
                }
                return null;
            },
            topicSpokeEstimate(e, t, depth) {
                // Memoised (T3, M6): the result is a pure function
                // of ALL of its inputs - the label, the radius, and
                // the canvas font-metrics state its measure calls
                // read (Source Sans 3, weight 650; see Za.measure).
                // The governing font signature is part of the cache
                // key - the bundle's signature-recapture discipline:
                // when the font state changes, entries under the old
                // signature simply never hit and the value is
                // recaptured, so a hit always returns exactly what
                // the unmemoised computation returns under the same
                // state. Hits hand back a fresh object, so a caller
                // can never mutate a cached entry. Bounded like
                // Za._cache: cleared past 2,000 entries.
                let sig = "nofonts";
                try {
                    document.fonts && document.fonts.check && (sig = document.fonts.status + "|" + document.fonts.check('650 16px "Source Sans 3"'));
                } catch (_) {}
                const dep = null == depth ? 2 : depth, key = sig + "|" + t + "|" + dep + "|" + e, hit = Za._estimateCache.get(key);
                if (hit) return {
                    fontSize: hit.fontSize,
                    spokeLength: hit.spokeLength
                };
                const n = Math.max(12, Math.min(17, Za.fittedSize(e, Math.max(80, t - 84)))) * sxFontCoef(dep) / 17,
                      hubR = typeof sxIconRadius === "function" ? sxIconRadius(Math.max(1, dep - 1)) : 96,
                      leafR = typeof sxIconRadius === "function" ? sxIconRadius(dep) : 62,
                      tabW = 5 * Za.measure(" ", n, "topic"),
                      gapW = Math.max(20, 6 * Za.measure(" ", n, "topic")),
                      i = hubR + leafR + Za.measure(e, n) + tabW + gapW + 36,
                      out = {
                          fontSize: n,
                          spokeLength: Math.max(t, i)
                      };
                return Za._estimateCache.size > 2e3 && Za._estimateCache.clear(), Za._estimateCache.set(key, out), {
                    fontSize: out.fontSize,
                    spokeLength: out.spokeLength
                };
            },
            hubSpokeLength(e, t, n, i, a) {
                let r = n;
                // Label-to-icon gap (ruled 2026-11-13, Jason): about
                // six spaces between the label end and the icon - the
                // old +3 was ~0.001 spaces at the label font, so
                // subcategory labels crowded their icons.
                const gap = Math.max(20, 6 * Za.measure(" ", t, "topic"));
                for (let n = 0; n < 3; n++) {
                    const n = Math.min(r - 44, Math.max(i + 44, .2 * r)) + 20;
                    r = Math.max(r, n + Za.measure(e, t) + gap + a);
                }
                return Math.max(n, r);
            },
            categoryFontSize: (e, t, n, i) => Math.max(15, Math.min(25, Za.fittedSize(e, t - n - (i ? 20 : 12), "category") + 5)),
            categoryUnderlineLength: (e, t) => Math.max(36, e.length * t * .5)
        });
