# Nitro Legends - Hostinger PHP + MariaDB Foundation

Rebuilt city foundation with proper urban planning and object alignment.

## Included now

- Structured road hierarchy (major + minor roads) aligned to city blocks.
- Sidewalks on road edges and green medians on major corridors.
- Object-safe placement: buildings, trees, lights, and props avoid road footprints.
- Realistic districts: downtown, residential, commercial, industrial, beach, airport, mountain ring, stunt, and off-road zones.
- Intersections with crosswalks, traffic lights, street lights, and lane center markings.
- Upgraded rendering: ACES tone mapping, shadow tuning, bloom post-processing.
- Car, third-person camera, and MariaDB spawn persistence retained.

## Hostinger deploy

1. Upload this project to `public_html`.
2. Create MariaDB database/user in hPanel.
3. Import `sql/schema.sql`.
4. Configure env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.
5. Open domain root (`index.php`).

## Controls

- W / S: accelerate / brake
- A / D: steer
- R: reset to spawn
- P: save position to DB
