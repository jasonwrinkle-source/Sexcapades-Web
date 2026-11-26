        const yx = Object.freeze({
            importData(data, opts) {
                return sxMergeAsProfile(data, Object.assign({ quiet: true }, opts));
            },
            parse(e, t) {
                const n = String(e || "").toLowerCase();
                let i;
                if ("kinktest" === n) i = function(e) {
                    const t = {}, n = {}, i = {}, a = {}, r = {}, o = {}, s = [], l = [], c = [];
                    let d = 0, u = 0;
                    // Load example used to join every result with spaces, and a
                    // pasted line can carry a trailing "#1: favorite" note.
                    // Break those into the newline records this parser reads,
                    // without splitting a multi-word activity name.
                    const sxLines = String(e || "").replace(/\r\n?/g, "\n").replace(/[ \t]*[/|,;]*[ \t]+(?=#\d{1,2}\s*:)/g, "\n").replace(/(\bsub\b)[ \t]+(?=[A-Za-z])/gi, "$1\n").split("\n");
                    return sxLines.forEach((e, p) => {
                        const h = e.trim();
                        if (!h) return;
                        u++;
                        const g = h.match(/^([^:]+):\s*(\d{1,3})\s*%?\s*(?:dom|d)\s*[,;/]\s*(\d{1,3})\s*%?\s*(?:sub|s)\s*[\/|,;\s]*$/i);
                        if (g) {
                            const e = sxNormalizeTermText(g[1]), n = ok[e] && migrateNodeKey(ok[e]), i = Number(g[2]), a = Number(g[3]);
                            return !n || i > 100 || a > 100 ? void s.push(`Line ${p + 1}: category or percentage not recognized.`) : (sxPushFlankSample(t, n, "give", Math.round(2 * i - 100)), 
                            sxPushFlankSample(t, n, "receive", Math.round(2 * a - 100)), c.push(`${g[1].trim()} → ${sxNodePath(n)} · give ${i}% · receive ${a}%`), 
                            d++, void ("edge play" === e && l.push("Edge Play shares the Impact, pain & body modification branch with Pain.")));
                        }
                        const m = h.match(/^#?(\d{1,2})\s*:\s*(?:.*?:\s*)?([1-4]|favorite|neutral|not interested|hard limit|fantasy only|already tried)\s*$/i);
                        if (m) {
                            const e = Number(m[1]), u = sk[e], h = sxNormalizeTermText(m[2]);
                            if (!u) return void s.push(`Line ${p + 1}: KinkTest item #${e} has no mapping.`);
                            const g = migrateNodeKey(u[0]);
                            let f = "";
                            if ("1" === h || "hard limit" === h) n[g] = "limit", o[g] = !0, f = "Hard Limit"; else if ("2" === h || "not interested" === h) n[g] = "notinterested", 
                            o[g] = !0, f = "Not Interested"; else if ("favorite" === h) n[g] = "favorite", o[g] = !0, 
                            f = "Favorite"; else if ("neutral" === h) r[g] = !0, o[g] = !0, f = "Neutral"; else if ("fantasy only" === h) i[g] = !0, 
                            o[g] = !0, f = "Fantasy Only"; else if ("already tried" === h) a[g] = !0, o[g] = !0, 
                            f = "Already Tried"; else {
                                const e = {
                                    3: 33,
                                    4: 100
                                }[Number(h)];
                                sxPushFlankSample(t, g, u[1], e), f = String(e);
                            }
                            return c.push(`#${e} → ${sxNodePath(g)} · ${u[1]} · ${f}`), d++, void (lk.has(e) && l.push(`#${e} uses the closest available Sexcapades topic.`));
                        }
                        s.push(`Line ${p + 1}: “${h.slice(0, 70)}” was not recognized.`);
                    }), sxMeanFlankRatings(t, {
                        annotations: n,
                        fantasyOnly: i,
                        alreadyTried: a,
                        neutralNodes: r,
                        discreteNodes: o,
                        mappedLines: d,
                        totalLines: u,
                        warnings: s,
                        bestFit: [ ...new Set(l) ],
                        mappings: c,
                        // KinkTest fix (1.1): the branch ids this paste
                        // rated, so the merge records them as categoryHits
                        // (like FetLife's broadHits) and On Deck can
                        // propose their topics.
                        categoryHits: Object.keys(t).filter(e => isCatId(e) || isSubId(e))
                    });
                }(String(t || "")); else if ("checklist" === n || "yesnomaybe" === n) i = function(e) {
                    const t = {}, n = {}, i = {}, a = {}, r = {}, o = {}, s = {}, sxNotes = {}, l = [], c = [], d = [], sxSug = [];
                    let u = 0, p = 0, h = !1;
                    const g = (e, n, i) => {
                        !Ke.has(e) && !isCatId(e) && !isSubId(e) && !s[e] || (t[e] || (t[e] = {}), t[e][n] = i);
                    }, m = (e, t, h, m) => {
                        const f = sxNormalizeTermText(e);
                        if (!f) return;
                        if (p++, [ "religious play", "online roleplay" ].includes(f) || "other" === f || "kinks or fetishes not mentioned" === f) return void l.push(`Line ${h}: “${e}” has no matching topic and was skipped.`);
                        const y = (t.match(/(?:^|[,;\s])(T|B|S)(?=$|[,;\s])/i) || [])[1]?.toUpperCase() || (/\bgiving\b/.test(sxNormalizeTermText(t)) ? "T" : /\breceiving\b/.test(sxNormalizeTermText(t)) ? "B" : "S"), b = sxNormalizeTermText(t), v = t.match(/\b(Yes|Maybe|No)\b/i), N = (t.match(/^\s*([0-5])(?=\s*[,;]|\s*$)/) || [])[1], w = t.includes("!") || /\bfavorites?\b/.test(b), k = m || /\bhard limits?\b/.test(b), x = /\b(?:not interested|not into)\b/.test(b) || "no" === v?.[1].toLowerCase(), S = /\bneutral\b/.test(b), $ = /\bfantasy only\b/.test(b), E = /\balready tried\b/.test(b), W = /\bwatching\b/.test(b), A = !(v || N) || k || x || S ? null : N ? {
                            "0": 0,
                            "1": 20,
                            "2": 40,
                            "3": 60,
                            "4": 80,
                            "5": 100
                        }[N] : {
                            yes: 100,
                            maybe: 35
                        }[v[1].toLowerCase()] ?? null, C = e => {
                            k ? n[e] = "limit" : x ? n[e] = "notinterested" : w && (n[e] = "favorite"), S && (r[e] = !0), 
                            $ && (i[e] = !0), E && (a[e] = !0), (k || x || w || S || $ || E) && (o[e] = !0);
                        }, M = k ? "Hard Limit" : x ? "Not Interested" : S ? "Neutral" : w ? "Favorite" : $ ? "Fantasy Only" : E ? "Already Tried" : "";
                        if ("predator prey" === f) {
                            const t = "t0351", n = "T" === y ? [ [ t, "give" ] ] : "B" === y ? [ [ t, "receive" ] ] : [ [ t, "give" ], [ t, "receive" ] ];
                            return n.forEach(([e, t]) => {
                                null !== A && g(e, t, A), C(e);
                            }), d.push(`${e} → ${n.map(([e, t]) => `${sxNodePath(e)} · ${t}`).join(" + ")}${M ? ` · ${M}` : null !== A ? ` · ${A}` : ""}${$ && "Fantasy Only" !== M ? " · Fantasy Only" : ""}${E && "Already Tried" !== M ? " · Already Tried" : ""}`), 
                            void u++;
                        }
                        const I = sxMatchHtmlFetish(e);
                        if (!I) return void l.push(`Line ${h}: “${e}” was not recognized or has no matching topic.`);
                        const P = sxResolveAliasTarget(I, e, s);
                        if (!P) return void l.push(`Line ${h}: “${e}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                        const L = P.id;
                        // Importer rework Part B/C: a "(watching)" /
                        // "(watching others wear)" qualifier takes the
                        // annotation path - a note on the topic, never a
                        // forced give/receive rating (same rule as the
                        // FetLife importer's watching/wearing stances).
                        W && (sxNotes[L] || (sxNotes[L] = []), sxNotes[L].includes("Watching · from the Yes / No / Maybe checklist") || sxNotes[L].push("Watching · from the Yes / No / Maybe checklist")), null !== A && ("T" !== y && "S" !== y || g(L, "give", A), "B" !== y && "S" !== y || g(L, "receive", A)), 
                        C(L), P.suggestion && sxSug.push({
                            name: P.suggestion.name,
                            parentId: L,
                            parentPath: sxNodePath(L),
                            section: "",
                            direction: y,
                            value: A
                        }), d.push(`${e} → ${sxNodePath(L)} · ${"T" === y ? "give" : "B" === y ? "receive" : "give + receive"}${M ? ` · ${M}` : null !== A ? ` · ${A}` : ""}${$ && "Fantasy Only" !== M ? " · Fantasy Only" : ""}${E && "Already Tried" !== M ? " · Already Tried" : ""}`), 
                        u++;
                    };
                    return e.split(/\r?\n/).forEach((e, t) => {
                        const n = e.trim();
                        if (!n) return;
                        if (/^limits\s*:/i.test(n)) {
                            h = !0;
                            const e = n.replace(/^limits\s*:/i, "").trim();
                            return void (e && e.split(/[,;]/).forEach(e => m(e, "", t + 1, !0)));
                        }
                        if (h) return void n.split(/[,;]/).forEach(e => m(e, "", t + 1, !0));
                        const i = n.indexOf(":");
                        if (i < 0) return l.push(`Line ${t + 1}: add “: Yes”, “: Maybe”, or “: No”.`), void p++;
                        m(n.slice(0, i), n.slice(i + 1), t + 1, !1);
                    }), {
                        ratings: t,
                        annotations: n,
                        fantasyOnly: i,
                        alreadyTried: a,
                        neutralNodes: r,
                        discreteNodes: o,
                        notes: sxNotes,
                        children: s,
                        suggestions: sxSug,
                        mappedLines: u,
                        totalLines: p,
                        warnings: l,
                        bestFit: [ ...new Set(c) ],
                        mappings: d
                    };
                }(String(t || "")); else if ("fetlife" === n) i = FetLifeImporter.run(String(t || "")); else if ("bdsmtest" === n) i = function(e) {
                    let t = String(e || "");
                    /<\/?[a-z][\s\S]*>/i.test(t) && (t = (new DOMParser).parseFromString(t, "text/html").body.textContent || ""), 
                    t = t.replace(/==\s*Results from bdsmtest\.org\s*==/gi, " ").replace(/\u00a0/g, " ");
                    const n = [], i = new Set, a = /(\d{1,3})\s*%\s*([A-Za-z][A-Za-z /()&-]*?)(?=\s*(?:,|;|[\r\n]|\d{1,3}\s*%|$))/g;
                    let r;
                    for (;r = a.exec(t); ) {
                        const e = r[2].trim().replace(/[.:-]+$/, "").trim(), t = Number(r[1]), a = sxNormalizeTermText(e);
                        e && t <= 100 && !i.has(a) && (n.push({
                            name: e,
                            score: t
                        }), i.add(a));
                    }
                    return n.length || t.split(/\r?\n/).forEach(e => {
                        const t = e.trim().match(/^([A-Za-z][A-Za-z /()&-]*?)\s*[:–—-]\s*(\d{1,3})\s*%?$/);
                        if (!t) return;
                        const a = t[1].trim(), r = Number(t[2]), o = sxNormalizeTermText(a);
                        r <= 100 && !i.has(o) && (n.push({
                            name: a,
                            score: r
                        }), i.add(o));
                    }), n.length ? function(e) {
                        const t = {}, n = {}, i = {}, a = {}, r = [], o = [], s = [], sxSug = [];
                        let l = 0, c = 0;
                        return e.forEach((e, d) => {
                            c++;
                            const u = String(e && e.name || "").trim(), p = e && null != e.score ? e.score : "", g = Number(String(p).replace("%", "").trim()), m = sxNormalizeTermText(u);
                            if (!u || !Number.isFinite(g) || g < 0 || g > 100) return void r.push(`Result ${d + 1} did not contain a readable role name and 0–100 score.`);
                            const f = fx[m];
                            if (!f) return void r.push(`Result ${d + 1}: “${u}” is not one of the 25 BDSMtest roles.`);
                            if (!f.id) return void r.push(`Result ${d + 1}: “${u}” has no close Sexcapades topic and was skipped.`);
                            const y = sxResolveAliasTarget(f, u, a);
                            if (!y) return void r.push(`Result ${d + 1}: “${u}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                            const b = y.id;
                            0 === g ? (n[b] = !0, i[b] = !0) : (t[b] || (t[b] = {}), "give" !== f.direction && "both" !== f.direction || (t[b].give = Math.max(t[b].give || 0, g)), 
                            "receive" !== f.direction && "both" !== f.direction || (t[b].receive = Math.max(t[b].receive || 0, g))), l++, 
                            s.push(`${u} → ${sxNodePath(b)} · ${f.direction} · ${0 === g ? "Neutral" : g}`), y.suggestion && sxSug.push({
                            name: y.suggestion.name,
                            parentId: b,
                            parentPath: sxNodePath(b),
                            section: "",
                            direction: f.direction,
                            value: g
                        }), y.child && o.push(`“${u}” was kept as its own child under ${function(e) {
                                const t = sxNodeRegistry[e];
                                if (t) return t.label;
                                for (const t of h) {
                                    if (catId(t.name) === e) return t.name;
                                    const n = t.topics.find(t => sxResolveTopicId(t) === e);
                                    if (n) return n;
                                }
                                return e;
                            }(f.id)}.`);
                        }), {
                            ratings: t,
                            annotations: {},
                            neutralNodes: n,
                            discreteNodes: i,
                            children: a,
                            suggestions: sxSug,
                            mappedLines: l,
                            totalLines: c,
                            warnings: r,
                            bestFit: [ ...new Set(o) ],
                            mappings: s
                        };
                    }(n) : {
                        ratings: {},
                        annotations: {},
                        mappedLines: 0,
                        totalLines: 0,
                        warnings: [ "No BDSMtest role scores were found. Paste lines such as “100% Dominant” from the results page." ],
                        bestFit: [],
                        mappings: []
                    };
                }(String(t || "")); else if ("json" === n) try {
                    i = JSON.parse(String(t || ""));
                } catch (e) {
                    throw new Error("This JSON file does not contain readable Sexcapades profile data.");
                } else if ("pdf" === n) try {
                    i = JSON.parse(function(e) {
                        const t = new TextDecoder("latin1").decode(e), i = t.indexOf("sexcapades-profile:");
                        if (i < 0) throw new Error("This PDF does not contain Sexcapades profile data.");
                        const a = t.slice(i + 19).match(/^([A-Za-z0-9+/=]+)/);
                        if (!a) throw new Error("This PDF does not contain Sexcapades profile data.");
                        return decodeURIComponent(escape(atob(a[1])));
                    }(t));
                } catch (e) {
                    if (e && /does not contain/.test(e.message || "")) throw e;
                    throw new Error("The embedded PDF profile data is not readable.");
                } else {
                    if ("png" === n) return async function(e) {
                        if (![ 137, 80, 78, 71, 13, 10, 26, 10 ].every((t, n) => e[n] === t)) throw new Error("This PNG does not contain Sexcapades profile data.");
                        let t = 8, n = null, i = "", sxSawIend = !1, sxSexSeen = !1;
                        for (;t + 12 <= e.length; ) {
                            const a = new DataView(e.buffer, e.byteOffset + t, 4).getUint32(0), r = t + 12 + a;
                            if (r > e.length) throw new Error("The PNG profile data is incomplete.");
                            const o = String.fromCharCode(...e.slice(t + 4, t + 8)), s = e.slice(t + 8, t + 8 + a);
                            if ("zTXt" === o) {
                                const sxNul = s.indexOf(0), sxKeyword = sxNul > 0 ? new TextDecoder("latin1").decode(s.slice(0, sxNul)) : "";
                                if ("Sexcapades" === sxKeyword || "vCard" === sxKeyword) {
                                    // Rank 5 guard: the chunk CRC is the
                                    // integrity check the PNG format
                                    // already carries, and the old code
                                    // never read it - a chunk whose bytes
                                    // were damaged after embedding could
                                    // still restore if it decompressed.
                                    // A bad CRC, a second Sexcapades
                                    // chunk, or a non-zero compression
                                    // method refuses the picture instead
                                    // of restoring it silently.
                                    if (!sxPngChunkCrc(e, t, a)) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    if ("Sexcapades" === sxKeyword && sxSexSeen) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    if (0 !== s[sxNul + 1]) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    const sxDecoded = (new TextDecoder).decode(await sxInflatePngProfile(s.slice(sxNul + 2)));
                                    if ("Sexcapades" === sxKeyword) {
                                        sxSexSeen = !0;
                                        try { n = JSON.parse(sxDecoded); } catch (err) { throw new Error("The PNG profile data is damaged or incomplete."); }
                                    } else i = sxDecoded;
                                }
                            } else if ("iTXt" === o) {
                                const sxNul = s.indexOf(0), sxKeyword = sxNul > 0 ? new TextDecoder("latin1").decode(s.slice(0, sxNul)) : "";
                                if ("vCard" === sxKeyword) {
                                    if (!sxPngChunkCrc(e, t, a)) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    const sxCompressed = 1 === s[sxNul + 1], sxMethod = s[sxNul + 2], sxLangEnd = s.indexOf(0, sxNul + 3), sxTransEnd = sxLangEnd >= 0 ? s.indexOf(0, sxLangEnd + 1) : -1;
                                    if (sxLangEnd < 0 || sxTransEnd < 0 || 0 !== sxMethod) throw new Error("The PNG vCard data is incomplete.");
                                    const sxRaw = s.slice(sxTransEnd + 1);
                                    i = (new TextDecoder).decode(sxCompressed ? await sxInflatePngProfile(sxRaw) : sxRaw);
                                }
                            }
                            if ("IEND" === o) { sxSawIend = !0; break; }
                            t = r;
                        }
                        // A picture cut off after its profile chunk but
                        // before IEND is truncated, not restored: the
                        // old loop returned the payload in that case.
                        if (!sxSawIend) throw new Error("The PNG profile data is incomplete.");
                        if (!n) throw new Error("This PNG does not contain Sexcapades profile data.");
                        return {
                            payload: n,
                            vcard: i
                        };
                    }(t).then(e => ({
                        payload: this.validate("shared", e.payload),
                        vcard: e.vcard || ""
                    }));
                    if ("qr" === n) return async function(e) {
                        let t;
                        try {
                            t = JSON.parse(await async function(e) {
                                if (e.startsWith("SCP2J:")) return (new TextDecoder).decode(sxDecodeBase64Url(e.slice(6)));
                                if (e.startsWith("SCP3:")) {
                                    if ("function" != typeof DecompressionStream) throw new Error("This browser cannot decompress that profile-data QR.");
                                    const t = new Blob([ sxDecodeBase45(e.slice(5)) ]).stream().pipeThrough(new DecompressionStream("deflate"));
                                    return (new TextDecoder).decode(await new Response(t).arrayBuffer());
                                }
                                throw new Error("Unsupported profile-data QR format.");
                            }(String(e || "")));
                        } catch (e) {
                            throw new Error("That QR code does not contain readable Sexcapades profile data.");
                        }
                        if (t && "sexcapades" === t.a && 7 === t.v) return sxDecodeQrProfile(t, cu);
                        if (t && "sexcapades" === t.a && 6 === t.v) return sxDecodeQrProfile(t, uu);
                        if (t && "sexcapades" === t.a && (5 === t.v || 4 === t.v)) return sxRewriteLegacySlugs(sxDecodeQrProfile(t, pu));
                        if (sxIsProfilePayload(t)) return t;
                        throw new Error("That QR code does not contain current Sexcapades profile data.");
                    }(String(t || "")).then(e => this.validate("profile", e));
                    if ("share-link" === n) i = function(e) {
                        const t = sxDecodeBase64Url(e), n = new DataView(t.buffer, t.byteOffset, t.byteLength);
                        if (t.length < 9 || 83 !== t[0] || 88 !== t[1] || 1 !== t[2]) throw new Error("This is not a readable Sexcapades share link.");
                        if (n.getUint32(3) !== yu) throw new Error("This share link uses a different topic-map version.");
                        const i = t[7], a = t[8], r = 9 + i;
                        if (r + 3 * a !== t.length) throw new Error("This share link is incomplete.");
                        const o = {}, s = {}, l = {}, c = {};
                        for (let e = 0; e < a; e++) {
                            const n = r + 3 * e, i = t[n], a = t[n + 1], d = t[n + 2], u = fu[i];
                            if (!u) throw new Error("This share link uses an unknown topic.");
                            const p = sxRatingFromSlot(a >> 4), h = sxRatingFromSlot(15 & a), g = {};
                            null !== p && (g.give = p), null !== h && (g.receive = h), Object.keys(g).length && (o[u] = g), 
                            1 & d ? s[u] = "favorite" : 2 & d ? s[u] = "limit" : 16 & d && (s[u] = "notinterested"), 
                            4 & d && (l[u] = !0), 8 & d && (c[u] = !0);
                        }
                        return {
                            app: "sexcapades",
                            version: 16,
                            profileName: (new TextDecoder).decode(t.slice(9, r)).trim() || "Shared hypermap",
                            ratings: o,
                            annotations: s,
                            fantasyOnly: l,
                            alreadyTried: c,
                            notes: {},
                            importedChildren: {}
                        };
                    }(String(t || "")); else {
                        if ("profile" !== n && "shared" !== n) throw new Error(`Unsupported profile source: ${e}`);
                        i = t;
                    }
                }
                // HARD CONSTRAINT (sharing-sync refactor F7): a
                // share-link import maps to "profile" here ON
                // PURPOSE. The "profile" merge branch (rk) does NOT
                // autoSelect, so opening someone's share link adds
                // their profile WITHOUT joining it to the receiver's
                // collection/selection - unlike the "shared" branch,
                // which auto-selects (the 2026-10-25 scan-or-import
                // fix). Do not "clean up" this mapping to "shared":
                // that would silently change join behavior. Pinned
                // by harness case 3 in the sharing-sync verdict.
                return this.validate([ "kinktest", "checklist", "yesnomaybe", "fetlife", "bdsmtest" ].includes(n) ? "converter" : "profile" === n || "share-link" === n ? "profile" : "shared", i);
            },
            validate(e, t) {
                if ("converter" === e) {
                    if (!t || "object" != typeof t || !t.ratings || "object" != typeof t.ratings) throw new Error("Those results could not be converted into a profile.");
                    return [ "annotations", "fantasyOnly", "alreadyTried", "neutralNodes", "discreteNodes", "notes", "children" ].forEach(e => {
                        if (void 0 !== t[e] && (null === t[e] || "object" != typeof t[e] || Array.isArray(t[e]))) throw new Error("Those converted results are incomplete.");
                    }), t;
                }
                if ("compact" === e) {
                    if (!t || "sexcapades" !== t.a || 7 !== t.v || !Array.isArray(t.r)) throw new Error("The compact profile data is not valid.");
                    return t;
                }
                if ("shared" === e && t && "sexcapades-share" === t.app) {
                    if (1 !== t.version || !Array.isArray(t.profiles) || !t.profiles.length) throw new Error("This Sexcapades share bundle is incomplete.");
                    return t.profiles = t.profiles.map(e => this.validate("profile", e)), t;
                }
                if (sxRewriteLegacySlugs(t), !sxIsProfilePayload(t)) throw new Error("This is not a valid current Sexcapades profile.");
                if (!("string" == typeof t.profileName ? t.profileName : "").trim()) throw new Error("This profile file does not include a profile name.");
                sxCheckSkinCompatibility(t);
                return t;
            },
            merge(e, t, n = {}) {
                const sxKind = SX_MERGE_KINDS.has(e) ? e : "profile";
                return "converter" === sxKind ? function(e, t = {}) {
                    if (sxClearStatusToast(), !e) throw new Error("No converted profile data is ready to merge.");
                    const n = t.target || zk, i = t.type || Gk;
                    // Merge target (load-target stage, firm spec
                    // reaffirmed 2026-10-27 08:49): an explicit target
                    // - the profile the converter was pressed from, or
                    // the one the user picked in the chooser - wins.
                    // The session target zk is the only other source,
                    // and Ax now sets zk ONLY from a recorded target,
                    // never from whoever is on screen. With no recorded
                    // target and no explicit choice, n is empty and
                    // the merge REFUSES with the visible message below:
                    // no silent fallback, ever, and the converter never
                    // creates a profile. That same message is the
                    // nobody-on-screen edge (no target was chosen and
                    // nobody is on screen to load into). A pair/group
                    // target is blocked outright: a pair's numbers are
                    // computed from its source profiles, so converted
                    // results are never written directly into a pair.
                    if (!n || !vt[n]) return void (Pk.textContent = "No profile is on screen to load these results into, and no target was chosen, so nothing was loaded. Open a profile first, then try again.");
                    if (ft[n] && "group" === ft[n].kind) return void (Pk.textContent = `${wt[n] || "That profile"} is a pair/group profile, and test results can't be loaded directly into a pair — its numbers are computed from its source profiles. Pick one of the pair's own profiles instead. Nothing was loaded.`);
                    const a = {};
                    at[n] || (at[n] = {}), Object.values(e.children || {}).forEach(e => {
                        const t = sxCreateImportedTopic(at[n], e.label, e.parentId);
                        t && (Ke.add(t.id), a[t.id] = t);
                    });
                    const r = {}, o = new Set;
                    Object.keys(e.discreteNodes || {}).forEach(e => {
                        const t = vt[n][e];
                        t && "object" == typeof t && ([ "give", "receive" ].forEach(a => {
                            sxFlankSource(n, e, a) === `test:${i}` && (delete t[a], Ze[n]?.[e] && delete Ze[n][e][a]);
                        }), Object.keys(t).length || delete vt[n][e], Ze[n]?.[e] && !Object.keys(Ze[n][e]).length && delete Ze[n][e]);
                    });
                    // Fix 1, item 3: ratings go through
                    // applyProfileRatings - the same rules as the main
                    // import path (shape, clamp, unknown skip,
                    // unreadable rejection) - merging per flank with
                    // test: provenance and the documented manual-flip
                    // guard. The discrete-node clearing above stays
                    // converter-specific.
                    const sxAppliedRatings = applyProfileRatings(n, e.ratings || {}, { source: () => `test:${i}`, mergeFlanks: !0, guardManualFlip: !0 });
                    Object.assign(r, sxAppliedRatings.changed);
                    sxAppliedRatings.flipped.forEach(id => o.add(id));
                    o.forEach(id => { delete Qe[n][id]; });
                    Object.keys(e.neutralNodes || {}).forEach(e => {
                        delete Qe[n][e];
                    });
                    // Importer rework Part A (R1 STRICT): section ingestion
                    // for ALL FIVE converter feeds (annotations / fantasyOnly
                    // / alreadyTried / notes) now goes through the ONE shared
                    // ingestProfileSections helper - the same helper the
                    // profile-file import path uses - instead of the direct
                    // writes that used to live here. Converter merge
                    // semantics are preserved as the helper's named options:
                    // notes MERGE with the target profile's existing notes
                    // (mergeNotes = true); the flipped-mark / neutral-node
                    // clearing above and the discrete-node clearing earlier
                    // stay converter-specific and run first, as before.
                    // Unknown keys, illegal annotation values, and notes
                    // past the 16-per-topic cap are dropped WITH RECORD:
                    // collected here, stored on the profile's dropped-key
                    // records, named in the import-result dialog, and
                    // written to the error log - never silently swallowed.
                    const sxConvDropped = [];
                    const sxConvNoteDropped = (key, section, value, kindOverride) => {
                        if ("string" != typeof key || !key || isCatId(key) || isSubId(key)) return;
                        if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, key)) return void sxConvDropped.push(importRetiredRecord(key, section, value));
                        const rec = {
                            key: key,
                            section: section,
                            value: value,
                            kind: kindOverride || (/^t\d{4}$/.test(key) ? "retired" : "unrecognized")
                        };
                        const guessed = importDroppedGuess(key);
                        "string" == typeof guessed && guessed && (rec.label = guessed), sxConvDropped.push(rec);
                    };
                    ingestProfileSections(n, e, sxConvNoteDropped, !0);
                    sxConvDropped.length && (droppedKeyRecords[n] = (droppedKeyRecords[n] || []).concat(sxConvDropped), sxConvDropped.forEach(rec => {
                        try {
                            __sxErrLog("converter-drop", new Error(`${i}: dropped ${rec.section} key ${rec.key}`));
                        } catch (e) {}
                    }));
                    const s = "kinktest" === i ? "KinkTest.co.uk" : "checklist" === i ? "the Yes / No / Maybe checklist" : "bdsmtest" === i ? "BDSMtest.org" : "the copied FetLife profile", l = wt[n], c = ("kinktest" === i || "checklist" === i) && Boolean(Zk), d = c ? sxElapsedTestSeconds() : 0, u = "kinktest" === i ? ix.length : "checklist" === i ? ax.length : 0, p = c ? Object.values(Xk).filter(e => e.answer).length : 0;
                    const sxHits = Array.isArray(e.categoryHits) ? [ ...new Set(e.categoryHits.filter(e => "string" == typeof e && (isCatId(e) || isSubId(e)))) ] : [];
                    c && sxRecordTimer(n, i, d, p, u), gt[n] || (gt[n] = {}), gt[n][i] = {
                        input: $k.value,
                        answers: Object.assign({}, Xk),
                        fetLifeSource: Vk,
                        fetLifeDisplay: Yk,
                        savedAt: (new Date).toISOString(),
                        categoryHits: sxHits
                    }, sampleProfileFlags[n] = !1, sxTouchProfile(n), sxMergeSaveNow(n), sxClearTestTicker(), sxCloseModalDialog(vk), sxLandProfileOnMap(n, {
                        ratings: r,
                        annotations: e.annotations,
                        notes: e.notes || {},
                        children: a
                    }), xg.textContent = `Loaded matches from ${s} into ${l}.${c ? ` Completed in ${sxClockText(d)}; time saved with the profile.` : ""}`;
                    // Post-merge landing (load-target stage): the
                    // merged-into profile is ACTIVATED and added to
                    // the multi-select set; the comparison overlay
                    // is not opened by a load.
                    sxSel(n), sxSel(null, "dismiss"), n !== Mt && sxLoadProfileMap(n), sxRenderProfileTabs();
                    const sxApplied = Boolean(Object.keys(e.ratings || {}).length || Object.keys(e.annotations || {}).length || Object.keys(e.fantasyOnly || {}).length || Object.keys(e.alreadyTried || {}).length || Object.keys(e.notes || {}).length || Object.keys(e.children || {}).length || Object.keys(e.neutralNodes || {}).length || Object.keys(e.discreteNodes || {}).length || sxHits.length);
                    const sxUnmatched = "fetlife" === i && Array.isArray(e.unmappedFetishes) ? e.unmappedFetishes : [], sxNotApplied = "fetlife" === i && Array.isArray(e.notApplied) ? e.notApplied : [];
                    (sxUnmatched.length || sxNotApplied.length || sxConvDropped.length) && showConverterResultDialog(l, Object.keys(e.ratings || {}).length, sxUnmatched, sxNotApplied, sxConvDropped, s);
                    "fetlife" === i && (sxOutlineSortMode = "interest"), (sxApplied || "fetlife" === i) && (sxApplied && (window.__sxOnDeck = !0), sxHits.length && (window.__sxCategoryHits = sxHits, window.__sxOutlineHits = new Set(sxHits)), (() => {
                        try {
                            Do.open || /#\/?(app\/)?(?:list|listview)\/?$/i.test(String(location.hash || "")) ? sxOpenHotList(n) : location.hash = "#app/listview";
                        } catch (e) { __sxErrLog("listview-open", e); }
                    })()), sxHits.length && "fetlife" === i && window.setTimeout(() => {
                        try {
                            const rd = document.getElementById("importResultDialog");
                            if (rd && rd.open) {
                                const iv = window.setInterval(() => {
                                    if (!rd.open) {
                                        window.clearInterval(iv);
                                        try { showFetLifeBroadSummary(e); } catch (err) { __sxErrLog("listview-open", err); }
                                    }
                                }, 300);
                            } else showFetLifeBroadSummary(e);
                        } catch (e) { __sxErrLog("listview-open", e); }
                    }, 450);
                    return n;
                }(this.validate("converter", t), n) : "shared" === sxKind ? function(e, sxOpts = {}) {
                    const t = an && sxListLiveSelections().length >= 2, n = t ? sxListLiveSelections() : [];
                    if (e && "sexcapades-share" === e.app && 1 === e.version && Array.isArray(e.profiles) && e.profiles.length) {
                        const i = e.profiles.map(e => yx.merge("profile", e, Object.assign({}, sxOpts, {
                            quiet: !0,
                            comparisonIds: n,
                            comparisonActive: t
                        })));
                        return sxSel(null, "clear"), i.length > 1 && i.forEach(e => {
                            vt[e] && (sxSel(e), sxProfileColor(e));
                        }), sxCloseModalDialog(Sg), sxSel(null, "dismiss"), sxRenderProfileTabs(), sxActivateProfile(i[i.length - 1]), i[i.length - 1];
                    }
                    // F5: the caller's options ride along under the
                    // branch's own keys - comparison state comes from
                    // the live selection, and autoSelect stays
                    // hard-coded last (the scan-import fix) so the
                    // single-profile fallthrough keeps auto-selecting
                    // exactly as before and the two never fight.
                    return yx.merge("profile", e, Object.assign({}, sxOpts, {
                        comparisonIds: n,
                        comparisonActive: t,
                        mergeIntoGroup: sxPairLoadInto && ft[sxPairLoadInto] && "group" === ft[sxPairLoadInto].kind ? sxPairLoadInto : null,
                        autoSelect: !0
                    }));
                }(this.validate("shared", t), n) : sxIngestProfileFile(this.validate("profile", t), n);
            },
            serialize(e, t = {}) {
                if (!SX_SERIALIZE_KINDS.has(e)) throw new Error(`Unsupported profile export: ${e}`);
                let n;
                const personId = t.person || Mt || (window.Sexcapades2xProfiles ? window.Sexcapades2xProfiles.getIds()[0] : null);
                if ("profile" === e) n = sxBuildProfileRecord(personId); else if ("viewport" === e) n = sxSerializeProfileOut(personId, t.visibleIds, t.displayName || ""); else if ("export" === e) n = sxShareProfileSubset(personId, t.visibleIds, Boolean(t.includeProfileInfo), t.displayName || "", Boolean(t.blind)); else if ("sync-card" === e) n = serializeSyncCard(personId, t.visibleIds, t.displayName || "", Boolean(t.includeProfileInfo), Boolean(t.blind)); else {
                    if ("compact" === e) return this.validate("compact", function(e, t = sxRatedNodeSet(e), n = !0, i = !1, strip = !1) {
                        const keepId = n && !strip;
                        const a = e => !t || t.has(e), r = sxNormalizeContactRecord(ut[e]), o = Object.values(at[e] || {}).filter(e => a(e.id)), s = new Map(o.map((e, t) => [ e.id, t ])), l = e => hu.has(e) ? hu.get(e) : cu.length + s.get(e), c = e => Number.isFinite(Number(e)) ? Math.round(Number(e)) : null, d = Object.entries(vt[e] || {}).filter(([e, t]) => !isCatId(e) && a(e) && t && Number.isInteger(l(e)) && (Number.isFinite(Number(t.give)) || Number.isFinite(Number(t.receive)))).map(([e, t]) => [ l(e), c(t.give), c(t.receive) ]), u = Object.entries(Qe[e] || {}).filter(([e]) => a(e) && Number.isInteger(l(e))).map(([e, t]) => [ l(e), "favorite" === t ? 1 : "notinterested" === t ? 3 : 2 ]), p = Object.keys(Je[e] || {}).filter(e => a(e) && Number.isInteger(l(e))).map(e => l(e)), h = Object.keys(et[e] || {}).filter(e => a(e) && Number.isInteger(l(e))).map(e => l(e)), g = keepId ? Object.entries(tt[e] || {}).filter(([e]) => a(e) && Number.isInteger(l(e))).map(([e, t]) => [ l(e), Array.isArray(t) ? t.join(" ") : String(t || "") ]).filter(e => e[1]) : [], m = o.map(e => [ e.label, hu.get(e.parentId) ]).filter(e => Number.isInteger(e[1])), f = sxNormalizeGenders(rt[e]), j = String(pz[e] || ""), y = sxNormalizeOrientations(ot[e]), b = sxNormalizeRoles(st[e]), v = sxNormalizeAgeText(lt[e]), w = sxNormalizeLocationText(ct[e]), k = String(nt[e] || ""), x = String(it[e] || ""), S = {
                            a: "sexcapades",
                            v: 7,
                            n: n ? wt[e] || "Profile" : "Shared profile",
                            r: d
                        };
                        // Sync card (strip, not blind): the bio and terms ride truncated
                        // to the card budget (2026-11-17, ruled 3:1, v18, ~1300 combined:
                        // bio 975, terms 325). A blind card stays anonymous - no bio or
                        // terms. Everything else stays stripped.
                        i && (S.k = 1), keepId && f.length && (S.g = f), keepId && j && (S.p = j), keepId && y.length && (S.s = y), keepId && b.length && (S.w = b), 
                        keepId && v && (S.y = v), keepId && w && (S.l = w), keepId && sxCountFilledContacts(r) && (S.c = r), keepId && k && (S.b = k), 
                        keepId && x && (S.u = x), strip && !i && k && (S.b = k.slice(0, 975)), strip && !i && x && (S.u = x.slice(0, 325)), keepId && (S.e = sxClampVeilLevel(vpt[e]), vht[e] && (S.f = 1), S.j = sxClampVeilLevel(vpt[e]), vht[e] && (S.z = 1)), m.length && (S.d = m), 
                        u.length && (S.m = u), p.length && (S.h = p), h.length && (S.i = h), g.length && (S.t = g);
                        const $ = keepId ? sxNormalizeTimers(mt[e]) : {};
                        return Object.keys($).length && (S.q = $), S;
                    }(t.person, t.allowedIds, !1 !== t.includeProfileInfo, Boolean(t.blind), Boolean(t.stripIdentity)));
                    if ("bundle" === e) n = function(e, t, n = {}) {
                        return sxShareEnvelope(e, t.map(e => sxBuildProfileRecord(e)), n);
                    }(t.bundleKind, t.ids || [], t.extra || {}); else {
                        if ("envelope" !== e) throw new Error(`Unsupported profile export: ${e}`);
                        n = sxShareEnvelope(t.bundleKind, t.profiles || [], t.extra || {});
                    }
                }
                return this.validate("bundle" === e || "envelope" === e ? "shared" : "profile", n);
            },
            errorMessage: (e, t = "Profile import failed.") => (e && "string" == typeof e.message ? e.message.trim() : "") || t
        });
        // DECISION (sharing-sync refactor F5): sync cards NEVER
        // carry photos. serializeSyncCard is the one place that
        // rule lives: it serializes exactly like an export (Ju)
        // and then empties the photos array, because a printed
        // card is scanned back in public contexts where attached
        // photos must not travel. Do not duplicate Ju here, and
        // do not "fix" the empty photos array - it is the rule,
        // not a bug. Callers reach it via yx.serialize("sync-card")
        // or the vx wrapper below.
        function serializeSyncCard(e, t, n = "", i = !1, a = !1) {
            const r = sxShareProfileSubset(e, t, i, n, a);
            return r.photos = [], r;
        }
        function sxSerializeExportPayload(e, t, n = !1, i = "", a = !1) {
            return yx.serialize("export", {
                person: e,
                visibleIds: t,
                includeProfileInfo: n,
                displayName: i,
                blind: a
            });
        }
        function sxSerializeCardPayload(e, t, n = "", i = !1, a = !1) {
            return yx.serialize("sync-card", {
                person: e,
                visibleIds: t,
                displayName: n,
                includeProfileInfo: i,
                blind: a
            });
        }
        function sxMergeAsProfile(e, t = {}) {
            return yx.merge("profile", e, t);
        }
        function sxMergeAsShared(e, t = {}) {
            return yx.merge("shared", e, t);
        }
        function sxSwitchTestOrPaste(e) {
            const t = "kinktest" === Gk || "checklist" === Gk;
            Nk.hidden = !0, _k.hidden = !t, Dk.hidden = !t, _k.setAttribute("aria-pressed", String("test" === e)), 
            Dk.setAttribute("aria-pressed", String("paste" === e)), Rk.hidden = "test" !== e, 
            Ek.hidden = "paste" !== e, Ak.hidden = "paste" !== e, "test" === e ? (sxRenderTestQuestions(), sxArmTestTicker()) : requestAnimationFrame(() => $k.focus());
        }
        function sxChoiceButtonMarkup(e, t, n, i) {
            return `<button type="button" data-test-group="${n}" data-test-index="${i}" data-test-value="${t}" aria-pressed="false">${e}</button>`;
        }
        function sxRenderTestQuestions() {
            Xk = Object.assign({}, Xk || {}), Kk = null, Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", 
            e.byId("previewTestAnswers").hidden = !1, "kinktest" === Gk ? (Hk.hidden = !0, 
            jk.textContent = "KinkTest · 71 activities", n(qk, 'Uses KinkTest.co.uk’s four-point scale: 1 never, 2 not my thing, 3 enjoy, 4 really enjoy or really want to try. The 71 activities run across 8 pages — answer every question on a page to unlock the next. Questions sourced from <a href="https://kinktest.co.uk/survey" target="_blank" rel="noopener noreferrer">KinkTest.co.uk</a>.'), 
            ktPage = 0, ktRender()) : (Hk.hidden = !0, jk.textContent = "Yes / No / Maybe activities", n(qk, 'Rate each item 0&ndash;5: <b>0</b> is a hard no, <b>5</b> is an enthusiastic yes. Each answer applies to both give and receive, scaled across the slider gradient (0 red &rarr; 5 green). Add optional notes per item &mdash; they import as that topic\u2019s notes. Based on the classic Yes / No / Maybe checklist.'), 
            n(Ok, (() => { let h = "", q = ""; ax.forEach((e, t) => { const c = axCat[e] || "Yes / No / Maybe"; c !== q && (q = c, h += `<h4 class="test-cat-head">${sxEscapeHtmlText(c)}</h4>`); h += `<article class="test-question ynm-q"><div class="test-question-text">${sxEscapeHtmlText(e)}</div><div class="test-answer-groups"><div class="test-choice-group ynm-scale" role="group" aria-label="Rate ${sxEscapeHtmlText(e)} from 0 to 5">${sxChoiceButtonMarkup("0", "0", "answer", t)}${sxChoiceButtonMarkup("1", "1", "answer", t)}${sxChoiceButtonMarkup("2", "2", "answer", t)}${sxChoiceButtonMarkup("3", "3", "answer", t)}${sxChoiceButtonMarkup("4", "4", "answer", t)}${sxChoiceButtonMarkup("5", "5", "answer", t)}</div></div><input type="text" class="test-note-input" data-test-note="${t}" placeholder="Notes for this item (optional)" aria-label="Notes for ${sxEscapeHtmlText(e)}"></article>`; }); return h; })())),
            Object.entries(Xk).forEach(([e, t]) => { if (!t) return; if (t.answer) { const n = Ok.querySelector(`[data-test-index="${e}"][data-test-value="${t.answer}"]`); n && n.setAttribute("aria-pressed", "true"); } if (t.note) { const i = Ok.querySelector(`[data-test-note="${e}"]`); i && (i.value = t.note); } }), sxWriteTestProgress();
        }
        function sxWriteTestProgress() {
            const e = "kinktest" === Gk ? ix.length : ax.length, t = Object.values(Xk).filter(e => e.answer).length;
            Bk.textContent = `${sxClockText(sxElapsedTestSeconds())} elapsed · ${t} of ${e} answered`;
            ktPagerState();
        }
        function sxOpenResultConverter(t, i = "auto", sxTargetId) {
            // No silent fallback (firm spec, owner ruling 2026-10-27
            // 02:47, reaffirmed 08:49; the 08:02 reversal is withdrawn):
            // a converter invoked with no recorded target gets NO
            // session target - zk stays null, the title stays neutral,
            // and nothing is prefilled from whoever happens to be on
            // screen. The active profile is never quietly used as the
            // target. sxConverterOrigin likewise keeps ONLY a recorded
            // (pressed-from) target. An explicit choice in the
            // generic-entry chooser is the only way a no-origin session
            // acquires a target, and the merge itself refuses with a
            // visible error if it is ever reached with no target at
            // all. If no profile is on screen at all, zk stays null
            // for the same reason: the merge/Load paths show a message
            // instead of ever creating a profile.
            sxClearTestTicker(), Gk = t, Kk = null, zk = sxTargetId && vt[sxTargetId] ? sxTargetId : null, sxConverterOrigin = sxTargetId && vt[sxTargetId] ? sxTargetId : null, sxFlFields = null;
            const a = function(e, t) {
                return gt[e] && gt[e][t] || null;
            }(zk, t);
            Vk = a?.fetLifeSource ?? null, Yk = a?.fetLifeDisplay ?? null, Xk = a && a.answers && "object" == typeof a.answers ? Object.assign({}, a.answers) : {}, 
            Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", $k.value = a && "string" == typeof a.input ? a.input : "", 
            Tk.hidden = "fetlife" !== t, e.byId("fetlifeGuide") && (e.byId("fetlifeGuide").hidden = "fetlife" !== t), Sk.textContent = "Paste results", vk.classList.toggle("checklist-layout", "checklist" === t), 
            Uk.textContent = "checklist" === t ? "Preview results" : "Preview matches";
            const r = zk ? wt[zk] || "this profile" : null;
            Lk.textContent = "Load into a profile", "kinktest" === t ? (wk.textContent = r ? `Load KinkTest.co.uk results into ${r}` : "Load KinkTest.co.uk results", 
            kk.textContent = "Answer all or part of KinkTest’s 71-activity survey here.", n(xk, 'Choose 1–4 for each activity, then preview the direct topic and give/receive mappings before loading. New answers update values previously loaded from a test. KinkTest’s 1 · Never maps directly to <b>Hard Limit</b>, 2 · Not my thing maps to <b>Not Interested</b>, and 3–4 remain positive slider ratings. A manual slider rating changes only when the test moves it to a different camp; everything else stays unchanged. <a href="https://kinktest.co.uk/survey" target="_blank" rel="noopener noreferrer">KinkTest survey</a>')) : "checklist" === t ? (wk.textContent = r ? `Load Yes / No / Maybe into ${r}` : "Load Yes / No / Maybe results", 
            kk.textContent = "Paste completed results, or answer the checklist below.", n(xk, "Paste one answer per line as <b>Item: 3</b> (0&ndash;5; Yes/Maybe/No also work). Or answer the complete checklist below and tap <b>Preview answers</b> to preview the mappings. Answers scale across the slider gradient on both give and receive: 0 is red, 5 is green. Names under <b>Limits:</b> map directly to <b>Hard Limit</b>. The labels Favorite, Neutral, Fantasy Only, and Already Tried are also recognized when included in a pasted result. New answers update values previously loaded from a test; everything else stays unchanged.")) : "bdsmtest" === t ? (wk.textContent = r ? `Load BDSMtest.org results into ${r}` : "Load BDSMtest.org results", 
            kk.textContent = "Paste the role scores from the results page.", Sk.textContent = "Paste the BDSMtest result list", 
            n(xk, "Copy the result lines that look like <b>100% Dominant</b>, paste them below, then preview the mappings. Positive percentages remain slider affinity values; an exact 0% maps directly to <b>Neutral</b>. Each role maps to give, receive, or both; missing roles stay unrated. This loader never creates negative ratings or Limits. New scores update values previously loaded from a test; everything else stays unchanged.")) : (wk.textContent = r ? `Load FetLife fetishes into ${r}` : "Load FetLife fetishes", 
            kk.textContent = "Build a hypermap from a profile’s Fetishes section without sharing your FetLife password.", 
            n(xk, 'Choose the saved page file below, or paste its HTML into the box — then preview the matches. <b>Load example</b> loads a sample saved page so you can see the whole flow first. Full detail: <b>How FetLife import works</b>, just below.')), 
            sxCloseModalDialog(kg), sxOpenModalDialog(vk), "kinktest" !== t && "checklist" !== t || "test" !== i ? "kinktest" !== t && "checklist" !== t || "paste" !== i ? "kinktest" === t ? sxSwitchTestOrPaste("test") : "checklist" === t ? (Nk.hidden = !1, 
            Ek.hidden = !1, Ak.hidden = !1, Rk.hidden = !1, sxRenderTestQuestions(), sxArmTestTicker(), requestAnimationFrame(() => $k.focus())) : (Nk.hidden = !0, 
            Ek.hidden = !1, Ak.hidden = !1, Rk.hidden = !0, requestAnimationFrame(() => $k.focus())) : sxSwitchTestOrPaste("paste") : sxSwitchTestOrPaste("test"), 
            a && requestAnimationFrame(() => {
                ("kinktest" === t || "checklist" === t) && Object.keys(Xk).length ? e.byId("previewTestAnswers").click() : "kinktest" !== t && "checklist" !== t && $k.value.trim() && Uk.click();
            });
        }
        function sxRenderMatchPreview(e) {
            Kk = e, window.__sxUnmappedShare = "fetlife" === Gk ? (() => {
                const sxShare = [ ...(Array.isArray(Kk.unmappedFetishes) ? Kk.unmappedFetishes : []), ...(Array.isArray(Kk.suggestions) ? Kk.suggestions : []).map(s => ({
                    fetish_name: s.name,
                    list_type: "curious" === s.section ? "curious" : "into",
                    suggestion: !0,
                    parent_path: s.parentPath
                })) ];
                return sxShare.length ? sxShare : null;
            })() : null;
            const t = Object.keys(Kk.ratings).length, sxBranchRated = Object.keys(Kk.ratings).filter(e => isCatId(e) || isSubId(e)).length, sxTopicRated = t - sxBranchRated, sxSugCount = (Kk.suggestions || []).length, i = Object.keys(Kk.annotations || {}).length, a = new Set([ ...Object.keys(Kk.fantasyOnly || {}), ...Object.keys(Kk.alreadyTried || {}), ...Object.keys(Kk.neutralNodes || {}) ]).size, r = Object.keys(Kk.notes || {}).length, o = Object.keys(Kk.children || {}).length;
            Mk.textContent = `Matched ${Kk.mappedLines} of ${Kk.totalLines} result lines · ${sxTopicRated} slider-rated topics · ${sxBranchRated} slider-rated branches · ${i + a} discrete labels${sxSugCount ? ` · ${sxSugCount} suggested new ${1 === sxSugCount ? "topic" : "topics"}` : ""}${o ? ` · ${o} specific child ${1 === o ? "node" : "nodes"}` : ""}${r ? ` · ${r} with imported notes` : ""}`;
            const s = [], vaMsg = (Kk.warnings || []).find(e => /^We found “View all” links/.test(e));
            vaMsg && s.push({
                kind: "viewall",
                text: vaMsg
            }), (Kk.previewNotes || []).forEach(e => s.push({
                kind: "note",
                text: e
            })), (Kk.warnings || []).forEach(e => e !== vaMsg && s.push({
                kind: "unmatched",
                text: e
            })), (Kk.mappings || []).forEach(e => {
                const t = "string" == typeof e ? {
                    text: e,
                    tertiary: !1
                } : e;
                s.push({
                    kind: t.tertiary ? "tertiary" : "match",
                    text: t.text
                });
            }), (Kk.suggestions || []).forEach(e => {
                s.push({
                    kind: "suggestion",
                    text: `${e.name} — suggested under ${e.parentPath}`
                });
            }), Kk.bestFit.length && s.push({
                kind: "note",
                text: `${Kk.bestFit.length} best-fit mapping${1 === Kk.bestFit.length ? "" : "s"}: ${Kk.bestFit.slice(0, 6).join(" ")}`
            }), n(Ik, s.map(e => `<li class="preview-${e.kind}">${sxEscapeHtmlText(e.text)}</li>`).join("")), 
            Ck.hidden = !1, Lk.disabled = 0 === t && 0 === i && 0 === a && 0 === r, Pk.textContent = Lk.disabled ? "Nothing matched. Check the expected format above." : "";
        }
        function sxRunConverterPreview() {
            try {
                if (zk && !vt[zk]) return void (Pk.textContent = "The profile these results were opened for is no longer available.");
                const e = "fetlife" === Gk && null !== Vk && $k.value === Yk ? Vk : $k.value;
                if ("fetlife" === Gk && !sxFlFields) sxFlFields = sxScrapeFetLifeProfile(e);
                sxRenderMatchPreview(yx.parse(Gk, e));
            } catch (t) {
                try {
                    Pk.textContent = "Preview failed: " + (t && t.message || t);
                } catch (e) { __sxErrLog("preview-label", e); }
            }
        }
        function sxRatingCampText(e) {
            return e > 35 ? "for" : e >= 0 ? "curious" : "against";
        }
        function sxCloseResultConverter() {
            sxClearTestTicker(), sxCloseModalDialog(vk);
        }
        async function sxInflatePngProfile(e) {
            if ("DecompressionStream" in window) try {
                const t = new Blob([ e ]).stream().pipeThrough(new DecompressionStream("deflate"));
                return new Uint8Array(await new Response(t).arrayBuffer());
            } catch (e) { __sxErrLog("app", e); }
            return function(e) {
                if (e.length < 6 || (e[0] << 8 | e[1]) % 31 != 0 || 8 != (15 & e[0]) || 32 & e[1]) throw new Error("The PNG profile data is not readable.");
                let t = 2, n = [], i = 0, a = !1;
                for (;!a; ) {
                    if (t + 5 > e.length - 4) throw new Error("The PNG profile data is incomplete.");
                    const r = e[t++];
                    if (a = Boolean(1 & r), r >>> 1 & 3) throw new Error("The PNG profile data needs a newer browser.");
                    const o = e[t] | e[t + 1] << 8, s = e[t + 2] | e[t + 3] << 8;
                    if (t += 4, 65535 & (o ^ ~s) || t + o > e.length - 4) throw new Error("The PNG profile data is incomplete.");
                    const l = e.slice(t, t + o);
                    n.push(l), i += l.length, t += o;
                }
                const r = new Uint8Array(i);
                let o = 0;
                n.forEach(e => {
                    r.set(e, o), o += e.length;
                });
                // Rank 5: the zlib stream ends in an Adler-32 checksum
                // over the decompressed bytes - the integrity check the
                // format already carries. The old code reserved those
                // four bytes in its bounds checks but never compared
                // them, so a stream with a damaged checksum could still
                // inflate here after DecompressionStream refused it.
                let sxAdlerA = 1, sxAdlerB = 0;
                for (let sxK = 0; sxK < r.length; sxK++) sxAdlerA = (sxAdlerA + r[sxK]) % 65521, sxAdlerB = (sxAdlerB + sxAdlerA) % 65521;
                const sxAdlerWant = (e[e.length - 4] << 24 | e[e.length - 3] << 16 | e[e.length - 2] << 8 | e[e.length - 1]) >>> 0;
                if ((sxAdlerB << 16 | sxAdlerA) >>> 0 !== sxAdlerWant) throw new Error("The PNG profile data is damaged or incomplete.");
                return r;
            }(e);
        }
        function sxCloseContactDialog() {
            Tf && URL.revokeObjectURL(Tf), Tf = null, Fg.removeAttribute("href"), Fg.removeAttribute("download"), 
            Tg.replaceChildren(), Ng.textContent = "", sxCloseModalDialog(Lg);
        }
        function sxApplyImportedVcard(t, i) {
            const a = function(e) {
                const t = String(e || "").replace(/\r\n[ \t]/g, "").split(/\r?\n/), n = sxNormalizeContactRecord({}), i = Object.fromEntries(Object.entries(Kv).map(([e, t]) => [ t, e ]));
                let a = "";
                return t.forEach(e => {
                    const t = e.indexOf(":");
                    if (t < 1) return;
                    const r = e.slice(0, t).toUpperCase().split(";")[0], o = sxUnescapeVcardText(e.slice(t + 1).trim());
                    if ("FN" === r) a = o; else if (i[r]) n[i[r]] = o; else if ("TEL" === r) n.phone = o; else if ("EMAIL" === r) n.email = o; else if ("X-CUSTOM-SITE" === r) {
                        const e = o.split("~~~");
                        3 === e.length && n.customSites.push({
                            site: sxUnescapeVcardText(e[0]),
                            url: sxUnescapeVcardText(e[1]),
                            username: sxUnescapeVcardText(e[2])
                        });
                    } else if ("URL" === r) {
                        const e = _v.find(e => {
                            const t = sxBuildProfileSiteUrl(e, "").replace(/\/$/, "");
                            return t && o.toLowerCase().startsWith(t.toLowerCase());
                        });
                        e && (n[e] = o);
                    }
                }), {
                    name: a,
                    contact: sxNormalizeContactRecord(n)
                };
            }(t), r = a.contact;
            if (!i || !sxCountFilledContacts(r)) return;
            ut[i] = r, Tf && URL.revokeObjectURL(Tf), Tf = URL.createObjectURL(new Blob([ t ], {
                type: "text/vcard;charset=utf-8"
            }));
            const o = [], s = new Map;
            [ [ "telegram", "Telegram" ], [ "linktree", "linktr.ee" ], [ "fetlife", "FetLife" ], [ "chaturbate", "Chaturbate" ], [ "stripchat", "Stripchat" ], [ "myfreecams", "MyFreeCams" ], [ "pornhub", "PornHub" ], [ "xvideos", "XVideos" ], [ "xhamster", "xHamster" ], [ "onlyfans", "OnlyFans" ], [ "reddit", "Reddit" ], [ "x", "X" ] ].forEach(([e, t]) => {
                const n = r[e];
                if (!n) return;
                const i = n.toLowerCase();
                s.has(i) || s.set(i, {
                    sites: [],
                    user: n,
                    at: !1
                });
                const a = s.get(i);
                a.sites.push({
                    label: t,
                    href: sxBuildProfileSiteUrl(e, n)
                }), "telegram" === e && (a.at = !0);
            }), (r.customSites || []).forEach(e => {
                if (!e.username) return;
                const t = e.username.toLowerCase();
                s.has(t) || s.set(t, {
                    sites: [],
                    user: e.username,
                    at: !1
                }), s.get(t).sites.push({
                    label: e.site,
                    href: e.url
                });
            }), s.forEach(e => {
                const t = e.sites.map(e => `<a href="${sxEscapeHtmlText(e.href)}" target="_blank" rel="noopener noreferrer"><strong>${sxEscapeHtmlText(e.label)}</strong></a>`).join(", ");
                o.push(`<div class="imported-contact-row"><span>${t}</span><span>${sxEscapeHtmlText((e.at ? "@" : "") + e.user)}</span></div>`);
            }), r.phone && o.push(`<div class="imported-contact-row"><strong>Phone</strong><a href="${sxEscapeHtmlText("tel:" + r.phone.replace(/[^+\d]/g, ""))}" target="_blank" rel="noopener noreferrer">${sxEscapeHtmlText(r.phone)}</a></div>`), 
            r.email && o.push(`<div class="imported-contact-row"><strong>Email</strong><a href="${sxEscapeHtmlText("mailto:" + r.email)}" target="_blank" rel="noopener noreferrer">${sxEscapeHtmlText(r.email)}</a></div>`), 
            n(Tg, o.join("")), e.byId("importedContactTitle").textContent = `Contact info for ${a.name || wt[i] || "profile"}`, 
            Fg.href = Tf, Fg.download = `${String(a.name || wt[i] || "contact").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").trim() || "contact"}.vcf`, 
            Ng.textContent = "", sxOpenModalDialog(Lg);
        }
