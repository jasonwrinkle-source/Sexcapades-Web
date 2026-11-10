#!/bin/bash
# Package deploy-app tar for Sexcapades v4.0
# Usage: ./package-deploy-app-4.0.sh <exported-html> [timestamp]
# Output: deploy-app-v4.0-YYYY-MM-DD_HHMM-optimized.tar.gz
# Structure: sexcapades.io/public_html/hosted/app.html + app-assets/
# (NEVER at sexcapades.io/index.html — that overwrites the gate)

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${1:-$DIR/app/sexcapades-4.0.html}"
TS="${2:-$(TZ=America/Chicago date +%Y-%m-%d_%H%M)}"
OPTIMIZER="$DIR/packaging-scripts/sexcapades-3.5-optimize.py"
OUTDIR="$DIR"
OUTFILE="$OUTDIR/deploy-app-v4.0-${TS}-optimized.tar.gz"

[ -f "$SRC" ] || { echo "ERROR: source export not found: $SRC"; exit 1; }
[ -f "$OPTIMIZER" ] || { echo "ERROR: optimizer not found: $OPTIMIZER"; exit 1; }

SW_SRC="$DIR/site-tree/public_html/sw.js"
[ -f "$SW_SRC" ] || { echo "ERROR: service worker source not found: $SW_SRC"; exit 1; }

python3 "$DIR/packaging-scripts/bump-build.py" "$TS"

BUILD_NUM=$(grep -o 'Version [0-9.]* · Build [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' "$SRC" | head -1 | sed 's/^.*Build //' || true)
[ -n "$BUILD_NUM" ] || { echo "ERROR: could not read build number from source export: $SRC"; exit 1; }

echo "=== Packaging Sexcapades 4.0 App Deploy (Build $BUILD_NUM) ==="

WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

echo "Staging modular app..."
HOSTED="$WORK/pkg/sexcapades.io/public_html/hosted"
mkdir -p "$HOSTED/app-assets/vendor" "$HOSTED/app-assets/images" "$HOSTED/images"

cp "$SRC" "$HOSTED/app.html"
sed -i 's|href="css/app.css"|href="/hosted/app-assets/app.css"|g' "$HOSTED/app.html"
sed -i 's|src="vendor/|src="/hosted/app-assets/vendor/|g' "$HOSTED/app.html"
sed -i 's|src="data/|src="/hosted/app-assets/|g' "$HOSTED/app.html"
sed -i 's|src="js/|src="/hosted/app-assets/|g' "$HOSTED/app.html"
sed -i 's|src="images/|src="/hosted/app-assets/images/|g' "$HOSTED/app.html"

cp "$DIR/app/css/app.css" "$HOSTED/app-assets/app.css"
cp "$DIR/app/vendor/"* "$HOSTED/app-assets/vendor/"
cp "$DIR/app/data/"*.js "$HOSTED/app-assets/"
cp "$DIR/app/js/"*.js "$HOSTED/app-assets/"
cp "$DIR/app/images/"* "$HOSTED/app-assets/images/"
cp "$DIR/app/images/"* "$HOSTED/images/"

mkdir -p "$DIR/site-tree/public_html/hosted/app-assets/images"
cp "$DIR/app/images/"* "$DIR/site-tree/public_html/hosted/app-assets/images/" 2>/dev/null || true
cp "$DIR/app/images/"* "$DIR/site-tree/public_html/hosted/images/" 2>/dev/null || true

cat "$DIR/app/js/view-nav.js" "$DIR/app/js/layout-editor.js" "$DIR/app/js/patches.js" "$DIR/app/js/scene-sentinel.js" > "$HOSTED/app-assets/app.js"

mkdir -p "$WORK/pkg/sexcapades.io/public_html"
sed "s/__SX_CACHE__/$BUILD_NUM/g" "$SW_SRC" > "$WORK/pkg/sexcapades.io/public_html/sw.js"
touch "$WORK/pkg/sexcapades.io/public_html/sw.js"
echo "Service worker cache stamped: sexcapades-v$BUILD_NUM"

