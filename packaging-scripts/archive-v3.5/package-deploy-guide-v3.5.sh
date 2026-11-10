#!/bin/bash
# Package deploy-guide tar for Sexcapades v3.5
# Usage: package-deploy-guide-v3.5.sh [timestamp]
# Output: ~/workspace/your_files/sexcapades-3.0/deploy-guide-v3.5-YYYY-MM-DD_HHMM-optimized.tar.gz
# Structure: sexcapades.io/public_html/hosted/guide.html + guide-assets/
# (guide-assets = optimizer bundle merged with the guide's external images
#  from ~/workspace/guide-assets — required or guide images 404)
set -e

TS="${1:-$(TZ=America/Chicago date +%Y-%m-%d_%H%M)}"
SRC=~/workspace/your_files/syncing-sexcapades-guide/syncing-sexcapades-guide.html
OPTIMIZER=~/workspace/sexcapades-3.5-optimize.py
EXT_ASSETS=~/workspace/guide-assets
OUTDIR=~/workspace/your_files/sexcapades-3.0
OUTFILE="$OUTDIR/deploy-guide-v3.5-${TS}-optimized.tar.gz"

[ -f "$SRC" ] || { echo "ERROR: guide export not found: $SRC"; exit 1; }
[ -f "$OPTIMIZER" ] || { echo "ERROR: optimizer not found: $OPTIMIZER"; exit 1; }
[ -d "$EXT_ASSETS" ] || { echo "ERROR: external guide assets not found: $EXT_ASSETS"; exit 1; }

WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

echo "Optimizing guide..."
python3 "$OPTIMIZER" "$SRC" "$WORK/opt" guide.html guide-assets guide

echo "Packaging..."
mkdir -p "$WORK/pkg/sexcapades.io/public_html/hosted/guide-assets"
mv "$WORK/opt/guide.html" "$WORK/pkg/sexcapades.io/public_html/hosted/guide.html"
cp -r "$WORK/opt/guide-assets/." "$WORK/pkg/sexcapades.io/public_html/hosted/guide-assets/"
cp "$EXT_ASSETS/"* "$WORK/pkg/sexcapades.io/public_html/hosted/guide-assets/"

cd "$WORK/pkg"
find sexcapades.io -type d -exec chmod 755 {} \;
find sexcapades.io -type f -exec chmod 644 {} \;
tar -czf "$OUTFILE" sexcapades.io

# --- Post-package verification gate: the tar's own bytes are the verdict.
verify_failed=""
fail() { verify_failed=1; echo "  FAIL: $1"; }

echo "Verifying tarball..."
LISTING=$(tar -tzf "$OUTFILE")
for req in sexcapades.io/public_html/hosted/guide.html \
           sexcapades.io/public_html/hosted/guide-assets/guide.js; do
  echo "$LISTING" | grep -qx "$req" || fail "missing required entry: $req"
done
# The external images must have merged (guide-assets holds more than the bundle).
IMG_COUNT=$(echo "$LISTING" | grep -c 'guide-assets/.*\.\(png\|jpg\|jpeg\|webp\|svg\)$' || true)
if [ "$IMG_COUNT" -lt 1 ]; then
  fail "no guide images in packaged guide-assets (external merge missing)"
fi
if echo "$LISTING" | grep -q '\.db$'; then
  fail "tarball contains .db files (never ship databases)"
fi
if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/guide-assets/guide.js 2>/dev/null | grep -q 'showGuidePage'; then
  fail "packaged guide.js lacks showGuidePage"
fi
# The guide's age-verified bounce stays inline in the entry page (before paint).
if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/guide.html 2>/dev/null | grep -q 'sexcapades_age_verified'; then
  fail "packaged guide.html lacks the inline age-verified check"
fi
if command -v node >/dev/null 2>&1; then
  if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/guide-assets/guide.js > "$WORK/check.js" 2>/dev/null; then
    fail "could not extract guide.js for syntax check"
  elif ! node --check "$WORK/check.js" 2>"$WORK/check.err"; then
    fail "guide.js failed syntax check: $(head -1 "$WORK/check.err")"
  fi
fi

if [ -n "$verify_failed" ]; then
  mv "$OUTFILE" "$OUTFILE.FAILED.tar.gz"
  echo ""
  echo "VERIFICATION FAILED -- bad tarball quarantined as: $OUTFILE.FAILED.tar.gz"
  exit 1
fi
echo "All verification gates passed."
echo "Done: $OUTFILE"
ls -lh "$OUTFILE"
