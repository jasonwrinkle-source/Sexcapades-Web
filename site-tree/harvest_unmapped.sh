#!/bin/bash
# harvest_unmapped.sh - Exports ranked unmapped fetishes report from live DB
# Usage: bash harvest_unmapped.sh [output_file]

DATA_DIR="$HOME/domains/capades-data"
DB="$DATA_DIR/flexcapades_data.db"
OUT_DEFAULT="$DATA_DIR/unmapped_fetishes_harvest_$(date '+%Y%m%d_%H%M%S').tsv"
OUT="${1:-$OUT_DEFAULT}"

if [ ! -f "$DB" ]; then
    echo "Error: Database not found at $DB"
    exit 1
fi

TABLES=$(sqlite3 "$DB" "SELECT name FROM sqlite_master WHERE type='table' AND name='unmapped_fetishes';" 2>/dev/null)
if [ -z "$TABLES" ]; then
    echo "No unmapped_fetishes table in database yet."
    exit 0
fi

TOTAL=$(sqlite3 "$DB" "SELECT COUNT(*) FROM unmapped_fetishes;")
DISTINCT_COUNT=$(sqlite3 "$DB" "SELECT COUNT(DISTINCT fetish_name) FROM unmapped_fetishes;")

echo "=== UNMAPPED FETISHES HARVEST ==="
echo "Database: $DB"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "Total submissions: $TOTAL"
echo "Unique fetish terms: $DISTINCT_COUNT"
echo "Exporting ranked report to: $OUT"

{
echo -e "count\tlist_type\tfetish_name"
sqlite3 -tabs "$DB" "
SELECT COUNT(*) as count, list_type, fetish_name
FROM unmapped_fetishes
GROUP BY fetish_name, list_type
ORDER BY count DESC, fetish_name ASC;
"
} > "$OUT"

echo "Export complete. Top 30 unmapped fetishes:"
head -n 31 "$OUT"
