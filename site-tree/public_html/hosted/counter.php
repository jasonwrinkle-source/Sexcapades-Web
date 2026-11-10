<?php
// Privacy-safe unique visitor counter for Sexcapades
// Tracks by client-generated UUID only — NO IP addresses stored.
// The client generates a UUID in localStorage on first visit and sends it here.
//
// Hardened 2026-10-09:
//  - POST only (GET rejected with 405)
//  - Same-origin check: Origin/Referer must be sexcapades.io
//  - No wildcard CORS (same-origin requests don't need it)
//  - Global write throttle: max one file write per second
//  - Atomic writes via temp file + rename
header('Content-Type: application/json');

// POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

// Same-origin check: must come from sexcapades.io
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$host = parse_url($origin, PHP_URL_HOST);
if ($host !== 'sexcapades.io' && $host !== 'www.sexcapades.io') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$dataFile = __DIR__ . '/counter_uuid_data.txt';
$throttleFile = __DIR__ . '/counter_throttle.txt';

// Global write throttle: at most one write per second (stops write floods)
$now = microtime(true);
$lastWrite = 0;
if (file_exists($throttleFile)) {
    $lastWrite = (float) file_get_contents($throttleFile);
}
$throttled = ($now - $lastWrite) < 1.0;

// Get UUID from POST body only
$uuid = $_POST['uuid'] ?? null;

// Validate UUID format (8-4-4-4-12 hex or 32 hex chars)
if ($uuid && !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {
    if (!preg_match('/^[0-9a-f]{32}$/i', $uuid)) {
        $uuid = null;
    }
}

// Load existing UUIDs
$visitors = [];
if (file_exists($dataFile)) {
    $visitors = array_filter(explode("\n", file_get_contents($dataFile)));
}

// Add new UUID if valid, not already counted, and not throttled
if ($uuid && !in_array($uuid, $visitors, true) && !$throttled) {
    $visitors[] = $uuid;
    // Atomic write: temp file + rename
    $tmp = $dataFile . '.tmp.' . getmypid();
    file_put_contents($tmp, implode("\n", $visitors) . "\n", LOCK_EX);
    rename($tmp, $dataFile);
    file_put_contents($throttleFile, (string) $now, LOCK_EX);
}

$count = count($visitors);

echo json_encode(['visitors' => $count]);
