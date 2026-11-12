# Sexcapades QA audit — live site

Send this to the testing agent as the whole assignment. Test only the live QA app. Do not test production. Do not change the site.

## Build gate

Open https://sexcapades.io/qa/app.html and pass the age gate as an adult.

Open About and read the build line before any other test. The line must be:

**Version 4.0 · QA Build 2026-11-12_1245**

That package is git tag `qa-4.0-1112-1245`. If About shows any other stamp, including `2026-11-12_1018` or `2026-11-12_1206`, stop. Report the stamp you saw and do not score the app.

Also record https://sexcapades.io/qa/test-runner.html for the harness in Phase 1.

## How to test

- Use the page. Read accessible names, ARIA values, and visible text. A control that exists only in the DOM and cannot be seen or used is a fail when a check below asks for it to be usable.
- DevTools may be unavailable. If a check needs the console and the console will not open, mark that check UNVERIFIED. Do not fail the app for that.
- If the browser tab dies, mark every check that did not finish UNVERIFIED. Rebuild that squad’s data in a new tab and rerun it. Do not turn a dead tab into a product fail.
- Saved profiles live in this browser until flushed. Unsaved profiles die with the tab. Start each squad from a known store: either a flush you then verify, or a fresh window whose About → “Load saved profile…” is disabled and whose tab row is only “+”.
- Sliders in an agent browser accept a quick tap. A drag, a fill, or holding an arrow key often does nothing. A single arrow nudge moves one point. A tap on the center of an Unrated slider does not rate it; set a nonzero value, then nudge back to 0 for an explicit zero. A tap can land a few points off. Do not file ±3 as a defect. Do file a slider that ignores a tap on the track.
- Ctrl-click or Cmd-click may be unavailable. Grouping with Ctrl+Enter on a profile tab is a valid substitute. If neither path can add a second profile to the group, mark multi-select UNVERIFIED and say which gesture you tried.
- The visible check mark on “Already tried” can be a static icon. The pass is the control’s DOM `checked` / `aria-checked` state, which must be false on a topic you have not set.

## Status words

Use only PASS, FAIL, PARTIAL, UNVERIFIED.

- PASS: the expected result below happened.
- FAIL: the expected result did not happen, and the “Do not fail” list does not cover it.
- PARTIAL: the main result happened and one stated part did not.
- UNVERIFIED: you could not run it.

## Do not fail

These are the product. A report that marks any of them FAIL is wrong.

1. Topic and category names stay the authored size at fit zoom. They are readable after a double-tap or double-click zooms into that part of the map. Names that are absent or small at fit zoom are expected.
2. The Hot topics / Curiosity / Not topics pills are not a visible clickable strip on the map. They may exist in the DOM. “Play the verse” and “Open Charted details” stay visible.
3. There is no separate Compare page. `#app/compare` stays the hypermap. The Switch-view menu offers Hypermap, Popularity List, Scene Setter, Scene Sentinel, and Scribe. It does not offer a Compare item. When two profiles are grouped, the title button may read “Compare ▾”. Pair comparison is the pair Glance plus an Open Krossmatch tab.
4. With Remember unchecked, a cold load shows the “+” control and no profile tab. Saved profiles come back from the restore banner or from “Load saved profile…”, not by appearing on their own.
5. Spoke color is the topic’s own heat. The profile Heat setting does not turn that color off. A spoke may be green at Neutral 0, at Horndog, and at Turned off.
6. Topics that are one interest, such as Morning Sex, keep a single slider labeled “everything”. Edge Play is not one of those. See Squad 2.
7. Unchecking “Remember this tab's profiles on this device” clears the saved set. That is the off switch.
8. Save writes one profile into the device store without requiring Remember, and without deleting the other saved profiles.
9. A header avatar that fails to decode for a moment and is visible in a screenshot is cosmetic. Do not count it.

## Phase 1 — harness

Run this first, on https://sexcapades.io/qa/test-runner.html.

Wait until the suite finishes. Record the badge, the pass count, the duration, and any console error you can see. The slow case is JSON profile ingestion, which can take several seconds. A run that ends in about 1 millisecond is a harness glitch: run it once more. If the second run passes, record the second run and note the glitch. If both fail, stop and report the failing tests.

## Squad 1 — imports and exports

The previous audit of this squad did not finish. Run the whole squad.

Open a profile, then use its Load control (Scan or Import / Get ratings).

