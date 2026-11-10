<?php
/**
 * Sexcapades community completion statistics endpoint
 * GET (no params) — returns completion histogram + session depth stats
 *
 * - Completion histogram: topic_count binned into 10 bins (0-10% ... 90-100% of 404 topics)
 * - Session depth: distinct active days per uuid from the events table,
 *   distribution of 1 / 2 / 3+ sessions, and avg topic_count for
 *   single-session vs multi-session contributors
 * - Minimum 20 surveys before data is shown (privacy threshold)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://sexcapades.io');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$MIN_SURVEYS = 20;
$TOPIC_TOTAL = 404;
$NUM_BINS = 10;

// SQLite DB lives OUTSIDE public_html (same location collect.php writes to).
// collect.php path: ~/domains/sexcapades-data/sexcapades_data.db — four dirnames
// up from .../public_html/hosted/api lands on the domains dir.
$dataDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/sexcapades-data';
$dbPath = $dataDir . '/sexcapades_data.db';
if (!file_exists($dbPath) || filesize($dbPath) === 0) {
    echo json_encode(['ok' => false, 'error' => 'no data yet', 'count' => 0]);
    exit;
}

try {
    $db = new SQLite3($dbPath, SQLITE3_OPEN_READONLY);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'db unavailable', 'count' => 0]);
    exit;
}

// Table existence check (fresh DBs may not have tables yet)
$tables = [];
$tres = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
if ($tres) {
    while ($trow = $tres->fetchArray(SQLITE3_ASSOC)) {
        $tables[] = $trow['name'];
    }
}
if (!in_array('surveys', $tables, true)) {
    $db->close();
    echo json_encode(['ok' => true, 'enough_data' => false, 'count' => 0, 'min_required' => $MIN_SURVEYS]);
    exit;
}

$totalSurveys = (int)$db->querySingle("SELECT COUNT(*) FROM surveys");
if ($totalSurveys < $MIN_SURVEYS) {
    $db->close();
    echo json_encode(['ok' => true, 'enough_data' => false, 'count' => $totalSurveys, 'min_required' => $MIN_SURVEYS]);
    exit;
}

// --- Completion histogram ---
// Bin topic_count as a percentage of 404 topics into 10 bins.
$bins = array_fill(0, $NUM_BINS, 0);
$binned = 0;
$topicSum = 0;
$topicN = 0;

$cres = $db->query("SELECT topic_count FROM surveys WHERE topic_count IS NOT NULL");
if ($cres) {
    while ($crow = $cres->fetchArray(SQLITE3_ASSOC)) {
        $tc = max(0, (int)$crow['topic_count']);
        $bin = (int)floor($tc / $TOPIC_TOTAL * $NUM_BINS);
        if ($bin >= $NUM_BINS) $bin = $NUM_BINS - 1;
        $bins[$bin]++;
        $binned++;
        $topicSum += $tc;
        $topicN++;
    }
}

$binLabels = [];
for ($i = 0; $i < $NUM_BINS; $i++) {
    $binLabels[] = ($i * 10) . '–' . (($i + 1) * 10) . '%';
}

// --- Session depth ---
// Sessions ~= distinct calendar days with events per uuid (events table is append-only).
// Note: surveys is an upsert (one row per uuid), so per-session topic_count history
// does not exist. We compare avg topic_count of single-session vs multi-session
// contributors as the "do returners go deeper?" proxy.
$sessionDist = ['one' => 0, 'two' => 0, 'three' => 0, 'four_plus' => 0];
$singleSum = 0; $singleN = 0;
$multiSum = 0; $multiN = 0;
$usersWithSessions = 0;

if (in_array('events', $tables, true)) {
    // topic_count lookup per uuid
    $topicByUuid = [];
    $sres = $db->query("SELECT uuid, topic_count FROM surveys WHERE topic_count IS NOT NULL");
    if ($sres) {
        while ($srow = $sres->fetchArray(SQLITE3_ASSOC)) {
            $topicByUuid[$srow['uuid']] = max(0, (int)$srow['topic_count']);
        }
    }

    $eres = $db->query("SELECT uuid, COUNT(DISTINCT DATE(created_at)) AS days FROM events WHERE uuid IS NOT NULL AND uuid != '' GROUP BY uuid");
    if ($eres) {
        while ($erow = $eres->fetchArray(SQLITE3_ASSOC)) {
            $days = (int)$erow['days'];
            if ($days <= 0) continue;
            $usersWithSessions++;
            $tc = isset($topicByUuid[$erow['uuid']]) ? $topicByUuid[$erow['uuid']] : null;
            if ($days === 1) {
                $sessionDist['one']++;
                if ($tc !== null) { $singleSum += $tc; $singleN++; }
            } elseif ($days === 2) {
                $sessionDist['two']++;
                if ($tc !== null) { $multiSum += $tc; $multiN++; }
            } elseif ($days === 3) {
                $sessionDist['three']++;
                if ($tc !== null) { $multiSum += $tc; $multiN++; }
            } else {
                $sessionDist['four_plus']++;
                if ($tc !== null) { $multiSum += $tc; $multiN++; }
            }
        }
    }
}

$db->close();

echo json_encode([
    'ok' => true,
    'enough_data' => true,
    'total_surveys' => $totalSurveys,
    'completion' => [
        'bins' => $bins,
        'bin_labels' => $binLabels,
        'num_bins' => $NUM_BINS,
        'topic_total' => $TOPIC_TOTAL,
        'binned_surveys' => $binned,
        'avg_topics' => $topicN > 0 ? round($topicSum / $topicN, 1) : 0,
    ],
    'sessions' => [
        'one' => $sessionDist['one'],
        'two' => $sessionDist['two'],
        'three' => $sessionDist['three'],
        'four_plus' => $sessionDist['four_plus'],
        'total_users' => $usersWithSessions,
        'avg_topics_single_session' => $singleN > 0 ? round($singleSum / $singleN, 1) : 0,
        'avg_topics_multi_session' => $multiN > 0 ? round($multiSum / $multiN, 1) : 0,
    ],
]);
