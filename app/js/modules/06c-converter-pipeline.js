        function sxScrapeFetLifeProfile(raw) {
            try {
                const html = sxMimeHtmlText(String(raw || "")) || String(raw || "");
                if (!/<(?:html|body|main|section|article|div|h1)\b/i.test(html)) return null;
                const doc = (new DOMParser).parseFromString(html, "text/html");
                doc.querySelectorAll("script,style,noscript,svg,iframe").forEach(e => e.remove());
                const clean = s => String(s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(), out = {};
                const h1 = doc.querySelector("h1");
                if (h1) for (const span of h1.querySelectorAll("span")) {
                    const m = clean(span.textContent).match(/^(\d{2,3})([A-Za-z]{1,3})\b/);
                    if (!m) continue;
                    const age = sxNormalizeAgeText(m[1]);
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
                        const key = sxNormalizeTermText(term), slug = term.toLowerCase().replace(/\s+/g, "-");
                        [ ...selectEl.options ].forEach(opt => {
                            const label = clean(opt.textContent).replace(/\s*\([^()]*\)\s*$/, "");
                            (sxNormalizeTermText(label) === key || opt.value === slug) && !seen.has(opt.value) && (seen.add(opt.value), vals.push(opt.value));
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
            if (!sxOpenProfileDetails(target)) return;
            const sc = ut[target] || {}, filled = v => String(v || "").trim().length > 0;
            fields.gender && !sxNormalizeGenders(rt[target] || []).length && sxApplyGenderSelection(fields.gender), fields.orientation && !sxNormalizeOrientations(ot[target] || []).length && sxApplyOrientationSelection(fields.orientation), 
            fields.role && !sxNormalizeRoles(st[target] || []).length && sxApplyRoleSelection(fields.role), fields.age && !filled(lt[target]) && (Kg.value = fields.age), fields.about && !filled(nt[target]) && (im.value = fields.about), 
            fields.username && !filled(sc.fetlife) && stageContactUsername(fields.username), fields.pronouns && !filled(pz[target]) && (Pz.value = String(fields.pronouns).trim().slice(0, 60)), sxRefreshGenderPicker(), sxCloseGenderPicker(), sxCloseOrientationPicker(), sxRefreshRolePicker(), sxCloseRolePicker(), sxRefreshAboutCounts(), 
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
            sxWriteTestProgress();
        }), _k.addEventListener("click", () => sxSwitchTestOrPaste("test")), Dk.addEventListener("click", () => sxSwitchTestOrPaste("paste")), 
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
                            sxPushFlankSample(e, o.id, o.direction, t), c = String(t);
                        }
                        i.push(`#${o.number} ${o.question} → ${sxNodePath(o.id)} · ${o.direction} · ${c}`), r++;
                    }), sxMeanFlankRatings(e, {
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
                    const d = sxMatchHtmlFetish(e);
                    if (!d) return void (ha && r.push(`${cc} / “${e}” has no matching topic and was skipped.`));
                    const u = sxResolveAliasTarget(d, e, i);
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
            e.mappedLines ? (sxRenderMatchPreview(e), Ck.scrollIntoView({
                block: "nearest"
            })) : Pk.textContent = "Choose at least one answer first.";
        }), Wk.addEventListener("click", () => {
            const e = ax.map((e, t) => {
                const n = Xk[t] && Xk[t].answer;
                return n ? `${e}: ${n[0].toUpperCase() + n.slice(1)}, S` : "";
            }).filter(Boolean);
            e.length ? ($k.value = e.join("\n"), $k.dispatchEvent(new Event("input", {
                bubbles: !0
            })), sxRunConverterPreview(), Ck.scrollIntoView({
                block: "nearest"
            })) : Pk.textContent = "Choose at least one answer first.";
        }), e.all("[data-converter]").forEach(e => e.addEventListener("click", () => sxOpenResultConverter(e.dataset.converter, e.dataset.converterMode || "auto"))), 
        e.all("[data-test-choice]").forEach(t => t.addEventListener("click", () => {
            const n = Xy || Mt;
            sxCloseModalDialog(e.byId("testChooserDialog")), Xy = null, n && vt[n] && sxOpenResultConverter(t.dataset.testChoice, "test", n);
        })), e.byId("rateInListViewChoice") && e.byId("rateInListViewChoice").addEventListener("click", () => {
            const t = Xy || Mt;
            sxCloseModalDialog(e.byId("testChooserDialog")), Xy = null, t && vt[t] && (t !== Mt && sxLoadProfileMap(t), sxOpenHotList(t));
        }), e.byId("closeTestChooser") && e.byId("closeTestChooser").addEventListener("click", sxCloseTestChooser), e.byId("testChooserDialog") && e.byId("testChooserDialog").addEventListener("click", e => {
            "testChooserDialog" === e.target.id && sxCloseTestChooser();
        }), e.byId("testChooserDialog") && e.byId("testChooserDialog").addEventListener("cancel", e => {
            e.preventDefault(), sxCloseTestChooser();
        }), e.byId("closeConverter") && (e.byId("closeConverter").onclick = sxCloseResultConverter), vk.addEventListener("click", e => {
            e.target === vk && sxCloseResultConverter();
        }), vk.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseResultConverter();
        }), e.byId("loadConverterExample") && (e.byId("loadConverterExample").onclick = () => {
            Vk = null, Yk = null, $k.value = "fetlife" === Gk ? fetlifeSampleHtml : "checklist" === Gk ? ax.map((e, t) => `${e}: ${t % 6}`).join("\n") : nx[Gk] || "", 
            Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", "fetlife" === Gk && sxRunConverterPreview();
        }), Tk && (Tk.onclick = () => Fk.click()), Fk.addEventListener("change", e => {
            const t = e.target.files[0];
            if (!t) return;
            const n = new FileReader;
            n.onload = () => {
                const i = sxFetishSectionFromPage(String(n.result || ""));
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
                    sxLinesFromFetishPaste(String(e || "")).forEach(e => {
                        const i = e.replace(/\u00a0/g, " ").replace(/^[\s•·*]+|[\s•·*]+$/g, "").trim();
                        if (!i) return;
                        const l = sxNormalizeTermText(i), c = l.replace(/\s+\d+$/, "");
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
                        const g = sxNormalizeTermText(p), m = Object.keys(a).sort((e, t) => t.length - e.length).find(e => new RegExp(`(?:^|\\b)${e.replace(/ /g, "\\s+")}(?:\\b|$)`, "i").test(g));
                        if (m && (h = a[m], p = p.replace(new RegExp(`(?:^|[·—–,;|\\s])${m.replace(/ /g, "\\s+")}(?=$|[·—–,;|\\s])`, "i"), " ").replace(/^[\s,;|·—–]+|[\s,;|·—–]+$/g, "").trim()), 
                        !h) return;
                        const f = Object.keys(r).find(e => new RegExp(`(?:^|\\b)${e.replace(/ /g, "\\s+")}(?:\\b|$)`, "i").test(sxNormalizeTermText(p))), y = p || (f ? r[f] : s), b = y ? `${u} — ${y}` : u, v = sxNormalizeTermText(b);
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
        }), (e.byId("previewConverter") || {}).onclick = sxRunConverterPreview, Lk && (Lk.onclick = function() {
            if (Kk && !Lk.disabled) {
                const sxIds = Object.keys(wt).filter(e => Boolean(vt[e]) && !(ft[e] && "group" === ft[e].kind));
                if (!sxIds.length) return void (Pk.textContent = Object.keys(wt).some(e => Boolean(vt[e])) ? "Only pair/group profiles are open, and test results can't be loaded directly into a pair. Open one of the pair's own profiles first." : "No profile exists to load these results into.");
                // No second dialogue on a pressed-tab Load
                // (split-center stage, 2026-10-27): when this
                // converter session was opened from a profile tab's
                // Load menu, its origin is already the target - load
                // straight into it instead of asking again. Sessions
                // with no pressed-tab origin keep the chooser below.
                // Caller-tab re-import (owner ruling 2026-10-30): a
                // pair/group origin is NOT a direct target - the merge
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
                    sxCloseModalDialog(sxDlg), sxDlg.remove();
                }, sxTitle = document.createElement("h3");
                sxTitle.textContent = "Load into which profile?", sxDlg.appendChild(sxTitle), Object.keys(wt).some(e => vt[e] && ft[e] && "group" === ft[e].kind) && (() => {
                    const sxNote = document.createElement("p");
                    sxNote.textContent = "Pair/group profiles are not listed: test results can't be loaded directly into a pair, because a pair's numbers are computed from its source profiles. Pick one of the pair's own profiles instead.", sxDlg.appendChild(sxNote);
                })();
                sxIds.forEach(sxId => {
                    const sxBtn = document.createElement("button");
                    // Neutral chooser (firm spec, reaffirmed
                    // 2026-10-27 08:49): every profile is listed by
                    // plain name only - no on-screen marking,
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
                }), document.body.appendChild(sxDlg), sxOpenModalDialog(sxDlg);
            }
        }), $k.addEventListener("input", () => {
            sxFlFields = null, Vk = null, Yk = null, Ck.hidden = !0, Lk.disabled = !0, Kk = null, Pk.textContent = "";
        }), e.byId("closeImportedContact") && (e.byId("closeImportedContact").onclick = sxCloseContactDialog), e.byId("doneImportedContact") && (e.byId("doneImportedContact").onclick = sxCloseContactDialog), 
        Lg.addEventListener("click", e => {
            e.target === Lg && sxCloseContactDialog();
        }), Lg.addEventListener("cancel", e => {
            e.preventDefault(), sxCloseContactDialog();
        }), Fg.addEventListener("click", () => {
            Ng.textContent = "Your device will open or download the contact card.";
        });
        const Nx = e.byId("fileInput"), _x = e.byId("qrImageInput"), Dx = e.byId("qrCameraPanel"), Rx = e.byId("qrCameraVideo");
        let Ox = null, Bx = 0;
        function sxFilterQrLuma(e, t, n = 128) {
            const i = new Uint8ClampedArray(e.length);
            for (let a = 0; a < e.length; a += 4) {
                const r = .299 * e[a] + .587 * e[a + 1] + .114 * e[a + 2];
                let o;
                o = "contrast" === t ? Math.max(0, Math.min(255, 1.55 * (r - 128) + 128)) : r < n ? 0 : 255, 
                i[a] = i[a + 1] = i[a + 2] = o, i[a + 3] = 255;
            }
            return i;
        }
        function sxYieldToNextFrame() {
            return new Promise(e => requestAnimationFrame(() => t.setTimeout(e, 0)));
        }
        async function sxDecodeCanvasQr(e, t, n = 1 / 0) {
            const i = e.getImageData(0, 0, t.width, t.height), a = {
                inversionAttempts: "dontInvert"
            };
            await sxYieldToNextFrame();
            let r = jsQR(i.data, i.width, i.height, a);
            if (r && r.data) return r.data;
            if (performance.now() > n) return null;
            const o = sxFilterQrLuma(i.data, "contrast");
            if (await sxYieldToNextFrame(), r = jsQR(o, i.width, i.height, a), r && r.data) return r.data;
            if (performance.now() > n) return null;
            const s = sxFilterQrLuma(o, "threshold", function(e) {
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
            return await sxYieldToNextFrame(), r = jsQR(s, i.width, i.height, {
                inversionAttempts: "attemptBoth"
            }), r && r.data || null;
        }
        function sxParseScp4Chunk(e) {
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
        async function sxScanProfileQrImage(e, t = !1) {
            if ("function" != typeof window.jsQR && (window.__loadQrScanner && await window.__loadQrScanner(), 
            "function" != typeof window.jsQR)) throw new Error("The QR reader did not load.");
            const n = e instanceof HTMLVideoElement, i = n ? e : "function" == typeof createImageBitmap && e instanceof Blob ? await createImageBitmap(e) : await sxLoadImageSrc(await sxBlobToDataUrl(e)), a = n ? e.videoWidth : i.naturalWidth || i.width, r = n ? e.videoHeight : i.naturalHeight || i.height, o = [], s = new Set, l = performance.now() + (n ? 900 : 8500), c = e => !(!e || s.has(e) || (s.add(e), 
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
                const n = sxParseScp4Chunk(e);
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
                    const x = await sxDecodeCanvasQr(g, h, l);
                    if (x && (c(x), p(x), !t)) return x;
                    await sxYieldToNextFrame();
                }
            } finally {
                h.width = 1, h.height = 1, n || "function" != typeof i.close || i.close();
            }
            return t ? o : o[0] || null;
        }
        e.byId("chooseFile") && (e.byId("chooseFile").onclick = () => Nx.click()), e.byId("chooseQrImage") && (e.byId("chooseQrImage").onclick = () => _x.click());
        const Gx = new Map;
        async function sxImportNumberedQr(e, t = "") {
            const n = sxParseScp4Chunk(e);
            let i = String(e || ""), a = "";
            if (n) {
                let e = Gx.get(n.bundleId);
                if (e && e.total === n.total || (e = {
                    total: n.total,
                    parts: new Map
                }, Gx.set(n.bundleId, e)), e.parts.set(n.index, n.data), e.parts.size < e.total) return sxSetImportStatus(`Captured profile QR ${n.index}/${e.total} · ${e.parts.size} of ${e.total} collected. Scan the remaining numbered codes in any order.`, "busy"), 
                null;
                if (i = Array.from({
                    length: e.total
                }, (t, n) => e.parts.get(n + 1) || "").join(""), !i || sxChecksumCrc32((new TextEncoder).encode(i)).toString(36).toUpperCase() !== n.bundleId) throw Gx.delete(n.bundleId), 
                new Error("The numbered profile QR set is incomplete or damaged.");
                Gx.delete(n.bundleId), a = `Recovered all ${e.total} numbered profile QR codes.`;
            }
            const r = sxMergeAsShared(await yx.parse("qr", i)), o = a || t || `Imported ${wt[r]} from profile-data QR.`;
            return Sg.open && sxCloseModalDialog(Sg), sxSetImportStatus(o, "success"), (t || a) && sxShowStatusToast(o), r;
        }
        async function sxHaltQrCamera() {
            Bx && cancelAnimationFrame(Bx), Bx = 0, Ox && (Ox.getTracks().forEach(e => e.stop()), 
            Ox = null), Rx.srcObject = null, Dx.hidden = !0;
        }
        async function sxWatchQrCamera() {
            if (Ox) {
                try {
                    const e = await sxScanProfileQrImage(Rx);
                    if (e && await sxImportNumberedQr(e)) return void await sxHaltQrCamera();
                } catch (e) {
                    sxSetImportStatus(`QR import failed: ${e.message || "That QR code could not be read."}`, "error", !0);
                }
                Bx = requestAnimationFrame(sxWatchQrCamera);
            }
        }
        async function sxOpenQrCamera() {
            sxSendEvent("scan_started");
            try {
                await sxHaltQrCamera(), Ox = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },
                    audio: !1
                }), Rx.srcObject = Ox, Dx.hidden = !1, await Rx.play(), sxSetImportStatus("Point the camera at a profile-data QR. For a numbered set, scan every code in any order.", "busy"), 
                sxWatchQrCamera();
            } catch (e) {
                sxSetImportStatus("Camera scanning is unavailable or permission was not granted.", "error", !0);
            }
        }
        e.byId("startQrCamera") && (e.byId("startQrCamera").onclick = sxOpenQrCamera), e.byId("stopQrCamera") && (e.byId("stopQrCamera").onclick = sxHaltQrCamera);
        let Xx, Zx = 0;
        async function sxImportEmbeddedQr(e, t, n) {
            if (n !== Zx) throw new Error("Import cancelled.");
            sxSetImportStatus("No embedded profile data found. Looking for a profile QR…", "busy"), await sxYieldToNextFrame();
            const i = await sxScanProfileQrImage(e, !0);
            if (n !== Zx) throw new Error("Import cancelled.");
            const a = i.filter(e => sxParseScp4Chunk(e) || String(e || "").startsWith("SCP3:") || String(e || "").startsWith("SCP2J:"));
            if (!a.length) throw t;
            let r = null, o = null;
            for (const e of a) {
                o = sxParseScp4Chunk(e) || o;
                const t = await sxImportNumberedQr(e, "metadata has been stripped, data has been recovered from QR code.");
                t && (r = t), await sxYieldToNextFrame();
            }
            if (r) return r;
            if (o) {
                const e = Gx.get(o.bundleId), t = e ? e.parts.size : 0;
                throw new Error(`Found ${t} of ${o.total} numbered profile QR codes. Try the original image or scan the missing codes with the camera.`);
            }
            throw t;
        }
        function sxImportProfileFile(t, onDone) {
            if (!t) return;
            const n = ++Zx;
            sxSetImportStatus(`Reading ${t.name}…`, "busy");
            const i = new FileReader;
            i.onload = async () => {
                if (n !== Zx) return;
                const a = new Uint8Array(i.result), r = 137 === a[0] && 80 === a[1] && 78 === a[2] && 71 === a[3], o = "application/pdf" === t.type || /\.pdf$/i.test(t.name) || 37 === a[0] && 80 === a[1] && 68 === a[2] && 70 === a[3], s = "application/json" === t.type || /\.(?:json|hypermap)$/i.test(t.name), l = "image/svg+xml" === t.type || /\.svg$/i.test(t.name), c = /\.svgz$/i.test(t.name) || 31 === a[0] && 139 === a[1], d = String(t.type || "").startsWith("image/") || r;
                let u = "read";
                try {
                    if (await sxYieldToNextFrame(), n !== Zx) return;
                    if (s) u = "json", sxMergeAsShared(yx.parse("json", (new TextDecoder).decode(a))); else if (o) u = "pdf", 
                    sxMergeAsShared(yx.parse("pdf", a)); else if (l || c) {
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
                            u = "profile", sxMergeAsShared(e);
                        } else {
                            if (c) throw new Error("This SVGZ does not contain embedded Sexcapades profile data.");
                            u = "qr", await sxImportEmbeddedQr(t, new Error("This SVG does not contain embedded Sexcapades profile data."), n);
                        }
                    } else {
                        if (!d) throw new Error("Choose a .hypermap file, or a current Sexcapades SVG, SVGZ, PNG, PDF, sync card or profile-QR image, or profile JSON file.");
                        if (r) {
                            let e = null;
                            try {
                                e = await yx.parse("png", a);
                            } catch (e) {
                                u = "qr", await sxImportEmbeddedQr(t, e, n);
                            }
                            if (e) {
                                u = "profile";
                                const t = sxMergeAsShared(e.payload);
                                e.vcard && sxApplyImportedVcard(e.vcard, t);
                            }
                        } else u = "qr", await sxImportEmbeddedQr(t, new Error("This image does not contain a readable Sexcapades profile-data QR code."), n);
                    }
                } catch (e) {
                    n === Zx && sxShowImportFailure(e, t, u);
                }
                "function" == typeof onDone && onDone();
            }, i.onerror = () => {
                n === Zx && sxShowImportFailure(new Error("The file could not be read."), t, "read"), "function" == typeof onDone && onDone();
            }, i.readAsArrayBuffer(t);
        }
        function sxImportSelectedFile(e) {
            const t = e.target.files[0];
            t && sxImportProfileFile(t, () => {
                e.target.value = "";
            });
        }
        let sxLaunchQueueInstalled = !1;
        function sxWaitForActiveSkinReady(maxWaitMs = 4000) {
            return new Promise(resolve => {
                if (window.__SX_ACTIVE_SKIN) return void resolve();
                const started = Date.now(), timer = setInterval(() => {
                    if (window.__SX_ACTIVE_SKIN || Date.now() - started >= maxWaitMs) {
                        clearInterval(timer), resolve();
                    }
                }, 60);
            });
        }
        async function sxImportHypermapText(name, text) {
            await sxWaitForActiveSkinReady();
            try {
                const parsed = yx.parse("json", String(text || ""));
                const importedId = sxMergeAsShared(parsed);
                const label = importedId && sxProfileNames[importedId] ? sxProfileNames[importedId] : (name || "profile");
                sxShowStatusToast(`Imported ${label} from ${name || ".hypermap"}`);
            } catch (err) {
                const msg = yx.errorMessage(err, "The .hypermap file could not be imported.");
                sxShowStatusToast(`Import failed (${name || ".hypermap"}): ${msg}`, {
                    tone: "error",
                    persistent: !0
                });
            }
        }
        function sxInstallHypermapLaunchConsumer() {
            if (sxLaunchQueueInstalled) return;
            sxLaunchQueueInstalled = !0;
            try {
                const stashed = window.sessionStorage && window.sessionStorage.getItem("sx_launch_hypermap_files");
                if (stashed) {
                    window.sessionStorage.removeItem("sx_launch_hypermap_files");
                    const items = JSON.parse(stashed);
                    Array.isArray(items) && items.forEach(item => {
                        item && "string" == typeof item.text && sxImportHypermapText(item.name || "profile.hypermap", item.text);
                    });
                }
            } catch (err) {
                __sxErrLog("launch-queue-stash", err);
            }
            if ("launchQueue" in window && window.launchQueue && "function" == typeof window.launchQueue.setConsumer) {
                window.launchQueue.setConsumer(async launchParams => {
                    if (!launchParams || !Array.isArray(launchParams.files) || !launchParams.files.length) return;
                    for (const handle of launchParams.files) {
                        try {
                            const file = await handle.getFile();
                            if (!file) continue;
                            if (/\.(?:hypermap|json)$/i.test(file.name) || "application/json" === file.type) {
                                const text = await file.text();
                                await sxImportHypermapText(file.name, text);
                            } else {
                                sxImportProfileFile(file);
                            }
                        } catch (err) {
                            __sxErrLog("launch-queue-file", err);
                            sxShowStatusToast(`Could not open ${handle && handle.name ? handle.name : ".hypermap file"}.`, {
                                tone: "error",
                                persistent: !0
                            });
                        }
                    }
                });
            }
        }
        function sxClearStatusToast() {
            const n = e.byId("toast"), i = e.byId("toastMessage");
            t.clear(Xx), n.classList.remove("show", "is-persistent"), n.removeAttribute("data-tone"), 
            n.setAttribute("role", "status"), i.textContent = "";
        }
        function sxShowStatusToast(n, i = {}) {
            const a = e.byId("toast"), r = e.byId("toastMessage"), o = !0 === i.persistent || "error" === i.tone;
            r.textContent = n, a.classList.toggle("is-persistent", o), i.tone ? a.dataset.tone = i.tone : a.removeAttribute("data-tone"), 
            a.setAttribute("role", "error" === i.tone ? "alert" : "status"), a.classList.add("show"), 
            t.clear(Xx), o || (Xx = t.setTimeout(() => a.classList.remove("show"), 1800));
        }
        Nx.addEventListener("change", sxImportSelectedFile), _x.addEventListener("change", sxImportSelectedFile), Sg.addEventListener("close", () => {
            Zx++, sxHaltQrCamera(), sxPairLoadInto = null, sxLoadOriginId = null;
        }), e.byId("toastDismiss") && e.byId("toastDismiss").addEventListener("click", sxClearStatusToast);
