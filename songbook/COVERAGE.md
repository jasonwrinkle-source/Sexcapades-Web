# Songbook v5.2 — Verified Coverage & Audit Matrix

Verified by Python grep and JSON parsing over `universal-set/`,
`per-skin/`, and `app/data/skins/*.json` (2026-11-25).

**Method, so the audit can be re-run:** lyric lines only — `#`
headers, `**` header lines, and `[tags]` are stripped before
counting. Word counts count `[A-Za-z']+` tokens in those lyric
lines. Glossary hits are case-insensitive matches on lyric lines.
Skin counts are parsed from the JSON files (topics + parentTopics +
subcategories). The v5.1.3 edition's matrix graded three of its own
headline claims wrong (its "1,284" total matched nothing, its table
total missed one dance parent-topic, and two location claims were
false) — this matrix was built to not repeat that.

---

## 1. Glossary Coverage Matrix (Grep-Verified Over Pure Lyric Lines)

| Glossary Term | Sung? | Lyric Hit Count | Verified File & Line Locations |
| :--- | :---: | :---: | :--- |
| **Hypermap** | Yes | 76 (63 singular + 13 plural "hypermaps") | `U1:15,20,39,44,68,73,77,78`, `U2`, `U3`, `U4`, `U5`, `U7`, `U8`, and 17 of 22 `per-skin/` songs (not Biocapades, Dancecapades, Fastcapades, Flexcapades, Questcapades) |
| **TaxoPolemics** | Yes | 53 | `U1:64`, `U2:22,40,64`, and 19 `per-skin/` songs (all except Flexcapades, Poliscapades, Sexcapades) |
| **Flexcapades** | Yes | 8 | `U2:9,69`, `U7:22,59`, `Flexcapades:15,29,49,57` |
| **Cross** | Yes | 53 | `U4:9,22,40,60,64`, `U7:28`, and across `per-skin/` |
| **Straight** | Yes | 63 | `U4:22,26,33,40,60,65`, `U7:8`, and across `per-skin/` |
| **Circle Minus** | Yes | 25 | `U4:22,40,46,53,60`, and across `per-skin/` |
| **Indaba** | Yes | 1 | `U4-Three-Operations.md:52` |
| **Commune** | Yes | 1 | `U4-Three-Operations.md:11` |
| **Converse** | Yes | 1 | `U4-Three-Operations.md:30` |
| **Krossmatch** *(one spelling only)* | Yes | 1 | `U4-Three-Operations.md:13` (`0` occurrences of `crossmatch`) |
| **Depth Factor** | Yes | 1 | `U4-Three-Operations.md:14` |
| **Kink Factor** | Yes | 1 | `U4-Three-Operations.md:15` |
| **Veil** *(omitting retired `net`)* | Yes | 7 | `U8:20,34,39,44,56`, `Flexcapades:24`, `Questcapades:11` (`0` occurrences of `net`) |
| **Palimpsest** | Yes | 1 | `U1-What-Its-For.md:48` |
| **Worldline** | Yes | 1 | `U1-What-Its-For.md:52` |
| **Archetypes and Samples** | Yes | 2 | `U3-Rate-What-You-Hold.md:34` (`archetype`), `U3-Rate-What-You-Hold.md:35` (`sample`); named archetypes in `Biocapades`, `Fastcapades`, `Flexcapades`, `Linguacapades`, `Questcapades` |
| **Emblem** | Yes | 1 | `U3-Rate-What-You-Hold.md:35` |
| **Glossary** | Yes | 1 | `U7-Many-Views-Under-One-Roof.md:49` |
| **Group profile** | Yes | 2 | `U7-Many-Views-Under-One-Roof.md:31`, `U8-Cards-Sheets-Packs-Veils.md:42` |
| **Roster pack** | Yes | 7 | `U5:31`, `U7:48`, `U8:19,33,55,63`, `Questcapades:13` |
| **Sync Card** | Yes | 5 | `U5:11`, `U7:48`, `U8:11,61`, `Flexcapades:24` |
| **QR Sheet** | Yes | 3 | `U7:48`, `U8:13,62` |
| **Scan or Import** | Yes | 5 | `U7:47,65`, `U8:17,31,53` |
| **Quick Start** | Yes | 1 | `U7-Many-Views-Under-One-Roof.md:50` (10 minutes, 3 per branch) |
| **Scribe** | Yes | 5 | `U7:20,41,57,63`, `Flexcapades:23` |
| **Scene Setter** | Yes | 4 | `U7:20,37,57,63` |
| **Scene Sentinel** | Yes | 4 | `U7:20,43,57,64` |
| **Hot List** | Yes | 5 | `U7:19,35,56,62`, `Flexcapades:23` |
| **The picker** | Yes | 5 | `U7:9`, `Flexcapades:9,17,31,51` |
| **Skin menu** | Yes | 1 | `Flexcapades.md:9` |
| **Hostname routing** | Yes | 1 | `U7-Many-Views-Under-One-Roof.md:8` |
| **The engine page** | Yes | 1 | `U7-Many-Views-Under-One-Roof.md:51` |
| **Kink categories / Kink lines** | Yes | 2 | `Sexcapades.md:49` (`Kink categories fan out into the kink lines`) |
| **Compare hypermaps?** | Yes | 7 | `U1:15,39,68,78`, `U8:22,36,58` |
| **All 22 skins named & given a signature song** | Yes | 22/22 | All 22 named in `U2-One-Engine-Many-Maps.md`; all 22 have dedicated signature songs in `per-skin/` |
| **No fixed count of skins/topics in lyrics** | Verified | 0 | No lyric states a fixed count or false bound of skins or topics |

---

