# Nitro Legends - Hostinger PHP + MariaDB Foundation

This project is a deployable **custom PHP + HTML + JS** foundation for a scalable open-world driving game.

## What is included

- Open-world city-style map foundation (roads, blocks, zones, greenery, beach, airport, off-road, stunt, hills).
- Basic drivable player car (W/A/S/D, R reset).
- Third-person follow camera.
- Environment setup (lighting, fog/sky).
- PHP API endpoints for MariaDB persistence of player spawn/state.
- SQL schema for Hostinger MariaDB/MySQL.

## Folder structure

- `index.php` – app entry page
- `config/` – app + DB config
- `api/` – PHP API endpoints
- `sql/schema.sql` – MariaDB schema
- `src/` – game client modules

## Hostinger deployment steps

1. Upload all files to `public_html`.
2. Create a MariaDB database from Hostinger hPanel.
3. Import `sql/schema.sql`.
4. Set environment variables in Hostinger:
   - `DB_HOST`
   - `DB_PORT` (usually `3306`)
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASS`
5. Open your domain.

## API endpoints

- `GET /api/health.php`
- `GET /api/player_state.php?player_id=guest-driver`
- `POST /api/player_state.php?player_id=guest-driver`

Press **P** during gameplay to save player spawn to MariaDB.
