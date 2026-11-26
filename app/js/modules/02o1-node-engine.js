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
        // Build 2026-10-17_1447: the map now OPENS in Medium - each expanded
        // branch shows its 7 most popular topics (popularity order, same
        // ordering as list view) instead of every topic. The Compact/Medium/
        // Full toggle in the map controls still lets the user show fewer or
        // more, and the level persists across profile/tab switches.
        // Build 2026-10-18_0343: the map now OPENS in Full - every topic in
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
    "subcategory-sex-acts-fluids": "s0044",
    "t0288": "t0281",
    "topic-hotwife": "t0281",
    "topic-cuckold-hotwife": "t0281",
    "topic-bull-hotwife-cuckold": "t0281",
    "topic-cuckqueen-stag-vixen": "t0406",
    "topic-cuckquean-stag-vixen": "t0406",
    "t0110": "t0412",
    "topic-tantra-energy-play": "t0412",
    "xqu0047": "xqu0046"
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

        var SX_SUBSUMED_BASE_TOPIC_IDS = {
            "FemDom": "t0009", "D/s": "t0010", "Brats": "t0012", "Switching": "t0014", "Male Authority": "t0015",
            "Ongoing dynamics": "t0008", "24/7": "t0013", "Romantic surrender": "t0375",
            "Hotwife": "t0288",
            "Rope bondage": "t0022", "Cuffs": "t0025", "Bondage tape": "t0029", "Mummification": "t0032", "Tape": "t0033",
            "Blindfold": "t0034", "Caging": "t0037", "Encasement": "t0038", "Sleepsacks": "t0039", "Immobilization": "t0040",
            "Suspension Bondage": "t0043", "Bondage art": "t0050", "Texture contrast": "t0102", "Sensory deprivation": "t0103",
            "Sensory overload": "t0104", "ASMR & whispering": "t0105", "Scent": "t0109", "Hands": "t0201",
            "Hands & gloves": "t0202", "Feet": "t0213", "Buttocks": "t0218", "Breasts": "t0220", "Pregnancy focus": "t0222",
            "Hair": "t0203", "Long Hair": "t0204", "Facial Hair": "t0208", "Beards": "t0209", "Body Hair": "t0210", "Pubic Hair": "t0211", "Muscles": "t0231"
        };
        function Wn(e) {
            if (e && "object" == typeof e && e.id) return e.id;
            const t = sxName(e);
            for (const cat of h) {
                for (const topic of cat.topics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                for (const topic of cat.parentTopics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                for (const sub of cat.subcategories || []) {
                    for (const topic of sub.topics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                    for (const topic of sub.parentTopics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                }
            }
            const n = (topicRecords[t] && topicRecords[t].id) || SX_SUBSUMED_BASE_TOPIC_IDS[t];
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
            for (const t of h) for (const n of t.subcategories || []) if (Un(t.name, n.name) === e || n.id === e) return {
                id: e,
                label: n.name,
                branch: t.name,
                kind: "Subcategory",
                risk: t.risk,
                parentId: catId(t.name),
                depth: 2,
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
            if (!e) return null;
            for (const cat of h) {
                if (cat.id === e || catId(cat.name) === e || cat.name === e) {
                    return {
                        id: cat.id || catId(cat.name),
                        label: cat.name,
                        branch: cat.name,
                        kind: "Category",
                        risk: Boolean(cat.risk),
                        parentId: null,
                        depth: 1,
                        subcategories: (cat.subcategories || []).map(s => Un(cat.name, s.name)),
                        topics: (cat.topics || []).map(Wn)
                    };
                }
            }
            const t = zn(e);
            if (t) return t;
            for (const t of h) {
                const n = t.topics.find(top => Wn(top) === e);
                if (n) {
                    const i = Vn(t, n);
                    return {
                        id: e,
                        label: sxName(n),
                        branch: t.name,
                        kind: "Topic",
                        risk: Boolean(((t.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                        parentId: i ? Un(t.name, i.name) : catId(t.name),
                        depth: i ? 3 : 2,
                        poleReading: n.poleReading || null,
                        poleEnemies: Array.isArray(n.poleEnemies) ? n.poleEnemies : null
                    };
                }
            }
            return null;
        }

        // ===== Phase 4 Uniform Node Type: Universal Node Engine =====
        function sxNodeRecord(id, profileId = Vi()) {
            if (!id) return null;
            let rec = qn[id] || Xn(id);
            if (!rec && typeof at !== "undefined" && at[profileId]) {
                rec = at[profileId][id] || null;
            }
            if (!rec && typeof li === "function") {
                rec = li().find(x => x.id === id) || null;
            }
            if (rec && !rec.depth) {
                if ("Category" === rec.kind) rec.depth = 1;
                else if ("Subcategory" === rec.kind) rec.depth = 2;
                else if (rec.parentId && (isSubId(rec.parentId) || (qn[rec.parentId] || {}).kind === "Subcategory")) rec.depth = 3;
                else if (rec.parentId) rec.depth = ((qn[rec.parentId] || {}).depth || 2) + 1;
                else rec.depth = 2;
            }
            return rec;
        }
        function sxNodeAncestorIds(id, profileId = Vi()) {
            const ancestors = [];
            const seen = new Set();
            let curr = id;
            while (curr && !seen.has(curr)) {
                seen.add(curr);
                const rec = sxNodeRecord(curr, profileId);
                if (!rec) break;
                let parentId = rec.parentId || null;
                if (!parentId && rec.branch && "Category" !== rec.kind) {
                    try { parentId = catId(rec.branch); } catch (_) {}
                }
                if (parentId && parentId !== curr && !seen.has(parentId)) {
                    ancestors.push(parentId);
                    curr = parentId;
                } else {
                    break;
                }
            }
            return ancestors;
        }
        function sxNodeChildrenIds(id, profileId = Vi()) {
            const rec = sxNodeRecord(id, profileId);
            if (!rec) return [];
            const children = [];
            if ("Category" === rec.kind) {
                const cat = h.find(c => (c.id === id || catId(c.name) === id));
                if (cat) {
                    (cat.subcategories || []).forEach(s => children.push(Un(cat.name, s.name)));
                    (cat.parentTopics || []).forEach(t => children.push(Wn(t)));
                    if (!(cat.subcategories || []).length) {
                        (cat.topics || []).forEach(t => children.push(Wn(t)));
                    }
                }
            } else if ("Subcategory" === rec.kind) {
                const sub = sgSub(id);
                if (sub) {
                    (sub.topics || []).forEach(t => children.push(Wn(t)));
                }
                if (typeof ai === "function") {
                    ai(id, profileId).forEach(cid => children.push(cid));
                }
            }
            if (typeof at !== "undefined" && at[profileId]) {
                Object.values(at[profileId]).forEach(ch => {
                    if (ch && ch.parentId === id && !children.includes(ch.id)) {
                        children.push(ch.id);
                    }
                });
            }
            return children;
        }
        function sxNodeRollup(id, profileId = Vi(), flank = "give", currentDepth = null, maxDepth = 3) {
            const rec = sxNodeRecord(id, profileId);
            if (!rec) return { value: null, rated: 0, total: 0 };
            const depth = currentDepth ?? (rec.depth || 1);
            const direct = ha(id, profileId, flank);
            if (null != direct) {
                return { value: direct, rated: 1, total: 1, isDirect: !0 };
            }
            const childIds = sxNodeChildrenIds(id, profileId);
            if (!childIds.length) {
                return { value: null, rated: 0, total: 0 };
            }
            let weightedSum = 0, totalWeight = 0, ratedCount = 0;
            const childDepth = depth + 1;
            const weight = Math.pow(2 / 3, Math.max(0, maxDepth - childDepth));
            childIds.forEach(cid => {
                const childRes = sxNodeRollup(cid, profileId, flank, childDepth, maxDepth);
                if (null != childRes.value) {
                    const w = childRes.isDirect ? weight : (weight * (childRes.rated || 1));
                    weightedSum += childRes.value * w;
                    totalWeight += w;
                    ratedCount += childRes.rated || 1;
                }
            });
            return {
                value: totalWeight > 0 ? Math.max(-100, Math.min(100, weightedSum / totalWeight)) : null,
                rated: ratedCount,
                total: childIds.length
            };
        }
        window.sxNodeRecord = sxNodeRecord;
        window.sxNodeAncestorIds = sxNodeAncestorIds;
        window.sxNodeChildrenIds = sxNodeChildrenIds;
        window.sxNodeRollup = sxNodeRollup;
        function Zn(e, t) {
            if ("give" !== t && "receive" !== t) return "";
            const n = qn[e] || Xn(e) || (at[Vi()] || {})[e], i = n && n.parentId && (qn[n.parentId] || Xn(n.parentId)), a = n && (He[n.label] || i && He[i.label]);
            return a && a["give" === t ? 0 : 1] || "";
        }
        function Qn(e, t = Vi()) {
            const n = qn[e] || Xn(e) || (at[t] || {})[e];
            return n && n.label ? String(n.label).trim().toLowerCase() : "";
        }
        function sxIsStanceSkin() {
            if (typeof window === "undefined") return false;
            const skin = window.__SX_ACTIVE_SKIN || (typeof window.__SX_SKIN_FROM_URL === "function" ? window.__SX_SKIN_FROM_URL() : null) || (window.__SX_SKIN_PREFIX && window.__SX_HOSTNAME_SKINS ? window.__SX_HOSTNAME_SKINS[window.__SX_SKIN_PREFIX] : null);
            if (skin && window.__SX_SKINS && window.__SX_SKINS[skin]) {
                return window.__SX_SKINS[skin].kind === "stance";
            }
            const pfx = window.__SX_SKIN_PREFIX;
            if (pfx) return "sex" !== pfx && "dance" !== pfx && "quest" !== pfx;
            return false;
        }
        window.sxIsStanceSkin = sxIsStanceSkin;

        function Jn(e, t, n = Vi()) {
            if (sxIsStanceSkin()) {
                const isAdv = "give" === t;
                const roleLabel = isAdv ? "Advocacy" : "Receptivity";
                const a = Qn(e, n);
                return a ? `${roleLabel} · ${a}` : roleLabel;
            }
            const i = Ge(e, n);
            const a = Qn(e, n);
            const idx = i.keys ? i.keys.indexOf(t) : -1;
            let roleLabel = (idx >= 0 && i.labels && i.labels[idx]) ? i.labels[idx] : ("give" === t ? i.labels[0] : i.labels[1]) || t;
            if (i.single) {
                return a ? (roleLabel && roleLabel.toLowerCase() !== a ? `${roleLabel} (${a})` : a) : roleLabel;
            }
            if (i.triple) {
                return a ? `${roleLabel} · ${a}` : roleLabel;
            }
            if ("give" === i.labels[0] && "receive" === i.labels[1]) {
                return a ? `${t} ${a}` : t;
            }
            return a ? `${roleLabel} · ${a}` : roleLabel;
        }
        function ei(e, t, n = Vi()) {
            if (sxIsStanceSkin()) return "";
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
            cuddling: "Cuddling",
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
            return Boolean(n.giveKnown || n.receiveKnown || n.lineKnown || n.polesKnown);
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
            const collected = new Set();
            function gather(node) {
                const kids = bi(node);
                kids.forEach(kidId => {
                    if (!collected.has(kidId)) {
                        collected.add(kidId);
                        const kidRec = qn[kidId] || Xn(kidId);
                        if (kidRec) gather(kidRec);
                    }
                });
            }
            gather(e);
            return collected;
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
            let sxTapX = 0, sxTapY = 0, sxTapDown = !1, sxTapOnMap = !1;
            window.__sxOnPtr( e => {
                sxTapX = e.clientX, sxTapY = e.clientY, sxTapDown = !0,
                // Hot List popup fix (2026-11-16): this guard used to
                // swallow the pointerup of ANY >10px drag anywhere in
                // the app - including the widget canvases, whose
                // drag-end handlers live on the canvas and never fired,
                // leaving isDragging stuck true and killing canvas hover
                // tips after any drag (popup AND placard). Only swallow
                // pointerups for gestures that started on the map, which
                // is what the guard protects (map pan/tap
                // disambiguation); the click itself stays suppressed
                // app-wide by the 03b guard and the one-shot listener
                // below, unchanged.
                sxTapOnMap = !!(e.target && e.target.closest && e.target.closest("#mapSvg"));
            }, !0);
            document.addEventListener("pointerup", e => {
                if (!sxTapDown) return;
                sxTapDown = !1;
                const onMap = sxTapOnMap;
                sxTapOnMap = !1;
                const dx = e.clientX - sxTapX, dy = e.clientY - sxTapY;
                if (dx * dx + dy * dy > 100) {
                    if (onMap) e.preventDefault(), e.stopPropagation();
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
        // Interest-color stops - the one source both interest encodings
        // derive from (map-render refactor, finding 7): zi() interpolates
        // these rgb stops, and Ka's rating-rail CSS gradient uses the
        // same stops as the --red-deep / --curious / --green-deep custom
        // properties (shell :root: #bd4f51 / #d7bd55 / #3da874 - the
        // same values in hex). Change a stop here and in the shell
        // :root together.
