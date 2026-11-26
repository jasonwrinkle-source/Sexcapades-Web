// 06d1-export-dialog.js - Export dialogs, low-res preview, file preparation, and photo cropping
        const kg = e.byId("testResultLoaderDialog"), xg = e.byId("testResultLoaderStatus"), Sg = e.byId("profileImportDialog"), $g = e.byId("profileImportStatus"), Eg = e.byId("completionCelebrationDialog"), Ag = e.byId("completionCelebration"), Cg = e.byId("completionCelebrationCount"), Mg = e.byId("completionConfetti"), completionCompare = e.byId("completionCompare"), completionExport = e.byId("completionExport"), milestoneDialog = e.byId("milestoneCelebrationDialog"), milestoneTitle = e.byId("milestoneCelebrationTitle"), milestoneMessage = e.byId("milestoneCelebrationMessage"), milestoneContinue = e.byId("milestoneContinue"), milestoneCompare = e.byId("milestoneCompare"), milestoneExport = e.byId("milestoneExport"), milestoneImport = e.byId("milestoneImport"), milestoneScribe = e.byId("milestoneScribe"), closeMilestone = e.byId("closeMilestoneCelebration");
        function sxSetImportStatus(e, t = "info", n = !1) {
            $g.textContent = e || "", e ? $g.dataset.tone = t : $g.removeAttribute("data-tone"),
            n && e && requestAnimationFrame(() => {
                $g.scrollIntoView({
                    block: "nearest"
                }), $g.focus({
                    preventScroll: !0
                });
            });
        }
        function sxShowImportFailure(e, t, n = "read") {
            let i = yx.errorMessage(e, "The file could not be read.");
            "json" === n && /Unexpected token|JSON|position \d+/i.test(i) ? i = "The selected JSON file is malformed." : /does not contain (?:complete )?Sexcapades profile data/i.test(i) ? i = `No embedded Sexcapades profile data or readable profile QR was found in ${t.name}.` : /does not contain a readable Sexcapades profile-data QR code/i.test(i) && (i = `No readable Sexcapades profile QR was found in ${t.name}.`),
            sxSetImportStatus(`Import failed: ${i}`, "error", !0);
        }
        const Lg = e.byId("importedContactDialog"), Tg = e.byId("importedContactDetails"), Fg = e.byId("addImportedContact"), Ng = e.byId("importedContactStatus"), _g = e.byId("profileDetailsDialog"), Dg = e.byId("profileDetailsBody"), Rg = e.byId("profileDialogAbout"), Og = e.byId("profileDialogPhoto"), Bg = e.byId("profileDialogIdentity"), jg = e.byId("profileDialogRatings"), qg = e.byId("profileDialogSiteLinks"), Hg = e.byId("profileDetailsName"), Wg = e.byId("profileDetailsGender"), Ug = e.byId("profileDetailsSexuality"), Gg = e.byId("profileDetailsRole"), Kg = e.byId("profileDetailsAge"), Pz = e.byId("profileDetailsPronouns"), zg = e.byId("profileDetailsLocation"), Vg = e.byId("profileDetailsFetLife"), Yg = e.byId("profileDetailsPhone"), Xg = e.byId("profileDetailsTelegram"), Zg = e.byId("profileDetailsEmail"), Qg = e.byId("profileDetailsLinktree"), Jg = e.byId("profileDetailsChaturbate"), em = e.byId("profileDetailsX"), tm = e.byId("profileDetailsXhamster"), nm = e.byId("profileDetailsXvideos"), im = e.byId("profileDetailsAbout"), am = e.byId("profileDetailsAboutCount"), rm = e.byId("profileDetailsTerms"), om = e.byId("profileDetailsTermsCount"), sm = e.byId("profileDetailsStatus"), lm = e.byId("profilePhotoInput"), cm = e.byId("profilePhotoList"), dm = e.byId("profilePhotoCount"), um = e.byId("profilePhotoDialog"), pm = e.byId("profilePhotoFull"), hm = e.byId("profilePhotoViewer"), gm = e.byId("profilePhotoStage"), mm = e.byId("profilePhotoPosition"), fm = e.byId("profilePhotoZoomValue"), ym = e.byId("closeProfileDialog"), bm = e.byId("closeProfileTitle"), vm = e.byId("saveClosingProfile"), wm = e.byId("discardProfileDetailsDialog"), km = e.byId("profileExportDialog"), xm = e.byId("profileExportTitle"), Sm = e.byId("profileExportSubtitle"), $m = e.byId("profileExportDataNote"), Em = e.byId("includeContactInfo"), Am = e.byId("includeContactInfoHelp"), Cm = e.byId("blindProfileExport"), Mm = e.byId("exportAboutMe"), Im = e.byId("exportAboutMeCount"), Pm = e.byId("lowResPhotoDialog"), Lm = e.byId("lowResPhotoTitle"), Tm = e.byId("lowResPhotoGrid"), Fm = e.byId("lowResPhotoSummary"), exportPhotoGrid = e.byId("exportPhotoGrid"), exportPhotoSummary = e.byId("exportPhotoSummary"), Nm = e.byId("secondaryFile"), _m = e.byId("secondaryImage"), Dm = e.byId("secondaryFileName"), Rm = e.byId("secondaryFileLink"), Om = e.byId("fileDialog"), Bm = e.byId("fileDialogTitle"), jm = e.byId("fileDialogSubtitle"), qm = e.byId("fileReady"), Hm = e.byId("fileName"), Wm = e.byId("fileHelp"), Um = e.byId("preparedImage"), Gm = e.byId("preparedImageLink"), Km = e.byId("ninjaTransferLink"), zm = e.byId("ninjaTransferHint"), Vm = e.byId("preparedImageToolbar"), Ym = e.byId("preparedImageViewport"), Xm = e.byId("preparedImageStage"), Zm = e.byId("preparedZoomValue"), Qm = e.byId("preparedZoomIn"), Jm = e.byId("preparedZoomOut"), ef = e.byId("preparedZoomFit"), tf = e.byId("fileStatus"), nf = e.byId("fileProgress"), af = e.byId("fileProgressStage"), rf = e.byId("fileProgressValue"), of = e.byId("fileProgressTrack"), sf = e.byId("fileProgressBar"), lf = e.byId("fileProgressPortrait"), cf = e.byId("fileProgressInitials"), df = e.byId("fileProgressDetail");
        let uf = null, pf = null, hf = null, gf = null, mf = !1, ff = null, yf = null, bf = null, vf = 0, wf = null, kf = null, xf = new Set, Sf = !1, $f = !0, Ef = null, Af = new Set, Cf = !1, Mf = !0, If = "black", Pf = new Set, exportPhotoSelection = new Set, Lf = "png-lowres", Tf = null, Ff = 1, Nf = !1, _f = null;
        const Df = new Map;
        function sxResetPreparedZoom(e) {
            Nf = Boolean(e), Ff = 1, _f = null, Df.clear(), Vm.hidden = !Nf, Ym.classList.toggle("is-zoomable", Nf),
            Ym.classList.remove("is-zoomed", "is-dragging"), Xm.removeAttribute("style"), Um.removeAttribute("style"),
            Zm.value = "100%", Qm.disabled = !Nf, Jm.disabled = !0, ef.disabled = !0;
        }
        function sxLayoutPreparedZoom(e = !0) {
            if (!(Nf && Um.naturalWidth && Ym.clientWidth && Ym.clientHeight)) return;
            const t = Ym.clientWidth, n = Ym.clientHeight, i = Math.max(1, Xm.scrollWidth), a = Math.max(1, Xm.scrollHeight), r = (Ym.scrollLeft + t / 2) / i, o = (Ym.scrollTop + n / 2) / a, s = Math.min(t / Um.naturalWidth, n / Um.naturalHeight), l = Math.max(1, Math.round(Um.naturalWidth * s * Ff)), c = Math.max(1, Math.round(Um.naturalHeight * s * Ff)), d = Math.max(t, l), u = Math.max(n, c);
            Xm.style.width = `${d}px`, Xm.style.height = `${u}px`, Um.style.width = `${l}px`,
            Um.style.height = `${c}px`, Um.style.left = "50%", Um.style.top = "50%", Um.style.transform = "translate(-50%,-50%)",
            Ym.classList.toggle("is-zoomed", Ff > 1.001), Zm.value = `${Math.round(100 * Ff)}%`,
            Qm.disabled = Ff >= 5, Jm.disabled = Ff <= 1, ef.disabled = Ff <= 1, e && requestAnimationFrame(() => {
                Ym.scrollLeft = Math.max(0, r * Xm.scrollWidth - t / 2), Ym.scrollTop = Math.max(0, o * Xm.scrollHeight - n / 2);
            });
        }
        function sxSetPreparedZoom(e, t = !0) {
            Nf && (Ff = Math.max(1, Math.min(5, e)), sxLayoutPreparedZoom(t));
        }
        function sxClearExportPreview() {
            uf && URL.revokeObjectURL(uf), pf && URL.revokeObjectURL(pf), hf && URL.revokeObjectURL(hf),
            uf = null, pf = null, hf = null, gf = null, mf = !1, yf = null, bf = null, Nm.hidden = !0,
            _m.removeAttribute("src"), _m.alt = "", Rm.disabled = !0, delete Rm.dataset.filename,
            Um.onload = null, Um.removeAttribute("src"), Um.alt = "", Gm.disabled = !0, delete Gm.dataset.filename,
            Km.hidden = !0, Km.disabled = !0, zm.hidden = !0, sxResetPreparedZoom(!1), qm.hidden = !0;
        }
        function sxPaintExportProgress(e, t, n, i = "", a = !0, r = "") {
            if (Number.isInteger(e) && e !== vf) return !1;
            const o = Math.max(0, Math.min(100, Math.round(Number(t) || 0)));
            return nf.hidden = !1, nf.classList.toggle("is-working", Boolean(a)), r ? nf.dataset.tone = r : delete nf.dataset.tone,
            af.textContent = n || "Preparing export", rf.value = `${o}%`, rf.textContent = `${o}%`,
            of.setAttribute("aria-valuenow", String(o)), of.setAttribute("aria-valuetext", `${n || "Preparing export"}, ${o}% complete`),
            of.style.setProperty("--progress", String(o)), sf.style.width = `${o}%`, df.textContent = i || "",
            !0;
        }
        function sxFlushExportProgress(e, t, n, i = "", a = !0, r = "") {
            return sxPaintExportProgress(e, t, n, i, a, r) ? new Promise(t => requestAnimationFrame(() => requestAnimationFrame(() => t(e === vf)))) : Promise.resolve(!1);
        }
        function sxFailExportProgress(e, t) {
            sxPaintExportProgress(e, 100, "Export stopped", t || "The export could not be completed.", !1, "error");
        }
        function sxStartExportJob(e = "Preparing image", t = "Building your shareable PNG…", n = {}) {
            const i = ++vf;
            return sxClearExportPreview(), function(e) {
                const t = e && vt[e] ? String(wt[e] || "Profile") : "Profile", n = e && vt[e] ? (dt[e] || [])[0] : null;
                cf.textContent = (sxFirstWordText(t).trim().charAt(0) || "S").toUpperCase(), lf.classList.toggle("has-photo", Boolean(n)),
                lf.querySelector("svg")?.remove(), n && lf.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 100 100" aria-hidden="true">${sxCroppedPhotoMarkup(n, {
                    x: 0,
                    y: 0,
                    w: 100,
                    h: 100
                })}</svg>`);
            }(n.profileId), ff = n.returnDialog || null, ff && ff.open && sxCloseModalDialog(ff), Bm.textContent = e,
            jm.textContent = t, tf.textContent = "Building…", sxPaintExportProgress(i, 2, "Starting export", "Preparing the export screen…", !0),
            sxOpenModalDialog(Om), i;
        }
        function sxPresentExportBlob(e, t, n = {}) {
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
            if (sxClearExportPreview(), sxResetPreparedZoom(n.zoomable), ff = i, yf = n.profileId && vt[n.profileId] ? n.profileId : null,
            ff && ff.open && sxCloseModalDialog(ff), uf = URL.createObjectURL(e), n.svgMarkup && n.profileId) try {
                var a = n.pdfFilename || sxExportFileNames(wt[n.profileId]).pdf;
                sxDrawMapPdfBlob(n.svgMarkup, n.profileId, Boolean(n.includeProfileInfo), Boolean(n.blind), n.allowedIds).then(function(e) {
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
            Um.onload = () => requestAnimationFrame(() => sxLayoutPreparedZoom(!1)), Um.src = uf, qm.hidden = !1,
            tf.textContent = Nf ? "Use +/−, the mouse wheel, or pinch to inspect fine details. Download keeps the original full-resolution image and its filename." : "The profile stays open when this image closes.",
            sxPaintExportProgress(vf, 100, "Ready to download", "Export complete. Review the preview, then choose Download.", !1),
            sxOpenModalDialog(Om), requestAnimationFrame(() => sxLayoutPreparedZoom(!1));
        }
        function sxCloseExportDialog() {
            ++vf;
            const e = ff;
            ff = null, sxCloseModalDialog(Om), t.setTimeout(() => {
                if (sxClearExportPreview(), e) {
                    if (!(e !== ym || wf && vt[wf])) return;
                    sxOpenModalDialog(e);
                }
            }, 0);
        }
        function renderExportPhotoPicker() {
            if (!exportPhotoGrid || !kf || !vt[kf]) return;
            const t = sxClonePhotoRecords(dt[kf] || []);
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
            const e = sxClonePhotoRecords(dt[kf] || []);
            return e.length ? [ 0, ...[ ...exportPhotoSelection ].filter(t => t > 0 && t < e.length) ].sort((e, t) => e - t) : [];
        }
        function sxCloseExportChooser() {
            kf = null, xf.clear(), exportPhotoSelection.clear(), Sf = !1, $f = !0, sxCloseModalDialog(km);
        }
        function sxSyncProfileInfoToggle() {
            Sf = Boolean(Em.checked), Em.disabled = !1, Am.textContent = Sf ? "Includes the saved profile name, About Me, photos, contact details, and vCard for personal backup." : "Shared exports contain ratings and markers with a generic profile label; name, About Me, photos, contact details, and vCard are omitted.",
            Mm.disabled = !Sf, renderExportPhotoPicker();
        }
        function sxRefreshExportAboutCount() {
            Im && (Im.textContent = String(Mm.value.length) + "/975 characters");
        }
        function sxRefreshLowResPicker() {
            const t = [ ...Tm.querySelectorAll("[data-lowres-photo]") ], n = Pf.size;
            t.forEach(e => {
                const t = Pf.has(Number(e.dataset.lowresPhoto));
                e.setAttribute("aria-pressed", String(t)), e.setAttribute("aria-label", `${e.querySelector("span").textContent}: ${t ? "included" : "not included"}`),
                e.querySelector("small").textContent = t ? "Included" : "Not included";
            }), Fm.textContent = `${n} of ${t.length} ${1 === t.length ? "photo" : "photos"} included in this export`,
            e.byId("selectAllLowResPhotos").disabled = n === t.length, e.byId("clearLowResPhotos").disabled = 0 === n;
        }
        function sxCloseLowResPicker() {
            Ef = null, Af.clear(), Cf = !1, Mf = !0, Pf.clear(), Tm.replaceChildren(), Fm.textContent = "",
            sxCloseModalDialog(Pm);
        }
        // Qf (sharing-sync refactor F4): options object, not seven
        // positionals - a misordered boolean used to silently flip
        // blind/shared or background. Defaults match the old
        // positional defaults exactly.
        function sxBuildProfileExport(t, n = {}) {
            const i = Boolean(n.includeProfileInfo), a = void 0 === n.background ? "black" : n.background, r = void 0 === n.format ? "png-lowres" : n.format, o = !1 !== n.blind, s = void 0 === n.allowedIds ? new Set : n.allowedIds, l = void 0 === n.photoIndices ? [] : n.photoIndices, c = s instanceof Set ? new Set(s) : new Set(s || []), d = Array.isArray(l) ? l.slice() : [];
            return "pdf" === r ? sxExportVisibleMapPdf(t, {
                photoIndices: d,
                includeProfileInfo: i,
                background: a,
                blind: o,
                allowedIds: c
            }) : sxExportVisibleMapPng(t, {
                lowRes: "png" !== r,
                photoIndices: d,
                includeProfileInfo: i,
                background: a,
                blind: o,
                allowedIds: c
            });
        }
        function sxOpenProfileExport(e) {
            if (!vt[e] || !sxCanRunProfileAction(e, "capturing this profile", () => sxOpenProfileExport(e))) return;
            const exportProfileName = String(wt[e] || "").trim();
            (!exportProfileName || /^unknown$/i.test(exportProfileName)) && (wt[e] = "Untitled profile", sxRenderProfileTabs());
            kf = e, xf = function(e) {
                // F8 (sharing-sync refactor): the solo switch /
                // collect / restore below is wrapped in try/finally.
                // An exception mid-collect used to strand the live
                // map in solo view; the restore now always runs.
                // (nu's same solo-switch shape was checked: its
                // restore is likewise inline and unguarded, so this
                // guard was NOT generalized to it in this pass.)
                const t = Mt, n = It, i = sxListLiveSelections(), a = Mt !== e || It !== e || i.length > 1 || 1 === i.length && i[0] !== e;
                a && (Mt = e, It = e, sxSel(null, "clear"), sxRequestMapPaint({
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
                        const ancestors = (typeof sxNodeAncestorIds === "function") ? sxNodeAncestorIds(t, e) : (() => {
                            const n = sxNodeRegistry[t] || sxNodeById(t) || (at[e] || {})[t];
                            return [ n?.parentId, n?.branch ? catId(n.branch) : null ].filter(Boolean);
                        })();
                        ancestors.forEach(ancId => r.add(ancId));
                    });
                } finally {
                    a && (Mt = t, It = n, sxSel(i, "set"), sxRequestMapPaint({
                        animate: !1
                    }));
                }
                return r;
            }(e), Em.checked = !1, Cm.checked = !0, $f = !0, xm.textContent = `Export ${wt[e]}`,
            Sm.textContent = "Choose an export format. On mobile, exports may take a minute or two.";
            const t = (dt[e] || []).length;
            exportPhotoSelection = new Set(Array.from({ length: t }, (e, t) => t));
            $m.textContent = `Exports what's currently visible on your map. Every format limits embedded profile data to those same visible topics${t ? ` and can include ${t} attached ${1 === t ? "photo" : "photos"} when profile info is included` : ""}.`,
            sxSyncProfileInfoToggle(), Mm.value = String(nt[e] || ""), sxRefreshExportAboutCount(), sxOpenModalDialog(km);
        }
        e.byId("closeProfileExport") && (e.byId("closeProfileExport").onclick = sxCloseExportChooser), km.addEventListener("click", e => {
            e.target === km && sxCloseExportChooser();
        }), km.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseExportChooser();
        }), Em.addEventListener("change", sxSyncProfileInfoToggle), Cm.addEventListener("change", () => {
            $f = Boolean(Cm.checked);
        }), Mm.addEventListener("input", sxRefreshExportAboutCount), km.querySelectorAll("[data-profile-export]").forEach(t => t.addEventListener("click", () => {
            const n = kf, i = new Set(xf), a = t.dataset.profileExport, r = Boolean(Sf), o = Boolean($f), s = (km.querySelector("input[name=exportBackground]:checked") || {}).value || "black", l = "a4" === (e.byId("syncCardPaperSize") || {}).value ? "a4" : "letter", c = selectedExportPhotos();
            sxCloseExportChooser(), n && vt[n] && (r && (nt[n] = String(Mm.value || "").trim().slice(0, 975)),
            "qr" === a ? sxExportProfileQrSheet(n, {
                includeProfileInfo: r,
                blind: o,
                allowedIds: i
            }) : "card" === a ? sxExportSyncCardPages(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                paperSize: l,
                allowedIds: i
            }) : "svg" === a ? sxExportLiveMapSvg(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                allowedIds: i
            }) : "svgz" === a ? sxExportLiveMapSvg(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                allowedIds: i,
                compressed: !0
            }) : sxBuildProfileExport(n, {
                includeProfileInfo: r,
                background: s,
                format: "pdf" === a ? "pdf" : "zoom" === a ? "png-lowres" : "png",
                blind: o,
                allowedIds: i,
                photoIndices: c
            }));
        }));
        const ey = e.byId("openerDialog"), ty = e.byId("negotiationDialog");
        function sxClickDownloadLink(e, t) {
            if (!e) return;
            const n = document.createElement("a");
            n.href = e, n.download = t || "Sexcapades-profile.png", n.hidden = !0, document.body.appendChild(n),
            n.click(), n.remove();
        }
        e.byId("openOpener") && e.byId("openOpener").addEventListener("click", () => {
            // Opener follows its dialog (load-target stage,
            // 2026-10-27): the button lives inside the profile
            // details dialog, so its target is that dialog's profile
            // (Hy) - never whichever profile the viewport happens to
            // display. A missing dialog profile is a visible error,
            // not a silent fall back to the active profile. The
            // opener itself stays exactly where it is.
            const t = Hy && vt[Hy] ? Hy : null;
            if (!t) return void sxShowStatusToast("This dialog is not showing a profile, so there is no profile to build an opener from.", {
                tone: "error",
                persistent: !0
            });
            _g.open && sxCloseModalDialog(_g), !ft[t] && (sxFillOpenerMessage(), sxOpenModalDialog(e.byId("openerDialog")));
        }), e.byId("openNegotiation") && e.byId("openNegotiation").addEventListener("click", function() {
            const t = function() {
                const e = sxListLiveSelections().filter(e => vt[e]);
                if (e.length >= 2) return e;
                const t = sxActiveGroupRecord(), n = (t?.sourceIds || []).filter(e => vt[e]);
                return n.length >= 2 ? n : [];
            }();
            if (t.length < 2) return;
            const i = sxSceneNegotiationData(t), a = e.byId("negotiationPanel"), r = sxSceneCastPrefs(t), isMod = sxSetterIsModeration(), mod = isMod ? sxSetterModerationData(t) : null, setterSpec = window.__SX_SETTER || null, skinKey = String((window.__SX_ACTIVE_SKIN || "sexcapades") + ":" + (isMod ? "mod" : "play")), partKey = t.join(",");
            e.byId("negotiationSubtitle").textContent = isMod ? `${i.names.join(" + ")} · ${(setterSpec && setterSpec.panel && setterSpec.panel.subtitleSuffix) || "the ground rules stay in every discussion plan."}` : `${i.names.join(" + ")} · limits stay out of every play suggestion.`, e.byId("negotiationProfiles").textContent = i.names.join(" + ");
            const reuseExistingPanel = Boolean(a && a.children.length > 0 && ty && ty.dataset.participants === partKey && ty.dataset.setterSkinKey === skinKey);
            if (!reuseExistingPanel) {
                n(a, isMod ? sxSetterModerationPanelHtml(i, mod) : `<p class="sx-stamp">${sxEscapeHtmlText(sxWriterStamp(i.ids))}</p><fieldset class="guide-block guide-block-limits"><legend>Hard limits + red topics</legend><div class="guide-limits-grid">${i.names.map((e, t) => `<div class="guide-limit-group"><h5>${sxEscapeHtmlText(e)} · hard limits</h5><ul>${sxListItemMarkup(i.terms[t] ? i.limits[t].concat(`Terms (binding): "${i.terms[t]}"`) : i.limits[t], "None marked.")}</ul></div><div class="guide-limit-group"><h5>${sxEscapeHtmlText(e)} · red topics</h5><ul>${sxListItemMarkup(i.reds[t], "None rated red.")}</ul></div>`).join("")}</div></fieldset><section class="guide-block guide-block-mutual"><h4>Mutual exclusions — both partners rated deep-red</h4><ul>${sxListItemMarkup(i.mutuals, "No topic is rated deep-red by both partners.")}</ul></section><section class="guide-block guide-block-discuss"><h4>Discuss first</h4><ul>${sxListItemMarkup(i.discuss, "No green-versus-red clashes found.")}</ul></section><section class="guide-block"><h4>Fill out before play</h4><div class="negotiation-fields"><label class="negotiation-field"><span>Safewords + nonverbal stop signals</span><small>Choose a shared system, define exactly what slows or stops play, and name a backup signal for anyone who cannot speak.</small><div class="signal-presets" role="group" aria-label="Common stop-signal starters"><label class="signal-preset"><input data-signal-preset="Stoplight: green = continue, yellow = slow down/check in, red = stop." type="checkbox"/>Stoplight</label><label class="signal-preset"><input data-signal-preset="Nonverbal stop: drop a held object." type="checkbox"/>Drop object</label><label class="signal-preset"><input data-signal-preset="Nonverbal stop: three firm taps." type="checkbox"/>Three taps</label></div><textarea data-negotiation-safewords placeholder="Example: green = continue; yellow = slow and check in; red = stop. If speech is difficult, dropping the held object or three firm taps means stop.">${sxEscapeHtmlText(r.safewords)}</textarea></label>${i.names.map((e, t) => `<label class="negotiation-field"><span>${sxEscapeHtmlText(e)} · aftercare needs</span><small>Write what ${sxEscapeHtmlText(e)} needs immediately after play and later: touch or space, reassurance, water or food, cleanup, medication or accessibility needs, check-in timing, and anything to avoid.</small><textarea data-negotiation-aftercare="${sxEscapeHtmlText(i.ids[t])}" placeholder="Example: water first, then quiet cuddling; no debrief until tomorrow; text check-in by noon…">${sxEscapeHtmlText(r.aftercare[i.ids[t]] || "")}</textarea></label>`).join("")}</div><h5>Rated aftercare preferences from the map</h5><p class="guide-source-intro">These suggestions come from each profile’s <strong>Connection &amp; aftercare</strong> ratings. Put lasting personal aftercare details in a note on an aftercare map topic; use the boxes above to confirm what applies to this specific plan.</p>${i.names.map((e, t) => `<strong>${sxEscapeHtmlText(e)}</strong><ul>${sxListItemMarkup(i.ratedAftercare[t], "None recorded.")}</ul>`).join("")}</section><section class="guide-block"><h4>Play guide source material</h4><p class="guide-source-intro">This is the profile-derived idea pool the AI may arrange into a guide. It is not an agreement: the limits, stop signals, aftercare fields, and decisions above are the binding checklist.</p><div class="guide-source-grid"><div class="guide-source-group"><h5>Warm-up ideas</h5><ul>${sxListItemMarkup(i.warmup, "Agree on a gentle start together.")}</ul></div><div class="guide-source-group"><h5>Main-play ideas</h5><ul>${sxListItemMarkup(i.main, "No shared green/green main-play topic is recorded.")}</ul></div><div class="guide-source-group"><h5>Aftercare ideas</h5><ul>${sxListItemMarkup(i.aftercare, "Agree on aftercare before starting.")}</ul></div><div class="guide-source-group"><h5>Hard-excluded</h5><ul>${sxListItemMarkup([ ...new Set(i.excluded.concat(i.mutuals)) ].concat(i.names.map((e, t) => i.terms[t] ? e + " — hard limits named in Terms (binding), quoted above" : "").filter(Boolean)), "None marked.")}</ul></div><div class="guide-source-group"><h5>Fantasy only — excluded from practical play</h5><ul>${sxListItemMarkup(i.fantasy || [], "No fantasy-only topics are in the shared pool.")}</ul></div><div class="guide-source-group"><h5>Teasers — soft no revisited at the current Heat</h5><ul>${sxListItemMarkup(i.teasers || [], "No soft-no topics are teaser-eligible at the current settings.")}</ul></div></div></section>`);
                // The safeword/aftercare inputs exist only on Sexcapades:
                // a moderation skin has no safewords or aftercare to save,
                // so the listener (which reads the safewords textarea) is
                // not attached there - it would throw on a null query.
                if (!isMod && !a.__sxNegotiationInputWired) {
                    a.__sxNegotiationInputWired = true;
                    a.addEventListener("input", () => {
                        const curIds = String(e.byId("negotiationDialog")?.dataset.participants || "").split(",").filter(Boolean);
                        if (curIds.length < 2) return;
                        const curState = sxSceneCastPrefs(curIds), swEl = a.querySelector("[data-negotiation-safewords]");
                        if (swEl) curState.safewords = swEl.value;
                        a.querySelectorAll("[data-negotiation-aftercare]").forEach(el => {
                            curState.aftercare[el.dataset.negotiationAftercare] = el.value;
                        });
                        sxStoreSceneGuide(curIds);
                        e.byId("negotiationCopyStatus").textContent = "Checklist saved for both documents.";
                        e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = "Checklist saved for both documents.");
                    });
                }
                !isMod && a.querySelectorAll("[data-signal-preset]").forEach(e => {
                    const t = String(e.dataset.signalPreset || ""), n = a.querySelector("[data-negotiation-safewords]");
                    e.checked = Boolean(t && n.value.includes(t)), e.addEventListener("change", () => {
                        const i = n.value.split("\n").map(e => e.trim()).filter(Boolean).filter(e => e !== t);
                        e.checked && i.push(t), n.value = i.join("\n"), n.dispatchEvent(new Event("input", {
                            bubbles: !0
                        }));
                    });
                });
                e.byId("negotiationCopyStatus").textContent = "";
                e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = "");
                e.byId("setterLength") && (e.byId("setterLength").value = r.length);
                e.byId("setterLengthUnit") && (e.byId("setterLengthUnit").value = r.lengthUnit);
                e.byId("setterDetailLevel") && (e.byId("setterDetailLevel").value = r.detail);
                e.byId("setterNegotiationLength") && (e.byId("setterNegotiationLength").value = r.negotiationLength || "1");
                e.byId("setterNegotiationLengthUnit") && (e.byId("setterNegotiationLengthUnit").value = r.negotiationLengthUnit || "pages");
            }
            sxStoreSceneGuide(t, i, mod), e.byId("negotiationDialog").dataset.participants = partKey, e.byId("negotiationDialog").dataset.setterSkinKey = skinKey, sxOpenModalDialog(e.byId("negotiationDialog"));
        }), e.byId("closeOpener").onclick = () => sxCloseModalDialog(ey), e.byId("closeNegotiation") && (e.byId("closeNegotiation").onclick = () => sxCloseModalDialog(ty)),
        ey.addEventListener("click", e => {
            e.target === ey && sxCloseModalDialog(ey);
        }), ey.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseModalDialog(ey);
        }), e.byId("copyOpenerMessage") && e.byId("copyOpenerMessage").addEventListener("click", async () => {
            const t = e.byId("openerMessage");
            await sxCopyText(t.value, e.byId("openerCopyStatus"), "Message copied", "Copy failed", null, {
                ta: t,
                throughOnEmpty: !0
            });
        }), e.byId("nextOpenerMessage") && e.byId("nextOpenerMessage").addEventListener("click", sxFillOpenerMessage), e.byId("copyNegotiation") && e.byId("copyNegotiation").addEventListener("click", async () => {
            setterParticipantIds(), await sxCopyText(playGuidePromptText(), e.byId("negotiationCopyStatus"), sxSetterIsModeration() ? "AI discussion-plan prompt copied" : "AI play-guide prompt copied", "Copy failed", e.byId("negotiationDialog"));
        }), e.byId("copyNegotiationGuide") && e.byId("copyNegotiationGuide").addEventListener("click", async () => {
            const t = e.byId("negotiationPanel");
            setterParticipantIds(), await sxCopyText(t.dataset.negotiationGuide || "", e.byId("negotiationGuideStatus"), sxSetterIsModeration() ? "Discussion agreement copied" : "Negotiation guide copied", "Copy failed", e.byId("negotiationDialog"));
        }), e.byId("downloadNegotiationGuide") && e.byId("downloadNegotiationGuide").addEventListener("click", () => {
            const ids = setterParticipantIds();
            const t = e.byId("negotiationPanel"), text = t?.dataset.negotiationGuide || "", status = e.byId("negotiationGuideStatus");
            if (!text) return void (status && (status.textContent = "Select two profiles first."));
            const names = sxFilenameSlug(ids.map(id => wt[id] || id).join("-"), "profiles"), blob = new Blob([ text + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url, a.download = `${sxSkinDownloadPrefix()}-${names}-${sxSetterIsModeration() ? "discussion-agreement" : "negotiation-guide"}.txt`, a.hidden = !0, document.body.appendChild(a), a.click(), a.remove(), setTimeout(() => URL.revokeObjectURL(url), 0), status && (status.textContent = sxSetterIsModeration() ? "Discussion agreement downloaded." : "Negotiation guide downloaded.");
        }), e.byId("downloadPlayGuide") && e.byId("downloadPlayGuide").addEventListener("click", () => {
            const ids = setterParticipantIds();
            const t = e.byId("negotiationPanel"), text = playGuidePromptText(), status = e.byId("negotiationCopyStatus");
            if (!text) return void (status && (status.textContent = "Select two profiles first."));
            const names = sxFilenameSlug(ids.map(id => wt[id] || id).join("-"), "profiles"), blob = new Blob([ text + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url, a.download = `${sxSkinDownloadPrefix()}-${names}-${sxSetterIsModeration() ? "discussion-plan-prompt" : "play-guide-prompt"}.txt`, a.hidden = !0, document.body.appendChild(a), a.click(), a.remove(), setTimeout(() => URL.revokeObjectURL(url), 0), status && (status.textContent = sxSetterIsModeration() ? "Discussion plan prompt downloaded." : "Play guide prompt downloaded.");
        }), exportPhotoGrid.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "exportPhoto");
            if (!t || t.disabled) return;
            const n = Number(t.dataset.exportPhoto);
            exportPhotoSelection.has(n) ? exportPhotoSelection.delete(n) : exportPhotoSelection.add(n), renderExportPhotoPicker();
        }), e.byId("selectAllExportPhotos").onclick = () => {
            sxClonePhotoRecords(dt[kf] || []).forEach((e, t) => exportPhotoSelection.add(t)), renderExportPhotoPicker();
        }, e.byId("clearExportPhotos").onclick = () => {
            exportPhotoSelection.clear(), exportPhotoSelection.add(0), renderExportPhotoPicker();
        }, Tm.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "lowresPhoto");
            if (!t) return;
            const n = Number(t.dataset.lowresPhoto);
            Pf.has(n) ? Pf.delete(n) : Pf.add(n), sxRefreshLowResPicker();
        }), e.byId("selectAllLowResPhotos").onclick = () => {
            Tm.querySelectorAll("[data-lowres-photo]").forEach(e => Pf.add(Number(e.dataset.lowresPhoto))),
            sxRefreshLowResPicker();
        }, e.byId("clearLowResPhotos").onclick = () => {
            Pf.clear(), sxRefreshLowResPicker();
        }, e.byId("createLowResExport").onclick = () => {
            const e = Ef, t = new Set(Af), n = Cf, i = Mf, a = [ ...Pf ].sort((e, t) => e - t), r = Lf || "png-lowres", o = If;
            sxCloseLowResPicker(), e && vt[e] && ("pdf" === r ? sxExportVisibleMapPdf(e, {
                photoIndices: a,
                includeProfileInfo: n,
                blind: i,
                background: o,
                allowedIds: t
            }) : sxExportVisibleMapPng(e, {
                lowRes: "png" !== r,
                photoIndices: a,
                includeProfileInfo: n,
                blind: i,
                background: o,
                allowedIds: t
            }));
        }, e.byId("closeLowResPhoto").onclick = sxCloseLowResPicker, Pm.addEventListener("click", e => {
            e.target === Pm && sxCloseLowResPicker();
        }), Pm.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseLowResPicker();
        }), e.byId("closeFileDialog").onclick = sxCloseExportDialog, Gm.addEventListener("click", () => {
            sxPaintExportProgress(vf, 100, "Starting download", "Handing the finished file to your browser…", !0),
            mf ? hf && sxClickDownloadLink(hf, gf) : sxClickDownloadLink(uf, Gm.dataset.filename), yf && sxClearProfileDirty(yf);
        }), Km.addEventListener("click", () => {
            window.open("https://ninjatransfers.com", "_blank", "noopener,noreferrer"), sxClickDownloadLink(uf, Gm.dataset.filename),
            yf && sxClearProfileDirty(yf);
        }), Rm.addEventListener("click", () => {
            sxClickDownloadLink(pf, Rm.dataset.filename), yf && sxClearProfileDirty(yf);
        }), Qm && (Qm.onclick = () => sxSetPreparedZoom(1.25 * Ff)), Jm && (Jm.onclick = () => sxSetPreparedZoom(Ff / 1.25)), ef && (ef.onclick = () => sxSetPreparedZoom(1)),
        Ym.addEventListener("wheel", e => {
            Nf && (e.preventDefault(), sxSetPreparedZoom(e.deltaY < 0 ? 1.2 * Ff : Ff / 1.2));
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
                }), _f.distance > 0 && sxSetPreparedZoom(_f.zoom * n / _f.distance, !1), void e.preventDefault();
            }
            Ff > 1 && (Ym.scrollLeft -= n.x - t.x, Ym.scrollTop -= n.y - t.y, Ym.classList.add("is-dragging"),
            e.preventDefault());
        });
        const iy = e => {
            Df.delete(e.pointerId), Ym.classList.remove("is-dragging"), Df.size < 2 && (_f = null);
        };
        Ym.addEventListener("pointerup", iy), Ym.addEventListener("pointercancel", iy),
        window.addEventListener("resize", () => {
            sxClipCameraOverlays(), Nf && Om.open && sxLayoutPreparedZoom(!1), um.open && sxLayoutViewerZoom(!1), gy && gy.open && sxLayoutCropPreview();
        }), Om.addEventListener("click", e => {
            e.target === Om && sxCloseExportDialog();
        }), Om.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseExportDialog();
        });
        let ay = [], ry = 0, oy = 1, sy = null;
        const ly = new Map;
        function sxLayoutViewerZoom(t = !0) {
            if (!pm.naturalWidth || !hm.clientWidth || !hm.clientHeight) return;
            const n = hm.clientWidth, i = hm.clientHeight, a = Math.max(1, gm.scrollWidth), r = Math.max(1, gm.scrollHeight), o = (hm.scrollLeft + n / 2) / a, s = (hm.scrollTop + i / 2) / r, l = Math.min(n / pm.naturalWidth, i / pm.naturalHeight), c = Math.max(1, Math.round(pm.naturalWidth * l * oy)), d = Math.max(1, Math.round(pm.naturalHeight * l * oy)), u = Math.max(n, c), p = Math.max(i, d);
            gm.style.width = `${u}px`, gm.style.height = `${p}px`, pm.style.width = `${c}px`,
            pm.style.height = `${d}px`, hm.classList.toggle("is-zoomed", oy > 1.001), fm.value = `${Math.round(100 * oy)}%`,
            e.byId("profilePhotoZoomOut").disabled = oy <= 1, e.byId("profilePhotoZoomIn").disabled = oy >= 6,
            e.byId("profilePhotoZoomFit").disabled = oy <= 1, t && requestAnimationFrame(() => {
                hm.scrollLeft = Math.max(0, o * gm.scrollWidth - n / 2), hm.scrollTop = Math.max(0, s * gm.scrollHeight - i / 2);
            });
        }
        function sxSetViewerZoom(e, t = !0) {
            oy = Math.max(1, Math.min(6, e)), sxLayoutViewerZoom(t);
        }
        function sxShowViewerPhoto(t) {
            ay.length && (ry = (t + ay.length) % ay.length, oy = 1, sy = null, ly.clear(), hm.classList.remove("is-zoomed", "is-dragging"),
            gm.removeAttribute("style"), pm.removeAttribute("style"), mm.value = `${ry + 1} of ${ay.length}`,
            pm.alt = `Attached profile photo ${ry + 1} of ${ay.length}`, pm.onload = () => requestAnimationFrame(() => sxLayoutViewerZoom(!1)),
            pm.src = ay[ry].data, e.byId("profilePhotoPrevious").disabled = ay.length < 2, e.byId("profilePhotoNext").disabled = ay.length < 2);
        }
        function sxClosePhotoViewer() {
            sxCloseModalDialog(um), ly.clear(), sy = null, pm.onload = null, pm.removeAttribute("src"), ay = [];
        }
        e.byId("closeProfilePhoto").onclick = sxClosePhotoViewer, um.addEventListener("click", e => {
            e.target === um && sxClosePhotoViewer();
        }), um.addEventListener("cancel", e => {
            e.preventDefault(), sxClosePhotoViewer();
        }), e.byId("profilePhotoPrevious").onclick = () => sxShowViewerPhoto(ry - 1), e.byId("profilePhotoNext").onclick = () => sxShowViewerPhoto(ry + 1),
        e.byId("profilePhotoZoomIn").onclick = () => sxSetViewerZoom(1.25 * oy), e.byId("profilePhotoZoomOut").onclick = () => sxSetViewerZoom(oy / 1.25),
        e.byId("profilePhotoZoomFit").onclick = () => sxSetViewerZoom(1), hm.addEventListener("wheel", e => {
            e.preventDefault(), sxSetViewerZoom(e.deltaY < 0 ? 1.2 * oy : oy / 1.2);
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
                }), sy.distance > 0 && sxSetViewerZoom(sy.zoom * n / sy.distance, !1), void e.preventDefault();
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
        function sxLayoutCropPreview() {
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
        function sxCommitPhotoCrop() {
            if (null === xy || !Sy) return;
            const e = Object.assign({}, Sy, {
                cropReady: !0,
                manualCrop: !0 === Sy.manualCrop
            });
            Wy[xy] = e;
        }
        function sxMarkManualCrop() {
            Sy && (Cy++, Sy.cropReady = !0, Sy.manualCrop = !0);
        }
        function sxOpenPhotoCropper(e) {
            const t = Wy[e];
            if (!t) return;
            My++, Cy = 0, xy = e, Sy = Object.assign({}, t);
            const n = _g.querySelector(".dialog-body");
            Ay = n ? n.scrollTop : 0, _g.open && sxCloseModalDialog(_g), fy.onload = async () => {
                await async function(e = !1) {
                    if (!Sy || !fy.naturalWidth) return !1;
                    if (!0 === Sy.manualCrop) return !1;
                    if (!e && Sy.cropReady) return !1;
                    if (!e && (Math.abs(Sy.cropX - .5) > .001 || Math.abs(Sy.cropY - .5) > .001 || Math.abs(Sy.cropZoom - 1) > .001)) return !1;
                    const t = Sy, n = Cy, i = ++My, a = await sxDetectFaceCrop(fy, t.width, t.height);
                    return Sy === t && i === My && n === Cy && (a ? Object.assign(Sy, a, {
                        cropReady: !0,
                        manualCrop: !1
                    }) : Object.assign(Sy, {
                        cropX: .5,
                        cropY: .5,
                        cropZoom: 1,
                        cropReady: !0,
                        manualCrop: !1
                    }), sxLayoutCropPreview(), Boolean(a));
                }(), requestAnimationFrame(sxLayoutCropPreview);
            }, fy.src = t.data, sxOpenModalDialog(gy), requestAnimationFrame(sxLayoutCropPreview);
        }
        function sxClosePhotoCropper() {
            My++, sxCommitPhotoCrop(), sxCloseModalDialog(gy), $y = null, Ey = null, vy.classList.remove("is-dragging"), xy = null,
            Sy = null, fy.onload = null, fy.removeAttribute("src"), sxOpenModalDialog(_g), sxRenderPhotoThumbs(), Hy && sxRequestMapPaint({
                animate: !1
            }), requestAnimationFrame(() => {
                const e = _g.querySelector(".dialog-body");
                e && (e.scrollTop = Ay);
            });
        }
        function sxSetCropRotation(e, t = !0) {
            Sy && (sxMarkManualCrop(), Sy.cropRotation = Math.max(-180, Math.min(180, Number(e) || 0)), sxLayoutCropPreview(),
            t && sxCommitPhotoCrop());
        }
        function sxReadCropDialAngle(e) {
            const t = vy.getBoundingClientRect(), n = e.clientX - (t.left + t.width / 2), i = e.clientY - (t.top + t.height / 2);
            return 180 * Math.atan2(n, -i) / Math.PI;
        }
        e.byId("closeProfileCrop").onclick = sxClosePhotoCropper, gy.addEventListener("click", e => {
            e.target === gy && sxClosePhotoCropper();
        }), gy.addEventListener("cancel", e => {
            e.preventDefault(), sxClosePhotoCropper();
        }), yy.addEventListener("input", () => {
            Sy && (sxMarkManualCrop(), Sy.cropZoom = Number(yy.value), sxLayoutCropPreview(), sxCommitPhotoCrop());
        }), vy.addEventListener("pointerdown", e => {
            if (Sy && ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button)) {
                Ey = e.pointerId, vy.classList.add("is-dragging");
                try {
                    vy.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                sxSetCropRotation(sxReadCropDialAngle(e), !1), e.preventDefault(), e.stopPropagation();
            }
        }), vy.addEventListener("pointermove", e => {
            Ey === e.pointerId && (sxSetCropRotation(sxReadCropDialAngle(e), !1), e.preventDefault());
        });
        const Dy = e => {
            Ey === e.pointerId && (Ey = null, vy.classList.remove("is-dragging"), sxCommitPhotoCrop());
        };
        vy.addEventListener("pointerup", Dy), vy.addEventListener("pointercancel", Dy),
        vy.addEventListener("keydown", e => {
            if (!Sy || ![ "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home" ].includes(e.key)) return;
            e.preventDefault();
            const t = e.shiftKey ? 10 : 1, n = Number(Sy.cropRotation) || 0;
            sxSetCropRotation("Home" === e.key ? 0 : n + ("ArrowLeft" === e.key || "ArrowDown" === e.key ? -t : t));
        }), e.byId("resetProfileCrop").onclick = () => {
            Sy && (sxMarkManualCrop(), Object.assign(Sy, {
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropRotation: 0,
                cropReady: !0,
                manualCrop: !0
            }), sxLayoutCropPreview(), sxCommitPhotoCrop());
        }, e.byId("saveProfileCrop").onclick = () => {
            null !== xy && Sy && (sxCommitPhotoCrop(), sxClosePhotoCropper(), sm.textContent = "Crop saved.");
        }, my.addEventListener("pointerdown", e => {
            if (!Sy || ("mouse" === e.pointerType || "pen" === e.pointerType) && 0 !== e.button) return;
            sxMarkManualCrop();
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
            Sy.cropY = $y.cropY - (e.clientY - $y.startY) / $y.drawHeight, sxLayoutCropPreview(), e.preventDefault());
        });
        const Ry = e => {
            $y && $y.pointerId === e.pointerId && ($y = null, my.classList.remove("is-dragging"));
        };
        my.addEventListener("pointerup", Ry), my.addEventListener("pointercancel", Ry);
