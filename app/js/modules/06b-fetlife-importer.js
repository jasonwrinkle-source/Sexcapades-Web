        // FetLife importer alias map — SECTION START
        // (Refactor Step 1, Build 2026-10-18_0343: this section was
        // given clear delimiters and batch labels. NO mapping was
        // added, removed, or changed — structure/documentation only.)
        //
        // What uses it:
        //   ox() — saved FetLife HTML imports: exact lookup in gk
        //     (keys normalized by ck()), then the rx regex table
        //     (defined just after the sample strings, below).
        //   cx() — pasted-text imports: exact lookup in fk. fk is
        //     seeded from the topic catalog, then gk is merged in,
        //     then the guarded batch table further below.
        // Guarded insertion (IMPORTANT): merges into fk never
        // overwrite an existing key — the first definition wins
        // (the fk[e] || ... and !fk[n] guards). mk() writes only
        // gk and runs before those merges.
        // How to add aliases: append a NEW batch at the end of the
        // batch table (after Batch #3), same [target, [terms]]
        // shape, labeled with the next batch number and the
        // build/date. Keys are base terms — the importer strips
        // parenthetical qualifiers before matching.
        // ============================================================
        // ---- Batch #1 — Builds 2026-10-18_0107 / 0114
        // (2026-10-18): the original alias set, registered into
        // gk by the mk() calls below. ----
        const gk = {};
        // Build 2026-10-18_1624 — display-name registry for the FetLife
        // mapping viewer (window.__fetlifeMap, exposed after cx below):
        // fk/gk keys are ck()-normalized, so mk()/yk()/the guarded batch
        // table also record each term's original spelling here (first
        // spelling wins), letting the viewer show real FetLife names.
        const fln = {};
        function mk(e, t, n = !1) {
            t = migrateNodeKey(t);
            e.forEach(e => {
                gk[ck(e)] = {
                    id: t,
                    uncertain: n
                }, fln[ck(e)] = fln[ck(e)] || e;
            });
        }
        mk([ "Gentle touch/caress", "Cuddling" ], "t0397", !0), mk([ "Tantra", "Tantric sex", "Tantric play", "Energy play", "Tantra / energy play", "Breathwork" ], "t0110"), 
        mk([ "Sex magic", "Sacred sexuality", "Ritual kink", "Spiritual kink", "Spiritual BDSM", "Spiritual play" ], "t0367"), 
        mk([ "Tickling" ], "t0100"), mk([ "Canes", "Caning" ], "t0067"), 
        mk([ "Crop", "Riding crop", "Riding crops" ], "t0068"), mk([ "Whip", "Whips" ], "t0064"), 
        mk([ "Spanking" ], "t0056"), mk([ "Over the knee OTK Spanking", "Over the knee (OTK) Spanking", "Face slapping" ], "t0056", !0), 
        mk([ "Vampire gloves" ], "t0354", !0), mk([ "Punching play", "Kicking play" ], "t0097", !0), 
        mk([ "Rope" ], "t0022"), mk([ "Chains", "Handcuffs", "Quick release velcro", "Quick release (velcro)" ], "t0025", !0), 
        mk([ "Bondage light", "Bondage (light)" ], "cat-bondage-restriction", !0), mk([ "Bondage heavy", "Bondage (heavy)", "Suspension" ], "t0040", !0), 
        mk([ "Shibari" ], "t0022"), mk([ "Belt", "Paddle" ], "t0069", !0), 
        mk([ "Flogger" ], "t0062"), mk([ "Orgasm Control", "Forced orgasms", "Ruined orgasms" ], "t0326", !0), 
        mk([ "Chastity" ], "t0328"), mk([ "Denial" ], "t0327"), mk([ "Edging" ], "t0329"), 
        // Importer rework Part B (decided 2026-11-04): Edge Play lands on
        // the Edge play topic t0334 (which carries the risky-practice
        // asterisk), NEVER on Edging t0329. The next five are the decided
        // homes for the formerly unplaced fetishes: Morning Sex (Sex
        // acts), Bellydancing (Watching, exposure & settings), Formiphilia
        // (Sensation & atmosphere), Graphoerotica (Psychological
        // dynamics), and Toy Making, whose decided home is the Clothing,
        // materials & objects CATEGORY — a category-only target, so it is
        // reported as a broad hit and never silently rated.
        mk([ "Edge Play" ], "t0334"), mk([ "Morning Sex" ], "t0290"), mk([ "Bellydancing" ], "t0277"), 
        mk([ "Formiphilia", "Formicophilia" ], "t0120"), mk([ "Forniphilia" ], "t0405"), mk([ "Graphoerotica" ], "t0265"), mk([ "Toy Making" ], "cat-clothing-materials-objects"),
        // Importer fix package (2026-11-05): "Humiliation language" is its
        // own topic (t0240, PS Humiliation subcategory) — it must land
        // there, not fall through to the broad Humiliation subcategory
        // fallback. The broad "Humiliation" mapping (s0034) is unchanged.
        mk([ "Humiliation language" ], "t0240"), 
        mk([ "Anal sex" ], "t0297"), mk([ "Pegging" ], "t0301"), mk([ "Rimming" ], "t0294"), 
        mk([ "Using toys anal", "Using toys" ], "t0306", !0), mk([ "Using fingers anal" ], "t0299"), 
        mk([ "Butt plugs" ], "t0193", !0), mk([ "Enemas for prep", "Enemas for prep?", "Enemas as part of play", "Enemas as part of play?", "Scat" ], "cat-fluids-messy-play", !0), 
        mk([ "Gripped at neck", "Choking" ], "t0097", !0), mk([ "Objects in mouth" ], "t0035", !0), 
        mk([ "Gags" ], "t0035"), mk([ "Nipple stimulation hands", "Nipple stimulation mouth", "Breast bondage" ], "t0220", !0), 
        mk([ "Oral" ], "t0291", !0), mk([ "Blow jobs/cock worship", "Blow jobs cock worship", "Cunninglingus" ], "t0291"), 
        mk([ "Nipple Clamps" ], "t0070"), mk([ "Facials" ], "t0314"), mk([ "Breast impact" ], "t0096", !0), 
        mk([ "Fingers" ], "t0304", !0), mk([ "Toys dildos vibrators others", "Toys (dildos, vibrators, others?)", "Penis Strap on", "Penis /Strap on" ], "t0306", !0), 
        mk([ "Fisting" ], "t0310", !0), mk([ "Favorite positions", "Favorite positions?" ], "cat-positions", !0), 
        mk([ "Wax play" ], "t0098"), mk([ "Ice play" ], "t0099"), 
        mk([ "Abrasion play" ], "t0102", !0), mk([ "Being blindfolded" ], "t0103", !0), 
        mk([ "Fireplay" ], "t0098", !0), mk([ "Electric play Violet Wand E Stim", "Electric play (Violet Wand, E-Stim)" ], "t0101"), 
        mk([ "Teasing" ], "t0330"), mk([ "Biting", "Scratching" ], "t0354"), 
        mk([ "Pursuit chase", "Pursuit /chase" ], "t0352"), mk([ "Growling" ], "t0351", !0), 
        mk([ "Wrestling", "Being pinned held down", "Being pinned/held down" ], "t0353", !0), 
        mk([ "Piercings permanent temporary", "Piercings (permanent /temporary)" ], "t0074", !0), 
        mk([ "Shaving head", "Tattoos" ], "t0236", !0), mk([ "Branding", "Cutting", "Artistic Cutting" ], "t0096", !0), 
        mk([ "Medical Doctor Nurse", "Medical/Doctor/Nurse" ], "t0129"), 
        mk([ "Teacher Student", "Teacher/Student" ], "t0128"), 
        mk([ "Boss Secretary" ], "t0127", !0), mk([ "Ageplay Non sexual", "Ageplay (Non-sexual)", "Age Play Sexual", "Age Play (Sexual)" ], "t0123", !0), 
        mk([ "ABDL Diaper Play", "ABDL (Diaper Play)" ], "t0185"), mk([ "Pet play", "Pet play pony play" ], "t0136"), 
        mk([ "Pony play", "Pony Play" ], "t0138"), mk([ "Threesomes" ], "t0278"), 
        mk([ "Foursomes", "Orgy" ], "t0279", !0), mk([ "Partner Swapping" ], "t0280"), 
        mk([ "Gang bangs" ], "t0284"), mk([ "Bukkake" ], "t0314", !0), 
        mk([ "Double penetration", "Triple penetration" ], "t0306", !0), mk([ "Words I enjoy saying hearing slut whore etc", "Words I enjoy saying, hearing (slut, whore etc)" ], "t0240"), 
        mk([ "Humiliation verbal" ], "t0239"), mk([ "Exhibitionism" ], "t0270"), 
        mk([ "Voyeurism" ], "t0270"), mk([ "Body Worship" ], "t0237"), 
        mk([ "Watersports" ], "t0338"), mk([ "Needle play" ], "t0074"), 
        mk([ "Knife play" ], "t0245", !0), mk([ "Fear play", "Fear Play" ], "t0245");
        // fk: the pasted-text import map. Seeded from the topic
        // catalog just below, then gk (Batch #1) is merged in with
        // a guard — existing keys are never overwritten — then the
        // hand-written yk() aliases and the guarded batch table.
        const fk = {};
        function yk(e, t, n = "both", i = !1, a = !1) {
            t = migrateNodeKey(t);
            e.forEach(e => {
                fk[ck(e)] = {
                    id: t,
                    direction: n,
                    uncertain: i,
                    specific: a
                }, fln[ck(e)] = fln[ck(e)] || e;
            });
        }
        h.forEach(e => {
            yk([ e.name, "All " + e.name ], catId(e.name)), e.topics.forEach(e => yk([ sxName(e) ], Wn(e)));
        }), Object.entries(gk).forEach(([e, t]) => {
            fk[e] || (fk[e] = {
                id: t.id,
                direction: "both",
                uncertain: t.uncertain
            });
        }), yk([ "BDSM", "D/s", "Power exchange relationship" ], "cat-power-exchange"), 
        yk([ "Dominance", "Dominant", "Dom", "Topping", "Top" ], "cat-power-exchange", "give"), 
        yk([ "Submission", "Submissive", "Sub", "Bottoming", "Bottom" ], "cat-power-exchange", "receive"), 
        yk([ "Switch", "Switching" ], "cat-power-exchange", "both"), yk([ "Sadism", "Sadist" ], "cat-impact-pain-body-modification", "give"), 
        yk([ "Masochism", "Masochist" ], "cat-impact-pain-body-modification", "receive"), 
        yk([ "Breath play" ], "t0097", "both", !0), yk([ "CNC", "Consensual nonconsent", "Consensual non-consent" ], "t0134"), 
        yk([ "Rope", "Rope play" ], "t0022"), yk([ "Electrostimulation", "E-stim", "Violet wand" ], "t0101"), 
        yk([ "Wax play" ], "t0098"), yk([ "Tantra", "Tantric", "Tantric play" ], "t0110"), 
        yk([ "Sacred sexuality", "Sex magic", "Sex magick" ], "t0367"), yk([ "Bondage", "Bondage play" ], "cat-bondage-restriction"), 
        yk([ "Shibari", "Kinbaku" ], "t0022"), yk([ "Impact play" ], "cat-impact-pain-body-modification"), 
        yk([ "Paddling", "Paddle play" ], "t0069"), yk([ "Caning", "Cane play" ], "t0067"), 
        yk([ "Flogging" ], "t0062"), yk([ "Whipping", "Whip play", "Single Tail Whips", "Single-tail whips" ], "t0064"), 
        yk([ "Humiliation play" ], "t0240"), yk([ "Humiliation" ], "subcategory-psychological-dynamics-humiliation"), 
