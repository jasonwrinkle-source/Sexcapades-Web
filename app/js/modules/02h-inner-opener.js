    !function() {
        "use strict";
        /* Deduplicated inner scope opener: inherits DOM/TimerManager/setHTML (e, t, n),
           prompt instructions (i, a, r), action selector table (__sxActionSelectors, __sxClosestAction),
           UUID generator (makeProfileUuid, c), utm_source (d), and analytics sender (p)
           directly from the enclosing outer IIFE (02a-taxonomy-models.js). */
        // GATE-PASSED SIGNAL (marked by the shell-ui stage, 2026-10-27):
        // this single line is the app's gate-passed signal. It fires once
        // when this module loads - which only happens after the age gate
        // has been passed - and records that fact as a navigation
        // analytics event (always collected, no opt-out; see the policy
        // note above). Do not move, wrap, gate, or delete this line
        // without an owner ruling.
        p("gate_passed");
