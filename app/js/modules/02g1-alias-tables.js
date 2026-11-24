// ---- Flexcapades Static Alias Tables & Dictionaries (02g1-alias-tables.js) ----
// Extracted from 02g-definitions-ratings.js for startup speed, modularity, and clean JIT indexing.
// Contains static topic alias maps, skin category colors & glyphs, icon geometries,
// hanky color palettes, and direction role labels.


const ie = {
            "decorative rope": "Shibari",
            "japanese-inspired bondage": "Shibari",
            "suspension bondage": "Suspension",
            "cuffs & straps": "Bondage",
            "spreader bars": "Bondage",
            "tape wrapping": "Bondage",
            mummification: "Bondage",
            "furniture restraint": "Bondage",
            "blindfolded restraint": "Bondage",
            "escape / immobilization": "Bondage",
            "paddles & straps": "Impact play",
            "riding crops": "Impact play",
            canes: "Caning",
            "switches & implements": "Impact play",
            "needle / piercing play": "Needle play",
            "heavy marking": "Cutting",
            "wax & temperature play": "Wax play",
            "ice & cold play": "Ice play",
            electrostimulation: "Sensation play",
            "sensory deprivation": "Sensation play",
            "sensory overload": "Sensation play",
            "feathers & light touch": "Sensation play",
            "soundscapes & music": "Sensation play",
            "massage & oils": "Massage",
            "dominant role": "Dominance",
            "submissive role": "Submission",
            slave: "Master/slave",
            "owner & property": "Master/slave",
            "caregiver & little roles": "Age play",
            "age play between adults": "Age play",
            "pet handler": "Pet play",
            "puppy play": "Puppy play",
            "pony play": "Pony Play",
            "doctor / patient": "Doctor/nurse",
            "teacher / student": "Teacher/student",
            "boss / employee": "Boss/secretary",
            "captivity scenarios": "Kidnapping",
            "consensual non-consent": "CNC",
            "interrogation scenes": "Interrogation",
            "police roleplay": "Police",
            "military roleplay": "Military",
            "religious roleplay": "Religious",
            "historical roleplay": "Historical",
            "latex & rubber": "Latex",
            "lingerie & stockings": "Lingerie",
            uniforms: "Uniform",
            "heels & boots": "Boots",
            diapers: "Diapers",
            "feet & footwear": "Feet",
            "muscle worship": "Worship",
            buttocks: "Ass worship",
            genderplay: "Feminization",
            sissification: "Sissy",
            "humiliation language": "Humiliation",
            "mindfucks & uncertainty": "Fear Play",
            objectification: "Objectification",
            degradation: "Degradation",
            "fear play": "Fear Play",
            begging: "Begging",
            "watching & being watched": "Voyeurism",
            "performance for a partner": "Exhibitionism",
            "public / outdoor exposure": "Exhibitionism",
            "exhibition / voyeurism": "Exhibitionism",
            threesomes: "Threesome",
            "group encounters": "Threesome",
            "cuckold / hotwife": "Hotwife",
            "polyamory with kink": "Polyamory",
            "anal fingering": "Anal play",
            rimming: "Anal play",
            "anal beads & plugs": "Anal play",
            "vaginal fisting": "Fisting",
            "anal fisting": "Fisting",
            facesitting: "Ass worship",
            "chastity devices": "Chastity",
            "orgasm control": "Cum control",
            "cum eating instructions": "CEI",
            "jerk-off instruction": "JOI",
            "foot worship": "Foot worship",
            "body worship": "Body worship",
            "blood play": "Blood play",
            watersports: "Watersports",
            "scat play": "Scat",
            "spiritual play": "Religious",
            "mythical creatures": "Fantasy",
            aliens: "Sci-fi",
            "furry transformation fantasy": "Furry",
            crossdressing: "Crossdressing"
        };

const ue = [ [ "Power exchange", "Psychological dynamics" ], [ "Power exchange", "Service & ritual" ], [ "Power exchange", "Roleplay & identity" ], [ "Bondage & restriction", "Impact, pain & body modification" ], [ "Bondage & restriction", "Sensation & atmosphere" ], [ "Impact, pain & body modification", "Primal & pursuit" ], [ "Impact, pain & body modification", "Connection & aftercare" ], [ "Sensation & atmosphere", "Clothing, materials & objects" ], [ "Sensation & atmosphere", "Body focus & appearance" ], [ "Roleplay & identity", "Fantasy & transformation" ], [ "Roleplay & identity", "Clothing, materials & objects" ], [ "Clothing, materials & objects", "Body focus & appearance" ], [ "Psychological dynamics", "Primal & pursuit" ], [ "Psychological dynamics", "Connection & aftercare" ], [ "Watching, exposure & settings", "Partner configurations" ], [ "Watching, exposure & settings", "Clothing, materials & objects" ], [ "Partner configurations", "Sex acts" ], [ "Partner configurations", "Fantasy & transformation" ], [ "Sex acts", "Positions" ], [ "Sex acts", "Orgasm & reproductive play" ], [ "Sex acts", "Fluids & messy play" ], [ "Orgasm & reproductive play", "Fluids & messy play" ], [ "Primal & pursuit", "Fantasy & transformation" ], [ "Service & ritual", "Connection & aftercare" ] ];

