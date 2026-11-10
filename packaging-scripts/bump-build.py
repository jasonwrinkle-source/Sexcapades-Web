#!/usr/bin/env python3
import sys
import os
import re
from datetime import datetime

def bump(build_num=None):
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if not build_num:
        try:
            import zoneinfo
            tz = zoneinfo.ZoneInfo("America/Chicago")
            now = datetime.now(tz)
        except Exception:
            now = datetime.now()
        build_num = now.strftime("%Y-%m-%d_%H%M")

    # release-4.0-MMDD-HHMM
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})_(\d{4})$", build_num)
    if m:
        build_tag = f"release-4.0-{m.group(2)}{m.group(3)}-{m.group(4)}"
    else:
        build_tag = f"release-4.0-{build_num}"

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
        content = re.sub(r'<!-- BUILD-MANIFEST \{"build": "[^"]*", "version": "4.0"\} -->',
                         f'<!-- BUILD-MANIFEST {{"build": "{build_num}", "version": "4.0"}} -->', content)
        content = re.sub(r'<span class="app-about-version">Version 4.0 · Build \d{4}-\d{2}-\d{2}_\d{4}</span>',
                         f'<span class="app-about-version">Version 4.0 · Build {build_num}</span>', content)
        content = re.sub(r'<span class="app-about-version app-about-buildtag">[^<]*</span>',
                         f'<span class="app-about-version app-about-buildtag">{build_tag}</span>', content)

        with open(fpath, "w", encoding="utf-8") as fh:
            fh.write(content)

    print(f"Bumped build to: {build_num} ({build_tag})")
    return build_num, build_tag

if __name__ == "__main__":
    bn = sys.argv[1] if len(sys.argv) > 1 else None
    bump(bn)
