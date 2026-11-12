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
        function Ih() {
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
            const d = Math.max(pr.centerRadius, t - i, r - t) + 20, u = Math.max(pr.centerRadius, n - a, o - n) + 20, p = innerWidth <= 620 ? 90 : 44, sw = Cn && Cn.clientWidth ? Cn.clientWidth : innerWidth, sh = Cn && Cn.clientHeight ? Cn.clientHeight : innerHeight, asp = sw > 0 && sh > 0 ? sw / sh : 1, hw = e.width / 2 * Math.max(1, asp), hh = e.height / 2 * Math.max(1, 1 / asp), g = Math.min((hw - p) / d, (hh - p) / u), m = innerWidth <= 620 ? 2.18 : 2.3;
            $p = Math.max(1e-9, Math.min(m, g)), Ep = e.x + e.width / 2 - t * $p, 
            Ap = e.y + e.height / 2 - n * $p, $h(), armFitSettleRefit();
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
            mn.staticMap || Ih();
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
        const kg = e.byId("testResultLoaderDialog"), xg = e.byId("testResultLoaderStatus"), Sg = e.byId("profileImportDialog"), $g = e.byId("profileImportStatus"), Eg = e.byId("completionCelebrationDialog"), Ag = e.byId("completionCelebration"), Cg = e.byId("completionCelebrationCount"), Mg = e.byId("completionConfetti"), completionCompare = e.byId("completionCompare"), completionExport = e.byId("completionExport"), milestoneDialog = e.byId("milestoneCelebrationDialog"), milestoneTitle = e.byId("milestoneCelebrationTitle"), milestoneMessage = e.byId("milestoneCelebrationMessage"), milestoneContinue = e.byId("milestoneContinue"), milestoneCompare = e.byId("milestoneCompare"), milestoneExport = e.byId("milestoneExport"), milestoneImport = e.byId("milestoneImport"), milestoneScribe = e.byId("milestoneScribe"), closeMilestone = e.byId("closeMilestoneCelebration");
        function Ig(e, t = "info", n = !1) {
            $g.textContent = e || "", e ? $g.dataset.tone = t : $g.removeAttribute("data-tone"), 
            n && e && requestAnimationFrame(() => {
                $g.scrollIntoView({
                    block: "nearest"
                }), $g.focus({
                    preventScroll: !0
                });
            });
        }
        function Pg(e, t, n = "read") {
            let i = yx.errorMessage(e, "The file could not be read.");
            "json" === n && /Unexpected token|JSON|position \d+/i.test(i) ? i = "The selected JSON file is malformed." : /does not contain (?:complete )?Sexcapades profile data/i.test(i) ? i = `No embedded Sexcapades profile data or readable profile QR was found in ${t.name}.` : /does not contain a readable Sexcapades profile-data QR code/i.test(i) && (i = `No readable Sexcapades profile QR was found in ${t.name}.`), 
            Ig(`Import failed: ${i}`, "error", !0);
        }
        const Lg = e.byId("importedContactDialog"), Tg = e.byId("importedContactDetails"), Fg = e.byId("addImportedContact"), Ng = e.byId("importedContactStatus"), _g = e.byId("profileDetailsDialog"), Dg = e.byId("profileDetailsBody"), Rg = e.byId("profileDialogAbout"), Og = e.byId("profileDialogPhoto"), Bg = e.byId("profileDialogIdentity"), jg = e.byId("profileDialogRatings"), qg = e.byId("profileDialogSiteLinks"), Hg = e.byId("profileDetailsName"), Wg = e.byId("profileDetailsGender"), Ug = e.byId("profileDetailsSexuality"), Gg = e.byId("profileDetailsRole"), Kg = e.byId("profileDetailsAge"), Pz = e.byId("profileDetailsPronouns"), zg = e.byId("profileDetailsLocation"), Vg = e.byId("profileDetailsFetLife"), Yg = e.byId("profileDetailsPhone"), Xg = e.byId("profileDetailsTelegram"), Zg = e.byId("profileDetailsEmail"), Qg = e.byId("profileDetailsLinktree"), Jg = e.byId("profileDetailsChaturbate"), em = e.byId("profileDetailsX"), tm = e.byId("profileDetailsXhamster"), nm = e.byId("profileDetailsXvideos"), im = e.byId("profileDetailsAbout"), am = e.byId("profileDetailsAboutCount"), rm = e.byId("profileDetailsTerms"), om = e.byId("profileDetailsTermsCount"), sm = e.byId("profileDetailsStatus"), lm = e.byId("profilePhotoInput"), cm = e.byId("profilePhotoList"), dm = e.byId("profilePhotoCount"), um = e.byId("profilePhotoDialog"), pm = e.byId("profilePhotoFull"), hm = e.byId("profilePhotoViewer"), gm = e.byId("profilePhotoStage"), mm = e.byId("profilePhotoPosition"), fm = e.byId("profilePhotoZoomValue"), ym = e.byId("closeProfileDialog"), bm = e.byId("closeProfileTitle"), vm = e.byId("saveClosingProfile"), wm = e.byId("discardProfileDetailsDialog"), km = e.byId("profileExportDialog"), xm = e.byId("profileExportTitle"), Sm = e.byId("profileExportSubtitle"), $m = e.byId("profileExportDataNote"), Em = e.byId("includeContactInfo"), Am = e.byId("includeContactInfoHelp"), Cm = e.byId("blindProfileExport"), Mm = e.byId("exportAboutMe"), Im = e.byId("exportAboutMeCount"), Pm = e.byId("lowResPhotoDialog"), Lm = e.byId("lowResPhotoTitle"), Tm = e.byId("lowResPhotoGrid"), Fm = e.byId("lowResPhotoSummary"), exportPhotoGrid = e.byId("exportPhotoGrid"), exportPhotoSummary = e.byId("exportPhotoSummary"), Nm = e.byId("secondaryFile"), _m = e.byId("secondaryImage"), Dm = e.byId("secondaryFileName"), Rm = e.byId("secondaryFileLink"), Om = e.byId("fileDialog"), Bm = e.byId("fileDialogTitle"), jm = e.byId("fileDialogSubtitle"), qm = e.byId("fileReady"), Hm = e.byId("fileName"), Wm = e.byId("fileHelp"), Um = e.byId("preparedImage"), Gm = e.byId("preparedImageLink"), Km = e.byId("ninjaTransferLink"), zm = e.byId("ninjaTransferHint"), Vm = e.byId("preparedImageToolbar"), Ym = e.byId("preparedImageViewport"), Xm = e.byId("preparedImageStage"), Zm = e.byId("preparedZoomValue"), Qm = e.byId("preparedZoomIn"), Jm = e.byId("preparedZoomOut"), ef = e.byId("preparedZoomFit"), tf = e.byId("fileStatus"), nf = e.byId("fileProgress"), af = e.byId("fileProgressStage"), rf = e.byId("fileProgressValue"), of = e.byId("fileProgressTrack"), sf = e.byId("fileProgressBar"), lf = e.byId("fileProgressPortrait"), cf = e.byId("fileProgressInitials"), df = e.byId("fileProgressDetail");
        let uf = null, pf = null, hf = null, gf = null, mf = !1, ff = null, yf = null, bf = null, vf = 0, wf = null, kf = null, xf = new Set, Sf = !1, $f = !0, Ef = null, Af = new Set, Cf = !1, Mf = !0, If = "black", Pf = new Set, exportPhotoSelection = new Set, Lf = "png-lowres", Tf = null, Ff = 1, Nf = !1, _f = null;
        const Df = new Map;
        function Rf(e) {
            Nf = Boolean(e), Ff = 1, _f = null, Df.clear(), Vm.hidden = !Nf, Ym.classList.toggle("is-zoomable", Nf), 
            Ym.classList.remove("is-zoomed", "is-dragging"), Xm.removeAttribute("style"), Um.removeAttribute("style"), 
            Zm.value = "100%", Qm.disabled = !Nf, Jm.disabled = !0, ef.disabled = !0;
        }
        function Of(e = !0) {
            if (!(Nf && Um.naturalWidth && Ym.clientWidth && Ym.clientHeight)) return;
            const t = Ym.clientWidth, n = Ym.clientHeight, i = Math.max(1, Xm.scrollWidth), a = Math.max(1, Xm.scrollHeight), r = (Ym.scrollLeft + t / 2) / i, o = (Ym.scrollTop + n / 2) / a, s = Math.min(t / Um.naturalWidth, n / Um.naturalHeight), l = Math.max(1, Math.round(Um.naturalWidth * s * Ff)), c = Math.max(1, Math.round(Um.naturalHeight * s * Ff)), d = Math.max(t, l), u = Math.max(n, c);
            Xm.style.width = `${d}px`, Xm.style.height = `${u}px`, Um.style.width = `${l}px`, 
            Um.style.height = `${c}px`, Um.style.left = "50%", Um.style.top = "50%", Um.style.transform = "translate(-50%,-50%)", 
            Ym.classList.toggle("is-zoomed", Ff > 1.001), Zm.value = `${Math.round(100 * Ff)}%`, 
            Qm.disabled = Ff >= 5, Jm.disabled = Ff <= 1, ef.disabled = Ff <= 1, e && requestAnimationFrame(() => {
                Ym.scrollLeft = Math.max(0, r * Xm.scrollWidth - t / 2), Ym.scrollTop = Math.max(0, o * Xm.scrollHeight - n / 2);
            });
        }
        function Bf(e, t = !0) {
            Nf && (Ff = Math.max(1, Math.min(5, e)), Of(t));
        }
        function jf() {
            uf && URL.revokeObjectURL(uf), pf && URL.revokeObjectURL(pf), hf && URL.revokeObjectURL(hf), 
            uf = null, pf = null, hf = null, gf = null, mf = !1, yf = null, bf = null, Nm.hidden = !0, 
            _m.removeAttribute("src"), _m.alt = "", Rm.disabled = !0, delete Rm.dataset.filename, 
            Um.onload = null, Um.removeAttribute("src"), Um.alt = "", Gm.disabled = !0, delete Gm.dataset.filename, 
            Km.hidden = !0, Km.disabled = !0, zm.hidden = !0, Rf(!1), qm.hidden = !0;
        }
        function qf(e, t, n, i = "", a = !0, r = "") {
            if (Number.isInteger(e) && e !== vf) return !1;
            const o = Math.max(0, Math.min(100, Math.round(Number(t) || 0)));
            return nf.hidden = !1, nf.classList.toggle("is-working", Boolean(a)), r ? nf.dataset.tone = r : delete nf.dataset.tone, 
            af.textContent = n || "Preparing export", rf.value = `${o}%`, rf.textContent = `${o}%`, 
            of.setAttribute("aria-valuenow", String(o)), of.setAttribute("aria-valuetext", `${n || "Preparing export"}, ${o}% complete`), 
            of.style.setProperty("--progress", String(o)), sf.style.width = `${o}%`, df.textContent = i || "", 
            !0;
        }
        function Hf(e, t, n, i = "", a = !0, r = "") {
            return qf(e, t, n, i, a, r) ? new Promise(t => requestAnimationFrame(() => requestAnimationFrame(() => t(e === vf)))) : Promise.resolve(!1);
        }
        function Wf(e, t) {
            qf(e, 100, "Export stopped", t || "The export could not be completed.", !1, "error");
        }
        function Uf(e = "Preparing image", t = "Building your shareable PNG…", n = {}) {
            const i = ++vf;
            return jf(), function(e) {
                const t = e && vt[e] ? String(wt[e] || "Profile") : "Profile", n = e && vt[e] ? (dt[e] || [])[0] : null;
                cf.textContent = (Ji(t).trim().charAt(0) || "S").toUpperCase(), lf.classList.toggle("has-photo", Boolean(n)), 
                lf.querySelector("svg")?.remove(), n && lf.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 100 100" aria-hidden="true">${aa(n, {
                    x: 0,
                    y: 0,
                    w: 100,
                    h: 100
                })}</svg>`);
            }(n.profileId), ff = n.returnDialog || null, ff && ff.open && Ui(ff), Bm.textContent = e, 
            jm.textContent = t, tf.textContent = "Building…", qf(i, 2, "Starting export", "Preparing the export screen…", !0), 
            Wi(Om), i;
        }
        function Gf(e, t, n = {}) {
            if (e instanceof Blob && e.type) {
                const n = {
                    "image/png": ".png",
                    "image/jpeg": ".jpg",
                    "image/svg+xml": ".svg",
                    "image/svg+xml;charset=utf-8": ".svg",
                    "application/pdf": ".pdf"
                }[e.type];
                if (n) {
                    const e = String(t || "").toLowerCase();
                    e.endsWith(n) || ".jpg" === n && e.endsWith(".jpeg") || (t = String(t || "Sexcapades-export").replace(/\.[^.]+$/, "") + n);
                }
            }
            if (Number.isInteger(n.preparedJob) && n.preparedJob !== vf) return !1;
            const i = n.returnDialog || ff || null;
            if (jf(), Rf(n.zoomable), ff = i, yf = n.profileId && vt[n.profileId] ? n.profileId : null, 
            ff && ff.open && Ui(ff), uf = URL.createObjectURL(e), n.svgMarkup && n.profileId) try {
                var a = n.pdfFilename || ip(wt[n.profileId]).pdf;
                ap(n.svgMarkup, n.profileId, Boolean(n.includeProfileInfo), Boolean(n.blind), n.allowedIds).then(function(e) {
                    hf = URL.createObjectURL(e), gf = a;
                }).catch(function(e) {
                    console.warn("PDF export failed", e), hf = null;
                });
            } catch (e) {
                console.warn("PDF kickoff failed", e);
            }
            Bm.textContent = n.title || "Your PNG is ready", jm.textContent = n.subtitle || "The image below contains the data needed for re-import.", 
            Hm.textContent = t, Wm.textContent = n.help || "Review the image below, then choose Download.", 
            Um.alt = `Shareable Sexcapades image preview: ${t}`, Gm.dataset.filename = t, Gm.textContent = n.downloadLabel || "Download", 
            Gm.title = n.downloadTitle || (e instanceof Blob && String(e.type || "").startsWith("image/svg+xml") ? "Downloads the standalone SVG map." : "Downloads the PNG with embedded profile data."), Gm.disabled = !1, Km.hidden = !n.ninjaTransfer, 
            Km.disabled = !n.ninjaTransfer, zm.hidden = !n.ninjaTransfer, n.secondaryBlob && (pf = URL.createObjectURL(n.secondaryBlob), 
            _m.src = pf, _m.alt = `Sync card back preview: ${n.secondaryFilename || "Back PNG"}`, 
            Rm.dataset.filename = n.secondaryFilename || "Sexcapades-sync-card-back.png", Rm.textContent = n.secondaryLabel || "Download second PNG", 
            Rm.disabled = !1, Dm.textContent = n.secondaryFilename || "Back PNG", Nm.hidden = !1), 
            Um.onload = () => requestAnimationFrame(() => Of(!1)), Um.src = uf, qm.hidden = !1, 
            tf.textContent = Nf ? "Use +/−, the mouse wheel, or pinch to inspect fine details. Download keeps the original full-resolution image and its filename." : "The profile stays open when this image closes.", 
            qf(vf, 100, "Ready to download", "Export complete. Review the preview, then choose Download.", !1), 
            Wi(Om), requestAnimationFrame(() => Of(!1));
        }
        function Kf() {
            ++vf;
            const e = ff;
            ff = null, Ui(Om), t.setTimeout(() => {
                if (jf(), e) {
                    if (!(e !== ym || wf && vt[wf])) return;
                    Wi(e);
                }
            }, 0);
        }
        function renderExportPhotoPicker() {
            if (!exportPhotoGrid || !kf || !vt[kf]) return;
            const t = Yv(dt[kf] || []);
            exportPhotoGrid.innerHTML = t.map((e, t) => {
                const n = 0 === t || exportPhotoSelection.has(t), i = 0 === t;
                return `<button class="lowres-photo-choice" type="button" data-export-photo="${t}" aria-pressed="${n}"${i ? " disabled" : ""}><img src="${e.data}" alt="${i ? "Profile avatar" : `Profile photo ${t + 1}`}"><span>${i ? "Avatar" : `Photo ${t + 1}`}</span><small>${i ? "Always included" : n ? "Included" : "Not included"}</small></button>`;
            }).join("");
            const n = t.length ? 1 + [ ...exportPhotoSelection ].filter(e => e > 0 && e < t.length).length : 0;
            exportPhotoSummary.textContent = t.length ? `${n} of ${t.length} ${1 === t.length ? "picture" : "pictures"} included` : "No profile pictures attached.",
            e.byId("selectAllExportPhotos").disabled = !Sf || n === t.length,
            e.byId("clearExportPhotos").disabled = !Sf || n <= Math.min(1, t.length),
            exportPhotoGrid.querySelectorAll("[data-export-photo]").forEach(e => {
                Number(e.dataset.exportPhoto) > 0 && (e.disabled = !Sf);
            });
        }
        function selectedExportPhotos() {
            const e = Yv(dt[kf] || []);
            return e.length ? [ 0, ...[ ...exportPhotoSelection ].filter(t => t > 0 && t < e.length) ].sort((e, t) => e - t) : [];
        }
        function zf() {
            kf = null, xf.clear(), exportPhotoSelection.clear(), Sf = !1, $f = !0, Ui(km);
        }
        function Vf() {
            Sf = Boolean(Em.checked), Em.disabled = !1, Am.textContent = Sf ? "Includes the saved profile name, About Me, photos, contact details, and vCard for personal backup." : "Shared exports contain ratings and markers with a generic profile label; name, About Me, photos, contact details, and vCard are omitted.", 
            Mm.disabled = !Sf, renderExportPhotoPicker();
        }
        function Yf() {
            Im && (Im.textContent = String(Mm.value.length) + "/1500 characters");
        }
        function Xf() {
            const t = [ ...Tm.querySelectorAll("[data-lowres-photo]") ], n = Pf.size;
            t.forEach(e => {
                const t = Pf.has(Number(e.dataset.lowresPhoto));
                e.setAttribute("aria-pressed", String(t)), e.setAttribute("aria-label", `${e.querySelector("span").textContent}: ${t ? "included" : "not included"}`), 
                e.querySelector("small").textContent = t ? "Included" : "Not included";
            }), Fm.textContent = `${n} of ${t.length} ${1 === t.length ? "photo" : "photos"} included in this export`, 
            e.byId("selectAllLowResPhotos").disabled = n === t.length, e.byId("clearLowResPhotos").disabled = 0 === n;
        }
        function Zf() {
            Ef = null, Af.clear(), Cf = !1, Mf = !0, Pf.clear(), Tm.replaceChildren(), Fm.textContent = "", 
            Ui(Pm);
        }
        // Qf (sharing-sync refactor F4): options object, not seven
        // positionals — a misordered boolean used to silently flip
        // blind/shared or background. Defaults match the old
        // positional defaults exactly.
        function Qf(t, n = {}) {
            const i = Boolean(n.includeProfileInfo), a = void 0 === n.background ? "black" : n.background, r = void 0 === n.format ? "png-lowres" : n.format, o = !1 !== n.blind, s = void 0 === n.allowedIds ? new Set : n.allowedIds, l = void 0 === n.photoIndices ? [] : n.photoIndices, c = s instanceof Set ? new Set(s) : new Set(s || []), d = Array.isArray(l) ? l.slice() : [];
            return "pdf" === r ? dp(t, {
                photoIndices: d,
                includeProfileInfo: i,
                background: a,
                blind: o,
                allowedIds: c
            }) : rp(t, {
                lowRes: "png" !== r,
                photoIndices: d,
                includeProfileInfo: i,
                background: a,
                blind: o,
                allowedIds: c
            });
        }
        function Jf(e) {
            if (!vt[e] || !Jv(e, "capturing this profile", () => Jf(e))) return;
            const exportProfileName = String(wt[e] || "").trim();
            (!exportProfileName || /^unknown$/i.test(exportProfileName)) && (wt[e] = "Untitled profile", Jw());
            kf = e, xf = function(e) {
                // F8 (sharing-sync refactor): the solo switch /
                // collect / restore below is wrapped in try/finally.
                // An exception mid-collect used to strand the live
                // map in solo view; the restore now always runs.
                // (nu's same solo-switch shape was checked: its
                // restore is likewise inline and unguarded, so this
                // guard was NOT generalized to it in this pass.)
                const t = Mt, n = It, i = Yi(), a = Mt !== e || It !== e || i.length > 1 || 1 === i.length && i[0] !== e;
                a && (Mt = e, It = e, sxSel(null, "clear"), Mr({
                    animate: !1
                }));
                const r = new Set;
                try {
                    In.querySelectorAll(".node-group[data-layout-key]").forEach(e => {
                        const t = e.dataset.layoutKey;
                        if (!t || e.classList.contains("is-hidden")) return;
                        const n = getComputedStyle(e);
                        "none" !== n.display && "hidden" !== n.visibility && 0 !== Number(n.opacity) && r.add(t);
                    }), Array.from(r).forEach(t => {
                        const n = qn[t] || Xn(t) || (at[e] || {})[t];
                        n?.parentId && r.add(n.parentId), n?.branch && r.add(catId(n.branch));
                    });
                } finally {
                    a && (Mt = t, It = n, sxSel(i, "set"), Mr({
                        animate: !1
                    }));
                }
                return r;
            }(e), Em.checked = !1, Cm.checked = !0, $f = !0, xm.textContent = `Export ${wt[e]}`, 
            Sm.textContent = "Choose an export format. On mobile, exports may take a minute or two.";
            const t = (dt[e] || []).length;
            exportPhotoSelection = new Set(Array.from({ length: t }, (e, t) => t));
            $m.textContent = `Exports what's currently visible on your map. Every format limits embedded profile data to those same visible topics${t ? ` and can include ${t} attached ${1 === t ? "photo" : "photos"} when profile info is included` : ""}.`, 
            Vf(), Mm.value = String(nt[e] || ""), Yf(), Wi(km);
        }
        e.byId("closeProfileExport") && (e.byId("closeProfileExport").onclick = zf), km.addEventListener("click", e => {
            e.target === km && zf();
        }), km.addEventListener("cancel", e => {
            e.preventDefault(), zf();
        }), Em.addEventListener("change", Vf), Cm.addEventListener("change", () => {
            $f = Boolean(Cm.checked);
        }), Mm.addEventListener("input", Yf), km.querySelectorAll("[data-profile-export]").forEach(t => t.addEventListener("click", () => {
            const n = kf, i = new Set(xf), a = t.dataset.profileExport, r = Boolean(Sf), o = Boolean($f), s = (km.querySelector("input[name=exportBackground]:checked") || {}).value || "black", l = "a4" === (e.byId("syncCardPaperSize") || {}).value ? "a4" : "letter", c = selectedExportPhotos();
            zf(), n && vt[n] && (r && (nt[n] = String(Mm.value || "").trim().slice(0, 1500)), 
            "qr" === a ? pp(n, {
                includeProfileInfo: r,
                blind: o,
                allowedIds: i
            }) : "card" === a ? op(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                paperSize: l,
                allowedIds: i
            }) : "svg" === a ? cp(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                allowedIds: i
            }) : "svgz" === a ? cp(n, {
                includeProfileInfo: r,
                blind: o,
                background: s,
                allowedIds: i,
                compressed: !0
            }) : Qf(n, {
                includeProfileInfo: r,
                background: s,
                format: "pdf" === a ? "pdf" : "zoom" === a ? "png-lowres" : "png",
                blind: o,
                allowedIds: i,
                photoIndices: c
            }));
        }));
        const ey = e.byId("openerDialog"), ty = e.byId("negotiationDialog");
        function ny(e, t) {
            if (!e) return;
            const n = document.createElement("a");
            n.href = e, n.download = t || "Sexcapades-profile.png", n.hidden = !0, document.body.appendChild(n), 
            n.click(), n.remove();
        }
        e.byId("openOpener") && e.byId("openOpener").addEventListener("click", () => {
            // Opener follows its dialog (load-target stage,
            // 2026-10-27): the button lives inside the profile
            // details dialog, so its target is that dialog's profile
            // (Hy) — never whichever profile the viewport happens to
            // display. A missing dialog profile is a visible error,
            // not a silent fall back to the active profile. The
            // opener itself stays exactly where it is.
            const t = Hy && vt[Hy] ? Hy : null;
            if (!t) return void tS("This dialog is not showing a profile, so there is no profile to build an opener from.", {
                tone: "error",
                persistent: !0
            });
            _g.open && Ui(_g), !ft[t] && (Eu(), Wi(e.byId("openerDialog")));
        }), e.byId("openNegotiation") && e.byId("openNegotiation").addEventListener("click", function() {
            const t = function() {
                const e = Yi().filter(e => vt[e]);
                if (e.length >= 2) return e;
                const t = Kd(), n = (t?.sourceIds || []).filter(e => vt[e]);
                return n.length >= 2 ? n : [];
            }();
            if (t.length < 2) return;
            const i = Iu(t), a = e.byId("negotiationPanel"), r = Cu(t);
            e.byId("negotiationSubtitle").textContent = `${i.names.join(" + ")} · limits stay out of every play suggestion.`, e.byId("negotiationProfiles").textContent = i.names.join(" + "), 
            n(a, `<p class="sx-stamp">${Hi(sxWriterStamp(i.ids))}</p><fieldset class="guide-block guide-block-limits"><legend>Hard limits + red topics</legend><div class="guide-limits-grid">${i.names.map((e, t) => `<div class="guide-limit-group"><h5>${Hi(e)} · hard limits</h5><ul>${Pu(i.terms[t] ? i.limits[t].concat(`Terms (binding): "${i.terms[t]}"`) : i.limits[t], "None marked.")}</ul></div><div class="guide-limit-group"><h5>${Hi(e)} · red topics</h5><ul>${Pu(i.reds[t], "None rated red.")}</ul></div>`).join("")}</div></fieldset><section class="guide-block guide-block-mutual"><h4>Mutual exclusions — both partners rated deep-red</h4><ul>${Pu(i.mutuals, "No topic is rated deep-red by both partners.")}</ul></section><section class="guide-block guide-block-discuss"><h4>Discuss first</h4><ul>${Pu(i.discuss, "No green-versus-red clashes found.")}</ul></section><section class="guide-block"><h4>Fill out before play</h4><div class="negotiation-fields"><label class="negotiation-field"><span>Safewords + nonverbal stop signals</span><small>Choose a shared system, define exactly what slows or stops play, and name a backup signal for anyone who cannot speak.</small><div class="signal-presets" role="group" aria-label="Common stop-signal starters"><label class="signal-preset"><input data-signal-preset="Stoplight: green = continue, yellow = slow down/check in, red = stop." type="checkbox"/>Stoplight</label><label class="signal-preset"><input data-signal-preset="Nonverbal stop: drop a held object." type="checkbox"/>Drop object</label><label class="signal-preset"><input data-signal-preset="Nonverbal stop: three firm taps." type="checkbox"/>Three taps</label></div><textarea data-negotiation-safewords placeholder="Example: green = continue; yellow = slow and check in; red = stop. If speech is difficult, dropping the held object or three firm taps means stop.">${Hi(r.safewords)}</textarea></label>${i.names.map((e, t) => `<label class="negotiation-field"><span>${Hi(e)} · aftercare needs</span><small>Write what ${Hi(e)} needs immediately after play and later: touch or space, reassurance, water or food, cleanup, medication or accessibility needs, check-in timing, and anything to avoid.</small><textarea data-negotiation-aftercare="${Hi(i.ids[t])}" placeholder="Example: water first, then quiet cuddling; no debrief until tomorrow; text check-in by noon…">${Hi(r.aftercare[i.ids[t]] || "")}</textarea></label>`).join("")}</div><h5>Rated aftercare preferences from the map</h5><p class="guide-source-intro">These suggestions come from each profile’s <strong>Connection &amp; aftercare</strong> ratings. Put lasting personal aftercare details in a note on an aftercare map topic; use the boxes above to confirm what applies to this specific plan.</p>${i.names.map((e, t) => `<strong>${Hi(e)}</strong><ul>${Pu(i.ratedAftercare[t], "None recorded.")}</ul>`).join("")}</section><section class="guide-block"><h4>Play guide source material</h4><p class="guide-source-intro">This is the profile-derived idea pool the AI may arrange into a guide. It is not an agreement: the limits, stop signals, aftercare fields, and decisions above are the binding checklist.</p><div class="guide-source-grid"><div class="guide-source-group"><h5>Warm-up ideas</h5><ul>${Pu(i.warmup, "Agree on a gentle start together.")}</ul></div><div class="guide-source-group"><h5>Main-play ideas</h5><ul>${Pu(i.main, "No shared green/green main-play topic is recorded.")}</ul></div><div class="guide-source-group"><h5>Aftercare ideas</h5><ul>${Pu(i.aftercare, "Agree on aftercare before starting.")}</ul></div><div class="guide-source-group"><h5>Hard-excluded</h5><ul>${Pu([ ...new Set(i.excluded.concat(i.mutuals)) ].concat(i.names.map((e, t) => i.terms[t] ? e + " — hard limits named in Terms (binding), quoted above" : "").filter(Boolean)), "None marked.")}</ul></div><div class="guide-source-group"><h5>Fantasy only — excluded from practical play</h5><ul>${Pu(i.fantasy || [], "No fantasy-only topics are in the shared pool.")}</ul></div><div class="guide-source-group"><h5>Teasers — soft no revisited at the current Heat</h5><ul>${Pu(i.teasers || [], "No soft-no topics are teaser-eligible at the current settings.")}</ul></div></div></section>`), 
            a.addEventListener("input", () => {
                r.safewords = a.querySelector("[data-negotiation-safewords]").value, a.querySelectorAll("[data-negotiation-aftercare]").forEach(e => {
                    r.aftercare[e.dataset.negotiationAftercare] = e.value;
                }), Fu(t), e.byId("negotiationCopyStatus").textContent = "Checklist saved for both documents.", e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = "Checklist saved for both documents.");
            }), a.querySelectorAll("[data-signal-preset]").forEach(e => {
                const t = String(e.dataset.signalPreset || ""), n = a.querySelector("[data-negotiation-safewords]");
                e.checked = Boolean(t && n.value.includes(t)), e.addEventListener("change", () => {
                    const i = n.value.split("\n").map(e => e.trim()).filter(Boolean).filter(e => e !== t);
                    e.checked && i.push(t), n.value = i.join("\n"), n.dispatchEvent(new Event("input", {
                        bubbles: !0
                    }));
                });
            }), Fu(t, i), e.byId("negotiationCopyStatus").textContent = "", e.byId("negotiationDialog").dataset.participants = t.join(","), e.byId("setterLength") && (e.byId("setterLength").value = r.length), e.byId("setterLengthUnit") && (e.byId("setterLengthUnit").value = r.lengthUnit), e.byId("setterDetailLevel") && (e.byId("setterDetailLevel").value = r.detail), e.byId("setterNegotiationLength") && (e.byId("setterNegotiationLength").value = r.negotiationLength || "1"), e.byId("setterNegotiationLengthUnit") && (e.byId("setterNegotiationLengthUnit").value = r.negotiationLengthUnit || "pages"), e.byId("negotiationGuideStatus") && (e.byId("negotiationGuideStatus").textContent = ""), Wi(e.byId("negotiationDialog"));
        }), e.byId("closeOpener").onclick = () => Ui(ey), e.byId("closeNegotiation") && (e.byId("closeNegotiation").onclick = () => Ui(ty)), 
        ey.addEventListener("click", e => {
            e.target === ey && Ui(ey);
        }), ty.addEventListener("click", e => {
            e.target === ty && Ui(ty);
        }), ey.addEventListener("cancel", e => {
            e.preventDefault(), Ui(ey);
        }), ty.addEventListener("cancel", e => {
            e.preventDefault(), Ui(ty);
        }), e.byId("copyOpenerMessage") && e.byId("copyOpenerMessage").addEventListener("click", async () => {
            const t = e.byId("openerMessage");
            await sxCopyText(t.value, e.byId("openerCopyStatus"), "Message copied", "Copy failed", null, {
                ta: t,
                throughOnEmpty: !0
            });
        }), e.byId("nextOpenerMessage") && e.byId("nextOpenerMessage").addEventListener("click", Eu), e.byId("copyNegotiation") && e.byId("copyNegotiation").addEventListener("click", async () => {
            setterParticipantIds(), await sxCopyText(playGuidePromptText(), e.byId("negotiationCopyStatus"), "AI play-guide prompt copied", "Copy failed", e.byId("negotiationDialog"));
        }), e.byId("copyNegotiationGuide") && e.byId("copyNegotiationGuide").addEventListener("click", async () => {
            const t = e.byId("negotiationPanel");
            setterParticipantIds(), await sxCopyText(t.dataset.negotiationGuide || "", e.byId("negotiationGuideStatus"), "Negotiation guide copied", "Copy failed", e.byId("negotiationDialog"));
        }), e.byId("downloadNegotiationGuide") && e.byId("downloadNegotiationGuide").addEventListener("click", () => {
            const ids = setterParticipantIds();
            const t = e.byId("negotiationPanel"), text = t?.dataset.negotiationGuide || "", status = e.byId("negotiationGuideStatus");
            if (!text) return void (status && (status.textContent = "Select two profiles first."));
            const names = sxFilenameSlug(ids.map(id => wt[id] || id).join("-"), "profiles"), blob = new Blob([ text + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url, a.download = `Sexcapades-${names}-negotiation-guide.txt`, a.hidden = !0, document.body.appendChild(a), a.click(), a.remove(), setTimeout(() => URL.revokeObjectURL(url), 0), status && (status.textContent = "Negotiation guide downloaded.");
        }), e.byId("downloadPlayGuide") && e.byId("downloadPlayGuide").addEventListener("click", () => {
            const ids = setterParticipantIds();
            const t = e.byId("negotiationPanel"), text = playGuidePromptText(), status = e.byId("negotiationCopyStatus");
            if (!text) return void (status && (status.textContent = "Select two profiles first."));
            const names = sxFilenameSlug(ids.map(id => wt[id] || id).join("-"), "profiles"), blob = new Blob([ text + "\n" ], {
                type: "text/plain;charset=utf-8"
            }), url = URL.createObjectURL(blob), a = document.createElement("a");
            a.href = url, a.download = `Sexcapades-${names}-play-guide-prompt.txt`, a.hidden = !0, document.body.appendChild(a), a.click(), a.remove(), setTimeout(() => URL.revokeObjectURL(url), 0), status && (status.textContent = "Play guide prompt downloaded.");
        }), exportPhotoGrid.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "exportPhoto");
            if (!t || t.disabled) return;
            const n = Number(t.dataset.exportPhoto);
            exportPhotoSelection.has(n) ? exportPhotoSelection.delete(n) : exportPhotoSelection.add(n), renderExportPhotoPicker();
        }), e.byId("selectAllExportPhotos").onclick = () => {
            Yv(dt[kf] || []).forEach((e, t) => exportPhotoSelection.add(t)), renderExportPhotoPicker();
        }, e.byId("clearExportPhotos").onclick = () => {
            exportPhotoSelection.clear(), exportPhotoSelection.add(0), renderExportPhotoPicker();
        }, Tm.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "lowresPhoto");
            if (!t) return;
            const n = Number(t.dataset.lowresPhoto);
            Pf.has(n) ? Pf.delete(n) : Pf.add(n), Xf();
        }), e.byId("selectAllLowResPhotos").onclick = () => {
            Tm.querySelectorAll("[data-lowres-photo]").forEach(e => Pf.add(Number(e.dataset.lowresPhoto))), 
            Xf();
        }, e.byId("clearLowResPhotos").onclick = () => {
            Pf.clear(), Xf();
        }, e.byId("createLowResExport").onclick = () => {
            const e = Ef, t = new Set(Af), n = Cf, i = Mf, a = [ ...Pf ].sort((e, t) => e - t), r = Lf || "png-lowres", o = If;
            Zf(), e && vt[e] && ("pdf" === r ? dp(e, {
                photoIndices: a,
                includeProfileInfo: n,
                blind: i,
                background: o,
                allowedIds: t
            }) : rp(e, {
                lowRes: "png" !== r,
                photoIndices: a,
                includeProfileInfo: n,
                blind: i,
                background: o,
                allowedIds: t
            }));
        }, e.byId("closeLowResPhoto").onclick = Zf, Pm.addEventListener("click", e => {
            e.target === Pm && Zf();
        }), Pm.addEventListener("cancel", e => {
            e.preventDefault(), Zf();
        }), e.byId("closeFileDialog").onclick = Kf, Gm.addEventListener("click", () => {
            qf(vf, 100, "Starting download", "Handing the finished file to your browser…", !0), 
            mf ? hf && ny(hf, gf) : ny(uf, Gm.dataset.filename), yf && Vt(yf);
        }), Km.addEventListener("click", () => {
            window.open("https://ninjatransfers.com", "_blank", "noopener,noreferrer"), ny(uf, Gm.dataset.filename), 
            yf && Vt(yf);
        }), Rm.addEventListener("click", () => {
            ny(pf, Rm.dataset.filename), yf && Vt(yf);
        }), Qm && (Qm.onclick = () => Bf(1.25 * Ff)), Jm && (Jm.onclick = () => Bf(Ff / 1.25)), ef && (ef.onclick = () => Bf(1)), 
        Ym.addEventListener("wheel", e => {
            Nf && (e.preventDefault(), Bf(e.deltaY < 0 ? 1.2 * Ff : Ff / 1.2));
        }, {
            passive: !1
        }), Ym.addEventListener("pointerdown", e => {
            if (Nf && ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button)) {
                Df.set(e.pointerId, {
                    x: e.clientX,
                    y: e.clientY
                });
                try {
                    Ym.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                if (2 === Df.size) {
                    const e = [ ...Df.values() ];
                    _f = {
                        distance: Math.hypot(e[1].x - e[0].x, e[1].y - e[0].y),
                        zoom: Ff
                    };
                }
            }
        }), Ym.addEventListener("pointermove", e => {
            const t = Df.get(e.pointerId);
            if (!t) return;
            const n = {
                x: e.clientX,
                y: e.clientY
            };
            if (Df.set(e.pointerId, n), Df.size >= 2) {
                const t = [ ...Df.values() ].slice(0, 2), n = Math.hypot(t[1].x - t[0].x, t[1].y - t[0].y);
                return _f || (_f = {
                    distance: n,
                    zoom: Ff
                }), _f.distance > 0 && Bf(_f.zoom * n / _f.distance, !1), void e.preventDefault();
            }
            Ff > 1 && (Ym.scrollLeft -= n.x - t.x, Ym.scrollTop -= n.y - t.y, Ym.classList.add("is-dragging"), 
            e.preventDefault());
        });
        const iy = e => {
            Df.delete(e.pointerId), Ym.classList.remove("is-dragging"), Df.size < 2 && (_f = null);
        };
        Ym.addEventListener("pointerup", iy), Ym.addEventListener("pointercancel", iy), 
        window.addEventListener("resize", () => {
            wr(), Nf && Om.open && Of(!1), um.open && cy(!1), gy && gy.open && Iy();
        }), Om.addEventListener("click", e => {
            e.target === Om && Kf();
        }), Om.addEventListener("cancel", e => {
            e.preventDefault(), Kf();
        });
        let ay = [], ry = 0, oy = 1, sy = null;
        const ly = new Map;
        function cy(t = !0) {
            if (!pm.naturalWidth || !hm.clientWidth || !hm.clientHeight) return;
            const n = hm.clientWidth, i = hm.clientHeight, a = Math.max(1, gm.scrollWidth), r = Math.max(1, gm.scrollHeight), o = (hm.scrollLeft + n / 2) / a, s = (hm.scrollTop + i / 2) / r, l = Math.min(n / pm.naturalWidth, i / pm.naturalHeight), c = Math.max(1, Math.round(pm.naturalWidth * l * oy)), d = Math.max(1, Math.round(pm.naturalHeight * l * oy)), u = Math.max(n, c), p = Math.max(i, d);
            gm.style.width = `${u}px`, gm.style.height = `${p}px`, pm.style.width = `${c}px`, 
            pm.style.height = `${d}px`, hm.classList.toggle("is-zoomed", oy > 1.001), fm.value = `${Math.round(100 * oy)}%`, 
            e.byId("profilePhotoZoomOut").disabled = oy <= 1, e.byId("profilePhotoZoomIn").disabled = oy >= 6, 
            e.byId("profilePhotoZoomFit").disabled = oy <= 1, t && requestAnimationFrame(() => {
                hm.scrollLeft = Math.max(0, o * gm.scrollWidth - n / 2), hm.scrollTop = Math.max(0, s * gm.scrollHeight - i / 2);
            });
        }
        function dy(e, t = !0) {
            oy = Math.max(1, Math.min(6, e)), cy(t);
        }
        function uy(t) {
            ay.length && (ry = (t + ay.length) % ay.length, oy = 1, sy = null, ly.clear(), hm.classList.remove("is-zoomed", "is-dragging"), 
            gm.removeAttribute("style"), pm.removeAttribute("style"), mm.value = `${ry + 1} of ${ay.length}`, 
            pm.alt = `Attached profile photo ${ry + 1} of ${ay.length}`, pm.onload = () => requestAnimationFrame(() => cy(!1)), 
            pm.src = ay[ry].data, e.byId("profilePhotoPrevious").disabled = ay.length < 2, e.byId("profilePhotoNext").disabled = ay.length < 2);
        }
        function py() {
            Ui(um), ly.clear(), sy = null, pm.onload = null, pm.removeAttribute("src"), ay = [];
        }
        e.byId("closeProfilePhoto").onclick = py, um.addEventListener("click", e => {
            e.target === um && py();
        }), um.addEventListener("cancel", e => {
            e.preventDefault(), py();
        }), e.byId("profilePhotoPrevious").onclick = () => uy(ry - 1), e.byId("profilePhotoNext").onclick = () => uy(ry + 1), 
        e.byId("profilePhotoZoomIn").onclick = () => dy(1.25 * oy), e.byId("profilePhotoZoomOut").onclick = () => dy(oy / 1.25), 
        e.byId("profilePhotoZoomFit").onclick = () => dy(1), hm.addEventListener("wheel", e => {
            e.preventDefault(), dy(e.deltaY < 0 ? 1.2 * oy : oy / 1.2);
        }, {
            passive: !1
        }), hm.addEventListener("pointerdown", e => {
            if ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button) {
                ly.set(e.pointerId, {
                    x: e.clientX,
                    y: e.clientY
                });
                try {
                    hm.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                if (2 === ly.size) {
                    const e = [ ...ly.values() ];
                    sy = {
                        distance: Math.hypot(e[1].x - e[0].x, e[1].y - e[0].y),
                        zoom: oy
                    };
                }
            }
        }), hm.addEventListener("pointermove", e => {
            const t = ly.get(e.pointerId);
            if (!t) return;
            const n = {
                x: e.clientX,
                y: e.clientY
            };
            if (ly.set(e.pointerId, n), ly.size >= 2) {
                const t = [ ...ly.values() ].slice(0, 2), n = Math.hypot(t[1].x - t[0].x, t[1].y - t[0].y);
                return sy || (sy = {
                    distance: n,
                    zoom: oy
                }), sy.distance > 0 && dy(sy.zoom * n / sy.distance, !1), void e.preventDefault();
            }
            oy > 1 && (hm.scrollLeft -= n.x - t.x, hm.scrollTop -= n.y - t.y, hm.classList.add("is-dragging"), 
            e.preventDefault());
        });
        const hy = e => {
            ly.delete(e.pointerId), hm.classList.remove("is-dragging"), ly.size < 2 && (sy = null);
        };
        hm.addEventListener("pointerup", hy), hm.addEventListener("pointercancel", hy);
        const gy = e.byId("profileCropDialog"), my = e.byId("profileCropPreview"), fy = e.byId("profileCropImage"), yy = e.byId("profileCropZoom"), by = e.byId("profileCropZoomValue"), vy = e.byId("profileCropRotateRing"), wy = e.byId("profileCropRotateThumb"), ky = e.byId("profileCropRotateValue");
        let xy = null, Sy = null, $y = null, Ey = null, Ay = 0, Cy = 0, My = 0;
        function Iy() {
            if (!Sy || !my.clientWidth) return;
            const e = my.clientWidth, t = my.clientHeight, n = Math.max(e / Sy.width, t / Sy.height) * Sy.cropZoom, i = Sy.width * n, a = Sy.height * n, r = i > e ? e / (2 * i) : .5, o = i > e ? 1 - r : .5, s = a > t ? t / (2 * a) : .5, l = a > t ? 1 - s : .5;
            Sy.cropX = Math.max(r, Math.min(o, Sy.cropX)), Sy.cropY = Math.max(s, Math.min(l, Sy.cropY)), 
            Sy.cropRotation = Math.max(-180, Math.min(180, Number(Sy.cropRotation) || 0)), fy.style.width = `${i}px`, 
            fy.style.height = `${a}px`, fy.style.left = e / 2 - Sy.cropX * i + "px", fy.style.top = t / 2 - Sy.cropY * a + "px", 
            fy.style.transformOrigin = `${(100 * Sy.cropX).toFixed(3)}% ${(100 * Sy.cropY).toFixed(3)}%`, 
            fy.style.transform = `rotate(${Sy.cropRotation.toFixed(2)}deg) translateZ(0)`, yy.value = String(Sy.cropZoom), 
            by.value = `${Math.round(100 * Sy.cropZoom)}%`;
            const c = Sy.cropRotation * Math.PI / 180, d = 50 + 47 * Math.sin(c), u = 50 - 47 * Math.cos(c), p = Math.round(Sy.cropRotation);
            wy.setAttribute("cx", d.toFixed(2)), wy.setAttribute("cy", u.toFixed(2)), ky.value = `${p}°`, 
            vy.setAttribute("aria-valuenow", String(p)), vy.setAttribute("aria-valuetext", `${p} degrees`);
        }
        function Py() {
            if (null === xy || !Sy) return;
            const e = Object.assign({}, Sy, {
                cropReady: !0,
                manualCrop: !0 === Sy.manualCrop
            });
            Wy[xy] = e;
        }
        function Ly() {
            Sy && (Cy++, Sy.cropReady = !0, Sy.manualCrop = !0);
        }
        function Ty(e) {
            const t = Wy[e];
            if (!t) return;
            My++, Cy = 0, xy = e, Sy = Object.assign({}, t);
            const n = _g.querySelector(".dialog-body");
            Ay = n ? n.scrollTop : 0, _g.open && Ui(_g), fy.onload = async () => {
                await async function(e = !1) {
                    if (!Sy || !fy.naturalWidth) return !1;
                    if (!0 === Sy.manualCrop) return !1;
                    if (!e && Sy.cropReady) return !1;
                    if (!e && (Math.abs(Sy.cropX - .5) > .001 || Math.abs(Sy.cropY - .5) > .001 || Math.abs(Sy.cropZoom - 1) > .001)) return !1;
                    const t = Sy, n = Cy, i = ++My, a = await iw(fy, t.width, t.height);
                    return Sy === t && i === My && n === Cy && (a ? Object.assign(Sy, a, {
                        cropReady: !0,
                        manualCrop: !1
                    }) : Object.assign(Sy, {
                        cropX: .5,
                        cropY: .5,
                        cropZoom: 1,
                        cropReady: !0,
                        manualCrop: !1
                    }), Iy(), Boolean(a));
                }(), requestAnimationFrame(Iy);
            }, fy.src = t.data, Wi(gy), requestAnimationFrame(Iy);
        }
        function Fy() {
            My++, Py(), Ui(gy), $y = null, Ey = null, vy.classList.remove("is-dragging"), xy = null, 
            Sy = null, fy.onload = null, fy.removeAttribute("src"), Wi(_g), ew(), Hy && Mr({
                animate: !1
            }), requestAnimationFrame(() => {
                const e = _g.querySelector(".dialog-body");
                e && (e.scrollTop = Ay);
            });
        }
        function Ny(e, t = !0) {
            Sy && (Ly(), Sy.cropRotation = Math.max(-180, Math.min(180, Number(e) || 0)), Iy(), 
            t && Py());
        }
        function _y(e) {
            const t = vy.getBoundingClientRect(), n = e.clientX - (t.left + t.width / 2), i = e.clientY - (t.top + t.height / 2);
            return 180 * Math.atan2(n, -i) / Math.PI;
        }
        e.byId("closeProfileCrop").onclick = Fy, gy.addEventListener("click", e => {
            e.target === gy && Fy();
        }), gy.addEventListener("cancel", e => {
            e.preventDefault(), Fy();
        }), yy.addEventListener("input", () => {
            Sy && (Ly(), Sy.cropZoom = Number(yy.value), Iy(), Py());
        }), vy.addEventListener("pointerdown", e => {
            if (Sy && ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button)) {
                Ey = e.pointerId, vy.classList.add("is-dragging");
                try {
                    vy.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                Ny(_y(e), !1), e.preventDefault(), e.stopPropagation();
            }
        }), vy.addEventListener("pointermove", e => {
            Ey === e.pointerId && (Ny(_y(e), !1), e.preventDefault());
        });
        const Dy = e => {
            Ey === e.pointerId && (Ey = null, vy.classList.remove("is-dragging"), Py());
        };
        vy.addEventListener("pointerup", Dy), vy.addEventListener("pointercancel", Dy), 
        vy.addEventListener("keydown", e => {
            if (!Sy || ![ "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home" ].includes(e.key)) return;
            e.preventDefault();
            const t = e.shiftKey ? 10 : 1, n = Number(Sy.cropRotation) || 0;
            Ny("Home" === e.key ? 0 : n + ("ArrowLeft" === e.key || "ArrowDown" === e.key ? -t : t));
        }), e.byId("resetProfileCrop").onclick = () => {
            Sy && (Ly(), Object.assign(Sy, {
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropRotation: 0,
                cropReady: !0,
                manualCrop: !0
            }), Iy(), Py());
        }, e.byId("saveProfileCrop").onclick = () => {
            null !== xy && Sy && (Py(), Fy(), sm.textContent = "Crop saved.");
        }, my.addEventListener("pointerdown", e => {
            if (!Sy || ("mouse" === e.pointerType || "pen" === e.pointerType) && 0 !== e.button) return;
            Ly();
            const t = my.clientWidth, n = my.clientHeight, i = Math.max(t / Sy.width, n / Sy.height) * Sy.cropZoom;
            $y = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                cropX: Sy.cropX,
                cropY: Sy.cropY,
                drawWidth: Sy.width * i,
                drawHeight: Sy.height * i
            }, my.classList.add("is-dragging");
            try {
                my.setPointerCapture(e.pointerId);
            } catch (e) { __sxErrLog("pointer-capture", e); }
            e.preventDefault();
        }), my.addEventListener("pointermove", e => {
            $y && $y.pointerId === e.pointerId && Sy && (Sy.cropX = $y.cropX - (e.clientX - $y.startX) / $y.drawWidth, 
            Sy.cropY = $y.cropY - (e.clientY - $y.startY) / $y.drawHeight, Iy(), e.preventDefault());
        });
        const Ry = e => {
            $y && $y.pointerId === e.pointerId && ($y = null, my.classList.remove("is-dragging"));
        };
        my.addEventListener("pointerup", Ry), my.addEventListener("pointercancel", Ry);
        const Oy = e.byId("profileLoadMenu"), By = e.byId("profileAddMenu"), jy = e.byId("profileSampleMenu");
        let qy = null, Hy = null, Wy = [], Uy = "", Gy = [], Ky = 0, zy = null, Vy = null, jY = null, Yy = null, Xy = null;
        // Pair-tab load target (2026-10-27): set by ww when the import
        // dialog is opened from a pair tab's Load menu, cleared when
        // the dialog closes or a merge consumes it. While set, a
        // single-profile file import merges into that pair record
        // (see the merge branch in rk) instead of creating a profile.
        let sxPairLoadInto = null;
        // Load origin (split-center stage, 2026-10-27; activate-first
        // restored by the shell-ui stage, 2026-10-27): the profile a
        // Load action was PRESSED FROM, carried explicitly from the
        // tab's Load menu through the import dialog to the merge.
        // The target of a Load is this origin — never a profile the
        // viewport merely happens to display. Pressing Load also
        // activates the pressed tab first (see the Load handler), so
        // the displayed profile and the origin coincide; the explicit
        // origin, not the display, remains the targeting mechanism.
        // sxLoadOriginId is set
        // by ww from the menu's pressed tab and cleared when the
        // import dialog closes; sxConverterOrigin is the same origin
        // handed to a converter session (Ax), so the converter's
        // final Load lands on the origin with no second "which
        // profile?" dialogue.
        let sxLoadOriginId = null, sxConverterOrigin = null;
        // Merge immediate save (split-center stage, 2026-10-27): a
        // load's merged data is saved to profile memory IMMEDIATELY,
        // in the same act as the merge — not left resting on the
        // dirty flag and the timed draft autosave. Mirrors the Save
        // button exactly: with profile memory enabled, persist now
        // and clear the unsaved mark only when the persist succeeds;
        // without it, the merge is saved in this tab (mark cleared).
        function sxMergeSaveNow(id) {
            if (!id || !vt[id]) return;
            try {
                const cb = e.byId("rememberProfileCheckbox2x"), rp = window.Sexcapades2xRememberProfiles;
                if (cb && cb.checked && rp && "function" == typeof rp.saveNow) rp.saveNow() && Vt(id); else Vt(id);
            } catch (err) { __sxErrLog("sx-merge-save", err); }
        }
        const Zy = {};
        function Qy(t = Mt) {
            if (!t || !vt[t]) return Vy = e => Qy(e), void bw(null);
            // Activated-from: the chooser's target rides in Xy,
            // explicitly — no viewport switch to make it the active
            // profile first (split-center stage, 2026-10-27).
            Xy = t, kw(), Ui(kg), Ui(Sg), Wi(e.byId("testChooserDialog")),
            requestAnimationFrame(() => e.one("[data-test-choice]")?.focus());
        }
        function Jy() {
            Xy = null, Ui(e.byId("testChooserDialog"));
        }
        // Popularity scores shown in parentheses beside gender/orientation/role options in
        // the profile dialog, keyed by option value slug (values never change). Each scored
        // entry also carries a `source` name and `url`: hovering or focusing the option shows
        // the picker tooltip with the definition plus a clickable source line (appended by
        // popularitySourceLine). Sources: NZ national sexuality survey (N=12,885) for
        // straight/heterosexual (94.7% ±0.26), bisexual (0.8% ±0.11) and the homosexual figure
        // (0.6% ±0.09) — the survey reported 'homosexual' as one combined gay/lesbian figure,
        // applied to both Gay and Lesbian here. Ace prevalence: asexual ~1–2% (Bogaert 2004,
        // UK national probability sample, N≈18,000, found ~1% reporting no sexual attraction;
        // later reviews range higher) and demisexual ~0.6% (Pitcher et al. 2024, Journal of
        // LGBT Youth, N=17,112). Gender Census 2025 for nonbinary (61.7%) and transgender
        // (41.1%) — note those are shares among nonbinary-community respondents, a different
        // denominator from the general-population figures above. Role prevalence among BDSM
        // practitioners from Coppens et al., "The Psychology of Kink" survey: submissive
        // 39.5%, switch 31.1%, dominant 28.8% — the scored roles sort first in that order and
        // the remaining roles follow alphabetically (Unsure kept last, unburied).
        // Corroborating role data: Joyal & Carpentier 2017 (Journal of Sex Research), whose
        // general-population survey of paraphilic interests and behaviors likewise found
        // submissive and dominant role interests widely endorsed. Options with no entry show
        // no score and no source line.
        const POPULARITY_SOURCES = {
            nz: {
                source: "NZ National Sexuality Survey, N=12,885",
                url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3081103/"
            },
            genderCensus: {
                source: "Gender Census 2025, worldwide nonbinary community survey",
                url: "https://www.gendercensus.com/results/2025-worldwide/"
            },
            coppens: {
                source: "Coppens et al., Psychology of Kink survey",
                url: "https://www.researchgate.net/publication/339238941_The_Psychology_of_Kink_a_Survey_Study_into_the_Relationships_of_Trauma_and_Attachment_Style_with_BDSM_Interests"
            }
        };
        const POPULARITY_SCORES = {
            straight: {
                score: "94.7% ±0.26",
                ...POPULARITY_SOURCES.nz
            },
            heterosexual: {
                score: "94.7% ±0.26",
                ...POPULARITY_SOURCES.nz
            },
            bisexual: {
                score: "0.8% ±0.11",
                ...POPULARITY_SOURCES.nz
            },
            gay: {
                score: "0.6% ±0.09",
                ...POPULARITY_SOURCES.nz
            },
            lesbian: {
                score: "0.6% ±0.09",
                ...POPULARITY_SOURCES.nz
            },
            asexual: {
                score: "~1–2%",
                source: "Bogaert 2004, UK national probability sample, N≈18,000",
                url: "https://www.researchgate.net/publication/6462028_Asexuality_Classification_and_Characterization"
            },
            demisexual: {
                score: "~0.6%",
                source: "Pitcher et al. 2024, Journal of LGBT Youth, N=17,112",
                url: "https://psycnet.apa.org/record/2023-68523-001"
            },
            nonbinary: {
                score: "61.7%",
                ...POPULARITY_SOURCES.genderCensus
            },
            transgender: {
                score: "41.1%",
                ...POPULARITY_SOURCES.genderCensus
            },
            submissive: {
                score: "39.5%",
                ...POPULARITY_SOURCES.coppens
            },
            switch: {
                score: "31.1%",
                ...POPULARITY_SOURCES.coppens
            },
            dominant: {
                score: "28.8%",
                ...POPULARITY_SOURCES.coppens
            }
        };
        function popularitySuffix(e) {
            const t = POPULARITY_SCORES[e];
            return t ? " (" + t.score + ")" : "";
        }
        function popularitySourceLine(e, t) {
            const n = POPULARITY_SCORES[t];
            if (!n || !n.source) return;
            const i = document.createElement("span");
            i.className = "picker-source", i.appendChild(document.createTextNode(" Source: "));
            if (n.url) {
                const a = document.createElement("a");
                a.href = n.url, a.target = "_blank", a.rel = "noopener noreferrer", a.textContent = n.source, 
                i.appendChild(a);
            } else i.appendChild(document.createTextNode(n.source));
            e.appendChild(i);
        }
        const eb = [ "Man", "Woman", "Nonbinary", "Transgender", "Trans Man", "Trans Woman", "Genderqueer", "Agender", "Androgyne", "Androx", "Apagender", "Bigender", "Butch", "Cisgender", "Crossdresser", "Demifem", "Demigender", "Demimasc", "Demiman", "Demivoid", "Demiwoman", "Femme", "Gender Expansive", "Gender Neutral", "Gender Non-Conforming", "Genderfae", "Genderfluid", "Genderflux", "Genderfuck", "Gendervoid", "Gynx", "Hijra", "Intersex", "Intersex Man", "Intersex Woman", "Masc", "Maverique", "Multigender", "Omnigender", "Pangender", "Plural", "Polygender", "Trans Nonbinary", "Transfeminine", "Transmasculine", "Trigender", "Two-Spirit", "Xenogender", "Questioning", "Unsure", "Not Applicable" ], tb = eb.map(e => e.toLowerCase().replace(/\s+/g, "-")), nb = {
            man: "A person whose gender identity is man, regardless of sex assigned at birth.",
            woman: "A person whose gender identity is woman, regardless of sex assigned at birth.",
            nonbinary: "A gender identity outside an exclusively man-or-woman binary.",
            genderqueer: "An identity that challenges, mixes, or falls outside conventional gender categories.",
            genderfluid: "A gender identity that changes over time or across situations.",
            genderflux: "A gender whose intensity changes, sometimes becoming weak or absent.",
            genderfae: "A fluid gender that may include feminine and neutral genders, but not masculine genders.",
            "gender-neutral": "A gender identity experienced as neutral rather than masculine or feminine.",
            "gender-non-conforming": "A broad identity or expression that does not follow conventional gender expectations.",
            "gender-expansive": "An umbrella identity for gender experiences broader than conventional binary expectations.",
            maverique: "A distinct nonbinary gender not defined by masculinity, femininity, or absence of gender.",
            xenogender: "A nonbinary gender described through concepts or metaphors beyond conventional masculine–feminine language.",
            cisgender: "A person whose gender aligns with the sex they were assigned at birth.",
            transgender: "A person whose gender differs from the sex they were assigned at birth.",
            "trans-man": "A man who is transgender.",
            "trans-woman": "A woman who is transgender.",
            "trans-nonbinary": "A nonbinary person who also identifies as transgender.",
            transmasculine: "A person whose gender or transition moves toward masculinity without necessarily identifying only as a man.",
            transfeminine: "A person whose gender or transition moves toward femininity without necessarily identifying only as a woman.",
            apagender: "A person who feels apathetic or indifferent toward their own gender identity.",
            agender: "A person who experiences no gender or identifies without a gender.",
            gendervoid: "An absence of gender experienced specifically as a blank, void, or empty space.",
            bigender: "A person who experiences two genders, either together or at different times.",
            trigender: "A person who experiences three genders, either together or at different times.",
            demigender: "A person who feels a partial connection to a gender and partial disconnection from it.",
            demiman: "A person who identifies partly, but not wholly, as a man.",
            demiwoman: "A person who identifies partly, but not wholly, as a woman.",
            demimasc: "A person who feels a partial connection to masculinity, without necessarily identifying as a man.",
            demifem: "A person who feels a partial connection to femininity, without necessarily identifying as a woman.",
            demivoid: "A person who feels partly genderless or connected to a gender void.",
            multigender: "An umbrella identity for experiencing more than one gender.",
            polygender: "A person who experiences several genders, together or at different times.",
            omnigender: "A person who experiences all genders, often with awareness of their distinctions.",
            pangender: "A person who identifies with many or all genders available within their cultural understanding.",
            plural: "A plural system whose members may have different genders or a shared system-level identity.",
            masc: "A gender identity or presentation centered on masculinity without necessarily being a man.",
            femme: "A gender identity or presentation centered on femininity without necessarily being a woman.",
            butch: "A masculine queer identity with its own community and cultural history.",
            androgyne: "A gender identity blending or existing between masculine and feminine qualities.",
            genderfuck: "A deliberately disruptive or mixed gender identity or presentation that resists conventional categories.",
            crossdresser: "A person who wears clothing associated with another gender; this describes expression, not necessarily identity.",
            androx: "A nonbinary gender that combines masculine and neutral qualities.",
            gynx: "A nonbinary gender that combines feminine and neutral qualities.",
            "two-spirit": "A culturally specific identity used by some Indigenous North American people for particular gender, social, or spiritual roles.",
            hijra: "A traditional South Asian gender identity and community distinct from the man–woman binary.",
            intersex: "A person born with sex characteristics that do not fit typical definitions of male or female bodies; intersex is not itself a gender.",
            "intersex-man": "An intersex person whose gender identity is man.",
            "intersex-woman": "An intersex person whose gender identity is woman.",
            questioning: "A person who is actively exploring or uncertain about their gender identity.",
            unsure: "A person who is not currently sure which gender label fits.",
            "not-applicable": "Use when gender is not relevant to this profile."
        }, ib = Object.fromEntries(eb.map((e, t) => {
            const n = tb[t];
            return [ n, {
                label: e,
                description: nb[n]
            } ];
        }));
        ib.couple = {
            label: "Couple / shared profile",
            description: "A shared profile representing two partners rather than one gender identity."
        };
        const ab = [ {
            label: "Sexual orientations",
            options: [ "Straight", "Heterosexual", "Bisexual", "Gay", "Lesbian", "Asexual", "Pansexual", "Demisexual", "Graysexual", "Abrosexual", "Achillean", "Aceflux", "Acespec", "Acespike", "Aegosexual", "Allosexual", "Androflexible", "Androsexual", "Androgynosexual", "Apothisexual", "Autosexual", "Benignosexual", "Bicurious", "Ceterosexual", "Cupiosexual", "Dyke", "Fictosexual", "Finsexual", "Fraysexual", "Gynesexual", "Homoflexible", "Homosexual", "Lithosexual", "Megasexual", "Minsexual", "Monosexual", "Nebulasexual", "Neptunic", "Ninsexual", "Noetisexual", "Objectumsexual", "Omnisexual", "Orchidsexual", "Pancurious", "Phallosexual", "Placiosexual", "Polysexual", "Queer", "Quoisexual", "Reciprosexual", "Sapiosexual", "Sapphic", "Saturnic", "Sex-Favorable", "Soulsexual", "Spectrasexual", "Symbiosexual", "T4T", "Uranic", "Yonisexual" ]
        }, {
            label: "Romantic orientations",
            options: [ "Alloromantic", "Androromantic", "Apresromantic", "Aroflux", "Aromantic", "Arospec", "Benignoromantic", "Biromantic", "Cupioromantic", "Demiromantic", "Finromantic", "Frayromantic", "Grayromantic", "Gyneromantic", "Heteroromantic", "Homoromantic", "Lithoromantic", "Minromantic", "Monoromantic", "Nebularomantic", "Noetiromantic", "Omniromantic", "Panromantic", "Platoniromantic", "Polyromantic", "Quoiromantic", "Recipromantic", "Sapioromantic" ]
        }, {
            label: "Other",
            options: [ "Fluid", "Fluctuating/Evolving", "Unsure", "Questioning", "Exploring", "Not Applicable" ]
        } ], rb = {
            straight: "Attraction primarily to people of a different gender.",
            heterosexual: "Sexual attraction primarily to people of a different gender.",
            bicurious: "Curiosity about attraction or experiences with more than one gender without necessarily claiming a bisexual identity.",
            bisexual: "Attraction to more than one gender; the pattern or intensity may differ by gender.",
            homoflexible: "Primarily same-gender attraction with occasional attraction to other genders.",
            gay: "Attraction primarily to people of the same gender; often used by men, and sometimes more broadly.",
            lesbian: "A woman or nonbinary person whose attraction is primarily toward women.",
            dyke: "A reclaimed lesbian identity, often carrying a deliberately strong or gender-nonconforming cultural meaning.",
            homosexual: "Sexual attraction primarily to people of the same gender.",
            pansexual: "Attraction in which gender is not a determining boundary, though gender can still be noticed.",
            pancurious: "Curiosity about attraction to people regardless of gender without necessarily claiming a pansexual identity.",
            omnisexual: "Attraction to people of all genders, with gender potentially shaping how attraction feels.",
            queer: "A broad, self-chosen identity for attraction or relationships outside heterosexual and cisgender norms.",
            androsexual: "Attraction to men or masculinity, regardless of the attracted person’s own gender.",
            androflexible: "Primarily attraction to men or masculinity, with occasional attraction beyond that pattern.",
            minsexual: "Attraction to people whose gender or presentation is masculine in nature.",
            gynesexual: "Attraction to women or femininity, regardless of the attracted person’s own gender.",
            finsexual: "Attraction to people whose gender or presentation is feminine in nature.",
            androgynosexual: "Attraction to androgynous people or androgynous gender expression.",
            ninsexual: "Attraction to people whose gender is neutral or nonbinary in nature.",
            phallosexual: "Attraction centered on partners with a penis, regardless of their gender identity.",
            yonisexual: "Attraction centered on partners with a vulva or vagina, regardless of their gender identity.",
            achillean: "An umbrella term for men and masculine-aligned nonbinary people attracted to men.",
            sapphic: "An umbrella term for women and feminine-aligned nonbinary people attracted to women.",
            uranic: "Attraction to men and masculine or neutral nonbinary people, but not to women.",
            neptunic: "Attraction to women and feminine or neutral nonbinary people, but not to men.",
            saturnic: "Attraction only to nonbinary people, including man- or woman-aligned nonbinary people, but not binary men or women.",
            ceterosexual: "Attraction primarily or exclusively to nonbinary people.",
            t4t: "A trans person’s preference for or orientation toward relationships with other trans people.",
            monosexual: "Attraction to only one gender.",
            polysexual: "Attraction to multiple genders, but not necessarily all genders.",
            spectrasexual: "Attraction to a range or spectrum of genders rather than one fixed category.",
            abrosexual: "A sexual orientation whose pattern or intensity changes over time.",
            demisexual: "Sexual attraction that develops only after a strong emotional bond forms.",
            megasexual: "Emotional connection that tends to develop only after a strong sexual connection forms.",
            noetisexual: "Sexual attraction strongly shaped by a person’s mind, ideas, or way of thinking.",
            soulsexual: "Attraction centered on a person’s inner self or perceived soul rather than gender.",
            symbiosexual: "Attraction to the shared energy, connection, or dynamic between people in an existing relationship.",
            benignosexual: "Attraction centered on kindness, compassion, or caring behavior.",
            fraysexual: "Sexual attraction that is strongest without an emotional bond and may fade as closeness develops.",
            sapiosexual: "Sexual attraction strongly centered on perceived intelligence.",
            asexual: "Experiencing little or no sexual attraction; this does not by itself describe libido or behavior.",
            acespec: "An umbrella term for identities on the asexual spectrum.",
            aceflux: "An asexual-spectrum identity in which the intensity of sexual attraction changes over time.",
            acespike: "Usually experiencing little or no sexual attraction, with occasional sudden periods of attraction.",
            graysexual: "Experiencing sexual attraction rarely, weakly, or only under limited circumstances.",
            orchidsexual: "Experiencing sexual attraction but not desiring a sexual relationship or sexual activity.",
            reciprosexual: "Experiencing sexual attraction only after learning that the other person is attracted to you.",
            lithosexual: "Experiencing sexual attraction without wanting it reciprocated, or losing attraction when it is reciprocated.",
            cupiosexual: "Experiencing little or no sexual attraction while still desiring a sexual relationship.",
            "sex-favorable": "Feeling personally positive about or comfortable with sexual activity; this can coexist with any orientation.",
            apothisexual: "An asexual identity that includes strong aversion to or repulsion toward sexual activity.",
            aegosexual: "Experiencing a disconnect between oneself and sexual attraction or fantasy, often enjoying the idea without wanting personal participation.",
            placiosexual: "Enjoying performing sexual acts for others while having little or no desire to receive them.",
            nebulasexual: "Difficulty distinguishing sexual attraction from other feelings, often in connection with neurodivergence.",
            autosexual: "Sexual attraction directed primarily toward oneself.",
            fictosexual: "Sexual attraction primarily or exclusively toward fictional characters.",
            objectumsexual: "Sexual or romantic attraction toward particular objects.",
            quoisexual: "Difficulty understanding, distinguishing, or applying the concept of sexual attraction to oneself.",
            allosexual: "Experiencing sexual attraction; often used as the counterpart to asexual-spectrum identities.",
            heteroromantic: "Romantic attraction primarily to people of a different gender.",
            biromantic: "Romantic attraction to more than one gender.",
            homoromantic: "Romantic attraction primarily to people of the same gender.",
            androromantic: "Romantic attraction to men or masculinity.",
            gyneromantic: "Romantic attraction to women or femininity.",
            minromantic: "Romantic attraction to people whose gender or presentation is masculine in nature.",
            finromantic: "Romantic attraction to people whose gender or presentation is feminine in nature.",
            panromantic: "Romantic attraction in which gender is not a determining boundary.",
            omniromantic: "Romantic attraction to people of all genders, with gender potentially shaping the attraction.",
            polyromantic: "Romantic attraction to multiple genders, but not necessarily all genders.",
            monoromantic: "Romantic attraction to only one gender.",
            demiromantic: "Romantic attraction that develops only after a strong emotional bond forms.",
            apresromantic: "Romantic attraction that develops only after another form of attraction is already present.",
            noetiromantic: "Romantic attraction strongly shaped by a person’s mind, ideas, or way of thinking.",
            benignoromantic: "Romantic attraction centered on kindness, compassion, or caring behavior.",
            frayromantic: "Romantic attraction that is strongest without an emotional bond and may fade as closeness develops.",
            sapioromantic: "Romantic attraction strongly centered on perceived intelligence.",
            aromantic: "Experiencing little or no romantic attraction; this does not rule out close or committed relationships.",
            arospec: "An umbrella term for identities on the aromantic spectrum.",
            aroflux: "An aromantic-spectrum identity in which the intensity of romantic attraction changes over time.",
            grayromantic: "Experiencing romantic attraction rarely, weakly, or only under limited circumstances.",
            nebularomantic: "Difficulty distinguishing romantic attraction from other feelings, often in connection with neurodivergence.",
            quoiromantic: "Difficulty understanding, distinguishing, or applying the concept of romantic attraction to oneself.",
            platoniromantic: "Difficulty distinguishing romantic attraction from strong platonic attraction.",
            recipromantic: "Experiencing romantic attraction only after learning that the other person is romantically attracted to you.",
            lithoromantic: "Experiencing romantic attraction without wanting it reciprocated, or losing it when reciprocated.",
            cupioromantic: "Experiencing little or no romantic attraction while still desiring a romantic relationship.",
            alloromantic: "Experiencing romantic attraction; often used as the counterpart to aromantic-spectrum identities.",
            fluid: "An orientation whose pattern or intensity changes over time.",
            "fluctuating-evolving": "An orientation that is changing, developing, or understood differently over time.",
            unsure: "Use when you are not currently sure which orientation label fits.",
            questioning: "Actively exploring or reconsidering your sexual or romantic orientation.",
            exploring: "Trying experiences or considering possibilities without committing to a fixed label.",
            "not-applicable": "Use when orientation is not relevant to this profile."
        }, ob = ab.flatMap(e => e.options.map(t => ({
            group: e.label,
            label: t,
            value: t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        }))), sb = Object.fromEntries(ob.map(e => [ e.value, {
            label: e.label,
            group: e.group,
            description: rb[e.value]
        } ]));
        sb.heteroflexible = {
            label: "Heteroflexible",
            group: "Legacy",
            description: "Primarily different-gender attraction with occasional attraction to the same gender."
        }, sb.mixed = {
            label: "Mixed / shared",
            group: "Legacy",
            description: "A shared profile whose participants have different orientations."
        }, sb.other = {
            label: "Other / not listed",
            group: "Legacy",
            description: "An orientation that is not represented by the available labels."
        };
        const lb = [ "Submissive", "Switch", "Dominant", "Ageplayer", "Babygirl", "Bottom", "Brat", "Daddy", "Domme", "Fetishist", "Kajira", "Kajirus", "Key-holder", "Kinkster", "Masochist", "Master", "Mistress", "Mommy", "Owner", "Pet", "Sadist", "Slave", "Top", "Vanilla", "Unsure" ], cb = lb.map(e => e.toLowerCase()), db = {
            vanilla: "Prefers sexual or romantic activity outside BDSM or other explicitly kinky dynamics.",
            unsure: "Still exploring which kink or power-exchange roles feel right.",
            top: "Performs or directs an activity in a scene; this describes what someone does, not necessarily who holds power.",
            bottom: "Receives or is acted upon in a scene; this describes what someone does, not necessarily who holds power.",
            switch: "Enjoys taking different sides of a role or power dynamic at different times.",
            fetishist: "Has a strong erotic focus on a particular object, material, body part, or situation.",
            kinkster: "A broad term for someone who enjoys kink or BDSM without naming one specific role.",
            dominant: "Consensually holds authority or control within a negotiated power-exchange dynamic.",
            domme: "A feminine-identifying Dominant who consensually holds authority or control in a power exchange.",
            submissive: "Consensually yields authority or control within a negotiated power-exchange dynamic.",
            brat: "A submissive who playfully resists, teases, or challenges a partner as part of the agreed dynamic.",
            daddy: "A nurturing, guiding, or authoritative role in a consensual adult age-play or caregiver dynamic.",
            mommy: "A nurturing, guiding, or authoritative feminine role in a consensual adult age-play or caregiver dynamic.",
            ageplayer: "An adult who consensually adopts or relates to an age different from their chronological age during role-play.",
            babygirl: "An adult who takes a younger, cared-for, or submissive role in a consensual age-play or caregiver dynamic.",
            pet: "A person who consensually takes on an animal-inspired or owned role in pet play.",
            sadist: "Enjoys consensually causing pain, intensity, or controlled suffering to a willing partner.",
            masochist: "Enjoys consensually receiving pain, intensity, or controlled suffering.",
            master: "A Dominant title commonly used in a structured or ongoing authority-based relationship.",
            mistress: "A feminine Dominant title commonly used in a structured or ongoing authority-based relationship.",
            slave: "A submissive identity involving a deeply negotiated surrender of authority, within explicit consent and limits.",
            kajira: "A feminine slave-role identity drawn from Gorean fiction and practiced by some adults in consensual power exchange.",
            kajirus: "A masculine slave-role identity drawn from Gorean fiction and practiced by some adults in consensual power exchange.",
            owner: "Consensually holds an ongoing ownership role over a partner within a negotiated power-exchange dynamic.",
            "key-holder": "Holds the key to a partner's chastity device and controls its release within a negotiated dynamic."
        }, ub = Object.fromEntries(lb.map((e, t) => {
            const n = cb[t];
            return [ n, {
                label: e,
                description: db[n]
            } ];
        })), pb = e.byId("genderPicker"), hb = e.byId("genderTrigger"), gb = e.byId("genderTriggerLabel"), mb = e.byId("genderMenu"), fb = e.byId("genderTooltip");
        n(mb, tb.map(e => `<button class="gender-option" type="button" role="option" data-tooltip-tap-first data-gender-value="${Hi(e)}" aria-selected="false">${Hi(ib[e].label + popularitySuffix(e))}</button>`).join(""));
        const yb = {
            female: "woman",
            male: "man",
            genderless: "agender",
            demiboy: "demiman",
            demigirl: "demiwoman",
            "intersex-male": "intersex-man",
            "intersex-female": "intersex-woman",
            mtf: "trans-woman",
            ftm: "trans-man",
            private: "not-applicable",
            "non-binary": "nonbinary"
        };
        function bb(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = yb[t] || t, Object.prototype.hasOwnProperty.call(ib, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 3);
        }
        function vb(e, t = " + ") {
            return bb(e).map(e => ib[e].label).join(t);
        }
        function wb() {
            return bb([ ...Wg.selectedOptions ].map(e => e.value));
        }
        function kb(e) {
            const t = new Set(bb(e));
            [ ...Wg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function xb() {
            const e = new Set(wb()), t = vb([ ...e ]);
            gb.textContent = t || "Choose up to 3…", hb.title = t || "Choose up to three genders", 
            mb.querySelectorAll("[data-gender-value]").forEach(t => {
                const n = e.has(t.dataset.genderValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 3 && !n));
            });
        }
        function Sb() {
            fb.hidden = !0, mb.querySelectorAll('[aria-describedby="genderTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function $b(e) {
            const t = ib[e.dataset.genderValue];
            if (!t) return;
            Sb(), fb.textContent = t.description || t.label, popularitySourceLine(fb, e.dataset.genderValue), fb.hidden = !1, e.setAttribute("aria-describedby", "genderTooltip");
            const n = e.getBoundingClientRect(), i = fb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), fb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px", 
            fb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Eb(e = !1) {
            mb.hidden = !0, hb.setAttribute("aria-expanded", "false"), Sb(), e && hb.focus();
        }
        function Ab() {
            mb.hidden = !1, hb.setAttribute("aria-expanded", "true"), xb();
            const e = mb.querySelector('[aria-selected="true"]') || mb.querySelector(".gender-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        hb.addEventListener("click", () => mb.hidden ? Ab() : Eb(!0)), hb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(), 
            Ab());
        }), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = new Set(wb()), i = t.dataset.genderValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 3)) return sm.textContent = "Choose no more than three genders.", 
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            kb([ ...n ]), Wg.dispatchEvent(new Event("change", {
                bubbles: !0
            })), xb(), t.focus({
                preventScroll: !0
            }), $b(t);
        }), mb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = performance.now();
            if (mb._tfEl === t && n < mb._tfUntil) return mb._tfEl = null, mb._tfBlock = null, void Sb();
            mb._tfEl = t, mb._tfUntil = n + 3200, mb._tfBlock = t, $b(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && mb._tfBlock === t && (mb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), mb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && $b(t);
        }), mb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && $b(t);
        }), pb.addEventListener("mouseleave", Sb), mb.addEventListener("focusout", () => t.setTimeout(() => {
            (mb.contains(document.activeElement) || fb.contains(document.activeElement)) || Sb();
        }, 0)), mb.addEventListener("keydown", e => {
            const t = [ ...mb.querySelectorAll(".gender-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Eb(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const Cb = e.byId("sexualityPicker"), Mb = e.byId("sexualityTrigger"), Ib = e.byId("sexualityTriggerLabel"), Pb = e.byId("sexualityMenu"), Lb = e.byId("sexualityTooltip");
        function Tb() {
            return iv([ ...Ug.selectedOptions ].map(e => e.value));
        }
        function Fb(e) {
            const t = new Set(iv(e));
            [ ...Ug.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function Nb(e, t = " + ") {
            return iv(e).map(e => sb[e].label).join(t);
        }
        function _b() {
            const e = new Set(Tb()), t = Nb([ ...e ]);
            Ib.textContent = t || "Choose up to 5…", Mb.title = t || "Choose up to five orientations", 
            Pb.querySelectorAll("[data-sexuality-value]").forEach(t => {
                const n = e.has(t.dataset.sexualityValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function Db() {
            Lb.hidden = !0, Pb.querySelectorAll('[aria-describedby="sexualityTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function Rb(e) {
            const t = sb[e.dataset.sexualityValue];
            if (!t) return;
            Db(), Lb.textContent = t.description || t.label, popularitySourceLine(Lb, e.dataset.sexualityValue), Lb.hidden = !1, e.setAttribute("aria-describedby", "sexualityTooltip");
            const n = e.getBoundingClientRect(), i = Lb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Lb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px", 
            Lb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Ob(e = !1) {
            Pb.hidden = !0, Mb.setAttribute("aria-expanded", "false"), Db(), e && Mb.focus();
        }
        function Bb() {
            Pb.hidden = !1, Mb.setAttribute("aria-expanded", "true"), _b();
            const e = Pb.querySelector('[aria-selected="true"]') || Pb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Pb, ab.map(e => `<div class="sexuality-group-label" role="presentation">${Hi(e.label)}</div>${e.options.map(e => {
                const t = e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-sexuality-value="${Hi(t)}" aria-selected="false">${Hi(e + popularitySuffix(t))}</button>`;
            }).join("")}`).join("")), 
        Mb.addEventListener("click", () => Pb.hidden ? Bb() : Ob(!0)), Mb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(), 
            Bb());
        }), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = new Set(Tb()), i = t.dataset.sexualityValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five orientations.", 
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            Fb([ ...n ]), Ug.dispatchEvent(new Event("change", {
                bubbles: !0
            })), _b(), t.focus({
                preventScroll: !0
            }), Rb(t);
        }), Pb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = performance.now();
            if (Pb._tfEl === t && n < Pb._tfUntil) return Pb._tfEl = null, Pb._tfBlock = null, void Db();
            Pb._tfEl = t, Pb._tfUntil = n + 3200, Pb._tfBlock = t, Rb(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Pb._tfBlock === t && (Pb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Pb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Rb(t);
        }), Pb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Rb(t);
        }), Cb.addEventListener("mouseleave", Db), Pb.addEventListener("focusout", () => t.setTimeout(() => {
            (Pb.contains(document.activeElement) || Lb.contains(document.activeElement)) || Db();
        }, 0)), Pb.addEventListener("keydown", e => {
            const t = [ ...Pb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Ob(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const jb = e.byId("rolePicker"), qb = e.byId("roleTrigger"), Hb = e.byId("roleTriggerLabel"), Wb = e.byId("roleMenu"), Ub = e.byId("roleTooltip");
        function Gb(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                const t = String(e || "").trim().toLowerCase();
                Object.prototype.hasOwnProperty.call(ub, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function Kb(e, t = " + ") {
            return Gb(e).map(e => ub[e].label).join(t);
        }
        function zb() {
            return Gb([ ...Gg.selectedOptions ].map(e => e.value));
        }
        function Vb(e) {
            const t = new Set(Gb(e));
            [ ...Gg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function Yb() {
            const e = new Set(zb()), t = Kb([ ...e ]);
            Hb.textContent = t || "Choose up to 5…", qb.title = t || "Choose up to five roles", 
            Wb.querySelectorAll("[data-role-value]").forEach(t => {
                const n = e.has(t.dataset.roleValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function Xb() {
            Ub.hidden = !0, Wb.querySelectorAll('[aria-describedby="roleTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function Zb(e) {
            const t = ub[e.dataset.roleValue];
            if (!t) return;
            Xb(), Ub.textContent = t.description || t.label, popularitySourceLine(Ub, e.dataset.roleValue), Ub.hidden = !1, e.setAttribute("aria-describedby", "roleTooltip");
            const n = e.getBoundingClientRect(), i = Ub.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Ub.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px", 
            Ub.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Qb(e = !1) {
            Wb.hidden = !0, qb.setAttribute("aria-expanded", "false"), Xb(), e && qb.focus();
        }
        function Jb() {
            Wb.hidden = !1, qb.setAttribute("aria-expanded", "true"), Yb();
            const e = Wb.querySelector('[aria-selected="true"]') || Wb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Wb, cb.map(e => `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-role-value="${Hi(e)}" aria-selected="false">${Hi(ub[e].label + popularitySuffix(e))}</button>`).join("")), 
        qb.addEventListener("click", () => Wb.hidden ? Jb() : Qb(!0)), qb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(), 
            Jb());
        }), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = new Set(zb()), i = t.dataset.roleValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five roles.", void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            Vb([ ...n ]), Yb(), t.focus({
                preventScroll: !0
            }), Zb(t);
        }), Wb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = performance.now();
            if (Wb._tfEl === t && n < Wb._tfUntil) return Wb._tfEl = null, Wb._tfBlock = null, void Xb();
            Wb._tfEl = t, Wb._tfUntil = n + 3200, Wb._tfBlock = t, Zb(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Wb._tfBlock === t && (Wb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Wb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Zb(t);
        }), Wb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Zb(t);
        }), jb.addEventListener("mouseleave", Xb), Wb.addEventListener("focusout", () => t.setTimeout(() => {
            (Wb.contains(document.activeElement) || Ub.contains(document.activeElement)) || Xb();
        }, 0)), Wb.addEventListener("keydown", e => {
            const t = [ ...Wb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Qb(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const ev = [ ...e.all("[data-profile-info]") ];
        function tv(t, n, i = !1) {
            const a = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            a && (a.hidden = !n, t.setAttribute("aria-expanded", String(n && i)), n ? t.setAttribute("aria-describedby", `${t.dataset.profileInfo}ProfileInfo`) : t.removeAttribute("aria-describedby"));
        }
        ev.forEach(t => {
            const n = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            n && (n.id = `${t.dataset.profileInfo}ProfileInfo`), t.addEventListener("click", e => {
                e.stopPropagation();
                const n = "true" !== t.getAttribute("aria-expanded");
                ev.forEach(e => tv(e, !1)), tv(t, n, n);
            }), t.addEventListener("mouseenter", () => tv(t, !0, "true" === t.getAttribute("aria-expanded"))), 
            t.addEventListener("mouseleave", () => {
                "true" !== t.getAttribute("aria-expanded") && tv(t, !1);
            }), t.addEventListener("focus", () => tv(t, !0, "true" === t.getAttribute("aria-expanded"))), 
            t.addEventListener("blur", () => {
                "true" !== t.getAttribute("aria-expanded") && tv(t, !1);
            });
        }), window.__sxOnPtr( e => {
            mb.hidden || pb.contains(e.target) || Eb(), Pb.hidden || Cb.contains(e.target) || Ob(), 
            Wb.hidden || jb.contains(e.target) || Qb(), __sxClosestAction(e.target, "profileInfo") || ev.forEach(e => tv(e, !1));
        }, !0), window.addEventListener("resize", () => {
            Sb(), Db(), Xb();
        });
        const nv = {
            "bi-curious": "bicurious",
            reciproseuxal: "reciprosexual",
            private: "not-applicable"
        };
        function iv(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = nv[t] || t, Object.prototype.hasOwnProperty.call(sb, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function av(e) {
            const t = Number(e);
            return Math.round(Math.max(0, Math.min(100, Number.isFinite(t) ? t : 50)));
        }
        function veilZoneText(t) {
            return `${t <= 0 ? "Revealed" : t <= 33 ? "Unveiling" : t <= 66 ? "Parted" : t < 100 ? "Veiled" : "Concealed"} · ${t}`;
        }
        const rv = e.byId("audienceView"), ov = e.byId("veilControl"), sv = e.byId("veilTrigger"), lv = e.byId("veilEnabled"), cv = e.byId("tabVeilEnabled"), dv = e.byId("veilPopover"), uv = e.byId("veilTooltip"), pv = e.byId("audienceVeilSlider"), hv = e.byId("audienceVeilValue"), qzv = e.byId("audienceVeilZone"), gv = e.byId("audienceVeilProfile"), mv = e.byId("audienceVeilHelp"), fv = mv.textContent;
        let yv = 0, bv = sv;
        function vv() {
            return Qt && vt[Qt] ? Qt : Mt && vt[Mt] ? Mt : null;
        }
        function wv(e) {
            return [ ...tl.querySelectorAll("[data-profile-veil]") ].find(t => t.dataset.profileVeil === e) || null;
        }
        function kv(e) {
            if (!e || !vt[e]) return;
            const t = av(vpt[e]), n = Boolean(vht[e]), i = zi(2 * (t - 50)), a = wv(e), r = a && a.parentElement?.querySelector(".profile-tab-button");
            a && (a.classList.toggle("is-enabled", n), a.style.setProperty("--veil-color", i), 
            a.setAttribute("aria-pressed", String(n)), a.setAttribute("aria-label", `${wt[e] || "Profile"} Veil ${n ? "on" : "off"}, level ${t}. Open Veil settings.`), 
            a.title = `Veil ${n ? "on" : "off"} · ${t}`), r && (r.classList.toggle("has-veil", n), 
            r.style.setProperty("--veil-color", i), r.setAttribute("aria-label", `${(r.getAttribute("aria-label") || "").replace(/,?\s*Veil on at \d+/, "")}${n ? `, Veil on at ${t}` : ""}`.replace(/,\s*,/g, ",").replace(/,\s*$/, "")));
        }
        function xv() {
            if (dv.hidden) return;
            const e = (bv && bv.isConnected ? bv : sv).getBoundingClientRect(), t = dv.getBoundingClientRect(), n = e.right + 7, i = n + t.width <= innerWidth - 10 ? n : e.left - t.width - 7;
            dv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, i))}px`, dv.style.top = `${Math.max(10, Math.min(innerHeight - t.height - 10, e.top + e.height / 2 - t.height / 2))}px`, 
            dv.style.right = "auto";
        }
        function Sv() {
            if (uv.hidden) return;
            const e = sv.getBoundingClientRect(), t = uv.getBoundingClientRect(), n = e.left + e.width / 2 - t.width / 2;
            uv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, n))}px`;
            const i = e.top - t.height - 7, a = e.bottom + 7;
            uv.style.top = `${i >= 10 ? i : Math.min(innerHeight - t.height - 10, a)}px`;
        }
        function $v(e = !1) {
            sv.disabled || (t.clear(yv), uv.hidden = !1, Sv(), e && (yv = t.setTimeout(() => {
                uv.hidden = !0;
            }, 2400)));
        }
        function Ev() {
            t.clear(yv), uv.hidden = !0;
        }
        function Av(e, t = !1) {
            dv.hidden = !e, sv.setAttribute("aria-expanded", String(e && bv === sv)), tl.querySelectorAll("[data-profile-veil]").forEach(t => t.setAttribute("aria-expanded", String(e && t === bv))), 
            e && requestAnimationFrame(() => {
                xv(), t && !pv.disabled ? pv.focus({
                    preventScroll: !0
                }) : t && cv.focus({
                    preventScroll: !0
                });
            });
        }
        function Cv(e = !1) {
            const t = bv;
            Av(!1), Qt = null, bv = sv, e && t && t.isConnected && t.focus({
                preventScroll: !0
            });
        }
        function Mv() {
            const e = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            if (rv.hidden = !e, e) {
                const t = av(vpt[e]), n = Boolean(vht[e]);
                hv.value = String(t), hv.textContent = String(t), lv.checked = n, ov.classList.toggle("is-enabled", n), 
                sv.disabled = !1, sv.setAttribute("aria-disabled", String(!n)), sv.style.background = zi(2 * (t - 50)), 
                sv.setAttribute("aria-label", `Intimacy Veil ${t}. ${n ? "Open rating scale." : "Enable Intimacy Veil to adjust."}`);
            } else sv.disabled = !0, lv.checked = !1, ov.classList.remove("is-enabled");
            const t = vv();
            if (!t) return void (dv.hidden || Cv());
            const n = av(vpt[t]), i = Boolean(vht[t]);
            pv.value = String(n), qzv && (qzv.textContent = veilZoneText(n)), pv.disabled = !i, cv.checked = i, cv.setAttribute("aria-label", `${i ? "Disable" : "Enable"} Intimacy Veil for ${wt[t] || "this profile"}`), 
            dv.classList.toggle("is-enabled", i), gv.textContent = wt[t] || "Active profile", 
            pv.setAttribute("aria-label", `Intimacy Veil for ${wt[t] || "the active profile"}`), dv.classList.remove("is-clear-preview"), 
            mv.textContent = fv;
        }
        function Iv(e, t) {
            if (!e || !vt[e]) return;
            const n = Boolean(vht[e]) !== Boolean(t);
            vht[e] = Boolean(t), n && zt(e), Mv(), kv(e), sxRefreshMatchTabs();
            const i = Kd();
            (e === Mt || i && Array.isArray(i.sourceIds) && i.sourceIds.includes(e)) && Mr();
        }
        let Pv = 0;
        sv.addEventListener("pointerenter", () => $v()), sv.addEventListener("pointerleave", () => {
            dv.hidden && Ev();
        }), sv.addEventListener("focus", () => $v()), sv.addEventListener("blur", () => {
            dv.hidden && Ev();
        }), sv.addEventListener("click", e => {
            e.preventDefault();
            const t = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            $v(!0), t && vht[t] && (Qt = t, bv = sv, Mv(), Av(!0, !0));
        }), lv.addEventListener("change", () => {
            const e = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            e && (Qt = e, bv = sv, Iv(e, lv.checked));
        }), cv.addEventListener("change", () => {
            const e = vv();
            e && Iv(e, cv.checked);
        }), window.__sxOnPtr( e => {
            dv.hidden || dv.contains(e.target) || __sxClosestAction(e.target, "profileVeil") || rv.contains(e.target) || (Cv(), 
            Ev());
        }, !0), window.__sxOnKey( e => {
            "Escape" !== e.key || dv.hidden || (e.preventDefault(), Ev(), Cv(!0));
        }), window.addEventListener("resize", () => {
            xv(), Sv();
        }), pv.addEventListener("input", () => {
            const e = vv();
            if (!e) return Mv();
            const t = av(pv.value);
            vpt[e] = t, zt(e), kv(e), qzv && (qzv.textContent = veilZoneText(t)), e === Mt && (hv.value = String(t), hv.textContent = String(t), 
            sv.style.background = zi(2 * (t - 50)), sv.setAttribute("aria-label", `Intimacy Veil ${t}. Open rating scale.`)), 
            vht[e] && (Pv && cancelAnimationFrame(Pv), Pv = requestAnimationFrame(() => {
                Pv = 0, Mr({
                    animate: !1,
                    forceRepaint: !0
                });
            }));
        });
        let Lv = null;
        function Tv(e) {
            const t = pv.getBoundingClientRect(), n = .08 * t.height;
            return e.clientY < t.top - n || e.clientY > t.bottom + n;
        }
        function Fv(e) {
            dv.classList.toggle("is-clear-preview", e), mv.textContent = e ? "Release to turn off Veil." : fv, 
            pv.setAttribute("aria-valuetext", e ? "Release to turn off" : String(pv.value));
        }
        function Nv(e) {
            if (!Lv || Lv.pointerId !== e.pointerId) return;
            const t = Lv;
            Lv = null;
            const n = "pointerup" === e.type && (t.clearing || Tv(e));
            if (Fv(!1), !n) return Cv(), void Ev();
            vpt[t.id] = t.startValue, Iv(t.id, !1), Cv(), Ev();
        }
        pv.addEventListener("pointerdown", e => {
            const t = vv();
            if (t && vht[t]) {
                Lv = {
                    pointerId: e.pointerId,
                    id: t,
                    startValue: av(vpt[t]),
                    clearing: !1
                };
                try {
                    pv.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
            }
        }), pv.addEventListener("pointermove", e => {
            Lv && Lv.pointerId === e.pointerId && (Lv.clearing = Tv(e), Fv(Lv.clearing));
        }), pv.addEventListener("pointerup", Nv), pv.addEventListener("pointercancel", Nv);
        /* B3 (SURFACES): the per-tab Heat button + its popover. Heat is
           SESSION state only (sxcv.heat + sxcvSave()); it never joins the
           profile store's maps, the collect/export snapshot, or either
           payload format. Group Heat is the same session state
           (sxcv.groupHeat, keyed by group profile id); the one popover
           serves both, branching on the group record, and adjusting
           Group Heat never touches a member's heat or any score.
           The popover lifecycle mirrors the Veil popover's
           (open/close/outside-click/Escape). */
        let sxHeatQt = null, sxHeatBv = null;
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
            sl && (sl.value = String(v)), out && (out.textContent = `${sxHeatZone(v)} · ${v > 0 ? "+" + v : v}`), 
            nm && (nm.textContent = wt[t] || "Profile"), sl && sl.setAttribute("aria-label", `${grp ? "Group heat" : "Heat"} for ${wt[t] || (grp ? "the group" : "the profile")}`);
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
            sxIsGroup(t) ? sxcv.groupHeat[t] = v : sxcv.heat[t] = v, sxcvSave(), 
            sxMvHeat(), sxKvHeat(t), sxRefreshMatchTabs();
        }), window.__sxOnPtr( ev2 => {
            const pop = e.byId("heatPopover");
            !pop || pop.hidden || pop.contains(ev2.target) || __sxClosestAction(ev2.target, "profileHeat") || sxCvHeat();
        }, !0), window.__sxOnKey( ev2 => {
            if ("Escape" !== ev2.key) return;
            const pop = e.byId("heatPopover");
            pop && !pop.hidden && (ev2.preventDefault(), sxCvHeat(!0));
        }), window.addEventListener("resize", () => sxPosHeat());
        const _v = [ "telegram", "linktree", "fetlife", "chaturbate", "stripchat", "myfreecams", "pornhub", "xvideos", "xhamster", "onlyfans", "reddit", "x" ];
        function Dv(e) {
            let t = String(e || "").trim().replace(/[\r ]/g, "").replace(/^@/, "").slice(0, 100);
            try {
                /^https?:\/\//i.test(t) && (t = new URL(t).pathname.split("/").filter(Boolean).pop() || "");
            } catch (e) { __sxErrLog("app", e); }
            return /^[a-z0-9_.-]{1,100}$/i.test(t) ? t : "";
        }
        function Rv(e) {
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
            _v.forEach(e => n[e] = Dv(t[e] || "")), n.phone = String(t.phone || "").trim().replace(/[\r ]/g, " ").replace(/\s+/g, " ").slice(0, 60);
            const i = String(t.email || "").trim().replace(/[\r ]/g, "").slice(0, 254);
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i) && (n.email = i), Array.isArray(t.customSites) && t.customSites.slice(0, 20).forEach(e => {
                if (e && "object" == typeof e) {
                    const t = String(e.site || "").trim().slice(0, 60), i = String(e.url || "").trim().slice(0, 500), a = Dv(e.username || "");
                    t && i && /^https?:\/\//i.test(i) && a && n.customSites.push({
                        site: t,
                        url: i,
                        username: a
                    });
                }
            }), n;
        }
        function Ov(e) {
            const t = Rv(e);
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
            el.className = "profile-contact-block", n(el, `<div class="profile-contact-block-main"><input class="profile-contact-block-username" type="text" maxlength="100" placeholder="username" aria-label="Username" autocomplete="off"><select class="profile-contact-block-site" aria-label="Site for this username"><option value="">Choose a site\u2026</option>${CONTACT_BLOCK_SITES.map(e => `<option value="${Hi(e.value)}">${Hi(e.label)}</option>`).join("")}</select><span class="profile-contact-block-actions"><button class="profile-contact-block-add" type="button" aria-label="Add another username">+</button><button class="profile-custom-site-remove profile-contact-block-remove" type="button" aria-label="Remove this username" hidden>\u00d7</button></span></div><div class="profile-contact-block-custom" hidden><input class="profile-contact-block-custom-site" type="text" maxlength="60" placeholder="Custom site name" aria-label="Custom site name"><input class="profile-contact-block-custom-url" type="url" maxlength="500" placeholder="https://..." aria-label="Custom site profile URL"><small class="profile-validation-message profile-contact-block-custom-error" hidden></small></div>`);
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
            const c = Rv(contact), order = [], byUser = new Map(), get = u => {
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
        function Hv(t) {
            const i = Rv(t);
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
            const t = Rv(raw);
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
        function Uv(e) {
            return String(e || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, " ").replace(/,/g, "\\,").replace(/;/g, "\\;");
        }
        function Gv(e) {
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
        function zv(e) {
            const t = Rv(ut[e]);
            if (!Ov(t)) return "";
            const n = [ "BEGIN:VCARD", "VERSION:4.0", `FN:${Uv(t.fullName || wt[e] || "Sexcapades profile")}` ];
            return t.phone && n.push(`TEL;TYPE=cell:${Uv(t.phone)}`), t.email && n.push(`EMAIL:${Uv(t.email)}`), 
            _v.forEach(e => {
                t[e] && (n.push(`${Kv[e]}:${Uv(t[e])}`), n.push(`URL;TYPE=x-${e}:${Uv(_i(e, t[e]))}`));
            }), n.push("END:VCARD"), n.join("\r\n") + "\r\n";
        }
        function Vv(e) {
            if (!Array.isArray(e)) return [];
            const t = [];
            return e.slice(0, 8).forEach(e => {
                if (!e || "object" != typeof e || "string" != typeof e.data || !/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(e.data) || e.data.length > 65e5) return;
                const n = Math.max(1, Math.min(3e3, Number(e.width) || 1)), i = Math.max(1, Math.min(3e3, Number(e.height) || 1)), a = A(Number.isFinite(Number(e.cropX)) ? Number(e.cropX) : .5), r = A(Number.isFinite(Number(e.cropY)) ? Number(e.cropY) : .5), o = Math.max(1, Math.min(3, Number(e.cropZoom) || 1)), s = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), l = Math.abs(a - .5) > .001 || Math.abs(r - .5) > .001 || Math.abs(o - 1) > .001 || Math.abs(s) > .001, c = !0 === e.manualCrop || l;
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
        function Yv(e) {
            return Vv(e).map(e => Object.assign({}, e));
        }
        function Xv(e) {
            const t = Number.parseInt(String(e || "").trim(), 10);
            return Number.isInteger(t) && t >= 18 && t <= 120 ? String(t) : "";
        }
        function Zv(e) {
            return String(e || "").trim().replace(/\s+/g, " ").slice(0, 80);
        }
        function Qv(e) {
            const t = vb(rt[e]), n = Nb(ot[e]), i = Kb(st[e]), a = Xv(lt[e]);
            return [ t || "Gender not set", n || "Orientation not set", i ? `Roles: ${i}` : "", a ? `Age ${a}` : "", Zv(ct[e]) ].filter(Boolean).join(" · ");
        }
        function Jv(e, t, n) {
            const i = od(e);
            return !i.length || (bw(e) && (zy = {
                id: e,
                action: n
            }, sm.textContent = `Choose ${i.join(" and ")} before ${t}.`), !1);
        }
        function ew() {
            dm.textContent = Wy.length ? `${Wy.length} attached${8 === Wy.length ? " · maximum" : ""}` : "none attached", 
            e.byId("chooseProfilePhotos").disabled = Wy.length >= 8, n(cm, Wy.map((e, t) => `<div class="profile-photo-thumb${0 === t ? " is-center-photo" : ""}"><button class="profile-photo-preview" type="button" data-adjust-photo="${t}" aria-label="Adjust center crop for attached photo ${t + 1}"><svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><defs><clipPath id="profilePhotoDraftClip${t}"><circle cx="50" cy="50" r="49"/></clipPath></defs><g clip-path="url(#profilePhotoDraftClip${t})">${aa(e, {
                x: 0,
                y: 0,
                w: 100,
                h: 100
            })}</g><circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,.58)" stroke-width="2"/></svg><span class="profile-photo-crop-label">${0 === t ? "Center photo · adjust" : "Adjust crop"}</span></button><span class="profile-photo-order"><button type="button" data-move-photo="${t}" data-photo-step="-1" aria-label="Move attached photo ${t + 1} earlier" ${0 === t ? "disabled" : ""}>↑</button><button type="button" data-move-photo="${t}" data-photo-step="1" aria-label="Move attached photo ${t + 1} later" ${t === Wy.length - 1 ? "disabled" : ""}>↓</button></span><button class="profile-photo-remove" type="button" data-remove-photo="${t}" aria-label="Remove attached photo ${t + 1}">×</button></div>`).join(""));
        }
        function tw(e) {
            return {
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: e
            };
        }
        function nw(e, t = "invalid-result") {
            return e && Number.isFinite(Number(e.cropX)) && Number.isFinite(Number(e.cropY)) ? {
                cropX: A(Number(e.cropX)),
                cropY: A(Number(e.cropY)),
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: String(e.focusStatus || "detected")
            } : tw(t);
        }
        async function iw(e, n, i) {
            const a = Math.max(1, Number(n) || Number(e && e.width) || 1), r = Math.max(1, Number(i) || Number(e && e.height) || 1), o = {
                secureContext: window.isSecureContext,
                faceDetectorType: typeof window.FaceDetector
            };
            if ("function" !== o.faceDetectorType) return tw("unavailable");
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
                    return u && String(u.message || u), tw(e);
                }
                const g = h.boundingBox, m = Number.isFinite(Number(g.x)) ? Number(g.x) : Number(g.left) || 0, f = Number.isFinite(Number(g.y)) ? Number(g.y) : Number(g.top) || 0, y = nw({
                    cropX: (m + Number(g.width) / 2) / a,
                    cropY: (f + Number(g.height) / 2) / r,
                    focusStatus: "detected"
                });
                return y.focusStatus, y.cropX, y.cropY, y;
            } catch (e) {
                return String(e && e.message || e), tw("error");
            } finally {
                s && "function" == typeof s.close && s.close();
            }
        }
        function aw(e) {
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
                        const d = nw(await iw(l, o, s));
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
        function rw(t, n, i, a = "") {
            const r = e.byId(t), o = e.byId(n);
            r && o && (r.classList.toggle("is-invalid", i), o.hidden = !i, a && (o.textContent = a), 
            r.querySelectorAll("input,select,button").forEach(e => {
                i ? e.setAttribute("aria-invalid", "true") : e.removeAttribute("aria-invalid");
            }));
        }
        function ow() {
            const e = [ ..._g.querySelectorAll('input:not([type="file"]),textarea,select') ];
            return JSON.stringify(e.map(e => {
                const t = e instanceof HTMLSelectElement && e.multiple ? [ ...e.selectedOptions ].map(e => e.value) : e.value;
                return [ e.id, e.type, t, Boolean(e.checked) ];
            }));
        }
        function sw() {
            zy = null, Vy = null, jY = null, Hy = null, Wy = [], lm.value = "", Uy = "", Gy = [], Eb(), 
            Ob(), Qb(), closeContactBlockMenus(), Ui(wm), Ui(_g);
        }
        function lw() {
            Ui(wm), Wi(_g), requestAnimationFrame(() => {
                const e = _g.querySelector(".dialog-body");
                e && (e.scrollTop = Ky), Hg.focus({
                    preventScroll: !0
                });
            });
        }
        function cw() {
            if (Eb(), Ob(), Qb(), closeContactBlockMenus(), !function() {
                return ow() !== Uy || (t = Gy, !((e = Wy).length === t.length && e.every((e, n) => {
                    const i = t[n] || {};
                    return [ ...new Set([ ...Object.keys(e || {}), ...Object.keys(i) ]) ].every(t => (e || {})[t] === i[t]);
                })));
                var e, t;
            }()) return void sw();
            const t = _g.querySelector(".dialog-body");
            Ky = t ? t.scrollTop : 0, e.byId("discardProfileDetailsQuestion").textContent = Hy ? "Changes made in this profile editor have not been saved." : "This new profile has not been created.", 
            Ui(_g), Wi(wm), requestAnimationFrame(() => e.byId("keepEditingProfileDetails").focus());
        }
        function dw() {
            am.textContent = `${im.value.length}/${im.maxLength} characters`, om.textContent = `${rm.value.length}/${rm.maxLength} characters`;
        }
        function uw(t) {
            const i = e.byId("profileTimingSummary"), a = e.byId("profileTimingList"), r = St(mt[t]), o = Object.keys(kt).filter(e => r[e]).map(e => {
                const t = r[e], n = t.total ? ` · ${t.count}/${t.total}` : "";
                return `<li><strong>${Hi(kt[e])}</strong> · ${xt(t.durationSeconds)} total${n} · saved ${Hi(function(e) {
                    const t = new Date(e);
                    return Number.isNaN(t.getTime()) ? "" : new Intl.DateTimeFormat(void 0, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }).format(t);
                }(t.completedAt))}</li>`;
            });
            n(a, o.join("")), i.hidden = !o.length;
        }
        function pw(e) {
            e || fs(), Ag.dataset.submitted = "false";
        }
        async function hw(e = "save", t = Go) {
            if ("save" !== e) return;
            const consent = window.SexcapadesRuntime.DOM.byId("surveyContributionConsent");
            if (!consent) __sxErrLog("survey-consent", new Error("The list-view survey consent control (surveyContributionConsent) is absent from the page; the survey send decision comes from the shell consent state instead."));
            if ("function" === typeof window.__sxSurveyOptedIn) {
                if (!window.__sxSurveyOptedIn()) return;
            } else {
                __sxErrLog("survey-consent", new Error("window.__sxSurveyOptedIn is unavailable; falling back to the list-view consent control read."));
                if (!consent || !consent.checked) return;
            }
            const n = t;
            if (!n) return;
            const i = cs(n);
            if (i.rated) try {
                await u({
                    action: "survey",
                    uuid: c(),
                    ratings: wu(n),
                    app_version: "3.5",
                    app_build: document.querySelector('meta[name="sexcapades-build"]')?.getAttribute("content") || "",
                    topic_count: i.rated
                });
            } catch (e) {
                xg.textContent = "Profile saved, but the anonymous ratings could not be shared.";
            }
        }
        let gw = "edit";
        function mw(t) {
            gw = "about" === t ? "about" : "edit", Dg.dataset.profileMode = gw, _g.dataset.profileMode = gw, 
            Rg.hidden = "about" !== gw, "about" === gw && Hy ? (function(t) {
                const i = String(nt[t] || "").trim(), a = String(it[t] || "").trim(), r = Yv(dt[t])[0], o = dc(t), s = o.green.length + o.yellow.length + o.red.length, l = Rv(ut[t]), c = Di(l);
                l.phone && c.unshift({
                    label: "Phone",
                    user: l.phone,
                    href: `tel:${l.phone.replace(/[^\d+*#,;]/g, "")}`
                }), l.email && c.unshift({
                    label: "Email",
                    user: l.email,
                    href: `mailto:${l.email}`
                }), Og.hidden = !r, n(Og, r ? `<img src="${Hi(r.data)}" alt="${Hi(wt[t] || "Profile")} profile photo"><svg class="profile-glance-rings" viewBox="0 0 120 120" role="img" aria-label="At a glance: ${o.percentages.green}% green, ${o.percentages.yellow}% yellow, ${o.percentages.red}% red"><title>${o.percentages.green}% green · ${o.percentages.yellow}% yellow · ${o.percentages.red}% red</title><circle class="ring-track" cx="60" cy="60" r="56"/><circle class="ring-green" cx="60" cy="60" r="56" pathLength="100" stroke-dasharray="${o.percentages.green} 100"/><circle class="ring-yellow" cx="60" cy="60" r="50" pathLength="100" stroke-dasharray="${o.percentages.yellow} 100"/><circle class="ring-red" cx="60" cy="60" r="44" pathLength="100" stroke-dasharray="${o.percentages.red} 100"/></svg>` : ""), 
                Bg.textContent = Qv(t), n(jg, `<span class="profile-dialog-rating-total">${s} rated topic${1 === s ? "" : "s"}</span>`);
                const d = e.byId("profileDialogAboutSection"), u = e.byId("profileDialogTermsSection"), p = e.byId("profileDialogContactSection");
                d.hidden = !i, e.byId("profileDialogAboutText").textContent = i, u.hidden = !a, 
                e.byId("profileDialogTermsText").textContent = a, p.hidden = !c.length, qg.replaceChildren(), 
                c.forEach(e => {
                    const t = document.createElement("div"), n = document.createElement("strong"), i = document.createElement("a");
                    t.className = "profile-dialog-site-group", n.textContent = e.label, i.href = e.href, 
                    i.textContent = e.user, /^mailto:|^tel:/i.test(e.href) || (i.target = "_blank", 
                    i.rel = "noopener noreferrer"), t.append(n, i), qg.append(t);
                });
            }(Hy), e.byId("profileDetailsTitle").textContent = "About Profile", _g.querySelector(".dialog-head p").textContent = `Profile: ${wt[Hy] || "Profile"}`) : (e.byId("profileDetailsTitle").textContent = Hy ? "Edit profile" : "New profile", 
            _g.querySelector(".dialog-head p").textContent = Hy ? `Profile: ${wt[Hy] || "Profile"}` : "Name the profile and choose the identity language used by the scene builder.");
        }
        let fw = !1;
        function yw() {
            var t = e.byId("profileIndependentTip");
            t && (t.hidden = !0, t.style.display = "none"), fw = !0;
        }
        // DETAILS HARD BLOCK (owner ruling, 2026-10-27): the profile
        // details dialog opens ONLY for the profile of the tab active in
        // the viewport. bw() is the dialog's only opener, so the gate
        // lives here, ahead of every state change bw makes: a blocked
        // attempt opens nothing, changes no profile, writes nothing, and
        // never activates the target's tab — it refuses with a visible
        // toast naming the profile. While a pair (match) tab is active,
        // only that pair's own saved-group profile may open; its member
        // profiles may not. bw(null) is profile CREATION (not any existing
        // profile's details) and the transient guide profile has no tab
        // at all, so neither is a non-active profile's details; both pass.
        function sxDetailsBlocked(t) {
            const a = e.byId("toast"), r = e.byId("toastMessage");
            if (!a || !r) return;
            r.textContent = `Details for ${wt[t] || "that profile"} open only while its tab is the one on screen — switch to that tab first.`;
            a.dataset.tone = "error", a.setAttribute("role", "alert"), a.classList.add("is-persistent", "show");
        }
        function bw(t = null, n = {}) {
            if (t && vt[t] && t !== ROXY_PROFILE_ID) {
                const sxTab = sxCurrentTab(), sxAllowed = sxTab ? t === (sxTab.groupId || null) : t === Mt;
                if (!sxAllowed) return sxDetailsBlocked(t), !1;
            }
            zy = null, xw(), Sw(), Ui(kg), Hy = t && vt[t] ? t : null;
            const i = Hy ? bb(rt[Hy]) : [];
            Hg.value = Hy ? wt[Hy] : "", kb(i), Fb(Hy ? ot[Hy] : []), Vb(Hy ? st[Hy] : []), Pz.value = Hy ? String(pz[Hy] || "") : "", 
            Kg.value = Hy ? Xv(lt[Hy]) : "", zg.value = Hy ? Zv(ct[Hy]) : "", Hv(Hy ? ut[Hy] : null), 
            im.value = Hy ? String(nt[Hy] || "") : "", rm.value = Hy ? String(it[Hy] || "") : "", 
            dw(), Wy = Hy ? Yv(dt[Hy]) : [], lm.value = "", ew(), uw(Hy), xb(), Eb(), _b(), 
            Ob(), Yb(), Qb(), rw("profileDetailsNameField", "profileDetailsNameError", !1), 
            rw("profileDetailsGenderField", "profileDetailsGenderError", !1), rw("profileDetailsSexualityField", "profileDetailsSexualityError", !1), 
            rw("profileDetailsAgeField", "profileDetailsAgeError", !1), sm.textContent = "", 
            Uy = ow(), Gy = Yv(Wy), e.byId("saveProfileDetails").textContent = Hy ? "Save changes" : "Create profile", 
            e.byId("profileDetailsLoadersLabel").textContent = Hy ? "Tests and imported values" : "Start with a test or import", 
            mw("about" === n.mode && Hy ? "about" : "edit");
            const a = e.byId("profileIndependentTip"), r = !Hy && Object.keys(vt).filter(e => e !== Et).length >= 1;
            a.hidden = !r || fw, a.hidden || (a.style.display = ""), r && !fw && (fw = !0);
            var o = e.byId("dismissProfileIndependentTip");
            o && !o.dataset.dpiBound && (o.dataset.dpiBound = "1", o.addEventListener("click", yw)), 
            Wi(_g), requestAnimationFrame(() => {
                const t = _g.querySelector(".dialog-body");
                t && (t.scrollTop = 0);
                const i = "about" === gw ? e.byId("profileDialogEdit") : n.focusPhotos ? e.byId("chooseProfilePhotos") : Hg;
                n.focusPhotos && i.scrollIntoView({
                    block: "center"
                }), i.focus({
                    preventScroll: "about" === gw
                });
            });
            return !0;
        }
        function vw(e = null, t = "auto") {
            Xi();
            const typedName = Hg.value.trim().replace(/\s+/g, " "), n = typedName || "Unknown", nameWasBlank = !typedName, i = wb(), a = Tb(), r = zb(), o = Xv(Kg.value), s = Zv(zg.value), l = Hy, c = Yv(Wy), d = l ? av(vpt[l]) : 50, u = readContactBlocks();
            if (Kg.value.trim() && !o) return rw("profileDetailsAgeField", "profileDetailsAgeError", !0, "Enter an age from 18 to 120."), 
            sm.textContent = "Check the age and try again." + (jY ? ` Then your ${jY} opens.` : ""), void (Kg.focus(), jY && sm.scrollIntoView({ block: "nearest" }));
            rw("profileDetailsNameField", "profileDetailsNameError", !1), rw("profileDetailsGenderField", "profileDetailsGenderError", !1), rw("profileDetailsSexualityField", "profileDetailsSexualityError", !1);
            if (sm.textContent = "", u.error) return sm.textContent = u.error + (jY ? ` Then your ${jY} opens.` : ""), void (u.field.focus(), jY && sm.scrollIntoView({ block: "nearest" }));
            const p = u.contact, h = im.value.trim().slice(0, 1500), g = rm.value.trim().slice(0, 1500), m = ek(n), q = Pz.value.trim().slice(0, 60);
            if (!nameWasBlank && m && m !== l) return sm.textContent = `${n} already has a profile.` + (jY ? ` Then your ${jY} opens.` : ""), Hg.focus(), 
            void (Hg.select(), jY && sm.scrollIntoView({ block: "nearest" }));
            const sxEditVy = id => { const b = Vy; Vy = null, jY = null, b && b(id); };
            const f = l && zy && zy.id === l ? zy : null;
            if (zy = null, Ui(_g), queueMicrotask(() => {
                (_g.open || _g.hasAttribute("open")) && Ui(_g);
            }), Hy = null, Wy = [], lm.value = "", Uy = "", Gy = [], l) {
                if (!vt[l]) return;
                const u = wt[l] !== n || JSON.stringify(bb(rt[l])) !== JSON.stringify(i) || JSON.stringify(iv(ot[l])) !== JSON.stringify(a) || JSON.stringify(Gb(st[l])) !== JSON.stringify(r) || Xv(lt[l]) !== o || Zv(ct[l]) !== s || JSON.stringify(Yv(dt[l])) !== JSON.stringify(c) || JSON.stringify(Rv(ut[l])) !== JSON.stringify(p) || String(nt[l] || "") !== h || String(it[l] || "") !== g || av(vpt[l]) !== d || String(pz[l] || "") !== q;
                return wt[l] = n, rt[l] = i, ot[l] = a, st[l] = r, pz[l] = q, lt[l] = o, ct[l] = s, dt[l] = c, 
                ut[l] = p, nt[l] = h, it[l] = g, vpt[l] = d, u && zt(l), hw("save", l), void requestAnimationFrame(() => {
                    Jw(), Mr({
                        animate: !1
                    }), Cn.getBoundingClientRect(), Oc.open && sxPrepScribeDialog(), f ? f.action() : "outline" === e ? Ms(l) : "testchooser" === e ? Qy(l) : e ? Ax(e, t, l) : sxEditVy(l);
                });
            }
            const y = ik(n);
            SX_PROFILE_RECORD_LISTS.forEach(e => e[y] = {}), wt[y] = n, rt[y] = i, ot[y] = a, st[y] = r, pz[y] = q, lt[y] = o, ct[y] = s, 
            dt[y] = c, ut[y] = p, nt[y] = h, it[y] = g, vpt[y] = d, vht[y] = !1, profileUuids[y] = makeProfileUuid(), sampleProfileFlags[y] = !1, zt(y), Lo(y), 
            sxAutoSelect(y), ak(y, {
                blankStart: !0
            }), hw("save", y);
            const b = Vy;
            Vy = null, jY = null, "outline" === e ? Ms(y) : "testchooser" === e ? Qy(y) : e ? Ax(e, t, y) : b && b(y);
        }
        function ww() {
            // Capture the Load menu's origin before kw() clears qy:
            // the origin is carried explicitly into this dialog —
            // a pair origin routes this dialog's file imports into
            // the pair (merge) and its converters onto the pair, any
            // other origin is the converters' target, and no origin
            // (the Add menu's Scan or Import) keeps the ordinary
            // create-a-profile import.
            sxLoadOriginId = qy && vt[qy] ? qy : null, sxPairLoadInto = qy && ft[qy] && "group" === ft[qy].kind ? qy : null, kw(), xw(), Sw(), Ui(kg), Ig(""), Wi(Sg);
        }
        function kw() {
            Oy.hidden = !0, qy = null, tl.querySelectorAll("[data-profile-load],[data-add-profile]").forEach(e => e.setAttribute("aria-expanded", "false"));
        }
        function xw() {
            By.hidden = !0;
            const e = tl.querySelector("[data-add-profile]");
            e && !jy.hidden && e.setAttribute("aria-expanded", "false");
        }
        function Sw() {
            jy.hidden = !0, jy.classList.remove("is-submenu");
            const t = tl.querySelector("[data-add-profile]"), n = e.byId("loadSampleProfileChoice");
            t && t.setAttribute("aria-expanded", String(!By.hidden)), n && n.setAttribute("aria-expanded", "false");
        }
        function $w(e, t) {
            if (e === Oy && innerWidth <= 620) return e.style.removeProperty("left"), void e.style.removeProperty("top");
            const n = t.getBoundingClientRect(), i = e.getBoundingClientRect();
            e.style.left = Math.max(8, Math.min(innerWidth - i.width - 8, n.right - i.width)) + "px", 
            e.style.top = Math.max(8, Math.min(innerHeight - i.height - 8, n.bottom + 7)) + "px";
        }
        function Ew() {
            jy.querySelectorAll("[data-sample-profile]").forEach(e => {
                const t = e.dataset.sampleProfile, n = e.dataset.sampleName, i = Zy[t];
                i && !vt[i] && delete Zy[t];
                const a = Boolean(Zy[t] && vt[Zy[t]] || ek(n) || ek(`${n} (sample)`));
                e.disabled = a, e.setAttribute("aria-disabled", String(a));
                const r = e.querySelector("small");
                r && (r.textContent = a ? "Loaded" : `${e.dataset.sampleCount} rated topics`);
            });
        }
        function Aw() {
            if (!Yy) {
                const e = window.SEXCAPADES_SAMPLE_PROFILES;
                Yy = e && "object" == typeof e ? Promise.resolve(e) : Promise.reject(new Error("The bundled samples could not be opened.")), 
                Yy = Yy.catch(e => {
                    throw Yy = null, e;
                });
            }
            return Yy;
        }
        e.byId("dismissProfileIndependentTip")?.addEventListener("click", yw);
        const Cw = {};
        function Mw(e) {
            if (!Cw[e]) {
                const t = jy.querySelector(`[data-sample-profile="${CSS.escape(e)}"] img`), n = t && (t.currentSrc || t.src);
                Cw[e] = n ? fetch(n).then(e => {
                    if (!e.ok) throw new Error("The bundled sample photo could not be opened.");
                    return e.blob();
                }).then(async e => {
                    const t = await Vu(e), n = await zu(t);
                    return {
                        data: t,
                        width: n.naturalWidth,
                        height: n.naturalHeight,
                        cropX: .5,
                        cropY: .5,
                        cropZoom: 1
                    };
                }).catch(t => {
                    throw delete Cw[e], t;
                }) : Promise.resolve(null);
            }
            return Cw[e];
        }
        function Iw(t = {}) {
            kw();
            const n = tl.querySelector("[data-add-profile]"), i = e.byId("loadSampleProfileChoice");
            if (!n || By.hidden) return;
            Ew(), jy.hidden = !1, jy.classList.add("is-submenu"), n.setAttribute("aria-expanded", "true"), 
            i.setAttribute("aria-expanded", "true");
            const a = i.getBoundingClientRect(), r = jy.offsetWidth, o = jy.offsetHeight;
            let s, l;
            if (innerWidth <= 620) {
                s = Math.max(8, Math.min(innerWidth - r - 8, a.left));
                const e = a.bottom + 6, t = a.top - o - 6;
                l = e + o <= innerHeight - 8 ? e : t >= 8 ? t : Math.max(8, innerHeight - o - 8);
            } else s = Math.max(8, Math.min(innerWidth - r - 8, a.right + 6)), l = Math.max(8, Math.min(innerHeight - o - 8, a.top));
            if (jy.style.left = s + "px", jy.style.top = l + "px", t.focus) {
                const e = jy.querySelector("[data-sample-profile]:not(:disabled)");
                e && e.focus({
                    preventScroll: !0
                });
            }
        }
        function Pw(e) {
            kw(), jy.hidden ? By.hidden ? (By.hidden = !1, e.setAttribute("aria-expanded", "true"), 
            $w(By, e), By.querySelector("button").focus({
                preventScroll: !0
            })) : xw() : Sw();
        }
        function Lw() {
            wf = null, Ui(ym);
        }
        Oy.querySelectorAll("[data-profile-converter]").forEach(e => e.addEventListener("click", () => {
            const sxOrigin = qy && vt[qy] ? qy : null;
            kw(), Ax(e.dataset.profileConverter, e.dataset.converterMode || "auto", sxOrigin);
        })), e.byId("importProfileFromTab") && (e.byId("importProfileFromTab").onclick = ww);
        const Tw = e.byId("newBlankProfile"), Fw = e.byId("newListProfile"), Nw = e.byId("importProfileChoice"), _w = e.byId("loadSampleProfileChoice");
        e.byId("makeOwnMapButton") && e.byId("makeOwnMapButton").addEventListener("click", () => {
            Vy = null, bw(null);
        });
        // Guide center: the unrated map renders Yolanda Biche as a normal profile
        // center node in the map renderer, and tapping it opens the standard
        // profile About dialog via roxyAbout() above (Build 2026-10-16_2206).
        // The old blocking center card was removed.
        (() => {
            const cta = e.byId("firstVisitCta"), dismiss = e.byId("dismissFirstVisitCta"), restore = e.byId("showFirstVisitCta");
            const setDismissed = value => {
                const url = new URL(location.href);
                value ? url.searchParams.set("hide-start-cta", "1") : url.searchParams.delete("hide-start-cta");
                history.replaceState(history.state, "", url.pathname + url.search + url.hash);
                if (cta) cta.hidden = value;
                if (restore) restore.hidden = !value || Boolean(Object.keys(vt).filter(id => Boolean(wt[id])).length);
            };
            dismiss?.addEventListener("click", () => setDismissed(true));
            restore?.addEventListener("click", () => setDismissed(false));
        })();
        Tw.addEventListener("click", () => {
            xw(), Vy = null, bw(null);
        }), Fw.addEventListener("click", () => {
            xw(), Vy = e => Ms(e), bw(null);
        }), Nw.addEventListener("click", ww);
        let Dw = 0;
        const Rw = () => {
            Dw && (t.clear(Dw), Dw = 0);
        }, Ow = () => {
            Rw(), Dw = t.setTimeout(() => {
                By.matches(":hover") || jy.matches(":hover") || Sw();
            }, 180);
        };
        _w.addEventListener("pointerenter", () => {
            Rw(), Iw();
        }), _w.addEventListener("focus", () => Iw()), _w.addEventListener("click", e => {
            e.preventDefault(), Iw({
                focus: !0
            });
        }), By.addEventListener("pointerleave", Ow), By.addEventListener("pointerenter", Rw), 
        jy.addEventListener("pointerleave", Ow), jy.addEventListener("pointerenter", Rw), 
        e.byId("backToProfileAddMenu") && e.byId("backToProfileAddMenu").addEventListener("click", () => {
            Sw(), _w.focus({
                preventScroll: !0
            });
        }), jy.addEventListener("click", async e => {
            const t = __sxClosestAction(e.target, "sampleProfile");
            if (!t || !jy.contains(t) || t.disabled) return;
            const n = t.dataset.sampleProfile, i = t.dataset.sampleName, a = Number(t.dataset.sampleCount), r = t.querySelector("small");
            t.disabled = !0, r && (r.textContent = "Loading…"), Sw(), xw();
            try {
                const [e, t] = await Promise.all([ Aw(), Mw(n) ]), r = e && e[n];
                if (!r || r.name !== i || r.count !== a || !r.payload || !0 !== r.payload.noFlash) throw new Error("The bundled sample is invalid.");
                const o = JSON.parse(JSON.stringify(r.payload));
                o.profileName = i, o.sampleProfile = !0, !t || Array.isArray(o.photos) && o.photos.length || (o.photos = [ t ]);
                const s = wx(o, {
                    autoSelect: !0
                });
                Zy[n] = s, Ew();
            } catch (e) {
                t.disabled = !1, r && (r.textContent = `${a} rated topics`), tS(e.message || "Could not load that sample profile.", {
                    tone: "error",
                    persistent: !0
                });
            }
        }), vm && (vm.onclick = () => {
            const t = wf, n = e.byId("rememberProfileCheckbox2x"), i = window.Sexcapades2xRememberProfiles;
            t && n && n.checked && i && i.saveNow && i.saveNow() ? (wf = null, Ui(ym), nk(t)) : tS("Could not save this profile on this device. Keep it open and try again.", {
                tone: "error",
                persistent: !0
            });
        }), e.byId("discardClosingProfile").onclick = () => {
            const e = wf;
            wf = null, Ui(ym), e && nk(e);
        }, ym.addEventListener("click", e => {
            e.target === ym && Lw();
        }), ym.addEventListener("cancel", Lw), window.__sxOnPtr( e => {
            Oy.hidden || Oy.contains(e.target) || __sxClosestAction(e.target, "profileLoad") || kw(), 
            By.hidden || By.contains(e.target) || __sxClosestAction(e.target, "addProfile") || xw(), 
            jy.hidden || jy.contains(e.target) || __sxClosestAction(e.target, "addProfile") || Sw();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && (Oy.hidden || kw(), By.hidden || xw(), jy.hidden || Sw());
        }), e.byId("closeTestResultLoader").onclick = () => Ui(kg), kg.addEventListener("click", e => {
            e.target === kg && performance.now() - 0 > 500 && Ui(kg);
        }), e.byId("closeProfileDetails").onclick = () => "about" === gw ? Ui(_g) : cw(), 
        _g.addEventListener("cancel", e => {
            e.preventDefault(), "about" === gw ? Ui(_g) : cw();
        }), e.byId("profileDialogEdit").onclick = () => {
            Hy && (mw("edit"), requestAnimationFrame(() => Hg.focus()));
        }, e.byId("keepEditingProfileDetails").onclick = lw, e.byId("discardProfileDetails").onclick = sw, 
        wm.addEventListener("cancel", e => {
            e.preventDefault(), lw();
        }), e.byId("saveProfileDetails").onclick = () => vw(), e.byId("saveActiveProfile").onclick = () => {
            const e = Mt;
            if (!e || !vt[e]) return;
            const n = window.Sexcapades2xRememberProfiles;
            if (!n || "function" != typeof n.saveOne || !n.saveOne(e)) return void tS("Could not save this profile on this device.", {
                tone: "error",
                persistent: !0
            });
            n.isEnabled && n.isEnabled() && n.saveNow && n.saveNow(), Vt(e), tS(`${wt[e]} saved on this device.`);
        };
        const Bw = e.byId("appAboutDialog");
        e.byId("openAppAbout") && e.byId("openAppAbout").addEventListener("click", () => {
            (function() {
                const n = Math.round(window.innerWidth), i = Math.round(window.innerHeight), a = Math.round(screen.width || 0), r = Math.round(screen.height || 0), o = window.devicePixelRatio || 1, s = Math.min(n, i) >= 320 && Math.max(n, i) >= 480, l = {
                    pass: s,
                    value: "Viewport " + n + " × " + i + " CSS px · screen " + a + " × " + r + " CSS px · " + o + "× pixel density (" + Math.round(a * o) + " × " + Math.round(r * o) + " device px)",
                    detail: s ? "Meets the 320 × 480 CSS-pixel minimum." : "The usable viewport is below 320 × 480 CSS pixels. Rotate the device, maximize the window, or use a larger screen."
                }, c = function() {
                    const e = navigator.userAgent || "", t = navigator.userAgentData && navigator.userAgentData.brands;
                    if (Array.isArray(t)) {
                        const e = t.find(e => /Microsoft Edge/i.test(e.brand)) || t.find(e => /Google Chrome/i.test(e.brand)) || t.find(e => /Opera/i.test(e.brand)) || t.find(e => /Chromium/i.test(e.brand));
                        if (e) return {
                            key: /Edge/i.test(e.brand) ? "edge" : /Opera/i.test(e.brand) ? "opera" : "chrome",
                            name: "Chromium" === e.brand ? "Chromium" : e.brand,
                            version: e.version,
                            major: parseInt(e.version, 10)
                        };
                    }
                    const n = [ [ "edge", "Microsoft Edge", /(?:EdgA|EdgiOS|Edg)\/([\d.]+)/ ], [ "opera", "Opera", /(?:OPR|Opera)\/([\d.]+)/ ], [ "samsung", "Samsung Internet", /SamsungBrowser\/([\d.]+)/ ], [ "firefox", "Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/ ], [ "chrome", "Google Chrome", /(?:Chrome|CriOS)\/([\d.]+)/ ], [ "safari", "Safari", /Version\/([\d.]+).*Safari/ ] ];
                    for (const [t, i, a] of n) {
                        const n = e.match(a);
                        if (n) return {
                            key: t,
                            name: i,
                            version: n[1],
                            major: parseInt(n[1], 10)
                        };
                    }
                    return {
                        key: "unknown",
                        name: "Unrecognized browser",
                        version: "not reported",
                        major: 0
                    };
                }(), d = {
                    chrome: 90,
                    edge: 90,
                    firefox: 90,
                    safari: 15,
                    opera: 76,
                    samsung: 15
                }[c.key], u = Boolean(d && c.major >= d), p = {
                    pass: u,
                    value: c.name + " " + c.version,
                    detail: u ? "Meets the minimum supported version (" + d + "+)." : d ? "Version " + d + " or newer is required. Update " + c.name + " to use the hypermap reliably." : "This browser could not be verified. Use a current version of Chrome, Edge, Firefox, Safari, Opera, or Samsung Internet."
                }, h = Number(navigator.deviceMemory), g = Number.isFinite(h) && h > 0, m = !g || h >= 2, f = {
                    pass: m,
                    value: g ? h + " GB (browser estimate)" : "Not reported by this browser",
                    detail: g ? m ? "Meets the 2 GB minimum." : "Less than the 2 GB minimum was reported. The hypermap may stutter, reload, or fail to open large profiles." : "The memory API is optional, so its absence does not block the app."
                }, y = navigator.userAgentData && "boolean" == typeof navigator.userAgentData.mobile ? navigator.userAgentData.mobile : /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || ""), b = navigator.maxTouchPoints || 0, v = {
                    screen: l,
                    browser: p,
                    memory: f,
                    device: {
                        pass: !0,
                        value: (y ? "Mobile" : "Desktop") + " · " + (b ? b + " touch point" + (1 === b ? "" : "s") : "no touch input reported"),
                        detail: y ? "The responsive mobile layout is supported." : "The desktop layout is supported."
                    }
                };
                Object.entries(v).forEach(([t, n]) => function(t, n) {
                    const i = e.one('[data-check="' + t + '"]');
                    i && (i.dataset.state = n.pass ? "pass" : "fail", i.querySelector(".system-check-badge").textContent = n.pass ? "PASS" : "FAIL", 
                    i.querySelector("[data-check-value]").textContent = n.value, i.querySelector("[data-check-detail]").textContent = n.detail);
                }(t, n));
                const w = Object.values(v).filter(e => !e.pass).length, k = e.byId("systemCheckSummary");
                k && (k.dataset.state = w ? "fail" : "pass", k.textContent = w ? w + " requirement" + (1 === w ? "" : "s") + " need attention" : "All 4 checks passed");
            })(), Wi(Bw), requestAnimationFrame(() => e.byId("closeAppAbout").focus());
        }), e.byId("closeAppAbout") && e.byId("closeAppAbout").addEventListener("click", () => Ui(Bw)), Bw.addEventListener("click", e => {
            e.target === Bw && Ui(Bw);
        }), e.byId("closeCompletionCelebration") && e.byId("closeCompletionCelebration").addEventListener("click", fs), e.byId("dismissCompletionCelebration") && e.byId("dismissCompletionCelebration").addEventListener("click", fs), 
        completionCompare.addEventListener("click", () => openMilestoneDestination("compare")), completionExport.addEventListener("click", () => openMilestoneDestination("export")), 
        Eg.addEventListener("cancel", e => {
            e.preventDefault(), fs();
        }), closeMilestone.addEventListener("click", closeMilestoneCelebration), milestoneContinue.addEventListener("click", closeMilestoneCelebration), 
        milestoneCompare.addEventListener("click", () => openMilestoneDestination("compare")), milestoneExport.addEventListener("click", () => openMilestoneDestination("export")), milestoneImport.addEventListener("click", () => openMilestoneDestination("import")), milestoneScribe.addEventListener("click", () => openMilestoneDestination("scribe")), 
        milestoneDialog.addEventListener("cancel", e => {
            e.preventDefault(), closeMilestoneCelebration();
        }), milestoneDialog.addEventListener("click", e => {
            e.target === milestoneDialog && closeMilestoneCelebration();
        });
        const jw = e.byId("outlinePayoffDialog");
        function qw(e, t = null) {
            const n = e => !t || t.has(e), i = t ? new Set([ ...t ].map(t => {
                const n = qn[t] || Xn(t) || (at[e] || {})[t];
                return n && n.branch || ci(t);
            }).filter(Boolean)) : null, a = new Set([ ...cn[e] || [] ]), r = new Set([ ...ln[e] || [] ]);
            return Object.keys(vt[e] || {}).forEach(t => {
                if (!n(t) || Eo(e, t)) return;
                a.add(t);
                const i = qn[t] || Xn(t) || (at[e] || {})[t], o = i && i.branch || ci(t);
                o && r.add(o);
            }), {
                branches: [ ...r ].filter(e => !i || i.has(e)),
                nodes: [ ...a ].filter(n),
                newest: [ ...dn[e] || [] ].filter(n)
            };
        }
        function Hw(e) {
            return new Set([ ...Uc(), ...Object.keys(vt[e] || {}), ...Object.keys(Qe[e] || {}), ...Object.keys(Je[e] || {}), ...Object.keys(et[e] || {}), ...Object.keys(tt[e] || {}), ...Object.keys(at[e] || {}), ...Object.values(at[e] || {}).map(e => e && e.parentId).filter(Boolean) ]);
        }
        function Ww(e) {
            const t = Qu(e, Hw(e));
            return gt[e] && Object.keys(gt[e]).length && (t.loaderState = gt[e]), t;
        }
        function Uw(e) {
            return e && "sexcapades" === e.app && (16 === e.version || 17 === e.version) && e.ratings && "object" == typeof e.ratings;
        }
        e.byId("outlinePayoffStory") && e.byId("outlinePayoffStory").addEventListener("click", () => {
            const e = as;
            Ps(), e && vt[e] && Qd([ e ]);
        }), e.byId("outlinePayoffCard") && e.byId("outlinePayoffCard").addEventListener("click", () => {
            const e = as;
            Ps(), e && vt[e] && op(e);
        }), e.byId("outlinePayoffDismiss") && e.byId("outlinePayoffDismiss").addEventListener("click", Ps), jw.addEventListener("cancel", e => {
            e.preventDefault(), Ps();
        }), Hg.addEventListener("input", () => rw("profileDetailsNameField", "profileDetailsNameError", !1)), 
        im.addEventListener("input", dw), rm.addEventListener("input", dw), Wg.addEventListener("change", () => {
            rw("profileDetailsGenderField", "profileDetailsGenderError", !1), wb().length <= 3 && "Choose no more than three genders." === sm.textContent && (sm.textContent = "");
        }), Ug.addEventListener("change", () => rw("profileDetailsSexualityField", "profileDetailsSexualityError", !1)), 
        Kg.addEventListener("input", () => rw("profileDetailsAgeField", "profileDetailsAgeError", !1)), 
        e.byId("chooseProfilePhotos").onclick = () => lm.click(), lm.addEventListener("change", async e => {
            await async function(e) {
                const t = Math.max(0, 8 - Wy.length), n = [ ...e ].slice(0, t);
                if (!n.length) return void (sm.textContent = Wy.length >= 8 ? "A profile can hold up to 8 photos." : "");
                sm.textContent = `Preparing ${n.length} ${1 === n.length ? "photo" : "photos"}…`;
                let i = 0, a = 0;
                for (const t of n) try {
                    const e = await aw(t);
                    Wy.push(e), e.focusStatus && "detected" !== e.focusStatus && a++, i++;
                } catch (e) {
                    sm.textContent = e.message || "A photo could not be prepared.";
                }
                ew(), i && (sm.textContent = a ? `${i} ${1 === i ? "photo" : "photos"} ready. Face auto-center was unavailable or found no face, so ${1 === a ? "the crop starts" : "those crops start"} centered.` : `${i} ${1 === i ? "photo" : "photos"} ready to save.`, 
                Ty(Wy.length - i));
            }(e.target.files || []), e.target.value = "";
        }), cm.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "removePhoto"), n = __sxClosestAction(e.target, "movePhoto"), i = __sxClosestAction(e.target, "adjustPhoto");
            if (t) return Wy.splice(Number(t.dataset.removePhoto), 1), ew(), void (sm.textContent = "Photo removed. Save changes to keep this update.");
            if (n) {
                const e = Number(n.dataset.movePhoto), t = e + Number(n.dataset.photoStep);
                if (e >= 0 && t >= 0 && e < Wy.length && t < Wy.length) {
                    const [n] = Wy.splice(e, 1);
                    Wy.splice(t, 0, n), ew(), sm.textContent = `Photo moved to position ${t + 1}. The first photo is used in the center node.`;
                }
                return;
            }
            i && Ty(Number(i.dataset.adjustPhoto));
        }), e.all("[data-get-ratings-list]").forEach(e => e.addEventListener("click", () => {
            sxOutlineSortMode = "popularity";
        })), e.all("[data-profile-details-converter]").forEach(n => n.addEventListener("click", () => {
            const kind = n.dataset.profileDetailsConverter, mode = n.dataset.converterMode || "auto";
            jY = ({ outline: "Popularity list", kinktest: "KinkTest import", bdsmtest: "BDSMtest import", checklist: "Yes/No/Maybe checklist", fetlife: "FetLife import" })[kind] || "import", Vy = id => "outline" === kind ? Ms(id) : Ax(kind, mode, id), vw();
        })), Hg.addEventListener("keydown", e => {
            "Enter" === e.key && (e.preventDefault(), vw());
        }), e.byId("closeProfileImport") && (e.byId("closeProfileImport").onclick = () => Ui(Sg)), Sg.addEventListener("click", e => {
            e.target === Sg && Ui(Sg);
        }), e.all("[data-import-converter]").forEach(e => e.addEventListener("click", () => {
            const t = e.dataset.importConverter, sxOrigin = sxLoadOriginId && vt[sxLoadOriginId] ? sxLoadOriginId : null;
            Ui(Sg);
            const n = e.dataset.converterMode || "auto";
            // Caller-tab routing keys ONLY on a recorded origin
            // (sxLoadOriginId, from a tab's Load menu). Mere
            // active-profile presence is never a target here: a
            // first import started from this dialog while a profile
            // is active must still reach the load-into chooser, not
            // land silently in the active profile (2026-10-30 ruling,
            // first-import prompt rule).
            sxOrigin ? Ax(t, n, sxOrigin) : Mt && vt[Mt] ? Ax(t, n) : (bw(null), Vy = id => Ax(t, n, id));
        }));
        // FROZEN LEGACY TABLE (Kw): old topic-slug spellings -> current
        // generated slugs, merged over the auto-generated slug->id map when
        // old profile files are imported. It covers only spellings that
        // shipped before profiles began traveling by topic ID (slug-gap
        // fix, 2026-10-22). It is a closed set — never extend it for
        // post-fix files — and it retires at v4.0.
        const Gw = "topic-impact-pain-body-modification-whipping", Kw = Object.freeze({
            [Gw]: "topic-impact-pain-body-modification-whips",
            "topic-impact-pain-body-modification-canes": "topic-impact-pain-body-modification-caning",
            "topic-clothing-materials-objects-diaper": "topic-clothing-materials-objects-diapers",
            "topic-fantasy-transformation-genderplay": "topic-fantasy-transformation-gender-play",
            "topic-roleplay-identity-doctor-nurse-roleplay": "topic-roleplay-identity-doctor-nurse",
            "topic-impact-pain-body-modification-clamps-and-clips": "topic-impact-pain-body-modification-clamps",
            "topic-clothing-materials-objects-spandex": "topic-clothing-materials-objects-lycra-spandex",
            "topic-bondage-restriction-suspension": "topic-bondage-restriction-suspension-bondage",
            "topic-primal-pursuit-predator-prey": "topic-primal-pursuit-hunter-prey",
            "topic-impact-pain-body-modification-scratch-bite-play": "topic-primal-pursuit-biting-scratching",
            "topic-sensation-atmosphere-wax": "topic-sensation-atmosphere-wax-temperature",
            "topic-sensation-atmosphere-electro-sensation": "topic-sensation-atmosphere-electrical-play",
            "topic-impact-pain-body-modification-artistic-cutting": "topic-impact-pain-body-modification-cutting",
            "topic-impact-pain-body-modification-decorative-cutting": "topic-impact-pain-body-modification-cutting",
            "topic-impact-pain-body-modification-needles-piercing": "topic-impact-pain-body-modification-needle-play",
            "topic-impact-pain-body-modification-play-piercing": "topic-impact-pain-body-modification-needle-play",
            "topic-impact-pain-body-modification-piercings": "topic-impact-pain-body-modification-needle-play",
            "topic-bondage-restriction-japanese-bondage": "topic-bondage-restriction-rope-bondage",
            "topic-bondage-restriction-hojojutsu": "topic-bondage-restriction-rope-bondage",
            "topic-bondage-restriction-hemp-rope": "topic-bondage-restriction-rope-bondage",
            "topic-bondage-restriction-decorative-rope": "topic-bondage-restriction-rope-bondage",
            "topic-clothing-materials-objects-corsetry": "topic-clothing-materials-objects-corsets",
            "topic-clothing-materials-objects-corset-training": "topic-clothing-materials-objects-corsets",
            "topic-clothing-materials-objects-corset-cinching": "topic-clothing-materials-objects-corsets",
            "topic-body-focus-appearance-tattoos": "topic-body-focus-appearance-body-modification",
            "topic-body-focus-appearance-tattoo-body-modification-focus": "topic-body-focus-appearance-body-modification",
            "topic-service-ritual-sex-magick": "topic-service-ritual-spiritual-play",
            "topic-service-ritual-sacred-sexuality": "topic-service-ritual-spiritual-play",
            "topic-service-ritual-spiritual-bdsm": "topic-service-ritual-spiritual-play",
            "topic-watching-exposure-settings-victorian-pornography": "topic-watching-exposure-settings-vintage-porn",
            "topic-sensation-atmosphere-cigars": "topic-sensation-atmosphere-smoking",
            "topic-sex-acts-douching": "topic-fluids-messy-play-douching",
            "topic-sex-acts-vaginal-fisting": "topic-sex-acts-fisting",
            "topic-sex-acts-tearing-off-clothing": "topic-psychological-dynamics-tearing-off-clothing",
            "topic-body-focus-appearance-foot-massage": "topic-service-ritual-foot-massage",
            "topic-body-focus-appearance-depilation-shaving": "topic-body-focus-appearance-depilation",
            "topic-sensation-atmosphere-liquor": "topic-fluids-messy-play-liquor",
            "topic-clothing-materials-objects-panty-sniffing": "topic-sensation-atmosphere-panty-sniffing",
            "topic-clothing-materials-objects-food-messy-play": "topic-fluids-messy-play-chocolate",
            "topic-clothing-materials-objects-showerheads": "topic-bondage-restriction-waterbondage",
            "topic-bondage-restriction-tape-wrapping": "topic-bondage-restriction-tape",
            "topic-roleplay-identity-doctor-nurse-play": "topic-roleplay-identity-doctor-nurse",
            "topic-body-focus-appearance-toes-and-feet": "topic-body-focus-appearance-toes",
            "topic-bondage-restriction-blindfolded-restraint": "topic-bondage-restriction-blindfold",
            "topic-bondage-restriction-caging-confinement": "topic-bondage-restriction-caging",
            "topic-bondage-restriction-crucifixion-play": "topic-bondage-restriction-crucifixion",
            "topic-bondage-restriction-cuffs-straps": "topic-bondage-restriction-cuffs",
            "topic-bondage-restriction-encasement-fetish": "topic-bondage-restriction-encasement",
            "topic-bondage-restriction-furniture-restraint": "topic-bondage-restriction-furniture",
            "topic-bondage-restriction-medieval-devices": "topic-bondage-restriction-medieval",
            "topic-bondage-restriction-spreaders-bars": "topic-bondage-restriction-spreaders",
            "topic-impact-pain-body-modification-sadism": "topic-psychological-dynamics-sadism",
            "topic-partner-configurations-gangbang-fantasy": "topic-partner-configurations-gangbang",
            "topic-psychological-dynamics-hypnosis-mind-control-fantasy": "topic-psychological-dynamics-hypnosis",
            "topic-psychological-dynamics-praise-in-scene": "topic-psychological-dynamics-praise",
            "topic-psychological-dynamics-small-penis-humiliation": "topic-psychological-dynamics-sph-humiliation",
            "topic-roleplay-identity-1950s-household": "topic-roleplay-identity-1950s",
            "topic-roleplay-identity-age-play-between-adults": "topic-roleplay-identity-age-play",
            "topic-roleplay-identity-captivity-kidnapping": "topic-roleplay-identity-kidnapping",
            "topic-roleplay-identity-caregiver-roles-adults": "topic-roleplay-identity-caregiver",
            "topic-roleplay-identity-consensual-non-consent-fantasy": "topic-roleplay-identity-cnc-fantasy",
            "topic-roleplay-identity-damsels-in-distress": "topic-roleplay-identity-damsels",
            "topic-roleplay-identity-historical-fantasy": "topic-roleplay-identity-historical",
            "topic-roleplay-identity-medical-play": "topic-roleplay-identity-medical",
            "topic-roleplay-identity-pet-play": "topic-roleplay-identity-pet",
            "topic-roleplay-identity-piggy-play": "topic-roleplay-identity-piggy",
            "topic-roleplay-identity-pony-play": "topic-roleplay-identity-pony",
            "topic-roleplay-identity-puppy-play": "topic-roleplay-identity-puppy",
            "topic-roleplay-identity-sister-brother-roleplay": "topic-roleplay-identity-siblings",
            "topic-roleplay-identity-teacher-student-roleplay": "topic-roleplay-identity-teacher-student",
            "topic-roleplay-identity-vampires-gothic": "topic-roleplay-identity-vampires",
            "topic-roleplay-identity-victorian-lifestyles": "topic-roleplay-identity-victorian",
            "topic-sex-acts-anal-training": "topic-sex-acts-training",
            "topic-sex-acts-fingering-mouths": "topic-sex-acts-mouth-fingering",
            "topic-sex-acts-fucking-machines": "topic-sex-acts-machines",
            "topic-sex-acts-urethral-fucking": "topic-sex-acts-urethral",
            "topic-sex-acts-vacuum-pumping": "topic-sex-acts-pumping",
            "topic-sex-acts-vaginal-stretching": "topic-sex-acts-stretching",
            "topic-body-focus-appearance-feet-footwear": "topic-body-focus-appearance-feet"
        }), zw = Object.freeze(Object.fromEntries(h.flatMap(e => e.topics.map(t => [ Kn(e.name, sxName(t)), Wn(t) ])))), Vw = Object.freeze(Object.assign({}, zw, Object.fromEntries(Object.entries(Kw).map(([e, t]) => [ e, zw[t] || t ]))));
        // BURIAL REGISTRY (E4b, slug-gap design-away, 2026-10-22): when
        // the owner rules a topic DELETED from the taxonomy (rather than
        // renamed, split, or merged), its canonical id is entered here
        // at the moment of the ruling, with a one-line reason. Ingest
        // then reports that id's entries as deliberately retired: they
        // are never stored in ratings or side maps, never parked on
        // profile.droppedKeys, and never shown in On Deck. Only
        // canonical ids (t####) belong in this registry — a slug
        // spelling of a deleted topic is not buried; it parks like any
        // other unrecognized spelling.
        const BURIED_TOPIC_IDS = Object.freeze({
            t0001: "Direction (topic deleted)"
        });
        // Explicit ingest resolution order (E4b): a single incoming key
        // resolves through exactly these stages, in this order —
        // (1) a canonical topic id present in the catalog resolves from
        // the catalog alone and never consults any table; (2) the
        // generated slug for a current topic; (3) the FROZEN LEGACY
        // TABLE (Kw), whose target is a generated slug (resolved
        // through zw) or, defensively, a canonical id; (4) no
        // resolution — the caller parks the key. Burial is checked
        // between (1) and (2): a buried id is canonical in form but
        // absent from the catalog, and only a literal canonical id can
        // match the registry, so slug spellings never reach it. This
        // order is what lets a post-fix file load by ID with the rename
        // table bypassed entirely.
        function resolveIngestKey(key) {
            if ("string" != typeof key || !key) return null;
            if (topicLabelById[key]) return {
                id: key,
                via: "id"
            };
            if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, key)) return {
                id: key,
                via: "buried"
            };
            if (zw[key]) return {
                id: zw[key],
                via: "slug"
            };
            if (Object.prototype.hasOwnProperty.call(Kw, key)) {
                const target = Kw[key];
                if (zw[target]) return {
                    id: zw[target],
                    via: "legacy"
                };
                if (topicLabelById[target]) return {
                    id: target,
                    via: "legacy"
                };
                return null;
            }
            return null;
        }
        function Yw(e) {
            if (!e || "object" != typeof e) return e;
            // SUNSET (slug-gap design-away, 2026-10-22): this is the
            // legacy slug-resolution path — incoming keys are rewritten
            // through Vw, the generated slug->id map merged with the
            // FROZEN LEGACY TABLE (Kw). The frozen legacy rename table
            // and this slug-spelling resolution fallback retire at v4.0:
            // post-fix files travel by topic ID and never consult them.
            // They remain only so pre-fix slug-keyed files resolve one
            // last time, after which the profile re-saves by ID.
            // E4b: the rewrite map is built in the explicit resolution
            // order of resolveIngestKey — generated slugs (stage 2) are
            // entered first and a frozen legacy entry (stage 3) can
            // never shadow one. Canonical topic ids (stage 1) are not
            // keys of this map at all: they resolve from the catalog
            // alone and pass through here untouched, and buried ids are
            // likewise left for rk to report as retired.
            const t = {};
            Object.entries(zw).forEach(([k, v]) => {
                t[k] = v;
            }), Object.entries(Kw).forEach(([k, v]) => {
                Object.prototype.hasOwnProperty.call(t, k) || (t[k] = zw[v] || v);
            });
            Object.entries(LEGACY_NODE_IDS).forEach(([k, v]) => {
                Object.prototype.hasOwnProperty.call(t, k) || (t[k] = v);
            });
            if (e.importedChildren && "object" == typeof e.importedChildren) {
                const n = {};
                Object.entries(e.importedChildren).forEach(([e, i]) => {
                    if (!i || "object" != typeof i) return;
                    const a = (resolveIngestKey(i.parentId) || {}).id || t[i.parentId] || i.parentId, r = ni(i.label), o = a && r ? "subtopic-" + Hn(a) + "-" + Hn(r) : e;
                    e !== o && (t[e] = o), i.id && i.id !== o && (t[i.id] = o), n[o] = Object.assign({}, i, {
                        id: o,
                        parentId: a
                    });
                }), e.importedChildren = n;
            }
            const n = (e, t) => {
                if (void 0 === t) return e;
                // LIMITS COMPLETENESS (repair): when two stored keys canonicalize
                // to the same topic, the merged rating keeps the MOST RESTRICTIVE
                // (lowest) value per direction. The old max-merge silently erased
                // a stated deep-red at import time — e.g. a payload carrying both
                // "topic-sex-acts-vaginal-fisting" (-100/-90) and a milder duplicate
                // key for the same topic stored only the mild value, so the topic
                // never reached the checklist's red list.
                const i = e => {
                    if ("object" != typeof e && Number.isFinite(Number(e))) return {
                        give: Number(e),
                        receive: Number(e)
                    };
                    if (!e || "object" != typeof e) return null;
                    const t = {};
                    return [ "give", "receive" ].forEach(n => {
                        Object.prototype.hasOwnProperty.call(e, n) && Number.isFinite(Number(e[n])) && (t[n] = Number(e[n]));
                    }), Object.keys(t).length ? t : null;
                }, a = i(e), r = i(t);
                if (!a) return t;
                if (!r) return e;
                if ("object" != typeof e && "object" != typeof t) return Math.min(Number(e), Number(t));
                const o = {};
                return [ "give", "receive" ].forEach(e => {
                    const t = [ a[e], r[e] ].filter(Number.isFinite);
                    t.length && (o[e] = Math.min(...t));
                }), Object.keys(o).length ? o : t;
            };
            return Object.entries(t).forEach(([t, i]) => {
                const a = (e, n = null) => {
                    if (!e || "object" != typeof e || !Object.prototype.hasOwnProperty.call(e, t)) return;
                    const a = e[t], r = e[i];
                    e[i] = n ? n(a, r) : void 0 === r ? a : r, delete e[t];
                };
                if (a(e.ratings, n), a(e.ratingSources, (e, t) => void 0 === t ? e : Object.assign({}, e, t)), 
                a(e.annotations), a(e.fantasyOnly), a(e.alreadyTried), e.notes && "object" == typeof e.notes && Object.prototype.hasOwnProperty.call(e.notes, t)) {
                    const n = Array.isArray(e.notes[t]) ? e.notes[t] : [], a = Array.isArray(e.notes[i]) ? e.notes[i] : [];
                    e.notes[i] = [ ...new Set([ ...a, ...n ]) ], delete e.notes[t];
                }
                e.importAttention && "object" == typeof e.importAttention && [ "nodes", "newest" ].forEach(n => {
                    Array.isArray(e.importAttention[n]) && (e.importAttention[n] = [ ...new Set(e.importAttention[n].map(e => e === t ? i : e)) ]);
                }), e.lists && "object" == typeof e.lists && Object.keys(e.lists).forEach(n => {
                    Array.isArray(e.lists[n]) && (e.lists[n] = [ ...new Set(e.lists[n].map(e => e === t ? i : e)) ]);
                });
            }), e;
        }
        let Xw = null;
        function Zw(e, t, n) {
            return `<span class="profile-tab is-editing"><input class="profile-name-input" data-profile-name-input type="text" maxlength="40" autocomplete="off" value="${Hi(t)}" placeholder="Profile name" aria-label="${Hi(n)}"></span>`;
        }
        function sxNormalizePairName(e) {
            // Pair-name normalization (2026-10-27): group records
            // minted before the pair glyphs were split carry the old
            // circle-cross joiner in their stored name. A bowtie
            // group's ⊗ becomes ⋈; a straight group's becomes ⊙.
            // Only group records are touched — a non-group profile's
            // name is never rewritten, whatever it contains. Jw runs
            // on every load and activation, so a legacy name is
            // corrected the first time its tab renders, and zt marks
            // the correction for the persist path like any edit.
            const rec = ft[e];
            if (!rec || "group" !== rec.kind || !wt[e] || !String(wt[e]).includes("⊗")) return;
            wt[e] = String(wt[e]).split("⊗").join("straight" === rec.pairOp ? "⊙" : "⋈"), zt(e);
        }
        // Duplicate tab labels (owner ruling, 2026-10-27): same-name
        // tabs are told apart by a dash-plus-number suffix on the TAB
        // LABEL ONLY, counting from 2 — the first tab keeps the plain
        // label, the next gets "-2", then "-3", and so on. Profile
        // names (wt) stay clean; identity and selection ride the
        // internal profile ids (data-view), never the label. Jw resets
        // the counter at the start of every tab-strip render and the
        // strip renders profiles in vt key order, so the numbering is
        // stable across renders.
        let sxTabLabelSeen = {};
        function sxDupTabLabel(e, label) {
            const nm = wt[e];
            return sxTabLabelSeen[nm] = (sxTabLabelSeen[nm] || 0) + 1, sxTabLabelSeen[nm] > 1 ? `${label}-${sxTabLabelSeen[nm]}` : label;
        }
        function Jw() {
            sxTabLabelSeen = {};
            const t = Object.keys(vt).filter(e => Boolean(wt[e]));
            Mt && !vt[Mt] && (Mt = null), It && !vt[It] && (It = null), document.documentElement.style.setProperty("--active-profile-color", Mt && vt[Mt] ? la(Mt) : "var(--focus)");
            const i = Yi(), r = Boolean(Kd()), o = i.length > 1, s = an && o, l = o || r, c = s || r, d = t.map(e => {
                sxNormalizePairName(e);
                if (Xw && Xw.id === e) return sxDupTabLabel(e, wt[e]), Zw(0, wt[e], `Rename ${wt[e]}`);
                const t = i.includes(e), n = la(e), o = sxDupTabLabel(e, wt[e]), s = Mt === e, l = Boolean(ft[e]), c = av(vpt[e]), d = Boolean(vht[e]), u = zi(2 * (c - 50)), h = yt[e] ? '<sup class="profile-tab-dirty" aria-hidden="true">*</sup>' : "", g = `<button type="button" class="profile-tab-veil${d ? " is-enabled" : ""}" data-profile-veil="${Hi(e)}" aria-controls="veilPopover" aria-expanded="false" aria-pressed="${d}" aria-label="${Hi(wt[e])} Veil ${d ? "on" : "off"}, level ${c}. Open Veil settings." title="Veil ${d ? "on" : "off"} · ${c}" style="--veil-color:${u}"><svg viewBox="0 0 24 16" aria-hidden="true" focusable="false"><path class="veil-icon-cloth" d="M12 2.4C9.1 2.4 6.7 2.9 4.9 3.8C5.4 7 5.2 10.2 3.5 13.6C5.4 12.6 7.2 12.3 9 13.4C10 12.6 11 12 12 11.7C13 12 14 12.6 15 13.4C16.8 12.3 18.6 12.6 20.5 13.6C18.8 10.2 18.6 7 19.1 3.8C17.3 2.9 14.9 2.4 12 2.4Z"/><path class="veil-icon-fold" d="M8.2 3.9C8.5 6.8 8.4 9.7 7.5 12.6M15.8 3.9C15.5 6.8 15.6 9.7 16.5 12.6M12 4.2V11.4"/></svg></button>`, heatBtn = `<button type="button" class="profile-tab-heat" data-profile-heat="${Hi(e)}" aria-controls="heatPopover" aria-expanded="false" aria-label="${Hi(wt[e])} ${l ? "Group Heat" : "Heat"} ${Hi(sxHeatZone(sxHeatDisplayFor(e)))}. Open Heat settings." title="${l ? "Group Heat" : "Heat"} · ${Hi(sxHeatZone(sxHeatDisplayFor(e)))}"><svg class="sx-heat-flame" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path fill="currentColor" d="M8 14c-4-2-4-6-1-9 0 3 2 2 2-3 4 4 5 8-1 12Zm0 0c-2-1-2-3 0-5 2 2 2 4 0 5"/></svg><span class="sx-heat-zone">${Hi(sxHeatZone(sxHeatDisplayFor(e)))}</span><svg class="sx-heat-flame" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path fill="currentColor" d="M8 14c-4-2-4-6-1-9 0 3 2 2 2-3 4 4 5 8-1 12Zm0 0c-2-1-2-3 0-5 2 2 2 4 0 5"/></svg></button>`, loadBtn = `<button type="button" class="profile-tab-load" data-profile-load="${Hi(e)}" aria-haspopup="menu" aria-expanded="false" aria-label="Load or import data for ${Hi(wt[e])}" title="Load or import data for ${Hi(wt[e])}" data-ui-tooltip="Take a test or import profile data." data-tooltip-tap-first><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v10"/><path d="m7 9 5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg></button>`;
                return `<span class="profile-tab" style="--profile-color:${n}"><button type="button" class="profile-tab-save" data-save-profile="${Hi(e)}" aria-label="Export ${Hi(wt[e])}" data-ui-tooltip="Export this profile map." data-tooltip-tap-first><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 6.5 10 4h4l1.5 2.5H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3.5Z"/><circle cx="12" cy="13" r="3.5"/></svg></button>${g}${heatBtn}${loadBtn}<button type="button" role="tab" data-view="${Hi(e)}" class="profile-tab-button has-profile-color ${s ? "is-active " : ""}${t ? "is-selected is-multiselected " : ""}${d ? "has-veil" : ""}" style="--profile-color:${n};--veil-color:${u}" aria-selected="${s}" aria-pressed="${s}" data-ui-tooltip="Switch to this profile. Ctrl+click (Cmd+click on Mac) adds it to the group comparison." data-tooltip-name="${Hi(o)}" aria-label="${Hi(o)} profile, ${Hi(Qv(e))}${yt[e] ? ", unsaved changes" : ""}${t ? ", selected for grouping" : ""}${d ? `, Veil on at ${c}` : ""}"><span data-profile-label data-full-label="${Hi(o)}">${Hi(o)}</span>${h}</button><button type="button" class="profile-tab-close" data-close-profile="${Hi(e)}" aria-label="Close ${Hi(wt[e])} profile">×</button></span>`;
            }), u = Xw && null === Xw.id ? Zw(0, "", "Name new profile") : "", p = `<span class="profile-add-stack"><button type="button" class="profile-add" data-add-profile aria-label="Add or import a profile" aria-haspopup="menu" aria-expanded="false" title="Add or import a profile">+</button>${sxMatchIconsHtml()}</span>`, h = d.pop() || "", g = e.byId("profileTabs"); const sxMtHtml = sxMatchTabsHtml();
            g.classList.remove("is-empty"), e.one(".toolbar").classList.toggle("has-no-profiles", !t.length);
            const m = e.byId("firstVisitCta"), fvcDismissed = new URLSearchParams(location.search).get("hide-start-cta") === "1", fvcRestore = e.byId("showFirstVisitCta");
            m && (m.hidden = Boolean(t.length) || fvcDismissed), fvcRestore && (fvcRestore.hidden = Boolean(t.length) || !fvcDismissed), t.length ? n(g, d.join("") + (h ? `<span class="profile-tab-tail">${h}${p}</span>` : u + p) + (h ? u : "") + sxMtHtml) : n(g, u + p + sxMtHtml), 
            !dv.hidden && Qt && (bv = wv(Qt) || sv), Mv(), dv.hidden || Av(!0), gl();
            const f = e.byId("scribeTab"), activeActions = e.byId("activeProfileActions");
            activeActions && (activeActions.hidden = !Mt || !vt[Mt]), f.hidden = !(t.length || document.querySelector(".profile-tab-button")), f.textContent = "Scribe";
            const y = e.byId("openOpener"), b = e.byId("openNegotiation");
            y.hidden = _g && _g.open ? !(Hy && vt[Hy] && !ft[Hy]) : !Mt || !vt[Mt] || Boolean(ft[Mt]), b.hidden = !(i.length >= 2 || r && (ft[Mt]?.sourceIds || []).length >= 2);
            const k = e.byId("overlayTab");
            k.hidden = !o, k.textContent = an ? "Hide group overlay" : "Show group overlay", k.title = an ? "Hide the selected profiles’ comparison overlay" : "Show the selected profiles’ comparison overlay", 
            k.setAttribute("aria-pressed", String(an));
            const x = e.byId("overlayStatus");
            x.textContent = "", x.parentElement.hidden = !0, e.one(".filters").hidden = !t.length,
            Da(), e.one(".scribe-separator").hidden = !t.length, e.one(".actions-separator").hidden = !t.length, 
            Vd(), e.byId("newBlankProfile") && (e.byId("newBlankProfile").hidden = !1), Ew();
        }
        function ek(e) {
            return Object.keys(wt).find(t => wt[t].toLocaleLowerCase() === e.toLocaleLowerCase()) || null;
        }
        function tk() {
            if (!Xw) return;
            const e = tl.querySelector("[data-profile-name-input]"), t = Xw.id, n = (e ? e.value : "").trim().replace(/\s+/g, " ");
            if (!n) return Xw = null, void Jw();
            const i = ek(n);
            if (i && i !== t) return tS(`${n} already has a profile`, {
                tone: "error",
                persistent: !0
            }), void function(e = !1) {
                requestAnimationFrame(() => {
                    const t = tl.querySelector("[data-profile-name-input]");
                    t && (t.focus(), e && t.select());
                });
            }(!0);
            if (Xw = null, null !== t) {
                if (!vt[t]) return Jw();
                const e = wt[t];
                return wt[t] = n, e !== n && zt(t), Jw(), Mr(), void (e !== n && tS(`${e} renamed ${n}`));
            }
            bw(null);
        }
        function nk(e) {
            eS();
            const t = Object.keys(vt);
            if (!vt[e]) return void Jw();
            const n = Mt === e, i = t.indexOf(e);
            Xw && Xw.id === e && (Xw = null), 
            // F1: close deletes EVERY list on the canonical list (this
            // now includes the uuid list, profileUuids). The deletes
            // after the loop are close-path extras, not profile-record
            // fields: the import path's dropped-key records, and the
            // attention/save-state lists (ln, pn, hn).
            SX_PROFILE_FIELDS.forEach(t => Reflect.deleteProperty(t, e)), delete droppedKeyRecords[e], 
            delete ln[e], delete pn[e], delete hn[e], Qt === e && Cv(), sxHeatQt === e && sxCvHeat(), sxSel(e, "remove"), fh === e && (fh = null);
            const rememberProfiles = window.Sexcapades2xRememberProfiles;
            rememberProfiles && rememberProfiles.isEnabled && rememberProfiles.isEnabled() && rememberProfiles.saveNow();
            const a = Object.keys(wt).filter(e => Boolean(vt[e]));
            if (n && a.length) return Js(a[Math.min(Math.max(0, i), a.length - 1)]), void Ih();
            n ? (Mt = null, It = null, Nt = null, Lt = null, kn = !0, xn = null, Sn = "all", 
            rn.clear(), on.clear(), h.forEach(e => {
                rn.add(e.name), un.set(catId(e.name), "all"), (e.subcategories || []).forEach(t => {
                    const s = Un(e.name, t.name);
                    un.set(s, "all"), on.add(s);
                }), e.topics.forEach(e => {
                    un.set(Wn(e), "all"), on.add(Wn(e));
                });
            }), Ct = !1) : It === e && (It = Mt), Jw(), Mr(), Ih();
        }
        function ik(e) {
            const t = "profile-" + (Hn(e) || "untitled");
            let n = t, i = 2;
            for (;vt[n]; ) n = t + "-" + i++;
            return n;
        }
        function ak(e, t = {}) {
            Xw = null, Js(e, t);
        }
