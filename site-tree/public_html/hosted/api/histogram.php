<?php
/**
 * Sexcapades community ratings histogram endpoint
 * GET ?topic=<topic-id> — returns histogram bins for a topic's ratings
 * Minimum 20 ratings before data is shown (privacy threshold)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$MIN_RATINGS = 20;
$NUM_BINS = 12; // bins across -100 to +100
$BIN_WIDTH = 200 / $NUM_BINS;

// SQLite DB lives OUTSIDE public_html (same location collect.php writes to).
// collect.php path: ~/domains/sexcapades-data/sexcapades_data.db — four dirnames
// up from .../public_html/hosted/api lands on the domains dir.
$dataDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/sexcapades-data';
$dbPath = $dataDir . '/sexcapades_data.db';
if (!file_exists($dbPath)) {
    echo json_encode(['ok' => false, 'error' => 'no data yet', 'count' => 0]);
    exit;
}

$topic = $_GET['topic'] ?? '';
if (!$topic || strlen($topic) > 200) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'missing topic']);
    exit;
}

try {
    $db = new SQLite3($dbPath, SQLITE3_OPEN_READONLY);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'db unavailable', 'count' => 0]);
    exit;
}

// Collect all ratings for this topic across surveys
// Ratings stored as JSON: {"topic-id": {"give": N, "receive": N}, ...} or {"topic-id": N}
$bins = array_fill(0, $NUM_BINS, 0);
$total = 0;

$result = $db->query("SELECT ratings FROM surveys WHERE ratings IS NOT NULL AND ratings != ''");
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $ratings = json_decode($row['ratings'], true);
    if (!is_array($ratings) || !isset($ratings[$topic])) continue;
    
    $r = $ratings[$topic];
    // Handle both {give, receive} objects and plain numbers
    $values = [];
    if (is_array($r)) {
        if (isset($r['give'])) $values[] = (float)$r['give'];
        if (isset($r['receive'])) $values[] = (float)$r['receive'];
    } elseif (is_numeric($r)) {
        $values[] = (float)$r;
    }
    
    foreach ($values as $v) {
        $v = max(-100, min(100, $v));
        $bin = (int)floor(($v + 100) / $BIN_WIDTH);
        if ($bin >= $NUM_BINS) $bin = $NUM_BINS - 1;
        if ($bin < 0) $bin = 0;
        $bins[$bin]++;
        $total++;
    }
}
$db->close();

/**
 * Wilson score 95% confidence interval half-width.
 * Returns [centre_pct, half_width_pct].
 */
function wilson_ci($successes, $n, $z = 1.96) {
    if ($n <= 0) return [0.0, 0.0];
    $p = $successes / $n;
    $z2 = $z * $z;
    $denominator = 1 + $z2 / $n;
    $centre = ($p + $z2 / (2 * $n)) / $denominator;
    $half = $z * sqrt($p * (1 - $p) / $n + $z2 / (4 * $n * $n)) / $denominator;
    return [round($centre * 100, 1), round($half * 100, 1)];
}

// --- Marker aggregation ---
// Marks stored as JSON per survey: {"topic-id": "favorite"} or {"topic-id": ["favorite","fantasyonly"]}
$MARKER_TYPES = ['favorite', 'limit', 'notinterested', 'fantasyonly', 'alreadytried'];
$markersOut = null;

// Reopen for marker pass (need marks column; tolerate its absence on old DBs)
try {
    $db2 = new SQLite3($dbPath, SQLITE3_OPEN_READONLY);
} catch (Exception $e) {
    $db2 = null;
}
if ($db2) {
    $hasMarksCol = false;
    $cols = $db2->query("PRAGMA table_info(surveys)");
    if ($cols) {
        while ($col = $cols->fetchArray(SQLITE3_ASSOC)) {
            if ($col['name'] === 'marks') { $hasMarksCol = true; break; }
        }
    }
    if ($hasMarksCol) {
        $totalSurveys = (int)$db2->querySingle("SELECT COUNT(*) FROM surveys");
        if ($totalSurveys >= $MIN_RATINGS) {
            $counts = array_fill_keys($MARKER_TYPES, 0);
            $mres = $db2->query("SELECT marks FROM surveys WHERE marks IS NOT NULL AND marks != '' AND marks != '{}'");
            if ($mres) {
                while ($mrow = $mres->fetchArray(SQLITE3_ASSOC)) {
                    $mm = json_decode($mrow['marks'], true);
                    if (!is_array($mm) || !isset($mm[$topic])) continue;
                    $v = $mm[$topic];
                    $list = is_array($v) ? $v : [$v];
                    foreach ($list as $mk) {
                        if (in_array($mk, $MARKER_TYPES, true)) $counts[$mk]++;
                    }
                }
            }
            $markersOut = [];
            foreach ($MARKER_TYPES as $mt) {
                list($pct, $ci) = wilson_ci($counts[$mt], $totalSurveys);
                $markersOut[$mt] = ['pct' => $pct, 'ci' => $ci, 'n' => $counts[$mt]];
            }
            $markersOut['_surveys'] = $totalSurveys;
        }
    }
    $db2->close();
}

if ($total < $MIN_RATINGS) {
    $resp = ['ok' => true, 'enough_data' => false, 'count' => $total, 'min_required' => $MIN_RATINGS];
    if ($markersOut !== null) $resp['markers'] = $markersOut;
    echo json_encode($resp);
    exit;
}

// Build bin labels
$binLabels = [];
for ($i = 0; $i < $NUM_BINS; $i++) {
    $lo = -100 + $i * $BIN_WIDTH;
    $hi = $lo + $BIN_WIDTH;
    $binLabels[] = round($lo) . ' to ' . round($hi);
}

echo json_encode([
    'ok' => true,
    'enough_data' => true,
    'count' => $total,
    'bins' => $bins,
    'bin_labels' => $binLabels,
    'num_bins' => $NUM_BINS,
    'markers' => $markersOut,
]);
