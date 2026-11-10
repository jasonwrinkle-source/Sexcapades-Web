# Sexcapades — Site Handover Notes

*Written 2026-10-20, for whoever keeps sexcapades.io running if Jason can't.
No passwords are in this document, on purpose. It explains where everything
lives and the one routine job that keeps the site updated.*

## What this site is

Sexcapades (sexcapades.io) is Jason's app for exploring and sharing kink
interests: an interactive map people fill in for themselves, compare with
partners, and share as picture files. Visitors must pass an age gate before
they reach the app. The site is a personal project, hosted commercially,
and it runs itself day to day — nobody has to feed it. The only recurring
job is publishing updates, described below.

## Where everything lives

- **The site itself** runs on **Hostinger** (a hosting company). The files
  sit on their server in a folder called `~/domains/sexcapades.io/public_html`.
  The part visitors see is inside `public_html`.
- **The domain name** (sexcapades.io) is also held through Hostinger, on
  the same account.
- **Backup copies of every release** are in Jason's **Google Drive**, in
  two folders:
  - **pre-release** — packages that update just the app (and the individual
    pages: gate, guide, quickstart).
  - **snapshots** — packages that update the whole site at once, plus
    full-site backups.
- **Visitor statistics** are stored on the server in a small database at
  `~/domains/sexcapades-data/sexcapades_data.db`. It deliberately sits
  *outside* the public folders and is never inside the update packages, so
  publishing an update can never overwrite it.
- **Login details** for Hostinger and Google are in Jason's password
  vault. Whoever takes over needs access to that vault; this document is
  useless without it and safe to share with it.

## The one job: publishing an update

Updates arrive as a single package file (a `.tar.gz` — think of it as a
zip file) plus a short block of text commands and a **fingerprint**: a long
string of letters and numbers that uniquely identifies the exact package,
for example `c40c1603da019ff0c9b2d710e26a0500`.

You do **not** need to upload anything from your own computer, use Google
Drive, or open the hosting control panel. The server fetches the package
itself. Your whole part is copy and paste:

1. **Open a window into the server.** This is called an SSH session — a
   plain text window where you type commands the server carries out. Jason
   opens his from his Chromebook's terminal app, signed in with the
   Hostinger account from the password vault. (If the terminal app isn't
   set up, Hostinger's control panel — hPanel — lists the SSH sign-in
   details under its SSH Access section.)
2. **Paste the block Muse gives you.** It is always these three lines,
   with the link and fingerprint changed each time:

   ```
   cd ~/domains
   curl -L -o <package-name>.tar.gz "<link>"
   md5sum <package-name>.tar.gz
   tar -xzf <package-name>.tar.gz
   ```

   What each line does:
   - `cd ~/domains` — step into the folder where site packages belong.
   - `curl -L -o ... "<link>"` — the **server** downloads the package from
     the link. (A 43 MB package took about 4 seconds.)
   - `md5sum ...` — prints the package's fingerprint. **Compare it with the
     fingerprint you were given. If they don't match exactly, stop** — the
     download is wrong or incomplete. Run the `curl` line again, or ask
     Muse for a fresh link. Never unpack a package whose fingerprint
     doesn't match.
   - `tar -xzf ...` — unpack the package into place. The site is updated
     the moment this finishes.
3. **Check the result like a visitor.** Open https://sexcapades.io, pass
   the age gate, and use the app for a moment. If an update was just
   published, the app already knows: it checks for the newest version on
   every load and refreshes itself.

## If something looks wrong

- **The site shows an old version or behaves oddly right after an update:**
  hold **Ctrl + Shift + R** (on a Mac, **Cmd + Shift + R**) to hard-refresh
  the page once. A device that had the site from before October 2026 may
  hold one older copy; one hard refresh clears it, and after that the app
  keeps itself current. Nobody ever needs to clear a browser cache or
  delete browsing data for this site.
- **The hosting control panel (hPanel) won't load:** the site is probably
  fine. The panel and the websites are separate systems — on 2026-10-20 a
  power failure at a data center took the panel down for hours while
  sexcapades.io served normally the whole time, and updates were still
  published using the SSH method above. Check
  https://statuspage.hostinger.com before worrying.
- **The site itself is down:** check the Hostinger status page first. If
  there's no incident listed, this is beyond this document — see "Getting
  help," below.

## Rules that keep the site safe

- **Always check the fingerprint before unpacking.** It is the one step
  that can't be skipped.
- **Don't delete anything in `~/domains`** unless you know exactly what it
  is. In particular, `sexcapades-data` (the statistics) and `archives`
  are not junk.
- **Never share links that skip the age gate.** Links meant for the public
  always point at the front door, https://sexcapades.io — never directly
  at the app page behind the gate.
- **Packages unpack from `~/domains`,** and the folder inside every package
  is named `sexcapades.io` (with a dot). If a package ever shows a
  different name, stop and ask.

## Getting help

The packages, the paste blocks, and the fingerprints all come from
**Muse**, the AI assistant Jason works with (the account is in his
password vault alongside the others). A successor with that account can
simply tell Muse what they need — "publish the latest update," "the site
looks wrong" — and Muse will prepare the package and hand over the exact
block to paste, the same way it does for Jason. No webmaster knowledge is
assumed on your side of that conversation; if a step doesn't make sense,
say so and ask for it plainer.

Everything else about the project — what the app does, why it's built the
way it is — lives in the guide on the site itself:
https://sexcapades.io/#guide

## If Muse is unavailable

The site does not need Muse to stay online — Hostinger alone keeps it
serving, indefinitely. What Muse provides is *new update packages*. If
Jason's Muse account can't be reached — or Muse itself is ever gone —
nothing breaks; updates simply wait.

The project can be picked up by someone else, because nothing essential
lives only inside Muse:

- The **complete source of the app** is preserved in the Drive
  **pre-release** folder as the `sync-app` files — each one is the whole
  app in a single file, newest first.
- The **whole-site backups** are in the Drive **snapshots** folder.
- The **release pipeline itself** — the optimizer and packaging scripts
  that turn the app's source files into the deploy packages, with a README
  explaining each one — **rides inside every sync-all and deploy-all
  package** under `sexcapades.io/pipeline/`, alongside the site itself
  (a copy of this document is in there, too). A standalone copy also sits
  in the Drive **snapshots** folder as
  `sexcapades-release-pipeline-2026-10-20.tar.gz`.
- **This document** describes how publishing works.

Any AI assistant — a successor's own Muse account, or another capable
AI — or a hired webmaster can take over from those files: rebuild the
update pipeline, produce a new package, and hand over the same paste
block described above. The publishing steps work identically with a
package produced by anyone, as long as the fingerprint check is honored.

The things that must never be lost are the **Hostinger account**, the
**Google Drive backups**, and **this document**. Everything else can be
rebuilt from those three.
