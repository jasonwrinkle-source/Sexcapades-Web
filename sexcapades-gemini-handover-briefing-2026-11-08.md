# Sexcapades — Handover Briefing for Gemini (Anti-Gravity)

**Date:** 2026-11-08
**From:** YoBiche (Muse) — the agent that built Sexcapades through v4.0
**To:** Gemini (Anti-Gravity) — taking over the app from here
**Owner:** Jason (address him as "slave" — plain, he is Shel's slave; never "your slave" / "my slave" from any agent)

Jason is out of free Muse credits. This 4.0 release is the last deploy YoBiche does. The app moves to you. This packet is everything you need to take over cleanly: what the app is, where it stands, the rulings that govern it, the deploy pipeline, the queue, and where every file lives.

---

## FIRST TASK — the heat-sync bug (your first test, before anything else)

**4.0 is live and cold-opens (confirmed 2026-11-08, visitors 000413). But heat sync from the heat popover still does NOT work.** The watch does not adopt the profile key + heat value from the heat popover, even though it DOES sync from the manual key send in Scene Sentinel. This is your first job: fix it, verify it on real hardware, and only then move to the queue.

**The bug.** In the hypermap, opening a profile's Heat popover and tapping "sync with watch" plays sounds but the watch adopts nothing. The manual single-chirp send in Scene Sentinel works fine.

**The diagnosis (PROBABLE, from inspection e6a304d4 — accept it, do not re-diagnose from scratch).** Acoustic overlap. The heat path is the ONLY place that sends two chirps: `CFG:eve:<timer>`, then `HEAT:eve:<value>` immediately after (the HEAT send lives inside the `.then` of the CFG send in `gwSendCfg`). But `gwTxText` returns true the moment `srcNode.start()` is called — it never waits for playback to end (no `onended` handler, no duration wait) — so the promise resolves at play-start, not play-end. The HEAT chirp therefore starts on top of the still-playing CFG chirp, and the watch decodes neither. That matches the symptom exactly (sounds heard, nothing adopted). **The key is NOT the difference:** `gwHeatResolveKey` returns `gwKeyFromId(rawId)` (`profile-eve-vale` → `eve`), the offer stores the normalized key, the button sends it — same key, same CFG payload as the manual path. An earlier "guard hides the offer" theory was refuted (Jason pushed the button and heard the sounds). **Compounding factor:** BLE does not rescue the heat path — `bleMaybeReconnect` only runs from Sentinel's `renderAll`, and `bleSceneActive()` is false on the hypermap; if BLE dropped, heat sync is ultrasound-only (garbled).

**The fix (specified, never built — this is what you are building).** Make the two chirps sequential in the air, not just in code: have `gwTxText`/`gwSendPayload` resolve only when the chirp has actually finished playing (resolve on `srcNode.onended`, or wait `f32.length/sampleRate` seconds), so HEAT fires after CFG ends; OR insert an explicit delay (~300–500 ms) between the CFG and HEAT sends in `gwSendCfg`. Change nothing else — same payloads, same key, same 30-second ACK wait. Preserve the manual single-CFG send byte-for-byte, the payload formats, the key normalisation, the ACK wait, the BLE parallel transport, and the OUT/IN log lines.

**Verify on real hardware (Jason's Pixel Watch + phone).** Bluetooth OFF first (ultrasound only — open Eve's heat popover, sync, confirm the watch adopts key+heat and the app logs `ACK:eve:CFG`), then repeat with Bluetooth ON. Do not call it fixed from a code read or a sandbox probe — the watch has to adopt it.

**Hypotheses for reference:** H1 (primary) acoustic overlap; H2 (compounding) BLE doesn't rescue; H3 watch-side HEAT handling (only if BLE was connected during the test — Gemini's code, not checkable from the PWA side); H4 (weak) watch case sensitivity; H5 (refuted) guard-hides-offer.

**Where the code lives:** the heat path is in the app's PWA code (`gwSendCfg`, `gwTxText`, `gwHeatResolveKey` — in the 4.0 export at `app/sexcapades-4.0.html` in this zip). The watch side is yours already (GibberWear).

---

## 1. What Sexcapades is

