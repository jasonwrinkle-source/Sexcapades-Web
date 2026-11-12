#!/bin/bash
# Sexcapades QA / Fleet Testing Tree Packager
# Packages the modular app + test-runner.html into a self-contained public_html/qa/ tarball
#
# Usage: ./packaging-scripts/package-deploy-qa.sh [timestamp]
# Output: deploy-qa-v4.0-YYYY-MM-DD_HHMM.tar.gz

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TS="${1:-$(TZ=America/Chicago date +%Y-%m-%d_%H%M)}"
OUTDIR="$DIR"
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
for page in app.html app-modular.html; do
  if [ -f "$QA_STAGING/$page" ]; then
    QA_STAMP_FILES+=("$QA_STAGING/$page")
  fi
done
python3 "$DIR/packaging-scripts/bump-build.py" "$TS" qa "${QA_STAMP_FILES[@]}"

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
    <li><a style="color:#58a6ff;" href="app-modular.html#app/map">Modular Hypermap (app-modular.html)</a></li>
  </ul>
</body>
</html>
EOF

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

MD5=$(md5sum "$OUTFILE" | awk '{print $1}')
SIZE=$(ls -lh "$OUTFILE" | awk '{print $5}')
TAR_NAME=$(basename "$OUTFILE")

echo ""
echo "======================================================================"
echo "QA Package Created: $TAR_NAME"
echo "Size: $SIZE"
echo "MD5:  $MD5"
echo "======================================================================"

echo "6. Uploading to temporary cloud storage..."
UPLOAD_URL=$(curl -s -F "file=@$OUTFILE" https://temp.sh/upload || true)
DEPLOY_CMD=""

if [[ "$UPLOAD_URL" =~ ^https://temp\.sh/ ]]; then
  echo "Uploaded to temp.sh: $UPLOAD_URL"
  DEPLOY_CMD="cd ~/domains && curl -L -X POST -o $TAR_NAME \"$UPLOAD_URL\" && echo \"$MD5  $TAR_NAME\" | md5sum -c && echo \"MD5 OK  $MD5\" && tar -xzf $TAR_NAME && rm $TAR_NAME"
else
  echo "Trying Litterbox fallback..."
  UPLOAD_URL=$(curl -4 -s -F "reqtype=fileupload" -F "time=1h" -F "fileToUpload=@$OUTFILE" https://litterbox.catbox.moe/resources/internals/api.php || true)
  if [[ "$UPLOAD_URL" =~ ^https?:// ]]; then
    echo "Uploaded to Litterbox: $UPLOAD_URL"
    DEPLOY_CMD="cd ~/domains && curl -L -o $TAR_NAME \"$UPLOAD_URL\" && echo \"$MD5  $TAR_NAME\" | md5sum -c && echo \"MD5 OK  $MD5\" && tar -xzf $TAR_NAME && rm $TAR_NAME"
  fi
fi

if [ -n "$DEPLOY_CMD" ]; then
  echo "$DEPLOY_CMD" > "$DIR/DEPLOY_QA_COMMAND.txt"
  echo ""
  echo "=== Hostinger SSH One-Step Deployment Command ==="
  echo "$DEPLOY_CMD"
  echo ""
  echo "Saved to: DEPLOY_QA_COMMAND.txt"
fi

echo ""
echo "Testing URLs will be:"
echo "  Harness:  https://sexcapades.io/qa/test-runner.html"
echo "  App:      https://sexcapades.io/qa/app.html#app/map"
echo "======================================================================"