| Check | Do this | Pass |
| :--- | :--- | :--- |
| 1.1 KinkTest | Take KinkTest and submit a few answers, including one high, one low, and a hard limit if the form offers it. | Ratings land on the named topics. Give and receive follow the form. Nothing is sent to kinktest.co.uk. |
| 1.2 BDSMtest | Import BDSM test. Paste three lines: `100% Dominant`, `80% Rigger`, `0% Submissive`. | Dominant and Submissive map onto those roles. An exact 0% becomes Neutral. No negative ratings and no Limits are created by this loader. |
| 1.3 FetLife | Import FetLife fetishes from a saved profile HTML or a short pasted fixture you record in the report. | Mapped fetishes become ratings. Unmapped names are listed rather than invented. Record mapped count and unmapped names. |
| 1.4 JSON | Scan or Import a Sexcapades JSON profile with a known name and two rated topics. | The profile name and both ratings read back from the topic controls. |
| 1.5 Sync card, normal | Export the profile’s sync card / front download. | A download starts. The card opens or saves without an error dialog. |
| 1.6 Sync card, large | Load or select the sample Eve Vale if she is offered. Open her export. | A large profile refuses the sync card and says so. The dialog can be closed. Record the refusal text. |
| 1.7 QR sheet | Export a QR sheet for a normal profile. | The sheet is produced. The tab stays responsive. |
| 1.8 PDF | Export a PDF for the same profile. | A PDF download starts and the page does not show an error dialog. |

## Squad 2 — map, search focus, Edge Play, Heat

Flush or confirm an empty store. Create one profile. Rate four topics hot enough to color a spoke. Set Heat to Turned off (−100), then Neutral (0), then Horndog (high positive).

| Check | Pass |
| :--- | :--- |
| 2.1 Names at fit | At fit zoom, names may be small or absent. A double-tap or double-click into a branch makes that branch’s names readable. Do not fail small names at fit. |
| 2.2 Glance pills | Hot topics / Curiosity / Not topics are not a visible strip you can click. Do not fail that. The verse button and Charted details stay visible. |
| 2.3 Search dim | Search a topic and accept it so the map zooms in and the rest dims. Press Escape. The dim is gone without a separate Fit press. Repeat once with an empty-map click instead of Escape. |
| 2.4 Dashed connectors | After that same search zoom, thick dashed gray bands do not remain once Escape or the empty-map click has run. Fit still frames the whole map. |
| 2.5 Reload | With the four ratings and Heat at Turned off, save the profile and reload the same tab. The map finishes in well under a minute and offers the saved profile. No second tab is required. |
| 2.6 Edge Play | Open Edge Play, under Orgasm & reproductive play. The sheet has two sliders: “take to the edge” and “be taken to the edge”. Set both and read them back. Edging, next to it, is still “edge (bring to near-orgasm)” and “be edged (be brought to near-orgasm)”. A one-interest topic such as Morning Sex is still a single “everything” slider. |
| 2.7 Heat color | At fit zoom the rated spoke is colored at Neutral, at Horndog, and at Turned off. Heat does not switch the spoke to gray. |
| 2.8 Branch, sheet, Escape, Legend | A branch expands, a topic sheet opens, Escape closes it, and the Legend dialog opens. |
| 2.9 Tab row | With this profile open, the profile tab is wide enough to read the name (at least about 168px) and Export, Veil, Heat, and Load can be used. On a phone-width window the row may scroll; the open tab is not a crushed two-row icon box. |
| 2.10 Crash | No blank page, no error dialog, and no search crash. |

## Squad 3 — pair, Veil, Remember

Use two profiles, created in the page and saved. Read every rating back from ARIA.

**Alice.** FemDom give 100, receive −50, Favorite checked. Creampies give 80, receive 0. The 0 must be an explicit rating, not Unrated: move off 0, then back to 0, and confirm the accessible name is “0” and does not say Unrated.

**Bob.** FemDom give −50, receive 90. Creampies give 0 explicit, receive 70.

Both “Already tried” controls stay unchecked (`checked` false) on every fresh topic dialog in this squad.

