#!/usr/bin/env python3
import os
import shutil
import re

base_dir = os.path.dirname(__file__)
src_dir = os.path.join(base_dir, "../js/modules")
target_app = os.path.join(base_dir, "data-bootstrap.js")
target_hosted = os.path.join(base_dir, "../../site-tree/public_html/hosted/data/data-bootstrap.js")
target_hosted_alt = os.path.join(base_dir, "../../hosted/data/data-bootstrap.js")

parts = [
    "01-dispatcher.js",
    "02b-taxonomy-data.js",
    "02-taxonomy-core.js",
    "03-map-geometry.js",
    "03b-map-interaction.js",
    "04-topic-picker.js",
    "05-compatibility.js",
    "06-pdf-exporter.js",
    "07-header-hug.js",
    "08-ui-wiring.js",
    "09-profile-storage.js"
]

print("[Bundle] Processing ES modules and bundling into data-bootstrap.js...")

combined_code = []

for p in parts:
    path = os.path.join(src_dir, p)
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            code = f.read()

        # Strip ES module import lines safely
        code = re.sub(r'^\s*import\s+.*?;\s*', '', code, flags=re.MULTILINE)

        # Strip export keywords from export const, export function, export class, etc.
        code = re.sub(r'\bexport\s+(const|let|var|function|class)\s+', r'\1 ', code)
        # Strip standalone export { ... }
        code = re.sub(r'^\s*export\s*\{[^}]*\}\s*;?', '', code, flags=re.MULTILINE)

        combined_code.append(code)

with open(target_app, "w", encoding="utf-8") as out:
    out.write("\n".join(combined_code))

for th in [target_hosted, target_hosted_alt]:
    if os.path.exists(os.path.dirname(th)):
        shutil.copyfile(target_app, th)
        print(f"[Bundle] Synced to {th}")

patches_src = os.path.join(base_dir, "../js/patches.js")
patches_hosted = os.path.join(base_dir, "../../site-tree/public_html/hosted/js/patches.js")
patches_hosted_alt = os.path.join(base_dir, "../../hosted/js/patches.js")
for ph in [patches_hosted, patches_hosted_alt]:
    if os.path.exists(os.path.dirname(ph)) and os.path.exists(patches_src):
        shutil.copyfile(patches_src, ph)
        print(f"[Bundle] Synced patches.js to {ph}")

# Sync all auxiliary JS files in app/js to site-tree/public_html/hosted/js
js_src_dir = os.path.join(base_dir, "../js")
for f in ["view-nav.js", "layout-editor.js", "scene-sentinel.js", "pitch-pitcher.js", "avatar-music.js", "sx-songbook.js"]:
    src_f = os.path.join(js_src_dir, f)
    dst_f = os.path.join(base_dir, "../../site-tree/public_html/hosted/js", f)
    if os.path.exists(src_f) and os.path.exists(os.path.dirname(dst_f)):
        shutil.copyfile(src_f, dst_f)
        print(f"[Bundle] Synced {f} to hosted/js/")

print(f"[Bundle] Complete! Generated {round(os.path.getsize(target_app)/1024, 1)} KB ES-bundled bundle.")
