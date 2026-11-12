    }();
});

/* HEADER-HUG boot seat (2026-11-02): the render-path hug (in the header-ring
   updater) only runs once a profile is loaded — the map render returns early
   in the no-profile state — so the no-profile header gets the same tightening
   from here. Same geometry, same fixed unit scale, geometry only; re-applied
   on load and resize and shortly after load so late font/layout shifts are
   caught. A failure leaves the stylesheet seat untouched. */
(function () {
    "use strict";
    function hug() {
        try {
            var svg = document.getElementById("headerHorizonRing");
            if (!svg || !svg.closest) return;
            var wrap = svg.closest(".guide-avatar-wrap");
            var img = wrap ? wrap.querySelector(".avatar-music-btn img") : null;
            if (!wrap || !img) return;
            wrap.style.removeProperty("width"), wrap.style.removeProperty("height"), wrap.style.removeProperty("flex-basis");
            var seat0 = wrap.getBoundingClientRect().width, imgPx = img.getBoundingClientRect().width;
            if (!(seat0 > 0 && imgPx > 0)) return;
            var scale = seat0 / 108, imgR = imgPx / 2 / scale, gap = 2, band = 4, innerR = imgR + gap + band / 2, outerR = innerR + band + gap, side = 2 * (outerR + band / 2 + gap);
            if (!(side > 0 && side < 108)) return;
            var r2 = function (v) { return Math.round(100 * v) / 100; };
            var tracks = svg.querySelectorAll(".horizon-ring-track"), hits = svg.querySelectorAll(".horizon-ring-hit"), ov = document.getElementById("headerHorizonValue"), iv = document.getElementById("headerPersonalValue");
            if (tracks[0]) tracks[0].setAttribute("r", String(r2(outerR)));
            if (ov) ov.setAttribute("r", String(r2(outerR)));
            if (tracks[1]) tracks[1].setAttribute("r", String(r2(innerR)));
            if (iv) iv.setAttribute("r", String(r2(innerR)));
            if (hits[0]) hits[0].setAttribute("r", String(r2(outerR)));
            if (hits[1]) hits[1].setAttribute("r", String(r2(innerR)));
            svg.setAttribute("viewBox", r2(54 - side / 2) + " " + r2(54 - side / 2) + " " + r2(side) + " " + r2(side));
            var px = r2(side * scale) + "px";
            wrap.style.width = px, wrap.style.height = px, wrap.style.flexBasis = px;
            var cap = document.getElementById("headerRingCaption");
            wrap.style.marginBottom = cap && cap.textContent && cap.textContent.trim() ? "" : "0px";
        } catch (err) { /* geometry only; a failure leaves the stylesheet seat untouched */ }
    }
    if ("loading" === document.readyState) document.addEventListener("DOMContentLoaded", hug); else hug();
    window.addEventListener("load", hug), window.addEventListener("resize", hug);
    setTimeout(hug, 300), setTimeout(hug, 1500);
})();
