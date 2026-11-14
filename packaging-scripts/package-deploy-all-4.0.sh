#!/bin/bash
# Sexcapades v4.0 deploy-all packager
# Packages the entire site (app + gate + quickstart + guide + static tree + pipeline).
#
# Usage: ./packaging-scripts/package-deploy-all-4.0.sh [timestamp]
# Output: deploy-all-v4.0-YYYY-MM-DD_HHMM-optimized.tar.gz

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TS="${1:-$(TZ=America/Chicago date +%Y-%m-%d_%H%M)}"
OPTIMIZER="$DIR/packaging-scripts/sexcapades-3.5-optimize.py"
OUTDIR="$DIR/deploy-output"
mkdir -p "$OUTDIR"
OUTFILE="$OUTDIR/deploy-all-v4.0-${TS}-optimized.tar.gz"

APP_EXPORT="$DIR/app/sexcapades-4.0.html"
GATE_EXPORT="$DIR/site-tree/public_html/hosted/gate.html"
QS_EXPORT="$DIR/site-tree/public_html/hosted/quickstart.html"
GUIDE_EXPORT="$DIR/site-tree/public_html/hosted/guide.html"
STATIC="$DIR/site-tree/public_html"
SW_SRC="$STATIC/sw.js"

echo "=== Building Sexcapades 4.0 Deploy-All (${TS} CDT) ==="

for f in "$APP_EXPORT" "$GATE_EXPORT" "$QS_EXPORT" "$GUIDE_EXPORT" "$OPTIMIZER" "$SW_SRC"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing required file: $f"
    exit 1
  fi
done

if [ ! -d "$STATIC" ]; then
  echo "ERROR: Missing static site directory: $STATIC"
  exit 1
fi

python3 "$DIR/packaging-scripts/bump-build.py" "$TS"

EXPECTED_BUILD=$(grep -o 'Version [0-9.]* · Build [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' "$APP_EXPORT" | head -1 || true)
if [ -z "$EXPECTED_BUILD" ]; then
  echo "ERROR: Could not read build marker from app export"
  exit 1
fi
BUILD_NUM="${EXPECTED_BUILD##*Build }"
echo "Expected app build: $EXPECTED_BUILD (build num: $BUILD_NUM)"

WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

STAGING="$WORK/pkg"
mkdir -p "$STAGING/sexcapades.io"

echo "1. Copying static site tree..."
cp -a "$STATIC" "$STAGING/sexcapades.io/public_html"
find "$STAGING" -name "*.db" -delete

echo "2. Stamping service worker cache name..."
SW_STAGED="$STAGING/sexcapades.io/public_html/sw.js"
sed -i "s/__SX_CACHE__/$BUILD_NUM/g" "$SW_STAGED"
if ! grep -q "sexcapades-v$BUILD_NUM" "$SW_STAGED"; then
  echo "ERROR: sw.js cache-name stamp failed"
  exit 1
fi
touch "$SW_STAGED"
echo "   Service worker stamped: sexcapades-v$BUILD_NUM"

HOSTED="$STAGING/sexcapades.io/public_html/hosted"

echo "3. Staging and Bundling App..."
# App source is modular: app/sexcapades-4.0.html (622KB), app/css/, app/js/, app/data/, app/vendor/, app/images/
rm -f "$HOSTED/app.html"
rm -rf "$HOSTED/app-assets"
mkdir -p "$HOSTED/app-assets/vendor" "$HOSTED/app-assets/images"

# Copy modular assets into hosted/app-assets
cp "$APP_EXPORT" "$HOSTED/app.html"
sed -i 's|href="css/app.css"|href="/hosted/app-assets/app.css"|g' "$HOSTED/app.html"
sed -i 's|src="vendor/|src="/hosted/app-assets/vendor/|g' "$HOSTED/app.html"
sed -i 's|src="data/|src="/hosted/app-assets/|g' "$HOSTED/app.html"
sed -i 's|src="js/|src="/hosted/app-assets/|g' "$HOSTED/app.html"
sed -i 's|src="images/|src="/hosted/app-assets/images/|g' "$HOSTED/app.html"