yk([ "Spitting", "Spit play", "Being spit on", "Spitting on someone" ], "t0341"), 
        yk([ "Name calling", "Insults", "Verbal degradation" ], "t0239", "both", !0, !0), 
        yk([ "Praise kink" ], "t0264"), yk([ "Sensory deprivation" ], "t0103"), 
        yk([ "Temperature play" ], "t0098", "both", !0), yk([ "Exhibitionism", "Exhibitionist" ], "t0270"), 
        yk([ "Voyeurism", "Voyeur" ], "t0270"), yk([ "Public play" ], "t0269", "both", !0), 
        yk([ "Anal play" ], "t0297", "both", !0), yk([ "Oral play" ], "t0291", "both", !0), 
        yk([ "Orgasm play" ], "cat-orgasm-reproductive-play", "both", !0), yk([ "Primal", "Primal kink" ], "t0351"), 
        yk([ "Predator prey", "Predator/prey" ], "t0352", "both", !0), yk([ "Service submission", "Service submissive" ], "t0359", "receive", !0), 
        yk([ "Aftercare" ], "cat-connection-aftercare"),
        // ---- Guarded batch table for fk: each [target, [terms]]
        // group is merged with the !fk[n] guard (first definition
        // wins). Groups before the Batch #2 marker are the core
        // table (Batch #1 era, Builds 0107/0114). ----
        [ [ "t0291", [ "Blow Jobs", "Blow Job", "Cocksucking", "Cock Sucking", "Eating Pussy", "Deep Throating" ] ], [ "t0297", [ "Anal", "Ass Play" ] ], [ "t0097", [ "Asphyxiaphilia", "Asphyxiaphilia Play" ] ], [ "t0306", [ "Ben Wa Balls", "Toys", "Strap-ons", "Strap-on", "Strap Ons", "Sybian", "Clit Pumping", "Pussy Pumping", "Remote-Control Devices" ] ], [ "t0213", [ "Boot Licking", "Boot Worship", "Shoe Worship", "Foot Licking", "Foot/Feet" ] ], [ "t0397", [ "Caressing", "Caress", "Cuddles", "Snuggling", "Making Out", "Touching", "Aftercare Cuddles" ] ], [ "t0070", [ "Clover Clamps" ] ], [ "t0022", [ "Japanese Bondage" ] ], [ "t0136", [ "Petplay", "Kitten Petplay", "Puppy Play" ] ], [ "t0351", [ "Primal Play" ] ], [ "t0181", [ "Panties" ] ], [ "t0267", [ "Erotic Photography", "Photography", "Making Home Movies" ] ], [ "t0263", [ "Dirty Text Messaging", "Talking Dirty" ] ], [ "t0270", [ "Flashing" ] ], [ "t0383", [ "Furry" ] ], [ "t0284", [ "Gangbangs", "Gangbang" ] ], [ "t0292", [ "Throat Fucking" ] ], [ "t0220", [ "Tit Fucking" ] ], [ "t0025", [ "Shackles" ] ], [ "t0268", [ "Cyber Sex", "Sex Online" ] ], [ "t0133", [ "Abduction Play" ] ], [ "t0010", [ "Affectionate Domination", "Domination", "Sensual Domination", "Total Power Exchange", "male submission" ] ], /* Batch #2 — Build 2026-10-18_0210 (2026-10-18): sourced from the server unmapped_fetishes table; terms already in the map were not duplicated. */ [ "t0315", [ "Anal Creampie", "Creampie" ] ], [ "t0298", [ "Anal Stretching" ] ], [ "t0377", [ "Anonymous Encounters", "Glory Hole", "Sex with Strangers" ] ], [ "t0297", [ "Ass to Mouth" ] ], [ "t0218", [ "Ass worship" ] ], [ "t0229", [ "BBW/BHM" ] ], [ "t0035", [ "Ball Gags" ] ], [ "t0084", [ "Ball Stretching" ] ], [ "t0056", [ "Bare Handed Spanking" ] ], [ "subcategory-sex-acts-fluids", [ "Bareback", "Cum" ] ], [ "t0213", [ "Barefoot" ] ], [ "t0314", [ "Swallowing", "Swallowing Cum" ] ], [ "subcategory-sex-acts-fluids", [ "Being Cummed On" ] ], [ "t0264", [ "Being called a good girl" ] ], [ "t0065", [ "Belt Spanking" ] ], [ "t0149", [ "Bimboification", "Human Doll" ] ], [ "t0103", [ "Blindfolds", "Eye Contact Restrictions" ] ], [ "subcategory-bondage-restriction-restraints", [ "Bondage Equipment" ] ], [ "t0305", [ "Breast/Nipple Play", "Nipples" ] ], [ "t0331", [ "Breeding", "Impregnation Fantasy" ] ], [ "t0269", [ "Butt plugs in public", "Covert Bondage", "Outdoor Bondage", "Outdoor sex", "Sex In Public", "Sex in videostore porn rooms" ] ], [ "t0270", [ "CFNM", "Nudity" ] ], [ "t0098", [ "Candle Wax" ] ], [ "t0152", [ "Catsuits", "Fetish Wear" ] ], [ "t0110", [ "Chakra energy play" ] ], [ "t0354", [ "Claws", "Fingernails", "Neck Biting" ] ], [ "t0168", [ "Clit Pumping", "Pussy Pumping", "Vacuum Bed" ] ], [ "subcategory-body-focus-appearance-worship", [ "Cock Worship", "Cunt Worship", "Goddess Worship", "Pussy Worship" ] ], [ "t0003", [ "Collar and Lead/Leash", "Posture Collars", "Slave Bells" ] ], [ "subcategory-roleplay-identity-authority", [ "Control" ] ], [ "subcategory-clothing-materials-objects-uniforms-costumes", [ "Costumes/Dressing-up" ] ], [ "t0068", [ "Crops" ] ], [ "t0281", [ "Cuckolding" ] ], [ "t0397", [ "Cuddling Naked", "Cuddling with benefits", "Erotic Massage", "Hot Oil Massages", "Massage", "Massages", "Neck Kissing/Touching" ] ], [ "t0122", [ "Daddy Daughter roleplay", "Daddy/babygirl", "Daddy/girl" ] ], [ "t0239", [ "Defilement", "Sluts" ] ], [ "subcategory-clothing-materials-objects-objects-toys", [ "Dildos", "Vibrators" ] ], [ "t0319", [ "Doggy Style" ] ], [ "t0005", [ "Enforced Bedtime", "Punishment" ] ], [ "t0267", [ "Webcams" ] ], [ "t0292", [ "Face Fucking", "Gagging/Choked by Cock" ] ], [ "t0100", [ "Feathers" ] ], [ "t0316", [ "Female Ejaculation" ] ], [ "t0386", [ "Feminization", "Sissy", "Sissy Training" ] ], [ "t0398", [ "Food Play" ] ], [ "t0404", [ "Forehead Kisses", "Kissing", "Tongue Sucking" ] ], [ "t0362", [ "Grooming" ] ], [ "t0279", [ "Group Sex" ] ], [ "t0056", [ "Hairbrush Spanking", "Slapping" ] ], [ "t0002", [ "High Protocol", "Protocol", "Rituals", "Yes Sir", "no panties rule" ] ], [ "t0043", [ "Hook Suspension" ] ], [ "t0099", [ "Ice Cubes" ] ], [ "t0131", [ "Internal Enslavement", "Master/Slave", "Old Guard Slavery", "Sexual Slavery", "slavery" ] ], [ "t0325", [ "Kneeling" ] ], [ "t0022", [ "Light Bondage", "Rope Bondage/Suspension" ] ], [ "t0278", [ "MMF Threesomes", "Two-Girl Blowjobs" ] ], [ "t0370", [ "Maid Uniforms" ] ], [ "subcategory-psychological-dynamics-mind-control", [ "Mind Control" ] ], [ "t0009", [ "Mistress/slave" ] ], [ "t0301", [ "Mistresses with Strap-Ons" ] ], [ "t0126", [ "Mommy/Boy Dynamics" ] ], [ "t0237", [ "Necks" ] ], [ "t0374", [ "Nun/Priest Play" ] ], [ "t0016", [ "Obedience Training" ] ], [ "t0271", [ "Online Play", "Phone Sex" ] ], [ "t0282", [ "Polyamory" ] ], [ "t0222", [ "Pregnant" ] ], [ "t0335", [ "Prostate Massage", "Prostate Milking" ] ], [ "subcategory-psychological-dynamics-humiliation", [ "Public Humiliation", "Verbal Humiliation and Degradation" ] ], [ "subcategory-body-focus-appearance-body-type", [ "Red Heads", "Small Tits" ] ], [ "t0007", [ "Role Play" ] ], [ "t0353", [ "Rough Sex" ] ], [ "subcategory-bondage-restriction-sensory", [ "Sensation Play", "Sensual Play", "Sensualism" ] ], [ "t0277", [ "Sensual/slave dances" ] ], [ "t0359", [ "Service" ] ], [ "t0360", [ "Service-oriented submission" ] ], [ "t0212", [ "Shaving" ] ], [ "t0236", [ "Slave Tattoos" ] ], [ "t0322", [ "Sleepy Sex" ] ], [ "t0089", [ "Sounds", "Urethral Sounds" ] ], [ "t0130", [ "Speculums" ] ], [ "t0026", [ "Spreader Bars" ] ], [ "t0109", [ "Sweat" ] ], [ "t0345", [ "Toilet" ] ], [ "t0243", [ "human furniture" ] ], [ "t0358", [ "WolfPlay" ] ], [ "t0290", [ "Waking up to oral sex" ] ], /* Batch #3 — Build 2026-10-18_0302 (2026-10-18): 28 aliases from the server unmapped_fetishes table. */ [ "t0298", [ "Anal Training" ] ], [ "t0084", [ "CBT" ] ], [ "t0070", [ "Clamps and Clips" ] ], [ "t0134", [ "Consensual Nonconsent Play" ] ], [ "t0129", [ "Doctor/Nurse Play" ] ], [ "t0085", [ "Fire Cupping" ] ], [ "t0307", [ "Fucking Machines" ] ], [ "t0252", [ "Sadomasochism" ] ], [ "t0376", [ "Seduction" ] ], [ "t0213", [ "Toes and Feet" ] ], [ "t0312", [ "Urethral Fucking" ] ], [ "t0311", [ "Vacuum pumping" ] ], [ "t0309", [ "Vaginal Stretching" ] ], [ "t0291", [ "Ass Licking" ] ], [ "t0165", [ "Ballet Boots/Shoes" ] ], [ "t0251", [ "Emotional Masochism" ] ], [ "t0293", [ "Face sitting/smothering" ] ], [ "t0242", [ "Micropenises", "tiny cocks" ] ], [ "t0002", [ "Sir" ] ], [ "t0338", [ "pee inside Me", "piss" ] ], [ "t0331", [ "Threating to forcibly impregnate her" ] ], [ "t0264", [ "being valued" ] ], [ "subcategory-clothing-materials-objects-masks-headwear", [ "Masks" ] ], [ "subcategory-bondage-restriction-restraints", [ "Restraints" ] ], [ "subcategory-clothing-materials-objects-footwear", [ "Shoes" ] ], [ "subcategory-psychological-dynamics-humiliation", [ "human ashtray" ] ], /* Batch #4 — Importer rework (2026-11-04): decided mappings only. Edge Play → the Edge play topic (never Edging); the five formerly unplaced fetishes at their decided homes — Morning Sex, Bellydancing, Formiphilia (plus FetLife's own "Forniphilia" spelling), Graphoerotica as topics, and Toy Making at its decided CATEGORY home (broad hit, never silently rated). Guarded like every batch: existing keys win, so the catalog-seeded entries for the four topics are untouched. */ [ "t0334", [ "Edge Play" ] ], [ "t0290", [ "Morning Sex" ] ], [ "t0277", [ "Bellydancing" ] ], [ "t0120", [ "Formiphilia", "Forniphilia" ] ], [ "t0265", [ "Graphoerotica" ] ], [ "cat-clothing-materials-objects", [ "Toy Making" ] ] ].forEach(([e, t]) => t.forEach(t => {
            const n = ck(t), id = migrateNodeKey(e);
            n && (fln[n] = fln[n] || t), n && !fk[n] && (fk[n] = {
                id: id,
                direction: "both",
                uncertain: !0
            });
        }));
        // ---- FetLife importer alias map — SECTION END ----
        // (The next alias batch goes at the end of the guarded
        // batch table above, inside this section — do not scatter
        // alias writes elsewhere in the file.)
        const bk = [ {
            pattern: /\b(?:spit|spitting|spat)\b/,
            id: "t0341"
        }, {
            pattern: /\b(?:insult|insults|insulting|name calling|verbal degradation)\b/,
            id: "t0239"
        }, {
            pattern: /\b(?:face slap|face slapping|slap in the face)\b/,
            id: "t0056"
        }, {
            pattern: /\b(?:breath play|breath control|choking|strangulation)\b/,
            id: "t0097"
        }, {
            pattern: /\b(?:knife play|blade play)\b/,
            id: "t0245"
        }, {
            pattern: /\b(?:hot wax|waxing)\b/,
            id: "t0098"
        }, {
            pattern: /\b(?:ice play|cold play)\b/,
            id: "t0099"
        }, {
            pattern: /\b(?:chasing|pursuit play)\b/,
            id: "t0352"
        } ], vk = e.byId("converterDialog"), wk = e.byId("converterTitle"), kk = e.byId("converterSubtitle"), xk = e.byId("converterInstructions"), Sk = e.byId("converterInputLabel"), $k = e.byId("converterInput"), Ek = e.byId("converterPasteTools"), Ak = e.byId("converterActions"), Ck = e.byId("converterPreview"), Mk = e.byId("converterPreviewSummary"), Ik = e.byId("converterWarnings"), Pk = e.byId("converterStatus"), Lk = e.byId("applyConverter"), Tk = e.byId("chooseConverterFile"), Fk = e.byId("converterFileInput"), Nk = e.byId("converterMode"), _k = e.byId("takeConverterTest"), Dk = e.byId("pasteConverterResults"), Rk = e.byId("interactiveTest"), Ok = e.byId("testQuestions"), Bk = e.byId("testProgress"), jk = e.byId("testHeading"), qk = e.byId("testSourceNote"), Hk = e.byId("submitChecklistRow"), Wk = e.byId("submitChecklistResults"), Uk = e.byId("previewConverter");
        let Gk = null, Kk = null, zk = null, Vk = null, Yk = null, Xk = {}, Zk = 0, Qk = 0, ktPage = 0;
        let sxFlFields = null;
        function Jk() {
            return Zk ? Math.max(0, Math.floor((Date.now() - Zk) / 1e3)) : 0;
        }
        function ex() {
            t.clear(Qk), Qk = 0, Zk = 0;
        }
        function tx() {
            Zk || (Zk = Date.now(), Ex(), Qk = t.setInterval(Ex, 1e3));
        }
        const nx = {
            kinktest: "Pleasure Control: 48% Dom, 36% sub\nRestraint: 0% Dom, 70% sub\nRoleplay: 19% Dom, 22% sub\nDegradation: 4% Dom, 22% sub\nPain: 8% Dom, 3% sub\nSensation: 0% Dom, 0% sub\nEdge Play: 0% Dom, 0% sub\nPotty Play: 0% Dom, 0% sub",
            checklist: "",
            fetlife: "Into: Spanking — Everything to do with it, Rope bondage — Giving, Leather — Wearing Curious about: Pet play — Receiving Soft limits: Temperature play Hard limits: Choking",
            bdsmtest: "100% Dominant 82% Switch 64% Rigger 41% Rope bunny 18% Primal (Prey)"
        }, fetlifeSampleHtml = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>SampleSwitch - FetLife</title>\n</head>\n<body>\n<div class=\"profile\">\n<h1>SampleSwitch</h1>\n<p>A sample FetLife profile page, saved with Save Page As, so you can try the importer without using your own page.</p>\n<h2>Fetishes</h2>\n<p>Into</p>\n<ul>\n<li><a href=\"https://fetlife.com/fetishes/101\">Spanking</a></li>\n<li><a href=\"https://fetlife.com/fetishes/102\">Chastity</a></li>\n<li><a href=\"https://fetlife.com/fetishes/103\">Edging</a></li>\n<li><a href=\"https://fetlife.com/fetishes/104\">Leather</a></li>\n<li><a href=\"https://fetlife.com/fetishes/105\">Flogging</a></li>\n<li><a href=\"https://fetlife.com/fetishes/106\">Gags</a></li>\n<li><a href=\"https://fetlife.com/fetishes/107\">Exhibitionism</a></li>\n<li><a href=\"https://fetlife.com/fetishes/108\">Humiliation</a></li>\n<li><a href=\"https://fetlife.com/fetishes/109\">Suspension</a></li>\n<li><a href=\"https://fetlife.com/fetishes/110\">Voyeurism</a></li>\n<li><a href=\"https://fetlife.com/fetishes/111\">Handcuffs</a></li>\n<li><a href=\"https://fetlife.com/fetishes/112\">Omorashi</a></li>\n</ul>\n<p>Curious</p>\n<ul>\n<li><a href=\"https://fetlife.com/fetishes/201\">Tickling</a></li>\n<li><a href=\"https://fetlife.com/fetishes/202\">Degradation</a></li>\n<li><a href=\"https://fetlife.com/fetishes/203\">Crossdressing</a></li>\n<li><a href=\"https://fetlife.com/fetishes/204\">Biting</a></li>\n<li><a href=\"https://fetlife.com/fetishes/205\">Pegging</a></li>\n<li><a href=\"https://fetlife.com/fetishes/206\">Forniphilia</a></li>\n<li><a href=\"https://fetlife.com/fetishes/207\">Spectrophilia</a></li>\n</ul>\n</div>\n</body>\n</html>", ix = [ [ "Handcuffing your partner, or tying their hands", "t0025", "give" ], [ "Requiring your partner to avoid going to the toilet until they are desperate", "cat-fluids-messy-play", "give" ], [ "Being pleasured until you can't handle it any more or being forced to orgasm many times", "t0326", "receive" ], [ "Making your partner wear and use a nappy", "t0185", "give" ], [ "Preventing your partner from orgasming until they beg", "t0327", "give" ], [ "Calling your partner names that imply authority like “master” or “daddy”", "t0131", "receive" ], [ "Cutting your partner with a blade, causing bleeding but no serious or permanent injury", "t0096", "give" ], [ "Peeing on your partner", "t0338", "give" ], [ "Causing pain by directly hitting or using implements on your partner's genitals", "t0096", "give" ], [ "Being peed on", "t0338", "receive" ], [ "Being stimulated by electricity, such as from a toy like the violet wand", "t0101", "receive" ], [ "Being denied any form of sexual stimulation for a period of time", "t0327", "receive" ], [ "Bringing your partner to orgasm, then ceasing stimulation to diminish the pleasure", "t0326", "give" ], [ "Hitting your partner with a crop, cane, or whip hard enough to bruise", "cat-impact-pain-body-modification", "give" ], [ "Being restrained by your partner's body, for example being held down on a bed", "t0353", "receive" ], [ "Being treated like a pet", "t0136", "receive" ], [ "Gagging your partner with a ball gag, O-ring gag, or similar", "t0035", "give" ], [ "Having sex or masturbating in a room visible from the street, with the curtains open", "t0270", "give" ], [ "Pulling your partner's hair hard enough to hurt", "t0093", "give" ], [ "Gagging your partner with an ordinary gag", "t0035", "give" ], [ "Having your partner use needles or pins to penetrate your skin", "t0074", "receive" ], [ "Being made to wear and use a nappy", "t0185", "receive" ], [ "Having pressure put on your neck, making it difficult but not impossible to breathe", "t0097", "receive" ], [ "Being cut with a blade, causing bleeding but no serious or permanent injury", "t0096", "receive" ], [ "Being spanked with a bare hand", "t0056", "receive" ], [ "Treating your partner like a child", "t0123", "give" ], [ "Being called names that imply authority like “master” or “daddy”", "t0131", "give" ], [ "Restraining your partner with your body, for example by holding them down on a bed", "t0353", "give" ], [ "Having sex or masturbating in a public place where people could come across you", "t0269", "give" ], [ "Observing someone undressing without their knowledge", "t0270", "give" ], [ "Putting pressure on your partner's neck, making it difficult but not impossible to breathe", "t0097", "give" ], [ "Putting clamps or clothes pegs on your partner's nipples or elsewhere", "t0070", "give" ], [ "Acting out a scene in which your partner pretends to rape you", "t0134", "receive" ], [ "Acting out a scene in which you pretend to rape your partner", "t0134", "give" ], [ "Having nails dug into your buttocks, or your back scratched, causing pain without breaking skin", "t0354", "receive" ], [ "Digging your nails into your partner's buttocks, or scratching their back, causing pain without breaking skin", "t0354", "give" ], [ "Being choked so that you cannot breathe, causing you to feel faint or lose consciousness", "t0097", "receive" ], [ "Forcing your partner to interact with faeces", "cat-fluids-messy-play", "give" ], [ "Being gagged with an ordinary gag", "t0035", "receive" ], [ "Choking your partner so they cannot breathe, causing faintness or unconsciousness", "t0097", "give" ], [ "Denying your partner any form of sexual stimulation for a period of time", "t0327", "give" ], [ "Being hit with a crop, cane, or whip hard enough to bruise", "cat-impact-pain-body-modification", "receive" ], [ "Being handcuffed or having your hands tied", "t0025", "receive" ], [ "Having sex or masturbating in front of other people at an orgy or as part of a show", "t0270", "give" ], [ "Being tied up so you can hardly move at all", "t0040", "receive" ], [ "Using needles or pins to penetrate your partner's skin", "t0074", "give" ], [ "Being prevented from orgasming until you beg", "t0327", "receive" ], [ "Having clamps or clothes pegs put on your nipples or elsewhere", "t0070", "receive" ], [ "Being caused pain by your partner hitting or using implements on your genitals", "t0096", "receive" ], [ "Being made to serve your partner as a cleaner or retail worker might", "t0360", "receive" ], [ "Using electricity, such as a violet wand, to stimulate your partner", "t0101", "give" ], [ "Being treated like a child", "t0123", "receive" ], [ "Tying or cuffing your partner to a bed or other object", "t0042", "give" ], [ "Having your partner serve you as a cleaner or retail worker might", "t0360", "give" ], [ "Being called demeaning words like “slut,” “whore,” “bitch,” or “sissy”", "t0240", "receive" ], [ "Observing someone having sex or masturbating in their own home, without their knowledge", "t0270", "give" ], [ "Having your hair pulled hard enough to hurt", "t0093", "receive" ], [ "Being tied or cuffed to a bed or other object", "t0042", "receive" ], [ "Having a blade used on you to instil fear, without causing bleeding", "t0245", "receive" ], [ "Spanking your partner with a bare hand", "t0056", "give" ], [ "Pleasuring your partner until they can't handle it or forcing them to orgasm many times", "t0326", "give" ], [ "Overhearing someone having sex or masturbating", "t0270", "give" ], [ "Observing someone having sex or masturbating as part of a sex show", "t0266", "give" ], [ "Calling your partner demeaning words like “slut,” “whore,” “bitch,” or “sissy”", "t0240", "give" ], [ "Using a blade on your partner to instil fear, without causing bleeding", "t0245", "give" ], [ "Tying your partner up so they can hardly move at all", "t0040", "give" ], [ "Being required to avoid going to the toilet until you are desperate", "cat-fluids-messy-play", "receive" ], [ "Being forced to interact with faeces", "cat-fluids-messy-play", "receive" ], [ "Being gagged with a ball gag, O-ring gag, or similar", "t0035", "receive" ], [ "Being brought to orgasm, with stimulation stopped at the right moment to diminish pleasure", "t0326", "receive" ], [ "Treating your partner like a pet", "t0136", "give" ] ].map((e, t) => ({
            number: t + 1,
            question: e[0],
            id: e[1],
            direction: e[2]
        })), ax = [ "Anal sex", "Beating (hands)", "Beating (padded clubs)", "Being bitten", "Being serviced (sexual)", "Blindfolds", "Body paint", "Bondage (heavy/suspension)", "Bondage (intricate/Japanese style)", "Bondage (light)", "Bruises", "Butt plugs", "Cages (locked inside of)", "Caning", "Chains", "Chastity belts", "Clothespins", "Cock rings/straps", "Cock worship", "Corsets", "Cross-dressing", "Cuffs (leather/metal)", "Dildos", "Double penetration", "Erotic dancing", "Exhibitionism", "Eye contact restrictions", "Face slapping", "Fisting", "Flogging", "Following orders", "Food play", "Foot worship", "Gags (cloth/tape)", "Genital sex", "Hair pulling", "Hairbrush spankings", "Hand jobs (giving)", "Hand jobs (receiving)", "Head (giving)", "Head (receiving)", "High heels", "Hot waxing", "Ice cubes", "Kneeling", "Leather clothing", "Leather restraints", "Lingerie (wearing)", "Manacles & Irons", "Manicures (giving)", "Manicures (receiving)", "Marks (giving)", "Marks (receiving)", "Massage (giving)", "Massage (receiving)", "Modeling for erotic photos", "Nipple play", "Oral/anal play (rimming)", "Orgasm denial", "Outdoor sex", "Over-the-knee spanking", "Pain (mild to severe)", "Phone sex", "Pinching", "Play kidnapping", "Punishment scene", "Pussy/cock whipping/spanking", "Riding crops", "Rubber/latex clothing", "Saran wrapping", "Scenes (prison, religious, etc.)", "Scratching (giving)", "Scratching (receiving)", "Serving as a maid/butler", "Shaving", "Shoe/boot worship", "Skinny-dipping", "Slutty clothing", "Spanking", "Spreader bars", "Standing in corner", "Stocks", "Strap-on dildos", "Swallowing semen", "Swapping (with one other couple)", "Swinging (multiple couples)", "Tattooing", "Teasing", "TENS Unit", "Thumbcuffs (metal)", "Tickling", "Triple penetration", "Uniforms", "Vibrator on genitals", "Video (recordings of you)", "Video (watching others)", "Violet wand", "Voyeurism (watching others)", "Wearing symbolic jewelry", "Whips", "Wooden paddles", "Wrestling" ], axCat = { "Anal sex": "Getting started", "Beating (hands)": "Getting started", "Beating (padded clubs)": "Getting started", "Being bitten": "Getting started", "Being serviced (sexual)": "Getting started", "Blindfolds": "Getting started", "Body paint": "Getting started", "Bondage (heavy/suspension)": "Bondage", "Bondage (intricate/Japanese style)": "Bondage", "Bondage (light)": "Bondage", "Bruises": "Bondage", "Butt plugs": "Bondage", "Cages (locked inside of)": "Bondage", "Caning": "Caning", "Chains": "Caning", "Chastity belts": "Caning", "Clothespins": "Caning", "Cock rings/straps": "Caning", "Cock worship": "Cock worship", "Corsets": "Cock worship", "Cross-dressing": "Cock worship", "Cuffs (leather/metal)": "Cock worship", "Dildos": "Cock worship", "Double penetration": "Cock worship", "Erotic dancing": "Cock worship", "Exhibitionism": "Cock worship", "Eye contact restrictions": "Cock worship", "Face slapping": "Face play", "Fisting": "Face play", "Flogging": "Face play", "Following orders": "Face play", "Food play": "Face play", "Foot worship": "Foot worship", "Gags (cloth/tape)": "Foot worship", "Genital sex": "Foot worship", "Hair pulling": "Foot worship", "Hairbrush spankings": "Foot worship", "Hand jobs (giving)": "Foot worship", "Hand jobs (receiving)": "Foot worship", "Head (giving)": "Foot worship", "Head (receiving)": "Foot worship", "High heels": "Foot worship", "Hot waxing": "Hot waxing", "Ice cubes": "Hot waxing", "Kneeling": "Hot waxing", "Leather clothing": "Hot waxing", "Leather restraints": "Hot waxing", "Lingerie (wearing)": "Hot waxing", "Manacles & Irons": "Hot waxing", "Manicures (giving)": "Hot waxing", "Manicures (receiving)": "Hot waxing", "Marks (giving)": "Hot waxing", "Marks (receiving)": "Hot waxing", "Massage (giving)": "Hot waxing", "Massage (receiving)": "Hot waxing", "Modeling for erotic photos": "Hot waxing", "Nipple play": "Nipple play", "Oral/anal play (rimming)": "Nipple play", "Orgasm denial": "Nipple play", "Outdoor sex": "Nipple play", "Over-the-knee spanking": "Nipple play", "Pain (mild to severe)": "Nipple play", "Phone sex": "Nipple play", "Pinching": "Nipple play", "Play kidnapping": "Nipple play", "Punishment scene": "Nipple play", "Pussy/cock whipping/spanking": "Nipple play", "Riding crops": "Nipple play", "Rubber/latex clothing": "Nipple play", "Saran wrapping": "Nipple play", "Scenes (prison, religious, etc.)": "Scenes", "Scratching (giving)": "Scenes", "Scratching (receiving)": "Scenes", "Serving as a maid/butler": "Scenes", "Shaving": "Scenes", "Shoe/boot worship": "Scenes", "Skinny-dipping": "Scenes", "Slutty clothing": "Scenes", "Spanking": "Spanking", "Spreader bars": "Spanking", "Standing in corner": "Spanking", "Stocks": "Spanking", "Strap-on dildos": "Spanking", "Swallowing semen": "Fluids", "Swapping (with one other couple)": "Fluids", "Swinging (multiple couples)": "Group play", "Tattooing": "Tattooing", "Teasing": "Teasing", "TENS Unit": "Teasing", "Thumbcuffs (metal)": "Restraints", "Tickling": "Restraints", "Triple penetration": "Restraints", "Uniforms": "Uniforms", "Vibrator on genitals": "Uniforms", "Video (recordings of you)": "Uniforms", "Video (watching others)": "Watching", "Violet wand": "Watching", "Voyeurism (watching others)": "Voyeurism", "Wearing symbolic jewelry": "Symbols", "Whips": "Whips", "Wooden paddles": "Paddles", "Wrestling": "Wrestling" }, rx = [ [ /^69$/, "t0317" ], [ /age play|treated like a child/, "t0123" ], [ /anal sex/, "t0297" ], [ /analingus|rimming/, "t0294" ], [ /ball stretching|genital torture|pain/, "t0097" ], [ /being filmed|photographed/, "t0267" ], [ /being watched/, "t0266" ], [ /biting|scratching/, "t0354" ], [ /blindfold|sensory deprivation/, "t0103" ], [ /blood play|scat|sploshing|menstruation/, "cat-fluids-messy-play" ], [ /bondage/, "cat-bondage-restriction" ], [ /bootblack|service/, "t0359" ], [ /bratting|punishment/, "t0005" ], [ /breath play/, "t0097" ], [ /butt plug/, "t0193" ], [ /cages|confinement|suspension/, "t0040" ], [ /caning/, "t0067" ], [ /chastity/, "t0328" ], [ /worship/, "t0237" ], [ /cockrings|sex toys|strap-ons/, "t0306" ], [ /collars/, "t0003" ], [ /consensual non-consent/, "t0134" ], [ /costumes|cross dressing|gender play/, "t0178" ], [ /cuckold/, "t0281" ], [ /cuddling|kissing|massage/, "t0397" ], [ /tantra|breathwork|energy play/, "t0110" ], [ /cunnilingus|fellatio/, "t0291" ], [ /degradation/, "t0239" ], [ /dirty talk|moans|sexting/, "t0263" ], [ /double penetration|triple penetration|vaginal penetration|fingering|frottage/, "t0306" ], [ /e-stim/, "t0101" ], [ /edge play/, "t0334" ], [ /edging|teasing/, "t0329" ], [ /ejaculate|swallowing/, "t0315" ], [ /enemas|piss play/, "t0338" ], [ /eye contact/, "t0258" ], [ /face fucking/, "t0292" ], [ /facesitting/, "t0293" ], [ /fisting/, "t0310" ], [ /flogging/, "t0062" ], [ /food play/, "cat-fluids-messy-play" ], [ /foot play/, "t0213" ], [ /furries/, "t0383" ], [ /g-spot/, "t0304" ], [ /gags/, "t0035" ], [ /group sex|sex parties|strip clubs/, "t0279" ], [ /hair pulling/, "t0093" ], [ /hoods/, "t0191" ], [ /humiliation play/, "t0240" ], [ /humiliation/, "subcategory-psychological-dynamics-humiliation" ], [ /incest roleplay|kidnapping|role play/, "cat-roleplay-identity" ], [ /kicking|punching|slapping|temporary marks/, "t0096" ], [ /knife play/, "t0245" ], [ /leather/, "t0153" ], [ /lingerie/, "t0181" ], [ /medical play/, "t0129" ], [ /masturbation/, "t0268" ], [ /nipple clamps/, "t0070" ], [ /nipple/, "t0220" ], [ /objectification/, "t0243" ], [ /orgasm control/, "t0326" ], [ /orgasm denial/, "t0327" ], [ /paddles/, "t0069" ], [ /pegging/, "t0301" ], [ /piercing/, "t0074" ], [ /phone sex|porn/, "t0268" ], [ /prostate/, "t0299" ], [ /race play/, "t0127" ], [ /riding crops?/, "t0068" ], [ /whips?/, "t0064" ], [ /rubber|latex/, "t0152" ], [ /shaving/, "t0362" ], [ /smoking/, "t0119" ], [ /spanking/, "t0056" ], [ /spreader/, "t0026" ], [ /sex in public/, "t0269" ], [ /sex magic|sacred sexuality|ritual kink|spiritual play/, "t0367" ], [ /threesome/, "t0278" ], [ /tickling/, "t0100" ], [ /tit-fucking/, "t0220" ], [ /tribadism/, "t0306" ], [ /watching others/, "t0266" ], [ /wax/, "t0098" ], [ /wrestling/, "t0353" ], [ /beating/, "t0096" ], [ /bitten/, "t0354" ], [ /serviced/, "t0359" ], [ /bruises/, "t0096" ], [ /chains/, "cat-bondage-restriction" ], [ /clothespins/, "t0097" ], [ /corsets/, "t0181" ], [ /cock rings?/, "t0306" ], [ /thumbcuffs/, "cat-bondage-restriction" ], [ /cuffs/, "cat-bondage-restriction" ], [ /dildos/, "t0306" ], [ /erotic dancing/, "t0279" ], [ /exhibitionism/, "t0266" ], [ /hairbrush/, "t0096" ], [ /hand jobs/, "t0268" ], [ /\bhead\b/, "t0291" ], [ /high heels/, "t0213" ], [ /ice cubes|ice play/, "t0098" ], [ /kneeling/, "t0359" ], [ /manacles|irons/, "cat-bondage-restriction" ], [ /manicures|pedicures/, "t0359" ], [ /marks/, "t0096" ], [ /erotic photos|modeling/, "t0267" ], [ /outdoor sex/, "t0269" ], [ /pinching/, "t0097" ], [ /saran|mummification/, "t0040" ], [ /scenes/, "cat-roleplay-identity" ], [ /maid|butler/, "t0359" ], [ /skinny/, "t0266" ], [ /slutty/, "t0181" ], [ /corner/, "t0005" ], [ /stocks/, "cat-bondage-restriction" ], [ /swapping|swinging/, "t0279" ], [ /tattoo/, "t0074" ], [ /tens\b/, "t0101" ], [ /uniforms/, "t0178" ], [ /vibrator/, "t0306" ], [ /recordings/, "t0267" ], [ /violet/, "t0101" ], [ /jewelry/, "t0003" ] ];
        function ox(e) {
            const t = function(e) {
                const t = ni(e), n = ck(t);
                if (gk[n]) return gk[n];
                const i = ck(t.replace(/\([^)]*\)/g, " "));
                return gk[i] || null;
            }(e);
            if (t) return t;
            const n = ck(e), i = rx.find(e => e[0].test(n));
            return i ? {
                id: i[1],
                uncertain: !0
            } : null;
        }
        function sx(e, t, n, i) {
            Ke.has(t) && (e[t] || (e[t] = {
                give: [],
                receive: []
            }), e[t][n].push(Math.max(-100, Math.min(100, i))));
        }
        function lx(e, t) {
            const n = {};
            return Object.entries(e).forEach(([e, t]) => {
                const i = {};
                [ "give", "receive" ].forEach(e => {
                    t[e].length && (i[e] = Math.round(t[e].reduce((e, t) => e + t, 0) / t[e].length));
                }), Object.keys(i).length && (n[e] = i);
            }), Object.assign({
                ratings: n,
                annotations: {}
            }, t);
        }
        function cx(e) {
            const t = ni(String(e || "").replace(/^[-*•·\d.)\s]+/, "").replace(/\s+(?:fetish|kink)$/i, "").trim()), n = ck(t);
            if (fk[n]) return fk[n];
            const i = ck(t.replace(/\([^)]*\)/g, " "));
            if (fk[i]) return fk[i];
            const o = [ i.replace(/\s+/g, ""), i.endsWith("es") ? i.slice(0, -2) : i.endsWith("s") ? i.slice(0, -1) : i + "s" ];
            for (const e of o) if (e && e !== i && fk[e]) return fk[e];
            const a = bk.find(e => e.pattern.test(i));
            if (a) return {
                id: a.id,
                direction: a.direction || "both",
                uncertain: !0,
                specific: !0
            };
            const r = rx.find(e => e[0].test(i));
            return r ? {
                id: r[1],
                direction: "both",
                uncertain: !0
            } : null;
        }
        // Build 2026-10-18_1624 — read-only data feed for the FetLife
        // mapping viewer (shell dialog #fetlifeMapDialog, opened from the
        // FetLife load dialog or with Ctrl+Shift+M). rows() returns the
        // full fk table with each target resolved to its catalog label
        // and Category › Subcategory › Topic path; lookup(term) runs the
        // exact importer resolution (cx + pk), so the viewer's chooser
        // shows and highlights what an import would actually do with a
        // typed FetLife name — including broad (category/subcategory)
        // targets and pattern-only matches, which have no table row.
        const flm = {
            rowsCache: null,
            nodeInfo: function(id) {
                if (!id) return {
                    label: "",
                    path: "",
                    kind: ""
                };
                if (isCatId(id)) {
                    const l = mx(id);
                    return {
                        label: l,
                        path: l,
                        kind: "Category"
                    };
                }
                const n = Xn(id);
                if (!n) {
                    const l = mx(id);
                    return {
                        label: l,
                        path: l,
                        kind: "Topic"
                    };
                }
                if ("Subcategory" === n.kind) return {
                    label: n.label,
                    path: n.branch + " › " + n.label,
                    kind: "Subcategory"
                };
                const parts = [ n.branch ];
                if (n.parentId) {
                    const p = Xn(n.parentId);
                    p && parts.push(p.label);
                }
                parts.push(n.label);
                return {
                    label: n.label,
                    path: parts.join(" › "),
                    kind: "Topic"
                };
            },
            rows: function() {
                if (flm.rowsCache) return flm.rowsCache;
                const out = Object.keys(fk).map(k => {
                    const m = fk[k], info = flm.nodeInfo(m.id);
                    return {
                        key: k,
                        name: fln[k] || k,
                        id: m.id,
                        label: info.label,
                        path: info.path,
                        kind: info.kind,
                        direction: m.direction || "both",
                        uncertain: !!m.uncertain
                    };
                });
                out.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
                return flm.rowsCache = out, out;
            },
            lookup: function(term) {
                const M = cx(term);
                if (!M) return null;
                let key = null;
                for (const k of Object.keys(fk)) if (fk[k] === M) {
                    key = k;
                    break;
                }
                const I = pk(M, term, {});
                if (!I) {
                    const info = flm.nodeInfo(M.id);
                    return {
                        key: key,
                        pattern: !key,
                        id: M.id,
                        label: info.label,
                        path: info.path,
                        kind: info.kind,
                        child: null,
                        direction: M.direction || "both",
                        uncertain: !!M.uncertain,
                        broad: !0
                    };
                }
                const info = flm.nodeInfo(I.id);
                return {
                    key: key,
                    pattern: !key,
                    id: I.id,
                    label: I.child ? hk(I) : info.label,
                    path: info.path,
                    kind: info.kind,
                    child: I.child ? I.child.label : null,
                    direction: M.direction || "both",
                    uncertain: !!M.uncertain,
                    broad: !1
                };
            }
        };
        // Build 2026-10-18_1658 — FetLife mapping EDITOR support. The
        // shell dialog (#fetlifeMapDialog) is now a full editor, not a
        // read-only viewer: targets() enumerates every valid target
        // (all 18 categories, their subcategories, and every topic) for
        // the editor's target picker; setMapping()/removeMapping()
        // rewrite the live fk table (and the matching gk entry, so
        // saved-page imports agree) for THIS session, so a FetLife
        // import run after editing uses the edited mappings; the first
        // edit snapshots the shipped tables and editedRows() diffs
        // against that snapshot (powering the edited count, the edited
        // badges, the downloadable edits file, and Reset). Nothing is
        // persisted: a reload restores the shipped table.
        flm.targetsCache = null;
        flm.targets = function() {
            if (flm.targetsCache) return flm.targetsCache;
            const out = [], seen = {};
            try {
                h.forEach(cat => {
                    const storedCatId = catId(cat.name);
                    if (!seen[storedCatId]) { seen[storedCatId] = 1; out.push({ id: storedCatId, label: cat.name, path: cat.name, kind: "Category" }); }
                    (cat.subcategories || []).forEach(sub => {
                        const sid = Un(cat.name, sub.name);
                        if (!seen[sid]) { seen[sid] = 1; out.push({ id: sid, label: sub.name, path: cat.name + " › " + sub.name, kind: "Subcategory" }); }
                    });
                    (cat.topics || []).forEach(tn => {
                        let tid = null;
                        try { tid = Wn(tn); } catch (e) { tid = null; }
                        if (!tid || seen[tid]) return;
                        seen[tid] = 1;
                        const info = flm.nodeInfo(tid);
                        out.push({ id: tid, label: info.label || tn, path: info.path || (cat.name + " › " + tn), kind: "Topic" });
                    });
                });
            } catch (e) { __sxErrLog("app", e); }
            const order = { Category: 0, Subcategory: 1, Topic: 2 };
            out.sort((a, b) => (order[a.kind] - order[b.kind]) || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
            return flm.targetsCache = out, out;
        };
        flm.origFk = null;
        flm.origGk = null;
        flm.origFln = null;
        flm.snap = function() {
            if (flm.origFk) return;
            flm.origFk = {}; Object.keys(fk).forEach(k => { flm.origFk[k] = Object.assign({}, fk[k]); });
            flm.origGk = {}; Object.keys(gk).forEach(k => { flm.origGk[k] = Object.assign({}, gk[k]); });
            flm.origFln = Object.assign({}, fln);
        };
        flm.setMapping = function(name, id, direction) {
            const key = ck(String(name || "").trim());
            if (!key || !id) return null;
            flm.snap();
            fk[key] = { id: id, direction: direction || "both", uncertain: !1, specific: !0 };
            if (gk[key]) gk[key] = { id: id, uncertain: !1 };
            fln[key] = fln[key] || String(name).trim();
            flm.rowsCache = null;
            return key;
        };
        flm.removeMapping = function(name) {
            const key = ck(String(name || "").trim());
            if (!key || !fk[key]) return;
            flm.snap();
            delete fk[key];
            if (gk[key]) delete gk[key];
            flm.rowsCache = null;
        };
        flm.editedRows = function() {
            if (!flm.origFk) return [];
            const out = [], keys = {};
            Object.keys(flm.origFk).forEach(k => { keys[k] = 1; });
            Object.keys(fk).forEach(k => { keys[k] = 1; });
            Object.keys(keys).forEach(k => {
                const before = flm.origFk[k] || null, now = fk[k] || null;
                const changed = (!before !== !now) || (before && now && (before.id !== now.id || (before.direction || "both") !== (now.direction || "both")));
                if (!changed) return;
                const src = now || before, info = flm.nodeInfo(src.id);
                out.push({
                    key: k,
                    name: fln[k] || (flm.origFln && flm.origFln[k]) || k,
                    before: before ? { id: before.id, direction: before.direction || "both" } : null,
                    now: now ? { id: now.id, direction: now.direction || "both", label: info.label, path: info.path, kind: info.kind } : null
                });
            });
            out.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
            return out;
        };
        flm.resetMappings = function() {
            if (!flm.origFk) return;
            Object.keys(fk).forEach(k => { delete fk[k]; });
            Object.keys(flm.origFk).forEach(k => { fk[k] = Object.assign({}, flm.origFk[k]); });
            Object.keys(gk).forEach(k => { delete gk[k]; });
            Object.keys(flm.origGk).forEach(k => { gk[k] = Object.assign({}, flm.origGk[k]); });
            Object.keys(fln).forEach(k => { delete fln[k]; });
            Object.keys(flm.origFln).forEach(k => { fln[k] = flm.origFln[k]; });
            flm.rowsCache = null;
        };
        window.__fetlifeMap = flm;
        function dx(e, t) {
            if (/base64/i.test(t || "")) try {
                const t = atob(e.replace(/\s+/g, "")), n = Uint8Array.from(t, e => e.charCodeAt(0));
                return new TextDecoder("utf-8").decode(n);
            } catch (t) {
                return e;
            }
            if (/quoted-printable/i.test(t || "")) {
                const t = e.replace(/=\r?\n/g, ""), n = [];
                for (let e = 0; e < t.length; e++) if ("=" === t[e] && /^[0-9a-f]{2}$/i.test(t.slice(e + 1, e + 3))) n.push(parseInt(t.slice(e + 1, e + 3), 16)), 
                e += 2; else {
                    const i = t.charCodeAt(e);
                    i < 256 ? n.push(i) : n.push(...(new TextEncoder).encode(t[e]));
                }
                try {
                    return new TextDecoder("utf-8").decode(Uint8Array.from(n));
                } catch (e) {
                    return t;
                }
            }
            return e;
        }
        function ux(e) {
            if (!/^mime-version:/im.test(e) || !/^content-type:\s*multipart\/related/im.test(e)) return null;
            const t = ((e.match(/^([\s\S]*?)\r?\n\r?\n/) || [])[1] || "").match(/boundary\s*=\s*(?:"([^"]+)"|([^;\r ]+))/i), n = t && (t[1] || t[2] || "").trim();
            if (!n) return null;
            const i = [];
            return e.split("--" + n).forEach(e => {
                const t = e.match(/^\s*([\s\S]*?)\r?\n\r?\n([\s\S]*)$/);
                if (!t) return;
                const n = t[1], a = (n.match(/^content-type:\s*([^;\r ]+)/im) || [])[1] || "", r = (n.match(/^content-transfer-encoding:\s*([^\r ]+)/im) || [])[1] || "", o = (n.match(/^content-location:\s*([^\r ]+)/im) || [])[1] || "";
                /^text\/html/i.test(a) && i.push({
                    html: dx(t[2].replace(/\r?\n--$/, ""), r),
                    location: o
                });
            }), i.length ? (i.find(e => /fetish/i.test(e.location)) || i[0]).html : null;
        }
        function px(e) {
            const t = Boolean(ux(e)) || /<(?:html|body|main|section|article|div|li|tr|p|h[1-6])\b/i.test(e), n = function(e) {
                const t = ux(e) || e;
                if (!/<(?:html|body|main|section|article|div|li|tr|p|h[1-6])\b/i.test(t)) return t;
                const n = (new DOMParser).parseFromString(t, "text/html");
                n.querySelectorAll("script,style,noscript,svg,nav,header,footer,form").forEach(e => e.remove()), 
                n.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(e => {
                    const t = String(e.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().match(/^(?:my\s+)?(fetishes?|kinks?)\b/i);
                    t && (e.textContent = /^kink/i.test(t[1]) ? "Kinks" : "Fetishes");
                }), n.querySelectorAll("a[href]").forEach(e => {
                    const t = (e.getAttribute("href") || "").trim();
                    "fetishes" === ck(e.textContent || "") && /^(?:https?:\/\/(?:www\.)?fetlife\.com)?\/fetishes\/?(?:[?#].*)?$/i.test(t) && e.remove();
                });
                const i = n.body.innerHTML.replace(/<h([1-6])\b[^>]*>/gi, "\nFETLIFE_SECTION_HEADING_$1 ").replace(/<\/h[1-6]>/gi, "\n").replace(/<br\b[^>]*>/gi, "\n").replace(/<a\b[^>]*>/gi, "").replace(/<\/a>/gi, "\n").replace(/<\/(?:td|th)>/gi, "\t").replace(/<\/(?:li|tr|p|div|section|article|ul|ol)>/gi, "\n");
                return (new DOMParser).parseFromString(i, "text/html").body.textContent || "";
            }(e).replace(/[^\S\n]*,[^\S\n]*FETLIFE_SECTION_HEADING_([1-6])[^\S\n]*,[^\S\n]*/gi, " FETLIFE_SECTION_HEADING_$1 "), i = n.split(/\r\n|[\r\n]/).map(e => e.replace(/\u00a0/g, " ").replace(/[^\S\n]+/g, " ").trim()).filter(Boolean).map(e => {
                const t = e.match(/^FETLIFE_SECTION_HEADING_([1-6])\s+([\s\S]+)$/i);
                return {
                    text: (t ? t[2] : e).replace(/FETLIFE_SECTION_HEADING_[1-6]/gi, " ").replace(/\s+/g, " ").replace(/^\s*,\s*|\s*,\s*$/g, "").trim(),
                    level: t ? Number(t[1]) : null
                };
            }).filter(e => e.text), a = new Set([ "edit", "into", "interests", "favorites", "favorite", "curious about", "curious", "neutral", "soft limits", "soft limit", "hard limits", "hard limit", "not into", "not interested", "fantasy only", "already tried", "giving", "as a top", "top", "receiving", "as a bottom", "bottom", "both", "switch", "giving and receiving", "giving receiving", "everything to do with it", "watching", "wearing", "watching others wear", "watching others wearing" ]), r = new Set([ "about", "about me", "activity", "activity feed", "recent activity", "pictures", "photos", "videos", "events", "events attended", "writings", "journal entries", "posts", "relationships", "relationship status", "roles", "identity", "gender", "orientation", "pronouns", "groups", "places", "questions", "friends", "followers", "following", "looking for", "kinksters", "lists", "memberships", "wall", "status" ]), o = e => {
                const t = ck(e.text).replace(/\s+\d+$/, "");
                return null !== e.level && !a.has(t) || r.has(t) || /^(?:latest\s+)?(?:pictures?|photos?|videos?|writings?)(?:\s*\(\d+\))?\s*:?$/.test(t);
            }, s = /^(?:my\s+)?(?:fetishes?|kinks?)(?:\s*\([^\r )]*\))?\s*:?$/i, l = [];
            if (i.forEach((e, t) => {
                s.test(e.text) && l.push(t);
            }), !l.length) {
                const e = i.findIndex(o), n = i.slice(0, e < 0 ? i.length : e);
                return {
                    text: t ? "" : n.map(e => e.text).join("\n"),
                    sectionFound: !1,
                    missingSection: t
                };
            }
            let c = l[0], d = -1;
            l.forEach(e => {
                const t = i.slice(e + 1, e + 121), n = t.map(e => ck(e.text).replace(/\s+\d+$/, "")), a = n.findIndex(e => [ "into", "interests", "favorites", "favorite", "curious about", "curious", "neutral", "soft limits", "soft limit", "hard limits", "hard limit", "not into", "not interested", "fantasy only", "already tried" ].includes(e)), r = n.slice(0, 4).includes("edit"), o = t.reduce((e, t) => e + (cx(t.text) ? 1 : 0), 0) + (a >= 0 && a < 16 ? 100 - a : 0) + (r ? 20 : 0);
                o > d && (c = e, d = o);
            });
            let u = i.length;
            for (let e = c + 1; e < i.length; e++) if (o(i[e])) {
                u = e;
                break;
            }
            return {
                text: i.slice(c + 1, u).map(e => e.text).join("\n"),
                sectionFound: !0,
                missingSection: !1
            };
        }
        function hx(e) {
            const t = [];
            let n = "", i = !1, o = 0;
            for (let a = 0; a < e.length; a++) {
                const r = e[a];
                '"' === r ? i && '"' === e[a + 1] ? (n += '"', a++) : i = !i : "(" === r && !i ? (o++, n += r) : ")" === r && !i && o > 0 ? (o--, n += r) : "," !== r || i || o > 0 ? n += r : (t.push(n.trim()), 
                n = "");
            }
            return t.push(n.trim()), t.filter(Boolean);
        }
        function gx(e) {
            const t = [];
            return e.split(/\r\n|[\r\n]/).forEach(e => {
                const n = e.trim();
                if (!n) return;
                const i = n.match(/^(Into|Curious about|Curious|Soft limits?|Hard limits?|Favorites?|Not into|Not interested|Neutral|Fantasy only|Already tried)\s*:\s*(.+)$/i);
                if (i) return t.push(i[1]), void hx(i[2]).forEach(e => t.push(e));
                const a = hx(n);
                if (a.length < 2) return void t.push(n);
                a.filter(e => cx(e.replace(/^(?:the|a|an)\s+/i, ""))).length >= 2 ? a.forEach(e => t.push(e)) : t.push(n);
            }), t;
        }
        function mx(e) {
            const t = qn[e];
            if (t && t.label) return t.label;
            for (const t of h) {
                if (catId(t.name) === e) return t.name;
                const n = t.topics.find(t => Wn(t) === e);
                if (n) return n;
            }
            return e;
        }
        // ============================================================
        // FetLife importer — FetLifeImporter pipeline module
        // (Refactor Step 2, Build 2026-10-18_0722.)
        //
        // The FetLife branch of yx.parse used to be one large inline
        // function. It is now four named stages plus a thin
        // orchestrator, with zero behavior change: same section and
        // direction tables, same qualifier edge cases, same warnings,
        // same category-hit (broadHits) tracking, same return shape.
        //
        //   parse(rawHtml)  — HTML extraction via px()/gx(), section
        //     splitting, subsection-scoped "View all" detection.
        //     Returns raw item records {section, dirDefault, rawText,
        //     lineNo} plus page metadata. (Only stage touching px/gx.)
        //   normalize(item) — pure, no DOM: splits the raw line into
        //     name + qualifier text, strips a trailing parenthetical
        //     qualifier off the name and merges it into the qualifier
        //     string (qualifier text is ck()-normalized: lowercased /
        //     trimmed; "as a top" / "as a bottom" resolve through the
        //     direction table in parse/rate). Returns {baseTerm,
        //     qualifier, rawName}.
        //   match(baseTerm, ctx) — pure lookup, no DOM: alias-map /
        //     pattern-fallback match via cx() (Step 1 alias structure
        //     untouched), resolution via pk(), category/subcategory
        //     hits recorded into ctx.broadHits. Returns {status,
        //     match, resolved} with status "matched" | "broad" |
        //     "unmapped".
        //   rate(normalized, matchResult, item, acc) — resolves the
        //     effective section (qualifier text first, then the
        //     item's section, default Into) and direction (qualifier,
        //     then the section's pending direction, then the match's
        //     own direction), then writes ratings / annotations /
        //     notes / flags into the accumulators.
        //   run(rawText) — orchestrator: parse → normalize → match →
        //     rate over the item list and assembles the exact result
        //     object the converter has always returned.
        //
        // Stage logging: each stage appends {stage, in, out,
        // examples} to FetLifeImporter.stageLog (reset per run);
        // set FetLifeImporter.DEBUG = true to also mirror entries to
        // console.debug.
        // ============================================================
        const FetLifeImporter = (() => {
            const SECTION_KINDS = {
                        into: {
                            kind: "into",
                            value: 100
                        },
                        interests: {
                            kind: "into",
                            value: 100
                        },
                        favorites: {
                            kind: "favorite",
                            value: null,
                            mark: "favorite"
                        },
                        favorite: {
                            kind: "favorite",
                            value: null,
                            mark: "favorite"
                        },
                        "curious about": {
                            kind: "curious",
                            value: 33
                        },
                        curious: {
                            kind: "curious",
                            value: 33
                        },
                        neutral: {
                            kind: "neutral",
                            value: null,
                            neutral: !0
                        },
                        "soft limits": {
                            kind: "soft",
                            value: null,
                            mark: "notinterested"
                        },
                        "soft limit": {
                            kind: "soft",
                            value: null,
                            mark: "notinterested"
                        },
                        "hard limits": {
                            kind: "hard",
                            value: null,
                            mark: "limit"
                        },
                        "hard limit": {
                            kind: "hard",
                            value: null,
                            mark: "limit"
                        },
                        "not into": {
                            kind: "not",
                            value: null,
                            mark: "notinterested"
                        },
                        "not interested": {
                            kind: "not",
                            value: null,
                            mark: "notinterested"
                        },
                        "fantasy only": {
                            kind: "fantasy",
                            value: null,
                            fantasy: !0
                        },
                        "already tried": {
                            kind: "tried",
                            value: null,
                            tried: !0
                        }
                    };
            const DIRECTION_KINDS = {
                        giving: {
                            direction: "give",
                            label: "giving"
                        },
                        "as a top": {
                            direction: "give",
                            label: "giving"
                        },
                        top: {
                            direction: "give",
                            label: "giving"
                        },
                        receiving: {
                            direction: "receive",
                            label: "receiving"
                        },
                        "as a bottom": {
                            direction: "receive",
                            label: "receiving"
                        },
                        bottom: {
                            direction: "receive",
                            label: "receiving"
                        },
                        both: {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        switch: {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        "giving and receiving": {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        "giving receiving": {
                            direction: "both",
                            label: "giving and receiving"
                        },
                        "everything to do with it": {
                            direction: "both",
                            label: "everything to do with it",
                            everything: !0
                        },
                        watching: {
                            direction: null,
                            label: "watching"
                        },
                        wearing: {
                            direction: null,
                            label: "wearing"
                        },
                        "watching others wear": {
                            direction: null,
                            label: "watching others wear"
                        },
                        "watching others wearing": {
                            direction: null,
                            label: "watching others wear"
                        }
                    };
            const SKIP_TERMS = new Set([ "fetishes", "kinks", "fetish list", "kink list", "edit", "about", "activity", "interest", "role", "show more", "show less" ]);
            const PAGE_SECTIONS = [ "fetishes", "kinks", "about", "about me", "activity", "activity feed", "recent activity", "pictures", "photos", "videos", "events", "events attended", "writings", "journal entries", "posts", "relationships", "relationship status", "roles", "identity", "gender", "orientation", "pronouns", "groups", "places", "questions", "friends", "followers", "following", "looking for", "kinksters", "lists", "memberships", "wall", "status" ];
            const sectionFromQualifier = e => /\bhard limits?\b/.test(e) ? SECTION_KINDS["hard limit"] : /\bsoft limits?\b/.test(e) ? SECTION_KINDS["soft limit"] : /\b(?:not interested|not into|no)\b/.test(e) ? SECTION_KINDS["not into"] : /\bfantasy only\b/.test(e) ? SECTION_KINDS["fantasy only"] : /\balready tried\b/.test(e) ? SECTION_KINDS["already tried"] : /\bneutral\b/.test(e) ? SECTION_KINDS.neutral : /\b(?:curious about|curious|maybe)\b/.test(e) ? SECTION_KINDS.curious : /\bfavorites?\b/.test(e) ? SECTION_KINDS.favorite : /\b(?:into|yes)\b/.test(e) ? SECTION_KINDS.into : null;
            const directionFromQualifier = e => /\beverything to do with it\b/.test(e) ? DIRECTION_KINDS["everything to do with it"] : /\bwatching others wear(?:ing)?\b/.test(e) ? DIRECTION_KINDS["watching others wear"] : /\bwatching\b/.test(e) ? DIRECTION_KINDS.watching : /\bwearing\b/.test(e) ? DIRECTION_KINDS.wearing : /\b(?:both|switch|giving and receiving|giving receiving)\b/.test(e) ? DIRECTION_KINDS.both : /\b(?:giving|giver|top|topping|dominant|dom)\b/.test(e) ? DIRECTION_KINDS.giving : /\b(?:receiving|receiver|bottom|bottoming|submissive|sub)\b/.test(e) ? DIRECTION_KINDS.receiving : null;
            // Build 2026-10-18_1549 — watching / wearing qualifiers annotate
            // the topic (they never force a give/receive rating). The note
            // is worded with the topic's own specialized role labels where
            // the topic has them (Ge() labels — “admires” / “wears” /
            // “watches” and the like), falling back to the FetLife
            // qualifier's own words when it does not.
            const sxStance = (id, F) => {
                if (!F || null !== F.direction) return F ? F.label : "";
                const g = Ge(id);
                if (g.single) return F.label;
                if ("wearing" === F.label) return g.labels[1] && "receive" !== g.labels[1] ? g.labels[1] : F.label;
                if ("watching" === F.label || "watching others wear" === F.label) return g.labels[0] && "give" !== g.labels[0] ? g.labels[0] : F.label;
                return F.label;
            };
            const api = {
                DEBUG: !1,
                stageLog: []
            };
            function slog(stage, info) {
                api.stageLog.push(Object.assign({
                    stage: stage
                }, info)), api.DEBUG && console.debug(`[FetLifeImporter] ${stage}`, info);
            }
            function parse(rawHtml) {
                const extracted = px(rawHtml), lines = gx(extracted.text), items = [], viewAllSections = [];
                let section = null, sectionName = null, dirDefault = null;
                lines.forEach((e, t) => {
                    let s = e.replace(/ /g, " ").replace(/^[\s•·*]+|[\s•·*]+$/g, "").trim();
                    if (!s || /^[,;|]+$/.test(s)) return;
                    const f = ck(s), y = f.replace(/\s+\d+$/, "");
                    if (Object.prototype.hasOwnProperty.call(SECTION_KINDS, y)) return section = SECTION_KINDS[y], sectionName = y, void (dirDefault = null);
                    if (Object.prototype.hasOwnProperty.call(DIRECTION_KINDS, y)) return void (dirDefault = DIRECTION_KINDS[y]);
                    if (PAGE_SECTIONS.includes(y) || /^(?:latest\s+)?(?:pictures?|photos?|videos?|writings?)(?:\s*\(\d+\))?\s*:?$/.test(y)) return sectionName = null, void (dirDefault = null);
                    if (/^(?:view|show)\s+all(?:\s+fetishes?)?$/i.test(s) || /^view\s+all\b/i.test(s)) return void (sectionName && viewAllSections.push(sectionName));
                    if (SKIP_TERMS.has(f) || /^https?:\/\//i.test(s) || /^@?[a-z0-9_.-]+\s+on\s+fetlife$/i.test(s)) return;
                    items.push({
                        section: section,
                        dirDefault: dirDefault,
                        rawText: s,
                        lineNo: t + 1
                    });
                });
                return slog("parse", {
                    in: lines.length,
                    out: items.length,
                    examples: items.slice(0, 3).map(e => e.rawText)
                }), {
                    items: items,
                    viewAllSections: viewAllSections,
                    missingSection: extracted.missingSection,
                    sectionFound: extracted.sectionFound
                };
            }
            function normalize(item) {
                const s = item.rawText;
                let E = s.split(/\t+|\s*\|\s*|\s+[—–]\s+(?!\()/).map(e => e.trim()).filter(Boolean);
                if (1 === E.length) {
                    const e = s.match(/^(.+?):\s*(.+)$/);
                    e && /\b(?:into|curious|favorite|neutral|not interested|fantasy only|already tried|limit|giving|receiving|both|switch|top|bottom|watching|wearing|everything|yes|no|maybe)\b/i.test(e[2]) && (E = [ e[1], e[2] ]);
                }
                if (1 === E.length) {
                    const e = s.match(/\s+(?=(?:into|curious about|favorite|neutral|soft limits?|hard limits?|not interested|not into|fantasy only|already tried|everything to do with it|watching others wear(?:ing)?|watching|wearing|giving(?:\s*(?:and|&)\s*receiving)?|receiving|both|switch|top|bottom)\b)/i);
                    e && (E = [ s.slice(0, e.index), s.slice(e.index).trim() ]);
                }
                let A = (E.shift() || "").replace(/^[-*•·\d.)\s]+/, "").replace(/^(?:the|a|an)\s+/i, "").trim();
                let C = ck(E.join(" "));
                if (!A) return {
                    baseTerm: "",
                    qualifier: C,
                    rawName: A
                };
                const A0 = A, Aq = A.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
                if (Aq && Aq[1].trim()) {
                    const q = ck(Aq[2]);
                    q && /\b(?:giving|receiving|everything to do with it|watching|wearing|both|switch|top|bottom)\b/.test(q) && (A = Aq[1].trim(), 
                    C = (C ? C + " " : "") + q);
                }
                // Importer rework Part C: a LEADING parenthetical qualifier
                // ("(giving) Spanking", "(receiving) Flogging") carries the
                // same recoverable direction as the trailing form — mine it
                // into the qualifier string instead of dropping it. When the
                // parenthetical holds no direction word, the term is left
                // exactly as written (unrecoverable is stated by the match
                // warnings, never guessed).
                const AqLead = A.match(/^\(([^()]*)\)\s*(.+)$/);
                if (AqLead && AqLead[2].trim()) {
                    const q = ck(AqLead[1]);
                    q && /\b(?:giving|receiving|everything to do with it|watching|wearing|both|switch|top|bottom)\b/.test(q) && (A = AqLead[2].trim(), 
                    C = (C ? C + " " : "") + q);
                }
                return {
                    baseTerm: A,
                    qualifier: C,
                    rawName: A0
                };
            }
            function match(baseTerm, ctx) {
                const M = cx(baseTerm);
                if (!M) return {
                    status: "unmapped",
                    match: null,
                    resolved: null
                };
                const I = pk(M, baseTerm, ctx.children);
                if (!I) {
                    // Build 2026-10-18_1015: broadTerms is presentation-only
                    // tracking for the post-import summary dialog — the set
                    // of distinct FetLife terms that landed on each broad
                    // branch. broadHits recording below is unchanged.
                    if (M && M.id && (isCatId(M.id) || isSubId(M.id))) {
                        const bt = ctx.broadTerms || (ctx.broadTerms = {});
                        (bt[M.id] || (bt[M.id] = new Set)).add(baseTerm), ctx.broadHits.includes(M.id) || ctx.broadHits.push(M.id);
                    }
                    return {
                        status: "broad",
                        match: M,
                        resolved: null
                    };
                }
                if (!I.child && (isSubId(I.id) || isCatId(I.id))) {
                    const bt = ctx.broadTerms || (ctx.broadTerms = {});
                    (bt[I.id] || (bt[I.id] = new Set)).add(baseTerm), ctx.broadHits.includes(I.id) || ctx.broadHits.push(I.id);
                }
                return {
                    status: "matched",
                    match: M,
                    resolved: I
                };
            }
            function rate(normalized, matchResult, item, acc) {
                const A = normalized.baseTerm, C = normalized.qualifier, M = matchResult.match, I = matchResult.resolved, P = I.id, b = (e, n, i) => {
                    !Ke.has(e) && !acc.children[e] || (acc.ratings[e] || (acc.ratings[e] = {}), acc.ratings[e][n] = i);
                }, v = (e, t) => {
                    (Ke.has(e) || acc.children[e]) && t && (acc.notes[e] || (acc.notes[e] = []), acc.notes[e].includes(t) || acc.notes[e].push(t));
                }, L = sectionFromQualifier(C) || item.section || SECTION_KINDS.into, T = directionFromQualifier(C), F = T || item.dirDefault;
                let N = F ? F.direction : M.direction || "both", _ = L.value, D = L.mark || null;
                // Slug-gap fix: when P names no current topic (not a
                // canonical id in Ke, not a registered imported child),
                // every write below is declined or would be stored under
                // a dead key. Drop the hit loudly instead: record it on
                // acc.notApplied, name it in the warnings, and return !1
                // so run() excludes it from the matched / mapped counts
                // and no success line is rendered for it.
                if (!Ke.has(P) && !acc.children[P]) {
                    const droppedList = acc.notApplied || (acc.notApplied = []);
                    droppedList.some(e => e.term === A && e.target === P) || droppedList.push({
                        term: A,
                        target: P
                    }), acc.warnings.push(`Item ${item.lineNo}: “${A}” matched ${P}, which names no current topic, and was not applied.`);
                    return !1;
                }
                // Build 2026-10-18_1549 — “(everything to do with it)” carries
                // its own value by section instead of the section default:
                // 80 (4/5 positive) in Into, 33 (~1/3, deep yellow) in
                // Curious. On a single-slider topic it sets only that one
                // slider (stored under the “give” key, per Ge()); on a
                // dual-slider topic it sets both give and receive.
                const sxEverything = Boolean(F && F.everything), sxSingle = sxEverything && Ge(P).single;
                sxEverything && ("into" === L.kind ? _ = 80 : "curious" === L.kind && (_ = 33)), 
                "into" !== L.kind || "give" !== N && "receive" !== N || F && F.everything || (_ = 85), 
                "hard" === L.kind && (D = "limit", N = "both"), "soft" === L.kind && v(P, "Soft limit on FetLife"), 
                F && null === F.direction && v(P, `${"curious" === L.kind ? "Curious about" : "soft" === L.kind ? "Soft limit" : "hard" === L.kind ? "Hard limit" : "favorite" === L.kind ? "Favorite" : "Into"} on FetLife · ${sxStance(P, F)}`), 
                !Number.isFinite(_) || "give" !== N && "both" !== N || b(P, "give", _), !Number.isFinite(_) || "receive" !== N && "both" !== N || sxSingle || b(P, "receive", _), 
                ("limit" === D || "limit" !== acc.annotations[P] && D) && (acc.annotations[P] = D), L.neutral && (acc.neutralNodes[P] = !0), 
                L.fantasy && (acc.fantasyOnly[P] = !0), L.tried && (acc.alreadyTried[P] = !0), (D || L.neutral || L.fantasy || L.tried) && (acc.discreteNodes[P] = !0);
                const R = F && null === F.direction ? `annotation: ${F.label}` : sxEverything ? sxSingle ? "everything (single slider)" : "give + receive" : "both" === N ? "give + receive" : N, O = "into" === L.kind ? `into ${_}` : "curious" === L.kind ? sxEverything ? "curious 33" : "curious" : "soft" === L.kind ? "Not Interested (soft limit)" : "hard" === L.kind ? "Hard Limit" : "favorite" === L.kind ? "Favorite" : "neutral" === L.kind ? "Neutral" : "fantasy" === L.kind ? "Fantasy Only" : "tried" === L.kind ? "Already Tried" : "Not Interested";
                acc.mappings.push({
                    text: `${A} ⇒ ${sxNodePath(P)} · ${R} · ${O}`,
                    tertiary: !1
                }), I.suggestion && acc.suggestions.push({
                    name: I.suggestion.name,
                    parentId: P,
                    parentPath: sxNodePath(P),
                    section: L.kind,
                    direction: N,
                    value: _
                });
                return !0;
            }
            function run(rawText) {
                api.stageLog.length = 0;
                const acc = {
                    ratings: {},
                    annotations: {},
                    fantasyOnly: {},
                    alreadyTried: {},
                    neutralNodes: {},
                    discreteNodes: {},
                    notes: {},
                    children: {},
                    warnings: [],
                    unmappedFetishes: [],
                    bestFitNotes: [],
                    suggestions: [],
                    mappings: [],
                    notApplied: [],
                    broadHits: [],
                    broadTerms: {}
                };
                let mappedLines = 0, totalLines = 0;
                const parsed = parse(rawText), normExamples = [], matchExamples = [], rateExamples = [];
                let normCount = 0, matchedCount = 0, broadCount = 0, unmappedCount = 0, droppedCount = 0;
                parsed.missingSection && acc.warnings.push("No Fetishes section was found in this saved page, so nothing outside that section was scanned. The section isn't in this file: open the profile on FetLife, scroll to the Fetishes area and expand every subsection, then save the page again as 'Webpage, Single File' (.mhtml) — not 'HTML Only'. Or save the page at fetlife.com/<username>/profile/fetishes instead.");
                for (const item of parsed.items) {
                    const normalized = normalize(item);
                    if (!normalized.baseTerm) continue;
                    totalLines++, normCount++, normExamples.length < 3 && normExamples.push(`${normalized.rawName} → base “${normalized.baseTerm}” · qualifier “${normalized.qualifier}”`);
                    const matchResult = match(normalized.baseTerm, acc);
                    if ("unmapped" === matchResult.status) {
                        unmappedCount++, acc.unmappedFetishes.push({
                            fetish_name: normalized.rawName,
                            list_type: /\b(?:curious about|curious|maybe)\b/.test(normalized.qualifier) || item.section && "curious" === item.section.kind ? "curious" : "into"
                        }), acc.warnings.push(`Item ${item.lineNo}: “${normalized.rawName.slice(0, 70)}” was not recognized or has no matching topic.`);
                        continue;
                    }
                    if ("broad" === matchResult.status) {
                        broadCount++, acc.warnings.push(`Item ${item.lineNo}: “${normalized.rawName}” maps only to a broad branch, so it was skipped; rate its individual topics instead.`);
                        continue;
                    }
                    rate(normalized, matchResult, item, acc) ? (matchedCount++, mappedLines++, matchExamples.length < 3 && matchExamples.push(`${normalized.baseTerm} → ${matchResult.resolved.id}`), rateExamples.length < 3 && rateExamples.push(acc.mappings[acc.mappings.length - 1].text)) : droppedCount++;
                }
                if (slog("normalize", {
                    in: parsed.items.length,
                    out: normCount,
                    examples: normExamples
                }), slog("match", {
                    in: normCount,
                    out: matchedCount,
                    broad: broadCount,
                    unmapped: unmappedCount,
                    dropped: droppedCount,
                    examples: matchExamples
                }), slog("rate", {
                    in: matchedCount,
                    out: mappedLines,
                    examples: rateExamples
                }), parsed.viewAllSections.length) {
                    const e = [ ...new Set(parsed.viewAllSections) ].map(e => e.replace(/\b\w/g, e => e.toUpperCase())).join(" and ");
                    acc.warnings.unshift(`We found “View all” links in your saved page (${e}). Your FetLife profile shows more fetishes than what’s in this file — you’re only importing the truncated visible portion. Go back to FetLife, click all “View all” links in your Fetishes section, then save the page again for a complete import.`);
                }
                const previewNotes = parsed.sectionFound ? [ "Found the Fetishes section and ignored the rest of the saved profile page." ] : [];
                return {
                    ratings: acc.ratings,
                    annotations: acc.annotations,
                    fantasyOnly: acc.fantasyOnly,
                    alreadyTried: acc.alreadyTried,
                    neutralNodes: acc.neutralNodes,
                    discreteNodes: acc.discreteNodes,
                    notes: acc.notes,
                    children: acc.children,
                    mappedLines: mappedLines,
                    totalLines: totalLines,
                    warnings: acc.warnings,
                    unmappedFetishes: acc.unmappedFetishes,
                    bestFit: [ ...new Set(acc.bestFitNotes) ],
                    suggestions: acc.suggestions,
                    mappings: acc.mappings,
                    notApplied: acc.notApplied,
                    categoryHits: acc.broadHits,
                    categoryHitCounts: Object.fromEntries(Object.entries(acc.broadTerms).map(([e, t]) => [ e, t.size ])),
                    // Build 2026-10-18_1624 — the actual FetLife terms behind
                    // each broad-branch count, so the summary dialog's pills
                    // can list term → target instead of a bare number.
                    categoryHitTerms: Object.fromEntries(Object.entries(acc.broadTerms).map(([e, t]) => [ e, [ ...t ] ])),
                    previewNotes: previewNotes
                };
            }
            return api.parse = parse, api.normalize = normalize, api.match = match, api.rate = rate, api.run = run, api;
        })();

        // Build 2026-10-18_1015 — Post-FetLife-import summary dialog
        // (presentation layer only; no import logic lives here). Groups the
        // parse result's broad hits — the same deduped categoryHits list the
        // list view auto-expands from — into a Category → Subcategory tree
        // with the per-branch FetLife-term counts FetLifeImporter.match
        // recorded alongside (categoryHitCounts), and shows the tree in
        // #fetlifeBroadDialog over the list view the Load already opened.
        function showFetLifeBroadSummary(result) {
            const dlg = e.byId("fetlifeBroadDialog"), tree = e.byId("fetlifeBroadTree"), totalEl = e.byId("fetlifeBroadTotal");
            if (!dlg || !tree || !result) return;
            const hits = Array.isArray(result.categoryHits) ? [ ...new Set(result.categoryHits.filter(x => "string" == typeof x && (isCatId(x) || isSubId(x)))) ] : [];
            if (!hits.length) return;
            const counts = result.categoryHitCounts && "object" == typeof result.categoryHitCounts ? result.categoryHitCounts : {}, termLists = result.categoryHitTerms && "object" == typeof result.categoryHitTerms ? result.categoryHitTerms : {}, targetFor = id => {
                if (isCatId(id)) {
                    const c = h.find(c => catId(c.name) === id);
                    return (c ? c.name : id) + " (whole category)";
                }
                const s = zn(id);
                return s ? s.branch + " › " + s.label + " (subcategory)" : id;
            }, linesFor = id => (Array.isArray(termLists[id]) ? termLists[id] : []).map(term => ({
                term: term,
                target: targetFor(id)
            })), countFor = id => Math.max(linesFor(id).length, Math.max(1, Number(counts[id]) || 1)), byCat = new Map;
            hits.forEach(id => {
                if (isCatId(id)) {
                    const cat = h.find(c => catId(c.name) === id);
                    if (!cat) return;
                    const entry = byCat.get(cat.name) || { name: cat.name, direct: 0, directLines: [], subs: [] };
                    entry.direct += countFor(id), entry.directLines.push(...linesFor(id)), byCat.set(cat.name, entry);
                } else {
                    const sub = zn(id);
                    if (!sub) return;
                    const entry = byCat.get(sub.branch) || { name: sub.branch, direct: 0, directLines: [], subs: [] };
                    entry.subs.push({ name: sub.label, count: countFor(id), lines: linesFor(id) }), byCat.set(sub.branch, entry);
                }
            });
            if (!byCat.size) return;
            tree.textContent = "";
            let total = 0;
            // Build 2026-10-18_1624 — the count pill is now a button (when
            // the term list is known): its hover tooltip lists every
            // FetLife term behind the count as “Term → target”, and
            // selecting it expands the same list inline under the row, so
            // a bare “1 term” can never be mistaken for a term that merely
            // passed through the branch on its way somewhere else.
            const mkRow = (label, count, lines, cls) => {
                const li = document.createElement("li");
                li.className = cls;
                const nm = document.createElement("span");
                nm.className = "fetlife-broad-name", nm.textContent = label;
                const badge = document.createElement(lines.length ? "button" : "span");
                badge.className = "fetlife-broad-count", badge.textContent = `${count} term${1 === count ? "" : "s"}`, li.append(nm, badge);
                if (lines.length) {
                    badge.type = "button", badge.title = lines.map(l => `${l.term} → ${l.target}`).join("\n"), 
                    badge.setAttribute("aria-expanded", "false"), badge.setAttribute("aria-label", `${count} FetLife term${1 === count ? "" : "s"}: ${lines.map(l => `${l.term} maps to ${l.target}`).join("; ")}. Activate to show or hide the list.`);
                    const detail = document.createElement("ul");
                    detail.className = "fetlife-broad-terms", detail.hidden = !0, lines.forEach(l => {
                        const d = document.createElement("li"), b = document.createElement("b");
                        b.textContent = l.term;
                        const a = document.createElement("span");
                        a.className = "fl-arrow", a.textContent = " → ";
                        const t = document.createElement("span");
                        t.textContent = l.target, d.append(b, a, t), detail.append(d);
                    }), li.append(detail), badge.addEventListener("click", () => {
                        detail.hidden = !detail.hidden, badge.setAttribute("aria-expanded", String(!detail.hidden));
                    });
                }
                return li;
            }, list = document.createElement("ul");
            list.className = "fetlife-broad-list", h.forEach(cat => {
                const entry = byCat.get(cat.name);
                if (!entry) return;
                const catTotal = entry.direct + entry.subs.reduce((a, s) => a + s.count, 0);
                total += catTotal;
                const catLines = entry.directLines.concat(entry.subs.reduce((a, s) => a.concat(s.lines), []));
                const li = mkRow(cat.name, catTotal, catLines, "fetlife-broad-cat");
                if (entry.direct || entry.subs.length) {
                    const subList = document.createElement("ul");
                    subList.className = "fetlife-broad-subs", entry.direct && subList.append(mkRow("The whole category", entry.direct, entry.directLines, "fetlife-broad-sub")), 
                    entry.subs.forEach(s => subList.append(mkRow(s.name, s.count, s.lines, "fetlife-broad-sub"))), li.append(subList);
                }
                list.append(li);
            }), tree.append(list), totalEl && (totalEl.textContent = `${total} FetLife term${1 === total ? "" : "s"} matched a broad area instead of a specific kink, so the rating was applied to that category or subcategory itself. Press “Rate the categories your kinks map to” and the list will show just ${1 === total ? "that area" : "those areas"}, most popular first and collapsed — expand one to rate its top topics. Each “N terms” pill lists the exact FetLife terms behind the count — hover it, or select it to expand the list — and shows where each term mapped.`);
            const closeBtn = e.byId("closeFetlifeBroad"), dismissBtn = e.byId("dismissFetlifeBroad");
            closeBtn && (closeBtn.onclick = () => Ui(dlg)), dismissBtn && (dismissBtn.onclick = () => {
                Ui(dlg), window.__sxFetLifeReview = new Set(hits), sxOutlineSortMode = "popularity";
                try {
                    Do.open ? Cs() : location.hash = "#app/listview";
                } catch (e) { __sxErrLog("listview-open", e); }
            }), Wi(dlg), 
            dismissBtn && requestAnimationFrame(() => dismissBtn.focus({ preventScroll: !0 }));
        }
