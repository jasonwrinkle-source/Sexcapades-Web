#!/bin/bash
# Sexcapades v3.5 deploy-all packager
# Usage: ./package-deploy-all-v3.5.sh
# Output: ~/workspace/your_files/sexcapades-3.0/deploy-all-v3.5-YYYY-MM-DD_HHMM-optimized.tar.gz

set -e

TIMESTAMP=$(TZ=America/Chicago date +%Y-%m-%d_%H%M)
STAGING=/tmp/sexcapades.io
OUTPUT=$HOME/workspace/your_files/sexcapades-3.0/deploy-all-v3.5-${TIMESTAMP}-optimized.tar.gz

ARTIFACT_EXPORT=$HOME/workspace/your_files/sexcapades/sexcapades.html
ARTIFACT_ASSETS=$HOME/workspace/ts-spaces/sexcapades/assets
STATIC=$HOME/workspace/goals/sexcapades-io-hosting-upload/files/sexcapades-io

echo "=== Building deploy-all ${TIMESTAMP} ==="

# Clean staging
rm -rf "$STAGING"
mkdir -p "$STAGING/public_html/hosted"

# 1. App (from FRESH artifact export, NOT the stale ts-spaces copy)
echo "Copying app..."
if [ ! -f "$ARTIFACT_EXPORT" ]; then
    echo "ERROR: Fresh artifact export not found at $ARTIFACT_EXPORT"
    echo "Run: artifact.export for slug sexcapades first"
    exit 1
fi
cp "$ARTIFACT_EXPORT" "$STAGING/public_html/hosted/app.html"
cp -r "$ARTIFACT_ASSETS" "$STAGING/public_html/hosted/"

# 2. Site root index.html (CRITICAL - prevents 403)
echo "Copying site index..."
if [ -f "$STATIC/public_html/index.html" ]; then
    cp "$STATIC/public_html/index.html" "$STAGING/public_html/"
else
    echo "ERROR: public_html/index.html not found in static files!"
    exit 1
fi

# 3. Static pages (hosted/)
echo "Copying static pages..."
cp "$STATIC/public_html/hosted/"*.html "$STAGING/public_html/hosted/"

# 4. Hero image and other assets
echo "Copying hosted assets..."
for f in hero-unrated-map.png; do
    if [ -f "$STATIC/public_html/hosted/$f" ]; then
        cp "$STATIC/public_html/hosted/$f" "$STAGING/public_html/hosted/"
    fi
done

# 4b. API directory (collect.php for visitor counters)
echo "Copying API..."
if [ -d "$STATIC/public_html/hosted/api" ]; then
    cp -r "$STATIC/public_html/hosted/api" "$STAGING/public_html/hosted/"
    find "$STAGING/public_html/hosted/api" -type f -name "*.php" -exec chmod 644 {} \;
else
    echo "WARNING: api/ directory not found!"
fi

# 5. Scripts
echo "Copying scripts..."
cp "$STATIC/"*.sh "$STAGING/" 2>/dev/null || true

# 6. Fix permissions (CRITICAL)
echo "Setting permissions..."
find "$STAGING" -type d -exec chmod 755 {} \;
find "$STAGING" -type f \( -name "*.html" -o -name "*.png" -o -name "*.js" -o -name "*.css" -o -name "*.svg" -o -name "*.ico" \) -exec chmod 644 {} \;
find "$STAGING" -type f -name "*.sh" -exec chmod 755 {} \;

# 7. Verify critical files
echo "Verifying..."
for f in "public_html/index.html" "public_html/hosted/app.html" "public_html/hosted/gate.html"; do
    if [ ! -f "$STAGING/$f" ]; then
        echo "ERROR: Missing $f"
        exit 1
    fi
done

# Check build number in app.html
BUILD=$(grep -o 'app-about-version">Version 3.0 · Build [^<]*' "$STAGING/public_html/hosted/app.html" | head -1)
echo "App build: $BUILD"

# 8. Create tar
echo "Creating tarball..."
cd /tmp
tar -czf "$OUTPUT" --exclude='*.db' sexcapades.io

# 9. Verify tar contents
echo "Verifying tar..."
tar -tzf "$OUTPUT" | grep -q "sexcapades.io/public_html/index.html" || (echo "ERROR: index.html not in tar!" && exit 1)
tar -tzf "$OUTPUT" | grep -q "sexcapades.io/public_html/hosted/app.html" || (echo "ERROR: app.html not in tar!" && exit 1)

SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "=== Done: $OUTPUT ($SIZE) ==="
echo "Upload to Drive snapshots folder: 1eEo97XoRiwHLiFloTof0IFYTHumB8gi5"
