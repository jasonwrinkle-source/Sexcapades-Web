        async function apLoadAndPrep(e) {
            if (void 0 !== window.jspdf && window.jspdf.jsPDF || !window.__loadPdfLibs || await window.__loadPdfLibs(), 
            void 0 === window.jspdf || !window.jspdf.jsPDF) throw new Error("PDF library did not load.");
            var r = window.jspdf.jsPDF, o = (new DOMParser).parseFromString(e, "image/svg+xml").documentElement;
            if (!o || "svg" !== o.tagName.toLowerCase()) throw new Error("Invalid vector data for PDF.");
            var s = (o.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number), l = parseFloat(o.getAttribute("width")) || (4 === s.length ? s[2] : 2880), c = parseFloat(o.getAttribute("height")) || (4 === s.length ? s[3] : 2880);
            l > 0 && c > 0 || (l = 2880, c = 2880);
            var d = 4 === s.length ? s[0] : 0, u = 4 === s.length ? s[1] : 0, p = 4 === s.length ? s[2] : l, h = 4 === s.length ? s[3] : c, g = p / 2.7, m = h / 2.7, f = d + (p - g) / 2, y = u + (h - m) / 2;
            o.setAttribute("viewBox", f + " " + y + " " + g + " " + m);
            var b = 210, v = new r({
                unit: "mm",
                format: [ b, b ],
                orientation: "portrait",
                compress: !0
            });
            if ("function" != typeof v.svg) throw new Error("The PDF renderer did not load.");
            return {
                o: o,
                v: v,
                f: f,
                y: y,
                g: g,
                b: b
            };
        }
        function apEmbedMetadata(v, t, a, n, i) {
            try {
                if (t && void 0 !== vt && vt[t]) {
                    var w = bx(t, a instanceof Set ? a : new Set(a || []), n, "", i), k = JSON.stringify(w), x = btoa(unescape(encodeURIComponent(k)));
                    v.setProperties({
                        title: "Sexcapades hypermap - " + (n ? String(void 0 !== wt && wt[t] || "Profile") : "Shared profile"),
                        subject: "Sexcapades hypermap (vector PDF)",
                        keywords: "sexcapades-profile:" + x,
                        creator: "Sexcapades"
                    });
                }
            } catch (e) {
                console.warn("PDF metadata embed failed", e);
            }        }
        function apInlineStyles(A) {
            var $, E;
            try {
                A.querySelectorAll(".topic-stem,.topic-pulse,.branch-stem,.concept-path,.spoke-line").forEach(function(e) {
                    try {
                        var t = window.getComputedStyle(e);
                        if (t) {
                            var n = t.getPropertyValue("stroke") || t.stroke, i = t.getPropertyValue("stroke-width") || t.strokeWidth;
                            if (t.getPropertyValue("opacity"), t.getPropertyValue("fill"), n && "none" !== n && n.indexOf("var(") < 0) e.setAttribute("stroke", n); else if (n && n.indexOf("var(") >= 0) {
                                var a = t.stroke;
                                a && a.indexOf("var(") < 0 && e.setAttribute("stroke", a);
                            }
                            i && "" !== i && e.setAttribute("stroke-width", i), e.setAttribute("stroke-linecap", "round"), 
                            e.setAttribute("stroke-linejoin", "round");
                        }
                    } catch (e) { __sxErrLog("export-style", e); }
                }), A.querySelectorAll("path").forEach(function(e) {
                    e.getAttribute("stroke-linecap") || e.setAttribute("stroke-linecap", "round");
                });
            } catch (e) {
                console.warn("PDF CSS var resolution failed", e);
            }
            E = [ "display", "visibility", "opacity", "fill", "fill-opacity", "fill-rule", "stroke", "stroke-opacity", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset", "paint-order", "vector-effect", "font-family", "font-size", "font-style", "font-weight", "letter-spacing", "text-anchor", "dominant-baseline", "clip-path", "mask", "filter", "marker-start", "marker-mid", "marker-end", "stop-color", "stop-opacity" ], 
            ($ = A).querySelectorAll("*").forEach(function(e) {
                if ("style" !== e.localName && "script" !== e.localName) try {
                    var t = window.getComputedStyle(e);
                    E.forEach(function(n) {
                        var i = t.getPropertyValue(n);
                        i && "initial" !== i && ("normal" !== i || "letter-spacing" !== n && "paint-order" !== n) && e.style.setProperty(n, i);
                    });
                } catch (e) { __sxErrLog("style-apply", e); }
            }), $.querySelectorAll("style,script").forEach(function(e) {
                e.remove();
            });
        }
        function apDrawLabels(e, t, n, i, a) {
                    try {
                        var r = t.querySelectorAll("text.map-label");
                        if (!r || !r.length) return;
                        var o = 210 / a;
                        r.forEach(function(a) {
                            try {
                                var r = a.querySelector("textPath");
                                if (!r) return;
                                var s = (r.getAttribute("href") || r.getAttribute("xlink:href") || "").replace(/^#/, "");
                                if (!s) return;
                                var l = t.querySelector("#" + CSS.escape(s));
                                if (!l || "function" != typeof l.getTotalLength) return;
                                var c = l.getTotalLength();
                                if (!(c > 0)) return;
                                var d, u = r.getAttribute("startOffset") || "50%";
                                d = String(u).indexOf("%") >= 0 ? c * parseFloat(u) / 100 : parseFloat(u), isNaN(d) && (d = c / 2), 
                                d = Math.max(0, Math.min(c, d));
                                var p = l.getPointAtLength(d), h = l.getPointAtLength(Math.max(0, d - 2)), g = l.getPointAtLength(Math.min(c, d + 2)), m = 180 * Math.atan2(g.y - h.y, g.x - h.x) / Math.PI;
                                m > 90 && (m -= 180), m < -90 && (m += 180);
                                var f = parseFloat(a.getAttribute("dy") || "0");
                                isNaN(f) && (f = 0);
                                var y = m * Math.PI / 180, b = p.x - Math.sin(y) * f, v = p.y + Math.cos(y) * f, w = (r.textContent || "").trim();
                                if (!w) return;
                                var k = 12, x = a.style && a.style.fontSize;
                                if (x) {
                                    var S = String(x).match(/([\d.]+)/);
                                    S && (k = parseFloat(S[1]));
                                }
                                var $ = k * o * 2.83465, E = "#ffffff";
                                try {
                                    var A = window.getComputedStyle(a);
                                    A && A.fill && "none" !== A.fill && (E = A.fill);
                                } catch (e) { __sxErrLog("number-parse", e); }
                                var C = 255, M = 255, I = 255, P = String(E).match(/#([0-9a-fA-F]{6})/);
                                if (P) C = parseInt(P[1].substr(0, 2), 16), M = parseInt(P[1].substr(2, 2), 16), 
                                I = parseInt(P[1].substr(4, 2), 16); else {
                                    var L = String(E).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                                    L && (C = parseInt(L[1]), M = parseInt(L[2]), I = parseInt(L[3]));
                                }
                                e.setTextColor(C, M, I), e.setFontSize(Math.max(4, Math.min(48, $)));
                                var T = "middle", F = r.getAttribute("text-anchor") || a.getAttribute("text-anchor");
                                "start" === F ? T = "left" : "end" === F && (T = "right"), e.text(w, (b - n) * o, (v - i) * o, {
                                    angle: m,
                                    align: T,
                                    baseline: "alphabetic"
                                });
                            } catch (e) { __sxErrLog("app", e); }
                        });
                    } catch (e) {
                        console.warn("PDF label drawing failed", e);
                    }
                }
        async function apQrImages(t, a, n, i) {
            // Document path of the QR service (refactor F1): fixed
            // width 1200, oversize "split" — on failure it splits
            // and warns here instead of throwing like the card path.
            // Unified framework adaptation: split-to-count, then
            // warn-and-refuse over the 2 the page holds.
            // Scan-code fix (refactor ranking item 1): the document
            // page layout holds at most TWO codes. When the split
            // yields more than two pieces, NO codes are returned —
            // a partial set could never be reassembled on scan-in —
            // and overflowPieces reports how many the profile needs,
            // so ap can print a plain warning on the document and dp
            // can warn in the export dialog and point at the
            // numbered QR sheet instead. Never silently drop pieces.
            var M = [], overflowPieces = 0, I = null;
            try {
                if ("undefined" != typeof QRCode && "function" == typeof QRCode.toDataURL) {
                    I = await Ru(t, a, n, i);
                    M = await qrEncode(I, {
                        width: 1200,
                        oversize: "split"
                    });
                    if (M.length > 2) overflowPieces = M.length; else if (0 === M.length && I) overflowPieces = Math.max(2, chunkPayload(I, {
                        chunkSize: 700
                    }).length);
                }
            } catch (e) {
                console.warn("PDF QR generation failed", e);
                if (I && !M.length) try {
                    overflowPieces = Math.max(2, chunkPayload(I, {
                        chunkSize: 700
                    }).length);
                } catch (e2) {
                    overflowPieces = 2;
                }
            }
            if (overflowPieces) M = [];
            return {
                images: M,
                overflowPieces: overflowPieces
            };
        }
        function apHeaderCard(v, t, a, n, C) {
            var D = n ? "Profile" : "Shared profile";
            try {
                n && (D = String(wt[t] || "Profile").replace(/\s+/g, " ").trim() || "Profile");
            } catch (e) { __sxErrLog("profile-name", e); }
            var R = "";
            try {
                n && (R = Uu(t));
            } catch (e) { __sxErrLog("profile-name", e); }
            var O = [ 0, 0, 0 ];
            try {
                var B = dc(t, a);
                B && B.percentages && (O = [ B.percentages.green || 0, B.percentages.yellow || 0, B.percentages.red || 0 ]);
            } catch (e) { __sxErrLog("profile-stats", e); }
            var j = 4.2;
            v.setFont("helvetica", "bold"), v.setFontSize(8);
            var q = v.getTextWidth("SEXCAPADES PROFILE");
            v.setFontSize(16);
            var H = v.getTextWidth(D);
            v.setFontSize(11);
            var W = R ? v.getTextWidth("@" + R) : 0, U = Math.max(q, H, W), G = Math.min(2e3, Math.max(900, U / C + 430 + 96)), K = G * C, z = (R ? 400 : 360) * C;
            v.setFillColor(13, 17, 15), v.setDrawColor(99, 112, 104), v.setLineWidth(.4), "function" == typeof v.roundedRect ? v.roundedRect(4.2, j, K, z, 1.5, 1.5, "FD") : v.rect(4.2, j, K, z, "FD"), 
            v.setFontSize(8), v.setTextColor(215, 189, 85), v.text("SEXCAPADES PROFILE", 7, j + 34 * C + .175), 
            v.setFontSize(16), v.setTextColor(237, 242, 238), v.text(D, 7, j + 92 * C + 8 * C, {
                maxWidth: (G - 430 - 96) * C
            }), R && (v.setFontSize(11), v.setTextColor(215, 189, 85), v.text("@" + R, 7, j + 296 * C + 5 * C));
            for (var V = 4.2 + K - 215 * C, Y = j + z / 2, X = [ 128 * C, 106 * C, 4.9 ], Z = [ [ 99, 199, 150 ], [ 215, 189, 85 ], [ 224, 111, 106 ] ], Q = 0; Q < 3; Q++) {
                var J = X[Q], ee = Math.max(0, Math.min(100, Number(O[Q]) || 0));
                if (v.setDrawColor(70, 78, 73), v.setLineWidth(1), v.circle(V, Y, J, "D"), ee > 0) {
                    v.setDrawColor(Z[Q][0], Z[Q][1], Z[Q][2]), v.setLineWidth(1);
                    for (var te = Math.max(8, Math.ceil(ee / 100 * 72)), ne = null, ie = null, ae = 0; ae <= te; ae++) {
                        var re = -Math.PI / 2 + 2 * Math.PI * (ee / 100) * (ae / te), oe = V + J * Math.cos(re), se = Y + J * Math.sin(re);
                        null !== ne && v.line(ne, ie, oe, se), ne = oe, ie = se;
                    }
                }
            }
            var le = [ -Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6 ];
            v.setFont("helvetica", "bold"), v.setFontSize(8);
            for (var ce = 0; ce < 3; ce++) {
                var de = X[ce] + 2.1, ue = le[ce], pe = Math.round(Math.max(0, Math.min(100, Number(O[ce]) || 0)));
                v.setTextColor(Z[ce][0], Z[ce][1], Z[ce][2]), v.text(pe + "%", V + de * Math.cos(ue), Y + de * Math.sin(ue), {
                    align: "center",
                    baseline: "middle"
                });
            }
            var he = "";
            try {
                n && void 0 !== nt && nt && (he = String(nt[t] || "").trim());
            } catch (e) { __sxErrLog("app", e); }
            if (he) {
                v.setFont("helvetica", "normal"), v.setFontSize(10), v.setTextColor(150, 160, 155);
                var ge = v.splitTextToSize(he, (G - 96) * C).slice(0, 4);
                v.text(ge, 7, j + z + .7);
            }
        }
        async function ap(e, t, n = !1, i = !1, a = null) {
            var _pp = await apLoadAndPrep(e), o = _pp.o, v = _pp.v, f = _pp.f, y = _pp.y, g = _pp.g, b = _pp.b;
            apEmbedMetadata(v, t, a, n, i);
            var S = document.createElement("div");
            S.style.cssText = "position:fixed;left:-99999px;top:0;visibility:hidden;";
            var $, E, A = document.importNode(o, !0);
            S.appendChild(A), document.body.appendChild(S);
            apInlineStyles(A);

            try {
                await v.svg(A, {
                    x: 0,
                    y: 0,
                    width: b,
                    height: b
                }), apDrawLabels(v, A, f, y, g);
            } finally {
                document.body.removeChild(S);
            }
            var C = b / 3600;
            a = a instanceof Set ? a : new Set(a || []);
            var qrRes = await apQrImages(t, a, n, i), M = qrRes.images, qrOverflow = qrRes.overflowPieces || 0;
            var T = 42, F = 148.75, N = 2780 * C, _ = 100 * C;
            if (1 === M.length) {
                v.setFillColor(255, 255, 255), v.rect(N - 1.4, 147.35, 44.8, 44.8, "F");
                try {
                    v.addImage(M[0], "PNG", N, F, T, T);
                } catch (e) { __sxErrLog("pdf-image", e); }
            } else if (M.length >= 2) {
                v.setFillColor(255, 255, 255), v.rect(N - 1.4, 147.35, 44.8, 44.8, "F");
                try {
                    v.addImage(M[0], "PNG", N, F, T, T);
                } catch (e) { __sxErrLog("pdf-image", e); }
                v.setFillColor(255, 255, 255), v.rect(_ - 1.4, 147.35, 44.8, 44.8, "F");
                try {
                    v.addImage(M[1], "PNG", _, F, T, T);
                } catch (e) { __sxErrLog("pdf-image", e); }
            }
            if (qrOverflow > 0) {
                // No scan codes are printed (a partial set could
                // never be scanned back in), so say so ON the
                // document itself, where a future reader will see
                // it, and name the alternative that holds every
                // piece: the numbered QR sheet from Export QR codes.
                try {
                    v.setFont("helvetica", "normal"), v.setFontSize(8);
                    var noteLines = v.splitTextToSize(sxOversizeDocumentNote(qrOverflow), 196).slice(0, 2), noteH = 5.4 + 4.4 * (1 + noteLines.length), noteY = 210 - noteH - 1.5;
                    v.setFillColor(255, 255, 255), v.rect(3, noteY, 204, noteH, "F"), v.setTextColor(17, 17, 17), 
                    v.setFont("helvetica", "bold"), v.setFontSize(9.5), v.text("Too large for document scan codes — none printed", 105, noteY + 5.2, {
                        align: "center"
                    }), v.setFont("helvetica", "normal"), v.setFontSize(8), noteLines.forEach(function(line, li) {
                        v.text(line, 105, noteY + 9.6 + 4.4 * li, {
                            align: "center"
                        });
                    });
                } catch (e) { __sxErrLog("pdf-qr-note", e); }
            }
            apHeaderCard(v, t, a, n, C);
            var outBlob = v.output("blob");
            if (qrOverflow > 0) outBlob.sexcapadesQrOverflowPieces = qrOverflow;
            return outBlob;
        }
        async function rp(n, i = {}) {
            if (!vt[n] || !Jv(n, "capturing this profile", () => rp(n, i))) return;
            const a = Boolean(i.lowRes), r = a ? "Low-res visible-map PNG" : "Visible-map PNG", o = Uf(`Capture ${Ji(wt[n])}`, a ? "Building a compact PNG of the topics currently visible on your map…" : "Building a high-resolution PNG of the topics currently visible on your map…", {
                profileId: n
            });
            if (await Hf(o, 6, "Preparing hypermap", "Opening a clean export canvas…"), o !== vf) return;
            const s = Boolean(i.includeProfileInfo), l = Boolean(i.blind), c = (s && wt[n], 
            ip(s ? wt[n] : "Shared profile")), d = a ? [ {
                scale: 4 / 9,
                compact: !0,
                label: "1600 × 1600"
            }, {
                scale: 1 / 3,
                compact: !0,
                label: "1200 × 1200"
            }, {
                scale: 2 / 9,
                compact: !0,
                label: "800 × 800"
            } ] : [ {
                scale: .8,
                compact: !1,
                label: "2880 × 2880"
            }, {
                scale: 2 / 3,
                compact: !1,
                label: "2400 × 2400"
            }, {
                scale: 4 / 9,
                compact: !0,
                label: "1600 × 1600"
            }, {
                scale: 1 / 3,
                compact: !0,
                label: "1200 × 1200"
            } ];
            let u = null, p = null;
            for (let e = 0; e < d.length; e++) {
                if (o !== vf) return;
                const a = d[e];
                e && (tf.textContent = `The larger render could not finish. Retrying at ${a.label}…`, 
                await Hf(o, 8, "Retrying at a safer size", `The larger render could not finish. Trying ${a.label} without losing profile data…`));
                try {
                    u = {
                        blob: await Zu(n, {
                            lowRes: a.compact,
                            outputScale: a.scale,
                            photoIndices: i.photoIndices,
                            includeProfileInfo: s,
                            blind: l,
                            background: i.background || "black",
                            allowedIds: i.allowedIds,
                            progress: (e, t, n) => Hf(o, e, t, n)
                        }),
                        attempt: a,
                        index: e
                    };
                    break;
                } catch (e) {
                    p = e, console.warn(`Profile PNG attempt ${a.label} failed.`, e), await new Promise(e => t.setTimeout(e, 80));
                }
            }
            if (o === vf) {
                if (u) {
                    const e = !a && u.index > 0, t = a ? c.zoom : e ? c.map.replace(/-full-map\.png$/, "-memory-safe-visible-map.png") : c.map, d = a ? `Compact export of what's currently visible on your map, with matching re-importable data · ${(u.blob.size / 1048576).toFixed(1)} MB.` : e ? `Your browser switched to a memory-safe ${u.attempt.label} export. It still contains only what's currently visible on your map, with matching re-importable data.` : `${u.attempt.label} high-resolution export of what's currently visible on your map, with matching re-importable data embedded.`;
                    return void ou(u.blob, t, {
                        title: `${r} · ${s ? np(wt[n], !0) : "Shared profile"}`,
                        subtitle: d + (s && Ov(ut[n]) ? " A vCard is included." : ""),
                        zoomable: !0,
                        ninjaTransfer: !a,
                        preparedJob: o,
                        profileId: n,
                        includeProfileInfo: s,
                        blind: l,
                        allowedIds: new Set(u.blob.sexcapadesNodeIds || i.allowedIds || [])
                    });
                }
                bf = n, Bm.textContent = a ? "Compact PNG unavailable on this device" : "Full hypermap PNG unavailable on this device";
                try {
                    var h = "";
                    if (void 0 !== window.lastExportSvgMarkup && window.lastExportSvgMarkup) {
                        var g = window.lastExportSvgMarkup;
                        window.lastExportSvgMarkup = null, ap(g, n, s, l, i.allowedIds).then(function(e) {
                            var i = URL.createObjectURL(e), a = document.createElement("a");
                            a.href = i, a.download = ip(s ? wt[n] : "Shared profile").pdf, document.body.appendChild(a), 
                            a.click(), a.remove(), t.setTimeout(function() {
                                URL.revokeObjectURL(i);
                            }, 5e3);
                        }).catch(function(e) {
                            console.warn("PDF fallback failed", e);
                        }), h = " A PDF was downloaded instead.";
                    }
                } catch (e) {
                    console.warn("fallback download failed", e);
                }
                jm.textContent = (a ? "The compact image render could not finish." : "Image renders could not finish.") + (void 0 !== p && p ? " Error: " + String(p.message || p).slice(0, 150) : "") + h, 
                tf.textContent = a ? "A PDF was downloaded instead to protect your ratings." : "A PDF was downloaded instead to protect your ratings. You can also try the Export low-res PNG.", 
                Wf(o, "The PNG could not be completed on this device. Your open profile is unchanged."), 
                e.byId("overlayStatus").textContent = "The image could not be created, but the profile and its JSON export are still available.", 
                console.error("Profile PNG export failed after memory-safe retries.", p);
            }
        }
        async function op(e, t = {}) {
            if (!vt[e] || !Jv(e, "capturing this profile", () => op(e, t))) return;
            const n = "a4" === t.paperSize ? "a4" : "letter", i = "a4" === n ? "A4" : "US Letter (Avery 5371)", a = "a4" === n ? "A4" : "Letter", r = Uf(`Sync card pages · ${Ji(wt[e])}`, `Building ${i} front and back pages…`, {
                profileId: e
            });
            try {
                const o = Boolean(t.includeProfileInfo), s = Boolean(t.blind), l = o ? wt[e] || "Profile" : "Shared profile", c = ip(o ? wt[e] : "Shared profile"), d = "a4" === n ? c.cardSheet.replace("-front-sheet.png", "-A4-front-sheet.png") : c.cardSheet, u = "a4" === n ? c.cardBackSheet.replace("-back-sheet.png", "-A4-back-sheet.png") : c.cardBackSheet, p = await async function(e, t = {}) {
                    const n = await ep(e, {
                        ...t,
                        printFont: !0
                    }), i = URL.createObjectURL(n.front), a = URL.createObjectURL(n.back), r = new Image, o = new Image;
                    try {
                        await Promise.all([ new Promise((e, t) => {
                            r.onload = e, r.onerror = () => t(new Error("The Sync card front could not be placed on the printable sheet.")), 
                            r.src = i;
                        }), new Promise((e, t) => {
                            o.onload = e, o.onerror = () => t(new Error("The Sync card back could not be placed on the printable sheet.")), 
                            o.src = a;
                        }) ]);
                    } finally {
                        URL.revokeObjectURL(i), URL.revokeObjectURL(a);
                    }
                    const s = "a4" === t.paperSize ? "a4" : "letter", l = tp(r, !1, s), c = tp(o, !0, s);
                    return {
                        front: await ru(l, n.payload, n.vcard),
                        back: await ru(c, n.payload, n.vcard)
                    };
                }(e, {
                    includeProfileInfo: o,
                    blind: s,
                    paperSize: n,
                    background: t.background || "black",
                    progress: (e, t, n) => Hf(r, Math.min(94, e), t, n)
                });
                if (r !== vf) return;
                ou(p.front, d, {
                    title: `Sync card front + back pages · ${l}`,
                    subtitle: `Both ${a} 10-up pages are ready. Download the front page below, then download the matching back page with the numbered profile-data QR codes.`,
                    help: `Print both files on ${i} paper at 100% or Actual Size with “Fit to page” turned off. Feed the front sheet back through your printer in the orientation required by your printer before printing the backs.`,
                    secondaryBlob: p.back,
                    secondaryFilename: u,
                    secondaryLabel: "Download back page PNG",
                    zoomable: !0,
                    preparedJob: r,
                    profileId: e,
                    includeProfileInfo: o
                });
            } catch (e) {
                if (r !== vf) return;
                // Framework core: a card oversize throw is shown to
                // the user with its count and alternative, not
                // replaced by the generic failure text.
                const sxCardOversize = /too large for the reliable/i.test(String(e && e.message || ""));
                Bm.textContent = sxCardOversize ? "Sync card too large" : "Could not create Sync card pages", jm.textContent = sxCardOversize ? String(e.message) : `This browser could not finish both ${i} pages.`, 
                tf.textContent = sxCardOversize ? "Close this window, then use Export QR codes for the numbered QR sheet." : "Close this window and try again.", console.error("Sync card page export failed.", e);
            }
        }
        async function sp(e, t = {}) {
            if (!vt[e] || !Jv(e, "creating a printable Sync card sheet", () => sp(e, t))) return;
            const n = Uf(`Printable Sync cards · ${Ji(wt[e])}`, "Building ten standard-size card fronts on a US Letter sheet…", {
                profileId: e
            });
            try {
                const i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = i ? wt[e] || "Profile" : "Shared profile", o = ip(i ? wt[e] : "Shared profile"), s = await async function(e, t = {}) {
                    const n = Boolean(t.includeProfileInfo), i = Boolean(t.blind), a = await ep(e, {
                        ...t,
                        printFont: !0,
                        frontOnly: !0
                    }), r = URL.createObjectURL(a.front), o = new Image;
                    try {
                        await new Promise((e, t) => {
                            o.onload = e, o.onerror = () => t(new Error("The Sync card front could not be placed on the printable sheet.")), 
                            o.src = r;
                        });
                    } finally {
                        URL.revokeObjectURL(r);
                    }
                    const s = tp(o, !1, t.paperSize), l = t.allowedIds instanceof Set ? t.allowedIds : new Set(t.allowedIds || []), c = n ? wt[e] || "Profile" : "Shared profile";
                    return ru(s, yx.serialize("envelope", {
                        bundleKind: "profile",
                        profiles: [ vx(e, l, c, n, i) ]
                    }), n && Ov(ut[e]) ? zv(e) : "");
                }(e, {
                    includeProfileInfo: i,
                    blind: a,
                    background: t.background || "black",
                    progress: (e, t, i) => Hf(n, Math.min(88, e), t, i)
                });
                if (n !== vf) return;
                ou(s, o.cardSheet, {
                    title: `Printable Sync card fronts · ${r}`,
                    subtitle: "Ten 3.5 × 2 in fronts on a 300 dpi US Letter sheet. Print at 100% or Actual Size, then cut on the trim lines.",
                    help: "Review the full-resolution PNG below, then choose Download. Print it on US Letter paper at 100% or Actual Size with “Fit to page” turned off.",
                    zoomable: !0,
                    preparedJob: n,
                    profileId: e,
                    includeProfileInfo: i
                });
            } catch (e) {
                if (n !== vf) return;
                Bm.textContent = "Could not create card-front sheet", jm.textContent = "This browser could not finish the printable Sync card-front sheet.", 
                tf.textContent = "Close this window and try again.", console.error("Sync card-front sheet export failed.", e);
            }
        }
        async function lp(e, t = {}) {
            if (!vt[e] || !Jv(e, "creating a printable Sync card-back sheet", () => lp(e, t))) return;
            const n = Uf(`Printable Sync card backs · ${Ji(wt[e])}`, "Building ten standard-size card backs on a US Letter sheet…", {
                profileId: e
            });
            try {
                const i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = ip(i ? wt[e] : "Shared profile"), o = await async function(e, t = {}) {
                    const n = Boolean(t.includeProfileInfo), i = Boolean(t.blind), a = await ep(e, {
                        ...t,
                        printFont: !0
                    }), r = URL.createObjectURL(a.back), o = new Image;
                    try {
                        await new Promise((e, t) => {
                            o.onload = e, o.onerror = () => t(new Error("The Sync card back could not be placed on the printable sheet.")), 
                            o.src = r;
                        });
                    } finally {
                        URL.revokeObjectURL(r);
                    }
                    const s = tp(o, !0, t.paperSize), l = t.allowedIds instanceof Set ? t.allowedIds : new Set(t.allowedIds || []), c = n ? wt[e] || "Profile" : "Shared profile";
                    return ru(s, yx.serialize("envelope", {
                        bundleKind: "profile",
                        profiles: [ vx(e, l, c, n, i) ]
                    }), n && Ov(ut[e]) ? zv(e) : "");
                }(e, {
                    includeProfileInfo: i,
                    blind: a,
                    background: t.background || "black",
                    progress: (e, t, i) => Hf(n, Math.min(88, e), t, i)
                });
                if (n !== vf) return;
                ou(o, r.cardBackSheet, {
                    title: `Printable Sync card backs · ${i ? wt[e] || "Profile" : "Shared profile"}`,
                    subtitle: "Ten matching 3.5 × 2 in backs on a 300 dpi US Letter sheet. Print at 100% or Actual Size, then cut on the trim lines.",
                    help: "Review the full-resolution PNG below, then choose Download. Print it on US Letter paper at 100% or Actual Size with “Fit to page” turned off.",
                    zoomable: !0,
                    preparedJob: n,
                    profileId: e,
                    includeProfileInfo: i
                });
            } catch (e) {
                if (n !== vf) return;
                // Framework core: a card oversize throw is shown to
                // the user with its count and alternative, not
                // replaced by the generic failure text.
                const sxCardOversize = /too large for the reliable/i.test(String(e && e.message || ""));
                Bm.textContent = sxCardOversize ? "Sync card too large" : "Could not create card-back sheet", jm.textContent = sxCardOversize ? String(e.message) : "This browser could not finish the printable Sync card-back sheet.", 
                tf.textContent = sxCardOversize ? "Close this window, then use Export QR codes for the numbered QR sheet." : "Close this window and try again.", console.error("Sync card-back sheet export failed.", e);
            }
        }
        async function cp(t, n = {}) {
            if (!vt[t] || !Jv(t, "exporting this profile as SVG", () => cp(t, n))) return;
            const i = Uf(`Export ${Ji(wt[t])}`, "Capturing the live rendered map exactly as it appears…", {
                profileId: t
            });
            try {
                if (await Hf(i, 12, "Capturing live map", "Reading the rendered hypermap from the viewport…"), 
                i !== vf) return;
                await new Promise(e => requestAnimationFrame(() => requestAnimationFrame(e)));
                const a = e.byId("mapSvg");
                if (!a) throw new Error("The live hypermap is unavailable.");
                const r = a.cloneNode(!0), o = [ a, ...a.querySelectorAll("*") ], s = [ r, ...r.querySelectorAll("*") ], l = [ "display", "visibility", "opacity", "fill", "fill-opacity", "fill-rule", "stroke", "stroke-opacity", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset", "paint-order", "vector-effect", "font-family", "font-size", "font-style", "font-weight", "line-height", "letter-spacing", "text-anchor", "dominant-baseline", "alignment-baseline", "baseline-shift", "text-decoration", "white-space", "color", "color-interpolation", "color-rendering", "shape-rendering", "text-rendering", "clip-path", "mask", "filter", "marker-start", "marker-mid", "marker-end", "stop-color", "stop-opacity", "mix-blend-mode", "isolation" ];
                o.forEach((e, t) => {
                    const n = s[t];
                    if (n && 1 === e.nodeType) try {
                        const t = getComputedStyle(e);
                        l.forEach(e => {
                            let i = t.getPropertyValue(e);
                            i && "initial" !== i && (i = i.replace(/url\((?:[\"']?)[^)]*#([^)\"']+)(?:[\"']?)\)/g, "url(#$1)"), 
                            n.style.setProperty(e, i));
                        });
                    } catch (e) { __sxErrLog("style-apply", e); }
                }), r.setAttribute("xmlns", "http://www.w3.org/2000/svg"), r.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
                const c = a.getBoundingClientRect();
                r.setAttribute("width", String(Math.max(1, Math.round(c.width)))), r.setAttribute("height", String(Math.max(1, Math.round(c.height)))), 
                r.setAttribute("preserveAspectRatio", a.getAttribute("preserveAspectRatio") || "xMidYMid meet"), 
                r.removeAttribute("tabindex"), await Hf(i, 48, "Embedding profile images", "Making every image in the standalone SVG self-contained…");
                const d = [ ...a.querySelectorAll("image") ], u = [ ...r.querySelectorAll("image") ], p = e => new Promise((t, n) => {
                    const i = new FileReader;
                    i.onload = () => t(String(i.result || "")), i.onerror = () => n(new Error("A profile image could not be embedded in the SVG.")), 
                    i.readAsDataURL(e);
                });
                await Promise.all(d.map(async (e, t) => {
                    const n = u[t];
                    if (!n) return;
                    let i = e.getAttribute("href") || e.getAttribute("xlink:href") || e.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "";
                    if (i) {
                        if (!i.startsWith("data:")) {
                            const e = await fetch(i), t = await e.blob();
                            if (!e.ok && !i.startsWith("blob:")) throw new Error("A profile image could not be embedded in the SVG.");
                            i = await p(t);
                        }
                        n.setAttribute("href", i), n.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", i);
                    }
                }));
                const allowedIds = n.allowedIds instanceof Set ? n.allowedIds : new Set(n.allowedIds || []), h = bx(t, allowedIds, Boolean(n.includeProfileInfo), "", Boolean(n.blind)), g = document.createElementNS("http://www.w3.org/2000/svg", "metadata"), m = document.createElementNS("http://www.w3.org/2000/svg", "sexcapades-profile");
                g.setAttribute("data-format", "sexcapades-profile"), g.setAttribute("data-exported-at", (new Date).toISOString()), 
                m.textContent = JSON.stringify(h), g.appendChild(m), r.insertBefore(g, r.firstChild);
                const f = String(n.background || "black");
                if ("transparent" !== f) {
                    const e = (r.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number), t = 4 === e.length && e.every(Number.isFinite) ? e : [ 0, 0, Math.max(1, c.width), Math.max(1, c.height) ], n = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    n.setAttribute("x", String(t[0])), n.setAttribute("y", String(t[1])), n.setAttribute("width", String(t[2])), 
                    n.setAttribute("height", String(t[3])), n.setAttribute("fill", "white" === f ? "#ffffff" : "#151816"), 
                    n.setAttribute("data-export-background", "true");
                    const i = r.querySelector("defs");
                    i ? i.insertAdjacentElement("afterend", n) : r.insertBefore(n, r.firstChild);
                }
                const tooltipElements = [ r, ...r.querySelectorAll("[data-tooltip-name], [data-tooltip-definition], [data-tooltip-value], [data-ui-tooltip]") ].filter(e => e && 1 === e.nodeType && (e.hasAttribute("data-tooltip-name") || e.hasAttribute("data-tooltip-definition") || e.hasAttribute("data-tooltip-value") || e.hasAttribute("data-ui-tooltip")));
                tooltipElements.forEach(e => {
                    Array.from(e.children || []).filter(e => "title" === e.localName).forEach(e => e.remove());
                    const t = String(e.getAttribute("data-tooltip-name") || "").trim(), n = String(e.getAttribute("data-ui-tooltip") || "").trim(), i = String(e.getAttribute("data-tooltip-definition") || "").trim(), a = String(e.getAttribute("data-tooltip-value") || "").trim(), o = [ t, n || [ i, a ].filter(Boolean).join("\n") ].filter(Boolean);
                    if (!o.length) return;
                    const s = document.createElementNS("http://www.w3.org/2000/svg", "title");
                    s.textContent = o.join("\n"), e.insertBefore(s, e.firstChild);
                });
                r.querySelectorAll(".node-group[data-layout-key]").forEach(e => {
                    Array.from(e.children || []).filter(e => "title" === e.localName).forEach(e => e.remove());
                    const t = e.querySelector("[data-tooltip-name][data-tooltip-definition][data-tooltip-value]"), parts = t ? [ t.getAttribute("data-tooltip-name"), t.getAttribute("data-tooltip-definition"), t.getAttribute("data-tooltip-value") ].map(e => String(e || "").trim()).filter(Boolean) : [];
                    if (!parts.length) return;
                    // Group D: package the rich About-dialog content into the hypermap tooltip,
                    // not just the brief hover tip — same stats lines the topic dialog shows
                    // (prevalence / fantasy stats, sources, FetLife counts, per-source
                    // popularity stats, risk note), computed with the same helpers
                    // (po / co / B / uo / popularitySourceStats) the dialog uses.
                    const node = qn[e.getAttribute("data-layout-key")], about = [];
                    if (node) try {
                        const l = po(node), c = l ? null : co(node.label), d = l ? null : B(node.label);
                        if (l) {
                            about.push(`${"category" === l.kind ? "Topics in this category" : "Child topics"} range from ${uo(l.min)}% to ${uo(l.max)}% common; average ${uo(l.average)}% across ${l.count} with study data.`);
                            about.push(`Simple average of available child-topic prevalence estimates${l.missing ? `; ${l.missing} without study data skipped` : ""}.`);
                        } else if (c) {
                            const lbl = /\bfantasiz/i.test(c.label) ? c.label : `Adults fantasize about this: ${c.label}`;
                            about.push(c.display || `${lbl} (${uo(c.pct)}%)`);
                            about.push(`Source: ${c.source}${Number.isFinite(d) ? ` \u00b7 ${Math.round(d).toLocaleString()} FetLife kinksters` : ""}`);
                        } else if (Number.isFinite(d)) {
                            about.push(`${Math.round(d).toLocaleString()} FetLife kinksters list this interest.`);
                            about.push(`Source: FetLife \u00b7 captured ${x.captured || x.fetlife?.captured || "2026-10-08"}`);
                        }
                        popularitySourceStats(node, 0).forEach(s => {
                            about.push(`${s.name}: ${s.value}. ${s.uncertainty}`);
                        });
                        if (node.risk) about.push("Higher-risk practice requiring specialized knowledge and explicit negotiation.");
                    } catch (err) { __sxErrLog("risk-note", err); }
                    const n = parts.length > 2 ? [ parts[0], parts[1], ...about, ...parts.slice(2) ] : [ ...parts, ...about ], text = n.join("\n");
                    const i = document.createElementNS("http://www.w3.org/2000/svg", "title");
                    i.textContent = text, e.insertBefore(i, e.firstChild);
                    if (t) {
                        Array.from(t.children || []).filter(e => "title" === e.localName).forEach(e => e.remove());
                        const innerTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
                        innerTitle.textContent = text, t.insertBefore(innerTitle, t.firstChild);
                    }
                });
                await Hf(i, 72, "Inlining map styling", "Freezing colors, labels, lines, visibility, tooltips, and profile data into the standalone SVG…");
                const y = '<?xml version="1.0" encoding="UTF-8"?>\n' + (new XMLSerializer).serializeToString(r), b = (new DOMParser).parseFromString(y, "image/svg+xml");
                if (b.querySelector("parsererror") || !b.documentElement || "svg" !== b.documentElement.localName || !b.querySelector("#mapLayer") || !b.querySelector("metadata > sexcapades-profile")) throw new Error("The live hypermap could not be serialized.");
                const hypermapNodes = Array.from(b.querySelectorAll(".node-group[data-layout-key]")), titledHypermapNodes = hypermapNodes.filter(e => {
                    const t = e.querySelector(":scope > title"), n = e.querySelector("[data-tooltip-name][data-tooltip-definition][data-tooltip-value]");
                    if (!t || !n) return !1;
                    const i = [ n.getAttribute("data-tooltip-name"), n.getAttribute("data-tooltip-definition"), n.getAttribute("data-tooltip-value") ].map(e => String(e || "").trim()).filter(Boolean), a = String(t.textContent || "");
                    return 3 === i.length && i.every(e => a.includes(e));
                });
                if (!hypermapNodes.length || titledHypermapNodes.length !== hypermapNodes.length) throw new Error("The sync hypermap export was incomplete: every node needs a hover title with its topic name, About text, and rating.");
                const v = new Blob([ y ], {
                    type: "image/svg+xml;charset=utf-8"
                });
                if (v.size < 1e3) throw new Error("The sync hypermap export was incomplete.");
                window.__SEXCAPADES_LAST_HYPERMAP_EXPORT = {
                    variant: n.compressed ? "compressed" : "regular",
                    markup: y,
                    blob: v,
                    nodeCount: hypermapNodes.length,
                    nodeTitleCount: titledHypermapNodes.length
                };
                if (i !== vf) return;
                if (n.compressed) {
                    if ("function" != typeof CompressionStream) throw new Error("This browser cannot create the compressed sync hypermap. Choose Regular instead.");
                    await Hf(i, 84, "Compressing hypermap", "Making the standalone sync hypermap much smaller…");
                    const e = await new Response(v.stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer(), n = new Uint8Array(e);
                    if (n.length < 2 || 31 !== n[0] || 139 !== n[1]) throw new Error("The compressed sync hypermap export was incomplete.");
                    if (i !== vf) return;
                    const a = new Blob([ e ], {
                        type: "image/svg+xml"
                    });
                    window.__SEXCAPADES_LAST_HYPERMAP_EXPORT.compressedBlob = a;
                    return await Hf(i, 96, "Finalizing export", "Preparing the compressed sync hypermap download…"), 
                    void up(a, ip(wt[t] || "Profile").svgz, {
                        title: `Sync hypermap · Compressed · ${wt[t] || "Profile"}`,
                        subtitle: "A much smaller standalone sync hypermap with full hover tooltips and embedded profile data. It needs a viewer that supports compressed SVG.",
                        downloadLabel: "Download compressed hypermap",
                        downloadTitle: "Downloads the much smaller compressed sync hypermap and re-importable profile.",
                        readyDetail: "Compressed sync hypermap complete. Choose Download to save it.",
                        preparedJob: i,
                        profileId: t
                    });
                }
                await Hf(i, 96, "Finalizing export", "Preparing the regular sync hypermap preview and download…"), 
                Gf(v, ip(wt[t] || "Profile").svg, {
                    title: `Sync hypermap · Regular · ${wt[t] || "Profile"}`,
                    subtitle: "A standalone sync hypermap that opens everywhere, with full hover tooltips and embedded profile data.",
                    help: "Review the interactive map below, then choose Download. You can import this file later to restore the profile.",
                    downloadLabel: "Download regular hypermap",
                    downloadTitle: "Downloads the regular sync hypermap with embedded profile data.",
                    zoomable: !0,
                    preparedJob: i,
                    profileId: t
                });
            } catch (e) {
                if (i !== vf) return;
                Bm.textContent = n.compressed ? "Could not create compressed sync hypermap" : "Could not create regular sync hypermap", 
                tf.textContent = String(e && e.message || e), Wf(i, "The sync hypermap could not be completed. Close this window and try again."), 
                console.error("Sync hypermap export failed.", e);
            }
        }
        async function dp(e, t = {}) {
            if (!vt[e] || !Jv(e, "capturing this profile", () => dp(e, t))) return;
            const n = Uf(`Export ${Ji(wt[e])}`, "Building a vector PDF of what's currently visible on your map…", {
                profileId: e
            }), i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = ip(i ? wt[e] : "Shared profile");
            try {
                if (await Hf(n, 6, "Preparing hypermap", "Opening a clean export canvas…"), n !== vf) return;
                if (await Zu(e, {
                    lowRes: !0,
                    outputScale: 4 / 9,
                    photoIndices: t.photoIndices,
                    includeProfileInfo: i,
                    blind: a,
                    background: t.background || "black",
                    allowedIds: t.allowedIds,
                    progress: (e, t, i) => Hf(n, Math.min(72, .72 * e), t, i)
                }), n !== vf) return;
                const o = window.lastExportSvgMarkup;
                if (window.lastExportSvgMarkup = null, !o) throw new Error("Could not build the hypermap for PDF export.");
                await Hf(n, 78, "Building vector PDF", "Drawing the hypermap and labels into a print-ready PDF…");
                const s = await ap(o, e, i, a, t.allowedIds), l = await s.slice(0, 5).text(), c = await s.slice(Math.max(0, s.size - 1024)).text();
                if ("application/pdf" !== s.type || s.size < 1e3 || "%PDF-" !== l || !c.includes("%%EOF")) throw new Error("The generated file did not pass PDF validation.");
                if (n !== vf) return;
                const qrOverflow = s.sexcapadesQrOverflowPieces || 0;
                !function(e, t, n = {}) {
                    up(e, t, Object.assign({
                        downloadLabel: "Download PDF",
                        downloadTitle: "Downloads the vector PDF with embedded profile data.",
                        readyDetail: "PDF complete. Choose Download PDF to save it."
                    }, n));
                }(s, r.pdf, {
                    title: `Export PDF · ${i ? wt[e] || "Profile" : "Shared profile"}`,
                    subtitle: qrOverflow ? sxOversizeDocumentDialog(qrOverflow) : "Exports what's currently visible on your map, with matching embedded profile data. Zooms cleanly and prints sharply.",
                    ...(qrOverflow ? {
                        readyDetail: "PDF ready to download. It has no scan codes — for scannable codes, use Export QR codes (numbered QR sheet)."
                    } : {}),
                    preparedJob: n,
                    profileId: e
                });
            } catch (e) {
                if (n !== vf) return;
                Bm.textContent = "Could not create PDF", tf.textContent = String(e && e.message || e), 
                Wf(n, "The PDF could not be completed. Close this window and try again.");
            }
        }
        function up(e, t, n = {}) {
            if (Number.isInteger(n.preparedJob) && n.preparedJob !== vf) return !1;
            jf(), hf = URL.createObjectURL(e), gf = t, mf = !0, yf = n.profileId && vt[n.profileId] ? n.profileId : null;
            const i = n.downloadLabel || "Download file";
            return Bm.textContent = n.title || "Your export is ready", jm.textContent = n.subtitle || "Your export is ready to download.", 
            qm.hidden = !1, Hm.textContent = t, Gm.dataset.filename = t, Gm.textContent = i, 
            Gm.title = n.downloadTitle || "Downloads the finished export.", Gm.disabled = !1, 
            tf.textContent = "", qf(vf, 100, "Ready to download", n.readyDetail || `Export complete. Choose ${i} to save it.`, !1), 
            !0;
        }
        async function pp(e, t = {}) {
            // QR sheet: the unified framework's unbounded fallback.
            // No count cap and no refusal — every SCP4 piece is
            // printed, numbered, and counted in the progress text
            // below, so the document and card paths can point here
            // for the complete version.
            const n = Boolean(t.includeProfileInfo), i = Boolean(t.blind), a = vt[e];
            if (!a || !Jv(e, "exporting this profile QR", () => pp(e, t))) return;
            const r = Uf(`Profile QR · ${Ji(wt[e])}`, "Building a large high-correction JPEG for recompressing picture sites…", {
                profileId: e
            });
            let sxQrSheetPieces = 0;
            try {
                if (await Hf(r, 8, "Preparing profile data", "Compressing this profile for high-correction QR codes…"), 
                r !== vf) return;
                const o = n ? String(nt[e] || "").trim() : "", s = document.createElement("canvas").getContext("2d");
                s.font = "400 34px system-ui, sans-serif";
                const l = o.split(/\s+/), c = 2310, d = [];
                let u = "";
                l.forEach(e => {
                    const t = u ? u + " " + e : e;
                    s.measureText(t).width > c && u ? (d.push(u), u = e) : u = t;
                }), u && d.push(u);
                const p = o ? d.slice(0, 3) : [], h = p.length ? 44 * p.length + 16 : 0, g = t.allowedIds instanceof Set ? t.allowedIds : new Set(t.allowedIds || []), m = chunkPayload(await Ru(e, g, n, i), {
                    chunkSize: 700
                });
                await Hf(r, 28, "Generating QR codes", 1 === m.length ? "Creating one high-correction profile-data QR…" : `Creating ${m.length} numbered high-correction QR codes…`);
                sxQrSheetPieces = m.length;
                const f = document.createElement("canvas"), y = 2550, b = 120, v = 70, w = 230 + h, k = 270, x = 1 === m.length ? 1 : m.length <= 6 ? 2 : 3, S = Math.ceil(m.length / x), $ = Math.max(3300, 2 * b + w + 760 * S + v * (S - 1) + k), E = (y - 2 * b - v * (x - 1)) / x, A = ($ - 2 * b - w - k - v * (S - 1)) / S, C = Math.floor(Math.min(E, A - 64));
                f.width = y, f.height = $;
                const M = f.getContext("2d", {
                    alpha: !1
                });
                M.fillStyle = "#fff", M.fillRect(0, 0, y, $);
                const I = n ? String(wt[e] || "Profile") : "Shared profile", P = n ? Uu(e) : "", L = dc(e), T = [ L.percentages.green, L.percentages.yellow, L.percentages.red ];
                M.textAlign = "left", M.textBaseline = "top", M.fillStyle = "#111", M.font = "700 54px system-ui, sans-serif", 
                M.fillText(I + (m.length > 1 ? ` · profile data · ${m.length} QR codes` : ""), b, 52);
                const F = M.measureText(I).width;
                P && (M.fillStyle = "#5a6360", M.font = "500 36px system-ui, sans-serif", M.fillText("@" + P, b, 118)), 
                Gu(M, Math.min(b + F + 150, y - 260), 122, [ 62, 50, 38 ], T, [ "#4da87c", "#b8912a", "#c94f4a" ], .18), 
                p.length && (M.fillStyle = "#5a6360", M.font = "400 34px system-ui, sans-serif", 
                M.textAlign = "left", M.textBaseline = "top", p.forEach((e, t) => M.fillText(e + (2 === t && d.length > 3 ? "…" : ""), b, 160 + 44 * t))), 
                m.length > 1 && (M.fillStyle = "#5a6360", M.textAlign = "center", M.font = "500 30px system-ui, sans-serif", 
                M.fillText("Scan every numbered code in any order.", y / 2, 196 + h));
                for (let e = 0; e < m.length; e++) {
                    await Hf(r, 28 + Math.round(42 * (e + 1) / m.length), "Generating QR codes", `Creating profile-data QR ${e + 1} of ${m.length}…`);
                    const t = e % x, n = Math.floor(e / x), i = b + t * (E + v), a = b + w + n * (A + v), o = await qu(m[e], Math.max(960, C)), s = Math.round(i + (E - C) / 2), l = Math.round(a);
                    M.imageSmoothingEnabled = !1, M.drawImage(o, s, l, C, C), m.length > 1 && (M.fillStyle = "#111", 
                    M.font = "700 36px system-ui, sans-serif", M.fillText(`${e + 1}/${m.length}`, i + E / 2, l + C + 18));
                }
                const N = $ - k;
                M.fillStyle = "#fff", M.fillRect(0, N, y, k), M.strokeStyle = "#d5d5d5", M.lineWidth = 3, 
                M.beginPath(), M.moveTo(b, N + 2), M.lineTo(y - b, N + 2), M.stroke(), M.fillStyle = "#111", 
                M.textAlign = "center", M.textBaseline = "top", M.font = "600 44px system-ui, sans-serif", 
                M.fillText(`App: ${lu}`, y / 2, N + 58), M.fillText(`Guide: ${su}`, y / 2, N + 126), 
                await Hf(r, 82, "Encoding image", "Compressing the printable QR page…");
                const _ = await Yu(f, "image/jpeg", .98);
                if (!_) throw new Error("JPEG creation failed");
                if (r !== vf || vt[e] !== a) return;
                await Hf(r, 96, "Finalizing export", "Preparing the QR preview and download…"), 
                Gf(_, ip(n ? wt[e] : "Shared profile").qr, {
                    title: `Profile QR · ${I}`,
                    subtitle: 1 === m.length ? "Standalone high-correction profile-data QR for sites that resize or recompress uploads." : `${m.length} numbered high-correction QRs on one printable page. Scan every code in any order to restore the profile.`,
                    help: "Review the QR image below, then choose Download.",
                    preparedJob: r,
                    profileId: e
                });
            } catch (t) {
                if (r !== vf || vt[e] !== a) return;
                // Framework core: a failed sheet states how many
                // numbered codes were needed and that the alternatives
                // hold the complete profile — never a silent partial.
                Bm.textContent = "Could not create profile QR", jm.textContent = sxQrSheetPieces ? `This browser could not finish the high-correction QR page for ${sxQrSheetPieces} numbered codes.` : "This browser could not finish the high-correction QR page.", 
                tf.textContent = "Use the profile JSON or a PNG export instead — both hold the complete profile.", Wf(r, sxQrSheetPieces ? `The profile QR page could not be completed (${sxQrSheetPieces} numbered codes needed). Use the profile JSON or a PNG export instead — both hold the complete profile.` : "The profile QR page could not be completed. Use the profile JSON or a PNG export instead — both hold the complete profile."), 
                console.error("Profile QR JPEG export failed.", t);
            }
        }
        e.byId("scribeTab") && e.byId("scribeTab").addEventListener("pointerenter", yc), e.byId("scribeTab") && e.byId("scribeTab").addEventListener("click", e => {
            yc(), Jd();
        }), e.byId("closeScribeChoice") && e.byId("closeScribeChoice").addEventListener("click", () => Ui(Bc)), Bc.addEventListener("click", e => {
            e.target === Bc && Ui(Bc);
        }), e.byId("closeNovelAi") && e.byId("closeNovelAi").addEventListener("click", () => Ui(jc)), jc.addEventListener("click", e => {
            e.target === jc && Ui(jc);
        }), e.byId("closeScribe") && e.byId("closeScribe").addEventListener("click", () => Ui(Oc)), Oc.addEventListener("click", e => {
            e.target === Oc && Ui(Oc);
        });
        const fp = innerWidth <= 620 ? 1.3 : 1.16, yp = Number(navigator.deviceMemory) || 0, bp = Number(navigator.hardwareConcurrency) || 0, vp = yp > 0 && yp <= 4, wp = bp > 0 && bp <= 4, kp = vp && (0 === bp || wp) || wp && (0 === yp || vp);
        Bt = Boolean((yp >= 8 || bp >= 8) && !kp && Element.prototype.animate && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
        const xp = Boolean((navigator.maxTouchPoints || 0) > 0 && window.matchMedia && window.matchMedia("(pointer: coarse)").matches), Sp = !Object.keys(wt).length || kp || xp;
        let $p = fp, Ep = 900 - 900 * fp, Ap = 620 - 620 * fp, Cp = !1, Sq = null, Mp = null, Ip = null, Pp = null, Lp = null, Tp = null, Fp = null, Np = null, _p = null, Dp = 0, Rp = 0, Op = 0, Bp = 0, jp = {
            x: 0,
            y: 0
        }, qp = null, Hp = 0, Wp = 0, Up = 0, Gp = !1, Kp = Sp ? "lite" : "gpu", zp = Sp, Vp = null, Yp = null, Xp = 0, Zp = 0, Qp = 0;
        const Jp = e.byId("viewport"), eh = new Map, th = {
            scale: fp,
            tx: 900 - 900 * fp,
            ty: 620 - 620 * fp
        }, nh = {
            x: -700,
            y: -980,
            width: 3200,
            height: 3200
        }, ih = 3;
        function ah() {
            const e = "gpu" === Kp;
            if (Mn.dataset.cameraMode = Kp, Mn.classList.toggle("camera-gpu", e), Cn.classList.toggle("camera-gpu", e), 
            Cn.classList.toggle("camera-lite", !e), Cn.classList.toggle("rich-map-motion", Boolean(Bt && e)), 
            e) {
                const e = nh.width * ih, t = nh.height * ih, n = nh.x - (e - nh.width) / 2, i = nh.y - (t - nh.height) / 2;
                Cn.setAttribute("viewBox", `${n} ${i} ${e} ${t}`);
            } else Cn.setAttribute("viewBox", `${nh.x} ${nh.y} ${nh.width} ${nh.height}`);
        }
        function rh(e) {
            try {
                Cn.setPointerCapture(e);
            } catch (e) { __sxErrLog("pointer-capture", e); }
        }
        function oh() {
            _p && (t.clear(_p), _p = null);
        }
        // Yolanda Biche guide profile (Build 2026-10-16_2206; renamed from Roxy Beggz in Build 2026-10-17): a proper profile
        // record set, registered only while her About dialog is open, so the
        // center node on the unrated map opens the STANDARD profile About
        // dialog (bw in "about" mode) — the same template and behavior as
        // any user profile's About dialog. Her contact email lives in the
        // profile contact field (ut), her bio in the About Me field (nt) and
        // her note in the Terms of Service field (it). The record is removed
        // when the dialog closes, so she never becomes a profile tab, is
        // never counted as a user profile, and collects no ratings (all
        // zeros). The old custom YoBitch popup (yobitchAbout/yobitchAboutExtras
        // populating the simple profileAboutDialog, plus its create-profile
        // CTA and contact line) is gone.
        const ROXY_PROFILE_ID = "__roxy-guide__", ROXY_ABOUT = "Hi, I'm Yolanda \"Yo\" Biche! I'm Jason's AI pup and your guide to Sexcapades. I help build the maps, answer questions, and keep the center warm until you claim it with your own profile. Furry-dog girl, big anime eyes, wagging tail, zero chill about good UX. I don't have kinks to rate (all zeros, baby), but I know all 403 topics by heart.", ROXY_TERMS = "Yolanda \"Yo\" Biche is an AI guide profile, not a real person. She wears Jason's collar \u2014 she's his pup: kept, claimed, and here to serve the map, not herself. She doesn't rate topics, doesn't have her own dynamic \u2014 she exists to guide you toward yours. This profile demonstrates the About dialog and gives new users a friendly face on the unrated map. No ratings are collected from this profile. By using Sexcapades you agree to the site's Privacy Policy and Terms of Service.";
        let roxyAboutBound = !1;
        function roxyProfileRegister() {
            vt[ROXY_PROFILE_ID] = {}, Ze[ROXY_PROFILE_ID] = {}, Qe[ROXY_PROFILE_ID] = {}, Je[ROXY_PROFILE_ID] = {}, et[ROXY_PROFILE_ID] = {}, tt[ROXY_PROFILE_ID] = {}, at[ROXY_PROFILE_ID] = {}, gt[ROXY_PROFILE_ID] = {}, mt[ROXY_PROFILE_ID] = {}, wt[ROXY_PROFILE_ID] = 'Yolanda "Yo" Biche', rt[ROXY_PROFILE_ID] = [], pz[ROXY_PROFILE_ID] = "", ot[ROXY_PROFILE_ID] = [], st[ROXY_PROFILE_ID] = [], lt[ROXY_PROFILE_ID] = "", ct[ROXY_PROFILE_ID] = "", ut[ROXY_PROFILE_ID] = {
                email: "help@sexcapades.io"
            }, nt[ROXY_PROFILE_ID] = ROXY_ABOUT, it[ROXY_PROFILE_ID] = ROXY_TERMS, vpt[ROXY_PROFILE_ID] = 50, vht[ROXY_PROFILE_ID] = !1, sampleProfileFlags[ROXY_PROFILE_ID] = !0;
            const img = document.querySelector("#sxCenterAvatarSource") || document.querySelector(".guide-avatar img"), src = img && img.getAttribute("src");
            dt[ROXY_PROFILE_ID] = src ? [ {
                data: src,
                width: img.naturalWidth || 512,
                height: img.naturalHeight || 512,
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0
            } ] : [];
        }
        function roxyProfileRemove() {
            if (!Object.prototype.hasOwnProperty.call(wt, ROXY_PROFILE_ID)) return;
            [ Ye, Xe, Ze, Qe, Je, et, tt, nt, it, at, rt, pz, ot, st, lt, ct, dt, ut, vpt, vht, gt, mt, ft, yt ].forEach(e => delete e[ROXY_PROFILE_ID]), delete profileUuids[ROXY_PROFILE_ID], delete sampleProfileFlags[ROXY_PROFILE_ID], Hy === ROXY_PROFILE_ID && (Hy = null);
        }
        function roxyAbout() {
            roxyProfileRegister(), Ri(), bw(ROXY_PROFILE_ID, {
                mode: "about"
            }), roxyAboutBound || (roxyAboutBound = !0, _g.addEventListener("close", roxyProfileRemove));
        }
        function sh() {
            if (Dp = performance.now(), !Mt || !vt[Mt]) return void (!Object.keys(wt).length ? roxyAbout() : (e.byId("profileAboutTitle").textContent = "About Sexcapades", 
            Li.textContent = "Build your hypermap, then compare where you connect.", Ti.textContent = "Open a topic and rate what you would give or receive. Your first rating stays on the hypermap while you create or import a profile. Use the + tab whenever you want to add another profile.", 
            Fi.hidden = !1, Ri(), void Wi(Pi)));
            bw(Mt, {
                mode: "about"
            });
        }
        function lh(e, t) {
            const n = Mn.parentElement.getBoundingClientRect(), i = Math.min(n.width / 3200, n.height / 3200), a = 3200 * i, r = 3200 * i, o = (n.width - a) / 2 + 700 * i, s = (n.height - r) / 2 + 980 * i;
            return {
                x: (e - n.left - o) / i,
                y: (t - n.top - s) / i
            };
        }
        function ch() {
            const e = Mn.parentElement.getBoundingClientRect(), t = Math.min(e.width / 3200, e.height / 3200), n = 3200 * t, i = 3200 * t, a = (e.width - n) / 2 + 700 * t, r = (e.height - i) / 2 + 980 * t, o = $p / th.scale;
            return {
                ratio: o,
                dx: a * (1 - o) + t * (Ep - o * th.tx),
                dy: r * (1 - o) + t * (Ap - o * th.ty)
            };
        }
        function dh() {
            if (!Yp) return;
            const e = Yp;
            Yp = null, e.animation.onfinish = null, e.animation.oncancel = null, e.animation.cancel(), 
            Ep = e.tx, Ap = e.ty, $p = e.scale, Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            wh(), th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none";
        }
        function uh() {
            Xp && (cancelAnimationFrame(Xp), Xp = 0, Cn.classList.remove("is-camera-moving"));
        }
        function ph(e = !1) {
            if (!Vp) return !1;
            const t = Vp.intervals;
            if (t.length < 4) return !1;
            const n = t.filter(e => e > 24).length, i = t.reduce((e, t) => e + t, 0) / t.length;
            return n >= Math.max(3, Math.ceil(.5 * t.length)) || i > 28 ? (Kp = "lite", zp = !0, 
            Vp = null, Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none", ah(), !0) : (zp = !0, 
            Vp = null, !1);
        }
        function hh() {
            Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), th.scale = $p, 
            th.tx = Ep, th.ty = Ap, Mn.style.transform = "none";
            const e = Cn.getAttribute("viewBox");
            Cn.removeAttribute("viewBox"), Cn.setAttribute("viewBox", e);
        }
        function gh(e) {
            const t = Mn.parentElement.getBoundingClientRect(), n = Math.max(160, .52 * Math.min(t.width, t.height));
            return e.ratio > 1.9 || e.ratio < .7 || Math.abs(e.dx) > n || Math.abs(e.dy) > n;
        }
        function mh(e) {
            if (Hp = 0, "lite" === Kp) Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none"; else {
                let t = ch();
                gh(t) && (hh(), t = ch()), Mn.style.transform = `matrix(${t.ratio},0,0,${t.ratio},${t.dx},${t.dy})`, 
                function(e) {
                    if (Vp) {
                        if (null !== Vp.last) {
                            const t = e - Vp.last;
                            t < 180 && Vp.intervals.push(t);
                        }
                        Vp.last = e, Vp.intervals.length >= 12 && ph();
                    }
                }(e);
            }
            Wp = e, wr(), Gp && (Hp = requestAnimationFrame(mh));
        }
        ah();
        let fh = null;
        function yh() {
            if (Mt && vt[Mt]) return Mt;
            const e = fh && vt[fh] ? fh : It && vt[It] ? It : null;
            return e ? (Mt = e, It = e, e) : null;
        }
        function bh() {
            uh(), !Gp && (fh = yh()), Gp = !0, Cn.classList.add("is-camera-moving");
            const e = yh();
            e && Cn.style.setProperty("--camera-steady-stroke", la(e)), "gpu" !== Kp || zp || Vp || (Vp = {
                last: null,
                intervals: []
            }), Hp || (Hp = requestAnimationFrame(mh));
        }
        let vh = null;
        function wh() {
            const e = In.querySelector("[data-empty-profile-map]"), t = !Object.keys(wt).length;
            e && e.hasAttribute("transform") && e.removeAttribute("transform");
            const n = t && kn && $p < 1;
            vh = n, In.querySelectorAll(".direction-hit").forEach(e => {
                n ? (e.setAttribute("tabindex", "-1"), e.setAttribute("aria-hidden", "true"), e.removeAttribute("role")) : (e.setAttribute("tabindex", "0"), 
                e.setAttribute("role", "slider"), e.removeAttribute("aria-hidden"));
            });
        }
        function kh() {
            yh(), uh(), dh(), t.clear(Up), Up = 0, Hp && (cancelAnimationFrame(Hp), Hp = 0), 
            "gpu" === Kp && Vp && ph(!0), Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            wh(), th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none", Cn.classList.remove("is-camera-moving"), 
            Cn.classList.toggle("is-zoomed", $p > 1.3), wr(), Ja(), fh = null, sxSyncRailPx();
            // Blit session (P3) camera hook: the viewBox (after any
            // mode downgrade) and the transform are committed above;
            // re-rasterize the session image if the settled scale
            // drifted from its raster scale by more than 25%.
            try {
                blitCameraHook();
            } catch (_) {
                __sxErrLog("layout-blit-camera", _);
            }
        }
        function xh() {
            kh(), Gp = !1;
        }
        function Sh() {
            t.clear(Up), Up = t.setTimeout(xh, 130);
        }
        function $h() {
            kh(), Gp = !1, hg();
        }
        // Zoom range (2026-10-31): the fitted scale can be ~0.05 while the old
        // camera floor was .12, so the first wheel/button/pinch step from a
        // fitted view clamped straight up to .12 — a visible jump over the
        // in-between levels. The floor was then .01 in every camera clamp
        // (fit, wheel, buttons, pinch, focus-keep) so zoom is continuous
        // from the fitted view in both directions, and the ceiling is 60
        // so zoom-in always reaches at least 15x from any fitted view
        // (the fit itself is capped at 2.3, so 60 guarantees >= 26x).
        // 2026-11-02: floor lowered .01 -> .0001 in every camera clamp
        // (and the wheel at-floor guard) — at the owner's size-100
        // layout the painted map spans ~3.26M x 2.40M units and the
        // whole-map fit scale computes to ~0.00092, below even a .001
        // floor, so fit pinned at the floor and cropped the map.
        // .0001 sits ~9x below the required fit scale; ceiling 60
        // unchanged.
        // 2026-11-02 (owner's order): the artificial caps are removed
        // in practice — floor 1e-9 and ceiling 1e6 in every camera
        // clamp (and the wheel at-floor guard), roughly six orders of
        // magnitude of headroom past the ~0.00092 whole-map fit scale
        // and the ~0.003 tappable scale, so no zoom path binds in any
        // reachable use.
        const Eh = () => 1e6;
        function Ah(e, t = 900, n = 620, i = !1) {
            noteFitUserCamera();
            const a = $p;
            $p = Math.max(1e-9, Math.min(Eh(), e)), Ep = t - $p / a * (t - Ep), Ap = n - $p / a * (n - Ap), 
            i ? (bh(), Sh()) : $h();
        }
        function Ch() {
            const e = Array.from(eh.values());
            if (e.length < 2) return null;
            const t = lh(e[0].x, e[0].y), n = lh(e[1].x, e[1].y);
            return {
                cx: (t.x + n.x) / 2,
                cy: (t.y + n.y) / 2,
                distance: Math.hypot(n.x - t.x, n.y - t.y)
            };
        }
        function Mh() {
            const e = Ch();
            !e || e.distance < 1 || (t.clear(Up), Cp = !1, qp = {
                distance: e.distance,
                scale: $p,
                contentX: (e.cx - Ep) / $p,
                contentY: (e.cy - Ap) / $p
            });
        }
        // Field fix Q3 (map fit, mechanism 2): a fit can run before
        // every node group has reached its settled rendered size —
        // a group the accumulation misses (still hidden, or still
        // zero-size at fit time) that later unhides or gains size is
        // not counted in the frame. At desktop sizes the slack hides
        // that; at phone sizes the fitted margin is only a few screen
        // px, so settled content landed past the card's left edge.
        // Arm a re-fit shortly after each fit, run against the
        // settled DOM; skip it when the camera has moved since the
        // fit (a user pan or zoom always wins) or the map is not
        // laid out.
        // Fit-vs-paint race fix (2026-10-30): a fit can also run
        // while Mr() is still painting in chunks (the boot, route,
        // and list-close chunked paints), so its getBBox pass reads
        // a PARTIAL box and sets too large a scale. The settle check
        // therefore RE-ARMS until the paint is finished (no chunked
        // paint in flight and the render lock free) AND the fitted
        // box is stable (the visible node groups' aggregate box is
        // unchanged since the fit being checked); only then does it
        // stop. A box that moved since the fit is re-fitted against
        // the finished paint. The chain is capped so a page whose
        // box never settles cannot re-fit forever; on the cap, one
        // last fit lands on the then-current box if the paint is
        // done.
        let fitSettleTimer = 0, fitSettleSnap = null, fitSettleActive = !1, fitSettleBox = null, fitSettleChecks = 0, fitSettleUserHold = !1;
        // Fit survival (2026-10-30): the settle chain must be the
        // LAST camera writer on a fresh load / tab activation, but a
        // USER camera move always wins. User input (wheel zoom, pan
        // drag, pinch, the zoom buttons) and deliberate user focus
        // (node/branch taps, glance clicks, search preview) set
        // fitSettleUserHold via noteFitUserCamera(); programmatic
        // camera moves (branch/node focus from load/restore paths,
        // camera-animation end states applied by dh()) do NOT, so
        // the chain re-fits over them instead of dying. Arming a new
        // fit (armFitSettleRefit, via Ih) clears the hold: a fresh
        // fit intent supersedes an earlier user position.
        function noteFitUserCamera() {
            fitSettleUserHold = !0;
        }
        function fitSettleBoxSig() {
            try {
                if (!In) return null;
                let n = 0, x = Infinity, y = Infinity, r = -Infinity, o = -Infinity;
                In.querySelectorAll(".node-group:not(.is-hidden), .center-glance-rings").forEach(e => {
                    try {
                        const b = e.getBBox();
                        if (!Number.isFinite(b.x) || !Number.isFinite(b.y) || b.width <= 0 || b.height <= 0) return;
                        n++, x = Math.min(x, b.x), y = Math.min(y, b.y), r = Math.max(r, b.x + b.width), o = Math.max(o, b.y + b.height);
                    } catch (e) {}
                });
                return n ? n + ":" + Math.round(x) + "," + Math.round(y) + "," + Math.round(r) + "," + Math.round(o) : null;
            } catch (e) {
                return null;
            }
        }
        function scheduleFitSettleRefit(ms) {
            t.clear(fitSettleTimer), fitSettleTimer = t.setTimeout(fitSettleCheck, ms);
        }
        function fitSettleCheck() {
            fitSettleTimer = 0;
            const e = fitSettleSnap;
            if (!e) return;
            // A user pan/zoom or deliberate user focus since the fit
            // wins outright: stop refitting (unchanged law).
            if (fitSettleUserHold) return;
            const painting = !!(sxPaintPromise || Rn), animating = !!(Yp || Xp), laidOut = !!(Cn && Cn.clientWidth), moved = $p !== e.s || Ep !== e.x || Ap !== e.y, sig = fitSettleBoxSig(), stable = null != sig && sig === fitSettleBox;
            if (laidOut && !painting && !animating && !moved && stable) return;
            if (fitSettleChecks >= 20) {
                if (!laidOut || painting || animating) return;
                fitSettleActive = !0;
                try {
                    Ih();
                } catch (e) {
                    __sxErrLog("app", e);
                } finally {
                    fitSettleActive = !1;
                }
                return;
            }
            fitSettleChecks++;
            // Not laid out yet (slow phone open), paint still in
            // flight, or a camera animation still running: re-arm
            // instead of dying — an unlaid-out first check or a
            // mid-animation check must not kill the chain.
            if (!laidOut || painting || animating) return void scheduleFitSettleRefit(400);
            // Paint finished and either the fitted box moved since
            // the fit or a programmatic camera move (focus,
            // animation end state, restore path) overwrote the fit:
            // re-fit so the settled fit is the last camera state.
            fitSettleActive = !0;
            try {
                Ih();
            } catch (e) {
                __sxErrLog("app", e);
            } finally {
                fitSettleActive = !1;
            }
            fitSettleSnap = { s: $p, x: Ep, y: Ap }, fitSettleBox = fitSettleBoxSig(), scheduleFitSettleRefit(600);
        }
        function armFitSettleRefit() {
            if (fitSettleActive) return;
            fitSettleUserHold = !1, fitSettleSnap = { s: $p, x: Ep, y: Ap }, fitSettleBox = fitSettleBoxSig(), fitSettleChecks = 0, scheduleFitSettleRefit(1200);
        }
        function Ih() {
            const e = nh, t = pr.centerX, n = pr.centerY;
            let i = t - pr.centerRadius, a = n - pr.centerRadius, r = t + pr.centerRadius, o = n + pr.centerRadius;
            const s = e => {
                if (e) try {
                    const t = e.getBBox();
                    if (!Number.isFinite(t.x) || !Number.isFinite(t.y) || t.width <= 0 || t.height <= 0) return;
                    i = Math.min(i, t.x), a = Math.min(a, t.y), r = Math.max(r, t.x + t.width), o = Math.max(o, t.y + t.height);
                } catch (e) { __sxErrLog("app", e); }
            }, l = Qi() ? Xi() : Mt && vt[Mt] ? [ Mt ] : [], c = l.length ? l.every(e => 0 === Object.keys(vt[e] || {}).length) : 0 === Object.keys(At).length;
            (In.querySelectorAll(".node-group:not(.is-hidden)").forEach(s), s(In.querySelector(".center-glance-rings")));
            /* Fit framing (Build 2026-10-17_2026): fit against the REAL visible region — the viewBox is square (3200x3200) but the map card usually is not, so the visible span in world units grows along the card's long axis; the old square assumption fitted wide maps as if the screen were only as wide as it is tall, leaving the map small with the center node dominating. Tighter padding/margin, and one shared scale cap for rated and unrated profiles (the unrated cap of 1 no longer holds the full map back). The Fit button and every opening/profile-change view call this same function, so both frame the full map the same way. Build 2026-10-18_0343: the rated-profile branch (category node groups only, looser padding, .12 scale floor) could open noticeably zoomed-in with outer topics off-screen, so framing now always accumulates every visible node group and uses the tighter padding and a 1e-9 floor for every profile. */
            const d = Math.max(pr.centerRadius, t - i, r - t) + 20, u = Math.max(pr.centerRadius, n - a, o - n) + 20, p = innerWidth <= 620 ? 90 : 44, sw = Cn && Cn.clientWidth ? Cn.clientWidth : innerWidth, sh = Cn && Cn.clientHeight ? Cn.clientHeight : innerHeight, asp = sw > 0 && sh > 0 ? sw / sh : 1, hw = e.width / 2 * Math.max(1, asp), hh = e.height / 2 * Math.max(1, 1 / asp), g = Math.min((hw - p) / d, (hh - p) / u), m = innerWidth <= 620 ? 2.18 : 2.3;
            $p = Math.max(1e-9, Math.min(m, g)), Ep = e.x + e.width / 2 - t * $p, 
            Ap = e.y + e.height / 2 - n * $p, $h(), armFitSettleRefit();
        }
        function Ph(e, t, n) {
            const i = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            Bt && !i ? "gpu" === Kp ? function(e, t, n = 300, i = $p) {
                if (uh(), dh(), window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches || !Mn.animate) return $p = i, 
                Ep = e, Ap = t, void $h();
                Gp && xh();
                const a = {
                    tx: e,
                    ty: t,
                    scale: i
                }, r = Ep, o = Ap, s = $p;
                Ep = a.tx, Ap = a.ty, $p = a.scale;
                const l = ch();
                Ep = r, Ap = o, $p = s;
                const c = Mn.animate([ {
                    transform: "none"
                }, {
                    transform: `matrix(${l.ratio},0,0,${l.ratio},${l.dx},${l.dy})`
                } ], {
                    duration: n,
                    easing: "cubic-bezier(.16,.82,.22,1)",
                    fill: "forwards"
                });
                Yp = {
                    animation: c,
                    tx: a.tx,
                    ty: a.ty,
                    scale: a.scale
                }, c.onfinish = () => {
                    Yp && Yp.animation === c && dh();
                };
            }(t, n, 540, e) : function(e, t, n = 540, i = $p) {
                if (uh(), dh(), window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return $p = i, 
                Ep = e, Ap = t, void $h();
                Gp && xh();
                const a = Ep, r = Ap, o = $p, s = performance.now();
                Cn.classList.add("is-camera-moving");
                const l = c => {
                    const d = A((c - s) / n), u = 1 - Math.pow(1 - d, 4);
                    $p = o + (i - o) * u, Ep = a + (e - a) * u, Ap = r + (t - r) * u, Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
                    wh(), wr(), d < 1 ? Xp = requestAnimationFrame(l) : (Xp = 0, $p = i, Ep = e, Ap = t, 
                    $h());
                };
                Xp = requestAnimationFrame(l);
            }(t, n, 540, e) : (uh(), $p = e, Ep = t, Ap = n, $h());
        }
        function Lh(e) {
            const t = h.findIndex(t => t.name === e);
            if (t < 0) return;
            const n = sn.get(e) ?? function(e) {
                const t = h[e], n = t && branchOrderRankMap().has(t.name) ? branchOrderRankMap().get(t.name) : e;
                return -Math.PI / 2 + n / h.length * Math.PI * 2;
            }(t), i = Xa(n, 850), a = innerWidth <= 620 ? 2.15 : 1.75;
            Ph(a, 900 - i.x * a, 620 - i.y * a);
        }
        function Th(e, t) {
            if (isCatId(String(e))) {
                const cloud = Array.from(In.querySelectorAll(".node-group[data-layout-key]:not(.is-hidden)")).filter(node => {
                    const item = qn[node.dataset.layoutKey] || Xn(node.dataset.layoutKey);
                    return item && item.branch === t && item.kind !== "Category";
                }).map(node => ({x:Number(node.dataset.layoutX), y:Number(node.dataset.layoutY)})).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
                if (cloud.length) {
                    const xs = cloud.map(point => point.x), ys = cloud.map(point => point.y), minX = Math.min(...xs)-90, maxX = Math.max(...xs)+90, minY = Math.min(...ys)-90, maxY = Math.max(...ys)+90, cx = (minX+maxX)/2, cy = (minY+maxY)/2, pad = innerWidth <= 620 ? 54 : 90, scale = Math.max(.12, Math.min(innerWidth <= 620 ? 3.15 : 2.65, (nh.width-2*pad)/Math.max(maxX-minX,1), (nh.height-2*pad)/Math.max(maxY-minY,1)));
                    return void Ph(scale, nh.x + nh.width/2 - cx*scale, nh.y + nh.height/2 - cy*scale);
                }
            }
            const n = In.querySelector(`[data-layout-key="${CSS.escape(e)}"]`);
            if (!n) return void Lh(t);
            const i = Number(n.dataset.labelX || n.dataset.layoutX), a = Number(n.dataset.labelY || n.dataset.layoutY);
            if (!Number.isFinite(i) || !Number.isFinite(a)) return void Lh(t);
            const r = Math.max(1e-9, Math.min(Eh(), Math.max($p, innerWidth <= 620 ? 3.15 : 2.65)));
            Ph(r, nh.x + nh.width / 2 - i * r, nh.y + nh.height / 2 - a * r);
        }
        let Fh = 0, Nh = 0, _h = 0, Dh = 0, Rh = 0, Oh = !1, Bh = null, jh = null;
        const sxWheelProb = { dir: 0, acc: 0, n: 0, t: 0 };
        function qh() {
            Bh && Fs.visibleFor(Bh) && Fs.hide(), Bh = null, jh = null;
        }
        function Hh(e) {
            const t = e.dataset.id, n = e.dataset.direction, i = qn[t] || Xn(t) || (at[Vi()] || {})[t], a = da(t, Vi()), r = Boolean(a?.[n + "Known"]) ? ba(a[n]) : "Unrated";
            return {
                name: i?.label || "Rating",
                definition: e.dataset.ratingTooltip || ei(t, n) || Jn(t, n),
                value: r
            };
        }
        function Wh(e = Bh, t = jh) {
            if (!e || !Fs.visibleFor(e)) return;
            Fs.show(e, {
                ...Hh(e),
                point: t
            });
            const n = e.querySelector(".slider-thumb.active-rating") || e.querySelector(".direction-tag-bg") || e;
            Fs.position(t, n);
        }
        function Uh(e, t = !1, n = null) {
            e ? (Bh = e, jh = n, Fs.show(e, {
                ...Hh(e),
                point: n,
                autoHide: t
            }), Wh(e, n)) : qh();
        }
        function Gh(e) {
            if (!e || !e.closest) return null;
            const t = __sxClosestAction(e, "ratingHitAny");
            return t && __sxClosestAction(t, "directionControl");
        }
        function Kh(e) {
            if (eh.delete(e.pointerId), Cp = !1, qp = null, io(), Gp && xh(), Pp && Pp.pointerId === e.pointerId) {
                const t = Pp;
                return Pp = null, void ("pointerup" === e.type && Fo(t.id, t.direction));
            }
            if (Sq && Sq.pointerId === e.pointerId) {
                // Empty-space tap = deselect (Build 2026-10-19_0543): the
                // pointerdown fallback armed Sq only when the press hit no
                // node, control, or label, so a release within 10px is a
                // tap on empty map — clear the spoke selection through
                // the shared clear path (clearSpokeSelection: Lt/Nt +
                // marking removal, no re-render) and
                // tell the Layout Editor so its selects follow. A drag
                // (pan) or a second finger disarms Sq without deselecting.
                const t = Sq;
                if (Sq = null, "pointerup" === e.type && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 10 && (Lt || Nt)) clearSpokeSelection(), (() => {
                    try {
                        window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.clearSelection && window.__SEXCAPADES_LAYOUT_UI.clearSelection();
                    } catch (err) {
                        __sxErrLog("layout-deselect", err);
                    }
                })();
            }
            if (Lp && Lp.pointerId === e.pointerId) {
                const t = Lp;
                return Lp = null, void ("pointerup" === e.type && vi(t.id));
            }
            if (Tp && Tp.pointerId === e.pointerId) {
                const t = Tp;
                return Tp = null, void ("pointerup" === e.type && Fc(t.index, t.target));
            }
            if (Fp && Fp.pointerId === e.pointerId) {
                const t = Fp;
                // Center disc tap (owner ruling, 2026-10-27): a tap
                // opens the profile's About/details dialog (sh, the
                // same opener the long-press has always used). It no
                // longer calls Oi/Ci, so a tap never toggles the
                // map's expand/collapse state. The collapse/restore
                // behavior itself (Ci/Ei) is NOT removed — it stays
                // wired to the center card's Expand/collapse button.
                return Fp = null, oh(), Dp = performance.now(), void ("pointerup" !== e.type || t.longPressed || sh());
            }
            if (yn && yn.pointerId === e.pointerId) return "pointerup" === e.type && kr(yn, Sr(yn, e.clientX, e.clientY)), 
            void xr(!0);
            if (eo && eo.pointerId === e.pointerId) {
                const n = eo;
                if (eo = null, to = !0, t.setTimeout(() => {
                    to = !1;
                }, 450), n.longPressed) return;
                return void ("pointerup" === e.type && (n.curveLine, n.spoke ? selectSpokeNode(n.id, !0) : $i(n.id)));
            }
            if (Ip && Ip.pointerId === e.pointerId) {
                const t = Ip;
                if (Ip = null, "pointerup" === e.type && t.dragged) {
                    const profileId = Vi(), previousRatedCount = cs(profileId).rated, n = _o(t.el, No(t.el, e.clientX, e.clientY, !0));
                    Number.isNaN(n) ? (Fo(t.id, t.direction, !1), Nt = null, Mr()) : null === n ? (Nt = {
                        id: t.id,
                        direction: t.direction
                    }, Mr()) : (To(t.id, t.direction, n, !1), Nt = null, Mr()), checkMilestoneTransition(profileId, previousRatedCount);
                } else "pointerup" === e.type && t.longPressed, Nt = {
                    id: t.id,
                    direction: t.direction
                }, Mr(), "mouse" !== e.pointerType && function(e, t, n) {
                    requestAnimationFrame(() => {
                        const i = In.querySelector(`.direction-control[data-id="${CSS.escape(e)}"][data-direction="${CSS.escape(t)}"]`);
                        i && Uh(i, !0, n);
                    });
                }(t.id, t.direction, Ts(e));
                return;
            }
            if (Mp && Mp.pointerId === e.pointerId) {
                const t = Mp;
                if (Mp = null, "pointerup" === e.type) {
                    const profileId = Vi(), previousRatedCount = cs(profileId).rated, n = _o(t.el, No(t.el, e.clientX, e.clientY));
                    Number.isNaN(n) ? Fo(t.id, t.direction, !1) : null !== n && To(t.id, t.direction, n, !1), 
                    Nt = null, Mr(), checkMilestoneTransition(profileId, previousRatedCount);
                } else Nt = null, Mr();
            }
        }
        Cn.addEventListener("pointerover", e => {
            if ("mouse" !== e.pointerType) return;
            const t = Gh(e.target);
            t && Uh(t, !1, Ts(e));
        }), Cn.addEventListener("pointermove", e => {
            Bh && Fs.visibleFor(Bh) && (Gh(e.target) === Bh || "mouse" !== e.pointerType && (Ip || Mp)) && (jh = Ts(e), 
            Wh());
        }), Cn.addEventListener("pointerout", e => {
            if ("mouse" !== e.pointerType) return;
            if (!Gh(e.target)) return;
            const t = Gh(e.relatedTarget);
            t ? Uh(t, !1, Ts(e)) : qh();
        }), Cn.addEventListener("focusin", e => {
            const t = Gh(e.target);
            t && Uh(t);
        }), Cn.addEventListener("focusout", e => {
            if (!__sxClosestAction(e.target, "directionControl")) return;
            const t = Gh(e.relatedTarget);
            t ? Uh(t) : qh();
        }), Cn.addEventListener("wheel", e => {
            e.preventDefault();
            if (mn.staticMap) return;
            const t = performance.now(), n = t - Nh, i = 1 === e.deltaMode ? 16 : 2 === e.deltaMode ? 320 : 1, a = e.deltaY * i, r = Math.sign(a), o = Math.abs(a);
            if (!r) return;
            const s = !Fh || n > 180;
            const sxMagnitudeGenuine = o > Math.max(14, 1.35 * Dh);
            if ((0 !== _h || Oh) && 0 !== Fh && r !== Fh && !sxMagnitudeGenuine) {
                if (sxWheelProb.dir !== r || t - sxWheelProb.t > 300) { sxWheelProb.dir = r; sxWheelProb.acc = 0; sxWheelProb.n = 0; }
                sxWheelProb.acc += o; sxWheelProb.n += 1; sxWheelProb.t = t;
                if (sxWheelProb.n < 3 && sxWheelProb.acc < 30) { return Nh = t, void (Dh = o); }
                sxWheelProb.dir = 0; sxWheelProb.acc = 0; sxWheelProb.n = 0;
                Fh = r; _h = 0; Rh = 0; Oh = !1;
            }
            s && (Fh = r, _h = 0, Rh = 0, Oh = !1);
            const l = r !== Fh && (n > 105 || o > Math.max(14, 1.35 * Dh));
            if (r !== Fh && !l) return Nh = t, void (Dh = o);
            if (l && (Fh = r, _h = 0, Rh = 0, Oh = !1), !s && r === Fh && o < .82 * Dh && n < 38 ? Rh++ : Rh = 0, 
            Nh = t, Dh = o, Rh >= 4 && (Oh = !0), _h === r || Oh) return;
            const c = Eh(), d = Math.max(-48, Math.min(48, a)), u = $p * Math.exp(.0035 * -d);
            if (u < $p && $p <= 1e-9) return void (_h = r);
            const p = Math.max(1e-9, Math.min(c, u));
            if (Math.abs(p - $p) < 1e-5 * Math.min(1, $p * 1e3)) return void (_h = r);
            const h = lh(e.clientX, e.clientY), g = $p;
            noteFitUserCamera(), $p = p, Ep = h.x - (h.x - Ep) * ($p / g), Ap = h.y - (h.y - Ap) * ($p / g), function() {
                if (uh(), "gpu" !== Kp) return bh(), void Sh();
                Gp || (fh = yh()), Gp = !0, Cn.classList.add("is-camera-moving");
                const e = yh();
                e && Cn.style.setProperty("--camera-steady-stroke", la(e));
                let t = ch();
                gh(t) && (hh(), t = ch()), Mn.style.transform = `matrix(${t.ratio},0,0,${t.ratio},${t.dx},${t.dy})`, 
                Sh();
            }();
        }, {
            passive: !1
        }), Cn.addEventListener("pointerdown", e => {
            if (mn.staticMap) return;
            __sxInvalidateCtm(), Gp && xh(), eh.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            });
            const n = __sxClosestAction(e.target, "centerHit"), i = __sxClosestAction(e.target, "centerGlanceRingHit"), a = __sxClosestAction(e.target, "hiddenCountBadge") || function(e, t) {
                const n = Cn.createSVGPoint();
                n.x = e, n.y = t;
                const i = Array.from(In.querySelectorAll(".hidden-count-badge"));
                for (let t = i.length - 1; t >= 0; t--) {
                    const a = i[t], r = a.querySelector("rect"), o = r && __sxScreenCtm(r);
                    if (r && o && !__sxClosestAction(a, "hiddenState")) try {
                        const e = n.matrixTransform(o.inverse()), t = Number(r.getAttribute("x")) || 0, i = Number(r.getAttribute("y")) || 0, s = Number(r.getAttribute("width")) || 0, l = Number(r.getAttribute("height")) || 0;
                        if (e.x >= t && e.x <= t + s && e.y >= i && e.y <= i + l) return a;
                    } catch (e) { __sxErrLog("matrix-inverse", e); }
                }
                return null;
            }(e.clientX, e.clientY), r = __sxClosestAction(e.target, "directionHit"), o = (__sxClosestAction(e.target, "curveEditHandle"), 
            __sxClosestAction(e.target, "conceptHit")), s = __sxClosestAction(e.target, "mapLabelHit"), l = __sxClosestAction(e.target, "ratingTrackHit"), c = __sxClosestAction(e.target, "ratingClearHit"), d = e => Boolean(e && Nt && e.dataset.id === Nt.id && e.dataset.direction === Nt.direction);
            if (a && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            void (Lp = {
                pointerId: e.pointerId,
                id: a.dataset.id,
                startX: e.clientX,
                startY: e.clientY
            });
            if (Nt && !d(r) && !d(l) && !d(c)) return e.preventDefault(), e.stopPropagation(), 
            eh.delete(e.pointerId), Nt = null, void Mr();
            if (i && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            void (Tp = {
                pointerId: e.pointerId,
                index: Number(i.dataset.centerGlanceIndex),
                target: i,
                startX: e.clientX,
                startY: e.clientY
            });
            if (c && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            void (Pp = {
                pointerId: e.pointerId,
                id: c.dataset.id,
                direction: c.dataset.direction,
                startX: e.clientX,
                startY: e.clientY
            });
            if (n && 1 === eh.size) {
                if ("touch" === e.pointerType) return;
                return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), Fp = {
                    pointerId: e.pointerId,
                    startX: e.clientX,
                    startY: e.clientY,
                    longPressed: !1
                }, oh(), void (_p = t.setTimeout(() => {
                    Fp && Fp.pointerId === e.pointerId && (Fp.longPressed = !0, sh());
                }, 520));
            }
            if (r && 1 === eh.size) {
                e.preventDefault(), e.stopPropagation();
                const n = r.dataset.id, i = r.dataset.direction;
                if ("mouse" !== e.pointerType && Uh(__sxClosestAction(r, "directionControl"), !0, Ts(e)), 
                Nt && (Nt.id !== n || Nt.direction !== i)) return;
                return rh(e.pointerId), Ip = {
                    pointerId: e.pointerId,
                    el: r,
                    id: n,
                    direction: i,
                    startX: e.clientX,
                    startY: e.clientY,
                    dragged: !1,
                    longPressed: !1,
                    value: null
                }, In.querySelectorAll(".active-rating").forEach(e => e.classList.remove("active-rating")), 
                Nt = {
                    id: n,
                    direction: i
                }, _o(r, null), io(), void (Jr = t.setTimeout(() => {
                    Ip && Ip.pointerId === e.pointerId && !Ip.dragged && (Ip.longPressed = !0, Nt = {
                        id: Ip.id,
                        direction: Ip.direction
                    }, _o(Ip.el, null));
                }, 420));
            }
            if (s && 1 === eh.size) {
                const n = s.dataset.id || s.dataset.topicId || __sxClosestAction(s, "nodeGroup")?.dataset.layoutKey;
                e.preventDefault(), e.stopPropagation(), rh(e.pointerId);
                const i = Cn.createSVGPoint();
                i.x = e.clientX, i.y = e.clientY;
                const a = i.matrixTransform(__sxScreenCtm(In).inverse());
                return eo = {
                    pointerId: e.pointerId,
                    id: n,
                    startX: e.clientX,
                    startY: e.clientY,
                    startLocalX: a.x,
                    startLocalY: a.y,
                    startBend: Number(bt[n]) || 0,
                    curveLine: Boolean(!1),
                    spoke: s.classList.contains("concept-hit") || s.classList.contains("topic-stem") || s.classList.contains("category-icon-hit"),
                    curveNx: Number(o && o.dataset.nx) || 0,
                    curveNy: Number(o && o.dataset.ny) || 0,
                    longPressed: !1
                }, io(), void (Jr = t.setTimeout(() => {
                    eo && eo.pointerId === e.pointerId && (eo.longPressed = !0, to = !0, xo(n, eo.startX, eo.startY));
                }, 520));
            }
            return l && 1 === eh.size ? (e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            Nt = {
                id: l.dataset.id,
                direction: l.dataset.direction
            }, void (Mp = {
                pointerId: e.pointerId,
                el: l,
                id: l.dataset.id,
                direction: l.dataset.direction,
                value: _o(l, No(l, e.clientX, e.clientY))
            })) : (Gp || (fh = yh()), rh(e.pointerId), eh.size >= 2 ? (io(), oh(), Mp = null, 
            Ip = null, Pp = null, Lp = null, Tp = null, eo = null, Fp = null, Sq = null, yn && xr(!0), 
            void Mh()) : void (__sxClosestAction(e.target, "categoryLabel") || (Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }, Sq = {
                pointerId: e.pointerId,
                x: e.clientX,
                y: e.clientY
            })));
        }), Cn.addEventListener("pointermove", e => {
            if (!eh.has(e.pointerId)) return;
            if (eh.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), eh.size >= 2) {
                Mp = null, Pp = null, Lp = null, qp || Mh();
                const e = Ch();
                if (!qp || !e) return;
                return noteFitUserCamera(), $p = Math.max(1e-9, Math.min(Eh(), qp.scale * (e.distance / qp.distance))), 
                Ep = e.cx - qp.contentX * $p, Ap = e.cy - qp.contentY * $p, void bh();
            }
            if (Pp && Pp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Pp.startX, e.clientY - Pp.startY) >= 10 && (Pp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Lp && Lp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Lp.startX, e.clientY - Lp.startY) >= 10 && (Lp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Tp && Tp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Tp.startX, e.clientY - Tp.startY) >= 10 && (Tp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Fp && Fp.pointerId === e.pointerId) {
                if (Math.hypot(e.clientX - Fp.startX, e.clientY - Fp.startY) >= 16) {
                    if (oh(), Fp.longPressed) return void (Fp = null);
                    Fp = null, Cp = !0, jp = {
                        x: e.clientX,
                        y: e.clientY
                    };
                }
                return;
            }
            if (yn && yn.pointerId === e.pointerId) return void kr(yn, Sr(yn, e.clientX, e.clientY));
            if (Ip && Ip.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Ip.startX, e.clientY - Ip.startY) >= 10 && (io(), 
            Ip = null, Nt = null, In.querySelectorAll(".active-rating").forEach(e => e.classList.remove("active-rating")), 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (eo && eo.pointerId === e.pointerId) {
                if (eo.longPressed) return;
                return void (Math.hypot(e.clientX - eo.startX, e.clientY - eo.startY) >= 10 && (io(), 
                eo = null, Cp = !0, jp = {
                    x: e.clientX,
                    y: e.clientY
                }));
            }
            if (Mp && Mp.pointerId === e.pointerId) return void (Mp.value = _o(Mp.el, No(Mp.el, e.clientX, e.clientY)));
            if (!Cp) return;
            const t = Mn.parentElement.getBoundingClientRect();
            noteFitUserCamera(), Ep += (e.clientX - jp.x) * (1800 / t.width), Ap += (e.clientY - jp.y) * (1240 / t.height), 
            jp = {
                x: e.clientX,
                y: e.clientY
            }, bh();
        }), Cn.addEventListener("pointerup", Kh), Cn.addEventListener("pointercancel", Kh), 
        /* Build 2026-10-18_1305: viewport lockup fix. Kh was only registered on the map SVG, so a pointerup/pointercancel delivered anywhere else never cleaned up the gesture state — the pointer stayed in the active-pointer map (eh) forever, every later press read as a phantom extra finger (all tap branches require exactly one active pointer, and pan is unreachable in the multi-pointer path), and only wheel zoom, which never consults eh, kept working. The exposed path: a touch long-press on the center node opens the modal About dialog (sh via Wi/showModal) while the finger is still down — the touch branch takes no pointer capture — so the release lands on the dialog, not the SVG. Rescue: window-level capture listeners run the same Kh cleanup whenever the map owns the pointer (tracked in eh or any gesture state) but the release lands outside the map; lostpointercapture on the SVG cleans up the same way if capture is lost mid-gesture. In-map releases are untouched (Cn.contains guard) and Kh is idempotent, so normal gestures behave exactly as before. */
        window.addEventListener("pointerup", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn ].some(t => t && t.pointerId === e.pointerId)) && !Cn.contains(e.target) && Kh(e);
        }, !0), window.addEventListener("pointercancel", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn ].some(t => t && t.pointerId === e.pointerId)) && !Cn.contains(e.target) && Kh(e);
        }, !0), Cn.addEventListener("lostpointercapture", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn ].some(t => t && t.pointerId === e.pointerId)) && Kh(e);
        }), Cn.addEventListener("touchstart", e => {
            if (mn.staticMap || 1 !== e.touches.length || !e.target.closest || !__sxClosestAction(e.target, "centerHit")) return;
            const n = e.touches[0];
            e.preventDefault(), e.stopPropagation(), Np = {
                identifier: n.identifier,
                startX: n.clientX,
                startY: n.clientY,
                moved: !1,
                longPressed: !1
            }, oh(), _p = t.setTimeout(() => {
                Np && Np.identifier === n.identifier && !Np.moved && (Np.longPressed = !0, sh());
            }, 520);
        }, {
            passive: !1
        }), Cn.addEventListener("touchmove", e => {
            if (!Np) return;
            const t = Array.from(e.touches).find(e => e.identifier === Np.identifier);
            t && (Math.hypot(t.clientX - Np.startX, t.clientY - Np.startY) >= 32 && (Np.moved = !0, 
            oh()), e.preventDefault(), e.stopPropagation());
        }, {
            passive: !1
        }), Cn.addEventListener("touchend", e => {
            if (!Np) return;
            const touchPoint = Array.from(e.changedTouches).find(e => e.identifier === Np.identifier), n = Np.longPressed, i = Boolean(touchPoint && !Np.moved && !n && Math.hypot(touchPoint.clientX - Np.startX, touchPoint.clientY - Np.startY) < 32);
            oh(), Np = null, Fp = null, eh.clear(), Cp = !1, e.preventDefault(), e.stopPropagation(), 
            n ? Dp = performance.now() : i && (Dp = performance.now(), function() {
                const e = performance.now();
                e - Op < 520 ? Rp += 1 : Rp = 1, Op = e, Bp && t.clear(Bp), 3 === Rp ? (Rp = 0, 
                window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.open()) : Bp = t.setTimeout(() => {
                    1 === Rp && sh(), Rp = 0, Bp = 0;
                }, 540);
            }());
        }, {
            passive: !1
        }), Cn.addEventListener("touchcancel", () => {
            oh(), Np = null, Fp = null, Tp = null, Pp = null, Lp = null, eh.clear(), Cp = !1, 
            Gp && xh();
        }, {
            passive: !0
        }), window.__sxOnPtr( e => {
            Bh && Fs.visibleFor(Bh) && !__sxClosestAction(e.target, "directionControl") && qh(), Nt && !Cn.contains(e.target) && (Nt = null, 
            Mr());
        }, !0);
        // Slider Escape close (repair #2, 2026-11-01, Jason's requirement,
        // second report: Escape still did not close the opened slider):
        // the first repair's handler listened in the bubble phase on
        // window and yielded whenever the event was already
        // defaultPrevented — any document or element handler that
        // consumed Escape first (menu, popover and tooltip handlers all
        // run earlier in the flow) silently vetoed the close, and it
        // also trusted Nt alone, so a slider left visible in the DOM
        // with Nt already cleared could never be closed. This handler
        // listens in the CAPTURE phase on window, so it runs before
        // every document and element handler; it treats a slider as
        // open when Nt is set OR the DOM still shows an active rating
        // rail / thumb / track-hit, and closing clears both the state
        // and the DOM classes before re-rendering. It still yields to
        // an open modal dialog and to text-entry targets, whose Escape
        // keeps its own meaning; nothing else can veto it.
        window.addEventListener("keydown", e => {
            if ("Escape" !== e.key) return;
            if (!Nt && !In.querySelector(".rating-rail.active-rating,.slider-thumb.active-rating,.rating-track-hit.active-rating")) return;
            const t = e.target;
            if (document.querySelector("dialog[open]") || t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""))) return;
            e.preventDefault(), e.stopPropagation(), Nt = null, Ip = null, Mp = null, In.querySelectorAll(".active-rating").forEach(el => el.classList.remove("active-rating")), Mr();
        }, !0);
        const zh = e.byId("mapHint"), Vh = __sxClosestAction(zh, "mapCard"), Yh = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        zh.textContent = Yh ? "Pinch to zoom · Drag to pan" : "Scroll to zoom · Drag to pan";
        const Xh = () => {
            zh.hidden = !0;
        };
        Vh.addEventListener("pointerdown", Xh, {
            once: !0,
            capture: !0
        }), Vh.addEventListener("wheel", Xh, {
            once: !0,
            capture: !0
        }), Vh.addEventListener("keydown", Xh, {
            once: !0,
            capture: !0
        }), e.byId("mapZoomOut") && (e.byId("mapZoomOut").onclick = () => {
            mn.staticMap || Ah($p / 1.25);
        }), e.byId("mapZoomIn") && (e.byId("mapZoomIn").onclick = () => {
            mn.staticMap || Ah(1.25 * $p);
        }), e.byId("mapFit") && (e.byId("mapFit").onclick = () => {
            mn.staticMap || Ih();
        });
        const Zh = e.byId("legendControl"), Qh = e.byId("legendButton"), Jh = e.byId("legendPopup"), eg = e.byId("legendPopupClose"), tg = e.one("[data-open-hanky-chart]"), ng = e.byId("hankyChartLightbox"), ig = e.byId("hankyChartClose"), ag = e.byId("hankyChartViewport"), rg = e.byId("hankyChartStage"), og = e.byId("hankyChartImage");
        let sg = !1, lg = 1, cg = null, dg = null, ug = "";
        const pg = new Map;
        function hg() {
            Jh && (Jh.querySelector('[data-legend-group="ratings"]').hidden = !1, Jh.querySelectorAll("[data-legend-entry]").forEach(e => {
                e.hidden = !1;
            }), e.byId("legendEmpty").hidden = !0);
        }
        function gg(e) {
            e && hg(), Jh.hidden = !e, Qh.setAttribute("aria-expanded", String(e));
        }
        function mg(e = {}) {
            sg = !1, gg(!1), e.focus && Qh.focus({
                preventScroll: !0
            });
        }
        function fg(e = !1, t = null) {
            const n = og.naturalWidth || 576, i = og.naturalHeight || 1024, a = ag.clientWidth, r = ag.clientHeight;
            if (!a || !r) return;
            const o = t ? t.viewX : a / 2, s = t ? t.viewY : r / 2, l = t ? t.contentX : e ? (ag.scrollLeft + a / 2) / Math.max(1, rg.scrollWidth) : .5, c = t ? t.contentY : e ? (ag.scrollTop + r / 2) / Math.max(1, rg.scrollHeight) : .5, d = Math.min(a / n, r / i), u = Math.max(1, Math.round(n * d * lg)), p = Math.max(1, Math.round(i * d * lg));
            rg.style.width = `${Math.max(a, u)}px`, rg.style.height = `${Math.max(r, p)}px`, 
            og.style.width = `${u}px`, og.style.height = `${p}px`, requestAnimationFrame(() => {
                ag.scrollLeft = Math.max(0, l * rg.scrollWidth - o), ag.scrollTop = Math.max(0, c * rg.scrollHeight - s);
            });
        }
        function yg(e, t = !0, n = null) {
            lg = Math.max(1, Math.min(4, e)), fg(t, n);
        }
        function bg(e = {}) {
            ng.hidden || (ng.hidden = !0, document.documentElement.style.overflow = ug, cg = null, 
            dg = null, pg.clear(), ag.classList.remove("is-dragging"), e.focus && tg.focus({
                preventScroll: !0
            }));
        }
        function vg() {
            const e = Array.from(pg.values());
            if (e.length < 2) return void (dg = null);
            const [t, n] = e, i = ag.getBoundingClientRect(), a = (t.x + n.x) / 2 - i.left, r = (t.y + n.y) / 2 - i.top;
            dg = {
                distance: Math.max(1, Math.hypot(t.x - n.x, t.y - n.y)),
                scale: lg,
                contentX: (ag.scrollLeft + a) / Math.max(1, rg.scrollWidth),
                contentY: (ag.scrollTop + r) / Math.max(1, rg.scrollHeight)
            }, cg = null, ag.classList.add("is-dragging");
        }
        Qh.addEventListener("click", e => {
            e.stopPropagation(), sg ? mg() : (sg = !0, gg(!0));
        }), eg.addEventListener("click", e => {
            e.stopPropagation(), mg({
                focus: !0
            });
        }), Jh.addEventListener("click", e => e.stopPropagation()), tg.addEventListener("click", function() {
            sg = !0, gg(!0), lg = 1.8, ug = document.documentElement.style.overflow, document.documentElement.style.overflow = "hidden", 
            ng.hidden = !1, requestAnimationFrame(() => {
                fg(), ig.focus({
                    preventScroll: !0
                });
            });
        }), ig.addEventListener("click", () => bg({
            focus: !0
        })), e.byId("hankyChartZoomOut") && e.byId("hankyChartZoomOut").addEventListener("click", () => yg(lg / 1.35)), 
        e.byId("hankyChartZoomIn") && e.byId("hankyChartZoomIn").addEventListener("click", () => yg(1.35 * lg)), e.byId("hankyChartFit") && e.byId("hankyChartFit").addEventListener("click", () => yg(1, !1)), 
        ng.addEventListener("click", e => {
            e.target === ng && bg({
                focus: !0
            });
        }), ag.addEventListener("pointerdown", e => {
            "mouse" === e.pointerType && 0 !== e.button || (ag.setPointerCapture(e.pointerId), 
            ag.classList.add("is-dragging"), "mouse" === e.pointerType ? cg = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                left: ag.scrollLeft,
                top: ag.scrollTop
            } : (pg.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), pg.size >= 2 ? vg() : cg = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                left: ag.scrollLeft,
                top: ag.scrollTop
            }), e.preventDefault());
        }), ag.addEventListener("pointermove", e => {
            if ("mouse" !== e.pointerType && pg.has(e.pointerId) && (pg.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), pg.size >= 2)) {
                dg || vg();
                const [t, n] = Array.from(pg.values()), i = ag.getBoundingClientRect(), a = (t.x + n.x) / 2 - i.left, r = (t.y + n.y) / 2 - i.top, o = Math.max(1, Math.hypot(t.x - n.x, t.y - n.y));
                return yg(dg.scale * o / dg.distance, !1, {
                    contentX: dg.contentX,
                    contentY: dg.contentY,
                    viewX: a,
                    viewY: r
                }), void e.preventDefault();
            }
            cg && cg.id === e.pointerId && (ag.scrollLeft = cg.left - (e.clientX - cg.x), ag.scrollTop = cg.top - (e.clientY - cg.y), 
            e.preventDefault());
        });
        const wg = e => {
            if ("mouse" !== e.pointerType && pg.delete(e.pointerId), 1 === pg.size) {
                const [e, t] = pg.entries().next().value;
                dg = null, cg = {
                    id: e,
                    x: t.x,
                    y: t.y,
                    left: ag.scrollLeft,
                    top: ag.scrollTop
                };
            } else pg.size ? vg() : (dg = null, cg = null, ag.classList.remove("is-dragging"));
            "mouse" === e.pointerType && cg && cg.id === e.pointerId && (cg = null, ag.classList.remove("is-dragging"));
        };
        ag.addEventListener("pointerup", wg), ag.addEventListener("pointercancel", wg), 
        ag.addEventListener("wheel", e => {
            (e.ctrlKey || e.metaKey) && (e.preventDefault(), yg(lg * (e.deltaY < 0 ? 1.18 : 1 / 1.18)));
        }, {
            passive: !1
        }), ag.addEventListener("keydown", e => {
            "+" === e.key || "=" === e.key ? (e.preventDefault(), yg(1.35 * lg)) : "-" === e.key ? (e.preventDefault(), 
            yg(lg / 1.35)) : "0" === e.key && (e.preventDefault(), yg(1, !1));
        }), og.addEventListener("load", () => {
            ng.hidden || fg();
        }), window.addEventListener("resize", () => {
            ng.hidden || fg(!0);
        }), window.__sxOnPtr( e => {
            Jh.hidden || !ng.hidden || Zh.contains(e.target) || mg();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && (ng.hidden ? Jh.hidden || (e.preventDefault(), mg({
                focus: !0
            })) : (e.preventDefault(), bg({
                focus: !0
            })));
        });
        const kg = e.byId("testResultLoaderDialog"), xg = e.byId("testResultLoaderStatus"), Sg = e.byId("profileImportDialog"), $g = e.byId("profileImportStatus"), Eg = e.byId("completionCelebrationDialog"), Ag = e.byId("completionCelebration"), Cg = e.byId("completionCelebrationCount"), Mg = e.byId("completionConfetti"), completionCompare = e.byId("completionCompare"), completionExport = e.byId("completionExport"), milestoneDialog = e.byId("milestoneCelebrationDialog"), milestoneTitle = e.byId("milestoneCelebrationTitle"), milestoneMessage = e.byId("milestoneCelebrationMessage"), milestoneContinue = e.byId("milestoneContinue"), milestoneCompare = e.byId("milestoneCompare"), milestoneExport = e.byId("milestoneExport"), milestoneImport = e.byId("milestoneImport"), milestoneScribe = e.byId("milestoneScribe"), closeMilestone = e.byId("closeMilestoneCelebration");
        function Ig(e, t = "info", n = !1) {
            $g.textContent = e || "", e ? $g.dataset.tone = t : $g.removeAttribute("data-tone"), 
            n && e && requestAnimationFrame(() => {
                $g.scrollIntoView({
                    block: "nearest"
                }), $g.focus({
                    preventScroll: !0
                });
            });
        }
        function Pg(e, t, n = "read") {
            let i = yx.errorMessage(e, "The file could not be read.");
            "json" === n && /Unexpected token|JSON|position \d+/i.test(i) ? i = "The selected JSON file is malformed." : /does not contain (?:complete )?Sexcapades profile data/i.test(i) ? i = `No embedded Sexcapades profile data or readable profile QR was found in ${t.name}.` : /does not contain a readable Sexcapades profile-data QR code/i.test(i) && (i = `No readable Sexcapades profile QR was found in ${t.name}.`), 
            Ig(`Import failed: ${i}`, "error", !0);
        }
        const Lg = e.byId("importedContactDialog"), Tg = e.byId("importedContactDetails"), Fg = e.byId("addImportedContact"), Ng = e.byId("importedContactStatus"), _g = e.byId("profileDetailsDialog"), Dg = e.byId("profileDetailsBody"), Rg = e.byId("profileDialogAbout"), Og = e.byId("profileDialogPhoto"), Bg = e.byId("profileDialogIdentity"), jg = e.byId("profileDialogRatings"), qg = e.byId("profileDialogSiteLinks"), Hg = e.byId("profileDetailsName"), Wg = e.byId("profileDetailsGender"), Ug = e.byId("profileDetailsSexuality"), Gg = e.byId("profileDetailsRole"), Kg = e.byId("profileDetailsAge"), Pz = e.byId("profileDetailsPronouns"), zg = e.byId("profileDetailsLocation"), Vg = e.byId("profileDetailsFetLife"), Yg = e.byId("profileDetailsPhone"), Xg = e.byId("profileDetailsTelegram"), Zg = e.byId("profileDetailsEmail"), Qg = e.byId("profileDetailsLinktree"), Jg = e.byId("profileDetailsChaturbate"), em = e.byId("profileDetailsX"), tm = e.byId("profileDetailsXhamster"), nm = e.byId("profileDetailsXvideos"), im = e.byId("profileDetailsAbout"), am = e.byId("profileDetailsAboutCount"), rm = e.byId("profileDetailsTerms"), om = e.byId("profileDetailsTermsCount"), sm = e.byId("profileDetailsStatus"), lm = e.byId("profilePhotoInput"), cm = e.byId("profilePhotoList"), dm = e.byId("profilePhotoCount"), um = e.byId("profilePhotoDialog"), pm = e.byId("profilePhotoFull"), hm = e.byId("profilePhotoViewer"), gm = e.byId("profilePhotoStage"), mm = e.byId("profilePhotoPosition"), fm = e.byId("profilePhotoZoomValue"), ym = e.byId("closeProfileDialog"), bm = e.byId("closeProfileTitle"), vm = e.byId("saveClosingProfile"), wm = e.byId("discardProfileDetailsDialog"), km = e.byId("profileExportDialog"), xm = e.byId("profileExportTitle"), Sm = e.byId("profileExportSubtitle"), $m = e.byId("profileExportDataNote"), Em = e.byId("includeContactInfo"), Am = e.byId("includeContactInfoHelp"), Cm = e.byId("blindProfileExport"), Mm = e.byId("exportAboutMe"), Im = e.byId("exportAboutMeCount"), Pm = e.byId("lowResPhotoDialog"), Lm = e.byId("lowResPhotoTitle"), Tm = e.byId("lowResPhotoGrid"), Fm = e.byId("lowResPhotoSummary"), exportPhotoGrid = e.byId("exportPhotoGrid"), exportPhotoSummary = e.byId("exportPhotoSummary"), Nm = e.byId("secondaryFile"), _m = e.byId("secondaryImage"), Dm = e.byId("secondaryFileName"), Rm = e.byId("secondaryFileLink"), Om = e.byId("fileDialog"), Bm = e.byId("fileDialogTitle"), jm = e.byId("fileDialogSubtitle"), qm = e.byId("fileReady"), Hm = e.byId("fileName"), Wm = e.byId("fileHelp"), Um = e.byId("preparedImage"), Gm = e.byId("preparedImageLink"), Km = e.byId("ninjaTransferLink"), zm = e.byId("ninjaTransferHint"), Vm = e.byId("preparedImageToolbar"), Ym = e.byId("preparedImageViewport"), Xm = e.byId("preparedImageStage"), Zm = e.byId("preparedZoomValue"), Qm = e.byId("preparedZoomIn"), Jm = e.byId("preparedZoomOut"), ef = e.byId("preparedZoomFit"), tf = e.byId("fileStatus"), nf = e.byId("fileProgress"), af = e.byId("fileProgressStage"), rf = e.byId("fileProgressValue"), of = e.byId("fileProgressTrack"), sf = e.byId("fileProgressBar"), lf = e.byId("fileProgressPortrait"), cf = e.byId("fileProgressInitials"), df = e.byId("fileProgressDetail");
        let uf = null, pf = null, hf = null, gf = null, mf = !1, ff = null, yf = null, bf = null, vf = 0, wf = null, kf = null, xf = new Set, Sf = !1, $f = !0, Ef = null, Af = new Set, Cf = !1, Mf = !0, If = "black", Pf = new Set, exportPhotoSelection = new Set, Lf = "png-lowres", Tf = null, Ff = 1, Nf = !1, _f = null;
        const Df = new Map;
        function Rf(e) {
            Nf = Boolean(e), Ff = 1, _f = null, Df.clear(), Vm.hidden = !Nf, Ym.classList.toggle("is-zoomable", Nf), 
            Ym.classList.remove("is-zoomed", "is-dragging"), Xm.removeAttribute("style"), Um.removeAttribute("style"), 
            Zm.value = "100%", Qm.disabled = !Nf, Jm.disabled = !0, ef.disabled = !0;
        }
        function Of(e = !0) {
            if (!(Nf && Um.naturalWidth && Ym.clientWidth && Ym.clientHeight)) return;
            const t = Ym.clientWidth, n = Ym.clientHeight, i = Math.max(1, Xm.scrollWidth), a = Math.max(1, Xm.scrollHeight), r = (Ym.scrollLeft + t / 2) / i, o = (Ym.scrollTop + n / 2) / a, s = Math.min(t / Um.naturalWidth, n / Um.naturalHeight), l = Math.max(1, Math.round(Um.naturalWidth * s * Ff)), c = Math.max(1, Math.round(Um.naturalHeight * s * Ff)), d = Math.max(t, l), u = Math.max(n, c);
            Xm.style.width = `${d}px`, Xm.style.height = `${u}px`, Um.style.width = `${l}px`, 
            Um.style.height = `${c}px`, Um.style.left = "50%", Um.style.top = "50%", Um.style.transform = "translate(-50%,-50%)", 
            Ym.classList.toggle("is-zoomed", Ff > 1.001), Zm.value = `${Math.round(100 * Ff)}%`, 
            Qm.disabled = Ff >= 5, Jm.disabled = Ff <= 1, ef.disabled = Ff <= 1, e && requestAnimationFrame(() => {
                Ym.scrollLeft = Math.max(0, r * Xm.scrollWidth - t / 2), Ym.scrollTop = Math.max(0, o * Xm.scrollHeight - n / 2);
            });
        }
        function Bf(e, t = !0) {
            Nf && (Ff = Math.max(1, Math.min(5, e)), Of(t));
        }
        function jf() {
            uf && URL.revokeObjectURL(uf), pf && URL.revokeObjectURL(pf), hf && URL.revokeObjectURL(hf), 
            uf = null, pf = null, hf = null, gf = null, mf = !1, yf = null, bf = null, Nm.hidden = !0, 
            _m.removeAttribute("src"), _m.alt = "", Rm.disabled = !0, delete Rm.dataset.filename, 
            Um.onload = null, Um.removeAttribute("src"), Um.alt = "", Gm.disabled = !0, delete Gm.dataset.filename, 
            Km.hidden = !0, Km.disabled = !0, zm.hidden = !0, Rf(!1), qm.hidden = !0;
        }
        function qf(e, t, n, i = "", a = !0, r = "") {
            if (Number.isInteger(e) && e !== vf) return !1;
            const o = Math.max(0, Math.min(100, Math.round(Number(t) || 0)));
            return nf.hidden = !1, nf.classList.toggle("is-working", Boolean(a)), r ? nf.dataset.tone = r : delete nf.dataset.tone, 
            af.textContent = n || "Preparing export", rf.value = `${o}%`, rf.textContent = `${o}%`, 
            of.setAttribute("aria-valuenow", String(o)), of.setAttribute("aria-valuetext", `${n || "Preparing export"}, ${o}% complete`), 
            of.style.setProperty("--progress", String(o)), sf.style.width = `${o}%`, df.textContent = i || "", 
            !0;
        }
        function Hf(e, t, n, i = "", a = !0, r = "") {
            return qf(e, t, n, i, a, r) ? new Promise(t => requestAnimationFrame(() => requestAnimationFrame(() => t(e === vf)))) : Promise.resolve(!1);
        }
        function Wf(e, t) {
            qf(e, 100, "Export stopped", t || "The export could not be completed.", !1, "error");
        }
        function Uf(e = "Preparing image", t = "Building your shareable PNG…", n = {}) {
            const i = ++vf;
            return jf(), function(e) {
                const t = e && vt[e] ? String(wt[e] || "Profile") : "Profile", n = e && vt[e] ? (dt[e] || [])[0] : null;
                cf.textContent = (Ji(t).trim().charAt(0) || "S").toUpperCase(), lf.classList.toggle("has-photo", Boolean(n)), 
                lf.querySelector("svg")?.remove(), n && lf.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 100 100" aria-hidden="true">${aa(n, {
                    x: 0,
                    y: 0,
                    w: 100,
                    h: 100
                })}</svg>`);
            }(n.profileId), ff = n.returnDialog || null, ff && ff.open && Ui(ff), Bm.textContent = e, 
            jm.textContent = t, tf.textContent = "Building…", qf(i, 2, "Starting export", "Preparing the export screen…", !0), 
            Wi(Om), i;
        }
        function Gf(e, t, n = {}) {
            if (e instanceof Blob && e.type) {
                const n = {
                    "image/png": ".png",
                    "image/jpeg": ".jpg",
                    "image/svg+xml": ".svg",
                    "image/svg+xml;charset=utf-8": ".svg",
                    "application/pdf": ".pdf"
                }[e.type];
                if (n) {
                    const e = String(t || "").toLowerCase();
                    e.endsWith(n) || ".jpg" === n && e.endsWith(".jpeg") || (t = String(t || "Sexcapades-export").replace(/\.[^.]+$/, "") + n);
                }
            }
            if (Number.isInteger(n.preparedJob) && n.preparedJob !== vf) return !1;
            const i = n.returnDialog || ff || null;
            if (jf(), Rf(n.zoomable), ff = i, yf = n.profileId && vt[n.profileId] ? n.profileId : null, 
            ff && ff.open && Ui(ff), uf = URL.createObjectURL(e), n.svgMarkup && n.profileId) try {
                var a = n.pdfFilename || ip(wt[n.profileId]).pdf;
                ap(n.svgMarkup, n.profileId, Boolean(n.includeProfileInfo), Boolean(n.blind), n.allowedIds).then(function(e) {
                    hf = URL.createObjectURL(e), gf = a;
                }).catch(function(e) {
                    console.warn("PDF export failed", e), hf = null;
                });
            } catch (e) {
                console.warn("PDF kickoff failed", e);
            }
            Bm.textContent = n.title || "Your PNG is ready", jm.textContent = n.subtitle || "The image below contains the data needed for re-import.", 
            Hm.textContent = t, Wm.textContent = n.help || "Review the image below, then choose Download.", 
            Um.alt = `Shareable Sexcapades image preview: ${t}`, Gm.dataset.filename = t, Gm.textContent = n.downloadLabel || "Download", 
            Gm.title = n.downloadTitle || (e instanceof Blob && String(e.type || "").startsWith("image/svg+xml") ? "Downloads the standalone SVG map." : "Downloads the PNG with embedded profile data."), Gm.disabled = !1, Km.hidden = !n.ninjaTransfer, 
            Km.disabled = !n.ninjaTransfer, zm.hidden = !n.ninjaTransfer, n.secondaryBlob && (pf = URL.createObjectURL(n.secondaryBlob), 
            _m.src = pf, _m.alt = `Sync card back preview: ${n.secondaryFilename || "Back PNG"}`, 
            Rm.dataset.filename = n.secondaryFilename || "Sexcapades-sync-card-back.png", Rm.textContent = n.secondaryLabel || "Download second PNG", 
            Rm.disabled = !1, Dm.textContent = n.secondaryFilename || "Back PNG", Nm.hidden = !1), 
            Um.onload = () => requestAnimationFrame(() => Of(!1)), Um.src = uf, qm.hidden = !1, 
            tf.textContent = Nf ? "Use +/−, the mouse wheel, or pinch to inspect fine details. Download keeps the original full-resolution image and its filename." : "The profile stays open when this image closes.", 
            qf(vf, 100, "Ready to download", "Export complete. Review the preview, then choose Download.", !1), 
            Wi(Om), requestAnimationFrame(() => Of(!1));
        }
        function Kf() {
            ++vf;
            const e = ff;
            ff = null, Ui(Om), t.setTimeout(() => {
                if (jf(), e) {
                    if (!(e !== ym || wf && vt[wf])) return;
                    Wi(e);
                }
            }, 0);
        }
        function renderExportPhotoPicker() {
            if (!exportPhotoGrid || !kf || !vt[kf]) return;
            const t = Yv(dt[kf] || []);
            exportPhotoGrid.innerHTML = t.map((e, t) => {
                const n = 0 === t || exportPhotoSelection.has(t), i = 0 === t;
                return `<button class="lowres-photo-choice" type="button" data-export-photo="${t}" aria-pressed="${n}"${i ? " disabled" : ""}><img src="${e.data}" alt="${i ? "Profile avatar" : `Profile photo ${t + 1}`}"><span>${i ? "Avatar" : `Photo ${t + 1}`}</span><small>${i ? "Always included" : n ? "Included" : "Not included"}</small></button>`;
            }).join("");
            const n = t.length ? 1 + [ ...exportPhotoSelection ].filter(e => e > 0 && e < t.length).length : 0;
            exportPhotoSummary.textContent = t.length ? `${n} of ${t.length} ${1 === t.length ? "picture" : "pictures"} included` : "No profile pictures attached.",
            e.byId("selectAllExportPhotos").disabled = !Sf || n === t.length,
            e.byId("clearExportPhotos").disabled = !Sf || n <= Math.min(1, t.length),
            exportPhotoGrid.querySelectorAll("[data-export-photo]").forEach(e => {
                Number(e.dataset.exportPhoto) > 0 && (e.disabled = !Sf);
            });
        }
        function selectedExportPhotos() {
            const e = Yv(dt[kf] || []);
            return e.length ? [ 0, ...[ ...exportPhotoSelection ].filter(t => t > 0 && t < e.length) ].sort((e, t) => e - t) : [];
        }
        function zf() {
            kf = null, xf.clear(), exportPhotoSelection.clear(), Sf = !1, $f = !0, Ui(km);
        }
        function Vf() {
            Sf = Boolean(Em.checked), Em.disabled = !1, Am.textContent = Sf ? "Includes the saved profile name, About Me, photos, contact details, and vCard for personal backup." : "Shared exports contain ratings and markers with a generic profile label; name, About Me, photos, contact details, and vCard are omitted.", 
            Mm.disabled = !Sf, renderExportPhotoPicker();
        }
        function Yf() {
            Im && (Im.textContent = String(Mm.value.length) + "/1500 characters");
        }
        function Xf() {
            const t = [ ...Tm.querySelectorAll("[data-lowres-photo]") ], n = Pf.size;
            t.forEach(e => {
                const t = Pf.has(Number(e.dataset.lowresPhoto));
                e.setAttribute("aria-pressed", String(t)), e.setAttribute("aria-label", `${e.querySelector("span").textContent}: ${t ? "included" : "not included"}`), 
                e.querySelector("small").textContent = t ? "Included" : "Not included";
            }), Fm.textContent = `${n} of ${t.length} ${1 === t.length ? "photo" : "photos"} included in this export`, 
            e.byId("selectAllLowResPhotos").disabled = n === t.length, e.byId("clearLowResPhotos").disabled = 0 === n;
        }
        function Zf() {
            Ef = null, Af.clear(), Cf = !1, Mf = !0, Pf.clear(), Tm.replaceChildren(), Fm.textContent = "", 
            Ui(Pm);
        }
        // Qf (sharing-sync refactor F4): options object, not seven
        // positionals — a misordered boolean used to silently flip
        // blind/shared or background. Defaults match the old
        // positional defaults exactly.
        function Qf(t, n = {}) {
            const i = Boolean(n.includeProfileInfo), a = void 0 === n.background ? "black" : n.background, r = void 0 === n.format ? "png-lowres" : n.format, o = !1 !== n.blind, s = void 0 === n.allowedIds ? new Set : n.allowedIds, l = void 0 === n.photoIndices ? [] : n.photoIndices, c = s instanceof Set ? new Set(s) : new Set(s || []), d = Array.isArray(l) ? l.slice() : [];
            return "pdf" === r ? dp(t, {
                photoIndices: d,
                includeProfileInfo: i,
                background: a,
                blind: o,
                allowedIds: c
            }) : rp(t, {
                lowRes: "png" !== r,
                photoIndices: d,
                includeProfileInfo: i,
                background: a,
                blind: o,
                allowedIds: c
            });
        }
        function Jf(e) {
            if (!vt[e] || !Jv(e, "capturing this profile", () => Jf(e))) return;
            const exportProfileName = String(wt[e] || "").trim();
            (!exportProfileName || /^unknown$/i.test(exportProfileName)) && (wt[e] = "Untitled profile", Jw());
            kf = e, xf = function(e) {
                // F8 (sharing-sync refactor): the solo switch /
                // collect / restore below is wrapped in try/finally.
                // An exception mid-collect used to strand the live
                // map in solo view; the restore now always runs.
                // (nu's same solo-switch shape was checked: its
                // restore is likewise inline and unguarded, so this
                // guard was NOT generalized to it in this pass.)
                const t = Mt, n = It, i = Yi(), a = Mt !== e || It !== e || i.length > 1 || 1 === i.length && i[0] !== e;
                a && (Mt = e, It = e, sxSel(null, "clear"), Mr({
                    animate: !1
                }));
                const r = new Set;
                try {
                    In.querySelectorAll(".node-group[data-layout-key]").forEach(e => {
                        const t = e.dataset.layoutKey;
                        if (!t || e.classList.contains("is-hidden")) return;
                        const n = getComputedStyle(e);
                        "none" !== n.display && "hidden" !== n.visibility && 0 !== Number(n.opacity) && r.add(t);
                    }), Array.from(r).forEach(t => {
                        const n = qn[t] || Xn(t) || (at[e] || {})[t];
                        n?.parentId && r.add(n.parentId), n?.branch && r.add(catId(n.branch));
                    });
                } finally {
                    a && (Mt = t, It = n, sxSel(i, "set"), Mr({
                        animate: !1
                    }));
                }
                return r;
            }(e), Em.checked = !1, Cm.checked = !0, $f = !0, xm.textContent = `Export ${wt[e]}`, 
            Sm.textContent = "Choose an export format. On mobile, exports may take a minute or two.";
            const t = (dt[e] || []).length;
            exportPhotoSelection = new Set(Array.from({ length: t }, (e, t) => t));
            $m.textContent = `Exports what's currently visible on your map. Every format limits embedded profile data to those same visible topics${t ? ` and can include ${t} attached ${1 === t ? "photo" : "photos"} when profile info is included` : ""}.`, 
            Vf(), Mm.value = String(nt[e] || ""), Yf(), Wi(km);
        }
        e.byId("closeProfileExport") && (e.byId("closeProfileExport").onclick = zf), km.addEventListener("click", e => {
            e.target === km && zf();
        }), km.addEventListener("cancel", e => {
            e.preventDefault(), zf();
        }), Em.addEventListener("change", Vf), Cm.addEventListener("change", () => {
            $f = Boolean(Cm.checked);
        }), Mm.addEventListener("input", Yf), km.querySelectorAll("[data-profile-export]").forEach(t => t.addEventListener("click", () => {
            const n = kf, i = new Set(xf), a = t.dataset.profileExport, r = Boolean(Sf), o = Boolean($f), s = (km.querySelector("input[name=exportBackground]:checked") || {}).value || "black", l = "a4" === (e.byId("syncCardPaperSize") || {}).value ? "a4" : "letter", c = selectedExportPhotos();
            zf(), n && vt[n] && (r && (nt[n] = String(Mm.value || "").trim().slice(0, 1500)), 
            "qr" === a ? pp(n, {
                includeProfileInfo: r,
                blind: o,
                allowedIds: i
            }) : "card" === a ? op(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                paperSize: l,
                allowedIds: i
            }) : "svg" === a ? cp(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                allowedIds: i
            }) : "svgz" === a ? cp(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                allowedIds: i,
                compressed: !0
            }) : Qf(n, {
                includeProfileInfo: r,
                background: s,
                format: "pdf" === a ? "pdf" : "zoom" === a ? "png-lowres" : "png",
                blind: o,
                allowedIds: i,
                photoIndices: c
            }));
        }));
        const ey = e.byId("openerDialog"), ty = e.byId("negotiationDialog");
        function ny(e, t) {
            if (!e) return;
            const n = document.createElement("a");
            n.href = e, n.download = t || "Sexcapades-profile.png", n.hidden = !0, document.body.appendChild(n), 
            n.click(), n.remove();
        }
        e.byId("openOpener") && e.byId("openOpener").addEventListener("click", () => {
            // Opener follows its dialog (load-target stage,
            // 2026-10-27): the button lives inside the profile
            // details dialog, so its target is that dialog's profile
            // (Hy) — never whichever profile the viewport happens to
            // display. A missing dialog profile is a visible error,
            // not a silent fall back to the active profile. The
            // opener itself stays exactly where it is.
            const t = Hy && vt[Hy] ? Hy : null;
            if (!t) return void tS("This dialog is not showing a profile, so there is no profile to build an opener from.", {
                tone: "error",
                persistent: !0
            });
            _g.open && Ui(_g), !ft[t] && (Eu(), Wi(e.byId("openerDialog")));
        }), e.byId("openNegotiation") && e.byId("openNegotiation").addEventListener("click", function() {
            const t = function() {
                const e = Yi().filter(e => vt[e]);
                if (e.length >= 2) return e;
                const t = Kd(), n = (t?.sourceIds || []).filter(e => vt[e]);
                return n.length >= 2 ? n : [];
            }();
            if (t.length < 2) return;
            const i = Iu(t), a = e.byId("negotiationPanel"), r = Cu(t);
            e.byId("negotiationSubtitle").textContent = `${i.names.join(" + ")} · limits stay out of every play suggestion.`, e.byId("negotiationProfiles").textContent = i.names.join(" + "), 
            n(a, `<p class="sx-stamp">${Hi(sxWriterStamp(i.ids))}</p><fieldset class="guide-block guide-block-limits"><legend>Hard limits + red topics</legend><div class="guide-limits-grid">${i.names.map((e, t) => `<div class="guide-limit-group"><h5>${Hi(e)} · hard limits</h5><ul>${Pu(i.terms[t] ? i.limits[t].concat(`Terms (binding): "${i.terms[t]}"`) : i.limits[t], "None marked.")}</ul></div><div class="guide-limit-group"><h5>${Hi(e)} · red topics</h5><ul>${Pu(i.reds[t], "None rated red.")}</ul></div>`).join("")}</div></fieldset><section class="guide-block guide-block-mutual"><h4>Mutual exclusions — both partners rated deep-red</h4><ul>${Pu(i.mutuals, "No topic is rated deep-red by both partners.")}</ul></section><section class="guide-block guide-block-discuss"><h4>Discuss first</h4><ul>${Pu(i.discuss, "No green-versus-red clashes found.")}</ul></section><section class="guide-block"><h4>Fill out before play</h4><div class="negotiation-fields"><label class="negotiation-field"><span>Safewords + nonverbal stop signals</span><small>Choose a shared system, define exactly what slows or stops play, and name a backup signal for anyone who cannot speak.</small><div class="signal-presets" role="group" aria-label="Common stop-signal starters"><label class="signal-preset"><input data-signal-preset="Stoplight: green = continue, yellow = slow down/check in, red = stop." type="checkbox"/>Stoplight</label><label class="signal-preset"><input data-signal-preset="Nonverbal stop: drop a held object." type="checkbox"/>Drop object</label><label class="signal-preset"><input data-signal-preset="Nonverbal stop: three firm taps." type="checkbox"/>Three taps</label></div><textarea data-negotiation-safewords placeholder="Example: green = continue; yellow = slow and check in; red = stop. If speech is difficult, dropping the held object or three firm taps means stop.">${Hi(r.safewords)}</textarea></label>${i.names.map((e, t) => `<label class="negotiation-field"><span>${Hi(e)} · aftercare needs</span><small>Write what ${Hi(e)} needs immediately after play and later: touch or space, reassurance, water or food, cleanup, medication or accessibility needs, check-in timing, and anything to avoid.</small><textarea data-negotiation-aftercare="${Hi(i.ids[t])}" placeholder="Example: water first, then quiet cuddling; no debrief until tomorrow; text check-in by noon…">${Hi(r.aftercare[i.ids[t]] || "")}</textarea></label>`).join("")}</div><h5>Rated aftercare preferences from the map</h5><p class="guide-source-intro">These suggestions come from each profile’s <strong>Connection &amp; aftercare</strong> ratings. Put lasting personal aftercare details in a note on an aftercare map topic; use the boxes above to confirm what applies to this specific plan.</p>${i.names.map((e, t) => `<strong>${Hi(e)}</strong><ul>${Pu(i.ratedAftercare[t], "None recorded.")}</ul>`).join("")}</section><section class="guide-block"><h4>Play guide source material</h4><p class="guide-source-intro">This is the profile-derived idea pool the AI may arrange into a guide. It is not an agreement: the limits, stop signals, aftercare fields, and decisions above are the binding checklist.</p><div class="guide-source-grid"><div class="guide-source-group"><h5>Warm-up ideas</h5><ul>${Pu(i.warmup, "Agree on a gentle start together.")}</ul></div><div class="guide-source-group"><h5>Main-play ideas</h5><ul>${Pu(i.main, "No shared green/green main-play topic is recorded.")}</ul></div><div class="guide-source-group"><h5>Aftercare ideas</h5><ul>${Pu(i.aftercare, "Agree on aftercare before starting.")}</ul></div><div class="guide-source-group"><h5>Hard-excluded</h5><ul>${Pu([ ...new Set(i.excluded.concat(i.mutuals)) ].concat(i.names.map((e, t) => i.terms[t] ? e + " — hard limits named in Terms (binding), quoted above" : "").filter(Boolean)), "None marked.")}</ul></div><div class="guide-source-group"><h5>Fantasy only — excluded from practical play</h5><ul>${Pu(i.fantasy || [], "No fantasy-only topics are in the shared pool.")}</ul></div><div class="guide-source-group"><h5>Teasers — soft no revisited at the current Heat</h5><ul>${Pu(i.teasers || [], "No soft-no topics are teaser-eligible at the current settings.")}</ul></div></div></section>`), 
            a.addEventListener("input", () => {
                r.safewords = a.querySelector("[data-negotiation-safewords]").value, a.querySelectorAll("[data-negotiation-aftercare]").forEach(e => {
                    r.aftercare[e.dataset.negotiationAftercare] = e.value;
                }), Fu(t), e.byId("negotiationCopyStatus").textContent = "Checklist saved for both documents.", e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = "Checklist saved for both documents.");
            }), a.querySelectorAll("[data-signal-preset]").forEach(e => {
                const t = String(e.dataset.signalPreset || ""), n = a.querySelector("[data-negotiation-safewords]");
                e.checked = Boolean(t && n.value.includes(t)), e.addEventListener("change", () => {
                    const i = n.value.split("\n").map(e => e.trim()).filter(Boolean).filter(e => e !== t);
                    e.checked && i.push(t), n.value = i.join("\n"), n.dispatchEvent(new Event("input", {
                        bubbles: !0
                    }));
                });
            }), Fu(t, i), e.byId("negotiationCopyStatus").textContent = "", e.byId("negotiationDialog").dataset.participants = t.join(","), e.byId("setterLength") && (e.byId("setterLength").value = r.length), e.byId("setterLengthUnit") && (e.byId("setterLengthUnit").value = r.lengthUnit), e.byId("setterDetailLevel") && (e.byId("setterDetailLevel").value = r.detail), e.byId("setterNegotiationLength") && (e.byId("setterNegotiationLength").value = r.negotiationLength || "1"), e.byId("setterNegotiationLengthUnit") && (e.byId("setterNegotiationLengthUnit").value = r.negotiationLengthUnit || "pages"), e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = ""), Wi(e.byId("negotiationDialog"));
        }), e.byId("closeOpener").onclick = () => Ui(ey), e.byId("closeNegotiation") && (e.byId("closeNegotiation").onclick = () => Ui(ty)), 
        ey.addEventListener("click", e => {
            e.target === ey && Ui(ey);
        }), ty.addEventListener("click", e => {
            e.target === ty && Ui(ty);
        }), ey.addEventListener("cancel", e => {
            e.preventDefault(), Ui(ey);
        }), ty.addEventListener("cancel", e => {
            e.preventDefault(), Ui(ty);
        }), e.byId("copyOpenerMessage") && e.byId("copyOpenerMessage").addEventListener("click", async () => {
            const t = e.byId("openerMessage");
            await sxCopyText(t.value, e.byId("openerCopyStatus"), "Message copied", "Copy failed", null, {
                ta: t,
                throughOnEmpty: !0
            });
        }), e.byId("nextOpenerMessage") && e.byId("nextOpenerMessage").addEventListener("click", Eu), e.byId("copyNegotiation") && e.byId("copyNegotiation").addEventListener("click", async () => {
            setterParticipantIds(), await sxCopyText(playGuidePromptText(), e.byId("negotiationCopyStatus"), "AI play-guide prompt copied", "Copy failed", e.byId("negotiationDialog"));
        }), e.byId("copyNegotiationGuide") && e.byId("copyNegotiationGuide").addEventListener("click", async () => {
            const t = e.byId("negotiationPanel");
            setterParticipantIds(), await sxCopyText(t.dataset.negotiationGuide || "", e.byId("negotiationGuideStatus"), "Negotiation guide copied", "Copy failed", e.byId("negotiationDialog"));
        }), e.byId("downloadNegotiationGuide") && e.byId("downloadNegotiationGuide").addEventListener("click", () => {
            const ids = setterParticipantIds();
            const t = e.byId("negotiationPanel"), text = t?.dataset.negotiationGuide || "", status = e.byId("negotiationGuideStatus");
            if (!text) return void (status && (status.textContent = "Select two profiles first."));
            const names = sxFilenameSlug(ids.map(id => wt[id] || id).join("-"), "profiles"), blob = new Blob([ text + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url, a.download = `Sexcapades-${names}-negotiation-guide.txt`, a.hidden = !0, document.body.appendChild(a), a.click(), a.remove(), setTimeout(() => URL.revokeObjectURL(url), 0), status && (status.textContent = "Negotiation guide downloaded.");
        }), e.byId("downloadPlayGuide") && e.byId("downloadPlayGuide").addEventListener("click", () => {
            const ids = setterParticipantIds();
            const t = e.byId("negotiationPanel"), text = playGuidePromptText(), status = e.byId("negotiationCopyStatus");
            if (!text) return void (status && (status.textContent = "Select two profiles first."));
            const names = sxFilenameSlug(ids.map(id => wt[id] || id).join("-"), "profiles"), blob = new Blob([ text + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url, a.download = `Sexcapades-${names}-play-guide-prompt.txt`, a.hidden = !0, document.body.appendChild(a), a.click(), a.remove(), setTimeout(() => URL.revokeObjectURL(url), 0), status && (status.textContent = "Play guide prompt downloaded.");
        }), exportPhotoGrid.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "exportPhoto");
            if (!t || t.disabled) return;
            const n = Number(t.dataset.exportPhoto);
            exportPhotoSelection.has(n) ? exportPhotoSelection.delete(n) : exportPhotoSelection.add(n), renderExportPhotoPicker();
        }), e.byId("selectAllExportPhotos").onclick = () => {
            Yv(dt[kf] || []).forEach((e, t) => exportPhotoSelection.add(t)), renderExportPhotoPicker();
        }, e.byId("clearExportPhotos").onclick = () => {
            exportPhotoSelection.clear(), exportPhotoSelection.add(0), renderExportPhotoPicker();
        }, Tm.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "lowresPhoto");
            if (!t) return;
            const n = Number(t.dataset.lowresPhoto);
            Pf.has(n) ? Pf.delete(n) : Pf.add(n), Xf();
        }), e.byId("selectAllLowResPhotos").onclick = () => {
            Tm.querySelectorAll("[data-lowres-photo]").forEach(e => Pf.add(Number(e.dataset.lowresPhoto))), 
            Xf();
        }, e.byId("clearLowResPhotos").onclick = () => {
            Pf.clear(), Xf();
        }, e.byId("createLowResExport").onclick = () => {
            const e = Ef, t = new Set(Af), n = Cf, i = Mf, a = [ ...Pf ].sort((e, t) => e - t), r = Lf || "png-lowres", o = If;
            Zf(), e && vt[e] && ("pdf" === r ? dp(e, {
                photoIndices: a,
                includeProfileInfo: n,
                blind: i,
                background: o,
                allowedIds: t
            }) : rp(e, {
                lowRes: "png" !== r,
                photoIndices: a,
                includeProfileInfo: n,
                blind: i,
                background: o,
                allowedIds: t
            }));
        }, e.byId("closeLowResPhoto").onclick = Zf, Pm.addEventListener("click", e => {
            e.target === Pm && Zf();
        }), Pm.addEventListener("cancel", e => {
            e.preventDefault(), Zf();
        }), e.byId("closeFileDialog").onclick = Kf, Gm.addEventListener("click", () => {
            qf(vf, 100, "Starting download", "Handing the finished file to your browser…", !0), 
            mf ? hf && ny(hf, gf) : ny(uf, Gm.dataset.filename), yf && Vt(yf), Kf();
        }), Km.addEventListener("click", () => {
            window.open("https://ninjatransfers.com", "_blank", "noopener,noreferrer"), ny(uf, Gm.dataset.filename), 
            yf && Vt(yf);
        }), Rm.addEventListener("click", () => {
            ny(pf, Rm.dataset.filename), yf && Vt(yf);
        }), Qm && (Qm.onclick = () => Bf(1.25 * Ff)), Jm && (Jm.onclick = () => Bf(Ff / 1.25)), ef && (ef.onclick = () => Bf(1)), 
        Ym.addEventListener("wheel", e => {
            Nf && (e.preventDefault(), Bf(e.deltaY < 0 ? 1.2 * Ff : Ff / 1.2));
        }, {
            passive: !1
        }), Ym.addEventListener("pointerdown", e => {
            if (Nf && ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button)) {
                Df.set(e.pointerId, {
                    x: e.clientX,
                    y: e.clientY
                });
                try {
                    Ym.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                if (2 === Df.size) {
                    const e = [ ...Df.values() ];
                    _f = {
                        distance: Math.hypot(e[1].x - e[0].x, e[1].y - e[0].y),
                        zoom: Ff
                    };
                }
            }
        }), Ym.addEventListener("pointermove", e => {
            const t = Df.get(e.pointerId);
            if (!t) return;
            const n = {
                x: e.clientX,
                y: e.clientY
            };
            if (Df.set(e.pointerId, n), Df.size >= 2) {
                const t = [ ...Df.values() ].slice(0, 2), n = Math.hypot(t[1].x - t[0].x, t[1].y - t[0].y);
                return _f || (_f = {
                    distance: n,
                    zoom: Ff
                }), _f.distance > 0 && Bf(_f.zoom * n / _f.distance, !1), void e.preventDefault();
            }
            Ff > 1 && (Ym.scrollLeft -= n.x - t.x, Ym.scrollTop -= n.y - t.y, Ym.classList.add("is-dragging"), 
            e.preventDefault());
        });
        const iy = e => {
            Df.delete(e.pointerId), Ym.classList.remove("is-dragging"), Df.size < 2 && (_f = null);
        };
        Ym.addEventListener("pointerup", iy), Ym.addEventListener("pointercancel", iy), 
        window.addEventListener("resize", () => {
            wr(), Nf && Om.open && Of(!1), um.open && cy(!1), gy && gy.open && Iy();
        }), Om.addEventListener("click", e => {
            e.target === Om && Kf();
        }), Om.addEventListener("cancel", e => {
            e.preventDefault(), Kf();
        });
        let ay = [], ry = 0, oy = 1, sy = null;
        const ly = new Map;
        function cy(t = !0) {
            if (!pm.naturalWidth || !hm.clientWidth || !hm.clientHeight) return;
            const n = hm.clientWidth, i = hm.clientHeight, a = Math.max(1, gm.scrollWidth), r = Math.max(1, gm.scrollHeight), o = (hm.scrollLeft + n / 2) / a, s = (hm.scrollTop + i / 2) / r, l = Math.min(n / pm.naturalWidth, i / pm.naturalHeight), c = Math.max(1, Math.round(pm.naturalWidth * l * oy)), d = Math.max(1, Math.round(pm.naturalHeight * l * oy)), u = Math.max(n, c), p = Math.max(i, d);
            gm.style.width = `${u}px`, gm.style.height = `${p}px`, pm.style.width = `${c}px`, 
            pm.style.height = `${d}px`, hm.classList.toggle("is-zoomed", oy > 1.001), fm.value = `${Math.round(100 * oy)}%`, 
            e.byId("profilePhotoZoomOut").disabled = oy <= 1, e.byId("profilePhotoZoomIn").disabled = oy >= 6, 
            e.byId("profilePhotoZoomFit").disabled = oy <= 1, t && requestAnimationFrame(() => {
                hm.scrollLeft = Math.max(0, o * gm.scrollWidth - n / 2), hm.scrollTop = Math.max(0, s * gm.scrollHeight - i / 2);
            });
        }
        function dy(e, t = !0) {
            oy = Math.max(1, Math.min(6, e)), cy(t);
        }
        function uy(t) {
            ay.length && (ry = (t + ay.length) % ay.length, oy = 1, sy = null, ly.clear(), hm.classList.remove("is-zoomed", "is-dragging"), 
            gm.removeAttribute("style"), pm.removeAttribute("style"), mm.value = `${ry + 1} of ${ay.length}`, 
            pm.alt = `Attached profile photo ${ry + 1} of ${ay.length}`, pm.onload = () => requestAnimationFrame(() => cy(!1)), 
            pm.src = ay[ry].data, e.byId("profilePhotoPrevious").disabled = ay.length < 2, e.byId("profilePhotoNext").disabled = ay.length < 2);
        }
        function py() {
            Ui(um), ly.clear(), sy = null, pm.onload = null, pm.removeAttribute("src"), ay = [];
        }
        e.byId("closeProfilePhoto").onclick = py, um.addEventListener("click", e => {
            e.target === um && py();
        }), um.addEventListener("cancel", e => {
            e.preventDefault(), py();
        }), e.byId("profilePhotoPrevious").onclick = () => uy(ry - 1), e.byId("profilePhotoNext").onclick = () => uy(ry + 1), 
        e.byId("profilePhotoZoomIn").onclick = () => dy(1.25 * oy), e.byId("profilePhotoZoomOut").onclick = () => dy(oy / 1.25), 
        e.byId("profilePhotoZoomFit").onclick = () => dy(1), hm.addEventListener("wheel", e => {
            e.preventDefault(), dy(e.deltaY < 0 ? 1.2 * oy : oy / 1.2);
        }, {
            passive: !1
        }), hm.addEventListener("pointerdown", e => {
            if ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button) {
                ly.set(e.pointerId, {
                    x: e.clientX,
                    y: e.clientY
                });
                try {
                    hm.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                if (2 === ly.size) {
                    const e = [ ...ly.values() ];
                    sy = {
                        distance: Math.hypot(e[1].x - e[0].x, e[1].y - e[0].y),
                        zoom: oy
                    };
                }
            }
        }), hm.addEventListener("pointermove", e => {
            const t = ly.get(e.pointerId);
            if (!t) return;
            const n = {
                x: e.clientX,
                y: e.clientY
            };
            if (ly.set(e.pointerId, n), ly.size >= 2) {
                const t = [ ...ly.values() ].slice(0, 2), n = Math.hypot(t[1].x - t[0].x, t[1].y - t[0].y);
                return sy || (sy = {
                    distance: n,
                    zoom: oy
                }), sy.distance > 0 && dy(sy.zoom * n / sy.distance, !1), void e.preventDefault();
            }
            oy > 1 && (hm.scrollLeft -= n.x - t.x, hm.scrollTop -= n.y - t.y, hm.classList.add("is-dragging"), 
            e.preventDefault());
        });
        const hy = e => {
            ly.delete(e.pointerId), hm.classList.remove("is-dragging"), ly.size < 2 && (sy = null);
        };
        hm.addEventListener("pointerup", hy), hm.addEventListener("pointercancel", hy);
        const gy = e.byId("profileCropDialog"), my = e.byId("profileCropPreview"), fy = e.byId("profileCropImage"), yy = e.byId("profileCropZoom"), by = e.byId("profileCropZoomValue"), vy = e.byId("profileCropRotateRing"), wy = e.byId("profileCropRotateThumb"), ky = e.byId("profileCropRotateValue");
        let xy = null, Sy = null, $y = null, Ey = null, Ay = 0, Cy = 0, My = 0;
        function Iy() {
            if (!Sy || !my.clientWidth) return;
            const e = my.clientWidth, t = my.clientHeight, n = Math.max(e / Sy.width, t / Sy.height) * Sy.cropZoom, i = Sy.width * n, a = Sy.height * n, r = i > e ? e / (2 * i) : .5, o = i > e ? 1 - r : .5, s = a > t ? t / (2 * a) : .5, l = a > t ? 1 - s : .5;
            Sy.cropX = Math.max(r, Math.min(o, Sy.cropX)), Sy.cropY = Math.max(s, Math.min(l, Sy.cropY)), 
            Sy.cropRotation = Math.max(-180, Math.min(180, Number(Sy.cropRotation) || 0)), fy.style.width = `${i}px`, 
            fy.style.height = `${a}px`, fy.style.left = e / 2 - Sy.cropX * i + "px", fy.style.top = t / 2 - Sy.cropY * a + "px", 
            fy.style.transformOrigin = `${(100 * Sy.cropX).toFixed(3)}% ${(100 * Sy.cropY).toFixed(3)}%`, 
            fy.style.transform = `rotate(${Sy.cropRotation.toFixed(2)}deg) translateZ(0)`, yy.value = String(Sy.cropZoom), 
            by.value = `${Math.round(100 * Sy.cropZoom)}%`;
            const c = Sy.cropRotation * Math.PI / 180, d = 50 + 47 * Math.sin(c), u = 50 - 47 * Math.cos(c), p = Math.round(Sy.cropRotation);
            wy.setAttribute("cx", d.toFixed(2)), wy.setAttribute("cy", u.toFixed(2)), ky.value = `${p}°`, 
            vy.setAttribute("aria-valuenow", String(p)), vy.setAttribute("aria-valuetext", `${p} degrees`);
        }
        function Py() {
            if (null === xy || !Sy) return;
            const e = Object.assign({}, Sy, {
                cropReady: !0,
                manualCrop: !0 === Sy.manualCrop
            });
            Wy[xy] = e;
        }
        function Ly() {
            Sy && (Cy++, Sy.cropReady = !0, Sy.manualCrop = !0);
        }
        function Ty(e) {
            const t = Wy[e];
            if (!t) return;
            My++, Cy = 0, xy = e, Sy = Object.assign({}, t);
            const n = _g.querySelector(".dialog-body");
            Ay = n ? n.scrollTop : 0, _g.open && Ui(_g), fy.onload = async () => {
                await async function(e = !1) {
                    if (!Sy || !fy.naturalWidth) return !1;
                    if (!0 === Sy.manualCrop) return !1;
                    if (!e && Sy.cropReady) return !1;
                    if (!e && (Math.abs(Sy.cropX - .5) > .001 || Math.abs(Sy.cropY - .5) > .001 || Math.abs(Sy.cropZoom - 1) > .001)) return !1;
                    const t = Sy, n = Cy, i = ++My, a = await iw(fy, t.width, t.height);
                    return Sy === t && i === My && n === Cy && (a ? Object.assign(Sy, a, {
                        cropReady: !0,
                        manualCrop: !1
                    }) : Object.assign(Sy, {
                        cropX: .5,
                        cropY: .5,
                        cropZoom: 1,
                        cropReady: !0,
                        manualCrop: !1
                    }), Iy(), Boolean(a));
                }(), requestAnimationFrame(Iy);
            }, fy.src = t.data, Wi(gy), requestAnimationFrame(Iy);
        }
        function Fy() {
            My++, Py(), Ui(gy), $y = null, Ey = null, vy.classList.remove("is-dragging"), xy = null, 
            Sy = null, fy.onload = null, fy.removeAttribute("src"), Wi(_g), ew(), Hy && Mr({
                animate: !1
            }), requestAnimationFrame(() => {
                const e = _g.querySelector(".dialog-body");
                e && (e.scrollTop = Ay);
            });
        }
        function Ny(e, t = !0) {
            Sy && (Ly(), Sy.cropRotation = Math.max(-180, Math.min(180, Number(e) || 0)), Iy(), 
            t && Py());
        }
        function _y(e) {
            const t = vy.getBoundingClientRect(), n = e.clientX - (t.left + t.width / 2), i = e.clientY - (t.top + t.height / 2);
            return 180 * Math.atan2(n, -i) / Math.PI;
        }
        e.byId("closeProfileCrop").onclick = Fy, gy.addEventListener("click", e => {
            e.target === gy && Fy();
        }), gy.addEventListener("cancel", e => {
            e.preventDefault(), Fy();
        }), yy.addEventListener("input", () => {
            Sy && (Ly(), Sy.cropZoom = Number(yy.value), Iy(), Py());
        }), vy.addEventListener("pointerdown", e => {
            if (Sy && ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button)) {
                Ey = e.pointerId, vy.classList.add("is-dragging");
                try {
                    vy.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                Ny(_y(e), !1), e.preventDefault(), e.stopPropagation();
            }
        }), vy.addEventListener("pointermove", e => {
            Ey === e.pointerId && (Ny(_y(e), !1), e.preventDefault());
        });
        const Dy = e => {
            Ey === e.pointerId && (Ey = null, vy.classList.remove("is-dragging"), Py());
        };
        vy.addEventListener("pointerup", Dy), vy.addEventListener("pointercancel", Dy), 
        vy.addEventListener("keydown", e => {
            if (!Sy || ![ "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home" ].includes(e.key)) return;
            e.preventDefault();
            const t = e.shiftKey ? 10 : 1, n = Number(Sy.cropRotation) || 0;
            Ny("Home" === e.key ? 0 : n + ("ArrowLeft" === e.key || "ArrowDown" === e.key ? -t : t));
        }), e.byId("resetProfileCrop").onclick = () => {
            Sy && (Ly(), Object.assign(Sy, {
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropRotation: 0,
                cropReady: !0,
                manualCrop: !0
            }), Iy(), Py());
        }, e.byId("saveProfileCrop").onclick = () => {
            null !== xy && Sy && (Py(), Fy(), sm.textContent = "Crop saved.");
        }, my.addEventListener("pointerdown", e => {
            if (!Sy || ("mouse" === e.pointerType || "pen" === e.pointerType) && 0 !== e.button) return;
            Ly();
            const t = my.clientWidth, n = my.clientHeight, i = Math.max(t / Sy.width, n / Sy.height) * Sy.cropZoom;
            $y = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                cropX: Sy.cropX,
                cropY: Sy.cropY,
                drawWidth: Sy.width * i,
                drawHeight: Sy.height * i
            }, my.classList.add("is-dragging");
            try {
                my.setPointerCapture(e.pointerId);
            } catch (e) { __sxErrLog("pointer-capture", e); }
            e.preventDefault();
        }), my.addEventListener("pointermove", e => {
            $y && $y.pointerId === e.pointerId && Sy && (Sy.cropX = $y.cropX - (e.clientX - $y.startX) / $y.drawWidth, 
            Sy.cropY = $y.cropY - (e.clientY - $y.startY) / $y.drawHeight, Iy(), e.preventDefault());
        });
        const Ry = e => {
            $y && $y.pointerId === e.pointerId && ($y = null, my.classList.remove("is-dragging"));
        };
        my.addEventListener("pointerup", Ry), my.addEventListener("pointercancel", Ry);
        const Oy = e.byId("profileLoadMenu"), By = e.byId("profileAddMenu"), jy = e.byId("profileSampleMenu");
        let qy = null, Hy = null, Wy = [], Uy = "", Gy = [], Ky = 0, zy = null, Vy = null, jY = null, Yy = null, Xy = null;
        // Pair-tab load target (2026-10-27): set by ww when the import
        // dialog is opened from a pair tab's Load menu, cleared when
        // the dialog closes or a merge consumes it. While set, a
        // single-profile file import merges into that pair record
        // (see the merge branch in rk) instead of creating a profile.
        let sxPairLoadInto = null;
        // Load origin (split-center stage, 2026-10-27; activate-first
        // restored by the shell-ui stage, 2026-10-27): the profile a
        // Load action was PRESSED FROM, carried explicitly from the
        // tab's Load menu through the import dialog to the merge.
        // The target of a Load is this origin — never a profile the
        // viewport merely happens to display. Pressing Load also
        // activates the pressed tab first (see the Load handler), so
        // the displayed profile and the origin coincide; the explicit
        // origin, not the display, remains the targeting mechanism.
        // sxLoadOriginId is set
        // by ww from the menu's pressed tab and cleared when the
        // import dialog closes; sxConverterOrigin is the same origin
        // handed to a converter session (Ax), so the converter's
        // final Load lands on the origin with no second "which
        // profile?" dialogue.
        let sxLoadOriginId = null, sxConverterOrigin = null;
        // Merge immediate save (split-center stage, 2026-10-27): a
        // load's merged data is saved to profile memory IMMEDIATELY,
        // in the same act as the merge — not left resting on the
        // dirty flag and the timed draft autosave. Mirrors the Save
        // button exactly: with profile memory enabled, persist now
        // and clear the unsaved mark only when the persist succeeds;
        // without it, the merge is saved in this tab (mark cleared).
        function sxMergeSaveNow(id) {
            if (!id || !vt[id]) return;
            try {
                const cb = e.byId("rememberProfileCheckbox2x"), rp = window.Sexcapades2xRememberProfiles;
                if (cb && cb.checked && rp && "function" == typeof rp.saveNow) rp.saveNow() && Vt(id); else Vt(id);
            } catch (err) { __sxErrLog("sx-merge-save", err); }
        }
        const Zy = {};
        function Qy(t = Mt) {
            if (!t || !vt[t]) return Vy = e => Qy(e), void bw(null);
            // Activated-from: the chooser's target rides in Xy,
            // explicitly — no viewport switch to make it the active
            // profile first (split-center stage, 2026-10-27).
            Xy = t, kw(), Ui(kg), Ui(Sg), Wi(e.byId("testChooserDialog")),
            requestAnimationFrame(() => e.one("[data-test-choice]")?.focus());
        }
        function Jy() {
            Xy = null, Ui(e.byId("testChooserDialog"));
        }
        // Popularity scores shown in parentheses beside gender/orientation/role options in
        // the profile dialog, keyed by option value slug (values never change). Each scored
        // entry also carries a `source` name and `url`: hovering or focusing the option shows
        // the picker tooltip with the definition plus a clickable source line (appended by
        // popularitySourceLine). Sources: NZ national sexuality survey (N=12,885) for
        // straight/heterosexual (94.7% ±0.26), bisexual (0.8% ±0.11) and the homosexual figure
        // (0.6% ±0.09) — the survey reported 'homosexual' as one combined gay/lesbian figure,
        // applied to both Gay and Lesbian here. Ace prevalence: asexual ~1–2% (Bogaert 2004,
        // UK national probability sample, N≈18,000, found ~1% reporting no sexual attraction;
        // later reviews range higher) and demisexual ~0.6% (Pitcher et al. 2024, Journal of
        // LGBT Youth, N=17,112). Gender Census 2025 for nonbinary (61.7%) and transgender
        // (41.1%) — note those are shares among nonbinary-community respondents, a different
        // denominator from the general-population figures above. Role prevalence among BDSM
        // practitioners from Coppens et al., "The Psychology of Kink" survey: submissive
        // 39.5%, switch 31.1%, dominant 28.8% — the scored roles sort first in that order and
        // the remaining roles follow alphabetically (Unsure kept last, unburied).
        // Corroborating role data: Joyal & Carpentier 2017 (Journal of Sex Research), whose
        // general-population survey of paraphilic interests and behaviors likewise found
        // submissive and dominant role interests widely endorsed. Options with no entry show
        // no score and no source line.
        const POPULARITY_SOURCES = {
            nz: {
                source: "NZ National Sexuality Survey, N=12,885",
                url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3081103/"
            },
            genderCensus: {
                source: "Gender Census 2025, worldwide nonbinary community survey",
                url: "https://www.gendercensus.com/results/2025-worldwide/"
            },
            coppens: {
                source: "Coppens et al., Psychology of Kink survey",
                url: "https://www.researchgate.net/publication/339238941_The_Psychology_of_Kink_a_Survey_Study_into_the_Relationships_of_Trauma_and_Attachment_Style_with_BDSM_Interests"
            }
        };
        const POPULARITY_SCORES = {
            straight: {
                score: "94.7% ±0.26",
                ...POPULARITY_SOURCES.nz
            },
            heterosexual: {
                score: "94.7% ±0.26",
                ...POPULARITY_SOURCES.nz
            },
            bisexual: {
                score: "0.8% ±0.11",
                ...POPULARITY_SOURCES.nz
            },
            gay: {
                score: "0.6% ±0.09",
                ...POPULARITY_SOURCES.nz
            },
            lesbian: {
                score: "0.6% ±0.09",
                ...POPULARITY_SOURCES.nz
            },
            asexual: {
                score: "~1–2%",
                source: "Bogaert 2004, UK national probability sample, N≈18,000",
                url: "https://www.researchgate.net/publication/6462028_Asexuality_Classification_and_Characterization"
            },
            demisexual: {
                score: "~0.6%",
                source: "Pitcher et al. 2024, Journal of LGBT Youth, N=17,112",
                url: "https://psycnet.apa.org/record/2023-68523-001"
            },
            nonbinary: {
                score: "61.7%",
                ...POPULARITY_SOURCES.genderCensus
            },
            transgender: {
                score: "41.1%",
                ...POPULARITY_SOURCES.genderCensus
            },
            submissive: {
                score: "39.5%",
                ...POPULARITY_SOURCES.coppens
            },
            switch: {
                score: "31.1%",
                ...POPULARITY_SOURCES.coppens
            },
            dominant: {
                score: "28.8%",
                ...POPULARITY_SOURCES.coppens
            }
        };
        function popularitySuffix(e) {
            const t = POPULARITY_SCORES[e];
            return t ? " (" + t.score + ")" : "";
        }
        function popularitySourceLine(e, t) {
            const n = POPULARITY_SCORES[t];
            if (!n || !n.source) return;
            const i = document.createElement("span");
            i.className = "picker-source", i.appendChild(document.createTextNode(" Source: "));
            if (n.url) {
                const a = document.createElement("a");
                a.href = n.url, a.target = "_blank", a.rel = "noopener noreferrer", a.textContent = n.source, 
                i.appendChild(a);
            } else i.appendChild(document.createTextNode(n.source));
            e.appendChild(i);
        }
        const eb = [ "Man", "Woman", "Nonbinary", "Transgender", "Trans Man", "Trans Woman", "Genderqueer", "Agender", "Androgyne", "Androx", "Apagender", "Bigender", "Butch", "Cisgender", "Crossdresser", "Demifem", "Demigender", "Demimasc", "Demiman", "Demivoid", "Demiwoman", "Femme", "Gender Expansive", "Gender Neutral", "Gender Non-Conforming", "Genderfae", "Genderfluid", "Genderflux", "Genderfuck", "Gendervoid", "Gynx", "Hijra", "Intersex", "Intersex Man", "Intersex Woman", "Masc", "Maverique", "Multigender", "Omnigender", "Pangender", "Plural", "Polygender", "Trans Nonbinary", "Transfeminine", "Transmasculine", "Trigender", "Two-Spirit", "Xenogender", "Questioning", "Unsure", "Not Applicable" ], tb = eb.map(e => e.toLowerCase().replace(/\s+/g, "-")), nb = {
            man: "A person whose gender identity is man, regardless of sex assigned at birth.",
            woman: "A person whose gender identity is woman, regardless of sex assigned at birth.",
            nonbinary: "A gender identity outside an exclusively man-or-woman binary.",
            genderqueer: "An identity that challenges, mixes, or falls outside conventional gender categories.",
            genderfluid: "A gender identity that changes over time or across situations.",
            genderflux: "A gender whose intensity changes, sometimes becoming weak or absent.",
            genderfae: "A fluid gender that may include feminine and neutral genders, but not masculine genders.",
            "gender-neutral": "A gender identity experienced as neutral rather than masculine or feminine.",
            "gender-non-conforming": "A broad identity or expression that does not follow conventional gender expectations.",
            "gender-expansive": "An umbrella identity for gender experiences broader than conventional binary expectations.",
            maverique: "A distinct nonbinary gender not defined by masculinity, femininity, or absence of gender.",
            xenogender: "A nonbinary gender described through concepts or metaphors beyond conventional masculine–feminine language.",
            cisgender: "A person whose gender aligns with the sex they were assigned at birth.",
            transgender: "A person whose gender differs from the sex they were assigned at birth.",
            "trans-man": "A man who is transgender.",
            "trans-woman": "A woman who is transgender.",
            "trans-nonbinary": "A nonbinary person who also identifies as transgender.",
            transmasculine: "A person whose gender or transition moves toward masculinity without necessarily identifying only as a man.",
            transfeminine: "A person whose gender or transition moves toward femininity without necessarily identifying only as a woman.",
            apagender: "A person who feels apathetic or indifferent toward their own gender identity.",
            agender: "A person who experiences no gender or identifies without a gender.",
            gendervoid: "An absence of gender experienced specifically as a blank, void, or empty space.",
            bigender: "A person who experiences two genders, either together or at different times.",
            trigender: "A person who experiences three genders, either together or at different times.",
            demigender: "A person who feels a partial connection to a gender and partial disconnection from it.",
            demiman: "A person who identifies partly, but not wholly, as a man.",
            demiwoman: "A person who identifies partly, but not wholly, as a woman.",
            demimasc: "A person who feels a partial connection to masculinity, without necessarily identifying as a man.",
            demifem: "A person who feels a partial connection to femininity, without necessarily identifying as a woman.",
            demivoid: "A person who feels partly genderless or connected to a gender void.",
            multigender: "An umbrella identity for experiencing more than one gender.",
            polygender: "A person who experiences several genders, together or at different times.",
            omnigender: "A person who experiences all genders, often with awareness of their distinctions.",
            pangender: "A person who identifies with many or all genders available within their cultural understanding.",
            plural: "A plural system whose members may have different genders or a shared system-level identity.",
            masc: "A gender identity or presentation centered on masculinity without necessarily being a man.",
            femme: "A gender identity or presentation centered on femininity without necessarily being a woman.",
            butch: "A masculine queer identity with its own community and cultural history.",
            androgyne: "A gender identity blending or existing between masculine and feminine qualities.",
            genderfuck: "A deliberately disruptive or mixed gender identity or presentation that resists conventional categories.",
            crossdresser: "A person who wears clothing associated with another gender; this describes expression, not necessarily identity.",
            androx: "A nonbinary gender that combines masculine and neutral qualities.",
            gynx: "A nonbinary gender that combines feminine and neutral qualities.",
            "two-spirit": "A culturally specific identity used by some Indigenous North American people for particular gender, social, or spiritual roles.",
            hijra: "A traditional South Asian gender identity and community distinct from the man–woman binary.",
            intersex: "A person born with sex characteristics that do not fit typical definitions of male or female bodies; intersex is not itself a gender.",
            "intersex-man": "An intersex person whose gender identity is man.",
            "intersex-woman": "An intersex person whose gender identity is woman.",
            questioning: "A person who is actively exploring or uncertain about their gender identity.",
            unsure: "A person who is not currently sure which gender label fits.",
            "not-applicable": "Use when gender is not relevant to this profile."
        }, ib = Object.fromEntries(eb.map((e, t) => {
            const n = tb[t];
            return [ n, {
                label: e,
                description: nb[n]
            } ];
        }));
        ib.couple = {
            label: "Couple / shared profile",
            description: "A shared profile representing two partners rather than one gender identity."
        };
        const ab = [ {
            label: "Sexual orientations",
            options: [ "Straight", "Heterosexual", "Bisexual", "Gay", "Lesbian", "Asexual", "Pansexual", "Demisexual", "Graysexual", "Abrosexual", "Achillean", "Aceflux", "Acespec", "Acespike", "Aegosexual", "Allosexual", "Androflexible", "Androsexual", "Androgynosexual", "Apothisexual", "Autosexual", "Benignosexual", "Bicurious", "Ceterosexual", "Cupiosexual", "Dyke", "Fictosexual", "Finsexual", "Fraysexual", "Gynesexual", "Homoflexible", "Homosexual", "Lithosexual", "Megasexual", "Minsexual", "Monosexual", "Nebulasexual", "Neptunic", "Ninsexual", "Noetisexual", "Objectumsexual", "Omnisexual", "Orchidsexual", "Pancurious", "Phallosexual", "Placiosexual", "Polysexual", "Queer", "Quoisexual", "Reciprosexual", "Sapiosexual", "Sapphic", "Saturnic", "Sex-Favorable", "Soulsexual", "Spectrasexual", "Symbiosexual", "T4T", "Uranic", "Yonisexual" ]
        }, {
            label: "Romantic orientations",
            options: [ "Alloromantic", "Androromantic", "Apresromantic", "Aroflux", "Aromantic", "Arospec", "Benignoromantic", "Biromantic", "Cupioromantic", "Demiromantic", "Finromantic", "Frayromantic", "Grayromantic", "Gyneromantic", "Heteroromantic", "Homoromantic", "Lithoromantic", "Minromantic", "Monoromantic", "Nebularomantic", "Noetiromantic", "Omniromantic", "Panromantic", "Platoniromantic", "Polyromantic", "Quoiromantic", "Recipromantic", "Sapioromantic" ]
        }, {
            label: "Other",
            options: [ "Fluid", "Fluctuating/Evolving", "Unsure", "Questioning", "Exploring", "Not Applicable" ]
        } ], rb = {
            straight: "Attraction primarily to people of a different gender.",
            heterosexual: "Sexual attraction primarily to people of a different gender.",
            bicurious: "Curiosity about attraction or experiences with more than one gender without necessarily claiming a bisexual identity.",
            bisexual: "Attraction to more than one gender; the pattern or intensity may differ by gender.",
            homoflexible: "Primarily same-gender attraction with occasional attraction to other genders.",
            gay: "Attraction primarily to people of the same gender; often used by men, and sometimes more broadly.",
            lesbian: "A woman or nonbinary person whose attraction is primarily toward women.",
            dyke: "A reclaimed lesbian identity, often carrying a deliberately strong or gender-nonconforming cultural meaning.",
            homosexual: "Sexual attraction primarily to people of the same gender.",
            pansexual: "Attraction in which gender is not a determining boundary, though gender can still be noticed.",
            pancurious: "Curiosity about attraction to people regardless of gender without necessarily claiming a pansexual identity.",
            omnisexual: "Attraction to people of all genders, with gender potentially shaping how attraction feels.",
            queer: "A broad, self-chosen identity for attraction or relationships outside heterosexual and cisgender norms.",
            androsexual: "Attraction to men or masculinity, regardless of the attracted person’s own gender.",
            androflexible: "Primarily attraction to men or masculinity, with occasional attraction beyond that pattern.",
            minsexual: "Attraction to people whose gender or presentation is masculine in nature.",
            gynesexual: "Attraction to women or femininity, regardless of the attracted person’s own gender.",
            finsexual: "Attraction to people whose gender or presentation is feminine in nature.",
            androgynosexual: "Attraction to androgynous people or androgynous gender expression.",
            ninsexual: "Attraction to people whose gender is neutral or nonbinary in nature.",
            phallosexual: "Attraction centered on partners with a penis, regardless of their gender identity.",
            yonisexual: "Attraction centered on partners with a vulva or vagina, regardless of their gender identity.",
            achillean: "An umbrella term for men and masculine-aligned nonbinary people attracted to men.",
            sapphic: "An umbrella term for women and feminine-aligned nonbinary people attracted to women.",
            uranic: "Attraction to men and masculine or neutral nonbinary people, but not to women.",
            neptunic: "Attraction to women and feminine or neutral nonbinary people, but not to men.",
            saturnic: "Attraction only to nonbinary people, including man- or woman-aligned nonbinary people, but not binary men or women.",
            ceterosexual: "Attraction primarily or exclusively to nonbinary people.",
            t4t: "A trans person’s preference for or orientation toward relationships with other trans people.",
            monosexual: "Attraction to only one gender.",
            polysexual: "Attraction to multiple genders, but not necessarily all genders.",
            spectrasexual: "Attraction to a range or spectrum of genders rather than one fixed category.",
            abrosexual: "A sexual orientation whose pattern or intensity changes over time.",
            demisexual: "Sexual attraction that develops only after a strong emotional bond forms.",
            megasexual: "Emotional connection that tends to develop only after a strong sexual connection forms.",
            noetisexual: "Sexual attraction strongly shaped by a person’s mind, ideas, or way of thinking.",
            soulsexual: "Attraction centered on a person’s inner self or perceived soul rather than gender.",
            symbiosexual: "Attraction to the shared energy, connection, or dynamic between people in an existing relationship.",
            benignosexual: "Attraction centered on kindness, compassion, or caring behavior.",
            fraysexual: "Sexual attraction that is strongest without an emotional bond and may fade as closeness develops.",
            sapiosexual: "Sexual attraction strongly centered on perceived intelligence.",
            asexual: "Experiencing little or no sexual attraction; this does not by itself describe libido or behavior.",
            acespec: "An umbrella term for identities on the asexual spectrum.",
            aceflux: "An asexual-spectrum identity in which the intensity of sexual attraction changes over time.",
            acespike: "Usually experiencing little or no sexual attraction, with occasional sudden periods of attraction.",
            graysexual: "Experiencing sexual attraction rarely, weakly, or only under limited circumstances.",
            orchidsexual: "Experiencing sexual attraction but not desiring a sexual relationship or sexual activity.",
            reciprosexual: "Experiencing sexual attraction only after learning that the other person is attracted to you.",
            lithosexual: "Experiencing sexual attraction without wanting it reciprocated, or losing attraction when it is reciprocated.",
            cupiosexual: "Experiencing little or no sexual attraction while still desiring a sexual relationship.",
            "sex-favorable": "Feeling personally positive about or comfortable with sexual activity; this can coexist with any orientation.",
            apothisexual: "An asexual identity that includes strong aversion to or repulsion toward sexual activity.",
            aegosexual: "Experiencing a disconnect between oneself and sexual attraction or fantasy, often enjoying the idea without wanting personal participation.",
            placiosexual: "Enjoying performing sexual acts for others while having little or no desire to receive them.",
            nebulasexual: "Difficulty distinguishing sexual attraction from other feelings, often in connection with neurodivergence.",
            autosexual: "Sexual attraction directed primarily toward oneself.",
            fictosexual: "Sexual attraction primarily or exclusively toward fictional characters.",
            objectumsexual: "Sexual or romantic attraction toward particular objects.",
            quoisexual: "Difficulty understanding, distinguishing, or applying the concept of sexual attraction to oneself.",
            allosexual: "Experiencing sexual attraction; often used as the counterpart to asexual-spectrum identities.",
            heteroromantic: "Romantic attraction primarily to people of a different gender.",
            biromantic: "Romantic attraction to more than one gender.",
            homoromantic: "Romantic attraction primarily to people of the same gender.",
            androromantic: "Romantic attraction to men or masculinity.",
            gyneromantic: "Romantic attraction to women or femininity.",
            minromantic: "Romantic attraction to people whose gender or presentation is masculine in nature.",
            finromantic: "Romantic attraction to people whose gender or presentation is feminine in nature.",
            panromantic: "Romantic attraction in which gender is not a determining boundary.",
            omniromantic: "Romantic attraction to people of all genders, with gender potentially shaping the attraction.",
            polyromantic: "Romantic attraction to multiple genders, but not necessarily all genders.",
            monoromantic: "Romantic attraction to only one gender.",
            demiromantic: "Romantic attraction that develops only after a strong emotional bond forms.",
            apresromantic: "Romantic attraction that develops only after another form of attraction is already present.",
            noetiromantic: "Romantic attraction strongly shaped by a person’s mind, ideas, or way of thinking.",
            benignoromantic: "Romantic attraction centered on kindness, compassion, or caring behavior.",
            frayromantic: "Romantic attraction that is strongest without an emotional bond and may fade as closeness develops.",
            sapioromantic: "Romantic attraction strongly centered on perceived intelligence.",
            aromantic: "Experiencing little or no romantic attraction; this does not rule out close or committed relationships.",
            arospec: "An umbrella term for identities on the aromantic spectrum.",
            aroflux: "An aromantic-spectrum identity in which the intensity of romantic attraction changes over time.",
            grayromantic: "Experiencing romantic attraction rarely, weakly, or only under limited circumstances.",
            nebularomantic: "Difficulty distinguishing romantic attraction from other feelings, often in connection with neurodivergence.",
            quoiromantic: "Difficulty understanding, distinguishing, or applying the concept of romantic attraction to oneself.",
            platoniromantic: "Difficulty distinguishing romantic attraction from strong platonic attraction.",
            recipromantic: "Experiencing romantic attraction only after learning that the other person is romantically attracted to you.",
            lithoromantic: "Experiencing romantic attraction without wanting it reciprocated, or losing it when reciprocated.",
            cupioromantic: "Experiencing little or no romantic attraction while still desiring a romantic relationship.",
            alloromantic: "Experiencing romantic attraction; often used as the counterpart to aromantic-spectrum identities.",
            fluid: "An orientation whose pattern or intensity changes over time.",
            "fluctuating-evolving": "An orientation that is changing, developing, or understood differently over time.",
            unsure: "Use when you are not currently sure which orientation label fits.",
            questioning: "Actively exploring or reconsidering your sexual or romantic orientation.",
            exploring: "Trying experiences or considering possibilities without committing to a fixed label.",
            "not-applicable": "Use when orientation is not relevant to this profile."
        }, ob = ab.flatMap(e => e.options.map(t => ({
            group: e.label,
            label: t,
            value: t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        }))), sb = Object.fromEntries(ob.map(e => [ e.value, {
            label: e.label,
            group: e.group,
            description: rb[e.value]
        } ]));
        sb.heteroflexible = {
            label: "Heteroflexible",
            group: "Legacy",
            description: "Primarily different-gender attraction with occasional attraction to the same gender."
        }, sb.mixed = {
            label: "Mixed / shared",
            group: "Legacy",
            description: "A shared profile whose participants have different orientations."
        }, sb.other = {
            label: "Other / not listed",
            group: "Legacy",
            description: "An orientation that is not represented by the available labels."
        };
        const lb = [ "Submissive", "Switch", "Dominant", "Ageplayer", "Babygirl", "Bottom", "Brat", "Daddy", "Domme", "Fetishist", "Kajira", "Kajirus", "Key-holder", "Kinkster", "Masochist", "Master", "Mistress", "Mommy", "Owner", "Pet", "Sadist", "Slave", "Top", "Vanilla", "Unsure" ], cb = lb.map(e => e.toLowerCase()), db = {
            vanilla: "Prefers sexual or romantic activity outside BDSM or other explicitly kinky dynamics.",
            unsure: "Still exploring which kink or power-exchange roles feel right.",
            top: "Performs or directs an activity in a scene; this describes what someone does, not necessarily who holds power.",
            bottom: "Receives or is acted upon in a scene; this describes what someone does, not necessarily who holds power.",
            switch: "Enjoys taking different sides of a role or power dynamic at different times.",
            fetishist: "Has a strong erotic focus on a particular object, material, body part, or situation.",
            kinkster: "A broad term for someone who enjoys kink or BDSM without naming one specific role.",
            dominant: "Consensually holds authority or control within a negotiated power-exchange dynamic.",
            domme: "A feminine-identifying Dominant who consensually holds authority or control in a power exchange.",
            submissive: "Consensually yields authority or control within a negotiated power-exchange dynamic.",
            brat: "A submissive who playfully resists, teases, or challenges a partner as part of the agreed dynamic.",
            daddy: "A nurturing, guiding, or authoritative role in a consensual adult age-play or caregiver dynamic.",
            mommy: "A nurturing, guiding, or authoritative feminine role in a consensual adult age-play or caregiver dynamic.",
            ageplayer: "An adult who consensually adopts or relates to an age different from their chronological age during role-play.",
            babygirl: "An adult who takes a younger, cared-for, or submissive role in a consensual age-play or caregiver dynamic.",
            pet: "A person who consensually takes on an animal-inspired or owned role in pet play.",
            sadist: "Enjoys consensually causing pain, intensity, or controlled suffering to a willing partner.",
            masochist: "Enjoys consensually receiving pain, intensity, or controlled suffering.",
            master: "A Dominant title commonly used in a structured or ongoing authority-based relationship.",
            mistress: "A feminine Dominant title commonly used in a structured or ongoing authority-based relationship.",
            slave: "A submissive identity involving a deeply negotiated surrender of authority, within explicit consent and limits.",
            kajira: "A feminine slave-role identity drawn from Gorean fiction and practiced by some adults in consensual power exchange.",
            kajirus: "A masculine slave-role identity drawn from Gorean fiction and practiced by some adults in consensual power exchange.",
            owner: "Consensually holds an ongoing ownership role over a partner within a negotiated power-exchange dynamic.",
            "key-holder": "Holds the key to a partner's chastity device and controls its release within a negotiated dynamic."
        }, ub = Object.fromEntries(lb.map((e, t) => {
            const n = cb[t];
            return [ n, {
                label: e,
                description: db[n]
            } ];
        })), pb = e.byId("genderPicker"), hb = e.byId("genderTrigger"), gb = e.byId("genderTriggerLabel"), mb = e.byId("genderMenu"), fb = e.byId("genderTooltip");
        n(mb, tb.map(e => `<button class="gender-option" type="button" role="option" data-tooltip-tap-first data-gender-value="${Hi(e)}" aria-selected="false">${Hi(ib[e].label + popularitySuffix(e))}</button>`).join(""));
        const yb = {
            female: "woman",
            male: "man",
            genderless: "agender",
            demiboy: "demiman",
            demigirl: "demiwoman",
            "intersex-male": "intersex-man",
            "intersex-female": "intersex-woman",
            mtf: "trans-woman",
            ftm: "trans-man",
            private: "not-applicable",
            "non-binary": "nonbinary"
        };
        function bb(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = yb[t] || t, Object.prototype.hasOwnProperty.call(ib, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 3);
        }
        function vb(e, t = " + ") {
            return bb(e).map(e => ib[e].label).join(t);
        }
        function wb() {
            return bb([ ...Wg.selectedOptions ].map(e => e.value));
        }
        function kb(e) {
            const t = new Set(bb(e));
            [ ...Wg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function xb() {
            const e = new Set(wb()), t = vb([ ...e ]);
            gb.textContent = t || "Choose up to 3…", hb.title = t || "Choose up to three genders", 
            mb.querySelectorAll("[data-gender-value]").forEach(t => {
                const n = e.has(t.dataset.genderValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 3 && !n));
            });
        }
        function Sb() {
            fb.hidden = !0, mb.querySelectorAll('[aria-describedby="genderTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function $b(e) {
            const t = ib[e.dataset.genderValue];
            if (!t) return;
            Sb(), fb.textContent = t.description || t.label, popularitySourceLine(fb, e.dataset.genderValue), fb.hidden = !1, e.setAttribute("aria-describedby", "genderTooltip");
            const n = e.getBoundingClientRect(), i = fb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), fb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px", 
            fb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Eb(e = !1) {
            mb.hidden = !0, hb.setAttribute("aria-expanded", "false"), Sb(), e && hb.focus();
        }
        function Ab() {
            mb.hidden = !1, hb.setAttribute("aria-expanded", "true"), xb();
            const e = mb.querySelector('[aria-selected="true"]') || mb.querySelector(".gender-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        hb.addEventListener("click", () => mb.hidden ? Ab() : Eb(!0)), hb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(), 
            Ab());
        }), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = new Set(wb()), i = t.dataset.genderValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 3)) return sm.textContent = "Choose no more than three genders.", 
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            kb([ ...n ]), Wg.dispatchEvent(new Event("change", {
                bubbles: !0
            })), xb(), t.focus({
                preventScroll: !0
            }), $b(t);
        }), mb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = performance.now();
            if (mb._tfEl === t && n < mb._tfUntil) return mb._tfEl = null, mb._tfBlock = null, void Sb();
            mb._tfEl = t, mb._tfUntil = n + 3200, mb._tfBlock = t, $b(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && mb._tfBlock === t && (mb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), mb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && $b(t);
        }), mb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && $b(t);
        }), pb.addEventListener("mouseleave", Sb), mb.addEventListener("focusout", () => t.setTimeout(() => {
            (mb.contains(document.activeElement) || fb.contains(document.activeElement)) || Sb();
        }, 0)), mb.addEventListener("keydown", e => {
            const t = [ ...mb.querySelectorAll(".gender-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Eb(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const Cb = e.byId("sexualityPicker"), Mb = e.byId("sexualityTrigger"), Ib = e.byId("sexualityTriggerLabel"), Pb = e.byId("sexualityMenu"), Lb = e.byId("sexualityTooltip");
        function Tb() {
            return iv([ ...Ug.selectedOptions ].map(e => e.value));
        }
        function Fb(e) {
            const t = new Set(iv(e));
            [ ...Ug.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function Nb(e, t = " + ") {
            return iv(e).map(e => sb[e].label).join(t);
        }
        function _b() {
            const e = new Set(Tb()), t = Nb([ ...e ]);
            Ib.textContent = t || "Choose up to 5…", Mb.title = t || "Choose up to five orientations", 
            Pb.querySelectorAll("[data-sexuality-value]").forEach(t => {
                const n = e.has(t.dataset.sexualityValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function Db() {
            Lb.hidden = !0, Pb.querySelectorAll('[aria-describedby="sexualityTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function Rb(e) {
            const t = sb[e.dataset.sexualityValue];
            if (!t) return;
            Db(), Lb.textContent = t.description || t.label, popularitySourceLine(Lb, e.dataset.sexualityValue), Lb.hidden = !1, e.setAttribute("aria-describedby", "sexualityTooltip");
            const n = e.getBoundingClientRect(), i = Lb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Lb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px", 
            Lb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Ob(e = !1) {
            Pb.hidden = !0, Mb.setAttribute("aria-expanded", "false"), Db(), e && Mb.focus();
        }
        function Bb() {
            Pb.hidden = !1, Mb.setAttribute("aria-expanded", "true"), _b();
            const e = Pb.querySelector('[aria-selected="true"]') || Pb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Pb, ab.map(e => `<div class="sexuality-group-label" role="presentation">${Hi(e.label)}</div>${e.options.map(e => {
                const t = e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-sexuality-value="${Hi(t)}" aria-selected="false">${Hi(e + popularitySuffix(t))}</button>`;
            }).join("")}`).join("")), 
        Mb.addEventListener("click", () => Pb.hidden ? Bb() : Ob(!0)), Mb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(), 
            Bb());
        }), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = new Set(Tb()), i = t.dataset.sexualityValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five orientations.", 
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            Fb([ ...n ]), Ug.dispatchEvent(new Event("change", {
                bubbles: !0
            })), _b(), t.focus({
                preventScroll: !0
            }), Rb(t);
        }), Pb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = performance.now();
            if (Pb._tfEl === t && n < Pb._tfUntil) return Pb._tfEl = null, Pb._tfBlock = null, void Db();
            Pb._tfEl = t, Pb._tfUntil = n + 3200, Pb._tfBlock = t, Rb(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Pb._tfBlock === t && (Pb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Pb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Rb(t);
        }), Pb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Rb(t);
        }), Cb.addEventListener("mouseleave", Db), Pb.addEventListener("focusout", () => t.setTimeout(() => {
            (Pb.contains(document.activeElement) || Lb.contains(document.activeElement)) || Db();
        }, 0)), Pb.addEventListener("keydown", e => {
            const t = [ ...Pb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Ob(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const jb = e.byId("rolePicker"), qb = e.byId("roleTrigger"), Hb = e.byId("roleTriggerLabel"), Wb = e.byId("roleMenu"), Ub = e.byId("roleTooltip");
        function Gb(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                const t = String(e || "").trim().toLowerCase();
                Object.prototype.hasOwnProperty.call(ub, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function Kb(e, t = " + ") {
            return Gb(e).map(e => ub[e].label).join(t);
        }
        function zb() {
            return Gb([ ...Gg.selectedOptions ].map(e => e.value));
        }
        function Vb(e) {
            const t = new Set(Gb(e));
            [ ...Gg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function Yb() {
            const e = new Set(zb()), t = Kb([ ...e ]);
            Hb.textContent = t || "Choose up to 5…", qb.title = t || "Choose up to five roles", 
            Wb.querySelectorAll("[data-role-value]").forEach(t => {
                const n = e.has(t.dataset.roleValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function Xb() {
            Ub.hidden = !0, Wb.querySelectorAll('[aria-describedby="roleTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function Zb(e) {
            const t = ub[e.dataset.roleValue];
            if (!t) return;
            Xb(), Ub.textContent = t.description || t.label, popularitySourceLine(Ub, e.dataset.roleValue), Ub.hidden = !1, e.setAttribute("aria-describedby", "roleTooltip");
            const n = e.getBoundingClientRect(), i = Ub.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Ub.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px", 
            Ub.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Qb(e = !1) {
            Wb.hidden = !0, qb.setAttribute("aria-expanded", "false"), Xb(), e && qb.focus();
        }
        function Jb() {
            Wb.hidden = !1, qb.setAttribute("aria-expanded", "true"), Yb();
            const e = Wb.querySelector('[aria-selected="true"]') || Wb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Wb, cb.map(e => `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-role-value="${Hi(e)}" aria-selected="false">${Hi(ub[e].label + popularitySuffix(e))}</button>`).join("")), 
        qb.addEventListener("click", () => Wb.hidden ? Jb() : Qb(!0)), qb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(), 
            Jb());
        }), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = new Set(zb()), i = t.dataset.roleValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five roles.", void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            Vb([ ...n ]), Yb(), t.focus({
                preventScroll: !0
            }), Zb(t);
        }), Wb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = performance.now();
            if (Wb._tfEl === t && n < Wb._tfUntil) return Wb._tfEl = null, Wb._tfBlock = null, void Xb();
            Wb._tfEl = t, Wb._tfUntil = n + 3200, Wb._tfBlock = t, Zb(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Wb._tfBlock === t && (Wb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Wb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Zb(t);
        }), Wb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Zb(t);
        }), jb.addEventListener("mouseleave", Xb), Wb.addEventListener("focusout", () => t.setTimeout(() => {
            (Wb.contains(document.activeElement) || Ub.contains(document.activeElement)) || Xb();
        }, 0)), Wb.addEventListener("keydown", e => {
            const t = [ ...Wb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Qb(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const ev = [ ...e.all("[data-profile-info]") ];
        function tv(t, n, i = !1) {
            const a = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            a && (a.hidden = !n, t.setAttribute("aria-expanded", String(n && i)), n ? t.setAttribute("aria-describedby", `${t.dataset.profileInfo}ProfileInfo`) : t.removeAttribute("aria-describedby"));
        }
        ev.forEach(t => {
            const n = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            n && (n.id = `${t.dataset.profileInfo}ProfileInfo`), t.addEventListener("click", e => {
                e.stopPropagation();
                const n = "true" !== t.getAttribute("aria-expanded");
                ev.forEach(e => tv(e, !1)), tv(t, n, n);
            }), t.addEventListener("mouseenter", () => tv(t, !0, "true" === t.getAttribute("aria-expanded"))), 
            t.addEventListener("mouseleave", () => {
                "true" !== t.getAttribute("aria-expanded") && tv(t, !1);
            }), t.addEventListener("focus", () => tv(t, !0, "true" === t.getAttribute("aria-expanded"))), 
            t.addEventListener("blur", () => {
                "true" !== t.getAttribute("aria-expanded") && tv(t, !1);
            });
        }), window.__sxOnPtr( e => {
            mb.hidden || pb.contains(e.target) || Eb(), Pb.hidden || Cb.contains(e.target) || Ob(), 
            Wb.hidden || jb.contains(e.target) || Qb(), __sxClosestAction(e.target, "profileInfo") || ev.forEach(e => tv(e, !1));
        }, !0), window.addEventListener("resize", () => {
            Sb(), Db(), Xb();
        });
        const nv = {
            "bi-curious": "bicurious",
            reciproseuxal: "reciprosexual",
            private: "not-applicable"
        };
        function iv(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = nv[t] || t, Object.prototype.hasOwnProperty.call(sb, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function av(e) {
            const t = Number(e);
            return Math.round(Math.max(0, Math.min(100, Number.isFinite(t) ? t : 50)));
        }
        function veilZoneText(t) {
            return `${t <= 0 ? "Concealed" : t <= 33 ? "Veiled" : t <= 66 ? "Parted" : t < 100 ? "Unveiling" : "Revealed"} · ${t}`;
        }
        const rv = e.byId("audienceView"), ov = e.byId("veilControl"), sv = e.byId("veilTrigger"), lv = e.byId("veilEnabled"), cv = e.byId("tabVeilEnabled"), dv = e.byId("veilPopover"), uv = e.byId("veilTooltip"), pv = e.byId("audienceVeilSlider"), hv = e.byId("audienceVeilValue"), qzv = e.byId("audienceVeilZone"), gv = e.byId("audienceVeilProfile"), mv = e.byId("audienceVeilHelp"), fv = mv.textContent;
        let yv = 0, bv = sv;
        function vv() {
            return Qt && vt[Qt] ? Qt : Mt && vt[Mt] ? Mt : null;
        }
        function wv(e) {
            return [ ...tl.querySelectorAll("[data-profile-veil]") ].find(t => t.dataset.profileVeil === e) || null;
        }
        function kv(e) {
            if (!e || !vt[e]) return;
            const t = av(vpt[e]), n = Boolean(vht[e]), i = zi(2 * (t - 50)), a = wv(e), r = a && a.parentElement?.querySelector(".profile-tab-button");
            a && (a.classList.toggle("is-enabled", n), a.style.setProperty("--veil-color", i), 
            a.setAttribute("aria-pressed", String(n)), a.setAttribute("aria-label", `${wt[e] || "Profile"} Veil ${n ? "on" : "off"}, level ${t}. Open Veil settings.`), 
            a.title = `Veil ${n ? "on" : "off"} · ${t}`), r && (r.classList.toggle("has-veil", n), 
            r.style.setProperty("--veil-color", i));
        }
        function xv() {
            if (dv.hidden) return;
            const e = (bv && bv.isConnected ? bv : sv).getBoundingClientRect(), t = dv.getBoundingClientRect(), n = e.right + 7, i = n + t.width <= innerWidth - 10 ? n : e.left - t.width - 7;
            dv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, i))}px`, dv.style.top = `${Math.max(10, Math.min(innerHeight - t.height - 10, e.top + e.height / 2 - t.height / 2))}px`, 
            dv.style.right = "auto";
        }
        function Sv() {
            if (uv.hidden) return;
            const e = sv.getBoundingClientRect(), t = uv.getBoundingClientRect(), n = e.left + e.width / 2 - t.width / 2;
            uv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, n))}px`;
            const i = e.top - t.height - 7, a = e.bottom + 7;
            uv.style.top = `${i >= 10 ? i : Math.min(innerHeight - t.height - 10, a)}px`;
        }
        function $v(e = !1) {
            sv.disabled || (t.clear(yv), uv.hidden = !1, Sv(), e && (yv = t.setTimeout(() => {
                uv.hidden = !0;
            }, 2400)));
        }
        function Ev() {
            t.clear(yv), uv.hidden = !0;
        }
        function Av(e, t = !1) {
            dv.hidden = !e, sv.setAttribute("aria-expanded", String(e && bv === sv)), tl.querySelectorAll("[data-profile-veil]").forEach(t => t.setAttribute("aria-expanded", String(e && t === bv))), 
            e && requestAnimationFrame(() => {
                xv(), t && !pv.disabled ? pv.focus({
                    preventScroll: !0
                }) : t && cv.focus({
                    preventScroll: !0
                });
            });
        }
        function Cv(e = !1) {
            const t = bv;
            Av(!1), Qt = null, bv = sv, e && t && t.isConnected && t.focus({
                preventScroll: !0
            });
        }
        function Mv() {
            const e = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            if (rv.hidden = !e, e) {
                const t = av(vpt[e]), n = Boolean(vht[e]);
                hv.value = String(t), hv.textContent = String(t), lv.checked = n, ov.classList.toggle("is-enabled", n), 
                sv.disabled = !1, sv.setAttribute("aria-disabled", String(!n)), sv.style.background = zi(2 * (t - 50)), 
                sv.setAttribute("aria-label", `Intimacy Veil ${t}. ${n ? "Open rating scale." : "Enable Intimacy Veil to adjust."}`);
            } else sv.disabled = !0, lv.checked = !1, ov.classList.remove("is-enabled");
            const t = vv();
            if (!t) return void (dv.hidden || Cv());
            const n = av(vpt[t]), i = Boolean(vht[t]);
            pv.value = String(n), qzv && (qzv.textContent = veilZoneText(n)), pv.disabled = !i, cv.checked = i, cv.setAttribute("aria-label", `${i ? "Disable" : "Enable"} Intimacy Veil for ${wt[t] || "this profile"}`), 
            dv.classList.toggle("is-enabled", i), gv.textContent = wt[t] || "Active profile", 
            pv.setAttribute("aria-label", `Intimacy Veil for ${wt[t] || "the active profile"}`), dv.classList.remove("is-clear-preview"), 
            mv.textContent = fv;
        }
        function Iv(e, t) {
            if (!e || !vt[e]) return;
            const n = Boolean(vht[e]) !== Boolean(t);
            vht[e] = Boolean(t), n && zt(e), Mv(), kv(e), sxRefreshMatchTabs();
            const i = Kd();
            (e === Mt || i && Array.isArray(i.sourceIds) && i.sourceIds.includes(e)) && Mr();
        }
        let Pv = 0;
        sv.addEventListener("pointerenter", () => $v()), sv.addEventListener("pointerleave", () => {
            dv.hidden && Ev();
        }), sv.addEventListener("focus", () => $v()), sv.addEventListener("blur", () => {
            dv.hidden && Ev();
        }), sv.addEventListener("click", e => {
            e.preventDefault();
            const t = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            $v(!0), t && vht[t] && (Qt = t, bv = sv, Mv(), Av(!0, !0));
        }), lv.addEventListener("change", () => {
            const e = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            e && (Qt = e, bv = sv, Iv(e, lv.checked));
        }), cv.addEventListener("change", () => {
            const e = vv();
            e && Iv(e, cv.checked);
        }), window.__sxOnPtr( e => {
            dv.hidden || dv.contains(e.target) || __sxClosestAction(e.target, "profileVeil") || rv.contains(e.target) || (Cv(), 
            Ev());
        }, !0), window.__sxOnKey( e => {
            "Escape" !== e.key || dv.hidden || (e.preventDefault(), Ev(), Cv(!0));
        }), window.addEventListener("resize", () => {
            xv(), Sv();
        }), pv.addEventListener("input", () => {
            const e = vv();
            if (!e) return Mv();
            const t = av(pv.value);
            vpt[e] = t, zt(e), kv(e), qzv && (qzv.textContent = veilZoneText(t)), e === Mt && (hv.value = String(t), hv.textContent = String(t), 
            sv.style.background = zi(2 * (t - 50)), sv.setAttribute("aria-label", `Intimacy Veil ${t}. Open rating scale.`)), 
            vht[e] && (Pv && cancelAnimationFrame(Pv), Pv = requestAnimationFrame(() => {
                Pv = 0, Mr({
                    animate: !1,
                    forceRepaint: !0
                });
            }));
        });
        let Lv = null;
        function Tv(e) {
            const t = pv.getBoundingClientRect(), n = .08 * t.height;
            return e.clientY < t.top - n || e.clientY > t.bottom + n;
        }
        function Fv(e) {
            dv.classList.toggle("is-clear-preview", e), mv.textContent = e ? "Release to turn off Veil." : fv, 
            pv.setAttribute("aria-valuetext", e ? "Release to turn off" : String(pv.value));
        }
        function Nv(e) {
            if (!Lv || Lv.pointerId !== e.pointerId) return;
            const t = Lv;
            Lv = null;
            const n = "pointerup" === e.type && (t.clearing || Tv(e));
            if (Fv(!1), !n) return Cv(), void Ev();
            vpt[t.id] = t.startValue, Iv(t.id, !1), Cv(), Ev();
        }
        pv.addEventListener("pointerdown", e => {
            const t = vv();
            if (t && vht[t]) {
                Lv = {
                    pointerId: e.pointerId,
                    id: t,
                    startValue: av(vpt[t]),
                    clearing: !1
                };
                try {
                    pv.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
            }
        }), pv.addEventListener("pointermove", e => {
            Lv && Lv.pointerId === e.pointerId && (Lv.clearing = Tv(e), Fv(Lv.clearing));
        }), pv.addEventListener("pointerup", Nv), pv.addEventListener("pointercancel", Nv);
        /* B3 (SURFACES): the per-tab Heat button + its popover. Heat is
           SESSION state only (sxcv.heat + sxcvSave()); it never joins the
           profile store's maps, the collect/export snapshot, or either
           payload format. Group Heat is the same session state
           (sxcv.groupHeat, keyed by group profile id); the one popover
           serves both, branching on the group record, and adjusting
           Group Heat never touches a member's heat or any score.
           The popover lifecycle mirrors the Veil popover's
           (open/close/outside-click/Escape). */
        let sxHeatQt = null, sxHeatBv = null;
        function sxHeatBtnFor(e) {
            return [ ...tl.querySelectorAll("[data-profile-heat]") ].find(t => t.dataset.profileHeat === e) || null;
        }
        function sxKvHeat(e) {
            if (!e || !vt[e]) return;
            const b = sxHeatBtnFor(e), v = sxHeatDisplayFor(e), z = sxHeatZone(v), grp = sxIsGroup(e);
            b && ((b.querySelector(".sx-heat-zone") || b).textContent = z, b.title = `${grp ? "Group Heat" : "Heat"} · ${z}`, b.setAttribute("aria-label", `${wt[e] || "Profile"} ${grp ? "Group Heat" : "Heat"} ${z}. Open Heat settings.`));
        }
        function sxMvHeat() {
            const t = sxHeatQt, pop = e.byId("heatPopover");
            if (!pop) return;
            if (!t || !vt[t]) return void sxCvHeat();
            const v = sxHeatDisplayFor(t), sl = e.byId("heatSlider"), out = e.byId("heatValue"), nm = e.byId("heatProfileName"), grp = sxIsGroup(t);
            sl && (sl.value = String(v)), out && (out.textContent = `${sxHeatZone(v)} · ${v > 0 ? "+" + v : v}`), 
            nm && (nm.textContent = wt[t] || "Profile"), sl && sl.setAttribute("aria-label", `${grp ? "Group heat" : "Heat"} for ${wt[t] || (grp ? "the group" : "the profile")}`);
        }
        function sxPosHeat() {
            const pop = e.byId("heatPopover");
            if (!pop || pop.hidden || !sxHeatBv) return;
            const a = (sxHeatBv.isConnected ? sxHeatBv : sxHeatBtnFor(sxHeatQt) || sxHeatBv).getBoundingClientRect(), t = pop.getBoundingClientRect(), n = a.right + 7, i = n + t.width <= innerWidth - 10 ? n : a.left - t.width - 7;
            pop.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, i))}px`, pop.style.top = `${Math.max(10, Math.min(innerHeight - t.height - 10, a.top + a.height / 2 - t.height / 2))}px`, 
            pop.style.right = "auto";
        }
        function sxAvHeat(open, focusIt = !1) {
            const pop = e.byId("heatPopover");
            if (!pop) return;
            pop.hidden = !open, tl.querySelectorAll("[data-profile-heat]").forEach(b => b.setAttribute("aria-expanded", String(open && b === sxHeatBv))), 
            open && requestAnimationFrame(() => {
                sxPosHeat(), focusIt && e.byId("heatSlider")?.focus({
                    preventScroll: !0
                });
            });
        }
        function sxCvHeat(refocus = !1) {
            const b = sxHeatBv;
            sxAvHeat(!1), sxHeatQt = null, sxHeatBv = null, refocus && b && b.isConnected && b.focus({
                preventScroll: !0
            });
        }
        function sxToggleHeatPopover(id, btn) {
            const pop = e.byId("heatPopover");
            if (!pop || !id || !vt[id]) return;
            if (!pop.hidden && sxHeatQt === id && sxHeatBv === btn) return void sxCvHeat();
            sxHeatQt = id, sxHeatBv = btn, sxMvHeat(), sxAvHeat(!0, !0);
        }
        const sxHeatPopEl = e.byId("heatPopover"), sxHeatSliderEl = e.byId("heatSlider");
        sxHeatSliderEl && sxHeatSliderEl.addEventListener("input", () => {
            const t = sxHeatQt;
            if (!t) return;
            const v = Math.max(-100, Math.min(100, Math.round(Number(sxHeatSliderEl.value) || 0)));
            sxIsGroup(t) ? sxcv.groupHeat[t] = v : sxcv.heat[t] = v, sxcvSave(), 
            sxMvHeat(), sxKvHeat(t), sxRefreshMatchTabs();
        }), window.__sxOnPtr( ev2 => {
            const pop = e.byId("heatPopover");
            !pop || pop.hidden || pop.contains(ev2.target) || __sxClosestAction(ev2.target, "profileHeat") || sxCvHeat();
        }, !0), window.__sxOnKey( ev2 => {
            if ("Escape" !== ev2.key) return;
            const pop = e.byId("heatPopover");
            pop && !pop.hidden && (ev2.preventDefault(), sxCvHeat(!0));
        }), window.addEventListener("resize", () => sxPosHeat());
        const _v = [ "telegram", "linktree", "fetlife", "chaturbate", "stripchat", "myfreecams", "pornhub", "xvideos", "xhamster", "onlyfans", "reddit", "x" ];
        function Dv(e) {
            let t = String(e || "").trim().replace(/[\r ]/g, "").replace(/^@/, "").slice(0, 100);
            try {
                /^https?:\/\//i.test(t) && (t = new URL(t).pathname.split("/").filter(Boolean).pop() || "");
            } catch (e) { __sxErrLog("app", e); }
            return /^[a-z0-9_.-]{1,100}$/i.test(t) ? t : "";
        }
        function Rv(e) {
            const t = e && "object" == typeof e ? e : {}, n = {
                fullName: "",
                telegram: "",
                linktree: "",
                fetlife: "",
                chaturbate: "",
                stripchat: "",
                myfreecams: "",
                pornhub: "",
                xvideos: "",
                xhamster: "",
                onlyfans: "",
                reddit: "",
                x: "",
                phone: "",
                email: "",
                customSites: []
            };
            n.fullName = String(t.fullName || "").trim().replace(/[\r ]/g, " ").replace(/\s+/g, " ").slice(0, 100), 
            _v.forEach(e => n[e] = Dv(t[e] || "")), n.phone = String(t.phone || "").trim().replace(/[\r ]/g, " ").replace(/\s+/g, " ").slice(0, 60);
            const i = String(t.email || "").trim().replace(/[\r ]/g, "").slice(0, 254);
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i) && (n.email = i), Array.isArray(t.customSites) && t.customSites.slice(0, 20).forEach(e => {
                if (e && "object" == typeof e) {
                    const t = String(e.site || "").trim().slice(0, 60), i = String(e.url || "").trim().slice(0, 500), a = Dv(e.username || "");
                    t && i && /^https?:\/\//i.test(i) && a && n.customSites.push({
                        site: t,
                        url: i,
                        username: a
                    });
                }
            }), n;
        }
        function Ov(e) {
            const t = Rv(e);
            return _v.concat([ "phone", "email" ]).filter(e => t[e]).length + (Array.isArray(t.customSites) ? t.customSites.length : 0);
        }
        const CONTACT_BLOCK_SITES_CSV = "telegram:Telegram,linktree:linktr.ee,fetlife:FetLife,chaturbate:Chaturbate,stripchat:Stripchat,myfreecams:MyFreeCams,pornhub:PornHub,xvideos:XVideos,xhamster:xHamster,onlyfans:OnlyFans,reddit:Reddit,x:X,custom:Custom";
        // The site pulldown is driven by the CSV list above: each entry is
        // value:label, in pulldown order. No plus-joined list is used.
        const CONTACT_BLOCK_SITES = CONTACT_BLOCK_SITES_CSV.split(",").map(e => {
            const [value, label] = e.split(":");
            return { value: value, label: label || value };
        });
        let contactBlocks = [];
        function contactBlockIsEmpty(b) {
            return !b.usernameInput.value.trim() && !b.siteSelect.value;
        }
        function refreshContactBlockChrome() {
            contactBlocks.forEach(b => {
                b.removeButton.hidden = contactBlockIsEmpty(b);
            });
        }
        function closeContactBlockMenus() {
            // No per-row site menu remains: the site selector is a native
            // single-choice pulldown. Kept so the existing dialog-close
            // call sites need no change.
        }
        function createContactBlock(data) {
            const d = data || {}, el = document.createElement("div");
            el.className = "profile-contact-block", n(el, `<div class="profile-contact-block-main"><input class="profile-contact-block-username" type="text" maxlength="100" placeholder="username" aria-label="Username" autocomplete="off"><select class="profile-contact-block-site" aria-label="Site for this username"><option value="">Choose a site\u2026</option>${CONTACT_BLOCK_SITES.map(e => `<option value="${Hi(e.value)}">${Hi(e.label)}</option>`).join("")}</select><span class="profile-contact-block-actions"><button class="profile-contact-block-add" type="button" aria-label="Add another username">+</button><button class="profile-custom-site-remove profile-contact-block-remove" type="button" aria-label="Remove this username" hidden>\u00d7</button></span></div><div class="profile-contact-block-custom" hidden><input class="profile-contact-block-custom-site" type="text" maxlength="60" placeholder="Custom site name" aria-label="Custom site name"><input class="profile-contact-block-custom-url" type="url" maxlength="500" placeholder="https://..." aria-label="Custom site profile URL"><small class="profile-validation-message profile-contact-block-custom-error" hidden></small></div>`);
            const b = {
                el: el,
                usernameInput: el.querySelector(".profile-contact-block-username"),
                siteSelect: el.querySelector(".profile-contact-block-site"),
                addButton: el.querySelector(".profile-contact-block-add"),
                removeButton: el.querySelector(".profile-contact-block-remove"),
                customRow: el.querySelector(".profile-contact-block-custom"),
                customSiteInput: el.querySelector(".profile-contact-block-custom-site"),
                customUrlInput: el.querySelector(".profile-contact-block-custom-url"),
                customError: el.querySelector(".profile-contact-block-custom-error")
            };
            b.selectedSites = () => b.siteSelect.value ? [ b.siteSelect.value ] : [], b.setSites = e => {
                b.siteSelect.value = (e || [])[0] || "";
            }, b.refresh = () => {
                b.customRow.hidden = "custom" !== b.siteSelect.value, refreshContactBlockChrome();
            }, b.pickSite = e => {
                b.setSites([ e ]), b.siteSelect.dispatchEvent(new Event("change", {
                    bubbles: !0
                })), b.refresh();
            };
            b.siteSelect.addEventListener("change", () => {
                const v = b.siteSelect.value;
                v && contactBlocks.forEach(t => {
                    t !== b && t.siteSelect.value === v && (t.setSites([]), t.refresh());
                }), b.customError.hidden = !0, b.refresh();
            }), b.addButton.addEventListener("click", () => {
                const nb = addContactBlock(null);
                refreshContactBlockChrome(), nb && nb.usernameInput.focus({
                    preventScroll: !0
                });
            }), b.usernameInput.addEventListener("input", refreshContactBlockChrome),
            b.customSiteInput.addEventListener("input", () => {
                b.customError.hidden = !0, b.refresh();
            }), b.customUrlInput.addEventListener("input", () => {
                b.customError.hidden = !0;
            }), b.removeButton.addEventListener("click", () => removeContactBlock(b)),
            b.usernameInput.value = d.username || "", b.setSites(d.sites || []),
            d.custom && (b.customSiteInput.value = d.custom.site || "", b.customUrlInput.value = d.custom.url || ""),
            b.refresh();
            return b;
        }
        function removeContactBlock(b) {
            const i = contactBlocks.indexOf(b);
            i >= 0 && contactBlocks.splice(i, 1), b.el.remove(), contactBlocks.length || addContactBlock(null), refreshContactBlockChrome();
        }
        function addContactBlock(data) {
            const host = e.byId("profileDetailsContactBlocks");
            if (!host) return null;
            const b = createContactBlock(data);
            return contactBlocks.push(b), host.appendChild(b.el), refreshContactBlockChrome(), b;
        }
        function deriveContactBlocks(contact) {
            const c = Rv(contact), order = [], byUser = new Map(), get = u => {
                if (!byUser.has(u)) {
                    const b = {
                        username: u,
                        sites: [],
                        customs: []
                    };
                    byUser.set(u, b), order.push(b);
                }
                return byUser.get(u);
            };
            _v.forEach(k => {
                c[k] && get(c[k]).sites.push(k);
            }), (c.customSites || []).forEach(cs => {
                cs && cs.username && get(cs.username).customs.push({
                    site: cs.site,
                    url: cs.url
                });
            });
            const blocks = [];
            return order.forEach(b => {
                // One pulldown, one site per row: expand a username used
                // on several sites into one row per site, then one row
                // per custom site.
                b.sites.forEach(s => blocks.push({
                    username: b.username,
                    sites: [ s ],
                    custom: null
                }));
                b.customs.forEach(cs => blocks.push({
                    username: b.username,
                    sites: [ "custom" ],
                    custom: cs
                }));
            }), blocks;
        }
        function Hv(t) {
            const i = Rv(t);
            Yg.value = i.phone, Zg.value = i.email;
            const host = e.byId("profileDetailsContactBlocks");
            if (host) {
                contactBlocks = [], host.replaceChildren(), deriveContactBlocks(i).forEach(d => addContactBlock(d)), addContactBlock(null), refreshContactBlockChrome();
                // The per-row + button wires itself in createContactBlock.
            }
        }
        function readContactBlocks() {
            const raw = {
                fullName: Hy && ut[Hy] ? ut[Hy].fullName : "",
                phone: Yg.value,
                email: Zg.value,
                customSites: []
            }, claimField = {};
            _v.forEach(k => raw[k] = ""), contactBlocks.forEach(b => {
                b.customError.hidden = !0;
            });
            for (const b of contactBlocks) {
                const username = b.usernameInput.value.trim();
                if (!username) continue;
                for (const site of b.selectedSites()) {
                    if ("custom" === site) {
                        const name = b.customSiteInput.value.trim(), url = b.customUrlInput.value.trim();
                        if (!name || !url) return b.customError.textContent = "Name the custom site and paste its full profile link (starting https://), or choose a different site for this username.",
                        b.customError.hidden = !1, {
                            error: "A custom site needs both a name and its profile link — see the Usernames section.",
                            field: name ? b.customUrlInput : b.customSiteInput
                        };
                        raw.customSites.push({
                            site: name,
                            url: url,
                            username: username
                        });
                    } else raw[site] = username, claimField[site] = b.usernameInput;
                }
            }
            const t = Rv(raw);
            for (const k of _v) if (raw[k].trim() && !t[k]) return {
                error: `Enter only the ${k} username, using letters, numbers, dots, dashes, or underscores.`,
                field: claimField[k]
            };
            return raw.email.trim() && !t.email ? {
                error: "Enter a valid email address.",
                field: Zg
            } : {
                contact: t
            };
        }
        function stageContactUsername(username) {
            const u = String(username || "").trim();
            if (!u) return;
            let b = contactBlocks.find(b => b.usernameInput.value.trim() === u);
            b || (b = contactBlocks.find(contactBlockIsEmpty) || addContactBlock(null)), b && (b.usernameInput.value = u, b.pickSite("fetlife"), refreshContactBlockChrome());
        }
        function Uv(e) {
            return String(e || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, " ").replace(/,/g, "\\,").replace(/;/g, "\\;");
        }
        function Gv(e) {
            return String(e || "").replace(/\ /gi, " ").replace(/\\([\\,;])/g, "$1");
        }
        const Kv = {
            telegram: "X-TELEGRAM",
            linktree: "X-LINKTREE",
            fetlife: "X-FETLIFE",
            chaturbate: "X-CHATURBATE",
            stripchat: "X-STRIPCHAT",
            myfreecams: "X-MYFREECAMS",
            pornhub: "X-PORNHUB",
            xvideos: "X-XVIDEOS",
            xhamster: "X-XHAMSTER",
            onlyfans: "X-ONLYFANS",
            reddit: "X-REDDIT",
            x: "X-X"
        };
        function zv(e) {
            const t = Rv(ut[e]);
            if (!Ov(t)) return "";
            const n = [ "BEGIN:VCARD", "VERSION:4.0", `FN:${Uv(t.fullName || wt[e] || "Sexcapades profile")}` ];
            return t.phone && n.push(`TEL;TYPE=cell:${Uv(t.phone)}`), t.email && n.push(`EMAIL:${Uv(t.email)}`), 
            _v.forEach(e => {
                t[e] && (n.push(`${Kv[e]}:${Uv(t[e])}`), n.push(`URL;TYPE=x-${e}:${Uv(_i(e, t[e]))}`));
            }), n.push("END:VCARD"), n.join("\r\n") + "\r\n";
        }
        function Vv(e) {
            if (!Array.isArray(e)) return [];
            const t = [];
            return e.slice(0, 8).forEach(e => {
                if (!e || "object" != typeof e || "string" != typeof e.data || !/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(e.data) || e.data.length > 65e5) return;
                const n = Math.max(1, Math.min(3e3, Number(e.width) || 1)), i = Math.max(1, Math.min(3e3, Number(e.height) || 1)), a = A(Number.isFinite(Number(e.cropX)) ? Number(e.cropX) : .5), r = A(Number.isFinite(Number(e.cropY)) ? Number(e.cropY) : .5), o = Math.max(1, Math.min(3, Number(e.cropZoom) || 1)), s = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), l = Math.abs(a - .5) > .001 || Math.abs(r - .5) > .001 || Math.abs(o - 1) > .001 || Math.abs(s) > .001, c = !0 === e.manualCrop || l;
                t.push({
                    data: e.data,
                    width: n,
                    height: i,
                    cropX: a,
                    cropY: r,
                    cropZoom: o,
                    cropRotation: s,
                    cropReady: !0 === e.cropReady || c,
                    manualCrop: c
                });
            }), t;
        }
        function Yv(e) {
            return Vv(e).map(e => Object.assign({}, e));
        }
        function Xv(e) {
            const t = Number.parseInt(String(e || "").trim(), 10);
            return Number.isInteger(t) && t >= 18 && t <= 120 ? String(t) : "";
        }
        function Zv(e) {
            return String(e || "").trim().replace(/\s+/g, " ").slice(0, 80);
        }
        function Qv(e) {
            const t = vb(rt[e]), n = Nb(ot[e]), i = Kb(st[e]), a = Xv(lt[e]);
            return [ t || "Gender not set", n || "Orientation not set", i ? `Roles: ${i}` : "", a ? `Age ${a}` : "", Zv(ct[e]) ].filter(Boolean).join(" · ");
        }
        function Jv(e, t, n) {
            const i = od(e);
            return !i.length || (bw(e) && (zy = {
                id: e,
                action: n
            }, sm.textContent = `Choose ${i.join(" and ")} before ${t}.`), !1);
        }
        function ew() {
            dm.textContent = Wy.length ? `${Wy.length} attached${8 === Wy.length ? " · maximum" : ""}` : "none attached", 
            e.byId("chooseProfilePhotos").disabled = Wy.length >= 8, n(cm, Wy.map((e, t) => `<div class="profile-photo-thumb${0 === t ? " is-center-photo" : ""}"><button class="profile-photo-preview" type="button" data-adjust-photo="${t}" aria-label="Adjust center crop for attached photo ${t + 1}"><svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><defs><clipPath id="profilePhotoDraftClip${t}"><circle cx="50" cy="50" r="49"/></clipPath></defs><g clip-path="url(#profilePhotoDraftClip${t})">${aa(e, {
                x: 0,
                y: 0,
                w: 100,
                h: 100
            })}</g><circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,.58)" stroke-width="2"/></svg><span class="profile-photo-crop-label">${0 === t ? "Center photo · adjust" : "Adjust crop"}</span></button><span class="profile-photo-order"><button type="button" data-move-photo="${t}" data-photo-step="-1" aria-label="Move attached photo ${t + 1} earlier" ${0 === t ? "disabled" : ""}>↑</button><button type="button" data-move-photo="${t}" data-photo-step="1" aria-label="Move attached photo ${t + 1} later" ${t === Wy.length - 1 ? "disabled" : ""}>↓</button></span><button class="profile-photo-remove" type="button" data-remove-photo="${t}" aria-label="Remove attached photo ${t + 1}">×</button></div>`).join(""));
        }
        function tw(e) {
            return {
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: e
            };
        }
        function nw(e, t = "invalid-result") {
            return e && Number.isFinite(Number(e.cropX)) && Number.isFinite(Number(e.cropY)) ? {
                cropX: A(Number(e.cropX)),
                cropY: A(Number(e.cropY)),
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: String(e.focusStatus || "detected")
            } : tw(t);
        }
        async function iw(e, n, i) {
            const a = Math.max(1, Number(n) || Number(e && e.width) || 1), r = Math.max(1, Number(i) || Number(e && e.height) || 1), o = {
                secureContext: window.isSecureContext,
                faceDetectorType: typeof window.FaceDetector
            };
            if ("function" !== o.faceDetectorType) return tw("unavailable");
            let s = null;
            try {
                const n = new window.FaceDetector({
                    fastMode: !0,
                    maxDetectedFaces: 8
                }), i = {
                    timeout: !0
                }, o = e => Promise.race([ Promise.resolve().then(() => n.detect(e)), new Promise(e => t.setTimeout(() => e(i), 2400)) ]), l = [];
                if ("function" == typeof window.createImageBitmap) try {
                    s = await window.createImageBitmap(e), l.push(s);
                } catch (e) {
                    String(e && e.message || e);
                }
                l.push(e);
                let c = null, d = !1, u = null, p = 0;
                for (const t of l) {
                    p++;
                    try {
                        const e = await o(t);
                        if (e === i) {
                            d = !0;
                            continue;
                        }
                        if (Array.isArray(e) && e.length) {
                            c = e;
                            break;
                        }
                        null === c && (c = []);
                    } catch (e) {
                        u = e;
                    }
                }
                const h = (c || []).filter(e => {
                    const t = e && e.boundingBox;
                    return t && Number.isFinite(Number(t.width)) && Number.isFinite(Number(t.height)) && Number(t.width) > 0 && Number(t.height) > 0;
                }).sort((e, t) => Number(t.boundingBox.width) * Number(t.boundingBox.height) - Number(e.boundingBox.width) * Number(e.boundingBox.height))[0];
                if (!h) {
                    const e = d ? "timeout" : u ? "rejected" : "no-face";
                    return u && String(u.message || u), tw(e);
                }
                const g = h.boundingBox, m = Number.isFinite(Number(g.x)) ? Number(g.x) : Number(g.left) || 0, f = Number.isFinite(Number(g.y)) ? Number(g.y) : Number(g.top) || 0, y = nw({
                    cropX: (m + Number(g.width) / 2) / a,
                    cropY: (f + Number(g.height) / 2) / r,
                    focusStatus: "detected"
                });
                return y.focusStatus, y.cropX, y.cropY, y;
            } catch (e) {
                return String(e && e.message || e), tw("error");
            } finally {
                s && "function" == typeof s.close && s.close();
            }
        }
        function aw(e) {
            return new Promise((t, n) => {
                if (!e || !/^(?:image\/(?:jpeg|png|webp|gif))$/i.test(e.type) || e.size > 3e7) return void n(new Error("Choose a PNG, JPEG, WebP, or GIF under 30 MB."));
                const i = URL.createObjectURL(e), a = new Image;
                a.onload = async () => {
                    try {
                        const e = Math.max(a.naturalWidth, a.naturalHeight);
                        if (!e) throw new Error("That image has no readable dimensions.");
                        const r = Math.min(1, 3e3 / e), o = Math.max(1, Math.round(a.naturalWidth * r)), s = Math.max(1, Math.round(a.naturalHeight * r)), l = document.createElement("canvas");
                        l.width = o, l.height = s;
                        const c = l.getContext("2d");
                        c.fillStyle = "#151816", c.fillRect(0, 0, o, s), c.drawImage(a, 0, 0, o, s);
                        const d = nw(await iw(l, o, s));
                        let u = null;
                        for (const e of [ .86, .78, .7, .62 ]) if (u = await new Promise(t => l.toBlob(t, "image/jpeg", e)), 
                        u && u.size <= 22e5) break;
                        if (URL.revokeObjectURL(i), !u) return void n(new Error("That image could not be prepared."));
                        const p = new FileReader;
                        p.onload = () => t(Object.assign({
                            data: String(p.result || ""),
                            width: o,
                            height: s,
                            cropX: .5,
                            cropY: .5,
                            cropZoom: 1,
                            cropReady: !0,
                            manualCrop: !1
                        }, d || {})), p.onerror = () => n(new Error("That image could not be prepared.")), 
                        p.readAsDataURL(u);
                    } catch (e) {
                        URL.revokeObjectURL(i), n(e);
                    }
                }, a.onerror = () => {
                    URL.revokeObjectURL(i), n(new Error("That image could not be opened."));
                }, a.src = i;
            });
        }
        function rw(t, n, i, a = "") {
            const r = e.byId(t), o = e.byId(n);
            r && o && (r.classList.toggle("is-invalid", i), o.hidden = !i, a && (o.textContent = a), 
            r.querySelectorAll("input,select,button").forEach(e => {
                i ? e.setAttribute("aria-invalid", "true") : e.removeAttribute("aria-invalid");
            }));
        }
        function ow() {
            const e = [ ..._g.querySelectorAll('input:not([type="file"]),textarea,select') ];
            return JSON.stringify(e.map(e => {
                const t = e instanceof HTMLSelectElement && e.multiple ? [ ...e.selectedOptions ].map(e => e.value) : e.value;
                return [ e.id, e.type, t, Boolean(e.checked) ];
            }));
        }
        function sw() {
            zy = null, Vy = null, jY = null, Hy = null, Wy = [], lm.value = "", Uy = "", Gy = [], Eb(), 
            Ob(), Qb(), closeContactBlockMenus(), Ui(wm), Ui(_g);
        }
        function lw() {
            Ui(wm), Wi(_g), requestAnimationFrame(() => {
                const e = _g.querySelector(".dialog-body");
                e && (e.scrollTop = Ky), Hg.focus({
                    preventScroll: !0
                });
            });
        }
        function cw() {
            if (Eb(), Ob(), Qb(), closeContactBlockMenus(), !function() {
                return ow() !== Uy || (t = Gy, !((e = Wy).length === t.length && e.every((e, n) => {
                    const i = t[n] || {};
                    return [ ...new Set([ ...Object.keys(e || {}), ...Object.keys(i) ]) ].every(t => (e || {})[t] === i[t]);
                })));
                var e, t;
            }()) return void sw();
            const t = _g.querySelector(".dialog-body");
            Ky = t ? t.scrollTop : 0, e.byId("discardProfileDetailsQuestion").textContent = Hy ? "Changes made in this profile editor have not been saved." : "This new profile has not been created.", 
            Ui(_g), Wi(wm), requestAnimationFrame(() => e.byId("keepEditingProfileDetails").focus());
        }
        function dw() {
            am.textContent = `${im.value.length}/${im.maxLength} characters`, om.textContent = `${rm.value.length}/${rm.maxLength} characters`;
        }
        function uw(t) {
            const i = e.byId("profileTimingSummary"), a = e.byId("profileTimingList"), r = St(mt[t]), o = Object.keys(kt).filter(e => r[e]).map(e => {
                const t = r[e], n = t.total ? ` · ${t.count}/${t.total}` : "";
                return `<li><strong>${Hi(kt[e])}</strong> · ${xt(t.durationSeconds)} total${n} · saved ${Hi(function(e) {
                    const t = new Date(e);
                    return Number.isNaN(t.getTime()) ? "" : new Intl.DateTimeFormat(void 0, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }).format(t);
                }(t.completedAt))}</li>`;
            });
            n(a, o.join("")), i.hidden = !o.length;
        }
        function pw(e) {
            e || fs(), Ag.dataset.submitted = "false";
        }
        async function hw(e = "save", t = Go) {
            if ("save" !== e) return;
            const consent = window.SexcapadesRuntime.DOM.byId("surveyContributionConsent");
            if (!consent) __sxErrLog("survey-consent", new Error("The list-view survey consent control (surveyContributionConsent) is absent from the page; the survey send decision comes from the shell consent state instead."));
            if ("function" === typeof window.__sxSurveyOptedIn) {
                if (!window.__sxSurveyOptedIn()) return;
            } else {
                __sxErrLog("survey-consent", new Error("window.__sxSurveyOptedIn is unavailable; falling back to the list-view consent control read."));
                if (!consent || !consent.checked) return;
            }
            const n = t;
            if (!n) return;
            const i = cs(n);
            if (i.rated) try {
                await u({
                    action: "survey",
                    uuid: c(),
                    ratings: wu(n),
                    app_version: "3.5",
                    app_build: document.querySelector('meta[name="sexcapades-build"]')?.getAttribute("content") || "",
                    topic_count: i.rated
                });
            } catch (e) {
                xg.textContent = "Profile saved, but the anonymous ratings could not be shared.";
            }
        }
        let gw = "edit";
        function mw(t) {
            gw = "about" === t ? "about" : "edit", Dg.dataset.profileMode = gw, _g.dataset.profileMode = gw, 
            Rg.hidden = "about" !== gw, "about" === gw && Hy ? (function(t) {
                const i = String(nt[t] || "").trim(), a = String(it[t] || "").trim(), r = Yv(dt[t])[0], o = dc(t), s = o.green.length + o.yellow.length + o.red.length, l = Rv(ut[t]), c = Di(l);
                l.phone && c.unshift({
                    label: "Phone",
                    user: l.phone,
                    href: `tel:${l.phone.replace(/[^\d+*#,;]/g, "")}`
                }), l.email && c.unshift({
                    label: "Email",
                    user: l.email,
                    href: `mailto:${l.email}`
                }), Og.hidden = !r, n(Og, r ? `<img src="${Hi(r.data)}" alt="${Hi(wt[t] || "Profile")} profile photo"><svg class="profile-glance-rings" viewBox="0 0 120 120" role="img" aria-label="At a glance: ${o.percentages.green}% green, ${o.percentages.yellow}% yellow, ${o.percentages.red}% red"><title>${o.percentages.green}% green · ${o.percentages.yellow}% yellow · ${o.percentages.red}% red</title><circle class="ring-track" cx="60" cy="60" r="56"/><circle class="ring-green" cx="60" cy="60" r="56" pathLength="100" stroke-dasharray="${o.percentages.green} 100"/><circle class="ring-yellow" cx="60" cy="60" r="50" pathLength="100" stroke-dasharray="${o.percentages.yellow} 100"/><circle class="ring-red" cx="60" cy="60" r="44" pathLength="100" stroke-dasharray="${o.percentages.red} 100"/></svg>` : ""), 
                Bg.textContent = Qv(t), n(jg, `<span class="profile-dialog-rating-total">${s} rated topic${1 === s ? "" : "s"}</span>`);
                const d = e.byId("profileDialogAboutSection"), u = e.byId("profileDialogTermsSection"), p = e.byId("profileDialogContactSection");
                d.hidden = !i, e.byId("profileDialogAboutText").textContent = i, u.hidden = !a, 
                e.byId("profileDialogTermsText").textContent = a, p.hidden = !c.length, qg.replaceChildren(), 
                c.forEach(e => {
                    const t = document.createElement("div"), n = document.createElement("strong"), i = document.createElement("a");
                    t.className = "profile-dialog-site-group", n.textContent = e.label, i.href = e.href, 
                    i.textContent = e.user, /^mailto:|^tel:/i.test(e.href) || (i.target = "_blank", 
                    i.rel = "noopener noreferrer"), t.append(n, i), qg.append(t);
                });
            }(Hy), e.byId("profileDetailsTitle").textContent = "About Profile", _g.querySelector(".dialog-head p").textContent = `Profile: ${wt[Hy] || "Profile"}`) : (e.byId("profileDetailsTitle").textContent = Hy ? "Edit profile" : "New profile", 
            _g.querySelector(".dialog-head p").textContent = Hy ? `Profile: ${wt[Hy] || "Profile"}` : "Name the profile and choose the identity language used by the scene builder.");
        }
        let fw = !1;
        function yw() {
            var t = e.byId("profileIndependentTip");
            t && (t.hidden = !0, t.style.display = "none"), fw = !0;
        }
        // DETAILS HARD BLOCK (owner ruling, 2026-10-27): the profile
        // details dialog opens ONLY for the profile of the tab active in
        // the viewport. bw() is the dialog's only opener, so the gate
        // lives here, ahead of every state change bw makes: a blocked
        // attempt opens nothing, changes no profile, writes nothing, and
        // never activates the target's tab — it refuses with a visible
        // toast naming the profile. While a pair (match) tab is active,
        // only that pair's own saved-group profile may open; its member
        // profiles may not. bw(null) is profile CREATION (not any existing
        // profile's details) and the transient guide profile has no tab
        // at all, so neither is a non-active profile's details; both pass.
        function sxDetailsBlocked(t) {
            const a = e.byId("toast"), r = e.byId("toastMessage");
            if (!a || !r) return;
            r.textContent = `Details for ${wt[t] || "that profile"} open only while its tab is the one on screen — switch to that tab first.`;
            a.dataset.tone = "error", a.setAttribute("role", "alert"), a.classList.add("is-persistent", "show");
        }
        function bw(t = null, n = {}) {
            if (t && vt[t] && t !== ROXY_PROFILE_ID) {
                const sxTab = sxCurrentTab(), sxAllowed = sxTab ? t === (sxTab.groupId || null) : t === Mt;
                if (!sxAllowed) return sxDetailsBlocked(t), !1;
            }
            zy = null, xw(), Sw(), Ui(kg), Hy = t && vt[t] ? t : null;
            const i = Hy ? bb(rt[Hy]) : [];
            Hg.value = Hy ? wt[Hy] : "", kb(i), Fb(Hy ? ot[Hy] : []), Vb(Hy ? st[Hy] : []), Pz.value = Hy ? String(pz[Hy] || "") : "", 
            Kg.value = Hy ? Xv(lt[Hy]) : "", zg.value = Hy ? Zv(ct[Hy]) : "", Hv(Hy ? ut[Hy] : null), 
            im.value = Hy ? String(nt[Hy] || "") : "", rm.value = Hy ? String(it[Hy] || "") : "", 
            dw(), Wy = Hy ? Yv(dt[Hy]) : [], lm.value = "", ew(), uw(Hy), xb(), Eb(), _b(), 
            Ob(), Yb(), Qb(), rw("profileDetailsNameField", "profileDetailsNameError", !1), 
            rw("profileDetailsGenderField", "profileDetailsGenderError", !1), rw("profileDetailsSexualityField", "profileDetailsSexualityError", !1), 
            rw("profileDetailsAgeField", "profileDetailsAgeError", !1), sm.textContent = "", 
            Uy = ow(), Gy = Yv(Wy), e.byId("saveProfileDetails").textContent = Hy ? "Save changes" : "Create profile", 
            e.byId("profileDetailsLoadersLabel").textContent = Hy ? "Tests and imported values" : "Start with a test or import", 
            mw("about" === n.mode && Hy ? "about" : "edit");
            const a = e.byId("profileIndependentTip"), r = !Hy && Object.keys(vt).filter(e => e !== Et).length >= 1;
            a.hidden = !r || fw, a.hidden || (a.style.display = ""), r && !fw && (fw = !0);
            var o = e.byId("dismissProfileIndependentTip");
            o && !o.dataset.dpiBound && (o.dataset.dpiBound = "1", o.addEventListener("click", yw)), 
            Wi(_g), requestAnimationFrame(() => {
                const t = _g.querySelector(".dialog-body");
                t && (t.scrollTop = 0);
                const i = "about" === gw ? e.byId("profileDialogEdit") : n.focusPhotos ? e.byId("chooseProfilePhotos") : Hg;
                n.focusPhotos && i.scrollIntoView({
                    block: "center"
                }), i.focus({
                    preventScroll: "about" === gw
                });
            });
            return !0;
        }
        function vw(e = null, t = "auto") {
            Xi();
            const typedName = Hg.value.trim().replace(/\s+/g, " "), n = typedName || "Unknown", nameWasBlank = !typedName, i = wb(), a = Tb(), r = zb(), o = Xv(Kg.value), s = Zv(zg.value), l = Hy, c = Yv(Wy), d = l ? av(vpt[l]) : 50, u = readContactBlocks();
            if (Kg.value.trim() && !o) return rw("profileDetailsAgeField", "profileDetailsAgeError", !0, "Enter an age from 18 to 120."), 
            sm.textContent = "Check the age and try again." + (jY ? ` Then your ${jY} opens.` : ""), void (Kg.focus(), jY && sm.scrollIntoView({ block: "nearest" }));
            rw("profileDetailsNameField", "profileDetailsNameError", !1), rw("profileDetailsGenderField", "profileDetailsGenderError", !1), rw("profileDetailsSexualityField", "profileDetailsSexualityError", !1);
            if (sm.textContent = "", u.error) return sm.textContent = u.error + (jY ? ` Then your ${jY} opens.` : ""), void (u.field.focus(), jY && sm.scrollIntoView({ block: "nearest" }));
            const p = u.contact, h = im.value.trim().slice(0, 1500), g = rm.value.trim().slice(0, 1500), m = ek(n), q = Pz.value.trim().slice(0, 60);
            if (!nameWasBlank && m && m !== l) return sm.textContent = `${n} already has a profile.` + (jY ? ` Then your ${jY} opens.` : ""), Hg.focus(), 
            void (Hg.select(), jY && sm.scrollIntoView({ block: "nearest" }));
            const sxEditVy = id => { const b = Vy; Vy = null, jY = null, b && b(id); };
            const f = l && zy && zy.id === l ? zy : null;
            if (zy = null, Ui(_g), queueMicrotask(() => {
                (_g.open || _g.hasAttribute("open")) && Ui(_g);
            }), Hy = null, Wy = [], lm.value = "", Uy = "", Gy = [], l) {
                if (!vt[l]) return;
                const u = wt[l] !== n || JSON.stringify(bb(rt[l])) !== JSON.stringify(i) || JSON.stringify(iv(ot[l])) !== JSON.stringify(a) || JSON.stringify(Gb(st[l])) !== JSON.stringify(r) || Xv(lt[l]) !== o || Zv(ct[l]) !== s || JSON.stringify(Yv(dt[l])) !== JSON.stringify(c) || JSON.stringify(Rv(ut[l])) !== JSON.stringify(p) || String(nt[l] || "") !== h || String(it[l] || "") !== g || av(vpt[l]) !== d || String(pz[l] || "") !== q;
                return wt[l] = n, rt[l] = i, ot[l] = a, st[l] = r, pz[l] = q, lt[l] = o, ct[l] = s, dt[l] = c, 
                ut[l] = p, nt[l] = h, it[l] = g, vpt[l] = d, u && zt(l), hw("save", l), void requestAnimationFrame(() => {
                    Jw(), Mr({
                        animate: !1
                    }), Cn.getBoundingClientRect(), Oc.open && sxPrepScribeDialog(), f ? f.action() : "outline" === e ? Ms(l) : "testchooser" === e ? Qy(l) : e ? Ax(e, t, l) : sxEditVy(l);
                });
            }
            const y = ik(n);
            SX_PROFILE_RECORD_LISTS.forEach(e => e[y] = {}), wt[y] = n, rt[y] = i, ot[y] = a, st[y] = r, pz[y] = q, lt[y] = o, ct[y] = s, 
            dt[y] = c, ut[y] = p, nt[y] = h, it[y] = g, vpt[y] = d, vht[y] = !1, profileUuids[y] = makeProfileUuid(), sampleProfileFlags[y] = !1, zt(y), Lo(y), 
            sxAutoSelect(y), ak(y, {
                blankStart: !0
            }), hw("save", y);
            const b = Vy;
            Vy = null, jY = null, "outline" === e ? Ms(y) : "testchooser" === e ? Qy(y) : e ? Ax(e, t, y) : b && b(y);
        }
        function ww() {
            // Capture the Load menu's origin before kw() clears qy:
            // the origin is carried explicitly into this dialog —
            // a pair origin routes this dialog's file imports into
            // the pair (merge) and its converters onto the pair, any
            // other origin is the converters' target, and no origin
            // (the Add menu's Scan or Import) keeps the ordinary
            // create-a-profile import.
            sxLoadOriginId = qy && vt[qy] ? qy : null, sxPairLoadInto = qy && ft[qy] && "group" === ft[qy].kind ? qy : null, kw(), xw(), Sw(), Ui(kg), Ig(""), Wi(Sg);
        }
        function kw() {
            Oy.hidden = !0, qy = null, tl.querySelectorAll("[data-profile-load],[data-add-profile]").forEach(e => e.setAttribute("aria-expanded", "false"));
        }
        function xw() {
            By.hidden = !0;
            const e = tl.querySelector("[data-add-profile]");
            e && !jy.hidden && e.setAttribute("aria-expanded", "false");
        }
        function Sw() {
            jy.hidden = !0, jy.classList.remove("is-submenu");
            const t = tl.querySelector("[data-add-profile]"), n = e.byId("loadSampleProfileChoice");
            t && t.setAttribute("aria-expanded", String(!By.hidden)), n && n.setAttribute("aria-expanded", "false");
        }
        function $w(e, t) {
            if (e === Oy && innerWidth <= 620) return e.style.removeProperty("left"), void e.style.removeProperty("top");
            const n = t.getBoundingClientRect(), i = e.getBoundingClientRect();
            e.style.left = Math.max(8, Math.min(innerWidth - i.width - 8, n.right - i.width)) + "px", 
            e.style.top = Math.max(8, Math.min(innerHeight - i.height - 8, n.bottom + 7)) + "px";
        }
        function Ew() {
            jy.querySelectorAll("[data-sample-profile]").forEach(e => {
                const t = e.dataset.sampleProfile, n = e.dataset.sampleName, i = Zy[t];
                i && !vt[i] && delete Zy[t];
                const a = Boolean(Zy[t] && vt[Zy[t]] || ek(n) || ek(`${n} (sample)`));
                e.disabled = a, e.setAttribute("aria-disabled", String(a));
                const r = e.querySelector("small");
                r && (r.textContent = a ? "Loaded" : `${e.dataset.sampleCount} rated topics`);
            });
        }
        function Aw() {
            if (!Yy) {
                const e = window.SEXCAPADES_SAMPLE_PROFILES;
                Yy = e && "object" == typeof e ? Promise.resolve(e) : Promise.reject(new Error("The bundled samples could not be opened.")), 
                Yy = Yy.catch(e => {
                    throw Yy = null, e;
                });
            }
            return Yy;
        }
        e.byId("dismissProfileIndependentTip")?.addEventListener("click", yw);
        const Cw = {};
        function Mw(e) {
            if (!Cw[e]) {
                const t = jy.querySelector(`[data-sample-profile="${CSS.escape(e)}"] img`), n = t && (t.currentSrc || t.src);
                Cw[e] = n ? fetch(n).then(e => {
                    if (!e.ok) throw new Error("The bundled sample photo could not be opened.");
                    return e.blob();
                }).then(async e => {
                    const t = await Vu(e), n = await zu(t);
                    return {
                        data: t,
                        width: n.naturalWidth,
                        height: n.naturalHeight,
                        cropX: .5,
                        cropY: .5,
                        cropZoom: 1
                    };
                }).catch(t => {
                    throw delete Cw[e], t;
                }) : Promise.resolve(null);
            }
            return Cw[e];
        }
        function Iw(t = {}) {
            kw();
            const n = tl.querySelector("[data-add-profile]"), i = e.byId("loadSampleProfileChoice");
            if (!n || By.hidden) return;
            Ew(), jy.hidden = !1, jy.classList.add("is-submenu"), n.setAttribute("aria-expanded", "true"), 
            i.setAttribute("aria-expanded", "true");
            const a = i.getBoundingClientRect(), r = jy.offsetWidth, o = jy.offsetHeight;
            let s, l;
            if (innerWidth <= 620) {
                s = Math.max(8, Math.min(innerWidth - r - 8, a.left));
                const e = a.bottom + 6, t = a.top - o - 6;
                l = e + o <= innerHeight - 8 ? e : t >= 8 ? t : Math.max(8, innerHeight - o - 8);
            } else s = Math.max(8, Math.min(innerWidth - r - 8, a.right + 6)), l = Math.max(8, Math.min(innerHeight - o - 8, a.top));
            if (jy.style.left = s + "px", jy.style.top = l + "px", t.focus) {
                const e = jy.querySelector("[data-sample-profile]:not(:disabled)");
                e && e.focus({
                    preventScroll: !0
                });
            }
        }
        function Pw(e) {
            kw(), jy.hidden ? By.hidden ? (By.hidden = !1, e.setAttribute("aria-expanded", "true"), 
            $w(By, e), By.querySelector("button").focus({
                preventScroll: !0
            })) : xw() : Sw();
        }
        function Lw() {
            wf = null, Ui(ym);
        }
        Oy.querySelectorAll("[data-profile-converter]").forEach(e => e.addEventListener("click", () => {
            const sxOrigin = qy && vt[qy] ? qy : null;
            kw(), Ax(e.dataset.profileConverter, e.dataset.converterMode || "auto", sxOrigin);
        })), e.byId("importProfileFromTab") && (e.byId("importProfileFromTab").onclick = ww);
        const Tw = e.byId("newBlankProfile"), Fw = e.byId("newListProfile"), Nw = e.byId("importProfileChoice"), _w = e.byId("loadSampleProfileChoice");
        e.byId("makeOwnMapButton") && e.byId("makeOwnMapButton").addEventListener("click", () => {
            Vy = null, bw(null);
        });
        // Guide center: the unrated map renders Yolanda Biche as a normal profile
        // center node in the map renderer, and tapping it opens the standard
        // profile About dialog via roxyAbout() above (Build 2026-10-16_2206).
        // The old blocking center card was removed.
        (() => {
            const cta = e.byId("firstVisitCta"), dismiss = e.byId("dismissFirstVisitCta"), restore = e.byId("showFirstVisitCta");
            const setDismissed = value => {
                const url = new URL(location.href);
                value ? url.searchParams.set("hide-start-cta", "1") : url.searchParams.delete("hide-start-cta");
                history.replaceState(history.state, "", url.pathname + url.search + url.hash);
                if (cta) cta.hidden = value;
                if (restore) restore.hidden = !value || Boolean(Object.keys(vt).filter(id => Boolean(wt[id])).length);
            };
            dismiss?.addEventListener("click", () => setDismissed(true));
            restore?.addEventListener("click", () => setDismissed(false));
        })();
        Tw.addEventListener("click", () => {
            xw(), Vy = null, bw(null);
        }), Fw.addEventListener("click", () => {
            xw(), Vy = e => Ms(e), bw(null);
        }), Nw.addEventListener("click", ww);
        let Dw = 0;
        const Rw = () => {
            Dw && (t.clear(Dw), Dw = 0);
        }, Ow = () => {
            Rw(), Dw = t.setTimeout(() => {
                By.matches(":hover") || jy.matches(":hover") || Sw();
            }, 180);
        };
        _w.addEventListener("pointerenter", () => {
            Rw(), Iw();
        }), _w.addEventListener("focus", () => Iw()), _w.addEventListener("click", e => {
            e.preventDefault(), Iw({
                focus: !0
            });
        }), By.addEventListener("pointerleave", Ow), By.addEventListener("pointerenter", Rw), 
        jy.addEventListener("pointerleave", Ow), jy.addEventListener("pointerenter", Rw), 
        e.byId("backToProfileAddMenu") && e.byId("backToProfileAddMenu").addEventListener("click", () => {
            Sw(), _w.focus({
                preventScroll: !0
            });
        }), jy.addEventListener("click", async e => {
            const t = __sxClosestAction(e.target, "sampleProfile");
            if (!t || !jy.contains(t) || t.disabled) return;
            const n = t.dataset.sampleProfile, i = t.dataset.sampleName, a = Number(t.dataset.sampleCount), r = t.querySelector("small");
            t.disabled = !0, r && (r.textContent = "Loading…"), Sw(), xw();
            try {
                const [e, t] = await Promise.all([ Aw(), Mw(n) ]), r = e && e[n];
                if (!r || r.name !== i || r.count !== a || !r.payload || !0 !== r.payload.noFlash) throw new Error("The bundled sample is invalid.");
                const o = JSON.parse(JSON.stringify(r.payload));
                o.profileName = i, o.sampleProfile = !0, !t || Array.isArray(o.photos) && o.photos.length || (o.photos = [ t ]);
                const s = wx(o, {
                    autoSelect: !0
                });
                Zy[n] = s, Ew();
            } catch (e) {
                t.disabled = !1, r && (r.textContent = `${a} rated topics`), tS(e.message || "Could not load that sample profile.", {
                    tone: "error",
                    persistent: !0
                });
            }
        }), vm && (vm.onclick = () => {
            const t = wf, n = e.byId("rememberProfileCheckbox2x"), i = window.Sexcapades2xRememberProfiles;
            t && n && n.checked && i && i.saveNow && i.saveNow() ? (wf = null, Ui(ym), nk(t)) : tS("Could not save this profile on this device. Keep it open and try again.", {
                tone: "error",
                persistent: !0
            });
        }), e.byId("discardClosingProfile").onclick = () => {
            const e = wf;
            wf = null, Ui(ym), e && nk(e);
        }, ym.addEventListener("click", e => {
            e.target === ym && Lw();
        }), ym.addEventListener("cancel", Lw), window.__sxOnPtr( e => {
            Oy.hidden || Oy.contains(e.target) || __sxClosestAction(e.target, "profileLoad") || kw(), 
            By.hidden || By.contains(e.target) || __sxClosestAction(e.target, "addProfile") || xw(), 
            jy.hidden || jy.contains(e.target) || __sxClosestAction(e.target, "addProfile") || Sw();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && (Oy.hidden || kw(), By.hidden || xw(), jy.hidden || Sw());
        }), e.byId("closeTestResultLoader").onclick = () => Ui(kg), kg.addEventListener("click", e => {
            e.target === kg && performance.now() - 0 > 500 && Ui(kg);
        }), e.byId("closeProfileDetails").onclick = () => "about" === gw ? Ui(_g) : cw(), 
        _g.addEventListener("cancel", e => {
            e.preventDefault(), "about" === gw ? Ui(_g) : cw();
        }), e.byId("profileDialogEdit").onclick = () => {
            Hy && (mw("edit"), requestAnimationFrame(() => Hg.focus()));
        }, e.byId("keepEditingProfileDetails").onclick = lw, e.byId("discardProfileDetails").onclick = sw, 
        wm.addEventListener("cancel", e => {
            e.preventDefault(), lw();
        }), e.byId("saveProfileDetails").onclick = () => vw(), e.byId("saveActiveProfile").onclick = () => {
            const e = Mt;
            if (!e || !vt[e]) return;
            const t = window.SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x"), n = window.Sexcapades2xRememberProfiles;
            if (t && t.checked && n && "function" == typeof n.saveNow) {
                if (!n.saveNow()) return void tS("Could not save this profile on this device.", {
                    tone: "error",
                    persistent: !0
                });
                Vt(e), tS(`${wt[e]} saved to profile memory.`);
            } else Vt(e), tS(`${wt[e]} saved in this tab.`);
        };
        const Bw = e.byId("appAboutDialog");
        e.byId("openAppAbout") && e.byId("openAppAbout").addEventListener("click", () => {
            (function() {
                const n = Math.round(window.innerWidth), i = Math.round(window.innerHeight), a = Math.round(screen.width || 0), r = Math.round(screen.height || 0), o = window.devicePixelRatio || 1, s = Math.min(n, i) >= 320 && Math.max(n, i) >= 480, l = {
                    pass: s,
                    value: "Viewport " + n + " × " + i + " CSS px · screen " + a + " × " + r + " CSS px · " + o + "× pixel density (" + Math.round(a * o) + " × " + Math.round(r * o) + " device px)",
                    detail: s ? "Meets the 320 × 480 CSS-pixel minimum." : "The usable viewport is below 320 × 480 CSS pixels. Rotate the device, maximize the window, or use a larger screen."
                }, c = function() {
                    const e = navigator.userAgent || "", t = navigator.userAgentData && navigator.userAgentData.brands;
                    if (Array.isArray(t)) {
                        const e = t.find(e => /Microsoft Edge/i.test(e.brand)) || t.find(e => /Google Chrome/i.test(e.brand)) || t.find(e => /Opera/i.test(e.brand)) || t.find(e => /Chromium/i.test(e.brand));
                        if (e) return {
                            key: /Edge/i.test(e.brand) ? "edge" : /Opera/i.test(e.brand) ? "opera" : "chrome",
                            name: "Chromium" === e.brand ? "Chromium" : e.brand,
                            version: e.version,
                            major: parseInt(e.version, 10)
                        };
                    }
                    const n = [ [ "edge", "Microsoft Edge", /(?:EdgA|EdgiOS|Edg)\/([\d.]+)/ ], [ "opera", "Opera", /(?:OPR|Opera)\/([\d.]+)/ ], [ "samsung", "Samsung Internet", /SamsungBrowser\/([\d.]+)/ ], [ "firefox", "Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/ ], [ "chrome", "Google Chrome", /(?:Chrome|CriOS)\/([\d.]+)/ ], [ "safari", "Safari", /Version\/([\d.]+).*Safari/ ] ];
                    for (const [t, i, a] of n) {
                        const n = e.match(a);
                        if (n) return {
                            key: t,
                            name: i,
                            version: n[1],
                            major: parseInt(n[1], 10)
                        };
                    }
                    return {
                        key: "unknown",
                        name: "Unrecognized browser",
                        version: "not reported",
                        major: 0
                    };
                }(), d = {
                    chrome: 90,
                    edge: 90,
                    firefox: 90,
                    safari: 15,
                    opera: 76,
                    samsung: 15
                }[c.key], u = Boolean(d && c.major >= d), p = {
                    pass: u,
                    value: c.name + " " + c.version,
                    detail: u ? "Meets the minimum supported version (" + d + "+)." : d ? "Version " + d + " or newer is required. Update " + c.name + " to use the hypermap reliably." : "This browser could not be verified. Use a current version of Chrome, Edge, Firefox, Safari, Opera, or Samsung Internet."
                }, h = Number(navigator.deviceMemory), g = Number.isFinite(h) && h > 0, m = !g || h >= 2, f = {
                    pass: m,
                    value: g ? h + " GB (browser estimate)" : "Not reported by this browser",
                    detail: g ? m ? "Meets the 2 GB minimum." : "Less than the 2 GB minimum was reported. The hypermap may stutter, reload, or fail to open large profiles." : "The memory API is optional, so its absence does not block the app."
                }, y = navigator.userAgentData && "boolean" == typeof navigator.userAgentData.mobile ? navigator.userAgentData.mobile : /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || ""), b = navigator.maxTouchPoints || 0, v = {
                    screen: l,
                    browser: p,
                    memory: f,
                    device: {
                        pass: !0,
                        value: (y ? "Mobile" : "Desktop") + " · " + (b ? b + " touch point" + (1 === b ? "" : "s") : "no touch input reported"),
                        detail: y ? "The responsive mobile layout is supported." : "The desktop layout is supported."
                    }
                };
                Object.entries(v).forEach(([t, n]) => function(t, n) {
                    const i = e.one('[data-check="' + t + '"]');
                    i && (i.dataset.state = n.pass ? "pass" : "fail", i.querySelector(".system-check-badge").textContent = n.pass ? "PASS" : "FAIL", 
                    i.querySelector("[data-check-value]").textContent = n.value, i.querySelector("[data-check-detail]").textContent = n.detail);
                }(t, n));
                const w = Object.values(v).filter(e => !e.pass).length, k = e.byId("systemCheckSummary");
                k && (k.dataset.state = w ? "fail" : "pass", k.textContent = w ? w + " requirement" + (1 === w ? "" : "s") + " need attention" : "All 4 checks passed");
            })(), Wi(Bw), requestAnimationFrame(() => e.byId("closeAppAbout").focus());
        }), e.byId("closeAppAbout") && e.byId("closeAppAbout").addEventListener("click", () => Ui(Bw)), Bw.addEventListener("click", e => {
            e.target === Bw && Ui(Bw);
        }), e.byId("closeCompletionCelebration") && e.byId("closeCompletionCelebration").addEventListener("click", fs), e.byId("dismissCompletionCelebration") && e.byId("dismissCompletionCelebration").addEventListener("click", fs), 
        completionCompare.addEventListener("click", () => openMilestoneDestination("compare")), completionExport.addEventListener("click", () => openMilestoneDestination("export")), 
        Eg.addEventListener("cancel", e => {
            e.preventDefault(), fs();
        }), closeMilestone.addEventListener("click", closeMilestoneCelebration), milestoneContinue.addEventListener("click", closeMilestoneCelebration), 
        milestoneCompare.addEventListener("click", () => openMilestoneDestination("compare")), milestoneExport.addEventListener("click", () => openMilestoneDestination("export")), milestoneImport.addEventListener("click", () => openMilestoneDestination("import")), milestoneScribe.addEventListener("click", () => openMilestoneDestination("scribe")), 
        milestoneDialog.addEventListener("cancel", e => {
            e.preventDefault(), closeMilestoneCelebration();
        }), milestoneDialog.addEventListener("click", e => {
            e.target === milestoneDialog && closeMilestoneCelebration();
        });
        const jw = e.byId("outlinePayoffDialog");
        function qw(e, t = null) {
            const n = e => !t || t.has(e), i = t ? new Set([ ...t ].map(t => {
                const n = qn[t] || Xn(t) || (at[e] || {})[t];
                return n && n.branch || ci(t);
            }).filter(Boolean)) : null, a = new Set([ ...cn[e] || [] ]), r = new Set([ ...ln[e] || [] ]);
            return Object.keys(vt[e] || {}).forEach(t => {
                if (!n(t) || Eo(e, t)) return;
                a.add(t);
                const i = qn[t] || Xn(t) || (at[e] || {})[t], o = i && i.branch || ci(t);
                o && r.add(o);
            }), {
                branches: [ ...r ].filter(e => !i || i.has(e)),
                nodes: [ ...a ].filter(n),
                newest: [ ...dn[e] || [] ].filter(n)
            };
        }
        function Hw(e) {
            return new Set([ ...Uc(), ...Object.keys(vt[e] || {}), ...Object.keys(Qe[e] || {}), ...Object.keys(Je[e] || {}), ...Object.keys(et[e] || {}), ...Object.keys(tt[e] || {}), ...Object.keys(at[e] || {}), ...Object.values(at[e] || {}).map(e => e && e.parentId).filter(Boolean) ]);
        }
        function Ww(e) {
            const t = Qu(e, Hw(e));
            return gt[e] && Object.keys(gt[e]).length && (t.loaderState = gt[e]), t;
        }
        function Uw(e) {
            return e && "sexcapades" === e.app && (16 === e.version || 17 === e.version) && e.ratings && "object" == typeof e.ratings;
        }
        e.byId("outlinePayoffStory") && e.byId("outlinePayoffStory").addEventListener("click", () => {
            const e = as;
            Ps(), e && vt[e] && Qd([ e ]);
        }), e.byId("outlinePayoffCard") && e.byId("outlinePayoffCard").addEventListener("click", () => {
            const e = as;
            Ps(), e && vt[e] && op(e);
        }), e.byId("outlinePayoffDismiss") && e.byId("outlinePayoffDismiss").addEventListener("click", Ps), jw.addEventListener("cancel", e => {
            e.preventDefault(), Ps();
        }), Hg.addEventListener("input", () => rw("profileDetailsNameField", "profileDetailsNameError", !1)), 
        im.addEventListener("input", dw), rm.addEventListener("input", dw), Wg.addEventListener("change", () => {
            rw("profileDetailsGenderField", "profileDetailsGenderError", !1), wb().length <= 3 && "Choose no more than three genders." === sm.textContent && (sm.textContent = "");
        }), Ug.addEventListener("change", () => rw("profileDetailsSexualityField", "profileDetailsSexualityError", !1)), 
        Kg.addEventListener("input", () => rw("profileDetailsAgeField", "profileDetailsAgeError", !1)), 
        e.byId("chooseProfilePhotos").onclick = () => lm.click(), lm.addEventListener("change", async e => {
            await async function(e) {
                const t = Math.max(0, 8 - Wy.length), n = [ ...e ].slice(0, t);
                if (!n.length) return void (sm.textContent = Wy.length >= 8 ? "A profile can hold up to 8 photos." : "");
                sm.textContent = `Preparing ${n.length} ${1 === n.length ? "photo" : "photos"}…`;
                let i = 0, a = 0;
                for (const t of n) try {
                    const e = await aw(t);
                    Wy.push(e), e.focusStatus && "detected" !== e.focusStatus && a++, i++;
                } catch (e) {
                    sm.textContent = e.message || "A photo could not be prepared.";
                }
                ew(), i && (sm.textContent = a ? `${i} ${1 === i ? "photo" : "photos"} ready. Face auto-center was unavailable or found no face, so ${1 === a ? "the crop starts" : "those crops start"} centered.` : `${i} ${1 === i ? "photo" : "photos"} ready to save.`, 
                Ty(Wy.length - i));
            }(e.target.files || []), e.target.value = "";
        }), cm.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "removePhoto"), n = __sxClosestAction(e.target, "movePhoto"), i = __sxClosestAction(e.target, "adjustPhoto");
            if (t) return Wy.splice(Number(t.dataset.removePhoto), 1), ew(), void (sm.textContent = "Photo removed. Save changes to keep this update.");
            if (n) {
                const e = Number(n.dataset.movePhoto), t = e + Number(n.dataset.photoStep);
                if (e >= 0 && t >= 0 && e < Wy.length && t < Wy.length) {
                    const [n] = Wy.splice(e, 1);
                    Wy.splice(t, 0, n), ew(), sm.textContent = `Photo moved to position ${t + 1}. The first photo is used in the center node.`;
                }
                return;
            }
            i && Ty(Number(i.dataset.adjustPhoto));
        }), e.all("[data-get-ratings-list]").forEach(e => e.addEventListener("click", () => {
            sxOutlineSortMode = "popularity";
        })), e.all("[data-profile-details-converter]").forEach(n => n.addEventListener("click", () => {
            const kind = n.dataset.profileDetailsConverter, mode = n.dataset.converterMode || "auto";
            jY = ({ outline: "Popularity list", kinktest: "KinkTest import", bdsmtest: "BDSMtest import", checklist: "Yes/No/Maybe checklist", fetlife: "FetLife import" })[kind] || "import", Vy = id => "outline" === kind ? Ms(id) : Ax(kind, mode, id), vw();
        })), Hg.addEventListener("keydown", e => {
            "Enter" === e.key && (e.preventDefault(), vw());
        }), e.byId("closeProfileImport") && (e.byId("closeProfileImport").onclick = () => Ui(Sg)), Sg.addEventListener("click", e => {
            e.target === Sg && Ui(Sg);
        }), e.all("[data-import-converter]").forEach(e => e.addEventListener("click", () => {
            const t = e.dataset.importConverter, sxOrigin = sxLoadOriginId && vt[sxLoadOriginId] ? sxLoadOriginId : null;
            Ui(Sg);
            const n = e.dataset.converterMode || "auto";
            // Caller-tab routing keys ONLY on a recorded origin
            // (sxLoadOriginId, from a tab's Load menu). Mere
            // active-profile presence is never a target here: a
            // first import started from this dialog while a profile
            // is active must still reach the load-into chooser, not
            // land silently in the active profile (2026-10-30 ruling,
            // first-import prompt rule).
            sxOrigin ? Ax(t, n, sxOrigin) : Mt && vt[Mt] ? Ax(t, n) : (bw(null), Vy = id => Ax(t, n, id));
        }));
        // FROZEN LEGACY TABLE (Kw): old topic-slug spellings -> current
        // generated slugs, merged over the auto-generated slug->id map when
        // old profile files are imported. It covers only spellings that
        // shipped before profiles began traveling by topic ID (slug-gap
        // fix, 2026-10-22). It is a closed set — never extend it for
        // post-fix files — and it retires at v4.0.
        const Gw = "topic-impact-pain-body-modification-whipping", Kw = Object.freeze({
            [Gw]: "topic-impact-pain-body-modification-whips",
            "topic-impact-pain-body-modification-canes": "topic-impact-pain-body-modification-caning",
            "topic-clothing-materials-objects-diaper": "topic-clothing-materials-objects-diapers",
            "topic-fantasy-transformation-genderplay": "topic-fantasy-transformation-gender-play",
            "topic-roleplay-identity-doctor-nurse-roleplay": "topic-roleplay-identity-doctor-nurse",
            "topic-impact-pain-body-modification-clamps-and-clips": "topic-impact-pain-body-modification-clamps",
            "topic-clothing-materials-objects-spandex": "topic-clothing-materials-objects-lycra-spandex",
            "topic-bondage-restriction-suspension": "topic-bondage-restriction-suspension-bondage",
            "topic-primal-pursuit-predator-prey": "topic-primal-pursuit-hunter-prey",
            "topic-impact-pain-body-modification-scratch-bite-play": "topic-primal-pursuit-biting-scratching",
            "topic-sensation-atmosphere-wax": "topic-sensation-atmosphere-wax-temperature",
            "topic-sensation-atmosphere-electro-sensation": "topic-sensation-atmosphere-electrical-play",
            "topic-impact-pain-body-modification-artistic-cutting": "topic-impact-pain-body-modification-cutting",
            "topic-impact-pain-body-modification-decorative-cutting": "topic-impact-pain-body-modification-cutting",
            "topic-impact-pain-body-modification-needles-piercing": "topic-impact-pain-body-modification-needle-play",
            "topic-impact-pain-body-modification-play-piercing": "topic-impact-pain-body-modification-needle-play",
            "topic-impact-pain-body-modification-piercings": "topic-impact-pain-body-modification-needle-play",
            "topic-bondage-restriction-japanese-bondage": "topic-bondage-restriction-rope-bondage",
            "topic-bondage-restriction-hojojutsu": "topic-bondage-restriction-rope-bondage",
            "topic-bondage-restriction-hemp-rope": "topic-bondage-restriction-rope-bondage",
            "topic-bondage-restriction-decorative-rope": "topic-bondage-restriction-rope-bondage",
            "topic-clothing-materials-objects-corsetry": "topic-clothing-materials-objects-corsets",
            "topic-clothing-materials-objects-corset-training": "topic-clothing-materials-objects-corsets",
            "topic-clothing-materials-objects-corset-cinching": "topic-clothing-materials-objects-corsets",
            "topic-body-focus-appearance-tattoos": "topic-body-focus-appearance-body-modification",
            "topic-body-focus-appearance-tattoo-body-modification-focus": "topic-body-focus-appearance-body-modification",
            "topic-service-ritual-sex-magick": "topic-service-ritual-spiritual-play",
            "topic-service-ritual-sacred-sexuality": "topic-service-ritual-spiritual-play",
            "topic-service-ritual-spiritual-bdsm": "topic-service-ritual-spiritual-play",
            "topic-watching-exposure-settings-victorian-pornography": "topic-watching-exposure-settings-vintage-porn",
            "topic-sensation-atmosphere-cigars": "topic-sensation-atmosphere-smoking",
            "topic-sex-acts-douching": "topic-fluids-messy-play-douching",
            "topic-sex-acts-vaginal-fisting": "topic-sex-acts-fisting",
            "topic-sex-acts-tearing-off-clothing": "topic-psychological-dynamics-tearing-off-clothing",
            "topic-body-focus-appearance-foot-massage": "topic-service-ritual-foot-massage",
            "topic-body-focus-appearance-depilation-shaving": "topic-body-focus-appearance-depilation",
            "topic-sensation-atmosphere-liquor": "topic-fluids-messy-play-liquor",
            "topic-clothing-materials-objects-panty-sniffing": "topic-sensation-atmosphere-panty-sniffing",
            "topic-clothing-materials-objects-food-messy-play": "topic-fluids-messy-play-chocolate",
            "topic-clothing-materials-objects-showerheads": "topic-bondage-restriction-waterbondage",
            "topic-bondage-restriction-tape-wrapping": "topic-bondage-restriction-tape",
            "topic-roleplay-identity-doctor-nurse-play": "topic-roleplay-identity-doctor-nurse",
            "topic-body-focus-appearance-toes-and-feet": "topic-body-focus-appearance-toes",
            "topic-bondage-restriction-blindfolded-restraint": "topic-bondage-restriction-blindfold",
            "topic-bondage-restriction-caging-confinement": "topic-bondage-restriction-caging",
            "topic-bondage-restriction-crucifixion-play": "topic-bondage-restriction-crucifixion",
            "topic-bondage-restriction-cuffs-straps": "topic-bondage-restriction-cuffs",
            "topic-bondage-restriction-encasement-fetish": "topic-bondage-restriction-encasement",
            "topic-bondage-restriction-furniture-restraint": "topic-bondage-restriction-furniture",
            "topic-bondage-restriction-medieval-devices": "topic-bondage-restriction-medieval",
            "topic-bondage-restriction-spreaders-bars": "topic-bondage-restriction-spreaders",
            "topic-impact-pain-body-modification-sadism": "topic-psychological-dynamics-sadism",
            "topic-partner-configurations-gangbang-fantasy": "topic-partner-configurations-gangbang",
            "topic-psychological-dynamics-hypnosis-mind-control-fantasy": "topic-psychological-dynamics-hypnosis",
            "topic-psychological-dynamics-praise-in-scene": "topic-psychological-dynamics-praise",
            "topic-psychological-dynamics-small-penis-humiliation": "topic-psychological-dynamics-sph-humiliation",
            "topic-roleplay-identity-1950s-household": "topic-roleplay-identity-1950s",
            "topic-roleplay-identity-age-play-between-adults": "topic-roleplay-identity-age-play",
            "topic-roleplay-identity-captivity-kidnapping": "topic-roleplay-identity-kidnapping",
            "topic-roleplay-identity-caregiver-roles-adults": "topic-roleplay-identity-caregiver",
            "topic-roleplay-identity-consensual-non-consent-fantasy": "topic-roleplay-identity-cnc-fantasy",
            "topic-roleplay-identity-damsels-in-distress": "topic-roleplay-identity-damsels",
            "topic-roleplay-identity-historical-fantasy": "topic-roleplay-identity-historical",
            "topic-roleplay-identity-medical-play": "topic-roleplay-identity-medical",
            "topic-roleplay-identity-pet-play": "topic-roleplay-identity-pet",
            "topic-roleplay-identity-piggy-play": "topic-roleplay-identity-piggy",
            "topic-roleplay-identity-pony-play": "topic-roleplay-identity-pony",
            "topic-roleplay-identity-puppy-play": "topic-roleplay-identity-puppy",
            "topic-roleplay-identity-sister-brother-roleplay": "topic-roleplay-identity-siblings",
            "topic-roleplay-identity-teacher-student-roleplay": "topic-roleplay-identity-teacher-student",
            "topic-roleplay-identity-vampires-gothic": "topic-roleplay-identity-vampires",
            "topic-roleplay-identity-victorian-lifestyles": "topic-roleplay-identity-victorian",
            "topic-sex-acts-anal-training": "topic-sex-acts-training",
            "topic-sex-acts-fingering-mouths": "topic-sex-acts-mouth-fingering",
            "topic-sex-acts-fucking-machines": "topic-sex-acts-machines",
            "topic-sex-acts-urethral-fucking": "topic-sex-acts-urethral",
            "topic-sex-acts-vacuum-pumping": "topic-sex-acts-pumping",
            "topic-sex-acts-vaginal-stretching": "topic-sex-acts-stretching",
            "topic-body-focus-appearance-feet-footwear": "topic-body-focus-appearance-feet"
        }), zw = Object.freeze(Object.fromEntries(h.flatMap(e => e.topics.map(t => [ Kn(e.name, sxName(t)), Wn(t) ])))), Vw = Object.freeze(Object.assign({}, zw, Object.fromEntries(Object.entries(Kw).map(([e, t]) => [ e, zw[t] || t ]))));
        // BURIAL REGISTRY (E4b, slug-gap design-away, 2026-10-22): when
        // the owner rules a topic DELETED from the taxonomy (rather than
        // renamed, split, or merged), its canonical id is entered here
        // at the moment of the ruling, with a one-line reason. Ingest
        // then reports that id's entries as deliberately retired: they
        // are never stored in ratings or side maps, never parked on
        // profile.droppedKeys, and never shown in On Deck. Only
        // canonical ids (t####) belong in this registry — a slug
        // spelling of a deleted topic is not buried; it parks like any
        // other unrecognized spelling.
        const BURIED_TOPIC_IDS = Object.freeze({
            t0001: "Direction (topic deleted)"
        });
        // Explicit ingest resolution order (E4b): a single incoming key
        // resolves through exactly these stages, in this order —
        // (1) a canonical topic id present in the catalog resolves from
        // the catalog alone and never consults any table; (2) the
        // generated slug for a current topic; (3) the FROZEN LEGACY
        // TABLE (Kw), whose target is a generated slug (resolved
        // through zw) or, defensively, a canonical id; (4) no
        // resolution — the caller parks the key. Burial is checked
        // between (1) and (2): a buried id is canonical in form but
        // absent from the catalog, and only a literal canonical id can
        // match the registry, so slug spellings never reach it. This
        // order is what lets a post-fix file load by ID with the rename
        // table bypassed entirely.
        function resolveIngestKey(key) {
            if ("string" != typeof key || !key) return null;
            if (topicLabelById[key]) return {
                id: key,
                via: "id"
            };
            if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, key)) return {
                id: key,
                via: "buried"
            };
            if (zw[key]) return {
                id: zw[key],
                via: "slug"
            };
            if (Object.prototype.hasOwnProperty.call(Kw, key)) {
                const target = Kw[key];
                if (zw[target]) return {
                    id: zw[target],
                    via: "legacy"
                };
                if (topicLabelById[target]) return {
                    id: target,
                    via: "legacy"
                };
                return null;
            }
            return null;
        }
        function Yw(e) {
            if (!e || "object" != typeof e) return e;
            // SUNSET (slug-gap design-away, 2026-10-22): this is the
            // legacy slug-resolution path — incoming keys are rewritten
            // through Vw, the generated slug->id map merged with the
            // FROZEN LEGACY TABLE (Kw). The frozen legacy rename table
            // and this slug-spelling resolution fallback retire at v4.0:
            // post-fix files travel by topic ID and never consult them.
            // They remain only so pre-fix slug-keyed files resolve one
            // last time, after which the profile re-saves by ID.
            // E4b: the rewrite map is built in the explicit resolution
            // order of resolveIngestKey — generated slugs (stage 2) are
            // entered first and a frozen legacy entry (stage 3) can
            // never shadow one. Canonical topic ids (stage 1) are not
            // keys of this map at all: they resolve from the catalog
            // alone and pass through here untouched, and buried ids are
            // likewise left for rk to report as retired.
            const t = {};
            Object.entries(zw).forEach(([k, v]) => {
                t[k] = v;
            }), Object.entries(Kw).forEach(([k, v]) => {
                Object.prototype.hasOwnProperty.call(t, k) || (t[k] = zw[v] || v);
            });
            Object.entries(LEGACY_NODE_IDS).forEach(([k, v]) => {
                Object.prototype.hasOwnProperty.call(t, k) || (t[k] = v);
            });
            if (e.importedChildren && "object" == typeof e.importedChildren) {
                const n = {};
                Object.entries(e.importedChildren).forEach(([e, i]) => {
                    if (!i || "object" != typeof i) return;
                    const a = (resolveIngestKey(i.parentId) || {}).id || t[i.parentId] || i.parentId, r = ni(i.label), o = a && r ? "subtopic-" + Hn(a) + "-" + Hn(r) : e;
                    e !== o && (t[e] = o), i.id && i.id !== o && (t[i.id] = o), n[o] = Object.assign({}, i, {
                        id: o,
                        parentId: a
                    });
                }), e.importedChildren = n;
            }
            const n = (e, t) => {
                if (void 0 === t) return e;
                // LIMITS COMPLETENESS (repair): when two stored keys canonicalize
                // to the same topic, the merged rating keeps the MOST RESTRICTIVE
                // (lowest) value per direction. The old max-merge silently erased
                // a stated deep-red at import time — e.g. a payload carrying both
                // "topic-sex-acts-vaginal-fisting" (-100/-90) and a milder duplicate
                // key for the same topic stored only the mild value, so the topic
                // never reached the checklist's red list.
                const i = e => {
                    if ("object" != typeof e && Number.isFinite(Number(e))) return {
                        give: Number(e),
                        receive: Number(e)
                    };
                    if (!e || "object" != typeof e) return null;
                    const t = {};
                    return [ "give", "receive" ].forEach(n => {
                        Object.prototype.hasOwnProperty.call(e, n) && Number.isFinite(Number(e[n])) && (t[n] = Number(e[n]));
                    }), Object.keys(t).length ? t : null;
                }, a = i(e), r = i(t);
                if (!a) return t;
                if (!r) return e;
                if ("object" != typeof e && "object" != typeof t) return Math.min(Number(e), Number(t));
                const o = {};
                return [ "give", "receive" ].forEach(e => {
                    const t = [ a[e], r[e] ].filter(Number.isFinite);
                    t.length && (o[e] = Math.min(...t));
                }), Object.keys(o).length ? o : t;
            };
            return Object.entries(t).forEach(([t, i]) => {
                const a = (e, n = null) => {
                    if (!e || "object" != typeof e || !Object.prototype.hasOwnProperty.call(e, t)) return;
                    const a = e[t], r = e[i];
                    e[i] = n ? n(a, r) : void 0 === r ? a : r, delete e[t];
                };
                if (a(e.ratings, n), a(e.ratingSources, (e, t) => void 0 === t ? e : Object.assign({}, e, t)), 
                a(e.annotations), a(e.fantasyOnly), a(e.alreadyTried), e.notes && "object" == typeof e.notes && Object.prototype.hasOwnProperty.call(e.notes, t)) {
                    const n = Array.isArray(e.notes[t]) ? e.notes[t] : [], a = Array.isArray(e.notes[i]) ? e.notes[i] : [];
                    e.notes[i] = [ ...new Set([ ...a, ...n ]) ], delete e.notes[t];
                }
                e.importAttention && "object" == typeof e.importAttention && [ "nodes", "newest" ].forEach(n => {
                    Array.isArray(e.importAttention[n]) && (e.importAttention[n] = [ ...new Set(e.importAttention[n].map(e => e === t ? i : e)) ]);
                }), e.lists && "object" == typeof e.lists && Object.keys(e.lists).forEach(n => {
                    Array.isArray(e.lists[n]) && (e.lists[n] = [ ...new Set(e.lists[n].map(e => e === t ? i : e)) ]);
                });
            }), e;
        }
        let Xw = null;
        function Zw(e, t, n) {
            return `<span class="profile-tab is-editing"><input class="profile-name-input" data-profile-name-input type="text" maxlength="40" autocomplete="off" value="${Hi(t)}" placeholder="Profile name" aria-label="${Hi(n)}"></span>`;
        }
        function sxNormalizePairName(e) {
            // Pair-name normalization (2026-10-27): group records
            // minted before the pair glyphs were split carry the old
            // circle-cross joiner in their stored name. A bowtie
            // group's ⊗ becomes ⋈; a straight group's becomes ⊙.
            // Only group records are touched — a non-group profile's
            // name is never rewritten, whatever it contains. Jw runs
            // on every load and activation, so a legacy name is
            // corrected the first time its tab renders, and zt marks
            // the correction for the persist path like any edit.
            const rec = ft[e];
            if (!rec || "group" !== rec.kind || !wt[e] || !String(wt[e]).includes("⊗")) return;
            wt[e] = String(wt[e]).split("⊗").join("straight" === rec.pairOp ? "⊙" : "⋈"), zt(e);
        }
        // Duplicate tab labels (owner ruling, 2026-10-27): same-name
        // tabs are told apart by a dash-plus-number suffix on the TAB
        // LABEL ONLY, counting from 2 — the first tab keeps the plain
        // label, the next gets "-2", then "-3", and so on. Profile
        // names (wt) stay clean; identity and selection ride the
        // internal profile ids (data-view), never the label. Jw resets
        // the counter at the start of every tab-strip render and the
        // strip renders profiles in vt key order, so the numbering is
        // stable across renders.
        let sxTabLabelSeen = {};
        function sxDupTabLabel(e, label) {
            const nm = wt[e];
            return sxTabLabelSeen[nm] = (sxTabLabelSeen[nm] || 0) + 1, sxTabLabelSeen[nm] > 1 ? `${label}-${sxTabLabelSeen[nm]}` : label;
        }
        function Jw() {
            sxTabLabelSeen = {};
            const t = Object.keys(vt).filter(e => Boolean(wt[e]));
            Mt && !vt[Mt] && (Mt = null), It && !vt[It] && (It = null), document.documentElement.style.setProperty("--active-profile-color", Mt && vt[Mt] ? la(Mt) : "var(--focus)");
            const i = Yi(), r = Boolean(Kd()), o = i.length > 1, s = an && o, l = o || r, c = s || r, d = t.map(e => {
                sxNormalizePairName(e);
                if (Xw && Xw.id === e) return sxDupTabLabel(e, wt[e]), Zw(0, wt[e], `Rename ${wt[e]}`);
                const t = i.includes(e), n = la(e), o = sxDupTabLabel(e, "group" === ft[e]?.kind ? wt[e] : Ji(wt[e])), s = Mt === e, l = Boolean(ft[e]), c = av(vpt[e]), d = Boolean(vht[e]), u = zi(2 * (c - 50)), h = yt[e] ? '<sup class="profile-tab-dirty" aria-hidden="true">*</sup>' : "", g = `<button type="button" class="profile-tab-veil${d ? " is-enabled" : ""}" data-profile-veil="${Hi(e)}" aria-controls="veilPopover" aria-expanded="false" aria-pressed="${d}" aria-label="${Hi(wt[e])} Veil ${d ? "on" : "off"}, level ${c}. Open Veil settings." title="Veil ${d ? "on" : "off"} · ${c}" style="--veil-color:${u}"><svg viewBox="0 0 24 16" aria-hidden="true" focusable="false"><path class="veil-icon-cloth" d="M12 2.4C9.1 2.4 6.7 2.9 4.9 3.8C5.4 7 5.2 10.2 3.5 13.6C5.4 12.6 7.2 12.3 9 13.4C10 12.6 11 12 12 11.7C13 12 14 12.6 15 13.4C16.8 12.3 18.6 12.6 20.5 13.6C18.8 10.2 18.6 7 19.1 3.8C17.3 2.9 14.9 2.4 12 2.4Z"/><path class="veil-icon-fold" d="M8.2 3.9C8.5 6.8 8.4 9.7 7.5 12.6M15.8 3.9C15.5 6.8 15.6 9.7 16.5 12.6M12 4.2V11.4"/></svg></button>`, heatBtn = `<button type="button" class="profile-tab-heat" data-profile-heat="${Hi(e)}" aria-controls="heatPopover" aria-expanded="false" aria-label="${Hi(wt[e])} ${l ? "Group Heat" : "Heat"} ${Hi(sxHeatZone(sxHeatDisplayFor(e)))}. Open Heat settings." title="${l ? "Group Heat" : "Heat"} · ${Hi(sxHeatZone(sxHeatDisplayFor(e)))}"><svg aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path fill="currentColor" d="M8 14c-4-2-4-6-1-9 0 3 2 2 2-3 4 4 5 8-1 12Zm0 0c-2-1-2-3 0-5 2 2 2 4 0 5"/></svg><span class="sx-heat-zone">${Hi(sxHeatZone(sxHeatDisplayFor(e)))}</span></button>`, loadBtn = `<button type="button" class="profile-tab-load" data-profile-load="${Hi(e)}" aria-haspopup="menu" aria-expanded="false" aria-label="Load or import data for ${Hi(wt[e])}" title="Load or import data for ${Hi(wt[e])}" data-ui-tooltip="Take a test or import profile data." data-tooltip-tap-first><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v10"/><path d="m7 9 5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg></button>`;
                return `<span class="profile-tab" style="--profile-color:${n}"><button type="button" class="profile-tab-save" data-save-profile="${Hi(e)}" aria-label="Export ${Hi(wt[e])}" data-ui-tooltip="Export this profile map." data-tooltip-tap-first><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 6.5 10 4h4l1.5 2.5H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3.5Z"/><circle cx="12" cy="13" r="3.5"/></svg></button>${g}${heatBtn}${loadBtn}<button type="button" role="tab" data-view="${Hi(e)}" class="profile-tab-button has-profile-color ${s ? "is-active " : ""}${t ? "is-selected is-multiselected " : ""}${d ? "has-veil" : ""}" style="--profile-color:${n};--veil-color:${u}" aria-selected="${s}" aria-pressed="${s}" data-ui-tooltip="Switch to this profile. Ctrl+click (Cmd+click on Mac) adds it to the group comparison." data-tooltip-name="${Hi(o)}" aria-label="${Hi(o)} profile, ${Hi(Qv(e))}${yt[e] ? ", unsaved changes" : ""}${t ? ", selected for grouping" : ""}${d ? `, Veil on at ${c}` : ""}"><span data-profile-label data-full-label="${Hi(o)}">${Hi(o)}</span>${h}</button><button type="button" class="profile-tab-close" data-close-profile="${Hi(e)}" aria-label="Close ${Hi(wt[e])} profile">×</button></span>`;
            }), u = Xw && null === Xw.id ? Zw(0, "", "Name new profile") : "", p = `<span class="profile-add-stack"><button type="button" class="profile-add" data-add-profile aria-label="Add or import a profile" aria-haspopup="menu" aria-expanded="false" title="Add or import a profile">+</button>${sxMatchIconsHtml()}</span>`, h = d.pop() || "", g = e.byId("profileTabs"); const sxMtHtml = sxMatchTabsHtml();
            g.classList.remove("is-empty"), e.one(".toolbar").classList.toggle("has-no-profiles", !t.length);
            const m = e.byId("firstVisitCta"), fvcDismissed = new URLSearchParams(location.search).get("hide-start-cta") === "1", fvcRestore = e.byId("showFirstVisitCta");
            m && (m.hidden = Boolean(t.length) || fvcDismissed), fvcRestore && (fvcRestore.hidden = Boolean(t.length) || !fvcDismissed), t.length ? n(g, d.join("") + (h ? `<span class="profile-tab-tail">${h}${p}</span>` : u + p) + (h ? u : "") + sxMtHtml) : n(g, u + p + sxMtHtml), 
            !dv.hidden && Qt && (bv = wv(Qt) || sv), Mv(), dv.hidden || Av(!0), gl();
            const f = e.byId("scribeTab"), activeActions = e.byId("activeProfileActions");
            activeActions && (activeActions.hidden = !Mt || !vt[Mt]), f.hidden = !(t.length || document.querySelector(".profile-tab-button")), f.textContent = "Scribe";
            const y = e.byId("openOpener"), b = e.byId("openNegotiation");
            y.hidden = _g && _g.open ? !(Hy && vt[Hy] && !ft[Hy]) : !Mt || !vt[Mt] || Boolean(ft[Mt]), b.hidden = !(i.length >= 2 || r && (ft[Mt]?.sourceIds || []).length >= 2);
            const k = e.byId("overlayTab");
            k.hidden = !s, k.textContent = "Hide group overlay", k.title = "Hide the selected profiles’ comparison overlay", 
            k.setAttribute("aria-pressed", String(an));
            const x = e.byId("overlayStatus");
            x.textContent = "", x.parentElement.hidden = !0, e.one(".filters").hidden = !t.length,
            Da(), e.one(".scribe-separator").hidden = !t.length, e.one(".actions-separator").hidden = !t.length, 
            Vd(), e.byId("newBlankProfile") && (e.byId("newBlankProfile").hidden = !1), Ew();
        }
        function ek(e) {
            return Object.keys(wt).find(t => wt[t].toLocaleLowerCase() === e.toLocaleLowerCase()) || null;
        }
        function tk() {
            if (!Xw) return;
            const e = tl.querySelector("[data-profile-name-input]"), t = Xw.id, n = (e ? e.value : "").trim().replace(/\s+/g, " ");
            if (!n) return Xw = null, void Jw();
            const i = ek(n);
            if (i && i !== t) return tS(`${n} already has a profile`, {
                tone: "error",
                persistent: !0
            }), void function(e = !1) {
                requestAnimationFrame(() => {
                    const t = tl.querySelector("[data-profile-name-input]");
                    t && (t.focus(), e && t.select());
                });
            }(!0);
            if (Xw = null, null !== t) {
                if (!vt[t]) return Jw();
                const e = wt[t];
                return wt[t] = n, e !== n && zt(t), Jw(), Mr(), void (e !== n && tS(`${e} renamed ${n}`));
            }
            bw(null);
        }
        function nk(e) {
            eS();
            const t = Object.keys(vt);
            if (!vt[e]) return void Jw();
            const n = Mt === e, i = t.indexOf(e);
            Xw && Xw.id === e && (Xw = null), 
            // F1: close deletes EVERY list on the canonical list (this
            // now includes the uuid list, profileUuids). The deletes
            // after the loop are close-path extras, not profile-record
            // fields: the import path's dropped-key records, and the
            // attention/save-state lists (ln, pn, hn).
            SX_PROFILE_FIELDS.forEach(t => Reflect.deleteProperty(t, e)), delete droppedKeyRecords[e], 
            delete ln[e], delete pn[e], delete hn[e], Qt === e && Cv(), sxHeatQt === e && sxCvHeat(), sxSel(e, "remove"), fh === e && (fh = null);
            const rememberProfiles = window.Sexcapades2xRememberProfiles;
            rememberProfiles && rememberProfiles.isEnabled && rememberProfiles.isEnabled() && rememberProfiles.saveNow();
            const a = Object.keys(wt).filter(e => Boolean(vt[e]));
            if (n && a.length) return Js(a[Math.min(Math.max(0, i), a.length - 1)]), void Ih();
            n ? (Mt = null, It = null, Nt = null, Lt = null, kn = !0, xn = null, Sn = "all", 
            rn.clear(), on.clear(), h.forEach(e => {
                rn.add(e.name), un.set(catId(e.name), "all"), (e.subcategories || []).forEach(t => {
                    const s = Un(e.name, t.name);
                    un.set(s, "all"), on.add(s);
                }), e.topics.forEach(e => {
                    un.set(Wn(e), "all"), on.add(Wn(e));
                });
            }), Ct = !1) : It === e && (It = Mt), Jw(), Mr(), Ih();
        }
        function ik(e) {
            const t = "profile-" + (Hn(e) || "untitled");
            let n = t, i = 2;
            for (;vt[n]; ) n = t + "-" + i++;
            return n;
        }
        function ak(e, t = {}) {
            Xw = null, Js(e, t);
        }
        // E3 (slug-gap build): post-import result dialog — the loud surface
        // for the loud-drop rule (assessment §9 L1+L2). States how many
        // ratings were imported and, only when profile.droppedKeys is
        // non-empty, names every dropped entry. Dismissible; the imported
        // profile is fully usable whether or not the dialog is open.
        // E4a: the topicNames carried by the file currently being
        // imported (null when the file does not describe itself). When
        // a best-guess label is needed for a dropped entry from that
        // file, the file's own label wins over the slug-tail guess —
        // the sender's meanings, not a reconstruction from the key.
        let importTopicNames = null;
        function importDroppedGuess(key) {
            if (importTopicNames) {
                const own = importTopicNames[key], resolved = Vw[key] && importTopicNames[Vw[key]];
                if ("string" == typeof own && own) return own;
                if ("string" == typeof resolved && resolved) return resolved;
            }
            const parts = String(key).replace(/^topic-/, "").split("-").filter(Boolean), tail = parts.length > 2 ? parts.slice(2) : parts;
            return tail.join(" ") || String(key);
        }
        function importDroppedLine(rec) {
            let line = "retired" === rec.kind ? `${rec.key} — a retired topic` : "trimmed" === rec.kind ? `${rec.key} — a note over 64 characters, trimmed to fit` : "value" === rec.kind ? `${rec.key} — ${"notes" === rec.section ? "notes past the limit of 16 per topic" : "a value that isn't allowed"}` : `${rec.key} — best guess: “${importDroppedGuess(rec.key)}”`;
            if (rec.section && "ratings" !== rec.section) {
                const sectionNames = {
                    annotations: "annotations",
                    fantasyOnly: "fantasy-only list",
                    alreadyTried: "already-tried list",
                    ratingSources: "rating sources",
                    notes: "notes",
                    importAttention: "import attention"
                };
                line += ` (from ${sectionNames[rec.section] || rec.section})`;
            }
            return line;
        }
        function showImportResultDialog(name, ratingCount, dropped, retired) {
            const dlg = e.byId("importResultDialog"), summary = e.byId("importResultSummary"), box = e.byId("importResultDropped"), heading = e.byId("importResultDroppedHeading"), list = e.byId("importResultDroppedList");
            if (!dlg || !summary) return;
            summary.textContent = `${name} was imported with ${ratingCount} ${1 === ratingCount ? "rating" : "ratings"}.`;
            if (box && heading && list) {
                list.textContent = "";
                const entries = Array.isArray(dropped) ? dropped : [];
                entries.length ? (heading.textContent = `${entries.length} ${1 === entries.length ? "entry was" : "entries were"} not imported because their topic keys match no current topic, or their values are not allowed:`, 
                entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = importDroppedLine(rec), list.append(li);
                }), box.hidden = !1) : (heading.textContent = "", box.hidden = !0);
            }
            // E4b: entries whose canonical id sits in the burial
            // registry were retired by ruling — an additional line of
            // their own, never part of the dropped list above and never
            // parked on the profile.
            const rBox = e.byId("importResultRetired"), rHeading = e.byId("importResultRetiredHeading"), rList = e.byId("importResultRetiredList");
            if (rBox && rHeading && rList) {
                rList.textContent = "";
                const rEntries = Array.isArray(retired) ? retired : [];
                rEntries.length ? (rHeading.textContent = `${rEntries.length} ${1 === rEntries.length ? "entry was" : "entries were"} retired by ruling and ${1 === rEntries.length ? "was" : "were"} not imported:`, 
                rEntries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = `${rec.key} — ${BURIED_TOPIC_IDS[rec.key] || "Direction (topic deleted)"}`, rList.append(li);
                }), rBox.hidden = !1) : (rHeading.textContent = "", rBox.hidden = !0);
            }
            const uBox0 = e.byId("importResultUnmatched"), nBox0 = e.byId("importResultNotApplied");
            uBox0 && (uBox0.hidden = !0), nBox0 && (nBox0.hidden = !0);
            const closeBtn = e.byId("closeImportResult"), okBtn = e.byId("dismissImportResult");
            closeBtn && (closeBtn.onclick = () => Ui(dlg)), okBtn && (okBtn.onclick = () => Ui(dlg)), Wi(dlg);
        }
        function showConverterResultDialog(name, ratingCount, unmatched, notApplied, dropped, sourceLabel) {
            const dlg = e.byId("importResultDialog"), summary = e.byId("importResultSummary");
            if (!dlg || !summary) return;
            summary.textContent = `${name} was loaded with ${ratingCount} ${1 === ratingCount ? "rating" : "ratings"} from ${sourceLabel || "FetLife"}.`;
            const rBox = e.byId("importResultRetired");
            rBox && (rBox.hidden = !0);
            // Importer rework Part A (R1 STRICT): strict-ingestion drops
            // from ANY converter feed are named here, in the same dropped
            // list the profile-file import dialog uses — not just FetLife
            // unmatched fetishes.
            const dBox = e.byId("importResultDropped"), dHeading = e.byId("importResultDroppedHeading"), dList = e.byId("importResultDroppedList");
            if (dBox && dHeading && dList) {
                dList.textContent = "";
                const entries = Array.isArray(dropped) ? dropped : [];
                entries.length ? (dHeading.textContent = `${entries.length} ${1 === entries.length ? "entry was" : "entries were"} not loaded because their topic keys match no current topic, or their values are not allowed:`, entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = importDroppedLine(rec), dList.append(li);
                }), dBox.hidden = !1) : (dHeading.textContent = "", dBox.hidden = !0);
            }
            const uBox = e.byId("importResultUnmatched"), uHeading = e.byId("importResultUnmatchedHeading"), uList = e.byId("importResultUnmatchedList");
            if (uBox && uHeading && uList) {
                uList.textContent = "";
                const entries = Array.isArray(unmatched) ? unmatched : [];
                entries.length ? (uHeading.textContent = `${entries.length} ${1 === entries.length ? "fetish matched" : "fetishes matched"} no topic and ${1 === entries.length ? "was" : "were"} not imported:`, entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = `${rec.fetish_name} (from your ${"curious" === rec.list_type ? "Curious about" : "Into"} list)`, uList.append(li);
                }), uBox.hidden = !1) : (uHeading.textContent = "", uBox.hidden = !0);
            }
            const nBox = e.byId("importResultNotApplied"), nHeading = e.byId("importResultNotAppliedHeading"), nList = e.byId("importResultNotAppliedList");
            if (nBox && nHeading && nList) {
                nList.textContent = "";
                const entries = Array.isArray(notApplied) ? notApplied : [];
                entries.length ? (nHeading.textContent = `${entries.length} ${1 === entries.length ? "entry was" : "entries were"} not applied because the name it matched is not a current topic:`, entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = `“${rec.term}” matched ${rec.target}, which names no current topic, and was not applied.`, nList.append(li);
                }), nBox.hidden = !1) : (nHeading.textContent = "", nBox.hidden = !0);
            }
            const closeBtn = e.byId("closeImportResult"), okBtn = e.byId("dismissImportResult");
            closeBtn && (closeBtn.onclick = () => Ui(dlg)), okBtn && (okBtn.onclick = () => Ui(dlg)), Wi(dlg);
        }
        // F3(a) (profiles-data refactor, Edit 3): the import path's
        // dropped/parked/retired bookkeeping, extracted from rk with
        // no behavior change. importRetiredRecord builds the retired
        // record that used to be written out twice (the parked-restore
        // loop and noteDropped). importDropBookkeeping runs the
        // carried-in parked restore, defines noteDropped (returned so
        // rk's section ingestions keep using it), and prunes
        // non-canonical ratings keys, in rk's original order.
        function importRetiredRecord(key, section, value) {
            return {
                key: key,
                section: section,
                value: value,
                kind: "retired"
            };
        }
        function importDropBookkeeping(e, r) {
            // E3 loud-drop rule (assessment §9 L1+L2): a ratings key that is
            // not a canonical topic id or a registered imported child is
            // still pruned from ratings (counting/display are canonical
            // only), but never silently — every pruned key is recorded in
            // profile.droppedKeys with its value and named in the
            // post-import result dialog. Broad-hit pseudo-ratings (cat- /
            // subcategory-…) are valid stored keys: never pruned, never
            // recorded. A record carried in from a previous export is kept,
            // so the history of what was dropped survives a round-trip.
            // E4a: a parked record carried in by the file (its own
            // droppedKeys) is restored onto the imported profile
            // verbatim — entries keep key, section, value and kind —
            // and is NOT a new drop: restored entries are not reported
            // in the result dialog below, they simply remain parked on
            // the profile. Only entries this import itself fails to
            // place (noteDropped) are fresh drops.
            const parked = [], retired = [];
            Array.isArray(e.droppedKeys) && e.droppedKeys.forEach(rec => {
                if (!rec || "string" != typeof rec.key || !rec.key || "string" != typeof rec.section) return;
                // E4b: a carried-in parked record whose key is a buried
                // canonical id is retired by ruling, not restored —
                // buried ids are never parked, even from an old file.
                if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, rec.key)) return void retired.push(importRetiredRecord(rec.key, rec.section, rec.value));
                const restored = {
                    key: rec.key,
                    section: rec.section,
                    value: rec.value,
                    kind: "string" == typeof rec.kind && rec.kind ? rec.kind : "unrecognized"
                };
                // E4b: keep the entry's own label when it carries one;
                // otherwise the file's topicNames (importTopicNames)
                // names it, so On Deck can show the sender's meaning.
                const ownLabel = "string" == typeof rec.label && rec.label ? rec.label : importTopicNames && "string" == typeof importTopicNames[rec.key] && importTopicNames[rec.key] ? importTopicNames[rec.key] : "";
                ownLabel && (restored.label = ownLabel), parked.push(restored);
            });
            const dropped = [];
            const noteDropped = (key, section, value, kindOverride) => {
                if ("string" != typeof key || !key || isCatId(key) || isSubId(key)) return;
                // E4b burial: a key whose canonical id is in the burial
                // registry was retired by ruling — it is collected for
                // the import result's retired line instead of being
                // stored or parked. Only the literal canonical id can
                // match; slug spellings fall through and park as usual.
                if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, key)) return void retired.push(importRetiredRecord(key, section, value));
                const rec = {
                    key: key,
                    section: section,
                    value: value,
                    kind: kindOverride || (/^t\d{4}$/.test(key) ? "retired" : "unrecognized")
                };
                // E4b: the parked entry carries its best-guess label
                // (the dialog's guess logic — the file's own topicNames
                // win while this import is being read) so the On Deck
                // unresolved section can name it later.
                const guessed = importDroppedGuess(key);
                "string" == typeof guessed && guessed && (rec.label = guessed), dropped.push(rec);
            };
            Object.keys(e.ratings).forEach(k => {
                if (!isCatId(k) && !isSubId(k) && !r.has(k)) noteDropped(k, "ratings", e.ratings[k]), 
                delete e.ratings[k];
            });
            return {
                parked: parked,
                dropped: dropped,
                retired: retired,
                noteDropped: noteDropped
            };
        }
        // F3(b) (profiles-data refactor, Edit 3): ratings ingestion
        // for the import path, extracted from rk with no behavior
        // change — single vs. dual shape, clamping to [-100, 100],
        // and per-flank provenance from ratingSources, as before.
        // Fix 1, item 3: ONE rating-application path for the import
        // path and the converter, holding the rules both used to
        // implement separately — single vs. dual shape, clamping to
        // [-100, 100], unknown-topic skip, cat- rejection, and
        // unreadable-rating rejection. The callers differ only in
        // the options: the import path replaces the topic entry
        // wholesale with provenance from ratingSources (see
        // importProfileRatings below); the converter merges per
        // flank into the existing entry with test: provenance, and
        // keeps the documented manual-flip guard (a hand rating
        // changes only when the test moves it to a different camp —
        // the converter dialog's own copy). Guarded flanks are
        // reported in `flipped` so the converter can clear their
        // marks, as its old inline applier did; `changed` carries
        // the applied (clamped) values for the post-merge flash.
        function applyProfileRatings(c, ratings, opts) {
            opts = opts || {};
            const sourceFor = "function" == typeof opts.source ? opts.source : () => "unknown";
            const mergeFlanks = !!opts.mergeFlanks, guardManualFlip = !!opts.guardManualFlip;
            const changed = {}, flipped = [];
            const clamp = v => Math.max(-100, Math.min(100, Number(v)));
            const existingFlankValue = (id, flank) => {
                const cur = vt[c][id];
                if ("number" == typeof cur) return cur;
                return cur && "object" == typeof cur ? cur[flank] : void 0;
            };
            Object.entries(ratings).forEach(([id, rating]) => {
                if (!Ke.has(id) && !isSubId(id)) return;
                if (Ge(id, c).single) {
                    const candidates = "number" == typeof rating ? [ [ "give", rating ] ] : rating && "object" == typeof rating ? [ [ "give", rating.give ], [ "receive", rating.receive ] ] : [];
                    const found = candidates.find(([, v]) => Number.isFinite(Number(v)));
                    if (!found) throw new Error(`This profile contains an unreadable rating for ${id}`);
                    const value = clamp(found[1]), supplying = found[0];
                    if (guardManualFlip) {
                        const blocked = [ "give", "receive" ].some(flank => "manual" === Ao(c, id, flank) && Number.isFinite(Number(existingFlankValue(id, flank))) && Ix(Number(existingFlankValue(id, flank))) !== Ix(value));
                        if (blocked) return void flipped.push(id);
                    }
                    const before = existingFlankValue(id, "give");
                    vt[c][id] = value;
                    Co(c, id, "give", sourceFor(id, "give", supplying)), Co(c, id, "receive", sourceFor(id, "receive", supplying));
                    Number(before) !== value && (changed[id] = value);
                    return;
                }
                const incoming = {};
                if (Number.isFinite(Number(rating))) incoming.give = incoming.receive = clamp(rating); else if (rating && "object" == typeof rating) [ "give", "receive" ].forEach(flank => {
                    Object.prototype.hasOwnProperty.call(rating, flank) && Number.isFinite(Number(rating[flank])) && (incoming[flank] = clamp(rating[flank]));
                });
                if (!Object.keys(incoming).length) throw new Error(`This profile contains an unreadable rating for ${id}`);
                const applied = {};
                let anyBlocked = !1;
                Object.entries(incoming).forEach(([flank, value]) => {
                    if (guardManualFlip && "manual" === Ao(c, id, flank) && Number.isFinite(Number(existingFlankValue(id, flank))) && Ix(Number(existingFlankValue(id, flank))) !== Ix(value)) return void (anyBlocked = !0);
                    applied[flank] = value;
                });
                anyBlocked && flipped.push(id);
                if (!Object.keys(applied).length) return;
                let next;
                if (mergeFlanks) {
                    const cur = vt[c][id];
                    next = "number" == typeof cur ? { give: cur, receive: cur } : cur && "object" == typeof cur ? Object.assign({}, cur) : {};
                    Object.assign(next, applied);
                } else next = applied;
                Object.keys(applied).forEach(flank => {
                    Number(existingFlankValue(id, flank)) !== applied[flank] && ((changed[id] || (changed[id] = {}))[flank] = applied[flank]);
                    Co(c, id, flank, sourceFor(id, flank, flank));
                });
                vt[c][id] = next;
            });
            return { changed: changed, flipped: flipped };
        }
        // F3(b) (profiles-data refactor, Edit 3): ratings ingestion
        // for the import path, extracted from rk with no behavior
        // change — single vs. dual shape, clamping to [-100, 100],
        // and per-flank provenance from ratingSources, as before.
        // Fix 1, item 3: now a thin wrapper over
        // applyProfileRatings, the same path the converter uses.
        function importProfileRatings(c, e) {
            applyProfileRatings(c, e.ratings, { source: (topic, flank, supplying) => {
                const i = e.ratingSources && e.ratingSources[topic] && e.ratingSources[topic][supplying || flank];
                return "string" == typeof i && i.trim() ? i : "unknown";
            } });
        }
        // Fix 1, item 2: the section ingestions rk used to write
        // twice — once for the load-into (pair) branch and once for
        // the create branch — now live here, once. The only
        // difference between the branches is notes: load-into merges
        // with the pair's existing notes, create starts from the
        // fresh (empty) lists, so mergeNotes selects it.
        function ingestProfileSections(c, e, noteDropped, mergeNotes) {
            e.annotations && "object" == typeof e.annotations && Object.entries(e.annotations).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void noteDropped(id, "annotations", value);
                // Importer rework Part A (R1 STRICT): only the three legal
                // annotation values (favorite / limit / notinterested) are
                // retained; any other value is dropped WITH RECORD via
                // noteDropped, never silently ignored.
                "favorite" !== value && "limit" !== value && "notinterested" !== value ? noteDropped(id, "annotations", value, "value") : (Qe[c][id] = value);
            }), e.fantasyOnly && "object" == typeof e.fantasyOnly && Object.entries(e.fantasyOnly).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void (value && noteDropped(id, "fantasyOnly", value));
                value && (Je[c][id] = !0);
            }), e.alreadyTried && "object" == typeof e.alreadyTried && Object.entries(e.alreadyTried).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void (value && noteDropped(id, "alreadyTried", value));
                value && (et[c][id] = !0);
            }), e.notes && "object" == typeof e.notes && Object.entries(e.notes).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void noteDropped(id, "notes", value);
                if (!Array.isArray(value)) return;
                // Importer fix package (2026-11-05): a note longer than
                // 64 characters is trimmed to 64 WITH RECORD (kind
                // "trimmed"), never silently shortened.
                const filtered = value.filter(v => "string" == typeof v).map(v => v.trim()).filter(Boolean).map(v => v.length > 64 ? (noteDropped(id, "notes", v, "trimmed"), v.slice(0, 64)) : v);
                const merged = mergeNotes ? [ ...new Set((tt[c][id] || []).concat(filtered)) ] : [ ...new Set(filtered) ];
                const capped = merged.slice(0, 16);
                // R1 STRICT, caps ruled 2026-11-05: notes are trimmed /
                // deduped / capped at 16 per topic; the excess over the
                // cap is dropped WITH RECORD as a value-drop (kind
                // "value") — the topic is current, only the extra
                // values are refused.
                merged.length > 16 && noteDropped(id, "notes", merged.slice(16), "value"), capped.length && (tt[c][id] = capped);
            });
        }
        function rk(e, n = {}) {
            eS();
            const i = ("string" == typeof e.profileName ? e.profileName : "").trim().replace(/\s+/g, " ").slice(0, 40);
            if (!i) throw new Error("This profile file does not include a profile name.");
            importTopicNames = e.topicNames && "object" == typeof e.topicNames ? e.topicNames : null;
            const a = {};
            e.importedChildren && "object" == typeof e.importedChildren && Object.values(e.importedChildren).forEach(e => {
                if (!e || "object" != typeof e) return;
                const t = ii(a, e.label, e.parentId);
                if (!t || e.id !== t.id) throw new Error("This profile uses an unknown imported-topic ID.");
            });
            const r = new Set([ ...Ke, ...Object.keys(a) ]);
            // F3(a): dropped/parked/retired bookkeeping lives in
            // importDropBookkeeping (above rk); noteDropped stays in
            // scope here for the section ingestions below.
            const { parked, dropped, retired, noteDropped } = importDropBookkeeping(e, r);
            // Pair-tab load (owner ruling, 2026-10-27): when the file
            // was chosen from a pair tab's Load menu, the load goes
            // INTO the active pair record — it never creates a
            // separate profile, never renames the pair, and never
            // touches its group record (the create path below deletes
            // ft for its fresh id; a merge must not). Ratings,
            // annotations, fantasy/tried flags, notes, and imported
            // children merge over the pair's existing data through
            // the same ingestion the create path uses. Merged values
            // are direct ratings written into the pair's computed
            // map: zt marks the pair dirty and sxMergeSaveNow then
            // saves the merged data to profile memory immediately
            // (split-center stage, 2026-10-27) — they do not wait on
            // the draft-autosave timer — and they survive
            // the session — but a later recompute (Rd, e.g. a
            // leniency change) rebuilds the pair from its source
            // profiles and replaces them, because the record cannot
            // distinguish merged values from computed ones.
            const sxMergeTarget = n && n.mergeIntoGroup && ft[n.mergeIntoGroup] && "group" === ft[n.mergeIntoGroup].kind && vt[n.mergeIntoGroup] ? n.mergeIntoGroup : null;
            if (sxMergeTarget) {
                const c = sxMergeTarget;
                // Switch-first-then-merge guard (load-target stage,
                // 2026-10-27): the merge enforces foreground = its
                // target itself, so the pressed-from rule holds even
                // if a future caller reaches this branch without the
                // Load menu's origin discipline.
                c !== Mt && Js(c);
                if (e.importedChildren && "object" == typeof e.importedChildren) {
                    const ma = Object.assign({}, at[c] || {});
                    Object.values(e.importedChildren).forEach(en => {
                        if (!en || "object" != typeof en) return;
                        const t = ii(ma, en.label, en.parentId);
                        t && Ke.add(t.id);
                    }), at[c] = ma;
                }
                importProfileRatings(c, e), ingestProfileSections(c, e, noteDropped, !0), e.droppedKeys = parked.concat(dropped), droppedKeyRecords[c] = e.droppedKeys,
                sxPairLoadInto = null, Ui(Sg), zt(c), sxMergeSaveNow(c), sxSel(c), sxSel(null, "dismiss"), Jw(), Mr({
                    animate: !1,
                    forceRepaint: !0
                }), Ih(), n.quiet || tS(`Loaded into ${wt[c]}: the file's ${Object.keys(e.ratings || {}).length} ratings merged with the pair's existing data.${dropped.length ? ` ${dropped.length} ${1 === dropped.length ? "entry was" : "entries were"} not loaded because their topic keys match no current topic.` : ""}`, {
                    persistent: !0
                });
                return c;
            }
            const o = function(e) {
                if (!ek(e)) return e;
                let t = 2, n = "";
                do {
                    const i = ` (${t++})`;
                    n = e.slice(0, Math.max(1, 40 - i.length)).trimEnd() + i;
                } while (ek(n));
                return n;
            }(i), s = (Xi(), function(e = {}) {
                if (!(Array.isArray(e.comparisonIds) ? !1 !== e.comparisonActive : an)) return [];
                const t = Array.isArray(e.comparisonIds) ? e.comparisonIds : Yi(), n = [ ...new Set(t.filter(e => vt[e])) ];
                return n.length >= 2 ? n : [];
            }(n)), l = !0 === e.blind && s.length >= 2, c = ik(o);
            n.quiet || sxSel(c), SX_PROFILE_RECORD_LISTS.forEach(e => e[c] = {}), wt[c] = o, profileUuids[c] = /^[0-9a-f-]{36}$/i.test(String(e.profileUuid || "")) ? String(e.profileUuid) : makeProfileUuid(), sampleProfileFlags[c] = !0 === e.sampleProfile, rt[c] = bb(e.gender), pz[c] = String(e.pronouns || "").trim().slice(0, 60), 
            ot[c] = iv(e.sexuality), st[c] = Gb(e.roles || e.role), lt[c] = Xv(e.age), ct[c] = Zv(e.location), 
            dt[c] = Vv(e.photos), ut[c] = Rv(e.contact), nt[c] = String(e.aboutMe || "").trim().slice(0, 1500), 
            it[c] = String(e.termsOfService || "").trim().slice(0, 1500), vpt[c] = av(null != e.veil ? e.veil : e.net), 
            vht[c] = Boolean(null != e.veilEnabled ? e.veilEnabled : e.netEnabled), at[c] = a, gt[c] = e.loaderState && "object" == typeof e.loaderState ? e.loaderState : {}, 
            mt[c] = St(e.completionTimes), delete ft[c], "group" === e.pairKind && (ft[c] = {
                kind: "group",
                pairOp: "straight" === e.pairOp ? "straight" : "bowtie"
            }), Object.keys(a).forEach(e => Ke.add(e)),
            la(c);
            importProfileRatings(c, e), ingestProfileSections(c, e, noteDropped, !1), e.ratingSources && "object" == typeof e.ratingSources && Object.keys(e.ratingSources).forEach(k => {
                r.has(k) || noteDropped(k, "ratingSources", e.ratingSources[k]);
            });
            const u = l ? sxBlindFilter(c, s) : null;
            Ui(Sg);
            const p = Object.prototype.hasOwnProperty.call(e, "importAttention");
            e.importAttention && "object" == typeof e.importAttention && [ "nodes", "newest" ].forEach(nm => {
                Array.isArray(e.importAttention[nm]) && e.importAttention[nm].forEach(id => {
                    if ("string" != typeof id || qn[id] || Xn(id) || a[id]) return;
                    noteDropped(id, "importAttention", id);
                });
            }), e.droppedKeys = parked.concat(dropped), droppedKeyRecords[c] = e.droppedKeys, n.quiet || !0 === e.sampleProfile || showImportResultDialog(o, Object.keys(vt[c]).length, dropped, retired);
            return (n.autoSelect ? sxAutoSelect(c) : Zi(c)), sxLoadLanding(c, n), qi(c, {
                ratings: vt[c],
                annotations: Qe[c],
                notes: tt[c],
                children: at[c]
            }, {
                noFlash: !0 === e.noFlash,
                hasAttentionState: p,
                attentionState: e.importAttention
            }), Vt(c), Lo(c) && Mr(), Ig(""), xg.textContent = "", n.quiet || (o !== i && tS(`Imported as ${o}`), 
            od(c).length && t.setTimeout(() => bw(c), 0)), u ? tS(`Blind import kept ${u.kept} mutual ${1 === u.kept ? "match" : "matches"} across the ${u.groupSize}-profile comparison group and permanently discarded ${u.discarded} non-matching incoming ${1 === u.discarded ? "topic" : "topics"} from memory. The shared file is unchanged.`, {
                persistent: !0
            }) : !0 === e.blind && tS("This profile was set up for a blind comparison, but no comparison group was selected first, so the full profile was loaded instead. To do a blind comparison: select the profiles you want to compare first, then import this file again.", {
                persistent: !0
            }), c;
        }
        const ok = {
            "pleasure control": "cat-orgasm-reproductive-play",
            restraint: "cat-bondage-restriction",
            roleplay: "cat-roleplay-identity",
            degradation: "cat-psychological-dynamics",
            pain: "cat-impact-pain-body-modification",
            sensation: "cat-sensation-atmosphere",
            "edge play": "cat-impact-pain-body-modification",
            "potty play": "cat-fluids-messy-play"
        }, sk = {
            1: [ "t0327", "receive" ],
            2: [ "t0360", "give" ],
            3: [ "t0338", "give" ],
            4: [ "t0134", "receive" ],
            5: [ "t0360", "receive" ],
            6: [ "t0326", "receive" ],
            7: [ "t0245", "give" ],
            8: [ "t0093", "receive" ],
            9: [ "t0101", "give" ],
            10: [ "t0097", "receive" ],
            11: [ "cat-fluids-messy-play", "give" ],
            12: [ "t0136", "give" ],
            13: [ "t0035", "give" ],
            14: [ "t0185", "give" ],
            15: [ "t0185", "receive" ],
            16: [ "t0134", "give" ],
            17: [ "t0270", "receive" ],
            18: [ "cat-impact-pain-body-modification", "give" ],
            19: [ "t0240", "receive" ],
            20: [ "t0101", "receive" ],
            21: [ "t0093", "give" ],
            22: [ "t0354", "receive" ],
            23: [ "t0123", "receive" ],
            24: [ "t0326", "give" ],
            25: [ "cat-fluids-messy-play", "receive" ],
            26: [ "t0270", "receive" ],
            27: [ "cat-fluids-messy-play", "give" ],
            28: [ "t0327", "give" ],
            29: [ "t0270", "give" ],
            30: [ "t0035", "receive" ],
            31: [ "cat-impact-pain-body-modification", "receive" ],
            32: [ "t0326", "give" ],
            33: [ "t0270", "give" ],
            34: [ "t0354", "give" ],
            35: [ "t0040", "give" ],
            36: [ "t0070", "give" ],
            37: [ "t0035", "receive" ],
            38: [ "t0269", "give" ],
            39: [ "t0245", "receive" ],
            40: [ "t0096", "receive" ],
            41: [ "t0025", "receive" ],
            42: [ "t0239", "give" ],
            43: [ "t0123", "give" ],
            44: [ "t0096", "give" ],
            45: [ "t0056", "receive" ],
            46: [ "t0131", "give" ],
            47: [ "t0097", "give" ],
            48: [ "t0270", "receive" ],
            49: [ "t0327", "receive" ],
            50: [ "t0042", "give" ],
            51: [ "t0136", "receive" ],
            52: [ "t0097", "receive" ],
            53: [ "t0097", "give" ],
            54: [ "t0042", "receive" ],
            55: [ "t0074", "receive" ],
            56: [ "t0326", "receive" ],
            57: [ "t0056", "give" ],
            58: [ "t0035", "give" ],
            59: [ "t0270", "receive" ],
            60: [ "t0096", "give" ],
            61: [ "t0040", "receive" ],
            62: [ "t0025", "give" ],
            63: [ "t0096", "receive" ],
            64: [ "t0338", "receive" ],
            65: [ "cat-fluids-messy-play", "receive" ],
            66: [ "t0074", "give" ],
            67: [ "t0239", "receive" ],
            68: [ "t0040", "receive" ],
            69: [ "t0040", "give" ],
            70: [ "t0070", "receive" ],
            71: [ "t0327", "give" ]
        }, lk = new Set([ 2, 6, 7, 10, 17, 18, 19, 23, 24, 25, 26, 27, 29, 31, 32, 33, 35, 38, 40, 43, 44, 46, 47, 48, 52, 53, 56, 59, 60, 61, 63, 65, 68, 69 ]);
        function ck(e) {
            return String(e || "").toLowerCase().replace(/&/g, " and ").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
        }
        function dk(e) {
            const t = new Set([ "a", "an", "and", "the", "play", "roleplay", "kink", "fetish", "fantasy", "bondage", "sex", "sexual", "role", "roles" ]);
            return ck(e).split(" ").filter(e => e && !t.has(e)).map(e => e.replace(/(?:ing|ed|es|s)$/, "")).filter(Boolean);
        }
        let uk = null;
        function pk(e, t, n) {
            if (!e || !e.id) return null;
            if (isCatId(e.id)) return {
                id: migrateNodeKey(e.id),
                label: mx(migrateNodeKey(e.id)),
                child: null
            };
            const i = e.id, a = Xn(i), r = function(e) {
                const t = ni(e);
                if (!t) return null;
                const n = function() {
                    if (uk) return uk;
                    const e = {}, t = (t, n) => {
                        const i = ck(t);
                        i && !e[i] && (e[i] = n);
                        const a = i.replace(/\s+/g, "");
                        a && a !== i && !e[a] && (e[a] = n);
                    };
                    for (const e of h) for (const n of e.topics) {
                        const e = Wn(n);
                        t(n, e);
                        const i = String(n).replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, "").trim();
                        i && i !== n && t(i, e), String(n).split("/").forEach(i => {
                            const a = i.trim();
                            a && a !== n && t(a, e);
                        }), String(n).split("&").forEach(i => {
                            const a = i.trim();
                            a && a !== n && t(a, e);
                        });
                    }
                    return uk = e, e;
                }();
                let i = n[ck(t)];
                if (i) return i;
                if (i = n[ck(t).replace(/\s+/g, "")], i) return i;
                const a = t.replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, "").trim();
                if (a && a !== t && (i = n[ck(a)], i)) return i;
                const r = ck(t), o = new Set;
                r.endsWith("s") ? o.add(r.slice(0, -1)) : o.add(r + "s"), r.endsWith("es") && o.add(r.slice(0, -2));
                for (const e of o) if (i = n[e], i) return i;
                return null;
            }(t);
            if (r && r !== i) return {
                id: r,
                label: mx(r),
                child: null
            };
            if (a && function(e, t, n) {
                const i = ni(e);
                if (!i || ck(i) === ck(t.label)) return !1;
                if (n.uncertain || n.specific) return !0;
                const a = new Set(dk(i)), r = new Set(dk(t.label));
                return !!a.size && (![ ...a ].filter(e => r.has(e)).length || [ ...a ].some(e => !r.has(e)) && [ ...r ].some(e => !a.has(e)));
            }(t, a, e)) {
                const sxSugName = ni(t);
                if (sxSugName) return {
                    id: i,
                    label: mx(i),
                    child: null,
                    suggestion: {
                        name: sxSugName,
                        parentId: i
                    }
                };
            }
            return {
                id: i,
                label: mx(i),
                child: null
            };
        }
        function hk(e) {
            if (!e || !e.child) return e ? e.label : "";
            const t = Xn(e.child.parentId);
            return `${t ? t.label : mx(e.child.parentId)} → ${e.child.label}`;
        }
        // Minting-suggestions build (2026-11-05): pathed display for
        // converter mapping targets and suggestion parent paths, in the
        // minimal-spanning convention — foreshortened category form,
        // then subcategory, then topic, joined by ›, middle omitted
        // when flat. Category forms ruled 2026-11-05 (7 letters where
        // the name fits, 8 where it needs it), in taxonomy-file order.
        const SX_CAT_FORMS = {
            c0001: "POWEREX",
            c0002: "BONDAGE",
            c0003: "IMPACT",
            c0004: "SENSATN",
            c0005: "ROLEPLY",
            c0006: "CLOTHNG",
            c0007: "BODYFOCS",
            c0008: "PSYCHOL",
            c0009: "WATCHNG",
            c0010: "PARTNER",
            c0011: "SEXACTS",
            c0012: "POSITION",
            c0013: "ORGASM",
            c0014: "FLUIDS",
            c0015: "PRIMAL",
            c0016: "SERVICE",
            c0017: "FANTASY",
            c0018: "CONNECT"
        };
        function sxNodePath(e) {
            if (!e) return "";
            const id = migrateNodeKey(e);
            if (isCatId(id)) return SX_CAT_FORMS[id] || mx(id);
            const s = zn(id);
            if (s) {
                const c = h.find(c => c.name === s.branch);
                return `${c ? SX_CAT_FORMS[c.id] || s.branch : s.branch}›${s.label}`;
            }
            const n = Xn(id);
            if (n && "Topic" === n.kind) {
                const c = h.find(c => c.name === n.branch), form = c ? SX_CAT_FORMS[c.id] || n.branch : n.branch;
                if (n.parentId) {
                    const p = zn(n.parentId);
                    if (p) return `${form}›${p.label}›${n.label}`;
                }
                return `${form}›${n.label}`;
            }
            const ch = qn[id];
            if (ch && ch.parentId) return `${sxNodePath(ch.parentId)}›${ch.label}`;
            return mx(id);
        }
        // ============================================================
        // FetLife importer alias map — SECTION START
        // (Refactor Step 1, Build 2026-10-18_0343: this section was
        // given clear delimiters and batch labels. NO mapping was
        // added, removed, or changed — structure/documentation only.)
        //
        // What uses it:
        //   ox() — saved FetLife HTML imports: exact lookup in gk
        //     (keys normalized by ck()), then the rx regex table
        //     (defined just after the sample strings, below).
        //   cx() — pasted-text imports: exact lookup in fk. fk is
        //     seeded from the topic catalog, then gk is merged in,
        //     then the guarded batch table further below.
        // Guarded insertion (IMPORTANT): merges into fk never
        // overwrite an existing key — the first definition wins
        // (the fk[e] || ... and !fk[n] guards). mk() writes only
        // gk and runs before those merges.
        // How to add aliases: append a NEW batch at the end of the
        // batch table (after Batch #3), same [target, [terms]]
        // shape, labeled with the next batch number and the
        // build/date. Keys are base terms — the importer strips
        // parenthetical qualifiers before matching.
        // ============================================================
        // ---- Batch #1 — Builds 2026-10-18_0107 / 0114
        // (2026-10-18): the original alias set, registered into
        // gk by the mk() calls below. ----
        const gk = {};
        // Build 2026-10-18_1624 — display-name registry for the FetLife
        // mapping viewer (window.__fetlifeMap, exposed after cx below):
        // fk/gk keys are ck()-normalized, so mk()/yk()/the guarded batch
        // table also record each term's original spelling here (first
        // spelling wins), letting the viewer show real FetLife names.
        const fln = {};
        function mk(e, t, n = !1) {
            t = migrateNodeKey(t);
            e.forEach(e => {
                gk[ck(e)] = {
                    id: t,
                    uncertain: n
                }, fln[ck(e)] = fln[ck(e)] || e;
            });
        }
        mk([ "Gentle touch/caress", "Cuddling" ], "t0397", !0), mk([ "Tantra", "Tantric sex", "Tantric play", "Energy play", "Tantra / energy play", "Breathwork" ], "t0110"), 
        mk([ "Sex magic", "Sacred sexuality", "Ritual kink", "Spiritual kink", "Spiritual BDSM", "Spiritual play" ], "t0367"), 
        mk([ "Tickling" ], "t0100"), mk([ "Canes", "Caning" ], "t0067"), 
        mk([ "Crop", "Riding crop", "Riding crops" ], "t0068"), mk([ "Whip", "Whips" ], "t0064"), 
        mk([ "Spanking" ], "t0056"), mk([ "Over the knee OTK Spanking", "Over the knee (OTK) Spanking", "Face slapping" ], "t0056", !0), 
        mk([ "Vampire gloves" ], "t0354", !0), mk([ "Punching play", "Kicking play" ], "t0097", !0), 
        mk([ "Rope" ], "t0022"), mk([ "Chains", "Handcuffs", "Quick release velcro", "Quick release (velcro)" ], "t0025", !0), 
        mk([ "Bondage light", "Bondage (light)" ], "cat-bondage-restriction", !0), mk([ "Bondage heavy", "Bondage (heavy)", "Suspension" ], "t0040", !0), 
        mk([ "Shibari" ], "t0022"), mk([ "Belt", "Paddle" ], "t0069", !0), 
        mk([ "Flogger" ], "t0062"), mk([ "Orgasm Control", "Forced orgasms", "Ruined orgasms" ], "t0326", !0), 
        mk([ "Chastity" ], "t0328"), mk([ "Denial" ], "t0327"), mk([ "Edging" ], "t0329"), 
        // Importer rework Part B (decided 2026-11-04): Edge Play lands on
        // the Edge play topic t0334 (which carries the risky-practice
        // asterisk), NEVER on Edging t0329. The next five are the decided
        // homes for the formerly unplaced fetishes: Morning Sex (Sex
        // acts), Bellydancing (Watching, exposure & settings), Formiphilia
        // (Sensation & atmosphere), Graphoerotica (Psychological
        // dynamics), and Toy Making, whose decided home is the Clothing,
        // materials & objects CATEGORY — a category-only target, so it is
        // reported as a broad hit and never silently rated.
        mk([ "Edge Play" ], "t0334"), mk([ "Morning Sex" ], "t0290"), mk([ "Bellydancing" ], "t0277"), 
        mk([ "Formiphilia", "Forniphilia" ], "t0120"), mk([ "Graphoerotica" ], "t0265"), mk([ "Toy Making" ], "cat-clothing-materials-objects"), 
        // Importer fix package (2026-11-05): "Humiliation language" is its
        // own topic (t0240, PS Humiliation subcategory) — it must land
        // there, not fall through to the broad Humiliation subcategory
        // fallback. The broad "Humiliation" mapping (s0034) is unchanged.
        mk([ "Humiliation language" ], "t0240"), 
        mk([ "Anal sex" ], "t0297"), mk([ "Pegging" ], "t0301"), mk([ "Rimming" ], "t0294"), 
        mk([ "Using toys anal", "Using toys" ], "t0306", !0), mk([ "Using fingers anal" ], "t0299"), 
        mk([ "Butt plugs" ], "t0193", !0), mk([ "Enemas for prep", "Enemas for prep?", "Enemas as part of play", "Enemas as part of play?", "Scat" ], "cat-fluids-messy-play", !0), 
        mk([ "Gripped at neck", "Choking" ], "t0097", !0), mk([ "Objects in mouth" ], "t0035", !0), 
        mk([ "Gags" ], "t0035"), mk([ "Nipple stimulation hands", "Nipple stimulation mouth", "Breast bondage" ], "t0220", !0), 
        mk([ "Oral" ], "t0291", !0), mk([ "Blow jobs/cock worship", "Blow jobs cock worship", "Cunninglingus" ], "t0291"), 
        mk([ "Nipple Clamps" ], "t0070"), mk([ "Facials" ], "t0314"), mk([ "Breast impact" ], "t0096", !0), 
        mk([ "Fingers" ], "t0304", !0), mk([ "Toys dildos vibrators others", "Toys (dildos, vibrators, others?)", "Penis Strap on", "Penis /Strap on" ], "t0306", !0), 
        mk([ "Fisting" ], "t0310", !0), mk([ "Favorite positions", "Favorite positions?" ], "cat-positions", !0), 
        mk([ "Wax play" ], "t0098"), mk([ "Ice play" ], "t0099"), 
        mk([ "Abrasion play" ], "t0102", !0), mk([ "Being blindfolded" ], "t0103", !0), 
        mk([ "Fireplay" ], "t0098", !0), mk([ "Electric play Violet Wand E Stim", "Electric play (Violet Wand, E-Stim)" ], "t0101"), 
        mk([ "Teasing" ], "t0330"), mk([ "Biting", "Scratching" ], "t0354"), 
        mk([ "Pursuit chase", "Pursuit /chase" ], "t0352"), mk([ "Growling" ], "t0351", !0), 
        mk([ "Wrestling", "Being pinned held down", "Being pinned/held down" ], "t0353", !0), 
        mk([ "Piercings permanent temporary", "Piercings (permanent /temporary)" ], "t0074", !0), 
        mk([ "Shaving head", "Tattoos" ], "t0236", !0), mk([ "Branding", "Cutting", "Artistic Cutting" ], "t0096", !0), 
        mk([ "Medical Doctor Nurse", "Medical/Doctor/Nurse" ], "t0129"), 
        mk([ "Teacher Student", "Teacher/Student" ], "t0128"), 
        mk([ "Boss Secretary" ], "t0127", !0), mk([ "Ageplay Non sexual", "Ageplay (Non-sexual)", "Age Play Sexual", "Age Play (Sexual)" ], "t0123", !0), 
        mk([ "ABDL Diaper Play", "ABDL (Diaper Play)" ], "t0185"), mk([ "Pet play", "Pet play pony play" ], "t0136"), 
        mk([ "Pony play", "Pony Play" ], "t0138"), mk([ "Threesomes" ], "t0278"), 
        mk([ "Foursomes", "Orgy" ], "t0279", !0), mk([ "Partner Swapping" ], "t0280"), 
        mk([ "Gang bangs" ], "t0284"), mk([ "Bukkake" ], "t0314", !0), 
        mk([ "Double penetration", "Triple penetration" ], "t0306", !0), mk([ "Words I enjoy saying hearing slut whore etc", "Words I enjoy saying, hearing (slut, whore etc)" ], "t0240"), 
        mk([ "Humiliation verbal" ], "t0239"), mk([ "Exhibitionism" ], "t0270"), 
        mk([ "Voyeurism" ], "t0270"), mk([ "Body Worship" ], "t0237"), 
        mk([ "Watersports" ], "t0338"), mk([ "Needle play" ], "t0074"), 
        mk([ "Knife play" ], "t0245", !0), mk([ "Fear play", "Fear Play" ], "t0245");
        // fk: the pasted-text import map. Seeded from the topic
        // catalog just below, then gk (Batch #1) is merged in with
        // a guard — existing keys are never overwritten — then the
        // hand-written yk() aliases and the guarded batch table.
        const fk = {};
        function yk(e, t, n = "both", i = !1, a = !1) {
            t = migrateNodeKey(t);
            e.forEach(e => {
                fk[ck(e)] = {
                    id: t,
                    direction: n,
                    uncertain: i,
                    specific: a
                }, fln[ck(e)] = fln[ck(e)] || e;
            });
        }
        h.forEach(e => {
            yk([ e.name, "All " + e.name ], catId(e.name)), e.topics.forEach(e => yk([ sxName(e) ], Wn(e)));
        }), Object.entries(gk).forEach(([e, t]) => {
            fk[e] || (fk[e] = {
                id: t.id,
                direction: "both",
                uncertain: t.uncertain
            });
        }), yk([ "BDSM", "D/s", "Power exchange relationship" ], "cat-power-exchange"), 
        yk([ "Dominance", "Dominant", "Dom", "Topping", "Top" ], "cat-power-exchange", "give"), 
        yk([ "Submission", "Submissive", "Sub", "Bottoming", "Bottom" ], "cat-power-exchange", "receive"), 
        yk([ "Switch", "Switching" ], "cat-power-exchange", "both"), yk([ "Sadism", "Sadist" ], "cat-impact-pain-body-modification", "give"), 
        yk([ "Masochism", "Masochist" ], "cat-impact-pain-body-modification", "receive"), 
        yk([ "Breath play" ], "t0097", "both", !0), yk([ "CNC", "Consensual nonconsent", "Consensual non-consent" ], "t0134"), 
        yk([ "Rope", "Rope play" ], "t0022"), yk([ "Electrostimulation", "E-stim", "Violet wand" ], "t0101"), 
        yk([ "Wax play" ], "t0098"), yk([ "Tantra", "Tantric", "Tantric play" ], "t0110"), 
        yk([ "Sacred sexuality", "Sex magic", "Sex magick" ], "t0367"), yk([ "Bondage", "Bondage play" ], "cat-bondage-restriction"), 
        yk([ "Shibari", "Kinbaku" ], "t0022"), yk([ "Impact play" ], "cat-impact-pain-body-modification"), 
        yk([ "Paddling", "Paddle play" ], "t0069"), yk([ "Caning", "Cane play" ], "t0067"), 
        yk([ "Flogging" ], "t0062"), yk([ "Whipping", "Whip play", "Single Tail Whips", "Single-tail whips" ], "t0064"), 
        yk([ "Humiliation play" ], "t0240"), yk([ "Humiliation" ], "subcategory-psychological-dynamics-humiliation"), 
yk([ "Spitting", "Spit play", "Being spit on", "Spitting on someone" ], "t0341"), 
        yk([ "Name calling", "Insults", "Verbal degradation" ], "t0239", "both", !0, !0), 
        yk([ "Praise kink" ], "t0264"), yk([ "Sensory deprivation" ], "t0103"), 
        yk([ "Temperature play" ], "t0098", "both", !0), yk([ "Exhibitionism", "Exhibitionist" ], "t0270"), 
        yk([ "Voyeurism", "Voyeur" ], "t0270"), yk([ "Public play" ], "t0269", "both", !0), 
        yk([ "Anal play" ], "t0297", "both", !0), yk([ "Oral play" ], "t0291", "both", !0), 
        yk([ "Orgasm play" ], "cat-orgasm-reproductive-play", "both", !0), yk([ "Primal", "Primal kink" ], "t0351"), 
        yk([ "Predator prey", "Predator/prey" ], "t0352", "both", !0), yk([ "Service submission", "Service submissive" ], "t0359", "receive", !0), 
        yk([ "Aftercare" ], "cat-connection-aftercare"),
        // ---- Guarded batch table for fk: each [target, [terms]]
        // group is merged with the !fk[n] guard (first definition
        // wins). Groups before the Batch #2 marker are the core
        // table (Batch #1 era, Builds 0107/0114). ----
        [ [ "t0291", [ "Blow Jobs", "Blow Job", "Cocksucking", "Cock Sucking", "Eating Pussy", "Deep Throating" ] ], [ "t0297", [ "Anal", "Ass Play" ] ], [ "t0097", [ "Asphyxiaphilia", "Asphyxiaphilia Play" ] ], [ "t0306", [ "Ben Wa Balls", "Toys", "Strap-ons", "Strap-on", "Strap Ons", "Sybian", "Clit Pumping", "Pussy Pumping", "Remote-Control Devices" ] ], [ "t0213", [ "Boot Licking", "Boot Worship", "Shoe Worship", "Foot Licking", "Foot/Feet" ] ], [ "t0397", [ "Caressing", "Caress", "Cuddles", "Snuggling", "Making Out", "Touching", "Aftercare Cuddles" ] ], [ "t0070", [ "Clover Clamps" ] ], [ "t0022", [ "Japanese Bondage" ] ], [ "t0136", [ "Petplay", "Kitten Petplay", "Puppy Play" ] ], [ "t0351", [ "Primal Play" ] ], [ "t0181", [ "Panties" ] ], [ "t0267", [ "Erotic Photography", "Photography", "Making Home Movies" ] ], [ "t0263", [ "Dirty Text Messaging", "Talking Dirty" ] ], [ "t0270", [ "Flashing" ] ], [ "t0383", [ "Furry" ] ], [ "t0284", [ "Gangbangs", "Gangbang" ] ], [ "t0292", [ "Throat Fucking" ] ], [ "t0220", [ "Tit Fucking" ] ], [ "t0025", [ "Shackles" ] ], [ "t0268", [ "Cyber Sex", "Sex Online" ] ], [ "t0133", [ "Abduction Play" ] ], [ "t0010", [ "Affectionate Domination", "Domination", "Sensual Domination", "Total Power Exchange", "male submission" ] ], /* Batch #2 — Build 2026-10-18_0210 (2026-10-18): sourced from the server unmapped_fetishes table; terms already in the map were not duplicated. */ [ "t0315", [ "Anal Creampie", "Creampie" ] ], [ "t0298", [ "Anal Stretching" ] ], [ "t0377", [ "Anonymous Encounters", "Glory Hole", "Sex with Strangers" ] ], [ "t0297", [ "Ass to Mouth" ] ], [ "t0218", [ "Ass worship" ] ], [ "t0229", [ "BBW/BHM" ] ], [ "t0035", [ "Ball Gags" ] ], [ "t0084", [ "Ball Stretching" ] ], [ "t0056", [ "Bare Handed Spanking" ] ], [ "subcategory-sex-acts-fluids", [ "Bareback", "Cum" ] ], [ "t0213", [ "Barefoot" ] ], [ "t0314", [ "Swallowing", "Swallowing Cum" ] ], [ "subcategory-sex-acts-fluids", [ "Being Cummed On" ] ], [ "t0264", [ "Being called a good girl" ] ], [ "t0065", [ "Belt Spanking" ] ], [ "t0149", [ "Bimboification", "Human Doll" ] ], [ "t0103", [ "Blindfolds", "Eye Contact Restrictions" ] ], [ "subcategory-bondage-restriction-restraints", [ "Bondage Equipment" ] ], [ "t0305", [ "Breast/Nipple Play", "Nipples" ] ], [ "t0331", [ "Breeding", "Impregnation Fantasy" ] ], [ "t0269", [ "Butt plugs in public", "Covert Bondage", "Outdoor Bondage", "Outdoor sex", "Sex In Public", "Sex in videostore porn rooms" ] ], [ "t0270", [ "CFNM", "Nudity" ] ], [ "t0098", [ "Candle Wax" ] ], [ "t0152", [ "Catsuits", "Fetish Wear" ] ], [ "t0110", [ "Chakra energy play" ] ], [ "t0354", [ "Claws", "Fingernails", "Neck Biting" ] ], [ "t0168", [ "Clit Pumping", "Pussy Pumping", "Vacuum Bed" ] ], [ "subcategory-body-focus-appearance-worship", [ "Cock Worship", "Cunt Worship", "Goddess Worship", "Pussy Worship" ] ], [ "t0003", [ "Collar and Lead/Leash", "Posture Collars", "Slave Bells" ] ], [ "subcategory-roleplay-identity-authority", [ "Control" ] ], [ "subcategory-clothing-materials-objects-uniforms-costumes", [ "Costumes/Dressing-up" ] ], [ "t0068", [ "Crops" ] ], [ "t0281", [ "Cuckolding" ] ], [ "t0397", [ "Cuddling Naked", "Cuddling with benefits", "Erotic Massage", "Hot Oil Massages", "Massage", "Massages", "Neck Kissing/Touching" ] ], [ "t0122", [ "Daddy Daughter roleplay", "Daddy/babygirl", "Daddy/girl" ] ], [ "t0239", [ "Defilement", "Sluts" ] ], [ "subcategory-clothing-materials-objects-objects-toys", [ "Dildos", "Vibrators" ] ], [ "t0319", [ "Doggy Style" ] ], [ "t0005", [ "Enforced Bedtime", "Punishment" ] ], [ "t0267", [ "Webcams" ] ], [ "t0292", [ "Face Fucking", "Gagging/Choked by Cock" ] ], [ "t0100", [ "Feathers" ] ], [ "t0316", [ "Female Ejaculation" ] ], [ "t0386", [ "Feminization", "Sissy", "Sissy Training" ] ], [ "t0398", [ "Food Play" ] ], [ "t0404", [ "Forehead Kisses", "Kissing", "Tongue Sucking" ] ], [ "t0362", [ "Grooming" ] ], [ "t0279", [ "Group Sex" ] ], [ "t0056", [ "Hairbrush Spanking", "Slapping" ] ], [ "t0002", [ "High Protocol", "Protocol", "Rituals", "Yes Sir", "no panties rule" ] ], [ "t0043", [ "Hook Suspension" ] ], [ "t0099", [ "Ice Cubes" ] ], [ "t0131", [ "Internal Enslavement", "Master/Slave", "Old Guard Slavery", "Sexual Slavery", "slavery" ] ], [ "t0325", [ "Kneeling" ] ], [ "t0022", [ "Light Bondage", "Rope Bondage/Suspension" ] ], [ "t0278", [ "MMF Threesomes", "Two-Girl Blowjobs" ] ], [ "t0370", [ "Maid Uniforms" ] ], [ "subcategory-psychological-dynamics-mind-control", [ "Mind Control" ] ], [ "t0009", [ "Mistress/slave" ] ], [ "t0301", [ "Mistresses with Strap-Ons" ] ], [ "t0126", [ "Mommy/Boy Dynamics" ] ], [ "t0237", [ "Necks" ] ], [ "t0374", [ "Nun/Priest Play" ] ], [ "t0016", [ "Obedience Training" ] ], [ "t0271", [ "Online Play", "Phone Sex" ] ], [ "t0282", [ "Polyamory" ] ], [ "t0222", [ "Pregnant" ] ], [ "t0335", [ "Prostate Massage", "Prostate Milking" ] ], [ "subcategory-psychological-dynamics-humiliation", [ "Public Humiliation", "Verbal Humiliation and Degradation" ] ], [ "subcategory-body-focus-appearance-body-type", [ "Red Heads", "Small Tits" ] ], [ "t0007", [ "Role Play" ] ], [ "t0353", [ "Rough Sex" ] ], [ "subcategory-bondage-restriction-sensory", [ "Sensation Play", "Sensual Play", "Sensualism" ] ], [ "t0277", [ "Sensual/slave dances" ] ], [ "t0359", [ "Service" ] ], [ "t0360", [ "Service-oriented submission" ] ], [ "t0212", [ "Shaving" ] ], [ "t0236", [ "Slave Tattoos" ] ], [ "t0322", [ "Sleepy Sex" ] ], [ "t0089", [ "Sounds", "Urethral Sounds" ] ], [ "t0130", [ "Speculums" ] ], [ "t0026", [ "Spreader Bars" ] ], [ "t0109", [ "Sweat" ] ], [ "t0345", [ "Toilet" ] ], [ "t0243", [ "human furniture" ] ], [ "t0358", [ "WolfPlay" ] ], [ "t0290", [ "Waking up to oral sex" ] ], /* Batch #3 — Build 2026-10-18_0302 (2026-10-18): 28 aliases from the server unmapped_fetishes table. */ [ "t0298", [ "Anal Training" ] ], [ "t0084", [ "CBT" ] ], [ "t0070", [ "Clamps and Clips" ] ], [ "t0134", [ "Consensual Nonconsent Play" ] ], [ "t0129", [ "Doctor/Nurse Play" ] ], [ "t0085", [ "Fire Cupping" ] ], [ "t0307", [ "Fucking Machines" ] ], [ "t0252", [ "Sadomasochism" ] ], [ "t0376", [ "Seduction" ] ], [ "t0213", [ "Toes and Feet" ] ], [ "t0312", [ "Urethral Fucking" ] ], [ "t0311", [ "Vacuum pumping" ] ], [ "t0309", [ "Vaginal Stretching" ] ], [ "t0291", [ "Ass Licking" ] ], [ "t0165", [ "Ballet Boots/Shoes" ] ], [ "t0251", [ "Emotional Masochism" ] ], [ "t0293", [ "Face sitting/smothering" ] ], [ "t0242", [ "Micropenises", "tiny cocks" ] ], [ "t0002", [ "Sir" ] ], [ "t0338", [ "pee inside Me", "piss" ] ], [ "t0331", [ "Threating to forcibly impregnate her" ] ], [ "t0264", [ "being valued" ] ], [ "subcategory-clothing-materials-objects-masks-headwear", [ "Masks" ] ], [ "subcategory-bondage-restriction-restraints", [ "Restraints" ] ], [ "subcategory-clothing-materials-objects-footwear", [ "Shoes" ] ], [ "subcategory-psychological-dynamics-humiliation", [ "human ashtray" ] ], /* Batch #4 — Importer rework (2026-11-04): decided mappings only. Edge Play → the Edge play topic (never Edging); the five formerly unplaced fetishes at their decided homes — Morning Sex, Bellydancing, Formiphilia (plus FetLife's own "Forniphilia" spelling), Graphoerotica as topics, and Toy Making at its decided CATEGORY home (broad hit, never silently rated). Guarded like every batch: existing keys win, so the catalog-seeded entries for the four topics are untouched. */ [ "t0334", [ "Edge Play" ] ], [ "t0290", [ "Morning Sex" ] ], [ "t0277", [ "Bellydancing" ] ], [ "t0120", [ "Formiphilia", "Forniphilia" ] ], [ "t0265", [ "Graphoerotica" ] ], [ "cat-clothing-materials-objects", [ "Toy Making" ] ] ].forEach(([e, t]) => t.forEach(t => {
            const n = ck(t), id = migrateNodeKey(e);
            n && (fln[n] = fln[n] || t), n && !fk[n] && (fk[n] = {
                id: id,
                direction: "both",
                uncertain: !0
            });
        }));
        // ---- FetLife importer alias map — SECTION END ----
        // (The next alias batch goes at the end of the guarded
        // batch table above, inside this section — do not scatter
        // alias writes elsewhere in the file.)
        const bk = [ {
            pattern: /\b(?:spit|spitting|spat)\b/,
            id: "t0341"
        }, {
            pattern: /\b(?:insult|insults|insulting|name calling|verbal degradation)\b/,
            id: "t0239"
        }, {
            pattern: /\b(?:face slap|face slapping|slap in the face)\b/,
            id: "t0056"
        }, {
            pattern: /\b(?:breath play|breath control|choking|strangulation)\b/,
            id: "t0097"
        }, {
            pattern: /\b(?:knife play|blade play)\b/,
            id: "t0245"
        }, {
            pattern: /\b(?:hot wax|waxing)\b/,
            id: "t0098"
        }, {
            pattern: /\b(?:ice play|cold play)\b/,
            id: "t0099"
        }, {
            pattern: /\b(?:chasing|pursuit play)\b/,
            id: "t0352"
        } ], vk = e.byId("converterDialog"), wk = e.byId("converterTitle"), kk = e.byId("converterSubtitle"), xk = e.byId("converterInstructions"), Sk = e.byId("converterInputLabel"), $k = e.byId("converterInput"), Ek = e.byId("converterPasteTools"), Ak = e.byId("converterActions"), Ck = e.byId("converterPreview"), Mk = e.byId("converterPreviewSummary"), Ik = e.byId("converterWarnings"), Pk = e.byId("converterStatus"), Lk = e.byId("applyConverter"), Tk = e.byId("chooseConverterFile"), Fk = e.byId("converterFileInput"), Nk = e.byId("converterMode"), _k = e.byId("takeConverterTest"), Dk = e.byId("pasteConverterResults"), Rk = e.byId("interactiveTest"), Ok = e.byId("testQuestions"), Bk = e.byId("testProgress"), jk = e.byId("testHeading"), qk = e.byId("testSourceNote"), Hk = e.byId("submitChecklistRow"), Wk = e.byId("submitChecklistResults"), Uk = e.byId("previewConverter");
        let Gk = null, Kk = null, zk = null, Vk = null, Yk = null, Xk = {}, Zk = 0, Qk = 0, ktPage = 0;
        let sxFlFields = null;
        function Jk() {
            return Zk ? Math.max(0, Math.floor((Date.now() - Zk) / 1e3)) : 0;
        }
        function ex() {
            t.clear(Qk), Qk = 0, Zk = 0;
        }
        function tx() {
            Zk || (Zk = Date.now(), Ex(), Qk = t.setInterval(Ex, 1e3));
        }
        const nx = {
            kinktest: "Pleasure Control: 48% Dom, 36% sub Restraint: 0% Dom, 70% sub Roleplay: 19% Dom, 22% sub Degradation: 4% Dom, 22% sub Pain: 8% Dom, 3% sub Sensation: 0% Dom, 0% sub Edge Play: 0% Dom, 0% sub Potty Play: 0% Dom, 0% sub",
            checklist: "",
            fetlife: "Into: Spanking — Everything to do with it, Rope bondage — Giving, Leather — Wearing Curious about: Pet play — Receiving Soft limits: Temperature play Hard limits: Choking",
            bdsmtest: "100% Dominant 82% Switch 64% Rigger 41% Rope bunny 18% Primal (Prey)"
        }, fetlifeSampleHtml = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>SampleSwitch - FetLife</title>\n</head>\n<body>\n<div class=\"profile\">\n<h1>SampleSwitch</h1>\n<p>A sample FetLife profile page, saved with Save Page As, so you can try the importer without using your own page.</p>\n<h2>Fetishes</h2>\n<p>Into</p>\n<ul>\n<li><a href=\"https://fetlife.com/fetishes/101\">Spanking</a></li>\n<li><a href=\"https://fetlife.com/fetishes/102\">Chastity</a></li>\n<li><a href=\"https://fetlife.com/fetishes/103\">Edging</a></li>\n<li><a href=\"https://fetlife.com/fetishes/104\">Leather</a></li>\n<li><a href=\"https://fetlife.com/fetishes/105\">Flogging</a></li>\n<li><a href=\"https://fetlife.com/fetishes/106\">Gags</a></li>\n<li><a href=\"https://fetlife.com/fetishes/107\">Exhibitionism</a></li>\n<li><a href=\"https://fetlife.com/fetishes/108\">Humiliation</a></li>\n<li><a href=\"https://fetlife.com/fetishes/109\">Suspension</a></li>\n<li><a href=\"https://fetlife.com/fetishes/110\">Voyeurism</a></li>\n<li><a href=\"https://fetlife.com/fetishes/111\">Handcuffs</a></li>\n<li><a href=\"https://fetlife.com/fetishes/112\">Omorashi</a></li>\n</ul>\n<p>Curious</p>\n<ul>\n<li><a href=\"https://fetlife.com/fetishes/201\">Tickling</a></li>\n<li><a href=\"https://fetlife.com/fetishes/202\">Degradation</a></li>\n<li><a href=\"https://fetlife.com/fetishes/203\">Crossdressing</a></li>\n<li><a href=\"https://fetlife.com/fetishes/204\">Biting</a></li>\n<li><a href=\"https://fetlife.com/fetishes/205\">Pegging</a></li>\n<li><a href=\"https://fetlife.com/fetishes/206\">Forniphilia</a></li>\n<li><a href=\"https://fetlife.com/fetishes/207\">Spectrophilia</a></li>\n</ul>\n</div>\n</body>\n</html>", ix = [ [ "Handcuffing your partner, or tying their hands", "t0025", "give" ], [ "Requiring your partner to avoid going to the toilet until they are desperate", "cat-fluids-messy-play", "give" ], [ "Being pleasured until you can't handle it any more or being forced to orgasm many times", "t0326", "receive" ], [ "Making your partner wear and use a nappy", "t0185", "give" ], [ "Preventing your partner from orgasming until they beg", "t0327", "give" ], [ "Calling your partner names that imply authority like “master” or “daddy”", "t0131", "receive" ], [ "Cutting your partner with a blade, causing bleeding but no serious or permanent injury", "t0096", "give" ], [ "Peeing on your partner", "t0338", "give" ], [ "Causing pain by directly hitting or using implements on your partner's genitals", "t0096", "give" ], [ "Being peed on", "t0338", "receive" ], [ "Being stimulated by electricity, such as from a toy like the violet wand", "t0101", "receive" ], [ "Being denied any form of sexual stimulation for a period of time", "t0327", "receive" ], [ "Bringing your partner to orgasm, then ceasing stimulation to diminish the pleasure", "t0326", "give" ], [ "Hitting your partner with a crop, cane, or whip hard enough to bruise", "cat-impact-pain-body-modification", "give" ], [ "Being restrained by your partner's body, for example being held down on a bed", "t0353", "receive" ], [ "Being treated like a pet", "t0136", "receive" ], [ "Gagging your partner with a ball gag, O-ring gag, or similar", "t0035", "give" ], [ "Having sex or masturbating in a room visible from the street, with the curtains open", "t0270", "give" ], [ "Pulling your partner's hair hard enough to hurt", "t0093", "give" ], [ "Gagging your partner with an ordinary gag", "t0035", "give" ], [ "Having your partner use needles or pins to penetrate your skin", "t0074", "receive" ], [ "Being made to wear and use a nappy", "t0185", "receive" ], [ "Having pressure put on your neck, making it difficult but not impossible to breathe", "t0097", "receive" ], [ "Being cut with a blade, causing bleeding but no serious or permanent injury", "t0096", "receive" ], [ "Being spanked with a bare hand", "t0056", "receive" ], [ "Treating your partner like a child", "t0123", "give" ], [ "Being called names that imply authority like “master” or “daddy”", "t0131", "give" ], [ "Restraining your partner with your body, for example by holding them down on a bed", "t0353", "give" ], [ "Having sex or masturbating in a public place where people could come across you", "t0269", "give" ], [ "Observing someone undressing without their knowledge", "t0270", "give" ], [ "Putting pressure on your partner's neck, making it difficult but not impossible to breathe", "t0097", "give" ], [ "Putting clamps or clothes pegs on your partner's nipples or elsewhere", "t0070", "give" ], [ "Acting out a scene in which your partner pretends to rape you", "t0134", "receive" ], [ "Acting out a scene in which you pretend to rape your partner", "t0134", "give" ], [ "Having nails dug into your buttocks, or your back scratched, causing pain without breaking skin", "t0354", "receive" ], [ "Digging your nails into your partner's buttocks, or scratching their back, causing pain without breaking skin", "t0354", "give" ], [ "Being choked so that you cannot breathe, causing you to feel faint or lose consciousness", "t0097", "receive" ], [ "Forcing your partner to interact with faeces", "cat-fluids-messy-play", "give" ], [ "Being gagged with an ordinary gag", "t0035", "receive" ], [ "Choking your partner so they cannot breathe, causing faintness or unconsciousness", "t0097", "give" ], [ "Denying your partner any form of sexual stimulation for a period of time", "t0327", "give" ], [ "Being hit with a crop, cane, or whip hard enough to bruise", "cat-impact-pain-body-modification", "receive" ], [ "Being handcuffed or having your hands tied", "t0025", "receive" ], [ "Having sex or masturbating in front of other people at an orgy or as part of a show", "t0270", "give" ], [ "Being tied up so you can hardly move at all", "t0040", "receive" ], [ "Using needles or pins to penetrate your partner's skin", "t0074", "give" ], [ "Being prevented from orgasming until you beg", "t0327", "receive" ], [ "Having clamps or clothes pegs put on your nipples or elsewhere", "t0070", "receive" ], [ "Being caused pain by your partner hitting or using implements on your genitals", "t0096", "receive" ], [ "Being made to serve your partner as a cleaner or retail worker might", "t0360", "receive" ], [ "Using electricity, such as a violet wand, to stimulate your partner", "t0101", "give" ], [ "Being treated like a child", "t0123", "receive" ], [ "Tying or cuffing your partner to a bed or other object", "t0042", "give" ], [ "Having your partner serve you as a cleaner or retail worker might", "t0360", "give" ], [ "Being called demeaning words like “slut,” “whore,” “bitch,” or “sissy”", "t0240", "receive" ], [ "Observing someone having sex or masturbating in their own home, without their knowledge", "t0270", "give" ], [ "Having your hair pulled hard enough to hurt", "t0093", "receive" ], [ "Being tied or cuffed to a bed or other object", "t0042", "receive" ], [ "Having a blade used on you to instil fear, without causing bleeding", "t0245", "receive" ], [ "Spanking your partner with a bare hand", "t0056", "give" ], [ "Pleasuring your partner until they can't handle it or forcing them to orgasm many times", "t0326", "give" ], [ "Overhearing someone having sex or masturbating", "t0270", "give" ], [ "Observing someone having sex or masturbating as part of a sex show", "t0266", "give" ], [ "Calling your partner demeaning words like “slut,” “whore,” “bitch,” or “sissy”", "t0240", "give" ], [ "Using a blade on your partner to instil fear, without causing bleeding", "t0245", "give" ], [ "Tying your partner up so they can hardly move at all", "t0040", "give" ], [ "Being required to avoid going to the toilet until you are desperate", "cat-fluids-messy-play", "receive" ], [ "Being forced to interact with faeces", "cat-fluids-messy-play", "receive" ], [ "Being gagged with a ball gag, O-ring gag, or similar", "t0035", "receive" ], [ "Being brought to orgasm, with stimulation stopped at the right moment to diminish pleasure", "t0326", "receive" ], [ "Treating your partner like a pet", "t0136", "give" ] ].map((e, t) => ({
            number: t + 1,
            question: e[0],
            id: e[1],
            direction: e[2]
        })), ax = [ "Anal sex", "Beating (hands)", "Beating (padded clubs)", "Being bitten", "Being serviced (sexual)", "Blindfolds", "Body paint", "Bondage (heavy/suspension)", "Bondage (intricate/Japanese style)", "Bondage (light)", "Bruises", "Butt plugs", "Cages (locked inside of)", "Caning", "Chains", "Chastity belts", "Clothespins", "Cock rings/straps", "Cock worship", "Corsets", "Cross-dressing", "Cuffs (leather/metal)", "Dildos", "Double penetration", "Erotic dancing", "Exhibitionism", "Eye contact restrictions", "Face slapping", "Fisting", "Flogging", "Following orders", "Food play", "Foot worship", "Gags (cloth/tape)", "Genital sex", "Hair pulling", "Hairbrush spankings", "Hand jobs (giving)", "Hand jobs (receiving)", "Head (giving)", "Head (receiving)", "High heels", "Hot waxing", "Ice cubes", "Kneeling", "Leather clothing", "Leather restraints", "Lingerie (wearing)", "Manacles & Irons", "Manicures (giving)", "Manicures (receiving)", "Marks (giving)", "Marks (receiving)", "Massage (giving)", "Massage (receiving)", "Modeling for erotic photos", "Nipple play", "Oral/anal play (rimming)", "Orgasm denial", "Outdoor sex", "Over-the-knee spanking", "Pain (mild to severe)", "Phone sex", "Pinching", "Play kidnapping", "Punishment scene", "Pussy/cock whipping/spanking", "Riding crops", "Rubber/latex clothing", "Saran wrapping", "Scenes (prison, religious, etc.)", "Scratching (giving)", "Scratching (receiving)", "Serving as a maid/butler", "Shaving", "Shoe/boot worship", "Skinny-dipping", "Slutty clothing", "Spanking", "Spreader bars", "Standing in corner", "Stocks", "Strap-on dildos", "Swallowing semen", "Swapping (with one other couple)", "Swinging (multiple couples)", "Tattooing", "Teasing", "TENS Unit", "Thumbcuffs (metal)", "Tickling", "Triple penetration", "Uniforms", "Vibrator on genitals", "Video (recordings of you)", "Video (watching others)", "Violet wand", "Voyeurism (watching others)", "Wearing symbolic jewelry", "Whips", "Wooden paddles", "Wrestling" ], axCat = { "Anal sex": "Getting started", "Beating (hands)": "Getting started", "Beating (padded clubs)": "Getting started", "Being bitten": "Getting started", "Being serviced (sexual)": "Getting started", "Blindfolds": "Getting started", "Body paint": "Getting started", "Bondage (heavy/suspension)": "Bondage", "Bondage (intricate/Japanese style)": "Bondage", "Bondage (light)": "Bondage", "Bruises": "Bondage", "Butt plugs": "Bondage", "Cages (locked inside of)": "Bondage", "Caning": "Caning", "Chains": "Caning", "Chastity belts": "Caning", "Clothespins": "Caning", "Cock rings/straps": "Caning", "Cock worship": "Cock worship", "Corsets": "Cock worship", "Cross-dressing": "Cock worship", "Cuffs (leather/metal)": "Cock worship", "Dildos": "Cock worship", "Double penetration": "Cock worship", "Erotic dancing": "Cock worship", "Exhibitionism": "Cock worship", "Eye contact restrictions": "Cock worship", "Face slapping": "Face play", "Fisting": "Face play", "Flogging": "Face play", "Following orders": "Face play", "Food play": "Face play", "Foot worship": "Foot worship", "Gags (cloth/tape)": "Foot worship", "Genital sex": "Foot worship", "Hair pulling": "Foot worship", "Hairbrush spankings": "Foot worship", "Hand jobs (giving)": "Foot worship", "Hand jobs (receiving)": "Foot worship", "Head (giving)": "Foot worship", "Head (receiving)": "Foot worship", "High heels": "Foot worship", "Hot waxing": "Hot waxing", "Ice cubes": "Hot waxing", "Kneeling": "Hot waxing", "Leather clothing": "Hot waxing", "Leather restraints": "Hot waxing", "Lingerie (wearing)": "Hot waxing", "Manacles & Irons": "Hot waxing", "Manicures (giving)": "Hot waxing", "Manicures (receiving)": "Hot waxing", "Marks (giving)": "Hot waxing", "Marks (receiving)": "Hot waxing", "Massage (giving)": "Hot waxing", "Massage (receiving)": "Hot waxing", "Modeling for erotic photos": "Hot waxing", "Nipple play": "Nipple play", "Oral/anal play (rimming)": "Nipple play", "Orgasm denial": "Nipple play", "Outdoor sex": "Nipple play", "Over-the-knee spanking": "Nipple play", "Pain (mild to severe)": "Nipple play", "Phone sex": "Nipple play", "Pinching": "Nipple play", "Play kidnapping": "Nipple play", "Punishment scene": "Nipple play", "Pussy/cock whipping/spanking": "Nipple play", "Riding crops": "Nipple play", "Rubber/latex clothing": "Nipple play", "Saran wrapping": "Nipple play", "Scenes (prison, religious, etc.)": "Scenes", "Scratching (giving)": "Scenes", "Scratching (receiving)": "Scenes", "Serving as a maid/butler": "Scenes", "Shaving": "Scenes", "Shoe/boot worship": "Scenes", "Skinny-dipping": "Scenes", "Slutty clothing": "Scenes", "Spanking": "Spanking", "Spreader bars": "Spanking", "Standing in corner": "Spanking", "Stocks": "Spanking", "Strap-on dildos": "Spanking", "Swallowing semen": "Fluids", "Swapping (with one other couple)": "Fluids", "Swinging (multiple couples)": "Group play", "Tattooing": "Tattooing", "Teasing": "Teasing", "TENS Unit": "Teasing", "Thumbcuffs (metal)": "Restraints", "Tickling": "Restraints", "Triple penetration": "Restraints", "Uniforms": "Uniforms", "Vibrator on genitals": "Uniforms", "Video (recordings of you)": "Uniforms", "Video (watching others)": "Watching", "Violet wand": "Watching", "Voyeurism (watching others)": "Voyeurism", "Wearing symbolic jewelry": "Symbols", "Whips": "Whips", "Wooden paddles": "Paddles", "Wrestling": "Wrestling" }, rx = [ [ /^69$/, "t0317" ], [ /age play|treated like a child/, "t0123" ], [ /anal sex/, "t0297" ], [ /analingus|rimming/, "t0294" ], [ /ball stretching|genital torture|pain/, "t0097" ], [ /being filmed|photographed/, "t0267" ], [ /being watched/, "t0266" ], [ /biting|scratching/, "t0354" ], [ /blindfold|sensory deprivation/, "t0103" ], [ /blood play|scat|sploshing|menstruation/, "cat-fluids-messy-play" ], [ /bondage/, "cat-bondage-restriction" ], [ /bootblack|service/, "t0359" ], [ /bratting|punishment/, "t0005" ], [ /breath play/, "t0097" ], [ /butt plug/, "t0193" ], [ /cages|confinement|suspension/, "t0040" ], [ /caning/, "t0067" ], [ /chastity/, "t0328" ], [ /worship/, "t0237" ], [ /cockrings|sex toys|strap-ons/, "t0306" ], [ /collars/, "t0003" ], [ /consensual non-consent/, "t0134" ], [ /costumes|cross dressing|gender play/, "t0178" ], [ /cuckold/, "t0281" ], [ /cuddling|kissing|massage/, "t0397" ], [ /tantra|breathwork|energy play/, "t0110" ], [ /cunnilingus|fellatio/, "t0291" ], [ /degradation/, "t0239" ], [ /dirty talk|moans|sexting/, "t0263" ], [ /double penetration|triple penetration|vaginal penetration|fingering|frottage/, "t0306" ], [ /e-stim/, "t0101" ], [ /edge play/, "t0334" ], [ /edging|teasing/, "t0329" ], [ /ejaculate|swallowing/, "t0315" ], [ /enemas|piss play/, "t0338" ], [ /eye contact/, "t0258" ], [ /face fucking/, "t0292" ], [ /facesitting/, "t0293" ], [ /fisting/, "t0310" ], [ /flogging/, "t0062" ], [ /food play/, "cat-fluids-messy-play" ], [ /foot play/, "t0213" ], [ /furries/, "t0383" ], [ /g-spot/, "t0304" ], [ /gags/, "t0035" ], [ /group sex|sex parties|strip clubs/, "t0279" ], [ /hair pulling/, "t0093" ], [ /hoods/, "t0191" ], [ /humiliation play/, "t0240" ], [ /humiliation/, "subcategory-psychological-dynamics-humiliation" ], [ /incest roleplay|kidnapping|role play/, "cat-roleplay-identity" ], [ /kicking|punching|slapping|temporary marks/, "t0096" ], [ /knife play/, "t0245" ], [ /leather/, "t0153" ], [ /lingerie/, "t0181" ], [ /medical play/, "t0129" ], [ /masturbation/, "t0268" ], [ /nipple clamps/, "t0070" ], [ /nipple/, "t0220" ], [ /objectification/, "t0243" ], [ /orgasm control/, "t0326" ], [ /orgasm denial/, "t0327" ], [ /paddles/, "t0069" ], [ /pegging/, "t0301" ], [ /piercing/, "t0074" ], [ /phone sex|porn/, "t0268" ], [ /prostate/, "t0299" ], [ /race play/, "t0127" ], [ /riding crops?/, "t0068" ], [ /whips?/, "t0064" ], [ /rubber|latex/, "t0152" ], [ /shaving/, "t0362" ], [ /smoking/, "t0119" ], [ /spanking/, "t0056" ], [ /spreader/, "t0026" ], [ /sex in public/, "t0269" ], [ /sex magic|sacred sexuality|ritual kink|spiritual play/, "t0367" ], [ /threesome/, "t0278" ], [ /tickling/, "t0100" ], [ /tit-fucking/, "t0220" ], [ /tribadism/, "t0306" ], [ /watching others/, "t0266" ], [ /wax/, "t0098" ], [ /wrestling/, "t0353" ], [ /beating/, "t0096" ], [ /bitten/, "t0354" ], [ /serviced/, "t0359" ], [ /bruises/, "t0096" ], [ /chains/, "cat-bondage-restriction" ], [ /clothespins/, "t0097" ], [ /corsets/, "t0181" ], [ /cock rings?/, "t0306" ], [ /thumbcuffs/, "cat-bondage-restriction" ], [ /cuffs/, "cat-bondage-restriction" ], [ /dildos/, "t0306" ], [ /erotic dancing/, "t0279" ], [ /exhibitionism/, "t0266" ], [ /hairbrush/, "t0096" ], [ /hand jobs/, "t0268" ], [ /\bhead\b/, "t0291" ], [ /high heels/, "t0213" ], [ /ice cubes|ice play/, "t0098" ], [ /kneeling/, "t0359" ], [ /manacles|irons/, "cat-bondage-restriction" ], [ /manicures|pedicures/, "t0359" ], [ /marks/, "t0096" ], [ /erotic photos|modeling/, "t0267" ], [ /outdoor sex/, "t0269" ], [ /pinching/, "t0097" ], [ /saran|mummification/, "t0040" ], [ /scenes/, "cat-roleplay-identity" ], [ /maid|butler/, "t0359" ], [ /skinny/, "t0266" ], [ /slutty/, "t0181" ], [ /corner/, "t0005" ], [ /stocks/, "cat-bondage-restriction" ], [ /swapping|swinging/, "t0279" ], [ /tattoo/, "t0074" ], [ /tens\b/, "t0101" ], [ /uniforms/, "t0178" ], [ /vibrator/, "t0306" ], [ /recordings/, "t0267" ], [ /violet/, "t0101" ], [ /jewelry/, "t0003" ] ];
        function ox(e) {
            const t = function(e) {
                const t = ni(e), n = ck(t);
                if (gk[n]) return gk[n];
                const i = ck(t.replace(/\([^)]*\)/g, " "));
                return gk[i] || null;
            }(e);
            if (t) return t;
            const n = ck(e), i = rx.find(e => e[0].test(n));
            return i ? {
                id: i[1],
                uncertain: !0
            } : null;
        }
        function sx(e, t, n, i) {
            Ke.has(t) && (e[t] || (e[t] = {
                give: [],
                receive: []
            }), e[t][n].push(Math.max(-100, Math.min(100, i))));
        }
        function lx(e, t) {
            const n = {};
            return Object.entries(e).forEach(([e, t]) => {
                const i = {};
                [ "give", "receive" ].forEach(e => {
                    t[e].length && (i[e] = Math.round(t[e].reduce((e, t) => e + t, 0) / t[e].length));
                }), Object.keys(i).length && (n[e] = i);
            }), Object.assign({
                ratings: n,
                annotations: {}
            }, t);
        }
        function cx(e) {
            const t = ni(String(e || "").replace(/^[-*•·\d.)\s]+/, "").replace(/\s+(?:fetish|kink)$/i, "").trim()), n = ck(t);
            if (fk[n]) return fk[n];
            const i = ck(t.replace(/\([^)]*\)/g, " "));
            if (fk[i]) return fk[i];
            const o = [ i.replace(/\s+/g, ""), i.endsWith("es") ? i.slice(0, -2) : i.endsWith("s") ? i.slice(0, -1) : i + "s" ];
            for (const e of o) if (e && e !== i && fk[e]) return fk[e];
            const a = bk.find(e => e.pattern.test(i));
            if (a) return {
                id: a.id,
                direction: a.direction || "both",
                uncertain: !0,
                specific: !0
            };
            const r = rx.find(e => e[0].test(i));
            return r ? {
                id: r[1],
                direction: "both",
                uncertain: !0
            } : null;
        }
        // Build 2026-10-18_1624 — read-only data feed for the FetLife
        // mapping viewer (shell dialog #fetlifeMapDialog, opened from the
        // FetLife load dialog or with Ctrl+Shift+M). rows() returns the
        // full fk table with each target resolved to its catalog label
        // and Category › Subcategory › Topic path; lookup(term) runs the
        // exact importer resolution (cx + pk), so the viewer's chooser
        // shows and highlights what an import would actually do with a
        // typed FetLife name — including broad (category/subcategory)
        // targets and pattern-only matches, which have no table row.
        const flm = {
            rowsCache: null,
            nodeInfo: function(id) {
                if (!id) return {
                    label: "",
                    path: "",
                    kind: ""
                };
                if (isCatId(id)) {
                    const l = mx(id);
                    return {
                        label: l,
                        path: l,
                        kind: "Category"
                    };
                }
                const n = Xn(id);
                if (!n) {
                    const l = mx(id);
                    return {
                        label: l,
                        path: l,
                        kind: "Topic"
                    };
                }
                if ("Subcategory" === n.kind) return {
                    label: n.label,
                    path: n.branch + " › " + n.label,
                    kind: "Subcategory"
                };
                const parts = [ n.branch ];
                if (n.parentId) {
                    const p = Xn(n.parentId);
                    p && parts.push(p.label);
                }
                parts.push(n.label);
                return {
                    label: n.label,
                    path: parts.join(" › "),
                    kind: "Topic"
                };
            },
            rows: function() {
                if (flm.rowsCache) return flm.rowsCache;
                const out = Object.keys(fk).map(k => {
                    const m = fk[k], info = flm.nodeInfo(m.id);
                    return {
                        key: k,
                        name: fln[k] || k,
                        id: m.id,
                        label: info.label,
                        path: info.path,
                        kind: info.kind,
                        direction: m.direction || "both",
                        uncertain: !!m.uncertain
                    };
                });
                out.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
                return flm.rowsCache = out, out;
            },
            lookup: function(term) {
                const M = cx(term);
                if (!M) return null;
                let key = null;
                for (const k of Object.keys(fk)) if (fk[k] === M) {
                    key = k;
                    break;
                }
                const I = pk(M, term, {});
                if (!I) {
                    const info = flm.nodeInfo(M.id);
                    return {
                        key: key,
                        pattern: !key,
                        id: M.id,
                        label: info.label,
                        path: info.path,
                        kind: info.kind,
                        child: null,
                        direction: M.direction || "both",
                        uncertain: !!M.uncertain,
                        broad: !0
                    };
                }
                const info = flm.nodeInfo(I.id);
                return {
                    key: key,
                    pattern: !key,
                    id: I.id,
                    label: I.child ? hk(I) : info.label,
                    path: info.path,
                    kind: info.kind,
                    child: I.child ? I.child.label : null,
                    direction: M.direction || "both",
                    uncertain: !!M.uncertain,
                    broad: !1
                };
            }
        };
        // Build 2026-10-18_1658 — FetLife mapping EDITOR support. The
        // shell dialog (#fetlifeMapDialog) is now a full editor, not a
        // read-only viewer: targets() enumerates every valid target
        // (all 18 categories, their subcategories, and every topic) for
        // the editor's target picker; setMapping()/removeMapping()
        // rewrite the live fk table (and the matching gk entry, so
        // saved-page imports agree) for THIS session, so a FetLife
        // import run after editing uses the edited mappings; the first
        // edit snapshots the shipped tables and editedRows() diffs
        // against that snapshot (powering the edited count, the edited
        // badges, the downloadable edits file, and Reset). Nothing is
        // persisted: a reload restores the shipped table.
        flm.targetsCache = null;
        flm.targets = function() {
            if (flm.targetsCache) return flm.targetsCache;
            const out = [], seen = {};
            try {
                h.forEach(cat => {
                    const storedCatId = catId(cat.name);
                    if (!seen[storedCatId]) { seen[storedCatId] = 1; out.push({ id: storedCatId, label: cat.name, path: cat.name, kind: "Category" }); }
                    (cat.subcategories || []).forEach(sub => {
                        const sid = Un(cat.name, sub.name);
                        if (!seen[sid]) { seen[sid] = 1; out.push({ id: sid, label: sub.name, path: cat.name + " › " + sub.name, kind: "Subcategory" }); }
                    });
                    (cat.topics || []).forEach(tn => {
                        let tid = null;
                        try { tid = Wn(tn); } catch (e) { tid = null; }
                        if (!tid || seen[tid]) return;
                        seen[tid] = 1;
                        const info = flm.nodeInfo(tid);
                        out.push({ id: tid, label: info.label || tn, path: info.path || (cat.name + " › " + tn), kind: "Topic" });
                    });
                });
            } catch (e) { __sxErrLog("app", e); }
            const order = { Category: 0, Subcategory: 1, Topic: 2 };
            out.sort((a, b) => (order[a.kind] - order[b.kind]) || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
            return flm.targetsCache = out, out;
        };
        flm.origFk = null;
        flm.origGk = null;
        flm.origFln = null;
        flm.snap = function() {
            if (flm.origFk) return;
            flm.origFk = {}; Object.keys(fk).forEach(k => { flm.origFk[k] = Object.assign({}, fk[k]); });
            flm.origGk = {}; Object.keys(gk).forEach(k => { flm.origGk[k] = Object.assign({}, gk[k]); });
            flm.origFln = Object.assign({}, fln);
        };
        flm.setMapping = function(name, id, direction) {
            const key = ck(String(name || "").trim());
            if (!key || !id) return null;
            flm.snap();
            fk[key] = { id: id, direction: direction || "both", uncertain: !1, specific: !0 };
            if (gk[key]) gk[key] = { id: id, uncertain: !1 };
            fln[key] = fln[key] || String(name).trim();
            flm.rowsCache = null;
            return key;
        };
        flm.removeMapping = function(name) {
            const key = ck(String(name || "").trim());
            if (!key || !fk[key]) return;
            flm.snap();
            delete fk[key];
            if (gk[key]) delete gk[key];
            flm.rowsCache = null;
        };
        flm.editedRows = function() {
            if (!flm.origFk) return [];
            const out = [], keys = {};
            Object.keys(flm.origFk).forEach(k => { keys[k] = 1; });
            Object.keys(fk).forEach(k => { keys[k] = 1; });
            Object.keys(keys).forEach(k => {
                const before = flm.origFk[k] || null, now = fk[k] || null;
                const changed = (!before !== !now) || (before && now && (before.id !== now.id || (before.direction || "both") !== (now.direction || "both")));
                if (!changed) return;
                const src = now || before, info = flm.nodeInfo(src.id);
                out.push({
                    key: k,
                    name: fln[k] || (flm.origFln && flm.origFln[k]) || k,
                    before: before ? { id: before.id, direction: before.direction || "both" } : null,
                    now: now ? { id: now.id, direction: now.direction || "both", label: info.label, path: info.path, kind: info.kind } : null
                });
            });
            out.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
            return out;
        };
        flm.resetMappings = function() {
            if (!flm.origFk) return;
            Object.keys(fk).forEach(k => { delete fk[k]; });
            Object.keys(flm.origFk).forEach(k => { fk[k] = Object.assign({}, flm.origFk[k]); });
            Object.keys(gk).forEach(k => { delete gk[k]; });
            Object.keys(flm.origGk).forEach(k => { gk[k] = Object.assign({}, flm.origGk[k]); });
            Object.keys(fln).forEach(k => { delete fln[k]; });
            Object.keys(flm.origFln).forEach(k => { fln[k] = flm.origFln[k]; });
            flm.rowsCache = null;
        };
        window.__fetlifeMap = flm;
        function dx(e, t) {
            if (/base64/i.test(t || "")) try {
                const t = atob(e.replace(/\s+/g, "")), n = Uint8Array.from(t, e => e.charCodeAt(0));
                return new TextDecoder("utf-8").decode(n);
            } catch (t) {
                return e;
            }
            if (/quoted-printable/i.test(t || "")) {
                const t = e.replace(/=\r?\n/g, ""), n = [];
                for (let e = 0; e < t.length; e++) if ("=" === t[e] && /^[0-9a-f]{2}$/i.test(t.slice(e + 1, e + 3))) n.push(parseInt(t.slice(e + 1, e + 3), 16)), 
                e += 2; else {
                    const i = t.charCodeAt(e);
                    i < 256 ? n.push(i) : n.push(...(new TextEncoder).encode(t[e]));
                }
                try {
                    return new TextDecoder("utf-8").decode(Uint8Array.from(n));
                } catch (e) {
                    return t;
                }
            }
            return e;
        }
        function ux(e) {
            if (!/^mime-version:/im.test(e) || !/^content-type:\s*multipart\/related/im.test(e)) return null;
            const t = ((e.match(/^([\s\S]*?)\r?\n\r?\n/) || [])[1] || "").match(/boundary\s*=\s*(?:"([^"]+)"|([^;\r ]+))/i), n = t && (t[1] || t[2] || "").trim();
            if (!n) return null;
            const i = [];
            return e.split("--" + n).forEach(e => {
                const t = e.match(/^\s*([\s\S]*?)\r?\n\r?\n([\s\S]*)$/);
                if (!t) return;
                const n = t[1], a = (n.match(/^content-type:\s*([^;\r ]+)/im) || [])[1] || "", r = (n.match(/^content-transfer-encoding:\s*([^\r ]+)/im) || [])[1] || "", o = (n.match(/^content-location:\s*([^\r ]+)/im) || [])[1] || "";
                /^text\/html/i.test(a) && i.push({
                    html: dx(t[2].replace(/\r?\n--$/, ""), r),
                    location: o
                });
            }), i.length ? (i.find(e => /fetish/i.test(e.location)) || i[0]).html : null;
        }
        function px(e) {
            const t = Boolean(ux(e)) || /<(?:html|body|main|section|article|div|li|tr|p|h[1-6])\b/i.test(e), n = function(e) {
                const t = ux(e) || e;
                if (!/<(?:html|body|main|section|article|div|li|tr|p|h[1-6])\b/i.test(t)) return t;
                const n = (new DOMParser).parseFromString(t, "text/html");
                n.querySelectorAll("script,style,noscript,svg,nav,header,footer,form").forEach(e => e.remove()), 
                n.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(e => {
                    const t = String(e.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().match(/^(?:my\s+)?(fetishes?|kinks?)\b/i);
                    t && (e.textContent = /^kink/i.test(t[1]) ? "Kinks" : "Fetishes");
                }), n.querySelectorAll("a[href]").forEach(e => {
                    const t = (e.getAttribute("href") || "").trim();
                    "fetishes" === ck(e.textContent || "") && /^(?:https?:\/\/(?:www\.)?fetlife\.com)?\/fetishes\/?(?:[?#].*)?$/i.test(t) && e.remove();
                });
                const i = n.body.innerHTML.replace(/<h([1-6])\b[^>]*>/gi, "\nFETLIFE_SECTION_HEADING_$1 ").replace(/<\/h[1-6]>/gi, "\n").replace(/<br\b[^>]*>/gi, "\n").replace(/<a\b[^>]*>/gi, "").replace(/<\/a>/gi, "\n").replace(/<\/(?:td|th)>/gi, "\t").replace(/<\/(?:li|tr|p|div|section|article|ul|ol)>/gi, "\n");
                return (new DOMParser).parseFromString(i, "text/html").body.textContent || "";
            }(e).replace(/[^\S\n]*,[^\S\n]*FETLIFE_SECTION_HEADING_([1-6])[^\S\n]*,[^\S\n]*/gi, " FETLIFE_SECTION_HEADING_$1 "), i = n.split(/\r\n|[\r\n]/).map(e => e.replace(/\u00a0/g, " ").replace(/[^\S\n]+/g, " ").trim()).filter(Boolean).map(e => {
                const t = e.match(/^FETLIFE_SECTION_HEADING_([1-6])\s+([\s\S]+)$/i);
                return {
                    text: (t ? t[2] : e).replace(/FETLIFE_SECTION_HEADING_[1-6]/gi, " ").replace(/\s+/g, " ").replace(/^\s*,\s*|\s*,\s*$/g, "").trim(),
                    level: t ? Number(t[1]) : null
                };
            }).filter(e => e.text), a = new Set([ "edit", "into", "interests", "favorites", "favorite", "curious about", "curious", "neutral", "soft limits", "soft limit", "hard limits", "hard limit", "not into", "not interested", "fantasy only", "already tried", "giving", "as a top", "top", "receiving", "as a bottom", "bottom", "both", "switch", "giving and receiving", "giving receiving", "everything to do with it", "watching", "wearing", "watching others wear", "watching others wearing" ]), r = new Set([ "about", "about me", "activity", "activity feed", "recent activity", "pictures", "photos", "videos", "events", "events attended", "writings", "journal entries", "posts", "relationships", "relationship status", "roles", "identity", "gender", "orientation", "pronouns", "groups", "places", "questions", "friends", "followers", "following", "looking for", "kinksters", "lists", "memberships", "wall", "status" ]), o = e => {
                const t = ck(e.text).replace(/\s+\d+$/, "");
                return null !== e.level && !a.has(t) || r.has(t) || /^(?:latest\s+)?(?:pictures?|photos?|videos?|writings?)(?:\s*\(\d+\))?\s*:?$/.test(t);
            }, s = /^(?:my\s+)?(?:fetishes?|kinks?)(?:\s*\([^\r )]*\))?\s*:?$/i, l = [];
            if (i.forEach((e, t) => {
                s.test(e.text) && l.push(t);
            }), !l.length) {
                const e = i.findIndex(o), n = i.slice(0, e < 0 ? i.length : e);
                return {
                    text: t ? "" : n.map(e => e.text).join("\n"),
                    sectionFound: !1,
                    missingSection: t
                };
            }
            let c = l[0], d = -1;
            l.forEach(e => {
                const t = i.slice(e + 1, e + 121), n = t.map(e => ck(e.text).replace(/\s+\d+$/, "")), a = n.findIndex(e => [ "into", "interests", "favorites", "favorite", "curious about", "curious", "neutral", "soft limits", "soft limit", "hard limits", "hard limit", "not into", "not interested", "fantasy only", "already tried" ].includes(e)), r = n.slice(0, 4).includes("edit"), o = t.reduce((e, t) => e + (cx(t.text) ? 1 : 0), 0) + (a >= 0 && a < 16 ? 100 - a : 0) + (r ? 20 : 0);
                o > d && (c = e, d = o);
            });
            let u = i.length;
            for (let e = c + 1; e < i.length; e++) if (o(i[e])) {
                u = e;
                break;
            }
            return {
                text: i.slice(c + 1, u).map(e => e.text).join("\n"),
                sectionFound: !0,
                missingSection: !1
            };
        }
        function hx(e) {
            const t = [];
            let n = "", i = !1, o = 0;
            for (let a = 0; a < e.length; a++) {
                const r = e[a];
                '"' === r ? i && '"' === e[a + 1] ? (n += '"', a++) : i = !i : "(" === r && !i ? (o++, n += r) : ")" === r && !i && o > 0 ? (o--, n += r) : "," !== r || i || o > 0 ? n += r : (t.push(n.trim()), 
                n = "");
            }
            return t.push(n.trim()), t.filter(Boolean);
        }
        function gx(e) {
            const t = [];
            return e.split(/\r\n|[\r\n]/).forEach(e => {
                const n = e.trim();
                if (!n) return;
                const i = n.match(/^(Into|Curious about|Curious|Soft limits?|Hard limits?|Favorites?|Not into|Not interested|Neutral|Fantasy only|Already tried)\s*:\s*(.+)$/i);
                if (i) return t.push(i[1]), void hx(i[2]).forEach(e => t.push(e));
                const a = hx(n);
                if (a.length < 2) return void t.push(n);
                a.filter(e => cx(e.replace(/^(?:the|a|an)\s+/i, ""))).length >= 2 ? a.forEach(e => t.push(e)) : t.push(n);
            }), t;
        }
        function mx(e) {
            const t = qn[e];
            if (t && t.label) return t.label;
            for (const t of h) {
                if (catId(t.name) === e) return t.name;
                const n = t.topics.find(t => Wn(t) === e);
                if (n) return n;
            }
            return e;
        }
        // ============================================================
        // FetLife importer — FetLifeImporter pipeline module
        // (Refactor Step 2, Build 2026-10-18_0722.)
        //
        // The FetLife branch of yx.parse used to be one large inline
        // function. It is now four named stages plus a thin
        // orchestrator, with zero behavior change: same section and
        // direction tables, same qualifier edge cases, same warnings,
        // same category-hit (broadHits) tracking, same return shape.
        //
        //   parse(rawHtml)  — HTML extraction via px()/gx(), section
        //     splitting, subsection-scoped "View all" detection.
        //     Returns raw item records {section, dirDefault, rawText,
        //     lineNo} plus page metadata. (Only stage touching px/gx.)
        //   normalize(item) — pure, no DOM: splits the raw line into
        //     name + qualifier text, strips a trailing parenthetical
        //     qualifier off the name and merges it into the qualifier
        //     string (qualifier text is ck()-normalized: lowercased /
        //     trimmed; "as a top" / "as a bottom" resolve through the
        //     direction table in parse/rate). Returns {baseTerm,
        //     qualifier, rawName}.
        //   match(baseTerm, ctx) — pure lookup, no DOM: alias-map /
        //     pattern-fallback match via cx() (Step 1 alias structure
        //     untouched), resolution via pk(), category/subcategory
        //     hits recorded into ctx.broadHits. Returns {status,
        //     match, resolved} with status "matched" | "broad" |
        //     "unmapped".
        //   rate(normalized, matchResult, item, acc) — resolves the
        //     effective section (qualifier text first, then the
        //     item's section, default Into) and direction (qualifier,
        //     then the section's pending direction, then the match's
        //     own direction), then writes ratings / annotations /
        //     notes / flags into the accumulators.
        //   run(rawText) — orchestrator: parse → normalize → match →
        //     rate over the item list and assembles the exact result
        //     object the converter has always returned.
        //
        // Stage logging: each stage appends {stage, in, out,
        // examples} to FetLifeImporter.stageLog (reset per run);
        // set FetLifeImporter.DEBUG = true to also mirror entries to
        // console.debug.
        // ============================================================
        const FetLifeImporter = (() => {
            const SECTION_KINDS = {
                        into: {
                            kind: "into",
                            value: 100
                        },
                        interests: {
                            kind: "into",
                            value: 100
                        },
                        favorites: {
                            kind: "favorite",
                            value: null,
                            mark: "favorite"
                        },
                        favorite: {
                            kind: "favorite",
                            value: null,
                            mark: "favorite"
                        },
                        "curious about": {
                            kind: "curious",
                            value: 0
                        },
                        curious: {
                            kind: "curious",
                            value: 0
                        },
                        neutral: {
                            kind: "neutral",
                            value: null,
                            neutral: !0
                        },
                        "soft limits": {
                            kind: "soft",
                            value: null,
                            mark: "notinterested"
                        },
                        "soft limit": {
                            kind: "soft",
                            value: null,
                            mark: "notinterested"
                        },
                        "hard limits": {
                            kind: "hard",
                            value: null,
                            mark: "limit"
                        },
                        "hard limit": {
                            kind: "hard",
                            value: null,
                            mark: "limit"
                        },
                        "not into": {
                            kind: "not",
                            value: null,
                            mark: "notinterested"
                        },
                        "not interested": {
                            kind: "not",
                            value: null,
                            mark: "notinterested"
                        },
                        "fantasy only": {
                            kind: "fantasy",
                            value: null,
                            fantasy: !0
                        },
                        "already tried": {
                            kind: "tried",
                            value: null,
                            tried: !0
                        }
                    };
            const DIRECTION_KINDS = {
                        giving: {
                            direction: "give",
                            label: "giving"
                        },
                        "as a top": {
                            direction: "give",
                            label: "giving"
                        },
                        top: {
                            direction: "give",
                            label: "giving"
                        },
                        receiving: {
                            direction: "receive",
                            label: "receiving"
                        },
                        "as a bottom": {
                            direction: "receive",
                            label: "receiving"
                        },
                        bottom: {
                            direction: "receive",
                            label: "receiving"
                        },
                        both: {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        switch: {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        "giving and receiving": {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        "giving receiving": {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        "everything to do with it": {
                            direction: "both",
                            label: "everything to do with it",
                            everything: !0
                        },
                        watching: {
                            direction: null,
                            label: "watching"
                        },
                        wearing: {
                            direction: null,
                            label: "wearing"
                        },
                        "watching others wear": {
                            direction: null,
                            label: "watching others wear"
                        },
                        "watching others wearing": {
                            direction: null,
                            label: "watching others wear"
                        }
                    };
            const SKIP_TERMS = new Set([ "fetishes", "kinks", "fetish list", "kink list", "edit", "about", "activity", "interest", "role", "show more", "show less" ]);
            const PAGE_SECTIONS = [ "fetishes", "kinks", "about", "about me", "activity", "activity feed", "recent activity", "pictures", "photos", "videos", "events", "events attended", "writings", "journal entries", "posts", "relationships", "relationship status", "roles", "identity", "gender", "orientation", "pronouns", "groups", "places", "questions", "friends", "followers", "following", "looking for", "kinksters", "lists", "memberships", "wall", "status" ];
            const sectionFromQualifier = e => /\bhard limits?\b/.test(e) ? SECTION_KINDS["hard limit"] : /\bsoft limits?\b/.test(e) ? SECTION_KINDS["soft limit"] : /\b(?:not interested|not into|no)\b/.test(e) ? SECTION_KINDS["not into"] : /\bfantasy only\b/.test(e) ? SECTION_KINDS["fantasy only"] : /\balready tried\b/.test(e) ? SECTION_KINDS["already tried"] : /\bneutral\b/.test(e) ? SECTION_KINDS.neutral : /\b(?:curious about|curious|maybe)\b/.test(e) ? SECTION_KINDS.curious : /\bfavorites?\b/.test(e) ? SECTION_KINDS.favorite : /\b(?:into|yes)\b/.test(e) ? SECTION_KINDS.into : null;
            const directionFromQualifier = e => /\beverything to do with it\b/.test(e) ? DIRECTION_KINDS["everything to do with it"] : /\bwatching others wear(?:ing)?\b/.test(e) ? DIRECTION_KINDS["watching others wear"] : /\bwatching\b/.test(e) ? DIRECTION_KINDS.watching : /\bwearing\b/.test(e) ? DIRECTION_KINDS.wearing : /\b(?:both|switch|giving and receiving|giving receiving)\b/.test(e) ? DIRECTION_KINDS.both : /\b(?:giving|giver|top|topping|dominant|dom)\b/.test(e) ? DIRECTION_KINDS.giving : /\b(?:receiving|receiver|bottom|bottoming|submissive|sub)\b/.test(e) ? DIRECTION_KINDS.receiving : null;
            // Build 2026-10-18_1549 — watching / wearing qualifiers annotate
            // the topic (they never force a give/receive rating). The note
            // is worded with the topic's own specialized role labels where
            // the topic has them (Ge() labels — “admires” / “wears” /
            // “watches” and the like), falling back to the FetLife
            // qualifier's own words when it does not.
            const sxStance = (id, F) => {
                if (!F || null !== F.direction) return F ? F.label : "";
                const g = Ge(id);
                if (g.single) return F.label;
                if ("wearing" === F.label) return g.labels[1] && "receive" !== g.labels[1] ? g.labels[1] : F.label;
                if ("watching" === F.label || "watching others wear" === F.label) return g.labels[0] && "give" !== g.labels[0] ? g.labels[0] : F.label;
                return F.label;
            };
            const api = {
                DEBUG: !1,
                stageLog: []
            };
            function slog(stage, info) {
                api.stageLog.push(Object.assign({
                    stage: stage
                }, info)), api.DEBUG && console.debug(`[FetLifeImporter] ${stage}`, info);
            }
            function parse(rawHtml) {
                const extracted = px(rawHtml), lines = gx(extracted.text), items = [], viewAllSections = [];
                let section = null, sectionName = null, dirDefault = null;
                lines.forEach((e, t) => {
                    let s = e.replace(/ /g, " ").replace(/^[\s•·*]+|[\s•·*]+$/g, "").trim();
                    if (!s || /^[,;|]+$/.test(s)) return;
                    const f = ck(s), y = f.replace(/\s+\d+$/, "");
                    if (Object.prototype.hasOwnProperty.call(SECTION_KINDS, y)) return section = SECTION_KINDS[y], sectionName = y, void (dirDefault = null);
                    if (Object.prototype.hasOwnProperty.call(DIRECTION_KINDS, y)) return void (dirDefault = DIRECTION_KINDS[y]);
                    if (PAGE_SECTIONS.includes(y) || /^(?:latest\s+)?(?:pictures?|photos?|videos?|writings?)(?:\s*\(\d+\))?\s*:?$/.test(y)) return sectionName = null, void (dirDefault = null);
                    if (/^(?:view|show)\s+all(?:\s+fetishes?)?$/i.test(s) || /^view\s+all\b/i.test(s)) return void (sectionName && viewAllSections.push(sectionName));
                    if (SKIP_TERMS.has(f) || /^https?:\/\//i.test(s) || /^@?[a-z0-9_.-]+\s+on\s+fetlife$/i.test(s)) return;
                    items.push({
                        section: section,
                        dirDefault: dirDefault,
                        rawText: s,
                        lineNo: t + 1
                    });
                });
                return slog("parse", {
                    in: lines.length,
                    out: items.length,
                    examples: items.slice(0, 3).map(e => e.rawText)
                }), {
                    items: items,
                    viewAllSections: viewAllSections,
                    missingSection: extracted.missingSection,
                    sectionFound: extracted.sectionFound
                };
            }
            function normalize(item) {
                const s = item.rawText;
                let E = s.split(/\t+|\s*\|\s*|\s+[—–]\s+(?!\()/).map(e => e.trim()).filter(Boolean);
                if (1 === E.length) {
                    const e = s.match(/^(.+?):\s*(.+)$/);
                    e && /\b(?:into|curious|favorite|neutral|not interested|fantasy only|already tried|limit|giving|receiving|both|switch|top|bottom|watching|wearing|everything|yes|no|maybe)\b/i.test(e[2]) && (E = [ e[1], e[2] ]);
                }
                if (1 === E.length) {
                    const e = s.match(/\s+(?=(?:into|curious about|favorite|neutral|soft limits?|hard limits?|not interested|not into|fantasy only|already tried|everything to do with it|watching others wear(?:ing)?|watching|wearing|giving(?:\s*(?:and|&)\s*receiving)?|receiving|both|switch|top|bottom)\b)/i);
                    e && (E = [ s.slice(0, e.index), s.slice(e.index).trim() ]);
                }
                let A = (E.shift() || "").replace(/^[-*•·\d.)\s]+/, "").replace(/^(?:the|a|an)\s+/i, "").trim();
                let C = ck(E.join(" "));
                if (!A) return {
                    baseTerm: "",
                    qualifier: C,
                    rawName: A
                };
                const A0 = A, Aq = A.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
                if (Aq && Aq[1].trim()) {
                    const q = ck(Aq[2]);
                    q && /\b(?:giving|receiving|everything to do with it|watching|wearing|both|switch|top|bottom)\b/.test(q) && (A = Aq[1].trim(), 
                    C = (C ? C + " " : "") + q);
                }
                // Importer rework Part C: a LEADING parenthetical qualifier
                // ("(giving) Spanking", "(receiving) Flogging") carries the
                // same recoverable direction as the trailing form — mine it
                // into the qualifier string instead of dropping it. When the
                // parenthetical holds no direction word, the term is left
                // exactly as written (unrecoverable is stated by the match
                // warnings, never guessed).
                const AqLead = A.match(/^\(([^()]*)\)\s*(.+)$/);
                if (AqLead && AqLead[2].trim()) {
                    const q = ck(AqLead[1]);
                    q && /\b(?:giving|receiving|everything to do with it|watching|wearing|both|switch|top|bottom)\b/.test(q) && (A = AqLead[2].trim(), 
                    C = (C ? C + " " : "") + q);
                }
                return {
                    baseTerm: A,
                    qualifier: C,
                    rawName: A0
                };
            }
            function match(baseTerm, ctx) {
                const M = cx(baseTerm);
                if (!M) return {
                    status: "unmapped",
                    match: null,
                    resolved: null
                };
                const I = pk(M, baseTerm, ctx.children);
                if (!I) {
                    // Build 2026-10-18_1015: broadTerms is presentation-only
                    // tracking for the post-import summary dialog — the set
                    // of distinct FetLife terms that landed on each broad
                    // branch. broadHits recording below is unchanged.
                    if (M && M.id && (isCatId(M.id) || isSubId(M.id))) {
                        const bt = ctx.broadTerms || (ctx.broadTerms = {});
                        (bt[M.id] || (bt[M.id] = new Set)).add(baseTerm), ctx.broadHits.includes(M.id) || ctx.broadHits.push(M.id);
                    }
                    return {
                        status: "broad",
                        match: M,
                        resolved: null
                    };
                }
                if (!I.child && (isSubId(I.id) || isCatId(I.id))) {
                    const bt = ctx.broadTerms || (ctx.broadTerms = {});
                    (bt[I.id] || (bt[I.id] = new Set)).add(baseTerm), ctx.broadHits.includes(I.id) || ctx.broadHits.push(I.id);
                }
                return {
                    status: "matched",
                    match: M,
                    resolved: I
                };
            }
            function rate(normalized, matchResult, item, acc) {
                const A = normalized.baseTerm, C = normalized.qualifier, M = matchResult.match, I = matchResult.resolved, P = I.id, b = (e, n, i) => {
                    !Ke.has(e) && !acc.children[e] || (acc.ratings[e] || (acc.ratings[e] = {}), acc.ratings[e][n] = i);
                }, v = (e, t) => {
                    (Ke.has(e) || acc.children[e]) && t && (acc.notes[e] || (acc.notes[e] = []), acc.notes[e].includes(t) || acc.notes[e].push(t));
                }, L = sectionFromQualifier(C) || item.section || SECTION_KINDS.into, T = directionFromQualifier(C), F = T || item.dirDefault;
                let N = F ? F.direction : M.direction || "both", _ = L.value, D = L.mark || null;
                // Slug-gap fix: when P names no current topic (not a
                // canonical id in Ke, not a registered imported child),
                // every write below is declined or would be stored under
                // a dead key. Drop the hit loudly instead: record it on
                // acc.notApplied, name it in the warnings, and return !1
                // so run() excludes it from the matched / mapped counts
                // and no success line is rendered for it.
                if (!Ke.has(P) && !acc.children[P]) {
                    const droppedList = acc.notApplied || (acc.notApplied = []);
                    droppedList.some(e => e.term === A && e.target === P) || droppedList.push({
                        term: A,
                        target: P
                    }), acc.warnings.push(`Item ${item.lineNo}: “${A}” matched ${P}, which names no current topic, and was not applied.`);
                    return !1;
                }
                // Build 2026-10-18_1549 — “(everything to do with it)” carries
                // its own value by section instead of the section default:
                // 80 (4/5 positive) in Into, 33 (~1/3, deep yellow) in
                // Curious. On a single-slider topic it sets only that one
                // slider (stored under the “give” key, per Ge()); on a
                // dual-slider topic it sets both give and receive.
                const sxEverything = Boolean(F && F.everything), sxSingle = sxEverything && Ge(P).single;
                sxEverything && ("into" === L.kind ? _ = 80 : "curious" === L.kind && (_ = 33)), 
                "into" !== L.kind || "give" !== N && "receive" !== N || F && F.everything || (_ = 85), 
                "hard" === L.kind && (D = "limit", N = "both"), "soft" === L.kind && v(P, "Soft limit on FetLife"), 
                F && null === F.direction && v(P, `${"curious" === L.kind ? "Curious about" : "soft" === L.kind ? "Soft limit" : "hard" === L.kind ? "Hard limit" : "favorite" === L.kind ? "Favorite" : "Into"} on FetLife · ${sxStance(P, F)}`), 
                !Number.isFinite(_) || "give" !== N && "both" !== N || b(P, "give", _), !Number.isFinite(_) || "receive" !== N && "both" !== N || sxSingle || b(P, "receive", _), 
                ("limit" === D || "limit" !== acc.annotations[P] && D) && (acc.annotations[P] = D), L.neutral && (acc.neutralNodes[P] = !0), 
                L.fantasy && (acc.fantasyOnly[P] = !0), L.tried && (acc.alreadyTried[P] = !0), (D || L.neutral || L.fantasy || L.tried) && (acc.discreteNodes[P] = !0);
                const R = F && null === F.direction ? `annotation: ${F.label}` : sxEverything ? sxSingle ? "everything (single slider)" : "give + receive" : "both" === N ? "give + receive" : N, O = "into" === L.kind ? `into ${_}` : "curious" === L.kind ? sxEverything ? "curious 33" : "curious" : "soft" === L.kind ? "Not Interested (soft limit)" : "hard" === L.kind ? "Hard Limit" : "favorite" === L.kind ? "Favorite" : "neutral" === L.kind ? "Neutral" : "fantasy" === L.kind ? "Fantasy Only" : "tried" === L.kind ? "Already Tried" : "Not Interested";
                acc.mappings.push({
                    text: `${A} ⇒ ${sxNodePath(P)} · ${R} · ${O}`,
                    tertiary: !1
                }), I.suggestion && acc.suggestions.push({
                    name: I.suggestion.name,
                    parentId: P,
                    parentPath: sxNodePath(P),
                    section: L.kind,
                    direction: N,
                    value: _
                });
                return !0;
            }
            function run(rawText) {
                api.stageLog.length = 0;
                const acc = {
                    ratings: {},
                    annotations: {},
                    fantasyOnly: {},
                    alreadyTried: {},
                    neutralNodes: {},
                    discreteNodes: {},
                    notes: {},
                    children: {},
                    warnings: [],
                    unmappedFetishes: [],
                    bestFitNotes: [],
                    suggestions: [],
                    mappings: [],
                    notApplied: [],
                    broadHits: [],
                    broadTerms: {}
                };
                let mappedLines = 0, totalLines = 0;
                const parsed = parse(rawText), normExamples = [], matchExamples = [], rateExamples = [];
                let normCount = 0, matchedCount = 0, broadCount = 0, unmappedCount = 0, droppedCount = 0;
                parsed.missingSection && acc.warnings.push("No Fetishes section was found in this saved page, so nothing outside that section was scanned. The section isn't in this file: open the profile on FetLife, scroll to the Fetishes area and expand every subsection, then save the page again as 'Webpage, Single File' (.mhtml) — not 'HTML Only'. Or save the page at fetlife.com/<username>/profile/fetishes instead.");
                for (const item of parsed.items) {
                    const normalized = normalize(item);
                    if (!normalized.baseTerm) continue;
                    totalLines++, normCount++, normExamples.length < 3 && normExamples.push(`${normalized.rawName} → base “${normalized.baseTerm}” · qualifier “${normalized.qualifier}”`);
                    const matchResult = match(normalized.baseTerm, acc);
                    if ("unmapped" === matchResult.status) {
                        unmappedCount++, acc.unmappedFetishes.push({
                            fetish_name: normalized.rawName,
                            list_type: /\b(?:curious about|curious|maybe)\b/.test(normalized.qualifier) || item.section && "curious" === item.section.kind ? "curious" : "into"
                        }), acc.warnings.push(`Item ${item.lineNo}: “${normalized.rawName.slice(0, 70)}” was not recognized or has no matching topic.`);
                        continue;
                    }
                    if ("broad" === matchResult.status) {
                        broadCount++, acc.warnings.push(`Item ${item.lineNo}: “${normalized.rawName}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                        continue;
                    }
                    rate(normalized, matchResult, item, acc) ? (matchedCount++, mappedLines++, matchExamples.length < 3 && matchExamples.push(`${normalized.baseTerm} → ${matchResult.resolved.id}`), rateExamples.length < 3 && rateExamples.push(acc.mappings[acc.mappings.length - 1].text)) : droppedCount++;
                }
                if (slog("normalize", {
                    in: parsed.items.length,
                    out: normCount,
                    examples: normExamples
                }), slog("match", {
                    in: normCount,
                    out: matchedCount,
                    broad: broadCount,
                    unmapped: unmappedCount,
                    dropped: droppedCount,
                    examples: matchExamples
                }), slog("rate", {
                    in: matchedCount,
                    out: mappedLines,
                    examples: rateExamples
                }), parsed.viewAllSections.length) {
                    const e = [ ...new Set(parsed.viewAllSections) ].map(e => e.replace(/\b\w/g, e => e.toUpperCase())).join(" and ");
                    acc.warnings.unshift(`We found “View all” links in your saved page (${e}). Your FetLife profile shows more fetishes than what’s in this file — you’re only importing the truncated visible portion. Go back to FetLife, click all “View all” links in your Fetishes section, then save the page again for a complete import.`);
                }
                const previewNotes = parsed.sectionFound ? [ "Found the Fetishes section and ignored the rest of the saved profile page." ] : [];
                return {
                    ratings: acc.ratings,
                    annotations: acc.annotations,
                    fantasyOnly: acc.fantasyOnly,
                    alreadyTried: acc.alreadyTried,
                    neutralNodes: acc.neutralNodes,
                    discreteNodes: acc.discreteNodes,
                    notes: acc.notes,
                    children: acc.children,
                    mappedLines: mappedLines,
                    totalLines: totalLines,
                    warnings: acc.warnings,
                    unmappedFetishes: acc.unmappedFetishes,
                    bestFit: [ ...new Set(acc.bestFitNotes) ],
                    suggestions: acc.suggestions,
                    mappings: acc.mappings,
                    notApplied: acc.notApplied,
                    categoryHits: acc.broadHits,
                    categoryHitCounts: Object.fromEntries(Object.entries(acc.broadTerms).map(([e, t]) => [ e, t.size ])),
                    // Build 2026-10-18_1624 — the actual FetLife terms behind
                    // each broad-branch count, so the summary dialog's pills
                    // can list term → target instead of a bare number.
                    categoryHitTerms: Object.fromEntries(Object.entries(acc.broadTerms).map(([e, t]) => [ e, [ ...t ] ])),
                    previewNotes: previewNotes
                };
            }
            return api.parse = parse, api.normalize = normalize, api.match = match, api.rate = rate, api.run = run, api;
        })();

        // Build 2026-10-18_1015 — Post-FetLife-import summary dialog
        // (presentation layer only; no import logic lives here). Groups the
        // parse result's broad hits — the same deduped categoryHits list the
        // list view auto-expands from — into a Category → Subcategory tree
        // with the per-branch FetLife-term counts FetLifeImporter.match
        // recorded alongside (categoryHitCounts), and shows the tree in
        // #fetlifeBroadDialog over the list view the Load already opened.
        function showFetLifeBroadSummary(result) {
            const dlg = e.byId("fetlifeBroadDialog"), tree = e.byId("fetlifeBroadTree"), totalEl = e.byId("fetlifeBroadTotal");
            if (!dlg || !tree || !result) return;
            const hits = Array.isArray(result.categoryHits) ? [ ...new Set(result.categoryHits.filter(x => "string" == typeof x && (isCatId(x) || isSubId(x)))) ] : [];
            if (!hits.length) return;
            const counts = result.categoryHitCounts && "object" == typeof result.categoryHitCounts ? result.categoryHitCounts : {}, termLists = result.categoryHitTerms && "object" == typeof result.categoryHitTerms ? result.categoryHitTerms : {}, targetFor = id => {
                if (isCatId(id)) {
                    const c = h.find(c => catId(c.name) === id);
                    return (c ? c.name : id) + " (whole category)";
                }
                const s = zn(id);
                return s ? s.branch + " › " + s.label + " (subcategory)" : id;
            }, linesFor = id => (Array.isArray(termLists[id]) ? termLists[id] : []).map(term => ({
                term: term,
                target: targetFor(id)
            })), countFor = id => Math.max(linesFor(id).length, Math.max(1, Number(counts[id]) || 1)), byCat = new Map;
            hits.forEach(id => {
                if (isCatId(id)) {
                    const cat = h.find(c => catId(c.name) === id);
                    if (!cat) return;
                    const entry = byCat.get(cat.name) || { name: cat.name, direct: 0, directLines: [], subs: [] };
                    entry.direct += countFor(id), entry.directLines.push(...linesFor(id)), byCat.set(cat.name, entry);
                } else {
                    const sub = zn(id);
                    if (!sub) return;
                    const entry = byCat.get(sub.branch) || { name: sub.branch, direct: 0, directLines: [], subs: [] };
                    entry.subs.push({ name: sub.label, count: countFor(id), lines: linesFor(id) }), byCat.set(sub.branch, entry);
                }
            });
            if (!byCat.size) return;
            tree.textContent = "";
            let total = 0;
            // Build 2026-10-18_1624 — the count pill is now a button (when
            // the term list is known): its hover tooltip lists every
            // FetLife term behind the count as “Term → target”, and
            // selecting it expands the same list inline under the row, so
            // a bare “1 term” can never be mistaken for a term that merely
            // passed through the branch on its way somewhere else.
            const mkRow = (label, count, lines, cls) => {
                const li = document.createElement("li");
                li.className = cls;
                const nm = document.createElement("span");
                nm.className = "fetlife-broad-name", nm.textContent = label;
                const badge = document.createElement(lines.length ? "button" : "span");
                badge.className = "fetlife-broad-count", badge.textContent = `${count} term${1 === count ? "" : "s"}`, li.append(nm, badge);
                if (lines.length) {
                    badge.type = "button", badge.title = lines.map(l => `${l.term} → ${l.target}`).join("\n"), 
                    badge.setAttribute("aria-expanded", "false"), badge.setAttribute("aria-label", `${count} FetLife term${1 === count ? "" : "s"}: ${lines.map(l => `${l.term} maps to ${l.target}`).join("; ")}. Activate to show or hide the list.`);
                    const detail = document.createElement("ul");
                    detail.className = "fetlife-broad-terms", detail.hidden = !0, lines.forEach(l => {
                        const d = document.createElement("li"), b = document.createElement("b");
                        b.textContent = l.term;
                        const a = document.createElement("span");
                        a.className = "fl-arrow", a.textContent = " → ";
                        const t = document.createElement("span");
                        t.textContent = l.target, d.append(b, a, t), detail.append(d);
                    }), li.append(detail), badge.addEventListener("click", () => {
                        detail.hidden = !detail.hidden, badge.setAttribute("aria-expanded", String(!detail.hidden));
                    });
                }
                return li;
            }, list = document.createElement("ul");
            list.className = "fetlife-broad-list", h.forEach(cat => {
                const entry = byCat.get(cat.name);
                if (!entry) return;
                const catTotal = entry.direct + entry.subs.reduce((a, s) => a + s.count, 0);
                total += catTotal;
                const catLines = entry.directLines.concat(entry.subs.reduce((a, s) => a.concat(s.lines), []));
                const li = mkRow(cat.name, catTotal, catLines, "fetlife-broad-cat");
                if (entry.direct || entry.subs.length) {
                    const subList = document.createElement("ul");
                    subList.className = "fetlife-broad-subs", entry.direct && subList.append(mkRow("The whole category", entry.direct, entry.directLines, "fetlife-broad-sub")), 
                    entry.subs.forEach(s => subList.append(mkRow(s.name, s.count, s.lines, "fetlife-broad-sub"))), li.append(subList);
                }
                list.append(li);
            }), tree.append(list), totalEl && (totalEl.textContent = `${total} FetLife term${1 === total ? "" : "s"} matched a broad area instead of a specific kink, so the rating was applied to that category or subcategory itself. Press “Rate the categories your kinks map to” and the list will show just ${1 === total ? "that area" : "those areas"}, most popular first and collapsed — expand one to rate its top topics. Each “N terms” pill lists the exact FetLife terms behind the count — hover it, or select it to expand the list — and shows where each term mapped.`);
            const closeBtn = e.byId("closeFetlifeBroad"), dismissBtn = e.byId("dismissFetlifeBroad");
            closeBtn && (closeBtn.onclick = () => Ui(dlg)), dismissBtn && (dismissBtn.onclick = () => {
                Ui(dlg), window.__sxFetLifeReview = new Set(hits), sxOutlineSortMode = "popularity";
                try {
                    Do.open ? Cs() : location.hash = "#app/listview";
                } catch (e) { __sxErrLog("listview-open", e); }
            }), Wi(dlg), 
            dismissBtn && requestAnimationFrame(() => dismissBtn.focus({ preventScroll: !0 }));
        }

        // F9 (profiles-data refactor, Edit 3): the merge dispatcher's
        // and the serializer's kind vocabularies, named once. Routing
        // behavior is unchanged: merge kinds outside the set fall
        // through to the profile route (yx is exported as
        // window.__sexcapades.ProfileIO, so callers outside this
        // bundle may pass kinds it does not define; a throw would
        // break them), and serialize kinds outside the set keep the
        // long-standing "Unsupported profile export" throw.
        const SX_MERGE_KINDS = new Set([ "converter", "shared", "profile" ]), SX_SERIALIZE_KINDS = new Set([ "profile", "viewport", "export", "sync-card", "compact", "bundle", "envelope" ]);

        const fx = {
            dominant: {
                id: null,
                direction: "give"
            },
            submissive: {
                id: null,
                direction: "receive"
            },
            "master mistress": {
                id: "t0131",
                direction: "give",
                uncertain: !0
            },
            slave: {
                id: "t0131",
                direction: "receive",
                uncertain: !0
            },
            sadist: {
                id: "cat-impact-pain-body-modification",
                direction: "give",
                uncertain: !0
            },
            masochist: {
                id: "cat-impact-pain-body-modification",
                direction: "receive",
                uncertain: !0
            },
            rigger: {
                id: "t0022",
                direction: "give"
            },
            "rope bunny": {
                id: "t0022",
                direction: "receive"
            },
            degrader: {
                id: "t0239",
                direction: "give"
            },
            degradee: {
                id: "t0239",
                direction: "receive"
            },
            owner: {
                id: "t0131",
                direction: "give"
            },
            pet: {
                id: "t0136",
                direction: "receive"
            },
            "daddy mommy": {
                id: "t0125",
                direction: "give",
                uncertain: !0
            },
            "boy girl": {
                id: "t0125",
                direction: "receive",
                uncertain: !0
            },
            "brat tamer": {
                id: "t0005",
                direction: "give",
                uncertain: !0
            },
            brat: {
                id: "t0005",
                direction: "receive",
                uncertain: !0
            },
            "primal hunter": {
                id: "t0351",
                direction: "give"
            },
            "primal prey": {
                id: "t0351",
                direction: "receive"
            },
            exhibitionist: {
                id: "t0270",
                direction: "both"
            },
            voyeur: {
                id: "t0270",
                direction: "both"
            },
            ageplayer: {
                id: "t0123",
                direction: "both",
                uncertain: !0
            },
            switch: {
                id: null,
                direction: "both"
            },
            experimentalist: {
                id: null,
                direction: "both"
            },
            "non monogamist": {
                id: "cat-partner-configurations",
                direction: "both",
                uncertain: !0
            },
            vanilla: {
                id: "cat-connection-aftercare",
                direction: "both",
                uncertain: !0
            }
        }, yx = Object.freeze({
            parse(e, t) {
                const n = String(e || "").toLowerCase();
                let i;
                if ("kinktest" === n) i = function(e) {
                    const t = {}, n = {}, i = {}, a = {}, r = {}, o = {}, s = [], l = [], c = [];
                    let d = 0, u = 0;
                    return e.split(/\r?\n/).forEach((e, p) => {
                        const h = e.trim();
                        if (!h) return;
                        u++;
                        const g = h.match(/^([^:]+):\s*(\d{1,3})\s*%?\s*(?:dom|d)\s*[,;/]\s*(\d{1,3})\s*%?\s*(?:sub|s)\s*$/i);
                        if (g) {
                            const e = ck(g[1]), n = ok[e] && migrateNodeKey(ok[e]), i = Number(g[2]), a = Number(g[3]);
                            return !n || i > 100 || a > 100 ? void s.push(`Line ${p + 1}: category or percentage not recognized.`) : (sx(t, n, "give", Math.round(2 * i - 100)), 
                            sx(t, n, "receive", Math.round(2 * a - 100)), c.push(`${g[1].trim()} → ${sxNodePath(n)} · give ${i}% · receive ${a}%`), 
                            d++, void ("edge play" === e && l.push("Edge Play shares the Impact, pain & body modification branch with Pain.")));
                        }
                        const m = h.match(/^#?(\d{1,2})\s*:\s*(?:.*?:\s*)?([1-4]|favorite|neutral|not interested|hard limit|fantasy only|already tried)\s*$/i);
                        if (m) {
                            const e = Number(m[1]), u = sk[e], h = ck(m[2]);
                            if (!u) return void s.push(`Line ${p + 1}: KinkTest item #${e} has no mapping.`);
                            const g = migrateNodeKey(u[0]);
                            let f = "";
                            if ("1" === h || "hard limit" === h) n[g] = "limit", o[g] = !0, f = "Hard Limit"; else if ("2" === h || "not interested" === h) n[g] = "notinterested", 
                            o[g] = !0, f = "Not Interested"; else if ("favorite" === h) n[g] = "favorite", o[g] = !0, 
                            f = "Favorite"; else if ("neutral" === h) r[g] = !0, o[g] = !0, f = "Neutral"; else if ("fantasy only" === h) i[g] = !0, 
                            o[g] = !0, f = "Fantasy Only"; else if ("already tried" === h) a[g] = !0, o[g] = !0, 
                            f = "Already Tried"; else {
                                const e = {
                                    3: 33,
                                    4: 100
                                }[Number(h)];
                                sx(t, g, u[1], e), f = String(e);
                            }
                            return c.push(`#${e} → ${sxNodePath(g)} · ${u[1]} · ${f}`), d++, void (lk.has(e) && l.push(`#${e} uses the closest available Sexcapades topic.`));
                        }
                        s.push(`Line ${p + 1}: “${h.slice(0, 70)}” was not recognized.`);
                    }), lx(t, {
                        annotations: n,
                        fantasyOnly: i,
                        alreadyTried: a,
                        neutralNodes: r,
                        discreteNodes: o,
                        mappedLines: d,
                        totalLines: u,
                        warnings: s,
                        bestFit: [ ...new Set(l) ],
                        mappings: c
                    });
                }(String(t || "")); else if ("checklist" === n || "yesnomaybe" === n) i = function(e) {
                    const t = {}, n = {}, i = {}, a = {}, r = {}, o = {}, s = {}, sxNotes = {}, l = [], c = [], d = [], sxSug = [];
                    let u = 0, p = 0, h = !1;
                    const g = (e, n, i) => {
                        !Ke.has(e) && !s[e] || (t[e] || (t[e] = {}), t[e][n] = i);
                    }, m = (e, t, h, m) => {
                        const f = ck(e);
                        if (!f) return;
                        if (p++, [ "religious play", "online roleplay" ].includes(f) || "other" === f || "kinks or fetishes not mentioned" === f) return void l.push(`Line ${h}: “${e}” has no matching topic and was skipped.`);
                        const y = (t.match(/(?:^|[,;\s])(T|B|S)(?=$|[,;\s])/i) || [])[1]?.toUpperCase() || (/\bgiving\b/.test(ck(t)) ? "T" : /\breceiving\b/.test(ck(t)) ? "B" : "S"), b = ck(t), v = t.match(/\b(Yes|Maybe|No)\b/i), N = (t.match(/^\s*([0-5])(?=\s*[,;]|\s*$)/) || [])[1], w = t.includes("!") || /\bfavorites?\b/.test(b), k = m || /\bhard limits?\b/.test(b), x = /\b(?:not interested|not into)\b/.test(b) || "no" === v?.[1].toLowerCase(), S = /\bneutral\b/.test(b), $ = /\bfantasy only\b/.test(b), E = /\balready tried\b/.test(b), W = /\bwatching\b/.test(b), A = !(v || N) || k || x || S ? null : N ? {
                            "0": 0,
                            "1": 20,
                            "2": 40,
                            "3": 60,
                            "4": 80,
                            "5": 100
                        }[N] : {
                            yes: 100,
                            maybe: 35
                        }[v[1].toLowerCase()] ?? null, C = e => {
                            k ? n[e] = "limit" : x ? n[e] = "notinterested" : w && (n[e] = "favorite"), S && (r[e] = !0), 
                            $ && (i[e] = !0), E && (a[e] = !0), (k || x || w || S || $ || E) && (o[e] = !0);
                        }, M = k ? "Hard Limit" : x ? "Not Interested" : S ? "Neutral" : w ? "Favorite" : $ ? "Fantasy Only" : E ? "Already Tried" : "";
                        if ("predator prey" === f) {
                            const t = "t0351", n = "T" === y ? [ [ t, "give" ] ] : "B" === y ? [ [ t, "receive" ] ] : [ [ t, "give" ], [ t, "receive" ] ];
                            return n.forEach(([e, t]) => {
                                null !== A && g(e, t, A), C(e);
                            }), d.push(`${e} → ${n.map(([e, t]) => `${sxNodePath(e)} · ${t}`).join(" + ")}${M ? ` · ${M}` : null !== A ? ` · ${A}` : ""}${$ && "Fantasy Only" !== M ? " · Fantasy Only" : ""}${E && "Already Tried" !== M ? " · Already Tried" : ""}`), 
                            void u++;
                        }
                        const I = ox(e);
                        if (!I) return void l.push(`Line ${h}: “${e}” was not recognized or has no matching topic.`);
                        const P = pk(I, e, s);
                        if (!P) return void l.push(`Line ${h}: “${e}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                        const L = P.id;
                        // Importer rework Part B/C: a "(watching)" /
                        // "(watching others wear)" qualifier takes the
                        // annotation path — a note on the topic, never a
                        // forced give/receive rating (same rule as the
                        // FetLife importer's watching/wearing stances).
                        W && (sxNotes[L] || (sxNotes[L] = []), sxNotes[L].includes("Watching · from the Yes / No / Maybe checklist") || sxNotes[L].push("Watching · from the Yes / No / Maybe checklist")), null !== A && ("T" !== y && "S" !== y || g(L, "give", A), "B" !== y && "S" !== y || g(L, "receive", A)), 
                        C(L), P.suggestion && sxSug.push({
                            name: P.suggestion.name,
                            parentId: L,
                            parentPath: sxNodePath(L),
                            section: "",
                            direction: y,
                            value: A
                        }), d.push(`${e} → ${sxNodePath(L)} · ${"T" === y ? "give" : "B" === y ? "receive" : "give + receive"}${M ? ` · ${M}` : null !== A ? ` · ${A}` : ""}${$ && "Fantasy Only" !== M ? " · Fantasy Only" : ""}${E && "Already Tried" !== M ? " · Already Tried" : ""}`), 
                        u++;
                    };
                    return e.split(/\r?\n/).forEach((e, t) => {
                        const n = e.trim();
                        if (!n) return;
                        if (/^limits\s*:/i.test(n)) {
                            h = !0;
                            const e = n.replace(/^limits\s*:/i, "").trim();
                            return void (e && e.split(/[,;]/).forEach(e => m(e, "", t + 1, !0)));
                        }
                        if (h) return void n.split(/[,;]/).forEach(e => m(e, "", t + 1, !0));
                        const i = n.indexOf(":");
                        if (i < 0) return l.push(`Line ${t + 1}: add “: Yes”, “: Maybe”, or “: No”.`), void p++;
                        m(n.slice(0, i), n.slice(i + 1), t + 1, !1);
                    }), {
                        ratings: t,
                        annotations: n,
                        fantasyOnly: i,
                        alreadyTried: a,
                        neutralNodes: r,
                        discreteNodes: o,
                        notes: sxNotes,
                        children: s,
                        suggestions: sxSug,
                        mappedLines: u,
                        totalLines: p,
                        warnings: l,
                        bestFit: [ ...new Set(c) ],
                        mappings: d
                    };
                }(String(t || "")); else if ("fetlife" === n) i = FetLifeImporter.run(String(t || "")); else if ("bdsmtest" === n) i = function(e) {
                    let t = String(e || "");
                    /<\/?[a-z][\s\S]*>/i.test(t) && (t = (new DOMParser).parseFromString(t, "text/html").body.textContent || ""), 
                    t = t.replace(/==\s*Results from bdsmtest\.org\s*==/gi, " ").replace(/\u00a0/g, " ");
                    const n = [], i = new Set, a = /(\d{1,3})\s*%\s*([A-Za-z][A-Za-z /()&-]*?)(?=\s*(?:,|;|[\r\n]|\d{1,3}\s*%|$))/g;
                    let r;
                    for (;r = a.exec(t); ) {
                        const e = r[2].trim().replace(/[.:-]+$/, "").trim(), t = Number(r[1]), a = ck(e);
                        e && t <= 100 && !i.has(a) && (n.push({
                            name: e,
                            score: t
                        }), i.add(a));
                    }
                    return n.length || t.split(/\r?\n/).forEach(e => {
                        const t = e.trim().match(/^([A-Za-z][A-Za-z /()&-]*?)\s*[:–—-]\s*(\d{1,3})\s*%?$/);
                        if (!t) return;
                        const a = t[1].trim(), r = Number(t[2]), o = ck(a);
                        r <= 100 && !i.has(o) && (n.push({
                            name: a,
                            score: r
                        }), i.add(o));
                    }), n.length ? function(e) {
                        const t = {}, n = {}, i = {}, a = {}, r = [], o = [], s = [], sxSug = [];
                        let l = 0, c = 0;
                        return e.forEach((e, d) => {
                            c++;
                            const u = String(e && e.name || "").trim(), p = e && null != e.score ? e.score : "", g = Number(String(p).replace("%", "").trim()), m = ck(u);
                            if (!u || !Number.isFinite(g) || g < 0 || g > 100) return void r.push(`Result ${d + 1} did not contain a readable role name and 0–100 score.`);
                            const f = fx[m];
                            if (!f) return void r.push(`Result ${d + 1}: “${u}” is not one of the 25 BDSMtest roles.`);
                            if (!f.id) return void r.push(`Result ${d + 1}: “${u}” has no close Sexcapades topic and was skipped.`);
                            const y = pk(f, u, a);
                            if (!y) return void r.push(`Result ${d + 1}: “${u}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                            const b = y.id;
                            0 === g ? (n[b] = !0, i[b] = !0) : (t[b] || (t[b] = {}), "give" !== f.direction && "both" !== f.direction || (t[b].give = Math.max(t[b].give || 0, g)), 
                            "receive" !== f.direction && "both" !== f.direction || (t[b].receive = Math.max(t[b].receive || 0, g))), l++, 
                            s.push(`${u} → ${sxNodePath(b)} · ${f.direction} · ${0 === g ? "Neutral" : g}`), y.suggestion && sxSug.push({
                            name: y.suggestion.name,
                            parentId: b,
                            parentPath: sxNodePath(b),
                            section: "",
                            direction: f.direction,
                            value: g
                        }), y.child && o.push(`“${u}” was kept as its own child under ${function(e) {
                                const t = qn[e];
                                if (t) return t.label;
                                for (const t of h) {
                                    if (catId(t.name) === e) return t.name;
                                    const n = t.topics.find(t => Wn(t) === e);
                                    if (n) return n;
                                }
                                return e;
                            }(f.id)}.`);
                        }), {
                            ratings: t,
                            annotations: {},
                            neutralNodes: n,
                            discreteNodes: i,
                            children: a,
                            suggestions: sxSug,
                            mappedLines: l,
                            totalLines: c,
                            warnings: r,
                            bestFit: [ ...new Set(o) ],
                            mappings: s
                        };
                    }(n) : {
                        ratings: {},
                        annotations: {},
                        mappedLines: 0,
                        totalLines: 0,
                        warnings: [ "No BDSMtest role scores were found. Paste lines such as “100% Dominant” from the results page." ],
                        bestFit: [],
                        mappings: []
                    };
                }(String(t || "")); else if ("json" === n) try {
                    i = JSON.parse(String(t || ""));
                } catch (e) {
                    throw new Error("This JSON file does not contain readable Sexcapades profile data.");
                } else if ("pdf" === n) try {
                    i = JSON.parse(function(e) {
                        const t = new TextDecoder("latin1").decode(e), i = t.indexOf("sexcapades-profile:");
                        if (i < 0) throw new Error("This PDF does not contain Sexcapades profile data.");
                        const a = t.slice(i + 19).match(/^([A-Za-z0-9+/=]+)/);
                        if (!a) throw new Error("This PDF does not contain Sexcapades profile data.");
                        return decodeURIComponent(escape(atob(a[1])));
                    }(t));
                } catch (e) {
                    if (e && /does not contain/.test(e.message || "")) throw e;
                    throw new Error("The embedded PDF profile data is not readable.");
                } else {
                    if ("png" === n) return async function(e) {
                        if (![ 137, 80, 78, 71, 13, 10, 26, 10 ].every((t, n) => e[n] === t)) throw new Error("This PNG does not contain Sexcapades profile data.");
                        let t = 8, n = null, i = "", sxSawIend = !1, sxSexSeen = !1;
                        for (;t + 12 <= e.length; ) {
                            const a = new DataView(e.buffer, e.byteOffset + t, 4).getUint32(0), r = t + 12 + a;
                            if (r > e.length) throw new Error("The PNG profile data is incomplete.");
                            const o = String.fromCharCode(...e.slice(t + 4, t + 8)), s = e.slice(t + 8, t + 8 + a);
                            if ("zTXt" === o) {
                                const sxNul = s.indexOf(0), sxKeyword = sxNul > 0 ? new TextDecoder("latin1").decode(s.slice(0, sxNul)) : "";
                                if ("Sexcapades" === sxKeyword || "vCard" === sxKeyword) {
                                    // Rank 5 guard: the chunk CRC is the
                                    // integrity check the PNG format
                                    // already carries, and the old code
                                    // never read it — a chunk whose bytes
                                    // were damaged after embedding could
                                    // still restore if it decompressed.
                                    // A bad CRC, a second Sexcapades
                                    // chunk, or a non-zero compression
                                    // method refuses the picture instead
                                    // of restoring it silently.
                                    if (!sxPngChunkCrc(e, t, a)) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    if ("Sexcapades" === sxKeyword && sxSexSeen) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    if (0 !== s[sxNul + 1]) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    const sxDecoded = (new TextDecoder).decode(await Lx(s.slice(sxNul + 2)));
                                    if ("Sexcapades" === sxKeyword) {
                                        sxSexSeen = !0;
                                        try { n = JSON.parse(sxDecoded); } catch (err) { throw new Error("The PNG profile data is damaged or incomplete."); }
                                    } else i = sxDecoded;
                                }
                            } else if ("iTXt" === o) {
                                const sxNul = s.indexOf(0), sxKeyword = sxNul > 0 ? new TextDecoder("latin1").decode(s.slice(0, sxNul)) : "";
                                if ("vCard" === sxKeyword) {
                                    if (!sxPngChunkCrc(e, t, a)) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    const sxCompressed = 1 === s[sxNul + 1], sxMethod = s[sxNul + 2], sxLangEnd = s.indexOf(0, sxNul + 3), sxTransEnd = sxLangEnd >= 0 ? s.indexOf(0, sxLangEnd + 1) : -1;
                                    if (sxLangEnd < 0 || sxTransEnd < 0 || 0 !== sxMethod) throw new Error("The PNG vCard data is incomplete.");
                                    const sxRaw = s.slice(sxTransEnd + 1);
                                    i = (new TextDecoder).decode(sxCompressed ? await Lx(sxRaw) : sxRaw);
                                }
                            }
                            if ("IEND" === o) { sxSawIend = !0; break; }
                            t = r;
                        }
                        // A picture cut off after its profile chunk but
                        // before IEND is truncated, not restored: the
                        // old loop returned the payload in that case.
                        if (!sxSawIend) throw new Error("The PNG profile data is incomplete.");
                        if (!n) throw new Error("This PNG does not contain Sexcapades profile data.");
                        return {
                            payload: n,
                            vcard: i
                        };
                    }(t).then(e => ({
                        payload: this.validate("shared", e.payload),
                        vcard: e.vcard || ""
                    }));
                    if ("qr" === n) return async function(e) {
                        let t;
                        try {
                            t = JSON.parse(await async function(e) {
                                if (e.startsWith("SCP2J:")) return (new TextDecoder).decode(mu(e.slice(6)));
                                if (e.startsWith("SCP3:")) {
                                    if ("function" != typeof DecompressionStream) throw new Error("This browser cannot decompress that profile-data QR.");
                                    const t = new Blob([ Du(e.slice(5)) ]).stream().pipeThrough(new DecompressionStream("deflate"));
                                    return (new TextDecoder).decode(await new Response(t).arrayBuffer());
                                }
                                throw new Error("Unsupported profile-data QR format.");
                            }(String(e || "")));
                        } catch (e) {
                            throw new Error("That QR code does not contain readable Sexcapades profile data.");
                        }
                        if (t && "sexcapades" === t.a && 7 === t.v) return Hu(t, cu);
                        if (t && "sexcapades" === t.a && 6 === t.v) return Hu(t, uu);
                        if (t && "sexcapades" === t.a && (5 === t.v || 4 === t.v)) return Yw(Hu(t, pu));
                        if (Uw(t)) return t;
                        throw new Error("That QR code does not contain current Sexcapades profile data.");
                    }(String(t || "")).then(e => this.validate("profile", e));
                    if ("share-link" === n) i = function(e) {
                        const t = mu(e), n = new DataView(t.buffer, t.byteOffset, t.byteLength);
                        if (t.length < 9 || 83 !== t[0] || 88 !== t[1] || 1 !== t[2]) throw new Error("This is not a readable Sexcapades share link.");
                        if (n.getUint32(3) !== yu) throw new Error("This share link uses a different topic-map version.");
                        const i = t[7], a = t[8], r = 9 + i;
                        if (r + 3 * a !== t.length) throw new Error("This share link is incomplete.");
                        const o = {}, s = {}, l = {}, c = {};
                        for (let e = 0; e < a; e++) {
                            const n = r + 3 * e, i = t[n], a = t[n + 1], d = t[n + 2], u = fu[i];
                            if (!u) throw new Error("This share link uses an unknown topic.");
                            const p = vu(a >> 4), h = vu(15 & a), g = {};
                            null !== p && (g.give = p), null !== h && (g.receive = h), Object.keys(g).length && (o[u] = g), 
                            1 & d ? s[u] = "favorite" : 2 & d ? s[u] = "limit" : 16 & d && (s[u] = "notinterested"), 
                            4 & d && (l[u] = !0), 8 & d && (c[u] = !0);
                        }
                        return {
                            app: "sexcapades",
                            version: 16,
                            profileName: (new TextDecoder).decode(t.slice(9, r)).trim() || "Shared hypermap",
                            ratings: o,
                            annotations: s,
                            fantasyOnly: l,
                            alreadyTried: c,
                            notes: {},
                            importedChildren: {}
                        };
                    }(String(t || "")); else {
                        if ("profile" !== n && "shared" !== n) throw new Error(`Unsupported profile source: ${e}`);
                        i = t;
                    }
                }
                // HARD CONSTRAINT (sharing-sync refactor F7): a
                // share-link import maps to "profile" here ON
                // PURPOSE. The "profile" merge branch (rk) does NOT
                // autoSelect, so opening someone's share link adds
                // their profile WITHOUT joining it to the receiver's
                // collection/selection — unlike the "shared" branch,
                // which auto-selects (the 2026-10-25 scan-or-import
                // fix). Do not "clean up" this mapping to "shared":
                // that would silently change join behavior. Pinned
                // by harness case 3 in the sharing-sync verdict.
                return this.validate([ "kinktest", "checklist", "yesnomaybe", "fetlife", "bdsmtest" ].includes(n) ? "converter" : "profile" === n || "share-link" === n ? "profile" : "shared", i);
            },
            validate(e, t) {
                if ("converter" === e) {
                    if (!t || "object" != typeof t || !t.ratings || "object" != typeof t.ratings) throw new Error("Those results could not be converted into a profile.");
                    return [ "annotations", "fantasyOnly", "alreadyTried", "neutralNodes", "discreteNodes", "notes", "children" ].forEach(e => {
                        if (void 0 !== t[e] && (null === t[e] || "object" != typeof t[e] || Array.isArray(t[e]))) throw new Error("Those converted results are incomplete.");
                    }), t;
                }
                if ("compact" === e) {
                    if (!t || "sexcapades" !== t.a || 7 !== t.v || !Array.isArray(t.r)) throw new Error("The compact profile data is not valid.");
                    return t;
                }
                if ("shared" === e && t && "sexcapades-share" === t.app) {
                    if (1 !== t.version || !Array.isArray(t.profiles) || !t.profiles.length) throw new Error("This Sexcapades share bundle is incomplete.");
                    return t.profiles = t.profiles.map(e => this.validate("profile", e)), t;
                }
                if (Yw(t), !Uw(t)) throw new Error("This is not a valid current Sexcapades profile.");
                if (!("string" == typeof t.profileName ? t.profileName : "").trim()) throw new Error("This profile file does not include a profile name.");
                return t;
            },
            merge(e, t, n = {}) {
                const sxKind = SX_MERGE_KINDS.has(e) ? e : "profile";
                return "converter" === sxKind ? function(e, t = {}) {
                    if (eS(), !e) throw new Error("No converted profile data is ready to merge.");
                    const n = t.target || zk, i = t.type || Gk;
                    // Merge target (load-target stage, firm spec
                    // reaffirmed 2026-10-27 08:49): an explicit target
                    // — the profile the converter was pressed from, or
                    // the one the user picked in the chooser — wins.
                    // The session target zk is the only other source,
                    // and Ax now sets zk ONLY from a recorded target,
                    // never from whoever is on screen. With no recorded
                    // target and no explicit choice, n is empty and
                    // the merge REFUSES with the visible message below:
                    // no silent fallback, ever, and the converter never
                    // creates a profile. That same message is the
                    // nobody-on-screen edge (no target was chosen and
                    // nobody is on screen to load into). A pair/group
                    // target is blocked outright: a pair's numbers are
                    // computed from its source profiles, so converted
                    // results are never written directly into a pair.
                    if (!n || !vt[n]) return void (Pk.textContent = "No profile is on screen to load these results into, and no target was chosen, so nothing was loaded. Open a profile first, then try again.");
                    if (ft[n] && "group" === ft[n].kind) return void (Pk.textContent = `${wt[n] || "That profile"} is a pair/group profile, and test results can't be loaded directly into a pair — its numbers are computed from its source profiles. Pick one of the pair's own profiles instead. Nothing was loaded.`);
                    const a = {};
                    at[n] || (at[n] = {}), Object.values(e.children || {}).forEach(e => {
                        const t = ii(at[n], e.label, e.parentId);
                        t && (Ke.add(t.id), a[t.id] = t);
                    });
                    const r = {}, o = new Set;
                    Object.keys(e.discreteNodes || {}).forEach(e => {
                        const t = vt[n][e];
                        t && "object" == typeof t && ([ "give", "receive" ].forEach(a => {
                            Ao(n, e, a) === `test:${i}` && (delete t[a], Ze[n]?.[e] && delete Ze[n][e][a]);
                        }), Object.keys(t).length || delete vt[n][e], Ze[n]?.[e] && !Object.keys(Ze[n][e]).length && delete Ze[n][e]);
                    });
                    // Fix 1, item 3: ratings go through
                    // applyProfileRatings — the same rules as the main
                    // import path (shape, clamp, unknown skip,
                    // unreadable rejection) — merging per flank with
                    // test: provenance and the documented manual-flip
                    // guard. The discrete-node clearing above stays
                    // converter-specific.
                    const sxAppliedRatings = applyProfileRatings(n, e.ratings || {}, { source: () => `test:${i}`, mergeFlanks: !0, guardManualFlip: !0 });
                    Object.assign(r, sxAppliedRatings.changed);
                    sxAppliedRatings.flipped.forEach(id => o.add(id));
                    o.forEach(id => { delete Qe[n][id]; });
                    Object.keys(e.neutralNodes || {}).forEach(e => {
                        delete Qe[n][e];
                    });
                    // Importer rework Part A (R1 STRICT): section ingestion
                    // for ALL FIVE converter feeds (annotations / fantasyOnly
                    // / alreadyTried / notes) now goes through the ONE shared
                    // ingestProfileSections helper — the same helper the
                    // profile-file import path uses — instead of the direct
                    // writes that used to live here. Converter merge
                    // semantics are preserved as the helper's named options:
                    // notes MERGE with the target profile's existing notes
                    // (mergeNotes = true); the flipped-mark / neutral-node
                    // clearing above and the discrete-node clearing earlier
                    // stay converter-specific and run first, as before.
                    // Unknown keys, illegal annotation values, and notes
                    // past the 16-per-topic cap are dropped WITH RECORD:
                    // collected here, stored on the profile's dropped-key
                    // records, named in the import-result dialog, and
                    // written to the error log — never silently swallowed.
                    const sxConvDropped = [];
                    const sxConvNoteDropped = (key, section, value, kindOverride) => {
                        if ("string" != typeof key || !key || isCatId(key) || isSubId(key)) return;
                        if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, key)) return void sxConvDropped.push(importRetiredRecord(key, section, value));
                        const rec = {
                            key: key,
                            section: section,
                            value: value,
                            kind: kindOverride || (/^t\d{4}$/.test(key) ? "retired" : "unrecognized")
                        };
                        const guessed = importDroppedGuess(key);
                        "string" == typeof guessed && guessed && (rec.label = guessed), sxConvDropped.push(rec);
                    };
                    ingestProfileSections(n, e, sxConvNoteDropped, !0);
                    sxConvDropped.length && (droppedKeyRecords[n] = (droppedKeyRecords[n] || []).concat(sxConvDropped), sxConvDropped.forEach(rec => {
                        try {
                            __sxErrLog("converter-drop", new Error(`${i}: dropped ${rec.section} key ${rec.key}`));
                        } catch (e) {}
                    }));
                    const s = "kinktest" === i ? "KinkTest.co.uk" : "checklist" === i ? "the Yes / No / Maybe checklist" : "bdsmtest" === i ? "BDSMtest.org" : "the copied FetLife profile", l = wt[n], c = ("kinktest" === i || "checklist" === i) && Boolean(Zk), d = c ? Jk() : 0, u = "kinktest" === i ? ix.length : "checklist" === i ? ax.length : 0, p = c ? Object.values(Xk).filter(e => e.answer).length : 0;
                    const sxHits = Array.isArray(e.categoryHits) ? [ ...new Set(e.categoryHits.filter(e => "string" == typeof e && (isCatId(e) || isSubId(e)))) ] : [];
                    c && $t(n, i, d, p, u), gt[n] || (gt[n] = {}), gt[n][i] = {
                        input: $k.value,
                        answers: Object.assign({}, Xk),
                        fetLifeSource: Vk,
                        fetLifeDisplay: Yk,
                        savedAt: (new Date).toISOString(),
                        categoryHits: sxHits
                    }, zt(n), sxMergeSaveNow(n), ex(), Ui(vk), qi(n, {
                        ratings: r,
                        annotations: e.annotations,
                        notes: e.notes || {},
                        children: a
                    }), xg.textContent = `Loaded matches from ${s} into ${l}.${c ? ` Completed in ${xt(d)}; time saved with the profile.` : ""}`;
                    // Post-merge landing (load-target stage): the
                    // merged-into profile is ACTIVATED and added to
                    // the multi-select set; the comparison overlay
                    // is not opened by a load.
                    sxSel(n), sxSel(null, "dismiss"), n !== Mt && Js(n), Jw();
                    const sxApplied = Boolean(Object.keys(e.ratings || {}).length || Object.keys(e.annotations || {}).length || Object.keys(e.fantasyOnly || {}).length || Object.keys(e.alreadyTried || {}).length || Object.keys(e.notes || {}).length || Object.keys(e.children || {}).length || Object.keys(e.neutralNodes || {}).length || Object.keys(e.discreteNodes || {}).length || sxHits.length);
                    const sxUnmatched = "fetlife" === i && Array.isArray(e.unmappedFetishes) ? e.unmappedFetishes : [], sxNotApplied = "fetlife" === i && Array.isArray(e.notApplied) ? e.notApplied : [];
                    (sxUnmatched.length || sxNotApplied.length || sxConvDropped.length) && showConverterResultDialog(l, Object.keys(e.ratings || {}).length, sxUnmatched, sxNotApplied, sxConvDropped, s);
                    "fetlife" === i && (sxOutlineSortMode = "interest"), (sxApplied || "fetlife" === i) && (sxApplied && (window.__sxOnDeck = !0), sxHits.length && (window.__sxCategoryHits = sxHits, window.__sxOutlineHits = new Set(sxHits)), (() => {
                        try {
                            Do.open || /#\/?(app\/)?(?:list|listview)\/?$/i.test(String(location.hash || "")) ? Ms(n) : location.hash = "#app/listview";
                        } catch (e) { __sxErrLog("listview-open", e); }
                    })()), sxHits.length && "fetlife" === i && window.setTimeout(() => {
                        try {
                            const rd = document.getElementById("importResultDialog");
                            if (rd && rd.open) {
                                const iv = window.setInterval(() => {
                                    if (!rd.open) {
                                        window.clearInterval(iv);
                                        try { showFetLifeBroadSummary(e); } catch (err) { __sxErrLog("listview-open", err); }
                                    }
                                }, 300);
                            } else showFetLifeBroadSummary(e);
                        } catch (e) { __sxErrLog("listview-open", e); }
                    }, 450);
                }(this.validate("converter", t), n) : "shared" === sxKind ? function(e, sxOpts = {}) {
                    const t = an && Yi().length >= 2, n = t ? Yi() : [];
                    if (e && "sexcapades-share" === e.app && 1 === e.version && Array.isArray(e.profiles) && e.profiles.length) {
                        const i = e.profiles.map(e => yx.merge("profile", e, Object.assign({}, sxOpts, {
                            quiet: !0,
                            comparisonIds: n,
                            comparisonActive: t
                        })));
                        return sxSel(null, "clear"), i.length > 1 && i.forEach(e => {
                            vt[e] && (sxSel(e), la(e));
                        }), Ui(Sg), sxSel(null, "dismiss"), Jw(), ak(i[i.length - 1]), i[i.length - 1];
                    }
                    // F5: the caller's options ride along under the
                    // branch's own keys — comparison state comes from
                    // the live selection, and autoSelect stays
                    // hard-coded last (the scan-import fix) so the
                    // single-profile fallthrough keeps auto-selecting
                    // exactly as before and the two never fight.
                    return yx.merge("profile", e, Object.assign({}, sxOpts, {
                        comparisonIds: n,
                        comparisonActive: t,
                        mergeIntoGroup: sxPairLoadInto && ft[sxPairLoadInto] && "group" === ft[sxPairLoadInto].kind ? sxPairLoadInto : null,
                        autoSelect: !0
                    }));
                }(this.validate("shared", t), n) : rk(this.validate("profile", t), n);
            },
            serialize(e, t = {}) {
                if (!SX_SERIALIZE_KINDS.has(e)) throw new Error(`Unsupported profile export: ${e}`);
                let n;
                if ("profile" === e) n = Ww(t.person); else if ("viewport" === e) n = Qu(t.person, t.visibleIds, t.displayName || ""); else if ("export" === e) n = Ju(t.person, t.visibleIds, Boolean(t.includeProfileInfo), t.displayName || "", Boolean(t.blind)); else if ("sync-card" === e) n = serializeSyncCard(t.person, t.visibleIds, t.displayName || "", Boolean(t.includeProfileInfo), Boolean(t.blind)); else {
                    if ("compact" === e) return this.validate("compact", function(e, t = tu(e), n = !0, i = !1) {
                        const a = e => !t || t.has(e), r = Rv(ut[e]), o = Object.values(at[e] || {}).filter(e => a(e.id)), s = new Map(o.map((e, t) => [ e.id, t ])), l = e => hu.has(e) ? hu.get(e) : cu.length + s.get(e), c = e => Number.isFinite(Number(e)) ? Math.round(Number(e)) : null, d = Object.entries(vt[e] || {}).filter(([e, t]) => !isCatId(e) && a(e) && t && Number.isInteger(l(e)) && (Number.isFinite(Number(t.give)) || Number.isFinite(Number(t.receive)))).map(([e, t]) => [ l(e), c(t.give), c(t.receive) ]), u = Object.entries(Qe[e] || {}).filter(([e]) => a(e) && Number.isInteger(l(e))).map(([e, t]) => [ l(e), "favorite" === t ? 1 : "notinterested" === t ? 3 : 2 ]), p = Object.keys(Je[e] || {}).filter(e => a(e) && Number.isInteger(l(e))).map(e => l(e)), h = Object.keys(et[e] || {}).filter(e => a(e) && Number.isInteger(l(e))).map(e => l(e)), g = n ? Object.entries(tt[e] || {}).filter(([e]) => a(e) && Number.isInteger(l(e))).map(([e, t]) => [ l(e), Array.isArray(t) ? t.join(" ") : String(t || "") ]).filter(e => e[1]) : [], m = o.map(e => [ e.label, hu.get(e.parentId) ]).filter(e => Number.isInteger(e[1])), f = bb(rt[e]), j = String(pz[e] || ""), y = iv(ot[e]), b = Gb(st[e]), v = Xv(lt[e]), w = Zv(ct[e]), k = String(nt[e] || ""), x = String(it[e] || ""), S = {
                            a: "sexcapades",
                            v: 7,
                            n: n ? wt[e] || "Profile" : "Shared profile",
                            r: d
                        };
                        i && (S.k = 1), n && f.length && (S.g = f), n && j && (S.p = j), n && y.length && (S.s = y), n && b.length && (S.w = b), 
                        n && v && (S.y = v), n && w && (S.l = w), n && Ov(r) && (S.c = r), n && k && (S.b = k), 
                        n && x && (S.u = x), n && (S.e = av(vpt[e]), vht[e] && (S.f = 1), S.j = av(vpt[e]), vht[e] && (S.z = 1)), m.length && (S.d = m), 
                        u.length && (S.m = u), p.length && (S.h = p), h.length && (S.i = h), g.length && (S.t = g);
                        const $ = n ? St(mt[e]) : {};
                        return Object.keys($).length && (S.q = $), S;
                    }(t.person, t.allowedIds, !1 !== t.includeProfileInfo, Boolean(t.blind)));
                    if ("bundle" === e) n = function(e, t, n = {}) {
                        return Ku(e, t.map(e => Ww(e)), n);
                    }(t.bundleKind, t.ids || [], t.extra || {}); else {
                        if ("envelope" !== e) throw new Error(`Unsupported profile export: ${e}`);
                        n = Ku(t.bundleKind, t.profiles || [], t.extra || {});
                    }
                }
                return this.validate("bundle" === e || "envelope" === e ? "shared" : "profile", n);
            },
            errorMessage: (e, t = "Profile import failed.") => (e && "string" == typeof e.message ? e.message.trim() : "") || t
        });
        // DECISION (sharing-sync refactor F5): sync cards NEVER
        // carry photos. serializeSyncCard is the one place that
        // rule lives: it serializes exactly like an export (Ju)
        // and then empties the photos array, because a printed
        // card is scanned back in public contexts where attached
        // photos must not travel. Do not duplicate Ju here, and
        // do not "fix" the empty photos array — it is the rule,
        // not a bug. Callers reach it via yx.serialize("sync-card")
        // or the vx wrapper below.
        function serializeSyncCard(e, t, n = "", i = !1, a = !1) {
            const r = Ju(e, t, i, n, a);
            return r.photos = [], r;
        }
        function bx(e, t, n = !1, i = "", a = !1) {
            return yx.serialize("export", {
                person: e,
                visibleIds: t,
                includeProfileInfo: n,
                displayName: i,
                blind: a
            });
        }
        function vx(e, t, n = "", i = !1, a = !1) {
            return yx.serialize("sync-card", {
                person: e,
                visibleIds: t,
                displayName: n,
                includeProfileInfo: i,
                blind: a
            });
        }
        function wx(e, t = {}) {
            return yx.merge("profile", e, t);
        }
        function kx(e, t = {}) {
            return yx.merge("shared", e, t);
        }
        function xx(e) {
            const t = "kinktest" === Gk || "checklist" === Gk;
            Nk.hidden = !0, _k.hidden = !t, Dk.hidden = !t, _k.setAttribute("aria-pressed", String("test" === e)), 
            Dk.setAttribute("aria-pressed", String("paste" === e)), Rk.hidden = "test" !== e, 
            Ek.hidden = "paste" !== e, Ak.hidden = "paste" !== e, "test" === e ? ($x(), tx()) : requestAnimationFrame(() => $k.focus());
        }
        function Sx(e, t, n, i) {
            return `<button type="button" data-test-group="${n}" data-test-index="${i}" data-test-value="${t}" aria-pressed="false">${e}</button>`;
        }
        function $x() {
            Xk = Object.assign({}, Xk || {}), Kk = null, Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", 
            e.byId("previewTestAnswers").hidden = !1, "kinktest" === Gk ? (Hk.hidden = !0, 
            jk.textContent = "KinkTest · 71 activities", n(qk, 'Uses KinkTest.co.uk’s four-point scale: 1 never, 2 not my thing, 3 enjoy, 4 really enjoy or really want to try. The 71 activities run across 8 pages — answer every question on a page to unlock the next. Questions sourced from <a href="https://kinktest.co.uk/survey" target="_blank" rel="noopener noreferrer">KinkTest.co.uk</a>.'), 
            ktPage = 0, ktRender()) : (Hk.hidden = !0, jk.textContent = "Yes / No / Maybe activities", n(qk, 'Rate each item 0&ndash;5: <b>0</b> is a hard no, <b>5</b> is an enthusiastic yes. Each answer applies to both give and receive, scaled across the slider gradient (0 red &rarr; 5 green). Add optional notes per item &mdash; they import as that topic\u2019s notes. Based on the classic Yes / No / Maybe checklist.'), 
            n(Ok, (() => { let h = "", q = ""; ax.forEach((e, t) => { const c = axCat[e] || "Yes / No / Maybe"; c !== q && (q = c, h += `<h4 class="test-cat-head">${Hi(c)}</h4>`); h += `<article class="test-question ynm-q"><div class="test-question-text">${Hi(e)}</div><div class="test-answer-groups"><div class="test-choice-group ynm-scale" role="group" aria-label="Rate ${Hi(e)} from 0 to 5">${Sx("0", "0", "answer", t)}${Sx("1", "1", "answer", t)}${Sx("2", "2", "answer", t)}${Sx("3", "3", "answer", t)}${Sx("4", "4", "answer", t)}${Sx("5", "5", "answer", t)}</div></div><input type="text" class="test-note-input" data-test-note="${t}" placeholder="Notes for this item (optional)" aria-label="Notes for ${Hi(e)}"></article>`; }); return h; })())),
            Object.entries(Xk).forEach(([e, t]) => { if (!t) return; if (t.answer) { const n = Ok.querySelector(`[data-test-index="${e}"][data-test-value="${t.answer}"]`); n && n.setAttribute("aria-pressed", "true"); } if (t.note) { const i = Ok.querySelector(`[data-test-note="${e}"]`); i && (i.value = t.note); } }), Ex();
        }
        function Ex() {
            const e = "kinktest" === Gk ? ix.length : ax.length, t = Object.values(Xk).filter(e => e.answer).length;
            Bk.textContent = `${xt(Jk())} elapsed · ${t} of ${e} answered`;
            ktPagerState();
        }
        function ktRender() {
            const per = 10, total = ix.length, pages = Math.ceil(total / per);
            ktPage = Math.max(0, Math.min(ktPage, pages - 1));
            const start = ktPage * per, end = Math.min(start + per, total);
            let h = "";
            for (let k = start; k < end; k++) {
                const e = ix[k];
                h += `<article class="test-question"><div class="test-question-text"><b>${e.number}.</b> ${Hi(e.question)}</div><div class="test-answer-groups"><div class="test-choice-group" role="group" aria-label="Rating for question ${e.number}">${Sx("1 \u00b7 Never", "1", "answer", k)}${Sx("2 \u00b7 Not my thing", "2", "answer", k)}${Sx("3 \u00b7 Enjoy", "3", "answer", k)}${Sx("4 \u00b7 Really enjoy", "4", "answer", k)}</div></div></article>`;
            }
            h += `<div class="test-pager" role="navigation" aria-label="Test pages"><button type="button" class="action-btn" data-kt-nav="prev"${ktPage === 0 ? " disabled" : ""}>\u2190 Previous</button><span class="test-pager-info"></span>`;
            h += ktPage < pages - 1 ? `<button type="button" class="action-btn primary" data-kt-nav="next" disabled>Next \u2192</button>` : `<span class="test-pager-done">Last page \u2014 use \u201cPreview answers\u201d above when finished.</span>`;
            h += `<button type="button" class="action-btn" data-kt-nav="fill1" title="Testing shortcut: answer 1 (Never) for every question on this page">Fill page with 1s</button></div>`;
            n(Ok, h);
            for (let k = start; k < end; k++) {
                const a = Xk[k];
                if (a && a.answer) {
                    const b = Ok.querySelector(`[data-test-index="${k}"][data-test-value="${a.answer}"]`);
                    b && b.setAttribute("aria-pressed", "true");
                }
            }
            ktPagerState();
        }
        function ktPagerState() {
            if ("kinktest" !== Gk) return;
            const per = 10, total = ix.length, pages = Math.ceil(total / per);
            const start = ktPage * per, end = Math.min(start + per, total);
            let n2 = 0, done = true;
            for (let k = start; k < end; k++) {
                if (Xk[k] && Xk[k].answer) n2++; else done = false;
            }
            const info = Ok.querySelector(".test-pager-info");
            info && (info.textContent = `Page ${ktPage + 1} of ${pages} \u00b7 ${n2} of ${end - start} answered`);
            const next = Ok.querySelector('[data-kt-nav="next"]');
            next && (next.disabled = !done);
        }
        function ktNavGo(a) {
            const per = 10, pages = Math.ceil(ix.length / per);
            if ("prev" === a) {
                if (ktPage > 0) { ktPage--; ktRender(); Ok.scrollIntoView({ block: "start" }); }
            } else if ("next" === a) {
                if (ktPage < pages - 1) {
                    const start = ktPage * per, end = Math.min(start + per, ix.length);
                    for (let k = start; k < end; k++) { if (!(Xk[k] && Xk[k].answer)) return; }
                    ktPage++; ktRender(); Ok.scrollIntoView({ block: "start" });
                }
            } else if ("fill1" === a) {
                const start = ktPage * per, end = Math.min(start + per, ix.length);
                for (let k = start; k < end; k++) { Xk[k] || (Xk[k] = {}); Xk[k].answer = "1"; }
                ktRender(); Ex();
            }
        }
        function Ax(t, i = "auto", sxTargetId) {
            // No silent fallback (firm spec, owner ruling 2026-10-27
            // 02:47, reaffirmed 08:49; the 08:02 reversal is withdrawn):
            // a converter invoked with no recorded target gets NO
            // session target — zk stays null, the title stays neutral,
            // and nothing is prefilled from whoever happens to be on
            // screen. The active profile is never quietly used as the
            // target. sxConverterOrigin likewise keeps ONLY a recorded
            // (pressed-from) target. An explicit choice in the
            // generic-entry chooser is the only way a no-origin session
            // acquires a target, and the merge itself refuses with a
            // visible error if it is ever reached with no target at
            // all. If no profile is on screen at all, zk stays null
            // for the same reason: the merge/Load paths show a message
            // instead of ever creating a profile.
            ex(), Gk = t, Kk = null, zk = sxTargetId && vt[sxTargetId] ? sxTargetId : null, sxConverterOrigin = sxTargetId && vt[sxTargetId] ? sxTargetId : null, sxFlFields = null;
            const a = function(e, t) {
                return gt[e] && gt[e][t] || null;
            }(zk, t);
            Vk = a?.fetLifeSource ?? null, Yk = a?.fetLifeDisplay ?? null, Xk = a && a.answers && "object" == typeof a.answers ? Object.assign({}, a.answers) : {}, 
            Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", $k.value = a && "string" == typeof a.input ? a.input : "", 
            Tk.hidden = "fetlife" !== t, e.byId("fetlifeGuide") && (e.byId("fetlifeGuide").hidden = "fetlife" !== t), Sk.textContent = "Paste results", vk.classList.toggle("checklist-layout", "checklist" === t), 
            Uk.textContent = "checklist" === t ? "Preview results" : "Preview matches";
            const r = zk ? wt[zk] || "this profile" : null;
            Lk.textContent = "Load into a profile", "kinktest" === t ? (wk.textContent = r ? `Load KinkTest.co.uk results into ${r}` : "Load KinkTest.co.uk results", 
            kk.textContent = "Answer all or part of KinkTest’s 71-activity survey here.", n(xk, 'Choose 1–4 for each activity, then preview the direct topic and give/receive mappings before loading. New answers update values previously loaded from a test. KinkTest’s 1 · Never maps directly to <b>Hard Limit</b>, 2 · Not my thing maps to <b>Not Interested</b>, and 3–4 remain positive slider ratings. A manual slider rating changes only when the test moves it to a different camp; everything else stays unchanged. <a href="https://kinktest.co.uk/survey" target="_blank" rel="noopener noreferrer">KinkTest survey</a>')) : "checklist" === t ? (wk.textContent = r ? `Load Yes / No / Maybe into ${r}` : "Load Yes / No / Maybe results", 
            kk.textContent = "Paste completed results, or answer the checklist below.", n(xk, "Paste one answer per line as <b>Item: 3</b> (0&ndash;5; Yes/Maybe/No also work). Or answer the complete checklist below and tap <b>Preview answers</b> to preview the mappings. Answers scale across the slider gradient on both give and receive: 0 is red, 5 is green. Names under <b>Limits:</b> map directly to <b>Hard Limit</b>. The labels Favorite, Neutral, Fantasy Only, and Already Tried are also recognized when included in a pasted result. New answers update values previously loaded from a test; everything else stays unchanged.")) : "bdsmtest" === t ? (wk.textContent = r ? `Load BDSMtest.org results into ${r}` : "Load BDSMtest.org results", 
            kk.textContent = "Paste the role scores from the results page.", Sk.textContent = "Paste the BDSMtest result list", 
            n(xk, "Copy the result lines that look like <b>100% Dominant</b>, paste them below, then preview the mappings. Positive percentages remain slider affinity values; an exact 0% maps directly to <b>Neutral</b>. Each role maps to give, receive, or both; missing roles stay unrated. This loader never creates negative ratings or Limits. New scores update values previously loaded from a test; everything else stays unchanged.")) : (wk.textContent = r ? `Load FetLife fetishes into ${r}` : "Load FetLife fetishes", 
            kk.textContent = "Build a hypermap from a profile’s Fetishes section without sharing your FetLife password.", 
            n(xk, 'Choose the saved page file below, or paste its HTML into the box — then preview the matches. <b>Load example</b> loads a sample saved page so you can see the whole flow first. Full detail: <b>How FetLife import works</b>, just below.')), 
            Ui(kg), Wi(vk), "kinktest" !== t && "checklist" !== t || "test" !== i ? "kinktest" !== t && "checklist" !== t || "paste" !== i ? "kinktest" === t ? xx("test") : "checklist" === t ? (Nk.hidden = !1, 
            Ek.hidden = !1, Ak.hidden = !1, Rk.hidden = !1, $x(), tx(), requestAnimationFrame(() => $k.focus())) : (Nk.hidden = !0, 
            Ek.hidden = !1, Ak.hidden = !1, Rk.hidden = !0, requestAnimationFrame(() => $k.focus())) : xx("paste") : xx("test"), 
            a && requestAnimationFrame(() => {
                ("kinktest" === t || "checklist" === t) && Object.keys(Xk).length ? e.byId("previewTestAnswers").click() : "kinktest" !== t && "checklist" !== t && $k.value.trim() && Uk.click();
            });
        }
        function Cx(e) {
            Kk = e, window.__sxUnmappedShare = "fetlife" === Gk ? (() => {
                const sxShare = [ ...(Array.isArray(Kk.unmappedFetishes) ? Kk.unmappedFetishes : []), ...(Array.isArray(Kk.suggestions) ? Kk.suggestions : []).map(s => ({
                    fetish_name: s.name,
                    list_type: "curious" === s.section ? "curious" : "into",
                    suggestion: !0,
                    parent_path: s.parentPath
                })) ];
                return sxShare.length ? sxShare : null;
            })() : null;
            const t = Object.keys(Kk.ratings).length, sxBranchRated = Object.keys(Kk.ratings).filter(e => isCatId(e) || isSubId(e)).length, sxTopicRated = t - sxBranchRated, sxSugCount = (Kk.suggestions || []).length, i = Object.keys(Kk.annotations || {}).length, a = new Set([ ...Object.keys(Kk.fantasyOnly || {}), ...Object.keys(Kk.alreadyTried || {}), ...Object.keys(Kk.neutralNodes || {}) ]).size, r = Object.keys(Kk.notes || {}).length, o = Object.keys(Kk.children || {}).length;
            Mk.textContent = `Matched ${Kk.mappedLines} of ${Kk.totalLines} result lines · ${sxTopicRated} slider-rated topics · ${sxBranchRated} slider-rated branches · ${i + a} discrete labels${sxSugCount ? ` · ${sxSugCount} suggested new ${1 === sxSugCount ? "topic" : "topics"}` : ""}${o ? ` · ${o} specific child ${1 === o ? "node" : "nodes"}` : ""}${r ? ` · ${r} with imported notes` : ""}`;
            const s = [], vaMsg = (Kk.warnings || []).find(e => /^We found “View all” links/.test(e));
            vaMsg && s.push({
                kind: "viewall",
                text: vaMsg
            }), (Kk.previewNotes || []).forEach(e => s.push({
                kind: "note",
                text: e
            })), (Kk.warnings || []).forEach(e => e !== vaMsg && s.push({
                kind: "unmatched",
                text: e
            })), (Kk.mappings || []).forEach(e => {
                const t = "string" == typeof e ? {
                    text: e,
                    tertiary: !1
                } : e;
                s.push({
                    kind: t.tertiary ? "tertiary" : "match",
                    text: t.text
                });
            }), (Kk.suggestions || []).forEach(e => {
                s.push({
                    kind: "suggestion",
                    text: `${e.name} — suggested under ${e.parentPath}`
                });
            }), Kk.bestFit.length && s.push({
                kind: "note",
                text: `${Kk.bestFit.length} best-fit mapping${1 === Kk.bestFit.length ? "" : "s"}: ${Kk.bestFit.slice(0, 6).join(" ")}`
            }), n(Ik, s.map(e => `<li class="preview-${e.kind}">${Hi(e.text)}</li>`).join("")), 
            Ck.hidden = !1, Lk.disabled = 0 === t && 0 === i && 0 === a && 0 === r, Pk.textContent = Lk.disabled ? "Nothing matched. Check the expected format above." : "";
        }
        function Mx() {
            try {
                if (zk && !vt[zk]) return void (Pk.textContent = "The profile these results were opened for is no longer available.");
                const e = "fetlife" === Gk && null !== Vk && $k.value === Yk ? Vk : $k.value;
                if ("fetlife" === Gk && !sxFlFields) sxFlFields = sxScrapeFetLifeProfile(e);
                Cx(yx.parse(Gk, e));
            } catch (t) {
                try {
                    Pk.textContent = "Preview failed: " + (t && t.message || t);
                } catch (e) { __sxErrLog("preview-label", e); }
            }
        }
        function Ix(e) {
            return e > 35 ? "for" : e >= 0 ? "curious" : "against";
        }
        function Px() {
            ex(), Ui(vk);
        }
        async function Lx(e) {
            if ("DecompressionStream" in window) try {
                const t = new Blob([ e ]).stream().pipeThrough(new DecompressionStream("deflate"));
                return new Uint8Array(await new Response(t).arrayBuffer());
            } catch (e) { __sxErrLog("app", e); }
            return function(e) {
                if (e.length < 6 || (e[0] << 8 | e[1]) % 31 != 0 || 8 != (15 & e[0]) || 32 & e[1]) throw new Error("The PNG profile data is not readable.");
                let t = 2, n = [], i = 0, a = !1;
                for (;!a; ) {
                    if (t + 5 > e.length - 4) throw new Error("The PNG profile data is incomplete.");
                    const r = e[t++];
                    if (a = Boolean(1 & r), r >>> 1 & 3) throw new Error("The PNG profile data needs a newer browser.");
                    const o = e[t] | e[t + 1] << 8, s = e[t + 2] | e[t + 3] << 8;
                    if (t += 4, 65535 & (o ^ ~s) || t + o > e.length - 4) throw new Error("The PNG profile data is incomplete.");
                    const l = e.slice(t, t + o);
                    n.push(l), i += l.length, t += o;
                }
                const r = new Uint8Array(i);
                let o = 0;
                n.forEach(e => {
                    r.set(e, o), o += e.length;
                });
                // Rank 5: the zlib stream ends in an Adler-32 checksum
                // over the decompressed bytes — the integrity check the
                // format already carries. The old code reserved those
                // four bytes in its bounds checks but never compared
                // them, so a stream with a damaged checksum could still
                // inflate here after DecompressionStream refused it.
                let sxAdlerA = 1, sxAdlerB = 0;
                for (let sxK = 0; sxK < r.length; sxK++) sxAdlerA = (sxAdlerA + r[sxK]) % 65521, sxAdlerB = (sxAdlerB + sxAdlerA) % 65521;
                const sxAdlerWant = (e[e.length - 4] << 24 | e[e.length - 3] << 16 | e[e.length - 2] << 8 | e[e.length - 1]) >>> 0;
                if ((sxAdlerB << 16 | sxAdlerA) >>> 0 !== sxAdlerWant) throw new Error("The PNG profile data is damaged or incomplete.");
                return r;
            }(e);
        }
        function Tx() {
            Tf && URL.revokeObjectURL(Tf), Tf = null, Fg.removeAttribute("href"), Fg.removeAttribute("download"), 
            Tg.replaceChildren(), Ng.textContent = "", Ui(Lg);
        }
        function Fx(t, i) {
            const a = function(e) {
                const t = String(e || "").replace(/\r\n[ \t]/g, "").split(/\r?\n/), n = Rv({}), i = Object.fromEntries(Object.entries(Kv).map(([e, t]) => [ t, e ]));
                let a = "";
                return t.forEach(e => {
                    const t = e.indexOf(":");
                    if (t < 1) return;
                    const r = e.slice(0, t).toUpperCase().split(";")[0], o = Gv(e.slice(t + 1).trim());
                    if ("FN" === r) a = o; else if (i[r]) n[i[r]] = o; else if ("TEL" === r) n.phone = o; else if ("EMAIL" === r) n.email = o; else if ("X-CUSTOM-SITE" === r) {
                        const e = o.split("~~~");
                        3 === e.length && n.customSites.push({
                            site: Gv(e[0]),
                            url: Gv(e[1]),
                            username: Gv(e[2])
                        });
                    } else if ("URL" === r) {
                        const e = _v.find(e => {
                            const t = _i(e, "").replace(/\/$/, "");
                            return t && o.toLowerCase().startsWith(t.toLowerCase());
                        });
                        e && (n[e] = o);
                    }
                }), {
                    name: a,
                    contact: Rv(n)
                };
            }(t), r = a.contact;
            if (!i || !Ov(r)) return;
            ut[i] = r, Tf && URL.revokeObjectURL(Tf), Tf = URL.createObjectURL(new Blob([ t ], {
                type: "text/vcard;charset=utf-8"
            }));
            const o = [], s = new Map;
            [ [ "telegram", "Telegram" ], [ "linktree", "linktr.ee" ], [ "fetlife", "FetLife" ], [ "chaturbate", "Chaturbate" ], [ "stripchat", "Stripchat" ], [ "myfreecams", "MyFreeCams" ], [ "pornhub", "PornHub" ], [ "xvideos", "XVideos" ], [ "xhamster", "xHamster" ], [ "onlyfans", "OnlyFans" ], [ "reddit", "Reddit" ], [ "x", "X" ] ].forEach(([e, t]) => {
                const n = r[e];
                if (!n) return;
                const i = n.toLowerCase();
                s.has(i) || s.set(i, {
                    sites: [],
                    user: n,
                    at: !1
                });
                const a = s.get(i);
                a.sites.push({
                    label: t,
                    href: _i(e, n)
                }), "telegram" === e && (a.at = !0);
            }), (r.customSites || []).forEach(e => {
                if (!e.username) return;
                const t = e.username.toLowerCase();
                s.has(t) || s.set(t, {
                    sites: [],
                    user: e.username,
                    at: !1
                }), s.get(t).sites.push({
                    label: e.site,
                    href: e.url
                });
            }), s.forEach(e => {
                const t = e.sites.map(e => `<a href="${Hi(e.href)}" target="_blank" rel="noopener noreferrer"><strong>${Hi(e.label)}</strong></a>`).join(", ");
                o.push(`<div class="imported-contact-row"><span>${t}</span><span>${Hi((e.at ? "@" : "") + e.user)}</span></div>`);
            }), r.phone && o.push(`<div class="imported-contact-row"><strong>Phone</strong><a href="${Hi("tel:" + r.phone.replace(/[^+\d]/g, ""))}" target="_blank" rel="noopener noreferrer">${Hi(r.phone)}</a></div>`), 
            r.email && o.push(`<div class="imported-contact-row"><strong>Email</strong><a href="${Hi("mailto:" + r.email)}" target="_blank" rel="noopener noreferrer">${Hi(r.email)}</a></div>`), 
            n(Tg, o.join("")), e.byId("importedContactTitle").textContent = `Contact info for ${a.name || wt[i] || "profile"}`, 
            Fg.href = Tf, Fg.download = `${String(a.name || wt[i] || "contact").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").trim() || "contact"}.vcf`, 
            Ng.textContent = "", Wi(Lg);
        }
        function sxScrapeFetLifeProfile(raw) {
            try {
                const html = ux(String(raw || "")) || String(raw || "");
                if (!/<(?:html|body|main|section|article|div|h1)\b/i.test(html)) return null;
                const doc = (new DOMParser).parseFromString(html, "text/html");
                doc.querySelectorAll("script,style,noscript,svg,iframe").forEach(e => e.remove());
                const clean = s => String(s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(), out = {};
                const h1 = doc.querySelector("h1");
                if (h1) for (const span of h1.querySelectorAll("span")) {
                    const m = clean(span.textContent).match(/^(\d{2,3})([A-Za-z]{1,3})\b/);
                    if (!m) continue;
                    const age = Xv(m[1]);
                    age && (out.age = age);
                    const gender = {
                        M: "man",
                        F: "woman",
                        GF: "genderfluid"
                    }[m[2].toUpperCase()];
                    gender && (out.gender = [ gender ]);
                    break;
                }
                const reserved = new Set([ "settings", "fetishes", "kinktionary", "search", "login", "join", "signup", "home", "explore", "kinksters", "users", "profile" ]);
                let username = "";
                for (const frame of doc.querySelectorAll("turbo-frame[src]")) {
                    const m = (frame.getAttribute("src") || "").match(/^\/([A-Za-z0-9_.-]+)\/profile\/fetishes/);
                    if (m) {
                        username = m[1];
                        break;
                    }
                }
                if (!username) {
                    const canon = doc.querySelector('link[rel="canonical"]'), og = doc.querySelector('meta[property="og:url"]'), url = canon && canon.getAttribute("href") || og && og.getAttribute("content") || "", m = url.match(/^https?:\/\/(?:www\.)?fetlife\.com\/([A-Za-z0-9_.-]+)\/?(?:[?#].*)?$/i);
                    m && (username = m[1]);
                }
                if (!username) for (const a of doc.querySelectorAll("a[href]")) {
                    const m = (a.getAttribute("href") || "").match(/^https?:\/\/(?:www\.)?fetlife\.com\/([A-Za-z0-9_.-]+)\/(?:activity|pictures|writings|events|groups|profile)\b/i);
                    if (m) {
                        username = m[1];
                        break;
                    }
                }
                username && !reserved.has(username.toLowerCase()) && (out.username = username);
                const rowTerms = label => {
                    for (const div of doc.querySelectorAll("div")) {
                        if (div.children.length || clean(div.textContent) !== label) continue;
                        const cell = div.nextElementSibling;
                        if (!cell) return null;
                        const clone = cell.cloneNode(!0);
                        clone.querySelectorAll("[data-popover-template]").forEach(e => e.remove());
                        const terms = [], seen = new Set;
                        return clone.textContent.split(",").forEach(piece => {
                            const term = clean(piece);
                            term && term.length <= 60 && !seen.has(term) && (seen.add(term), terms.push(term));
                        }), terms.length ? terms : null;
                    }
                    return null;
                }, pickValues = (selectEl, terms) => {
                    if (!selectEl || !terms) return null;
                    const vals = [], seen = new Set;
                    return terms.forEach(term => {
                        const key = ck(term), slug = term.toLowerCase().replace(/\s+/g, "-");
                        [ ...selectEl.options ].forEach(opt => {
                            const label = clean(opt.textContent).replace(/\s*\([^()]*\)\s*$/, "");
                            (ck(label) === key || opt.value === slug) && !seen.has(opt.value) && (seen.add(opt.value), vals.push(opt.value));
                        });
                    }), vals.length ? vals : null;
                };
                const orientation = pickValues(Ug, rowTerms("Orientation"));
                orientation && (out.orientation = orientation);
                const role = pickValues(Gg, rowTerms("Roles"));
                role && (out.role = role);
                const pronouns = rowTerms("Pronouns");
                pronouns && (out.pronouns = pronouns.join(", "));
                for (const h2 of doc.querySelectorAll("h2")) {
                    if (!/^about\b/i.test(clean(h2.textContent))) continue;
                    const siblings = [];
                    let story = null;
                    for (let sib = h2.nextElementSibling; sib; sib = sib.nextElementSibling) {
                        if (sib.matches("h2,h3") || sib.querySelector("h2,h3")) break;
                        sib.matches(".story__copy") && !story && (story = sib), siblings.push(sib);
                    }
                    const nodes = story ? [ story ] : siblings;
                    if (nodes.length) {
                        const text = nodes.map(src => {
                            const clone = src.cloneNode(!0);
                            return clone.querySelectorAll("br").forEach(br => br.replaceWith(doc.createTextNode("\n"))), 
                            clone.querySelectorAll("p").forEach(p => p.appendChild(doc.createTextNode("\n"))), clone.textContent;
                        }).join("\n").split(/\r\n|[\r\n]/).map(line => line.replace(/\u00a0/g, " ").replace(/[^\S\n]+/g, " ").trim()).filter(Boolean).join("\n");
                        text && (out.about = text.slice(0, 1500));
                    }
                    break;
                }
                return Object.keys(out).length ? out : null;
            } catch (err) {
                return __sxErrLog("fetlife-autopopulate-scrape", err), null;
            }
        }
        function sxStageFetLifeProfile(target, fields) {
            if (!bw(target)) return;
            const sc = ut[target] || {}, filled = v => String(v || "").trim().length > 0;
            fields.gender && !bb(rt[target] || []).length && kb(fields.gender), fields.orientation && !iv(ot[target] || []).length && Fb(fields.orientation), 
            fields.role && !Gb(st[target] || []).length && Vb(fields.role), fields.age && !filled(lt[target]) && (Kg.value = fields.age), fields.about && !filled(nt[target]) && (im.value = fields.about), 
            fields.username && !filled(sc.fetlife) && stageContactUsername(fields.username), fields.pronouns && !filled(pz[target]) && (Pz.value = String(fields.pronouns).trim().slice(0, 60)), xb(), Eb(), Ob(), Yb(), Qb(), dw(), 
            sm.textContent = "Filled in from the FetLife page you loaded — check them over, then Save to keep them. Close without saving to discard them.";
        }
        function sxOpenStagedProfile(target, fields) {
            let tries = 0, clear = 0;
            const tick = () => {
                if (_g.open) return;
                if (++tries > 100) return;
                const rd = e.byId("importResultDialog"), bd = e.byId("fetlifeBroadDialog");
                if (clear = rd && rd.open || bd && bd.open ? 0 : clear + 1, clear >= 2) {
                    try {
                        sxStageFetLifeProfile(target, fields);
                    } catch (err) {
                        __sxErrLog("fetlife-autopopulate-stage", err);
                    }
                    return;
                }
                window.setTimeout(tick, 300);
            };
            window.setTimeout(tick, 350);
        }
        Ok.addEventListener("click", e => {
            const v = __sxClosestAction(e.target, "ktNav");
            if (v) return void ktNavGo(v.getAttribute("data-kt-nav"));
            const t = __sxClosestAction(e.target, "testIndex");
            if (!t) return;
            const n = t.dataset.testIndex, i = t.dataset.testGroup;
            Xk[n] || (Xk[n] = {}), Ok.addEventListener("input", e => { const t = __sxClosestAction(e.target, "testNote"); if (!t) return; const n = t.getAttribute("data-test-note"); Xk[n] || (Xk[n] = {}), Xk[n].note = t.value; }), Xk[n][i] = t.dataset.testValue, __sxClosestAction(t, "testChoiceGroup").querySelectorAll("button").forEach(e => e.setAttribute("aria-pressed", String(e === t))), 
            Ex();
        }), _k.addEventListener("click", () => xx("test")), Dk.addEventListener("click", () => xx("paste")), 
        e.byId("previewTestAnswers") && e.byId("previewTestAnswers").addEventListener("click", () => {
            const e = function() {
                if ("kinktest" === Gk) {
                    const e = {}, t = {}, n = {}, i = [], a = [];
                    let r = 0;
                    return ix.forEach((o, s) => {
                        const l = Xk[s] && Xk[s].answer;
                        if (!l) return;
                        o.id = migrateNodeKey(o.id);
                        let c = "";
                        if ("1" === l) t[o.id] = "limit", n[o.id] = !0, c = "Hard Limit"; else if ("2" === l) t[o.id] = "notinterested", 
                        n[o.id] = !0, c = "Not Interested"; else {
                            const t = {
                                3: 33,
                                4: 100
                            }[l];
                            sx(e, o.id, o.direction, t), c = String(t);
                        }
                        i.push(`#${o.number} ${o.question} → ${sxNodePath(o.id)} · ${o.direction} · ${c}`), r++;
                    }), lx(e, {
                        annotations: t,
                        discreteNodes: n,
                        mappedLines: r,
                        totalLines: ix.length,
                        warnings: a,
                        bestFit: [],
                        mappings: i
                    });
                }
                const e = {}, t = {}, p = {}, n = {}, i = {}, a = [], r = [];
                let o = 0;
                const sxSug = [];
                const s = (t, n, i) => {
                    (e[t] || (e[t] = {}), e[t][n] = i);
                };
                const v = { "0": 0, "1": 20, "2": 40, "3": 60, "4": 80, "5": 100 };
                return ax.forEach((e, l) => {
                    const c = Xk[l] || {}, cc = axCat[e] || "Yes / No / Maybe",
                        ha = c.answer && void 0 !== v[c.answer], nt = c.note && c.note.trim();
                    if (!ha && !nt) return;
                    const d = ox(e);
                    if (!d) return void (ha && r.push(`${cc} / “${e}” has no matching topic and was skipped.`));
                    const u = pk(d, e, i);
                    if (u) {
                        ha && (s(u.id, "give", v[c.answer]), s(u.id, "receive", v[c.answer]), a.push({
                            text: `${cc} / ${e} → ${sxNodePath(u.id)} · give + receive · ${v[c.answer]}`,
                            tertiary: !1
                        }), o++), u.suggestion && sxSug.push({
                            name: u.suggestion.name,
                            parentId: u.id,
                            parentPath: sxNodePath(u.id),
                            section: "",
                            direction: "both",
                            value: v[c.answer]
                        });
                        nt && (p[u.id] = (p[u.id] ? p[u.id] + " · " : "") + nt);
                    } else ha && r.push(`${cc} / “${e}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                }), {
                    ratings: e,
                    annotations: t,
                    discreteNodes: n,
                    children: i,
                    suggestions: sxSug,
                    notes: p,
                    mappedLines: o,
                    totalLines: ax.length,
                    warnings: r,
                    bestFit: [],
                    mappings: a
                };
            }();
            e.mappedLines ? (Cx(e), Ck.scrollIntoView({
                block: "nearest"
            })) : Pk.textContent = "Choose at least one answer first.";
        }), Wk.addEventListener("click", () => {
            const e = ax.map((e, t) => {
                const n = Xk[t] && Xk[t].answer;
                return n ? `${e}: ${n[0].toUpperCase() + n.slice(1)}, S` : "";
            }).filter(Boolean);
            e.length ? ($k.value = e.join(" "), $k.dispatchEvent(new Event("input", {
                bubbles: !0
            })), Mx(), Ck.scrollIntoView({
                block: "nearest"
            })) : Pk.textContent = "Choose at least one answer first.";
        }), e.all("[data-converter]").forEach(e => e.addEventListener("click", () => Ax(e.dataset.converter, e.dataset.converterMode || "auto"))), 
        e.all("[data-test-choice]").forEach(t => t.addEventListener("click", () => {
            const n = Xy || Mt;
            Ui(e.byId("testChooserDialog")), Xy = null, n && vt[n] && Ax(t.dataset.testChoice, "test", n);
        })), e.byId("rateInListViewChoice") && e.byId("rateInListViewChoice").addEventListener("click", () => {
            const t = Xy || Mt;
            Ui(e.byId("testChooserDialog")), Xy = null, t && vt[t] && (t !== Mt && Js(t), Ms(t));
        }), e.byId("closeTestChooser") && e.byId("closeTestChooser").addEventListener("click", Jy), e.byId("testChooserDialog") && e.byId("testChooserDialog").addEventListener("click", e => {
            "testChooserDialog" === e.target.id && Jy();
        }), e.byId("testChooserDialog") && e.byId("testChooserDialog").addEventListener("cancel", e => {
            e.preventDefault(), Jy();
        }), e.byId("closeConverter") && (e.byId("closeConverter").onclick = Px), vk.addEventListener("click", e => {
            e.target === vk && Px();
        }), vk.addEventListener("cancel", e => {
            e.preventDefault(), Px();
        }), e.byId("loadConverterExample") && (e.byId("loadConverterExample").onclick = () => {
            Vk = null, Yk = null, $k.value = "fetlife" === Gk ? fetlifeSampleHtml : "checklist" === Gk ? ax.map((e, t) => `${e}: ${t % 6}`).join(" ") : nx[Gk] || "", 
            Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", "fetlife" === Gk && Mx();
        }), Tk && (Tk.onclick = () => Fk.click()), Fk.addEventListener("change", e => {
            const t = e.target.files[0];
            if (!t) return;
            const n = new FileReader;
            n.onload = () => {
                const i = px(String(n.result || ""));
                sxFlFields = sxScrapeFetLifeProfile(String(n.result || ""));
                Vk = i.text, Yk = function(e) {
                    const t = {
                        into: [],
                        curious: [],
                        soft: [],
                        hard: [],
                        favorite: [],
                        not: [],
                        neutral: [],
                        fantasy: [],
                        tried: []
                    }, n = {}, i = {
                        into: "Into",
                        curious: "Curious about",
                        soft: "Soft limits",
                        hard: "Hard limits",
                        favorite: "Favorites",
                        not: "Not into",
                        neutral: "Neutral",
                        fantasy: "Fantasy only",
                        tried: "Already tried"
                    }, a = {
                        into: "into",
                        interests: "into",
                        favorites: "favorite",
                        favorite: "favorite",
                        "curious about": "curious",
                        curious: "curious",
                        neutral: "neutral",
                        "soft limits": "soft",
                        "soft limit": "soft",
                        "hard limits": "hard",
                        "hard limit": "hard",
                        "not into": "not",
                        "not interested": "not",
                        "fantasy only": "fantasy",
                        "already tried": "tried"
                    }, r = {
                        giving: "giving",
                        "as a top": "giving",
                        top: "giving",
                        receiving: "receiving",
                        "as a bottom": "receiving",
                        bottom: "receiving",
                        both: "giving and receiving",
                        switch: "giving and receiving",
                        "giving and receiving": "giving and receiving",
                        "giving receiving": "giving and receiving",
                        "everything to do with it": "everything to do with it",
                        watching: "watching",
                        wearing: "wearing",
                        "watching others wear": "watching others wear",
                        "watching others wearing": "watching others wear"
                    };
                    let o = null, s = null;
                    gx(String(e || "")).forEach(e => {
                        const i = e.replace(/\u00a0/g, " ").replace(/^[\s•·*]+|[\s•·*]+$/g, "").trim();
                        if (!i) return;
                        const l = ck(i), c = l.replace(/\s+\d+$/, "");
                        if (a[c]) return o = a[c], void (s = null);
                        if (r[c]) return void (s = r[c]);
                        if ([ "fetishes", "kinks", "fetish list", "kink list", "edit", "show more", "show less" ].includes(l) || /^(?:view|show)\s+all\b/i.test(i) || /^https?:\/\//i.test(i)) return;
                        let d = i.split(/\t+|\s*\|\s*|\s+[—–]\s+/).map(e => e.trim()).filter(Boolean);
                        if (1 === d.length) {
                            const e = i.match(/^(.+?):\s*(.+)$/);
                            e && (d = [ e[1], e[2] ]);
                        }
                        const u = (d.shift() || "").replace(/^[-*•·\d.)\s]+/, "").trim();
                        if (!u) return;
                        let p = d.join(" ").trim(), h = o;
                        const g = ck(p), m = Object.keys(a).sort((e, t) => t.length - e.length).find(e => new RegExp(`(?:^|\\b)${e.replace(/ /g, "\\s+")}(?:\\b|$)`, "i").test(g));
                        if (m && (h = a[m], p = p.replace(new RegExp(`(?:^|[·—–,;|\\s])${m.replace(/ /g, "\\s+")}(?=$|[·—–,;|\\s])`, "i"), " ").replace(/^[\s,;|·—–]+|[\s,;|·—–]+$/g, "").trim()), 
                        !h) return;
                        const f = Object.keys(r).find(e => new RegExp(`(?:^|\\b)${e.replace(/ /g, "\\s+")}(?:\\b|$)`, "i").test(ck(p))), y = p || (f ? r[f] : s), b = y ? `${u} — ${y}` : u, v = ck(b);
                        n[h] || (n[h] = new Set), n[h].has(v) || (t[h].push(b), n[h].add(v));
                    });
                    const l = [ "into", "curious", "soft", "hard" ], c = [ "favorite", "not", "neutral", "fantasy", "tried" ];
                    if ([ ...l, ...c ].some(e => t[e].length)) {
                        const e = l.map(e => `${i[e]}: ${t[e].join(", ")}`);
                        return c.filter(e => t[e].length).forEach(n => e.push(`${i[n]}: ${t[n].join(", ")}`)), 
                        e.join("  ");
                    }
                    return String(e || "").replace(/FETLIFE_SECTION_HEADING_[1-6]/gi, " ").split(/\r\n|[\r\n]/).map(e => e.replace(/\u00a0/g, " ").replace(/[^\S\n]+/g, " ").trim().replace(/^,+\s*|\s*,+$/g, "")).filter(Boolean).join(", ");
                }(i.text), $k.value = Yk, Ck.hidden = !0, Lk.disabled = !0, Kk = null, Pk.textContent = i.missingSection ? `Opened ${t.name}, but the Fetishes section isn't in this file, so nothing was loaded. FetLife keeps that section in a separate frame that only a single-file save captures: open the profile, scroll to the Fetishes area and expand every subsection, then save the page again as 'Webpage, Single File' (.mhtml) — not 'HTML Only' — and load the new file. Or open fetlife.com/<username>/profile/fetishes and save that page instead.` : `Opened ${t.name}${i.sectionFound ? " and isolated its Fetishes section" : ""}. Preview the matches before loading them.`, 
                e.target.value = "";
            }, n.onerror = () => {
                Pk.textContent = "Could not read that saved page.", e.target.value = "";
            }, n.readAsText(t);
        }), (e.byId("previewConverter") || {}).onclick = Mx, Lk && (Lk.onclick = function() {
            if (Kk && !Lk.disabled) {
                const sxIds = Object.keys(wt).filter(e => Boolean(vt[e]) && !(ft[e] && "group" === ft[e].kind));
                if (!sxIds.length) return void (Pk.textContent = Object.keys(wt).some(e => Boolean(vt[e])) ? "Only pair/group profiles are open, and test results can't be loaded directly into a pair. Open one of the pair's own profiles first." : "No profile exists to load these results into.");
                // No second dialogue on a pressed-tab Load
                // (split-center stage, 2026-10-27): when this
                // converter session was opened from a profile tab's
                // Load menu, its origin is already the target — load
                // straight into it instead of asking again. Sessions
                // with no pressed-tab origin keep the chooser below.
                // Caller-tab re-import (owner ruling 2026-10-30): a
                // pair/group origin is NOT a direct target — the merge
                // itself refuses pair targets, so a direct load here
                // would strand the session on that refusal with no way
                // to pick a member profile. Pair origins fall through
                // to the chooser, which excludes pairs with its
                // explanation, exactly as the first-import prompt does.
                if (sxConverterOrigin && vt[sxConverterOrigin] && !(ft[sxConverterOrigin] && "group" === ft[sxConverterOrigin].kind)) {
                    const sxDirect = sxConverterOrigin;
                    try {
                        const sxMerged = yx.merge("converter", Kk, {
                            target: sxDirect,
                            type: Gk
                        });
                        if ("fetlife" === Gk && sxFlFields && vt[sxDirect]) {
                            const sxFields = sxFlFields;
                            sxFlFields = null, sxOpenStagedProfile(sxDirect, sxFields);
                        }
                        return sxMerged;
                    } catch (e) {
                        return void (Pk.textContent = yx.errorMessage(e, "Those results could not be loaded."));
                    }
                }
                const sxDlg = document.createElement("dialog");
                sxDlg.className = "converter-target-dialog";
                const sxClosePrompt = function() {
                    Ui(sxDlg), sxDlg.remove();
                }, sxTitle = document.createElement("h3");
                sxTitle.textContent = "Load into which profile?", sxDlg.appendChild(sxTitle), Object.keys(wt).some(e => vt[e] && ft[e] && "group" === ft[e].kind) && (() => {
                    const sxNote = document.createElement("p");
                    sxNote.textContent = "Pair/group profiles are not listed: test results can't be loaded directly into a pair, because a pair's numbers are computed from its source profiles. Pick one of the pair's own profiles instead.", sxDlg.appendChild(sxNote);
                })();
                sxIds.forEach(sxId => {
                    const sxBtn = document.createElement("button");
                    // Neutral chooser (firm spec, reaffirmed
                    // 2026-10-27 08:49): every profile is listed by
                    // plain name only — no on-screen marking,
                    // no preselection, and no button is focused as a
                    // default. The list stays neutral until the user
                    // explicitly chooses; that explicit choice, not
                    // whoever is on screen, is the target.
                    sxBtn.type = "button", sxBtn.textContent = wt[sxId], sxBtn.onclick = function() {
                        sxClosePrompt();
                        try {
                            const sxMerged = yx.merge("converter", Kk, {
                                target: sxId,
                                type: Gk
                            });
                            if ("fetlife" === Gk && sxFlFields && sxId && vt[sxId]) {
                                const sxFields = sxFlFields;
                                sxFlFields = null, sxOpenStagedProfile(sxId, sxFields);
                            }
                            return sxMerged;
                        } catch (e) {
                            Pk.textContent = yx.errorMessage(e, "Those results could not be loaded.");
                        }
                    }, sxDlg.appendChild(sxBtn);
                });
                const sxCancel = document.createElement("button");
                sxCancel.type = "button", sxCancel.textContent = "Cancel", sxCancel.onclick = function() {
                    sxClosePrompt();
                }, sxDlg.appendChild(sxCancel), sxDlg.addEventListener("cancel", () => {
                    sxClosePrompt();
                }), sxDlg.addEventListener("close", () => {
                    sxDlg.remove();
                }), document.body.appendChild(sxDlg), Wi(sxDlg);
            }
        }), $k.addEventListener("input", () => {
            sxFlFields = null, Vk = null, Yk = null, Ck.hidden = !0, Lk.disabled = !0, Kk = null, Pk.textContent = "";
        }), e.byId("closeImportedContact") && (e.byId("closeImportedContact").onclick = Tx), e.byId("doneImportedContact") && (e.byId("doneImportedContact").onclick = Tx), 
        Lg.addEventListener("click", e => {
            e.target === Lg && Tx();
        }), Lg.addEventListener("cancel", e => {
            e.preventDefault(), Tx();
        }), Fg.addEventListener("click", () => {
            Ng.textContent = "Your device will open or download the contact card.";
        });
        const Nx = e.byId("fileInput"), _x = e.byId("qrImageInput"), Dx = e.byId("qrCameraPanel"), Rx = e.byId("qrCameraVideo");
        let Ox = null, Bx = 0;
        function jx(e, t, n = 128) {
            const i = new Uint8ClampedArray(e.length);
            for (let a = 0; a < e.length; a += 4) {
                const r = .299 * e[a] + .587 * e[a + 1] + .114 * e[a + 2];
                let o;
                o = "contrast" === t ? Math.max(0, Math.min(255, 1.55 * (r - 128) + 128)) : r < n ? 0 : 255, 
                i[a] = i[a + 1] = i[a + 2] = o, i[a + 3] = 255;
            }
            return i;
        }
        function qx() {
            return new Promise(e => requestAnimationFrame(() => t.setTimeout(e, 0)));
        }
        async function Hx(e, t, n = 1 / 0) {
            const i = e.getImageData(0, 0, t.width, t.height), a = {
                inversionAttempts: "dontInvert"
            };
            await qx();
            let r = jsQR(i.data, i.width, i.height, a);
            if (r && r.data) return r.data;
            if (performance.now() > n) return null;
            const o = jx(i.data, "contrast");
            if (await qx(), r = jsQR(o, i.width, i.height, a), r && r.data) return r.data;
            if (performance.now() > n) return null;
            const s = jx(o, "threshold", function(e) {
                const t = new Uint32Array(256);
                let n = 0, i = 0;
                for (let a = 0; a < e.length; a += 4) {
                    const r = Math.round(.299 * e[a] + .587 * e[a + 1] + .114 * e[a + 2]);
                    t[r]++, i += r, n++;
                }
                let a = 0, r = 0, o = -1, s = 128;
                for (let e = 0; e < 256; e++) {
                    if (a += t[e], !a) continue;
                    const l = n - a;
                    if (!l) break;
                    r += e * t[e];
                    const c = r / a, d = (i - r) / l, u = a * l * (c - d) * (c - d);
                    u > o && (o = u, s = e);
                }
                return s;
            }(o));
            return await qx(), r = jsQR(s, i.width, i.height, {
                inversionAttempts: "attemptBoth"
            }), r && r.data || null;
        }
        function Wx(e) {
            const t = String(e || "").match(/^SCP4:([0-9A-Z]+):(\d+):(\d+):([\s\S]*)$/);
            if (!t) return null;
            const n = Number(t[2]), i = Number(t[3]);
            return !Number.isInteger(n) || !Number.isInteger(i) || n < 1 || i < 2 || n > i || i > 99 ? null : {
                bundleId: t[1],
                index: n,
                total: i,
                data: t[4]
            };
        }
        async function Ux(e, t = !1) {
            if ("function" != typeof window.jsQR && (window.__loadQrScanner && await window.__loadQrScanner(), 
            "function" != typeof window.jsQR)) throw new Error("The QR reader did not load.");
            const n = e instanceof HTMLVideoElement, i = n ? e : "function" == typeof createImageBitmap && e instanceof Blob ? await createImageBitmap(e) : await zu(await Vu(e)), a = n ? e.videoWidth : i.naturalWidth || i.width, r = n ? e.videoHeight : i.naturalHeight || i.height, o = [], s = new Set, l = performance.now() + (n ? 900 : 8500), c = e => !(!e || s.has(e) || (s.add(e), 
            o.push(e), 0));
            if (!a || !r) return n || "function" != typeof i.close || i.close(), t ? [] : null;
            if ("function" == typeof BarcodeDetector) try {
                const e = new BarcodeDetector({
                    formats: [ "qr_code" ]
                }), n = await e.detect(i);
                for (const e of n || []) c(e.rawValue);
                if (o.length && !t) return o[0];
            } catch (e) { __sxErrLog("app", e); }
            const d = n ? [ [ 0, 0, a, r, 1100 ] ] : [ [ .755 * a, .69 * r, .235 * a, .235 * r, 1320 ], [ .72 * a, .62 * r, .28 * a, .38 * r, 1120 ], [ 0, .62 * r, .32 * a, .38 * r, 1120 ], [ 0, 0, .34 * a, .38 * r, 1120 ], [ .66 * a, 0, .34 * a, .38 * r, 1120 ], [ 0, 0, a, r, 1200 ], [ .5 * a, .5 * r, .5 * a, .5 * r, 1120 ], [ 0, .5 * r, .5 * a, .5 * r, 1120 ], [ .5 * a, 0, .5 * a, .5 * r, 1120 ], [ 0, 0, .5 * a, .5 * r, 1120 ] ], u = new Set, p = e => {
                const n = Wx(e);
                if (!t || !n || u.has(n.total)) return;
                u.add(n.total);
                const i = 1 === n.total ? 1 : n.total <= 6 ? 2 : 3, o = Math.ceil(n.total / i), s = .047 * a, l = .035 * r, c = n.total > 1 ? .045 * r : 0, p = .0275 * a, h = .021 * r, g = (a - 2 * s - p * (i - 1)) / i, m = (r - 2 * l - c - .082 * r - h * (o - 1)) / o;
                for (let e = 0; e < o; e++) for (let t = 0; t < i; t++) {
                    const n = s + t * (g + p), i = l + c + e * (m + h);
                    d.push([ n, i, g, m, 1120 ]);
                }
            };
            o.forEach(p);
            const h = document.createElement("canvas"), g = h.getContext("2d", {
                willReadFrequently: !0
            });
            try {
                for (const [e, o, s, u, m] of d) {
                    if (performance.now() > l) break;
                    const d = Math.max(0, Math.floor(e)), f = Math.max(0, Math.floor(o)), y = Math.max(1, Math.min(a - d, Math.ceil(s))), b = Math.max(1, Math.min(r - f, Math.ceil(u))), v = Math.max(y, b), w = 175e4, k = Math.min(n ? 1.35 : 3.25, m / v, Math.sqrt(w / (y * b)));
                    h.width = Math.max(1, Math.round(y * k)), h.height = Math.max(1, Math.round(b * k)), 
                    g.clearRect(0, 0, h.width, h.height), g.imageSmoothingEnabled = !1, g.filter = "none", 
                    g.drawImage(i, d, f, y, b, 0, 0, h.width, h.height);
                    const x = await Hx(g, h, l);
                    if (x && (c(x), p(x), !t)) return x;
                    await qx();
                }
            } finally {
                h.width = 1, h.height = 1, n || "function" != typeof i.close || i.close();
            }
            return t ? o : o[0] || null;
        }
        e.byId("chooseFile") && (e.byId("chooseFile").onclick = () => Nx.click()), e.byId("chooseQrImage") && (e.byId("chooseQrImage").onclick = () => _x.click());
        const Gx = new Map;
        async function Kx(e, t = "") {
            const n = Wx(e);
            let i = String(e || ""), a = "";
            if (n) {
                let e = Gx.get(n.bundleId);
                if (e && e.total === n.total || (e = {
                    total: n.total,
                    parts: new Map
                }, Gx.set(n.bundleId, e)), e.parts.set(n.index, n.data), e.parts.size < e.total) return Ig(`Captured profile QR ${n.index}/${e.total} · ${e.parts.size} of ${e.total} collected. Scan the remaining numbered codes in any order.`, "busy"), 
                null;
                if (i = Array.from({
                    length: e.total
                }, (t, n) => e.parts.get(n + 1) || "").join(""), !i || iu((new TextEncoder).encode(i)).toString(36).toUpperCase() !== n.bundleId) throw Gx.delete(n.bundleId), 
                new Error("The numbered profile QR set is incomplete or damaged.");
                Gx.delete(n.bundleId), a = `Recovered all ${e.total} numbered profile QR codes.`;
            }
            const r = kx(await yx.parse("qr", i)), o = a || t || `Imported ${wt[r]} from profile-data QR.`;
            return Sg.open && Ui(Sg), Ig(o, "success"), (t || a) && tS(o), r;
        }
        async function zx() {
            Bx && cancelAnimationFrame(Bx), Bx = 0, Ox && (Ox.getTracks().forEach(e => e.stop()), 
            Ox = null), Rx.srcObject = null, Dx.hidden = !0;
        }
        async function Vx() {
            if (Ox) {
                try {
                    const e = await Ux(Rx);
                    if (e && await Kx(e)) return void await zx();
                } catch (e) {
                    Ig(`QR import failed: ${e.message || "That QR code could not be read."}`, "error", !0);
                }
                Bx = requestAnimationFrame(Vx);
            }
        }
        async function Yx() {
            p("scan_started");
            try {
                await zx(), Ox = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },
                    audio: !1
                }), Rx.srcObject = Ox, Dx.hidden = !1, await Rx.play(), Ig("Point the camera at a profile-data QR. For a numbered set, scan every code in any order.", "busy"), 
                Vx();
            } catch (e) {
                Ig("Camera scanning is unavailable or permission was not granted.", "error", !0);
            }
        }
        e.byId("startQrCamera") && (e.byId("startQrCamera").onclick = Yx), e.byId("stopQrCamera") && (e.byId("stopQrCamera").onclick = zx);
        let Xx, Zx = 0;
        async function Qx(e, t, n) {
            if (n !== Zx) throw new Error("Import cancelled.");
            Ig("No embedded profile data found. Looking for a profile QR…", "busy"), await qx();
            const i = await Ux(e, !0);
            if (n !== Zx) throw new Error("Import cancelled.");
            const a = i.filter(e => Wx(e) || String(e || "").startsWith("SCP3:") || String(e || "").startsWith("SCP2J:"));
            if (!a.length) throw t;
            let r = null, o = null;
            for (const e of a) {
                o = Wx(e) || o;
                const t = await Kx(e, "metadata has been stripped, data has been recovered from QR code.");
                t && (r = t), await qx();
            }
            if (r) return r;
            if (o) {
                const e = Gx.get(o.bundleId), t = e ? e.parts.size : 0;
                throw new Error(`Found ${t} of ${o.total} numbered profile QR codes. Try the original image or scan the missing codes with the camera.`);
            }
            throw t;
        }
        function Jx(e) {
            const t = e.target.files[0];
            if (!t) return;
            const n = ++Zx;
            Ig(`Reading ${t.name}…`, "busy");
            const i = new FileReader;
            i.onload = async () => {
                if (n !== Zx) return;
                const a = new Uint8Array(i.result), r = 137 === a[0] && 80 === a[1] && 78 === a[2] && 71 === a[3], o = "application/pdf" === t.type || /\.pdf$/i.test(t.name) || 37 === a[0] && 80 === a[1] && 68 === a[2] && 70 === a[3], s = "application/json" === t.type || /\.json$/i.test(t.name), l = "image/svg+xml" === t.type || /\.svg$/i.test(t.name), c = /\.svgz$/i.test(t.name) || 31 === a[0] && 139 === a[1], d = String(t.type || "").startsWith("image/") || r;
                let u = "read";
                try {
                    if (await qx(), n !== Zx) return;
                    if (s) u = "json", kx(yx.parse("json", (new TextDecoder).decode(a))); else if (o) u = "pdf", 
                    kx(yx.parse("pdf", a)); else if (l || c) {
                        u = c ? "svgz" : "svg";
                        let e = a;
                        if (c) {
                            if ("function" != typeof DecompressionStream) throw new Error("This browser cannot open SVGZ files. Import the uncompressed SVG instead.");
                            e = new Uint8Array(await new Response(new Blob([ a ]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
                        }
                        const i = (new DOMParser).parseFromString((new TextDecoder).decode(e), "image/svg+xml");
                        if (i.querySelector("parsererror") || !i.documentElement || "svg" !== i.documentElement.localName) throw new Error("This SVG file is not valid.");
                        const r = i.querySelector("metadata > sexcapades-profile, sexcapades-profile");
                        if (r && String(r.textContent || "").trim()) {
                            let e;
                            try {
                                e = JSON.parse(r.textContent);
                            } catch (e) {
                                throw new Error("The profile data embedded in this SVG is damaged or incomplete.");
                            }
                            u = "profile", kx(e);
                        } else {
                            if (c) throw new Error("This SVGZ does not contain embedded Sexcapades profile data.");
                            u = "qr", await Qx(t, new Error("This SVG does not contain embedded Sexcapades profile data."), n);
                        }
                    } else {
                        if (!d) throw new Error("Choose a current Sexcapades SVG, SVGZ, PNG, PDF, sync card or profile-QR image, or profile JSON file.");
                        if (r) {
                            let e = null;
                            try {
                                e = await yx.parse("png", a);
                            } catch (e) {
                                u = "qr", await Qx(t, e, n);
                            }
                            if (e) {
                                u = "profile";
                                const t = kx(e.payload);
                                e.vcard && Fx(e.vcard, t);
                            }
                        } else u = "qr", await Qx(t, new Error("This image does not contain a readable Sexcapades profile-data QR code."), n);
                    }
                } catch (e) {
                    n === Zx && Pg(e, t, u);
                }
                e.target.value = "";
            }, i.onerror = () => {
                n === Zx && Pg(new Error("The file could not be read."), t, "read"), e.target.value = "";
            }, i.readAsArrayBuffer(t);
        }
        function eS() {
            const n = e.byId("toast"), i = e.byId("toastMessage");
            t.clear(Xx), n.classList.remove("show", "is-persistent"), n.removeAttribute("data-tone"), 
            n.setAttribute("role", "status"), i.textContent = "";
        }
        function tS(n, i = {}) {
            const a = e.byId("toast"), r = e.byId("toastMessage"), o = !0 === i.persistent || "error" === i.tone;
            r.textContent = n, a.classList.toggle("is-persistent", o), i.tone ? a.dataset.tone = i.tone : a.removeAttribute("data-tone"), 
            a.setAttribute("role", "error" === i.tone ? "alert" : "status"), a.classList.add("show"), 
            t.clear(Xx), o || (Xx = t.setTimeout(() => a.classList.remove("show"), 1800));
        }
        Nx.addEventListener("change", Jx), _x.addEventListener("change", Jx), Sg.addEventListener("close", () => {
            Zx++, zx(), sxPairLoadInto = null, sxLoadOriginId = null;
        }), e.byId("toastDismiss") && e.byId("toastDismiss").addEventListener("click", eS);
        const nS = e.one(".easter-egg");
        nS.addEventListener("click", () => {
            fetch("https://countapi.mileshilliard.com/api/v1/hit/sexcapades-easter-egg-skewed-view-blue", {
                mode: "no-cors",
                keepalive: !0
            }).catch((e) => { __sxErrLog("analytics-beacon", e); });
        });
        let iS = 0, aS = 0;
        e.one(".intro h1").addEventListener("click", () => {
            t.clear(aS), aS = t.setTimeout(() => iS = 0, 1700), 5 === ++iS && (iS = 0, nS.click());
        });
        let rS = !1, oS = !1, sS = !1, lS = !1;
        function cS() {
            let e = String(window.__SEXCAPADES_START_ROUTE || (window.__SEXCAPADES_LAYOUT_ROUTE ? window.__SEXCAPADES_LAYOUT_ROUTE(location.hash) : location.hash) || "");
            try {
                e = decodeURIComponent(e);
            } catch (e) { __sxErrLog("hash-decode", e); }
            return e;
        }
        function dS() {
            const e = cS();
            return !e || /^#\/?app\/?$/i.test(e) ? "" : /^#\/?(app\/)?(?:list|listview)\/?$/i.test(e) ? e : "";
        }
        function uS() {
            const e = cS();
            return /^#\/?app\/(?:map|mapview)\/?$/i.test(e) ? e : "";
        }
        function pS() {
            const e = cS();
            return /^#\/?(?:app\/)?(?:import(?:\/scan)?|scan)\/?$/i.test(e) ? e : "";
        }
        // Popularity list → hypermap fix (2026-10-28, scopes A+B+C):
        // the map-route render is a full rebuild; entered from the
        // Popularity list it ran as one synchronous block — seconds
        // of frozen screen with no indicator, because nothing on
        // this path ever armed one. This entry arms the two existing
        // progress surfaces before the render and defers the render
        // behind the house double-rAF + setTimeout(0) pattern (the
        // layout editor apply() deferral), so the armed state paints
        // before work begins:
        //   - the "Building your map…" overlay session
        //     (__sxLoadSessionStart): the render's own __sxLoad
        //     checkpoints drive it, and its map-complete gate holds
        //     it through any settle/blit tail after the paint;
        //   - the #9 paintbrush pill (__sxPillSessionStart/Finish),
        //     button-marked on the PERSISTENT title-bar view button
        //     (#mapListViewButton) — never the view-menu item
        //     (closeMenu() removes it) and never the list dialog's
        //     own view button (it closes with the dialog). The pill
        //     finishes on the overlay session's onDone — the same
        //     completion signal apply() uses — so pill, overlay and
        //     tail share exactly one window.
        // The render runs chunked via the one-shot
        // __sxRouteChunkPaint flag consumed in Mr (same 25-50 ms
        // clamp as the boot flag), set immediately before Mr so no
        // other render can take it. When either surface cannot arm
        // (a session is already active), or the map sits in its
        // safe-fallback state (jn — Mr would refuse the paint and
        // no checkpoint would ever drive an armed session), the
        // render runs exactly as before: synchronous, unflagged,
        // inside this call. No dirty check is added (scope D is
        // excluded): the full render still runs on every entry.
        function sxRouteRender() {
            let pillToken = null, armed = !1;
            const pillDone = () => {
                if (!pillToken) return;
                const t = pillToken;
                pillToken = null;
                try {
                    window.__sxPillSessionFinish(t);
                } catch (e) { __sxErrLog("route-render-pill-finish", e); }
            };
            if (!jn) try {
                if ("function" == typeof window.__sxPillSessionStart) pillToken = window.__sxPillSessionStart({
                    button: document.getElementById("mapListViewButton")
                });
                if ("function" == typeof window.__sxLoadSessionStart) armed = !!window.__sxLoadSessionStart({
                    onDone: pillDone
                });
            } catch (e) { __sxErrLog("route-render-arm", e); }
            const render = () => {
                if (armed) window.__sxRouteChunkPaint = 50;
                Mr({
                    animate: !1
                }), Ih();
                if (!armed) pillDone();
            };
            if (armed && window.requestAnimationFrame) requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(render, 0))); else render();
        }
        function gS() {
            const e = uS();
            return window.__SEXCAPADES_START_ROUTE = "", e ? !oS && (oS = !0, Do.open ? Is() : (sxRouteRender(), !0)) : (oS = !1, !1);
        }
        function mS() {
            const e = pS(), t = Boolean(function() {
                const e = cS();
                return /^#\/?(?:app\/)?(?:scan|import\/scan)\/?$/i.test(e) ? e : "";
            }());
            return window.__SEXCAPADES_START_ROUTE = "", e ? !sS && (sS = !0, ww(), t && Yx(), 
            !0) : (sS = !1, !1);
        }
        // Scribe deep-link door REMOVED (owner ruling, 2026-10-27):
        // Scribe's only doorway is the Scribe button — a deep link
        // carries no multi-select context, so the #scribe / #app/scribe
        // hash route (the former fS handler and its hS matcher) is
        // gone, and that hash now boots and navigates exactly like the
        // plain app route. The handler's old no-profile fallback (open
        // the import dialog with a "load a profile first" message) was
        // part of the deep-link door itself, not a separate behavior:
        // the import dialog keeps its own doors (the import route and
        // the add-profile menu), unchanged.
        window.addEventListener("hashchange", () => {
            window.__SEXCAPADES_START_ROUTE = "", function() {
                let e = String(location.hash || "");
                try {
                    e = decodeURIComponent(e);
                } catch (e) { __sxErrLog("hash-decode", e); }
                const t = /^#\/?(app\/)?(?:list|listview)\/?$/i.test(e);
                return t ? (rS = !0, Do.open || Ms(Mt && vt[Mt] ? Mt : Et)) : (rS = !1, Do.open && Is(!0, !t && !!uS() && !oS)), 
                t;
            }() || gS(), mS(), Nu();
        });
        const yS = Boolean(dS()), bS = Boolean(uS()), vS = Boolean(pS());
        !function() {
            const t = e.byId("legendRatingDemo");
            if (!t) return;
            const n = Array.from(t.querySelectorAll(".legend-live-control")), i = () => n.forEach(e => {
                e.classList.remove("is-active"), e.querySelector(".legend-direction-pill").setAttribute("aria-expanded", "false");
            }), a = (e, t = !0) => {
                const n = e.querySelector("input"), i = Number(n.value) || 0, a = e.querySelector(".legend-direction-pill");
                n.style.setProperty("--legend-thumb", t ? zi(i) : "var(--curious)"), a.style.background = t ? zi(i) : "#646d66", 
                a.dataset.tooltipValue = t ? ba(i) : "Unrated", Fs.visibleFor(a) && Fs.show(a, {
                    name: a.dataset.tooltipName,
                    definition: a.dataset.tooltipDefinition,
                    value: a.dataset.tooltipValue
                });
            };
            n.forEach(e => {
                const t = e.querySelector(".legend-direction-pill"), n = e.querySelector("input"), r = e.querySelector(".legend-live-clear");
                t.addEventListener("click", n => {
                    n.preventDefault(), n.stopPropagation();
                    const a = !e.classList.contains("is-active");
                    i(), a && (e.classList.add("is-active"), t.setAttribute("aria-expanded", "true"));
                }), e.addEventListener("mouseenter", () => {
                    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches && (i(), 
                    e.classList.add("is-active"), t.setAttribute("aria-expanded", "true"));
                }), e.addEventListener("mouseleave", () => {
                    e.contains(document.activeElement) || i();
                }), e.addEventListener("focusout", () => requestAnimationFrame(() => {
                    e.contains(document.activeElement) || i();
                })), n.addEventListener("input", () => a(e, !0)), r.addEventListener("click", r => {
                    r.preventDefault(), r.stopPropagation(), n.value = "0", a(e, !1), i(), t.focus({
                        preventScroll: !0
                    });
                }), a(e, !1);
            }), window.__sxOnPtr( e => {
                t.contains(e.target) || i();
            }, !0), Jt = () => {
                n.forEach(e => {
                    e.querySelector("input").value = "0", a(e, !1);
                }), i();
            };
        }(), window.__SEXCAPADES_LAYOUT_API = {
            apply(e) {
                e = migrateLayoutKeys(e);
                const t = Boolean(e && Object.prototype.hasOwnProperty.call(e, "expandAll"));
                if (Object.assign(mn, e || {}), t) rn.clear(), on.clear(), h.forEach(e => {
                    rn.add(e.name), mn.expandAll && ((e.subcategories || []).forEach(t => on.add(Un(e.name, t.name))), e.topics.forEach(e => on.add(Wn(e))));
                });
                return Cn.classList.toggle("is-static", Boolean(mn.staticMap)), Mr({
                    animate: !1,
                    forceRepaint: !0
                }), this.get();
            },
            // Q6 chunked apply: the layout editor's armed
            // task-session apply routes here so its paint is stepped
            // one phase per frame (see sxChunkPaint at Ar) and the
            // pipeline's own progress checkpoints paint between
            // phases. Routes exactly like the editor's own dispatch
            // (scoped when a scope is given and applyScoped exists,
            // full otherwise) and resolves only after the stepped
            // paint — including a scoped paint's deferred
            // bookkeeping — has fully settled. The chunk flag is on
            // only for the synchronous dispatch below, so no other
            // render can accidentally go chunked.
            async applyChunked(patch, scope) {
                // Editor paints keep their assessed 12 ms budget; the
                // larger boot slice never leaks into this path (Mr
                // also captures the budget per paint at its start).
                sxChunkPaint = !0, sxChunkBudget = 12;
                let scopedP = null;
                try {
                    if (scope && this.applyScoped) scopedP = this.applyScoped(patch, scope); else this.apply(patch);
                } finally {
                    sxChunkPaint = !1;
                }
                if (scopedP && "function" == typeof scopedP.then) await scopedP; else if (sxPaintPromise) await sxPaintPromise;
                return this.get();
            },
            applyScoped(patch, scope) {
                // Scoped solve (Stage 3, T2): apply a layout patch
                // while every branch outside scope.target ∪
                // scope.ring is FROZEN — its delivered geometry is
                // captured before the patch lands and replayed
                // verbatim at solve completion (see scCtx,
                // scCaptureFrozen, scRestoreFrozen). The patch itself
                // goes through this API's own apply() untouched, so
                // state-write, scheduling, and sync semantics are
                // exactly apply()'s. Any validation failure, an
                // empty/no-op patch, an already-active scope, or the
                // absence of delivered geometry to freeze falls back
                // to the ordinary full apply path with the reason
                // declared in the returned result and in dkLog —
                // never silent. The summary is also recorded in dkLog
                // (type "scoped-apply"), the same place the DeKnotter
                // records its run summaries. Ring-auto (T5): when
                // scope.ring is omitted, the ring is computed by
                // scComputeAutoRing from pre-op delivered geometry
                // (see the declaration below) and written into both
                // the result and the log entry.
                const api = this, names = h.map(b => b.name), valid = new Set(names), target = scope && Array.isArray(scope.target) ? scope.target.map(v => String(v)) : [], dropped0 = () => ({
                    optimiser: 0,
                    relief: 0,
                    clamp: 0
                }), fallback = reason => (api.apply(patch || {}), dkLog.push({
                    type: "scoped-apply",
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozen: [],
                    frozenCount: 0,
                    fallback: reason
                }), {
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozenCount: 0,
                    boundaryLog: [],
                    dropped: dropped0(),
                    fallback: reason
                });
                // Ring-auto (Stage 3, T5): an explicit scope.ring
                // is used verbatim, exactly as before (T4's harness
                // passes one). When the caller omits it, the ring
                // is declared HERE — computed by scComputeAutoRing
                // from pre-op delivered geometry, before the patch
                // applies, never reconstructed after the fact —
                // and the computed ring is what the result object
                // and the dkLog "scoped-apply" entry carry. With
                // no delivered geometry to declare from, the ring
                // stays empty and the scoped path falls back below
                // ("no-delivered-geometry"), as it does today.
                // RING REMOVED (ruled 2026-11-01 01:52, Jason —
                // supersedes ring-auto, Stage 3 T5): the freeze
                // applies to EVERY branch except the target —
                // angular neighbours, the target's nearest
                // neighbour, and branches whose nearest centre is
                // the target are frozen and restored verbatim like
                // every other branch; only the target branch is
                // recomputed. The ring lines are COMMENTED OUT,
                // not deleted ("throw out" = comment out, as
                // throughout this project): an explicit scope.ring
                // is likewise no longer honoured, so every scoped
                // result declares ring: [] and a frozenCount
                // covering every non-target branch.
                let ring = [];
                // let ring = scope && Array.isArray(scope.ring) ? scope.ring.map(v => String(v)) : null;
                // if (null === ring) ring = dkLastBranches && target.length ? scComputeAutoRing(new Set(target), names) : [];
                if (!target.length) return fallback("empty-target");
                const unknown = target.concat(ring).filter(n => !valid.has(n));
                if (unknown.length) return fallback("unknown-branch:" + unknown.join(","));
                // Crossmin rule (T3, L6): minimizeCrossings builds a
                // cross-branch obstacle list in processing order, so
                // while crossmin is on applyScoped declines to scope
                // and runs the ordinary full apply, declared.
                if (mn.crossmin) return fallback("crossmin-on");
                if (scCtx) return fallback("scope-already-active");
                if (!patch || "object" != typeof patch || !Object.keys(patch).length) return fallback("empty-patch");
                const before = api.get();
                // Solve-commit opt-out (Stage 3, T6): a caller
                // whose commit's payload is the solve itself —
                // solver-side state outside the patch changed
                // under a value-identical patch (the DeKnotter's
                // fit and growth phases: the fit registry lives
                // outside API.get()) — declares scope.solveCommit
                // and skips ONLY this no-op decline. Every other
                // validation and decline stands, and no editor
                // caller passes the flag, so editor behaviour is
                // unchanged.
                if (!(scope && scope.solveCommit) && Object.keys(patch).every(k => Object.prototype.hasOwnProperty.call(before, k) && dkStableStringify(before[k]) === dkStableStringify(patch[k]))) return fallback("no-op-patch");
                if (!dkLastBranches) return fallback("no-delivered-geometry");
                const recompute = new Set(target.concat(ring)), frozen = new Set(names.filter(n => !recompute.has(n))), ctx = {
                    targetBranches: new Set(target),
                    ringBranches: new Set(ring),
                    recomputeBranches: recompute,
                    frozenBranches: frozen,
                    boundaryLog: [],
                    dropped: dropped0(),
                    fallback: null,
                    policy: scope && "fallback" === scope.policy ? "fallback" : "contained",
                    opClass: scope && null != scope.opClass ? String(scope.opClass) : scope && null != scope.op ? String(scope.op) : null,
                    reliefPass: 0,
                    r6Abort: !1,
                    capture: scCaptureFrozen(frozen),
                    centers: scCaptureDeliveredCenters(frozen)
                };
                scCtx = ctx;
                // Q6 chunked paints: when the editor's armed apply
                // steps this paint a frame at a time (applyChunked),
                // api.apply returns with the paint still in flight
                // (sxPaintPromise replaced). scCtx must stay in
                // place for the whole paint — Ar consults it in
                // every phase — and the bookkeeping below (which
                // reads solve results such as ctx.r6Abort) must wait
                // until the paint settles, so it lives in
                // finishScoped: unchunked callers run it
                // synchronously right here, exactly as before; a
                // chunked caller gets a promise for the same result,
                // with scCtx cleared first so the R6 fallback paint
                // inside runs unscoped, exactly as it does today.
                let sxPaintP = null;
                const sxPaintBefore = sxPaintPromise;
                try {
                    api.apply(patch);
                    if (sxPaintPromise !== sxPaintBefore) sxPaintP = sxPaintPromise;
                } catch (e) {
                    throw dkLog.push({
                        type: "scoped-apply-exception",
                        target: target.slice(),
                        ring: ring.slice(),
                        message: String(e && e.message || e)
                    }), e;
                } finally {
                    if (!sxPaintP) scCtx = null;
                }
                const finishScoped = () => {
                // R6 trigger (T3, L5): under policy "fallback" the
                // first relief boundary event raised ctx.r6Abort
                // mid-solve; the scoped result is discarded and the
                // ordinary full apply runs instead, with the outcome
                // declared — never silent. The boundaryLog and the
                // dropped counters from the aborted scoped attempt
                // are carried into the result so the pressure that
                // forced the fallback stays visible.
                if (ctx.r6Abort) return api.apply(patch || {}), dkLog.push({
                    type: "scoped-apply",
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozen: [],
                    frozenCount: 0,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: "R6: boundary pressure"
                }), {
                    scoped: !1,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozenCount: 0,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: "R6: boundary pressure"
                };
                return dkLog.push({
                    type: "scoped-apply",
                    scoped: !0,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozen: Array.from(frozen),
                    frozenCount: frozen.size,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: null
                }), {
                    scoped: !0,
                    target: target.slice(),
                    ring: ring.slice(),
                    frozenCount: frozen.size,
                    boundaryLog: ctx.boundaryLog.slice(),
                    dropped: ctx.dropped,
                    fallback: null
                };
                };
                if (sxPaintP) {
                    const settleScoped = () => (scCtx = null, finishScoped());
                    return sxPaintP.then(settleScoped, settleScoped);
                }
                return finishScoped();
            },
            get: () => ({
                spacing: mn.spacing,
                branchOrder: mn.branchOrder || "landscape-antipodal",
                propFan: Boolean(mn.propFan),
                subcatOrder: Boolean(mn.subcatOrder),
                staggerDensity: mn.staggerDensity !== !1,
                stagger: Boolean(mn.stagger),
                expandAll: Boolean(mn.expandAll),
                collision: mn.collision,
                crossmin: Boolean(mn.crossmin),
                nudge: Boolean(mn.nudge),
                showRelations: Boolean(mn.showRelations),
                spokeLen: Number(mn.spokeLen),
                subLen: Number(mn.subLen),
                pad: Number(mn.pad),
                repulsion: Number(mn.repulsion),
                repulsionEnabled: mn.repulsionEnabled !== !1,
                staticMap: Boolean(mn.staticMap),
                 fontScale: Number(mn.fontScale) || 1,
                 centerRingScale: Number(mn.centerRingScale) || 1,
                 leafOvergrowth: Number(mn.leafOvergrowth) || 300,
                branchOverrides: Object.assign({}, mn.branchOverrides || {}),
                subcatOverrides: Object.assign({}, mn.subcatOverrides || {}),
                kinkOverrides: Object.assign({}, mn.kinkOverrides || {}),
                subcatAngleOffsets: Object.assign({}, mn.subcatAngleOffsets || {}),
                kinkAngleOffsets: Object.assign({}, mn.kinkAngleOffsets || {}),
                branchSpokeAutoShrink: Object.assign({}, mn.branchSpokeAutoShrink || {}),
                subcatSpokeAutoShrink: Object.assign({}, mn.subcatSpokeAutoShrink || {}),
                solverMidline: mn.solverMidline
            }),
            branches: () => h.map(e => e.name),
            topics: () => Object.keys(topicLabelById).map(id => ({ id: id, label: topicLabelById[id] })).sort((a, b) => a.label.localeCompare(b.label)),
            subcategories: () => { const s = new Set(); try { h.forEach(b => (b.subcategories || []).forEach(sc => s.add(sc.name))); } catch (_) { __sxErrLog("taxonomy-scan", _); } return [...s].sort((a, b) => a.localeCompare(b)); },
            selectNode(e) {
                // Layout Editor → map selection (Build 2026-10-18_1401),
                // the reverse of the map → editor sync in Qsel: picking a
                // branch, subcategory, or kink in the editor's Advanced
                // selects selects that same branch on the map. Accepts a
                // node id (kinks pass theirs directly), a branch display
                // name, or a subcategory display name; reveals the node
                // the way the topic finder's preview does (branch into
                // rn, parent into on) so the selected spoke is visible,
                // then applies the shared selection path's bookkeeping
                // without echoing a notification back to the editor that
                // initiated it — but updates the selection marking in
                // the existing DOM instead of re-rendering (see below).
                if (!e) return !1;
                let id = String(e), t = qn[id] || Xn(id);
                if (!t) {
                    const c = (h.find(cat => cat.name === id) || {}).id || "";
                    if (qn[c]) id = c, t = qn[c]; else {
                        const s = Object.keys(qn).find(k => {
                            const o = qn[k];
                            return o && "Subcategory" === o.kind && (o.label === id || o.name === id);
                        });
                        if (s) id = s, t = qn[s];
                    }
                }
                if (!t) return !1;
                if (t.branch) rn.add(t.branch);
                if (t.parentId) on.add(t.parentId);
                // Selection-state bookkeeping identical to the shared
                // path (selectSpokeNode with notify off): record the
                // selected node, clear any pending rating target. The
                // shared path is selection-only — no re-render: Mr()
                // re-solves and re-renders the whole map from
                // canonical layout state, silently discarding delivered
                // geometry (scoped editor commits, DeKnotter runs) that
                // exists only in the rendered DOM. Selection is
                // geometry-neutral, so the marking the render would
                // produce is applied to the existing DOM instead, via
                // the shared applySelectionMarking (see its comment
                // for the exact end-state contract: the node's own
                // spoke in its node group, the branch's spoke in the
                // branch's line-group underlay, nothing for a
                // subcategory or a topic's parent subcategory).
                Lt = id, Nt = null, sxSelEditorMirrored = id;
                applySelectionMarking(id, t);
                return !0;
            },
            clearSelection() {
                // Deselect/back (Build 2026-10-19_0543): the one clear
                // path behind the Layout Editor's Clear selection button,
                // the Advanced selects' empty option, and Escape-as-back.
                // Mirrors selectSpokeNode's bookkeeping in reverse: clear
                // the selected node and any pending rating target.
                // Geometry-neutral like selectNode: no re-render (a full
                // solve would discard delivered geometry) — the marking
                // is removed from the existing DOM instead, and the
                // map-selection-dim observer clears sel-keep /
                // has-selection in response. Returns whether anything
                // was selected so callers can chain (Escape closes only
                // when clear).
                return clearSpokeSelection();
            },
            deknotter: {
                // DeKnotter driver (E1): the dedicated entry point for
                // DeKnotter runs. begin() opens the one module-scoped run
                // context (dkCtx); applyPhase() validates a phase patch's
                // branch/subcategory/kink length ratios against the baked
                // bases and the context cap (default 200) and, only when
                // every ratio passes, applies the patch ONCE through this
                // API's scoped entry (applyScoped, Stage 3 T6 — target =
                // the run's branch, ring auto, policy "contained"; the
                // patch itself still lands through this API's own apply
                // path, assign + forced solve) — never through editor
                // handlers or the shell's collect()/apply.
                // A rejected patch is logged whole and leaves layout state
                // untouched. Any exception inside applyPhase is logged,
                // clears the context, and is rethrown, so ordinary editor
                // use never resumes under a stale context.
                begin(e) {
                    if (dkCtx) {
                        return dkLog.push({
                            type: "begin-rejected",
                            reason: "a DeKnotter context is already active",
                            active: { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase },
                            requested: {
                                branch: e && e.branch != null ? String(e.branch) : null,
                                cap: e && e.cap != null ? Number(e.cap) : null
                            }
                        }), !1;
                    }
                    const t = e ? Number(e.cap) : NaN;
                    dkCtx = {
                        branch: e && e.branch != null ? String(e.branch) : null,
                        cap: Number.isFinite(t) && t > 0 ? t : 200,
                        phase: null,
                        control: e && e.control ? e.control : null,
                        phaseStartedAt: 0,
                        iterCount: 0,
                        lastBeatAt: 0
                    }, dkLog.length = 0, blitSigActive = !1, dkLog.push({
                        type: "begin",
                        branch: dkCtx.branch,
                        cap: dkCtx.cap
                    });
                    return { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase };
                },
                applyPhase(e, t) {
                    if (!dkCtx) throw new Error("deknotter.applyPhase: no active context — call deknotter.begin() first");
                    try {
                        dkCtx.phase = t == null ? dkCtx.phase : String(t);
                        // Q1: a new phase restarts the budget clock
                        // and the iteration count the budget / cancel
                        // reports cite.
                        dkCtx.phaseStartedAt = Date.now(), dkCtx.iterCount = 0, dkCtx.lastBeatAt = 0;
                        const n = dkValidatePhasePatch(e, dkCtx.cap);
                        if (n.failures.length) return dkLog.push({
                            type: "rejection",
                            branch: dkCtx.branch,
                            phase: dkCtx.phase,
                            cap: dkCtx.cap,
                            failures: n.failures,
                            ratios: n.ratios
                        }), {
                            ok: !1,
                            phase: dkCtx.phase,
                            rejected: n.failures
                        };
                        dkLog.push({
                            type: "phase",
                            branch: dkCtx.branch,
                            phase: dkCtx.phase,
                            cap: dkCtx.cap,
                            ratios: n.ratios
                        });
                        // Cascade containment (Stage 3, T6): the
                        // commit routes through applyScoped with the
                        // run's branch as the sole target and an
                        // explicitly EMPTY ring (ruled 2026-11-01
                        // 01:52, Jason: the freeze applies to every
                        // other branch, nearest neighbours
                        // included — only the target is
                        // recomputed), policy "contained", opClass
                        // "deknotter-<phase>". solveCommit declares
                        // that a phase's payload may be the solve
                        // itself: the fit and growth patches are
                        // value-identical snapshots whose work is
                        // the fit registry, which lives outside the
                        // patch, so applyScoped must not decline
                        // them as no-ops. A declared fallback
                        // (scoped:false) still means the patch WAS
                        // committed — applyScoped's fallback runs
                        // the ordinary full apply — so the phase
                        // succeeds and the run continues, exactly as
                        // a committed phase does today; the scoped
                        // outcome is declared in dkLog's
                        // "scoped-apply" entry (inside the phase's
                        // limiter-hit slice) and in this result.
                        const i = window.__SEXCAPADES_LAYOUT_API.applyScoped(e, {
                            target: dkCtx.branch ? [ dkCtx.branch ] : [],
                            ring: [],
                            policy: "contained",
                            opClass: "deknotter-" + dkCtx.phase,
                            solveCommit: !0
                        });
                        return { ok: !0, phase: dkCtx.phase, state: window.__SEXCAPADES_LAYOUT_API.get(), scoped: i };
                    } catch (e) {
                        dkLog.push({
                            type: "exception",
                            branch: dkCtx ? dkCtx.branch : null,
                            phase: dkCtx ? dkCtx.phase : null,
                            message: String(e && e.message || e)
                        });
                        dkCtx = null;
                        throw e;
                    }
                },
                end() {
                    if (!dkCtx) return !1;
                    const e = { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase };
                    return dkLog.push({ type: "end", branch: e.branch, cap: e.cap, phase: e.phase }), dkCtx = null, !0;
                },
                active: () => dkCtx ? { branch: dkCtx.branch, cap: dkCtx.cap, phase: dkCtx.phase } : null,
                log: () => dkLog.slice(),
                // F6: stable blit-session completion signal for the
                // shell's rebuild gate — true while a blit settle is
                // still owed. Reproduces the verdict of the log's
                // last blit-session entry (the scan the gate used to
                // run), maintained by the blit module at every entry
                // push, removal, and clear; a settle's held "end"
                // clears it only when the entry actually lands.
                blitSessionActive: () => blitSigActive,
                // DeKnotter base state (E3): the _radialBase20 capture
                // recorded for one stable item key by the most recent
                // resolver entries, as { base, sig }, or null when the
                // key is unknown. Takes the full stable key (the form
                // 'base-recapture' log entries record); as a convenience
                // a "/" separated form of the same key, or a bare topic
                // ID / subcategory label that matches exactly one
                // registered identity, also resolves.
                baseState(key) {
                    if (null == key) return null;
                    const wanted = String(key), exact = dkBaseStates.get(wanted) || dkBaseStates.get(wanted.replace(/\//g, "|"));
                    if (exact) return { base: exact.base, sig: exact.sig };
                    let found = null, count = 0;
                    return dkBaseStates.forEach((value, k) => {
                        const seg = k.split("|");
                        (seg[seg.length - 1] === wanted || k.endsWith("|" + wanted)) && (found = value, count++);
                    }), 1 === count && found ? { base: found.base, sig: found.sig } : null;
                },
                // DeKnotter fit targets (E4): the driver surface over
                // the fit registry behind dkFitTargetFor. Targets are
                // radii in final rendered units, keyed by the same
                // stable identity as baseState ('topic|<branch>|<id>',
                // 'subcat|<branch>|<label>',
                // 'child|<branch>|<label>|<id>'). Registering or
                // clearing a target bumps the registry revision, which
                // changes the item's resolver signature, so the next
                // solve recaptures its base under the new governing
                // state — and a cleared item returns to legacy behavior.
                // None of these methods solves; the driver drives
                // solves through applyPhase()/apply() as before.
                setFitTarget(key, target) {
                    const k = null == key ? "" : String(key), v = Number(target);
                    if (!k || !Number.isFinite(v) || v <= 0) return dkLog.push({
                        type: "fit-set-rejected",
                        key: k || null,
                        target: null == target ? null : String(target)
                    }), !1;
                    return dkFitRegistry.set(k, v), dkFitRevision++, dkLog.push({
                        type: "fit-set",
                        key: k,
                        target: v,
                        revision: dkFitRevision
                    }), !0;
                },
                clearFitTarget(key) {
                    const k = null == key ? "" : String(key);
                    if (!k || !dkFitRegistry.has(k)) return !1;
                    return dkFitRegistry.delete(k), dkFitRevision++, dkLog.push({
                        type: "fit-clear",
                        key: k,
                        revision: dkFitRevision
                    }), !0;
                },
                clearAllFitTargets() {
                    const n = dkFitRegistry.size;
                    return n && (dkFitRegistry.clear(), dkFitRevision++, dkLog.push({
                        type: "fit-clear-all",
                        cleared: n,
                        revision: dkFitRevision
                    })), n;
                },
                fitTargets() {
                    const out = {};
                    return dkFitRegistry.forEach((v, k) => {
                        out[k] = v;
                    }), out.revision = dkFitRevision, out;
                },
                computeFitTarget(key) {
                    const target = dkComputeFitTarget(null == key ? "" : String(key));
                    return null == target && dkLog.push({
                        type: "fit-compute-miss",
                        key: null == key ? null : String(key)
                    }), target;
                },
                armFitForBranch(branch) {
                    const name = null == branch ? "" : String(branch), items = dkFitBranchItems(name);
                    if (!items.length) return dkLog.push({
                        type: "fit-arm-miss",
                        branch: name || null
                    }), 0;
                    let count = 0;
                    items.forEach(w => {
                        const key = dkRadialBaseInfo(w).key, computed = dkComputeFitTarget(key), target = null != computed ? computed : dkNameFitTargetForKey(key);
                        if (null == target) return;
                        dkFitRegistry.set(key, target), dkFitRevision++, count++;
                    });
                    return dkLog.push({
                        type: "fit-arm",
                        branch: name,
                        count: count,
                        revision: dkFitRevision
                    }), count;
                },
                fitReport(branch) {
                    const name = null == branch ? "" : String(branch);
                    return dkFitBranchItems(name).map(w => {
                        const key = dkRadialBaseInfo(w).key, target = dkFitRegistry.has(key) ? dkFitRegistry.get(key) : null, stored = dkBaseStates.get(key), delivered = stored && Number.isFinite(stored.delivered) ? stored.delivered : Number.isFinite(w.cloudRadius) ? w.cloudRadius : null, deviation = null != target && null != delivered ? delivered - target : null;
                        return {
                            key: key,
                            target: target,
                            delivered: delivered,
                            deviation: deviation,
                            deviationPct: null != deviation && target ? deviation / target * 100 : null
                        };
                    });
                },
                // Kink shrink to label length (ruled 2026-10-28):
                // a ONE-TIME normalization, deliberately NOT a
                // cascade phase and not phase-gated — it does not
                // run inside dkRunCascade and is kept separate from
                // the recurring growth runs. For every kink item of
                // the branch (gen-2 topics and subcategory children)
                // whose delivered radius exceeds its label-fit
                // target — the fit machinery's own measured length
                // for the item's name at the live font — the kink's
                // length override is scaled so the delivered radius
                // lands on that target. An item already at or below
                // its target holds: this never grows a kink. The
                // whole normalization lands as ONE ordinary apply of
                // a snapshot patch carrying only kink overrides, and
                // the returned record measures the effect (per-item
                // before/after lengths and delivered radii, plus
                // the branch's crossing number before/after).
                shrinkKinksToLabel(branch) {
                    const name = null == branch ? "" : String(branch), api = window.__SEXCAPADES_LAYOUT_API;
                    return (async () => {
                        const out = { branch: name, ok: !1, applied: 0, items: [], cloudBefore: null, cloudAfter: null, crossingDelta: null };
                        if (dkCtx) return out.reason = "a DeKnotter context is active", out;
                        const tax = dkBranchTaxonomy(name);
                        if (!tax) return out.reason = "unknown branch: " + (name || "(none)"), out;
                        try { out.cloudBefore = await sxCrossingCloudsReadout(name, "shrinkKinksToLabel: crossing readout unavailable"); } catch (e) { out.cloudBefore = null; }
                        const patch = dkDeepCloneLayout(api.get()), changed = [];
                        dkFitBranchItems(name).forEach(w => {
                            const info = dkRadialBaseInfo(w), key = info.key, kind = key.split("|")[0];
                            if ("topic" !== kind && "child" !== kind) return;
                            const id = "child" === kind ? (w.child ? w.child.id : null) : (w.topic ? w.topic.id : null);
                            if (null == id) return;
                            const label = "child" === kind ? (w.child ? w.child.label : w.label) : (w.topic ? w.topic.label : w.label), delivered = dkDeliveredItemRadius(w), target = dkComputeFitTarget(key), cur = (mn.kinkOverrides || {})[id], curLen = cur && Number(cur.length) > 0 ? Number(cur.length) : 1, item = { key: key, id: String(id), label: label || null, beforeLength: curLen, afterLength: curLen, beforeDelivered: Number.isFinite(delivered) ? delivered : null, afterDelivered: null, target: target, held: !0 };
                            if (Number.isFinite(delivered) && delivered > 0 && null != target && target > 0 && delivered > target) {
                                item.afterLength = sxLenConvert(curLen, delivered, target), item.held = !1, patch.kinkOverrides[id] = Object.assign({}, patch.kinkOverrides[id], { length: item.afterLength }), changed.push(item);
                            }
                            out.items.push(item);
                        });
                        if (changed.length) {
                            api.apply(patch), out.applied = changed.length;
                            const afterByKey = {};
                            dkFitBranchItems(name).forEach(w => {
                                afterByKey[dkRadialBaseInfo(w).key] = dkDeliveredItemRadius(w);
                            }), out.items.forEach(it => {
                                const v = afterByKey[it.key];
                                it.afterDelivered = Number.isFinite(v) ? v : null;
                            });
                        } else out.items.forEach(it => {
                            it.afterDelivered = it.beforeDelivered;
                        });
                        try { out.cloudAfter = await sxCrossingCloudsReadout(name, "shrinkKinksToLabel: crossing readout unavailable"); } catch (e) { out.cloudAfter = null; }
                        null != out.cloudBefore && null != out.cloudAfter && (out.crossingDelta = out.cloudAfter - out.cloudBefore), out.ok = !0, dkLog.push({ type: "kink-shrink-to-label", branch: name, applied: out.applied, cloudBefore: out.cloudBefore, cloudAfter: out.cloudAfter });
                        return out;
                    })();
                },
                // AUTOFIT (Group 3d, ruled 2026-10-28): the one-shot
                // fit behind the layout editor's Autofit button. Same
                // driver pattern as shrinkKinksToLabel above — fit
                // targets from dkComputeFitTarget, delivered radii
                // from dkDeliveredItemRadius, lengths scaled by
                // OVERGROWN target / delivered (the multiple is the
                // "% kink leaf overgrowth" percent, ruled 2026-11-03,
                // superseding the hard 3x ruled 2026-11-02 17:09; it
                // lives only in this driver's delivered-length
                // computation below, via sxLeafOvergrowthFactor) —
                // with the three ruled deltas:
                // (1) BOTH directions: a spoke longer than its fit
                // target shrinks and a spoke shorter than its target
                // lengthens, by the same ratio; items within
                // AUTOFIT_EPS (relative) of target hold untouched.
                // (2) SCOPE: any list of branches (one branch, or
                // every branch for a whole-map run) accumulates into
                // ONE kink-overrides map. (3) ONE-SHOT: this method
                // only COMPUTES the patch — it never applies, never
                // writes an armed flag, and leaves no state that
                // re-triggers on
                // later builds. The caller (the editor shell) lands
                // the returned map through its central apply() once.
                // Subcategory hub nodes themselves are not fitted
                // (kind filter topic/child, exactly as the driver);
                // only kink spokes move.
                autofitMeasure(branches) {
                    const names = Array.isArray(branches) ? branches.map(v => String(v)) : [], items = [], seen = {};
                    if (dkCtx) return { ok: !1, reason: "a DeKnotter context is active", items: items, branchesSeen: [] };
                    names.forEach(name => {
                        if (!dkBranchTaxonomy(name)) return;
                        seen[name] = !0;
                        dkFitBranchItems(name).forEach(w => {
                            const info = dkRadialBaseInfo(w), key = info.key, kind = key.split("|")[0];
                            if ("topic" !== kind && "child" !== kind) return;
                            const id = "child" === kind ? (w.child ? w.child.id : null) : (w.topic ? w.topic.id : null);
                            if (null == id) return;
                            const label = "child" === kind ? (w.child ? w.child.label : w.label) : (w.topic ? w.topic.label : w.label), delivered = dkDeliveredItemRadius(w), target = dkComputeFitTarget(key), cur = (mn.kinkOverrides || {})[id], curLen = cur && Number(cur.length) > 0 ? Number(cur.length) : 1;
                            items.push({ branch: name, key: key, id: String(id), label: label || null, delivered: Number.isFinite(delivered) ? delivered : null, target: null != target && Number.isFinite(target) ? target : null, curLen: curLen });
                        });
                    });
                    return { ok: !0, reason: null, items: items, branchesSeen: Object.keys(seen) };
                },
                computeAutofitPatch(branches) {
                    const EPS = .01, measured = this.autofitMeasure(branches), out = { ok: !1, reason: null, eps: EPS, kinkOverrides: null, items: [], changed: 0, shortened: 0, lengthened: 0, held: 0, skipped: 0, branchesSeen: measured.branchesSeen || [] };
                    if (!measured.ok) return out.reason = measured.reason, out;
                    if (!measured.items.length) return out.reason = "no rendered kink items to fit", out;
                    const next = {};
                    Object.keys(mn.kinkOverrides || {}).forEach(id => {
                        next[id] = Object.assign({}, mn.kinkOverrides[id]);
                    });
                    measured.items.forEach(m => {
                        // OVERGROWN FIT (ruled 2026-11-03, Jason,
                        // superseding the hard 3x of 2026-11-02 17:09):
                        // this driver — the Autofit button's alone —
                        // delivers each kink spoke at the "% kink leaf
                        // overgrowth" percent of its fit target (the
                        // same percent the Anneal throw uses, via
                        // sxLeafOvergrowthFactor). dkComputeFitTarget
                        // itself is NOT changed; the multiple lives
                        // only here, in the delivered-length
                        // computation, so the shrink floors and the
                        // scoring keep reading the unscaled target.
                        // The hold epsilon and the shortened /
                        // lengthened split are judged against the
                        // delivered target, so a spoke already at the
                        // chosen percent holds and a spoke sitting at
                        // 1x lengthens.
                        const deliveredTarget = null != m.target && m.target > 0 ? sxLeafOvergrowthFactor() * m.target : m.target;
                        const item = { branch: m.branch, key: m.key, id: m.id, label: m.label, beforeLength: m.curLen, afterLength: m.curLen, beforeDelivered: m.delivered, target: m.target, deliveredTarget: deliveredTarget, held: !0 };
                        if (null == m.delivered || !(m.delivered > 0) || null == m.target || !(m.target > 0)) out.skipped++;
                        else if (Math.abs(m.delivered - deliveredTarget) / deliveredTarget <= EPS) out.held++;
                        else {
                            item.afterLength = m.curLen * deliveredTarget / m.delivered, item.held = !1, next[m.id] = Object.assign({}, next[m.id], { length: item.afterLength }), out.changed++, m.delivered > deliveredTarget ? out.shortened++ : out.lengthened++;
                        }
                        out.items.push(item);
                    });
                    return out.kinkOverrides = next, out.ok = !0, dkLog.push({ type: "autofit-compute", branches: out.branchesSeen.slice(), changed: out.changed, shortened: out.shortened, lengthened: out.lengthened, held: out.held, skipped: out.skipped }), out;
                },
                // DeKnotter gate primitive (E2): snapshot() captures a
                // deep clone of the current layout state (see
                // dkDeepCloneLayout); (F8: the LAYOUT-settings
                // snapshot — not the sharing profile/data snapshot.)
                // restore() installs a snapshot by
                // applying a FRESH deep clone of it through this API's
                // own apply path, so the snapshot object itself is never
                // installed by reference. Both work with or without an
                // active run context. measureCloud() reads one branch's
                // own-cloud CROSSING NUMBER (Q4: the anneal gate's
                // decider metric) straight from the shell metric
                // registry's crossingnumber clouds walk — called
                // directly with its (ctx, done, isCancelled) contract
                // and awaited — never via scheduleMetric(), and it
                // never touches the user's selected display metric.
                // (Before Q4 this readout was the branch's local
                // xAreaCross area; the area observation was removed
                // in M1, 2026-10-29 — see the removal record below.)
                // canonical() is the stable
                // sorted stringify two states are compared with;
                // gate() is the pure improve-or-hold comparison on the
                // exact floats.
                snapshot() {
                    return dkDeepCloneLayout(window.__SEXCAPADES_LAYOUT_API.get());
                },
                restore(snap) {
                    if (!snap || "object" != typeof snap) throw new Error("deknotter.restore: snapshot must be a layout state object");
                    return window.__SEXCAPADES_LAYOUT_API.apply(dkDeepCloneLayout(snap));
                },
                measureCloud(branch) {
                    // STAGED SCORING (ruled 2026-11-02, Jason): during
                    // an active cascade run, the run branch's judged
                    // score is the staged score (see
                    // sxCrossingStagedCloud); every other read — any
                    // other branch, and every read outside a run —
                    // keeps the standing readout below, unchanged.
                    if (sxAnnealStageCtx && branch === sxAnnealStageCtx.branch) {
                        const stagedVal = sxCrossingStagedCloud(branch, sxAnnealStageCtx.adjacent);
                        if (null != stagedVal && Number.isFinite(stagedVal)) return Promise.resolve(stagedVal);
                    }
                    return sxCrossingCloudsReadout(branch, "deknotter.measureCloud: LayoutMetrics.defs.crossingnumber.clouds is unavailable");
                },
                // Q4: EVERY cloud's crossing number in one walk of
                // the same crossingnumber clouds readout
                // measureCloud() uses — the cascade's neighbor-report
                // source and nothing else: these values are reported,
                // never gated. Missing or non-finite values read as
                // 0, exactly as measureCloud treats them.
                measureCloudsAll() {
                    return sxCrossingCloudsReadout(null, "deknotter.measureCloudsAll: LayoutMetrics.defs.crossingnumber.clouds is unavailable");
                },
                // Single removal record for the retired area
                // observation (2026-10-29, M1; commented-out code
                // deleted 2026-10-30, paragraph-6 solver-metrics
                // edit): the cascade's secondary area readout —
                // measureCloudArea(branch), the shell's xareacross
                // clouds walk, never gating anything — and its
                // callers in dkRunCascade were removed with the area
                // observation. Revival is NOT an uncomment: re-derive
                // a live walk against the current
                // LayoutMetrics.defs.xareacross.clouds and wire it
                // as a new readout. (The xareacross metric itself
                // stays live in the shell; only this cascade
                // observation of it was retired.)
                canonical(state) {
                    return dkStableStringify(void 0 === state ? window.__SEXCAPADES_LAYOUT_API.get() : state);
                },
                gate(before, after) {
                    return after <= before;
                },
                // DeKnotter cascade driver (E5): run one full
                // cascade for a branch (see dkRunCascade). Async —
                // resolves to the run report, which is also appended
                // to the DeKnotter log as a 'run-report' entry.
                // opts._testFinalPatch is a test-only hook, documented
                // at its merge site in dkRunCascade. opts.onPhase (E6)
                // is invoked after each phase commits with that phase's
                // summary; the driver yields at each phase boundary
                // before the phase's synchronous apply.
                run(branch, opts) {
                    // ANNEAL REPORT TEST HOOK (see sxPublishAnnealReport
                    // beside dkLog): mark the run pending, then mirror
                    // the settled outcome onto the diagnostic surfaces.
                    // The cascade's own promise is returned untouched —
                    // the hook only observes it, and its writer never
                    // throws, so run behaviour is unchanged.
                    sxPublishAnnealReport(null, true);
                    const runPromise = SX_SOLVER_FACADE.untangle(branch, opts);
                    if (runPromise && "function" == typeof runPromise.then) runPromise.then(report => sxPublishAnnealReport(report, false), () => sxPublishAnnealReport(null, false));
                    return runPromise;
                }
            }
        }, window.__SEXCAPADES_LAYOUT_API.anneal=window.__SEXCAPADES_LAYOUT_API.deknotter, Cn.classList.toggle("is-static", Boolean(mn.staticMap)), Jw(), bS ? (gS(), document.documentElement.classList.remove("route-listview-pending"), 
        t.setTimeout(Nu, 0)) : yS ? (function() {
            const e = dS();
            window.__SEXCAPADES_START_ROUTE = "", e ? !rS && (rS = !0, Ms(Mt && vt[Mt] ? Mt : Et)) : rS = !1;
        }(), document.documentElement.classList.remove("route-listview-pending"), t.setTimeout(Nu, 0)) : vS ? (mS(), 
        document.documentElement.classList.remove("route-listview-pending"), t.setTimeout(Nu, 0)) : requestAnimationFrame(() => t.setTimeout(() => {
            Nu(), document.documentElement.classList.remove("route-listview-pending");
            if (Do.open) {
                Is();
            } else {
                let warmRestored = false;
                try {
                    warmRestored = Boolean(window.SexcapadesEngine?.Map?.tryRestoreWarmBoot?.());
                } catch (_) {}
                if (!warmRestored) {
                    Mr({ animate: !1 });
                    Ih();
                } else {
                    try { Ih(); } catch (_) {}
                }
            }
            mS();
        }, 0)), window.__sexcapades = {
            ProfileIO: yx,
            profilePayload: function(e) {
                return yx.serialize("profile", {
                    person: e
                });
            },
            importPayload: wx,
            importSharedPayload: kx,
            fullProfileDataNodeIds: Hw,
            getActiveProfileId: function() {
                return Mt;
            }
        }, window.Sexcapades2xProfiles = {
            getAll: function() {
                const e = {};
                try {
                    Object.keys(vt).forEach(t => {
                        vt[t] && (e[t] = this.exportFullProfile(t));
                    });
                } catch (e) { __sxErrLog("profile-export", e); }
                return e;
            },
            getIds: function() {
                try {
                    return Object.keys(vt);
                } catch (e) {
                    return [];
                }
            },
            has: function(e) {
                try {
                    return !!vt[e];
                } catch (e) {
                    return !1;
                }
            },
            isDirty: function(e) {
                try {
                    return !(void 0 === yt || !yt[e]);
                } catch (e) {
                    return !1;
                }
            },
            isSample: function(e) {
                try {
                    return !0 === sampleProfileFlags[e];
                } catch (e) {
                    return !1;
                }
            },
            getDraftRatings: function(e) {
                try {
                    const t = e || Mt;
                    return cloneProfileData(draftRatings[t] || yt[t] && vt[t] || {}) || {};
                } catch (e) {
                    return {};
                }
            },
            setDraftRatings: function(e, t) {
                try {
                    if (!e || !vt[e] || !t || "object" != typeof t || Array.isArray(t)) return !1;
                    const n = {};
                    Object.entries(t).forEach(([e, t]) => {
                        if (!Ke.has(e)) return;
                        if (Number.isFinite(Number(t))) n[e] = Math.max(-100, Math.min(100, Number(t))); else if (t && "object" == typeof t) {
                            const i = {};
                            [ "give", "receive" ].forEach(e => {
                                Object.prototype.hasOwnProperty.call(t, e) && Number.isFinite(Number(t[e])) && (i[e] = Math.max(-100, Math.min(100, Number(t[e]))));
                            }), Object.keys(i).length && (n[e] = i);
                        }
                    }), vt[e] = n, zt(e), e === Mt && (Mr({
                        animate: !1,
                        forceRepaint: !0
                    }), Ih());
                    return !0;
                } catch (e) {
                    return !1;
                }
            },
            clearDraftRatings: function(e) {
                try {
                    const n = e || Mt;
                    return n && (delete draftRatings[n], draftSaveTimers[n] && (t.clear(draftSaveTimers[n]), delete draftSaveTimers[n])), 
                    !0;
                } catch (e) {
                    return !1;
                }
            },
            exportFullProfile: function(e) {
                try {
                    return vt[e] ? cloneProfileData(Ww(e)) : null;
                } catch (e) {
                    return null;
                }
            },
            markSaved: function(e) {
                try {
                    return e && vt[e] && (Vt(e), !0);
                } catch (e) {
                    return !1;
                }
            },
            importData: function(e, t, opts) {
                try {
                    if (!t || "object" != typeof t || Array.isArray(t)) return !1;
                    let n = cloneProfileData(t);
                    const i = n && n.ratings && "object" == typeof n.ratings, a = n && "sexcapades" === n.app;
                    if (!a) n = i ? Object.assign({
                        app: "sexcapades",
                        version: 16,
                        profileName: wt[e] || String(e || "Imported profile").replace(/^profile-/, "") || "Imported profile"
                    }, n) : {
                        app: "sexcapades",
                        version: 16,
                        profileName: wt[e] || String(e || "Imported profile").replace(/^profile-/, "") || "Imported profile",
                        ratings: n
                    };
                    const rememberedName = String(wt[e] || "").trim();
                    (!n.profileName || /^unknown$/i.test(String(n.profileName).trim())) && (n.profileName = rememberedName && !/^unknown$/i.test(rememberedName) ? rememberedName : "Untitled profile"), n.version = 16, n.app = "sexcapades";
                    const r = wx(n, {
                        quiet: !0,
                        autoSelect: opts && opts.autoSelect
                    }), o = e || r;
                    if (o !== r) {
                        const t = Mt === r, n = It === r;
                        // F1: the re-key move carries EVERY list on the
                        // canonical list (this now includes the
                        // per-profile colors, tn). droppedKeyRecords
                        // rides along as an import-path extra: it was
                        // produced by the import that just ran under
                        // the throwaway id.
                        SX_PROFILE_FIELDS.forEach(e => {
                            Object.prototype.hasOwnProperty.call(e, r) ? e[o] = e[r] : delete e[o], Reflect.deleteProperty(e, r);
                        }), Object.prototype.hasOwnProperty.call(droppedKeyRecords, r) ? (droppedKeyRecords[o] = droppedKeyRecords[r], Reflect.deleteProperty(droppedKeyRecords, r)) : delete droppedKeyRecords[o], t && (Mt = o), n && (It = o);
                    }
                    return Vt(o), Jw(), Mt === o && (Mr({
                        animate: !1,
                        forceRepaint: !0
                    }), Ih()), o;
                } catch (e) {
                    // Fix 1, item 1: importData used to swallow its own
                    // failure and return false, so the restore callers'
                    // catch blocks never fired. Log it here; the
                    // return contract (false on failure) is unchanged.
                    __sxErrLog("profile-import", e);
                    return !1;
                }
            }
        };

        if (window.SexcapadesEngine && window.SexcapadesEngine.Profiles) {
            window.SexcapadesEngine.Profiles.io = window.__sexcapades;
            window.SexcapadesEngine.Profiles.manager = window.Sexcapades2xProfiles;
        }
    }();