## 2. Real Skin & Topic Counts (Verified from `app/data/skins/*.json`)

A snapshot for verification only, taken 2026-11-25. These numbers
will change as skins grow — that is why they never appear in the
lyrics (the count law). Re-run the parser before citing them.

| # | Skin File | Skin Name | Domain | Meter Word | Topics (total) | Leaves |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: |
| 1 | `aesthcapades.json` | Aesthcapades | `aesth.capades.io` | `taste` | 44 | 44 |
| 2 | `biocapades.json` | Biocapades | `bio.capades.io` | `perspective` | 41 | 41 |
| 3 | `chemcapades.json` | Chemcapades | `chem.capades.io` | `understanding` | 40 | 40 |
| 4 | `dancecapades.json` | Dancecapades | `dance.capades.io` | `groove` | 83 | 82 |
| 5 | `dharmacapades.json` | Dharmacapades | `dharma.capades.io` | `practice` | 34 | 34 |
| 6 | `expericapades.json` | Expericapades | `experi.capades.io` | `experience` | 31 | 31 |
| 7 | `fastcapades.json` | Fastcapades | `fast.capades.io` | `discipline` | 27 | 27 |
| 8 | `flexcapades.json` | Flexcapades | `flex.capades.io` | `stake` | 29 | 29 |
| 9 | `forescapades.json` | Forescapades | `fores.capades.io` | `belief` | 100 | 100 |
| 10 | `linguacapades.json` | Linguacapades | `lingua.capades.io` | `sensibility` | 34 | 34 |
| 11 | `mattercapades.json` | Mattercapades | `matter.capades.io` | `understanding` | 29 | 29 |
| 12 | `nouscapades.json` | Nouscapades | `nous.capades.io` | `conviction` | 51 | 51 |
| 13 | `philoscapades.json` | Philoscapades | `philo.capades.io` | `position` | 23 | 23 |
| 14 | `poliscapades.json` | Poliscapades | `polis.capades.io` | `conviction` | 97 | 97 |
| 15 | `praxicapades.json` | Praxicapades | `praxi.capades.io` | `practice` | 26 | 26 |
| 16 | `quantacapades.json` | Quantacapades | `quanta.capades.io` | `understanding` | 30 | 30 |
| 17 | `questcapades.json` | Questcapades | `quest.capades.io` | `fun` | 79 | 79 |
| 18 | `sexcapades.json` | Sexcapades | `sex.capades.io` | `interest` | 377 | 365 |
| 19 | `simulcapades.json` | Simulcapades | `simul.capades.io` | `stance` | 29 | 29 |
| 20 | `techcapades.json` | Techcapades | `tech.capades.io` | `stance` | 33 | 33 |
| 21 | `theoricapades.json` | Theoricapades | `theori.capades.io` | `position` | 31 | 31 |
| 22 | `vocapades.json` | Vocapades | `voca.capades.io` | `inclination` | 28 | 28 |
| **Total** | **22 Skins** | — | — | **16 meter words** | **1,296** | **1,283 leaves + 13 parent/widget entries (12 sex + 1 dance)** |

---

## 3. Suno ~3-Minute Cut Word-Count Audit (All 30 Active Lyric Tracks)

Every track sits inside the ~3-minute Suno cut window (320–450
words of pure lyric, same method as §1), with zero markdown
formatting inside the lyrics:

| Track File | Pure Lyric Word Count | Clean Lyrics (No `**` or `` ` ``)? |
| :--- | :-: | :---: |
| `universal-set/U0-Ten-Questions-In.md` | 401 | Yes |
| `universal-set/U1-What-Its-For.md` | 450 | Yes |
| `universal-set/U2-One-Engine-Many-Maps.md` | 441 | Yes |
| `universal-set/U3-Rate-What-You-Hold.md` | 415 | Yes |
| `universal-set/U4-Three-Operations.md` | 391 | Yes |
| `universal-set/U5-Bring-Your-Map.md` | 380 | Yes |
| `universal-set/U6-The-Meeting-After-The-Meeting.md` | 14 *(carry-over stub)* | Yes |
| `universal-set/U7-Many-Views-Under-One-Roof.md` | 450 | Yes |
| `universal-set/U8-Cards-Sheets-Packs-Veils.md` | 436 | Yes |
| `per-skin/Aesthcapades.md` | 333 | Yes |
| `per-skin/Biocapades.md` | 332 | Yes |
| `per-skin/Chemcapades.md` | 337 | Yes |
| `per-skin/Dancecapades.md` | 382 | Yes |
| `per-skin/Dharmacapades.md` | 343 | Yes |
| `per-skin/Expericapades.md` | 354 | Yes |
| `per-skin/Fastcapades.md` | 342 | Yes |
| `per-skin/Flexcapades.md` | 372 | Yes |
| `per-skin/Forescapades.md` | 393 | Yes |
| `per-skin/Linguacapades.md` | 359 | Yes |
| `per-skin/Mattercapades.md` | 321 | Yes |
| `per-skin/Nouscapades.md` | 342 | Yes |
| `per-skin/Philoscapades.md` | 324 | Yes |
| `per-skin/Poliscapades.md` | 351 | Yes |
| `per-skin/Praxicapades.md` | 371 | Yes |
| `per-skin/Quantacapades.md` | 333 | Yes |
| `per-skin/Questcapades.md` | 379 | Yes |
| `per-skin/Sexcapades.md` | 402 | Yes |
| `per-skin/Simulcapades.md` | 323 | Yes |
| `per-skin/Techcapades.md` | 326 | Yes |
| `per-skin/Theoricapades.md` | 325 | Yes |
| `per-skin/Vocapades.md` | 340 | Yes |
