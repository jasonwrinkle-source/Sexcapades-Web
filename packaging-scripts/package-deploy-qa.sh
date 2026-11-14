#!/bin/bash
# Sexcapades QA / Fleet Testing Tree Packager
# Packages the modular app + test-runner.html into a self-contained public_html/qa/ tarball
#
# Usage: ./packaging-scripts/package-deploy-qa.sh [timestamp]
# Output: deploy-qa-v4.0-YYYY-MM-DD_HHMM.tar.gz

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TS="${1:-$(TZ=America/Chicago date +%Y-%m-%d_%H%M)}"
OUTDIR="$DIR/deploy-output"
mkdir -p "$OUTDIR"
OUTFILE="$OUTDIR/deploy-qa-v4.0-${TS}.tar.gz"

HOSTED_SRC="$DIR/site-tree/public_html/hosted"
STATIC_SRC="$DIR/site-tree/public_html"

echo "=== Building Sexcapades QA Testing Package (${TS} CDT) ==="

# 1. Rebuild the bundle to ensure data-bootstrap.js is 100% up to date
echo "1. Rebuilding data-bootstrap bundle..."
python3 "$DIR/app/data/build-bundle.py"

WORK=$(mktemp -d)
trap "rm -rf $WORK" EXIT

# Target structure: sexcapades.io/public_html/qa/
QA_STAGING="$WORK/pkg/sexcapades.io/public_html/qa"
mkdir -p "$QA_STAGING"

echo "2. Staging files into public_html/qa/..."
# Copy the entire hosted tree into qa/
cp -a "$HOSTED_SRC/"* "$QA_STAGING/"

# QA PWA assets: the live service worker (rewritten to QA paths by step 3
# and stamped in step 3e), the QA manifest, and the QA icons. These are
# QA-only; the live sw.js/manifest/icons are untouched.
cp -a "$STATIC_SRC/sw.js" "$QA_STAGING/sw.js"
cp -a "$DIR/packaging-scripts/qa-manifest.json" "$QA_STAGING/manifest.json"
mkdir -p "$QA_STAGING/icons"
cp -a "$DIR/packaging-scripts/qa-icons/"*.png "$QA_STAGING/icons/"

# In qa/, rewrite references from "/hosted/" to "/qa/" so paths stay self-contained
echo "3. Adjusting relative paths for /qa/ root..."
find "$QA_STAGING" -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" \) -exec sed -i 's|/hosted/|/qa/|g' {} +
# The song files live on the production host. The rewrite above points the
# player at /qa/assets/audio/, which 404s. Put those URLs back.
find "$QA_STAGING" -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" \) -exec sed -i 's|sexcapades.io/qa/assets/audio/|sexcapades.io/hosted/assets/audio/|g' {} +

# Stamp the packaged pages only. The repo keeps the last release number;
# a QA drop gets its own qa-4.0-MMDD-HHMM tag for this package timestamp.
echo "3b. Stamping QA build ${TS}..."
QA_STAMP_FILES=()
for page in app.html; do
  if [ -f "$QA_STAGING/$page" ]; then
    QA_STAMP_FILES+=("$QA_STAGING/$page")
  fi
done
python3 "$DIR/packaging-scripts/bump-build.py" "$TS" qa "${QA_STAMP_FILES[@]}"

# 3d. Cache-buster: the staged app pages carry hand-maintained ?v= values
# (and several scripts carry none), so browsers served stale JS under a
# new build number. Rewrite every local .js/.css in the STAGED app pages
# to ?v=$TS at packaging time; the source keeps its values as fallbacks
# and the packaged output is always correct.
echo "3d. Stamping asset versions (?v=$TS) in the QA app pages..."
python3 "$DIR/packaging-scripts/stamp-asset-versions.py" "$TS" "${QA_STAMP_FILES[@]}"

