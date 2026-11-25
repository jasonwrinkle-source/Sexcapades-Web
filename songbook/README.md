# The Songbook — v5.2

The songs of TaxoPolemics and Flexcapades, in git from v5.1 on
(2026-11-21); v5.1.1 (2026-11-24) fills the gaps; v5.1.2 (2026-11-25)
folds in the best of AntiGravity's first songbook (committed by Jason
as `ANTIGRAVITY-SONGBOOK.md`, scored 54.5–66 against v5.1.1, corrected
from 52 — the distinct byline and the number bounds were Jason's
orders, not violations): two new universal songs, the Flexcapades
signature song, the "Compare hypermaps?" hook in U1's chorus, and a
`COVERAGE.md` proving every glossary term is sung somewhere.
**v5.2 (2026-11-25) is a new generation: the fold-in of the best of
AntiGravity's v5.1.3 edition** (its third attempt, scored a 66–66 tie
against v5.1.2 — a better book to sing, a worse book to verify). Every
chorus now rhymes, U1 finally has its mirror verse and its negotiation
verse, U2 and U4 are rewritten line by line, Quest's archetypes are
real, U7 keeps its scene framing *and* its specifics (search/filter,
flow and close, check-ins, Scribe's stance-vs-activity split, the
Glossary), and the coverage matrix is rebuilt with correct numbers
(total 1,296 topics; 1,283 leaves) and a stated counting method. The
house byline is now on every sheet. Byline on every sheet: Jason Mark
Wrinkle & Yolanda Biche et al.

**The generation prompt for this version is
[`SONGBOOK-v5.2-PROMPT.md`](SONGBOOK-v5.2-PROMPT.md)** — hand it to the
songwriter and it produces the whole book.

## Shape

Two tiers, matching the thing itself (one engine, many maps):

- **`universal-set/`** — songs true of the engine and the application
  as a whole, sung the same way on every skin. U1 is the flagship,
  **"What It's For"** — the use cases of TaxoPolemics and
  flex.capades.io, one use case per verse. U2 "One Engine, Many Maps",
  U3 "Rate What You Hold", U4 "Three Operations", U5 "Bring Your Map",
  U6 "The Meeting After the Meeting" (carried over from the explainer
  album), U7 "Many Views Under One Roof" (the views tour),
  U8 "Cards, Sheets, Packs & Veils" (how hypermaps travel).
- **`per-skin/`** — one signature song per skin: Sexcapades,
  Poliscapades, Forescapades, Aesthcapades, Chemcapades,
  Dharmacapades, Expericapades, Mattercapades, Philoscapades,
  Praxicapades, Quantacapades, Simulcapades, Techcapades,
  Theoricapades, Vocapades, Nouscapades, Dancecapades,
  Questcapades, Biocapades, Linguacapades, Fastcapades,
  Flexcapades.

Playback fallback in the app: a skin's own song first, then the
Universal Set, then the TaxoPolemics album.

## Standing rules

Lyrics are independent of style (each set carries a `STYLE.md` with
the Suno treatment strings; track files hold lyrics only and name
their treatment). All songs SFW by construction. The living working
folder is `~/workspace/your_files/songbook/` (YoBiche's side); sheets
land in both places. Earlier albums — Book One (the paper), the
Explainer, the TaxoPolemics album — live in that folder and in the
index there.

**The AntiGravity Edition** lives separately, versioned in
[`antigravity-edition/`](antigravity-edition/) — its own lyrics, its
own versions (v1.0, v5.1.3). It never overwrites this book; lines
from it enter here only when Jason rules them in.