const he = [ [ "t0281", "t0240" ] ];
        const ge = {
            "Power exchange": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M5 17 7 8l5 5 5-5 2 9Z M7 20h10"/>'
            },
            "Bondage & restriction": {
                color: "#ee925f",
                glyph: '<path class="icon-glyph" d="M9.5 14.5 7 17a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4-.2 M14.5 9.5 17 7a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 .2 M8.5 15.5l7-7"/>'
            },
            "Impact, pain & body modification": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M12 3a5 6 0 0 1 5 6c0 3-1.6 4.8-3.4 5.6l.4 4.9a2 2 0 0 1-4 0l.4-4.9C8.6 13.8 7 12 7 9a5 6 0 0 1 5-6Z"/>'
            },
            "Sensation & atmosphere": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M3 12c3-6 5 6 8 0s5 6 10 0"/>'
            },
            "Roleplay & identity": {
                color: "#a8c766",
                glyph: '<path class="icon-glyph" d="M4 7c4-2 6 1 8 1s4-3 8-1v6c0 5-4 8-8 8s-8-3-8-8Zm3 4h2m6 0h2m-8 5c2 1 4 1 6 0"/>'
            },
            "Clothing, materials & objects": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M9 5a3 3 0 1 1 5 2l-1 1 8 6H3l8-6 M3 14v4h18v-4"/>'
            },
            "Body focus & appearance": {
                color: "#55c48a",
                glyph: '<path class="icon-glyph" d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 21v-5a6 6 0 0 1 12 0v5 M9 13l3 3 3-3"/>'
            },
            "Psychological dynamics": {
                color: "#55c4a8",
                glyph: '<path class="icon-glyph" d="M9 4a4 4 0 0 0-3 6 4 4 0 0 0 1 7 4 4 0 0 0 5 3V6a3 3 0 0 0-3-2Zm6 0a4 4 0 0 1 3 6 4 4 0 0 1-1 7 4 4 0 0 1-5 3 M7 10h3m4 3h3"/>'
            },
            "Watching, exposure & settings": {
                color: "#59beca",
                glyph: '<path class="icon-glyph" d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle class="icon-glyph" cx="12" cy="12" r="2.5"/>'
            },
            "Partner configurations": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM1 15v-2a3 3 0 0 1 6 0v2m1-5a3 3 0 0 1 6 2v3"/>'
            },
            "Sex acts": {
                color: "#6ca8df",
                glyph: '<path class="icon-glyph" d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-3l1 1 1-1a4 4 0 0 1 7 3Z"/>'
            },
            "Positions": {
                color: "#809cdf",
                glyph: '<path class="icon-glyph" d="M5 7h12m0 0-3-3m3 3-3 3M19 17H7m0 0 3-3m-3 3 3 3"/>'
            },
            "Orgasm & reproductive play": {
                color: "#9a91df",
                glyph: '<path class="icon-glyph" d="M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3 3m8 8 3 3m0-14-3 3M8 16l-3 3"/><circle class="icon-glyph" cx="12" cy="12" r="3"/>'
            },
            "Fluids & messy play": {
                color: "#b188dd",
                glyph: '<path class="icon-glyph" d="M12 3S6 10 6 15a6 6 0 0 0 12 0c0-5-6-12-6-12Z M9 16c.5 1.5 1.5 2 3 2"/>'
            },
            "Primal & pursuit": {
                color: "#c985d2",
                glyph: '<path class="icon-glyph" d="M8 11c-3 0-4-4-2-5s4 2 4 4m6 1c3 0 4-4 2-5s-4 2-4 4M12 9c-2 0-5 5-5 8 0 2 2 3 5 1 3 2 5 1 5-1 0-3-3-8-5-8Z"/>'
            },
            "Service & ritual": {
                color: "#da7dbd",
                glyph: '<path class="icon-glyph" d="M6 16h12M8 16v-3a4 4 0 0 1 8 0v3m-9 4h10M12 4v3"/>'
            },
            "Fantasy & transformation": {
                color: "#e17da6",
                glyph: '<path class="icon-glyph" d="m5 19 10-10m-8 8 2 2m5-14 1.5 3L19 9l-3 1.5L15 14l-1.5-3L10 9.5 13 8Z"/>'
            },
            "Connection & aftercare": {
                color: "#ea7f8b",
                glyph: '<path class="icon-glyph" d="M12 20S4 15 4 9a4 4 0 0 1 7-3l1 1 1-1a4 4 0 0 1 7 3c0 6-8 11-8 11Z M8 13h2l1-3 2 6 1-3h2"/>'
            },
            /* Flexcapades skin categories: Chemcapades (8). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Ontology & Metaphysics of the Chemical World": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M12 5.5a6.5 3.2 0 1 0 0 13 6.5 3.2 0 1 0 0-13zM5.8 15.8a6.5 3.2 60 1 0 12.4-7.6M18.2 15.8a6.5 3.2 120 1 0-12.4-7.6"/>'
            },
            "The Periodic System & Classification": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M4.5 5h15v14h-15zM4.5 9.8h15M4.5 14.6h15M9.5 5v4.8M14.5 5v4.8M9.5 9.8v4.8M14.5 9.8v9.2M9.5 14.6V19"/>'
            },
            "Epistemology, Explanation & Modeling": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 3.5a5.5 5.5 0 0 1 3.2 10.3c-.6.4-1 .9-1.3 1.7h-3.8c-.3-.8-.7-1.3-1.3-1.7A5.5 5.5 0 0 1 12 3.5zM10 18.5h4M10.8 21h2.4M12 8v4"/>'
            },
            "Disciplinary Identity & Sub-Disciplinary Cultures": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M12 4.2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM5.2 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM18.8 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.8 19.5c.7-3 3-4.7 8.2-4.7s7.5 1.7 8.2 4.7M12 14.8V18"/>'
            },
            "Ethics, Sustainability & Lab Safety": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M12 3.5l7 2.5v5c0 4.5-3 7.8-7 9.5C8 18.8 5 15.5 5 11V6zM12 16.8c0-3 1.8-5 4.8-5.8-.3 3-1.8 5-4.8 5.8zM12 16.8c0-2-1-3.6-2.8-4.6"/>'
            },
            "Kinetics, Thermodynamics & Emergent Complexity": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M10 3.5h4M11 3.5v5.2L6.8 16a2.4 2.4 0 0 0 2.1 3.5h6.2a2.4 2.4 0 0 0 2.1-3.5L13 8.7V3.5M8.5 14.5h7M17.5 6.5c.8 1 .8 2 0 3M20 5c1 1.6 1 3.4 0 5"/>'
            },
            "Codification, Pedagogy & the Chemical Life": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M7 3.5h11.5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7zM7 3.5v16M7 3.5A1.5 1.5 0 0 0 5.5 5v13A1.5 1.5 0 0 0 7 19.5M10.5 8h6M10.5 11.5h6M10.5 15h4"/>'
            },
            "Materials, Energy & the Molecular Frontier": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M10 3.5h4M11 3.5v4.8L6.5 16a2.5 2.5 0 0 0 2.2 3.8h6.6A2.5 2.5 0 0 0 17.5 16L13 8.3V3.5M12 15.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM12 11v-1.5M9.8 16.8l-1.2-1M14.2 16.8l1.2-1"/>'
            },
            /* Flexcapades skin categories: Aesthcapades (7). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Visual Art": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-.9 2-1.9 0-.8-.6-1.3-.6-2.1 0-1.1 1-1.8 2.4-1.8H18a3.5 3.5 0 0 0 3.5-3.5C21.5 7.5 17.2 3.5 12 3.5zM7.8 10.2h.01M10.8 6.8h.01M15.8 6.5h.01M7.5 14.5h.01"/>'
            },
            "Music & Sound": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M9.5 18.2V5.8L20 4v11.7M9.5 18.2a2.9 2.6 0 1 1-5.8 0 2.9 2.6 0 0 1 5.8 0zM20 15.5a2.9 2.6 0 1 1-5.8 0 2.9 2.6 0 0 1 5.8 0zM9.5 5.8c3.5.6 7 .4 10.5-1.8"/>'
            },
            "Story & Word": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M6 4.5A1.5 1.5 0 0 1 7.5 3H20v15H7.5A1.5 1.5 0 0 0 6 19.5zM6 16.5V4.5M20 18H7.5M9.8 8h6.4M9.8 11.5h6.4"/>'
            },
            "Beauty & Adornment": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M8 4.5C5.5 7 4 10 4 13a8 8 0 0 0 16 0c0-3-1.5-6-4-8.5M8 4.5c1.2 2 2.4 4.8 3 8M8 4.5c2.8.6 5.6.6 8 0M16 4.5c-1.2 2-2.4 4.8-3 8"/>'
            },
            "Space & Place": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M5 20.5v-14M19 20.5v-14M5 6.5c2.3-2 4.7-3 7-3s4.7 1 7 3M3.5 20.5h17M9.5 20.5v-8h5v8M12 3.5v-1"/>'
            },
            "Taste & Judgment": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M5 4.5h14l-1.8 4.2H6.8zM12 8.7v6.3M8.5 20.5c.8-2 2-3.2 3.5-3.2s2.7 1.2 3.5 3.2M7 20.5h10"/>'
            },
            "Food & Flavor": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M4 16.5h16M5.5 16.5a6.5 6.5 0 0 1 13 0M12 10V8.8M10.2 6.2c.8-1 .8-1.8 0-2.8M13.8 6.2c.8-1 .8-1.8 0-2.8M3.5 20h17"/>'
            },
            /* Flexcapades skin categories: Dharmacapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Dharma & The Way": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M12 12m-8.5 0a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M12 12m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5M6 6l3.5 3.5M14.5 14.5 18 18M18 6l-3.5 3.5M9.5 14.5 6 18"/>'
            },
            "Liberation & Enlightenment": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 19.5c-1-2-1-4.2 0-6.5 1 2.3 1 4.5 0 6.5ZM12 13.5C10 11 7.2 10.2 4.5 11c.8 2.8 3 4.8 5.8 5.3M12 13.5c2-2.5 4.8-3.3 7.5-2.5-.8 2.8-3 4.8-5.8 5.3M5.5 20.5c4.3 1.2 8.7 1.2 13 0"/>'
            },
            "Practice & Discipline": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M12 8.6a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM12 9v3.2M12 12.2c-2.3.2-4.4 1.4-5.9 3.3M12 12.2c2.3.2 4.4 1.4 5.9 3.3M6.1 15.5c-1.3 1.8-3 2.8-4.9 3M6.1 15.5c1.9.5 4 .5 5.9 0M17.9 15.5c-1.9.5-4 .5-5.9 0M17.9 15.5c1.3 1.8 3 2.8 4.9 3M4.5 20.8h15"/>'
            },
            "Deity & The Divine": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M12 3v18M12 3c-2.8 0-4.5 1.8-4.5 4.5 0 2 1 3.6 2.7 4.6M12 3c2.8 0 4.5 1.8 4.5 4.5 0 2-1 3.6-2.7 4.6M8.5 21h7"/>'
            },
            "Ethics & Conduct": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M12 3.5 5 6v5.5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6zM9 11.8l2.2 2.2 3.8-4"/>'
            },
            "Community & Lineage": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 10.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM5.8 8.4a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18.2 8.4a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM7.2 20.5c.6-3 2.4-4.6 4.8-4.6s4.2 1.6 4.8 4.6M2.8 16.6c.3-2.2 1.3-3.6 3-4.2M21.2 16.6c-.3-2.2-1.3-3.6-3-4.2M12 12.5v3"/>'
            },
            /* Flexcapades skin categories: Expericapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Mission & Discovery Strategy": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 12m-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0M12 12h.01M12 4V2.8M12 21.2V20M4 12H2.8M21.2 12H20"/>'
            },
            "Detectors & Instruments": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M4.5 19.5a8 8 0 1 1 2.3-15.7M12 12l4.2-4.2M12 12h.01M6 12h.01M18 12h.01M12 6h.01M8 20.5h8"/>'
            },
            "Data, Noise & Standards of Discovery": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M4 4.5h16l-6.2 7.3v6.7l-3.6 2v-8.7zM7.5 8h9M17.5 19.5h.01M20 16.5h.01"/>'
            },
            "Environment & Extremes": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M12 3.5l2 3.8 4.2-.5-3 3 1 4.2L12 11.5l-4.2 2.5 1-4.2-3-3 4.2.5zM12 15.5v5M8.5 18h7"/>'
            },
            "Data, Analysis & Openness": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M6.5 4.5A1.5 1.5 0 0 0 5 6v13.5A1.5 1.5 0 0 1 6.5 18H19V4.5zM5 16.5V6M19 18H6.5M9 15v-3.5M12 15V8.5M15 15v-5.5"/>'
            },
            "The Experimental Life & Lab Culture": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M9.5 4a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6zM14.5 4a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6zM5.5 19.5c.6-3.2 3-5 6.5-5s5.9 1.8 6.5 5M12 14.5V17"/>'
            },
            /* Flexcapades skin categories: Forescapades (7, real v2.4 categories). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "God": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z M12 2.5v3 M12 18.5v3 M2.5 12h3 M18.5 12h3 M5 5l2.1 2.1 M16.9 16.9 19 19 M19 5l-2.1 2.1 M7.1 16.9 5 19"/>'
            },
            "Scripture & Authority": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M5 4.5C7.5 3.6 10 3.8 12 5.4c2-1.6 4.5-1.8 7-.9v13.4c-2.5-.9-5-.7-7 .9-2-1.6-4.5-1.8-7-.9Z M12 5.4v13.4 M8 8.5h1.5 M14.5 8.5H16"/>'
            },
            "Community & Leadership": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 4.5a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2Z M5.5 6.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z M18.5 6.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z M4 20c.8-3.4 3.8-5.2 8-5.2s7.2 1.8 8 5.2 M2.5 15.6c.4-1.6 1.4-2.8 3-3.4M21.5 15.6c-.4-1.6-1.4-2.8-3-3.4"/>'
            },
            "Salvation & Grace": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M9 4.5A4.5 4.5 0 0 1 18 4.5c0 3-2.4 4.6-4.5 6.3-.7.7-1.2 1.5-1.5 2.7-.3-1.2-.8-2-1.5-2.7C7.4 9.1 5 7.5 5 4.5A4.5 4.5 0 0 1 9 4.5Z M12 13.5c-.5 2.3-2 3.7-4 4.5M12 13.5c.5 2.3 2 3.7 4 4.5 M8 21h8"/>'
            },
            "Ritual & Worship": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M12 3v3 M12 6c-2.5 2.4-4 4.6-4 7a4 4 0 0 0 8 0c0-2.4-1.5-4.6-4-7Z M5 21h14 M8 17.5h8"/>'
            },
            "Life & Morality": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M12 21c-4.5-2.2-7-5.6-7-10V6l7-2.5L19 6v5c0 4.4-2.5 7.8-7 10Z M12 8v5 M12 16.5h.01"/>'
            },
            "Last Things": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M7 3h10 M7 21h10 M8.5 3c0 4 2 5.5 3.5 6.5C14 8 15.5 7 15.5 3 M8.5 21c0-4 2-5.5 3.5-6.5-2-1-3.5-2.5-3.5-6.5 M9.5 17.5c.7-1 1.5-1.6 2.5-1.6s1.8.6 2.5 1.6"/>'
            },
            /* Flexcapades skin categories: Mattercapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "The Applied Physics Philosophy & Strategy": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M5 19.5V5.5L12 3l7 2.5v14M5 19.5h14M9 19.5v-5.5h6v5.5M12 8h.01M9.5 11h5"/>'
            },
            "Domains & Scale": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M5 19V8.5M5 19h14.5M5 19l4-5.5 4.5 2.5L19 7M9 13.5h.01M13.5 16h.01M19 7h.01M5 8.5h.01"/>'
            },
            "Quantum Technology & Hardware": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M8 8h8v8H8zM10.8 10.8h2.4v2.4h-2.4zM10 8V4.5M14 8V4.5M10 19.5V16M14 19.5V16M8 10H4.5M8 14H4.5M19.5 10H16M19.5 14H16"/>'
            },
            "Energy, Power & Clean Technology": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0-6.4 0M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>'
            },
            "Materials & Fabrication": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M4 20.5h16M6.5 20.5v-6l3-3h5l3 3v6M9.5 20.5v-4h5v4M12 8.5V5M9.5 5h5"/>'
            },
            "Life, Medicine & the Applied Life": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M12 20.5S4.5 15.5 4.5 9.9A4.3 4.3 0 0 1 12 6.4a4.3 4.3 0 0 1 7.5 3.5c0 5.6-7.5 10.6-7.5 10.6Z M7 12h3l1.2-2.6 1.8 4 1.2-1.4H17"/>'
            },
            /* Flexcapades skin categories: Philoscapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Epistemology & Theory of Truth": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 5.5V3M8 6.2 6.3 4M16 6.2 17.7 4"/>'
            },
            "Metaphysics & Ontology": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM12 20.5c-4.8-2-7-5-7-8.5M12 20.5c4.8-2 7-5 7-8.5M5 12.5c2-1 4.5-1.5 7-1.5s5 .5 7 1.5M12 11V3.8M8.6 5.2A8.5 8.5 0 0 1 12 3.5M15.4 5.2A8.5 8.5 0 0 0 12 3.5"/>'
            },
            "Axiology & Normative Ethics": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M7 4h10l3.5 5L12 20.5 3.5 9Z M3.5 9h17 M12 20.5L8.5 9l2-5 M12 20.5L15.5 9l-2-5"/>'
            },
            "Philosophy of Mind & Consciousness": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M10.2 4.2A3.2 3.2 0 0 0 5 6.8c-1.2 1-1.6 2.6-1 4 .4 1.1.3 2.3 1 3.3.6 1 1.7 1.5 2.9 1.3V6.5c0-1-.5-1.9-1.3-2.3zM13.8 4.2A3.2 3.2 0 0 1 19 6.8c1.2 1 1.6 2.6 1 4-.4 1.1-.3 2.3-1 3.3-.6 1-1.7 1.5-2.9 1.3V6.5c0-1 .5-1.9 1.3-2.3zM12 4v14.5"/>'
            },
            "Existentialism & The Human Condition": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M12 8.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM12 8.5v4M12 12.5c-2 .8-4.5 1.2-6.5 1M12 12.5c2 .8 4.5 1.2 6.5 1M5.5 13.5c-.8 2.2-2 4-3.7 5.3M18.5 13.5c.8 2.2 2 4 3.7 5.3M8.5 21h7"/>'
            },
            "Political Philosophy & Justice": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 3.5v17M7.5 20.5h9M12 6.8H5.6M12 6.8h6.4M5.6 6.8 3 12.4a3.3 3.3 0 0 0 5.2 0L5.6 6.8zM18.4 6.8 15.8 12.4a3.3 3.3 0 0 0 5.2 0L18.4 6.8zM12 6.8v13.7"/>'
            },
            /* Flexcapades skin categories: Poliscapades (8, real draft categories). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "The Economy": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z M14.5 6.8c-.6-1-1.5-1.3-2.5-1.3-1.4 0-2.5 1-2.5 2.3 0 3.2 5 1.7 5 3.2 0 1.3-1.1 2.2-2.5 2.2-1 0-2-.4-2.6-1.2 M12 3.5v1.8 M12 18.5v2"/>'
            },
            "Health & Care": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 20.5S4 15.4 4 9.6A4.4 4.4 0 0 1 12 6a4.4 4.4 0 0 1 8 3.6c0 5.8-8 10.9-8 10.9Z M12 8.5v6 M9 11.5h6"/>'
            },
            "Climate, Energy & Environment": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M19 5C13.5 5.5 7 8 5.5 13.5C5 15.5 5 19 5 19C10 19 18.5 13 19 5Z M5 19C7.5 14.5 11.5 10.5 16 8"/>'
            },
            "Immigration & Borders": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M6 21.5v-19 M6 3.5c3-1.8 5.5 1.8 9 0v7c-3.5 1.8-6-1.8-9 0"/>'
            },
            "Democracy & Government": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M4 9.5h16V20H4Z M9 9.5V6.8A1.8 1.8 0 0 1 10.8 5h2.4A1.8 1.8 0 0 1 15 6.8v2.7 M2.5 9.5h19 M8.5 14.5l2.5 2.5 4.5-4.5"/>'
            },
            "Rights & Freedoms": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M12 3c.6 2.8-.8 4.2-1.8 5.8C9.2 8.4 8.5 9.8 8.5 11.3a3.5 3.5 0 0 0 7 .2c0-1-.4-1.9-1-2.7 1.8.6 3 2.2 3 4.2a5.5 5.5 0 0 1-11 0C6.5 8.9 9 5.9 12 3Z M8 21h8"/>'
            },
            "Education & Culture": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M12 6.5C10 4.8 7 4.2 4 4.5v13c3-.3 6 .3 8 2 2-1.7 5-2.3 8-2v-13c-3-.3-6 .3-8 2Z M12 6.5v13"/>'
            },
            "Foreign Policy & Defense": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3c2.7 2.6 4 5.6 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.6-4-9s1.3-6.4 4-9Z"/>'
            },
            /* Flexcapades skin categories: Praxicapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "The Art of Modeling": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M12 4 3.5 8.8v10.4L12 20l8.5-5.2V8.8zM3.5 8.8 12 14l8.5-5.2M12 14v6"/>'
            },
            "Computation & Method": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M9.5 3.5h5v4h-5zM4 10.5h4.5v4H4zM15.5 10.5H20v4h-4.5zM9.5 17h5v4h-5zM12 7.5v3M6.2 10.5v-2h11.6v2M6.2 14.5v4.3M17.8 14.5v4.3M6.2 18.8h3.3M14.5 18.8h3.3"/>'
            },
            "Domains & Arenas": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M4.5 19.5v-15h15v15zM4.5 19.5h15M4.5 12h15M9.8 4.5V12M14.8 12v7.5M9.8 19.5V12M14.8 4.5V12"/>'
            },
            "Uncertainty & Data": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M4 20.5v-16M4 20.5h17M6.5 17.5c2-1 3-9 5.5-9s3.5 8 5.5 9M9.2 13.5h5.6M9.2 10.8h5.6"/>'
            },
            "Rigor & Validation": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M5 4.5h14v15H5zM8.5 15.8l2.4 2.4 4.6-5.2M8.5 8h4"/>'
            },
            "The Applied Life": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M12 8.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M12 8.6v4.6 M12 13.2l-4.5 3.3 M12 13.2l4.5 3.3 M4.5 20.5h15"/>'
            },
            /* Flexcapades skin categories: Quantacapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Foundations & Interpretation": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M4 20.5h16M6 20.5v-4h12v4M9 16.5v-3.5h6v3.5M12 13V9.5M8.5 9.5a3.5 3.5 0 1 1 7 0"/>'
            },
            "Quantum Gravity & Spacetime": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M4 7c5 3.5 11 3.5 16 0M4 12c5 3.5 11 3.5 16 0M4 17c5 3.5 11 3.5 16 0M7.5 4.5v15M12 5.8v12.4M16.5 4.5v15"/>'
            },
            "Cosmology & the Universe": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 12h.01M12 12c.5-2.5 3-4 5.5-3.5C20 9 21 12 19.5 14.5 18 17 14 17.5 11.5 15.5 9 13.5 9.5 9.5 12.5 7.5c2.5-1.8 6-1 7.5 1.7"/>'
            },
            "Emergence & Information": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M12 20.5v-3M12 14.5v-3M7 8.5a3 3 0 1 0 3-3M17 8.5a3 3 0 1 1-3-3M7 8.5h.01M17 8.5h.01M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>'
            },
            "Symmetry & Fine-Tuning": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M12 4v16M12 4L7 7.5M12 4l5 3.5M7 7.5V15M17 7.5V15M7 15l-2 5.5h4zM17 15l-2 5.5h4z"/>'
            },
            "The Life of a Theorist": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M12 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM5.5 20.5c.8-3.8 3.4-5.7 6.5-5.7s5.7 1.9 6.5 5.7M15.5 5.5c1.5-1 3.5-.8 4.7.5"/>'
            },
            /* Flexcapades skin categories: Simulcapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "The Epistemology of Simulation": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M2 12c3-5 6-7 10-7s7 2 10 7c-3 5-6 7-10 7S5 17 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>'
            },
            "Methods": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M5 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M15 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M5 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M8.5 6.5l6 4 M15.5 13.5l-6 4"/>'
            },
            "Scale, Discretization & Time": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M4 4h16v16H4Z M4 9.3h16 M4 14.6h16 M9.3 4v16 M14.6 4v16"/>'
            },
            "The Machine & The Code": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M7 7h10v10H7Z M10 10h4v4h-4Z M9 7V3 M15 7V3 M9 21v-4 M15 21v-4 M7 9H3 M7 15H3 M21 9h-4 M21 15h-4"/>'
            },
            "Trust, Error & Reproducibility": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6Z M9 12l2 2 4-4"/>'
            },
            "The Computational Life": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 21v-8 M12 13c0-4 3-6 7-6 0 4-3 6-7 6 M12 13c0-4-3-6-7-6 0 4 3 6 7 6"/>'
            },
            /* Flexcapades skin categories: Techcapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "AI & Intelligence": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 3a7 7 0 0 1 7 7c0 3-2 5-4 6l-1 3h-4l-1-3c-2-1-4-3-4-6a7 7 0 0 1 7-7Z M12 8v3 M9.5 13.5h5"/>'
            },
            "Privacy & Surveillance": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M6 11h12v10H6Z M9 11V8a3 3 0 0 1 6 0v3 M12 15v2.5"/>'
            },
            "Screens & Attention": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M3 5h18v11H3Z M9 20h6 M12 16v4 M9.5 10.5h5 M12 8v5"/>'
            },
            "Connection & Social Media": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M4 4h11v8H9l-4 3.5V4Z M16 10h4v7l-3 3v-3h-2"/>'
            },
            "Digital Identity & Self": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M5 20c1-4 4-6 7-6s6 2 7 6"/>'
            },
            "The Machine Future": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M6 9h12v9H6Z M12 9V5 M8.5 5h7 M9.5 13h1 M13.5 13h1 M9.5 16h5 M6 12H4 M18 12h2"/>'
            },
            /* Flexcapades skin categories: Theoricapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Foundations & Ontology": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M4 20.5h16M6.5 20.5v-6h11v6M9.5 14.5V10h5v4.5M12 10V6.5M12 3.5h.01"/>'
            },
            "Method & Style": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M5 19.5L19.5 5M5 19.5c2-1 3.5-3 4-6l6-6.5c1.5-1.5 4 .5 3 2L11 15c-3 1-4.5 2.5-6 4.5zM14 7l3 3"/>'
            },
            "Branches & Territory": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M12 21v-6.5M12 14.5C9.5 12.5 6 12 3.5 12.5 5 9.5 8 8 12 8.5M12 14.5c2.5-2 6-2.5 8.5-2-1.5-3-4.5-4.5-8.5-4M12 8.5V4M9 21h6"/>'
            },
            "Proof & Verification": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M6 3.5h9L19 7v13.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1zM14.5 3.5v4H19M8.5 15.5l2.5 2.5 4.5-5.5"/>'
            },
            "Beauty & Reality": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M12 3l1.7 5.1L19 6l-3.2 4.3L21 12l-5.2 1.7L19 18l-5.3-2.9L12 21l-1.7-5.9L5 18l3.2-4.3L3 12l5.2-1.7L5 6l5.3 2.9z"/>'
            },
            "The Mathematical Life": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M12 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM5.5 20.5c.8-3.8 3.4-5.7 6.5-5.7s5.7 1.9 6.5 5.7M8 4.5C9 3.5 10.5 3 12 3"/>'
            },
            /* Flexcapades skin categories: Vocapades (6). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Purpose & Meaning": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>'
            },
            "Effort & Ambition": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M3 20l6-9 4 5 3-3 5 7Z M17 13V4 M17 4h4l-1.5 2L21 8h-4"/>'
            },
            "Place & Mode": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10Z M12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>'
            },
            "Structure & Authority": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M4 20h16 M5 20V10 M9.5 20V10 M14.5 20V10 M19 20V10 M3 10l9-6 9 6Z"/>'
            },
            "Reward & Security": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M5 4h14v16H5Z M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7 M12 12h2.5"/>'
            },
            "Identity & Boundaries": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M12 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z M8 20c0-3.2 1.8-5 4-5s4 1.8 4 5 M19.5 8A9 9 0 0 0 4.5 8 M4 15a9 9 0 0 0 15 1"/>'
            },
            /* Flexcapades skin categories: Dancecapades (9). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Partnering & connection": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M8 11.5a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Z M16 11.5a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Z M2.5 20c.8-3.2 2.8-5 5.5-5 1.5 0 2.9.6 3.9 1.6M21.5 20c-.8-3.2-2.8-5-5.5-5-1.5 0-2.9.6-3.9 1.6 M10.5 9.5h3"/>'
            },
            "Ballroom": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M4.5 16.5 5.6 8l4.4 4L12 6l2 6 4.4-4 1.1 8.5Z M5 20h14"/>'
            },
            "Swing & blues": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M7 8.5A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 4.7 4c1.9.3 3.3 1.2 4.3 2.5C18.6 12.7 15.4 14 12 14S5.4 12.7 3 10.5c1-1.3 2.4-2.2 4-2.5Z M3 10.5h18 M12 18.5h.01 M8.5 18c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/>'
            },
            "Salsa & club": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M14.5 10.5a4.7 4.7 0 1 1-6.6 4.3 4.7 4.7 0 0 1 6.6-4.3Z M14.5 10.5 20 5 M17.5 3.5l3 3 M10 13h.01 M12.5 11.5h.01 M9.5 16h.01"/>'
            },
            "Argentine tango": {
                color: "#ee925f",
                glyph: '<path class="icon-glyph" d="M12 9c-1.2-2-4-2.6-5.4-1C5.4 8.6 6.6 11 9 11.4 8.6 12.6 9 14 10.4 15c-2.6 1-3 3.6-1.4 5.2C11 21 14 20.6 15.6 18.6c1.2-1.6 1-3.4-.4-4.6 2.2-.6 3.2-2.8 2-4.4-1-1.4-3.4-1.2-5.2.4Z M12 16c1 2 1 4 .4 5.8M18.6 3.6c.6 1.8.4 3.6-.6 5.2"/>'
            },
            "Country & folk": {
                color: "#a8c766",
                glyph: '<path class="icon-glyph" d="M9 5h6l.8 5.2c2.4.5 4.2 1.8 5.2 3.8-2.8 1.2-5.8 1.8-9 1.8S5.8 15.2 3 14c1-2 2.8-3.3 5.2-3.8Z M9 5c1.8 1 4.2 1 6 0"/>'
            },
            "The social floor": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M4 4h16v16H4Z M4 9.3h16 M4 14.6h16 M9.3 4v5.3 M14.6 9.3v5.3 M9.3 14.6V20 M14.6 4v5.3 M6.8 7c-.5 1.5-.4 2.8.3 4 M17.2 12.2c-.5 1.5-.4 2.8.3 4"/>'
            },
            "Music & movement": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M10 18.5V6l10-2v11.5 M10 6l10-2 M13 18.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M23 15.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>'
            },
            "Settings & scenes": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M4 20V9.5L12 4l8 5.5V20 M4 20h16 M9.5 20v-5h5v5 M17.5 6.5 20 4M20 4v3 M20 4h-3"/>'
            },
            /* Flexcapades skin categories: Questcapades (8). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Your seat at the table": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M7 4v9 M7 4c2.8 0 4.5 1.8 4.5 4.5S9.8 13 7 13 M7 13h10.5 M17.5 13v7 M7 20v-7 M17.5 20h-4 M10 20H7 M11.5 8.5h6"/>'
            },
            "Systems & weight": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M12 9.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z M12 2.8v3 M12 18.2v3 M2.8 12h3 M18.2 12h3 M5.5 5.5l2.1 2.1 M16.4 16.4l2.1 2.1 M18.5 5.5l-2.1 2.1 M7.6 16.4l-2.1 2.1 M12 4.3l1.2 2.2h-2.4Z M19.7 12l-2.2 1.2v-2.4Z M12 19.7l-1.2-2.2h2.4Z M4.3 12l2.2-1.2v2.4Z"/>'
            },
            "Genres & settings": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 3l2.3 4.8 5.2.7-3.8 3.6 1 5.2L12 14.6l-4.7 2.7 1-5.2L4.5 8.5l5.2-.7Z M5 21h14"/>'
            },
            "Dice, death & danger": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9Z M12 3v6.5 M4.2 7.5l5.3 3.5 M19.8 7.5l-5.3 3.5 M9.5 11l-5.3 5.5 M14.5 11l5.3 5.5 M9.5 11h5v5.5h-5Z M10.8 13.8h.01 M13.2 13.8h.01"/>'
            },
            "Story & character": {
                color: "#a8c766",
                glyph: '<path class="icon-glyph" d="M12 4.8a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z M5 20.5c1-3.8 3.6-5.7 7-5.7s6 1.9 7 5.7 M17.5 4.2l.9 1.9 2.1.3-1.5 1.5.3 2.1-1.8-1-1.8 1 .3-2.1-1.5-1.5 2.1-.3Z"/>'
            },
            "Combat & challenge": {
                color: "#ee925f",
                glyph: '<path class="icon-glyph" d="M5 4l11 11 M19 4L8 15 M14.5 3.5l6 6 M3.5 9.5l6 6 M5 4l-1.6-1.4M19 4l1.6-1.4M16 13l3.5 3.5a2.05 2.05 0 0 1-3 3L13 16 M8 13l-3.5 3.5a2.05 2.05 0 0 0 3 3L11 16"/>'
            },
            "The table itself": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M3 9.5h18 M5.5 9.5V20 M18.5 9.5V20 M3 9.5c2-2.4 5.2-3.6 9-3.6s7 1.2 9 3.6 M7.5 4a1.6 1.6 0 1 1 0 3.2A1.6 1.6 0 0 1 7.5 4Z M16.5 4a1.6 1.6 0 1 1 0 3.2A1.6 1.6 0 0 1 16.5 4Z M12 13.5h.01"/>'
            },
            "Formats & fandom": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M6.5 3.5h11V8L12 5.5 6.5 8Z M12 5.5V20 M6.5 3.5V20 M17.5 3.5V20 M6.5 20h11"/>'
            },
            /* Flexcapades skin categories: Nouscapades (8). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "What is a mind?": {
                color: "#9b8cf2",
                glyph: '<path class="icon-glyph" d="M9.5 4A3 3 0 0 0 6.7 8.5 3 3 0 0 0 5 13c0 2 1 3.2 3 3.4A3 3 0 0 0 12 19V6.5A3 3 0 0 0 9.5 4Z M14.5 4A3 3 0 0 1 17.3 8.5 3 3 0 0 1 19 13c0 2-1 3.2-3 3.4A3 3 0 0 1 12 19"/>'
            },
            "What is a self?": {
                color: "#63c2c8",
                glyph: '<path class="icon-glyph" d="M12 2.5a5 7.5 0 1 0 0 15 5 7.5 0 0 0 0-15 M12 20.5V18 M8 21h8 M12 10a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 12 10 M9.5 15.5c.5-1.5 1.4-2.2 2.5-2.2s2 .7 2.5 2.2"/>'
            },
            "The new beings": {
                color: "#a8c766",
                glyph: '<path class="icon-glyph" d="M7 10h10v8H7Z M7 10C5.5 7 4 5.8 2.5 5.5 M17 10c1.5-3 3-4.2 4.5-4.5 M9.8 13.8h.4 M13.8 13.8h.4 M10 16.5h4"/>'
            },
            "The bioelectric pattern": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M13 3L6 13h5l-1 8 7-10h-5Z"/>'
            },
            "Agency at every scale": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M5.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5 M13 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M8 10.5l2.5-2 M16.5 8.5l1-2"/>'
            },
            "Death and continuity": {
                color: "#7ec8e3",
                glyph: '<path class="icon-glyph" d="M5 9a8 8 0 0 1 13-3 M19 15a8 8 0 0 1-13 3 M18 2.5V7h-4.5 M6 21.5V17h4.5"/>'
            },
            "Who counts?": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M12 3v18 M7 21h10 M12 6H5.5 M12 6h6.5 M5.5 6L3 12a3.2 3.2 0 0 0 5 0L5.5 6 M18.5 6L16 12a3.2 3.2 0 0 0 5 0L18.5 6"/>'
            },
            "The human case": {
                color: "#ee925f",
                glyph: '<path class="icon-glyph" d="M12 6.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M12 7.5V15 M4.5 10.5L12 8l7.5 2.5 M9 21l3-6 3 6"/>'
            },
            /* Flexcapades skin categories: Biocapades (8). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "What counts as alive": {
                color: "#7fc96b",
                glyph: '<path class="icon-glyph" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 9.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4 M17.2 6.8h.3 M6.4 15.2h.3 M16.2 16.8h.3"/>'
            },
            "Evolution's engine": {
                color: "#e0a458",
                glyph: '<path class="icon-glyph" d="M12 21v-6 M12 15c-.5-3-2.5-5-6-5.8 M12 15c.5-3 2.5-5 6-5.8 M6 9.2C5.8 6.8 7 5 9.2 4.2 M18 9.2c.2-2.4-1-4.2-3.2-5"/>'
            },
            "Genes & inheritance": {
                color: "#6ba8e0",
                glyph: '<path class="icon-glyph" d="M8 3c0 6 8 6.5 8 9.5S8 18 8 21 M16 3c0 6-8 6.5-8 9.5s8 5.5 8 8 M8.6 6.8h6.8 M8.6 17.2h6.8 M9.8 12h4.4"/>'
            },
            "Minds & behavior": {
                color: "#c98bd9",
                glyph: '<path class="icon-glyph" d="M2.5 12C5 6.8 8.4 4.2 12 4.2S19 6.8 21.5 12C19 17.2 15.6 19.8 12 19.8S5 17.2 2.5 12Z M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"/>'
            },
            "The cell, the body & aging": {
                color: "#d97b6c",
                glyph: '<path class="icon-glyph" d="M6.5 3h11 M6.5 21h11 M7.2 3c.6 3.8 2.2 6.4 4.8 8.6-2.6 2.2-4.2 4.8-4.8 8.6 M16.8 3c-.6 3.8-2.2 6.4-4.8 8.6 2.6 2.2 4.2 4.8 4.8 8.6"/>'
            },
            "Editing life": {
                color: "#d9c84f",
                glyph: '<path class="icon-glyph" d="M5 19l1-3.8L16.6 4.6a2.1 2.1 0 0 1 3 3L9 18.2 5 19Z M14.6 6.6l3 3"/>'
            },
            "Deep time & ecology": {
                color: "#5dbb8a",
                glyph: '<path class="icon-glyph" d="M12 13.5V8 M12 8C12 5 9.8 3.2 6 3.2c0 3.2 2.2 4.8 6 4.8 M12 8c0-3 2.2-4.8 6-4.8 0 3.2-2.2 4.8-6 4.8 M4 17h16 M6.5 20.5h11"/>'
            },
            "Life elsewhere & everywhere": {
                color: "#8fb8e8",
                glyph: '<path class="icon-glyph" d="M12 6.7a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6 M3 14.5c-1 .4-1.5 1-1.2 1.7.5 1.2 4.9 1.7 10.2 1.2 5.3-.5 9.3-1.8 10-3.1.3-.8-.3-1.4-1.4-1.8"/>'
            },
            /* Flexcapades skin categories: Fastcapades (7). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Purpose & meaning": {
                color: "#fb923c",
                glyph: '<path class="icon-glyph" d="M12 3v3.4 M12 17.6V21 M3 12h3.4 M17.6 12H21 M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6"/>'
            },
            "What counts as a fast": {
                color: "#38bdf8",
                glyph: '<path class="icon-glyph" d="M12 3.2C12 3.2 6.8 9.4 6.8 13.2a5.2 5.2 0 0 0 10.4 0C17.2 9.4 12 3.2 12 3.2 M9.4 14.4a2.8 2.8 0 0 0 2 3"/>'
            },
            "Rhythm & protocol": {
                color: "#a78bfa",
                glyph: '<path class="icon-glyph" d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17 M12 7.5V12l3.2 2"/>'
            },
            "The body & the evidence": {
                color: "#4ade80",
                glyph: '<path class="icon-glyph" d="M3 12h4.2L9.5 6l4 12 2.3-6H21"/>'
            },
            "Breaking & refeeding": {
                color: "#facc15",
                glyph: '<path class="icon-glyph" d="M9 9.5c-1.2-1.5 1.2-2.3 0-4 M13 9.5c-1.2-1.5 1.2-2.3 0-4 M17 9.5c-1.2-1.5 1.2-2.3 0-4 M3.5 12.5h17a8.5 8.5 0 0 1-17 0"/>'
            },
            "The social table": {
                color: "#fb7185",
                glyph: '<path class="icon-glyph" d="M4 16.5a8 8 0 0 1 16 0 M2.8 19.8h18.4 M12 5.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6 M12 8.2v.6"/>'
            },
            "Interior life & safety": {
                color: "#e2e8f0",
                glyph: '<path class="icon-glyph" d="M12 3l7 2.4v5.8c0 4.6-2.9 7.7-7 9.8-4.1-2.1-7-5.2-7-9.8V5.4z M9 11.8l2.2 2.2 4-4.2"/>'
            },
            /* Flexcapades skin categories: Linguacapades (7). Per-category pictograms; distinct colors and glyphs carry the category identity on the map. */
            "Rules & standards": {
                color: "#c9a86a",
                glyph: '<path class="icon-glyph" d="M6 3.5h12V21H6z M9 8h6 M9 11.5h6 M9.3 16.8l1.7 1.7 3.5-3.9"/>'
            },
            "Dialect & identity": {
                color: "#7fb3e0",
                glyph: '<path class="icon-glyph" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z M8 8.5h8 M8 11.8h5"/>'
            },
            "Language & thought": {
                color: "#b48ede",
                glyph: '<path class="icon-glyph" d="M6.8 5.5C5 7.2 4.2 9.3 4.2 12c0 2.1 1.4 3.5 3.1 3.5 1.7 0 3-1.3 3-3S9 9.7 7.4 9.7c.2-1.3.9-2.4 1.9-3.4z M17.2 5.5C15.4 7.2 14.6 9.3 14.6 12c0 2.1 1.4 3.5 3.1 3.5 1.7 0 3-1.3 3-3s-1.3-2.8-2.9-2.8c.2-1.3.9-2.4 1.9-3.4z"/>'
            },
            "The world's tongues": {
                color: "#5dbb8a",
                glyph: '<path class="icon-glyph" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M3.2 12h17.6 M12 3c2.6 2.5 3.9 5.6 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.6-3.9-9S9.4 5.5 12 3"/>'
            },
            "Writing & script": {
                color: "#e08a5a",
                glyph: '<path class="icon-glyph" d="M5 20.5L12 3.8l7 16.7 M7.4 13.8h9.2 M9.8 20.5h4.4"/>'
            },
            "Words in motion": {
                color: "#e06a8a",
                glyph: '<path class="icon-glyph" d="M3.5 7.5h11.5 M12 3.8l3.7 3.7L12 11.2 M20.5 16.5H9 M12 12.8L8.3 16.5l3.7 3.7"/>'
            },
            "Learning & machines": {
                color: "#8fb8e8",
                glyph: '<path class="icon-glyph" d="M12 5.8L2.8 10.4 12 15l9.2-4.6z M6.6 12.7v4.1c0 1.5 2.4 2.7 5.4 2.7s5.4-1.2 5.4-2.7v-4.1 M21.2 10.4v5.4"/>'
            },
        };

        const me = e => `<path class="icon-glyph" d="${e}"/>`, fe = (e, t, n) => `<circle class="icon-glyph" cx="${e}" cy="${t}" r="${n}"/>`, ye = {
            compass: me("M8 2v12M2 8h12m-4-2-2 2-2 2 2-2Z"),
            checklist: me("M3 3h10v10H3Zm2 3 1 1 2-2m-3 5 1 1 2-2m2-3h2m-2 4h2"),
            key: me("M9 5a3 3 0 1 1-2 5l-4 4m2-2 1 1m1-3 1 1"),
            ring: fe(8, 8, 4) + me("M8 1v3m0 8v3"),
            medal: me("M5 2l3 4 3-4m-6 0h6M8 6l1.5 3 3.5.5-2.5 2.5.5 3-3-1.5L5 15l.5-3-2.5-2.5L6.5 9Z"),
            scale: me("M8 2v12M4 4h8M3 5 1 9h4L3 5Zm10 0-2 9h4l-2-9M5 14h6"),
            hands: me("M2 10c2-2 3-1 4 1l2 2 2-2c1-2 2-3 4-1M4 6v4m3-6v7m5-5v4"),
            stage: me("M2 4h12v9H2Zm0 3h12M5 4l2 3m3-3 2 3"),
            infinity: me("M2 8c2-4 4-4 6 0s4 4 6 0-4-4-6 0-4 4-6 0Z"),
            coil: me("M3 12c0-7 10-8 10-3 0 4-7 4-7 1 0-2 4-3 7-1"),
            bow: me("M8 7C5 2 1 3 3 7c-2 4 2 5 5 1 3 4 7 3 5-1 2-4-2-5-5 0Zm0 1-2 6m2-6 2 6"),
            knot: me("M3 5c3-3 7 3 10 0M3 11c3 3 7-3 10 0M5 3l6 10m0-10L5 13"),
            cuffs: fe(5, 8, 3) + fe(11, 8, 3) + me("M8 8h0"),
            spreader: me("M2 8h12M4 5v6m8-6v6"),
            tape: fe(7, 8, 5) + fe(7, 8, 2) + me("m11 11 3 3"),
            mouth: me("M2 8c3-3 9-3 12 0-3 4-9 4-12 0Zm3 0h6"),
            cocoon: me("M8 1c4 3 4 11 0 14-4-3-4-11 0-14Zm-3 4 6 2m-6 2 6 2"),
            chair: me("M4 2v7h8V5m-8 4v5m8-5v5M3 12h10"),
            blindfold: me("M2 6c4-2 8-2 12 0v4c-4 2-8 2-12 0Zm2 2h2m4 0h2"),
            lock: me("M4 7h8v7H4Zm2 0V5a2 2 0 0 1 4 0v2m-2 3v1.5"),
            hand: me("M4 8V4m2 4V2m2 6V3m2 5V5m0 1c3-2 4 0 2 3l-2 4H6c-2-1-3-3-3-5V6"),
            paddle: me("M3 3c2-2 6 2 4 4l-2 2Zm3 5 7 6"),
            tassel: me("M4 2c7 2 7 6 2 7m0 0 1 5m0-5 3 5m-4-5-2 5"),
            cane: me("M11 4c0-3 4-3 4 0M11 4 5 14"),
            crop: me("M3 13 11 5m0 0 2-3 2 2-3 2m-8 4 2 2m-3 1c-2-1-2-3 0-3"),
            lash: me("M3 3c8 1 11 6 4 11m0 0 1-4m-1 4 4-1"),
            clamp: me("M3 4h3l2 4 2-4h3M5 4v8m6-8v8M3 12h3m4 0h3"),
            claw: me("M3 4c0 5 2 7 3 9M8 3c-1 5 0 7 1 10m4-9c-2 4-2 6-1 9"),
            comb: me("M3 3h10v4H3Zm2 4v6m2-6v5m2-5v6m2-6v5"),
            needle: me("M3 13 12 4m0 0 2-2m-2 2 2 2M4 11l2 2"),
            target: fe(8, 8, 5) + fe(8, 8, 2) + me("M8 1v2m0 10v2"),
            shield: me("M8 2 13 4v4c0 3-2 5-5 6-3-1-5-3-5-6V4Zm-2 6 2 2 3-4"),
            flame: me("M8 14c-4-2-4-6-1-9 0 3 2 2 2-3 4 4 5 8-1 12Zm0 0c-2-1-2-3 0-5 2 2 2 4 0 5"),
            snow: me("M8 1v14M2 4l12 8M14 4 2 12M5 2l3 2 3-2m-6 12 3-2 3 2"),
            feather: me("M3 14C3 7 7 2 14 2c0 7-5 11-11 12Zm2-3 6-6M5 8h4m-2 2v-4"),
            bolt: me("M9 1 4 9h4l-1 6 5-8H8Z"),
            stripes: me("M2 4h12M2 8h12M2 12h12m-9-9v2m3 2v2m3 2v2"),
            muted: me("M3 6h3l3-3v10l-3-3H3Zm8 0 3 4m0-4-3 4"),
            burst: me("M8 1v4m0 6v4M1 8h4m6 0h4M3 3l3 3m4 4 3 3m0-10-3 3M6 10l-3 3"),
            whisper: me("M2 5c4-3 8-3 12 0M4 8c3-2 5-2 8 0m-6 3h4"),
            note: me("M6 3v8m0-6 7-2v7M3 13a3 2 0 1 0 3-2m4 1a3 2 0 1 0 3-2"),
            mirror: me("M4 2h8v11H4Zm2 3 4-1m-4 4 4-1M8 13v2"),
            moon: me("M11 2a6 6 0 1 0 3 10 6 6 0 0 1-3-10Z"),
            perfume: me("M6 2h4v3H6Zm-2 5h8v7H4Zm5 2c2 0 3 1 3 2"),
            energy: me("M8 1v14M5 4c0-2 6-2 6 0s-6 2-6 4 6 2 6 4-6 2-6 4") + fe(8, 4, 1) + fe(8, 8, 1) + fe(8, 12, 1),
            badge: me("M8 2 10 5l4 1-2 3 .5 4-4-.5L5 14l-1-4-2-3 4-2Z"),
            cradle: me("M3 7c1 5 9 5 10 0M2 7h12M5 12l-1 2m7-2 1 2"),
            clock: fe(8, 8, 5) + me("M8 5v3l2 2"),
            paw: me("M5 7C3 7 2.5 4.5 4 4s2.5 1 2.5 2.5m4.5.5c2 0 2.5-2.5 1-3s-2.5 1-2.5 2.5M8 6.5c-1.5 0-3.5 3.2-3.5 5 0 1.5 1.5 2 3.5.5 2 1.5 3.5 1 3.5-.5 0-1.8-2-5-3.5-5Z"),
            horse: me("M4 13V6l4-4 4 3-1 8H7m-3-7L2 3m10 2 2-2M7 7h1"),
            dog: me("M4 5 2 2v7c0 4 3 5 6 5s6-1 6-5V2l-2 3M6 8h0m4 0h0m-4 3h4"),
            house: me("M2 8 8 2l6 6v6H9v-4H7v4H2Z"),
            cross: me("M6 2h4v4h4v4h-4v4H6v-4H2V6h4Z"),
            book: me("M2 3h5c1 0 1 1 1 2v9c0-1-1-2-2-2H2Zm12 0H9c-1 0-1 1-1 2v9c0-1 1-2 2-2h4Z"),
            cage: me("M3 3h10v11H3Zm3 0v11m4-11v11M2 6h12"),
            consent: me("M3 9l3 3 7-8M2 4h5m4 8h3"),
            horns: me("M3 3c0 4 2 6 5 6s5-2 5-6m-9 9c2 2 6 2 8 0M6 7 4 4m6 3 2-3"),
            fangs: me("M3 5c3 2 7 2 10 0l-2 8-3-3-3 3Z"),
            scroll: me("M4 2h8v12H4c-3 0-3-4 0-4h8M5 5h5M5 8h4"),
            hide: me("M3 4 6 2l2 2 2-2 3 2-1 4 1 4-4 2-2-2-4 2-2-4 1-4Z"),
            droplet: me("M8 2S4 7 4 10a4 4 0 0 0 8 0c0-3-4-8-4-8Z"),
            stocking: me("M6 2h5v7c0 3-2 5-5 5H3v-3h3Z"),
            uniform: me("M4 3 7 2l1 3 1-3 3 1 2 3-2 2v6H4V8L2 6Z"),
            heel: me("M3 3h6c0 5 2 7 5 8v3H8v-2H3Z"),
            hood: me("M8 2c4 1 6 5 5 11H3C2 7 4 3 8 2Zm-3 7h2m2 0h2"),
            harness: me("M3 3l10 10M13 3 3 13M4 8h8M8 4v8"),
            diaper: me("M3 4h10l-2 9H5Zm0 2 4 3m6-3-4 3"),
            fork: me("M4 2v5m2-5v5M4 5h2v9m5-12v12m0-5h3"),
            fur: me("M2 12 5 3l2 5 2-6 2 6 3-5-1 10Z"),
            beads: me("M2 8c3-6 9-6 12 0") + fe(4, 6, 1) + fe(8, 4, 1) + fe(12, 6, 1) + fe(8, 12, 1),
            pump: me("M3 13V6h7v7M5 6V3h3v3m2 2 3-3m0 0v5m0 0 2 2"),
            shower: me("M3 6c0-4 6-4 6 0m0 0h4M7 9v1m3-1v2m3-2v1M6 13v1m4-1v1"),
            hanger: me("M6 3.5a2 2 0 1 1 3.5 1.3L9 5.5 14 9H2l5-3.5M2 9v2.5h12V9"),
            foot: me("M5 14c-3-2-1-7 1-9 2-3 5-1 4 2-1 4 4 4 3 6-2 2-6 2-8 1"),
            glove: me("M4 9V4m2 5V2m2 7V3m2 6V4m0 2c3-2 4 1 2 3l-2 4H6c-2-1-3-2-3-4"),
            chest: fe(6, 8, 3) + fe(10, 8, 3) + me("M3 12c3 2 7 2 10 0"),
            curves: me("M4 3c5 0 3 10 8 10M12 3C7 3 9 13 4 13"),
            resize: me("M2 5V2h3M2 2l4 4m8-1V2h-3m3 0-4 4M2 11v3h3m-3 0 4-4m8 1v3h-3m3 0-4-4"),
            muscle: me("M4 10c2-4 2-6 4-7v4c3-2 6 0 6 3 0 4-4 5-8 4-3-1-4-3-2-4Z"),
            tattoo: me("M8 3c5 0 5 8 0 8-4 0-4-5-1-5 3 0 3 8-3 8"),
            belly: me("M8 2c4 3 5 9 2 12M8 2C4 5 3 11 6 14M5 9h6"),
            star: me("M8 2l1.8 3.8L14 7l-3 2.8.8 4.2L8 12l-3.8 2 .8-4.2L2 7l4.2-1.2Z"),
            downTalk: me("M2 3h12v8H8l-3 3v-3H2Zm3 3h6M5 8h4"),
            shards: me("M8 2 6 7 2 8l4 2-1 4 3-2 3 2-1-4 4-2-4-1Z"),
            speech: me("M2 3h12v8H7l-3.5 2v-2H2Zm3 3h6m-6 2h4"),
            cube: me("m8 2 5 3v6l-5 3-5-3V5Zm-5 3 5 3 5-3M8 8v6"),
            pendulum: me("M3 2h10M8 2v5") + fe(8, 10, 3),
            eye: me("M1 8C4 4 12 4 15 8C12 12 4 12 1 8Z") + fe(8, 8, 1.6),
            question: me("M5 5c0-4 7-4 7 0 0 3-4 2-4 5m0 3h0"),
            hourglass: me("M4 2h8M4 14h8M5 2c0 4 2 4 3 6-1 2-3 2-3 6m6-12c0 4-2 4-3 6 1 2 3 2 3 6"),
            keyhole: fe(8, 6, 3) + me("m7 9-1 5h4L9 9"),
            watch: me("M2 8C5 4 11 4 16 8C11 12 5 12 2 8Zm7-4v8"),
            partnerEye: me("M1 7C4 4 12 4 15 7C12 10 4 10 1 7Z") + fe(8, 7, 1.5) + me("M5 13h6"),
            camera: me("M2 5h3l1-2h4l1 2h3v8H2Z") + fe(8, 9, 2.3),
            video: me("M2 4h9v8H2Zm9 3 3-2v6l-3-2Z"),
            spotlight: me("M6 2h4l2 5-4 7-4-7Zm-2 5h8M2 14h12"),
            tree: me("M8 2 3 9h3l-2 3h4v3h2v-3h3l-2-3h2Z"),
            pin: me("M8 14S4 9 4 6a4 4 0 0 1 8 0c0 3-4 8-4 8Z") + fe(8, 6, 1.5),
            curtains: me("M2 2h12M4 3c0 6-2 9-2 11h4V3m6 0c0 6 2 9 2 11h-4V3"),
            binocular: me("M3 5h3l1 3v4H2Zm10 0h-3L9 8v4h5ZM7 8h2"),
            split: me("M8 14 3 9c-4-4 2-8 5-4 3-4 9 0 5 4Zm0-9v9"),
            trio: me("M3 13v-2a3 3 0 0 1 6 0v2m-3-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4m4 6v-2a3 3 0 0 1 4-3m-2-2a2 2 0 1 0 0-4"),
            crowd: me("M2 13c0-4 3-5 6-3 3-2 6-1 6 3M4 7a2 2 0 1 1 0-4m4 5a2 2 0 1 1 0-4m4 3a2 2 0 1 1 0-4"),
            swap: me("M2 5h9m0 0L9 3m2 2L9 7m5 4H5m0 0 2-2m-2 2 2 2"),
            stag: me("M4 13V6L2 3m2 3 3-3m5 10V6l2-3m-2 3-3-3M6 9h4"),
            triangle: me("M8 2 14 13H2Zm0 3v5m0 2h0"),
            knot3: fe(8, 5, 3) + fe(5, 10, 3) + fe(11, 10, 3),
            tray: me("M2 11h12M4 11c0-5 8-5 8 0M8 4V2m-5 12h10"),
            many: me("M2 13c0-3 2-4 4-4s4 1 4 4m0 0c0-3 2-4 4-4M6 7a2 2 0 1 0 0-4m6 4a2 2 0 1 0 0-4"),
            homeHeart: me("M2 8 8 2l6 6v6H2Z M8 12S5 10 5 8c0-2 2-2 3-1 1-1 3-1 3 1 0 2-3 4-3 4Z"),
            finger: me("M6 13V5c0-2 3-2 3 0v4l2-1c2 0 3 2 2 4l-2 2H8Z"),
            tongue: me("M3 6c3 3 7 3 10 0M6 9v2c0 4 5 4 5 0V9"),
            cream: me("M3 12c0-3 2-4 4-4-1-3 4-5 4-1 3 1 3 5 0 6Z"),
            arrowMouth: me("M2 8c3-3 7-3 10 0-3 3-7 3-10 0Zm8-5 4 5-4 5"),
            splash: me("M8 2v4m-5 1 3 2m7-2-3 2M5 13c1-3 5-3 6 0"),
            mouthHand: me("M2 6c3-2 7-2 10 0-3 3-7 3-10 0m10 6c2-3 4-2 3 1l-1 2"),
            fist: me("M4 9V5m2 4V3m2 6V4m2 5V5m0 1c3-1 4 1 2 4l-2 4H6L3 10"),
            fistLock: me("M3 8h10v6H3Zm2 0V6a3 3 0 0 1 6 0v2M8 11h0"),
            handMotion: me("M3 12c2-5 5-7 9-8m-1-2 2 2-2 2M4 8l2 2-2 2"),
            strap: me("M3 4h10v3H3Zm2 3v7m6-7v7"),
            patHeart: me("M8 14S3 11 3 7c0-3 4-4 5-1 1-3 5-2 5 1 0 4-5 7-5 7Zm-6-1 4-3"),
            spray: me("M4 12c2-5 6-5 8 0M8 2v3M3 4l2 2m8-2-2 2"),
            enter: me("M3 3h7v3h3v4h-3v3H3Zm2 5h6M8 6l3 2-3 2"),
            dial: fe(8, 8, 5) + me("M8 8l3-3M8 2v2m4 1 1-1"),
            barred: me("M3 2h10v12H3Zm0 4h10m-7-4v12m4-12v12"),
            edge: me("M2 11c3-6 9-6 12 0M4 8v4m4-6v6m4-4v4"),
            lure: me("M2 5c4-3 8-3 12 0M5 8c2-2 4-2 6 0M8 10v4"),
            seed: me("M8 14V8c0-4 4-5 6-5 0 4-2 6-6 5C4 8 2 6 2 3c4 0 6 2 6 5"),
            egg: me("M8 2c3 0 5 6 5 9 0 4-10 4-10 0 0-3 2-9 5-9Z"),
            water: me("M2 10c2-3 4 3 6 0s4 3 6 0M8 2S5 6 5 8"),
            drops: me("M5 3S2 7 2 9a3 3 0 0 0 6 0c0-2-3-6-3-6Zm7 4s-2 3-2 4a2 2 0 0 0 4 0c0-1-2-4-2-4Z"),
            bowl: me("M2 8h12c0 4-3 6-6 6s-6-2-6-6Zm3-3c1-2 2 2 3 0s2 2 3 0"),
            bowArrow: me("M3 2c5 3 5 9 0 12M4 8h10m-3-3 3 3-3 3"),
            chase: me("M2 11c3-6 7-6 12 0M3 5h3m2-2h3m1 2h2"),
            wrestle: me("M5 5a2 2 0 1 0 0-4m6 4a2 2 0 1 0 0-4M2 14l3-6 3 3 3-3 3 6M5 8l3-2 3 2"),
            calendar: me("M3 3h10v11H3Zm0 4h10M5 1v4m6-4v4M6 10l2 2 3-3"),
            candle: me("M5 6h6v8H5Zm3-5c2 2 2 3 0 5-2-2-2-3 0-5"),
            lotus: me("M8 13c-4-1-6-4-6-7 3 0 5 1 6 4 1-3 3-6 6-7 1 4 0 7-3 9 2-1 4-1 6 0-1 4-4 7-9 7Z"),
            rose: me("M8 8c-5-1-4-6 0-5 4-1 5 4 0 5Zm0 0v6m0-3-3-1m3 2 3-2"),
            stranger: me("M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 14c0-4 10-4 10 0M4 6h8"),
            ufo: me("M3 8c1-4 9-4 10 0m-11 0h12c0 4-12 4-12 0M6 5c0-3 4-3 4 0"),
            swapBody: me("M4 4h8m0 0-2-2m2 2-2 2M12 12H4m0 0 2-2m-2 2 2 2M5 7v2m6-2v2"),
            ribbon: me("M5 2h6v5l-3 2-3-2Zm1 6-2 6 4-2 4 2-2-6"),
            hug: me("M5 6a2 2 0 1 0 0-4m6 4a2 2 0 1 0 0-4M2 13c1-5 4-6 6-2 2-4 5-3 6 2M4 8l4 4 4-4"),
            cloud: me("M4 12c-4 0-3-6 1-6 1-5 8-4 8 1 4 0 4 5 0 5Z"),
            chat: me("M2 3h12v8H7l-3.5 2v-2H2Zm3 3h6m-6 2h4"),
            cup: me("M3 5h8v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Zm8 1h2c2 0 2 4 0 4h-2"),
            bed: me("M2 6h12v7M3 13V4h4v4h7M3 9h11"),
            standing: me("M6 3a2 2 0 1 0 0-2m5 2a2 2 0 1 0 0-2M6 5v5l-2 4m2-4 2 4m3-9v5l-2 4m2-4 2 4M7 7h3"),
            heart: me("M14 5.5c0 4-6 7.5-6 7.5S2 9.5 2 5.5a3 3 0 0 1 5-2L8 4l1-1a3 3 0 0 1 5 2.5Z"),
            arrows: me("M2 5h9m0 0L9 3m2 2L9 7m3 4H5m0 0 2-2m-2 2 2 2")
        };

        window.__SX_EXPORT_BE = {
"Power exchange": [ "compass", "checklist", "ring", "medal", "scale", "hands", "stage", "infinity" ],
            "Bondage & restriction": [ "coil", "bow", "knot", "cuffs", "spreader", "tape", "mouth", "cocoon", "chair", "blindfold", "key", "lock" ],
            "Impact, pain & body modification": [ "hand", "paddle", "tassel", "cane", "crop", "lash", "clamp", "claw", "comb", "needle", "target", "shield" ],
            "Sensation & atmosphere": [ "flame", "snow", "feather", "bolt", "stripes", "muted", "burst", "whisper", "note", "mirror", "moon", "perfume", "energy" ],
            "Roleplay & identity": [ "badge", "cradle", "clock", "paw", "horse", "dog", "house", "cross", "book", "cage", "consent", "horns", "fangs", "scroll" ],
            "Clothing, materials & objects": [ "hide", "droplet", "stocking", "uniform", "heel", "hood", "harness", "diaper", "fork", "fur", "beads", "pump", "shower", "ribbon" ],
            "Body focus & appearance": [ "foot", "glove", "comb", "chest", "curves", "hands", "resize", "muscle", "tattoo", "belly" ],
            "Psychological dynamics": [ "star", "downTalk", "shards", "speech", "cube", "pendulum", "eye", "question", "hourglass", "keyhole" ],
            "Watching, exposure & settings": [ "watch", "camera", "spotlight", "tree", "curtains" ],
            "Partner configurations": [ "trio", "crowd", "swap", "stag", "knot3", "tray", "many", "clock" ],
            "Sex acts": [ "finger", "tongue", "cream", "arrowMouth", "chair", "splash", "mouthHand", "fist", "fistLock", "handMotion", "strap", "spray", "glove", "ring", "mouth", "enter" ],
            Positions: [ "knot3", "horse", "dog", "bed", "swap", "hug", "standing" ],
            "Orgasm & reproductive play": [ "dial", "barred", "lock", "edge", "lure", "seed", "cradle", "egg" ],
            "Fluids & messy play": [ "water", "cradle", "target", "drops" ],
            "Primal & pursuit": [ "bowArrow", "chase", "wrestle", "claw" ],
            "Service & ritual": [ "hands", "house", "checklist", "comb", "hanger", "key", "calendar", "candle", "lotus" ],
            "Fantasy & transformation": [ "heart", "rose", "stranger", "keyhole", "horns", "ufo", "resize", "swapBody", "paw", "arrows", "hanger", "ribbon", "star" ],
            "Connection & aftercare": [ "chat", "hug", "cup", "cloud", "star", "checklist", "moon", "calendar" ]
        };

