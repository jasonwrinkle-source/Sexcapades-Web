        // --- Cross Slider: the pair-topic control (2026-11-24) ---
        // Ported from the ruled mockup (ts-spaces/cross-slider-mockup).
        // Two close-spaced lines, one puck per flank: give is a filled
        // disc, receive an open ring with a hollow transparent centre.
        // Puck position along the line is the leaning; drag up/down and
        // the same puck rides a vertical appetite arm that overlays the
        // other line and reserves no layout space. Puck colour is the
        // appetite on the app's own interest scale (zi). Slide a puck
        // off either end into the faded run-off and release to unrate
        // that flank; the unrated puck ghosts charcoal at the centre
        // of its own line, never at an end. Vertical travel never
        // unrates, not even into aversion.
        //
        // Scale note: the app stores leanings signed (-100..+100) and
        // the line shows them as 0..100 (lean = (appLean + 100) / 2),
        // so "Lean out" is the left end (-100) and "Lean in" the right
        // (+100). Appetite is the per-flank (n+1)th number, -100..+100,
        // stored per flank as giveIntensity / receiveIntensity and read
        // stored-first, derived only when missing (the derivation is
        // the signed strongest holding of the single flank value --
        // the leaning itself). The 2D switchbox canvas this replaces
        // coupled both flanks into one drag, coloured by leaning, and
        // had no appetite dimension at all.
        function sxCrossClamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
        function sxCrossLeanToPct(lean) { return (sxCrossClamp(Number(lean) || 0, -100, 100) + 100) / 2; }
        function sxCrossPctToLean(pct) { return sxCrossClamp(Math.round(pct * 2 - 100), -100, 100); }
        function sxCrossColor(app) {
            if (typeof zi === "function") return zi(app);
            var v = Number(app) || 0, n = Math.min(1, Math.abs(v) / 100);
            var a = [215, 189, 85], b = v > 0 ? [61, 168, 116] : [189, 79, 81];
            return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * n) + "," + Math.round(a[1] + (b[1] - a[1]) * n) + "," + Math.round(a[2] + (b[2] - a[2]) * n) + ")";
        }
        // Read one flank from a parsed record (ca): { lean, app } or
        // null when the flank is unrated. Appetite is the stored
        // per-flank intensity first; without one it derives from the
        // leaning, the way sxPlacementIntensity derives a missing
        // placement intensity (signed strongest holding).
        function sxCrossFlankState(rec, dir) {
            if (!rec || !rec[dir + "Known"]) return null;
            var lean = sxCrossClamp(Number(rec[dir]) || 0, -100, 100);
            var app = null;
            if (rec[dir + "IntensityKnown"] && Number.isFinite(Number(rec[dir + "Intensity"]))) app = sxCrossClamp(Number(rec[dir + "Intensity"]), -100, 100);
            else if (typeof sxSignedIntensity === "function") app = sxCrossClamp(sxSignedIntensity([lean]), -100, 100);
            else app = lean;
            return { lean: lean, app: app };
        }
        // Write one flank through the flat setters. A null value clears
        // the flank: leaning and its stored appetite both go, so a
        // slide-off unrate leaves no orphan intensity behind.
        function sxCrossWriteFlank(topicId, dir, value, profileId) {
            if (!topicId) return;
            if (value === null || value === undefined) {
                if (typeof Fo === "function") { Fo(topicId, dir, !1, profileId || null); Fo(topicId, dir + "Intensity", !1, profileId || null); }
                return;
            }
            if (typeof To !== "function") return;
            To(topicId, dir, sxCrossClamp(Math.round(Number(value.lean) || 0), -100, 100), !1, profileId || null);
            To(topicId, dir + "Intensity", sxCrossClamp(Math.round(Number(value.app) || 0), -100, 100), !1, profileId || null);
        }

        function sxCreateCrossSlider(opts) {
            opts = opts || {};
            var dir = opts.dir === "receive" ? "receive" : "give";
            var compact = !!opts.compact;
            var get = opts.get || function () { return null; };
            var onChange = opts.onChange || function () {};
            var onRelease = opts.onRelease || function () {};
            var label = opts.label || (dir === "give" ? "Give" : "Receive");
            var inset = compact ? 34 : 38;
            var runoffW = compact ? 24 : 28;
            var root = document.createElement("div");
            root.className = "xs" + (compact ? " compact" : "");
            root.dataset.dir = dir;
            root.innerHTML =
                '<div class="xs-head">' +
                    '<span class="xs-name"><span class="xs-dot"></span><span class="xs-label"></span></span>' +
                    '<span class="xs-vals"></span>' +
                '</div>' +
                '<div class="xs-stage">' +
                    '<div class="xs-runoff left" aria-hidden="true"></div>' +
                    '<div class="xs-runoff right" aria-hidden="true"></div>' +
                    '<div class="xs-arm"><div class="rail"></div></div>' +
                    '<div class="xs-track"><div class="xs-fill"></div><div class="xs-mid"></div>' +
                        '<div class="xs-puck" tabindex="0" role="slider"></div>' +
                    '</div>' +
                    '<div class="xs-bubble"></div>' +
                    '<div class="xs-scale"><span>Lean out</span><span>Lean in</span></div>' +
                    '<span class="xs-off-label left" aria-hidden="true">off</span>' +
                    '<span class="xs-off-label right" aria-hidden="true">off</span>' +
                '</div>';
            var stage = root.querySelector(".xs-stage");
            var track = root.querySelector(".xs-track");
            var fill = root.querySelector(".xs-fill");
            var puck = root.querySelector(".xs-puck");
            var arm = root.querySelector(".xs-arm");
            var bubble = root.querySelector(".xs-bubble");
            var vals = root.querySelector(".xs-vals");
            var labelEl = root.querySelector(".xs-label");
            labelEl.textContent = label;
            puck.setAttribute("aria-label", label + " leaning and appetite");
            [-100, -50, 0, 50, 100].forEach(function (t) {
                var el = document.createElement("div");
                el.className = "xs-tick" + (t === 0 ? " zero" : "");
                el.dataset.tick = t;
                el.innerHTML = "<span>" + (t > 0 ? "+" + t : t) + "</span>";
                arm.appendChild(el);
            });
            var labels = document.createElement("div");
            labels.className = "xs-arm-labels";
            labels.innerHTML = '<span class="up">Appetite</span><span class="down">Aversion</span>';
            arm.appendChild(labels);

            function render() {
                var s = get();
                var stageW = stage.clientWidth || 0;
                var stageH = stage.clientHeight || 48;
                var h = arm.clientHeight || 192;
                var pad = 16, inner = Math.max(40, h - pad * 2);
                var ticks = arm.querySelectorAll(".xs-tick");
                for (var ti = 0; ti < ticks.length; ti++) {
                    var t = parseInt(ticks[ti].dataset.tick, 10);
                    ticks[ti].style.top = (pad + (1 - (t + 100) / 200) * inner) + "px";
                }
                if (!s) {
                    root.classList.add("unrated");
                    root.style.setProperty("--dir-color", "#57534a");
                    if (!root.classList.contains("dragging")) {
                        puck.style.left = "50%";
                        puck.style.filter = "";
                        puck.style.opacity = "";
                    }
                    puck.style.setProperty("--puck-dy", "0px");
                    fill.style.width = "0%";
                    var parkX = inset + Math.max(40, stageW - inset * 2) / 2;
                    arm.style.left = parkX + "px";
                    bubble.style.left = parkX + "px";
                    bubble.style.top = (stageH / 2) + "px";
                    puck.setAttribute("aria-valuetext", "Unrated. Drag along the line to rate.");
                    vals.textContent = "Unrated";
                    return;
                }
                root.classList.remove("unrated");
                var lean = s.lean, app = s.app;
                var pct = sxCrossLeanToPct(lean);
                puck.style.left = pct + "%";
                fill.style.width = pct + "%";
                root.style.setProperty("--dir-color", sxCrossColor(app));
                puck.setAttribute("aria-valuetext", "Leaning " + Math.round(lean) + " of 100, appetite " + (app > 0 ? "+" : "") + Math.round(app));
                var puckX = inset + (pct / 100) * Math.max(40, stageW - inset * 2);
                arm.style.left = puckX + "px";
                if (!root.classList.contains("off-end")) {
                    puck.style.filter = "";
                    puck.style.opacity = "";
                }
                var dragging = root.classList.contains("dragging") && !root.classList.contains("off-end");
                var dy = dragging ? -app * (inner / 200) : 0;
                puck.style.setProperty("--puck-dy", dy + "px");
                bubble.innerHTML = (app > 0 ? "+" : "") + Math.round(app) +
                    " <small>" + (app > 25 ? "appetite" : app < -25 ? "aversion" : app === 0 ? "neutral" : app > 0 ? "appetite" : "aversion") + "</small>";
                bubble.style.left = puckX + "px";
                bubble.style.top = (stageH / 2 + dy) + "px";
                bubble.style.transform = puckX > stageW - 130 ? "translate(calc(-100% - 26px), -50%)" : "translate(26px, -50%)";
                if (root.classList.contains("off-end")) vals.textContent = "Release to unrate";
                else vals.innerHTML = "Leaning <b>" + Math.round(lean) + "</b> · Appetite <b class=\"" + (app < 0 ? "neg" : "") + "\">" + (app > 0 ? "+" : "") + Math.round(app) + "</b>";
            }

            var drag = null;
            function runPct(rect) { return (runoffW / rect.width) * 100; }
            function armInner() {
                var h = arm.clientHeight || 192;
                return Math.max(40, h - 32);
            }
            function start(e) {
                var rect = track.getBoundingClientRect();
                var cur = get();
                drag = {
                    id: e.pointerId,
                    startX: e.clientX,
                    startY: e.clientY,
                    startApp: cur ? cur.app : 0,
                    wasUnrated: !cur,
                    offEnd: false,
                    rect: rect
                };
                root.classList.add("dragging");
                root.classList.remove("off-end");
                // Pointer capture is a convenience, never a load-bearing
                // wall: some engines throw or quietly drop it for touch.
                // The drag ALSO listens on window (capture phase) for the
                // whole gesture, so moves keep arriving and the release
                // ALWAYS reaches end() no matter what element the browser
                // retargets events to, at either end of the line.
                try { if (e.target && e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId); } catch (err) {}
                window.addEventListener("pointermove", move, true);
                window.addEventListener("pointerup", end, true);
                window.addEventListener("pointercancel", end, true);
                move(e);
                if (e.preventDefault) e.preventDefault();
            }
            function move(e) {
                if (!drag || e.pointerId !== drag.id) return;
                var rect = drag.rect;
                var rawPct = ((e.clientX - rect.left) / rect.width) * 100;
                var app = sxCrossClamp(drag.startApp + (drag.startY - e.clientY) * (200 / armInner()), -100, 100);
                var rp = runPct(rect);
                if (drag.wasUnrated) {
                    // The unrated puck rests ON the line at its centre, so
                    // a mere grab must not rate it: nothing happens until
                    // the finger has actually moved a few px. Then dragging
                    // it anywhere along the line rates it; in the run-off
                    // it stays unrated, following the finger so the drag
                    // can be felt the whole way.
                    if (Math.abs(e.clientX - drag.startX) < 4 && Math.abs(e.clientY - drag.startY) < 4) return;
                    if (rawPct >= 0 && rawPct <= 100) {
                        drag.wasUnrated = false;
                        onChange({ lean: sxCrossPctToLean(rawPct), app: Math.round(app) });
                    } else {
                        puck.style.left = sxCrossClamp(rawPct, -rp, 100 + rp) + "%";
                        puck.style.setProperty("--puck-dy", "0px");
                    }
                    render();
                    return;
                }
                if (rawPct < 0 || rawPct > 100) {
                    // In the run-off: preview only -- nothing is committed
                    // until release, and dragging back on cancels it. The
                    // puck VISIBLY travels the faded extension from the
                    // moment it crosses the end cap, greying out
                    // progressively the further into the run-off it goes.
                    if (!drag.offEnd) { drag.offEnd = true; root.classList.add("off-end"); }
                    var over = rawPct < 0 ? -rawPct : rawPct - 100;
                    var t = sxCrossClamp(over / rp, 0, 1);
                    puck.style.left = sxCrossClamp(rawPct, -rp, 100 + rp) + "%";
                    puck.style.filter = "grayscale(" + t + ")";
                    puck.style.opacity = String(1 - 0.55 * t);
                    puck.style.setProperty("--puck-dy", (-app * (armInner() / 200)) + "px");
                    arm.style.left = (inset + (sxCrossClamp(rawPct, -rp, 100 + rp) / 100) * rect.width) + "px";
                    vals.textContent = "Release to unrate";
                    return;
                }
                if (drag.offEnd) {
                    drag.offEnd = false;
                    root.classList.remove("off-end");
                    puck.style.filter = "";
                    puck.style.opacity = "";
                }
                onChange({ lean: sxCrossPctToLean(rawPct), app: Math.round(app) });
                render();
            }
            function end(e) {
                if (!drag || (e && e.pointerId !== undefined && e.pointerId !== drag.id)) return;
                var wasOffEnd = drag.offEnd;
                drag = null;
                window.removeEventListener("pointermove", move, true);
                window.removeEventListener("pointerup", end, true);
                window.removeEventListener("pointercancel", end, true);
                root.classList.remove("dragging");
                root.classList.remove("off-end");
                puck.style.filter = "";
                puck.style.opacity = "";
                // The app's slide-off, preserved: releasing off the end
                // of the line clears this flank to unrated.
                if (wasOffEnd) onChange(null);
                render();
                onRelease(get());
            }
            puck.addEventListener("pointerdown", start);
            track.addEventListener("pointerdown", function (e) {
                if (e.target === puck || (puck.contains && puck.contains(e.target))) return;
                start(e);
            });
            puck.addEventListener("pointermove", move);
            track.addEventListener("pointermove", move);
            puck.addEventListener("pointerup", end);
            puck.addEventListener("pointercancel", end);
            track.addEventListener("pointerup", end);
            track.addEventListener("pointercancel", end);
            // If capture is lost without an up (engine quirk), treat it
            // as the release at wherever the puck currently sits.
            puck.addEventListener("lostpointercapture", function () {
                if (drag) end({ pointerId: drag.id });
            });
            // While a drag is live, stop the page scroll from taking the
            // gesture over (the takeover is what cancels a finger drag
            // mid-travel on engines without touch-action support).
            root.addEventListener("touchmove", function (e) {
                if (drag && e.preventDefault) e.preventDefault();
            }, { passive: false });

            puck.addEventListener("wheel", function (e) {
                if (e.preventDefault) e.preventDefault();
                if (e.stopPropagation) e.stopPropagation();
                var s = get();
                if (!s) return; // unrated: the wheel does not rate -- drag onto the line
                var step = (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 5);
                root.classList.add("dragging");
                onChange({ lean: s.lean, app: sxCrossClamp(Math.round(s.app + step), -100, 100) });
                render();
                clearTimeout(puck._wheelT);
                puck._wheelT = setTimeout(function () { root.classList.remove("dragging"); render(); onRelease(get()); }, 450);
            }, { passive: false });

            puck.addEventListener("keydown", function (e) {
                var s = get() || { lean: 0, app: 0 }; // arrows re-rate an unrated flank from mid-line
                var handled = true;
                if (e.key === "ArrowRight") s = { lean: sxCrossClamp(s.lean + 4, -100, 100), app: s.app };
                else if (e.key === "ArrowLeft") s = { lean: sxCrossClamp(s.lean - 4, -100, 100), app: s.app };
                else if (e.key === "ArrowUp") { s = { lean: s.lean, app: sxCrossClamp(s.app + 4, -100, 100) }; root.classList.add("dragging"); }
                else if (e.key === "ArrowDown") { s = { lean: s.lean, app: sxCrossClamp(s.app - 4, -100, 100) }; root.classList.add("dragging"); }
                else handled = false;
                if (handled) {
                    if (e.preventDefault) e.preventDefault();
                    onChange({ lean: Math.round(s.lean), app: Math.round(s.app) });
                    render();
                    clearTimeout(puck._keyT);
                    puck._keyT = setTimeout(function () { root.classList.remove("dragging"); render(); onRelease(get()); }, 600);
                }
            });

            render();
            return {
                root: root,
                labelEl: labelEl,
                render: render,
                setLabel: function (name) {
                    label = name || label;
                    labelEl.textContent = label;
                    puck.setAttribute("aria-label", label + " leaning and appetite");
                }
            };
        }
