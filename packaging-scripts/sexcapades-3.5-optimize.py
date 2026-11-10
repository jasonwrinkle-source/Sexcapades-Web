#!/usr/bin/env python3
"""
Sexcapades 3.0 web-load optimization (post-processing step).

Runs at "sync" time (sync app / sync all), BEFORE the tar is built.
Input : single-file 3.0 artifact HTML (builders work on this via artifact.edit)
Output: optimized file set (<entry>.html + <assets-dir>/) preserving ALL fixes and the
        About-dialog version string ("Version 3.5 · Build YYYY-MM-DD_HHMM").
        Entry defaults to index.html; pass e.g. app.html for drop-in deploys.

v3.0 structural differences from 2.0 (why this is a separate script):
  - 4 <style> blocks (not 1) -> concatenated to <assets-dir>/app.css
  - Data-bootstrap data-URI has a different base64 prefix (content now starts
    "(window.__SEXCAPADES_DATA_READY || Promise...)" instead of
    "(window.__SEXCAPADES_DATA_READY" directly). Identified by decoded content.
  - Remember-profiles script uses `var storageKey = "sexcapades_2x_..."` marker
    (not the 2.0 `!function(){var e="sexcapades_2x_..."` form).
  - New inline scripts kept as-is: layout-settings hash parser, deep-link boot.
  - Version string is "Version 3.5 · Build" (not "Version 2.0 (beta) · Build").

Transformations:
  0. Strip build-history HTML comments (`<!-- Build YYYY-MM-DD_HHMM — ... -->`)
     from the deployed entry HTML. This ONLY affects the optimized output:
     the single-file input (used for Drive backups) is never modified.
     BUILD-MANIFEST and all other comments are preserved.
  1. Extract all inline <style> blocks -> <assets-dir>/app.css (document order)
  2. Extract 9 base64 <img> -> <assets-dir>/images/ (attrs preserved)
  3. QRCode base64 data-URI -> <assets-dir>/vendor/qrcode.min.js (deferred)
  4. Data-bootstrap base64 data-URI -> <assets-dir>/data-bootstrap.js (deferred,
     identified by decoded content prefix)
  5. jsPDF+svg2pdf base64 -> <assets-dir>/vendor/*.js, still lazy-loaded on
     first use via __loadScriptOnce (URLs swapped, caching kept)
  6. Bundle inline body scripts -> <assets-dir>/app.js (single deferred script,
     document order preserved: app.js -> qrcode -> data-bootstrap)
  7. Keep inline: age-gate + layout-settings + deep-link boot scripts
     (must run before paint), prevalence/popularity JSON (tiny,
     read via getElementById)
  8. Build-stamp the shell's generated JS/CSS asset references with
     ?v=<BUILD> (build parsed from the About version string). Pairs with
     the service worker's exact-URL cache matching: a cached asset from
     one build can never answer another build's shell.

Usage:
  python3 sexcapades-3.0-optimize.py <input.html> <outdir> [entry-name] [assets-dir] [profile]
  entry-name defaults to "index.html"; assets-dir defaults to "app-assets".
  Pass e.g. "app.html" so the bundle
  drops in as a direct replacement for the live page (no rename on deploy).
  profile defaults to "app" (the pipeline above). gate/guide/quickstart
  select the generic profile (see optimize_generic): every artifact page
  deploys as a split bundle, per Jason's definition of deploy-all.

Boot fix (2026-10-20, app profile steps 6b/6c): the deferred app.js bundle
used to leave parse-time inline __sxInit(...) callers (view navigation,
Scene Sentinel) throwing ReferenceError, so those modules never
initialized. The optimizer now inserts a queue stub ahead of the first
inline caller and makes the bundle adopt the stub's queue.
"""
import base64
import hashlib
import os
import re
import sys

IMG_NAMES = [
    ("guide-avatar.jpg", "jpeg"),          # header, critical -> stays eager
    ("hanky-chart-preview.jpg", "jpeg"),   # lazy
    ("hanky-chart.jpg", "jpeg"),           # lazy
    ("avatar-1.jpg", "jpeg"),              # lazy (profile menu)
    ("avatar-2.jpg", "jpeg"),              # lazy
    ("avatar-3.jpg", "jpeg"),              # lazy
    ("avatar-4.jpg", "jpeg"),              # lazy
    ("avatar-5.jpg", "jpeg"),              # lazy
    ("avatar-anon.webp", "webp"),          # lazy (anonymous avatar)
    ("avatar-eve.webp", "webp"),           # lazy (Eve Morgan Vale sample button, added build 2026-10-25_1810)
    ("deknotter-icon.webp", "webp"),       # lazy (DeKnotter button icon, added build 2026-10-21_1955)
]