# Cache-buster: the source shell carries hand-maintained ?v= values (and
# several scripts carry none), so browsers served stale JS under a new
# build number. Rewrite every local .js/.css in the STAGED app.html to
# ?v=$BUILD_NUM at packaging time; the source keeps its values as
# fallbacks and the packaged output is always correct.
echo "Stamping asset versions (?v=$BUILD_NUM)..."
python3 "$DIR/packaging-scripts/stamp-asset-versions.py" "$BUILD_NUM" "$HOSTED/app.html"

cp "$DIR/app/css/app.css" "$HOSTED/app-assets/app.css"
cp "$DIR/app/vendor/"* "$HOSTED/app-assets/vendor/"
cp "$DIR/app/data/"*.js "$HOSTED/app-assets/"
cp "$DIR/app/js/"*.js "$HOSTED/app-assets/"
cp "$DIR/app/images/"* "$HOSTED/app-assets/images/"

# Bundle all modular scripts into a single cached app.js alongside individual modules
cat "$DIR/app/js/view-nav.js" "$DIR/app/js/layout-editor.js" "$DIR/app/js/patches.js" "$DIR/app/js/scene-sentinel.js" > "$HOSTED/app-assets/app.js"

echo "4. Writing version manifest..."
MANIFEST="$HOSTED/app-assets/version-manifest.json"
for asset in app.css app.js vendor/qrcode.min.js data-bootstrap.js unrated-map-template.js images/guide-avatar.jpg images/hanky-chart.jpg images/avatar-1.jpg images/avatar-2.jpg images/avatar-3.jpg images/avatar-4.jpg images/avatar-5.jpg images/avatar-anon.webp images/avatar-eve.webp images/avatar-eve-portrait.webp images/img-13.webp images/img-14.webp images/deknotter-icon.webp; do
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
    { "url": "/hosted/app-assets/unrated-map-template.js?v=$BUILD_NUM", "as": "script" },
    { "url": "/hosted/app-assets/images/guide-avatar.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/hanky-chart.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-1.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-2.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-3.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-4.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-5.jpg", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-anon.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-eve.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-eve-portrait.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/img-13.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/img-14.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/deknotter-icon.webp", "as": "image" }
  ]
}
EOF

echo "5. Optimizing Gate..."
python3 "$OPTIMIZER" "$GATE_EXPORT" "$WORK/gate" gate.html gate-assets gate
rm -f "$HOSTED/gate.html"
rm -rf "$HOSTED/gate-assets"
cp "$WORK/gate/gate.html" "$HOSTED/gate.html"
cp -r "$WORK/gate/gate-assets" "$HOSTED/"

echo "6. Optimizing Quickstart..."
python3 "$OPTIMIZER" "$QS_EXPORT" "$WORK/qs" quickstart.html quickstart-assets quickstart
rm -f "$HOSTED/quickstart.html"
rm -rf "$HOSTED/quickstart-assets"
cp "$WORK/qs/quickstart.html" "$HOSTED/quickstart.html"
cp -r "$WORK/qs/quickstart-assets" "$HOSTED/"

echo "7. Optimizing Guide..."
python3 "$OPTIMIZER" "$GUIDE_EXPORT" "$WORK/guide" guide.html guide-assets guide
rm -f "$HOSTED/guide.html"
cp "$WORK/guide/guide.html" "$HOSTED/guide.html"
mkdir -p "$HOSTED/guide-assets"
cp -r "$WORK/guide/guide-assets/." "$HOSTED/guide-assets/"

echo "8. Bundling release pipeline scripts..."
PIPELINE_DIR="$STAGING/sexcapades.io/pipeline"
mkdir -p "$PIPELINE_DIR"
if [ -d "$DIR/site-tree/pipeline" ]; then
  cp -r "$DIR/site-tree/pipeline/." "$PIPELINE_DIR/"
fi
cp "$OPTIMIZER" "$PIPELINE_DIR/"
cp "$DIR/packaging-scripts/package-deploy-app-4.0.sh" "$PIPELINE_DIR/" 2>/dev/null || true
cp "$DIR/sexcapades-site-handover.md" "$PIPELINE_DIR/" 2>/dev/null || true

