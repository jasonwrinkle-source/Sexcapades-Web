        // SX_PLANE_VAULT: Instant profile switching cache
        // Keeps rendered DOM trees (with attached event listeners)
        // intact in memory inside DocumentFragments.
        const sxPlaneVault = new Map();
        let sxActiveVaultKey = null;
        let sxActiveVaultProfileId = null;

        function sxGetMapVaultKey(id) {
            const profId = id || "__default__";
            const v = (typeof vht !== "undefined" && Boolean(vht[profId])) ? (typeof av === "function" && typeof vpt !== "undefined" ? av(vpt[profId]) : "on") : "off";
            const mode = (typeof Qi === "function" && Qi()) ? "compare:" + Array.from(Xi()).sort().join(",") : "single:" + profId;
            const search = (typeof $n !== "undefined" && $n && $n.size) ? Array.from($n).sort().join(",") : "none";
            const detail = typeof mapDetailLevel !== "undefined" ? mapDetailLevel : "norm";
            const cat = typeof Pt !== "undefined" ? Pt : "all";
            const rated = typeof Sn !== "undefined" ? Sn : "all";
            const blind = typeof Rt !== "undefined" ? Rt : false;
            return `${mode}|det:${detail}|cat:${cat}|srch:${search}|sn:${rated}|veil:${v}|blind:${blind}`;
        }

        function sxVaultCaptureCurrent() {
            if (!sxActiveVaultKey || !In || In.childNodes.length === 0) return;
            const frag = document.createDocumentFragment();
            while (In.firstChild) {
                frag.appendChild(In.firstChild);
            }
            if (sxPlaneVault.size >= 8) {
                const oldestKey = sxPlaneVault.keys().next().value;
                sxPlaneVault.delete(oldestKey);
            }
            sxPlaneVault.set(sxActiveVaultKey, frag);
            sxActiveVaultKey = null;
            sxActiveVaultProfileId = null;
        }

        function sxVaultTryRestore(profileId) {
            if (!profileId || !In) return false;
            if (typeof yt !== "undefined" && yt[profileId]) return false;
            const key = sxGetMapVaultKey(profileId);
            const cachedFrag = sxPlaneVault.get(key);
            if (!cachedFrag || cachedFrag.childNodes.length === 0) return false;

            sxVaultCaptureCurrent();
            if (typeof In.replaceChildren === "function") {
                In.replaceChildren(cachedFrag);
            } else {
                while (In.firstChild) In.removeChild(In.firstChild);
                In.appendChild(cachedFrag);
            }
            sxPlaneVault.delete(key);
            sxActiveVaultKey = key;
            sxActiveVaultProfileId = profileId;
            return true;
        }

        // Listener wiring stays between the memory vault and the warm-boot read: the restore rebinds this same tree.
        function sxWireMapListeners() {
            if (!In) return;
            In.querySelectorAll(".branch-icon,.topic-icon,.category-label,.map-label").forEach(ul);
            try { wh(); hg(); _a(); } catch (_) {}
            In.querySelectorAll(".center-glance-ring-hit").forEach(e => {
                e.addEventListener("mouseenter", () => Fc(e.dataset.centerGlanceIndex, e));
                e.addEventListener("mouseleave", _c);
                e.addEventListener("keydown", t => {
                    "Enter" !== t.key && " " !== t.key || (t.preventDefault(), t.stopPropagation(), Fc(e.dataset.centerGlanceIndex, e));
                });
            });
            In.querySelectorAll(".category-label,.map-label,.branch-icon,.topic-icon").forEach(e => e.addEventListener("click", Qa));
            In.querySelectorAll(".concept-hit,.topic-stem,.tapered-stem,.hanky-midline,.hanky-midline-outline").forEach(e => e.addEventListener("click", Qsel));
            In.querySelectorAll(".node-note-trigger").forEach(e => {
                const t = t => {
                    t.preventDefault(), t.stopPropagation();
                    const n = e.getBoundingClientRect();
                    xo(e.dataset.noteId, n.left + n.width / 2, n.bottom + 4, { focusNote: !0 });
                };
                e.addEventListener("click", t);
                e.addEventListener("mouseenter", t);
                e.addEventListener("keydown", e => { "Enter" !== e.key && " " !== e.key || t(e); });
            });
            if (!In.dataset.dblclickBound) {
                In.dataset.dblclickBound = "true";
                In.addEventListener("dblclick", t => {
                    if (typeof window.__sxCancelNodeTap === "function") window.__sxCancelNodeTap();
                    const hit = t.target.closest && t.target.closest(".category-toggle-hit,.category-icon-hit,.category-label,.map-label,.concept-hit,.concept-path,.topic-stem,.tapered-stem,.hanky-midline,.spoke-underlay-item,.branch-icon,.topic-icon,.subcategory-node,.node-group");
                    if (!hit) return;
                    t.preventDefault();
                    t.stopPropagation();
                    let sid = hit.dataset.id || hit.dataset.topicId || (hit.closest && hit.closest(".node-group")?.dataset.layoutKey) || "";
                    if (!sid) return;
                    sid = String(sid);
                    if (sid.startsWith("cat-")) sid = sid.slice(4);
                    if (sid.startsWith("subcategory-")) sid = sid.slice(12);
                    try {
                        const mm = document.getElementById("markMenu");
                        if (mm) mm.hidden = true;
                        const dlgs = document.querySelectorAll("dialog[open]");
                        dlgs.forEach(d => { try { d.close(); } catch (_) { d.removeAttribute("open"); } });
                    } catch (_) {}
                    const cat = h.find(c => c.name === sid || c.id === sid || catId(c.name) === sid || sxName(c.name) === sxName(sid));
                    const branch = cat ? cat.name : ((qn[sid] && qn[sid].branch) || ci(sid) || "");
                    if (window.__sxFocusNode) {
                        window.__sxFocusNode(cat ? cat.id : sid, branch);
                        return;
                    }
                    selectSpokeNode(sid, !0);
                });
            }
            In.querySelectorAll(".category-label,.map-label,.concept-hit").forEach(e => e.addEventListener("keydown", t => {
                if ("Enter" !== t.key && " " !== t.key) return;
                t.preventDefault(), t.stopPropagation();
                const n = e.dataset.id || e.dataset.topicId;
                t.shiftKey ? xo(n, innerWidth / 2, innerHeight / 2) : e.classList.contains("concept-hit") ? selectSpokeNode(n, !0) : $i(n);
            }));
            In.querySelectorAll(".hidden-count-badge").forEach(e => e.addEventListener("keydown", t => {
                "Enter" !== t.key && " " !== t.key || (t.preventDefault(), t.stopPropagation(), vi(e.dataset.id));
            }));
            In.querySelectorAll(".direction-hit").forEach(e => e.addEventListener("keydown", t => function(e, t) {
                const n = "Enter" === t.key || " " === t.key, i = [ "ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End" ].includes(t.key);
                if (!n && !i) return;
                if (mn.staticMap) return;
                t.preventDefault(), t.stopPropagation();
                const a = e.dataset.id, r = e.dataset.direction;
                if (n) {
                    if (Nt) {
                        if (Nt.id !== a || Nt.direction !== r) return;
                    } else Nt = { id: a, direction: r };
                    return void Mr();
                }
                const o = da(a, Vi());
                let s = o[r + "Known"] ? o[r] : 0;
                if ("Home" === t.key) s = -100; else if ("End" === t.key) s = 100; else {
                    const e = t.shiftKey ? 10 : 1;
                    s += "ArrowRight" === t.key || "ArrowUp" === t.key ? e : -e;
                }
                const l = Vi(), c = cs(l).rated;
                Nt = null, To(a, r, s), checkMilestoneTransition(l, c);
            }(e, t)));
            In.querySelectorAll(".curve-edit-handle").forEach(e => e.addEventListener("keydown", t => {
                if (![ "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home" ].includes(t.key)) return;
                if (mn.staticMap) return;
                t.preventDefault(), t.stopPropagation();
                const n = e.dataset.curveId, i = Number(e.dataset.bend) || 0;
                "Home" === t.key ? delete bt[n] : bt[n] = Math.max(-260, Math.min(260, i + ("ArrowLeft" === t.key || "ArrowDown" === t.key ? -12 : 12)));
                Mr({ anchorId: n });
            }));
            In.querySelectorAll(".rating-clear-hit").forEach(e => e.addEventListener("keydown", t => {
                "Enter" !== t.key && " " !== t.key || (t.preventDefault(), t.stopPropagation(), Fo(e.dataset.id, e.dataset.direction));
            }));
            const x = In.querySelector(".center-hit");
            x && (x.addEventListener("keydown", e => {
                "Enter" !== e.key && " " !== e.key || (e.preventDefault(), e.stopPropagation(), sh());
            }), x.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), performance.now() - Dp <= 700 || sh();
            }), x.addEventListener("contextmenu", e => {
                e.preventDefault();
            }));
            try { Ja(); } catch (_) {}
        }

        const SX_WARM_BOOT_VER = "4.0.0-w3";
        const SX_WARM_BOOT_STORAGE_KEY = "sx_hypermap_warm_boot_v3";
        const SX_IDB_NAME = "sx_hypermap_db";
        const SX_IDB_STORE = "hypermap_cache";
        const SX_IDB_VERSION = 1;

        function sxOpenIdb() {
            return new Promise((resolve, reject) => {
                if (typeof window === "undefined" || !window.indexedDB) {
                    return reject(new Error("IndexedDB not available"));
                }
                const req = indexedDB.open(SX_IDB_NAME, SX_IDB_VERSION);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(SX_IDB_STORE)) {
                        db.createObjectStore(SX_IDB_STORE);
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error || new Error("IDB open failed"));
            });
        }

        function sxIdbGet(key) {
            return sxOpenIdb().then(db => new Promise((resolve, reject) => {
                const tx = db.transaction(SX_IDB_STORE, "readonly");
                const store = tx.objectStore(SX_IDB_STORE);
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error || new Error("IDB get failed"));
            }));
        }

        function sxIdbSet(key, value) {
            return sxOpenIdb().then(db => new Promise((resolve, reject) => {
                const tx = db.transaction(SX_IDB_STORE, "readwrite");
                const store = tx.objectStore(SX_IDB_STORE);
                const req = store.put(value, key);
                req.onsuccess = () => resolve(true);
                req.onerror = () => reject(req.error || new Error("IDB put failed"));
            }));
        }

        function sxIdbDelete(key) {
            return sxOpenIdb().then(db => new Promise((resolve, reject) => {
                const tx = db.transaction(SX_IDB_STORE, "readwrite");
                const store = tx.objectStore(SX_IDB_STORE);
                const req = store.delete(key);
                req.onsuccess = () => resolve(true);
                req.onerror = () => reject(req.error || new Error("IDB delete failed"));
            }));
        }

        // In-browser stream compression using native browser CompressionStream / DecompressionStream
        async function sxCompressSvg(str) {
            if (typeof CompressionStream !== "undefined") {
                try {
                    const blob = new Blob([str], { type: "text/plain" });
                    const cs = new CompressionStream("gzip");
                    const stream = blob.stream().pipeThrough(cs);
                    const buf = await new Response(stream).arrayBuffer();
                    return { raw: false, data: buf };
                } catch (_) {}
            }
            return { raw: true, data: str };
        }

        async function sxDecompressSvg(entry) {
            if (!entry) return "";
            if (entry.raw) return entry.data || "";
            if (typeof DecompressionStream !== "undefined" && entry.data) {
                try {
                    const blob = new Blob([entry.data]);
                    const ds = new DecompressionStream("gzip");
                    const stream = blob.stream().pipeThrough(ds);
                    return await new Response(stream).text();
                } catch (_) {}
            }
            return typeof entry.data === "string" ? entry.data : "";
        }

        let sxWarmBootCachedObj = null;
        let sxWarmBootPromise = null;

        function sxWarmBootInit() {
            try {
                try {
                    localStorage.removeItem("sx_hypermap_warm_boot_v1");
                    sessionStorage.removeItem("sx_hypermap_warm_boot_v1");
                } catch (_) {}
                sxWarmBootPromise = sxIdbGet(SX_WARM_BOOT_STORAGE_KEY).then(res => {
                    sxWarmBootCachedObj = res;
                    return res;
                }).catch(() => null);
            } catch (_) {}
        }
        sxWarmBootInit();

        async function sxSaveWarmBootCache(profileId) {
            if (!In || In.childNodes.length === 0) return;
            const profId = profileId || "__default__";
            try {
                const key = sxGetMapVaultKey(profId);
                const markupStr = In.innerHTML;
                const compressed = await sxCompressSvg(markupStr);
                const payload = {
                    v: SX_WARM_BOOT_VER,
                    time: Date.now(),
                    key: key,
                    profileId: profId,
                    compressed: compressed
                };
                sxWarmBootCachedObj = payload;
                sxIdbSet(SX_WARM_BOOT_STORAGE_KEY, payload).then(() => {
                    const originalKb = Math.round(markupStr.length / 1024);
                    const storedKb = compressed.raw ? originalKb : Math.round(compressed.data.byteLength / 1024);
                    console.log("[Sexcapades WarmBoot] Saved hypermap to IndexedDB for [" + profId + "] (" + storedKb + " KB gzipped, " + originalKb + " KB raw)");
                }).catch(err => {
                    console.warn("[Sexcapades WarmBoot] IndexedDB save failed:", err);
                });
            } catch (err) {
                console.warn("[Sexcapades WarmBoot] Cache save error:", err);
            }
        }

        async function sxTryRestoreWarmBoot() {
            if (!In) return false;
            try {
                let cached = sxWarmBootCachedObj;
                if (!cached && sxWarmBootPromise) {
                    cached = await sxWarmBootPromise;
                }
                if (!cached) {
                    cached = await sxIdbGet(SX_WARM_BOOT_STORAGE_KEY).catch(() => null);
                }

                const currentTargetId = Mt && vt[Mt] ? Mt : "__default__";
                const currentKey = sxGetMapVaultKey(currentTargetId);

                // Priority 1: If warm boot cache exists in IndexedDB and matches current profile & vault key
                if (cached && cached.v === SX_WARM_BOOT_VER && cached.profileId === currentTargetId && cached.key === currentKey) {
                    const isDirty = Boolean(typeof yt !== "undefined" && yt[currentTargetId]);
                    if (!isDirty) {
                        const markup = cached.compressed ? await sxDecompressSvg(cached.compressed) : cached.markup;
                        if (markup) {
                            n(In, markup);
                            sxWireMapListeners();
                            sxActiveVaultKey = currentKey;
                            sxActiveVaultProfileId = currentTargetId;
                            window.__sxBootChunkPaint = 0;
                            if (typeof window.__sxBootProgress === "function") window.__sxBootProgress(100);
                            if (typeof window.__sxBootFinish === "function") window.__sxBootFinish(false);
                            if (typeof window.__sxLoad === "function") window.__sxLoad(100);
                            try { vc(); } catch (_) {}
                            try { Ih(); } catch (_) {}
                            console.log("[Sexcapades WarmBoot] Restored warm boot cache for [" + currentTargetId + "] in < 15ms!");
                            return true;
                        }
                    }
                }

                return false;
            } catch (err) {
                if (typeof __sxErrLog === "function") __sxErrLog("warm-boot-restore", err);
                console.warn("[Sexcapades WarmBoot] Warm boot restore error:", err);
                return false;
            }
        }

        function sxInvalidateWarmBootCache(id) {
            try {
                sxWarmBootCachedObj = null;
                sxIdbDelete(SX_WARM_BOOT_STORAGE_KEY).catch(() => {});
            } catch (_) {}
        }

        function sxTopicKnownInOpenGroup(id) {
            const g = typeof Kd === "function" ? Kd() : null;
            if (!g || Rt) return !1;
            const own = ca(id, Vi());
            if (own.giveKnown || own.receiveKnown) return !0;
            return (g.sourceIds || []).some(pid => {
                const c = ca(id, pid);
                return c.giveKnown || c.receiveKnown;
            });
        }
        function sxVaultInvalidate(id) {
            sxInvalidateWarmBootCache(id);
            if (!id) {
                sxPlaneVault.clear();
                sxActiveVaultKey = null;
                sxActiveVaultProfileId = null;
                return;
            }
            if (sxActiveVaultProfileId === id) {
                sxActiveVaultKey = null;
                sxActiveVaultProfileId = null;
            }
            for (const k of sxPlaneVault.keys()) {
                if (k.includes(id)) {
                    sxPlaneVault.delete(k);
                }
            }
        }

