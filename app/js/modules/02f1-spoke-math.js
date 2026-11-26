        /* ================= SpokeGeometry module — BEGIN ================= */
        /* ================================================================
           SpokeGeometry — spoke path geometry for the map renderer.
           (Refactor Step 3, Build 2026-10-18_0804: extracted from the Ga
           namespace, where taperedPath / flankPaths previously lived as
           methods. Ga.taperedPath and Ga.flankPaths remain as one-line
           delegates so any other caller keeps working; new code should
           call SpokeGeometry directly. Behavior is byte-identical to the
           pre-refactor Ga implementations — see the differential
           path-string test recorded in the build comment in index.html.)

           A "spoke" is the tapered band drawn from a parent node (the
           center node or a subcategory hub) out to a child node's icon.
           Two shapes are built here:

           - taperedPath: one filled band with a single color.
           - flankPaths: two filled bands ("flanks"), one per side of the
             centerline, so give and receive can carry different colors.

           Both shapes can hug two circles with concave arcs:

           - Tip circle (wraps the CHILD icon): when a valid tip circle
             is supplied, the flat tip edge is replaced by an arc that
             follows the icon's circumference. The two tip corners are
             projected radially onto the circle (corner -> ray from the
             circle center -> point at distance r), and the SVG arc is
             drawn between the projections with large-arc = 0. The sweep
             flag is chosen from the sign of the cross product of the two
             corner vectors (taken from the circle center), which selects
             the arc on the spoke-facing side of the circle — the short
             way around the back of the icon — never the arc that would
             cut through the icon disc.

           - Base circle (wraps the PARENT disc): symmetric trick at the
             other end. The base corners are projected radially onto the
             parent disc and joined by an arc along its circumference
             (same cross-product sweep rule), so the band's base follows
             the disc edge instead of cutting a flat chord across it.
             A base circle is ignored when the segment starts deep
             inside it (start within 0.5 * r of the disc center): those
             are center-drawn segments whose base is meant to stay
             buried under the parent node.

           All coordinates and lengths are in map units (SVG user units
           of the map viewBox). Widths are FULL widths: a corner is
           offset width / 2 to either side of the centerline.
           ================================================================ */
        const SpokeGeometry = (() => {
            /** Polyline samples per flank edge (matches the old Ga.SAMPLES). */
            const SAMPLES = 12;
            /** Flare falloff rate: flank width decays exponentially from base width to tip width along the spoke (matches the old Ga.FLARE_DECAY). */
            const FLARE_DECAY = 1;
            /** Narrow-tip cap: radius (map units) of the convex semicircular cap a near-zero-width tip earns. */
            const NARROW_TIP_CAP_RADIUS = 24;
            /** Narrow-tip cap: a narrow tip earns its cap only when the segment is longer than this (map units). */
            const NARROW_TIP_MIN_LENGTH = 25;
            /** Deep-start threshold: a base/tip disc is ignored when the segment starts closer than this fraction of the disc radius to its center. */
            const DEEP_START_FRACTION = 0.5;
            /**
             * Describe the straight segment from (x0, y0) to (x1, y1).
             * @param {number} x0 - Start x, map units.
             * @param {number} y0 - Start y, map units.
             * @param {number} x1 - End x, map units.
             * @param {number} y1 - End y, map units.
             * @returns {{x0:number, y0:number, x1:number, y1:number, dx:number, dy:number, len:number, ux:number, uy:number, nx:number, ny:number}}
             *   dx/dy = end - start; len = segment length (1 when degenerate);
             *   (ux, uy) = unit direction; (nx, ny) = unit normal (-uy, ux).
             */
            function segment(x0, y0, x1, y1) {
                const a = x1 - x0, r = y1 - y0, o = Math.hypot(a, r) || 1, s = a / o, l = r / o;
                return {
                    x0: x0,
                    y0: y0,
                    x1: x1,
                    y1: y1,
                    dx: a,
                    dy: r,
                    len: o,
                    ux: s,
                    uy: l,
                    nx: -l,
                    ny: s
                };
            }
            /**
             * Parse a spoke centerline path string of the form "M x0 y0 L x1 y1".
             * @param {string} d - SVG path data for the centerline.
             * @returns {object|null} A segment() descriptor, or null when the
             *   string does not match the expected M/L shape.
             */
            function parseSegment(d) {
                const t = String(d || "").match(/M\s*([\d.-]+)\s+([\d.-]+)\s+L\s*([\d.-]+)\s+([\d.-]+)/);
                return t ? segment(parseFloat(t[1]), parseFloat(t[2]), parseFloat(t[3]), parseFloat(t[4])) : null;
            }
            /**
             * Flank width at a fractional position along the spoke.
             * Along the node name (fraction <= nameFrac): maintains bulbous shoulder width.
             * After the node name (fraction > nameFrac): tapers exponentially toward the tip
             * width according to the prior exponential falloff.
             * @param {number} u - Fraction along the spoke: 0 at base, 1 at tip (unitless).
             * @param {number} baseWidth - Full width at the base, map units.
             * @param {number} tipWidth - Full width approached at the tip, map units.
             * @param {number} [nameFrac=0.35] - Fraction of spoke length covered by the node name.
             * @returns {number} Full width at u, map units.
             */
            function flareAt(u, baseWidth, tipWidth, nameFrac = 0.35) {
                const uName = Math.max(0.15, Math.min(0.65, Number(nameFrac) || 0.35));
                if (u <= uName) {
                    const shape = Math.exp(-Math.pow(u / 0.72, 2));
                    return tipWidth + (baseWidth - tipWidth) * shape;
                }
                const wAtName = tipWidth + (baseWidth - tipWidth) * Math.exp(-Math.pow(uName / 0.72, 2));
                const uPost = (u - uName) / (1 - uName);
                return tipWidth + (wAtName - tipWidth) * Math.exp(-2.4 * uPost);
            }
            /**
             * Build the tip circle for a spoke: the circle of the CHILD icon
             * that the spoke's tip arc hugs.
             *
             * Callers pass the spoke's drawn endpoint (x1, y1), which stops
             * (r - 1.5) map units short of the icon's center along the spoke
             * direction. This helper reconstructs the icon center by pushing
             * the endpoint that same distance further along the unit spoke
             * direction, so the returned circle IS the icon disc: its near
             * edge sits 1.5 units behind the drawn endpoint and the tip arc
             * wraps the icon's back edge.
             * @param {number} x0 - Spoke base x, map units.
             * @param {number} y0 - Spoke base y, map units.
             * @param {number} x1 - Spoke drawn endpoint (tip) x, map units.
             * @param {number} y1 - Spoke drawn endpoint (tip) y, map units.
             * @param {number} [iconSize] - Icon diameter, map units. Falsy or
             *   non-numeric values fall back to 48. The radius is clamped to
             *   at least 12.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildTipCircle(x0, y0, x1, y1, iconSize) {
                const tipSeg = segment(x0, y0, x1, y1), tipR = Math.max(12, (Number(iconSize) || 48) / 2), tipBack = Math.max(0, tipR - 1.5);
                return {
                    x: x1 + tipSeg.ux * tipBack,
                    y: y1 + tipSeg.uy * tipBack,
                    r: tipR
                };
            }
            /**
             * Build a base circle for a spoke: the PARENT disc that the
             * spoke's base arc hugs (the center node's disc for category
             * spokes, or a subcategory hub's disc for imported-child
             * spokes). A plain {x, y, r} factory so call sites name the
             * intent instead of inlining an anonymous circle object.
             * @param {number} cx - Disc center x, map units.
             * @param {number} cy - Disc center y, map units.
             * @param {number} r - Disc radius, map units.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildBaseCircle(cx, cy, r) {
                return {
                    x: cx,
                    y: cy,
                    r: r
                };
            }
            /**
             * Build a single-color tapered spoke band as SVG path data.
             *
             * Outline order: start at one base corner, run to the same-side
             * tip corner, cross the tip, come back down the other side, and
             * cross the base (the Z close). Both crossings are replaceable
             * by concave circle arcs (see the module header):
             * - Tip: when tipCircle is a valid circle (r > 0), the path first steps
             *   from the tip corner to its radial projection on the tip
             *   circle, arcs along the circumference to the other corner's
             *   projection (sweep from the cross-product sign, spoke-facing
             *   side), and continues. With no valid circle the tip stays a
             *   flat edge between the two tip corners.
             * - Narrow tip: when tipWidth <= 0.5 and the segment is longer
             *   than NARROW_TIP_MIN_LENGTH (25 units), the tip instead gets
             *   a CONVEX semicircular cap of radius NARROW_TIP_CAP_RADIUS
             *   (24) around the endpoint (this branch wins over the
             *   tip-circle arc; it is how zero-width heat spokes round off).
             * - Base: when baseCircle is a valid disc and the segment does
             *   not start deep inside it (start at least
             *   DEEP_START_FRACTION * baseCircle.r from the disc center),
             *   the path starts and ends on the base corners' projections
             *   onto the disc and the closing edge is an arc along the
             *   disc; otherwise the base stays flat.
             * @param {string} pathData - Centerline path string "M x0 y0 L x1 y1", map units. Returned unchanged when unparseable.
             * @param {number} baseWidth - Base width, map units (corners offset +/- baseWidth/2 from the centerline).
             * @param {number} tipWidth - Tip width, map units (corners offset +/- tipWidth/2).
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon), from buildTipCircle. Null/invalid = flat tip.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base disc (parent), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @returns {string} SVG path data for the filled band.
             */
            function taperedPath(pathData, baseWidth, tipWidth, tipCircle = null, baseCircle = null) {
                const i = parseSegment(pathData);
                if (!i) return pathData;
                const {x0: a, y0: r, x1: o, y1: s, nx: l, ny: c} = i, d = r + c * baseWidth / 2, u = a - l * baseWidth / 2, p = r - c * baseWidth / 2, h = o - l * tipWidth / 2, g = s - c * tipWidth / 2, m = o + l * tipWidth / 2, f = s + c * tipWidth / 2;
                // Build 2026-10-18_0343: optional base disc (baseCircle) - the
                // flat base edge is replaced by an arc along the disc,
                // mirroring the tip arc: both base corners are projected onto
                // the disc and the path starts/ends on the projections, so
                // the band hugs the parent circle. Ignored for center-drawn
                // segments.
                const zbP = baseCircle && baseCircle.r > 0 && Math.hypot(a - baseCircle.x, r - baseCircle.y) >= DEEP_START_FRACTION * baseCircle.r ? function() {
                    const v1 = { x: a + l * baseWidth / 2 - baseCircle.x, y: d - baseCircle.y }, v2 = { x: u - baseCircle.x, y: p - baseCircle.y }, m1 = Math.hypot(v1.x, v1.y) || 1, m2 = Math.hypot(v2.x, v2.y) || 1, q1 = { x: baseCircle.x + baseCircle.r * v1.x / m1, y: baseCircle.y + baseCircle.r * v1.y / m1 }, q2 = { x: baseCircle.x + baseCircle.r * v2.x / m2, y: baseCircle.y + baseCircle.r * v2.y / m2 }, crx = v2.x * v1.y - v2.y * v1.x;
                    return { q1: q1, q2: q2, swp: crx >= 0 ? 1 : 0 };
                }() : null, bSX = zbP ? zbP.q1.x : a + l * baseWidth / 2, bSY = zbP ? zbP.q1.y : d, bTail = zbP ? ` L ${zbP.q2.x.toFixed(2)} ${zbP.q2.y.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${zbP.swp} ${zbP.q1.x.toFixed(2)} ${zbP.q1.y.toFixed(2)} Z` : ` L ${u.toFixed(2)} ${p.toFixed(2)} Z`;
                if (tipWidth <= .5) {
                    const dx = o - a, dy = s - r, L = Math.hypot(dx, dy);
                    if (L > NARROW_TIP_MIN_LENGTH) {
                        const R = NARROW_TIP_CAP_RADIUS, ux = dx / L, uy = dy / L, ex = o - ux * R, ey = s - uy * R, wE = (baseWidth + (tipWidth - baseWidth) * (L - R) / L) / 2, c1x = ex + l * wE, c1y = ey + c * wE, c2x = ex - l * wE, c2y = ey - c * wE, d1 = Math.hypot(c1x - o, c1y - s) || 1, d2 = Math.hypot(c2x - o, c2y - s) || 1, p1x = o + R * (c1x - o) / d1, p1y = s + R * (c1y - s) / d1, p2x = o + R * (c2x - o) / d2, p2y = s + R * (c2y - s) / d2, cross = (p1x - o) * (p2y - s) - (p1y - s) * (p2x - o), sweep = cross >= 0 ? 1 : 0;
                        return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${R} ${R} 0 0 ${sweep} ${p2x.toFixed(2)} ${p2y.toFixed(2)}${bTail}`;
                    }
                }
                if (tipCircle && tipCircle.r > 0) {
                    const sv = {
                        x: m - tipCircle.x,
                        y: f - tipCircle.y
                    }, ev = {
                        x: h - tipCircle.x,
                        y: g - tipCircle.y
                    }, sm2 = Math.hypot(sv.x, sv.y) || 1, em2 = Math.hypot(ev.x, ev.y) || 1, spx = tipCircle.x + tipCircle.r * sv.x / sm2, spy = tipCircle.y + tipCircle.r * sv.y / sm2, epx = tipCircle.x + tipCircle.r * ev.x / em2, epy = tipCircle.y + tipCircle.r * ev.y / em2, crx = sv.x * ev.y - sv.y * ev.x, swp = crx >= 0 ? 1 : 0;
                    return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${spx.toFixed(2)} ${spy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${swp} ${epx.toFixed(2)} ${epy.toFixed(2)}${bTail}`;
                }
                return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${h.toFixed(2)} ${g.toFixed(2)}${bTail}`;
            }
            /**
             * Build the split give/receive flank bands for one spoke, as SVG
             * path data. Each flank is one side of the spoke: an OUTER edge
             * that flares from the base width toward the tip width (see
             * flareAt, sampled at SAMPLES + 1 points) and an INNER edge at
             * the fixed inner half-width innerHalf, so the two flanks leave
             * the center stripe (half-width stripeHalf) uncovered for the
             * midline.
             *
             * Emission order — what "first" means in the mode string: the
             * mode names which EDGE POLYLINE IS EMITTED FIRST in each
             * flank's path string.
             * - "innerFirst" (branch spokes: category and subcategory
             *   spokes drawn by the Ka renderer): each flank starts with
             *   its INNER edge polyline running base -> tip, then the tip
             *   arc (inner offset innerHalf out to the flared tip offset),
             *   then the OUTER edge polyline reversed (tip -> base), then
             *   the base arc (flared base offset in to inner offset
             *   innerHalf).
             * - "outerFirst" (kink spokes drawn by renderKinkLine): each
             *   flank starts with its OUTER edge polyline running
             *   base -> tip, then the tip arc (flared tip offset in to
             *   inner offset innerHalf), then a freshly built INNER edge
             *   polyline running tip -> base, then the base arc (inner
             *   offset innerHalf out to the flared base offset).
             * The two modes trace the same outline in opposite orders with
             * the arc connections mirrored; which one a spoke uses is
             * fixed by its renderer and level, and both produce the same
             * filled region.
             *
             * Circle hugging (see the module header for the general
             * mechanics): the base circle baseCircle, when valid and the
             * segment does not start deep inside it (start at least
             * DEEP_START_FRACTION * baseCircle.r from its center), first
             * pulls all four base corner points
             * radially onto the disc so the flanks themselves start on
             * the disc edge, and the base crossing is emitted as an arc
             * along the disc by the b() helper (skipped when the two
             * offsets are effectively equal). The tip circle tipCircle likewise
             * turns each flank's tip crossing into an arc along the icon
             * circumference via the bE() helper. Both helpers project the
             * crossing's endpoints onto their circle and pick the sweep
             * flag from the cross-product sign, so the arc always runs
             * along the spoke-facing side of the circle.
             * @param {number} baseX - Base point x, map units.
             * @param {number} baseY - Base point y, map units.
             * @param {number} dx - Base->tip delta x, map units. Tip point = (baseX + dx, baseY + dy).
             * @param {number} dy - Base->tip delta y, map units.
             * @param {number} nx - Unit normal x, unitless. Corners are offset along (nx, ny).
             * @param {number} ny - Unit normal y, unitless.
             * @param {number} baseWidth - Base width, map units: the flare's starting full width.
             * @param {number} tipWidth - Tip width, map units: the flare's limiting full width.
             * @param {number} innerHalf - Inner half-width, map units: fixed offset of each flank's inner edge from the centerline.
             * @param {number} stripeHalf - Center stripe half-width, map units: the flared edge offset is max(innerHalf, stripeHalf + flare / 2) so a flank never crosses the midline stripe.
             * @param {string} mode - Mode: "innerFirst" (branch spokes) or "outerFirst" (kink spokes). Any other value takes the outerFirst branch.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base circle (parent disc), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon). Null/invalid = flat tip crossing.
             * @returns {{top: string, bottom: string}} SVG path data for the two flanks: "top" is the (nx, ny)-negative side, "bottom" the positive side.
             */
            /**
             * Build the split give/receive flank bands for one spoke, as SVG
             * path data. Each flank is one side of the spoke: an OUTER edge
             * that maintains a bulbous base along the node name, then tapers exponentially
             * toward the tip width; and an INNER edge that follows the new Gaussian curve
             * on the interior to the spoke, smoothly opening around the text at the base.
             *
             * @param {number} baseX - Base point x, map units.
             * @param {number} baseY - Base point y, map units.
             * @param {number} dx - Base->tip delta x, map units. Tip point = (baseX + dx, baseY + dy).
             * @param {number} dy - Base->tip delta y, map units.
             * @param {number} nx - Unit normal x, unitless. Corners are offset along (nx, ny).
             * @param {number} ny - Unit normal y, unitless.
             * @param {number} baseWidth - Base width, map units: the flare's starting full width.
             * @param {number} tipWidth - Tip width, map units: the flare's limiting full width.
             * @param {number} innerHalf - Inner half-width, map units: baseline offset of flank's inner edge from centerline.
             * @param {number} stripeHalf - Center stripe half-width, map units.
             * @param {string} mode - Mode: "innerFirst" (branch spokes) or "outerFirst" (kink spokes).
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base circle (parent disc), from buildBaseCircle.
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon).
             * @param {number} [nameLength=0] - Estimated rendered width of the node name along the spoke.
             * @returns {{top: string, bottom: string}} SVG path data for the two flanks.
             */
            function flankPaths(baseX, baseY, dx, dy, nx, ny, baseWidth, tipWidth, innerHalf, stripeHalf, mode, baseCircle = null, tipCircle = null, nameLength = 0) {
                const p = SAMPLES;
                const spokeLen = Math.hypot(dx, dy) || 1;
                const nameFrac = nameLength > 0 ? Math.max(0.15, Math.min(0.65, (nameLength + 14) / spokeLen)) : 0.35;
                const innerFlare = 3.5;
                const h = [], g = [], m = [], f = [];
                for (let si = 0; si <= p; si++) {
                    const frac = si / p;
                    const curInner = innerHalf + innerFlare * Math.exp(-Math.pow(frac / 0.72, 2));
                    const outerW = flareAt(frac, baseWidth, tipWidth, nameFrac);
                    const y = Math.max(curInner + 1.5, stripeHalf + outerW / 2);
                    const b = baseX + dx * frac, v = baseY + dy * frac;
                    h.push(`${(b - nx * y).toFixed(2)} ${(v - ny * y).toFixed(2)}`);
                    g.push(`${(b - nx * curInner).toFixed(2)} ${(v - ny * curInner).toFixed(2)}`);
                    m.push(`${(b + nx * y).toFixed(2)} ${(v + ny * y).toFixed(2)}`);
                    f.push(`${(b + nx * curInner).toFixed(2)} ${(v + ny * curInner).toFixed(2)}`);
                }
                baseCircle && baseCircle.r > 0 && Math.hypot(baseX - baseCircle.x, baseY - baseCircle.y) < DEEP_START_FRACTION * baseCircle.r && (baseCircle = null);
                const curInner0 = innerHalf + innerFlare;
                const curInner1 = innerHalf + innerFlare * Math.exp(-Math.pow(1 / 0.72, 2));
                const y0 = Math.max(curInner0 + 1.5, stripeHalf + flareAt(0, baseWidth, tipWidth, nameFrac) / 2);
                const yE = Math.max(curInner1 + 1.5, stripeHalf + flareAt(1, baseWidth, tipWidth, nameFrac) / 2);
                if (baseCircle && baseCircle.r > 0) {
                    const pj = (e2, t2) => {
                        const n2 = e2 - baseCircle.x, i2 = t2 - baseCircle.y, a2 = Math.hypot(n2, i2) || 1;
                        return `${(baseCircle.x + baseCircle.r * n2 / a2).toFixed(2)} ${(baseCircle.y + baseCircle.r * i2 / a2).toFixed(2)}`;
                    };
                    h[0] = pj(baseX - nx * y0, baseY - ny * y0);
                    g[0] = pj(baseX - nx * curInner0, baseY - ny * curInner0);
                    m[0] = pj(baseX + nx * y0, baseY + ny * y0);
                    f[0] = pj(baseX + nx * curInner0, baseY + ny * curInner0);
                }
                const b = (side, startOff, endOff) => {
                    if (!baseCircle || !(baseCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + side * nx * startOff - baseCircle.x, y: baseY + side * ny * startOff - baseCircle.y};
                    const end = {x: baseX + side * nx * endOff - baseCircle.x, y: baseY + side * ny * endOff - baseCircle.y};
                    const sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1;
                    const sx = baseCircle.x + baseCircle.r * start.x / sm, sy = baseCircle.y + baseCircle.r * start.y / sm;
                    const ex = baseCircle.x + baseCircle.r * end.x / em, ey = baseCircle.y + baseCircle.r * end.y / em;
                    const cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                const bE = (side, startOff, endOff) => {
                    if (!tipCircle || !(tipCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + dx + side * nx * startOff - tipCircle.x, y: baseY + dy + side * ny * startOff - tipCircle.y};
                    const end = {x: baseX + dx + side * nx * endOff - tipCircle.x, y: baseY + dy + side * ny * endOff - tipCircle.y};
                    const sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1;
                    const sx = tipCircle.x + tipCircle.r * start.x / sm, sy = tipCircle.y + tipCircle.r * start.y / sm;
                    const ex = tipCircle.x + tipCircle.r * end.x / em, ey = tipCircle.y + tipCircle.r * end.y / em;
                    const cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                if ("innerFirst" === mode) return {
                    top: `M ${g.join(" L ")}${bE(-1, curInner1, yE)} L ${h.slice().reverse().join(" L ")}${b(-1, y0, curInner0)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, curInner1)} L ${f.slice().reverse().join(" L ")}${b(1, curInner0, y0)} Z`
                };
                const v = [], w = [];
                for (let si = p; si >= 0; si--) {
                    const frac = si / p;
                    const curInner = innerHalf + innerFlare * Math.exp(-Math.pow(frac / 0.72, 2));
                    const px = baseX + dx * frac, py = baseY + dy * frac;
                    v.push(`${(px - nx * curInner).toFixed(2)} ${(py - ny * curInner).toFixed(2)}`);
                    w.push(`${(px + nx * curInner).toFixed(2)} ${(py + ny * curInner).toFixed(2)}`);
                }
                baseCircle && baseCircle.r > 0 && (v[v.length - 1] = g[0], w[w.length - 1] = f[0]);
                return {
                    top: `M ${h.join(" L ")}${bE(-1, yE, curInner1)} L ${v.join(" L ")}${b(-1, curInner0, y0)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, curInner1)} L ${w.join(" L ")}${b(1, curInner0, y0)} Z`
                };
            }
            /**
             * Numeric unit tests for the circle-hugging geometry. Runnable
             * in the browser console / probe harness via
             * SpokeGeometry.runGeometryTests(), or in node by extracting this
             * module (between its BEGIN/END delimiters) and calling the
             * same function. Verifies, for both taperedPath and
             * flankPaths (innerFirst and outerFirst):
             * - every arc endpoint lies ON its circle (distance from the
             *   circle center == r, within rounding epsilon);
             * - concavity: a tip arc's midpoint sits BEHIND its chord
             *   midpoint (toward the spoke base), and a base arc's
             *   midpoint sits beyond its chord midpoint (toward the spoke
             *   tip) — i.e. each arc bows around its circle, not across it;
             * - the sweep flag routes the arc through that spoke-facing
             *   midpoint (the minor arc on the circle's spoke side), not
             *   through the through-icon antipode.
             * @returns {{passed:number, failed:number, failures:string[]}} Test tally; failures names each failed check.
             */
            function runGeometryTests() {
                const EPS = .025;
                let passed = 0;
                const failures = [];
                const check = (name, cond) => { cond ? passed++ : failures.push(name); };
                const distTo = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);
                const arcsOf = d => {
                    const out = [], re = /([ML])\s*([\d.-]+)\s+([\d.-]+)|A\s+([\d.]+)\s+[\d.]+\s+0\s+0\s+([01])\s+([\d.-]+)\s+([\d.-]+)/g;
                    let m, cur = null;
                    while ((m = re.exec(d))) {
                        if (m[1]) cur = { x: +m[2], y: +m[3] };
                        else if (cur) out.push({ r: +m[4], sweep: +m[5], x1: cur.x, y1: cur.y, x2: +m[6], y2: +m[7] }), cur = { x: +m[6], y: +m[7] };
                    }
                    return out;
                };
                const arcMid = (arc, c) => {
                    const a1 = Math.atan2(arc.y1 - c.y, arc.x1 - c.x), a2 = Math.atan2(arc.y2 - c.y, arc.x2 - c.x);
                    let sx = Math.cos(a1) + Math.cos(a2), sy = Math.sin(a1) + Math.sin(a2);
                    const m = Math.hypot(sx, sy) || 1;
                    return { x: c.x + c.r * sx / m, y: c.y + c.r * sy / m, a1: a1, a2: a2, amid: Math.atan2(sy, sx) };
                };
                const onSweptArc = (a1, amid, a2, sweep) => {
                    const TAU = Math.PI * 2, norm = x => ((x % TAU) + TAU) % TAU;
                    return sweep === 1 ? norm(amid - a1) <= norm(a2 - a1) + 1e-9 : norm(a1 - amid) <= norm(a1 - a2) + 1e-9;
                };
                const checkArc = (label, arc, circle, towardBase) => {
                    check(label + ": arc radius matches circle", Math.abs(arc.r - circle.r) < .01);
                    check(label + ": start point on circle", Math.abs(distTo(arc.x1, arc.y1, circle.x, circle.y) - circle.r) < EPS);
                    check(label + ": end point on circle", Math.abs(distTo(arc.x2, arc.y2, circle.x, circle.y) - circle.r) < EPS);
                    const mid = arcMid(arc, circle), chordX = (arc.x1 + arc.x2) / 2;
                    check(label + (towardBase ? ": arc midpoint behind chord (toward base)" : ": arc midpoint beyond chord (toward tip)"), towardBase ? mid.x < chordX - .05 : mid.x > chordX + .05);
                    check(label + ": sweep routes through spoke-facing midpoint", onSweptArc(mid.a1, mid.amid, mid.a2, arc.sweep));
                };
                // buildTipCircle / buildBaseCircle construction.
                const tc = buildTipCircle(0, 0, 100, 0, 48);
                check("buildTipCircle: radius is iconSize / 2", tc.r === 24);
                check("buildTipCircle: center is endpoint + unit * r", Math.abs(tc.x - 124) < 1e-9 && Math.abs(tc.y) < 1e-9);
                const tcDefault = buildTipCircle(0, 0, 0, 50);
                check("buildTipCircle: default icon size 48", tcDefault.r === 24 && Math.abs(tcDefault.x) < 1e-9 && Math.abs(tcDefault.y - 74) < 1e-9);
                const tcMin = buildTipCircle(0, 0, 10, 0, 10);
                check("buildTipCircle: radius clamps to >= 12", tcMin.r === 12 && Math.abs(tcMin.x - 22) < 1e-9);
                const bc0 = buildBaseCircle(3, 4, 30);
                check("buildBaseCircle: passes {x, y, r} through", bc0.x === 3 && bc0.y === 4 && bc0.r === 30);
                // taperedPath tip arc (horizontal spoke, tip circle from buildTipCircle).
                const dTip = taperedPath("M 0 0 L 100 0", 20, 20, tc, null), aTip = arcsOf(dTip);
                check("taperedPath tip: exactly one arc", aTip.length === 1);
                aTip.length && checkArc("taperedPath tip", aTip[0], tc, !0);
                // taperedPath base arc (segment starts outside the disc).
                const bcBig = buildBaseCircle(0, 0, 30), dBase = taperedPath("M 40 0 L 140 0", 20, 10, null, bcBig), aBase = arcsOf(dBase);
                check("taperedPath base: exactly one arc", aBase.length === 1);
                aBase.length && checkArc("taperedPath base", aBase[0], bcBig, !1);
                // taperedPath guards: deep-inside base and no circles stay flat; invalid tip circle ignored.
                check("taperedPath base: center-drawn segment keeps flat base", !taperedPath("M 0 0 L 100 0", 20, 10, null, bcBig).includes(" A "));
                check("taperedPath: no circles means no arcs", !taperedPath("M 0 0 L 100 0", 20, 10).includes(" A "));
                check("taperedPath: r = 0 tip circle ignored", !taperedPath("M 0 0 L 100 0", 20, 10, { x: 100, y: 0, r: 0 }, null).includes(" A "));
                check("taperedPath: unparseable path returned unchanged", taperedPath("junk", 20, 10) === "junk");
                // taperedPath narrow-tip convex cap: arc of radius 24 around the endpoint.
                const aCap = arcsOf(taperedPath("M 0 0 L 100 0", 20, 0, null, null));
                check("taperedPath cap: exactly one arc of radius 24", aCap.length === 1 && aCap[0].r === 24);
                aCap.length && check("taperedPath cap: endpoints on the cap circle", Math.abs(distTo(aCap[0].x1, aCap[0].y1, 100, 0) - 24) < EPS && Math.abs(distTo(aCap[0].x2, aCap[0].y2, 100, 0) - 24) < EPS);
                // flankPaths: base disc off-center, tip circle offset past the tip point (as buildTipCircle returns).
                const fBase = buildBaseCircle(0, 0, 25), fTip = { x: 152.5, y: 0, r: 26 };
                const flankArgs = [ 30, 0, 100, 0, 0, 1, 60, 10, 5, 2 ];
                for (const mode of [ "innerFirst", "outerFirst" ]) {
                    const res = flankPaths(...flankArgs, mode, fBase, fTip), aTop = arcsOf(res.top), aBot = arcsOf(res.bottom);
                    check(`flankPaths ${mode}: two arcs per flank (tip + base)`, aTop.length === 2 && aBot.length === 2);
                    if (aTop.length === 2) {
                        checkArc(`flankPaths ${mode} top tip`, aTop[0], fTip, !0);
                        checkArc(`flankPaths ${mode} top base`, aTop[1], fBase, !1);
                    }
                    if (aBot.length === 2) {
                        checkArc(`flankPaths ${mode} bottom tip`, aBot[0], fTip, !0);
                        checkArc(`flankPaths ${mode} bottom base`, aBot[1], fBase, !1);
                    }
                    if (aTop.length && aBot.length) {
                        const mirrorPt = (ax, ay, bx, by) => Math.abs(ax - bx) < .011 && Math.abs(ay + by) < .011;
                        check(`flankPaths ${mode}: bottom tip arc mirrors top across the centerline`, (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x1, aTop[0].y1) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x2, aTop[0].y2)) || (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x2, aTop[0].y2) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x1, aTop[0].y1)));
                    }
                    const first = /^M ([\d.-]+) ([\d.-]+)/.exec(res.top);
                    check(`flankPaths ${mode}: first flank point projected onto base disc`, !!first && Math.abs(distTo(+first[1], +first[2], fBase.x, fBase.y) - fBase.r) < EPS);
                    const bare = flankPaths(...flankArgs, mode, null, null);
                    check(`flankPaths ${mode}: no circles means no arcs`, !bare.top.includes(" A ") && !bare.bottom.includes(" A "));
                }
                return { passed: passed, failed: failures.length, failures: failures };
            }
            const __sxTaperedPathCache = new Map();
            function cachedTaperedPath(pathData, baseWidth, tipWidth, tipCircle = null, baseCircle = null) {
                const key = `${pathData}|${baseWidth.toFixed(1)}|${tipWidth.toFixed(1)}|${tipCircle ? `${tipCircle.x.toFixed(1)},${tipCircle.y.toFixed(1)},${tipCircle.r.toFixed(1)}` : '0'}|${baseCircle ? `${baseCircle.x.toFixed(1)},${baseCircle.y.toFixed(1)},${baseCircle.r.toFixed(1)}` : '0'}`;
                let res = __sxTaperedPathCache.get(key);
                if (res !== undefined) return res;
                res = taperedPath(pathData, baseWidth, tipWidth, tipCircle, baseCircle);
                if (__sxTaperedPathCache.size > 2000) __sxTaperedPathCache.clear();
                __sxTaperedPathCache.set(key, res);
                return res;
            }

            return Object.freeze({
                SAMPLES: SAMPLES,
                FLARE_DECAY: FLARE_DECAY,
                segment: segment,
                parseSegment: parseSegment,
                flareAt: flareAt,
                buildTipCircle: buildTipCircle,
                buildBaseCircle: buildBaseCircle,
                taperedPath: cachedTaperedPath,
                flankPaths: flankPaths,
                runGeometryTests: runGeometryTests
            });
        })();
        window.SpokeGeometry = SpokeGeometry;
        /* ================= SpokeGeometry module — END ================= */
        // Hanky off the map (Jason, 2026-11-22): on the Sexcapades skin
        // the spoke midline wears the same neutral seam the vanilla skins
        // use; a topic's hanky code colors its placard instead (03e1).
        // True whenever the active skin is not a vanilla skin.
        const sxSexSkin = () => !(typeof window !== "undefined" && window.__SX_SKIN_PREFIX && "sex" !== window.__SX_SKIN_PREFIX);
        const Ga = Object.freeze({
            WIDTH: 18,
            TIP_FRACTION: 0,
            OUTLINE_EXTRA: 1.25,
            OUTLINE_COLOR: "#f5f5f5",
            CLOUD_OUTLINE_WIDTH: (e, depth) => Ga.outlineWidth(e, depth),
            NO_CODE_COLOR: "#78817e",
            FALLBACK_COLOR: "#646d66",
            parseSegment(e) {
                // Delegate: the implementation lives in SpokeGeometry.parseSegment (see the SpokeGeometry module above); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.parseSegment(e);
            },
            segment(e, t, n, i) {
                // Delegate: the implementation lives in SpokeGeometry.segment (same descriptor shape); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.segment(e, t, n, i);
            },
            trimToIcons(e, t, n, i, a, r) {
                const o = Ga.segment(e, t, n, i);
                if (o.len <= a + r) {
                    const mid = o.len / 2;
                    const aClamped = Math.min(a, mid * 0.95);
                    const rClamped = Math.min(r, mid * 0.95);
                    return {
                        seg: o,
                        sx0: e + o.ux * aClamped,
                        sy0: t + o.uy * aClamped,
                        sx1: n - o.ux * rClamped,
                        sy1: i - o.uy * rClamped
                    };
                }
                return {
                    seg: o,
                    sx0: e + o.ux * a,
                    sy0: t + o.uy * a,
                    sx1: n - o.ux * r,
                    sy1: i - o.uy * r
                };
            },
            // tipWidth has no SpokeGeometry counterpart (the module takes tip
            // widths as plain arguments); TIP_FRACTION is 0, so this is
            // always 0 - kept as the Ga-side width rule for heat spokes.
            tipWidth: e => e * Ga.TIP_FRACTION,
            flareAt: (e, t, n) => SpokeGeometry.flareAt(e, t, n),
            heatWidths(e, depth) {
                const t = Math.max(e + 8, 18) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3);
                return {
                    w0: t,
                    w1: .25 * t
                };
            },
            categoryBaseWidth: (e, t, n) => Za.categoryTaperBaseWidth(e, t, n),
            spokeBaseWidth: e => Math.max(54, 18 * e),
            railsBaseWidth: (e, t, n, i, depth) => (isCatId(e) ? Ga.categoryBaseWidth(t, n, i) : Ga.spokeBaseWidth(t)) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3),
            cloudBaseWidth(e, t) {
                const hubR = Math.max(36, (Number(e) || 48) / 2);
                return Math.max(48, Math.min(76, hubR * 1.25));
            },
            outlineWidth: (e, depth) => { const f = null == depth ? 1 : sxFontFactor(depth); return midlineStrokeWidth() * f + 16 * (mapFontScale() * f / 3); },
            // splitInnerHalf is half the outline width above, so a
            // future outline-width change cannot silently strand it.
            splitInnerHalf: (e, depth) => Ga.outlineWidth(e, depth) / 2,
            midlineOutlinePath: (e, t, n, depth) => n ? "" : `<path class="hanky-midline-outline" d="${e}" fill="none" stroke="${Ga.OUTLINE_COLOR}" stroke-width="${Ga.outlineWidth(t, depth)}" stroke-linecap="butt" opacity="0.9" pointer-events="none"/>`,
            dashAttr: e => ` stroke-dasharray="${e} ${.66 * e}"`,
            taperedPath(e, t, n, z = null, zb = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.taperedPath (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.taperedPath(e, t, n, z, zb);
            },
            flankPaths(e, t, n, i, a, r, o, s, l, c, d, u = null, z = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.flankPaths (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.flankPaths(e, t, n, i, a, r, o, s, l, c, d, u, z);
            }
        });
        // Selection marking - the single authority (map-render refactor,
        // finding 5). selectionMarkKind(spokeId, selectedId, record)
        // decides whether a spoke carries the .selected-spoke mark for a
        // selection, and where the mark lives:
        //   "own"    - the selected node's own spoke (and a selected
        //              topic's parent spoke): the mark lives in that
        //              spoke's node group.
        //   "branch" - the branch spoke (cat-<slug of record.branch>):
        //              the mark lives in the branch line-group underlay
        //              item (.spoke-underlay-item[data-spoke-for=...]).
        //   null     - no mark. A subcategory carries no mark of its own:
        //              its line is drawn by renderKinkLine, which stamps
        //              no highlight, so selecting a subcategory marks
        //              only its branch's line.
        // Ka consults this while rendering (it marks the spokes it
        // builds; the render's underlay pass then moves the branch
        // spoke's visuals, mark included, into the underlay item), and
        // applySelectionMarking consults the same function to reproduce
        // exactly that end state on the existing DOM without a
        // re-render. Selection semantics change HERE only.
        function selectionMarkKind(spokeId, selectedId, record) {
            if (!spokeId || !selectedId) return null;
            const branchCatId = record && record.branch ? catId(record.branch) : null;
            if (branchCatId && spokeId === branchCatId) return "branch";
            if (spokeId === selectedId) return record && "Subcategory" === record.kind ? null : "own";
            if (record && spokeId === record.parentId) return "own";
            return null;
        }
        const Qi = () => typeof window !== "undefined" && typeof window.Qi === "function" ? window.Qi() : false;
        const Vi = () => typeof window !== "undefined" && typeof window.Vi === "function" ? window.Vi() : null;
        const Xi = () => typeof window !== "undefined" && typeof window.Xi === "function" ? window.Xi() : [];
        const Ge = (e, t) => typeof window !== "undefined" && typeof window.Ge === "function" ? window.Ge(e, t) : null;
        const da = (e, t) => typeof window !== "undefined" && typeof window.da === "function" ? window.da(e, t) : null;
        const $a = (e, t, n) => typeof window !== "undefined" && typeof window.$a === "function" ? window.$a(e, t, n) : null;
        const Sa = (e, t, n, i) => typeof window !== "undefined" && typeof window.Sa === "function" ? window.Sa(e, t, n, i) : null;
        const ka = (e, t, n = "", i = {}) => typeof window !== "undefined" && typeof window.ka === "function" ? window.ka(e, t, n, i) : "";
        const Ua = (e) => typeof window !== "undefined" && typeof window.Ua === "function" ? window.Ua(e) : null;
        const Oa = (e, t) => typeof window !== "undefined" && typeof window.Oa === "function" ? window.Oa(e, t) : null;
        const ba = (e) => typeof window !== "undefined" && typeof window.ba === "function" ? window.ba(e) : "";
        const la = (e) => typeof window !== "undefined" && typeof window.la === "function" ? window.la(e) : "var(--line)";
        const zi = (e) => typeof window !== "undefined" && typeof window.zi === "function" ? window.zi(e) : "var(--line)";
        const qn = typeof window !== "undefined" && window.qn ? window.qn : {};
        const Xn = (e) => typeof window !== "undefined" && typeof window.Xn === "function" ? window.Xn(e) : null;
