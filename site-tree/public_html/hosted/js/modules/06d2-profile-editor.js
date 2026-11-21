// 06d2-profile-editor.js — Profile editor form controls, demographics, contact blocks, and veil/heat sliders
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
        // The target of a Load is this origin — never a profile the
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
        // in the same act as the merge — not left resting on the
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
                    if (rp.saveNow()) Vt(id);
                }
            } catch (err) { __sxErrLog("sx-merge-save", err); }
        }
        const Zy = {};
        function Qy(t = Mt) {
            if (!t || !vt[t]) return Vy = e => Qy(e), void bw(null);
            // Activated-from: the chooser's target rides in Xy,
            // explicitly — no viewport switch to make it the active
            // profile first (split-center stage, 2026-10-27).
            Xy = t, kw(), Ui(kg), Ui(Sg), Wi(e.byId("testChooserDialog")),
            requestAnimationFrame(() => e.one("[data-test-choice]")?.focus());
        }
        function Jy() {
            Xy = null, Ui(e.byId("testChooserDialog"));
        }
        // Popularity scores shown in parentheses beside gender/orientation/role options in
        // the profile dialog, keyed by option value slug (values never change). Each scored
        // entry also carries a `source` name and `url`: hovering or focusing the option shows
        // the picker tooltip with the definition plus a clickable source line (appended by
        // popularitySourceLine). Sources: NZ national sexuality survey (N=12,885) for
        // straight/heterosexual (94.7% ±0.26), bisexual (0.8% ±0.11) and the homosexual figure
        // (0.6% ±0.09) — the survey reported 'homosexual' as one combined gay/lesbian figure,
        // applied to both Gay and Lesbian here. Ace prevalence: asexual ~1–2% (Bogaert 2004,
        // UK national probability sample, N≈18,000, found ~1% reporting no sexual attraction;
        // later reviews range higher) and demisexual ~0.6% (Pitcher et al. 2024, Journal of
        // LGBT Youth, N=17,112). Gender Census 2025 for nonbinary (61.7%) and transgender
        // (41.1%) — note those are shares among nonbinary-community respondents, a different
        // denominator from the general-population figures above. Role prevalence among BDSM
        // practitioners from Coppens et al., "The Psychology of Kink" survey: submissive
        // 39.5%, switch 31.1%, dominant 28.8% — the scored roles sort first in that order and
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
        n(mb, tb.map(e => `<button class="gender-option" type="button" role="option" data-tooltip-tap-first data-gender-value="${Hi(e)}" aria-selected="false">${Hi(ib[e].label + popularitySuffix(e))}</button>`).join(""));
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
        function bb(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = yb[t] || t, Object.prototype.hasOwnProperty.call(ib, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 3);
        }
        function vb(e, t = " + ") {
            return bb(e).map(e => ib[e].label).join(t);
        }
        function wb() {
            return bb([ ...Wg.selectedOptions ].map(e => e.value));
        }
        function kb(e) {
            const t = new Set(bb(e));
            [ ...Wg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function xb() {
            const e = new Set(wb()), t = vb([ ...e ]);
            gb.textContent = t || "Choose up to 3…", hb.title = t || "Choose up to three genders",
            mb.querySelectorAll("[data-gender-value]").forEach(t => {
                const n = e.has(t.dataset.genderValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 3 && !n));
            });
        }
        function Sb() {
            fb.hidden = !0, mb.querySelectorAll('[aria-describedby="genderTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function $b(e) {
            const t = ib[e.dataset.genderValue];
            if (!t) return;
            Sb(), fb.textContent = t.description || t.label, popularitySourceLine(fb, e.dataset.genderValue), fb.hidden = !1, e.setAttribute("aria-describedby", "genderTooltip");
            const n = e.getBoundingClientRect(), i = fb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), fb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px",
            fb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Eb(e = !1) {
            mb.hidden = !0, hb.setAttribute("aria-expanded", "false"), Sb(), e && hb.focus();
        }
        function Ab() {
            mb.hidden = !1, hb.setAttribute("aria-expanded", "true"), xb();
            const e = mb.querySelector('[aria-selected="true"]') || mb.querySelector(".gender-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        hb.addEventListener("click", () => mb.hidden ? Ab() : Eb(!0)), hb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(),
            Ab());
        }), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = new Set(wb()), i = t.dataset.genderValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 3)) return sm.textContent = "Choose no more than three genders.",
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            kb([ ...n ]), Wg.dispatchEvent(new Event("change", {
                bubbles: !0
            })), xb(), t.focus({
                preventScroll: !0
            }), $b(t);
        }), mb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "genderValue");
            if (!t) return;
            const n = performance.now();
            if (mb._tfEl === t && n < mb._tfUntil) return mb._tfEl = null, mb._tfBlock = null, void Sb();
            mb._tfEl = t, mb._tfUntil = n + 3200, mb._tfBlock = t, $b(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), mb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && mb._tfBlock === t && (mb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), mb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && $b(t);
        }), mb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "genderValue");
            t && $b(t);
        }), pb.addEventListener("mouseleave", Sb), mb.addEventListener("focusout", () => t.setTimeout(() => {
            (mb.contains(document.activeElement) || fb.contains(document.activeElement)) || Sb();
        }, 0)), mb.addEventListener("keydown", e => {
            const t = [ ...mb.querySelectorAll(".gender-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Eb(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const Cb = e.byId("sexualityPicker"), Mb = e.byId("sexualityTrigger"), Ib = e.byId("sexualityTriggerLabel"), Pb = e.byId("sexualityMenu"), Lb = e.byId("sexualityTooltip");
        function Tb() {
            return iv([ ...Ug.selectedOptions ].map(e => e.value));
        }
        function Fb(e) {
            const t = new Set(iv(e));
            [ ...Ug.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function Nb(e, t = " + ") {
            return iv(e).map(e => sb[e].label).join(t);
        }
        function _b() {
            const e = new Set(Tb()), t = Nb([ ...e ]);
            Ib.textContent = t || "Choose up to 5…", Mb.title = t || "Choose up to five orientations",
            Pb.querySelectorAll("[data-sexuality-value]").forEach(t => {
                const n = e.has(t.dataset.sexualityValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function Db() {
            Lb.hidden = !0, Pb.querySelectorAll('[aria-describedby="sexualityTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function Rb(e) {
            const t = sb[e.dataset.sexualityValue];
            if (!t) return;
            Db(), Lb.textContent = t.description || t.label, popularitySourceLine(Lb, e.dataset.sexualityValue), Lb.hidden = !1, e.setAttribute("aria-describedby", "sexualityTooltip");
            const n = e.getBoundingClientRect(), i = Lb.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Lb.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px",
            Lb.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Ob(e = !1) {
            Pb.hidden = !0, Mb.setAttribute("aria-expanded", "false"), Db(), e && Mb.focus();
        }
        function Bb() {
            Pb.hidden = !1, Mb.setAttribute("aria-expanded", "true"), _b();
            const e = Pb.querySelector('[aria-selected="true"]') || Pb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Pb, ab.map(e => `<div class="sexuality-group-label" role="presentation">${Hi(e.label)}</div>${e.options.map(e => {
                const t = e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-sexuality-value="${Hi(t)}" aria-selected="false">${Hi(e + popularitySuffix(t))}</button>`;
            }).join("")}`).join("")),
        Mb.addEventListener("click", () => Pb.hidden ? Bb() : Ob(!0)), Mb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(),
            Bb());
        }), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = new Set(Tb()), i = t.dataset.sexualityValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five orientations.",
                void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            Fb([ ...n ]), Ug.dispatchEvent(new Event("change", {
                bubbles: !0
            })), _b(), t.focus({
                preventScroll: !0
            }), Rb(t);
        }), Pb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "sexualityValue");
            if (!t) return;
            const n = performance.now();
            if (Pb._tfEl === t && n < Pb._tfUntil) return Pb._tfEl = null, Pb._tfBlock = null, void Db();
            Pb._tfEl = t, Pb._tfUntil = n + 3200, Pb._tfBlock = t, Rb(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Pb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Pb._tfBlock === t && (Pb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Pb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Rb(t);
        }), Pb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "sexualityValue");
            t && Rb(t);
        }), Cb.addEventListener("mouseleave", Db), Pb.addEventListener("focusout", () => t.setTimeout(() => {
            (Pb.contains(document.activeElement) || Lb.contains(document.activeElement)) || Db();
        }, 0)), Pb.addEventListener("keydown", e => {
            const t = [ ...Pb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Ob(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const jb = e.byId("rolePicker"), qb = e.byId("roleTrigger"), Hb = e.byId("roleTriggerLabel"), Wb = e.byId("roleMenu"), Ub = e.byId("roleTooltip");
        function Gb(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                const t = String(e || "").trim().toLowerCase();
                Object.prototype.hasOwnProperty.call(ub, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function Kb(e, t = " + ") {
            return Gb(e).map(e => ub[e].label).join(t);
        }
        function zb() {
            return Gb([ ...Gg.selectedOptions ].map(e => e.value));
        }
        function Vb(e) {
            const t = new Set(Gb(e));
            [ ...Gg.options ].forEach(e => {
                e.selected = t.has(e.value);
            });
        }
        function Yb() {
            const e = new Set(zb()), t = Kb([ ...e ]);
            Hb.textContent = t || "Choose up to 5…", qb.title = t || "Choose up to five roles",
            Wb.querySelectorAll("[data-role-value]").forEach(t => {
                const n = e.has(t.dataset.roleValue);
                t.setAttribute("aria-selected", String(n)), t.setAttribute("aria-disabled", String(e.size >= 5 && !n));
            });
        }
        function Xb() {
            Ub.hidden = !0, Wb.querySelectorAll('[aria-describedby="roleTooltip"]').forEach(e => e.removeAttribute("aria-describedby"));
        }
        function Zb(e) {
            const t = ub[e.dataset.roleValue];
            if (!t) return;
            Xb(), Ub.textContent = t.description || t.label, popularitySourceLine(Ub, e.dataset.roleValue), Ub.hidden = !1, e.setAttribute("aria-describedby", "roleTooltip");
            const n = e.getBoundingClientRect(), i = Ub.getBoundingClientRect();
            let a = n.right + 8;
            a + i.width > innerWidth - 12 && (a = n.left - i.width - 8);
            let r = n.top + (n.height - i.height) / 2;
            innerWidth < 700 && (a = 12, r = innerHeight - i.height - 12), Ub.style.left = Math.max(12, Math.min(innerWidth - i.width - 12, a)) + "px",
            Ub.style.top = Math.max(12, Math.min(innerHeight - i.height - 12, r)) + "px";
        }
        function Qb(e = !1) {
            Wb.hidden = !0, qb.setAttribute("aria-expanded", "false"), Xb(), e && qb.focus();
        }
        function Jb() {
            Wb.hidden = !1, qb.setAttribute("aria-expanded", "true"), Yb();
            const e = Wb.querySelector('[aria-selected="true"]') || Wb.querySelector(".sexuality-option");
            e && (e.focus({
                preventScroll: !0
            }), e.scrollIntoView({
                block: "nearest"
            }));
        }
        n(Wb, cb.map(e => `<button class="sexuality-option" type="button" role="option" data-tooltip-tap-first data-role-value="${Hi(e)}" aria-selected="false">${Hi(ub[e].label + popularitySuffix(e))}</button>`).join("")),
        qb.addEventListener("click", () => Wb.hidden ? Jb() : Qb(!0)), qb.addEventListener("keydown", e => {
            [ "ArrowDown", "ArrowUp", "Enter", " " ].includes(e.key) && (e.preventDefault(),
            Jb());
        }), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = new Set(zb()), i = t.dataset.roleValue;
            if (n.has(i)) n.delete(i); else {
                if (!(n.size < 5)) return sm.textContent = "Choose no more than five roles.", void t.focus({
                    preventScroll: !0
                });
                n.add(i);
            }
            Vb([ ...n ]), Yb(), t.focus({
                preventScroll: !0
            }), Zb(t);
        }), Wb.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const t = __sxClosestAction(e.target, "roleValue");
            if (!t) return;
            const n = performance.now();
            if (Wb._tfEl === t && n < Wb._tfUntil) return Wb._tfEl = null, Wb._tfBlock = null, void Xb();
            Wb._tfEl = t, Wb._tfUntil = n + 3200, Wb._tfBlock = t, Zb(t), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), Wb.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Wb._tfBlock === t && (Wb._tfBlock = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), Wb.addEventListener("mouseover", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Zb(t);
        }), Wb.addEventListener("focusin", e => {
            const t = __sxClosestAction(e.target, "roleValue");
            t && Zb(t);
        }), jb.addEventListener("mouseleave", Xb), Wb.addEventListener("focusout", () => t.setTimeout(() => {
            (Wb.contains(document.activeElement) || Ub.contains(document.activeElement)) || Xb();
        }, 0)), Wb.addEventListener("keydown", e => {
            const t = [ ...Wb.querySelectorAll(".sexuality-option") ], n = t.indexOf(document.activeElement);
            let i = n;
            if ("ArrowDown" === e.key) i = Math.min(t.length - 1, n + 1); else if ("ArrowUp" === e.key) i = Math.max(0, n - 1); else if ("Home" === e.key) i = 0; else {
                if ("End" !== e.key) return "Escape" === e.key ? (e.preventDefault(), void Qb(!0)) : void 0;
                i = t.length - 1;
            }
            e.preventDefault(), t[i].focus(), t[i].scrollIntoView({
                block: "nearest"
            });
        });
        const ev = [ ...e.all("[data-profile-info]") ];
        function tv(t, n, i = !1) {
            const a = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            a && (a.hidden = !n, t.setAttribute("aria-expanded", String(n && i)), n ? t.setAttribute("aria-describedby", `${t.dataset.profileInfo}ProfileInfo`) : t.removeAttribute("aria-describedby"));
        }
        ev.forEach(t => {
            const n = e.one(`[data-profile-info-popover="${t.dataset.profileInfo}"]`);
            n && (n.id = `${t.dataset.profileInfo}ProfileInfo`), t.addEventListener("click", e => {
                e.stopPropagation();
                const n = "true" !== t.getAttribute("aria-expanded");
                ev.forEach(e => tv(e, !1)), tv(t, n, n);
            }), t.addEventListener("mouseenter", () => tv(t, !0, "true" === t.getAttribute("aria-expanded"))),
            t.addEventListener("mouseleave", () => {
                "true" !== t.getAttribute("aria-expanded") && tv(t, !1);
            }), t.addEventListener("focus", () => tv(t, !0, "true" === t.getAttribute("aria-expanded"))),
            t.addEventListener("blur", () => {
                "true" !== t.getAttribute("aria-expanded") && tv(t, !1);
            });
        }), window.__sxOnPtr( e => {
            mb.hidden || pb.contains(e.target) || Eb(), Pb.hidden || Cb.contains(e.target) || Ob(),
            Wb.hidden || jb.contains(e.target) || Qb(), __sxClosestAction(e.target, "profileInfo") || ev.forEach(e => tv(e, !1));
        }, !0), window.addEventListener("resize", () => {
            Sb(), Db(), Xb();
        });
        const nv = {
            "bi-curious": "bicurious",
            reciproseuxal: "reciprosexual",
            private: "not-applicable"
        };
        function iv(e) {
            const t = Array.isArray(e) ? e : [ e ], n = [];
            return t.forEach(e => {
                let t = String(e || "").trim().toLowerCase();
                t = nv[t] || t, Object.prototype.hasOwnProperty.call(sb, t) && !n.includes(t) && n.push(t);
            }), n.slice(0, 5);
        }
        function av(e) {
            const t = Number(e);
            return Math.round(Math.max(0, Math.min(100, Number.isFinite(t) ? t : 50)));
        }
        function veilZoneText(t) {
            return `${t <= 0 ? "Revealed" : t <= 33 ? "Unveiling" : t <= 66 ? "Parted" : t < 100 ? "Veiled" : "Concealed"} · ${t}`;
        }
        const rv = e.byId("audienceView"), ov = e.byId("veilControl"), sv = e.byId("veilTrigger"), lv = e.byId("veilEnabled"), cv = e.byId("tabVeilEnabled"), dv = e.byId("veilPopover"), uv = e.byId("veilTooltip"), pv = e.byId("audienceVeilSlider"), hv = e.byId("audienceVeilValue"), qzv = e.byId("audienceVeilZone"), gv = e.byId("audienceVeilProfile"), mv = e.byId("audienceVeilHelp"), fv = mv.textContent;
        let yv = 0, bv = sv;
        function vv() {
            return Qt && vt[Qt] ? Qt : Mt && vt[Mt] ? Mt : null;
        }
        function wv(e) {
            return [ ...tl.querySelectorAll("[data-profile-veil]") ].find(t => t.dataset.profileVeil === e) || null;
        }
        function kv(e) {
            if (!e || !vt[e]) return;
            const t = av(vpt[e]), n = Boolean(vht[e]), i = zi(2 * (t - 50)), a = wv(e), r = a && a.parentElement?.querySelector(".profile-tab-button");
            a && (a.classList.toggle("is-enabled", n), a.style.setProperty("--veil-color", i),
            a.setAttribute("aria-pressed", String(n)), a.setAttribute("aria-label", `${wt[e] || "Profile"} Veil ${n ? "on" : "off"}, level ${t}. Open Veil settings.`),
            a.title = `Veil ${n ? "on" : "off"} · ${t}`), r && (r.classList.toggle("has-veil", n),
            r.style.setProperty("--veil-color", i), r.setAttribute("aria-label", `${(r.getAttribute("aria-label") || "").replace(/,?\s*Veil on at \d+/, "")}${n ? `, Veil on at ${t}` : ""}`.replace(/,\s*,/g, ",").replace(/,\s*$/, "")));
        }
        function xv() {
            if (dv.hidden) return;
            const e = (bv && bv.isConnected ? bv : sv).getBoundingClientRect(), t = dv.getBoundingClientRect(), n = e.right + 7, i = n + t.width <= innerWidth - 10 ? n : e.left - t.width - 7;
            dv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, i))}px`, dv.style.top = `${Math.max(10, Math.min(innerHeight - t.height - 10, e.top + e.height / 2 - t.height / 2))}px`,
            dv.style.right = "auto";
        }
        function Sv() {
            if (uv.hidden) return;
            const e = sv.getBoundingClientRect(), t = uv.getBoundingClientRect(), n = e.left + e.width / 2 - t.width / 2;
            uv.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, n))}px`;
            const i = e.top - t.height - 7, a = e.bottom + 7;
            uv.style.top = `${i >= 10 ? i : Math.min(innerHeight - t.height - 10, a)}px`;
        }
        function $v(e = !1) {
            sv.disabled || (t.clear(yv), uv.hidden = !1, Sv(), e && (yv = t.setTimeout(() => {
                uv.hidden = !0;
            }, 2400)));
        }
        function Ev() {
            t.clear(yv), uv.hidden = !0;
        }
        function Av(e, t = !1) {
            dv.hidden = !e, sv.setAttribute("aria-expanded", String(e && bv === sv)), tl.querySelectorAll("[data-profile-veil]").forEach(t => t.setAttribute("aria-expanded", String(e && t === bv))),
            e && requestAnimationFrame(() => {
                xv(), t && !pv.disabled ? pv.focus({
                    preventScroll: !0
                }) : t && cv.focus({
                    preventScroll: !0
                });
            });
        }
        function Cv(e = !1) {
            const t = bv;
            Av(!1), Qt = null, bv = sv, e && t && t.isConnected && t.focus({
                preventScroll: !0
            });
        }
        function Mv() {
            const e = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            if (rv.hidden = !e, e) {
                const t = av(vpt[e]), n = Boolean(vht[e]);
                hv.value = String(t), hv.textContent = String(t), lv.checked = n, ov.classList.toggle("is-enabled", n),
                sv.disabled = !1, sv.setAttribute("aria-disabled", String(!n)), sv.style.background = zi(2 * (t - 50)),
                sv.setAttribute("aria-label", `Intimacy Veil ${t}. ${n ? "Open rating scale." : "Enable Intimacy Veil to adjust."}`);
            } else sv.disabled = !0, lv.checked = !1, ov.classList.remove("is-enabled");
            const t = vv();
            if (!t) return void (dv.hidden || Cv());
            const n = av(vpt[t]), i = Boolean(vht[t]);
            pv.value = String(n), qzv && (qzv.textContent = veilZoneText(n)), pv.disabled = !i, cv.checked = i, cv.setAttribute("aria-label", `${i ? "Disable" : "Enable"} Intimacy Veil for ${wt[t] || "this profile"}`),
            dv.classList.toggle("is-enabled", i), gv.textContent = wt[t] || "Active profile",
            pv.setAttribute("aria-label", `Intimacy Veil for ${wt[t] || "the active profile"}`), dv.classList.remove("is-clear-preview"),
            mv.textContent = fv;
        }
        function Iv(e, t) {
            if (!e || !vt[e]) return;
            const n = Boolean(vht[e]) !== Boolean(t);
            vht[e] = Boolean(t), n && zt(e), Mv(), kv(e), sxRefreshMatchTabs();
            const i = Kd();
            (e === Mt || i && Array.isArray(i.sourceIds) && i.sourceIds.includes(e)) && Mr();
        }
        let Pv = 0;
        sv.addEventListener("pointerenter", () => $v()), sv.addEventListener("pointerleave", () => {
            dv.hidden && Ev();
        }), sv.addEventListener("focus", () => $v()), sv.addEventListener("blur", () => {
            dv.hidden && Ev();
        }), sv.addEventListener("click", e => {
            e.preventDefault();
            const t = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            $v(!0), t && vht[t] && (Qt = t, bv = sv, Mv(), Av(!0, !0));
        }), lv.addEventListener("change", () => {
            const e = Mt && vt[Mt] && !ft[Mt] ? Mt : null;
            e && (Qt = e, bv = sv, Iv(e, lv.checked));
        }), cv.addEventListener("change", () => {
            const e = vv();
            e && Iv(e, cv.checked);
        }), window.__sxOnPtr( e => {
            dv.hidden || dv.contains(e.target) || __sxClosestAction(e.target, "profileVeil") || rv.contains(e.target) || (Cv(),
            Ev());
        }, !0), window.__sxOnKey( e => {
            "Escape" !== e.key || dv.hidden || (e.preventDefault(), Ev(), Cv(!0));
        }), window.addEventListener("resize", () => {
            xv(), Sv();
        }), pv.addEventListener("input", () => {
            const e = vv();
            if (!e) return Mv();
            const t = av(pv.value);
            vpt[e] = t, zt(e), kv(e), qzv && (qzv.textContent = veilZoneText(t)), e === Mt && (hv.value = String(t), hv.textContent = String(t),
            sv.style.background = zi(2 * (t - 50)), sv.setAttribute("aria-label", `Intimacy Veil ${t}. Open rating scale.`)),
            vht[e] && (Pv && cancelAnimationFrame(Pv), Pv = requestAnimationFrame(() => {
                Pv = 0, Mr({
                    animate: !1,
                    forceRepaint: !0
                });
            }));
        });
        let Lv = null;
        function Tv(e) {
            const t = pv.getBoundingClientRect(), n = .08 * t.height;
            return e.clientY < t.top - n || e.clientY > t.bottom + n;
        }
        function Fv(e) {
            dv.classList.toggle("is-clear-preview", e), mv.textContent = e ? "Release to turn off Veil." : fv,
            pv.setAttribute("aria-valuetext", e ? "Release to turn off" : String(pv.value));
        }
        function Nv(e) {
            if (!Lv || Lv.pointerId !== e.pointerId) return;
            const t = Lv;
            Lv = null;
            const n = "pointerup" === e.type && (t.clearing || Tv(e));
            if (Fv(!1), !n) return Cv(), void Ev();
            vpt[t.id] = t.startValue, Iv(t.id, !1), Cv(), Ev();
        }
        pv.addEventListener("pointerdown", e => {
            const t = vv();
            if (t && vht[t]) {
                Lv = {
                    pointerId: e.pointerId,
                    id: t,
                    startValue: av(vpt[t]),
                    clearing: !1
                };
                try {
                    pv.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
            }
        }), pv.addEventListener("pointermove", e => {
            Lv && Lv.pointerId === e.pointerId && (Lv.clearing = Tv(e), Fv(Lv.clearing));
        }), pv.addEventListener("pointerup", Nv), pv.addEventListener("pointercancel", Nv);
        /* B3 (SURFACES): the per-tab Heat button + its popover. Heat is
           SESSION state only (sxcv.heat + sxcvSave()); it never joins the
           profile store's maps, the collect/export snapshot, or either
           payload format. Group Heat is the same session state
           (sxcv.groupHeat, keyed by group profile id); the one popover
           serves both, branching on the group record, and adjusting
           Group Heat never touches a member's heat or any score.
           The popover lifecycle mirrors the Veil popover's
           (open/close/outside-click/Escape). */
        let sxHeatQt = null, sxHeatBv = null;
        function sxHeatBtnFor(e) {
            return [ ...tl.querySelectorAll("[data-profile-heat]") ].find(t => t.dataset.profileHeat === e) || null;
        }
        function sxKvHeat(e) {
            if (!e || !vt[e]) return;
            const b = sxHeatBtnFor(e), v = sxHeatDisplayFor(e), z = sxHeatZone(v), grp = sxIsGroup(e);
            b && ((b.querySelector(".sx-heat-zone") || b).textContent = z, b.title = `${grp ? "Group Heat" : "Heat"} · ${z}`, b.setAttribute("aria-label", `${wt[e] || "Profile"} ${grp ? "Group Heat" : "Heat"} ${z}. Open Heat settings.`));
        }
        function sxMvHeat() {
            const t = sxHeatQt, pop = e.byId("heatPopover");
            if (!pop) return;
            if (!t || !vt[t]) return void sxCvHeat();
            const v = sxHeatDisplayFor(t), sl = e.byId("heatSlider"), out = e.byId("heatValue"), nm = e.byId("heatProfileName"), grp = sxIsGroup(t);
            sl && (sl.value = String(v)), out && (out.textContent = `${sxHeatZone(v)} · ${v > 0 ? "+" + v : v}`),
            nm && (nm.textContent = wt[t] || "Profile"), sl && sl.setAttribute("aria-label", `${grp ? "Group heat" : "Heat"} for ${wt[t] || (grp ? "the group" : "the profile")}`);
        }
        function sxPosHeat() {
            const pop = e.byId("heatPopover");
            if (!pop || pop.hidden || !sxHeatBv) return;
            const a = (sxHeatBv.isConnected ? sxHeatBv : sxHeatBtnFor(sxHeatQt) || sxHeatBv).getBoundingClientRect(), t = pop.getBoundingClientRect(), n = a.right + 7, i = n + t.width <= innerWidth - 10 ? n : a.left - t.width - 7;
            pop.style.left = `${Math.max(10, Math.min(innerWidth - t.width - 10, i))}px`, pop.style.top = `${Math.max(10, Math.min(innerHeight - t.height - 10, a.top + a.height / 2 - t.height / 2))}px`,
            pop.style.right = "auto";
        }
        function sxAvHeat(open, focusIt = !1) {
            const pop = e.byId("heatPopover");
            if (!pop) return;
            pop.hidden = !open, tl.querySelectorAll("[data-profile-heat]").forEach(b => b.setAttribute("aria-expanded", String(open && b === sxHeatBv))),
            open && requestAnimationFrame(() => {
                sxPosHeat(), focusIt && e.byId("heatSlider")?.focus({
                    preventScroll: !0
                });
            });
        }
        function sxCvHeat(refocus = !1) {
            const b = sxHeatBv;
            sxAvHeat(!1), sxHeatQt = null, sxHeatBv = null, refocus && b && b.isConnected && b.focus({
                preventScroll: !0
            });
        }
        function sxToggleHeatPopover(id, btn) {
            const pop = e.byId("heatPopover");
            if (!pop || !id || !vt[id]) return;
            if (!pop.hidden && sxHeatQt === id && sxHeatBv === btn) return void sxCvHeat();
            sxHeatQt = id, sxHeatBv = btn, sxMvHeat(), sxAvHeat(!0, !0);
        }
        const sxHeatPopEl = e.byId("heatPopover"), sxHeatSliderEl = e.byId("heatSlider");
        sxHeatSliderEl && sxHeatSliderEl.addEventListener("input", () => {
            const t = sxHeatQt;
            if (!t) return;
            const v = Math.max(-100, Math.min(100, Math.round(Number(sxHeatSliderEl.value) || 0)));
            sxIsGroup(t) ? sxcv.groupHeat[t] = v : sxcv.heat[t] = v, sxcvSave(),
            sxMvHeat(), sxKvHeat(t), sxRefreshMatchTabs();
        }), window.__sxOnPtr( ev2 => {
            const pop = e.byId("heatPopover");
            !pop || pop.hidden || pop.contains(ev2.target) || __sxClosestAction(ev2.target, "profileHeat") || sxCvHeat();
        }, !0), window.__sxOnKey( ev2 => {
            if ("Escape" !== ev2.key) return;
            const pop = e.byId("heatPopover");
            pop && !pop.hidden && (ev2.preventDefault(), sxCvHeat(!0));
        }), window.addEventListener("resize", () => sxPosHeat());
        const _v = [ "telegram", "linktree", "fetlife", "chaturbate", "stripchat", "myfreecams", "pornhub", "xvideos", "xhamster", "onlyfans", "reddit", "x" ];
        function Dv(e) {
            let t = String(e || "").trim().replace(/[\r ]/g, "").replace(/^@/, "").slice(0, 100);
            try {
                /^https?:\/\//i.test(t) && (t = new URL(t).pathname.split("/").filter(Boolean).pop() || "");
            } catch (e) { __sxErrLog("app", e); }
            return /^[a-z0-9_.-]{1,100}$/i.test(t) ? t : "";
        }
        function Rv(e) {
            const t = e && "object" == typeof e ? e : {}, n = {
                fullName: "",
                telegram: "",
                linktree: "",
                fetlife: "",
                chaturbate: "",
                stripchat: "",
                myfreecams: "",
                pornhub: "",
                xvideos: "",
                xhamster: "",
                onlyfans: "",
                reddit: "",
                x: "",
                phone: "",
                email: "",
                customSites: []
            };
            n.fullName = String(t.fullName || "").trim().replace(/[\r ]/g, " ").replace(/\s+/g, " ").slice(0, 100),
            _v.forEach(e => n[e] = Dv(t[e] || "")), n.phone = String(t.phone || "").trim().replace(/[\r ]/g, " ").replace(/\s+/g, " ").slice(0, 60);
            const i = String(t.email || "").trim().replace(/[\r ]/g, "").slice(0, 254);
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i) && (n.email = i), Array.isArray(t.customSites) && t.customSites.slice(0, 20).forEach(e => {
                if (e && "object" == typeof e) {
                    const t = String(e.site || "").trim().slice(0, 60), i = String(e.url || "").trim().slice(0, 500), a = Dv(e.username || "");
                    t && i && /^https?:\/\//i.test(i) && a && n.customSites.push({
                        site: t,
                        url: i,
                        username: a
                    });
                }
            }), n;
        }
        function Ov(e) {
            const t = Rv(e);
            return _v.concat([ "phone", "email" ]).filter(e => t[e]).length + (Array.isArray(t.customSites) ? t.customSites.length : 0);
        }
        const CONTACT_BLOCK_SITES_CSV = "telegram:Telegram,linktree:linktr.ee,fetlife:FetLife,chaturbate:Chaturbate,stripchat:Stripchat,myfreecams:MyFreeCams,pornhub:PornHub,xvideos:XVideos,xhamster:xHamster,onlyfans:OnlyFans,reddit:Reddit,x:X,custom:Custom";
        // The site pulldown is driven by the CSV list above: each entry is
        // value:label, in pulldown order. No plus-joined list is used.
        const CONTACT_BLOCK_SITES = CONTACT_BLOCK_SITES_CSV.split(",").map(e => {
            const [value, label] = e.split(":");
            return { value: value, label: label || value };
        });
        let contactBlocks = [];
        function contactBlockIsEmpty(b) {
            return !b.usernameInput.value.trim() && !b.siteSelect.value;
        }
        function refreshContactBlockChrome() {
            contactBlocks.forEach(b => {
                b.removeButton.hidden = contactBlockIsEmpty(b);
            });
        }
        function closeContactBlockMenus() {
            // No per-row site menu remains: the site selector is a native
            // single-choice pulldown. Kept so the existing dialog-close
            // call sites need no change.
        }
        function createContactBlock(data) {
            const d = data || {}, el = document.createElement("div");
            el.className = "profile-contact-block", n(el, `<div class="profile-contact-block-main"><input class="profile-contact-block-username" type="text" maxlength="100" placeholder="username" aria-label="Username" autocomplete="off"><select class="profile-contact-block-site" aria-label="Site for this username"><option value="">Choose a site\u2026</option>${CONTACT_BLOCK_SITES.map(e => `<option value="${Hi(e.value)}">${Hi(e.label)}</option>`).join("")}</select><span class="profile-contact-block-actions"><button class="profile-contact-block-add" type="button" aria-label="Add another username">+</button><button class="profile-custom-site-remove profile-contact-block-remove" type="button" aria-label="Remove this username" hidden>\u00d7</button></span></div><div class="profile-contact-block-custom" hidden><input class="profile-contact-block-custom-site" type="text" maxlength="60" placeholder="Custom site name" aria-label="Custom site name"><input class="profile-contact-block-custom-url" type="url" maxlength="500" placeholder="https://..." aria-label="Custom site profile URL"><small class="profile-validation-message profile-contact-block-custom-error" hidden></small></div>`);
            const b = {
                el: el,
                usernameInput: el.querySelector(".profile-contact-block-username"),
                siteSelect: el.querySelector(".profile-contact-block-site"),
                addButton: el.querySelector(".profile-contact-block-add"),
                removeButton: el.querySelector(".profile-contact-block-remove"),
                customRow: el.querySelector(".profile-contact-block-custom"),
                customSiteInput: el.querySelector(".profile-contact-block-custom-site"),
                customUrlInput: el.querySelector(".profile-contact-block-custom-url"),
                customError: el.querySelector(".profile-contact-block-custom-error")
            };
            b.selectedSites = () => b.siteSelect.value ? [ b.siteSelect.value ] : [], b.setSites = e => {
                b.siteSelect.value = (e || [])[0] || "";
            }, b.refresh = () => {
                b.customRow.hidden = "custom" !== b.siteSelect.value, refreshContactBlockChrome();
            }, b.pickSite = e => {
                b.setSites([ e ]), b.siteSelect.dispatchEvent(new Event("change", {
                    bubbles: !0
                })), b.refresh();
            };
            b.siteSelect.addEventListener("change", () => {
                const v = b.siteSelect.value;
                v && contactBlocks.forEach(t => {
                    t !== b && t.siteSelect.value === v && (t.setSites([]), t.refresh());
                }), b.customError.hidden = !0, b.refresh();
            }), b.addButton.addEventListener("click", () => {
                const nb = addContactBlock(null);
                refreshContactBlockChrome(), nb && nb.usernameInput.focus({
                    preventScroll: !0
                });
            }), b.usernameInput.addEventListener("input", refreshContactBlockChrome),
            b.customSiteInput.addEventListener("input", () => {
                b.customError.hidden = !0, b.refresh();
            }), b.customUrlInput.addEventListener("input", () => {
                b.customError.hidden = !0;
            }), b.removeButton.addEventListener("click", () => removeContactBlock(b)),
            b.usernameInput.value = d.username || "", b.setSites(d.sites || []),
            d.custom && (b.customSiteInput.value = d.custom.site || "", b.customUrlInput.value = d.custom.url || ""),
            b.refresh();
            return b;
        }
        function removeContactBlock(b) {
            const i = contactBlocks.indexOf(b);
            i >= 0 && contactBlocks.splice(i, 1), b.el.remove(), contactBlocks.length || addContactBlock(null), refreshContactBlockChrome();
        }
        function addContactBlock(data) {
            const host = e.byId("profileDetailsContactBlocks");
            if (!host) return null;
            const b = createContactBlock(data);
            return contactBlocks.push(b), host.appendChild(b.el), refreshContactBlockChrome(), b;
        }
        function deriveContactBlocks(contact) {
            const c = Rv(contact), order = [], byUser = new Map(), get = u => {
                if (!byUser.has(u)) {
                    const b = {
                        username: u,
                        sites: [],
                        customs: []
                    };
                    byUser.set(u, b), order.push(b);
                }
                return byUser.get(u);
            };
            _v.forEach(k => {
                c[k] && get(c[k]).sites.push(k);
            }), (c.customSites || []).forEach(cs => {
                cs && cs.username && get(cs.username).customs.push({
                    site: cs.site,
                    url: cs.url
                });
            });
            const blocks = [];
            return order.forEach(b => {
                // One pulldown, one site per row: expand a username used
                // on several sites into one row per site, then one row
                // per custom site.
                b.sites.forEach(s => blocks.push({
                    username: b.username,
                    sites: [ s ],
                    custom: null
                }));
                b.customs.forEach(cs => blocks.push({
                    username: b.username,
                    sites: [ "custom" ],
                    custom: cs
                }));
            }), blocks;
        }
        function Hv(t) {
            const i = Rv(t);
            Yg.value = i.phone, Zg.value = i.email;
            const host = e.byId("profileDetailsContactBlocks");
            if (host) {
                contactBlocks = [], host.replaceChildren(), deriveContactBlocks(i).forEach(d => addContactBlock(d)), addContactBlock(null), refreshContactBlockChrome();
                // The per-row + button wires itself in createContactBlock.
            }
        }
        function readContactBlocks() {
            const raw = {
                fullName: Hy && ut[Hy] ? ut[Hy].fullName : "",
                phone: Yg.value,
                email: Zg.value,
                customSites: []
            }, claimField = {};
            _v.forEach(k => raw[k] = ""), contactBlocks.forEach(b => {
                b.customError.hidden = !0;
            });
            for (const b of contactBlocks) {
                const username = b.usernameInput.value.trim();
                if (!username) continue;
                for (const site of b.selectedSites()) {
                    if ("custom" === site) {
                        const name = b.customSiteInput.value.trim(), url = b.customUrlInput.value.trim();
                        if (!name || !url) return b.customError.textContent = "Name the custom site and paste its full profile link (starting https://), or choose a different site for this username.",
                        b.customError.hidden = !1, {
                            error: "A custom site needs both a name and its profile link — see the Usernames section.",
                            field: name ? b.customUrlInput : b.customSiteInput
                        };
                        raw.customSites.push({
                            site: name,
                            url: url,
                            username: username
                        });
                    } else raw[site] = username, claimField[site] = b.usernameInput;
                }
            }
            const t = Rv(raw);
            for (const k of _v) if (raw[k].trim() && !t[k]) return {
                error: `Enter only the ${k} username, using letters, numbers, dots, dashes, or underscores.`,
                field: claimField[k]
            };
            return raw.email.trim() && !t.email ? {
                error: "Enter a valid email address.",
                field: Zg
            } : {
                contact: t
            };
        }
        function stageContactUsername(username) {
            const u = String(username || "").trim();
            if (!u) return;
            let b = contactBlocks.find(b => b.usernameInput.value.trim() === u);
            b || (b = contactBlocks.find(contactBlockIsEmpty) || addContactBlock(null)), b && (b.usernameInput.value = u, b.pickSite("fetlife"), refreshContactBlockChrome());
        }
        function Uv(e) {
            return String(e || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, " ").replace(/,/g, "\\,").replace(/;/g, "\\;");
        }
        function Gv(e) {
            return String(e || "").replace(/\ /gi, " ").replace(/\\([\\,;])/g, "$1");
        }
        const Kv = {
            telegram: "X-TELEGRAM",
            linktree: "X-LINKTREE",
            fetlife: "X-FETLIFE",
            chaturbate: "X-CHATURBATE",
            stripchat: "X-STRIPCHAT",
            myfreecams: "X-MYFREECAMS",
            pornhub: "X-PORNHUB",
            xvideos: "X-XVIDEOS",
            xhamster: "X-XHAMSTER",
            onlyfans: "X-ONLYFANS",
            reddit: "X-REDDIT",
            x: "X-X"
        };
        function zv(e) {
            const t = Rv(ut[e]);
            if (!Ov(t)) return "";
            const n = [ "BEGIN:VCARD", "VERSION:4.0", `FN:${Uv(t.fullName || wt[e] || "Sexcapades profile")}` ];
            return t.phone && n.push(`TEL;TYPE=cell:${Uv(t.phone)}`), t.email && n.push(`EMAIL:${Uv(t.email)}`),
            _v.forEach(e => {
                t[e] && (n.push(`${Kv[e]}:${Uv(t[e])}`), n.push(`URL;TYPE=x-${e}:${Uv(_i(e, t[e]))}`));
            }), n.push("END:VCARD"), n.join("\r\n") + "\r\n";
        }
        function Vv(e) {
            if (!Array.isArray(e)) return [];
            const t = [];
            return e.slice(0, 8).forEach(e => {
                if (!e || "object" != typeof e || "string" != typeof e.data || !/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(e.data) || e.data.length > 65e5) return;
                const n = Math.max(1, Math.min(3e3, Number(e.width) || 1)), i = Math.max(1, Math.min(3e3, Number(e.height) || 1)), a = A(Number.isFinite(Number(e.cropX)) ? Number(e.cropX) : .5), r = A(Number.isFinite(Number(e.cropY)) ? Number(e.cropY) : .5), o = Math.max(1, Math.min(3, Number(e.cropZoom) || 1)), s = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), l = Math.abs(a - .5) > .001 || Math.abs(r - .5) > .001 || Math.abs(o - 1) > .001 || Math.abs(s) > .001, c = !0 === e.manualCrop || l;
                t.push({
                    data: e.data,
                    width: n,
                    height: i,
                    cropX: a,
                    cropY: r,
                    cropZoom: o,
                    cropRotation: s,
                    cropReady: !0 === e.cropReady || c,
                    manualCrop: c
                });
            }), t;
        }
        function Yv(e) {
            return Vv(e).map(e => Object.assign({}, e));
        }
        function Xv(e) {
            const t = Number.parseInt(String(e || "").trim(), 10);
            return Number.isInteger(t) && t >= 18 && t <= 120 ? String(t) : "";
        }
        function Zv(e) {
            return String(e || "").trim().replace(/\s+/g, " ").slice(0, 80);
        }
        function Qv(e) {
            const t = vb(rt[e]), n = Nb(ot[e]), i = Kb(st[e]), a = Xv(lt[e]);
            return [ t || "Gender not set", n || "Orientation not set", i ? `Roles: ${i}` : "", a ? `Age ${a}` : "", Zv(ct[e]) ].filter(Boolean).join(" · ");
        }
        function Jv(e, t, n) {
            const i = od(e);
            return !i.length || (bw(e) && (zy = {
                id: e,
                action: n
            }, sm.textContent = `Choose ${i.join(" and ")} before ${t}.`), !1);
        }
        function ew() {
            dm.textContent = Wy.length ? `${Wy.length} attached${8 === Wy.length ? " · maximum" : ""}` : "none attached",
            e.byId("chooseProfilePhotos").disabled = Wy.length >= 8, n(cm, Wy.map((e, t) => `<div class="profile-photo-thumb${0 === t ? " is-center-photo" : ""}"><button class="profile-photo-preview" type="button" data-adjust-photo="${t}" aria-label="Adjust center crop for attached photo ${t + 1}"><svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><defs><clipPath id="profilePhotoDraftClip${t}"><circle cx="50" cy="50" r="49"/></clipPath></defs><g clip-path="url(#profilePhotoDraftClip${t})">${aa(e, {
                x: 0,
                y: 0,
                w: 100,
                h: 100
            })}</g><circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,.58)" stroke-width="2"/></svg><span class="profile-photo-crop-label">${0 === t ? "Center photo · adjust" : "Adjust crop"}</span></button><span class="profile-photo-order"><button type="button" data-move-photo="${t}" data-photo-step="-1" aria-label="Move attached photo ${t + 1} earlier" ${0 === t ? "disabled" : ""}>↑</button><button type="button" data-move-photo="${t}" data-photo-step="1" aria-label="Move attached photo ${t + 1} later" ${t === Wy.length - 1 ? "disabled" : ""}>↓</button></span><button class="profile-photo-remove" type="button" data-remove-photo="${t}" aria-label="Remove attached photo ${t + 1}">×</button></div>`).join(""));
        }
        function tw(e) {
            return {
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: e
            };
        }
        function nw(e, t = "invalid-result") {
            return e && Number.isFinite(Number(e.cropX)) && Number.isFinite(Number(e.cropY)) ? {
                cropX: A(Number(e.cropX)),
                cropY: A(Number(e.cropY)),
                cropZoom: 1,
                cropReady: !0,
                manualCrop: !1,
                focusStatus: String(e.focusStatus || "detected")
            } : tw(t);
        }
        async function iw(e, n, i) {
            const a = Math.max(1, Number(n) || Number(e && e.width) || 1), r = Math.max(1, Number(i) || Number(e && e.height) || 1), o = {
                secureContext: window.isSecureContext,
                faceDetectorType: typeof window.FaceDetector
            };
            if ("function" !== o.faceDetectorType) return tw("unavailable");
            let s = null;
            try {
                const n = new window.FaceDetector({
                    fastMode: !0,
                    maxDetectedFaces: 8
                }), i = {
                    timeout: !0
                }, o = e => Promise.race([ Promise.resolve().then(() => n.detect(e)), new Promise(e => t.setTimeout(() => e(i), 2400)) ]), l = [];
                if ("function" == typeof window.createImageBitmap) try {
                    s = await window.createImageBitmap(e), l.push(s);
                } catch (e) {
                    String(e && e.message || e);
                }
                l.push(e);
                let c = null, d = !1, u = null, p = 0;
                for (const t of l) {
                    p++;
                    try {
                        const e = await o(t);
                        if (e === i) {
                            d = !0;
                            continue;
                        }
                        if (Array.isArray(e) && e.length) {
                            c = e;
                            break;
                        }
                        null === c && (c = []);
                    } catch (e) {
                        u = e;
                    }
                }
                const h = (c || []).filter(e => {
                    const t = e && e.boundingBox;
                    return t && Number.isFinite(Number(t.width)) && Number.isFinite(Number(t.height)) && Number(t.width) > 0 && Number(t.height) > 0;
                }).sort((e, t) => Number(t.boundingBox.width) * Number(t.boundingBox.height) - Number(e.boundingBox.width) * Number(e.boundingBox.height))[0];
                if (!h) {
                    const e = d ? "timeout" : u ? "rejected" : "no-face";
                    return u && String(u.message || u), tw(e);
                }
                const g = h.boundingBox, m = Number.isFinite(Number(g.x)) ? Number(g.x) : Number(g.left) || 0, f = Number.isFinite(Number(g.y)) ? Number(g.y) : Number(g.top) || 0, y = nw({
                    cropX: (m + Number(g.width) / 2) / a,
                    cropY: (f + Number(g.height) / 2) / r,
                    focusStatus: "detected"
                });
                return y.focusStatus, y.cropX, y.cropY, y;
            } catch (e) {
                return String(e && e.message || e), tw("error");
            } finally {
                s && "function" == typeof s.close && s.close();
            }
        }
        function aw(e) {
            return new Promise((t, n) => {
                if (!e || !/^(?:image\/(?:jpeg|png|webp|gif))$/i.test(e.type) || e.size > 3e7) return void n(new Error("Choose a PNG, JPEG, WebP, or GIF under 30 MB."));
                const i = URL.createObjectURL(e), a = new Image;
                a.onload = async () => {
                    try {
                        const e = Math.max(a.naturalWidth, a.naturalHeight);
                        if (!e) throw new Error("That image has no readable dimensions.");
                        const r = Math.min(1, 3e3 / e), o = Math.max(1, Math.round(a.naturalWidth * r)), s = Math.max(1, Math.round(a.naturalHeight * r)), l = document.createElement("canvas");
                        l.width = o, l.height = s;
                        const c = l.getContext("2d");
                        c.fillStyle = "#151816", c.fillRect(0, 0, o, s), c.drawImage(a, 0, 0, o, s);
                        const d = nw(await iw(l, o, s));
                        let u = null;
                        for (const e of [ .86, .78, .7, .62 ]) if (u = await new Promise(t => l.toBlob(t, "image/jpeg", e)),
                        u && u.size <= 22e5) break;
                        if (URL.revokeObjectURL(i), !u) return void n(new Error("That image could not be prepared."));
                        const p = new FileReader;
                        p.onload = () => t(Object.assign({
                            data: String(p.result || ""),
                            width: o,
                            height: s,
                            cropX: .5,
                            cropY: .5,
                            cropZoom: 1,
                            cropReady: !0,
                            manualCrop: !1
                        }, d || {})), p.onerror = () => n(new Error("That image could not be prepared.")),
                        p.readAsDataURL(u);
                    } catch (e) {
                        URL.revokeObjectURL(i), n(e);
                    }
                }, a.onerror = () => {
                    URL.revokeObjectURL(i), n(new Error("That image could not be opened."));
                }, a.src = i;
            });
        }
        function rw(t, n, i, a = "") {
            const r = e.byId(t), o = e.byId(n);
            r && o && (r.classList.toggle("is-invalid", i), o.hidden = !i, a && (o.textContent = a),
            r.querySelectorAll("input,select,button").forEach(e => {
                i ? e.setAttribute("aria-invalid", "true") : e.removeAttribute("aria-invalid");
            }));
        }
        function ow() {
            const e = [ ..._g.querySelectorAll('input:not([type="file"]),textarea,select') ];
            return JSON.stringify(e.map(e => {
                const t = e instanceof HTMLSelectElement && e.multiple ? [ ...e.selectedOptions ].map(e => e.value) : e.value;
                return [ e.id, e.type, t, Boolean(e.checked) ];
            }));
        }
        function sw() {
            zy = null, Vy = null, jY = null, Hy = null, Wy = [], lm.value = "", Uy = "", Gy = [], Eb(),
            Ob(), Qb(), closeContactBlockMenus(), Ui(wm), Ui(_g);
        }
        function lw() {
            Ui(wm), Wi(_g), requestAnimationFrame(() => {
                const e = _g.querySelector(".dialog-body");
                e && (e.scrollTop = Ky), Hg.focus({
                    preventScroll: !0
                });
            });
        }
        function cw() {
            if (Eb(), Ob(), Qb(), closeContactBlockMenus(), !function() {
                return ow() !== Uy || (t = Gy, !((e = Wy).length === t.length && e.every((e, n) => {
                    const i = t[n] || {};
                    return [ ...new Set([ ...Object.keys(e || {}), ...Object.keys(i) ]) ].every(t => (e || {})[t] === i[t]);
                })));
                var e, t;
            }()) return void sw();
            const t = _g.querySelector(".dialog-body");
            Ky = t ? t.scrollTop : 0, e.byId("discardProfileDetailsQuestion").textContent = Hy ? "Changes made in this profile editor have not been saved." : "This new profile has not been created.",
            Ui(_g), Wi(wm), requestAnimationFrame(() => e.byId("keepEditingProfileDetails").focus());
        }
        function dw() {
            am.textContent = `${im.value.length}/${im.maxLength} characters`, om.textContent = `${rm.value.length}/${rm.maxLength} characters`;
        }
