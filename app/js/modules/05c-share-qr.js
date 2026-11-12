        // Share-link door (refactor item 3, ruled 2026-10-29): Nu is
        // called at boot AND from the hashchange handler, so a share
        // link pasted into a running app imports without a reload.
        // sxShareLinkToken is the last token this session handled:
        // the same token arriving twice for one stay on the #share=
        // hash (the boot call racing a hashchange, or a duplicate
        // hashchange) imports once, not twice. A call with any other
        // hash clears it, so leaving the share hash and pasting the
        // same link again imports again, exactly like a reload would.
        // The import itself is unchanged: wx with source "share-link"
        // still lands through the "profile" merge branch, which does
        // NOT auto-select or join the receiver's multiselect (F7).
        let sxShareLinkToken = "";
        async function Nu() {
            // Share-link receiving side (unified framework adaptation):
            // the token format is bounded (see
            // sxShareLinkMaxTokenLength), so a token longer than any
            // complete link this map can make is refused plainly, a
            // hash that starts #share= but matches no token is no
            // longer met with silence, and a truncated token fails
            // closed in the parse below with the alternative named.
            // This bundle has no share-link CREATION caller — the only
            // producer of this token format is the anonymous survey
            // token in wu(), whose flags stay stripped — so there is
            // no sending-side warning to route here; the framework is
            // fitted on the side that exists. The #share= → "profile"
            // mapping and its HARD CONSTRAINT below are untouched.
            const sxHash = String(location.hash || "");
            const e = sxHash.match(/^#share=([A-Za-z0-9_-]+)$/);
            if (!e) {
                if (sxHash.startsWith("#share=")) tS("That share link could not be opened: it looks cut off or damaged, so nothing was imported. Ask for the complete link, or use Export QR codes — the numbered QR sheet holds the complete profile.", {
                    tone: "error",
                    persistent: !0
                });
                return void (sxShareLinkToken = "");
            }
            if (e[1] === sxShareLinkToken) return;
            sxShareLinkToken = e[1];
            if (e[1].length > sxShareLinkMaxTokenLength()) return void tS(sxOversizeShareMessage(e[1].length), {
                tone: "error",
                persistent: !0
            });
            try {
                wx(yx.parse("share-link", e[1]), {
                    source: "share-link"
                });
            } catch (e) {
                const sxMsg = yx.errorMessage(e, "That share link could not be opened.");
                tS(sxMsg + (/incomplete|not a readable/i.test(sxMsg) ? " Ask for the complete link, or use Export QR codes — the numbered QR sheet holds the complete profile." : ""), {
                    tone: "error",
                    persistent: !0
                });
            }
        }
        const _u = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
        function Du(e) {
            const t = String(e || ""), n = [];
            for (let e = 0; e < t.length; e += 3) {
                const i = t.length - e;
                if (1 === i) throw new Error("Invalid Base45 data");
                const a = _u.indexOf(t[e]), r = _u.indexOf(t[e + 1]), o = i > 2 ? _u.indexOf(t[e + 2]) : -1;
                if (a < 0 || r < 0 || i > 2 && o < 0) throw new Error("Invalid Base45 data");
                const s = a + 45 * r + (i > 2 ? 2025 * o : 0);
                if (s > (i > 2 ? 65535 : 255)) throw new Error("Invalid Base45 data");
                i > 2 ? n.push(s >> 8, 255 & s) : n.push(s);
            }
            return new Uint8Array(n);
        }
        async function Ru(e, t = tu(e), n = !0, i = !1) {
            return async function(e) {
                const t = (new TextEncoder).encode(e);
                if ("function" != typeof CompressionStream) return "SCP2J:" + gu(t);
                const n = new Blob([ t ]).stream().pipeThrough(new CompressionStream("deflate"));
                return "SCP3:" + function(e) {
                    let t = "";
                    for (let n = 0; n < e.length; n += 2) if (n + 1 < e.length) {
                        const i = 256 * e[n] + e[n + 1];
                        t += _u[i % 45] + _u[Math.floor(i / 45) % 45] + _u[Math.floor(i / 2025)];
                    } else {
                        const i = e[n];
                        t += _u[i % 45] + _u[Math.floor(i / 45)];
                    }
                    return t;
                }(new Uint8Array(await new Response(n).arrayBuffer()));
            }(JSON.stringify(function(e, t = tu(e), n = !0, i = !1) {
                return yx.serialize("compact", {
                    person: e,
                    allowedIds: t,
                    includeProfileInfo: n,
                    blind: i
                });
            }(e, t, n, i)));
        }
        // ===== OVERSIZE UNIFIED FRAMEWORK (Rank 13, ruled 2026-10-30) =====
        // One common core for EVERY surface, plus per-surface
        // adaptations — not one rule for all surfaces. Common core:
        // never silently drop, truncate, enlarge, or shrink profile
        // data; every oversize event states, in user words, what is
        // missing and where to get the complete version. The
        // capacities below are the surfaces' existing physical
        // limits, named here and NOT changed by this framework: the
        // document page holds 2 scan codes, the Sync card tries 2
        // codes then 4, the QR sheet is unbounded, and a share-link
        // token is bounded by the format itself (see
        // sxShareLinkMaxTokenLength). The two image shrink-to-fit
        // paths (the attached-photo 400px cap in Xu, the map-raster
        // 6400px side cap) are NOT data callers and are deliberately
        // not routed here: shrinking an image loses only resolution,
        // never profile data. The picture paths are likewise not
        // QR-routed: ru() already re-reads every finished PNG and
        // compares its embedded payload byte-for-byte (Rank 5), and
        // the scan reassembly in Kx/Wx stays fail-closed — a partial
        // numbered set never claims success, and its progress message
        // already states how many pieces are still missing.
        // sxOversizeAlt: the one complete-version alternative every
        // surface names — the numbered QR sheet from Export QR codes,
        // which holds every piece.
        function sxOversizeAlt() {
            return "Export QR codes — the numbered QR sheet holds every piece.";
        }
        // Document (PDF) page: warn-and-refuse. The helpers below
        // return the exact wordings the document and its export dialog
        // already used, from one source, so the count and the
        // alternative can never drift apart.
        function sxOversizeDocumentNote(neededPieces) {
            return `This profile needs ${neededPieces} scan codes and this page holds 2. For codes that hold every piece, use Export QR codes and print the numbered QR sheet instead.`;
        }
        function sxOversizeDocumentDialog(neededPieces) {
            return `PDF complete, but it has no scan codes: this profile is too large for document scan codes (it needs ${neededPieces} and the page holds 2), so none are printed — partial codes could never be scanned back in. For scannable codes, use Export QR codes: the numbered QR sheet holds every piece.`;
        }
        // Sync card: try 2 codes, then 4, then throw. The throw states
        // the measured size of the data that would not fit and names
        // the alternative; it does NOT claim a 700-character piece
        // count — the card's fit check is QR version capacity at two
        // fixed sizes, a different unit from the document's
        // 700-character pieces, and a piece count here would read as
        // if the profile fit the 4-code layout when it does not. The
        // card callers (op/lp) surface it in the export dialog
        // instead of their generic failure text.
        function sxOversizeCardMessage(payloadLength) {
            return `This profile is too large for the reliable two-code or four-code Sync card layout: its scan-code data is ${payloadLength} characters long, too long for 2 codes at the large size or 4 codes at the small size. No partial card was made. ${sxOversizeAlt()}`;
        }
        // Share link: measured limit plus alternative. The limit is
        // derived from the format itself, not invented: a token is 9
        // header bytes, a name sliced to 40 code units (at most 3
        // UTF-8 bytes each), and 3 bytes per rated topic in fu, all
        // base64url-encoded with padding stripped. No complete link
        // this map version can make is longer than this; anything
        // longer cannot be complete, and anything cut short fails the
        // parse below, fail-closed, with the alternative named.
        function sxShareLinkMaxTokenLength() {
            const bytes = 9 + 40 * 3 + 3 * fu.length, groups = Math.ceil(bytes / 3);
            return groups * 4 - (3 - bytes % 3) % 3;
        }
        function sxOversizeShareMessage(tokenLength) {
            return `That share link is too long to be a complete Sexcapades link: it has ${tokenLength} characters and the longest complete link this map can make has ${sxShareLinkMaxTokenLength()}. Nothing was imported. Ask for the complete link, or use ${sxOversizeAlt()}`;
        }
        // CHUNKER (sharing-sync refactor F2): one splitter for the
        // SCP4 chunk format, replacing the two historical helpers
        // whose second argument meant opposite things. The option
        // is NAMED, never a bare number: { chunkSize } = max
        // characters per chunk (old Ou; a payload that fits comes
        // back as one UNPREFIXED string), { chunkCount } = the
        // exact number of chunks to emit (old Bu; always that many
        // SCP4-prefixed parts). The SCP4:<hash>:<i>:<n>:<slice>
        // wire format and the iu CRC32 hash are byte-identical to
        // both old paths, so existing codes stay readable.
        function chunkPayload(e, t = {}) {
            const n = String(e || ""), i = iu((new TextEncoder).encode(n)).toString(36).toUpperCase();
            // Splitter guardrails (unified framework core): an empty
            // payload has no pieces, and supplying BOTH chunkCount and
            // chunkSize is an error — count used to win silently and
            // size was ignored without complaint. No current caller
            // supplies both, so throwing here changes no live path;
            // it only refuses a contradictory instruction loudly.
            if (!n) throw new Error("chunkPayload: an empty payload has no pieces to split — nothing was encoded.");
            if (null != t.chunkCount && null != t.chunkSize) throw new Error("chunkPayload: chunkCount and chunkSize were both supplied — neither was applied. Supply exactly one, so no piece is silently sized by the wrong rule.");
            if (null != t.chunkCount && (!Number.isInteger(t.chunkCount) || t.chunkCount < 1)) throw new Error("chunkPayload: chunkCount must be a whole number of 1 or more.");
            if (null != t.chunkSize && (!Number.isInteger(t.chunkSize) || t.chunkSize < 1)) throw new Error("chunkPayload: chunkSize must be a whole number of 1 or more.");
            if (null != t.chunkCount) {
                const a = Math.ceil(n.length / t.chunkCount);
                return Array.from({
                    length: t.chunkCount
                }, (e, r) => `SCP4:${i}:${r + 1}:${t.chunkCount}:${n.slice(r * a, (r + 1) * a)}`);
            }
            const s = t.chunkSize || 700, a = Math.max(1, Math.ceil(n.length / s));
            return 1 === a ? [ n ] : Array.from({
                length: a
            }, (e, r) => `SCP4:${i}:${r + 1}:${a}:${n.slice(r * s, (r + 1) * s)}`);
        }
        function ju(e, t) {
            if (!window.QRCode || "function" != typeof QRCode.create) return !1;
            try {
                return e.forEach(e => QRCode.create(e, {
                    errorCorrectionLevel: "H",
                    version: t
                })), !0;
            } catch (e) {
                return !1;
            }
        }
        // QR SERVICE (sharing-sync refactor F1): the ONE QR encoder
        // for every path — sync cards, QR sheets, the overlap share,
        // and the PDF document path all encode through qrEncode.
        // One width policy (qrWidth: the requested width, with a 720px
        // rendering minimum for QR readability) and one return type: a promise for an ARRAY of
        // data-URL strings. Callers that need an <img> element wrap
        // the single result with zu (see qu below). Oversize
        // behavior is the UNIFIED FRAMEWORK (Rank 13, ruled
        // 2026-10-30): oversize "throw" (the default) rejects, which the
        // card/sheet callers rely on; oversize "split" (the PDF
        // document path only) retries as SCP4 chunks of 700 and
        // returns EVERY chunk code, or [] when the payload cannot
        // be split. (It used to return only the first two chunks and
        // silently drop the rest, so those codes could never be
        // reassembled; the document path now counts the codes it
        // gets back and warns plainly when they exceed the two the
        // page can hold — see apQrImages.) The framework block above
        // the CHUNKER states the common core and the per-surface
        // adaptations; the old open decision not to unify is closed
        // by that ruling.
        function qrWidth(e) {
            // Rendering minimum, not a data policy: QR images are
            // never rendered below 720px wide, so a code stays
            // scannable at the sizes it is drawn at. The payload is
            // never enlarged or shrunk by this — it only sets the
            // image size. (The overlap share requests 480 and is
            // rendered at this 720 minimum, as before.)
            return Math.max(720, Math.round(Number(e) || 1536));
        }
        async function qrEncode(e, t = {}) {
            if (!window.QRCode || "function" != typeof QRCode.toDataURL) throw new Error("The QR encoder did not load.");
            const n = {
                errorCorrectionLevel: t.errorCorrectionLevel || "H",
                version: t.version,
                margin: 6,
                width: qrWidth(t.width),
                color: {
                    dark: "#000000",
                    light: "#ffffff"
                }
            };
            if ("split" !== t.oversize) return [ await QRCode.toDataURL(e, n) ];
            try {
                return [ await QRCode.toDataURL(e, n) ];
            } catch (err) {
                const i = chunkPayload(e, {
                    chunkSize: 700
                });
                if (!i || i.length < 2) return [];
                const out = [];
                for (const part of i) out.push(await QRCode.toDataURL(part, n));
                return out;
            }
        }
        async function qu(e, t = 1536, n = {}) {
            // Element wrapper: single-code by default (reject-only),
            // and a caller-supplied oversize option passes through to
            // qrEncode, so a caller that needs splitting gets it
            // instead of a silent rejection. Width, version, and
            // error-correction pass through unchanged.
            return zu((await qrEncode(e, {
                width: t,
                version: n.version,
                errorCorrectionLevel: n.errorCorrectionLevel,
                oversize: n.oversize
            }))[0]);
        }
        function Hu(e, t) {
            const n = e => Vw[e] || e, i = {}, a = [];
            (e.d || []).forEach(e => {
                const r = n(t[Number(e[1])]), o = ii(i, e[0], r);
                a.push(o && o.id || "");
            });
            const r = e => {
                const i = Number(e);
                return i < t.length ? n(t[i]) : a[i - t.length];
            }, o = {};
            (e.r || []).forEach(e => {
                const t = r(e[0]);
                t && (o[t] = {
                    give: Number(e[1]),
                    receive: Number(e[2])
                });
            });
            const s = {};
            (e.m || []).forEach(e => {
                const t = r(e[0]);
                t && (s[t] = 1 === Number(e[1]) ? "favorite" : 3 === Number(e[1]) ? "notinterested" : "limit");
            });
            const l = {};
            (e.h || []).forEach(e => {
                const t = r(e);
                t && (l[t] = !0);
            });
            const c = {};
            (e.i || []).forEach(e => {
                const t = r(e);
                t && (c[t] = !0);
            });
            const d = {};
            return (e.t || []).forEach(e => {
                const t = r(e[0]);
                t && (d[t] = [ String(e[1] || "") ]);
            }), {
                app: "sexcapades",
                version: 17,
                profileName: e.n || "QR profile",
                blind: 1 === e.k,
                gender: e.g || "",
                pronouns: e.p || "",
                sexuality: e.s || [],
                roles: e.w || [],
                age: e.y || "",
                location: e.l || "",
                contact: e.c || {},
                aboutMe: e.b || "",
                termsOfService: e.u || "",
                veil: av(null != e.j ? e.j : e.e),
                veilEnabled: Boolean(null != e.z ? e.z : e.f),
                net: av(e.e),
                netEnabled: Boolean(e.f),
                completionTimes: St(e.q),
                ratings: o,
                annotations: s,
                fantasyOnly: l,
                alreadyTried: c,
                notes: d,
                importedChildren: i
            };
        }
        function Wu(e, t, n, i, a, r) {
            const o = Math.max(0, Math.min(r, i / 2, a / 2));
            e.moveTo(t + o, n), e.lineTo(t + i - o, n), e.quadraticCurveTo(t + i, n, t + i, n + o), 
            e.lineTo(t + i, n + a - o), e.quadraticCurveTo(t + i, n + a, t + i - o, n + a), 
            e.lineTo(t + o, n + a), e.quadraticCurveTo(t, n + a, t, n + a - o), e.lineTo(t, n + o), 
            e.quadraticCurveTo(t, n, t + o, n);
        }
        function Uu(e) {
            const t = Rv(ut[e] || {}), n = [];
            if ([ "telegram", "linktree", "fetlife", "chaturbate", "stripchat", "myfreecams", "pornhub", "xvideos", "xhamster", "onlyfans", "reddit", "x" ].forEach(e => {
                t[e] && n.push(t[e]);
            }), (t.customSites || []).forEach(e => {
                e && e.username && n.push(e.username);
            }), !n.length) return "";
            const i = {};
            n.forEach(e => {
                const t = String(e).toLowerCase();
                i[t] || (i[t] = {
                    user: e,
                    n: 0
                }), i[t].n++;
            });
            let a = null;
            return Object.values(i).forEach(e => {
                (!a || e.n > a.n) && (a = e);
            }), a && a.n > 1 ? a.user : t.fetlife ? t.fetlife : n[0];
        }
        function Gu(e, t, n, i, a, r, o) {
            const s = Math.max(4, .133 * i[0]), l = Math.max(10, Math.round(.234 * i[0]));
            i.forEach((i, l) => {
                const c = Math.max(0, Math.min(100, Number(a[l]) || 0));
                e.beginPath(), e.arc(t, n, i, 0, 2 * Math.PI), e.strokeStyle = function(e, t) {
                    const n = String(e || "").replace("#", ""), i = 3 === n.length ? n.split("").map(e => e + e).join("") : n, a = parseInt(i, 16);
                    return isNaN(a) ? `rgba(128,128,128,${t})` : `rgba(${a >> 16 & 255},${a >> 8 & 255},${255 & a},${t})`;
                }(r[l], o), e.lineWidth = s, e.stroke(), c > 0 && (e.beginPath(), c >= 99.5 ? e.arc(t, n, i, 0, 2 * Math.PI) : e.arc(t, n, i, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * c / 100), 
                e.strokeStyle = r[l], e.lineWidth = s, e.lineCap = "round", e.stroke());
            });
            const c = [ -Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6 ];
            e.save(), e.textAlign = "center", e.textBaseline = "middle", i.forEach((i, o) => {
                const s = Math.round(Math.max(0, Math.min(100, Number(a[o]) || 0))), d = c[o], u = i + 1.27 * l;
                e.fillStyle = r[o], e.font = "700 " + l + "px system-ui, sans-serif", e.fillText(s + "%", t + u * Math.cos(d), n + u * Math.sin(d));
            }), e.restore();
        }
        function Ku(e, t, n = {}) {
            return Object.assign({
                app: "sexcapades-share",
                appUrl: lu,
                version: 1,
                kind: e,
                profiles: t
            }, n);
        }
        function zu(e) {
            return new Promise((t, n) => {
                const i = new Image;
                i.onload = () => t(i), i.onerror = () => n(new Error("An attached photo could not be prepared for the compact export.")), 
                i.src = e;
            });
        }
        function Vu(e) {
            return new Promise((t, n) => {
                const i = new FileReader;
                i.onload = () => t(String(i.result || "")), i.onerror = () => n(new Error("An attached photo could not be prepared for the compact export.")), 
                i.readAsDataURL(e);
            });
        }
        function Yu(e, t, n) {
            return new Promise(i => e.toBlob(i, t, n));
        }
        async function Xu(e) {
            const t = await zu(e.data), n = t.naturalWidth || e.width, i = t.naturalHeight || e.height, a = Math.max(n, i), r = Math.min(1, 400 / a), o = Math.max(1, Math.round(n * r)), s = Math.max(1, Math.round(i * r)), l = document.createElement("canvas");
            l.width = o, l.height = s;
            const c = l.getContext("2d");
            c.fillStyle = "#151816", c.fillRect(0, 0, o, s), c.imageSmoothingEnabled = !0, c.imageSmoothingQuality = "high", 
            c.drawImage(t, 0, 0, o, s);
            let d = null;
            for (const e of [ .72, .62, .52, .44, .36 ]) if (d = await Yu(l, "image/jpeg", e), 
            d && d.size <= 48e3) break;
            if (!d) throw new Error("An attached photo could not be prepared for the compact export.");
            return {
                data: await Vu(d),
                width: o,
                height: s,
                cropX: e.cropX,
                cropY: e.cropY,
                cropZoom: e.cropZoom,
                cropRotation: e.cropRotation,
                cropReady: !0 === e.cropReady,
                manualCrop: !0 === e.manualCrop
            };
        }
        async function Zu(e, t = {}) {
            const n = Boolean(t.lowRes), i = Boolean(t.includeProfileInfo), a = Boolean(t.blind), r = dt[e], o = Math.max(.25, Math.min(1, Number(t.outputScale) || (n ? 4 / 9 : .8))), s = "function" == typeof t.progress ? t.progress : async () => {};
            let l = null, c = null, d = null;
            if (i) {
                if (n) {
                    await s(10, "Preparing photos", "Sizing selected profile photos for this export…"), 
                    d = await async function(e, t) {
                        const n = Yv(e), i = Array.isArray(t) ? new Set(t.map(Number)) : new Set(n.map((e, t) => t));
                        return Promise.all(n.filter((e, t) => i.has(t)).map(Xu));
                    }(r, t.photoIndices), dt[e] = d;
                    const n = (r || [])[0];
                    n && !dt[e].length && (dt[e] = [ n ]);
                }
            } else dt[e] = (r || []).slice(0, 1);
            try {
                const r = i ? Ji(wt[e]) || "Profile" : np(wt[e] || "Profile", !1) || "Profile";
                await s(18, "Rendering hypermap", "Laying out the visible hypermap at export resolution…"), 
                l = await nu([ e ], e, {
                    profileFill: !0,
                    centerOnMap: !0,
                    outputScale: o,
                    displayName: r,
                    background: t.background || "black",
                    allowedIds: t.allowedIds
                }), await s(44, "Drawing hypermap", "Painting the hypermap, profile header, and rating rings…");
                const u = new Set(l.sexcapadesNodeIds || []), p = function(e = 1, t = "black") {
                    const n = document.createElement("canvas"), i = Math.max(.25, Math.min(1, Number(e) || 1));
                    n.width = Math.round(3600 * i), n.height = Math.round(3600 * i);
                    const a = n.getContext("2d", {
                        alpha: !0
                    });
                    return a.clearRect(0, 0, n.width, n.height), "transparent" !== t && (a.fillStyle = "white" === t ? "#ffffff" : "#151816", 
                    a.fillRect(0, 0, n.width, n.height)), a.scale(i, i), a.fillStyle = "white" === t ? "#151816" : "#edf2ee", 
                    a.textBaseline = "top", {
                        canvas: n,
                        ctx: a
                    };
                }(o, t.background || "black"), h = p.ctx, g = dc(e, u);
                if (c = p.canvas, !h) throw new Error("This browser could not allocate the export canvas.");
                !function(e, t) {
                    const n = t.naturalWidth || 3600, i = t.naturalHeight || 3600;
                    e.drawImage(t, 0, 0, n, i, -3060, -3060, 9720, 9720);
                }(h, l);
                const m = t.background || "black";
                !function(e, t, n, i = "black", a = !1) {
                    const r = a ? String(Ji(wt[t] || "Profile")).replace(/\s+/g, " ").trim() || "Profile" : "Shared profile", o = a ? Uu(t) : "", s = "white" === i ? "#151816" : "#edf2ee", l = "#d7bd55", c = [ n && n.percentages ? n.percentages.green : 0, n && n.percentages ? n.percentages.yellow : 0, n && n.percentages ? n.percentages.red : 0 ];
                    e.save(), e.textBaseline = "top", e.textAlign = "left";
                    const d = "SEXCAPADES PROFILE";
                    e.font = "700 42px system-ui, sans-serif";
                    const u = e.measureText(d).width;
                    e.font = "700 88px system-ui, sans-serif";
                    const p = e.measureText(r).width;
                    e.font = "600 54px system-ui, sans-serif";
                    const h = o ? e.measureText("@" + o).width : 0, g = Math.max(u, p, h), m = Math.min(2e3, Math.max(900, Math.ceil(g + 430 + 96))), f = o ? 400 : 360;
                    e.beginPath(), Wu(e, 72, 72, m, f, 26), "transparent" !== i && (e.fillStyle = "rgba(13,17,15,.84)", 
                    e.fill()), e.strokeStyle = "rgba(99,112,104,.7)", e.lineWidth = 3, e.stroke();
                    const y = 120;
                    e.fillStyle = l, e.font = "700 42px system-ui, sans-serif", e.fillText(d, y, 106), 
                    e.fillStyle = s, e.font = "700 88px system-ui, sans-serif", "transparent" === i && (e.lineJoin = "round", 
                    e.strokeStyle = "rgba(17,21,19,.92)", e.lineWidth = 12, e.strokeText(r, y, 164)), 
                    eu(e, r, y, 164, m - 430 - 96, 94, 2), o && (e.fillStyle = l, e.font = "600 54px system-ui, sans-serif", 
                    e.fillText("@" + o, y, 368)), Gu(e, 72 + m - 215, 72 + f / 2, [ 128, 106, 84 ], c, [ "#63c796", "#d7bd55", "#e06f6a" ], "white" === i ? .16 : .26);
                    const b = a ? String(nt[t] || "").trim() : "";
                    if (b) {
                        e.font = "500 40px system-ui, sans-serif";
                        const t = Math.min(1600, m), n = 52, a = 36, r = 4, o = String(b).split(/\s+/), l = [];
                        let c = "";
                        o.forEach(n => {
                            const i = c ? c + " " + n : n;
                            e.measureText(i).width > t && c ? (l.push(c), c = n) : c = i;
                        }), c && l.push(c);
                        const d = l.slice(0, r), u = d.length * n + 1.4 * a, p = 72 + f + 24;
                        e.beginPath(), Wu(e, 72, p, m, u, 26), "transparent" !== i && (e.fillStyle = "rgba(13,17,15,.84)", 
                        e.fill()), e.strokeStyle = "rgba(99,112,104,.7)", e.lineWidth = 3, e.stroke(), e.textAlign = "left", 
                        e.textBaseline = "top", d.forEach((t, o) => {
                            const c = t + (o === r - 1 && l.length > r ? "…" : "");
                            "transparent" === i && (e.lineJoin = "round", e.strokeStyle = "rgba(17,21,19,.92)", 
                            e.lineWidth = 10, e.strokeText(c, y, p + .7 * a + o * n)), e.fillStyle = s, e.fillText(c, y, p + .7 * a + o * n);
                        });
                    }
                    e.restore();
                }(h, e, g, m, i), await s(58, "Preparing clean map", "Keeping the visible-map image free of QR overlays…"), 
                n && i && (dt[e] = d);
                const f = yx.serialize("envelope", {
                    bundleKind: "profile",
                    profiles: [ bx(e, u, i, "", a) ],
                    extra: n ? {
                        lowResolution: !0
                    } : {}
                }), y = i && Ov(ut[e]) ? zv(e) : "", b = n ? await async function(e, t, n = "", i = 2097152, a = null) {
                    let r = e, o = await ru(r, t, n, a);
                    for (;o.size > i && r.width > 960; ) {
                        a && await a(82, "Optimizing PNG size", "Reducing the compact image so it stays easy to share…");
                        const e = document.createElement("canvas"), i = .85;
                        e.width = Math.max(960, Math.round(r.width * i)), e.height = Math.round(r.height * e.width / r.width);
                        const s = e.getContext("2d");
                        s.imageSmoothingEnabled = !0, s.imageSmoothingQuality = "high", s.drawImage(r, 0, 0, e.width, e.height), 
                        r = e, o = await ru(r, t, n, a);
                    }
                    return o;
                }(c, f, y, 2097152, s) : await ru(c, f, y, s);
                return b.sexcapadesNodeIds = Array.from(u), b;
            } finally {
                l && (l.removeAttribute("src"), l.src = ""), c && (c.width = 1, c.height = 1), dt[e] !== r && (dt[e] = r, 
                Mr());
            }
        }
        function Qu(e, t, n = "") {
            // E4a (slug-gap design-away, 2026-10-22): every serialization
            // of a profile that leaves the app passes through here (full
            // profile, filtered export, share payload, Sync Card), and
            // topic data travels by canonical topic id (t####) only. Any
            // stored topic key still spelled as a slug — generated or
            // frozen-legacy — is rewritten to its id on the way out via
            // Vw (idk). Keys that are valid non-topic stored keys (cat-…,
            // subcategory-…, subtopic-… children) are not slug spellings
            // and keep their form.
            const idk = k => Vw[k] || k, i = e => Object.fromEntries(Object.entries(e || {}).map(([k, v]) => [ idk(k), v ]).filter(([e]) => t.has(e))), a = Object.fromEntries(Object.entries(vt[e] || {}).map(([k, v]) => [ idk(k), v ]).filter(([e]) => t.has(e))), r = function(e, t = null) {
                const n = {}, i = Ze[e] || {};
                return Object.entries(vt[e] || {}).forEach(([e, a]) => {
                    const k = idk(e);
                    if (t && !t.has(k)) return;
                    const r = "number" == typeof a ? [ "give", "receive" ] : [ "give", "receive" ].filter(e => a && "object" == typeof a && Object.prototype.hasOwnProperty.call(a, e));
                    r.length && (n[k] = {}, r.forEach(t => {
                        n[k][t] = "string" == typeof i[k]?.[t] ? i[k][t] : "string" == typeof i[e]?.[t] ? i[e][t] : "unknown";
                    }));
                }), n;
            }(e, t), o = i(Qe[e]), s = i(Je[e]), l = i(et[e]), c = i(tt[e]), d = i(at[e]), u = [], p = [], h = [], g = [], m = [], f = [];
            const out = (t.forEach(t => {
                if (!(qn[t] || Xn(t) || (at[e] || {})[t])) return;
                const n = ca(t, e), i = o[t];
                "favorite" === i && h.push(t), "limit" === i && g.push(t), s[t] && m.push(t), l[t] && f.push(t), 
                n.giveKnown && n.give > 35 || n.receiveKnown && n.receive > 35 ? u.push(t) : (n.giveKnown && n.give >= 0 || n.receiveKnown && n.receive >= 0) && p.push(t);
            }), {
                app: "sexcapades",
                version: 17,
                profileName: n || wt[e] || "Profile",
                profileUuid: profileUuids[e] || (profileUuids[e] = makeProfileUuid()),
                sampleProfile: Boolean(sampleProfileFlags[e]),
                gender: bb(rt[e]),
                pronouns: String(pz[e] || ""),
                sexuality: iv(ot[e]),
                roles: Gb(st[e]),
                age: Xv(lt[e]),
                location: Zv(ct[e]),
                photos: Yv(dt[e]),
                color: la(e),
                veil: av(vpt[e]),
                veilEnabled: Boolean(vht[e]),
                net: av(vpt[e]),
                netEnabled: Boolean(vht[e]),
                ratings: a,
                ratingSources: r,
                annotations: o,
                fantasyOnly: s,
                alreadyTried: l,
                notes: c,
                importedChildren: d,
                droppedKeys: (droppedKeyRecords[e] || []).slice(),
                importAttention: qw(e, t),
                completionTimes: St(mt[e]),
                contact: Ov(ut[e]) ? Rv(ut[e]) : void 0,
                aboutMe: String(nt[e] || ""),
                termsOfService: String(it[e] || ""),
                lists: {
                    favorites: h,
                    limits: g,
                    fantasies: m,
                    tried: f,
                    enthusiasticFor: u,
                    curiousAbout: p
                }
            });
            // E4a: the attention lists get the same travel-by-id
            // normalization, then the file is made self-describing:
            // "taxonomyVersion" names the catalog it was written
            // against, and "topicNames" records the current display
            // label of every topic id contained anywhere in the file
            // (ratings + side maps), so a future reader can interpret
            // the file by the sender's meanings even after a topic is
            // renamed or retired. Additive fields only — the profile
            // format version is unchanged and existing loaders ignore
            // unknown fields.
            const att = out.importAttention;
            att && (att.nodes = (att.nodes || []).map(idk), att.newest = (att.newest || []).map(idk));
            const contained = new Set;
            [ out.ratings, out.ratingSources, out.annotations, out.fantasyOnly, out.alreadyTried, out.notes ].forEach(map => {
                map && Object.keys(map).forEach(k => contained.add(k));
            }), att && [ ...(att.nodes || []), ...(att.newest || []) ].forEach(k => contained.add(k)), [ out.lists.favorites, out.lists.limits, out.lists.fantasies, out.lists.tried, out.lists.enthusiasticFor, out.lists.curiousAbout ].forEach(list => (list || []).forEach(k => contained.add(k)));
            const names = {};
            contained.forEach(k => {
                const label = topicLabelById[k];
                "string" == typeof label && label && (names[k] = label);
            }), out.taxonomyVersion = TAXONOMY_VERSION, out.topicNames = names;
            // Pair identity, INTERIM (split-center stage, 2026-10-27):
            // a pair profile's kind and operation ride in the profile
            // payload, so an exported or device-remembered pair still
            // says WHAT KIND of profile it is after the trip. This is
            // deliberately not a fuller identity scheme: the pair's
            // source identities do NOT ride along (flagged, not
            // built), so a restored pair cannot recompute or split
            // its center until its members are present again — the
            // import side restores exactly these two fields, as a
            // minimal pair record every compute path already guards
            // against (Rd, sxRefreshGroupOwn and Kd all require the
            // source snapshots this payload does not carry).
            const sxPairRec = ft[e];
            sxPairRec && "group" === sxPairRec.kind && (out.pairKind = "group", out.pairOp = "straight" === sxPairRec.pairOp ? "straight" : "bowtie");
            return out;
        }
        function Ju(e, t, n = !1, i = "", a = !1) {
            const r = Qu(e, t, n ? i || wt[e] || "Profile" : "Shared profile");
            if (a && (r.blind = !0), n) return r;
            // E4a: the share subset is self-describing too, with
            // topicNames restricted to the topics this subset carries.
            const names = {};
            return [ r.ratings, r.annotations, r.fantasyOnly, r.alreadyTried ].forEach(map => {
                map && Object.keys(map).forEach(k => {
                    const label = topicLabelById[k];
                    "string" == typeof label && label && (names[k] = label);
                });
            }), {
                app: r.app,
                version: r.version,
                taxonomyVersion: r.taxonomyVersion,
                topicNames: names,
                profileName: "Shared profile",
                ...a ? {
                    blind: !0
                } : {},
                ratings: r.ratings,
                annotations: r.annotations,
                fantasyOnly: r.fantasyOnly,
                alreadyTried: r.alreadyTried
            };
        }
        async function ep(e, n = {}) {
            const i = Boolean(n.includeProfileInfo), a = Boolean(n.blind), r = i ? Rv(ut[e]) : {}, o = i ? wt[e] || "Profile" : "Shared profile", s = n.background || "black", l = n.printFont ? "Georgia, serif" : "system-ui, sans-serif", c = "function" == typeof n.progress ? n.progress : async () => {};
            await c(7, "Rendering card hypermap", "Drawing the rated topics for the card front…");
            const d = await nu([ e ], e, {
                outputWidth: 1600,
                outputHeight: 1600,
                displayName: i ? Ji(wt[e]) || "Profile" : "Shared profile",
                background: s,
                allowedIds: n.allowedIds
            }), u = new Set(d.sexcapadesNodeIds || []), p = (() => {
                const e = document.createElement("canvas");
                return e.width = 2100, e.height = 1200, e;
            })(), h = p.getContext("2d");
            "transparent" !== s && (h.fillStyle = "white" === s ? "#ffffff" : "#151816", h.fillRect(0, 0, p.width, p.height));
            const g = "white" === s ? "#151816" : "#eff2ec", m = "white" === s ? "#4f5a53" : "#d7ded8", f = 936, y = 1128;
            h.save(), h.beginPath(), Wu(h, f, 36, y, y, 22), h.clip(), "transparent" !== s && (h.fillStyle = "white" === s ? "#ffffff" : "#202521", 
            h.fillRect(f, 36, y, y)), function(e, t, n, i, a, r, o = 1) {
                const s = t.naturalWidth || t.width, l = t.naturalHeight || t.height, c = a / r;
                let d = s, u = l;
                s / l > c ? d = l * c : u = s / c;
                const p = Math.max(1, Number(o) || 1);
                d /= p, u /= p;
                const h = (s - d) / 2, g = (l - u) / 2;
                e.drawImage(t, h, g, d, u, n, i, a, r);
            }(h, d, f, 36, y, y, 1.2), h.restore(), h.strokeStyle = "#59645d", h.lineWidth = 5, 
            h.strokeRect(f, 36, y, y), h.textBaseline = "top", h.fillStyle = "#d7bd55", h.font = `700 25px ${l}`, 
            h.fillText("SYNC CARD · FRONT", 72, 58), h.fillStyle = g, h.font = `700 56px ${l}`, 
            eu(h, o, 72, 98, 760, 62, 2), await c(28, "Building card front", "Creating the scan-to-import code…");
            const b = "https://sexcapades.io/#app/scan", v = await qu(b, 720);
            h.fillStyle = "#fff", h.fillRect(76, 236, 748, 748), h.imageSmoothingEnabled = !1, 
            h.drawImage(v, 100, 260, 700, 700), h.imageSmoothingEnabled = !0, h.textAlign = "center", 
            h.fillStyle = g, h.font = `700 32px ${l}`, h.fillText("Scan to import this card", 450, 996), 
            h.font = `600 24px ${l}`, h.fillStyle = m, h.fillText(b, 450, 1054);
            const w = yx.serialize("envelope", {
                bundleKind: "profile",
                profiles: [ vx(e, u, o, i, a) ]
            }), k = i && Ov(ut[e]) ? zv(e) : "";
            await c(40, "Encoding card front", "Preparing the front image…");
            const x = await ru(p, w, k);
            if (n.frontOnly) return d.removeAttribute("src"), d.src = "", window.lastExportSvgMarkup = null, 
            {
                front: x,
                back: null,
                payload: w,
                vcard: k
            };
            await c(52, "Checking card size", "Seeing whether this profile fits a Sync card…");
            const sxCardEncoded = await Ru(e, u, i, a), sxCardFit = function(e) {
                const t = chunkPayload(e, {
                    chunkCount: 2
                });
                if (ju(t, 18)) return {
                    parts: t,
                    size: 600,
                    columns: 1,
                    maxVersion: 18
                };
                const n = chunkPayload(e, {
                    chunkCount: 4
                });
                if (ju(n, 15)) return {
                    parts: n,
                    size: 450,
                    columns: 2,
                    maxVersion: 15
                };
                throw new Error(sxOversizeCardMessage(e.length));
            }(sxCardEncoded);
            const S = document.createElement("canvas");
            S.width = 1200, S.height = 2100;
            const $ = S.getContext("2d");
            $.fillStyle = "white" === s ? "#ffffff" : "#151816", "transparent" !== s && $.fillRect(0, 0, S.width, S.height), 
            $.textBaseline = "top", $.fillStyle = "#d7bd55", $.font = `700 25px ${l}`, $.fillText("SYNC CARD · BACK", 72, 54);
            const E = await qu(su, 720);
            $.fillStyle = "#fff", $.fillRect(60, 100, 444, 444), $.imageSmoothingEnabled = !1, 
            $.drawImage(E, 72, 112, 420, 420), $.imageSmoothingEnabled = !0, $.fillStyle = g, 
            $.font = `700 27px ${l}`, $.fillText("Syncing Sexcapades Guide", 72, 560), $.font = `500 19px ${l}`, 
            $.fillStyle = m, $.fillText(su, 72, 602);
            const A = Di(r);
            $.fillStyle = g, $.font = `700 30px ${l}`, $.fillText("Contact", 550, 112), $.font = `600 23px ${l}`;
            let C = 160;
            A.length ? A.forEach(e => {
                C = eu($, `${e.label}: ${e.user}`, 550, C, 578, 31, 2) + 9;
            }) : ($.fillStyle = m, $.font = `500 22px ${l}`, $.fillText("No contact details included.", 550, C));
            const M = sxCardFit, I = M.parts, P = [];
            for (let e = 0; e < I.length; e++) await c(58 + Math.round(22 * (e + 1) / I.length), "Building profile codes", `Creating profile code ${e + 1} of ${I.length}…`), 
            P.push(await qu(I[e], 900, {
                version: M.maxVersion,
                errorCorrectionLevel: "H"
            })), await new Promise(e => t.setTimeout(e, 0));
            const L = P.length, T = M.columns, F = Math.ceil(L / T), N = M.size, _ = 2 === L ? 0 : 48, D = N + 58, R = Math.max(650, Math.min(780, C + 34)), O = R + 56;
            $.fillStyle = g, $.textAlign = "left", $.font = `700 32px ${l}`, $.fillText("Profile data", 72, R), 
            $.fillStyle = m, $.font = `500 20px ${l}`, $.fillText(`Scan all ${L} numbered codes in any order.`, 280, R + 8), 
            P.forEach((e, t) => {
                const n = Math.floor(t / T), i = t % T, a = Math.min(T, L - n * T), r = a * N + (a - 1) * _, o = (S.width - r) / 2 + i * (N + _), s = O + n * D;
                $.fillStyle = "#fff", $.fillRect(o, s, N, N), $.imageSmoothingEnabled = !1, $.drawImage(e, o, s, N, N), 
                $.imageSmoothingEnabled = !0, $.textAlign = "center", $.fillStyle = g, $.font = `700 23px ${l}`, 
                $.fillText(`Profile data · ${t + 1} of ${L}`, o + N / 2, s + N + 17);
            });
            const B = Math.max(O + F * D + 20, R + 120);
            if (B <= 1980) {
                $.textAlign = "left", $.fillStyle = g, $.font = `700 32px ${l}`, $.fillText("Notes:", 72, B), 
                $.strokeStyle = "white" === s ? "rgba(21,24,22,.32)" : "rgba(237,242,238,.32)", 
                $.lineWidth = 2, $.setLineDash([ 5, 12 ]);
                for (let e = B + 72; e <= 2010; e += 88) $.beginPath(), $.moveTo(72, e), $.lineTo(1128, e), 
                $.stroke();
                $.setLineDash([]);
            }
            await c(86, "Encoding card back", "Preparing the back image…");
            const j = await ru(S, w, k);
            return d.removeAttribute("src"), d.src = "", window.lastExportSvgMarkup = null, 
            await c(96, "Finalizing Sync card", "Checking both finished images…"), {
                front: x,
                back: j,
                payload: w,
                vcard: k
            };
        }
        function tp(e, t = !1, n = "letter") {
            const i = "a4" == ("a4" === n ? "a4" : "letter") ? {
                width: 2480,
                height: 3508,
                label: "A4 compatible · 10 cards"
            } : {
                width: 2550,
                height: 3300,
                label: "Avery 5371 compatible · 10 cards · US Letter"
            }, a = document.createElement("canvas"), r = i.width, o = i.height, s = 1050, l = 600, c = Math.round((r - 2100) / 2), d = Math.round((o - 3e3) / 2);
            a.width = r, a.height = o;
            const u = a.getContext("2d", {
                alpha: !1
            });
            u.fillStyle = "#fff", u.fillRect(0, 0, r, o), u.imageSmoothingEnabled = !0, u.imageSmoothingQuality = "high";
            for (let n = 0; n < 5; n++) for (let i = 0; i < 2; i++) {
                const a = c + i * s, r = d + n * l;
                t ? (u.save(), u.translate(a + s, r), u.rotate(Math.PI / 2), u.drawImage(e, 0, 0, e.naturalWidth || 1200, e.naturalHeight || 2100, 0, 0, l, s), 
                u.restore()) : u.drawImage(e, 0, 0, e.naturalWidth || 2100, e.naturalHeight || 1200, a, r, s, l), 
                u.strokeStyle = "#777", u.lineWidth = 1, u.strokeRect(a + .5, r + .5, 1049, 599);
            }
            u.save(), u.fillStyle = "#111", u.textAlign = "center", u.textBaseline = "top", 
            u.font = "600 22px system-ui, sans-serif", u.fillText(`${i.label} · print at 100% / Actual Size`, r / 2, 42), 
            u.strokeStyle = "#111", u.lineWidth = 2, u.beginPath(), [ c, c + s, c + 2100 ].forEach(e => {
                u.moveTo(e, d - 34), u.lineTo(e, d), u.moveTo(e, d + 3e3), u.lineTo(e, d + 3e3 + 34);
            });
            for (let e = 0; e <= 5; e++) {
                const t = d + e * l;
                u.moveTo(c - 34, t), u.lineTo(c, t), u.moveTo(c + 2100, t), u.lineTo(c + 2100 + 34, t);
            }
            return u.stroke(), u.restore(), a;
        }
        function np(e, t = !1) {
            const n = String(e || "Profile").replace(/\s+/g, " ").trim() || "Profile";
            return t ? n : n.split(" ")[0] || "Profile";
        }
        function ip(e) {
            const t = String(e || "Profile").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, "-").replace(/^-+|-+$/g, "") || "Profile", n = t.toLowerCase();
            return {
                map: `Sexcapades-${t}-visible-map.png`,
                zoom: `Sexcapades-${t}-low-res-visible-map.png`,
                card: `Sexcapades-${t}-sync-card-front.png`,
                cardBack: `Sexcapades-${t}-sync-card-back.png`,
                cardSheet: `Sexcapades-${t}-10-up-sync-card-front-sheet.png`,
                cardBackSheet: `Sexcapades-${t}-10-up-sync-card-back-sheet.png`,
                fingerprint: `Sexcapades-${t}-kink-fingerprint.png`,
                qr: `${n}-qr.jpg`,
                json: `Sexcapades-${t}-profile.json`,
                pdf: `Sexcapades-${t}-visible-map.pdf`,
                svg: `Sexcapades-${t}-visible-map.svg`,
                svgz: `Sexcapades-${t}-visible-map.svgz`
            };
        }
        // P1 refactor (Build 2026-10-18_2227): ap (PDF export) split by
        // responsibility — apLoadAndPrep loads the PDF library, parses
        // and centre-crops the SVG and creates the document;
        // apEmbedMetadata embeds the serialized profile; apInlineStyles
        // resolves computed styles onto the export clone; apDrawLabels
        // redraws the curved map labels as native PDF text; apQrImages
        // builds the sync QR images; apHeaderCard draws the profile
        // header card. ap itself is now a thin orchestrator.