# 3e. QA PWA: give QA its own service worker, manifest, and icons so QA
# files are cached under a QA cache name (sexcapades-qa-v$TS) that is
# purged when QA rebuilds, instead of sharing the live worker/cache.
# The live sw.js/manifest/icons are untouched; only the QA staging is
# rewritten. The /hosted/ -> /qa/ rewrite (step 3) already handled the
# /hosted/ paths in sw.js; here we finish the QA-specific rewrites.
echo "3e. Building the QA service worker, manifest links, and icons..."
# QA service worker: QA cache name, QA root/manifest/icon paths, QA-only
# purge prefix (so a QA activation purges only QA caches, never live),
# then stamp the __SX_CACHE__ token with the QA build number $TS.
# The purge-prefix rewrite matches whatever prefix the live worker
# currently carries (key.indexOf('sexcapades-...')) and substitutes the
# QA prefix, so it follows the live prefix if that ever changes.
sed -i "s|sexcapades-v__SX_CACHE__|sexcapades-qa-v__SX_CACHE__|" "$QA_STAGING/sw.js"
sed -i "s|  '/',|  '/qa/',|" "$QA_STAGING/sw.js"
sed -i "s|'/manifest.json'|'/qa/manifest.json'|" "$QA_STAGING/sw.js"
sed -i "s|'/icons/icon-192.png'|'/qa/icons/icon-qa-192-badge.png'|" "$QA_STAGING/sw.js"
sed -i "s|'/icons/icon-512.png'|'/qa/icons/icon-qa-512-badge.png'|" "$QA_STAGING/sw.js"
sed -i "s|key.indexOf('sexcapades-[^']*')|key.indexOf('sexcapades-qa-v')|" "$QA_STAGING/sw.js"
sed -i "s|__SX_CACHE__|$TS|g" "$QA_STAGING/sw.js"
# QA app pages: register the QA worker and link the QA manifest (the
# source keeps the live '/sw.js' and '/manifest.json'; only QA is rewritten).
for qapage in "${QA_STAMP_FILES[@]}"; do
  sed -i "s|register('/sw.js')|register('/qa/sw.js')|g" "$qapage"
  sed -i 's|href="/manifest.json"|href="/qa/manifest.json"|g' "$qapage"
done

# Add a redirect index.html in qa/ pointing to test-runner.html or app.html
cat << 'EOF' > "$QA_STAGING/index.html"
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sexcapades QA Tree</title>
  <meta http-equiv="refresh" content="0; url=test-runner.html">
</head>
<body style="font-family:sans-serif; background:#0d1117; color:#c9d1d9; padding:24px;">
  <h2>Sexcapades QA Testing Tree</h2>
  <ul>
    <li><a style="color:#58a6ff;" href="test-runner.html">Automated Test Harness (test-runner.html)</a></li>
    <li><a style="color:#58a6ff;" href="app.html#app/map">Interactive Hypermap (app.html)</a></li>
  </ul>
</body>
</html>
EOF

echo "3c. Setting permissions (2026-11-12: the VM checkout carries 660/2770 modes; bake 644/755 into the archive so the web server can read the deploy)..."
find "$QA_STAGING" -type d -exec chmod 755 {} \;
find "$QA_STAGING" -type f -exec chmod 644 {} \;
find "$QA_STAGING" -type f -name "*.sh" -exec chmod 755 {} \;
find "$QA_STAGING" -type f -name "*.php" -exec chmod 644 {} \;

echo "4. Creating tarball..."
tar -czf "$OUTFILE" -C "$WORK/pkg" sexcapades.io/public_html/qa

echo "5. Verifying archive contents..."
tar -tf "$OUTFILE" | grep -q "sexcapades.io/public_html/qa/test-runner.html" || {
  echo "ERROR: test-runner.html missing from package!"
  exit 1
}
tar -tf "$OUTFILE" | grep -q "sexcapades.io/public_html/qa/app.html" || {
  echo "ERROR: app.html missing from package!"
  exit 1
}
tar -tf "$OUTFILE" | grep -q "sexcapades.io/public_html/qa/data/data-bootstrap.js" || {
  echo "ERROR: data-bootstrap.js missing from package!"
  exit 1
}

