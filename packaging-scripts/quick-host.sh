#!/bin/bash
# quick-host.sh -- Package, bump build version, upload to temp host, and print one-shot deploy command
# Usage: ./packaging-scripts/quick-host.sh [--all]
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="app"
[ "${1:-}" = "--all" ] && MODE="all"

echo "=== Sexcapades Quick Host Pipeline ($MODE) ==="

if [ "$MODE" = "all" ]; then
  OUTPUT=$(bash "$DIR/packaging-scripts/package-deploy-all-4.0.sh")
  TARBALL=$(echo "$OUTPUT" | grep -o 'deploy-all-v4.0-[^ ]*-optimized\.tar\.gz' | head -1)
  MD5=$(echo "$OUTPUT" | grep '^MD5: ' | head -1 | awk '{print $2}')
else
  OUTPUT=$(bash "$DIR/packaging-scripts/package-deploy-app-4.0.sh")
  TARBALL=$(echo "$OUTPUT" | grep -o 'deploy-app-v4.0-[^ ]*-optimized\.tar\.gz' | head -1)
  MD5=$(echo "$OUTPUT" | grep '^MD5: ' | head -1 | awk '{print $2}')
fi

[ -f "$DIR/$TARBALL" ] || { echo "ERROR: Tarball $TARBALL not found!"; exit 1; }

echo "Uploading $TARBALL ($(stat -c %s "$DIR/$TARBALL" | awk '{print int($1/1024/1024)"MB"}')) to temporary storage..."
URL=$(curl -4 -s -F "reqtype=fileupload" -F "time=1h" -F "fileToUpload=@$DIR/$TARBALL" https://litterbox.catbox.moe/resources/internals/api.php)

if [[ ! "$URL" =~ ^https?:// ]]; then
  echo "Upload error: $URL"
  exit 1
fi

echo ""
echo "=== Hostinger One-Shot Deploy Command ==="
echo "cd ~/domains && curl -L -o $TARBALL \"$URL\" && echo \"$MD5  $TARBALL\" | md5sum -c && tar -xzf $TARBALL"
echo ""
echo "Package: $TARBALL"
echo "MD5:     $MD5"
echo "URL:     $URL (valid 1 hour)"
