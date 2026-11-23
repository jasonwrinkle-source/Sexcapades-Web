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
    "02g1-alias-tables.js",
    "02g-definitions-ratings.js",
    "02h-inner-opener.js",
    "02i-taxonomy-catalog.js",
    "02i1-topic-descriptions.js",
    "02i2-widget-geometry.js",
    "02j-profile-state.js",
    "02k-compare-dials.js",
    "02o-ratings-scales.js",
    "02e-font-ladder.js",
    "02f-spoke-geometry.js",
    "02d-selection-marking.js",
    "02l-deknotter-session.js",
    "02m-fit-targets.js",
    "02n1-deknotter-diagnostics.js",
    "02n2-deknotter-solver.js",
    "02n-deknotter-cascade.js",
    "02p-spoke-selection.js",
    "02-taxonomy-core.js",
    "02c-layout-solver.js",
    "03a-midline-solver.js",
    "03-map-geometry.js",
    "03c-map-vault.js",
    "03e2-settle-engine.js",
    "03f1-polygon-math.js",
    "03f-polygon-widgets.js",
    "03f2-switchbox-widget.js",
    "03e-map-paint.js",
    "03e1-mark-dialog.js",
    "03d-outline.js",
    "04-topic-picker.js",
    "05a-sync-engine.js",
    "05b1-sync-compute.js",
    "05b-scribe.js",
    "05b2-scribe-prompts.js",
    "05-compatibility.js",
    "05d-scene-setter.js",
    "05c-share-qr.js",
    "06a-export-renderers.js",
    "06b-fetlife-importer.js",
    "06-pdf-exporter.js",
    "06d1-export-dialog.js",
    "06d2-profile-editor.js",
    "06d3-profile-about.js",
    "06d-profile-sheet.js",
    "06c1-profile-ingest.js",
    "06c2-profile-converter.js",
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

        # Normalize line endings
        code = code.replace('\r\n', '\n').replace('\r', '\n')

        # Strip ES module import lines safely (including multiline imports)
        code = re.sub(r'^\s*import\s+(?:(?:(?:\*\s+as\s+\w+)|(?:\{[\s\S]*?\}|\w+)(?:\s*,\s*(?:\{[\s\S]*?\}|\*\s+as\s+\w+))?)\s+from\s+)?[\'"][^\'"]+[\'"]\s*;?[^\S\r\n]*\n?', '', code, flags=re.MULTILINE)

        # Strip export keywords from export const, export function, export async function, export class, etc.
        code = re.sub(r'\bexport\s+(?:default\s+)?(?:(async)\s+)?(const|let|var|function|class)\s+', lambda m: (m.group(1) + ' ' if m.group(1) else '') + m.group(2) + ' ', code)
        # Strip standalone export { ... }
        code = re.sub(r'^\s*export\s*\{[^}]*\}\s*;?', '', code, flags=re.MULTILINE)

        # Strip single-line comments to prevent carriage-return line-swallowing bugs
        code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)

        combined_code.append(f"/* --- Module: {p} --- */\n(function() {{\n" + code + "\n})();\n")

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

# Sync app.css to the served copies. hosted/css is the tree path;
# hosted/app-assets/app.css is the file app.html actually loads.
css_src = os.path.join(base_dir, "../css/app.css")
for ch in [
    os.path.join(base_dir, "../../site-tree/public_html/hosted/css/app.css"),
    os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets/app.css"),
    os.path.join(base_dir, "../../site-tree/public_html/qa/css/app.css"),
    os.path.join(base_dir, "../../site-tree/public_html/qa/app-assets/app.css")
]:
    if os.path.exists(os.path.dirname(ch)) and os.path.exists(css_src):
        shutil.copyfile(css_src, ch)
        print(f"[Bundle] Synced app.css to {ch}")