echo "9. Setting permissions..."
find "$STAGING" -type d -exec chmod 755 {} \;
find "$STAGING" -type f -exec chmod 644 {} \;
find "$STAGING" -type f -name "*.sh" -exec chmod 755 {} \;
find "$STAGING" -type f -name "*.php" -exec chmod 644 {} \;

echo "10. Creating tarball..."
cd "$STAGING"
tar -czf "$OUTFILE" sexcapades.io

# Post-package verification gate
verify_failed=""
fail() { verify_failed=1; echo "  FAIL: $1"; }

echo "11. Verifying tarball..."
LISTING=$(tar -tzf "$OUTFILE")
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
           sexcapades.io/public_html/hosted/flyer.html; do
  echo "$LISTING" | grep -qx "$req" || fail "missing required entry: $req"
done

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

if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -qF "$EXPECTED_BUILD"; then
  fail "packaged hosted/app.html lacks the source build marker: $EXPECTED_BUILD"
fi

MANIFEST_JSON=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app-assets/version-manifest.json 2>/dev/null || true)
if [ -z "$MANIFEST_JSON" ]; then
  fail "packaged version-manifest.json missing or unreadable"
elif ! printf '%s' "$MANIFEST_JSON" | python3 -c "import json,sys; m=json.load(sys.stdin); assert m['build']=='$BUILD_NUM'; assert len(m['files'])==18" 2>/dev/null; then
  fail "packaged version-manifest.json is invalid, names the wrong build, or lists != 18 files"
fi

if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/.htaccess 2>/dev/null | grep -q 'version-manifest'; then
  fail "packaged .htaccess lacks the version-manifest no-cache rule"
fi

SW_CACHE=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/sw.js 2>/dev/null | grep -o 'sexcapades-v[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' | head -1 || true)
if [ "$SW_CACHE" != "sexcapades-v$BUILD_NUM" ]; then
  fail "packaged sw.js cache name '${SW_CACHE:-none}' != sexcapades-v$BUILD_NUM"
fi

SHELL_REFS=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -oE '"/hosted/app-assets/[^"]+"' || true)
for ref in $SHELL_REFS; do
  refpath=${ref//\"/}
  case "$refpath" in
    *.js\?v=$BUILD_NUM|*.css\?v=$BUILD_NUM) ;;
    *.js|*.css) fail "unstamped app-assets reference in packaged app.html: $ref" ;;
    *.js\?*|*.css\?*) fail "app-assets reference stamped with wrong build in packaged app.html: $ref" ;;
  esac
done

if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/gate-assets/gate.js 2>/dev/null | grep -q 'getReturnDestination'; then
  fail "packaged gate bundle lacks getReturnDestination"
fi
if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/guide-assets/guide.js 2>/dev/null | grep -q 'showGuidePage'; then
  fail "packaged guide bundle lacks showGuidePage"
fi
if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/quickstart.html 2>/dev/null | grep -q '#app/scan'; then
  fail "packaged quickstart.html lost its Scan link (#app/scan)"
fi
if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/guide.html 2>/dev/null | grep -q 'sexcapades_age_verified'; then
  fail "packaged guide.html lost its inline age-verified check"
fi

if [ -n "$verify_failed" ]; then
  mv "$OUTFILE" "$OUTFILE.FAILED.tar.gz"
  echo ""
  echo "VERIFICATION FAILED -- bad tarball quarantined as: $OUTFILE.FAILED.tar.gz"
  exit 1
fi

echo "All verification gates passed."
MD5=$(md5sum "$OUTFILE" | awk '{print $1}')
SIZE=$(ls -lh "$OUTFILE" | awk '{print $5}')
echo ""
echo "=== Done: $(basename "$OUTFILE") ==="
echo "Size: $SIZE"
echo "MD5: $MD5"
echo ""
echo "Hostinger SSH deploy command:"
echo "cd ~/domains && curl -L -o $(basename "$OUTFILE") \"<download-url>\" && echo \"$MD5  $(basename "$OUTFILE")\" | md5sum -c && tar -xzf $(basename "$OUTFILE")"
