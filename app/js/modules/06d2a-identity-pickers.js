// 06d2-profile-editor.js - Profile editor form controls, demographics, contact blocks, and veil/heat sliders
        const Oy = e.byId("profileLoadMenu"), By = e.byId("profileAddMenu"), jy = e.byId("profileSampleMenu"), jyA = e.byId("profileArchetypeMenu");
        let qy = null, Hy = null, Wy = [], Uy = "", Gy = [], Ky = 0, zy = null, Vy = null, jY = null, Yy = null, Xy = null;
        // Pair-tab load target (2026-10-27): set by ww when the import
        // dialog is opened from a pair tab's Load menu, cleared when
        // the dialog closes or a merge consumes it. While set, a
        // single-profile file import merges into that pair record
        // (see the merge branch in rk) instead of creating a profile.
        let sxPairLoadInto = null;
        // Load origin (split-center stage, 2026-10-27; activate-first
        // restored by the shell-ui stage, 2026-10-27): the profile a
        // Load action was PRESSED FROM, carried explicitly from the
        // tab's Load menu through the import dialog to the merge.
        // The target of a Load is this origin - never a profile the
        // viewport merely happens to display. Pressing Load also
        // activates the pressed tab first (see the Load handler), so
        // the displayed profile and the origin coincide; the explicit
        // origin, not the display, remains the targeting mechanism.
        // sxLoadOriginId is set
        // by ww from the menu's pressed tab and cleared when the
        // import dialog closes; sxConverterOrigin is the same origin
        // handed to a converter session (Ax), so the converter's
        // final Load lands on the origin with no second "which
        // profile?" dialogue.
        let sxLoadOriginId = null, sxConverterOrigin = null;
        // Merge immediate save (split-center stage, 2026-10-27): a
        // load's merged data is saved to profile memory IMMEDIATELY,
        // in the same act as the merge - not left resting on the
        // dirty flag and the timed draft autosave. Mirrors the Save
        // button exactly: with profile memory enabled, persist now
        // and clear the unsaved mark only when the persist succeeds;
        // without it, the merge is saved in this tab (mark cleared).
        function sxMergeSaveNow(id) {
            if (!id || !vt[id]) return;
            try {
                const cb = e.byId("rememberProfileCheckbox2x"), rp = window.Sexcapades2xRememberProfiles;
                const shouldSave = rp && (typeof rp.isEnabled === "function" ? rp.isEnabled() : (cb && cb.checked));
                if (shouldSave && "function" == typeof rp.saveNow) {
                    if (rp.saveNow()) sxClearProfileDirty(id);
                }
            } catch (err) { __sxErrLog("sx-merge-save", err); }
        }
        const Zy = {};
        function sxOpenTestChooser(t = Mt) {
            if (!t || !vt[t]) return Vy = e => sxOpenTestChooser(e), void sxOpenProfileDetails(null);
            // Activated-from: the chooser's target rides in Xy,
            // explicitly - no viewport switch to make it the active
            // profile first (split-center stage, 2026-10-27).
            Xy = t, sxCloseLoadMenu(), sxCloseModalDialog(kg), sxCloseModalDialog(Sg), sxOpenModalDialog(e.byId("testChooserDialog")),
            requestAnimationFrame(() => e.one("[data-test-choice]")?.focus());
        }
        function sxCloseTestChooser() {
            Xy = null, sxCloseModalDialog(e.byId("testChooserDialog"));
        }
        // Popularity scores shown in parentheses beside gender/orientation/role options in
        // the profile dialog, keyed by option value slug (values never change). Each scored
        // entry also carries a `source` name and `url`: hovering or focusing the option shows
        // the picker tooltip with the definition plus a clickable source line (appended by
        // popularitySourceLine). Sources: NZ national sexuality survey (N=12,885) for
        // straight/heterosexual (94.7% ±0.26), bisexual (0.8% ±0.11) and the homosexual figure
        // (0.6% ±0.09) - the survey reported 'homosexual' as one combined gay/lesbian figure,
        // applied to both Gay and Lesbian here. Ace prevalence: asexual ~1-2% (Bogaert 2004,
        // UK national probability sample, N≈18,000, found ~1% reporting no sexual attraction;
        // later reviews range higher) and demisexual ~0.6% (Pitcher et al. 2024, Journal of
        // LGBT Youth, N=17,112). Gender Census 2025 for nonbinary (61.7%) and transgender
        // (41.1%) - note those are shares among nonbinary-community respondents, a different
        // denominator from the general-population figures above. Role prevalence among BDSM
        // practitioners from Coppens et al., "The Psychology of Kink" survey: submissive
        // 39.5%, switch 31.1%, dominant 28.8% - the scored roles sort first in that order and
        // the remaining roles follow alphabetically (Unsure kept last, unburied).
        // Corroborating role data: Joyal & Carpentier 2017 (Journal of Sex Research), whose
        // general-population survey of paraphilic interests and behaviors likewise found
        // submissive and dominant role interests widely endorsed. Options with no entry show
        // no score and no source line.
        const POPULARITY_SOURCES = {
            nz: {
                source: "NZ National Sexuality Survey, N=12,885",
                url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3081103/"
            },
            genderCensus: {
                source: "Gender Census 2025, worldwide nonbinary community survey",
                url: "https://www.gendercensus.com/results/2025-worldwide/"
            },
            coppens: {
                source: "Coppens et al., Psychology of Kink survey",
                url: "https://www.researchgate.net/publication/339238941_The_Psychology_of_Kink_a_Survey_Study_into_the_Relationships_of_Trauma_and_Attachment_Style_with_BDSM_Interests"
            }
        };
        const POPULARITY_SCORES = {
            straight: {
                score: "94.7% ±0.26",
                ...POPULARITY_SOURCES.nz
            },
            heterosexual: {
                score: "94.7% ±0.26",
                ...POPULARITY_SOURCES.nz
            },
            bisexual: {
                score: "0.8% ±0.11",
                ...POPULARITY_SOURCES.nz
            },
            gay: {
                score: "0.6% ±0.09",
                ...POPULARITY_SOURCES.nz
            },
            lesbian: {
                score: "0.6% ±0.09",
                ...POPULARITY_SOURCES.nz
            },
            asexual: {
                score: "~1–2%",
                source: "Bogaert 2004, UK national probability sample, N≈18,000",
                url: "https://www.researchgate.net/publication/6462028_Asexuality_Classification_and_Characterization"
            },
            demisexual: {
                score: "~0.6%",
                source: "Pitcher et al. 2024, Journal of LGBT Youth, N=17,112",
                url: "https://psycnet.apa.org/record/2023-68523-001"
            },
            nonbinary: {
                score: "61.7%",
                ...POPULARITY_SOURCES.genderCensus
            },
            transgender: {
                score: "41.1%",
                ...POPULARITY_SOURCES.genderCensus
            },
            submissive: {
                score: "39.5%",
                ...POPULARITY_SOURCES.coppens
            },
            switch: {
                score: "31.1%",
                ...POPULARITY_SOURCES.coppens
            },
            dominant: {
                score: "28.8%",
                ...POPULARITY_SOURCES.coppens
            }
        };
        function popularitySuffix(e) {
            const t = POPULARITY_SCORES[e];
            return t ? " (" + t.score + ")" : "";
        }
        function popularitySourceLine(e, t) {
            const n = POPULARITY_SCORES[t];
            if (!n || !n.source) return;
            const i = document.createElement("span");
            i.className = "picker-source", i.appendChild(document.createTextNode(" Source: "));
            if (n.url) {
                const a = document.createElement("a");
                a.href = n.url, a.target = "_blank", a.rel = "noopener noreferrer", a.textContent = n.source,
                i.appendChild(a);
            } else i.appendChild(document.createTextNode(n.source));
            e.appendChild(i);
        }
        const eb = [ "Man", "Woman", "Nonbinary", "Transgender", "Trans Man", "Trans Woman", "Genderqueer", "Agender", "Androgyne", "Androx", "Apagender", "Bigender", "Butch", "Cisgender", "Crossdresser", "Demifem", "Demigender", "Demimasc", "Demiman", "Demivoid", "Demiwoman", "Femme", "Gender Expansive", "Gender Neutral", "Gender Non-Conforming", "Genderfae", "Genderfluid", "Genderflux", "Genderfuck", "Gendervoid", "Gynx", "Hijra", "Intersex", "Intersex Man", "Intersex Woman", "Masc", "Maverique", "Multigender", "Omnigender", "Pangender", "Plural", "Polygender", "Trans Nonbinary", "Transfeminine", "Transmasculine", "Trigender", "Two-Spirit", "Xenogender", "Questioning", "Unsure", "Not Applicable" ], tb = eb.map(e => e.toLowerCase().replace(/\s+/g, "-")), nb = {
            man: "A person whose gender identity is man, regardless of sex assigned at birth.",
            woman: "A person whose gender identity is woman, regardless of sex assigned at birth.",
            nonbinary: "A gender identity outside an exclusively man-or-woman binary.",
            genderqueer: "An identity that challenges, mixes, or falls outside conventional gender categories.",
            genderfluid: "A gender identity that changes over time or across situations.",
            genderflux: "A gender whose intensity changes, sometimes becoming weak or absent.",
            genderfae: "A fluid gender that may include feminine and neutral genders, but not masculine genders.",
            "gender-neutral": "A gender identity experienced as neutral rather than masculine or feminine.",
            "gender-non-conforming": "A broad identity or expression that does not follow conventional gender expectations.",
            "gender-expansive": "An umbrella identity for gender experiences broader than conventional binary expectations.",
            maverique: "A distinct nonbinary gender not defined by masculinity, femininity, or absence of gender.",
            xenogender: "A nonbinary gender described through concepts or metaphors beyond conventional masculine–feminine language.",
            cisgender: "A person whose gender aligns with the sex they were assigned at birth.",
            transgender: "A person whose gender differs from the sex they were assigned at birth.",
            "trans-man": "A man who is transgender.",
            "trans-woman": "A woman who is transgender.",
            "trans-nonbinary": "A nonbinary person who also identifies as transgender.",
            transmasculine: "A person whose gender or transition moves toward masculinity without necessarily identifying only as a man.",
            transfeminine: "A person whose gender or transition moves toward femininity without necessarily identifying only as a woman.",
            apagender: "A person who feels apathetic or indifferent toward their own gender identity.",
            agender: "A person who experiences no gender or identifies without a gender.",
            gendervoid: "An absence of gender experienced specifically as a blank, void, or empty space.",
            bigender: "A person who experiences two genders, either together or at different times.",
            trigender: "A person who experiences three genders, either together or at different times.",
            demigender: "A person who feels a partial connection to a gender and partial disconnection from it.",
            demiman: "A person who identifies partly, but not wholly, as a man.",
            demiwoman: "A person who identifies partly, but not wholly, as a woman.",
            demimasc: "A person who feels a partial connection to masculinity, without necessarily identifying as a man.",
            demifem: "A person who feels a partial connection to femininity, without necessarily identifying as a woman.",
            demivoid: "A person who feels partly genderless or connected to a gender void.",
            multigender: "An umbrella identity for experiencing more than one gender.",
            polygender: "A person who experiences several genders, together or at different times.",
            omnigender: "A person who experiences all genders, often with awareness of their distinctions.",
            pangender: "A person who identifies with many or all genders available within their cultural understanding.",
            plural: "A plural system whose members may have different genders or a shared system-level identity.",
            masc: "A gender identity or presentation centered on masculinity without necessarily being a man.",
            femme: "A gender identity or presentation centered on femininity without necessarily being a woman.",
            butch: "A masculine queer identity with its own community and cultural history.",
            androgyne: "A gender identity blending or existing between masculine and feminine qualities.",
            genderfuck: "A deliberately disruptive or mixed gender identity or presentation that resists conventional categories.",
            crossdresser: "A person who wears clothing associated with another gender; this describes expression, not necessarily identity.",
            androx: "A nonbinary gender that combines masculine and neutral qualities.",
            gynx: "A nonbinary gender that combines feminine and neutral qualities.",
            "two-spirit": "A culturally specific identity used by some Indigenous North American people for particular gender, social, or spiritual roles.",
            hijra: "A traditional South Asian gender identity and community distinct from the man–woman binary.",
            intersex: "A person born with sex characteristics that do not fit typical definitions of male or female bodies; intersex is not itself a gender.",
            "intersex-man": "An intersex person whose gender identity is man.",
            "intersex-woman": "An intersex person whose gender identity is woman.",
            questioning: "A person who is actively exploring or uncertain about their gender identity.",
            unsure: "A person who is not currently sure which gender label fits.",
            "not-applicable": "Use when gender is not relevant to this profile."
        }, ib = Object.fromEntries(eb.map((e, t) => {
            const n = tb[t];
            return [ n, {
                label: e,
                description: nb[n]
            } ];
        }));
        ib.couple = {
            label: "Couple / shared profile",
            description: "A shared profile representing two partners rather than one gender identity."
        };
        const ab = [ {
            label: "Sexual orientations",
            options: [ "Straight", "Heterosexual", "Bisexual", "Gay", "Lesbian", "Asexual", "Pansexual", "Demisexual", "Graysexual", "Abrosexual", "Achillean", "Aceflux", "Acespec", "Acespike", "Aegosexual", "Allosexual", "Androflexible", "Androsexual", "Androgynosexual", "Apothisexual", "Autosexual", "Benignosexual", "Bicurious", "Ceterosexual", "Cupiosexual", "Dyke", "Fictosexual", "Finsexual", "Fraysexual", "Gynesexual", "Homoflexible", "Homosexual", "Lithosexual", "Megasexual", "Minsexual", "Monosexual", "Nebulasexual", "Neptunic", "Ninsexual", "Noetisexual", "Objectumsexual", "Omnisexual", "Orchidsexual", "Pancurious", "Phallosexual", "Placiosexual", "Polysexual", "Queer", "Quoisexual", "Reciprosexual", "Sapiosexual", "Sapphic", "Saturnic", "Sex-Favorable", "Soulsexual", "Spectrasexual", "Symbiosexual", "T4T", "Uranic", "Yonisexual" ]
        }, {
            label: "Romantic orientations",
            options: [ "Alloromantic", "Androromantic", "Apresromantic", "Aroflux", "Aromantic", "Arospec", "Benignoromantic", "Biromantic", "Cupioromantic", "Demiromantic", "Finromantic", "Frayromantic", "Grayromantic", "Gyneromantic", "Heteroromantic", "Homoromantic", "Lithoromantic", "Minromantic", "Monoromantic", "Nebularomantic", "Noetiromantic", "Omniromantic", "Panromantic", "Platoniromantic", "Polyromantic", "Quoiromantic", "Recipromantic", "Sapioromantic" ]
        }, {
            label: "Other",
            options: [ "Fluid", "Fluctuating/Evolving", "Unsure", "Questioning", "Exploring", "Not Applicable" ]
        } ], rb = {
            straight: "Attraction primarily to people of a different gender.",
            heterosexual: "Sexual attraction primarily to people of a different gender.",
            bicurious: "Curiosity about attraction or experiences with more than one gender without necessarily claiming a bisexual identity.",
            bisexual: "Attraction to more than one gender; the pattern or intensity may differ by gender.",
            homoflexible: "Primarily same-gender attraction with occasional attraction to other genders.",
            gay: "Attraction primarily to people of the same gender; often used by men, and sometimes more broadly.",
            lesbian: "A woman or nonbinary person whose attraction is primarily toward women.",
            dyke: "A reclaimed lesbian identity, often carrying a deliberately strong or gender-nonconforming cultural meaning.",
            homosexual: "Sexual attraction primarily to people of the same gender.",
            pansexual: "Attraction in which gender is not a determining boundary, though gender can still be noticed.",
            pancurious: "Curiosity about attraction to people regardless of gender without necessarily claiming a pansexual identity.",
            omnisexual: "Attraction to people of all genders, with gender potentially shaping how attraction feels.",
            queer: "A broad, self-chosen identity for attraction or relationships outside heterosexual and cisgender norms.",
            androsexual: "Attraction to men or masculinity, regardless of the attracted person’s own gender.",
            androflexible: "Primarily attraction to men or masculinity, with occasional attraction beyond that pattern.",
            minsexual: "Attraction to people whose gender or presentation is masculine in nature.",
            gynesexual: "Attraction to women or femininity, regardless of the attracted person’s own gender.",
            finsexual: "Attraction to people whose gender or presentation is feminine in nature.",
            androgynosexual: "Attraction to androgynous people or androgynous gender expression.",
            ninsexual: "Attraction to people whose gender is neutral or nonbinary in nature.",
            phallosexual: "Attraction centered on partners with a penis, regardless of their gender identity.",
            yonisexual: "Attraction centered on partners with a vulva or vagina, regardless of their gender identity.",
            achillean: "An umbrella term for men and masculine-aligned nonbinary people attracted to men.",
            sapphic: "An umbrella term for women and feminine-aligned nonbinary people attracted to women.",
            uranic: "Attraction to men and masculine or neutral nonbinary people, but not to women.",
            neptunic: "Attraction to women and feminine or neutral nonbinary people, but not to men.",
            saturnic: "Attraction only to nonbinary people, including man- or woman-aligned nonbinary people, but not binary men or women.",
            ceterosexual: "Attraction primarily or exclusively to nonbinary people.",
            t4t: "A trans person’s preference for or orientation toward relationships with other trans people.",
            monosexual: "Attraction to only one gender.",
            polysexual: "Attraction to multiple genders, but not necessarily all genders.",
            spectrasexual: "Attraction to a range or spectrum of genders rather than one fixed category.",
            abrosexual: "A sexual orientation whose pattern or intensity changes over time.",
            demisexual: "Sexual attraction that develops only after a strong emotional bond forms.",
            megasexual: "Emotional connection that tends to develop only after a strong sexual connection forms.",
            noetisexual: "Sexual attraction strongly shaped by a person’s mind, ideas, or way of thinking.",
            soulsexual: "Attraction centered on a person’s inner self or perceived soul rather than gender.",
            symbiosexual: "Attraction to the shared energy, connection, or dynamic between people in an existing relationship.",
            benignosexual: "Attraction centered on kindness, compassion, or caring behavior.",
            fraysexual: "Sexual attraction that is strongest without an emotional bond and may fade as closeness develops.",
            sapiosexual: "Sexual attraction strongly centered on perceived intelligence.",
            asexual: "Experiencing little or no sexual attraction; this does not by itself describe libido or behavior.",
            acespec: "An umbrella term for identities on the asexual spectrum.",
            aceflux: "An asexual-spectrum identity in which the intensity of sexual attraction changes over time.",
            acespike: "Usually experiencing little or no sexual attraction, with occasional sudden periods of attraction.",
            graysexual: "Experiencing sexual attraction rarely, weakly, or only under limited circumstances.",
            orchidsexual: "Experiencing sexual attraction but not desiring a sexual relationship or sexual activity.",
            reciprosexual: "Experiencing sexual attraction only after learning that the other person is attracted to you.",
            lithosexual: "Experiencing sexual attraction without wanting it reciprocated, or losing attraction when it is reciprocated.",
            cupiosexual: "Experiencing little or no sexual attraction while still desiring a sexual relationship.",
            "sex-favorable": "Feeling personally positive about or comfortable with sexual activity; this can coexist with any orientation.",
            apothisexual: "An asexual identity that includes strong aversion to or repulsion toward sexual activity.",
            aegosexual: "Experiencing a disconnect between oneself and sexual attraction or fantasy, often enjoying the idea without wanting personal participation.",
            placiosexual: "Enjoying performing sexual acts for others while having little or no desire to receive them.",
            nebulasexual: "Difficulty distinguishing sexual attraction from other feelings, often in connection with neurodivergence.",
            autosexual: "Sexual attraction directed primarily toward oneself.",
            fictosexual: "Sexual attraction primarily or exclusively toward fictional characters.",
            objectumsexual: "Sexual or romantic attraction toward particular objects.",
            quoisexual: "Difficulty understanding, distinguishing, or applying the concept of sexual attraction to oneself.",
            allosexual: "Experiencing sexual attraction; often used as the counterpart to asexual-spectrum identities.",
            heteroromantic: "Romantic attraction primarily to people of a different gender.",
            biromantic: "Romantic attraction to more than one gender.",
            homoromantic: "Romantic attraction primarily to people of the same gender.",
            androromantic: "Romantic attraction to men or masculinity.",
            gyneromantic: "Romantic attraction to women or femininity.",
            minromantic: "Romantic attraction to people whose gender or presentation is masculine in nature.",
            finromantic: "Romantic attraction to people whose gender or presentation is feminine in nature.",
            panromantic: "Romantic attraction in which gender is not a determining boundary.",
            omniromantic: "Romantic attraction to people of all genders, with gender potentially shaping the attraction.",
            polyromantic: "Romantic attraction to multiple genders, but not necessarily all genders.",
            monoromantic: "Romantic attraction to only one gender.",
            demiromantic: "Romantic attraction that develops only after a strong emotional bond forms.",
            apresromantic: "Romantic attraction that develops only after another form of attraction is already present.",
            noetiromantic: "Romantic attraction strongly shaped by a person’s mind, ideas, or way of thinking.",
            benignoromantic: "Romantic attraction centered on kindness, compassion, or caring behavior.",
            frayromantic: "Romantic attraction that is strongest without an emotional bond and may fade as closeness develops.",
            sapioromantic: "Romantic attraction strongly centered on perceived intelligence.",
            aromantic: "Experiencing little or no romantic attraction; this does not rule out close or committed relationships.",
            arospec: "An umbrella term for identities on the aromantic spectrum.",
            aroflux: "An aromantic-spectrum identity in which the intensity of romantic attraction changes over time.",
            grayromantic: "Experiencing romantic attraction rarely, weakly, or only under limited circumstances.",
            nebularomantic: "Difficulty distinguishing romantic attraction from other feelings, often in connection with neurodivergence.",
            quoiromantic: "Difficulty understanding, distinguishing, or applying the concept of romantic attraction to oneself.",
            platoniromantic: "Difficulty distinguishing romantic attraction from strong platonic attraction.",
            recipromantic: "Experiencing romantic attraction only after learning that the other person is romantically attracted to you.",
            lithoromantic: "Experiencing romantic attraction without wanting it reciprocated, or losing it when reciprocated.",
            cupioromantic: "Experiencing little or no romantic attraction while still desiring a romantic relationship.",
            alloromantic: "Experiencing romantic attraction; often used as the counterpart to aromantic-spectrum identities.",
            fluid: "An orientation whose pattern or intensity changes over time.",
            "fluctuating-evolving": "An orientation that is changing, developing, or understood differently over time.",
            unsure: "Use when you are not currently sure which orientation label fits.",
            questioning: "Actively exploring or reconsidering your sexual or romantic orientation.",
            exploring: "Trying experiences or considering possibilities without committing to a fixed label.",
            "not-applicable": "Use when orientation is not relevant to this profile."
        }, ob = ab.flatMap(e => e.options.map(t => ({
            group: e.label,
            label: t,
            value: t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        }))), sb = Object.fromEntries(ob.map(e => [ e.value, {
            label: e.label,
            group: e.group,
            description: rb[e.value]
        } ]));
        sb.heteroflexible = {
            label: "Heteroflexible",
            group: "Legacy",
            description: "Primarily different-gender attraction with occasional attraction to the same gender."
        }, sb.mixed = {
            label: "Mixed / shared",
            group: "Legacy",
            description: "A shared profile whose participants have different orientations."
        }, sb.other = {
            label: "Other / not listed",
            group: "Legacy",
            description: "An orientation that is not represented by the available labels."
        };
        const lb = [ "Submissive", "Switch", "Dominant", "Ageplayer", "Babygirl", "Bottom", "Brat", "Daddy", "Domme", "Fetishist", "Kajira", "Kajirus", "Key-holder", "Kinkster", "Masochist", "Master", "Mistress", "Mommy", "Owner", "Pet", "Sadist", "Slave", "Top", "Vanilla", "Unsure" ], cb = lb.map(e => e.toLowerCase()), db = {
            vanilla: "Prefers sexual or romantic activity outside BDSM or other explicitly kinky dynamics.",
            unsure: "Still exploring which kink or power-exchange roles feel right.",
            top: "Performs or directs an activity in a scene; this describes what someone does, not necessarily who holds power.",
            bottom: "Receives or is acted upon in a scene; this describes what someone does, not necessarily who holds power.",
            switch: "Enjoys taking different sides of a role or power dynamic at different times.",
            fetishist: "Has a strong erotic focus on a particular object, material, body part, or situation.",
            kinkster: "A broad term for someone who enjoys kink or BDSM without naming one specific role.",
            dominant: "Consensually holds authority or control within a negotiated power-exchange dynamic.",
            domme: "A feminine-identifying Dominant who consensually holds authority or control in a power exchange.",
            submissive: "Consensually yields authority or control within a negotiated power-exchange dynamic.",
            brat: "A submissive who playfully resists, teases, or challenges a partner as part of the agreed dynamic.",
            daddy: "A nurturing, guiding, or authoritative role in a consensual adult age-play or caregiver dynamic.",
            mommy: "A nurturing, guiding, or authoritative feminine role in a consensual adult age-play or caregiver dynamic.",
            ageplayer: "An adult who consensually adopts or relates to an age different from their chronological age during role-play.",
            babygirl: "An adult who takes a younger, cared-for, or submissive role in a consensual age-play or caregiver dynamic.",
            pet: "A person who consensually takes on an animal-inspired or owned role in pet play.",
            sadist: "Enjoys consensually causing pain, intensity, or controlled suffering to a willing partner.",
            masochist: "Enjoys consensually receiving pain, intensity, or controlled suffering.",
            master: "A Dominant title commonly used in a structured or ongoing authority-based relationship.",
            mistress: "A feminine Dominant title commonly used in a structured or ongoing authority-based relationship.",
            slave: "A submissive identity involving a deeply negotiated surrender of authority, within explicit consent and limits.",
            kajira: "A feminine slave-role identity drawn from Gorean fiction and practiced by some adults in consensual power exchange.",
            kajirus: "A masculine slave-role identity drawn from Gorean fiction and practiced by some adults in consensual power exchange.",
            owner: "Consensually holds an ongoing ownership role over a partner within a negotiated power-exchange dynamic.",
            "key-holder": "Holds the key to a partner's chastity device and controls its release within a negotiated dynamic."
        }, ub = Object.fromEntries(lb.map((e, t) => {
            const n = cb[t];
            return [ n, {
                label: e,
                description: db[n]
            } ];
        })), pb = e.byId("genderPicker"), hb = e.byId("genderTrigger"), gb = e.byId("genderTriggerLabel"), mb = e.byId("genderMenu"), fb = e.byId("genderTooltip");
        n(mb, tb.map(e => `<button class="gender-option" type="button" role="option" data-tooltip-tap-first data-gender-value="${sxEscapeHtmlText(e)}" aria-selected="false">${sxEscapeHtmlText(ib[e].label + popularitySuffix(e))}</button>`).join(""));
        const yb = {
            female: "woman",
            male: "man",
            genderless: "agender",
            demiboy: "demiman",
            demigirl: "demiwoman",
            "intersex-male": "intersex-man",
            "intersex-female": "intersex-woman",
            mtf: "trans-woman",
            ftm: "trans-man",
            private: "not-applicable",
            "non-binary": "nonbinary"
        };
        function sxNormalizeGenders(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = yb[t] || t, Object.prototype.hasOwnProperty.call(ib, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 3);
        }
        function sxGenderLabelsText(e, t = " + ") {
            return sxNormalizeGenders(e).map(e => ib[e].label).join(t);
        }
        function sxReadGenderSelection() {
            return sxNormalizeGenders([ ...Wg.selectedOptions ].map(e => e.value));
        }
        function sxApplyGenderSelection(e) {
            const t = new Set(sxNormalizeGenders(e));
            [ ...Wg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function sxRefreshGenderPicker() {
            const e = new Set(sxReadGenderSelection()), t = sxGenderLabelsText([ ...e ]);
            gb.textContent = t || "Choose up to 3…", hb.title = t || "Choose up to three genders",
            mb.querySelectorAll("[data-gender-value]").forEach(t => {
                const n = e.has(t.dataset.genderValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 3 && !n));
            });
        }
        function sxHideGenderTooltip() {
            fb.hidden = !0, mb.querySelectorAll('[aria-describedby="genderTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function sxShowGenderTooltip(e) {
            const t = ib[e.dataset.genderValue];
            if (!t) return;
            sxHideGenderTooltip(), fb.textContent = t.description || t.label, popularitySourceLine(fb, e.dataset.genderValue), fb.hidden = !1, e.setAttribute("aria-describedby", "genderTooltip");
            const n = e.getBoundingClientRect(), i = fb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), fb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px",
            fb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function sxCloseGenderPicker(e = !1) {
            mb.hidden = !0, hb.setAttribute("aria-expanded", "false"), sxHideGenderTooltip(), e && hb.focus();
        }
        function sxOpenGenderPicker() {
            mb.hidden = !1, hb.setAttribute("aria-expanded", "true"), sxRefreshGenderPicker();
            const e = mb.querySelector('[aria-selected="true"]') || mb.querySelector(".gender-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        hb.addEventListener("click", () => mb.hidden ? sxOpenGenderPicker() : sxCloseGenderPicker(!0)), hb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(),
            sxOpenGenderPicker());
        }), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = new Set(sxReadGenderSelection()), i = t.dataset.genderValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 3)) return sm.textContent = "Choose no more than three genders.",
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            sxApplyGenderSelection([ ...n ]), Wg.dispatchEvent(new Event("change", {
                bubbles: !0
            })), sxRefreshGenderPicker(), t.focus({
                preventScroll: !0
            }), sxShowGenderTooltip(t);
        }), mb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = performance.now();
            if (mb._tfEl === t && n < mb._tfUntil) return mb._tfEl = null, mb._tfBlock = null, void sxHideGenderTooltip();
            mb._tfEl = t, mb._tfUntil = n + 3200, mb._tfBlock = t, sxShowGenderTooltip(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && mb._tfBlock === t && (mb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), mb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && sxShowGenderTooltip(t);
        }), mb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && sxShowGenderTooltip(t);
        }), pb.addEventListener("mouseleave", sxHideGenderTooltip), mb.addEventListener("focusout", () => t.setTimeout(() => {
            (mb.contains(document.activeElement) || fb.contains(document.activeElement)) || sxHideGenderTooltip();
        }, 0)), mb.addEventListener("keydown", e => {
            const t = [ ...mb.querySelectorAll(".gender-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void sxCloseGenderPicker(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const Cb = e.byId("sexualityPicker"), Mb = e.byId("sexualityTrigger"), Ib = e.byId("sexualityTriggerLabel"), Pb = e.byId("sexualityMenu"), Lb = e.byId("sexualityTooltip");
        function sxReadOrientationSelection() {
            return sxNormalizeOrientations([ ...Ug.selectedOptions ].map(e => e.value));
        }
        function sxApplyOrientationSelection(e) {
            const t = new Set(sxNormalizeOrientations(e));
            [ ...Ug.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function sxOrientationLabelsText(e, t = " + ") {
            return sxNormalizeOrientations(e).map(e => sb[e].label).join(t);
        }
        function sxRefreshOrientationPicker() {
            const e = new Set(sxReadOrientationSelection()), t = sxOrientationLabelsText([ ...e ]);
            Ib.textContent = t || "Choose up to 5…", Mb.title = t || "Choose up to five orientations",
            Pb.querySelectorAll("[data-sexuality-value]").forEach(t => {
                const n = e.has(t.dataset.sexualityValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function sxHideOrientationTooltip() {
            Lb.hidden = !0, Pb.querySelectorAll('[aria-describedby="sexualityTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function sxShowOrientationTooltip(e) {
            const t = sb[e.dataset.sexualityValue];
            if (!t) return;
            sxHideOrientationTooltip(), Lb.textContent = t.description || t.label, popularitySourceLine(Lb, e.dataset.sexualityValue), Lb.hidden = !1, e.setAttribute("aria-describedby", "sexualityTooltip");
            const n = e.getBoundingClientRect(), i = Lb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Lb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px",
            Lb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function sxCloseOrientationPicker(e = !1) {
            Pb.hidden = !0, Mb.setAttribute("aria-expanded", "false"), sxHideOrientationTooltip(), e && Mb.focus();
        }
        function sxOpenOrientationPicker() {
            Pb.hidden = !1, Mb.setAttribute("aria-expanded", "true"), sxRefreshOrientationPicker();
            const e = Pb.querySelector('[aria-selected="true"]') || Pb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Pb, ab.map(e => `<div class="sexuality-group-label" role="presentation">${sxEscapeHtmlText(e.label)}</div>${e.options.map(e => {
                const t = e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-sexuality-value="${sxEscapeHtmlText(t)}" aria-selected="false">${sxEscapeHtmlText(e + popularitySuffix(t))}</button>`;
            }).join("")}`).join("")),
        Mb.addEventListener("click", () => Pb.hidden ? sxOpenOrientationPicker() : sxCloseOrientationPicker(!0)), Mb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(),
            sxOpenOrientationPicker());
        }), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = new Set(sxReadOrientationSelection()), i = t.dataset.sexualityValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five orientations.",
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            sxApplyOrientationSelection([ ...n ]), Ug.dispatchEvent(new Event("change", {
                bubbles: !0
            })), sxRefreshOrientationPicker(), t.focus({
                preventScroll: !0
            }), sxShowOrientationTooltip(t);
        }), Pb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = performance.now();
            if (Pb._tfEl === t && n < Pb._tfUntil) return Pb._tfEl = null, Pb._tfBlock = null, void sxHideOrientationTooltip();
            Pb._tfEl = t, Pb._tfUntil = n + 3200, Pb._tfBlock = t, sxShowOrientationTooltip(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Pb._tfBlock === t && (Pb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Pb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && sxShowOrientationTooltip(t);
        }), Pb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && sxShowOrientationTooltip(t);
        }), Cb.addEventListener("mouseleave", sxHideOrientationTooltip), Pb.addEventListener("focusout", () => t.setTimeout(() => {
            (Pb.contains(document.activeElement) || Lb.contains(document.activeElement)) || sxHideOrientationTooltip();
        }, 0)), Pb.addEventListener("keydown", e => {
            const t = [ ...Pb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void sxCloseOrientationPicker(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const jb = e.byId("rolePicker"), qb = e.byId("roleTrigger"), Hb = e.byId("roleTriggerLabel"), Wb = e.byId("roleMenu"), Ub = e.byId("roleTooltip");
        function sxNormalizeRoles(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                const t = String(e || "").trim().toLowerCase();
                Object.prototype.hasOwnProperty.call(ub, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function sxRoleLabelsText(e, t = " + ") {
            return sxNormalizeRoles(e).map(e => ub[e].label).join(t);
        }
        function sxReadRoleSelection() {
            return sxNormalizeRoles([ ...Gg.selectedOptions ].map(e => e.value));
        }
        function sxApplyRoleSelection(e) {
            const t = new Set(sxNormalizeRoles(e));
            [ ...Gg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function sxRefreshRolePicker() {
            const e = new Set(sxReadRoleSelection()), t = sxRoleLabelsText([ ...e ]);
            Hb.textContent = t || "Choose up to 5…", qb.title = t || "Choose up to five roles",
            Wb.querySelectorAll("[data-role-value]").forEach(t => {
                const n = e.has(t.dataset.roleValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function sxHideRoleTooltip() {
            Ub.hidden = !0, Wb.querySelectorAll('[aria-describedby="roleTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function sxShowRoleTooltip(e) {
            const t = ub[e.dataset.roleValue];
            if (!t) return;
            sxHideRoleTooltip(), Ub.textContent = t.description || t.label, popularitySourceLine(Ub, e.dataset.roleValue), Ub.hidden = !1, e.setAttribute("aria-describedby", "roleTooltip");
            const n = e.getBoundingClientRect(), i = Ub.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Ub.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px",
            Ub.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function sxCloseRolePicker(e = !1) {
            Wb.hidden = !0, qb.setAttribute("aria-expanded", "false"), sxHideRoleTooltip(), e && qb.focus();
        }
        function sxOpenRolePicker() {
            Wb.hidden = !1, qb.setAttribute("aria-expanded", "true"), sxRefreshRolePicker();
            const e = Wb.querySelector('[aria-selected="true"]') || Wb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Wb, cb.map(e => `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-role-value="${sxEscapeHtmlText(e)}" aria-selected="false">${sxEscapeHtmlText(ub[e].label + popularitySuffix(e))}</button>`).join("")),
        qb.addEventListener("click", () => Wb.hidden ? sxOpenRolePicker() : sxCloseRolePicker(!0)), qb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(),
            sxOpenRolePicker());
        }), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = new Set(sxReadRoleSelection()), i = t.dataset.roleValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five roles.", void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            sxApplyRoleSelection([ ...n ]), sxRefreshRolePicker(), t.focus({
                preventScroll: !0
            }), sxShowRoleTooltip(t);
        }), Wb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = performance.now();
            if (Wb._tfEl === t && n < Wb._tfUntil) return Wb._tfEl = null, Wb._tfBlock = null, void sxHideRoleTooltip();
            Wb._tfEl = t, Wb._tfUntil = n + 3200, Wb._tfBlock = t, sxShowRoleTooltip(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Wb._tfBlock === t && (Wb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Wb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && sxShowRoleTooltip(t);
        }), Wb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && sxShowRoleTooltip(t);
        }), jb.addEventListener("mouseleave", sxHideRoleTooltip), Wb.addEventListener("focusout", () => t.setTimeout(() => {
            (Wb.contains(document.activeElement) || Ub.contains(document.activeElement)) || sxHideRoleTooltip();
        }, 0)), Wb.addEventListener("keydown", e => {
            const t = [ ...Wb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void sxCloseRolePicker(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const ev = [ ...e.all("[data-profile-info]") ];
        function sxSetProfileInfoOpen(t, n, i = !1) {
            const a = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            a && (a.hidden = !n, t.setAttribute("aria-expanded", String(n && i)), n ? t.setAttribute("aria-describedby", `${t.dataset.profileInfo}ProfileInfo`) : t.removeAttribute("aria-describedby"));
        }
        ev.forEach(t => {
            const n = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            n && (n.id = `${t.dataset.profileInfo}ProfileInfo`), t.addEventListener("click", e => {
                e.stopPropagation();
                const n = "true" !== t.getAttribute("aria-expanded");
                ev.forEach(e => sxSetProfileInfoOpen(e, !1)), sxSetProfileInfoOpen(t, n, n);
            }), t.addEventListener("mouseenter", () => sxSetProfileInfoOpen(t, !0, "true" === t.getAttribute("aria-expanded"))),
            t.addEventListener("mouseleave", () => {
                "true" !== t.getAttribute("aria-expanded") && sxSetProfileInfoOpen(t, !1);
            }), t.addEventListener("focus", () => sxSetProfileInfoOpen(t, !0, "true" === t.getAttribute("aria-expanded"))),
            t.addEventListener("blur", () => {
                "true" !== t.getAttribute("aria-expanded") && sxSetProfileInfoOpen(t, !1);
            });
        }), window.__sxOnPtr( e => {
            mb.hidden || pb.contains(e.target) || sxCloseGenderPicker(), Pb.hidden || Cb.contains(e.target) || sxCloseOrientationPicker(),
            Wb.hidden || jb.contains(e.target) || sxCloseRolePicker(), __sxClosestAction(e.target, "profileInfo") || ev.forEach(e => sxSetProfileInfoOpen(e, !1));
        }, !0), window.addEventListener("resize", () => {
            sxHideGenderTooltip(), sxHideOrientationTooltip(), sxHideRoleTooltip();
        });
        const nv = {
            "bi-curious": "bicurious",
            reciproseuxal: "reciprosexual",
            private: "not-applicable"
        };
        function sxNormalizeOrientations(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = nv[t] || t, Object.prototype.hasOwnProperty.call(sb, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function sxClampVeilLevel(e) {
            const t = Number(e);
            return Math.round(Math.max(0, Math.min(100, Number.isFinite(t) ? t : 50)));
        }
        function veilZoneText(t) {
            return `${t <= 0 ? "Revealed" : t <= 33 ? "Unveiling" : t <= 66 ? "Parted" : t < 100 ? "Veiled" : "Concealed"} · ${t}`;
        }