# Sync auxiliary JS. hosted/js is the tree path. The shell loads the
# same files from hosted/app-assets, so that copy is written too.
js_src_dir = os.path.join(base_dir, "../js")
shell_js = ["view-nav.js", "layout-editor.js", "scene-sentinel.js", "pitch-pitcher.js", "pitch-pitcher-bank.js", "patches.js", "avatar-music.js", "sx-songbook.js", "skin-loader.js", "skin-catalog.js"]
for f in shell_js:
    src_f = os.path.join(js_src_dir, f)
    for dst_dir in [os.path.join(base_dir, "../../site-tree/public_html/hosted/js"), os.path.join(base_dir, "../../site-tree/public_html/qa/js"),
                    os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets"), os.path.join(base_dir, "../../site-tree/public_html/qa/app-assets")]:
        dst_f = os.path.join(dst_dir, f)
        if os.path.exists(src_f) and os.path.exists(dst_dir):
            shutil.copyfile(src_f, dst_f)
            print(f"[Bundle] Synced {f} to {dst_dir}/")

# hosted/app.html is the path-rewritten source page. Cache stamps
# (?v=) already on the served file are kept, so a rebuild does not
# throw away the browser's cache key.
def write_hosted_app(src_path, dest_path):
    if not os.path.exists(src_path) or not os.path.exists(os.path.dirname(dest_path)):
        return
    html = open(src_path, encoding="utf-8").read()
    html = html.replace('href="css/app.css"', 'href="/hosted/app-assets/app.css"')
    html = html.replace('src="vendor/', 'src="/hosted/app-assets/vendor/')
    html = html.replace('src="data/', 'src="/hosted/app-assets/')
    html = html.replace('src="js/', 'src="/hosted/app-assets/')
    html = html.replace('src="images/', 'src="/hosted/app-assets/images/')
    if os.path.exists(dest_path):
        old = open(dest_path, encoding="utf-8").read()
        stamps = {}
        for url, ver in re.findall(r'(/hosted/app-assets/[^"\']+?)\?v=([^"\']+)', old):
            stamps[url] = ver
        def add(m):
            url = m.group(0)
            base = url.split("?")[0]
            # The served page's ?v= wins. The source page carries its
            # own older query (data-bootstrap.js?v=4.1.4), and that
            # must not replace the cache key the browser is using.
            if base in stamps:
                return base + "?v=" + stamps[base]
            return url
        html = re.sub(r'/hosted/app-assets/[^"\']+', add, html)
    prev = open(dest_path, encoding="utf-8").read() if os.path.exists(dest_path) else None
    if prev != html:
        with open(dest_path, "w", encoding="utf-8") as fh:
            fh.write(html)
        print(f"[Bundle] Wrote hosted app shell {dest_path}")
    else:
        print(f"[Bundle] Hosted app shell already matches {dest_path}")

write_hosted_app(
    os.path.join(base_dir, "../sexcapades-5.0.html"),
    os.path.join(base_dir, "../../site-tree/public_html/hosted/app.html"))

# Sync skin data files (app/data/skins/*.json) to hosted/data/skins/ and qa/data/skins/
# so a runtime-fetched skin loads in the hosted and QA trees, not just source.
skins_src_dir = os.path.join(base_dir, "skins")
for skins_dst in [os.path.join(base_dir, "../../site-tree/public_html/hosted/data/skins"),
                  os.path.join(base_dir, "../../site-tree/public_html/qa/data/skins")]:
    if os.path.exists(skins_src_dir) and os.path.exists(os.path.dirname(skins_dst)):
        os.makedirs(skins_dst, exist_ok=True)
        for sf in os.listdir(skins_src_dir):
            if not sf.endswith(".json"):
                continue
            shutil.copyfile(os.path.join(skins_src_dir, sf), os.path.join(skins_dst, sf))
            print(f"[Bundle] Synced skins/{sf} to {skins_dst}/")

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

print(f"[Bundle] Complete! Generated {round(os.path.getsize(target_app)/1024, 1)} KB ES-bundled bundle.")
