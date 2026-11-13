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
            Object.entries(ratings).forEach(([id, rating]) => {
                if (!Ke.has(id) && !isSubId(id)) return;
                if (Ge(id, c).single) {
                    const candidates = "number" == typeof rating ? [ [ "give", rating ] ] : rating && "object" == typeof rating ? [ [ "give", rating.give ], [ "receive", rating.receive ] ] : [];
                    const found = candidates.find(([, v]) => Number.isFinite(Number(v)));
                    if (!found) throw new Error(`This profile contains an unreadable rating for ${id}`);
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
                if (Number.isFinite(Number(rating))) incoming.give = incoming.receive = clamp(rating); else if (rating && "object" == typeof rating) [ "give", "receive" ].forEach(flank => {
                    Object.prototype.hasOwnProperty.call(rating, flank) && Number.isFinite(Number(rating[flank])) && (incoming[flank] = clamp(rating[flank]));
                });
                if (!Object.keys(incoming).length) throw new Error(`This profile contains an unreadable rating for ${id}`);
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
                return "string" == typeof i && i.trim() ? i : "unknown";
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
        function rk(e, n = {}) {
            eS();
            const i = ("string" == typeof e.profileName ? e.profileName : "").trim().replace(/\s+/g, " ").slice(0, 40);
            if (!i) throw new Error("This profile file does not include a profile name.");
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
                pairOp: "straight" === e.pairOp ? "straight" : "bowtie"
            }), Object.keys(a).forEach(e => Ke.add(e)),
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
            }), Vt(c), Lo(c) && Mr(), Ig(""), xg.textContent = "", n.quiet || (o !== i && tS(`Imported as ${o}`), 
            od(c).length && t.setTimeout(() => bw(c), 0)), u ? tS(`Blind import kept ${u.kept} mutual ${1 === u.kept ? "match" : "matches"} across the ${u.groupSize}-profile comparison group and permanently discarded ${u.discarded} non-matching incoming ${1 === u.discarded ? "topic" : "topics"} from memory. The shared file is unchanged.`, {
                persistent: !0
            }) : !0 === e.blind && tS("This profile was set up for a blind comparison, but no comparison group was selected first, so the full profile was loaded instead. To do a blind comparison: select the profiles you want to compare first, then import this file again.", {
                persistent: !0
            }), c;
        }
        const ok = {
            "pleasure control": "cat-orgasm-reproductive-play",
            restraint: "cat-bondage-restriction",
            bondage: "cat-bondage-restriction",
            roleplay: "cat-roleplay-identity",
            degradation: "cat-psychological-dynamics",
            pain: "cat-impact-pain-body-modification",
            sensation: "cat-sensation-atmosphere",
            "edge play": "cat-impact-pain-body-modification",
            "potty play": "cat-fluids-messy-play"
        }, sk = {
            1: [ "t0327", "receive" ],
            2: [ "t0360", "give" ],
            3: [ "t0338", "give" ],
            4: [ "t0134", "receive" ],
            5: [ "t0360", "receive" ],
            6: [ "t0326", "receive" ],
            7: [ "t0245", "give" ],
            8: [ "t0093", "receive" ],
            9: [ "t0101", "give" ],
            10: [ "t0097", "receive" ],
            11: [ "cat-fluids-messy-play", "give" ],
            12: [ "t0136", "give" ],
            13: [ "t0035", "give" ],
            14: [ "t0185", "give" ],
            15: [ "t0185", "receive" ],
            16: [ "t0134", "give" ],
            17: [ "t0270", "receive" ],
            18: [ "cat-impact-pain-body-modification", "give" ],
            19: [ "t0240", "receive" ],
            20: [ "t0101", "receive" ],
            21: [ "t0093", "give" ],
            22: [ "t0354", "receive" ],
            23: [ "t0123", "receive" ],
            24: [ "t0326", "give" ],
            25: [ "cat-fluids-messy-play", "receive" ],
            26: [ "t0270", "receive" ],
            27: [ "cat-fluids-messy-play", "give" ],
            28: [ "t0327", "give" ],
            29: [ "t0270", "give" ],
            30: [ "t0035", "receive" ],
            31: [ "cat-impact-pain-body-modification", "receive" ],
            32: [ "t0326", "give" ],
            33: [ "t0270", "give" ],
            34: [ "t0354", "give" ],
            35: [ "t0040", "give" ],
            36: [ "t0070", "give" ],
            37: [ "t0035", "receive" ],
            38: [ "t0269", "give" ],
            39: [ "t0245", "receive" ],
            40: [ "t0096", "receive" ],
            41: [ "t0025", "receive" ],
            42: [ "t0239", "give" ],
            43: [ "t0123", "give" ],
            44: [ "t0096", "give" ],
            45: [ "t0056", "receive" ],
            46: [ "t0131", "give" ],
            47: [ "t0097", "give" ],
            48: [ "t0270", "receive" ],
            49: [ "t0327", "receive" ],
            50: [ "t0042", "give" ],
            51: [ "t0136", "receive" ],
            52: [ "t0097", "receive" ],
            53: [ "t0097", "give" ],
            54: [ "t0042", "receive" ],
            55: [ "t0074", "receive" ],
            56: [ "t0326", "receive" ],
            57: [ "t0056", "give" ],
            58: [ "t0035", "give" ],
            59: [ "t0270", "receive" ],
            60: [ "t0096", "give" ],
            61: [ "t0040", "receive" ],
            62: [ "t0025", "give" ],
            63: [ "t0096", "receive" ],
            64: [ "t0338", "receive" ],
            65: [ "cat-fluids-messy-play", "receive" ],
            66: [ "t0074", "give" ],
            67: [ "t0239", "receive" ],
            68: [ "t0040", "receive" ],
            69: [ "t0040", "give" ],
            70: [ "t0070", "receive" ],
            71: [ "t0327", "give" ]
        }, lk = new Set([ 2, 6, 7, 10, 17, 18, 19, 23, 24, 25, 26, 27, 29, 31, 32, 33, 35, 38, 40, 43, 44, 46, 47, 48, 52, 53, 56, 59, 60, 61, 63, 65, 68, 69 ]);
        function ck(e) {
            return String(e || "").toLowerCase().replace(/&/g, " and ").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
        }
        function dk(e) {
            const t = new Set([ "a", "an", "and", "the", "play", "roleplay", "kink", "fetish", "fantasy", "bondage", "sex", "sexual", "role", "roles" ]);
            return ck(e).split(" ").filter(e => e && !t.has(e)).map(e => e.replace(/(?:ing|ed|es|s)$/, "")).filter(Boolean);
        }
        let uk = null;
        function pk(e, t, n) {
            if (!e || !e.id) return null;
            if (isCatId(e.id)) return {
                id: migrateNodeKey(e.id),
                label: mx(migrateNodeKey(e.id)),
                child: null
            };
            const i = e.id, a = Xn(i), r = function(e) {
                const t = ni(e);
                if (!t) return null;
                const n = function() {
                    if (uk) return uk;
                    const e = {}, t = (t, n) => {
                        const i = ck(t);
                        i && !e[i] && (e[i] = n);
                        const a = i.replace(/\s+/g, "");
                        a && a !== i && !e[a] && (e[a] = n);
                    };
                    for (const e of h) for (const n of e.topics) {
                        const e = Wn(n);
                        t(n, e);
                        const i = String(n).replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, "").trim();
                        i && i !== n && t(i, e), String(n).split("/").forEach(i => {
                            const a = i.trim();
                            a && a !== n && t(a, e);
                        }), String(n).split("&").forEach(i => {
                            const a = i.trim();
                            a && a !== n && t(a, e);
                        });
                    }
                    return uk = e, e;
                }();
                let i = n[ck(t)];
                if (i) return i;
                if (i = n[ck(t).replace(/\s+/g, "")], i) return i;
                const a = t.replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, "").trim();
                if (a && a !== t && (i = n[ck(a)], i)) return i;
                const r = ck(t), o = new Set;
                r.endsWith("s") ? o.add(r.slice(0, -1)) : o.add(r + "s"), r.endsWith("es") && o.add(r.slice(0, -2));
                for (const e of o) if (i = n[e], i) return i;
                return null;
            }(t);
            if (r && r !== i) return {
                id: r,
                label: mx(r),
                child: null
            };
            if (a && function(e, t, n) {
                const i = ni(e);
                if (!i || ck(i) === ck(t.label)) return !1;
                if (n.uncertain || n.specific) return !0;
                const a = new Set(dk(i)), r = new Set(dk(t.label));
                return !!a.size && (![ ...a ].filter(e => r.has(e)).length || [ ...a ].some(e => !r.has(e)) && [ ...r ].some(e => !a.has(e)));
            }(t, a, e)) {
                const sxSugName = ni(t);
                if (sxSugName) return {
                    id: i,
                    label: mx(i),
                    child: null,
                    suggestion: {
                        name: sxSugName,
                        parentId: i
                    }
                };
            }
            return {
                id: i,
                label: mx(i),
                child: null
            };
        }
        function hk(e) {
            if (!e || !e.child) return e ? e.label : "";
            const t = Xn(e.child.parentId);
            return `${t ? t.label : mx(e.child.parentId)} → ${e.child.label}`;
        }
        // Minting-suggestions build (2026-11-05): pathed display for
        // converter mapping targets and suggestion parent paths, in the
        // minimal-spanning convention — foreshortened category form,
        // then subcategory, then topic, joined by ›, middle omitted
        // when flat. Category forms ruled 2026-11-05 (7 letters where
        // the name fits, 8 where it needs it), in taxonomy-file order.
        const SX_CAT_FORMS = {
            c0001: "POWEREX",
            c0002: "BONDAGE",
            c0003: "IMPACT",
            c0004: "SENSATN",
            c0005: "ROLEPLY",
            c0006: "CLOTHNG",
            c0007: "BODYFOCS",
            c0008: "PSYCHOL",
            c0009: "WATCHNG",
            c0010: "PARTNER",
            c0011: "SEXACTS",
            c0012: "POSITION",
            c0013: "ORGASM",
            c0014: "FLUIDS",
            c0015: "PRIMAL",
            c0016: "SERVICE",
            c0017: "FANTASY",
            c0018: "CONNECT"
        };
        function sxNodePath(e) {
            if (!e) return "";
            const id = migrateNodeKey(e);
            if (isCatId(id)) return SX_CAT_FORMS[id] || mx(id);
            const s = zn(id);
            if (s) {
                const c = h.find(c => c.name === s.branch);
                return `${c ? SX_CAT_FORMS[c.id] || s.branch : s.branch}›${s.label}`;
            }
            const n = Xn(id);
            if (n && "Topic" === n.kind) {
                const c = h.find(c => c.name === n.branch), form = c ? SX_CAT_FORMS[c.id] || n.branch : n.branch;
                if (n.parentId) {
                    const p = zn(n.parentId);
                    if (p) return `${form}›${p.label}›${n.label}`;
                }
                return `${form}›${n.label}`;
            }
            const ch = qn[id];
            if (ch && ch.parentId) return `${sxNodePath(ch.parentId)}›${ch.label}`;
            return mx(id);
        }
        // ============================================================

        // F9 (profiles-data refactor, Edit 3): the merge dispatcher's
        // and the serializer's kind vocabularies, named once. Routing
        // behavior is unchanged: merge kinds outside the set fall
        // through to the profile route (yx is exported as
        // window.__sexcapades.ProfileIO, so callers outside this
        // bundle may pass kinds it does not define; a throw would
        // break them), and serialize kinds outside the set keep the
        // long-standing "Unsupported profile export" throw.
        const SX_MERGE_KINDS = new Set([ "converter", "shared", "profile" ]), SX_SERIALIZE_KINDS = new Set([ "profile", "viewport", "export", "sync-card", "compact", "bundle", "envelope" ]);

        const fx = {
            dominant: {
                id: "t0010",
                direction: "give"
            },
            submissive: {
                id: "t0010",
                direction: "receive"
            },
            "master mistress": {
                id: "t0131",
                direction: "give",
                uncertain: !0
            },
            slave: {
                id: "t0131",
                direction: "receive",
                uncertain: !0
            },
            sadist: {
                id: "cat-impact-pain-body-modification",
                direction: "give",
                uncertain: !0
            },
            masochist: {
                id: "cat-impact-pain-body-modification",
                direction: "receive",
                uncertain: !0
            },
            rigger: {
                id: "t0022",
                direction: "give"
            },
            "rope bunny": {
                id: "t0022",
                direction: "receive"
            },
            degrader: {
                id: "t0239",
                direction: "give"
            },
            degradee: {
                id: "t0239",
                direction: "receive"
            },
            owner: {
                id: "t0131",
                direction: "give"
            },
            pet: {
                id: "t0136",
                direction: "receive"
            },
            "daddy mommy": {
                id: "t0125",
                direction: "give",
                uncertain: !0
            },
            "boy girl": {
                id: "t0125",
                direction: "receive",
                uncertain: !0
            },
            "brat tamer": {
                id: "t0005",
                direction: "give",
                uncertain: !0
            },
            brat: {
                id: "t0005",
                direction: "receive",
                uncertain: !0
            },
            "primal hunter": {
                id: "t0351",
                direction: "give"
            },
            "primal prey": {
                id: "t0351",
                direction: "receive"
            },
            exhibitionist: {
                id: "t0270",
                direction: "both"
            },
            voyeur: {
                id: "t0270",
                direction: "both"
            },
            ageplayer: {
                id: "t0123",
                direction: "both",
                uncertain: !0
            },
            switch: {
                id: null,
                direction: "both"
            },
            experimentalist: {
                id: null,
                direction: "both"
            },
            "non monogamist": {
                id: "cat-partner-configurations",
                direction: "both",
                uncertain: !0
            },
            vanilla: {
                id: "cat-connection-aftercare",
                direction: "both",
                uncertain: !0
            }
        }, yx = Object.freeze({
            importData(data, opts) {
                return wx(data, Object.assign({ quiet: true }, opts));
            },
            parse(e, t) {
                const n = String(e || "").toLowerCase();
                let i;
                if ("kinktest" === n) i = function(e) {
                    const t = {}, n = {}, i = {}, a = {}, r = {}, o = {}, s = [], l = [], c = [];
                    let d = 0, u = 0;
                    // Load example used to join every result with spaces, and a
                    // pasted line can carry a trailing "#1: favorite" note.
                    // Break those into the newline records this parser reads,
                    // without splitting a multi-word activity name.
                    const sxLines = String(e || "").replace(/\r\n?/g, "\n").replace(/[ \t]*[/|,;]*[ \t]+(?=#\d{1,2}\s*:)/g, "\n").replace(/(\bsub\b)[ \t]+(?=[A-Za-z])/gi, "$1\n").split("\n");
                    return sxLines.forEach((e, p) => {
                        const h = e.trim();
                        if (!h) return;
                        u++;
                        const g = h.match(/^([^:]+):\s*(\d{1,3})\s*%?\s*(?:dom|d)\s*[,;/]\s*(\d{1,3})\s*%?\s*(?:sub|s)\s*[\/|,;\s]*$/i);
                        if (g) {
                            const e = ck(g[1]), n = ok[e] && migrateNodeKey(ok[e]), i = Number(g[2]), a = Number(g[3]);
                            return !n || i > 100 || a > 100 ? void s.push(`Line ${p + 1}: category or percentage not recognized.`) : (sx(t, n, "give", Math.round(2 * i - 100)), 
                            sx(t, n, "receive", Math.round(2 * a - 100)), c.push(`${g[1].trim()} → ${sxNodePath(n)} · give ${i}% · receive ${a}%`), 
                            d++, void ("edge play" === e && l.push("Edge Play shares the Impact, pain & body modification branch with Pain.")));
                        }
                        const m = h.match(/^#?(\d{1,2})\s*:\s*(?:.*?:\s*)?([1-4]|favorite|neutral|not interested|hard limit|fantasy only|already tried)\s*$/i);
                        if (m) {
                            const e = Number(m[1]), u = sk[e], h = ck(m[2]);
                            if (!u) return void s.push(`Line ${p + 1}: KinkTest item #${e} has no mapping.`);
                            const g = migrateNodeKey(u[0]);
                            let f = "";
                            if ("1" === h || "hard limit" === h) n[g] = "limit", o[g] = !0, f = "Hard Limit"; else if ("2" === h || "not interested" === h) n[g] = "notinterested", 
                            o[g] = !0, f = "Not Interested"; else if ("favorite" === h) n[g] = "favorite", o[g] = !0, 
                            f = "Favorite"; else if ("neutral" === h) r[g] = !0, o[g] = !0, f = "Neutral"; else if ("fantasy only" === h) i[g] = !0, 
                            o[g] = !0, f = "Fantasy Only"; else if ("already tried" === h) a[g] = !0, o[g] = !0, 
                            f = "Already Tried"; else {
                                const e = {
                                    3: 33,
                                    4: 100
                                }[Number(h)];
                                sx(t, g, u[1], e), f = String(e);
                            }
                            return c.push(`#${e} → ${sxNodePath(g)} · ${u[1]} · ${f}`), d++, void (lk.has(e) && l.push(`#${e} uses the closest available Sexcapades topic.`));
                        }
                        s.push(`Line ${p + 1}: “${h.slice(0, 70)}” was not recognized.`);
                    }), lx(t, {
                        annotations: n,
                        fantasyOnly: i,
                        alreadyTried: a,
                        neutralNodes: r,
                        discreteNodes: o,
                        mappedLines: d,
                        totalLines: u,
                        warnings: s,
                        bestFit: [ ...new Set(l) ],
                        mappings: c,
                        // KinkTest fix (1.1): the branch ids this paste
                        // rated, so the merge records them as categoryHits
                        // (like FetLife's broadHits) and On Deck can
                        // propose their topics.
                        categoryHits: Object.keys(t).filter(e => isCatId(e) || isSubId(e))
                    });
                }(String(t || "")); else if ("checklist" === n || "yesnomaybe" === n) i = function(e) {
                    const t = {}, n = {}, i = {}, a = {}, r = {}, o = {}, s = {}, sxNotes = {}, l = [], c = [], d = [], sxSug = [];
                    let u = 0, p = 0, h = !1;
                    const g = (e, n, i) => {
                        !Ke.has(e) && !s[e] || (t[e] || (t[e] = {}), t[e][n] = i);
                    }, m = (e, t, h, m) => {
                        const f = ck(e);
                        if (!f) return;
                        if (p++, [ "religious play", "online roleplay" ].includes(f) || "other" === f || "kinks or fetishes not mentioned" === f) return void l.push(`Line ${h}: “${e}” has no matching topic and was skipped.`);
                        const y = (t.match(/(?:^|[,;\s])(T|B|S)(?=$|[,;\s])/i) || [])[1]?.toUpperCase() || (/\bgiving\b/.test(ck(t)) ? "T" : /\breceiving\b/.test(ck(t)) ? "B" : "S"), b = ck(t), v = t.match(/\b(Yes|Maybe|No)\b/i), N = (t.match(/^\s*([0-5])(?=\s*[,;]|\s*$)/) || [])[1], w = t.includes("!") || /\bfavorites?\b/.test(b), k = m || /\bhard limits?\b/.test(b), x = /\b(?:not interested|not into)\b/.test(b) || "no" === v?.[1].toLowerCase(), S = /\bneutral\b/.test(b), $ = /\bfantasy only\b/.test(b), E = /\balready tried\b/.test(b), W = /\bwatching\b/.test(b), A = !(v || N) || k || x || S ? null : N ? {
                            "0": 0,
                            "1": 20,
                            "2": 40,
                            "3": 60,
                            "4": 80,
                            "5": 100
                        }[N] : {
                            yes: 100,
                            maybe: 35
                        }[v[1].toLowerCase()] ?? null, C = e => {
                            k ? n[e] = "limit" : x ? n[e] = "notinterested" : w && (n[e] = "favorite"), S && (r[e] = !0), 
                            $ && (i[e] = !0), E && (a[e] = !0), (k || x || w || S || $ || E) && (o[e] = !0);
                        }, M = k ? "Hard Limit" : x ? "Not Interested" : S ? "Neutral" : w ? "Favorite" : $ ? "Fantasy Only" : E ? "Already Tried" : "";
                        if ("predator prey" === f) {
                            const t = "t0351", n = "T" === y ? [ [ t, "give" ] ] : "B" === y ? [ [ t, "receive" ] ] : [ [ t, "give" ], [ t, "receive" ] ];
                            return n.forEach(([e, t]) => {
                                null !== A && g(e, t, A), C(e);
                            }), d.push(`${e} → ${n.map(([e, t]) => `${sxNodePath(e)} · ${t}`).join(" + ")}${M ? ` · ${M}` : null !== A ? ` · ${A}` : ""}${$ && "Fantasy Only" !== M ? " · Fantasy Only" : ""}${E && "Already Tried" !== M ? " · Already Tried" : ""}`), 
                            void u++;
                        }
                        const I = ox(e);
                        if (!I) return void l.push(`Line ${h}: “${e}” was not recognized or has no matching topic.`);
                        const P = pk(I, e, s);
                        if (!P) return void l.push(`Line ${h}: “${e}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                        const L = P.id;
                        // Importer rework Part B/C: a "(watching)" /
                        // "(watching others wear)" qualifier takes the
                        // annotation path — a note on the topic, never a
                        // forced give/receive rating (same rule as the
                        // FetLife importer's watching/wearing stances).
                        W && (sxNotes[L] || (sxNotes[L] = []), sxNotes[L].includes("Watching · from the Yes / No / Maybe checklist") || sxNotes[L].push("Watching · from the Yes / No / Maybe checklist")), null !== A && ("T" !== y && "S" !== y || g(L, "give", A), "B" !== y && "S" !== y || g(L, "receive", A)), 
                        C(L), P.suggestion && sxSug.push({
                            name: P.suggestion.name,
                            parentId: L,
                            parentPath: sxNodePath(L),
                            section: "",
                            direction: y,
                            value: A
                        }), d.push(`${e} → ${sxNodePath(L)} · ${"T" === y ? "give" : "B" === y ? "receive" : "give + receive"}${M ? ` · ${M}` : null !== A ? ` · ${A}` : ""}${$ && "Fantasy Only" !== M ? " · Fantasy Only" : ""}${E && "Already Tried" !== M ? " · Already Tried" : ""}`), 
                        u++;
                    };
                    return e.split(/\r?\n/).forEach((e, t) => {
                        const n = e.trim();
                        if (!n) return;
                        if (/^limits\s*:/i.test(n)) {
                            h = !0;
                            const e = n.replace(/^limits\s*:/i, "").trim();
                            return void (e && e.split(/[,;]/).forEach(e => m(e, "", t + 1, !0)));
                        }
                        if (h) return void n.split(/[,;]/).forEach(e => m(e, "", t + 1, !0));
                        const i = n.indexOf(":");
                        if (i < 0) return l.push(`Line ${t + 1}: add “: Yes”, “: Maybe”, or “: No”.`), void p++;
                        m(n.slice(0, i), n.slice(i + 1), t + 1, !1);
                    }), {
                        ratings: t,
                        annotations: n,
                        fantasyOnly: i,
                        alreadyTried: a,
                        neutralNodes: r,
                        discreteNodes: o,
                        notes: sxNotes,
                        children: s,
                        suggestions: sxSug,
                        mappedLines: u,
                        totalLines: p,
                        warnings: l,
                        bestFit: [ ...new Set(c) ],
                        mappings: d
                    };
                }(String(t || "")); else if ("fetlife" === n) i = FetLifeImporter.run(String(t || "")); else if ("bdsmtest" === n) i = function(e) {
                    let t = String(e || "");
                    /<\/?[a-z][\s\S]*>/i.test(t) && (t = (new DOMParser).parseFromString(t, "text/html").body.textContent || ""), 
                    t = t.replace(/==\s*Results from bdsmtest\.org\s*==/gi, " ").replace(/\u00a0/g, " ");
                    const n = [], i = new Set, a = /(\d{1,3})\s*%\s*([A-Za-z][A-Za-z /()&-]*?)(?=\s*(?:,|;|[\r\n]|\d{1,3}\s*%|$))/g;
                    let r;
                    for (;r = a.exec(t); ) {
                        const e = r[2].trim().replace(/[.:-]+$/, "").trim(), t = Number(r[1]), a = ck(e);
                        e && t <= 100 && !i.has(a) && (n.push({
                            name: e,
                            score: t
                        }), i.add(a));
                    }
                    return n.length || t.split(/\r?\n/).forEach(e => {
                        const t = e.trim().match(/^([A-Za-z][A-Za-z /()&-]*?)\s*[:–—-]\s*(\d{1,3})\s*%?$/);
                        if (!t) return;
                        const a = t[1].trim(), r = Number(t[2]), o = ck(a);
                        r <= 100 && !i.has(o) && (n.push({
                            name: a,
                            score: r
                        }), i.add(o));
                    }), n.length ? function(e) {
                        const t = {}, n = {}, i = {}, a = {}, r = [], o = [], s = [], sxSug = [];
                        let l = 0, c = 0;
                        return e.forEach((e, d) => {
                            c++;
                            const u = String(e && e.name || "").trim(), p = e && null != e.score ? e.score : "", g = Number(String(p).replace("%", "").trim()), m = ck(u);
                            if (!u || !Number.isFinite(g) || g < 0 || g > 100) return void r.push(`Result ${d + 1} did not contain a readable role name and 0–100 score.`);
                            const f = fx[m];
                            if (!f) return void r.push(`Result ${d + 1}: “${u}” is not one of the 25 BDSMtest roles.`);
                            if (!f.id) return void r.push(`Result ${d + 1}: “${u}” has no close Sexcapades topic and was skipped.`);
                            const y = pk(f, u, a);
                            if (!y) return void r.push(`Result ${d + 1}: “${u}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                            const b = y.id;
                            0 === g ? (n[b] = !0, i[b] = !0) : (t[b] || (t[b] = {}), "give" !== f.direction && "both" !== f.direction || (t[b].give = Math.max(t[b].give || 0, g)), 
                            "receive" !== f.direction && "both" !== f.direction || (t[b].receive = Math.max(t[b].receive || 0, g))), l++, 
                            s.push(`${u} → ${sxNodePath(b)} · ${f.direction} · ${0 === g ? "Neutral" : g}`), y.suggestion && sxSug.push({
                            name: y.suggestion.name,
                            parentId: b,
                            parentPath: sxNodePath(b),
                            section: "",
                            direction: f.direction,
                            value: g
                        }), y.child && o.push(`“${u}” was kept as its own child under ${function(e) {
                                const t = qn[e];
                                if (t) return t.label;
                                for (const t of h) {
                                    if (catId(t.name) === e) return t.name;
                                    const n = t.topics.find(t => Wn(t) === e);
                                    if (n) return n;
                                }
                                return e;
                            }(f.id)}.`);
                        }), {
                            ratings: t,
                            annotations: {},
                            neutralNodes: n,
                            discreteNodes: i,
                            children: a,
                            suggestions: sxSug,
                            mappedLines: l,
                            totalLines: c,
                            warnings: r,
                            bestFit: [ ...new Set(o) ],
                            mappings: s
                        };
                    }(n) : {
                        ratings: {},
                        annotations: {},
                        mappedLines: 0,
                        totalLines: 0,
                        warnings: [ "No BDSMtest role scores were found. Paste lines such as “100% Dominant” from the results page." ],
                        bestFit: [],
                        mappings: []
                    };
                }(String(t || "")); else if ("json" === n) try {
                    i = JSON.parse(String(t || ""));
                } catch (e) {
                    throw new Error("This JSON file does not contain readable Sexcapades profile data.");
                } else if ("pdf" === n) try {
                    i = JSON.parse(function(e) {
                        const t = new TextDecoder("latin1").decode(e), i = t.indexOf("sexcapades-profile:");
                        if (i < 0) throw new Error("This PDF does not contain Sexcapades profile data.");
                        const a = t.slice(i + 19).match(/^([A-Za-z0-9+/=]+)/);
                        if (!a) throw new Error("This PDF does not contain Sexcapades profile data.");
                        return decodeURIComponent(escape(atob(a[1])));
                    }(t));
                } catch (e) {
                    if (e && /does not contain/.test(e.message || "")) throw e;
                    throw new Error("The embedded PDF profile data is not readable.");
                } else {
                    if ("png" === n) return async function(e) {
                        if (![ 137, 80, 78, 71, 13, 10, 26, 10 ].every((t, n) => e[n] === t)) throw new Error("This PNG does not contain Sexcapades profile data.");
                        let t = 8, n = null, i = "", sxSawIend = !1, sxSexSeen = !1;
                        for (;t + 12 <= e.length; ) {
                            const a = new DataView(e.buffer, e.byteOffset + t, 4).getUint32(0), r = t + 12 + a;
                            if (r > e.length) throw new Error("The PNG profile data is incomplete.");
                            const o = String.fromCharCode(...e.slice(t + 4, t + 8)), s = e.slice(t + 8, t + 8 + a);
                            if ("zTXt" === o) {
                                const sxNul = s.indexOf(0), sxKeyword = sxNul > 0 ? new TextDecoder("latin1").decode(s.slice(0, sxNul)) : "";
                                if ("Sexcapades" === sxKeyword || "vCard" === sxKeyword) {
                                    // Rank 5 guard: the chunk CRC is the
                                    // integrity check the PNG format
                                    // already carries, and the old code
                                    // never read it — a chunk whose bytes
                                    // were damaged after embedding could
                                    // still restore if it decompressed.
                                    // A bad CRC, a second Sexcapades
                                    // chunk, or a non-zero compression
                                    // method refuses the picture instead
                                    // of restoring it silently.
                                    if (!sxPngChunkCrc(e, t, a)) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    if ("Sexcapades" === sxKeyword && sxSexSeen) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    if (0 !== s[sxNul + 1]) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    const sxDecoded = (new TextDecoder).decode(await Lx(s.slice(sxNul + 2)));
                                    if ("Sexcapades" === sxKeyword) {
                                        sxSexSeen = !0;
                                        try { n = JSON.parse(sxDecoded); } catch (err) { throw new Error("The PNG profile data is damaged or incomplete."); }
                                    } else i = sxDecoded;
                                }
                            } else if ("iTXt" === o) {
                                const sxNul = s.indexOf(0), sxKeyword = sxNul > 0 ? new TextDecoder("latin1").decode(s.slice(0, sxNul)) : "";
                                if ("vCard" === sxKeyword) {
                                    if (!sxPngChunkCrc(e, t, a)) throw new Error("The embedded profile data in this PNG is damaged, so it was not imported.");
                                    const sxCompressed = 1 === s[sxNul + 1], sxMethod = s[sxNul + 2], sxLangEnd = s.indexOf(0, sxNul + 3), sxTransEnd = sxLangEnd >= 0 ? s.indexOf(0, sxLangEnd + 1) : -1;
                                    if (sxLangEnd < 0 || sxTransEnd < 0 || 0 !== sxMethod) throw new Error("The PNG vCard data is incomplete.");
                                    const sxRaw = s.slice(sxTransEnd + 1);
                                    i = (new TextDecoder).decode(sxCompressed ? await Lx(sxRaw) : sxRaw);
                                }
                            }
                            if ("IEND" === o) { sxSawIend = !0; break; }
                            t = r;
                        }
                        // A picture cut off after its profile chunk but
                        // before IEND is truncated, not restored: the
                        // old loop returned the payload in that case.
                        if (!sxSawIend) throw new Error("The PNG profile data is incomplete.");
                        if (!n) throw new Error("This PNG does not contain Sexcapades profile data.");
                        return {
                            payload: n,
                            vcard: i
                        };
                    }(t).then(e => ({
                        payload: this.validate("shared", e.payload),
                        vcard: e.vcard || ""
                    }));
                    if ("qr" === n) return async function(e) {
                        let t;
                        try {
                            t = JSON.parse(await async function(e) {
                                if (e.startsWith("SCP2J:")) return (new TextDecoder).decode(mu(e.slice(6)));
                                if (e.startsWith("SCP3:")) {
                                    if ("function" != typeof DecompressionStream) throw new Error("This browser cannot decompress that profile-data QR.");
                                    const t = new Blob([ Du(e.slice(5)) ]).stream().pipeThrough(new DecompressionStream("deflate"));
                                    return (new TextDecoder).decode(await new Response(t).arrayBuffer());
                                }
                                throw new Error("Unsupported profile-data QR format.");
                            }(String(e || "")));
                        } catch (e) {
                            throw new Error("That QR code does not contain readable Sexcapades profile data.");
                        }
                        if (t && "sexcapades" === t.a && 7 === t.v) return Hu(t, cu);
                        if (t && "sexcapades" === t.a && 6 === t.v) return Hu(t, uu);
                        if (t && "sexcapades" === t.a && (5 === t.v || 4 === t.v)) return Yw(Hu(t, pu));
                        if (Uw(t)) return t;
                        throw new Error("That QR code does not contain current Sexcapades profile data.");
                    }(String(t || "")).then(e => this.validate("profile", e));
                    if ("share-link" === n) i = function(e) {
                        const t = mu(e), n = new DataView(t.buffer, t.byteOffset, t.byteLength);
                        if (t.length < 9 || 83 !== t[0] || 88 !== t[1] || 1 !== t[2]) throw new Error("This is not a readable Sexcapades share link.");
                        if (n.getUint32(3) !== yu) throw new Error("This share link uses a different topic-map version.");
                        const i = t[7], a = t[8], r = 9 + i;
                        if (r + 3 * a !== t.length) throw new Error("This share link is incomplete.");
                        const o = {}, s = {}, l = {}, c = {};
                        for (let e = 0; e < a; e++) {
                            const n = r + 3 * e, i = t[n], a = t[n + 1], d = t[n + 2], u = fu[i];
                            if (!u) throw new Error("This share link uses an unknown topic.");
                            const p = vu(a >> 4), h = vu(15 & a), g = {};
                            null !== p && (g.give = p), null !== h && (g.receive = h), Object.keys(g).length && (o[u] = g), 
                            1 & d ? s[u] = "favorite" : 2 & d ? s[u] = "limit" : 16 & d && (s[u] = "notinterested"), 
                            4 & d && (l[u] = !0), 8 & d && (c[u] = !0);
                        }
                        return {
                            app: "sexcapades",
                            version: 16,
                            profileName: (new TextDecoder).decode(t.slice(9, r)).trim() || "Shared hypermap",
                            ratings: o,
                            annotations: s,
                            fantasyOnly: l,
                            alreadyTried: c,
                            notes: {},
                            importedChildren: {}
                        };
                    }(String(t || "")); else {
                        if ("profile" !== n && "shared" !== n) throw new Error(`Unsupported profile source: ${e}`);
                        i = t;
                    }
                }
                // HARD CONSTRAINT (sharing-sync refactor F7): a
                // share-link import maps to "profile" here ON
                // PURPOSE. The "profile" merge branch (rk) does NOT
                // autoSelect, so opening someone's share link adds
                // their profile WITHOUT joining it to the receiver's
                // collection/selection — unlike the "shared" branch,
                // which auto-selects (the 2026-10-25 scan-or-import
                // fix). Do not "clean up" this mapping to "shared":
                // that would silently change join behavior. Pinned
                // by harness case 3 in the sharing-sync verdict.
                return this.validate([ "kinktest", "checklist", "yesnomaybe", "fetlife", "bdsmtest" ].includes(n) ? "converter" : "profile" === n || "share-link" === n ? "profile" : "shared", i);
            },
            validate(e, t) {
                if ("converter" === e) {
                    if (!t || "object" != typeof t || !t.ratings || "object" != typeof t.ratings) throw new Error("Those results could not be converted into a profile.");
                    return [ "annotations", "fantasyOnly", "alreadyTried", "neutralNodes", "discreteNodes", "notes", "children" ].forEach(e => {
                        if (void 0 !== t[e] && (null === t[e] || "object" != typeof t[e] || Array.isArray(t[e]))) throw new Error("Those converted results are incomplete.");
                    }), t;
                }
                if ("compact" === e) {
                    if (!t || "sexcapades" !== t.a || 7 !== t.v || !Array.isArray(t.r)) throw new Error("The compact profile data is not valid.");
                    return t;
                }
                if ("shared" === e && t && "sexcapades-share" === t.app) {
                    if (1 !== t.version || !Array.isArray(t.profiles) || !t.profiles.length) throw new Error("This Sexcapades share bundle is incomplete.");
                    return t.profiles = t.profiles.map(e => this.validate("profile", e)), t;
                }
                if (Yw(t), !Uw(t)) throw new Error("This is not a valid current Sexcapades profile.");
                if (!("string" == typeof t.profileName ? t.profileName : "").trim()) throw new Error("This profile file does not include a profile name.");
                return t;
            },
            merge(e, t, n = {}) {
                const sxKind = SX_MERGE_KINDS.has(e) ? e : "profile";
                return "converter" === sxKind ? function(e, t = {}) {
                    if (eS(), !e) throw new Error("No converted profile data is ready to merge.");
                    const n = t.target || zk, i = t.type || Gk;
                    // Merge target (load-target stage, firm spec
                    // reaffirmed 2026-10-27 08:49): an explicit target
                    // — the profile the converter was pressed from, or
                    // the one the user picked in the chooser — wins.
                    // The session target zk is the only other source,
                    // and Ax now sets zk ONLY from a recorded target,
                    // never from whoever is on screen. With no recorded
                    // target and no explicit choice, n is empty and
                    // the merge REFUSES with the visible message below:
                    // no silent fallback, ever, and the converter never
                    // creates a profile. That same message is the
                    // nobody-on-screen edge (no target was chosen and
                    // nobody is on screen to load into). A pair/group
                    // target is blocked outright: a pair's numbers are
                    // computed from its source profiles, so converted
                    // results are never written directly into a pair.
                    if (!n || !vt[n]) return void (Pk.textContent = "No profile is on screen to load these results into, and no target was chosen, so nothing was loaded. Open a profile first, then try again.");
                    if (ft[n] && "group" === ft[n].kind) return void (Pk.textContent = `${wt[n] || "That profile"} is a pair/group profile, and test results can't be loaded directly into a pair — its numbers are computed from its source profiles. Pick one of the pair's own profiles instead. Nothing was loaded.`);
                    const a = {};
                    at[n] || (at[n] = {}), Object.values(e.children || {}).forEach(e => {
                        const t = ii(at[n], e.label, e.parentId);
                        t && (Ke.add(t.id), a[t.id] = t);
                    });
                    const r = {}, o = new Set;
                    Object.keys(e.discreteNodes || {}).forEach(e => {
                        const t = vt[n][e];
                        t && "object" == typeof t && ([ "give", "receive" ].forEach(a => {
                            Ao(n, e, a) === `test:${i}` && (delete t[a], Ze[n]?.[e] && delete Ze[n][e][a]);
                        }), Object.keys(t).length || delete vt[n][e], Ze[n]?.[e] && !Object.keys(Ze[n][e]).length && delete Ze[n][e]);
                    });
                    // Fix 1, item 3: ratings go through
                    // applyProfileRatings — the same rules as the main
                    // import path (shape, clamp, unknown skip,
                    // unreadable rejection) — merging per flank with
                    // test: provenance and the documented manual-flip
                    // guard. The discrete-node clearing above stays
                    // converter-specific.
                    const sxAppliedRatings = applyProfileRatings(n, e.ratings || {}, { source: () => `test:${i}`, mergeFlanks: !0, guardManualFlip: !0 });
                    Object.assign(r, sxAppliedRatings.changed);
                    sxAppliedRatings.flipped.forEach(id => o.add(id));
                    o.forEach(id => { delete Qe[n][id]; });
                    Object.keys(e.neutralNodes || {}).forEach(e => {
                        delete Qe[n][e];
                    });
                    // Importer rework Part A (R1 STRICT): section ingestion
                    // for ALL FIVE converter feeds (annotations / fantasyOnly
                    // / alreadyTried / notes) now goes through the ONE shared
                    // ingestProfileSections helper — the same helper the
                    // profile-file import path uses — instead of the direct
                    // writes that used to live here. Converter merge
                    // semantics are preserved as the helper's named options:
                    // notes MERGE with the target profile's existing notes
                    // (mergeNotes = true); the flipped-mark / neutral-node
                    // clearing above and the discrete-node clearing earlier
                    // stay converter-specific and run first, as before.
                    // Unknown keys, illegal annotation values, and notes
                    // past the 16-per-topic cap are dropped WITH RECORD:
                    // collected here, stored on the profile's dropped-key
                    // records, named in the import-result dialog, and
                    // written to the error log — never silently swallowed.
                    const sxConvDropped = [];
                    const sxConvNoteDropped = (key, section, value, kindOverride) => {
                        if ("string" != typeof key || !key || isCatId(key) || isSubId(key)) return;
                        if (Object.prototype.hasOwnProperty.call(BURIED_TOPIC_IDS, key)) return void sxConvDropped.push(importRetiredRecord(key, section, value));
                        const rec = {
                            key: key,
                            section: section,
                            value: value,
                            kind: kindOverride || (/^t\d{4}$/.test(key) ? "retired" : "unrecognized")
                        };
                        const guessed = importDroppedGuess(key);
                        "string" == typeof guessed && guessed && (rec.label = guessed), sxConvDropped.push(rec);
                    };
                    ingestProfileSections(n, e, sxConvNoteDropped, !0);
                    sxConvDropped.length && (droppedKeyRecords[n] = (droppedKeyRecords[n] || []).concat(sxConvDropped), sxConvDropped.forEach(rec => {
                        try {
                            __sxErrLog("converter-drop", new Error(`${i}: dropped ${rec.section} key ${rec.key}`));
                        } catch (e) {}
                    }));
                    const s = "kinktest" === i ? "KinkTest.co.uk" : "checklist" === i ? "the Yes / No / Maybe checklist" : "bdsmtest" === i ? "BDSMtest.org" : "the copied FetLife profile", l = wt[n], c = ("kinktest" === i || "checklist" === i) && Boolean(Zk), d = c ? Jk() : 0, u = "kinktest" === i ? ix.length : "checklist" === i ? ax.length : 0, p = c ? Object.values(Xk).filter(e => e.answer).length : 0;
                    const sxHits = Array.isArray(e.categoryHits) ? [ ...new Set(e.categoryHits.filter(e => "string" == typeof e && (isCatId(e) || isSubId(e)))) ] : [];
                    c && $t(n, i, d, p, u), gt[n] || (gt[n] = {}), gt[n][i] = {
                        input: $k.value,
                        answers: Object.assign({}, Xk),
                        fetLifeSource: Vk,
                        fetLifeDisplay: Yk,
                        savedAt: (new Date).toISOString(),
                        categoryHits: sxHits
                    }, zt(n), sxMergeSaveNow(n), ex(), Ui(vk), qi(n, {
                        ratings: r,
                        annotations: e.annotations,
                        notes: e.notes || {},
                        children: a
                    }), xg.textContent = `Loaded matches from ${s} into ${l}.${c ? ` Completed in ${xt(d)}; time saved with the profile.` : ""}`;
                    // Post-merge landing (load-target stage): the
                    // merged-into profile is ACTIVATED and added to
                    // the multi-select set; the comparison overlay
                    // is not opened by a load.
                    sxSel(n), sxSel(null, "dismiss"), n !== Mt && Js(n), Jw();
                    const sxApplied = Boolean(Object.keys(e.ratings || {}).length || Object.keys(e.annotations || {}).length || Object.keys(e.fantasyOnly || {}).length || Object.keys(e.alreadyTried || {}).length || Object.keys(e.notes || {}).length || Object.keys(e.children || {}).length || Object.keys(e.neutralNodes || {}).length || Object.keys(e.discreteNodes || {}).length || sxHits.length);
                    const sxUnmatched = "fetlife" === i && Array.isArray(e.unmappedFetishes) ? e.unmappedFetishes : [], sxNotApplied = "fetlife" === i && Array.isArray(e.notApplied) ? e.notApplied : [];
                    (sxUnmatched.length || sxNotApplied.length || sxConvDropped.length) && showConverterResultDialog(l, Object.keys(e.ratings || {}).length, sxUnmatched, sxNotApplied, sxConvDropped, s);
                    "fetlife" === i && (sxOutlineSortMode = "interest"), (sxApplied || "fetlife" === i) && (sxApplied && (window.__sxOnDeck = !0), sxHits.length && (window.__sxCategoryHits = sxHits, window.__sxOutlineHits = new Set(sxHits)), (() => {
                        try {
                            Do.open || /#\/?(app\/)?(?:list|listview)\/?$/i.test(String(location.hash || "")) ? Ms(n) : location.hash = "#app/listview";
                        } catch (e) { __sxErrLog("listview-open", e); }
                    })()), sxHits.length && "fetlife" === i && window.setTimeout(() => {
                        try {
                            const rd = document.getElementById("importResultDialog");
                            if (rd && rd.open) {
                                const iv = window.setInterval(() => {
                                    if (!rd.open) {
                                        window.clearInterval(iv);
                                        try { showFetLifeBroadSummary(e); } catch (err) { __sxErrLog("listview-open", err); }
                                    }
                                }, 300);
                            } else showFetLifeBroadSummary(e);
                        } catch (e) { __sxErrLog("listview-open", e); }
                    }, 450);
                }(this.validate("converter", t), n) : "shared" === sxKind ? function(e, sxOpts = {}) {
                    const t = an && Yi().length >= 2, n = t ? Yi() : [];
                    if (e && "sexcapades-share" === e.app && 1 === e.version && Array.isArray(e.profiles) && e.profiles.length) {
                        const i = e.profiles.map(e => yx.merge("profile", e, Object.assign({}, sxOpts, {
                            quiet: !0,
                            comparisonIds: n,
                            comparisonActive: t
                        })));
                        return sxSel(null, "clear"), i.length > 1 && i.forEach(e => {
                            vt[e] && (sxSel(e), la(e));
                        }), Ui(Sg), sxSel(null, "dismiss"), Jw(), ak(i[i.length - 1]), i[i.length - 1];
                    }
                    // F5: the caller's options ride along under the
                    // branch's own keys — comparison state comes from
                    // the live selection, and autoSelect stays
                    // hard-coded last (the scan-import fix) so the
                    // single-profile fallthrough keeps auto-selecting
                    // exactly as before and the two never fight.
                    return yx.merge("profile", e, Object.assign({}, sxOpts, {
                        comparisonIds: n,
                        comparisonActive: t,
                        mergeIntoGroup: sxPairLoadInto && ft[sxPairLoadInto] && "group" === ft[sxPairLoadInto].kind ? sxPairLoadInto : null,
                        autoSelect: !0
                    }));
                }(this.validate("shared", t), n) : rk(this.validate("profile", t), n);
            },
            serialize(e, t = {}) {
                if (!SX_SERIALIZE_KINDS.has(e)) throw new Error(`Unsupported profile export: ${e}`);
                let n;
                if ("profile" === e) n = Ww(t.person); else if ("viewport" === e) n = Qu(t.person, t.visibleIds, t.displayName || ""); else if ("export" === e) n = Ju(t.person, t.visibleIds, Boolean(t.includeProfileInfo), t.displayName || "", Boolean(t.blind)); else if ("sync-card" === e) n = serializeSyncCard(t.person, t.visibleIds, t.displayName || "", Boolean(t.includeProfileInfo), Boolean(t.blind)); else {
                    if ("compact" === e) return this.validate("compact", function(e, t = tu(e), n = !0, i = !1) {
                        const a = e => !t || t.has(e), r = Rv(ut[e]), o = Object.values(at[e] || {}).filter(e => a(e.id)), s = new Map(o.map((e, t) => [ e.id, t ])), l = e => hu.has(e) ? hu.get(e) : cu.length + s.get(e), c = e => Number.isFinite(Number(e)) ? Math.round(Number(e)) : null, d = Object.entries(vt[e] || {}).filter(([e, t]) => !isCatId(e) && a(e) && t && Number.isInteger(l(e)) && (Number.isFinite(Number(t.give)) || Number.isFinite(Number(t.receive)))).map(([e, t]) => [ l(e), c(t.give), c(t.receive) ]), u = Object.entries(Qe[e] || {}).filter(([e]) => a(e) && Number.isInteger(l(e))).map(([e, t]) => [ l(e), "favorite" === t ? 1 : "notinterested" === t ? 3 : 2 ]), p = Object.keys(Je[e] || {}).filter(e => a(e) && Number.isInteger(l(e))).map(e => l(e)), h = Object.keys(et[e] || {}).filter(e => a(e) && Number.isInteger(l(e))).map(e => l(e)), g = n ? Object.entries(tt[e] || {}).filter(([e]) => a(e) && Number.isInteger(l(e))).map(([e, t]) => [ l(e), Array.isArray(t) ? t.join(" ") : String(t || "") ]).filter(e => e[1]) : [], m = o.map(e => [ e.label, hu.get(e.parentId) ]).filter(e => Number.isInteger(e[1])), f = bb(rt[e]), j = String(pz[e] || ""), y = iv(ot[e]), b = Gb(st[e]), v = Xv(lt[e]), w = Zv(ct[e]), k = String(nt[e] || ""), x = String(it[e] || ""), S = {
                            a: "sexcapades",
                            v: 7,
                            n: n ? wt[e] || "Profile" : "Shared profile",
                            r: d
                        };
                        i && (S.k = 1), n && f.length && (S.g = f), n && j && (S.p = j), n && y.length && (S.s = y), n && b.length && (S.w = b), 
                        n && v && (S.y = v), n && w && (S.l = w), n && Ov(r) && (S.c = r), n && k && (S.b = k), 
                        n && x && (S.u = x), n && (S.e = av(vpt[e]), vht[e] && (S.f = 1), S.j = av(vpt[e]), vht[e] && (S.z = 1)), m.length && (S.d = m), 
                        u.length && (S.m = u), p.length && (S.h = p), h.length && (S.i = h), g.length && (S.t = g);
                        const $ = n ? St(mt[e]) : {};
                        return Object.keys($).length && (S.q = $), S;
                    }(t.person, t.allowedIds, !1 !== t.includeProfileInfo, Boolean(t.blind)));
                    if ("bundle" === e) n = function(e, t, n = {}) {
                        return Ku(e, t.map(e => Ww(e)), n);
                    }(t.bundleKind, t.ids || [], t.extra || {}); else {
                        if ("envelope" !== e) throw new Error(`Unsupported profile export: ${e}`);
                        n = Ku(t.bundleKind, t.profiles || [], t.extra || {});
                    }
                }
                return this.validate("bundle" === e || "envelope" === e ? "shared" : "profile", n);
            },
            errorMessage: (e, t = "Profile import failed.") => (e && "string" == typeof e.message ? e.message.trim() : "") || t
        });
        // DECISION (sharing-sync refactor F5): sync cards NEVER
        // carry photos. serializeSyncCard is the one place that
        // rule lives: it serializes exactly like an export (Ju)
        // and then empties the photos array, because a printed
        // card is scanned back in public contexts where attached
        // photos must not travel. Do not duplicate Ju here, and
        // do not "fix" the empty photos array — it is the rule,
        // not a bug. Callers reach it via yx.serialize("sync-card")
        // or the vx wrapper below.
        function serializeSyncCard(e, t, n = "", i = !1, a = !1) {
            const r = Ju(e, t, i, n, a);
            return r.photos = [], r;
        }
        function bx(e, t, n = !1, i = "", a = !1) {
            return yx.serialize("export", {
                person: e,
                visibleIds: t,
                includeProfileInfo: n,
                displayName: i,
                blind: a
            });
        }
        function vx(e, t, n = "", i = !1, a = !1) {
            return yx.serialize("sync-card", {
                person: e,
                visibleIds: t,
                displayName: n,
                includeProfileInfo: i,
                blind: a
            });
        }
        function wx(e, t = {}) {
            return yx.merge("profile", e, t);
        }
        function kx(e, t = {}) {
            return yx.merge("shared", e, t);
        }
        function xx(e) {
            const t = "kinktest" === Gk || "checklist" === Gk;
            Nk.hidden = !0, _k.hidden = !t, Dk.hidden = !t, _k.setAttribute("aria-pressed", String("test" === e)), 
            Dk.setAttribute("aria-pressed", String("paste" === e)), Rk.hidden = "test" !== e, 
            Ek.hidden = "paste" !== e, Ak.hidden = "paste" !== e, "test" === e ? ($x(), tx()) : requestAnimationFrame(() => $k.focus());
        }
        function Sx(e, t, n, i) {
            return `<button type="button" data-test-group="${n}" data-test-index="${i}" data-test-value="${t}" aria-pressed="false">${e}</button>`;
        }
        function $x() {
            Xk = Object.assign({}, Xk || {}), Kk = null, Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", 
            e.byId("previewTestAnswers").hidden = !1, "kinktest" === Gk ? (Hk.hidden = !0, 
            jk.textContent = "KinkTest · 71 activities", n(qk, 'Uses KinkTest.co.uk’s four-point scale: 1 never, 2 not my thing, 3 enjoy, 4 really enjoy or really want to try. The 71 activities run across 8 pages — answer every question on a page to unlock the next. Questions sourced from <a href="https://kinktest.co.uk/survey" target="_blank" rel="noopener noreferrer">KinkTest.co.uk</a>.'), 
            ktPage = 0, ktRender()) : (Hk.hidden = !0, jk.textContent = "Yes / No / Maybe activities", n(qk, 'Rate each item 0&ndash;5: <b>0</b> is a hard no, <b>5</b> is an enthusiastic yes. Each answer applies to both give and receive, scaled across the slider gradient (0 red &rarr; 5 green). Add optional notes per item &mdash; they import as that topic\u2019s notes. Based on the classic Yes / No / Maybe checklist.'), 
            n(Ok, (() => { let h = "", q = ""; ax.forEach((e, t) => { const c = axCat[e] || "Yes / No / Maybe"; c !== q && (q = c, h += `<h4 class="test-cat-head">${Hi(c)}</h4>`); h += `<article class="test-question ynm-q"><div class="test-question-text">${Hi(e)}</div><div class="test-answer-groups"><div class="test-choice-group ynm-scale" role="group" aria-label="Rate ${Hi(e)} from 0 to 5">${Sx("0", "0", "answer", t)}${Sx("1", "1", "answer", t)}${Sx("2", "2", "answer", t)}${Sx("3", "3", "answer", t)}${Sx("4", "4", "answer", t)}${Sx("5", "5", "answer", t)}</div></div><input type="text" class="test-note-input" data-test-note="${t}" placeholder="Notes for this item (optional)" aria-label="Notes for ${Hi(e)}"></article>`; }); return h; })())),
            Object.entries(Xk).forEach(([e, t]) => { if (!t) return; if (t.answer) { const n = Ok.querySelector(`[data-test-index="${e}"][data-test-value="${t.answer}"]`); n && n.setAttribute("aria-pressed", "true"); } if (t.note) { const i = Ok.querySelector(`[data-test-note="${e}"]`); i && (i.value = t.note); } }), Ex();
        }
        function Ex() {
            const e = "kinktest" === Gk ? ix.length : ax.length, t = Object.values(Xk).filter(e => e.answer).length;
            Bk.textContent = `${xt(Jk())} elapsed · ${t} of ${e} answered`;
            ktPagerState();
        }
        function Ax(t, i = "auto", sxTargetId) {
            // No silent fallback (firm spec, owner ruling 2026-10-27
            // 02:47, reaffirmed 08:49; the 08:02 reversal is withdrawn):
            // a converter invoked with no recorded target gets NO
            // session target — zk stays null, the title stays neutral,
            // and nothing is prefilled from whoever happens to be on
            // screen. The active profile is never quietly used as the
            // target. sxConverterOrigin likewise keeps ONLY a recorded
            // (pressed-from) target. An explicit choice in the
            // generic-entry chooser is the only way a no-origin session
            // acquires a target, and the merge itself refuses with a
            // visible error if it is ever reached with no target at
            // all. If no profile is on screen at all, zk stays null
            // for the same reason: the merge/Load paths show a message
            // instead of ever creating a profile.
            ex(), Gk = t, Kk = null, zk = sxTargetId && vt[sxTargetId] ? sxTargetId : null, sxConverterOrigin = sxTargetId && vt[sxTargetId] ? sxTargetId : null, sxFlFields = null;
            const a = function(e, t) {
                return gt[e] && gt[e][t] || null;
            }(zk, t);
            Vk = a?.fetLifeSource ?? null, Yk = a?.fetLifeDisplay ?? null, Xk = a && a.answers && "object" == typeof a.answers ? Object.assign({}, a.answers) : {}, 
            Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", $k.value = a && "string" == typeof a.input ? a.input : "", 
            Tk.hidden = "fetlife" !== t, e.byId("fetlifeGuide") && (e.byId("fetlifeGuide").hidden = "fetlife" !== t), Sk.textContent = "Paste results", vk.classList.toggle("checklist-layout", "checklist" === t), 
            Uk.textContent = "checklist" === t ? "Preview results" : "Preview matches";
            const r = zk ? wt[zk] || "this profile" : null;
            Lk.textContent = "Load into a profile", "kinktest" === t ? (wk.textContent = r ? `Load KinkTest.co.uk results into ${r}` : "Load KinkTest.co.uk results", 
            kk.textContent = "Answer all or part of KinkTest’s 71-activity survey here.", n(xk, 'Choose 1–4 for each activity, then preview the direct topic and give/receive mappings before loading. New answers update values previously loaded from a test. KinkTest’s 1 · Never maps directly to <b>Hard Limit</b>, 2 · Not my thing maps to <b>Not Interested</b>, and 3–4 remain positive slider ratings. A manual slider rating changes only when the test moves it to a different camp; everything else stays unchanged. <a href="https://kinktest.co.uk/survey" target="_blank" rel="noopener noreferrer">KinkTest survey</a>')) : "checklist" === t ? (wk.textContent = r ? `Load Yes / No / Maybe into ${r}` : "Load Yes / No / Maybe results", 
            kk.textContent = "Paste completed results, or answer the checklist below.", n(xk, "Paste one answer per line as <b>Item: 3</b> (0&ndash;5; Yes/Maybe/No also work). Or answer the complete checklist below and tap <b>Preview answers</b> to preview the mappings. Answers scale across the slider gradient on both give and receive: 0 is red, 5 is green. Names under <b>Limits:</b> map directly to <b>Hard Limit</b>. The labels Favorite, Neutral, Fantasy Only, and Already Tried are also recognized when included in a pasted result. New answers update values previously loaded from a test; everything else stays unchanged.")) : "bdsmtest" === t ? (wk.textContent = r ? `Load BDSMtest.org results into ${r}` : "Load BDSMtest.org results", 
            kk.textContent = "Paste the role scores from the results page.", Sk.textContent = "Paste the BDSMtest result list", 
            n(xk, "Copy the result lines that look like <b>100% Dominant</b>, paste them below, then preview the mappings. Positive percentages remain slider affinity values; an exact 0% maps directly to <b>Neutral</b>. Each role maps to give, receive, or both; missing roles stay unrated. This loader never creates negative ratings or Limits. New scores update values previously loaded from a test; everything else stays unchanged.")) : (wk.textContent = r ? `Load FetLife fetishes into ${r}` : "Load FetLife fetishes", 
            kk.textContent = "Build a hypermap from a profile’s Fetishes section without sharing your FetLife password.", 
            n(xk, 'Choose the saved page file below, or paste its HTML into the box — then preview the matches. <b>Load example</b> loads a sample saved page so you can see the whole flow first. Full detail: <b>How FetLife import works</b>, just below.')), 
            Ui(kg), Wi(vk), "kinktest" !== t && "checklist" !== t || "test" !== i ? "kinktest" !== t && "checklist" !== t || "paste" !== i ? "kinktest" === t ? xx("test") : "checklist" === t ? (Nk.hidden = !1, 
            Ek.hidden = !1, Ak.hidden = !1, Rk.hidden = !1, $x(), tx(), requestAnimationFrame(() => $k.focus())) : (Nk.hidden = !0, 
            Ek.hidden = !1, Ak.hidden = !1, Rk.hidden = !0, requestAnimationFrame(() => $k.focus())) : xx("paste") : xx("test"), 
            a && requestAnimationFrame(() => {
                ("kinktest" === t || "checklist" === t) && Object.keys(Xk).length ? e.byId("previewTestAnswers").click() : "kinktest" !== t && "checklist" !== t && $k.value.trim() && Uk.click();
            });
        }
        function Cx(e) {
            Kk = e, window.__sxUnmappedShare = "fetlife" === Gk ? (() => {
                const sxShare = [ ...(Array.isArray(Kk.unmappedFetishes) ? Kk.unmappedFetishes : []), ...(Array.isArray(Kk.suggestions) ? Kk.suggestions : []).map(s => ({
                    fetish_name: s.name,
                    list_type: "curious" === s.section ? "curious" : "into",
                    suggestion: !0,
                    parent_path: s.parentPath
                })) ];
                return sxShare.length ? sxShare : null;
            })() : null;
            const t = Object.keys(Kk.ratings).length, sxBranchRated = Object.keys(Kk.ratings).filter(e => isCatId(e) || isSubId(e)).length, sxTopicRated = t - sxBranchRated, sxSugCount = (Kk.suggestions || []).length, i = Object.keys(Kk.annotations || {}).length, a = new Set([ ...Object.keys(Kk.fantasyOnly || {}), ...Object.keys(Kk.alreadyTried || {}), ...Object.keys(Kk.neutralNodes || {}) ]).size, r = Object.keys(Kk.notes || {}).length, o = Object.keys(Kk.children || {}).length;
            Mk.textContent = `Matched ${Kk.mappedLines} of ${Kk.totalLines} result lines · ${sxTopicRated} slider-rated topics · ${sxBranchRated} slider-rated branches · ${i + a} discrete labels${sxSugCount ? ` · ${sxSugCount} suggested new ${1 === sxSugCount ? "topic" : "topics"}` : ""}${o ? ` · ${o} specific child ${1 === o ? "node" : "nodes"}` : ""}${r ? ` · ${r} with imported notes` : ""}`;
            const s = [], vaMsg = (Kk.warnings || []).find(e => /^We found “View all” links/.test(e));
            vaMsg && s.push({
                kind: "viewall",
                text: vaMsg
            }), (Kk.previewNotes || []).forEach(e => s.push({
                kind: "note",
                text: e
            })), (Kk.warnings || []).forEach(e => e !== vaMsg && s.push({
                kind: "unmatched",
                text: e
            })), (Kk.mappings || []).forEach(e => {
                const t = "string" == typeof e ? {
                    text: e,
                    tertiary: !1
                } : e;
                s.push({
                    kind: t.tertiary ? "tertiary" : "match",
                    text: t.text
                });
            }), (Kk.suggestions || []).forEach(e => {
                s.push({
                    kind: "suggestion",
                    text: `${e.name} — suggested under ${e.parentPath}`
                });
            }), Kk.bestFit.length && s.push({
                kind: "note",
                text: `${Kk.bestFit.length} best-fit mapping${1 === Kk.bestFit.length ? "" : "s"}: ${Kk.bestFit.slice(0, 6).join(" ")}`
            }), n(Ik, s.map(e => `<li class="preview-${e.kind}">${Hi(e.text)}</li>`).join("")), 
            Ck.hidden = !1, Lk.disabled = 0 === t && 0 === i && 0 === a && 0 === r, Pk.textContent = Lk.disabled ? "Nothing matched. Check the expected format above." : "";
        }
        function Mx() {
            try {
                if (zk && !vt[zk]) return void (Pk.textContent = "The profile these results were opened for is no longer available.");
                const e = "fetlife" === Gk && null !== Vk && $k.value === Yk ? Vk : $k.value;
                if ("fetlife" === Gk && !sxFlFields) sxFlFields = sxScrapeFetLifeProfile(e);
                Cx(yx.parse(Gk, e));
            } catch (t) {
                try {
                    Pk.textContent = "Preview failed: " + (t && t.message || t);
                } catch (e) { __sxErrLog("preview-label", e); }
            }
        }
        function Ix(e) {
            return e > 35 ? "for" : e >= 0 ? "curious" : "against";
        }
        function Px() {
            ex(), Ui(vk);
        }
        async function Lx(e) {
            if ("DecompressionStream" in window) try {
                const t = new Blob([ e ]).stream().pipeThrough(new DecompressionStream("deflate"));
                return new Uint8Array(await new Response(t).arrayBuffer());
            } catch (e) { __sxErrLog("app", e); }
            return function(e) {
                if (e.length < 6 || (e[0] << 8 | e[1]) % 31 != 0 || 8 != (15 & e[0]) || 32 & e[1]) throw new Error("The PNG profile data is not readable.");
                let t = 2, n = [], i = 0, a = !1;
                for (;!a; ) {
                    if (t + 5 > e.length - 4) throw new Error("The PNG profile data is incomplete.");
                    const r = e[t++];
                    if (a = Boolean(1 & r), r >>> 1 & 3) throw new Error("The PNG profile data needs a newer browser.");
                    const o = e[t] | e[t + 1] << 8, s = e[t + 2] | e[t + 3] << 8;
                    if (t += 4, 65535 & (o ^ ~s) || t + o > e.length - 4) throw new Error("The PNG profile data is incomplete.");
                    const l = e.slice(t, t + o);
                    n.push(l), i += l.length, t += o;
                }
                const r = new Uint8Array(i);
                let o = 0;
                n.forEach(e => {
                    r.set(e, o), o += e.length;
                });
                // Rank 5: the zlib stream ends in an Adler-32 checksum
                // over the decompressed bytes — the integrity check the
                // format already carries. The old code reserved those
                // four bytes in its bounds checks but never compared
                // them, so a stream with a damaged checksum could still
                // inflate here after DecompressionStream refused it.
                let sxAdlerA = 1, sxAdlerB = 0;
                for (let sxK = 0; sxK < r.length; sxK++) sxAdlerA = (sxAdlerA + r[sxK]) % 65521, sxAdlerB = (sxAdlerB + sxAdlerA) % 65521;
                const sxAdlerWant = (e[e.length - 4] << 24 | e[e.length - 3] << 16 | e[e.length - 2] << 8 | e[e.length - 1]) >>> 0;
                if ((sxAdlerB << 16 | sxAdlerA) >>> 0 !== sxAdlerWant) throw new Error("The PNG profile data is damaged or incomplete.");
                return r;
            }(e);
        }
        function Tx() {
            Tf && URL.revokeObjectURL(Tf), Tf = null, Fg.removeAttribute("href"), Fg.removeAttribute("download"), 
            Tg.replaceChildren(), Ng.textContent = "", Ui(Lg);
        }
        function Fx(t, i) {
            const a = function(e) {
                const t = String(e || "").replace(/\r\n[ \t]/g, "").split(/\r?\n/), n = Rv({}), i = Object.fromEntries(Object.entries(Kv).map(([e, t]) => [ t, e ]));
                let a = "";
                return t.forEach(e => {
                    const t = e.indexOf(":");
                    if (t < 1) return;
                    const r = e.slice(0, t).toUpperCase().split(";")[0], o = Gv(e.slice(t + 1).trim());
                    if ("FN" === r) a = o; else if (i[r]) n[i[r]] = o; else if ("TEL" === r) n.phone = o; else if ("EMAIL" === r) n.email = o; else if ("X-CUSTOM-SITE" === r) {
                        const e = o.split("~~~");
                        3 === e.length && n.customSites.push({
                            site: Gv(e[0]),
                            url: Gv(e[1]),
                            username: Gv(e[2])
                        });
                    } else if ("URL" === r) {
                        const e = _v.find(e => {
                            const t = _i(e, "").replace(/\/$/, "");
                            return t && o.toLowerCase().startsWith(t.toLowerCase());
                        });
                        e && (n[e] = o);
                    }
                }), {
                    name: a,
                    contact: Rv(n)
                };
            }(t), r = a.contact;
            if (!i || !Ov(r)) return;
            ut[i] = r, Tf && URL.revokeObjectURL(Tf), Tf = URL.createObjectURL(new Blob([ t ], {
                type: "text/vcard;charset=utf-8"
            }));
            const o = [], s = new Map;
            [ [ "telegram", "Telegram" ], [ "linktree", "linktr.ee" ], [ "fetlife", "FetLife" ], [ "chaturbate", "Chaturbate" ], [ "stripchat", "Stripchat" ], [ "myfreecams", "MyFreeCams" ], [ "pornhub", "PornHub" ], [ "xvideos", "XVideos" ], [ "xhamster", "xHamster" ], [ "onlyfans", "OnlyFans" ], [ "reddit", "Reddit" ], [ "x", "X" ] ].forEach(([e, t]) => {
                const n = r[e];
                if (!n) return;
                const i = n.toLowerCase();
                s.has(i) || s.set(i, {
                    sites: [],
                    user: n,
                    at: !1
                });
                const a = s.get(i);
                a.sites.push({
                    label: t,
                    href: _i(e, n)
                }), "telegram" === e && (a.at = !0);
            }), (r.customSites || []).forEach(e => {
                if (!e.username) return;
                const t = e.username.toLowerCase();
                s.has(t) || s.set(t, {
                    sites: [],
                    user: e.username,
                    at: !1
                }), s.get(t).sites.push({
                    label: e.site,
                    href: e.url
                });
            }), s.forEach(e => {
                const t = e.sites.map(e => `<a href="${Hi(e.href)}" target="_blank" rel="noopener noreferrer"><strong>${Hi(e.label)}</strong></a>`).join(", ");
                o.push(`<div class="imported-contact-row"><span>${t}</span><span>${Hi((e.at ? "@" : "") + e.user)}</span></div>`);
            }), r.phone && o.push(`<div class="imported-contact-row"><strong>Phone</strong><a href="${Hi("tel:" + r.phone.replace(/[^+\d]/g, ""))}" target="_blank" rel="noopener noreferrer">${Hi(r.phone)}</a></div>`), 
            r.email && o.push(`<div class="imported-contact-row"><strong>Email</strong><a href="${Hi("mailto:" + r.email)}" target="_blank" rel="noopener noreferrer">${Hi(r.email)}</a></div>`), 
            n(Tg, o.join("")), e.byId("importedContactTitle").textContent = `Contact info for ${a.name || wt[i] || "profile"}`, 
            Fg.href = Tf, Fg.download = `${String(a.name || wt[i] || "contact").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").trim() || "contact"}.vcf`, 
            Ng.textContent = "", Wi(Lg);
        }
        function sxScrapeFetLifeProfile(raw) {
            try {
                const html = ux(String(raw || "")) || String(raw || "");
                if (!/<(?:html|body|main|section|article|div|h1)\b/i.test(html)) return null;
                const doc = (new DOMParser).parseFromString(html, "text/html");
                doc.querySelectorAll("script,style,noscript,svg,iframe").forEach(e => e.remove());
                const clean = s => String(s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(), out = {};
                const h1 = doc.querySelector("h1");
                if (h1) for (const span of h1.querySelectorAll("span")) {
                    const m = clean(span.textContent).match(/^(\d{2,3})([A-Za-z]{1,3})\b/);
                    if (!m) continue;
                    const age = Xv(m[1]);
                    age && (out.age = age);
                    const gender = {
                        M: "man",
                        F: "woman",
                        GF: "genderfluid"
                    }[m[2].toUpperCase()];
                    gender && (out.gender = [ gender ]);
                    break;
                }
                const reserved = new Set([ "settings", "fetishes", "kinktionary", "search", "login", "join", "signup", "home", "explore", "kinksters", "users", "profile" ]);
                let username = "";
                for (const frame of doc.querySelectorAll("turbo-frame[src]")) {
                    const m = (frame.getAttribute("src") || "").match(/^\/([A-Za-z0-9_.-]+)\/profile\/fetishes/);
                    if (m) {
                        username = m[1];
                        break;
                    }
                }
                if (!username) {
                    const canon = doc.querySelector('link[rel="canonical"]'), og = doc.querySelector('meta[property="og:url"]'), url = canon && canon.getAttribute("href") || og && og.getAttribute("content") || "", m = url.match(/^https?:\/\/(?:www\.)?fetlife\.com\/([A-Za-z0-9_.-]+)\/?(?:[?#].*)?$/i);
                    m && (username = m[1]);
                }
                if (!username) for (const a of doc.querySelectorAll("a[href]")) {
                    const m = (a.getAttribute("href") || "").match(/^https?:\/\/(?:www\.)?fetlife\.com\/([A-Za-z0-9_.-]+)\/(?:activity|pictures|writings|events|groups|profile)\b/i);
                    if (m) {
                        username = m[1];
                        break;
                    }
                }
                username && !reserved.has(username.toLowerCase()) && (out.username = username);
                const rowTerms = label => {
                    for (const div of doc.querySelectorAll("div")) {
                        if (div.children.length || clean(div.textContent) !== label) continue;
                        const cell = div.nextElementSibling;
                        if (!cell) return null;
                        const clone = cell.cloneNode(!0);
                        clone.querySelectorAll("[data-popover-template]").forEach(e => e.remove());
                        const terms = [], seen = new Set;
                        return clone.textContent.split(",").forEach(piece => {
                            const term = clean(piece);
                            term && term.length <= 60 && !seen.has(term) && (seen.add(term), terms.push(term));
                        }), terms.length ? terms : null;
                    }
                    return null;
                }, pickValues = (selectEl, terms) => {
                    if (!selectEl || !terms) return null;
                    const vals = [], seen = new Set;
                    return terms.forEach(term => {
                        const key = ck(term), slug = term.toLowerCase().replace(/\s+/g, "-");
                        [ ...selectEl.options ].forEach(opt => {
                            const label = clean(opt.textContent).replace(/\s*\([^()]*\)\s*$/, "");
                            (ck(label) === key || opt.value === slug) && !seen.has(opt.value) && (seen.add(opt.value), vals.push(opt.value));
                        });
                    }), vals.length ? vals : null;
                };
                const orientation = pickValues(Ug, rowTerms("Orientation"));
                orientation && (out.orientation = orientation);
                const role = pickValues(Gg, rowTerms("Roles"));
                role && (out.role = role);
                const pronouns = rowTerms("Pronouns");
                pronouns && (out.pronouns = pronouns.join(", "));
                for (const h2 of doc.querySelectorAll("h2")) {
                    if (!/^about\b/i.test(clean(h2.textContent))) continue;
                    const siblings = [];
                    let story = null;
                    for (let sib = h2.nextElementSibling; sib; sib = sib.nextElementSibling) {
                        if (sib.matches("h2,h3") || sib.querySelector("h2,h3")) break;
                        sib.matches(".story__copy") && !story && (story = sib), siblings.push(sib);
                    }
                    const nodes = story ? [ story ] : siblings;
                    if (nodes.length) {
                        const text = nodes.map(src => {
                            const clone = src.cloneNode(!0);
                            return clone.querySelectorAll("br").forEach(br => br.replaceWith(doc.createTextNode("\n"))), 
                            clone.querySelectorAll("p").forEach(p => p.appendChild(doc.createTextNode("\n"))), clone.textContent;
                        }).join("\n").split(/\r\n|[\r\n]/).map(line => line.replace(/\u00a0/g, " ").replace(/[^\S\n]+/g, " ").trim()).filter(Boolean).join("\n");
                        text && (out.about = text.slice(0, 1500));
                    }
                    break;
                }
                return Object.keys(out).length ? out : null;
            } catch (err) {
                return __sxErrLog("fetlife-autopopulate-scrape", err), null;
            }
        }
        function sxStageFetLifeProfile(target, fields) {
            if (!bw(target)) return;
            const sc = ut[target] || {}, filled = v => String(v || "").trim().length > 0;
            fields.gender && !bb(rt[target] || []).length && kb(fields.gender), fields.orientation && !iv(ot[target] || []).length && Fb(fields.orientation), 
            fields.role && !Gb(st[target] || []).length && Vb(fields.role), fields.age && !filled(lt[target]) && (Kg.value = fields.age), fields.about && !filled(nt[target]) && (im.value = fields.about), 
            fields.username && !filled(sc.fetlife) && stageContactUsername(fields.username), fields.pronouns && !filled(pz[target]) && (Pz.value = String(fields.pronouns).trim().slice(0, 60)), xb(), Eb(), Ob(), Yb(), Qb(), dw(), 
            sm.textContent = "Filled in from the FetLife page you loaded — check them over, then Save to keep them. Close without saving to discard them.";
        }
        function sxOpenStagedProfile(target, fields) {
            let tries = 0, clear = 0;
            const tick = () => {
                if (_g.open) return;
                if (++tries > 100) return;
                const rd = e.byId("importResultDialog"), bd = e.byId("fetlifeBroadDialog");
                if (clear = rd && rd.open || bd && bd.open ? 0 : clear + 1, clear >= 2) {
                    try {
                        sxStageFetLifeProfile(target, fields);
                    } catch (err) {
                        __sxErrLog("fetlife-autopopulate-stage", err);
                    }
                    return;
                }
                window.setTimeout(tick, 300);
            };
            window.setTimeout(tick, 350);
        }
        Ok.addEventListener("click", e => {
            const v = __sxClosestAction(e.target, "ktNav");
            if (v) return void ktNavGo(v.getAttribute("data-kt-nav"));
            const t = __sxClosestAction(e.target, "testIndex");
            if (!t) return;
            const n = t.dataset.testIndex, i = t.dataset.testGroup;
            Xk[n] || (Xk[n] = {}), Ok.addEventListener("input", e => { const t = __sxClosestAction(e.target, "testNote"); if (!t) return; const n = t.getAttribute("data-test-note"); Xk[n] || (Xk[n] = {}), Xk[n].note = t.value; }), Xk[n][i] = t.dataset.testValue, __sxClosestAction(t, "testChoiceGroup").querySelectorAll("button").forEach(e => e.setAttribute("aria-pressed", String(e === t))), 
            Ex();
        }), _k.addEventListener("click", () => xx("test")), Dk.addEventListener("click", () => xx("paste")), 
        e.byId("previewTestAnswers") && e.byId("previewTestAnswers").addEventListener("click", () => {
            const e = function() {
                if ("kinktest" === Gk) {
                    const e = {}, t = {}, n = {}, i = [], a = [];
                    let r = 0;
                    return ix.forEach((o, s) => {
                        const l = Xk[s] && Xk[s].answer;
                        if (!l) return;
                        o.id = migrateNodeKey(o.id);
                        let c = "";
                        if ("1" === l) t[o.id] = "limit", n[o.id] = !0, c = "Hard Limit"; else if ("2" === l) t[o.id] = "notinterested", 
                        n[o.id] = !0, c = "Not Interested"; else {
                            const t = {
                                3: 33,
                                4: 100
                            }[l];
                            sx(e, o.id, o.direction, t), c = String(t);
                        }
                        i.push(`#${o.number} ${o.question} → ${sxNodePath(o.id)} · ${o.direction} · ${c}`), r++;
                    }), lx(e, {
                        annotations: t,
                        discreteNodes: n,
                        mappedLines: r,
                        totalLines: ix.length,
                        warnings: a,
                        bestFit: [],
                        mappings: i
                    });
                }
                const e = {}, t = {}, p = {}, n = {}, i = {}, a = [], r = [];
                let o = 0;
                const sxSug = [];
                const s = (t, n, i) => {
                    (e[t] || (e[t] = {}), e[t][n] = i);
                };
                const v = { "0": 0, "1": 20, "2": 40, "3": 60, "4": 80, "5": 100 };
                return ax.forEach((e, l) => {
                    const c = Xk[l] || {}, cc = axCat[e] || "Yes / No / Maybe",
                        ha = c.answer && void 0 !== v[c.answer], nt = c.note && c.note.trim();
                    if (!ha && !nt) return;
                    const d = ox(e);
                    if (!d) return void (ha && r.push(`${cc} / “${e}” has no matching topic and was skipped.`));
                    const u = pk(d, e, i);
                    if (u) {
                        ha && (s(u.id, "give", v[c.answer]), s(u.id, "receive", v[c.answer]), a.push({
                            text: `${cc} / ${e} → ${sxNodePath(u.id)} · give + receive · ${v[c.answer]}`,
                            tertiary: !1
                        }), o++), u.suggestion && sxSug.push({
                            name: u.suggestion.name,
                            parentId: u.id,
                            parentPath: sxNodePath(u.id),
                            section: "",
                            direction: "both",
                            value: v[c.answer]
                        });
                        nt && (p[u.id] = (p[u.id] ? p[u.id] + " · " : "") + nt);
                    } else ha && r.push(`${cc} / “${e}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                }), {
                    ratings: e,
                    annotations: t,
                    discreteNodes: n,
                    children: i,
                    suggestions: sxSug,
                    notes: p,
                    mappedLines: o,
                    totalLines: ax.length,
                    warnings: r,
                    bestFit: [],
                    mappings: a
                };
            }();
            e.mappedLines ? (Cx(e), Ck.scrollIntoView({
                block: "nearest"
            })) : Pk.textContent = "Choose at least one answer first.";
        }), Wk.addEventListener("click", () => {
            const e = ax.map((e, t) => {
                const n = Xk[t] && Xk[t].answer;
                return n ? `${e}: ${n[0].toUpperCase() + n.slice(1)}, S` : "";
            }).filter(Boolean);
            e.length ? ($k.value = e.join("\n"), $k.dispatchEvent(new Event("input", {
                bubbles: !0
            })), Mx(), Ck.scrollIntoView({
                block: "nearest"
            })) : Pk.textContent = "Choose at least one answer first.";
        }), e.all("[data-converter]").forEach(e => e.addEventListener("click", () => Ax(e.dataset.converter, e.dataset.converterMode || "auto"))), 
        e.all("[data-test-choice]").forEach(t => t.addEventListener("click", () => {
            const n = Xy || Mt;
            Ui(e.byId("testChooserDialog")), Xy = null, n && vt[n] && Ax(t.dataset.testChoice, "test", n);
        })), e.byId("rateInListViewChoice") && e.byId("rateInListViewChoice").addEventListener("click", () => {
            const t = Xy || Mt;
            Ui(e.byId("testChooserDialog")), Xy = null, t && vt[t] && (t !== Mt && Js(t), Ms(t));
        }), e.byId("closeTestChooser") && e.byId("closeTestChooser").addEventListener("click", Jy), e.byId("testChooserDialog") && e.byId("testChooserDialog").addEventListener("click", e => {
            "testChooserDialog" === e.target.id && Jy();
        }), e.byId("testChooserDialog") && e.byId("testChooserDialog").addEventListener("cancel", e => {
            e.preventDefault(), Jy();
        }), e.byId("closeConverter") && (e.byId("closeConverter").onclick = Px), vk.addEventListener("click", e => {
            e.target === vk && Px();
        }), vk.addEventListener("cancel", e => {
            e.preventDefault(), Px();
        }), e.byId("loadConverterExample") && (e.byId("loadConverterExample").onclick = () => {
            Vk = null, Yk = null, $k.value = "fetlife" === Gk ? fetlifeSampleHtml : "checklist" === Gk ? ax.map((e, t) => `${e}: ${t % 6}`).join("\n") : nx[Gk] || "", 
            Ck.hidden = !0, Lk.disabled = !0, Pk.textContent = "", "fetlife" === Gk && Mx();
        }), Tk && (Tk.onclick = () => Fk.click()), Fk.addEventListener("change", e => {
            const t = e.target.files[0];
            if (!t) return;
            const n = new FileReader;
            n.onload = () => {
                const i = px(String(n.result || ""));
                sxFlFields = sxScrapeFetLifeProfile(String(n.result || ""));
                Vk = i.text, Yk = function(e) {
                    const t = {
                        into: [],
                        curious: [],
                        soft: [],
                        hard: [],
                        favorite: [],
                        not: [],
                        neutral: [],
                        fantasy: [],
                        tried: []
                    }, n = {}, i = {
                        into: "Into",
                        curious: "Curious about",
                        soft: "Soft limits",
                        hard: "Hard limits",
                        favorite: "Favorites",
                        not: "Not into",
                        neutral: "Neutral",
                        fantasy: "Fantasy only",
                        tried: "Already tried"
                    }, a = {
                        into: "into",
                        interests: "into",
                        favorites: "favorite",
                        favorite: "favorite",
                        "curious about": "curious",
                        curious: "curious",
                        neutral: "neutral",
                        "soft limits": "soft",
                        "soft limit": "soft",
                        "hard limits": "hard",
                        "hard limit": "hard",
                        "not into": "not",
                        "not interested": "not",
                        "fantasy only": "fantasy",
                        "already tried": "tried"
                    }, r = {
                        giving: "giving",
                        "as a top": "giving",
                        top: "giving",
                        receiving: "receiving",
                        "as a bottom": "receiving",
                        bottom: "receiving",
                        both: "giving and receiving",
                        switch: "giving and receiving",
                        "giving and receiving": "giving and receiving",
                        "giving receiving": "giving and receiving",
                        "everything to do with it": "everything to do with it",
                        watching: "watching",
                        wearing: "wearing",
                        "watching others wear": "watching others wear",
                        "watching others wearing": "watching others wear"
                    };
                    let o = null, s = null;
                    gx(String(e || "")).forEach(e => {
                        const i = e.replace(/\u00a0/g, " ").replace(/^[\s•·*]+|[\s•·*]+$/g, "").trim();
                        if (!i) return;
                        const l = ck(i), c = l.replace(/\s+\d+$/, "");
                        if (a[c]) return o = a[c], void (s = null);
                        if (r[c]) return void (s = r[c]);
                        if ([ "fetishes", "kinks", "fetish list", "kink list", "edit", "show more", "show less" ].includes(l) || /^(?:view|show)\s+all\b/i.test(i) || /^https?:\/\//i.test(i)) return;
                        let d = i.split(/\t+|\s*\|\s*|\s+[—–]\s+/).map(e => e.trim()).filter(Boolean);
                        if (1 === d.length) {
                            const e = i.match(/^(.+?):\s*(.+)$/);
                            e && (d = [ e[1], e[2] ]);
                        }
                        const u = (d.shift() || "").replace(/^[-*•·\d.)\s]+/, "").trim();
                        if (!u) return;
                        let p = d.join(" ").trim(), h = o;
                        const g = ck(p), m = Object.keys(a).sort((e, t) => t.length - e.length).find(e => new RegExp(`(?:^|\\b)${e.replace(/ /g, "\\s+")}(?:\\b|$)`, "i").test(g));
                        if (m && (h = a[m], p = p.replace(new RegExp(`(?:^|[·—–,;|\\s])${m.replace(/ /g, "\\s+")}(?=$|[·—–,;|\\s])`, "i"), " ").replace(/^[\s,;|·—–]+|[\s,;|·—–]+$/g, "").trim()), 
                        !h) return;
                        const f = Object.keys(r).find(e => new RegExp(`(?:^|\\b)${e.replace(/ /g, "\\s+")}(?:\\b|$)`, "i").test(ck(p))), y = p || (f ? r[f] : s), b = y ? `${u} — ${y}` : u, v = ck(b);
                        n[h] || (n[h] = new Set), n[h].has(v) || (t[h].push(b), n[h].add(v));
                    });
                    const l = [ "into", "curious", "soft", "hard" ], c = [ "favorite", "not", "neutral", "fantasy", "tried" ];
                    if ([ ...l, ...c ].some(e => t[e].length)) {
                        const e = l.map(e => `${i[e]}: ${t[e].join(", ")}`);
                        return c.filter(e => t[e].length).forEach(n => e.push(`${i[n]}: ${t[n].join(", ")}`)), 
                        e.join("  ");
                    }
                    return String(e || "").replace(/FETLIFE_SECTION_HEADING_[1-6]/gi, " ").split(/\r\n|[\r\n]/).map(e => e.replace(/\u00a0/g, " ").replace(/[^\S\n]+/g, " ").trim().replace(/^,+\s*|\s*,+$/g, "")).filter(Boolean).join(", ");
                }(i.text), $k.value = Yk, Ck.hidden = !0, Lk.disabled = !0, Kk = null, Pk.textContent = i.missingSection ? `Opened ${t.name}, but the Fetishes section isn't in this file, so nothing was loaded. FetLife keeps that section in a separate frame that only a single-file save captures: open the profile, scroll to the Fetishes area and expand every subsection, then save the page again as 'Webpage, Single File' (.mhtml) — not 'HTML Only' — and load the new file. Or open fetlife.com/<username>/profile/fetishes and save that page instead.` : `Opened ${t.name}${i.sectionFound ? " and isolated its Fetishes section" : ""}. Preview the matches before loading them.`, 
                e.target.value = "";
            }, n.onerror = () => {
                Pk.textContent = "Could not read that saved page.", e.target.value = "";
            }, n.readAsText(t);
        }), (e.byId("previewConverter") || {}).onclick = Mx, Lk && (Lk.onclick = function() {
            if (Kk && !Lk.disabled) {
                const sxIds = Object.keys(wt).filter(e => Boolean(vt[e]) && !(ft[e] && "group" === ft[e].kind));
                if (!sxIds.length) return void (Pk.textContent = Object.keys(wt).some(e => Boolean(vt[e])) ? "Only pair/group profiles are open, and test results can't be loaded directly into a pair. Open one of the pair's own profiles first." : "No profile exists to load these results into.");
                // No second dialogue on a pressed-tab Load
                // (split-center stage, 2026-10-27): when this
                // converter session was opened from a profile tab's
                // Load menu, its origin is already the target — load
                // straight into it instead of asking again. Sessions
                // with no pressed-tab origin keep the chooser below.
                // Caller-tab re-import (owner ruling 2026-10-30): a
                // pair/group origin is NOT a direct target — the merge
                // itself refuses pair targets, so a direct load here
                // would strand the session on that refusal with no way
                // to pick a member profile. Pair origins fall through
                // to the chooser, which excludes pairs with its
                // explanation, exactly as the first-import prompt does.
                if (sxConverterOrigin && vt[sxConverterOrigin] && !(ft[sxConverterOrigin] && "group" === ft[sxConverterOrigin].kind)) {
                    const sxDirect = sxConverterOrigin;
                    try {
                        const sxMerged = yx.merge("converter", Kk, {
                            target: sxDirect,
                            type: Gk
                        });
                        if ("fetlife" === Gk && sxFlFields && vt[sxDirect]) {
                            const sxFields = sxFlFields;
                            sxFlFields = null, sxOpenStagedProfile(sxDirect, sxFields);
                        }
                        return sxMerged;
                    } catch (e) {
                        return void (Pk.textContent = yx.errorMessage(e, "Those results could not be loaded."));
                    }
                }
                const sxDlg = document.createElement("dialog");
                sxDlg.className = "converter-target-dialog";
                const sxClosePrompt = function() {
                    Ui(sxDlg), sxDlg.remove();
                }, sxTitle = document.createElement("h3");
                sxTitle.textContent = "Load into which profile?", sxDlg.appendChild(sxTitle), Object.keys(wt).some(e => vt[e] && ft[e] && "group" === ft[e].kind) && (() => {
                    const sxNote = document.createElement("p");
                    sxNote.textContent = "Pair/group profiles are not listed: test results can't be loaded directly into a pair, because a pair's numbers are computed from its source profiles. Pick one of the pair's own profiles instead.", sxDlg.appendChild(sxNote);
                })();
                sxIds.forEach(sxId => {
                    const sxBtn = document.createElement("button");
                    // Neutral chooser (firm spec, reaffirmed
                    // 2026-10-27 08:49): every profile is listed by
                    // plain name only — no on-screen marking,
                    // no preselection, and no button is focused as a
                    // default. The list stays neutral until the user
                    // explicitly chooses; that explicit choice, not
                    // whoever is on screen, is the target.
                    sxBtn.type = "button", sxBtn.textContent = wt[sxId], sxBtn.onclick = function() {
                        sxClosePrompt();
                        try {
                            const sxMerged = yx.merge("converter", Kk, {
                                target: sxId,
                                type: Gk
                            });
                            if ("fetlife" === Gk && sxFlFields && sxId && vt[sxId]) {
                                const sxFields = sxFlFields;
                                sxFlFields = null, sxOpenStagedProfile(sxId, sxFields);
                            }
                            return sxMerged;
                        } catch (e) {
                            Pk.textContent = yx.errorMessage(e, "Those results could not be loaded.");
                        }
                    }, sxDlg.appendChild(sxBtn);
                });
                const sxCancel = document.createElement("button");
                sxCancel.type = "button", sxCancel.textContent = "Cancel", sxCancel.onclick = function() {
                    sxClosePrompt();
                }, sxDlg.appendChild(sxCancel), sxDlg.addEventListener("cancel", () => {
                    sxClosePrompt();
                }), sxDlg.addEventListener("close", () => {
                    sxDlg.remove();
                }), document.body.appendChild(sxDlg), Wi(sxDlg);
            }
        }), $k.addEventListener("input", () => {
            sxFlFields = null, Vk = null, Yk = null, Ck.hidden = !0, Lk.disabled = !0, Kk = null, Pk.textContent = "";
        }), e.byId("closeImportedContact") && (e.byId("closeImportedContact").onclick = Tx), e.byId("doneImportedContact") && (e.byId("doneImportedContact").onclick = Tx), 
        Lg.addEventListener("click", e => {
            e.target === Lg && Tx();
        }), Lg.addEventListener("cancel", e => {
            e.preventDefault(), Tx();
        }), Fg.addEventListener("click", () => {
            Ng.textContent = "Your device will open or download the contact card.";
        });
        const Nx = e.byId("fileInput"), _x = e.byId("qrImageInput"), Dx = e.byId("qrCameraPanel"), Rx = e.byId("qrCameraVideo");
        let Ox = null, Bx = 0;
        function jx(e, t, n = 128) {
            const i = new Uint8ClampedArray(e.length);
            for (let a = 0; a < e.length; a += 4) {
                const r = .299 * e[a] + .587 * e[a + 1] + .114 * e[a + 2];
                let o;
                o = "contrast" === t ? Math.max(0, Math.min(255, 1.55 * (r - 128) + 128)) : r < n ? 0 : 255, 
                i[a] = i[a + 1] = i[a + 2] = o, i[a + 3] = 255;
            }
            return i;
        }
        function qx() {
            return new Promise(e => requestAnimationFrame(() => t.setTimeout(e, 0)));
        }
        async function Hx(e, t, n = 1 / 0) {
            const i = e.getImageData(0, 0, t.width, t.height), a = {
                inversionAttempts: "dontInvert"
            };
            await qx();
            let r = jsQR(i.data, i.width, i.height, a);
            if (r && r.data) return r.data;
            if (performance.now() > n) return null;
            const o = jx(i.data, "contrast");
            if (await qx(), r = jsQR(o, i.width, i.height, a), r && r.data) return r.data;
            if (performance.now() > n) return null;
            const s = jx(o, "threshold", function(e) {
                const t = new Uint32Array(256);
                let n = 0, i = 0;
                for (let a = 0; a < e.length; a += 4) {
                    const r = Math.round(.299 * e[a] + .587 * e[a + 1] + .114 * e[a + 2]);
                    t[r]++, i += r, n++;
                }
                let a = 0, r = 0, o = -1, s = 128;
                for (let e = 0; e < 256; e++) {
                    if (a += t[e], !a) continue;
                    const l = n - a;
                    if (!l) break;
                    r += e * t[e];
                    const c = r / a, d = (i - r) / l, u = a * l * (c - d) * (c - d);
                    u > o && (o = u, s = e);
                }
                return s;
            }(o));
            return await qx(), r = jsQR(s, i.width, i.height, {
                inversionAttempts: "attemptBoth"
            }), r && r.data || null;
        }
        function Wx(e) {
            const t = String(e || "").match(/^SCP4:([0-9A-Z]+):(\d+):(\d+):([\s\S]*)$/);
            if (!t) return null;
            const n = Number(t[2]), i = Number(t[3]);
            return !Number.isInteger(n) || !Number.isInteger(i) || n < 1 || i < 2 || n > i || i > 99 ? null : {
                bundleId: t[1],
                index: n,
                total: i,
                data: t[4]
            };
        }
        async function Ux(e, t = !1) {
            if ("function" != typeof window.jsQR && (window.__loadQrScanner && await window.__loadQrScanner(), 
            "function" != typeof window.jsQR)) throw new Error("The QR reader did not load.");
            const n = e instanceof HTMLVideoElement, i = n ? e : "function" == typeof createImageBitmap && e instanceof Blob ? await createImageBitmap(e) : await zu(await Vu(e)), a = n ? e.videoWidth : i.naturalWidth || i.width, r = n ? e.videoHeight : i.naturalHeight || i.height, o = [], s = new Set, l = performance.now() + (n ? 900 : 8500), c = e => !(!e || s.has(e) || (s.add(e), 
            o.push(e), 0));
            if (!a || !r) return n || "function" != typeof i.close || i.close(), t ? [] : null;
            if ("function" == typeof BarcodeDetector) try {
                const e = new BarcodeDetector({
                    formats: [ "qr_code" ]
                }), n = await e.detect(i);
                for (const e of n || []) c(e.rawValue);
                if (o.length && !t) return o[0];
            } catch (e) { __sxErrLog("app", e); }
            const d = n ? [ [ 0, 0, a, r, 1100 ] ] : [ [ .755 * a, .69 * r, .235 * a, .235 * r, 1320 ], [ .72 * a, .62 * r, .28 * a, .38 * r, 1120 ], [ 0, .62 * r, .32 * a, .38 * r, 1120 ], [ 0, 0, .34 * a, .38 * r, 1120 ], [ .66 * a, 0, .34 * a, .38 * r, 1120 ], [ 0, 0, a, r, 1200 ], [ .5 * a, .5 * r, .5 * a, .5 * r, 1120 ], [ 0, .5 * r, .5 * a, .5 * r, 1120 ], [ .5 * a, 0, .5 * a, .5 * r, 1120 ], [ 0, 0, .5 * a, .5 * r, 1120 ] ], u = new Set, p = e => {
                const n = Wx(e);
                if (!t || !n || u.has(n.total)) return;
                u.add(n.total);
                const i = 1 === n.total ? 1 : n.total <= 6 ? 2 : 3, o = Math.ceil(n.total / i), s = .047 * a, l = .035 * r, c = n.total > 1 ? .045 * r : 0, p = .0275 * a, h = .021 * r, g = (a - 2 * s - p * (i - 1)) / i, m = (r - 2 * l - c - .082 * r - h * (o - 1)) / o;
                for (let e = 0; e < o; e++) for (let t = 0; t < i; t++) {
                    const n = s + t * (g + p), i = l + c + e * (m + h);
                    d.push([ n, i, g, m, 1120 ]);
                }
            };
            o.forEach(p);
            const h = document.createElement("canvas"), g = h.getContext("2d", {
                willReadFrequently: !0
            });
            try {
                for (const [e, o, s, u, m] of d) {
                    if (performance.now() > l) break;
                    const d = Math.max(0, Math.floor(e)), f = Math.max(0, Math.floor(o)), y = Math.max(1, Math.min(a - d, Math.ceil(s))), b = Math.max(1, Math.min(r - f, Math.ceil(u))), v = Math.max(y, b), w = 175e4, k = Math.min(n ? 1.35 : 3.25, m / v, Math.sqrt(w / (y * b)));
                    h.width = Math.max(1, Math.round(y * k)), h.height = Math.max(1, Math.round(b * k)), 
                    g.clearRect(0, 0, h.width, h.height), g.imageSmoothingEnabled = !1, g.filter = "none", 
                    g.drawImage(i, d, f, y, b, 0, 0, h.width, h.height);
                    const x = await Hx(g, h, l);
                    if (x && (c(x), p(x), !t)) return x;
                    await qx();
                }
            } finally {
                h.width = 1, h.height = 1, n || "function" != typeof i.close || i.close();
            }
            return t ? o : o[0] || null;
        }
        e.byId("chooseFile") && (e.byId("chooseFile").onclick = () => Nx.click()), e.byId("chooseQrImage") && (e.byId("chooseQrImage").onclick = () => _x.click());
        const Gx = new Map;
        async function Kx(e, t = "") {
            const n = Wx(e);
            let i = String(e || ""), a = "";
            if (n) {
                let e = Gx.get(n.bundleId);
                if (e && e.total === n.total || (e = {
                    total: n.total,
                    parts: new Map
                }, Gx.set(n.bundleId, e)), e.parts.set(n.index, n.data), e.parts.size < e.total) return Ig(`Captured profile QR ${n.index}/${e.total} · ${e.parts.size} of ${e.total} collected. Scan the remaining numbered codes in any order.`, "busy"), 
                null;
                if (i = Array.from({
                    length: e.total
                }, (t, n) => e.parts.get(n + 1) || "").join(""), !i || iu((new TextEncoder).encode(i)).toString(36).toUpperCase() !== n.bundleId) throw Gx.delete(n.bundleId), 
                new Error("The numbered profile QR set is incomplete or damaged.");
                Gx.delete(n.bundleId), a = `Recovered all ${e.total} numbered profile QR codes.`;
            }
            const r = kx(await yx.parse("qr", i)), o = a || t || `Imported ${wt[r]} from profile-data QR.`;
            return Sg.open && Ui(Sg), Ig(o, "success"), (t || a) && tS(o), r;
        }
        async function zx() {
            Bx && cancelAnimationFrame(Bx), Bx = 0, Ox && (Ox.getTracks().forEach(e => e.stop()), 
            Ox = null), Rx.srcObject = null, Dx.hidden = !0;
        }
        async function Vx() {
            if (Ox) {
                try {
                    const e = await Ux(Rx);
                    if (e && await Kx(e)) return void await zx();
                } catch (e) {
                    Ig(`QR import failed: ${e.message || "That QR code could not be read."}`, "error", !0);
                }
                Bx = requestAnimationFrame(Vx);
            }
        }
        async function Yx() {
            p("scan_started");
            try {
                await zx(), Ox = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },
                    audio: !1
                }), Rx.srcObject = Ox, Dx.hidden = !1, await Rx.play(), Ig("Point the camera at a profile-data QR. For a numbered set, scan every code in any order.", "busy"), 
                Vx();
            } catch (e) {
                Ig("Camera scanning is unavailable or permission was not granted.", "error", !0);
            }
        }
        e.byId("startQrCamera") && (e.byId("startQrCamera").onclick = Yx), e.byId("stopQrCamera") && (e.byId("stopQrCamera").onclick = zx);
        let Xx, Zx = 0;
        async function Qx(e, t, n) {
            if (n !== Zx) throw new Error("Import cancelled.");
            Ig("No embedded profile data found. Looking for a profile QR…", "busy"), await qx();
            const i = await Ux(e, !0);
            if (n !== Zx) throw new Error("Import cancelled.");
            const a = i.filter(e => Wx(e) || String(e || "").startsWith("SCP3:") || String(e || "").startsWith("SCP2J:"));
            if (!a.length) throw t;
            let r = null, o = null;
            for (const e of a) {
                o = Wx(e) || o;
                const t = await Kx(e, "metadata has been stripped, data has been recovered from QR code.");
                t && (r = t), await qx();
            }
            if (r) return r;
            if (o) {
                const e = Gx.get(o.bundleId), t = e ? e.parts.size : 0;
                throw new Error(`Found ${t} of ${o.total} numbered profile QR codes. Try the original image or scan the missing codes with the camera.`);
            }
            throw t;
        }
        function Jx(e) {
            const t = e.target.files[0];
            if (!t) return;
            const n = ++Zx;
            Ig(`Reading ${t.name}…`, "busy");
            const i = new FileReader;
            i.onload = async () => {
                if (n !== Zx) return;
                const a = new Uint8Array(i.result), r = 137 === a[0] && 80 === a[1] && 78 === a[2] && 71 === a[3], o = "application/pdf" === t.type || /\.pdf$/i.test(t.name) || 37 === a[0] && 80 === a[1] && 68 === a[2] && 70 === a[3], s = "application/json" === t.type || /\.json$/i.test(t.name), l = "image/svg+xml" === t.type || /\.svg$/i.test(t.name), c = /\.svgz$/i.test(t.name) || 31 === a[0] && 139 === a[1], d = String(t.type || "").startsWith("image/") || r;
                let u = "read";
                try {
                    if (await qx(), n !== Zx) return;
                    if (s) u = "json", kx(yx.parse("json", (new TextDecoder).decode(a))); else if (o) u = "pdf", 
                    kx(yx.parse("pdf", a)); else if (l || c) {
                        u = c ? "svgz" : "svg";
                        let e = a;
                        if (c) {
                            if ("function" != typeof DecompressionStream) throw new Error("This browser cannot open SVGZ files. Import the uncompressed SVG instead.");
                            e = new Uint8Array(await new Response(new Blob([ a ]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
                        }
                        const i = (new DOMParser).parseFromString((new TextDecoder).decode(e), "image/svg+xml");
                        if (i.querySelector("parsererror") || !i.documentElement || "svg" !== i.documentElement.localName) throw new Error("This SVG file is not valid.");
                        const r = i.querySelector("metadata > sexcapades-profile, sexcapades-profile");
                        if (r && String(r.textContent || "").trim()) {
                            let e;
                            try {
                                e = JSON.parse(r.textContent);
                            } catch (e) {
                                throw new Error("The profile data embedded in this SVG is damaged or incomplete.");
                            }
                            u = "profile", kx(e);
                        } else {
                            if (c) throw new Error("This SVGZ does not contain embedded Sexcapades profile data.");
                            u = "qr", await Qx(t, new Error("This SVG does not contain embedded Sexcapades profile data."), n);
                        }
                    } else {
                        if (!d) throw new Error("Choose a current Sexcapades SVG, SVGZ, PNG, PDF, sync card or profile-QR image, or profile JSON file.");
                        if (r) {
                            let e = null;
                            try {
                                e = await yx.parse("png", a);
                            } catch (e) {
                                u = "qr", await Qx(t, e, n);
                            }
                            if (e) {
                                u = "profile";
                                const t = kx(e.payload);
                                e.vcard && Fx(e.vcard, t);
                            }
                        } else u = "qr", await Qx(t, new Error("This image does not contain a readable Sexcapades profile-data QR code."), n);
                    }
                } catch (e) {
                    n === Zx && Pg(e, t, u);
                }
                e.target.value = "";
            }, i.onerror = () => {
                n === Zx && Pg(new Error("The file could not be read."), t, "read"), e.target.value = "";
            }, i.readAsArrayBuffer(t);
        }
        function eS() {
            const n = e.byId("toast"), i = e.byId("toastMessage");
            t.clear(Xx), n.classList.remove("show", "is-persistent"), n.removeAttribute("data-tone"), 
            n.setAttribute("role", "status"), i.textContent = "";
        }
        function tS(n, i = {}) {
            const a = e.byId("toast"), r = e.byId("toastMessage"), o = !0 === i.persistent || "error" === i.tone;
            r.textContent = n, a.classList.toggle("is-persistent", o), i.tone ? a.dataset.tone = i.tone : a.removeAttribute("data-tone"), 
            a.setAttribute("role", "error" === i.tone ? "alert" : "status"), a.classList.add("show"), 
            t.clear(Xx), o || (Xx = t.setTimeout(() => a.classList.remove("show"), 1800));
        }
        Nx.addEventListener("change", Jx), _x.addEventListener("change", Jx), Sg.addEventListener("close", () => {
            Zx++, zx(), sxPairLoadInto = null, sxLoadOriginId = null;
        }), e.byId("toastDismiss") && e.byId("toastDismiss").addEventListener("click", eS);
        const nS = e.one(".easter-egg");
        nS.addEventListener("click", () => {
            fetch("https://countapi.mileshilliard.com/api/v1/hit/sexcapades-easter-egg-skewed-view-blue", {
                mode: "no-cors",
                keepalive: !0
            }).catch((e) => { __sxErrLog("analytics-beacon", e); });
        });
        let iS = 0, aS = 0;
        e.one(".intro h1").addEventListener("click", () => {
            t.clear(aS), aS = t.setTimeout(() => iS = 0, 1700), 5 === ++iS && (iS = 0, nS.click());
        });
