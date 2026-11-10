#!/bin/bash
# Package deploy-app tar for Sexcapades v3.5
# Usage: package-deploy-app-v3.5.sh <exported-html> [timestamp]
# Output: ~/workspace/your_files/sexcapades-3.0/deploy-app-v3.5-YYYY-MM-DD_HHMM-optimized.tar.gz
# Structure: sexcapades.io/public_html/hosted/app.html + app-assets/
# (NEVER at sexcapades.io/index.html — that overwrites the gate)

set -e

SRC="${1:?Usage: $0 <exported-html> [timestamp]}"
TS="${2:-$(TZ=America/Chicago date +%Y-%m-%d_%H%M)}"
OPTIMIZER=~/workspace/sexcapades-3.5-optimize.py
OUTDIR=~/workspace/your_files/sexcapades-3.0
OUTFILE="$OUTDIR/deploy-app-v3.5-${TS}-optimized.tar.gz"

# --- Pre-flight: verify every declared input path exists BEFORE relying on it.
[ -f "$SRC" ] || { echo "ERROR: source export not found: $SRC"; exit 1; }
[ -f "$OPTIMIZER" ] || { echo "ERROR: optimizer not found: $OPTIMIZER"; exit 1; }
[ -x "$HOME/workspace/sexcapades-drive-upload.sh" ] || { echo "ERROR: Drive upload helper not found/executable: ~/workspace/sexcapades-drive-upload.sh"; exit 1; }

# Service worker master (2026-10-20 cache fix): every package ships sw.js
# at the docroot with its cache name stamped from THIS app build, so an
# app-only deploy also updates the worker (deploy-app never shipped it
# before, leaving browsers on whatever worker an old deploy-all left).
SW_SRC=$HOME/workspace/goals/sexcapades-io-hosting-upload/files/sexcapades-io/public_html/sw.js
[ -f "$SW_SRC" ] || { echo "ERROR: service worker source not found: $SW_SRC"; exit 1; }
BUILD_NUM=$(grep -o 'Version 3.5 · Build [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' "$SRC" | head -1 | sed 's/^.*Build //' || true)
[ -n "$BUILD_NUM" ] || { echo "ERROR: could not read build number from source export: $SRC"; exit 1; }

WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

echo "Optimizing..."
python3 "$OPTIMIZER" "$SRC" "$WORK/opt" app.html

echo "Packaging..."
mkdir -p "$WORK/pkg/sexcapades.io/public_html/hosted"
mv "$WORK/opt/app.html" "$WORK/pkg/sexcapades.io/public_html/hosted/app.html"
mv "$WORK/opt/app-assets" "$WORK/pkg/sexcapades.io/public_html/hosted/"
sed "s/__SX_CACHE__/$BUILD_NUM/g" "$SW_SRC" > "$WORK/pkg/sexcapades.io/public_html/sw.js"
# Freshness is structural (2026-10-20 replay finding): stamp the staged
# worker's mtime to the packaging moment. A stale mtime lets the browser's
# worker-update revalidation answer 304 ("unchanged") and the fixed worker
# is never delivered to an already-poisoned profile.
touch "$WORK/pkg/sexcapades.io/public_html/sw.js"
echo "Service worker cache stamped: sexcapades-v$BUILD_NUM"

# --- Version manifest (2026-10-25, gate prefetch): every deploy-app emits
# hosted/app-assets/version-manifest.json so the gate's prefetch consumer
# can warm the app bundle on idle. Stamped scripts/css carry ?v=<build>;
# images are bare (unstamped by design). A missing staged asset fails the
# package -- a manifest must never point at a file that isn't shipped.
echo "Writing version manifest..."
MANIFEST="$WORK/pkg/sexcapades.io/public_html/hosted/app-assets/version-manifest.json"
for asset in app.css app.js vendor/qrcode.min.js data-bootstrap.js images/guide-avatar.jpg images/hanky-chart.jpg images/avatar-1.jpg images/avatar-2.jpg images/avatar-3.jpg images/avatar-4.jpg images/avatar-5.jpg images/avatar-anon.webp images/deknotter-icon.webp; do
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
    { "url": "/hosted/app-assets/images/deknotter-icon.webp", "as": "image" }
  ]
}
EOF

