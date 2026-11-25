        const f = Object.freeze([ "Orgasm & reproductive play", "Power exchange", "Service & ritual", "Connection & aftercare", "Psychological dynamics", "Primal & pursuit", "Impact, pain & body modification", "Bondage & restriction", "Sensation & atmosphere", "Body focus & appearance", "Clothing, materials & objects", "Roleplay & identity", "Fantasy & transformation", "Watching, exposure & settings", "Partner configurations", "Positions", "Sex acts", "Fluids & messy play" ]), y = new Map;
        f.forEach((e, t) => {
            h.some(t => t.name === e) && y.set(e, t);
        }), h.forEach(e => {
            y.has(e.name) || y.set(e.name, y.size);
        });
        const b = h.map(e => ({
            name: e.name,
            topics: e.topics.slice()
        })), v = window.__SEXCAPADES_PREVALENCE && "object" == typeof window.__SEXCAPADES_PREVALENCE ? window.__SEXCAPADES_PREVALENCE : {}, w = Object.keys(v).length ? v : V("prevalenceData"), k = window.__SEXCAPADES_POPULARITY_DATA && "object" == typeof window.__SEXCAPADES_POPULARITY_DATA ? window.__SEXCAPADES_POPULARITY_DATA : {}, x = Object.keys(k).length ? k : V("popularityData"), S = Object.freeze({
            joyal: 1516,
            lehmiller: 4175
        }), $ = e => Math.max(0, Number(e) || 0), E = e => Math.log1p(Math.max(0, Number(e) || 0));
        function A(e) {
            return Math.max(0, Math.min(1, e));
        }
        const C = e => {
            const t = Number(e);
            return Number.isFinite(t) ? A(t / 100) : null;
        }, M = e => String(e || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim(), I = Object.freeze({
            "Gender Play": [ "Genderplay" ],
            "Doctor/Nurse Play": [ "Doctor / nurse roleplay" ],
            Clamps: [ "Clamps and Clips" ],
            "Lycra/Spandex": [ "Spandex" ],
            "Suspension Bondage": [ "Suspension" ],
            "Hunter / prey": [ "Predator/prey" ],
            "Biting & scratching": [ "Scratch & bite play" ],
            "Temperature": [ "Wax" ],
            "Electrical Play": [ "Electro sensation" ],
            Cutting: [ "artistic cutting", "decorative cutting" ],
            "Needle Play": [ "Needles & piercing", "Play Piercing", "Piercings" ],
            "Rope bondage": [ "Japanese bondage", "Hojojutsu", "Hemp Rope", "Decorative rope" ],
            Corsets: [ "Corsetry", "Corset Training", "Corset Cinching" ],
            "Body Modification": [ "Tattoos", "Tattoo & body modification focus" ],
            "Spiritual play": [ "Sex Magick", "Sacred Sexuality", "Spiritual BDSM" ],
            "Vintage Porn": [ "Victorian Pornography" ],
            Depilation: [ "Depilation/Shaving" ],
            Smoking: [ "Cigars" ]
        }), P = x.fetlife?.values || {}, L = x.fetlife?.aliases || {}, T = x.survey?.values || {}, F = new Map(Object.entries(P).map(([e, t]) => [ M(e), Number(t) ]));
        /* ===== Community snapshot check-before-accepting (Rank 3, 2026-10-30) =====
           A community snapshot is a frozen bundle of aggregated community
           rating counts per topic: the embedded survey block in
           popularityData (x.survey) and, when a host injects one, the
           window.__SEXCAPADES_COMMUNITY_POPULARITY override read by
           sxCommunityVal below. Either presentation is ONE O6 source
           (the "community" entry in q). Before either is accepted into
           the aggregate, this gate verifies (a) provenance, using only
           the fields the snapshot format already carries — generation
           (captured, as on the survey/reddit blocks and the popularity
           bundle itself) and identity (sampleSize, as on the survey
           block, or source, as on the prevalence entries) — and
           (b) that it does not include failed imports, using only the
           failed-import accounting the format already carries: a
           snapshot-level failed-import count, or a per-topic entry
           flagged as a failed import. No new snapshot format, no
           signature, and no new provenance field is invented here.
           Outcomes: an empty snapshot (the shipped state: no values)
           is nothing to accept and warns about nothing; a snapshot
           whose provenance is missing/unverifiable, or that carries a
           snapshot-level failed-import count, is refused whole — the
           community source then contributes nothing, exactly as if no
           snapshot had been supplied, and a visible banner states the
           reason; a snapshot whose only failed imports are separable
           per-topic entries is accepted with those entries excluded
           and a visible banner naming what was excluded. A sound
           snapshot is accepted with its values object passed through
           untouched: no count, weight, prior, or kinkiness math below
           changes. Nothing previously excluded is re-included: a
           refused or excluded entry never reaches H. The banner follows
           the existing boot-restore/save-error pattern in the shell
           (role="alert" aside, dismiss button, detail in the message),
           and the check result is exposed on
           window.__sxCommunitySnapshot for inspection. The gate runs
           once per snapshot (once for the embedded block; once per
           distinct override object, and again whenever an override
           object's gate-relevant content changes in place, so a
           snapshot injected or mutated after load is still checked
           before its next read). */
        function sxSnapHasText(v) {
            return ("string" == typeof v && v.trim().length > 0) || Number.isFinite(v);
        }
        function sxSnapFailedTotal(obj) {
            if (!obj || "object" != typeof obj) return { count: 0, field: null };
            const fields = [ "failedImports", "failedImportCount", "failedSubmissions", "failedCount", "importFailures" ];
            for (let k = 0; k < fields.length; k++) {
                const v = obj[fields[k]];
                const n = Array.isArray(v) ? v.length : Number(v);
                if (Number.isFinite(n) && n > 0) return { count: n, field: fields[k] };
            }
            return { count: 0, field: null };
        }
        function sxSnapEntryFailed(v) {
            return !!(v && "object" == typeof v && (v.failed === !0 || v.importFailed === !0 || v.failedImport === !0 || "failed" === v.status || "failed" === v.importStatus));
        }
        function sxSnapProvenanceMissing(prov) {
            const missing = [];
            if (!sxSnapHasText(prov && prov.captured)) missing.push("generation date (captured)");
            if (!(Number.isFinite(Number(prov && prov.sampleSize)) && Number(prov.sampleSize) > 0) && !sxSnapHasText(prov && prov.source)) missing.push("identity (sampleSize or source)");
            return missing;
        }
        function sxGateCommunitySnapshot(kind, values, prov, failedSrc) {
            const keys = values && "object" == typeof values ? Object.keys(values) : [];
            const base = { kind, status: "empty", accepted: !1, values: null, reasons: [], excluded: [], failedCount: 0, topicCount: 0 };
            if (!keys.length) return base;
            const failed = sxSnapFailedTotal(failedSrc || prov || {});
            const missing = sxSnapProvenanceMissing(prov);
            const excluded = [], kept = {};
            keys.forEach(k => { if (sxSnapEntryFailed(values[k])) excluded.push(k); else kept[k] = values[k]; });
            const reasons = [];
            if (failed.count > 0) reasons.push("includes " + failed.count + " failed import" + (1 === failed.count ? "" : "s") + " (" + failed.field + ") — failed-import submissions are excluded from O6, so the snapshot was not accepted");
            if (missing.length) reasons.push("missing provenance: " + missing.join("; ") + " — the snapshot could not be verified, so it was not accepted");
            if (excluded.length && !Object.keys(kept).length) reasons.push("every topic entry (" + excluded.length + ") is flagged as a failed import — the snapshot was not accepted");
            if (reasons.length) return Object.assign({}, base, { status: "refused", failedCount: failed.count, excluded, reasons });
            if (excluded.length) return Object.assign({}, base, { status: "accepted-excluded", accepted: !0, values: kept, topicCount: Object.keys(kept).length, excluded, reasons: [ "excluded " + excluded.length + " failed-import topic" + (1 === excluded.length ? "" : "s") + ": " + excluded.join(", ") ] });
            return Object.assign({}, base, { status: "accepted", accepted: !0, values, topicCount: keys.length });
        }
        function sxSnapshotBannerId(kind) {
            return "sxCommunitySnapshotWarning-" + String(kind || "snapshot").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        }
        function sxShowCommunitySnapshotWarning(title, message, kind) {
            try {
                if (typeof __sxErrLog === "function") __sxErrLog("community-snapshot", new Error(title + ": " + message));
                if (!document || !document.body) return;
                const prev = document.getElementById(sxSnapshotBannerId(kind));
                if (prev) {
                    const msg = prev.querySelector("[data-sx-snapshot-message]");
                    if (msg) msg.textContent = message;
                    const head = prev.querySelector("[data-sx-snapshot-title]");
                    if (head) head.textContent = title;
                    return;
                }
                const banner = document.createElement("aside");
                banner.id = sxSnapshotBannerId(kind);
                banner.setAttribute("role", "alert");
                banner.setAttribute("aria-live", "assertive");
                banner.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483647;width:min(680px,calc(100vw - 24px));box-sizing:border-box;background:#4b171b;color:#fff;border:2px solid #ff9a9a;border-radius:10px;padding:16px 48px 16px 18px;box-shadow:0 12px 36px rgba(0,0,0,.58);font:600 16px/1.45 'Source Sans 3',system-ui,sans-serif;";
                const head = document.createElement("strong");
                head.setAttribute("data-sx-snapshot-title", "");
                head.style.cssText = "display:block;font-size:20px;margin-bottom:4px;";
                head.textContent = title;
                const body = document.createElement("span");
                body.setAttribute("data-sx-snapshot-message", "");
                body.textContent = message;
                const close = document.createElement("button");
                close.type = "button";
                close.setAttribute("aria-label", "Dismiss community snapshot warning");
                close.textContent = "×";
                close.style.cssText = "position:absolute;top:8px;right:10px;border:0;background:transparent;color:#fff;font:700 28px/1 system-ui,sans-serif;cursor:pointer;padding:4px 8px;";
                close.addEventListener("click", function () { banner.remove(); });
                banner.appendChild(head);
                banner.appendChild(body);
                banner.appendChild(close);
                document.body.appendChild(banner);
                close.focus({ preventScroll: !0 });
            } catch (err) { if (typeof __sxErrLog === "function") __sxErrLog("community-snapshot-warning", err); }
        }
        function sxReportCommunitySnapshot(result) {
            if (!result) return;
            // One banner per snapshot kind, so the embedded and override
            // reports never overwrite each other; a kind whose latest
            // result is clean (accepted/empty) has its own banner
            // removed, so a stale refusal cannot outlive a re-gate.
            if ("refused" === result.status) sxShowCommunitySnapshotWarning("Community snapshot not accepted", "The community snapshot (" + result.kind + ") was not accepted into the community aggregate. " + result.reasons.join(" ") + " Community counts fall back to the other O6 sources and priors; nothing from this snapshot was used.", result.kind);
            else if ("accepted-excluded" === result.status) sxShowCommunitySnapshotWarning("Community snapshot accepted with exclusions", "The community snapshot (" + result.kind + ") was accepted with exclusions. " + result.reasons.join(" ") + " All other topics from the snapshot were used unchanged.", result.kind);
            else try { const el = document && document.getElementById(sxSnapshotBannerId(result.kind)); if (el) el.remove(); } catch (err) { if (typeof __sxErrLog === "function") __sxErrLog("community-snapshot-warning", err); }
        }
        const sxCommunitySnapshotStatus = { embedded: null, override: null };
        window.__sxCommunitySnapshot = sxCommunitySnapshotStatus;
        const sxEmbeddedSnapshot = sxGateCommunitySnapshot("embedded survey", T, { captured: (x.survey && x.survey.captured) || x.captured, sampleSize: x.survey && x.survey.sampleSize, source: x.survey && x.survey.source }, x.survey || {});
        sxCommunitySnapshotStatus.embedded = sxEmbeddedSnapshot;
        sxReportCommunitySnapshot(sxEmbeddedSnapshot);
        const sxSurveyValues = sxEmbeddedSnapshot.accepted && sxEmbeddedSnapshot.values ? sxEmbeddedSnapshot.values : {};
        const sxOverrideReserved = [ "captured", "sampleSize", "source", "confidence", "failedImports", "failedImportCount", "failedSubmissions", "failedCount", "importFailures" ];
        let sxOverrideCache = { ref: null, fingerprint: null, result: null };
        function sxOverrideFingerprint(g) {
            // Gate-relevant content only: provenance, failed-import
            // accounting, the topic-key set, and each entry's value,
            // sampleSize, and failed flags. A snapshot mutated in place
            // changes this fingerprint and is re-gated; an untouched
            // snapshot keeps its cached result.
            const parts = [ String(g.captured || ""), String(g.sampleSize || ""), String(g.source || ""), String(g.failedImports || ""), String(g.failedImportCount || ""), String(g.failedSubmissions || ""), String(g.failedCount || ""), Array.isArray(g.importFailures) ? g.importFailures.length : String(g.importFailures || "") ];
            const values = g.values && "object" == typeof g.values && !Array.isArray(g.values) ? g.values : g;
            Object.keys(values).sort().forEach(k => {
                if (sxOverrideReserved.indexOf(k) >= 0 && values === g) return;
                const v = values[k];
                parts.push(k + "=" + (v && "object" == typeof v ? [ v.value, v.sampleSize, v.failed, v.importFailed, v.failedImport, v.status, v.importStatus ].join(",") : String(v)));
            });
            return parts.join("|");
        }
        function sxCheckedOverrideSnapshot(g) {
            const fingerprint = sxOverrideFingerprint(g);
            if (sxOverrideCache.ref === g && sxOverrideCache.fingerprint === fingerprint) return sxOverrideCache.result;
            let values = g, prov = { captured: g.captured, sampleSize: g.sampleSize, source: g.source };
            if (g.values && "object" == typeof g.values && !Array.isArray(g.values)) values = g.values;
            else {
                const plain = {};
                Object.keys(g).forEach(k => { if (sxOverrideReserved.indexOf(k) < 0) plain[k] = g[k]; });
                values = plain;
            }
            const result = sxGateCommunitySnapshot("override", values, prov, g);
            sxCommunitySnapshotStatus.override = result;
            sxReportCommunitySnapshot(result);
            sxOverrideCache = { ref: g, fingerprint, result };
            return result;
        }
        function N(e, t = e => e) {
            const n = e.map(Number).filter(Number.isFinite).map(t);
            return n.length ? {
                min: Math.min(...n),
                max: Math.max(...n)
            } : {
                min: 0,
                max: 0
            };
        }
        const _ = e => Math.log1p(Math.max(0, Number(e) || 0)), D = N(Object.values(P), _), R = N(Object.values(sxSurveyValues).map(e => "object" == typeof e ? e.value : e));
        function O(e, t, n = e => e) {
            const i = Number(e);
            if (!Number.isFinite(i)) return null;
            const a = n(i), r = t.max - t.min;
            return r > 0 ? A((a - t.min) / r) : .5;
        }
        function B(e) {
            const t = F.get(M(e)), n = function(e, t) {
                const n = (e || []).map(e => t.get(M(e).replace(/^r /, ""))).filter(Number.isFinite);
                return n.length ? Math.max(...n) : null;
            }([ ...L[e] || [], ...I[e] || [] ], F), i = [ t, n ].filter(Number.isFinite);
            return i.length ? Math.max(...i) : null;
        }
        function j(e) {
            const t = [ e, ...I[e] || [] ].map(e => sxSurveyValues[e]).filter(e => null != e).sort((e, t) => Number(("object" == typeof t ? t.value : t) || 0) - Number(("object" == typeof e ? e.value : e) || 0))[0];
            if (null == t) return null;
            const n = "object" == typeof t ? Object.assign({}, t) : {
                value: t
            };
            return n.sampleSize = Math.max(0, Number(n.sampleSize) || Number(x.survey?.sampleSize) || 0), 
            n;
        }
        /* ===== O6 aggregated popularity (ruled 2026-10-29 17:11-17:30) =====
           Popularity = prevalence, aggregated per topic over ONLY the sources
           that have data for that topic (ignore-missing, ruled 17:30), weights
           renormalised over the present sources. Source weight = ln(sample
           size or count) x representativeness factor: anchors (Joyal 2015
           n=1,516; Lehmiller 2018 n=4,175) at 1.0, discounted sources
           (FetLife, Reddit, community ratings/survey merged into ONE source)
           at 0.5. Literature priors are provisional: the existing ordinal
           prior bands (PRIORS table, 403 topics) mapped to band centres and
           carried at a log-scale weight on the same scale as the data
           (ruled 2026-10-29): prior weight = 0.5 x ln(5) ≈ 0.80, factor
           0.5 like the discounted sources, replacing the fixed weight 5 —
           so a topic with no source data
           at all falls back to its prior alone, and a FetLife-only topic
           reads about 10% prior share, not 41%. Failed-import submissions are
           excluded entirely (import-engine maintenance only). Kinkiness =
           1 - popularity. This aggregate IS the Popularity List sort key
           (H below), replacing the old raw-size-weighted H. */
        const SX_O6_PRIORS = {"byId":{"t0002":0.35,"t0003":0.35,"t0004":0.35,"t0005":0.55,"t0006":0.55,"t0007":0.35,"t0008":0.35,"t0009":0.55,"t0010":0.55,"t0011":0.55,"t0012":0.55,"t0013":0.55,"t0014":0.55,"t0015":0.35,"t0016":0.35,"t0017":0.35,"t0018":0.35,"t0019":0.35,"t0020":0.35,"t0021":0.175,"t0022":0.55,"t0023":0.35,"t0024":0.175,"t0025":0.55,"t0026":0.35,"t0027":0.175,"t0028":0.35,"t0029":0.35,"t0030":0.35,"t0031":0.175,"t0032":0.35,"t0033":0.35,"t0034":0.55,"t0035":0.35,"t0036":0.35,"t0037":0.55,"t0038":0.175,"t0039":0.095,"t0040":0.35,"t0041":0.095,"t0042":0.35,"t0043":0.35,"t0044":0.35,"t0045":0.175,"t0046":0.35,"t0047":0.55,"t0048":0.35,"t0049":0.175,"t0050":0.35,"t0051":0.55,"t0052":0.35,"t0053":0.55,"t0054":0.095,"t0055":0.175,"t0056":0.55,"t0057":0.35,"t0058":0.55,"t0059":0.55,"t0060":0.55,"t0061":0.35,"t0062":0.55,"t0063":0.175,"t0064":0.55,"t0065":0.35,"t0066":0.35,"t0067":0.35,"t0068":0.35,"t0069":0.35,"t0070":0.35,"t0071":0.35,"t0072":0.35,"t0073":0.35,"t0074":0.35,"t0075":0.175,"t0076":0.175,"t0077":0.095,"t0078":0.095,"t0079":0.095,"t0080":0.03,"t0081":0.175,"t0082":0.35,"t0083":0.35,"t0084":0.55,"t0085":0.35,"t0086":0.35,"t0087":0.175,"t0088":0.175,"t0089":0.175,"t0090":0.175,"t0091":0.175,"t0092":0.175,"t0093":0.55,"t0094":0.175,"t0095":0.55,"t0096":0.35,"t0097":0.175,"t0098":0.35,"t0099":0.35,"t0100":0.55,"t0101":0.55,"t0102":0.35,"t0103":0.55,"t0104":0.35,"t0105":0.35,"t0106":0.35,"t0107":0.35,"t0108":0.35,"t0109":0.35,"t0110":0.35,"t0111":0.35,"t0112":0.35,"t0113":0.35,"t0114":0.35,"t0115":0.35,"t0116":0.175,"t0117":0.175,"t0118":0.175,"t0119":0.175,"t0120":0.03,"t0121":0.35,"t0122":0.35,"t0123":0.35,"t0124":0.175,"t0125":0.35,"t0126":0.35,"t0127":0.55,"t0128":0.55,"t0129":0.55,"t0130":0.35,"t0131":0.55,"t0132":0.095,"t0133":0.35,"t0134":0.35,"t0135":0.35,"t0136":0.35,"t0137":0.35,"t0138":0.175,"t0139":0.175,"t0140":0.35,"t0141":0.35,"t0142":0.35,"t0143":0.175,"t0144":0.175,"t0145":0.175,"t0146":0.35,"t0147":0.175,"t0148":0.095,"t0149":0.35,"t0150":0.35,"t0151":0.35,"t0152":0.55,"t0153":0.55,"t0154":0.175,"t0155":0.175,"t0156":0.175,"t0157":0.35,"t0158":0.35,"t0159":0.175,"t0160":0.55,"t0161":0.095,"t0162":0.175,"t0163":0.35,"t0164":0.35,"t0165":0.175,"t0166":0.55,"t0167":0.55,"t0168":0.35,"t0169":0.095,"t0170":0.55,"t0171":0.175,"t0172":0.35,"t0173":0.175,"t0174":0.35,"t0175":0.55,"t0176":0.35,"t0177":0.55,"t0178":0.35,"t0179":0.175,"t0180":0.175,"t0181":0.55,"t0182":0.55,"t0183":0.55,"t0184":0.55,"t0185":0.35,"t0186":0.35,"t0187":0.175,"t0188":0.55,"t0189":0.175,"t0190":0.35,"t0191":0.35,"t0192":0.35,"t0193":0.35,"t0194":0.35,"t0195":0.175,"t0196":0.35,"t0197":0.35,"t0198":0.095,"t0199":0.35,"t0200":0.095,"t0201":0.35,"t0202":0.35,"t0203":0.175,"t0204":0.35,"t0205":0.55,"t0206":0.175,"t0207":0.175,"t0208":0.35,"t0209":0.35,"t0210":0.35,"t0211":0.35,"t0212":0.35,"t0213":0.55,"t0214":0.35,"t0215":0.55,"t0216":0.35,"t0217":0.35,"t0218":0.55,"t0219":0.55,"t0220":0.55,"t0221":0.35,"t0222":0.35,"t0223":0.35,"t0224":0.35,"t0225":0.35,"t0226":0.35,"t0227":0.175,"t0228":0.35,"t0229":0.55,"t0230":0.35,"t0231":0.35,"t0232":0.35,"t0233":0.55,"t0234":0.35,"t0235":0.35,"t0236":0.35,"t0237":0.35,"t0238":0.175,"t0239":0.35,"t0240":0.35,"t0241":0.35,"t0242":0.35,"t0243":0.35,"t0244":0.35,"t0245":0.35,"t0246":0.35,"t0247":0.175,"t0248":0.35,"t0249":0.35,"t0250":0.35,"t0251":0.35,"t0252":0.55,"t0253":0.35,"t0254":0.35,"t0255":0.175,"t0256":0.35,"t0257":0.55,"t0258":0.35,"t0259":0.55,"t0260":0.55,"t0261":0.35,"t0262":0.35,"t0263":0.55,"t0264":0.55,"t0265":0.03,"t0266":0.55,"t0267":0.35,"t0268":0.35,"t0269":0.55,"t0270":0.55,"t0271":0.55,"t0272":0.55,"t0273":0.35,"t0274":0.35,"t0275":0.35,"t0276":0.35,"t0277":0.35,"t0278":0.55,"t0279":0.35,"t0280":0.35,"t0281":0.55,"t0282":0.35,"t0283":0.175,"t0284":0.55,"t0285":0.35,"t0286":0.55,"t0287":0.55,"t0288":0.55,"t0289":0.35,"t0290":0.55,"t0291":0.55,"t0292":0.35,"t0293":0.55,"t0294":0.55,"t0295":0.35,"t0296":0.55,"t0297":0.55,"t0298":0.55,"t0299":0.35,"t0300":0.175,"t0301":0.35,"t0302":0.55,"t0303":0.55,"t0304":0.55,"t0305":0.55,"t0306":0.55,"t0307":0.55,"t0308":0.175,"t0309":0.35,"t0310":0.35,"t0311":0.35,"t0312":0.175,"t0313":0.175,"t0314":0.35,"t0315":0.55,"t0316":0.55,"t0317":0.55,"t0318":0.55,"t0319":0.55,"t0320":0.55,"t0321":0.55,"t0322":0.55,"t0323":0.35,"t0324":0.35,"t0325":0.175,"t0326":0.55,"t0327":0.55,"t0328":0.55,"t0329":0.55,"t0330":0.55,"t0331":0.55,"t0332":0.175,"t0333":0.095,"t0334":0.55,"t0335":0.55,"t0336":0.55,"t0337":0.175,"t0338":0.175,"t0339":0.35,"t0340":0.175,"t0341":0.35,"t0342":0.55,"t0343":0.35,"t0344":0.35,"t0345":0.35,"t0346":0.35,"t0347":0.175,"t0348":0.095,"t0349":0.35,"t0350":0.095,"t0351":0.35,"t0352":0.35,"t0353":0.35,"t0354":0.55,"t0355":0.55,"t0356":0.35,"t0357":0.35,"t0358":0.35,"t0359":0.55,"t0360":0.35,"t0361":0.35,"t0362":0.35,"t0363":0.35,"t0364":0.35,"t0365":0.35,"t0366":0.35,"t0367":0.175,"t0368":0.55,"t0369":0.35,"t0370":0.35,"t0371":0.35,"t0372":0.35,"t0373":0.095,"t0374":0.175,"t0375":0.55,"t0376":0.55,"t0377":0.55,"t0378":0.35,"t0379":0.35,"t0380":0.35,"t0381":0.175,"t0382":0.175,"t0383":0.175,"t0384":0.35,"t0385":0.175,"t0386":0.35,"t0387":0.55,"t0388":0.55,"t0389":0.35,"t0390":0.35,"t0391":0.35,"t0392":0.35,"t0393":0.35,"t0394":0.175,"t0395":0.095,"t0396":0.55,"t0397":0.55,"t0398":0.55,"t0399":0.35,"t0400":0.35,"t0401":0.35,"t0402":0.35,"t0403":0.35,"t0404":0.55},"byLabel":{"protocols and rules":0.35,"collars and symbols":0.35,"reward and correction":0.35,"discipline":0.55,"begging":0.55,"scene based roles":0.35,"ongoing dynamics":0.35,"femdom":0.55,"d s":0.55,"ordered to masturbate":0.55,"brats":0.55,"24 7":0.55,"switching":0.55,"male authority":0.35,"behavior modification":0.35,"female supremacy":0.35,"play punishment":0.35,"bathroom use control":0.35,"domestic discipline":0.35,"pro domme":0.175,"rope bondage":0.55,"scarf bondage":0.35,"hair bondage":0.175,"cuffs and straps":0.55,"cuffs":0.55,"spreaders and bars":0.35,"spreaders":0.35,"medieval devices":0.175,"armbinders":0.35,"bondage tape":0.35,"duct tape":0.35,"cling film":0.175,"mummification":0.35,"tape and wrapping":0.35,"tape":0.35,"blindfolded restraint":0.55,"blindfold":0.55,"gags":0.35,"speech restriction":0.35,"caging confinement":0.55,"caging":0.55,"encasement fetish":0.175,"encasement":0.175,"sleepsacks":0.095,"immobilization":0.35,"crucifixion play":0.095,"crucifixion":0.095,"furniture restraint":0.35,"furniture":0.35,"suspension bondage":0.35,"predicament bondage":0.35,"escape play":0.175,"breast bondage":0.35,"anal hooks":0.55,"self bondage":0.35,"waterbondage":0.175,"bondage art":0.35,"pain":0.55,"corporal punishment":0.35,"impact play":0.55,"percussion play":0.095,"pressure points":0.175,"spanking":0.55,"hand spanking":0.55,"otk spanking":0.35,"breast spanking":0.55,"clit spanking":0.55,"pussy spanking":0.55,"tit slapping":0.35,"flogging":0.55,"fire flogging":0.175,"whips":0.55,"belt whippings":0.35,"breast whipping":0.35,"caning":0.35,"riding crops":0.35,"paddles and straps":0.35,"clamps":0.35,"clothespins":0.35,"pinching":0.35,"cutting":0.35,"needle play":0.35,"corset piercing":0.175,"scarification":0.175,"staples":0.095,"fish hooks":0.095,"flesh hooks":0.095,"cell popping":0.03,"ball kicking":0.175,"ballbusting":0.35,"cock slapping":0.35,"cock and ball torture":0.55,"fire play":0.35,"knife play":0.35,"waterboarding":0.175,"figging":0.175,"sounding":0.175,"trampling":0.175,"kicking":0.175,"bastinado":0.175,"hair pulling":0.55,"abrasion play":0.175,"bruises":0.55,"heavy marking":0.35,"extreme endurance":0.175,"wax and temperature":0.35,"ice and cool touch":0.35,"tickling":0.55,"electrical play":0.55,"texture contrast":0.35,"sensory deprivation":0.55,"sensory overload":0.35,"asmr and whispering":0.35,"music and sound":0.35,"mirrors":0.35,"low light":0.35,"scent":0.35,"tantra energy play":0.35,"violet wand":0.35,"wartenberg pinwheels":0.35,"panty sniffing":0.35,"tens unit":0.35,"smothering":0.35,"cupping":0.175,"auralism":0.175,"vampire gloves":0.175,"smoking":0.175,"formiphilia":0.03,"abdl":0.35,"ddlg":0.35,"age play between adults":0.35,"age play":0.35,"infantilism":0.175,"caregiver roles adults":0.35,"caregiver":0.35,"mommy girl":0.35,"authority roles":0.55,"teacher student roleplay":0.55,"teacher student":0.55,"doctor nurse play":0.55,"doctor nurse":0.55,"medical play":0.35,"owner and property":0.55,"owner property":0.55,"gor":0.095,"captivity kidnapping":0.35,"kidnapping":0.35,"consensual non consent fantasy":0.35,"cnc fantasy":0.35,"damsels in distress":0.35,"damsels":0.35,"pet play":0.35,"pet":0.35,"puppy play":0.35,"puppy":0.35,"pony play":0.175,"piggy play":0.175,"creature fantasy":0.35,"1950s household":0.35,"1950s":0.35,"historical fantasy":0.35,"historical":0.35,"pirates":0.175,"victorian lifestyles":0.175,"victorian":0.175,"superheroes":0.175,"vampires and gothic":0.35,"vampires":0.35,"clowns":0.175,"robots":0.095,"dollification":0.35,"librarians":0.35,"sister brother roleplay":0.35,"siblings":0.35,"latex and rubber":0.55,"leather":0.55,"pvc":0.175,"vinyl":0.175,"metal":0.175,"satin":0.35,"silk":0.35,"velvet":0.175,"lace":0.55,"denim":0.095,"fur":0.175,"lycra spandex":0.35,"nylonlegs and feet":0.35,"nylon":0.35,"boot":0.175,"heels and boots":0.55,"high heels":0.55,"pumps":0.35,"retifism":0.095,"knee high socks":0.55,"socks":0.175,"business suits":0.35,"military":0.175,"military uniforms":0.35,"schoolgirl uniform":0.55,"uniforms":0.35,"cosplay":0.55,"costume transformation":0.35,"geisha":0.175,"steampunk":0.175,"lingerie and stockings":0.55,"fishnets":0.55,"pantyhose stockings":0.55,"corsets":0.55,"diapers":0.35,"sissy panties":0.35,"petticoats":0.175,"skirts":0.55,"gas masks":0.175,"hoods":0.35,"masks and hoods":0.35,"costume masks":0.35,"glasses":0.35,"anal beads":0.35,"glass dildos":0.35,"inflatables":0.175,"harnesses":0.35,"gloves":0.35,"chaps":0.095,"kilts":0.35,"zentai":0.095,"hands":0.35,"hands and gloves":0.35,"hair":0.175,"long hair":0.35,"pigtails":0.55,"bald girls":0.175,"head shaving":0.175,"facial hair":0.35,"beards":0.35,"body hair":0.35,"pubic hair":0.35,"depilation":0.35,"feet and footwear":0.55,"feet":0.55,"toes and feet":0.35,"toes":0.35,"foot worship":0.55,"boot worship":0.35,"legs":0.35,"buttocks":0.55,"big tits":0.55,"breasts":0.55,"large labia":0.35,"pregnancy focus":0.35,"makeup":0.35,"lipstick":0.35,"freckles":0.35,"armpits":0.35,"braces":0.175,"tongues":0.35,"bbw":0.55,"bbc":0.35,"muscles":0.35,"older men":0.35,"older women":0.55,"size contrast":0.35,"uncut cock":0.35,"body modification":0.35,"body worship":0.35,"muscle worship":0.175,"degradation":0.35,"humiliation language":0.35,"female humiliation":0.35,"small penis humiliation":0.35,"sph humiliation":0.35,"objectification":0.35,"fear":0.35,"fear play":0.35,"interrogation":0.35,"military interrogation":0.175,"hypnosis and mind control fantasy":0.35,"hypnosis":0.35,"mind fucks":0.35,"mental bondage":0.35,"emotional sadism":0.35,"sadism":0.55,"affectionate cruelty":0.35,"crying":0.35,"dacryphilia":0.175,"tears":0.35,"tearing off clothing":0.55,"anticipation and suspense":0.35,"trust":0.55,"attention":0.55,"blushing":0.35,"confession and secrets":0.35,"dirty talk":0.55,"praise in scene":0.55,"praise":0.55,"graphoerotica":0.03,"watching and being watched":0.55,"private photo and video":0.35,"performance for a partner":0.35,"public and outdoor play":0.55,"exhibition voyeurism":0.55,"sexting":0.55,"burlesque":0.55,"sex in the cemetery":0.35,"pin ups":0.35,"fetish models":0.35,"vintage porn":0.35,"bellydancing":0.35,"threesomes":0.55,"group encounters":0.35,"swinging":0.35,"cuckold hotwife":0.55,"polyamory with kink":0.35,"group service":0.175,"gangbang":0.55,"age gap":0.35,"fmf threesomes":0.55,"interracial sex":0.55,"hotwife":0.55,"cuckold humiliation":0.35,"morning sex":0.55,"oral sex":0.55,"facefucking":0.35,"facesitting":0.55,"rimming":0.55,"fingering mouths":0.35,"mouth fingering":0.35,"road head":0.55,"anal sex":0.55,"anal training":0.55,"anal fingering":0.35,"anal fisting":0.175,"pegging":0.35,"handjobs":0.55,"mutual masturbation":0.55,"vaginal fingering":0.55,"nipple play":0.55,"penetration":0.55,"fucking machines":0.55,"large objects":0.175,"vaginal stretching":0.35,"vaginal fisting":0.35,"fisting":0.35,"vacuum pumping":0.35,"urethral fucking":0.175,"catheters":0.175,"facials":0.35,"creampies":0.55,"squirting":0.55,"69":0.55,"cowgirl":0.55,"doggystyle":0.55,"missionary":0.55,"reverse cowgirl":0.55,"spooning":0.55,"standing up":0.35,"queening":0.35,"gorean slave positions":0.175,"orgasm control":0.55,"orgasm denial":0.55,"chastity":0.55,"edging":0.55,"teasing":0.55,"breeding pregnancy fantasy":0.55,"surrogacy fantasy":0.175,"oviposition fantasy":0.095,"edge play":0.55,"cock milking":0.55,"tease and denial":0.55,"anal chastity":0.175,"watersports":0.175,"lactation":0.35,"blood play":0.175,"spit":0.35,"enemas":0.55,"breastfeeding":0.35,"creampie cleanup":0.35,"toilet slave":0.35,"liquor":0.35,"douching":0.175,"nyotaimori":0.095,"chocolate":0.35,"klismaphilia":0.095,"hunter prey":0.35,"chase scenes":0.35,"wrestling and struggle":0.35,"biting and scratching":0.55,"being overpowered":0.55,"manhandling":0.35,"pursuit take down and capture":0.35,"primal":0.35,"acts of service":0.55,"domestic service":0.35,"formal etiquette":0.35,"grooming rituals":0.35,"dressing a partner":0.35,"permission rituals":0.35,"daily tasks":0.35,"ceremonial scenes":0.35,"spiritual play":0.175,"foot massage":0.55,"domestic servitude":0.35,"french maids":0.35,"maid":0.35,"crawling":0.35,"boot blacking":0.095,"religious play":0.175,"romantic surrender":0.55,"seduction scenarios":0.55,"strangers fantasy":0.55,"secret identity":0.35,"mythical creatures":0.35,"aliens":0.35,"growth shrinking fantasy":0.175,"body swapping fantasy":0.175,"furry transformation fantasy":0.175,"gender play":0.35,"crossdressing":0.175,"sissification":0.35,"celebrity fantasy":0.55,"erotic literature":0.55,"anime":0.35,"hentai":0.35,"writing erotica":0.35,"transvestism":0.35,"androgyny":0.35,"butches":0.175,"psycholagny":0.095,"verbal check ins":0.55,"cuddling and touch":0.55,"food and hydration":0.55,"quiet decompression":0.35,"praise aftercare":0.35,"post scene review":0.35,"space and solitude":0.35,"next day check in":0.35,"affection":0.55}};
        const SX_O6_PRIOR_W = .5 * Math.log(5), SX_O6_LN_JOYAL = Math.log(1516), SX_O6_LN_LEHMILLER = Math.log(4175);
        function sxO6Prior(e) {
            // Prior resolved by topic id first: the label table misses
            // topics whose catalog label has no byLabel entry (e.g.
            // "Medieval"), while byId holds a prior for every topic.
            // Label lookup below is the fallback for non-catalog labels.
            const id = topicIdByLabel[String(e || "")];
            if (id) { const byId = SX_O6_PRIORS.byId[id]; if (Number.isFinite(byId)) return byId; }
            const v = SX_O6_PRIORS.byLabel[M(e)];
            if (Number.isFinite(v)) return v;
            const alts = I[e] || [];
            for (let k = 0; k < alts.length; k++) { const w = SX_O6_PRIORS.byLabel[M(alts[k])]; if (Number.isFinite(w)) return w; }
            return null;
        }
        const SX_REDDIT_VALUES = (x.reddit && x.reddit.values) || {}, SX_REDDIT_RANGE = N(Object.values(SX_REDDIT_VALUES).map(v => "object" == typeof v ? v.value : v));
        function sxRedditVal(e) {
            const t = [ e, ...I[e] || [] ].map(k => SX_REDDIT_VALUES[k]).filter(v => null != v).sort((a, b) => Number(("object" == typeof b ? b.value : b) || 0) - Number(("object" == typeof a ? a.value : a) || 0))[0];
            if (null == t) return null;
            const n = "object" == typeof t ? Object.assign({}, t) : { value: t };
            return n.sampleSize = Math.max(0, Number(n.sampleSize) || Number(x.reddit && x.reddit.sampleSize) || 0), n;
        }
        function sxCommunityVal(e) {
            const g = window.__SEXCAPADES_COMMUNITY_POPULARITY;
            if (g && "object" == typeof g) {
                const checked = sxCheckedOverrideSnapshot(g);
                if (checked && checked.accepted && checked.values) {
                    const t = [ e, ...I[e] || [] ].map(k => checked.values[k]).filter(v => null != v)[0];
                    if (null != t) { const n = "object" == typeof t ? Object.assign({}, t) : { value: t }; n.sampleSize = Math.max(0, Number(n.sampleSize) || 0); return n; }
                }
            }
            return j(e);
        }
        function ho(e, t) {
            return [ e, ...I[e] || [] ].map(e => w[e]).find(e => e && Number.isFinite(Number(e.pct)) && (/lehmiller/i.test(e.source || "") ? "lehmiller" : "joyal") === t) || null;
        }
        const q = Object.freeze([ {
            id: "fetlife",
            value: e => B(e),
            normalize: e => O(e, D, _),
            weight: e => .5 * E(e)
        }, {
            id: "joyal",
            value: e => ho(e, "joyal"),
            normalize: e => C(e && e.pct),
            weight: e => e ? SX_O6_LN_JOYAL : 0
        }, {
            id: "lehmiller",
            value: e => ho(e, "lehmiller"),
            normalize: e => C(e && e.pct),
            weight: e => e ? SX_O6_LN_LEHMILLER : 0
        }, {
            id: "reddit",
            value: e => sxRedditVal(e),
            normalize: e => O(e && e.value, SX_REDDIT_RANGE),
            weight: e => .5 * Math.log(Math.max(1, Number(e && e.sampleSize) || Number(e && e.value) || 0))
        }, {
            id: "community",
            value: e => sxCommunityVal(e),
            normalize: e => O(e && e.value, R),
            weight: e => .5 * Math.log(Math.max(1, Number(e && e.sampleSize) || 0))
        }, {
            id: "priors",
            value: e => sxO6Prior(e),
            normalize: e => Number.isFinite(e) ? A(e) : null,
            weight: () => SX_O6_PRIOR_W
        } ]);
        function H(e) {
            let t = 0, n = 0;
            return q.forEach(i => {
                const a = i.value(e);
                if (null == a) return;
                const r = i.normalize(a);
                if (!Number.isFinite(r)) return;
                const o = Math.max(0, Number(i.weight(a, e)) || 0);
                o && (t += r * o, n += o);
            }), n ? t / n : null;
        }
        /* ===== Zero-weight silent drop (Rank 4, 2026-10-30) =====
           A Reddit or community sample of size 1 or less weighs
           0.5 x ln(max(1, size)) = 0 in q, so it contributes nothing
           to H — and nothing said so. The weight formula itself is
           already continuous in the sample size (ln(1) = 0, rising
           gradually: 0.35 at 2, 0.55 at 3, 0.69 at 4, 1.15 at 10),
           so the 1-to-2 step is integer granularity, not a formula
           discontinuity; no weight is changed here and no new
           formula is invented, because keeping the size-2-and-above
           weights exactly as they are and the size-1 weight at zero
           pins the formula. What changes is visibility: this helper
           mirrors H's own decision (value present, normalisation
           finite, weight zero, effective size <= 1) and names the
           source and topic, and popularitySourceStats appends its
           notes to the single-topic breakdown (mark menu and
           tooltip) so a too-small sample is stated, not silent. */
        function sxO6TooSmallNotes(idOrLabel) {
            const label = topicLabelById[String(idOrLabel || "")] || String(idOrLabel || "");
            const notes = [];
            [ "reddit", "community" ].forEach(id => {
                const src = q.find(s => s.id === id);
                if (!src) return;
                const raw = src.value(label);
                if (null == raw) return;
                const entry = raw && "object" == typeof raw ? raw : { value: raw };
                if (!Number.isFinite(src.normalize(entry))) return;
                if (Math.max(0, Number(src.weight(entry, label)) || 0) > 0) return;
                const size = "reddit" === id ? Math.max(0, Number(entry.sampleSize) || Number(entry.value) || 0) : Math.max(0, Number(entry.sampleSize) || 0);
                if (size > 1) return;
                notes.push({ source: "reddit" === id ? "Reddit" : "Community", topic: label, sampleSize: size, weight: 0 });
            });
            return notes;
        }
        /* O6 score storage: the aggregate lives in memory only, computed by H
           on demand from the embedded source blocks (prevalenceData /
           popularityData) plus the priors table above; it recomputes on page
           load (the taxonomy sort below runs H over every topic) and whenever
           a caller re-reads it. There is no persisted copy and no background
           sync. Kinkiness is derived from the same value: 1 - popularity. */
        /* ONE popularity reader (Rank 1, 2026-10-30): every popularity /
           kinkiness read goes through sxTopicPopularity, by topic id
           with label as fallback. The aggregate itself is H (O6 sources
           and weights unchanged); the id path resolves the label from
           the catalog, so the prior inside H is the byId prior (see
           sxO6Prior). A label passed directly falls back to H(label).
           Kinkiness is 1 - popularity, from the same value. */
        function sxTopicPopularity(idOrLabel, labelFallback) {
            const key = String(idOrLabel || "");
            /* Skin popularity (vanilla): a topic carrying a scored
               popularity object in its skin file returns its score
               (0-100) as a 0-1 value. */
            if (typeof window !== "undefined" && window.__SX_POPULARITY_FOR_TOPIC) {
                const sp = window.__SX_POPULARITY_FOR_TOPIC(key);
                if (sp && Number.isFinite(sp.score)) return sp.score / 100;
            }
            const lb = topicLabelById[key];
            if (lb) {
                const p = H(lb);
                if (null != p) return p;
                const pr = SX_O6_PRIORS.byId[key];
                return Number.isFinite(pr) ? pr : null;
            }
            if (labelFallback) return H(labelFallback);
            return H(key);
        }
        function sxTopicKinkiness(idOrLabel, labelFallback) {
            const p = sxTopicPopularity(idOrLabel, labelFallback);
            return null == p ? null : 1 - p;
        }
        window.__sxO6 = {
            popularity: sxTopicPopularity,
            kinkiness: sxTopicKinkiness,
            popularityById: sxTopicPopularity,
            kinkinessById: sxTopicKinkiness,
            tooSmallNotes: sxO6TooSmallNotes,
            communitySnapshot: sxCommunitySnapshotStatus
        };
        function W(e, t) {
            const n = Number.isFinite(e.score), i = Number.isFinite(t.score);
            return n !== i ? n ? -1 : 1 : n && i && e.score !== t.score ? t.score - e.score : String(e.label).localeCompare(String(t.label)) || e.index - t.index;
        }
        function U(e, t, n) {
            const i = n || (e => e?.label || e);
            return e.map((e, n) => ({
                value: e,
                index: n,
                score: t(e),
                label: i(e)
            })).sort(W).map(e => e.value);
        }
        function G(e, t) {
            return U(e, t);
        }
        function K(e) {
            const t = (e || []).map(H).filter(Number.isFinite);
            return t.length ? t.reduce((e, t) => e + t, 0) / t.length : null;
        }
        function z(e) {
            return K((e.topics || []).map(sxName));
        }
        function V(t) {
            try {
                return JSON.parse(e.byId(t)?.textContent || "{}");
            } catch (e) {
                return {};
            }
        }
        h.forEach(e => {
            e.topics = U(e.topics, e => sxTopicPopularity(topicIdByLabel[sxName(e)] || sxName(e)));
        }), h.splice(0, h.length, ...U(h, z, e => e.name));
        const Y = V("fetlifeGroupMappingData"), X = V("redditGroupMappingData"), Z = V("discordGroupMappingData"), Q = Object.keys(Y).length ? Y : window.__SEXCAPADES_FETLIFE_GROUPS && "object" == typeof window.__SEXCAPADES_FETLIFE_GROUPS ? window.__SEXCAPADES_FETLIFE_GROUPS : {}, J = Object.keys(X).length ? X : window.__SEXCAPADES_REDDIT_GROUPS && "object" == typeof window.__SEXCAPADES_REDDIT_GROUPS ? window.__SEXCAPADES_REDDIT_GROUPS : {}, ee = Object.keys(Z).length ? Z : window.__SEXCAPADES_DISCORD_GROUPS && "object" == typeof window.__SEXCAPADES_DISCORD_GROUPS ? window.__SEXCAPADES_DISCORD_GROUPS : {}, te = (() => {
            try {
                const t = JSON.parse(e.byId("communityCompletionTimeData")?.textContent || "{}"), n = e => Number.isFinite(Number(e)) && Number(e) > 0 ? Number(e) : null, i = e => Number.isFinite(Number(e)) && Number(e) >= 0 ? Number(e) : null;
                return {
                    median: n(t.median),
                    mean: n(t.mean),
                    sd: i(t.sd),
                    n: n(t.n)
                };
            } catch (e) {
                return {
                    median: null,
                    mean: null,
                    sd: null,
                    n: null
                };
            }
        })();
        function ne(e) {
            const t = Math.round(10 * e) / 10;
            return Number.isInteger(t) ? String(t) : t.toFixed(1);
        }
        !function() {
            const t = null !== te.median && null !== te.mean && null !== te.sd && null !== te.n;
            e.all("[data-list-rate-estimate-headline]").forEach(e => {
                e.textContent = t ? `Most explorers finish in ~${ne(te.median)} minutes. Pause anytime — partial profiles still make a functional hypermap.` : "Most people finish in less than an hour. Pause anytime — partial profiles still make a functional hypermap.";
            }), e.all("[data-list-rate-estimate-detail]").forEach(e => {
                e.hidden = !t, e.textContent = t ? `average ${ne(te.mean)} ± ${ne(te.sd)} min from ${Math.round(te.n)} explorers` : "";
            });
        }();
        function re(e) {
            const t = Array.isArray(e) ? e : [], n = new Set;
            return t.map(e => {
                if (!e || "object" != typeof e) return null;
                const t = String(e.url || "").trim(), i = String(e.name || "").trim(), a = String(e.scope || "Global").trim(), r = Number(e.tier) || 1;
                return /^https:\/\//i.test(t) && i && !n.has(t) ? (n.add(t), {
                    url: t,
                    name: i,
                    scope: a,
                    tier: r
                }) : null;
            }).filter(Boolean);
        }
        const oe = {
            fetlife: Q,
            reddit: J,
            discord: ee
        };
        function ce(e, t) {
            const n = oe[t];
            return n && Object.prototype.hasOwnProperty.call(n, e) ? re(n[e]) : [];
        }
        function de(e, t) {
            return ce(e, t)[0] || null;
        }
        function pe(e) {
            const t = new Set, n = [];
            return (e || []).forEach(e => {
                if (!e || e.length < 2 || !e[0] || !e[1] || e[0] === e[1]) return;
                const i = [ String(e[0]), String(e[1]) ].sort().join("\0");
                t.has(i) || (t.add(i), n.push(e));
            }), n;
        }
        const ve = new Map;
        b.forEach(e => e.topics.forEach((t, n) => ve.set(e.name + "\0" + t, (window.__SX_EXPORT_BE?.[e.name] || [])[n] || "star")));
        function xe(e) {
            return ke[e] || e.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\d+/g, "").trim();
        }
        function $e(e, t, n, i, a) {
            const r = [ `${"Category" === e.kind ? we[e.branch] || "branch symbol" : xe(t.key)}: ${"Category" === e.kind ? "branch" : "topic"} symbol for ${e.label}.` ], o = Se[i.key] || "hanky";
            t && t.glyphFallback && r.push("The star symbol is shown because no symbol is assigned here.");
            return "Category" === e.kind ? r.push("noCode" === i.key ? "Dark-charcoal icon: no children have a hanky code." : `${o} icon: predominant hanky color among coded child topics${i.mixed ? "; dashed spoke means the coded children vary widely" : ""}.`) : r.push("noCode" === i.key ? "Dark-charcoal icon: this topic has no hanky code." : `${o} icon: this topic’s hanky-code color.`), 
            r.push(null === n ? "The spoke's center line is a neutral seam; the rating colors live on the spoke's flanks." : "Green-to-yellow-to-red spoke: current rating colors."), 
            "favorite" === a ? r.push("★ marks a Favorite.") : "notinterested" === a ? r.push("⊘ marks Not Interested: not for this person, but not a hard boundary.") : "limit" === a && r.push("× marks a hard Limit."), 
            e.risk && r.push("* marks a higher-risk practice needing specialized knowledge and explicit negotiation."), 
            r.join(" ");
        }
        
        function Ae(e, t) {
            // Subcategory-hub inheritance (owner ruling 2026-11-23): a
            // hub with no glyph of its own in Ee inherits its parent
            // category's descriptor glyph from ge instead of the
            // generic star. Ee covers every Sexcapades subcategory
            // (boot-checked above), so Sexcapades hubs are untouched.
            const n = Ee[e] || "star", _ownGlyph = (e in Ee) && (n in ye), _catDesc = !_ownGlyph && ge && ge[t] && ge[t].glyph ? ge[t] : null, _glyphFallback = !_ownGlyph && !_catDesc, _hubGlyph = _ownGlyph ? ye[n] : _catDesc ? _catDesc.glyph : ye[n] || ye.star, _hubVb = _ownGlyph ? "0 0 16 16" : _catDesc ? "0 0 24 24" : "0 0 16 16", _hubKey = _ownGlyph || !_catDesc ? n : t, i = ge[t] || {};
            const c = h.find(c => c.name === t), s = c && (c.subcategories || []).find(s => s.name === e), p = s ? fpSub(s.topics, t) : null;
            if (p) return {
                glyph: _hubGlyph,
                viewBox: _hubVb,
                glyphFallback: _glyphFallback,
                accent: "",
                color: p.color,
                lineColor: p.lineColor || p.color,
                labelColor: p.labelColor || p.color,
                labelStroke: p.labelStroke,
                hankyKey: p.key,
                key: n,
                mixed: p.mixed
            };
            const fallbackColor = i.color || Ga.NO_CODE_COLOR;
            return {
                glyph: _hubGlyph,
                viewBox: _hubVb,
                glyphFallback: _glyphFallback,
                accent: "",
                color: fallbackColor,
                lineColor: fallbackColor,
                labelColor: fallbackColor,
                labelStroke: "#151816",
                hankyKey: (Ne.get(t) || {}).key || "subcategory",
                key: _hubKey
            };
        }
        // Glyph-map integrity (map-render refactor, finding 13): the
        // ye glyph dictionary is the single source for glyph names.
        // Every value in the be branch-glyph lists and the Ee
        // subcategory-glyph map must exist in it, and Ee must cover
        // every subcategory in the taxonomy and no other name, so a
        // typo in any table fails loudly at boot instead of silently
        // falling back to the "star" glyph at render time.
        for (const _subName of Object.keys(Ee)) {
            if (!(Ee[_subName] in ye)) throw new Error(`Sexcapades glyph check: subcategory "${_subName}" maps to glyph "${Ee[_subName]}", which is missing from the ye glyph dictionary`);
        }
        const _beTable = window.__SX_EXPORT_BE || {};
        for (const _branchName of Object.keys(_beTable)) {
            for (const _glyphName of _beTable[_branchName]) {
                if (!(_glyphName in ye)) throw new Error(`Sexcapades glyph check: branch "${_branchName}" lists glyph "${_glyphName}", which is missing from the ye glyph dictionary`);
            }
        }
        // Glyph-map integrity: when the Sexcapades subcategories exist in h
        // (i.e. on Sexcapades domain or after Sexcapades skin loads), verify
        // that Ee covers them. When running an engine boot before skin apply,
        // or on vanilla skins, skip Sexcapades-specific subcategory checks.
        const _glyphSubNames = new Set;
        h.forEach(_cat => (_cat.subcategories || []).forEach(_sub => _glyphSubNames.add(_sub.name)));
        if (_glyphSubNames.size > 0 && _glyphSubNames.has("Flexible ties")) {
            for (const _subName of _glyphSubNames) {
                if (!(_subName in Ee)) throw new Error(`Sexcapades glyph check: subcategory "${_subName}" has no entry in the Ee subcategory-glyph map and would fall back to the star glyph`);
            }
            for (const _subName of Object.keys(Ee)) {
                if (!_glyphSubNames.has(_subName)) throw new Error(`Sexcapades glyph check: Ee maps "${_subName}", which is not a subcategory in the taxonomy`);
            }
        }
        function fpSub(topics, branch) {
            const t = new Map;
            let n = 0;
            if ((topics || []).forEach(i => {
                const a = Le(i, branch).key;
                "noCode" !== a && (n += 1, t.set(a, (t.get(a) || 0) + 1));
            }), !n) return null;
            const i = Math.max(...t.values()), a = Array.from(t.entries()).filter(([, e]) => e === i).map(([e]) => e), r = Me[branch], o = r && a.includes(r) ? r : a[0], s = 1 !== a.length || i / n < .5;
            return {
                key: o,
                ...(Ce[o] || Ce.neutral),
                mixed: s
            };
        }
        function Le(e, t) {
            const n = Ie.get(e) || Me[t];
            if (!n) return {
                ...Pe
            };
            const i = Ce[n] || Ce.neutral;
            return {
                key: n,
                color: i.color,
                lineColor: i.lineColor || i.color,
                labelColor: i.labelColor || i.color,
                labelStroke: i.labelStroke
            };
        }
        function Te(e) {
            const t = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(e || "");
            if (!t) return e;
            const n = t.slice(1).map(e => parseInt(e, 16)), i = e => {
                const t = e / 255;
                return t <= .04045 ? t / 12.92 : Math.pow((t + .055) / 1.055, 2.4);
            };
            if (.2126 * i(n[0]) + .7152 * i(n[1]) + .0722 * i(n[2]) >= .22) return e;
            let a = 0, r = 1;
            for (let e = 0; e < 12; e++) {
                const e = (a + r) / 2, t = n.map(t => Math.round(t + (255 - t) * e));
                .2126 * i(t[0]) + .7152 * i(t[1]) + .0722 * i(t[2]) < .22 ? a = e : r = e;
            }
            return `#${n.map(e => Math.round(e + (255 - e) * r)).map(e => e.toString(16).padStart(2, "0")).join("")}`;
        }
        function Fe(e) {
            const t = new Map;
            let n = 0;
            if (e.topics.forEach(i => {
                const a = Le(i, e.name).key;
                "noCode" !== a && (n += 1, t.set(a, (t.get(a) || 0) + 1));
            }), !n) return {
                ...Pe,
                codedChildren: 0,
                predominantCount: 0,
                mixed: !1
            };
            const i = Math.max(...t.values()), a = Array.from(t.entries()).filter(([, e]) => e === i).map(([e]) => e), r = Me[e.name], o = r && a.includes(r) ? r : a[0], s = 1 !== a.length || i / n < .5;
            return {
                key: o,
                ...Ce[o] || Ce.neutral,
                codedChildren: n,
                predominantCount: i,
                mixed: s
            };
        }
        const Ne = new Map;
        h.forEach(e => {
            const t = ge[e.name], n = Fe(e);
            Ne.set(e.name, n), t && (t.color = n.color, t.hankyKey = n.key, t.hankyMixed = n.mixed);
        });
        const _e = new Map;
        let De = 0;
        function Re(e) {
            const t = 16, n = e % t, i = (7 * Math.floor(e / t) + n + 5) % t, a = (n + 10 + e % 3) % t, r = (e, n = 6.15) => {
                const i = -Math.PI / 2 + e / t * Math.PI * 2;
                return [ 8 + Math.cos(i) * n, 8 + Math.sin(i) * n ];
            }, o = r(n), s = r(i), l = r(a, 5.55), c = r((n + 1) % t, 6.45), d = r((n + 2) % t, 6.15);
            return `<circle class="icon-accent" cx="${o[0].toFixed(2)}" cy="${o[1].toFixed(2)}" r=".66"/><path class="icon-accent-stroke" d="M ${s[0].toFixed(2)} ${s[1].toFixed(2)} l ${(.28 * (8 - s[0])).toFixed(2)} ${(.28 * (8 - s[1])).toFixed(2)}"/><path class="icon-detail" d="M ${o[0].toFixed(2)} ${o[1].toFixed(2)} Q ${c[0].toFixed(2)} ${c[1].toFixed(2)} ${d[0].toFixed(2)} ${d[1].toFixed(2)} M ${l[0].toFixed(2)} ${l[1].toFixed(2)} l ${(.16 * (8 - l[0])).toFixed(2)} ${(.16 * (8 - l[1])).toFixed(2)}"/><circle class="icon-detail-dot" cx="${l[0].toFixed(2)}" cy="${l[1].toFixed(2)}" r=".34"/>`;
        }
        const _topicSubMap = new Map;
        function sxSyncTopicGlyphs() {
            ve.clear(), _topicSubMap.clear();
            const beTable = window.__SX_EXPORT_BE || {};
            h.forEach(cat => {
                const list = beTable[cat.name] || [];
                const flat = [];
                (cat.topics || []).forEach(t => flat.push(sxName(t)));
                (cat.parentTopics || []).forEach(t => flat.push(sxName(t)));
                (cat.subcategories || []).forEach(sub => {
                    (sub.topics || []).forEach(t => {
                        const nm = sxName(t);
                        _topicSubMap.set(cat.name + "\0" + nm, sub.name);
                        flat.push(nm);
                    });
                    (sub.parentTopics || []).forEach(t => {
                        const nm = sxName(t);
                        _topicSubMap.set(cat.name + "\0" + nm, sub.name);
                        flat.push(nm);
                    });
                });
                flat.forEach((nm, idx) => {
                    if (list[idx] && list[idx] in ye) ve.set(cat.name + "\0" + nm, list[idx]);
                });
            });
        }
        function Oe(e, t) {
            // Topic-icon inheritance & per-topic glyphs (owner ruling 2026-11-23):
            // 1. Skin-authored per-topic glyph from window.__SX_SKIN_TOPIC_GLYPHS
            //    (24x24 SVG path d-string / markup or a ye key) replaces the inherited
            //    category glyph for that topic only; categories keep theirs.
            // 2. Sexcapades catalog glyph from ve -> ye (16x16 viewBox).
            // 3. Parent subcategory glyph from Ee -> ye (16x16 viewBox) when inside a subcategory.
            // 4. Otherwise inherit the parent category's descriptor glyph from ge (24x24).
            // 5. Last resort fallback: ye.star (16x16).
            const _veKey = t + "\0" + e;
            const _skinMap = typeof window !== "undefined" ? window.__SX_SKIN_TOPIC_GLYPHS : null;
            const _tid = _skinMap && !_skinMap[_veKey] && typeof Wn === "function" ? Wn(e) : null;
            const _skinRaw = _skinMap ? (_skinMap[_veKey] || (_tid ? _skinMap[_tid] : null)) : null;
            let _skinGlyphMarkup = null, _skinKey = null, _skinVb = null;
            if (_skinRaw) {
                const _rawStr = "string" == typeof _skinRaw ? _skinRaw : (_skinRaw.glyph || "");
                const _rawLabel = "object" == typeof _skinRaw && _skinRaw.label ? _skinRaw.label : "";
                if (_rawStr) {
                    if (_rawStr in ye) {
                        _skinGlyphMarkup = ye[_rawStr];
                        _skinKey = _rawLabel || _rawStr;
                        _skinVb = "0 0 16 16";
                    } else if (/^\s*</.test(_rawStr)) {
                        _skinGlyphMarkup = _rawStr;
                        _skinKey = _rawLabel || e;
                        _skinVb = "0 0 24 24";
                    } else if (/^\s*[Mm]/.test(_rawStr)) {
                        _skinGlyphMarkup = `<path class="icon-glyph" d="${_rawStr}"/>`;
                        _skinKey = _rawLabel || e;
                        _skinVb = "0 0 24 24";
                    }
                }
            }
            const n = ve.get(_veKey) || "star";
            const _ownVe = !_skinGlyphMarkup && ve.has(_veKey) && n in ye;
            const _subName = !_skinGlyphMarkup && !_ownVe ? _topicSubMap.get(_veKey) : null;
            const _subKey = _subName && (_subName in Ee) && (Ee[_subName] in ye) ? Ee[_subName] : null;
            const _ownGlyph = Boolean(_skinGlyphMarkup || _ownVe || _subKey);
            const _catDesc = !_ownGlyph && ge && ge[t] && ge[t].glyph ? ge[t] : null;
            const _glyphFallback = !_ownGlyph && !_catDesc;
            const i = _e.get(_veKey) || 0, a = Le(e, t);
            return {
                glyph: _skinGlyphMarkup ? _skinGlyphMarkup : _ownVe ? ye[n] : _subKey ? ye[_subKey] : _catDesc ? _catDesc.glyph : ye.star,
                viewBox: _skinGlyphMarkup ? _skinVb : (_ownVe || _subKey) ? "0 0 16 16" : _catDesc ? "0 0 24 24" : "0 0 16 16",
                glyphFallback: _glyphFallback,
                accent: "",
                color: a.color,
                lineColor: a.lineColor,
                labelColor: a.labelColor,
                labelStroke: a.labelStroke,
                hankyKey: a.key,
                key: _skinGlyphMarkup ? _skinKey : _ownVe ? n : _subKey ? _subKey : (!_catDesc ? n : t)
            };
        }
        h.forEach(e => e.topics.forEach(t => _e.set(e.name + "\0" + t, De++)));
        function Wn(e) {
            if (e && "object" == typeof e && e.id) return e.id;
            const t = sxName(e);
            for (const cat of h) {
                for (const topic of cat.topics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                for (const topic of cat.parentTopics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                for (const sub of cat.subcategories || []) {
                    for (const topic of sub.topics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                    for (const topic of sub.parentTopics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
                }
            }
            const n = (topicRecords[t] && topicRecords[t].id) || SX_SUBSUMED_BASE_TOPIC_IDS[t];
            if (!n) throw new Error(`Missing stored topic ID for "${t}". Assign max(existing ID) + 1 on the topic object.`);
            return n;
        }
        function sxPopulateRoleLabelsOuter() {
            const register = topic => {
                if (!topic || "give_receive" !== topic.type || !topic.give_label || !topic.receive_label) return;
                const n = Wn(topic);
                if (n) We[n] = [ topic.give_label, topic.receive_label ];
            };
            h.forEach(cat => {
                (cat.topics || []).forEach(register);
                (cat.parentTopics || []).forEach(register);
                (cat.subcategories || []).forEach(sub => {
                    (sub.topics || []).forEach(register);
                    (sub.parentTopics || []).forEach(register);
                });
            });
        }
        sxPopulateRoleLabelsOuter();
        const Ue = new Set([ "t0002", "t0007", "t0008", "t0102", "t0106", "t0107", "t0108", "t0140", "topic-vampires-gothic", "topic-historical-fantasy", "t0377", "t0378", "t0379", "t0380", "t0382", "t0383", "t0384", "t0317", "t0318", "t0319", "t0320", "t0321", "t0322", "t0323", "t0278", "t0279", "t0280", "t0282", "t0258", "t0361", "t0366", "t0396", "t0397", "t0399", "t0401", "t0402", "t0403", "t0269", "t0048", "t0132", "t0143", "t0144", "t0147", "t0148", "t0195", "t0217", "t0219", "t0228", "t0229", "t0230", "t0232", "t0233", "t0259", "t0290", "t0303" ]);
