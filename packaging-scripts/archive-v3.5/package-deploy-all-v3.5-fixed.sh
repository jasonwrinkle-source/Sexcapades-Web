#!/bin/bash
# Sexcapades v3.5 deploy-all packager (FIXED, optimizer edition 2026-10-20)
#
# "Deploy all" means what Jason means: deploy app + deploy gate + deploy
# guide + deploy quickstart. EVERY artifact page is run through the
# optimizer (~/workspace/sexcapades-3.5-optimize.py) into its split bundle
# and assembled into the site tree with the static files. No artifact page
# ships as its raw single-file export.
#
#   app        -> public_html/hosted/app.html        + app-assets/
#   gate       -> public_html/hosted/gate.html       + gate-assets/
#   quickstart -> public_html/hosted/quickstart.html + quickstart-assets/
#   guide      -> public_html/hosted/guide.html      + guide-assets/ (bundle
#                 merged with the guide's external image assets)
#
# Static files (index, compare, faq, sitemap, 404, privacy, api, assets)
# come from the static tree unchanged.
# Usage: ./package-deploy-all-v3.5-fixed.sh

set -e

TIMESTAMP=$(TZ=America/Chicago date +%Y-%m-%d_%H%M)
STAGING=/tmp/sexcapades-deploy
OUTPUT=$HOME/workspace/your_files/sexcapades-3.0/deploy-all-v3.5-${TIMESTAMP}-optimized.tar.gz
OPTIMIZER=$HOME/workspace/sexcapades-3.5-optimize.py

# Fresh artifact exports
APP_EXPORT=$HOME/workspace/your_files/sexcapades/sexcapades.html
GATE_EXPORT=$HOME/workspace/your_files/sexcapades-18-gate/sexcapades-18-gate.html
QS_EXPORT=$HOME/workspace/your_files/sexcapades-quick-start/sexcapades-quick-start.html
GUIDE_EXPORT=$HOME/workspace/your_files/syncing-sexcapades-guide/syncing-sexcapades-guide.html

ARTIFACT_ASSETS=$HOME/workspace/ts-spaces/sexcapades/assets
STATIC=$HOME/workspace/goals/sexcapades-io-hosting-upload/files/sexcapades-io

echo "=== Building deploy-all ${TIMESTAMP} (CDT) ==="

# Verify fresh exports exist
for f in "$APP_EXPORT" "$GATE_EXPORT" "$QS_EXPORT" "$GUIDE_EXPORT"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing fresh export: $f"
    exit 1
  fi
done

# Pre-flight: verify every other declared producer path exists BEFORE relying
# on it (missing dirs used to fail cryptically mid-copy).
for d in "$ARTIFACT_ASSETS" "$STATIC"; do
  if [ ! -d "$d" ]; then
    echo "ERROR: Missing required directory: $d"
    exit 1
  fi
done
[ -f "$OPTIMIZER" ] || { echo "ERROR: optimizer not found: $OPTIMIZER"; exit 1; }
[ -x "$HOME/workspace/sexcapades-drive-upload.sh" ] || { echo "ERROR: Drive upload helper not found/executable: ~/workspace/sexcapades-drive-upload.sh"; exit 1; }

# The current build, read from the app source export's About version string
# (the permanent in-artifact build tag -- never from changelog text).
# Version-agnostic (2026-11-08): matches 3.5, 4.0, 5.0, ... so a major
# bump never breaks the packager again.
EXPECTED_BUILD=$(grep -o 'Version [0-9.]* · Build [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' "$APP_EXPORT" | head -1 || true)
if [ -z "$EXPECTED_BUILD" ]; then
  echo "ERROR: Could not read build marker from app export"
  exit 1
fi
echo "Expected app build: $EXPECTED_BUILD"

# Clean staging + optimizer work area
rm -rf "$STAGING"
mkdir -p "$STAGING"
WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

# 0. Copy ENTIRE static site tree (total backup — nothing missing)
echo "Copying entire static site tree..."
cp -a "$STATIC/." "$STAGING/sexcapades.io/"
# Remove .db files (never ship databases)
find "$STAGING" -name "*.db" -delete

