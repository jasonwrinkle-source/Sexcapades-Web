<?php
/**
 * Sexcapades rating pace statistics endpoint
 * GET (no params) — returns average rating pace from session_stats events
 *
 * - Overall: average topics/minute across all sessions
 * - Binned: avg elapsed minutes per topic_count band (0-50, 50-100, ..., 350-404)
 * - Minimum 5 sessions before data is shown (lower threshold; less sensitive)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$MIN_SESSIONS = 5;
$TOPIC_TOTAL = 404;
$BAND_WIDTH = 50;

// SQLite DB lives OUTSIDE public_html (same location collect.php writes to).
// collect.php path: ~/domains/sexcapades-data/sexcapades_data.db — four dirnames
// up from .../public_html/hosted/api lands on the domains dir.
$dbPath = dirname(dirname(dirname(dirname(__DIR__)))) . '/sexcapades-data/sexcapades_data.db';
if (!file_exists($dbPath) || filesize($dbPath) === 0) {
    echo json_encode(['ok' => false, 'error' => 'no data yet', 'total_sessions' => 0]);
    exit;
}

try {
    $db = new SQLite3($dbPath, SQLITE3_OPEN_READONLY);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'db unavailable', 'total_sessions' => 0]);
    exit;
}

// Table/column existence check (fresh DBs may not have tables/columns yet)
$tables = [];
$tres = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
if ($tres) {
    while ($trow = $tres->fetchArray(SQLITE3_ASSOC)) {
        $tables[] = $trow['name'];
    }
}
if (!in_array('events', $tables, true)) {
    $db->close();
    echo json_encode(['ok' => true, 'enough_data' => false, 'total_sessions' => 0, 'min_required' => $MIN_SESSIONS]);
    exit;
}

$eventCols = [];
$ecols = $db->query("PRAGMA table_info(events)");
if ($ecols) {
    while ($ecol = $ecols->fetchArray(SQLITE3_ASSOC)) {
        $eventCols[] = $ecol['name'];
    }
}
if (!in_array('elapsed_seconds', $eventCols, true) || !in_array('topic_count', $eventCols, true)) {
    $db->close();
    echo json_encode(['ok' => true, 'enough_data' => false, 'total_sessions' => 0, 'min_required' => $MIN_SESSIONS]);
    exit;
}

// Gather session stats: only rows with both values present and sane
$totalTopics = 0;
$totalSeconds = 0;
$totalSessions = 0;

// Bands: 0-50, 50-100, ..., 350-404
$numBands = (int)ceil($TOPIC_TOTAL / $BAND_WIDTH);
$bandSeconds = array_fill(0, $numBands, 0);
$bandN = array_fill(0, $numBands, 0);

$res = $db->query("SELECT elapsed_seconds, topic_count FROM events WHERE event_type = 'session_stats' AND elapsed_seconds IS NOT NULL AND topic_count IS NOT NULL");
if ($res) {
    while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
        $secs = max(0, (int)$row['elapsed_seconds']);
        $topics = max(0, (int)$row['topic_count']);
        // Sanity filters: ignore empty or absurd sessions
        if ($topics <= 0 || $secs <= 0) continue;
        if ($topics > $TOPIC_TOTAL || $secs > 12 * 3600) continue; // >12h likely idle tab
        $totalTopics += $topics;
        $totalSeconds += $secs;
        $totalSessions++;
        $band = (int)floor($topics / $BAND_WIDTH);
        if ($band >= $numBands) $band = $numBands - 1;
        $bandSeconds[$band] += $secs;
        $bandN[$band]++;
    }
}
$db->close();

if ($totalSessions < $MIN_SESSIONS) {
    echo json_encode(['ok' => true, 'enough_data' => false, 'total_sessions' => $totalSessions, 'min_required' => $MIN_SESSIONS]);
    exit;
}

$topicsPerMinute = $totalSeconds > 0 ? round($totalTopics / ($totalSeconds / 60), 1) : 0;

$bins = [];
for ($i = 0; $i < $numBands; $i++) {
    $lo = $i * $BAND_WIDTH;
    $hi = min(($i + 1) * $BAND_WIDTH, $TOPIC_TOTAL);
    $bins[] = [
        'range' => $lo . '-' . $hi,
        'avg_min' => $bandN[$i] > 0 ? round(($bandSeconds[$i] / $bandN[$i]) / 60, 1) : null,
        'n' => $bandN[$i],
    ];
}

echo json_encode([
    'ok' => true,
    'enough_data' => true,
    'topics_per_minute' => $topicsPerMinute,
    'total_sessions' => $totalSessions,
    'bins' => $bins,
]);