const we = {
            "Power exchange": "crown",
            "Bondage & restriction": "chain links",
            "Impact, pain & body modification": "paddle",
            "Sensation & atmosphere": "wave",
            "Roleplay & identity": "mask",
            "Clothing, materials & objects": "hanger",
            "Body focus & appearance": "person",
            "Psychological dynamics": "brain",
            "Watching, exposure & settings": "eye",
            "Partner configurations": "two people",
            "Sex acts": "heart",
            Positions: "opposing arrows",
            "Orgasm & reproductive play": "burst",
            "Fluids & messy play": "droplet",
            "Primal & pursuit": "paw",
            "Service & ritual": "service bell",
            "Fantasy & transformation": "wand and spark",
            "Connection & aftercare": "heart and pulse"
        }, ke = {
            downTalk: "speech bubble",
            partnerEye: "eye and partner",
            arrowMouth: "arrow and mouth",
            mouthHand: "mouth and hand",
            fistLock: "locked fist",
            handMotion: "moving hand",
            patHeart: "hand and heart",
            bowArrow: "bow and arrow",
            homeHeart: "home and heart",
            swapBody: "swapping figures",
            knot3: "three linked circles",
            many: "group of people",
            cream: "cream swirl",
            enter: "entering arrow",
            barred: "barred frame",
            edge: "rising arcs",
            lure: "rippled lines",
            seed: "sprouting seed",
            drops: "two droplets",
            watch: "watching eye",
            hide: "animal hide",
            curves: "body curves",
            resize: "expanding arrows",
            downTalk: "speech bubble",
            keyhole: "keyhole",
            split: "split heart",
            cradle: "cradle",
            standing: "two standing figures",
            arrows: "crossing arrows",
            energy: "energy flow",
            lotus: "lotus"
        };

