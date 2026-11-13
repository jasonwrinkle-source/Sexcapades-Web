#!/usr/bin/env python3
"""Stamp ?v=<build> onto every local .js/.css URL in an HTML file.

Usage: stamp-asset-versions.py <build_num> <html_file> [<html_file> ...]

The packaged app.html used to load JavaScript with hand-maintained ?v=
values (e.g. data-bootstrap.js?v=4.1.4, patches.js?v=4.0.6) that did not
change when the bundle changed, so browsers served stale JavaScript under
a new build number. This helper rewrites every local .js/.css src/href in
the STAGED app.html to ?v=<build_num> at packaging time, so the URL
changes whenever the bundle changes. The source keeps its hand-maintained
values as fallbacks; the packaged output is always correct.

Only local URLs are touched (no http://, https://, //, data:, or #).
Only URLs whose path ends in .js or .css are rewritten (favicon,
manifest, icons are left alone). An existing query string (stale ?v= or
anything else) is replaced wholesale with ?v=<build_num>.
"""
import sys
import re

URL_ATTR_RE = re.compile(r'((?:src|href)=")([^"]+)(")')


def stamp_url(url, build_num):
    """Return (new_url, changed). Only local .js/.css URLs are rewritten."""
    if not url:
        return url, False
    low = url.lower()
    if low.startswith(("http://", "https://", "//", "data:", "#", "mailto:")):
        return url, False
    # Split off any existing query/fragment; the path decides.
    path = url.split("?", 1)[0].split("#", 1)[0]
    if not (path.endswith(".js") or path.endswith(".css")):
        return url, False
    new_url = f"{path}?v={build_num}"
    return new_url, (new_url != url)


def stamp_file(path, build_num):
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()
    changed = []

    def repl(m):
        new_url, did = stamp_url(m.group(2), build_num)
        if did:
            changed.append((m.group(2), new_url))
        return m.group(1) + new_url + m.group(3)

    new_content = URL_ATTR_RE.sub(repl, content)
    if changed:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(new_content)
    return changed


def main():
    if len(sys.argv) < 3:
        print("usage: stamp-asset-versions.py <build_num> <html_file> [...]",
              file=sys.stderr)
        return 2
    build_num = sys.argv[1]
    total = 0
    for path in sys.argv[2:]:
        changed = stamp_file(path, build_num)
        total += len(changed)
        print(f"{path}: stamped {len(changed)} asset URL(s) to ?v={build_num}")
        for old, new in changed:
            print(f"  {old}  ->  {new}")
    print(f"Total stamped: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