# 0c. Stamp the service worker's cache name with this package's app build
# (2026-10-20 cache fix). A byte-identical sw.js across deploys means the
# browser never sees a worker update and a returning user stays pinned to
# a cached old build; a per-build cache name makes every deploy a real
# worker update whose activate step purges the previous build's caches.
BUILD_NUM="${EXPECTED_BUILD##*Build }"
SW_STAGED="$STAGING/sexcapades.io/public_html/sw.js"
if [ ! -f "$SW_STAGED" ]; then
  echo "ERROR: static tree copy has no public_html/sw.js to stamp"
  exit 1
fi
sed -i "s/__SX_CACHE__/$BUILD_NUM/g" "$SW_STAGED"
if ! grep -q "sexcapades-v$BUILD_NUM" "$SW_STAGED"; then
  echo "ERROR: sw.js cache-name stamp failed"
  exit 1
fi
# Freshness is structural (2026-10-20 replay finding): the tree copy above
# preserves the master file's mtime (cp -a), so stamp the staged worker's
# mtime to the packaging moment. A stale mtime lets the browser's
# worker-update revalidation answer 304 ("unchanged") and the fixed worker
# is never delivered to an already-poisoned profile.
touch "$SW_STAGED"
echo "Service worker cache stamped: sexcapades-v$BUILD_NUM"

# 0b. App runtime assets overlay (unchanged from previous packager: the
# artifact workspace assets the hosted tree carries alongside the pages).
echo "Copying app runtime assets..."
cp -r "$ARTIFACT_ASSETS" "$STAGING/sexcapades.io/public_html/hosted/"

HOSTED="$STAGING/sexcapades.io/public_html/hosted"

# 1. App (OPTIMIZED split bundle — optimizer profile "app")
echo "Optimizing app..."
python3 "$OPTIMIZER" "$APP_EXPORT" "$WORK/app" app.html app-assets app
rm -rf "$HOSTED/app-assets"
cp "$WORK/app/app.html" "$HOSTED/app.html"
cp -r "$WORK/app/app-assets" "$HOSTED/"

# 1b. Version manifest (2026-10-25, gate prefetch): every deploy emits
# hosted/app-assets/version-manifest.json so the gate's prefetch consumer
# can warm the app bundle on idle. The tree copy in step 0 may have carried
# a stale manifest, but the rm -rf above cleared app-assets, so what is
# written here is this package's manifest only. Stamped scripts/css carry
# ?v=<build>; images are bare (unstamped by design). A missing staged asset
# fails the package -- a manifest must never point at a file that isn't
# shipped.
echo "Writing version manifest..."
MANIFEST="$HOSTED/app-assets/version-manifest.json"
for asset in app.css app.js vendor/qrcode.min.js data-bootstrap.js images/guide-avatar.jpg images/hanky-chart.jpg images/avatar-1.jpg images/avatar-2.jpg images/avatar-3.jpg images/avatar-4.jpg images/avatar-5.jpg images/avatar-anon.webp images/deknotter-icon.webp; do
  [ -f "$HOSTED/app-assets/$asset" ] || { echo "ERROR: manifest asset missing from package: $asset"; exit 1; }
done
cat > "$MANIFEST" <<EOF
{
  "build": "$BUILD_NUM",
  "files": [
    { "url": "/hosted/app-assets/app.css?v=$BUILD_NUM", "as": "style" },
    { "url": "/hosted/app-assets/app.js?v=$BUILD_NUM", "as": "script" },
    { "url": "/hosted/app-assets/vendor/qrcode.min.js?v=$BUILD_NUM", "as": "script" },
    { "url": "/hosted/app-assets/data-bootstrap.js?v=$BUILD_NUM", "as": "script" },
    { "url": "/hosted/app-assets/images/guide-avatar.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/hanky-chart.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-1.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-2.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-3.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-4.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-5.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-anon.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/deknotter-icon.webp", "as": "image" }
  ]
}
EOF

# 2. Gate (OPTIMIZED split bundle — optimizer profile "gate")
echo "Optimizing gate..."
python3 "$OPTIMIZER" "$GATE_EXPORT" "$WORK/gate" gate.html gate-assets gate
cp "$WORK/gate/gate.html" "$HOSTED/gate.html"
rm -rf "$HOSTED/gate-assets"
cp -r "$WORK/gate/gate-assets" "$HOSTED/"

# 3. Quickstart (OPTIMIZED split bundle — optimizer profile "quickstart")
echo "Optimizing quickstart..."
python3 "$OPTIMIZER" "$QS_EXPORT" "$WORK/qs" quickstart.html quickstart-assets quickstart
cp "$WORK/qs/quickstart.html" "$HOSTED/quickstart.html"
rm -rf "$HOSTED/quickstart-assets"
cp -r "$WORK/qs/quickstart-assets" "$HOSTED/"

