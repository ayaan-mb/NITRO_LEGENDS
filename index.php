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
      <p>W/S: accelerate & brake • A/D: steer • R: reset • P: save spawn</p>
      <p id="status">Connecting...</p>
    </div>
    <script>
      window.NITRO_CONFIG = {
        apiBase: './api',
        defaultPlayer: 'guest-driver'
      };
    </script>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
