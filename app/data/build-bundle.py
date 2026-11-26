#!/usr/bin/env python3
import os
import shutil
import re
import subprocess
import sys

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
    "02o1-node-engine.js",
    "02o2-stance-scales.js",
    "02o-ratings-scales.js",
    "02e-font-ladder.js",
    "02f1-spoke-math.js",
    "02f-spoke-geometry.js",
    "02l1-deknotter-clouds.js",
    "02l-deknotter-session.js",
    "02m-fit-targets.js",
    "02n1-deknotter-diagnostics.js",
    "02n2-deknotter-solver.js",
    "02n3-cascade-steps.js",
    "02n4-cascade-shrink.js",
    "02n-deknotter-cascade.js",
    "02p-spoke-selection.js",
    "02-taxonomy-core.js",
    "02c-layout-solver.js",
    "03a0-midline-tree.js",
    "03a1-midline-energy.js",
    "03a-midline-solver.js",
    "03-map-geometry.js",
    "03c-map-vault.js",
    "03e2-settle-engine.js",
    "03f1-polygon-math.js",
    "03f1-placement-write.js",
    "03f1a-tri-tetrad-widgets.js",
    "03f1b-compass-pentad-widgets.js",
    "03f-polygon-widgets.js",
    "03f2-switchbox-widget.js",
    "03f3-cross-slider.js",
    "03e0-map-renderers.js",
    "03e4a-paint-preamble.js",
    "03e4-paint-generator.js",
    "03e-map-paint.js",
    "03e1a-placard-sync.js",
    "03e1-mark-dialog.js",
    "03d0-outline-state.js",
    "03d1-outline-ladder.js",
    "03d2-outline-timer.js",
    "03d3-outline-rows.js",
    "03d4-outline-ondeck.js",
    "03d5-outline-render.js",
    "03d-outline.js",
    "04-topic-picker.js",
    "05a-sync-engine.js",
    "05b0-score-terms.js",
    "05b1a-sync-metrics.js",
    "05b1b-pair-compute.js",
    "05b1-sync-compute.js",
    "05b-scribe.js",
    "05b2-scribe-prompts.js",
    "05-0-pair-engine.js",
    "05-1-match-tabs.js",
    "05-compatibility.js",
    "05d-scene-setter.js",
    "05c-share-qr.js",
    "06a-export-renderers.js",
    "06b-fetlife-importer.js",
    "06-0-viewport-camera.js",
    "06-1-map-widget-gesture.js",
    "06-2-map-pointer.js",
    "06d1-export-dialog.js",
    "06d2a-identity-pickers.js",
    "06d2-profile-editor.js",
    "06d3-profile-about.js",
    "06d-profile-sheet.js",
    "06c1-profile-ingest.js",
    "06c2-profile-converter.js",
    "06c0-sync-card.js",
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

        # Convert top-level const and let to var so module redeclarations in flat bundle scope never throw SyntaxError
        code = re.sub(r'^(?:        )?const\s+', 'var ', code, flags=re.MULTILINE)
        code = re.sub(r'^(?:        )?let\s+', 'var ', code, flags=re.MULTILINE)

        combined_code.append(f"/* --- Module: {p} --- */\n" + code)

bundle_text = "/* --- TaxoPolemics / Flexcapades Bundled Bootstrap --- */\n" + "\n".join(combined_code) + "\n"

with open(target_app, "w", encoding="utf-8") as out:
    out.write(bundle_text)

target_app_assets = os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets/data-bootstrap.js")
target_qa = os.path.join(base_dir, "../../site-tree/public_html/qa/data/data-bootstrap.js")
target_qa_assets = os.path.join(base_dir, "../../site-tree/public_html/qa/app-assets/data-bootstrap.js")

for th in [target_hosted_alt, target_app_assets, target_qa, target_qa_assets]:
    if os.path.exists(os.path.dirname(th)):
        shutil.copyfile(target_app, th)
        print(f"[Bundle] Synced to {th}")

template_app = os.path.join(base_dir, "unrated-map-template.js")
template_app_assets = os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets/unrated-map-template.js")
if os.path.exists(template_app) and os.path.exists(os.path.dirname(template_app_assets)):
    shutil.copyfile(template_app, template_app_assets)
    print(f"[Bundle] Synced unrated-map-template.js to app-assets/")

embedded_comm_src = os.path.join(base_dir, "embedded-communities.js")
if os.path.exists(embedded_comm_src):
    for ec_dst in [
        os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets/embedded-communities.js"),
        os.path.join(base_dir, "../../site-tree/public_html/qa/data/embedded-communities.js"),
        os.path.join(base_dir, "../../site-tree/public_html/qa/app-assets/embedded-communities.js"),
    ]:
        if os.path.exists(os.path.dirname(ec_dst)):
            shutil.copyfile(embedded_comm_src, ec_dst)
            print(f"[Bundle] Synced embedded-communities.js to {ec_dst}")


patches_dir = os.path.join(base_dir, "../js/patches")
patches_src = os.path.join(base_dir, "../js/patches.js")
if os.path.isdir(patches_dir):
    patch_files = sorted([f for f in os.listdir(patches_dir) if f.endswith(".js")])
    if patch_files:
        patch_chunks = []
        for pf in patch_files:
            with open(os.path.join(patches_dir, pf), encoding="utf-8") as pfh:
                patch_chunks.append(pfh.read().rstrip("\n"))
        with open(patches_src, "w", encoding="utf-8") as out_p:
            out_p.write("\n\n".join(patch_chunks) + "\n")
        print(f"[Bundle] Built patches.js from {len(patch_files)} modules in app/js/patches/")

