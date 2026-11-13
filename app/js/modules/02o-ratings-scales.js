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
            // KinkTest fix (1.1): a direct rating on the subcategory
            // itself wins over the roll-up of its topics, mirroring da().
            if (i) {
                const direct = ha(i, t, n);
                if (null != direct) return direct;
            }
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
            // KinkTest fix (1.1): a direct rating on the branch itself
            // wins over the roll-up of its children, mirroring da().
            const direct = ha(catId(e.name), t, n);
            if (null != direct) return {
                value: direct,
                rated: 0,
                total: u.length
            };
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
