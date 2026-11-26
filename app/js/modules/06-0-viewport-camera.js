        e.byId("scribeTab") && e.byId("scribeTab").addEventListener("pointerenter", yc), e.byId("scribeTab") && e.byId("scribeTab").addEventListener("click", e => {
            yc(), Jd();
        }), e.byId("closeScribeChoice") && e.byId("closeScribeChoice").addEventListener("click", () => Ui(Bc)), e.byId("closeNovelAi") && e.byId("closeNovelAi").addEventListener("click", () => Ui(jc)), jc && jc.addEventListener("click", e => {
            e.target === jc && Ui(jc);
        }), e.byId("closeScribe") && e.byId("closeScribe").addEventListener("click", () => Ui(Oc));
        const fp = innerWidth <= 620 ? 1.3 : 1.16, yp = Number(navigator.deviceMemory) || 0, bp = Number(navigator.hardwareConcurrency) || 0, vp = yp > 0 && yp <= 4, wp = bp > 0 && bp <= 4, kp = vp && (0 === bp || wp) || wp && (0 === yp || vp);
        // Enable camera animations for compatible hardware (any system without prefers-reduced-motion)
        Bt = Boolean(!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
        const xp = Boolean((navigator.maxTouchPoints || 0) > 0 && window.matchMedia && window.matchMedia("(pointer: coarse)").matches), Sp = !Object.keys(wt).length || kp || xp;
        let $p = fp, Ep = 900 - 900 * fp, Ap = 620 - 620 * fp, Cp = !1, Sq = null, Mp = null, Ip = null, Pp = null, Lp = null, Tp = null, Fp = null, Np = null, _p = null, triDragState = null, radarDragState = null, sxWidgetWheelPending = null, sxMapTriMemory = {}, Dp = 0, Rp = 0, Op = 0, Bp = 0, jp = {
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
        // dialog (bw in "about" mode) - the same template and behavior as
        // any user profile's About dialog. Her contact email lives in the
        // profile contact field (ut), her bio in the About Me field (nt) and
        // her note in the Terms of Engagement field (it). The record is removed
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
        // On-map widget zoom gate (Jason, 2026-11-22): below a
        // reasonable zoom the on-map rating widgets are hard to hit
        // accurately, so the spoke renderer swaps them for a readout
        // chip (strongest poles) that opens the full widget popup on
        // click. Threshold is the camera scale relative to fit.
        window.SX_MAP_WIDGET_MIN_ZOOM = 2;
        let sxFitScaleCache = 0, sxZoomGateSide = null;
        window.sxMapZoomRatio = function() {
            if (!(sxFitScaleCache > 0)) try {
                const f = sxFitFrame();
                if (f && f.scale > 0) sxFitScaleCache = f.scale;
            } catch (e) {}
            return sxFitScaleCache > 0 ? $p / sxFitScaleCache : 1;
        };
        window.sxMapZoomAllowsWidgets = function() {
            return window.sxMapZoomRatio() >= window.SX_MAP_WIDGET_MIN_ZOOM;
        };
        function sxZoomGateCheck() {
            const side = window.sxMapZoomAllowsWidgets();
            if (null === sxZoomGateSide) return void (sxZoomGateSide = side);
            if (side !== sxZoomGateSide) {
                sxZoomGateSide = side;
                if (typeof Mr === "function") Mr();
            }
        }
        function dh() {
            if (!Yp) return;
            const e = Yp;
            Yp = null, e.animation.onfinish = null, e.animation.oncancel = null, e.animation.cancel(),
            Ep = e.tx, Ap = e.ty, $p = e.scale, Jp.setAttribute("transform", `translate(${Ep} ${Ap}) scale(${$p})`),
            wh(), th.scale = $p, th.tx = Ep, th.ty = Ap, Mn.style.transform = "none";
            sxZoomGateCheck();
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
        // fitted view clamped straight up to .12 - a visible jump over the
        // in-between levels. The floor was then .01 in every camera clamp
        // (fit, wheel, buttons, pinch, focus-keep) so zoom is continuous
        // from the fitted view in both directions, and the ceiling is 60
        // so zoom-in always reaches at least 15x from any fitted view
        // (the fit itself is capped at 2.3, so 60 guarantees >= 26x).
        // 2026-11-02: floor lowered .01 -> .0001 in every camera clamp
        // (and the wheel at-floor guard) - at the owner's size-100
        // layout the painted map spans ~3.26M x 2.40M units and the
        // whole-map fit scale computes to ~0.00092, below even a .001
        // floor, so fit pinned at the floor and cropped the map.
        // .0001 sits ~9x below the required fit scale; ceiling 60
        // unchanged.
        // 2026-11-02 (owner's order): the artificial caps are removed
        // in practice - floor 1e-9 and ceiling 1e6 in every camera
        // clamp (and the wheel at-floor guard), roughly six orders of
        // magnitude of headroom past the ~0.00092 whole-map fit scale
        // and the ~0.003 tappable scale, so no zoom path binds in any
        // reachable use.
        const Eh = () => 1e6;
        function Ah(e, t = 900, n = 620, i = !1) {
            noteFitUserCamera();
            const a = $p;
            $p = Math.max(1e-9, Math.min(Eh(), e)), Ep = t - $p / a * (t - Ep), Ap = n - $p / a * (n - Ap),
            i ? (bh(), Sh()) : $h(), sxZoomGateCheck();
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
        // every node group has reached its settled rendered size -
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
            // Not laid out yet (slow phone open), paint still in
            // flight, or a camera animation still running: re-arm
            // instead of dying - an unlaid-out first check or a
            // mid-animation check must not kill the chain.
            // Boot close-up fix (2026-11-13): these waits must NOT
            // consume the 20-check budget - the boot paint + anneal
            // runs 25-45 s, so counting 400 ms waits as checks
            // exhausted the chain ~9 s in and the camera stayed
            // stuck on the centre portrait. Only a genuine re-fit
            // cycle counts; the cap still bounds those.
            if (!laidOut || painting || animating) return void scheduleFitSettleRefit(400);
            fitSettleChecks++;
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
            $p = f.scale, Ep = f.x, Ap = f.y, sxFitScaleCache = f.scale, $h(), armFitSettleRefit(), sxZoomGateCheck();
        }
        window.sxCenterFitViewport = Ih;
        let sxCenterPointerTapTime = 0, sxCenterPointerTapX = 0, sxCenterPointerTapY = 0, sxCenterPointerSingleTimer = null;
        function sxCenterAvatarClick(clientX, clientY, isDblHint) {
            const now = performance.now();
            const dist = (clientX !== undefined && clientY !== undefined) ? Math.hypot(clientX - sxCenterPointerTapX, clientY - sxCenterPointerTapY) : 0;
            const isDbl = Boolean(isDblHint) || (now - sxCenterPointerTapTime < 520 && dist < 50);
            if (isDbl) {
                if (sxCenterPointerSingleTimer) { clearTimeout(sxCenterPointerSingleTimer); sxCenterPointerSingleTimer = null; }
                sxCenterPointerTapTime = 0;
                sh();
            } else {
                sxCenterPointerTapTime = now;
                sxCenterPointerTapX = clientX || 0;
                sxCenterPointerTapY = clientY || 0;
                if (sxCenterPointerSingleTimer) clearTimeout(sxCenterPointerSingleTimer);
                sxCenterPointerSingleTimer = setTimeout(() => {
                    sxCenterPointerSingleTimer = null;
                    Ih();
                }, 280);
            }
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
            const i = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
                      Boolean(window.__sxNoCameraAnim) ||
                      Boolean(window.__SEXCAPADES_LAYOUT_API && window.__SEXCAPADES_LAYOUT_API.deknotter && window.__SEXCAPADES_LAYOUT_API.deknotter.active && window.__SEXCAPADES_LAYOUT_API.deknotter.active()) ||
                      Boolean(window.__sxAnnealRunning) ||
                      Boolean(typeof deknotterRunning !== "undefined" && deknotterRunning);
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
                    if (window.__sxZoomFromNavigation) {
                        window.__sxZoomFromNavigation = false;
                        if (typeof clearSpokeSelection === "function") clearSpokeSelection();
                    }
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

            // 1. Resolve Category - only match if rawId or migrated actually refers to the category, NOT because rawBranch is the parent branch!
            const cat = h.find(c => {
                if (c.id === rawId || c.id === migrated) return true;
                if (rawId && (c.name === rawId || c.name.toLowerCase() === rawId.toLowerCase())) return true;
                const cSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return (slug === cSlug || slug === `cat-${cSlug}`) && String(rawId).startsWith("cat-");
            }) || null;

            // 2. Resolve Subcategory - only match if rawId or migrated refers to the subcategory!
            let sub = null;
            if (!cat) {
                for (const c of h) {
                    for (const s of (c.subcategories || [])) {
                        const sidCandidate = typeof Un === "function" ? Un(c.name, s.name) : `subcategory-${s.name}`;
                        if (s.id === rawId || s.id === migrated || sidCandidate === rawId || sidCandidate === migrated) { sub = { cat: c, sub: s, id: sidCandidate }; break; }
                        if (rawId && (s.name === rawId || s.name.toLowerCase() === rawId.toLowerCase())) { sub = { cat: c, sub: s, id: sidCandidate }; break; }
                        const sSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                        if (slug === sSlug && (String(rawId).startsWith("subcategory-") || String(rawId).startsWith("subcat-"))) { sub = { cat: c, sub: s, id: sidCandidate }; break; }
                    }
                    if (sub) break;
                }
            }

            let sid = cat ? cat.id : (sub ? (sub.id || sub.sub.id) : migrated);
            const rec = qn[sid] || Xn(sid) || qn[rawId] || Xn(rawId) || null;
            let isCat = Boolean(cat) || isCatId(sid);
            let isSub = Boolean(sub) || isSubId(sid);

            // If a leaf topic node was passed, check if it is directly rendered on map; if so, frame/center on it!
            if (!isCat && !isSub && rec) {
                const leafEl = In.querySelector(`.node-group[data-layout-key="${CSS.escape(sid)}"]`) ||
                               In.querySelector(`.node-group[data-layout-key="${CSS.escape(rawId)}"]`);
                if (leafEl) {
                    const lx = Number(leafEl.dataset.layoutX), ly = Number(leafEl.dataset.layoutY);
                    if (Number.isFinite(lx) && Number.isFinite(ly)) {
                        const vb = Cn.viewBox && Cn.viewBox.baseVal && Cn.viewBox.baseVal.width > 0 ? Cn.viewBox.baseVal : nh;
                        const targetScale = Math.max(1e-9, Math.min(2.5, ($p > 1.0 ? $p : 1.35)));
                        const tx = (vb.x + vb.width / 2) - lx * targetScale;
                        const ty = (vb.y + vb.height / 2) - ly * targetScale;
                        return void Ph(targetScale, tx, ty);
                    }
                }
                // If not currently rendered, expand its branch/parent so it gets painted, then center on it!
                if (rec.branch && !rn.has(rec.branch)) {
                    rn.add(rec.branch);
                    if (rec.parentId && !on.has(rec.parentId)) on.add(rec.parentId);
                    Mr();
                    const runner = () => Th(sid, rec.branch);
                    if (window.sxPaintPromise) window.sxPaintPromise.then(() => requestAnimationFrame(runner));
                    else window.setTimeout(runner, 80);
                    return;
                }
                if (rec.parentId && !on.has(rec.parentId)) {
                    on.add(rec.parentId);
                    Mr();
                    const runner = () => Th(sid, rec.branch);
                    if (window.sxPaintPromise) window.sxPaintPromise.then(() => requestAnimationFrame(runner));
                    else window.setTimeout(runner, 80);
                    return;
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
                    const subId = sub.id || (typeof Un === "function" ? Un(sub.cat.name, sub.sub.name) : sub.sub.id);
                    if (k === subId) return false;
                    const item = qn[k] || Xn(k);
                    if (item && (item.parentId === subId || item.subcategoryId === subId || item.subId === subId)) return true;
                    const topicLabel = item ? (item.label || item.name) : null;
                    if (topicLabel && (sub.sub.topics || []).some(t => sxName(t) === sxName(topicLabel))) return true;
                    return false;
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
            // When a branch or spoke has been thrown, its children sit at
            // extended radii (> 100k wu); do not clamp to 80k in that case.
            let framedEls = childEls;
            if (isCat && Number.isFinite(anchorX) && Number.isFinite(anchorY)) {
                const hubs = childEls.filter(el => el.classList.contains("subcategory-node")).map(el => ({
                    x: Number(el.dataset.layoutX),
                    y: Number(el.dataset.layoutY)
                })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
                const hasFarThrownNodes = childEls.some(el => {
                    const x = Number(el.dataset.layoutX), y = Number(el.dataset.layoutY);
                    return Number.isFinite(x) && Number.isFinite(y) && Math.hypot(x - anchorX, y - anchorY) > 85000;
                });
                if (hubs.length && !hasFarThrownNodes) {
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