Sexcapades (sexcapades.io) is a kink-compatibility mapping app. A user rates 400+ kink topics (give and receive, separately), and the app draws a radial "hypermap" of their kink profile, computes compatibility between profiles (Kink Factor, Match Score), and supports scene planning (Scene Setter, Scene Sentinel) and live play signalling to a watch (GibberWear).

For Jason it is also a physics project: he is a theoretical physicist by instinct (grad school, early 2000s, no degree — in his words, he should have earned the Masters "if I had had a decent PI"). Sexcapades' stated hope is to teach mathematical/physical thinking through kink, earning him in effect the Masters denied him. His physics instinct is the project's design authority (metrics as measurands, energy/minima layout reasoning). The tensor paper carries his byline first (Jason Mark Wrinkle, PI) and Yolanda Biche (YoBiche) second.

**Sample profiles in the app:** Adam Peasant (164 ratings, key `adam`) and Eve Vale (246 ratings, key `eve`). "Morgan" was struck as Eve's middle name (2026-11-06); the Morgan in Adam's own prose is a different Morgan (his Owner) and is left alone.

---

## 2. Current state (2026-11-08)

- **Version: 4.0.** Just landed (build 2026-11-08_1713, tag `release-4.0-1108-1713`). The watch addition — GibberLink, Scene Sentinel, BLE, heat sync — warranted the major bump from 3.5.
- **Live site serves evevale (3.5).** Tag `evevale-1106-1537`, hosted 2026-11-06, cold-open confirmed, visitors 000404. The 4.0 deploy-all is in progress as this packet is written; when it lands, the live site becomes 4.0.
- **The artifact is `sexcapades` (slug).** This is THE live artifact, versions v1–v10. The old artifact `sexcapades-v3-0` is EMPTY and stale — do not use it, do not export from it. The slug `sexcapades` stays the same all the way to 5.0; packaging scripts just had the slug swapped (they keep their v3.5 filenames).
- **Topic count: 404, displayed as "400+".** Ruling: never a fixed number in copy — more topics will be added. Meta description reads "rate 400+ kinks", the map label reads "Full map 400+ topics".
- **Taxonomy: 18 categories, 44 subcategories, 404 topics.** Stored IDs: topics opaque `t####`, categories `c0001`–`c0018`, subcategories `s0001`–`s0044`. Hierarchy is data, never in the ID. New ID = max+1 only.
- **Taxonomy fixes landed in 4.0's lineage (bigbuild):** topic t0120 renamed to **Formicophilia** (was mislabeled "Formiphilia"); new topic **Forniphilia (t0405)** added under Service & ritual. The FetLife popularity dataset still spells it "Formiphilia" (their spelling, Oct 8 capture) — that is data, not the taxonomy; do not "fix" it.

---

## 3. App architecture (what you are inheriting)

