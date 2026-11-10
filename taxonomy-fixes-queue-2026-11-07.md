# Taxonomy fixes — queued for the next big build

Queued 2026-11-07 ~15:10 CST by Jason. **Do NOT dispatch a separate build for these.** Fold them into the next big build.

## 1. Rename: t0120 "Formiphilia" → "Formicophilia"
- **Caught by Shel (2026-11-07 ~15:09 CST).** The app's topic t0120 is labeled "Formiphilia" with a description about bugs crawling on the body. "Formiphilia" is not a real word. The description is **formicophilia** (arousal from insects/ants crawling on the body).
- **Fix:** rename the label to "Formicophilia". The topic ID stays **t0120** (opaque ID, never regenerated from a name) and all ratings stay put.
- **Verify after:** "Formiphilia" ×0, "Formicophilia" present, t0120 ratings unchanged.

## 2. Add: new topic "Forniphilia" (being furniture / human furniture)
- **Forniphilia** is a separate, real term — arousal from being used as furniture (human furniture). It is NOT currently a topic in the taxonomy at all (confirmed 2026-11-07: no "forniphilia" in the taxonomy file).
- **Fix:** add "Forniphilia" as a new topic at the appropriate place in the taxonomy. New ID = max(existing topic ID) + 1, per the stored-ID rule (hierarchy is data, never in the ID).
- **Placement:** to be decided at build time. Candidates: Service & ritual (being of service as furniture), Bondage & restriction (being restrained/used as furniture), or Roleplay & identity (roleplaying as furniture). Do not place it under the formicophilia branch — it is a different concept.
- **Verify after:** "Forniphilia" present as its own topic, distinct from "Formicophilia" (t0120), with its own ID and no ratings carried over.

## 3. Reverse the give/receive slider order on 11 topics (Eros's finding, 2026-11-07 ~15:33 CST)
- **Source:** `~/workspace/user/files/For_Jason_reversed_sliders_2_uu1s.md` (from Eros, via Shel). Checked against the Nov 3 list-view extraction (403 topics).
- **Rule:** give comes first, receive second. Give = the one who has / wears / does / holds the authority role. Receive = the one who admires / is done to / takes the subordinate role.
- **Fix:** swap the two slider labels on each of these 11 topics (presentation order only — no topic added, removed, or renamed; no ratings change):
  - Collars & symbols (Power exchange): "admires / wears" → "wears / admires"
  - Crossdressing (Fantasy & transformation): "admires / wears" → "wears / admires"
  - Lingerie & stockings (Clothing, materials & objects / Lingerie & hosiery): "admires / wears" → "wears / admires"
  - Uniforms (Clothing, materials & objects / Uniforms & costumes): "admires / wears" → "wears / admires"
  - Heels & boots (Clothing, materials & objects / Footwear): "admires / wears" → "wears / admires"
  - Harnesses (Clothing, materials & objects / Objects/toys): "admires / wears" → "wears / admires"
  - Leather (Clothing, materials & objects / Materials): "admires / wears" → "wears / admires"
  - Latex & rubber (Clothing, materials & objects / Materials): "admires / wears" → "wears / admires"
  - Brats (Power exchange): "be the brat / tame the brat" → "tame the brat / be the brat"
  - Begging (Power exchange): "begs / grants" → "grants / begs"
  - Romantic surrender (Fantasy & transformation): "surrenders / accepts" → "accepts / surrenders"
- **Verify after:** each of the 11 reads give-first in the app; no other topic's slider order changed.
- **Parked (not in this batch):** 7 ambiguous topics where the order can't be settled from wording alone — Nyotaimori, Hotwife, Growth/shrinking fantasy, Size contrast, Surrogacy fantasy, Siblings, Superheroes. Jason is talking these over with Shel; they join the queue only when he calls them.

## Scope
- These three items only. No other taxonomy changes in this batch unless Jason adds them.
- Analytics (collect.php) never disabled. About stamp unchanged (these are not a deploy).