# 4. Guide (OPTIMIZED split bundle — optimizer profile "guide"; its asset
# dir merges with the guide's external images in step 4b)
echo "Optimizing guide..."
python3 "$OPTIMIZER" "$GUIDE_EXPORT" "$WORK/guide" guide.html guide-assets guide
cp "$WORK/guide/guide.html" "$HOSTED/guide.html"
mkdir -p "$HOSTED/guide-assets"
cp -r "$WORK/guide/guide-assets/." "$HOSTED/guide-assets/"

# 4b. Guide assets (images externalized from the guide — required or images 404)
if [ -d "$HOME/workspace/guide-assets" ]; then
  echo "Copying guide-assets..."
  mkdir -p "$HOSTED/guide-assets"
  cp "$HOME/workspace/guide-assets/"* "$HOSTED/guide-assets/"
fi

# 5-9. Static site already copied in full (step 0) — nothing to cherry-pick
echo "Static site tree complete (sitemap, 404, compare, faq, api, assets, scripts all included)."

# 9b. Release pipeline bundle (2026-10-20, Jason): every deploy-all carries
# the exact scripts that built it under sexcapades.io/pipeline/, so the site
# is maintainable from any package. Sources are the canonical workspace
# files; a missing source is a failed package, never a silent omission.
echo "Bundling release pipeline scripts..."
PIPELINE_DIR="$STAGING/sexcapades.io/pipeline"
mkdir -p "$PIPELINE_DIR"
for src in "$HOME/workspace/sexcapades-3.5-optimize.py" \
           "$HOME/workspace/package-deploy-app-v3.5.sh" \
           "$HOME/workspace/package-deploy-all-v3.5-fixed.sh" \
           "$HOME/workspace/package-deploy-gate-v3.5.sh" \
           "$HOME/workspace/package-deploy-guide-v3.5.sh" \
           "$HOME/workspace/package-deploy-quickstart-v3.5.sh" \
           "$HOME/workspace/sexcapades-snapshot-v3.sh" \
           "$HOME/workspace/sexcapades-drive-upload.sh" \
           "$HOME/workspace/get_stats.sh"; do
  if [ ! -f "$src" ]; then
    echo "ERROR: Missing pipeline source: $src"
    exit 1
  fi
  cp "$src" "$PIPELINE_DIR/"
done
if [ ! -f "$HOME/workspace/your_files/pipeline-bundle-readme.md" ] || [ ! -f "$HOME/workspace/your_files/sexcapades-site-handover.md" ]; then
  echo "ERROR: Missing pipeline document (README or handover doc)"
  exit 1
fi
cp "$HOME/workspace/your_files/pipeline-bundle-readme.md" "$PIPELINE_DIR/README-pipeline.md"
cp "$HOME/workspace/your_files/sexcapades-site-handover.md" "$PIPELINE_DIR/"

# 10. Permissions
echo "Setting permissions..."
find "$STAGING" -type d -exec chmod 755 {} \;
find "$STAGING" -type f -exec chmod 644 {} \;
find "$STAGING" -type f -name "*.sh" -exec chmod 755 {} \;
find "$STAGING" -type f -name "*.php" -exec chmod 644 {} \;

# 11. Verify the staged app carries the source export's current build marker
# (hard fail -- a stale staged app.html is how deploy-all 1809 shipped wrong).
echo "Verifying staged app build..."
if grep -qF "$EXPECTED_BUILD" "$HOSTED/app.html"; then
  echo "  OK: staged app.html contains $EXPECTED_BUILD"
else
  echo "  ERROR: staged app.html lacks the source build marker: $EXPECTED_BUILD"
  exit 1
fi

# 12. Create tar
echo "Creating tarball..."
cd /tmp
tar -czf "$OUTPUT" -C "$STAGING" sexcapades.io

# 13. Post-package verification gate (2026-10-19): the tar's own bytes are
# the verdict. A failing tarball is quarantined as .FAILED and never ships
# silently -- dead .htaccess placement shipped this way on Oct 18.
verify_failed=""
fail() { verify_failed=1; echo "  FAIL: $1"; }

