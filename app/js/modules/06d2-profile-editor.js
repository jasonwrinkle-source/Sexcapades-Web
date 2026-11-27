        const rv = e.byId("audienceView"), ov = e.byId("veilControl"), sv = e.byId("veilTrigger"), lv = e.byId("veilEnabled"), cv = e.byId("tabVeilEnabled"), dv = e.byId("veilPopover"), uv = e.byId("veilTooltip"), pv = e.byId("audienceVeilSlider"), hv = e.byId("audienceVeilValue"), qzv = e.byId("audienceVeilZone"), gv = e.byId("audienceVeilProfile"), mv = e.byId("audienceVeilHelp"), fv = mv.textContent;
        let yv = 0, bv = sv;
        function sxResolveVeilProfile() {
            return Qt && vt[Qt] ? Qt : Mt && vt[Mt] ? Mt : null;
        }
        function sxFindVeilButton(e) {
            return [ ...tl.querySelectorAll("[data-profile-veil]") ].find(t => t.dataset.profileVeil === e) || null;
        }
        function sxPaintVeilButton(e) {
            if (!e || !vt[e]) return;
            const t = sxClampVeilLevel(vpt[e]), n = Boolean(vht[e]), i = sxInterestColor(2 * (t - 50)), a = sxFindVeilButton(e), r = a && a.parentElement?.querySelector(".profile-tab-button");
            a && (a.classList.toggle("is-enabled", n), a.style.setProperty("--veil-color", i),
            a.setAttribute("aria-pressed", String(n)), a.setAttribute("aria-label", `${wt[e] || "Profile"} Veil ${n ? "on" : "off"}, level ${t}. Open Veil settings.`),
            a.title = `Veil ${n ? "on" : "off"} · ${t}`), r && (r.classList.toggle("has-veil", n),
            r.style.setProperty("--veil-color", i), r.setAttribute("aria-label", `${(r.getAttribute("aria-label") || "").replace(/,?\s*Veil on at \d+/, "")}${n ? `, Veil on at ${t}` : ""}`.replace(/,\s*,/g, ",").replace(/,\s*$/, "")));
        }
        function sxPlaceVeilPopover() {
            if (dv.hidden) return;
            const e = (bv && bv.isConnected ? bv : sv).getBoundingClientRect(), t = dv.getBoundingClientRect(), n = e.right + 7, i = n + t.width <= innerWidth - 10 ? n : e.left - t.width - 7;
            dv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, i))}px`, dv.style.top = `${Math.max(10, Math.min(innerHeight - t.height - 10, e.top + e.height / 2 - t.height / 2))}px`,
            dv.style.right = "auto";
        }
        function sxPlaceVeilTooltip() {
            if (uv.hidden) return;
            const e = sv.getBoundingClientRect(), t = uv.getBoundingClientRect(), n = e.left + e.width / 2 - t.width / 2;
            uv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, n))}px`;
            const i = e.top - t.height - 7, a = e.bottom + 7;
            uv.style.top = `${i >= 10 ? i : Math.min(innerHeight - t.height - 10, a)}px`;
        }
        function sxShowVeilTooltip(e = !1) {
            sv.disabled || (t.clear(yv), uv.hidden = !1, sxPlaceVeilTooltip(), e && (yv = t.setTimeout(() => {
                uv.hidden = !0;
            }, 2400)));
        }
        function sxHideVeilTooltip() {
            t.clear(yv), uv.hidden = !0;
        }
        function sxSetVeilPopoverOpen(e, t = !1) {
            dv.hidden = !e, sv.setAttribute("aria-expanded", String(e && bv === sv)), tl.querySelectorAll("[data-profile-veil]").forEach(t => t.setAttribute("aria-expanded", String(e && t === bv))),
            e && requestAnimationFrame(() => {
                sxPlaceVeilPopover(), t && !pv.disabled ? pv.focus({
                    preventScroll: !0
                }) : t && cv.focus({
                    preventScroll: !0
                });
            });
        }
        function sxCloseVeilPopover(e = !1) {
            const t = bv;
            sxSetVeilPopoverOpen(!1), Qt = null, bv = sv, e && t && t.isConnected && t.focus({
                preventScroll: !0
            });
        }
        function sxRefreshVeilControls() {
            const e = Mt && vt[Mt] ? Mt : null;
            if (rv.hidden = !e, e) {
                const t = sxClampVeilLevel(vpt[e]), n = Boolean(vht[e]);
                hv.value = String(t), hv.textContent = String(t), lv.checked = n, ov.classList.toggle("is-enabled", n),
                sv.disabled = !1, sv.setAttribute("aria-disabled", String(!n)), sv.style.background = sxInterestColor(2 * (t - 50)),
                sv.setAttribute("aria-label", `Intimacy Veil ${t}. ${n ? "Open rating scale." : "Enable Intimacy Veil to adjust."}`);
            } else sv.disabled = !0, lv.checked = !1, ov.classList.remove("is-enabled");
            const t = sxResolveVeilProfile();
            if (!t) return void (dv.hidden || sxCloseVeilPopover());
            const n = sxClampVeilLevel(vpt[t]), i = Boolean(vht[t]);
            pv.value = String(n), qzv && (qzv.textContent = veilZoneText(n)), pv.disabled = !i, cv.checked = i, cv.setAttribute("aria-label", `${i ? "Disable" : "Enable"} Intimacy Veil for ${wt[t] || "this profile"}`),
            dv.classList.toggle("is-enabled", i), gv.textContent = wt[t] || "Active profile",
            pv.setAttribute("aria-label", `Intimacy Veil for ${wt[t] || "the active profile"}`), dv.classList.remove("is-clear-preview"),
            mv.textContent = fv;
        }
        function sxSetVeilEnabled(e, t) {
            if (!e || !vt[e]) return;
            const n = Boolean(vht[e]) !== Boolean(t);
            vht[e] = Boolean(t), n && sxTouchProfile(e), sxRefreshVeilControls(), sxPaintVeilButton(e), sxRefreshMatchTabs(), sxRefreshSyncGlance();
            (e === Mt || (typeof sxGroupDependsOn === "function" && sxGroupDependsOn(Mt, e)) || (typeof sxScoringProfileIds === "function" && sxScoringProfileIds().includes(e))) && sxRequestMapPaint();
        }
        let Pv = 0;
        sv.addEventListener("pointerenter", () => sxShowVeilTooltip()), sv.addEventListener("pointerleave", () => {
            dv.hidden && sxHideVeilTooltip();
        }), sv.addEventListener("focus", () => sxShowVeilTooltip()), sv.addEventListener("blur", () => {
            dv.hidden && sxHideVeilTooltip();
        }), sv.addEventListener("click", e => {
            e.preventDefault();
            const t = Mt && vt[Mt] ? Mt : null;
            sxShowVeilTooltip(!0), t && vht[t] && (Qt = t, bv = sv, sxRefreshVeilControls(), sxSetVeilPopoverOpen(!0, !0));
        }), lv.addEventListener("change", () => {
            const e = Mt && vt[Mt] ? Mt : null;
            e && (Qt = e, bv = sv, sxSetVeilEnabled(e, lv.checked));
        }), cv.addEventListener("change", () => {
            const e = sxResolveVeilProfile();
            e && sxSetVeilEnabled(e, cv.checked);
        }), window.__sxOnPtr( e => {
            dv.hidden || dv.contains(e.target) || __sxClosestAction(e.target, "profileVeil") || rv.contains(e.target) || (sxCloseVeilPopover(),
            sxHideVeilTooltip());
        }, !0), window.__sxOnKey( e => {
            "Escape" !== e.key || dv.hidden || (e.preventDefault(), sxHideVeilTooltip(), sxCloseVeilPopover(!0));
        }), window.addEventListener("resize", () => {
            sxPlaceVeilPopover(), sxPlaceVeilTooltip();
        }), pv.addEventListener("input", () => {
            const e = sxResolveVeilProfile();
            if (!e) return sxRefreshVeilControls();
            const t = sxClampVeilLevel(pv.value);
            vpt[e] = t, sxTouchProfile(e), sxPaintVeilButton(e), qzv && (qzv.textContent = veilZoneText(t)), e === Mt && (hv.value = String(t), hv.textContent = String(t),
            sv.style.background = sxInterestColor(2 * (t - 50)), sv.setAttribute("aria-label", `Intimacy Veil ${t}. Open rating scale.`)),
            sxRefreshMatchTabs(), sxRefreshSyncGlance();
            const activeAffected = e === Mt || (typeof sxGroupDependsOn === "function" && sxGroupDependsOn(Mt, e)) || (typeof sxScoringProfileIds === "function" && sxScoringProfileIds().includes(e));
            (vht[e] || activeAffected) && (Pv && cancelAnimationFrame(Pv), Pv = requestAnimationFrame(() => {
                Pv = 0, sxRequestMapPaint({
                    animate: !1,
                    forceRepaint: !0
                });
            }));
        });
        let Lv = null;
        function sxIsPointerOffVeil(e) {
            const t = pv.getBoundingClientRect(), n = .08 * t.height;
            return e.clientY < t.top - n || e.clientY > t.bottom + n;
        }
        function sxPreviewVeilOff(e) {
            dv.classList.toggle("is-clear-preview", e), mv.textContent = e ? "Release to turn off Veil." : fv,
            pv.setAttribute("aria-valuetext", e ? "Release to turn off" : String(pv.value));
        }
        function sxFinishVeilDrag(e) {
            if (!Lv || Lv.pointerId !== e.pointerId) return;
            const t = Lv;
            Lv = null;
            const n = "pointerup" === e.type && (t.clearing || sxIsPointerOffVeil(e));
            if (sxPreviewVeilOff(!1), !n) return sxCloseVeilPopover(), void sxHideVeilTooltip();
            vpt[t.id] = t.startValue, sxSetVeilEnabled(t.id, !1), sxCloseVeilPopover(), sxHideVeilTooltip();
        }
        pv.addEventListener("pointerdown", e => {
            const t = sxResolveVeilProfile();
            if (t && vht[t]) {
                Lv = {
                    pointerId: e.pointerId,
                    id: t,
                    startValue: sxClampVeilLevel(vpt[t]),
                    clearing: !1
                };
                try {
                    pv.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
            }
        }), pv.addEventListener("pointermove", e => {
            Lv && Lv.pointerId === e.pointerId && (Lv.clearing = sxIsPointerOffVeil(e), sxPreviewVeilOff(Lv.clearing));
        }), pv.addEventListener("pointerup", sxFinishVeilDrag), pv.addEventListener("pointercancel", sxFinishVeilDrag);
        /* B3 (SURFACES): the per-tab Heat button + its popover. Heat is
           SESSION state only (sxcv.heat + sxcvSave()); it never joins the
           profile store's maps, the collect/export snapshot, or either
           payload format. Group Heat is the same session state
           (sxcv.groupHeat, keyed by group profile id); the one popover
           serves both, branching on the group record. A member's heat
           change updates dependent groups' default heat (the lower of
           the members' heats) and refreshes the pair/group map and
           match lists live. The popover lifecycle mirrors the Veil
           popover's (open/close/outside-click/Escape). */
        let sxHeatQt = null, sxHeatBv = null, sxHeatRaf = 0;
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
            const scaleSpans = pop.querySelectorAll(".veil-scale > span:not(.veil-track-wrap)");
            scaleSpans.length >= 2 && (scaleSpans[0].textContent = sxTerm("heatMax"), scaleSpans[scaleSpans.length - 1].textContent = sxTerm("heatMin"));
            sl && (sl.value = String(v)), out && (out.textContent = `${sxHeatZone(v)} · ${v > 0 ? "+" + v : v}`),
            nm && (nm.textContent = wt[t] || "Profile"), sl && sl.setAttribute("aria-label", `${grp ? "Group heat" : "Heat"} for ${wt[t] || (grp ? "the group" : "the profile")}`);
            /* (c) A couple's heat is derived from its two members, so
               its slider is read-only — dragging it would set a value
               that never sticks. The slider shows the derived value. */
            const isCouple = typeof sxIsCouple === "function" && sxIsCouple(t);
            sl && (sl.disabled = isCouple);
            if (isCouple) {
                sl && sl.setAttribute("aria-label", "Couple heat — derived from the two members. Change a partner's own heat to move it.");
                out && (out.textContent = `${sxHeatZone(v)} · ${v > 0 ? "+" + v : v} (from the two members)`);
            }
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
            /* (c) A couple has no heat of its own — its shown heat is
               derived from its two members. Do not store a group
               override for a couple (sxGroupHeatFor ignores one), or
               the slider would appear to set a heat that never sticks.
               Change a partner's own heat to move the couple's. */
            (typeof sxIsCouple === "function" && sxIsCouple(t)) ? null : (sxIsGroup(t) ? sxcv.groupHeat[t] = v : sxcv.heat[t] = v, sxcvSave()),
            sxRefreshGroupOwn(t), sxMvHeat(), sxKvHeat(t), Object.keys(ft).forEach(gId => {
                ft[gId] && "group" === ft[gId].kind && vt[gId] && sxKvHeat(gId);
            }), sxRefreshMatchTabs(), sxRefreshSyncGlance();
            try { window.SexcapadesEngine?.Map?.invalidateVault(t); } catch (_) {}
            const activeAffected = t === Mt || (typeof sxGroupDependsOn === "function" && sxGroupDependsOn(Mt, t)) || (typeof sxScoringProfileIds === "function" && sxScoringProfileIds().includes(t));
            activeAffected && (sxHeatRaf && cancelAnimationFrame(sxHeatRaf), sxHeatRaf = requestAnimationFrame(() => {
                sxHeatRaf = 0, sxRequestMapPaint({
                    animate: !1,
                    forceRepaint: !0
                });
            }));
        }), window.__sxOnPtr( ev2 => {
            const pop = e.byId("heatPopover");
            !pop || pop.hidden || pop.contains(ev2.target) || __sxClosestAction(ev2.target, "profileHeat") || sxCvHeat();
        }, !0), window.__sxOnKey( ev2 => {
            if ("Escape" !== ev2.key) return;
            const pop = e.byId("heatPopover");
            pop && !pop.hidden && (ev2.preventDefault(), sxCvHeat(!0));
        }), window.addEventListener("resize", () => sxPosHeat());
        const _v = [ "telegram", "linktree", "fetlife", "chaturbate", "stripchat", "myfreecams", "pornhub", "xvideos", "xhamster", "onlyfans", "reddit", "x" ];
        function sxNormalizeSiteUsername(e) {
            let t = String(e || "").trim().replace(/[\r ]/g, "").replace(/^@/, "").slice(0, 100);
            try {
                /^https?:\/\//i.test(t) && (t = new URL(t).pathname.split("/").filter(Boolean).pop() || "");
            } catch (e) { __sxErrLog("app", e); }
            return /^[a-z0-9_.-]{1,100}$/i.test(t) ? t : "";
        }
        function sxNormalizeContactRecord(e) {
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
            _v.forEach(e => n[e] = sxNormalizeSiteUsername(t[e] || "")), n.phone = String(t.phone || "").trim().replace(/[\r ]/g, " ").replace(/\s+/g, " ").slice(0, 60);
            const i = String(t.email || "").trim().replace(/[\r ]/g, "").slice(0, 254);
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i) && (n.email = i), Array.isArray(t.customSites) && t.customSites.slice(0, 20).forEach(e => {
                if (e && "object" == typeof e) {
                    const t = String(e.site || "").trim().slice(0, 60), i = String(e.url || "").trim().slice(0, 500), a = sxNormalizeSiteUsername(e.username || "");
                    t && i && /^https?:\/\//i.test(i) && a && n.customSites.push({
                        site: t,
                        url: i,
                        username: a
                    });
                }
            }), n;
        }
        function sxCountFilledContacts(e) {
            const t = sxNormalizeContactRecord(e);
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
            el.className = "profile-contact-block", n(el, `<div class="profile-contact-block-main"><input class="profile-contact-block-username" type="text" maxlength="100" placeholder="username" aria-label="Username" autocomplete="off"><select class="profile-contact-block-site" aria-label="Site for this username"><option value="">Choose a site\u2026</option>${CONTACT_BLOCK_SITES.map(e => `<option value="${sxEscapeHtmlText(e.value)}">${sxEscapeHtmlText(e.label)}</option>`).join("")}</select><span class="profile-contact-block-actions"><button class="profile-contact-block-add" type="button" aria-label="Add another username">+</button><button class="profile-custom-site-remove profile-contact-block-remove" type="button" aria-label="Remove this username" hidden>\u00d7</button></span></div><div class="profile-contact-block-custom" hidden><input class="profile-contact-block-custom-site" type="text" maxlength="60" placeholder="Custom site name" aria-label="Custom site name"><input class="profile-contact-block-custom-url" type="url" maxlength="500" placeholder="https://..." aria-label="Custom site profile URL"><small class="profile-validation-message profile-contact-block-custom-error" hidden></small></div>`);
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
            const c = sxNormalizeContactRecord(contact), order = [], byUser = new Map(), get = u => {
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
        function sxFillContactFields(t) {
            const i = sxNormalizeContactRecord(t);
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
            const t = sxNormalizeContactRecord(raw);
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
        function sxEscapeVcardText(e) {
            return String(e || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, " ").replace(/,/g, "\\,").replace(/;/g, "\\;");
        }
        function sxUnescapeVcardText(e) {
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
        function sxBuildProfileVcardText(e) {
            const t = sxNormalizeContactRecord(ut[e]);
            if (!sxCountFilledContacts(t)) return "";
            const n = [ "BEGIN:VCARD", "VERSION:4.0", `FN:${sxEscapeVcardText(t.fullName || wt[e] || "Sexcapades profile")}` ];
            return t.phone && n.push(`TEL;TYPE=cell:${sxEscapeVcardText(t.phone)}`), t.email && n.push(`EMAIL:${sxEscapeVcardText(t.email)}`),
            _v.forEach(e => {
                t[e] && (n.push(`${Kv[e]}:${sxEscapeVcardText(t[e])}`), n.push(`URL;TYPE=x-${e}:${sxEscapeVcardText(sxBuildProfileSiteUrl(e, t[e]))}`));
            }), n.push("END:VCARD"), n.join("\r\n") + "\r\n";
        }
        function sxSanitizePhotoRecords(e) {
            if (!Array.isArray(e)) return [];
            const t = [];
            return e.slice(0, 8).forEach(e => {
                if (!e || "object" != typeof e || "string" != typeof e.data || !/^data:image\/(?:jpeg|png|webp|gif|svg\+xml);base64,[a-z0-9+/=\s]+$/i.test(e.data) || e.data.length > 65e5) return;
                const n = Math.max(1, Math.min(3e3, Number(e.width) || 1)), i = Math.max(1, Math.min(3e3, Number(e.height) || 1)), a = sxClampUnit(Number.isFinite(Number(e.cropX)) ? Number(e.cropX) : .5), r = sxClampUnit(Number.isFinite(Number(e.cropY)) ? Number(e.cropY) : .5), o = Math.max(1, Math.min(3, Number(e.cropZoom) || 1)), s = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), l = Math.abs(a - .5) > .001 || Math.abs(r - .5) > .001 || Math.abs(o - 1) > .001 || Math.abs(s) > .001, c = !0 === e.manualCrop || l;
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
        function sxClonePhotoRecords(e) {
            return sxSanitizePhotoRecords(e).map(e => Object.assign({}, e));
        }
        function sxNormalizeAgeText(e) {
            const t = Number.parseInt(String(e || "").trim(), 10);
            return Number.isInteger(t) && t >= 18 && t <= 120 ? String(t) : "";
        }
        function sxNormalizeLocationText(e) {
            return String(e || "").trim().replace(/\s+/g, " ").slice(0, 80);
        }
        function sxIdentityPlacardText(e) {
            const t = sxGenderLabelsText(rt[e]), n = sxOrientationLabelsText(ot[e]), i = sxRoleLabelsText(st[e]), a = sxNormalizeAgeText(lt[e]);
            return [ t || "Gender not set", n || "Orientation not set", i ? `Roles: ${i}` : "", a ? `Age ${a}` : "", sxNormalizeLocationText(ct[e]) ].filter(Boolean).join(" · ");
        }
        function sxCanRunProfileAction(e, t, n) {
            const i = sxMissingDetailKeys(e);
            return !i.length || (sxOpenProfileDetails(e) && (zy = {
                id: e,
                action: n
            }, sm.textContent = `Choose ${i.join(" and ")} before ${t}.`), !1);
        }
        function sxRenderPhotoThumbs() {
            dm.textContent = Wy.length ? `${Wy.length} attached${8 === Wy.length ? " · maximum" : ""}` : "none attached",
            e.byId("chooseProfilePhotos").disabled = Wy.length >= 8, n(cm, Wy.map((e, t) => `<div class="profile-photo-thumb${0 === t ? " is-center-photo" : ""}"><button class="profile-photo-preview" type="button" data-adjust-photo="${t}" aria-label="Adjust center crop for attached photo ${t + 1}"><svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><defs><clipPath id="profilePhotoDraftClip${t}"><circle cx="50" cy="50" r="49"/></clipPath></defs><g clip-path="url(#profilePhotoDraftClip${t})">${sxCroppedPhotoMarkup(e, {
                x: 0,
                y: 0,
                w: 100,
                h: 100
            })}</g><circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,.58)" stroke-width="2"/></svg><span class="profile-photo-crop-label">${0 === t ? "Center photo · adjust" : "Adjust crop"}</span></button><span class="profile-photo-order"><button type="button" data-move-photo="${t}" data-photo-step="-1" aria-label="Move attached photo ${t + 1} earlier" ${0 === t ? "disabled" : ""}>↑</button><button type="button" data-move-photo="${t}" data-photo-step="1" aria-label="Move attached photo ${t + 1} later" ${t === Wy.length - 1 ? "disabled" : ""}>↓</button></span><button class="profile-photo-remove" type="button" data-remove-photo="${t}" aria-label="Remove attached photo ${t + 1}">×</button></div>`).join(""));
        }
        function sxBuildDefaultCrop(e) {
            return {
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: e
            };
        }
        function sxCoerceDetectedCrop(e, t = "invalid-result") {
            return e && Number.isFinite(Number(e.cropX)) && Number.isFinite(Number(e.cropY)) ? {
                cropX: sxClampUnit(Number(e.cropX)),
                cropY: sxClampUnit(Number(e.cropY)),
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: String(e.focusStatus || "detected")
            } : sxBuildDefaultCrop(t);
        }
        async function sxDetectFaceCrop(e, n, i) {
            const a = Math.max(1, Number(n) || Number(e && e.width) || 1), r = Math.max(1, Number(i) || Number(e && e.height) || 1), o = {
                secureContext: window.isSecureContext,
                faceDetectorType: typeof window.FaceDetector
            };
            if ("function" !== o.faceDetectorType) return sxBuildDefaultCrop("unavailable");
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
                    return u && String(u.message || u), sxBuildDefaultCrop(e);
                }
                const g = h.boundingBox, m = Number.isFinite(Number(g.x)) ? Number(g.x) : Number(g.left) || 0, f = Number.isFinite(Number(g.y)) ? Number(g.y) : Number(g.top) || 0, y = sxCoerceDetectedCrop({
                    cropX: (m + Number(g.width) / 2) / a,
                    cropY: (f + Number(g.height) / 2) / r,
                    focusStatus: "detected"
                });
                return y.focusStatus, y.cropX, y.cropY, y;
            } catch (e) {
                return String(e && e.message || e), sxBuildDefaultCrop("error");
            } finally {
                s && "function" == typeof s.close && s.close();
            }
        }
        function sxPrepareUploadedPhoto(e) {
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
                        const d = sxCoerceDetectedCrop(await sxDetectFaceCrop(l, o, s));
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
        function sxMarkFieldInvalid(t, n, i, a = "") {
            const r = e.byId(t), o = e.byId(n);
            r && o && (r.classList.toggle("is-invalid", i), o.hidden = !i, a && (o.textContent = a),
            r.querySelectorAll("input,select,button").forEach(e => {
                i ? e.setAttribute("aria-invalid", "true") : e.removeAttribute("aria-invalid");
            }));
        }
        function sxEditorStateText() {
            const e = [ ..._g.querySelectorAll('input:not([type="file"]),textarea,select') ];
            return JSON.stringify(e.map(e => {
                const t = e instanceof HTMLSelectElement && e.multiple ? [ ...e.selectedOptions ].map(e => e.value) : e.value;
                return [ e.id, e.type, t, Boolean(e.checked) ];
            }));
        }
        function sxDiscardProfileEdits() {
            zy = null, Vy = null, jY = null, Hy = null, Wy = [], lm.value = "", Uy = "", Gy = [], sxCloseGenderPicker(),
            sxCloseOrientationPicker(), sxCloseRolePicker(), closeContactBlockMenus(), sxCloseModalDialog(wm), sxCloseModalDialog(_g);
        }
        function sxResumeProfileEditor() {
            sxCloseModalDialog(wm), sxOpenModalDialog(_g), requestAnimationFrame(() => {
                const e = _g.querySelector(".dialog-body");
                e && (e.scrollTop = Ky), Hg.focus({
                    preventScroll: !0
                });
            });
        }
        function sxPromptDiscardEdits() {
            if (sxCloseGenderPicker(), sxCloseOrientationPicker(), sxCloseRolePicker(), closeContactBlockMenus(), !function() {
                return sxEditorStateText() !== Uy || (t = Gy, !((e = Wy).length === t.length && e.every((e, n) => {
                    const i = t[n] || {};
                    return [ ...new Set([ ...Object.keys(e || {}), ...Object.keys(i) ]) ].every(t => (e || {})[t] === i[t]);
                })));
                var e, t;
            }()) return void sxDiscardProfileEdits();
            const t = _g.querySelector(".dialog-body");
            Ky = t ? t.scrollTop : 0, e.byId("discardProfileDetailsQuestion").textContent = Hy ? "Changes made in this profile editor have not been saved." : "This new profile has not been created.",
            sxCloseModalDialog(_g), sxOpenModalDialog(wm), requestAnimationFrame(() => e.byId("keepEditingProfileDetails").focus());
        }
        function sxRefreshAboutCounts() {
            am.textContent = `${im.value.length}/${im.maxLength} characters`, om.textContent = `${rm.value.length}/${rm.maxLength} characters`;
        }
