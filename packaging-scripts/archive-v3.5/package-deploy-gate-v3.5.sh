#!/bin/bash
# Package deploy-gate tar for Sexcapades v3.5
# Usage: package-deploy-gate-v3.5.sh [timestamp]
# Output: ~/workspace/your_files/sexcapades-3.0/deploy-gate-v3.5-YYYY-MM-DD_HHMM-optimized.tar.gz
# Structure: sexcapades.io/public_html/hosted/gate.html + gate-assets/
set -e

TS="${1:-$(TZ=America/Chicago date +%Y-%m-%d_%H%M)}"
SRC=~/workspace/your_files/sexcapades-18-gate/sexcapades-18-gate.html
OPTIMIZER=~/workspace/sexcapades-3.5-optimize.py
OUTDIR=~/workspace/your_files/sexcapades-3.0
OUTFILE="$OUTDIR/deploy-gate-v3.5-${TS}-optimized.tar.gz"

[ -f "$SRC" ] || { echo "ERROR: gate export not found: $SRC"; exit 1; }
[ -f "$OPTIMIZER" ] || { echo "ERROR: optimizer not found: $OPTIMIZER"; exit 1; }

WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

echo "Optimizing gate..."
python3 "$OPTIMIZER" "$SRC" "$WORK/opt" gate.html gate-assets gate

echo "Packaging..."
mkdir -p "$WORK/pkg/sexcapades.io/public_html/hosted"
mv "$WORK/opt/gate.html" "$WORK/pkg/sexcapades.io/public_html/hosted/gate.html"
mv "$WORK/opt/gate-assets" "$WORK/pkg/sexcapades.io/public_html/hosted/"

cd "$WORK/pkg"
find sexcapades.io -type d -exec chmod 755 {} \;
find sexcapades.io -type f -exec chmod 644 {} \;
tar -czf "$OUTFILE" sexcapades.io

# --- Post-package verification gate: the tar's own bytes are the verdict.
verify_failed=""
fail() { verify_failed=1; echo "  FAIL: $1"; }

echo "Verifying tarball..."
LISTING=$(tar -tzf "$OUTFILE")
for req in sexcapades.io/public_html/hosted/gate.html \
           sexcapades.io/public_html/hosted/gate-assets/gate.css \
           sexcapades.io/public_html/hosted/gate-assets/gate.js \
           sexcapades.io/public_html/hosted/gate-assets/images/css-img-1.png; do
  echo "$LISTING" | grep -qx "$req" || fail "missing required entry: $req"
done
if echo "$LISTING" | grep -q '\.db$'; then
  fail "tarball contains .db files (never ship databases)"
fi
# The gate's ?return= fix must ride in the shipped bundle.
if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/gate-assets/gate.js 2>/dev/null | grep -q 'getReturnDestination'; then
  fail "packaged gate.js lacks getReturnDestination"
fi
if command -v node >/dev/null 2>&1; then
  if ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/gate-assets/gate.js > "$WORK/check.js" 2>/dev/null; then
    fail "could not extract gate.js for syntax check"
  elif ! node --check "$WORK/check.js" 2>"$WORK/check.err"; then
    fail "gate.js failed syntax check: $(head -1 "$WORK/check.err")"
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
