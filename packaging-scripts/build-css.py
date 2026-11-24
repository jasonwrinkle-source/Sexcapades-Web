#!/usr/bin/env python3
import os
import shutil

base_dir = os.path.dirname(__file__)
app_css_dir = os.path.join(base_dir, "../app/css/components")
app_css_out = os.path.join(base_dir, "../app/css/app.css")

target_hosted = os.path.join(base_dir, "../site-tree/public_html/hosted/css/app.css")
target_app_assets = os.path.join(base_dir, "../site-tree/public_html/hosted/app-assets/app.css")

if os.path.exists(app_css_dir):
    files = sorted([f for f in os.listdir(app_css_dir) if f.endswith(".css")])
    css_code = []
    for fn in files:
        with open(os.path.join(app_css_dir, fn), encoding="utf-8") as f:
            css_code.append(f"/* --- Component: {fn} --- */\n" + f.read())
    if css_code:
        full_css = "\n".join(css_code)
        with open(app_css_out, "w", encoding="utf-8") as out:
            out.write(full_css)

for target in [target_hosted, target_app_assets]:
    if os.path.exists(os.path.dirname(target)) and os.path.exists(app_css_out):
        shutil.copyfile(app_css_out, target)

print("[CSS] Built and synced app.css successfully!")