# Cache-buster gate: every .js/.css the QA app pages load must carry ?v=$TS.
# A stale or missing ?v= means a browser can serve old JavaScript under a
# new build number (the 1738/2047 stale-cache catch).
for qapage in sexcapades.io/public_html/qa/app.html; do
  QAPAGE_CONTENT=$(tar -xzOf "$OUTFILE" "$qapage" 2>/dev/null || true)
  if [ -z "$QAPAGE_CONTENT" ]; then
    echo "ERROR: $qapage missing or unreadable in package!"
    exit 1
  fi
  BAD_QA_REFS=$(printf '%s' "$QAPAGE_CONTENT" | grep -oE '(src|href)="[^"]*\.(js|css)(\?[^"]*)?"' | grep -v "?v=$TS" || true)
  if [ -n "$BAD_QA_REFS" ]; then
    echo "ERROR: $qapage has asset references without ?v=$TS:"
    printf '%s\n' "$BAD_QA_REFS"
    exit 1
  fi
done
echo "QA cache-buster gate passed (all app asset refs carry ?v=$TS)."

# QA PWA gate: the QA worker, manifest, icons, and the app pages'
# registration/manifest links must all be QA-scoped. A QA page that
# still registers the live worker (or a QA worker with live paths) would
# cache QA files under the live build's cache name.
echo "QA PWA gate: checking the QA worker, manifest, icons, and links..."
QA_SW=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/qa/sw.js 2>/dev/null || true)
if [ -z "$QA_SW" ]; then echo "ERROR: qa/sw.js missing from package!"; exit 1; fi
echo "$QA_SW" | grep -q "sexcapades-qa-v$TS" || { echo "ERROR: qa/sw.js cache name is not sexcapades-qa-v$TS"; exit 1; }
echo "$QA_SW" | grep -q "'/qa/'" || { echo "ERROR: qa/sw.js CORE_URLS missing /qa/ root"; exit 1; }
echo "$QA_SW" | grep -q "'/qa/manifest.json'" || { echo "ERROR: qa/sw.js CORE_URLS missing /qa/manifest.json"; exit 1; }
echo "$QA_SW" | grep -q "'/qa/icons/icon-qa-192-badge.png'" || { echo "ERROR: qa/sw.js CORE_URLS missing the QA 192 badge icon"; exit 1; }
echo "$QA_SW" | grep -q "'/qa/icons/icon-qa-512-badge.png'" || { echo "ERROR: qa/sw.js CORE_URLS missing the QA 512 badge icon"; exit 1; }
echo "$QA_SW" | grep -q "key.indexOf('sexcapades-qa-v')" || { echo "ERROR: qa/sw.js purge prefix is not sexcapades-qa-v"; exit 1; }
echo "$QA_SW" | grep -q "key.indexOf('sexcapades-v')" && { echo "ERROR: qa/sw.js still has the live purge prefix"; exit 1; }
echo "$QA_SW" | grep -q "superimposed" && { echo "ERROR: qa/sw.js still references the superimposed icons"; exit 1; }
echo "$QA_SW" | grep -q "/hosted/" && { echo "ERROR: qa/sw.js still has /hosted/ paths"; exit 1; }
echo "$QA_SW" | grep -q "'/manifest.json'" && { echo "ERROR: qa/sw.js still references the live manifest"; exit 1; }
echo "$QA_SW" | grep -q "'/icons/icon-" && { echo "ERROR: qa/sw.js still references the live icons"; exit 1; }
QA_MF=$(tar -xzOf "$OUTFILE" sexcapades.io/public_html/qa/manifest.json 2>/dev/null || true)
if [ -z "$QA_MF" ]; then echo "ERROR: qa/manifest.json missing from package!"; exit 1; fi
echo "$QA_MF" | grep -q '"name":"Sexcapades QA"' || { echo "ERROR: qa/manifest.json name is not Sexcapades QA"; exit 1; }
echo "$QA_MF" | grep -q '"scope":"/qa/"' || { echo "ERROR: qa/manifest.json scope is not /qa/"; exit 1; }
echo "$QA_MF" | grep -q '"start_url":"/qa/app.html"' || { echo "ERROR: qa/manifest.json start_url is not /qa/app.html"; exit 1; }
echo "$QA_MF" | grep -q 'icon-qa-192-badge.png' || { echo "ERROR: qa/manifest.json does not reference the QA 192 badge icon"; exit 1; }
echo "$QA_MF" | grep -q 'icon-qa-512-badge.png' || { echo "ERROR: qa/manifest.json does not reference the QA 512 badge icon"; exit 1; }
echo "$QA_MF" | grep -q 'superimposed' && { echo "ERROR: qa/manifest.json still references the superimposed icons"; exit 1; }
for qaicon in icon-qa-192-badge.png icon-qa-512-badge.png; do
  tar -tf "$OUTFILE" | grep -q "sexcapades.io/public_html/qa/icons/$qaicon" || { echo "ERROR: qa/icons/$qaicon missing from package!"; exit 1; }
