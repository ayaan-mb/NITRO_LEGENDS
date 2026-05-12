<?php
require_once __DIR__ . '/config/app.php';
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= htmlspecialchars(APP_NAME) ?></title>
    <link rel="stylesheet" href="./src/styles/main.css" />
  </head>
  <body>
    <div id="hud">
      <h1><?= htmlspecialchars(APP_NAME) ?></h1>
      <p>W/S drive • A/D steer • Space drift • N nitro • E enter/exit • Shift run</p>
      <p id="status">Starting...</p>
    </div>
    <script type="module" src="./src/main.js"></script>
      <canvas id="minimap" width="220" height="220" aria-label="City minimap"></canvas>
  </body>
</html>
