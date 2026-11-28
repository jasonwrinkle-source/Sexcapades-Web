// 06d3-profile-about.js - Profile about view, archetype projection, local samples, and details opener/saver
        function sxRenderTimingSummary(t) {
            const i = e.byId("profileTimingSummary"), a = e.byId("profileTimingList"), r = sxNormalizeTimers(mt[t]), o = Object.keys(kt).filter(e => r[e]).map(e => {
                const t = r[e], n = t.total ? ` · ${t.count}/${t.total}` : "";
                return `<li><strong>${sxEscapeHtmlText(kt[e])}</strong> · ${sxClockText(t.durationSeconds)} total${n} · saved ${sxEscapeHtmlText(function(e) {
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
        function sxResetCelebrationState(e) {
            e || sxDismissCompletion(), Ag.dataset.submitted = "false";
        }
        async function sxSendConsentedSurvey(e = "save", t = Go) {
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
            const i = sxOutlineRatedCounts(n);
            if (i.rated) try {
                await sxPostCollect({
                    action: "survey",
                    uuid: sxAnonUuid(),
                    ratings: sxSurveyShareToken(n),
                    app_version: "3.5",
                    app_build: document.querySelector('meta[name="sexcapades-build"]')?.getAttribute("content") || "",
                    topic_count: i.rated
                });
            } catch (e) {
                xg.textContent = "Profile saved, but the anonymous ratings could not be shared.";
            }
        }
        let gw = "edit";
        function sxSetProfileDialogMode(t) {
            const archEl = e.byId("profileArchetypeResults");
            archEl && (archEl.innerHTML = "");
            gw = "about" === t ? "about" : "edit", Dg.dataset.profileMode = gw, _g.dataset.profileMode = gw,
            Rg.hidden = "about" !== gw, "about" === gw && Hy ? (function(t) {
                const i = String(nt[t] || "").trim(), a = String(it[t] || "").trim(), r = sxClonePhotoRecords(dt[t])[0], o = sxGlanceBucketsFor(t), s = o.green.length + o.yellow.length + o.red.length, l = sxNormalizeContactRecord(ut[t]), c = sxListContactLinks(l), sxAboutYear = (typeof window !== "undefined" && "function" === typeof window.__SX_SAMPLE_YEAR_BADGE) ? window.__SX_SAMPLE_YEAR_BADGE(t) : "";
                l.phone && c.unshift({
                    label: "Phone",
                    user: l.phone,
                    href: `tel:${l.phone.replace(/[^\d+*#,;]/g, "")}`
                }), l.email && c.unshift({
                    label: "Email",
                    user: l.email,
                    href: `mailto:${l.email}`
                }), Og.hidden = !r, n(Og, r ? `<span class="sx-emblem-wrap"><img src="${sxEscapeHtmlText(r.data)}" alt="${sxEscapeHtmlText(wt[t] || "Profile")} profile photo">` + (sxAboutYear ? `<span class="sx-emblem-year-badge" aria-hidden="true">${sxEscapeHtmlText(sxAboutYear)}</span>` : "") + `</span><svg class="profile-glance-rings" viewBox="0 0 120 120" role="img" aria-label="At a glance: ${o.percentages.green}% green, ${o.percentages.yellow}% yellow, ${o.percentages.red}% red"><title>${o.percentages.green}% green · ${o.percentages.yellow}% yellow · ${o.percentages.red}% red</title><circle class="ring-track" cx="60" cy="60" r="56"/><circle class="ring-green" cx="60" cy="60" r="56" pathLength="100" stroke-dasharray="${o.percentages.green} 100"/><circle class="ring-yellow" cx="60" cy="60" r="50" pathLength="100" stroke-dasharray="${o.percentages.yellow} 100"/><circle class="ring-red" cx="60" cy="60" r="44" pathLength="100" stroke-dasharray="${o.percentages.red} 100"/></svg>` : ""),
                Bg.textContent = sxIdentityPlacardText(t), n(jg, `<span class="profile-dialog-rating-total">${s} rated topic${1 === s ? "" : "s"}</span>`);
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
            if ("about" === gw && Hy) sxSyncLocalSampleBtn();
        }
        // Profile-to-archetype projection (2026-11-17): match the profile
        // open in this dialog against every archetype in the current skin,
        // through the real pair engine (the same Play Match Score the
        // Krossmatch tabs show), ranked best-first. Adam/Eve are samples,
        // not archetypes, so they are left out; stacked entries (a
        // platform's or creed's dated layers) DO compete, one top layer
        // per stack, with the best historical layer reported separately
        // (2026-11-22 scoping, below). A partly-rated profile
        // still projects - the score rests on the topics both sides rated,
        // and the note under the list says how many that was.
        function sxArchetypeProjection() {
            const resultsEl = e.byId("profileArchetypeResults");
            if (!resultsEl) return;
            const engine = window.__SEXCAPADES_SYNC_ENGINE;
            const samples = window.SEXCAPADES_SAMPLE_PROFILES;
            if (!engine || !engine.pair || !engine.profileById) {
                resultsEl.innerHTML = `<p class="profile-archetype-note">The match engine is not available right now — try again after the map finishes loading.</p>`;
                return;
            }
            if (!Hy || !vt[Hy]) {
                resultsEl.innerHTML = `<p class="profile-archetype-note">Open a profile first.</p>`;
                return;
            }
            const user = engine.profileById(Hy);
            const userRated = Object.keys(user.ratings || {}).length;
            if (!userRated) {
                resultsEl.innerHTML = `<p class="profile-archetype-note">Rate some topics first — the projection needs your ratings to find your closest archetype.</p>`;
                return;
            }
            if (!samples || typeof samples !== "object") {
                resultsEl.innerHTML = `<p class="profile-archetype-note">This map has no archetypes to compare against.</p>`;
                return;
            }
            // Score one candidate entry against the open profile with
            // the identity measure below; null when it cannot be
            // scored (no pair, no shared topics, no comparable flank).
            const scoreEntry = (key, entry) => {
                if (!entry || !entry.payload || !entry.payload.ratings) return null;
                const arch = {
                    id: "archetype:" + key,
                    name: entry.name || key,
                    ratings: entry.payload.ratings,
                    annotations: {},
                    fantasyOnly: {},
                    alreadyTried: {},
                    importedChildren: {},
                    genders: [],
                    orientations: []
                };
                let pair = null;
                try { pair = engine.pair(user, arch, {}); } catch (err) { pair = null; }
                if (!pair || !pair.play || !pair.coverage) return null;
                const shared = pair.coverage.shared || 0;
                if (!shared) return null;
                // Identity score - "which archetype am I?": same-flank
                // similarity over the shared set (both rated, not
                // limit-blocked, not fantasy). The old score was the
                // pair engine's Play match score, which measures
                // whether both sides rated the crossed flanks at all,
                // not agreement - so every archetype scored 100.
                // Multi-pole topics use their agreement fraction
                // (already a same-position comparison); two-pole
                // topics compare each flank with itself (give with
                // give, receive with receive), skipping a flank
                // either side left unrated.
                // Per-topic similarity preference (2026-11-27, merged
                // c89f700 + 63d5926): rec.poleAgreement first — the
                // pair engine's positional same-position agreement
                // (sxPoleAgreement: 1 - mean|diff|/200 over the union
                // of pole keys, or the line fraction), which is 1 for
                // identical vectors and keeps stance projections from
                // scoring 0%. If the pair engine did not set it (older
                // bundle), a role topic's rec.agreement is the coverage
                // straight (diagonal of the joint engagement, sum of
                // squared holdings / 10000), NOT a same-position
                // agreement — a spread vector scores < 1 against
                // itself (a 55/50/45 blend scores 0.755; a single pole
                // at 85 scores 0.7225), so an archetype projected onto
                // itself read ~70% in Fores (56% in Sex). For those
                // role topics the branch below computes the true
                // same-position agreement from the pole vectors
                // instead (the same sxPoleAgreement formula), which
                // is 1 for identical vectors. Then rec.agreement,
                // then give/receive diffs, then the receptivity
                // placement similarity.
                const identityAgreements = [];
                const topicSims = [];
                const pushSim = (rec, sim) => {
                    identityAgreements.push(sim);
                    if (rec && rec.label) topicSims.push({ label: rec.label, sim: sim });
                };
                const placementSim = (pa, pb) => {
                    if (!pa || !pb) return null;
                    if (pa.lineKnown && pb.lineKnown) return 1 - Math.abs(pa.line - pb.line) / 200;
                    if (pa.poles && pb.poles) {
                        const pKeys = [...new Set([...Object.keys(pa.poles), ...Object.keys(pb.poles)])];
                        if (!pKeys.length) return null;
                        let sum = 0;
                        pKeys.forEach(k => {
                            const va = k in pa.poles ? pa.poles[k] : 0;
                            const vb = k in pb.poles ? pb.poles[k] : 0;
                            sum += Math.abs(va - vb);
                        });
                        return 1 - (sum / pKeys.length) / 200;
                    }
                    return null;
                };
                (pair.topics || []).forEach(rec => {
                    if (!rec || !rec.ratings || !rec.ratings.a || !rec.ratings.b) return;
                    if ((rec.limiters || []).length) return;
                    if (((rec.flags || {}).fantasyBy || []).length) return;
                    const ra = rec.ratings.a, rb = rec.ratings.b;
                    const aAny = ra.giveKnown || ra.receiveKnown || ra.polesKnown || ra.lineKnown || ra.advocacyKnown || ra.receptivityKnown;
                    const bAny = rb.giveKnown || rb.receiveKnown || rb.polesKnown || rb.lineKnown || rb.advocacyKnown || rb.receptivityKnown;
                    if (!aAny || !bAny) return;
                    if (null != rec.poleAgreement) { pushSim(rec, rec.poleAgreement); return; }
                    // ROLE TOPICS (2026-11-27, 63d5926, fallback): when
                    // the pair engine did not set poleAgreement (older
                    // bundle), a role topic's rec.agreement is the
                    // coverage straight, NOT a same-position agreement,
                    // so compute it from the pole vectors (the
                    // sxPoleAgreement formula: 1 - mean|diff|/200 over
                    // the union of pole keys), which is 1 for identical
                    // vectors. This is the same value poleAgreement
                    // carries when the new pair engine set it
                    // (rec.polesA/rec.polesB ARE a.poles/b.poles), so
                    // it only fires when poleAgreement is absent.
                    if (rec.poleRole && rec.polesA && rec.polesB) {
                        const pKeys = [...new Set([...Object.keys(rec.polesA), ...Object.keys(rec.polesB)])];
                        if (pKeys.length) {
                            let pSum = 0;
                            pKeys.forEach(k => { pSum += Math.abs((Number(rec.polesA[k]) || 0) - (Number(rec.polesB[k]) || 0)); });
                            pushSim(rec, 1 - (pSum / pKeys.length) / 200);
                            return;
                        }
                    }
                    if (null != rec.agreement) { pushSim(rec, rec.agreement); return; }
                    const diffs = [];
                    if (ra.giveKnown && rb.giveKnown) diffs.push(Math.abs(ra.give - rb.give));
                    if (ra.receiveKnown && rb.receiveKnown) diffs.push(Math.abs(ra.receive - rb.receive));
                    if (diffs.length) {
                        pushSim(rec, 1 - diffs.reduce((s, v) => s + v, 0) / (200 * diffs.length));
                        return;
                    }
                    const recSim = placementSim(rec.receptivityA, rec.receptivityB);
                    if (null != recSim) pushSim(rec, recSim);
                });
                if (!identityAgreements.length) return null;
                const identityScore = Math.round(100 * identityAgreements.reduce((s, v) => s + v, 0) / identityAgreements.length);
                topicSims.sort((a, b) => b.sim - a.sim || a.label.localeCompare(b.label));
                const strongSims = topicSims.filter(x => x.sim >= 0.5);
                const drivers = (strongSims.length ? strongSims : topicSims).slice(0, 3).map(x => x.label);
                return { key: key, name: entry.name || key, about: entry.about || "", score: identityScore, shared: shared, drivers: drivers };
            };
            // Palimpsest scoping (2026-11-22, Jason's ruling): entries
            // carrying stack fields are dated layers of ONE identity
            // (a party's platforms, a creed's documents), so a stack
            // must not flood the ranking with every era of itself.
            // Only each stack's TOP layer competes for the headline -
            // the "present" layer where the stack has one, else its
            // newest dated layer. Admission keys on stack membership,
            // not kind (2026-11-22: stacked entries are archetypes -
            // platforms, creeds - and join the pool by carrying stack
            // fields), while unstacked samples (Adam/Eve - real
            // profiles, not identities to project onto) stay out,
            // exactly as before. The best of the remaining layers is computed
            // separately and reported as the closest layer across
            // time; historical layers never enter the headline list.
            const stackGroups = {}, stackOrder = [], headlineKeys = [], histKeys = [];
            Object.keys(samples).forEach(key => {
                const entry = samples[key];
                if (!entry || !entry.payload || !entry.payload.ratings) return;
                const sk = entry.stackKey || entry.stack;
                if (sk) {
                    if (!stackGroups[sk]) { stackGroups[sk] = []; stackOrder.push(sk); }
                    stackGroups[sk].push(key);
                } else if (entry.kind !== "sample") headlineKeys.push(key);
            });
            const layerValue = entry => {
                const d = entry && entry.date != null ? String(entry.date).trim() : "";
                if (d.toLowerCase() === "present") return Infinity;
                const n = parseFloat(d);
                return isNaN(n) ? -Infinity : n;
            };
            let hasMultiLayerStack = false;
            stackOrder.forEach(sk => {
                const keys = stackGroups[sk];
                if (keys.length > 1) hasMultiLayerStack = true;
                let topKey = keys[0];
                keys.forEach(k => { if (layerValue(samples[k]) > layerValue(samples[topKey])) topKey = k; });
                headlineKeys.push(topKey);
                keys.forEach(k => { if (k !== topKey) histKeys.push(k); });
            });
            const scored = [];
            headlineKeys.forEach(key => {
                const s = scoreEntry(key, samples[key]);
                if (s) scored.push(s);
            });
            const histScored = [];
            if (hasMultiLayerStack) histKeys.forEach(key => {
                const s = scoreEntry(key, samples[key]);
                if (s) histScored.push(s);
            });
            if (!scored.length) {
                resultsEl.innerHTML = `<p class="profile-archetype-note">No shared topics yet — rate a few of the topics these archetypes cover and try again.</p>`;
                return;
            }
            scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
            const top = scored.slice(0, 5);
            const rows = top.map((s, i) => {
                const drivers = s.drivers.length ? `<p class="profile-archetype-drivers">Closest on: ${s.drivers.map(sxEscapeHtmlText).join(", ")}</p>` : "";
                // The definition is a hover tip on the row (shared
                // data-ui-tooltip popup), not inline text - it
                // cluttered the list. data-tooltip-tap-first lets
                // touch users tap once to read it; tabindex lets
                // keyboard users focus the row and read it the same way.
                const tip = s.about ? ` data-ui-tooltip="${sxEscapeHtmlText(s.about)}" data-tooltip-name="${sxEscapeHtmlText(s.name)}" data-tooltip-tap-first tabindex="0"` : "";
                return `<div class="profile-archetype-row"${tip}><div class="profile-archetype-row-top"><span class="profile-archetype-name">${i + 1}. ${sxEscapeHtmlText(s.name)}</span><span class="profile-archetype-score">${s.score}%</span></div>${drivers}</div>`;
            }).join("");
            const best = top[0];
            let html = rows + `<p class="profile-archetype-note">Compared against ${scored.length} archetype${1 === scored.length ? "" : "s"} · your closest archetype is ${sxEscapeHtmlText(best.name)} at ${best.score}% on ${best.shared} shared topic${1 === best.shared ? "" : "s"} · you rated ${userRated} topic${1 === userRated ? "" : "s"}.</p>`;
            // Secondary readout: the best-matching historical layer
            // across every stack in the pool - which era of which
            // identity sits closest, even though only top layers
            // competed for the headline above.
            if (histScored.length) {
                histScored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
                const hb = histScored[0];
                html += `<p class="profile-archetype-note">Closest layer across time: ${sxEscapeHtmlText(hb.name)} at ${hb.score}% on ${hb.shared} shared topic${1 === hb.shared ? "" : "s"}.</p>`;
            }
            resultsEl.innerHTML = html;
        }

        // Local samples (2026-11-18, Jason): "Add current profile as a
        // local sample" on the profile About view saves the open profile
        // on this device so it appears in the Samples menu and loads back
        // later - a chapter roster. The profile is serialized with the
        // same full-profile serializer the export path uses, then the
        // skin loader stores it per-skin (its store + menu rebuild) and
        // the button flips to "Update local sample" while a sample with
        // this name exists on this skin. Photos are stripped before
        // saving: they travel as data URLs and would eat the ~5MB
        // localStorage quota for a roster; the menu shows the name, which
        // is what makes a sample recognizable. noFlash is set so the
        // sample loader's validity check (name + count + noFlash) passes
        // exactly like a built-in sample. A profile with no ratings
        // cannot be a sample - there is nothing to load back.
        function sxLocalSampleSkin() { return window.__SX_ACTIVE_SKIN || "sexcapades"; }
        function sxLocalSampleBtn() { return e.byId("addLocalSampleBtn"); }
        function sxLocalSampleExists(name) {
            try {
                var api = window.__SX_LOCAL_SAMPLES;
                if (!api || typeof api.list !== "function") return false;
                var list = api.list(sxLocalSampleSkin()) || {};
                var want = String(name || "").trim().toLowerCase();
                return Object.keys(list).some(function (k) { return String((list[k] || {}).name || "").trim().toLowerCase() === want; });
            } catch (err) { return false; }
        }
        function sxSyncLocalSampleBtn() {
            var btn = sxLocalSampleBtn();
            if (!btn) return;
            if (!Hy || !vt[Hy]) { btn.hidden = true; return; }
            btn.hidden = false;
            var rated = Object.keys(vt[Hy] || {}).length;
            btn.disabled = rated < 1;
            btn.textContent = sxLocalSampleExists(wt[Hy]) ? "Update local sample" : "Add as local sample";
        }
        // Menu-description dialog (2026-11-22, Jason): saving a local
        // sample asks for an optional blurb - the hover tip in the
        // Samples menu, and the description a roster pack carries for
        // this member. Prefilled from the existing entry on update.
        function sxLocalSampleAboutDialog(name, existingAbout, onDone) {
            var dlg = e.byId("sxLocalSampleAboutDlg");
            if (!dlg) {
                // A native <dialog> shown modally: the profile details
                // dialog is itself a modal <dialog> (top layer), so a
                // plain overlay div would render under its hit-testing
                // and its buttons could never be clicked.
                dlg = document.createElement("dialog");
                dlg.id = "sxLocalSampleAboutDlg";
                dlg.style.cssText = "border:none;background:transparent;padding:0;max-width:92vw;";
                var st = document.createElement("style");
                st.textContent = "#sxLocalSampleAboutDlg::backdrop{background:rgba(8,10,12,.55);}";
                document.head.appendChild(st);
                dlg.innerHTML = '<div style="background:#171b1f;color:#f2f4f6;border:1px solid #3a4550;border-radius:12px;padding:18px;width:440px;max-width:92vw;box-sizing:border-box;box-shadow:0 12px 40px rgba(0,0,0,.5);font:14px/1.45 system-ui,sans-serif;">'
                    + '<div id="sxLsDlgTitle" style="font-weight:600;font-size:16px;margin-bottom:8px;"></div>'
                    + '<label for="sxLsDlgText" style="display:block;margin-bottom:6px;">Menu description <span style="opacity:.65">(optional)</span></label>'
                    + '<textarea id="sxLsDlgText" rows="3" maxlength="300" placeholder="One or two sentences — this is the hover tip in the Samples menu, and the blurb your roster carries." style="width:100%;box-sizing:border-box;background:#0f1214;color:#f2f4f6;border:1px solid #3a4550;border-radius:8px;padding:8px;font:inherit;resize:vertical;"></textarea>'
                    + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">'
                    + '<button type="button" id="sxLsDlgCancel" style="padding:8px 14px;border-radius:8px;border:1px solid #3a4550;background:transparent;color:inherit;font:inherit;cursor:pointer;">Cancel</button>'
                    + '<button type="button" id="sxLsDlgSave" style="padding:8px 14px;border-radius:8px;border:1px solid #3a4550;background:#2b6cb0;color:#fff;font:inherit;cursor:pointer;">Save sample</button>'
                    + '</div></div>';
                document.body.appendChild(dlg);
                dlg.addEventListener("click", function (ev) { if (ev.target === dlg) dlg.close(); });
            }
            e.byId("sxLsDlgTitle").textContent = "Local sample — " + name;
            var ta = e.byId("sxLsDlgText");
            ta.value = existingAbout || "";
            if (!dlg.open) dlg.showModal();
            e.byId("sxLsDlgSave").onclick = function () {
                var text = String(ta.value || "").trim();
                dlg.close();
                onDone(text);
            };
            e.byId("sxLsDlgCancel").onclick = function () { dlg.close(); };
            ta.focus();
        }
        function sxSaveLocalSample() {
            if (!Hy || !vt[Hy]) return;
            var name = String(wt[Hy] || "").trim() || "Profile";
            var payload;
            try {
                payload = yx.serialize("profile", { person: Hy });
            } catch (err) {
                sxShowStatusToast("Could not read this profile to save it as a sample.", { tone: "error", persistent: true });
                return;
            }
            if (!payload || !payload.ratings || !Object.keys(payload.ratings).length) {
                sxShowStatusToast("Rate at least one topic first — a sample needs ratings to load back.", { tone: "error", persistent: true });
                return;
            }
            payload.photos = [];
            payload.noFlash = true;
            var api = window.__SX_LOCAL_SAMPLES;
            var existingAbout = "";
            try {
                var list0 = (api && typeof api.list === "function") ? (api.list(sxLocalSampleSkin()) || {}) : {};
                Object.keys(list0).forEach(function (k) {
                    if (String((list0[k] || {}).name || "").trim().toLowerCase() === name.toLowerCase()) existingAbout = String(list0[k].about || "");
                });
            } catch (err) { existingAbout = ""; }
            sxLocalSampleAboutDialog(name, existingAbout, function (aboutText) {
                sxFinishLocalSampleSave(name, payload, aboutText);
            });
        }
        function sxFinishLocalSampleSave(name, payload, aboutText) {
            var entry = { kind: "sample", name: name, count: Object.keys(payload.ratings).length, payload: payload };
            if (aboutText) entry.about = aboutText;
            var api = window.__SX_LOCAL_SAMPLES;
            if (!api || typeof api.save !== "function") {
                sxShowStatusToast("Local samples are not available right now — reload and try again.", { tone: "error", persistent: true });
                return;
            }
            var saved;
            try { saved = api.save(sxLocalSampleSkin(), entry); } catch (err) { saved = null; }
            if (!saved) {
                sxShowStatusToast("This device could not store the sample — browser storage may be full.", { tone: "error", persistent: true });
                return;
            }
            sxShowStatusToast(saved.updated ? "Updated the local sample for " + name + "." : "Saved " + name + " as a local sample — find it in the Samples menu.");
            sxSyncLocalSampleBtn();
            sxMarkLoadedSamples();
        }
        /* Create a roster from ALL loaded profiles (2026-11-27, Jason):
           one action instead of the per-profile flow (load a sample,
           open About, add sample, close About, repeat). It lists every
           profile currently loaded on this skin, lets Jason type a
           one-liner per profile, saves them all as local samples tagged
           with one roster, and downloads the roster pack. The one-liner
           rides in entry.about, which the Samples menu (and each roster
           submenu) already shows as a hover tip (data-ui-tooltip) —
           never inline, so the menu stays uncluttered. Only real
           individual profiles are listed: group and pair
           pseudo-profiles are computed, not members, so they are
           excluded. The cap is enforced per new member through the
           freemium gate — which also closes the gap where a personal
           sample joining a roster would otherwise skip the gate in
           api.save (that gate only fires for a brand-new name). */
        function sxCreateRosterFromLoaded() {
            var skin = sxLocalSampleSkin();
            var api = window.__SX_LOCAL_SAMPLES;
            if (!api || typeof api.list !== "function" || typeof api.save !== "function") {
                sxShowStatusToast("Local samples are not available right now — reload and try again.", { tone: "error", persistent: true });
                return;
            }
            var engine = window.__SEXCAPADES_SYNC_ENGINE;
            var loaded = Object.keys(vt).filter(function (id) {
                var ratings = vt[id];
                if (!ratings || !Object.keys(ratings).length) return false;
                if (!String(wt[id] || "").trim()) return false;
                var pskin = profileSkins[id];
                if (pskin && pskin !== skin) return false;
                if (engine && typeof engine.isPseudoProfile === "function" && engine.isPseudoProfile(id)) return false;
                return true;
            }).map(function (id) {
                return { id: id, name: String(wt[id]).trim() };
            }).sort(function (a, b) { return a.name.localeCompare(b.name); });
            if (!loaded.length) {
                sxShowStatusToast("No profiles loaded on this map yet — load a profile first, then create a roster from it.", { tone: "error", persistent: true });
                return;
            }
            /* Prefill each one-liner from the existing local sample of
               the same name, and the roster name from the one roster
               these profiles already share (if any). */
            var existing = {};
            try {
                var list = api.list(skin) || {};
                Object.keys(list).forEach(function (k) {
                    var e = list[k] || {};
                    var nm = String(e.name || "").trim().toLowerCase();
                    if (nm && !(nm in existing)) existing[nm] = e;
                });
            } catch (err) { existing = {}; }
            var sharedRoster = null;
            loaded.forEach(function (p) {
                var e = existing[p.name.toLowerCase()];
                if (e && e.roster) {
                    if (sharedRoster === null) sharedRoster = String(e.roster);
                    else if (sharedRoster !== String(e.roster)) sharedRoster = "";
                }
            });
            sxRosterFromLoadedDialog(loaded, existing, sharedRoster || "", function (rosterName, oneLiners) {
                sxFinishRosterFromLoaded(skin, api, loaded, rosterName, oneLiners);
            });
        }
        function sxRosterFromLoadedDialog(loaded, existing, defaultRosterName, onDone) {
            var dlg = e.byId("sxRosterFromLoadedDlg");
            if (!dlg) {
                dlg = document.createElement("dialog");
                dlg.id = "sxRosterFromLoadedDlg";
                dlg.style.cssText = "border:none;background:transparent;padding:0;max-width:92vw;";
                var st = document.createElement("style");
                st.textContent = "#sxRosterFromLoadedDlg::backdrop{background:rgba(8,10,12,.55);}";
                document.head.appendChild(st);
                document.body.appendChild(dlg);
                dlg.addEventListener("click", function (ev) { if (ev.target === dlg) dlg.close(); });
            }
            function escAttr(s) { return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
            function escText(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
            var rowsHtml = loaded.map(function (p, ix) {
                var about = "";
                var ex = existing[p.name.toLowerCase()];
                if (ex && ex.about) about = String(ex.about);
                return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">'
                    + '<div style="min-width:110px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;" title="' + escAttr(p.name) + '">' + escText(p.name) + '</div>'
                    + '<input type="text" data-roster-oneliner="' + ix + '" maxlength="300" placeholder="One-liner — the hover tip in the Samples menu" value="' + escAttr(about) + '" style="flex:1;min-width:0;background:#0f1214;color:#f2f4f6;border:1px solid #3a4550;border-radius:8px;padding:7px 8px;font:inherit;">'
                    + '</div>';
            }).join("");
            dlg.innerHTML = '<div style="background:#171b1f;color:#f2f4f6;border:1px solid #3a4550;border-radius:12px;padding:18px;width:520px;max-width:92vw;box-sizing:border-box;box-shadow:0 12px 40px rgba(0,0,0,.5);font:14px/1.45 system-ui,sans-serif;">'
                + '<div style="font-weight:600;font-size:16px;margin-bottom:8px;">Create roster from loaded profiles</div>'
                + '<div style="opacity:.75;margin-bottom:12px;">' + loaded.length + ' profile' + (loaded.length === 1 ? "" : "s") + ' loaded on this map. Each one-liner is the hover tip in the Samples menu — it never shows inline, so the menu stays uncluttered.</div>'
                + '<label for="sxRflName" style="display:block;margin-bottom:6px;">Roster name</label>'
                + '<input type="text" id="sxRflName" maxlength="80" placeholder="Roster name — e.g. Friday Knights" value="' + escAttr(defaultRosterName) + '" style="width:100%;box-sizing:border-box;background:#0f1214;color:#f2f4f6;border:1px solid #3a4550;border-radius:8px;padding:8px;font:inherit;margin-bottom:12px;">'
                + '<div style="max-height:280px;overflow-y:auto;margin-bottom:4px;">' + rowsHtml + '</div>'
                + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">'
                + '<button type="button" id="sxRflCancel" style="padding:8px 14px;border-radius:8px;border:1px solid #3a4550;background:transparent;color:inherit;font:inherit;cursor:pointer;">Cancel</button>'
                + '<button type="button" id="sxRflSave" style="padding:8px 14px;border-radius:8px;border:1px solid #3a4550;background:#2b6cb0;color:#fff;font:inherit;cursor:pointer;">Create roster &amp; download pack</button>'
                + '</div></div>';
            if (!dlg.open) dlg.showModal();
            e.byId("sxRflSave").onclick = function () {
                var rosterName = String(e.byId("sxRflName").value || "").trim();
                if (!rosterName) {
                    sxShowStatusToast("Give the roster a name first.", { tone: "error" });
                    e.byId("sxRflName").focus();
                    return;
                }
                var oneLiners = {};
                loaded.forEach(function (p, ix) {
                    var inp = dlg.querySelector('[data-roster-oneliner="' + ix + '"]');
                    if (inp) oneLiners[p.id] = String(inp.value || "").trim();
                });
                dlg.close();
                onDone(rosterName, oneLiners);
            };
            e.byId("sxRflCancel").onclick = function () { dlg.close(); };
            e.byId("sxRflName").focus();
        }
        function sxFinishRosterFromLoaded(skin, api, loaded, rosterName, oneLiners) {
            var rosterKey = String(rosterName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "roster";
            var fr = window.__SX_ROSTER_FREEMIUM;
            var currentCount = 0;
            try { currentCount = (fr && typeof fr.count === "function") ? (fr.count(skin, rosterKey) || 0) : 0; } catch (err) { currentCount = 0; }
            var rosterNames = {};
            try {
                var list0 = api.list(skin) || {};
                Object.keys(list0).forEach(function (k) {
                    var e = list0[k] || {};
                    if (e.rosterKey === rosterKey) rosterNames[String(e.name || "").trim().toLowerCase()] = true;
                });
            } catch (err) { /* roster membership read failed: treat all as new */ }
            var savedN = 0, updatedN = 0, blocked = [], failed = [], skipped = [];
            var lastGate = null;
            loaded.forEach(function (p) {
                var payload;
                try { payload = yx.serialize("profile", { person: p.id }); } catch (err) { payload = null; }
                if (!payload || !payload.ratings || !Object.keys(payload.ratings).length) { skipped.push(p.name); return; }
                payload.photos = [];
                payload.noFlash = true;
                var entry = { kind: "sample", name: p.name, count: Object.keys(payload.ratings).length, payload: payload, roster: rosterName, rosterKey: rosterKey };
                var about = oneLiners[p.id] || "";
                if (about) entry.about = about;
                var isMember = Boolean(rosterNames[p.name.toLowerCase()]);
                if (!isMember && fr && typeof fr.ensureGate === "function") {
                    var g;
                    try { g = fr.ensureGate(skin, rosterKey, currentCount + 1); } catch (err) { g = null; }
                    if (g && !g.allowed) { lastGate = g; blocked.push(p.name); return; }
                }
                var saved = null;
                try { saved = api.save(skin, entry); } catch (err) { saved = null; }
                if (!saved) { failed.push(p.name); return; }
                if (!isMember) currentCount += 1;
                if (saved.updated) updatedN += 1; else savedN += 1;
            });
            /* The pack is the FULL roster (every local sample carrying
               this rosterKey), not just the profiles saved just now. */
            var members = [];
            try {
                var list1 = api.list(skin) || {};
                Object.keys(list1).forEach(function (k) {
                    var e = list1[k] || {};
                    if (e.rosterKey !== rosterKey) return;
                    var copy = JSON.parse(JSON.stringify(e));
                    delete copy.local;
                    members.push(copy);
                });
            } catch (err) { members = []; }
            if (members.length) {
                try {
                    var pack = { format: "flexcapades-roster", version: 1, skin: skin, name: rosterName, exportedAt: new Date().toISOString(), samples: members };
                    var blob = new Blob([JSON.stringify(pack, null, 2) + "\n"], { type: "application/json" });
                    var a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = skin + "-" + rosterKey + ".json";
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
                } catch (err) { /* the roster is saved even if the download fails */ }
            }
            var parts = [];
            if (savedN) parts.push(savedN + " added");
            if (updatedN) parts.push(updatedN + " updated");
            var msg = "Roster '" + rosterName + "' — " + (parts.length ? parts.join(", ") : "no members") + " (" + members.length + " total)" + (members.length ? ", pack downloaded." : ".");
            if (blocked.length) {
                msg += " " + blocked.length + " profile" + (blocked.length === 1 ? "" : "s") + " could not be added" + (lastGate && lastGate.reason ? " — " + lastGate.reason : " — the roster is at the free cap.");
            }
            if (failed.length) msg += " " + failed.length + " could not be saved — browser storage may be full.";
            if (skipped.length) msg += " " + skipped.length + " skipped (no ratings).";
            sxShowStatusToast(msg, (blocked.length || failed.length || skipped.length) ? { tone: "error" } : {});
            try { if (typeof api.refresh === "function") api.refresh(); } catch (err) { /* menu rebuild is best-effort */ }
            sxSyncLocalSampleBtn();
            sxMarkLoadedSamples();
        }
        window.sxCreateRosterFromLoaded = sxCreateRosterFromLoaded;
        function sxRemoveLocalSample(key) {
            var api = window.__SX_LOCAL_SAMPLES;
            if (!api || typeof api.remove !== "function") return;
            /* (a) Removing a roster member is a membership change: if
               the roster is large / grandfathered, it needs an active
               registration window. Removing from a free roster is free. */
            var frRem = window.__SX_ROSTER_FREEMIUM;
            if (frRem && typeof frRem.gateRemove === "function" && typeof frRem.individualsOf === "function") {
                try {
                    var listR = (api.list && typeof api.list === "function") ? (api.list(sxLocalSampleSkin()) || {}) : {};
                    var entryR = listR[key];
                    if (entryR && entryR.rosterKey) {
                        var gRem = frRem.gateRemove(sxLocalSampleSkin(), String(entryR.rosterKey), frRem.individualsOf(entryR));
                        if (!gRem.allowed) {
                            if (typeof frRem.blockedToast === "function") frRem.blockedToast(gRem);
                            return;
                        }
                    }
                } catch (err) { /* a gate failure must not block a remove */ }
            }
            var removedName;
            try { removedName = api.remove(sxLocalSampleSkin(), key); } catch (err) { removedName = false; }
            if (removedName) {
                sxShowStatusToast("Removed " + removedName + " from local samples.");
                sxSyncLocalSampleBtn();
                sxMarkLoadedSamples();
            }
        }
        let fw = !1;
        function sxDismissIndependentTip() {
            var t = e.byId("profileIndependentTip");
            t && (t.hidden = !0, t.style.display = "none"), fw = !0;
        }
        // DETAILS HARD BLOCK (owner ruling, 2026-10-27): the profile
        // details dialog opens ONLY for the profile of the tab active in
        // the viewport. bw() is the dialog's only opener, so the gate
        // lives here, ahead of every state change bw makes: a blocked
        // attempt opens nothing, changes no profile, writes nothing, and
        // never activates the target's tab - it refuses with a visible
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
        function sxOpenProfileDetails(t = null, n = {}) {
            if (t && vt[t] && t !== ROXY_PROFILE_ID) {
                const sxTab = sxCurrentTab(), sxAllowed = sxTab ? t === (sxTab.groupId || null) : t === Mt;
                if (!sxAllowed) return sxDetailsBlocked(t), !1;
            }
            zy = null, sxCloseAddMenu(), sxCloseSampleSubmenus(), sxCloseModalDialog(kg), Hy = t && vt[t] ? t : null;
            const i = Hy ? sxNormalizeGenders(rt[Hy]) : [];
            Hg.value = Hy ? wt[Hy] : "", sxApplyGenderSelection(i), sxApplyOrientationSelection(Hy ? ot[Hy] : []), sxApplyRoleSelection(Hy ? st[Hy] : []), Pz.value = Hy ? String(pz[Hy] || "") : "",
            Kg.value = Hy ? sxNormalizeAgeText(lt[Hy]) : "", zg.value = Hy ? sxNormalizeLocationText(ct[Hy]) : "", sxFillContactFields(Hy ? ut[Hy] : null),
            im.value = Hy ? String(nt[Hy] || "") : "", rm.value = Hy ? String(it[Hy] || "") : "",
            sxRefreshAboutCounts(), Wy = Hy ? sxClonePhotoRecords(dt[Hy]) : [], lm.value = "", sxRenderPhotoThumbs(), sxRenderTimingSummary(Hy), sxRefreshGenderPicker(), sxCloseGenderPicker(), sxRefreshOrientationPicker(),
            sxCloseOrientationPicker(), sxRefreshRolePicker(), sxCloseRolePicker(), sxMarkFieldInvalid("profileDetailsNameField", "profileDetailsNameError", !1),
            sxMarkFieldInvalid("profileDetailsGenderField", "profileDetailsGenderError", !1), sxMarkFieldInvalid("profileDetailsSexualityField", "profileDetailsSexualityError", !1),
            sxMarkFieldInvalid("profileDetailsAgeField", "profileDetailsAgeError", !1), sm.textContent = "",
            Uy = sxEditorStateText(), Gy = sxClonePhotoRecords(Wy), e.byId("saveProfileDetails").textContent = Hy ? "Save changes" : "Create profile",
            e.byId("profileDetailsLoadersLabel").textContent = Hy ? "Tests and imported values" : "Start with a test or import",
            sxSetProfileDialogMode("about" === n.mode && Hy ? "about" : "edit");
            const a = e.byId("profileIndependentTip"), r = !Hy && Object.keys(vt).filter(e => e !== Et).length >= 1;
            a.hidden = !r || fw, a.hidden || (a.style.display = ""), r && !fw && (fw = !0);
            var o = e.byId("dismissProfileIndependentTip");
            o && !o.dataset.dpiBound && (o.dataset.dpiBound = "1", o.addEventListener("click", sxDismissIndependentTip)),
            sxOpenModalDialog(_g), requestAnimationFrame(() => {
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
        function sxSaveProfileDetails(e = null, t = "auto") {
            sxScoringProfileIds();
            const typedName = Hg.value.trim().replace(/\s+/g, " "), n = typedName || "Unknown", nameWasBlank = !typedName, i = sxReadGenderSelection(), a = sxReadOrientationSelection(), r = sxReadRoleSelection(), o = sxNormalizeAgeText(Kg.value), s = sxNormalizeLocationText(zg.value), l = Hy, c = sxClonePhotoRecords(Wy), d = l ? sxClampVeilLevel(vpt[l]) : 50, u = readContactBlocks();
            if (Kg.value.trim() && !o) return sxMarkFieldInvalid("profileDetailsAgeField", "profileDetailsAgeError", !0, "Enter an age from 18 to 120."),
            sm.textContent = "Check the age and try again." + (jY ? ` Then your ${jY} opens.` : ""), void (Kg.focus(), jY && sm.scrollIntoView({ block: "nearest" }));
            sxMarkFieldInvalid("profileDetailsNameField", "profileDetailsNameError", !1), sxMarkFieldInvalid("profileDetailsGenderField", "profileDetailsGenderError", !1), sxMarkFieldInvalid("profileDetailsSexualityField", "profileDetailsSexualityError", !1);
            if (sm.textContent = "", u.error) return sm.textContent = u.error + (jY ? ` Then your ${jY} opens.` : ""), void (u.field.focus(), jY && sm.scrollIntoView({ block: "nearest" }));
            const p = u.contact, h = im.value.trim().slice(0, 975), g = rm.value.trim().slice(0, 325), m = sxFindProfileByName(n), q = Pz.value.trim().slice(0, 60);
            if (!nameWasBlank && m && m !== l) return sm.textContent = `${n} already has a profile.` + (jY ? ` Then your ${jY} opens.` : ""), Hg.focus(),
            void (Hg.select(), jY && sm.scrollIntoView({ block: "nearest" }));
            const sxEditVy = id => { const b = Vy; Vy = null, jY = null, b && b(id); };
            const f = l && zy && zy.id === l ? zy : null;
            if (zy = null, sxCloseModalDialog(_g), queueMicrotask(() => {
                (_g.open || _g.hasAttribute("open")) && sxCloseModalDialog(_g);
            }), Hy = null, Wy = [], lm.value = "", Uy = "", Gy = [], l) {
                if (!vt[l]) return;
                const u = wt[l] !== n || JSON.stringify(sxNormalizeGenders(rt[l])) !== JSON.stringify(i) || JSON.stringify(sxNormalizeOrientations(ot[l])) !== JSON.stringify(a) || JSON.stringify(sxNormalizeRoles(st[l])) !== JSON.stringify(r) || sxNormalizeAgeText(lt[l]) !== o || sxNormalizeLocationText(ct[l]) !== s || JSON.stringify(sxClonePhotoRecords(dt[l])) !== JSON.stringify(c) || JSON.stringify(sxNormalizeContactRecord(ut[l])) !== JSON.stringify(p) || String(nt[l] || "") !== h || String(it[l] || "") !== g || sxClampVeilLevel(vpt[l]) !== d || String(pz[l] || "") !== q;
                return wt[l] = n, rt[l] = i, ot[l] = a, st[l] = r, pz[l] = q, lt[l] = o, ct[l] = s, dt[l] = c,
                ut[l] = p, nt[l] = h, it[l] = g, vpt[l] = d, u && sxTouchProfile(l), sxSendConsentedSurvey("save", l), void requestAnimationFrame(() => {
                    sxRenderProfileTabs(), sxRequestMapPaint({
                        animate: !1
                    }), Cn.getBoundingClientRect(), Oc.open && sxPrepScribeDialog(), f ? f.action() : "outline" === e ? sxOpenHotList(l) : "testchooser" === e ? sxOpenTestChooser(l) : e ? sxOpenResultConverter(e, t, l) : sxEditVy(l);
                });
            }
            const y = sxAllocateProfileId(n);
            SX_PROFILE_RECORD_LISTS.forEach(e => e[y] = {}), wt[y] = n, rt[y] = i, ot[y] = a, st[y] = r, pz[y] = q, lt[y] = o, ct[y] = s,
            dt[y] = c, ut[y] = p, nt[y] = h, it[y] = g, vpt[y] = d, vht[y] = !1, profileUuids[y] = makeProfileUuid(), sampleProfileFlags[y] = !1, sxTouchProfile(y), sxAdoptDraftRatings(y),
            sxAutoSelect(y), sxActivateProfile(y, {
                blankStart: !0
            }), sxSendConsentedSurvey("save", y);
            const b = Vy;
            Vy = null, jY = null, "outline" === e ? sxOpenHotList(y) : "testchooser" === e ? sxOpenTestChooser(y) : e ? sxOpenResultConverter(e, t, y) : b && b(y);
        }
