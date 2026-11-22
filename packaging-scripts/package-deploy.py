#!/usr/bin/env python3
"""Sexcapades 5.0 Unified Packaging & Deployment Engine.

Replaces the legacy package-deploy-all-5.0.sh and package-deploy-app-5.0.sh shell
scripts with a single, high-performance Python engine.

Key improvements:
- Zero filesystem traversal delays / shell timeout traps (no 'find ... -exec chmod').
- Fast, in-memory archive streaming via tarfile with custom TarInfo permissions filter.
- Stamping of ?v=<build>, SW cache name, and PWA manifests with full integrity verification.
- Supports both 'all' and 'app' modes.
- Supports optional direct deployment to Hostinger via streaming tarball over SSH.
"""

import argparse
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import zoneinfo

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OPTIMIZER = os.path.join(ROOT_DIR, "packaging-scripts", "sexcapades-5.0-optimize.py")
BUMP_SCRIPT = os.path.join(ROOT_DIR, "packaging-scripts", "bump-build.py")
STAMP_SCRIPT = os.path.join(ROOT_DIR, "packaging-scripts", "stamp-asset-versions.py")
BUILD_BUNDLE = os.path.join(ROOT_DIR, "app", "data", "build-bundle.py")

EXPECTED_MANIFEST_FILES = [
    "app.css",
    "app.js",
    "vendor/qrcode.min.js",
    "data-bootstrap.js",
    "unrated-map-template.js",
    "images/guide-avatar.jpg",
    "images/hanky-chart.jpg",
    "images/avatar-1.jpg",
    "images/avatar-2.jpg",
    "images/avatar-3.jpg",
    "images/avatar-4.jpg",
    "images/avatar-5.jpg",
    "images/avatar-anon.webp",
    "images/avatar-eve.webp",
    "images/avatar-eve-portrait.webp",
    "images/img-13.webp",
    "images/img-14.webp",
    "images/deknotter-icon.webp",
]

SKIN_PREFIXES = [
    "sex", "flex", "polis", "fores", "chem", "aesth", "experi", "dharma",
    "matter", "philo", "praxi", "quanta", "simul", "tech", "theori", "voca", "nous"
]


def run_command(cmd, cwd=ROOT_DIR):
    """Run a subprocess command and check return code."""
    res = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed ({res.returncode}): {' '.join(cmd)}\n{res.stderr}\n{res.stdout}")
    return res.stdout


def get_default_timestamp():
    try:
        tz = zoneinfo.ZoneInfo("America/Chicago")
        now = datetime.datetime.now(tz)
    except Exception:
        now = datetime.datetime.now()
    return now.strftime("%Y-%m-%d_%H%M")


def parse_build_marker(app_html_path):
    with open(app_html_path, "r", encoding="utf-8") as f:
        content = f.read()
    m = re.search(r'Version [0-9.]+ · Build (\d{4}-\d{2}-\d{2}_\d{4})', content)
    if not m:
        raise ValueError(f"Could not read build marker from {app_html_path}")
    return m.group(0), m.group(1)


def tar_filter_permissions(tarinfo):
    """Set standard permissions in-memory without recursive filesystem chmod."""
    if tarinfo.isdir():
        tarinfo.mode = 0o755
    elif tarinfo.name.endswith(".sh"):
        tarinfo.mode = 0o755
    else:
        tarinfo.mode = 0o644
    tarinfo.uid = 0
    tarinfo.gid = 0
    tarinfo.uname = "root"
    tarinfo.gname = "root"
    return tarinfo