done
for qapage in sexcapades.io/public_html/qa/app.html; do
  QAPAGE_CONTENT=$(tar -xzOf "$OUTFILE" "$qapage" 2>/dev/null || true)
  echo "$QAPAGE_CONTENT" | grep -q "register('/qa/sw.js')" || { echo "ERROR: $qapage does not register /qa/sw.js"; exit 1; }
  echo "$QAPAGE_CONTENT" | grep -q 'href="/qa/manifest.json"' || { echo "ERROR: $qapage does not link /qa/manifest.json"; exit 1; }
done
echo "QA PWA gate passed (QA worker, manifest, icons, and links are QA-scoped)."

MD5=$(md5sum "$OUTFILE" | awk '{print $1}')
SIZE=$(ls -lh "$OUTFILE" | awk '{print $5}')
TAR_NAME=$(basename "$OUTFILE")

echo ""
echo "======================================================================"
echo "QA Package Created: $TAR_NAME"
echo "Size: $SIZE"
echo "MD5:  $MD5"
echo "======================================================================"

echo "6. Uploading to temporary cloud storage (Litterbox 72h)..."
UPLOAD_URL=$(curl -4 -s -F "reqtype=fileupload" -F "time=72h" -F "fileToUpload=@$OUTFILE" https://litterbox.catbox.moe/resources/internals/api.php || true)
DEPLOY_CMD=""

if [[ "$UPLOAD_URL" =~ ^https?:// ]]; then
  echo "Uploaded to Litterbox: $UPLOAD_URL"
  DEPLOY_CMD="cd ~/domains && curl -L -o $TAR_NAME \"$UPLOAD_URL\" && echo \"$MD5  $TAR_NAME\" | md5sum -c && echo \"MD5 OK  $MD5\" && tar -xzf $TAR_NAME && rm $TAR_NAME"
else
  echo "Trying temp.sh fallback..."
  UPLOAD_URL=$(curl -s -F "file=@$OUTFILE" https://temp.sh/upload || true)
  if [[ "$UPLOAD_URL" =~ ^https://temp\.sh/ ]]; then
    echo "Uploaded to temp.sh: $UPLOAD_URL"
    DEPLOY_CMD="cd ~/domains && curl -L -X POST -o $TAR_NAME \"$UPLOAD_URL\" && echo \"$MD5  $TAR_NAME\" | md5sum -c && echo \"MD5 OK  $MD5\" && tar -xzf $TAR_NAME && rm $TAR_NAME"
  fi
fi

if [ -n "$DEPLOY_CMD" ]; then
  echo "$DEPLOY_CMD" > "$OUTDIR/DEPLOY_QA_COMMAND.txt"
  echo ""
  echo "=== Hostinger SSH One-Step Deployment Command ==="
  echo "$DEPLOY_CMD"
  echo ""
  echo "Saved to: deploy-output/DEPLOY_QA_COMMAND.txt"
fi

echo ""
echo "Testing URLs will be:"
echo "  Harness:  https://sexcapades.io/qa/test-runner.html"
echo "  App:      https://sexcapades.io/qa/app.html#app/map"
echo "======================================================================"
