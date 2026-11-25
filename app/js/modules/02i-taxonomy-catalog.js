        /* Deduplicated Taxonomy & Alias Catalog (02i-taxonomy-catalog.js)
           Inherits TaxonomyLoader, h, g, m, topicRecords, topicIdByLabel, topicLabelById,
           legacyTopicIdByOpaque, TAXONOMY_VERSION, sxName, f, y, b, v, w, k, x, S, $, E,
           A, C, M, I, P, L, T, F, sxGateCommunitySnapshot, SX_O6_PRIORS, sxO6Prior,
           sxRedditVal, sxCommunityVal, ho, q, H, sxO6TooSmallNotes, sxTopicPopularity,
           sxTopicKinkiness, W, U, G, K, z, V, Y, X, Z, Q, J, ee, te, ne, ie, re, oe, ce,
           de, ue, pe, he, ge, me, fe, ye, ve, we, ke, xe, Se, $e, Ee, Ae, fpSub, Ce, Me,
           Ie, Pe, Le, Te, Fe, Ne, _e, De, Re, _topicSubMap, sxSyncTopicGlyphs, Oe, We,
           SX_SUBSUMED_BASE_TOPIC_IDS, and Ue from the outer IIFE (02a, 02g1, 02g). */
        const be = window.__SX_EXPORT_BE || {};
        function sxSyncRoleLabels() {
            const register = topic => {
                if (!topic || "object" !== typeof topic) return;
                if ("give_receive" === topic.type && topic.give_label && topic.receive_label) {
                    const n = Wn(topic);
                    if (n) We[n] = [ topic.give_label, topic.receive_label ];
                } else if ("single" === topic.type && typeof Ue !== "undefined" && Ue) {
                    try {
                        const n = Wn(topic);
                        if (n) Ue.add(n);
                    } catch (_) {}
                }
            };
            h.forEach(cat => {
                (cat.topics || []).forEach(register);
                (cat.parentTopics || []).forEach(register);
                (cat.subcategories || []).forEach(sub => {
                    (sub.topics || []).forEach(register);
                    (sub.parentTopics || []).forEach(register);
                });
            });
        }
        sxSyncRoleLabels();
