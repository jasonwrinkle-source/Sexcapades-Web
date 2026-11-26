        // =========================================================================
        // MAP PAINT MODULAR RENDERERS (Phase 4 Step 2 Decomposition)
        // Hoisted out of Ar() so a paint does not rebuild them.
        // =========================================================================
        const SpokeRenderer = {
            renderBranchSpoke(dCat, spokeD, name, nx, ny, o2X, o2Y, cX, cY, catHeat, lineColor, hankyLineClass, giveColor, receiveColor, hankyColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter) {
                return sxPaintSpoke(dCat, spokeD, 18, name, nx, ny, o2X, o2Y, cX, cY, !1, pr.categoryIcon, catHeat || lineColor, !1, hankyLineClass, giveColor, receiveColor, isNoCode ? Ga.FALLBACK_COLOR : hankyColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter, 1);
            },
            renderTopicSpoke(id, pathD, label, nx, ny, oX, oY, lX, lY, isStatic, icon, P, isSecondGen, hankyLineClass, giveColor, receiveColor, lineColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter, depth = 2) {
                return sxPaintSpoke(id, pathD, isStatic ? 18 : 6, label, nx, ny, oX, oY, lX, lY, !0, icon, P, !0, hankyLineClass, giveColor, receiveColor, lineColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter, depth);
            }
        };

        const HubRenderer = {
            renderIcon(id, diameter, glyphData, tapTarget, color, cx, cy, isBranch = false, isSubcategory = false, partyHoldings = null, interestDisc = null) {
                const r = diameter / 2;
                const iconSize = diameter * 0.62;
                const iconOffset = (diameter - iconSize) / 2;
                const fallbackAttr = glyphData.glyphFallback ? ' data-glyph-fallback="star"' : "";
                const cls = isBranch ? `branch-icon${"noCode" === glyphData.hankyKey ? " no-hanky-code-icon" : ""}` :
                    `topic-icon${isSubcategory ? " subcategory-icon" : "noCode" === glyphData.hankyKey ? " no-hanky-code-icon" : ""}${glyphData.glyphFallback ? " glyph-fallback" : ""}`;
                const innerContent = `<svg viewBox="${glyphData.viewBox || "0 0 24 24"}" width="${iconSize.toFixed(2)}" height="${iconSize.toFixed(2)}" x="${iconOffset.toFixed(2)}" y="${iconOffset.toFixed(2)}" overflow="visible">${glyphData.glyph}${glyphData.accent || ""}</svg>`;
                let discMarkup;
                const rd = r - 2;
                if (partyHoldings && partyHoldings.length === 2 && !isBranch) {
                    const colA = partyHoldings[0].color || "rgba(128,128,128,0.25)";
                    const colB = partyHoldings[1].color || "rgba(128,128,128,0.25)";
                    discMarkup = `<path class="icon-disc icon-disc-left" d="M ${r} 2 A ${rd} ${rd} 0 0 0 ${r} ${r * 2 - 2} Z" fill="${colA}" style="fill:${colA}"/><path class="icon-disc icon-disc-right" d="M ${r} 2 A ${rd} ${rd} 0 0 1 ${r} ${r * 2 - 2} Z" fill="${colB}" style="fill:${colB}"/><line x1="${r}" y1="2" x2="${r}" y2="${r * 2 - 2}" stroke="rgba(0,0,0,0.4)" stroke-width="0.75"/>`;
                } else if (partyHoldings && partyHoldings.length > 2 && !isBranch) {
                    const nParts = partyHoldings.length;
                    let wedges = "";
                    for (let k = 0; k < nParts; k++) {
                        const a0 = -Math.PI / 2 + (2 * Math.PI * k) / nParts;
                        const a1 = -Math.PI / 2 + (2 * Math.PI * (k + 1)) / nParts;
                        const x0 = (r + rd * Math.cos(a0)).toFixed(2);
                        const y0 = (r + rd * Math.sin(a0)).toFixed(2);
                        const x1 = (r + rd * Math.cos(a1)).toFixed(2);
                        const y1 = (r + rd * Math.sin(a1)).toFixed(2);
                        const colK = partyHoldings[k].color || "rgba(128,128,128,0.25)";
                        wedges += `<path class="icon-disc icon-disc-wedge" d="M ${r} ${r} L ${x0} ${y0} A ${rd} ${rd} 0 0 1 ${x1} ${y1} Z" fill="${colK}" style="fill:${colK}"/>`;
                    }
                    discMarkup = wedges;
                } else if (interestDisc) {
                    // Icons follow the midline coloration of interest
                    // (Jason, 2026-11-22): a dual topic's disc splits
                    // into its give and receive interest colors (never
                    // averaged); a single-value topic wears its one
                    // interest color; unrated wears the no-code
                    // charcoal. Identity colors (hanky, category
                    // palette) no longer paint map icons.
                    if (interestDisc.left) {
                        discMarkup = `<path class="icon-disc icon-disc-left" d="M ${r} 2 A ${rd} ${rd} 0 0 0 ${r} ${r * 2 - 2} Z" fill="${interestDisc.left}" style="fill:${interestDisc.left}"/><path class="icon-disc icon-disc-right" d="M ${r} 2 A ${rd} ${rd} 0 0 1 ${r} ${r * 2 - 2} Z" fill="${interestDisc.right}" style="fill:${interestDisc.right}"/><line x1="${r}" y1="2" x2="${r}" y2="${r * 2 - 2}" stroke="rgba(0,0,0,0.4)" stroke-width="0.75"/>`;
                    } else {
                        discMarkup = `<circle class="icon-disc" cx="${r}" cy="${r}" r="${rd}" fill="${interestDisc.single}" style="fill:${interestDisc.single}"/>`;
                    }
                } else {
                    discMarkup = `<circle class="icon-disc" cx="${r}" cy="${r}" r="${rd}"/>`;
                }
                return `<g class="${cls}"${fallbackAttr} data-diameter="${diameter}" ${tapTarget} aria-hidden="true" style="color:${color}" transform="translate(${(cx - r).toFixed(2)} ${(cy - r).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${r}" cy="${r}" r="${r - .5}"/>${discMarkup}<circle class="icon-ring-outline icon-ring-outline-inner" cx="${r}" cy="${r}" r="${r - 3.5}"/>${innerContent}</g>`;
            },
            renderBadges(cx, cy, count, id, ux = 0, uy = 0, offset = 0, isCategory = false) {
                return sxHiddenCountMarkup(cx + ux * offset, cy + uy * offset, count, id, isCategory);
            }
        };

        const LabelRenderer = {
            // CENTRED LABEL (2026-11-25): the label's centre sits at the
            // spoke's midpoint (routedLength / 2) — its position along the
            // spoke, not its orientation, is what changed. This replaces the
            // 2026-11-18 icon-anchored placement, which put the label's
            // icon-side end a gap inside the icon at the far end of the
            // spoke. The text runs hub -> icon on the forward path
            // (text-anchor "start": the text starts at offset, so its
            // centre is at offset + effectiveW / 2) and icon -> hub on the
            // reverse path (text-anchor "end": the text ends at offset, so
            // its centre is at routedLength - offset + effectiveW / 2 from
            // the hub). The clamp bounds are unchanged: a label too wide
            // for its spoke is held on the spoke (hub/icon clearances) and
            // lands as close to the midpoint as it can.
            computeCenteredOffset(routedLength, renderedW, hubR, iconR, isReverse) {
                let offset, anchor;
                const hubMargin = 16;
                const leafMargin = 12;
                const availSpan = Math.max(10, routedLength - hubR - iconR - hubMargin - leafMargin);
                const effectiveW = Math.min(renderedW, availSpan);
                let textLengthAttr = "";
                if (renderedW > availSpan) {
                    textLengthAttr = ` textLength="${availSpan.toFixed(1)}" lengthAdjust="spacingAndGlyphs"`;
                }
                if (isReverse) {
                    const idealOffset = routedLength / 2 + effectiveW / 2;
                    const minOff = iconR + leafMargin + effectiveW;
                    const maxOff = routedLength - hubR - hubMargin;
                    if (minOff <= maxOff) {
                        offset = Math.min(maxOff, Math.max(idealOffset, minOff));
                    } else {
                        offset = maxOff;
                    }
                    anchor = ' text-anchor="end"';
                } else {
                    const idealOffset = routedLength / 2 - effectiveW / 2;
                    const minOff = hubR + hubMargin;
                    const maxOff = routedLength - iconR - leafMargin - effectiveW;
                    if (minOff <= maxOff) {
                        offset = Math.max(minOff, Math.min(idealOffset, maxOff));
                    } else {
                        offset = minOff;
                    }
                    anchor = "";
                }
                return { offset, anchor, textLengthAttr, effectiveW };
            },
            // The category name is a plain <text>. On both halves the
            // anchor is the hub-side end of the glyphs: the right half
            // uses text-anchor start (flow outward), the left half adds
            // 180° and text-anchor end so the glyphs still run outward
            // from the anchor. The centre is therefore always
            // anchor + textW/2 along the spoke. isReverse is unused;
            // callers keep passing it. The settle pass reseats the
            // name on the settled spoke midline and is the position
            // the map actually shows.
            computeCategoryCentreShift(spokeLen, labelWidth, offsetE, textW, isReverse) {
                const centreNow = (spokeLen - labelWidth + offsetE) + textW / 2;
                return spokeLen / 2 - centreNow;
            }
        };