const Se = {
            black: "black",
            darkBlue: "dark blue",
            lightBlue: "light blue",
            red: "red",
            grey: "gray",
            yellow: "yellow",
            brown: "brown",
            purple: "purple",
            orange: "orange",
            white: "white",
            pink: "pink",
            green: "green",
            hunterGreen: "hunter green",
            neutral: "neutral gray",
            noCode: "dark charcoal"
        };

const Ee = Object.freeze({
            Materials: "stripes",
            Footwear: "heel",
            "Uniforms & costumes": "uniform",
            "Lingerie & hosiery": "stocking",
            Undergarments: "ribbon",
            "Masks & headwear": "hood",
            "Objects/toys": "beads",
            "Hand spanking": "hand",
            "Flexible implements": "tassel",
            "Rigid implements": "paddle",
            "Clamps & pinching": "clamp",
            "Cutting & piercing": "needle",
            "Genital pain": "target",
            Extreme: "flame",
            "Head hair": "comb",
            "Facial & body hair": "fur",
            "Lower body": "foot",
            Torso: "chest",
            Face: "mirror",
            "Body type": "curves",
            Worship: "hands",
            "Caregiver & little roles": "cradle",
            Authority: "badge",
            Captivity: "cage",
            Animal: "paw",
            "Historical & fantasy": "scroll",
            "Flexible ties": "coil",
            Restraints: "cuffs",
            "Tape & wrapping": "tape",
            Sensory: "blindfold",
            Confinement: "cocoon",
            "Challenge bondage": "hourglass",
            Specialty: "harness",
            Oral: "mouth",
            Anal: "ring",
            Manual: "finger",
            Insertion: "enter",
            Fluids: "droplet",
            Humiliation: "downTalk",
            Intimidation: "horns",
            "Mind control": "pendulum",
            Emotional: "heart",
            Vulnerability: "keyhole",
            Verbal: "speech"
        });

