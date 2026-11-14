        // frozen baselines, reached by successive rescalings of the center
        // node (builds 2026-10-17_1446, 2026-10-17_2027, 2026-10-18_0343,
        // 2026-10-18_1449, 2026-10-19_0119): the photo disc and at-a-glance
        // rings were grown until the outer ring's edge sat ~3 units clear
        // of the nearest first-generation label anchor (lineStartRadius +
        // 105 = 1315.17); the gen-1 spoke starts were then moved onto the
        // ring's exterior edge (spokeStartRadius = glanceRadii[0] + ring
        // stroke / 2); and the rings were finally respaced to an exact
        // 44-unit radial pitch, tiling edge to edge, with the innermost
        // ring's inner edge unchanged (photoRadius + 5.73 clearance).
        // outerRadius / lineStartRadius never moved: they are the layout
        // and label anchors. The full build-by-build history is preserved
        // in the map-render refactor completion report (2026-10-25).
        const MAP_CENTER_X = 900, MAP_CENTER_Y = 620, BRANCH_TOGGLE_DROP = 184.06;
        const ea = {
            photoRadius: 897.58,
            glanceRadii: [ 1013.31, 969.31, 925.31 ],
            outerRadius: 1200,
            lineStartRadius: 1210.17,
            spokeStartRadius: 1035.31,
            branchToggleY: 1839.37
        };
        // Font-as-master-knob, part 3 (Build 2026-10-19_0948): the layout
        // parameter centerRingScale (Layout Editor "Center ring scale",
        // layout-centerRingScale hash param, default 1) rescales the
        // center node independently of fontScale. eaBase freezes the 1.0
        // values; refreshCenterRing() re-derives the live ea radii from
        // them on every render (called at the top of Mr() and once here),
        // so moving the slider rescales the node live with no reload and
        // at 1.0 every radius is exactly its pre-part-3 value. Scaled:
        // photoRadius (photo circle, clip, hit disc, name arc), the three
        // glanceRadii (at-a-glance rings), and spokeStartRadius (gen-1
        // spoke starts at the ring's outer edge). NOT scaled:
        // outerRadius/lineStartRadius (layout + label anchors).
        // FQ2-BAKEIN (A4): branchToggleY is no longer a fixed constant —
        // refreshCenterRing() derives it from the scaled ring (see below).
        const eaBase = {
            photoRadius: ea.photoRadius,
            glanceRadii: ea.glanceRadii.slice(),
            spokeStartRadius: ea.spokeStartRadius
        };
        function mapFontScale() {
            let layout = null;
            try { layout = mn; } catch (_) {}
            if (!layout && typeof window !== "undefined") layout = window.__SEXCAPADES_LAYOUT;
            const v = Number(layout && layout.fontScale);
            return Number.isFinite(v) && v > 0 ? v : 1;
        }
        function centerRingScale() {
            let layout = null;
            try { layout = mn; } catch (_) {}
            if (!layout && typeof window !== "undefined") layout = window.__SEXCAPADES_LAYOUT;
            const v = Number(layout && layout.centerRingScale);
            return Number.isFinite(v) && v > 0 ? v : 1;
        }
        // ICON DEPTH LAW (ruled 2026-11-02, Jason; SQUARE-ROOT
        // form — the owner adopted the same day's square-root
        // draft at 17:05, superseding the linear (0.6)^depth x R
        // law built earlier that day; the two-thirds base is
        // kept, as ruled; RADIUS reading ruled 13:38 the same
        // day — "I meant radius"): a node's icon RADIUS is
        // (2/3)^depth x sqrt(R x W) — the depth-scaled
        // geometric mean of R, the centre-disc radius
        // (ea.photoRadius = 897.58 x centerRingScale, set by
        // the Center circle slider; eaBase.photoRadius is the
        // fallback), and W, the ring width midlineStrokeWidth()
        // = 22 x mapFontScale() (the same width sxFontMaster()
        // reads as the font master F). Icons therefore grow
        // only as the square root when either slider rises,
        // instead of linearly with the centre alone. Depth 1 =
        // categories, depth 2 = subcategories AND kinks
        // hanging straight off a category, depth 3 = kinks
        // under a subcategory, imported children included. At
        // the baked defaults (fontScale 120, centre 90: R =
        // 80,782.20, W = 2,640, sqrt(RW) = 14,603.60) the depth
        // radii are 9,735.73 / 6,490.49 / 4,326.99 (diameters
        // double those). Sliders and tags scale by depth
        // exactly like the fonts (sxControlScale below — see
        // Ka / renderKinkLine control scales and sxSccBuild's
        // tagM); the icon ladder (2/3) and the font ladder
        // stay independent (font law since 2026-11-02 17:24:
        // sqrt(R x W) x (2/3)^(depth-1) for depths 1-3, glance
        // at W; the earlier (8/9)^depth font ladder is
        // superseded history). The pr.*Icon seeds remain
        // ONLY as solver estimate-space inputs and as the
        // slider-scale normalization (seed / 48); nothing
        // painted reads them for icon size any more.
        // ICON MINIMUM (ruled 2026-11-02 13:27, Jason): no
        // icon draws smaller than the current floor, and the
        // floor rises and falls with the FONT slider. No
        // single icon floor exists elsewhere in the code
        // (there is no 44px icon floor); the floor used here
        // is the one the spoke-trim helpers already enforce
        // — the 12-unit radius clamp in
        // SpokeGeometry.buildTipCircle (Math.max(12,
        // iconSize / 2)) and in renderKinkLine's leaf trim —
        // taken font-scaled, as ruled: minimum icon RADIUS =
        // 12 x mapFontScale() (1,440 world units at the baked
        // fontScale 120; minimum diameter 2,880). Under the
        // square-root law the floor binds nowhere at the baked
        // defaults — it binds only when the centre is small
        // or the font large.
        function sxIconRadius(depth) {
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.max(Math.pow(2 / 3, depth) * Math.sqrt(base * midlineStrokeWidth()), 12 * mapFontScale());
        }
        function sxIconDiameter(depth) {
            return 2 * sxIconRadius(depth);
        }
        // FONT DEPTH LADDER: the current law is the FONT LAW note
        // on sxFontSize below. Glance labels (depth 0) stay at the
        // slider basis W = 22 x mapFontScale(). Depths 1-3 use
        // sqrt(R x W), then x (2/3) per deeper level. The old
        // (8/9)^depth ladder is superseded and sizes nothing.
        // Baked defaults are text 120 and centre 90.
        function sxFontMaster() {
            return midlineStrokeWidth();
        }
        // FONT LAW (ruled 2026-11-02 17:24 CST, Jason; built
        // 2026-11-03, superseding the (8/9)^depth ladder above):
        // glance labels (depth 0) stay at the slider's basis
        // W = sxFontMaster() = 22 x mapFontScale(); depths 1-3
        // ride the square-root law the icons use, offset one
        // level: depth 1 (categories) = sqrt(R x W), depth 2
        // (subcategories AND kinks hanging straight off a
        // category) = (2/3) sqrt(R x W), depth 3 (kinks under
        // a subcategory) = (4/9) sqrt(R x W), where R is the
        // centre-disc radius from the same source sxIconRadius
        // reads (ea.photoRadius, eaBase.photoRadius fallback)
        // and W = midlineStrokeWidth(). The font helper shares
        // the sqrt(R x W) subexpression with sxIconRadius but
        // does NOT inherit the icon floor (12 x mapFontScale):
        // fonts are never floored. At the baked defaults
        // (fontScale 120, centre 90: W = 2,640, R = 80,782.20,
        // sqrt(RW) = 14,603.60) the sizes are glance 2,640,
        // depth 1 = 14,603.60, depth 2 = 9,735.73, depth 3 =
        // 6,490.49 — the category text is ~5.5 ring-widths,
        // LARGER than the at-a-glance rings (owner's ruling
        // 2026-11-03 01:18 CST). sxFontFactor stays the
        // dimensionless ratio sxFontSize(depth) / F so every
        // follower scaled by it (Ga widths, Ka controls,
        // strokes, tags) tracks the new law without rescaling.
        function sxFontSize(depth) {
            if (!(depth > 0)) return sxFontMaster();
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.pow(2 / 3, depth - 1) * Math.sqrt(base * midlineStrokeWidth());
        }
        function sxFontFactor(depth) {
            return sxFontSize(depth) / sxFontMaster();
        }
        function sxFontCoef(depth) {
            return 22 * sxFontFactor(depth);
        }
        // SLIDER / TAG + STROKE DEPTH LADDER (ruled 2026-11-02
        // 14:51 and 14:52, Jason): sliders and tags scale in the
        // same way as the fonts, by depth from the ring-width
        // font master — the plain font scale times
        // sxFontFactor(depth): since the 2026-11-02 17:24
        // font law the factor is sxFontSize(depth) / F —
        // depth 1 sqrt(R/W), then x (2/3) per level — so
        // sliders, tags and strokes follow the FONT sizes
        // (the historical (8/9)^depth factors, depth 1 8/9,
        // depth 2 64/81, depth 3 512/729, are superseded).
        // The spoke stroke widths follow too: a spoke at a
        // depth is stroked at sxStrokeWidth(depth) =
        // sxFontSize(depth),
        // and its outline and tapered-stem base widths scale by
        // the same factor, so a spoke's whole body thins with
        // its depth. sxControlScale keeps the historical
        // per-type seed normalization (seed / 48, clamped
        // .62–1.25) the Ka / renderKinkLine controls and
        // sxSccBuild's tagM have always used, and multiplies it
        // by the depth factor. Depths are the icon/font depths:
        // 1 = category spokes, 2 = subcategory spokes and
        // kinks hanging straight off a category, 3 = kinks
        // under a subcategory (imported children included).
        // NOT laddered: the centre glance rings (they are the
        // master), the fixed screen-px hit strokes and the
        // 44px tap geometry (CSS vars / sxRailPx caps stay as
        // they are; each control now also publishes its own
        // depth-scaled rail thickness as scoped CSS vars), and
        // the solver estimate-space allowances (rr.*), which
        // never painted.
        function sxControlScale(depth, seed) {
            return Math.max(.62, Math.min(1.25, (Number(seed) || 48) / 48)) * mapFontScale() * sxFontFactor(depth);
        }
        function sxStrokeWidth(depth) {
            return sxFontSize(depth);
        }
        // Canonical stroke at the current font scale (BAND-SHRINK,
        // ruled 2026-11-02, Jason: "the band shrinks to fit the
        // letters; the 44 shrinks to 22"): the ring
        // thickness the midline strokes (Ka, renderKinkLine),
        // Ga.outlineWidth / Ga.CLOUD_OUTLINE_WIDTH, and
        // refreshCenterRing's w all derive from. Ga.midlineWidth
        // and MIDLINE_SCALE are gone; this 22 x mapFontScale
        // stroke is the only midline width.
        function midlineStrokeWidth() {
            return 22 * mapFontScale();
        }
        function refreshCenterRing() {
            const s = centerRingScale();
            ea.photoRadius = eaBase.photoRadius * s;
            // Pitch = stroke (label-scale repair): the rings anchor to
            // the scaled disc (radius follows centerRingScale) but step
            // outward by exactly one ring thickness w, and w follows the
            // FONT scale — so the three bands tile edge to edge at every
            // combination of the two independent scales. (Previously the
            // radii scaled by s while the CSS stroke stayed a fixed 44,
            // opening gaps of 44*(s-1).) BAND-SHRINK (2026-11-02): w is
            // now 22 * font scale, so the bands tile edge to edge at
            // the new width and the s = 1 radii sit one half-stroke
            // closer to the disc than the frozen eaBase values (which
            // were struck at w = 44); eaBase stays the frozen
            // reference the clearance below was derived from.
            // GLANCE_INNER_CLEARANCE is the
            // frozen 1.0-baseline gap between the photo edge and the
            // innermost ring's inner edge: 925.31 - 44/2 - 897.58 = 5.73
            // (eaBase.glanceRadii[2], base stroke 44, eaBase.photoRadius).
            // At s = 1 and w = 44 this reproduced the eaBase values
            // exactly: glanceRadii [1013.31, 969.31, 925.31] and
            // spokeStartRadius 1035.31 (the outer ring's outer edge,
            // 1013.31 + 44/2). Since the band shrink (w = 22 at font
            // scale 1) the same formulas give [958.31, 936.31, 914.31]
            // and spokeStartRadius 969.31 — pitch = w preserved.
            // eaBase.glanceRadii stays the frozen 1.0 reference. The stroke itself is published as the
            // --glance-ring-width CSS variable, consumed by the
            // .center-glance-ring-track/-value/-hit rules so the track,
            // value, and hit strokes all equal w on every render.
            // Derived values are rounded to 2 decimals (the precision of
            // every eaBase value) so the s = 1 / w = 44 baseline is
            // byte-exact, with no floating-point dust in the emitted radii.
            const GLANCE_INNER_CLEARANCE = 5.73, w = midlineStrokeWidth(), innerEdge = ea.photoRadius + GLANCE_INNER_CLEARANCE, r2 = v => Math.round(v * 100) / 100;
            ea.glanceRadii = [ r2(innerEdge + 5 * w / 2), r2(innerEdge + 3 * w / 2), r2(innerEdge + w / 2) ];
            ea.spokeStartRadius = r2(innerEdge + 3 * w);
            document.documentElement.style.setProperty("--glance-ring-width", String(w));
            // FQ2-BAKEIN (A4, position driver): the center "+N branches"
            // toggle follows the center ring. At scale 1 its fixed Y
            // (1839.37) sat 184.06 world units below the outer ring's
            // outer edge (ring bottom 620 + 1035.31 = 1655.31). Deriving
            // Y as centerY + scaled spokeStartRadius + 184.06 preserves
            // that exact offset at every centerRingScale.
            ea.branchToggleY = MAP_CENTER_Y + ea.spokeStartRadius + BRANCH_TOGGLE_DROP;
        }
        refreshCenterRing();
        // Gen-1 spoke base circle radius: the base disc IS the center ring
        // (each category spoke's base arc hugs the ring's outer edge), so
        // the base radius derives directly from the scaled ring radius —
        // no separate control. The per-spoke base WIDTH is set in
        // Za.categoryTaperBaseWidth: TAPER_BASE_FRACTION (0.78) of the
        // chord 2R sin(π/18), the 18-slot equispaced pitch at the ring's
        // outer edge R (slot arc length 2πR/18), CAPPED at the tuned-era
        // value (TAPER_BASE_CAP, the R = 300 chord — TAPER-BASE
        // RE-ANCHOR, 2026-11-02) so bases no longer grow with the ring;
        // the cap only ever shrinks the chord term, so bases always
        // keep a margin from their neighbours.
        function gen1SpokeBaseRadius() {
            return ea.spokeStartRadius;
        }
