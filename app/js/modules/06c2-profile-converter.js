        const ok = {
            "pleasure control": "cat-orgasm-reproductive-play",
            restraint: "cat-bondage-restriction",
            bondage: "cat-bondage-restriction",
            roleplay: "cat-roleplay-identity",
            degradation: "cat-psychological-dynamics",
            pain: "cat-impact-pain-body-modification",
            sensation: "cat-sensation-atmosphere",
            "edge play": "cat-impact-pain-body-modification",
            "potty play": "cat-fluids-messy-play"
        }, sk = {
            1: [ "t0327", "receive" ],
            2: [ "t0360", "give" ],
            3: [ "t0338", "give" ],
            4: [ "t0134", "receive" ],
            5: [ "t0360", "receive" ],
            6: [ "t0326", "receive" ],
            7: [ "t0245", "give" ],
            8: [ "t0093", "receive" ],
            9: [ "t0101", "give" ],
            10: [ "t0097", "receive" ],
            11: [ "cat-fluids-messy-play", "give" ],
            12: [ "t0136", "give" ],
            13: [ "t0035", "give" ],
            14: [ "t0185", "give" ],
            15: [ "t0185", "receive" ],
            16: [ "t0134", "give" ],
            17: [ "t0270", "receive" ],
            18: [ "cat-impact-pain-body-modification", "give" ],
            19: [ "t0240", "receive" ],
            20: [ "t0101", "receive" ],
            21: [ "t0093", "give" ],
            22: [ "t0354", "receive" ],
            23: [ "t0123", "receive" ],
            24: [ "t0326", "give" ],
            25: [ "cat-fluids-messy-play", "receive" ],
            26: [ "t0270", "receive" ],
            27: [ "cat-fluids-messy-play", "give" ],
            28: [ "t0327", "give" ],
            29: [ "t0270", "give" ],
            30: [ "t0035", "receive" ],
            31: [ "cat-impact-pain-body-modification", "receive" ],
            32: [ "t0326", "give" ],
            33: [ "t0270", "give" ],
            34: [ "t0354", "give" ],
            35: [ "t0040", "give" ],
            36: [ "t0070", "give" ],
            37: [ "t0035", "receive" ],
            38: [ "t0269", "give" ],
            39: [ "t0245", "receive" ],
            40: [ "t0096", "receive" ],
            41: [ "t0025", "receive" ],
            42: [ "t0239", "give" ],
            43: [ "t0123", "give" ],
            44: [ "t0096", "give" ],
            45: [ "t0056", "receive" ],
            46: [ "t0131", "give" ],
            47: [ "t0097", "give" ],
            48: [ "t0270", "receive" ],
            49: [ "t0327", "receive" ],
            50: [ "t0042", "give" ],
            51: [ "t0136", "receive" ],
            52: [ "t0097", "receive" ],
            53: [ "t0097", "give" ],
            54: [ "t0042", "receive" ],
            55: [ "t0074", "receive" ],
            56: [ "t0326", "receive" ],
            57: [ "t0056", "give" ],
            58: [ "t0035", "give" ],
            59: [ "t0270", "receive" ],
            60: [ "t0096", "give" ],
            61: [ "t0040", "receive" ],
            62: [ "t0025", "give" ],
            63: [ "t0096", "receive" ],
            64: [ "t0338", "receive" ],
            65: [ "cat-fluids-messy-play", "receive" ],
            66: [ "t0074", "give" ],
            67: [ "t0239", "receive" ],
            68: [ "t0040", "receive" ],
            69: [ "t0040", "give" ],
            70: [ "t0070", "receive" ],
            71: [ "t0327", "give" ]
        }, lk = new Set([ 2, 6, 7, 10, 17, 18, 19, 23, 24, 25, 26, 27, 29, 31, 32, 33, 35, 38, 40, 43, 44, 46, 47, 48, 52, 53, 56, 59, 60, 61, 63, 65, 68, 69 ]);
        function ck(e) {
            return String(e || "").toLowerCase().replace(/&/g, " and ").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
        }
        function dk(e) {
            const t = new Set([ "a", "an", "and", "the", "play", "roleplay", "kink", "fetish", "fantasy", "bondage", "sex", "sexual", "role", "roles" ]);
            return ck(e).split(" ").filter(e => e && !t.has(e)).map(e => e.replace(/(?:ing|ed|es|s)$/, "")).filter(Boolean);
        }
        let uk = null;
        function pk(e, t, n) {
            if (!e || !e.id) return null;
            if (isCatId(e.id)) return {
                id: migrateNodeKey(e.id),
                label: mx(migrateNodeKey(e.id)),
                child: null
            };
            const i = e.id, a = Xn(i), r = function(e) {
                const t = ni(e);
                if (!t) return null;
                const n = function() {
                    if (uk) return uk;
                    const e = {}, t = (t, n) => {
                        const i = ck(t);
                        i && !e[i] && (e[i] = n);
                        const a = i.replace(/\s+/g, "");
                        a && a !== i && !e[a] && (e[a] = n);
                    };
                    for (const e of h) for (const n of e.topics) {
                        const e = Wn(n);
                        t(n, e);
                        const i = String(n).replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, "").trim();
                        i && i !== n && t(i, e), String(n).split("/").forEach(i => {
                            const a = i.trim();
                            a && a !== n && t(a, e);
                        }), String(n).split("&").forEach(i => {
                            const a = i.trim();
                            a && a !== n && t(a, e);
                        });
                    }
                    return uk = e, e;
                }();
                let i = n[ck(t)];
                if (i) return i;
                if (i = n[ck(t).replace(/\s+/g, "")], i) return i;
                const a = t.replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, "").trim();
                if (a && a !== t && (i = n[ck(a)], i)) return i;
                const r = ck(t), o = new Set;
                r.endsWith("s") ? o.add(r.slice(0, -1)) : o.add(r + "s"), r.endsWith("es") && o.add(r.slice(0, -2));
                for (const e of o) if (i = n[e], i) return i;
                return null;
            }(t);
            if (r && r !== i) return {
                id: r,
                label: mx(r),
                child: null
            };
            if (a && function(e, t, n) {
                const i = ni(e);
                if (!i || ck(i) === ck(t.label)) return !1;
                if (n.uncertain || n.specific) return !0;
                const a = new Set(dk(i)), r = new Set(dk(t.label));
                return !!a.size && (![ ...a ].filter(e => r.has(e)).length || [ ...a ].some(e => !r.has(e)) && [ ...r ].some(e => !a.has(e)));
            }(t, a, e)) {
                const sxSugName = ni(t);
                if (sxSugName) return {
                    id: i,
                    label: mx(i),
                    child: null,
                    suggestion: {
                        name: sxSugName,
                        parentId: i
                    }
                };
            }
            return {
                id: i,
                label: mx(i),
                child: null
            };
        }
        function hk(e) {
            if (!e || !e.child) return e ? e.label : "";
            const t = Xn(e.child.parentId);
            return `${t ? t.label : mx(e.child.parentId)} → ${e.child.label}`;
        }
        // Minting-suggestions build (2026-11-05): pathed display for
        // converter mapping targets and suggestion parent paths, in the
        // minimal-spanning convention - foreshortened category form,
        // then subcategory, then topic, joined by ›, middle omitted
        // when flat. Category forms ruled 2026-11-05 (7 letters where
        // the name fits, 8 where it needs it), in taxonomy-file order.
        const SX_CAT_FORMS = {
            c0001: "POWEREX",
            c0002: "BONDAGE",
            c0003: "IMPACT",
            c0004: "SENSATN",
            c0005: "ROLEPLY",
            c0006: "CLOTHNG",
            c0007: "BODYFOCS",
            c0008: "PSYCHOL",
            c0009: "WATCHNG",
            c0010: "PARTNER",
            c0011: "SEXACTS",
            c0012: "POSITION",
            c0013: "ORGASM",
            c0014: "FLUIDS",
            c0015: "PRIMAL",
            c0016: "SERVICE",
            c0017: "FANTASY",
            c0018: "CONNECT"
        };
        function sxNodePath(e) {
            if (!e) return "";
            const id = migrateNodeKey(e);
            if (isCatId(id)) return SX_CAT_FORMS[id] || mx(id);
            const s = zn(id);
            if (s) {
                const c = h.find(c => c.name === s.branch);
                return `${c ? SX_CAT_FORMS[c.id] || s.branch : s.branch}›${s.label}`;
            }
            const n = Xn(id);
            if (n && "Topic" === n.kind) {
                const c = h.find(c => c.name === n.branch), form = c ? SX_CAT_FORMS[c.id] || n.branch : n.branch;
                if (n.parentId) {
                    const p = zn(n.parentId);
                    if (p) return `${form}›${p.label}›${n.label}`;
                }
                return `${form}›${n.label}`;
            }
            const ch = qn[id];
            if (ch && ch.parentId) return `${sxNodePath(ch.parentId)}›${ch.label}`;
            return mx(id);
        }
        // ============================================================

        // F9 (profiles-data refactor, Edit 3): the merge dispatcher's
        // and the serializer's kind vocabularies, named once. Routing
        // behavior is unchanged: merge kinds outside the set fall
        // through to the profile route (yx is exported as
        // window.__sexcapades.ProfileIO, so callers outside this
        // bundle may pass kinds it does not define; a throw would
        // break them), and serialize kinds outside the set keep the
        // long-standing "Unsupported profile export" throw.
        const SX_MERGE_KINDS = new Set([ "converter", "shared", "profile" ]), SX_SERIALIZE_KINDS = new Set([ "profile", "viewport", "export", "sync-card", "compact", "bundle", "envelope" ]);

        const fx = {
            dominant: {
                id: "c0001",
                direction: "give"
            },
            submissive: {
                id: "c0001",
                direction: "receive"
            },
            "master mistress": {
                id: "t0131",
                direction: "give",
                uncertain: !0
            },
            slave: {
                id: "t0131",
                direction: "receive",
                uncertain: !0
            },
            sadist: {
                id: "cat-impact-pain-body-modification",
                direction: "give",
                uncertain: !0
            },
            masochist: {
                id: "cat-impact-pain-body-modification",
                direction: "receive",
                uncertain: !0
            },
            rigger: {
                id: "t0022",
                direction: "give"
            },
            "rope bunny": {
                id: "t0022",
                direction: "receive"
            },
            degrader: {
                id: "t0239",
                direction: "give"
            },
            degradee: {
                id: "t0239",
                direction: "receive"
            },
            owner: {
                id: "t0131",
                direction: "give"
            },
            pet: {
                id: "t0136",
                direction: "receive"
            },
            "daddy mommy": {
                id: "t0125",
                direction: "give",
                uncertain: !0
            },
            "boy girl": {
                id: "t0125",
                direction: "receive",
                uncertain: !0
            },
            "brat tamer": {
                id: "t0005",
                direction: "give",
                uncertain: !0
            },
            brat: {
                id: "t0005",
                direction: "receive",
                uncertain: !0
            },
            "primal hunter": {
                id: "t0351",
                direction: "give"
            },
            "primal prey": {
                id: "t0351",
                direction: "receive"
            },
            exhibitionist: {
                id: "t0270",
                direction: "both"
            },
            voyeur: {
                id: "t0270",
                direction: "both"
            },
            ageplayer: {
                id: "t0123",
                direction: "both",
                uncertain: !0
            },
            switch: {
                id: null,
                direction: "both"
            },
            experimentalist: {
                id: null,
                direction: "both"
            },
            "non monogamist": {
                id: "cat-partner-configurations",
                direction: "both",
                uncertain: !0
            },
            vanilla: {
                id: "cat-connection-aftercare",
                direction: "both",
                uncertain: !0
            }
        };