echo "Verifying tarball..."
LISTING=$(tar -tzf "$OUTPUT")
for req in sexcapades.io/public_html/.htaccess \
           sexcapades.io/public_html/index.html \
           sexcapades.io/public_html/404.html \
           sexcapades.io/public_html/sitemap.xml \
           sexcapades.io/public_html/sw.js \
           sexcapades.io/public_html/hosted/app.html \
           sexcapades.io/public_html/hosted/app-assets/app.js \
           sexcapades.io/public_html/hosted/app-assets/data-bootstrap.js \
           sexcapades.io/public_html/hosted/app-assets/version-manifest.json \
           sexcapades.io/public_html/hosted/gate.html \
           sexcapades.io/public_html/hosted/gate-assets/gate.css \
           sexcapades.io/public_html/hosted/gate-assets/gate.js \
           sexcapades.io/public_html/hosted/quickstart.html \
           sexcapades.io/public_html/hosted/quickstart-assets/quickstart.css \
           sexcapades.io/public_html/hosted/quickstart-assets/quickstart.js \
           sexcapades.io/public_html/hosted/guide.html \
           sexcapades.io/public_html/hosted/guide-assets/guide.js \
           sexcapades.io/pipeline/sexcapades-3.5-optimize.py \
           sexcapades.io/pipeline/package-deploy-all-v3.5-fixed.sh \
           sexcapades.io/pipeline/sexcapades-drive-upload.sh \
           sexcapades.io/pipeline/sexcapades-snapshot-v3.sh \
           sexcapades.io/pipeline/README-pipeline.md \
           sexcapades.io/pipeline/sexcapades-site-handover.md; do
  echo "$LISTING" | grep -qx "$req" || fail "missing required entry: $req"
done
# .htaccess must live INSIDE the docroot -- at the domain root it sits above
# public_html and every rule in it is inert (the Oct 18 dead-rewrites cause).
if echo "$LISTING" | grep -qx 'sexcapades.io/.htaccess'; then
  fail ".htaccess at domain root (outside docroot -- rules would be inert)"
fi
if echo "$LISTING" | grep -q '\.db$'; then
  fail "tarball contains .db files (never ship databases)"
fi
if echo "$LISTING" | grep -qx 'sexcapades.io/app.html'; then
  fail "stray sexcapades.io/app.html"
fi
if echo "$LISTING" | grep -qx 'sexcapades.io/index.html'; then
  fail "stray sexcapades.io/index.html (would overwrite the gate)"
fi
# Build marker from the tar's own bytes.
if ! tar -xzOf "$OUTPUT" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -qF "$EXPECTED_BUILD"; then
  fail "packaged hosted/app.html lacks the source build marker: $EXPECTED_BUILD"
fi
# Version manifest: the tar must carry it, it must parse as JSON, name
# this build, and list exactly the 13 shipped files (stamped scripts/css,
# bare images). The gate prefetches from this file; a wrong manifest sends
# the gate warming the wrong build's files.
MANIFEST_JSON=$(tar -xzOf "$OUTPUT" sexcapades.io/public_html/hosted/app-assets/version-manifest.json 2>/dev/null || true)
if [ -z "$MANIFEST_JSON" ]; then
  fail "packaged version-manifest.json missing or unreadable"
elif ! printf '%s' "$MANIFEST_JSON" | python3 -c "import json,sys; m=json.load(sys.stdin); assert m['build']=='$BUILD_NUM'; assert len(m['files'])==13" 2>/dev/null; then
  fail "packaged version-manifest.json is invalid, names the wrong build, or lists != 13 files"
fi
# The manifest is served no-cache by design (tree .htaccess rule); a tar
# without that rule would let the gate prefetch a stale manifest.
if ! tar -xzOf "$OUTPUT" sexcapades.io/public_html/.htaccess 2>/dev/null | grep -q 'version-manifest'; then
  fail "packaged .htaccess lacks the version-manifest no-cache rule"
fi
# Service worker + shell stamps (2026-10-20 cache fix): the packaged sw.js
# must carry THIS build's cache name, and every generated JS/CSS asset
# reference in the packaged app shell must carry the same ?v= stamp.
# Anything else lets a returning browser be served a cross-build mix
# (new shell, old scripts) or stay pinned to a cached old build.
GATE_BUILD="${EXPECTED_BUILD##*Build }"
SW_CACHE=$(tar -xzOf "$OUTPUT" sexcapades.io/public_html/sw.js 2>/dev/null | grep -o 'sexcapades-v[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' | head -1 || true)
if [ "$SW_CACHE" != "sexcapades-v$GATE_BUILD" ]; then
  fail "packaged sw.js cache name '${SW_CACHE:-none}' != sexcapades-v$GATE_BUILD"
