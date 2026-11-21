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

# Direct SSH stream pipe to Hostinger (active method -- ssh is working well)
DEPLOY_CMD="ssh hostinger \"cd ~/domains && tar -xzf -\" < \"$TAR_PATH\""
HOST_NOTE="direct SSH stream pipe"
URL="ssh://hostinger"

# --- Mirror methods commented out (ssh is working well) ---
# echo "Uploading $TARBALL ($(stat -c %s "$TAR_PATH" | awk '{print int($1/1024/1024)"MB"}')) to temporary storage..."
# # Try Litterbox (72h) first
# URL=$(curl -4 -s -F "reqtype=fileupload" -F "time=72h" -F "fileToUpload=@$TAR_PATH" https://litterbox.catbox.moe/resources/internals/api.php || true)
# URL=$(printf '%s' "$URL" | tr -d '\r' | head -1)
# HOST_NOTE="valid 72 hours"
#
# if [[ "$URL" =~ ^https?://.*catbox\.moe ]]; then
#   echo "Uploaded to Litterbox: $URL"
#   DEPLOY_CMD="cd ~/domains && curl -L -o $TARBALL \"$URL\" && echo \"$MD5  $TARBALL\" | md5sum -c && tar -xzf $TARBALL"
# else
#   echo "Litterbox did not return a valid URL. Trying Catbox..."
#   URL=$(curl -s -F "reqtype=fileupload" -F "fileToUpload=@$TAR_PATH" https://catbox.moe/user/api.php || true)
#   URL=$(printf '%s' "$URL" | tr -d '\r' | head -1)
#   if [[ "$URL" =~ ^https?://files\.catbox\.moe ]]; then
#     echo "Uploaded to Catbox: $URL"
#     HOST_NOTE="Catbox permanent mirror"
#     DEPLOY_CMD="cd ~/domains && curl -L -o $TARBALL \"$URL\" && echo \"$MD5  $TARBALL\" | md5sum -c && tar -xzf $TARBALL"
#   else
#     echo "Catbox did not return a valid URL. Trying Uguu..."
#     UGUU_RESP=$(curl -s -F "files[]=@$TAR_PATH" https://uguu.se/upload.php || true)
#     URL=$(echo "$UGUU_RESP" | jq -r '.files[0].url // empty' 2>/dev/null || true)
#     if [[ "$URL" =~ ^https?://.*uguu\.se ]]; then
#       echo "Uploaded to Uguu: $URL"
#       HOST_NOTE="Uguu (3h temporary)"
#       DEPLOY_CMD="cd ~/domains && curl -L -o $TARBALL \"$URL\" && echo \"$MD5  $TARBALL\" | md5sum -c && tar -xzf $TARBALL"
#     else
#       echo "Uguu did not return a valid URL. Trying temp.sh fallback..."
#       URL=$(curl -s -F "file=@$TAR_PATH" https://temp.sh/upload || true)
#       URL=$(printf '%s' "$URL" | tr -d '\r' | head -1)
#       if [[ ! "$URL" =~ ^https://temp\.sh/ ]]; then
#         echo "Upload error: all hosters failed to return a URL."
#         exit 1
#       fi
#       echo "Uploaded to temp.sh: $URL"
#       HOST_NOTE="temp.sh; download with POST"
#       DEPLOY_CMD="cd ~/domains && curl -L -X POST -o $TARBALL \"$URL\" && echo \"$MD5  $TARBALL\" | md5sum -c && tar -xzf $TARBALL"
#     fi
#   fi
# fi
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
