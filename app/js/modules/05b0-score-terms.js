        /* Domain-terms skinning (first i18n step, 2026-11-15): the active
           skin's words, resolved by the skin loader into
           window.__SX_TERMS (the loader owns the table; see
           skin-loader.js). Sexcapades keeps its own words; other skins
           get the vanilla equivalents. Falls back to the Sexcapades
           form when the loader hasn't run yet — never blank, and never
           wrong for the default skin. Shared by this module and
           05-compatibility.js (the bundle concatenates the modules
           into one scope, so this declaration is visible there). */
        function sxTerm(key) {
            var T = (typeof window !== "undefined" && window.__SX_TERMS) || null;
            var v = T && T[key];
            if (typeof v === "string" && v) return v;
            var fallback = { krossmatch: "Krossmatch", kinkFactor: "Kink Factor", playMode: "Play", parlayMode: "Parlay", conversationMode: "Conversation", playMS: "Play MS", playKF: "Play KF", parlayMS: "Parlay MS", parlayKF: "Parlay KF", debateMS: "Debate MS", debateKF: "Debate Kink Factor", getRatings: "Hot list · KinkTest · BDSMtest · Yes / No / Maybe · FetLife", heatMax: "Horndog", heatMin: "Turned off" };
            return fallback[key] || key;
        }
        window.sxTerm = sxTerm;
