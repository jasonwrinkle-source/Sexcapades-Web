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
                tf.textContent = sxCardOversize ? "Close this window, then use Export QR codes for the numbered QR sheet." : "Close this window and try again.", qf(r, 100, Bm.textContent, jm.textContent, !1, "error"), console.error("Sync card page export failed.", e);
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
                tf.textContent = sxCardOversize ? "Close this window, then use Export QR codes for the numbered QR sheet." : "Close this window and try again.", qf(n, 100, Bm.textContent, jm.textContent, !1, "error"), console.error("Sync card-back sheet export failed.", e);
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
