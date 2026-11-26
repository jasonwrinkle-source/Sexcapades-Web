        function sxPersistIntensity(topicId, value, profileId) {
            const v = Math.max(-400, Math.min(400, Math.round(Number(value) || 0)));
            sxStoreFlankRating(topicId, "intensity", v, !1, profileId || null);
            return v;
        }
        // Dual placements apply on every stance skin, and -- since
        // 2026-11-22 -- on n-pole topics on the classic skin too, where
        // the placements are named give/receive. Single and dual topics
        // on the classic skin keep the flat behavior.
        function sxDualPlacements(topicId) {
            if (window.__SX_ACTIVE_SKIN && "sexcapades" !== window.__SX_ACTIVE_SKIN) return !0;
            if (!topicId) return !1;
            const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(topicId) : null;
            return Boolean(shape && shape.keys && shape.keys.length >= 3);
        }
        // One placement write. `side` is "advocacy" or "receptivity"
        // (give / receive on the classic skin). `value` is the line
        // number, or the placement fields. Advocacy is mirrored onto
        // the flat record so the two cannot disagree. Receptivity is
        // stored on its own object and is not copied onto the line.
        // Callers that pass a partial object must copy the keys they
        // want kept; this replaces that side's object.
        function sxWritePlacement(topicId, side, value, profileId) {
            if ("number" == typeof value) value = { line: Math.max(-100, Math.min(100, Math.round(value))) };
            if (!value || "object" != typeof value) return;
            const mode = "receptivity" === side ? "receptivity" : "advocacy";
            let r = profileId && vt[profileId] ? profileId : (Mt && vt[Mt] ? Mt : Et);
            if (typeof sxIsPseudoProfile === "function" && sxIsPseudoProfile(r)) return;
            if (r === Et && typeof sxAllocateProfileId === "function" && typeof SX_PROFILE_RECORD_LISTS !== "undefined") {
                const pid = sxAllocateProfileId("New profile");
                SX_PROFILE_RECORD_LISTS.forEach(k => k[pid] = {});
                wt[pid] = "New profile";
                vt[pid] = {};
                sxAdoptDraftRatings(pid);
                Mt = pid;
                if (typeof Go !== "undefined" && Go === Et) Go = pid;
                if (typeof sxAutoSelect === "function") sxAutoSelect(pid);
                r = pid;
                if (typeof sxRenderProfileTabs === "function") sxRenderProfileTabs();
            }
            const o = sxRatingsForProfile(r);
            const existing = o[topicId] && typeof o[topicId] === "object" ? Object.assign({}, o[topicId]) : {};
            const isClassic = !window.__SX_ACTIVE_SKIN || window.__SX_ACTIVE_SKIN === "sexcapades";
            if (isClassic) {
                // Classic placements (2026-11-22): on the sex skin an
                // n-pole topic stores give/receive PLACEMENTS --
                // { give: {...poles, intensity}, receive: {...} } --
                // mirroring advocacy/receptivity on stance skins (mode
                // "advocacy" writes give, "receptivity" writes receive);
                // the give placement mirrors flat, as advocacy does.
                const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(topicId, r) : null;
                if (shape && shape.keys && shape.keys.length > 2) {
                    const placement = Object.assign({}, value);
                    if (mode === "receptivity") {
                        existing.receive = placement;
                        if (!existing.give) {
                            const gv = {};
                            let hasGv = false;
                            Object.keys(existing).forEach(k => {
                                if (k !== "give" && k !== "receive" && k !== "advocacy" && k !== "receptivity") {
                                    gv[k] = existing[k];
                                    hasGv = true;
                                }
                            });
                            if (hasGv) existing.give = gv;
                        }
                    } else {
                        existing.give = placement;
                        Object.keys(placement).forEach(k => { existing[k] = placement[k]; });
                    }
                    o[topicId] = existing;
                    sxTouchProfile(r);
                    sxDropAttentionNode(topicId, r);
                    return;
                }
                Object.keys(value).forEach(k => { existing[k] = value[k]; });
                o[topicId] = existing;
                sxTouchProfile(r);
                sxDropAttentionNode(topicId, r);
                return;
            }
            const placement = Object.assign({}, value);
            if (mode === "receptivity") {
                existing.receptivity = placement;
                if (!existing.advocacy) {
                    const adv = {};
                    let hasAdv = false;
                    Object.keys(existing).forEach(k => {
                        if (k !== "advocacy" && k !== "receptivity") {
                            adv[k] = existing[k];
                            hasAdv = true;
                        }
                    });
                    if (hasAdv) existing.advocacy = adv;
                }
            } else {
                existing.advocacy = placement;
                Object.keys(placement).forEach(k => { existing[k] = placement[k]; });
            }
            o[topicId] = existing;
            sxTouchProfile(r);
            sxDropAttentionNode(topicId, r);
            return existing;
        }
        function sxPersistAdvocacyReceptivity(topicId, mode, values, intensity, profileId) {
            const value = Object.assign({}, values || {});
            if (null != intensity) value.intensity = intensity;
            return sxWritePlacement(topicId, mode, value, profileId);
        }
        window.sxWritePlacement = sxWritePlacement;
        // Map triad. One control and one puck. The list is the product
        // choice: a second entry would be a second puck and a second
        // stored side. The map paints whatever this returns.
        function sxMapTriadSides() {
            return [ "advocacy" ];
        }
        function sxMapTriadPuckAt(V0, V1, V2, w0, w1, w2) {
            return {
                x: w0 * V0.x + w1 * V1.x + w2 * V2.x,
                y: w0 * V0.y + w1 * V1.y + w2 * V2.y
            };
        }
        function sxMapTriadModel(V0, V1, V2, values) {
            const r0 = Number(values && values[0]) || 0, r1 = Number(values && values[1]) || 0, r2 = Number(values && values[2]) || 0;
            const m0 = Math.abs(r0), m1 = Math.abs(r1), m2 = Math.abs(r2), tot = m0 + m1 + m2;
            const w0 = tot > 0 ? m0 / tot : 1 / 3, w1 = tot > 0 ? m1 / tot : 1 / 3, w2 = tot > 0 ? m2 / tot : 1 / 3;
            const at = sxMapTriadPuckAt(V0, V1, V2, w0, w1, w2);
            return {
                weights: { w0: w0, w1: w1, w2: w2 },
                hit: { cls: "direction-hit map-triangle-hit", points: [ V0, V1, V2 ] },
                pucks: sxMapTriadSides().map(side => ({ side: side, x: at.x, y: at.y, cls: "slider-thumb map-triangle-puck" }))
            };
        }
        function sxStoreMapTriad(topicId, values, profileId) {
            const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(topicId) : null;
            const keys = shape && shape.keys || [];
            const pid = profileId || (typeof sxActiveProfileId === "function" ? sxActiveProfileId() : null);
            const rec = typeof sxDecodeTopicStance === "function" ? sxDecodeTopicStance(topicId, pid) : null;
            const prev = rec && rec.advocacy && "object" == typeof rec.advocacy ? rec.advocacy : {};
            const obj = {};
            Object.keys(prev).forEach(k => { if ("known" !== k) obj[k] = prev[k]; });
            keys.forEach((k, i) => { obj[k] = Math.max(-100, Math.min(100, Math.round(Number(values[i]) || 0))); });
            const side = sxMapTriadSides()[0];
            if (typeof sxWritePlacement === "function") return sxWritePlacement(topicId, side, obj, pid);
            keys.forEach((k, i) => sxStoreFlankRating(topicId, k, obj[k], !1, pid));
        }
        // One advocacy write for a full set of pole values. A drag that
        // used to call sxStoreFlankRating once per pole now lands here.
        // The object keeps the keys already stored on that side, then
        // replaces every pole. Intensity stays a separate write.
        function sxStorePolygon(topicId, values, paint, profileId) {
            const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(topicId, profileId) : null;
            const keys = shape && shape.keys || [];
            if (!topicId || !keys.length || !values || !values.length || values.length > keys.length) return;
            const useKeys = keys.slice(0, values.length);
            const nums = useKeys.map((k, i) => Math.max(-100, Math.min(100, Math.round(Number(values[i]) || 0))));
            const dual = typeof sxDualPlacements === "function" && sxDualPlacements(topicId) && typeof sxWritePlacement === "function";
            if (!dual) {
                useKeys.forEach((k, i) => sxStoreFlankRating(topicId, k, nums[i], !!(paint && i === useKeys.length - 1), profileId || null));
                return;
            }
            let r = profileId && vt[profileId] ? profileId : (Mt && vt[Mt] ? Mt : Et);
            if (typeof sxIsPseudoProfile === "function" && sxIsPseudoProfile(r)) return;
            if (r === Et && typeof sxAllocateProfileId === "function" && typeof SX_PROFILE_RECORD_LISTS !== "undefined") {
                const pid = sxAllocateProfileId("New profile");
                SX_PROFILE_RECORD_LISTS.forEach(k => k[pid] = {});
                wt[pid] = "New profile";
                vt[pid] = {};
                sxAdoptDraftRatings(pid);
                Mt = pid;
                if (typeof Go !== "undefined" && Go === Et) Go = pid;
                if (typeof sxAutoSelect === "function") sxAutoSelect(pid);
                r = pid;
                if (typeof sxRenderProfileTabs === "function") sxRenderProfileTabs();
            }
            const rec = sxRatingsForProfile(r)[topicId];
            const bag = rec && "object" == typeof rec ? rec : {};
            const classic = !window.__SX_ACTIVE_SKIN || "sexcapades" === window.__SX_ACTIVE_SKIN;
            const sideKey = classic ? "give" : "advocacy";
            const prev = bag[sideKey] && "object" == typeof bag[sideKey] ? bag[sideKey] : {};
            const obj = {};
            Object.keys(prev).forEach(k => { if ("known" !== k) obj[k] = prev[k]; });
            useKeys.forEach(k => {
                if (Object.prototype.hasOwnProperty.call(obj, k)) return;
                if (Object.prototype.hasOwnProperty.call(bag, k) && "object" != typeof bag[k]) obj[k] = bag[k];
            });
            if (Object.prototype.hasOwnProperty.call(bag, "line") && !Object.prototype.hasOwnProperty.call(obj, "line")) obj.line = bag.line;
            useKeys.forEach((k, i) => { obj[k] = nums[i]; });
            sxWritePlacement(topicId, "advocacy", obj, r);
            useKeys.forEach(k => { if (typeof sxSetFlankSource === "function") sxSetFlankSource(r, topicId, k, "manual"); });
            if (paint) sxRequestMapPaint();
        }
        window.sxMapTriadSides = sxMapTriadSides;
        window.sxStoreMapTriad = sxStoreMapTriad;
        window.sxStorePolygon = sxStorePolygon;
        function sxClearAdvocacyReceptivity(topicId, mode, profileId) {
            let r = profileId && vt[profileId] ? profileId : (Mt && vt[Mt] ? Mt : Et);
            if (!r || !vt[r] || !vt[r][topicId]) return;
            const existing = vt[r][topicId];
            if (typeof existing !== "object") {
                delete vt[r][topicId];
            } else if (mode === "receptivity") {
                delete existing.receptivity;
                delete existing.receive;
            } else {
                delete existing.advocacy;
                delete existing.give;
                const shape = typeof sxWidgetConfig === "function" ? sxWidgetConfig(topicId, r) : null;
                if (shape && shape.keys) shape.keys.forEach(k => delete existing[k]);
                delete existing.intensity;
                if (!existing.receptivity && !existing.receive) delete vt[r][topicId];
            }
            sxTouchProfile(r);
            sxDropAttentionNode(topicId, r);
        }