def _strip_leading_comments(text):
    """Strip leading whitespace and /* ... */ block comments, repeatedly.

    Identity-check helper only (2026-10-29, QR swap): the pinned qrcode
    1.5.4 bundle starts with an MIT license banner comment, so a decoded
    head no longer starts literally with "var QRCode=". Stripping leading
    comments before the startswith check restores identification WITHOUT
    touching the payload: callers still write the full decoded bytes
    verbatim, license banner included, to the packaged vendor file.
    An unterminated comment stops stripping (returns the remainder).
    """
    s = text
    while True:
        s = s.lstrip()
        if s.startswith("/*"):
            end = s.find("*/", 2)
            if end == -1:
                break
            s = s[end + 2:]
            continue
        break
    return s


def _stamp_asset_refs(html, assets_dir, build):
    """Append ?v=<build> to every generated JS/CSS asset reference in the
    shell (link/script tags pointing into <assets_dir>/). The service
    worker matches cached assets by exact URL, query string included, so
    a stamped reference can only ever be satisfied by its own build's
    file. Images are deliberately left unstamped (not code; the packager
    gate checks JS/CSS references only). Returns (html, count)."""
    ref_re = re.compile(
        r'((?:href|src)=")(' + re.escape(assets_dir) +
        r'/[^"]+?\.(?:js|css))(")')
    return ref_re.subn(
        lambda m: f"{m.group(1)}{m.group(2)}?v={build}{m.group(3)}", html)


