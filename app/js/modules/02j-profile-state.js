        const Ke = new Set;
        function ze(e, t) {
            return new Proxy(t, {
                deleteProperty: (t, n) => (console.error(`Blocked an unexpected ${e} deletion for ${String(n)}.`), 
                !0)
            });
        }
        const Ve = window.__SEXCAPADES_PROFILE_SESSION__ || (window.__SEXCAPADES_PROFILE_SESSION__ = {
            profileRecords: {},
            profileNameRecords: {},
            ratingSources: {},
            annotations: {},
            fantasyOnly: {},
            alreadyTried: {},
            profileNotes: {},
            profileAbout: {},
            profileTerms: {},
            importedChildren: {},
            profileGenders: {},
            profilePronouns: {},
            profileSexualities: {},
            profileRoles: {},
            profileAges: {},
            profileLocations: {},
            profilePhotos: {},
            profileContacts: {},
            profileVeils: {},
            profileVeilEnabled: {},
            loaderStates: {},
            profileCompletionTimes: {},
            profileComparisons: {},
            profileDirty: {},
            profileUuids: {},
            profileSampleFlags: {},
            droppedKeys: {},
            curveBends: {}
        }), {profileRecords: Ye, profileNameRecords: Xe, ratingSources: Ze, annotations: Qe, fantasyOnly: Je, alreadyTried: et, profileNotes: tt, profileAbout: nt, profileTerms: it, importedChildren: at, profileGenders: rt, profilePronouns: pz = {}, profileSexualities: ot, profileRoles: st, profileAges: lt, profileLocations: ct, profilePhotos: dt, profileContacts: ut, profileVeils: vpt, profileVeilEnabled: vht, loaderStates: gt, profileCompletionTimes: mt, profileComparisons: ft, profileDirty: yt, profileUuids: profileUuids, profileSampleFlags: sampleProfileFlags, droppedKeys: droppedKeyRecords, curveBends: bt} = Ve, vt = ze("profile", Ye), wt = ze("profile name", Xe), kt = {
            outline: "List rating",
            kinktest: "KinkTest.co.uk",
            checklist: "Yes / No / Maybe"
        };
        function xt(e) {
            const t = Math.max(0, Math.floor(Number(e) || 0)), n = Math.floor(t / 60), i = t % 60;
            return `${String(n).padStart(2, "0")}:${String(i).padStart(2, "0")}`;
        }
        function St(e) {
            const t = {};
            return e && "object" == typeof e ? (Object.keys(kt).forEach(n => {
                const i = e[n];
                if (!i || "object" != typeof i) return;
                const a = Math.max(0, Math.min(86400, Math.floor(Number(i.durationSeconds) || 0))), r = Number.isNaN(Date.parse(i.completedAt)) ? "" : new Date(i.completedAt).toISOString(), o = Math.max(0, Math.floor(Number(i.count) || 0)), s = Math.max(o, Math.floor(Number(i.total) || 0)), l = "outline" === n && Boolean(i.timerRan || a > 0);
                r && (t[n] = {
                    durationSeconds: a,
                    completedAt: r,
                    count: o,
                    total: s,
                    ...l ? {
                        timerRan: !0
                    } : {}
                });
            }), t) : t;
        }
        function $t(e, t, n, i, a, r = {}) {
            vt[e] && kt[t] && ((mt[e] || (mt[e] = {}))[t] = {
                durationSeconds: Math.max(0, Math.floor(Number(n) || 0)),
                completedAt: (new Date).toISOString(),
                count: Math.max(0, Math.floor(Number(i) || 0)),
                total: Math.max(0, Math.floor(Number(a) || 0)),
                ..."outline" === t && r.timerRan ? {
                    timerRan: !0
                } : {}
            }, zt(e));
        }
        const Et = "__empty-profile-preview__", At = {};
        Ze[Et] = {}, Qe[Et] = {}, Je[Et] = {}, et[Et] = {}, tt[Et] = {}, at[Et] = {};
        let Ct = !1, Mt = null, It = null, Pt = "all", Lt = null, Tt = "", Nt = null, Dt = null, Rt = !1, Ot = "all", Bt = !0;
        let sxSelEditorMirrored = null;

        // Phase 2: Semantic state aliases and runtime state bridge
        const sxProfileRatings = vt;
        const sxProfileNames = wt;
        const sxProfileAnnotations = Qe;
        const sxProfileComparisons = ft;
        const sxProfileDirty = yt;
        const sxRatingSources = Ze;
        const sxFantasyOnly = Je;
        const sxAlreadyTried = et;
        const sxProfileNotes = tt;
        const sxImportedChildren = at;
        const sxProfileVeils = vpt;
        const sxProfileVeilEnabled = vht;
        const sxProfileTimes = mt;

        function sxGetActiveProfileId() { return Mt; }
        function sxSetActiveProfileId(id) { Mt = id; }
        function sxGetSelectedTopicId() { return Lt; }
        function sxSetSelectedTopicId(id) { Lt = id; }
        function sxGetSearchTerm() { return Tt; }
        function sxSetSearchTerm(term) { Tt = term; }
        function sxGetCategoryFilter() { return Pt; }
        function sxSetCategoryFilter(f) { Pt = f; }

        window.SexcapadesEngine = window.SexcapadesEngine || {};
        window.SX = window.SexcapadesEngine;
        window.SexcapadesEngine.State = {
            getActiveProfileId: sxGetActiveProfileId,
            setActiveProfileId: sxSetActiveProfileId,
            getSelectedTopicId: sxGetSelectedTopicId,
            setSelectedTopicId: sxSetSelectedTopicId,
            getSearchTerm: sxGetSearchTerm,
            setSearchTerm: sxSetSearchTerm,
            getCategoryFilter: sxGetCategoryFilter,
            setCategoryFilter: sxSetCategoryFilter,
            getRatings: (id) => (id ? vt[id] : vt),
            getNames: (id) => (id ? wt[id] : wt),
            getVeils: (id) => (id ? vpt[id] : vpt),
            getVeilEnabled: (id) => (id ? vht[id] : vht),
            getComparisons: (id) => (id ? ft[id] : ft),
            getDirty: (id) => (id ? yt[id] : yt),
            getNotes: (id) => (id ? tt[id] : tt),
            raw: {
                ratings: vt,
                names: wt,
                annotations: Qe,
                comparisons: ft,
                dirty: yt,
                sources: Ze,
                alreadyTried: et,
                notes: tt,
                importedChildren: at,
                veils: vpt,
                veilEnabled: vht,
                times: mt
            }
        };
        function jt() {
            return Mt && yt[Mt] ? Mt : Object.keys(yt).find(e => vt[e] && yt[e]) || null;
        }
        let qt = !1, Ht = null, Wt = !1;
        const draftRatings = Object.create(null), draftSaveTimers = Object.create(null);
        function cloneProfileData(e) {
            try {
                return JSON.parse(JSON.stringify(e));
            } catch (e) {
                return null;
            }
        }
        function queueDraftAutosave(e) {
            e && vt[e] && (draftRatings[e] = cloneProfileData(vt[e]) || {}, draftSaveTimers[e] && t.clear(draftSaveTimers[e]), 
            draftSaveTimers[e] = t.setTimeout(() => {
                delete draftSaveTimers[e];
                const n = window.SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x"), i = window.Sexcapades2xRememberProfiles;
                n && n.checked && i && "function" == typeof i.saveNow && i.saveNow() && Vt(e);
            }, 500));
        }
        function Ut(e) {
            !qt && jt() && (e.preventDefault(), e.returnValue = !0);
        }
        function Gt() {
            const e = Boolean(jt());
            document.documentElement.classList.toggle("has-unsaved-changes", e), document.body.classList.toggle("has-unsaved-changes", e), 
            e && !Wt ? (window.addEventListener("beforeunload", Ut), Wt = !0) : !e && Wt && (window.removeEventListener("beforeunload", Ut), 
            Wt = !1);
        }
        function Kt(t) {
            const n = e.byId("profileTabs");
            if (!n) return;
            const i = Array.from(n.querySelectorAll("button[data-view]")).find(e => e.dataset.view === t);
            if (!i) return;
            let a = i.querySelector(".profile-tab-dirty"), r = (i.getAttribute("aria-label") || "").replace(", unsaved changes", "");
            yt[t] ? (a || (a = document.createElement("sup"), a.className = "profile-tab-dirty", 
            a.setAttribute("aria-hidden", "true"), a.textContent = "*", i.appendChild(a)), i.setAttribute("aria-label", `${r}, unsaved changes`)) : (a && a.remove(), 
            i.setAttribute("aria-label", r));
        }
        function zt(e) {
            e && vt[e] && (yt[e] = !0, queueDraftAutosave(e), Gt(), Kt(e), sxRefreshGroupOwn(e));
            try {
                if (e && typeof Oo !== "undefined" && Oo && (typeof Go === "undefined" || !Go || Go === e)) {
                    const name = e === Et ? "New profile" : (wt[e] || "Profile");
                    Oo.textContent = name + (yt[e] ? " *" : "");
                }
            } catch (_) {}
            try { window.SexcapadesEngine?.Map?.invalidateVault(e); } catch (_) {}
        }
        function Vt(e) {
            e && delete yt[e], e && delete draftRatings[e], e && draftSaveTimers[e] && (t.clear(draftSaveTimers[e]), delete draftSaveTimers[e]), 
            Gt(), e && Kt(e);
            try { window.SexcapadesEngine?.Map?.invalidateVault(e); } catch (_) {}
        }
