        // E3 (slug-gap build): post-import result dialog — the loud surface
        // for the loud-drop rule (assessment §9 L1+L2). States how many
        // ratings were imported and, only when profile.droppedKeys is
        // non-empty, names every dropped entry. Dismissible; the imported
        // profile is fully usable whether or not the dialog is open.
        // E4a: the topicNames carried by the file currently being
        // imported (null when the file does not describe itself). When
        // a best-guess label is needed for a dropped entry from that
        // file, the file's own label wins over the slug-tail guess —
        // the sender's meanings, not a reconstruction from the key.
        let importTopicNames = null;
        function importDroppedGuess(key) {
            if (importTopicNames) {
                const own = importTopicNames[key], resolved = Vw[key] && importTopicNames[Vw[key]];
                if ("string" == typeof own && own) return own;
                if ("string" == typeof resolved && resolved) return resolved;
            }
            const parts = String(key).replace(/^topic-/, "").split("-").filter(Boolean), tail = parts.length > 2 ? parts.slice(2) : parts;
            return tail.join(" ") || String(key);
        }
        function importDroppedLine(rec) {
            let line = "retired" === rec.kind ? `${rec.key} — a retired topic` : "trimmed" === rec.kind ? `${rec.key} — a note over 64 characters, trimmed to fit` : "value" === rec.kind ? `${rec.key} — ${"notes" === rec.section ? "notes past the limit of 16 per topic" : "a value that isn't allowed"}` : `${rec.key} — best guess: “${importDroppedGuess(rec.key)}”`;
            if (rec.section && "ratings" !== rec.section) {
                const sectionNames = {
                    annotations: "annotations",
                    fantasyOnly: "fantasy-only list",
                    alreadyTried: "already-tried list",
                    ratingSources: "rating sources",
                    notes: "notes",
                    importAttention: "import attention"
                };
                line += ` (from ${sectionNames[rec.section] || rec.section})`;
            }
            return line;
        }
        function showImportResultDialog(name, ratingCount, dropped, retired) {
            const dlg = e.byId("importResultDialog"), summary = e.byId("importResultSummary"), box = e.byId("importResultDropped"), heading = e.byId("importResultDroppedHeading"), list = e.byId("importResultDroppedList");
            if (!dlg || !summary) return;
            summary.textContent = `${name} was imported with ${ratingCount} ${1 === ratingCount ? "rating" : "ratings"}.`;
            if (box && heading && list) {
                list.textContent = "";
                const entries = Array.isArray(dropped) ? dropped : [];
                entries.length ? (heading.textContent = `${entries.length} ${1 === entries.length ? "entry was" : "entries were"} not imported because their topic keys match no current topic, or their values are not allowed:`,
                entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = importDroppedLine(rec), list.append(li);
                }), box.hidden = !1) : (heading.textContent = "", box.hidden = !0);
            }
            // E4b: entries whose canonical id sits in the burial
            // registry were retired by ruling — an additional line of
            // their own, never part of the dropped list above and never
            // parked on the profile.
            const rBox = e.byId("importResultRetired"), rHeading = e.byId("importResultRetiredHeading"), rList = e.byId("importResultRetiredList");
            if (rBox && rHeading && rList) {
                rList.textContent = "";
                const rEntries = Array.isArray(retired) ? retired : [];
                rEntries.length ? (rHeading.textContent = `${rEntries.length} ${1 === rEntries.length ? "entry was" : "entries were"} retired by ruling and ${1 === rEntries.length ? "was" : "were"} not imported:`,
                rEntries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = `${rec.key} — ${BURIED_TOPIC_IDS[rec.key] || "Direction (topic deleted)"}`, rList.append(li);
                }), rBox.hidden = !1) : (rHeading.textContent = "", rBox.hidden = !0);
            }
            const uBox0 = e.byId("importResultUnmatched"), nBox0 = e.byId("importResultNotApplied");
            uBox0 && (uBox0.hidden = !0), nBox0 && (nBox0.hidden = !0);
            const closeBtn = e.byId("closeImportResult"), okBtn = e.byId("dismissImportResult");
            closeBtn && (closeBtn.onclick = () => Ui(dlg)), okBtn && (okBtn.onclick = () => Ui(dlg)), Wi(dlg);
        }
        function showConverterResultDialog(name, ratingCount, unmatched, notApplied, dropped, sourceLabel) {
            const dlg = e.byId("importResultDialog"), summary = e.byId("importResultSummary");
            if (!dlg || !summary) return;
            summary.textContent = `${name} was loaded with ${ratingCount} ${1 === ratingCount ? "rating" : "ratings"} from ${sourceLabel || "FetLife"}.`;
            const rBox = e.byId("importResultRetired");
            rBox && (rBox.hidden = !0);
            // Importer rework Part A (R1 STRICT): strict-ingestion drops
            // from ANY converter feed are named here, in the same dropped
            // list the profile-file import dialog uses — not just FetLife
            // unmatched fetishes.
            const dBox = e.byId("importResultDropped"), dHeading = e.byId("importResultDroppedHeading"), dList = e.byId("importResultDroppedList");
            if (dBox && dHeading && dList) {
                dList.textContent = "";
                const entries = Array.isArray(dropped) ? dropped : [];
                entries.length ? (dHeading.textContent = `${entries.length} ${1 === entries.length ? "entry was" : "entries were"} not loaded because their topic keys match no current topic, or their values are not allowed:`, entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = importDroppedLine(rec), dList.append(li);
                }), dBox.hidden = !1) : (dHeading.textContent = "", dBox.hidden = !0);
            }
            const uBox = e.byId("importResultUnmatched"), uHeading = e.byId("importResultUnmatchedHeading"), uList = e.byId("importResultUnmatchedList");
            if (uBox && uHeading && uList) {
                uList.textContent = "";
                const entries = Array.isArray(unmatched) ? unmatched : [];
                entries.length ? (uHeading.textContent = `${entries.length} ${1 === entries.length ? "fetish matched" : "fetishes matched"} no topic and ${1 === entries.length ? "was" : "were"} not imported:`, entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = `${rec.fetish_name} (from your ${"curious" === rec.list_type ? "Curious about" : "Into"} list)`, uList.append(li);
                }), uBox.hidden = !1) : (uHeading.textContent = "", uBox.hidden = !0);
            }
            const nBox = e.byId("importResultNotApplied"), nHeading = e.byId("importResultNotAppliedHeading"), nList = e.byId("importResultNotAppliedList");
            if (nBox && nHeading && nList) {
                nList.textContent = "";
                const entries = Array.isArray(notApplied) ? notApplied : [];
                entries.length ? (nHeading.textContent = `${entries.length} ${1 === entries.length ? "entry was" : "entries were"} not applied because the name it matched is not a current topic:`, entries.forEach(rec => {
                    const li = document.createElement("li");
                    li.textContent = `“${rec.term}” matched ${rec.target}, which names no current topic, and was not applied.`, nList.append(li);
                }), nBox.hidden = !1) : (nHeading.textContent = "", nBox.hidden = !0);
            }
            const closeBtn = e.byId("closeImportResult"), okBtn = e.byId("dismissImportResult");
            closeBtn && (closeBtn.onclick = () => Ui(dlg)), okBtn && (okBtn.onclick = () => Ui(dlg)), Wi(dlg);
        }
        // F3(a) (profiles-data refactor, Edit 3): the import path's
        // dropped/parked/retired bookkeeping, extracted from rk with
        // no behavior change. importRetiredRecord builds the retired
        // record that used to be written out twice (the parked-restore
        // loop and noteDropped). importDropBookkeeping runs the
        // carried-in parked restore, defines noteDropped (returned so
        // rk's section ingestions keep using it), and prunes
        // non-canonical ratings keys, in rk's original order.
        function importRetiredRecord(key, section, value) {
            return {
                key: key,
                section: section,
                value: value,
                kind: "retired"
            };
        }
        function importDropBookkeeping(e, r) {
            // E3 loud-drop rule (assessment §9 L1+L2): a ratings key that is
            // not a canonical topic id or a registered imported child is
            // still pruned from ratings (counting/display are canonical
            // only), but never silently — every pruned key is recorded in
            // profile.droppedKeys with its value and named in the
            // post-import result dialog. Broad-hit pseudo-ratings (cat- /
            // subcategory-…) are valid stored keys: never pruned, never
            // recorded. A record carried in from a previous export is kept,
            // so the history of what was dropped survives a round-trip.
            // E4a: a parked record carried in by the file (its own
            // droppedKeys) is restored onto the imported profile
            // verbatim — entries keep key, section, value and kind —
            // and is NOT a new drop: restored entries are not reported
            // in the result dialog below, they simply remain parked on
            // the profile. Only entries this import itself fails to
            // place (noteDropped) are fresh drops.
            const parked = [], retired = [];
            Array.isArray(e.droppedKeys) && e.droppedKeys.forEach(rec => {
                if (!rec || "string" != typeof rec.key || !rec.key || "string" != typeof rec.section) return;
                // E4b: a carried-in parked record whose key is a buried
                // canonical id is retired by ruling, not restored —
                // buried ids are never parked, even from an old file.
                if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, rec.key)) return void retired.push(importRetiredRecord(rec.key, rec.section, rec.value));
                const restored = {
                    key: rec.key,
                    section: rec.section,
                    value: rec.value,
                    kind: "string" == typeof rec.kind && rec.kind ? rec.kind : "unrecognized"
                };
                // E4b: keep the entry's own label when it carries one;
                // otherwise the file's topicNames (importTopicNames)
                // names it, so On Deck can show the sender's meaning.
                const ownLabel = "string" == typeof rec.label && rec.label ? rec.label : importTopicNames && "string" == typeof importTopicNames[rec.key] && importTopicNames[rec.key] ? importTopicNames[rec.key] : "";
                ownLabel && (restored.label = ownLabel), parked.push(restored);
            });
            const dropped = [];
            const noteDropped = (key, section, value, kindOverride) => {
                if ("string" != typeof key || !key || isCatId(key) || isSubId(key)) return;
                // E4b burial: a key whose canonical id is in the burial
                // registry was retired by ruling — it is collected for
                // the import result's retired line instead of being
                // stored or parked. Only the literal canonical id can
                // match; slug spellings fall through and park as usual.
                if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, key)) return void retired.push(importRetiredRecord(key, section, value));
                const rec = {
                    key: key,
                    section: section,
                    value: value,
                    kind: kindOverride || (/^t\d{4}$/.test(key) ? "retired" : "unrecognized")
                };
                // E4b: the parked entry carries its best-guess label
                // (the dialog's guess logic — the file's own topicNames
                // win while this import is being read) so the On Deck
                // unresolved section can name it later.
                const guessed = importDroppedGuess(key);
                "string" == typeof guessed && guessed && (rec.label = guessed), dropped.push(rec);
            };
            Object.keys(e.ratings).forEach(k => {
                if (!isCatId(k) && !isSubId(k) && !r.has(k)) noteDropped(k, "ratings", e.ratings[k]),
                delete e.ratings[k];
            });
            return {
                parked: parked,
                dropped: dropped,
                retired: retired,
                noteDropped: noteDropped
            };
        }
        // F3(b) (profiles-data refactor, Edit 3): ratings ingestion
        // for the import path, extracted from rk with no behavior
        // change — single vs. dual shape, clamping to [-100, 100],
        // and per-flank provenance from ratingSources, as before.
        // Fix 1, item 3: ONE rating-application path for the import
        // path and the converter, holding the rules both used to
        // implement separately — single vs. dual shape, clamping to
        // [-100, 100], unknown-topic skip, cat- rejection, and
        // unreadable-rating rejection. The callers differ only in
        // the options: the import path replaces the topic entry
        // wholesale with provenance from ratingSources (see
        // importProfileRatings below); the converter merges per
        // flank into the existing entry with test: provenance, and
        // keeps the documented manual-flip guard (a hand rating
        // changes only when the test moves it to a different camp —
        // the converter dialog's own copy). Guarded flanks are
        // reported in `flipped` so the converter can clear their
        // marks, as its old inline applier did; `changed` carries
        // the applied (clamped) values for the post-merge flash.
        function applyProfileRatings(c, ratings, opts) {
            opts = opts || {};
            const sourceFor = "function" == typeof opts.source ? opts.source : () => "unknown";
            const mergeFlanks = !!opts.mergeFlanks, guardManualFlip = !!opts.guardManualFlip;
            const changed = {}, flipped = [];
            const clamp = v => Math.max(-100, Math.min(100, Number(v)));
            const existingFlankValue = (id, flank) => {
                const cur = vt[c][id];
                if ("number" == typeof cur) return cur;
                return cur && "object" == typeof cur ? cur[flank] : void 0;
            };
            const getTopicName = id => {
                const item = qn[id] || Xn(id) || (at[c] || {})[id];
                return (item && (item.label || item.name)) || id;
            };
            Object.entries(ratings).forEach(([origId, rating]) => {
                let id = origId;
                if (id === "t0410" || id === "topic-monogamy-poly-anarchy") {
                    id = "t0415"; // Remap obsolete triad to 4-pole intimacy geometry
                } else if (id === "t0411" || id === "topic-edging-ruined-forced") {
                    id = "t0414"; // Remap obsolete triad to 4-pole orgasm dynamic
                } else if (id === "t0009" || id === "t0010" || id === "t0012" || id === "t0014" || id === "t0015" || id === "t0413" || id === "t0419" || id === "topic-d-s" || id === "topic-femdom" || id === "topic-power-matrix" || id === "topic-bdsm-archetypes") {
                    id = "t0423"; // Subsumed base BDSM roles/authority + phantom BDSM archetype topics remapped to 7-pole BDSM archetypes heptad
                } else if (id === "t0417" || id === "t0421" || id === "topic-somatosensory-palette" || id === "topic-impact-modalities") {
                    id = "t0424"; // Subsumed phantom sensory topics remapped to 7-pole somatosensory heptad
                } else if (id === "t0008" || id === "t0013" || id === "t0375" || id === "topic-ongoing-dynamics" || id === "topic-24-7" || id === "topic-romantic-surrender") {
                    id = "t0425"; // Subsumed relational dynamics remapped to 7-pole Sternberg relational heptad
                } else if (id === "t0288" || id === "topic-hotwife") {
                    id = "t0281"; // Duplicate Hotwife 2P remapped to 3-pole Bull / Hotwife / Cuckold triad
                } else if (id === "t0033" || id === "topic-tape") {
                    id = "t0426"; // Obsolete generic Tape / silicone bondage tape subsumed into Restraint & containment octad (t0426 Pole 3: Tape)
                } else if (id === "t0022" || id === "t0025" || id === "t0029" || id === "t0032" || id === "t0034" || id === "t0037" || id === "t0038" || id === "t0039" || id === "t0040" || id === "t0043" || id === "t0050") {
                    id = "t0426"; // Subsumed base 1/2-pole restraint topics remapped to 8-pole containment octad
                } else if (id === "t0201" || id === "t0202" || id === "t0203" || id === "t0204" || id === "t0208" || id === "t0209" || id === "t0210" || id === "t0211" || id === "t0213" || id === "t0218" || id === "t0220" || id === "t0222" || id === "t0231") {
                    id = "t0427"; // Subsumed base 1/2-pole anatomical topics remapped to 8-pole somatic octad
                } else if (id === "t0254" || id === "t0256") {
                    id = "t0255"; // Duplicate crying topics (Crying, Tears) removed 2026-11-21, remapped to Dacryphilia (kept *philia name)
                } else if (id === "t0342") {
                    id = "t0350"; // Duplicate Enemas removed 2026-11-21, remapped to Klismaphilia (kept *philia name)
                }
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id) && !(at[c] && at[c][id]) && !(window.__SEXCAPADES_TOPIC_CATALOG && window.__SEXCAPADES_TOPIC_CATALOG.labelForId(id))) {
                    if (typeof window.__SX_SKIN_LAYOUT_SYNC === "function") {
                        try { window.__SX_SKIN_LAYOUT_SYNC(); } catch (_) {}
                    }
                    if (!Ke.has(id) && !isCatId(id) && !isSubId(id) && !(at[c] && at[c][id]) && !(window.__SEXCAPADES_TOPIC_CATALOG && window.__SEXCAPADES_TOPIC_CATALOG.labelForId(id))) return;
                }
                const topicName = getTopicName(id);
                if (Ge(id, c).single) {
                    const candidates = "number" == typeof rating ? [ [ "give", rating ] ] : rating && "object" == typeof rating ? [ [ "give", rating.give ], [ "receive", rating.receive ] ] : [];
                    const found = candidates.find(([, v]) => Number.isFinite(Number(v)));
                    if (!found) throw new Error(`This profile contains an unreadable rating for "${topicName}"`);
                    const value = clamp(found[1]), supplying = found[0];
                    if (guardManualFlip) {
                        const blocked = [ "give", "receive" ].some(flank => "manual" === Ao(c, id, flank) && Number.isFinite(Number(existingFlankValue(id, flank))) && Ix(Number(existingFlankValue(id, flank))) !== Ix(value));
                        if (blocked) return void flipped.push(id);
                    }
                    const before = existingFlankValue(id, "give");
                    vt[c][id] = value;
                    Co(c, id, "give", sourceFor(id, "give", supplying)), Co(c, id, "receive", sourceFor(id, "receive", supplying));
                    Number(before) !== value && (changed[id] = value);
                    return;
                }
                const incoming = {};
                const shape = Ge(id, c);
                const flanks = shape.keys || [ "give", "receive" ];
                if (Number.isFinite(Number(rating))) flanks.forEach(flank => { incoming[flank] = clamp(rating); });
                else if (rating && "object" == typeof rating) {
                    flanks.forEach(flank => {
                        Object.prototype.hasOwnProperty.call(rating, flank) && Number.isFinite(Number(rating[flank])) && (incoming[flank] = clamp(rating[flank]));
                    });
                    // Pole-key migration for subsumed phantom multi-pole topics:
                    // the old pole keys do not match the target's keys, so the
                    // copy above leaves incoming empty (or partial) and the
                    // generic positional fallback below would scramble them.
                    // Map the clear correspondences 1:1 (max when two old poles
                    // share one target pole); ambiguous poles are NOT invented —
                    // a rating with nothing mappable and no give/receive falls
                    // through to the whole-rating fallback (strongest pole
                    // value, all flanks), the same as a scalar rating.
                    if (origId === "t0413" || origId === "topic-power-matrix" || origId === "t0419" || origId === "topic-bdsm-archetypes" || origId === "t0417" || origId === "topic-somatosensory-palette" || origId === "t0421" || origId === "topic-impact-modalities") {
                        const pv = k => Number.isFinite(Number(rating[k])) ? clamp(rating[k]) : void 0;
                        const put = (k, v) => { if (v !== void 0) incoming[k] = incoming[k] === void 0 ? v : Math.max(incoming[k], v); };
                        if (origId === "t0413" || origId === "topic-power-matrix") {
                            put("sovereign", pv("master"));
                            put("caregiver", pv("mistress"));
                            // "slave" already exact-matches the target key via the copy above.
                            // "pet" is ambiguous (brat vs primal) — not pole-targeted.
                        } else if (origId === "t0419" || origId === "topic-bdsm-archetypes") {
                            put("sovereign", pv("master"));
                            put("caregiver", pv("nurturer"));
                            put("slave", pv("surrender"));
                            // "primal" and "brat" already exact-match the target keys.
                        } else if (origId === "t0417" || origId === "topic-somatosensory-palette") {
                            put("electric", pv("vibrational"));
                            put("scent", pv("olfactory"));
                            put("sound", pv("auditory"));
                            // "thermal" and "tactile" already exact-match the target keys.
                        } else if (origId === "t0421" || origId === "topic-impact-modalities") {
                            put("impact", pv("sting"));
                            put("impact", pv("thud"));
                            // "thermal" already exact-matches the target key.
                            // "clamp", "deprivation", "overload" have no target pole — not mapped.
                        }
                        if (!Object.keys(incoming).length) {
                            const hasDual = Number.isFinite(Number(rating.give)) || Number.isFinite(Number(rating.receive));
                            if (!hasDual) {
                                const vals = Object.values(rating).filter(Number.isFinite);
                                if (vals.length) {
                                    const m = clamp(Math.max.apply(null, vals));
                                    flanks.forEach(f => { incoming[f] = m; });
                                }
                            }
                        }
                    }
                    // Backwards compatibility migration for legacy dual {give, receive} rated on newly triadic topics
                    if (!Object.keys(incoming).length && (Object.prototype.hasOwnProperty.call(rating, "give") || Object.prototype.hasOwnProperty.call(rating, "receive"))) {
                        const gVal = Object.prototype.hasOwnProperty.call(rating, "give") && Number.isFinite(Number(rating.give)) ? clamp(rating.give) : 0;
                        const rVal = Object.prototype.hasOwnProperty.call(rating, "receive") && Number.isFinite(Number(rating.receive)) ? clamp(rating.receive) : 0;
                        const maxVal = Math.max(gVal, rVal);

                        // Specific pole targeted migration for subsumed topics
                        if (id === "t0427") {
                            if (origId === "t0203" || origId === "t0204") incoming.hair = maxVal;
                            else if (origId === "t0208" || origId === "t0209" || origId === "t0210" || origId === "t0211") incoming.bodyhair = maxVal;
                            else if (origId === "t0231") incoming.muscles = maxVal;
                            else if (origId === "t0213") incoming.feet = maxVal;
                            else if (origId === "t0201" || origId === "t0202") incoming.hands = maxVal;
                            else if (origId === "t0220") incoming.breasts = maxVal;
                            else if (origId === "t0218") incoming.glutes = maxVal;
                            else if (origId === "t0222") incoming.pregnancy = maxVal;
                        } else if (id === "t0426") {
                            if (origId === "t0022") incoming.rope = maxVal;
                            else if (origId === "t0050") incoming.shibari = maxVal;
                            else if (origId === "t0025") incoming.cuffs = maxVal;
                            else if (origId === "t0029" || origId === "t0033") incoming.tape = maxVal;
                            else if (origId === "t0032" || origId === "t0039") incoming.mummification = maxVal;
                            else if (origId === "t0034") incoming.blindfold = maxVal;
                            else if (origId === "t0037" || origId === "t0038" || origId === "t0040") incoming.caging = maxVal;
                            else if (origId === "t0043") incoming.suspension = maxVal;
                        } else if (id === "t0425") {
                            if (origId === "t0008") incoming.companionate = maxVal;
                            else if (origId === "t0013") incoming.consummate = maxVal;
                            else if (origId === "t0375") incoming.romantic = maxVal;
                        } else if (id === "t0423") {
                            if (origId === "t0009") incoming.sovereign = maxVal;
                            else if (origId === "t0010") { incoming.sovereign = gVal; incoming.slave = rVal; }
                            else if (origId === "t0012") incoming.brat = maxVal;
                            else if (origId === "t0014") incoming.switch = maxVal;
                            else if (origId === "t0015") incoming.sovereign = maxVal;
                        }
                        // Preserve already populated poles if merging into existing multi-pole rating
                        const curRating = vt[c][id];
                        if (curRating && typeof curRating === "object") {
                            Object.keys(curRating).forEach(k => {
                                if (incoming[k] === undefined && Number.isFinite(Number(curRating[k]))) incoming[k] = curRating[k];
                            });
                        }

                        if (Object.keys(incoming).length) {
                            // Targeted pole mapped successfully
                        } else if (id === "t0281" || id === "t0288" || id === "topic-cuckold-hotwife" || id === "topic-hotwife" || id === "topic-bull-hotwife-cuckold") {
                            // t0281 legacy: give = outside-partner sex (hotwife / bull), receive = knowledge/view (cuckold)
                            const isFemale = rt[c] && (rt[c].includes("female") || rt[c].includes("woman") || rt[c].includes("f"));
                            if (id === "t0288" || id === "topic-hotwife" || origId === "t0288") {
                                incoming.hotwife = Math.max(gVal, rVal);
                                incoming.bull = 0;
                                incoming.cuckold = 0;
                            } else if (isFemale) {
                                incoming.hotwife = gVal;
                                incoming.bull = 0;
                                incoming.cuckold = 0;
                            } else {
                                incoming.bull = gVal;
                                incoming.cuckold = rVal;
                                incoming.hotwife = 0;
                            }
                        } else if (flanks.length === 3) {
                            if (Object.prototype.hasOwnProperty.call(rating, "give") && Number.isFinite(Number(rating.give))) incoming[flanks[0]] = clamp(rating.give);
                            if (Object.prototype.hasOwnProperty.call(rating, "receive") && Number.isFinite(Number(rating.receive))) incoming[flanks[1]] = clamp(rating.receive);
                            if (incoming[flanks[2]] === undefined) incoming[flanks[2]] = 0;
                        } else if (flanks.length === 4) {
                            // Orthogonal projection: give -> poles 0,1; receive -> poles 2,3
                            const gVal = Object.prototype.hasOwnProperty.call(rating, "give") && Number.isFinite(Number(rating.give)) ? clamp(rating.give) : null;
                            const rVal = Object.prototype.hasOwnProperty.call(rating, "receive") && Number.isFinite(Number(rating.receive)) ? clamp(rating.receive) : null;
                            if (gVal !== null) {
                                incoming[flanks[0]] = gVal;
                                incoming[flanks[1]] = gVal;
                            }
                            if (rVal !== null) {
                                incoming[flanks[2]] = rVal;
                                incoming[flanks[3]] = rVal;
                            }
                        } else if (flanks.length === 5) {
                            // Orthogonal projection: give -> active/assertive poles (0,1); neutral -> (2); receive -> receptive/intimacy poles (3,4)
                            const gVal = Object.prototype.hasOwnProperty.call(rating, "give") && Number.isFinite(Number(rating.give)) ? clamp(rating.give) : null;
                            const rVal = Object.prototype.hasOwnProperty.call(rating, "receive") && Number.isFinite(Number(rating.receive)) ? clamp(rating.receive) : null;
                            if (gVal !== null && rVal !== null) {
                                incoming[flanks[0]] = gVal;
                                incoming[flanks[1]] = gVal;
                                incoming[flanks[2]] = Math.round((gVal + rVal) / 2);
                                incoming[flanks[3]] = rVal;
                                incoming[flanks[4]] = rVal;
                            } else if (gVal !== null) {
                                for (let k = 0; k < 5; k++) incoming[flanks[k]] = gVal;
                            } else if (rVal !== null) {
                                for (let k = 0; k < 5; k++) incoming[flanks[k]] = rVal;
                            }
                        } else if (flanks.length === 6) {
                            // Orthogonal projection to 6-pole hexad:
                            // Poles 0, 1: Active / Give / Initiator
                            // Pole 2: Middle / Shared
                            // Poles 3, 4: Receptive / Receive / Introverted
                            // Pole 5: Synthesis / Relational
                            const gVal = Object.prototype.hasOwnProperty.call(rating, "give") && Number.isFinite(Number(rating.give)) ? clamp(rating.give) : null;
                            const rVal = Object.prototype.hasOwnProperty.call(rating, "receive") && Number.isFinite(Number(rating.receive)) ? clamp(rating.receive) : null;
                            if (gVal !== null && rVal !== null) {
                                incoming[flanks[0]] = gVal;
                                incoming[flanks[1]] = gVal;
                                incoming[flanks[2]] = Math.round((2 * gVal + rVal) / 3);
                                incoming[flanks[3]] = rVal;
                                incoming[flanks[4]] = rVal;
                                incoming[flanks[5]] = Math.round((gVal + 2 * rVal) / 3);
                            } else if (gVal !== null) {
                                for (let k = 0; k < 6; k++) incoming[flanks[k]] = gVal;
                            } else if (rVal !== null) {
                                for (let k = 0; k < 6; k++) incoming[flanks[k]] = rVal;
                            }
                        } else if (flanks.length === 7) {
                            // Orthogonal projection to 7-pole heptad:
                            // Poles 0, 1: Active / Sovereign (give)
                            // Pole 2: Instinct / Primal
                            // Pole 3: Synthesis / Switch (average)
                            // Poles 4, 5: Receptive / Brat or Nurturer
                            // Pole 6: Submissive / Slave (receive)
                            const gVal = Object.prototype.hasOwnProperty.call(rating, "give") && Number.isFinite(Number(rating.give)) ? clamp(rating.give) : null;
                            const rVal = Object.prototype.hasOwnProperty.call(rating, "receive") && Number.isFinite(Number(rating.receive)) ? clamp(rating.receive) : null;
                            if (gVal !== null && rVal !== null) {
                                incoming[flanks[0]] = gVal;
                                incoming[flanks[1]] = Math.round((3 * gVal + rVal) / 4);
                                incoming[flanks[2]] = gVal;
                                incoming[flanks[3]] = Math.round((gVal + rVal) / 2);
                                incoming[flanks[4]] = rVal;
                                incoming[flanks[5]] = Math.round((gVal + 3 * rVal) / 4);
                                incoming[flanks[6]] = rVal;
                            } else if (gVal !== null) {
                                for (let k = 0; k < 7; k++) incoming[flanks[k]] = gVal;
                            } else if (rVal !== null) {
                                for (let k = 0; k < 7; k++) incoming[flanks[k]] = rVal;
                            }
                        } else if (flanks.length === 8) {
                            // Orthogonal projection to 8-pole octad:
                            // Diametric pairs (P0/P4, P1/P5, P2/P6, P3/P7)
                            // Poles 0, 1, 2, 3: Active / Give / Dynamic (top hemisphere)
                            // Poles 4, 5, 6, 7: Receptive / Receive / Grounded (bottom hemisphere)
                            const gVal = Object.prototype.hasOwnProperty.call(rating, "give") && Number.isFinite(Number(rating.give)) ? clamp(rating.give) : null;
                            const rVal = Object.prototype.hasOwnProperty.call(rating, "receive") && Number.isFinite(Number(rating.receive)) ? clamp(rating.receive) : null;
                            if (gVal !== null && rVal !== null) {
                                incoming[flanks[0]] = gVal;
                                incoming[flanks[1]] = gVal;
                                incoming[flanks[2]] = Math.round((3 * gVal + rVal) / 4);
                                incoming[flanks[3]] = Math.round((gVal + rVal) / 2);
                                incoming[flanks[4]] = rVal;
                                incoming[flanks[5]] = rVal;
                                incoming[flanks[6]] = Math.round((gVal + 3 * rVal) / 4);
                                incoming[flanks[7]] = Math.round((gVal + rVal) / 2);
                            } else if (gVal !== null) {
                                for (let k = 0; k < 8; k++) incoming[flanks[k]] = gVal;
                            } else if (rVal !== null) {
                                for (let k = 0; k < 8; k++) incoming[flanks[k]] = rVal;
                            }
                        }
                    }
                    // And backwards compatibility for triadic/tetradic/pentadic ratings on dual topics
                    if (!Object.keys(incoming).length && flanks.length >= 2) {
                        const vals = Object.values(rating).filter(Number.isFinite);
                        for (let k = 0; k < Math.min(flanks.length, vals.length); k++) {
                            incoming[flanks[k]] = clamp(vals[k]);
                        }
                    }
                    // LINE triad (2026-11-16 fix): a trilinear-line stores one
                    // scalar under the single key "line" (bind writes via
                    // shape.keys[0]), but archetype payloads carry one
                    // affinity per pole. Without a conversion the exact-key
                    // copy above finds no "line" key, the positional
                    // fallback requires >= 2 flanks, and the throw below
                    // aborts the whole load (the Polis Democrat landed 10
                    // of 38 ratings and no tab). Derive the position from
                    // the affinities using the line's own forward semantics
                    // (03e: middle weight = 1 - |V|/100, so |V| =
                    // (100 - middleAffinity) / 2); the direction is the
                    // more-liked end pole, a tie sits at 0. The middle pole
                    // is poles[1] — skins list their line poles in axis
                    // order [left, middle, right] — except the three topics
                    // whose mix pole is listed third (Health insurance:
                    // the ACA; Detector Design: Hybrid; Collaboration:
                    // Coopetition), where it is poles[2]. A missing or
                    // non-numeric pole falls through to the throw below:
                    // a partial affinity set is not silently guessed.
                    if (!Object.keys(incoming).length && 1 === flanks.length && "line" === flanks[0]) {
                        const pk = shape.poleKeys && 3 === shape.poleKeys.length ? shape.poleKeys : Object.keys(rating);
                        const midIdx = "xpo0029" === id || "xex0009" === id || "xex0025" === id ? 2 : 1;
                        const aL = Number(rating[pk[0]]), aM = Number(rating[pk[midIdx]]), aR = Number(rating[pk[1 === midIdx ? 2 : 1]]);
                        if (Number.isFinite(aL) && Number.isFinite(aM) && Number.isFinite(aR)) {
                            const mag = (100 - clamp(aM)) / 2;
                            incoming.line = clamp(Math.round((aL > aR ? -1 : aR > aL ? 1 : 0) * mag));
                        }
                    }
                }
                // The (n+1) intensity is not a flank, so the exact-key
                // copy above never moves it; carry it explicitly when
                // the payload rates it (line topics included — their
                // stored intensity counts like any other topic's).
                if (!("intensity" in incoming) && flanks.indexOf("give") === -1 && rating && Number.isFinite(Number(rating.intensity))) incoming.intensity = clamp(Math.round(Number(rating.intensity)));
                if (!Object.keys(incoming).length) throw new Error(`This profile contains an unreadable rating for "${topicName}"`);
                const applied = {};
                let anyBlocked = !1;
                Object.entries(incoming).forEach(([flank, value]) => {
                    if (guardManualFlip && "manual" === Ao(c, id, flank) && Number.isFinite(Number(existingFlankValue(id, flank))) && Ix(Number(existingFlankValue(id, flank))) !== Ix(value)) return void (anyBlocked = !0);
                    applied[flank] = value;
                });
                anyBlocked && flipped.push(id);
                if (!Object.keys(applied).length) return;
                let next;
                if (mergeFlanks) {
                    const cur = vt[c][id];
                    next = "number" == typeof cur ? { give: cur, receive: cur } : cur && "object" == typeof cur ? Object.assign({}, cur) : {};
                    Object.assign(next, applied);
                } else next = applied;
                Object.keys(applied).forEach(flank => {
                    Number(existingFlankValue(id, flank)) !== applied[flank] && ((changed[id] || (changed[id] = {}))[flank] = applied[flank]);
                    Co(c, id, flank, sourceFor(id, flank, flank));
                });
                vt[c][id] = next;
            });
            return { changed: changed, flipped: flipped };
        }
        // F3(b) (profiles-data refactor, Edit 3): ratings ingestion
        // for the import path, extracted from rk with no behavior
        // change — single vs. dual shape, clamping to [-100, 100],
        // and per-flank provenance from ratingSources, as before.
        // Fix 1, item 3: now a thin wrapper over
        // applyProfileRatings, the same path the converter uses.
        function importProfileRatings(c, e) {
            applyProfileRatings(c, e.ratings, { source: (topic, flank, supplying) => {
                const i = e.ratingSources && e.ratingSources[topic] && e.ratingSources[topic][supplying || flank];
                return "string" == typeof i && i.trim() ? i : "manual";
            } });
        }
        // Fix 1, item 2: the section ingestions rk used to write
        // twice — once for the load-into (pair) branch and once for
        // the create branch — now live here, once. The only
        // difference between the branches is notes: load-into merges
        // with the pair's existing notes, create starts from the
        // fresh (empty) lists, so mergeNotes selects it.
        function ingestProfileSections(c, e, noteDropped, mergeNotes) {
            e.annotations && "object" == typeof e.annotations && Object.entries(e.annotations).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void noteDropped(id, "annotations", value);
                // Importer rework Part A (R1 STRICT): only the three legal
                // annotation values (favorite / limit / notinterested) are
                // retained; any other value is dropped WITH RECORD via
                // noteDropped, never silently ignored.
                "favorite" !== value && "limit" !== value && "notinterested" !== value ? noteDropped(id, "annotations", value, "value") : (Qe[c][id] = value);
            }), e.fantasyOnly && "object" == typeof e.fantasyOnly && Object.entries(e.fantasyOnly).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void (value && noteDropped(id, "fantasyOnly", value));
                value && (Je[c][id] = !0);
            }), e.alreadyTried && "object" == typeof e.alreadyTried && Object.entries(e.alreadyTried).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void (value && noteDropped(id, "alreadyTried", value));
                value && (et[c][id] = !0);
            }), e.notes && "object" == typeof e.notes && Object.entries(e.notes).forEach(([id, value]) => {
                if (!Ke.has(id) && !isCatId(id) && !isSubId(id)) return void noteDropped(id, "notes", value);
                if (!Array.isArray(value)) return;
                // Importer fix package (2026-11-05): a note longer than
                // 64 characters is trimmed to 64 WITH RECORD (kind
                // "trimmed"), never silently shortened.
                const filtered = value.filter(v => "string" == typeof v).map(v => v.trim()).filter(Boolean).map(v => v.length > 64 ? (noteDropped(id, "notes", v, "trimmed"), v.slice(0, 64)) : v);
                const merged = mergeNotes ? [ ...new Set((tt[c][id] || []).concat(filtered)) ] : [ ...new Set(filtered) ];
                const capped = merged.slice(0, 16);
                // R1 STRICT, caps ruled 2026-11-05: notes are trimmed /
                // deduped / capped at 16 per topic; the excess over the
                // cap is dropped WITH RECORD as a value-drop (kind
                // "value") — the topic is current, only the extra
                // values are refused.
                merged.length > 16 && noteDropped(id, "notes", merged.slice(16), "value"), capped.length && (tt[c][id] = capped);
            });
        }
        function sxCheckSkinCompatibility(e) {
            if (!e || typeof e !== "object") return;
            const curSkin = (typeof window !== "undefined" && window.__SX_ACTIVE_SKIN) || "sexcapades";
            const fileSkin = (typeof e.skin === "string" && e.skin.trim()) ? e.skin.trim().toLowerCase() : null;
            const skinTitle = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : "Sexcapades";
            if (curSkin === "sexcapades") {
                if (fileSkin && fileSkin !== "sexcapades") {
                    throw new Error(`This profile is for the ${skinTitle(fileSkin)} skin, not Sexcapades.`);
                }
            } else {
                if (!fileSkin) {
                    throw new Error(`This profile does not specify a skin (legacy Sexcapades profile) and cannot be imported into ${skinTitle(curSkin)}.`);
                }
                if (fileSkin !== curSkin) {
                    throw new Error(`This profile is for the ${skinTitle(fileSkin)} skin, not ${skinTitle(curSkin)}.`);
                }
            }
        }
        function rk(e, n = {}) {
            eS();
            const i = ("string" == typeof e.profileName ? e.profileName : "").trim().replace(/\s+/g, " ").slice(0, 40);
            if (!i) throw new Error("This profile file does not include a profile name.");
            sxCheckSkinCompatibility(e);
            importTopicNames = e.topicNames && "object" == typeof e.topicNames ? e.topicNames : null;
            const a = {};
            e.importedChildren && "object" == typeof e.importedChildren && Object.values(e.importedChildren).forEach(e => {
                if (!e || "object" != typeof e) return;
                const t = ii(a, e.label, e.parentId);
                if (!t || e.id !== t.id) throw new Error("This profile uses an unknown imported-topic ID.");
            });
            const r = new Set([ ...Ke, ...Object.keys(a) ]);
            // F3(a): dropped/parked/retired bookkeeping lives in
            // importDropBookkeeping (above rk); noteDropped stays in
            // scope here for the section ingestions below.
            const { parked, dropped, retired, noteDropped } = importDropBookkeeping(e, r);
            // Pair-tab load (owner ruling, 2026-10-27): when the file
            // was chosen from a pair tab's Load menu, the load goes
            // INTO the active pair record — it never creates a
            // separate profile, never renames the pair, and never
            // touches its group record (the create path below deletes
            // ft for its fresh id; a merge must not). Ratings,
            // annotations, fantasy/tried flags, notes, and imported
            // children merge over the pair's existing data through
            // the same ingestion the create path uses. Merged values
            // are direct ratings written into the pair's computed
            // map: zt marks the pair dirty and sxMergeSaveNow then
            // saves the merged data to profile memory immediately
            // (split-center stage, 2026-10-27) — they do not wait on
            // the draft-autosave timer — and they survive
            // the session — but a later recompute (Rd, e.g. a
            // leniency change) rebuilds the pair from its source
            // profiles and replaces them, because the record cannot
            // distinguish merged values from computed ones.
            const sxMergeTarget = n && n.mergeIntoGroup && ft[n.mergeIntoGroup] && "group" === ft[n.mergeIntoGroup].kind && vt[n.mergeIntoGroup] ? n.mergeIntoGroup : null;
            if (sxMergeTarget) {
                const c = sxMergeTarget;
                // Switch-first-then-merge guard (load-target stage,
                // 2026-10-27): the merge enforces foreground = its
                // target itself, so the pressed-from rule holds even
                // if a future caller reaches this branch without the
                // Load menu's origin discipline.
                c !== Mt && Js(c);
                if (e.importedChildren && "object" == typeof e.importedChildren) {
                    const ma = Object.assign({}, at[c] || {});
                    Object.values(e.importedChildren).forEach(en => {
                        if (!en || "object" != typeof en) return;
                        const t = ii(ma, en.label, en.parentId);
                        t && Ke.add(t.id);
                    }), at[c] = ma;
                }
                importProfileRatings(c, e), ingestProfileSections(c, e, noteDropped, !0), e.droppedKeys = parked.concat(dropped), droppedKeyRecords[c] = e.droppedKeys,
                sxPairLoadInto = null, Ui(Sg), zt(c), sxMergeSaveNow(c), sxSel(c), sxSel(null, "dismiss"), Jw(), Mr({
                    animate: !1,
                    forceRepaint: !0
                }), Ih(), n.quiet || tS(`Loaded into ${wt[c]}: the file's ${Object.keys(e.ratings || {}).length} ratings merged with the pair's existing data.${dropped.length ? ` ${dropped.length} ${1 === dropped.length ? "entry was" : "entries were"} not loaded because their topic keys match no current topic.` : ""}`, {
                    persistent: !0
                });
                return c;
            }
            const o = function(e) {
                if (!ek(e)) return e;
                let t = 2, n = "";
                do {
                    const i = ` (${t++})`;
                    n = e.slice(0, Math.max(1, 40 - i.length)).trimEnd() + i;
                } while (ek(n));
                return n;
            }(i), s = (Xi(), function(e = {}) {
                if (!(Array.isArray(e.comparisonIds) ? !1 !== e.comparisonActive : an)) return [];
                const t = Array.isArray(e.comparisonIds) ? e.comparisonIds : Yi(), n = [ ...new Set(t.filter(e => vt[e])) ];
                return n.length >= 2 ? n : [];
            }(n)), l = !0 === e.blind && s.length >= 2, c = ik(o);
            n.quiet || sxSel(c), SX_PROFILE_RECORD_LISTS.forEach(e => e[c] = {}), wt[c] = o, profileUuids[c] = /^[0-9a-f-]{36}$/i.test(String(e.profileUuid || "")) ? String(e.profileUuid) : makeProfileUuid(), sampleProfileFlags[c] = !0 === e.sampleProfile, rt[c] = bb(e.gender), pz[c] = String(e.pronouns || "").trim().slice(0, 60),
            ot[c] = iv(e.sexuality), st[c] = Gb(e.roles || e.role), lt[c] = Xv(e.age), ct[c] = Zv(e.location),
            dt[c] = Vv(e.photos), ut[c] = Rv(e.contact), nt[c] = String(e.aboutMe || "").trim().slice(0, 1500),
            it[c] = String(e.termsOfService || "").trim().slice(0, 1500), vpt[c] = av(null != e.veil ? e.veil : e.net),
            vht[c] = Boolean(null != e.veilEnabled ? e.veilEnabled : e.netEnabled), at[c] = a, gt[c] = e.loaderState && "object" == typeof e.loaderState ? e.loaderState : {},
            mt[c] = St(e.completionTimes), delete ft[c], "group" === e.pairKind && (ft[c] = {
                kind: "group",
                pairOp: sxNormalizePairOp(e.pairOp)
            }), Object.keys(a).forEach(e => Ke.add(e)),
            /* Skin tag (2026-11-17): the skin this profile belongs to —
               the incoming file's own tag when it carries one (a Remember
               restore or a re-imported export), else the skin on screen
               right now. Jw() shows a tab only for the current skin
               (untagged = legacy, shows everywhere). */
            profileSkins[c] = "string" == typeof e.skin && e.skin ? e.skin : window.__SX_ACTIVE_SKIN || "sexcapades",
            la(c);
            importProfileRatings(c, e), ingestProfileSections(c, e, noteDropped, !1), e.ratingSources && "object" == typeof e.ratingSources && Object.keys(e.ratingSources).forEach(k => {
                r.has(k) || noteDropped(k, "ratingSources", e.ratingSources[k]);
            });
            const u = l ? sxBlindFilter(c, s) : null;
            Ui(Sg);
            const p = Object.prototype.hasOwnProperty.call(e, "importAttention");
            e.importAttention && "object" == typeof e.importAttention && [ "nodes", "newest" ].forEach(nm => {
                Array.isArray(e.importAttention[nm]) && e.importAttention[nm].forEach(id => {
                    if ("string" != typeof id || qn[id] || Xn(id) || a[id]) return;
                    noteDropped(id, "importAttention", id);
                });
            }), e.droppedKeys = parked.concat(dropped), droppedKeyRecords[c] = e.droppedKeys, n.quiet || !0 === e.sampleProfile || showImportResultDialog(o, Object.keys(vt[c]).length, dropped, retired);
            return (n.autoSelect ? sxAutoSelect(c) : Zi(c)), sxLoadLanding(c, n), qi(c, {
                ratings: vt[c],
                annotations: Qe[c],
                notes: tt[c],
                children: at[c]
            }, {
                noFlash: !0 === e.noFlash,
                hasAttentionState: p,
                attentionState: e.importAttention
            }), (e.sampleProfile ? Vt(c) : (zt(c), sxMergeSaveNow(c))), Lo(c) && Mr(), Ig(""), xg.textContent = "", n.quiet || (o !== i && tS(`Imported as ${o}`),
            od(c).length && t.setTimeout(() => bw(c), 0)), u ? tS(`Blind import kept ${u.kept} mutual ${1 === u.kept ? "match" : "matches"} across the ${u.groupSize}-profile comparison group and permanently discarded ${u.discarded} non-matching incoming ${1 === u.discarded ? "topic" : "topics"} from memory. The shared file is unchanged.`, {
                persistent: !0
            }) : !0 === e.blind && tS("This profile was set up for a blind comparison, but no comparison group was selected first, so the full profile was loaded instead. To do a blind comparison: select the profiles you want to compare first, then import this file again.", {
                persistent: !0
            }), c;
        }