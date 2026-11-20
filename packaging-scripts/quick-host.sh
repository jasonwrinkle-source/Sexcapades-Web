#!/bin/bash
# quick-host.sh -- Package, bump build version, upload to temp host, and print one-shot deploy command
# Usage: ./packaging-scripts/quick-host.sh [--all]
# Both modes upload here: default is deploy-app, --all is deploy-all.
# Litterbox is tried first (72h). If it does not return a URL, temp.sh is the fallback.
# temp.sh gives the file back only on POST, so the Hostinger command uses curl -X POST.
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="app"
[ "${1:-}" = "--all" ] && MODE="all"

echo "=== Sexcapades Quick Host Pipeline ($MODE) ==="

if [ "$MODE" = "all" ]; then
  OUTPUT=$(bash "$DIR/packaging-scripts/package-deploy-all-5.0.sh")
  TARBALL=$(echo "$OUTPUT" | grep -o 'deploy-all-v5.0-[^ ]*-optimized\.tar\.gz' | head -1)
  MD5=$(echo "$OUTPUT" | grep '^MD5: ' | head -1 | awk '{print $2}')
else
  OUTPUT=$(bash "$DIR/packaging-scripts/package-deploy-app-5.0.sh")
  TARBALL=$(echo "$OUTPUT" | grep -o 'deploy-app-v5.0-[^ ]*-optimized\.tar\.gz' | head -1)
  MD5=$(echo "$OUTPUT" | grep '^MD5: ' | head -1 | awk '{print $2}')
fi

TAR_PATH=""
if [ -f "$DIR/deploy-output/$TARBALL" ]; then
  TAR_PATH="$DIR/deploy-output/$TARBALL"
elif [ -f "$DIR/$TARBALL" ]; then
  TAR_PATH="$DIR/$TARBALL"
else
  echo "ERROR: Tarball $TARBALL not found in deploy-output or project root!"
  exit 1
fi

echo "Uploading $TARBALL ($(stat -c %s "$TAR_PATH" | awk '{print int($1/1024/1024)"MB"}')) to temporary storage (Litterbox 72h)..."
# || true: set -e would otherwise stop on a curl failure before the fallback.
URL=$(curl -4 -s -F "reqtype=fileupload" -F "time=72h" -F "fileToUpload=@$TAR_PATH" https://litterbox.catbox.moe/resources/internals/api.php || true)
URL=$(printf '%s' "$URL" | tr -d '\r' | head -1)
HOST_NOTE="valid 72 hours"

if [[ "$URL" =~ ^https?:// ]]; then
  echo "Uploaded to Litterbox: $URL"
  DEPLOY_CMD="cd ~/domains && curl -L -o $TARBALL \"$URL\" && echo \"$MD5  $TARBALL\" | md5sum -c && tar -xzf $TARBALL"
else
  echo "Litterbox did not return a URL. Trying temp.sh fallback..."
  URL=$(curl -s -F "file=@$TAR_PATH" https://temp.sh/upload || true)
  URL=$(printf '%s' "$URL" | tr -d '\r' | head -1)
  if [[ ! "$URL" =~ ^https://temp\.sh/ ]]; then
    echo "Upload error: temp.sh did not return a URL."
    exit 1
  fi
  echo "Uploaded to temp.sh: $URL"
  HOST_NOTE="temp.sh; download with POST"
  DEPLOY_CMD="cd ~/domains && curl -L -X POST -o $TARBALL \"$URL\" && echo \"$MD5  $TARBALL\" | md5sum -c && tar -xzf $TARBALL"
fi
mkdir -p "$DIR/deploy-output"
if [ "$MODE" = "all" ]; then
  echo "$DEPLOY_CMD" > "$DIR/deploy-output/DEPLOY_ALL_COMMAND.txt"
else
  echo "$DEPLOY_CMD" > "$DIR/deploy-output/DEPLOY_APP_COMMAND.txt"
fi

echo ""
echo "=== Hostinger One-Shot Deploy Command ==="
echo "$DEPLOY_CMD"
echo ""
echo "Package: $TARBALL"
echo "MD5:     $MD5"
echo "URL:     $URL ($HOST_NOTE)"
echo "Saved to: deploy-output/DEPLOY_${MODE^^}_COMMAND.txt"
