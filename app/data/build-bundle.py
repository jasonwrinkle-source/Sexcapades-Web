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
    "02a-taxonomy-models.js",
    "02e-font-ladder.js",
    "02f-spoke-geometry.js",
    "02d-selection-marking.js",
    "02g-definitions-ratings.js",
    "02h-inner-opener.js",
    "02i-taxonomy-catalog.js",
    "02j-profile-state.js",
    "02k-compare-dials.js",
    "02l-deknotter-session.js",
    "02m-fit-targets.js",
    "02n-deknotter-cascade.js",
    "02o-ratings-scales.js",
    "02p-spoke-selection.js",
    "02-taxonomy-core.js",
    "02c-layout-solver.js",
    "03a-midline-solver.js",
    "03-map-geometry.js",
    "03c-map-vault.js",
    "03e-map-paint.js",
    "03d-outline.js",
    "04-topic-picker.js",
    "05a-sync-engine.js",
    "05b-scribe.js",
    "05-compatibility.js",
    "05c-share-qr.js",
    "06a-export-renderers.js",
    "06b-fetlife-importer.js",
    "06-pdf-exporter.js",
    "06d-profile-sheet.js",
    "06c-converter-pipeline.js",
    "06e-kinktest-routes.js",
    "07-header-hug.js",
    "03b-map-interaction.js",
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

target_app_assets = os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets/data-bootstrap.js")
target_qa = os.path.join(base_dir, "../../site-tree/public_html/qa/data/data-bootstrap.js")
target_qa_assets = os.path.join(base_dir, "../../site-tree/public_html/qa/app-assets/data-bootstrap.js")

for th in [target_hosted, target_hosted_alt, target_app_assets, target_qa, target_qa_assets]:
    if os.path.exists(os.path.dirname(th)):
        shutil.copyfile(target_app, th)
        print(f"[Bundle] Synced to {th}")

template_src = os.path.join(base_dir, "../../site-tree/public_html/hosted/data/unrated-map-template.js")
template_app = os.path.join(base_dir, "unrated-map-template.js")
template_app_assets = os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets/unrated-map-template.js")
if os.path.exists(template_src):
    shutil.copyfile(template_src, template_app)
    print(f"[Bundle] Synced unrated-map-template.js to app/data/")
elif os.path.exists(template_app):
    shutil.copyfile(template_app, template_src)
    print(f"[Bundle] Synced unrated-map-template.js to site-tree/public_html/hosted/data/")
if os.path.exists(template_app) and os.path.exists(os.path.dirname(template_app_assets)):
    shutil.copyfile(template_app, template_app_assets)
    print(f"[Bundle] Synced unrated-map-template.js to app-assets/")

patches_src = os.path.join(base_dir, "../js/patches.js")
patches_hosted = os.path.join(base_dir, "../../site-tree/public_html/hosted/js/patches.js")
patches_hosted_alt = os.path.join(base_dir, "../../hosted/js/patches.js")
patches_qa = os.path.join(base_dir, "../../site-tree/public_html/qa/js/patches.js")
for ph in [patches_hosted, patches_hosted_alt, patches_qa]:
    if os.path.exists(os.path.dirname(ph)) and os.path.exists(patches_src):
        shutil.copyfile(patches_src, ph)
        print(f"[Bundle] Synced patches.js to {ph}")

# Sync app.css to hosted/css/app.css and qa/css/app.css
css_src = os.path.join(base_dir, "../css/app.css")
for ch in [
    os.path.join(base_dir, "../../site-tree/public_html/hosted/css/app.css"),
    os.path.join(base_dir, "../../site-tree/public_html/qa/css/app.css")
]:
    if os.path.exists(os.path.dirname(ch)) and os.path.exists(css_src):
        shutil.copyfile(css_src, ch)
        print(f"[Bundle] Synced app.css to {ch}")

# Sync all auxiliary JS files in app/js to site-tree/public_html/hosted/js and qa/js
js_src_dir = os.path.join(base_dir, "../js")
for f in ["view-nav.js", "layout-editor.js", "scene-sentinel.js", "pitch-pitcher.js", "avatar-music.js", "sx-songbook.js"]:
    src_f = os.path.join(js_src_dir, f)
    for dst_dir in [os.path.join(base_dir, "../../site-tree/public_html/hosted/js"), os.path.join(base_dir, "../../site-tree/public_html/qa/js")]:
        dst_f = os.path.join(dst_dir, f)
        if os.path.exists(src_f) and os.path.exists(dst_dir):
            shutil.copyfile(src_f, dst_f)
            print(f"[Bundle] Synced {f} to {dst_dir}/")

# Sync module files to hosted/js/modules/ and qa/js/modules/
hosted_modules_dir = os.path.join(base_dir, "../../site-tree/public_html/hosted/js/modules")
qa_modules_dir = os.path.join(base_dir, "../../site-tree/public_html/qa/js/modules")
os.makedirs(hosted_modules_dir, exist_ok=True)
if os.path.exists(os.path.dirname(qa_modules_dir)):
    os.makedirs(qa_modules_dir, exist_ok=True)
for p in parts:
    src_p = os.path.join(src_dir, p)
    for m_dir in [hosted_modules_dir, qa_modules_dir]:
        if os.path.exists(m_dir):
            dst_p = os.path.join(m_dir, p)
            if os.path.exists(src_p):
                with open(src_p, encoding="utf-8") as f:
                    code = f.read()
                code = re.sub(r'^\s*import\s+.*?;\s*', '', code, flags=re.MULTILINE)
                code = re.sub(r'\bexport\s+(const|let|var|function|class)\s+', r'\1 ', code)
                code = re.sub(r'^\s*export\s*\{[^}]*\}\s*;?', '', code, flags=re.MULTILINE)
                with open(dst_p, "w", encoding="utf-8") as f_dst:
                    f_dst.write(code)
print(f"[Bundle] Synced {len(parts)} unbundled modules to hosted/js/modules/ and qa/js/modules/")

# Sync baked layout defaults into HTML app entrypoints if sexcapades-layout-defaults.json exists
defaults_json_path = os.path.join(base_dir, "sexcapades-layout-defaults.json")
if os.path.exists(defaults_json_path):
    with open(defaults_json_path, "r", encoding="utf-8") as f:
        new_defaults_str = f.read().strip()

    html_targets = [
        os.path.join(base_dir, "../sexcapades-4.0.html"),
        os.path.join(base_dir, "../../site-tree/public_html/hosted/app.html"),
        os.path.join(base_dir, "../../site-tree/public_html/qa/app.html"),
        os.path.join(base_dir, "../../hosted/app.html"),
    ]
    for ht in html_targets:
        if os.path.exists(ht):
            with open(ht, "r", encoding="utf-8") as f_html:
                html_content = f_html.read()
            updated_html = re.sub(
                r'([ \t]*var\s+defaults\s*=\s*)\{.*?\}(\s*;)',
                r'\g<1>' + new_defaults_str.replace('\\', '\\\\') + r'\g<2>',
                html_content,
                count=1
            )
            if updated_html != html_content:
                with open(ht, "w", encoding="utf-8") as f_html:
                    f_html.write(updated_html)
                print(f"[Bundle] Baked layout defaults into {ht}")

print(f"[Bundle] Complete! Generated {round(os.path.getsize(target_app)/1024, 1)} KB ES-bundled bundle.")
