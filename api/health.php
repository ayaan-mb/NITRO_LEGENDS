<?php
require_once __DIR__ . '/bootstrap.php';

try {
    db()->query('SELECT 1');
    respond(['ok' => true, 'service' => 'nitro-legends-api']);
} catch (Throwable $e) {
    respond(['ok' => false, 'error' => $e->getMessage()], 500);
}
