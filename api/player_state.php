<?php
require_once __DIR__ . '/bootstrap.php';

$pdo = db();
$playerId = $_GET['player_id'] ?? '';
if (!is_string($playerId) || $playerId === '') {
    respond(['ok' => false, 'error' => 'player_id is required'], 422);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT player_id, pos_x, pos_y, pos_z, rot_y FROM player_states WHERE player_id = :player_id LIMIT 1');
    $stmt->execute(['player_id' => $playerId]);
    $row = $stmt->fetch();

    if (!$row) {
        respond(['ok' => true, 'state' => null]);
    }

    respond(['ok' => true, 'state' => $row]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_input();

    $posX = (float)($input['pos_x'] ?? 0.0);
    $posY = (float)($input['pos_y'] ?? 1.2);
    $posZ = (float)($input['pos_z'] ?? 0.0);
    $rotY = (float)($input['rot_y'] ?? 0.0);

    $stmt = $pdo->prepare(
        'INSERT INTO player_states (player_id, pos_x, pos_y, pos_z, rot_y)
         VALUES (:player_id, :pos_x, :pos_y, :pos_z, :rot_y)
         ON DUPLICATE KEY UPDATE pos_x = VALUES(pos_x), pos_y = VALUES(pos_y), pos_z = VALUES(pos_z), rot_y = VALUES(rot_y), updated_at = CURRENT_TIMESTAMP'
    );

    $stmt->execute([
        'player_id' => $playerId,
        'pos_x' => $posX,
        'pos_y' => $posY,
        'pos_z' => $posZ,
        'rot_y' => $rotY,
    ]);

    respond(['ok' => true]);
}

respond(['ok' => false, 'error' => 'method not allowed'], 405);
