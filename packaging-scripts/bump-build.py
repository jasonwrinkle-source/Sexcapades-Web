#!/usr/bin/env python3
import sys
import os
import re
from datetime import datetime

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
    # release-4.0-MMDD-HHMM, or qa-4.0-MMDD-HHMM for a QA package
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})_(\d{4})$", build_num)
    if m:
        build_tag = f"{channel}-4.0-{m.group(2)}{m.group(3)}-{m.group(4)}"
    else:
        build_tag = f"{channel}-4.0-{build_num}"

    if files is None:
        files = [
            os.path.join(root, "app", "sexcapades-4.0.html"),
            os.path.join(root, "site-tree", "public_html", "hosted", "app.html")
        ]

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
                         f'<!-- BUILD-MANIFEST {{"build": "{build_num}", "version": "4.0", "channel": "{channel}"}} -->', content, count=1)
        content = re.sub(r'<span class="app-about-version">Version 4\.0 · (?:QA )?Build [^<]*</span>',
                         f'<span class="app-about-version">Version 4.0 · {label} {build_num}</span>', content, count=1)
        content = re.sub(r'<span class="app-about-version app-about-buildtag">[^<]*</span>',
                         f'<span class="app-about-version app-about-buildtag">{build_tag}</span>', content)

        with open(fpath, "w", encoding="utf-8") as fh:
            fh.write(content)

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