def stage_app_assets(staged_hosted_dir, src_app_html, build_num):
    """Common logic for staging modular app assets into hosted/."""
    app_assets = os.path.join(staged_hosted_dir, "app-assets")
    os.makedirs(os.path.join(app_assets, "vendor"), exist_ok=True)
    os.makedirs(os.path.join(app_assets, "images"), exist_ok=True)

    dest_app_html = os.path.join(staged_hosted_dir, "app.html")
    with open(src_app_html, "r", encoding="utf-8") as f:
        html = f.read()

    # Rewrite relative references to /hosted/app-assets/
    html = html.replace('href="css/app.css"', 'href="/hosted/app-assets/app.css"')
    html = html.replace('src="vendor/', 'src="/hosted/app-assets/vendor/')
    html = html.replace('src="data/', 'src="/hosted/app-assets/')
    html = html.replace('src="js/', 'src="/hosted/app-assets/')
    html = html.replace('src="images/', 'src="/hosted/app-assets/images/')

    with open(dest_app_html, "w", encoding="utf-8") as f:
        f.write(html)

    # Stamp ?v= on all local assets
    run_command([sys.executable, STAMP_SCRIPT, build_num, dest_app_html])

    # Copy files
    shutil.copy(os.path.join(ROOT_DIR, "app", "css", "app.css"), os.path.join(app_assets, "app.css"))
    for item in os.listdir(os.path.join(ROOT_DIR, "app", "vendor")):
        s = os.path.join(ROOT_DIR, "app", "vendor", item)
        if os.path.isfile(s):
            shutil.copy(s, os.path.join(app_assets, "vendor", item))

    for item in os.listdir(os.path.join(ROOT_DIR, "app", "data")):
        if item.endswith(".js"):
            shutil.copy(os.path.join(ROOT_DIR, "app", "data", item), os.path.join(app_assets, item))

    for item in os.listdir(os.path.join(ROOT_DIR, "app", "js")):
        if item.endswith(".js"):
            shutil.copy(os.path.join(ROOT_DIR, "app", "js", item), os.path.join(app_assets, item))

    for item in os.listdir(os.path.join(ROOT_DIR, "app", "images")):
        s = os.path.join(ROOT_DIR, "app", "images", item)
        if os.path.isfile(s):
            shutil.copy(s, os.path.join(app_assets, "images", item))

    # Also sync hosted/images/
    hosted_images = os.path.join(staged_hosted_dir, "images")
    os.makedirs(hosted_images, exist_ok=True)
    for item in os.listdir(os.path.join(ROOT_DIR, "app", "images")):
        s = os.path.join(ROOT_DIR, "app", "images", item)
        if os.path.isfile(s):
            shutil.copy(s, os.path.join(hosted_images, item))

    # Bundle app.js
    bundle_parts = ["view-nav.js", "layout-editor.js", "patches.js", "scene-sentinel.js"]
    bundled_code = []
    for bp in bundle_parts:
        with open(os.path.join(ROOT_DIR, "app", "js", bp), "r", encoding="utf-8") as f:
            bundled_code.append(f.read())
    with open(os.path.join(app_assets, "app.js"), "w", encoding="utf-8") as f:
        f.write("\n".join(bundled_code))

    # Version manifest
    manifest_data = {
        "build": build_num,
        "files": []
    }
    for asset in EXPECTED_MANIFEST_FILES:
        asset_path = os.path.join(app_assets, asset)
        if not os.path.isfile(asset_path):
            raise FileNotFoundError(f"Manifest asset missing from package: {asset}")
        as_type = "image" if asset.startswith("images/") else ("style" if asset.endswith(".css") else "script")
        url = f"/hosted/app-assets/{asset}"
        if as_type != "image":
            url += f"?v={build_num}"
        manifest_data["files"].append({"url": url, "as": as_type})

    with open(os.path.join(app_assets, "version-manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)


def package_app(build_num, out_tar_path, src_app_html):
    """Build app-only deploy tarball."""
    print(f"=== Packaging Sexcapades 5.0 App Deploy (Build {build_num}) ===")
    with tempfile.TemporaryDirectory() as work_dir:
        staged_pkg = os.path.join(work_dir, "pkg")
        capades_dir = os.path.join(staged_pkg, "capades.io", "public_html")
        hosted_dir = os.path.join(capades_dir, "hosted")
        os.makedirs(hosted_dir, exist_ok=True)

        stage_app_assets(hosted_dir, src_app_html, build_num)

        # Service worker
        sw_src = os.path.join(ROOT_DIR, "site-tree", "public_html", "sw.js")
        with open(sw_src, "r", encoding="utf-8") as f:
            sw_content = f.read()
        sw_staged = os.path.join(capades_dir, "sw.js")
        with open(sw_staged, "w", encoding="utf-8") as f:
            f.write(sw_content.replace("__SX_CACHE__", build_num))

        create_tarball(staged_pkg, out_tar_path)
    verify_app_tarball(out_tar_path, build_num)


def package_all(build_num, out_tar_path, src_app_html):
    """Build full deploy-all tarball."""
    print(f"=== Packaging Sexcapades 5.0 Deploy-All (Build {build_num}) ===")
    static_src = os.path.join(ROOT_DIR, "site-tree", "public_html")
    with tempfile.TemporaryDirectory() as work_dir:
        staged_pkg = os.path.join(work_dir, "pkg")
        capades_dir = os.path.join(staged_pkg, "capades.io", "public_html")
        os.makedirs(os.path.join(staged_pkg, "capades.io"), exist_ok=True)

        print("1. Copying static site tree...")
        shutil.copytree(static_src, capades_dir, symlinks=True)

        # Remove *.db and qa/
        for root, dirs, files in os.walk(staged_pkg, topdown=False):
            for file in files:
                if file.endswith(".db"):
                    os.remove(os.path.join(root, file))
        qa_path = os.path.join(capades_dir, "qa")
        if os.path.exists(qa_path):
            shutil.rmtree(qa_path)

        print("2. Stamping service worker...")
        sw_staged = os.path.join(capades_dir, "sw.js")
        with open(sw_staged, "r", encoding="utf-8") as f:
            sw_content = f.read()
        with open(sw_staged, "w", encoding="utf-8") as f:
            f.write(sw_content.replace("__SX_CACHE__", build_num))

        print("2b. Stamping PWA manifests...")
        manifest_shared = os.path.join(capades_dir, "manifest.json")
        manifests_dir = os.path.join(capades_dir, "manifests")
        manifest_files = [manifest_shared] + [
            os.path.join(manifests_dir, f) for f in os.listdir(manifests_dir) if f.endswith(".json")
        ]
        if len(manifest_files) - 1 != 17:
            raise ValueError(f"Expected 17 per-skin manifests, found {len(manifest_files) - 1}")

        for m_path in manifest_files:
            with open(m_path, "r", encoding="utf-8") as f:
                content = f.read()
            content = content.replace("__SX_CACHE__", build_num)
            if "__SX_CACHE__" in content:
                raise ValueError(f"Manifest stamp failed in {m_path}")
            if f"v={build_num}" not in content:
                raise ValueError(f"Manifest lacks build-stamped icon URLs: {m_path}")
            with open(m_path, "w", encoding="utf-8") as f:
                f.write(content)

        print("3. Staging and Bundling App...")
        hosted_dir = os.path.join(capades_dir, "hosted")
        app_html_dest = os.path.join(hosted_dir, "app.html")
        if os.path.exists(app_html_dest):
            os.remove(app_html_dest)
        app_assets = os.path.join(hosted_dir, "app-assets")
        if os.path.exists(app_assets):
            shutil.rmtree(app_assets)

        stage_app_assets(hosted_dir, src_app_html, build_num)

        print("5. Optimizing Gate...")
        gate_export = os.path.join(ROOT_DIR, "site-tree", "public_html", "hosted", "gate.html")
        gate_work = os.path.join(work_dir, "gate")
        run_command([sys.executable, OPTIMIZER, gate_export, gate_work, "gate.html", "gate-assets", "gate"])
        shutil.copy(os.path.join(gate_work, "gate.html"), os.path.join(hosted_dir, "gate.html"))
        if os.path.isfile(os.path.join(gate_work, "gate-assets", "gate.css")) or \
           os.path.isfile(os.path.join(gate_work, "gate-assets", "gate.js")):
            dest_ga = os.path.join(hosted_dir, "gate-assets")
            if os.path.exists(dest_ga):
                shutil.rmtree(dest_ga)
            shutil.copytree(os.path.join(gate_work, "gate-assets"), dest_ga)

        print("6. Optimizing Quickstart...")
        qs_export = os.path.join(ROOT_DIR, "site-tree", "public_html", "hosted", "quickstart.html")
        qs_work = os.path.join(work_dir, "qs")
        run_command([sys.executable, OPTIMIZER, qs_export, qs_work, "quickstart.html", "quickstart-assets", "quickstart"])
        shutil.copy(os.path.join(qs_work, "quickstart.html"), os.path.join(hosted_dir, "quickstart.html"))
        if os.path.isfile(os.path.join(qs_work, "quickstart-assets", "quickstart.css")) or \
           os.path.isfile(os.path.join(qs_work, "quickstart-assets", "quickstart.js")):
            dest_qa = os.path.join(hosted_dir, "quickstart-assets")
            if os.path.exists(dest_qa):
                shutil.rmtree(dest_qa)
            shutil.copytree(os.path.join(qs_work, "quickstart-assets"), dest_qa)

        print("7. Optimizing Guide...")
        guide_export = os.path.join(ROOT_DIR, "site-tree", "public_html", "hosted", "guide.html")
        guide_work = os.path.join(work_dir, "guide")
        run_command([sys.executable, OPTIMIZER, guide_export, guide_work, "guide.html", "guide-assets", "guide"])
        shutil.copy(os.path.join(guide_work, "guide.html"), os.path.join(hosted_dir, "guide.html"))
        dest_guide_assets = os.path.join(hosted_dir, "guide-assets")
        os.makedirs(dest_guide_assets, exist_ok=True)
        for item in os.listdir(os.path.join(guide_work, "guide-assets")):
            s = os.path.join(guide_work, "guide-assets", item)
            d = os.path.join(dest_guide_assets, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, dirs_exist_ok=True)
            else:
                shutil.copy(s, d)

        print("8. Bundling release pipeline scripts...")
        pipeline_dir = os.path.join(staged_pkg, "capades.io", "pipeline")
        os.makedirs(pipeline_dir, exist_ok=True)
        site_pipeline = os.path.join(ROOT_DIR, "site-tree", "pipeline")
        if os.path.isdir(site_pipeline):
            for item in os.listdir(site_pipeline):
                s = os.path.join(site_pipeline, item)
                d = os.path.join(pipeline_dir, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy(s, d)
        shutil.copy(OPTIMIZER, pipeline_dir)
        p_app_sh = os.path.join(ROOT_DIR, "packaging-scripts", "package-deploy-app-5.0.sh")
        if os.path.isfile(p_app_sh):
            shutil.copy(p_app_sh, pipeline_dir)
        handover = os.path.join(ROOT_DIR, "sexcapades-site-handover.md")
        if os.path.isfile(handover):
            shutil.copy(handover, pipeline_dir)

        print("9. Creating tarball with memory permissions filter...")
        create_tarball(staged_pkg, out_tar_path)

    verify_all_tarball(out_tar_path, build_num)


def create_tarball(staged_dir, out_tar_path):
    """Archive directory into .tar.gz applying tar_filter_permissions."""
    with tarfile.open(out_tar_path, "w:gz") as tar:
        tar.add(
            os.path.join(staged_dir, "capades.io"),
            arcname="capades.io",
            filter=tar_filter_permissions
        )


def verify_app_tarball(tar_path, build_num):
    print("Verifying app tarball...")
    with tarfile.open(tar_path, "r:gz") as tar:
        names = set(tar.getnames())
        required = [
            "capades.io/public_html/hosted/app.html",
            "capades.io/public_html/hosted/app-assets/app.js",
            "capades.io/public_html/hosted/app-assets/unrated-map-template.js",
            "capades.io/public_html/hosted/app-assets/data-bootstrap.js",
            "capades.io/public_html/hosted/app-assets/version-manifest.json",
            "capades.io/public_html/sw.js",
        ]
        for req in required:
            if req not in names:
                raise AssertionError(f"Missing required entry: {req}")

        for name in names:
            if name.endswith(".db"):
                raise AssertionError(f"Tarball contains .db files: {name}")
            if name == "capades.io/app.html":
                raise AssertionError("Stray capades.io/app.html")
            if name == "capades.io/index.html":
                raise AssertionError("Stray capades.io/index.html")

        # Check app.html build marker
        f_app = tar.extractfile("capades.io/public_html/hosted/app.html")
        app_html = f_app.read().decode("utf-8")
        if f"Build {build_num}" not in app_html:
            raise AssertionError(f"app.html lacks expected build marker Build {build_num}")

        # Check version manifest
        f_man = tar.extractfile("capades.io/public_html/hosted/app-assets/version-manifest.json")
        man = json.loads(f_man.read().decode("utf-8"))
        if man["build"] != build_num or len(man["files"]) != 18:
            raise AssertionError(f"version-manifest.json invalid: {man}")

        # Check sw.js cache name
        f_sw = tar.extractfile("capades.io/public_html/sw.js")
        sw_text = f_sw.read().decode("utf-8")
        if f"sexcapades-v{build_num}" not in sw_text:
            raise AssertionError(f"sw.js lacks sexcapades-v{build_num}")

        # Check asset references in app.html
        refs = re.findall(r'"(/hosted/app-assets/[^"]+)"', app_html)
        for ref in refs:
            if ref.endswith(".js") or ref.endswith(".css"):
                raise AssertionError(f"Unstamped app-assets ref in app.html: {ref}")
            if ("?v=" in ref) and (not ref.endswith(f"?v={build_num}")):
                raise AssertionError(f"Wrong build stamp in app.html ref: {ref}")

    print("All verification gates passed for app package.")


def verify_all_tarball(tar_path, build_num):
    print("Verifying deploy-all tarball...")
    with tarfile.open(tar_path, "r:gz") as tar:
        names = set(tar.getnames())
        required = [
            "capades.io/public_html/.htaccess",
            "capades.io/public_html/index.html",
            "capades.io/public_html/404.html",
            "capades.io/public_html/sitemap.xml",
            "capades.io/public_html/sw.js",
            "capades.io/public_html/hosted/app.html",
            "capades.io/public_html/hosted/app-assets/app.js",
            "capades.io/public_html/hosted/app-assets/data-bootstrap.js",
            "capades.io/public_html/hosted/app-assets/version-manifest.json",
            "capades.io/public_html/hosted/gate.html",
            "capades.io/public_html/hosted/gate-assets/gate.css",
            "capades.io/public_html/hosted/gate-assets/gate.js",
            "capades.io/public_html/hosted/quickstart.html",
            "capades.io/public_html/hosted/quickstart-assets/quickstart.css",
            "capades.io/public_html/hosted/quickstart-assets/quickstart.js",
            "capades.io/public_html/hosted/guide.html",
            "capades.io/public_html/hosted/guide-assets/guide.js",
            "capades.io/public_html/hosted/flyer.html",
        ]
        for req in required:
            if req not in names:
                raise AssertionError(f"Missing required entry: {req}")

        for name in names:
            if name == "capades.io/.htaccess":
                raise AssertionError(".htaccess at domain root")
            if name.endswith(".db"):
                raise AssertionError(f"Tarball contains .db files: {name}")
            if name == "capades.io/app.html":
                raise AssertionError("Stray capades.io/app.html")
            if name == "capades.io/index.html":
                raise AssertionError("Stray capades.io/index.html")

        # Check app.html build marker
        f_app = tar.extractfile("capades.io/public_html/hosted/app.html")
        app_html = f_app.read().decode("utf-8")
        if f"Build {build_num}" not in app_html:
            raise AssertionError(f"app.html lacks expected build marker Build {build_num}")

        # Check version manifest
        f_man = tar.extractfile("capades.io/public_html/hosted/app-assets/version-manifest.json")
        man = json.loads(f_man.read().decode("utf-8"))
        if man["build"] != build_num or len(man["files"]) != 18:
            raise AssertionError(f"version-manifest.json invalid: {man}")

        # Check .htaccess no-cache rule
        f_ht = tar.extractfile("capades.io/public_html/.htaccess")
        if "version-manifest" not in f_ht.read().decode("utf-8"):
            raise AssertionError(".htaccess lacks version-manifest rule")

        # Check sw.js
        f_sw = tar.extractfile("capades.io/public_html/sw.js")
        sw_text = f_sw.read().decode("utf-8")
        if f"sexcapades-v{build_num}" not in sw_text:
            raise AssertionError(f"sw.js lacks sexcapades-v{build_num}")
        if f"/icons/skins/flex-512.png?v={build_num}" not in sw_text or \
           f"/icons/skins/flex-192.png?v={build_num}" not in sw_text:
            raise AssertionError("sw.js precache lacks stamped flex icon URLs")

        # Check manifests count and stamping
        skin_manifests = [n for n in names if re.match(r"^capades\.io/public_html/manifests/.*\.json$", n)]
        if len(skin_manifests) != 17:
            raise AssertionError(f"Per-skin manifest count {len(skin_manifests)} != 17")
        for sm in skin_manifests:
            sm_txt = tar.extractfile(sm).read().decode("utf-8")
            if "__SX_CACHE__" in sm_txt:
                raise AssertionError(f"Manifest carries literal __SX_CACHE__: {sm}")
            if f"v={build_num}" not in sm_txt:
                raise AssertionError(f"Manifest lacks build-stamped icon URLs: {sm}")

        # Check shared manifest
        f_sm = tar.extractfile("capades.io/public_html/manifest.json")
        sm_txt = f_sm.read().decode("utf-8")
        if "/icons/skins/flex-512.png" not in sm_txt or "/icons/icon-512.png" in sm_txt or "__SX_CACHE__" in sm_txt:
            raise AssertionError("Shared manifest invalid or carries old/unstamped paths")

        # Check per-skin icons (17 skins * 2 = 34)
        for p in SKIN_PREFIXES:
            for s in ("192", "512"):
                icon_path = f"capades.io/public_html/icons/skins/{p}-{s}.png"
                if icon_path not in names:
                    raise AssertionError(f"Missing per-skin icon: {icon_path}")

        # Check gate, guide, quickstart contents
        gate_js = tar.extractfile("capades.io/public_html/hosted/gate-assets/gate.js").read().decode("utf-8")
        if "getReturnDestination" not in gate_js:
            raise AssertionError("gate.js lacks getReturnDestination")

        guide_js = tar.extractfile("capades.io/public_html/hosted/guide-assets/guide.js").read().decode("utf-8")
        if "showGuidePage" not in guide_js:
            raise AssertionError("guide.js lacks showGuidePage")

        qs_html = tar.extractfile("capades.io/public_html/hosted/quickstart.html").read().decode("utf-8")
        if "#app/scan" not in qs_html:
            raise AssertionError("quickstart.html lost #app/scan")

        guide_html = tar.extractfile("capades.io/public_html/hosted/guide.html").read().decode("utf-8")
        if "sexcapades_age_verified" not in guide_html:
            raise AssertionError("guide.html lost sexcapades_age_verified check")

    print("All 14 verification gates passed for deploy-all package.")


def deploy_to_hostinger(tar_path):
    print(f"Deploying {tar_path} to Hostinger...")
    cmd = ["ssh", "hostinger", "cd ~/domains && tar -xzf -"]
    with open(tar_path, "rb") as f:
        res = subprocess.run(cmd, stdin=f, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Deploy failed ({res.returncode}):\n{res.stderr}\n{res.stdout}")
    print("Deployment successfully streamed to Hostinger!")


def main():
    parser = argparse.ArgumentParser(description="Sexcapades 5.0 Unified Packaging & Deployment")
    parser.add_argument("--mode", choices=["all", "app"], default="all", help="Package mode (all or app)")
    parser.add_argument("--timestamp", "-t", default=None, help="Build timestamp (default: America/Chicago now)")
    parser.add_argument("--src", default=os.path.join(ROOT_DIR, "app", "sexcapades-5.0.html"), help="Source app HTML")
    parser.add_argument("--deploy", action="store_true", help="Stream tarball to Hostinger via SSH")
    parser.add_argument("--skip-bundle", action="store_true", help="Skip running build-bundle.py")
    args = parser.parse_args()

    ts = args.timestamp or get_default_timestamp()
    outdir = os.path.join(ROOT_DIR, "deploy-output")
    os.makedirs(outdir, exist_ok=True)
    tar_name = f"deploy-{args.mode}-v5.0-{ts}-optimized.tar.gz"
    out_tar_path = os.path.join(outdir, tar_name)

    if not args.skip_bundle:
        print("1. Running build-bundle.py to refresh ES module bundles...")
        run_command([sys.executable, BUILD_BUNDLE])

    print(f"2. Bumping build to timestamp: {ts}...")
    run_command([sys.executable, BUMP_SCRIPT, ts])

    _, build_num = parse_build_marker(args.src)
    print(f"Target Build Number: {build_num}")

    if args.mode == "app":
        package_app(build_num, out_tar_path, args.src)
    else:
        package_all(build_num, out_tar_path, args.src)

    md5 = hashlib.md5(open(out_tar_path, "rb").read()).hexdigest()
    size_mb = os.path.getsize(out_tar_path) / (1024 * 1024)
    print(f"\nPackage generated: {out_tar_path}")
    print(f"Size: {size_mb:.2f} MB")
    print(f"MD5: {md5}")

    if args.deploy:
        deploy_to_hostinger(out_tar_path)


if __name__ == "__main__":
    main()
