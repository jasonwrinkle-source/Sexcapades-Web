// Rating-mark display labels — the single source of truth.
//
// Engine keys NEVER change: favorite, limit, notinterested, fantasyonly,
// alreadytried. Scoring and behavior are driven by the key, so relabeling
// changes NO scoring — only the words and symbols a person sees.
//
// The table maps each key to {label, symbol, tooltip} for kink (the "sex"
// skin, what Sexcapades shows today) and for vanilla (every other skin).
// Vanilla is detected by the same mechanism as the vanilla guard and
// docs-skin: window.__SX_SKIN_PREFIX, "sex" vs anything else.
//
// Symbol sets: kink = ★ ⊘ × ☁ ✓ ; vanilla = ★ ○ × ☁ ✓.
// The ONLY symbol that changes between kink and vanilla is notinterested
// (⊘ → ○, U+25CB empty circle): ⊘ means "prohibited", which fits "not
// interested" but contradicts "no stake" (explicitly not a rejection).
//
// The "neutral" state (clearing a mark) is "no mark", not a label, and is
// untouched. Outline flag keys "fantasy" / "tried" are normalized to the
// engine keys "fantasyonly" / "alreadytried" by the lookup helpers.

const sxMarkLabelTable = {
    favorite: {
        kink: { label: "Favorite", symbol: "★", tooltip: "Favorite" },
        vanilla: { label: "Champion", symbol: "★", tooltip: "Champion — a position I stand for fully and would defend. My strongest stance on this question." }
    },
    limit: {
        kink: { label: "Hard limit", symbol: "×", tooltip: "Hard limit" },
        vanilla: { label: "Red line", symbol: "×", tooltip: "Red line — a position I will not accept, full stop. Marks this whole branch off the table, not just this topic." }
    },
    notinterested: {
        kink: { label: "Not interested", symbol: "⊘", tooltip: "Not interested — not for me, but not a hard boundary" },
        vanilla: { label: "No stake", symbol: "○", tooltip: "No stake — this question doesn't matter to me. Not a rejection (that's a red line), just no position here. Hidden, but it doesn't close the branch." }
    },
    fantasyonly: {
        kink: { label: "Fantasy only", symbol: "☁", tooltip: "Fantasy only — I fantasize about this but would not do it in real life" },
        vanilla: { label: "In principle only", symbol: "☁", tooltip: "In principle only — an idea I entertain in my head, not a stance I'd act on or live by. Kept out of practical plans." }
    },
    alreadytried: {
        kink: { label: "Already tried", symbol: "✓", tooltip: "Already tried — I have already done this" },
        vanilla: { label: "Lived it", symbol: "✓", tooltip: "Lived it — I've actually lived by this position, or been in the situation it describes. Tested in practice, not just theoretical." }
    }
};

function sxIsVanillaSkin() {
    return typeof window !== "undefined" && window.__SX_SKIN_PREFIX && "sex" !== window.__SX_SKIN_PREFIX;
}

function sxMarkKeyNormalize(key) {
    return "fantasy" === key ? "fantasyonly" : "tried" === key ? "alreadytried" : key;
}

function sxMarkLabel(key) {
    const row = sxMarkLabelTable[sxMarkKeyNormalize(key)];
    if (!row) return null;
    return sxIsVanillaSkin() ? row.vanilla : row.kink;
}

function sxMarkLabelFor(key, vanilla) {
    const row = sxMarkLabelTable[sxMarkKeyNormalize(key)];
    if (!row) return null;
    return vanilla ? row.vanilla : row.kink;
}

// Short hover text for map-icon tooltips ("★ marks a Favorite.").
// Built from the table: the symbol, the label, and — for "not interested" /
// "no stake" — the first clause of the tooltip, which is what distinguishes
// it from a hard limit / red line.
function sxMarkHoverText(key) {
    const m = sxMarkLabel(key);
    if (!m) return "";
    if ("notinterested" === sxMarkKeyNormalize(key)) {
        const rest = m.tooltip.replace(/^.*? — /, "").split(". ")[0];
        return m.symbol + " marks " + m.label + ": " + rest + ".";
    }
    return m.symbol + " marks a " + m.label + ".";
}

// Uppercase plural heading for section titles ("HARD LIMITS" / "RED LINES").
// The label is uppercased and pluralized with a trailing S.
function sxMarkHeading(key) {
    const m = sxMarkLabel(key);
    if (!m) return "";
    return m.label.toUpperCase() + "S";
}

function sxMarkHeadingFor(key, vanilla) {
    const m = sxMarkLabelFor(key, vanilla);
    if (!m) return "";
    return m.label.toUpperCase() + "S";
}
