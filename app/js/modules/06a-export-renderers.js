        async function apLoadAndPrep(svgMarkup) {
            if (void 0 !== window.jspdf && window.jspdf.jsPDF || !window.__loadPdfLibs || await window.__loadPdfLibs(), 
            void 0 === window.jspdf || !window.jspdf.jsPDF) throw new Error("PDF library did not load.");
            var JsPDF = window.jspdf.jsPDF, svgEl = (new DOMParser).parseFromString(svgMarkup, "image/svg+xml").documentElement;
            if (!svgEl || "svg" !== svgEl.tagName.toLowerCase()) throw new Error("Invalid vector data for PDF.");
            var vbParts = (svgEl.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number),
                widthAttr = parseFloat(svgEl.getAttribute("width")) || (4 === vbParts.length ? vbParts[2] : 2880),
                heightAttr = parseFloat(svgEl.getAttribute("height")) || (4 === vbParts.length ? vbParts[3] : 2880);
            widthAttr > 0 && heightAttr > 0 || (widthAttr = 2880, heightAttr = 2880);
            var vbX = 4 === vbParts.length ? vbParts[0] : 0,
                vbY = 4 === vbParts.length ? vbParts[1] : 0,
                vbW = 4 === vbParts.length ? vbParts[2] : widthAttr,
                vbH = 4 === vbParts.length ? vbParts[3] : heightAttr;
            svgEl.setAttribute("viewBox", vbX + " " + vbY + " " + vbW + " " + vbH);
            var pageSizeMm = 210, pdfDoc = new JsPDF({
                unit: "mm",
                format: [ pageSizeMm, pageSizeMm ],
                orientation: "portrait",
                compress: !0
            });
            if ("function" != typeof pdfDoc.svg) throw new Error("The PDF renderer did not load.");
            return {
                svgEl: svgEl,
                pdfDoc: pdfDoc,
                vbX: vbX,
                vbY: vbY,
                vbW: vbW,
                pageSizeMm: pageSizeMm
            };
        }
        function apEmbedMetadata(pdfDoc, profileId, allowedIds, isSingle, includeNotes) {
            try {
                if (profileId && void 0 !== vt && vt[profileId]) {
                    var payload = sxSerializeExportPayload(profileId, allowedIds instanceof Set ? allowedIds : new Set(allowedIds || []), isSingle, "", includeNotes),
                        jsonStr = JSON.stringify(payload),
                        b64Payload = btoa(unescape(encodeURIComponent(jsonStr)));
                    pdfDoc.setProperties({
                        title: "Sexcapades hypermap - " + (isSingle ? String(void 0 !== wt && wt[profileId] || "Profile") : "Shared profile"),
                        subject: "Sexcapades hypermap (vector PDF)",
                        keywords: "sexcapades-profile:" + b64Payload,
                        creator: "Sexcapades"
                    });
                }
            } catch (err) {
                console.warn("PDF metadata embed failed", err);
            }
        }
        function apInlineStyles(svgClone) {
            try {
                svgClone.querySelectorAll(".topic-stem,.topic-pulse,.branch-stem,.concept-path,.spoke-line").forEach(function(el) {
                    try {
                        var cs = window.getComputedStyle(el);
                        if (cs) {
                            var strokeVal = cs.getPropertyValue("stroke") || cs.stroke,
                                strokeWidthVal = cs.getPropertyValue("stroke-width") || cs.strokeWidth;
                            if (strokeVal && "none" !== strokeVal && strokeVal.indexOf("var(") < 0) {
                                el.setAttribute("stroke", strokeVal);
                            } else if (strokeVal && strokeVal.indexOf("var(") >= 0) {
                                var resolvedStroke = cs.stroke;
                                resolvedStroke && resolvedStroke.indexOf("var(") < 0 && el.setAttribute("stroke", resolvedStroke);
                            }
                            strokeWidthVal && "" !== strokeWidthVal && el.setAttribute("stroke-width", strokeWidthVal);
                            el.setAttribute("stroke-linecap", "round");
                            el.setAttribute("stroke-linejoin", "round");
                        }
                    } catch (err) { __sxErrLog("export-style", err); }
                });
                svgClone.querySelectorAll("path").forEach(function(el) {
                    el.getAttribute("stroke-linecap") || el.setAttribute("stroke-linecap", "round");
                });
            } catch (err) {
                console.warn("PDF CSS var resolution failed", err);
            }
            var styleProps = [ "display", "visibility", "opacity", "fill", "fill-opacity", "fill-rule", "stroke", "stroke-opacity", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset", "paint-order", "vector-effect", "font-family", "font-size", "font-style", "font-weight", "letter-spacing", "text-anchor", "dominant-baseline", "clip-path", "mask", "filter", "marker-start", "marker-mid", "marker-end", "stop-color", "stop-opacity" ];
            svgClone.querySelectorAll("*").forEach(function(el) {
                if ("style" !== el.localName && "script" !== el.localName) try {
                    var cs = window.getComputedStyle(el);
                    styleProps.forEach(function(prop) {
                        var val = cs.getPropertyValue(prop);
                        val && "initial" !== val && ("normal" !== val || "letter-spacing" !== prop && "paint-order" !== prop) && el.style.setProperty(prop, val);
                    });
                } catch (err) { __sxErrLog("style-apply", err); }
            });
            svgClone.querySelectorAll("style,script").forEach(function(el) {
                el.remove();
            });
        }
        function apDrawLabels(pdfDoc, svgClone, vbX, vbY, vbW) {
            try {
                var labels = svgClone.querySelectorAll("text.map-label");
                if (!labels || !labels.length) return;
                var mmPerSvgUnit = 210 / vbW;
                labels.forEach(function(labelEl) {
                    try {
                        var textPathEl = labelEl.querySelector("textPath");
                        if (!textPathEl) return;
                        var pathId = (textPathEl.getAttribute("href") || textPathEl.getAttribute("xlink:href") || "").replace(/^#/, "");
                        if (!pathId) return;
                        var pathEl = svgClone.querySelector("#" + CSS.escape(pathId));
                        if (!pathEl || "function" != typeof pathEl.getTotalLength) return;
                        var pathLen = pathEl.getTotalLength();
                        if (!(pathLen > 0)) return;
                        var startOffsetAttr = textPathEl.getAttribute("startOffset") || "50%";
                        var offsetDist = String(startOffsetAttr).indexOf("%") >= 0 ? pathLen * parseFloat(startOffsetAttr) / 100 : parseFloat(startOffsetAttr);
                        isNaN(offsetDist) && (offsetDist = pathLen / 2);
                        offsetDist = Math.max(0, Math.min(pathLen, offsetDist));
                        var pt = pathEl.getPointAtLength(offsetDist),
                            ptBefore = pathEl.getPointAtLength(Math.max(0, offsetDist - 2)),
                            ptAfter = pathEl.getPointAtLength(Math.min(pathLen, offsetDist + 2)),
                            angleDeg = 180 * Math.atan2(ptAfter.y - ptBefore.y, ptAfter.x - ptBefore.x) / Math.PI;
                        angleDeg > 90 && (angleDeg -= 180);
                        angleDeg < -90 && (angleDeg += 180);
                        var dyOffset = parseFloat(labelEl.getAttribute("dy") || "0");
                        isNaN(dyOffset) && (dyOffset = 0);
                        var angleRad = angleDeg * Math.PI / 180,
                            drawX = pt.x - Math.sin(angleRad) * dyOffset,
                            drawY = pt.y + Math.cos(angleRad) * dyOffset,
                            textStr = (textPathEl.textContent || "").trim();
                        if (!textStr) return;
                        var fontPx = 12, rawFontSize = labelEl.style && labelEl.style.fontSize;
                        if (rawFontSize) {
                            var sizeMatch = String(rawFontSize).match(/([\d.]+)/);
                            sizeMatch && (fontPx = parseFloat(sizeMatch[1]));
                        }
                        var fontPt = fontPx * mmPerSvgUnit * 2.83465, fillColor = "#ffffff";
                        try {
                            var cs = window.getComputedStyle(labelEl);
                            cs && cs.fill && "none" !== cs.fill && (fillColor = cs.fill);
                        } catch (err) { __sxErrLog("number-parse", err); }
                        var rCol = 255, gCol = 255, bCol = 255, hexMatch = String(fillColor).match(/#([0-9a-fA-F]{6})/);
                        if (hexMatch) {
                            rCol = parseInt(hexMatch[1].substr(0, 2), 16);
                            gCol = parseInt(hexMatch[1].substr(2, 2), 16);
                            bCol = parseInt(hexMatch[1].substr(4, 2), 16);
                        } else {
                            var rgbMatch = String(fillColor).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                            rgbMatch && (rCol = parseInt(rgbMatch[1]), gCol = parseInt(rgbMatch[2]), bCol = parseInt(rgbMatch[3]));
                        }
                        pdfDoc.setTextColor(rCol, gCol, bCol);
                        pdfDoc.setFontSize(Math.max(4, Math.min(48, fontPt)));
                        var pdfAlign = "middle", anchorAttr = textPathEl.getAttribute("text-anchor") || labelEl.getAttribute("text-anchor");
                        "start" === anchorAttr ? pdfAlign = "left" : "end" === anchorAttr && (pdfAlign = "right");
                        pdfDoc.text(textStr, (drawX - vbX) * mmPerSvgUnit, (drawY - vbY) * mmPerSvgUnit, {
                            angle: angleDeg,
                            align: pdfAlign,
                            baseline: "alphabetic"
                        });
                    } catch (err) { __sxErrLog("app", err); }
                });
            } catch (err) {
                console.warn("PDF label drawing failed", err);
            }
        }
        async function apQrImages(profileId, allowedIds, isSingle, includeNotes) {
            var qrImages = [], overflowPieces = 0, shareToken = null;
            try {
                if ("undefined" != typeof QRCode && "function" == typeof QRCode.toDataURL) {
                    shareToken = await sxEncodeShareToken(profileId, allowedIds, isSingle, includeNotes);
                    qrImages = await qrEncode(shareToken, {
                        width: 1200,
                        oversize: "split"
                    });
                    if (qrImages.length > 2) overflowPieces = qrImages.length;
                    else if (0 === qrImages.length && shareToken) overflowPieces = Math.max(2, chunkPayload(shareToken, {
                        chunkSize: 700
                    }).length);
                }
            } catch (err) {
                console.warn("PDF QR generation failed", err);
                if (shareToken && !qrImages.length) try {
                    overflowPieces = Math.max(2, chunkPayload(shareToken, {
                        chunkSize: 700
                    }).length);
                } catch (err2) {
                    overflowPieces = 2;
                }
            }
            if (overflowPieces) qrImages = [];
            return {
                images: qrImages,
                overflowPieces: overflowPieces
            };
        }
        function apHeaderCard(pdfDoc, profileId, allowedIds, isSingle, mmScale) {
            var displayTitle = isSingle ? "Profile" : "Shared profile";
            try {
                isSingle && (displayTitle = String(wt[profileId] || "Profile").replace(/\s+/g, " ").trim() || "Profile");
            } catch (err) { __sxErrLog("profile-name", err); }
            var handleText = "";
            try {
                isSingle && (handleText = sxPreferredUserText(profileId));
            } catch (err) { __sxErrLog("profile-name", err); }
            var ringPcts = [ 0, 0, 0 ];
            try {
                var glance = sxGlanceBucketsFor(profileId, allowedIds);
                glance && glance.percentages && (ringPcts = [ glance.percentages.green || 0, glance.percentages.yellow || 0, glance.percentages.red || 0 ]);
            } catch (err) { __sxErrLog("profile-stats", err); }
            var cardTopMm = 4.2;
            pdfDoc.setFont("helvetica", "bold");
            pdfDoc.setFontSize(8);
            var headerLabelW = pdfDoc.getTextWidth("SEXCAPADES PROFILE");
            pdfDoc.setFontSize(16);
            var titleW = pdfDoc.getTextWidth(displayTitle);
            pdfDoc.setFontSize(11);
            var handleW = handleText ? pdfDoc.getTextWidth("@" + handleText) : 0,
                maxTextW = Math.max(headerLabelW, titleW, handleW),
                cardUnitsW = Math.min(2e3, Math.max(900, maxTextW / mmScale + 430 + 96)),
                cardMmW = cardUnitsW * mmScale,
                cardMmH = (handleText ? 400 : 360) * mmScale;
            pdfDoc.setFillColor(13, 17, 15);
            pdfDoc.setDrawColor(99, 112, 104);
            pdfDoc.setLineWidth(.4);
            "function" == typeof pdfDoc.roundedRect ? pdfDoc.roundedRect(4.2, cardTopMm, cardMmW, cardMmH, 1.5, 1.5, "FD") : pdfDoc.rect(4.2, cardTopMm, cardMmW, cardMmH, "FD");
            pdfDoc.setFontSize(8);
            pdfDoc.setTextColor(215, 189, 85);
            pdfDoc.text("SEXCAPADES PROFILE", 7, cardTopMm + 34 * mmScale + .175);
            pdfDoc.setFontSize(16);
            pdfDoc.setTextColor(237, 242, 238);
            pdfDoc.text(displayTitle, 7, cardTopMm + 92 * mmScale + 8 * mmScale, {
                maxWidth: (cardUnitsW - 430 - 96) * mmScale
            });
            handleText && (pdfDoc.setFontSize(11), pdfDoc.setTextColor(215, 189, 85), pdfDoc.text("@" + handleText, 7, cardTopMm + 296 * mmScale + 5 * mmScale));
            var ringCenterX = 4.2 + cardMmW - 215 * mmScale,
                ringCenterY = cardTopMm + cardMmH / 2,
                ringRadii = [ 128 * mmScale, 106 * mmScale, 4.9 ],
                ringColors = [ [ 99, 199, 150 ], [ 215, 189, 85 ], [ 224, 111, 106 ] ];
            for (var rIdx = 0; rIdx < 3; rIdx++) {
                var radius = ringRadii[rIdx], pct = Math.max(0, Math.min(100, Number(ringPcts[rIdx]) || 0));
                if (pdfDoc.setDrawColor(70, 78, 73), pdfDoc.setLineWidth(1), pdfDoc.circle(ringCenterX, ringCenterY, radius, "D"), pct > 0) {
                    pdfDoc.setDrawColor(ringColors[rIdx][0], ringColors[rIdx][1], ringColors[rIdx][2]);
                    pdfDoc.setLineWidth(1);
                    for (var segs = Math.max(8, Math.ceil(pct / 100 * 72)), prevX = null, prevY = null, step = 0; step <= segs; step++) {
                        var theta = -Math.PI / 2 + 2 * Math.PI * (pct / 100) * (step / segs),
                            curX = ringCenterX + radius * Math.cos(theta),
                            curY = ringCenterY + radius * Math.sin(theta);
                        null !== prevX && pdfDoc.line(prevX, prevY, curX, curY);
                        prevX = curX;
                        prevY = curY;
                    }
                }
            }
            var labelAngles = [ -Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6 ];
            pdfDoc.setFont("helvetica", "bold");
            pdfDoc.setFontSize(8);
            for (var cIdx = 0; cIdx < 3; cIdx++) {
                var labelRad = ringRadii[cIdx] + 2.1,
                    labelAngle = labelAngles[cIdx],
                    roundedPct = Math.round(Math.max(0, Math.min(100, Number(ringPcts[cIdx]) || 0)));
                pdfDoc.setTextColor(ringColors[cIdx][0], ringColors[cIdx][1], ringColors[cIdx][2]);
                pdfDoc.text(roundedPct + "%", ringCenterX + labelRad * Math.cos(labelAngle), ringCenterY + labelRad * Math.sin(labelAngle), {
                    align: "center",
                    baseline: "middle"
                });
            }
            var profileNote = "";
            try {
                isSingle && void 0 !== nt && nt && (profileNote = String(nt[profileId] || "").trim());
            } catch (err) { __sxErrLog("app", err); }
            if (profileNote) {
                pdfDoc.setFont("helvetica", "normal");
                pdfDoc.setFontSize(10);
                pdfDoc.setTextColor(150, 160, 155);
                var wrappedNote = pdfDoc.splitTextToSize(profileNote, (cardUnitsW - 96) * mmScale).slice(0, 4);
                pdfDoc.text(wrappedNote, 7, cardTopMm + cardMmH + .7);
            }
        }
        async function sxDrawMapPdfBlob(svgMarkup, profileId, isSingle = !1, includeNotes = !1, allowedIds = null) {
            var prep = await apLoadAndPrep(svgMarkup),
                svgEl = prep.svgEl,
                pdfDoc = prep.pdfDoc,
                vbX = prep.vbX,
                vbY = prep.vbY,
                vbW = prep.vbW,
                pageSizeMm = prep.pageSizeMm;
            apEmbedMetadata(pdfDoc, profileId, allowedIds, isSingle, includeNotes);
            var offscreenHost = document.createElement("div");
            offscreenHost.style.cssText = "position:fixed;left:-99999px;top:0;";
            var svgClone = document.importNode(svgEl, !0);
            offscreenHost.appendChild(svgClone);
            document.body.appendChild(offscreenHost);
            apInlineStyles(svgClone);

            try {
                await pdfDoc.svg(svgClone, {
                    x: 0,
                    y: 0,
                    width: pageSizeMm,
                    height: pageSizeMm
                });
                apDrawLabels(pdfDoc, svgClone, vbX, vbY, vbW);
            } finally {
                document.body.removeChild(offscreenHost);
            }
            var mmScale = pageSizeMm / 3600;
            allowedIds = allowedIds instanceof Set ? allowedIds : new Set(allowedIds || []);
            var qrRes = await apQrImages(profileId, allowedIds, isSingle, includeNotes),
                qrImages = qrRes.images,
                qrOverflow = qrRes.overflowPieces || 0;
            var qrSizeMm = 42, qrTopMm = 148.75, rightQrX = 2780 * mmScale, leftQrX = 100 * mmScale;
            if (1 === qrImages.length) {
                pdfDoc.setFillColor(255, 255, 255);
                pdfDoc.rect(rightQrX - 1.4, 147.35, 44.8, 44.8, "F");
                try {
                    pdfDoc.addImage(qrImages[0], "PNG", rightQrX, qrTopMm, qrSizeMm, qrSizeMm);
                } catch (err) { __sxErrLog("pdf-image", err); }
            } else if (qrImages.length >= 2) {
                pdfDoc.setFillColor(255, 255, 255);
                pdfDoc.rect(rightQrX - 1.4, 147.35, 44.8, 44.8, "F");
                try {
                    pdfDoc.addImage(qrImages[0], "PNG", rightQrX, qrTopMm, qrSizeMm, qrSizeMm);
                } catch (err) { __sxErrLog("pdf-image", err); }
                pdfDoc.setFillColor(255, 255, 255);
                pdfDoc.rect(leftQrX - 1.4, 147.35, 44.8, 44.8, "F");
                try {
                    pdfDoc.addImage(qrImages[1], "PNG", leftQrX, qrTopMm, qrSizeMm, qrSizeMm);
                } catch (err) { __sxErrLog("pdf-image", err); }
            }
            if (qrOverflow > 0) {
                try {
                    pdfDoc.setFont("helvetica", "normal");
                    pdfDoc.setFontSize(8);
                    var noteLines = pdfDoc.splitTextToSize(sxOversizeDocumentNote(qrOverflow), 196).slice(0, 2),
                        noteH = 5.4 + 4.4 * (1 + noteLines.length),
                        noteY = 210 - noteH - 1.5;
                    pdfDoc.setFillColor(255, 255, 255);
                    pdfDoc.rect(3, noteY, 204, noteH, "F");
                    pdfDoc.setTextColor(17, 17, 17);
                    pdfDoc.setFont("helvetica", "bold");
                    pdfDoc.setFontSize(9.5);
                    pdfDoc.text("Too large for document scan codes — none printed", 105, noteY + 5.2, {
                        align: "center"
                    });
                    pdfDoc.setFont("helvetica", "normal");
                    pdfDoc.setFontSize(8);
                    noteLines.forEach(function(line, li) {
                        pdfDoc.text(line, 105, noteY + 9.6 + 4.4 * li, {
                            align: "center"
                        });
                    });
                } catch (err) { __sxErrLog("pdf-qr-note", err); }
            }
            apHeaderCard(pdfDoc, profileId, allowedIds, isSingle, mmScale);
            var outBlob = pdfDoc.output("blob");
            if (qrOverflow > 0) outBlob.sexcapadesQrOverflowPieces = qrOverflow;
            return outBlob;
        }
        async function sxExportVisibleMapPng(n, i = {}) {
            if (!vt[n] || !sxCanRunProfileAction(n, "capturing this profile", () => sxExportVisibleMapPng(n, i))) return;
            const a = Boolean(i.lowRes), r = a ? "Low-res visible-map PNG" : "Visible-map PNG", o = sxStartExportJob(`Capture ${sxFirstWordText(wt[n])}`, a ? "Building a compact PNG of the topics currently visible on your map…" : "Building a high-resolution PNG of the topics currently visible on your map…", {
                profileId: n
            });
            if (await sxFlushExportProgress(o, 6, "Preparing hypermap", "Opening a clean export canvas…"), o !== vf) return;
            const s = Boolean(i.includeProfileInfo), l = Boolean(i.blind), c = (s && wt[n], 
            sxExportFileNames(s ? wt[n] : "Shared profile")), d = a ? [ {
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
                await sxFlushExportProgress(o, 8, "Retrying at a safer size", `The larger render could not finish. Trying ${a.label} without losing profile data…`));
                try {
                    u = {
                        blob: await sxExportVisibleMap(n, {
                            lowRes: a.compact,
                            outputScale: a.scale,
                            photoIndices: i.photoIndices,
                            includeProfileInfo: s,
                            blind: l,
                            background: i.background || "black",
                            allowedIds: i.allowedIds,
                            progress: (e, t, n) => sxFlushExportProgress(o, e, t, n)
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
                    return void sxSaveExportPng(u.blob, t, {
                        title: `${r} · ${s ? sxShortNameText(wt[n], !0) : "Shared profile"}`,
                        subtitle: d + (s && sxCountFilledContacts(ut[n]) ? " A vCard is included." : ""),
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
                        window.lastExportSvgMarkup = null, sxDrawMapPdfBlob(g, n, s, l, i.allowedIds).then(function(e) {
                            var i = URL.createObjectURL(e), a = document.createElement("a");
                            a.href = i, a.download = sxExportFileNames(s ? wt[n] : "Shared profile").pdf, document.body.appendChild(a), 
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
                sxFailExportProgress(o, "The PNG could not be completed on this device. Your open profile is unchanged."), 
                e.byId("overlayStatus").textContent = "The image could not be created, but the profile and its JSON export are still available.", 
                console.error("Profile PNG export failed after memory-safe retries.", p);
            }
        }
        async function sxExportSyncCardPages(e, t = {}) {
            if (!vt[e] || !sxCanRunProfileAction(e, "capturing this profile", () => sxExportSyncCardPages(e, t))) return;
            const n = "a4" === t.paperSize ? "a4" : "letter", i = "a4" === n ? "A4" : "US Letter (Avery 5371)", a = "a4" === n ? "A4" : "Letter", r = sxStartExportJob(`Sync card pages · ${sxFirstWordText(wt[e])}`, `Building ${i} front and back pages…`, {
                profileId: e
            });
            try {
                const o = Boolean(t.includeProfileInfo), s = Boolean(t.blind), l = o ? wt[e] || "Profile" : "Shared profile", c = sxExportFileNames(o ? wt[e] : "Shared profile"), d = "a4" === n ? c.cardSheet.replace("-front-sheet.png", "-A4-front-sheet.png") : c.cardSheet, u = "a4" === n ? c.cardBackSheet.replace("-back-sheet.png", "-A4-back-sheet.png") : c.cardBackSheet, p = await async function(e, t = {}) {
                    const n = await sxRenderSyncCard(e, {
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
                    const s = "a4" === t.paperSize ? "a4" : "letter", l = sxTileCardSheet(r, !1, s), c = sxTileCardSheet(o, !0, s);
                    return {
                        front: await sxEmbedProfilePng(l, n.payload, n.vcard),
                        back: await sxEmbedProfilePng(c, n.payload, n.vcard)
                    };
                }(e, {
                    includeProfileInfo: o,
                    blind: s,
                    paperSize: n,
                    background: t.background || "black",
                    progress: (e, t, n) => sxFlushExportProgress(r, Math.min(94, e), t, n)
                });
                if (r !== vf) return;
                sxSaveExportPng(p.front, d, {
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
                tf.textContent = sxCardOversize ? "Close this window, then use Export QR codes for the numbered QR sheet." : "Close this window and try again.", sxPaintExportProgress(r, 100, Bm.textContent, jm.textContent, !1, "error"), console.error("Sync card page export failed.", e);
            }
        }
        async function sxExportCardFrontSheet(e, t = {}) {
            if (!vt[e] || !sxCanRunProfileAction(e, "creating a printable Sync card sheet", () => sxExportCardFrontSheet(e, t))) return;
            const n = sxStartExportJob(`Printable Sync cards · ${sxFirstWordText(wt[e])}`, "Building ten standard-size card fronts on a US Letter sheet…", {
                profileId: e
            });
            try {
                const i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = i ? wt[e] || "Profile" : "Shared profile", o = sxExportFileNames(i ? wt[e] : "Shared profile"), s = await async function(e, t = {}) {
                    const n = Boolean(t.includeProfileInfo), i = Boolean(t.blind), a = await sxRenderSyncCard(e, {
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
                    const s = sxTileCardSheet(o, !1, t.paperSize), l = t.allowedIds instanceof Set ? t.allowedIds : new Set(t.allowedIds || []), c = n ? wt[e] || "Profile" : "Shared profile";
                    return sxEmbedProfilePng(s, yx.serialize("envelope", {
                        bundleKind: "profile",
                        profiles: [ sxSerializeCardPayload(e, l, c, n, i) ]
                    }), n && sxCountFilledContacts(ut[e]) ? sxBuildProfileVcardText(e) : "");
                }(e, {
                    includeProfileInfo: i,
                    blind: a,
                    background: t.background || "black",
                    progress: (e, t, i) => sxFlushExportProgress(n, Math.min(88, e), t, i)
                });
                if (n !== vf) return;
                sxSaveExportPng(s, o.cardSheet, {
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
        async function sxExportCardBackSheet(e, t = {}) {
            if (!vt[e] || !sxCanRunProfileAction(e, "creating a printable Sync card-back sheet", () => sxExportCardBackSheet(e, t))) return;
            const n = sxStartExportJob(`Printable Sync card backs · ${sxFirstWordText(wt[e])}`, "Building ten standard-size card backs on a US Letter sheet…", {
                profileId: e
            });
            try {
                const i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = sxExportFileNames(i ? wt[e] : "Shared profile"), o = await async function(e, t = {}) {
                    const n = Boolean(t.includeProfileInfo), i = Boolean(t.blind), a = await sxRenderSyncCard(e, {
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
                    const s = sxTileCardSheet(o, !0, t.paperSize), l = t.allowedIds instanceof Set ? t.allowedIds : new Set(t.allowedIds || []), c = n ? wt[e] || "Profile" : "Shared profile";
                    return sxEmbedProfilePng(s, yx.serialize("envelope", {
                        bundleKind: "profile",
                        profiles: [ sxSerializeCardPayload(e, l, c, n, i) ]
                    }), n && sxCountFilledContacts(ut[e]) ? sxBuildProfileVcardText(e) : "");
                }(e, {
                    includeProfileInfo: i,
                    blind: a,
                    background: t.background || "black",
                    progress: (e, t, i) => sxFlushExportProgress(n, Math.min(88, e), t, i)
                });
                if (n !== vf) return;
                sxSaveExportPng(o, r.cardBackSheet, {
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
                tf.textContent = sxCardOversize ? "Close this window, then use Export QR codes for the numbered QR sheet." : "Close this window and try again.", sxPaintExportProgress(n, 100, Bm.textContent, jm.textContent, !1, "error"), console.error("Sync card-back sheet export failed.", e);
            }
        }
        async function sxExportLiveMapSvg(t, n = {}) {
            if (!vt[t] || !sxCanRunProfileAction(t, "exporting this profile as SVG", () => sxExportLiveMapSvg(t, n))) return;
            const i = sxStartExportJob(`Export ${sxFirstWordText(wt[t])}`, "Capturing the live rendered map exactly as it appears…", {
                profileId: t
            });
            try {
                if (await sxFlushExportProgress(i, 12, "Capturing live map", "Reading the rendered hypermap from the viewport…"), 
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
                r.removeAttribute("tabindex"), await sxFlushExportProgress(i, 48, "Embedding profile images", "Making every image in the standalone SVG self-contained…");
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
                const allowedIds = n.allowedIds instanceof Set ? n.allowedIds : new Set(n.allowedIds || []), h = sxSerializeExportPayload(t, allowedIds, Boolean(n.includeProfileInfo), "", Boolean(n.blind)), g = document.createElementNS("http://www.w3.org/2000/svg", "metadata"), m = document.createElementNS("http://www.w3.org/2000/svg", "sexcapades-profile");
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
                    // not just the brief hover tip - same stats lines the topic dialog shows
                    // (prevalence / fantasy stats, sources, FetLife counts, per-source
                    // popularity stats, risk note), computed with the same helpers
                    // (po / co / B / uo / popularitySourceStats) the dialog uses.
                    const node = sxNodeRegistry[e.getAttribute("data-layout-key")], about = [];
                    if (node) try {
                        const l = sxChildPrevalenceStats(node), c = l ? null : sxTopPrevalenceRow(node.label), d = l ? null : sxPeakPopularity(node.label);
                        if (l) {
                            about.push(`${"category" === l.kind ? "Topics in this category" : "Child topics"} range from ${sxNumberAsText(l.min)}% to ${sxNumberAsText(l.max)}% common; average ${sxNumberAsText(l.average)}% across ${l.count} with study data.`);
                            about.push(`Simple average of available child-topic prevalence estimates${l.missing ? `; ${l.missing} without study data skipped` : ""}.`);
                        } else if (c) {
                            const lbl = /\bfantasiz/i.test(c.label) ? c.label : `Adults fantasize about this: ${c.label}`;
                            about.push(c.display || `${lbl} (${sxNumberAsText(c.pct)}%)`);
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
                await sxFlushExportProgress(i, 72, "Inlining map styling", "Freezing colors, labels, lines, visibility, tooltips, and profile data into the standalone SVG…");
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
                    await sxFlushExportProgress(i, 84, "Compressing hypermap", "Making the standalone sync hypermap much smaller…");
                    const e = await new Response(v.stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer(), n = new Uint8Array(e);
                    if (n.length < 2 || 31 !== n[0] || 139 !== n[1]) throw new Error("The compressed sync hypermap export was incomplete.");
                    if (i !== vf) return;
                    const a = new Blob([ e ], {
                        type: "image/svg+xml"
                    });
                    window.__SEXCAPADES_LAST_HYPERMAP_EXPORT.compressedBlob = a;
                    return await sxFlushExportProgress(i, 96, "Finalizing export", "Preparing the compressed sync hypermap download…"), 
                    void sxOfferReadyDownload(a, sxExportFileNames(wt[t] || "Profile").svgz, {
                        title: `Sync hypermap · Compressed · ${wt[t] || "Profile"}`,
                        subtitle: "A much smaller standalone sync hypermap with full hover tooltips and embedded profile data. It needs a viewer that supports compressed SVG.",
                        downloadLabel: "Download compressed hypermap",
                        downloadTitle: "Downloads the much smaller compressed sync hypermap and re-importable profile.",
                        readyDetail: "Compressed sync hypermap complete. Choose Download to save it.",
                        preparedJob: i,
                        profileId: t
                    });
                }
                await sxFlushExportProgress(i, 96, "Finalizing export", "Preparing the regular sync hypermap preview and download…"), 
                sxPresentExportBlob(v, sxExportFileNames(wt[t] || "Profile").svg, {
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
                tf.textContent = String(e && e.message || e), sxFailExportProgress(i, "The sync hypermap could not be completed. Close this window and try again."), 
                console.error("Sync hypermap export failed.", e);
            }
        }
        async function sxExportVisibleMapPdf(e, t = {}) {
            if (!vt[e] || !sxCanRunProfileAction(e, "capturing this profile", () => sxExportVisibleMapPdf(e, t))) return;
            const n = sxStartExportJob(`Export ${sxFirstWordText(wt[e])}`, "Building a vector PDF of what's currently visible on your map…", {
                profileId: e
            }), i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = sxExportFileNames(i ? wt[e] : "Shared profile");
            try {
                if (await sxFlushExportProgress(n, 6, "Preparing hypermap", "Opening a clean export canvas…"), n !== vf) return;
                if (await sxExportVisibleMap(e, {
                    lowRes: !0,
                    outputScale: 4 / 9,
                    photoIndices: t.photoIndices,
                    includeProfileInfo: i,
                    blind: a,
                    background: t.background || "black",
                    allowedIds: t.allowedIds,
                    progress: (e, t, i) => sxFlushExportProgress(n, Math.min(72, .72 * e), t, i)
                }), n !== vf) return;
                const o = window.lastExportSvgMarkup;
                if (window.lastExportSvgMarkup = null, !o) throw new Error("Could not build the hypermap for PDF export.");
                await sxFlushExportProgress(n, 78, "Building vector PDF", "Drawing the hypermap and labels into a print-ready PDF…");
                const s = await sxDrawMapPdfBlob(o, e, i, a, t.allowedIds), l = await s.slice(0, 5).text(), c = await s.slice(Math.max(0, s.size - 1024)).text();
                if ("application/pdf" !== s.type || s.size < 1e3 || "%PDF-" !== l || !c.includes("%%EOF")) throw new Error("The generated file did not pass PDF validation.");
                if (n !== vf) return;
                const qrOverflow = s.sexcapadesQrOverflowPieces || 0;
                !function(e, t, n = {}) {
                    sxOfferReadyDownload(e, t, Object.assign({
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
                sxFailExportProgress(n, "The PDF could not be completed. Close this window and try again.");
            }
        }
        function sxOfferReadyDownload(e, t, n = {}) {
            if (Number.isInteger(n.preparedJob) && n.preparedJob !== vf) return !1;
            sxClearExportPreview(), hf = URL.createObjectURL(e), gf = t, mf = !0, yf = n.profileId && vt[n.profileId] ? n.profileId : null;
            const i = n.downloadLabel || "Download file";
            return Bm.textContent = n.title || "Your export is ready", jm.textContent = n.subtitle || "Your export is ready to download.", 
            qm.hidden = !1, Hm.textContent = t, Gm.dataset.filename = t, Gm.textContent = i, 
            Gm.title = n.downloadTitle || "Downloads the finished export.", Gm.disabled = !1, 
            tf.textContent = "", sxPaintExportProgress(vf, 100, "Ready to download", n.readyDetail || `Export complete. Choose ${i} to save it.`, !1), 
            !0;
        }
        async function sxExportProfileQrSheet(e, t = {}) {
            // QR sheet: the unified framework's unbounded fallback.
            // No count cap and no refusal - every SCP4 piece is
            // printed, numbered, and counted in the progress text
            // below, so the document and card paths can point here
            // for the complete version.
            const n = Boolean(t.includeProfileInfo), i = Boolean(t.blind), a = vt[e];
            if (!a || !sxCanRunProfileAction(e, "exporting this profile QR", () => sxExportProfileQrSheet(e, t))) return;
            const r = sxStartExportJob(`Profile QR · ${sxFirstWordText(wt[e])}`, "Building a large high-correction JPEG for recompressing picture sites…", {
                profileId: e
            });
            let sxQrSheetPieces = 0;
            try {
                if (await sxFlushExportProgress(r, 8, "Preparing profile data", "Compressing this profile for high-correction QR codes…"), 
                r !== vf) return;
                const o = n ? String(nt[e] || "").trim() : "", s = document.createElement("canvas").getContext("2d");
                s.font = "400 34px system-ui, sans-serif";
                const l = o.split(/\s+/), c = 2310, d = [];
                let u = "";
                l.forEach(e => {
                    const t = u ? u + " " + e : e;
                    s.measureText(t).width > c && u ? (d.push(u), u = e) : u = t;
                }), u && d.push(u);
                const p = o ? d.slice(0, 3) : [], h = p.length ? 44 * p.length + 16 : 0, g = t.allowedIds instanceof Set ? t.allowedIds : new Set(t.allowedIds || []), m = chunkPayload(await sxEncodeShareToken(e, g, n, i), {
                    chunkSize: 700
                });
                await sxFlushExportProgress(r, 28, "Generating QR codes", 1 === m.length ? "Creating one high-correction profile-data QR…" : `Creating ${m.length} numbered high-correction QR codes…`);
                sxQrSheetPieces = m.length;
                const f = document.createElement("canvas"), y = 2550, b = 120, v = 70, w = 230 + h, k = 270, x = 1 === m.length ? 1 : m.length <= 6 ? 2 : 3, S = Math.ceil(m.length / x), $ = Math.max(3300, 2 * b + w + 760 * S + v * (S - 1) + k), E = (y - 2 * b - v * (x - 1)) / x, A = ($ - 2 * b - w - k - v * (S - 1)) / S, C = Math.floor(Math.min(E, A - 64));
                f.width = y, f.height = $;
                const M = f.getContext("2d", {
                    alpha: !1
                });
                M.fillStyle = "#fff", M.fillRect(0, 0, y, $);
                const I = n ? String(wt[e] || "Profile") : "Shared profile", P = n ? sxPreferredUserText(e) : "", L = sxGlanceBucketsFor(e), T = [ L.percentages.green, L.percentages.yellow, L.percentages.red ];
                M.textAlign = "left", M.textBaseline = "top", M.fillStyle = "#111", M.font = "700 54px system-ui, sans-serif", 
                M.fillText(I + (m.length > 1 ? ` · profile data · ${m.length} QR codes` : ""), b, 52);
                const F = M.measureText(I).width;
                P && (M.fillStyle = "#5a6360", M.font = "500 36px system-ui, sans-serif", M.fillText("@" + P, b, 118)), 
                sxPaintScoreRings(M, Math.min(b + F + 150, y - 260), 122, [ 62, 50, 38 ], T, [ "#4da87c", "#b8912a", "#c94f4a" ], .18), 
                p.length && (M.fillStyle = "#5a6360", M.font = "400 34px system-ui, sans-serif", 
                M.textAlign = "left", M.textBaseline = "top", p.forEach((e, t) => M.fillText(e + (2 === t && d.length > 3 ? "…" : ""), b, 160 + 44 * t))), 
                m.length > 1 && (M.fillStyle = "#5a6360", M.textAlign = "center", M.font = "500 30px system-ui, sans-serif", 
                M.fillText("Scan every numbered code in any order.", y / 2, 196 + h));
                for (let e = 0; e < m.length; e++) {
                    await sxFlushExportProgress(r, 28 + Math.round(42 * (e + 1) / m.length), "Generating QR codes", `Creating profile-data QR ${e + 1} of ${m.length}…`);
                    const t = e % x, n = Math.floor(e / x), i = b + t * (E + v), a = b + w + n * (A + v), o = await sxRenderSingleQr(m[e], Math.max(960, C)), s = Math.round(i + (E - C) / 2), l = Math.round(a);
                    M.imageSmoothingEnabled = !1, M.drawImage(o, s, l, C, C), m.length > 1 && (M.fillStyle = "#111", 
                    M.font = "700 36px system-ui, sans-serif", M.fillText(`${e + 1}/${m.length}`, i + E / 2, l + C + 18));
                }
                const N = $ - k;
                M.fillStyle = "#fff", M.fillRect(0, N, y, k), M.strokeStyle = "#d5d5d5", M.lineWidth = 3, 
                M.beginPath(), M.moveTo(b, N + 2), M.lineTo(y - b, N + 2), M.stroke(), M.fillStyle = "#111", 
                M.textAlign = "center", M.textBaseline = "top", M.font = "600 44px system-ui, sans-serif", 
                M.fillText(`App: ${lu}`, y / 2, N + 58), M.fillText(`Guide: ${su}`, y / 2, N + 126), 
                await sxFlushExportProgress(r, 82, "Encoding image", "Compressing the printable QR page…");
                const _ = await sxCanvasToBlob(f, "image/jpeg", .98);
                if (!_) throw new Error("JPEG creation failed");
                if (r !== vf || vt[e] !== a) return;
                await sxFlushExportProgress(r, 96, "Finalizing export", "Preparing the QR preview and download…"), 
                sxPresentExportBlob(_, sxExportFileNames(n ? wt[e] : "Shared profile").qr, {
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
                // hold the complete profile - never a silent partial.
                Bm.textContent = "Could not create profile QR", jm.textContent = sxQrSheetPieces ? `This browser could not finish the high-correction QR page for ${sxQrSheetPieces} numbered codes.` : "This browser could not finish the high-correction QR page.", 
                tf.textContent = "Use the profile JSON or a PNG export instead — both hold the complete profile.", sxFailExportProgress(r, sxQrSheetPieces ? `The profile QR page could not be completed (${sxQrSheetPieces} numbered codes needed). Use the profile JSON or a PNG export instead — both hold the complete profile.` : "The profile QR page could not be completed. Use the profile JSON or a PNG export instead — both hold the complete profile."), 
                console.error("Profile QR JPEG export failed.", t);
            }
        }
