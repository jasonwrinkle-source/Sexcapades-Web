<?php
/**
 * Sexcapades anonymous data collection endpoint
 * 
 * Handles:
 * 1. Survey upserts: POST action=survey, uuid, ratings, app_version, app_build
 * 2. Funnel events: POST action=event, uuid, event_type, utm_source
 * 
 * Privacy: No IP logging, no PII, no fingerprinting. UUID is random per-browser.
 * SQLite upsert: repeat submissions update the same record.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://sexcapades.io');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// get_stats is read-only — allow GET. All write actions require POST.
$isGetStats = ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'get_stats');
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && !$isGetStats) {
    http_response_code(405);
    echo json_encode(['error' => 'POST only (GET allowed for action=get_stats)']);
    exit;
}

// SQLite DB (auto-created) — stored OUTSIDE public_html so deploys don't overwrite it
// Path: ~/domains/sexcapades-data/sexcapades_data.db (sibling of sexcapades.io, not inside it)
$dataDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/sexcapades-data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}
$dbPath = $dataDir . '/sexcapades_data.db';
$db = new SQLite3($dbPath);

// Create tables if not exist
$db->exec('CREATE TABLE IF NOT EXISTS surveys (
    uuid TEXT PRIMARY KEY,
    profile_uuid TEXT,
    ratings TEXT,
    app_version TEXT,
    app_build TEXT,
    topic_count INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

$db->exec('CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT,
    event_type TEXT,
    utm_source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

$db->exec('CREATE TABLE IF NOT EXISTS unmapped_fetishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fetish_name TEXT NOT NULL,
    list_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');
$db->exec('CREATE INDEX IF NOT EXISTS idx_unmapped_name ON unmapped_fetishes(fetish_name)');

// Migration: add elapsed_seconds + topic_count columns to events if missing (2026-10-12)
$eventCols = [];
$ecols = $db->query("PRAGMA table_info(events)");
while ($ecol = $ecols->fetchArray(SQLITE3_ASSOC)) {
    $eventCols[] = $ecol['name'];
}
if (!in_array('elapsed_seconds', $eventCols, true)) {
    $db->exec('ALTER TABLE events ADD COLUMN elapsed_seconds INTEGER');
}
if (!in_array('topic_count', $eventCols, true)) {
    $db->exec('ALTER TABLE events ADD COLUMN topic_count INTEGER');
}

// Migration: add profile_uuid to surveys for per-profile analytics (Jason 2026-10-14)
// Multiple profiles on the same device/browser share the browser UUID; profile_uuid
// distinguishes them so one profile's survey doesn't overwrite another's.
$surveyCols = [];
$scols = $db->query("PRAGMA table_info(surveys)");
while ($scol = $scols->fetchArray(SQLITE3_ASSOC)) {
    $surveyCols[] = $scol['name'];
}
if (!in_array('profile_uuid', $surveyCols, true)) {
    $db->exec('ALTER TABLE surveys ADD COLUMN profile_uuid TEXT');
    // Unique index so upserts can key on profile_uuid when provided
    $db->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_surveys_profile_uuid ON surveys(profile_uuid) WHERE profile_uuid IS NOT NULL AND profile_uuid != ""');
}
// Migration: add app_build to surveys so stats can break down by build number
if (!in_array('app_build', $surveyCols, true)) {
    $db->exec('ALTER TABLE surveys ADD COLUMN app_build TEXT');
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}
// For GET requests (get_stats), action comes from query string
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $input = $_GET;
}

$action = $input['action'] ?? '';
$uuid = $input['uuid'] ?? '';

// UUID validation only for actions that write data (survey, event)
// get_stats is read-only and doesn't need a UUID
if ($action !== 'get_stats') {
    // Validate UUID (must be non-empty, max 64 chars, alphanumeric + hyphens)
    if (!preg_match('/^[a-zA-Z0-9-]{1,64}$/', $uuid)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid UUID']);
        exit;
    }
}

if ($action === 'survey') {
    // Upsert survey ratings
    // Per-profile UUID (Jason 2026-10-14): if provided, key the upsert on profile_uuid
    // so multiple profiles on the same device don't overwrite each other.
    $ratings = $input['ratings'] ?? '';
    $appVersion = $input['app_version'] ?? '';
    $appBuild = substr($input['app_build'] ?? '', 0, 32);
    $topicCount = intval($input['topic_count'] ?? 0);
    $profileUuid = $input['profile_uuid'] ?? '';

    // Validate profile_uuid if provided
    if ($profileUuid !== '' && !preg_match('/^[a-zA-Z0-9-]{1,64}$/', $profileUuid)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid profile UUID']);
        exit;
    }
    
    // Limit ratings size (prevent abuse)
    if (strlen($ratings) > 50000) {
        http_response_code(400);
        echo json_encode(['error' => 'Ratings too large']);
        exit;
    }
    
    $stmt = $db->prepare('INSERT INTO surveys (uuid, profile_uuid, ratings, app_version, app_build, topic_count, updated_at)
        VALUES (:uuid, :profile_uuid, :ratings, :app_version, :app_build, :topic_count, CURRENT_TIMESTAMP)
        ON CONFLICT(uuid) DO UPDATE SET
            profile_uuid = :profile_uuid,
            ratings = :ratings,
            app_version = :app_version,
            app_build = :app_build,
            topic_count = :topic_count,
            updated_at = CURRENT_TIMESTAMP');
    $stmt->bindValue(':uuid', $uuid, SQLITE3_TEXT);
    $stmt->bindValue(':profile_uuid', $profileUuid, SQLITE3_TEXT);
    $stmt->bindValue(':ratings', $ratings, SQLITE3_TEXT);
    $stmt->bindValue(':app_version', $appVersion, SQLITE3_TEXT);
    $stmt->bindValue(':app_build', $appBuild, SQLITE3_TEXT);
    $stmt->bindValue(':topic_count', $topicCount, SQLITE3_INTEGER);
    $stmt->execute();

    // If profile_uuid was provided, also upsert a profile_uuid-keyed row so that
    // multiple profiles on the same browser UUID don't overwrite each other.
    // The browser-UUID row above preserves backward compatibility for get_stats.
    if ($profileUuid !== '') {
        $pstmt = $db->prepare('INSERT INTO surveys (uuid, profile_uuid, ratings, app_version, app_build, topic_count, updated_at)
            VALUES (:pkey, :profile_uuid, :ratings, :app_version, :app_build, :topic_count, CURRENT_TIMESTAMP)
            ON CONFLICT(profile_uuid) DO UPDATE SET
                uuid = :uuid,
                ratings = :ratings,
                app_version = :app_version,
                app_build = :app_build,
                topic_count = :topic_count,
                updated_at = CURRENT_TIMESTAMP
            WHERE profile_uuid = :pkey');
        // Note: SQLite UPSERT with partial index needs the WHERE clause to match.
        // Fallback: delete + insert if the upsert doesn't apply cleanly.
        $pstmt->bindValue(':pkey', $profileUuid, SQLITE3_TEXT);
        $pstmt->bindValue(':profile_uuid', $profileUuid, SQLITE3_TEXT);
        $pstmt->bindValue(':uuid', $uuid, SQLITE3_TEXT);
        $pstmt->bindValue(':ratings', $ratings, SQLITE3_TEXT);
        $pstmt->bindValue(':app_version', $appVersion, SQLITE3_TEXT);
        $pstmt->bindValue(':app_build', $appBuild, SQLITE3_TEXT);
        $pstmt->bindValue(':topic_count', $topicCount, SQLITE3_INTEGER);
        try {
            $pstmt->execute();
        } catch (Exception $e) {
            // Fallback for older SQLite without partial-index upsert: delete + insert
            $db->exec("DELETE FROM surveys WHERE profile_uuid = '" . SQLite3::escapeString($profileUuid) . "'");
            $istmt = $db->prepare('INSERT INTO surveys (uuid, profile_uuid, ratings, app_version, app_build, topic_count, updated_at)
                VALUES (:uuid, :profile_uuid, :ratings, :app_version, :app_build, :topic_count, CURRENT_TIMESTAMP)');
            $istmt->bindValue(':uuid', $uuid, SQLITE3_TEXT);
            $istmt->bindValue(':profile_uuid', $profileUuid, SQLITE3_TEXT);
            $istmt->bindValue(':ratings', $ratings, SQLITE3_TEXT);
            $istmt->bindValue(':app_version', $appVersion, SQLITE3_TEXT);
            $istmt->bindValue(':app_build', $appBuild, SQLITE3_TEXT);
            $istmt->bindValue(':topic_count', $topicCount, SQLITE3_INTEGER);
            $istmt->execute();
        }
    }

    echo json_encode(['ok' => true, 'action' => 'survey_upserted']);
    
} elseif ($action === 'event') {
    // Log funnel event
    $eventType = $input['event_type'] ?? '';
    $utmSource = $input['utm_source'] ?? '';
    
    // Validate event type (whitelist)
    $allowedEvents = ['quickstart_started', 'quickstart_completed', 'qr_sheet_shared', 'gate_passed', 'scan_started', 'session_stats'];
    if (!in_array($eventType, $allowedEvents)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid event type']);
        exit;
    }
    
    // Sanitize UTM (max 128 chars)
    $utmSource = substr($utmSource, 0, 128);

    // Optional session stats payload (topic_count, elapsed_seconds)
    $elapsedSeconds = isset($input['elapsed_seconds']) ? max(0, intval($input['elapsed_seconds'])) : null;
    $statTopicCount = isset($input['topic_count']) ? max(0, intval($input['topic_count'])) : null;
    
    $stmt = $db->prepare('INSERT INTO events (uuid, event_type, utm_source, elapsed_seconds, topic_count) VALUES (:uuid, :event_type, :utm_source, :elapsed_seconds, :topic_count)');
    $stmt->bindValue(':uuid', $uuid, SQLITE3_TEXT);
    $stmt->bindValue(':event_type', $eventType, SQLITE3_TEXT);
    $stmt->bindValue(':utm_source', $utmSource, SQLITE3_TEXT);
    $stmt->bindValue(':elapsed_seconds', $elapsedSeconds, $elapsedSeconds === null ? SQLITE3_NULL : SQLITE3_INTEGER);
    $stmt->bindValue(':topic_count', $statTopicCount, $statTopicCount === null ? SQLITE3_NULL : SQLITE3_INTEGER);
    $stmt->execute();
    
    echo json_encode(['ok' => true, 'action' => 'event_logged']);
    
} elseif ($action === 'unmapped') {
    // Anonymous unmapped fetish name collection for importer mapping improvement
    // Expects: fetishes = array of {name, list_type} (already decoded from JSON body)
    $fetishes = $input['fetishes'] ?? [];
    if (!is_array($fetishes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid fetishes payload']);
        exit;
    }
    $stmt = $db->prepare('INSERT INTO unmapped_fetishes (fetish_name, list_type) VALUES (:name, :list_type)');
    $count = 0;
    foreach ($fetishes as $f) {
        $name = trim($f['name'] ?? '');
        $listType = $f['list_type'] ?? '';
        if ($name === '' || !in_array($listType, ['into', 'curious'])) continue;
        if (mb_strlen($name) > 200) $name = mb_substr($name, 0, 200);
        $stmt->bindValue(':name', $name, SQLITE3_TEXT);
        $stmt->bindValue(':list_type', $listType, SQLITE3_TEXT);
        $stmt->execute();
        $count++;
    }
    echo json_encode(['ok' => true, 'action' => 'unmapped_logged', 'count' => $count]);

} elseif ($action === 'get_stats') {
    // Public visitor count for odometer display (no PII, just aggregates)
    // Fleet traffic is EXCLUDED from the public count: the QA fleet (browser
    // squads + Playwright) loads the app with ?utm_source=fleet, and those
    // events are tagged, not counted. Collection itself is unchanged
    // (analytics law) — only the displayed count excludes them. The 'fleet%'
    // pattern also covers 'fleet-playwright' / 'fleet-squad' if used later.
    $notFleet = "utm_source IS NULL OR utm_source NOT LIKE 'fleet%'";
    $uniqueVisitors = $db->querySingle("SELECT COUNT(DISTINCT uuid) FROM events WHERE $notFleet");
    $gatePasses = $db->querySingle("SELECT COUNT(*) FROM events WHERE event_type = 'gate_passed' AND ($notFleet)");
    $qsStarts = $db->querySingle("SELECT COUNT(*) FROM events WHERE event_type = 'quickstart_started' AND ($notFleet)");
    $qsCompletes = $db->querySingle("SELECT COUNT(*) FROM events WHERE event_type = 'quickstart_completed' AND ($notFleet)");
    
    echo json_encode([
        'ok' => true,
        'unique_visitors' => (int)$uniqueVisitors,
        'gate_passed' => (int)$gatePasses,
        'quickstart_started' => (int)$qsStarts,
        'quickstart_completed' => (int)$qsCompletes
    ]);
    
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action. Use action=survey, action=event, action=unmapped, or action=get_stats']);
}

$db->close();