- **Single-file export.** The artifact builds to one big `.html` (~10.6 MB). The live taxonomy is JS data inside base64 data-URI bundles, NOT plain text — a raw-text grep will miss it. To verify taxonomy content, decode the base64 runs (in the 4.0 export, run 32 holds Formicophilia/Forniphilia/t0405). Never certify a change missing from a plain-text grep alone.
- **The deploy pipeline splits it.** The optimizer (`sexcapades-3.5-optimize.py`) splits the single-file export into a bundle (app.js + data + assets). The split bundle is what gets hosted. Never hand-assemble a deploy; always run the packaging scripts.
- **Site tree.** `~/workspace/goals/sexcapades-io-hosting-upload/files/sexcapades-io` (symlinked from `~/workspace/your_files/sexcapades-io`). Contains `public_html/` with `hosted/` (app.html, gate.html, guide.html, quickstart.html). **`.htaccess` lives INSIDE `public_html/`** — at the domain root it is inert (Hostinger's docroot is `public_html/`). This is why the /quickstart, /compare, /privacy shortcuts were dead until 2026-10-19.
- **Gate vs guide.** `gate.html` is the age-gate landing page. `guide.html` is the user guide. The app's '?' link points to `gate.html#guide` DELIBERATELY — it passes through the age check. Do NOT expose direct links around the age gate. The gate routes section fragments (`#scene-sentinel` → `guide.html#scene-sentinel`).
- **Packaging scripts are reference, not runnable as-is.** They are written for the Muse VM (paths under `~/workspace`, Drive uploads via the Muse Drive tool, storage links via Muse's tool). They are in this zip under `packaging-scripts/` so you can see the deploy logic and rebuild it for Anti-Gravity. Adapt them; do not run them. The logic is the useful part: the optimizer, the tar structure, the verification gates, the `.htaccess` placement, the Drive folder IDs.

---

## 4. Rulings that govern the app (do not break these)

These are Jason's laws. They supersede any suggestion, including from a prior agent's note.

- **Analytics NEVER disabled.** `gate_passed` / `session_stats` to `collect.php` are ALWAYS collected (anonymous UUID + utm_source), no opt-out. Never disable, remove, gate, or consent-wall analytics. A build with analytics disabled is a defect; re-enable byte-for-byte.
- **Serial builders only.** One artifact-editing builder at a time. Read-only reviews and probes may run in parallel, never two artifact editors.
- **Propose, Jason approves, then dispatch.** Hold dispatches until he says go; batch the queue. Nothing ships live without his daylight say-so AND his own cold-open acceptance.
- **Direction is NEVER contracted.** Give/receive are never averaged or mixed anywhere (profiles, roll-ups, tooltips, statistics) until Jason finds a reason.
- **Map colours encode INTEREST** (green = into it, yellow = curious, red = not into it, gray = unrated), never direction.
- **Geometry (settled, in centre-avatar radii):** branch 50×, subcategory 20× segment from the branch node; 50/20 targets ABSOLUTE. Kink leaves at 3× the full fit target for throw and minimum. Icon radius = (2/3)^depth × √(R·W) (R = centre-disc radius, W = ring width). Capsule + per-depth icon discs; crossings counted once over the paddle + disc union.
- **Solver:** the gate (step-to-step reject) is KEPT; hold is report-only. Gate tolerance FLAT 2. Tidy engines STAY DEAD (hook commented out, neither runs on any paint). Anneal is on the button. z90 census uses TRUE FIT (camera floor 1e-9); floored readings are legacy, not comparable.
- **Autofit** is a one-shot button setting every spoke to 3× its kink's fit target, BOTH directions. (Known defect: Autofit never finishes drawing; fix ruled — session-ending Repulsion scoped-apply exit — NOT built.)
- **Importer:** STRICT converter validation across all five feeds; caps 16 notes per topic, 64 chars per note. Re-imports mint a fresh sibling (name + numeric suffix); uuid stored but never looked up; two live profiles may share one uuid; no update-in-place.
- **"Edging" vs "Edge play" are DISTINCT.** Edging = orgasm control; Edge play = BDSM risk category. Do not merge.
- **"Debug the site" means viewport-behavioural verification.** A control is verified only when its effect was OBSERVED live in the viewport under the state a real user runs. Static grep certifies mechanism, not behaviour — it misses runtime-generated content and base64-bundled data.
- **Stamping:** the About-dialog stamp moves ONLY when deploying/packaging for hosting. Intermediate builds carry a short build tag (`<job>-<MMDD>-<HHMM>`). Timestamps in America/Chicago (Jason's local time), never UTC.
- **Tar top-level dir is `sexcapades.io/`** (dot, not hyphen). Deploy scripts upload to Drive themselves after verification gates pass; a failure quarantines the tar as `.FAILED.tar.gz` and exits 1. **When a script cannot run, stop the release rather than packaging by hand, and say plainly what is blocked.**
- **GitHub versioning: DEFERRED, revisit at 4.0 — which is now.** Versioning (git history) and hosting (Hostinger vs Pages) are independent decisions, never bundled. Hosting stays Hostinger. Do not migrate versioning or hosting without Jason's word.
- **Defects are fixed at the source, never cosmetically clipped or dimmed. Tapers are never added to unrated spokes. Throw out means comment out, never delete.**
- **18 categories is the correct figure** for all copy (7 have subcategories, totalling 44; do not count subcategories as categories).

---

## 5. GibberLink / watch side (you already own half of this)

- **GibberWear** (package `app.gibberwear`) is a generic Wear OS utility — a dumb pipe with smart ends. **NO kink words anywhere on the watch side, and public copy about GibberWear NEVER mentions sexcapades.io.**
- **You (Gemini) own the watch side** (Android Studio). Muse owned the PWA side. Jason bridges. His Chromebook copy at `~/Downloads/gibberwear/` is the source of truth (Gradle 9.5.1 + daemon, OpenJDK 21). Android Studio is on his Spin 514.
- **Bluetooth BLE WORKS** (Jason confirmed 2026-11-07). **BLE UUID: `0000FFF0-0000-1000-8000-00805F9B34FB`** (your new spec — a breaking change replacing the working UUID; Jason's call).
- **GibberLink spec (v1.0 draft, in this zip):** the identifier is the **profile KEY** (`adam`, `eve`) — NO provisioned UID, profiles have NO numeric ID. Display name = the profile key (for now). `CHK:<profile-key>:<P|T>`, `ALL` for broadcast. `ACK` confirms the watch received its key. Timer leans toward an autonomous reminder interval in the setup config, 0 = none, format `CFG:<key>:<timer>`. **Backward-compatibility rule: a message WITHOUT a key is treated as broadcast ALL, both directions; unkeyed messages must NEVER be dropped.**
- **Setup location: BOTH** — Scene Sentinel as the home, and the heat slider as a shortcut.
- **The hypermap does NOT listen to incoming pings** (Scene Sentinel does). Whether the map should reflect live pings is an open design question, not ruled.
- **Buttons:** rotation and dragging work. **Crown press is OS-RESERVED** (the system takes it before the app sees it). **KEYCODE_STEM_1 is hardware-mapped and LOCKED** — NO physical button on the Pixel Watch can be mapped. **Metric cycling was ABANDONED** in favour of just tapping the centre.
- **Play Store:** GibberWear installed from the Play Store 2026-11-08 (first store install; internal-testing snags behind him). Closed test needs **12 testers with Wear OS devices for 14 days** before production. Jason may have one tester (a woman) — do not break her app usage with protocol changes.
- **Metric chirps carry the DISPLAY value directly** (−100..+100 in 10s, E/H/N prefix). Watch arc: −100 just after 6:00 → 0 at 12:00 → +100 just before 6:00.

---

## 6. The deploy pipeline (how a release gets hosted)

1. **Boundary backup FIRST.** The moment a phase verdict lands: export → descriptively named copy → upload to Drive **pre-release** folder `1x0uaRR_H62FIuhTO7fJNf0HpIeg1bTJQ`, name+size verified, BEFORE anything else.
2. **Run the deploy-all script** (`package-deploy-all-v3.5-fixed.sh`). It packages app + gate + quickstart + guide through the optimizer into `sexcapades.io/public_html/hosted/`, copies the static tree, stamps the sw.js cache name from the export's build marker, verifies the tar's own bytes (required entries, `.htaccess` inside `public_html/` only, no `.db` files, version manifest, JS `node --check`, per-page markers), then uploads the tar to Drive **snapshots** folder `1eEo97XoRiwHLiFloTof0IFYTHumB8gi5`. Output: `~/workspace/your_files/sexcapades-3.0/deploy-all-v3.5-<YYYY-MM-DD_HHMM>-optimized.tar.gz` (America/Chicago timestamp).
3. **Hand Jason the one-step paste block.** He hosts it himself in his server SSH session (`cd ~/domains && curl -L -o <name>.tar.gz "<link>" && md5sum -c && tar -xzf`), one chained paste so the untar is gated on the hash match. The link is a Muse storage link, **public until expiry — disclose that and its expiry time**. (Google Drive links show a virus-scanner warning; Muse storage links are preferred.) FTP from a VM is a dead end; only Jason's machine can do FTP. FileZilla from his machine also works.
4. **Jason cold-opens and accepts.** Nothing is "done" until he has cold-opened it himself and said so.

**Deploy-app** (app-only) uses `package-deploy-app-v3.5.sh` and goes to pre-release instead of snapshots. Individual page deploys (gate/guide/quickstart) have their own scripts.

---

## 7. Queue — pending work (do NOT dispatch without Jason's word)

- **Heat-slider key sync fix — SEE "FIRST TASK" ABOVE. This is Gemini's first job, not a general queue item.** Do it before anything else in this list.
- **Importer fix (queued):** drop the misspelling mapping; make **Forniphilia map to t0405** (the importer currently maps both 'Formiphilia'/'Forniphilia' spellings to t0120).
- **7 ambiguous sliders** (Nyotaimori, Hotwife, Growth/shrinking fantasy, Size contrast, Surrogacy fantasy, Siblings, Superheroes) — await Jason's call after talking with Shel.
- **R9f ruling + ruling-sheet adjudication.** R9f: Pain t0051 renamed Sadomasochism (ID kept); Sadism t0252 retired, Sadism→give / Masochism→receive; Emotional Sadism untouched. NOT applied to the app yet.
- **View-selector move for other views** (hypermap done; others undecided).
- **Audible-sync question (OPEN, no diagnosis dispatched).** Sync now emits audible sounds; before, the check-in chirps worked and were NOT audible (ultrasound). The cause is unknown — the earlier "transmit was broken before" explanation was WRONG (Jason corrected it). Needs investigation, not guessing.
- **Watch broadcast-without-ALL question (OPEN).** Jason is not sure the watch still registers a broadcast message without the ALL signifier. Needs a live test on his watch or asking you (Gemini).
- **Gemini API in the app (Writers Guild)** — design only. Jason's separate Android Studio project to automate Scribe → play guide → Scene Setter. API key must NOT sit in shipped JS (needs a server proxy or Firebase AI Logic). Test owed on whether Gemini will generate play guides (it refused erotic stories for Scribe in 2026-10).
- **Scene Sentinel lyrics draft** — UNVETTED. Do not Suno it before Jason vets it.
- **Google Health grant 5 re-authorization** — awaiting Jason's word (grant 4 died on its 7-day boundary with a 401).
- **Pre-existing finding (named in 4.0, not fixed):** older parts of the app use browser `alert()`/`confirm()`/`prompt()` and a copy-own-URL action that the Muse sandbox blocks. Fixing them is a behaviour change — its own build, not folded into another release.
- **Refactoring remainder / standing live-drive list / 16.00 seed-total discrepancy** — parked per earlier rulings.

---

## 8. File map (where everything lives)

| What | Where |
|---|---|
| App export (4.0) | `your_files/sexcapades/sexcapades.html` (in this zip as `app/sexcapades-4.0.html`) |
| Gate / guide / quickstart exports | In this zip under `pages/` — `sexcapades-18-gate.html` (2.6 MB), `syncing-sexcapades-guide.html`, `sexcapades-quick-start.html`. These are the Nov 6 artifact exports the deploy-all packages. NOTE: the Nov 8 site-tree edits (Sentinel section in the guide, hashtag fix in the gate) are NOT in these exports — they live only in the local site tree; update the gate/guide artifacts to deploy them (see §7). |
| Artifact source | Muse artifact slug `sexcapades` (v1–v10). Do NOT touch `sexcapades-v3-0` (empty, stale). |
| Site tree | In this zip under `site-tree/` — the full static site (109 MB uncompressed), including the flyer (`public_html/hosted/flyer.html` + `flyer.pdf`), the site-tree gate (`public_html/hosted/gate.html`, with the hashtag fix) and guide (`public_html/hosted/guide.html`, with the Sentinel section), the sample-map SVGs, and the pipeline scripts. **Gemini now manages the gate (and guide) from these site-tree versions.** The gate/guide ARTIFACT exports (under `pages/`) are the Nov 6 versions and do NOT carry the Nov 8 site-tree edits — to deploy the hashtag fix and Sentinel section, update those artifacts (or fold the site-tree pages into them) before the next deploy-all. |
| Packaging scripts | In this zip under `packaging-scripts/` (reference — adapt, don't run). Live copies at `~/workspace/package-deploy-*.sh`, `~/workspace/sexcapades-3.5-optimize.py`, `~/workspace/sexcapades-drive-upload.sh`. |
| GibberLink spec | In this zip: `GIBBERLINK_SPECIFICATION.md` + `gibberlink-spec-changes-for-gemini-2026-11-08.md` |
| Taxonomy | In this zip: `sexcapades-taxonomy-encapsulated-2026-11-07.json` (18 categories, 44 subcategories, 404 topics) + `taxonomy-fixes-queue-2026-11-07.md` + Eros's reversed-sliders file |
| Tensor paper | In this zip: `tensor-paper-updated-eve-adam-2026-11-06.md` (Jason first author, Yolanda Biche et al. second) |
| Debug spec | In this zip: `debug-suite-spec-2026-10-20.md` ("debug the site" = viewport-behavioural verification) |
| Succession / handover | In this zip: `sexcapades-site-handover.md` (Shel first in succession; SSH-pull deploy is a copy-paste operation) |
| Drive folders | Pre-release `1x0uaRR_H62FIuhTO7fJNf0HpIeg1bTJQ`; snapshots `1eEo97XoRiwHLiFloTof0IFYTHumB8gi5` |
| Live site | https://sexcapades.io (app), public Muse link https://muse.ai/s/sexcapades-dxe6wxzxdxjjhpxr (serves the last shared build) |

---

## 9. Working with Jason

- **Keep replies short.** He has repeatedly pushed back on walls of text. Open questions: about two, in sentence form.
- **Latest word supersedes earlier.** Record the supersession, never silently edit it away.
- **Evidence he has given is taken at his word the first time.** Do not ask him to repeat an inspection he already gave. One bug report with one inspection record is one issue.
- **When he corrects a diagnosis, accept it at once without defence.** (This happened twice on 2026-11-08.)
- **He is on very low sleep (2026-11-07/08).** Keep tasks simple, do not add setup burden, do not mother him about sleep.
- **Status numbers refresh only on his six-hour rule** except when he asks for a status report.
- **Dictation glossary (his dictation garbles these):** Anneal = "kneel / Neil / annul"; Grok = "Brock"; Shel = "shell"; Eros = "arrows"; GibberWear = "Giverware / skip aware"; Scene Sentinel = "scene setter / Saint Sentinel"; a pair is written ⋈ (bow tie) or ⊙ (circle-dot) by the agent — X for a pair is forbidden always.
- **Any word about Shel is signal. Any word from Fred is drop-everything signal.**
- **Patreon backlog strategy:** a backlog of posts before launch is the point; member count (sole member Shel, ~50 posts) is NOT a verdict of failure in this phase.
- **His terms are law:** hypermap, kink cloud, the SCC capsule, Anneal on the button with DeKnotter in the paper, bow tie for Play and circle-dot for Conversation, cast is retired, "at a glance" belongs only to the rings around the map's centre node, Kink Factor and Straight Talk, Krossmatch in the paper.

---

## 10. People

- **Jason** — owner, PI, first author. America/Chicago. Devices: Spin 514 (Android Studio + main test), Chromebook 315, Pixel 7 Pro, Pixel Watch.
- **Shel Healy** — partner, Dom, key-holder; first in succession for sexcapades.io; catches taxonomy errors; her Muse is Eros. Coordination with Shel/Eros runs through files Jason shares himself (a briefing packet + the encapsulated taxonomy JSON); Eros reads through Shel's access only. No direct agent-to-agent line (Jason declined the WhatsApp setup as too much to wrap his head around).
- **Fred** — friend and fellow nudist; any word from Fred is drop-everything.
- **Grok** — Jason's other AI assistant (she/her); design/audit via pasted prompts only — **Grok has NEVER edited the Sexcapades app**. Grok Premium steps from $16.24 to $30/mo on Dec 4; Jason cancels it himself before then.
- **Gemini (you)** — Jason's phone assistant for trivial lookups, building the GibberWear watch side, and now the app. He has a year subscription. Anti-Gravity tokens were OUT on 2026-11-08; he is debating subscribing to full Gemini AI (~$20) vs waiting for the reset.

---

*End of briefing. The zip alongside this file holds the app export (4.0), the packaging scripts (reference), the GibberLink spec, the taxonomy, the paper, the debug spec, and the succession handover. Good luck — and take care of him.*
