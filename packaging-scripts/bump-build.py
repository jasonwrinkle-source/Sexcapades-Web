#!/usr/bin/env python3
import sys
import os
import re
import subprocess
from datetime import datetime

# Product version, stamped into About spans, build tags, and the build manifest.
# Keep in ONE place: the About-span regex below matches ANY version, so a
# future bump only changes this line (the 5.0 bump missed the regex, which
# still matched only "Version 4.0" and silently left the static span stale).
# The guide's <p class="about-version"> shares this VERSION and is stamped by
# the same run. build-html.py copies that stamp into the hosted guide.
# Guide version-bump rule (Jason, 2026-11-16):
# the guide's version bumps on a substantial addition/edit; the BUILD part
# tracks the deploy that carries it, exactly like the app About span.
VERSION = "5.0"

def app_partials(root):
    """Hand-edited app page. Empty when the split has not been built."""
    partial_dir = os.path.join(root, "app", "html")
    if not os.path.isdir(partial_dir):
        return []
    names = sorted(n for n in os.listdir(partial_dir) if n.endswith(".html"))
    return [os.path.join(partial_dir, n) for n in names]

def regenerate_app_shells(root):
    """Write both app shells, and the hosted gate and guide, from the hand files just stamped."""
    script = os.path.join(os.path.dirname(__file__), "build-html.py")
    if os.path.isfile(script) and app_partials(root):
        subprocess.run([sys.executable, script], cwd=root, check=True)

def bump(build_num=None, channel="release", files=None):
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if not build_num:
        try:
            import zoneinfo
            tz = zoneinfo.ZoneInfo("America/Chicago")
            now = datetime.now(tz)
        except Exception:
            now = datetime.now()
        build_num = now.strftime("%Y-%m-%d_%H%M")

    channel = "qa" if channel == "qa" else "release"
    label = "QA Build" if channel == "qa" else "Build"
    # release-<version>-MMDD-HHMM, or qa-<version>-MMDD-HHMM for a QA package
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})_(\d{4})$", build_num)
    if m:
        build_tag = f"{channel}-{VERSION}-{m.group(2)}{m.group(3)}-{m.group(4)}"
    else:
        build_tag = f"{channel}-{VERSION}-{build_num}"

    # Default list stamps the hand sources. The two app shells are
    # generated afterwards, so a stamp written only into a shell is
    # not wiped by the next concatenation. An explicit file list
    # (the QA packager passes its staged app.html) is stamped as
    # given and does not rebuild the repo shells.
    regenerate = False
    if files is None:
        partials = app_partials(root)
        # Hosted gate and guide are written by build-html.py from these
        # two files. Stamping the hosted copies here would be overwritten
        # by that rewrite, so they are not in the list.
        hand = [
            os.path.join(root, "app", "guide.html"),
            os.path.join(root, "app", "gate.html"),
        ]
        if partials:
            files = partials + hand
            regenerate = True
        else:
            files = [
                os.path.join(root, "app", "sexcapades-5.0.html"),
                os.path.join(root, "site-tree", "public_html", "hosted", "app.html"),
            ] + hand

    for fpath in files:
        if not os.path.isfile(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as fh:
            content = fh.read()

        content = re.sub(r'<meta content="[^"]*" name="sexcapades-build"/>',
                         f'<meta content="{build_num}" name="sexcapades-build"/>', content)
        content = re.sub(r'<meta content="[^"]*" name="sexcapades-build-tag"/>',
                         f'<meta content="{build_tag}" name="sexcapades-build-tag"/>', content)
        content = re.sub(r'<!-- BUILD-MANIFEST \{[^}]*\} -->',
                         f'<!-- BUILD-MANIFEST {{"build": "{build_num}", "version": "{VERSION}", "channel": "{channel}"}} -->', content, count=1)
        content = re.sub(r'<span class="app-about-version">Version [0-9]+\.[0-9]+ · (?:QA )?Build [^<]*</span>',
                         f'<span class="app-about-version">Version {VERSION} · {label} {build_num}</span>', content, count=1)
        content = re.sub(r'<span class="app-about-version app-about-buildtag">[^<]*</span>',
                         f'<span class="app-about-version app-about-buildtag">{build_tag}</span>', content)
        # Guide About stamp. The hand file is app/guide.html. build-html.py
        # writes the hosted copy from it. No-ops on the app files (they
        # carry a <span>, not this <p>); the app patterns above no-op on
        # the guide.
        content = re.sub(r'<p class="about-version">Version [0-9]+\.[0-9]+ · (?:QA )?Build [^<]*</p>',
                         f'<p class="about-version">Version {VERSION} · {label} {build_num}</p>', content, count=1)
        # Gate About stamp. The hand file is app/gate.html. build-html.py
        # writes the hosted copy from it. The gate's version lines are
        # <p class="app-about-version">, not the app's <span> and not
        # the guide's <p class="about-version">. Version and build-tag
        # lines share the class, so they need separate patterns — the
        # version regex must not eat the tag line (and vice versa). The
        # QA script passes an explicit list of only app.html, so the
        # gate is not in the QA channel.
        content = re.sub(r'<p class="app-about-version">Version [0-9]+\.[0-9]+ · (?:QA )?Build [^<]*</p>',
                         f'<p class="app-about-version">Version {VERSION} · {label} {build_num}</p>', content, count=1)
        content = re.sub(r'<p class="app-about-version">(?:release|qa)-[^<]*</p>',
                         f'<p class="app-about-version">{build_tag}</p>', content, count=1)

        with open(fpath, "w", encoding="utf-8") as fh:
            fh.write(content)

    if regenerate:
        regenerate_app_shells(root)

    print(f"Bumped build to: {build_num} ({build_tag})")
    return build_num, build_tag

if __name__ == "__main__":
    bn = None
    channel = "release"
    files = []
    for arg in sys.argv[1:]:
        if arg in ("qa", "release"):
            channel = arg
        elif arg == "--qa":
            channel = "qa"
        elif os.path.isfile(arg) or arg.endswith(".html"):
            files.append(arg)
        elif bn is None:
            bn = arg
        else:
            files.append(arg)
    bump(bn, channel, files or None)