for mod_name in ["layout-editor", "skin-loader"]:
    mod_dir = os.path.join(base_dir, f"../js/{mod_name}")
    mod_target = os.path.join(base_dir, f"../js/{mod_name}.js")
    if os.path.isdir(mod_dir):
        mod_files = sorted([f for f in os.listdir(mod_dir) if f.endswith(".js")])
        if mod_files:
            mod_chunks = []
            for mf in mod_files:
                with open(os.path.join(mod_dir, mf), encoding="utf-8") as mfh:
                    mod_chunks.append(mfh.read())
            with open(mod_target, "w", encoding="utf-8") as out_m:
                out_m.write("".join(mod_chunks))
            print(f"[Bundle] Built {mod_name}.js from {len(mod_files)} modules in app/js/{mod_name}/")

patches_hosted_alt = os.path.join(base_dir, "../../hosted/js/patches.js")
patches_qa = os.path.join(base_dir, "../../site-tree/public_html/qa/js/patches.js")
for ph in [patches_hosted_alt, patches_qa]:
    if os.path.exists(os.path.dirname(ph)) and os.path.exists(patches_src):
        shutil.copyfile(patches_src, ph)
        print(f"[Bundle] Synced patches.js to {ph}")

# Build app.css from app/css/components/*.css and sync to served copies.
css_builder = os.path.join(base_dir, "../../packaging-scripts/build-css.py")
if os.path.isfile(css_builder):
    subprocess.run([sys.executable, css_builder], cwd=os.path.join(base_dir, "../.."), check=True)

css_src = os.path.join(base_dir, "../css/app.css")
for ch in [
    os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets/app.css"),
    os.path.join(base_dir, "../../site-tree/public_html/qa/css/app.css"),
    os.path.join(base_dir, "../../site-tree/public_html/qa/app-assets/app.css")
]:
    if os.path.exists(os.path.dirname(ch)) and os.path.exists(css_src):
        shutil.copyfile(css_src, ch)
        print(f"[Bundle] Synced app.css to {ch}")

# Rebuild docs-skin.js from current skin data
docs_skin_builder = os.path.join(base_dir, "../../packaging-scripts/build_docs_skin.py")
if os.path.isfile(docs_skin_builder):
    subprocess.run([sys.executable, docs_skin_builder], cwd=os.path.join(base_dir, "../.."), check=True)

# Scene Sentinel is one boot script. The part files are the source;
# this join is what the page and the packager load.
sentinel_dir = os.path.join(base_dir, "../js/scene-sentinel")
sentinel_out = os.path.join(base_dir, "../js/scene-sentinel.js")
if os.path.isdir(sentinel_dir):
    sentinel_parts = sorted(fn for fn in os.listdir(sentinel_dir) if fn.endswith(".js"))
    sentinel_body = []
    for fn in sentinel_parts:
        with open(os.path.join(sentinel_dir, fn), encoding="utf-8") as sf:
            sentinel_body.append(sf.read())
    with open(sentinel_out, "w", encoding="utf-8") as sf:
        sf.write("".join(sentinel_body))
    print(f"[Bundle] Built scene-sentinel.js from {len(sentinel_parts)} parts")

# Sync auxiliary JS to hosted/app-assets (and docs-skin.js to hosted/js for docs pages).
js_src_dir = os.path.join(base_dir, "../js")
shell_js = [
    "shell-head.js", "shell-boot.js", "shell-overlay.js", "shell-runtime.js", "shell-post.js", "firebase-ai-init.js",
    "view-nav.js", "layout-editor.js", "scene-sentinel.js", "pitch-pitcher.js", "pitch-pitcher-bank.js",
    "patches.js", "avatar-music.js", "sx-songbook.js", "skin-loader.js", "skin-catalog.js", "docs-skin.js"
]
for f in shell_js:
    src_f = os.path.join(js_src_dir, f)
    dst_dirs = [
        os.path.join(base_dir, "../../site-tree/public_html/hosted/app-assets"),
        os.path.join(base_dir, "../../site-tree/public_html/qa/js"),
        os.path.join(base_dir, "../../site-tree/public_html/qa/app-assets")
    ]
    if f == "docs-skin.js":
        dst_dirs.append(os.path.join(base_dir, "../../site-tree/public_html/hosted/js"))
    for dst_dir in dst_dirs:
        dst_f = os.path.join(dst_dir, f)
        if os.path.exists(src_f) and os.path.exists(dst_dir):
            shutil.copyfile(src_f, dst_f)
            print(f"[Bundle] Synced {f} to {dst_dir}/")

# app/html is the hand-edited app page. build-html.py writes both shells
# and syncs companion pages/assets (gate, guide, quickstart, flyer).
html_builder = os.path.join(base_dir, "../../packaging-scripts/build-html.py")
if os.path.isfile(html_builder):
    subprocess.run([sys.executable, html_builder], cwd=os.path.join(base_dir, "../.."), check=True)

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

print(f"[Bundle] Complete! Generated {round(os.path.getsize(target_app)/1024, 1)} KB ES-bundled bundle.")