const Ce = {
            black: {
                color: "#111514",
                labelStroke: "#dce1dd"
            },
            darkBlue: {
                color: "#2f6fd3",
                labelStroke: "#18202b"
            },
            lightBlue: {
                color: "#69bdf0",
                labelStroke: "#17242c"
            },
            red: {
                color: "#e55252",
                labelStroke: "#2b1718"
            },
            grey: {
                color: "#929a96",
                labelStroke: "#1c211e"
            },
            yellow: {
                color: "#f0cf3f",
                labelStroke: "#2e2812"
            },
            brown: {
                color: "#a86a3e",
                labelStroke: "#251a14"
            },
            purple: {
                color: "#ad62d4",
                labelStroke: "#241629"
            },
            orange: {
                color: "#ed8a2c",
                labelStroke: "#2a1d12"
            },
            white: {
                color: "#f2f0e8",
                labelStroke: "#242925"
            },
            pink: {
                color: "#ed7db7",
                labelStroke: "#2a1822"
            },
            green: {
                color: "#4cba73",
                labelStroke: "#17261d"
            },
            hunterGreen: {
                color: "#28734d",
                labelStroke: "#d9e1dc"
            },
            neutral: {
                color: "#aeb5b0",
                labelStroke: "#1b201d"
            }
        }, Me = {
            "Power exchange": "hunterGreen",
            "Bondage & restriction": "grey",
            "Impact, pain & body modification": "black",
            "Service & ritual": "green"
        }, Ie = new Map;
        Object.entries({
            black: [ "Temperature", "Electrical Play", "Sensory overload", "Consensual non-consent fantasy", "Fear Play", "Interrogation", "Blood play", "Wrestling", "Biting & scratching" ],
            darkBlue: [ "Anal beads", "Anal fingering", "Rimming", "Anal sex" ],
            lightBlue: [ "Facefucking", "Facesitting", "Facials", "Fingering mouths", "Oral sex" ],
            red: [ "Vaginal fisting", "Anal fisting" ],
            grey: [ "Sensory deprivation", "Captivity / kidnapping" ],
            yellow: [ "Watersports" ],
            brown: [],
            purple: [ "Needle Play", "Body Modification" ],
            orange: [ "Penetration" ],
            white: [ "Handjobs" ],
            pink: [ "Pumps", "Pegging" ],
            green: [ "Group service", "Spiritual play" ],
            hunterGreen: [ "Authority roles", "Caregiver roles (adults)", "Age play between adults", "Pet play", "Pony Play", "Puppy play", "Owner & property", "Doctor/Nurse Play", "Teacher / student roleplay", "Hunter / prey" ],
            neutral: [ "Tantra / energy play" ]
        }).forEach(([e, t]) => t.forEach(t => Ie.set(t, e)));
        const Pe = {
            key: "noCode",
            color: "#232726",
            lineColor: "#78817e",
            labelColor: "#aeb5b0",
            labelStroke: "#1b201d"
        };

        const We = {
"cat-power-exchange": [ "dom", "sub" ],
            "cat-bondage-restriction": [ "restrains", "restrained" ],
            "cat-impact-pain-body-modification": [ "applies", "receives" ],
            "cat-sensation-atmosphere": [ "stimulates", "experiences" ],
            "cat-roleplay-identity": [ "leads", "follows" ],
            "cat-clothing-materials-objects": [ "admires", "wears / uses" ],
            "cat-body-focus-appearance": [ "displays", "admires" ],
            "cat-psychological-dynamics": [ "influences", "experiences" ],
            "cat-watching-exposure-settings": [ "watches", "is watched" ],
            "cat-partner-configurations": [ "arranges", "joins" ],
            "cat-sex-acts": [ "performs", "receives" ],
            "cat-positions": [ "initiates", "joins" ],
            "cat-orgasm-reproductive-play": [ "controls", "is controlled" ],
            "cat-fluids-messy-play": [ "releases / uses", "receives" ],
            "cat-primal-pursuit": [ "hunter", "prey" ],
            "cat-service-ritual": [ "serves", "is served" ],
            "cat-fantasy-transformation": [ "transforms", "is transformed" ],
            "cat-connection-aftercare": [ "cares", "is cared for" ],
            "t0006": [ "grants", "begs" ],
            "t0003": [ "wears", "admires" ],
            "topic-gangbang-fantasy": [ "fucks in group", "is fucked by group" ],
            "t0045": [ "captures", "escapes" ],
            "t0097": [ "pushes", "endures" ],
            "t0127": [ "authority", "subordinate" ],
            "topic-caregiver-roles-adults": [ "caregiver", "little" ],
            "topic-age-play-between-adults": [ "plays older", "plays younger" ],
            "topic-pet-play": [ "handler", "pet" ],
            "topic-pony-play": [ "trainer", "pony" ],
            "topic-puppy-play": [ "handler", "pup" ],
            "t0131": [ "owner", "property" ],
            "topic-doctor-nurse-play": [ "clinician", "patient" ],
            "topic-teacher-student-roleplay": [ "teacher", "student" ],
            "topic-captivity-kidnapping": [ "captures", "is captured" ],
            "topic-consensual-non-consent-fantasy": [ "overpowers", "is overpowered" ],
            "t0153": [ "wears", "admires" ],
            "t0152": [ "wears", "admires" ],
            "t0181": [ "wears", "admires" ],
            "t0176": [ "wears", "admires" ],
            "t0166": [ "wears", "admires" ],
            "topic-masks-hoods": [ "admires", "wears" ],
            "t0196": [ "wears", "admires" ],
            "t0185": [ "admires", "wears" ],
            "t0162": [ "admires", "wears" ],
            "t0236": [ "is modified", "admires" ],
            "t0237": [ "worships", "is worshipped" ],
            "t0220": [ "worships", "is worshipped" ],
            "topic-feet-footwear": [ "worships", "is worshipped" ],
            "t0222": [ "adores", "is adored" ],
            "t0234": [ "plays big", "plays small" ],
            "t0266": [ "watches", "is watched" ],
            "t0270": [ "exhibits", "watches" ],
            "t0316": [ "makes squirt", "squirts" ],
            "t0328": [ "locks", "is locked" ],
            "t0332": [ "surrogate", "parent" ],
            "t0351": [ "hunter", "prey" ],
            "t0352": [ "chase (be the chaser)", "be chased" ],
            "t0353": [ "wrestle down", "be wrestled down" ],
            "t0354": [ "bite & scratch", "be bitten & scratched" ],
            "t0381": [ "big", "small" ],
            "t0385": [ "wears", "admires" ],
            "t0375": [ "accepts", "surrenders" ]
        };
        const SX_SUBSUMED_BASE_TOPIC_IDS = {
            "FemDom": "t0009", "D/s": "t0010", "Brats": "t0012", "Switching": "t0014", "Male Authority": "t0015",
            "Ongoing dynamics": "t0008", "24/7": "t0013", "Romantic surrender": "t0375",
            "Hotwife": "t0288",
            "Rope bondage": "t0022", "Cuffs": "t0025", "Bondage tape": "t0029", "Mummification": "t0032", "Tape": "t0033",
            "Blindfold": "t0034", "Caging": "t0037", "Encasement": "t0038", "Sleepsacks": "t0039", "Immobilization": "t0040",
            "Suspension Bondage": "t0043", "Bondage art": "t0050", "Texture contrast": "t0102", "Sensory deprivation": "t0103",
            "Sensory overload": "t0104", "ASMR & whispering": "t0105", "Scent": "t0109", "Hands": "t0201",
            "Hands & gloves": "t0202", "Feet": "t0213", "Buttocks": "t0218", "Breasts": "t0220", "Pregnancy focus": "t0222",
            "Hair": "t0203", "Long Hair": "t0204", "Facial Hair": "t0208", "Beards": "t0209", "Body Hair": "t0210", "Pubic Hair": "t0211", "Muscles": "t0231"
        };