def main():
    src, outdir = sys.argv[1], sys.argv[2]
    entry = sys.argv[3] if len(sys.argv) > 3 else "index.html"
    assets_dir = sys.argv[4] if len(sys.argv) > 4 else "app-assets"
    # Optional 5th arg: page profile. "app" (default) is the original
    # app-specific pipeline below; gate/guide/quickstart use the generic
    # profile in optimize_generic() (extract what's actually in the page).
    profile = sys.argv[5] if len(sys.argv) > 5 else "app"
    if profile != "app":
        optimize_generic(src, outdir, entry, assets_dir, profile)
        return
    with open(src, encoding="utf-8", errors="replace") as fh:
        html = fh.read()
    orig_len = len(html)
    os.makedirs(os.path.join(outdir, assets_dir, "images"), exist_ok=True)
    os.makedirs(os.path.join(outdir, assets_dir, "vendor"), exist_ok=True)
    report = {"images": [], "vendor": []}

    # --- 0. Strip build-history HTML comments (DEPLOY-ONLY).
    # These are the per-build changelog entries like
    # "<!-- Build 2026-10-18_1846 — ... -->". They are the permanent record in
    # the single-file Drive backups (input file is never modified), but they
    # bloat the deployed entry HTML (~125KB). BUILD-MANIFEST and all other
    # HTML comments are preserved.
    build_comment_re = re.compile(
        r'<!--\s*Build \d{4}-\d{2}-\d{2}_\d{4}\b.*?-->', re.S)
    build_comments = build_comment_re.findall(html)
    stripped_bytes = sum(len(c.encode("utf-8")) for c in build_comments)
    html = build_comment_re.sub("", html)
    report["build_comments_stripped"] = len(build_comments)
    report["build_comments_kb"] = stripped_bytes // 1024

    # --- 1. Extract ALL <style> blocks -> assets/app.css (document order)
    # NOTE (2026-10-25): the tag name must end at whitespace or '>' — a bare
    # <style[^>]*> also matched '<style-folder>' inside a JS comment and
    # swallowed the Lane A player script into app.css.
    styles = list(re.finditer(r"<style(?:\s[^>]*)?>(.*?)</style>", html, re.S))
    assert styles, "no style blocks found - artifact structure changed, aborting"
    css_parts = []
    # Replace from the end so offsets stay valid; insert link at first block
    first_start = styles[0].start()
    for sm in reversed(styles):
        css_parts.append(sm.group(1))
        html = html[:sm.start()] + html[sm.end():]
    css_parts.reverse()
    css = "\n".join(css_parts)
    with open(os.path.join(outdir, assets_dir, "app.css"), "w", encoding="utf-8") as fh:
        fh.write(css)
    html = (html[:first_start] +
            f'<link rel="stylesheet" href="{assets_dir}/app.css"/>' +
            html[first_start:])
    report["css_kb"] = len(css) // 1024
    report["css_blocks"] = len(styles)

    # --- 2. Extract base64 images (in document order), deduplicated by
    # payload hash (same pattern as _extract_css_images): identical blobs
    # share ONE file. The center fix inlines the guide portrait twice
    # (header button + hidden center source) and the hanky preview and
    # the full chart are the same bytes, so 12 tags collapse to 10 files
    # (the docstring's long-standing count). Pairing stays reversed
    # (last name <-> last tag) so the paired tag names each file; an
    # unpaired tag must reuse an already-written identical blob, else
    # abort — a genuinely new image the table does not know is a real
    # mismatch, not a duplicate.
    img_tags = list(re.finditer(
        r'<img\b[^>]*?src="data:image/([a-z]+);base64,([A-Za-z0-9+/=]+)"[^>]*>', html))
    assert img_tags, "no base64 imgs found - artifact structure changed, aborting"
    paired = {}
    for (fname, _ftype), tagm in zip(reversed(IMG_NAMES), reversed(img_tags)):
        paired[id(tagm)] = fname
    written = {}
    deduped = 0
    for tagm in reversed(img_tags):
        ftype, b64 = tagm.group(1), tagm.group(2)
        data = base64.b64decode(b64)
        digest = hashlib.md5(data).hexdigest()
        if digest in written:
            fname = written[digest]
            deduped += 1
        else:
            fname = paired.get(id(tagm))
            assert fname is not None, \
                f"unpaired base64 img with no table entry (blob {digest[:12]}) - aborting"
            with open(os.path.join(outdir, assets_dir, "images", fname), "wb") as fh:
                fh.write(data)
            written[digest] = fname
            report["images"].append((fname, len(data) // 1024))
        new_tag = tagm.group(0).replace(
            f'src="data:image/{ftype};base64,{b64}"',
            f'src="{assets_dir}/images/{fname}"')
        assert new_tag != tagm.group(0), "img src replacement failed"
        html = html[:tagm.start()] + new_tag + html[tagm.end():]
    report["images"].reverse()
    report["images_deduped"] = deduped

    # --- 3 & 4. Data-URI scripts: identify by decoded content, not prefix
    # v3.0 has 2: QRCode (var QRCode=...) and data-bootstrap
    # ((window.__SEXCAPADES_DATA_READY || ...). The 2.0 base64-prefix match
    # fails on v3.0 because the bootstrap content changed.
    data_uri_scripts = list(re.finditer(
        r'<script defer="" src="data:application/javascript;base64,'
        r'([A-Za-z0-9+/=]+)">', html))
    qrcode_m = None
    bootstrap_m = None
    for dm in data_uri_scripts:
        try:
            head = base64.b64decode(dm.group(1)[:2000]).decode(
                "utf-8", errors="replace")
        except Exception:
            continue
        # QR identity is comment-tolerant (2026-10-29): the pinned qrcode
        # 1.5.4 bundle starts with an MIT license banner comment, so the
        # decoded head starts with "/*", not "var QRCode=". Strip leading
        # comments/whitespace for the CHECK only; the full decoded bytes
        # (banner included) are still written verbatim below.
        if _strip_leading_comments(head).startswith("var QRCode="):
            qrcode_m = dm
            continue
        # Bundle headers grew (P0 refactor) — the bootstrap marker may sit
        # past the head window, so fall back to scanning the full script.
        try:
            full = base64.b64decode(dm.group(1)).decode(
                "utf-8", errors="replace")
        except Exception:
            continue
        if "__SEXCAPADES_DATA_READY" in full:
            bootstrap_m = dm
    assert qrcode_m, "QRCode data-URI script not found - aborting"
    assert bootstrap_m, "data-bootstrap data-URI script not found - aborting"

    with open(os.path.join(outdir, assets_dir, "vendor", "qrcode.min.js"), "wb") as fh:
        fh.write(base64.b64decode(qrcode_m.group(1)))
    report["vendor"].append(
        ("qrcode.min.js", len(base64.b64decode(qrcode_m.group(1))) // 1024))
    html = (html[:qrcode_m.start()] +
            f'<script defer="" src="{assets_dir}/vendor/qrcode.min.js"></script>' +
            html[qrcode_m.end():])
    # Re-find bootstrap after html mutation (offsets shifted)
    bootstrap_m = re.search(
        r'<script defer="" src="data:application/javascript;base64,'
        r'([A-Za-z0-9+/=]+)">', html)
    # Identify again by content to be safe
    found = None
    for dm in re.finditer(
            r'<script defer="" src="data:application/javascript;base64,'
            r'([A-Za-z0-9+/=]+)">', html):
        try:
            full = base64.b64decode(dm.group(1)).decode(
                "utf-8", errors="replace")
        except Exception:
            continue
        if "__SEXCAPADES_DATA_READY" in full:
            found = dm
            break
    assert found, "data-bootstrap script lost after QRCode extraction"
    bootstrap_m = found
    boot = base64.b64decode(bootstrap_m.group(1)).decode("utf-8", errors="replace")
    with open(os.path.join(outdir, assets_dir, "data-bootstrap.js"), "w",
              encoding="utf-8") as fh:
        fh.write(boot)
    report["vendor"].append(
        ("data-bootstrap.js", len(boot.encode("utf-8")) // 1024))
    html = (html[:bootstrap_m.start()] +
            f'<script defer="" src="{assets_dir}/data-bootstrap.js"></script>' +
            html[bootstrap_m.end():])

    # --- 4b. Generic leftover data-URI scripts (2026-10-25): any
    # remaining <script src="data:application/javascript;base64,..."> tag
    # — deferred or not — is extracted to its own file, so a new embedded
    # script (e.g. the player-music songbook mirror, non-deferred, matching
    # neither the QRCode nor the bootstrap identity) cannot trip the final
    # leftover assertion. The known scripts above are already gone, so
    # anything left here is genuinely new. The tag's defer/async attributes
    # are preserved so execution order semantics do not change.
    # (2026-10-28: async accepted alongside defer — Thread 1 made the
    # songbook tag async; without this the tag survives extraction and
    # trips the leftover assertion.)
    _embedded_n = 0
    for _lm in reversed(list(re.finditer(
            r'<script((?: (?:defer|async)(?:="")?)*) src="data:application/javascript;base64,'
            r'([A-Za-z0-9+/=]+)">', html))):
        _raw = base64.b64decode(_lm.group(2))
        _text = _raw.decode("utf-8", errors="replace")
        if "SX-SONGBOOK" in _text:
            _rel = "sx-songbook.js"
        else:
            _embedded_n += 1
            _rel = f"embedded-script-{_embedded_n}.js"
        with open(os.path.join(outdir, assets_dir, _rel), "wb") as fh:
            fh.write(_raw)
        _attrs = _lm.group(1) or ""
        html = (html[:_lm.start()] +
                f'<script{_attrs} src="{assets_dir}/{_rel}"></script>' +
                html[_lm.end():])
        report["vendor"].append((_rel, len(_raw) // 1024))

    # --- 5. jsPDF + svg2pdf base64 -> vendor files, still lazy via __loadScriptOnce
    mj = re.search(r'__loadScriptOnce\("data:application/javascript;base64,'
                   r'(LyoqIEBsaWNlbnNl[A-Za-z0-9+/=]+)"\)', html)
    assert mj, "jsPDF data-URI not found - aborting"
    jspdf = base64.b64decode(mj.group(1))
    assert b"jsPDF" in jspdf[:200], "jsPDF blob identity check failed"
    with open(os.path.join(outdir, assets_dir, "vendor", "jspdf.umd.min.js"), "wb") as fh:
        fh.write(jspdf)
    ms = re.search(r'__loadScriptOnce\("data:application/javascript;base64,'
                   r'(LyoqCiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKQ[A-Za-z0-9+/=]+)"\)', html)
    assert ms, "svg2pdf data-URI not found - aborting"
    svg2pdf = base64.b64decode(ms.group(1))
    assert b"svg2pdf" in svg2pdf[:200000].lower(), "svg2pdf blob identity check failed"
    with open(os.path.join(outdir, assets_dir, "vendor", "svg2pdf.umd.min.js"), "wb") as fh:
        fh.write(svg2pdf)
    report["vendor"].extend([
        ("jspdf.umd.min.js", len(jspdf) // 1024),
        ("svg2pdf.umd.min.js", len(svg2pdf) // 1024),
    ])
    _pdf_replacements = [
        (f'__loadScriptOnce("data:application/javascript;base64,{mj.group(1)}")',
         f'__loadScriptOnce("{assets_dir}/vendor/jspdf.umd.min.js")'),
        (f'__loadScriptOnce("data:application/javascript;base64,{ms.group(1)}")',
         f'__loadScriptOnce("{assets_dir}/vendor/svg2pdf.umd.min.js")'),
    ]

    # --- 6. Bundle inline body scripts -> assets/app.js (one deferred script)
    # Keep inline: age-gate, layout-settings hash parser, deep-link boot
    # (must run before paint), prevalence/popularity JSON blocks.
    parts = []

    def _fallback_in_comment(region_start, ts):
        """True if position ts (the fallback backward-search block start)
        lies inside a JS/HTML comment -- i.e. the backward "<script>" search
        misfired and the extracted body would be missing its opening
        comment marker. This is a HARD failure (the bundle would not
        parse); every other validation in this script stays informational
        and exits successfully."""
        i = region_start
        in_block = False  # /* ... */
        in_line = False   # // ... to end of line
        in_html = False   # <!-- ... -->
        n = len(html)
        while i < ts and i < n:
            if in_block:
                if html.startswith("*/", i):
                    in_block = False
                    i += 2
                else:
                    i += 1
                continue
            if in_line:
                if html[i] == "\n":
                    in_line = False
                i += 1
                continue
            if in_html:
                if html.startswith("-->", i):
                    in_html = False
                    i += 3
                else:
                    i += 1
                continue
            if html.startswith("<!--", i):
                in_html = True
                i += 4
            elif html.startswith("/*", i):
                in_block = True
                i += 2
            elif html.startswith("//", i):
                in_line = True
                i += 2
            else:
                i += 1
        return in_block or in_line or in_html

    def take(marker, label):
        nonlocal html
        mi = html.find(marker)
        assert mi > 0, f"marker '{label}' not found - aborting"
        ts = html.rfind("<script>", 0, mi)
        assert ts >= 0, f"script open for '{label}' not found - aborting"
        end = html.find("</script>", mi)
        assert end > 0
        # Structural validation: the backward "<script>" search is a fallback
        # block-start locator. A literal "<script>" inside a JS/HTML comment
        # makes it land mid-comment, so the extracted body is missing its
        # opening comment marker and the bundle will not parse (2026-10-19:
        # deploy-app 1857 shipped this way). Abort loudly on exactly this
        # signature; all other optimizer logging stays informational.
        prev_close = html.rfind("</script>", 0, mi)
        region_start = prev_close + len("</script>") if prev_close >= 0 else 0
        assert not _fallback_in_comment(region_start, ts), (
            f"block '{label}': backward <script> search landed inside a "
            f"comment -- extracted body would be missing its opening "
            f"comment marker - aborting")
        body = html[ts + len("<script>"):end]
        assert marker in body, f"script block '{label}' mismatch - aborting"
        assert "<script" not in body, f"nested script in '{label}' - aborting"
        parts.append((label, body))
        html = html[:ts] + html[end + len("</script>"):]
        return ts

    def take_optional(marker, label):
        nonlocal html
        if html.find(marker) <= 0:
            return None
        return take(marker, label)

    pos = take("window.__EMBEDDED_SAMPLE_PROFILES=", "sample-profiles")
    take('!function(){"use strict";if(!window.SexcapadesRuntime)', "runtime-shim")
    take_optional("window.__SEXCAPADES_EMBEDDED_DATA=", "embedded-data")
    take_optional('var names=["community-fetlife.json"', "dataset-loader")
    take("window.__loadScriptOnce=function()", "lib-loader")
    # v3.0 remember-profiles marker (2.0 used !function(){var e="sexcapades_2x_...")
    take('var storageKey = "sexcapades_2x_remembered_profiles"', "remember-profiles")
    take_optional('document.getElementById("layoutEditor")', "layout-editor")
    take_optional("function fetchCount()", "visitor-counter")
    appjs = "\n".join(
        f"/* ---- {label} (from inline) ---- */\n{body}" for label, body in parts)
    for old, new in _pdf_replacements:
        appjs = appjs.replace(old, new)
        html = html.replace(old, new)
    # --- 6b. Boot fix (2026-10-20): adopt the __sxInit queue stub's queue.
    # app.js is a single DEFERRED script, so it executes only after the whole
    # document has been parsed. Inline modules that stay in the entry HTML
    # (view navigation, Scene Sentinel) call __sxInit(...) at parse time --
    # before this bundle runs -- and threw "ReferenceError: __sxInit is not
    # defined", so those modules never initialized. Step 6c inserts a tiny
    # inline stub ahead of the first such caller that queues registrations
    # on window.__sxInitQueue; the line below makes the real machinery ADOPT
    # that pre-queued array instead of reinitializing it empty. The bundle's
    # own `function __sxInit` declaration then replaces the stub, and the
    # existing __sxFlushInit wiring drains the adopted queue (verified by
    # headless-Chromium boot probe: zero page errors, both modules live).
    assert appjs.count("var __sxInitQueue = [];") == 1, \
        "__sxInitQueue initializer not found exactly once in bundle - aborting"
    appjs = appjs.replace(
        "var __sxInitQueue = [];",
        "var __sxInitQueue = window.__sxInitQueue || [];")
    with open(os.path.join(outdir, assets_dir, "app.js"), "w", encoding="utf-8") as fh:
        fh.write(appjs)
    report["appjs_kb"] = len(appjs.encode("utf-8")) // 1024
    html = (html[:pos] +
            f'<script defer="" src="{assets_dir}/app.js"></script>' +
            html[pos:])

    # --- 6c. Boot fix (2026-10-20): inline __sxInit queue stub.
    # Inserted immediately before the first EXECUTING inline script block
    # that calls __sxInit( -- those callers run at parse time, long before
    # the deferred app.js bundle defines the real registrar. The stub queues
    # their callbacks on window.__sxInitQueue; step 6b makes app.js adopt
    # that exact queue, and its function declaration replaces the stub.
    sx_stub = (
        '<script>/* __sxInit queue stub (optimizer boot fix 2026-10-20): '
        'inline modules below register before the deferred bundle runs; '
        'the bundle adopts this queue and replaces this registrar. */'
        'window.__sxInitQueue=window.__sxInitQueue||[];'
        'if(typeof window.__sxInit!=="function"){'
        'window.__sxInit=function(fn){window.__sxInitQueue.push(fn);};}'
        '</script>')
    stub_inserted = False
    for sm in re.finditer(r"<script\b([^>]*)>(.*?)</script>", html, re.S):
        attrs, sbody = sm.group(1), sm.group(2)
        if "src=" in attrs:
            continue
        tm = re.search(r'type="([^"]*)"', attrs)
        if tm and tm.group(1) not in ("", "text/javascript", "module"):
            continue
        if "__sxInit(" in sbody:
            html = html[:sm.start()] + sx_stub + html[sm.start():]
            stub_inserted = True
            break
    assert stub_inserted, \
        "no inline __sxInit caller found for stub insertion - aborting"
    report["sxinit_stub"] = True

    # --- final verification ---
    # A code comment may mention the MIME type with an embedded URI (P0 refactor
    # docs) — only actual script references count as leftovers.
    assert "data:image/" not in html, "leftover data: image in HTML"
    assert 'src="data:application/javascript;base64' not in html, \
        "leftover data: JS script in HTML"
    assert '__loadScriptOnce("data:application/javascript;base64' not in html, \
        "leftover data: JS lazy-load in HTML"
    # Version-agnostic (2026-11-08): matches 3.5, 4.0, 5.0, ... so a major
    # bump never breaks the optimizer again.
    assert re.search("Version [0-9.]+ \u00b7 Build", html), \
        "content check failed: 'Version <n> · Build' missing"
    for needle in ["__loadScriptOnce", "__SEXCAPADES_DATA_READY",
                   "SexcapadesRuntime", "__EMBEDDED_SAMPLE_PROFILES",
                   "sexcapades_2x_remembered_profiles",
                   "__SEXCAPADES_EMBEDDED_DATA"]:
        assert needle in html or needle in appjs, f"code check failed: {needle}"
    assert "@font-face" in css, "fonts lost"

    # --- 7. Build-stamp the shell's generated JS/CSS asset references.
    # The marker checks above already proved the About build string is in
    # the shell; parse the build out of it and stamp every app-assets
    # JS/CSS reference ?v=<BUILD> so the service worker's exact-URL cache
    # can never pair this shell with another build's scripts or styles.
    bm = re.search("Version [0-9.]+ \u00b7 Build "
                   r"(\d{4}-\d{2}-\d{2}_\d{4})", html)
    assert bm, "build marker vanished before stamping - aborting"
    html, n_stamped = _stamp_asset_refs(html, assets_dir, bm.group(1))
    assert n_stamped >= 4, \
        f"expected >=4 stamped asset references, got {n_stamped} - aborting"
    report["stamped_refs"] = n_stamped
    report["build"] = bm.group(1)

    with open(os.path.join(outdir, entry), "w", encoding="utf-8") as fh:
        fh.write(html)

    new_len = len(html.encode("utf-8"))
    print(f"input : {orig_len//1024} KB single file")
    print(f"output: {entry} {new_len//1024} KB")
    print(f"  build-history comments stripped: "
          f"{report['build_comments_stripped']} ({report['build_comments_kb']} KB)")
    print(f"  {assets_dir}/app.css  ({report['css_blocks']} blocks) {report['css_kb']} KB")
    print(f"  {assets_dir}/app.js             {report['appjs_kb']} KB")
    print(f"  asset references stamped ?v={report['build']}: "
          f"{report['stamped_refs']}")
    for fname, kb in report["images"]:
        print(f"  {assets_dir}/images/{fname:<22} {kb} KB")
    if report.get("images_deduped"):
        print(f"  ({report['images_deduped']} duplicate img tag(s) collapsed "
              f"to shared files)")
    for fname, kb in report["vendor"]:
        print(f"  {assets_dir}/{fname:<28} {kb} KB")
    if report.get("sxinit_stub"):
        print("  __sxInit queue stub inserted (boot fix); bundle adopts queue")
    print("All content/code checks passed.")


# ---------------------------------------------------------------------------
# Generic profile (gate / guide / quickstart) -- 2026-10-20.
#
# Jason's definition of deploy: EVERY artifact page goes through the
# optimizer into a split bundle, not just the app. These pages do not share
# the app's structure, so instead of the app's marker-based extraction this
# profile extracts whatever the page actually contains:
#   0. Strip build-history HTML comments (same rule as the app).
#   1. All <style> blocks -> <assets>/<page>.css; base64 images embedded in
#      the CSS (the gate repeats one ~635KB PNG background three times) are
#      decoded ONCE per unique payload -> <assets>/images/css-img-N.<ext>
#      and the url(...) references rewritten to match.
#   2. Base64 <img> tags -> <assets>/images/img-N.<ext> (document order).
#   3. Deferred data-URI scripts -> vendor files (content-sniffed names:
#      QRCode / data-bootstrap keep their canonical names).
#   4. __loadScriptOnce("data:...") lazy libraries -> vendor files, URLs
#      swapped (jsPDF / svg2pdf keep their canonical names).
#   5. Plain inline scripts -> <assets>/<page>.js, one deferred tag at the
#      first bundled block's position, document order preserved. Kept
#      inline: non-JS blocks (JSON), document.write users (defer changes
#      their semantics), and per-page before-paint scripts -- for the
#      guide, the age-verified bounce (it must run at parse time, exactly
#      like the app's age-gate script stays inline).
# ---------------------------------------------------------------------------

_IMG_EXT = {"jpeg": "jpg", "jpg": "jpg", "png": "png", "webp": "webp",
            "gif": "gif", "svg+xml": "svg", "x-icon": "ico"}


def _img_ext(mime_subtype):
    return _IMG_EXT.get(mime_subtype.lower(), re.sub(r"[^a-z0-9]", "", mime_subtype.lower()) or "bin")


def _extract_css_images(css, images_dir, report):
    """Decode data-URI images out of CSS text, deduped by payload hash.
    Returns the rewritten CSS. url() targets become images/<file>, relative
    to the CSS file's own directory (<assets>/)."""
    import hashlib
    pat = re.compile(
        r'url\(\s*(["\']?)data:image/([a-z+.-]+);base64,([A-Za-z0-9+/=]+)\1\s*\)')
    seen = {}
    order = []

    def repl(m):
        quote, subtype, b64 = m.group(1), m.group(2), m.group(3)
        key = hashlib.sha256(b64.encode()).hexdigest()
        if key not in seen:
            fname = f"css-img-{len(order) + 1}.{_img_ext(subtype)}"
            data = base64.b64decode(b64)
            with open(os.path.join(images_dir, fname), "wb") as fh:
                fh.write(data)
            seen[key] = fname
            order.append((fname, len(data) // 1024))
        return f'url({quote}images/{seen[key]}{quote})'

    new_css = pat.sub(repl, css)
    report["css_images"] = order
    report["css_images_deduped"] = len(pat.findall(css)) - len(order)
    return new_css


def optimize_generic(src, outdir, entry, assets_dir, page):
    with open(src, encoding="utf-8", errors="replace") as fh:
        html = fh.read()
    orig_len = len(html)
    assets_path = os.path.join(outdir, assets_dir)
    images_dir = os.path.join(assets_path, "images")
    vendor_dir = os.path.join(assets_path, "vendor")
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(vendor_dir, exist_ok=True)
    report = {"images": [], "vendor": [], "css_images": []}

    # --- 0. Strip build-history comments (same deploy-only rule as app).
    build_comment_re = re.compile(
        r'<!--\s*Build \d{4}-\d{2}-\d{2}_\d{4}\b.*?-->', re.S)
    report["build_comments_stripped"] = len(build_comment_re.findall(html))
    html = build_comment_re.sub("", html)

    # --- 1. Style blocks -> <page>.css (+ CSS-embedded image extraction)
    # NOTE (2026-10-25): same tag-name rule as the app profile — '<style-folder>'
    # inside a comment must not match as a style tag.
    styles = list(re.finditer(r"<style(?:\s[^>]*)?>(.*?)</style>", html, re.S))
    css_text = None
    if styles:
        first_start = styles[0].start()
        css_parts = []
        for sm in reversed(styles):
            css_parts.append(sm.group(1))
            html = html[:sm.start()] + html[sm.end():]
        css_parts.reverse()
        css_text = "\n".join(css_parts)
        css_text = _extract_css_images(css_text, images_dir, report)
        with open(os.path.join(assets_path, f"{page}.css"), "w",
                  encoding="utf-8") as fh:
            fh.write(css_text)
        html = (html[:first_start] +
                f'<link rel="stylesheet" href="{assets_dir}/{page}.css"/>' +
                html[first_start:])
        report["css_kb"] = len(css_text.encode("utf-8")) // 1024
        report["css_blocks"] = len(styles)

    # --- 2. Base64 <img> tags -> images/img-N.<ext> (document order)
    img_tags = list(re.finditer(
        r'<img\b[^>]*?src="data:image/([a-z+.-]+);base64,([A-Za-z0-9+/=]+)"[^>]*>',
        html))
    for i, tagm in enumerate(reversed(img_tags), start=1):
        idx = len(img_tags) - i + 1
        subtype, b64 = tagm.group(1), tagm.group(2)
        fname = f"img-{idx}.{_img_ext(subtype)}"
        data = base64.b64decode(b64)
        with open(os.path.join(images_dir, fname), "wb") as fh:
            fh.write(data)
        new_tag = tagm.group(0).replace(
            f'src="data:image/{subtype};base64,{b64}"',
            f'src="{assets_dir}/images/{fname}"')
        assert new_tag != tagm.group(0), "img src replacement failed"
        html = html[:tagm.start()] + new_tag + html[tagm.end():]
        report["images"].append((fname, len(data) // 1024))
    report["images"].reverse()

    # --- 3. Data-URI scripts -> vendor files (content-sniffed)
    # (2026-10-25 generic leftover rule: deferred OR NOT — a new embedded
    # script such as the player-music songbook mirror is non-deferred and
    # must not survive into the page to trip the leftover assertion.
    # The tag's defer attribute is preserved so execution order does
    # not change.)
    du = list(re.finditer(
        r'<script( defer="")? src="data:application/javascript;base64,'
        r'([A-Za-z0-9+/=]+)">', html))
    for i, dm in enumerate(reversed(du), start=1):
        raw = base64.b64decode(dm.group(2))
        text = raw.decode("utf-8", errors="replace")
        # Same comment-tolerant QR identity as the app profile (2026-10-29):
        # strip leading comments/whitespace for the CHECK only; the full
        # raw bytes (license banner included) are written verbatim below.
        if _strip_leading_comments(text).startswith("var QRCode="):
            rel = "vendor/qrcode.min.js"
        elif "__SEXCAPADES_DATA_READY" in text:
            rel = "data-bootstrap.js"
        elif "SX-SONGBOOK" in text:
            rel = "vendor/sx-songbook.js"
        else:
            rel = f"vendor/data-script-{len(du) - i + 1}.js"
        with open(os.path.join(assets_path, rel), "wb") as fh:
            fh.write(raw)
        defer = dm.group(1) or ""
        html = (html[:dm.start()] +
                f'<script{defer} src="{assets_dir}/{rel}"></script>' +
                html[dm.end():])
        report["vendor"].append((rel, len(raw) // 1024))
    report["vendor"].reverse()

    # --- 4. __loadScriptOnce("data:...") lazy libraries -> vendor files
    lazy = list(re.finditer(
        r'__loadScriptOnce\("data:application/javascript;base64,'
        r'([A-Za-z0-9+/=]+)"\)', html))
    for i, lm in enumerate(lazy, start=1):
        raw = base64.b64decode(lm.group(1))
        if b"jsPDF" in raw[:200]:
            rel = "vendor/jspdf.umd.min.js"
        elif b"svg2pdf" in raw[:200000].lower():
            rel = "vendor/svg2pdf.umd.min.js"
        else:
            rel = f"vendor/lazy-{i}.js"
        with open(os.path.join(assets_path, rel), "wb") as fh:
            fh.write(raw)
        html = html.replace(
            f'__loadScriptOnce("data:application/javascript;base64,{lm.group(1)}")',
            f'__loadScriptOnce("{assets_dir}/{rel}")')
        report["vendor"].append((rel, len(raw) // 1024))

    # --- 5. Bundle plain inline scripts -> <page>.js (deferred)
    # Keep inline: src'd tags, non-JS blocks, document.write users, and
    # per-page before-paint scripts (guide: the age-verified bounce).
    keep_markers = {
        "guide": ["sexcapades_age_verified"],
    }.get(page, [])
    blocks = []
    for sm in re.finditer(r"<script\b([^>]*)>(.*?)</script>", html, re.S):
        attrs, body = sm.group(1), sm.group(2)
        if "src=" in attrs:
            continue
        tm = re.search(r'type="([^"]*)"', attrs)
        if tm and tm.group(1) not in ("", "text/javascript", "module"):
            continue
        if not body.strip():
            continue
        if "document.write(" in body:
            continue
        if any(k in body for k in keep_markers):
            continue
        blocks.append(sm)
    js_text = None
    if blocks:
        first_start = blocks[0].start()
        parts = [b.group(2) for b in blocks]
        for b in reversed(blocks):
            html = html[:b.start()] + html[b.end():]
        js_text = "\n".join(
            f"/* ---- inline block {i + 1} (document order) ---- */\n{p}"
            for i, p in enumerate(parts))
        with open(os.path.join(assets_path, f"{page}.js"), "w",
                  encoding="utf-8") as fh:
            fh.write(js_text)
        html = (html[:first_start] +
                f'<script defer="" src="{assets_dir}/{page}.js"></script>' +
                html[first_start:])
        report["js_kb"] = len(js_text.encode("utf-8")) // 1024
        report["js_blocks"] = len(blocks)

    # --- final verification (generic) ---
    assert 'src="data:' not in html, "leftover data: src in HTML"
    assert "data:image/" not in html, "leftover data: image in HTML"
    if css_text is not None:
        assert "data:" not in css_text, "leftover data: URI in extracted CSS"

    with open(os.path.join(outdir, entry), "w", encoding="utf-8") as fh:
        fh.write(html)

    new_len = len(html.encode("utf-8"))
    print(f"input : {orig_len//1024} KB single file")
    print(f"output: {entry} {new_len//1024} KB")
    print(f"  build-history comments stripped: "
          f"{report['build_comments_stripped']}")
    if css_text is not None:
        print(f"  {assets_dir}/{page}.css  ({report['css_blocks']} blocks) "
              f"{report['css_kb']} KB")
        for fname, kb in report["css_images"]:
            print(f"  {assets_dir}/images/{fname:<22} {kb} KB (from CSS)")
        if report.get("css_images_deduped"):
            print(f"  (CSS image payloads deduped: "
                  f"{report['css_images_deduped']} duplicate(s) collapsed)")
    if js_text is not None:
        print(f"  {assets_dir}/{page}.js   ({report['js_blocks']} blocks) "
              f"{report['js_kb']} KB")
    for fname, kb in report["images"]:
        print(f"  {assets_dir}/images/{fname:<22} {kb} KB")
    for fname, kb in report["vendor"]:
        print(f"  {assets_dir}/{fname:<28} {kb} KB")
    print("All content/code checks passed.")


if __name__ == "__main__":
    main()