fi
SHELL_REFS=$(tar -xzOf "$OUTPUT" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -oE '"app-assets/[^"]+"' || true)
for ref in $SHELL_REFS; do
  refpath=${ref//\"/}
  case "$refpath" in
    *".js?v=$GATE_BUILD"|*".css?v=$GATE_BUILD") ;;
    *.js|*.css) fail "unstamped app-assets reference in packaged app.html: $ref" ;;
    *.js\?*|*.css\?*) fail "app-assets reference stamped with wrong build in packaged app.html: $ref" ;;
  esac
done
# Per-page content markers from the tar's own bytes: each optimized bundle
# must carry the code its page exists for (the gate's ?return= fix lives in
# its JS bundle now, not the HTML).
if ! tar -xzOf "$OUTPUT" sexcapades.io/public_html/hosted/gate-assets/gate.js 2>/dev/null | grep -q 'getReturnDestination'; then
  fail "packaged gate bundle lacks getReturnDestination"
fi
if ! tar -xzOf "$OUTPUT" sexcapades.io/public_html/hosted/guide-assets/guide.js 2>/dev/null | grep -q 'showGuidePage'; then
  fail "packaged guide bundle lacks showGuidePage"
fi
if ! tar -xzOf "$OUTPUT" sexcapades.io/public_html/hosted/quickstart.html 2>/dev/null | grep -q '#app/scan'; then
  fail "packaged quickstart.html lost its Scan link (#app/scan)"
fi
# The guide's age-verified bounce must stay INLINE in guide.html (it runs
# at parse time; the optimizer keeps it out of the deferred bundle).
if ! tar -xzOf "$OUTPUT" sexcapades.io/public_html/hosted/guide.html 2>/dev/null | grep -q 'sexcapades_age_verified'; then
  fail "packaged guide.html lost its inline age-verified check"
fi
# JS syntax: EVERY bundled script in the tar must parse.
GATEWORK=$(mktemp -d)
if command -v node >/dev/null 2>&1; then
  for js in sexcapades.io/public_html/hosted/app-assets/app.js \
            sexcapades.io/public_html/hosted/app-assets/data-bootstrap.js \
            sexcapades.io/public_html/hosted/gate-assets/gate.js \
            sexcapades.io/public_html/hosted/guide-assets/guide.js \
            sexcapades.io/public_html/hosted/quickstart-assets/quickstart.js; do
    if ! tar -xzOf "$OUTPUT" "$js" > "$GATEWORK/check.js" 2>/dev/null; then
      fail "could not extract $js for syntax check"
    elif ! node --check "$GATEWORK/check.js" 2>"$GATEWORK/check.err"; then
      fail "$js failed syntax check: $(head -1 "$GATEWORK/check.err")"
    fi
  done
else
  echo "  (node not available -- syntax check skipped)"
fi
rm -rf "$GATEWORK"

if [ -n "$verify_failed" ]; then
  mv "$OUTPUT" "$OUTPUT.FAILED.tar.gz"
  echo ""
  echo "VERIFICATION FAILED -- bad tarball quarantined as: $OUTPUT.FAILED.tar.gz"
  exit 1
fi
echo "All verification gates passed."

echo ""
echo "=== Done: $OUTPUT ==="
ls -lh "$OUTPUT"
echo ""
echo "Tar contents (top level):"
tar -tzf "$OUTPUT" | head -10

# --- Drive upload (2026-10-20, invisible-pipeline step 1): a deploy is not
# done until the verified tar is confirmed in the Drive snapshots folder.
# A built-but-not-uploaded tarball exits 2, so no caller (human or agent)
# can mistake "built" for "done".
"$HOME/workspace/sexcapades-drive-upload.sh" "$OUTPUT" "1eEo97XoRiwHLiFloTof0IFYTHumB8gi5" "deploy-all" || {
  echo ""
  echo "BUILT BUT NOT UPLOADED -- verified tar is waiting at: $OUTPUT"
  exit 2
}
echo "Deploy-all complete: built, verified, and confirmed in Drive snapshots."