cd "$WORK/pkg"
find sexcapades.io -type d -exec chmod 755 {} \;
find sexcapades.io -type f -exec chmod 644 {} \;
tar -czf "$OUTFILE" sexcapades.io

# --- Post-package verification gate (2026-10-19): the tar's own bytes are
# the verdict. A tarball that fails ANY check is quarantined as .FAILED and
# never ships silently -- 1857 shipped unparseable JS this way.
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

# Build marker: the packaged app must carry the source export's current build.
EXPECTED_BUILD=$(grep -o 'Version 3.5 · Build [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' "$SRC" | head -1 || true)
if [ -z "$EXPECTED_BUILD" ]; then
  fail "could not read build marker from source export"
elif ! tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -qF "$EXPECTED_BUILD"; then
  fail "packaged app.html lacks the source build marker: $EXPECTED_BUILD"
fi

# Version manifest: the tar must carry it, it must parse as JSON, name
# this build, and list exactly the 13 shipped files (stamped scripts/css,
# bare images). The gate prefetches from this file; a wrong manifest sends
# the gate warming the wrong build's files.
MANIFEST_JSON=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app-assets/version-manifest.json 2>/dev/null || true)
if [ -z "$MANIFEST_JSON" ]; then
  fail "packaged version-manifest.json missing or unreadable"
elif ! printf '%s' "$MANIFEST_JSON" | python3 -c "import json,sys; m=json.load(sys.stdin); assert m['build']=='$BUILD_NUM'; assert len(m['files'])==13" 2>/dev/null; then
  fail "packaged version-manifest.json is invalid, names the wrong build, or lists != 13 files"
fi

# Service worker + shell stamps (2026-10-20 cache fix): the packaged sw.js
# must carry THIS build's cache name, and every generated JS/CSS asset
# reference in the packaged shell must carry the same ?v= stamp. Anything
# else lets a returning browser be served a cross-build mix (new shell,
# old scripts) or stay pinned to a cached old build.
if [ -n "$EXPECTED_BUILD" ]; then
  GATE_BUILD="${EXPECTED_BUILD##*Build }"
  SW_CACHE=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/sw.js 2>/dev/null | grep -o 'sexcapades-v[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{4\}' | head -1 || true)
  if [ "$SW_CACHE" != "sexcapades-v$GATE_BUILD" ]; then
    fail "packaged sw.js cache name '${SW_CACHE:-none}' != sexcapades-v$GATE_BUILD"
  fi
  SHELL_REFS=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/hosted/app.html 2>/dev/null | grep -oE '"app-assets/[^"]+"' || true)
  for ref in $SHELL_REFS; do
    refpath=${ref//\"/}
    case "$refpath" in
      *".js?v=$GATE_BUILD"|*".css?v=$GATE_BUILD") ;;
      *.js|*.css) fail "unstamped app-assets reference in packaged app.html: $ref" ;;
      *.js\?*|*.css\?*) fail "app-assets reference stamped with wrong build in packaged app.html: $ref" ;;
    esac
  done
fi

# JS syntax: every bundled script must parse.
if command -v node >/dev/null 2>&1; then
  for js in sexcapades.io/public_html/hosted/app-assets/app.js \
            sexcapades.io/public_html/hosted/app-assets/data-bootstrap.js; do
    if ! tar -xzOf "$OUTFILE" "$js" > "$WORK/check.js" 2>/dev/null; then
      fail "could not extract $js for syntax check"
    elif ! node --check "$WORK/check.js" 2>"$WORK/check.err"; then
      fail "$js failed syntax check: $(head -1 "$WORK/check.err")"
    fi
  done
else
  echo "  (node not available -- syntax check skipped)"
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
tar -tzf "$OUTFILE" | head -8

# --- Drive upload (2026-10-20, invisible-pipeline step 1): a deploy is not
# done until the verified tar is confirmed in the Drive pre-release folder.
# A built-but-not-uploaded tarball exits 2, so no caller (human or agent)
# can mistake "built" for "done".
"$HOME/workspace/sexcapades-drive-upload.sh" "$OUTFILE" "1x0uaRR_H62FIuhTO7fJNf0HpIeg1bTJQ" "deploy-app" || {
  echo ""
  echo "BUILT BUT NOT UPLOADED -- verified tar is waiting at: $OUTFILE"
  exit 2
}
echo "Deploy-app complete: built, verified, and confirmed in Drive pre-release."
