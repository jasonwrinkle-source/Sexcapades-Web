// 06d-profile-sheet.js - Tab strip coordinator, sample/archetype menus, and active profile selection
        function ww() {
            // Capture the Load menu's origin before kw() clears qy:
            // the origin is carried explicitly into this dialog -
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
            e && (!jy.hidden || jyA && !jyA.hidden) && e.setAttribute("aria-expanded", "false");
        }
        function Sw() {
            // Closes BOTH submenus: Samples (jy) and Archetypes (jyA) -
            // plus any roster submenus the skin loader registered on
            // window.__SX_SAMPLE_SUBMENUS (2026-11-22 fix: roster menus
            // opened through Iw but no close path knew about them, so
            // they would not dismiss).
            [ jy, jyA ].concat(window.__SX_SAMPLE_SUBMENUS || []).forEach(menu => menu && (menu.hidden = !0, menu.classList.remove("is-submenu"), menu.__sxTrigger && menu.__sxTrigger.setAttribute("aria-expanded", "false")));
            const t = tl.querySelector("[data-add-profile]"), n = e.byId("loadSampleProfileChoice"), a = e.byId("loadArchetypeChoice");
            t && t.setAttribute("aria-expanded", String(!By.hidden)), n && n.setAttribute("aria-expanded", "false"), a && a.setAttribute("aria-expanded", "false");
        }
        function SwI(openMenu, trigger) {
            // Iw's closer: like Sw, but never closes the menu being
            // opened nor a menu that contains the trigger. A stack
            // parent row lives INSIDE the Samples/Archetypes submenu,
            // and Sw's blanket close hid that parent menu the moment
            // the row was hovered - the layers flyout opened into a
            // void and the parent was gone, so neither could be used
            // by mouse. The roster path never hit this: roster
            // triggers live in the add menu, which Sw does not close.
            // Sibling submenus (and their flyouts) still close, and
            // every other caller keeps Sw's full close.
            [ jy, jyA ].concat(window.__SX_SAMPLE_SUBMENUS || []).forEach(menu => {
                if (!menu || menu === openMenu || trigger && menu.contains && menu.contains(trigger)) return;
                menu.hidden = !0, menu.classList.remove("is-submenu"), menu.__sxTrigger && menu.__sxTrigger.setAttribute("aria-expanded", "false");
            });
            const t = tl.querySelector("[data-add-profile]"), n = e.byId("loadSampleProfileChoice"), a = e.byId("loadArchetypeChoice");
            t && t.setAttribute("aria-expanded", String(!By.hidden)), n && jy.hidden && n.setAttribute("aria-expanded", "false"), a && jyA && jyA.hidden && a.setAttribute("aria-expanded", "false");
        }
        function $w(e, t) {
            if (e === Oy && innerWidth <= 620) return e.style.removeProperty("left"), void e.style.removeProperty("top");
            const n = t.getBoundingClientRect(), i = e.getBoundingClientRect();
            e.style.left = Math.max(8, Math.min(innerWidth - i.width - 8, n.right - i.width)) + "px", 
            e.style.top = Math.max(8, Math.min(innerHeight - i.height - 8, n.bottom + 7)) + "px";
        }
        function Ew() {
            [ jy, jyA ].concat(window.__SX_SAMPLE_SUBMENUS || []).forEach(menu => menu && menu.querySelectorAll("[data-sample-profile]").forEach(e => {
                const t = e.dataset.sampleProfile, n = e.dataset.sampleName, i = Zy[t];
                i && !vt[i] && delete Zy[t];
                const a = Boolean(Zy[t] && vt[Zy[t]] || ek(n) || ek(`${n} (sample)`));
                e.disabled = a, e.setAttribute("aria-disabled", String(a));
                const r = e.querySelector("small");
                r && (r.textContent = a ? "Loaded" : `${e.dataset.sampleCount} rated topics`);
            }));
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
                const t = jy.querySelector(`[data-sample-profile="${CSS.escape(e)}"] img`) || jyA && jyA.querySelector(`[data-sample-profile="${CSS.escape(e)}"] img`) || document.querySelector(`[data-sample-profile="${CSS.escape(e)}"] img`), n = t && (t.currentSrc || t.src);
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
        function Iw(t = {}, menu = jy, trigger = _w) {
            // Capture the trigger's rect BEFORE kw()/SwI() close the
            // sibling submenus: a trigger that lives inside a submenu
            // (a palimpsest stack's parent row inside Samples) is
            // positioned from its rect, and the sibling closes run
            // before the flyout is placed. Triggers in the add menu
            // are unaffected - the closer never hides that menu, so
            // their rect is the same either way.
            const triggerRect = trigger && trigger.getBoundingClientRect ? trigger.getBoundingClientRect() : null;
            kw(), SwI(menu, trigger);
            const n = tl.querySelector("[data-add-profile]"), i = trigger;
            if (!n || By.hidden || !menu) return;
            Ew(), menu.hidden = !1, menu.classList.add("is-submenu"), n.setAttribute("aria-expanded", "true"), 
            i.setAttribute("aria-expanded", "true");
            const a = triggerRect || i.getBoundingClientRect(), r = menu.offsetWidth, o = menu.offsetHeight;
            let s, l;
            if (innerWidth <= 620) {
                s = Math.max(8, Math.min(innerWidth - r - 8, a.left));
                const e = a.bottom + 6, t = a.top - o - 6;
                l = e + o <= innerHeight - 8 ? e : t >= 8 ? t : Math.max(8, innerHeight - o - 8);
            } else s = Math.max(8, Math.min(innerWidth - r - 8, a.right + 6)), l = Math.max(8, Math.min(innerHeight - o - 8, a.top));
            if (menu.style.left = s + "px", menu.style.top = l + "px", t.focus) {
                const e = menu.querySelector("[data-sample-profile]:not(:disabled)");
                e && e.focus({
                    preventScroll: !0
                });
            }
        }
        function Pw(e) {
            kw(), jy.hidden && (!jyA || jyA.hidden) && (window.__SX_SAMPLE_SUBMENUS || []).every(m => !m || m.hidden) ? By.hidden ? (By.hidden = !1, e.setAttribute("aria-expanded", "true"), 
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
        // Loads one entry from either the Samples or the Archetypes
        // submenu (both carry [data-sample-profile] buttons; the
        // loader is the same for archetypes and samples).
        async function sxLoadSampleBtn(menu, sampleBtn) {
            if (!sampleBtn || !menu.contains(sampleBtn) || sampleBtn.disabled) return;
            const n = sampleBtn.dataset.sampleProfile, i = sampleBtn.dataset.sampleName, a = Number(sampleBtn.dataset.sampleCount), r = sampleBtn.querySelector("small");
            sampleBtn.disabled = !0, r && (r.textContent = "Loading…"), Sw(), xw();
            try {
                const [samplesMap, photo] = await Promise.all([ Aw(), Mw(n) ]), r = samplesMap && samplesMap[n];
                if (!r || r.name !== i || r.count !== a || !r.payload || !0 !== r.payload.noFlash) throw new Error("The bundled sample is invalid.");
                const o = JSON.parse(JSON.stringify(r.payload));
                o.profileName = i, o.sampleProfile = !0, o.skin = o.skin || r.skin || sampleBtn.dataset.sampleSkin || (typeof window !== "undefined" && window.__SX_ACTIVE_SKIN) || "sexcapades";
                if (r.emblem && photo) {
                    // Emblem avatars (2026-11-23): the entry's emblem -
                    // fetched through its menu <img> by Mw, exactly like
                    // Adam/Eve's real photos - becomes the loaded
                    // profile's center photo. Stack layers share their
                    // stack's one emblem (the date does the talking).
                    o.photos = [ photo ];
                } else if (r.kind !== "sample" || !photo) {
                    const archPhoto = typeof sxMakeArchetypePhoto === "function" ? sxMakeArchetypePhoto(r.name || i, o.skin) : null;
                    if (archPhoto) o.photos = [ archPhoto ];
                    else if (photo) o.photos = [ photo ];
                } else if (photo) {
                    o.photos = [ photo ];
                }
                const s = wx(o, {
                    autoSelect: !0
                });
                if (s && typeof Vt === "function") { Vt(s); }
                Zy[n] = s, Ew();
            } catch (e) {
                sampleBtn.disabled = !1, r && (r.textContent = `${a} rated topics`), tS(e.message || "Could not load that profile.", {
                    tone: "error",
                    persistent: !0
                });
            }
        }
        function sxSampleMenuClick(menu, e) {
            const sampleBtn = __sxClosestAction(e.target, "sampleProfile");
            if (sampleBtn) sxLoadSampleBtn(menu, sampleBtn);
        }
        // Whole-stack loading (2026-11-22): a palimpsest stack
        // submenu's "Load whole stack" item (created by the skin
        // loader) calls this hook with the stack's layer keys in date
        // order; each layer loads through the very same path as a
        // menu click on its button, one at a time, so the profile
        // tabs land in date order and each load's auto-select
        // settles before the next begins. Already-loaded layers are
        // skipped (Ew keeps their buttons disabled).
        window.__SX_LOAD_SAMPLES = async (menu, keys) => {
            if (!menu || !keys) return;
            for (const k of keys) {
                const btn = menu.querySelector(`[data-sample-profile="${CSS.escape(k)}"]`);
                if (btn && !btn.disabled) await sxLoadSampleBtn(menu, btn);
            }
        };
        const Tw = e.byId("newBlankProfile"), Fw = e.byId("newListProfile"), Nw = e.byId("importProfileChoice"), _w = e.byId("loadSampleProfileChoice"), _wA = e.byId("loadArchetypeChoice");
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
                By.matches(":hover") || jy.matches(":hover") || jyA && jyA.matches(":hover") || (window.__SX_SAMPLE_SUBMENUS || []).some(m => m && m.matches(":hover")) || Sw();
            }, 180);
        };
        _w.addEventListener("pointerenter", () => {
            Rw(), Iw();
        }), _w.addEventListener("focus", () => Iw()), _w.addEventListener("click", e => {
            e.preventDefault(), Iw({
                focus: !0
            });
        }), _wA && _wA.addEventListener("pointerenter", () => {
            Rw(), Iw({}, jyA, _wA);
        }), _wA && _wA.addEventListener("focus", () => Iw({}, jyA, _wA)), _wA && _wA.addEventListener("click", e => {
            e.preventDefault(), Iw({
                focus: !0
            }, jyA, _wA);
        }), By.addEventListener("pointerleave", Ow), By.addEventListener("pointerenter", Rw), 
        jy.addEventListener("pointerleave", Ow), jy.addEventListener("pointerenter", Rw), 
        jyA && jyA.addEventListener("pointerleave", Ow), jyA && jyA.addEventListener("pointerenter", Rw), 
        e.byId("backToProfileAddMenu") && e.byId("backToProfileAddMenu").addEventListener("click", () => {
            Sw(), _w.focus({
                preventScroll: !0
            });
        }), e.byId("backToProfileAddMenuFromArchetypes") && e.byId("backToProfileAddMenuFromArchetypes").addEventListener("click", () => {
            Sw(), _wA && _wA.focus({
                preventScroll: !0
            });
        }), jy.addEventListener("click", e => sxSampleMenuClick(jy, e)), jyA && jyA.addEventListener("click", e => sxSampleMenuClick(jyA, e)),
        // Roster submenus (2026-11-22, Jason): each imported or built-in
        // roster gets its OWN entry in the add menu, beside Archetypes
        // and Samples. The skin loader creates those entries and menus
        // dynamically (rosters come and go per skin and per import), so
        // it wires them through this hook - the same open/close, hover,
        // delegation, and local-remove treatment the two static
        // submenus get, from the same in-scope helpers.
        window.__SX_WIRE_SAMPLE_SUBMENU = (entry, menu, back) => {
            if (!entry || !menu) return;
            entry.addEventListener("pointerenter", () => {
                Rw(), Iw({}, menu, entry);
            }), entry.addEventListener("focus", () => Iw({}, menu, entry)), entry.addEventListener("click", e => {
                e.preventDefault(), Iw({
                    focus: !0
                }, menu, entry);
            }), menu.addEventListener("pointerleave", Ow), menu.addEventListener("pointerenter", Rw), menu.addEventListener("click", e => sxSampleMenuClick(menu, e)), menu.addEventListener("click", e => {
                const t = e.target && e.target.closest ? e.target.closest("[data-remove-local-sample]") : null;
                if (!t) return;
                e.stopPropagation();
                sxRemoveLocalSample(t.getAttribute("data-remove-local-sample"));
            }), back && back.addEventListener("click", () => {
                Sw(), entry.focus({
                    preventScroll: !0
                });
            });
        },
        // Local-sample removal (2026-11-18): the Remove button under a
        // local sample in the Samples menu. It is not a sample-load
        // action, so the loader above ignores it; this listener handles
        // it separately.
        jy.addEventListener("click", e => {
            const t = e.target && e.target.closest ? e.target.closest("[data-remove-local-sample]") : null;
            if (!t) return;
            e.stopPropagation();
            sxRemoveLocalSample(t.getAttribute("data-remove-local-sample"));
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
        }), ym.addEventListener("cancel", Lw), /* Pointer dismissal: a pointerdown inside any OPEN registered submenu
            (roster + palimpsest stack flyouts, window.__SX_SAMPLE_SUBMENUS) counts as INSIDE.
            Those flyouts are siblings of the static menus, not children, so the jy/jyA/By
            containment tests alone read a layer-button press as an outside click and closed
            every menu on pointerdown — before mouseup, so the entry's click never fired and
            stack layers could not be loaded by mouse at all (2026-11-23). */ window.__sxOnPtr( e => {
            Oy.hidden || Oy.contains(e.target) || __sxClosestAction(e.target, "profileLoad") || kw(), 
            By.hidden || By.contains(e.target) || (window.__SX_SAMPLE_SUBMENUS || []).some(m => m && !m.hidden && m.contains(e.target)) || __sxClosestAction(e.target, "addProfile") || xw(), 
            (jy.hidden || jy.contains(e.target)) && (!jyA || jyA.hidden || jyA.contains(e.target)) || (window.__SX_SAMPLE_SUBMENUS || []).some(m => m && !m.hidden && m.contains(e.target)) || __sxClosestAction(e.target, "addProfile") || Sw();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && (Oy.hidden || kw(), By.hidden || xw(), jy.hidden || Sw(), !jyA || jyA.hidden || Sw());
        }), e.byId("closeTestResultLoader").onclick = () => Ui(kg), kg.addEventListener("click", e => {
            e.target === kg && performance.now() - 0 > 500 && Ui(kg);
        }), e.byId("closeProfileDetails").onclick = () => "about" === gw ? Ui(_g) : cw(), 
        _g.addEventListener("cancel", e => {
            e.preventDefault(), "about" === gw ? Ui(_g) : cw();
        }), e.byId("profileDialogEdit").onclick = () => {
            Hy && (mw("edit"), requestAnimationFrame(() => Hg.focus()));
        }, e.byId("addLocalSampleBtn") && e.byId("addLocalSampleBtn").addEventListener("click", sxSaveLocalSample), e.byId("profileArchetypeBtn") && e.byId("profileArchetypeBtn").addEventListener("click", sxArchetypeProjection), e.byId("keepEditingProfileDetails").onclick = lw, e.byId("discardProfileDetails").onclick = sw, 
        wm.addEventListener("cancel", e => {
            e.preventDefault(), lw();
        }), e.byId("saveProfileDetails").onclick = () => vw(), e.byId("saveActiveProfile").onclick = () => {
            const e = Mt;
            if (!e || !vt[e]) return;
            const n = window.Sexcapades2xRememberProfiles;
            if (!n || "function" != typeof n.saveOne || !n.saveOne(e)) return void tS("Could not save this profile on this device.", {
                tone: "error",
                persistent: !0
            });
            n.isEnabled && n.isEnabled() && n.saveNow && n.saveNow(), Vt(e), tS(`${wt[e]} saved on this device.`);
        };
        const Bw = e.byId("appAboutDialog");
        e.byId("openAppAbout") && e.byId("openAppAbout").addEventListener("click", () => {
            Wi(Bw), requestAnimationFrame(() => e.byId("closeAppAbout").focus());
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
            jY = ({ outline: "Hot list", kinktest: "KinkTest import", bdsmtest: "BDSMtest import", checklist: "Yes/No/Maybe checklist", fetlife: "FetLife import" })[kind] || "import", Vy = id => "outline" === kind ? Ms(id) : Ax(kind, mode, id), vw();
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
        // fix, 2026-10-22). It is a closed set - never extend it for
        // post-fix files - and it retires at v4.0.
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
        // canonical ids (t####) belong in this registry - a slug
        // spelling of a deleted topic is not buried; it parks like any
        // other unrecognized spelling.
        const BURIED_TOPIC_IDS = Object.freeze({
            t0001: "Direction (topic deleted)"
        });
        // Explicit ingest resolution order (E4b): a single incoming key
        // resolves through exactly these stages, in this order -
        // (1) a canonical topic id present in the catalog resolves from
        // the catalog alone and never consults any table; (2) the
        // generated slug for a current topic; (3) the FROZEN LEGACY
        // TABLE (Kw), whose target is a generated slug (resolved
        // through zw) or, defensively, a canonical id; (4) no
        // resolution - the caller parks the key. Burial is checked
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
            // legacy slug-resolution path - incoming keys are rewritten
            // through Vw, the generated slug->id map merged with the
            // FROZEN LEGACY TABLE (Kw). The frozen legacy rename table
            // and this slug-spelling resolution fallback retire at v4.0:
            // post-fix files travel by topic ID and never consult them.
            // They remain only so pre-fix slug-keyed files resolve one
            // last time, after which the profile re-saves by ID.
            // E4b: the rewrite map is built in the explicit resolution
            // order of resolveIngestKey - generated slugs (stage 2) are
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
                // a stated deep-red at import time - e.g. a payload carrying both
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
            // Only group records are touched - a non-group profile's
            // name is never rewritten, whatever it contains. Jw runs
            // on every load and activation, so a legacy name is
            // corrected the first time its tab renders, and zt marks
            // the correction for the persist path like any edit.
            const rec = ft[e];
            if (!rec || "group" !== rec.kind || !wt[e] || !String(wt[e]).includes("⊗")) return;
            wt[e] = String(wt[e]).split("⊗").join(sxPairJoin(sxNormalizePairOp(rec.pairOp)).trim()), zt(e);
        }
        // Duplicate tab labels (owner ruling, 2026-10-27): same-name
        // tabs are told apart by a dash-plus-number suffix on the TAB
        // LABEL ONLY, counting from 2 - the first tab keeps the plain
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
            /* Skin tabs (2026-11-17): show only this skin's profiles.
               Untagged = legacy, shows everywhere; unknown skin =
               fail-open, shows everything. Profiles for other skins stay
               in memory (no data deleted) — their tabs reappear on
               switch-back, when the restore seam re-activates the
               remembered one. */
            const sxCurSkin = window.__SX_ACTIVE_SKIN || null;
            const t = Object.keys(vt).filter(e => Boolean(wt[e]) && (!profileSkins[e] || !sxCurSkin || profileSkins[e] === sxCurSkin));
            Mt && !vt[Mt] && (Mt = null), It && !vt[It] && (It = null), document.documentElement.style.setProperty("--active-profile-color", Mt && vt[Mt] ? la(Mt) : "var(--focus)");
            const i = Yi(), r = Boolean(Kd()), o = i.length > 1, s = an && o, l = o || r, c = s || r, d = t.map(e => {
                sxNormalizePairName(e);
                if (Xw && Xw.id === e) return sxDupTabLabel(e, wt[e]), Zw(0, wt[e], `Rename ${wt[e]}`);
                const t = i.includes(e), n = la(e), o = sxDupTabLabel(e, wt[e]), s = Mt === e, l = Boolean(ft[e]), c = av(vpt[e]), d = Boolean(vht[e]), u = zi(2 * (c - 50)), h = yt[e] ? '<sup class="profile-tab-dirty" aria-hidden="true">*</sup>' : "", g = `<button type="button" class="profile-tab-veil${d ? " is-enabled" : ""}" data-profile-veil="${Hi(e)}" aria-controls="veilPopover" aria-expanded="false" aria-pressed="${d}" aria-label="${Hi(wt[e])} Veil ${d ? "on" : "off"}, level ${c}. Open Veil settings." title="Veil ${d ? "on" : "off"} · ${c}" style="--veil-color:${u}"><svg viewBox="0 0 24 16" aria-hidden="true" focusable="false"><path class="veil-icon-cloth" d="M12 2.4C9.1 2.4 6.7 2.9 4.9 3.8C5.4 7 5.2 10.2 3.5 13.6C5.4 12.6 7.2 12.3 9 13.4C10 12.6 11 12 12 11.7C13 12 14 12.6 15 13.4C16.8 12.3 18.6 12.6 20.5 13.6C18.8 10.2 18.6 7 19.1 3.8C17.3 2.9 14.9 2.4 12 2.4Z"/><path class="veil-icon-fold" d="M8.2 3.9C8.5 6.8 8.4 9.7 7.5 12.6M15.8 3.9C15.5 6.8 15.6 9.7 16.5 12.6M12 4.2V11.4"/></svg></button>`, heatBtn = `<button type="button" class="profile-tab-heat" data-profile-heat="${Hi(e)}" data-sx-term="heatMax,heatMin" aria-controls="heatPopover" aria-expanded="false" aria-label="${Hi(wt[e])} ${l ? "Group Heat" : "Heat"} ${Hi(sxHeatZone(sxHeatDisplayFor(e)))}. Open Heat settings." title="${l ? "Group Heat" : "Heat"} · ${Hi(sxHeatZone(sxHeatDisplayFor(e)))}"><svg class="sx-heat-flame" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path fill="currentColor" d="M8 14c-4-2-4-6-1-9 0 3 2 2 2-3 4 4 5 8-1 12Zm0 0c-2-1-2-3 0-5 2 2 2 4 0 5"/></svg><span class="sx-heat-zone">${Hi(sxHeatZone(sxHeatDisplayFor(e)))}</span><svg class="sx-heat-flame" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path fill="currentColor" d="M8 14c-4-2-4-6-1-9 0 3 2 2 2-3 4 4 5 8-1 12Zm0 0c-2-1-2-3 0-5 2 2 2 4 0 5"/></svg></button>`, loadBtn = `<button type="button" class="profile-tab-load" data-profile-load="${Hi(e)}" aria-haspopup="menu" aria-expanded="false" aria-label="Load or import data for ${Hi(wt[e])}" title="Load or import data for ${Hi(wt[e])}" data-ui-tooltip="Take a test or import profile data." data-tooltip-tap-first><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v10"/><path d="m7 9 5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg></button>`;
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
            k.hidden = !o, k.textContent = an ? "Hide group overlay" : "Show group overlay", k.title = an ? "Hide the selected profiles’ comparison overlay" : "Show the selected profiles’ comparison overlay", 
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
        /* Skin switch: clear the profiles off the viewport, keep them in
           memory (2026-11-17). A skin switch swaps the taxonomy, widgets
           and layout but never touched profile state, so the old skin's
           profile kept driving the new skin's map. The clear remembers
           the outgoing skin's active profile + comparison set per skin,
           then mirrors the viewport-clear half of nk() WITHOUT its data
           deletion (no Reflect.deleteProperty — the profiles stay in
           vt/wt/notes/veils/drafts, and the dirty flags + beforeunload
           guard survive). The restore re-activates the remembered
           profile on switch-back via Js(). Tabs are NOT hidden — Jw()
           still lists every profile in memory, just not active; that is
           the mechanism by which profiles "reappear". */
        let sxSkinActiveProfile = Object.create(null);
        window.__SX_CLEAR_VIEWPORT_PROFILES = function (outgoingSkinId) {
            try {
                sxSkinActiveProfile[outgoingSkinId] = { activeId: Mt, comparisonIds: Array.from(en) };
                sxSel(null, "clear");
                Mt = null, It = null, Nt = null, Lt = null, Pt = "all", Tt = "", kn = !0, xn = null, Sn = "all",
                rn.clear(), on.clear(), h.forEach(e => {
                    rn.add(e.name), un.set(catId(e.name), "all"), (e.subcategories || []).forEach(t => {
                        const s = Un(e.name, t.name);
                        un.set(s, "all"), on.add(s);
                    }), e.topics.forEach(e => {
                        un.set(Wn(e), "all"), on.add(Wn(e));
                    });
                }), Ct = !1, Jw(), Mr(), Ih();
            } catch (_) {}
        };
        window.__SX_RESTORE_VIEWPORT_PROFILES = function (incomingSkinId) {
            try {
                const remembered = sxSkinActiveProfile[incomingSkinId];
                if (remembered && remembered.activeId && vt[remembered.activeId]) {
                    Js(remembered.activeId);
                    if (remembered.comparisonIds && remembered.comparisonIds.length > 1)
                        sxSel(remembered.comparisonIds, "set");
                }
                /* Rebuild the tabs in all cases: with no remembered
                   profile this hides the old skin's tabs under the new
                   skin's filter (Jw() is the only tab render), and with
                   a restored comparison set it re-shows the match icons
                   — Js's own Jw runs before the set is re-applied, so
                   without this the bowtie/circle-dot buttons stay gone. */
                Jw();
            } catch (_) {}
        };
        function ik(e) {
            const t = "profile-" + (Hn(e) || "untitled");
            let n = t, i = 2;
            for (;vt[n]; ) n = t + "-" + i++;
            return n;
        }
        function ak(e, t = {}) {
            Xw = null, Js(e, t);
        }
