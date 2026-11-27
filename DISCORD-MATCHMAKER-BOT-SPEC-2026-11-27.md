# Discord Matchmaker Bot — Spec v1

> **DISTANT FUTURE BUILD — DO NOT BUILD YET.**
> This is a design document, not queued work. The bot is NOT to be built until the trigger condition is met: a critical mass of people are already waving profiles by hand in `#wave-your-profile`, and matching them by hand has become tedious. Until then, the work is community-building (getting people to wave), not engineering. Do not pick this up as queued work, and do not start building on the strength of this document alone. When the trigger is met, Jason will say so — the build starts on his word, not on this spec's existence.

**Date:** 2026-11-27
**Status:** Draft. Tier model RULED (Jason, 2026-11-27 ~08:23). Double protection RULED IN (Jason, 2026-11-27 ~08:28). Nothing built — the bot waits until there's a critical mass of people waving profiles by hand in #wave-your-profile (see §1, Sequencing).
**Decisions already made:** Railway hosts it. The bot stores waved profiles (people won't be online at the same time, so storage is needed). The match and the conversation happen in Discord — that's why it's a bot, not a page on the site. Free to wave; receiving matches is a patron benefit (Capade Compadre and up); `/matches` is open to all but tiered by output; match notifications default ON for free users with an opt-out toggle. The wave format is `.hypermap` (JSON content); the PNG is optional alongside it; SVGZ is not the wave format.

---

## 1. What it does

The bot collects the profiles members wave in the capades.io Discord server, runs the engine's pair operations on them, and turns the results into matches and discussion prompts — in the same place people talk.

- **Matches:** for any member, their top matches across the stored profiles — "your people" (Cross, shared appetite) and "your sparring partners" (Circle Minus, debate).
- **Discussion prompts:** the room's fault lines and shared ground, posted as prompts to talk about — Circle Minus finds what the room disagrees on, Cross finds what it agrees on.
- **The point:** a match with nowhere to talk is just a list. In Discord, the match and the conversation are in the same room.

## 2. Privacy model

This is the part the whole design hangs on. The earlier "no storage" idea is superseded — storage is needed because waving is asynchronous. Privacy is handled by consent and control, not by avoiding storage.

- **The bot stores only what people explicitly wave.** Nothing else. No DMs, no message content, no browsing. A profile enters the store only when its owner waves it.
- **Waving is the consent.** When you wave your profile, you are consenting to the bot storing it for matching. The bot says so in plain words when you wave.
- **You can take it back.** `/unwave` (forget-me) deletes your stored profile, immediately and completely. No record kept.
- **The bot never shares a full profile.** It shares match results — scores and which topics — and only as the person directs (DM or channel). Nobody sees your map unless you show it yourself.
- **Sexcapades profiles stay in the 18+ context.** The bot only accepts Sexcapades profiles waved in the age-gated #sexcapades channel (or by DM from a member of it). Every other skin is open.
- **Free wavers are told at wave time** that their profile is in the pool the paying members match against. That's informed consent, not a surprise — contributing to the pool is the deal for waving free.
- **Match notifications default ON for free users** (see `/matchnotifications` in §4). When someone matches with you, you get a shoulder tap — "someone matched with you" — unless you've toggled it off. The default is provisional: if the idea takes off and notifications get frequent, the default may change (likely to off / opt-in).
- **The store holds one row per waved profile:** Discord user ID, display name, skin, the profile ratings, and when it was waved. That's all.

## 3. How profiles get in

- **`/wave`** (slash command). You attach or paste your profile — the export the app produces, or the sync-card link — and name the skin. The bot checks it parses as a real profile for that skin, then stores it. If you wave again, it replaces your old one for that skin. One stored profile per person per skin.
- **`#wave-your-profile` channel.** The bot watches it. When someone posts a profile link or file there, the bot offers to store it (or stores it and confirms). Posting in that channel is waving.
- **Wave format: `.hypermap` (JSON content, the app's profile file).** The person waves the `.hypermap` file the app exports — it IS the profile payload as JSON, with a `.hypermap` extension. Discord treats it as a file attachment and stores it byte-for-byte. The bot downloads the attachment and reads it with JSON.parse. The app exports it (a 'Download .hypermap' option — queue item 42) and re-imports it (detected by the `.hypermap` extension, parsed as JSON, same as `.json`). The content is JSON; the extension is a label, not a new binary format.
- **PNG is OPTIONAL alongside the wave.** A waver may add the PNG of their map alongside the `.hypermap` if they want to show it to the room — Discord renders the PNG inline, so the channel stays visual. The PNG is not required and the bot does not read it for matching. (The PNG's embedded data chunk is best-effort only — Discord may strip it — so the PNG is a visual, not a data carrier.)
- **SVGZ is NOT the wave format.** SVGZ can contain scripts, and waving it asks other users to download and open each other's files — a stored-XSS vector. The app still exports and imports SVGZ (its import is safe), and it remains a viewing/backup format, but it is not how profiles are waved. `.hypermap` supersedes it for sharing/waving (Jason, 2026-11-27).
- **Sync-card QR as a fallback.** The QR sync card carries the profile payload too; the bot reads it if that's what's waved.

## 4. Commands

- **`/wave`** — store or update your profile for a skin. Attach the app's `.hypermap` file (preferred — see §3). A PNG may be added alongside it for the visual. Sync-card links accepted as a fallback. SVGZ is not accepted as a wave format. (See §3.)
- **`/unwave`** — delete your stored profile. Immediate, complete, confirmed back to you.
- **`/matches`** — open to all, tiered by output. The bot computes your matches against the whole pool either way. **Paid tier (Capade Compadre and up):** your top matches with topics — who, and what you most share (Cross) or most disagree on (Circle Minus). **Free tier:** just the NUMBER of matches — "you have N matches" — with an upgrade nudge to see who they are. A teaser, not the matches themselves. Delivered as a DM (or an ephemeral reply only you see).
- **`/matchnotifications`** (name TBD) — toggles your match notifications on/off. **Default ON.** When someone's match list includes you, you get a shoulder tap ("someone matched with you") unless you've turned it off. Turn it off if you start getting a lot. The default is provisional — if the idea takes off and notifications get frequent, the default may change (likely to off / opt-in).
- **`/room`** — run the group operation on everyone currently online (or all stored profiles) and post the room's shared ground (Cross) and top debates (Circle Minus) as discussion prompts in the channel. Circle Minus is for indaba — a meeting to talk it out — so the prompts are framed as things to discuss, not fights to win.
- **`/debate`** — the top debate topics across all stored profiles (Circle Minus), as discussion prompts. Same framing as `/room`, but across the whole server instead of just who's online.
- **`/find <topic>`** (nice-to-have, v1 or later) — who shares your stance on one topic? Names the people, not their ratings.

## 5. Matching logic

- **Pairwise, using the engine's own operations.** Cross (shared appetite), Straight (direct match), Circle Minus (debate). The bot runs them on every pair of stored profiles for a skin, then ranks.
- **The scoring code is the app's code.** The pair operations live in the app's JavaScript (the data bundle / modules). The bot reuses them — ported to Node, or the same functions extracted — rather than re-implementing the math. This is the biggest single build item: getting the engine's scoring running in the bot.
- **Respect veils and heat.** The pair view already does this, and the bot must too. A match neither person's veil would allow doesn't get surfaced, and the pair's flame is the lower of the two heats.
- **Ranking:** your people by Cross, your sparring partners by Circle Minus. Straight is the direct-match score and feeds both lists.
- **Indaba is about the typical member (Jason, 2026-11-27).** The group / Circle Minus score — the one behind `/room` and `/debate` — reflects the typical member (the median across the group), not the full range and not the most passionate voice. A single loud or passionate member does not drag the room's debate topics. That is the intended semantics, not a loss: indaba is a meeting to talk it out, and the room's discussion is about what the typical member holds, not what the outlier shouts.
- **Double protection — RULED IN (Jason, 2026-11-27 ~08:28).** The bot's scoring uses BOTH median normalization (per-profile: each topic's advocacy/receptivity measured against the person's own median) AND median group aggregation (per-group: the group score reflects the typical member, the median across members). These are two different layers, not the same fix twice — normalization fixes what one person's ratings mean, aggregation fixes how several people's scores combine. For the "max everything" attack, normalization alone suffices; aggregation is the second line for a gamer who partially defeats normalization, and it is the only one operating in groups (normalization is the only one operating in pairs).
- **Receptivity normalization — RULED IN (Jason, 2026-11-27 ~08:37).** Receptivity is double-protected too: normalized like advocacy (both flanks measured against the person's own median), and median-aggregated in groups. YoBiche argued FOR (symmetry — both flanks on the same scale or the combined score is incoherent; Jason's claim that no one is hard-headed on all topics removes the "false open" objection; normalization highlights where someone is relatively closed vs open, which is what indaba needs). The residual cost is the rescaled magnitude of the absolute "will they listen" gap.
- **Cross keeps the bottleneck for shared appetite.** Shared appetite is DEFINED as the minimum across members (the least-enthusiastic member sets the ceiling), per the standing 2026-11-24 ruling. So Cross's appetite component stays min, NOT median — the median would overstate what the group shares. Median normalization (per-profile) still applies to Cross. Straight takes the median (typical member) — no bottleneck rule there, so symmetry wins. RULED by Jason 2026-11-27 ~08:37: "cross stays min while straight goes median."

## 6. Hosting and deployment

- **Host: Railway.** Trial (one-time $5 credit, 30 days, no card) to build and prove it out. Then Hobby.
- **Cost, honest numbers:** the Free plan is $0 with $1/month of usage credit — that is NOT enough to keep a bot always-on 24/7 (holding 0.5 GB of RAM all month is about $5 on its own). The realistic ongoing cost is Hobby at **about $5–6/month** (Hobby is $5/month including $5 of usage credit; a small bot at 0.5 GB RAM plus a 1 GB volume lands around $5.15/month). Budget $5–6, not $0.
- **Storage: SQLite on a Railway Volume.** One SQLite file holding the waved profiles. Volumes are $0.15/GB/month; profiles are tiny (each a few hundred KB of JSON), so storage costs pennies. The Free plan allows a 0.5 GB volume; Hobby allows up to 5 GB. SQLite on a volume is the standard pattern for a bot this size — no separate database server needed.
- **Stack:** Node.js, discord.js v14. Railway keeps the service running (no PM2 needed — Railway manages the process).
- **Secrets:** the bot token lives in Railway environment variables, never in code.
- **Deploy:** from a Git repo (Railway deploys on push). Repo location is an open decision (see §8).
- **Setup the bot needs:** a Discord application + bot in the Developer Portal, invited to capades.io with permissions to read messages, send messages, use slash commands, and read message history in #wave-your-profile. The invite and the token are Jason's to create (or the bot is built first and the invite happens at deploy time).

## 7. What the bot does NOT do (v1)

- No profile storage on the website. The site never holds profiles — that's the privacy ruling this bot exists to honour.
- No matching across skins. A Fores profile matches Fores profiles, a Sexcapades profile matches Sexcapades profiles. Cross-skin matching is a later question, not v1.
- No unsolicited match DMs beyond the notification default. The bot answers when asked (`/matches`) or posts prompts where asked (`/room`, `/debate`). The one proactive touch is the `/matchnotifications` shoulder tap, which defaults ON and can be toggled off.
- No voice features. Voice in Discord is already free and already there (the General voice channel) — the bot doesn't need to touch it.

## 8. Ruled (not open)

- **Tier model (Jason, 2026-11-27 ~08:23):** free to wave, matches for Compadres and up. `/matches` is open to all but tiered by output — paid gets matches + topics, free gets the count. `/matchnotifications` defaults ON for free users, toggleable off, default provisional (may change if the idea takes off).
- **Sequencing (Jason, 2026-11-27 ~08:23):** the bot is NOT built until there's a critical mass of people waving profiles by hand in #wave-your-profile. Manual sharing validates the demand and seeds the pool. No threshold set for "a good number."
- **Indaba is about the typical member (Jason, 2026-11-27 ~08:18):** the group / Circle Minus score reflects the typical member (the median), not the full range or the most passionate voice. See §5.
- **Wave format — `.hypermap` (Jason, 2026-11-27 ~09:06).** The bot reads the app's `.hypermap` file (the profile payload as JSON). `.hypermap` SUPERSEDES SVGZ as the wave format (the SVGZ decision, 2026-11-27 ~08:38, is superseded — SVGZ can contain scripts, and waving it asks users to open each other's files; viewing an SVGZ standalone is not a good feature anyway). The PNG is OPTIONAL alongside the wave (for the visual only; the bot does not read it for matching). The sync-card QR is a fallback. See §3.

## 9. Open decisions for Jason

1. **Which skins first?** All 22 at once, or start with a few (Fores and Polis were named as the strongest entry maps; Sexcapades is the one with the 18+ handling)?
2. **Match results by DM or in a channel?** `/matches` as a DM is private; in a channel it's social. (Default in this spec: DM.)
3. **Repo location for the bot code.** A small separate repo, or a folder in Sexcapades-Web?
4. **Who builds it?** Grok/Cursor lane (they hold the edit saddle), or YoBiche on your direct order?
