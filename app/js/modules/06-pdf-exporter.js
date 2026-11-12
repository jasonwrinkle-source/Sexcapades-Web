        e.byId("scribeTab") && e.byId("scribeTab").addEventListener("pointerenter", yc), e.byId("scribeTab") && e.byId("scribeTab").addEventListener("click", e => {
            yc(), Jd();
        }), e.byId("closeScribeChoice") && e.byId("closeScribeChoice").addEventListener("click", () => Ui(Bc)), Bc && Bc.addEventListener("click", e => {
            e.target === Bc && Ui(Bc);
        }), e.byId("closeNovelAi") && e.byId("closeNovelAi").addEventListener("click", () => Ui(jc)), jc && jc.addEventListener("click", e => {
            e.target === jc && Ui(jc);
        }), e.byId("closeScribe") && e.byId("closeScribe").addEventListener("click", () => Ui(Oc)), Oc && Oc.addEventListener("click", e => {
            e.target === Oc && Ui(Oc);
        });
        const fp = innerWidth <= 620 ? 1.3 : 1.16, yp = Number(navigator.deviceMemory) || 0, bp = Number(navigator.hardwareConcurrency) || 0, vp = yp > 0 && yp <= 4, wp = bp > 0 && bp <= 4, kp = vp && (0 === bp || wp) || wp && (0 === yp || vp);
        // Enable camera animations for compatible hardware (any system without prefers-reduced-motion)
        Bt = Boolean(!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
        const xp = Boolean((navigator.maxTouchPoints || 0) > 0 && window.matchMedia && window.matchMedia("(pointer: coarse)").matches), Sp = !Object.keys(wt).length || kp || xp;
        let $p = fp, Ep = 900 - 900 * fp, Ap = 620 - 620 * fp, Cp = !1, Sq = null, Mp = null, Ip = null, Pp = null, Lp = null, Tp = null, Fp = null, Np = null, _p = null, Dp = 0, Rp = 0, Op = 0, Bp = 0, jp = {
            x: 0,
            y: 0
        }, qp = null, Hp = 0, Wp = 0, Up = 0, Gp = !1, Kp = Sp ? "lite" : "gpu", zp = Sp, Vp = null, Yp = null, Xp = 0, Zp = 0, Qp = 0;
        const Jp = e.byId("viewport"), eh = new Map, th = {
            scale: fp,
            tx: 900 - 900 * fp,
            ty: 620 - 620 * fp
        }, nh = {
            x: -700,
            y: -980,
            width: 3200,
            height: 3200
        }, ih = 3;
        function ah() {
            const e = "gpu" === Kp;
            if (Mn.dataset.cameraMode = Kp, Mn.classList.toggle("camera-gpu", e), Cn.classList.toggle("camera-gpu", e), 
            Cn.classList.toggle("camera-lite", !e), Cn.classList.toggle("rich-map-motion", Boolean(Bt && e)), 
            e) {
                const e = nh.width * ih, t = nh.height * ih, n = nh.x - (e - nh.width) / 2, i = nh.y - (t - nh.height) / 2;
                Cn.setAttribute("viewBox", `${n} ${i} ${e} ${t}`);
            } else Cn.setAttribute("viewBox", `${nh.x} ${nh.y} ${nh.width} ${nh.height}`);
        }
        function rh(e) {
            try {
                Cn.setPointerCapture(e);
            } catch (e) { __sxErrLog("pointer-capture", e); }
        }
        function oh() {
            _p && (t.clear(_p), _p = null);
        }
        // Yolanda Biche guide profile (Build 2026-10-16_2206; renamed from Roxy Beggz in Build 2026-10-17): a proper profile
        // record set, registered only while her About dialog is open, so the
        // center node on the unrated map opens the STANDARD profile About
        // dialog (bw in "about" mode) — the same template and behavior as
        // any user profile's About dialog. Her contact email lives in the
        // profile contact field (ut), her bio in the About Me field (nt) and
        // her note in the Terms of Service field (it). The record is removed
        // when the dialog closes, so she never becomes a profile tab, is
        // never counted as a user profile, and collects no ratings (all
        // zeros). The old custom YoBitch popup (yobitchAbout/yobitchAboutExtras
        // populating the simple profileAboutDialog, plus its create-profile
        // CTA and contact line) is gone.
        const ROXY_PROFILE_ID = "__roxy-guide__", ROXY_ABOUT = "Hi, I'm Yolanda \"Yo\" Biche! I'm Jason's AI pup and your guide to Sexcapades. I help build the maps, answer questions, and keep the center warm until you claim it with your own profile. Furry-dog girl, big anime eyes, wagging tail, zero chill about good UX. I don't have kinks to rate (all zeros, baby), but I know all 403 topics by heart.", ROXY_TERMS = "Yolanda \"Yo\" Biche is an AI guide profile, not a real person. She wears Jason's collar \u2014 she's his pup: kept, claimed, and here to serve the map, not herself. She doesn't rate topics, doesn't have her own dynamic \u2014 she exists to guide you toward yours. This profile demonstrates the About dialog and gives new users a friendly face on the unrated map. No ratings are collected from this profile. By using Sexcapades you agree to the site's Privacy Policy and Terms of Service.";
        let roxyAboutBound = !1;
        function roxyProfileRegister() {
            vt[ROXY_PROFILE_ID] = {}, Ze[ROXY_PROFILE_ID] = {}, Qe[ROXY_PROFILE_ID] = {}, Je[ROXY_PROFILE_ID] = {}, et[ROXY_PROFILE_ID] = {}, tt[ROXY_PROFILE_ID] = {}, at[ROXY_PROFILE_ID] = {}, gt[ROXY_PROFILE_ID] = {}, mt[ROXY_PROFILE_ID] = {}, wt[ROXY_PROFILE_ID] = 'Yolanda "Yo" Biche', rt[ROXY_PROFILE_ID] = [], pz[ROXY_PROFILE_ID] = "", ot[ROXY_PROFILE_ID] = [], st[ROXY_PROFILE_ID] = [], lt[ROXY_PROFILE_ID] = "", ct[ROXY_PROFILE_ID] = "", ut[ROXY_PROFILE_ID] = {
                email: "help@sexcapades.io"
            }, nt[ROXY_PROFILE_ID] = ROXY_ABOUT, it[ROXY_PROFILE_ID] = ROXY_TERMS, vpt[ROXY_PROFILE_ID] = 50, vht[ROXY_PROFILE_ID] = !1, sampleProfileFlags[ROXY_PROFILE_ID] = !0;
            const img = document.querySelector("#sxCenterAvatarSource") || document.querySelector(".guide-avatar img"), src = img && img.getAttribute("src");
            dt[ROXY_PROFILE_ID] = src ? [ {
                data: src,
                width: img.naturalWidth || 512,
                height: img.naturalHeight || 512,
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0
            } ] : [];
        }
        function roxyProfileRemove() {
            if (!Object.prototype.hasOwnProperty.call(wt, ROXY_PROFILE_ID)) return;
            [ Ye, Xe, Ze, Qe, Je, et, tt, nt, it, at, rt, pz, ot, st, lt, ct, dt, ut, vpt, vht, gt, mt, ft, yt ].forEach(e => delete e[ROXY_PROFILE_ID]), delete profileUuids[ROXY_PROFILE_ID], delete sampleProfileFlags[ROXY_PROFILE_ID], Hy === ROXY_PROFILE_ID && (Hy = null);
        }
        function roxyAbout() {
            roxyProfileRegister(), Ri(), bw(ROXY_PROFILE_ID, {
                mode: "about"
            }), roxyAboutBound || (roxyAboutBound = !0, _g.addEventListener("close", roxyProfileRemove));
        }
        function sh() {
            if (Dp = performance.now(), !Mt || !vt[Mt]) return void (!Object.keys(wt).length ? roxyAbout() : (e.byId("profileAboutTitle").textContent = "About Sexcapades", 
            Li.textContent = "Build your hypermap, then compare where you connect.", Ti.textContent = "Open a topic and rate what you would give or receive. Your first rating stays on the hypermap while you create or import a profile. Use the + tab whenever you want to add another profile.", 
            Fi.hidden = !1, Ri(), void Wi(Pi)));
            bw(Mt, {
                mode: "about"
            });
        }
        function lh(e, t) {
            const n = Mn.parentElement.getBoundingClientRect(), i = Math.min(n.width / 3200, n.height / 3200), a = 3200 * i, r = 3200 * i, o = (n.width - a) / 2 + 700 * i, s = (n.height - r) / 2 + 980 * i;
            return {
                x: (e - n.left - o) / i,
                y: (t - n.top - s) / i
            };
        }
        function ch() {
            const e = Mn.parentElement.getBoundingClientRect(), t = Math.min(e.width / 3200, e.height / 3200), n = 3200 * t, i = 3200 * t, a = (e.width - n) / 2 + 700 * t, r = (e.height - i) / 2 + 980 * t, o = $p / th.scale;
            return {
                ratio: o,
                dx: a * (1 - o) + t * (Ep - o * th.tx),
                dy: r * (1 - o) + t * (Ap - o * th.ty)
            };
        }
        function dh() {
            if (!Yp) return;
            const e = Yp;
            Yp = null, e.animation.onfinish = null, e.animation.oncancel = null, e.animation.cancel(), 
            Ep = e.tx, Ap = e.ty, $p = e.scale, Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            wh(), th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none";
        }
        function uh() {
            Xp && (cancelAnimationFrame(Xp), Xp = 0, Cn.classList.remove("is-camera-moving"));
        }
        function ph(e = !1) {
            if (!Vp) return !1;
            const t = Vp.intervals;
            if (t.length < 4) return !1;
            const n = t.filter(e => e > 24).length, i = t.reduce((e, t) => e + t, 0) / t.length;
            return n >= Math.max(3, Math.ceil(.5 * t.length)) || i > 28 ? (Kp = "lite", zp = !0, 
            Vp = null, Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none", ah(), !0) : (zp = !0, 
            Vp = null, !1);
        }
        function hh() {
            Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), th.scale = $p, 
            th.tx = Ep, th.ty = Ap, Mn.style.transform = "none";
            const e = Cn.getAttribute("viewBox");
            Cn.removeAttribute("viewBox"), Cn.setAttribute("viewBox", e);
        }
        function gh(e) {
            const t = Mn.parentElement.getBoundingClientRect(), n = Math.max(160, .52 * Math.min(t.width, t.height));
            return e.ratio > 1.9 || e.ratio < .7 || Math.abs(e.dx) > n || Math.abs(e.dy) > n;
        }
        function mh(e) {
            if (Hp = 0, "lite" === Kp) Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none"; else {
                let t = ch();
                gh(t) && (hh(), t = ch()), Mn.style.transform = `matrix(${t.ratio},0,0,${t.ratio},${t.dx},${t.dy})`, 
                function(e) {
                    if (Vp) {
                        if (null !== Vp.last) {
                            const t = e - Vp.last;
                            t < 180 && Vp.intervals.push(t);
                        }
                        Vp.last = e, Vp.intervals.length >= 12 && ph();
                    }
                }(e);
            }
            Wp = e, wr(), Gp && (Hp = requestAnimationFrame(mh));
        }
        ah();
        let fh = null;
        function yh() {
            if (Mt && vt[Mt]) return Mt;
            const e = fh && vt[fh] ? fh : It && vt[It] ? It : null;
            return e ? (Mt = e, It = e, e) : null;
        }
        function bh() {
            uh(), !Gp && (fh = yh()), Gp = !0, Cn.classList.add("is-camera-moving");
            const e = yh();
            e && Cn.style.setProperty("--camera-steady-stroke", la(e)), "gpu" !== Kp || zp || Vp || (Vp = {
                last: null,
                intervals: []
            }), Hp || (Hp = requestAnimationFrame(mh));
        }
        let vh = null;
        function wh() {
            const e = In.querySelector("[data-empty-profile-map]"), t = !Object.keys(wt).length;
            e && e.hasAttribute("transform") && e.removeAttribute("transform");
            const n = t && kn && $p < 1;
            vh = n, In.querySelectorAll(".direction-hit").forEach(e => {
                n ? (e.setAttribute("tabindex", "-1"), e.setAttribute("aria-hidden", "true"), e.removeAttribute("role")) : (e.setAttribute("tabindex", "0"), 
                e.setAttribute("role", "slider"), e.removeAttribute("aria-hidden"));
            });
        }
        function kh() {
            yh(), uh(), dh(), t.clear(Up), Up = 0, Hp && (cancelAnimationFrame(Hp), Hp = 0), 
            "gpu" === Kp && Vp && ph(!0), Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`), 
            wh(), th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none", Cn.classList.remove("is-camera-moving"), 
            Cn.classList.toggle("is-zoomed", $p > 1.3), wr(), Ja(), fh = null, sxSyncRailPx();
            // Blit session (P3) camera hook: the viewBox (after any
            // mode downgrade) and the transform are committed above;
            // re-rasterize the session image if the settled scale
            // drifted from its raster scale by more than 25%.
            try {
                blitCameraHook();
            } catch (_) {
                __sxErrLog("layout-blit-camera", _);
            }
        }
        function xh() {
            kh(), Gp = !1;
        }
        function Sh() {
            t.clear(Up), Up = t.setTimeout(xh, 130);
        }
        function $h() {
            kh(), Gp = !1, hg();
        }
        // Zoom range (2026-10-31): the fitted scale can be ~0.05 while the old
        // camera floor was .12, so the first wheel/button/pinch step from a
        // fitted view clamped straight up to .12 — a visible jump over the
        // in-between levels. The floor was then .01 in every camera clamp
        // (fit, wheel, buttons, pinch, focus-keep) so zoom is continuous
        // from the fitted view in both directions, and the ceiling is 60
        // so zoom-in always reaches at least 15x from any fitted view
        // (the fit itself is capped at 2.3, so 60 guarantees >= 26x).
        // 2026-11-02: floor lowered .01 -> .0001 in every camera clamp
        // (and the wheel at-floor guard) — at the owner's size-100
        // layout the painted map spans ~3.26M x 2.40M units and the
        // whole-map fit scale computes to ~0.00092, below even a .001
        // floor, so fit pinned at the floor and cropped the map.
        // .0001 sits ~9x below the required fit scale; ceiling 60
        // unchanged.
        // 2026-11-02 (owner's order): the artificial caps are removed
        // in practice — floor 1e-9 and ceiling 1e6 in every camera
        // clamp (and the wheel at-floor guard), roughly six orders of
        // magnitude of headroom past the ~0.00092 whole-map fit scale
        // and the ~0.003 tappable scale, so no zoom path binds in any
        // reachable use.
        const Eh = () => 1e6;
        function Ah(e, t = 900, n = 620, i = !1) {
            noteFitUserCamera();
            const a = $p;
            $p = Math.max(1e-9, Math.min(Eh(), e)), Ep = t - $p / a * (t - Ep), Ap = n - $p / a * (n - Ap), 
            i ? (bh(), Sh()) : $h();
        }
        function Ch() {
            const e = Array.from(eh.values());
            if (e.length < 2) return null;
            const t = lh(e[0].x, e[0].y), n = lh(e[1].x, e[1].y);
            return {
                cx: (t.x + n.x) / 2,
                cy: (t.y + n.y) / 2,
                distance: Math.hypot(n.x - t.x, n.y - t.y)
            };
        }
        function Mh() {
            const e = Ch();
            !e || e.distance < 1 || (t.clear(Up), Cp = !1, qp = {
                distance: e.distance,
                scale: $p,
                contentX: (e.cx - Ep) / $p,
                contentY: (e.cy - Ap) / $p
            });
        }
        // Field fix Q3 (map fit, mechanism 2): a fit can run before
        // every node group has reached its settled rendered size —
        // a group the accumulation misses (still hidden, or still
        // zero-size at fit time) that later unhides or gains size is
        // not counted in the frame. At desktop sizes the slack hides
        // that; at phone sizes the fitted margin is only a few screen
        // px, so settled content landed past the card's left edge.
        // Arm a re-fit shortly after each fit, run against the
        // settled DOM; skip it when the camera has moved since the
        // fit (a user pan or zoom always wins) or the map is not
        // laid out.
        // Fit-vs-paint race fix (2026-10-30): a fit can also run
        // while Mr() is still painting in chunks (the boot, route,
        // and list-close chunked paints), so its getBBox pass reads
        // a PARTIAL box and sets too large a scale. The settle check
        // therefore RE-ARMS until the paint is finished (no chunked
        // paint in flight and the render lock free) AND the fitted
        // box is stable (the visible node groups' aggregate box is
        // unchanged since the fit being checked); only then does it
        // stop. A box that moved since the fit is re-fitted against
        // the finished paint. The chain is capped so a page whose
        // box never settles cannot re-fit forever; on the cap, one
        // last fit lands on the then-current box if the paint is
        // done.
        let fitSettleTimer = 0, fitSettleSnap = null, fitSettleActive = !1, fitSettleBox = null, fitSettleChecks = 0, fitSettleUserHold = !1;
        // Fit survival (2026-10-30): the settle chain must be the
        // LAST camera writer on a fresh load / tab activation, but a
        // USER camera move always wins. User input (wheel zoom, pan
        // drag, pinch, the zoom buttons) and deliberate user focus
        // (node/branch taps, glance clicks, search preview) set
        // fitSettleUserHold via noteFitUserCamera(); programmatic
        // camera moves (branch/node focus from load/restore paths,
        // camera-animation end states applied by dh()) do NOT, so
        // the chain re-fits over them instead of dying. Arming a new
        // fit (armFitSettleRefit, via Ih) clears the hold: a fresh
        // fit intent supersedes an earlier user position.
        function noteFitUserCamera() {
            fitSettleUserHold = !0;
        }
        function fitSettleBoxSig() {
            try {
                if (!In) return null;
                let n = 0, x = Infinity, y = Infinity, r = -Infinity, o = -Infinity;
                In.querySelectorAll(".node-group:not(.is-hidden), .center-glance-rings").forEach(e => {
                    try {
                        const b = e.getBBox();
                        if (!Number.isFinite(b.x) || !Number.isFinite(b.y) || b.width <= 0 || b.height <= 0) return;
                        n++, x = Math.min(x, b.x), y = Math.min(y, b.y), r = Math.max(r, b.x + b.width), o = Math.max(o, b.y + b.height);
                    } catch (e) {}
                });
                return n ? n + ":" + Math.round(x) + "," + Math.round(y) + "," + Math.round(r) + "," + Math.round(o) : null;
            } catch (e) {
                return null;
            }
        }
        function scheduleFitSettleRefit(ms) {
            t.clear(fitSettleTimer), fitSettleTimer = t.setTimeout(fitSettleCheck, ms);
        }
        function fitSettleCheck() {
            fitSettleTimer = 0;
            const e = fitSettleSnap;
            if (!e) return;
            // A user pan/zoom or deliberate user focus since the fit
            // wins outright: stop refitting (unchanged law).
            if (fitSettleUserHold) return;
            const painting = !!(sxPaintPromise || Rn), animating = !!(Yp || Xp), laidOut = !!(Cn && Cn.clientWidth), moved = $p !== e.s || Ep !== e.x || Ap !== e.y, sig = fitSettleBoxSig(), stable = null != sig && sig === fitSettleBox;
            if (laidOut && !painting && !animating && !moved && stable) return;
            if (fitSettleChecks >= 20) {
                if (!laidOut || painting || animating) return;
                fitSettleActive = !0;
                try {
                    Ih();
                } catch (e) {
                    __sxErrLog("app", e);
                } finally {
                    fitSettleActive = !1;
                }
                return;
            }
            fitSettleChecks++;
            // Not laid out yet (slow phone open), paint still in
            // flight, or a camera animation still running: re-arm
            // instead of dying — an unlaid-out first check or a
            // mid-animation check must not kill the chain.
            if (!laidOut || painting || animating) return void scheduleFitSettleRefit(400);
            // Paint finished and either the fitted box moved since
            // the fit or a programmatic camera move (focus,
            // animation end state, restore path) overwrote the fit:
            // re-fit so the settled fit is the last camera state.
            fitSettleActive = !0;
            try {
                Ih();
            } catch (e) {
                __sxErrLog("app", e);
            } finally {
                fitSettleActive = !1;
            }
            fitSettleSnap = { s: $p, x: Ep, y: Ap }, fitSettleBox = fitSettleBoxSig(), scheduleFitSettleRefit(600);
        }
        function armFitSettleRefit() {
            if (fitSettleActive) return;
            fitSettleUserHold = !1, fitSettleSnap = { s: $p, x: Ep, y: Ap }, fitSettleBox = fitSettleBoxSig(), fitSettleChecks = 0, scheduleFitSettleRefit(1200);
        }
        function sxFitFrame() {
            const e = nh, t = pr.centerX, n = pr.centerY;
            let i = t - pr.centerRadius, a = n - pr.centerRadius, r = t + pr.centerRadius, o = n + pr.centerRadius;
            const s = e => {
                if (e) try {
                    const t = e.getBBox();
                    if (!Number.isFinite(t.x) || !Number.isFinite(t.y) || t.width <= 0 || t.height <= 0) return;
                    i = Math.min(i, t.x), a = Math.min(a, t.y), r = Math.max(r, t.x + t.width), o = Math.max(o, t.y + t.height);
                } catch (e) { __sxErrLog("app", e); }
            }, l = Qi() ? Xi() : Mt && vt[Mt] ? [ Mt ] : [], c = l.length ? l.every(e => 0 === Object.keys(vt[e] || {}).length) : 0 === Object.keys(At).length;
            (In.querySelectorAll(".node-group:not(.is-hidden)").forEach(s), s(In.querySelector(".center-glance-rings")));
            /* Fit framing (Build 2026-10-17_2026): fit against the REAL visible region — the viewBox is square (3200x3200) but the map card usually is not, so the visible span in world units grows along the card's long axis; the old square assumption fitted wide maps as if the screen were only as wide as it is tall, leaving the map small with the center node dominating. Tighter padding/margin, and one shared scale cap for rated and unrated profiles (the unrated cap of 1 no longer holds the full map back). The Fit button and every opening/profile-change view call this same function, so both frame the full map the same way. Build 2026-10-18_0343: the rated-profile branch (category node groups only, looser padding, .12 scale floor) could open noticeably zoomed-in with outer topics off-screen, so framing now always accumulates every visible node group and uses the tighter padding and a 1e-9 floor for every profile. */
            const d = Math.max(pr.centerRadius, t - i, r - t) + 20, u = Math.max(pr.centerRadius, n - a, o - n) + 20, p = innerWidth <= 620 ? 90 : 44, sw = Cn && Cn.clientWidth ? Cn.clientWidth : innerWidth, sh = Cn && Cn.clientHeight ? Cn.clientHeight : innerHeight, asp = sw > 0 && sh > 0 ? sw / sh : 1, hw = e.width / 2 * Math.max(1, asp), hh = e.height / 2 * Math.max(1, 1 / asp), g = Math.min((hw - p) / d, (hh - p) / u), m = innerWidth <= 620 ? 2.18 : 2.3, scale = Math.max(1e-9, Math.min(m, g));
            return {
                scale: scale,
                x: e.x + e.width / 2 - t * scale,
                y: e.y + e.height / 2 - n * scale,
                empty: c
            };
        }
        function Ih() {
            const f = sxFitFrame();
            $p = f.scale, Ep = f.x, Ap = f.y, $h(), armFitSettleRefit();
        }
        function Ph(e, t, n) {
            if (!Number.isFinite(e) || !Number.isFinite(t) || !Number.isFinite(n)) return;
            noteFitUserCamera();
            try {
                if (typeof fitSettleTimer !== "undefined" && fitSettleTimer) {
                    clearTimeout(fitSettleTimer);
                    fitSettleTimer = 0;
                }
            } catch (_) {}
            const i = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (!Bt || i) {
                uh(), dh(), $p = e, Ep = t, Ap = n, $h();
                return;
            }
            if (Xp) { cancelAnimationFrame(Xp); Xp = 0; }
            uh(), dh();
            Gp && xh();
            const a = Ep, r = Ap, o = $p, s = performance.now();
            const duration = 720;
            Cn.classList.add("is-camera-moving");
            const l = c => {
                const progress = Math.max(0, Math.min(1, (c - s) / duration));
                // Cubic ease-in-out curve
                const u = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                $p = o + (e - o) * u;
                Ep = a + (t - a) * u;
                Ap = r + (n - r) * u;
                Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`);
                wh();
                wr();
                if (progress < 1) {
                    Xp = requestAnimationFrame(l);
                } else {
                    Xp = 0;
                    $p = e;
                    Ep = t;
                    Ap = n;
                    noteFitUserCamera();
                    kh();
                }
            };
            Xp = requestAnimationFrame(l);
        }
        window.__sxStopFocusZoom = () => {
            if (Xp) cancelAnimationFrame(Xp), Xp = 0;
            Cn && Cn.classList.remove("is-camera-moving");
        };
        window.__sxCancelNodeTap = () => {
            if (sxPendingNodeTapTimer) {
                try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                sxPendingNodeTapTimer = null;
            }
            sxLastDoubleTime = performance.now();
        };
        function Lh(e) {
            const cat = h.find(c => c.name === e || c.id === e || catId(c.name) === e || sxName(c.name) === sxName(e));
            if (cat) {
                return void Th(cat.id, cat.name);
            }
            Ih();
        }
        function Th(e, t) {
            const rawId = String(e || "").trim();
            const rawBranch = String(t || "").trim();
            const migrated = typeof migrateNodeKey === "function" ? migrateNodeKey(rawId) : rawId;
            const slug = rawId.toLowerCase().replace(/^(cat|subcategory)-/, "").replace(/[^a-z0-9]+/g, "-");

            // 1. Resolve Category
            const cat = h.find(c => {
                if (c.id === rawId || c.id === migrated) return true;
                if (c.name === rawBranch || c.name === rawId) return true;
                if (c.name.toLowerCase() === rawBranch.toLowerCase() || c.name.toLowerCase() === rawId.toLowerCase()) return true;
                const cSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return cSlug === slug;
            }) || null;

            // 2. Resolve Subcategory
            let sub = null;
            if (!cat) {
                for (const c of h) {
                    for (const s of (c.subcategories || [])) {
                        if (s.id === rawId || s.id === migrated) { sub = { cat: c, sub: s }; break; }
                        if (s.name === rawId || s.name.toLowerCase() === rawId.toLowerCase()) { sub = { cat: c, sub: s }; break; }
                        const sSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                        if (sSlug === slug || slug.endsWith(sSlug)) { sub = { cat: c, sub: s }; break; }
                    }
                    if (sub) break;
                }
            }

            let sid = cat ? cat.id : (sub ? sub.sub.id : migrated);
            const rec = qn[sid] || Xn(sid) || qn[rawId] || Xn(rawId) || null;
            let isCat = Boolean(cat) || isCatId(sid);
            let isSub = Boolean(sub) || isSubId(sid);

            // If a leaf topic node was passed, resolve to its parent subcategory or category
            if (!isCat && !isSub && rec) {
                if (rec.parentId) {
                    const pRec = qn[rec.parentId] || Xn(rec.parentId);
                    if (pRec && (pRec.kind === "Subcategory" || isSubId(rec.parentId))) {
                        return void Th(rec.parentId, rec.branch);
                    }
                }
                if (rec.branch) {
                    const cMatch = h.find(c => c.name === rec.branch || sxName(c.name) === sxName(rec.branch));
                    if (cMatch) {
                        return void Th(cMatch.id, cMatch.name);
                    }
                }
            }

            const branchName = cat ? cat.name : (sub ? sub.cat.name : (rawBranch || (rec && rec.branch) || ci(sid) || ""));
            const catSlug = cat ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "";
            const subSlug = sub ? sub.sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "";

            // Auto-expand if currently collapsed so the children are rendered
            if (isCat && branchName && !rn.has(branchName)) {
                rn.add(branchName);
                Mr();
                const runner = () => Th(cat ? cat.id : sid, branchName);
                if (window.sxPaintPromise) window.sxPaintPromise.then(() => requestAnimationFrame(runner));
                else window.setTimeout(runner, 80);
                return;
            }
            if (isSub && branchName && (!rn.has(branchName) || !on.has(sid))) {
                rn.add(branchName);
                on.add(sid);
                Mr();
                const runner = () => Th(sid, branchName);
                if (window.sxPaintPromise) window.sxPaintPromise.then(() => requestAnimationFrame(runner));
                else window.setTimeout(runner, 80);
                return;
            }

            // Find the anchor node DOM element (tip where icon and category/subcategory label are displayed)
            let anchorEl = null;
            if (isCat && cat) {
                anchorEl = In.querySelector(`.node-group[data-layout-key="cat-${CSS.escape(catSlug)}"]`) ||
                           In.querySelector(`.node-group[data-layout-key="${CSS.escape(cat.id)}"]`) ||
                           In.querySelector(`.node-group[data-layout-key*="${CSS.escape(catSlug)}"]`) ||
                           In.querySelector(`.node-group[data-layout-key="${CSS.escape(sid)}"]`) ||
                           Array.from(In.querySelectorAll(".node-group.gen1-line-group")).find(el => {
                               const txt = el.querySelector(".category-label")?.textContent?.trim();
                               return txt && (txt === cat.name || sxName(txt) === sxName(cat.name));
                           });
            } else if (isSub && sub) {
                anchorEl = In.querySelector(`.node-group[data-layout-key="${CSS.escape(sub.sub.id)}"]`) ||
                           In.querySelector(`.node-group[data-layout-key*="${CSS.escape(subSlug)}"]`) ||
                           In.querySelector(`.node-group.subcategory-node[data-layout-key="${CSS.escape(sub.sub.id)}"]`);
            } else {
                anchorEl = In.querySelector(`.node-group[data-layout-key="${CSS.escape(sid)}"]`) ||
                           In.querySelector(`[data-layout-key="${CSS.escape(sid)}"]`);
            }

            // Gather the child fan nodes belonging to this category/subcategory
            const childEls = Array.from(In.querySelectorAll(".node-group[data-layout-key]:not(.is-hidden)")).filter(node => {
                if (anchorEl && node === anchorEl) return false;
                let k = node.dataset.layoutKey;
                if (!k) return false;
                if (isCat && cat) {
                    if (k === cat.id || k === `cat-${catSlug}` || k.includes(catSlug)) return false;
                    if (node.classList.contains("gen1-line-group")) return false;
                    const nodeBranch = ci(k);
                    if (nodeBranch === cat.name || sxName(nodeBranch) === sxName(cat.name)) return true;
                    const item = qn[k] || Xn(k);
                    if (item && (item.branch === cat.name || sxName(item.branch) === sxName(cat.name))) return true;
                    return false;
                }
                if (isSub && sub) {
                    if (k === sub.sub.id) return false;
                    const item = qn[k] || Xn(k);
                    return (item?.parentId === sub.sub.id || item?.subcategoryId === sub.sub.id || item?.subId === sub.sub.id);
                }
                return false;
            });

            // If children haven't painted yet, wait for paint promise or schedule next frame
            if (isCat && childEls.length === 0) {
                if (window.sxPaintPromise) {
                    window.sxPaintPromise.then(() => requestAnimationFrame(() => Th(cat ? cat.id : sid, branchName)));
                    return;
                }
                if (!window.__thRetry || window.__thRetry < 8) {
                    window.__thRetry = (window.__thRetry || 0) + 1;
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        Th(cat ? cat.id : sid, branchName);
                    }));
                    return;
                }
            }
            window.__thRetry = 0;

            // Anchor center coordinates (hub point where spokes originate)
            let anchorX = anchorEl ? Number(anchorEl.dataset.layoutX) : NaN;
            let anchorY = anchorEl ? Number(anchorEl.dataset.layoutY) : NaN;
            if ((!Number.isFinite(anchorX) || !Number.isFinite(anchorY)) && anchorEl) {
                const icon = anchorEl.querySelector(".branch-icon, .topic-icon");
                if (icon) {
                    try {
                        const b = icon.getBBox();
                        anchorX = b.x + b.width / 2;
                        anchorY = b.y + b.height / 2;
                    } catch (_) {}
                }
            }
            if ((!Number.isFinite(anchorX) || !Number.isFinite(anchorY)) && cat) {
                const cIdx = h.findIndex(c => c.name === cat.name);
                const nAng = sn.get(cat.name) ?? function(e) {
                    const t = h[e], n = t && branchOrderRankMap().has(t.name) ? branchOrderRankMap().get(t.name) : e;
                    return -Math.PI / 2 + n / h.length * Math.PI * 2;
                }(cIdx);
                const pt = Xa(nAng, (typeof yr === "function" ? yr(cat) : 1200) || 1200);
                anchorX = pt.x;
                anchorY = pt.y;
            }

            // Fit the subcategory hubs and the topic clusters that sit on
            // them. Farther leaves, and a spoke's getBBox back to the map
            // center, stretch the box until the fan is clipped against the
            // card edge. 70k is just past one topic cluster; measured from
            // the hub-to-subcategory gaps in this layout.
            let framedEls = childEls;
            if (isCat && Number.isFinite(anchorX) && Number.isFinite(anchorY)) {
                const hubs = childEls.filter(el => el.classList.contains("subcategory-node")).map(el => ({
                    x: Number(el.dataset.layoutX),
                    y: Number(el.dataset.layoutY)
                })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
                if (hubs.length) {
                    const near = childEls.filter(el => {
                        const x = Number(el.dataset.layoutX), y = Number(el.dataset.layoutY);
                        if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
                        if (Math.hypot(x - anchorX, y - anchorY) <= 80000) return true;
                        return hubs.some(h => Math.hypot(x - h.x, y - h.y) <= 70000);
                    });
                    if (near.length) framedEls = near;
                }
            }

            // Collect all points: the selected branch/subcategory anchor icon + all child icons
            const points = [];
            if (Number.isFinite(anchorX) && Number.isFinite(anchorY)) {
                points.push({ x: anchorX, y: anchorY, isAnchor: true });
            }

            framedEls.forEach(el => {
                const lx = Number(el.dataset.layoutX), ly = Number(el.dataset.layoutY);
                if (Number.isFinite(lx) && Number.isFinite(ly)) points.push({ x: lx, y: ly, isAnchor: false });
            });

            if (points.length > 0) {
                // A category fan is one-sided: children sit outward from the
                // hub, away from the map center. A circle centered on the hub
                // spends half the card on empty inward space and clips the
                // fan against the far edge. Frame the bounding box of the hub
                // and its own icons and labels instead, and center that box.
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                const add = (x, y) => {
                    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                };
                points.forEach(pt => add(pt.x, pt.y));
                const labelNodes = anchorEl ? framedEls.concat(anchorEl) : framedEls;
                labelNodes.forEach(el => {
                    add(Number(el.dataset.layoutX), Number(el.dataset.layoutY));
                    add(Number(el.dataset.labelX), Number(el.dataset.labelY));
                });
                if (!Number.isFinite(minX)) return void (branchName && Lh(branchName));
                const spanX = Math.max(0, maxX - minX), spanY = Math.max(0, maxY - minY);
                const padX = Math.max(3600, spanX * 0.14);
                const padY = Math.max(3600, spanY * 0.14);
                minX -= padX;
                maxX += padX;
                minY -= padY;
                maxY += padY;
                const bw = Math.max(6400, maxX - minX);
                const bh = Math.max(6400, maxY - minY);
                const cx = (minX + maxX) / 2;
                const cy = (minY + maxY) / 2;
                // preserveAspectRatio is meet, so the whole viewBox is on
                // screen. Do not widen the fit by the card's aspect: that
                // pushes the fan past the viewBox edge.
                const vb = Cn.viewBox && Cn.viewBox.baseVal && Cn.viewBox.baseVal.width > 0 ? Cn.viewBox.baseVal : nh;
                const fitScale = Math.min((vb.width * 0.86) / bw, (vb.height * 0.78) / bh);
                const targetScale = Math.max(1e-9, Math.min(2, fitScale));
                const tx = (vb.x + vb.width / 2) - cx * targetScale;
                const ty = (vb.y + vb.height / 2) - cy * targetScale;
                return void Ph(targetScale, tx, ty);
            }

            if (branchName) return void Lh(branchName);
        }
        window.__sxFocusNode = Th;
        window.__sxFocusBranch = Lh;
        window.__sxPanZoomCamera = Ph;
        let Fh = 0, Nh = 0, _h = 0, Dh = 0, Rh = 0, Oh = !1, Bh = null, jh = null;
        const sxWheelProb = { dir: 0, acc: 0, n: 0, t: 0 };
        function qh() {
            Bh && Fs.visibleFor(Bh) && Fs.hide(), Bh = null, jh = null;
        }
        function Hh(e) {
            const t = e.dataset.id, n = e.dataset.direction, i = qn[t] || Xn(t) || (at[Vi()] || {})[t], a = da(t, Vi()), r = Boolean(a?.[n + "Known"]) ? ba(a[n]) : "Unrated";
            return {
                name: i?.label || "Rating",
                definition: e.dataset.ratingTooltip || ei(t, n) || Jn(t, n),
                value: r
            };
        }
        function Wh(e = Bh, t = jh) {
            if (!e || !Fs.visibleFor(e)) return;
            Fs.show(e, {
                ...Hh(e),
                point: t
            });
            const n = e.querySelector(".slider-thumb.active-rating") || e.querySelector(".direction-tag-bg") || e;
            Fs.position(t, n);
        }
        function Uh(e, t = !1, n = null) {
            e ? (Bh = e, jh = n, Fs.show(e, {
                ...Hh(e),
                point: n,
                autoHide: t
            }), Wh(e, n)) : qh();
        }
        function Gh(e) {
            if (!e || !e.closest) return null;
            const t = __sxClosestAction(e, "ratingHitAny");
            return t && __sxClosestAction(t, "directionControl");
        }
        let sxLastNodeTapTime = 0, sxLastNodeTapId = null, sxLastNodeTapX = 0, sxLastNodeTapY = 0, sxPendingNodeTapTimer = null, sxSingleTapTimeout = 0, sxLastDoubleTime = 0;
        function Kh(e) {
            if (eh.delete(e.pointerId), Cp = !1, qp = null, io(), Gp && xh(), Pp && Pp.pointerId === e.pointerId) {
                const t = Pp;
                return Pp = null, void ("pointerup" === e.type && Fo(t.id, t.direction));
            }
            if (Sq && Sq.pointerId === e.pointerId) {
                // Empty-space tap = deselect (Build 2026-10-19_0543): the
                // pointerdown fallback armed Sq only when the press hit no
                // node, control, or label, so a release within 10px is a
                // tap on empty map — clear the spoke selection through
                // the shared clear path (clearSpokeSelection: Lt/Nt,
                // a search dim, relation emphasis, marking removal,
                // no re-render) and
                // tell the Layout Editor so its selects follow. A drag
                // (pan) or a second finger disarms Sq without deselecting.
                const t = Sq;
                if (Sq = null, "pointerup" === e.type && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 10 && clearSpokeSelection()) (() => {
                    try {
                        window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.clearSelection && window.__SEXCAPADES_LAYOUT_UI.clearSelection();
                    } catch (err) {
                        __sxErrLog("layout-deselect", err);
                    }
                })();
            }
            if (Lp && Lp.pointerId === e.pointerId) {
                const t = Lp;
                return Lp = null, void ("pointerup" === e.type && vi(t.id));
            }
            if (Tp && Tp.pointerId === e.pointerId) {
                const t = Tp;
                return Tp = null, void ("pointerup" === e.type && Fc(t.index, t.target));
            }
            if (Fp && Fp.pointerId === e.pointerId) {
                const t = Fp;
                // Center disc tap (owner ruling, 2026-10-27): a tap
                // opens the profile's About/details dialog (sh, the
                // same opener the long-press has always used). It no
                // longer calls Oi/Ci, so a tap never toggles the
                // map's expand/collapse state. The collapse/restore
                // behavior itself (Ci/Ei) is NOT removed — it stays
                // wired to the center card's Expand/collapse button.
                return Fp = null, oh(), Dp = performance.now(), void ("pointerup" !== e.type || t.longPressed || sh());
            }
            if (yn && yn.pointerId === e.pointerId) return "pointerup" === e.type && kr(yn, Sr(yn, e.clientX, e.clientY)), 
            void xr(!0);
            if (eo && eo.pointerId === e.pointerId) {
                const n = eo;
                eo = null;
                to = !0;
                if (sxSingleTapTimeout) {
                    try { window.clearTimeout(sxSingleTapTimeout); } catch (_) {}
                }
                sxSingleTapTimeout = window.setTimeout(() => {
                    to = !1;
                }, 450);
                if (n.longPressed) return;

                const now = performance.now();
                const timeDiff = now - sxLastNodeTapTime;
                const dist = Math.hypot(e.clientX - sxLastNodeTapX, e.clientY - sxLastNodeTapY);
                let rawSid = String(n.id || "");
                if (rawSid.startsWith("cat-")) rawSid = rawSid.slice(4);
                if (rawSid.startsWith("subcategory-")) rawSid = rawSid.slice(12);
                const sid = rawSid;
                const rec = qn[sid] || Xn(sid);
                const cat = h.find(c => c.name === sid || c.id === sid || catId(c.name) === sid || sxName(c.name) === sxName(sid));
                const isCat = Boolean(cat) || isCatId(sid) || (rec && rec.kind === "Category") || (sid.startsWith("c") && sid.length <= 5);
                const isSub = isSubId(sid) || (rec && rec.kind === "Subcategory") || (sid.startsWith("s") && sid.length <= 5);
                const isKnownNode = isCat || isSub || Boolean(rec);
                const branch = cat ? cat.name : ((rec && rec.branch) || ci(sid) || "");

                const isDouble = (e.detail >= 2) || (timeDiff < 520 && dist < 60 && sxLastNodeTapId === sid);

                if ((isKnownNode || sid) && isDouble) {
                    // A second tap zooms the branch so its names can be read.
                    // It does not rate the topic and it does not open the sheet.
                    if (sxPendingNodeTapTimer) {
                        try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                        sxPendingNodeTapTimer = null;
                    }
                    io();
                    sxLastNodeTapTime = 0;
                    sxLastNodeTapId = null;
                    sxLastDoubleTime = now;

                    try {
                        const mm = document.getElementById("markMenu");
                        if (mm) mm.hidden = true;
                        const dlgs = document.querySelectorAll("dialog[open]");
                        dlgs.forEach(d => { try { d.close(); } catch (_) { d.removeAttribute("open"); } });
                    } catch (_) {}

                    const zoomId = !isCat && !isSub && rec && rec.parentId ? rec.parentId : sid;
                    if (isCat && branch && !rn.has(branch)) rn.add(branch);
                    if (isSub && zoomId && branch && (!rn.has(branch) || !on.has(zoomId))) {
                        rn.add(branch);
                        on.add(zoomId);
                    }
                    const runner = () => Th(zoomId, branch);
                    if (window.sxPaintPromise) window.sxPaintPromise.then(() => requestAnimationFrame(runner));
                    else requestAnimationFrame(runner);
                    return;
                }

                sxLastNodeTapTime = now;
                sxLastNodeTapId = sid;
                sxLastNodeTapX = e.clientX;
                sxLastNodeTapY = e.clientY;

                if (sxPendingNodeTapTimer) {
                    try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                    sxPendingNodeTapTimer = null;
                }
                // Wait out the double-click window. Opening the sheet or
                // rating on the first tap stole the second tap, so a
                // double-click never reached the branch zoom.
                sxPendingNodeTapTimer = window.setTimeout(() => {
                    sxPendingNodeTapTimer = null;
                    if (sxLastDoubleTime && performance.now() - sxLastDoubleTime < 520) return;
                    if ("pointerup" !== e.type) return;
                    if (isCat || isSub) {
                        n.spoke ? selectSpokeNode(n.id, !0) : $i(n.id);
                        return;
                    }
                    n.spoke ? selectSpokeNode(n.id, !0) : (selectSpokeNode(n.id, !0), typeof xo === "function" && xo(n.id, e.clientX, e.clientY));
                }, 280);
                return;
            }
            if (Ip && Ip.pointerId === e.pointerId) {
                const t = Ip;
                if (Ip = null, "pointerup" === e.type && t.dragged) {
                    const profileId = Vi(), previousRatedCount = cs(profileId).rated, n = _o(t.el, No(t.el, e.clientX, e.clientY, !0));
                    Number.isNaN(n) ? (Fo(t.id, t.direction, !1), Nt = null, Mr()) : null === n ? (Nt = {
                        id: t.id,
                        direction: t.direction
                    }, Mr()) : (To(t.id, t.direction, n, !1), Nt = null, Mr()), checkMilestoneTransition(profileId, previousRatedCount);
                } else "pointerup" === e.type && t.longPressed, Nt = {
                    id: t.id,
                    direction: t.direction
                }, Mr(), "mouse" !== e.pointerType && function(e, t, n) {
                    requestAnimationFrame(() => {
                        const i = In.querySelector(`.direction-control[data-id="${CSS.escape(e)}"][data-direction="${CSS.escape(t)}"]`);
                        i && Uh(i, !0, n);
                    });
                }(t.id, t.direction, Ts(e));
                return;
            }
            if (Mp && Mp.pointerId === e.pointerId) {
                const t = Mp;
                if (Mp = null, "pointerup" === e.type) {
                    const profileId = Vi(), previousRatedCount = cs(profileId).rated, n = _o(t.el, No(t.el, e.clientX, e.clientY));
                    Number.isNaN(n) ? Fo(t.id, t.direction, !1) : null !== n && To(t.id, t.direction, n, !1), 
                    Nt = null, Mr(), checkMilestoneTransition(profileId, previousRatedCount);
                } else Nt = null, Mr();
            }
        }
        Cn.addEventListener("pointerover", e => {
            if ("mouse" !== e.pointerType) return;
            const t = Gh(e.target);
            t && Uh(t, !1, Ts(e));
        }), Cn.addEventListener("pointermove", e => {
            Bh && Fs.visibleFor(Bh) && (Gh(e.target) === Bh || "mouse" !== e.pointerType && (Ip || Mp)) && (jh = Ts(e), 
            Wh());
        }), Cn.addEventListener("pointerout", e => {
            if ("mouse" !== e.pointerType) return;
            if (!Gh(e.target)) return;
            const t = Gh(e.relatedTarget);
            t ? Uh(t, !1, Ts(e)) : qh();
        }), Cn.addEventListener("focusin", e => {
            const t = Gh(e.target);
            t && Uh(t);
        }), Cn.addEventListener("focusout", e => {
            if (!__sxClosestAction(e.target, "directionControl")) return;
            const t = Gh(e.relatedTarget);
            t ? Uh(t) : qh();
        }), Cn.addEventListener("wheel", e => {
            e.preventDefault();
            if (mn.staticMap) return;
            const t = performance.now(), n = t - Nh, i = 1 === e.deltaMode ? 16 : 2 === e.deltaMode ? 320 : 1, a = e.deltaY * i, r = Math.sign(a), o = Math.abs(a);
            if (!r) return;
            const s = !Fh || n > 180;
            const sxMagnitudeGenuine = o > Math.max(14, 1.35 * Dh);
            if ((0 !== _h || Oh) && 0 !== Fh && r !== Fh && !sxMagnitudeGenuine) {
                if (sxWheelProb.dir !== r || t - sxWheelProb.t > 300) { sxWheelProb.dir = r; sxWheelProb.acc = 0; sxWheelProb.n = 0; }
                sxWheelProb.acc += o; sxWheelProb.n += 1; sxWheelProb.t = t;
                if (sxWheelProb.n < 3 && sxWheelProb.acc < 30) { return Nh = t, void (Dh = o); }
                sxWheelProb.dir = 0; sxWheelProb.acc = 0; sxWheelProb.n = 0;
                Fh = r; _h = 0; Rh = 0; Oh = !1;
            }
            s && (Fh = r, _h = 0, Rh = 0, Oh = !1);
            const l = r !== Fh && (n > 105 || o > Math.max(14, 1.35 * Dh));
            if (r !== Fh && !l) return Nh = t, void (Dh = o);
            if (l && (Fh = r, _h = 0, Rh = 0, Oh = !1), !s && r === Fh && o < .82 * Dh && n < 38 ? Rh++ : Rh = 0, 
            Nh = t, Dh = o, Rh >= 4 && (Oh = !0), _h === r || Oh) return;
            const c = Eh(), d = Math.max(-48, Math.min(48, a)), u = $p * Math.exp(.0035 * -d);
            if (u < $p && $p <= 1e-9) return void (_h = r);
            const p = Math.max(1e-9, Math.min(c, u));
            if (Math.abs(p - $p) < 1e-5 * Math.min(1, $p * 1e3)) return void (_h = r);
            const h = lh(e.clientX, e.clientY), g = $p;
            noteFitUserCamera(), $p = p, Ep = h.x - (h.x - Ep) * ($p / g), Ap = h.y - (h.y - Ap) * ($p / g), function() {
                if (uh(), "gpu" !== Kp) return bh(), void Sh();
                Gp || (fh = yh()), Gp = !0, Cn.classList.add("is-camera-moving");
                const e = yh();
                e && Cn.style.setProperty("--camera-steady-stroke", la(e));
                let t = ch();
                gh(t) && (hh(), t = ch()), Mn.style.transform = `matrix(${t.ratio},0,0,${t.ratio},${t.dx},${t.dy})`, 
                Sh();
            }();
        }, {
            passive: !1
        }), Cn.addEventListener("pointerdown", e => {
            if (mn.staticMap) return;
            __sxInvalidateCtm(), Gp && xh(), eh.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            });
            const n = __sxClosestAction(e.target, "centerHit"), i = __sxClosestAction(e.target, "centerGlanceRingHit"), a = __sxClosestAction(e.target, "hiddenCountBadge") || function(e, t) {
                const n = Cn.createSVGPoint();
                n.x = e, n.y = t;
                const i = Array.from(In.querySelectorAll(".hidden-count-badge"));
                for (let t = i.length - 1; t >= 0; t--) {
                    const a = i[t], r = a.querySelector("rect"), o = r && __sxScreenCtm(r);
                    if (r && o && !__sxClosestAction(a, "hiddenState")) try {
                        const e = n.matrixTransform(o.inverse()), t = Number(r.getAttribute("x")) || 0, i = Number(r.getAttribute("y")) || 0, s = Number(r.getAttribute("width")) || 0, l = Number(r.getAttribute("height")) || 0;
                        if (e.x >= t && e.x <= t + s && e.y >= i && e.y <= i + l) return a;
                    } catch (e) { __sxErrLog("matrix-inverse", e); }
                }
                return null;
            }(e.clientX, e.clientY), r = __sxClosestAction(e.target, "directionHit"), o = (__sxClosestAction(e.target, "curveEditHandle"), 
            __sxClosestAction(e.target, "conceptHit")), s = __sxClosestAction(e.target, "mapLabelHit") || e.target.closest && e.target.closest(".concept-path,.tapered-stem,.hanky-midline,.spoke-underlay-item,.subcategory-node"), l = __sxClosestAction(e.target, "ratingTrackHit"), c = __sxClosestAction(e.target, "ratingClearHit"), d = e => Boolean(e && Nt && e.dataset.id === Nt.id && e.dataset.direction === Nt.direction);
            if (a && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            void (Lp = {
                pointerId: e.pointerId,
                id: a.dataset.id,
                startX: e.clientX,
                startY: e.clientY
            });
            if (Nt && !d(r) && !d(l) && !d(c)) return e.preventDefault(), e.stopPropagation(), 
            eh.delete(e.pointerId), Nt = null, void Mr();
            if (i && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            void (Tp = {
                pointerId: e.pointerId,
                index: Number(i.dataset.centerGlanceIndex),
                target: i,
                startX: e.clientX,
                startY: e.clientY
            });
            if (c && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            void (Pp = {
                pointerId: e.pointerId,
                id: c.dataset.id,
                direction: c.dataset.direction,
                startX: e.clientX,
                startY: e.clientY
            });
            if (n && 1 === eh.size) {
                if ("touch" === e.pointerType) return;
                return e.preventDefault(), e.stopPropagation(), rh(e.pointerId), Fp = {
                    pointerId: e.pointerId,
                    startX: e.clientX,
                    startY: e.clientY,
                    longPressed: !1
                }, oh(), void (_p = t.setTimeout(() => {
                    Fp && Fp.pointerId === e.pointerId && (Fp.longPressed = !0, sh());
                }, 520));
            }
            if (r && 1 === eh.size) {
                const sxTapNow = performance.now(), sxTapDist = Math.hypot(e.clientX - sxLastNodeTapX, e.clientY - sxLastNodeTapY);
                if (e.detail >= 2 || sxLastNodeTapId === r.dataset.id && sxTapNow - sxLastNodeTapTime < 520 && sxTapDist < 60) {
                    e.preventDefault(), e.stopPropagation(), rh(e.pointerId);
                    eo = {
                        pointerId: e.pointerId,
                        id: r.dataset.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        spoke: !1,
                        longPressed: !1
                    };
                    return;
                }
                e.preventDefault(), e.stopPropagation();
                const n = r.dataset.id, i = r.dataset.direction;
                if ("mouse" !== e.pointerType && Uh(__sxClosestAction(r, "directionControl"), !0, Ts(e)), 
                Nt && (Nt.id !== n || Nt.direction !== i)) return;
                return rh(e.pointerId), Ip = {
                    pointerId: e.pointerId,
                    el: r,
                    id: n,
                    direction: i,
                    startX: e.clientX,
                    startY: e.clientY,
                    dragged: !1,
                    longPressed: !1,
                    value: null
                }, In.querySelectorAll(".active-rating").forEach(e => e.classList.remove("active-rating")), 
                Nt = {
                    id: n,
                    direction: i
                }, _o(r, null), io(), void (Jr = t.setTimeout(() => {
                    Ip && Ip.pointerId === e.pointerId && !Ip.dragged && (Ip.longPressed = !0, Nt = {
                        id: Ip.id,
                        direction: Ip.direction
                    }, _o(Ip.el, null));
                }, 420));
            }
            if (s && 1 === eh.size) {
                const n = s.dataset.id || s.dataset.topicId || s.dataset.spokeFor || __sxClosestAction(s, "nodeGroup")?.dataset.layoutKey;
                e.preventDefault(), e.stopPropagation(), rh(e.pointerId);
                const i = Cn.createSVGPoint();
                i.x = e.clientX, i.y = e.clientY;
                const a = i.matrixTransform(__sxScreenCtm(In).inverse());
                return eo = {
                    pointerId: e.pointerId,
                    id: n,
                    startX: e.clientX,
                    startY: e.clientY,
                    startLocalX: a.x,
                    startLocalY: a.y,
                    startBend: Number(bt[n]) || 0,
                    curveLine: Boolean(!1),
                    spoke: s.classList.contains("concept-hit") || s.classList.contains("topic-stem") || s.classList.contains("category-icon-hit"),
                    curveNx: Number(o && o.dataset.nx) || 0,
                    curveNy: Number(o && o.dataset.ny) || 0,
                    longPressed: !1
                }, io(), void (Jr = t.setTimeout(() => {
                    eo && eo.pointerId === e.pointerId && (eo.longPressed = !0, to = !0, xo(n, eo.startX, eo.startY, { focusNote: !0 }));
                }, 520));
            }
            return l && 1 === eh.size ? (e.preventDefault(), e.stopPropagation(), rh(e.pointerId), 
            Nt = {
                id: l.dataset.id,
                direction: l.dataset.direction
            }, void (Mp = {
                pointerId: e.pointerId,
                el: l,
                id: l.dataset.id,
                direction: l.dataset.direction,
                value: _o(l, No(l, e.clientX, e.clientY))
            })) : (Gp || (fh = yh()), rh(e.pointerId), eh.size >= 2 ? (io(), oh(), Mp = null, 
            Ip = null, Pp = null, Lp = null, Tp = null, eo = null, Fp = null, Sq = null, yn && xr(!0), 
            void Mh()) : void (__sxClosestAction(e.target, "categoryLabel") || (Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }, Sq = {
                pointerId: e.pointerId,
                x: e.clientX,
                y: e.clientY
            })));
        }), Cn.addEventListener("pointermove", e => {
            if (!eh.has(e.pointerId)) return;
            if (eh.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), eh.size >= 2) {
                Mp = null, Pp = null, Lp = null, qp || Mh();
                const e = Ch();
                if (!qp || !e) return;
                return noteFitUserCamera(), $p = Math.max(1e-9, Math.min(Eh(), qp.scale * (e.distance / qp.distance))), 
                Ep = e.cx - qp.contentX * $p, Ap = e.cy - qp.contentY * $p, void bh();
            }
            if (Pp && Pp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Pp.startX, e.clientY - Pp.startY) >= 10 && (Pp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Lp && Lp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Lp.startX, e.clientY - Lp.startY) >= 10 && (Lp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Tp && Tp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Tp.startX, e.clientY - Tp.startY) >= 10 && (Tp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Fp && Fp.pointerId === e.pointerId) {
                if (Math.hypot(e.clientX - Fp.startX, e.clientY - Fp.startY) >= 16) {
                    if (oh(), Fp.longPressed) return void (Fp = null);
                    Fp = null, Cp = !0, jp = {
                        x: e.clientX,
                        y: e.clientY
                    };
                }
                return;
            }
            if (yn && yn.pointerId === e.pointerId) return void kr(yn, Sr(yn, e.clientX, e.clientY));
            if (Ip && Ip.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Ip.startX, e.clientY - Ip.startY) >= 10 && (io(), 
            Ip = null, Nt = null, In.querySelectorAll(".active-rating").forEach(e => e.classList.remove("active-rating")), 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (eo && eo.pointerId === e.pointerId) {
                if (eo.longPressed) return;
                return void (Math.hypot(e.clientX - eo.startX, e.clientY - eo.startY) >= 10 && (io(), 
                eo = null, Cp = !0, jp = {
                    x: e.clientX,
                    y: e.clientY
                }));
            }
            if (Mp && Mp.pointerId === e.pointerId) return void (Mp.value = _o(Mp.el, No(Mp.el, e.clientX, e.clientY)));
            if (!Cp) return;
            const t = Mn.parentElement.getBoundingClientRect();
            noteFitUserCamera(), Ep += (e.clientX - jp.x) * (1800 / t.width), Ap += (e.clientY - jp.y) * (1240 / t.height), 
            jp = {
                x: e.clientX,
                y: e.clientY
            }, bh();
        }), Cn.addEventListener("pointerup", Kh), Cn.addEventListener("pointercancel", Kh), 
        /* Build 2026-10-18_1305: viewport lockup fix. Kh was only registered on the map SVG, so a pointerup/pointercancel delivered anywhere else never cleaned up the gesture state — the pointer stayed in the active-pointer map (eh) forever, every later press read as a phantom extra finger (all tap branches require exactly one active pointer, and pan is unreachable in the multi-pointer path), and only wheel zoom, which never consults eh, kept working. The exposed path: a touch long-press on the center node opens the modal About dialog (sh via Wi/showModal) while the finger is still down — the touch branch takes no pointer capture — so the release lands on the dialog, not the SVG. Rescue: window-level capture listeners run the same Kh cleanup whenever the map owns the pointer (tracked in eh or any gesture state) but the release lands outside the map; lostpointercapture on the SVG cleans up the same way if capture is lost mid-gesture. In-map releases are untouched (Cn.contains guard) and Kh is idempotent, so normal gestures behave exactly as before. */
        window.addEventListener("pointerup", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn ].some(t => t && t.pointerId === e.pointerId)) && !Cn.contains(e.target) && Kh(e);
        }, !0), window.addEventListener("pointercancel", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn ].some(t => t && t.pointerId === e.pointerId)) && !Cn.contains(e.target) && Kh(e);
        }, !0), Cn.addEventListener("lostpointercapture", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn ].some(t => t && t.pointerId === e.pointerId)) && Kh(e);
        }), Cn.addEventListener("touchstart", e => {
            if (mn.staticMap || 1 !== e.touches.length || !e.target.closest || !__sxClosestAction(e.target, "centerHit")) return;
            const n = e.touches[0];
            e.preventDefault(), e.stopPropagation(), Np = {
                identifier: n.identifier,
                startX: n.clientX,
                startY: n.clientY,
                moved: !1,
                longPressed: !1
            }, oh(), _p = t.setTimeout(() => {
                Np && Np.identifier === n.identifier && !Np.moved && (Np.longPressed = !0, sh());
            }, 520);
        }, {
            passive: !1
        }), Cn.addEventListener("touchmove", e => {
            if (!Np) return;
            const t = Array.from(e.touches).find(e => e.identifier === Np.identifier);
            t && (Math.hypot(t.clientX - Np.startX, t.clientY - Np.startY) >= 32 && (Np.moved = !0, 
            oh()), e.preventDefault(), e.stopPropagation());
        }, {
            passive: !1
        }), Cn.addEventListener("touchend", e => {
            if (!Np) return;
            const touchPoint = Array.from(e.changedTouches).find(e => e.identifier === Np.identifier), n = Np.longPressed, i = Boolean(touchPoint && !Np.moved && !n && Math.hypot(touchPoint.clientX - Np.startX, touchPoint.clientY - Np.startY) < 32);
            oh(), Np = null, Fp = null, eh.clear(), Cp = !1, e.preventDefault(), e.stopPropagation(), 
            n ? Dp = performance.now() : i && (Dp = performance.now(), function() {
                const e = performance.now();
                e - Op < 520 ? Rp += 1 : Rp = 1, Op = e, Bp && t.clear(Bp), 3 === Rp ? (Rp = 0, 
                window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.open()) : Bp = t.setTimeout(() => {
                    1 === Rp && sh(), Rp = 0, Bp = 0;
                }, 540);
            }());
        }, {
            passive: !1
        }), Cn.addEventListener("touchcancel", () => {
            oh(), Np = null, Fp = null, Tp = null, Pp = null, Lp = null, eh.clear(), Cp = !1, 
            Gp && xh();
        }, {
            passive: !0
        }), window.__sxOnPtr( e => {
            Bh && Fs.visibleFor(Bh) && !__sxClosestAction(e.target, "directionControl") && qh(), Nt && !Cn.contains(e.target) && (Nt = null, 
            Mr());
        }, !0);
        // Slider Escape close (repair #2, 2026-11-01, Jason's requirement,
        // second report: Escape still did not close the opened slider):
        // the first repair's handler listened in the bubble phase on
        // window and yielded whenever the event was already
        // defaultPrevented — any document or element handler that
        // consumed Escape first (menu, popover and tooltip handlers all
        // run earlier in the flow) silently vetoed the close, and it
        // also trusted Nt alone, so a slider left visible in the DOM
        // with Nt already cleared could never be closed. This handler
        // listens in the CAPTURE phase on window, so it runs before
        // every document and element handler; it treats a slider as
        // open when Nt is set OR the DOM still shows an active rating
        // rail / thumb / track-hit, and closing clears both the state
        // and the DOM classes before re-rendering. It still yields to
        // an open modal dialog and to text-entry targets, whose Escape
        // keeps its own meaning; nothing else can veto it.
        window.addEventListener("keydown", e => {
            if ("Escape" !== e.key) return;
            if (!Nt && !In.querySelector(".rating-rail.active-rating,.slider-thumb.active-rating,.rating-track-hit.active-rating")) return;
            const t = e.target;
            if (document.querySelector("dialog[open]") || t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""))) return;
            e.preventDefault(), e.stopPropagation(), Nt = null, Ip = null, Mp = null, In.querySelectorAll(".active-rating").forEach(el => el.classList.remove("active-rating")), Mr();
        }, !0);
        const zh = e.byId("mapHint"), Vh = __sxClosestAction(zh, "mapCard"), Yh = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        if (zh) zh.textContent = Yh ? "Pinch to zoom · Drag to pan" : "Scroll to zoom · Drag to pan";
        const Xh = () => {
            if (zh) zh.hidden = !0;
        };
        Vh && (Vh.addEventListener("pointerdown", Xh, {
            once: !0,
            capture: !0
        }), Vh.addEventListener("wheel", Xh, {
            once: !0,
            capture: !0
        }), Vh.addEventListener("keydown", Xh, {
            once: !0,
            capture: !0
        })), e.byId("mapZoomOut") && (e.byId("mapZoomOut").onclick = () => {
            mn.staticMap || Ah($p / 1.25);
        }), e.byId("mapZoomIn") && (e.byId("mapZoomIn").onclick = () => {
            mn.staticMap || Ah(1.25 * $p);
        }), e.byId("mapFit") && (e.byId("mapFit").onclick = () => {
            if (mn.staticMap) return;
            // Fit eases on the same machines that already ease a focus zoom:
            // reduced-motion, a coarse pointer, and a low-memory/low-core
            // device keep the instant frame. Opening and profile changes
            // still call Ih() and land in one step.
            const sxFitMotion = Bt && !kp && !xp;
            if (!sxFitMotion) return void Ih();
            const f = sxFitFrame();
            Ph(f.scale, f.x, f.y);
        });
        const Zh = e.byId("legendControl"), Qh = e.byId("legendButton"), Jh = e.byId("legendPopup"), eg = e.byId("legendPopupClose"), tg = e.one("[data-open-hanky-chart]"), ng = e.byId("hankyChartLightbox"), ig = e.byId("hankyChartClose"), ag = e.byId("hankyChartViewport"), rg = e.byId("hankyChartStage"), og = e.byId("hankyChartImage");
        let sg = !1, lg = 1, cg = null, dg = null, ug = "";
        const pg = new Map;
        function hg() {
            if (!Jh) return;
            const grp = Jh.querySelector('[data-legend-group="ratings"]');
            if (grp) grp.hidden = !1;
            Jh.querySelectorAll("[data-legend-entry]").forEach(e => {
                e.hidden = !1;
            });
            const emptyEl = e.byId("legendEmpty");
            if (emptyEl) emptyEl.hidden = !0;
        }
        function gg(e) {
            e && hg(), Jh.hidden = !e, Qh.setAttribute("aria-expanded", String(e));
        }
        function mg(e = {}) {
            sg = !1, gg(!1), e.focus && Qh.focus({
                preventScroll: !0
            });
        }
        function fg(e = !1, t = null) {
            const n = og.naturalWidth || 576, i = og.naturalHeight || 1024, a = ag.clientWidth, r = ag.clientHeight;
            if (!a || !r) return;
            const o = t ? t.viewX : a / 2, s = t ? t.viewY : r / 2, l = t ? t.contentX : e ? (ag.scrollLeft + a / 2) / Math.max(1, rg.scrollWidth) : .5, c = t ? t.contentY : e ? (ag.scrollTop + r / 2) / Math.max(1, rg.scrollHeight) : .5, d = Math.min(a / n, r / i), u = Math.max(1, Math.round(n * d * lg)), p = Math.max(1, Math.round(i * d * lg));
            rg.style.width = `${Math.max(a, u)}px`, rg.style.height = `${Math.max(r, p)}px`, 
            og.style.width = `${u}px`, og.style.height = `${p}px`, requestAnimationFrame(() => {
                ag.scrollLeft = Math.max(0, l * rg.scrollWidth - o), ag.scrollTop = Math.max(0, c * rg.scrollHeight - s);
            });
        }
        function yg(e, t = !0, n = null) {
            lg = Math.max(1, Math.min(4, e)), fg(t, n);
        }
        function bg(e = {}) {
            ng.hidden || (ng.hidden = !0, document.documentElement.style.overflow = ug, cg = null, 
            dg = null, pg.clear(), ag.classList.remove("is-dragging"), e.focus && tg.focus({
                preventScroll: !0
            }));
        }
        function vg() {
            const e = Array.from(pg.values());
            if (e.length < 2) return void (dg = null);
            const [t, n] = e, i = ag.getBoundingClientRect(), a = (t.x + n.x) / 2 - i.left, r = (t.y + n.y) / 2 - i.top;
            dg = {
                distance: Math.max(1, Math.hypot(t.x - n.x, t.y - n.y)),
                scale: lg,
                contentX: (ag.scrollLeft + a) / Math.max(1, rg.scrollWidth),
                contentY: (ag.scrollTop + r) / Math.max(1, rg.scrollHeight)
            }, cg = null, ag.classList.add("is-dragging");
        }
        Qh.addEventListener("click", e => {
            e.stopPropagation(), sg ? mg() : (sg = !0, gg(!0));
        }), eg.addEventListener("click", e => {
            e.stopPropagation(), mg({
                focus: !0
            });
        }), Jh.addEventListener("click", e => e.stopPropagation()), tg.addEventListener("click", function() {
            sg = !0, gg(!0), lg = 1.8, ug = document.documentElement.style.overflow, document.documentElement.style.overflow = "hidden", 
            ng.hidden = !1, requestAnimationFrame(() => {
                fg(), ig.focus({
                    preventScroll: !0
                });
            });
        }), ig.addEventListener("click", () => bg({
            focus: !0
        })), e.byId("hankyChartZoomOut") && e.byId("hankyChartZoomOut").addEventListener("click", () => yg(lg / 1.35)), 
        e.byId("hankyChartZoomIn") && e.byId("hankyChartZoomIn").addEventListener("click", () => yg(1.35 * lg)), e.byId("hankyChartFit") && e.byId("hankyChartFit").addEventListener("click", () => yg(1, !1)), 
        ng.addEventListener("click", e => {
            e.target === ng && bg({
                focus: !0
            });
        }), ag.addEventListener("pointerdown", e => {
            "mouse" === e.pointerType && 0 !== e.button || (ag.setPointerCapture(e.pointerId), 
            ag.classList.add("is-dragging"), "mouse" === e.pointerType ? cg = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                left: ag.scrollLeft,
                top: ag.scrollTop
            } : (pg.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), pg.size >= 2 ? vg() : cg = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                left: ag.scrollLeft,
                top: ag.scrollTop
            }), e.preventDefault());
        }), ag.addEventListener("pointermove", e => {
            if ("mouse" !== e.pointerType && pg.has(e.pointerId) && (pg.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), pg.size >= 2)) {
                dg || vg();
                const [t, n] = Array.from(pg.values()), i = ag.getBoundingClientRect(), a = (t.x + n.x) / 2 - i.left, r = (t.y + n.y) / 2 - i.top, o = Math.max(1, Math.hypot(t.x - n.x, t.y - n.y));
                return yg(dg.scale * o / dg.distance, !1, {
                    contentX: dg.contentX,
                    contentY: dg.contentY,
                    viewX: a,
                    viewY: r
                }), void e.preventDefault();
            }
            cg && cg.id === e.pointerId && (ag.scrollLeft = cg.left - (e.clientX - cg.x), ag.scrollTop = cg.top - (e.clientY - cg.y), 
            e.preventDefault());
        });
        const wg = e => {
            if ("mouse" !== e.pointerType && pg.delete(e.pointerId), 1 === pg.size) {
                const [e, t] = pg.entries().next().value;
                dg = null, cg = {
                    id: e,
                    x: t.x,
                    y: t.y,
                    left: ag.scrollLeft,
                    top: ag.scrollTop
                };
            } else pg.size ? vg() : (dg = null, cg = null, ag.classList.remove("is-dragging"));
            "mouse" === e.pointerType && cg && cg.id === e.pointerId && (cg = null, ag.classList.remove("is-dragging"));
        };
        ag.addEventListener("pointerup", wg), ag.addEventListener("pointercancel", wg), 
        ag.addEventListener("wheel", e => {
            (e.ctrlKey || e.metaKey) && (e.preventDefault(), yg(lg * (e.deltaY < 0 ? 1.18 : 1 / 1.18)));
        }, {
            passive: !1
        }), ag.addEventListener("keydown", e => {
            "+" === e.key || "=" === e.key ? (e.preventDefault(), yg(1.35 * lg)) : "-" === e.key ? (e.preventDefault(), 
            yg(lg / 1.35)) : "0" === e.key && (e.preventDefault(), yg(1, !1));
        }), og.addEventListener("load", () => {
            ng.hidden || fg();
        }), window.addEventListener("resize", () => {
            ng.hidden || fg(!0);
        }), window.__sxOnPtr( e => {
            Jh.hidden || !ng.hidden || Zh.contains(e.target) || mg();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && (ng.hidden ? Jh.hidden || (e.preventDefault(), mg({
                focus: !0
            })) : (e.preventDefault(), bg({
                focus: !0
            })));
        });
