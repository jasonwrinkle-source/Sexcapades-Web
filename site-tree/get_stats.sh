#!/bin/bash
# get_stats.sh - Sexcapades analytics dashboard, appends to stats.out
# Usage: bash get_stats.sh   (or: chmod +x get_stats.sh && ./get_stats.sh)

# Data lives OUTSIDE public_html so deploys don't overwrite it (Jason 2026-10-14)
DATA_DIR="$HOME/domains/sexcapades-data"
DB="$DATA_DIR/sexcapades_data.db"
OUT="$DATA_DIR/stats.out"
# Still cd to site root for .build-number
cd ~/domains/sexcapades.io/public_html/ || { echo "Could not cd to site root"; exit 1; }
BUILD=$(cat .build-number 2>/dev/null || echo "unknown")

# Check if DB and tables exist
if [ ! -f "$DB" ]; then
    echo "No database yet — no data has been submitted."
    echo "Appended to $OUT (build $BUILD) — no data"
    echo ""
    echo "=== No data yet ==="
    echo "The database will be created when the first survey is submitted."
    exit 0
fi

TABLES=$(sqlite3 "$DB" "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null)
if ! echo "$TABLES" | grep -q "surveys"; then
    echo "Database exists but no surveys table yet."
    exit 0
fi

{
echo "########## $(date '+%Y-%m-%d %H:%M:%S %Z') — build $BUILD ##########"
echo ""
echo "=== OVERVIEW ==="
sqlite3 -header -column "$DB" "
SELECT 'Unique visitors' AS metric, COUNT(DISTINCT uuid) AS value FROM events
UNION ALL SELECT 'Gate passes', COUNT(*) FROM events WHERE event_type='gate_passed'
UNION ALL SELECT 'Quickstart started', COUNT(*) FROM events WHERE event_type='quickstart_started'
UNION ALL SELECT 'Quickstart completed', COUNT(*) FROM events WHERE event_type='quickstart_completed'
UNION ALL SELECT 'Surveys submitted', COUNT(*) FROM surveys;"

echo ""
echo "=== EVENTS BY TYPE ==="
sqlite3 -header -column "$DB" "
SELECT event_type AS event, COUNT(*) AS count
FROM events GROUP BY event_type ORDER BY count DESC;"

echo ""
echo "=== DAILY (last 14 days) ==="
sqlite3 -header -column "$DB" "
SELECT date(created_at) AS day, COUNT(*) AS events, COUNT(DISTINCT uuid) AS visitors
FROM events GROUP BY day ORDER BY day DESC LIMIT 14;"

echo ""
echo "=== SURVEYS BY APP VERSION ==="
sqlite3 -header -column "$DB" "
SELECT app_version AS version, COUNT(*) AS surveys, AVG(topic_count) AS avg_topics
FROM surveys GROUP BY app_version;"

echo ""
echo "=== SURVEYS BY APP VERSION + BUILD ==="
sqlite3 -header -column "$DB" "
SELECT app_version AS version, COALESCE(NULLIF(app_build,''),'(unknown)') AS build, COUNT(*) AS surveys, AVG(topic_count) AS avg_topics
FROM surveys GROUP BY app_version, app_build ORDER BY version, build;"
echo ""
} >> "$OUT"

echo "Appended to $OUT (build $BUILD)"
echo ""
echo "=== Last entry ==="
tail -n 40 "$OUT"
