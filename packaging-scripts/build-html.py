#!/usr/bin/env python3
"""Build the app page from app/html and write the hosted shell.

app/html is the only hand-edited app page. The parts below are concatenated
in this order, with nothing added or removed, into app/sexcapades-5.0.html.
The hosted shell is that same text after the packager path rewrite:

    href="css/app.css" -> href="/hosted/app-assets/app.css"
    src="vendor/       -> src="/hosted/app-assets/vendor/
    src="data/         -> src="/hosted/app-assets/
    src="js/           -> src="/hosted/app-assets/
    src="images/       -> src="/hosted/app-assets/images/

Deploy stamps ?v= on its staging copy. This build does not invent cache keys.

Parts, in document order:
    00-head            head, boot overlay, toolbar
    01-map             workspace, #mapSvg, legend, #mapHint
    02-hot-list        #outlineDialog
    03-views           Scene Sentinel through the import-result dialog.
                       The About version span lives in this part.
    04-profile         profile details through the close-profile dialog
    05-export          profile export and the low-res photo dialog
    06-tools           file dialog through the FetLife map dialog
    07-placard         #markMenu
    08-layout-editor   profile about, sample menus, layout editor
    09-tail            engine script tags, then the share dialog, view
                       nav, and #hotListWidgetDialog. The widget popup
                       stays after those scripts. Do not reorder 09-tail
                       ahead of them.

Gate and guide are separate hand files, app/gate.html and
app/guide.html. This script writes the hosted copies. Each hosted
copy is the hand file with one script path rewritten:

    gate:  src="js/skin-catalog.js" -> src="/hosted/app-assets/skin-catalog.js"
    guide: src="js/docs-skin.js"    -> src="/hosted/js/docs-skin.js"
"""
import os
import sys

PARTS = [
    "00-head.html",
    "01-map.html",
    "02-hot-list.html",
    "03-views.html",
    "04-profile.html",
    "05-export.html",
    "06-tools.html",
    "07-placard.html",
    "08-layout-editor.html",
    "09-tail.html",
]

# Order matches packaging-scripts/package-deploy-all-5.0.sh. A later
# replacement must not see a path an earlier one already rewrote.
REPLACEMENTS = [
    (b'href="css/app.css"', b'href="/hosted/app-assets/app.css"'),
    (b'src="vendor/', b'src="/hosted/app-assets/vendor/'),
    (b'src="data/', b'src="/hosted/app-assets/'),
    (b'src="js/', b'src="/hosted/app-assets/'),
    (b'src="images/', b'src="/hosted/app-assets/images/'),
]


def root_dir():
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def read_parts(partial_dir):
    chunks = []
    for name in PARTS:
        path = os.path.join(partial_dir, name)
        if not os.path.isfile(path):
            sys.exit(f"build-html: missing {path}")
        with open(path, "rb") as fh:
            chunks.append(fh.read())
    return b"".join(chunks)


def write_if_changed(path, data):
    prev = None
    if os.path.isfile(path):
        with open(path, "rb") as fh:
            prev = fh.read()
    if prev == data:
        print(f"[html] unchanged {path}")
        return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(data)
    print(f"[html] wrote {path} ({len(data)} bytes)")
    return True


def hosted_html(app_html):
    out = app_html
    for old, new in REPLACEMENTS:
        out = out.replace(old, new)
    return out


def rewrite_one(root, src_rel, dst_rel, old, new, label):
    src = os.path.join(root, src_rel)
    if not os.path.isfile(src):
        sys.exit(f"build-html: missing {src}")
    with open(src, "rb") as fh:
        data = fh.read()
    if old not in data:
        sys.exit(f"build-html: {label} is missing {old.decode()}")
    write_if_changed(os.path.join(root, dst_rel), data.replace(old, new, 1))


def build():
    root = root_dir()
    partial_dir = os.path.join(root, "app", "html")
    app_html = read_parts(partial_dir)
    if b"<html" not in app_html[:400] or not app_html.rstrip().endswith(b"</div>"):
        sys.exit("build-html: concatenated shell does not look like the app page")
    write_if_changed(os.path.join(root, "app", "sexcapades-5.0.html"), app_html)
    hosted_path = os.path.join(root, "site-tree", "public_html", "hosted", "app.html")
    write_if_changed(hosted_path, hosted_html(app_html))
    rewrite_one(
        root,
        os.path.join("app", "gate.html"),
        os.path.join("site-tree", "public_html", "hosted", "gate.html"),
        b'src="js/skin-catalog.js"',
        b'src="/hosted/app-assets/skin-catalog.js"',
        "gate",
    )
    rewrite_one(
        root,
        os.path.join("app", "guide.html"),
        os.path.join("site-tree", "public_html", "hosted", "guide.html"),
        b'src="js/docs-skin.js"',
        b'src="/hosted/js/docs-skin.js"',
        "guide",
    )
    return 0


if __name__ == "__main__":
    sys.exit(build())
