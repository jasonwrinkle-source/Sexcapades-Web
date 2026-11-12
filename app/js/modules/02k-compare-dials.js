        let sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = [], Qt = null, Jt = () => {};
        // Last PURE pair computation per group id (blocker stage,
        // 2026-10-27): the tag-free baseline Rd and sxRefreshGroupOwn
        // diff the pair's live map against. In memory only — declared
        // here, beside the other compare state, so every edit path
        // (zt included) can read it safely.
        const sxPairBase = {};
        const en = new Set, tn = {}, nn = [ "#63c2c8", "#e27786", "#d7bd55", "#8c96df", "#63c796", "#ef9a55", "#cc7fc6", "#79a9cf" ];
        let an = !1;
        // Profiles-data F1: SX_PROFILE_FIELDS is the ONE canonical list of
        // the per-profile data lists (the raw session-state objects keyed
        // by profile id; Ye/Xe are the raw objects behind the vt/wt
        // proxies). Create (import + dialog), edit, close, and the
        // importData re-key move all enumerate THIS list — no lifecycle
        // path keeps a hand-written enumeration of its own. Members, in
        // order: ratings (Ye), rating sources (Ze), name (Xe), uuid
        // (profileUuids), sample flag (sampleProfileFlags), gender (rt),
        // pronouns (pz), sexuality (ot), roles (st), age (lt), location
        // (ct), photos (dt), contact (ut), about (nt), terms (it), veil
        // (vpt), veil-enabled (vht), imported children (at), loader state
        // (gt), completion times (mt), annotations (Qe), fantasy-only
        // (Je), already-tried (et), notes (tt), per-profile colors (tn),
        // comparisons (ft), dirty flags (yt). The legacy nets lists
        // (pt/ht, profileNets/profileNetEnabled) were removed in Fix 1,
        // item 5: no code ever wrote or read an entry in either.
        // Deliberately NOT on this list: droppedKeyRecords — the import
        // path's dropped-key records are import-path behavior, so the
        // import create writes them itself and close/move carry them as
        // documented path extras; and curveBends (bt), whose keys are
        // map-node ids, not profile ids.
        const SX_PROFILE_FIELDS = [ Ye, Ze, Xe, profileUuids, sampleProfileFlags, rt, pz, ot, st, lt, ct, dt, ut, nt, it, vpt, vht, at, gt, mt, Qe, Je, et, tt, tn, ft, yt ];
        // The object-valued subset of SX_PROFILE_FIELDS that the create
        // paths initialize to {} for a fresh profile: ratings, rating
        // sources, annotations, fantasy-only, already-tried, notes,
        // imported children, loader state, completion times.
        const SX_PROFILE_RECORD_LISTS = [ Ye, Ze, Qe, Je, et, tt, at, gt, mt ];
        // SOLVER-METRICS REFACTOR (F2): the layout dials are SINGLE-
        // SOURCED. The shell's early script builds the live dials
        // (window.__SEXCAPADES_LAYOUT) from its baked defaults plus
        // hash / saved overrides, and publishes those same baked
        // defaults as window.__SEXCAPADES_LAYOUT_DEFAULTS. This bundle
        // used to carry a second, hand-maintained fallback literal
        // whose branch lengths had drifted from the shell's (2.7 where
        // the shell governs 4.86, 1.5 where it governs 2.4, whole
        // branches and per-topic lengths missing) — a silent trap:
        // remove the shell object and the map quietly rearranged
        // itself. The fallback below is GENERATED from the single
        // source instead: a deep clone of the shell defaults (a clone,
        // so bundle-side mutation of mn never pollutes the pristine
        // defaults the editor's Reset reads). If neither object
        // exists, the bundle was loaded without its shell — fail
        // loudly rather than lay out a differently-shaped map.
        function sxGeneratedFallbackDials() {
            const src = window.__SEXCAPADES_LAYOUT_DEFAULTS;
            if (!src || "object" != typeof src) throw new Error("layout dials: window.__SEXCAPADES_LAYOUT is absent and the __SEXCAPADES_LAYOUT_DEFAULTS single source is unavailable — the bundle must load after the shell's early layout script");
            return JSON.parse(JSON.stringify(src));
        }
        // SOLVER-METRICS REFACTOR (F6): the ONE tri-state type behind
        // every self-shrink switch. A shrink-map value means:
        //   explicit true  -> "armed"  (the group may shrink itself)
        //   explicit false -> "veto"   (the group must not shrink)
        //   absent / other -> "follow" (follow the global collision
        //                              mode)
        // sxShrinkState(map, key) is the single reader — geometry
        // gates ask it instead of spelling === true / === false at
        // each site. The shell's switches write exactly these three
        // states through ONE parameterized handler (kind x scope):
        // lrShrinkActuator + bindShrinkSwitch + bindShrinkForAll in
        // the layout editor. (The known flip-but-move-nothing switch
        // defect is a SEPARATE fix job, Group 3d — this unification
        // deliberately does not diagnose or fix it; it only makes
        // that fix land in one place.)
        function sxShrinkState(map, key) {
            if (!map) return "follow";
            const v = map[key];
            return v === !0 ? "armed" : v === !1 ? "veto" : "follow";
        }
        // Armed auto-shrink factors (surfaced in the Layout Editor,
        // Build 2026-10-31_1329): the two shipped 0.76 compaction
        // factors — the branch spoke shrinkFactor in the branch
        // radius chain and the subcategory cloud-radius factor in
        // frCollisionPasses — are read through this one reader so
        // the editor's two sliders write the EXISTING factors and
        // nothing else. A settings value that is absent, non-finite,
        // or outside (0, 1] falls back to the shipped 0.76, so an
        // untouched map renders exactly as before. The tri-state is
        // untouched: this reader is only consulted where the state
        // is already "armed".
        function sxArmedFactor(v) {
            const n = Number(v);
            return Number.isFinite(n) && n > 0 && n <= 1 ? n : .76;
        }
        const rn = new Set, on = new Set, sn = new Map, ln = {}, cn = {}, dn = {}, un = new Map, pn = {}, hn = {}, gn = new Set, mn = window.__SEXCAPADES_LAYOUT || sxGeneratedFallbackDials();