| Check | Pass |
| :--- | :--- |
| 3.1 Group | Both profiles are selected for grouping. The title may read “Compare ▾”. The view menu still has no Compare item. Do not fail that. |
| 3.2 Krossmatch | Open Krossmatch. Header Play MS is 94% and Play KF is 59%. FemDom combined is 90%. Creampies combined is 70%, from Alice give 80 matched to Bob receive 70. |
| 3.3 Pair Glance | The pair legend reads “Hot topics together, 100 percent, 2 topics”, Curiosity 0, Not topics 0. Clicking back to Alice alone leaves the Glance in pair mode. |
| 3.4 Glance lag | After each rating change the Glance updates on that same change. |
| 3.5 `#app/compare` | Opening `#app/compare` keeps the hypermap. Pair content is the Glance and the Krossmatch tab, not a separate Compare screen. |
| 3.6 Veil at 50 | Turn Bob’s Veil on at 50. Unrated topics are masked. The two rated branches remain. Alice’s own chips do not change. The pair legend stays “Hot topics together, 100 percent, 2 topics”. |
| 3.7 Veil threshold | Bob’s strongest marks are FemDom 90 and Creampies 70. At 69 both rated branches show. At 82 only FemDom shows, and navigating to Creampies is an empty view. At 100 only the center remains. At 18 both rated branches are back and unrated topics stay masked. |
| 3.8 Veil off | Turning Veil off restores the full map. The pair legend is unchanged from before Veil was turned on. |
| 3.9 Veil thumb | The track is green at the top and red at the bottom. The top word is Revealed. The bottom word is Concealed. At 0 the thumb is at the top and the value reads “Revealed · 0”. At 100 the thumb is at the bottom and the value reads “Concealed · 100”. The thumb moves down as the number rises. |
| 3.10 Heat thumb | Open Heat. Horndog is the top end. Turned off is the bottom end. This slider was not reversed. |
| 3.11 Veil and the tab name | Turn Veil off. The Veil button and the profile tab’s accessible name both say Veil is off, at the same level, immediately. |
| 3.12 Veil and search | With Bob’s Veil at 83, search “Creampies”. Creampies is not offered. Search “FemDom”. FemDom is offered, and choosing it lands on FemDom rather than an empty pan. |
| 3.13 Hide group overlay | Hide the group overlay. The control remains and reads “Show group overlay”. Show it again. The Glance returns to “Hot topics together, 100 percent, 2 topics” and the center is the pair, without switching the active profile first. |
| 3.14 Remember, in session | Check “Remember this tab's profiles on this device”. Both profiles are on the tab row with the same eight numbers. |
| 3.15 Remember, after reload | Reload the page. The checkbox is still checked. Both profiles return on their own. All eight ratings match, including both explicit zeros. Alice’s FemDom Favorite is still checked. The pair Glance is “Hot topics together, 100 percent, 2 topics”. |
| 3.16 Remember off | Uncheck Remember, reload, and confirm the box stays unchecked, the tab row is only “+”, and the profiles do not return on their own. The restore banner may still offer them if a save wrote them before the uncheck. After an uncheck, a second reload should not auto-load them. |
| 3.17 Banner | When the banner appears, it stays until you choose Restore or dismiss it. It does not vanish by itself. |

## Squad 4 — Popularity List and the tab row

| Check | Pass |
| :--- | :--- |
| 4.1 Rope | Open Popularity List from the view menu. The catalog renders (about 18 categories and about 403 topics). Search “Rope”. The list narrows to Bondage & restriction and Roleplay & identity, with breadcrumbs. Repeat the filter once. |
| 4.2 Rating round trip | Rate Immobilization give 100 and receive 50. Return to the hypermap. The Bondage spoke is hot, the Glance counts that topic, the tab shows a dirty mark, and the tab’s accessible name says unsaved changes. |
| 4.3 Search survives navigation | With “Rope” still filtering the list, go to the hypermap and back to Popularity List by the view menu, and once by the browser history if it is available. The search box still says Rope and the list is still two categories. A full reload may clear the search. That reload clear is expected. |
| 4.4 No surprise dialog | Arriving on the hypermap does not open a Rating details dialog by itself. |
| 4.5 View label | The view button keeps the name of the view you are in. A one-step flip to “On Deck ▾” that corrects on the next tap is PARTIAL, not a fail, if it corrects itself. |
| 4.6 Save and cold start | Save the profile. Dirty state clears. Reload with Remember unchecked. The tab row is only “+” until you use the restore banner. Restore brings the profile back and Immobilization still reads 100 / 50. |
| 4.7 Tab after restore | The restored tab shows its name and Export, Veil, Heat, and Load work. It is not a ~120px sliver. |
| 4.8 Flush | In About, Flush profiles, then reload. Record whether “Load saved profile…” is disabled and whether a restore banner appears. One window does not settle this. If a banner still lists profiles you just flushed, mark PARTIAL and quote the banner. |
| 4.9 Stability | Eight arrivals on the hypermap (menu, hash, reload, Back) complete. No blank page and no error dialog. |

## Report

Use this shape.

```markdown
# Fleet Verification Report
Tested target: https://sexcapades.io/qa/app.html
About line: (paste it)
Verdict: READY FOR PRODUCTION or REGRESSION DETECTED

## Counts
PASS / FAIL / PARTIAL / UNVERIFIED, and the item total.

## Do-not-fail checks
List each item from the “Do not fail” section you actually saw, and say it matched.

## Results
One table per squad: Check, Status, What you saw. Quote accessible names for every rating, the Veil value, the Remember checkbox, and the Krossmatch header.

## Not settled
Harness glitch, flush disagreement, dead tab, or a console you could not open.
```

Ready for production means Phase 1 passed, every numbered check in Squads 1–4 is PASS or an allowed PARTIAL, and nothing in “Do not fail” was scored as a failure. Anything else is REGRESSION DETECTED. Say which check failed and the text you read on the page.
