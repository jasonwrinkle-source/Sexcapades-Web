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
             * Flank width at a fractional position along the spoke. The width
             * starts at the base width and decays exponentially toward the
             * tip width, so flanks flare wide at the base and settle fast.
             * @param {number} u - Fraction along the spoke: 0 at base, 1 at tip (unitless).
             * @param {number} baseWidth - Full width at the base, map units.
             * @param {number} tipWidth - Full width approached at the tip, map units.
             * @returns {number} Full width at u, map units.
             */
            function flareAt(u, baseWidth, tipWidth) {
                return tipWidth + (baseWidth - tipWidth) * Math.exp(-FLARE_DECAY * u);
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
                // Build 2026-10-18_0343: optional base disc (baseCircle) — the
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
            function flankPaths(baseX, baseY, dx, dy, nx, ny, baseWidth, tipWidth, innerHalf, stripeHalf, mode, baseCircle = null, tipCircle = null) {
                const p = SAMPLES, h = [], g = [], m = [], f = [];
                for (let si = 0; si <= p; si++) {
                    const frac = si / p, y = Math.max(innerHalf, stripeHalf + flareAt(frac, baseWidth, tipWidth) / 2), b = baseX + dx * frac, v = baseY + dy * frac;
                    h.push(`${(b - nx * y).toFixed(2)} ${(v - ny * y).toFixed(2)}`), g.push(`${(b - nx * innerHalf).toFixed(2)} ${(v - ny * innerHalf).toFixed(2)}`),
                    m.push(`${(b + nx * y).toFixed(2)} ${(v + ny * y).toFixed(2)}`), f.push(`${(b + nx * innerHalf).toFixed(2)} ${(v + ny * innerHalf).toFixed(2)}`);
                }
                // Build 2026-10-18_0343: spoke bases hug the parent disc. The
                // base-arc helper below only capped the base edge between the
                // corners' projections — the flank corners themselves stayed
                // outside the disc, joined by radial stubs that poked past
                // the circle. Now the four base corner points are projected
                // onto the base circle first, so the flanks themselves start
                // on the disc edge and the base follows the circle exactly.
                // A base circle is ignored when the segment starts deep
                // inside it (center-drawn segments keep the old flat base).
                baseCircle && baseCircle.r > 0 && Math.hypot(baseX - baseCircle.x, baseY - baseCircle.y) < DEEP_START_FRACTION * baseCircle.r && (baseCircle = null);
                if (baseCircle && baseCircle.r > 0) {
                    const pj = (e2, t2) => {
                        const n2 = e2 - baseCircle.x, i2 = t2 - baseCircle.y, a2 = Math.hypot(n2, i2) || 1;
                        return `${(baseCircle.x + baseCircle.r * n2 / a2).toFixed(2)} ${(baseCircle.y + baseCircle.r * i2 / a2).toFixed(2)}`;
                    }, y0 = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2);
                    h[0] = pj(baseX - nx * y0, baseY - ny * y0), g[0] = pj(baseX - nx * innerHalf, baseY - ny * innerHalf), m[0] = pj(baseX + nx * y0, baseY + ny * y0), f[0] = pj(baseX + nx * innerHalf, baseY + ny * innerHalf);
                }
                const y = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2), b = (side, startOff, endOff) => {
                    if (!baseCircle || !(baseCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + side * nx * startOff - baseCircle.x, y: baseY + side * ny * startOff - baseCircle.y}, end = {x: baseX + side * nx * endOff - baseCircle.x, y: baseY + side * ny * endOff - baseCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = baseCircle.x + baseCircle.r * start.x / sm, sy = baseCircle.y + baseCircle.r * start.y / sm, ex = baseCircle.x + baseCircle.r * end.x / em, ey = baseCircle.y + baseCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                const yE = Math.max(innerHalf, stripeHalf + flareAt(1, baseWidth, tipWidth) / 2), bE = (side, startOff, endOff) => {
                    if (!tipCircle || !(tipCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + dx + side * nx * startOff - tipCircle.x, y: baseY + dy + side * ny * startOff - tipCircle.y}, end = {x: baseX + dx + side * nx * endOff - tipCircle.x, y: baseY + dy + side * ny * endOff - tipCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = tipCircle.x + tipCircle.r * start.x / sm, sy = tipCircle.y + tipCircle.r * start.y / sm, ex = tipCircle.x + tipCircle.r * end.x / em, ey = tipCircle.y + tipCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                if ("innerFirst" === mode) return {
                    top: `M ${g.join(" L ")}${bE(-1, innerHalf, yE)} L ${h.slice().reverse().join(" L ")}${b(-1, y, innerHalf)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${f.slice().reverse().join(" L ")}${b(1, innerHalf, y)} Z`
                };
                const v = [], w = [];
                for (let si = p; si >= 0; si--) {
                    const px = baseX + dx * (si / p), py = baseY + dy * (si / p);
                    v.push(`${(px - nx * innerHalf).toFixed(2)} ${(py - ny * innerHalf).toFixed(2)}`), w.push(`${(px + nx * innerHalf).toFixed(2)} ${(py + ny * innerHalf).toFixed(2)}`);
                }
                baseCircle && baseCircle.r > 0 && (v[v.length - 1] = g[0], w[w.length - 1] = f[0]);
                return {
                    top: `M ${h.join(" L ")}${bE(-1, yE, innerHalf)} L ${v.join(" L ")}${b(-1, innerHalf, y)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${w.join(" L ")}${b(1, innerHalf, y)} Z`
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
                check("buildTipCircle: center is endpoint + unit * (r - 1.5)", Math.abs(tc.x - 122.5) < 1e-9 && Math.abs(tc.y) < 1e-9);
                const tcDefault = buildTipCircle(0, 0, 0, 50);
                check("buildTipCircle: default icon size 48", tcDefault.r === 24 && Math.abs(tcDefault.x) < 1e-9 && Math.abs(tcDefault.y - 72.5) < 1e-9);
                const tcMin = buildTipCircle(0, 0, 10, 0, 10);
                check("buildTipCircle: radius clamps to >= 12", tcMin.r === 12 && Math.abs(tcMin.x - 20.5) < 1e-9);
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
            return Object.freeze({
                SAMPLES: SAMPLES,
                FLARE_DECAY: FLARE_DECAY,
                segment: segment,
                parseSegment: parseSegment,
                flareAt: flareAt,
                buildTipCircle: buildTipCircle,
                buildBaseCircle: buildBaseCircle,
                taperedPath: taperedPath,
                flankPaths: flankPaths,
                runGeometryTests: runGeometryTests
            });
        })();
        window.SpokeGeometry = SpokeGeometry;
        /* ================= SpokeGeometry module — END ================= */
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
            // always 0 — kept as the Ga-side width rule for heat spokes.
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
            spokeBaseWidth: e => 5 * e,
            railsBaseWidth: (e, t, n, i, depth) => (isCatId(e) ? Ga.categoryBaseWidth(t, n, i) : Ga.spokeBaseWidth(t)) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3),
            cloudBaseWidth(e, t) {
                const n = Math.max(1, Number(t) || 1), i = e / 2 * er.spread;
                return Math.max(8, i / Math.max(n, 6));
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
        // Selection marking — the single authority (map-render refactor,
        // finding 5). selectionMarkKind(spokeId, selectedId, record)
        // decides whether a spoke carries the .selected-spoke mark for a
        // selection, and where the mark lives:
        //   "own"    — the selected node's own spoke (and a selected
        //              topic's parent spoke): the mark lives in that
        //              spoke's node group.
        //   "branch" — the branch spoke (cat-<slug of record.branch>):
        //              the mark lives in the branch line-group underlay
        //              item (.spoke-underlay-item[data-spoke-for=...]).
        //   null     — no mark. A subcategory carries no mark of its own:
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
        function Ka(e, t, n, i, a, r, o, s, l, c, d, u = 48, p = Ga.FALLBACK_COLOR, g = !0, m = "", f = null, y = null, b = null, v = !1, w = !0, k = h.length, bc = null, sxLeafD = null, sxDepth = null) {
            Ra(e);
            const sxD = null != sxDepth ? sxDepth : sxLeafD === sxIconDiameter(1) ? 1 : sxLeafD === sxIconDiameter(3) ? 3 : 2, sxF = sxFontFactor(sxD), sxSW = sxStrokeWidth(sxD);
            const x = Rt || Qi() ? null : Vi(), S = Rt ? null : x || function(e) {
                const t = Vi();
                return Qi() && t && (at[t] || {})[e] && gn.has(oi(t, e)) ? t : null;
            }(e), $ = Ge(e, S || Vi()), E = e => `translate(${(a * e).toFixed(2)} ${(r * e).toFixed(2)})`, A = e.replace(/[^a-z0-9-]/g, ""), C = Boolean(topicLabelById[e]), M = S || Vi(), I = qn[e] || Xn(e) || {
                id: e,
                label: i,
                branch: i,
                kind: C ? "Topic" : "Category"
            }, P = (wa(e, I, M), da(e, M)), L = $a(e, "give", M), T = $a(e, "receive", M), F = Sa(e, I, M), N = ka(i, L, P.giveKnown ? ba(P.give) : "Unrated", { tapFirst: !0 }), _ = ka(i, T, P.receiveKnown ? ba(P.receive) : "Unrated", { tapFirst: !0 });
            let D = "";
            const R = g && !Rt ? Ua(e) : null, O = Ga.heatWidths(n, sxD);
            if (SpokeGeometry.taperedPath(t, O.w0, O.w1), R) {
                const overlayTip = "Overlaid profiles into this topic", a = `${R.count}/${R.total}`;
                D += `<path class="group-heat${R.count === R.total ? " all-in" : ""}" d="${t}" stroke="${R.color}" stroke-width="${O.w0}" opacity="${(.2 + .48 * R.count / R.total).toFixed(2)}" tabindex="0" role="img" aria-label="${Hi(`${i}: ${a} overlaid profiles into this topic`)}"${ka(i, overlayTip, a, {
                    hoverOnly: !1
                })}/>`;
            }
            selectionMarkKind(e, Lt, Lt ? qn[Lt] || Xn(Lt) || (at[Vi()] || {})[Lt] : null) && (D += `<path class="selected-spoke" d="${t}" style="stroke-width:${9 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`);
            const B = m ? ` ${m}` : "", j = Math.hypot(o - pr.centerX, s - pr.centerY), q = Ga.railsBaseWidth(e, n, j, k, sxD), H = Ga.tipWidth(n);
            const tipCircle = SpokeGeometry.buildTipCircle(o, s, l, c, null != sxLeafD ? sxLeafD : u * mapFontScale());
            let W = "";
            if (w) if (w && f && y) {
                const seg = Ga.segment(o, s, l, c), i = sxSW, a = Ga.splitInnerHalf(n, sxD), r = SpokeGeometry.flankPaths(o, s, seg.dx, seg.dy, seg.nx, seg.ny, q, H, a, a, "innerFirst", bc, tipCircle), d = b || p || Ga.FALLBACK_COLOR, u = Ga.midlineOutlinePath(t, n, v, sxD);
                W = `<path class="tapered-stem${B}" d="${r.top}" fill="${f}" stroke="none" style="fill:${f}"${N}/><path class="tapered-stem${B}" d="${r.bottom}" fill="${y}" stroke="none" style="fill:${y}"${_}/>` + (v ? `<path class="hanky-midline hanky-none" d="${t}" fill="none" stroke="${Ga.FALLBACK_COLOR}" stroke-width="${i}" stroke-linecap="butt"${Ga.dashAttr(i)} opacity="0.85"${F}/>` : u + `<path class="hanky-midline" d="${t}" fill="none" stroke="${d}" stroke-width="${i}" stroke-linecap="butt" opacity="0.9"${F}/>`);
            } else {
                const taperedD = SpokeGeometry.taperedPath(t, q, H, tipCircle, bc), i = sxSW, a = v ? Ga.FALLBACK_COLOR : b || p || Ga.FALLBACK_COLOR, r = v ? Ga.dashAttr(i) : "";
                W = `<path class="tapered-stem${B}" d="${taperedD}" fill="${p}" stroke="none" style="fill:${p}"/><path class="hanky-midline" d="${t}" fill="none" stroke="${a}" stroke-width="${i}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            } else {
                const stemW = 1.3 * (n || 8), i = v ? Ga.NO_CODE_COLOR : b || p || Ga.NO_CODE_COLOR, a = Ga.midlineOutlinePath(t, n, v, sxD), r = v ? Ga.dashAttr(stemW) : "";
                W = a + `<path class="hanky-midline" d="${t}" fill="none" stroke="${i}" stroke-width="${sxSW}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            }
            if (D += W, D += `<path class="topic-pulse${B}${v ? " hanky-none" : ""}" d="${t}" stroke="${p}" style="stroke-width:${5 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`, 
            D += `<path class="concept-hit" data-id="${e}" data-nx="${a.toFixed(5)}" data-ny="${r.toFixed(5)}"${Sa(e, I, M)} d="${t}" tabindex="0" role="button" aria-label="${Hi(i)} concept line"/>`, 
            g && x && !d) {
                const n = da(e, x);
                ($.single ? [ {
                    key: "give",
                    offset: 0
                } ] : [ {
                    key: "give",
                    offset: -5
                }, {
                    key: "receive",
                    offset: 5
                } ]).forEach((e, i) => {
                    if (!n[e.key + "Known"]) return;
                    const a = n[e.key], r = $.labels[i] || e.key, o = n[e.key + "Derived"] ? ` · rolled up from ${n[e.key + "RatedChildren"]} of ${n.childCount} child topics` : "";
                    D += `<path class="visual-rail collapsed-rating-rail" d="${t}" transform="${E(e.offset)}" fill="none" stroke="${zi(a)}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${r}: ${Math.round(a)}${o}</title></path>`;
                });
            }
            if (g && !Rt && Qi() && 2 === Xi().length) {
                const n = function(e) {
                    const t = Xi();
                    if (t.some(t => "limit" === Oa(e, t))) return "limit";
                    if (t.some(t => "favorite" === Oa(e, t))) return "favorite";
                    const r = sxPairByIds(t[0], t[1]), rec = r && r.topicsById[e];
                    if (!rec) return "other";
                    return "match" === rec.outcome ? "mutual" : rec.mutualNo ? "disinterest" : "other";
                }(e), i = {
                    mutual: "mutual-halo",
                    disinterest: "disinterest-halo",
                    favorite: "favorite-halo",
                    limit: "limit-halo"
                }[n];
                i && (D += `<path class="${i}" d="${t}"/>`);
            }
            const U = S && "group" === ft[S]?.kind ? ft[S].matchDetails?.[e] : null;
            if (g && S && d && U) {
                const t = l - o, n = c - s, i = (Math.hypot(t, n), 180 * Math.atan2(n, t) / Math.PI), a = sxControlScale(sxD, u), r = function(e) {
                    if (!e) return "";
                    const t = Array.isArray(e.routes) ? e.routes : [];
                    return 1 === t.length ? `${Math.round(e.score)}% · ${_d(t[0])}` : `${Math.round(e.score)}% · ${t.length} matched routes`;
                }(U), d = (U.routes || []).map(e => `${_d(e, !0)}; combined ${Math.round(e.score)}%`).join(" · "), p = Za.controlTagWidth(r, "group") * a, h = 24 * a, g = l, m = c;
                D += `<g class="direction-control group-match-control" data-id="${e}" data-direction="group" data-base-cx="${g}" data-base-cy="${m}" data-base-angle="${i}" data-index="0" data-tag-width="${p}" data-tag-height="${h}" data-control-scale="${a}" role="img" tabindex="0" aria-label="Combined match ${Math.round(U.score)} percent. ${Hi(d)}"><title>Combined match ${Math.round(U.score)}%. ${Hi(d)}</title><rect class="direction-tag-bg" x="${(g - p / 2).toFixed(2)}" y="${(m - h / 2).toFixed(2)}" width="${p.toFixed(2)}" height="${h.toFixed(2)}" rx="${6 * a}" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" fill="${zi(U.score)}"/><text class="direction-tag" x="${g.toFixed(2)}" y="${m.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" textLength="${Math.max(50, p - 12 * a).toFixed(2)}" lengthAdjust="spacing" style="font-size:${5.5 * a}px">${Hi(r)}</text></g>`;
            } else if (g && S && d) {
                const t = da(e, S), n = l - o, i = c - s, d = Math.hypot(n, i), p = n / d, h = i / d, g = 180 * Math.atan2(i, n) / Math.PI, m = sxControlScale(sxD, u), f = $.keys, y = $.labels, b = !$.single && "give" === y[0] && "receive" === y[1], v = e => Za.controlTagWidth(e, "pair") * m, w = $.single ? {
                    give: Za.controlTagWidth(y[0], "single") * m
                } : {
                    give: v(y[0]),
                    receive: v(y[1])
                }, k = ($.single ? 20 : 24) * m, x = 320 * m, E = sxRailPx(m), C = $.single ? [ 0 ] : [ -w.give / 2, w.receive / 2 ];
                // Slider blow-up repair (2026-11-01): E (the rating rail's stroke-width) was 44 * mapFontScale() — unbounded and font-derived, so at the baked fontScale 40 the rail rendered 1760 screen px thick (non-scaling-stroke) and one inadvertently picked slider filled the viewport at high zoom-out. It is now the fixed 44 of the 44px spec at every font scale and zoom, matching the .rating-rail CSS rule. Track length (x = 320 * m, map units, camera-scaled) is unchanged.
                // Slider size repair #2 (2026-11-01): E now comes from sxRailPx(m) — 14% of the track's delivered screen length at the current camera, capped at the same fixed 44 — so the attribute, the .rating-rail CSS variable, and the hit strokes all agree at every zoom instead of the fixed 44px thickness dwarfing the shrunken track at Full zoom-out.
                f.forEach((n, i) => {
                    const o = w[n], s = o + 10 * m, d = C[i], u = l - p * d, f = c - h * d, v = u - a * x / 2, M = f - r * x / 2, I = u + a * x / 2, P = f + r * x / 2, L = `M ${v.toFixed(2)} ${M.toFixed(2)} L ${I.toFixed(2)} ${P.toFixed(2)}`, T = s / 2, F = `M ${(u - p * T).toFixed(2)} ${(f - h * T).toFixed(2)} L ${(u + p * T).toFixed(2)} ${(f + h * T).toFixed(2)}`, N = `grad-${A}-${n}`, _ = t[n + "Known"], R = _ ? t[n] : 0, O = (R + 100) / 200, B = Boolean(t[n + "Derived"]), j = Math.round(R), q = _ ? B ? `${j}, rolled up from ${t[n + "RatedChildren"]} of ${t.childCount} child topics` : String(j) : "Unrated", H = Zn(e, n), W = ei(e, n, S), U = Boolean(Nt && Nt.id === e && Nt.direction === n), G = U ? " active-rating" : "", K = `data-id="${e}" data-direction="${n}" data-x0="${v}" data-y0="${M}" data-x1="${I}" data-y1="${P}" data-nx="${a}" data-ny="${r}" data-offset="0"`, z = v + (I - v) * O, V = M + (P - M) * O, Y = $.single ? 1 : 0 === i ? -1 : 1, X = u + p * Y * (o / 2), Z = f + h * Y * (o / 2), Q = _ ? zi(R) : Ga.FALLBACK_COLOR;
                    D += `<g class="direction-control${$.single ? " single-label-control" : ""}${G}" data-id="${e}" data-direction="${n}"${W ? ` data-rating-tooltip="${Hi(W)}"` : ""} data-derived="${B}" data-base-cx="${u}" data-base-cy="${f}" data-base-angle="${g}" data-index="${i}" data-tag-width="${o}" data-tag-height="${k}" data-control-scale="${m}" style="--sx-rail-px:${E.toFixed(1)}px;--sx-rail-hit-px:${Math.max(14, Math.min(44, E * 1.6)).toFixed(1)}px">`, 
                    D += `<defs><linearGradient id="${N}" gradientUnits="userSpaceOnUse" x1="${v}" y1="${M}" x2="${I}" y2="${P}"><stop offset="0" stop-color="var(--red-deep)"/><stop offset=".5" stop-color="var(--curious)"/><stop offset="1" stop-color="var(--green-deep)"/></linearGradient></defs>`, 
                    D += `<path class="visual-rail rating-rail${G}" data-id="${e}" data-direction="${n}" d="${L}" fill="none" stroke="url(#${N})" stroke-width="${E}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`, 
                    (_ || U) && (D += `<circle class="slider-thumb${G}" data-id="${e}" data-direction="${n}" cx="${z.toFixed(2)}" cy="${V.toFixed(2)}" r="${10 * m}" fill="${zi(R)}"/>`), 
                    D += `<path class="rating-track-hit${G}" ${K} d="${L}"/>`;
                    const J = U ? `tabindex="0" role="button" aria-label="Clear ${Hi(`${Jn(e, n)}${H ? ` ${H}` : ""}`)} rating"` : 'tabindex="-1" aria-hidden="true"', ee = g + 90;
                    D += `<g class="rating-clear${G}" data-id="${e}" data-direction="${n}"><rect class="rating-clear-bg" x="${(X - 23 * (mapFontScale() * sxF / 3)).toFixed(2)}" y="${(Z - 10 * (mapFontScale() * sxF / 3)).toFixed(2)}" width="${46 * (mapFontScale() * sxF / 3)}" height="${20 * (mapFontScale() * sxF / 3)}" rx="5" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})"/><rect class="rating-clear-hit" data-id="${e}" data-direction="${n}" x="${(X - 28).toFixed(2)}" y="${(Z - 15).toFixed(2)}" width="56" height="30" rx="7" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})" ${J}/><text class="rating-clear-text" x="${X.toFixed(2)}" y="${Z.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})">Clear</text></g>`, 
                    D += `<path class="direction-hit" tabindex="0" role="slider" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="${_ ? j : 0}" aria-valuetext="${q}" aria-label="${Hi(`${Jn(e, n)}${H ? `: ${H}` : ""}. ${q}. Tap to open its rating scale; drag, then release to choose.`)}" aria-expanded="${U}" ${K} d="${F}"/>`, 
                    $.single && (D += `<rect class="direction-tag-occluder" x="${(u - o / 2 - 3 * m).toFixed(2)}" y="${(f - k / 2 - 3 * m).toFixed(2)}" width="${(o + 6 * m).toFixed(2)}" height="${(k + 6 * m).toFixed(2)}" rx="${7 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})"/>`), 
                    D += `<rect class="direction-tag-bg" data-id="${e}" data-direction="${n}" x="${(u - o / 2).toFixed(2)}" y="${(f - k / 2).toFixed(2)}" width="${o}" height="${k}" rx="${5 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" fill="${Q}" opacity="${_ ? 1 : .62}"/>`;
                    // TAG FILL (ruled 2026-11-02, Jason): the give/receive
                    // lettering fills its tag capsule — font-size equals
                    // the tag height k exactly (single 20 * m, pair
                    // 24 * m), no wasted space top or bottom. The capsule
                    // takes its width from the word itself at this font
                    // (Za.controlTagWidth), so the word fits with no
                    // sideways squeeze and no shrink: the old textLength
                    // cap (spacingAndGlyphs) is gone.
                    const te = $.single ? y[i] : b ? "give" === n ? "G" : "R" : y[i], ne = k;
                    D += `<text class="direction-tag" data-id="${e}" data-direction="${n}" x="${u.toFixed(2)}" y="${f.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" style="font-size:${ne}px">${Hi(te)}</text></g>`;
                });
            }
            if (g && !Rt && !x) {
                const i = Xi(), a = $.single ? [ "give" ] : [ "give", "receive" ], r = i.length * a.length, o = (n > 7 ? Math.min(18, 4 + 1.6 * r) : Math.min(14, 3 + 1.4 * r)) * (mapFontScale() * sxF / 3), s = Math.max(1.35, n / Math.min(r, 6)) * (mapFontScale() * sxF / 3);
                i.forEach((n, i) => {
                    const l = da(e, n);
                    a.forEach((c, d) => {
                        const u = i * a.length + d, p = 1 === r ? 0 : -o / 2 + o * u / (r - 1);
                        $.labels[d], D += `<path class="visual-rail" d="${t}" transform="${E(p)}" fill="none" ${function(e, t, n) {
                            return e[t + "Known"] ? `stroke="${la(n)}" opacity=".96"` : 'stroke="var(--line)" stroke-dasharray="2 6" opacity=".38"';
                        }(l, c, n)} stroke-width="${s}" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${Hi(wt[n])} — ${Hi(Jn(e, c))}</title></path>`;
                    });
                });
            }
            return D;
        }
        function za(e, t, n, i, a, r = 0) {
            const o = i - t, s = a - n, l = Math.hypot(o, s), c = o / l, d = s / l, u = i - c * r, p = a - d * r, h = Math.max(80, l - r), g = Za.leafLabelWidth(h), m = u - c * g, f = p - d * g;
            return {
                d: `M ${t.toFixed(2)} ${n.toFixed(2)} L ${i.toFixed(2)} ${a.toFixed(2)}`,
                labelD: `M ${m.toFixed(2)} ${f.toFixed(2)} L ${u.toFixed(2)} ${p.toFixed(2)}`,
                labelWidth: g,
                labelStartX: m,
                labelStartY: f,
                ux: c,
                uy: d,
                nx: -d,
                ny: c
            };
        }
        function Va(e, t, n, i, a) {
            return r => {
                const o = Math.max(0, Math.min(a, r));
                return {
                    x: e + n * o,
                    y: t + i * o
                };
            };
        }
        function Ya(e, t, n, i, a = pr.categoryIcon / 2) {
            const r = Math.max(1, Math.hypot(n - e, i - t)), o = (n - e) / r, s = (i - t) / r, l = -s, c = o, d = `M ${e.toFixed(2)} ${t.toFixed(2)} L ${n.toFixed(2)} ${i.toFixed(2)}`, u = `M ${n.toFixed(2)} ${i.toFixed(2)} L ${e.toFixed(2)} ${t.toFixed(2)}`, p = r, h = Va(e, t, o, s, p), g = a, m = Za.cloudLabel(p, g), f = m.labelOffset;
            return {
                d: d,
                labelD: d,
                reverseD: u,
                routedLength: p,
                labelWidth: m.labelWidth,
                labelOffset: f,
                icon: h(p),
                ux: o,
                uy: s,
                nx: l,
                ny: c,
                c1: h(.3 * p),
                c2: h(.7 * p),
                bend: 0,
                pointAtDistance: h
            };
        }
        function Xa(e, t) {
            return {
                x: MAP_CENTER_X + Math.cos(e) * t,
                y: MAP_CENTER_Y + Math.sin(e) * t
            };
        }
        const Za = Object.freeze({
            HALO_SPACING: Object.freeze({
                category: 8,
                topic: 6
            }),
            CENTER_SPACING_EM: .02,
            IDEAL_SIZE: 18,
            MIN_SIZE: 12.5,
            _context: document.createElement("canvas").getContext("2d"),
            _cache: new Map,
            _estimateCache: new Map,
            measure(e, t, n) {
                if (!Za._context) return 0;
                const i = "category" === n || "center" === n, a = i ? '"Barlow Condensed",sans-serif' : '"Source Sans 3",sans-serif', r = i ? 700 : 650, o = "center" === n ? Za.CENTER_SPACING_EM * t : Za.HALO_SPACING[n] || Za.HALO_SPACING.topic, s = n + "|" + t.toFixed(1) + "|" + e;
                if (Za._cache.has(s)) return Za._cache.get(s);
                Za._context.font = `${r} ${t}px ${a}`;
                const l = Za._context.measureText(e).width + o * Math.max(0, e.length - 1);
                return Za._cache.size > 2e3 && Za._cache.clear(), Za._cache.set(s, l), l;
            },
            fittedSize(e, t, n) {
                const i = Za.IDEAL_SIZE, a = Za.measure(e, i, n);
                return Math.max(Za.MIN_SIZE, Math.min(i, i * t / Math.max(t, a)));
            },
            fitWithin(e, t, n, i, a) {
                const r = Za.measure(e, t, a);
                return Math.max(n, Math.min(t, t * i / Math.max(1, r)));
            },
            fitAttr: (e, t, n, i) => Za.measure(e, t, n) > i ? ` textLength="${i.toFixed(0)}" lengthAdjust="spacing"` : "",
            // CAPSULE = THE WORD (ruled 2026-11-02, Jason): a tag
            // capsule's width IS its word's measured width at the tag
            // font, plus the renderer's existing inset (4 for the
            // give/receive tags, whose fit check was capsule width
            // minus 4 * scale; 12 for the group score tag, whose text
            // was set to capsule width minus 12 * scale). The old
            // per-character width table is gone: no fixed widths, no
            // caps, no floors. Tag fonts: single 20, pair 24 (the
            // tag heights, unchanged), group score 5.5 (halved from
            // 11 in the same ruling). Paint and the scored capsule
            // geometry both read this one definition, so they move
            // together.
            controlTagWidth: (e, t) => "single" === t ? Za.measure(e, 20, "topic") + 4 : "group" === t ? Za.measure(e, 5.5, "topic") + 12 : Za.measure(e, 24, "topic") + 4,
            leafLabelWidth: e => Math.min(e, Math.max(170, e - 38)),
            curveLabel(e, t, n) {
                const i = Math.max(.32, Math.min(.62, Number(n) || .32)), a = Number.isFinite(t) ? Math.min(e * i, Math.max(6, t)) : Math.min(12, Math.max(6, .03 * e));
                return {
                    labelOffset: a,
                    safeLabelLimit: i,
                    labelWidth: Math.max(120, e - a - 20)
                };
            },
            cloudLabel(e, t) {
                const n = Math.min(e - 40, Math.max(t + 44, .2 * e));
                return {
                    labelOffset: n,
                    // LABEL CLEARANCE (repair, 2026-11-01): the
                    // width offered to the fitted-size computation
                    // is the space actually left on the spoke —
                    // the old floor of 80 forced a label wider
                    // than a short spoke, so its text ran past
                    // the end of the spoke and impinged on the
                    // icon seated there. A short spoke now gets a
                    // smaller fitted label instead.
                    labelWidth: Math.max(30, e - n - 30)
                };
            },
            adaptivePlacement(e, t, n = 0) {
                const i = Math.max(.006, Number(e && e.sector) || .006), a = t >= 3, r = a ? 92 : 44, o = a ? n + 700 : n + 72, s = a ? hr(3) + 1280 : n + 420, l = Math.min(s, Math.max(o, r / i)), c = a ? 620 : 72, d = a ? 2560 : 560, u = Math.max(c, Math.min(d, l - n));
                return a ? {
                    offset: u,
                    limit: .72
                } : {
                    offset: u,
                    limit: .68
                };
            },
            topicLabelOffset: (e, t, n) => Math.max(30, Math.min(e - 36, t + (n % 2 ? 20 : 0))),
            angularDemand(e, t, n, i, a = 0) {
                const r = Math.max(n + 30, 2 * i + Math.min(40, .65 * String(e || "").length)) + a;
                return 2 * Math.asin(Math.min(.92, r / (2 * Math.max(1, t))));
            },
            allocateSectors(e, t, n, i, a, r, o = 0) {
                if (!e.length) return [];
                const s = e.map(e => Math.max(Za.angularDemand(e.label, i, a, r, o), Number(e.minDemand) || 0)), l = s.reduce((e, t) => e + t, 0), c = e.map(e => Math.max(1, e.weight || 1)), d = c.reduce((e, t) => e + t, 0);
                let u = c.map(e => n * e / d);
                if (l <= n) {
                    const t = new Set;
                    for (let i = 0; i < e.length; i++) {
                        let e = !1, i = 0, a = 0;
                        if (u.forEach((e, n) => {
                            t.has(n) ? i += s[n] : a += c[n];
                        }), u = u.map((e, r) => t.has(r) ? s[r] : Math.max(0, n - i) * c[r] / Math.max(1e-4, a)), 
                        u.forEach((n, i) => {
                            !t.has(i) && n < s[i] && (t.add(i), e = !0);
                        }), !e) break;
                    }
                    const i = u.reduce((e, t) => e + t, 0);
                    if (i < n - 1e-4) {
                        const t = (n - i) / e.length;
                        u = u.map(e => e + t);
                    }
                } else u = s.map(e => n * e / l);
                let p = t;
                return e.map((e, t) => {
                    const n = u[t], i = s[t], a = Math.max(0, (n - i) / Math.max(1e-4, i)), r = Object.assign({}, e, {
                        angle: p + n / 2,
                        sector: n,
                        start: p,
                        end: p + n,
                        demand: i,
                        slackRatio: a
                    });
                    return p += n, r;
                });
            },
            TAPER_BASE_FRACTION: .78,
            // TAPER-BASE RE-ANCHOR (2026-11-02, owner-approved): the
            // category taper base no longer grows with the radius R.
            // TAPER_BASE_CAP is the tuned-era base — TAPER_BASE_FRACTION
            // of the chord across one of 18 slots at R = 300, about
            // 81.26 units, the base this rule produced when it was
            // tuned — and categoryTaperBaseWidth now returns
            //   max(seed, min(0.78 * chord(R, count), TAPER_BASE_CAP))
            // so at any larger radius the base holds at the tuned value
            // and Ga.railsBaseWidth's fontScale / 3 carries that fixed
            // proportion forward (the painted base is about 1.23x the
            // 22 * fontScale band at every font size). The min() keeps
            // the Oct 13 neighbour-margin property at every radius:
            // the base never exceeds 0.78 of one slot chord, so
            // adjacent bases always keep their margin. flareAt and
            // FLARE_DECAY are untouched.
            TAPER_BASE_CAP: 2 * 300 * Math.sin(Math.PI / 18) * .78,
            categoryTaperBaseWidth(e, t, n) {
                const i = 2 * t * Math.sin(Math.PI / Math.max(1, Number(n) || 1));
                return Math.max(e, Math.min(i * Za.TAPER_BASE_FRACTION, Za.TAPER_BASE_CAP));
            },
            SETTLE: Object.freeze({
                controlGap: 14,
                iconGap: 2,
                startOffset: 2,
                parentOuterMargin: 12,
                boxPadding: 4,
                badgeGap: 0,
                gen2: Object.freeze({
                    step: 32,
                    attempts: 18
                }),
                gen3: Object.freeze({
                    step: 40,
                    attempts: 18
                })
            }),
            orientedBox(e, t, n, i, a = 0) {
                const r = a * Math.PI / 180, o = Math.cos(r), s = Math.sin(r), l = Za.SETTLE.boxPadding;
                return {
                    cx: e,
                    cy: t,
                    hw: Math.max(1, n / 2 + l),
                    hh: Math.max(1, i / 2 + l),
                    ux: {
                        x: o,
                        y: s
                    },
                    uy: {
                        x: -s,
                        y: o
                    }
                };
            },
            boxesOverlap(e, t) {
                const n = t.cx - e.cx, i = t.cy - e.cy;
                return [ e.ux, e.uy, t.ux, t.uy ].every(a => Math.abs(n * a.x + i * a.y) < e.hw * Math.abs(e.ux.x * a.x + e.ux.y * a.y) + e.hh * Math.abs(e.uy.x * a.x + e.uy.y * a.y) + (t.hw * Math.abs(t.ux.x * a.x + t.ux.y * a.y) + t.hh * Math.abs(t.uy.x * a.x + t.uy.y * a.y)));
            },
            isClear: (e, t) => !e.some(e => t.some(t => Za.boxesOverlap(e, t))),
            settleSearch: e => e ? Za.SETTLE.gen2 : Za.SETTLE.gen3,
            markerCandidates(e) {
                let t = 0;
                for (let n = 0; n < e.length; n++) t = 31 * t + e.charCodeAt(n) >>> 0;
                const n = t % 2 ? 1 : -1, i = 9 * (t % 3 - 1);
                return [ [ 36 * n, i ], [ 36 * -n, i ], [ 49 * n, -i ], [ 49 * -n, -i ], [ 38 * n, i + 24 ], [ 38 * -n, i - 24 ], [ 54 * n, i + 22 ], [ 54 * -n, i - 22 ] ];
            },
            markerAnchorAt(e, t, n, i, a) {
                const r = -n, o = t;
                return {
                    x: e.x + r * i[0] + t * i[1],
                    y: e.y + o * i[0] + n * i[1],
                    radius: a
                };
            },
            pickMarkerAnchor(e, t, n, i, a, r) {
                for (const o of a) {
                    const a = Za.markerAnchorAt(t, n, i, o, r);
                    if (e.every(e => Math.hypot(a.x - e.x, a.y - e.y) >= a.radius + e.radius + 8)) return a;
                }
                return null;
            },
            topicSpokeEstimate(e, t, depth) {
                // Memoised (T3, M6): the result is a pure function
                // of ALL of its inputs — the label, the radius, and
                // the canvas font-metrics state its measure calls
                // read (Source Sans 3, weight 650; see Za.measure).
                // The governing font signature is part of the cache
                // key — the bundle's signature-recapture discipline:
                // when the font state changes, entries under the old
                // signature simply never hit and the value is
                // recaptured, so a hit always returns exactly what
                // the unmemoised computation returns under the same
                // state. Hits hand back a fresh object, so a caller
                // can never mutate a cached entry. Bounded like
                // Za._cache: cleared past 2,000 entries.
                let sig = "nofonts";
                try {
                    document.fonts && document.fonts.check && (sig = document.fonts.status + "|" + document.fonts.check('650 16px "Source Sans 3"'));
                } catch (_) {}
                const dep = null == depth ? 2 : depth, key = sig + "|" + t + "|" + dep + "|" + e, hit = Za._estimateCache.get(key);
                if (hit) return {
                    fontSize: hit.fontSize,
                    spokeLength: hit.spokeLength
                };
                const n = Math.max(12, Math.min(17, Za.fittedSize(e, Math.max(80, t - 84)))) * sxFontCoef(dep) / 17, i = 96 + Za.measure(e, n) + 30, out = {
                    fontSize: n,
                    spokeLength: Math.max(t, i)
                };
                return Za._estimateCache.size > 2e3 && Za._estimateCache.clear(), Za._estimateCache.set(key, out), {
                    fontSize: out.fontSize,
                    spokeLength: out.spokeLength
                };
            },
            hubSpokeLength(e, t, n, i, a) {
                let r = n;
                for (let n = 0; n < 3; n++) {
                    const n = Math.min(r - 40, Math.max(i + 44, .2 * r)) + 20;
                    r = Math.max(r, n + Za.measure(e, t) + 3 + a);
                }
                return Math.max(n, r);
            },
            categoryFontSize: (e, t, n, i) => Math.max(15, Math.min(25, Za.fittedSize(e, t - n - (i ? 20 : 12), "category") + 5)),
            categoryUnderlineLength: (e, t) => Math.max(36, e.length * t * .5)
        });