echo "Writing version manifest..."
MANIFEST="$WORK/pkg/sexcapades.io/public_html/hosted/app-assets/version-manifest.json"
for asset in app.css app.js vendor/qrcode.min.js data-bootstrap.js images/guide-avatar.jpg images/hanky-chart.jpg images/avatar-1.jpg images/avatar-2.jpg images/avatar-3.jpg images/avatar-4.jpg images/avatar-5.jpg images/avatar-anon.webp images/avatar-eve.webp images/avatar-eve-portrait.webp images/img-13.webp images/img-14.webp images/deknotter-icon.webp; do
  [ -f "$WORK/pkg/sexcapades.io/public_html/hosted/app-assets/$asset" ] || { echo "ERROR: manifest asset missing from package: $asset"; exit 1; }
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
    { "url": "/hosted/app-assets/images/avatar-eve.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/avatar-eve-portrait.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/img-13.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/img-14.webp", "as": "image" },
    { "url": "/hosted/app-assets/images/deknotter-icon.webp", "as": "image" }
  ]
}
EOF

cd "$WORK/pkg"
find sexcapades.io -type d -exec chmod 755 {} \;
find sexcapades.io -type f -exec chmod 644 {} \;
tar -czf "$OUTFILE" sexcapades.io

# Verification Gates
verify_failed=""
fail() { verify_failed=1; echo "  FAIL: $1"; }

echo "Verifying tarball..."
LISTING=$(tar -tzf "$OUTFILE")
for req in sexcapades.io/public_html/hosted/app.html \
           sexcapades.io/public_html/hosted/app-assets/app.js \
           sexcapades.io/public_html/hosted/app-assets/data-bootstrap.js \
           sexcapades.io/public_html/hosted/app-assets/version-manifest.json \
           sexcapades.io/public_html/sw.js; do
  echo "$LISTING" | grep -qx "$req" || fail "missing required entry: $req"
done
if echo "$LISTING" | grep -q '\.db$'; then
  fail "tarball contains .db files (never ship databases)"
fi
if echo "$LISTING" | grep -qx 'sexcapades.io/app.html'; then
  fail "stray sexcapades.io/app.html"
fi
if echo "$LISTING" | grep -qx 'sexcapades.io/index.html'; then
  fail "stray sexcapades.io/index.html (would overwrite the gate)"
fi

EXPECTED_BUILD=$(grep -o 'Version [0-9.]* · Build [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' "$SRC" | head -1 || true)
if [ -z "$EXPECTED_BUILD" ]; then
  fail "could not read build marker from source export"
elif ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -qF "$EXPECTED_BUILD"; then
  fail "packaged app.html lacks the source build marker: $EXPECTED_BUILD"
fi

MANIFEST_JSON=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app-assets/version-manifest.json 2>/dev/null || true)
if [ -z "$MANIFEST_JSON" ]; then
  fail "packaged version-manifest.json missing or unreadable"
elif ! printf '%s' "$MANIFEST_JSON" | python3 -c "import json,sys; m=json.load(sys.stdin); assert m['build']=='$BUILD_NUM'; assert len(m['files'])==17" 2>/dev/null; then
  fail "packaged version-manifest.json is invalid, names the wrong build, or lists != 17 files"
fi

SW_CACHE=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/sw.js 2>/dev/null | grep -o 'sexcapades-v[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' | head -1 || true)
if [ "$SW_CACHE" != "sexcapades-v$BUILD_NUM" ]; then
  fail "packaged sw.js cache name '${SW_CACHE:-none}' != sexcapades-v$BUILD_NUM"
fi

SHELL_REFS=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -oE '"app-assets/[^"]+"' || true)
for ref in $SHELL_REFS; do
  refpath=${ref//\"/}
  case "$refpath" in
    *".js?v=$BUILD_NUM"|*".css?v=$BUILD_NUM") ;;
    *.js|*.css) fail "unstamped app-assets reference in packaged app.html: $ref" ;;
    *.js\?*|*.css\?*) fail "app-assets reference stamped with wrong build in packaged app.html: $ref" ;;
  esac
done

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
echo "Package ready: $(basename "$OUTFILE")"
echo "Size: $SIZE"
echo "MD5: $MD5"
