#!/bin/bash
# sexcapades-drive-upload.sh -- upload one file to a Google Drive folder and
# VERIFY it landed. Part of the invisible pipeline (2026-10-20): a package is
# not done until its file is confirmed in Drive, by name AND byte size.
#
# Usage: sexcapades-drive-upload.sh <local-file> <drive-folder-id> <label>
# Exit:  0 = uploaded and verified present in the folder
#        1 = upload or verification failed (message says which)
#
# Called by the packaging scripts after their verification gates pass.
# Safe to run standalone for a manual upload.

set -u

FILE="${1:?Usage: $0 <local-file> <drive-folder-id> <label>}"
FOLDER="${2:?Usage: $0 <local-file> <drive-folder-id> <label>}"
LABEL="${3:-upload}"

if [ ! -f "$FILE" ]; then
  echo "UPLOAD FAILED [$LABEL]: local file not found: $FILE"
  exit 1
fi

NAME=$(basename "$FILE")
SIZE=$(stat -c %s "$FILE")

echo "Uploading [$LABEL] $NAME ($SIZE bytes) to Drive folder $FOLDER ..."
UPLOAD_JSON=$(hatch_gws_cli drive +upload "$FILE" --parent "$FOLDER" --name "$NAME" 2>&1)
if [ $? -ne 0 ]; then
  echo "UPLOAD FAILED [$LABEL]: the upload command failed:"
  echo "$UPLOAD_JSON" | tail -3
  exit 1
fi
DRIVE_ID=$(echo "$UPLOAD_JSON" | jq -r '.id // empty' 2>/dev/null)
if [ -z "$DRIVE_ID" ]; then
  echo "UPLOAD FAILED [$LABEL]: upload returned no file id:"
  echo "$UPLOAD_JSON" | tail -3
  exit 1
fi
echo "  uploaded, Drive file id: $DRIVE_ID"

# Verify independently: list the folder and require a name+size match.
LIST_JSON=$(hatch_gws_cli drive files list --params "{\"q\": \"'$FOLDER' in parents and name = '$NAME' and trashed = false\", \"fields\": \"files(id,name,size)\"}" 2>&1)
if [ $? -ne 0 ]; then
  echo "UPLOAD UNVERIFIED [$LABEL]: could not list the Drive folder to confirm:"
  echo "$LIST_JSON" | tail -3
  exit 1
fi
MATCH=$(echo "$LIST_JSON" | jq -r --arg n "$NAME" --arg s "$SIZE" \
  '[.files[]? | select(.name == $n and (.size | tostring) == $s)] | length' 2>/dev/null)
MATCH_NUM=${MATCH:-0}
if [ "$MATCH_NUM" -lt 1 ]; then
  echo "UPLOAD UNVERIFIED [$LABEL]: no file named $NAME with size $SIZE found in folder $FOLDER"
  exit 1
fi

echo "  verified in Drive: $NAME ($SIZE bytes, id $DRIVE_ID)"
exit 0
