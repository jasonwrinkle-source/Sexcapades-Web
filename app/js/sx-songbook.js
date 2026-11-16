/* SX-SONGBOOK — canonical song list + cueing rule, shared by all six surfaces.
   One list of songs, one way to warm them. The app, gate, guide, quickstart,
   flyer, and privacy pages each load this file synchronously directly before
   their player block and read song addresses from it; no page carries its
   own copy of the bank anymore.

   DEPLOY CONTRACT (read before shipping): this file lives in the site tree
   and ships with deploy-all's wholesale tree copy. Single-page deploys
   (deploy-app, deploy-gate, deploy-guide, deploy-quickstart) do NOT carry
   it; they rely on its presence from the last deploy-all, exactly like the
   audio files themselves (which no page deploy ships either). Never run a
   single-page deploy onto a server that has never received a deploy-all
   carrying this file. Pages guard on window.SX_SONGBOOK: if it is absent,
   music wiring and cueing stay inert with no errors, and the app avatar
   falls through to its guide door, exactly as for a GAP display today.

   TAG POLICY (finding 6): TAG is a stable cache marker, NOT a version.
   Bump the number ONLY when a song file at the same path is replaced (a
   re-recorded take); record the bump in the release notes. Otherwise never
   touch it. Song files are not covered by the site's no-cache rules
   (pages/scripts/styles only), so this tag is the only invalidation
   mechanism for replaced takes. The old "?v=1" promised versioning it
   never performed; "?sx=1" says what it is.

   PATHS: all slugs are foldered paths under BASE, all lowercase, hyphens,
   case-sensitive. GAP expectations are unchanged: song 2, song 6, ring
   stings/jingles, scene-sentinel, layout-editor, guide GAP sections, and
   privacy have no determined path and must stay pathless. */
(function () {
  "use strict";
  var BASE = "/hosted/assets/audio/";
  var TAG = "?sx=1";
  /* The seven verse slugs, named once. TABLE rows on the app and buttons
     elsewhere reference these names; nothing retypes a verse path. */
  var VERSES = {
    hypermap: "the-explainer/e1/verse-hypermap.mp3",
    popularity: "the-explainer/e1/verse-popularity-on-deck.mp3",
    profileImports: "the-explainer/e1/verse-profile-imports-quick-start.mp3",
    castCompare: "the-explainer/e1/verse-cast-compare.mp3",
    writers: "the-explainer/e1/verse-writers.mp3",
    syncCards: "the-explainer/e1/verse-sync-cards-fractal.mp3",
    explainer: "the-explainer/e1/explainer-fixed-cut.mp3"
  };
  /* The full 28-address bank in canonical order: the seven verses, then the
     21 Book One album tracks in three style folders. Byte-identical to the
     bank every page carried before this refactor. */
  var BANK = [
    VERSES.hypermap,
    VERSES.popularity,
    VERSES.profileImports,
    VERSES.castCompare,
    VERSES.writers,
    VERSES.syncCards,
    VERSES.explainer,
    "book-one/t1-a-cappella-pop/track-tensor-product.mp3",
    "book-one/t1-a-cappella-pop/track-two-conversations.mp3",
    "book-one/t1-a-cappella-pop/track-penumbra.mp3",
    "book-one/t1-a-cappella-pop/track-heat-as-a-phase.mp3",
    "book-one/t1-a-cappella-pop/track-initiative.mp3",
    "book-one/t1-a-cappella-pop/track-how-maps-multiply.mp3",
    "book-one/t1-a-cappella-pop/track-no-joins.mp3",
    "book-one/t2-close-harmony-duet/track-tensor-product.mp3",
    "book-one/t2-close-harmony-duet/track-two-conversations.mp3",
    "book-one/t2-close-harmony-duet/track-penumbra.mp3",
    "book-one/t2-close-harmony-duet/track-heat-as-a-phase.mp3",
    "book-one/t2-close-harmony-duet/track-initiative.mp3",
    "book-one/t2-close-harmony-duet/track-how-maps-multiply.mp3",
    "book-one/t2-close-harmony-duet/track-no-joins.mp3",
    "book-one/t3-late-night-jazz-pop/track-tensor-product.mp3",
    "book-one/t3-late-night-jazz-pop/track-two-conversations.mp3",
    "book-one/t3-late-night-jazz-pop/track-penumbra.mp3",
    "book-one/t3-late-night-jazz-pop/track-heat-as-a-phase.mp3",
    "book-one/t3-late-night-jazz-pop/track-initiative.mp3",
    "book-one/t3-late-night-jazz-pop/track-how-maps-multiply.mp3",
    "book-one/t3-late-night-jazz-pop/track-no-joins.mp3"
  ];
  /* The one spelling of each skip reason, used by every page's cue runner.
     HTTP = bad response; BODY = response body could not be read;
     FETCH = request itself failed. */
  var SKIP = {
    NO_FETCH: "no-fetch",
    CONNECTION: "connection",
    ABORTED: "aborted-playback",
    HTTP: "http",
    BODY: "body",
    FETCH: "fetch"
  };
  function songUrl(slug) { return BASE + slug + TAG; }
  /* Own songs first, in the given order, then the rest of the bank, each
     path exactly once. This is the one "own song first" rule (finding 5):
     every page passes its own songs in and gets the same ordering out. */
  function orderedOwnFirst(ownSlugs) {
    var ordered = [];
    var seen = {};
    function add(p) { if (p && !seen[p]) { seen[p] = true; ordered.push(p); } }
    (ownSlugs || []).forEach(add);
    BANK.forEach(add);
    return ordered;
  }
  window.SX_SONGBOOK = {
    BASE: BASE,
    TAG: TAG,
    VERSES: VERSES,
    BANK: BANK,
    SKIP: SKIP,
    songUrl: songUrl,
    orderedOwnFirst: orderedOwnFirst
  };
})();
