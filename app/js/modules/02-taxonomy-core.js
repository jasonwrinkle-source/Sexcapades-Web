        h.forEach(e => {
            rn.add(e.name), un.set(catId(e.name), "all"), (e.subcategories || []).forEach(t => {
                const n = Un(e.name, t.name);
                un.set(n, "all"), mn.expandAll && on.add(n);
            }), e.topics.forEach(t => {
                const n = Wn(t);
                un.set(n, "all"), mn.expandAll && on.add(n);
            });
        });
        const fn = new Map;
        let yn = null, bn = 0, vn = null, wn = !1, kn = !0, xn = null, Sn = "all", $n = null, En = !1;
        const An = {
            compact: 12,
            roomy: 20,
            all: Number.POSITIVE_INFINITY
        };
        // Group C1 (Build 2026-10-16_1830): map detail levels. Compact/Medium cap how
        // many child topics an expanded category or subcategory branch shows, most
        // popular first; rated topics always show regardless of the cap.
        // Build 2026-10-17_1447: the map now OPENS in Medium — each expanded
        // branch shows its 7 most popular topics (popularity order, same
        // ordering as list view) instead of every topic. The Compact/Medium/
        // Full toggle in the map controls still lets the user show fewer or
        // more, and the level persists across profile/tab switches.
        // Build 2026-10-18_0343: the map now OPENS in Full — every topic in
        // each expanded branch shows by default; the toggle still lets the
        // user drop back to Medium or Compact.
        let mapDetailLevel = "full";
        const DETAIL_CAPS = {
            compact: 4,
            medium: 7,
            full: Number.POSITIVE_INFINITY
        };
        function topicRatedForDetail(e, t = Vi()) {
            const n = da(e, t);
            return Boolean(n && (n.giveKnown || n.receiveKnown));
        }
        window.__SEXCAPADES_SET_MAP_DETAIL = function(level) {
            if (!Object.prototype.hasOwnProperty.call(DETAIL_CAPS, level) || level === mapDetailLevel) return;
            try { window.SexcapadesEngine?.Map?.invalidateVault(); } catch (_) {}
            mapDetailLevel = level, document.querySelectorAll("[data-detail-level]").forEach(e => e.setAttribute("aria-pressed", String(e.dataset.detailLevel === level))),
            Mr({
                animate: !1,
                forceRepaint: !0
            });
        };
        const Cn = e.byId("mapSvg"), Mn = e.byId("mapScene"), In = e.byId("mapLayer"), Pn = e.byId("mapDefs"), Ln = e.byId("mapSafeFallback"), Tn = e.byId("mapSafeMessage"), Fn = e.byId("mapSafeOpen"), Nn = e.byId("mapSafeReset");
        let Dn = !1, Rn = !1, On = null, Bn = [], jn = !1;
        const qn = {};
        let sxStemFinaliseHook = null;
        function Hn(e) {
            return String(e == null ? "" : e).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        }
        
        function sxName(e) {
            return e && "object" == typeof e ? String(e.name || "") : String(e || "");
        }
        const LEGACY_NODE_IDS = Object.freeze({
    "cat-power-exchange": "c0001",
    "cat-bondage-restriction": "c0002",
    "cat-impact-pain-body-modification": "c0003",
    "cat-sensation-atmosphere": "c0004",
    "cat-roleplay-identity": "c0005",
    "cat-clothing-materials-objects": "c0006",
    "cat-body-focus-appearance": "c0007",
    "cat-psychological-dynamics": "c0008",
    "cat-watching-exposure-settings": "c0009",
    "cat-partner-configurations": "c0010",
    "cat-sex-acts": "c0011",
    "cat-positions": "c0012",
    "cat-orgasm-reproductive-play": "c0013",
    "cat-fluids-messy-play": "c0014",
    "cat-primal-pursuit": "c0015",
    "cat-service-ritual": "c0016",
    "cat-fantasy-transformation": "c0017",
    "cat-connection-aftercare": "c0018",
    "subcategory-bondage-restriction-flexible-ties": "s0001",
    "subcategory-bondage-restriction-restraints": "s0002",
    "subcategory-bondage-restriction-tape-wrapping": "s0003",
    "subcategory-bondage-restriction-sensory": "s0004",
    "subcategory-bondage-restriction-confinement": "s0005",
    "subcategory-bondage-restriction-challenge-bondage": "s0006",
    "subcategory-bondage-restriction-specialty": "s0007",
    "subcategory-impact-pain-body-modification-hand-spanking": "s0008",
    "subcategory-impact-pain-body-modification-flexible-implements": "s0009",
    "subcategory-impact-pain-body-modification-rigid-implements": "s0010",
    "subcategory-impact-pain-body-modification-clamps-pinching": "s0011",
    "subcategory-impact-pain-body-modification-cutting-piercing": "s0012",
    "subcategory-impact-pain-body-modification-genital-pain": "s0013",
    "subcategory-impact-pain-body-modification-extreme": "s0014",
    "subcategory-roleplay-identity-caregiver-little-roles": "s0015",
    "subcategory-roleplay-identity-authority": "s0016",
    "subcategory-roleplay-identity-captivity": "s0017",
    "subcategory-roleplay-identity-animal": "s0018",
    "subcategory-roleplay-identity-historical-fantasy": "s0019",
    "subcategory-clothing-materials-objects-materials": "s0020",
    "subcategory-clothing-materials-objects-footwear": "s0021",
    "subcategory-clothing-materials-objects-uniforms-costumes": "s0022",
    "subcategory-clothing-materials-objects-lingerie-hosiery": "s0023",
    "subcategory-clothing-materials-objects-undergarments": "s0024",
    "subcategory-clothing-materials-objects-masks-headwear": "s0025",
    "subcategory-clothing-materials-objects-objects-toys": "s0026",
    "subcategory-body-focus-appearance-head-hair": "s0027",
    "subcategory-body-focus-appearance-facial-body-hair": "s0028",
    "subcategory-body-focus-appearance-lower-body": "s0029",
    "subcategory-body-focus-appearance-torso": "s0030",
    "subcategory-body-focus-appearance-face": "s0031",
    "subcategory-body-focus-appearance-body-type": "s0032",
    "subcategory-body-focus-appearance-worship": "s0033",
    "subcategory-psychological-dynamics-humiliation": "s0034",
    "subcategory-psychological-dynamics-intimidation": "s0035",
    "subcategory-psychological-dynamics-mind-control": "s0036",
    "subcategory-psychological-dynamics-emotional": "s0037",
    "subcategory-psychological-dynamics-vulnerability": "s0038",
    "subcategory-psychological-dynamics-verbal": "s0039",
    "subcategory-sex-acts-oral": "s0040",
    "subcategory-sex-acts-anal": "s0041",
    "subcategory-sex-acts-manual": "s0042",
    "subcategory-sex-acts-insertion": "s0043",
    "subcategory-sex-acts-fluids": "s0044"
});
        function migrateNodeKey(id) {
            const s = String(id == null ? "" : id);
            return Object.prototype.hasOwnProperty.call(LEGACY_NODE_IDS, s) ? LEGACY_NODE_IDS[s] : s;
        }
        function isCatId(id) {
            if (id == null || id === "") return !1;
            const k = migrateNodeKey(id);
            return h.some(c => c.id === k);
        }
        function isSubId(id) {
            if (id == null || id === "") return !1;
            const k = migrateNodeKey(id);
            return h.some(c => (c.subcategories || []).some(s => s.id === k));
        }
        function nextLevelId(prefix, ids) {
            let max = 0;
            (ids || []).forEach(id => {
                const m = new RegExp("^" + prefix + "(\\d+)$").exec(String(id || ""));
                if (m) max = Math.max(max, Number(m[1]));
            });
            return prefix + String(max + 1).padStart(4, "0");
        }
        function nextCategoryId() {
            return nextLevelId("c", h.map(c => c.id));
        }
        function nextSubcategoryId() {
            const ids = [];
            h.forEach(c => (c.subcategories || []).forEach(s => ids.push(s.id)));
            return nextLevelId("s", ids);
        }
        function nextTopicId() {
            const ids = [];
            h.forEach(c => (c.topics || []).forEach(t => ids.push(t && t.id)));
            Object.values(topicRecords).forEach(rec => ids.push(rec && rec.id));
            return nextLevelId("t", ids);
        }
        function migrateLayoutKeys(patch) {
            if (!patch || "object" != typeof patch) return patch;
            [ "kinkOverrides", "kinkAngleOffsets" ].forEach(name => {
                const map = patch[name];
                if (!map || "object" != typeof map) return;
                Object.keys(map).forEach(key => {
                    const next = migrateNodeKey(key);
                    if (next !== key) {
                        map[next] = map[key];
                        delete map[key];
                    }
                });
            });
            return patch;
        }

        function Wn(e) {
            if (e && "object" == typeof e && e.id) return e.id;
            const t = sxName(e);
            for (const cat of h) for (const topic of cat.topics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
            const n = topicRecords[t] && topicRecords[t].id;
            if (!n) throw new Error(`Missing stored topic ID for "${t}". Assign max(existing ID) + 1 on the topic object.`);
            return n;
        }
        function catId(e) {
            const cat = h.find(c => c.name === String(e || ""));
            if (!cat || !cat.id) throw new Error(`Missing stored category ID for "${e}". Assign max(existing category ID) + 1 on the category; do not derive it from the name.`);
            return cat.id;
        }
        function Un(e, t) {
            const cat = h.find(c => c.name === String(e || ""));
            const sub = cat && (cat.subcategories || []).find(s => s.name === String(t || ""));
            if (!sub || !sub.id) throw new Error(`Missing stored subcategory ID for "${e}" / "${t}". Assign max(existing subcategory ID) + 1 on the subcategory; do not derive it from the name.`);
            return sub.id;
        }
        function Kn(e, t) {
            return "topic-" + Hn(String(e || "")) + "-" + Hn(String(t || ""));
        }
        function zn(e) {
            for (const t of h) for (const n of t.subcategories || []) if (Un(t.name, n.name) === e) return {
                id: e,
                label: n.name,
                branch: t.name,
                kind: "Subcategory",
                risk: t.risk,
                parentId: catId(t.name),
                topics: n.topics
            };
            return null;
        }
        function Vn(e, t) {
            const name = sxName(t);
            return (e.subcategories || []).find(sub => (sub.topics || []).some(topic => sxName(topic) === name)) || null;
        }
        function Yn(e) {
            return e.subcategories?.length ? (e.parentTopics || []).map(Wn).concat(e.subcategories.map(t => Un(e.name, t.name))) : e.topics.map(Wn);
        }
        function Xn(e) {
            const t = zn(e);
            if (t) return t;
            for (const t of h) {
                const n = t.topics.find(t => Wn(t) === e);
                if (n) {
                    const i = Vn(t, n);
                    return {
                        id: e,
                        label: sxName(n),
                        branch: t.name,
                        kind: "Topic",
                        risk: Boolean(((t.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                        parentId: i ? Un(t.name, i.name) : null
                    };
                }
            }
            return null;
        }
        function Zn(e, t) {
            if ("give" !== t && "receive" !== t) return "";
            const n = qn[e] || Xn(e) || (at[Vi()] || {})[e], i = n && n.parentId && (qn[n.parentId] || Xn(n.parentId)), a = n && (He[n.label] || i && He[i.label]);
            return a && a["give" === t ? 0 : 1] || "";
        }
        function Qn(e, t = Vi()) {
            const n = qn[e] || Xn(e) || (at[t] || {})[e];
            return n && n.label ? String(n.label).trim().toLowerCase() : "";
        }
        function Jn(e, t, n = Vi()) {
            const i = Ge(e, n);
            if (i.single || "give" !== i.labels[0] || "receive" !== i.labels[1]) return i.labels["give" === t ? 0 : 1] || t;
            const a = Qn(e, n);
            return a ? t + " " + a : t;
        }
        function ei(e, t, n = Vi()) {
            const i = Ge(e, n);
            return i.single || "give" !== i.labels[0] || "receive" !== i.labels[1] ? "" : Jn(e, t, n);
        }
        h.forEach(e => {
            Ke.add(catId(e.name)), (e.subcategories || []).forEach(t => Ke.add(Un(e.name, t.name))), 
            e.topics.forEach(e => Ke.add(Wn(e)));
        });
        const ti = {
            "boss secretary": "Boss / secretary",
            "over the knee otk spanking": "Over-the-knee spanking",
            "abdl diaper play": "ABDL / diaper play",
            "medical doctor nurse": "Doctor / nurse",
            "teacher student": "Teacher / student",
            "predator prey": "Predator / prey",
            "electric play violet wand e stim": "Violet wand / E-stim",
            "penis strap on": "Penis / strap-on",
            "words i enjoy saying hearing slut whore etc": "Humiliation words",
            "anal play": "Anal sex",
            rimming: "Analingus / rimming",
            facefucking: "Face fucking",
            collars: "Collars & symbols",
            paddles: "Paddles & straps",
            cuddling: "Cuddling & touch",
            ageplayer: "Age play",
            threesome: "Threesome"
        };
        function ni(e) {
            let t = String(e || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
            const n = "(?:everything|anything|all)(?:\\s+there\\s+is)?\\s+(?:to\\s+do\\s+)?(?:with|about)\\s+(?:it|this|that)|everything\\s+to\\s+do\\s+with\\s+it|giving(?:\\s*(?:and|&)\\s*receiving)?|receiving|both|switch|as\\s+a\\s+top|as\\s+a\\s+bottom|top|bottom|watching(?:\\s+others\\s+wear(?:ing)?)?|wearing";
            return t = t.replace(new RegExp(`\\s*(?:[—–|,:;]+\\s*)?[\\(\\[\\{]\\s*(?:${n})\\s*[\\)\\]\\}]\\s*$`, "i"), ""), 
            t = t.replace(new RegExp(`\\s*(?:[—–|,:;]+|\\betc\\.?\\s*)\\s*(?:${n})(?:\\s*(?:etc\\.?|and\\s+so\\s+on))?\\s*$`, "i"), ""), 
            t = t.replace(new RegExp(`\\s+(?:${n})\\s*$`, "i"), ""), t = t.replace(/(?:[,;/]\s*)?\betc\.?\s*$/i, "").replace(/\s*[—–|,:;]+\s*$/, "").replace(/\s+/g, " ").trim(), 
            (ti[ck(t)] || t).slice(0, 60);
        }
        function ii(e, t, n) {
            const i = Xn(n);
            if (!i) return null;
            const a = ni(t);
            if (!a) return null;
            const r = "subtopic-" + Hn(n) + "-" + Hn(a);
            return Hn(a) ? (e[r] = {
                id: r,
                label: a,
                parentId: n,
                branch: i.branch,
                kind: "Imported topic",
                risk: i.risk
            }, e[r]) : null;
        }
        function ai(e, t) {
            return Object.values(at[t] || {}).filter(t => t.parentId === e).map(e => e.id);
        }
        function ri() {
            const e = Qi() ? Xi() : [ Vi() ], t = {};
            let n = 0;
            return e.forEach(e => {
                n >= 560 || Object.values(at[e] || {}).some(e => n >= 560 || (t[e.id] || (t[e.id] = e, 
                n++), !1));
            }), Object.values(t);
        }
        function oi(e, t) {
            return `${e}\0${t}`;
        }
        function si(e, t = Vi()) {
            if (!Qi() || !t || !e.startsWith("subtopic-") || (at[t] || {})[e]) return null;
            const n = ca(e, t);
            return n.giveKnown || n.receiveKnown ? null : Xi().filter(e => e !== t).map(t => (at[t] || {})[e]).find(Boolean) || null;
        }
        function li() {
            const e = {};
            let t = 0;
            return Object.values(at).some(n => Object.values(n || {}).some(n => t >= 560 || (e[n.id] || (e[n.id] = n, 
            t++), !1))), Object.values(e);
        }
        function ci(e) {
            const t = qn[e];
            if (t && t.branch) return t.branch;
            for (const t of h) {
                if (e === catId(t.name)) return t.name;
                if ((t.subcategories || []).some(n => e === Un(t.name, n.name))) return t.name;
                if (t.topics.some(t => e === Wn(t))) return t.name;
            }
            return null;
        }
        function di(e, t = Mt) {
            const n = t && ft[t];
            if (!n || "group" !== n.kind || !n.results) return null;
            const i = qn[e] || Xn(e) || (at[t] || {})[e], a = i && i.label;
            return a ? (n.results.matches || []).includes(a) ? "mutual" : (n.results.curiousAbout || []).includes(a) ? "explore" : (n.results.mismatched || []).includes(a) ? "mismatch" : "other" : "other";
        }
        function ui(e, t = Vi()) {
            const n = da(e, t);
            return n.giveKnown && n.receiveKnown;
        }
        function pi(e, t = Vi()) {
            if (ui(e, t)) return !0;
            const n = zn(e);
            return n ? n.topics.some(e => pi(Wn(e), t)) : !isCatId(e) && !isSubId(e) && ai(e, t).some(e => ui(e, t));
        }
        function hi(e, t = Vi()) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id)).some(e => ui(e, t));
        }
        function gi(e, t = Vi()) {
            const n = zn(e);
            return n ? n.topics.some(e => gi(Wn(e), t)) : !ui(e, t) || !isCatId(e) && !isSubId(e) && ai(e, t).some(e => !ui(e, t));
        }
        function mi(e, t = Vi()) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id)).some(e => !ui(e, t));
        }
        function fi(e, t) {
            const n = un.get(e) || "rated", i = "all" === n ? t.slice() : t.filter(e => "rated" === n ? pi(e) : gi(e));
            return {
                mode: n,
                visible: i,
                hidden: t.length - i.length
            };
        }
        function yi(e, t, n, i, a = !1) {
            if (!n && !a) return "";
            const r = `+${n}`, o = Math.max(36, 8 * r.length + 16), s = `${n} hidden ${1 === n ? "child" : "children"}`;
            return e = Math.max(nh.x + o / 2 + 54, Math.min(nh.x + nh.width - o / 2 - 54, e)), 
            t = Math.max(nh.y + 14 + 54, Math.min(nh.y + nh.height - 14 - 54, t)), `<g class="hidden-count-badge" data-id="${Hi(i)}" data-width="${o}" data-height="28" transform="translate(${(e - o / 2).toFixed(2)} ${(t - 14).toFixed(2)})" tabindex="0" role="button" aria-label="${(typeof mx==='function'&&mx(i))||i}: ${s}. Switch between rated and unrated children."><rect width="${o}" height="28" rx="8"/><text x="${(o / 2).toFixed(2)}" y="14" text-anchor="middle" dominant-baseline="middle">${r}</text></g>`;
        }
        function bi(e) {
            const t = h.find(t => t.name === e.branch);
            return "Category" === e.kind ? t ? Yn(t) : [] : "Subcategory" === e.kind ? (e.topics || []).map(Wn) : ai(e.id, Vi());
        }
        function vi(e) {
            const t = qn[e];
            t && bi(t).length && (("Category" === t.kind ? rn.has(t.branch) : on.has(e)) ? (un.set(e, "rated" === un.get(e) ? "unrated" : "rated"), 
            rn.add(t.branch), "Topic" === t.kind && on.add(e), wn = !1, Lt = e, vn = e, Mr()) : Si(e));
        }
        function wi(e) {
            const t = bi(e), n = [];
            return t.forEach(e => {
                n.push(e);
                const t = Xn(e);
                "Subcategory" === t?.kind ? bi(t).forEach(e => {
                    n.push(e, ...ai(e, Vi()));
                }) : n.push(...ai(e, Vi()));
            }), new Set(n);
        }
        let ki = 0;
        function xi(e) {
            t.clear(ki), ki = 0, Mr(e);
        }
        function Si(e) {
            noteFitUserCamera();
            const t = qn[e];
            if (!t) return So(e);
            if (!bi(t).length) return So(e);
            if (wn = !1, "Category" === t.kind) {
                if (!kn) return Ei(), Lt = e, void Mr();
                if (rn.has(t.branch)) {
                    const e = wi(t);
                    return rn.delete(t.branch), Lt = null, void xi({
                        exitIds: e
                    });
                }
                return rn.add(t.branch), Lt = e, Mr(), void (Bt && requestAnimationFrame(() => Th(e, t.branch)));
            }
            if (rn.add(t.branch), on.has(e)) {
                const n = wi(t);
                return on.delete(e), Lt = null, void xi({
                    exitIds: n
                });
            }
            on.add(e), Lt = e, Mr(), Bt && requestAnimationFrame(() => Th(e, t.branch));
        }
        function $i(e) {
            noteFitUserCamera();
            (function(e) {
                const t = Vi(), n = si(e, t);
                if (!n) return !1;
                at[t] || (at[t] = {});
                const i = ii(at[t], n.label, n.parentId);
                return !!i && (Ke.add(i.id), gn.add(oi(t, i.id)), zt(t), rn.add(i.branch), on.add(i.parentId), 
                Lt = i.id, Nt = null, Mr({
                    anchorId: i.id
                }), !0);
            })(e) || Si(e);
        }
        function Ei() {
            xn && (rn.clear(), xn.branches.forEach(e => rn.add(e)), on.clear(), xn.topics.forEach(e => on.add(e))), 
            xn = null, kn = !0;
        }
        function Ai() {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const e = Cn.getAttribute("viewBox");
                e && (Cn.removeAttribute("viewBox"), Cn.getBoundingClientRect(), Cn.setAttribute("viewBox", e));
            }));
        }
        function Ci() {
            let e = null;
            kn ? (e = new Set([ ...rn ].flatMap(e => {
                const t = h.find(t => t.name === e);
                return t ? Yn(t).flatMap(e => {
                    const t = Xn(e);
                    return "Subcategory" === t?.kind ? [ e, ...t.topics.flatMap(e => {
                        const t = Wn(e);
                        return [ t, ...ai(t, Vi()) ];
                    }) ] : [ e, ...ai(e, Vi()) ];
                }) : [];
            })), xn = {
                branches: [ ...rn ],
                topics: [ ...on ]
            }, rn.clear(), on.clear(), kn = !1) : Ei();
            const t = {
                anchorPoint: {
                    x: 900,
                    y: 620
                },
                exitIds: e,
                forceRepaint: !e
            };
            e ? xi(t) : Mr(t);
        }
        const Mi = e.byId("centerProfileCard"), Ii = (e.byId("centerProfileCardTitle"), 
        e.byId("centerProfileAbout")), Pi = (e.byId("centerContactList"), e.byId("profileAboutDialog")), Li = e.byId("profileAboutSubtitle"), Ti = e.byId("profileAboutText"), Fi = e.byId("profileAboutResource"), Ni = [ [ "telegram", "Telegram" ], [ "linktree", "linktr.ee" ], [ "fetlife", "FetLife" ], [ "chaturbate", "Chaturbate" ], [ "stripchat", "Stripchat" ], [ "myfreecams", "MyFreeCams" ], [ "pornhub", "PornHub" ], [ "xvideos", "XVideos" ], [ "xhamster", "xHamster" ], [ "onlyfans", "OnlyFans" ], [ "reddit", "Reddit" ], [ "x", "X" ] ];
        function _i(e, t) {
            const n = encodeURIComponent(t);
            return {
                fetlife: `https://fetlife.com/users/${n}`,
                telegram: `https://t.me/${n}`,
                linktree: `https://linktr.ee/${n}`,
                chaturbate: `https://chaturbate.com/${n}/`,
                x: `https://x.com/${n}`,
                xhamster: `https://xhamster.com/users/${n}`,
                xvideos: `https://www.xvideos.com/profiles/${n}`,
                pornhub: `https://pornhub.com/model/${n}`,
                myfreecams: `https://www.myfreecams.com/${n}`,
                stripchat: `https://stripchat.com/${n}`,
                onlyfans: `https://onlyfans.com/${n}`,
                reddit: `https://reddit.com/user/${n}`
            }[e] || "";
        }
        function Di(e) {
            const t = Rv(e);
            return Ni.filter(([e]) => t[e]).map(([e, n]) => ({
                label: n,
                user: t[e],
                href: _i(e, t[e])
            })).concat((t.customSites || []).map(e => ({
                label: e.site,
                user: e.username,
                href: e.url
            })));
        }
        function Ri() {
            Mi.hidden = !0;
        }
        function Oi() {
            !Object.keys(wt).length ? roxyAbout() : (Ri(), Ci());
        }
        function Bi(e = Vi()) {
            return h.every(t => !ui(catId(t.name), e));
        }
        function ji(t, n = {}) {
            It = t, Mt = t, hn[t] = "saved";
            wn = !1, kn = !0, xn = null, Sn = "all", rn.clear(), on.clear(), Lt = null, 
            Nt = null, Tt = "";
            const a = e.byId("searchInput");
            a && (a.value = "");
            const r = e.byId("topicPicker");
            r && (r.value = "", nc()), h.forEach(e => {
                const n = catId(e.name);
                un.set(n, "all"), rn.add(e.name), (e.subcategories || []).forEach(n => {
                    const i = Un(e.name, n.name);
                    un.set(i, "all"), on.add(i);
                }), e.topics.forEach(e => {
                    const n = Wn(e);
                    un.set(n, "all"), on.add(n);
                });
            });
        }
        function qi(e, t, n = {}) {
            if (n.hasAttentionState) !function(e, t) {
                const n = t => Boolean(qn[t] || Xn(t) || (at[e] || {})[t]), i = new Set((Array.isArray(t && t.nodes) ? t.nodes : []).filter(t => n(t) && !Eo(e, t))), a = new Set((Array.isArray(t && t.newest) ? t.newest : []).filter(t => n(t) && !Eo(e, t)));
                Object.keys(vt[e] || {}).forEach(t => {
                    n(t) && !Eo(e, t) && ((at[e] || {})[t] ? a.add(t) : i.add(t));
                });
                const r = new Set([ ...i, ...a ].map(t => {
                    const n = qn[t] || Xn(t) || (at[e] || {})[t];
                    return n && n.branch || ci(t);
                }).filter(Boolean)), o = Array.isArray(t && t.branches) ? t.branches : [];
                ln[e] = new Set([ ...o, ...r ].filter(t => {
                    const n = catId(t);
                    return (e => h.some(t => t.name === e))(t) && (r.has(t) || ui(n, e) && !Eo(e, n));
                })), cn[e] = i, dn[e] = a;
            }(e, n.attentionState); else {
                const i = function(e) {
                    const t = [], n = new Set, i = e => {
                        e && !n.has(e) && (n.add(e), t.push(e));
                    };
                    return [ "ratings", "annotations", "notes" ].forEach(t => Object.keys(e[t] || {}).forEach(i)), 
                    Object.values(e.children || {}).forEach(e => i(e && e.id)), {
                        changed: t
                    };
                }(t);
                !function(e, t) {
                    const n = ln[e] || new Set, i = cn[e] || new Set, a = dn[e] || new Set;
                    t.forEach(t => {
                        const r = qn[t] || Xn(t) || (at[e] || {})[t], o = r && r.branch || ci(t);
                        o && n.add(o), r && "Topic" === r.kind ? i.add(t) : r && r.parentId && (i.add(r.parentId), 
                        a.add(t));
                    }), ln[e] = n, cn[e] = i, dn[e] = a;
                }(e, n.noFlash ? [] : i.changed);
            }
            ji(e), Jw(), Mr({
                animate: !1,
                forceRepaint: !0
            }), Ih(), Ai();
        }
        function Hi(e) {
            return (e == null ? "" : String(e)).replace(/[&<>"']/g, e => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[e]));
        }
        function Wi(e) {
            var h = window.__sxDialog;
            if (h && h.open) return void h.open(e);
            if (e && !e.open) try {
                "function" == typeof e.showModal ? e.showModal() : (e.setAttribute("open", ""), 
                e.classList.add("fallback-open"));
            } catch (t) {
                e.setAttribute("open", ""), e.classList.add("fallback-open");
            }
        }
        function Ui(e) {
            var h = window.__sxDialog;
            if (h && h.close) return void h.close(e);
            if (e) {
                try {
                    "function" == typeof e.close && e.open ? e.close() : e.removeAttribute("open");
                } catch (t) {
                    e.removeAttribute("open");
                }
                e.classList.remove("fallback-open");
            }
        }
        e.byId("closeCenterProfileCard") && e.byId("closeCenterProfileCard").addEventListener("click", Ri), Ii && Ii.addEventListener("click", function() {
            const e = Ii.dataset.profileId;
            e && vt[e] && (Ri(), bw(e, {
                mode: "about"
            }));
        }), e.byId("closeProfileAbout") && e.byId("closeProfileAbout").addEventListener("click", () => Ui(Pi)), Pi && Pi.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Pi);
        }), e.byId("toggleCenterBranches") && e.byId("toggleCenterBranches").addEventListener("click", () => {
            Ri(), Ci();
        }), e.byId("editCenterProfile") && e.byId("editCenterProfile").addEventListener("click", () => {
            Ri(), bw(Mt);
        }), window.__sxOnPtr( e => {
            Mi.hidden || Mi.contains(e.target) || __sxClosestAction(e.target, "centerHit") || Ri();
        }, !0), (() => {
            let sxTapX = 0, sxTapY = 0, sxTapDown = !1;
            window.__sxOnPtr( e => {
                sxTapX = e.clientX, sxTapY = e.clientY, sxTapDown = !0;
            }, !0);
            document.addEventListener("pointerup", e => {
                if (!sxTapDown) return;
                sxTapDown = !1;
                const dx = e.clientX - sxTapX, dy = e.clientY - sxTapY;
                if (dx * dx + dy * dy > 100) {
                    e.preventDefault(), e.stopPropagation();
                    const t = e.target;
                    t && t.addEventListener("click", function h(ev) {
                        ev.preventDefault(), ev.stopPropagation(), t.removeEventListener("click", h, !0);
                    }, !0);
                }
            }, !0);
        })();
        const Gi = e.byId("unsavedChangesDialog");
        function Ki() {
            const t = jt();
            t && !Gi.open && (e.byId("unsavedChangesQuestion").textContent = `${wt[t] || "This profile"} has changes that are not safely stored yet. Choose what to do before reloading.`, 
            Wi(Gi), requestAnimationFrame(() => e.byId("saveUnsavedToMemory").focus()));
        }
        // Interest-color stops — the one source both interest encodings
        // derive from (map-render refactor, finding 7): zi() interpolates
        // these rgb stops, and Ka's rating-rail CSS gradient uses the
        // same stops as the --red-deep / --curious / --green-deep custom
        // properties (shell :root: #bd4f51 / #d7bd55 / #3da874 — the
        // same values in hex). Change a stop here and in the shell
        // :root together.
        const INTEREST_STOPS = {
            curious: [ 215, 189, 85 ],
            positive: [ 61, 168, 116 ],
            negative: [ 189, 79, 81 ]
        };
        function zi(e) {
            e = Number(e) || 0;
            // The --curious value is read once and cached on the function
            // (finding 8): zi is called per spoke per render and
            // getComputedStyle forces style recalculation. No theme
            // switch exists in the app, so nothing invalidates the cache.
            if (0 === e) return zi._curious ??= getComputedStyle(document.documentElement).getPropertyValue("--curious").trim();
            const n = Math.min(1, Math.abs(e) / 100), i = INTEREST_STOPS.curious, a = e > 0 ? INTEREST_STOPS.positive : INTEREST_STOPS.negative;
            return `rgb(${Math.round(i[0] + (a[0] - i[0]) * n)},${Math.round(i[1] + (a[1] - i[1]) * n)},${Math.round(i[2] + (a[2] - i[2]) * n)})`;
        }
        function Vi() {
            return Mt || Et;
        }
        function Yi() {
            return Array.from(en).filter(e => vt[e]);
        }
        // Profiles-data F2: the chosen set changes ONLY through sxSel(),
        // and sxSel() is the only place the comparison-active flag (an)
        // is written: after every mutation the flag is re-derived from
        // the set (active exactly when the set holds more than one live
        // member). No caller hand-syncs the flag any more, so the set
        // and the flag cannot disagree — toggling a second profile in
        // now leaves comparison active. The flag stays a cache for one
        // reason: sxSel's "dismiss" operation (Hide group overlay)
        // clears the flag while leaving the chosen set untouched, as
        // that button has always behaved; a pure derivation cannot
        // express it without changing which profiles are chosen.
        function sxSel(e, t = "add") {
            if ("dismiss" === t) return void (an = !1);
            if ("show" === t) return void (an = Yi().length >= 2);
            if ("clear" === t) en.clear();
            else if ("set" === t) en.clear(), (e || []).forEach(e => en.add(e));
            else if ("remove" === t) en.delete(e);
            else if ("toggle" === t) en.has(e) ? en.delete(e) : en.add(e);
            else en.add(e);
            an = Yi().length >= 2;
        }
        function Xi() {
            const e = Yi();
            return an && e.length >= 2 ? e : Mt && vt[Mt] ? [ Mt ] : [];
        }
        function Zi(e) {
            sxSel(null, "clear"), vt[e] && la(e);
        }
        function sxAutoSelect(id) {
            if (!vt[id]) return;
            if (!en.size && Mt && vt[Mt] && Mt !== id) {
                sxSel(Mt), la(Mt);
            }
            sxSel(id), la(id), Jw();
        }
        // Load landing (load-target stage, 2026-10-27): a load ends
        // on the loaded profile's own tab — ACTIVATED and SELECTED —
        // and never opens the comparison overlay or a group map.
        // The chosen set keeps every loaded profile slated for
        // multi-select; the comparison (crossmatch) appears only
        // when the bowtie or circle-dot button is fired, so after
        // selecting, the overlay flag is dismissed while the set is
        // left untouched. Quiet bundle creates keep their own landing
        // (their caller activates the last profile), and a share-link
        // boot keeps its pinned behavior (F7: no auto-select, no join).
        function sxLoadLanding(id, opts = {}) {
            if (!id || !vt[id] || opts.quiet || "share-link" === opts.source) return;
            opts.autoSelect || sxSel(id), sxSel(null, "dismiss"), ak(id), Jw();
        }
        function Qi() {
            return an && Xi().length >= 2;
        }
        function Ji(e) {
            return String(e || "").trim().split(/\s+/)[0] || "";
        }
        e.byId("stayWithUnsavedChanges") && e.byId("stayWithUnsavedChanges").addEventListener("click", () => Ui(Gi)), e.byId("saveUnsavedToMemory") && e.byId("saveUnsavedToMemory").addEventListener("click", () => {
            const e = jt(), t = window.SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x"), n = window.Sexcapades2xRememberProfiles;
            t && !t.checked && (t.checked = !0, t.dispatchEvent(new Event("change"))), n && "function" == typeof n.saveNow && n.saveNow() ? (e && Vt(e), 
            Ui(Gi), tS("Changes saved to profile memory.")) : tS("Could not save these changes to profile memory.", {
                tone: "error",
                persistent: !0
            });
        }), e.byId("exportUnsavedNow") && e.byId("exportUnsavedNow").addEventListener("click", () => {
            const e = jt();
            e && (Ui(Gi), Jf(e));
        }), e.byId("reloadWithUnsavedChanges") && e.byId("reloadWithUnsavedChanges").addEventListener("click", () => {
            qt = !0, document.documentElement.classList.remove("has-unsaved-changes"), document.body.classList.remove("has-unsaved-changes"), 
            location.reload();
        }), Gi.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Gi);
        }), window.__sxOnKey( e => {
            jt() && !Gi.open && ("F5" === e.key || (e.ctrlKey || e.metaKey) && "r" === e.key.toLowerCase()) && (e.preventDefault(), 
            e.stopImmediatePropagation(), Ki());
        }, !0), document.addEventListener("touchstart", e => {
            if (!jt() || 1 !== e.touches.length || document.scrollingElement && document.scrollingElement.scrollTop > 1) return;
            if (__sxClosestAction(e.target, "interactiveAncestor")) return;
            const t = e.touches[0];
            t.clientY > 96 || (Ht = {
                x: t.clientX,
                y: t.clientY
            });
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchmove", e => {
            if (!Ht || 1 !== e.touches.length) return;
            const t = e.touches[0], n = t.clientX - Ht.x, i = t.clientY - Ht.y;
            i > 18 && i > 1.35 * Math.abs(n) && e.preventDefault(), i >= 72 && i > 1.35 * Math.abs(n) && (Ht = null, 
            Ki());
        }, {
            capture: !0,
            passive: !1
        }), document.addEventListener("touchend", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchcancel", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        });
        // Center-node geometry (ea) — derivation note. These values are
        // frozen baselines, reached by successive rescalings of the center
        // node (builds 2026-10-17_1446, 2026-10-17_2027, 2026-10-18_0343,
        // 2026-10-18_1449, 2026-10-19_0119): the photo disc and at-a-glance
        // rings were grown until the outer ring's edge sat ~3 units clear
        // of the nearest first-generation label anchor (lineStartRadius +
        // 105 = 1315.17); the gen-1 spoke starts were then moved onto the
        // ring's exterior edge (spokeStartRadius = glanceRadii[0] + ring
        // stroke / 2); and the rings were finally respaced to an exact
        // 44-unit radial pitch, tiling edge to edge, with the innermost
        // ring's inner edge unchanged (photoRadius + 5.73 clearance).
        // outerRadius / lineStartRadius never moved: they are the layout
        // and label anchors. The full build-by-build history is preserved
        // in the map-render refactor completion report (2026-10-25).
        const MAP_CENTER_X = 900, MAP_CENTER_Y = 620, BRANCH_TOGGLE_DROP = 184.06;
        const ea = {
            photoRadius: 897.58,
            glanceRadii: [ 1013.31, 969.31, 925.31 ],
            outerRadius: 1200,
            lineStartRadius: 1210.17,
            spokeStartRadius: 1035.31,
            branchToggleY: 1839.37
        };
        // Font-as-master-knob, part 3 (Build 2026-10-19_0948): the layout
        // parameter centerRingScale (Layout Editor "Center ring scale",
        // layout-centerRingScale hash param, default 1) rescales the
        // center node independently of fontScale. eaBase freezes the 1.0
        // values; refreshCenterRing() re-derives the live ea radii from
        // them on every render (called at the top of Mr() and once here),
        // so moving the slider rescales the node live with no reload and
        // at 1.0 every radius is exactly its pre-part-3 value. Scaled:
        // photoRadius (photo circle, clip, hit disc, name arc), the three
        // glanceRadii (at-a-glance rings), and spokeStartRadius (gen-1
        // spoke starts at the ring's outer edge). NOT scaled:
        // outerRadius/lineStartRadius (layout + label anchors).
        // FQ2-BAKEIN (A4): branchToggleY is no longer a fixed constant —
        // refreshCenterRing() derives it from the scaled ring (see below).
        const eaBase = {
            photoRadius: ea.photoRadius,
            glanceRadii: ea.glanceRadii.slice(),
            spokeStartRadius: ea.spokeStartRadius
        };
        function centerRingScale() {
            const v = Number(mn && mn.centerRingScale);
            return Number.isFinite(v) && v > 0 ? v : 1;
        }
        // ICON DEPTH LAW (ruled 2026-11-02, Jason; SQUARE-ROOT
        // form — the owner adopted the same day's square-root
        // draft at 17:05, superseding the linear (0.6)^depth x R
        // law built earlier that day; the two-thirds base is
        // kept, as ruled; RADIUS reading ruled 13:38 the same
        // day — "I meant radius"): a node's icon RADIUS is
        // (2/3)^depth x sqrt(R x W) — the depth-scaled
        // geometric mean of R, the centre-disc radius
        // (ea.photoRadius = 897.58 x centerRingScale, set by
        // the Center circle slider; eaBase.photoRadius is the
        // fallback), and W, the ring width midlineStrokeWidth()
        // = 22 x mapFontScale() (the same width sxFontMaster()
        // reads as the font master F). Icons therefore grow
        // only as the square root when either slider rises,
        // instead of linearly with the centre alone. Depth 1 =
        // categories, depth 2 = subcategories AND kinks
        // hanging straight off a category, depth 3 = kinks
        // under a subcategory, imported children included. At
        // the baked defaults (fontScale 120, centre 90: R =
        // 80,782.20, W = 2,640, sqrt(RW) = 14,603.60) the depth
        // radii are 9,735.73 / 6,490.49 / 4,326.99 (diameters
        // double those). Sliders and tags scale by depth
        // exactly like the fonts (sxControlScale below — see
        // Ka / renderKinkLine control scales and sxSccBuild's
        // tagM); the icon ladder (2/3) and the font ladder
        // stay independent (font law since 2026-11-02 17:24:
        // sqrt(R x W) x (2/3)^(depth-1) for depths 1-3, glance
        // at W; the earlier (8/9)^depth font ladder is
        // superseded history). The pr.*Icon seeds remain
        // ONLY as solver estimate-space inputs and as the
        // slider-scale normalization (seed / 48); nothing
        // painted reads them for icon size any more.
        // ICON MINIMUM (ruled 2026-11-02 13:27, Jason): no
        // icon draws smaller than the current floor, and the
        // floor rises and falls with the FONT slider. No
        // single icon floor exists elsewhere in the code
        // (there is no 44px icon floor); the floor used here
        // is the one the spoke-trim helpers already enforce
        // — the 12-unit radius clamp in
        // SpokeGeometry.buildTipCircle (Math.max(12,
        // iconSize / 2)) and in renderKinkLine's leaf trim —
        // taken font-scaled, as ruled: minimum icon RADIUS =
        // 12 x mapFontScale() (1,440 world units at the baked
        // fontScale 120; minimum diameter 2,880). Under the
        // square-root law the floor binds nowhere at the baked
        // defaults — it binds only when the centre is small
        // or the font large.
        function sxIconRadius(depth) {
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.max(Math.pow(2 / 3, depth) * Math.sqrt(base * midlineStrokeWidth()), 12 * mapFontScale());
        }
        function sxIconDiameter(depth) {
            return 2 * sxIconRadius(depth);
        }
        // FONT DEPTH LADDER: the current law is the FONT LAW note
        // on sxFontSize below. Glance labels (depth 0) stay at the
        // slider basis W = 22 x mapFontScale(). Depths 1-3 use
        // sqrt(R x W), then x (2/3) per deeper level. The old
        // (8/9)^depth ladder is superseded and sizes nothing.
        // Baked defaults are text 120 and centre 90.
        function sxFontMaster() {
            return midlineStrokeWidth();
        }
        // FONT LAW (ruled 2026-11-02 17:24 CST, Jason; built
        // 2026-11-03, superseding the (8/9)^depth ladder above):
        // glance labels (depth 0) stay at the slider's basis
        // W = sxFontMaster() = 22 x mapFontScale(); depths 1-3
        // ride the square-root law the icons use, offset one
        // level: depth 1 (categories) = sqrt(R x W), depth 2
        // (subcategories AND kinks hanging straight off a
        // category) = (2/3) sqrt(R x W), depth 3 (kinks under
        // a subcategory) = (4/9) sqrt(R x W), where R is the
        // centre-disc radius from the same source sxIconRadius
        // reads (ea.photoRadius, eaBase.photoRadius fallback)
        // and W = midlineStrokeWidth(). The font helper shares
        // the sqrt(R x W) subexpression with sxIconRadius but
        // does NOT inherit the icon floor (12 x mapFontScale):
        // fonts are never floored. At the baked defaults
        // (fontScale 120, centre 90: W = 2,640, R = 80,782.20,
        // sqrt(RW) = 14,603.60) the sizes are glance 2,640,
        // depth 1 = 14,603.60, depth 2 = 9,735.73, depth 3 =
        // 6,490.49 — the category text is ~5.5 ring-widths,
        // LARGER than the at-a-glance rings (owner's ruling
        // 2026-11-03 01:18 CST). sxFontFactor stays the
        // dimensionless ratio sxFontSize(depth) / F so every
        // follower scaled by it (Ga widths, Ka controls,
        // strokes, tags) tracks the new law without rescaling.
        function sxFontSize(depth) {
            if (!(depth > 0)) return sxFontMaster();
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.pow(2 / 3, depth - 1) * Math.sqrt(base * midlineStrokeWidth());
        }
        function sxFontFactor(depth) {
            return sxFontSize(depth) / sxFontMaster();
        }
        function sxFontCoef(depth) {
            return 22 * sxFontFactor(depth);
        }
        // SLIDER / TAG + STROKE DEPTH LADDER (ruled 2026-11-02
        // 14:51 and 14:52, Jason): sliders and tags scale in the
        // same way as the fonts, by depth from the ring-width
        // font master — the plain font scale times
        // sxFontFactor(depth): since the 2026-11-02 17:24
        // font law the factor is sxFontSize(depth) / F —
        // depth 1 sqrt(R/W), then x (2/3) per level — so
        // sliders, tags and strokes follow the FONT sizes
        // (the historical (8/9)^depth factors, depth 1 8/9,
        // depth 2 64/81, depth 3 512/729, are superseded).
        // The spoke stroke widths follow too: a spoke at a
        // depth is stroked at sxStrokeWidth(depth) =
        // sxFontSize(depth),
        // and its outline and tapered-stem base widths scale by
        // the same factor, so a spoke's whole body thins with
        // its depth. sxControlScale keeps the historical
        // per-type seed normalization (seed / 48, clamped
        // .62–1.25) the Ka / renderKinkLine controls and
        // sxSccBuild's tagM have always used, and multiplies it
        // by the depth factor. Depths are the icon/font depths:
        // 1 = category spokes, 2 = subcategory spokes and
        // kinks hanging straight off a category, 3 = kinks
        // under a subcategory (imported children included).
        // NOT laddered: the centre glance rings (they are the
        // master), the fixed screen-px hit strokes and the
        // 44px tap geometry (CSS vars / sxRailPx caps stay as
        // they are; each control now also publishes its own
        // depth-scaled rail thickness as scoped CSS vars), and
        // the solver estimate-space allowances (rr.*), which
        // never painted.
        function sxControlScale(depth, seed) {
            return Math.max(.62, Math.min(1.25, (Number(seed) || 48) / 48)) * mapFontScale() * sxFontFactor(depth);
        }
        function sxStrokeWidth(depth) {
            return sxFontSize(depth);
        }
        // Canonical stroke at the current font scale (BAND-SHRINK,
        // ruled 2026-11-02, Jason: "the band shrinks to fit the
        // letters; the 44 shrinks to 22"): the ring
        // thickness the midline strokes (Ka, renderKinkLine),
        // Ga.outlineWidth / Ga.CLOUD_OUTLINE_WIDTH, and
        // refreshCenterRing's w all derive from. Ga.midlineWidth
        // and MIDLINE_SCALE are gone; this 22 x mapFontScale
        // stroke is the only midline width.
        function midlineStrokeWidth() {
            return 22 * mapFontScale();
        }
        function refreshCenterRing() {
            const s = centerRingScale();
            ea.photoRadius = eaBase.photoRadius * s;
            // Pitch = stroke (label-scale repair): the rings anchor to
            // the scaled disc (radius follows centerRingScale) but step
            // outward by exactly one ring thickness w, and w follows the
            // FONT scale — so the three bands tile edge to edge at every
            // combination of the two independent scales. (Previously the
            // radii scaled by s while the CSS stroke stayed a fixed 44,
            // opening gaps of 44*(s-1).) BAND-SHRINK (2026-11-02): w is
            // now 22 * font scale, so the bands tile edge to edge at
            // the new width and the s = 1 radii sit one half-stroke
            // closer to the disc than the frozen eaBase values (which
            // were struck at w = 44); eaBase stays the frozen
            // reference the clearance below was derived from.
            // GLANCE_INNER_CLEARANCE is the
            // frozen 1.0-baseline gap between the photo edge and the
            // innermost ring's inner edge: 925.31 - 44/2 - 897.58 = 5.73
            // (eaBase.glanceRadii[2], base stroke 44, eaBase.photoRadius).
            // At s = 1 and w = 44 this reproduced the eaBase values
            // exactly: glanceRadii [1013.31, 969.31, 925.31] and
            // spokeStartRadius 1035.31 (the outer ring's outer edge,
            // 1013.31 + 44/2). Since the band shrink (w = 22 at font
            // scale 1) the same formulas give [958.31, 936.31, 914.31]
            // and spokeStartRadius 969.31 — pitch = w preserved.
            // eaBase.glanceRadii stays the frozen 1.0 reference. The stroke itself is published as the
            // --glance-ring-width CSS variable, consumed by the
            // .center-glance-ring-track/-value/-hit rules so the track,
            // value, and hit strokes all equal w on every render.
            // Derived values are rounded to 2 decimals (the precision of
            // every eaBase value) so the s = 1 / w = 44 baseline is
            // byte-exact, with no floating-point dust in the emitted radii.
            const GLANCE_INNER_CLEARANCE = 5.73, w = midlineStrokeWidth(), innerEdge = ea.photoRadius + GLANCE_INNER_CLEARANCE, r2 = v => Math.round(v * 100) / 100;
            ea.glanceRadii = [ r2(innerEdge + 5 * w / 2), r2(innerEdge + 3 * w / 2), r2(innerEdge + w / 2) ];
            ea.spokeStartRadius = r2(innerEdge + 3 * w);
            document.documentElement.style.setProperty("--glance-ring-width", String(w));
            // FQ2-BAKEIN (A4, position driver): the center "+N branches"
            // toggle follows the center ring. At scale 1 its fixed Y
            // (1839.37) sat 184.06 world units below the outer ring's
            // outer edge (ring bottom 620 + 1035.31 = 1655.31). Deriving
            // Y as centerY + scaled spokeStartRadius + 184.06 preserves
            // that exact offset at every centerRingScale.
            ea.branchToggleY = MAP_CENTER_Y + ea.spokeStartRadius + BRANCH_TOGGLE_DROP;
        }
        refreshCenterRing();
        // Gen-1 spoke base circle radius: the base disc IS the center ring
        // (each category spoke's base arc hugs the ring's outer edge), so
        // the base radius derives directly from the scaled ring radius —
        // no separate control. The per-spoke base WIDTH is set in
        // Za.categoryTaperBaseWidth: TAPER_BASE_FRACTION (0.78) of the
        // chord 2R sin(π/18), the 18-slot equispaced pitch at the ring's
        // outer edge R (slot arc length 2πR/18), CAPPED at the tuned-era
        // value (TAPER_BASE_CAP, the R = 300 chord — TAPER-BASE
        // RE-ANCHOR, 2026-11-02) so bases no longer grow with the ring;
        // the cap only ever shrinks the chord term, so bases always
        // keep a margin from their neighbours.
        function gen1SpokeBaseRadius() {
            return ea.spokeStartRadius;
        }
        function ta(e) {
            const t = Uc(), n = t.length, i = t.filter(t => {
                const n = (e || {})[t];
                return "number" == typeof n || Boolean(n && "object" == typeof n && (Object.prototype.hasOwnProperty.call(n, "give") || Object.prototype.hasOwnProperty.call(n, "receive")));
            }).length;
            return {
                rated: i,
                total: n,
                percent: n ? Math.round(i / n * 100) : 0
            };
        }
        function na(e = Xi()) {
            const t = Mt && ft[Mt] && "group" === ft[Mt].kind ? ft[Mt] : null, n = t && e.length < 2 ? t.sourceProfiles || [] : e.filter(e => e === Et || vt[e]).map(e => ({
                ratings: e === Et ? At : vt[e]
            }));
            if (!n.length) return {
                rated: 0,
                total: Uc().length,
                percent: 0
            };
            const i = n.map(e => ta(e.ratings || {})), a = i.reduce((e, t) => e + t.rated, 0), r = i.reduce((e, t) => e + t.total, 0);
            return {
                rated: a,
                total: r,
                percent: r ? Math.round(a / r * 100) : 0
            };
        }
        function aa(e, t, n = "") {
            const i = Math.max(1, Number(e.width) || 1), a = Math.max(1, Number(e.height) || 1), r = Math.max(1, Number(e.cropZoom) || 1), o = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), s = Math.max(t.w / i, t.h / a) * r, l = i * s, c = a * s, d = Number(e.cropX), u = Number(e.cropY), p = A(Number.isFinite(d) ? d : .5), h = A(Number.isFinite(u) ? u : .5), g = t.w / 2 - p * l, m = t.h / 2 - h * c;
            return `<svg${n ? ` class="${n}"` : ""} x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}" overflow="hidden"><image href="${e.data}" x="${g.toFixed(4)}" y="${m.toFixed(4)}" width="${l.toFixed(4)}" height="${c.toFixed(4)}" preserveAspectRatio="none" transform="rotate(${o.toFixed(2)} ${(t.w / 2).toFixed(2)} ${(t.h / 2).toFixed(2)})"/></svg>`;
        }
        function ra(e, t) {
            const n = Math.max(0, Math.min(100, Number(e) || 0)), i = 620 - t;
            if (n <= 0) return "";
            if (n >= 100) return `M 900 ${i} A ${t} ${t} 0 1 1 900 ${620 + t} A ${t} ${t} 0 1 1 900 ${i}`;
            const a = -Math.PI / 2 + 2 * Math.PI * n / 100, r = 900 + t * Math.cos(a), o = 620 + t * Math.sin(a);
            return `M 900 ${i} A ${t} ${t} 0 ${n > 50 ? 1 : 0} 1 ${r.toFixed(3)} ${o.toFixed(3)}`;
        }
        function oa() {
            const e = 3 === pc.length ? pc : [ {
                label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                count: 0,
                percent: 0,
                color: "var(--green)"
            }, {
                label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                count: 0,
                percent: 0,
                color: "var(--curious)"
            }, {
                label: "Not topics", // FQ2-BAKEIN: "No" -> "Not topics"
                count: 0,
                percent: 0,
                color: "var(--red)"
            } ], t = ea.glanceRadii, n = [ "Green", "Yellow", "Red" ], i = [ "green", "yellow", "red" ];
            return `<g class="center-glance-rings">${e.map((e, a) => `<g class="center-glance-ring"><circle class="center-glance-ring-track is-${i[a]}" cx="900" cy="620" r="${t[a]}"/><path class="center-glance-ring-value is-${i[a]}" id="centerGlanceRing${n[a]}" data-ring-radius="${t[a]}" d="${ra(e.percent, t[a])}" style="opacity:${e.percent ? 1 : 0}"/><circle class="center-glance-ring-hit" data-center-glance-index="${a}" cx="900" cy="620" r="${t[a]}" tabindex="0" role="button" aria-label="${Hi(e.label)}, ${e.percent} percent, ${e.count} ${1 === e.count ? "topic" : "topics"}. Open rating details."/></g>`).join("")}</g>`;
        }

        function syncGlobalVisibilityControl() {
            // LR-G5: the rating state (Sn) used to be mirrored into a
            // hidden button's textContent (former id layoutRatedToggle);
            // it now lives in the visible Topics shown radio group
            // itself — syncing checks the radio whose value is Sn.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.checked = r.value === Sn;
            });
        }
        function setGlobalTopicVisibility(t) {
            Sn = "rated" === t || "unrated" === t ? t : "all", kn = !0, xn = null;
            h.forEach(t => {
                un.set(catId(t.name), Sn), (t.subcategories || []).forEach(n => un.set(Un(t.name, n.name), Sn)),
                t.topics.forEach(t => un.set(Wn(t), Sn));
            }), Object.keys(qn).forEach(e => un.set(e, Sn)), syncGlobalVisibilityControl(), Mr({
                animate: !1,
                forceRepaint: !0
            });
        }
        {
            // LR-G5: the Topics shown radios drive global visibility
            // directly. The editor's change handler used to click the
            // hidden button (former id layoutRatedToggle) in a loop
            // until its text matched the chosen radio; the radios' own
            // change events now call the same setGlobalTopicVisibility
            // the button's click handler cycled into.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.addEventListener("change", function() {
                    if (r.checked) setGlobalTopicVisibility(r.value);
                });
            }), syncGlobalVisibilityControl();
        }
        function sa(e) {
            if (mn.staticMap) return;
            e.target && e.target.closest && __sxClosestAction(e.target, "centerBranchToggle") && ("keydown" === e.type && "Enter" !== e.key && " " !== e.key || (e.preventDefault(),
            e.stopImmediatePropagation(), setGlobalTopicVisibility("rated" === Sn ? "all" : "rated")));
        }
        function la(e) {
            if (!tn[e]) {
                const t = new Set(Object.values(tn));
                tn[e] = nn.find(e => !t.has(e)) || nn[Object.keys(tn).length % nn.length];
            }
            return tn[e];
        }
        function ca(e, t) {
            const n = (t === Et ? At : vt[t] || {})[e];
            if ("number" == typeof n) return {
                give: n,
                receive: n,
                giveKnown: !0,
                receiveKnown: !0
            };
            if (n && "object" == typeof n) {
                const e = Object.prototype.hasOwnProperty.call(n, "give"), t = Object.prototype.hasOwnProperty.call(n, "receive");
                return {
                    give: e && Number(n.give) || 0,
                    receive: t && Number(n.receive) || 0,
                    giveKnown: e,
                    receiveKnown: t
                };
            }
            return {
                give: 0,
                receive: 0,
                giveKnown: !1,
                receiveKnown: !1
            };
        }
        function da(e, t) {
            const U = (give, receive, gk, rk, gd, rd, gr, rr, total) => ({
                give: give,
                receive: receive,
                giveKnown: gk,
                receiveKnown: rk,
                giveDerived: gd,
                receiveDerived: rd,
                giveRatedChildren: gr,
                receiveRatedChildren: rr,
                childCount: total
            });
            if (isCatId(e)) {
                const c = h.find(c => catId(c.name) === e);
                if (!c) return U(0, 0, !1, !1, !1, !1, 0, 0, 0);
                const d = ca(e, t), g = cuCat(c, t, "give"), r = cuCat(c, t, "receive"), gv = d.giveKnown ? d.give : g.value, rv = d.receiveKnown ? d.receive : r.value;
                return U(null === gv ? 0 : gv, null === rv ? 0 : rv, null !== gv, null !== rv, !d.giveKnown && null !== g.value, !d.receiveKnown && null !== r.value, d.giveKnown ? 0 : g.rated, d.receiveKnown ? 0 : r.rated, g.total);
            }
            const z = zn(e);
            if (z) {
                const d = ca(e, t), ids = z.topics.map(Wn).concat(ai(e, t)), ch = ids.map(id => da(id, t)), one = dir => {
                    if (d[dir + "Known"]) return {
                        value: d[dir],
                        rated: 0,
                        direct: !0
                    };
                    const k = ch.filter(c => c[dir + "Known"]);
                    return k.length ? {
                        value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                        rated: k.length
                    } : {
                        value: null,
                        rated: 0
                    };
                }, g = one("give"), r = one("receive");
                return U(null === g.value ? 0 : g.value, null === r.value ? 0 : r.value, null !== g.value, null !== r.value, !g.direct && null !== g.value, !r.direct && null !== r.value, g.rated, r.rated, ids.length);
            }
            const n = ca(e, t);
            if (!Xn(e)) return U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0);
            const ids = ai(e, t);
            if (!ids.length) return U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0);
            const ch = ids.map(id => da(id, t)), one = dir => {
                if (n[dir + "Known"]) return {
                    value: n[dir],
                    rated: 0,
                    derived: !1,
                    known: !0
                };
                const k = ch.filter(c => c[dir + "Known"]);
                return k.length ? {
                    value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                    rated: k.length,
                    derived: !0,
                    known: !0
                } : {
                    value: 0,
                    rated: 0,
                    derived: !1,
                    known: !1
                };
            }, g = one("give"), r = one("receive");
            return U(g.value, r.value, g.known, r.known, g.derived, r.derived, g.rated, r.rated, ids.length);
        }
        function ua(e, t) {
            const n = ca(e, t), i = [];
            return n.giveKnown && i.push(n.give), n.receiveKnown && i.push(n.receive), i.length ? i.reduce((e, t) => e + t, 0) / i.length : null;
        }
        function pa(e, t, n) {
            let i = 0, a = 0;
            return e.forEach(e => {
                const r = n(e);
                null != r && (i += r, a++);
            }), a ? Math.max(-100, Math.min(100, i / a)) : null;
        }
        function ha(e, t, n) {
            const i = ca(e, t);
            return "give" === n ? i.giveKnown ? i.give : null : i.receiveKnown ? i.receive : null;
        }
        function ga(e, t) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id));
        }
        function ma(e, t) {
            return pa(ga(e, t), t, e => ua(e, t));
        }
        function smSub(e, t, n, i) {
            const a = (e?.topics || []).map(Wn).concat(i ? ai(i, t) : []);
            return pa(a, t, e => ha(e, t, n));
        }
        function sgSub(e) {
            for (const t of h) for (const n of t.subcategories || []) if (Un(t.name, n.name) === e) return n;
            return null;
        }
        function cuCat(e, t, n) {
            const s = e.subcategories || [], u = [];
            if (!s.length) ga(e, t).forEach(x => u.push(ha(x, t, n))); else {
                (e.parentTopics || []).forEach(l => u.push(ha(Wn(l), t, n)));
                s.forEach(g => u.push(smSub(g, t, n, Un(e.name, g.name))));
                const d = new Set(s.map(g => Un(e.name, g.name)));
                Object.values(at[t] || {}).filter(x => x.branch === e.name && !d.has(x.parentId)).forEach(x => u.push(ha(x.id, t, n)));
            }
            const k = u.filter(v => null != v);
            return {
                value: k.length ? Math.max(-100, Math.min(100, k.reduce((a, b) => a + b, 0) / k.length)) : null,
                rated: k.length,
                total: u.length
            };
        }
        function fa(e, t, n) {
            return cuCat(e, t, n).value;
        }
        function ya(e, t, n, i) {
            if (null == i && e) for (const c of h) {
                const s = (c.subcategories || []).find(s => s === e);
                if (s) {
                    i = Un(c.name, s.name);
                    break;
                }
            }
            return smSub(e, t, n, i);
        }
        function ba(e) {
            const t = Math.round(Number(e) || 0);
            return t > 0 ? "+" + t : String(t);
        }
        function va(e, t = Vi()) {
            if (Rt) return "Rating value hidden in Blind match.";
            const n = Qi() ? Ua(e) : null;
            if (n) return `Heat map value: ${n.count} of ${n.total} overlaid profiles are into this.`;
            if (isCatId(e)) {
                const n = h.find(t => catId(t.name) === e);
                if (!n) return "Unrated.";
                const i = fa(n, t, "give"), a = fa(n, t, "receive"), o = [];
                return null !== i && o.push(`give ${ba(i)}`), null !== a && o.push(`receive ${ba(a)}`), o.length ? "Category values: " + o.join(" · ") + "." : "Unrated.";
            }
            const z = zn(e);
            if (z) {
                const g = sgSub(e), gv = g ? smSub(g, t, "give", e) : null, rv = g ? smSub(g, t, "receive", e) : null, a = [];
                return null !== gv && a.push(`give ${ba(gv)}`), null !== rv && a.push(`receive ${ba(rv)}`), a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
            }
            const i = ca(e, t), a = [];
            return i.giveKnown && a.push(`give ${ba(i.give)}`), i.receiveKnown && a.push(`receive ${ba(i.receive)}`), a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
        }
        function wa(e, t, n = Vi()) {
            return `${lo(t)} ${va(e, n)}`;
        }
        function ka(e, t, n = "", i = {}) {
            const a = [ t, n ].filter(Boolean).join(" "), r = i.tapFirst ? " data-tooltip-tap-first" : !1 === i.hoverOnly ? "" : " data-tooltip-hover-only";
            return ` data-ui-tooltip="${Hi(a)}" data-tooltip-name="${Hi(e || "Details")}" data-tooltip-definition="${Hi(t || "")}" data-tooltip-value="${Hi(n || "")}"${r}`;
        }
        function xa(e, t = Vi()) {
            return va(e, t).replace(/^(?:Category|Rating) values?:\s*/i, "").replace(/\.$/, "");
        }
        function Sa(e, t, n = Vi(), i = {}) {
            return ka(t?.label || "Topic", lo(t), xa(e, n), i);
        }
        function $a(e, t, n = Vi()) {
            const i = ei(e, t, n) || Jn(e, t, n), a = da(e, n);
            return `${i}. ${a[t + "Known"] ? `Rating ${ba(a[t])}.` : "Unrated."}`;
        }
        function Ea(e, t = {}, n = {}, i = {}) {
            const a = e.topics.map(e => Wn(e)).concat(Object.values(i || {}).filter(t => t && t.branch === e.name).map(e => e.id));
            let r = null;
            return a.forEach(e => {
                if (n && "favorite" === n[e]) return void (r = 100);
                const i = t && t[e];
                "number" == typeof i ? r = null === r ? Number(i) : Math.max(r, Number(i)) : i && "object" == typeof i && [ "give", "receive" ].forEach(e => {
                    Object.prototype.hasOwnProperty.call(i, e) && Number.isFinite(Number(i[e])) && (r = null === r ? Number(i[e]) : Math.max(r, Number(i[e])));
                });
            }), r;
        }
        function Aa(e) {
            // The popover runs Revealed (0) to Concealed (100), and the
            // number it shows is the minimum rating that stays visible.
            // Unrated topics have no rating, so they stay hidden whenever
            // the veil is on. A level of 83 hides a 73 and keeps a 93.
            return av(e);
        }
        function Ca(e, t = {}, n = {}) {
            if (n && "favorite" === n[e]) return 100;
            if (n && ("limit" === n[e] || "notinterested" === n[e])) return -100;
            const i = t && t[e], a = [];
            return "number" == typeof i && Number.isFinite(Number(i)) ? a.push(Number(i)) : i && "object" == typeof i && [ "give", "receive" ].forEach(e => {
                Object.prototype.hasOwnProperty.call(i, e) && Number.isFinite(Number(i[e])) && a.push(Number(i[e]));
            }), a.length ? Math.max(...a) : null;
        }
        function Ma(e, t) {
            const n = catId(e.name), i = ft[t], a = i && "group" === i.kind && Array.isArray(i.sourceIds) ? i.sourceIds.filter(e => vt[e] && vht[e]) : [];
            if (a.length) return a.every(t => {
                const i = Qe[t]?.[n];
                if ("favorite" === i) return !0;
                if ("limit" === i) return Aa(vpt[t]) <= -100;
                const a = Ea(e, vt[t], Qe[t], at[t]);
                return null !== a && a >= Aa(vpt[t]);
            });
            const r = i && "group" === i.kind && Array.isArray(i.sourceProfiles) ? i.sourceProfiles.filter(e => e && (e.veilEnabled ?? e.netEnabled)) : [];
            if (r.length) return r.every(t => {
                const i = t.annotations?.[n];
                if ("favorite" === i) return !0;
                if ("limit" === i) return Aa(null != t.veil ? t.veil : t.net) <= -100;
                const a = Ea(e, t.ratings, t.annotations, t.importedChildren);
                return null !== a && a >= Aa(null != t.veil ? t.veil : t.net);
            });
            const o = Qe[t]?.[n];
            if ("favorite" === o) return !0;
            if ("limit" === o) return Aa(vpt[t]) <= -100;
            const s = Ea(e, vt[t], Qe[t], at[t]);
            return null !== s && s >= Aa(vpt[t]);
        }
        function Ia(e = Mt) {
            const t = ft[e];
            if (t && "group" === t.kind) {
                const e = Array.isArray(t.sourceIds) ? t.sourceIds.filter(e => vt[e]) : [];
                return e.length ? e.some(e => vht[e]) : Array.isArray(t.sourceProfiles) && t.sourceProfiles.some(e => e && (e.veilEnabled ?? e.netEnabled));
            }
            return Boolean(vht[e] || $n);
        }
        function Pa(e, t) {
            const n = da(e, t), i = qn[e];
            if (!i || "Category" === i.kind || !i.parentId) return n;
            const a = da(i.parentId, t);
            return {
                give: n.giveKnown ? n.give : a.give,
                receive: n.receiveKnown ? n.receive : a.receive,
                giveKnown: n.giveKnown || a.giveKnown,
                receiveKnown: n.receiveKnown || a.receiveKnown
            };
        }
        function La(e, t, n) {
            // Per-topic pair classification now comes from the sync engine
            // v1.1 topic outcome for the pair (cached per render pass).
            const r = sxPairByIds(t, n), rec = r && r.topicsById[e];
            if (!rec) return "other";
            return "match" === rec.outcome ? "mutual" : "curious-fit" === rec.outcome ? "explore" : "conflict" === rec.outcome || "one-sided" === rec.outcome || "limit-blocked" === rec.outcome ? "mismatch" : "other";
        }
        function Ta() {
            const e = Yi();
            if (e.length >= 2) return e;
            const t = Kd(), n = Array.isArray(t?.sourceIds) ? t.sourceIds.filter(e => vt[e]) : [];
            return n.length >= 2 ? n : [];
        }
        function Fa() {
            return Ta().length >= 2 || Boolean(Kd());
        }

        // Phase 2: Semantic function bridge
        const sxIsVeilActive = Ia;
        const sxGetComparisonProfileIds = Ta;
        const sxIsComparisonActive = Fa;
        const sxGetTopicStance = ca;
        const sxGetTopicScore = Ca;
        const sxMapVeilThreshold = Aa;
        const sxGetActiveProfileOrDefault = Vi;
        const sxGetComparisonOutcome = di;
        const sxGetActiveOrComparisonProfiles = Xi;

        window.SexcapadesEngine = window.SexcapadesEngine || {};
        window.SexcapadesEngine.Profiles = {
            isVeilActive: sxIsVeilActive,
            getComparisonProfileIds: sxGetComparisonProfileIds,
            isComparisonActive: sxIsComparisonActive,
            getActiveProfileOrDefault: sxGetActiveProfileOrDefault,
            getActiveOrComparisonProfiles: sxGetActiveOrComparisonProfiles,
            getComparisonOutcome: sxGetComparisonOutcome,
            autoSelect: sxAutoSelect
        };
        window.SexcapadesEngine.Topics = {
            getStance: sxGetTopicStance,
            getScore: sxGetTopicScore,
            getVeilThreshold: sxMapVeilThreshold
        };
        function Na(e) {
            if (!Rt || isCatId(e)) return !1;
            const t = Ta();
            if (t.length >= 2) {
                for (let n = 0; n < t.length; n++) for (let i = n + 1; i < t.length; i++) if ("mutual" !== La(e, t[n], t[i])) return !1;
                return !0;
            }
            return "mutual" === di(e);
        }
        function _a() {
            const t = e.byId("blindModeSummary"), i = e.byId("blindModeHeading"), a = e.byId("blindModeList");
            if (!t || !i || !a) return;
            if (t.hidden = !Rt, !Rt) return void a.replaceChildren();
            const r = Rt ? Uc().filter(Na).map(e => {
                const t = qn[e] || Xn(e) || li().find(t => t.id === e);
                return t ? {
                    id: e,
                    label: t.label,
                    branch: t.branch
                } : null;
            }).filter(Boolean).sort((e, t) => e.branch.localeCompare(t.branch) || e.label.localeCompare(t.label)) : [];
            i.textContent = `You match on ${r.length} ${1 === r.length ? "topic" : "topics"}`, 
            n(a, r.length ? r.map(e => `<li><span>${Hi(e.label)}</span><small>${Hi(e.branch)}</small></li>`).join("") : "<li><span>No shared Want to do topics yet.</span></li>");
        }
        function Da() {
            const t = Fa(), n = e.byId("blindModeToggle"), i = an && Yi().length >= 2 && !Kd();
            i && "mutual" === Pt && (Pt = "all"), Rt && !t && (Rt = !1, Pt = Ot || "all"), document.body.classList.toggle("blind-mode", Rt), 
            n && (n.setAttribute("aria-pressed", String(Rt)), n.disabled = !t), e.all("[data-filter]").forEach(e => {
                const t = "mutual" === e.dataset.filter;
                // FQ2-BAKEIN: filter-chip tooltip below "shared Want to do topics" -> "shared Hot topics" (redundant trailing "topics" dropped: the new name already ends in "topics")
                e.disabled = Rt, e.setAttribute("aria-disabled", String(i && t)), t && e.setAttribute("data-ui-tooltip", i ? "Cast the selected profiles together first, or select a single profile, to score shared Hot topics." : "Show topics the selected profiles can enjoy together: one person wants to give what another wants to receive."), e.setAttribute("aria-pressed", String(Rt ? t : e.dataset.filter === Pt));
            }), _a();
        }
        function Ra(e) {
            if (Rt) return Na(e) ? "mutual" : "other";
            const t = di(e);
            if (t) return t;
            // Single-profile tab: classify by this profile's own ratings (Build 2026-10-17)
            const mt = Mt && ft[Mt];
            if (mt && "group" !== mt.kind && vt[Mt]) {
                return RaSingle(e, Mt);
            }
            const n = Qi() ? Xi() : Object.keys(wt), i = [];
            for (let t = 0; t < n.length; t++) for (let a = t + 1; a < n.length; a++) i.push(La(e, n[t], n[a]));
            return i.includes("mismatch") ? "mismatch" : i.includes("mutual") ? "mutual" : i.includes("explore") ? "explore" : "other";
        }
        function RaSingle(e, t) {
            // Classify a topic by a single profile's own ratings for individual-tab filters.
            // "mutual" = Want to do (green): strong want in either direction.
            // "explore" = Curious about (yellow): moderate interest.
            // "mismatch" = Mismatched (red): strong aversion or hard limit.
            if ("limit" === Qe[t]?.[e]) return "mismatch";
            const r = Pa(e, t), s = 35;
            if ((r.giveKnown && r.give > s) || (r.receiveKnown && r.receive > s)) return "mutual";
            if ((r.giveKnown && r.give <= -s) || (r.receiveKnown && r.receive <= -s)) return "mismatch";
            if ((r.giveKnown && r.give > 20) || (r.receiveKnown && r.receive > 20)) return "explore";
            return "other";
        }
        function Oa(e, t) {
            const n = Qe[t]?.[e];
            if (n) return n;
            const i = qn[e];
            return i && "Category" !== i.kind && (i.parentId && Qe[t]?.[i.parentId] || Qe[t]?.[catId(i.branch)]) || null;
        }
        function Ba(e, t, n) {
            if (Qe[t]?.[e] === n) return !0;
            const i = qn[e];
            return !(!i || "Category" === i.kind) && Boolean(i.parentId && Qe[t]?.[i.parentId] === n || Qe[t]?.[catId(i.branch)] === n);
        }
        function ja(e, t) {
            return Ba(e, t, "limit") || Ba(e, t, "notinterested");
        }
        function qa(e, t) {
            return (Qi() ? Xi() : [ Vi() ]).some(n => Boolean(t[n]?.[e]));
        }
        function Ha(e, t) {
            return Boolean(Je[t]?.[e]);
        }
        function Wa(e, t) {
            return Boolean(et[t]?.[e]);
        }
        function Ua(e) {
            const t = Xi(), n = 35;
            if (t.length < 3) return null;
            const i = t.filter(t => {
                if ("limit" === Oa(e, t)) return !1;
                const i = Pa(e, t);
                return i.giveKnown && i.give > n || i.receiveKnown && i.receive > n || "favorite" === Oa(e, t);
            }).length;
            if (!i) return null;
            const a = (i - 1) / Math.max(1, t.length - 1), r = [ 74, 158, 190 ], o = [ 255, 104, 91 ];
            return {
                count: i,
                total: t.length,
                color: `rgb(${Math.round(r[0] + (o[0] - r[0]) * a)},${Math.round(r[1] + (o[1] - r[1]) * a)},${Math.round(r[2] + (o[2] - r[2]) * a)})`
            };
        }
        Cn.addEventListener("pointerdown", sa, !0), Cn.addEventListener("keydown", sa, !0);
        /* ================= SpokeGeometry module — BEGIN ================= */
        /* ================================================================
           SpokeGeometry — spoke path geometry for the map renderer.
           (Refactor Step 3, Build 2026-10-18_0804: extracted from the Ga
           namespace, where taperedPath / flankPaths previously lived as
           methods. Ga.taperedPath and Ga.flankPaths remain as one-line
           delegates so any other caller keeps working; new code should
           call SpokeGeometry directly. Behavior is byte-identical to the
           pre-refactor Ga implementations — see the differential
           path-string test recorded in the build comment in index.html.)

           A "spoke" is the tapered band drawn from a parent node (the
           center node or a subcategory hub) out to a child node's icon.
           Two shapes are built here:

           - taperedPath: one filled band with a single color.
           - flankPaths: two filled bands ("flanks"), one per side of the
             centerline, so give and receive can carry different colors.

           Both shapes can hug two circles with concave arcs:

           - Tip circle (wraps the CHILD icon): when a valid tip circle
             is supplied, the flat tip edge is replaced by an arc that
             follows the icon's circumference. The two tip corners are
             projected radially onto the circle (corner -> ray from the
             circle center -> point at distance r), and the SVG arc is
             drawn between the projections with large-arc = 0. The sweep
             flag is chosen from the sign of the cross product of the two
             corner vectors (taken from the circle center), which selects
             the arc on the spoke-facing side of the circle — the short
             way around the back of the icon — never the arc that would
             cut through the icon disc.

           - Base circle (wraps the PARENT disc): symmetric trick at the
             other end. The base corners are projected radially onto the
             parent disc and joined by an arc along its circumference
             (same cross-product sweep rule), so the band's base follows
             the disc edge instead of cutting a flat chord across it.
             A base circle is ignored when the segment starts deep
             inside it (start within 0.5 * r of the disc center): those
             are center-drawn segments whose base is meant to stay
             buried under the parent node.

           All coordinates and lengths are in map units (SVG user units
           of the map viewBox). Widths are FULL widths: a corner is
           offset width / 2 to either side of the centerline.
           ================================================================ */
        const SpokeGeometry = (() => {
            /** Polyline samples per flank edge (matches the old Ga.SAMPLES). */
            const SAMPLES = 12;
            /** Flare falloff rate: flank width decays exponentially from base width to tip width along the spoke (matches the old Ga.FLARE_DECAY). */
            const FLARE_DECAY = 1;
            /** Narrow-tip cap: radius (map units) of the convex semicircular cap a near-zero-width tip earns. */
            const NARROW_TIP_CAP_RADIUS = 24;
            /** Narrow-tip cap: a narrow tip earns its cap only when the segment is longer than this (map units). */
            const NARROW_TIP_MIN_LENGTH = 25;
            /** Deep-start threshold: a base/tip disc is ignored when the segment starts closer than this fraction of the disc radius to its center. */
            const DEEP_START_FRACTION = 0.5;
            /**
             * Describe the straight segment from (x0, y0) to (x1, y1).
             * @param {number} x0 - Start x, map units.
             * @param {number} y0 - Start y, map units.
             * @param {number} x1 - End x, map units.
             * @param {number} y1 - End y, map units.
             * @returns {{x0:number, y0:number, x1:number, y1:number, dx:number, dy:number, len:number, ux:number, uy:number, nx:number, ny:number}}
             *   dx/dy = end - start; len = segment length (1 when degenerate);
             *   (ux, uy) = unit direction; (nx, ny) = unit normal (-uy, ux).
             */
            function segment(x0, y0, x1, y1) {
                const a = x1 - x0, r = y1 - y0, o = Math.hypot(a, r) || 1, s = a / o, l = r / o;
                return {
                    x0: x0,
                    y0: y0,
                    x1: x1,
                    y1: y1,
                    dx: a,
                    dy: r,
                    len: o,
                    ux: s,
                    uy: l,
                    nx: -l,
                    ny: s
                };
            }
            /**
             * Parse a spoke centerline path string of the form "M x0 y0 L x1 y1".
             * @param {string} d - SVG path data for the centerline.
             * @returns {object|null} A segment() descriptor, or null when the
             *   string does not match the expected M/L shape.
             */
            function parseSegment(d) {
                const t = String(d || "").match(/M\s*([\d.-]+)\s+([\d.-]+)\s+L\s*([\d.-]+)\s+([\d.-]+)/);
                return t ? segment(parseFloat(t[1]), parseFloat(t[2]), parseFloat(t[3]), parseFloat(t[4])) : null;
            }
            /**
             * Flank width at a fractional position along the spoke. The width
             * starts at the base width and decays exponentially toward the
             * tip width, so flanks flare wide at the base and settle fast.
             * @param {number} u - Fraction along the spoke: 0 at base, 1 at tip (unitless).
             * @param {number} baseWidth - Full width at the base, map units.
             * @param {number} tipWidth - Full width approached at the tip, map units.
             * @returns {number} Full width at u, map units.
             */
            function flareAt(u, baseWidth, tipWidth) {
                return tipWidth + (baseWidth - tipWidth) * Math.exp(-FLARE_DECAY * u);
            }
            /**
             * Build the tip circle for a spoke: the circle of the CHILD icon
             * that the spoke's tip arc hugs.
             *
             * Callers pass the spoke's drawn endpoint (x1, y1), which stops
             * (r - 1.5) map units short of the icon's center along the spoke
             * direction. This helper reconstructs the icon center by pushing
             * the endpoint that same distance further along the unit spoke
             * direction, so the returned circle IS the icon disc: its near
             * edge sits 1.5 units behind the drawn endpoint and the tip arc
             * wraps the icon's back edge.
             * @param {number} x0 - Spoke base x, map units.
             * @param {number} y0 - Spoke base y, map units.
             * @param {number} x1 - Spoke drawn endpoint (tip) x, map units.
             * @param {number} y1 - Spoke drawn endpoint (tip) y, map units.
             * @param {number} [iconSize] - Icon diameter, map units. Falsy or
             *   non-numeric values fall back to 48. The radius is clamped to
             *   at least 12.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildTipCircle(x0, y0, x1, y1, iconSize) {
                const tipSeg = segment(x0, y0, x1, y1), tipR = Math.max(12, (Number(iconSize) || 48) / 2), tipBack = Math.max(0, tipR - 1.5);
                return {
                    x: x1 + tipSeg.ux * tipBack,
                    y: y1 + tipSeg.uy * tipBack,
                    r: tipR
                };
            }
            /**
             * Build a base circle for a spoke: the PARENT disc that the
             * spoke's base arc hugs (the center node's disc for category
             * spokes, or a subcategory hub's disc for imported-child
             * spokes). A plain {x, y, r} factory so call sites name the
             * intent instead of inlining an anonymous circle object.
             * @param {number} cx - Disc center x, map units.
             * @param {number} cy - Disc center y, map units.
             * @param {number} r - Disc radius, map units.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildBaseCircle(cx, cy, r) {
                return {
                    x: cx,
                    y: cy,
                    r: r
                };
            }
            /**
             * Build a single-color tapered spoke band as SVG path data.
             *
             * Outline order: start at one base corner, run to the same-side
             * tip corner, cross the tip, come back down the other side, and
             * cross the base (the Z close). Both crossings are replaceable
             * by concave circle arcs (see the module header):
             * - Tip: when tipCircle is a valid circle (r > 0), the path first steps
             *   from the tip corner to its radial projection on the tip
             *   circle, arcs along the circumference to the other corner's
             *   projection (sweep from the cross-product sign, spoke-facing
             *   side), and continues. With no valid circle the tip stays a
             *   flat edge between the two tip corners.
             * - Narrow tip: when tipWidth <= 0.5 and the segment is longer
             *   than NARROW_TIP_MIN_LENGTH (25 units), the tip instead gets
             *   a CONVEX semicircular cap of radius NARROW_TIP_CAP_RADIUS
             *   (24) around the endpoint (this branch wins over the
             *   tip-circle arc; it is how zero-width heat spokes round off).
             * - Base: when baseCircle is a valid disc and the segment does
             *   not start deep inside it (start at least
             *   DEEP_START_FRACTION * baseCircle.r from the disc center),
             *   the path starts and ends on the base corners' projections
             *   onto the disc and the closing edge is an arc along the
             *   disc; otherwise the base stays flat.
             * @param {string} pathData - Centerline path string "M x0 y0 L x1 y1", map units. Returned unchanged when unparseable.
             * @param {number} baseWidth - Base width, map units (corners offset +/- baseWidth/2 from the centerline).
             * @param {number} tipWidth - Tip width, map units (corners offset +/- tipWidth/2).
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon), from buildTipCircle. Null/invalid = flat tip.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base disc (parent), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @returns {string} SVG path data for the filled band.
             */
            function taperedPath(pathData, baseWidth, tipWidth, tipCircle = null, baseCircle = null) {
                const i = parseSegment(pathData);
                if (!i) return pathData;
                const {x0: a, y0: r, x1: o, y1: s, nx: l, ny: c} = i, d = r + c * baseWidth / 2, u = a - l * baseWidth / 2, p = r - c * baseWidth / 2, h = o - l * tipWidth / 2, g = s - c * tipWidth / 2, m = o + l * tipWidth / 2, f = s + c * tipWidth / 2;
                // Build 2026-10-18_0343: optional base disc (baseCircle) — the
                // flat base edge is replaced by an arc along the disc,
                // mirroring the tip arc: both base corners are projected onto
                // the disc and the path starts/ends on the projections, so
                // the band hugs the parent circle. Ignored for center-drawn
                // segments.
                const zbP = baseCircle && baseCircle.r > 0 && Math.hypot(a - baseCircle.x, r - baseCircle.y) >= DEEP_START_FRACTION * baseCircle.r ? function() {
                    const v1 = { x: a + l * baseWidth / 2 - baseCircle.x, y: d - baseCircle.y }, v2 = { x: u - baseCircle.x, y: p - baseCircle.y }, m1 = Math.hypot(v1.x, v1.y) || 1, m2 = Math.hypot(v2.x, v2.y) || 1, q1 = { x: baseCircle.x + baseCircle.r * v1.x / m1, y: baseCircle.y + baseCircle.r * v1.y / m1 }, q2 = { x: baseCircle.x + baseCircle.r * v2.x / m2, y: baseCircle.y + baseCircle.r * v2.y / m2 }, crx = v2.x * v1.y - v2.y * v1.x;
                    return { q1: q1, q2: q2, swp: crx >= 0 ? 1 : 0 };
                }() : null, bSX = zbP ? zbP.q1.x : a + l * baseWidth / 2, bSY = zbP ? zbP.q1.y : d, bTail = zbP ? ` L ${zbP.q2.x.toFixed(2)} ${zbP.q2.y.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${zbP.swp} ${zbP.q1.x.toFixed(2)} ${zbP.q1.y.toFixed(2)} Z` : ` L ${u.toFixed(2)} ${p.toFixed(2)} Z`;
                if (tipWidth <= .5) {
                    const dx = o - a, dy = s - r, L = Math.hypot(dx, dy);
                    if (L > NARROW_TIP_MIN_LENGTH) {
                        const R = NARROW_TIP_CAP_RADIUS, ux = dx / L, uy = dy / L, ex = o - ux * R, ey = s - uy * R, wE = (baseWidth + (tipWidth - baseWidth) * (L - R) / L) / 2, c1x = ex + l * wE, c1y = ey + c * wE, c2x = ex - l * wE, c2y = ey - c * wE, d1 = Math.hypot(c1x - o, c1y - s) || 1, d2 = Math.hypot(c2x - o, c2y - s) || 1, p1x = o + R * (c1x - o) / d1, p1y = s + R * (c1y - s) / d1, p2x = o + R * (c2x - o) / d2, p2y = s + R * (c2y - s) / d2, cross = (p1x - o) * (p2y - s) - (p1y - s) * (p2x - o), sweep = cross >= 0 ? 1 : 0;
                        return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${R} ${R} 0 0 ${sweep} ${p2x.toFixed(2)} ${p2y.toFixed(2)}${bTail}`;
                    }
                }
                if (tipCircle && tipCircle.r > 0) {
                    const sv = {
                        x: m - tipCircle.x,
                        y: f - tipCircle.y
                    }, ev = {
                        x: h - tipCircle.x,
                        y: g - tipCircle.y
                    }, sm2 = Math.hypot(sv.x, sv.y) || 1, em2 = Math.hypot(ev.x, ev.y) || 1, spx = tipCircle.x + tipCircle.r * sv.x / sm2, spy = tipCircle.y + tipCircle.r * sv.y / sm2, epx = tipCircle.x + tipCircle.r * ev.x / em2, epy = tipCircle.y + tipCircle.r * ev.y / em2, crx = sv.x * ev.y - sv.y * ev.x, swp = crx >= 0 ? 1 : 0;
                    return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${spx.toFixed(2)} ${spy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${swp} ${epx.toFixed(2)} ${epy.toFixed(2)}${bTail}`;
                }
                return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${h.toFixed(2)} ${g.toFixed(2)}${bTail}`;
            }
            /**
             * Build the split give/receive flank bands for one spoke, as SVG
             * path data. Each flank is one side of the spoke: an OUTER edge
             * that flares from the base width toward the tip width (see
             * flareAt, sampled at SAMPLES + 1 points) and an INNER edge at
             * the fixed inner half-width innerHalf, so the two flanks leave
             * the center stripe (half-width stripeHalf) uncovered for the
             * midline.
             *
             * Emission order — what "first" means in the mode string: the
             * mode names which EDGE POLYLINE IS EMITTED FIRST in each
             * flank's path string.
             * - "innerFirst" (branch spokes: category and subcategory
             *   spokes drawn by the Ka renderer): each flank starts with
             *   its INNER edge polyline running base -> tip, then the tip
             *   arc (inner offset innerHalf out to the flared tip offset),
             *   then the OUTER edge polyline reversed (tip -> base), then
             *   the base arc (flared base offset in to inner offset
             *   innerHalf).
             * - "outerFirst" (kink spokes drawn by renderKinkLine): each
             *   flank starts with its OUTER edge polyline running
             *   base -> tip, then the tip arc (flared tip offset in to
             *   inner offset innerHalf), then a freshly built INNER edge
             *   polyline running tip -> base, then the base arc (inner
             *   offset innerHalf out to the flared base offset).
             * The two modes trace the same outline in opposite orders with
             * the arc connections mirrored; which one a spoke uses is
             * fixed by its renderer and level, and both produce the same
             * filled region.
             *
             * Circle hugging (see the module header for the general
             * mechanics): the base circle baseCircle, when valid and the
             * segment does not start deep inside it (start at least
             * DEEP_START_FRACTION * baseCircle.r from its center), first
             * pulls all four base corner points
             * radially onto the disc so the flanks themselves start on
             * the disc edge, and the base crossing is emitted as an arc
             * along the disc by the b() helper (skipped when the two
             * offsets are effectively equal). The tip circle tipCircle likewise
             * turns each flank's tip crossing into an arc along the icon
             * circumference via the bE() helper. Both helpers project the
             * crossing's endpoints onto their circle and pick the sweep
             * flag from the cross-product sign, so the arc always runs
             * along the spoke-facing side of the circle.
             * @param {number} baseX - Base point x, map units.
             * @param {number} baseY - Base point y, map units.
             * @param {number} dx - Base->tip delta x, map units. Tip point = (baseX + dx, baseY + dy).
             * @param {number} dy - Base->tip delta y, map units.
             * @param {number} nx - Unit normal x, unitless. Corners are offset along (nx, ny).
             * @param {number} ny - Unit normal y, unitless.
             * @param {number} baseWidth - Base width, map units: the flare's starting full width.
             * @param {number} tipWidth - Tip width, map units: the flare's limiting full width.
             * @param {number} innerHalf - Inner half-width, map units: fixed offset of each flank's inner edge from the centerline.
             * @param {number} stripeHalf - Center stripe half-width, map units: the flared edge offset is max(innerHalf, stripeHalf + flare / 2) so a flank never crosses the midline stripe.
             * @param {string} mode - Mode: "innerFirst" (branch spokes) or "outerFirst" (kink spokes). Any other value takes the outerFirst branch.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base circle (parent disc), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon). Null/invalid = flat tip crossing.
             * @returns {{top: string, bottom: string}} SVG path data for the two flanks: "top" is the (nx, ny)-negative side, "bottom" the positive side.
             */
            function flankPaths(baseX, baseY, dx, dy, nx, ny, baseWidth, tipWidth, innerHalf, stripeHalf, mode, baseCircle = null, tipCircle = null) {
                const p = SAMPLES, h = [], g = [], m = [], f = [];
                for (let si = 0; si <= p; si++) {
                    const frac = si / p, y = Math.max(innerHalf, stripeHalf + flareAt(frac, baseWidth, tipWidth) / 2), b = baseX + dx * frac, v = baseY + dy * frac;
                    h.push(`${(b - nx * y).toFixed(2)} ${(v - ny * y).toFixed(2)}`), g.push(`${(b - nx * innerHalf).toFixed(2)} ${(v - ny * innerHalf).toFixed(2)}`),
                    m.push(`${(b + nx * y).toFixed(2)} ${(v + ny * y).toFixed(2)}`), f.push(`${(b + nx * innerHalf).toFixed(2)} ${(v + ny * innerHalf).toFixed(2)}`);
                }
                // Build 2026-10-18_0343: spoke bases hug the parent disc. The
                // base-arc helper below only capped the base edge between the
                // corners' projections — the flank corners themselves stayed
                // outside the disc, joined by radial stubs that poked past
                // the circle. Now the four base corner points are projected
                // onto the base circle first, so the flanks themselves start
                // on the disc edge and the base follows the circle exactly.
                // A base circle is ignored when the segment starts deep
                // inside it (center-drawn segments keep the old flat base).
                baseCircle && baseCircle.r > 0 && Math.hypot(baseX - baseCircle.x, baseY - baseCircle.y) < DEEP_START_FRACTION * baseCircle.r && (baseCircle = null);
                if (baseCircle && baseCircle.r > 0) {
                    const pj = (e2, t2) => {
                        const n2 = e2 - baseCircle.x, i2 = t2 - baseCircle.y, a2 = Math.hypot(n2, i2) || 1;
                        return `${(baseCircle.x + baseCircle.r * n2 / a2).toFixed(2)} ${(baseCircle.y + baseCircle.r * i2 / a2).toFixed(2)}`;
                    }, y0 = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2);
                    h[0] = pj(baseX - nx * y0, baseY - ny * y0), g[0] = pj(baseX - nx * innerHalf, baseY - ny * innerHalf), m[0] = pj(baseX + nx * y0, baseY + ny * y0), f[0] = pj(baseX + nx * innerHalf, baseY + ny * innerHalf);
                }
                const y = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2), b = (side, startOff, endOff) => {
                    if (!baseCircle || !(baseCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + side * nx * startOff - baseCircle.x, y: baseY + side * ny * startOff - baseCircle.y}, end = {x: baseX + side * nx * endOff - baseCircle.x, y: baseY + side * ny * endOff - baseCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = baseCircle.x + baseCircle.r * start.x / sm, sy = baseCircle.y + baseCircle.r * start.y / sm, ex = baseCircle.x + baseCircle.r * end.x / em, ey = baseCircle.y + baseCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                const yE = Math.max(innerHalf, stripeHalf + flareAt(1, baseWidth, tipWidth) / 2), bE = (side, startOff, endOff) => {
                    if (!tipCircle || !(tipCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + dx + side * nx * startOff - tipCircle.x, y: baseY + dy + side * ny * startOff - tipCircle.y}, end = {x: baseX + dx + side * nx * endOff - tipCircle.x, y: baseY + dy + side * ny * endOff - tipCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = tipCircle.x + tipCircle.r * start.x / sm, sy = tipCircle.y + tipCircle.r * start.y / sm, ex = tipCircle.x + tipCircle.r * end.x / em, ey = tipCircle.y + tipCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                if ("innerFirst" === mode) return {
                    top: `M ${g.join(" L ")}${bE(-1, innerHalf, yE)} L ${h.slice().reverse().join(" L ")}${b(-1, y, innerHalf)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${f.slice().reverse().join(" L ")}${b(1, innerHalf, y)} Z`
                };
                const v = [], w = [];
                for (let si = p; si >= 0; si--) {
                    const px = baseX + dx * (si / p), py = baseY + dy * (si / p);
                    v.push(`${(px - nx * innerHalf).toFixed(2)} ${(py - ny * innerHalf).toFixed(2)}`), w.push(`${(px + nx * innerHalf).toFixed(2)} ${(py + ny * innerHalf).toFixed(2)}`);
                }
                baseCircle && baseCircle.r > 0 && (v[v.length - 1] = g[0], w[w.length - 1] = f[0]);
                return {
                    top: `M ${h.join(" L ")}${bE(-1, yE, innerHalf)} L ${v.join(" L ")}${b(-1, innerHalf, y)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${w.join(" L ")}${b(1, innerHalf, y)} Z`
                };
            }
            /**
             * Numeric unit tests for the circle-hugging geometry. Runnable
             * in the browser console / probe harness via
             * SpokeGeometry.runGeometryTests(), or in node by extracting this
             * module (between its BEGIN/END delimiters) and calling the
             * same function. Verifies, for both taperedPath and
             * flankPaths (innerFirst and outerFirst):
             * - every arc endpoint lies ON its circle (distance from the
             *   circle center == r, within rounding epsilon);
             * - concavity: a tip arc's midpoint sits BEHIND its chord
             *   midpoint (toward the spoke base), and a base arc's
             *   midpoint sits beyond its chord midpoint (toward the spoke
             *   tip) — i.e. each arc bows around its circle, not across it;
             * - the sweep flag routes the arc through that spoke-facing
             *   midpoint (the minor arc on the circle's spoke side), not
             *   through the through-icon antipode.
             * @returns {{passed:number, failed:number, failures:string[]}} Test tally; failures names each failed check.
             */
            function runGeometryTests() {
                const EPS = .025;
                let passed = 0;
                const failures = [];
                const check = (name, cond) => { cond ? passed++ : failures.push(name); };
                const distTo = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);
                const arcsOf = d => {
                    const out = [], re = /([ML])\s*([\d.-]+)\s+([\d.-]+)|A\s+([\d.]+)\s+[\d.]+\s+0\s+0\s+([01])\s+([\d.-]+)\s+([\d.-]+)/g;
                    let m, cur = null;
                    while ((m = re.exec(d))) {
                        if (m[1]) cur = { x: +m[2], y: +m[3] };
                        else if (cur) out.push({ r: +m[4], sweep: +m[5], x1: cur.x, y1: cur.y, x2: +m[6], y2: +m[7] }), cur = { x: +m[6], y: +m[7] };
                    }
                    return out;
                };
                const arcMid = (arc, c) => {
                    const a1 = Math.atan2(arc.y1 - c.y, arc.x1 - c.x), a2 = Math.atan2(arc.y2 - c.y, arc.x2 - c.x);
                    let sx = Math.cos(a1) + Math.cos(a2), sy = Math.sin(a1) + Math.sin(a2);
                    const m = Math.hypot(sx, sy) || 1;
                    return { x: c.x + c.r * sx / m, y: c.y + c.r * sy / m, a1: a1, a2: a2, amid: Math.atan2(sy, sx) };
                };
                const onSweptArc = (a1, amid, a2, sweep) => {
                    const TAU = Math.PI * 2, norm = x => ((x % TAU) + TAU) % TAU;
                    return sweep === 1 ? norm(amid - a1) <= norm(a2 - a1) + 1e-9 : norm(a1 - amid) <= norm(a1 - a2) + 1e-9;
                };
                const checkArc = (label, arc, circle, towardBase) => {
                    check(label + ": arc radius matches circle", Math.abs(arc.r - circle.r) < .01);
                    check(label + ": start point on circle", Math.abs(distTo(arc.x1, arc.y1, circle.x, circle.y) - circle.r) < EPS);
                    check(label + ": end point on circle", Math.abs(distTo(arc.x2, arc.y2, circle.x, circle.y) - circle.r) < EPS);
                    const mid = arcMid(arc, circle), chordX = (arc.x1 + arc.x2) / 2;
                    check(label + (towardBase ? ": arc midpoint behind chord (toward base)" : ": arc midpoint beyond chord (toward tip)"), towardBase ? mid.x < chordX - .05 : mid.x > chordX + .05);
                    check(label + ": sweep routes through spoke-facing midpoint", onSweptArc(mid.a1, mid.amid, mid.a2, arc.sweep));
                };
                // buildTipCircle / buildBaseCircle construction.
                const tc = buildTipCircle(0, 0, 100, 0, 48);
                check("buildTipCircle: radius is iconSize / 2", tc.r === 24);
                check("buildTipCircle: center is endpoint + unit * (r - 1.5)", Math.abs(tc.x - 122.5) < 1e-9 && Math.abs(tc.y) < 1e-9);
                const tcDefault = buildTipCircle(0, 0, 0, 50);
                check("buildTipCircle: default icon size 48", tcDefault.r === 24 && Math.abs(tcDefault.x) < 1e-9 && Math.abs(tcDefault.y - 72.5) < 1e-9);
                const tcMin = buildTipCircle(0, 0, 10, 0, 10);
                check("buildTipCircle: radius clamps to >= 12", tcMin.r === 12 && Math.abs(tcMin.x - 20.5) < 1e-9);
                const bc0 = buildBaseCircle(3, 4, 30);
                check("buildBaseCircle: passes {x, y, r} through", bc0.x === 3 && bc0.y === 4 && bc0.r === 30);
                // taperedPath tip arc (horizontal spoke, tip circle from buildTipCircle).
                const dTip = taperedPath("M 0 0 L 100 0", 20, 20, tc, null), aTip = arcsOf(dTip);
                check("taperedPath tip: exactly one arc", aTip.length === 1);
                aTip.length && checkArc("taperedPath tip", aTip[0], tc, !0);
                // taperedPath base arc (segment starts outside the disc).
                const bcBig = buildBaseCircle(0, 0, 30), dBase = taperedPath("M 40 0 L 140 0", 20, 10, null, bcBig), aBase = arcsOf(dBase);
                check("taperedPath base: exactly one arc", aBase.length === 1);
                aBase.length && checkArc("taperedPath base", aBase[0], bcBig, !1);
                // taperedPath guards: deep-inside base and no circles stay flat; invalid tip circle ignored.
                check("taperedPath base: center-drawn segment keeps flat base", !taperedPath("M 0 0 L 100 0", 20, 10, null, bcBig).includes(" A "));
                check("taperedPath: no circles means no arcs", !taperedPath("M 0 0 L 100 0", 20, 10).includes(" A "));
                check("taperedPath: r = 0 tip circle ignored", !taperedPath("M 0 0 L 100 0", 20, 10, { x: 100, y: 0, r: 0 }, null).includes(" A "));
                check("taperedPath: unparseable path returned unchanged", taperedPath("junk", 20, 10) === "junk");
                // taperedPath narrow-tip convex cap: arc of radius 24 around the endpoint.
                const aCap = arcsOf(taperedPath("M 0 0 L 100 0", 20, 0, null, null));
                check("taperedPath cap: exactly one arc of radius 24", aCap.length === 1 && aCap[0].r === 24);
                aCap.length && check("taperedPath cap: endpoints on the cap circle", Math.abs(distTo(aCap[0].x1, aCap[0].y1, 100, 0) - 24) < EPS && Math.abs(distTo(aCap[0].x2, aCap[0].y2, 100, 0) - 24) < EPS);
                // flankPaths: base disc off-center, tip circle offset past the tip point (as buildTipCircle returns).
                const fBase = buildBaseCircle(0, 0, 25), fTip = { x: 152.5, y: 0, r: 26 };
                const flankArgs = [ 30, 0, 100, 0, 0, 1, 60, 10, 5, 2 ];
                for (const mode of [ "innerFirst", "outerFirst" ]) {
                    const res = flankPaths(...flankArgs, mode, fBase, fTip), aTop = arcsOf(res.top), aBot = arcsOf(res.bottom);
                    check(`flankPaths ${mode}: two arcs per flank (tip + base)`, aTop.length === 2 && aBot.length === 2);
                    if (aTop.length === 2) {
                        checkArc(`flankPaths ${mode} top tip`, aTop[0], fTip, !0);
                        checkArc(`flankPaths ${mode} top base`, aTop[1], fBase, !1);
                    }
                    if (aBot.length === 2) {
                        checkArc(`flankPaths ${mode} bottom tip`, aBot[0], fTip, !0);
                        checkArc(`flankPaths ${mode} bottom base`, aBot[1], fBase, !1);
                    }
                    if (aTop.length && aBot.length) {
                        const mirrorPt = (ax, ay, bx, by) => Math.abs(ax - bx) < .011 && Math.abs(ay + by) < .011;
                        check(`flankPaths ${mode}: bottom tip arc mirrors top across the centerline`, (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x1, aTop[0].y1) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x2, aTop[0].y2)) || (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x2, aTop[0].y2) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x1, aTop[0].y1)));
                    }
                    const first = /^M ([\d.-]+) ([\d.-]+)/.exec(res.top);
                    check(`flankPaths ${mode}: first flank point projected onto base disc`, !!first && Math.abs(distTo(+first[1], +first[2], fBase.x, fBase.y) - fBase.r) < EPS);
                    const bare = flankPaths(...flankArgs, mode, null, null);
                    check(`flankPaths ${mode}: no circles means no arcs`, !bare.top.includes(" A ") && !bare.bottom.includes(" A "));
                }
                return { passed: passed, failed: failures.length, failures: failures };
            }
            return Object.freeze({
                SAMPLES: SAMPLES,
                FLARE_DECAY: FLARE_DECAY,
                segment: segment,
                parseSegment: parseSegment,
                flareAt: flareAt,
                buildTipCircle: buildTipCircle,
                buildBaseCircle: buildBaseCircle,
                taperedPath: taperedPath,
                flankPaths: flankPaths,
                runGeometryTests: runGeometryTests
            });
        })();
        window.SpokeGeometry = SpokeGeometry;
        /* ================= SpokeGeometry module — END ================= */
        const Ga = Object.freeze({
            WIDTH: 18,
            TIP_FRACTION: 0,
            OUTLINE_EXTRA: 1.25,
            OUTLINE_COLOR: "#f5f5f5",
            CLOUD_OUTLINE_WIDTH: (e, depth) => Ga.outlineWidth(e, depth),
            NO_CODE_COLOR: "#78817e",
            FALLBACK_COLOR: "#646d66",
            parseSegment(e) {
                // Delegate: the implementation lives in SpokeGeometry.parseSegment (see the SpokeGeometry module above); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.parseSegment(e);
            },
            segment(e, t, n, i) {
                // Delegate: the implementation lives in SpokeGeometry.segment (same descriptor shape); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.segment(e, t, n, i);
            },
            trimToIcons(e, t, n, i, a, r) {
                const o = Ga.segment(e, t, n, i);
                return {
                    seg: o,
                    sx0: e + o.ux * a,
                    sy0: t + o.uy * a,
                    sx1: n - o.ux * r,
                    sy1: i - o.uy * r
                };
            },
            // tipWidth has no SpokeGeometry counterpart (the module takes tip
            // widths as plain arguments); TIP_FRACTION is 0, so this is
            // always 0 — kept as the Ga-side width rule for heat spokes.
            tipWidth: e => e * Ga.TIP_FRACTION,
            flareAt: (e, t, n) => SpokeGeometry.flareAt(e, t, n),
            heatWidths(e, depth) {
                const t = Math.max(e + 8, 18) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3);
                return {
                    w0: t,
                    w1: .25 * t
                };
            },
            categoryBaseWidth: (e, t, n) => Za.categoryTaperBaseWidth(e, t, n),
            spokeBaseWidth: e => 5 * e,
            railsBaseWidth: (e, t, n, i, depth) => (isCatId(e) ? Ga.categoryBaseWidth(t, n, i) : Ga.spokeBaseWidth(t)) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3),
            cloudBaseWidth(e, t) {
                const n = Math.max(1, Number(t) || 1), i = e / 2 * er.spread;
                return Math.max(8, i / Math.max(n, 6));
            },
            outlineWidth: (e, depth) => { const f = null == depth ? 1 : sxFontFactor(depth); return midlineStrokeWidth() * f + 16 * (mapFontScale() * f / 3); },
            // splitInnerHalf is half the outline width above, so a
            // future outline-width change cannot silently strand it.
            splitInnerHalf: (e, depth) => Ga.outlineWidth(e, depth) / 2,
            midlineOutlinePath: (e, t, n, depth) => n ? "" : `<path class="hanky-midline-outline" d="${e}" fill="none" stroke="${Ga.OUTLINE_COLOR}" stroke-width="${Ga.outlineWidth(t, depth)}" stroke-linecap="butt" opacity="0.9" pointer-events="none"/>`,
            dashAttr: e => ` stroke-dasharray="${e} ${.66 * e}"`,
            taperedPath(e, t, n, z = null, zb = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.taperedPath (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.taperedPath(e, t, n, z, zb);
            },
            flankPaths(e, t, n, i, a, r, o, s, l, c, d, u = null, z = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.flankPaths (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.flankPaths(e, t, n, i, a, r, o, s, l, c, d, u, z);
            }
        });
        // Selection marking — the single authority (map-render refactor,
        // finding 5). selectionMarkKind(spokeId, selectedId, record)
        // decides whether a spoke carries the .selected-spoke mark for a
        // selection, and where the mark lives:
        //   "own"    — the selected node's own spoke (and a selected
        //              topic's parent spoke): the mark lives in that
        //              spoke's node group.
        //   "branch" — the branch spoke (cat-<slug of record.branch>):
        //              the mark lives in the branch line-group underlay
        //              item (.spoke-underlay-item[data-spoke-for=...]).
        //   null     — no mark. A subcategory carries no mark of its own:
        //              its line is drawn by renderKinkLine, which stamps
        //              no highlight, so selecting a subcategory marks
        //              only its branch's line.
        // Ka consults this while rendering (it marks the spokes it
        // builds; the render's underlay pass then moves the branch
        // spoke's visuals, mark included, into the underlay item), and
        // applySelectionMarking consults the same function to reproduce
        // exactly that end state on the existing DOM without a
        // re-render. Selection semantics change HERE only.
        function selectionMarkKind(spokeId, selectedId, record) {
            if (!spokeId || !selectedId) return null;
            const branchCatId = record && record.branch ? catId(record.branch) : null;
            if (branchCatId && spokeId === branchCatId) return "branch";
            if (spokeId === selectedId) return record && "Subcategory" === record.kind ? null : "own";
            if (record && spokeId === record.parentId) return "own";
            return null;
        }
        function Ka(e, t, n, i, a, r, o, s, l, c, d, u = 48, p = Ga.FALLBACK_COLOR, g = !0, m = "", f = null, y = null, b = null, v = !1, w = !0, k = h.length, bc = null, sxLeafD = null, sxDepth = null) {
            Ra(e);
            const sxD = null != sxDepth ? sxDepth : sxLeafD === sxIconDiameter(1) ? 1 : sxLeafD === sxIconDiameter(3) ? 3 : 2, sxF = sxFontFactor(sxD), sxSW = sxStrokeWidth(sxD);
            const x = Rt || Qi() ? null : Vi(), S = Rt ? null : x || function(e) {
                const t = Vi();
                return Qi() && t && (at[t] || {})[e] && gn.has(oi(t, e)) ? t : null;
            }(e), $ = Ge(e, S || Vi()), E = e => `translate(${(a * e).toFixed(2)} ${(r * e).toFixed(2)})`, A = e.replace(/[^a-z0-9-]/g, ""), C = Boolean(topicLabelById[e]), M = S || Vi(), I = qn[e] || Xn(e) || {
                id: e,
                label: i,
                branch: i,
                kind: C ? "Topic" : "Category"
            }, P = (wa(e, I, M), da(e, M)), L = $a(e, "give", M), T = $a(e, "receive", M), F = Sa(e, I, M), N = ka(i, L, P.giveKnown ? ba(P.give) : "Unrated", { tapFirst: !0 }), _ = ka(i, T, P.receiveKnown ? ba(P.receive) : "Unrated", { tapFirst: !0 });
            let D = "";
            const R = g && !Rt ? Ua(e) : null, O = Ga.heatWidths(n, sxD);
            if (SpokeGeometry.taperedPath(t, O.w0, O.w1), R) {
                const overlayTip = "Overlaid profiles into this topic", a = `${R.count}/${R.total}`;
                D += `<path class="group-heat${R.count === R.total ? " all-in" : ""}" d="${t}" stroke="${R.color}" stroke-width="${O.w0}" opacity="${(.2 + .48 * R.count / R.total).toFixed(2)}" tabindex="0" role="img" aria-label="${Hi(`${i}: ${a} overlaid profiles into this topic`)}"${ka(i, overlayTip, a, {
                    hoverOnly: !1
                })}/>`;
            }
            selectionMarkKind(e, Lt, Lt ? qn[Lt] || Xn(Lt) || (at[Vi()] || {})[Lt] : null) && (D += `<path class="selected-spoke" d="${t}" vector-effect="non-scaling-stroke" stroke-width="14" aria-hidden="true"/>`);
            const B = m ? ` ${m}` : "", j = Math.hypot(o - pr.centerX, s - pr.centerY), q = Ga.railsBaseWidth(e, n, j, k, sxD), H = Ga.tipWidth(n);
            const tipCircle = SpokeGeometry.buildTipCircle(o, s, l, c, null != sxLeafD ? sxLeafD : u * mapFontScale());
            let W = "";
            if (w) if (w && f && y) {
                const seg = Ga.segment(o, s, l, c), i = sxSW, a = Ga.splitInnerHalf(n, sxD), r = SpokeGeometry.flankPaths(o, s, seg.dx, seg.dy, seg.nx, seg.ny, q, H, a, a, "innerFirst", bc, tipCircle), d = b || p || Ga.FALLBACK_COLOR, u = Ga.midlineOutlinePath(t, n, v, sxD);
                W = `<path class="tapered-stem${B}" d="${r.top}" fill="${f}" stroke="none" style="fill:${f}"${N}/><path class="tapered-stem${B}" d="${r.bottom}" fill="${y}" stroke="none" style="fill:${y}"${_}/>` + (v ? `<path class="hanky-midline hanky-none" d="${t}" fill="none" stroke="${Ga.FALLBACK_COLOR}" stroke-width="${i}" stroke-linecap="butt"${Ga.dashAttr(i)} opacity="0.85"${F}/>` : u + `<path class="hanky-midline" d="${t}" fill="none" stroke="${d}" stroke-width="${i}" stroke-linecap="butt" opacity="0.9"${F}/>`);
            } else {
                const taperedD = SpokeGeometry.taperedPath(t, q, H, tipCircle, bc), i = sxSW, a = v ? Ga.FALLBACK_COLOR : b || p || Ga.FALLBACK_COLOR, r = v ? Ga.dashAttr(i) : "";
                W = `<path class="tapered-stem${B}" d="${taperedD}" fill="${p}" stroke="none" style="fill:${p}"/><path class="hanky-midline" d="${t}" fill="none" stroke="${a}" stroke-width="${i}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            } else {
                const stemW = 1.3 * (n || 8), i = v ? Ga.NO_CODE_COLOR : b || p || Ga.NO_CODE_COLOR, a = Ga.midlineOutlinePath(t, n, v, sxD), r = v ? Ga.dashAttr(stemW) : "";
                W = a + `<path class="hanky-midline" d="${t}" fill="none" stroke="${i}" stroke-width="${sxSW}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            }
            if (D += W, D += `<path class="topic-pulse${B}${v ? " hanky-none" : ""}" d="${t}" stroke="${p}" style="stroke-width:${5 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`, 
            D += `<path class="concept-hit" data-id="${e}" data-nx="${a.toFixed(5)}" data-ny="${r.toFixed(5)}"${Sa(e, I, M)} d="${t}" tabindex="0" role="button" aria-label="${Hi(i)} concept line"/>`, 
            g && x && !d) {
                const n = da(e, x);
                ($.single ? [ {
                    key: "give",
                    offset: 0
                } ] : [ {
                    key: "give",
                    offset: -5
                }, {
                    key: "receive",
                    offset: 5
                } ]).forEach((e, i) => {
                    if (!n[e.key + "Known"]) return;
                    const a = n[e.key], r = $.labels[i] || e.key, o = n[e.key + "Derived"] ? ` · rolled up from ${n[e.key + "RatedChildren"]} of ${n.childCount} child topics` : "";
                    D += `<path class="visual-rail collapsed-rating-rail" d="${t}" transform="${E(e.offset)}" fill="none" stroke="${zi(a)}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${r}: ${Math.round(a)}${o}</title></path>`;
                });
            }
            if (g && !Rt && Qi() && 2 === Xi().length) {
                const n = function(e) {
                    const t = Xi();
                    if (t.some(t => "limit" === Oa(e, t))) return "limit";
                    if (t.some(t => "favorite" === Oa(e, t))) return "favorite";
                    const r = sxPairByIds(t[0], t[1]), rec = r && r.topicsById[e];
                    if (!rec) return "other";
                    return "match" === rec.outcome ? "mutual" : rec.mutualNo ? "disinterest" : "other";
                }(e), i = {
                    mutual: "mutual-halo",
                    disinterest: "disinterest-halo",
                    favorite: "favorite-halo",
                    limit: "limit-halo"
                }[n];
                i && (D += `<path class="${i}" d="${t}"/>`);
            }
            const U = S && "group" === ft[S]?.kind ? ft[S].matchDetails?.[e] : null;
            if (g && S && d && U) {
                const t = l - o, n = c - s, i = (Math.hypot(t, n), 180 * Math.atan2(n, t) / Math.PI), a = sxControlScale(sxD, u), r = function(e) {
                    if (!e) return "";
                    const t = Array.isArray(e.routes) ? e.routes : [];
                    return 1 === t.length ? `${Math.round(e.score)}% · ${_d(t[0])}` : `${Math.round(e.score)}% · ${t.length} matched routes`;
                }(U), d = (U.routes || []).map(e => `${_d(e, !0)}; combined ${Math.round(e.score)}%`).join(" · "), p = Za.controlTagWidth(r, "group") * a, h = 24 * a, g = l, m = c;
                D += `<g class="direction-control group-match-control" data-id="${e}" data-direction="group" data-base-cx="${g}" data-base-cy="${m}" data-base-angle="${i}" data-index="0" data-tag-width="${p}" data-tag-height="${h}" data-control-scale="${a}" role="img" tabindex="0" aria-label="Combined match ${Math.round(U.score)} percent. ${Hi(d)}"><title>Combined match ${Math.round(U.score)}%. ${Hi(d)}</title><rect class="direction-tag-bg" x="${(g - p / 2).toFixed(2)}" y="${(m - h / 2).toFixed(2)}" width="${p.toFixed(2)}" height="${h.toFixed(2)}" rx="${6 * a}" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" fill="${zi(U.score)}"/><text class="direction-tag" x="${g.toFixed(2)}" y="${m.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" textLength="${Math.max(50, p - 12 * a).toFixed(2)}" lengthAdjust="spacing" style="font-size:${5.5 * a}px">${Hi(r)}</text></g>`;
            } else if (g && S && d) {
                const t = da(e, S), n = l - o, i = c - s, d = Math.hypot(n, i), p = n / d, h = i / d, g = 180 * Math.atan2(i, n) / Math.PI, m = sxControlScale(sxD, u), f = $.keys, y = $.labels, b = !$.single && "give" === y[0] && "receive" === y[1], v = e => Za.controlTagWidth(e, "pair") * m, w = $.single ? {
                    give: Za.controlTagWidth(y[0], "single") * m
                } : {
                    give: v(y[0]),
                    receive: v(y[1])
                }, k = ($.single ? 20 : 24) * m, x = 320 * m, E = sxRailPx(m), C = $.single ? [ 0 ] : [ -w.give / 2, w.receive / 2 ];
                // Slider blow-up repair (2026-11-01): E (the rating rail's stroke-width) was 44 * mapFontScale() — unbounded and font-derived, so at the baked fontScale 40 the rail rendered 1760 screen px thick (non-scaling-stroke) and one inadvertently picked slider filled the viewport at high zoom-out. It is now the fixed 44 of the 44px spec at every font scale and zoom, matching the .rating-rail CSS rule. Track length (x = 320 * m, map units, camera-scaled) is unchanged.
                // Slider size repair #2 (2026-11-01): E now comes from sxRailPx(m) — 14% of the track's delivered screen length at the current camera, capped at the same fixed 44 — so the attribute, the .rating-rail CSS variable, and the hit strokes all agree at every zoom instead of the fixed 44px thickness dwarfing the shrunken track at Full zoom-out.
                f.forEach((n, i) => {
                    const o = w[n], s = o + 10 * m, d = C[i], u = l - p * d, f = c - h * d, v = u - a * x / 2, M = f - r * x / 2, I = u + a * x / 2, P = f + r * x / 2, L = `M ${v.toFixed(2)} ${M.toFixed(2)} L ${I.toFixed(2)} ${P.toFixed(2)}`, T = s / 2, F = `M ${(u - p * T).toFixed(2)} ${(f - h * T).toFixed(2)} L ${(u + p * T).toFixed(2)} ${(f + h * T).toFixed(2)}`, N = `grad-${A}-${n}`, _ = t[n + "Known"], R = _ ? t[n] : 0, O = (R + 100) / 200, B = Boolean(t[n + "Derived"]), j = Math.round(R), q = _ ? B ? `${j}, rolled up from ${t[n + "RatedChildren"]} of ${t.childCount} child topics` : String(j) : "Unrated", H = Zn(e, n), W = ei(e, n, S), U = Boolean(Nt && Nt.id === e && Nt.direction === n), G = U ? " active-rating" : "", K = `data-id="${e}" data-direction="${n}" data-x0="${v}" data-y0="${M}" data-x1="${I}" data-y1="${P}" data-nx="${a}" data-ny="${r}" data-offset="0"`, z = v + (I - v) * O, V = M + (P - M) * O, Y = $.single ? 1 : 0 === i ? -1 : 1, X = u + p * Y * (o / 2), Z = f + h * Y * (o / 2), Q = _ ? zi(R) : Ga.FALLBACK_COLOR;
                    D += `<g class="direction-control${$.single ? " single-label-control" : ""}${G}" data-id="${e}" data-direction="${n}"${W ? ` data-rating-tooltip="${Hi(W)}"` : ""} data-derived="${B}" data-base-cx="${u}" data-base-cy="${f}" data-base-angle="${g}" data-index="${i}" data-tag-width="${o}" data-tag-height="${k}" data-control-scale="${m}" style="--sx-rail-px:${E.toFixed(1)}px;--sx-rail-hit-px:${Math.max(14, Math.min(44, E * 1.6)).toFixed(1)}px">`, 
                    D += `<defs><linearGradient id="${N}" gradientUnits="userSpaceOnUse" x1="${v}" y1="${M}" x2="${I}" y2="${P}"><stop offset="0" stop-color="var(--red-deep)"/><stop offset=".5" stop-color="var(--curious)"/><stop offset="1" stop-color="var(--green-deep)"/></linearGradient></defs>`, 
                    D += `<path class="visual-rail rating-rail${G}" data-id="${e}" data-direction="${n}" d="${L}" fill="none" stroke="url(#${N})" stroke-width="${E}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`, 
                    (_ || U) && (D += `<circle class="slider-thumb${G}" data-id="${e}" data-direction="${n}" cx="${z.toFixed(2)}" cy="${V.toFixed(2)}" r="${10 * m}" fill="${zi(R)}"/>`), 
                    D += `<path class="rating-track-hit${G}" ${K} d="${L}"/>`;
                    const J = U ? `tabindex="0" role="button" aria-label="Clear ${Hi(`${Jn(e, n)}${H ? ` ${H}` : ""}`)} rating"` : 'tabindex="-1" aria-hidden="true"', ee = g + 90;
                    D += `<g class="rating-clear${G}" data-id="${e}" data-direction="${n}"><rect class="rating-clear-bg" x="${(X - 23 * (mapFontScale() * sxF / 3)).toFixed(2)}" y="${(Z - 10 * (mapFontScale() * sxF / 3)).toFixed(2)}" width="${46 * (mapFontScale() * sxF / 3)}" height="${20 * (mapFontScale() * sxF / 3)}" rx="5" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})"/><rect class="rating-clear-hit" data-id="${e}" data-direction="${n}" x="${(X - 28).toFixed(2)}" y="${(Z - 15).toFixed(2)}" width="56" height="30" rx="7" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})" ${J}/><text class="rating-clear-text" x="${X.toFixed(2)}" y="${Z.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})">Clear</text></g>`, 
                    D += `<path class="direction-hit" tabindex="0" role="slider" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="${_ ? j : 0}" aria-valuetext="${q}" aria-label="${Hi(`${Jn(e, n)}${H ? `: ${H}` : ""}. ${q}. Tap to open its rating scale; drag, then release to choose.`)}" aria-expanded="${U}" ${K} d="${F}"/>`, 
                    $.single && (D += `<rect class="direction-tag-occluder" x="${(u - o / 2 - 3 * m).toFixed(2)}" y="${(f - k / 2 - 3 * m).toFixed(2)}" width="${(o + 6 * m).toFixed(2)}" height="${(k + 6 * m).toFixed(2)}" rx="${7 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})"/>`), 
                    D += `<rect class="direction-tag-bg" data-id="${e}" data-direction="${n}" x="${(u - o / 2).toFixed(2)}" y="${(f - k / 2).toFixed(2)}" width="${o}" height="${k}" rx="${5 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" fill="${Q}" opacity="${_ ? 1 : .62}"/>`;
                    // TAG FILL (ruled 2026-11-02, Jason): the give/receive
                    // lettering fills its tag capsule — font-size equals
                    // the tag height k exactly (single 20 * m, pair
                    // 24 * m), no wasted space top or bottom. The capsule
                    // takes its width from the word itself at this font
                    // (Za.controlTagWidth), so the word fits with no
                    // sideways squeeze and no shrink: the old textLength
                    // cap (spacingAndGlyphs) is gone.
                    const te = $.single ? y[i] : b ? "give" === n ? "G" : "R" : y[i], ne = k;
                    D += `<text class="direction-tag" data-id="${e}" data-direction="${n}" x="${u.toFixed(2)}" y="${f.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" style="font-size:${ne}px">${Hi(te)}</text></g>`;
                });
            }
            if (g && !Rt && !x) {
                const i = Xi(), a = $.single ? [ "give" ] : [ "give", "receive" ], r = i.length * a.length, o = (n > 7 ? Math.min(18, 4 + 1.6 * r) : Math.min(14, 3 + 1.4 * r)) * (mapFontScale() * sxF / 3), s = Math.max(1.35, n / Math.min(r, 6)) * (mapFontScale() * sxF / 3);
                i.forEach((n, i) => {
                    const l = da(e, n);
                    a.forEach((c, d) => {
                        const u = i * a.length + d, p = 1 === r ? 0 : -o / 2 + o * u / (r - 1);
                        $.labels[d], D += `<path class="visual-rail" d="${t}" transform="${E(p)}" fill="none" ${function(e, t, n) {
                            return e[t + "Known"] ? `stroke="${la(n)}" opacity=".96"` : 'stroke="var(--line)" stroke-dasharray="2 6" opacity=".38"';
                        }(l, c, n)} stroke-width="${s}" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${Hi(wt[n])} — ${Hi(Jn(e, c))}</title></path>`;
                    });
                });
            }
            return D;
        }
        function za(e, t, n, i, a, r = 0) {
            const o = i - t, s = a - n, l = Math.hypot(o, s), c = o / l, d = s / l, u = i - c * r, p = a - d * r, h = Math.max(80, l - r), g = Za.leafLabelWidth(h), m = u - c * g, f = p - d * g;
            return {
                d: `M ${t.toFixed(2)} ${n.toFixed(2)} L ${i.toFixed(2)} ${a.toFixed(2)}`,
                labelD: `M ${m.toFixed(2)} ${f.toFixed(2)} L ${u.toFixed(2)} ${p.toFixed(2)}`,
                labelWidth: g,
                labelStartX: m,
                labelStartY: f,
                ux: c,
                uy: d,
                nx: -d,
                ny: c
            };
        }
        function Va(e, t, n, i, a) {
            return r => {
                const o = Math.max(0, Math.min(a, r));
                return {
                    x: e + n * o,
                    y: t + i * o
                };
            };
        }
        function Ya(e, t, n, i, a = pr.categoryIcon / 2) {
            const r = Math.max(1, Math.hypot(n - e, i - t)), o = (n - e) / r, s = (i - t) / r, l = -s, c = o, d = `M ${e.toFixed(2)} ${t.toFixed(2)} L ${n.toFixed(2)} ${i.toFixed(2)}`, u = `M ${n.toFixed(2)} ${i.toFixed(2)} L ${e.toFixed(2)} ${t.toFixed(2)}`, p = r, h = Va(e, t, o, s, p), g = a, m = Za.cloudLabel(p, g), f = m.labelOffset;
            return {
                d: d,
                labelD: d,
                reverseD: u,
                routedLength: p,
                labelWidth: m.labelWidth,
                labelOffset: f,
                icon: h(p),
                ux: o,
                uy: s,
                nx: l,
                ny: c,
                c1: h(.3 * p),
                c2: h(.7 * p),
                bend: 0,
                pointAtDistance: h
            };
        }
        function Xa(e, t) {
            return {
                x: MAP_CENTER_X + Math.cos(e) * t,
                y: MAP_CENTER_Y + Math.sin(e) * t
            };
        }
        const Za = Object.freeze({
            HALO_SPACING: Object.freeze({
                category: 8,
                topic: 6
            }),
            CENTER_SPACING_EM: .02,
            IDEAL_SIZE: 18,
            MIN_SIZE: 12.5,
            _context: document.createElement("canvas").getContext("2d"),
            _cache: new Map,
            _estimateCache: new Map,
            measure(e, t, n) {
                if (!Za._context) return 0;
                const i = "category" === n || "center" === n, a = i ? '"Barlow Condensed",sans-serif' : '"Source Sans 3",sans-serif', r = i ? 700 : 650, o = "center" === n ? Za.CENTER_SPACING_EM * t : Za.HALO_SPACING[n] || Za.HALO_SPACING.topic, s = n + "|" + t.toFixed(1) + "|" + e;
                if (Za._cache.has(s)) return Za._cache.get(s);
                Za._context.font = `${r} ${t}px ${a}`;
                const l = Za._context.measureText(e).width + o * Math.max(0, e.length - 1);
                return Za._cache.size > 2e3 && Za._cache.clear(), Za._cache.set(s, l), l;
            },
            fittedSize(e, t, n) {
                const i = Za.IDEAL_SIZE, a = Za.measure(e, i, n);
                return Math.max(Za.MIN_SIZE, Math.min(i, i * t / Math.max(t, a)));
            },
            fitWithin(e, t, n, i, a) {
                const r = Za.measure(e, t, a);
                return Math.max(n, Math.min(t, t * i / Math.max(1, r)));
            },
            fitAttr: (e, t, n, i) => Za.measure(e, t, n) > i ? ` textLength="${i.toFixed(0)}" lengthAdjust="spacing"` : "",
            // CAPSULE = THE WORD (ruled 2026-11-02, Jason): a tag
            // capsule's width IS its word's measured width at the tag
            // font, plus the renderer's existing inset (4 for the
            // give/receive tags, whose fit check was capsule width
            // minus 4 * scale; 12 for the group score tag, whose text
            // was set to capsule width minus 12 * scale). The old
            // per-character width table is gone: no fixed widths, no
            // caps, no floors. Tag fonts: single 20, pair 24 (the
            // tag heights, unchanged), group score 5.5 (halved from
            // 11 in the same ruling). Paint and the scored capsule
            // geometry both read this one definition, so they move
            // together.
            controlTagWidth: (e, t) => "single" === t ? Za.measure(e, 20, "topic") + 4 : "group" === t ? Za.measure(e, 5.5, "topic") + 12 : Za.measure(e, 24, "topic") + 4,
            leafLabelWidth: e => Math.min(e, Math.max(170, e - 38)),
            curveLabel(e, t, n) {
                const i = Math.max(.32, Math.min(.62, Number(n) || .32)), a = Number.isFinite(t) ? Math.min(e * i, Math.max(6, t)) : Math.min(12, Math.max(6, .03 * e));
                return {
                    labelOffset: a,
                    safeLabelLimit: i,
                    labelWidth: Math.max(120, e - a - 20)
                };
            },
            cloudLabel(e, t) {
                const n = Math.min(e - 40, Math.max(t + 44, .2 * e));
                return {
                    labelOffset: n,
                    // LABEL CLEARANCE (repair, 2026-11-01): the
                    // width offered to the fitted-size computation
                    // is the space actually left on the spoke —
                    // the old floor of 80 forced a label wider
                    // than a short spoke, so its text ran past
                    // the end of the spoke and impinged on the
                    // icon seated there. A short spoke now gets a
                    // smaller fitted label instead.
                    labelWidth: Math.max(30, e - n - 30)
                };
            },
            adaptivePlacement(e, t, n = 0) {
                const i = Math.max(.006, Number(e && e.sector) || .006), a = t >= 3, r = a ? 92 : 44, o = a ? n + 700 : n + 72, s = a ? hr(3) + 1280 : n + 420, l = Math.min(s, Math.max(o, r / i)), c = a ? 620 : 72, d = a ? 2560 : 560, u = Math.max(c, Math.min(d, l - n));
                return a ? {
                    offset: u,
                    limit: .72
                } : {
                    offset: u,
                    limit: .68
                };
            },
            topicLabelOffset: (e, t, n) => Math.max(30, Math.min(e - 36, t + (n % 2 ? 20 : 0))),
            angularDemand(e, t, n, i, a = 0) {
                const r = Math.max(n + 30, 2 * i + Math.min(40, .65 * String(e || "").length)) + a;
                return 2 * Math.asin(Math.min(.92, r / (2 * Math.max(1, t))));
            },
            allocateSectors(e, t, n, i, a, r, o = 0) {
                if (!e.length) return [];
                const s = e.map(e => Math.max(Za.angularDemand(e.label, i, a, r, o), Number(e.minDemand) || 0)), l = s.reduce((e, t) => e + t, 0), c = e.map(e => Math.max(1, e.weight || 1)), d = c.reduce((e, t) => e + t, 0);
                let u = c.map(e => n * e / d);
                if (l <= n) {
                    const t = new Set;
                    for (let i = 0; i < e.length; i++) {
                        let e = !1, i = 0, a = 0;
                        if (u.forEach((e, n) => {
                            t.has(n) ? i += s[n] : a += c[n];
                        }), u = u.map((e, r) => t.has(r) ? s[r] : Math.max(0, n - i) * c[r] / Math.max(1e-4, a)), 
                        u.forEach((n, i) => {
                            !t.has(i) && n < s[i] && (t.add(i), e = !0);
                        }), !e) break;
                    }
                    const i = u.reduce((e, t) => e + t, 0);
                    if (i < n - 1e-4) {
                        const t = (n - i) / e.length;
                        u = u.map(e => e + t);
                    }
                } else u = s.map(e => n * e / l);
                let p = t;
                return e.map((e, t) => {
                    const n = u[t], i = s[t], a = Math.max(0, (n - i) / Math.max(1e-4, i)), r = Object.assign({}, e, {
                        angle: p + n / 2,
                        sector: n,
                        start: p,
                        end: p + n,
                        demand: i,
                        slackRatio: a
                    });
                    return p += n, r;
                });
            },
            TAPER_BASE_FRACTION: .78,
            // TAPER-BASE RE-ANCHOR (2026-11-02, owner-approved): the
            // category taper base no longer grows with the radius R.
            // TAPER_BASE_CAP is the tuned-era base — TAPER_BASE_FRACTION
            // of the chord across one of 18 slots at R = 300, about
            // 81.26 units, the base this rule produced when it was
            // tuned — and categoryTaperBaseWidth now returns
            //   max(seed, min(0.78 * chord(R, count), TAPER_BASE_CAP))
            // so at any larger radius the base holds at the tuned value
            // and Ga.railsBaseWidth's fontScale / 3 carries that fixed
            // proportion forward (the painted base is about 1.23x the
            // 22 * fontScale band at every font size). The min() keeps
            // the Oct 13 neighbour-margin property at every radius:
            // the base never exceeds 0.78 of one slot chord, so
            // adjacent bases always keep their margin. flareAt and
            // FLARE_DECAY are untouched.
            TAPER_BASE_CAP: 2 * 300 * Math.sin(Math.PI / 18) * .78,
            categoryTaperBaseWidth(e, t, n) {
                const i = 2 * t * Math.sin(Math.PI / Math.max(1, Number(n) || 1));
                return Math.max(e, Math.min(i * Za.TAPER_BASE_FRACTION, Za.TAPER_BASE_CAP));
            },
            SETTLE: Object.freeze({
                controlGap: 14,
                iconGap: 2,
                startOffset: 2,
                parentOuterMargin: 12,
                boxPadding: 4,
                badgeGap: 0,
                gen2: Object.freeze({
                    step: 32,
                    attempts: 18
                }),
                gen3: Object.freeze({
                    step: 40,
                    attempts: 18
                })
            }),
            orientedBox(e, t, n, i, a = 0) {
                const r = a * Math.PI / 180, o = Math.cos(r), s = Math.sin(r), l = Za.SETTLE.boxPadding;
                return {
                    cx: e,
                    cy: t,
                    hw: Math.max(1, n / 2 + l),
                    hh: Math.max(1, i / 2 + l),
                    ux: {
                        x: o,
                        y: s
                    },
                    uy: {
                        x: -s,
                        y: o
                    }
                };
            },
            boxesOverlap(e, t) {
                const n = t.cx - e.cx, i = t.cy - e.cy;
                return [ e.ux, e.uy, t.ux, t.uy ].every(a => Math.abs(n * a.x + i * a.y) < e.hw * Math.abs(e.ux.x * a.x + e.ux.y * a.y) + e.hh * Math.abs(e.uy.x * a.x + e.uy.y * a.y) + (t.hw * Math.abs(t.ux.x * a.x + t.ux.y * a.y) + t.hh * Math.abs(t.uy.x * a.x + t.uy.y * a.y)));
            },
            isClear: (e, t) => !e.some(e => t.some(t => Za.boxesOverlap(e, t))),
            settleSearch: e => e ? Za.SETTLE.gen2 : Za.SETTLE.gen3,
            markerCandidates(e) {
                let t = 0;
                for (let n = 0; n < e.length; n++) t = 31 * t + e.charCodeAt(n) >>> 0;
                const n = t % 2 ? 1 : -1, i = 9 * (t % 3 - 1);
                return [ [ 36 * n, i ], [ 36 * -n, i ], [ 49 * n, -i ], [ 49 * -n, -i ], [ 38 * n, i + 24 ], [ 38 * -n, i - 24 ], [ 54 * n, i + 22 ], [ 54 * -n, i - 22 ] ];
            },
            markerAnchorAt(e, t, n, i, a) {
                const r = -n, o = t;
                return {
                    x: e.x + r * i[0] + t * i[1],
                    y: e.y + o * i[0] + n * i[1],
                    radius: a
                };
            },
            pickMarkerAnchor(e, t, n, i, a, r) {
                for (const o of a) {
                    const a = Za.markerAnchorAt(t, n, i, o, r);
                    if (e.every(e => Math.hypot(a.x - e.x, a.y - e.y) >= a.radius + e.radius + 8)) return a;
                }
                return null;
            },
            topicSpokeEstimate(e, t, depth) {
                // Memoised (T3, M6): the result is a pure function
                // of ALL of its inputs — the label, the radius, and
                // the canvas font-metrics state its measure calls
                // read (Source Sans 3, weight 650; see Za.measure).
                // The governing font signature is part of the cache
                // key — the bundle's signature-recapture discipline:
                // when the font state changes, entries under the old
                // signature simply never hit and the value is
                // recaptured, so a hit always returns exactly what
                // the unmemoised computation returns under the same
                // state. Hits hand back a fresh object, so a caller
                // can never mutate a cached entry. Bounded like
                // Za._cache: cleared past 2,000 entries.
                let sig = "nofonts";
                try {
                    document.fonts && document.fonts.check && (sig = document.fonts.status + "|" + document.fonts.check('650 16px "Source Sans 3"'));
                } catch (_) {}
                const dep = null == depth ? 2 : depth, key = sig + "|" + t + "|" + dep + "|" + e, hit = Za._estimateCache.get(key);
                if (hit) return {
                    fontSize: hit.fontSize,
                    spokeLength: hit.spokeLength
                };
                const n = Math.max(12, Math.min(17, Za.fittedSize(e, Math.max(80, t - 84)))) * sxFontCoef(dep) / 17, i = 96 + Za.measure(e, n) + 30, out = {
                    fontSize: n,
                    spokeLength: Math.max(t, i)
                };
                return Za._estimateCache.size > 2e3 && Za._estimateCache.clear(), Za._estimateCache.set(key, out), {
                    fontSize: out.fontSize,
                    spokeLength: out.spokeLength
                };
            },
            hubSpokeLength(e, t, n, i, a) {
                let r = n;
                for (let n = 0; n < 3; n++) {
                    const n = Math.min(r - 40, Math.max(i + 44, .2 * r)) + 20;
                    r = Math.max(r, n + Za.measure(e, t) + 3 + a);
                }
                return Math.max(n, r);
            },
            categoryFontSize: (e, t, n, i) => Math.max(15, Math.min(25, Za.fittedSize(e, t - n - (i ? 20 : 12), "category") + 5)),
            categoryUnderlineLength: (e, t) => Math.max(36, e.length * t * .5)
        });
        function Qa(e) {
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            // Build 2026-10-19_1535: expand/collapse on label/icon click COMMENTED OUT per Jason — click is selection only (highlight + dim), no expand/contract. Restore by uncommenting the $i(n) line.
            // n && $i(n);
            n && selectSpokeNode(n, !0);
            const rec = n && (qn[n] || Xn(n));
            if (rec && "Topic" === rec.kind && typeof xo === "function") {
                const box = t.getBoundingClientRect ? t.getBoundingClientRect() : { left: innerWidth / 2, width: 0, bottom: innerHeight / 2 };
                xo(n, box.left + box.width / 2, box.bottom + 8);
            }
        }
        function clearSelectionMarking() {
            if (Cn) Cn.querySelectorAll(".selected-spoke").forEach(el => el.remove());
        }
        function clearSpokeSelection() {
            // The one clear path (Build 2026-10-19_0543): clear the
            // selected node and any pending rating target, and remove
            // the selection marking from the existing DOM.
            // Geometry-neutral: no re-render — a full solve (Mr())
            // would discard delivered geometry (scoped editor commits,
            // DeKnotter runs) that exists only in the rendered DOM. The
            // map-selection-dim observer clears sel-keep /
            // has-selection in response to the marking removal.
            // A search focus and a relation-line focus dim the map
            // without a selected spoke, so those are cleared here too.
            // Returns whether anything was selected.
            if (typeof window.__sxStopFocusZoom === "function") window.__sxStopFocusZoom();
            const search = e.byId("searchInput"), picker = e.byId("topicPicker");
            const searchDim = Boolean(Dt || Tt || (search && search.value) || (Cn && (Cn.classList.contains("relation-focused") || Cn.querySelector(".is-dim, .is-preview"))));
            const had = Boolean(Lt || Nt || searchDim || (picker && picker.value) || (Cn && (Cn.classList.contains("has-selection") || Cn.classList.contains("relation-focused") || Cn.querySelector(".selected-spoke, .rel-active"))));
            Lt = null, Nt = null, Dt = null, Tt = "", sxSelEditorMirrored = null;
            search && (search.value = "");
            if (picker && picker.value) picker.value = "", picker.dispatchEvent(new Event("change", { bubbles: true }));
            clearSelectionMarking();
            if (Cn) {
                Cn.classList.remove("has-selection", "relation-focused");
                Cn.querySelectorAll(".sel-keep, .is-dim, .is-preview, .relation-focus-keep, .rel-endpoint, .rel-active").forEach(el => el.classList.remove("sel-keep", "is-dim", "is-preview", "relation-focus-keep", "rel-endpoint", "rel-active"));
                Cn.querySelectorAll(".map-label-stack-item[opacity], .rating-control-stack-item[opacity]").forEach(el => el.removeAttribute("opacity"));
            }
            const menu = e.byId("searchDropdown");
            menu && (menu.hidden = true);
            if (searchDim && typeof Ih === "function") Ih();
            return had;
        }
        function stampSelectedSpoke(d, host) {
            if (!host) return;
            const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("class", "selected-spoke");
            p.setAttribute("d", d || "");
            p.setAttribute("vector-effect", "non-scaling-stroke");
            p.setAttribute("stroke-width", "14");
            p.setAttribute("aria-hidden", "true");
            let ref = host.firstChild;
            while (ref && 1 === ref.nodeType && ref.classList.contains("group-heat")) ref = ref.nextSibling;
            host.insertBefore(p, ref);
        }
        function applySelectionMarking(id, t) {
            // Stamp the .selected-spoke highlight(s) for a selection
            // onto the existing DOM, reproducing the render's end
            // state exactly (no re-render: Mr() re-solves and
            // re-renders the whole map from canonical layout state,
            // silently discarding delivered geometry). The render
            // builds each spoke through Ka, whose predicate marks the
            // spoke whose id is the selected node, its parent, or its
            // branch (cat-<slug of branch>) — but only spokes Ka
            // actually builds can carry the mark, and the render's
            // spoke-underlay pass then moves the branch spoke's
            // visuals out of the hub group. The end state is:
            // a topic's own mark stays in its node group (its Ka
            // output is wrapped in .second-gen-rating-controls-only,
            // which the underlay pass skips); the branch's mark lives
            // in the branch's line-group underlay element
            // (.spoke-underlay-item[data-spoke-for="cat-<slug>"]),
            // never in the hub node group; and a subcategory carries
            // no mark of its own (its line is drawn by
            // renderKinkLine, which stamps no highlight, and no mark
            // is stamped for a topic's parent subcategory either) —
            // selecting a subcategory marks only its branch's line.
            // Which spokes carry a mark, and where, is decided by
            // selectionMarkKind (the single selection-marking
            // authority, defined above Ka) — the same function Ka
            // consults during render, so the end state reproduced
            // here cannot drift from the render's.
            // Each stamp copies its d from the spoke's .concept-hit —
            // the same path data the render stamps. Element
            // add/remove is a childList mutation, so the
            // map-selection-dim observer mirrors the result into
            // sel-keep / has-selection unchanged. No canonical layout
            // state and no delivered-geometry registry entry is
            // written here.
            if (!Cn) return;
            clearSelectionMarking();
            const hits = new Map();
            Cn.querySelectorAll(".concept-hit").forEach(hit => {
                const hid = hit.getAttribute("data-id");
                if (hid && !hits.has(hid) && !hit.closest(".layout-exit-clone")) hits.set(hid, hit);
            });
            const branchCatId = t && t.branch ? catId(t.branch) : null;
            if ("own" === selectionMarkKind(id, id, t)) {
                const hit = hits.get(id);
                if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
            if ("branch" === selectionMarkKind(branchCatId, id, t)) {
                const hit = hits.get(branchCatId), underlay = Cn.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(branchCatId)}"]`);
                if (underlay) stampSelectedSpoke(hit ? hit.getAttribute("d") : "", underlay);
                else if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
        }
        function selectSpokeNode(n, notify) {
            // The one selection path for a spoke's node (Build
            // 2026-10-18_1401): spoke taps (click and gesture paths),
            // spoke keyboard activation, and the Layout Editor's selects
            // (via __SEXCAPADES_LAYOUT_API.selectNode) all land here, so
            // selecting a branch means the same thing everywhere — set
            // the selected node, clear any pending rating target, apply
            // the .selected-spoke marking to the existing DOM, and
            // (unless the Layout Editor initiated it) notify the editor
            // so its Advanced selects follow. Selection-only: no
            // re-render and no solve — Mr() would re-deliver every
            // node position from canonical layout state, discarding
            // delivered geometry (scoped editor commits, DeKnotter
            // runs) that exists only in the rendered DOM.
            if (!n) return;
            Lt = n, Nt = null, sxSelEditorMirrored = n;
            applySelectionMarking(n, qn[n] || Xn(n) || (at[Vi()] || {})[n] || null);
            if (notify === !1) return;
            try {
                window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.selectNode && window.__SEXCAPADES_LAYOUT_UI.selectNode(n);
            } catch (err) { __sxErrLog("layout-select-node", err); }
        }
        function Qsel(e) {
            // Spoke tap = select ONLY (Build 2026-10-18_1401, deprecating
            // the tap-to-expand/collapse toggle on spokes): tapping a
            // spoke — the hit line, the stem, the taper, or the midline —
            // selects that branch and never expands or collapses it, not
            // even when the tapped spoke's branch is already selected
            // (Build 1314's fall-through to Qa in that case is removed).
            // Expand/collapse lives on the label and icon taps (Qa).
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            n && selectSpokeNode(n, !0);
        }
        function Ja() {
            // A rating-details pass can clear the expanded-branch set
            // while the map is still in its expanded state (kn). Re-seed
            // that set before deciding which topic names stay visible, so
            // fit zoom does not lose every label.
            kn && !rn.size && h.forEach(e => e && e.name && rn.add(e.name));
            In.querySelectorAll(".map-label").forEach(e => {
                const t = qn[e.dataset.topicId];
                if (!t) return;
                const n = Tt && String(t.label || "").toLowerCase().includes(Tt);
                e.classList.toggle("revealed", Boolean(n || rn.has(t.branch)));
            }), function() {
                if ("number" != typeof $p || "number" != typeof Ep || "number" != typeof Ap || void 0 === nh) return;
                const e = nh;
                In.querySelectorAll(".node-group[data-layout-key]").forEach(t => {
                    t.dataset.layoutKey;
                    const n = Ep + Number(t.dataset.layoutX) * $p, i = Ap + Number(t.dataset.layoutY) * $p, a = !Number.isFinite(n) || !Number.isFinite(i) || n < e.x - 90 || n > e.x + e.width + 90 || i < e.y - 90 || i > e.y + e.height + 90;
                    a !== Boolean(t.dataset.cameraOffscreen) && (t.dataset.cameraOffscreen = a ? "true" : "", 
                    t.querySelectorAll("[role],[tabindex]").forEach(e => {
                        a ? (e.hasAttribute("role") && (e.dataset.cameraRole = e.getAttribute("role")), 
                        e.hasAttribute("tabindex") && (e.dataset.cameraTabindex = e.getAttribute("tabindex")), 
                        e.removeAttribute("role"), e.setAttribute("tabindex", "-1"), e.setAttribute("aria-hidden", "true"), 
                        e.style.pointerEvents = "none") : (void 0 !== e.dataset.cameraRole && (e.setAttribute("role", e.dataset.cameraRole), 
                        delete e.dataset.cameraRole), void 0 !== e.dataset.cameraTabindex ? (e.setAttribute("tabindex", e.dataset.cameraTabindex), 
                        delete e.dataset.cameraTabindex) : e.removeAttribute("tabindex"), e.removeAttribute("aria-hidden"), 
                        e.style.removeProperty("pointer-events"));
                    }));
                });
            }();
        }
        function focusRelationLink(link, event) {
            event?.preventDefault(), event?.stopPropagation();
            const branchNames = [link.dataset.branchA, link.dataset.branchB].filter(Boolean), topicIds = [link.dataset.topicA, link.dataset.topicB].filter(Boolean);
            topicIds.forEach(id => {
                const topic = qn[id] || Xn(id);
                topic?.branch && branchNames.push(topic.branch);
            });
            branchNames.forEach(name => rn.add(name));
            if (branchNames.length) Mr();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const endpointIds = topicIds.length ? topicIds : branchNames.map(name => catId(name));
                const points = endpointIds.map(id => In.querySelector(`[data-layout-key="${CSS.escape(id)}"]`)).filter(Boolean).map(node => {
                    node.classList.remove("is-hidden");
                    return {x:Number(node.dataset.labelX || node.dataset.layoutX), y:Number(node.dataset.labelY || node.dataset.layoutY)};
                }).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
                if (points.length < 2) return;
                const [a,b] = points, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, pad = innerWidth <= 620 ? 70 : 110, spanX = Math.abs(b.x-a.x) + 170, spanY = Math.abs(b.y-a.y) + 170, scale = Math.max(.28, Math.min(innerWidth <= 620 ? 2.2 : 2.6, (nh.width-2*pad)/Math.max(spanX,1), (nh.height-2*pad)/Math.max(spanY,1)));
                const prevBt = Bt; Bt = !0; Ph(scale, nh.x + nh.width/2 - cx*scale, nh.y + nh.height/2 - cy*scale); Bt = prevBt;
            }));
        }
        document.addEventListener("click", function(event) {
            const link = __sxClosestAction(event.target, "relationHit");
            link && focusRelationLink(link, event);
        }, !0);
        window.__sxOnKey( function(event) {
            const link = event.target.closest?.(".common-overlap-link.relation-hit");
            link && (event.key === "Enter" || event.key === " ") && focusRelationLink(link, event);
        }, !0);
        // Map layout geometry (er, nr, rr, and the branch-order helpers)
        // lives in 02c-layout-solver.js. A second copy here is a strict-mode
        // SyntaxError (Identifier 'nr'/'rr' has already been declared) and
        // the bootstrap script never runs.
