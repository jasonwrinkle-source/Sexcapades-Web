// 06d3-profile-about.js — Profile about view, archetype projection, local samples, and details opener/saver
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
            const archEl = e.byId("profileArchetypeResults");
            archEl && (archEl.innerHTML = "");
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
            if ("about" === gw && Hy) sxSyncLocalSampleBtn();
        }
        // Profile-to-archetype projection (2026-11-17): match the profile
        // open in this dialog against every archetype in the current skin,
        // through the real pair engine (the same Play Match Score the
        // Krossmatch tabs show), ranked best-first. Adam/Eve are samples,
        // not archetypes, so they are left out. A partly-rated profile
        // still projects — the score rests on the topics both sides rated,
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
            const scored = [];
            Object.keys(samples).forEach(key => {
                const entry = samples[key];
                if (!entry || !entry.payload || !entry.payload.ratings) return;
                if (entry.kind === "sample") return;
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
                if (!pair || !pair.play || !pair.coverage) return;
                const shared = pair.coverage.shared || 0;
                if (!shared) return;
                // Identity score — "which archetype am I?": same-flank
                // similarity over the shared set (both rated, not
                // limit-blocked, not fantasy). The old score was the
                // pair engine's Play match score, which measures
                // whether both sides rated the crossed flanks at all,
                // not agreement — so every archetype scored 100.
                // Multi-pole topics use their agreement fraction
                // (already a same-position comparison); two-pole
                // topics compare each flank with itself (give with
                // give, receive with receive), skipping a flank
                // either side left unrated.
                const identityAgreements = [];
                (pair.topics || []).forEach(rec => {
                    if (!rec || !rec.ratings || !rec.ratings.a || !rec.ratings.b) return;
                    if ((rec.limiters || []).length) return;
                    if (((rec.flags || {}).fantasyBy || []).length) return;
                    const ra = rec.ratings.a, rb = rec.ratings.b;
                    if (!(ra.giveKnown || ra.receiveKnown || ra.polesKnown || ra.lineKnown) || !(rb.giveKnown || rb.receiveKnown || rb.polesKnown || rb.lineKnown)) return;
                    if (null != rec.agreement) { identityAgreements.push(rec.agreement); return; }
                    const diffs = [];
                    if (ra.giveKnown && rb.giveKnown) diffs.push(Math.abs(ra.give - rb.give));
                    if (ra.receiveKnown && rb.receiveKnown) diffs.push(Math.abs(ra.receive - rb.receive));
                    if (!diffs.length) return;
                    identityAgreements.push(1 - diffs.reduce((s, v) => s + v, 0) / (200 * diffs.length));
                });
                if (!identityAgreements.length) return;
                const identityScore = Math.round(100 * identityAgreements.reduce((s, v) => s + v, 0) / identityAgreements.length);
                const matchDrivers = (pair.play.lists && pair.play.lists.matches ? pair.play.lists.matches : []).map(r => r.label).filter(Boolean);
                const curiousDrivers = (pair.play.lists && pair.play.lists.curiousAbout ? pair.play.lists.curiousAbout : []).map(r => r.label).filter(Boolean);
                const drivers = matchDrivers.concat(curiousDrivers.filter(l => !matchDrivers.includes(l))).slice(0, 3);
                scored.push({ key: key, name: entry.name || key, about: entry.about || "", score: identityScore, shared: shared, drivers: drivers });
            });
            if (!scored.length) {
                resultsEl.innerHTML = `<p class="profile-archetype-note">No shared topics yet — rate a few of the topics these archetypes cover and try again.</p>`;
                return;
            }
            scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
            const top = scored.slice(0, 5);
            const rows = top.map((s, i) => {
                const drivers = s.drivers.length ? `<p class="profile-archetype-drivers">Closest on: ${s.drivers.map(Hi).join(", ")}</p>` : "";
                // The definition is a hover tip on the row (shared
                // data-ui-tooltip popup), not inline text — it
                // cluttered the list. data-tooltip-tap-first lets
                // touch users tap once to read it; tabindex lets
                // keyboard users focus the row and read it the same way.
                const tip = s.about ? ` data-ui-tooltip="${Hi(s.about)}" data-tooltip-name="${Hi(s.name)}" data-tooltip-tap-first tabindex="0"` : "";
                return `<div class="profile-archetype-row"${tip}><div class="profile-archetype-row-top"><span class="profile-archetype-name">${i + 1}. ${Hi(s.name)}</span><span class="profile-archetype-score">${s.score}%</span></div>${drivers}</div>`;
            }).join("");
            const best = top[0];
            resultsEl.innerHTML = rows + `<p class="profile-archetype-note">Compared against ${scored.length} archetype${1 === scored.length ? "" : "s"} · your closest archetype is ${Hi(best.name)} at ${best.score}% on ${best.shared} shared topic${1 === best.shared ? "" : "s"} · you rated ${userRated} topic${1 === userRated ? "" : "s"}.</p>`;
        }

        // Local samples (2026-11-18, Jason): "Add current profile as a
        // local sample" on the profile About view saves the open profile
        // on this device so it appears in the Samples menu and loads back
        // later — a chapter roster. The profile is serialized with the
        // same full-profile serializer the export path uses, then the
        // skin loader stores it per-skin (its store + menu rebuild) and
        // the button flips to "Update local sample" while a sample with
        // this name exists on this skin. Photos are stripped before
        // saving: they travel as data URLs and would eat the ~5MB
        // localStorage quota for a roster; the menu shows the name, which
        // is what makes a sample recognizable. noFlash is set so the
        // sample loader's validity check (name + count + noFlash) passes
        // exactly like a built-in sample. A profile with no ratings
        // cannot be a sample — there is nothing to load back.
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
        function sxSaveLocalSample() {
            if (!Hy || !vt[Hy]) return;
            var name = String(wt[Hy] || "").trim() || "Profile";
            var payload;
            try {
                payload = yx.serialize("profile", { person: Hy });
            } catch (err) {
                tS("Could not read this profile to save it as a sample.", { tone: "error", persistent: true });
                return;
            }
            if (!payload || !payload.ratings || !Object.keys(payload.ratings).length) {
                tS("Rate at least one topic first — a sample needs ratings to load back.", { tone: "error", persistent: true });
                return;
            }
            payload.photos = [];
            payload.noFlash = true;
            var entry = { kind: "sample", name: name, count: Object.keys(payload.ratings).length, payload: payload };
            var api = window.__SX_LOCAL_SAMPLES;
            if (!api || typeof api.save !== "function") {
                tS("Local samples are not available right now — reload and try again.", { tone: "error", persistent: true });
                return;
            }
            var saved;
            try { saved = api.save(sxLocalSampleSkin(), entry); } catch (err) { saved = null; }
            if (!saved) {
                tS("This device could not store the sample — browser storage may be full.", { tone: "error", persistent: true });
                return;
            }
            tS(saved.updated ? "Updated the local sample for " + name + "." : "Saved " + name + " as a local sample — find it in the Samples menu.");
            sxSyncLocalSampleBtn();
            Ew();
        }
        function sxRemoveLocalSample(key) {
            var api = window.__SX_LOCAL_SAMPLES;
            if (!api || typeof api.remove !== "function") return;
            var removedName;
            try { removedName = api.remove(sxLocalSampleSkin(), key); } catch (err) { removedName = false; }
            if (removedName) {
                tS("Removed " + removedName + " from local samples.");
                sxSyncLocalSampleBtn();
                Ew();
            }
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
            const p = u.contact, h = im.value.trim().slice(0, 975), g = rm.value.trim().slice(0, 325), m = ek(n), q = Pz.value.trim().slice(0, 60);
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
